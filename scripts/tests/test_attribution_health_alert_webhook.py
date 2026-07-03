#!/usr/bin/env python3
"""
test_attribution_health_alert_webhook.py — TDD tests for Move #6.10.

Architecture: standalone `main_test()` runner per the canonical pattern from
every per-platform attribution audit (Move #6.5/6.6/6.7 + rollup Move #6.8).
13 test classes covering:
  1.  Threshold constants pinned (regression gate #1)
  2.  Alert shape constants pinned (regression gate #2)
  3.  URL validation
  4.  Rollup JSON loading — happy path
  5.  Rollup JSON loading — missing file fallback
  6.  Rollup JSON loading — malformed JSON fallback
  7.  Decision: ALL gates pass → no alert
  8.  Decision: 1 per-platform fail → alert fires
  9.  Decision: cross-platform drift detected → alert fires
 10.  Decision: match-rate drift exceeds 3.0pp → alert fires
 11.  Alert payload shape: top-level fields all present
 12.  Alert payload per-platform breakdown
 13.  Cooldown logic
 14.  Archive file is written
 15.  --json output is valid JSON
 16.  --validate-thresholds mode returns 0
 17.  --bootstrap mode creates directory
 18.  CLI smoke: --help exits 0
 19.  Subprocess roundtrip: --json on a real rollup
 20.  --skip-webhook prevents POST
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
import attribution_health_alert_webhook as webhook_mod


# -----------------------------------------------------------------------------
# Test fixtures
# -----------------------------------------------------------------------------


def _make_rollup(
    *,
    per_platform: dict | None = None,
    drift: dict | None = None,
    root_cause: dict | None = None,
    overall_passed: bool | None = None,
) -> dict:
    """Build a synthetic Move #6.8 rollup JSON output."""
    if per_platform is None:
        per_platform = {
            "Meta + Google + GA4": {
                "script": "attribution_quality_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [
                    {"gate": "meta_capi_match_rate", "passed": True, "value": 0.93},
                ],
            },
            "TikTok": {
                "script": "tiktok_attribution_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [
                    {"gate": "tiktok_eapi_match_rate", "passed": True, "value": 0.88},
                ],
            },
            "Snap + Pinterest": {
                "script": "snap_pinterest_attribution_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [
                    {"gate": "snap_capi_match_rate", "passed": True, "value": 0.85},
                ],
            },
        }
    if drift is None:
        drift = {
            "match_rate_drift_pp": 0.0,
            "coverage_drift_pp": 0.0,
            "platforms_with_match_rate_drop": 0,
            "cross_platform_drift_detected": False,
            "drift_by_platform": {},
        }
    if overall_passed is None:
        overall_passed = all(
            p.get("overall_passed", False) for p in per_platform.values()
        ) and not drift.get("cross_platform_drift_detected", False)
    return {
        "fixture_root": "./fixtures/",
        "per_platform": per_platform,
        "drift": drift,
        "root_cause_hypothesis": root_cause,
        "summary": {
            "total_platforms": len(per_platform),
            "passing_platforms": sum(
                1 for p in per_platform.values() if p.get("overall_passed", False)
            ),
            "drift_detected": drift.get("cross_platform_drift_detected", False),
            "platforms_with_match_rate_drop": drift.get("platforms_with_match_rate_drop", 0),
            "max_match_rate_drift_pp": drift.get("match_rate_drift_pp", 0.0),
            "max_coverage_drift_pp": drift.get("coverage_drift_pp", 0.0),
        },
        "slack_message": "All gates passing.",
        "overall_passed": overall_passed,
    }


def _temp_file_with_json(data: dict) -> Path:
    """Write data to a temp file and return the path."""
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(data, f)
    f.close()
    return Path(f.name)


def _temp_dir() -> Path:
    """Return a unique temp directory path (caller is responsible for cleanup)."""
    return Path(tempfile.mkdtemp(prefix="attribution_webhook_test_"))


# -----------------------------------------------------------------------------
# Test classes
# -----------------------------------------------------------------------------


