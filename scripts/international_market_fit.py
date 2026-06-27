#!/usr/bin/env python3
"""
international_market_fit.py — Path A / B / C scorer for the
international-expansion track (Move #11 companion script).

Companion to:
- /research/04-international-expansion.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/11-international-rollout.md (Phase 1+2+3+4 operator build)
- /assets/13-international-pricing-card.md (paste-ready 7-market × 5-voice price-card)

This script takes a brand's US-baseline inputs (US GMV / category / AOV /
contribution margin / supply-chain complexity / operator capacity) and outputs
a Path A / B / C recommendation with cost stack, expected Year-1 lift, and a
6-step build sequence. It is the operator-build input for the playbook's
Prerequisites gate (Step 1 "pick path + markets").

The scoring rule (mirrors research/04 §GMV-tier paths + playbook 11
§Prerequisites):
  - US GMV < $1M                  → Path A (CA only)         — defer
  - US GMV $1M–$10M               → Path B (CA + UK + EU + AU) — default
  - US GMV $10M–$50M              → Path C (all 7 markets)   — gated on capacity
  - US GMV > $50M                 → Path C+ (Path C + in-region 3PL)
  - US contribution margin < 30%  → downgrade one tier (gated per Prereq #6)
  - supply_chain_complexity = 3   → downgrade one tier
  - operator_capacity < 4 hr/wk   → downgrade one tier

Why hermetic? This script does NOT query the Shopify Markets API, the Klaviyo
multi-locale endpoint, or any 3PL cross-border rate endpoint. The scoring
inputs (us_gmv / category / aov / margin / supply_chain_complexity /
operator_capacity) are operator-supplied at the CLI; the cost stack + per-market
projection are derived from research/04 + playbook 11 + asset 13 (the canonical
benchmarks the workspace already ships). This is the same hermetic recipe as
triple_whale_attribution_check.py / tiktok_attribution_audit.py — the 90% of
install mistakes the operator actually makes (wrong-path selection, under-
budgeting for translation, ignoring the 30% margin gate) don't require API
access; the local scoring rule catches them.

Usage:
    # Default: $5M US GMV apparel brand at $75 AOV with 70% margin
    python3 international_market_fit.py

    # Custom brand inputs
    python3 international_market_fit.py \\
        --us-gmv 15000000 --category beauty --us-aov 85 \\
        --us-contribution-margin-pct 55 --supply-chain-complexity 2 \\
        --operator-capacity-hours-per-week 12

    # JSON output (for cron / CI / dashboard piping)
    python3 international_market_fit.py --us-gmv 5000000 --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface route → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 04, playbook 11, asset 13, and /international route shipped; this
script is the next-layer follow-up. It compounds Asset 13's 35-cell matrix by
automating the Path A/B/C decision the operator currently does manually.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal

PathName = Literal["A", "B", "C", "C+"]
CategoryFit = Literal["high", "medium", "low"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandInputs:
    """Operator-supplied US-baseline inputs. All numeric bounds validated in __post_init__."""
    us_gmv: float                           # annual US GMV in USD
    category: str                           # apparel / beauty / home_goods / electronics / food / supplements / other
    us_aov: float                           # average order value in USD
    us_contribution_margin_pct: float       # 0–100
    supply_chain_complexity: int            # 1 (lightweight cross-border-ready) / 2 (medium) / 3 (heavy + bulky)
    operator_capacity_hours_per_week: int   # operator hours per week available for international

    def __post_init__(self) -> None:
        if self.us_gmv < 0:
            raise ValueError(f"us_gmv must be >= 0, got {self.us_gmv}")
        if self.us_aov <= 0:
            raise ValueError(f"us_aov must be > 0, got {self.us_aov}")
        if not (0 <= self.us_contribution_margin_pct <= 100):
            raise ValueError(
                f"us_contribution_margin_pct must be 0-100, got {self.us_contribution_margin_pct}"
            )
        if self.supply_chain_complexity not in (1, 2, 3):
            raise ValueError(
                f"supply_chain_complexity must be 1/2/3, got {self.supply_chain_complexity}"
            )
        if self.operator_capacity_hours_per_week < 0:
            raise ValueError(
                f"operator_capacity_hours_per_week must be >= 0, got {self.operator_capacity_hours_per_week}"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C / C+ recommendation with cost stack + lift + 6-step build."""
    path: PathName
    markets: list[str]
    justification: str
    cost_one_time_low: float
    cost_one_time_high: float
    cost_recurring_low: float
    cost_recurring_high: float
    expected_lift_low_pct: float   # Year-1 lift on US base, low end of band
    expected_lift_high_pct: float  # Year-1 lift on US base, high end of band
    year1_roi_low: float
    year1_roi_high: float
    build_sequence: list[str] = field(default_factory=list)


