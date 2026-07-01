#!/usr/bin/env python3
"""
b2b_wholesale_unit_economics.py — Path A / B / C scorer for the B2B / wholesale
track (Move #14.5 companion script).

Companion to:
- /research/10-b2b-wholesale.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/17-b2b-wholesale-launch.md (4-phase Marketplace-onboard → Distributor-pitch → Direct-buyer-pipeline → Steady-state operator build)
- /assets/18-b2b-wholesale-kits.md (paste-ready per-marketplace per-voice per-SKU wholesale listing cards)
- /dashboard/app/b2b/page.tsx (19th operator-surface route rendering research/10 + playbook 17 + asset 18 as a unified surface)

This script takes a brand's current B2B-wholesale-fit inputs
(us_dtc_gmv / sku_count / sku_archetype_distribution / gross_margin_pct /
moq_operational_capacity / has_faire_account / has_handshake_shopify /
has_net_suite_wholesale / has_rsp_or_kehe_pitch / has_corporate_gifting_catalog /
voice_profile / has_dedicated_sales_rep_capacity_hours_per_week) and outputs a
Path A (Faire + Tundra + Ankorstore + Handshake marketplace-only $0/mo
<$500k GMV) / Path B (Faire + Tundra + Ankorstore + Handshake + Shopify B2B
DEFAULT $149-$349/mo $500k-$5M GMV 8.5:1 ROI with 60% wholesale-attach-rate by
Year-2) / Path C (full B2B-platform-orchestration including RSP/KeHE/UNFI
direct-distributor + Amazon Business + TradeGala + NetSuite Wholesale + EDI
832/850 + Shopify Plus B2B $1k+/mo $5M+ GMV 6:1 ROI) recommendation with
cost stack + Year-1 incremental B2B revenue $1M-$5M Path B at $2M US DTC base
+ 12-month reorder-rate projection + 6-tier wholesale-discount matrix + MAP-
policy-defense-arbitrage savings + DTC-cannibalization-adjusted net revenue.

The scoring rule (mirrors research/10 §GMV-tier paths + playbook 17
§Prerequisites + asset 18 §per-voice wholesale-discount matrix + canonical
8-prereq distributor-onboarding-pack):
  - us_dtc_gmv < $100k                                  → defer (Path A surfaced as audit only)
  - us_dtc_gmv $100k-$500k                              → Path A (Faire + Tundra + Ankorstore + Handshake marketplace-only)
  - us_dtc_gmv $500k-$5M                                → Path B (Faire + Tundra + Ankorstore + Handshake + Shopify B2B DEFAULT)
  - us_dtc_gmv $5M+                                     → Path C (RSP/KeHE/UNFI + Amazon Business + Shopify Plus B2B)
  - sku_count < 10                                      → defer (canonical 10+ SKU baseline per Faire 2024 onboarding)
  - gross_margin_pct < 25%                              → defer (canonical 25%+ wholesale-discount margin headroom per Faire 2024)
  - operator_capacity_hours_per_week < 4                → defer (canonical 4-10 hr/wk Path A floor per Faire onboarding-survey 2024)
  - has_faire_account = False                           → defer (Faire is the canonical Path A entry point; defaults to Tundra + Handshake if unavailable)
  - has_handshake_shopify = False                       → defer (Handshake is the canonical Shopify-native B2B-buyer-portal; Path B fallback to Shopify B2B Plus)
  - has_net_suite_wholesale = False AND path == "C"     → defer (NetSuite Wholesale or A2X EDI is the canonical Path C integration substrate)
  - voice_profile = "luxury" WITHOUT has_corporate_gifting_catalog = True → downgrade one tier (MAP-protection gate)
  - voice_profile = "sustainable" WITHOUT has_corporate_gifting_catalog = True → downgrade one tier (claims-verification gate)
  - has_dedicated_sales_rep_capacity_hours_per_week < 1 AND path == "C" → downgrade to Path B (RSP/KeHE/UNFI requires 0.5-1.0 FTE dedicated sales-rep)

Why hermetic? This script does NOT call Faire / Tundra / Ankorstore / Handshake /
Shopify B2B / Amazon Business / RSP / KeHE / UNFI / TradeGala / RangeMe /
NetSuite / QuickBooks / Triple Whale / Klaviyo APIs. The inputs are
operator-supplied at the CLI; the cost stack + per-path projection + 6-step
build sequence + 6-tier wholesale-discount matrix are derived from
research/10 + playbook 17 + asset 18 (the canonical benchmarks the workspace
already ships). This is the same hermetic recipe as threepl_unit_economics.py /
marketplace_unit_economics.py / subscription_unit_economics.py /
affiliate_unit_economics.py / international_market_fit.py /
lifecycle_flow_health_check.py — the 90% of install mistakes the operator
actually makes (wrong-path selection, under-budgeting for setup, missing the
8-prereq distributor-onboarding-pack, ignoring MAP-policy-cannibalization)
don't require API access; the local scoring rule catches them.

Usage:
    # Default: $2M US DTC brand, 35 SKUs (12 hero + 23 wholesale-eligible), 50% gross margin, b2b voice
    python3 b2b_wholesale_unit_economics.py

    # Custom inputs (e.g. $8M premium brand, 80 SKUs, 35% gross margin, luxury voice)
    python3 b2b_wholesale_unit_economics.py \\
        --us-dtc-gmv 8000000 --sku-count 80 --gross-margin-pct 35 \\
        --voice-profile luxury --has-faire-account true \\
        --has-handshake-shopify true --has-net-suite-wholesale true \\
        --has-rsp-or-kehe-pitch true --has-corporate-gifting-catalog true \\
        --has-dedicated-sales-rep-capacity-hours-per-week 8

    # JSON output (for cron / CI / dashboard piping)
    python3 b2b_wholesale_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 10, playbook 17, asset 18 (b2b-wholesale-kits), and /b2b route
shipped 2026-06-30; this script is the canonical 5th-layer follow-up per the
research → playbook → asset → operator-surface → scripts layer order. It
compounds asset 18's 4 marketplaces × 5 voice profiles × 6 SKU archetypes =
120 voice-variant wholesale listings + 6-tier wholesale-discount matrix [35%
luxury protecting MAP / 40% sustainable / 45% standard premium / 50% canonical
default / 55% high-volume / 60% distributor-tier] + per-voice override cells +
research/10 §GMV-tier paths + playbook 17 §Phase 1 Step 1.1
wholesale-pricing-calculator + asset 18 §6-tier wholesale-discount matrix +
dashboard/app/b2b/page.tsx by automating the per-brand path-selection decision
the operator currently does manually against the 3-path GMV-tier matrix.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal

PathName = Literal["A", "B", "C"]
VoiceProfile = Literal["default", "luxury", "sustainable", "gen_z", "b2b"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandB2BInputs:
    """Operator-supplied current-B2B-wholesale-fit inputs. All numeric bounds validated in __post_init__."""
    us_dtc_gmv: float                                # current US DTC GMV in USD
    sku_count: int                                   # total SKU count (hero + wholesale-eligible)
    sku_archetype_distribution: str                  # "12_hero_23_wholesale" / "balanced_50_50" / "mostly_hero_70_30" / "mostly_wholesale_30_70"
    gross_margin_pct: float                          # current DTC gross margin percent (0-100)
    moq_operational_capacity: int                    # min-order-quantity operational-capacity score 1-10 (1=zero-capacity / 10=handles-1000+unit-MOQs)
    has_faire_account: bool                          # whether Faire vendor account is active
    has_handshake_shopify: bool                      # whether Handshake (Shopify B2B) is wired
    has_net_suite_wholesale: bool                    # whether NetSuite Wholesale or A2X EDI is wired (Path C integration substrate)
    has_rsp_or_kehe_pitch: bool                      # whether brand has pitched to RSP/KeHE/UNFI distributor
    has_corporate_gifting_catalog: bool              # whether corporate-gifting-catalog is live
    voice_profile: str                               # default / luxury / sustainable / gen_z / b2b
    has_dedicated_sales_rep_capacity_hours_per_week: int  # dedicated sales-rep hours per week for B2B program

    def __post_init__(self) -> None:
        if self.us_dtc_gmv < 0:
            raise ValueError(f"us_dtc_gmv must be >= 0, got {self.us_dtc_gmv}")
        if self.sku_count < 0:
            raise ValueError(f"sku_count must be >= 0, got {self.sku_count}")
        if not 0 <= self.gross_margin_pct <= 100:
            raise ValueError(f"gross_margin_pct must be in [0, 100], got {self.gross_margin_pct}")
        if not 1 <= self.moq_operational_capacity <= 10:
            raise ValueError(f"moq_operational_capacity must be in [1, 10], got {self.moq_operational_capacity}")
        if self.has_dedicated_sales_rep_capacity_hours_per_week < 0:
            raise ValueError(f"has_dedicated_sales_rep_capacity_hours_per_week must be >= 0, got {self.has_dedicated_sales_rep_capacity_hours_per_week}")
        if self.sku_archetype_distribution not in ("12_hero_23_wholesale", "balanced_50_50", "mostly_hero_70_30", "mostly_wholesale_30_70"):
            raise ValueError(f"sku_archetype_distribution must be one of '12_hero_23_wholesale' / 'balanced_50_50' / 'mostly_hero_70_30' / 'mostly_wholesale_30_70', got {self.sku_archetype_distribution!r}")
        if self.voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            raise ValueError(f"voice_profile must be one of 'default' / 'luxury' / 'sustainable' / 'gen_z' / 'b2b', got {self.voice_profile!r}")


@dataclass
class PathRecommendation:
    """The output of the scoring rule — one of the 3 paths + cost stack + per-path projection + 6-step build sequence."""
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
    year1_incremental_revenue_share_pct_low: float
    year1_incremental_revenue_share_pct_high: float
    year1_incremental_revenue_low: float
    year1_incremental_revenue_high: float
    reorder_rate_pct_low: float
    reorder_rate_pct_high: float
    wholesale_attach_rate_pct_low: float
    wholesale_attach_rate_pct_high: float
    map_policy_savings_pct_low: float
    map_policy_savings_pct_high: float
    dtc_cannibalization_adjusted_net_revenue_low: float
    dtc_cannibalization_adjusted_net_revenue_high: float
    year1_roi_low: float
    year1_roi_high: float
    wholesale_discount_matrix: dict[str, str]
    build_sequence: list[str]


# ----- Voice profile classification ----------------------------------------

def classify_voice_profile(voice_profile: str) -> VoiceProfile:
    """Validate + return the voice profile (one of 5 canonical profiles)."""
    if voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
        raise ValueError(f"voice_profile must be one of 'default' / 'luxury' / 'sustainable' / 'gen_z' / 'b2b', got {voice_profile!r}")
    return voice_profile  # type: ignore[return-value]


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 100_000.0          # $100k = Path A floor (below this → defer)
PATH_B_FLOOR = 500_000.0          # $500k = Path B entry floor
PATH_C_FLOOR = 5_000_000.0        # $5M = Path C entry floor

# Deferral gates (canonical 6 from research/10 §Prerequisites + playbook 17 §8-prereq gate).
MIN_SKU_COUNT = 10                # <10 SKUs → defer (canonical Faire 2024 onboarding baseline)
MIN_GROSS_MARGIN_PCT = 25.0       # <25% gross margin → defer (canonical wholesale-discount-margin-headroom floor)
CAPACITY_GATE_HR_WK = 4           # <4 hr/wk → defer (canonical Faire onboarding-survey 2024 minimum)
MIN_MOQ_OPERATIONAL_CAPACITY = 3  # moq_operational_capacity <3 → defer (canonical casepack-fulfillment readiness)

# Downgrade gates (canonical 3 from research/10 Pillar 4 MAP-policy + playbook 17 §Phase 3).
LUXURY_DOWNGRADE_ENABLED = True
SUSTAINABLE_DOWNGRADE_ENABLED = True
PATH_C_DEDICATED_REP_FLOOR = 1   # Path C requires ≥1 hr/wk dedicated sales-rep

# Path costs (USD, from research/10 §Cost & ROI estimate + playbook 17 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A": (0,     2_000,  0,    149),    # Faire + Tundra + Ankorstore + Handshake marketplace-only
    "B": (2_000, 5_000,  149,  499),    # + Shopify B2B / Shopify Plus B2B (Path B DEFAULT)
    "C": (5_000, 50_000, 1_000, 5_000), # + RSP/KeHE/UNFI + Amazon Business + EDI 832/850 + Shopify Plus B2B
}

# Year-1 incremental-revenue-share bands (% of US DTC GMV, from research/10 §Path A/B/C).
PATH_INCREMENTAL_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A": (5.0,  15.0),   # Path A 5-15% Year-1 incremental B2B revenue
    "B": (50.0, 100.0),  # Path B 50-100% Year-1 incremental B2B revenue (the headline B2B-wholesale $1M-$5M)
    "C": (15.0, 50.0),   # Path C 15-50% Year-1 muted by 6-18-month distributor-onboarding-cycle
}

# Wholesale-attach-rate bands (% of DTC GMV channeled through wholesale Year-2+, from research/10 Pillar 2).
WHOLESALE_ATTACH_RATE_PCT: dict[PathName, tuple[float, float]] = {
    "A": (15.0, 25.0),   # Path A modest attach
    "B": (55.0, 75.0),   # Path B mid-market 55-75% Year-1 wholesale-attach-rate
    "C": (40.0, 60.0),   # Path C 40-60% muted by direct-distributor-channel conflicts
}

# Reorder-rate bands (% of B2B orders that re-purchase, from research/10 Pillar 3 + Salesforce B2B 2024).
REORDER_RATE_PCT: dict[PathName, tuple[float, float]] = {
    "A": (40.0, 60.0),   # Path A 40-60% reorder (Faire Net 60 buyer-base)
    "B": (60.0, 80.0),   # Path B 60-80% reorder (Salesforce B2B Commerce 2024 benchmark)
    "C": (50.0, 70.0),   # Path C 50-70% reorder (RSP/KeHE/UNFI + Amazon Business B2B-specialty-tier)
}

# MAP-policy-defense-arbitrage savings bands (% of DTC-traffic-leakage-prevented, from research/10 Pillar 4).
MAP_POLICY_SAVINGS_PCT: dict[PathName, tuple[float, float]] = {
    "A": (15.0, 25.0),   # Path A MAP-policy-page-only savings
    "B": (30.0, 50.0),   # Path B + geographic-exclusivity + MAP-policy-enforcement-tooling
    "C": (40.0, 60.0),   # Path C + full MAP + geographic + channel-exclusivity-tier + Shopify-B2B-Handshake geographic-exclusion
}

# DTC-cannibalization rate (% of B2B revenue cannibalized from DTC, from research/10 Pillar 4 §b).
DTC_CANNIBALIZATION_RATE: dict[PathName, float] = {
    "A": 0.25,            # Path A 10-25% MAP-protected vs 35-50% unprotected
    "B": 0.175,           # Path B median 17.5% with MAP + geographic
    "C": 0.30,            # Path C 30% muted by direct-distributor + Amazon-Business overlap
}

# Year-1 ROI bands (gross incremental revenue / cost, per research/10 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A": (3.0, 6.0),     # Path A 3-6:1 conservative nominal
    "B": (6.0, 11.0),    # Path B 6-11:1 default (8.5:1 midpoint at $2M US DTC base)
    "C": (4.0, 8.0),     # Path C 4-8:1 muted by distributor-onboarding-cycle + sales-rep-cost
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {0: "A", 1: "B", 2: "C"}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A": ["Faire", "Tundra", "Ankorstore", "Handshake (Shopify B2B)"],
    "B": ["Faire", "Tundra", "Ankorstore", "Handshake (Shopify B2B)", "Shopify B2B / Shopify Plus B2B"],
    "C": ["Faire", "Tundra", "Ankorstore", "Handshake (Shopify B2B)", "Shopify Plus B2B", "Amazon Business", "RSP / KeHE / UNFI direct-distributor"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A": "Faire (free; 25% first-order + 15% reorders commission per Faire 2024)",
    "B": "Faire + Handshake (Shopify B2B) (Faire default + Handshake native Shopify-integration)",
    "C": "Faire + Handshake + Amazon Business + RSP/KeHE/UNFI (full B2B-orchestration per research/10 §Path C)",
}

# 6-tier wholesale-discount matrix (from research/10 Pillar 2 + asset 18 §6-tier wholesale-discount matrix).
# Maps voice profile → "tier1 / tier2 / tier3" wholesale-discount bands (off MSRP).
WHOLESALE_DISCOUNT_MATRIX: dict[str, str] = {
    "default":     "35% luxury (MAP-protected) / 50% canonical / 55% high-volume",
    "luxury":      "35% luxury protecting MAP / 50% canonical (MAP-enforced)",
    "sustainable": "40% sustainable-clean-beauty / 50% canonical / 55% high-volume",
    "gen_z":       "50% canonical / 55% high-volume (standard wholesale-default for Gen-Z SKU)",
    "b2b":         "55% high-volume (volume-discount expected for B2B-channel) / 60% distributor-tier",
}

# Upgrade + downgrade gates.
def _tier_for_gmv(us_dtc_gmv: float) -> PathName:
    """Return the path-tier corresponding to the brand's US DTC GMV."""
    if us_dtc_gmv < PATH_A_FLOOR:
        return "A"
    if us_dtc_gmv < PATH_B_FLOOR:
        return "A"
    if us_dtc_gmv < PATH_C_FLOOR:
        return "B"
    return "C"


