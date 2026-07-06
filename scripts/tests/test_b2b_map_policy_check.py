#!/usr/bin/env python3
"""
test_b2b_map_policy_check.py — TDD tests for Move #14.5 B2B-MAP-policy check.

Architecture: standalone `main_test()` runner per the canonical pattern from
every per-platform attribution audit (Move #6.5/6.6/6.7 + rollup Move #6.8
+ Move #6.10 attribution-health alert webhook).

20 test classes covering:
  1.  Threshold constants pinned (regression gate #1)
  2.  Alert shape constants pinned (regression gate #2)
  3.  Pillar-4 levers constants pinned (regression gate #3)
  4.  URL validation
  5.  State JSON loading — happy path
  6.  State JSON loading — missing file fallback
  7.  State JSON loading — malformed JSON fallback
  8.  Decision: all Pillar-4 levers active + cannibalization within band → no alert
  9.  Decision: 1+ Pillar-4 lever missing → alert fires (Rule 1)
 10.  Decision: 3-strike enforcement not active while MAP-page IS published → alert fires (Rule 2)
 11.  Decision: DTC cannibalization exceeds threshold → alert fires (Rule 3)
 12.  Decision: 3rd-violation terminations exceed threshold → alert fires (Rule 4)
 13.  Decision: wholesale channel inactive → no alert (gate skipped)
 14.  Alert payload shape: top-level fields all present
 15.  Alert payload per-lever breakdown + canonical/optional categorization
 16.  Cooldown logic
 17.  Archive file is written
 18.  --json output is valid JSON
 19.  --validate-thresholds mode returns 0 + prints regression-gate output
 20.  --bootstrap mode creates directory
 21.  CLI smoke: --help exits 0
 22.  Subprocess roundtrip: --json on a real state JSON
 23.  --skip-webhook prevents POST but still archives
"""

import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# Make the production script importable.
sys.path.insert(0, str(Path(__file__).parent.parent))
import b2b_map_policy_check as mapcheck_mod


# -----------------------------------------------------------------------------
# Test fixtures
# -----------------------------------------------------------------------------


def _make_state(
    *,
    brand_id: str = "test-brand-001",
    wholesale_channel_active: bool = True,
    wholesale_sku_count: int = 25,
    wholesale_arpu_ratio_vs_dtc: float = 0.75,
    dtc_cannibalization_pct: float = 12.0,
    levers: dict | None = None,
    map_violations_last_30d: int = 5,
    first_violation_warnings_last_30d: int = 5,
    second_violation_suspensions_last_30d: int = 2,
    third_violation_terminations_last_30d: int = 0,
) -> dict:
    """Build a canonical happy-path B2B-MAP-policy state JSON dict."""
    if levers is None:
        levers = {
            "map_policy_page_published": True,
            "three_strike_enforcement_active": True,
            "geographic_exclusivity_top_20": True,
            "city_level_exclusivity_top_5": True,
            "channel_exclusivity_tier": True,
            "shopify_b2b_handshake_geographic_exclusion": True,
            "map_policy_enforcement_tooling": True,
            "arpu_cannibalization_monitoring": True,
        }
    return {
        "brand_id": brand_id,
        "captured_at": "2026-07-10T12:00:00Z",
        "wholesale_channel_active": wholesale_channel_active,
        "wholesale_sku_count": wholesale_sku_count,
        "wholesale_arpu_ratio_vs_dtc": wholesale_arpu_ratio_vs_dtc,
        "dtc_cannibalization_pct": dtc_cannibalization_pct,
        "levers": levers,
        "map_violations_last_30d": map_violations_last_30d,
        "first_violation_warnings_last_30d": first_violation_warnings_last_30d,
        "second_violation_suspensions_last_30d": second_violation_suspensions_last_30d,
        "third_violation_terminations_last_30d": third_violation_terminations_last_30d,
        "overall_passed": True,
    }


def _write_state_file(tmpdir: Path, state: dict) -> Path:
    """Write a state dict to a temp JSON file and return the path."""
    state_path = tmpdir / "b2b_map_policy_state.json"
    state_path.write_text(json.dumps(state, indent=2))
    return state_path


# -----------------------------------------------------------------------------
# Regression gate #1 — Threshold constants pinned
# -----------------------------------------------------------------------------


