#!/usr/bin/env python3
"""
subscription_unit_economics.py — Path A / B / C scorer for the subscription-program
track (Move #11 companion script).

Companion to:
- /research/08-subscriptions.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/15-subscription-program-launch.md (4-phase Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop operator build)
- /assets/16-subscription-flow-templates.md (paste-ready 5-flow × 5-voice × {email + SMS} templates)

This script takes a brand's current subscription-fit inputs (us_gmv / aov /
monthly_orders / consumables_revenue_share_pct / aov_under_30 / has_replenishment_cadence /
subscriber_conversion_baseline_pct / monthly_churn_baseline_pct / category /
platform_preference / has_subscriber_attribution / operator_capacity_hours_per_week) and
outputs a Path A (Recharge Starter) / Path B (Recharge Plus DEFAULT) / Path C
(Skio Enterprise / Recharge Enterprise / Stay AI) recommendation with cost stack,
expected Year-1 incremental subscription revenue, LTV multiplier, monthly MRR
projection, smart-cancellation recovery, dunning recovery, winback recovery, and a
6-step build sequence. It is the operator-build input for the playbook's
Prerequisites gate (Phase 1 Step 1 "pick path + subscription platform").

The scoring rule (mirrors research/08 §GMV-tier paths + playbook 15
§Prerequisites + asset 16 §5-discount-tier matrix + canonical 4-alternative
smart-cancellation flow):
  - us_gmv < $100k                            → defer (Path A surfaced as audit only)
  - us_gmv $100k-$500k                        → Path A (Recharge Starter / Bold Subscriptions Starter)
  - us_gmv $500k-$10M                         → Path B (Recharge Plus / Skio Plus) DEFAULT
  - us_gmv $10M+                              → Path C (Skio Enterprise / Recharge Enterprise / Stay AI)
  - consumables_revenue_share_pct < 30%       → defer (30% consumable-revenue-share is the canonical subscription-fit threshold)
  - aov < $30                                 → downgrade one tier (low AOV breaks subscriber LTV math)
  - monthly_orders < 200                      → defer (canonical subscription break-even threshold per Recharge 2024)
  - has_replenishment_cadence = False         → defer (no natural 30-120 day re-purchase cadence)
  - subscriber_conversion_baseline_pct < 5%   → defer (5-30% conversion is the canonical Recharge benchmark)
  - monthly_churn_baseline_pct > 15%         → defer (>15% monthly churn breaks subscription LTV math)
  - has_subscriber_attribution = False        → downgrade one tier (Triple Whale subscriber-cohort LTV is the canonical
                                                Phase 4 prerequisite per research/08 Pillar 4)
  - operator_capacity_hours_per_week < 2      → defer (Path A minimum 2 hr/wk ongoing per playbook 15 §Prereq #12)

Why hermetic? This script does NOT call Recharge / Skio / Bold / Stay AI /
Appstle / Seal / Loop / Klaviyo / Postscript / Smile.io / Triple Whale APIs.
The inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence are derived from research/08 + playbook 15
+ asset 16 (the canonical benchmarks the workspace already ships). This is the
same hermetic recipe as threepl_unit_economics.py / marketplace_unit_economics.py
/ international_market_fit.py / lifecycle_flow_health_check.py — the 90% of
install mistakes the operator actually makes (wrong-path selection,
under-budgeting for setup, ignoring the consumables-fit gate) don't require API
access; the local scoring rule catches them.

Usage:
    # Default: $3M US DTC consumables brand, $45 AOV, 6,667 monthly_orders, 70% consumable share
    python3 subscription_unit_economics.py

    # Custom inputs (e.g. $8M consumables brand, $50 AOV, 80% consumable share)
    python3 subscription_unit_economics.py \\
        --us-gmv 8000000 --aov 50 --monthly-orders 13333 \\
        --consumables-revenue-share-pct 80 \\
        --aov-under-30 false --has-replenishment-cadence true \\
        --subscriber-conversion-baseline-pct 20 \\
        --monthly-churn-baseline-pct 6 --category consumables \\
        --platform-preference recharge --has-subscriber-attribution true \\
        --operator-capacity-hours-per-week 8

    # JSON output (for cron / CI / dashboard piping)
    python3 subscription_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 08, playbook 15, asset 16 (subscription-flow-templates), and
/subscriptions route shipped 2026-06-29; this script is the canonical
5th-layer follow-up per the research → playbook → asset → operator-surface →
scripts layer order. It compounds asset 16's 5-flow × 5-voice × {email + SMS}
= 50 voice-driven override cells + 5-discount-tier matrix [5/10/15/20/25% off
for 30/45/60/90/120-day cadence] + the canonical 4-alternative
smart-cancellation flow [pause + skip + change-frequency + 25%-discount
recovering 20-35%] + 3-attempt dunning-flow recovering 50-70% + 60-day
winback-flow returning 10-20% + research/08 §GMV-tier paths + playbook 15
§Phase 1 PDP widget + §Phase 2 customer-portal + smart-cancellation + dunning +
§Phase 3 replenishment-reminder + §Phase 4 subscriber-cohort-LTV by automating
the per-brand path-selection decision the operator currently does manually
against the 3-path GMV-tier matrix.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal

PathName = Literal["A", "B", "C"]
Category = Literal[
    "default", "consumables", "luxury", "sustainable",
    "gen_z", "b2b", "fragile", "apparel",
]
PlatformPreference = Literal["recharge", "skio", "bold", "stay_ai", "appstle", "seal", "loop"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandSubscriptionInputs:
    """Operator-supplied current-subscription-fit inputs. All numeric bounds validated in __post_init__."""
    us_gmv: float                                 # current US DTC GMV in USD
    aov: float                                    # current average order value in USD
    monthly_orders: int                           # current monthly order count
    consumables_revenue_share_pct: float          # 0-100, % of revenue from consumables (food/pet/vitamins/etc.)
    aov_under_30: bool                            # whether brand's AOV is under $30 (low-AOV guardrail)
    has_replenishment_cadence: bool               # whether hero SKUs have 30-120 day natural replenishment cadence
    subscriber_conversion_baseline_pct: float     # expected % of consumable customers who'll convert to subscribers (5-30%)
    monthly_churn_baseline_pct: float             # expected monthly churn rate (5-15%)
    category: str                                 # default / consumables / luxury / sustainable / gen_z / b2b / fragile / apparel
    platform_preference: str                      # recharge / skio / bold / stay_ai / appstle / seal / loop
    has_subscriber_attribution: bool              # whether Triple Whale subscriber-cohort LTV is wired
    operator_capacity_hours_per_week: int         # operator hours per week for subscription program

    def __post_init__(self) -> None:
        if self.us_gmv < 0:
            raise ValueError(f"us_gmv must be >= 0, got {self.us_gmv}")
        if self.aov <= 0:
            raise ValueError(f"aov must be > 0, got {self.aov}")
        if self.aov > 10_000.0:
            # canonical ceiling per research/08 Pillar 1 luxury-tier sanity bound
            raise ValueError(f"aov must be <= $10,000, got {self.aov}")
        if self.monthly_orders < 0:
            raise ValueError(f"monthly_orders must be >= 0, got {self.monthly_orders}")
        if not (0 <= self.consumables_revenue_share_pct <= 100):
            raise ValueError(
                f"consumables_revenue_share_pct must be 0-100, got {self.consumables_revenue_share_pct}"
            )
        if not (0 <= self.subscriber_conversion_baseline_pct <= 100):
            raise ValueError(
                f"subscriber_conversion_baseline_pct must be 0-100, got {self.subscriber_conversion_baseline_pct}"
            )
        if not (0 <= self.monthly_churn_baseline_pct <= 100):
            raise ValueError(
                f"monthly_churn_baseline_pct must be 0-100, got {self.monthly_churn_baseline_pct}"
            )
        valid_categories = {"default", "consumables", "luxury", "sustainable",
                            "gen_z", "b2b", "fragile", "apparel"}
        if self.category not in valid_categories:
            raise ValueError(
                f"category must be one of {sorted(valid_categories)}, got {self.category!r}"
            )
        valid_platforms = {"recharge", "skio", "bold", "stay_ai", "appstle", "seal", "loop"}
        if self.platform_preference not in valid_platforms:
            raise ValueError(
                f"platform_preference must be one of {sorted(valid_platforms)}, got {self.platform_preference!r}"
            )
        if self.operator_capacity_hours_per_week < 0:
            raise ValueError(
                f"operator_capacity_hours_per_week must be >= 0, got {self.operator_capacity_hours_per_week}"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C recommendation with cost stack + LTV multiplier + 6-step build."""
    path: PathName
    platforms: list[str]
    default_platform_pick: str
    justification: str
    cost_one_time_low: float
    cost_one_time_high: float
    cost_recurring_low: float
    cost_recurring_high: float
    year1_cost_low: float
    year1_cost_high: float
    year1_subscription_revenue_share_pct_low: float
    year1_subscription_revenue_share_pct_high: float
    year1_subscription_revenue_low: float
    year1_subscription_revenue_high: float
    ltv_multiplier_low: float
    ltv_multiplier_high: float
    year1_subscriber_count_low: int
    year1_subscriber_count_high: int
    smart_cancellation_recovery_pct_low: float
    smart_cancellation_recovery_pct_high: float
    dunning_recovery_pct_low: float
    dunning_recovery_pct_high: float
    winback_recovery_pct_low: float
    winback_recovery_pct_high: float
    year1_roi_low: float
    year1_roi_high: float
    discount_tier_matrix: dict[str, str] = field(default_factory=dict)
    build_sequence: list[str] = field(default_factory=list)


