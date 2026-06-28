#!/usr/bin/env python3
"""
marketplace_unit_economics.py — Path A / B / C scorer for the marketplace-expansion
track (Move #13 companion script).

Companion to:
- /research/06-marketplace-expansion.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/13-marketplace-launch.md (4-phase Amazon + Walmart + Target Plus + EU marketplaces operator build)
- /assets/15-marketplace-listing-card.md (paste-ready 5-marketplace × 5-voice listing copy)

This script takes a brand's current channel-mix inputs (us_gmv / aov /
contribution_margin_pct / category / amazon_fulfillment_mode / brand_registry_status /
operator_capacity_hours_per_week) and outputs a Path A (Amazon-only) / Path B
(Amazon + Walmart DEFAULT) / Path C (all marketplaces) recommendation with cost
stack, expected Year-1 incremental net revenue, DTC-cannibalization-adjusted net
lift, marketplace breakdown (Amazon + Walmart + Target Plus + Amazon EU + bol +
Zalando + Cdiscount + Amazon JP revenue shares), and a 6-step build sequence. It
is the operator-build input for the playbook's Prerequisites gate (Phase 1 Step 1
"pick path + marketplace scope").

The scoring rule (mirrors research/06 §GMV-tier paths + playbook 13
§Prerequisites + asset 15 §3-tier marketplace-scope decision matrix):
  - us_gmv < $500k             → defer (Path A recommended for tracking)
  - us_gmv $500k-$1M           → Path A (Amazon-only)
  - us_gmv $1M-$5M             → Path A or Path B (Path B is DEFAULT once Walmart-ready)
  - us_gmv $5M-$10M            → Path B (Amazon + Walmart) DEFAULT
  - us_gmv $10M+               → Path C (all marketplaces including international)
  - category = consumables     → upgrade one tier (recurring-revenue marketplaces like Subscribe-and-Save unlock earlier)
  - category = luxury          → downgrade one tier (luxury brands face Amazon-Halo 25-35% cannibalization vs 10-20% for default per Marketplace Pulse 2024)
  - amazon_fulfillment_mode = FBM AND has warehouse capability → downgrade one tier (FBM avoids Amazon inventory carrying cost)
  - brand_registry_status = pending → defer (Brand Registry is the canonical Phase 1 prereq per playbook 13 Gate A2)
  - operator_capacity_hours_per_week < 5 → defer (Phase 1 Amazon requires 25 hr one-time + 5 hr/wk ongoing)

Why hermetic? This script does NOT call Amazon Seller Central / Walmart Seller
Center / Target Plus Roundel / Amazon Attribution / Triple Whale APIs. The inputs
are operator-supplied at the CLI; the cost stack + per-path projection +
6-step build sequence are derived from research/06 + playbook 13 + asset 15
(the canonical benchmarks the workspace already ships). This is the same
hermetic recipe as threepl_unit_economics.py / international_market_fit.py /
lifecycle_flow_health_check.py — the 90% of install mistakes the operator
actually makes (wrong-path selection, under-budgeting for EU compliance,
ignoring the DTC-cannibalization trap) don't require API access; the local
scoring rule catches them.

Usage:
    # Default: $5M US DTC brand, $75 AOV, 40% contribution margin, default category, FBA, registered
    python3 marketplace_unit_economics.py

    # Custom inputs (e.g. $15M brand, $120 AOV, 35% margin, luxury)
    python3 marketplace_unit_economics.py \\
        --us-gmv 15000000 --aov 120 --contribution-margin-pct 35 \\
        --category luxury --amazon-fulfillment-mode FBA \\
        --brand-registry-status approved --operator-capacity-hours-per-week 30

    # JSON output (for cron / CI / dashboard piping)
    python3 marketplace_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 06, playbook 13, asset 15 (marketplace-listing-card), and /marketplace
route shipped 2026-06-27; this script is the canonical 5th-layer follow-up per
the research → playbook → asset → operator-surface → scripts layer order.
It compounds asset 15's 25 voice-variant listing titles + 25 bullet-point sets +
20 A+ content skeletons + research/06 §GMV-tier paths + playbook 13 §Phase 1
Step 1.2 Brand Registry by automating the per-brand path-selection decision the
operator currently does manually against the 3-path GMV-tier matrix.
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
    "gen_z", "b2b", "fragile", "subscription",
]
FulfillmentMode = Literal["FBA", "FBM", "SFP", "hybrid"]
BrandRegistryStatus = Literal["pending", "submitted", "approved", "rejected", "not_applicable"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandChannelInputs:
    """Operator-supplied current-channel-mix inputs. All numeric bounds validated in __post_init__."""
    us_gmv: float                          # current US DTC GMV in USD
    aov: float                             # current average order value in USD
    contribution_margin_pct: float         # current DTC contribution margin as % (0-100)
    category: str                          # default / consumables / luxury / sustainable / gen_z / b2b / fragile / subscription
    amazon_fulfillment_mode: str           # FBA / FBM / SFP / hybrid
    brand_registry_status: str             # pending / submitted / approved / rejected / not_applicable
    operator_capacity_hours_per_week: int  # operator hours per week available for marketplace expansion
    has_uspto_trademark: bool              # whether operator has a registered USPTO trademark

    def __post_init__(self) -> None:
        if self.us_gmv < 0:
            raise ValueError(f"us_gmv must be >= 0, got {self.us_gmv}")
        if self.aov <= 0:
            raise ValueError(f"aov must be > 0, got {self.aov}")
        if self.aov > 10_000.0:
            # canonical ceiling per research/06 Pillar 1 luxury-tier sanity bound
            raise ValueError(f"aov must be <= $10,000, got {self.aov}")
        if not (0 <= self.contribution_margin_pct <= 100):
            raise ValueError(
                f"contribution_margin_pct must be 0-100, got {self.contribution_margin_pct}"
            )
        valid_categories = {"default", "consumables", "luxury", "sustainable",
                            "gen_z", "b2b", "fragile", "subscription"}
        if self.category not in valid_categories:
            raise ValueError(
                f"category must be one of {sorted(valid_categories)}, got {self.category!r}"
            )
        valid_modes = {"FBA", "FBM", "SFP", "hybrid"}
        if self.amazon_fulfillment_mode not in valid_modes:
            raise ValueError(
                f"amazon_fulfillment_mode must be one of {sorted(valid_modes)}, got {self.amazon_fulfillment_mode!r}"
            )
        valid_statuses = {"pending", "submitted", "approved", "rejected", "not_applicable"}
        if self.brand_registry_status not in valid_statuses:
            raise ValueError(
                f"brand_registry_status must be one of {sorted(valid_statuses)}, got {self.brand_registry_status!r}"
            )
        if self.operator_capacity_hours_per_week < 0:
            raise ValueError(
                f"operator_capacity_hours_per_week must be >= 0, got {self.operator_capacity_hours_per_week}"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C recommendation with cost stack + lift + 6-step build."""
    path: PathName
    marketplaces: list[str]
    default_marketplace_pick: str
    justification: str
    cost_one_time_low: float
    cost_one_time_high: float
    cost_recurring_low: float
    cost_recurring_high: float
    year1_cost_low: float
    year1_cost_high: float
    year1_incremental_revenue_pct_low: float
    year1_incremental_revenue_pct_high: float
    year1_incremental_revenue_low: float
    year1_incremental_revenue_high: float
    year1_dtc_cannibalization_rate_low: float
    year1_dtc_cannibalization_rate_high: float
    year1_adjusted_net_revenue_low: float
    year1_adjusted_net_revenue_high: float
    year1_roi_low: float
    year1_roi_high: float
    marketplace_revenue_breakdown: dict[str, float] = field(default_factory=dict)
    build_sequence: list[str] = field(default_factory=list)


