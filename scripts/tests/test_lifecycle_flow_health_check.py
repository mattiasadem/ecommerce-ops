#!/usr/bin/env python3
"""
test_lifecycle_flow_health_check.py — TDD tests for the lifecycle flow health
checker (Archetype C/D-light hybrid per-flow KPI audit per playbook 12 + research/05).

Companion to:
- research/05-lifecycle-marketing.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/12-lifecycle-flow-library.md (operator-build for the 20-flow library)
- assets/14-lifecycle-flow-templates.md (17 flows × 5 voices = 85 voice-variant templates)

Run: python3 scripts/tests/test_lifecycle_flow_health_check.py

The script takes per-flow KPI snapshots (one JSON per flow + a fixture-dir
manifest) and scores each flow against the canonical KPI benchmarks from
research/05 §Pillars (per-pillar canonical KPIs) + playbook 12 §Step-by-step
(expected lift bands). The 6 gates × 13 live Path-B flows = 78 gate-flow
combinations, per research/05 line 287. The script outputs a per-flow 0-100
score + a prioritized fix-list.

Canonical KPI benchmarks (from research/05 §Pillars):
- Gate A: open_rate ≥ 35%        (Klaviyo 2024 benchmark)
- Gate B: click_rate ≥ 4%        (Klaviyo 2024 benchmark)
- Gate C: cvr ≥ 0.8%             (Klaviyo 2024 benchmark)
- Gate D: unsubscribe_rate ≤ 0.3% per email (deliverability floor)
- Gate E: revenue_per_1k ≥ pillar floor (per-flow)
- Gate F: flow_attribution_match ≥ 60%   (Triple Whale cohort-sync signal)
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

from lifecycle_flow_health_check import (  # noqa: E402
    FlowFixture,
    FlowScore,
    FlowVerdict,
    build_fixtures_index,
    classify_flow,
    main,
    parse_args,
    render_human,
    score_flow,
    summarize_fixtures,
)


# ----- Test fixture builders --------------------------------------------------

def _canonical_pass_fixture(flow_id: str = "1.1_browse_abandon",
                            pillar: str = "P1_browse_abandon") -> dict:
    """A fixture that passes all 6 gates (canonical-pass values)."""
    return {
        "flow_id": flow_id,
        "flow_name": "Browse-abandon (Tier 1)",
        "pillar": pillar,
        "tier": 1,
        "channel": "email",
        "kpis_30d": {
            "sent": 5000,
            "opens": 2000,        # 40% open_rate (passes >=35%)
            "clicks": 250,        # 5% click_rate (passes >=4%)
            "conversions": 50,    # 1% CVR (passes >=0.8%)
            "unsubscribes": 10,   # 0.2% unsub rate (passes <=0.3%)
            "revenue": 4500.0,    # $900/1k sent (passes Pillar 1 floor $300-800)
            "flow_attributed": 35,  # 70% of 50 conversions match flow attribution (>=60%)
        },
    }


def _browse_abandon_canonical():
    return _canonical_pass_fixture("1.1_browse_abandon", "P1_browse_abandon")


def _winback_canonical():
    return {
        "flow_id": "1.2_winback",
        "flow_name": "Customer winback (Tier 1)",
        "pillar": "P2_winback_sunset",
        "tier": 1,
        "channel": "email",
        "kpis_30d": {
            "sent": 1500,
            "opens": 600,        # 40% open_rate
            "clicks": 75,        # 5% click_rate
            "conversions": 12,   # 0.8% CVR (at the floor)
            "unsubscribes": 3,   # 0.2%
            "revenue": 900.0,    # $600/1k sent (passes Pillar 2 floor $400-1.2k)
            "flow_attributed": 9,  # 75% match (passes >=60%)
        },
    }


# ----- Test 1 — Module imports and surface ---------------------------------

def test_module_imports_canonical_classes():
    """The lifecycle_flow_health_check module exposes FlowFixture / FlowScore /
    FlowVerdict dataclasses + the 7 canonical helpers."""
    # FlowFixture is a dataclass; verify its fields
    assert set(FlowFixture.__dataclass_fields__.keys()) >= {
        "flow_id", "flow_name", "pillar", "tier", "channel", "kpis_30d",
    }
    # FlowScore is a dataclass; verify its fields
    assert set(FlowScore.__dataclass_fields__.keys()) >= {
        "flow_id", "flow_name", "pillar", "tier", "channel",
        "verdict", "overall_score", "gates_passed", "gates_failed",
        "failed_gates",
    }
    # FlowVerdict is an Enum with 4 levels
    assert FlowVerdict.PASS.value == "PASS"
    assert FlowVerdict.WARN.value == "WARN"
    assert FlowVerdict.NEEDS_WORK.value == "NEEDS_WORK"
    assert FlowVerdict.FAIL.value == "FAIL"
    for fn in (build_fixtures_index, classify_flow, parse_args, render_human,
               score_flow, summarize_fixtures, main):
        assert callable(fn)


def test_canonical_thresholds_published():
    """The 6 canonical KPI thresholds + the 5 per-pillar revenue floors are
    pinned as module constants."""
    import lifecycle_flow_health_check as m
    assert m.OPEN_RATE_FLOOR == 0.35
    assert m.CLICK_RATE_FLOOR == 0.04
    assert m.CVR_FLOOR == 0.008
    assert m.UNSUBSCRIBE_RATE_CEIL == 0.003
    assert m.FLOW_ATTRIBUTION_MATCH_FLOOR == 0.60
    assert m.REVENUE_FLOORS_PER_PILLAR == {
        "P1_browse_abandon": (300.0, 800.0),
        "P2_winback_sunset": (400.0, 1200.0),
        "P3_post_purchase_loyalty": (500.0, 1500.0),
        "P4_replenishment": (800.0, 2500.0),
        "P5_celebratory": (200.0, 800.0),
    }


# ----- Test 2 — Fixture loading ----------------------------------------------

def test_build_fixtures_index_reads_dir(tmp_fixtures_dir):
    """build_fixtures_index reads every *.json in the dir + builds a dict
    keyed by flow_id."""
    idx = build_fixtures_index(tmp_fixtures_dir)
    assert isinstance(idx, dict)
    assert "1.1_browse_abandon" in idx
    assert "1.2_winback" in idx
    assert idx["1.1_browse_abandon"].pillar == "P1_browse_abandon"
    assert idx["1.2_winback"].pillar == "P2_winback_sunset"


def test_summarize_fixtures_counts():
    """summarize_fixtures returns the total flow count + per-pillar breakdown."""
    idx = {
        "a": _canonical_pass_fixture("a", "P1_browse_abandon"),
        "b": _canonical_pass_fixture("b", "P2_winback_sunset"),
        "c": _canonical_pass_fixture("c", "P3_post_purchase_loyalty"),
    }
    fixtures = [FlowFixture(**f) for f in idx.values()]
    s = summarize_fixtures(fixtures)
    assert s["total"] == 3
    assert s["by_pillar"]["P1_browse_abandon"] == 1
    assert s["by_pillar"]["P2_winback_sunset"] == 1
    assert s["by_pillar"]["P3_post_purchase_loyalty"] == 1


# ----- Test 3 — Per-flow scoring ---------------------------------------------

def test_score_flow_canonical_pass_returns_pass_verdict():
    """A canonical-pass fixture passes all 6 gates → PASS verdict."""
    fx = FlowFixture(**_browse_abandon_canonical())
    score = score_flow(fx)
    assert isinstance(score, FlowScore)
    assert score.verdict == FlowVerdict.PASS
    assert score.gates_failed == 0
    assert score.gates_passed == 6
    assert 95 <= score.overall_score <= 100


def test_score_flow_low_open_rate_fails_gate_a():
    """open_rate below 35% fails Gate A."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["opens"] = 1500   # 30% open rate < 35%
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert score.verdict != FlowVerdict.PASS
    assert any("Gate A" in g or "open_rate" in g.lower() for g in score.failed_gates)


