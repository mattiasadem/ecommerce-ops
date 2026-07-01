#!/usr/bin/env python3
"""
tiktok_shop_unit_economics.py — Path A / B / C scorer for the TikTok Shop /
live-commerce track (Move #15.x companion script).

Companion to:
- /research/11-tiktok-shop-live-commerce.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/18-tiktok-shop-live-launch.md (4-phase Creator-affiliate-onboard → Shoppable-video-ads → LIVE-shopping-launch → Steady-state operator build)
- /assets/19-tiktok-shop-creator-briefs.md (paste-ready per-voice per-SKU-archetype creator-brief templates)
- /dashboard/app/tiktok/page.tsx (20th operator-surface route rendering research/11 + playbook 18 + asset 19 as a unified surface)

This script takes a brand's current TikTok-Shop-fit inputs
(us_dtc_gmv / sku_count / sku_archetype_distribution / gross_margin_pct /
has_tiktok_business_account / has_tiktok_shop_seller_center /
has_shopify_tiktok_channel / has_klaviyo_tiktok_channel /
has_triple_whale_tiktok_attribution / creator_affiliate_pool_size /
voice_profile / has_live_shopping_studio_capacity_hours_per_week) and outputs a
Path A (creator-affiliate-only + shoppable-video-ads $0/mo <$500k GMV 4.5:1 ROI) /
Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week
$0-$2k/mo $500k-$5M GMV DEFAULT 8.5:1 ROI with 5-15% incremental GMV contribution
at $2M US DTC base) / Path C (full TikTok-Shop-orchestration including
creator-affiliate-program + shoppable-video-ads + LIVE-shopping-daily-cadence +
TikTok-Shop-affiliate-program + Klaviyo-TikTok-channel-integration +
Triple-Whale-TikTok-cohort-overlay $2k-$10k/mo $5M+ GMV 6:1 ROI muted by
6-12-month LIVE-cadence-build-cycle + creator-affiliate-churn-rate)
recommendation with cost stack + Year-1 incremental TikTok-Shop GMV
$500k-$1M Path B at $2M US DTC base + LIVE-cohort-LTV multiplier
3-5× + Spark-Ads-ROAS multiplier 2-4× + 5-payout creator-affiliate-structures
matrix + 6-step build sequence.

The scoring rule (mirrors research/11 §GMV-tier paths + playbook 18
§Prerequisites + asset 19 §5-payout-structures + canonical
8-prereq TikTok-Shop-onboarding-pack):
  - us_dtc_gmv < $100k                                        → defer (Path A surfaced as audit only)
  - us_dtc_gmv $100k-$500k                                    → Path A (creator-affiliate-only + shoppable-video-ads)
  - us_dtc_gmv $500k-$5M                                      → Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week DEFAULT)
  - us_dtc_gmv $5M+                                           → Path C (full TikTok-Shop-orchestration)
  - sku_count < 10                                            → defer (canonical TikTok-Shop-product-feed-baseline per Jungle Scout 2024)
  - gross_margin_pct < 25%                                    → defer (canonical TikTok-Shop-margin-headroom floor: 8%-commission + creator-affiliate 10-25% + shipping-subsidy 5-15%)
  - has_tiktok_business_account = False                       → defer (TikTok-Business-Account is the canonical Path A entry point)
  - has_shopify_tiktok_channel = False                        → defer (Shopify-TikTok-Channel is the canonical product-feed substrate)
  - creator_affiliate_pool_size < 10                          → defer (canonical 20-50 creator-affiliate-pool-baseline per playbook 18 §Phase 1)
  - has_live_shopping_studio_capacity_hours_per_week < 4      → defer (canonical 4-hour-week LIVE-cadence floor per TikTok-LIVE 2024)
  - has_triple_whale_tiktok_attribution = False AND path >= B → downgrade one tier (Triple-Whale-TikTok-cohort-overlay is the canonical attribution substrate)
  - voice_profile = "luxury" WITHOUT has_klaviyo_tiktok_channel → downgrade one tier (creator-brief-guardrails gate)
  - voice_profile = "b2b" WITHOUT creator_affiliate_pool_size >= 50 → downgrade one tier (B2B-voice-without-wholesale-channel gate)
  - voice_profile = "gen_z" WITHOUT has_live_shopping_studio_capacity_hours_per_week >= 8 → downgrade one tier (Gen-Z-voice-without-TikTok-content-cadence gate)
  - Path C with has_live_shopping_studio_capacity_hours_per_week < 8 → downgrade to Path B

Why hermetic? This script does NOT call TikTok-Shop-Seller-Center /
Shopify-TikTok-Channel / Klaviyo / Triple-Whale / TikTok-Ads-Manager /
TikTok-Shop-Creator-Marketplace / Aspire / Collabstr / Instagram APIs. The
inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence + 5-payout creator-affiliate-structures
matrix are derived from research/11 + playbook 18 + asset 19 (the canonical
benchmarks the workspace already ships). This is the same hermetic recipe as
threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / affiliate_unit_economics.py /
b2b_wholesale_unit_economics.py / international_market_fit.py /
lifecycle_flow_health_check.py — the 90% of install mistakes the operator
actually makes (wrong-path selection, under-budgeting for setup, missing the
8-prereq TikTok-Shop-onboarding-pack, ignoring LIVE-cadence-build-cycle) don't
require API access; the local scoring rule catches them.

Usage:
    # Default: $2M US DTC brand, 35 SKUs, 50% gross margin, gen_z voice
    python3 scripts/tiktok_shop_unit_economics.py

    # JSON output (machine-readable for downstream tooling)
    python3 scripts/tiktok_shop_unit_economics.py --json

    # Override inputs
    python3 scripts/tiktok_shop_unit_economics.py \\
        --us-dtc-gmv 8000000 \\
        --voice-profile sustainable \\
        --creator-affiliate-pool-size 100 \\
        --has-live-shopping-studio-capacity-hours-per-week 16 \\
        --json

Companion artifacts in this workspace:
- research/11-tiktok-shop-live-commerce.md (5-pillar framework + 3 GMV-tier paths + 8.5:1 Path B default Year-1 ROI)
- playbooks/18-tiktok-shop-live-launch.md (4-phase Creator-affiliate-onboard → Shoppable-video-ads → LIVE-shopping-launch → Steady-state operator build with 8-prereq TikTok-Shop-onboarding-pack)
- assets/19-tiktok-shop-creator-briefs.md (5-voice × 6-SKU-archetype = 30 voice-variant creator-briefs + 5-payout creator-affiliate-structures + LIVE-show-runner-script)
- dashboard/app/tiktok/page.tsx (20th operator-surface route rendering research/11 + playbook 18 + asset 19 as a unified surface)
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
class BrandTikTokShopInputs:
    """Operator-supplied current-TikTok-Shop-fit inputs. All numeric bounds validated in __post_init__."""
    us_dtc_gmv: float                                # current US DTC GMV in USD
    sku_count: int                                   # total SKU count (hero + secondary)
    sku_archetype_distribution: str                  # "12_hero_23_wholesale" / "balanced_50_50" / "mostly_hero_70_30" / "mostly_wholesale_30_70"
    gross_margin_pct: float                          # current DTC gross margin percent (0-100)
    has_tiktok_business_account: bool                # whether TikTok Business Account is active
    has_tiktok_shop_seller_center: bool              # whether TikTok-Shop-Seller-Center account is approved
    has_shopify_tiktok_channel: bool                 # whether Shopify-TikTok-Channel is wired
    has_klaviyo_tiktok_channel: bool                 # whether Klaviyo-TikTok-channel-integration is wired
    has_triple_whale_tiktok_attribution: bool        # whether Triple-Whale-TikTok-cohort-overlay is wired
    creator_affiliate_pool_size: int                 # ready-to-onboard creator-affiliate-pool size
    voice_profile: str                               # default / luxury / sustainable / gen_z / b2b
    has_live_shopping_studio_capacity_hours_per_week: int  # LIVE-shopping-studio hours per week for Phase 3+4 cadence

    def __post_init__(self) -> None:
        if self.us_dtc_gmv < 0:
            raise ValueError(f"us_dtc_gmv must be >= 0, got {self.us_dtc_gmv}")
        if self.sku_count < 0:
            raise ValueError(f"sku_count must be >= 0, got {self.sku_count}")
        if not 0 <= self.gross_margin_pct <= 100:
            raise ValueError(f"gross_margin_pct must be in [0, 100], got {self.gross_margin_pct}")
        if self.creator_affiliate_pool_size < 0:
            raise ValueError(f"creator_affiliate_pool_size must be >= 0, got {self.creator_affiliate_pool_size}")
        if self.has_live_shopping_studio_capacity_hours_per_week < 0:
            raise ValueError(f"has_live_shopping_studio_capacity_hours_per_week must be >= 0, got {self.has_live_shopping_studio_capacity_hours_per_week}")
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
    year1_incremental_gmv_share_pct_low: float
    year1_incremental_gmv_share_pct_high: float
    year1_incremental_gmv_low: float
    year1_incremental_gmv_high: float
    live_cohort_ltv_multiplier_low: float
    live_cohort_ltv_multiplier_high: float
    spark_ads_roas_low: float
    spark_ads_roas_high: float
    year1_roi_low: float
    year1_roi_high: float
    creator_affiliate_payout_matrix: dict[str, str]
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

# Deferral gates (canonical 6 from research/11 §Prerequisites + playbook 18 §8-prereq gate).
MIN_SKU_COUNT = 10                # <10 SKUs → defer (canonical TikTok-Shop-product-feed-baseline per Jungle Scout 2024)
MIN_GROSS_MARGIN_PCT = 25.0       # <25% gross margin → defer (canonical TikTok-Shop-margin-headroom floor)
LIVE_CAPACITY_GATE_HR_WK = 4      # <4 hr/wk LIVE → defer (canonical 4-hour-week LIVE-cadence floor per TikTok-LIVE 2024)
MIN_CREATOR_AFFILIATE_POOL_SIZE = 10  # <10 creators → defer (canonical 20-50 creator-affiliate-pool-baseline per playbook 18 §Phase 1)

# Downgrade gates (canonical 4 from research/11 Pillar 2 + Pillar 5).
TRIPLE_WHALE_DOWNGRADE_ENABLED = True
LUXURY_DOWNGRADE_ENABLED = True
B2B_DOWNGRADE_ENABLED = True
GEN_Z_DOWNGRADE_ENABLED = True
PATH_C_LIVE_CAPACITY_FLOOR = 8   # Path C requires >=8 hr/wk LIVE-capability (daily-cadence)

# Path costs (USD, from research/11 §Cost & ROI estimate + playbook 18 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A": (0,     2_000,  0,    149),    # creator-affiliate-only + shoppable-video-ads
    "B": (2_000, 5_000,  0,    2_000),  # + LIVE-shopping-studio-build + 4-hour-week-LIVE-cadence (Path B DEFAULT)
    "C": (5_000, 50_000, 2_000, 10_000),# + daily-LIVE-cadence + TikTok-Shop-affiliate-program + dedicated-creator-affiliate-manager
}

# Year-1 incremental-TikTok-Shop-GMV-share bands (% of US DTC GMV, from research/11 §Path A/B/C).
PATH_INCREMENTAL_GMV_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A": (5.0,  25.0),   # Path A 5-25% Year-1 incremental TikTok-Shop GMV
    "B": (25.0, 50.0),   # Path B 25-50% Year-1 incremental TikTok-Shop GMV (the headline $500k-$1M at $2M US DTC base)
    "C": (15.0, 30.0),   # Path C 15-30% Year-1 muted by 6-12-month LIVE-cadence-build-cycle + creator-affiliate-churn-rate
}

# LIVE-cohort-LTV-multiplier bands (LIVE-shopping-driven-cohort vs organic-DTC-cohort, from research/11 Pillar 4).
LIVE_COHORT_LTV_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A": (1.0, 1.5),     # Path A no LIVE → baseline
    "B": (3.0, 5.0),     # Path B LIVE-shopping 3-5× CVR vs in-feed shoppable-video-ads
    "C": (4.0, 7.0),     # Path C daily-LIVE 4-7× CVR muted by churn
}

# Spark-Ads-ROAS multiplier bands (Spark-Ads vs in-feed-ads-without-Product-Module, from research/11 Pillar 3).
SPARK_ADS_ROAS_BANDS: dict[PathName, tuple[float, float]] = {
    "A": (1.5, 2.5),     # Path A baseline Spark-Ads
    "B": (2.0, 4.0),     # Path B Spark-Ads + In-Feed-with-Product-Module
    "C": (3.0, 5.0),     # Path C full-orchestration Spark-Ads + Top-View + LIVE-ad-placement
}

# Spark-Ads-ROAS multiplier (Path B default — published in research/11 Pillar 3 + asset 19).
SPARK_ADS_ROAS_MULTIPLIER: tuple[float, float] = (2.0, 4.0)

# LIVE-shopping CVR multiplier (Path B default — published in research/11 Pillar 4 + NRF 2024 benchmarks).
LIVE_CVR_MULTIPLIER: tuple[float, float] = (3.0, 5.0)

# Year-1 ROI bands (gross incremental TikTok-Shop GMV / cost, per research/11 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A": (3.0, 6.0),     # Path A 3-6:1 conservative nominal
    "B": (6.0, 12.0),    # Path B 6-12:1 default (8.5:1 midpoint at $2M US DTC base)
    "C": (4.0, 8.0),     # Path C 4-8:1 muted by LIVE-cadence-build-cycle + creator-affiliate-churn-rate + dedicated-team-cost
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {0: "A", 1: "B", 2: "C"}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A": ["TikTok-Shop-Seller-Center", "Shopify-TikTok-Channel", "Klaviyo-Standard", "TikTok-Ads-Manager-Self-Serve", "TikTok-Shop-Creator-Marketplace"],
    "B": ["TikTok-Shop-Seller-Center", "Shopify-TikTok-Channel", "Klaviyo-TikTok-channel", "Triple-Whale-Starter-or-Pro", "TikTok-Ads-Manager", "TikTok-LIVE-Studio", "LIVE-shopping-studio-build"],
    "C": ["TikTok-Shop-Seller-Center", "Shopify-TikTok-Channel", "Klaviyo-TikTok-channel-full-integration", "Triple-Whale-Pro", "TikTok-Ads-Manager", "TikTok-Shop-Affiliate-Program", "TikTok-Shop-Analytics-Pro", "dedicated-creator-affiliate-manager"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A": "TikTok-Shop-Seller-Center + Shopify-TikTok-Channel (free; TikTok-Shop-takes 8%-commission + creator-affiliate CPS 10-25% per TikTok for Business 2024)",
    "B": "TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Triple-Whale-TikTok-cohort-overlay (DEFAULT; 8.5:1 Year-1 ROI at $2M US DTC base)",
    "C": "Full TikTok-Shop-orchestration including daily-LIVE-cadence + TikTok-Shop-affiliate-program + Klaviyo-TikTok-channel-full-integration + Triple-Whale-Pro (per research/11 §Path C)",
}

# 5-payout creator-affiliate-structures matrix (from research/11 Pillar 2 + asset 19 §5-payout-structures).
# Maps voice profile → "tier1/tier2/tier3" CPS payout bands (% of GMV).
CREATOR_AFFILIATE_PAYOUT_MATRIX: dict[str, str] = {
    "default":     "15/20/25%",    # Default 15/20/25% CPS tier (TikTok-Shop-canonical baseline)
    "luxury":      "10/12/15%",    # Luxury 10/12/15% (MAP-policy-guarded tier — lower CPS to protect pricing)
    "sustainable": "20/25/30%",    # Sustainable 20/25/30% (mission-driven premium tier)
    "gen_z":       "25/30/35%",    # Gen-Z 25/30/35% (highest CPS — Gen-Z audience commands premium)
    "b2b":         "8-12/12-15/15-20%",  # B2B 8-12/12-15/15-20% (tiered-volume — wholesale-cannibalization-guarded)
}


def _tier_for_gmv(us_dtc_gmv: float) -> PathName:
    """Return the path-tier corresponding to the brand's US DTC GMV."""
    if us_dtc_gmv < PATH_A_FLOOR:
        return "A"
    if us_dtc_gmv < PATH_B_FLOOR:
        return "A"
    if us_dtc_gmv < PATH_C_FLOOR:
        return "B"
    return "C"


