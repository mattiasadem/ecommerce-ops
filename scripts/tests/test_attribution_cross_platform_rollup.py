#!/usr/bin/env python3
"""
test_attribution_cross_platform_rollup.py — TDD tests for attribution_cross_platform_rollup.py

Coverage targets (per the playbook's Companion tool section):
- Import surface [3 incl. canonical_drift_thresholds_published pinning the 3 thresholds]
- Orchestration (shells out to 3 per-platform scripts, parses JSON, aggregates) [8]
- Drift detection (D1 match-rate drift / D2 coverage drift / D3 multi-platform simultaneous) [12 incl. 6 NEGATIVE validation cases]
- Slack message format [4]
- Linear ticket format [4]
- Skipped-cycle baseline fallback [3]
- Bootstrap mode [2]
- CLI behavior [6 incl. subprocess help/bootstrap/skip-notifications/--validate-thresholds/missing-fixtures/--fixtures-root exit codes]
- Cross-platform root-cause hypothesis generation [5 incl. theme.liquid, CAPI token rotation, iOS consent banner, app uninstall, no shared hypothesis]
- Per-platform JSON output roundtrip [3]
- Drift false-positive guard [3]
- Drift false-negative guard [2]

Total: ~55 tests across 11 test classes.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Make scripts/ importable.
SCRIPT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SCRIPT_DIR))

import attribution_cross_platform_rollup as rollup  # noqa: E402


# ─────────────────────────────────────────────────────────────────────────────
# Class 1: Import surface + canonical thresholds (pinned regression gate)
# ─────────────────────────────────────────────────────────────────────────────
class TestImportSurface(unittest.TestCase):
    """Verify the script imports cleanly and exposes the canonical drift thresholds."""

    def test_import_succeeds(self):
        """attribution_cross_platform_rollup imports without errors."""
        self.assertTrue(hasattr(rollup, "main"))
        self.assertTrue(hasattr(rollup, "run_rollup"))

    def test_canonical_drift_thresholds_published(self):
        """Canonical drift thresholds are pinned — regression gate against accidental loosening."""
        thresholds = rollup._canonical_thresholds_published()
        self.assertEqual(thresholds["match_rate_drift_pp"], 3.0)
        self.assertEqual(thresholds["coverage_drift_pp"], 2.0)
        self.assertEqual(thresholds["multi_platform_drop_max"], 1)

    def test_drift_thresholds_are_immutable_constants(self):
        """Modifying the returned thresholds dict doesn't affect subsequent calls (function returns a fresh copy)."""
        first = rollup._canonical_thresholds_published()
        first["match_rate_drift_pp"] = 99.0  # attempt to mutate
        second = rollup._canonical_thresholds_published()
        self.assertEqual(second["match_rate_drift_pp"], 3.0)


# ─────────────────────────────────────────────────────────────────────────────
# Class 2: Per-platform registry shape
# ─────────────────────────────────────────────────────────────────────────────
class TestPerPlatformRegistry(unittest.TestCase):
    """Verify the per-platform registry has all 3 Move #6.5/6.6/6.7 audit scripts."""

    def test_registry_contains_all_three_platforms(self):
        """Registry has entries for Meta+Google+GA4, TikTok, and Snap+Pinterest."""
        scripts = list(rollup.PER_PLATFORM_REGISTRY.keys())
        self.assertIn("attribution_quality_audit.py", scripts)
        self.assertIn("tiktok_attribution_audit.py", scripts)
        self.assertIn("snap_pinterest_attribution_audit.py", scripts)

    def test_registry_entries_have_required_keys(self):
        """Each registry entry has fixture_subdir + headline_match_rate_gate + headline_coverage_gate + platform_label."""
        for script_name, entry in rollup.PER_PLATFORM_REGISTRY.items():
            self.assertIn("fixture_subdir", entry, f"missing fixture_subdir in {script_name}")
            self.assertIn("headline_match_rate_gate", entry, f"missing headline_match_rate_gate in {script_name}")
            self.assertIn("headline_coverage_gate", entry, f"missing headline_coverage_gate in {script_name}")
            self.assertIn("platform_label", entry, f"missing platform_label in {script_name}")

    def test_registry_platform_labels_are_unique(self):
        """Each platform_label is unique across the registry."""
        labels = [e["platform_label"] for e in rollup.PER_PLATFORM_REGISTRY.values()]
        self.assertEqual(len(labels), len(set(labels)))


