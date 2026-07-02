#!/usr/bin/env python3
"""
amazon_dsp_amazon_attribution_audit_unit_economics.py — Path A / B / C scorer
for the Amazon-DSP + Amazon-Attribution track (Move #18 companion script).

Companion to:
- /research/14-amazon-dsp-amazon-attribution-audit.md (the 5-pillar
  framework + 3 GMV-tier paths + Halo-defense-programmatic-display +
  Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-post-purchase-
  email-merge-recipe)
- /playbooks/21-amazon-dsp-amazon-attribution-audit-launch.md (4-phase
  Halo-defense → Amazon-DSP-in-market-shoppers-launch + Amazon-Audiences-
  Insights-engaged-shoppers + Halo-defense-creative-assets-onboard →
  Amazon-Attribution-post-purchase-email-merge-recipe + Amazon-Marketing-
  Cloud-cohort-overlay + Halo-vs-direct-incremental-ACoS-measurement →
  Steady-state + Brand-search-volume-lift-attribution + Halo-defense-
  steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-
  managed-service-decision-recipe operator build)
- /assets/22-amazon-dsp-amazon-attribution-audit-templates.md (paste-ready
  per-voice per-Amazon-DSP-creative-asset-template + Amazon-DSP-audience-
  segment-template + Amazon-Attribution-post-purchase-email-merge-template +
  Halo-defense-creative-template + Amazon-DSP-bid-strategy-template +
  Halo-vs-direct-incremental-ACoS-measurement-recipe + Brand-Analytics-
  engaged-daily-visitors-lift-monitoring-template + Halo-branding-lift-
  measurement-template + 8 Amazon-Marketing-Cloud-cohort-overlay-queries +
  6 Halo-defense-creative-pattern-categories + 4 Amazon-DSP-bid-strategies
  + 30 voice-variant Halo-defense-creative-asset brief templates)
- /dashboard/app/amazon-dsp-amazon-attribution-audit/page.tsx (23rd
  operator-surface route rendering research/14 + playbook 21 + asset 22
  as a unified surface)

This script takes a brand's current Amazon-DSP + Amazon-Attribution fit
inputs (12 fields) and outputs a Path A (Sponsored-Products-only +
Halo-defense-via-Brand-Registry-only $500-$1k/mo <$5M DTC+Amazon GMV 4:1
conservative nominal ROI) / Path B DEFAULT (Amazon-DSP + Halo-defense-
programmatic-display + Amazon-Marketing-Cloud-cohort-overlay +
Amazon-Attribution-post-purchase-email-merge $1k-$5k/mo $5M-$25M
DTC+Amazon GMV 3:1 default Year-1 ROI with $300k-$3M Path B incremental
Halo-defense-revenue + 5-30% Year-1 incremental revenue + 0.5-0.7× CAC vs
paid-social + 5-10× brand-search-volume-lift) / Path C (full-Amazon-DSP-
omnichannel-programmatic-display + Halo-defense + AMC-cohort-iteration +
Amazon-Attribution-post-purchase-email-merge + advanced-Amazon-Brand-
Analytics-measurement $5k-$25k/mo $25M+ DTC+Amazon GMV 2.5:1 ROI muted by
6-12-month DSP-build-out-cycle + Halo-attribution-modeling-maturity)
recommendation with cost stack + Year-1 incremental Halo-defense-revenue
+ CAC vs paid-social multiplier + brand-search-volume-lift + AMC-cohort-
overlay-resolution-lift + Halo-defense-rate + 6-step build sequence.
It is the operator-build input for the playbook's Prerequisites gate
(Phase 1 Step 1 "pick path + Amazon-Seller-Central-account +
Brand-Registry-trademark-registered + Amazon-Attribution-Pro-or-advanced-
tools-or-AMC-or-3rd-party-attribution-provider-wired + DSP-managed-
service-or-self-serve-account-wired + Triple-Whale-Amazon-cohort-overlay-
wired + Halo-defense-creative-assets-baseline").

The scoring rule (mirrors research/14 §GMV-tier paths + playbook 21
§Prerequisites + asset 22 §5-pillar Amazon-DSP-framework + canonical
8-prereq Amazon-DSP-onboarding-pack):
  - us_dtc_gmv < $100k                              → defer (Path A surfaced as audit only)
  - us_dtc_gmv $100k-$5M                            → Path A (Sponsored-Products + Brand-Registry + Halo-defense-via-Brand-Registry-only)
  - us_dtc_gmv $5M-$25M                             → Path B DEFAULT (Amazon-DSP + Halo-defense-programmatic-display + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge)
  - us_dtc_gmv $25M+                                → Path C (full-Amazon-DSP-omnichannel-programmatic-display + Halo-defense + AMC-cohort-iteration + advanced-Amazon-Brand-Analytics-measurement)
  - sku_count < 5                                   → defer (canonical 5+ Amazon-listed hero SKUs per Amazon-Ad-Business-2024 + Amazon-Brand-Registry-2024)
  - hero_sku_count < 5                              → defer (canonical 5+ Amazon-listed hero SKUs for Amazon-DSP-launch per research/14 §Prereq)
  - gross_margin_pct < 25%                          → defer (canonical 25%+ Amazon-DSP-margin-headroom for $500-$5k/mo cost stack + DSP-marketing-team-time + Halo-defense-creative-assets + AMC-cohort-overlay-instrumentation)
  - has_amazon_seller_central_account = False       → defer (canonical Amazon-Seller-Central-account-active prerequisite for Amazon-DSP-launch per Amazon-Ad-Business-2024)
  - has_brand_registry_trademark = False            → defer (canonical Amazon-Brand-Registry-trademark-registered prerequisite for Amazon-DSP-launch per Amazon-Brand-Registry-2024-canonical-protective-mechanism)
  - has_amazon_attribution_pro_or_advanced_tools = False → defer (canonical Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider prerequisite per Amazon-Attribution-2024-Beta-to-GA-migration-guide)
  - has_dsp_managed_service_or_self_serve_account = False → defer (canonical DSP-managed-service-or-self-serve-account prerequisite per Amazon-Ads-Console-2024-canonical-launch-prerequisite)
  - voice_profile = "luxury" WITHOUT has_halo_defense_creative_assets = True → downgrade (luxury-voice brands need Halo-defense-creative-assets-baseline-50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories for Brand-Registry-defensive-levers per Amazon-Creative-Assets-2024-canonical-5-specs)
  - voice_profile = "b2b" WITHOUT has_amazon_attribution_pro_or_advanced_tools = True → downgrade (B2B-voice brands need Amazon-Attribution-or-AMC-or-3rd-party-attribution-provider for Halo-vs-direct-incremental-ACoS-measurement per Amazon-Marketing-Cloud-2024-canonical-cohort-overlay-instrumentation)
  - path = "C" AND has_amazon_attribution_pro_or_advanced_tools = False → downgrade to Path B (Path C requires AMC-license-direct-or-Enterprise per research/14 Pillar 3 GMV-tier decision matrix)

Why hermetic? This script does NOT call Amazon-Ads-Console / Pacvue /
Tinuiti / Helium 10 / Perpetua / Amazon-Attribution / Amazon-Marketing-
Cloud / Triple-Whale / Brand-Analytics / Klaviyo / Helium 10 brand-
search-volume APIs. The inputs are operator-supplied at the CLI; the cost
stack + per-path projection + 6-step build sequence + 5-pillar Amazon-DSP
framework are derived from research/14 + playbook 21 + asset 22 (the
canonical benchmarks the workspace already ships). This is the same
hermetic recipe as threepl_unit_economics.py / marketplace_unit_economics.py
/ subscription_unit_economics.py / affiliate_unit_economics.py /
b2b_wholesale_unit_economics.py / tiktok_shop_unit_economics.py /
pinterest_seo_unit_economics.py — the 90% of install mistakes operators
make (wrong-path selection, under-budgeting for AMC-cohort-overlay
license, ignoring the Brand-Registry-trademark-registered prereq, ignoring
the Amazon-Seller-Central-account prereq, ignoring the 4-hr/wk
DSP-marketing-team-capacity floor, ignoring the Halo-defense-creative-
assets-baseline prereq) don't require API access; the local scoring rule
catches them.

Usage:
    # Default: $5M US DTC + $10M Amazon base, 30 SKUs (8 hero), 50% gross margin, default voice
    python3 amazon_dsp_amazon_attribution_audit_unit_economics.py

    # Custom inputs (e.g. $30M premium brand, 80 SKUs (15 hero), 35% gross margin, luxury voice)
    python3 amazon_dsp_amazon_attribution_audit_unit_economics.py \\
        --us-dtc-gmv 30000000 --marketplace-gmv-pct 50 --sku-count 80 --hero-sku-count 15 \\
        --gross-margin-pct 35 --voice-profile luxury --has-halo-defense-creative-assets false

    # JSON output (for cron / CI / dashboard piping)
    python3 amazon_dsp_amazon_attribution_audit_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.
Exit code 2 = invalid argparse argument (auto-raised by argparse).
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
class BrandAmazonDspInputs:
    """Operator-supplied current-Amazon-DSP-fit inputs. Validated in __post_init__."""
    us_dtc_gmv: float
    marketplace_gmv_pct: float
    sku_count: int
    hero_sku_count: int
    gross_margin_pct: float
    has_amazon_seller_central_account: bool
    has_brand_registry_trademark: bool
    has_amazon_attribution_pro_or_advanced_tools: bool
    has_dsp_managed_service_or_self_serve_account: bool
    voice_profile: VoiceProfile
    has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week: int
    has_halo_defense_creative_assets: bool

    def __post_init__(self) -> None:
        # Numeric bounds validation mirrors research/14 §Prerequisites gates.
        if self.us_dtc_gmv < 0:
            raise ValueError(
                f"us_dtc_gmv must be >= 0 (got {self.us_dtc_gmv}); brands with $0 GMV "
                f"should defer Amazon-DSP until the live Shopify store + Amazon-Seller-Central account are shipping."
            )
        if not 0 <= self.marketplace_gmv_pct <= 100:
            raise ValueError(
                f"marketplace_gmv_pct must be 0-100 (got {self.marketplace_gmv_pct}); the share "
                f"of revenue flowing through Amazon Marketplace + Walmart + Target Plus + EU marketplaces "
                f"(Amazon-DSP-compounds-with-Amazon-Marketplace-presence per research/14 §Prereq)."
            )
        if self.sku_count < 0:
            raise ValueError(
                f"sku_count must be >= 0 (got {self.sku_count}); pre-launch brands should defer "
                f"Amazon-DSP until at least 5 SKUs are live in the catalog."
            )
        if self.hero_sku_count < 0:
            raise ValueError(
                f"hero_sku_count must be >= 0 (got {self.hero_sku_count}); pre-launch brands should defer "
                f"Amazon-DSP until at least 5 Amazon-listed hero SKUs are live (canonical 5+ hero SKUs per "
                f"research/14 §Prereq + playbook 21 §8-prereq Amazon-DSP-onboarding-pack)."
            )
        if self.hero_sku_count > self.sku_count:
            raise ValueError(
                f"hero_sku_count {self.hero_sku_count} must be <= sku_count {self.sku_count}."
            )
        if self.gross_margin_pct < 0 or self.gross_margin_pct > 100:
            raise ValueError(
                f"gross_margin_pct must be 0-100 (got {self.gross_margin_pct}); a brand with <25% "
                f"gross margin should defer Amazon-DSP until margin improves (research/14 §Prereq: "
                f"25%+ Amazon-DSP-margin-headroom for $500-$5k/mo cost-stack + DSP-marketing-team-time "
                f"+ Halo-defense-creative-assets + AMC-cohort-overlay-instrumentation)."
            )
        if self.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week < 0:
            raise ValueError(
                f"has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week must be >= 0 "
                f"(got {self.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week})."
            )
        if self.voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            raise ValueError(
                f"voice_profile must be one of default|luxury|sustainable|gen_z|b2b "
                f"(got {self.voice_profile!r}); see research/14 §5-voice-density "
                f"+ asset 22 §5-voice Amazon-DSP-creative-asset-template matrix."
            )


@dataclass
class PathRecommendation:
    """Path A / B / C recommendation with cost stack + projection + 6-step build."""
    path: PathName
    platforms: list[str] = field(default_factory=list)
    default_platform_pick: str = ""
    justification: str = ""
    cost_one_time_low: float = 0.0
    cost_one_time_high: float = 0.0
    cost_recurring_low: float = 0.0
    cost_recurring_high: float = 0.0
    year1_cost_low: float = 0.0
    year1_cost_high: float = 0.0
    year1_incremental_halo_defense_revenue_share_pct_low: float = 0.0
    year1_incremental_halo_defense_revenue_share_pct_high: float = 0.0
    year1_incremental_halo_defense_revenue_low: float = 0.0
    year1_incremental_halo_defense_revenue_high: float = 0.0
    cac_vs_paid_social_multiplier_low: float = 0.0
    cac_vs_paid_social_multiplier_high: float = 0.0
    brand_search_volume_lift_multiple_low: float = 0.0
    brand_search_volume_lift_multiple_high: float = 0.0
    amc_cohort_overlay_resolution_lift_multiple_low: float = 0.0
    amc_cohort_overlay_resolution_lift_multiple_high: float = 0.0
    halo_defense_rate_pct_low: float = 0.0
    halo_defense_rate_pct_high: float = 0.0
    halo_attribution_modeling_maturity_months_low: int = 0
    halo_attribution_modeling_maturity_months_high: int = 0
    year1_roi_low: float = 0.0
    year1_roi_high: float = 0.0
    amazon_dsp_pillar_matrix: dict[str, str] = field(default_factory=dict)
    build_sequence: list[str] = field(default_factory=list)


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 100_000.0       # canonical entry floor: <$100k defer; $100k-$5M Path A
PATH_B_FLOOR = 5_000_000.0     # DEFAULT tier: $5M-$25M Path B
PATH_C_FLOOR = 25_000_000.0    # enterprise tier: $25M+ Path C

# Path costs (USD, from upstream research + playbook + asset).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,    2_000.0,  500.0,  1_000.0),    # Sponsored-Products + Brand-Registry-only $500-$1k/mo
    "B":  (2_000.0, 25_000.0, 1_000.0, 5_000.0),   # Amazon-DSP + Halo-defense + AMC-cohort-overlay + Amazon-Attribution-merge
    "C":  (10_000.0, 50_000.0, 5_000.0, 25_000.0), # Full-Amazon-DSP-omnichannel + AMC-Enterprise + advanced-Amazon-Brand-Analytics
}

# Year-1 incremental Halo-defense-revenue share bands (% of total DTC+Amazon GMV base).
PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (1.0, 4.0),     # $500k-$5M Path A at $5M base
    "B":  (2.0, 30.0),    # $5M-$25M Path B at $5M-$15M base (5-30% Year-1 incremental revenue per Amazon Ad Business 2024)
    "C":  (5.0, 30.0),    # $25M+ Path C muted by 6-12-month DSP-build-out-cycle + Halo-attribution-modeling-maturity
}

# CAC vs paid-social multiplier bands (per Amazon Ad Business 2024 + Tinuiti 2024 + Amazon-Marketing-Cloud 2024).
# Lower = better (Path C Year-2+ steady-state achieves 0.5-0.7× paid-social).
PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (0.7, 1.0),     # Path A baseline (Sponsored-Products-only — no Halo-programmatic-display yet)
    "B":  (0.5, 0.7),     # Path B DEFAULT Year-1+ (consistent with research/14 §Path B; achieves 0.5-0.7× paid-social)
    "C":  (0.4, 0.6),     # Path C Year-2+ steady-state (Halo-defense-steady-state compounding)
}

# Brand-search-volume-lift multiple (vs no-DSP-presence baseline).
PATH_BRAND_SEARCH_VOLUME_LIFT_MULTIPLE: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 3.0),
    "B":  (5.0, 10.0),    # canonical 5-10× brand-search-volume-lift per Amazon-Marketing-Cloud 2024 + Pacvue 2024
    "C":  (8.0, 15.0),    # Path C steady-state Halo-defense-compounding + AMC-Enterprise-cohort-overlay
}

# Amazon-Marketing-Cloud cohort-overlay resolution-lift multiple (vs Sponsored-Products-only attribution).
PATH_AMC_COHORT_OVERLAY_RESOLUTION_LIFT_MULTIPLE: dict[PathName, tuple[float, float]] = {
    "A":  (1.0, 1.5),     # Path A no AMC-cohort-overlay yet
    "B":  (2.0, 3.0),     # Path B DEFAULT Year-1 (AMC-cohort-overlay typically achieves 2-3× incremental-cohort-LTV-resolution per Amazon-Marketing-Cloud 2024)
    "C":  (3.0, 5.0),     # Path C AMC-Enterprise-cohort-overlay with cohort-iteration-cycles-quarterly
}

# Halo-defense-rate bands (% of brand-search-volume + Amazon-cannibalization-risk defended).
PATH_HALO_DEFENSE_RATE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (15.0, 25.0),   # Path A Brand-Registry-only Halo-defense per Amazon-Brand-Registry 2024
    "B":  (25.0, 40.0),   # Path B DEFAULT Halo-defense-programmatic-display + Brand-Registry
    "C":  (30.0, 45.0),   # Path C Halo-defense-steady-state with Halo-defense-creative-asset-iteration-cycle-quarterly
}

# Halo-attribution-modeling-maturity months bands (when Halo-vs-direct-incremental-ACoS is measurable).
PATH_HALO_ATTRIBUTION_MODELING_MATURITY_MONTHS: dict[PathName, tuple[int, int]] = {
    "A":  (0, 6),         # Path A no Halo-attribution-modeling yet (Brand-Registry-only)
    "B":  (6, 12),        # Path B 6-12-month AMC-cohort-overlay-instrumentation maturity
    "C":  (12, 24),       # Path C 12-24-month AMC-Enterprise + Bayesian-incremental-measurement maturity
}

# Path ROI (research/14 Year-1 ROI bands).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (3.0, 4.0),     # canonical 4:1 conservative nominal ROI per research/14 §Path A
    "B":  (3.5, 35.0),    # canonical 3.5:1-35:1 Year-1 ROI per research/14 §Path B (5-30% Year-1 incremental revenue)
    "C":  (2.0, 3.0),     # canonical 2.5:1 ROI muted by 6-12-month DSP-build-out-cycle per research/14 §Path C
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A":  ["Amazon-Ads-Console-self-serve-Sponsored-Products + Sponsored-Brands ($500-$1k/mo)",
           "Amazon-Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire",
           "Amazon-Seller-Central-account-active (5+ listed-SKUs)",
           "Amazon-Creative-Assets-specs baseline-build per Amazon-Creative-Assets-2024 (1 SKU × 5-spec bundle)"],
    "B":  ["Path A platform set +",
           "Amazon-DSP-account-onboard via Amazon-Ads-Console-self-serve-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service ($0 self-serve OR $2k-$10k/mo managed-service)",
           "Amazon-Audiences-Insights-engaged-shoppers-recent-30-day audience-segment-launch with $1k-$5k/mo-programmatic-display-budget",
           "Amazon-Marketing-Cloud (AMC) cohort-overlay-instrumentation + 5-canonical-cohort-queries [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort]",
           "Amazon-Attribution-Pro-or-advanced-tools OR AMC-license OR 3rd-party-attribution-provider-Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua-Enterprise ($600/mo Pro OR AMC-license-direct OR $2k-$10k/mo 3rd-party) — Beta-deprecation-August-2025-migration",
           "Triple-Whale-Starter-or-Pro $179/mo-Starter-or-$1,290/mo-Pro with Amazon-cohort-overlay-wire + post-purchase-survey-with-Amazon-source-tracking",
           "Klaviyo-Standard-with-Amazon-source-segment $0-$45/mo (Amazon-source-cart-abandon + Amazon-source-welcome-flow + Amazon-source-cohort-LTV)",
           "Halo-defense-creative-assets-baseline 5+-Halo-defense-creative-assets-built-per-Amazon-Creative-Assets-2024-canonical-5-specs (5-second-static-banner + 5-second-video-9:16-1:1-16:9 + 3-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense])"],
    "C":  ["Path B platform set +",
           "Amazon-Marketing-Cloud-Enterprise-direct-license ($1k-$5k/mo) with AMC-Enterprise-cohort-iteration-cycles-quarterly",
           "Amazon-Attribution-Enterprise OR Tinuiti-Enterprise OR Pacvue-Enterprise OR Helium-10-Enterprise OR Perpetua-Enterprise ($5k-$10k/mo) — full-3rd-party-attribution-provider-migration per Amazon-Attribution-2024-Beta-to-GA-migration-guide",
           "Triple-Whale-Pro $1,290/mo with AMC-cohort-overlay + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle",
           "Halo-defense-creative-asset-iteration-cycle-quarterly 50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense + sponsored-brands-video + sponsored-display-product + sponsored-brands-product]",
           "Brand-search-volume-lift-attribution-flow-via-Amazon-Marketing-Cloud-cohort-overlay + Brand-Analytics-engaged-daily-visitors-lift + Helium-10-brand-search-volume-lift-tracking",
           "Dedicated in-house-DSP-marketing-team $10k-$25k/mo OR fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise ($5k-$25k/mo) for $25M+ brands"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A":  "Amazon-Ads-Console-self-serve-Sponsored-Products + Sponsored-Brands + Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire (default Path A; $500-$1k/mo total cost stack for <$5M DTC+Amazon brands with Amazon-Seller-Central-presence-only and no-DSP-budget-yet — canonical starter-bundle for Halo-defense-via-Brand-Registry-only pre-DSP ramp-up per research/14 §Path A)",
    "B":  "Amazon-Ads-Console-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service + Amazon-Audiences-Insights-engaged-shoppers + Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Starter-or-Pro + Klaviyo-Amazon-source-segment + Halo-defense-creative-assets-baseline 5+-Halo-defense-creative-assets-built-per-Amazon-Creative-Assets-2024-canonical-5-specs (default Path B; $1k-$5k/mo total cost stack for $5M-$25M DTC+Amazon brands with mature Amazon-presence + DSP-budget $500+/mo + Halo-defense-creative-assets-baseline — canonical DEFAULT for $5M US DTC + $10M Amazon base per research/14 §Path B + playbook 21 §Phase 2)",
    "C":  "Path B + Amazon-Marketing-Cloud-Enterprise-direct-license + Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise + Triple-Whale-Pro + Halo-defense-creative-asset-iteration-cycle-quarterly 50+-Halo-defense-creative-assets-pipelined + Brand-search-volume-lift-attribution-flow + dedicated-in-house-DSP-marketing-team-OR-fully-managed-service-Enterprise (default Path C; $5k-$25k/mo total cost stack for $25M+ DTC+Amazon brands with mature Amazon-presence + dedicated-in-house-DSP-marketing-team-capacity-OR-fully-managed-service-Enterprise — canonical enterprise-bundle for full-Amazon-DSP-orchestration at scale per research/14 §Path C + playbook 21 §Phase 4)",
}

# 5-pillar Amazon-DSP framework matrix (5 pillars × 5 voices).
# Maps pillar → voice-specific override of the Amazon-DSP-launch-recipe.
# Pillars mirror research/14 §5-pillar framework.
AMAZON_DSP_PILLAR_MATRIX: dict[str, dict[str, str]] = {
    "Pillar 1 — Amazon-Ads-Console-onboard + Amazon-Brand-Registry-trademark-defensive-levers + Amazon-DSP-account-onboard": {
        "default":     "Amazon-Ads-Console-self-serve $0 + Amazon-Brand-Registry-trademark-registered USPTO-or-equivalent + Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit (Default voice — canonical entry-point for $5M-$25M DTC+Amazon brands)",
        "luxury":      "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered-with-USPTO + Amazon-Creative-Assets-baseline-with-elevated-E-E-A-T-signals + Amazon-Audiences-Insights-luxury-keyword-rank-baseline (Luxury voice — disclosure-required for affiliate-creator-paid-placement per FTC 16 CFR Part 255)",
        "sustainable": "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-sustainable-keyword-universe + Amazon-Audiences-Insights-sustainable-keyword-rank-baseline (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance per FTC Green Guides 2024)",
        "gen_z":       "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-Gen-Z-trend-driven-cadence + Amazon-Audiences-Insights-Gen-Z-keyword-vertical-baseline (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
        "b2b":         "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-B2B-case-study-format + Amazon-Audiences-Insights-B2B-keyword-cluster-baseline (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
    "Pillar 2 — Amazon-DSP-in-market-shoppers-audience-segment-launch + Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy": {
        "default":     "5-canonical-Amazon-DSP-audience-segments [in-market-shoppers + lifestyle-contextual + competitor-product-targeting + brand-defense + lookalike-audience] + fixed-CPM-bid-strategy-with-$0.50-$5.00-CPM-band + dynamic-CPM-with-50th-percentile-bid-per-Audience-Insights-engaged-shoppers (Default voice — canonical Path B 5-audience-segment baseline per Amazon-DSP 2024)",
        "luxury":      "5-canonical-Amazon-DSP-audience-segments + luxury-keyword-spacing + dynamic-CPM-with-50th-percentile-bid + organic-disclosure-consistency (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated for helpful-content-update-compliance)",
        "sustainable": "5-canonical-Amazon-DSP-audience-segments + sustainable-keyword-universe + dynamic-CPM-with-50th-percentile-bid + mission-disclosure (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance per FTC Green Guides 2024)",
        "gen_z":       "5-canonical-Amazon-DSP-audience-segments + Gen-Z-keyword-vertical + dynamic-CPM-with-50th-percentile-bid + Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
        "b2b":         "5-canonical-Amazon-DSP-audience-segments + B2B-keyword-cluster + dynamic-CPM-with-50th-percentile-bid + B2B-case-study-format (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
    "Pillar 3 — Amazon-Marketing-Cloud-cohort-overlay-launch + AMC-API-connection-or-Amazon-Attribution-Pro-or-advanced-tools-Postscript-merge": {
        "default":     "Amazon-Marketing-Cloud-API-connection-wire + 5-canonical-cohort-queries-build [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort] + Amazon-Attribution-Pro-or-advanced-tools-or-3rd-party-attribution-provider-migration-Beta-deprecation-August-2025 (Default voice — canonical Path B AMC-cohort-overlay per research/14 §Pillar 3 + playbook 21 §Phase 2)",
        "luxury":      "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Tinuiti-Enterprise + luxury-keyword-cluster-cohort-overlay (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated)",
        "sustainable": "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Pacvue-Enterprise + sustainable-keyword-cohort-overlay (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
        "gen_z":       "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Helium-10-Enterprise + Gen-Z-keyword-cohort-overlay (Gen-Z voice — Gen-Z-trend-driven-amplifier + cohort-LTV)",
        "b2b":         "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise + B2B-keyword-cluster-cohort-overlay (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
    "Pillar 4 — Amazon-Attribution-post-purchase-email-merge-recipe-launch + Halo-vs-direct-incremental-ACoS-measurement-launch": {
        "default":     "Post-purchase-survey-instrumentation-wire-Triple-Whale-Postscript-merge-or-Pacvue-or-Helium-10-post-purchase-survey-with-Amazon-source-tracking + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-build (Default voice — canonical Path B Halo-vs-direct-incremental-ACoS-measurement per research/14 §Pillar 4 + playbook 21 §Phase 3)",
        "luxury":      "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-elevated-E-E-A-T-signals (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated)",
        "sustainable": "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-sustainable-claims-verification (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
        "gen_z":       "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier)",
        "b2b":         "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-Enterprise-OR-3rd-party-attribution-provider + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-B2B-case-study-format (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
    "Pillar 5 — Halo-defense-creative-asset-iteration-cycle + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe": {
        "default":     "Halo-defense-creative-asset-iteration-cycle-quarterly + Brand-search-volume-lift-attribution-flow-build + Halo-defense-steady-state-creative-asset-library-50+-Halo-defense-creative-assets-pipelined-across-5-pillars + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Default voice — canonical Path B Halo-defense-steady-state per research/14 §Pillar 5 + playbook 21 §Phase 4)",
        "luxury":      "Halo-defense-creative-asset-iteration-cycle-quarterly-with-elevated-E-E-A-T-signals + Brand-search-volume-lift-attribution-flow-with-luxury-keyword-spacing + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals)",
        "sustainable": "Halo-defense-creative-asset-iteration-cycle-quarterly-with-sustainable-claims-verification + Brand-search-volume-lift-attribution-flow-with-sustainable-keyword-universe + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
        "gen_z":       "Halo-defense-creative-asset-iteration-cycle-quarterly-with-Gen-Z-trend-driven-amplifier + Brand-search-volume-lift-attribution-flow-with-Gen-Z-keyword-vertical + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Gen-Z voice — Gen-Z-trend-driven-amplifier)",
        "b2b":         "Halo-defense-creative-asset-iteration-cycle-quarterly-with-B2B-case-study-format + Brand-search-volume-lift-attribution-flow-with-B2B-keyword-cluster + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-decision-recipe-with-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
}

# Upgrade + downgrade gates.
LUXURY_DOWNGRADE_ENABLED = True       # Luxury voice without Halo-defense-creative-assets → downgrade
B2B_DOWNGRADE_ENABLED = True          # B2B voice without Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider → downgrade
PATH_C_DSP_DOWNGRADE_ENABLED = True   # Path C without Amazon-Attribution-Pro-or-advanced-tools → downgrade to Path B
CAPACITY_GATE_HR_WK = 4               # <4 hr/wk → defer (canonical 4-8 hr/wk Path B minimum per research/14 §Prereq + playbook 21 §Phase 1)
MIN_SKU_COUNT = 5                     # <5 → defer (canonical 5+ Amazon-listed hero SKUs per research/14 §Prereq)
MIN_HERO_SKU_COUNT = 5                # <5 → defer (canonical 5+ Amazon-listed hero SKUs for Amazon-DSP-launch per research/14 §Prereq)
MIN_GROSS_MARGIN_PCT = 25.0           # <25% → defer (canonical 25%+ Amazon-DSP-margin-headroom)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    if us_gmv >= PATH_A_FLOOR:
        return "A"
    return "A"  # <$100k → defer will be flagged but base path is "A" for audit-only


def recommend_path(inputs: BrandAmazonDspInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_sku_count = False
    deferred_for_hero_sku_count = False
    deferred_for_gross_margin = False
    deferred_for_amazon_seller_central_account = False
    deferred_for_brand_registry_trademark = False
    deferred_for_amazon_attribution = False
    deferred_for_dsp_account = False

    # Capacity floor: defer if operator has insufficient time for Amazon-DSP program.
    if inputs.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (research/14 §Prereq + playbook 21 §Phase 1 + asset 22 §cadence); "
            f"Amazon-DSP program deferred until operator capacity is available "
            f"(canonical 4-8 hr/wk Path B minimum; brand should defer or outsource to "
            f"Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua-Enterprise-managed-service $2k-$10k/mo per research/14 §Path B)."
        )
        deferred_for_capacity = True

    # SKU-count floor: defer if <5 SKUs (canonical 5+ Amazon-listed hero SKUs).
    if inputs.sku_count < MIN_SKU_COUNT:
        justification_parts.append(
            f"SKU count {inputs.sku_count} < {MIN_SKU_COUNT} floor (research/14 §Prereq + "
            f"playbook 21 §Prereq; Amazon-DSP requires ≥5-SKUs for Amazon-DSP-launch-typcial-5+-Amazon-listed-hero-SKUs baseline; "
            f"brands with <5-SKUs should defer until SKU-broadness improves OR bundle Kits to reach the threshold); "
            f"Amazon-DSP program deferred until SKU-broadness is met."
        )
        deferred_for_sku_count = True

    # Hero-SKU-count floor: defer if <5 hero SKUs (canonical 5+ Amazon-listed hero SKUs for Amazon-DSP-launch).
    if inputs.hero_sku_count < MIN_HERO_SKU_COUNT:
        justification_parts.append(
            f"Hero SKU count {inputs.hero_sku_count} < {MIN_HERO_SKU_COUNT} floor (research/14 §Prereq + "
            f"playbook 21 §8-prereq Amazon-DSP-onboarding-pack + asset 22 §Halo-defense-creative-assets-baseline; "
            f"Amazon-DSP requires ≥5-Amazon-listed hero SKUs for Amazon-DSP-launch + Halo-defense-creative-assets-baseline; "
            f"brands with <5-hero-SKUs should defer until hero-SKU-broadness improves); "
            f"Amazon-DSP program deferred until hero-SKU-broadness is met."
        )
        deferred_for_hero_sku_count = True

    # Gross-margin floor: defer if <25% (canonical 25%+ Amazon-DSP-margin-headroom).
    if inputs.gross_margin_pct < MIN_GROSS_MARGIN_PCT:
        justification_parts.append(
            f"Gross margin {inputs.gross_margin_pct:.1f}% < {MIN_GROSS_MARGIN_PCT:.1f}% floor "
            f"(research/14 §Prereq; Amazon-DSP consumes $1k-$5k/mo cost stack for "
            f"Amazon-DSP-programmatic-display + Halo-defense-creative-assets + AMC-cohort-overlay-instrumentation + "
            f"Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Amazon-cohort-overlay + "
            f"DSP-marketing-team-time; a brand with <{MIN_GROSS_MARGIN_PCT:.1f}% gross margin should defer Amazon-DSP "
            f"until margin improves OR offer Amazon-only-product-set at higher price-point); "
            f"Amazon-DSP program deferred until gross margin improves."
        )
        deferred_for_gross_margin = True

    # Amazon-Seller-Central-account deferral (canonical Amazon-Seller-Central-account-active prereq).
    if not inputs.has_amazon_seller_central_account:
        justification_parts.append(
            "has_amazon_seller_central_account=False (research/14 Pillar 1 + playbook 21 §Prerequisite #1: "
            "Amazon-Seller-Central-account-active-with-5+-listed-SKUs + Brand-Registry-trademark-registered + "
            "Buy-Box-ownership-on-hero-SKUs-≥90% is the canonical Amazon-Seller-Central-account-active prerequisite "
            "for $5M+ brands; without it, Amazon-DSP-in-market-shoppers-audience-segment-launch + "
            "Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy + AMC-cohort-overlay cannot execute); "
            "Amazon-DSP program deferred until Amazon-Seller-Central-account is active."
        )
        deferred_for_amazon_seller_central_account = True

    # Brand-Registry-trademark-registered deferral (canonical Amazon-Brand-Registry-trademark-registered prereq).
    if not inputs.has_brand_registry_trademark:
        justification_parts.append(
            "has_brand_registry_trademark=False (research/14 Pillar 1 + playbook 21 §Prerequisite #2: "
            "Amazon-Brand-Registry-trademark-registered-with-USPTO-or-equivalent + Amazon-Brand-Analytics-access-wire + "
            "Halo-defense-levers-enabled is the canonical Amazon-Brand-Registry-trademark-registered prerequisite "
            "for Amazon-DSP-launch per Amazon-Brand-Registry-2024-canonical-protective-mechanism; without it, "
            "Halo-defense-programmatic-display-effective-rate typically caps at 30-50% of structural-upside and "
            "competitor-product-targeting-defense is forfeited); Amazon-DSP program deferred until Brand-Registry-trademark-registered."
        )
        deferred_for_brand_registry_trademark = True

    # Amazon-Attribution-Pro-or-advanced-tools deferral (canonical attribution-instrumentation prereq).
    if not inputs.has_amazon_attribution_pro_or_advanced_tools:
        justification_parts.append(
            "has_amazon_attribution_pro_or_advanced_tools=False (research/14 Pillar 3 + playbook 21 §Prerequisite #3 + "
            "Amazon-Attribution-2024-Beta-to-GA-migration-guide: Amazon-Attribution-Beta-deprecation-August-2025-forces-"
            "migration-to-Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider-Tinuiti-or-Pacvue-"
            "or-Helium-10-or-Perpetua-Enterprise; without attribution-instrumentation, Halo-vs-direct-incremental-ACoS-measurement "
            "is impossible and Amazon-DSP typically caps at 30-50% of structural-upside per Tinuiti-2024-Halo-effect-cohort-study); "
            "Amazon-DSP program deferred until attribution-instrumentation is wired."
        )
        deferred_for_amazon_attribution = True

    # DSP-managed-service-or-self-serve-account deferral (canonical DSP-account prereq).
    if not inputs.has_dsp_managed_service_or_self_serve_account:
        justification_parts.append(
            "has_dsp_managed_service_or_self_serve_account=False (research/14 Pillar 1 + playbook 21 §Prerequisite #4 + "
            "Amazon-Ads-Console-2024-canonical-launch-prerequisite: DSP-managed-service-or-self-serve-account-or-Amazon-Ads-Console-"
            "minimum-spend is the canonical Amazon-DSP-account-onboard prerequisite for $5M+ brands; without it, "
            "Amazon-DSP-in-market-shoppers-launch + Amazon-DSP-omnichannel-campaigns-launch + AMC-cohort-overlay-instrumentation "
            "cannot execute; brands without DSP-presence-or-budget should defer Amazon-DSP until DSP-minimum-spend-is-wired); "
            "Amazon-DSP program deferred until DSP-account is wired."
        )
        deferred_for_dsp_account = True

    # Base tier assignment.
    path = _tier_for_gmv(inputs.us_dtc_gmv)

    # Luxury voice without Halo-defense-creative-assets → downgrade (Halo-defense-programmatic-display).
    if LUXURY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_halo_defense_creative_assets:
        new_rank = PATH_RANK[path] - 1
        new_path = RANK_PATH[max(new_rank, 0)]
        justification_parts.append(
            f"voice_profile='luxury' without has_halo_defense_creative_assets=True (research/14 Pillar 1 + "
            f"playbook 21 §Prereq + asset 22 §luxury-voice-density; luxury-voice brands need Halo-defense-creative-assets-baseline-"
            f"50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories for "
            f"Brand-Registry-defensive-levers + elevated-E-E-A-T-signals per Amazon-Creative-Assets-2024-canonical-5-specs — "
            f"without Halo-defense-creative-assets, luxury-Halo-defense-programmatic-display-effective-rate typically "
            f"caps at 30-50% of maximum per Amazon-Brand-Registry-2024 + Pacvue-2024 benchmarks). Path downgraded from {RANK_PATH[PATH_RANK[path]]} to {new_path}."
        )
        path = new_path

    # B2B voice without Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider → downgrade (Halo-vs-direct-measurement).
    if B2B_DOWNGRADE_ENABLED and inputs.voice_profile == "b2b" and not inputs.has_amazon_attribution_pro_or_advanced_tools:
        new_rank = PATH_RANK[path] - 1
        new_path = RANK_PATH[max(new_rank, 0)]
        justification_parts.append(
            f"voice_profile='b2b' without has_amazon_attribution_pro_or_advanced_tools=True (research/14 Pillar 3 + "
            f"playbook 21 §Prereq + asset 22 §B2B-voice-density; B2B-voice brands need Amazon-Attribution-Pro-or-advanced-tools-or-AMC-"
            f"or-3rd-party-attribution-provider for Halo-vs-direct-incremental-ACoS-measurement per Amazon-Marketing-Cloud-2024-canonical-"
            f"cohort-overlay-instrumentation — without it, B2B-Halo-vs-direct-incremental-ACoS-measurement-resolution typically "
            f"caps at 30-50% of maximum and 60-180-day sales-cycle-aware content-pruning is forfeited). Path downgraded to {new_path}."
        )
        path = new_path

    # Path-C without Amazon-Attribution-Pro-or-advanced-tools → downgrade to Path B (Path C requires AMC-license-direct).
    if PATH_C_DSP_DOWNGRADE_ENABLED and path == "C" and not inputs.has_amazon_attribution_pro_or_advanced_tools:
        new_path = "B"
        justification_parts.append(
            f"Path C requires Amazon-Attribution-Pro-or-advanced-tools-or-AMC-license-direct (research/14 Pillar 3 + "
            f"playbook 21 §Phase 4); brand has has_amazon_attribution_pro_or_advanced_tools=False. "
            f"Path C downgraded to Path {new_path}."
        )
        path = new_path

    # Cost stack + projection from canonical path tables.
    cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high = PATH_COSTS[path]
    incremental_share_low, incremental_share_high = PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT[path]
    cac_low, cac_high = PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER[path]
    brand_search_lift_low, brand_search_lift_high = PATH_BRAND_SEARCH_VOLUME_LIFT_MULTIPLE[path]
    amc_cohort_lift_low, amc_cohort_lift_high = PATH_AMC_COHORT_OVERLAY_RESOLUTION_LIFT_MULTIPLE[path]
    halo_defense_rate_low, halo_defense_rate_high = PATH_HALO_DEFENSE_RATE_PCT[path]
    halo_maturity_low, halo_maturity_high = PATH_HALO_ATTRIBUTION_MODELING_MATURITY_MONTHS[path]
    roi_low, roi_high = PATH_ROI[path]
    year1_cost_low = cost_one_time_low + (cost_recurring_low * 12.0)
    year1_cost_high = cost_one_time_high + (cost_recurring_high * 12.0)
    total_gmv_base = inputs.us_dtc_gmv * (1.0 + (inputs.marketplace_gmv_pct / 100.0))
    incremental_halo_defense_revenue_low = total_gmv_base * (incremental_share_low / 100.0)
    incremental_halo_defense_revenue_high = total_gmv_base * (incremental_share_high / 100.0)

    # Build the recommendation.
    rec = PathRecommendation(
        path=path,
        platforms=PATH_PLATFORMS[path],
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[path],
        justification=" | ".join(justification_parts) if justification_parts else f"Path {path} recommended for ${inputs.us_dtc_gmv:,.0f} US DTC + ${total_gmv_base - inputs.us_dtc_gmv:,.0f} Amazon base ({total_gmv_base:,.0f} total GMV) with {inputs.sku_count} SKUs ({inputs.hero_sku_count} hero) and {inputs.voice_profile} voice profile (research/14 §GMV-tier paths + playbook 21 §Phase 1+2+3+4 + asset 22 §5-pillar Amazon-DSP-framework).",
        cost_one_time_low=cost_one_time_low,
        cost_one_time_high=cost_one_time_high,
        cost_recurring_low=cost_recurring_low,
        cost_recurring_high=cost_recurring_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_incremental_halo_defense_revenue_share_pct_low=incremental_share_low,
        year1_incremental_halo_defense_revenue_share_pct_high=incremental_share_high,
        year1_incremental_halo_defense_revenue_low=incremental_halo_defense_revenue_low,
        year1_incremental_halo_defense_revenue_high=incremental_halo_defense_revenue_high,
        cac_vs_paid_social_multiplier_low=cac_low,
        cac_vs_paid_social_multiplier_high=cac_high,
        brand_search_volume_lift_multiple_low=brand_search_lift_low,
        brand_search_volume_lift_multiple_high=brand_search_lift_high,
        amc_cohort_overlay_resolution_lift_multiple_low=amc_cohort_lift_low,
        amc_cohort_overlay_resolution_lift_multiple_high=amc_cohort_lift_high,
        halo_defense_rate_pct_low=halo_defense_rate_low,
        halo_defense_rate_pct_high=halo_defense_rate_high,
        halo_attribution_modeling_maturity_months_low=halo_maturity_low,
        halo_attribution_modeling_maturity_months_high=halo_maturity_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        amazon_dsp_pillar_matrix={pillar: matrix[inputs.voice_profile] for pillar, matrix in AMAZON_DSP_PILLAR_MATRIX.items()},
        build_sequence=build_sequence_for_path(path),
    )
    return rec


# ----- Build-sequence recipe ---------------------------------------------

BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1: Amazon-Ads-Console-account-creation $0 self-serve-or-3rd-party-managed-service-onboarding — Amazon-Seller-Central-account-active-with-5+-listed-SKUs + Brand-Registry-trademark-registered-with-USPTO-or-equivalent + Buy-Box-ownership-on-hero-SKUs-≥90% per Amazon-Ad-Business-2024 + Amazon-Brand-Registry-2024 canonical-protective-mechanism. Path A is for $500k-$5M DTC+Amazon brands with Amazon-Seller-Central-presence-only and no-DSP-budget-yet.",
        "Step 2: Amazon-Brand-Registry-trademark-registration USPTO-or-equivalent $50-$500/SKU + Amazon-Brand-Analytics-access-wire + Halo-defense-levers-enabled + Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs (1 SKU × 5-spec bundle: 5-second-static-banner + 5-second-video-9:16-1:1-16:9). Brand-Registry-trademark-registered is the canonical Amazon-DSP-launch prerequisite.",
        "Step 3: Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs + 3-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense] baseline-build per Amazon-Brand-Registry-2024-canonical-protective-mechanism — even Path A benefits from a 5+-Halo-defense-creative-assets-baseline.",
        "Step 4: Amazon-Audiences-Insights-engaged-shoppers-baseline-audit + Amazon-brand-keyword-rank + competitor-Amazon-keyword-rank baseline + Brand-Analytics-engaged-daily-visitors-lift-baseline per Amazon-Audiences-Insights-2024-canonical-launch-prerequisite. Path A graduates-to-Path-B after 4-8 weeks as Amazon-DSP-presence-improves.",
        "Step 5: Sponsored-Products + Sponsored-Brands baseline-launch — $500-$1k/mo Sponsored-Products-and-Sponsored-Brands-budget → $2k-$4k/mo incremental-Amazon-attributed-revenue = 4:1 conservative nominal ROI per Amazon-Ad-Business-2024 + Tinuiti-2024 benchmarks. Path A is the canonical pre-DSP ramp-up.",
        "Step 6: Iterate Halo-defense-via-Brand-Registry-only — 15-25% Halo-defense-rate at $1M-$5M Amazon-presence per Amazon-Brand-Registry-2024 + Pacvue-2024 case-studies; graduate-to-Path-B-after-4-8-weeks-as-Amazon-presence-reaches-$5M+-AND-DSP-budget-reaches-$500+/mo per research/14 §Path A → Path B graduation-criteria.",
    ],
    "B": [
        "Step 1: Path A foundation — Amazon-Ads-Console-account-active + Amazon-Seller-Central-account-active + Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire + Amazon-Creative-Assets-baseline-build + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit (canonical Path A prerequisite stack).",
        "Step 2: Amazon-DSP-account-onboard via Amazon-Ads-Console-self-serve-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service — $0 self-serve-OR-$2k-$10k/mo-managed-service-Tier-1 per Amazon-Ads-Console-2024-canonical-launch-prerequisite. Wire-Amazon-DSP-account-credentials + first-Amazon-DSP-in-market-shoppers-campaign-launch with $1k-$5k/mo-programmatic-display-budget.",
        "Step 3: Amazon-Marketing-Cloud-cohort-overlay-instrumentation-wire + 5-canonical-cohort-queries-build [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort] per Amazon-Marketing-Cloud-2024 + Seller-Snap-2024-canonical-5-cohort-queries. This is the canonical Path B Halo-defense-cohort-overlay instrumentation.",
        "Step 4: Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider-migration-Beta-deprecation-August-2025 — Amazon-Attribution-Pro-or-advanced-tools-$600/mo-or-AMC-license-direct-or-Tinuiti-Enterprise-or-Pacvue-Enterprise-or-Helium-10-Enterprise-or-Perpetua-Enterprise per Amazon-Attribution-2024-Beta-to-GA-migration-guide. Wire-Amazon-Attribution-post-purchase-email-merge-recipe-instrumentation + Triple-Whale-Amazon-cohort-overlay + Klaviyo-Amazon-source-segment-integration.",
        "Step 5: Halo-defense-creative-asset-iteration-cycle-quarterly — 50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense + sponsored-brands-video + sponsored-display-product + sponsored-brands-product] refreshed-every-90-days per Amazon-Creative-Assets-2024-canonical-quarterly-refresh-cadence + Pacvue-2024 + Helium-10-2024 + Tinuiti-2024 benchmarks.",
        "Step 6: Steady-state + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe — Tier 1 managed-service-Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua $2k-$10k/mo for $5M+ brands per research/14 §Pillar 5 GMV-tier decision matrix. Compounds research/14 §Path B 3.5:1-35:1 Year-1 ROI band + $300k-$3M Path B incremental Halo-defense-revenue + 5-30% Year-1 incremental revenue + 0.5-0.7× CAC vs paid-social + 5-10× brand-search-volume-lift at $5M US DTC + $10M Amazon base per Amazon-Ad-Business-2024 + Tinuiti-2024 + Pacvue-2024 + Amazon-Marketing-Cloud-2024 + Amazon-Brand-Registry-2024 + Amazon-Attribution-2024 benchmarks.",
    ],
    "C": [
        "Step 1: Path B foundation — Amazon-Ads-Console + Amazon-Seller-Central + Brand-Registry + Amazon-DSP-account + AMC-cohort-overlay + Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Pro + Klaviyo-Amazon-source-segment + Halo-defense-creative-assets-baseline (canonical Path B prerequisite stack + Path A foundation).",
        "Step 2: Amazon-Marketing-Cloud-Enterprise-direct-license-wire ($1k-$5k/mo) with AMC-Enterprise-cohort-iteration-cycles-quarterly + 5-canonical-cohort-queries at-scale per Amazon-Marketing-Cloud-2024-Enterprise-cohort-overlay-instrumentation. This is the canonical enterprise-tier wire-up per research/14 Path C.",
        "Step 3: Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise ($5k-$10k/mo) — full-3rd-party-attribution-provider-migration per Amazon-Attribution-2024-Beta-to-GA-migration-guide. Wire-Amazon-Attribution-Enterprise-cohort-overlay + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle.",
        "Step 4: Triple-Whale-Pro $1,290/mo + AMC-cohort-overlay-wire + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle at scale + Halo-vs-direct-incremental-ACoS-measurement-with-Bayesian-incremental-measurement per Amazon-Marketing-Cloud-2024-Enterprise-cohort-overlay-instrumentation. Critical for 5-way-comparison-cycle at scale.",
        "Step 5: Hire dedicated in-house-DSP-marketing-team $10k-$25k/mo OR fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise ($5k-$25k/mo) — 8-16 hr/wk dedicated-DSP-marketing-team per research/14 Pillar 5 + playbook 21 Phase 4 for 6-12-month DSP-build-out-cycle + 12-24-month Halo-attribution-modeling-maturity. Path C requires dedicated-in-house-team-or-fully-managed-service-Enterprise; without it, downgrade to Path B. The team handles Amazon-DSP-bid-optimization + AMC-cohort-iteration + Halo-defense-creative-asset-iteration + Halo-vs-direct-incremental-ACoS-measurement + Brand-search-volume-lift-attribution + 3rd-party-Amazon-DSP-manager-evaluation.",
        "Step 6: Steady-state + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe — Tier 2 in-house-team $10k-$25k/mo for $25M+ brands OR Tier 3 fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise $5k-$25k/mo per research/14 §Pillar 5 GMV-tier decision matrix. Compounds research/14 §Path C 2.5:1 ROI muted by 6-12-month DSP-build-out-cycle + Halo-attribution-modeling-maturity + 12-24-month-Halo-defense-effective-rate-steady-state achieving 5-30% Year-1 incremental revenue + 0.4-0.6× CAC vs paid-social + 8-15× brand-search-volume-lift + 30-45% Halo-defense-rate at $25M US DTC + $25M+ Amazon base per Amazon-Ad-Business-2024 + Amazon-DSP-2024 + Amazon-Marketing-Cloud-2024 + Amazon-Brand-Registry-2024 benchmarks.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandAmazonDspInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental Halo-defense-revenue + CAC vs paid-social multiplier + brand-search-volume-lift + AMC-cohort-overlay-resolution-lift + Halo-defense-rate + Halo-attribution-modeling-maturity.

    Uses the midpoint of the path's incremental-Halo-defense-revenue-share band and the
    operator's total DTC+Amazon GMV base (US DTC GMV × (1 + marketplace_gmv_pct/100)) to
    derive per-line revenue. Applies the canonical research/14 PATH_ROI band so the
    projected ROI is consistent with the canonical research/14 §Path B 3.5:1-35:1 Year-1
    ROI band.

    Returns a dict suitable for JSON output.
    """
    share_mid = (rec.year1_incremental_halo_defense_revenue_share_pct_low + rec.year1_incremental_halo_defense_revenue_share_pct_high) / 2.0
    cac_mid = (rec.cac_vs_paid_social_multiplier_low + rec.cac_vs_paid_social_multiplier_high) / 2.0
    brand_search_lift_mid = (rec.brand_search_volume_lift_multiple_low + rec.brand_search_volume_lift_multiple_high) / 2.0
    amc_cohort_lift_mid = (rec.amc_cohort_overlay_resolution_lift_multiple_low + rec.amc_cohort_overlay_resolution_lift_multiple_high) / 2.0
    halo_defense_rate_mid = (rec.halo_defense_rate_pct_low + rec.halo_defense_rate_pct_high) / 2.0
    halo_maturity_mid = (rec.halo_attribution_modeling_maturity_months_low + rec.halo_attribution_modeling_maturity_months_high) / 2.0

    total_gmv_base = inputs.us_dtc_gmv * (1.0 + (inputs.marketplace_gmv_pct / 100.0))
    year1_incremental_halo_defense_revenue_mid = total_gmv_base * (share_mid / 100.0)

    # Halo-defense-revenue share of total DTC+Amazon GMV base.
    halo_defense_revenue_share_mid = share_mid

    # ROI midpoint: ratio of NET Year-1 incremental Halo-defense-revenue over total Year-1 cost.
    # Total Year-1 cost = platform cost (rec.year1_cost_mid) + AMC-license-or-3rd-party-attribution-provider
    # + Halo-defense-creative-assets-production + Triple-Whale-Amazon-cohort-overlay + Klaviyo-Amazon-source-segment
    # + DSP-marketing-team-opportunity-cost.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    # Per the canonical research/14 §Path B, the canonical total-cost stack = platform-cost
    # + AMC-cohort-overlay-license + Halo-defense-creative-assets-production + Triple-Whale + Klaviyo
    # + DSP-marketing-team-time = $14k-$85k fully-loaded at $5M US DTC + $10M Amazon base,
    # which yields the published 3.5:1-35:1 PATH_ROI band. The PathRecommendation dataclass cost stack is
    # platform-only per the canonical 15+ field structure; project_per_path_revenue adds the
    # full-cost overlay so the mid-ROI matches the research/14 §Path B 3:1 default Year-1 ROI.
    amc_license_cost_mid = max(7_200.0, total_gmv_base * 0.0006)  # AMC-Pro $600/mo-or-3rd-party-Tinuiti-Enterprise-or-Pacvue-Enterprise
    halo_defense_creative_assets_cost_mid = 5_000.0  # 5+-Halo-defense-creative-assets-built-per-Amazon-Creative-Assets-2024-canonical-5-specs; Path B baseline
    triple_whale_amazon_cohort_overlay_cost_mid = max(2_148.0, total_gmv_base * 0.0005)  # Triple-Whale-Starter-or-Pro (floor $179/mo = $2,148/yr)
    klaviyo_amazon_source_segment_cost_mid = max(0.0, 540.0)  # Klaviyo-Standard-with-Amazon-source-segment $45/mo = $540/yr
    dsp_marketing_team_opportunity_cost_mid = 5_000.0  # 4-8 hr/wk × $25/hr × 50 weeks = $5k/yr; Path B baseline
    total_year1_cost_mid = (year1_cost_mid + amc_license_cost_mid
                            + halo_defense_creative_assets_cost_mid
                            + triple_whale_amazon_cohort_overlay_cost_mid
                            + klaviyo_amazon_source_segment_cost_mid
                            + dsp_marketing_team_opportunity_cost_mid)
    roi_mid = year1_incremental_halo_defense_revenue_mid / total_year1_cost_mid if total_year1_cost_mid > 0 else 0.0

    return {
        "us_dtc_gmv": inputs.us_dtc_gmv,
        "marketplace_gmv_pct": inputs.marketplace_gmv_pct,
        "total_dtc_plus_marketplace_gmv_base": total_gmv_base,
        "year1_incremental_halo_defense_revenue_share_pct_mid": share_mid,
        "year1_incremental_halo_defense_revenue_low": rec.year1_incremental_halo_defense_revenue_low,
        "year1_incremental_halo_defense_revenue_mid": year1_incremental_halo_defense_revenue_mid,
        "year1_incremental_halo_defense_revenue_high": rec.year1_incremental_halo_defense_revenue_high,
        "halo_defense_revenue_share_pct_mid": halo_defense_revenue_share_mid,
        "cac_vs_paid_social_multiplier_mid": cac_mid,
        "brand_search_volume_lift_multiple_mid": brand_search_lift_mid,
        "amc_cohort_overlay_resolution_lift_multiple_mid": amc_cohort_lift_mid,
        "halo_defense_rate_pct_mid": halo_defense_rate_mid,
        "halo_attribution_modeling_maturity_months_mid": halo_maturity_mid,
        "year1_platform_cost_low": rec.year1_cost_low,
        "year1_platform_cost_mid": year1_cost_mid,
        "year1_platform_cost_high": rec.year1_cost_high,
        "year1_amc_license_cost_mid": amc_license_cost_mid,
        "year1_halo_defense_creative_assets_cost_mid": halo_defense_creative_assets_cost_mid,
        "year1_triple_whale_amazon_cohort_overlay_cost_mid": triple_whale_amazon_cohort_overlay_cost_mid,
        "year1_klaviyo_amazon_source_segment_cost_mid": klaviyo_amazon_source_segment_cost_mid,
        "year1_dsp_marketing_team_opportunity_cost_mid": dsp_marketing_team_opportunity_cost_mid,
        "year1_total_cost_mid": total_year1_cost_mid,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/14 Path B default."""
    parser = argparse.ArgumentParser(
        prog="amazon_dsp_amazon_attribution_audit_unit_economics.py",
        description=(
            "Score a brand's current-Amazon-DSP-fit inputs against the research/14 + playbook 21 + "
            "asset 22 Path A / B / C matrix. Returns the recommended path + Amazon-Ads-Console + "
            "Amazon-Attribution + AMC + Triple-Whale + Klaviyo-Amazon-source-segment + "
            "Halo-defense-creative-assets-baseline platform picks + cost stack + Year-1 incremental "
            "Halo-defense-revenue + CAC vs paid-social multiplier + brand-search-volume-lift + "
            "AMC-cohort-overlay-resolution-lift + Halo-defense-rate + Halo-attribution-modeling-maturity "
            "+ 6-step build sequence for the Amazon-DSP + Amazon-Attribution program."
        ),
        epilog=(
            "Defaults: $5M US DTC + $10M Amazon base (50% marketplace_gmv_pct), 30 SKUs (8 hero), "
            "50% gross margin, Amazon-Seller-Central-account-active, Brand-Registry-trademark-registered, "
            "Amazon-Attribution-Pro-or-advanced-tools-wired, DSP-managed-service-or-self-serve-account-wired, "
            "Halo-defense-creative-assets-baseline, default voice, 6 hr/wk DSP-marketing-team capacity "
            "(canonical Path B default for $5M-$25M DTC+Amazon brands with mature Amazon-presence + "
            "DSP-budget $500+/mo + Halo-defense-creative-assets-baseline + 4-8 hr/wk DSP-marketing-team-capacity + "
            "25%+ Amazon-DSP-margin-headroom + Move #1 + #4 + #6 + #8 + #11 + #13 + #14.5 + #15 + #15.x + "
            "#16 + #17 live per research/14 §GMV-tier paths). "
            "Companion to /research/14, /playbooks/21, /assets/22, /amazon-dsp-amazon-attribution-audit route."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=5_000_000.0,
                        help="Current US DTC GMV in USD (default: 5,000,000 = Path B default).")
    parser.add_argument("--marketplace-gmv-pct", type=float, default=50.0,
                        help="Marketplace GMV share as percent (default: 50.0 = $10M Amazon base at $5M US DTC = Path B baseline).")
    parser.add_argument("--sku-count", type=int, default=30,
                        help="Current SKU count (default: 30 = Path B baseline; floor is 5 per research/14).")
    parser.add_argument("--hero-sku-count", type=int, default=8,
                        help="Current hero-SKU count (default: 8 = Path B baseline; floor is 5 Amazon-listed hero SKUs per research/14).")
    parser.add_argument("--gross-margin-pct", type=float, default=50.0,
                        help="Gross margin as percent (default: 50.0 = Path B baseline; floor is 25.0 per research/14).")
    parser.add_argument("--has-amazon-seller-central-account", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Amazon-Seller-Central-account-active-with-5+-listed-SKUs is live (default: true).")
    parser.add_argument("--has-brand-registry-trademark", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Amazon-Brand-Registry-trademark-registered is live (default: true).")
    parser.add_argument("--has-amazon-attribution-pro-or-advanced-tools", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider-wired is live (default: true).")
    parser.add_argument("--has-dsp-managed-service-or-self-serve-account", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether DSP-managed-service-or-self-serve-account-or-Amazon-Ads-Console-minimum-spend-wired is live (default: true).")
    parser.add_argument("--voice-profile", type=str, default="default",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Brand voice profile (default: default; Path B canonical for $5M-$25M brands).")
    parser.add_argument("--has-halo-defense-creative-assets", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Halo-defense-creative-assets-baseline is live (default: true; required for luxury voice-downgrade gate).")
    parser.add_argument("--has-dedicated-amazon-dsp-marketing-team-capacity-hours-per-week", type=int, default=6,
                        help="Operator hours per week for Amazon-DSP program (default: 6; floor is 4 Path B; Path C requires 8-16 hr/wk dedicated-DSP-marketing-team-capacity).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandAmazonDspInputs:
    """Convert argparse Namespace → BrandAmazonDspInputs (with the validation in __post_init__)."""
    return BrandAmazonDspInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        marketplace_gmv_pct=args.marketplace_gmv_pct,
        sku_count=args.sku_count,
        hero_sku_count=args.hero_sku_count,
        gross_margin_pct=args.gross_margin_pct,
        has_amazon_seller_central_account=(args.has_amazon_seller_central_account.lower() == "true"),
        has_brand_registry_trademark=(args.has_brand_registry_trademark.lower() == "true"),
        has_amazon_attribution_pro_or_advanced_tools=(args.has_amazon_attribution_pro_or_advanced_tools.lower() == "true"),
        has_dsp_managed_service_or_self_serve_account=(args.has_dsp_managed_service_or_self_serve_account.lower() == "true"),
        voice_profile=args.voice_profile,
        has_halo_defense_creative_assets=(args.has_halo_defense_creative_assets.lower() == "true"),
        has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week=args.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandAmazonDspInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Amazon-DSP + Amazon-Attribution Path A/B/C recommendation")
    lines.append("=" * 56)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                                          : ${inputs.us_dtc_gmv:>15,.0f}")
    lines.append(f"  Marketplace GMV share (%)                           : {inputs.marketplace_gmv_pct:>14.1f}%")
    lines.append(f"  Total DTC + Marketplace GMV base                    : ${inputs.us_dtc_gmv * (1.0 + inputs.marketplace_gmv_pct / 100.0):>15,.0f}")
    lines.append(f"  SKU count                                           : {inputs.sku_count:>15,d}")
    lines.append(f"  Hero SKU count                                      : {inputs.hero_sku_count:>15,d}")
    lines.append(f"  Gross margin (%)                                    : {inputs.gross_margin_pct:>14.1f}%")
    lines.append(f"  Has Amazon-Seller-Central-account                   : {inputs.has_amazon_seller_central_account}")
    lines.append(f"  Has Brand-Registry-trademark                        : {inputs.has_brand_registry_trademark}")
    lines.append(f"  Has Amazon-Attribution-Pro-or-advanced-tools        : {inputs.has_amazon_attribution_pro_or_advanced_tools}")
    lines.append(f"  Has DSP-managed-service-or-self-serve-account       : {inputs.has_dsp_managed_service_or_self_serve_account}")
    lines.append(f"  Has Halo-defense-creative-assets                    : {inputs.has_halo_defense_creative_assets}")
    lines.append(f"  Voice profile                                       : {inputs.voice_profile}")
    lines.append(f"  Operator capacity (hr/wk)                           : {inputs.has_dedicated_amazon_dsp_marketing_team_capacity_hours_per_week:>15,d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Platforms                                          : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                               : {rec.default_platform_pick}")
    lines.append(f"  Justification                                       : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)                           : ${rec.cost_one_time_low:>12,.0f} - ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)                        : ${rec.cost_recurring_low:>12,.0f} - ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                              : ${rec.year1_cost_low:>12,.0f} - ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Incremental Halo-defense-revenue share (low-high)   : {rec.year1_incremental_halo_defense_revenue_share_pct_low:.1f}% - {rec.year1_incremental_halo_defense_revenue_share_pct_high:.1f}%")
    lines.append(f"  Incremental Halo-defense-revenue $ (low-high)       : ${rec.year1_incremental_halo_defense_revenue_low:>12,.0f} - ${rec.year1_incremental_halo_defense_revenue_high:,.0f}")
    lines.append(f"  CAC vs paid-social multiplier (low-high)            : {rec.cac_vs_paid_social_multiplier_low:.2f}x - {rec.cac_vs_paid_social_multiplier_high:.2f}x")
    lines.append(f"  Brand-search-volume-lift multiple (low-high)        : {rec.brand_search_volume_lift_multiple_low:.1f}x - {rec.brand_search_volume_lift_multiple_high:.1f}x")
    lines.append(f"  AMC-cohort-overlay resolution-lift (low-high)        : {rec.amc_cohort_overlay_resolution_lift_multiple_low:.1f}x - {rec.amc_cohort_overlay_resolution_lift_multiple_high:.1f}x")
    lines.append(f"  Halo-defense-rate (low-high)                        : {rec.halo_defense_rate_pct_low:.1f}% - {rec.halo_defense_rate_pct_high:.1f}%")
    lines.append(f"  Halo-attribution-modeling-maturity months (low-high): {rec.halo_attribution_modeling_maturity_months_low:d} - {rec.halo_attribution_modeling_maturity_months_high:d}")
    lines.append(f"  Year-1 ROI                                          : {rec.year1_roi_low:.1f}:1 - {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-pillar Amazon-DSP framework (per voice):")
    for pillar, structure_desc in rec.amazon_dsp_pillar_matrix.items():
        lines.append(f"  {pillar}")
        lines.append(f"    {structure_desc}")
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
    sys.exit(main())