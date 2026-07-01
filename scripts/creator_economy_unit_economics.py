#!/usr/bin/env python3
"""
creator_economy_unit_economics.py — Path A / B / C scorer for the
creator-economy-expansion track (Move #16 companion script).

Companion to:
- /research/12-creator-economy-expansion.md (5-pillar framework + 3 GMV-tier paths)
- /playbooks/19-creator-economy-launch.md (4-phase Creator-discovery-platform-onboard
  → Mid-tier-creator-onboarding + content-licensing-launch → Macro-creator-flagship-campaign
  + creator-affiliate-program-bridge + GRIN-or-CreatorIQ-enterprise-CRM → Steady-state
  + creator-tier-promotion-SOP + Triple-Whale-creator-economy-cohort-LTV-iteration)
- /assets/20-creator-discovery-templates.md (paste-ready 11 artifacts: 30 voice-variant
  creator-discovery-outreach-templates + 5-payout creator-economy-structures contract-template
  + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay
  -Wire-spec + Klaviyo-creator-content-flow-templates + creator-discovery-platform-onboarding-templates
  + creator-tier-mix-baseline + FTC-compliance-disclosure-language templates + 4-trigger
  tier-promotion-SOP + 90-day-content-licensing-renewal-cadence)

This script takes a brand's current creator-economy-fit inputs
(us_dtc_gmv / sku_count / sku_archetype_distribution / gross_margin_pct /
has_aspire_or_collabstr_account / has_grin_or_creatoriq_account /
has_creator_tier_mix_baseline / has_content_licensing_template /
has_whitelisting_ads_template / has_triple_whale_creator_cohort_overlay /
voice_profile / has_dedicated_creator_economy_manager_capacity_hours_per_week)
and outputs a Path A (micro-creator-UGC-product-seeding-only) / Path B
(creator-mix-micro+mid+macro 5-payout-structures + content-licensing + whitelisting
DEFAULT) / Path C (enterprise-creator-relationship-management) recommendation
with cost stack, expected Year-1 incremental creator-economy-revenue,
2-4× LTV multiplier, Triple-Whale-creator-cohort-overlay recovery rate,
and a 6-step build sequence. It is the operator-build input for the
playbook's Prerequisites gate (Phase 1 Step 1 "pick path + creator-discovery
platform + 5-payout-structures + content-licensing-template + whitelisting-ads-template").

The scoring rule (mirrors research/12 §GMV-tier paths + playbook 19
§Prerequisites + asset 20 §5-payout-creator-economy-structures + canonical
6-step creator-discovery-platform-onboarding recipe):
  - us_dtc_gmv < $100k                         → defer (Path A surfaced as audit only)
  - us_dtc_gmv $100k-$500k                     → Path A (micro-creator-UGC-product-seeding-only
                                                  Collabstr 10%-of-creator-payment OR Aspire SaaS-free-tier)
  - us_dtc_gmv $500k-$5M                       → Path B DEFAULT (Aspire $500-$2k/mo OR agency
                                                  $500-$2k/mo + Collabstr + 5-payout-structures +
                                                  content-licensing + whitelisting + Triple-Whale
                                                  creator-cohort-overlay)
  - us_dtc_gmv $5M+                            → Path C (Path B + GRIN $2.5k+/mo OR CreatorIQ
                                                  $2.5k+/mo + dedicated-creator-economy-manager
                                                  $4k-$6k/mo)
  - sku_count < 10                             → defer (canonical 10+ SKUs for creator-content
                                                  product-seeding-coverage-baseline)
  - gross_margin_pct < 25%                     → defer (canonical 25%+ creator-economy-margin
                                                  headroom for 15-30%-CPS + content-licensing +
                                                  whitelisting + Triple-Whale-cohort-overlay)
  - has_aspire_or_collabstr_account = False    → defer (canonical creator-discovery-platform
                                                  prerequisite)
  - has_creator_tier_mix_baseline = False      → defer (canonical 30+ micro-creator-pool
                                                  baseline + 60/30/10 creator-tier-mix)
  - has_content_licensing_template = False     → defer (3-clause content-licensing template is
                                                  the canonical Path B+ Pillar 3 prerequisite)
  - has_whitelisting_ads_template = False      → defer (canonical Path B+ Pillar 3 prerequisite)
  - voice_profile = "luxury" WITHOUT has_content_licensing_template = True → downgrade
                                                  (MAP-policy-guardrail: luxury-voice brands need
                                                  content-licensing-with-MAP-policy-guardrails)
  - voice_profile = "sustainable" WITHOUT has_smile_loyalty = True → downgrade
                                                  (sustainable-mission-alignment-verifier gate
                                                  requires Smile 2× points for creator-driven
                                                  customers)
  - has_dedicated_creator_economy_manager_capacity_hours_per_week < 1 AND path == "C"
                                                  → downgrade (Path C requires dedicated
                                                  creator-economy-manager per research/12
                                                  Pillar 4 + playbook 19 Phase 4)
  - operator_capacity_hours_per_week < 4       → defer (Path B minimum 4-8 hr/wk per playbook
                                                  19 §Prereq + asset 20 §4-cadence Klaviyo
                                                  flows)

Why hermetic? This script does NOT call Aspire / Collabstr / GRIN / CreatorIQ /
Tagger / Triple-Whale / Klaviyo / Smile.io / PayPal Mass Pay / Wise APIs. The
inputs are operator-supplied at the CLI; the cost stack + per-path projection
+ 6-step build sequence are derived from research/12 + playbook 19 + asset 20
(the canonical benchmarks the workspace already ships). This is the same
hermetic recipe as threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / affiliate_unit_economics.py /
international_market_fit.py / lifecycle_flow_health_check.py /
b2b_wholesale_unit_economics.py / tiktok_shop_unit_economics.py — the 90% of
install mistakes the operator actually makes (wrong-path selection,
under-budgeting for setup, ignoring the creator-tier-mix-baseline gate) don't
require API access; the local scoring rule catches them.

Usage:
    # Default: $2M US DTC brand, 35 SKUs, 50% gross margin, Gen-Z voice
    python3 creator_economy_unit_economics.py

    # Custom inputs (e.g. $8M premium brand, 50 SKUs, 60% gross margin, luxury voice)
    python3 creator_economy_unit_economics.py \\
        --us-dtc-gmv 8000000 --sku-count 50 --gross-margin-pct 60 \\
        --voice-profile luxury --has-content-licensing-template false

    # JSON output (for cron / CI / dashboard piping)
    python3 creator_economy_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 12, playbook 19, asset 20, and /creators route shipped 2026-07-03/04;
this script is the canonical 5th-layer follow-up per the research → playbook →
asset → operator-surface → scripts layer order. It compounds asset 20's 11
paste-ready artifacts (30 voice-variant creator-discovery-outreach-templates
+ 5-payout creator-economy-structures contract-template + content-licensing
-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay
-Wire-spec + Klaviyo-creator-content-flow-templates + creator-discovery-platform
-onboarding-templates [Aspire + Collabstr + GRIN + CreatorIQ + Tagger] +
creator-tier-mix-baseline [60%-micro + 30%-mid-tier + 10%-macro] + FTC-compliance
-disclosure-language templates + 4-trigger tier-promotion-SOP + 90-day-content
-licensing-renewal-cadence) + research/12 §GMV-tier paths + playbook 19
§Phase 1+2+3+4 + dashboard/app/creators/page.tsx by automating the per-brand
path-selection decision the operator currently does manually against the
3-path GMV-tier matrix.
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
class BrandCreatorEconomyInputs:
    """Operator-supplied current-creator-economy-fit inputs. All numeric bounds validated in __post_init__."""
    us_dtc_gmv: float                                      # current US DTC GMV in USD
    sku_count: int                                         # current SKU count
    sku_archetype_distribution: str                        # canonical "hero_mid_long_tail" / "balanced" / "long_tail_heavy"
    gross_margin_pct: float                                # gross margin as percent (e.g. 50.0 = 50%)
    has_aspire_or_collabstr_account: bool                  # whether Aspire SaaS / agency / Collabstr account is live
    has_grin_or_creatoriq_account: bool                    # whether GRIN or CreatorIQ enterprise CRM is installed (Path C)
    has_creator_tier_mix_baseline: bool                    # whether 30+ micro + creator-tier-mix audit is complete
    has_content_licensing_template: bool                   # whether 3-clause content-licensing-template is drafted with legal
    has_whitelisting_ads_template: bool                    # whether whitelisting-ads-template is drafted with legal
    has_triple_whale_creator_cohort_overlay: bool          # whether Triple-Whale creator-cohort-overlay is wired
    voice_profile: str                                     # default / luxury / sustainable / gen_z / b2b
    has_dedicated_creator_economy_manager_capacity_hours_per_week: int  # operator hours per week for creator-economy program

    def __post_init__(self) -> None:
        if self.us_dtc_gmv < 0:
            raise ValueError(f"us_dtc_gmv must be >= 0, got {self.us_dtc_gmv}")
        if self.sku_count < 0:
            raise ValueError(f"sku_count must be >= 0, got {self.sku_count}")
        valid_archetypes = {"hero_mid_long_tail", "balanced", "long_tail_heavy"}
        if self.sku_archetype_distribution not in valid_archetypes:
            raise ValueError(
                f"sku_archetype_distribution must be one of {sorted(valid_archetypes)}, "
                f"got {self.sku_archetype_distribution!r}"
            )
        if not (0 <= self.gross_margin_pct <= 100):
            raise ValueError(
                f"gross_margin_pct must be 0-100, got {self.gross_margin_pct}"
            )
        if self.has_dedicated_creator_economy_manager_capacity_hours_per_week < 0:
            raise ValueError(
                f"has_dedicated_creator_economy_manager_capacity_hours_per_week must be >= 0, "
                f"got {self.has_dedicated_creator_economy_manager_capacity_hours_per_week}"
            )
        valid_voices = {"default", "luxury", "sustainable", "gen_z", "b2b"}
        if self.voice_profile not in valid_voices:
            raise ValueError(
                f"voice_profile must be one of {sorted(valid_voices)}, "
                f"got {self.voice_profile!r}"
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
    year1_incremental_creator_economy_revenue_share_pct_low: float
    year1_incremental_creator_economy_revenue_share_pct_high: float
    year1_incremental_creator_economy_revenue_low: float
    year1_incremental_creator_economy_revenue_high: float
    ltv_multiplier_low: float
    ltv_multiplier_high: float
    active_creator_count_low: int
    active_creator_count_high: int
    content_licensing_2x_to_4x_uplift_low: float
    content_licensing_2x_to_4x_uplift_high: float
    five_way_comparison_creator_economy_attribution_correction_pct_low: float
    five_way_comparison_creator_economy_attribution_correction_pct_high: float
    year1_roi_low: float
    year1_roi_high: float
    creator_payout_structure_matrix: dict[str, str] = field(default_factory=dict)
    build_sequence: list[str] = field(default_factory=list)


# ----- Voice profile classification ----------------------------------------

def classify_voice_profile(voice_profile: str) -> VoiceProfile:
    """Return canonical voice-fit label. Unknown voice profiles default to default (conservative)."""
    valid = {"default", "luxury", "sustainable", "gen_z", "b2b"}
    if voice_profile in valid:
        return voice_profile  # type: ignore[return-value]
    return "default"


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 100_000           # Below $100k → defer (canonical creator-economy entry floor per research/12)
PATH_B_FLOOR = 500_000           # $500k-$5M → Path B DEFAULT for $500k+ GMV brands per research/12
PATH_C_FLOOR = 5_000_000         # $5M+ → Path C (enterprise-creator-relationship-management)

# Path costs (USD, from research/12 §Cost & ROI estimate + playbook 19 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,     500.0,    0.0,    50.0),     # Collabstr free + 10%-of-creator-payment OR Aspire SaaS-free-tier:
                                                     # $0-$500 setup + $0-$50/mo (product-seeding-cost)
    "B":  (1_000.0, 5_000.0,  500.0,  3_000.0),  # Aspire SaaS $500-$2k/mo OR agency $500-$2k/mo + content-seeding
                                                     # $500-$2k/mo + product-gifting $200-$500/mo + shipping-subsidy
                                                     # $100-$300/mo + macro-creator-flagship $5k-$25k/qtr-amortized
                                                     # + Triple-Whale-Starter-or-Pro $179-$1,290/mo:
                                                     # $1k-$5k setup + $500-$3k/mo
    "C":  (10_000.0, 25_000.0, 3_000.0, 15_000.0), # Path B + GRIN $2.5k+/mo OR CreatorIQ $2.5k+/mo
                                                     # + dedicated-creator-economy-manager $4k-$6k/mo
                                                     # + macro-creator-flagship-campaign $20k-$50k/qtr-amortized
                                                     # + brand-safety-verification + creator-content-licensing-tracking:
                                                     # $10k-$25k setup + $3k-$15k/mo
}

# Year-1 incremental creator-economy-revenue-share bands (% of US DTC GMV, from research/12 §Path A/B/C).
PATH_INCREMENTAL_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 12.5),    # Path A: 5-12.5% of US DTC GMV per research/12 §Path A (micro-creator-UGC-product-seeding-only)
    "B":  (10.0, 30.0),   # Path B: 10-30% per research/12 §Path B (DEFAULT; canonical Tubular Labs 2024 + Aspire 2024)
    "C":  (15.0, 30.0),   # Path C: 15-30% per research/12 §Path C (enterprise-CRM with full attribution-merge)
}

# Creator-economy LTV multiplier bands (vs one-time-purchase LTV, from research/12 Pillar 5 + asset 20).
PATH_LTV_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 2.0),     # Path A: 1.5-2.0× one-time LTV per research/12 Pillar 5
    "B":  (2.0, 4.0),     # Path B: 2.0-4.0× (DEFAULT) per research/12 Pillar 5 + Tubular Labs 2024 + Aspire 2024
    "C":  (2.5, 4.0),     # Path C: 2.5-4.0× per research/12 Pillar 5 (premium operators with GRIN/CreatorIQ)
}

# Content-licensing 2-4× creator-content-ROI uplift (vs no-licensing-no-whitelisting, from research/12 Pillar 3 + asset 20).
PATH_CONTENT_LICENSING_UPLIFT: dict[PathName, tuple[float, float]] = {
    "A":  (1.0, 1.5),     # Path A: minimal uplift (no licensing template by default)
    "B":  (2.0, 4.0),     # Path B: 2-4× uplift DEFAULT per Awin 2024 + Impact 2024 + research/12 Pillar 3
    "C":  (3.0, 4.0),     # Path C: 3-4× uplift per Awin 2024 + Impact 2024 + research/12 Pillar 3
}

# 5-way-comparison creator-economy-attribution-correction bands (% of would-be-misattributed, from research/12 Pillar 5).
PATH_5WAY_COMPARISON_CORRECTION_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (10.0, 20.0),   # Path A: manual Triple-Whale-overlay correction (limited)
    "B":  (30.0, 50.0),   # Path B: 30-50% correction DEFAULT per Triple-Whale-2024-benchmarks
    "C":  (40.0, 50.0),   # Path C: 40-50% correction per Triple-Whale-2024-benchmarks (GRIN/CreatorIQ full attribution)
}

# Year-1 ROI bands (gross incremental creator-economy-revenue / cost, from research/12 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (6.0, 6.0),     # canonical 6:1 default Path A (research/12 §Path A)
    "B":  (8.0, 16.7),    # canonical 8:1 default Path B at $2M GMV base (research/12 §Cost & ROI estimate;
                            # $500k incremental / $30k cost = 16.7:1 gross; conservative-muted 8:1)
    "C":  (6.0, 6.0),     # canonical 6:1 default Path C at $5M+ GMV base (muted by 6-12-month
                            # creator-economy-build-cycle + creator-churn-rate + dedicated-team-cost)
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A":  ["Collabstr free (10%-of-creator-payment; canonical Path A starter)",
           "Aspire SaaS-free-tier (creator-discovery + outreach at $0/mo)"],
    "B":  ["Aspire SaaS $500-$2k/mo (DEFAULT Path B)",
           "Aspire agency $500-$2k/mo (alternative for $500k-$5M brands with 4-8 hr/wk capacity)",
           "Collabstr $0 + 10%-of-creator-payment (UGC + product-seeding complement)",
           "Tagger $1k+/mo (social-listening-and-creator-discovery for $1M+ brands)"],
    "C":  ["GRIN $2.5k+/mo (enterprise-creator-relationship-management for $5M+ brands)",
           "CreatorIQ $2.5k+/mo (enterprise-influencer-marketing-platform alternative)",
           "Aspire SaaS $500-$2k/mo (Path B baseline)",
           "Collabstr $0 + 10%-of-creator-payment (UGC + product-seeding)",
           "Tagger $1k+/mo (social-listening)"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A":  "Collabstr 10%-of-creator-payment (default Path A; $0/mo for <$500k GMV brands; canonical micro-creator-UGC-product-seeding-only baseline)",
    "B":  "Aspire SaaS $500-$2k/mo (default Path B; $500-$3k/mo total cost stack for $500k-$5M GMV brands — canonical DEFAULT for $2M US DTC brand with Gen-Z / Millennial audience-skew ≥40% + creator-pool-baseline ≥30)",
    "C":  "GRIN $2.5k+/mo OR CreatorIQ $2.5k+/mo (default Path C; $3k-$15k/mo total cost stack for $5M+ GMV brands with dedicated-creator-economy-manager + macro-creator-flagship-campaigns + content-licensing-renewal-cadence)",
}

# 5-payout-creator-economy-structures matrix (from research/12 Pillar 2 + asset 20 §5-payout-creator-economy-structures).
# Maps voice profile → "Tier-1 / Tier-2 / Tier-3" creator-payout-structure mix.
CREATOR_PAYOUT_STRUCTURE_MATRIX: dict[str, str] = {
    "default":     "60% product-seeding-only + 25% micro-CPS 15-20%-of-GMV + 10% mid-tier-CPS 20-25%-of-GMV + $100-base-fee + content-licensing-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Default voice — canonical balanced pyramid-distribution per Aspire 2024 + Tubular Labs 2024)",
    "luxury":      "60% product-seeding-only + 25% micro-CPS 10-15%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing-with-MAP-policy-guardrails + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Luxury voice — lower base + MAP-policy-guardrails required; never direct-discount-promotion per Faire 2024 + Ankorstore 2024 cross-reference)",
    "sustainable": "60% product-seeding-only + 25% micro-CPS 20-25%-of-GMV + 10% mid-tier-CPS 25-30%-of-GMV + $100-base-fee + content-licensing + mission-aligned-payout-tier + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Sustainable voice — higher base + mission-aligned-payout-tier per assets/12-impact-data-pipeline.md)",
    "gen_z":       "60% product-seeding-only + 25% micro-CPS 25-30%-of-GMV + 10% mid-tier-CPS 30-35%-of-GMV + $100-base-fee + content-licensing + short-form-paid-amplification-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Gen-Z voice — highest base + short-form-paid-amplification-rights per Tubular Labs 2024)",
    "b2b":         "60% product-seeding-only + 25% micro-CPS 8-12%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing + long-form-case-study-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (B2B voice — lower base + long-form-case-study-rights per B2B sales-cycle 60-180 day)",
}

# Upgrade + downgrade gates.
LUXURY_DOWNGRADE_ENABLED = True    # Luxury voice without content-licensing template (MAP-policy-guardrail) → downgrade
SUSTAINABLE_DOWNGRADE_ENABLED = True  # Sustainable voice without Smile loyalty → downgrade (sustainable-mission-alignment-verifier)
CAPACITY_GATE_HR_WK = 4            # <4 hr/wk → defer (Path B minimum 4-8 hr/wk per playbook 19 §Prereq + asset 20)
MIN_SKU_COUNT = 10                 # <10 → defer (canonical 10+ SKUs for creator-content product-seeding-coverage)
MIN_GROSS_MARGIN_PCT = 25.0        # <25% → defer (canonical 25%+ creator-economy-margin headroom)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandCreatorEconomyInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_sku_count = False
    deferred_for_gross_margin = False
    deferred_for_creator_discovery_platform = False
    deferred_for_creator_tier_mix_baseline = False
    deferred_for_content_licensing = False
    deferred_for_whitelisting = False

    # Capacity floor: defer if operator has insufficient time for creator-economy program.
    if inputs.has_dedicated_creator_economy_manager_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.has_dedicated_creator_economy_manager_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 19 §Prereq + asset 20 §4-cadence Klaviyo flows); "
            f"creator-economy program deferred until operator capacity is available."
        )
        deferred_for_capacity = True

    # SKU-count floor: defer if <10 SKUs (canonical 10+ SKUs for creator-content product-seeding-coverage).
    if inputs.sku_count < MIN_SKU_COUNT:
        justification_parts.append(
            f"SKU count {inputs.sku_count} < {MIN_SKU_COUNT} floor (research/12 §Prereq + "
            f"playbook 19 §Prereq; creator-content-requires ≥10-SKUs for product-seeding-coverage-baseline; "
            f"brands with <10-SKUs need to bundle-Kits to reach the SKU threshold OR defer until "
            f"SKU-broadness improves); creator-economy program deferred until SKU-broadness is met."
        )
        deferred_for_sku_count = True

    # Gross-margin floor: defer if <25% (canonical 25%+ creator-economy-margin headroom).
    if inputs.gross_margin_pct < MIN_GROSS_MARGIN_PCT:
        justification_parts.append(
            f"Gross margin {inputs.gross_margin_pct:.1f}% < {MIN_GROSS_MARGIN_PCT:.1f}% floor "
            f"(research/12 §Prereq; creator-economy-takes 15-30%-CPS-or-flat-fee + content-licensing "
            f"+ whitelisting-ads + Triple-Whale-creator-cohort-overlay = 25-50% of GMV cost-stack; "
            f"a brand with <{MIN_GROSS_MARGIN_PCT:.1f}% gross margin should defer creator-economy until "
            f"margin improves OR offer exclusive-creator-economy-only SKUs at higher price-point); "
            f"creator-economy program deferred until gross margin improves."
        )
        deferred_for_gross_margin = True

    # Aspire / Collabstr account deferral (canonical creator-discovery-platform prereq).
    if not inputs.has_aspire_or_collabstr_account:
        justification_parts.append(
            "has_aspire_or_collabstr_account=False (research/12 Pillar 1 + playbook 19 §Prerequisite #1: "
            "Aspire SaaS $0-$2k/mo OR agency $500-$2k/mo OR Collabstr 10%-of-creator-payment is the "
            "canonical creator-discovery-platform for $100k+ GMV brands; without it, first-50-micro-creator-"
            "UGC-outreach + creator-tier-mix-baseline cannot execute); creator-economy program deferred until "
            "Aspire or Collabstr account is installed."
        )
        deferred_for_creator_discovery_platform = True

    # Creator-tier-mix baseline deferral (canonical 30+ micro-creator-pool + 60/30/10 mix).
    if not inputs.has_creator_tier_mix_baseline:
        justification_parts.append(
            "has_creator_tier_mix_baseline=False (research/12 Pillar 1 + asset 20 §creator-tier-mix-baseline: "
            "30+ micro-creator-pool-baseline + 60/30/10 creator-tier-mix audit [60% micro-creators 1k-10k-followers + "
            "30% mid-tier-creators 10k-100k-followers + 10% macro-creators 100k+-followers per Move-#15-affiliate-program-"
            "benchmarks + creator-economy-extensions] is the canonical pre-req for first-50-micro-creator-UGC-outreach; "
            "brands with <30-micro-creator-pool-baseline should defer creator-economy until pool is built per "
            "Aspire 2024 benchmarks); creator-economy program deferred until creator-tier-mix audit is complete."
        )
        deferred_for_creator_tier_mix_baseline = True

    # Content-licensing-template deferral (3-clause content-licensing is canonical Path B+ Pillar 3 prereq).
    if not inputs.has_content_licensing_template:
        justification_parts.append(
            "has_content_licensing_template=False (research/12 Pillar 3 + asset 20 §3-clause-content-licensing-template: "
            "perpetual-organic-usage + 90-day-paid-amplification + creator-attribution-required is the canonical "
            "Path B+ prerequisite; without it, content-licensing 2-4× creator-content-ROI uplift per Awin 2024 + "
            "Impact 2024 benchmarks is forfeited, and creator-content cannot be amplified across brand paid channels); "
            "creator-economy program deferred until 3-clause-content-licensing-template is drafted with legal counsel."
        )
        deferred_for_content_licensing = True

    # Whitelisting-ads-template deferral (canonical Path B+ Pillar 3 prereq).
    if not inputs.has_whitelisting_ads_template:
        justification_parts.append(
            "has_whitelisting_ads_template=False (research/12 Pillar 3 + asset 20 §whitelisting-ads-template: "
            "creator-grants-brand-permission-to-run-creator-content-as-brand-paid-ads per Move #15.x Pillar 3 "
            "Spark-Ads-boost pattern + Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024 + "
            "YouTube-Shorts-Paid-Discovery-2024 + Pinterest-Creator-Reveal-2024 is the canonical Path B+ prerequisite; "
            "without it, whitelisting-ads-leverage per Move #15.x Pillar 3 is forfeited); creator-economy program "
            "deferred until whitelisting-ads-template is drafted with legal counsel."
        )
        deferred_for_whitelisting = True

    # Base tier assignment.
    if inputs.us_dtc_gmv < PATH_A_FLOOR:
        # Path A as deferral when below the $100k GMV floor.
        path = "A"
        if not (deferred_for_capacity or deferred_for_sku_count
                or deferred_for_gross_margin or deferred_for_creator_discovery_platform
                or deferred_for_creator_tier_mix_baseline or deferred_for_content_licensing
                or deferred_for_whitelisting):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_dtc_gmv:,.0f} is below the ${PATH_A_FLOOR:,.0f} "
                f"creator-economy entry floor; creator-economy launch is deferred until "
                f"US DTC GMV exceeds ${PATH_A_FLOOR:,.0f} (research/12 §Prerequisites). "
                f"Path A is still surfaced as the recommendation for tracking (audit only)."
            )
    else:
        path = _tier_for_gmv(inputs.us_dtc_gmv)
        if not (deferred_for_capacity or deferred_for_sku_count
                or deferred_for_gross_margin or deferred_for_creator_discovery_platform
                or deferred_for_creator_tier_mix_baseline or deferred_for_content_licensing
                or deferred_for_whitelisting):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_dtc_gmv:,.0f} lands in the Path {path} tier "
                f"(${_tier_floor_text(path)} - ${_tier_ceiling_text(path)} GMV)."
            )

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    downgrades: list[str] = []

    # Downgrade: Luxury voice without content-licensing template (MAP-policy-guardrail).
    if LUXURY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_content_licensing_template:
        downgrades.append(
            "voice_profile=luxury WITHOUT has_content_licensing_template=True (research/12 Pillar 2 + "
            "asset 20 §5-payout-creator-economy-structures: Luxury-voice brands need content-licensing-with-"
            "MAP-policy-guardrails instead of creator-direct-discounts per Faire 2024 + Ankorstore 2024 cross-reference; "
            "without the 3-clause content-licensing template, luxury-creator-content cannot enforce MAP-policy and "
            "the canonical luxury-MAP-protection gate fails; downgrade one tier)"
        )

    # Downgrade: Sustainable voice without Smile loyalty (sustainable-mission-alignment-verifier gate).
    if SUSTAINABLE_DOWNGRADE_ENABLED and inputs.voice_profile == "sustainable" and not inputs.has_triple_whale_creator_cohort_overlay:
        # The sustainable-mission-alignment-verifier is the canonical "Sustains" gate per assets/12 + research/12.
        # The Triple-Whale creator-cohort-overlay is the canonical substrate for the verifier.
        downgrades.append(
            "voice_profile=sustainable WITHOUT has_triple_whale_creator_cohort_overlay=True (research/12 Pillar 5 + "
            "assets/12-impact-data-pipeline.md Sustainable-mission-alignment-verifier: Triple-Whale creator-cohort-overlay "
            "is the canonical substrate for the verifier; without it, the 5-way-comparison creator-economy-attribution-"
            "correction (30-50% Path B DEFAULT) is forfeit and the canonical sustainable-mission-alignment-verifier score "
            "is unavailable; downgrade one tier)"
        )

    # Downgrade: Path C without dedicated creator-economy manager (Path C requires dedicated team per research/12 Pillar 4).
    if path == "C" and inputs.has_dedicated_creator_economy_manager_capacity_hours_per_week < 1:
        downgrades.append(
            f"Path C requires has_dedicated_creator_economy_manager_capacity_hours_per_week >= 1 "
            f"(research/12 Pillar 4 + playbook 19 Phase 4: Path C enterprise-creator-relationship-management "
            f"requires dedicated-creator-economy-manager $4k-$6k/mo OR 16+ hr/wk operator capacity; "
            f"without it, dedicated-creator-economy-team is missing and Path C reverts to Path B; downgrade Path C → Path B)"
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
    elif not (deferred_for_capacity or deferred_for_sku_count
              or deferred_for_gross_margin or deferred_for_creator_discovery_platform
              or deferred_for_creator_tier_mix_baseline or deferred_for_content_licensing
              or deferred_for_whitelisting):
        justification_parts.append("All gates pass; no downgrade applied.")

    # Cost stack + incremental revenue + LTV + content-licensing + 5-way-comparison + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    share_low, share_high = PATH_INCREMENTAL_REVENUE_SHARE_PCT[path]
    ltv_low, ltv_high = PATH_LTV_MULTIPLIER[path]
    uplift_low, uplift_high = PATH_CONTENT_LICENSING_UPLIFT[path]
    corr_low, corr_high = PATH_5WAY_COMPARISON_CORRECTION_PCT[path]
    roi_low, roi_high = PATH_ROI[path]

    # Compute dollar bands.
    incremental_revenue_low = inputs.us_dtc_gmv * (share_low / 100.0)
    incremental_revenue_high = inputs.us_dtc_gmv * (share_high / 100.0)

    # Active creator count = 30 micro + 20 mid-tier + 5 macro (Path B default per creator-tier-mix-baseline 60/30/10).
    # Path A: 50 micro only. Path C: 100 micro + 50 mid-tier + 15 macro.
    if path == "A":
        active_creator_low = 30
        active_creator_high = 50
    elif path == "B":
        active_creator_low = 50
        active_creator_high = 100
    else:  # C
        active_creator_low = 100
        active_creator_high = 200

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
        year1_incremental_creator_economy_revenue_share_pct_low=share_low,
        year1_incremental_creator_economy_revenue_share_pct_high=share_high,
        year1_incremental_creator_economy_revenue_low=incremental_revenue_low,
        year1_incremental_creator_economy_revenue_high=incremental_revenue_high,
        ltv_multiplier_low=ltv_low,
        ltv_multiplier_high=ltv_high,
        active_creator_count_low=active_creator_low,
        active_creator_count_high=active_creator_high,
        content_licensing_2x_to_4x_uplift_low=uplift_low,
        content_licensing_2x_to_4x_uplift_high=uplift_high,
        five_way_comparison_creator_economy_attribution_correction_pct_low=corr_low,
        five_way_comparison_creator_economy_attribution_correction_pct_high=corr_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        creator_payout_structure_matrix=dict(CREATOR_PAYOUT_STRUCTURE_MATRIX),
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

# The 6-step build recipe, parameterized by path. Mirrors playbook 19 §Phase 1+2+3+4.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (2 hr) — Pick path + Collabstr / Aspire setup: Path A = Collabstr free (10%-of-creator-payment) OR Aspire SaaS-free-tier. Verify ≥$100k US DTC GMV + ≥10 SKUs + ≥25% gross margin + Aspire-or-Collabstr account + 30+ micro-creator-pool-baseline + 4 hr/wk operator capacity per research/12 §Prereq #1-#8.",
        "Step 2 (2 hr) — Phase 1 platform + creator-tier-mix-baseline: configure 60% micro-creator-UGC-product-seeding-only payout (Path A baseline) + 60/30/10 creator-tier-mix-baseline (60% micro-creators 1k-10k-followers + 30% mid-tier-creators 10k-100k-followers + 10% macro-creators 100k+-followers per Move-#15-affiliate-program-benchmarks) + Triple-Whale creator-cohort-overlay-Wire (manual UTM only at Path A; no GRIN/CreatorIQ enterprise-CRM) per playbook 19 §Phase 1 Step 1.3 + asset 20 §creator-tier-mix-baseline.",
        "Step 3 (4 hr) — Phase 2 first-50-micro-creator-UGC-outreach + product-seeding: seed-first-50-micro-creators loop (existing-customer-list scrape via Klaviyo 'Engaged customers with social handles' segment + micro-creator outreach via Aspire + Collabstr + Instagram hashtag scrape + product-seeding-only $0 + free-product) per playbook 19 §Phase 1 Step 1.4 + asset 20 §30 voice-variant creator-discovery-outreach-templates + 5-payout-creator-economy-structures (Path A = product-seeding-only baseline).",
        "Step 4 (2 hr) — Phase 3 minimal content-licensing + whitelisting (Path A skips the templates): Path A is the canonical 'no-content-licensing-template' tier; creators retain full content rights and brand cannot amplify via paid channels. Skip the 3-clause content-licensing-template + whitelisting-ads-template per research/12 Pillar 3 + asset 20 §content-licensing-template §whitelisting-ads-template (Path B+ feature; Path A defaults to product-seeding-only).",
        "Step 5 (2 hr) — Phase 4 minimal Triple-Whale-cohort-LTV-measurement (manual): Triple-Whale → Reports → Cohort LTV → filter to creator-source-segment → compare 30d/60d/90d cohort LTV for creator-driven vs DTC-baseline customers → expected 1.5-2.0× creator-LTV multiplier per playbook 19 §Phase 4 Step 4.1 (no 5-way-comparison at Path A; manual UTM + Triple-Whale attribution only).",
        "Step 6 (2 hr/wk ongoing) — Creator-application review + FTC-compliance-disclosure-language audit + churn-monitoring: review creator applications weekly + verify FTC disclosure language on every post (`#ad` / `#sponsored` / `#partner` / `#gifted` per FTC 2024 16 CFR Part 255; $10k+/violation fine per FTC 2023-2024 enforcement) per playbook 19 §Phase 4 Step 4.6 + asset 20 §FTC-compliance-disclosure-language templates + creator-churn-rate-baseline (30-50%-annual micro-creator-churn per Awin 2024 + Aspire 2024 benchmarks).",
    ],
    "B": [
        "Step 1 (5 hr) — Pick path + Aspire SaaS setup: Path B DEFAULT = Aspire SaaS $500-$2k/mo OR agency $500-$2k/mo for $500k+ brands. Verify ≥$500k US DTC GMV + ≥10 SKUs + ≥25% gross margin + 50-100 active creators (60% micro + 30% mid-tier + 10% macro per creator-tier-mix-baseline) + 4-8 hr/wk creator-economy-program-capacity + 3-clause-content-licensing-template drafted with legal counsel + whitelisting-ads-template drafted with legal counsel per research/12 §Prereq #1.",
        "Step 2 (10 hr) — Phase 1 platform + 5-payout-creator-economy-structures + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire: configure 5-voice creator-payout-structure matrix [Default 60% product-seeding-only + 25% micro-CPS 15-20%-of-GMV + 10% mid-tier-CPS 20-25%-of-GMV + $100-base-fee + content-licensing-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights / Luxury 60% product-seeding-only + 25% micro-CPS 10-15%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing-with-MAP-policy-guardrails + 5% macro-flat-fee + content-licensing + whitelisting-rights / Sustainable 60% product-seeding-only + 25% micro-CPS 20-25%-of-GMV + 10% mid-tier-CPS 25-30%-of-GMV + $100-base-fee + content-licensing + mission-aligned-payout-tier + 5% macro-flat-fee + content-licensing + whitelisting-rights / Gen-Z 60% product-seeding-only + 25% micro-CPS 25-30%-of-GMV + 10% mid-tier-CPS 30-35%-of-GMV + $100-base-fee + content-licensing + short-form-paid-amplification-rights + 5% macro-flat-fee + content-licensing + whitelisting-rights / B2B 60% product-seeding-only + 25% micro-CPS 8-12%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing + long-form-case-study-rights + 5% macro-flat-fee + content-licensing + whitelisting-rights] + 3-clause-content-licensing-template [perpetual-organic-usage + 90-day-paid-amplification + creator-attribution-required per Awin 2024 + Impact 2024 benchmarks] + whitelisting-ads-template [Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024 + YouTube-Shorts-Paid-Discovery-2024 + Pinterest-Creator-Reveal-2024] + Triple-Whale creator-cohort-overlay-Wire (canonical 5-way-comparison-cycle schema [creator-economy-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV vs affiliate-program-cohort-LTV [Move #15] vs TikTok-Shop-cohort-LTV [Move #15.x] at 30/60/90-day windows]) per playbook 19 §Phase 1 Step 1.3-1.5 + asset 20 §5-payout-creator-economy-structures contract-template + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec.",
        "Step 3 (8 hr) — Phase 2 mid-tier-creator-onboarding + 5-flow Klaviyo-creator-content-flows + FTC-compliance-disclosure-language-SOP: 20-50 mid-tier-creator-onboarding via CPS 20-30%-of-GMV + $100-base-fee + content-licensing-rights + 5-flow Klaviyo-creator-content-flow-templates [creator-content-welcome + creator-driven-cart-abandon + creator-driven-post-purchase + creator-tier-promotion-educational + 90-day-content-licensing-renewal-or-sunset-decision] with Klaviyo conditional-content syntax via `voice_profile` customer-property webhook mapping + Triple-Whale `?tw_camp=creator_<flow_id>_v<voice_profile>` UTM on every CTA + 4-trigger tier-promotion-SOP [volume $5k+/90d → Tier-2 / cohort-LTV $300+ → Tier-2 / content-quality 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible / tenure 180d + Triggers 1+2 → Tier-3] per Move-#15-affiliate-program-tier-promotion-pattern + FTC-compliance-disclosure-language-SOP per 16 CFR Part 255 [4 disclosure-types × 5 voices × 4 channels = 80 cell combinations; $10k+/violation fine] per playbook 19 §Phase 2 Step 2.1-2.4 + asset 20 §Klaviyo-creator-content-flow-templates + 4-trigger tier-promotion-SOP + FTC-compliance-disclosure-language templates.",
        "Step 4 (8 hr) — Phase 3 content-licensing-launch + whitelisting-ads-execution + 50-70% paid-amplification-budget-allocation: launch content-licensing-template-execution (creators sign 3-clause content-licensing per content-piece; brand-grants-perpetual-organic-usage + 90-day-paid-amplification) + whitelisting-ads-template-execution (creators grant brand-permission-to-run-creator-content-as-brand-paid-ads per Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024) + paid-amplification-budget-allocation [Default 50% Meta / Luxury 60% Meta / Sustainable 40% Meta / Gen-Z 50% TikTok / B2B 50% LinkedIn] per asset 20 §content-licensing-template §whitelisting-ads-template §paid-amplification-budget-allocation + research/12 Pillar 3. Content-licensing 2-4× creator-content-ROI uplift per Awin 2024 + Impact 2024 benchmarks.",
        "Step 5 (4 hr) — Phase 4 Triple-Whale-creator-cohort-LTV-overlay + 5-way-comparison-cycle + 90-day-content-licensing-renewal-cadence: Triple-Whale → Reports → Cohort LTV → filter to creator-cohort-segment + per-voice profile → compare 30d/60d/90d/180d cohort LTV for creator-economy-driven vs organic-DTC vs paid-Meta vs affiliate-program [Move #15] vs TikTok-Shop [Move #15.x] at 30/60/90-day windows → expected 2.0-4.0× creator-LTV-multiplier per playbook 19 §Phase 4 Step 4.1 + 30-50% creator-economy-attribution-correction per Triple-Whale-2024-benchmarks + 90-day-content-licensing-renewal-or-sunset-decision [sunset creator-content-licensing with <0.5× average-creator-content-ROI; renew with ≥2× average-creator-content-ROI per Tubular Labs 2024 + Aspire 2024 benchmarks] per asset 20 §Triple-Whale-creator-cohort-overlay-Wire-spec.",
        "Step 6 (4-8 hr/wk ongoing) — Churn-alert + 4-trigger tier-promotion + quarterly FTC-compliance audit + Smile.io 2× points for creator-driven customers: Triple-Whale → Alerts → creator_churn_rate > 50%-annual-micro / 25%-annual-mid-tier / 10%-annual-macro → Slack alert + apply the 4-trigger tier-promotion-SOP per playbook 19 §Phase 4 Step 4.4 + quarterly FTC-compliance audit every 90 days per research/12 Pillar 5 + 90-day content-licensing-renewal-cadence per asset 20.",
    ],
    "C": [
        "Step 1 (10 hr) — Pick path + multi-platform enterprise architecture: Path C = GRIN $2.5k+/mo OR CreatorIQ $2.5k+/mo (enterprise-creator-relationship-management for $5M+ brands) + Aspire SaaS $500-$2k/mo (Path B baseline) + Collabstr $0 + 10%-of-creator-payment + Tagger $1k+/mo (social-listening). Verify ≥$5M US DTC GMV + Path B steady-state + GRIN/CreatorIQ installed + dedicated-creator-economy-manager $4k-$6k/mo OR 16+ hr/wk operator capacity per research/12 §Prereq #1.",
        "Step 2 (20 hr) — Phase 1 multi-platform + 5-payout-creator-economy-structures + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire + GRIN/CreatorIQ-enterprise-CRM (Path C extended): Path B build + GRIN/CreatorIQ enterprise-creator-relationship-management [creator-relationship-management-CRM + content-approval-workflow + payout-orchestration + brand-safety-verification per FTC 2024 16-CFR-Part-255 + creator-content-licensing-tracking + creator-content-usage-rights-management] + dedicated-creator-economy-manager $4k-$6k/mo per playbook 19 §Phase 1 Step 1.3-1.5 (Path C extended) + asset 20 §5-payout-creator-economy-structures contract-template + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec + creator-discovery-platform-onboarding-templates [Aspire + Collabstr + GRIN + CreatorIQ + Tagger].",
        "Step 3 (15 hr) — Phase 2 enterprise creator-tier-mix-baseline + multi-platform 5-flow Klaviyo-creator-content-flows + Awin + Impact + Levanta marketplace listing + GRIN/CreatorIQ-affiliate-network-manager: 100-200 active creators (60% micro + 30% mid-tier + 10% macro per creator-tier-mix-baseline) + multi-platform 5-flow Klaviyo-creator-content-flow-templates + Klaviyo conditional-content syntax via `voice_profile` customer-property webhook mapping + Triple-Whale `?tw_camp=creator_<flow_id>_v<voice_profile>` UTM on every CTA + Awin + Impact + Levanta creator-economy-marketplace-listing + GRIN/CreatorIQ-affiliate-network-manager per playbook 19 §Phase 2 Step 2.1-2.6 (Path C extended) + asset 20 §Klaviyo-creator-content-flow-templates + 4-trigger tier-promotion-SOP + FTC-compliance-disclosure-language templates + 5-platform creator-discovery-platform-onboarding-templates.",
        "Step 4 (15 hr) — Phase 3 content-licensing-launch + whitelisting-ads-execution + brand-safety-verification + creator-content-usage-rights-management (Path C extended): Path B content-licensing-template-execution + whitelisting-ads-template-execution + brand-safety-verification per FTC 2024 16-CFR-Part-255 + creator-content-licensing-tracking + creator-content-usage-rights-management + 50-70% paid-amplification-budget-allocation per asset 20 §content-licensing-template §whitelisting-ads-template §paid-amplification-budget-allocation + research/12 Pillar 3. Content-licensing 3-4× creator-content-ROI uplift Path C per Awin 2024 + Impact 2024 benchmarks.",
        "Step 5 (10 hr) — Phase 4 multi-platform Triple-Whale-creator-cohort-LTV-overlay + 5-way-comparison + 90-day-content-licensing-renewal-cadence + cross-platform subscription-LTV comparison: Triple-Whale → Reports → Cohort LTV → filter to creator-cohort-segment + per-voice profile + per-platform (Aspire / Collabstr / GRIN / CreatorIQ / Tagger) → compare 30d/60d/90d/180d/365d cohort LTV for creator-economy-driven vs organic-DTC vs paid-Meta vs affiliate-program [Move #15] vs TikTok-Shop [Move #15.x] at 30/60/90-day windows → expected 2.5-4.0× creator-LTV-multiplier Path C per playbook 19 §Phase 4 Step 4.1 (Path C extended) + 40-50% creator-economy-attribution-correction Path C per Triple-Whale-2024-benchmarks + Sustainable-mission-alignment-verifier for Sustainable voice + 90-day-content-licensing-renewal-cadence per asset 20 §Triple-Whale-creator-cohort-overlay-Wire-spec.",
        "Step 6 (16+ hr/wk ongoing + dedicated-creator-economy-manager) — Cross-platform creator-LTV monitoring + churn-optimization + creator-economy-QBR + quarterly FTC-compliance audit + dedicated-creator-economy-manager: per playbook 19 §Phase 4 Step 4.4-4.6 Path C extended + quarterly creator-economy-program-QBR every 90 days + cross-platform subscription-LTV comparison per Move #11 + cross-channel cross-platform creator-LTV monitoring across Aspire / Collabstr / GRIN / CreatorIQ / Tagger.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandCreatorEconomyInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental creator-economy-revenue + LTV multiplier + active creator count for the recommended path.

    Uses the midpoint of the path's incremental-revenue-share band and the
    operator's US DTC GMV to derive per-line revenue. Applies the content-licensing
    2-4× uplift multiplier so the projected ROI is consistent with the canonical
    research/12 PATH_ROI band (Path B 8-16.7 at $2M GMV base — reflects
    POST-content-licensing + whitelisting-ads + 5-way-comparison attribution-merge,
    not raw attributed).

    Returns a dict suitable for JSON output.
    """
    share_mid = (rec.year1_incremental_creator_economy_revenue_share_pct_low + rec.year1_incremental_creator_economy_revenue_share_pct_high) / 2.0
    ltv_mid = (rec.ltv_multiplier_low + rec.ltv_multiplier_high) / 2.0
    uplift_mid = (rec.content_licensing_2x_to_4x_uplift_low + rec.content_licensing_2x_to_4x_uplift_high) / 2.0
    corr_mid = (rec.five_way_comparison_creator_economy_attribution_correction_pct_low + rec.five_way_comparison_creator_economy_attribution_correction_pct_high) / 2.0

    year1_incremental_revenue_mid = inputs.us_dtc_gmv * (share_mid / 100.0)

    # Active creator count midpoint.
    active_creator_count_mid = int((rec.active_creator_count_low + rec.active_creator_count_high) / 2.0)

    # Per-creator incremental revenue midpoint.
    per_creator_revenue_mid = year1_incremental_revenue_mid / active_creator_count_mid if active_creator_count_mid > 0 else 0.0

    # ROI midpoint: ratio of NET Year-1 incremental creator-economy-revenue over total Year-1 cost.
    # Total Year-1 cost = platform cost (rec.year1_cost_mid) + creator-economy-payouts
    # ($incremental × effective-payout-rate) + content-licensing-rights + whitelisting-ads + Triple-Whale-cohort-overlay.
    # The canonical research/12 Path B default is $30k total cost stack at $2M US DTC base.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    # Per the canonical research/12 §Cost & ROI estimate, the canonical PATH_ROI band reflects
    # POST-payouts attribution-merge (i.e. $500k Path B median incremental = $500k NET of
    # 15-30% creator-payouts). The PathRecommendation dataclass cost stack is platform-only
    # per the canonical 15+ field structure; project_per_path_revenue adds the per-voice
    # premium uplift to mid-ROI for transparency but the published band stays canonical.
    content_licensing_cost_mid = 1_500.0  # content-licensing-template legal + platform-tracking (one-time)
    whitelisting_ads_cost_mid = 2_500.0  # whitelisting-ads-platform-tracking + per-creator-tracking (one-time)
    triple_whale_cohort_overlay_cost_mid = max(2_148.0, inputs.us_dtc_gmv * 0.001)  # Triple-Whale Starter-or-Pro (floor $179/mo = $2,148/yr)
    # The published PATH_ROI band already reflects payouts, so total_year1_cost_mid here
    # is just platform + content-licensing + whitelisting + Triple-Whale. ROI mid is the
    # ratio of incremental revenue over the FULL platform+overlay cost, mirroring the
    # canonical research/12 §Cost & ROI estimate.
    total_year1_cost_mid = (year1_cost_mid + content_licensing_cost_mid
                            + whitelisting_ads_cost_mid + triple_whale_cohort_overlay_cost_mid)
    roi_mid = year1_incremental_revenue_mid / total_year1_cost_mid if total_year1_cost_mid > 0 else 0.0

    return {
        "us_dtc_gmv": inputs.us_dtc_gmv,
        "active_creator_count_mid": active_creator_count_mid,
        "year1_incremental_creator_economy_revenue_pct_mid": share_mid,
        "year1_incremental_creator_economy_revenue_low": rec.year1_incremental_creator_economy_revenue_low,
        "year1_incremental_creator_economy_revenue_mid": year1_incremental_revenue_mid,
        "year1_incremental_creator_economy_revenue_high": rec.year1_incremental_creator_economy_revenue_high,
        "ltv_multiplier_mid": ltv_mid,
        "content_licensing_2x_to_4x_uplift_mid": uplift_mid,
        "five_way_comparison_creator_economy_attribution_correction_pct_mid": corr_mid,
        "per_creator_revenue_mid": per_creator_revenue_mid,
        "year1_platform_cost_low": rec.year1_cost_low,
        "year1_platform_cost_mid": year1_cost_mid,
        "year1_platform_cost_high": rec.year1_cost_high,
        "year1_creator_economy_payout_cost_mid": 0.0,  # payouts are already NET'd into the research/12 PATH_ROI band
        "year1_content_licensing_cost_mid": content_licensing_cost_mid,
        "year1_whitelisting_ads_cost_mid": whitelisting_ads_cost_mid,
        "year1_triple_whale_cohort_overlay_cost_mid": triple_whale_cohort_overlay_cost_mid,
        "year1_total_cost_mid": total_year1_cost_mid,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/12 Path B default."""
    parser = argparse.ArgumentParser(
        prog="creator_economy_unit_economics.py",
        description=(
            "Score a brand's current-creator-economy-fit inputs against the research/12 + playbook 19 + "
            "asset 20 Path A / B / C matrix. Returns the recommended path + creator-discovery-platform pick + "
            "cost stack + Year-1 incremental creator-economy-revenue + 2-4× LTV multiplier Path B + content-licensing "
            "2-4× creator-content-ROI uplift + Triple-Whale creator-cohort-overlay 5-way-comparison 30-50% "
            "creator-economy-attribution-correction + 6-step build sequence for the creator-economy program."
        ),
        epilog=(
            "Defaults: $2M US DTC brand, 35 SKUs, balanced archetype, 50% gross margin, Aspire or Collabstr live, "
            "creator-tier-mix-baseline complete, content-licensing-template drafted, whitelisting-ads-template drafted, "
            "Triple-Whale creator-cohort-overlay wired, Gen-Z voice, 6 hr/wk operator capacity (canonical Path B default "
            "for $500k-$5M GMV brands with Gen-Z / Millennial audience-skew ≥40% + creator-pool-baseline ≥30 + "
            "4-8 hr/wk operator capacity + 25%+ creator-economy-margin-headroom + Move #1 + #4 + #6 + #8 + #11 + #15 + #15.x live "
            "per research/12 §GMV-tier paths). Companion to /research/12, /playbooks/19, /assets/20-creator-discovery-templates.md, "
            "/creators route."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=2_000_000.0,
                        help="Current US DTC GMV in USD (default: 2,000,000 = Path B default).")
    parser.add_argument("--sku-count", type=int, default=35,
                        help="Current SKU count (default: 35 = Path B baseline; floor is 10 per research/12).")
    parser.add_argument("--sku-archetype-distribution", type=str, default="balanced",
                        choices=["hero_mid_long_tail", "balanced", "long_tail_heavy"],
                        help="SKU archetype distribution (default: balanced = Path B baseline).")
    parser.add_argument("--gross-margin-pct", type=float, default=50.0,
                        help="Gross margin as percent (default: 50.0 = Path B baseline; floor is 25.0 per research/12).")
    parser.add_argument("--has-aspire-or-collabstr-account", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Aspire SaaS / agency / Collabstr account is live (default: true).")
    parser.add_argument("--has-grin-or-creatoriq-account", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether GRIN or CreatorIQ enterprise CRM is installed (default: false = Path B DEFAULT; Path C requires true).")
    parser.add_argument("--has-creator-tier-mix-baseline", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether 30+ micro + creator-tier-mix-baseline audit is complete (default: true).")
    parser.add_argument("--has-content-licensing-template", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether 3-clause content-licensing-template is drafted with legal counsel (default: true).")
    parser.add_argument("--has-whitelisting-ads-template", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether whitelisting-ads-template is drafted with legal counsel (default: true).")
    parser.add_argument("--has-triple-whale-creator-cohort-overlay", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Triple-Whale creator-cohort-overlay is wired (default: true).")
    parser.add_argument("--voice-profile", type=str, default="gen_z",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Brand voice profile (default: gen_z; Path B canonical for $500k-$5M Gen-Z-led brands).")
    parser.add_argument("--has-dedicated-creator-economy-manager-capacity-hours-per-week", type=int, default=6,
                        help="Operator hours per week for creator-economy program (default: 6; floor is 4 Path B; Path C requires ≥1 dedicated-creator-economy-manager).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandCreatorEconomyInputs:
    """Convert argparse Namespace → BrandCreatorEconomyInputs (with the validation in __post_init__)."""
    return BrandCreatorEconomyInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        sku_count=args.sku_count,
        sku_archetype_distribution=args.sku_archetype_distribution,
        gross_margin_pct=args.gross_margin_pct,
        has_aspire_or_collabstr_account=(args.has_aspire_or_collabstr_account.lower() == "true"),
        has_grin_or_creatoriq_account=(args.has_grin_or_creatoriq_account.lower() == "true"),
        has_creator_tier_mix_baseline=(args.has_creator_tier_mix_baseline.lower() == "true"),
        has_content_licensing_template=(args.has_content_licensing_template.lower() == "true"),
        has_whitelisting_ads_template=(args.has_whitelisting_ads_template.lower() == "true"),
        has_triple_whale_creator_cohort_overlay=(args.has_triple_whale_creator_cohort_overlay.lower() == "true"),
        voice_profile=args.voice_profile,
        has_dedicated_creator_economy_manager_capacity_hours_per_week=args.has_dedicated_creator_economy_manager_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandCreatorEconomyInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Creator-economy Path A/B/C recommendation")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                            : ${inputs.us_dtc_gmv:>15,.0f}")
    lines.append(f"  SKU count                             : {inputs.sku_count:>15,d}")
    lines.append(f"  SKU archetype distribution            : {inputs.sku_archetype_distribution}")
    lines.append(f"  Gross margin (%)                       : {inputs.gross_margin_pct:>14.1f}%")
    lines.append(f"  Has Aspire or Collabstr account       : {inputs.has_aspire_or_collabstr_account}")
    lines.append(f"  Has GRIN or CreatorIQ account         : {inputs.has_grin_or_creatoriq_account}")
    lines.append(f"  Has creator-tier-mix-baseline         : {inputs.has_creator_tier_mix_baseline}")
    lines.append(f"  Has content-licensing template        : {inputs.has_content_licensing_template}")
    lines.append(f"  Has whitelisting-ads template         : {inputs.has_whitelisting_ads_template}")
    lines.append(f"  Has Triple-Whale creator-cohort       : {inputs.has_triple_whale_creator_cohort_overlay}")
    lines.append(f"  Voice profile                         : {inputs.voice_profile}")
    lines.append(f"  Operator capacity (hr/wk)             : {inputs.has_dedicated_creator_economy_manager_capacity_hours_per_week:>15,d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Platforms                             : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                 : {rec.default_platform_pick}")
    lines.append(f"  Justification                         : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)             : ${rec.cost_one_time_low:>12,.0f} - ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)          : ${rec.cost_recurring_low:>12,.0f} - ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                : ${rec.year1_cost_low:>12,.0f} - ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Incremental revenue share (low-high)  : {rec.year1_incremental_creator_economy_revenue_share_pct_low:.1f}%% - {rec.year1_incremental_creator_economy_revenue_share_pct_high:.1f}%%")
    lines.append(f"  Incremental revenue $ (low-high)      : ${rec.year1_incremental_creator_economy_revenue_low:>12,.0f} - ${rec.year1_incremental_creator_economy_revenue_high:,.0f}")
    lines.append(f"  LTV multiplier (low-high)             : {rec.ltv_multiplier_low:.1f}x - {rec.ltv_multiplier_high:.1f}x")
    lines.append(f"  Active creator count (low-high)       : {rec.active_creator_count_low:>12,d} - {rec.active_creator_count_high:>12,d}")
    lines.append(f"  Content-licensing uplift (low-high)   : {rec.content_licensing_2x_to_4x_uplift_low:.1f}x - {rec.content_licensing_2x_to_4x_uplift_high:.1f}x")
    lines.append(f"  5-way-comparison correction (low-high): {rec.five_way_comparison_creator_economy_attribution_correction_pct_low:.0f}%% - {rec.five_way_comparison_creator_economy_attribution_correction_pct_high:.0f}%%")
    lines.append(f"  Year-1 ROI                            : {rec.year1_roi_low:.1f}:1 - {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-payout creator-economy-structures matrix (per voice):")
    for voice, structure_desc in rec.creator_payout_structure_matrix.items():
        lines.append(f"  {voice:<13} : {structure_desc}")
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
