"""
TDD tests for ai_ad_creative_roi.py — Move #10 (AI ad creative iteration) ROI calculator.

Spec:
    - Inputs: monthly_ad_spend (USD), baseline_roas (e.g. 2.5 = $2.50 revenue per $1 spend),
      expected_roas_lift_pct (e.g. 0.20 = +20%), ai_tool_cost_monthly (USD, default $149),
      creative_variants_per_week (default 10), ai_tools_count (default 1),
      operator_hours_per_week (default 2, hours the operator spends curating AI outputs),
      operator_hourly_cost (default $50), attribution_tool (boolean — uses Triple Whale,
      affects measurement confidence).
    - Outputs: baseline_revenue_monthly, lift_revenue_monthly (incremental revenue from
      the ROAS lift), net_revenue_monthly (lift_revenue - ai_tool_cost - operator_cost),
      cost_per_variant (total_cost / variants_per_month), revenue_per_variant,
      roas_lift_payback_days, net_roas_improvement (post-tool ROAS - baseline).
    - Health band: great (net_revenue_monthly >= 10x ai_tool_cost), good (3-10x),
      marginal (1-3x), weak (positive but <1x), negative (net < 0).
    - Validation: monthly_ad_spend > 0, baseline_roas > 0, expected_roas_lift_pct
      between 0 and 1 (we don't allow negative lifts to claim a "win"), ai_tool_cost_monthly >= 0,
      creative_variants_per_week >= 0, operator_hours_per_week >= 0, operator_hourly_cost >= 0.
    - CLI: --ad-spend, --baseline-roas, --lift-pct, --ai-cost, --variants-per-week,
      --ai-tools, --operator-hours, --operator-rate, --attribution, --json.

All tests should pass on the canonical script.
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys

# Make the scripts/ directory importable.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.dirname(HERE)
sys.path.insert(0, SCRIPTS_DIR)

from ai_ad_creative_roi import (  # noqa: E402
    CreativeInputs,
    CreativeForecast,
    forecast,
    parse_args,
    build_inputs,
    render_human,
    main,
)


# ---------- 1. Import surface ----------

def test_module_imports():
    """The script module exposes the public functions and dataclasses."""
    assert callable(forecast)
    assert callable(parse_args)
    assert callable(build_inputs)
    assert callable(render_human)
    assert callable(main)


def test_dataclass_fields_present():
    """CreativeInputs / CreativeForecast have the documented fields."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    assert inputs.monthly_ad_spend == 5000.0
    assert inputs.baseline_roas == 2.5
    assert inputs.expected_roas_lift_pct == 0.20
    assert inputs.attribution_tool is True

    fc = forecast(inputs)
    assert hasattr(fc, "baseline_revenue_monthly")
    assert hasattr(fc, "lift_revenue_monthly")
    assert hasattr(fc, "net_revenue_monthly")
    assert hasattr(fc, "roas_lift_payback_days")


# ---------- 2. Validation (ValueError) ----------