def test_score_flow_low_click_rate_fails_gate_b():
    """click_rate below 4% fails Gate B."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["clicks"] = 150   # 3% < 4%
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert any("Gate B" in g or "click_rate" in g.lower() for g in score.failed_gates)


def test_score_flow_low_cvr_fails_gate_c():
    """CVR below 0.8% fails Gate C."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["conversions"] = 20  # 0.4% < 0.8%
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert any("Gate C" in g or "cvr" in g.lower() for g in score.failed_gates)


def test_score_flow_high_unsub_fails_gate_d():
    """unsubscribe_rate above 0.3% fails Gate D."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["unsubscribes"] = 25  # 0.5% > 0.3%
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert any("Gate D" in g or "unsub" in g.lower() for g in score.failed_gates)


def test_score_flow_low_revenue_fails_gate_e():
    """Revenue per 1k below the pillar floor fails Gate E."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["revenue"] = 1000.0   # $200/1k < $300 floor for Pillar 1
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert any("Gate E" in g or "revenue" in g.lower() for g in score.failed_gates)


def test_score_flow_low_attribution_fails_gate_f():
    """flow_attribution_match below 60% fails Gate F."""
    fx_dict = _browse_abandon_canonical()
    fx_dict["kpis_30d"]["flow_attributed"] = 10  # 10/50 = 20% < 60%
    fx = FlowFixture(**fx_dict)
    score = score_flow(fx)
    assert any("Gate F" in g or "attribution" in g.lower() for g in score.failed_gates)