# ----- Category classification (the 5-category tiering) -------------------

# Per research/00 §Pillar 1 category fit + asset 13 §Decision matrix.
# High-fit categories are typically apparel / beauty / home goods with cross-border
# friendly form factors. Medium-fit includes consumer electronics (voltage + adapter
# friction). Low-fit includes food + supplements (FDA + per-market regulatory).
CATEGORY_FIT: dict[str, CategoryFit] = {
    "apparel": "high",
    "beauty": "high",
    "home_goods": "high",
    "electronics": "medium",
    "jewelry": "medium",
    "pet": "medium",
    "food": "low",
    "supplements": "low",
    "cbd": "low",
    "alcohol": "low",
    "firearms": "low",
    "medical_devices": "low",
}


def classify_category(category: str) -> CategoryFit:
    """Return high / medium / low category fit for international expansion.
    Unknown categories default to medium (conservative)."""
    return CATEGORY_FIT.get(category.lower(), "medium")


# ----- Core scoring rule (the path recommender) ---------------------------

# Path band thresholds (annual US GMV in USD).
PATH_A_FLOOR = 1_000_000.0       # Below $1M → defer (Path A as deferral)
PATH_B_FLOOR = 1_000_000.0       # $1M–$10M → Path B default
PATH_C_FLOOR = 10_000_000.0      # $10M–$50M → Path C
PATH_C_PLUS_FLOOR = 50_000_000.0 # >$50M → Path C+ (in-region 3PL)

# Path costs (USD, from research/04 §Cost & ROI estimate + playbook 11 §Cost & ROI).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    # (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high)
    "A":  (500.0,    2_000.0,   50.0,    200.0),
    "B":  (2_500.0,  7_500.0,   600.0,   1_200.0),
    "C":  (15_000.0, 30_000.0,  1_500.0, 2_500.0),
    "C+": (25_000.0, 100_000.0, 2_000.0, 8_000.0),
}

# Path lift bands (% of US base GMV, Year-1).
PATH_LIFT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 15.0),
    "B":  (30.0, 80.0),
    "C":  (50.0, 150.0),
    "C+": (75.0, 200.0),
}

# Path Year-1 ROI bands (revenue / cost).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (15.0, 40.0),
    "B":  (20.0, 60.0),
    "C":  (30.0, 100.0),
    "C+": (40.0, 120.0),
}

# Path market scope.
PATH_MARKETS: dict[PathName, list[str]] = {
    "A":  ["CA"],
    "B":  ["CA", "UK", "EU", "AU"],
    "C":  ["CA", "UK", "EU", "AU", "JP", "DACH", "Nordics"],
    "C+": ["CA", "UK", "EU", "AU", "JP", "DACH", "Nordics"],
}

# Path rank for downgrade logic (A < B < C < C+).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2, "C+": 3}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path-tier floors (minimum GMV for each path tier — gates downgrade).
TIER_FLOOR: dict[PathName, float] = {
    "A":  0.0,
    "B":  PATH_B_FLOOR,
    "C":  PATH_C_FLOOR,
    "C+": PATH_C_PLUS_FLOOR,
}

# Margin + supply-chain + capacity gates (the downgrade triggers).
MARGIN_GATE_PCT = 30.0            # playbook 11 §Prereq #6
CAPACITY_GATE_HR_WK = 4           # playbook 11 §Prereq #8 floor