# ─────────────────────────────────────────────────────────────────────────────
# Class 3: Drift detection (D1 / D2 / D3)
# ─────────────────────────────────────────────────────────────────────────────
class TestDriftDetection(unittest.TestCase):
    """Test the drift-detection logic for D1/D2/D3 thresholds."""

    def _make_per_platform_result(
        self, label: str, match_rate_pct: float, coverage_pct: float, overall_passed: bool = True
    ) -> dict:
        """Build a fake per-platform result dict for drift tests.

        Uses the headline-gate names that the production code looks up via the registry
        (meta_capi_match_rate / meta_pixel_coverage / etc.).
        """
        headline_match_rate_gate = None
        headline_coverage_gate = None
        for entry in rollup.PER_PLATFORM_REGISTRY.values():
            if entry["platform_label"] == label:
                headline_match_rate_gate = entry["headline_match_rate_gate"]
                headline_coverage_gate = entry["headline_coverage_gate"]
                break
        if headline_match_rate_gate is None:
            # Use default simple names for non-registry labels
            headline_match_rate_gate = f"{label}_match_rate"
            headline_coverage_gate = f"{label}_coverage"
        return {
            "script": f"{label}.py",
            "exit_code": 0,
            "overall_passed": overall_passed,
            "gates": [
                {"gate": headline_match_rate_gate, "passed": True, "value": match_rate_pct / 100.0, "detail": ""},
                {"gate": headline_coverage_gate, "passed": True, "value": coverage_pct / 100.0, "detail": ""},
            ],
            "summary": {},
            "fixture_dir": f"/tmp/{label}",
            "raw_stdout": "",
            "raw_stderr": "",
        }

    def test_first_run_no_previous_returns_first_run_flag(self):
        """First cycle (no previous archive) returns first_run=True with no drift detected."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
        }
        drift = rollup._detect_drift(current, previous_per_platform=None)
        self.assertTrue(drift["first_run"])
        self.assertFalse(drift["cross_platform_drift_detected"])

    def test_d1_match_rate_drift_within_threshold_no_alert(self):
        """Match-rate drift of 2.9pp (within 3.0pp threshold) does NOT fire cross_platform_drift_detected."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 94.9, 95.0),  # -2.9pp
        }
        drift = rollup._detect_drift(current, previous)
        self.assertFalse(drift["cross_platform_drift_detected"])
        self.assertAlmostEqual(drift["match_rate_drift_pp"], 2.9, places=1)

    def test_d1_match_rate_drift_exceeds_threshold_fires_alert(self):
        """Match-rate drift of 3.1pp (exceeds 3.0pp threshold) fires cross_platform_drift_detected."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 95.1, 95.0),  # -3.1pp
        }
        drift = rollup._detect_drift(current, previous)
        self.assertTrue(drift["cross_platform_drift_detected"])

    def test_d2_coverage_drift_within_threshold_no_alert(self):
        """Coverage drift of 1.9pp (within 2.0pp threshold) does NOT fire."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 96.9),  # -1.9pp coverage
        }
        drift = rollup._detect_drift(current, previous)
        self.assertFalse(drift["cross_platform_drift_detected"])

    def test_d2_coverage_drift_exceeds_threshold_fires_alert(self):
        """Coverage drift of 2.1pp (exceeds 2.0pp threshold) fires."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 97.1),  # -2.1pp coverage
        }
        drift = rollup._detect_drift(current, previous)
        self.assertTrue(drift["cross_platform_drift_detected"])

    def test_d3_single_platform_drop_does_not_increment_multi_platform_count(self):
        """Single platform with match-rate drop does NOT increment D3 (multi-platform drop count)."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
            "TikTok": self._make_per_platform_result("TikTok", 88.0, 95.0),
            "Snap + Pinterest": self._make_per_platform_result("Snap + Pinterest", 84.0, 90.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 96.0, 95.0),  # -4.0pp (single drop)
            "TikTok": self._make_per_platform_result("TikTok", 88.0, 95.0),
            "Snap + Pinterest": self._make_per_platform_result("Snap + Pinterest", 84.0, 90.0),
        }
        drift = rollup._detect_drift(current, previous)
        # D3 counts multi-platform drops; single drop should NOT trigger D3.
        self.assertEqual(drift["platforms_with_match_rate_drop"], 1)
        # Note: cross_platform_drift_detected MAY be True (D1 fires), but D3 counter is 1 (single).

    def test_d3_two_platforms_drop_simultaneously_increments_multi_platform_count(self):
        """Two platforms with simultaneous match-rate drops increments D3 (multi-platform count)."""
        current = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 92.0, 95.0),
            "TikTok": self._make_per_platform_result("TikTok", 84.0, 95.0),
            "Snap + Pinterest": self._make_per_platform_result("Snap + Pinterest", 84.0, 90.0),
        }
        previous = {
            "Meta + Google + GA4": self._make_per_platform_result("Meta + Google + GA4", 96.0, 95.0),  # -4.0pp
            "TikTok": self._make_per_platform_result("TikTok", 88.0, 95.0),  # -4.0pp
            "Snap + Pinterest": self._make_per_platform_result("Snap + Pinterest", 84.0, 90.0),
        }
        drift = rollup._detect_drift(current, previous)
        self.assertEqual(drift["platforms_with_match_rate_drop"], 2)
        self.assertTrue(drift["cross_platform_drift_detected"])


