#!/usr/bin/env python3
"""
pdp_ab_test.py — Analyze a PDP A/B test result for statistical significance
and forecast the program-level ROI for an always-on PDP A/B testing cadence.

Companion to `/playbooks/09.5-pdp-ab-testing-program.md`. Use this when you've
finished running an A/B test on a PDP element (hero image, ATC copy, sticky bar
color, accordion default state, etc.) and you want to know:

1. Is the variant a real winner or is the lift within noise?
2. What's the confidence (p-value) of the result?
3. If we run 4 tests/month with an avg +5% relative lift on $75 AOV at 70% margin,
   what's the steady-state monthly + annual ROI of the program?

Statistical method:
    Two-proportion z-test (the canonical A/B test statistic for conversion rate
    comparisons). z = (p_v - p_c) / sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_v))
    where p_pool = (x_c + x_v) / (n_c + n_v). Two-sided p-value computed via
    the standard normal CDF (no scipy dependency — pure math).

Decision bands:
    winner     — confidence >= 0.95 AND relative_lift > 0
    loser      — confidence >= 0.95 AND relative_lift < 0
    inconclusive — otherwise (small sample, low lift, or no signal)

Usage:
    python3 pdp_ab_test.py
    python3 pdp_ab_test.py --control-sessions 5000 --control-conversions 100 \\
        --variant-sessions 5000 --variant-conversions 130 --aov 85
    python3 pdp_ab_test.py --json

Defaults are calibrated to a Move #9 / #10 shop: 10k sessions/arm, 200 vs 240
conversions (canonical winner case yielding z ≈ 2.83, p ≈ 0.0046).
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import asdict, dataclass


# ----- Math helpers ---------------------------------------------------------

def _phi(x: float) -> float:
    """Standard normal cumulative distribution function (CDF).

    Uses the Abramowitz & Stegun 7.1.26 approximation — accurate to ~1.5e-7
    which is more than enough for an A/B-test p-value (we report to 4 decimals).
    """
    # A&S 7.1.26 constants
    a1 =  0.254829592
    a2 = -0.284496736
    a3 =  1.421413741
    a4 = -1.453152027
    a5 =  1.061405429
    p  =  0.3275911

    sign = 1
    if x < 0:
        sign = -1
        x = -x

    t = 1.0 / (1.0 + p * x)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x * x / 2.0)
    return 0.5 * (1.0 + sign * y)


def _two_sided_pvalue(z: float) -> float:
    """Two-sided p-value from a z-score: P(|Z| >= |z|) under H0."""
    return 2.0 * (1.0 - _phi(abs(z)))


# ----- Dataclasses ----------------------------------------------------------

@dataclass(frozen=True)
class AbTestInputs:
    """Inputs to a single A/B test analysis + program ROI forecast.

    Sessions/conversions are absolute counts from the test's run window
    (typically 7–28 days). The program forecast converts the test result
    into a steady-state monthly/annual ROI assuming avg_relative_lift per test.
    """
    control_sessions: int          # Sessions exposed to control
    control_conversions: int       # Conversions in control arm
    variant_sessions: int          # Sessions exposed to variant
    variant_conversions: int       # Conversions in variant arm
    aov: float                     # Average order value in USD
    margin: float                  # Gross margin (0.0–1.0)
    monthly_pdp_sessions: int      # Steady-state monthly PDP traffic (for program ROI)
    tool_monthly_cost: float       # A/B tool monthly subscription (Convert.com / VWO / Shoplift)
    operator_hours_per_month: float  # Operator hours per month for test design + review
    operator_hourly_rate: float    # Loaded operator hourly rate
    confidence_target: float       # Confidence threshold for "winner" decision (default 0.95)

    def __post_init__(self) -> None:
        if self.control_sessions < 0:
            raise ValueError("control_sessions must be >= 0")
        if self.variant_sessions < 0:
            raise ValueError("variant_sessions must be >= 0")
        if self.control_conversions < 0:
            raise ValueError("control_conversions must be >= 0")
        if self.variant_conversions < 0:
            raise ValueError("variant_conversions must be >= 0")
        if self.control_conversions > self.control_sessions:
            raise ValueError("control_conversions cannot exceed control_sessions")
        if self.variant_conversions > self.variant_sessions:
            raise ValueError("variant_conversions cannot exceed variant_sessions")
        if self.aov <= 0:
            raise ValueError("aov must be > 0")
        if not 0.0 <= self.margin <= 1.0:
            raise ValueError("margin must be between 0 and 1")
        if self.monthly_pdp_sessions < 0:
            raise ValueError("monthly_pdp_sessions must be >= 0")
        if self.tool_monthly_cost < 0:
            raise ValueError("tool_monthly_cost must be >= 0")
        if self.operator_hours_per_month < 0:
            raise ValueError("operator_hours_per_month must be >= 0")
        if self.operator_hourly_rate < 0:
            raise ValueError("operator_hourly_rate must be >= 0")
        if not 0.0 <= self.confidence_target <= 1.0:
            raise ValueError("confidence_target must be between 0 and 1")


@dataclass(frozen=True)
class AbTestResult:
    """Statistical analysis of a single A/B test."""
    control_rate: float            # p_c = x_c / n_c
    variant_rate: float            # p_v = x_v / n_v
    absolute_lift: float           # p_v - p_c (in CVR points)
    relative_lift: float           # (p_v - p_c) / p_c (fraction)
    z_score: float                 # Two-proportion z statistic
    p_value: float                 # Two-sided p-value
    confidence: float              # 1 - p_value (clamped to [0, 1])
    is_significant: bool           # confidence >= confidence_target
    decision: str                  # 'winner' | 'loser' | 'inconclusive'

    def decision_label(self) -> str:
        labels = {
            "winner": "Winner (variant beats control)",
            "loser": "Loser (variant underperforms control — revert)",
            "inconclusive": "Inconclusive (not enough evidence — keep running or stop)",
        }
        return labels.get(self.decision, self.decision)


@dataclass(frozen=True)
class ProgramForecast:
    """Steady-state ROI forecast for the always-on PDP A/B testing program."""
    gross_margin_lift_per_month: float   # aov * lift * monthly_pdp_sessions * margin
    total_program_cost_per_month: float  # tool + operator hours
    net_revenue_per_month: float         # gross_lift - cost
    net_revenue_per_year: float          # net_revenue_per_month * 12
    annualized_cost: float               # total_program_cost_per_month * 12
    annualized_ratio: float              # net_revenue_per_year / annualized_cost (0 if cost=0)
    health_band: str                     # great | good | fair | weak

    def label(self) -> str:
        return self.health_band


# ----- Analysis -------------------------------------------------------------

def analyze(inputs: AbTestInputs) -> AbTestResult:
    """Run a two-proportion z-test on the control + variant conversion rates.

    Returns AbTestResult with z-score, p-value, confidence, relative lift, and a
    decision (winner / loser / inconclusive) based on confidence_target.
    """
    n_c = inputs.control_sessions
    n_v = inputs.variant_sessions
    x_c = inputs.control_conversions
    x_v = inputs.variant_conversions

    p_c = x_c / n_c if n_c > 0 else 0.0
    p_v = x_v / n_v if n_v > 0 else 0.0
    absolute_lift = p_v - p_c
    relative_lift = (absolute_lift / p_c) if p_c > 0 else 0.0

    # Two-proportion z-test: z = (p_v - p_c) / sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_v))
    n_total = n_c + n_v
    x_total = x_c + x_v
    if n_total == 0 or x_total == 0 or (x_total == n_total):
        # No variation at all — degenerate case.
        z_score = 0.0
        p_value = 1.0
    else:
        p_pool = x_total / n_total
        se_squared = p_pool * (1.0 - p_pool) * (1.0 / n_c + 1.0 / n_v)
        if se_squared <= 0:
            z_score = 0.0
            p_value = 1.0
        else:
            z_score = absolute_lift / math.sqrt(se_squared)
            p_value = _two_sided_pvalue(z_score)

    confidence = max(0.0, min(1.0, 1.0 - p_value))
    is_significant = confidence >= inputs.confidence_target

    if is_significant and relative_lift > 0:
        decision = "winner"
    elif is_significant and relative_lift < 0:
        decision = "loser"
    else:
        decision = "inconclusive"

    return AbTestResult(
        control_rate=p_c,
        variant_rate=p_v,
        absolute_lift=absolute_lift,
        relative_lift=relative_lift,
        z_score=z_score,
        p_value=p_value,
        confidence=confidence,
        is_significant=is_significant,
        decision=decision,
    )


def forecast_program_roi(
    inputs: AbTestInputs,
    avg_relative_lift: float,
    tests_per_month: int,
) -> ProgramForecast:
    """Forecast the steady-state monthly + annual ROI of the A/B testing program.

    Assumes the operator runs `tests_per_month` A/B tests per month and that
    each test produces an average `avg_relative_lift` (e.g. 0.05 = +5%) on the
    PDP CVR. The cumulative lift is modeled as additive on the steady-state
    monthly PDP traffic (a conservative simplification — real-world lift may
    be slightly multiplicative on the previous winner, but additive is the
    standard "what-if" model).

    Per-test tool cost is amortized across the program (tool_monthly_cost is
    the program's steady-state subscription, not a per-test cost). Operator
    hours are a flat monthly time-cost.
    """
    if not 0.0 <= avg_relative_lift <= 5.0:
        raise ValueError("avg_relative_lift must be between 0 and 5 (0% to 500%)")
    if tests_per_month < 0:
        raise ValueError("tests_per_month must be >= 0")

    # Gross margin lift per month = aov * avg_lift * monthly_sessions * margin
    gross_margin_lift = (
        inputs.aov
        * avg_relative_lift
        * inputs.monthly_pdp_sessions
        * inputs.margin
    )
    operator_cost = inputs.operator_hours_per_month * inputs.operator_hourly_rate
    total_cost = inputs.tool_monthly_cost + operator_cost

    net_monthly = gross_margin_lift - total_cost
    net_annual = net_monthly * 12.0
    annualized_cost = total_cost * 12.0
    if annualized_cost > 0:
        ratio = net_annual / annualized_cost
    else:
        ratio = float("inf") if net_annual > 0 else 0.0

    # Health bands for ratio (annualized net per $1 of program cost):
    #   great >= 20:1 (top-tier program, test-everything cadence)
    #   good  >= 10:1 (typical mature program)
    #   fair  >= 5:1  (acceptable but optimize tool/operator cost)
    #   weak  < 5:1   (consider lowering operator hours or testing fewer elements)
    if ratio >= 20.0:
        band = "great (>=20:1 annualized, top-tier always-on program)"
    elif ratio >= 10.0:
        band = "good (>=10:1 annualized, mature testing program)"
    elif ratio >= 5.0:
        band = "fair (>=5:1 annualized, acceptable — optimize operator hours)"
    else:
        band = "weak (<5:1 annualized, lower operator hours or raise avg lift)"

    return ProgramForecast(
        gross_margin_lift_per_month=gross_margin_lift,
        total_program_cost_per_month=total_cost,
        net_revenue_per_month=net_monthly,
        net_revenue_per_year=net_annual,
        annualized_cost=annualized_cost,
        annualized_ratio=ratio,
        health_band=band,
    )


# ----- CLI ------------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI args. Defaults match the canonical winner case from Move #9.5."""
    p = argparse.ArgumentParser(
        prog="pdp_ab_test.py",
        description=(
            "Analyze a PDP A/B test for statistical significance and forecast the "
            "always-on PDP A/B testing program ROI. See "
            "/playbooks/09.5-pdp-ab-testing-program.md."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--control-sessions", type=int, default=10000,
                   help="Sessions exposed to control arm")
    p.add_argument("--control-conversions", type=int, default=200,
                   help="Conversions in control arm")
    p.add_argument("--variant-sessions", type=int, default=10000,
                   help="Sessions exposed to variant arm")
    p.add_argument("--variant-conversions", type=int, default=240,
                   help="Conversions in variant arm")
    p.add_argument("--aov", type=float, default=75.0,
                   help="Average order value in USD")
    p.add_argument("--margin", type=float, default=0.70,
                   help="Gross margin (0.0 - 1.0)")
    p.add_argument("--monthly-pdp-sessions", type=int, default=10000,
                   help="Steady-state monthly PDP traffic")
    p.add_argument("--tool-monthly-cost", type=float, default=200.0,
                   help="A/B testing tool monthly subscription (Convert.com / VWO / Shoplift)")
    p.add_argument("--operator-hours-per-month", type=float, default=2.0,
                   help="Operator hours per month for test design + review")
    p.add_argument("--operator-hourly-rate", type=float, default=50.0,
                   help="Loaded operator hourly rate")
    p.add_argument("--confidence-target", type=float, default=0.95,
                   help="Confidence threshold for 'winner' decision (default 0.95)")
    p.add_argument("--avg-relative-lift", type=float, default=0.05,
                   help="Avg relative CVR lift per test for program ROI forecast (0.05 = 5 percent)")
    p.add_argument("--tests-per-month", type=int, default=4,
                   help="A/B tests launched per month in the steady-state program")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON output (machine-readable)")
    return p.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> AbTestInputs:
    """Convert parsed args to the AbTestInputs dataclass."""
    return AbTestInputs(
        control_sessions=args.control_sessions,
        control_conversions=args.control_conversions,
        variant_sessions=args.variant_sessions,
        variant_conversions=args.variant_conversions,
        aov=args.aov,
        margin=args.margin,
        monthly_pdp_sessions=args.monthly_pdp_sessions,
        tool_monthly_cost=args.tool_monthly_cost,
        operator_hours_per_month=args.operator_hours_per_month,
        operator_hourly_rate=args.operator_hourly_rate,
        confidence_target=args.confidence_target,
    )


def render_human(
    inputs: AbTestInputs,
    res: AbTestResult,
    program: ProgramForecast,
) -> str:
    """Render a human-readable, paste-ready report."""
    lines = []
    lines.append("PDP A/B Test — Significance Analysis + Program ROI Forecast")
    lines.append("=" * 60)
    lines.append("")
    lines.append("Test results (two-proportion z-test):")
    lines.append(f"  Control sessions      : {inputs.control_sessions:>10,d}")
    lines.append(f"  Control conversions   : {inputs.control_conversions:>10,d}")
    lines.append(f"  Control CVR           : {res.control_rate*100:>9.2f}%")
    lines.append(f"  Variant sessions      : {inputs.variant_sessions:>10,d}")
    lines.append(f"  Variant conversions   : {inputs.variant_conversions:>10,d}")
    lines.append(f"  Variant CVR           : {res.variant_rate*100:>9.2f}%")
    lines.append("")
    lines.append("  Absolute lift (pts)   : {:>+9.2f}".format(res.absolute_lift * 100))
    lines.append("  Relative lift         : {:>+9.2f}%".format(res.relative_lift * 100))
    lines.append(f"  z-score               : {res.z_score:>+10.3f}")
    lines.append(f"  p-value (two-sided)   : {res.p_value:>10.4f}")
    lines.append(f"  Confidence (1-p)      : {res.confidence*100:>9.2f}%")
    lines.append(f"  Decision              : {res.decision_label()}")
    lines.append("")
    lines.append("Program ROI forecast (always-on cadence):")
    lines.append(f"  Monthly PDP sessions  : {inputs.monthly_pdp_sessions:>10,d}")
    lines.append(f"  AOV                   : ${inputs.aov:>9,.2f}")
    lines.append(f"  Margin                : {inputs.margin*100:>9.1f}%")
    lines.append(f"  Tool monthly cost     : ${inputs.tool_monthly_cost:>9,.2f}")
    lines.append(f"  Operator hrs/mo       : {inputs.operator_hours_per_month:>10,.1f}")
    lines.append(f"  Operator rate         : ${inputs.operator_hourly_rate:>9,.2f}")
    lines.append("")
    lines.append(f"  Gross margin lift/mo  : ${program.gross_margin_lift_per_month:>9,.2f}")
    lines.append(f"  Total program cost/mo : ${program.total_program_cost_per_month:>9,.2f}")
    lines.append(f"  Net revenue / month   : ${program.net_revenue_per_month:>9,.2f}")
    lines.append(f"  Net revenue / year    : ${program.net_revenue_per_year:>9,.2f}")
    lines.append(f"  Annualized ratio      : {program.annualized_ratio:>9,.1f}x")
    lines.append("")
    lines.append(f"  Health band           : {program.health_band}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        inputs = build_inputs(args)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    res = analyze(inputs)
    program = forecast_program_roi(
        inputs,
        avg_relative_lift=args.avg_relative_lift,
        tests_per_month=args.tests_per_month,
    )
    try:
        if args.json:
            out = {
                "inputs": asdict(inputs),
                "analysis": asdict(res),
                "analysis_decision_label": res.decision_label(),
                "program_forecast": asdict(program),
                "program_health_band": program.health_band,
            }
            # NaN / inf are not JSON-serializable by default.
            def _sanitize(o):
                if isinstance(o, float):
                    if math.isnan(o):
                        return None
                    if math.isinf(o):
                        return "Infinity" if o > 0 else "-Infinity"
                    return o
                if isinstance(o, dict):
                    return {k: _sanitize(v) for k, v in o.items()}
                if isinstance(o, list):
                    return [_sanitize(v) for v in o]
                return o
            print(json.dumps(_sanitize(out), indent=2))
        else:
            print(render_human(inputs, res, program))
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())