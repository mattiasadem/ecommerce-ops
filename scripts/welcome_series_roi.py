#!/usr/bin/env python3
"""
welcome_series_roi.py — Forecast 90-day LTV lift and send cost for a 5-email
welcome series in Klaviyo, plus optional SMS welcome from Postscript.

Companion to `/playbooks/04-welcome-series-klaviyo.md`. Use this before
turning the series on to sanity-check your opt-in math and to forecast
the per-subscriber cost vs incremental revenue.

Usage:
    python3 welcome_series_roi.py
    python3 welcome_series_roi.py --optins 1000 --cvr 0.03 --aov 75 --margin 0.70
    python3 welcome_series_roi.py --optins 500 --cvr 0.05 --aov 120 --emails 5 \\
        --discount 0.10 --email-rate 0.0005 --sms-count 1 --sms-optin 0.30

Defaults are calibrated to a small DTC brand at ~$1M GMV (1,000 opt-ins/mo,
3% first-purchase CVR, $75 AOV, 70% gross margin, Klaviyo email at
$0.0005/delivered, 5 emails per series, 10% welcome-discount cost funded
from margin, 30% SMS opt-in).
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class WelcomeInputs:
    """Inputs to the welcome-series ROI forecast.

    All amounts are in USD. Counts are integers per month unless suffixed.
    """

    optins_per_month: int                 # Newsletter / quiz / popup opt-ins / month
    first_purchase_cvr: float             # 0.0 - 1.0; share of opt-ins that buy in 14 days
    aov: float                            # Average order value (USD)
    gross_margin: float                   # 0.0 - 1.0; margin on first purchase
    welcome_discount: float               # 0.0 - 1.0; e.g. 0.10 = 10% off first order
    email_cost_per_delivered: float       # USD per delivered email (Klaviyo)
    email_count: int                      # Emails per series (default 5)
    email_delivery_rate: float            # Fraction of sends that reach inbox
    sms_cost_per_message: float           # USD per SMS sent (Postscript + carrier)
    sms_count: int                        # SMS per opted-in subscriber (default 1)
    sms_optin_rate: float                 # Fraction of opt-ins that are SMS-opted-in
    horizon_days: int                     # Forecast horizon (default 90)

    def __post_init__(self) -> None:
        if self.optins_per_month < 0:
            raise ValueError("optins_per_month must be >= 0")
        if self.aov <= 0:
            raise ValueError("aov must be > 0")
        if not 0.0 <= self.first_purchase_cvr <= 1.0:
            raise ValueError("first_purchase_cvr must be between 0 and 1")
        if not 0.0 <= self.gross_margin <= 1.0:
            raise ValueError("gross_margin must be between 0 and 1")
        if not 0.0 <= self.welcome_discount <= 1.0:
            raise ValueError("welcome_discount must be between 0 and 1")
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
        if self.horizon_days <= 0:
            raise ValueError("horizon_days must be > 0")


@dataclass(frozen=True)
class WelcomeForecast:
    """Output of the welcome-series ROI calculation."""

    first_orders_per_month: float         # optins * first_purchase_cvr
    revenue_per_month: float              # first_orders * AOV (gross)
    margin_per_month: float               # revenue * gross_margin
    discount_cost_per_month: float        # revenue * welcome_discount
    net_margin_per_month: float           # margin - discount cost
    email_send_cost_per_month: float
    sms_send_cost_per_month: float
    total_send_cost_per_month: float
    net_revenue_per_month: float          # net_margin - send costs
    roi_ratio: float                      # net_margin / send cost (cap on infra ROI)
    revenue_per_dollar_sent: float        # alias for roi_ratio
    revenue_per_optin: float              # net_revenue / optins
    margin_per_optin: float               # net_margin / optins
    breakeven_cvr: float                  # CVR needed to cover send cost at zero margin

    def health_band(self) -> str:
        """Bucket the forecast into a health band for at-a-glance reading.

        Anchored on net_revenue_per_month (margin - send cost - discount cost).
        At $0 send cost the ratio is undefined; we use the absolute net.
        """
        # When send cost is zero the ratio metric is degenerate; use absolute net.
        if self.total_send_cost_per_month == 0:
            if self.net_revenue_per_month > 0:
                return "great (positive net, no send cost tracked)"
            return "weak (no send cost tracked, net <= 0)"

        if self.roi_ratio >= 30:
            return "great (>=30:1, top-tier welcome flow)"
        if self.roi_ratio >= 10:
            return "good (10-30:1, healthy DTC welcome flow)"
        if self.roi_ratio >= 3:
            return "marginal (3-10:1, tune subject lines + send cadence)"
        if self.roi_ratio > 0:
            return "weak (<3:1, investigate discount cost + send frequency)"
        return "negative (cost > margin — reduce email count or discount)"


def forecast(inputs: WelcomeInputs) -> WelcomeForecast:
    """Compute the welcome-series forecast from the given inputs.

    Per-month math: opt-ins * CVR = first orders, * AOV = gross revenue,
    * margin = gross margin dollars, * discount = discount cost dollars,
    net_margin = margin - discount cost. Send costs are email + SMS.
    ROI = net_margin / send_cost (revenue-after-discount per $1 of infra).
    breakeven_cvr solves for the CVR at which net_margin = send_cost
    (zero-discount and standard margin).
    """
    first_orders = inputs.optins_per_month * inputs.first_purchase_cvr
    revenue = first_orders * inputs.aov
    margin = revenue * inputs.gross_margin
    discount_cost = revenue * inputs.welcome_discount
    net_margin = margin - discount_cost

    email_cost = (
        inputs.email_count
        * inputs.optins_per_month
        * inputs.email_delivery_rate
        * inputs.email_cost_per_delivered
    )
    sms_cost = (
        inputs.sms_count
        * inputs.optins_per_month
        * inputs.sms_optin_rate
        * inputs.sms_cost_per_message
    )
    total_send_cost = email_cost + sms_cost
    net_revenue = net_margin - total_send_cost

    # ROI ratio: net margin dollars per $1 of send cost. If no send cost
    # the ratio is undefined (we cap to a sentinel in the output below).
    if total_send_cost > 0:
        roi_ratio = net_margin / total_send_cost
    else:
        roi_ratio = float("inf") if net_margin > 0 else float("-inf")

    revenue_per_optin = net_revenue / inputs.optins_per_month if inputs.optins_per_month > 0 else 0.0
    margin_per_optin = net_margin / inputs.optins_per_month if inputs.optins_per_month > 0 else 0.0

    # Breakeven CVR: solve optins * cvr * aov * (margin - discount) = total_send_cost
    # -> cvr = total_send_cost / (optins * aov * (margin - discount))
    # Edge case: when (margin - discount) <= 0 the welcome discount is too deep to ever pay off,
    # so breakeven_cvr is +infinity (no CVR will cover send cost). Use math.inf.
    import math
    margin_after_discount = inputs.gross_margin - inputs.welcome_discount
    if margin_after_discount <= 0:
        breakeven_cvr = math.inf
    elif inputs.optins_per_month <= 0:
        # With no opt-ins, breakeven CVR is meaningless — emit 0 sentinel
        breakeven_cvr = 0.0
    else:
        breakeven_cvr = total_send_cost / (
            inputs.optins_per_month * inputs.aov * margin_after_discount
        )

    return WelcomeForecast(
        first_orders_per_month=first_orders,
        revenue_per_month=revenue,
        margin_per_month=margin,
        discount_cost_per_month=discount_cost,
        net_margin_per_month=net_margin,
        email_send_cost_per_month=email_cost,
        sms_send_cost_per_month=sms_cost,
        total_send_cost_per_month=total_send_cost,
        net_revenue_per_month=net_revenue,
        roi_ratio=roi_ratio,
        revenue_per_dollar_sent=roi_ratio,
        revenue_per_optin=revenue_per_optin,
        margin_per_optin=margin_per_optin,
        breakeven_cvr=breakeven_cvr,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI args. Defaults match a small DTC brand at ~$1M GMV."""
    p = argparse.ArgumentParser(
        prog="welcome_series_roi.py",
        description=(
            "Forecast 90-day LTV lift + send cost for a Klaviyo+Postscript "
            "welcome series. See /playbooks/04-welcome-series-klaviyo.md."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--optins", type=int, default=1000,
                   help="Opt-ins (newsletter signup / quiz completion) per month")
    p.add_argument("--cvr", type=float, default=0.03,
                   help="First-purchase CVR within 14 days (e.g. 0.03 = 3%%)")
    p.add_argument("--aov", type=float, default=75.0,
                   help="Average order value in USD")
    p.add_argument("--margin", type=float, default=0.70,
                   help="Gross margin (0.0 - 1.0)")
    p.add_argument("--discount", type=float, default=0.10,
                   help="Welcome discount (e.g. 0.10 = 10%% off first order)")
    p.add_argument("--email-rate", type=float, default=0.0005,
                   help="Cost per delivered email in USD (Klaviyo)")
    p.add_argument("--emails", type=int, default=5,
                   help="Number of emails per welcome series")
    p.add_argument("--email-delivery-rate", type=float, default=0.70,
                   help="Fraction of sends that reach the inbox")
    p.add_argument("--sms-rate", type=float, default=0.012,
                   help="Cost per SMS sent in USD (Postscript + carrier)")
    p.add_argument("--sms-count", type=int, default=1,
                   help="Number of SMS per opted-in subscriber")
    p.add_argument("--sms-optin", type=float, default=0.30,
                   help="Fraction of opt-ins that are SMS-opted-in")
    p.add_argument("--horizon", type=int, default=90,
                   help="Forecast horizon in days (used for the headline figure)")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON output (machine-readable)")
    return p.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> WelcomeInputs:
    """Convert parsed args to the WelcomeInputs dataclass."""
    return WelcomeInputs(
        optins_per_month=args.optins,
        first_purchase_cvr=args.cvr,
        aov=args.aov,
        gross_margin=args.margin,
        welcome_discount=args.discount,
        email_cost_per_delivered=args.email_rate,
        email_count=args.emails,
        email_delivery_rate=args.email_delivery_rate,
        sms_cost_per_message=args.sms_rate,
        sms_count=args.sms_count,
        sms_optin_rate=args.sms_optin,
        horizon_days=args.horizon,
    )


def render_human(inputs: WelcomeInputs, fc: WelcomeForecast) -> str:
    """Render a human-readable, paste-ready report."""
    lines = []
    lines.append("Welcome Series — ROI Forecast")
    lines.append("=" * 38)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  Opt-ins / month              : {inputs.optins_per_month:>10,d}")
    lines.append(f"  First-purchase CVR           : {inputs.first_purchase_cvr*100:>9.2f}%")
    lines.append(f"  AOV                          : ${inputs.aov:>9,.2f}")
    lines.append(f"  Gross margin                 : {inputs.gross_margin*100:>9.1f}%")
    lines.append(f"  Welcome discount             : {inputs.welcome_discount*100:>9.1f}%")
    lines.append(f"  Emails / series              : {inputs.email_count:>10d}")
    lines.append(f"  Email cost / delivered       : ${inputs.email_cost_per_delivered:>9.4f}")
    lines.append(f"  Email delivery rate          : {inputs.email_delivery_rate*100:>9.1f}%")
    lines.append(f"  SMS / opted-in subscriber    : {inputs.sms_count:>10d}")
    lines.append(f"  SMS cost / message           : ${inputs.sms_cost_per_message:>9.4f}")
    lines.append(f"  SMS opt-in rate              : {inputs.sms_optin_rate*100:>9.1f}%")
    lines.append(f"  Forecast horizon (days)      : {inputs.horizon_days:>10d}")
    lines.append("")
    lines.append(f"Forecast (monthly, over {inputs.horizon_days}-day window):")
    lines.append(f"  First orders                 : {fc.first_orders_per_month:>10,.1f}")
    lines.append(f"  Gross revenue                : ${fc.revenue_per_month:>9,.2f}")
    lines.append(f"  Gross margin                 : ${fc.margin_per_month:>9,.2f}")
    lines.append(f"  Discount cost                : ${fc.discount_cost_per_month:>9,.2f}")
    lines.append(f"  Net margin (after discount)  : ${fc.net_margin_per_month:>9,.2f}")
    lines.append(f"  Email send cost              : ${fc.email_send_cost_per_month:>9,.2f}")
    lines.append(f"  SMS send cost                : ${fc.sms_send_cost_per_month:>9,.2f}")
    lines.append(f"  Total send cost              : ${fc.total_send_cost_per_month:>9,.2f}")
    lines.append(f"  Net revenue (margin - cost)  : ${fc.net_revenue_per_month:>9,.2f}")
    lines.append(f"  Net margin / $1 sent         : {fc.revenue_per_dollar_sent:>9,.1f}x")
    lines.append(f"  Revenue / opt-in             : ${fc.revenue_per_optin:>9,.2f}")
    lines.append(f"  Margin / opt-in              : ${fc.margin_per_optin:>9,.2f}")
    if fc.breakeven_cvr == float("inf"):
        lines.append(f"  Breakeven CVR                : {'never':>10s} (discount >= margin)")
    else:
        lines.append(f"  Breakeven CVR                : {fc.breakeven_cvr*100:>9.3f}%")
    lines.append("")
    lines.append(f"  Health band                  : {fc.health_band()}")
    lines.append("")
    return "\n".join(lines)


def _json_safe(value: float) -> float | str:
    """Convert inf / -inf / nan to a JSON-safe sentinel."""
    import math
    if isinstance(value, float):
        if math.isinf(value):
            return "Infinity" if value > 0 else "-Infinity"
        if math.isnan(value):
            return "NaN"
    return value


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    inputs = build_inputs(args)
    fc = forecast(inputs)
    if args.json:
        out = {"inputs": asdict(inputs), "forecast": asdict(fc)}
        # Walk the forecast dict and replace inf/nan with JSON-safe sentinels.
        for k, v in out["forecast"].items():
            out["forecast"][k] = _json_safe(v)
        out["forecast"]["health_band"] = fc.health_band()
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, fc))
    return 0


if __name__ == "__main__":
    sys.exit(main())