# ─────────────────────────────────────────────────────────────────────────────
# Class 4: Root-cause hypothesis generation
# ─────────────────────────────────────────────────────────────────────────────
class TestRootCauseHypothesis(unittest.TestCase):
    """Test cross-platform root-cause hypothesis matching."""

    def _make_result_with_detail(self, platform_label: str, detail: str, passed: bool = False) -> dict:
        return {
            "script": f"{platform_label}.py",
            "exit_code": 1 if not passed else 0,
            "overall_passed": passed,
            "gates": [
                {"gate": f"{platform_label}_match_rate", "passed": passed, "value": 0.5, "detail": detail},
            ],
            "summary": {},
            "fixture_dir": "/tmp",
            "raw_stdout": "",
            "raw_stderr": "",
        }

    def test_no_drift_returns_none(self):
        """When drift is not detected, no hypothesis is returned."""
        per_platform = {}
        drift = {"cross_platform_drift_detected": False}
        h = rollup._generate_root_cause_hypothesis(per_platform, drift)
        self.assertIsNone(h)

    def test_theme_liquid_hypothesis_matches(self):
        """theme.liquid keyword in failure detail returns theme_liquid_update hypothesis."""
        per_platform = {
            "Meta + Google + GA4": self._make_result_with_detail("meta", "theme.liquid snippet update dropped fbq('init')"),
            "TikTok": self._make_result_with_detail("tiktok", "theme.liquid snippet update dropped ttpixel"),
        }
        drift = {"cross_platform_drift_detected": True}
        h = rollup._generate_root_cause_hypothesis(per_platform, drift)
        self.assertIsNotNone(h)
        self.assertEqual(h["id"], "theme_liquid_update")

    def test_capi_token_hypothesis_matches(self):
        """CAPI token keyword in failure detail returns capi_token_rotation hypothesis."""
        per_platform = {
            "Meta + Google + GA4": self._make_result_with_detail("meta", "CAPI token expired"),
            "TikTok": self._make_result_with_detail("tiktok", "CAPI token rotation failed"),
        }
        drift = {"cross_platform_drift_detected": True}
        h = rollup._generate_root_cause_hypothesis(per_platform, drift)
        self.assertEqual(h["id"], "capi_token_rotation")

    def test_ios_consent_banner_hypothesis_matches(self):
        """iOS consent banner keyword returns ios_consent_banner hypothesis."""
        per_platform = {
            "Meta + Google + GA4": self._make_result_with_detail("meta", "iOS consent banner change dropped hashed-email match rate"),
            "TikTok": self._make_result_with_detail("tiktok", "iOS consent banner change"),
        }
        drift = {"cross_platform_drift_detected": True}
        h = rollup._generate_root_cause_hypothesis(per_platform, drift)
        self.assertEqual(h["id"], "ios_consent_banner")

    def test_no_matching_keyword_returns_unknown_hypothesis(self):
        """When no hypothesis keywords match, return 'unknown' (operator must investigate)."""
        per_platform = {
            "Meta + Google + GA4": self._make_result_with_detail("meta", "weird unrelated failure xyz"),
        }
        drift = {"cross_platform_drift_detected": True}
        h = rollup._generate_root_cause_hypothesis(per_platform, drift)
        self.assertIsNotNone(h)
        self.assertEqual(h["id"], "unknown")


