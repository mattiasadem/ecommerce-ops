#!/usr/bin/env python3
"""
test_snap_pinterest_attribution_audit.py - TDD tests for the Snap + Pinterest
attribution quality audit script (Move #6.7 companion).

Spec summary (for fast re-derivation during debugging):
  Snap canonical thresholds:
    - Gate A: match_rate >= 80%, dedup in [0.7, 1.5], coverage >= 92%
    - Gate C: pixel_coverage >= 88%
    - Gate D: emq_coverage_pct >= 70%
  Pinterest canonical thresholds:
    - Gate A': match_rate >= 85%, dedup in [0.7, 1.5], coverage >= 93%
    - Gate C': tag_coverage >= 85%
    - Gate D': enhanced_match_coverage_pct >= 75%
  Bootstrap values:
    - Snap CAPI: matched=855, expected=920, pixel=930, capi=880
      -> 92.9% match rate (>=80%), 1.057 dedup (in [0.7, 1.5]), 92.9% coverage (>=92%)
    - Snap Pixel: 9000/10000 = 90.0% (>=88%)
    - Snap EMQ: 660/880 = 75.0% (>=70%)
    - Pinterest CAPI: matched=845, expected=900, pixel=940, capi=890
      -> 93.9% match rate (>=85%), 1.056 dedup, 93.9% coverage (>=93%)
    - Pinterest Tag: 8800/10000 = 88.0% (>=85%)
    - Pinterest EM: 712/890 = 80.0% (>=75%)

Run: python3 scripts/tests/test_snap_pinterest_attribution_audit.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys

# Add scripts/ to path so we can import the module under test.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, SCRIPTS_DIR)

from snap_pinterest_attribution_audit import (  # noqa: E402
    GATE_FIXTURE_FILES,
    MAX_PINTEREST_DEDUP_RATIO,
    MAX_SNAP_DEDUP_RATIO,
    MIN_PINTEREST_CAPI_COVERAGE_PCT,
    MIN_PINTEREST_CAPI_MATCH_RATE_PCT,
    MIN_PINTEREST_DEDUP_RATIO,
    MIN_PINTEREST_ENHANCED_MATCH_PCT,
    MIN_PINTEREST_TAG_COVERAGE_PCT,
    MIN_SNAP_CAPI_COVERAGE_PCT,
    MIN_SNAP_CAPI_MATCH_RATE_PCT,
    MIN_SNAP_DEDUP_RATIO,
    MIN_SNAP_EMQ_PCT,
    MIN_SNAP_PIXEL_COVERAGE_PCT,
    CheckReport,
    GateResult,
    bootstrap_fixtures,
    check_pinterest_capi_match_rate,
    check_pinterest_enhanced_match,
    check_pinterest_tag_coverage,
    check_snap_capi_match_rate,
    check_snap_emq,
    check_snap_pixel_coverage,
    load_fixture,
    main,
    parse_args,
    render_human,
    run_all_gates,
)


# ---------- Test helpers ---------------------------------------------------------

def _valid_snap_capi_match_fixture() -> dict:
    """Fixture that should pass Gate A.
    Match rate = 855/920 = 92.9% (>= 80%)
    Dedup ratio = 930/880 = 1.057 (in [0.7, 1.5])
    Coverage = 855/920 = 92.9% (>= 92%)
    """
    return {
        "pixel_events": 930,
        "capi_events": 880,
        "matched_events": 855,
        "expected_orders_last_7d": 920,
    }


def _valid_snap_pixel_coverage_fixture() -> dict:
    """Fixture that should pass Gate C.
    Coverage = 9000/10000 = 90.0% (>= 88%)
    """
    return {
        "pixel_fired_count": 9000,
        "expected_pageviews": 10000,
    }


def _valid_snap_emq_fixture() -> dict:
    """Fixture that should pass Gate D.
    Coverage = 660/880 = 75.0% (>= 70%)
    """
    return {
        "emq_coverage_pct": 75.0,
        "matched_with_identifier": 660,
        "total_events": 880,
    }


def _valid_pinterest_capi_match_fixture() -> dict:
    """Fixture that should pass Gate A'.
    Match rate = 845/900 = 93.9% (>= 85%)
    Dedup ratio = 940/890 = 1.056 (in [0.7, 1.5])
    Coverage = 845/900 = 93.9% (>= 93%)
    """
    return {
        "pixel_events": 940,
        "capi_events": 890,
        "matched_events": 845,
        "expected_orders_last_7d": 900,
    }


def _valid_pinterest_tag_coverage_fixture() -> dict:
    """Fixture that should pass Gate C'.
    Coverage = 8800/10000 = 88.0% (>= 85%)
    """
    return {
        "tag_fired_count": 8800,
        "expected_pageviews": 10000,
    }


def _valid_pinterest_enhanced_match_fixture() -> dict:
    """Fixture that should pass Gate D'.
    Coverage = 712/890 = 80.0% (>= 75%)
    """
    return {
        "enhanced_match_coverage_pct": 80.0,
        "matched_with_identifier": 712,
        "total_events": 890,
    }


# ---------- Test runner ----------------------------------------------------------

def _run_test(name: str, fn) -> tuple[bool, str]:
    """Run a single test, return (passed, message)."""
    try:
        fn()
        return (True, f"  PASS {name}")
    except AssertionError as e:
        return (False, f"  FAIL {name}: {e}")
    except Exception as e:
        return (False, f"  FAIL {name}: {type(e).__name__}: {e}")


def main_test() -> int:
    tests: list[tuple[str, "object"]] = []

    # -------- Test class 1: import surface --------
    def test_imports_clean():
        assert callable(check_snap_capi_match_rate)
        assert callable(check_snap_pixel_coverage)
        assert callable(check_snap_emq)
        assert callable(check_pinterest_capi_match_rate)
        assert callable(check_pinterest_tag_coverage)
        assert callable(check_pinterest_enhanced_match)
        assert callable(run_all_gates)
        assert callable(bootstrap_fixtures)
        assert callable(render_human)
        assert callable(main)
        assert callable(parse_args)
        assert callable(load_fixture)
    tests.append(("imports_clean", test_imports_clean))

    def test_six_gates_registered():
        # Move #6.7 is 2 platforms x 3 gates = 6 gates
        assert len(GATE_FIXTURE_FILES) == 6
        for gate in (
            "snap_capi_match_rate",
            "snap_pixel_coverage",
            "snap_emq",
            "pinterest_capi_match_rate",
            "pinterest_tag_coverage",
            "pinterest_enhanced_match",
        ):
            assert gate in GATE_FIXTURE_FILES, f"missing gate: {gate}"
    tests.append(("six_gates_registered", test_six_gates_registered))

    def test_canonical_thresholds_published():
        # Pin all 12 thresholds (2 platforms x 6) so accidental drift
        # surfaces as a test failure rather than silent regression.
        # Per Move #6.7 playbook: Snap thresholds are LESS strict than
        # Meta (Move #6.5) and TikTok (Move #6.6) because Snap's install
        # base is smaller; Pinterest thresholds are stricter than Snap
        # because Pinterest's install is more mature.
        # Snap
        assert MIN_SNAP_CAPI_MATCH_RATE_PCT == 80.0
        assert MIN_SNAP_CAPI_COVERAGE_PCT == 92.0
        assert MIN_SNAP_DEDUP_RATIO == 0.7
        assert MAX_SNAP_DEDUP_RATIO == 1.5
        assert MIN_SNAP_PIXEL_COVERAGE_PCT == 88.0
        assert MIN_SNAP_EMQ_PCT == 70.0
        # Pinterest
        assert MIN_PINTEREST_CAPI_MATCH_RATE_PCT == 85.0
        assert MIN_PINTEREST_CAPI_COVERAGE_PCT == 93.0
        assert MIN_PINTEREST_DEDUP_RATIO == 0.7
        assert MAX_PINTEREST_DEDUP_RATIO == 1.5
        assert MIN_PINTEREST_TAG_COVERAGE_PCT == 85.0
        assert MIN_PINTEREST_ENHANCED_MATCH_PCT == 75.0
    tests.append(("canonical_thresholds_published", test_canonical_thresholds_published))

    # -------- Test class 2: Snap Gate A - CAPI match rate --------
    def test_snap_a_canonical_pass():
        result = check_snap_capi_match_rate(_valid_snap_capi_match_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        # 855/920 = 92.93%, so detail should contain "92.9"
        assert "92.9" in result.detail
    tests.append(("snap_a_canonical_pass", test_snap_a_canonical_pass))

    def test_snap_a_match_rate_too_low_fails():
        # 700/920 = 76.1% match rate (fails 80% threshold)
        # Dedup = 930/880 = 1.057 (passes [0.7, 1.5])
        # Coverage = 700/920 = 76.1% (fails 92% threshold)
        # Guard-ordering: matched must be <= min(pixel, capi)
        bad = {
            "pixel_events": 930,
            "capi_events": 880,
            "matched_events": 700,
            "expected_orders_last_7d": 920,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        # Stable substring match - production uses "match rate" form
        assert "match rate" in result.detail.lower()
    tests.append(("snap_a_match_rate_too_low_fails", test_snap_a_match_rate_too_low_fails))

    def test_snap_a_dedup_too_high_fails():
        # matched must be <= min(pixel, capi). Use matched=700.
        # Pixel=2000, capi=800, matched=700 -> dedup = 2000/800 = 2.5 (fails [0.7, 1.5])
        # Match rate = 700/800 = 87.5% (passes 80%)
        # Coverage = 700/800 = 87.5% (fails 92%)
        bad = {
            "pixel_events": 2000,
            "capi_events": 800,
            "matched_events": 700,
            "expected_orders_last_7d": 800,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        assert "dedup ratio" in result.detail.lower()
    tests.append(("snap_a_dedup_too_high_fails", test_snap_a_dedup_too_high_fails))

    def test_snap_a_dedup_too_low_fails():
        # Per v2.39 guard-ordering recipe: production checks matched-exceeds-source
        # BEFORE dedup-ratio. Negative test must satisfy matched <= min(pixel, capi)
        # so the dedup guard fires next.
        # Pixel=500, capi=2000, matched=400 -> dedup = 500/2000 = 0.25 (fails [0.7, 1.5])
        # Match rate = 400/2000 = 20% (fails 80% - expected, but dedup fails first)
        # Coverage = 400/2000 = 20% (fails 92% - expected)
        # Guard-ordering: matched=400 <= min(500, 2000)=500 PASSES first guard.
        bad = {
            "pixel_events": 500,
            "capi_events": 2000,
            "matched_events": 400,
            "expected_orders_last_7d": 2000,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        assert "dedup ratio" in result.detail.lower()
    tests.append(("snap_a_dedup_too_low_fails", test_snap_a_dedup_too_low_fails))

    def test_snap_a_zero_capi_fails():
        # Pixel=900, capi=0, matched=0 -> dedup = inf
        # Match rate = 0/920 = 0% (fails 80%)
        # "EAPI events = 0" message expected
        bad = {
            "pixel_events": 900,
            "capi_events": 0,
            "matched_events": 0,
            "expected_orders_last_7d": 920,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        # Stable substring: "capi events = 0" or "CAPI events = 0"
        assert "capi events" in result.detail.lower() and "= 0" in result.detail.lower()
    tests.append(("snap_a_zero_capi_fails", test_snap_a_zero_capi_fails))

    def test_snap_a_matched_exceeds_source_fails():
        # matched > min(pixel, capi) fires first
        bad = {
            "pixel_events": 800,
            "capi_events": 700,
            "matched_events": 750,  # > min(800, 700) = 700
            "expected_orders_last_7d": 1000,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        # Stable substring: "exceed" matches both "exceeds" and "cannot exceed"
        assert "exceed" in result.detail.lower()
    tests.append(("snap_a_matched_exceeds_source_fails", test_snap_a_matched_exceeds_source_fails))

    def test_snap_a_negative_counts_fail():
        bad = {
            "pixel_events": 900,
            "capi_events": 880,
            "matched_events": -5,
            "expected_orders_last_7d": 920,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        assert "negative" in result.detail.lower()
    tests.append(("snap_a_negative_counts_fail", test_snap_a_negative_counts_fail))

    def test_snap_a_zero_expected_orders_fails():
        bad = {
            "pixel_events": 900,
            "capi_events": 880,
            "matched_events": 855,
            "expected_orders_last_7d": 0,
        }
        result = check_snap_capi_match_rate(bad)
        assert not result.passed
        assert "> 0" in result.detail
    tests.append(("snap_a_zero_expected_orders_fails", test_snap_a_zero_expected_orders_fails))

    def test_snap_a_missing_keys_fails():
        result = check_snap_capi_match_rate({"pixel_events": 100, "capi_events": 100})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("snap_a_missing_keys_fails", test_snap_a_missing_keys_fails))

    # -------- Test class 3: Snap Gate C - pixel coverage --------
    def test_snap_c_canonical_pass():
        result = check_snap_pixel_coverage(_valid_snap_pixel_coverage_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "90.0" in result.detail
    tests.append(("snap_c_canonical_pass", test_snap_c_canonical_pass))

    def test_snap_c_coverage_below_88_fails():
        # 8000/10000 = 80.0% (fails 88% threshold)
        bad = {"pixel_fired_count": 8000, "expected_pageviews": 10000}
        result = check_snap_pixel_coverage(bad)
        assert not result.passed
        assert "80.0" in result.detail
    tests.append(("snap_c_coverage_below_88_fails", test_snap_c_coverage_below_88_fails))

    def test_snap_c_coverage_below_70_severe_fails():
        # 5000/10000 = 50.0% (severe; missing pixel snippet entirely)
        bad = {"pixel_fired_count": 5000, "expected_pageviews": 10000}
        result = check_snap_pixel_coverage(bad)
        assert not result.passed
        assert "theme.liquid" in result.remediation
    tests.append(("snap_c_coverage_below_70_severe_fails", test_snap_c_coverage_below_70_severe_fails))

    def test_snap_c_zero_expected_pageviews_fails():
        bad = {"pixel_fired_count": 9000, "expected_pageviews": 0}
        result = check_snap_pixel_coverage(bad)
        assert not result.passed
        assert "> 0" in result.detail
    tests.append(("snap_c_zero_expected_pageviews_fails", test_snap_c_zero_expected_pageviews_fails))

    def test_snap_c_missing_keys_fails():
        result = check_snap_pixel_coverage({"pixel_fired_count": 9000})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("snap_c_missing_keys_fails", test_snap_c_missing_keys_fails))

    # -------- Test class 4: Snap Gate D - EMQ --------
    def test_snap_d_canonical_pass():
        result = check_snap_emq(_valid_snap_emq_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "75.0" in result.detail
    tests.append(("snap_d_canonical_pass", test_snap_d_canonical_pass))

    def test_snap_d_coverage_below_70_fails():
        bad = {
            "emq_coverage_pct": 60.0,
            "matched_with_identifier": 528,
            "total_events": 880,
        }
        result = check_snap_emq(bad)
        assert not result.passed
        assert "60.0" in result.detail
    tests.append(("snap_d_coverage_below_70_fails", test_snap_d_coverage_below_70_fails))

    def test_snap_d_out_of_range_pct_fails():
        bad = {
            "emq_coverage_pct": 150.0,  # > 100, out of range
            "matched_with_identifier": 100,
            "total_events": 100,
        }
        result = check_snap_emq(bad)
        assert not result.passed
        assert "out of" in result.detail.lower() or "invalid" in result.detail.lower()
    tests.append(("snap_d_out_of_range_pct_fails", test_snap_d_out_of_range_pct_fails))

    def test_snap_d_zero_total_events_fails():
        bad = {
            "emq_coverage_pct": 80.0,
            "matched_with_identifier": 100,
            "total_events": 0,
        }
        result = check_snap_emq(bad)
        assert not result.passed
        assert "> 0" in result.detail
    tests.append(("snap_d_zero_total_events_fails", test_snap_d_zero_total_events_fails))

    def test_snap_d_negative_matched_fails():
        bad = {
            "emq_coverage_pct": 80.0,
            "matched_with_identifier": -10,
            "total_events": 100,
        }
        result = check_snap_emq(bad)
        assert not result.passed
    tests.append(("snap_d_negative_matched_fails", test_snap_d_negative_matched_fails))

    def test_snap_d_missing_keys_fails():
        result = check_snap_emq({"emq_coverage_pct": 80.0})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("snap_d_missing_keys_fails", test_snap_d_missing_keys_fails))

    # -------- Test class 5: Pinterest Gate A' - CAPI match rate --------
    def test_pinterest_a_canonical_pass():
        result = check_pinterest_capi_match_rate(_valid_pinterest_capi_match_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "93.9" in result.detail
    tests.append(("pinterest_a_canonical_pass", test_pinterest_a_canonical_pass))

    def test_pinterest_a_match_rate_too_low_fails():
        # 700/900 = 77.8% (fails 85%)
        # Dedup = 940/890 = 1.056 (passes)
        # Coverage = 700/900 = 77.8% (fails 93%)
        bad = {
            "pixel_events": 940,
            "capi_events": 890,
            "matched_events": 700,
            "expected_orders_last_7d": 900,
        }
        result = check_pinterest_capi_match_rate(bad)
        assert not result.passed
        assert "match rate" in result.detail.lower()
    tests.append(("pinterest_a_match_rate_too_low_fails", test_pinterest_a_match_rate_too_low_fails))

    def test_pinterest_a_dedup_too_high_fails():
        # matched=700 (guard-ordering: <= min(pixel, capi))
        # Pixel=2000, capi=800, matched=700 -> dedup = 2.5 (fails)
        bad = {
            "pixel_events": 2000,
            "capi_events": 800,
            "matched_events": 700,
            "expected_orders_last_7d": 800,
        }
        result = check_pinterest_capi_match_rate(bad)
        assert not result.passed
        assert "dedup ratio" in result.detail.lower()
    tests.append(("pinterest_a_dedup_too_high_fails", test_pinterest_a_dedup_too_high_fails))

    def test_pinterest_a_zero_capi_fails():
        bad = {
            "pixel_events": 900,
            "capi_events": 0,
            "matched_events": 0,
            "expected_orders_last_7d": 900,
        }
        result = check_pinterest_capi_match_rate(bad)
        assert not result.passed
        assert "capi events" in result.detail.lower()
    tests.append(("pinterest_a_zero_capi_fails", test_pinterest_a_zero_capi_fails))

    def test_pinterest_a_matched_exceeds_source_fails():
        bad = {
            "pixel_events": 800,
            "capi_events": 700,
            "matched_events": 750,  # > min(800, 700) = 700
            "expected_orders_last_7d": 1000,
        }
        result = check_pinterest_capi_match_rate(bad)
        assert not result.passed
        assert "exceed" in result.detail.lower()
    tests.append(("pinterest_a_matched_exceeds_source_fails", test_pinterest_a_matched_exceeds_source_fails))

    def test_pinterest_a_missing_keys_fails():
        result = check_pinterest_capi_match_rate({"capi_events": 100})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("pinterest_a_missing_keys_fails", test_pinterest_a_missing_keys_fails))

    # -------- Test class 6: Pinterest Gate C' - tag coverage --------
    def test_pinterest_c_canonical_pass():
        result = check_pinterest_tag_coverage(_valid_pinterest_tag_coverage_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "88.0" in result.detail
    tests.append(("pinterest_c_canonical_pass", test_pinterest_c_canonical_pass))

    def test_pinterest_c_coverage_below_85_fails():
        bad = {"tag_fired_count": 7500, "expected_pageviews": 10000}  # 75.0%
        result = check_pinterest_tag_coverage(bad)
        assert not result.passed
        assert "75.0" in result.detail
    tests.append(("pinterest_c_coverage_below_85_fails", test_pinterest_c_coverage_below_85_fails))

    def test_pinterest_c_zero_expected_pageviews_fails():
        bad = {"tag_fired_count": 8800, "expected_pageviews": 0}
        result = check_pinterest_tag_coverage(bad)
        assert not result.passed
        assert "> 0" in result.detail
    tests.append(("pinterest_c_zero_expected_pageviews_fails", test_pinterest_c_zero_expected_pageviews_fails))

    def test_pinterest_c_missing_keys_fails():
        result = check_pinterest_tag_coverage({"expected_pageviews": 10000})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("pinterest_c_missing_keys_fails", test_pinterest_c_missing_keys_fails))

    # -------- Test class 7: Pinterest Gate D' - Enhanced Match --------
    def test_pinterest_d_canonical_pass():
        result = check_pinterest_enhanced_match(_valid_pinterest_enhanced_match_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "80.0" in result.detail
    tests.append(("pinterest_d_canonical_pass", test_pinterest_d_canonical_pass))

    def test_pinterest_d_coverage_below_75_fails():
        bad = {
            "enhanced_match_coverage_pct": 60.0,
            "matched_with_identifier": 534,
            "total_events": 890,
        }
        result = check_pinterest_enhanced_match(bad)
        assert not result.passed
        assert "60.0" in result.detail
    tests.append(("pinterest_d_coverage_below_75_fails", test_pinterest_d_coverage_below_75_fails))

    def test_pinterest_d_out_of_range_pct_fails():
        bad = {
            "enhanced_match_coverage_pct": 150.0,
            "matched_with_identifier": 100,
            "total_events": 100,
        }
        result = check_pinterest_enhanced_match(bad)
        assert not result.passed
    tests.append(("pinterest_d_out_of_range_pct_fails", test_pinterest_d_out_of_range_pct_fails))

    def test_pinterest_d_zero_total_events_fails():
        bad = {
            "enhanced_match_coverage_pct": 80.0,
            "matched_with_identifier": 100,
            "total_events": 0,
        }
        result = check_pinterest_enhanced_match(bad)
        assert not result.passed
        assert "> 0" in result.detail
    tests.append(("pinterest_d_zero_total_events_fails", test_pinterest_d_zero_total_events_fails))

    def test_pinterest_d_missing_keys_fails():
        result = check_pinterest_enhanced_match({"enhanced_match_coverage_pct": 80.0})
        assert not result.passed
        assert "missing" in result.detail.lower()
    tests.append(("pinterest_d_missing_keys_fails", test_pinterest_d_missing_keys_fails))

    # -------- Test class 8: orchestration --------
    def test_orchestration_all_gates_pass(tmpdir=None):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            report = run_all_gates(d)
            assert report.overall_passed
            assert len(report.gates) == 6
            for g in report.gates:
                assert g.passed, f"{g.gate_name}: {g.detail}"
    tests.append(("orchestration_all_gates_pass", test_orchestration_all_gates_pass))

    def test_orchestration_missing_fixture_fails():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            report = run_all_gates(d)
            assert not report.overall_passed
            assert len(report.gates) == 6
            for g in report.gates:
                assert not g.passed
                assert "missing" in g.detail.lower()
    tests.append(("orchestration_missing_fixture_fails", test_orchestration_missing_fixture_fails))

    def test_orchestration_only_check():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            report = run_all_gates(d, only_check="snap_capi_match_rate")
            assert len(report.gates) == 1
            assert report.gates[0].gate_name == "snap_capi_match_rate"
            assert report.overall_passed
    tests.append(("orchestration_only_check", test_orchestration_only_check))

    def test_orchestration_to_dict_includes_summary():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            report = run_all_gates(d)
            d_dict = report.to_dict()
            assert "fixture_dir" in d_dict
            assert "overall_passed" in d_dict
            assert "gates" in d_dict
            assert "summary" in d_dict
            assert d_dict["summary"]["total"] == 6
            assert d_dict["summary"]["passed"] == 6
            assert d_dict["summary"]["failed"] == 0
    tests.append(("orchestration_to_dict_includes_summary", test_orchestration_to_dict_includes_summary))

    # -------- Test class 9: render --------
    def test_render_human_contains_summary():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            report = run_all_gates(d)
            text = render_human(report)
            assert "Snap + Pinterest Attribution Quality Audit" in text
            assert "ALL GATES PASSED" in text
            assert "6/6 gates passed" in text
    tests.append(("render_human_contains_summary", test_render_human_contains_summary))

    def test_render_human_shows_remediation_on_failure():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            # Bootstrap with canonical-pass, then break ONE fixture
            bootstrap_fixtures(d)
            with open(os.path.join(d, "snap_capi_match.json"), "w") as f:
                json.dump({
                    "pixel_events": 900,
                    "capi_events": 880,
                    "matched_events": 600,  # 65.2% match rate (fails 80%)
                    "expected_orders_last_7d": 920,
                }, f)
            report = run_all_gates(d)
            assert not report.overall_passed
            text = render_human(report)
            # Stable substring "->" matches the remediation arrow
            assert "->" in text
    tests.append(("render_human_shows_remediation_on_failure", test_render_human_shows_remediation_on_failure))

    # -------- Test class 10: bootstrap --------
    def test_bootstrap_creates_six_fixtures():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            expected_files = {
                "snap_capi_match.json",
                "snap_pixel_coverage.json",
                "snap_emq.json",
                "pinterest_capi_match.json",
                "pinterest_tag_coverage.json",
                "pinterest_enhanced_match.json",
            }
            actual = set(os.listdir(d))
            assert expected_files == actual, f"missing: {expected_files - actual}, extra: {actual - expected_files}"
    tests.append(("bootstrap_creates_six_fixtures", test_bootstrap_creates_six_fixtures))

    def test_bootstrap_fixtures_have_valid_json():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            for fname in os.listdir(d):
                with open(os.path.join(d, fname), "r") as f:
                    data = json.load(f)
                assert isinstance(data, dict)
                assert "_comment" in data, f"{fname} missing _comment"
    tests.append(("bootstrap_fixtures_have_valid_json", test_bootstrap_fixtures_have_valid_json))

    def test_bootstrap_fixtures_pass_canonical():
        # Critical: per v2.41 bootstrap-fixture-union-of-thresholds,
        # bootstrap values must satisfy the STRICTEST threshold per
        # shared numerator (e.g. match rate AND coverage both use
        # matched/expected; both must pass with the strictest).
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            report = run_all_gates(d)
            assert report.overall_passed, "bootstrap fixtures must pass all 6 gates"
    tests.append(("bootstrap_fixtures_pass_canonical", test_bootstrap_fixtures_pass_canonical))

    # -------- Test class 11: CLI --------
    def test_cli_help_exits_zero():
        result = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"), "--help"],
            capture_output=True, text=True,
        )
        assert result.returncode == 0
        # All 4 documented CLI flags must appear in --help output
        for flag in ("--fixtures-dir", "--check", "--json", "--bootstrap"):
            assert flag in result.stdout, f"--help missing {flag}"
    tests.append(("cli_help_exits_zero", test_cli_help_exits_zero))

    def test_cli_bootstrap_then_run():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            # Bootstrap
            bootstrap_result = subprocess.run(
                [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"),
                 "--bootstrap", d],
                capture_output=True, text=True,
            )
            assert bootstrap_result.returncode == 0
            # Run with JSON
            run_result = subprocess.run(
                [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"),
                 "--fixtures-dir", d, "--json"],
                capture_output=True, text=True,
            )
            assert run_result.returncode == 0
            data = json.loads(run_result.stdout)
            assert data["overall_passed"] is True
            assert data["summary"]["total"] == 6
            assert data["summary"]["passed"] == 6
    tests.append(("cli_bootstrap_then_run", test_cli_bootstrap_then_run))

    def test_cli_run_with_missing_fixtures_exits_one():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            result = subprocess.run(
                [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"),
                 "--fixtures-dir", d],
                capture_output=True, text=True,
            )
            assert result.returncode == 1, f"expected exit 1, got {result.returncode}"
            assert "SOME GATES FAILED" in result.stdout
    tests.append(("cli_run_with_missing_fixtures_exits_one", test_cli_run_with_missing_fixtures_exits_one))

    def test_cli_json_roundtrip():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            result = subprocess.run(
                [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"),
                 "--fixtures-dir", d, "--json"],
                capture_output=True, text=True,
            )
            assert result.returncode == 0
            data = json.loads(result.stdout)
            assert data["overall_passed"] is True
            # Verify all 4 top-level keys present
            for k in ("fixture_dir", "overall_passed", "gates", "summary"):
                assert k in data, f"missing top-level key: {k}"
            # Verify each gate has the 4 expected keys
            for g in data["gates"]:
                for k in ("gate", "passed", "detail", "remediation"):
                    assert k in g, f"gate missing key: {k}"
    tests.append(("cli_json_roundtrip", test_cli_json_roundtrip))

    def test_cli_only_check_runs_one_gate():
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            bootstrap_fixtures(d)
            result = subprocess.run(
                [sys.executable, os.path.join(SCRIPTS_DIR, "snap_pinterest_attribution_audit.py"),
                 "--fixtures-dir", d, "--check", "snap_capi_match_rate"],
                capture_output=True, text=True,
            )
            assert result.returncode == 0
            # Only the snap_capi_match_rate gate should appear in output
            assert "snap_capi_match_rate" in result.stdout
            assert "snap_pixel_coverage" not in result.stdout
            assert "pinterest_capi_match_rate" not in result.stdout
    tests.append(("cli_only_check_runs_one_gate", test_cli_only_check_runs_one_gate))

    # -------- Test class 12: per-persona sanity (Snap vs Pinterest asymmetry) --------
    def test_snap_thresholds_less_strict_than_pinterest():
        # The asymmetry: Snap thresholds are LESS strict than Pinterest
        # because Snap's install base is smaller. Pin via asserts.
        assert MIN_SNAP_CAPI_MATCH_RATE_PCT < MIN_PINTEREST_CAPI_MATCH_RATE_PCT
        assert MIN_SNAP_CAPI_COVERAGE_PCT < MIN_PINTEREST_CAPI_COVERAGE_PCT
        assert MIN_SNAP_PIXEL_COVERAGE_PCT > MIN_PINTEREST_TAG_COVERAGE_PCT
        assert MIN_SNAP_EMQ_PCT < MIN_PINTEREST_ENHANCED_MATCH_PCT
    tests.append(("snap_thresholds_less_strict_than_pinterest",
                  test_snap_thresholds_less_strict_than_pinterest))

    # -------- Run all tests --------
    results = [_run_test(name, fn) for name, fn in tests]
    passed = sum(1 for ok, _ in results if ok)
    failed = sum(1 for ok, _ in results if not ok)
    print("=" * 60)
    for ok, msg in results:
        print(msg)
    print("=" * 60)
    print(f"Total: {len(tests)} | Passed: {passed} | Failed: {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main_test())