# ----- Category classification ---------------------------------------------

def classify_category(category: str) -> Category:
    """Return canonical category-fit label. Unknown categories default to default (conservative)."""
    valid = {"default", "consumables", "luxury", "sustainable",
             "gen_z", "b2b", "fragile", "subscription"}
    if category in valid:
        return category  # type: ignore[return-value]
    return "default"


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 500_000         # Below $500k → defer (canonical marketplace-expansion entry floor)
PATH_B_FLOOR = 1_000_000       # $1M-$10M → Path B (Amazon + Walmart) DEFAULT for $5M+ brands
PATH_C_FLOOR = 10_000_000      # $10M+ → Path C (all marketplaces including international)

# Path costs (USD, from research/06 §Cost & ROI estimate + playbook 13 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (5_000.0,  15_000.0,   1_000.0,  2_500.0),     # Amazon-only: USPTO + Brand Registry + FBA inbound + Sponsored Products
    "B":  (10_000.0, 25_000.0,  2_500.0,  5_000.0),     # Amazon + Walmart + Walmart Sponsored Products + WFS
    "C":  (50_000.0, 100_000.0, 10_000.0, 20_000.0),    # All marketplaces + EU compliance + dedicated manager
}

# Year-1 incremental net revenue bands (% of US-DTC-GMV, from research/06 §Path A/B/C).
PATH_INCREMENTAL_REVENUE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (20.0, 45.0),    # +20-45% of US-DTC-GMV per research/06 §Path A
    "B":  (30.0, 70.0),    # +30-70% per research/06 §Path B
    "C":  (40.0, 100.0),   # +40-100% per research/06 §Path C (largest absolute, lowest per-dollar ROI)
}

