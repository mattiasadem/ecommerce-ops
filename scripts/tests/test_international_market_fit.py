#!/usr/bin/env python3
"""
test_international_market_fit.py — TDD tests for the international market-fit
Path A/B/C scorer (Archetype A/B hybrid scoring script per playbook 11 + research/04).

Companion to:
- research/04-international-expansion.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/11-international-rollout.md (Phase 1+2+3+4 operator build)
- assets/13-international-pricing-card.md (paste-ready 7-market × 5-voice price-card)

Run: python3 scripts/tests/test_international_market_fit.py

The script takes a brand's US-baseline inputs (us_gmv / category / us_aov /
us_contribution_margin_pct / supply_chain_complexity / operator_capacity_hours_per_week)
→ outputs Path A / B / C recommendation + cost stack + expected lift + per-market projection
+ 6-step build sequence.

The scoring rule (mirrors research/04 §GMV-tier paths + playbook 11 §Prerequisites):
- US GMV < $1M                  → Path A (CA only)            — deferred from international
- US GMV $1M–$10M               → Path B (CA+UK+EU+AU)        — default for most operators
- US GMV $10M–$50M              → Path C (all 7 markets)      — gated on operator capacity
- US GMV > $50M                 → Path C+ (Path C plus in-region 3PL)
- US contribution margin < 30%  → downgrade one tier (Path B → Path A; Path C → Path B)
- Supply chain complexity = 3   → downgrade one tier
- Operator capacity < 4 hr/wk   → downgrade one tier
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

from international_market_fit import (  # noqa: E402
    BrandInputs,
    PathRecommendation,
    build_inputs,
    classify_category,
    main,
    parse_args,
    recommend_path,
    render_human,
    project_per_market_lift,
)


# ----- Input validation ----------------------------------------------------

def test_inputs_validate_negative_gmv():
    """us_gmv < 0 must raise ValueError."""
    try:
        BrandInputs(us_gmv=-1.0, category="apparel", us_aov=75.0,
                    us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                    operator_capacity_hours_per_week=8)
    except ValueError:
        return
    raise AssertionError("us_gmv=-1 should raise ValueError")


def test_inputs_validate_invalid_supply_chain_complexity():
    """supply_chain_complexity must be 1, 2, or 3."""
    try:
        BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                    us_contribution_margin_pct=70.0, supply_chain_complexity=4,
                    operator_capacity_hours_per_week=8)
    except ValueError:
        return
    raise AssertionError("supply_chain_complexity=4 should raise ValueError")


def test_inputs_validate_contribution_margin_above_100():
    """us_contribution_margin_pct > 100 must raise ValueError."""
    try:
        BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                    us_contribution_margin_pct=150.0, supply_chain_complexity=1,
                    operator_capacity_hours_per_week=8)
    except ValueError:
        return
    raise AssertionError("contribution_margin=150 should raise ValueError")


def test_inputs_validate_negative_operator_capacity():
    """operator_capacity_hours_per_week < 0 must raise ValueError."""
    try:
        BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                    us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                    operator_capacity_hours_per_week=-1)
    except ValueError:
        return
    raise AssertionError("operator_capacity=-1 should raise ValueError")


# ----- Category classification ---------------------------------------------

def test_classify_category_apparel_high_fit():
    """Apparel, beauty, home goods → high category fit (Tier 1)."""
    assert classify_category("apparel") == "high"
    assert classify_category("beauty") == "high"
    assert classify_category("home_goods") == "high"


def test_classify_category_electronics_medium_fit():
    """Consumer electronics → medium fit (voltage + adapter friction)."""
    assert classify_category("electronics") == "medium"


def test_classify_category_food_low_fit():
    """Food, supplements → low fit (FDA + per-market regulatory)."""
    assert classify_category("food") == "low"
    assert classify_category("supplements") == "low"


def test_classify_category_unknown_defaults_medium():
    """Unknown category → medium fit (conservative default)."""
    assert classify_category("unknown_category") == "medium"


# ----- Path recommendation (the core scoring rule) -------------------------

def test_recommend_path_a_for_micro_brand():
    """$300k US GMV → Path A (CA only) as deferral. Justification explains the deferral."""
    inputs = BrandInputs(us_gmv=300_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    assert rec.path == "A", rec.path
    assert rec.markets == ["CA"], rec.markets
    # Justification explains the deferral (path A is the audit/deferral path below $1M floor)
    assert "defer" in rec.justification.lower() or "$1M" in rec.justification
    # Cost stack should match the playbook 11 §Cost & ROI table for Path A
    assert 500 <= rec.cost_one_time_low <= 2_000
    assert 50 <= rec.cost_recurring_low <= 200


def test_recommend_path_b_for_default_mid_brand():
    """$5M US GMV (the canonical research/04 + playbook 11 default) → Path B."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    assert rec.path == "B", rec.path
    assert rec.markets == ["CA", "UK", "EU", "AU"], rec.markets
    # Cost stack should match the playbook 11 §Cost & ROI table for Path B
    assert 2_500 <= rec.cost_one_time_low <= 7_500
    assert 600 <= rec.cost_recurring_low <= 1_200