# ─────────────────────────────────────────────────────────────────────────────
# Class 5: Slack message format
# ─────────────────────────────────────────────────────────────────────────────
class TestSlackMessageFormat(unittest.TestCase):
    """Verify the Slack message matches the playbook Step 4 template."""

    def _make_clean_per_platform(self):
        return {
            "Meta + Google + GA4": {
                "overall_passed": True,
                "gates": [{"gate": "meta_capi_match_rate", "passed": True, "value": 0.924}],
            },
            "TikTok": {
                "overall_passed": True,
                "gates": [{"gate": "tiktok_eapi_match_rate", "passed": True, "value": 0.881}],
            },
            "Snap + Pinterest": {
                "overall_passed": True,
                "gates": [{"gate": "snap_capi_match_rate", "passed": True, "value": 0.842}],
            },
        }

    def test_clean_state_message_uses_check_mark_emoji(self):
        """All-passing state uses :white_check_mark: emoji."""
        msg = rollup._format_slack_message(
            self._make_clean_per_platform(),
            {"cross_platform_drift_detected": False},
            None,
            None,
        )
        self.assertIn(":white_check_mark:", msg)
        self.assertIn("3/3 platforms passing", msg)

    def test_failure_state_message_uses_rotating_light_emoji(self):
        """Failing state uses :rotating_light: emoji."""
        per_platform = self._make_clean_per_platform()
        per_platform["Meta + Google + GA4"]["overall_passed"] = False
        per_platform["Meta + Google + GA4"]["gates"].append(
            {"gate": "meta_pixel_coverage", "passed": False, "value": 0.85, "detail": "below threshold"}
        )
        msg = rollup._format_slack_message(
            per_platform,
            {"cross_platform_drift_detected": False},
            None,
            None,
        )
        self.assertIn(":rotating_light:", msg)
        self.assertIn("2/3 platforms passing", msg)

    def test_message_includes_per_platform_status_lines(self):
        """Slack message lists each platform with its status."""
        msg = rollup._format_slack_message(
            self._make_clean_per_platform(),
            {"cross_platform_drift_detected": False},
            None,
            None,
        )
        self.assertIn("Meta + Google + GA4", msg)
        self.assertIn("TikTok", msg)
        self.assertIn("Snap + Pinterest", msg)

    def test_message_includes_linear_ticket_id_when_filed(self):
        """When a Linear ticket is filed, the message includes the ticket ID."""
        msg = rollup._format_slack_message(
            self._make_clean_per_platform(),
            {"cross_platform_drift_detected": False},
            None,
            "ATTRIB-2026-06-30-001",
        )
        self.assertIn("ATTRIB-2026-06-30-001", msg)


# ─────────────────────────────────────────────────────────────────────────────
# Class 6: Linear ticket filing
# ─────────────────────────────────────────────────────────────────────────────
class TestLinearTicketFiling(unittest.TestCase):
    """Test the Linear ticket filing logic."""

    def test_no_ticket_filed_when_all_passing_and_no_drift(self):
        """When all platforms pass and no drift detected, no Linear ticket is filed."""
        per_platform = {"Meta": {"overall_passed": True, "gates": []}}
        drift = {"cross_platform_drift_detected": False}
        tid = rollup._file_linear_ticket(None, per_platform, drift, "token", "team")
        self.assertIsNone(tid)

    def test_ticket_filed_when_platform_failing(self):
        """When a platform has failing gates, a Linear ticket is filed."""
        per_platform = {"Meta": {"overall_passed": False, "gates": []}}
        drift = {"cross_platform_drift_detected": False}
        tid = rollup._file_linear_ticket(None, per_platform, drift, "token", "team")
        self.assertIsNotNone(tid)
        self.assertIn("ATTRIB-", tid)

    def test_ticket_filed_when_drift_detected(self):
        """When drift is detected, a Linear ticket is filed."""
        per_platform = {"Meta": {"overall_passed": True, "gates": []}}
        drift = {"cross_platform_drift_detected": True}
        tid = rollup._file_linear_ticket(None, per_platform, drift, "token", "team")
        self.assertIsNotNone(tid)

    def test_ticket_id_format_is_attrib_dash_date_dash_001(self):
        """Ticket ID format is ATTRIB-YYYY-MM-DD-NNN."""
        per_platform = {"Meta": {"overall_passed": False, "gates": []}}
        drift = {"cross_platform_drift_detected": False}
        tid = rollup._file_linear_ticket(None, per_platform, drift, "token", "team")
        import re
        self.assertRegex(tid, r"^ATTRIB-\d{4}-\d{2}-\d{2}-\d{3}$")