# Year-1 DTC cannibalization rate (% of US-DTC-GMV that gets shifted to marketplace, NOT incremental).
# Per research/06 Pillar 2 §Amazon Halo + Marketplace Pulse 2024: 10-25% cannibalization for default,
# 25-35% for luxury (luxury buyers are 3-4× more likely to search Amazon for the same brand).
PATH_DTC_CANNIBALIZATION_RATE: dict[PathName, tuple[float, float]] = {
    "A":  (10.0, 20.0),    # default Amazon Halo 10-20% per Marketplace Pulse 2024
    "B":  (15.0, 25.0),    # Walmart adds another 5-10% cannibalization
    "C":  (20.0, 35.0),    # EU marketplaces push cannibalization higher (cross-border brand-search)
}

# Year-1 ROI bands (revenue / cost, after DTC-cannibalization adjustment).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 12.0),     # canonical 8:1 default Path A
    "B":  (8.0, 18.0),     # canonical 12:1 default Path B
    "C":  (6.0, 14.0),     # canonical 10:1 default Path C (EU friction drags per-dollar ROI)
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path marketplace scope (description, used in recommendation).
PATH_MARKETPLACES: dict[PathName, list[str]] = {
    "A":  ["Amazon US (3P + Brand Registry + FBA + Sponsored Products + DSP branded defense)"],
    "B":  ["Amazon US (Path A fully)", "Walmart US (3P + WFS + Sponsored Products + Brand Portal)"],
    "C":  ["Amazon US", "Walmart US", "Target Plus (Roundel application)",
           "Amazon EU (DE + FR + IT + ES + NL)", "Amazon JP", "bol", "Zalando", "Cdiscount"],
}

# Path default marketplace pick.
PATH_DEFAULT_MARKETPLACE_PICK: dict[PathName, str] = {
    "A":  "Amazon US (default Path A; 56% of US product-searches per Jungle Scout 2024)",
    "B":  "Amazon US + Walmart US (default Path B; Amazon first then Walmart at $5M+ GMV)",
    "C":  "All 8 marketplaces (default Path C; US + EU + JP + Target Plus)",
}

# Marketplace revenue share breakdown (% of total incremental marketplace revenue).
# Path A = 100% Amazon. Path B = 65% Amazon + 35% Walmart. Path C = full breakdown.
MARKETPLACE_REVENUE_SHARES: dict[PathName, dict[str, float]] = {
    "A":  {"Amazon US": 100.0},
    "B":  {"Amazon US": 65.0, "Walmart US": 35.0},
    "C":  {"Amazon US": 35.0, "Walmart US": 15.0, "Target Plus": 8.0,
           "Amazon EU": 22.0, "Amazon JP": 8.0, "bol": 5.0,
           "Zalando": 4.0, "Cdiscount": 3.0},
}