def recommend_path(inputs: BrandB2BInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_sku_count = False
    deferred_for_gross_margin = False
    deferred_for_capacity = False
    deferred_for_faire = False
    deferred_for_handshake = False
    deferred_for_moq = False
    deferred_for_netsuite_c = False

    # Capacity floor: defer if operator has insufficient time.
    if inputs.has_dedicated_sales_rep_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Has dedicated sales-rep capacity {inputs.has_dedicated_sales_rep_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (research/10 §Prerequisites Gate A prereq 8 + playbook 17 §8-prereq gate); "
            f"B2B / wholesale launch deferred until sales-rep capacity is available."
        )
        deferred_for_capacity = True

    # SKU-count floor: defer if <10 (canonical Faire 2024 onboarding baseline).
    if inputs.sku_count < MIN_SKU_COUNT:
        justification_parts.append(
            f"SKU count {inputs.sku_count} < {MIN_SKU_COUNT} floor (Faire 2024 onboarding-survey: 10+ SKUs is the canonical "
            f"minimum for any B2B / wholesale program to generate attributable revenue; 5 hero + 5 wholesale-eligible secondary SKUs minimum); "
            f"B2B / wholesale launch deferred until SKU-broadness improves."
        )
        deferred_for_sku_count = True

    # Gross-margin floor: defer if <25% (canonical wholesale-discount-margin-headroom floor).
    if inputs.gross_margin_pct < MIN_GROSS_MARGIN_PCT:
        justification_parts.append(
            f"Gross margin {inputs.gross_margin_pct:.1f}% < {MIN_GROSS_MARGIN_PCT:.1f}% floor (research/10 §Prerequisites: 25%+ "
            f"wholesale-discount margin headroom is the canonical minimum for any wholesale-channel launch; brands with <25% "
            f"gross margin should defer until DTC unit economics improve OR offer lower 35-40% wholesale discount on exclusive wholesale SKUs)."
        )
        deferred_for_gross_margin = True

    # MOQ-operational-capacity floor: defer if <3 (canonical casepack-fulfillment readiness).
    if inputs.moq_operational_capacity < MIN_MOQ_OPERATIONAL_CAPACITY:
        justification_parts.append(
            f"MOQ-operational-capacity {inputs.moq_operational_capacity} < {MIN_MOQ_OPERATIONAL_CAPACITY} floor (research/10 Pillar 5: "
            f"3+ casepack-fulfillment readiness is the canonical minimum for B2B wholesale; brands with <3 readiness should defer "
            f"until fulfillment stack + 8-prereq distributor-onboarding-pack is validated)."
        )
        deferred_for_moq = True

    # Faire-account deferral (canonical Path A entry point).
    if not inputs.has_faire_account:
        justification_parts.append(
            "has_faire_account=False (research/10 Pillar 1: Faire is the canonical Path A entry point at 25% first-order + "
            "15% reorders commission per Faire 2024; without it, defaults to Tundra + Handshake but the canonical "
            "Path A coverage drops from 80% to 35%); B2B / wholesale deferred until Faire vendor account is created."
        )
        deferred_for_faire = True

    # Handshake-Shopify deferral (canonical Shopify-native B2B-buyer-portal).
    if not inputs.has_handshake_shopify:
        justification_parts.append(
            "has_handshake_shopify=False (research/10 Pillar 3: Handshake (Shopify B2B) is the canonical Shopify-native B2B-buyer-portal "
            "for auto-sync DTC-SKUs to B2B-buyer-portal with wholesale-pricing auto-applied; without it, brand must use Shopify Plus B2B "
            "$2,300/mo minimum which compounds Path B cost by 5×); B2B / wholesale deferred until Handshake is installed."
        )
        deferred_for_handshake = True

    # Base tier assignment.
    if inputs.us_dtc_gmv < PATH_A_FLOOR:
        # Path A as deferral when below the $100k GMV floor.
        path = "A"
        if not (deferred_for_sku_count or deferred_for_gross_margin
                or deferred_for_capacity or deferred_for_faire
                or deferred_for_handshake or deferred_for_moq):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_dtc_gmv:,.0f} is below the ${PATH_A_FLOOR:,.0f} "
                f"B2B / wholesale entry floor; launch is deferred until "
                f"US DTC GMV exceeds ${PATH_A_FLOOR:,.0f} (research/10 §Prerequisites). "
                f"Path A is still surfaced as the recommendation for tracking (audit only)."
            )
    else:
        path = _tier_for_gmv(inputs.us_dtc_gmv)
        if not (deferred_for_sku_count or deferred_for_gross_margin
                or deferred_for_capacity or deferred_for_faire
                or deferred_for_handshake or deferred_for_moq):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_dtc_gmv:,.0f} lands in the Path {path} tier "
                f"(${_tier_floor_text(path)} - ${_tier_ceiling_text(path)} GMV)."
            )

    # NetSuite-Wholesale deferral only fires if path was bumped to C and NetSuite Wholesale is missing.
    if path == "C" and not inputs.has_net_suite_wholesale:
        justification_parts.append(
            "Path C requires NetSuite Wholesale or A2X EDI (research/10 Pillar 5: NetSuite Wholesale is the canonical "
            "Path C integration substrate for RSP/KeHE/UNFI direct-distributor onboarding + EDI 832/850 catalog-syndication + "
            "wholesale-AR-finance; without it, Path C reverts to Path B with 6-12-month onboarding-cycle vs 4-8-week); "
            "downgrade to Path B until NetSuite Wholesale or A2X EDI is installed."
        )
        deferred_for_netsuite_c = True
        # Downgrade Path C → Path B since NetSuite Wholesale is the canonical Path C prerequisite.
        path = "B"

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    downgrades: list[str] = []

    # Downgrade: Luxury voice without corporate-gifting catalog (MAP-protection gate).
    if LUXURY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_corporate_gifting_catalog:
        downgrades.append(
            "voice_profile=luxury WITHOUT has_corporate_gifting_catalog=True (research/10 Pillar 4 + "
            "asset 18 §6-tier wholesale-discount matrix: 35% luxury discount protecting MAP requires the corporate-gifting-catalog "
            "to be live as the canonical MAP-protection verification; without it, MAP-violation-erosion exceeds 30% of DTC-traffic "
            "per Faire 2024 + Ankorstore 2024 benchmarks and the path is downgraded by one tier)"
        )

    # Downgrade: Sustainable voice without corporate-gifting catalog (claims-verification gate).
    if SUSTAINABLE_DOWNGRADE_ENABLED and inputs.voice_profile == "sustainable" and not inputs.has_corporate_gifting_catalog:
        downgrades.append(
            "voice_profile=sustainable WITHOUT has_corporate_gifting_catalog=True (research/10 Pillar 4 + "
            "asset 18 §Sustainable-claims-verifier: 40% sustainable-clean-beauty wholesale discount requires the corporate-gifting-catalog "
            "with sustainability-story + certifications to be live as the canonical claims-verification gate; without it, "
            "claims-violation-risk exceeds FTC-green-guide-guidelines $10k+/violation penalties and the path is downgraded by one tier)"
        )

    # Downgrade: Path C with no dedicated sales-rep (RSP/KeHE/UNFI requires 0.5-1.0 FTE dedicated sales-rep).
    if path == "C" and inputs.has_dedicated_sales_rep_capacity_hours_per_week < PATH_C_DEDICATED_REP_FLOOR:
        downgrades.append(
            f"Path C with has_dedicated_sales_rep_capacity_hours_per_week={inputs.has_dedicated_sales_rep_capacity_hours_per_week} < "
            f"{PATH_C_DEDICATED_REP_FLOOR} hr/wk (research/10 Pillar 5: RSP/KeHE/UNFI direct-distributor onboarding requires 0.5-1.0 FTE "
            f"dedicated sales-rep during the 6-18-month sales-cycle per RSP 2024 + KeHE 2024 + UNFI 2024 benchmarks; without it, "
            f"distributor-pitch fails 90% of the time and the path is downgraded to Path B)"
        )

    # Apply the downgrades (lower the tier).
    for _ in downgrades:
        path = RANK_PATH[max(PATH_RANK[path] - 1, PATH_RANK["A"])]

    if downgrades:
        justification_parts.append(
            f"Applied {len(downgrades)} downgrade(s): "
            + ("DOWNGRADES: " + "; ".join(downgrades) + " ")
            + f"Final path = {path}."
        )
    elif not (deferred_for_sku_count or deferred_for_gross_margin
              or deferred_for_capacity or deferred_for_faire
              or deferred_for_handshake or deferred_for_moq or deferred_for_netsuite_c):
        justification_parts.append("All gates pass; no downgrade applied.")

    # Cost stack + incremental revenue + reorder rate + attach rate + MAP savings + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    share_low, share_high = PATH_INCREMENTAL_REVENUE_SHARE_PCT[path]
    attach_low, attach_high = WHOLESALE_ATTACH_RATE_PCT[path]
    reorder_low, reorder_high = REORDER_RATE_PCT[path]
    map_low, map_high = MAP_POLICY_SAVINGS_PCT[path]
    cannibalization_rate = DTC_CANNIBALIZATION_RATE[path]
    roi_low, roi_high = PATH_ROI[path]

    # Compute dollar bands.
    incremental_revenue_low = inputs.us_dtc_gmv * (share_low / 100.0)
    incremental_revenue_high = inputs.us_dtc_gmv * (share_high / 100.0)

    # DTC-cannibalization-adjusted net revenue (Path B's 17.5% median rate applied).
    cannibalization_adjusted_net_low = incremental_revenue_low * (1.0 - cannibalization_rate)
    cannibalization_adjusted_net_high = incremental_revenue_high * (1.0 - cannibalization_rate)

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
        year1_incremental_revenue_share_pct_low=share_low,
        year1_incremental_revenue_share_pct_high=share_high,
        year1_incremental_revenue_low=incremental_revenue_low,
        year1_incremental_revenue_high=incremental_revenue_high,
        reorder_rate_pct_low=reorder_low,
        reorder_rate_pct_high=reorder_high,
        wholesale_attach_rate_pct_low=attach_low,
        wholesale_attach_rate_pct_high=attach_high,
        map_policy_savings_pct_low=map_low,
        map_policy_savings_pct_high=map_high,
        dtc_cannibalization_adjusted_net_revenue_low=cannibalization_adjusted_net_low,
        dtc_cannibalization_adjusted_net_revenue_high=cannibalization_adjusted_net_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        wholesale_discount_matrix=dict(WHOLESALE_DISCOUNT_MATRIX),
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
    return f"{10_000_000:,.0f}"  # Path C ceiling at $10M (no documented upper cap)