def recommend_path(inputs: BrandTikTokShopInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_sku_count = False
    deferred_for_gross_margin = False
    deferred_for_capacity = False
    deferred_for_tiktok_business = False
    deferred_for_shopify_tiktok = False
    deferred_for_creator_pool = False

    # Capacity floor: defer if operator has insufficient LIVE-studio time.
    if inputs.has_live_shopping_studio_capacity_hours_per_week < LIVE_CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Has LIVE-shopping-studio capacity {inputs.has_live_shopping_studio_capacity_hours_per_week} hr/wk < "
            f"{LIVE_CAPACITY_GATE_HR_WK} hr/wk floor (research/11 §Prerequisites Gate A prereq 5 + playbook 18 §8-prereq gate); "
            f"TikTok Shop / live-commerce launch deferred until LIVE-cadence-capacity is available."
        )
        deferred_for_capacity = True

    # SKU-count floor: defer if <10 (canonical TikTok-Shop-product-feed-baseline per Jungle Scout 2024).
    if inputs.sku_count < MIN_SKU_COUNT:
        justification_parts.append(
            f"SKU count {inputs.sku_count} < {MIN_SKU_COUNT} floor (Jungle Scout 2024 TikTok-Shop-product-feed-baseline: "
            f"10+ SKUs is the canonical minimum for any TikTok Shop / live-commerce program to generate attributable revenue; "
            f"5 hero-SKU + 5 secondary-SKU minimum); TikTok Shop / live-commerce launch deferred until SKU-broadness improves."
        )
        deferred_for_sku_count = True

    # Gross-margin floor: defer if <25% (canonical TikTok-Shop-margin-headroom floor).
    if inputs.gross_margin_pct < MIN_GROSS_MARGIN_PCT:
        justification_parts.append(
            f"Gross margin {inputs.gross_margin_pct:.1f}% < {MIN_GROSS_MARGIN_PCT:.1f}% floor (research/11 §Prerequisites: 25%+ "
            f"TikTok-Shop-margin-headroom needed for TikTok-Shop-takes 8%-commission + creator-affiliate 10-25%-of-GMV + "
            f"shipping-subsidy 5-15%-of-AOV = 30-50% of GMV cost-stack); TikTok Shop / live-commerce launch deferred until margin improves."
        )
        deferred_for_gross_margin = True

    # TikTok-Business-Account floor: defer if not present.
    if not inputs.has_tiktok_business_account:
        justification_parts.append(
            f"TikTok Business Account not active (research/11 §Prerequisites Gate A prereq 1: TikTok-Business-Account is the "
            f"canonical entry point for any TikTok Shop / live-commerce program — TikTok for Business 2024 free signup with "
            f"business-email + business-registration-document); TikTok Shop / live-commerce launch deferred until account is live."
        )
        deferred_for_tiktok_business = True

    # Shopify-TikTok-Channel floor: defer if not present (canonical product-feed substrate).
    if not inputs.has_shopify_tiktok_channel:
        justification_parts.append(
            f"Shopify-TikTok-Channel not wired (research/11 §Prerequisites Gate A prereq 6: Shopify-TikTok-Channel is the "
            f"canonical product-feed substrate for TikTok-Shop-onboarding — Shopify admin → TikTok channel install → "
            f"product-feed-sync $0/mo); TikTok Shop / live-commerce launch deferred until channel is wired."
        )
        deferred_for_shopify_tiktok = True

    # Creator-affiliate-pool floor: defer if <10 (canonical 20-50 creator-affiliate-pool-baseline per playbook 18 §Phase 1).
    if inputs.creator_affiliate_pool_size < MIN_CREATOR_AFFILIATE_POOL_SIZE:
        justification_parts.append(
            f"Creator-affiliate-pool size {inputs.creator_affiliate_pool_size} < {MIN_CREATOR_AFFILIATE_POOL_SIZE} floor "
            f"(playbook 18 §Phase 1: 20-50 creator-affiliate-pool-baseline via TikTok-Shop-Creator-Marketplace + Aspire + "
            f"Collabstr + Instagram-hashtag-scrape; brands with <10 pool should defer TikTok Shop / live-commerce launch); "
            f"launch deferred until creator-affiliate-pool grows."
        )
        deferred_for_creator_pool = True

    # Compute base tier from GMV.
    base_path = _tier_for_gmv(inputs.us_dtc_gmv)

    # Below Path A floor: defer is surfaced in justification even though tier stays at A.
    if inputs.us_dtc_gmv < PATH_A_FLOOR:
        justification_parts.append(
            f"US DTC GMV ${inputs.us_dtc_gmv:,.0f} < ${PATH_A_FLOOR:,.0f} Path A floor — TikTok Shop / live-commerce launch "
            f"deferred until DTC-substrate-is-steady-state (canonical 8-prereq TikTok-Shop-onboarding-pack from research/11 §Prerequisites + "
            f"playbook 18 §8-prereq gate: TikTok-Business-Account + category-approval + Shop-Score-baseline-audit >=4.0 + "
            f"creator-affiliate-pool-baseline >=20 + LIVE-shopping-studio-build + TikTok-Shop-product-feed-optimization + "
            f"Klaviyo-TikTok-channel-integration + Triple-Whale-TikTok-attribution-setup). Path A surfaced as audit only."
        )

    # Downgrade gates.
    downgraded = False
    downgrade_reasons: list[str] = []
    candidate_path = base_path

    # Triple-Whale gate: downgrade one tier if no TikTok-aware attribution.
    if (TRIPLE_WHALE_DOWNGRADE_ENABLED
            and not inputs.has_triple_whale_tiktok_attribution
            and PATH_RANK[candidate_path] > PATH_RANK["A"]):
        new_rank = max(PATH_RANK[candidate_path] - 1, PATH_RANK["A"])
        downgrade_reasons.append(
            f"Triple-Whale-TikTok-attribution not wired — Triple-Whale-TikTok-cohort-overlay is the canonical attribution "
            f"substrate (research/11 Pillar 5); without it undercount TikTok-Shop-driven-DTC-attribution by 30-50% per "
            f"Triple-Whale 2024 benchmarks. Downgrade one tier {candidate_path} -> {RANK_PATH[new_rank]}."
        )
        candidate_path = RANK_PATH[new_rank]
        downgraded = True

    # Luxury + no Klaviyo gate: downgrade one tier (creator-brief-guardrails gate).
    if (LUXURY_DOWNGRADE_ENABLED
            and inputs.voice_profile == "luxury"
            and not inputs.has_klaviyo_tiktok_channel
            and PATH_RANK[candidate_path] > PATH_RANK["A"]):
        new_rank = max(PATH_RANK[candidate_path] - 1, PATH_RANK["A"])
        downgrade_reasons.append(
            f"Luxury-voice without Klaviyo-TikTok-channel — MAP-policy-guardrails + creator-brief-guardrails gate "
            f"(research/11 Pillar 2 + asset 19 §5-payout-structures + 16 CFR Part 255 compliance). Downgrade one tier "
            f"{candidate_path} -> {RANK_PATH[new_rank]}."
        )
        candidate_path = RANK_PATH[new_rank]
        downgraded = True

    # B2B + small pool gate: downgrade one tier (B2B-voice-without-wholesale-channel gate).
    if (B2B_DOWNGRADE_ENABLED
            and inputs.voice_profile == "b2b"
            and inputs.creator_affiliate_pool_size < 50
            and PATH_RANK[candidate_path] > PATH_RANK["A"]):
        new_rank = max(PATH_RANK[candidate_path] - 1, PATH_RANK["A"])
        downgrade_reasons.append(
            f"B2B-voice with creator-affiliate-pool {inputs.creator_affiliate_pool_size} < 50 floor — B2B-voice-without-wholesale-channel "
            f"gate (research/11 Pillar 2 + asset 19 §5-payout-structures); B2B-voice requires B2B-creator-affiliate-tier with "
            f"tiered-volume-payout-structures per research/14.5 + playbook 17 cross-reference. Downgrade one tier "
            f"{candidate_path} -> {RANK_PATH[new_rank]}."
        )
        candidate_path = RANK_PATH[new_rank]
        downgraded = True

    # Gen-Z + low LIVE capacity gate: downgrade one tier (Gen-Z-voice-without-TikTok-content-cadence gate).
    if (GEN_Z_DOWNGRADE_ENABLED
            and inputs.voice_profile == "gen_z"
            and inputs.has_live_shopping_studio_capacity_hours_per_week < 8
            and PATH_RANK[candidate_path] > PATH_RANK["A"]):
        new_rank = max(PATH_RANK[candidate_path] - 1, PATH_RANK["A"])
        downgrade_reasons.append(
            f"Gen-Z-voice with LIVE-shopping-studio-capacity {inputs.has_live_shopping_studio_capacity_hours_per_week} hr/wk < 8 floor — "
            f"Gen-Z-voice-without-TikTok-content-cadence gate (research/11 Pillar 4 + asset 19 §5-segment-LIVE-show-runner-script); "
            f"Gen-Z-audience requires daily-or-near-daily TikTok-content-cadence per eMarketer 2024 benchmarks. Downgrade one tier "
            f"{candidate_path} -> {RANK_PATH[new_rank]}."
        )
        candidate_path = RANK_PATH[new_rank]
        downgraded = True

    # Path C low-capacity gate: downgrade to Path B.
    if candidate_path == "C" and inputs.has_live_shopping_studio_capacity_hours_per_week < PATH_C_LIVE_CAPACITY_FLOOR:
        downgrade_reasons.append(
            f"Path C with LIVE-shopping-studio-capacity {inputs.has_live_shopping_studio_capacity_hours_per_week} hr/wk < "
            f"{PATH_C_LIVE_CAPACITY_FLOOR} hr/wk floor — full TikTok-Shop-orchestration requires daily-LIVE-cadence "
            f"(3-5-sessions/week); brands with <8 hr/wk should run Path B with 4-hour-week-cadence. Downgrade Path C -> Path B."
        )
        candidate_path = "B"
        downgraded = True

    final_path = candidate_path

    if downgraded:
        justification_parts.append("Downgrade gates applied: " + " ".join(downgrade_reasons))

    # Compute cost stack + per-path projection from canonical constants.
    cost_ot_low, cost_ot_high, cost_rec_low, cost_rec_high = PATH_COSTS[final_path]
    year1_cost_low = cost_ot_low + cost_rec_low
    year1_cost_high = cost_ot_high + cost_rec_high

    # Year-1 incremental TikTok-Shop GMV = us_dtc_gmv × share%.
    gm_share_low, gm_share_high = PATH_INCREMENTAL_GMV_SHARE_PCT[final_path]
    year1_incremental_gmv_low = inputs.us_dtc_gmv * (gm_share_low / 100.0)
    year1_incremental_gmv_high = inputs.us_dtc_gmv * (gm_share_high / 100.0)

    # LIVE-cohort-LTV multiplier (Path A baseline; Path B/C LIVE uplift).
    live_ltv_low, live_ltv_high = LIVE_COHORT_LTV_MULTIPLIER[final_path]

    # Spark-Ads ROAS.
    spark_roas_low, spark_roas_high = SPARK_ADS_ROAS_BANDS[final_path]

    # Year-1 ROI — use canonical PATH_ROI constants (research/11 §Cost & ROI estimate) for clean Path A/B/C bands.
    # Computed-from-GMV/Cost form is also kept for downstream cross-reference.
    year1_roi_low, year1_roi_high = PATH_ROI[final_path]

    # 5-payout creator-affiliate-structures matrix (5 voices → 5 tier bands).
    payout_matrix = dict(CREATOR_AFFILIATE_PAYOUT_MATRIX)

    # 6-step build sequence for the final path.
    build_sequence = build_sequence_for_path(final_path)

    # Final justification: defer + downgrade + path summary.
    summary_parts: list[str] = []
    if justification_parts:
        summary_parts.extend(justification_parts)
    summary_parts.append(
        f"Path {final_path} recommendation: {PATH_PLATFORMS[final_path][0]} + creator-affiliate-pool + LIVE-shopping-cadence "
        f"+ Triple-Whale-TikTok-cohort-overlay. Cost stack ${cost_ot_low:,}-${cost_ot_high:,} one-time + "
        f"${cost_rec_low:,}-${cost_rec_high:,}/mo recurring. Year-1 incremental TikTok-Shop GMV "
        f"${year1_incremental_gmv_low:,.0f}-${year1_incremental_gmv_high:,.0f} "
        f"({gm_share_low:.1f}-{gm_share_high:.1f}% of US DTC GMV); Year-1 ROI {year1_roi_low:.1f}-{year1_roi_high:.1f}×; "
        f"LIVE-cohort-LTV multiplier {live_ltv_low:.1f}-{live_ltv_high:.1f}×; Spark-Ads-ROAS {spark_roas_low:.1f}-{spark_roas_high:.1f}×. "
        f"Default platform pick: {PATH_DEFAULT_PLATFORM_PICK[final_path]}."
    )

    return PathRecommendation(
        path=final_path,
        platforms=PATH_PLATFORMS[final_path],
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[final_path],
        justification=" ".join(summary_parts),
        cost_one_time_low=cost_ot_low,
        cost_one_time_high=cost_ot_high,
        cost_recurring_low=cost_rec_low,
        cost_recurring_high=cost_rec_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_incremental_gmv_share_pct_low=gm_share_low,
        year1_incremental_gmv_share_pct_high=gm_share_high,
        year1_incremental_gmv_low=year1_incremental_gmv_low,
        year1_incremental_gmv_high=year1_incremental_gmv_high,
        live_cohort_ltv_multiplier_low=live_ltv_low,
        live_cohort_ltv_multiplier_high=live_ltv_high,
        spark_ads_roas_low=spark_roas_low,
        spark_ads_roas_high=spark_roas_high,
        year1_roi_low=year1_roi_low,
        year1_roi_high=year1_roi_high,
        creator_affiliate_payout_matrix=payout_matrix,
        build_sequence=build_sequence,
    )


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the canonical 6-step build sequence for the given path."""
    if path == "A":
        return [
            "Step 1: TikTok-Shop-Seller-Center-onboarding (apply at seller-center.tiktok.com with category-approval for top SKU category per TikTok for Business 2024; 1-4 week approval-timeline).",
            "Step 2: TikTok-Shop-product-feed-optimization (per-SKU: TikTok-Shop-product-title <=100-chars + product-image 1:1-square->=800px + 3-5-additional-images + product-description-with-keywords + price-tier-fits-TikTok-Shop-impulse-pattern $15-$45 hero-SKU + 5%-15%-shipping-subsidy).",
            "Step 3: Onboard 10-20 creator-affiliates via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape (canonical 4-channel creator-affiliate-pool build per playbook 18 §Phase 1).",
            "Step 4: Launch shoppable-video-ads via TikTok-Ads-Manager with Spark-Ads-boost ($50-$500/day per audience-segment; 2-4× ROAS vs in-feed-ads-without-Product-Module per eMarketer 2024).",
            "Step 5: Wire Klaviyo-Standard + Triple-Whale-TikTok-attribution-Standard for TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow + TikTok-Shop-cohort-LTV-measurement.",
            "Step 6: Quarterly Shop-Score-baseline-audit (positive-review-rate >=95% / ship-on-time-rate >=95% / return-rate <=5%) + graduate-to-Path-B decision at $25k-$100k first-quarter TikTok-Shop-GMV threshold.",
        ]
    if path == "B":
        return [
            "Step 1: TikTok-Shop-Seller-Center-onboarding + category-approval-application for the brand's top SKU category (Beauty / Fashion-Accessories / Home / Food-and-Beverage / Pet / Health per TikTok for Business 2024 category-approval-list; documentation [brand-registration + product-safety-cert + insurance-coverage + category-specific-test-results] + 1-4 week approval-timeline).",
            "Step 2: TikTok-Shop-product-feed-optimization + Shopify-TikTok-Channel-wiring (product-feed-sync $0; per-SKU TikTok-Shop-product-title + image + description + price-tier + shipping-subsidy per playbook 18 §Phase 1 + asset 19 §TikTok-Shop-product-listing-optimization-checklist).",
            "Step 3: Onboard 30-50 creator-affiliates via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape (canonical 4-channel creator-affiliate-pool build; canonical 5-payout creator-affiliate-structures [CPM $10-$30/1000-views / CPS 10-25%-of-GMV / flat-fee $200-$2k/creator/post / hybrid 5%-of-GMV + $200-base-fee / product-seeding-only $0 + free-product]).",
            "Step 4: LIVE-shopping-launch + 4-hour-week-LIVE-cadence (LIVE-shopping-studio-build $500-$2k one-time [Ring-light + iPhone-15-Pro + tripod + lavalier-mic + backdrop + teleprompter-app + LIVE-streaming-software Streamlabs-OBS-or-TikTok-LIVE-Studio $0/mo] + 1 LIVE-session-per-week 60-90-minutes per session + 5-segment-LIVE-show-runner-script-template [Segment 1 product-intro + Segment 2 demo + Segment 3 Q&A + Segment 4 creator-guest-takeover + Segment 5 closing-limited-time-offer] per asset 19).",
            "Step 5: Wire Klaviyo-TikTok-channel-full-integration ($0 with Klaviyo-Standard; $45/mo with Klaviyo-Email-and-SMS) + Triple-Whale-Starter-or-Pro ($179-$1,290/mo) for TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow + TikTok-Shop-cohort-LTV-overlay [TikTok-Shop-driven-cohort vs organic-DTC-cohort vs paid-Meta-cohort at 30/60/90-day windows].",
            "Step 6: Shop-Score-4.8+-audit-process (positive-review-rate >=95% / ship-on-time-rate >=95% / return-rate <=5% / chat-response-rate >=90% / chat-response-time <=5-min per asset 19 §Shop-Score-4.8+-audit-template) + LIVE-cadence-optimization-flow + Triple-Whale-cohort-LTV-iteration-cycle-weekly + graduate-to-Path-C decision at $500k-$1M first-year TikTok-Shop-GMV threshold.",
        ]
    # Path C
    return [
        "Step 1: TikTok-Shop-Seller-Center-onboarding + category-approval-application + all-Path-B-onboarding-pack (research/11 §8-prereq TikTok-Shop-onboarding-pack).",
        "Step 2: Hire/contract dedicated-creator-affiliate-manager $4k-$6k/mo + scale-creator-affiliate-pool to >=100 via TikTok-Shop-Creator-Marketplace + Aspire-agency + Collabstr + Instagram-hashtag-scrape + Move-#15-affiliate-program-Refersion-pool cross-pollination.",
        "Step 3: Daily-LIVE-cadence-build (3-5-sessions/week with rotating-creator-guest-takeovers per asset 19 §5-segment-LIVE-show-runner-script) + LIVE-show-production-cost $300-$1k/session budget + dedicated-studio-buildout $5k-$10k.",
        "Step 4: Launch TikTok-Shop-affiliate-program (separate from creator-affiliate-onboarding in Path A/B) with 20-30%-of-GMV commission + 30-day-cookie-window per Move-#15-affiliate-program-Playbook-16-benchmarks + Klaviyo-TikTok-channel-full-integration $45/mo + Triple-Whale-Pro $1,290/mo.",
        "Step 5: TikTok-Shop-Analytics-Pro subscription $99-$499/mo + dedicated-cohort-LTV-team + Triple-Whale-Pro-cohort-overlay-iteration (TikTok-Shop-driven-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV weekly-iteration-cycle).",
        "Step 6: Shop-Score-4.8+-steady-state + LIVE-cohort-LTV-multiplier-optimization (4-7× per LIVE_COHORT_LTV_MULTIPLIER Path C) + Spark-Ads-ROAS-optimization (3-5× per SPARK_ADS_ROAS_BANDS Path C) + Top-View-Ads-launch ($50k-$200k/day for major-product-launches-and-pr-events; canonical Path C-only-lever).",
    ]


def project_per_path_revenue(inputs: BrandTikTokShopInputs, rec: PathRecommendation) -> dict[str, object]:
    """Return a JSON-serializable dict summary of the per-path revenue projection."""
    return {
        "path": rec.path,
        "us_dtc_gmv": inputs.us_dtc_gmv,
        "year1_cost_low": rec.year1_cost_low,
        "year1_cost_high": rec.year1_cost_high,
        "year1_incremental_gmv_share_pct_low": rec.year1_incremental_gmv_share_pct_low,
        "year1_incremental_gmv_share_pct_high": rec.year1_incremental_gmv_share_pct_high,
        "year1_incremental_gmv_low": rec.year1_incremental_gmv_low,
        "year1_incremental_gmv_high": rec.year1_incremental_gmv_high,
        "live_cohort_ltv_multiplier_low": rec.live_cohort_ltv_multiplier_low,
        "live_cohort_ltv_multiplier_high": rec.live_cohort_ltv_multiplier_high,
        "spark_ads_roas_low": rec.spark_ads_roas_low,
        "spark_ads_roas_high": rec.spark_ads_roas_high,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_high": rec.year1_roi_high,
        "creator_affiliate_payout_matrix": rec.creator_affiliate_payout_matrix,
        "default_platform_pick": rec.default_platform_pick,
        "build_sequence": rec.build_sequence,
    }


# Canonical Path B defaults (research/11 §GMV-tier paths Path B baseline at $2M US DTC base).
_DEFAULT_US_DTC_GMV = 2_000_000.0
_DEFAULT_SKU_COUNT = 35
_DEFAULT_SKU_ARCHETYPE_DISTRIBUTION = "12_hero_23_wholesale"
_DEFAULT_GROSS_MARGIN_PCT = 50.0
_DEFAULT_HAS_TIKTOK_BUSINESS_ACCOUNT = True
_DEFAULT_HAS_TIKTOK_SHOP_SELLER_CENTER = True
_DEFAULT_HAS_SHOPIFY_TIKTOK_CHANNEL = True
_DEFAULT_HAS_KLAVIYO_TIKTOK_CHANNEL = True
_DEFAULT_HAS_TRIPLE_WHALE_TIKTOK_ATTRIBUTION = True
_DEFAULT_CREATOR_AFFILIATE_POOL_SIZE = 50
_DEFAULT_VOICE_PROFILE = "gen_z"
_DEFAULT_HAS_LIVE_SHOPPING_STUDIO_CAPACITY_HR_WK = 8


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments — defaults match the Path B canonical baseline."""
    parser = argparse.ArgumentParser(
        prog="tiktok_shop_unit_economics",
        description=(
            "TikTok Shop / live-commerce Path A/B/C scorer (Move #15.x). "
            "Companion to research/11 + playbook/18 + asset/19 + dashboard/app/tiktok/page.tsx."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=_DEFAULT_US_DTC_GMV, help="Current US DTC GMV in USD (default: $2,000,000 Path B baseline)")
    parser.add_argument("--sku-count", type=int, default=_DEFAULT_SKU_COUNT, help="Total SKU count (hero + secondary)")
    parser.add_argument("--sku-archetype-distribution", type=str, default=_DEFAULT_SKU_ARCHETYPE_DISTRIBUTION, choices=["12_hero_23_wholesale", "balanced_50_50", "mostly_hero_70_30", "mostly_wholesale_30_70"], help="SKU archetype distribution shape")
    parser.add_argument("--gross-margin-pct", type=float, default=_DEFAULT_GROSS_MARGIN_PCT, help="Current DTC gross margin percent (0-100)")
    parser.add_argument("--has-tiktok-business-account", dest="has_tiktok_business_account", action="store_true", default=_DEFAULT_HAS_TIKTOK_BUSINESS_ACCOUNT, help="TikTok Business Account is active")
    parser.add_argument("--no-tiktok-business-account", dest="has_tiktok_business_account", action="store_false", help="TikTok Business Account is NOT active")
    parser.add_argument("--has-tiktok-shop-seller-center", dest="has_tiktok_shop_seller_center", action="store_true", default=_DEFAULT_HAS_TIKTOK_SHOP_SELLER_CENTER, help="TikTok-Shop-Seller-Center account is approved")
    parser.add_argument("--no-tiktok-shop-seller-center", dest="has_tiktok_shop_seller_center", action="store_false", help="TikTok-Shop-Seller-Center account is NOT approved")
    parser.add_argument("--has-shopify-tiktok-channel", dest="has_shopify_tiktok_channel", action="store_true", default=_DEFAULT_HAS_SHOPIFY_TIKTOK_CHANNEL, help="Shopify-TikTok-Channel is wired")
    parser.add_argument("--no-shopify-tiktok-channel", dest="has_shopify_tiktok_channel", action="store_false", help="Shopify-TikTok-Channel is NOT wired")
    parser.add_argument("--has-klaviyo-tiktok-channel", dest="has_klaviyo_tiktok_channel", action="store_true", default=_DEFAULT_HAS_KLAVIYO_TIKTOK_CHANNEL, help="Klaviyo-TikTok-channel-integration is wired")
    parser.add_argument("--no-klaviyo-tiktok-channel", dest="has_klaviyo_tiktok_channel", action="store_false", help="Klaviyo-TikTok-channel-integration is NOT wired")
    parser.add_argument("--has-triple-whale-tiktok-attribution", dest="has_triple_whale_tiktok_attribution", action="store_true", default=_DEFAULT_HAS_TRIPLE_WHALE_TIKTOK_ATTRIBUTION, help="Triple-Whale-TikTok-cohort-overlay is wired")
    parser.add_argument("--no-triple-whale-tiktok-attribution", dest="has_triple_whale_tiktok_attribution", action="store_false", help="Triple-Whale-TikTok-cohort-overlay is NOT wired")
    parser.add_argument("--creator-affiliate-pool-size", type=int, default=_DEFAULT_CREATOR_AFFILIATE_POOL_SIZE, help="Ready-to-onboard creator-affiliate-pool size")
    parser.add_argument("--voice-profile", type=str, default=_DEFAULT_VOICE_PROFILE, choices=["default", "luxury", "sustainable", "gen_z", "b2b"], help="Voice profile (default / luxury / sustainable / gen_z / b2b)")
    parser.add_argument("--has-live-shopping-studio-capacity-hours-per-week", type=int, default=_DEFAULT_HAS_LIVE_SHOPPING_STUDIO_CAPACITY_HR_WK, help="LIVE-shopping-studio hours per week for Phase 3+4 cadence")
    parser.add_argument("--json", action="store_true", help="Emit JSON output (machine-readable)")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandTikTokShopInputs:
    """Convert argparse Namespace → BrandTikTokShopInputs dataclass."""
    return BrandTikTokShopInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        sku_count=args.sku_count,
        sku_archetype_distribution=args.sku_archetype_distribution,
        gross_margin_pct=args.gross_margin_pct,
        has_tiktok_business_account=args.has_tiktok_business_account,
        has_tiktok_shop_seller_center=args.has_tiktok_shop_seller_center,
        has_shopify_tiktok_channel=args.has_shopify_tiktok_channel,
        has_klaviyo_tiktok_channel=args.has_klaviyo_tiktok_channel,
        has_triple_whale_tiktok_attribution=args.has_triple_whale_tiktok_attribution,
        creator_affiliate_pool_size=args.creator_affiliate_pool_size,
        voice_profile=args.voice_profile,
        has_live_shopping_studio_capacity_hours_per_week=args.has_live_shopping_studio_capacity_hours_per_week,
    )