# Upgrade + downgrade gates.
CONSUMABLES_UPGRADE_ENABLED = True
LUXURY_DOWNGRADE_ENABLED = True
FBM_DOWNGRADE_ENABLED = True
REGISTRY_DEFER_ENABLED = True
TRADEMARK_DEFER_ENABLED = True
CAPACITY_GATE_HR_WK = 5                    # <5 hr/wk → defer (Path A minimum 5 hr/wk ongoing)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandChannelInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_registry = False
    deferred_for_trademark = False

    # Capacity floor: defer if operator has insufficient time.
    if inputs.operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 13 §Prerequisite #8 + #22); "
            f"marketplace expansion deferred until operator capacity is available."
        )
        deferred_for_capacity = True

    # Brand Registry floor: defer if pending and not yet submitted.
    if REGISTRY_DEFER_ENABLED and inputs.brand_registry_status == "pending":
        justification_parts.append(
            f"Brand Registry status '{inputs.brand_registry_status}' (playbook 13 §Gate A2); "
            f"marketplace expansion deferred until USPTO trademark registration + Amazon Brand "
            f"Registry enrollment are submitted at minimum."
        )
        deferred_for_registry = True

    # USPTO trademark floor: defer if no trademark (without one, Brand Registry is impossible).
    if TRADEMARK_DEFER_ENABLED and not inputs.has_uspto_trademark:
        justification_parts.append(
            f"No USPTO trademark registered (playbook 13 §Gate A1); marketplace expansion "
            f"deferred until trademark is registered. Amazon Brand Registry requires a LIVE "
            f"USPTO trademark in TSDR."
        )
        deferred_for_trademark = True

    # Base tier assignment.
    if inputs.us_gmv < PATH_A_FLOOR:
        # Path A as deferral when below the $500k GMV floor.
        path = "A"
        if not (deferred_for_capacity or deferred_for_registry or deferred_for_trademark):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} is below the ${PATH_A_FLOOR:,.0f} "
                f"marketplace-expansion entry floor; marketplace launch is deferred until "
                f"US DTC GMV exceeds ${PATH_A_FLOOR:,.0f} for at least 3 consecutive months "
                f"(research/06 §Prerequisites). Path A is still surfaced as the recommendation "
                f"for tracking (audit only)."
            )
    else:
        path = _tier_for_gmv(inputs.us_gmv)
        if not (deferred_for_capacity or deferred_for_registry or deferred_for_trademark):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} lands in the Path {path} tier "
                f"(${_tier_floor_text(path)} - ${_tier_ceiling_text(path)} GMV)."
            )

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    upgrades: list[str] = []
    downgrades: list[str] = []

    # Upgrade: consumables category (Subscribe-and-Save unlocks recurring-revenue marketplaces).
    if CONSUMABLES_UPGRADE_ENABLED and classify_category(inputs.category) == "consumables":
        upgrades.append(
            f"category={inputs.category} unlocks Subscribe-and-Save + recurring-revenue "
            f"marketplaces (research/06 §Pillar 3: consumables get 15-25% higher marketplace-LTV "
            f"vs default category due to repeat-purchase flywheel)"
        )

    # Downgrade: luxury category (Amazon Halo 25-35% cannibalization vs 10-20% default).
    if LUXURY_DOWNGRADE_ENABLED and classify_category(inputs.category) == "luxury":
        downgrades.append(
            f"category={inputs.category} faces Amazon Halo 25-35% DTC-cannibalization vs "
            f"10-20% default (Marketplace Pulse 2024: luxury buyers are 3-4× more likely to "
            f"search Amazon for the same brand); defer Path B/C until brand-canary discipline "
            f"is fully in place (research/06 §Pillar 2)"
        )

    # Downgrade: FBM with warehouse capability (no FBA carrying cost).
    if FBM_DOWNGRADE_ENABLED and inputs.amazon_fulfillment_mode == "FBM":
        downgrades.append(
            f"amazon_fulfillment_mode={inputs.amazon_fulfillment_mode} avoids Amazon's "
            f"FBA pick-pack + storage + aged-inventory-surcharge; the canonical marketplace-ROI "
            f"comes from FBA-driven conversion lift (Prime badge + Buy-Box), not from the "
            f"cost savings (research/06 §Pillar 3)"
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
    elif not (deferred_for_capacity or deferred_for_registry or deferred_for_trademark):
        justification_parts.append("All gates pass; no upgrade/downgrade applied.")

    # Cost stack + lift + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    inc_pct_low, inc_pct_high = PATH_INCREMENTAL_REVENUE_PCT[path]
    can_low, can_high = PATH_DTC_CANNIBALIZATION_RATE[path]
    roi_low, roi_high = PATH_ROI[path]

    # Compute dollar bands.
    inc_rev_low = inputs.us_gmv * (inc_pct_low / 100.0)
    inc_rev_high = inputs.us_gmv * (inc_pct_high / 100.0)
    adjusted_net_low = inc_rev_low * (1.0 - can_high / 100.0)  # worst case: high cannibalization
    adjusted_net_high = inc_rev_high * (1.0 - can_low / 100.0)  # best case: low cannibalization

    # Marketplace revenue breakdown (USD).
    marketplace_revenue = {
        marketplace: pct / 100.0 * (inc_rev_low + inc_rev_high) / 2.0
        for marketplace, pct in MARKETPLACE_REVENUE_SHARES[path].items()
    }

    return PathRecommendation(
        path=path,
        marketplaces=PATH_MARKETPLACES[path],
        default_marketplace_pick=PATH_DEFAULT_MARKETPLACE_PICK[path],
        justification=" ".join(justification_parts),
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_cost_low=cost_low + 12 * rec_low,
        year1_cost_high=cost_high + 12 * rec_high,
        year1_incremental_revenue_pct_low=inc_pct_low,
        year1_incremental_revenue_pct_high=inc_pct_high,
        year1_incremental_revenue_low=inc_rev_low,
        year1_incremental_revenue_high=inc_rev_high,
        year1_dtc_cannibalization_rate_low=can_low,
        year1_dtc_cannibalization_rate_high=can_high,
        year1_adjusted_net_revenue_low=adjusted_net_low,
        year1_adjusted_net_revenue_high=adjusted_net_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        marketplace_revenue_breakdown=marketplace_revenue,
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

# The 6-step build recipe, parameterized by path. Mirrors playbook 13 §Phase 1+2+3+4.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (5 hr) — Pick path + Amazon scope: Path A = Amazon US 3P + Brand Registry + FBA. Verify ≥$500k US DTC GMV for 3 consecutive months + Move #1 + #4 + #6 + #8 shipped per research/06 §Prereq #1.",
        "Step 2 (4 hr) — USPTO trademark registration + Amazon Brand Registry enrollment: file USPTO trademark (~$750 + 8-12 weeks) → enroll in Amazon Brand Registry (free, requires LIVE trademark in TSDR) per playbook 13 §Phase 1 Step 1.1+1.2.",
        "Step 3 (4 hr) — Seller Central 1P-vs-3P decision + FBA inbound: choose 3P (default for $500k-$5M GMV per research/06 §Pillar 1) → create FBA shipment + SKU labeling (FNSKU barcodes) + inbound inventory ≥50 units hero SKU.",
        "Step 4 (8 hr) — Listing creation + A+ content + Brand Store + backend keywords: title (≤200 chars, ≤2.5% keyword density) + 5 bullets + description + A+ content modules + Brand Store + backend search terms per asset 15 §paste-ready per-marketplace per-voice templates.",
        "Step 5 (2 hr) — Sponsored Products + Sponsored Brands launch: $50/day Sponsored Products auto + $30/day Sponsored Brands + Amazon DSP branded-keyword defense $500-$2,000/mo per playbook 13 §Phase 1 Step 1.7+1.10.",
        "Step 6 (5 hr/wk ongoing) — Vine review acquisition + Buy-Box monitoring + Triple Whale Marketplace Sync: Vine $200/SKU → 50+ reviews in first 30 days → Buy-Box >90% → Triple Whale Marketplace Sync attribution per playbook 13 §Phase 1 Step 1.8+1.11.",
    ],
    "B": [
        "Step 1 (10 hr) — Pick path + dual-marketplace scope: Path B = Amazon US fully + Walmart US 3P. Verify ≥$1M US DTC GMV + Amazon Path A steady-state (60+ days) + Move #1 + #4 + #6 + #8 shipped per research/06 §Prereq #1.",
        "Step 2 (6 hr) — Amazon DSP branded-keyword defense + Walmart Brand Registry: Amazon DSP $1,500-$3,000/mo branded-keyword bidding → reduce brand-search-impression-share-loss → Walmart Brand Portal enrollment (free) per playbook 13 §Phase 2 Step 2.1+2.3.",
        "Step 3 (8 hr) — Walmart Seller Center setup + WFS inbound: apply at seller.walmart.com → WFS (Walmart Fulfillment Services) → create WFS shipment + SKU labeling + inbound inventory ≥50 units hero SKU per playbook 13 §Phase 2 Step 2.2.",
        "Step 4 (10 hr) — Walmart listing creation + Walmart Sponsored Products + Walmart Connect: per-asset-15 templates → Walmart Sponsored Products $30/day + Walmart Connect $15/day → Walmart Buy-Box ownership >85% per playbook 13 §Phase 2 Step 2.4+2.6.",
        "Step 5 (6 hr) — Triple Whale Walmart sync + cross-marketplace Buy-Box monitoring: Triple Whale Walmart integration → combine Amazon + Walmart Buy-Box + ROAS + reviews view → weekly Monday morning review cadence per playbook 13 §Phase 2 Step 2.7+2.10.",
        "Step 6 (10 hr/wk ongoing) — Dual-marketplace PPC + dual-marketplace SEO + cross-marketplace inventory-routing: combined-Amazon+Walmart ACoS <30% monitoring → cross-marketplace-inventory-turn >6x/yr → dedicated marketplace-manager-or-founder-operator per playbook 13 §Phase 2 Step 2.9+2.10.",
    ],
    "C": [
        "Step 1 (20 hr) — Pick path + multi-marketplace architecture: Path C = Path B fully + Amazon EU (DE + FR + IT + ES + NL) + bol + Zalando + Cdiscount + Amazon JP + Target Plus + Walmart International (CA + MX). Verify ≥$10M US DTC GMV + Path B steady-state + dedicated marketplace manager per research/06 §Prereq #1.",
        "Step 2 (30 hr) — EU compliance stack + Pan-European FBA: VAT-MOSS registration ($2k-$5k one-time) + CE marking + EPR registration + GPSR Responsible-Person service ($10k-$30k one-time + $2k-$10k/yr) + Pan-European FBA enrollment + inventory distribution across EU fulfillment centers per playbook 13 §Phase 3 Step 3.1+3.2.",
        "Step 3 (40 hr) — Per-marketplace seller-account setup + per-marketplace listings: Amazon EU 5-marketplaces (DE + FR + IT + ES + NL) + bol seller account + Zalando Partner Program + Cdiscount Pro subscription + Amazon JP seller + Target Plus Roundel application + Walmart International (CA + MX) per playbook 13 §Phase 3 Step 3.3.",
        "Step 4 (24 hr) — Per-marketplace language localization + per-marketplace returns-infrastructure: per-marketplace-translated title + bullets + description + A+ content per language (DE + FR + IT + ES + NL + JP) + per-marketplace returns-infrastructure + per-marketplace PPC launch per playbook 13 §Phase 3 Step 3.4.",
        "Step 5 (16 hr) — Target Plus wholesale-discount setup + Walmart International cross-border fulfillment: Target Plus wholesale discount (typically 8-15% off retail) + Walmart International cross-border + cross-marketplace inventory-routing algorithm per playbook 13 §Phase 4 Step 4.1+4.2.",
        "Step 6 (25 hr/wk ongoing + dedicated marketplace manager) — Per-marketplace ACoS + per-marketplace CAC payback + blended LTV:CAC across all channels: per-marketplace ACoS monitoring + per-marketplace CAC payback <12 months + blended-LTV:CAC >3:1 across Shopify + Amazon + Walmart + EU marketplaces + JP per playbook 13 §Phase 4 Step 4.3+4.4.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandChannelInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental + cannibalization-adjusted revenue for the recommended path.

    Uses the midpoint of the path's incremental-revenue % band and the
    operator's US DTC GMV to derive per-line revenue. Returns a dict suitable
    for JSON output.
    """
    inc_pct_mid = (rec.year1_incremental_revenue_pct_low + rec.year1_incremental_revenue_pct_high) / 2.0
    can_mid = (rec.year1_dtc_cannibalization_rate_low + rec.year1_dtc_cannibalization_rate_high) / 2.0

    year1_incremental_revenue_mid = inputs.us_gmv * (inc_pct_mid / 100.0)
    year1_cannibalization_loss_mid = year1_incremental_revenue_mid * (can_mid / 100.0)
    year1_adjusted_net_mid = year1_incremental_revenue_mid - year1_cannibalization_loss_mid

    # Marketplace revenue split (mid estimate).
    marketplace_revenue_mid: dict[str, float] = {
        marketplace: pct / 100.0 * year1_incremental_revenue_mid
        for marketplace, pct in MARKETPLACE_REVENUE_SHARES[rec.path].items()
    }

    # ROI midpoint: ratio of gross incremental revenue (NOT cannibalization-adjusted) over
    # year1_cost. The canonical PATH_ROI band in research/06 documents gross-revenue/cost
    # (research/06 §Cost & ROI estimate quotes "12:1 default Path B" before DTC cannibalization
    # adjustment). Cannibalization is reported separately so the operator can see the
    # adjusted-net figure.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    roi_mid = year1_incremental_revenue_mid / year1_cost_mid if year1_cost_mid > 0 else 0.0

    return {
        "us_gmv": inputs.us_gmv,
        "year1_incremental_revenue_pct_mid": inc_pct_mid,
        "year1_incremental_revenue_low": rec.year1_incremental_revenue_low,
        "year1_incremental_revenue_mid": year1_incremental_revenue_mid,
        "year1_incremental_revenue_high": rec.year1_incremental_revenue_high,
        "year1_cannibalization_rate_mid": can_mid,
        "year1_cannibalization_loss_mid": year1_cannibalization_loss_mid,
        "year1_adjusted_net_revenue_low": rec.year1_adjusted_net_revenue_low,
        "year1_adjusted_net_revenue_mid": year1_adjusted_net_mid,
        "year1_adjusted_net_revenue_high": rec.year1_adjusted_net_revenue_high,
        "year1_cost_low": rec.year1_cost_low,
        "year1_cost_mid": year1_cost_mid,
        "year1_cost_high": rec.year1_cost_high,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
        "marketplace_revenue_mid": marketplace_revenue_mid,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/06 Path B default."""
    parser = argparse.ArgumentParser(
        prog="marketplace_unit_economics.py",
        description=(
            "Score a brand's current-channel-mix inputs against the research/06 + playbook 13 + "
            "asset 15 Path A / B / C matrix. Returns the recommended path + marketplace pick + "
            "cost stack + Year-1 incremental revenue (after DTC-cannibalization adjustment) + "
            "per-marketplace revenue breakdown + 6-step build sequence for the marketplace expansion."
        ),
        epilog=(
            "Defaults: $5M US DTC brand, $75 AOV, 40% contribution margin, default category, "
            "FBA fulfillment, approved Brand Registry (the canonical Path B default for $1M-$10M "
            "GMV brands per research/06 §GMV-tier paths). Companion to /research/06, "
            "/playbooks/13, /assets/15-marketplace-listing-card.md."
        ),
    )
    parser.add_argument("--us-gmv", type=float, default=5_000_000.0,
                        help="Current US DTC GMV in USD (default: 5,000,000 = Path B default).")
    parser.add_argument("--aov", type=float, default=75.0,
                        help="Current average order value in USD (default: 75).")
    parser.add_argument("--contribution-margin-pct", type=float, default=40.0,
                        help="Current DTC contribution margin %% (0-100, default: 40).")
    parser.add_argument("--category", type=str, default="default",
                        choices=["default", "consumables", "luxury", "sustainable",
                                 "gen_z", "b2b", "fragile", "subscription"],
                        help="Product category (default: default).")
    parser.add_argument("--amazon-fulfillment-mode", type=str, default="FBA",
                        choices=["FBA", "FBM", "SFP", "hybrid"],
                        help="Amazon fulfillment mode (default: FBA).")
    parser.add_argument("--brand-registry-status", type=str, default="approved",
                        choices=["pending", "submitted", "approved", "rejected", "not_applicable"],
                        help="Amazon Brand Registry status (default: approved).")
    parser.add_argument("--has-uspto-trademark", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether operator has a registered USPTO trademark (default: true).")
    parser.add_argument("--operator-capacity-hours-per-week", type=int, default=10,
                        help="Operator hours per week for marketplace expansion (default: 10; floor is 5).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandChannelInputs:
    """Convert argparse Namespace → BrandChannelInputs (with the validation in __post_init__)."""
    return BrandChannelInputs(
        us_gmv=args.us_gmv,
        aov=args.aov,
        contribution_margin_pct=args.contribution_margin_pct,
        category=args.category,
        amazon_fulfillment_mode=args.amazon_fulfillment_mode,
        brand_registry_status=args.brand_registry_status,
        has_uspto_trademark=(args.has_uspto_trademark.lower() == "true"),
        operator_capacity_hours_per_week=args.operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandChannelInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Marketplace-expansion Path A/B/C recommendation")
    lines.append("=" * 47)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                            : ${inputs.us_gmv:>15,.0f}")
    lines.append(f"  AOV                                   : ${inputs.aov:>15,.2f}")
    lines.append(f"  Contribution margin                    : {inputs.contribution_margin_pct:>14.1f}%")
    lines.append(f"  Category                              : {inputs.category}")
    lines.append(f"  Amazon fulfillment mode               : {inputs.amazon_fulfillment_mode}")
    lines.append(f"  Brand Registry status                 : {inputs.brand_registry_status}")
    lines.append(f"  Has USPTO trademark                   : {inputs.has_uspto_trademark}")
    lines.append(f"  Operator capacity (hr/wk)             : {inputs.operator_capacity_hours_per_week:>15d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Marketplaces                          : {len(rec.marketplaces)} marketplace(s) in scope")
    for m in rec.marketplaces:
        lines.append(f"    - {m}")
    lines.append(f"  Default marketplace pick              : {rec.default_marketplace_pick}")
    lines.append(f"  Justification                         : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)             : ${rec.cost_one_time_low:>12,.0f} – ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)          : ${rec.cost_recurring_low:>12,.0f} – ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                : ${rec.year1_cost_low:>12,.0f} – ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Incremental revenue % (low-high)      : {rec.year1_incremental_revenue_pct_low:.0f}% – {rec.year1_incremental_revenue_pct_high:.0f}%")
    lines.append(f"  Incremental revenue $ (low-high)      : ${rec.year1_incremental_revenue_low:>12,.0f} – ${rec.year1_incremental_revenue_high:,.0f}")
    lines.append(f"  DTC cannibalization rate (low-high)   : {rec.year1_dtc_cannibalization_rate_low:.0f}% – {rec.year1_dtc_cannibalization_rate_high:.0f}%")
    lines.append(f"  Adjusted net revenue $ (low-high)     : ${rec.year1_adjusted_net_revenue_low:>12,.0f} – ${rec.year1_adjusted_net_revenue_high:,.0f}")
    lines.append(f"  Year-1 ROI                            : {rec.year1_roi_low:.0f}:1 – {rec.year1_roi_high:.0f}:1")
    lines.append("")
    lines.append("Marketplace revenue breakdown (mid estimate):")
    for marketplace, revenue in rec.marketplace_revenue_breakdown.items():
        lines.append(f"  {marketplace:<35} : ${revenue:>12,.0f}")
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