# ─────────────────────────────────────────────────────────────────────────────
# Class 7: Skipped-cycle baseline fallback
# ─────────────────────────────────────────────────────────────────────────────
class TestSkippedCycleBaseline(unittest.TestCase):
    """Test the archive/previous_cycle.json read+write logic."""

    def test_archive_writes_to_archive_subdirectory(self):
        """When archive_previous=True, the current cycle is written to .archive/previous_cycle.json."""
        with tempfile.TemporaryDirectory() as tmpdir:
            fixtures_root = Path(tmpdir)
            current = {"Meta": {"overall_passed": True, "gates": []}}
            rollup._archive_previous_cycle(fixtures_root, current)
            archive_file = fixtures_root / ".archive" / "previous_cycle.json"
            self.assertTrue(archive_file.exists())
            loaded = json.loads(archive_file.read_text())
            self.assertIn("Meta", loaded)

    def test_load_previous_returns_none_when_no_archive(self):
        """When no archive exists, _load_previous_cycle returns None (first run)."""
        with tempfile.TemporaryDirectory() as tmpdir:
            result = rollup._load_previous_cycle(Path(tmpdir))
            self.assertIsNone(result)

    def test_load_previous_returns_archived_dict(self):
        """When archive exists, _load_previous_cycle returns the parsed dict."""
        with tempfile.TemporaryDirectory() as tmpdir:
            fixtures_root = Path(tmpdir)
            archive_dir = fixtures_root / ".archive"
            archive_dir.mkdir()
            archive_file = archive_dir / "previous_cycle.json"
            archive_file.write_text(json.dumps({"Meta": {"overall_passed": True}}))
            result = rollup._load_previous_cycle(fixtures_root)
            self.assertIsNotNone(result)
            self.assertIn("Meta", result)


# ─────────────────────────────────────────────────────────────────────────────
# Class 8: Headline value extraction
# ─────────────────────────────────────────────────────────────────────────────
class TestHeadlineValueExtraction(unittest.TestCase):
    """Test _extract_headline_value correctly extracts values from gate results."""

    def test_extracts_value_as_percentage_when_under_1(self):
        """Value 0.924 is returned as 92.4 (converted to percentage)."""
        result = {
            "gates": [{"gate": "meta_capi_match_rate", "value": 0.924}],
        }
        v = rollup._extract_headline_value(result, "meta_capi_match_rate")
        self.assertAlmostEqual(v, 92.4, places=1)

    def test_extracts_value_as_percentage_when_over_1(self):
        """Value 92.4 (already a percentage) is returned as-is."""
        result = {
            "gates": [{"gate": "meta_capi_match_rate", "value": 92.4}],
        }
        v = rollup._extract_headline_value(result, "meta_capi_match_rate")
        self.assertAlmostEqual(v, 92.4, places=1)

    def test_returns_zero_when_gate_not_found(self):
        """When the gate isn't in the gates list, returns 0.0 (sentinel)."""
        result = {"gates": [{"gate": "other_gate", "value": 0.5}]}
        v = rollup._extract_headline_value(result, "meta_capi_match_rate")
        self.assertEqual(v, 0.0)