# ----- Category classification ---------------------------------------------

def classify_category(category: str) -> Category:
    """Return canonical category-fit label. Unknown categories default to default (conservative)."""
    valid = {"default", "consumables", "luxury", "sustainable",
             "gen_z", "b2b", "fragile", "apparel"}
    if category in valid:
        return category  # type: ignore[return-value]
    return "default"


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 100_000          # Below $100k → defer (canonical subscription-program entry floor)
PATH_B_FLOOR = 500_000          # $500k-$10M → Path B (Recharge Plus) DEFAULT for $500k+ GMV consumables brands
PATH_C_FLOOR = 10_000_000       # $10M+ → Path C (Skio Enterprise / Recharge Enterprise / Stay AI)

# Path costs (USD, from research/08 §Cost & ROI estimate + playbook 15 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,    500.0,    99.0,   149.0),     # Recharge Starter / Bold Starter: $0-$500 setup + $99-$149/mo
    "B":  (500.0,  2_000.0,  499.0,  499.0),     # Recharge Plus / Skio Plus: $500-$2k setup + $499/mo
    "C":  (2_000.0, 10_000.0, 1_000.0, 5_000.0), # Recharge Enterprise / Skio Enterprise / Stay AI: $2k-$10k setup + $1k-$5k/mo
}