class TestThresholdConstantsPinned(unittest.TestCase):
    """REGRESSION GATE #1 — canonical MAP-policy thresholds MUST NOT silently change."""

    def test_thresholds_returns_independent_copy(self):
        """`_canonical_thresholds_published()` returns a dict that mutations do not affect canonical state."""
        t1 = mapcheck_mod._canonical_thresholds_published()
        t1["fire_on_dtc_cannibalization_pct"] = 999.0
        t2 = mapcheck_mod._canonical_thresholds_published()
        self.assertEqual(t2["fire_on_dtc_cannibalization_pct"], 25.0)

    def test_thresholds_required_keys_present(self):
        """All 5 required threshold keys are present in the canonical thresholds."""
        t = mapcheck_mod._canonical_thresholds_published()
        self.assertIn("fire_on_any_pillar_4_lever_missing", t)
        self.assertIn("fire_on_no_3_strike_enforcement", t)
        self.assertIn("fire_on_dtc_cannibalization_pct", t)
        self.assertIn("fire_on_3rd_violation_terminations_30d", t)
        self.assertIn("cooldown_seconds", t)

    def test_thresholds_value_contract(self):
        """Each threshold has the expected type + canonical baseline value."""
        t = mapcheck_mod._canonical_thresholds_published()
        self.assertIs(t["fire_on_any_pillar_4_lever_missing"], True)
        self.assertIs(t["fire_on_no_3_strike_enforcement"], True)
        self.assertEqual(t["fire_on_dtc_cannibalization_pct"], 25.0)
        self.assertEqual(t["fire_on_3rd_violation_terminations_30d"], 2)
        self.assertEqual(t["cooldown_seconds"], 86400)  # 24-hour daily-cadence cooldown

    def test_thresholds_modulelevel_matches_published(self):
        """The module-level MAP_POLICY_THRESHOLDS dict is identical to the pinned regression gate."""
        self.assertEqual(
            mapcheck_mod.MAP_POLICY_THRESHOLDS,
            mapcheck_mod._canonical_thresholds_published(),
        )


# -----------------------------------------------------------------------------
# Regression gate #2 — Alert shape constants pinned
# -----------------------------------------------------------------------------


class TestAlertShapePinned(unittest.TestCase):
    """REGRESSION GATE #2 — canonical alert payload shape MUST NOT silently change."""

    def test_alert_shape_returns_independent_copy(self):
        """`_canonical_alert_shape_published()` returns a list that mutations do not affect canonical state."""
        s1 = mapcheck_mod._canonical_alert_shape_published()
        s1.append("rogue_field")
        s2 = mapcheck_mod._canonical_alert_shape_published()
        self.assertNotIn("rogue_field", s2)

    def test_alert_shape_has_13_fields(self):
        """The canonical alert shape has exactly 13 top-level fields."""
        s = mapcheck_mod._canonical_alert_shape_published()
        self.assertEqual(len(s), 13)

    def test_alert_shape_required_fields_present(self):
        """All 13 canonical fields are present."""
        s = mapcheck_mod._canonical_alert_shape_published()
        required = [
            "alert_id", "timestamp", "source", "severity", "title",
            "summary", "lever_breakdown", "dtc_cannibalization_summary",
            "root_cause_hypothesis", "remediation", "overall_passed",
            "thresholds_used", "raw_state_path",
        ]
        for field in required:
            self.assertIn(field, s, f"Missing canonical field: {field}")

    def test_alert_shape_modulelevel_matches_published(self):
        """The module-level ALERT_PAYLOAD_TOP_LEVEL_FIELDS list is identical to the pinned regression gate."""
        self.assertEqual(
            mapcheck_mod.ALERT_PAYLOAD_TOP_LEVEL_FIELDS,
            mapcheck_mod._canonical_alert_shape_published(),
        )


# -----------------------------------------------------------------------------
# Regression gate #3 — Pillar-4 lever constants pinned
# -----------------------------------------------------------------------------