# ----- Test 4 — classify_flow + verdict levels ------------------------------

def test_classify_flow_returns_pillar_enum():
    """classify_flow returns the canonical pillar identifier."""
    assert classify_flow("1.1_browse_abandon") == "P1_browse_abandon"
    assert classify_flow("2.3_loyalty_tier_up_down") == "P3_post_purchase_loyalty"
    assert classify_flow("3.2_replenishment") == "P4_replenishment"
    assert classify_flow("2.1_birthday") == "P5_celebratory"


def test_verdict_levels_for_total_score():
    """overall_score → verdict mapping: 90-100=PASS, 75-89=WARN, 50-74=NEEDS_WORK, <50=FAIL."""
    from lifecycle_flow_health_check import score_to_verdict
    assert score_to_verdict(95) == FlowVerdict.PASS
    assert score_to_verdict(80) == FlowVerdict.WARN
    assert score_to_verdict(60) == FlowVerdict.NEEDS_WORK
    assert score_to_verdict(30) == FlowVerdict.FAIL


# ----- Test 5 — CLI behavior -------------------------------------------------

def test_help_prints_usage():
    """--help exits 0 and prints usage info."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--help"],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0
    assert "usage" in result.stdout.lower() or "Usage" in result.stdout


def test_bootstrap_creates_canonical_fixtures(tmp_fixtures_dir):
    """--bootstrap creates a canonical-pass fixture set for each of the 13 Path-B flows."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--bootstrap", "--fixtures-dir", tmp_fixtures_dir],
        capture_output=True, text=True, timeout=15,
    )
    assert result.returncode == 0, result.stderr
    files = [f for f in os.listdir(tmp_fixtures_dir) if f.endswith(".json")]
    assert len(files) >= 13, f"Expected ≥13 Path-B flow fixtures, got {len(files)}: {files}"
    # Each fixture must have the canonical structure
    import json as _json
    sample = _json.loads(open(os.path.join(tmp_fixtures_dir, files[0])).read())
    for key in ("flow_id", "flow_name", "pillar", "tier", "channel", "kpis_30d"):
        assert key in sample, f"Missing key {key} in bootstrapped fixture {files[0]}"


def test_json_output_roundtrips_for_canonical_pass(tmp_fixtures_dir):
    """--fixtures-dir + --json emits valid JSON with all 4 top-level keys."""
    subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--bootstrap", "--fixtures-dir", tmp_fixtures_dir],
        capture_output=True, text=True, timeout=15,
        check=True,
    )
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--fixtures-dir", tmp_fixtures_dir, "--json"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    for key in ("fixture_dir", "scores", "overall"):
        assert key in payload, f"Missing key {key} in JSON output"
    # 'summary' lives under 'overall' (the canonical OverallReport shape)
    assert "summary" in payload["overall"], "Missing 'summary' under 'overall'"
    assert "passed" in payload["overall"], "Missing 'passed' under 'overall'"


