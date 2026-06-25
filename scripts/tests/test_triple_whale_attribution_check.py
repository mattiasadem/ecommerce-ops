#!/usr/bin/env python3
"""
test_triple_whale_attribution_check.py — TDD tests for the Triple Whale
attribution checklist runner (Move #6 companion script).

Run: python3 scripts/tests/test_triple_whale_attribution_check.py
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

from triple_whale_attribution_check import (  # noqa: E402
    DEFAULT_SURVEY_QUESTION,
    GATE_FIXTURE_FILES,
    MAX_SKIP_ORDER_VALUE,
    MIN_COHORT_LTV_LIFT_PCT,
    MIN_PIXEL_ID_LEN,
    MIN_SKIP_ORDER_VALUE,
    MIN_SURVEY_OPTIONS,
    REQUIRED_GOOGLE_KEYS,
    REQUIRED_KLAVIYO_FLOWS,
    REQUIRED_PIXEL_CAPI_KEYS,
    CheckReport,
    GateResult,
    bootstrap_fixtures,
    check_cohort_ltv_baseline,
    check_flow_event_names,
    check_google_enhanced_conversions,
    check_klaviyo_cohort_sync,
    check_meta_capi,
    check_pixel_capi,
    check_post_purchase_survey,
    load_fixture,
    main,
    parse_args,
    render_human,
    run_all_gates,
)


# ---------- Test helpers ---------------------------------------------------------

def _valid_pixel_capi_fixture() -> dict:
    """Return a fixture that should pass Gate A."""
    return {
        "pixel_id": "tw_pixel_" + "a" * 16,  # > MIN_PIXEL_ID_LEN chars
        "capi_token": "capi_" + "b" * 32,     # > MIN_CAPI_TOKEN_LEN chars
    }


def _valid_survey_fixture() -> dict:
    """Return a fixture that should pass Gate F."""
    return {
        "question": DEFAULT_SURVEY_QUESTION,
        "options": ["TikTok", "Instagram", "Google", "Friend", "Podcast", "Blog", "Other"],
        "min_order_value": 20,
    }


def _valid_klaviyo_fixture() -> dict:
    """Return a fixture that should pass Gate C."""
    return {
        "api_key": "pk_test_" + "x" * 32,
        "flows": ["abandoned_cart", "welcome_series", "post_purchase_upsell", "sms_welcome"],
    }


def _valid_meta_capi_fixture() -> dict:
    return {
        "pixel_id": "meta_pixel_" + "a" * 16,
        "capi_token": "meta_capi_" + "b" * 32,
        "test_event_code": "TEST" + "1234",
    }


def _valid_google_fixture() -> dict:
    return {
        "conversion_id": "AW-123456789",
        "send_hashed_email": True,
    }


def _valid_flow_event_names_fixture() -> dict:
    return {
        "abandoned_cart": "Abandoned Cart Reminder",
        "welcome_series": "Welcome Series",
        "post_purchase_upsell": "Post-Purchase Upsell",
        "sms_welcome": "SMS Welcome",
    }


def _valid_cohort_fixture(on_ltv: float = 80.0, off_ltv: float = 70.0) -> dict:
    """Default: 14.3% lift (>= 10% target)."""
    return {
        "welcome_series_on_30d_ltv": on_ltv,
        "welcome_series_off_30d_ltv": off_ltv,
    }


def _write_fixture_set(dir_path: str) -> None:
    """Write all 7 valid fixtures into dir_path."""
    os.makedirs(dir_path, exist_ok=True)
    fixtures = {
        "pixel_capi.json": _valid_pixel_capi_fixture(),
        "post_purchase_survey.json": _valid_survey_fixture(),
        "klaviyo_integration.json": _valid_klaviyo_fixture(),
        "meta_capi.json": _valid_meta_capi_fixture(),
        "google_enhanced.json": _valid_google_fixture(),
        "flow_event_names.json": _valid_flow_event_names_fixture(),
        "cohort_ltv_baseline.json": _valid_cohort_fixture(),
    }
    for filename, content in fixtures.items():
        with open(os.path.join(dir_path, filename), "w", encoding="utf-8") as f:
            json.dump(content, f)
            f.write("\n")


# ---------- Gate-level tests: check_pixel_capi ----------------------------------

def test_check_pixel_capi_valid_passes():
    """A pixel + CAPI fixture with valid lengths passes."""
    result = check_pixel_capi(_valid_pixel_capi_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"
    assert "Pixel: Active" in result.detail
    assert "CAPI: Active" in result.detail


def test_check_pixel_capi_missing_keys_fails():
    """Missing both keys fails with remediation guidance."""
    result = check_pixel_capi({})
    assert not result.passed
    assert "Missing keys" in result.detail
    assert "pixel_id" in result.detail
    assert "capi_token" in result.detail
    assert result.remediation  # non-empty remediation


def test_check_pixel_capi_short_pixel_id_fails():
    """A pixel_id shorter than MIN_PIXEL_ID_LEN fails."""
    fixture = _valid_pixel_capi_fixture()
    fixture["pixel_id"] = "abc"
    result = check_pixel_capi(fixture)
    assert not result.passed
    assert "pixel_id too short" in result.detail
    assert result.remediation


def test_check_pixel_capi_short_capi_token_fails():
    """A capi_token shorter than MIN_CAPI_TOKEN_LEN fails."""
    fixture = _valid_pixel_capi_fixture()
    fixture["capi_token"] = "short"
    result = check_pixel_capi(fixture)
    assert not result.passed
    assert "capi_token too short" in result.detail


# ---------- Gate-level tests: check_post_purchase_survey -------------------------

def test_check_survey_default_question_passes():
    """The default question phrasing passes."""
    result = check_post_purchase_survey(_valid_survey_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"


def test_check_survey_customized_question_fails():
    """Customized question text fails (Pitfall #4 — 30% response rate drop)."""
    fixture = _valid_survey_fixture()
    fixture["question"] = "Where did you hear about ACME WIDGETS?"
    result = check_post_purchase_survey(fixture)
    assert not result.passed
    assert "customized" in result.detail
    assert "default" in result.remediation


def test_check_survey_too_few_options_fails():
    """Fewer than MIN_SURVEY_OPTIONS options fails."""
    fixture = _valid_survey_fixture()
    fixture["options"] = ["TikTok", "Instagram"]
    result = check_post_purchase_survey(fixture)
    assert not result.passed
    assert f">= {MIN_SURVEY_OPTIONS}" in result.detail


def test_check_survey_min_order_value_too_high_fails():
    """min_order_value above MAX_SKIP_ORDER_VALUE fails."""
    fixture = _valid_survey_fixture()
    fixture["min_order_value"] = 100
    result = check_post_purchase_survey(fixture)
    assert not result.passed
    assert "out of range" in result.detail


def test_check_survey_min_order_value_negative_fails():
    """Negative min_order_value fails."""
    fixture = _valid_survey_fixture()
    fixture["min_order_value"] = -1
    result = check_post_purchase_survey(fixture)
    assert not result.passed


def test_check_survey_missing_question_fails():
    """Missing 'question' key fails."""
    fixture = _valid_survey_fixture()
    del fixture["question"]
    result = check_post_purchase_survey(fixture)
    assert not result.passed
    assert "question" in result.detail


# ---------- Gate-level tests: check_klaviyo_cohort_sync --------------------------

def test_check_klaviyo_valid_passes():
    """A Klaviyo fixture with api_key + required flows passes."""
    result = check_klaviyo_cohort_sync(_valid_klaviyo_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"


def test_check_klaviyo_missing_api_key_fails():
    """Missing api_key fails."""
    fixture = _valid_klaviyo_fixture()
    del fixture["api_key"]
    result = check_klaviyo_cohort_sync(fixture)
    assert not result.passed
    assert "api_key" in result.detail


def test_check_klaviyo_missing_required_flow_fails():
    """Missing the abandoned_cart OR welcome_series flow fails."""
    fixture = _valid_klaviyo_fixture()
    del fixture["flows"]
    fixture["flows"] = ["sms_welcome"]  # missing both required
    result = check_klaviyo_cohort_sync(fixture)
    assert not result.passed
    assert "abandoned_cart" in result.detail
    assert "welcome_series" in result.detail


def test_check_klaviyo_empty_flows_fails():
    """Empty flows list fails."""
    fixture = _valid_klaviyo_fixture()
    fixture["flows"] = []
    result = check_klaviyo_cohort_sync(fixture)
    assert not result.passed


# ---------- Gate-level tests: check_meta_capi ------------------------------------

def test_check_meta_capi_valid_passes():
    """A meta_capi fixture with all 3 keys passes."""
    result = check_meta_capi(_valid_meta_capi_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"


def test_check_meta_capi_missing_keys_fails():
    """Missing required keys fails with remediation."""
    result = check_meta_capi({})
    assert not result.passed
    assert "Missing keys" in result.detail
    missing_str = " ".join(["pixel_id", "capi_token", "test_event_code"])
    for key in missing_str.split():
        assert key in result.detail, f"{key} not in {result.detail}"


# ---------- Gate-level tests: check_google_enhanced_conversions ------------------

def test_check_google_valid_passes():
    """Valid Google fixture with send_hashed_email=true passes."""
    result = check_google_enhanced_conversions(_valid_google_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"


def test_check_google_send_hashed_email_false_fails():
    """send_hashed_email=false fails (Enhanced Conversions won't work)."""
    fixture = _valid_google_fixture()
    fixture["send_hashed_email"] = False
    result = check_google_enhanced_conversions(fixture)
    assert not result.passed
    assert "send_hashed_email is false" in result.detail


def test_check_google_missing_keys_fails():
    """Missing conversion_id or send_hashed_email fails."""
    result = check_google_enhanced_conversions({})
    assert not result.passed
    assert "Missing keys" in result.detail


# ---------- Gate-level tests: check_flow_event_names -----------------------------

def test_check_flow_event_names_valid_passes():
    """All 4 canonical flow names present passes."""
    result = check_flow_event_names(_valid_flow_event_names_fixture())
    assert result.passed, f"Expected pass, got: {result.detail}"


def test_check_flow_event_names_missing_fails():
    """Missing flow names fails."""
    fixture = _valid_flow_event_names_fixture()
    del fixture["sms_welcome"]
    result = check_flow_event_names(fixture)
    assert not result.passed
    assert "sms_welcome" in result.detail


# ---------- Gate-level tests: check_cohort_ltv_baseline (the killer test) --------

def test_check_cohort_ltv_valid_lift_passes():
    """A welcome-series cohort with >=10% lift passes."""
    result = check_cohort_ltv_baseline(_valid_cohort_fixture(on_ltv=80.0, off_ltv=70.0))
    assert result.passed, f"Expected pass, got: {result.detail}"
    # 80/70 - 1 = 14.29% lift
    assert "14.3%" in result.detail or "14.2%" in result.detail


def test_check_cohort_ltv_insufficient_lift_fails():
    """A welcome-series cohort with <10% lift fails."""
    result = check_cohort_ltv_baseline(_valid_cohort_fixture(on_ltv=72.0, off_ltv=70.0))
    assert not result.passed
    # 72/70 - 1 = 2.86% lift — below the 10% target
    assert "2.9%" in result.detail
    # Production formats with :.1f so 10.0 renders as "10.0%", not "10%"
    assert "10.0%" in result.detail


def test_check_cohort_ltv_zero_off_fails():
    """off_ltv=0 fails (cohort wasn't tracked)."""
    fixture = _valid_cohort_fixture(on_ltv=80.0, off_ltv=0.0)
    result = check_cohort_ltv_baseline(fixture)
    assert not result.passed
    assert "must be > 0" in result.detail


def test_check_cohort_ltv_missing_keys_fails():
    """Missing keys fails with remediation."""
    result = check_cohort_ltv_baseline({})
    assert not result.passed
    assert "Missing keys" in result.detail


def test_check_cohort_ltv_exact_10pct_lift_passes():
    """Exactly 10% lift passes (boundary case)."""
    result = check_cohort_ltv_baseline(_valid_cohort_fixture(on_ltv=77.0, off_ltv=70.0))
    assert result.passed, f"Expected pass at 10% boundary, got: {result.detail}"


# ---------- load_fixture / run_all_gates -----------------------------------------

def test_load_fixture_returns_dict_when_valid():
    """load_fixture returns the parsed dict when file is valid JSON."""
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "test.json")
        with open(path, "w") as f:
            json.dump({"key": "value"}, f)
        result = load_fixture(tmp, "test.json")
        assert result == {"key": "value"}


def test_load_fixture_returns_none_when_missing():
    """load_fixture returns None for missing files."""
    with tempfile.TemporaryDirectory() as tmp:
        result = load_fixture(tmp, "missing.json")
        assert result is None


def test_load_fixture_returns_none_when_invalid_json():
    """load_fixture returns None for malformed JSON."""
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "bad.json")
        with open(path, "w") as f:
            f.write("{not valid json")
        result = load_fixture(tmp, "bad.json")
        assert result is None


def test_run_all_gates_valid_fixtures_all_pass():
    """All valid fixtures → all 7 gates pass."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        report = run_all_gates(tmp)
        assert report.overall_passed, f"Expected all pass, got: {[g.detail for g in report.gates]}"
        assert len(report.gates) == len(GATE_FIXTURE_FILES)
        assert all(g.passed for g in report.gates)


def test_run_all_gates_missing_fixtures_all_fail():
    """Empty fixture dir → all gates fail with 'fixture missing' message."""
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(tmp, exist_ok=True)
        report = run_all_gates(tmp)
        assert not report.overall_passed
        assert len(report.gates) == len(GATE_FIXTURE_FILES)
        assert all(not g.passed for g in report.gates)
        assert all("Fixture file missing" in g.detail for g in report.gates)


def test_run_all_gates_only_check_runs_one_gate():
    """--check filters to a single gate."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        report = run_all_gates(tmp, only_check="pixel_capi")
        assert len(report.gates) == 1
        assert report.gates[0].gate_name == "pixel_capi"


def test_run_all_gates_overall_passed_reflects_all_gates():
    """overall_passed is True only if every gate passes."""
    with tempfile.TemporaryDirectory() as tmp:
        # Write valid fixtures except make survey invalid (customized question)
        _write_fixture_set(tmp)
        survey_path = os.path.join(tmp, "post_purchase_survey.json")
        with open(survey_path, "w") as f:
            json.dump({
                "question": "Where did you find us?",
                "options": ["A", "B", "C", "D"],
                "min_order_value": 20,
            }, f)
        report = run_all_gates(tmp)
        assert not report.overall_passed
        failed = [g for g in report.gates if not g.passed]
        assert len(failed) == 1
        assert failed[0].gate_name == "post_purchase_survey"


# ---------- bootstrap_fixtures ---------------------------------------------------

def test_bootstrap_creates_seven_fixture_files():
    """bootstrap_fixtures creates one file per gate."""
    with tempfile.TemporaryDirectory() as tmp:
        bootstrap_path = os.path.join(tmp, "tw_fixtures")
        rc = bootstrap_fixtures(bootstrap_path)
        assert rc == 0
        # All 7 fixture files should exist.
        assert os.path.isfile(os.path.join(bootstrap_path, "pixel_capi.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "post_purchase_survey.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "klaviyo_integration.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "meta_capi.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "google_enhanced.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "flow_event_names.json"))
        assert os.path.isfile(os.path.join(bootstrap_path, "cohort_ltv_baseline.json"))


def test_bootstrap_fixtures_have_valid_json():
    """All bootstrapped fixtures are valid JSON."""
    with tempfile.TemporaryDirectory() as tmp:
        bootstrap_path = os.path.join(tmp, "tw_fixtures")
        bootstrap_fixtures(bootstrap_path)
        # GATE_FIXTURE_FILES is {gate_name: (filename, check_fn)}; iterate values for filenames.
        for filename, _check_fn in GATE_FIXTURE_FILES.values():
            with open(os.path.join(bootstrap_path, filename), "r") as f:
                data = json.load(f)  # raises if invalid
                assert isinstance(data, dict)


def test_bootstrap_fixtures_fail_validation_until_replaced():
    """Bootstrapped fixtures fail at least one validation gate until REPLACE_WITH
    placeholders are filled in with real values. The cohort_ltv_baseline gate is
    the canary — bootstrapped with 0.0/0.0 which fails Gate G's > 0 check,
    signaling the operator to fill in real cohort LTV data.
    """
    with tempfile.TemporaryDirectory() as tmp:
        bootstrap_path = os.path.join(tmp, "tw_fixtures")
        bootstrap_fixtures(bootstrap_path)
        report = run_all_gates(bootstrap_path)
        # Bootstrapped state should NOT pass overall — at minimum Gate G fails
        # on the 0.0 off-cohort LTV (and several other gates fail because
        # the REPLACE_WITH placeholders are placeholder strings, not real values).
        assert not report.overall_passed
        # Verify the cohort_ltv_baseline gate is the one failing — this is the
        # operator-facing signal that they haven't filled in real LTV data yet.
        cohort_gate = next(g for g in report.gates if g.gate_name == "cohort_ltv_baseline")
        assert not cohort_gate.passed
        assert "must be > 0" in cohort_gate.detail
        # The cohort_ltv_baseline fixture file should still contain the
        # REPLACE guidance comment so the operator knows what to fill in.
        with open(os.path.join(bootstrap_path, "cohort_ltv_baseline.json"), "r") as f:
            cohort_json = json.load(f)
        assert "_comment" in cohort_json
        assert "14 days" in cohort_json["_comment"]  # guidance for filling in


# ---------- render_human --------------------------------------------------------

def test_render_human_includes_passed_marker():
    """render_human output contains the ✓ marker for passed gates."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        report = run_all_gates(tmp)
        out = render_human(report)
        assert "✓" in out
        assert "Triple Whale Attribution Check" in out
        assert "Summary: 7/7 gates passed" in out
        assert "ALL GATES PASSED" in out


def test_render_human_includes_failed_marker():
    """render_human output contains the ✗ marker for failed gates."""
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(tmp, exist_ok=True)
        report = run_all_gates(tmp)
        out = render_human(report)
        assert "✗" in out
        assert "SOME GATES FAILED" in out


def test_render_human_includes_remediation_when_failed():
    """render_human includes the remediation text when a gate fails."""
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(tmp, exist_ok=True)
        report = run_all_gates(tmp)
        out = render_human(report)
        # The pixel_capi gate's remediation mentions REPLACE_WITH
        assert "→" in out  # arrow prefix on remediation lines
        assert "pixel_capi.json" in out  # remediation mentions the file


# ---------- CLI / main ----------------------------------------------------------

def test_cli_help_runs_clean():
    """--help exits cleanly (no crash)."""
    buf = io.StringIO()
    with redirect_stdout(buf):
        try:
            main(["--help"])
        except SystemExit as e:
            assert e.code in (0, None)


def test_cli_json_output_is_valid_json():
    """--json emits a valid JSON object containing the gate results."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--fixtures-dir", tmp, "--json"])
        assert rc == 0
        payload = json.loads(buf.getvalue())
        assert payload["overall_passed"] is True
        assert payload["summary"]["passed"] == 7
        assert payload["summary"]["total"] == 7
        assert len(payload["gates"]) == 7
        for gate in payload["gates"]:
            assert "gate" in gate
            assert "passed" in gate
            assert "detail" in gate


def test_cli_single_check_runs_only_one_gate():
    """--check filters to a single gate."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--fixtures-dir", tmp, "--check", "pixel_capi"])
        assert rc == 0
        out = buf.getvalue()
        assert "pixel_capi" in out
        # Other gates should NOT appear in the human output
        assert "klaviyo_cohort_sync" not in out
        assert "cohort_ltv_baseline" not in out


def test_cli_returns_nonzero_on_failure():
    """CLI returns exit code 1 when any gate fails."""
    with tempfile.TemporaryDirectory() as tmp:
        # Write only the pixel_capi fixture; everything else is missing.
        os.makedirs(tmp, exist_ok=True)
        with open(os.path.join(tmp, "pixel_capi.json"), "w") as f:
            json.dump(_valid_pixel_capi_fixture(), f)
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--fixtures-dir", tmp])
        assert rc == 1


def test_cli_subprocess_runs_and_emits_human_output():
    """End-to-end: run the script as a subprocess; verify human output."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        proc = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/triple_whale_attribution_check.py",
             "--fixtures-dir", tmp],
            capture_output=True, text=True, timeout=30,
        )
        assert proc.returncode == 0, f"stdout={proc.stdout}\nstderr={proc.stderr}"
        assert "Triple Whale Attribution Check" in proc.stdout
        assert "ALL GATES PASSED" in proc.stdout


