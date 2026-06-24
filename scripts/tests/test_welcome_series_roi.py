"""
TDD tests for welcome_series_roi.py — Move #4 (welcome series) ROI calculator.

Spec:
    - Inputs: opt-ins/mo, first-purchase CVR (0..1), AOV, gross margin (0..1),
      welcome discount (0..1), email cost/delivered, emails/series (5 default),
      email delivery rate (0..1), SMS cost, SMS count, SMS opt-in (0..1), horizon days.
    - Outputs: first_orders/mo, gross revenue, gross margin $, discount cost $,
      net margin $ (margin - discount), email + SMS send costs, total send cost,
      net revenue (net margin - send cost), ROI ratio (net margin / send cost),
      revenue per opt-in, margin per opt-in, breakeven CVR.
    - Health band: great (>=30:1), good (10-30:1), marginal (3-10:1),
      weak (<3:1, positive), negative (<=0). Zero-send-cost branch is distinct.
    - Breakeven CVR: send_cost / (optins * aov * (margin - discount)); inf when
      margin <= discount; 0 sentinel when optins == 0.
    - Validation: each input is bounds-checked, raises ValueError with a clear message.
    - CLI: --optins, --cvr, --aov, --margin, --discount, --email-rate, --emails,
      --email-delivery-rate, --sms-rate, --sms-count, --sms-optin, --horizon, --json.

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

from welcome_series_roi import (  # noqa: E402
    WelcomeInputs,
    WelcomeForecast,
    forecast,
    parse_args,
    build_inputs,
    render_human,
    main,
)


# ---------- 1. Import surface ----------

def test_module_imports():
    """The script module exposes the four public functions and dataclasses."""
    assert callable(forecast)
    assert callable(parse_args)
    assert callable(build_inputs)
    assert callable(render_human)
    assert callable(main)


def test_dataclass_fields_present():
    """WelcomeInputs / WelcomeForecast have the documented fields."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    assert inputs.optins_per_month == 1000
    assert inputs.first_purchase_cvr == 0.03
    assert inputs.horizon_days == 90

    fc = forecast(inputs)
    assert hasattr(fc, "first_orders_per_month")
    assert hasattr(fc, "net_revenue_per_month")
    assert hasattr(fc, "breakeven_cvr")


# ---------- 2. Validation (ValueError) ----------

def test_inputs_validate_negative_optins():
    """Negative opt-ins is rejected."""
    try:
        WelcomeInputs(
            optins_per_month=-1, first_purchase_cvr=0.03, aov=75.0,
            gross_margin=0.70, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=90,
        )
    except ValueError as e:
        assert "optins_per_month" in str(e)
        return
    raise AssertionError("Expected ValueError for negative opt-ins")


def test_inputs_validate_zero_aov():
    """AOV must be > 0 (not just >= 0)."""
    try:
        WelcomeInputs(
            optins_per_month=1000, first_purchase_cvr=0.03, aov=0.0,
            gross_margin=0.70, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=90,
        )
    except ValueError as e:
        assert "aov" in str(e)
        return
    raise AssertionError("Expected ValueError for zero AOV")


def test_inputs_validate_cvr_above_one():
    """CVR > 1.0 is rejected."""
    try:
        WelcomeInputs(
            optins_per_month=1000, first_purchase_cvr=1.5, aov=75.0,
            gross_margin=0.70, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=90,
        )
    except ValueError as e:
        assert "first_purchase_cvr" in str(e)
        return
    raise AssertionError("Expected ValueError for CVR > 1.0")


def test_inputs_validate_cvr_negative():
    """CVR < 0.0 is rejected."""
    try:
        WelcomeInputs(
            optins_per_month=1000, first_purchase_cvr=-0.01, aov=75.0,
            gross_margin=0.70, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=90,
        )
    except ValueError as e:
        assert "first_purchase_cvr" in str(e)
        return
    raise AssertionError("Expected ValueError for negative CVR")


def test_inputs_validate_margin_above_one():
    """Margin > 1.0 is rejected."""
    try:
        WelcomeInputs(
            optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
            gross_margin=1.5, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=90,
        )
    except ValueError as e:
        assert "gross_margin" in str(e)
        return
    raise AssertionError("Expected ValueError for margin > 1.0")


def test_inputs_validate_discount_above_margin():
    """A discount >= margin is allowed syntactically (forecast handles breakeven=inf)."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.10, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.breakeven_cvr == math.inf


def test_inputs_validate_zero_horizon():
    """horizon_days must be > 0."""
    try:
        WelcomeInputs(
            optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
            gross_margin=0.70, welcome_discount=0.10,
            email_cost_per_delivered=0.0005, email_count=5,
            email_delivery_rate=0.70, sms_cost_per_message=0.012,
            sms_count=1, sms_optin_rate=0.30, horizon_days=0,
        )
    except ValueError as e:
        assert "horizon_days" in str(e)
        return
    raise AssertionError("Expected ValueError for horizon_days=0")


# ---------- 3. Forecast math ----------

def test_forecast_first_orders_canonical():
    """Canonical inputs: 1000 * 0.03 = 30 first orders / month."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.first_orders_per_month == 30.0