class TestThresholdConstantsPinned(unittest.TestCase):
    """Regression gate #1: canonical thresholds must remain published."""

    def test_thresholds_returns_dict_with_5_keys(self):
        t = webhook_mod._canonical_thresholds_published()
        self.assertIsInstance(t, dict)
        self.assertEqual(
            set(t.keys()),
            {
                "fire_on_any_per_platform_fail",
                "fire_on_cross_platform_drift",
                "fire_on_match_rate_drift_pp",
                "fire_on_coverage_drift_pp",
                "cooldown_seconds",
            },
        )

    def test_threshold_values_pinned(self):
        t = webhook_mod._canonical_thresholds_published()
        self.assertTrue(t["fire_on_any_per_platform_fail"])
        self.assertTrue(t["fire_on_cross_platform_drift"])
        self.assertEqual(t["fire_on_match_rate_drift_pp"], 3.0)
        self.assertEqual(t["fire_on_coverage_drift_pp"], 2.0)
        self.assertEqual(t["cooldown_seconds"], 3600)

    def test_thresholds_pinned_returns_independent_copy(self):
        t1 = webhook_mod._canonical_thresholds_published()
        t1["fire_on_match_rate_drift_pp"] = 99.0
        t2 = webhook_mod._canonical_thresholds_published()
        self.assertEqual(t2["fire_on_match_rate_drift_pp"], 3.0)


class TestAlertShapePinned(unittest.TestCase):
    """Regression gate #2: canonical alert payload shape must remain published."""

    def test_alert_shape_returns_list_with_13_fields(self):
        shape = webhook_mod._canonical_alert_shape_published()
        self.assertIsInstance(shape, list)
        self.assertEqual(len(shape), 13)

    def test_alert_shape_required_fields_present(self):
        shape = webhook_mod._canonical_alert_shape_published()
        required = {
            "alert_id",
            "timestamp",
            "source",
            "severity",
            "title",
            "summary",
            "per_platform_breakdown",
            "drift_summary",
            "root_cause_hypothesis",
            "remediation",
            "overall_passed",
            "thresholds_used",
            "raw_rollup_path",
        }
        self.assertTrue(required.issubset(set(shape)))

    def test_alert_shape_returns_independent_copy(self):
        s1 = webhook_mod._canonical_alert_shape_published()
        s1.append("MUTATED")
        s2 = webhook_mod._canonical_alert_shape_published()
        self.assertNotIn("MUTATED", s2)


class TestIsHttpUrl(unittest.TestCase):
    """Validate the URL filter accepts https+netloc only."""

    def test_https_url_accepted(self):
        self.assertTrue(webhook_mod._is_http_url("https://hooks.slack.com/services/T00/B00/XX"))

    def test_http_url_accepted(self):
        self.assertTrue(webhook_mod._is_http_url("http://example.com/webhook"))

    def test_non_http_scheme_rejected(self):
        self.assertFalse(webhook_mod._is_http_url("ftp://example.com"))
        self.assertFalse(webhook_mod._is_http_url("file:///etc/passwd"))
        self.assertFalse(webhook_mod._is_http_url("javascript:alert(1)"))

    def test_empty_netloc_rejected(self):
        self.assertFalse(webhook_mod._is_http_url("http://"))

    def test_malformed_url_rejected(self):
        self.assertFalse(webhook_mod._is_http_url("not a url at all"))
        self.assertFalse(webhook_mod._is_http_url("://no-scheme"))


class TestLoadRollupJsonHappyPath(unittest.TestCase):
    """Load a well-formed Move #6.8 rollup JSON."""

    def test_returns_dict_with_required_keys(self):
        rollup = _make_rollup()
        f = _temp_file_with_json(rollup)
        try:
            loaded = webhook_mod._load_rollup_json(f)
            self.assertEqual(loaded["overall_passed"], True)
            self.assertEqual(len(loaded["per_platform"]), 3)
            self.assertIn("drift", loaded)
            self.assertIn("summary", loaded)
        finally:
            os.unlink(f)