class TestPillar4LeversPinned(unittest.TestCase):
    """REGRESSION GATE #3 — canonical 5+3 Pillar-4 lever keys MUST NOT silently change."""

    def test_levers_returns_independent_copy(self):
        """`_canonical_levers_published()` returns a list that mutations do not affect canonical state."""
        l1 = mapcheck_mod._canonical_levers_published()
        l1.append("rogue_lever")
        l2 = mapcheck_mod._canonical_levers_published()
        self.assertNotIn("rogue_lever", l2)

    def test_levers_has_5_canonical_pillar_4(self):
        """The canonical 5 Pillar-4 levers are present (research/10 Pillar 4 baseline)."""
        levers = set(mapcheck_mod._canonical_levers_published())
        canonical = {
            "map_policy_page_published",
            "three_strike_enforcement_active",
            "geographic_exclusivity_top_20",
            "channel_exclusivity_tier",
            "map_policy_enforcement_tooling",
        }
        for lever in canonical:
            self.assertIn(lever, levers, f"Missing canonical Pillar-4 lever: {lever}")

    def test_levers_has_3_optional_pillar_4(self):
        """The canonical 3 optional Pillar-4 reinforcement levers are present."""
        levers = set(mapcheck_mod._canonical_levers_published())
        optional = {
            "city_level_exclusivity_top_5",
            "shopify_b2b_handshake_geographic_exclusion",
            "arpu_cannibalization_monitoring",
        }
        for lever in optional:
            self.assertIn(lever, levers, f"Missing optional Pillar-4 lever: {lever}")

    def test_lever_remediation_text_pinned_for_canonical_levers(self):
        """Each canonical Pillar-4 lever has a remediation text pinned (no generic fallbacks for canonical)."""
        for lever in mapcheck_mod.PILLAR_4_LEVERS:
            self.assertIn(
                lever,
                mapcheck_mod.LEVER_REMEDIATION,
                f"Missing remediation for canonical Pillar-4 lever: {lever}",
            )
            remediation = mapcheck_mod.LEVER_REMEDIATION[lever]
            self.assertGreater(len(remediation), 50, f"Remediation for {lever} is too short to be useful")


# -----------------------------------------------------------------------------
# URL validation
# -----------------------------------------------------------------------------


class TestIsHttpUrl(unittest.TestCase):
    """Verify the webhook URL filter accepts only http(s) URLs with non-empty netloc."""

    def test_accepts_https(self):
        self.assertTrue(mapcheck_mod._is_http_url("https://hooks.slack.com/services/T00000000/B00000000/XXX"))

    def test_accepts_http(self):
        self.assertTrue(mapcheck_mod._is_http_url("http://example.com/webhook"))

    def test_rejects_ftp_scheme(self):
        self.assertFalse(mapcheck_mod._is_http_url("ftp://example.com/webhook"))

    def test_rejects_empty_netloc(self):
        self.assertFalse(mapcheck_mod._is_http_url("https://"))

    def test_rejects_malformed(self):
        self.assertFalse(mapcheck_mod._is_http_url("not-a-url"))

    def test_rejects_empty(self):
        self.assertFalse(mapcheck_mod._is_http_url(""))


# -----------------------------------------------------------------------------
# State JSON loading — happy path
# -----------------------------------------------------------------------------


