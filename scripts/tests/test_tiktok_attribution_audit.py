#!/usr/bin/env python3
"""
test_tiktok_attribution_audit.py — TDD tests for the TikTok
attribution quality audit script (Move #6.6 companion).

Run: python3 scripts/tests/test_tiktok_attribution_audit.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile

# Add scripts/ to path so we can import the module under test.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, SCRIPTS_DIR)

from tiktok_attribution_audit import (  # noqa: E402
    GATE_FIXTURE_FILES,
    MAX_DEDUP_RATIO,
    MIN_DEDUP_RATIO,
    MIN_TIKTOK_ADVANCED_MATCHING_PCT,
    MIN_TIKTOK_EAPI_COVERAGE_PCT,
    MIN_TIKTOK_EAPI_MATCH_RATE_PCT,
    MIN_TIKTOK_PIXEL_COVERAGE_PCT,
    CheckReport,
    GateResult,
    bootstrap_fixtures,
    check_tiktok_advanced_matching,
    check_tiktok_eapi_match_rate,
    check_tiktok_pixel_coverage,
    load_fixture,
    main,
    parse_args,
    render_human,
    run_all_gates,
)


# ---------- Test helpers ---------------------------------------------------------

def _valid_tiktok_eapi_match_fixture() -> dict:
    """Return a fixture that should pass Gate A.

    Match rate = 870 / 950 = 91.6% (>= 85%)
    Dedup ratio = 1000 / 950 = 1.053 (in [0.7, 1.6])
    Coverage = 870 / 950 = 91.6% -- WAIT, that fails coverage (<95%)
    Let me re-derive: matched/expected must be >= 95%.
    So expected_orders = 900, matched = 870, ratio = 96.7%
    Pixel = 950, EAPI = 900, matched = 870, expected = 900
    Match rate = 870/900 = 96.7%
    Dedup ratio = 950/900 = 1.056
    Coverage = 870/900 = 96.7%
    """
    return {
        "pixel_events": 950,
        "eapi_events": 900,
        "matched_events": 870,
        "expected_orders_last_7d": 900,
    }


def _valid_tiktok_pixel_coverage_fixture() -> dict:
    """Return a fixture that should pass Gate C.

    Coverage = 9000 / 10000 = 90.0% (>= 90%)
    """
    return {
        "pixel_fired_count": 9000,
        "expected_pageviews": 10000,
    }


def _valid_tiktok_advanced_matching_fixture() -> dict:
    """Return a fixture that should pass Gate D.

    Coverage = 760 / 950 = 80.0% (>= 75%)
    """
    return {
        "hashed_identifier_coverage_pct": 80.0,
        "matched_with_identifier": 760,
        "total_events": 950,
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
        assert callable(check_tiktok_eapi_match_rate)
        assert callable(check_tiktok_pixel_coverage)
        assert callable(check_tiktok_advanced_matching)
        assert callable(run_all_gates)
        assert callable(bootstrap_fixtures)
        assert callable(render_human)
        assert callable(main)
        assert callable(parse_args)
        assert callable(load_fixture)
    tests.append(("imports_clean", test_imports_clean))

    def test_three_gates_registered():
        assert len(GATE_FIXTURE_FILES) == 3
        assert "tiktok_eapi_match_rate" in GATE_FIXTURE_FILES
        assert "tiktok_pixel_coverage" in GATE_FIXTURE_FILES
        assert "tiktok_advanced_matching" in GATE_FIXTURE_FILES
    tests.append(("three_gates_registered", test_three_gates_registered))

    def test_canonical_thresholds_published():
        # These thresholds are documented in the playbook; tests
        # pin them so accidental drift shows up as a test failure.
        # Per Move #6.6 playbook: less strict than Move #6.5 because
        # TikTok install is newer and a 85% match rate is realistically
        # the best most stores achieve in steady state.
        assert MIN_TIKTOK_EAPI_MATCH_RATE_PCT == 85.0
        assert MIN_TIKTOK_EAPI_COVERAGE_PCT == 95.0
        assert MIN_DEDUP_RATIO == 0.7
        assert MAX_DEDUP_RATIO == 1.6
        assert MIN_TIKTOK_PIXEL_COVERAGE_PCT == 90.0
        assert MIN_TIKTOK_ADVANCED_MATCHING_PCT == 75.0
    tests.append(("canonical_thresholds_published", test_canonical_thresholds_published))

    # -------- Test class 2: Gate A — TikTok EAPI match rate --------
    def test_a_canonical_pass():
        result = check_tiktok_eapi_match_rate(_valid_tiktok_eapi_match_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "96.7" in result.detail  # 870/900 = 96.67%
    tests.append(("a_canonical_pass", test_a_canonical_pass))

    def test_a_match_rate_too_low_fails():
        # 800 / 900 = 88.9% match rate (fails 85% threshold)
        # but check dedup and coverage first
        # 850/900 = 94.4% coverage (fails 95%)
        # Actually let's match: matched=750, expected=900 -> 83.3% match rate (fails 85%)
        # Pixel=950, EAPI=900, matched=750, expected=900 -> dedup=1.056 (ok), coverage=83.3% (fails)
        # Actually both fail. Let me use matched=800, expected=1000 -> 80% match rate (fails 85%)
        # Pixel=900, EAPI=900, matched=800, expected=1000 -> dedup=1.0 (ok), coverage=80% (fails)
        # We need to fail ONLY on match rate. So matched/expected=0.84, coverage=0.84 too...
        # Actually coverage=match_rate for this fixture shape. Let's just check
        # the assertion fires on a low match rate.
        bad = {
            "pixel_events": 950,
            "eapi_events": 950,
            "matched_events": 700,
            "expected_orders_last_7d": 950,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        # 700/950 = 73.7% match rate - fails 85% threshold
        # Dedup = 950/950 = 1.0 - passes [0.7, 1.6]
        # Coverage = 700/950 = 73.7% - fails 95%
        # So both match rate AND coverage fail. Detail should contain "match rate"
        assert "match rate" in result.detail.lower()
    tests.append(("a_match_rate_too_low_fails", test_a_match_rate_too_low_fails))

    def test_a_dedup_too_high_fails():
        # matched must <= min(pixel, eapi) - use matched=500
        # pixel=2000, eapi=1000, matched=500, expected=900
        # dedup=2000/1000=2.0 (fails [0.7, 1.6])
        # match=500/900=55.6% (fails 85%)
        # coverage=500/900=55.6% (fails 95%)
        # All three fail. Let's instead use matched=900, expected=1000
        # pixel=2000, eapi=1000, matched=900, expected=1000
        # dedup=2.0 (fails), match=90% (passes), coverage=90% (fails 95%)
        # Two failures but at least one is dedup.
        bad = {
            "pixel_events": 2000,
            "eapi_events": 1000,
            "matched_events": 900,
            "expected_orders_last_7d": 1000,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "dedup ratio" in result.detail.lower()
    tests.append(("a_dedup_too_high_fails", test_a_dedup_too_high_fails))

    def test_a_dedup_too_low_fails():
        # pixel=500, eapi=1000, matched=500, expected=550
        # dedup=0.5 (fails [0.7, 1.6])
        # match=500/550=90.9% (passes 85%)
        # coverage=500/550=90.9% (fails 95%)
        # Two failures but at least one is dedup.
        bad = {
            "pixel_events": 500,
            "eapi_events": 1000,
            "matched_events": 500,
            "expected_orders_last_7d": 550,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "dedup ratio" in result.detail.lower()
    tests.append(("a_dedup_too_low_fails", test_a_dedup_too_low_fails))

    def test_a_zero_eapi_fails():
        # pixel=1000, eapi=0, matched=0, expected=1000
        # matched_exceeds_source guard: 0 <= min(1000, 0)=0 - ok
        # match=0% (fails 85%)
        # dedup: eapi=0, pixel>0 -> inf -> triggers "EAPI events = 0" message
        # coverage=0% (fails 95%)
        bad = {
            "pixel_events": 1000,
            "eapi_events": 0,
            "matched_events": 0,
            "expected_orders_last_7d": 1000,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        # The "EAPI events = 0" detail should appear
        assert "EAPI events = 0" in result.detail
    tests.append(("a_zero_eapi_fails", test_a_zero_eapi_fails))

    def test_a_matched_exceeds_source_fails():
        # matched=1100 > min(pixel=1000, eapi=950)=950
        bad = {
            "pixel_events": 1000,
            "eapi_events": 950,
            "matched_events": 1100,
            "expected_orders_last_7d": 950,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "matched_events" in result.detail
        assert "exceed" in result.detail.lower()  # production says "cannot exceed"
    tests.append(("a_matched_exceeds_source_fails", test_a_matched_exceeds_source_fails))

    def test_a_negative_counts_fail():
        bad = {
            "pixel_events": -10,
            "eapi_events": 100,
            "matched_events": 50,
            "expected_orders_last_7d": 100,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "Negative event counts" in result.detail
    tests.append(("a_negative_counts_fail", test_a_negative_counts_fail))

    def test_a_zero_expected_orders_fails():
        bad = {
            "pixel_events": 100,
            "eapi_events": 100,
            "matched_events": 50,
            "expected_orders_last_7d": 0,
        }
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "expected_orders_last_7d" in result.detail
    tests.append(("a_zero_expected_orders_fails", test_a_zero_expected_orders_fails))

    def test_a_missing_keys_fails():
        bad = {"pixel_events": 100}  # missing eapi, matched, expected
        result = check_tiktok_eapi_match_rate(bad)
        assert not result.passed
        assert "Missing keys" in result.detail
        assert "eapi_events" in result.detail
    tests.append(("a_missing_keys_fails", test_a_missing_keys_fails))

    # -------- Test class 3: Gate C — TikTok Pixel coverage --------
    def test_c_canonical_pass():
        result = check_tiktok_pixel_coverage(_valid_tiktok_pixel_coverage_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "90.0%" in result.detail
    tests.append(("c_canonical_pass", test_c_canonical_pass))

    def test_c_coverage_below_90_fails():
        # 8000 / 10000 = 80.0% (fails 90% threshold)
        bad = {
            "pixel_fired_count": 8000,
            "expected_pageviews": 10000,
        }
        result = check_tiktok_pixel_coverage(bad)
        assert not result.passed
        assert "80.0%" in result.detail
    tests.append(("c_coverage_below_90_fails", test_c_coverage_below_90_fails))

    def test_c_coverage_below_70_severe_fails():
        # 5000 / 10000 = 50.0% - severe failure (below ad-blocker normal loss)
        bad = {
            "pixel_fired_count": 5000,
            "expected_pageviews": 10000,
        }
        result = check_tiktok_pixel_coverage(bad)
        assert not result.passed
        assert "50.0%" in result.detail
        assert "theme.liquid" in result.remediation
    tests.append(("c_coverage_below_70_severe_fails", test_c_coverage_below_70_severe_fails))

    def test_c_zero_expected_pageviews_fails():
        bad = {
            "pixel_fired_count": 1000,
            "expected_pageviews": 0,
        }
        result = check_tiktok_pixel_coverage(bad)
        assert not result.passed
        assert "expected_pageviews" in result.detail
    tests.append(("c_zero_expected_pageviews_fails", test_c_zero_expected_pageviews_fails))

    def test_c_missing_keys_fails():
        result = check_tiktok_pixel_coverage({"pixel_fired_count": 1000})
        assert not result.passed
        assert "Missing keys" in result.detail
        assert "expected_pageviews" in result.detail
    tests.append(("c_missing_keys_fails", test_c_missing_keys_fails))

    # -------- Test class 4: Gate D — TikTok Advanced Matching --------
    def test_d_canonical_pass():
        result = check_tiktok_advanced_matching(_valid_tiktok_advanced_matching_fixture())
        assert result.passed, f"expected pass, got: {result.detail}"
        assert "80.0%" in result.detail
    tests.append(("d_canonical_pass", test_d_canonical_pass))

    def test_d_coverage_below_75_fails():
        # 600 / 1000 = 60.0% (fails 75%)
        bad = {
            "hashed_identifier_coverage_pct": 60.0,
            "matched_with_identifier": 600,
            "total_events": 1000,
        }
        result = check_tiktok_advanced_matching(bad)
        assert not result.passed
        assert "60.0%" in result.detail
    tests.append(("d_coverage_below_75_fails", test_d_coverage_below_75_fails))

    def test_d_out_of_range_pct_fails():
        bad = {
            "hashed_identifier_coverage_pct": 150.0,  # > 100
            "matched_with_identifier": 950,
            "total_events": 950,
        }
        result = check_tiktok_advanced_matching(bad)
        assert not result.passed
        assert "out of [0, 100]" in result.detail
    tests.append(("d_out_of_range_pct_fails", test_d_out_of_range_pct_fails))

    def test_d_zero_total_events_fails():
        bad = {
            "hashed_identifier_coverage_pct": 80.0,
            "matched_with_identifier": 0,
            "total_events": 0,
        }
        result = check_tiktok_advanced_matching(bad)
        assert not result.passed
        assert "total_events" in result.detail
    tests.append(("d_zero_total_events_fails", test_d_zero_total_events_fails))

    def test_d_negative_matched_fails():
        bad = {
            "hashed_identifier_coverage_pct": 80.0,
            "matched_with_identifier": -10,
            "total_events": 100,
        }
        result = check_tiktok_advanced_matching(bad)
        assert not result.passed
        assert "Invalid values" in result.detail
    tests.append(("d_negative_matched_fails", test_d_negative_matched_fails))

    def test_d_missing_keys_fails():
        result = check_tiktok_advanced_matching({"total_events": 100})
        assert not result.passed
        assert "Missing keys" in result.detail
    tests.append(("d_missing_keys_fails", test_d_missing_keys_fails))

    # -------- Test class 5: orchestration — run_all_gates --------
    def test_orchestration_all_gates_pass():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            report = run_all_gates(tmpdir)
            assert report.overall_passed
            assert len(report.gates) == 3
            assert all(g.passed for g in report.gates)
    tests.append(("orchestration_all_gates_pass", test_orchestration_all_gates_pass))

    def test_orchestration_missing_fixture_fails():
        with tempfile.TemporaryDirectory() as tmpdir:
            # Empty dir - all fixtures missing
            report = run_all_gates(tmpdir)
            assert not report.overall_passed
            assert len(report.gates) == 3
            assert all(not g.passed for g in report.gates)
            # Each gate should have "Fixture file missing" detail
            for g in report.gates:
                assert "Fixture file missing" in g.detail
    tests.append(("orchestration_missing_fixture_fails", test_orchestration_missing_fixture_fails))

    def test_orchestration_only_check():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            report = run_all_gates(tmpdir, only_check="tiktok_eapi_match_rate")
            assert len(report.gates) == 1
            assert report.gates[0].gate_name == "tiktok_eapi_match_rate"
    tests.append(("orchestration_only_check", test_orchestration_only_check))

    def test_orchestration_to_dict_includes_summary():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            report = run_all_gates(tmpdir)
            d = report.to_dict()
            assert "fixture_dir" in d
            assert "overall_passed" in d
            assert "gates" in d
            assert "summary" in d
            assert d["summary"]["total"] == 3
            assert d["summary"]["passed"] == 3
            assert d["summary"]["failed"] == 0
    tests.append(("orchestration_to_dict_includes_summary", test_orchestration_to_dict_includes_summary))

    # -------- Test class 6: render_human --------
    def test_render_human_contains_summary():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            report = run_all_gates(tmpdir)
            output = render_human(report)
            assert "TikTok Attribution Quality Audit" in output
            assert "ALL GATES PASSED" in output
            assert "3/3 gates passed" in output
    tests.append(("render_human_contains_summary", test_render_human_contains_summary))

    def test_render_human_shows_remediation_on_failure():
        with tempfile.TemporaryDirectory() as tmpdir:
            # Empty dir - all fixtures missing
            report = run_all_gates(tmpdir)
            output = render_human(report)
            assert "SOME GATES FAILED" in output
            assert "Fixture file missing" in output
            assert "→" in output  # remediation arrow
    tests.append(("render_human_shows_remediation_on_failure", test_render_human_shows_remediation_on_failure))

    # -------- Test class 7: bootstrap --------
    def test_bootstrap_creates_three_fixtures():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            assert os.path.exists(os.path.join(tmpdir, "tiktok_eapi_match.json"))
            assert os.path.exists(os.path.join(tmpdir, "tiktok_pixel_coverage.json"))
            assert os.path.exists(os.path.join(tmpdir, "tiktok_advanced_matching.json"))
    tests.append(("bootstrap_creates_three_fixtures", test_bootstrap_creates_three_fixtures))

    def test_bootstrap_fixtures_have_valid_json():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            for fname in GATE_FIXTURE_FILES.values():
                filename = fname[0]
                with open(os.path.join(tmpdir, filename)) as f:
                    data = json.load(f)
                assert isinstance(data, dict)
                # All fixture files should have a _comment
                assert "_comment" in data
    tests.append(("bootstrap_fixtures_have_valid_json", test_bootstrap_fixtures_have_valid_json))

    def test_bootstrap_fixtures_pass_canonical():
        # After bootstrap, run_all_gates should return overall_passed=True
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            report = run_all_gates(tmpdir)
            assert report.overall_passed, (
                f"Bootstrapped fixtures should pass canonical gates. "
                f"Failures: {[g.detail for g in report.gates if not g.passed]}"
            )
    tests.append(("bootstrap_fixtures_pass_canonical", test_bootstrap_fixtures_pass_canonical))

    # -------- Test class 8: CLI behavior --------
    def test_cli_help_exits_zero():
        result = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py", "--help"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "--fixtures-dir" in result.stdout
        assert "--check" in result.stdout
        assert "--json" in result.stdout
        assert "--bootstrap" in result.stdout
    tests.append(("cli_help_exits_zero", test_cli_help_exits_zero))

    def test_cli_bootstrap_then_run():
        with tempfile.TemporaryDirectory() as tmpdir:
            # Bootstrap
            r1 = subprocess.run(
                [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py", "--bootstrap", tmpdir],
                capture_output=True,
                text=True,
            )
            assert r1.returncode == 0
            # Run with JSON
            r2 = subprocess.run(
                [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py",
                 "--fixtures-dir", tmpdir, "--json"],
                capture_output=True,
                text=True,
            )
            assert r2.returncode == 0
            data = json.loads(r2.stdout)
            assert data["overall_passed"] is True
            assert data["summary"]["total"] == 3
            assert data["summary"]["passed"] == 3
            assert len(data["gates"]) == 3
    tests.append(("cli_bootstrap_then_run", test_cli_bootstrap_then_run))

    def test_cli_run_with_missing_fixtures_exits_one():
        with tempfile.TemporaryDirectory() as tmpdir:
            r = subprocess.run(
                [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py",
                 "--fixtures-dir", tmpdir],
                capture_output=True,
                text=True,
            )
            assert r.returncode == 1
            assert "SOME GATES FAILED" in r.stdout
    tests.append(("cli_run_with_missing_fixtures_exits_one", test_cli_run_with_missing_fixtures_exits_one))

    def test_cli_json_roundtrip():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            r = subprocess.run(
                [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py",
                 "--fixtures-dir", tmpdir, "--json"],
                capture_output=True,
                text=True,
            )
            assert r.returncode == 0
            data = json.loads(r.stdout)  # validates JSON
            # Validate schema
            for key in ["fixture_dir", "overall_passed", "gates", "summary"]:
                assert key in data
            for g in data["gates"]:
                for gkey in ["gate", "passed", "detail", "remediation"]:
                    assert gkey in g
    tests.append(("cli_json_roundtrip", test_cli_json_roundtrip))

    def test_cli_only_check_runs_one_gate():
        with tempfile.TemporaryDirectory() as tmpdir:
            bootstrap_fixtures(tmpdir)
            r = subprocess.run(
                [sys.executable, SCRIPTS_DIR + "/tiktok_attribution_audit.py",
                 "--fixtures-dir", tmpdir, "--check", "tiktok_eapi_match_rate"],
                capture_output=True,
                text=True,
            )
            assert r.returncode == 0
            assert "tiktok_eapi_match_rate" in r.stdout
            # Should NOT contain the other gates' output (only one line per gate)
            # We can check that only 1 ✓ or ✗ marker for our gate appears in the summary line
            # Easiest: count "[✓]" lines == 1
            assert r.stdout.count("[✓]") == 1
    tests.append(("cli_only_check_runs_one_gate", test_cli_only_check_runs_one_gate))

    # -------- Run all tests --------
    results = [_run_test(name, fn) for name, fn in tests]
    passed = sum(1 for ok, _ in results if ok)
    failed = len(results) - passed

    print(f"\nTikTok Attribution Audit — Move #6.6 TDD Test Suite")
    print(f"{'=' * 60}")
    for ok, msg in results:
        print(msg)
    print(f"{'=' * 60}")
    print(f"Total: {len(results)} | Passed: {passed} | Failed: {failed}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main_test())