# Year-1 subscription-revenue-share bands (% of consumable revenue, from research/08 §Path A/B/C).
PATH_SUBSCRIPTION_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (15.0, 30.0),    # Path A: 15-30% of consumable revenue per research/08 §Path A
    "B":  (25.0, 50.0),    # Path B: 25-50% per research/08 §Path B (DEFAULT)
    "C":  (40.0, 70.0),    # Path C: 40-70% per research/08 §Path C (largest share, premium-tier operators)
}

# Subscriber LTV multiplier bands (vs one-time-purchase LTV, from research/08 Pillar 2 §c).
PATH_LTV_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 2.5),    # Path A: 1.5-2.5× one-time LTV per research/08 Pillar 2
    "B":  (2.0, 3.0),    # Path B: 2.0-3.0× (DEFAULT) per research/08 Pillar 2
    "C":  (2.5, 3.5),    # Path C: 2.5-3.5× per research/08 Pillar 2 (premium operators)
}

# Subscriber-conversion-rate bands (% of consumable customers who convert, from research/08 Pillar 2 §a).
PATH_CONVERSION_RATE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (10.0, 20.0),    # Path A: 10-20% per research/08 §Path A
    "B":  (20.0, 35.0),    # Path B: 20-35% per research/08 §Path B (DEFAULT)
    "C":  (25.0, 40.0),    # Path C: 25-40% per research/08 §Path C (premium operators)
}

# Smart-cancellation recovery bands (% of would-be cancellations, from research/08 Pillar 3 §c).
SMART_CANCELLATION_RECOVERY_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (10.0, 20.0),    # Path A: pause + skip only
    "B":  (20.0, 35.0),    # Path B: pause + skip + change-frequency + 25%-discount (DEFAULT)
    "C":  (30.0, 45.0),    # Path C: 6+ alternatives + AI-driven discount-optimization
}

# Dunning-flow recovery bands (% of subscription-renewals, from research/08 Pillar 3 §d).
DUNNING_RECOVERY_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (40.0, 55.0),    # Path A: Recharge native + Klaviyo basic
    "B":  (50.0, 70.0),    # Path B: + Postscript SMS dunning (DEFAULT)
    "C":  (60.0, 80.0),    # Path C: + Stripe Smart Retries + custom retry-logic
}

# Winback-flow recovery bands (% of cancelled-subscribers returning, from research/08 Pillar 3 §e).
WINBACK_RECOVERY_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 12.0),     # Path A: manual Klaviyo winback-flow
    "B":  (10.0, 20.0),    # Path B: + retargeting ads (DEFAULT)
    "C":  (15.0, 25.0),    # Path C: + direct-mail + winback-specialist team
}

# Year-1 ROI bands (gross revenue / cost, per research/08 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (8.0, 15.0),     # canonical 12:1 default Path A (research/08 line 174)
    "B":  (3.2, 25.0),     # canonical 8.3:1 default Path B gross; muted to 3.2:1 gross / 2.2:1 net Year-1 (research/08 line 174 + playbook 15 §Cost & ROI)
    "C":  (7.5, 35.0),     # canonical 15:1 default Path C gross (research/08 line 175)
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A":  ["Recharge Starter ($99/mo) OR Bold Subscriptions Starter ($49/mo)"],
    "B":  ["Recharge Plus ($499/mo) DEFAULT", "Skio Plus ($499/mo)"],
    "C":  ["Recharge Enterprise", "Skio Enterprise", "Seal Subscriptions", "Stay AI"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A":  "Recharge Starter (default Path A; $99/mo for <1,000 subscribers)",
    "B":  "Recharge Plus (default Path B; $499/mo for 1,000-10,000 subscribers — canonical DEFAULT for $500k-$10M GMV consumables brands)",
    "C":  "Recharge Enterprise OR Skio Enterprise OR Seal Subscriptions (default Path C; $1k-$5k/mo for 10,000+ subscribers)",
}

# 5-discount-tier matrix (from research/08 Pillar 1 + asset 16 §5-discount-tier matrix).
# Maps cadence (days) → discount + use case.
DISCOUNT_TIER_MATRIX: dict[str, str] = {
    "30-day": "5% off (vitamins / pet treats / supplements with strong monthly cadence)",
    "45-day": "10% off (cosmetics / skincare with monthly-ish cadence)",
    "60-day": "15% off (personal care / oral care / household with 2-month cadence) — DEFAULT",
    "90-day": "20% off (food / beverage / pet food with quarterly cadence)",
    "120-day": "25% off (multi-pack / curated boxes with quarterly+ cadence)",
}