def test_recommend_path_c_for_large_brand():
    """$15M US GMV + high operator capacity → Path C (all 7 markets)."""
    inputs = BrandInputs(us_gmv=15_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=12)
    rec = recommend_path(inputs)
    assert rec.path == "C", rec.path
    assert len(rec.markets) == 7, rec.markets
    assert "JP" in rec.markets
    # Cost stack should match Path C
    assert rec.cost_one_time_low >= 15_000


def test_recommend_path_downgrade_for_low_margin():
    """$5M GMV but 25% contribution margin (< 30% gate per playbook 11 §Prereq #6) → downgrade to Path A."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=25.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    # Path B would normally be the default for $5M, but <30% margin downgrades to A
    assert rec.path == "A", rec.path
    assert "margin" in rec.justification.lower() or "30%" in rec.justification


def test_recommend_path_downgrade_for_high_supply_chain_complexity():
    """$5M GMV but supply_chain_complexity=3 (heavy/bulky with US-only packaging) → downgrade."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=3,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    assert rec.path == "A", rec.path
    assert "supply" in rec.justification.lower() or "complexity" in rec.justification.lower()


def test_recommend_path_downgrade_for_low_operator_capacity():
    """$5M GMV but only 2 hr/wk operator capacity (< 4 hr/wk floor per playbook 11) → downgrade."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=2)
    rec = recommend_path(inputs)
    assert rec.path == "A", rec.path
    assert "operator" in rec.justification.lower() or "capacity" in rec.justification.lower()


def test_recommend_path_c_for_mega_brand():
    """$60M US GMV → Path C+ (Path C with in-region 3PL distribution; gated on operator capacity)."""
    inputs = BrandInputs(us_gmv=60_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=20)
    rec = recommend_path(inputs)
    # Path C for $60M with all gates green
    assert rec.path in ("C", "C+"), rec.path


def test_recommend_path_below_floor_returns_path_a():
    """$50k US GMV (well below the $1M floor for international) → Path A as deferral."""
    inputs = BrandInputs(us_gmv=50_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=4)
    rec = recommend_path(inputs)
    # Per playbook 11 §Prerequisites: "Pre-revenue brands (defer until $1M+ GMV)"
    assert rec.path == "A", rec.path
    assert "$1M" in rec.justification or "defer" in rec.justification.lower()


# ----- Per-market projection ----------------------------------------------

def test_project_per_market_lift_path_b():
    """Path B with $5M US base → per-market projection for CA + UK + EU + AU.
    Total projected Year-1 lift should land in the playbook 11 30–80% range."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    proj = project_per_market_lift(inputs, rec)
    assert "CA" in proj
    assert "UK" in proj
    assert "EU" in proj
    assert "AU" in proj
    # Each per-market projected annual revenue should be > 0
    for market, value in proj.items():
        assert value > 0, f"{market}: {value}"
    # Total projected international revenue should land in 30–80% range of $5M US base
    total = sum(proj.values())
    assert 1_500_000 <= total <= 4_000_000, total  # 30% to 80% of $5M