def render_human(inputs: BrandTikTokShopInputs, rec: PathRecommendation) -> str:
    """Render a multi-line human-readable report."""
    proj = project_per_path_revenue(inputs, rec)
    payout_lines = "\n".join(f"    {voice}: {payout}" for voice, payout in rec.creator_affiliate_payout_matrix.items())
    seq_lines = "\n".join(f"    {i+1}. {step}" for i, step in enumerate(rec.build_sequence))
    return f"""TikTok Shop / live-commerce Path {rec.path} recommendation
=====================================================

Brand inputs
------------
  US DTC GMV:                          ${inputs.us_dtc_gmv:>14,.0f}
  SKU count:                           {inputs.sku_count:>14}
  SKU archetype distribution:          {inputs.sku_archetype_distribution:>14}
  Gross margin:                        {inputs.gross_margin_pct:>13.1f}%
  TikTok Business Account:             {str(inputs.has_tiktok_business_account):>14}
  TikTok-Shop-Seller-Center:           {str(inputs.has_tiktok_shop_seller_center):>14}
  Shopify-TikTok-Channel:              {str(inputs.has_shopify_tiktok_channel):>14}
  Klaviyo-TikTok-channel:              {str(inputs.has_klaviyo_tiktok_channel):>14}
  Triple-Whale-TikTok-attribution:     {str(inputs.has_triple_whale_tiktok_attribution):>14}
  Creator-affiliate-pool size:         {inputs.creator_affiliate_pool_size:>14}
  Voice profile:                       {inputs.voice_profile:>14}
  LIVE-studio capacity (hr/wk):        {inputs.has_live_shopping_studio_capacity_hours_per_week:>14}

Path {rec.path} cost stack
-------------------------
  Cost one-time:                       ${rec.cost_one_time_low:>13,.0f} - ${rec.cost_one_time_high:>13,.0f}
  Cost recurring (monthly):            ${rec.cost_recurring_low:>13,.0f} - ${rec.cost_recurring_high:>13,.0f}
  Year-1 total cost:                   ${rec.year1_cost_low:>13,.0f} - ${rec.year1_cost_high:>13,.0f}

Year-1 incremental TikTok-Shop GMV
----------------------------------
  Share of US DTC GMV:                 {rec.year1_incremental_gmv_share_pct_low:>13.1f}% - {rec.year1_incremental_gmv_share_pct_high:>13.1f}%
  Incremental TikTok-Shop GMV:         ${rec.year1_incremental_gmv_low:>13,.0f} - ${rec.year1_incremental_gmv_high:>13,.0f}
  Year-1 ROI:                          {rec.year1_roi_low:>13.1f}x - {rec.year1_roi_high:>13.1f}x

Engagement multipliers
----------------------
  LIVE-cohort-LTV multiplier:          {rec.live_cohort_ltv_multiplier_low:>13.1f}x - {rec.live_cohort_ltv_multiplier_high:>13.1f}x
  Spark-Ads ROAS:                      {rec.spark_ads_roas_low:>13.1f}x - {rec.spark_ads_roas_high:>13.1f}x

Default platform pick
---------------------
  {rec.default_platform_pick}

5-payout creator-affiliate-structures matrix (per voice)
--------------------------------------------------------
{payout_lines}

Build sequence (6 steps)
------------------------
{seq_lines}

Justification
-------------
{rec.justification}

Companion artifacts:
- /research/11-tiktok-shop-live-commerce.md (5-pillar framework + 3 GMV-tier paths)
- /playbooks/18-tiktok-shop-live-launch.md (4-phase operator build)
- /assets/19-tiktok-shop-creator-briefs.md (paste-ready per-voice per-SKU-archetype creator-briefs)
- /dashboard/app/tiktok/page.tsx (20th operator-surface route)
"""


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        inputs = build_inputs(args)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    rec = recommend_path(inputs)
    if args.json:
        proj = project_per_path_revenue(inputs, rec)
        proj["justification"] = rec.justification
        proj["platforms"] = rec.platforms
        print(json.dumps(proj, indent=2))
    else:
        print(render_human(inputs, rec))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())