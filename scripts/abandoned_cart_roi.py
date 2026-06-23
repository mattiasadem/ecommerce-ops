#!/usr/bin/env python3
"""
abandoned_cart_roi.py — Forecast revenue + send cost for a 3-email + 2-SMS
abandoned-cart flow in Klaviyo + Postscript.

Companion to `/playbooks/01-abandoned-cart-flow-klaviyo.md`. Use this before
turning the flow on to sanity-check your inputs and to forecast monthly ROI.

Usage:
    python3 abandoned_cart_roi.py
    python3 abandoned_cart_roi.py --checkouts 1200 --aov 75 --recovery 0.10
    python3 abandoned_cart_roi.py --checkouts 800 --aov 120 --recovery 0.12 \\
        --email-rate 0.0005 --sms-rate 0.012 --sms-optin 0.25

Defaults are calibrated to a small DTC brand at ~$1M GMV (1,200 checkout-starts/mo,
$75 AOV, 10% recovery, Klaviyo email at $0.0005/delivered, Postscript SMS at
$0.012/SMS, 25% SMS opt-in).
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class FlowInputs:
    """Inputs to the abandoned-cart ROI forecast.

    All amounts are in USD. Counts are integers per month.
    """
    checkouts_per_month: int        # Checkout Started events / month
    aov: float                      # Average order value
    recovery_rate: float            # Fraction of checkouts recovered (0.0 - 1.0)
    email_cost_per_delivered: float # USD per delivered email
    email_count: int                # Emails per abandoned cart (default 3)
    email_delivery_rate: float      # Fraction of sends that reach the inbox
    sms_cost_per_message: float     # USD per SMS sent (Postscript + carrier)
    sms_count: int                  # SMS per opted-in abandoned cart (default 2)
    sms_optin_rate: float           # Fraction of abandoned carts that are SMS-opted-in

    def __post_init__(self) -> None:
        if self.checkouts_per_month < 0:
            raise ValueError("checkouts_per_month must be >= 0")
        if self.aov <= 0:
            raise ValueError("aov must be > 0")
        if not 0.0 <= self.recovery_rate <= 1.0:
            raise ValueError("recovery_rate must be between 0 and 1")
        if self.email_cost_per_delivered < 0:
            raise ValueError("email_cost_per_delivered must be >= 0")
        if self.email_count < 0:
            raise ValueError("email_count must be >= 0")
        if not 0.0 <= self.email_delivery_rate <= 1.0:
            raise ValueError("email_delivery_rate must be between 0 and 1")
        if self.sms_cost_per_message < 0:
            raise ValueError("sms_cost_per_message must be >= 0")
        if self.sms_count < 0:
            raise ValueError("sms_count must be >= 0")
        if not 0.0 <= self.sms_optin_rate <= 1.0:
            raise ValueError("sms_optin_rate must be between 0 and 1")


@dataclass(frozen=True)
class FlowForecast:
    """Output of the ROI calculation."""
    recovered_orders_per_month: float
    recovered_revenue_per_month: float
    email_send_cost_per_month: float
    sms_send_cost_per_month: float
    total_send_cost_per_month: float
    net_revenue_per_month: float
    roi_ratio: float                 # recovered revenue / total send cost
    revenue_per_dollar_sent: float   # alias for roi_ratio; clearer name

    def health_band(self) -> str:
        """Bucket the forecast into a health band for at-a-glance reading."""
        if self.roi_ratio >= 30:
            return "great (>=30:1, matches top-of-class Omnisend benchmark)"
        if self.roi_ratio >= 15:
            return "good (15-30:1, healthy DTC flow)"
        if self.roi_ratio >= 5:
            return "marginal (5-15:1, expect to improve after subject-line + segmentation tuning)"
        if self.roi_ratio > 0:
            return "weak (<5:1, investigate trigger filters + suppression)"
        return "negative (no ROI — inputs are wrong)"


def forecast(inputs: FlowInputs) -> FlowForecast:
    """Compute the abandoned-cart flow forecast from the given inputs.

    The recovery_rate is applied to checkouts_per_month to estimate recovered
    orders. Send costs are estimated at per-message rates times deliverable
    counts.
    """
    recovered_orders = inputs.checkouts_per_month * inputs.recovery_rate
    recovered_revenue = recovered_orders * inputs.aov

    # Email: count * checkouts * delivery_rate * cost_per_delivered
    email_cost = (
        inputs.email_count
        * inputs.checkouts_per_month
        * inputs.email_delivery_rate
        * inputs.email_cost_per_delivered
    )

    # SMS: count * checkouts * opt-in * cost (Postscript bills per send, not per delivery)
    sms_cost = (
        inputs.sms_count
        * inputs.checkouts_per_month
        * inputs.sms_optin_rate
        * inputs.sms_cost_per_message
    )

    total_send_cost = email_cost + sms_cost
    net_revenue = recovered_revenue - total_send_cost
    roi_ratio = recovered_revenue / total_send_cost if total_send_cost > 0 else float("inf")

    return FlowForecast(
        recovered_orders_per_month=recovered_orders,
        recovered_revenue_per_month=recovered_revenue,
        email_send_cost_per_month=email_cost,
        sms_send_cost_per_month=sms_cost,
        total_send_cost_per_month=total_send_cost,
        net_revenue_per_month=net_revenue,
        roi_ratio=roi_ratio,
        revenue_per_dollar_sent=roi_ratio,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI args. Defaults match a small DTC brand at ~$1M GMV."""
    p = argparse.ArgumentParser(
        prog="abandoned_cart_roi.py",
        description=(
            "Forecast revenue + send cost for a Klaviyo+Postscript "
            "abandoned-cart flow. See /playbooks/01-abandoned-cart-flow-klaviyo.md."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--checkouts", type=int, default=1200,
                   help="Checkout Started events per month")
    p.add_argument("--aov", type=float, default=75.0,
                   help="Average order value in USD")
    p.add_argument("--recovery", type=float, default=0.10,
                   help="Fraction of checkouts recovered (e.g. 0.10 = 10%%)")
    p.add_argument("--email-rate", type=float, default=0.0005,
                   help="Cost per delivered email in USD (Klaviyo)")
    p.add_argument("--email-count", type=int, default=3,
                   help="Number of emails per abandoned cart")
    p.add_argument("--email-delivery-rate", type=float, default=0.70,
                   help="Fraction of sends that reach the inbox (after spam, etc)")
    p.add_argument("--sms-rate", type=float, default=0.012,
                   help="Cost per SMS sent in USD (Postscript + carrier)")
    p.add_argument("--sms-count", type=int, default=2,
                   help="Number of SMS per opted-in abandoned cart")
    p.add_argument("--sms-optin", type=float, default=0.25,
                   help="Fraction of abandoned carts that are SMS-opted-in")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON output (machine-readable)")
    return p.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> FlowInputs:
    """Convert parsed args to the FlowInputs dataclass."""
    return FlowInputs(
        checkouts_per_month=args.checkouts,
        aov=args.aov,
        recovery_rate=args.recovery,
        email_cost_per_delivered=args.email_rate,
        email_count=args.email_count,
        email_delivery_rate=args.email_delivery_rate,
        sms_cost_per_message=args.sms_rate,
        sms_count=args.sms_count,
        sms_optin_rate=args.sms_optin,
    )


def render_human(inputs: FlowInputs, fc: FlowForecast) -> str:
    """Render a human-readable, paste-ready report."""
    lines = []
    lines.append("Abandoned-Cart Flow — ROI Forecast")
    lines.append("=" * 38)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  Checkout-starts / month      : {inputs.checkouts_per_month:>10,d}")
    lines.append(f"  AOV                          : ${inputs.aov:>9,.2f}")
    lines.append(f"  Recovery rate                : {inputs.recovery_rate*100:>9.1f}%")
    lines.append(f"  Emails / cart                : {inputs.email_count:>10d}")
    lines.append(f"  Email cost / delivered       : ${inputs.email_cost_per_delivered:>9.4f}")
    lines.append(f"  Email delivery rate          : {inputs.email_delivery_rate*100:>9.1f}%")
    lines.append(f"  SMS / opted-in cart          : {inputs.sms_count:>10d}")
    lines.append(f"  SMS cost / message           : ${inputs.sms_cost_per_message:>9.4f}")
    lines.append(f"  SMS opt-in rate              : {inputs.sms_optin_rate*100:>9.1f}%")
    lines.append("")
    lines.append("Forecast (monthly):")
    lines.append(f"  Recovered orders             : {fc.recovered_orders_per_month:>10,.1f}")
    lines.append(f"  Recovered revenue            : ${fc.recovered_revenue_per_month:>9,.2f}")
    lines.append(f"  Email send cost              : ${fc.email_send_cost_per_month:>9,.2f}")
    lines.append(f"  SMS send cost                : ${fc.sms_send_cost_per_month:>9,.2f}")
    lines.append(f"  Total send cost              : ${fc.total_send_cost_per_month:>9,.2f}")
    lines.append(f"  Net revenue                  : ${fc.net_revenue_per_month:>9,.2f}")
    lines.append(f"  Revenue / $1 sent            : {fc.revenue_per_dollar_sent:>9,.1f}x")
    lines.append("")
    lines.append(f"  Health band                  : {fc.health_band()}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    inputs = build_inputs(args)
    fc = forecast(inputs)
    if args.json:
        # Merge inputs + forecast for downstream consumption.
        out = {"inputs": asdict(inputs), "forecast": asdict(fc)}
        out["forecast"]["health_band"] = fc.health_band()
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, fc))
    return 0


if __name__ == "__main__":
    sys.exit(main())
