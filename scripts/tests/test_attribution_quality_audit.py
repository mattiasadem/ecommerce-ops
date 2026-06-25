#!/usr/bin/env python3
"""
test_attribution_quality_audit.py — TDD tests for the attribution
quality audit script (Move #6.5 companion).

Run: python3 scripts/tests/test_attribution_quality_audit.py
"""

from __future__ import annotations

import io
import json
import os
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout

# Add scripts/ to path so we can import the module under test.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, SCRIPTS_DIR)

from attribution_quality_audit import (  # noqa: E402
    ACCEPTABLE_GOOGLE_EC_QUALITY,
    GATE_FIXTURE_FILES,
    MAX_DEDUP_RATIO,
    MAX_GA4_TW_REVENUE_DELTA_PCT,
    MAX_ORDER_COUNT_DELTA_PCT,
    MIN_COHORT_ROUNDTRIP_MATCH_PCT,
    MIN_DEDUP_RATIO,
    MIN_GOOGLE_EC_HASHED_EMAIL_PCT,
    MIN_META_CAPI_MATCH_RATE_PCT,
    MIN_META_COVERAGE_PCT,
    MIN_META_PIXEL_COVERAGE_PCT,
    MIN_SAMPLE_ORDERS,
    CheckReport,
    GateResult,
    bootstrap_fixtures,
    check_attribution_drift,
    check_ga4_tw_revenue_delta,
    check_google_enhanced_conversions_quality,
    check_klaviyo_tw_cohort_roundtrip,
    check_meta_capi_match_rate,
    check_meta_pixel_coverage,
    load_fixture,
    main,
    parse_args,
    render_human,
    run_all_gates,
)


# ---------- Test helpers ---------------------------------------------------------

def _valid_meta_capi_match_fixture() -> dict:
    """Return a fixture that should pass Gate A.

    Match rate = 920 / 950 = 96.8% (>= 90%)
    Dedup ratio = 1000 / 950 = 1.053 (in [0.8, 1.5])
    Coverage = 920 / 950 = 96.8% (>= 95%)
    """
    return {
        "pixel_events": 1000,
        "capi_events": 950,
        "matched_events": 920,
        "expected_orders_last_7d": 950,
    }


def _valid_meta_pixel_coverage_fixture() -> dict:
    """Return a fixture that should pass Gate C.

    Coverage = 10000 / 10500 = 95.2% (>= 95%)
    """
    return {
        "pixel_fired_count": 10000,
        "expected_pageviews": 10500,
    }


def _valid_google_enhanced_quality_fixture() -> dict:
    """Return a fixture that should pass Gate D.

    Tier = "Good" (in {Good, Excellent})
    Coverage = 85% (>= 80%)
    """
    return {
        "quality_tier": "Good",
        "hashed_email_coverage_pct": 85.0,
        "total_conversions": 1000,
        "conversions_with_hashed_email": 850,
    }


def _valid_ga4_tw_revenue_fixture() -> dict:
    """Return a fixture that should pass Gate E.

    Revenue delta = |65000 - 67500| / 67500 = 3.7% (<= 5%)
    Order delta = |950 - 950| / 950 = 0% (<= 3%)
    """
    return {
        "ga4_revenue_last_7d": 65000.0,
        "tw_revenue_last_7d": 67500.0,
        "actual_orders_last_7d": 950,
        "expected_orders_last_7d": 950,
    }


def _valid_klaviyo_tw_cohort_fixture() -> dict:
    """Return a fixture that should pass Gate F (5/5 match = 100%)."""
    return {
        "sample_orders": [
            {"order_id": "1001", "klaviyo_cohort": "Welcome Series", "tw_cohort": "Welcome Series"},
            {"order_id": "1002", "klaviyo_cohort": "SMS Welcome", "tw_cohort": "SMS Welcome"},
            {"order_id": "1003", "klaviyo_cohort": "Loyalty Member", "tw_cohort": "Loyalty Member"},
            {"order_id": "1004", "klaviyo_cohort": "Abandoned Cart", "tw_cohort": "Abandoned Cart"},
            {"order_id": "1005", "klaviyo_cohort": "Organic", "tw_cohort": "Organic"},
        ],
    }