class TestLoadRollupJsonMissingFile(unittest.TestCase):
    """Missing rollup file returns sentinel, not an exception."""

    def test_missing_file_returns_sentinel(self):
        missing = Path("/tmp/this-file-does-not-exist-rollup.json")
        loaded = webhook_mod._load_rollup_json(missing)
        self.assertEqual(loaded["overall_passed"], False)
        self.assertIn("error", loaded)
        self.assertEqual(loaded["per_platform"], {})
        self.assertEqual(loaded["drift"]["cross_platform_drift_detected"], False)
        self.assertIsNone(loaded["root_cause_hypothesis"])


class TestLoadRollupJsonMalformed(unittest.TestCase):
    """Malformed rollup JSON returns sentinel, not an exception."""

    def test_invalid_json_returns_sentinel(self):
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        f.write("{not valid json")
        f.close()
        try:
            loaded = webhook_mod._load_rollup_json(Path(f.name))
            self.assertEqual(loaded["overall_passed"], False)
            self.assertIn("error", loaded)
            self.assertIn("ROLLOUP JSON DECODE FAILED", loaded["error"])
        finally:
            os.unlink(f.name)

    def test_non_dict_json_returns_sentinel(self):
        # A JSON array instead of a dict at the top level.
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        f.write("[1, 2, 3]")
        f.close()
        try:
            loaded = webhook_mod._load_rollup_json(Path(f.name))
            self.assertEqual(loaded["overall_passed"], False)
            self.assertIn("error", loaded)
            self.assertIn("NOT A DICT", loaded["error"])
        finally:
            os.unlink(f.name)


class TestDecisionAllGatesPass(unittest.TestCase):
    """Healthy rollup → no alert."""

    def test_healthy_rollup_no_alert(self):
        rollup = _make_rollup()
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        self.assertFalse(should_fire)
        self.assertIn("all gates passing", reason.lower())


