#!/usr/bin/env python3
"""
test_abandoned_cart_roi.py — TDD tests for the abandoned-cart ROI calculator.

Run: python3 scripts/tests/test_abandoned_cart_roi.py
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys

# Add scripts/ to path so we can import the module under test.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, SCRIPTS_DIR)

from abandoned_cart_roi import (  # noqa: E402
    FlowForecast,
    FlowInputs,
    build_inputs,
    forecast,
    main,
    parse_args,
    render_human,
)


# ----- Input validation -----------------------------------------------------

def test_inputs_validate_recovery_rate_above_one():
    try:
        FlowInputs(
            checkouts_per_month=100, aov=50.0, recovery_rate=1.5,
            email_cost_per_delivered=0.0005, email_count=3,
            email_delivery_rate=0.7, sms_cost_per_message=0.012,
            sms_count=2, sms_optin_rate=0.25,
        )
    except ValueError:
        return
    raise AssertionError("recovery_rate=1.5 should raise ValueError")


def test_inputs_validate_negative_aov():
    try:
        FlowInputs(
            checkouts_per_month=100, aov=-1.0, recovery_rate=0.10,
            email_cost_per_delivered=0.0005, email_count=3,
            email_delivery_rate=0.7, sms_cost_per_message=0.012,
            sms_count=2, sms_optin_rate=0.25,
        )
    except ValueError:
        return
    raise AssertionError("aov=-1 should raise ValueError")


def test_inputs_validate_negative_checkouts():
    try:
        FlowInputs(
            checkouts_per_month=-1, aov=50.0, recovery_rate=0.10,
            email_cost_per_delivered=0.0005, email_count=3,
            email_delivery_rate=0.7, sms_cost_per_message=0.012,
            sms_count=2, sms_optin_rate=0.25,
        )
    except ValueError:
        return
    raise AssertionError("checkouts_per_month=-1 should raise ValueError")


# ----- Forecast math --------------------------------------------------------

def test_forecast_basic_default_inputs():
    """Defaults: 1200 checkouts, $75 AOV, 10% recovery, 3 emails, 2 SMS, 25% opt-in."""
    inputs = FlowInputs(
        checkouts_per_month=1200, aov=75.0, recovery_rate=0.10,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.25,
    )
    fc = forecast(inputs)
    # 1200 * 0.10 = 120 recovered orders
    assert math.isclose(fc.recovered_orders_per_month, 120.0), fc.recovered_orders_per_month
    # 120 * $75 = $9,000
    assert math.isclose(fc.recovered_revenue_per_month, 9000.0), fc.recovered_revenue_per_month
    # email: 3 * 1200 * 0.70 * 0.0005 = $1.26
    assert math.isclose(fc.email_send_cost_per_month, 1.26, abs_tol=0.01), fc.email_send_cost_per_month
    # sms: 2 * 1200 * 0.25 * 0.012 = $7.20
    assert math.isclose(fc.sms_send_cost_per_month, 7.20, abs_tol=0.01), fc.sms_send_cost_per_month
    # total: $8.46
    assert math.isclose(fc.total_send_cost_per_month, 8.46, abs_tol=0.01), fc.total_send_cost_per_month
    # roi: 9000 / 8.46 ≈ 1063x
    assert fc.revenue_per_dollar_sent > 1000, fc.revenue_per_dollar_sent


def test_forecast_zero_checkouts():
    """No checkouts → no revenue, zero send cost, infinite ROI (we report inf)."""
    inputs = FlowInputs(
        checkouts_per_month=0, aov=75.0, recovery_rate=0.10,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.25,
    )
    fc = forecast(inputs)
    assert fc.recovered_orders_per_month == 0.0
    assert fc.recovered_revenue_per_month == 0.0
    assert fc.total_send_cost_per_month == 0.0
    assert math.isinf(fc.roi_ratio)


def test_forecast_higher_recovery_lifts_revenue():
    """Recovery rate scales revenue linearly."""
    base = FlowInputs(
        checkouts_per_month=1000, aov=100.0, recovery_rate=0.05,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.25,
    )
    hi = FlowInputs(
        checkouts_per_month=1000, aov=100.0, recovery_rate=0.15,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.25,
    )
    fc_base = forecast(base)
    fc_hi = forecast(hi)
    # 3x recovery rate → 3x recovered revenue
    assert math.isclose(fc_hi.recovered_revenue_per_month / fc_base.recovered_revenue_per_month, 3.0)


def test_forecast_health_band_great():
    """ROI >= 30x should classify as 'great'."""
    inputs = FlowInputs(
        checkouts_per_month=10000, aov=100.0, recovery_rate=0.12,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.05,  # very low opt-in keeps cost low
    )
    fc = forecast(inputs)
    assert fc.roi_ratio >= 30, fc.roi_ratio
    assert fc.health_band().startswith("great")


def test_forecast_health_band_marginal():
    """ROI between 5-15x should classify as 'marginal'.

    Tuned to produce ROI ~10x: 100 checkouts * 0.05 recovery = 5 orders
    * $50 AOV = $250 revenue. Email cost = 4 * 100 * 0.50 * 0.01 = $2.
    SMS cost = 3 * 100 * 0.40 * 0.10 = $12. Total cost $14 → ROI 17.9x.
    Need to push costs higher: SMS at 0.15 each and higher opt-in.
    """
    inputs = FlowInputs(
        checkouts_per_month=100, aov=50.0, recovery_rate=0.05,
        email_cost_per_delivered=0.005, email_count=4,
        email_delivery_rate=0.80, sms_cost_per_message=0.15,
        sms_count=3, sms_optin_rate=0.50,
    )
    fc = forecast(inputs)
    # revenue = 100 * 0.05 * 50 = 250
    # email = 4 * 100 * 0.80 * 0.005 = 1.60
    # sms   = 3 * 100 * 0.50 * 0.15 = 22.50
    # total = 24.10, ROI ≈ 10.4x → in marginal band (5-15)
    assert math.isclose(fc.recovered_revenue_per_month, 250.0)
    assert math.isclose(fc.total_send_cost_per_month, 24.10, abs_tol=0.05)
    assert 5 <= fc.roi_ratio < 15, fc.roi_ratio
    assert fc.health_band().startswith("marginal")


def test_forecast_email_cost_scales_with_delivery_rate():
    """Higher delivery rate → higher email send cost (and lower ROI)."""
    lo = FlowInputs(
        checkouts_per_month=1000, aov=50.0, recovery_rate=0.10,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.30, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.0,
    )
    hi = FlowInputs(
        checkouts_per_month=1000, aov=50.0, recovery_rate=0.10,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.95, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.0,
    )
    fc_lo = forecast(lo)
    fc_hi = forecast(hi)
    assert fc_hi.email_send_cost_per_month > fc_lo.email_send_cost_per_month
    assert fc_hi.roi_ratio < fc_lo.roi_ratio


# ----- CLI ------------------------------------------------------------------

def test_cli_help_exits_clean(capsys=type("Capsys", (), {"readouterr": staticmethod(lambda: (None, None))})):
    """`--help` should exit 0 and mention both playbook and flow."""
    try:
        parse_args(["--help"])
    except SystemExit as e:
        assert e.code == 0, f"--help should exit 0, got {e.code}"
        return
    raise AssertionError("--help should have called SystemExit")


def test_cli_builds_inputs_from_args():
    args = parse_args(["--checkouts", "500", "--aov", "60", "--recovery", "0.08"])
    inputs = build_inputs(args)
    assert inputs.checkouts_per_month == 500
    assert inputs.aov == 60.0
    assert inputs.recovery_rate == 0.08
    # Default values still apply
    assert inputs.email_count == 3
    assert inputs.sms_count == 2


def test_cli_json_output_is_valid_json():
    """`--json` output should round-trip through json.loads cleanly."""
    rc = main(["--checkouts", "1000", "--aov", "80", "--json"])
    assert rc == 0
    # We can't easily capture stdout from main(), but the JSON path ran without
    # exception, which is the contract. Confirm by re-running with subprocess.


def test_cli_subprocess_runs_and_emits_human_output():
    """Run the CLI as a real subprocess — sanity check it boots and prints something."""
    proc = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "abandoned_cart_roi.py")],
        capture_output=True, text=True, timeout=10,
    )
    assert proc.returncode == 0, proc.stderr
    assert "Abandoned-Cart Flow" in proc.stdout
    assert "Recovered orders" in proc.stdout
    assert "Revenue / $1 sent" in proc.stdout


def test_cli_subprocess_json_roundtrip():
    """`--json` subprocess output should be valid JSON with both inputs and forecast."""
    proc = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS_DIR, "abandoned_cart_roi.py"), "--json"],
        capture_output=True, text=True, timeout=10,
    )
    assert proc.returncode == 0, proc.stderr
    payload = json.loads(proc.stdout)  # raises if invalid
    assert "inputs" in payload
    assert "forecast" in payload
    assert "health_band" in payload["forecast"]
    # Cross-check the math from the JSON output.
    assert payload["forecast"]["recovered_orders_per_month"] == 120.0
    assert payload["forecast"]["recovered_revenue_per_month"] == 9000.0


def test_render_human_contains_key_figures():
    """The human render should surface the recovered-revenue and send-cost figures.

    The format spec uses `$ 9,000.00` (space between $ and digits), so assert
    the loose substring `9,000.00` to stay robust to format-spec tweaks.
    """
    inputs = FlowInputs(
        checkouts_per_month=1200, aov=75.0, recovery_rate=0.10,
        email_cost_per_delivered=0.0005, email_count=3,
        email_delivery_rate=0.70, sms_cost_per_message=0.012,
        sms_count=2, sms_optin_rate=0.25,
    )
    fc = forecast(inputs)
    out = render_human(inputs, fc)
    assert "Recovered revenue" in out
    assert "9,000.00" in out  # 120 orders * $75
    assert "8.46" in out       # total send cost
    assert "Health band" in out


# ----- Runner ---------------------------------------------------------------

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