# Per-market lift share within a Path (used for per-market projection).
# Sum within each path = 1.0. Sourced from research/04 §Cost & ROI + asset 13.
PER_MARKET_LIFT_SHARE: dict[PathName, dict[str, float]] = {
    "A":  {"CA": 1.0},
    "B":  {"CA": 0.35, "UK": 0.30, "EU": 0.25, "AU": 0.10},
    "C":  {"CA": 0.20, "UK": 0.18, "EU": 0.16, "AU": 0.10,
           "JP": 0.14, "DACH": 0.12, "Nordics": 0.10},
    "C+": {"CA": 0.18, "UK": 0.16, "EU": 0.15, "AU": 0.10,
           "JP": 0.16, "DACH": 0.13, "Nordics": 0.12},
}


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US GMV (without downgrade gates)."""
    if us_gmv >= PATH_C_PLUS_FLOOR:
        return "C+"
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandInputs) -> PathRecommendation:
    """Apply the scoring rule + downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []

    # Path A as deferral when below the $1M floor.
    if inputs.us_gmv < PATH_B_FLOOR:
        justification_parts.append(
            f"US GMV ${inputs.us_gmv:,.0f} is below the ${PATH_B_FLOOR:,.0f} floor; "
            f"international expansion is deferred until US GMV exceeds $1M (per "
            f"playbook 11 §Prerequisites)."
        )
        # Still surface Path A as the recommendation (deferral = CA-only as audit).
        path = "A"
    else:
        path = _tier_for_gmv(inputs.us_gmv)
        justification_parts.append(
            f"US GMV ${inputs.us_gmv:,.0f} lands in the {path} tier "
            f"(${TIER_FLOOR[path]:,.0f}–${_tier_ceiling(path):,.0f})."
        )

    # Apply downgrade gates (the v0.9.0 layer-order-completion sub-rule analogue).
    downgrades: list[str] = []
    if inputs.us_contribution_margin_pct < MARGIN_GATE_PCT:
        downgrades.append(
            f"US contribution margin {inputs.us_contribution_margin_pct:.0f}% < "
            f"{MARGIN_GATE_PCT:.0f}% gate (playbook 11 §Prerequisite #6)"
        )
    if inputs.supply_chain_complexity == 3:
        downgrades.append(
            "supply chain complexity = 3 (heavy/bulky with US-only packaging); "
            "playbook 11 Gate A flags in-region 3PL as required"
        )
    if inputs.operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        downgrades.append(
            f"operator capacity {inputs.operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 11 §Prerequisite #8)"
        )
    for _ in downgrades:
        path = RANK_PATH[max(PATH_RANK[path] - 1, 0)]
    if downgrades:
        justification_parts.append(
            f"Downgraded from base tier by {len(downgrades)} gate(s): "
            + "; ".join(downgrades)
            + f". Final path = {path}."
        )
    else:
        justification_parts.append("All gates pass; no downgrade applied.")

    # Cost stack + lift + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    lift_low, lift_high = PATH_LIFT[path]
    roi_low, roi_high = PATH_ROI[path]

    return PathRecommendation(
        path=path,
        markets=PATH_MARKETS[path],
        justification=" ".join(justification_parts),
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        expected_lift_low_pct=lift_low,
        expected_lift_high_pct=lift_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        build_sequence=build_sequence_for_path(path),
    )


def _tier_ceiling(path: PathName) -> float:
    """Return the GMV ceiling for a path tier (exclusive)."""
    if path == "A":
        return PATH_B_FLOOR
    if path == "B":
        return PATH_C_FLOOR
    if path == "C":
        return PATH_C_PLUS_FLOOR
    return float("inf")


# ----- Build-sequence recipe ----------------------------------------------