def test_cli_subprocess_json_roundtrip():
    """End-to-end: --json output roundtrips through json.loads."""
    with tempfile.TemporaryDirectory() as tmp:
        _write_fixture_set(tmp)
        proc = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/triple_whale_attribution_check.py",
             "--fixtures-dir", tmp, "--json"],
            capture_output=True, text=True, timeout=30,
        )
        assert proc.returncode == 0, f"stderr={proc.stderr}"
        payload = json.loads(proc.stdout)
        assert payload["overall_passed"] is True


def test_parse_args_defaults():
    """parse_args with no args returns sensible defaults."""
    args = parse_args([])
    assert args.fixtures_dir == "./tw_fixtures/"
    assert args.check is None
    assert args.json is False
    assert args.bootstrap is None


def test_parse_args_with_check():
    """parse_args accepts --check flag with valid gate name."""
    args = parse_args(["--check", "cohort_ltv_baseline"])
    assert args.check == "cohort_ltv_baseline"


def test_parse_args_with_bootstrap():
    """parse_args accepts --bootstrap flag with directory path."""
    args = parse_args(["--bootstrap", "/tmp/fixtures"])
    assert args.bootstrap == "/tmp/fixtures"


# ---------- Realistic scenario ---------------------------------------------------

def test_realistic_scenario_brand_at_5m_gmv():
    """A realistic $5M-GMV brand's fixtures should pass all gates.

    Models the canonical case from the playbook's Cost & ROI section
    (Triple Whale Starter, $5M GMV, $10k/mo paid spend).
    """
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(tmp, exist_ok=True)
        fixtures = {
            "pixel_capi.json": {
                "pixel_id": "tw_pixel_realistic_8chars",
                "capi_token": "capi_realistic_32_chars_padding_for_length",
            },
            "post_purchase_survey.json": {
                "question": "How did you hear about us?",
                "options": ["TikTok", "Instagram", "Google", "Friend", "Podcast", "Blog", "Other"],
                "min_order_value": 20,
            },
            "klaviyo_integration.json": {
                "api_key": "pk_realistic_api_key_padding_for_length",
                "flows": ["abandoned_cart", "welcome_series", "post_purchase_upsell", "sms_welcome"],
            },
            "meta_capi.json": {
                "pixel_id": "meta_pixel_realistic_padding",
                "capi_token": "meta_capi_realistic_padding_for_length",
                "test_event_code": "TEST12345",
            },
            "google_enhanced.json": {
                "conversion_id": "AW-123456789",
                "send_hashed_email": True,
            },
            "flow_event_names.json": {
                "abandoned_cart": "Abandoned Cart Reminder",
                "welcome_series": "Welcome Series",
                "post_purchase_upsell": "Post-Purchase Upsell",
                "sms_welcome": "SMS Welcome",
            },
            "cohort_ltv_baseline.json": {
                # 18% lift — exceeds 10% target, demonstrates attribution is working
                "welcome_series_on_30d_ltv": 118.0,
                "welcome_series_off_30d_ltv": 100.0,
            },
        }
        for filename, content in fixtures.items():
            with open(os.path.join(tmp, filename), "w") as f:
                json.dump(content, f)
        report = run_all_gates(tmp)
        assert report.overall_passed, f"Realistic scenario should pass; failures: {[g.detail for g in report.gates if not g.passed]}"
        assert report.to_dict()["summary"]["passed"] == 7


# ---------- Runner --------------------------------------------------------------

def main_test():
    """Manual test runner — no pytest dependency."""
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0
    for fn in tests:
        try:
            fn()
        except Exception as e:  # noqa: BLE001
            print(f"  FAIL  {fn.__name__}: {e}")
            failed += 1
        else:
            print(f"  PASS  {fn.__name__}")
            passed += 1
    print(f"\n{passed} passed, {failed} failed (of {len(tests)})")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main_test())