def test_human_output_for_canonical_pass(tmp_fixtures_dir):
    """Default human output mentions PASS verdict + per-flow scores for the
    canonical bootstrap set."""
    subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--bootstrap", "--fixtures-dir", tmp_fixtures_dir],
        capture_output=True, text=True, timeout=15,
        check=True,
    )
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--fixtures-dir", tmp_fixtures_dir],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stderr
    assert "PASS" in result.stdout
    assert "13" in result.stdout or "Total flows" in result.stdout


def test_only_check_single_flow(tmp_fixtures_dir):
    """--only-check <flow_id> returns 0 if that flow passes all gates; 1 if it fails."""
    subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--bootstrap", "--fixtures-dir", tmp_fixtures_dir],
        capture_output=True, text=True, timeout=15,
        check=True,
    )
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
         "--fixtures-dir", tmp_fixtures_dir, "--only-check", "1.1_browse_abandon"],
        capture_output=True, text=True, timeout=15,
    )
    # canonical bootstrap should pass — exit 0
    assert result.returncode == 0, result.stderr


# ----- Pytest fixture (NOT pytest — stdlib only) ---------------------------

class _T:
    """Tiny helper: provides a tmp_fixtures_dir fixture-like via pytest-style
    autouse when pytest is installed, otherwise the function runs in isolation
    and the fixture function is captured by name."""
    pass


import tempfile
import shutil


def tmp_fixtures_dir(_t=None):
    """Yield a fresh empty tmp dir for the test; clean up at end.

    When called by pytest (function-scoped fixture), pytest passes nothing
    and yields. When called as a regular function (no pytest), we return the
    path directly so the test body can use it without `yield`.
    """
    d = tempfile.mkdtemp(prefix="lfhc_test_")
    return d


# Pytest needs the fixture to accept the pytest fixture `tmp_path` (auto-discovered)
# but we also support plain function call. Detect with try/except on pytest import.
try:
    import pytest  # type: ignore
    _tmp_fixtures_dir = pytest.fixture(name="tmp_fixtures_dir")(tmp_fixtures_dir)
except ImportError:
    _tmp_fixtures_dir = tmp_fixtures_dir


# Monkey-patch the test body so when called as plain functions, they use a
# local fixture path. The test body reference `tmp_fixtures_dir` is replaced
# with the no-arg version that returns a fresh dir.

_orig_test_funcs = {}


def _wrap_with_fixture(fn):
    """Wrap a test function so the `tmp_fixtures_dir` arg is auto-populated
    with a fresh tmp dir (containing canonical bootstrap fixtures), then
    cleaned up after."""
    def wrapper(*args, **kwargs):
        if "tmp_fixtures_dir" in kwargs:
            return fn(*args, **kwargs)
        d = tempfile.mkdtemp(prefix="lfhc_test_")
        # Auto-bootstrap the 13 canonical fixtures before each test runs
        # (mirrors the v2.62.0 sibling-stub-injection pattern — the test
        # assumes a populated fixtures dir, so the wrapper provides one)
        try:
            subprocess.run(
                [sys.executable,
                 os.path.join(SCRIPTS_DIR, "lifecycle_flow_health_check.py"),
                 "--bootstrap", "--fixtures-dir", d],
                capture_output=True, text=True, timeout=15,
            )
            return fn(tmp_fixtures_dir=d)
        finally:
            shutil.rmtree(d, ignore_errors=True)
    wrapper.__name__ = fn.__name__
    return wrapper


for _name, _obj in list(globals().items()):
    if _name.startswith("test_") and callable(_obj):
        if "tmp_fixtures_dir" in getattr(_obj, "__code__").co_varnames:
            _orig_test_funcs[_name] = _obj
            globals()[_name] = _wrap_with_fixture(_obj)


# ----- Runner --------------------------------------------------------------

def main_test():
    """Manual test runner — no pytest dependency (mirrors test_international_market_fit.py)."""
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0
    for fn in tests:
        # Fixture-using tests get a fresh tmp dir each run
        if "tmp_fixtures_dir" in getattr(fn, "__code__", type("X", (), {"co_varnames": ()})()).co_varnames:
            wrapped = _wrap_with_fixture(fn)
            try:
                wrapped()
            except Exception as e:  # noqa: BLE001
                print(f"  FAIL  {fn.__name__}: {e}")
                failed += 1
                continue
            else:
                print(f"  PASS  {fn.__name__}")
                passed += 1
                continue
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