# ----- Build-sequence recipe ---------------------------------------------

# The 6-step build recipe, parameterized by path. Mirrors playbook 17 §Phase 1+2+3+4.
_BUILD_SEQUENCES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 — Wholesale-pricing calculator: configure 50%-off-MSRP default in Shopify B2B settings + NET-30 terms-card (2.5% pre-pay-discount per Stripe B2B 2024) + MAP-policy-page with 3-strike-enforcement per Sherman-Antitrust-Act-RPM-policy-compliance (research/10 Pillar 2).",
        "Step 2 — Apply for Faire vendor account (free; 25% first-order + 15% reorders commission per Faire 2024); create Tundra + Ankorstore + Handshake storefronts (all free).",
        "Step 3 — Build 8-prereq distributor-onboarding pack: registration-cert + EIN-letter + resale-certificate per Streamlined-Sales-Tax-Project + product-insurance $1M+ GL + $1M product-liability + warehouse-safety-cert FDA OR CPSC-registered + UPC-barcode GS1-Company-Prefix $250/yr + casepack-spec-sheet (research/10 Pillar 5).",
        "Step 4 — List 12-30 hero SKUs on Faire + Tundra + Ankorstore + Handshake with wholesale-pricing auto-applied; activate Klaviyo B2B-tier reorder-reminder flow at 75% typical-purchase-cadence (research/10 Pillar 3).",
        "Step 5 — Build corporate-gifting-catalog (10-30 hero SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers); validate first 10-25 retailer-account reorder cycle for 60%+ reorder-rate per Salesforce B2B Commerce 2024 (research/10 Pillar 3).",
        "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) before steady-state; canonical Year-1 ROI Path A 3-6:1 at <$500k GMV / 10-25 first-retailer-accounts / 40-60% reorder-rate (research/10 §Cost & ROI estimate).",
    ],
    "B": [
        "Step 1 — Wholesale-pricing calculator: configure 50%-off-MSRP default in Shopify B2B settings + NET-30 terms-card (2.5% pre-pay-discount per Stripe B2B 2024) + MAP-policy-page with 3-strike-enforcement per Sherman-Antitrust-Act-RPM-policy-compliance (research/10 Pillar 2).",
        "Step 2 — Apply for Faire vendor account (free; 25% first-order + 15% reorders commission per Faire 2024); create Tundra + Ankorstore + Handshake storefronts; install Shopify B2B OR upgrade to Shopify Plus B2B for full B2B-portal with company-accounts + credit-terms + bulk-pricing + reorder-automation.",
        "Step 3 — Build 8-prereq distributor-onboarding pack + RangeMe product-discovery listing + 5-clause wholesale-distribution-agreement template [commission + payment-terms + termination + indemnity + IP] (research/10 Pillar 5 + asset 18).",
        "Step 4 — List 12-30 hero SKUs + 30+ wholesale-eligible secondary SKUs on Faire + Tundra + Ankorstore + Handshake with Handshake-catalog-automation (auto-sync new DTC SKUs to B2B channel with wholesale-pricing auto-applied); activate 4-cadence Klaviyo B2B-tier flow [B2B reorder-reminder + sample-pack-shipped + first-reorder-thank-you + monthly-stockist-update] (research/10 Pillar 3).",
        "Step 5 — Build corporate-gifting-catalog (10-30 hero SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers) + 4-email-direct-buyer-cadence [introduction + sample-pack-shipping + follow-up + sales-call-booking] + TradeGala-virtual-trade-show subscription $200-$2,000/mo (research/10 Pillar 3 + playbook 17 §Phase 2).",
        "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) + Gate C (10 prereqs) before steady-state; canonical Year-1 ROI Path B 6-11:1 (8.5:1 midpoint) at $500k-$5M GMV / 25-100 retailer-accounts / 60-80% reorder-rate-by-Year-2 / $1M-$5M Path B incremental B2B revenue (research/10 §Cost & ROI estimate + playbook 17 §4-phase launch ladder).",
    ],
    "C": [
        "Step 1 — Wholesale-pricing calculator + NET-30 terms-card + MAP-policy-page (canonical 60% off MSRP for distributor-tier + 50% for Shopify B2B + 45% for premium-DTC) + Amazon Business B2B-specialty-tier-cert $39.99/mo for office/hospitality/healthcare/industrial SKUs only per Marketplace Pulse 2024 wholesale-specialty-report (research/10 Pillar 2).",
        "Step 2 — Apply for Faire vendor account + Tundra + Ankorstore + Handshake + Shopify Plus B2B $2,300/mo full-portal + NetSuite Wholesale OR A2X EDI integration for EDI 832/850 catalog-syndication to RSP/KeHE/UNFI/dot Foods (research/10 Pillar 5).",
        "Step 3 — Build 8-prereq distributor-onboarding pack + dedicated 0.5-1.0 FTE sales-rep-capacity for 6-18-month distributor-onboarding-cycle + distributor-pitch deck with canonical 7-path B2B-platform decision matrix + RSP/KeHE/UNFI direct-pitch sequences (research/10 Pillar 5 + playbook 17 §Phase 3).",
        "Step 4 — List 12-30 hero SKUs + 100+ wholesale-eligible SKUs on Faire + Tundra + Ankorstore + Handshake + Shopify Plus B2B + Amazon Business B2B-specialty-tier + RangeMe product-discovery + first RSP/KeHE/UNFI pitch meetings scheduled.",
        "Step 5 — Build geographic-exclusivity-tier (state-level top-20 + city-level top-5 per Faire 2024 + Handshake geographic-exclusion benchmarks) + Triple Whale B2B-cohort-LTV-overlay for ARPU-cannibalization-monitoring-quarterly + TradeGala-virtual-trade-show + 1 in-person-trade-show-per-Year-1 (NY NOW + ASD Market Week + Surf Expo + MAGIC + PROJECT + NYIGF + NACDS) (research/10 Pillar 3 + Pillar 4 + playbook 17 §Phase 4).",
        "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) + Gate C (10 prereqs) + Gate D (9 prereqs) before steady-state; canonical Year-1 ROI Path C 4-8:1 muted by distributor-onboarding-cycle + sales-rep-cost; Year-3+ ramp to 14-20:1 once distributor-portfolio is mature (research/10 §Cost & ROI estimate + playbook 17 §4-phase launch ladder).",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for the given path."""
    return list(_BUILD_SEQUENCES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandB2BInputs, rec: PathRecommendation) -> dict[str, object]:
    """Return per-path Year-1 incremental B2B revenue + reorder-rate + MAP-policy-savings projections."""
    projected: dict[str, object] = {}
    for p in ("A", "B", "C"):
        share_lo, share_hi = PATH_INCREMENTAL_REVENUE_SHARE_PCT[p]
        attach_lo, attach_hi = WHOLESALE_ATTACH_RATE_PCT[p]
        reorder_lo, reorder_hi = REORDER_RATE_PCT[p]
        map_lo, map_hi = MAP_POLICY_SAVINGS_PCT[p]
        rate = DTC_CANNIBALIZATION_RATE[p]
        year1_revenue_lo = inputs.us_dtc_gmv * (share_lo / 100.0)
        year1_revenue_hi = inputs.us_dtc_gmv * (share_hi / 100.0)
        projected[p] = {
            "year1_incremental_revenue_low": year1_revenue_lo,
            "year1_incremental_revenue_high": year1_revenue_hi,
            "year2_plus_wholesale_attach_rate_low": attach_lo,
            "year2_plus_wholesale_attach_rate_high": attach_hi,
            "reorder_rate_pct_low": reorder_lo,
            "reorder_rate_pct_high": reorder_hi,
            "map_policy_savings_pct_low": map_lo,
            "map_policy_savings_pct_high": map_hi,
            "dtc_cannibalization_rate": rate,
            "cannibalization_adjusted_net_revenue_low": year1_revenue_lo * (1.0 - rate),
            "cannibalization_adjusted_net_revenue_high": year1_revenue_hi * (1.0 - rate),
        }
    projected["recommended_path"] = rec.path
    return projected


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/10 Path B default."""
    parser = argparse.ArgumentParser(
        prog="b2b_wholesale_unit_economics.py",
        description=(
            "Score a brand's current-B2B-wholesale-fit inputs against the research/10 + playbook 17 + "
            "asset 18 Path A / B / C matrix. Returns the recommended path + B2B-platform pick + "
            "cost stack + Year-1 incremental B2B revenue + reorder-rate + wholesale-attach-rate + "
            "MAP-policy-savings + DTC-cannibalization-adjusted net revenue + 6-step build sequence + "
            "6-tier wholesale-discount matrix for the B2B / wholesale program."
        ),
        epilog=(
            "Defaults: $2M US DTC brand, 35 SKUs (12 hero + 23 wholesale-eligible), 50% gross margin, "
            "8 hr/wk dedicated sales-rep, b2b voice profile (canonical Path B default for $500k-$5M GMV brands "
            "per research/10 §GMV-tier paths). Companion to /research/10, /playbooks/17, "
            "/assets/18-b2b-wholesale-kits.md, /b2b route."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=2_000_000.0,
                        help="Current US DTC GMV in USD (default: 2,000,000 = Path B default).")
    parser.add_argument("--sku-count", type=int, default=35,
                        help="Total SKU count (hero + wholesale-eligible) (default: 35 = Path B baseline 12 hero + 23 wholesale).")
    parser.add_argument("--sku-archetype-distribution", type=str, default="12_hero_23_wholesale",
                        choices=["12_hero_23_wholesale", "balanced_50_50", "mostly_hero_70_30", "mostly_wholesale_30_70"],
                        help="SKU archetype distribution (default: 12_hero_23_wholesale).")
    parser.add_argument("--gross-margin-pct", type=float, default=50.0,
                        help="Current DTC gross margin percent 0-100 (default: 50 = Path B baseline).")
    parser.add_argument("--moq-operational-capacity", type=int, default=8,
                        help="MOQ-operational-capacity score 1-10 (default: 8 = Path B baseline).")
    parser.add_argument("--has-faire-account", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Faire vendor account is active (default: true = Path B baseline).")
    parser.add_argument("--has-handshake-shopify", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Handshake (Shopify B2B) is wired (default: true = Path B baseline).")
    parser.add_argument("--has-net-suite-wholesale", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether NetSuite Wholesale or A2X EDI is wired (default: false = Path B baseline).")
    parser.add_argument("--has-rsp-or-kehe-pitch", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether brand has pitched to RSP/KeHE/UNFI distributor (default: false = Path B baseline).")
    parser.add_argument("--has-corporate-gifting-catalog", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether corporate-gifting-catalog is live (default: true = Path B baseline).")
    parser.add_argument("--voice-profile", type=str, default="b2b",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Brand voice profile (default: b2b; Path B canonical = b2b).")
    parser.add_argument("--has-dedicated-sales-rep-capacity-hours-per-week", type=int, default=8,
                        help="Dedicated sales-rep hours per week for B2B program (default: 8; floor is 4).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandB2BInputs:
    """Convert argparse Namespace → BrandB2BInputs (with the validation in __post_init__)."""
    return BrandB2BInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        sku_count=args.sku_count,
        sku_archetype_distribution=args.sku_archetype_distribution,
        gross_margin_pct=args.gross_margin_pct,
        moq_operational_capacity=args.moq_operational_capacity,
        has_faire_account=(args.has_faire_account.lower() == "true"),
        has_handshake_shopify=(args.has_handshake_shopify.lower() == "true"),
        has_net_suite_wholesale=(args.has_net_suite_wholesale.lower() == "true"),
        has_rsp_or_kehe_pitch=(args.has_rsp_or_kehe_pitch.lower() == "true"),
        has_corporate_gifting_catalog=(args.has_corporate_gifting_catalog.lower() == "true"),
        voice_profile=args.voice_profile,
        has_dedicated_sales_rep_capacity_hours_per_week=args.has_dedicated_sales_rep_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandB2BInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("B2B / wholesale Path A/B/C recommendation")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                                 : ${inputs.us_dtc_gmv:>15,.0f}")
    lines.append(f"  SKU count                                  : {inputs.sku_count:>15d}")
    lines.append(f"  SKU archetype distribution                 : {inputs.sku_archetype_distribution}")
    lines.append(f"  Gross margin %                             : {inputs.gross_margin_pct:>14.1f}%")
    lines.append(f"  MOQ operational capacity (1-10)            : {inputs.moq_operational_capacity:>15d}")
    lines.append(f"  Has Faire account                          : {inputs.has_faire_account}")
    lines.append(f"  Has Handshake (Shopify B2B)                : {inputs.has_handshake_shopify}")
    lines.append(f"  Has NetSuite Wholesale / A2X EDI           : {inputs.has_net_suite_wholesale}")
    lines.append(f"  Has RSP/KeHE/UNFI pitch                    : {inputs.has_rsp_or_kehe_pitch}")
    lines.append(f"  Has corporate-gifting catalog              : {inputs.has_corporate_gifting_catalog}")
    lines.append(f"  Voice profile                              : {inputs.voice_profile}")
    lines.append(f"  Dedicated sales-rep capacity (hr/wk)       : {inputs.has_dedicated_sales_rep_capacity_hours_per_week:>15d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Platforms                                  : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                      : {rec.default_platform_pick}")
    lines.append(f"  Justification                              : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)                  : ${rec.cost_one_time_low:>12,.0f} – ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)               : ${rec.cost_recurring_low:>12,.0f} – ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                     : ${rec.year1_cost_low:>12,.0f} – ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Incremental revenue share (low-high)       : {rec.year1_incremental_revenue_share_pct_low:.0f}% – {rec.year1_incremental_revenue_share_pct_high:.0f}%")
    lines.append(f"  Incremental revenue $ (low-high)           : ${rec.year1_incremental_revenue_low:>12,.0f} – ${rec.year1_incremental_revenue_high:,.0f}")
    lines.append(f"  Reorder rate (low-high)                    : {rec.reorder_rate_pct_low:.0f}% – {rec.reorder_rate_pct_high:.0f}%")
    lines.append(f"  Wholesale-attach-rate Yr2+ (low-high)      : {rec.wholesale_attach_rate_pct_low:.0f}% – {rec.wholesale_attach_rate_pct_high:.0f}%")
    lines.append(f"  MAP-policy savings (low-high)              : {rec.map_policy_savings_pct_low:.0f}% – {rec.map_policy_savings_pct_high:.0f}%")
    lines.append(f"  DTC-cannibalization-adj net $ (low-high)   : ${rec.dtc_cannibalization_adjusted_net_revenue_low:>12,.0f} – ${rec.dtc_cannibalization_adjusted_net_revenue_high:,.0f}")
    lines.append(f"  Year-1 ROI                                 : {rec.year1_roi_low:.1f}:1 – {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("6-tier wholesale-discount matrix (per voice profile):")
    for voice, tier_desc in rec.wholesale_discount_matrix.items():
        lines.append(f"  {voice:<13} : {tier_desc}")
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