#!/usr/bin/env python3
"""
post_purchase_upsell_roi.py — Forecast incremental AOV, revenue, margin, and
ROI for a post-purchase one-click upsell flow.

Companion to `/playbooks/02-post-purchase-upsell-reconvert.md`. Use this before
turning the upsell page on to sanity-check inputs and to forecast monthly ROI.

The math (per month):

    upsell_units_per_month    = orders_per_month * upsell_acceptance_rate
    incremental_revenue       = upsell_units_per_month * upsell_aov
    incremental_margin        = incremental_revenue * upsell_margin
    platform_cost             = orders_per_month * platform_cost_per_order
    net_lift                  = incremental_margin - platform_cost
    roi_ratio                 = net_lift / platform_cost   (0 if cost=0)
    new_blended_aov           = (orders_per_month * base_aov + incremental_revenue) / orders_per_month
    aov_lift_pct              = (new_blended_aov - base_aov) / base_aov

Health band (net-lift per $1 platform cost):
    great   >= 30:1
    good    >= 15:1
    marginal >= 5:1
    weak    <  5:1

Usage:
    python3 post_purchase_upsell_roi.py
    python3 post_purchase_upsell_roi.py --orders 1000 --aov 80 --acceptance 0.12 \\
        --upsell-aov 35 --margin 0.65 --cost 0.10
    python3 post_purchase_upsell_roi.py --json

Defaults are calibrated to a small DTC brand at ~$1M GMV (1,000 orders/mo,
$80 AOV, 15% upsell acceptance, $35 upsell AOV, 70% gross margin on the
upsell, ReConvert/AfterSell at $0.10/order). At those defaults the flow
returns $5,250 incremental revenue and $3,675 incremental margin against
$100 platform cost — a 35.75:1 net lift per $1 of platform cost
("great" health band, in line with ReConvert's published case studies).
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class FlowInputs:
    """Inputs to the post-purchase upsell ROI forecast.

    All amounts in USD. Counts are integers per month.
    """
    orders_per_month: int           # Orders placed / month
    base_aov: float                 # Average order value of the original order
    upsell_acceptance_rate: float   # Fraction of orders that accept the upsell (0.0-1.0)
    upsell_aov: float               # Price of the upsell offer
    upsell_margin: float            # Gross margin on the upsell (0.0-1.0)
    platform_cost_per_order: float  # USD per order charged by the upsell app

    def __post_init__(self) -> None:
        if self.orders_per_month < 0:
            raise ValueError("orders_per_month must be >= 0")
        if self.base_aov <= 0:
            raise ValueError("base_aov must be > 0")
        if not 0.0 <= self.upsell_acceptance_rate <= 1.0:
            raise ValueError("upsell_acceptance_rate must be between 0 and 1")
        if self.upsell_aov <= 0:
            raise ValueError("upsell_aov must be > 0")
        if not 0.0 <= self.upsell_margin <= 1.0:
            raise ValueError("upsell_margin must be between 0 and 1")
        if self.platform_cost_per_order < 0:
            raise ValueError("platform_cost_per_order must be >= 0")


@dataclass(frozen=True)
class Forecast:
    """Outputs of the post-purchase upsell ROI forecast."""
    upsell_units_per_month: int
    incremental_revenue_per_month: float
    incremental_margin_per_month: float
    platform_cost_per_month: float
    net_lift_per_month: float
    roi_ratio: float
    new_blended_aov: float
    aov_lift_pct: float
    health_band: str


def forecast(fi: FlowInputs) -> Forecast:
    """Compute the monthly forecast from validated inputs."""
    upsell_units = int(round(fi.orders_per_month * fi.upsell_acceptance_rate))
    inc_rev = upsell_units * fi.upsell_aov
    inc_margin = inc_rev * fi.upsell_margin
    platform_cost = fi.orders_per_month * fi.platform_cost_per_order
    net_lift = inc_margin - platform_cost
    roi = (net_lift / platform_cost) if platform_cost > 0 else 0.0

    new_aov = (
        (fi.orders_per_month * fi.base_aov + inc_rev) / fi.orders_per_month
        if fi.orders_per_month > 0
        else fi.base_aov
    )
    aov_lift_pct = ((new_aov - fi.base_aov) / fi.base_aov) if fi.base_aov > 0 else 0.0

    return Forecast(
        upsell_units_per_month=upsell_units,
        incremental_revenue_per_month=inc_rev,
        incremental_margin_per_month=inc_margin,
        platform_cost_per_month=platform_cost,
        net_lift_per_month=net_lift,
        roi_ratio=roi,
        new_blended_aov=new_aov,
        aov_lift_pct=aov_lift_pct,
        health_band=health_band(roi, platform_cost),
    )


def health_band(roi: float, platform_cost: float) -> str:
    """Classify the upsell into great / good / marginal / weak."""
    if platform_cost <= 0:
        return "great (no platform cost)"
    if roi >= 30:
        return f"great (>=30:1 net lift per $1 platform cost, {roi:.1f}:1)"
    if roi >= 15:
        return f"good (15-30:1, {roi:.1f}:1)"
    if roi >= 5:
        return f"marginal (5-15:1, {roi:.1f}:1)"
    return f"weak (<5:1 net lift per $1 platform cost, {roi:.1f}:1)"


def render_human(f: Forecast) -> str:
    """Render a paste-ready human summary block."""
    lines = [
        "Post-purchase Upsell — Monthly Forecast",
        "=" * 50,
        f"Upsells accepted / month : {f.upsell_units_per_month:,}",
        f"Incremental revenue / mo : ${f.incremental_revenue_per_month:,.2f}",
        f"Incremental margin / mo  : ${f.incremental_margin_per_month:,.2f}",
        f"Platform cost / mo       : ${f.platform_cost_per_month:,.2f}",
        f"Net lift / mo            : ${f.net_lift_per_month:,.2f}",
        f"ROI ratio                : {f.roi_ratio:,.1f}:1  (net lift / platform cost)",
        f"New blended AOV          : ${f.new_blended_aov:,.2f}",
        f"AOV lift                 : {f.aov_lift_pct * 100:.1f}%",
        f"Health band              : {f.health_band}",
        "",
    ]
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="post_purchase_upsell_roi.py",
        description="Forecast post-purchase upsell ROI (ReConvert/AfterSell/Bold).",
    )
    p.add_argument("--orders", type=int, default=1000,
                   help="Orders placed per month (default: 1000)")
    p.add_argument("--aov", type=float, default=80.0,
                   help="Average order value, USD (default: 80)")
    p.add_argument("--acceptance", type=float, default=0.15,
                   help="Upsell acceptance rate 0-1 (default: 0.15 = 15%%)")
    p.add_argument("--upsell-aov", type=float, default=35.0,
                   help="Price of the upsell offer, USD (default: 35)")
    p.add_argument("--margin", type=float, default=0.70,
                   help="Gross margin on the upsell 0-1 (default: 0.70)")
    p.add_argument("--cost", type=float, default=0.10,
                   help="Platform cost per order, USD (default: 0.10)")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON envelope instead of human output")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        fi = FlowInputs(
            orders_per_month=args.orders,
            base_aov=args.aov,
            upsell_acceptance_rate=args.acceptance,
            upsell_aov=args.upsell_aov,
            upsell_margin=args.margin,
            platform_cost_per_order=args.cost,
        )
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    f = forecast(fi)
    if args.json:
        envelope = {
            "inputs": asdict(fi),
            "forecast": asdict(f),
        }
        print(json.dumps(envelope, indent=2))
    else:
        print(render_human(f))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