def _valid_attribution_drift_fixture() -> dict:
    """Return a fixture that should pass Gate G.

    Match drift = |96.8 - 95.0| = 1.8pp (<= 5pp)
    Rev drift = |3.7 - 4.1| = 0.4pp (<= 5pp)
    """
    return {
        "measurement_window_days": 7,
        "drift_threshold_pct": 5.0,
        "current_match_rate_pct": 96.8,
        "previous_match_rate_pct": 95.0,
        "current_revenue_delta_pct": 3.7,
        "previous_revenue_delta_pct": 4.1,
    }


# ---------- Test runner ----------------------------------------------------------

def _run_test(name: str, fn) -> tuple[bool, str]:
    """Run a single test, return (passed, message)."""
    try:
        fn()
        return (True, f"  ✓ {name}")
    except AssertionError as e:
        return (False, f"  ✗ {name}: {e}")
    except Exception as e:
        return (False, f"  ✗ {name}: {type(e).__name__}: {e}")


def main_test() -> int:
    tests: list[tuple[str, "object"]] = []

    # -------- Test class 1: import surface --------
    def test_imports_clean():
        assert callable(check_meta_capi_match_rate)
        assert callable(check_meta_pixel_coverage)
        assert callable(check_google_enhanced_conversions_quality)
        assert callable(check_ga4_tw_revenue_delta)
        assert callable(check_klaviyo_tw_cohort_roundtrip)
        assert callable(check_attribution_drift)
        assert callable(run_all_gates)
        assert callable(bootstrap_fixtures)
        assert callable(render_human)
        assert callable(main)
        assert callable(parse_args)
    tests.append(("imports_clean", test_imports_clean))

    def test_six_gates_registered():
        assert len(GATE_FIXTURE_FILES) == 6
        assert "meta_capi_match_rate" in GATE_FIXTURE_FILES
        assert "meta_pixel_coverage" in GATE_FIXTURE_FILES
        assert "google_enhanced_conversions_quality" in GATE_FIXTURE_FILES
        assert "ga4_tw_revenue_delta" in GATE_FIXTURE_FILES
        assert "klaviyo_tw_cohort_roundtrip" in GATE_FIXTURE_FILES
        assert "attribution_drift" in GATE_FIXTURE_FILES
    tests.append(("six_gates_registered", test_six_gates_registered))

    def test_canonical_thresholds_published():
        # These thresholds are documented in the playbook; tests
        # pin them so accidental drift shows up as a test failure.
        assert MIN_META_CAPI_MATCH_RATE_PCT == 90.0
        assert MIN_META_COVERAGE_PCT == 95.0
        assert MIN_DEDUP_RATIO == 0.8
        assert MAX_DEDUP_RATIO == 1.5
        assert MIN_META_PIXEL_COVERAGE_PCT == 95.0
        assert ACCEPTABLE_GOOGLE_EC_QUALITY == {"Good", "Excellent"}
        assert MIN_GOOGLE_EC_HASHED_EMAIL_PCT == 80.0
        assert MAX_GA4_TW_REVENUE_DELTA_PCT == 5.0
        assert MAX_ORDER_COUNT_DELTA_PCT == 3.0
        assert MIN_COHORT_ROUNDTRIP_MATCH_PCT == 95.0
        assert MIN_SAMPLE_ORDERS == 5
    tests.append(("canonical_thresholds_published", test_canonical_thresholds_published))

    # -------- Test class 2: Gate A — Meta CAPI match rate --------
    def test_a_canonical_pass():
        result = check_meta_capi_match_rate(_valid_meta_capi_match_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "96.8" in result.detail
        assert "1.05" in result.detail
    tests.append(("a_canonical_pass", test_a_canonical_pass))

    def test_a_low_match_rate_fails():
        # match rate = 700 / 950 = 73.7% < 90%
        fx = _valid_meta_capi_match_fixture()
        fx["matched_events"] = 700
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "73.7%" in result.detail or "match rate" in result.detail.lower()
        assert "event_id" in result.remediation
    tests.append(("a_low_match_rate_fails", test_a_low_match_rate_fails))

    def test_a_dedup_ratio_too_high_fails():
        # pixel/capi = 2000/950 = 2.10 > 1.5
        fx = _valid_meta_capi_match_fixture()
        fx["pixel_events"] = 2000
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "dedup" in result.detail.lower()
    tests.append(("a_dedup_ratio_too_high_fails", test_a_dedup_ratio_too_high_fails))

    def test_a_dedup_ratio_too_low_fails():
        # pixel/capi = 800/1100 = 0.727 < 0.8 (dedup guard fires before match guard)
        # matched=900 <= min(800, 1100) = 800? No, 900 > 800. So lower matched.
        # Use matched=700, pixel=800, capi=1100: matched<=min(800,1100)=800 ✓
        # dedup = 800/1100 = 0.727 < 0.8 → fails
        # match = 700/950 = 73.7% < 90% → also fails (both)
        # Test asserts the dedup guard is in the failure message.
        fx = {
            "pixel_events": 800,
            "capi_events": 1100,
            "matched_events": 700,
            "expected_orders_last_7d": 950,
        }
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "dedup" in result.detail.lower()
    tests.append(("a_dedup_ratio_too_low_fails", test_a_dedup_ratio_too_low_fails))

    def test_a_zero_capi_fails():
        # No CAPI events: capi=0, pixel=950, matched=0 (must be <= min(950, 0)=0)
        # match rate = 0/950 = 0% < 90% (also fails) but the gate message
        # should still include "CAPI events = 0" via the dedup-guard branch.
        fx = {
            "pixel_events": 950,
            "capi_events": 0,
            "matched_events": 0,
            "expected_orders_last_7d": 950,
        }
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "CAPI events = 0" in result.detail
    tests.append(("a_zero_capi_fails", test_a_zero_capi_fails))

    def test_a_low_coverage_fails():
        # match = 800/950 = 84.2% < 90% (also low coverage)
        fx = _valid_meta_capi_match_fixture()
        fx["matched_events"] = 800
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
    tests.append(("a_low_coverage_fails", test_a_low_coverage_fails))

    def test_a_missing_keys_fails():
        result = check_meta_capi_match_rate({})
        assert not result.passed
        assert "Missing" in result.detail
        assert "Diagnostics" in result.remediation
    tests.append(("a_missing_keys_fails", test_a_missing_keys_fails))

    def test_a_negative_count_fails():
        fx = _valid_meta_capi_match_fixture()
        fx["matched_events"] = -5
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "Negative" in result.detail
    tests.append(("a_negative_count_fails", test_a_negative_count_fails))

    def test_a_zero_expected_orders_fails():
        fx = _valid_meta_capi_match_fixture()
        fx["expected_orders_last_7d"] = 0
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
    tests.append(("a_zero_expected_orders_fails", test_a_zero_expected_orders_fails))

    def test_a_matched_exceeds_source_fails():
        # matched=1100 > capi=950
        fx = _valid_meta_capi_match_fixture()
        fx["matched_events"] = 1100
        result = check_meta_capi_match_rate(fx)
        assert not result.passed
        assert "Matched events cannot exceed" in result.detail
    tests.append(("a_matched_exceeds_source_fails", test_a_matched_exceeds_source_fails))

    # -------- Test class 3: Gate C — Meta Pixel coverage --------
    def test_c_canonical_pass():
        result = check_meta_pixel_coverage(_valid_meta_pixel_coverage_fixture())
        assert result.passed
        assert "95.2%" in result.detail
    tests.append(("c_canonical_pass", test_c_canonical_pass))

    def test_c_low_coverage_fails():
        # 6000/10500 = 57.1%
        fx = _valid_meta_pixel_coverage_fixture()
        fx["pixel_fired_count"] = 6000
        result = check_meta_pixel_coverage(fx)
        assert not result.passed
        assert "57.1%" in result.detail
        assert "theme.liquid" in result.remediation
    tests.append(("c_low_coverage_fails", test_c_low_coverage_fails))

    def test_c_zero_pageviews_fails():
        fx = _valid_meta_pixel_coverage_fixture()
        fx["expected_pageviews"] = 0
        result = check_meta_pixel_coverage(fx)
        assert not result.passed
    tests.append(("c_zero_pageviews_fails", test_c_zero_pageviews_fails))

    def test_c_negative_count_fails():
        fx = _valid_meta_pixel_coverage_fixture()
        fx["pixel_fired_count"] = -1
        result = check_meta_pixel_coverage(fx)
        assert not result.passed
    tests.append(("c_negative_count_fails", test_c_negative_count_fails))

    def test_c_missing_keys_fails():
        result = check_meta_pixel_coverage({})
        assert not result.passed
    tests.append(("c_missing_keys_fails", test_c_missing_keys_fails))

    # -------- Test class 4: Gate D — Google Enhanced Conversions --------
    def test_d_canonical_pass():
        result = check_google_enhanced_conversions_quality(
            _valid_google_enhanced_quality_fixture()
        )
        assert result.passed
        assert "Good" in result.detail
        assert "85.0%" in result.detail
    tests.append(("d_canonical_pass", test_d_canonical_pass))

    def test_d_excellent_tier_passes():
        fx = _valid_google_enhanced_quality_fixture()
        fx["quality_tier"] = "Excellent"
        result = check_google_enhanced_conversions_quality(fx)
        assert result.passed
    tests.append(("d_excellent_tier_passes", test_d_excellent_tier_passes))

    def test_d_unavailable_tier_fails():
        fx = _valid_google_enhanced_quality_fixture()
        fx["quality_tier"] = "Unavailable"
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
        assert "Unavailable" in result.detail
        assert "user-provided data" in result.remediation or "hashed email" in result.remediation
    tests.append(("d_unavailable_tier_fails", test_d_unavailable_tier_fails))

    def test_d_needs_improvement_fails():
        fx = _valid_google_enhanced_quality_fixture()
        fx["quality_tier"] = "Needs improvement"
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
    tests.append(("d_needs_improvement_fails", test_d_needs_improvement_fails))

    def test_d_low_email_coverage_fails():
        # 70% < 80% target, even if tier is Good
        fx = _valid_google_enhanced_quality_fixture()
        fx["hashed_email_coverage_pct"] = 70.0
        fx["conversions_with_hashed_email"] = 700
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
        assert "70.0%" in result.detail
    tests.append(("d_low_email_coverage_fails", test_d_low_email_coverage_fails))

    def test_d_unknown_tier_fails():
        fx = _valid_google_enhanced_quality_fixture()
        fx["quality_tier"] = "Unknown"
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
    tests.append(("d_unknown_tier_fails", test_d_unknown_tier_fails))

    def test_d_coverage_out_of_range_fails():
        fx = _valid_google_enhanced_quality_fixture()
        fx["hashed_email_coverage_pct"] = 150.0
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
    tests.append(("d_coverage_out_of_range_fails", test_d_coverage_out_of_range_fails))

    def test_d_zero_conversions_fails():
        fx = _valid_google_enhanced_quality_fixture()
        fx["total_conversions"] = 0
        result = check_google_enhanced_conversions_quality(fx)
        assert not result.passed
    tests.append(("d_zero_conversions_fails", test_d_zero_conversions_fails))

    def test_d_missing_keys_fails():
        result = check_google_enhanced_conversions_quality({})
        assert not result.passed
    tests.append(("d_missing_keys_fails", test_d_missing_keys_fails))

    # -------- Test class 5: Gate E — GA4 ↔ TW revenue delta --------
    def test_e_canonical_pass():
        result = check_ga4_tw_revenue_delta(_valid_ga4_tw_revenue_fixture())
        assert result.passed
        assert "3.7%" in result.detail
    tests.append(("e_canonical_pass", test_e_canonical_pass))

    def test_e_high_revenue_delta_fails():
        # |50000 - 67500| / 67500 = 25.9% > 5%
        fx = _valid_ga4_tw_revenue_fixture()
        fx["ga4_revenue_last_7d"] = 50000.0
        result = check_ga4_tw_revenue_delta(fx)
        assert not result.passed
        assert "25.9%" in result.detail or "revenue delta" in result.detail.lower()
        assert "iOS14.5" in result.remediation or "GA4 is undercounting" in result.remediation
    tests.append(("e_high_revenue_delta_fails", test_e_high_revenue_delta_fails))

    def test_e_order_count_delta_fails():
        # |800 - 950| / 950 = 15.8% > 3%
        fx = _valid_ga4_tw_revenue_fixture()
        fx["actual_orders_last_7d"] = 800
        result = check_ga4_tw_revenue_delta(fx)
        assert not result.passed
        assert "order" in result.detail.lower()
    tests.append(("e_order_count_delta_fails", test_e_order_count_delta_fails))

    def test_e_zero_tw_revenue_fails():
        fx = _valid_ga4_tw_revenue_fixture()
        fx["tw_revenue_last_7d"] = 0
        result = check_ga4_tw_revenue_delta(fx)
        assert not result.passed
        assert "Triple Whale" in result.detail or "webhook" in result.detail.lower()
    tests.append(("e_zero_tw_revenue_fails", test_e_zero_tw_revenue_fails))

    def test_e_zero_expected_orders_fails():
        fx = _valid_ga4_tw_revenue_fixture()
        fx["expected_orders_last_7d"] = 0
        result = check_ga4_tw_revenue_delta(fx)
        assert not result.passed
    tests.append(("e_zero_expected_orders_fails", test_e_zero_expected_orders_fails))

    def test_e_missing_keys_fails():
        result = check_ga4_tw_revenue_delta({})
        assert not result.passed
    tests.append(("e_missing_keys_fails", test_e_missing_keys_fails))

    # -------- Test class 6: Gate F — Klaviyo ↔ TW cohort roundtrip --------
    def test_f_canonical_pass():
        result = check_klaviyo_tw_cohort_roundtrip(_valid_klaviyo_tw_cohort_fixture())
        assert result.passed
        assert "100.0%" in result.detail
        assert "Sample size: 5" in result.detail
    tests.append(("f_canonical_pass", test_f_canonical_pass))

    def test_f_one_mismatch_fails():
        # 4/5 = 80% < 95% target
        fx = _valid_klaviyo_tw_cohort_fixture()
        fx["sample_orders"][2]["tw_cohort"] = "Different Cohort"
        result = check_klaviyo_tw_cohort_roundtrip(fx)
        assert not result.passed
        assert "80.0%" in result.detail
    tests.append(("f_one_mismatch_fails", test_f_one_mismatch_fails))

    def test_f_case_insensitive_match_passes():
        # "welcome series" == "Welcome Series" (case-insensitive)
        fx = _valid_klaviyo_tw_cohort_fixture()
        fx["sample_orders"][0]["tw_cohort"] = "welcome series"
        result = check_klaviyo_tw_cohort_roundtrip(fx)
        assert result.passed
    tests.append(("f_case_insensitive_match_passes", test_f_case_insensitive_match_passes))

    def test_f_too_few_samples_fails():
        fx = _valid_klaviyo_tw_cohort_fixture()
        fx["sample_orders"] = fx["sample_orders"][:3]  # 3 < 5 minimum
        result = check_klaviyo_tw_cohort_roundtrip(fx)
        assert not result.passed
        assert "5" in result.detail and "3" in result.detail
    tests.append(("f_too_few_samples_fails", test_f_too_few_samples_fails))

    def test_f_empty_string_cohort_does_not_match():
        # 1 of 5 has empty klaviyo_cohort, so 4/5 = 80% < 95%
        fx = _valid_klaviyo_tw_cohort_fixture()
        fx["sample_orders"][0]["klaviyo_cohort"] = ""
        result = check_klaviyo_tw_cohort_roundtrip(fx)
        assert not result.passed
    tests.append(("f_empty_string_cohort_does_not_match", test_f_empty_string_cohort_does_not_match))

    def test_f_missing_sample_orders_fails():
        result = check_klaviyo_tw_cohort_roundtrip({})
        assert not result.passed
    tests.append(("f_missing_sample_orders_fails", test_f_missing_sample_orders_fails))

    def test_f_sample_orders_not_list_fails():
        result = check_klaviyo_tw_cohort_roundtrip({"sample_orders": "not a list"})
        assert not result.passed
    tests.append(("f_sample_orders_not_list_fails", test_f_sample_orders_not_list_fails))

    def test_f_malformed_orders_excluded():
        # 1 of 3 is malformed (missing keys); 2/2 valid match = 100% > 95%
        fx = {
            "sample_orders": [
                {"order_id": "1001", "klaviyo_cohort": "X", "tw_cohort": "X"},
                {"order_id": "1002"},  # malformed
                {"order_id": "1003", "klaviyo_cohort": "Y", "tw_cohort": "Y"},
            ],
        }
        result = check_klaviyo_tw_cohort_roundtrip(fx)
        assert not result.passed, "3 samples < 5 minimum should fail"
    tests.append(("f_malformed_orders_excluded", test_f_malformed_orders_excluded))

    # -------- Test class 7: Gate G — Attribution drift --------
    def test_g_canonical_pass():
        result = check_attribution_drift(_valid_attribution_drift_fixture())
        assert result.passed
        assert "1.8" in result.detail
    tests.append(("g_canonical_pass", test_g_canonical_pass))

    def test_g_high_match_drift_fails():
        # drift = |85 - 95| = 10pp > 5pp
        fx = _valid_attribution_drift_fixture()
        fx["current_match_rate_pct"] = 85.0
        result = check_attribution_drift(fx)
        assert not result.passed
        assert "match" in result.detail.lower() and "drift" in result.detail.lower()
    tests.append(("g_high_match_drift_fails", test_g_high_match_drift_fails))

    def test_g_high_revenue_drift_fails():
        # drift = |12 - 4| = 8pp > 5pp
        fx = _valid_attribution_drift_fixture()
        fx["current_revenue_delta_pct"] = 12.0
        result = check_attribution_drift(fx)
        assert not result.passed
    tests.append(("g_high_revenue_drift_fails", test_g_high_revenue_drift_fails))

    def test_g_zero_window_fails():
        fx = _valid_attribution_drift_fixture()
        fx["measurement_window_days"] = 0
        result = check_attribution_drift(fx)
        assert not result.passed
    tests.append(("g_zero_window_fails", test_g_zero_window_fails))

    def test_g_zero_threshold_fails():
        fx = _valid_attribution_drift_fixture()
        fx["drift_threshold_pct"] = 0
        result = check_attribution_drift(fx)
        assert not result.passed
    tests.append(("g_zero_threshold_fails", test_g_zero_threshold_fails))

    def test_g_missing_keys_fails():
        result = check_attribution_drift({})
        assert not result.passed
    tests.append(("g_missing_keys_fails", test_g_missing_keys_fails))

    # -------- Test class 8: run_all_gates + report orchestration --------
    def test_run_all_gates_with_valid_fixtures():
        with tempfile.TemporaryDirectory() as td:
            for filename, _ in GATE_FIXTURE_FILES.values():
                # write the corresponding valid fixture
                if "meta_capi_match" in filename:
                    fx = _valid_meta_capi_match_fixture()
                elif "meta_pixel_coverage" in filename:
                    fx = _valid_meta_pixel_coverage_fixture()
                elif "google_enhanced" in filename:
                    fx = _valid_google_enhanced_quality_fixture()
                elif "ga4_tw" in filename:
                    fx = _valid_ga4_tw_revenue_fixture()
                elif "klaviyo_tw" in filename:
                    fx = _valid_klaviyo_tw_cohort_fixture()
                elif "attribution_drift" in filename:
                    fx = _valid_attribution_drift_fixture()
                else:
                    fx = {}
                with open(os.path.join(td, filename), "w") as f:
                    json.dump(fx, f)
            report = run_all_gates(td)
            assert report.overall_passed, (
                f"expected all-pass, got failures: "
                f"{[(g.gate_name, g.detail) for g in report.gates if not g.passed]}"
            )
            assert len(report.gates) == 6
    tests.append(("run_all_gates_with_valid_fixtures", test_run_all_gates_with_valid_fixtures))

    def test_run_all_gates_missing_fixture_marks_failed():
        with tempfile.TemporaryDirectory() as td:
            # Empty directory — all gates should fail with "Fixture file missing"
            report = run_all_gates(td)
            assert not report.overall_passed
            assert len(report.gates) == 6
            for g in report.gates:
                assert not g.passed
                assert "Fixture file missing" in g.detail
    tests.append(("run_all_gates_missing_fixture_marks_failed", test_run_all_gates_missing_fixture_marks_failed))

    def test_run_all_gates_only_check_filter():
        with tempfile.TemporaryDirectory() as td:
            # Only write one fixture, only that gate runs
            fx = _valid_meta_capi_match_fixture()
            with open(os.path.join(td, "meta_capi_match.json"), "w") as f:
                json.dump(fx, f)
            report = run_all_gates(td, only_check="meta_capi_match_rate")
            assert len(report.gates) == 1
            assert report.gates[0].passed
    tests.append(("run_all_gates_only_check_filter", test_run_all_gates_only_check_filter))

    def test_render_human_contains_all_gate_names():
        report = CheckReport(
            gates=[
                GateResult(gate_name="meta_capi_match_rate", passed=True, detail="x"),
                GateResult(gate_name="meta_pixel_coverage", passed=False, detail="y", remediation="z"),
            ],
            fixture_dir="/tmp/x",
            overall_passed=False,
        )
        out = render_human(report)
        assert "meta_capi_match_rate" in out
        assert "meta_pixel_coverage" in out
        assert "1/2 gates passed" in out
        assert "→ z" in out
    tests.append(("render_human_contains_all_gate_names", test_render_human_contains_all_gate_names))

    def test_load_fixture_returns_none_for_missing_file():
        with tempfile.TemporaryDirectory() as td:
            assert load_fixture(td, "nonexistent.json") is None
    tests.append(("load_fixture_returns_none_for_missing_file", test_load_fixture_returns_none_for_missing_file))

    def test_load_fixture_returns_none_for_invalid_json():
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "bad.json")
            with open(path, "w") as f:
                f.write("{ invalid json")
            assert load_fixture(td, "bad.json") is None
    tests.append(("load_fixture_returns_none_for_invalid_json", test_load_fixture_returns_none_for_invalid_json))

    def test_load_fixture_returns_none_for_non_dict():
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "list.json")
            with open(path, "w") as f:
                json.dump([1, 2, 3], f)
            assert load_fixture(td, "list.json") is None
    tests.append(("load_fixture_returns_none_for_non_dict", test_load_fixture_returns_none_for_non_dict))

    # -------- Test class 9: bootstrap --------
    def test_bootstrap_creates_six_fixtures():
        with tempfile.TemporaryDirectory() as td:
            bootstrap_fixtures(td)
            for filename, _ in GATE_FIXTURE_FILES.values():
                path = os.path.join(td, filename)
                assert os.path.exists(path), f"missing {filename}"
                with open(path) as f:
                    data = json.load(f)
                assert isinstance(data, dict)
                assert len(data) > 0
    tests.append(("bootstrap_creates_six_fixtures", test_bootstrap_creates_six_fixtures))

    def test_bootstrap_creates_valid_passing_fixtures():
        # The bootstrapped fixtures should be canonical-pass so the operator
        # can run the audit immediately and see all-green
        with tempfile.TemporaryDirectory() as td:
            bootstrap_fixtures(td)
            report = run_all_gates(td)
            assert report.overall_passed, (
                f"bootstrap should produce all-pass fixtures, got: "
                f"{[(g.gate_name, g.detail) for g in report.gates if not g.passed]}"
            )
    tests.append(("bootstrap_creates_valid_passing_fixtures", test_bootstrap_creates_valid_passing_fixtures))

    # -------- Test class 10: CLI behavior --------
    def test_cli_default_args():
        args = parse_args([])
        assert args.fixtures_dir == "./attribution_fixtures/"
        assert args.check is None
        assert args.json is False
        assert args.bootstrap is None
    tests.append(("cli_default_args", test_cli_default_args))

    def test_cli_bootstrap_exits_zero():
        with tempfile.TemporaryDirectory() as td:
            buf = io.StringIO()
            with redirect_stdout(buf):
                rc = main(["--bootstrap", td])
            assert rc == 0
            assert "Bootstrapped 6" in buf.getvalue()
    tests.append(("cli_bootstrap_exits_zero", test_cli_bootstrap_exits_zero))

    def test_cli_check_single_gate():
        with tempfile.TemporaryDirectory() as td:
            bootstrap_fixtures(td)
            buf = io.StringIO()
            with redirect_stdout(buf):
                rc = main(["--fixtures-dir", td, "--check", "meta_capi_match_rate"])
            assert rc == 0
            assert "meta_capi_match_rate" in buf.getvalue()
    tests.append(("cli_check_single_gate", test_cli_check_single_gate))

    def test_cli_json_output_roundtrips():
        with tempfile.TemporaryDirectory() as td:
            bootstrap_fixtures(td)
            buf = io.StringIO()
            with redirect_stdout(buf):
                rc = main(["--fixtures-dir", td, "--json"])
            assert rc == 0
            data = json.loads(buf.getvalue())
            assert data["overall_passed"] is True
            assert data["summary"]["total"] == 6
            assert data["summary"]["passed"] == 6
            assert data["summary"]["failed"] == 0
    tests.append(("cli_json_output_roundtrips", test_cli_json_output_roundtrips))

    def test_cli_returns_nonzero_on_failure():
        with tempfile.TemporaryDirectory() as td:
            # Empty directory = all gates fail
            buf = io.StringIO()
            with redirect_stdout(buf):
                rc = main(["--fixtures-dir", td])
            assert rc == 1
    tests.append(("cli_returns_nonzero_on_failure", test_cli_returns_nonzero_on_failure))

    def test_subprocess_roundtrip_canonical():
        # Real subprocess invocation: bootstraps + runs end-to-end
        with tempfile.TemporaryDirectory() as td:
            bootstrap = subprocess.run(
                ["python3", os.path.join(SCRIPTS_DIR, "attribution_quality_audit.py"),
                 "--bootstrap", td],
                capture_output=True, text=True,
            )
            assert bootstrap.returncode == 0
            run = subprocess.run(
                ["python3", os.path.join(SCRIPTS_DIR, "attribution_quality_audit.py"),
                 "--fixtures-dir", td, "--json"],
                capture_output=True, text=True,
            )
            assert run.returncode == 0
            data = json.loads(run.stdout)
            assert data["overall_passed"] is True
    tests.append(("subprocess_roundtrip_canonical", test_subprocess_roundtrip_canonical))

    # -------- Test class 11: GateResult / CheckReport dataclasses --------
    def test_gate_result_to_dict():
        g = GateResult(gate_name="x", passed=True, detail="d", remediation="r")
        d = g.to_dict()
        assert d == {"gate": "x", "passed": True, "detail": "d", "remediation": "r"}
    tests.append(("gate_result_to_dict", test_gate_result_to_dict))

    def test_check_report_to_dict():
        report = CheckReport(
            gates=[GateResult(gate_name="a", passed=True, detail="d")],
            fixture_dir="/tmp",
            overall_passed=True,
        )
        d = report.to_dict()
        assert d["fixture_dir"] == "/tmp"
        assert d["overall_passed"] is True
        assert d["summary"] == {"total": 1, "passed": 1, "failed": 0}
        assert len(d["gates"]) == 1
    tests.append(("check_report_to_dict", test_check_report_to_dict))

    # -------- Run all tests --------
    results = []
    for name, fn in tests:
        passed, msg = _run_test(name, fn)
        results.append((passed, msg))
        print(msg)
    total = len(results)
    passed_count = sum(1 for p, _ in results if p)
    print()
    print(f"Summary: {passed_count}/{total} tests passed")
    if passed_count == total:
        print("ALL PASS")
        return 0
    else:
        print("SOME FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main_test())