class TestLoadStateJsonHappyPath(unittest.TestCase):
    """Verify _load_state_json returns the state dict when the file is well-formed."""

    def test_returns_dict_with_required_keys(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = _make_state()
            state_path = _write_state_file(Path(tmp), state)
            result = mapcheck_mod._load_state_json(state_path)
            self.assertIsInstance(result, dict)
            self.assertIn("brand_id", result)
            self.assertIn("wholesale_channel_active", result)
            self.assertIn("levers", result)
            self.assertEqual(result["brand_id"], "test-brand-001")

    def test_levers_dict_normalized_to_canonical_8_keys(self):
        """Even if the source JSON has extra or missing lever keys, the loader normalizes to 8 keys."""
        with tempfile.TemporaryDirectory() as tmp:
            state = _make_state(levers={
                "map_policy_page_published": True,
                "rogue_extra_lever": True,  # should be dropped
                # three_strike_enforcement_active etc. missing → default False
            })
            state_path = _write_state_file(Path(tmp), state)
            result = mapcheck_mod._load_state_json(state_path)
            levers = result["levers"]
            self.assertEqual(len(levers), 8)
            self.assertTrue(levers["map_policy_page_published"])
            self.assertFalse(levers["three_strike_enforcement_active"])
            self.assertNotIn("rogue_extra_lever", levers)


# -----------------------------------------------------------------------------
# State JSON loading — missing file fallback
# -----------------------------------------------------------------------------


class TestLoadStateJsonMissingFile(unittest.TestCase):
    """Verify _load_state_json returns the sentinel dict when the file is missing."""

    def test_missing_file_returns_sentinel(self):
        with tempfile.TemporaryDirectory() as tmp:
            missing_path = Path(tmp) / "does_not_exist.json"
            result = mapcheck_mod._load_state_json(missing_path)
            self.assertIn("error", result)
            self.assertIn("MISSING", result["error"])
            self.assertEqual(result["overall_passed"], False)
            self.assertEqual(result["wholesale_channel_active"], False)
            # All 8 levers default to False in the sentinel.
            self.assertEqual(len(result["levers"]), 8)
            for v in result["levers"].values():
                self.assertFalse(v)


# -----------------------------------------------------------------------------
# State JSON loading — malformed JSON fallback
# -----------------------------------------------------------------------------


class TestLoadStateJsonMalformed(unittest.TestCase):
    """Verify _load_state_json returns the sentinel dict when the file is malformed."""

    def test_invalid_json_returns_sentinel(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "bad.json"
            state_path.write_text("NOT VALID JSON {")
            result = mapcheck_mod._load_state_json(state_path)
            self.assertIn("error", result)
            self.assertIn("DECODE FAILED", result["error"])
            self.assertEqual(result["overall_passed"], False)

    def test_non_dict_json_returns_sentinel(self):
        """A JSON array (not a dict) returns the sentinel."""
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "list.json"
            state_path.write_text(json.dumps([1, 2, 3]))
            result = mapcheck_mod._load_state_json(state_path)
            self.assertIn("error", result)
            self.assertIn("NOT A DICT", result["error"])
            self.assertEqual(result["overall_passed"], False)


# -----------------------------------------------------------------------------
# Decision: all gates pass → no alert
# -----------------------------------------------------------------------------


class TestDecisionAllGatesPass(unittest.TestCase):
    """All Pillar-4 levers active + cannibalization within band → no alert fires."""

    def test_healthy_state_no_alert(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        state = _make_state(dtc_cannibalization_pct=10.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertFalse(should_fire)
        self.assertIn("all Pillar-4 levers active", reason)


# -----------------------------------------------------------------------------
# Decision: 1+ Pillar-4 lever missing → alert fires (Rule 1)
# -----------------------------------------------------------------------------


class TestDecisionMissingLever(unittest.TestCase):
    """When wholesale is active AND any canonical Pillar-4 lever is missing → fire."""

    def test_single_lever_missing_fires(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        levers = {
            "map_policy_page_published": True,
            "three_strike_enforcement_active": True,
            "geographic_exclusivity_top_20": True,
            "city_level_exclusivity_top_5": True,
            "channel_exclusivity_tier": True,
            "shopify_b2b_handshake_geographic_exclusion": True,
            "map_policy_enforcement_tooling": True,
            "arpu_cannibalization_monitoring": True,
        }
        levers["map_policy_page_published"] = False  # single canonical missing
        state = _make_state(levers=levers)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("Pillar-4", reason)
        self.assertIn("map_policy_page_published", reason)

    def test_multiple_levers_missing_fires_with_count(self):
        """Multiple missing levers fire with the canonical 'N of 5' count phrasing."""
        thresholds = mapcheck_mod._canonical_thresholds_published()
        levers = {
            "map_policy_page_published": False,
            "three_strike_enforcement_active": False,
            "geographic_exclusivity_top_20": False,
            "city_level_exclusivity_top_5": True,
            "channel_exclusivity_tier": True,
            "shopify_b2b_handshake_geographic_exclusion": True,
            "map_policy_enforcement_tooling": True,
            "arpu_cannibalization_monitoring": True,
        }
        state = _make_state(levers=levers)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("3 of 5", reason)


# -----------------------------------------------------------------------------
# Decision: 3-strike enforcement not active while MAP-page IS published → alert (Rule 2)
# -----------------------------------------------------------------------------


class TestDecisionNoThreeStrikeEnforcement(unittest.TestCase):
    """MAP-page published WITHOUT 3-strike enforcement = canonical anti-pattern → fire."""

    def test_map_page_without_3_strike_fires(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        levers = {
            "map_policy_page_published": True,  # published
            "three_strike_enforcement_active": False,  # NO enforcement
            "geographic_exclusivity_top_20": True,
            "city_level_exclusivity_top_5": True,
            "channel_exclusivity_tier": True,
            "shopify_b2b_handshake_geographic_exclusion": True,
            "map_policy_enforcement_tooling": True,
            "arpu_cannibalization_monitoring": True,
        }
        state = _make_state(levers=levers, dtc_cannibalization_pct=5.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("3-strike enforcement", reason)
        self.assertIn("WITHOUT", reason)


# -----------------------------------------------------------------------------
# Decision: DTC cannibalization exceeds threshold → alert (Rule 3)
# -----------------------------------------------------------------------------


class TestDecisionHighCannibalization(unittest.TestCase):
    """DTC cannibalization above the canonical 25.0% threshold → fire."""

    def test_cannibalization_above_threshold_fires(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        state = _make_state(dtc_cannibalization_pct=35.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("35.0%", reason)
        self.assertIn("exceeds threshold", reason)

    def test_cannibalization_below_threshold_no_fire(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        state = _make_state(dtc_cannibalization_pct=15.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertFalse(should_fire)


# -----------------------------------------------------------------------------
# Decision: 3rd-violation terminations exceed threshold → alert (Rule 4)
# -----------------------------------------------------------------------------


class TestDecision3rdViolationTerminations(unittest.TestCase):
    """3rd-violation terminations ≥ threshold (2) → fire."""

    def test_terminations_at_threshold_fires(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        state = _make_state(third_violation_terminations_last_30d=2, dtc_cannibalization_pct=10.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("terminations", reason)

    def test_terminations_below_threshold_no_fire(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        state = _make_state(third_violation_terminations_last_30d=1, dtc_cannibalization_pct=10.0)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertFalse(should_fire)


# -----------------------------------------------------------------------------
# Decision: wholesale channel inactive → no alert (gate skipped)
# -----------------------------------------------------------------------------


class TestDecisionWholesaleInactive(unittest.TestCase):
    """When wholesale_channel_active=False, lever-missing rules are skipped."""

    def test_wholesale_inactive_no_alert_even_when_levers_missing(self):
        thresholds = mapcheck_mod._canonical_thresholds_published()
        levers = {
            "map_policy_page_published": False,
            "three_strike_enforcement_active": False,
            "geographic_exclusivity_top_20": False,
            "city_level_exclusivity_top_5": False,
            "channel_exclusivity_tier": False,
            "shopify_b2b_handshake_geographic_exclusion": False,
            "map_policy_enforcement_tooling": False,
            "arpu_cannibalization_monitoring": False,
        }
        state = _make_state(wholesale_channel_active=False, levers=levers)
        should_fire, reason = mapcheck_mod._decide_should_fire(state, thresholds)
        self.assertFalse(should_fire)


# -----------------------------------------------------------------------------
# Alert payload shape
# -----------------------------------------------------------------------------


class TestAlertPayloadShape(unittest.TestCase):
    """Verify _build_alert_payload produces a payload with all 13 canonical fields."""

    def test_payload_has_all_canonical_fields(self):
        state = _make_state()
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        canonical_fields = mapcheck_mod._canonical_alert_shape_published()
        for field in canonical_fields:
            self.assertIn(field, payload, f"Missing canonical field: {field}")

    def test_payload_severity_critical_when_levers_missing(self):
        levers = {k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS}
        levers["map_policy_page_published"] = True  # publish only one
        state = _make_state(levers=levers)
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        self.assertEqual(payload["severity"], "critical")
        self.assertIn("🔴", payload["title"])

    def test_payload_severity_info_when_wholesale_inactive(self):
        state = _make_state(wholesale_channel_active=False)
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "all Pillar-4 levers active", Path("/tmp/state.json"), thresholds)
        self.assertEqual(payload["severity"], "info")
        self.assertIn("ℹ️", payload["title"])

    def test_payload_summary_includes_brand_id_and_counts(self):
        state = _make_state(brand_id="acme-co")
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        self.assertIn("acme-co", payload["summary"])
        self.assertIn("DTC cannibalization", payload["summary"])


# -----------------------------------------------------------------------------
# Alert payload per-lever breakdown
# -----------------------------------------------------------------------------


class TestAlertPayloadLeverBreakdown(unittest.TestCase):
    """Verify per-lever breakdown includes all 8 levers with canonical/optional categorization."""

    def test_lever_breakdown_has_8_entries(self):
        state = _make_state()
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        breakdown = payload["lever_breakdown"]
        self.assertEqual(len(breakdown), 8)

    def test_lever_breakdown_categorizes_canonical_vs_optional(self):
        """5 levers are pillar_4_canonical, 3 are pillar_4_optional."""
        state = _make_state()
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        breakdown = payload["lever_breakdown"]
        canonical_count = sum(1 for entry in breakdown if entry["category"] == "pillar_4_canonical")
        optional_count = sum(1 for entry in breakdown if entry["category"] == "pillar_4_optional")
        self.assertEqual(canonical_count, 5)
        self.assertEqual(optional_count, 3)

    def test_lever_breakdown_includes_remediation(self):
        """Each lever entry includes the canonical remediation text."""
        state = _make_state()
        thresholds = mapcheck_mod._canonical_thresholds_published()
        payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
        breakdown = payload["lever_breakdown"]
        for entry in breakdown:
            self.assertIn("remediation", entry)
            self.assertGreater(len(entry["remediation"]), 0)


# -----------------------------------------------------------------------------
# Cooldown logic
# -----------------------------------------------------------------------------


class TestCooldownLogic(unittest.TestCase):
    """Verify _respect_cooldown skips firing when a recent alert exists in archive_dir."""

    def test_no_archive_dir_no_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / "non_existent"
            should_skip, reason = mapcheck_mod._respect_cooldown(archive_dir, 3600)
            self.assertFalse(should_skip)

    def test_empty_archive_dir_no_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / "empty"
            archive_dir.mkdir()
            should_skip, reason = mapcheck_mod._respect_cooldown(archive_dir, 3600)
            self.assertFalse(should_skip)

    def test_recent_archive_within_cooldown_skips(self):
        """A 30-second-old archive file within a 60-second cooldown → skip."""
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp)
            # Write an alert-archive file dated 30 seconds ago.
            now = datetime.now(timezone.utc)
            ts_30s_ago = now - timedelta(seconds=30)
            ts_str = ts_30s_ago.strftime("%Y%m%dT%H%M%SZ")
            (archive_dir / f"map-alert-{ts_str}-critical.json").write_text("{}")
            should_skip, reason = mapcheck_mod._respect_cooldown(archive_dir, 60)
            self.assertTrue(should_skip)
            self.assertIn("cooldown active", reason)

    def test_old_archive_beyond_cooldown_no_skip(self):
        """An archive file older than the cooldown → don't skip."""
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp)
            # Write an alert-archive file dated 2 hours ago.
            now = datetime.now(timezone.utc)
            ts_2h_ago = now - timedelta(hours=2)
            ts_str = ts_2h_ago.strftime("%Y%m%dT%H%M%SZ")
            (archive_dir / f"map-alert-{ts_str}-critical.json").write_text("{}")
            should_skip, reason = mapcheck_mod._respect_cooldown(archive_dir, 3600)
            self.assertFalse(should_skip)


# -----------------------------------------------------------------------------
# Archive file is written
# -----------------------------------------------------------------------------


class TestArchiveFileWritten(unittest.TestCase):
    """Hermetic mode writes a valid-JSON archive file with payload + post_result."""

    def test_archive_file_exists_with_valid_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / ".map-alerts"
            state = _make_state(levers={k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS})
            state["levers"]["map_policy_page_published"] = True  # only one active
            thresholds = mapcheck_mod._canonical_thresholds_published()
            payload = mapcheck_mod._build_alert_payload(state, "test reason", Path("/tmp/state.json"), thresholds)
            post_result = {"posted": False, "status_code": 0, "error": None, "url": None}
            archive_file = mapcheck_mod._archive_alert(payload, archive_dir, post_result)
            self.assertTrue(archive_file.exists())
            data = json.loads(archive_file.read_text())
            self.assertIn("payload", data)
            self.assertIn("post_result", data)
            self.assertEqual(data["payload"]["alert_id"], payload["alert_id"])


# -----------------------------------------------------------------------------
# --json output is valid JSON
# -----------------------------------------------------------------------------


class TestJsonOutput(unittest.TestCase):
    """Verify --json output is parseable JSON with the canonical envelope."""

    def test_json_output_roundtrips(self):
        """--json on a state file that fires an alert returns parseable JSON."""
        with tempfile.TemporaryDirectory() as tmp:
            state = _make_state(levers={k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS})
            state["levers"]["map_policy_page_published"] = True
            state_path = _write_state_file(Path(tmp), state)
            archive_dir = Path(tmp) / ".map-alerts"
            # Invoke the main() function directly with --json via stdout capture.
            with redirect_stdout(io.StringIO()) as stdout, redirect_stderr(io.StringIO()):
                rc = mapcheck_mod.main_with_args([
                    "--state-json", str(state_path),
                    "--alert-archive", str(archive_dir),
                    "--skip-cooldown",
                    "--json",
                ])
            output = stdout.getvalue()
            self.assertEqual(rc, 1)  # should_fire returns 1
            data = json.loads(output)
            self.assertTrue(data["should_fire"])
            self.assertIn("payload", data)
            self.assertIn("cooldown_status", data)


# -----------------------------------------------------------------------------
# --validate-thresholds mode returns 0 + prints regression-gate output
# -----------------------------------------------------------------------------


class TestValidateThresholdsMode(unittest.TestCase):
    """Verify --validate-thresholds prints canonical thresholds + shape + levers and exits 0."""

    def test_validate_thresholds_returns_0(self):
        with redirect_stdout(io.StringIO()) as stdout, redirect_stderr(io.StringIO()):
            rc = mapcheck_mod.main_with_args(["--validate-thresholds"])
        output = stdout.getvalue()
        self.assertEqual(rc, 0)
        self.assertIn("Canonical MAP-policy thresholds", output)
        self.assertIn("Canonical alert shape", output)
        self.assertIn("Canonical Pillar-4 levers", output)


# -----------------------------------------------------------------------------
# --bootstrap mode creates directory
# -----------------------------------------------------------------------------


class TestBootstrapMode(unittest.TestCase):
    """Verify --bootstrap creates the .map-alerts/ directory under the given path."""

    def test_bootstrap_creates_alerts_dir(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "bootstrap_root"
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                rc = mapcheck_mod.main_with_args(["--bootstrap", str(target)])
            self.assertEqual(rc, 0)
            alerts_dir = target / ".map-alerts"
            self.assertTrue(alerts_dir.exists())
            self.assertTrue(alerts_dir.is_dir())


# -----------------------------------------------------------------------------
# CLI smoke: --help exits 0
# -----------------------------------------------------------------------------


class TestCliHelp(unittest.TestCase):
    """Verify --help exits 0 with all expected flags listed."""

    def test_help_exits_0_with_expected_flags(self):
        try:
            with redirect_stdout(io.StringIO()) as stdout, redirect_stderr(io.StringIO()):
                rc = mapcheck_mod.main_with_args(["--help"])
        except SystemExit as e:
            rc = e.code
        output = stdout.getvalue()
        self.assertIn("--state-json", output)
        self.assertIn("--webhook-url", output)
        self.assertIn("--alert-archive", output)
        self.assertIn("--cooldown-seconds", output)
        self.assertIn("--skip-cooldown", output)
        self.assertIn("--skip-webhook", output)
        self.assertIn("--bootstrap", output)
        self.assertIn("--validate-thresholds", output)
        self.assertIn("--json", output)


# -----------------------------------------------------------------------------
# Subprocess roundtrip: end-to-end on a real state JSON
# -----------------------------------------------------------------------------


class TestSubprocessRoundtrip(unittest.TestCase):
    """Exercise the actual CLI binary end-to-end (catches the --state-json required=True bug)."""

    def test_healthy_state_exits_0(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = _make_state(dtc_cannibalization_pct=10.0)
            state_path = _write_state_file(Path(tmp), state)
            archive_dir = Path(tmp) / ".map-alerts"
            script = Path(__file__).parent.parent / "b2b_map_policy_check.py"
            proc = subprocess.run(
                [sys.executable, str(script),
                 "--state-json", str(state_path),
                 "--alert-archive", str(archive_dir),
                 "--skip-cooldown",
                 "--json"],
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(proc.returncode, 0, f"stderr: {proc.stderr}")
            data = json.loads(proc.stdout)
            self.assertFalse(data["should_fire"])
            self.assertEqual(data["cooldown_status"]["applied"], False)

    def test_failing_state_exits_1_and_archives(self):
        with tempfile.TemporaryDirectory() as tmp:
            levers = {k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS}
            levers["map_policy_page_published"] = True
            state = _make_state(levers=levers)
            state_path = _write_state_file(Path(tmp), state)
            archive_dir = Path(tmp) / ".map-alerts"
            script = Path(__file__).parent.parent / "b2b_map_policy_check.py"
            proc = subprocess.run(
                [sys.executable, str(script),
                 "--state-json", str(state_path),
                 "--alert-archive", str(archive_dir),
                 "--skip-cooldown",
                 "--json"],
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(proc.returncode, 1, f"stderr: {proc.stderr}")
            data = json.loads(proc.stdout)
            self.assertTrue(data["should_fire"])
            # Archive file should have been created.
            self.assertIsNotNone(data["archive_file"])
            archive_path = Path(data["archive_file"])
            self.assertTrue(archive_path.exists())

    def test_cooldown_suppresses_second_alert(self):
        """After force-firing once, a second run without --skip-cooldown should be suppressed."""
        with tempfile.TemporaryDirectory() as tmp:
            levers = {k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS}
            levers["map_policy_page_published"] = True
            state = _make_state(levers=levers)
            state_path = _write_state_file(Path(tmp), state)
            archive_dir = Path(tmp) / ".map-alerts"
            script = Path(__file__).parent.parent / "b2b_map_policy_check.py"
            # Run 1: force-fire with --skip-cooldown
            proc1 = subprocess.run(
                [sys.executable, str(script),
                 "--state-json", str(state_path),
                 "--alert-archive", str(archive_dir),
                 "--skip-cooldown", "--json"],
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(proc1.returncode, 1)
            # Run 2: without --skip-cooldown → should be suppressed
            proc2 = subprocess.run(
                [sys.executable, str(script),
                 "--state-json", str(state_path),
                 "--alert-archive", str(archive_dir),
                 "--json"],
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(proc2.returncode, 0, f"stderr: {proc2.stderr}")
            data2 = json.loads(proc2.stdout)
            self.assertFalse(data2["should_fire"])
            self.assertTrue(data2["cooldown_status"]["applied"])


# -----------------------------------------------------------------------------
# --skip-webhook prevents POST but still archives
# -----------------------------------------------------------------------------


class TestSkipWebhookPreventsPost(unittest.TestCase):
    """Verify --skip-webhook prevents POST but still builds + archives the payload."""

    def test_skip_webhook_no_post_but_archive_written(self):
        with tempfile.TemporaryDirectory() as tmp:
            levers = {k: False for k in mapcheck_mod.PILLAR_4_LEVERS + mapcheck_mod.OPTIONAL_PILLAR_4_LEVERS}
            levers["map_policy_page_published"] = True
            state = _make_state(levers=levers)
            state_path = _write_state_file(Path(tmp), state)
            archive_dir = Path(tmp) / ".map-alerts"
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                rc = mapcheck_mod.main_with_args([
                    "--state-json", str(state_path),
                    "--alert-archive", str(archive_dir),
                    "--webhook-url", "https://hooks.slack.com/services/T0/B0/X",  # would normally POST
                    "--skip-cooldown",
                    "--skip-webhook",
                    "--json",
                ])
            self.assertEqual(rc, 1)
            # Archive should still be written
            archive_files = list(archive_dir.glob("map-alert-*.json"))
            self.assertEqual(len(archive_files), 1)


# -----------------------------------------------------------------------------
# main_test() standalone runner
# -----------------------------------------------------------------------------


def main_test() -> int:
    """Run all tests via unittest; return 0 on full pass."""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main_test())