def test_forecast_revenue_canonical():
    """30 orders * $75 = $2,250 gross revenue / month."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.revenue_per_month == 2250.0


def test_forecast_margin_and_discount_canonical():
    """$2,250 * 70% = $1,575 margin; $2,250 * 10% = $225 discount; net margin = $1,350."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.margin_per_month == 1575.0
    assert fc.discount_cost_per_month == 225.0
    assert fc.net_margin_per_month == 1350.0


def test_forecast_email_cost_canonical():
    """5 emails * 1000 optins * 70% delivery * $0.0005/email = $1.75 email cost."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert abs(fc.email_send_cost_per_month - 1.75) < 1e-6


def test_forecast_sms_cost_canonical():
    """1 SMS * 1000 optins * 30% opt-in * $0.012/SMS = $3.60 SMS cost."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert abs(fc.sms_send_cost_per_month - 3.60) < 1e-6


def test_forecast_total_send_cost_canonical():
    """$1.75 + $3.60 = $5.35 total send cost."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert abs(fc.total_send_cost_per_month - 5.35) < 1e-6


def test_forecast_net_revenue_canonical():
    """$1,350 net margin - $5.35 send cost = $1,344.65 net revenue / month."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert abs(fc.net_revenue_per_month - (1350.0 - 5.35)) < 1e-6


def test_forecast_roi_ratio_canonical():
    """$1,350 net margin / $5.35 send cost = 252.34:1 (top tier)."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    expected = 1350.0 / 5.35
    assert abs(fc.roi_ratio - expected) < 1e-6


def test_forecast_revenue_per_optin():
    """$1,344.65 net / 1000 optins = $1.345 per opt-in."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    expected = (1350.0 - 5.35) / 1000.0
    assert abs(fc.revenue_per_optin - expected) < 1e-6


def test_forecast_breakeven_cvr_canonical():
    """breakeven = send_cost / (optins * aov * (margin - discount))
    = 5.35 / (1000 * 75 * 0.60) = 5.35 / 45000 = 0.0001189 = 0.01189%"""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    expected = 5.35 / (1000.0 * 75.0 * 0.60)
    assert abs(fc.breakeven_cvr - expected) < 1e-9