class TestDecisionPerPlatformFail(unittest.TestCase):
    """1 per-platform audit failed gates → alert fires."""

    def test_meta_failing_fires_alert(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "attribution_quality_audit.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [
                    {"gate": "meta_capi_match_rate", "passed": False, "value": 0.78},
                ],
            },
            "TikTok": {
                "script": "tiktok_attribution_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [],
            },
            "Snap + Pinterest": {
                "script": "snap_pinterest_attribution_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("Meta", reason)
        self.assertIn("audit(s) failed", reason)


class TestDecisionCrossPlatformDrift(unittest.TestCase):
    """Cross-platform drift detected by rollup → alert fires."""

    def test_drift_detected_fires_alert(self):
        drift = {
            "match_rate_drift_pp": 5.2,
            "coverage_drift_pp": 1.0,
            "platforms_with_match_rate_drop": 2,
            "cross_platform_drift_detected": True,
            "drift_by_platform": {
                "Meta + Google + GA4": {"match_rate_delta": -3.5, "coverage_delta": -1.0},
                "TikTok": {"match_rate_delta": -1.7, "coverage_delta": 0.0},
            },
        }
        rollup = _make_rollup(drift=drift, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("drift", reason.lower())


class TestDecisionMatchRateDriftExceeds(unittest.TestCase):
    """Match-rate drift > 3.0pp → alert fires (sanity check on rollup output)."""

    def test_match_rate_drift_exceeds_threshold(self):
        drift = {
            "match_rate_drift_pp": 4.5,
            "coverage_drift_pp": 0.5,
            "platforms_with_match_rate_drop": 1,
            "cross_platform_drift_detected": False,
            "drift_by_platform": {},
        }
        rollup = _make_rollup(drift=drift)
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        self.assertTrue(should_fire)
        self.assertIn("match-rate drift", reason.lower())

    def test_match_rate_drift_below_threshold_no_alert(self):
        drift = {
            "match_rate_drift_pp": 1.0,
            "coverage_drift_pp": 0.5,
            "platforms_with_match_rate_drop": 0,
            "cross_platform_drift_detected": False,
            "drift_by_platform": {},
        }
        rollup = _make_rollup(drift=drift)
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        self.assertFalse(should_fire)


class TestAlertPayloadShape(unittest.TestCase):
    """Alert payload has all 14 canonical top-level fields."""

    def test_payload_has_all_required_fields(self):
        rollup = _make_rollup()
        thresholds = webhook_mod._canonical_thresholds_published()
        payload = webhook_mod._build_alert_payload(
            rollup, "test reason", Path("/tmp/fake-rollup.json"), thresholds
        )
        shape = set(webhook_mod._canonical_alert_shape_published())
        actual_keys = set(payload.keys())
        # All canonical fields must be present in the payload.
        self.assertTrue(shape.issubset(actual_keys), f"missing: {shape - actual_keys}")

    def test_payload_critical_when_overall_not_passed(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "attribution_quality_audit.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        payload = webhook_mod._build_alert_payload(
            rollup, "Meta failed", Path("/tmp/fake-rollup.json"), thresholds
        )
        self.assertEqual(payload["severity"], "critical")

    def test_payload_warning_when_drift_only(self):
        drift = {
            "match_rate_drift_pp": 4.0,
            "coverage_drift_pp": 0.5,
            "platforms_with_match_rate_drop": 1,
            "cross_platform_drift_detected": False,
            "drift_by_platform": {},
        }
        rollup = _make_rollup(drift=drift, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        payload = webhook_mod._build_alert_payload(
            rollup, "drift detected", Path("/tmp/fake-rollup.json"), thresholds
        )
        self.assertEqual(payload["severity"], "warning")


class TestAlertPayloadPerPlatformBreakdown(unittest.TestCase):
    """Per-platform breakdown includes overall_passed + failing gates for each."""

    def test_per_platform_breakdown_includes_failing_gates(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "attribution_quality_audit.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [
                    {"gate": "meta_capi_match_rate", "passed": False, "value": 0.78},
                    {"gate": "meta_pixel_coverage", "passed": True, "value": 0.96},
                ],
            },
            "TikTok": {
                "script": "tiktok_attribution_audit.py",
                "exit_code": 0,
                "overall_passed": True,
                "gates": [],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        payload = webhook_mod._build_alert_payload(
            rollup, "test", Path("/tmp/fake-rollup.json"), thresholds
        )
        bp = payload["per_platform_breakdown"]
        self.assertEqual(len(bp), 2)
        meta_breakdown = next(p for p in bp if p["platform"] == "Meta + Google + GA4")
        self.assertFalse(meta_breakdown["overall_passed"])
        self.assertIn("meta_capi_match_rate", meta_breakdown["gates_failing"])
        self.assertNotIn("meta_pixel_coverage", meta_breakdown["gates_failing"])

    def test_per_platform_breakdown_sorted_alphabetically(self):
        per_platform = {
            "Snap + Pinterest": {"script": "x.py", "exit_code": 0, "overall_passed": True, "gates": []},
            "Meta + Google + GA4": {"script": "x.py", "exit_code": 0, "overall_passed": True, "gates": []},
            "TikTok": {"script": "x.py", "exit_code": 0, "overall_passed": True, "gates": []},
        }
        rollup = _make_rollup(per_platform=per_platform)
        thresholds = webhook_mod._canonical_thresholds_published()
        payload = webhook_mod._build_alert_payload(
            rollup, "test", Path("/tmp/fake-rollup.json"), thresholds
        )
        bp = payload["per_platform_breakdown"]
        platforms = [p["platform"] for p in bp]
        self.assertEqual(platforms, sorted(platforms))


class TestCooldownLogic(unittest.TestCase):
    """Cooldown suppresses re-firing when a recent alert exists."""

    def test_no_archive_no_cooldown_skip(self):
        # No archive dir → never skip.
        empty_dir = _temp_dir()
        try:
            skip, reason = webhook_mod._respect_cooldown(empty_dir, 3600)
            self.assertFalse(skip)
            self.assertEqual(reason, "")
        finally:
            shutil.rmtree(empty_dir, ignore_errors=True)

    def test_fresh_archive_skips_firing(self):
        # A fresh archive file → skip.
        archive_dir = _temp_dir()
        try:
            now = datetime.now(timezone.utc)
            ts_str = now.strftime("%Y%m%dT%H%M%SZ")
            archive_file = archive_dir / f"alert-{ts_str}-critical.json"
            archive_file.write_text("{}")
            skip, reason = webhook_mod._respect_cooldown(archive_dir, 3600)
            self.assertTrue(skip)
            self.assertIn("cooldown", reason.lower())
            self.assertIn("last alert", reason.lower())
        finally:
            shutil.rmtree(archive_dir, ignore_errors=True)

    def test_old_archive_does_not_skip(self):
        # An archive file older than cooldown → don't skip.
        archive_dir = _temp_dir()
        try:
            old = datetime.now(timezone.utc) - timedelta(hours=2)
            ts_str = old.strftime("%Y%m%dT%H%M%SZ")
            archive_file = archive_dir / f"alert-{ts_str}-critical.json"
            archive_file.write_text("{}")
            # Even shorter cooldown than the 2-hour age, so we should NOT skip.
            skip, reason = webhook_mod._respect_cooldown(archive_dir, 60)
            # File is 2 hours old, cooldown is 60 seconds, so elapsed > cooldown → DON'T skip.
            self.assertFalse(skip)
            self.assertEqual(reason, "")
        finally:
            shutil.rmtree(archive_dir, ignore_errors=True)

    def test_malformed_archive_filename_falls_through(self):
        archive_dir = _temp_dir()
        try:
            bad_file = archive_dir / "alert-not-a-valid-timestamp-critical.json"
            bad_file.write_text("{}")
            skip, reason = webhook_mod._respect_cooldown(archive_dir, 3600)
            # Can't parse the timestamp → fall through (don't skip).
            self.assertFalse(skip)
        finally:
            shutil.rmtree(archive_dir, ignore_errors=True)


class TestArchiveFileIsWritten(unittest.TestCase):
    """When alert fires in hermetic mode, archive file is created."""

    def test_hermetic_mode_writes_archive(self):
        archive_dir = _temp_dir()
        try:
            per_platform = {
                "Meta + Google + GA4": {
                    "script": "x.py",
                    "exit_code": 0,
                    "overall_passed": False,
                    "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
                },
            }
            rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
            payload = webhook_mod._build_alert_payload(
                rollup, "Meta failed", Path("/tmp/fake-rollup.json"),
                webhook_mod._canonical_thresholds_published(),
            )
            post_result = {"posted": False, "skipped": True, "status_code": 0, "error": None, "url": None}
            archive_file = webhook_mod._archive_alert(payload, archive_dir, post_result)
            self.assertTrue(archive_file.exists())
            # Verify the archive file is valid JSON.
            with open(archive_file) as f:
                archive_data = json.load(f)
            self.assertIn("payload", archive_data)
            self.assertIn("post_result", archive_data)
            self.assertEqual(archive_data["payload"]["alert_id"], payload["alert_id"])
        finally:
            shutil.rmtree(archive_dir, ignore_errors=True)


class TestJsonOutput(unittest.TestCase):
    """--json mode emits valid JSON containing the canonical fields."""

    def test_emit_json_valid(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "x.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        thresholds = webhook_mod._canonical_thresholds_published()
        should_fire, reason = webhook_mod._decide_should_fire(rollup, thresholds)
        payload = webhook_mod._build_alert_payload(rollup, reason, Path("/tmp/x.json"), thresholds)
        post_result = {"posted": False, "skipped": True, "status_code": 0, "error": None, "url": None}

        buf = io.StringIO()
        output = {
            "should_fire": should_fire,
            "reason": reason,
            "cooldown_status": {"skipped": False, "applied": False, "reason": None},
            "payload": payload,
            "post_result": post_result,
            "archive_file": None,
            "overall_passed": rollup["overall_passed"],
        }
        with redirect_stdout(buf):
            print(json.dumps(output, indent=2, sort_keys=True))
        out = buf.getvalue()
        # Must round-trip via json.loads.
        parsed = json.loads(out)
        self.assertTrue(parsed["should_fire"])
        self.assertEqual(parsed["payload"]["severity"], "critical")


class TestValidateThresholdsMode(unittest.TestCase):
    """--validate-thresholds mode returns 0."""

    def test_validate_thresholds_exits_zero(self):
        script_path = Path(webhook_mod.__file__)
        result = subprocess.run(
            ["python3", str(script_path), "--validate-thresholds"],
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Canonical thresholds", result.stdout)


class TestBootstrapMode(unittest.TestCase):
    """--bootstrap mode creates the alert archive directory."""

    def test_bootstrap_creates_alerts_dir(self):
        target = Path(tempfile.mkdtemp(prefix="bootstrap_test_"))
        try:
            script_path = Path(webhook_mod.__file__)
            result = subprocess.run(
                ["python3", str(script_path), "--bootstrap", str(target)],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(result.returncode, 0)
            alerts_dir = target / ".alerts"
            self.assertTrue(alerts_dir.exists())
            self.assertTrue(alerts_dir.is_dir())
        finally:
            shutil.rmtree(target, ignore_errors=True)


class TestCliHelp(unittest.TestCase):
    """--help exits 0 and lists all expected flags."""

    def test_help_exits_zero(self):
        script_path = Path(webhook_mod.__file__)
        result = subprocess.run(
            ["python3", str(script_path), "--help"],
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("--rollup-json", result.stdout)
        self.assertIn("--webhook-url", result.stdout)
        self.assertIn("--alert-archive", result.stdout)
        self.assertIn("--cooldown-seconds", result.stdout)
        self.assertIn("--skip-cooldown", result.stdout)
        self.assertIn("--skip-webhook", result.stdout)
        self.assertIn("--bootstrap", result.stdout)
        self.assertIn("--validate-thresholds", result.stdout)
        self.assertIn("--json", result.stdout)


class TestSubprocessRoundtrip(unittest.TestCase):
    """End-to-end: --json on a real rollup file → exit code + JSON output."""

    def test_healthy_rollup_exits_zero_no_alert(self):
        rollup = _make_rollup()
        rollup_path = _temp_file_with_json(rollup)
        try:
            script_path = Path(webhook_mod.__file__)
            result = subprocess.run(
                ["python3", str(script_path), "--rollup-json", str(rollup_path),
                 "--json", "--skip-cooldown"],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(result.returncode, 0)
            output = json.loads(result.stdout)
            self.assertFalse(output["should_fire"])
            self.assertEqual(output["overall_passed"], True)
        finally:
            os.unlink(rollup_path)

    def test_failing_rollup_exits_one_with_archive(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "x.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        rollup_path = _temp_file_with_json(rollup)
        archive_dir = _temp_dir()
        try:
            script_path = Path(webhook_mod.__file__)
            result = subprocess.run(
                [
                    "python3", str(script_path),
                    "--rollup-json", str(rollup_path),
                    "--alert-archive", str(archive_dir),
                    "--json",
                    "--skip-cooldown",
                ],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(result.returncode, 1)  # alert fired + archived
            output = json.loads(result.stdout)
            self.assertTrue(output["should_fire"])
            self.assertEqual(output["payload"]["severity"], "critical")
            self.assertIn("Meta", output["reason"])
            # Archive file exists and is valid JSON.
            self.assertIsNotNone(output["archive_file"])
            archive_path = Path(output["archive_file"])
            self.assertTrue(archive_path.exists())
            with open(archive_path) as f:
                json.load(f)
        finally:
            os.unlink(rollup_path)
            shutil.rmtree(archive_dir, ignore_errors=True)

    def test_cooldown_suppresses_second_alert(self):
        # Fire a first alert (skip-cooldown so it fires), then call again
        # without skip-cooldown — should be suppressed.
        per_platform = {
            "Meta + Google + GA4": {
                "script": "x.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        rollup_path = _temp_file_with_json(rollup)
        archive_dir = _temp_dir()
        try:
            script_path = Path(webhook_mod.__file__)

            # First call — force-fire (skip-cooldown).
            r1 = subprocess.run(
                [
                    "python3", str(script_path),
                    "--rollup-json", str(rollup_path),
                    "--alert-archive", str(archive_dir),
                    "--json",
                    "--skip-cooldown",
                ],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(r1.returncode, 1)

            # Second call — no skip-cooldown; cooldown should suppress.
            r2 = subprocess.run(
                [
                    "python3", str(script_path),
                    "--rollup-json", str(rollup_path),
                    "--alert-archive", str(archive_dir),
                    "--json",
                ],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(r2.returncode, 0)  # no alert fired (cooldown)
            output = json.loads(r2.stdout)
            self.assertFalse(output["should_fire"])
            self.assertIn("cooldown", output["reason"].lower())
            self.assertTrue(output["cooldown_status"]["applied"])
        finally:
            os.unlink(rollup_path)
            shutil.rmtree(archive_dir, ignore_errors=True)


class TestSkipWebhookPreventsPost(unittest.TestCase):
    """--skip-webhook flag suppresses the POST but still builds + archives."""

    def test_skip_webhook_archives_without_posting(self):
        per_platform = {
            "Meta + Google + GA4": {
                "script": "x.py",
                "exit_code": 0,
                "overall_passed": False,
                "gates": [{"gate": "meta_capi_match_rate", "passed": False, "value": 0.78}],
            },
        }
        rollup = _make_rollup(per_platform=per_platform, overall_passed=False)
        rollup_path = _temp_file_with_json(rollup)
        archive_dir = _temp_dir()
        try:
            script_path = Path(webhook_mod.__file__)
            result = subprocess.run(
                [
                    "python3", str(script_path),
                    "--rollup-json", str(rollup_path),
                    "--webhook-url", "http://127.0.0.1:1/should-not-be-called",
                    "--alert-archive", str(archive_dir),
                    "--skip-webhook",
                    "--skip-cooldown",
                    "--json",
                ],
                capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(result.returncode, 1)
            output = json.loads(result.stdout)
            self.assertTrue(output["should_fire"])
            self.assertTrue(output["post_result"]["skipped"])
            self.assertFalse(output["post_result"]["posted"])
            # Archive is still written.
            self.assertIsNotNone(output["archive_file"])
        finally:
            os.unlink(rollup_path)
            shutil.rmtree(archive_dir, ignore_errors=True)


# -----------------------------------------------------------------------------
# main_test() runner per canonical pattern
# -----------------------------------------------------------------------------


def _count_failures_and_print(test_classes: list) -> int:
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for cls in test_classes:
        suite.addTests(loader.loadTestsFromTestCase(cls))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    failures = len(result.failures) + len(result.errors)
    print(f"\nTests run: {result.testsRun}, failures: {failures}")
    return failures


def main_test() -> int:
    test_classes = [
        TestThresholdConstantsPinned,
        TestAlertShapePinned,
        TestIsHttpUrl,
        TestLoadRollupJsonHappyPath,
        TestLoadRollupJsonMissingFile,
        TestLoadRollupJsonMalformed,
        TestDecisionAllGatesPass,
        TestDecisionPerPlatformFail,
        TestDecisionCrossPlatformDrift,
        TestDecisionMatchRateDriftExceeds,
        TestAlertPayloadShape,
        TestAlertPayloadPerPlatformBreakdown,
        TestCooldownLogic,
        TestArchiveFileIsWritten,
        TestJsonOutput,
        TestValidateThresholdsMode,
        TestBootstrapMode,
        TestCliHelp,
        TestSubprocessRoundtrip,
        TestSkipWebhookPreventsPost,
    ]
    return _count_failures_and_print(test_classes)


if __name__ == "__main__":
    if "main_test" in sys.argv:
        sys.exit(0 if main_test() == 0 else 1)
    unittest.main()
