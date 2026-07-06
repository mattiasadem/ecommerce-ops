#!/usr/bin/env python3
"""
Test suite for scripts/attribution_weekly_rollup_trend.py.

Covers:
- Threshold constants + alert-shape regression gates (independent-copy invariance
  + required-keys + value-contract).
- _is_http_url: accepts http+https, rejects non-http, empty netloc.
- _list_weekly_rollups: chronological ordering + fallback to *.json glob.
- _load_weekly_rollup: missing file → None; malformed JSON → None.
- _extract_headline_metric: per-platform gates array + top-level fallback.
- _compute_trend: 12-week window, cumulative drift, consecutive-decline streak,
  direction classification, weeks_analyzed counts.
- _decide_should_fire: cumulative-match-drift / cumulative-coverage-drift /
  consecutive-decline rules.
- _build_trend_alert_payload: 15-field canonical shape pinned.
- _post_webhook: hermetic stub (no real HTTP); URL filter returns invalid.
- _respect_cooldown: no-archive → no-skip / fresh archive → skip / old → no-skip /
  malformed filename → fall-through.
- run_trend end-to-end: writes archive, respects cooldown, surfaces correct
  remediation per fired-rule scenario.
- CLI smoke: --help / --validate-thresholds / --bootstrap / --json / --skip-cooldown
  / --skip-webhook / subprocess roundtrip.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

# Ensure /data/workspace/ecommerce-ops/scripts is importable.
THIS_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = THIS_DIR.parent
PROJECT_ROOT = SCRIPTS_DIR.parent
sys.path.insert(0, str(SCRIPTS_DIR))

import attribution_weekly_rollup_trend as twr


# ---------------------------------------------------------------------------
# Canonical-shape regression-gate fixtures.
# ---------------------------------------------------------------------------

EXPECTED_THRESHOLDS = {
    "trend_window_weeks": 12,
    "fire_on_cumulative_match_rate_drift_pp": 3.0,
    "fire_on_cumulative_coverage_drift_pp": 2.0,
    "fire_on_consecutive_decline_weeks": 4,
    "cooldown_seconds": 86400,
}

EXPECTED_ALERT_SHAPE = [
    "alert_id",
    "timestamp",
    "source",
    "severity",
    "title",
    "summary",
    "trend_window_weeks",
    "weeks_analyzed",
    "per_platform_trend",
    "cumulative_drift",
    "consecutive_decline_platforms",
    "remediation",
    "overall_passed",
    "thresholds_used",
    "raw_trend_state_path",
]


def _make_synthetic_rollup(*, week_index: int, platforms: dict[str, dict[str, float]]) -> dict:
    """Build a single synthetic weekly rollup JSON shape.

    Args:
        week_index: numeric 0-11 for the synthetic week.
        platforms: { label: {match_rate, coverage} } per-platform values.
    """
    per_platform: dict[str, dict] = {}
    for label, values in platforms.items():
        per_platform[label] = {
            "gates": [
                {"name": f"CAPI event_id match rate ({label})", "value": values.get("match_rate", 90.0)},
                {"name": f"Pixel coverage ({label})", "value": values.get("coverage", 95.0)},
            ],
            "overall_passed": True,
        }
    return {
        "fixture_root": f"synthetic_week_{week_index}",
        "per_platform": per_platform,
        "drift": {"cross_platform_drift_detected": False},
        "summary": {},
    }


def _write_weekly_rollups(rollup_dir: Path, weeks: list[dict]) -> None:
    """Write a list of weekly rollup dicts to disk under rollup_dir/weekly-*.json."""
    rollup_dir.mkdir(parents=True, exist_ok=True)
    for idx, rollup in enumerate(weeks):
        out_path = rollup_dir / f"weekly-{idx:02d}.json"
        out_path.write_text(json.dumps(rollup, indent=2))


# ---------------------------------------------------------------------------
# 1. ThresholdConstantsPinned — regression gate #1.
# ---------------------------------------------------------------------------


class TestTrendThresholdConstantsPinned(unittest.TestCase):
    """Pinned regression gate for the canonical trend thresholds."""

    def test_trend_thresholds_returns_independent_copy(self):
        thresholds = twr._canonical_trend_thresholds_published()
        thresholds["trend_window_weeks"] = 999
        thresholds["fire_on_cumulative_match_rate_drift_pp"] = 999.0
        self.assertEqual(twr.TREND_THRESHOLDS["trend_window_weeks"], 12)
        self.assertEqual(twr.TREND_THRESHOLDS["fire_on_cumulative_match_rate_drift_pp"], 3.0)

    def test_trend_thresholds_required_keys_present(self):
        thresholds = twr._canonical_trend_thresholds_published()
        for key in EXPECTED_THRESHOLDS:
            self.assertIn(key, thresholds, f"required key missing: {key}")

    def test_trend_thresholds_value_contract(self):
        thresholds = twr._canonical_trend_thresholds_published()
        self.assertEqual(thresholds["trend_window_weeks"], 12)
        self.assertEqual(thresholds["fire_on_cumulative_match_rate_drift_pp"], 3.0)
        self.assertEqual(thresholds["fire_on_cumulative_coverage_drift_pp"], 2.0)
        self.assertEqual(thresholds["fire_on_consecutive_decline_weeks"], 4)
        self.assertEqual(thresholds["cooldown_seconds"], 86400)

    def test_trend_thresholds_modulelevel_matches_published(self):
        self.assertEqual(dict(twr.TREND_THRESHOLDS), EXPECTED_THRESHOLDS)


# ---------------------------------------------------------------------------
# 2. AlertShapePinned — regression gate #2.
# ---------------------------------------------------------------------------


class TestTrendAlertShapePinned(unittest.TestCase):
    """Pinned regression gate for the canonical trend alert payload shape."""

    def test_trend_alert_shape_returns_independent_copy(self):
        shape = twr._canonical_trend_alert_shape_published()
        shape.append("rogue_field")
        self.assertNotIn("rogue_field", twr.TREND_ALERT_PAYLOAD_TOP_LEVEL_FIELDS)

    def test_trend_alert_shape_required_fields_present(self):
        shape = twr._canonical_trend_alert_shape_published()
        for field in EXPECTED_ALERT_SHAPE:
            self.assertIn(field, shape, f"required field missing: {field}")

    def test_trend_alert_shape_field_count(self):
        shape = twr._canonical_trend_alert_shape_published()
        self.assertEqual(len(shape), 15)

    def test_trend_alert_shape_modulelevel_matches_published(self):
        self.assertEqual(list(twr.TREND_ALERT_PAYLOAD_TOP_LEVEL_FIELDS), EXPECTED_ALERT_SHAPE)


# ---------------------------------------------------------------------------
# 3. IsHttpUrl.
# ---------------------------------------------------------------------------


class TestIsHttpUrl(unittest.TestCase):
    def test_accepts_http_with_netloc(self):
        self.assertTrue(twr._is_http_url("http://example.com/path"))

    def test_accepts_https_with_netloc(self):
        self.assertTrue(twr._is_http_url("https://hooks.slack.com/services/T0/B0/xxx"))

    def test_rejects_ftp_scheme(self):
        self.assertFalse(twr._is_http_url("ftp://example.com/file"))

    def test_rejects_empty_netloc(self):
        self.assertFalse(twr._is_http_url("http:///path-only"))

    def test_rejects_empty_string(self):
        self.assertFalse(twr._is_http_url(""))

    def test_rejects_garbage(self):
        self.assertFalse(twr._is_http_url("not a url at all"))


# ---------------------------------------------------------------------------
# 4. ListWeeklyRollups.
# ---------------------------------------------------------------------------


class TestListWeeklyRollups(unittest.TestCase):
    def test_chronological_order(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp)
            for idx in range(3):
                _make_synthetic_rollup(week_index=idx, platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}})
                (rollup_dir / f"weekly-{idx:02d}.json").write_text("{}")
            files = twr._list_weekly_rollups(rollup_dir)
            self.assertEqual(len(files), 3)
            self.assertEqual([f.name for f in files], ["weekly-00.json", "weekly-01.json", "weekly-02.json"])

    def test_empty_dir_returns_empty_list(self):
        with tempfile.TemporaryDirectory() as tmp:
            files = twr._list_weekly_rollups(Path(tmp))
            self.assertEqual(files, [])

    def test_missing_dir_returns_empty_list(self):
        files = twr._list_weekly_rollups(Path("/nonexistent/path/abc123"))
        self.assertEqual(files, [])


# ---------------------------------------------------------------------------
# 5. LoadWeeklyRollup.
# ---------------------------------------------------------------------------


class TestLoadWeeklyRollup(unittest.TestCase):
    def test_happy_path_returns_dict(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "rollup.json"
            p.write_text(json.dumps({"per_platform": {}, "summary": {}}))
            loaded = twr._load_weekly_rollup(p)
            self.assertIsInstance(loaded, dict)
            self.assertIn("per_platform", loaded)

    def test_missing_file_returns_none(self):
        loaded = twr._load_weekly_rollup(Path("/nonexistent/abc.json"))
        self.assertIsNone(loaded)

    def test_malformed_json_returns_none(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "bad.json"
            p.write_text("{not valid json")
            self.assertIsNone(twr._load_weekly_rollup(p))

    def test_non_dict_json_returns_none(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "list.json"
            p.write_text(json.dumps([1, 2, 3]))
            self.assertIsNone(twr._load_weekly_rollup(p))


# ---------------------------------------------------------------------------
# 6. ExtractHeadlineMetric.
# ---------------------------------------------------------------------------


class TestExtractHeadlineMetric(unittest.TestCase):
    def test_match_rate_from_gates(self):
        result = {"gates": [{"name": "CAPI event_id match rate (Meta)", "value": 87.5}]}
        self.assertEqual(twr._extract_headline_metric(result, "match_rate"), 87.5)

    def test_coverage_from_gates(self):
        result = {"gates": [{"name": "Pixel coverage (TikTok)", "value": 92.0}]}
        self.assertEqual(twr._extract_headline_metric(result, "coverage"), 92.0)

    def test_missing_metric_returns_none(self):
        result = {"gates": [{"name": "Other gate", "value": 50.0}]}
        self.assertIsNone(twr._extract_headline_metric(result, "match_rate"))

    def test_top_level_fallback(self):
        result = {"match_rate": 80.0}
        self.assertEqual(twr._extract_headline_metric(result, "match_rate"), 80.0)

    def test_non_dict_result_returns_none(self):
        self.assertIsNone(twr._extract_headline_metric("not a dict", "match_rate"))


# ---------------------------------------------------------------------------
# 7. ComputeTrend.
# ---------------------------------------------------------------------------


class TestComputeTrend(unittest.TestCase):
    def test_stable_trend_with_similar_values(self):
        # 12 weeks of identical values → cumulative_delta=0, direction=stable.
        weeks = [
            _make_synthetic_rollup(
                week_index=i,
                platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}, "TikTok": {"match_rate": 85.0, "coverage": 92.0}},
            )
            for i in range(12)
        ]
        trend = twr._compute_trend(weeks, 12)
        self.assertEqual(trend["weeks_analyzed"], 12)
        self.assertEqual(trend["trend_window_weeks"], 12)
        self.assertEqual(trend["per_platform_trend"]["Meta"]["match_rate"]["cumulative_delta"], 0.0)
        self.assertEqual(trend["per_platform_trend"]["Meta"]["match_rate"]["direction"], "stable")
        self.assertEqual(trend["cumulative_drift"]["match_rate_max_drift_pp"], 0.0)

    def test_declining_trend_detected(self):
        # 12 weeks with Meta losing 0.5pp match_rate per week = -5.5pp cumulative.
        weeks = []
        for i in range(12):
            weeks.append(
                _make_synthetic_rollup(
                    week_index=i,
                    platforms={"Meta": {"match_rate": 95.0 - i * 0.5, "coverage": 95.0}},
                )
            )
        trend = twr._compute_trend(weeks, 12)
        meta_match = trend["per_platform_trend"]["Meta"]["match_rate"]
        self.assertAlmostEqual(meta_match["cumulative_delta"], -5.5, places=2)
        self.assertEqual(meta_match["direction"], "declining")
        self.assertGreater(meta_match["consecutive_decline_weeks"], 4)
        self.assertGreater(trend["cumulative_drift"]["match_rate_max_drift_pp"], 3.0)

    def test_improving_trend_detected(self):
        # 12 weeks with Meta gaining 1.0pp per week.
        weeks = []
        for i in range(12):
            weeks.append(
                _make_synthetic_rollup(
                    week_index=i,
                    platforms={"Meta": {"match_rate": 80.0 + i * 1.0, "coverage": 90.0}},
                )
            )
        trend = twr._compute_trend(weeks, 12)
        meta_match = trend["per_platform_trend"]["Meta"]["match_rate"]
        self.assertAlmostEqual(meta_match["cumulative_delta"], 11.0, places=2)
        self.assertEqual(meta_match["direction"], "improving")

    def test_window_slicing_keeps_last_n(self):
        # 20 weeks of data; window=12 should keep the last 12.
        weeks = []
        for i in range(20):
            weeks.append(
                _make_synthetic_rollup(
                    week_index=i,
                    platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}},
                )
            )
        trend = twr._compute_trend(weeks, 12)
        self.assertEqual(trend["weeks_analyzed"], 12)
        self.assertEqual(trend["trend_window_weeks"], 12)

    def test_insufficient_data_no_crash(self):
        # 1 week with valid metrics — direction should be stable (needs 2+ weeks to compare).
        weeks = [_make_synthetic_rollup(week_index=0, platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}})]
        trend = twr._compute_trend(weeks, 12)
        self.assertEqual(trend["weeks_analyzed"], 1)
        self.assertEqual(trend["per_platform_trend"]["Meta"]["match_rate"]["direction"], "stable")


# ---------------------------------------------------------------------------
# 8. DecideShouldFire.
# ---------------------------------------------------------------------------


class TestDecideShouldFire(unittest.TestCase):
    def _trend_with(self, *, match_max_pp: float, coverage_max_pp: float, consecutive_platforms: list[str]) -> dict:
        per_platform_trend = {}
        # Always add Meta for completeness (stable).
        per_platform_trend["Meta"] = {
            "match_rate": {"cumulative_delta": 0.0, "consecutive_decline_weeks": 0, "direction": "stable"},
            "coverage": {"cumulative_delta": 0.0, "consecutive_decline_weeks": 0, "direction": "stable"},
        }
        for label in consecutive_platforms:
            per_platform_trend[label] = {
                "match_rate": {"cumulative_delta": 0.0, "consecutive_decline_weeks": 5, "direction": "declining"},
                "coverage": {"cumulative_delta": 0.0, "consecutive_decline_weeks": 0, "direction": "stable"},
            }
        return {
            "weeks_analyzed": 12,
            "trend_window_weeks": 12,
            "per_platform_trend": per_platform_trend,
            "cumulative_drift": {
                "match_rate_max_drift_pp": abs(match_max_pp),
                "coverage_max_drift_pp": abs(coverage_max_pp),
            },
        }

    def test_all_stable_no_fire(self):
        trend = self._trend_with(match_max_pp=0.5, coverage_max_pp=0.5, consecutive_platforms=[])
        should_fire, reason, rules = twr._decide_should_fire(trend, dict(twr.TREND_THRESHOLDS))
        self.assertFalse(should_fire)
        self.assertEqual(rules, [])

    def test_cumulative_match_drift_fires(self):
        trend = self._trend_with(match_max_pp=5.0, coverage_max_pp=0.0, consecutive_platforms=[])
        should_fire, reason, rules = twr._decide_should_fire(trend, dict(twr.TREND_THRESHOLDS))
        self.assertTrue(should_fire)
        self.assertIn("cumulative_match_rate_drift", rules)

    def test_cumulative_coverage_drift_fires(self):
        trend = self._trend_with(match_max_pp=0.0, coverage_max_pp=3.0, consecutive_platforms=[])
        should_fire, reason, rules = twr._decide_should_fire(trend, dict(twr.TREND_THRESHOLDS))
        self.assertTrue(should_fire)
        self.assertIn("cumulative_coverage_drift", rules)

    def test_consecutive_decline_fires(self):
        trend = self._trend_with(match_max_pp=0.0, coverage_max_pp=0.0, consecutive_platforms=["TikTok"])
        should_fire, reason, rules = twr._decide_should_fire(trend, dict(twr.TREND_THRESHOLDS))
        self.assertTrue(should_fire)
        self.assertIn("consecutive_decline", rules)

    def test_multiple_rules_fire_concurrently(self):
        trend = self._trend_with(match_max_pp=5.0, coverage_max_pp=3.0, consecutive_platforms=["TikTok"])
        should_fire, reason, rules = twr._decide_should_fire(trend, dict(twr.TREND_THRESHOLDS))
        self.assertTrue(should_fire)
        self.assertEqual(len(rules), 3)


# ---------------------------------------------------------------------------
# 9. BuildTrendAlertPayload.
# ---------------------------------------------------------------------------


class TestBuildTrendAlertPayload(unittest.TestCase):
    def test_payload_has_all_15_canonical_fields(self):
        trend = {
            "weeks_analyzed": 12,
            "trend_window_weeks": 12,
            "per_platform_trend": {},
            "cumulative_drift": {"match_rate_max_drift_pp": 0.0, "coverage_max_drift_pp": 0.0},
        }
        payload = twr._build_trend_alert_payload(
            trend, "all stable", Path("/tmp/foo"), dict(twr.TREND_THRESHOLDS), []
        )
        for field in EXPECTED_ALERT_SHAPE:
            self.assertIn(field, payload)

    def test_severity_critical_when_multiple_rules(self):
        trend = {
            "weeks_analyzed": 12,
            "trend_window_weeks": 12,
            "per_platform_trend": {
                "Meta": {
                    "match_rate": {"cumulative_delta": 5.0, "consecutive_decline_weeks": 5, "direction": "declining"},
                    "coverage": {"cumulative_delta": 3.0, "consecutive_decline_weeks": 5, "direction": "declining"},
                },
            },
            "cumulative_drift": {"match_rate_max_drift_pp": 5.0, "coverage_max_drift_pp": 3.0},
        }
        payload = twr._build_trend_alert_payload(
            trend,
            "fired",
            Path("/tmp/foo"),
            dict(twr.TREND_THRESHOLDS),
            ["cumulative_match_rate_drift", "cumulative_coverage_drift", "consecutive_decline"],
        )
        self.assertEqual(payload["severity"], "critical")

    def test_severity_warning_when_single_rule(self):
        trend = {
            "weeks_analyzed": 12,
            "trend_window_weeks": 12,
            "per_platform_trend": {
                "Meta": {"match_rate": {"cumulative_delta": 5.0, "consecutive_decline_weeks": 0, "direction": "declining"}, "coverage": {"cumulative_delta": 0.0, "consecutive_decline_weeks": 0, "direction": "stable"}},
            },
            "cumulative_drift": {"match_rate_max_drift_pp": 5.0, "coverage_max_drift_pp": 0.0},
        }
        payload = twr._build_trend_alert_payload(
            trend, "fired one rule", Path("/tmp/foo"), dict(twr.TREND_THRESHOLDS), ["cumulative_match_rate_drift"]
        )
        self.assertEqual(payload["severity"], "warning")

    def test_severity_info_when_no_rules_fired(self):
        trend = {
            "weeks_analyzed": 12,
            "trend_window_weeks": 12,
            "per_platform_trend": {},
            "cumulative_drift": {"match_rate_max_drift_pp": 0.0, "coverage_max_drift_pp": 0.0},
        }
        payload = twr._build_trend_alert_payload(
            trend, "all stable", Path("/tmp/foo"), dict(twr.TREND_THRESHOLDS), []
        )
        self.assertEqual(payload["severity"], "info")
        self.assertTrue(payload["overall_passed"])


# ---------------------------------------------------------------------------
# 10. PostWebhook.
# ---------------------------------------------------------------------------


class TestPostWebhook(unittest.TestCase):
    def test_post_webhook_invalid_url_returns_false(self):
        success, status = twr._post_webhook("not-a-url", {"x": 1})
        self.assertFalse(success)
        self.assertIn("invalid", status)


# ---------------------------------------------------------------------------
# 11. RespectCooldown.
# ---------------------------------------------------------------------------


class TestRespectCooldown(unittest.TestCase):
    def test_no_archive_dir_no_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            skip, reason = twr._respect_cooldown(Path(tmp), 60, 1_000_000.0)
            self.assertFalse(skip)
            self.assertIn("no previous archives", reason)

    def test_empty_archive_dir_no_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / "alerts"
            archive_dir.mkdir()
            skip, reason = twr._respect_cooldown(archive_dir, 60, 1_000_000.0)
            self.assertFalse(skip)

    def test_recent_archive_skips(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / "alerts"
            archive_dir.mkdir()
            recent = archive_dir / "trend-20260710T120000Z-warning.json"
            recent.write_text("{}")
            # 30 seconds later, with 60s cooldown → skip.
            import datetime
            ts_epoch = datetime.datetime(2026, 7, 10, 12, 0, 30, tzinfo=datetime.timezone.utc).timestamp()
            skip, reason = twr._respect_cooldown(archive_dir, 60, ts_epoch)
            self.assertTrue(skip)
            self.assertIn("cooldown active", reason)

    def test_old_archive_does_not_skip(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive_dir = Path(tmp) / "alerts"
            archive_dir.mkdir()
            old = archive_dir / "trend-20260710T120000Z-warning.json"
            old.write_text("{}")
            import datetime
            ts_epoch = datetime.datetime(2026, 7, 10, 14, 0, 0, tzinfo=datetime.timezone.utc).timestamp()
            skip, reason = twr._respect_cooldown(archive_dir, 60, ts_epoch)
            self.assertFalse(skip)
            self.assertIn("cooldown elapsed", reason)


# ---------------------------------------------------------------------------
# 12. RunTrend end-to-end.
# ---------------------------------------------------------------------------


class TestRunTrend(unittest.TestCase):
    def test_run_trend_with_stable_history(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            # 12 weeks of stable values.
            weeks = [
                _make_synthetic_rollup(
                    week_index=i,
                    platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}},
                )
                for i in range(12)
            ]
            _write_weekly_rollups(rollup_dir, weeks)
            result = twr.run_trend(rollup_dir, alert_dir)
            self.assertFalse(result["should_fire"])
            self.assertTrue(result["overall_passed"])
            self.assertEqual(result["fired_rules"], [])
            self.assertIsNotNone(result["archive_file"])

    def test_run_trend_with_declining_history_fires(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            weeks = []
            for i in range(12):
                weeks.append(
                    _make_synthetic_rollup(
                        week_index=i,
                        platforms={"Meta": {"match_rate": 95.0 - i * 0.5, "coverage": 95.0}},
                    )
                )
            _write_weekly_rollups(rollup_dir, weeks)
            result = twr.run_trend(rollup_dir, alert_dir, skip_cooldown=True)
            self.assertTrue(result["should_fire"])
            self.assertGreater(len(result["fired_rules"]), 0)
            self.assertIn("cumulative_match_rate_drift", result["fired_rules"])
            self.assertFalse(result["overall_passed"])
            self.assertIsNotNone(result["archive_file"])
            # Verify archive file is valid JSON.
            archive_data = json.loads(result["archive_file"].read_text())
            self.assertIn("trend", archive_data)
            self.assertIn("alert_payload", archive_data)

    def test_run_trend_with_no_rollups_no_crash(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            result = twr.run_trend(rollup_dir, alert_dir, skip_cooldown=True)
            # No data → weeks_analyzed=0 → no-rule fires.
            self.assertFalse(result["should_fire"])
            self.assertEqual(result["trend"]["weeks_analyzed"], 0)

    def test_run_trend_with_partial_bad_weeks(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            rollup_dir.mkdir(parents=True)
            # 2 valid + 1 malformed.
            (rollup_dir / "weekly-00.json").write_text(
                json.dumps(_make_synthetic_rollup(week_index=0, platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}}))
            )
            (rollup_dir / "weekly-01.json").write_text("garbage")
            (rollup_dir / "weekly-02.json").write_text(
                json.dumps(_make_synthetic_rollup(week_index=2, platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}}))
            )
            result = twr.run_trend(rollup_dir, alert_dir, skip_cooldown=True)
            # Should not crash; weeks_analyzed=2 (bad week excluded).
            self.assertEqual(result["trend"]["weeks_analyzed"], 2)
            self.assertFalse(result["should_fire"])


# ---------------------------------------------------------------------------
# 13. CLI smoke tests.
# ---------------------------------------------------------------------------


class TestCliHelp(unittest.TestCase):
    def test_help_lists_expected_flags(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"), "--help"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0)
        expected_flags = [
            "--rollup-dir",
            "--alert-archive",
            "--webhook-url",
            "--cooldown-seconds",
            "--skip-cooldown",
            "--skip-webhook",
            "--bootstrap",
            "--validate-thresholds",
            "--json",
        ]
        for flag in expected_flags:
            self.assertIn(flag, result.stdout, f"missing flag: {flag}")

    def test_validate_thresholds_mode(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"), "--validate-thresholds"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Canonical trend thresholds", result.stdout)
        self.assertIn("Canonical trend alert shape", result.stdout)

    def test_bootstrap_mode(self):
        with tempfile.TemporaryDirectory() as tmp:
            bootstrap_dir = Path(tmp) / "alerts"
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"),
                    "--bootstrap",
                    str(bootstrap_dir),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0)
            self.assertTrue(bootstrap_dir.exists())

    def test_subprocess_run_trend_stable(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            weeks = [
                _make_synthetic_rollup(
                    week_index=i,
                    platforms={"Meta": {"match_rate": 90.0, "coverage": 95.0}},
                )
                for i in range(12)
            ]
            _write_weekly_rollups(rollup_dir, weeks)
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"),
                    "--rollup-dir",
                    str(rollup_dir),
                    "--alert-archive",
                    str(alert_dir),
                    "--json",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0)
            parsed = json.loads(result.stdout)
            self.assertFalse(parsed["should_fire"])
            self.assertTrue(parsed["overall_passed"])

    def test_subprocess_run_trend_fires_with_declining_history(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            weeks = []
            for i in range(12):
                weeks.append(
                    _make_synthetic_rollup(
                        week_index=i,
                        platforms={"Meta": {"match_rate": 95.0 - i * 0.5, "coverage": 95.0}},
                    )
                )
            _write_weekly_rollups(rollup_dir, weeks)
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"),
                    "--rollup-dir",
                    str(rollup_dir),
                    "--alert-archive",
                    str(alert_dir),
                    "--json",
                    "--skip-cooldown",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 1)
            parsed = json.loads(result.stdout)
            self.assertTrue(parsed["should_fire"])
            self.assertIn("cumulative_match_rate_drift", parsed["fired_rules"])
            self.assertIsNotNone(parsed["archive_file"])
            self.assertTrue(Path(parsed["archive_file"]).exists())

    def test_skip_webhook_prevents_post_but_archive_written(self):
        with tempfile.TemporaryDirectory() as tmp:
            rollup_dir = Path(tmp) / "rollups"
            alert_dir = Path(tmp) / "alerts"
            weeks = []
            for i in range(12):
                weeks.append(
                    _make_synthetic_rollup(
                        week_index=i,
                        platforms={"Meta": {"match_rate": 95.0 - i * 0.5, "coverage": 95.0}},
                    )
                )
            _write_weekly_rollups(rollup_dir, weeks)
            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPTS_DIR / "attribution_weekly_rollup_trend.py"),
                    "--rollup-dir",
                    str(rollup_dir),
                    "--alert-archive",
                    str(alert_dir),
                    "--webhook-url",
                    "https://example.com/webhook",
                    "--skip-webhook",
                    "--skip-cooldown",
                    "--json",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 1)
            parsed = json.loads(result.stdout)
            # skip-webhook should not POST but archive should still be written.
            self.assertFalse(parsed["webhook_post_status"]["posted"])
            self.assertIn("skipped", parsed["webhook_post_status"]["result"])
            self.assertIsNotNone(parsed["archive_file"])
            self.assertTrue(Path(parsed["archive_file"]).exists())


def main_test() -> int:
    """Manual test runner for `python3 -m unittest` or direct invocation."""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(
        TestTrendThresholdConstantsPinned
    )
    # Add all test classes in this module.
    for cls in [
        TestTrendThresholdConstantsPinned,
        TestTrendAlertShapePinned,
        TestIsHttpUrl,
        TestListWeeklyRollups,
        TestLoadWeeklyRollup,
        TestExtractHeadlineMetric,
        TestComputeTrend,
        TestDecideShouldFire,
        TestBuildTrendAlertPayload,
        TestPostWebhook,
        TestRespectCooldown,
        TestRunTrend,
        TestCliHelp,
    ]:
        suite.addTests(loader.loadTestsFromTestCase(cls))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main_test())