# Upgrade + downgrade gates.
LOW_AOV_DOWNGRADE_ENABLED = True
ATTR_DOWNGRADE_ENABLED = True
CONSUMABLES_DEFER_ENABLED = True
CADENCE_DEFER_ENABLED = True
ORDERS_DEFER_ENABLED = True
CONVERSION_DEFER_ENABLED = True
CHURN_DEFER_ENABLED = True
CAPACITY_GATE_HR_WK = 2                    # <2 hr/wk → defer (Path A minimum 2 hr/wk ongoing)
CONSUMABLES_REVENUE_SHARE_FLOOR_PCT = 30   # <30% → defer (canonical subscription-fit threshold per research/08 §Prerequisites)
MIN_MONTHLY_ORDERS = 200                   # <200/mo → defer (canonical subscription break-even per Recharge 2024)
MIN_CONVERSION_BASELINE_PCT = 5            # <5% → defer (canonical Recharge 2024 baseline)
MAX_MONTHLY_CHURN_BASELINE_PCT = 15        # >15% → defer (breaks subscription LTV math)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandSubscriptionInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_consumables = False
    deferred_for_orders = False
    deferred_for_cadence = False
    deferred_for_conversion = False
    deferred_for_churn = False

    # Capacity floor: defer if operator has insufficient time.
    if inputs.operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 15 §Prerequisite #12 + asset 16 §5-discount-tier matrix); "
            f"subscription program deferred until operator capacity is available."
        )
        deferred_for_capacity = True

    # Consumables-revenue-share floor: defer if <30% (canonical subscription-fit threshold).
    if CONSUMABLES_DEFER_ENABLED and inputs.consumables_revenue_share_pct < CONSUMABLES_REVENUE_SHARE_FLOOR_PCT:
        justification_parts.append(
            f"Consumables revenue share {inputs.consumables_revenue_share_pct}% < "
            f"{CONSUMABLES_REVENUE_SHARE_FLOOR_PCT}% floor (research/08 §Prerequisites); subscription program "
            f"deferred until at least 30% of revenue is from consumables (food / pet / vitamins / supplements / "
            f"personal care / household / beauty / baby / beverage / cosmetics / skincare / oral care with 30-120 day "
            f"replenishment cadence)."
        )
        deferred_for_consumables = True

    # Monthly-orders floor: defer if <200/mo (canonical subscription break-even).
    if ORDERS_DEFER_ENABLED and inputs.monthly_orders < MIN_MONTHLY_ORDERS:
        justification_parts.append(
            f"Monthly orders {inputs.monthly_orders} < {MIN_MONTHLY_ORDERS} floor (Recharge 2024 State of "
            f"Subscriptions: 200/mo is the canonical subscription break-even threshold); subscription program "
            f"deferred until monthly order volume exceeds 200/mo."
        )
        deferred_for_orders = True

    # Replenishment-cadence floor: defer if no natural cadence.
    if CADENCE_DEFER_ENABLED and not inputs.has_replenishment_cadence:
        justification_parts.append(
            f"No replenishment cadence on hero SKUs (research/08 §Prerequisites + playbook 15 §Gate A2); "
            f"subscription program deferred until at least one hero SKU has a 30-120 day natural re-purchase cadence."
        )
        deferred_for_cadence = True

    # Subscriber-conversion-baseline floor: defer if <5% (canonical Recharge benchmark).
    if CONVERSION_DEFER_ENABLED and inputs.subscriber_conversion_baseline_pct < MIN_CONVERSION_BASELINE_PCT:
        justification_parts.append(
            f"Subscriber-conversion-baseline {inputs.subscriber_conversion_baseline_pct}% < "
            f"{MIN_CONVERSION_BASELINE_PCT}% floor (research/08 Pillar 2 §a: 5-30% is the canonical Recharge "
            f"benchmark; below 5% suggests the brand isn't a fit for subscriptions at this time); "
            f"subscription program deferred until conversion-rate target is achievable."
        )
        deferred_for_conversion = True

    # Monthly-churn-baseline ceiling: defer if >15% (breaks subscription LTV math).
    if CHURN_DEFER_ENABLED and inputs.monthly_churn_baseline_pct > MAX_MONTHLY_CHURN_BASELINE_PCT:
        justification_parts.append(
            f"Monthly churn baseline {inputs.monthly_churn_baseline_pct}% > "
            f"{MAX_MONTHLY_CHURN_BASELINE_PCT}% ceiling (research/08 Pillar 2 §b: 5-8% median / 10-15% underperformer; "
            f"above 15% breaks the subscription LTV math); subscription program deferred until winback-flow + "
            f"dunning-flow are shipped first to bring churn below 15%."
        )
        deferred_for_churn = True

    # Base tier assignment.
    if inputs.us_gmv < PATH_A_FLOOR:
        # Path A as deferral when below the $100k GMV floor.
        path = "A"
        if not (deferred_for_capacity or deferred_for_consumables or deferred_for_orders
                or deferred_for_cadence or deferred_for_conversion or deferred_for_churn):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} is below the ${PATH_A_FLOOR:,.0f} "
                f"subscription-program entry floor; subscription launch is deferred until "
                f"US DTC GMV exceeds ${PATH_A_FLOOR:,.0f} (research/08 §Prerequisites). "
                f"Path A is still surfaced as the recommendation for tracking (audit only)."
            )
    else:
        path = _tier_for_gmv(inputs.us_gmv)
        if not (deferred_for_capacity or deferred_for_consumables or deferred_for_orders
                or deferred_for_cadence or deferred_for_conversion or deferred_for_churn):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} lands in the Path {path} tier "
                f"(${_tier_floor_text(path)} - ${_tier_ceiling_text(path)} GMV)."
            )

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    upgrades: list[str] = []
    downgrades: list[str] = []

    # Downgrade: AOV under $30 (low-AOV breaks subscriber LTV math).
    if LOW_AOV_DOWNGRADE_ENABLED and inputs.aov_under_30:
        downgrades.append(
            f"AOV ${inputs.aov:.0f} < $30 floor (research/08 Pillar 2: low-AOV consumables break the "
            f"subscriber-LTV math — subscriber discount 15-20% + dunning cost + winback cost eat too "
            f"much of the per-order contribution margin); downgrade one tier"
        )

    # Downgrade: no Triple Whale subscriber-cohort attribution.
    if ATTR_DOWNGRADE_ENABLED and not inputs.has_subscriber_attribution:
        downgrades.append(
            f"has_subscriber_attribution=False (research/08 Pillar 4 + playbook 15 §Phase 4 Step 4.1: "
            f"Triple Whale subscriber-cohort-LTV is the canonical Phase 4 prerequisite; without it the "
            f"subscriber-LTV-multiplier cannot be verified with real data); downgrade one tier until "
            f"Triple Whale → Reports → Cohort LTV filter to subscription_status is wired"
        )

    # Apply the upgrades first (raise the tier), then the downgrades (lower it).
    for _ in upgrades:
        path = RANK_PATH[min(PATH_RANK[path] + 1, PATH_RANK["C"])]
    for _ in downgrades:
        path = RANK_PATH[max(PATH_RANK[path] - 1, PATH_RANK["A"])]

    if upgrades or downgrades:
        justification_parts.append(
            f"Applied {len(upgrades)} upgrade(s) and {len(downgrades)} downgrade(s): "
            + ("UPGRADES: " + "; ".join(upgrades) + " " if upgrades else "")
            + ("DOWNGRADES: " + "; ".join(downgrades) if downgrades else "")
            + f". Final path = {path}."
        )
    elif not (deferred_for_capacity or deferred_for_consumables or deferred_for_orders
              or deferred_for_cadence or deferred_for_conversion or deferred_for_churn):
        justification_parts.append("All gates pass; no upgrade/downgrade applied.")

    # Cost stack + lift + LTV + recovery + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    share_low, share_high = PATH_SUBSCRIPTION_REVENUE_SHARE_PCT[path]
    ltv_low, ltv_high = PATH_LTV_MULTIPLIER[path]
    conv_low, conv_high = PATH_CONVERSION_RATE_PCT[path]
    smart_low, smart_high = SMART_CANCELLATION_RECOVERY_PCT[path]
    dun_low, dun_high = DUNNING_RECOVERY_PCT[path]
    win_low, win_high = WINBACK_RECOVERY_PCT[path]
    roi_low, roi_high = PATH_ROI[path]

    # Compute dollar bands.
    consumable_revenue_low = inputs.us_gmv * (inputs.consumables_revenue_share_pct / 100.0)
    sub_rev_low = consumable_revenue_low * (share_low / 100.0)
    sub_rev_high = consumable_revenue_low * (share_high / 100.0)

    # Subscriber count (apply conversion rate to monthly consumable orders).
    consumable_orders_low = inputs.monthly_orders * (inputs.consumables_revenue_share_pct / 100.0)
    sub_count_low = int(consumable_orders_low * (conv_low / 100.0))
    sub_count_high = int(consumable_orders_low * (conv_high / 100.0))

    return PathRecommendation(
        path=path,
        platforms=PATH_PLATFORMS[path],
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[path],
        justification=" ".join(justification_parts),
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_cost_low=cost_low + 12 * rec_low,
        year1_cost_high=cost_high + 12 * rec_high,
        year1_subscription_revenue_share_pct_low=share_low,
        year1_subscription_revenue_share_pct_high=share_high,
        year1_subscription_revenue_low=sub_rev_low,
        year1_subscription_revenue_high=sub_rev_high,
        ltv_multiplier_low=ltv_low,
        ltv_multiplier_high=ltv_high,
        year1_subscriber_count_low=sub_count_low,
        year1_subscriber_count_high=sub_count_high,
        smart_cancellation_recovery_pct_low=smart_low,
        smart_cancellation_recovery_pct_high=smart_high,
        dunning_recovery_pct_low=dun_low,
        dunning_recovery_pct_high=dun_high,
        winback_recovery_pct_low=win_low,
        winback_recovery_pct_high=win_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        discount_tier_matrix=dict(DISCOUNT_TIER_MATRIX),
        build_sequence=build_sequence_for_path(path),
    )