def test_project_per_market_lift_path_a():
    """Path A → only CA in projection."""
    inputs = BrandInputs(us_gmv=300_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=4)
    rec = recommend_path(inputs)
    proj = project_per_market_lift(inputs, rec)
    assert list(proj.keys()) == ["CA"], proj


# ----- Build-sequence recipe ----------------------------------------------

def test_recommendation_includes_six_step_build():
    """Every recommendation carries the 6-step build recipe from playbook 11."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    assert len(rec.build_sequence) == 6, rec.build_sequence
    # Step 1 should always be path + market selection
    assert "path" in rec.build_sequence[0].lower() or "market" in rec.build_sequence[0].lower()


# ----- CLI plumbing -------------------------------------------------------

def test_parse_args_defaults():
    """Defaults: $5M US GMV apparel brand with sane operating parameters."""
    args = parse_args([])
    assert args.us_gmv == 5_000_000.0
    assert args.category == "apparel"
    assert args.us_aov == 75.0
    assert args.us_contribution_margin_pct == 70.0
    assert args.supply_chain_complexity == 1
    assert args.operator_capacity_hours_per_week == 8


def test_parse_args_custom_inputs():
    """CLI flags override defaults."""
    args = parse_args(["--us-gmv", "15000000", "--category", "beauty",
                       "--us-aov", "85", "--us-contribution-margin-pct", "55",
                       "--supply-chain-complexity", "2",
                       "--operator-capacity-hours-per-week", "12"])
    assert args.us_gmv == 15_000_000.0
    assert args.category == "beauty"
    assert args.us_aov == 85.0
    assert args.us_contribution_margin_pct == 55.0
    assert args.supply_chain_complexity == 2
    assert args.operator_capacity_hours_per_week == 12


def test_render_human_contains_key_figures():
    """Human render surfaces path + markets + cost stack + lift + build sequence."""
    inputs = BrandInputs(us_gmv=5_000_000.0, category="apparel", us_aov=75.0,
                         us_contribution_margin_pct=70.0, supply_chain_complexity=1,
                         operator_capacity_hours_per_week=8)
    rec = recommend_path(inputs)
    out = render_human(inputs, rec)
    assert "Path B" in out
    assert "CA" in out and "UK" in out and "EU" in out and "AU" in out
    assert "Cost stack" in out or "cost" in out.lower()
    assert "Step 1" in out
    assert "Step 6" in out


def test_json_output_includes_inputs_and_recommendation():
    """--json output includes inputs + path + markets + cost stack + build sequence."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "international_market_fit.py"),
         "--us-gmv", "5000000", "--json"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert "inputs" in payload
    assert "recommendation" in payload
    assert payload["recommendation"]["path"] == "B"
    assert payload["recommendation"]["markets"] == ["CA", "UK", "EU", "AU"]
    assert "cost_one_time_low" in payload["recommendation"]
    assert "cost_one_time_high" in payload["recommendation"]
    assert "build_sequence" in payload["recommendation"]
    assert len(payload["recommendation"]["build_sequence"]) == 6


def test_json_output_path_c_for_mega_brand():
    """$60M US GMV → Path C in JSON output."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "international_market_fit.py"),
         "--us-gmv", "60000000", "--operator-capacity-hours-per-week", "20",
         "--json"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["recommendation"]["path"] in ("C", "C+")
    assert len(payload["recommendation"]["markets"]) >= 7


def test_help_prints_usage():
    """--help exits 0 and prints usage."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "international_market_fit.py"),
         "--help"],
        capture_output=True, text=True, timeout=10,
    )
    assert result.returncode == 0
    assert "usage" in result.stdout.lower() or "Usage" in result.stdout


# ----- Runner --------------------------------------------------------------

def main_test():
    """Manual test runner — no pytest dependency (mirrors test_abandoned_cart_roi.py)."""
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