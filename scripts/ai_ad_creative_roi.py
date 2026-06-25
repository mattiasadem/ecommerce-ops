#!/usr/bin/env python3
"""
ai_ad_creative_roi.py — Forecast incremental ROAS lift and total cost for an
AI-powered ad creative iteration program (AdCreative.ai, Triple Whale Moby,
Smartwriter, Pencil, etc.).

Companion to `/playbooks/10-ai-ad-creative-iteration.md`. Use this to
sanity-check whether the expected lift from AI-generated creative variants
covers the tool cost + operator curation time, and to compute payback days.

Usage:
    python3 ai_ad_creative_roi.py
    python3 ai_ad_creative_roi.py --ad-spend 10000 --baseline-roas 3.0 --lift-pct 0.30
    python3 ai_ad_creative_roi.py --ad-spend 5000 --baseline-roas 2.5 --lift-pct 0.20 \\
        --ai-cost 149 --variants-per-week 10 --operator-hours 2 \\
        --attribution --json

Defaults are calibrated to a small DTC brand at ~$1M–$5M GMV running
$5k/mo paid spend on a Triple Whale Moby Starter ($149/mo), with the
operator spending ~2 hours/week curating AI outputs and aiming for a
+20% ROAS lift from creative iteration.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class CreativeInputs:
    """Inputs to the AI ad-creative ROI forecast.

    All amounts are in USD. ROAS is unitless (e.g. 2.5 = $2.50 revenue
    per $1 of ad spend). Lift percentage is the expected multiplicative
    improvement on the baseline ROAS, e.g. 0.20 = +20% ROAS lift.
    """

    monthly_ad_spend: float           # Total paid-ad spend / month
    baseline_roas: float              # Current ROAS before AI creative
    expected_roas_lift_pct: float     # 0.0 - 1.0; +X% lift expected from AI iteration
    ai_tool_cost_monthly: float       # USD/mo for the AI tool stack (Moby / AdCreative.ai / Pencil)
    creative_variants_per_week: int   # Variants produced by AI tool / week
    ai_tools_count: int               # Number of paid AI tools in the stack (default 1)
    operator_hours_per_week: float    # Hours operator spends curating AI outputs
    operator_hourly_cost: float       # USD/hour fully-loaded operator cost
    attribution_tool: bool            # Whether Triple Whale / Polar is installed (measurement confidence)

    def __post_init__(self) -> None:
        if self.monthly_ad_spend <= 0:
            raise ValueError("monthly_ad_spend must be > 0")
        if self.baseline_roas <= 0:
            raise ValueError("baseline_roas must be > 0")
        if not 0.0 <= self.expected_roas_lift_pct <= 1.0:
            raise ValueError("expected_roas_lift_pct must be between 0 and 1 (0% to 100%)")
        if self.ai_tool_cost_monthly < 0:
            raise ValueError("ai_tool_cost_monthly must be >= 0")
        if self.creative_variants_per_week < 0:
            raise ValueError("creative_variants_per_week must be >= 0")
        if self.ai_tools_count < 0:
            raise ValueError("ai_tools_count must be >= 0")
        if self.operator_hours_per_week < 0:
            raise ValueError("operator_hours_per_week must be >= 0")
        if self.operator_hourly_cost < 0:
            raise ValueError("operator_hourly_cost must be >= 0")


@dataclass(frozen=True)
class CreativeForecast:
    """Output of the AI ad-creative ROI calculation."""

    baseline_revenue_monthly: float   # ad_spend * baseline_roas (pre-AI revenue)
    lift_revenue_monthly: float       # baseline_revenue * lift_pct (incremental revenue from AI creative)
    post_roas: float                  # baseline_roas * (1 + lift_pct) — ROAS after the lift
    ai_tool_cost_monthly: float       # ai_tool_cost * ai_tools_count
    operator_cost_monthly: float      # operator_hours_per_week * (52/12) * operator_hourly_cost
    total_cost_monthly: float         # ai_tool_cost + operator_cost
    net_revenue_monthly: float        # lift_revenue - total_cost
    net_per_dollar_tool: float        # net_revenue / ai_tool_cost — ratio of net lift to tool cost
    variants_per_month: float         # variants_per_week * (52/12)
    cost_per_variant: float           # total_cost / variants_per_month
    revenue_per_variant: float        # lift_revenue / variants_per_month
    roas_lift_payback_days: float     # days of lift_revenue to cover ai_tool_cost_monthly alone

    def health_band(self) -> str:
        """Bucket the forecast into a health band for at-a-glance reading.

        Anchored on net_per_dollar_tool = net revenue per $1 of AI tool
        cost (analog to the welcome-series and other companion-script
        health bands). When ai_tool_cost_monthly is 0 the ratio is
        degenerate; we fall back to absolute net revenue.
        """
        if self.ai_tool_cost_monthly == 0:
            if self.net_revenue_monthly > 0:
                return "great (positive net, no AI tool cost tracked)"
            return "weak (no AI tool cost tracked, net <= 0)"

        if self.net_per_dollar_tool >= 10:
            return "great (>=10:1 net per $1 AI tool cost, top-tier creative iteration)"
        if self.net_per_dollar_tool >= 3:
            return "good (3-10:1, healthy AI creative ROI)"
        if self.net_per_dollar_tool >= 1:
            return "marginal (1-3:1, tune tool stack or focus operator hours on top performers)"
        if self.net_per_dollar_tool > 0:
            return "weak (<1:1, AI tool cost exceeds net lift — defer or downgrade tool)"
        return "negative (net lift < 0 — increase ad spend, lift pct, or downgrade tool)"


# 52 weeks per year / 12 months = 4.333... weeks per month.
WEEKS_PER_MONTH = 52.0 / 12.0


def forecast(inputs: CreativeInputs) -> CreativeForecast:
    """Compute the AI creative iteration forecast from the given inputs.

    Per-month math: ad_spend * baseline_roas = baseline revenue,
    * lift_pct = lift revenue (the AI-driven incremental revenue). Total
    cost = ai_tool_cost_monthly * ai_tools_count + operator_hours_per_week
    * WEEKS_PER_MONTH * operator_hourly_cost. Net = lift revenue - total
    cost. net_per_dollar_tool = net / ai_tool_cost (analog to the
    welcome-series ratio). cost_per_variant and revenue_per_variant help
    the operator compare tool stacks. roas_lift_payback_days = days of
    lift_revenue needed to cover the AI tool cost (operator cost is a
    recurring drain not a one-time payback).
    """
    baseline_revenue = inputs.monthly_ad_spend * inputs.baseline_roas
    lift_revenue = baseline_revenue * inputs.expected_roas_lift_pct
    post_roas = inputs.baseline_roas * (1.0 + inputs.expected_roas_lift_pct)

    ai_tool_cost = inputs.ai_tool_cost_monthly * inputs.ai_tools_count
    operator_cost = (
        inputs.operator_hours_per_week
        * WEEKS_PER_MONTH
        * inputs.operator_hourly_cost
    )
    total_cost = ai_tool_cost + operator_cost
    net_revenue = lift_revenue - total_cost

    if ai_tool_cost > 0:
        net_per_dollar_tool = net_revenue / ai_tool_cost
    else:
        net_per_dollar_tool = float("inf") if net_revenue > 0 else float("-inf")

    variants_per_month = inputs.creative_variants_per_week * WEEKS_PER_MONTH
    if variants_per_month > 0:
        cost_per_variant = total_cost / variants_per_month
        revenue_per_variant = lift_revenue / variants_per_month
    else:
        cost_per_variant = 0.0
        revenue_per_variant = 0.0

    # Payback days: how many days of lift_revenue cover the AI tool cost (NOT operator cost).
    # Operator cost is a recurring drain — it doesn't "pay back," it's a monthly overhead.
    if lift_revenue > 0 and ai_tool_cost > 0:
        payback_days = (ai_tool_cost / lift_revenue) * 30.0
    else:
        payback_days = 0.0

    return CreativeForecast(
        baseline_revenue_monthly=baseline_revenue,
        lift_revenue_monthly=lift_revenue,
        post_roas=post_roas,
        ai_tool_cost_monthly=ai_tool_cost,
        operator_cost_monthly=operator_cost,
        total_cost_monthly=total_cost,
        net_revenue_monthly=net_revenue,
        net_per_dollar_tool=net_per_dollar_tool,
        variants_per_month=variants_per_month,
        cost_per_variant=cost_per_variant,
        revenue_per_variant=revenue_per_variant,
        roas_lift_payback_days=payback_days,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI args. Defaults match a small DTC brand at ~$1M–$5M GMV
    running Triple Whale Moby Starter."""
    p = argparse.ArgumentParser(
        prog="ai_ad_creative_roi.py",
        description=(
            "Forecast incremental ROAS lift + total cost for an AI "
            "ad-creative iteration program (AdCreative.ai / Moby / "
            "Smartwriter / Pencil). See "
            "/playbooks/10-ai-ad-creative-iteration.md."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--ad-spend", type=float, default=5000.0,
                   help="Total paid-ad spend per month (USD)")
    p.add_argument("--baseline-roas", type=float, default=2.5,
                   help="Current ROAS (e.g. 2.5 = $2.50 revenue per $1 spend)")
    p.add_argument("--lift-pct", type=float, default=0.20,
                   help="Expected ROAS lift from AI creative (e.g. 0.20 = +20%%)")
    p.add_argument("--ai-cost", type=float, default=149.0,
                   help="AI tool cost per month (USD, single tool)")
    p.add_argument("--variants-per-week", type=int, default=10,
                   help="Creative variants produced per week by AI tools")
    p.add_argument("--ai-tools", type=int, default=1,
                   help="Number of paid AI tools in the stack")
    p.add_argument("--operator-hours", type=float, default=2.0,
                   help="Hours per week the operator spends curating AI outputs")
    p.add_argument("--operator-rate", type=float, default=50.0,
                   help="Fully-loaded operator hourly cost (USD)")
    p.add_argument("--attribution", action="store_true", default=True,
                   help="Whether Triple Whale / Polar is installed (measurement confidence)")
    p.add_argument("--no-attribution", dest="attribution", action="store_false",
                   help="Disable the attribution flag (sets it False)")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON output (machine-readable)")
    return p.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> CreativeInputs:
    """Convert parsed args to the CreativeInputs dataclass."""
    return CreativeInputs(
        monthly_ad_spend=args.ad_spend,
        baseline_roas=args.baseline_roas,
        expected_roas_lift_pct=args.lift_pct,
        ai_tool_cost_monthly=args.ai_cost,
        creative_variants_per_week=args.variants_per_week,
        ai_tools_count=args.ai_tools,
        operator_hours_per_week=args.operator_hours,
        operator_hourly_cost=args.operator_rate,
        attribution_tool=args.attribution,
    )


def render_human(inputs: CreativeInputs, fc: CreativeForecast) -> str:
    """Render a human-readable, paste-ready report."""
    lines = []
    lines.append("AI Ad-Creative Iteration — ROI Forecast")
    lines.append("=" * 42)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  Monthly ad spend              : ${inputs.monthly_ad_spend:>10,.2f}")
    lines.append(f"  Baseline ROAS                 : {inputs.baseline_roas:>10.2f}x")
    lines.append(f"  Expected ROAS lift            : {inputs.expected_roas_lift_pct*100:>9.1f}%")
    lines.append(f"  AI tool cost (per tool)       : ${inputs.ai_tool_cost_monthly:>10,.2f}")
    lines.append(f"  AI tools in stack             : {inputs.ai_tools_count:>10d}")
    lines.append(f"  Variants / week               : {inputs.creative_variants_per_week:>10d}")
    lines.append(f"  Operator hours / week         : {inputs.operator_hours_per_week:>10.1f}")
    lines.append(f"  Operator hourly cost          : ${inputs.operator_hourly_cost:>10,.2f}")
    lines.append(f"  Attribution installed         : {'yes' if inputs.attribution_tool else 'no':>10s}")
    lines.append("")
    lines.append("Forecast (monthly):")
    lines.append(f"  Baseline revenue              : ${fc.baseline_revenue_monthly:>10,.2f}")
    lines.append(f"  Lift revenue (incremental)    : ${fc.lift_revenue_monthly:>10,.2f}")
    lines.append(f"  Post-tool ROAS                : {fc.post_roas:>10.2f}x")
    lines.append(f"  AI tool stack cost            : ${fc.ai_tool_cost_monthly:>10,.2f}")
    lines.append(f"  Operator cost                 : ${fc.operator_cost_monthly:>10,.2f}")
    lines.append(f"  Total cost                    : ${fc.total_cost_monthly:>10,.2f}")
    lines.append(f"  Net revenue (lift - cost)     : ${fc.net_revenue_monthly:>10,.2f}")
    if math.isinf(fc.net_per_dollar_tool):
        if fc.net_per_dollar_tool > 0:
            lines.append(f"  Net per $1 AI tool cost       : {'inf':>10s} (no AI tool cost tracked)")
        else:
            lines.append(f"  Net per $1 AI tool cost       : {'-inf':>10s} (no AI tool cost tracked)")
    else:
        lines.append(f"  Net per $1 AI tool cost       : {fc.net_per_dollar_tool:>9.1f}x")
    lines.append(f"  Variants / month              : {fc.variants_per_month:>10.1f}")
    lines.append(f"  Cost per variant              : ${fc.cost_per_variant:>10,.2f}")
    lines.append(f"  Revenue per variant           : ${fc.revenue_per_variant:>10,.2f}")
    lines.append(f"  ROAS lift payback (days)      : {fc.roas_lift_payback_days:>10.2f}")
    lines.append("")
    lines.append(f"  Health band                   : {fc.health_band()}")
    lines.append("")
    return "\n".join(lines)


def _json_safe(value: float) -> float | str:
    """Convert inf / -inf / nan to a JSON-safe sentinel."""
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
        for k, v in out["forecast"].items():
            out["forecast"][k] = _json_safe(v)
        out["forecast"]["health_band"] = fc.health_band()
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, fc))
    return 0


if __name__ == "__main__":
    sys.exit(main())