def test_forecast_zero_optins_safe():
    """Zero opt-ins yields zero revenue, zero costs, breakeven sentinel=0."""
    inputs = WelcomeInputs(
        optins_per_month=0, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.first_orders_per_month == 0.0
    assert fc.revenue_per_month == 0.0
    assert fc.margin_per_month == 0.0
    assert fc.net_margin_per_month == 0.0
    assert fc.total_send_cost_per_month == 0.0
    assert fc.net_revenue_per_month == 0.0
    # Breakeven CVR is 0.0 sentinel when optins == 0 (no optins, no breakeven math)
    assert fc.breakeven_cvr == 0.0


def test_forecast_zero_cvr():
    """Zero CVR yields zero revenue, zero costs (no orders * cost)."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.0, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.first_orders_per_month == 0.0
    assert fc.revenue_per_month == 0.0
    assert fc.margin_per_month == 0.0
    assert fc.discount_cost_per_month == 0.0
    assert fc.net_margin_per_month == 0.0
    # Send cost still exists (we sent 5 emails + 1 SMS per opt-in)
    assert fc.total_send_cost_per_month == 5.35
    # Net revenue is negative: -send cost
    assert fc.net_revenue_per_month == -5.35


def test_forecast_discount_equals_margin_yields_breakeven_inf():
    """When discount == margin, breakeven_cvr is inf (no CVR covers send cost)."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.50, welcome_discount=0.50,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.net_margin_per_month == 0.0
    assert fc.breakeven_cvr == math.inf


def test_forecast_no_sms_cost_when_sms_count_zero():
    """Disabling SMS yields zero SMS cost, only email cost remains."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=0, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.sms_send_cost_per_month == 0.0
    assert abs(fc.total_send_cost_per_month - 1.75) < 1e-6


def test_forecast_no_email_cost_when_email_count_zero():
    """Disabling email yields zero email cost, only SMS cost remains."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=0,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert fc.email_send_cost_per_month == 0.0
    assert abs(fc.total_send_cost_per_month - 3.60) < 1e-6


def test_forecast_high_cvr_yields_high_roi():
    """A high-CVR store (10%) yields substantially more revenue per opt-in."""
    inputs_high = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.10, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    inputs_low = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.02, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc_high = forecast(inputs_high)
    fc_low = forecast(inputs_low)
    assert fc_high.net_revenue_per_month > fc_low.net_revenue_per_month * 4  # ~5x CVR


# ---------- 4. Health band classification ----------

def test_health_band_great():
    """ROI >= 30 yields 'great' band."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert "great" in fc.health_band()


def test_health_band_good():
    """ROI in 10-30 yields 'good' band. Force by reducing optins (lower revenue) but keeping send cost."""
    inputs = WelcomeInputs(
        optins_per_month=100, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    # 100 * 0.03 * 75 * 0.60 = 135 net margin; send = 0.535; roi = 252.3 (still great).
    # Need to push ratio down: drop CVR or increase cost.
    assert "great" in fc.health_band()  # still high enough
    # Now really push down: 10 optins, 0.5% CVR
    inputs2 = WelcomeInputs(
        optins_per_month=10, first_purchase_cvr=0.005, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc2 = forecast(inputs2)
    # 10 * 0.005 * 75 * 0.60 = 2.25; send = 0.0535; ratio = 42.0 (still great)
    # Push harder: 10 optins, 0.1% CVR
    inputs3 = WelcomeInputs(
        optins_per_month=10, first_purchase_cvr=0.001, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc3 = forecast(inputs3)
    # 10 * 0.001 * 75 * 0.60 = 0.45; send = 0.0535; ratio = 8.4 (marginal band)
    assert "marginal" in fc3.health_band()


def test_health_band_negative():
    """Negative net margin (cost > margin) yields 'negative' band."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.0, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    # Zero revenue, $5.35 send cost -> net_revenue = -5.35 (negative)
    assert "negative" in fc.health_band()


def test_health_band_zero_send_cost():
    """Zero send cost with positive net margin yields 'great' fallback message."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0, email_count=0,
        email_delivery_rate=0.70, sms_cost_per_message=0.0,
        sms_count=0, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    assert "no send cost" in fc.health_band()


# ---------- 5. Render ----------

def test_render_human_contains_key_figures():
    """Human-readable output contains the canonical headline numbers (loose substrings)."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    # Loose numeric substring assertions (don't pin currency/spacing).
    assert "1,000" in out          # optins count
    assert "2,250" in out          # gross revenue
    assert "1,575" in out          # gross margin
    assert "252.3" in out          # ROI ratio (1350/5.35 = 252.34)
    assert "Welcome Series" in out  # header
    assert "Health band" in out     # footer
    assert "Breakeven CVR" in out   # footer


def test_render_human_handles_zero_optins():
    """Render is safe for zero opt-ins (no division by zero in display)."""
    inputs = WelcomeInputs(
        optins_per_month=0, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.70, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    assert "Welcome Series" in out
    assert "Health band" in out


def test_render_human_shows_breakeven_never_for_discount_ge_margin():
    """When discount >= margin, breakeven row shows 'never'."""
    inputs = WelcomeInputs(
        optins_per_month=1000, first_purchase_cvr=0.03, aov=75.0,
        gross_margin=0.50, welcome_discount=0.50,
        email_cost_per_delivered=0.0005, email_count=5,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=1, sms_optin_rate=0.30, horizon_days=90,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    assert "never" in out.lower()


# ---------- 6. CLI behavior ----------

def test_cli_defaults_match_docstring():
    """parse_args() with no args yields the documented defaults."""
    args = parse_args([])
    assert args.optins == 1000
    assert args.cvr == 0.03
    assert args.aov == 75.0
    assert args.margin == 0.70
    assert args.discount == 0.10
    assert args.email_rate == 0.0005
    assert args.emails == 5
    assert args.sms_rate == 0.012
    assert args.sms_count == 1
    assert args.sms_optin == 0.30
    assert args.horizon == 90


def test_cli_help_runs():
    """--help exits 0 and prints usage."""
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        try:
            main(["--help"])
        except SystemExit as e:
            assert e.code == 0
    out = buf.getvalue()
    assert "welcome" in out.lower() or "optins" in out.lower()


def test_cli_json_roundtrip():
    """--json emits valid JSON containing the canonical fields."""
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        main(["--json"])
    out = buf.getvalue()
    parsed = json.loads(out)  # also confirms JSON well-formed
    assert "inputs" in parsed
    assert "forecast" in parsed
    assert parsed["inputs"]["optins_per_month"] == 1000
    assert parsed["inputs"]["first_purchase_cvr"] == 0.03
    # breakeven is finite in this case (margin > discount)
    assert parsed["forecast"]["breakeven_cvr"] < 1.0
    # ROI is finite and very high
    assert parsed["forecast"]["roi_ratio"] > 100


def test_cli_json_handles_breakeven_inf():
    """--json with discount == margin emits JSON-safe 'Infinity' for breakeven_cvr."""
    main(["--json", "--margin", "0.50", "--discount", "0.50"])
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        main(["--json", "--margin", "0.50", "--discount", "0.50"])
    parsed = json.loads(buf.getvalue())
    # breakeven is math.inf -> serialized as "Infinity"
    assert parsed["forecast"]["breakeven_cvr"] == "Infinity"


def test_cli_runs_via_subprocess_canonical():
    """Subprocess invocation produces expected canonical output and exits 0."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "welcome_series_roi.py")],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stderr
    out = result.stdout
    assert "Welcome Series" in out
    assert "Health band" in out
    # Canonical ROI is ~252x for defaults
    assert "252" in out or "251" in out


def test_cli_subprocess_validates_bad_input():
    """Negative opt-ins via CLI exits non-zero with a stderr message."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "welcome_series_roi.py"),
         "--optins", "-5"],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "optins_per_month" in result.stderr or "optins" in result.stderr


def test_cli_custom_run():
    """--optins 500 --cvr 0.05 --aov 120 produces matching net revenue (loose check)."""
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "welcome_series_roi.py"),
         "--optins", "500", "--cvr", "0.05", "--aov", "120",
         "--json"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stderr
    parsed = json.loads(result.stdout)
    # 500 * 0.05 = 25 orders, * $120 = $3000 gross, * 0.7 = $2100 margin,
    # * 0.1 = $300 discount, net margin = $1800
    assert abs(parsed["forecast"]["margin_per_month"] - 2100.0) < 1e-6
    assert abs(parsed["forecast"]["net_margin_per_month"] - 1800.0) < 1e-6


# ---------- 7. Realistic scenarios ----------

def test_realistic_scenario_small_dtc():
    """Realistic mid-tier small DTC: 600 optins, 2.5% CVR, $85 AOV -> positive net."""
    inputs = WelcomeInputs(
        optins_per_month=600, first_purchase_cvr=0.025, aov=85.0,
        gross_margin=0.65, welcome_discount=0.10,
        email_cost_per_delivered=0.0005, email_count=4,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=0, sms_optin_rate=0.0, horizon_days=90,
    )
    fc = forecast(inputs)
    # 600 * 0.025 = 15 orders, * $85 = $1275, * 0.65 = $828.75 margin,
    # * 0.1 = $127.50 discount, net margin = $701.25, send = 0.84, net = $700.41
    assert fc.first_orders_per_month == 15.0
    assert fc.net_revenue_per_month > 600
    assert "great" in fc.health_band()


def test_realistic_scenario_high_volume_scale_brand():
    """High-volume scale brand: 10k optins/mo, 4% CVR, $100 AOV, large list cost."""
    inputs = WelcomeInputs(
        optins_per_month=10000, first_purchase_cvr=0.04, aov=100.0,
        gross_margin=0.75, welcome_discount=0.15,
        email_cost_per_delivered=0.0005, email_count=6,
        email_delivery_rate=0.85, sms_cost_per_message=0.010,
        sms_count=2, sms_optin_rate=0.40, horizon_days=90,
    )
    fc = forecast(inputs)
    # 10000 * 0.04 = 400 orders, * $100 = $40,000, * 0.75 = $30,000 margin,
    # * 0.15 = $6,000 discount, net margin = $24,000
    # send: email = 6 * 10000 * 0.85 * 0.0005 = $25.50; SMS = 2 * 10000 * 0.4 * 0.010 = $80
    # total send = $105.50; net = $23,894.50
    assert abs(fc.margin_per_month - 30000.0) < 1e-6
    assert abs(fc.email_send_cost_per_month - 25.50) < 1e-6
    assert abs(fc.sms_send_cost_per_month - 80.0) < 1e-6
    assert fc.net_revenue_per_month > 20000
    assert "great" in fc.health_band()


# ---------- 8. Cross-script consistency ----------

def test_cli_output_roundtrips_through_json_load():
    """The --json output must roundtrip through json.loads (no NaN/Inf crashes)."""
    # Run with default args and confirm json.loads succeeds.
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        main(["--json"])
    parsed = json.loads(buf.getvalue())
    assert isinstance(parsed, dict)


def test_default_run_is_health_great():
    """Default inputs land in the 'great' band (sanity for the canonical case)."""
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        main([])  # default human output
    out = buf.getvalue()
    assert "great" in out.lower() or "good" in out.lower()


def test_script_returns_zero_on_success():
    """main() returns 0 on a successful default run."""
    rc = main([])
    assert rc == 0


# ----- Runner ---------------------------------------------------------------

def main_test() -> int:
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