# The 6-step build recipe, parameterized by path. Mirrors asset 13 §6-step build.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (30 min) — Pick path + markets: Path A = CA only. Verify US-baseline AOV + per-voice first-order-discount policy from Asset 02.",
        "Step 2 (1 hr) — Activate Shopify Markets for CA: pricing rules + CAD display + per-market voice-variant PDP copy.",
        "Step 3 (45 min) — Wire USMCA duty-free DDP for CA (≤$40 USD tariff exemption covers most apparel + home goods + beauty).",
        "Step 4 (1 hr) — Set per-market free-shipping threshold (CA $99 default; raise to $129 for heavier categories).",
        "Step 5 (skip for Path A) — Path B/C only: pre-stage JP + DACH + Nordics rows as drafts in Markets → Drafts.",
        "Step 6 (45 min, ongoing) — Run per-market contribution-margin calculator (Asset 13 §contribution-margin calculator) + verify the 5 verification gates pass.",
    ],
    "B": [
        "Step 1 (30 min) — Pick path + markets: Path B = CA + UK + EU + AU. Verify US contribution margin ≥30% per Prerequisite #6.",
        "Step 2 (1 hr) — Activate Shopify Markets for CA + UK + EU-DE + EU-FR + AU: per-market pricing + currency display + per-market voice-variant PDP copy.",
        "Step 3 (45 min) — Wire DDP for IOSS (EU ≤€150) + UK VAT MOSS (≤£135) + AU GST (register at A$75k threshold).",
        "Step 4 (1 hr) — Set per-market free-shipping thresholds: CA $99 / UK £75 / EU €89 / AU $149. Wire Klarna + AfterPay for DACH + AU.",
        "Step 5 (30 min, Path C pre-stage) — Pre-stage JP + DACH-AT + Nordics-S/E rows as drafts in Markets → Drafts.",
        "Step 6 (45 min, ongoing) — Run per-market contribution-margin calculator + verify the 5 verification gates from Asset 13.",
    ],
    "C": [
        "Step 1 (30 min) — Pick path + markets: Path C = all 7 markets with in-region 3PL distribution (US + EU + AU + JP).",
        "Step 2 (2 hr) — Activate Shopify Markets for all 7 markets: per-market pricing + currency display + native-language voice profiles (DE/FR/ES/JP) per Pillar 5.",
        "Step 3 (2 hr) — Wire DDP + IOSS + UK VAT MOSS + AU GST + JP consumption tax. Register in-region 3PLs (EU + UK + AU + JP).",
        "Step 4 (1 hr) — Set per-market free-shipping thresholds (CA $99 / UK £75 / EU €89 / AU $149 / JP ¥14,900 / DACH-AT €89 / Nordics €89). Wire Klarna + AfterPay + iDEAL + Bancontact + Konbini + Alipay.",
        "Step 5 (1 hr) — Pre-launch: deepL + native-speaker translation review + cultural-adaptation pass + per-market ad-campaign launch.",
        "Step 6 (1 hr/wk ongoing) — Per-market contribution-margin calculator + per-market CAC payback tracking + quarterly FX-rate refresh per Asset 13 Pitfall #10.",
    ],
    "C+": [
        "Step 1 (1 hr) — Pick path + markets: Path C+ = all 7 markets with distributed 3-region 3PL (US + EU + AU) for 1–5 day fulfillment.",
        "Step 2 (3 hr) — Activate Shopify Markets Enterprise for all 7 markets with multi-region fulfillment routing + per-market pricing.",
        "Step 3 (3 hr) — Wire DDP + IOSS + UK VAT MOSS + AU GST + JP consumption tax + distributed 3-region 3PL onboarding.",
        "Step 4 (2 hr) — Set per-market free-shipping thresholds (Path C defaults). Wire all BNPL + local payment methods (Klarna + AfterPay + iDEAL + Bancontact + Konbini + Alipay + WeChat Pay).",
        "Step 5 (2 hr) — Pre-launch: native-language voice profiles (DE/FR/ES/JP/IT/NL) + cultural-adaptation pass + per-market ad-campaign launch with localized creative.",
        "Step 6 (2 hr/wk ongoing) — Per-market P&L tracking + per-market CAC payback + monthly FX-rate refresh + per-market impact reporting per Asset 12 Pillar 1 (carbon) + Pillar 5 (community) for Sustainable voice.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-market projection ----------------------------------------------

def project_per_market_lift(inputs: BrandInputs, rec: PathRecommendation) -> dict[str, float]:
    """Project annual international revenue per market.

    Total Year-1 lift is (expected_lift_low_pct + expected_lift_high_pct) / 2 / 100
    applied to inputs.us_gmv. Each market receives its share per
    PER_MARKET_LIFT_SHARE for the path.
    """
    midpoint_lift_pct = (rec.expected_lift_low_pct + rec.expected_lift_high_pct) / 2.0
    total_international_revenue = inputs.us_gmv * midpoint_lift_pct / 100.0
    shares = PER_MARKET_LIFT_SHARE[rec.path]
    return {market: total_international_revenue * share for market, share in shares.items()}


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/04 Path B default."""
    parser = argparse.ArgumentParser(
        prog="international_market_fit.py",
        description=(
            "Score a brand's US-baseline inputs against the research/04 + playbook 11 "
            "Path A / B / C matrix. Returns the recommended path + cost stack + lift + "
            "6-step build sequence for the cross-border DTC rollout."
        ),
        epilog=(
            "Defaults: $5M US GMV apparel brand at $75 AOV with 70% margin and "
            "8 hr/wk operator capacity (the canonical Path B default). "
            "Companion to /research/04, /playbooks/11, /assets/13."
        ),
    )
    parser.add_argument("--us-gmv", type=float, default=5_000_000.0,
                        help="Annual US GMV in USD (default: 5000000 = $5M, the canonical Path B default).")
    parser.add_argument("--category", type=str, default="apparel",
                        choices=sorted(CATEGORY_FIT.keys()) + ["other"],
                        help="Product category for category-fit tiering (default: apparel).")
    parser.add_argument("--us-aov", type=float, default=75.0,
                        help="US average order value in USD (default: 75).")
    parser.add_argument("--us-contribution-margin-pct", type=float, default=70.0,
                        help="US contribution margin %% (0-100; default: 70, the canonical Default-voice benchmark).")
    parser.add_argument("--supply-chain-complexity", type=int, default=1, choices=[1, 2, 3],
                        help="1 = lightweight cross-border-ready / 2 = medium / 3 = heavy + bulky (default: 1).")
    parser.add_argument("--operator-capacity-hours-per-week", type=int, default=8,
                        help="Operator hours per week for international (default: 8, well above the 4 hr/wk floor).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandInputs:
    """Convert argparse Namespace → BrandInputs (with the validation in __post_init__)."""
    return BrandInputs(
        us_gmv=args.us_gmv,
        category=args.category,
        us_aov=args.us_aov,
        us_contribution_margin_pct=args.us_contribution_margin_pct,
        supply_chain_complexity=args.supply_chain_complexity,
        operator_capacity_hours_per_week=args.operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("International market-fit recommendation")
    lines.append("=" * 42)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US GMV (annual)                    : ${inputs.us_gmv:>15,.0f}")
    lines.append(f"  Category                           : {inputs.category}")
    lines.append(f"  US AOV                             : ${inputs.us_aov:>15,.2f}")
    lines.append(f"  US contribution margin             : {inputs.us_contribution_margin_pct:>14.0f}%")
    lines.append(f"  Supply chain complexity (1-3)      : {inputs.supply_chain_complexity:>15d}")
    lines.append(f"  Operator capacity (hr/wk)          : {inputs.operator_capacity_hours_per_week:>15d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Markets                           : {', '.join(rec.markets)}")
    lines.append(f"  Justification                     : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)          : ${rec.cost_one_time_low:>12,.0f} – ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)       : ${rec.cost_recurring_low:>12,.0f} – ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Revenue lift on US base            : {rec.expected_lift_low_pct:.0f}% – {rec.expected_lift_high_pct:.0f}%")
    lines.append(f"  Year-1 ROI                         : {rec.year1_roi_low:.0f}:1 – {rec.year1_roi_high:.0f}:1")
    lines.append("")
    lines.append("Per-market Year-1 projection (midpoint lift × market share):")
    proj = project_per_market_lift(inputs, rec)
    for market, revenue in proj.items():
        lines.append(f"  {market:<8s}                       : ${revenue:>15,.0f}")
    lines.append(f"  {'TOTAL':<8s}                       : ${sum(proj.values()):>15,.0f}")
    lines.append("")
    lines.append("6-step build sequence:")
    for step in rec.build_sequence:
        lines.append(f"  {step}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        inputs = build_inputs(args)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    rec = recommend_path(inputs)
    if args.json:
        # Merge inputs + recommendation + per-market projection for downstream consumption.
        out = {
            "inputs": asdict(inputs),
            "recommendation": asdict(rec),
            "per_market_projection": project_per_market_lift(inputs, rec),
        }
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, rec))
    return 0


if __name__ == "__main__":
    sys.exit(main())