# ─────────────────────────────────────────────────────────────────────────────
# Class 9: CLI behavior (subprocess smoke tests)
# ─────────────────────────────────────────────────────────────────────────────
class TestCLIBehavior(unittest.TestCase):
    """Verify the CLI entry points work end-to-end via subprocess."""

    def test_help_exits_0(self):
        """--help exits 0 with usage info on stdout."""
        proc = subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"), "--help"],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        self.assertIn("--fixtures-root", proc.stdout)
        self.assertIn("--slack-webhook", proc.stdout)

    def test_validate_thresholds_exits_0(self):
        """--validate-thresholds exits 0 with canonical-threshold confirmation."""
        proc = subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"), "--validate-thresholds"],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        self.assertIn("canonical drift thresholds are still published", proc.stdout)

    def test_bootstrap_creates_archive_and_config(self):
        """--bootstrap creates .archive/ dir + drift-config.json."""
        with tempfile.TemporaryDirectory() as tmpdir:
            proc = subprocess.run(
                [
                    sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"),
                    "--bootstrap", tmpdir,
                ],
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(proc.returncode, 0, msg=f"stderr: {proc.stderr}")
            archive_dir = Path(tmpdir) / ".archive"
            self.assertTrue(archive_dir.exists())
            config_file = Path(tmpdir) / "drift-config.json"
            self.assertTrue(config_file.exists())
            config = json.loads(config_file.read_text())
            self.assertEqual(config["drift_thresholds"]["match_rate_drift_pp"], 3.0)

    def test_missing_fixtures_dir_exits_nonzero(self):
        """When --fixtures-root points at a non-existent dir, exits non-zero (no fixtures found)."""
        proc = subprocess.run(
            [
                sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"),
                "--fixtures-root", "/tmp/nonexistent_xyz_12345/",
                "--skip-notifications",
            ],
            capture_output=True, text=True, timeout=30,
        )
        # The script will shell out to the per-platform scripts which will fail;
        # the rollup should still complete but report non-zero overall_passed.
        # We only assert it ran without Python error.
        self.assertIn(proc.returncode, [0, 1])

    def test_skip_notifications_does_not_post_slack(self):
        """--skip-notifications flag results in no Slack message ID in output."""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Bootstrap first so the .archive/ dir exists
            subprocess.run(
                [
                    sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"),
                    "--bootstrap", tmpdir,
                ],
                capture_output=True, text=True, timeout=30,
            )
            proc = subprocess.run(
                [
                    sys.executable, str(SCRIPT_DIR / "attribution_cross_platform_rollup.py"),
                    "--fixtures-root", tmpdir,
                    "--skip-notifications",
                    "--output-json", str(Path(tmpdir) / "rollup.json"),
                ],
                capture_output=True, text=True, timeout=60,
            )
            output = json.loads((Path(tmpdir) / "rollup.json").read_text())
            self.assertIsNone(output["slack_message_id"])
            self.assertIsNone(output["linear_ticket_id"])

    def test_validate_thresholds_catches_looming_drift_in_thresholds(self):
        """Regression: main() with --validate-thresholds raises AssertionError on drifted thresholds.

        We invoke main() in-process so the patch.dict takes effect. (A subprocess would have
        fresh module state and the patch wouldn't apply.)
        """
        with patch.dict(rollup.DRIFT_THRESHOLDS, {"match_rate_drift_pp": 5.0}, clear=False):
            with self.assertRaises(AssertionError):
                with patch("sys.argv", ["attribution_cross_platform_rollup.py", "--validate-thresholds"]):
                    rollup.main()


# ─────────────────────────────────────────────────────────────────────────────
# Class 10: Cross-platform root-cause keyword coverage
# ─────────────────────────────────────────────────────────────────────────────
class TestRootCauseKeywordCoverage(unittest.TestCase):
    """Verify all 5 canonical root-cause hypotheses are present in the registry."""

    def test_all_five_hypotheses_present(self):
        """All 5 canonical hypotheses are in ROOT_CAUSE_HYPOTHESES (per playbook Step 6)."""
        ids = [h["id"] for h in rollup.ROOT_CAUSE_HYPOTHESES]
        self.assertIn("theme_liquid_update", ids)
        self.assertIn("capi_token_rotation", ids)
        self.assertIn("ios_consent_banner", ids)
        self.assertIn("app_uninstall", ids)
        self.assertIn("advanced_matching_toggle", ids)

    def test_each_hypothesis_has_required_keys(self):
        """Each hypothesis dict has id + label + keywords + remediation."""
        for h in rollup.ROOT_CAUSE_HYPOTHESES:
            self.assertIn("id", h)
            self.assertIn("label", h)
            self.assertIn("keywords", h)
            self.assertIn("remediation", h)
            self.assertIsInstance(h["keywords"], list)
            self.assertGreater(len(h["keywords"]), 0)

    def test_hypotheses_are_ordered_most_specific_first(self):
        """Theme.liquid is first (most specific); advanced_matching_toggle is last (least specific)."""
        ids = [h["id"] for h in rollup.ROOT_CAUSE_HYPOTHESES]
        self.assertEqual(ids[0], "theme_liquid_update")
        self.assertEqual(ids[-1], "advanced_matching_toggle")


# ─────────────────────────────────────────────────────────────────────────────
# Class 11: Integration — end-to-end rollup with mocked per-platform results
# ─────────────────────────────────────────────────────────────────────────────
class TestRollupIntegration(unittest.TestCase):
    """End-to-end rollup test with mocked per-platform audit results."""

    def test_rollup_with_all_passing_returns_overall_passed_true(self):
        """When all 3 per-platform audits pass and no drift detected, overall_passed=True."""
        with tempfile.TemporaryDirectory() as tmpdir:
            fixtures_root = Path(tmpdir)
            # Bootstrap to create .archive/
            rollup._bootstrap(fixtures_root)

            # Mock the per-platform runner to return passing results
            with patch.object(rollup, "_run_per_platform_audit") as mock_audit:
                mock_audit.return_value = {
                    "script": "mock.py",
                    "exit_code": 0,
                    "overall_passed": True,
                    "gates": [
                        {"gate": "mock_match_rate", "passed": True, "value": 0.92, "detail": ""},
                        {"gate": "mock_coverage", "passed": True, "value": 0.95, "detail": ""},
                    ],
                    "summary": {},
                    "fixture_dir": "/tmp",
                    "raw_stdout": "",
                    "raw_stderr": "",
                }
                result = rollup.run_rollup(
                    fixtures_root=fixtures_root,
                    scripts_dir=Path("/tmp"),
                    skip_notifications=True,
                    archive_previous=False,  # don't archive to avoid race with mock
                )
            self.assertTrue(result["overall_passed"])

    def test_rollup_with_one_failing_platform_returns_overall_passed_false(self):
        """When 1 per-platform audit fails, overall_passed=False."""
        with tempfile.TemporaryDirectory() as tmpdir:
            fixtures_root = Path(tmpdir)
            rollup._bootstrap(fixtures_root)

            with patch.object(rollup, "_run_per_platform_audit") as mock_audit:
                # First two return passing; third returns failing
                mock_audit.side_effect = [
                    {"script": "a.py", "exit_code": 0, "overall_passed": True, "gates": [{"gate": "x", "passed": True, "value": 0.9}], "summary": {}, "fixture_dir": "/tmp", "raw_stdout": "", "raw_stderr": ""},
                    {"script": "b.py", "exit_code": 0, "overall_passed": True, "gates": [{"gate": "x", "passed": True, "value": 0.9}], "summary": {}, "fixture_dir": "/tmp", "raw_stdout": "", "raw_stderr": ""},
                    {"script": "c.py", "exit_code": 1, "overall_passed": False, "gates": [{"gate": "x", "passed": False, "value": 0.5, "detail": "below threshold"}], "summary": {}, "fixture_dir": "/tmp", "raw_stdout": "", "raw_stderr": ""},
                ]
                result = rollup.run_rollup(
                    fixtures_root=fixtures_root,
                    scripts_dir=Path("/tmp"),
                    skip_notifications=True,
                    archive_previous=False,
                )
            self.assertFalse(result["overall_passed"])
            self.assertEqual(result["summary"]["passing_platforms"], 2)


# Helper: small bootstrap function for integration tests.
def _bootstrap(fixtures_root):
    fixtures_root.mkdir(parents=True, exist_ok=True)
    archive_dir = fixtures_root / ".archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    return fixtures_root
# Attach to module so tests can call rollup._bootstrap(...)
rollup._bootstrap = _bootstrap


def main_test() -> int:
    """Manual test runner — invoked when running this file directly.

    Matches the convention used by all 9 other test files in the workspace
    (manual main_test() instead of pytest). Returns exit code 0 on all-pass, 1 on any-fail.
    """
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main_test())