def test_inputs_validate_negative_ad_spend():
    """Negative ad spend is rejected."""
    try:
        CreativeInputs(
            monthly_ad_spend=-1.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=0.20,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "ad_spend" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for negative ad spend")


def test_inputs_validate_zero_ad_spend():
    """Zero ad spend is rejected — without ad spend, AI creative has nothing to optimize."""
    try:
        CreativeInputs(
            monthly_ad_spend=0.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=0.20,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "ad_spend" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for zero ad spend")


def test_inputs_validate_zero_baseline_roas():
    """Zero baseline ROAS is rejected."""
    try:
        CreativeInputs(
            monthly_ad_spend=5000.0,
            baseline_roas=0.0,
            expected_roas_lift_pct=0.20,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "roas" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for zero baseline ROAS")


def test_inputs_validate_negative_roas_lift_pct():
    """Negative lift is rejected — that's a creative regression, not an iteration."""
    try:
        CreativeInputs(
            monthly_ad_spend=5000.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=-0.05,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "lift" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for negative ROAS lift %")


def test_inputs_validate_lift_pct_above_one():
    """Lift pct > 1.0 (i.e. +100% ROAS) is rejected — unrealistic anchor."""
    try:
        CreativeInputs(
            monthly_ad_spend=5000.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=1.5,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "lift" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for ROAS lift % > 1.0")


def test_inputs_validate_negative_ai_tool_cost():
    """Negative AI tool cost is rejected."""
    try:
        CreativeInputs(
            monthly_ad_spend=5000.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=0.20,
            ai_tool_cost_monthly=-1.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=2.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "tool_cost" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for negative AI tool cost")


def test_inputs_validate_negative_operator_hours():
    """Negative operator hours is rejected."""
    try:
        CreativeInputs(
            monthly_ad_spend=5000.0,
            baseline_roas=2.5,
            expected_roas_lift_pct=0.20,
            ai_tool_cost_monthly=149.0,
            creative_variants_per_week=10,
            ai_tools_count=1,
            operator_hours_per_week=-1.0,
            operator_hourly_cost=50.0,
            attribution_tool=True,
        )
    except ValueError as e:
        assert "operator" in str(e).lower()
    else:
        raise AssertionError("expected ValueError for negative operator hours")


# ---------- 3. Forecast math ----------

def test_forecast_baseline_revenue_canonical():
    """Baseline revenue = ad_spend * baseline_roas."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    assert fc.baseline_revenue_monthly == 12500.0  # 5000 * 2.5


def test_forecast_lift_revenue_canonical():
    """Lift revenue = ad_spend * baseline_roas * lift_pct."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    assert fc.lift_revenue_monthly == 2500.0  # 12500 * 0.20


def test_forecast_total_cost_canonical():
    """Total cost = ai_tool_cost + operator_hours_per_week*4.33*operator_hourly_cost."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # operator_cost_monthly = 2.0 * (52/12) * 50 = 2.0 * 4.333... * 50 = 433.33...
    assert abs(fc.operator_cost_monthly - 433.333) < 0.5
    assert abs(fc.total_cost_monthly - (149.0 + 433.333)) < 0.5


def test_forecast_net_revenue_canonical():
    """Net revenue = lift_revenue - total_cost."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # net = 2500 - (149 + 433.33) = ~1917.67
    assert fc.net_revenue_monthly > 1900 and fc.net_revenue_monthly < 1920


def test_forecast_post_roas_canonical():
    """Post-tool ROAS = baseline_roas * (1 + lift_pct)."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    assert fc.post_roas == 3.0  # 2.5 * 1.20


def test_forecast_cost_per_variant_canonical():
    """Cost per variant = total_cost / variants_per_month (variants_per_week * 52/12)."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # variants_per_month = 10 * 52/12 = 43.33
    # cost_per_variant = 582.33 / 43.33 = ~13.44
    assert 13 < fc.cost_per_variant < 14


def test_forecast_revenue_per_variant_canonical():
    """Revenue per variant = lift_revenue / variants_per_month."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # 2500 / 43.33 = ~57.7
    assert 56 < fc.revenue_per_variant < 58


def test_forecast_payback_days_canonical():
    """Payback days = (ai_tool_cost / lift_revenue) * 30 — days to cover the AI tool cost from lift."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # 149 / 2500 = 0.0596 of monthly revenue, * 30 days = 1.79 days
    assert 1.5 < fc.roas_lift_payback_days < 2.0


def test_forecast_payback_days_infinite_when_no_lift():
    """When lift_revenue is 0 (lift_pct=0 is rejected so this can't happen via validation,
    but if ai_tool_cost is 0 the payback is meaningless). Use the 0-cost case."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=0.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    assert fc.roas_lift_payback_days == 0.0  # no cost to pay back


# ---------- 4. Health band ----------

def test_health_band_great():
    """Net revenue >= 10x ai_tool_cost = great (top-tier AI creative ROI)."""
    # Make net revenue = $2,500, ai_tool_cost = $149 -> ratio = 16.78x
    inputs = CreativeInputs(
        monthly_ad_spend=10000.0,
        baseline_roas=3.0,
        expected_roas_lift_pct=0.30,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    band = fc.health_band()
    assert "great" in band


def test_health_band_good():
    """Net revenue 3-10x ai_tool_cost = good."""
    # Tune to land in good band: op_cost = 0.5 * 4.333 * 50 = 108.33
    # total_cost = 149 + 108.33 = 257.33; ai_cost = 149
    # good band requires 447 <= net < 1490, i.e. 704.33 <= lift_rev < 1747.33
    # lift_rev = ad_spend * 2.5 * 0.20 = ad_spend * 0.5
    # ad_spend in [1408.66, 3494.66]; use ad_spend = 2000 -> lift=1000, net=742.67, ratio=4.98
    inputs = CreativeInputs(
        monthly_ad_spend=2000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.5,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    band = fc.health_band()
    assert "good" in band, f"expected 'good' band, got: {band}"


def test_health_band_marginal():
    """Net revenue 1-3x ai_tool_cost = marginal."""
    # Want net ~ 2x = 298 -> lift_rev = 298 + 257.33 = 555.33 -> ad_spend * 2.5 * 0.20 = 555
    # ad_spend = 1110
    inputs = CreativeInputs(
        monthly_ad_spend=1110.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.5,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    band = fc.health_band()
    assert "marginal" in band, f"expected 'marginal' band, got: {band}"


def test_health_band_negative():
    """Net revenue <= 0 = negative."""
    # Make lift tiny: lift_pct=0.01, small ad spend
    # ad_spend=100, roas=2.0, lift=0.01 -> lift_rev=2.0
    # total_cost = 149 + 108.33 = 257.33 -> net = -255.33
    inputs = CreativeInputs(
        monthly_ad_spend=100.0,
        baseline_roas=2.0,
        expected_roas_lift_pct=0.01,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.5,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    band = fc.health_band()
    assert "negative" in band, f"expected 'negative' band, got: {band}"


def test_health_band_zero_ai_cost():
    """When ai_tool_cost is 0, the ratio is degenerate; use absolute net."""
    inputs = CreativeInputs(
        monthly_ad_spend=1000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=0.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    band = fc.health_band()
    # net = 500 - 0 = 500, positive, no tool cost -> great (positive net, no tool cost tracked)
    assert "great" in band, f"expected 'great' band, got: {band}"


# ---------- 5. Render ----------

def test_render_human_contains_key_figures():
    """Render output contains ad spend, baseline ROAS, lift revenue, net revenue, health band."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    # Loose substrings — avoid format-spec drift pitfalls.
    assert "5,000" in out  # ad spend (numeric rendered with comma)
    assert "2.50" in out   # baseline roas
    assert "20" in out      # lift pct
    assert "149" in out     # ai tool cost
    assert "Net revenue" in out
    assert "Health band" in out


def test_render_human_health_band_label_matches_forecast():
    """The rendered health band string matches the forecast's health_band() output."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    assert fc.health_band() in out


# ---------- 6. CLI behavior ----------

def test_cli_default_runs_end_to_end():
    """Default CLI run exits 0 and prints the human render (non-JSON default)."""
    r = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "ai_ad_creative_roi.py")],
        capture_output=True, text=True, timeout=15,
    )
    assert r.returncode == 0, f"expected exit 0, got {r.returncode}: {r.stderr}"
    assert "Health band" in r.stdout


def test_cli_json_roundtrip():
    """--json output is valid JSON with the expected top-level keys."""
    r = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "ai_ad_creative_roi.py"), "--json"],
        capture_output=True, text=True, timeout=15,
    )
    assert r.returncode == 0, f"expected exit 0, got {r.returncode}: {r.stderr}"
    data = json.loads(r.stdout)
    assert "inputs" in data
    assert "forecast" in data
    assert data["inputs"]["monthly_ad_spend"] == 5000.0
    assert data["forecast"]["baseline_revenue_monthly"] == 12500.0


def test_cli_json_roundtrip_with_custom_inputs():
    """--json output reflects CLI args."""
    r = subprocess.run(
        [
            sys.executable, os.path.join(SCRIPTS_DIR, "ai_ad_creative_roi.py"),
            "--ad-spend", "10000",
            "--baseline-roas", "3.0",
            "--lift-pct", "0.30",
            "--ai-cost", "199",
            "--variants-per-week", "20",
            "--json",
        ],
        capture_output=True, text=True, timeout=15,
    )
    assert r.returncode == 0, f"expected exit 0, got {r.returncode}: {r.stderr}"
    data = json.loads(r.stdout)
    assert data["inputs"]["monthly_ad_spend"] == 10000.0
    assert data["inputs"]["baseline_roas"] == 3.0
    assert data["forecast"]["baseline_revenue_monthly"] == 30000.0


def test_cli_help_runs():
    """--help prints usage and exits 0."""
    r = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "ai_ad_creative_roi.py"), "--help"],
        capture_output=True, text=True, timeout=10,
    )
    assert r.returncode == 0
    assert "ad-spend" in r.stdout
    assert "baseline-roas" in r.stdout


# ---------- 7. Realistic scenarios ----------

def test_scenario_default_canonical_great_band():
    """Default scenario: $5k ad spend, 2.5x ROAS, +20% lift, Moby $149 — should land in great band."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # lift_rev = 5000 * 2.5 * 0.20 = 2500
    # op_cost = 2 * 4.333 * 50 = 433.33
    # total_cost = 149 + 433.33 = 582.33
    # net = 1917.67
    # ratio = 1917.67 / 149 = 12.87 -> great band (>= 10x)
    assert "great" in fc.health_band()


def test_scenario_low_spend_marginal_band():
    """Low ad spend ($500/mo) makes AI tool cost dominant — marginal or weak band."""
    inputs = CreativeInputs(
        monthly_ad_spend=500.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.15,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=5,
        ai_tools_count=1,
        operator_hours_per_week=1.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # lift_rev = 500 * 2.5 * 0.15 = 187.5
    # op_cost = 1 * 4.333 * 50 = 216.67
    # total_cost = 149 + 216.67 = 365.67
    # net = 187.5 - 365.67 = -178.17 -> negative band
    assert "negative" in fc.health_band()


def test_scenario_high_spend_top_band():
    """High ad spend ($50k/mo) with conservative lift = clear great band."""
    inputs = CreativeInputs(
        monthly_ad_spend=50000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.15,
        ai_tool_cost_monthly=499.0,  # Moby Pro
        creative_variants_per_week=30,
        ai_tools_count=1,
        operator_hours_per_week=4.0,
        operator_hourly_cost=75.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # lift_rev = 50000 * 2.5 * 0.15 = 18750
    # op_cost = 4 * 4.333 * 75 = 1300
    # total = 499 + 1300 = 1799
    # net = 16951 -> ratio = 33.96x -> great
    assert "great" in fc.health_band()
    assert fc.roas_lift_payback_days < 1.0  # tool cost recovered in <1 day


def test_scenario_zero_operator_hours():
    """When operator_hours = 0, only the AI tool cost counts — pure SaaS margin."""
    inputs = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=0.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    # op_cost = 0; total = 149; net = 2351 -> ratio = 15.78x -> great
    assert "great" in fc.health_band()
    assert fc.operator_cost_monthly == 0.0


# ---------- 8. Cross-script consistency ----------

def test_creative_lift_models_baseline_roas_multiplier():
    """The lift multiplier (1 + lift_pct) must equal post_roas / baseline_roas."""
    inputs = CreativeInputs(
        monthly_ad_spend=7500.0,
        baseline_roas=3.2,
        expected_roas_lift_pct=0.25,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=15,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    expected_post_roas = inputs.baseline_roas * (1 + inputs.expected_roas_lift_pct)
    assert abs(fc.post_roas - expected_post_roas) < 1e-9


def test_lift_revenue_equals_baseline_revenue_times_lift():
    """lift_revenue_monthly = baseline_revenue_monthly * lift_pct."""
    inputs = CreativeInputs(
        monthly_ad_spend=8000.0,
        baseline_roas=2.0,
        expected_roas_lift_pct=0.10,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    expected = fc.baseline_revenue_monthly * inputs.expected_roas_lift_pct
    assert abs(fc.lift_revenue_monthly - expected) < 1e-9


def test_net_revenue_equals_lift_minus_total_cost():
    """net_revenue_monthly = lift_revenue_monthly - total_cost_monthly."""
    inputs = CreativeInputs(
        monthly_ad_spend=6000.0,
        baseline_roas=2.8,
        expected_roas_lift_pct=0.18,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc = forecast(inputs)
    expected = fc.lift_revenue_monthly - fc.total_cost_monthly
    assert abs(fc.net_revenue_monthly - expected) < 1e-9


def test_attribution_tool_flag_does_not_affect_math():
    """attribution_tool is a measurement-confidence flag, not a math input.
    Forecast values must be identical regardless of the flag."""
    inputs_a = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    inputs_b = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=False,
    )
    fc_a = forecast(inputs_a)
    fc_b = forecast(inputs_b)
    assert fc_a.net_revenue_monthly == fc_b.net_revenue_monthly
    assert fc_a.health_band() == fc_b.health_band()


# ---------- 9. Variant-volume scaling ----------

def test_more_variants_lower_cost_per_variant():
    """Increasing variants_per_week while holding cost fixed lowers cost_per_variant."""
    base = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    scaled = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=40,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc_base = forecast(base)
    fc_scaled = forecast(scaled)
    assert fc_scaled.cost_per_variant < fc_base.cost_per_variant


def test_ai_tools_count_scales_cost():
    """When ai_tools_count > 1, total cost grows by N (tool stack)."""
    one_tool = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=1,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    two_tools = CreativeInputs(
        monthly_ad_spend=5000.0,
        baseline_roas=2.5,
        expected_roas_lift_pct=0.20,
        ai_tool_cost_monthly=149.0,
        creative_variants_per_week=10,
        ai_tools_count=2,
        operator_hours_per_week=2.0,
        operator_hourly_cost=50.0,
        attribution_tool=True,
    )
    fc1 = forecast(one_tool)
    fc2 = forecast(two_tools)
    # second tool = $149/mo, so total_cost_2 - total_cost_1 = 149
    assert abs((fc2.total_cost_monthly - fc1.total_cost_monthly) - 149.0) < 1e-9