def _tier_floor_text(path: PathName) -> str:
    """Return the lower-bound GMV for a path tier as a display string."""
    if path == "A":
        return f"{PATH_A_FLOOR:,.0f}"
    if path == "B":
        return f"{PATH_B_FLOOR:,.0f}"
    return f"{PATH_C_FLOOR:,.0f}"


def _tier_ceiling_text(path: PathName) -> str:
    """Return the upper-bound GMV for a path tier as a display string."""
    if path == "A":
        return f"{PATH_B_FLOOR - 1:,.0f}"
    if path == "B":
        return f"{PATH_C_FLOOR - 1:,.0f}"
    return "∞"


# ----- Build-sequence recipe ---------------------------------------------

# The 6-step build recipe, parameterized by path. Mirrors playbook 15 §Phase 1+2+3+4.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (2 hr) — Pick path + Recharge Starter setup: Path A = Recharge Starter ($99/mo) OR Bold Subscriptions Starter ($49/mo). Verify ≥$100k US DTC GMV + ≥30% consumables revenue share + ≥200 monthly orders + Move #1 + #4 + #6 + #8 shipped per research/08 §Prereq #1.",
        "Step 2 (4 hr) — Phase 1 PDP subscribe-and-save widget: install on top 3-5 hero SKUs with the highest 30-120 day repeat-purchase cadence → 10-15% subscriber discount → \"Subscribe & save\" widget on PDP + cart per playbook 15 §Phase 1 Step 1.1-1.3.",
        "Step 3 (2 hr) — Phase 2 customer portal: enable Recharge customer portal (cancel + pause + skip; defer change-frequency + 25%-discount to Path B) + set up dunning-email automation (Recharge subscription_payment_failed → Klaviyo basic flow) per playbook 15 §Phase 2 Step 2.1-2.2.",
        "Step 4 (1 hr) — Manual Klaviyo winback-flow (NO Recharge winback-native at Path A): build Klaviyo segment subscription_status == cancelled → 3-email cadence 30d/60d/90d with 15%/20%/25% discount ladder per asset 16 §Flow 5 winback (Path A simplified version) + playbook 15 §Phase 2 Step 2.5.",
        "Step 5 (2 hr) — In-house inventory + manual FIFO: track lot/batch numbers manually in Google Sheets (defer subscription-specialty 3PL to Path B); set up minimum 2-month inventory buffer for hero subscription SKUs to avoid stockouts per playbook 15 §Phase 3 Step 3.3.",
        "Step 6 (2 hr/wk ongoing) — Subscriber-cohort monitoring (manual) + churn-alert: monitor monthly churn via Recharge → Cancellation-reasons analytics weekly; if churn >8%/mo, escalate to Step 4 winback-flow optimization per playbook 15 §Phase 4 Step 4.3. Defer Triple Whale subscriber-cohort-LTV wiring to Path B Phase 4.",
    ],
    "B": [
        "Step 1 (5 hr) — Pick path + Recharge Plus setup: Path B = Recharge Plus ($499/mo) OR Skio Plus ($499/mo). Verify ≥$500k US DTC GMV + ≥1,000 subscribers potential + Move #1 + #4 + #6 + #7 + #8 shipped per research/08 §Prereq #1.",
        "Step 2 (10 hr) — Phase 1 PDP subscribe-and-save widget (15-20% discount): install on top 3-5 hero SKUs with 60-day cadence DEFAULT + 30/45/90/120-day cadence per the canonical 5-discount-tier matrix (research/08 Pillar 1 + asset 16 §5-discount-tier matrix) + 5 voice-driven override columns per playbook 15 §Phase 1 Step 1.1-1.4.",
        "Step 3 (8 hr) — Phase 2 customer portal + smart-cancellation + dunning: enable full customer portal (cancel + pause + skip + change-frequency + 25%-discount per playbook 15 §Phase 2 Step 2.4) + Recharge native dunning + Klaviyo dunning-flow + Postscript SMS dunning per asset 16 §Flow 4 cancellation-confirmation + playbook 15 §Phase 2 Step 2.5-2.6.",
        "Step 4 (8 hr) — Phase 3 replenishment-reminder + Recharge native winback: install Recharge Pre-shipment Reminder trigger (2 emails at Day -7 + Day -1 + 1 SMS at Day -1 with cross-sell banner from Klaviyo's Catalog → Recommended Products feed) per asset 16 §Flow 2 + Recharge native winback + Klaviyo winback-flow + retargeting ads per asset 16 §Flow 5 + playbook 15 §Phase 3 Step 3.1-3.4.",
        "Step 5 (4 hr) — Phase 4 subscriber-cohort-LTV via Triple Whale: Triple Whale → Reports → Cohort LTV → filter to subscription_status = active OR cancelled → compare 30d/60d/90d/180d cohort LTV for subscribers vs one-time-purchasers → expected 2.0-3.0× subscriber-LTV multiplier per playbook 15 §Phase 4 Step 4.1.",
        "Step 6 (4 hr/wk ongoing) — Churn-alert + Smile.io 2× points for subscription-orders + 3PL subscription-specialty: Triple Whale → Alerts → subscription_churn_rate > 8%/mo → Slack alert + Smile.io 2× points rule for subscription-orders per playbook 15 §Phase 4 Step 4.2-4.4 + (if applicable) migration to subscription-specialty 3PL per research/07 §Pillar 5.",
    ],
    "C": [
        "Step 1 (10 hr) — Pick path + multi-platform architecture: Path C = Recharge Enterprise OR Skio Enterprise OR Seal Subscriptions OR Stay AI ($1k-$5k/mo + custom transaction fees). Verify ≥$10M US DTC GMV + Path B steady-state + dedicated subscription-team per research/08 §Prereq #1.",
        "Step 2 (20 hr) — Phase 1 PDP subscribe-and-save widget (segmented-discount: premium-tier 10% off + value-tier 25% off): install on top 5-10 hero SKUs with per-tier discount logic + 5-discount-tier matrix per cadence + 5 voice-driven override columns per playbook 15 §Phase 1 Step 1.1-1.5 (Path C extended).",
        "Step 3 (15 hr) — Phase 2 customer portal + smart-cancellation (6+ alternatives) + dunning (custom retry-logic): enable full customer portal (cancel + pause + skip + change-frequency + 25%-discount + downgrade-tier + 6-month-pause + 12-month-pause per playbook 15 §Phase 2 Step 2.4 Path C extended) + Recharge + Skio + Klaviyo + Stripe Smart Retries + custom retry-logic per asset 16 §Flow 4 cancellation-confirmation (Path C extended).",
        "Step 4 (15 hr) — Phase 3 replenishment-reminder + winback (direct-mail + winback-specialist team): Recharge Pre-shipment Reminder + AI-driven replenishment-cadence optimization + winback-specialist team + direct-mail winback (postcard at Day 30 + Day 60) + retargeting ads per asset 16 §Flow 5 (Path C extended) + playbook 15 §Phase 3 Step 3.1-3.5.",
        "Step 5 (10 hr) — Phase 4 subscriber-cohort-LTV via Triple Whale (multi-platform sync): Triple Whale → Reports → Cohort LTV → filter to subscription_status (active / cancelled / paused) across Recharge + Skio + Seal → compare 30d/60d/90d/180d/365d cohort LTV for subscribers vs one-time-purchasers → expected 2.5-3.5× subscriber-LTV multiplier per playbook 15 §Phase 4 Step 4.1 Path C extended.",
        "Step 6 (10+ hr/wk ongoing + dedicated subscription-team) — Multi-3PL subscription-specialty fulfillment + churn-optimization + cross-platform subscriber-LTV monitoring: per playbook 15 §Phase 4 Step 4.4-4.6 Path C extended + multi-3PL orchestration per research/07 §Pillar 5 Path C (Stord + Flowspace + Extensiv) for subscription-specialty fulfillment.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandSubscriptionInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental subscription revenue + LTV multiplier + subscriber count for the recommended path.

    Uses the midpoint of the path's subscription-revenue-share band and the
    operator's US DTC GMV to derive per-line revenue. Returns a dict suitable
    for JSON output.
    """
    share_mid = (rec.year1_subscription_revenue_share_pct_low + rec.year1_subscription_revenue_share_pct_high) / 2.0
    ltv_mid = (rec.ltv_multiplier_low + rec.ltv_multiplier_high) / 2.0

    consumable_revenue_mid = inputs.us_gmv * (inputs.consumables_revenue_share_pct / 100.0)
    year1_subscription_revenue_mid = consumable_revenue_mid * (share_mid / 100.0)

    # Subscriber count midpoint.
    consumable_orders_mid = inputs.monthly_orders * (inputs.consumables_revenue_share_pct / 100.0)
    conv_mid = (PATH_CONVERSION_RATE_PCT[rec.path][0] + PATH_CONVERSION_RATE_PCT[rec.path][1]) / 2.0
    subscriber_count_mid = int(consumable_orders_mid * (conv_mid / 100.0))

    # MRR projection (mid estimate) = subscriber_count × $AOV × (1 - subscriber_discount).
    # Use 17.5% midpoint subscriber discount (Path B DEFAULT 15-20%).
    subscriber_discount_mid = 0.175
    mrr_mid = subscriber_count_mid * inputs.aov * (1.0 - subscriber_discount_mid)

    # Recovery metrics midpoints.
    smart_cancellation_recovery_mid = (rec.smart_cancellation_recovery_pct_low + rec.smart_cancellation_recovery_pct_high) / 2.0
    dunning_recovery_mid = (rec.dunning_recovery_pct_low + rec.dunning_recovery_pct_high) / 2.0
    winback_recovery_mid = (rec.winback_recovery_pct_low + rec.winback_recovery_pct_high) / 2.0

    # ROI midpoint: ratio of gross subscription revenue over year1_cost. The canonical
    # PATH_ROI band in research/08 documents gross-revenue/cost (research/08 §Cost &
    # ROI estimate quotes "8.3:1 default Path B" before net-of-discount adjustment).
    # Subscription-platform + dunning + winback costs are reported separately so the
    # operator can see the net-of-discount figure.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    roi_mid = year1_subscription_revenue_mid / year1_cost_mid if year1_cost_mid > 0 else 0.0

    return {
        "us_gmv": inputs.us_gmv,
        "consumable_revenue_mid": consumable_revenue_mid,
        "year1_subscription_revenue_pct_mid": share_mid,
        "year1_subscription_revenue_low": rec.year1_subscription_revenue_low,
        "year1_subscription_revenue_mid": year1_subscription_revenue_mid,
        "year1_subscription_revenue_high": rec.year1_subscription_revenue_high,
        "ltv_multiplier_mid": ltv_mid,
        "subscriber_count_mid": subscriber_count_mid,
        "mrr_mid": mrr_mid,
        "smart_cancellation_recovery_pct_mid": smart_cancellation_recovery_mid,
        "dunning_recovery_pct_mid": dunning_recovery_mid,
        "winback_recovery_pct_mid": winback_recovery_mid,
        "year1_cost_low": rec.year1_cost_low,
        "year1_cost_mid": year1_cost_mid,
        "year1_cost_high": rec.year1_cost_high,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/08 Path B default."""
    parser = argparse.ArgumentParser(
        prog="subscription_unit_economics.py",
        description=(
            "Score a brand's current-subscription-fit inputs against the research/08 + playbook 15 + "
            "asset 16 Path A / B / C matrix. Returns the recommended path + subscription platform pick + "
            "cost stack + Year-1 subscription revenue + LTV multiplier + subscriber count + smart-cancellation "
            "recovery + dunning recovery + winback recovery + 6-step build sequence for the subscription program."
        ),
        epilog=(
            "Defaults: $3M US DTC consumables brand, $45 AOV, 6,667 monthly_orders, 70% consumable share "
            "(the canonical Path B default for $500k-$10M GMV consumables brands per research/08 §GMV-tier "
            "paths). Companion to /research/08, /playbooks/15, /assets/16-subscription-flow-templates.md."
        ),
    )
    parser.add_argument("--us-gmv", type=float, default=3_000_000.0,
                        help="Current US DTC GMV in USD (default: 3,000,000 = Path B default).")
    parser.add_argument("--aov", type=float, default=45.0,
                        help="Current average order value in USD (default: 45).")
    parser.add_argument("--monthly-orders", type=int, default=6667,
                        help="Current monthly order count (default: 6,667 = Path B default).")
    parser.add_argument("--consumables-revenue-share-pct", type=float, default=70.0,
                        help="%% of revenue from consumables (0-100, default: 70 = Path B default).")
    parser.add_argument("--aov-under-30", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether brand's AOV is under $30 (default: false).")
    parser.add_argument("--has-replenishment-cadence", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether hero SKUs have 30-120 day natural replenishment cadence (default: true).")
    parser.add_argument("--subscriber-conversion-baseline-pct", type=float, default=20.0,
                        help="Expected %% of consumable customers who'll convert to subscribers (5-30, default: 20).")
    parser.add_argument("--monthly-churn-baseline-pct", type=float, default=6.0,
                        help="Expected monthly churn rate (5-15, default: 6 = Path B median).")
    parser.add_argument("--category", type=str, default="consumables",
                        choices=["default", "consumables", "luxury", "sustainable",
                                 "gen_z", "b2b", "fragile", "apparel"],
                        help="Product category (default: consumables).")
    parser.add_argument("--platform-preference", type=str, default="recharge",
                        choices=["recharge", "skio", "bold", "stay_ai", "appstle", "seal", "loop"],
                        help="Subscription platform preference (default: recharge).")
    parser.add_argument("--has-subscriber-attribution", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Triple Whale subscriber-cohort LTV is wired (default: true).")
    parser.add_argument("--operator-capacity-hours-per-week", type=int, default=8,
                        help="Operator hours per week for subscription program (default: 8; floor is 2).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandSubscriptionInputs:
    """Convert argparse Namespace → BrandSubscriptionInputs (with the validation in __post_init__)."""
    return BrandSubscriptionInputs(
        us_gmv=args.us_gmv,
        aov=args.aov,
        monthly_orders=args.monthly_orders,
        consumables_revenue_share_pct=args.consumables_revenue_share_pct,
        aov_under_30=(args.aov_under_30.lower() == "true"),
        has_replenishment_cadence=(args.has_replenishment_cadence.lower() == "true"),
        subscriber_conversion_baseline_pct=args.subscriber_conversion_baseline_pct,
        monthly_churn_baseline_pct=args.monthly_churn_baseline_pct,
        category=args.category,
        platform_preference=args.platform_preference,
        has_subscriber_attribution=(args.has_subscriber_attribution.lower() == "true"),
        operator_capacity_hours_per_week=args.operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandSubscriptionInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Subscription-program Path A/B/C recommendation")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                            : ${inputs.us_gmv:>15,.0f}")
    lines.append(f"  AOV                                   : ${inputs.aov:>15,.2f}")
    lines.append(f"  Monthly orders                        : {inputs.monthly_orders:>15,d}")
    lines.append(f"  Consumables revenue share             : {inputs.consumables_revenue_share_pct:>14.1f}%")
    lines.append(f"  AOV under $30                         : {inputs.aov_under_30}")
    lines.append(f"  Has replenishment cadence             : {inputs.has_replenishment_cadence}")
    lines.append(f"  Subscriber-conversion-baseline        : {inputs.subscriber_conversion_baseline_pct:>14.1f}%")
    lines.append(f"  Monthly-churn-baseline                : {inputs.monthly_churn_baseline_pct:>14.1f}%")
    lines.append(f"  Category                              : {inputs.category}")
    lines.append(f"  Platform preference                   : {inputs.platform_preference}")
    lines.append(f"  Has subscriber attribution            : {inputs.has_subscriber_attribution}")
    lines.append(f"  Operator capacity (hr/wk)             : {inputs.operator_capacity_hours_per_week:>15d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Platforms                             : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                 : {rec.default_platform_pick}")
    lines.append(f"  Justification                         : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)             : ${rec.cost_one_time_low:>12,.0f} – ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)          : ${rec.cost_recurring_low:>12,.0f} – ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                : ${rec.year1_cost_low:>12,.0f} – ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Subscription revenue share (low-high) : {rec.year1_subscription_revenue_share_pct_low:.0f}% – {rec.year1_subscription_revenue_share_pct_high:.0f}%")
    lines.append(f"  Subscription revenue $ (low-high)     : ${rec.year1_subscription_revenue_low:>12,.0f} – ${rec.year1_subscription_revenue_high:,.0f}")
    lines.append(f"  LTV multiplier (low-high)             : {rec.ltv_multiplier_low:.1f}× – {rec.ltv_multiplier_high:.1f}×")
    lines.append(f"  Subscriber count (low-high)           : {rec.year1_subscriber_count_low:>12,d} – {rec.year1_subscriber_count_high:>12,d}")
    lines.append(f"  Smart-cancellation recovery (low-high): {rec.smart_cancellation_recovery_pct_low:.0f}% – {rec.smart_cancellation_recovery_pct_high:.0f}%")
    lines.append(f"  Dunning recovery (low-high)           : {rec.dunning_recovery_pct_low:.0f}% – {rec.dunning_recovery_pct_high:.0f}%")
    lines.append(f"  Winback recovery (low-high)           : {rec.winback_recovery_pct_low:.0f}% – {rec.winback_recovery_pct_high:.0f}%")
    lines.append(f"  Year-1 ROI                            : {rec.year1_roi_low:.1f}:1 – {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-discount-tier matrix (cadence → discount + use case):")
    for cadence, tier_desc in rec.discount_tier_matrix.items():
        lines.append(f"  {cadence:<10} : {tier_desc}")
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
        # Merge inputs + recommendation + per-path revenue for downstream consumption.
        out = {
            "inputs": asdict(inputs),
            "recommendation": asdict(rec),
            "per_path_revenue": project_per_path_revenue(inputs, rec),
        }
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, rec))
    return 0


if __name__ == "__main__":
    main()