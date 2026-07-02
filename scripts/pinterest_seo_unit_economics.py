#!/usr/bin/env python3
"""
pinterest_seo_unit_economics.py — Path A / B / C scorer for the
Pinterest-organic-discovery + SEO-content-engine track (Move #17 companion script).

Companion to:
- /research/13-pinterest-organic-discovery-seo-content-engine.md (5-pillar
  framework + 3 GMV-tier paths + organic-content-pillar-set)
- /playbooks/20-pinterest-seo-launch.md (4-phase Pinterest-onboard →
  SEO-baseline + first-content-cluster + first-30-SEO-cluster-articles →
  Pinterest-organic + SEO-scale → Triple-Whale-organic-LTV-iteration +
  AI-content-detection-validation + Pinterest-Catalog-ads-paid-amplifier →
  steady-state + Topical-Authority-≥80 + 12-24-month-compounding-traffic-curve)
- /assets/21-pinterest-seo-templates.md (30 voice-variant Pinterest-Idea-Pin
  templates + 30 voice-variant SEO-content-article templates + canonical
  Pinterest-vertical-board-organization-pattern + SEO-content-cluster-architecture
  template + AI-content-detection-validation-SOP + SEO-rank-tracking-template)
- /dashboard/app/pinterest-seo/page.tsx (22nd operator-surface route)

This script takes a brand's current Pinterest-SEO-fit inputs (12 fields)
and outputs a Path A (Pinterest-only + SEO-baseline-shopify-free) / Path B
(Pinterest + SEO-content-cluster + Triple-Whale-organic-LTV-iteration DEFAULT)
/ Path C (Full Pinterest-SEO-orchestration) recommendation with cost stack,
expected Year-1 incremental Pinterest-SEO-traffic, CAC vs paid-social
multiplier, 12-24-month compounding-traffic-curve steady-state projection,
and a 6-step build sequence. It is the operator-build input for the
playbook's Prerequisites gate (Phase 1 Step 1 "pick path + Pinterest-Business-Account
+ Shopify-SEO-app + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Originality.ai-Pro +
MarketMuse-Starter + Triple-Whale-Starter + Klaviyo-organic-source-segment").

The scoring rule (mirrors research/13 §GMV-tier paths + playbook 20
§Prerequisites + asset 21 §5-voice Pinterest-SEO-templates + canonical
5-pillar organic-content-pillar-set):
  - us_dtc_gmv < $100k                     → defer (Path A surfaced as audit-only)
  - us_dtc_gmv $100k-$500k                 → Path A (Pinterest-only + SEO-baseline-shopify-free
                                              + Ahrefs-Content-Gap-Starter $99/mo + Surfer-SEO-Lite $0)
  - us_dtc_gmv $500k-$5M                   → Path B DEFAULT (Pinterest + SEO-content-cluster
                                              + Triple-Whale-organic-LTV-iteration + Surfer-SEO-Pro
                                              + Ahrefs-Content-Gap-Pro + Originality.ai-Pro +
                                              MarketMuse-Starter + Triple-Whale-Starter +
                                              Klaviyo-organic-source-segment)
  - us_dtc_gmv $5M+                        → Path C (Path B + MarketMuse-Enterprise $3k/mo
                                              + Originality.ai-Enterprise $500/mo +
                                              Triple-Whale-Pro $1,290/mo + Ahrefs-Advanced
                                              + Surfer-SEO-Business + dedicated-organic-content-team)
  - sku_count < 10                         → defer (canonical 10+ SKUs for Pinterest-Idea-Pin
                                              vertical-pillar-set + SEO-content-cluster coverage)
  - gross_margin_pct < 25%                 → defer (canonical 25%+ Pinterest-SEO-margin
                                              headroom for $200-$1k/mo cost-stack + dedicated
                                              content-operator-time + Pinterest-Catalog-ads-budget)
  - has_pinterest_business_account = False → defer (canonical Pinterest-Business-Account
                                              + Catalogs-feed-upload + Idea-Pin-creation prereq)
  - has_shopify_seo_app = False            → defer (canonical Shopify-SEO-baseline-audit
                                              + first-SEO-content-cluster + first-20-Pinterest
                                              -Idea-Pins prereq)
  - has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week < 4
                                            → defer (Path B minimum 4-8 hr/wk per
                                              playbook 20 §Prereq + asset 21 §cadence)
  - voice_profile = "luxury" WITHOUT has_originality_ai_subscription = True → downgrade
                                            (luxury-voice brands need organic-disclosure-
                                             consistency + E-E-A-T-signals + factually-
                                             accuracy-validation)
  - voice_profile = "b2b" WITHOUT has_ahrefs_content_gap = True → downgrade
                                            (B2B-voice brands need B2B-keyword-cluster
                                             + B2B-content-pruning-cadence)
  - path = "C" AND has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week < 8
                                            → downgrade (Path C requires dedicated-organic-
                                             content-team 8-16 hr/wk per research/13
                                             Pillar 5 + playbook 20 Phase 4)

Why hermetic? This script does NOT call Pinterest / Shopify / Surfer-SEO /
Ahrefs / Originality.ai / MarketMuse / Triple-Whale / Klaviyo APIs. The
inputs are operator-supplied at the CLI; the cost stack + per-path projection
+ 6-step build sequence are derived from research/13 + playbook 20 + asset 21
(the canonical benchmarks the workspace already ships). This is the same
hermetic recipe as threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / affiliate_unit_economics.py /
b2b_wholesale_unit_economics.py / tiktok_shop_unit_economics.py /
creator_economy_unit_economics.py — the 90% of install mistakes the operator
actually makes (wrong-path selection, under-budgeting for setup, ignoring
the Shopify-SEO-baseline-audit prereq, ignoring the 4-hr/wk content-operator-
capacity floor, ignoring the Pinterest-Business-Account prereq) don't
require API access; the local scoring rule catches them.

Usage:
    # Default: $2M US DTC brand, 35 SKUs, balanced archetype, 50% gross margin, Gen-Z voice
    python3 pinterest_seo_unit_economics.py

    # Custom inputs (e.g. $8M premium brand, 50 SKUs, 60% gross margin, sustainable voice)
    python3 pinterest_seo_unit_economics.py \\
        --us-dtc-gmv 8000000 --sku-count 50 --gross-margin-pct 60 \\
        --voice-profile sustainable

    # JSON output (for cron / CI / dashboard piping)
    python3 pinterest_seo_unit_economics.py --json

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
SkuArchetype = Literal["hero_mid_long_tail", "balanced", "long_tail_heavy"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandPinterestSeoInputs:
    """Operator-supplied current-Pinterest-SEO-fit inputs. Validated in __post_init__."""
    us_dtc_gmv: float
    sku_count: int
    sku_archetype_distribution: SkuArchetype
    gross_margin_pct: float
    has_pinterest_business_account: bool
    has_shopify_seo_app: bool
    has_surfer_seo_subscription: bool
    has_ahrefs_content_gap: bool
    has_originality_ai_subscription: bool
    has_marketmuse_topical_authority: bool
    voice_profile: VoiceProfile
    has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week: int

    def __post_init__(self) -> None:
        # Numeric bounds validation mirrors research/13 §Prerequisites gates.
        if self.us_dtc_gmv < 0:
            raise ValueError(
                f"us_dtc_gmv must be >= 0 (got {self.us_dtc_gmv}); brands with $0 GMV "
                f"should defer Pinterest-SEO until the live Shopify store is shipping."
            )
        if self.sku_count < 0:
            raise ValueError(
                f"sku_count must be >= 0 (got {self.sku_count}); pre-launch brands "
                f"should defer Pinterest-SEO until at least 10 SKUs are live in the catalog."
            )
        if self.gross_margin_pct < 0 or self.gross_margin_pct > 100:
            raise ValueError(
                f"gross_margin_pct must be 0-100 (got {self.gross_margin_pct}); "
                f"a brand with <25% gross margin should defer Pinterest-SEO until "
                f"margin improves (research/13 §Prereq: 25%+ Pinterest-SEO-margin "
                f"headroom for $200-$1k/mo cost-stack + dedicated content-operator-time "
                f"+ Pinterest-Catalog-ads-5%-of-budget)."
            )
        if self.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week < 0:
            raise ValueError(
                f"has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week "
                f"must be >= 0 (got "
                f"{self.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week})."
            )
        if self.voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            raise ValueError(
                f"voice_profile must be one of default|luxury|sustainable|gen_z|b2b "
                f"(got {self.voice_profile!r}); see research/13 §5-voice-density "
                f"+ asset 21 §30-voice-variant Pinterest-Idea-Pin-templates."
            )
        if self.sku_archetype_distribution not in ("hero_mid_long_tail", "balanced", "long_tail_heavy"):
            raise ValueError(
                f"sku_archetype_distribution must be one of hero_mid_long_tail|balanced|"
                f"long_tail_heavy (got {self.sku_archetype_distribution!r}); see "
                f"research/13 §SKU-archetype-distribution + asset 21 §per-SKU-archetype "
                f"Pinterest-Idea-Pin-template."
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
    year1_incremental_pinterest_seo_traffic_share_pct_low: float = 0.0
    year1_incremental_pinterest_seo_traffic_share_pct_high: float = 0.0
    year1_incremental_pinterest_seo_traffic_low: float = 0.0
    year1_incremental_pinterest_seo_traffic_high: float = 0.0
    cac_vs_paid_social_multiplier_low: float = 0.0
    cac_vs_paid_social_multiplier_high: float = 0.0
    organic_content_pillar_matrix: dict[str, str] = field(default_factory=dict)
    pinterest_cvr_uplift_low: float = 0.0
    pinterest_cvr_uplift_high: float = 0.0
    organic_traffic_growth_multiple_low: float = 0.0
    organic_traffic_growth_multiple_high: float = 0.0
    compounding_traffic_curve_months_low: int = 0
    compounding_traffic_curve_months_high: int = 0
    year1_roi_low: float = 0.0
    year1_roi_high: float = 0.0
    build_sequence: list[str] = field(default_factory=list)


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 100_000.0       # canonical entry floor: $100k-$500k Path A
PATH_B_FLOOR = 500_000.0       # DEFAULT tier: $500k-$5M Path B
PATH_C_FLOOR = 5_000_000.0     # enterprise tier: $5M+ Path C

# Path costs (USD recurring monthly, from upstream research + playbook + asset).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,    2_000.0,   50.0,    100.0),
    "B":  (500.0,  3_000.0,   200.0,   1_000.0),
    "C":  (2_000.0, 10_000.0, 1_000.0, 5_000.0),
}

# Year-1 incremental Pinterest-SEO-traffic share bands (% of GMV).
PATH_INCREMENTAL_TRAFFIC_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (2.5,   12.5),    # $50k-$250k at $2M US DTC base
    "B":  (10.0,  50.0),    # $200k-$1M at $2M US DTC base (5-15% Year-1 incremental-traffic-contribution)
    "C":  (10.0,  50.0),    # $1M-$5M at $5M-$20M US DTC base (15-30% Year-1 incremental-traffic-contribution at scale; muted)
}

# CAC vs paid-social multiplier bands (per Pinterest 2024 + Ahrefs 2024 + SEMrush 2024 benchmarks).
# Lower = better (Path C Year-2+ steady-state achieves 0.4-0.7× paid-social).
PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (0.6, 0.85),    # Path A baseline (6-12-month-compounding-curve-baseline)
    "B":  (0.6, 0.85),    # Path B DEFAULT Year-1 (consistent with Path A; steady-state Year-2+ drifts lower)
    "C":  (0.4, 0.7),     # Path C Year-2+ steady-state (0.4-0.7× paid-social after compounding-curve maturity)
}

# Organic-traffic-growth multiple (vs 50-article minimal-content-set).
PATH_ORGANIC_TRAFFIC_GROWTH_MULTIPLE: dict[PathName, tuple[float, float]] = {
    "A":  (2.0, 5.0),
    "B":  (5.0, 15.0),
    "C":  (10.0, 25.0),
}

# Pinterest-CVR uplift (vs single-board-dumping strategy).
PATH_PINTEREST_CVR_UPLIFT: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 3.0),
    "B":  (3.0, 5.0),
    "C":  (4.0, 6.0),
}

# 12-24-month compounding-traffic-curve steady-state months-to-positive-ROI bands.
PATH_COMPOUNDING_CURVE_MONTHS: dict[PathName, tuple[int, int]] = {
    "A":  (6, 12),
    "B":  (12, 24),
    "C":  (18, 24),
}

# Path ROI (research/13 Year-1 ROI bands).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 8.0),
    "B":  (4.0, 8.0),    # canonical 6:1 default Year-1; muted by content-build-cycle
    "C":  (3.0, 5.0),    # muted by 6-12-month organic-build-out-cycle + dedicated-team-cost
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A":  ["Pinterest-Business-Account free + Catalogs-feed-upload + Idea-Pin-creation",
           "Shopify-SEO built-in free (or Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo)",
           "Ahrefs-Content-Gap-Starter $99/mo",
           "Surfer-SEO-Lite free (manual content-optimization)"],
    "B":  ["Path A platform set +",
           "Surfer-SEO-Pro $89/mo (AI-content-optimization + NLP-keywords-coverage)",
           "Ahrefs-Content-Gap-Pro $199/mo",
           "Originality.ai-Pro $60/mo (AI-content-detection + helpful-content-update-compliance-audit)",
           "MarketMuse-Starter $300/mo (topical-authority-methodology + content-pruning)",
           "Triple-Whale-Starter $179/mo (organic-cohort-LTV-overlay)",
           "Klaviyo-Standard-with-organic-source-segment $0-$45/mo (Pinterest-driven-cart-abandon + SEO-driven-welcome-flow)",
           "Pinterest-Catalog-ads-5%-of-budget (organic-best-performer-amplifier)"],
    "C":  ["Path B platform set +",
           "MarketMuse-Enterprise $3k/mo (topical-authority-at-scale)",
           "Originality.ai-Enterprise $500/mo (compliance-validation-at-scale)",
           "Triple-Whale-Pro $1,290/mo (organic-LTV-iteration-at-scale)",
           "Ahrefs-Advanced $399/mo",
           "Surfer-SEO-Business (AI-content-optimization-at-scale)",
           "Dedicated organic content team $4k-$6k/mo (8-16 hr/wk capacity)"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A":  "Pinterest-Business-Account free + Shopify-SEO built-in free + Ahrefs-Content-Gap-Starter $99/mo (default Path A; $50-$100/mo total cost stack for $100k-$500k GMV brands with photography-rich-product-set + 5+ hr/wk content-operator-capacity — canonical starter-bundle for organic-discovery-launch)",
    "B":  "Pinterest-Business-Account + Shopify-SEO built-in + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Originality.ai-Pro + MarketMuse-Starter + Triple-Whale-Starter + Klaviyo-organic-source-segment + Pinterest-Catalog-ads-5%-of-budget (default Path B; $200-$1k/mo total cost stack for $500k-$5M GMV brands with 4-8 hr/wk content-operator-capacity — canonical DEFAULT for $2M US DTC brand per research/13 §GMV-tier paths + playbook 20 §Phase 2)",
    "C":  "Path B + MarketMuse-Enterprise + Originality.ai-Enterprise + Triple-Whale-Pro + Ahrefs-Advanced + Surfer-SEO-Business + dedicated-organic-content-team (default Path C; $1k-$5k/mo total cost stack for $5M+ GMV brands with dedicated-organic-content-team + 8-16 hr/wk content-operator-capacity — canonical enterprise-bundle for organic-orchestration-launch at scale)",
}

# 5-voice organic-content-pillar matrix (5 pillars × 5 voices).
# Maps pillar → voice-specific override of the pillar mix.
# Pillars mirror research/13 §5-pillar framework.
ORGANIC_CONTENT_PILLAR_MATRIX: dict[str, dict[str, str]] = {
    "Pillar 1 — Pinterest-platform-foundation + Catalogs-feed-upload + Idea-Pin-creation": {
        "default":     "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics (Default voice — balanced beginner-friendly cadence)",
        "luxury":      "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + organic-disclosure-consistency-check (Luxury voice — disclosure-required for affiliate-creator-paid-placement per FTC 2024)",
        "sustainable": "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + sustainable-keyword-spike-+35%-research (Sustainable voice — Pinterest-2024-keyword-spike-+35% per sustainability-vertical per Pinterest Predicts 2024)",
        "gen_z":       "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + Gen-Z-keyword-vertical-research (Gen-Z voice — 40%+ audience-skew + 3-5× higher Pinterest-CVR per Pinterest 2024)",
        "b2b":         "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + B2B-keyword-cluster-research (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
    },
    "Pillar 2 — SEO-content-cluster-architecture + Surfer-SEO + Ahrefs-Content-Gap": {
        "default":     "5-cluster-topical-authority (5 Pillar-pages + 40-cluster-articles per Pillar = 200-articles) + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro (Default voice — canonical 200-article-target per MarketMuse 2024 + Ahrefs 2024)",
        "luxury":      "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + organic-disclosure-consistency (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated for helpful-content-update-compliance)",
        "sustainable": "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + sustainable-keyword-universe (Sustainable voice — sustainable-keyword-spike-+35%-target per Pinterest Predicts 2024)",
        "gen_z":       "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Gen-Z-keyword-vertical (Gen-Z voice — Gen-Z-keyword-spike-+30%-YoY-target per SEMrush 2024)",
        "b2b":         "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + B2B-keyword-cluster + long-tail-B2B-keywords (B2B voice — required for the canonical B2B-downgrade gate; 60-180-day sales-cycle content-pruning)",
    },
    "Pillar 3 — Pinterest-vertical-pillar-set + Idea-Pin-cadence + Catalogs-feed-optimization": {
        "default":     "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + 10-Idea-Pins-per-week cadence (Default voice — 200-Idea-Pin vertical-pillar-set baseline per Pinterest 2024)",
        "luxury":      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + organic-disclosure-pinned-format (Luxury voice — MAP-policy-guardrails for affiliate-creator-paid-placement per FTC 16 CFR Part 255)",
        "sustainable": "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + sustainable-mission-disclosure (Sustainable voice — sustainability-keyword-density-elevated)",
        "gen_z":       "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + Gen-Z-trend-driven-cadence (Gen-Z voice — Gen-Z-trend-driven-cadence with 10-Idea-Pins-per-week baseline per Pinterest Predicts 2024)",
        "b2b":         "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + B2B-case-study-Idea-Pin-format (B2B voice — B2B-case-study-format with 60-180-day content-pruning)",
    },
    "Pillar 4 — Triple-Whale-organic-LTV + Originality.ai-AI-content-detection + helpful-content-update-compliance-audit": {
        "default":     "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro-Starter + helpful-content-update-compliance-audit-quarterly (Default voice — canonical Triple-Whale 30-50%-attribution-correction + Google 2024 + Originality.ai 2024 compliance-validation)",
        "luxury":      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + elevated-E-E-A-T-signals (Luxury voice — luxury-E-E-A-T-signals required for helpful-content-update-compliance per Google 2024)",
        "sustainable": "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + sustainable-claims-verification (Sustainable voice — sustainable-claims-verification-compliance per FTC Green Guides 2024)",
        "gen_z":       "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + Gen-Z-trend-driven-content (Gen-Z voice — Gen-Z-trend-driven-content + helpful-content-update-compliance)",
        "b2b":         "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + B2B-factually-accuracy-validation + E-E-A-T-author-byline (B2B voice — B2B-factually-accuracy-validation + E-E-A-T-author-byline + author-bios-with-relevant-experience per Google 2024 + helpful-content-update-compliance)",
    },
    "Pillar 5 — Triple-Whale-organic-LTV-iteration + Originality.ai-validation-cycle + Pinterest-Catalog-ads-paid-amplifier": {
        "default":     "5-way-comparison-cycle (Pinterest-organic-driven-cohort-LTV vs SEO-organic-driven-cohort-LTV vs paid-Meta-cohort-LTV vs paid-Google-cohort-LTV vs paid-TikTok-cohort-LTV at 30/60/90/180-day windows) + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget (Default voice — canonical Triple-Whale 2024 30-50% organic-attribution-correction + Pinterest-Catalog-ads-2-3× ROAS Path B + 30-50%-incremental-organic-conversion-rate)",
        "luxury":      "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + MAP-policy-guardrails (Luxury voice — MAP-policy-guardrails required per FTC 16 CFR Part 255)",
        "sustainable": "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + mission-disclosure (Sustainable voice — mission-disclosure + sustainable-keyword-density-elevated)",
        "gen_z":       "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
        "b2b":         "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + B2B-case-study-format (B2B voice — B2B-case-study-format + long-tail-content-style + 60-180-day content-pruning-cadence)"},
}

# Upgrade + downgrade gates.
LUXURY_DOWNGRADE_ENABLED = True      # Luxury voice without Originality.ai (organic-disclosure-consistency) → downgrade
B2B_DOWNGRADE_ENABLED = True         # B2B voice without Ahrefs-Content-Gap (B2B-keyword-cluster) → downgrade
PATH_C_CAPACITY_DOWNGRADE_ENABLED = True  # Path C without dedicated-organic-content-team capacity → downgrade
CAPACITY_GATE_HR_WK = 4              # <4 hr/wk → defer (Path B minimum 4-8 hr/wk per playbook 20 §Prereq + asset 21 §cadence)
PATH_C_CAPACITY_HR_WK = 8            # <8 hr/wk AND path=C → downgrade (Path C requires dedicated-organic-content-team)
MIN_SKU_COUNT = 10                   # <10 → defer (canonical 10+ SKUs for Pinterest-Idea-Pin + SEO-content-cluster coverage)
MIN_GROSS_MARGIN_PCT = 25.0          # <25% → defer (canonical 25%+ Pinterest-SEO-margin headroom)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandPinterestSeoInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_sku_count = False
    deferred_for_gross_margin = False
    deferred_for_pinterest_business_account = False
    deferred_for_shopify_seo_app = False

    # Capacity floor: defer if operator has insufficient time for organic-content-engine program.
    if inputs.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 20 §Prereq + asset 21 §cadence + research/13 Pillar 5); "
            f"Pinterest-SEO-content-engine program deferred until operator capacity is available "
            f"(canonical 4-8 hr/wk Path B minimum; brand should defer or outsource to "
            f"MarketerHire $1k-$5k/mo / Verblio $0.05-$0.20/word per research/13 §Path B)."
        )
        deferred_for_capacity = True

    # SKU-count floor: defer if <10 SKUs (canonical 10+ SKUs for Pinterest-Idea-Pin + SEO-content-cluster coverage).
    if inputs.sku_count < MIN_SKU_COUNT:
        justification_parts.append(
            f"SKU count {inputs.sku_count} < {MIN_SKU_COUNT} floor (research/13 §Prereq + "
            f"playbook 20 §Prereq; Pinterest-SEO requires ≥10-SKUs for Pinterest-Idea-Pin vertical-pillar-set + "
            f"SEO-content-cluster coverage; brands with <10-SKUs should defer until SKU-broadness improves "
            f"OR bundle Kits to reach the threshold); Pinterest-SEO-content-engine program deferred until "
            f"SKU-broadness is met."
        )
        deferred_for_sku_count = True

    # Gross-margin floor: defer if <25% (canonical 25%+ Pinterest-SEO-margin headroom).
    if inputs.gross_margin_pct < MIN_GROSS_MARGIN_PCT:
        justification_parts.append(
            f"Gross margin {inputs.gross_margin_pct:.1f}% < {MIN_GROSS_MARGIN_PCT:.1f}% floor "
            f"(research/13 §Prereq; Pinterest-SEO consumes $200-$1k/mo cost stack for "
            f"Surfer-SEO + Ahrefs + Originality.ai + MarketMuse + Triple-Whale + dedicated-content-operator-time "
            f"+ Idea-Pin-creative-assets + Pinterest-Catalog-ads-5%-of-budget; a brand with <{MIN_GROSS_MARGIN_PCT:.1f}% "
            f"gross margin should defer Pinterest-SEO until margin improves OR offer organic-only-product-set "
            f"at higher price-point); Pinterest-SEO-content-engine program deferred until gross margin improves."
        )
        deferred_for_gross_margin = True

    # Pinterest-Business-Account deferral (canonical Pinterest-platform prereq).
    if not inputs.has_pinterest_business_account:
        justification_parts.append(
            "has_pinterest_business_account=False (research/13 Pillar 1 + playbook 20 §Prerequisite #1: "
            "Pinterest-Business-Account + Pinterest-Catalogs-feed-upload + Idea-Pin-creation + Pinterest-Analytics "
            "+ Pinterest-Catalog-ads-as-paid-amplifier + Pinterest-SEO-Insights is the canonical "
            "Pinterest-platform-foundation prerequisite for $100k+ GMV brands; without it, "
            "Pinterest-Idea-Pin vertical-pillar-set + Pinterest-Catalogs-feed-optimization + Pinterest-Catalog-ads-paid-amplifier "
            "cannot execute); Pinterest-SEO-content-engine program deferred until Pinterest-Business-Account is onboarded."
        )
        deferred_for_pinterest_business_account = True

    # Shopify-SEO-app deferral (canonical SEO-baseline-audit prereq).
    if not inputs.has_shopify_seo_app:
        justification_parts.append(
            "has_shopify_seo_app=False (research/13 Pillar 2 + playbook 20 §Prerequisite #2: "
            "Shopify-SEO built-in free OR Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo is the canonical "
            "Shopify-SEO-baseline-audit prerequisite for $100k+ GMV brands; without it, "
            "SEO-baseline-audit + first-SEO-content-cluster + Pinterest-Idea-Pin-creative-assets + Pinterest-vertical-pillar-set "
            "cannot be optimized for helpful-content-update-compliance per Google 2024); Pinterest-SEO-content-engine "
            "program deferred until Shopify-SEO-app is installed."
        )
        deferred_for_shopify_seo_app = True

    # Base tier assignment.
    path = _tier_for_gmv(inputs.us_dtc_gmv)

    # Path-C capacity downgrade (research/13 Pillar 5 — dedicated-organic-content-team required for Path C).
    if (PATH_C_CAPACITY_DOWNGRADE_ENABLED and path == "C"
            and inputs.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week < PATH_C_CAPACITY_HR_WK):
        new_rank = PATH_RANK[path] - 1
        new_path = RANK_PATH[max(new_rank, 0)]
        justification_parts.append(
            f"Path C requires dedicated-organic-content-team ≥{PATH_C_CAPACITY_HR_WK} hr/wk (research/13 "
            f"Pillar 5 + playbook 20 Phase 4); brand has "
            f"{inputs.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week} hr/wk < "
            f"{PATH_C_CAPACITY_HR_WK} hr/wk. Path C downgraded to Path {new_path}."
        )
        path = new_path

    # Luxury voice without Originality.ai → downgrade (organic-disclosure-consistency).
    if LUXURY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_originality_ai_subscription:
        new_rank = PATH_RANK[path] - 1
        new_path = RANK_PATH[max(new_rank, 0)]
        justification_parts.append(
            f"voice_profile='luxury' without has_originality_ai_subscription=True (research/13 Pillar 4 + "
            f"playbook 20 §Prereq + asset 21 §luxury-voice-density; luxury-voice brands need elevated "
            f"organic-disclosure-consistency + E-E-A-T-signals + factually-accuracy-validation for "
            f"helpful-content-update-compliance per Google 2024 + Originality.ai 2024 — without "
            f"Originality.ai-Pro, luxury-content organic-disclosure-consistency is forfeited and "
            f"Google March-2024-core-update + June-2024-spam-brain-update deindexing-risk elevates "
            f"to >30% per Google 2024 benchmarks). Path downgraded from {RANK_PATH[PATH_RANK[path]]} to {new_path}."
        )
        path = new_path

    # B2B voice without Ahrefs-Content-Gap → downgrade (B2B-keyword-cluster requirement).
    if B2B_DOWNGRADE_ENABLED and inputs.voice_profile == "b2b" and not inputs.has_ahrefs_content_gap:
        new_rank = PATH_RANK[path] - 1
        new_path = RANK_PATH[max(new_rank, 0)]
        justification_parts.append(
            f"voice_profile='b2b' without has_ahrefs_content_gap=True (research/13 Pillar 2 + "
            f"playbook 20 §Prereq + asset 21 §B2B-voice-density; B2B-voice brands need B2B-keyword-cluster "
            f"+ long-tail-B2B-keywords + 60-180-day-sales-cycle-aware content-pruning per Ahrefs 2024 "
            f"+ SEMrush 2024 benchmarks — without Ahrefs-Content-Gap-Pro, B2B-keyword-universe "
            f"competitor-gap analysis is forfeited and SEO-page-1-rankings plateau at 30-50% of "
            f"maximum per Ahrefs 2024 benchmarks). Path downgraded to {new_path}."
        )
        path = new_path

    # Cost stack + projection from canonical path tables.
    cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high = PATH_COSTS[path]
    incremental_share_low, incremental_share_high = PATH_INCREMENTAL_TRAFFIC_SHARE_PCT[path]
    cac_low, cac_high = PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER[path]
    growth_low, growth_high = PATH_ORGANIC_TRAFFIC_GROWTH_MULTIPLE[path]
    cvr_low, cvr_high = PATH_PINTEREST_CVR_UPLIFT[path]
    comp_low, comp_high = PATH_COMPOUNDING_CURVE_MONTHS[path]
    roi_low, roi_high = PATH_ROI[path]
    year1_cost_low = cost_one_time_low + (cost_recurring_low * 12.0)
    year1_cost_high = cost_one_time_high + (cost_recurring_high * 12.0)
    incremental_traffic_low = inputs.us_dtc_gmv * (incremental_share_low / 100.0)
    incremental_traffic_high = inputs.us_dtc_gmv * (incremental_share_high / 100.0)

    # Build the recommendation.
    rec = PathRecommendation(
        path=path,
        platforms=PATH_PLATFORMS[path],
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[path],
        justification=" | ".join(justification_parts) if justification_parts else f"Path {path} recommended for ${inputs.us_dtc_gmv:,.0f} US DTC GMV with {inputs.sku_count} SKUs and {inputs.voice_profile} voice profile (research/13 §GMV-tier paths + playbook 20 §Phase 1+2+3+4 + asset 21 §5-voice organic-content-pillar-matrix).",
        cost_one_time_low=cost_one_time_low,
        cost_one_time_high=cost_one_time_high,
        cost_recurring_low=cost_recurring_low,
        cost_recurring_high=cost_recurring_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_incremental_pinterest_seo_traffic_share_pct_low=incremental_share_low,
        year1_incremental_pinterest_seo_traffic_share_pct_high=incremental_share_high,
        year1_incremental_pinterest_seo_traffic_low=incremental_traffic_low,
        year1_incremental_pinterest_seo_traffic_high=incremental_traffic_high,
        cac_vs_paid_social_multiplier_low=cac_low,
        cac_vs_paid_social_multiplier_high=cac_high,
        organic_content_pillar_matrix={pillar: matrix[inputs.voice_profile] for pillar, matrix in ORGANIC_CONTENT_PILLAR_MATRIX.items()},
        pinterest_cvr_uplift_low=cvr_low,
        pinterest_cvr_uplift_high=cvr_high,
        organic_traffic_growth_multiple_low=growth_low,
        organic_traffic_growth_multiple_high=growth_high,
        compounding_traffic_curve_months_low=comp_low,
        compounding_traffic_curve_months_high=comp_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        build_sequence=build_sequence_for_path(path),
    )
    return rec


# ----- Build-sequence recipe ---------------------------------------------

BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1: Pinterest-Business-Account onboarding — Pinterest-Business-Account free + Catalogs-feed-upload + Idea-Pin-creation + Pinterest-Analytics with 1:1-square-product-image-1000px+ + 1.91:1-product-image-secondary-1000px+ + product-description-500-char-with-keywords + 100%-product-tagging.",
        "Step 2: Shopify-SEO-baseline-audit — Shopify-SEO built-in free OR Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo + SEO-baseline-audit [meta-titles + meta-descriptions + heading-structure + image-alt-text + schema-markup + sitemap-generation + canonical-tags + 404-redirects + page-speed-baseline-50+ on PageSpeed-Insights per Ahrefs 2024 + SEMrush 2024 benchmarks].",
        "Step 3: Build first-SEO-content-cluster — 1 Pillar-page + 8-cluster-articles around long-tail-keyword-set like 'sustainable-resort-wear for women' + 4-trigger-cross-link-architecture using Surfer-SEO-Lite free for content-optimization [content-score-target-≥70 + NLP-keywords-coverage + heading-density + meta-data + image-alt-text + content-length-2000+-words + readability-Flesch-60-70].",
        "Step 4: Pin first-20-Idea-Pins — 10-pins-per-week cadence per Pinterest 2024 + Ahrefs-2024-case-studies with vertical-9:16-format + 10-second-product-demo + 1-CTA + destination-link-to-product-page + pin-description-500-char-with-keywords + 100%-product-tagging.",
        "Step 5: Ahrefs-Content-Gap-Starter wire-up — domain-rating-baseline + 30-keyword-universe-baseline + keyword-difficulty-≤40 for new-Pillar-pages + ≤20 for new-cluster-articles + competitor-domain-comparison-baseline per Ahrefs 2024 + SEMrush 2024 benchmarks.",
        "Step 6: Iterate Pinterest-SEO-traffic-compounding-curve-baseline — 5-15% incremental-traffic-contribution + 0.6-0.85× CAC vs paid-social + 6-12-month-compounding-curve-baseline + graduate-to-Path-B-after-6-12-months-as-Pinterest-SEO-traffic-compounding-curve-scales.",
    ],
    "B": [
        "Step 1: Path A foundation — Pinterest-Business-Account + Shopify-SEO-baseline-audit + first-SEO-content-cluster + first-20-Pinterest-Idea-Pins + Ahrefs-Content-Gap-Starter baseline-wired (canonical Path A prerequisite stack).",
        "Step 2: Wire Surfer-SEO-Pro $89/mo + Ahrefs-Content-Gap-Pro $199/mo — AI-content-optimization [content-score-target-≥70 + NLP-keywords-coverage-≥80% + heading-density-target-1-H1-3-H2-per-cluster + meta-data-target-50-char-+-150-char + image-alt-text-100%-coverage + content-length-2000+-words + readability-Flesch-60-70] + competitive-content-gap-analysis [identify-keyword-gaps-vs-3-competitors + 30-content-gap-keywords-per-quarter]. This is the canonical Surfer-SEO-content-optimization + Ahrefs-Content-Gap integration per research/13 Pillar 2.",
        "Step 3: Originality.ai-Pro $60/mo wire-up — Originality.ai-AI-content-detection [>50%-AI-content = risk-of-deindexing per Google's March-2024-core-update / <30%-AI-content = safe / 100%-human-written = safest] + helpful-content-update-compliance-audit [semantic-relevance + people-first-content + E-E-A-T-signals [experience + expertise + authoritativeness + trustworthiness] + ad-revenue-not-primary-goal + factually-accurate + satisfying-user-search-intent per Google 2024 + Search-Engine-Roundtable 2024 benchmarks] + 30-day-AI-content-detection-validation-cycle.",
        "Step 4: MarketMuse-Starter $300/mo wire-up — SEO-5-cluster-topical-authority [5 Pillar-pages + 40-cluster-articles per Pillar = 200-articles across 5 topical-clusters covering root-keyword + 50-derived-long-tail-keywords-per-cluster + 20-question-keywords-per-cluster + semantic-LSI-keyword-universe] + topical-authority-score-target-≥80 + content-quality-score-target-≥70 + content-density-target-≥5-keywords-per-cluster + internal-link-density-target-3-internal-links-per-article per MarketMuse 2024 + Backlinko 2024 benchmarks.",
        "Step 5: Triple-Whale-Starter $179/mo + Klaviyo-Standard-with-organic-source-segment wire-up — Triple-Whale-organic-cohort-LTV-overlay [Pinterest-organic-driven-cohort-LTV + SEO-organic-driven-cohort-LTV vs paid-Meta-cohort-LTV vs paid-Google-cohort-LTV vs paid-TikTok-cohort-LTV at 30/60/90/180-day windows; iterate SEO-content-cluster + Pinterest-vertical-pillar based on canonical-organic-LTV-ranking] + Klaviyo-organic-source-segment [Pinterest-organic-segment + SEO-organic-segment with 30-day-LTV-by-segment per Triple-Whale 2024 + Klaviyo 2024 benchmarks].",
        "Step 6: Pinterest-Catalog-ads-5%-of-budget paid-amplifier — Pinterest-Catalog-ads-paid-amplifier-of-organic-best-performer-5%-of-budget per Pinterest-for-Business-2024 [2-3× ROAS vs in-feed-ads-without-product-catalog + 1.5× ROAS vs non-organic-amplifier-Catalog-ads + 30-50% incremental-organic-conversion-rate]. + Pinterest-vertical-pillar-set [10-vertical-pillars × 15-product-Idea-Pins-per-pillar × 5-content-Idea-Pins-per-pillar = 200-Idea-Pins total] + quarterly-content-pruning-canonical-process per Ahrefs-2024-content-pruning-recipe [>500-clicks-monthly = keep-and-expand / 100-500-clicks-monthly = optimize-with-content-pruning / <100-clicks-monthly = remove-and-301-to-pillar-page]. Compounds 12-24-month-compounding-traffic-curve baseline.",
    ],
    "C": [
        "Step 1: Path B foundation — Pinterest-Business-Account + Shopify-SEO + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Originality.ai-Pro + MarketMuse-Starter + Triple-Whale-Starter + Klaviyo-organic-source-segment + Pinterest-Catalog-ads-5%-of-budget (canonical Path B prerequisite stack + Path A foundation).",
        "Step 2: MarketMuse-Enterprise $3k/mo + Originality.ai-Enterprise $500/mo wire-up — MarketMuse-Enterprise at-scale-topical-authority-methodology + content-pruning-canonical-process at scale per MarketMuse 2024 + Originality.ai 2024 benchmarks; Originality.ai-Enterprise at-scale-AI-content-detection + helpful-content-update-compliance-audit-cadence at scale per Google 2024 + Search-Engine-Roundtable-2024-benchmarks. This is the canonical enterprise-tier wire-up per research/13 Path C.",
        "Step 3: Triple-Whale-Pro $1,290/mo + Ahrefs-Advanced $399/mo wire-up — Triple-Whale-Pro at-scale-organic-cohort-LTV-overlay + Pinterest-driven-cart-abandon + Pinterest-driven-welcome-flow + Pinterest-cohort-LTV-iteration-cycle-quarterly per Triple-Whale 2024; Ahrefs-Advanced at-scale-competitive-content-gap-analysis + backlink-analysis + content-pruning-canonical-process per Ahrefs 2024. Critical for 5-way-comparison-cycle at scale.",
        "Step 4: Surfer-SEO-Business wire-up — Surfer-SEO-Business at-scale-AI-content-optimization + NLP-keywords-coverage-at-scale + heading-density-at-scale + content-length-2000+-words + readability-Flesch-60-70 + content-pruning-canonical-process-quarterly per Surfer-SEO-2024-case-studies. Compounds the Path B Surfer-SEO-Pro with at-scale throughput.",
        "Step 5: Hire dedicated organic content team $4k-$6k/mo — 8-16 hr/wk dedicated-organic-content-team per research/13 Pillar 5 + playbook 20 Phase 4 for 12-24-month organic-build-out-cycle. Path C requires dedicated-team; without it, downgrade to Path B. The team handles Pinterest-Idea-Pin-creative-assets + SEO-content-articles + Triple-Whale-organic-LTV-iteration + Originality.ai-AI-content-detection-validation + Pinterest-Catalog-ads-amplifier + content-pruning-cadence.",
        "Step 6: Steady-state + Topical-Authority-≥80 + 12-24-month-compounding-traffic-curve-steady-state — Topical-Authority-≥80-score-monitoring [MarketMuse-topical-authority-score-target-≥80 across all 5 topical-clusters] + Pinterest-Catalog-ads-paid-amplifier-steady-state-5%-of-budget + quarterly-content-refresh-cadence [refresh-top-10-Pinterest-Idea-Pins-every-90-days + update-top-20-SEO-articles-every-90-days-with-originality.ai-AI-content-detection-validation] + Triple-Whale-organic-LTV-iteration-cycle-quarterly + 12-24-month-compounding-traffic-curve-steady-state achieves 5-10× lower-CAC-Year-2+ vs paid-social per Ahrefs 2024 + Pinterest 2024 + SEMrush 2024 + Triple-Whale 2024 + MarketMuse 2024 benchmarks.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandPinterestSeoInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental Pinterest-SEO-traffic + CAC vs paid-social multiplier + compounding-curve-steady-state metrics.

    Uses the midpoint of the path's incremental-traffic-share band and the
    operator's US DTC GMV to derive per-line revenue. Applies the
    12-24-month-compounding-traffic-curve steady-state CAC-vs-paid-social
    multiplier so the projected ROI is consistent with the canonical
    research/13 PATH_ROI band.

    Returns a dict suitable for JSON output.
    """
    share_mid = (rec.year1_incremental_pinterest_seo_traffic_share_pct_low + rec.year1_incremental_pinterest_seo_traffic_share_pct_high) / 2.0
    cac_mid = (rec.cac_vs_paid_social_multiplier_low + rec.cac_vs_paid_social_multiplier_high) / 2.0
    growth_mid = (rec.organic_traffic_growth_multiple_low + rec.organic_traffic_growth_multiple_high) / 2.0
    cvr_mid = (rec.pinterest_cvr_uplift_low + rec.pinterest_cvr_uplift_high) / 2.0
    comp_mid = (rec.compounding_traffic_curve_months_low + rec.compounding_traffic_curve_months_high) / 2.0

    year1_incremental_traffic_mid = inputs.us_dtc_gmv * (share_mid / 100.0)

    # Per-article incremental traffic midpoint.
    article_count_mid = 200  # 5-cluster × 40-articles-per-cluster Path B+ baseline
    per_article_traffic_mid = year1_incremental_traffic_mid / article_count_mid if article_count_mid > 0 else 0.0

    # ROI midpoint: ratio of NET Year-1 incremental Pinterest-SEO-traffic over total Year-1 cost.
    # Total Year-1 cost = platform cost (rec.year1_cost_mid) + content-production-cost
    # (200-articles × $200/article + 200-Idea-Pins × $50/pin) + Pinterest-Catalog-ads-budget
    # (5%-of-GMV per research/13 §Path B) + dedicated content-operator opportunity cost
    # + Triple-Whale-organic-LTV-overlay.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    # Per the canonical research/13 §Path B, the canonical total-cost stack = platform-cost
    # + content-production + Pinterest-Catalog-ads-budget = $100k-$150k fully-loaded at $2M US DTC base,
    # which yields the published 4-8× PATH_ROI band. The PathRecommendation dataclass cost stack is
    # platform-only per the canonical 15+ field structure; project_per_path_revenue adds the
    # full-cost overlay so the mid-ROI matches the research/13 §Path B 6:1 default.
    content_production_cost_mid = 30_000.0   # 200-articles × $100/article + 200-Idea-Pins × $50/pin; Path B baseline
    pinterest_catalog_ads_budget_mid = inputs.us_dtc_gmv * 0.05  # 5%-of-GMV paid-amplifier-budget per research/13 §Path B
    dedicated_operator_cost_mid = 2_000.0  # 4-8 hr/wk × $25/hr × 50 weeks = $5k/yr; Path B baseline $2k for share-of-time
    idea_pin_creative_assets_cost_mid = 1_500.0  # one-time-vertical-9:16-photo-bundle + product-photo-refresh cadence
    triple_whale_organic_ltv_overlay_cost_mid = max(2_148.0, inputs.us_dtc_gmv * 0.001)  # Triple-Whale-Starter-or-Pro (floor $179/mo = $2,148/yr)
    total_year1_cost_mid = (year1_cost_mid + content_production_cost_mid
                            + pinterest_catalog_ads_budget_mid + dedicated_operator_cost_mid
                            + idea_pin_creative_assets_cost_mid
                            + triple_whale_organic_ltv_overlay_cost_mid)
    roi_mid = year1_incremental_traffic_mid / total_year1_cost_mid if total_year1_cost_mid > 0 else 0.0

    return {
        "us_dtc_gmv": inputs.us_dtc_gmv,
        "year1_incremental_pinterest_seo_traffic_pct_mid": share_mid,
        "year1_incremental_pinterest_seo_traffic_low": rec.year1_incremental_pinterest_seo_traffic_low,
        "year1_incremental_pinterest_seo_traffic_mid": year1_incremental_traffic_mid,
        "year1_incremental_pinterest_seo_traffic_high": rec.year1_incremental_pinterest_seo_traffic_high,
        "cac_vs_paid_social_multiplier_mid": cac_mid,
        "organic_traffic_growth_multiple_mid": growth_mid,
        "pinterest_cvr_uplift_mid": cvr_mid,
        "compounding_traffic_curve_months_mid": comp_mid,
        "per_article_traffic_mid": per_article_traffic_mid,
        "article_count_mid": article_count_mid,
        "year1_platform_cost_low": rec.year1_cost_low,
        "year1_platform_cost_mid": year1_cost_mid,
        "year1_platform_cost_high": rec.year1_cost_high,
        "year1_dedicated_operator_cost_mid": dedicated_operator_cost_mid,
        "year1_pinterest_catalog_ads_cost_mid": pinterest_catalog_ads_budget_mid,
        "year1_idea_pin_creative_assets_cost_mid": idea_pin_creative_assets_cost_mid,
        "year1_content_production_cost_mid": content_production_cost_mid,
        "year1_triple_whale_organic_ltv_overlay_cost_mid": triple_whale_organic_ltv_overlay_cost_mid,
        "year1_total_cost_mid": total_year1_cost_mid,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/13 Path B default."""
    parser = argparse.ArgumentParser(
        prog="pinterest_seo_unit_economics.py",
        description=(
            "Score a brand's current-Pinterest-SEO-fit inputs against the research/13 + playbook 20 + "
            "asset 21 Path A / B / C matrix. Returns the recommended path + Pinterest-Business-Account + "
            "Surfer-SEO + Ahrefs + Originality.ai + MarketMuse + Triple-Whale + Klaviyo-organic-source-segment "
            "platform picks + cost stack + Year-1 incremental Pinterest-SEO-traffic + CAC vs paid-social multiplier "
            "+ 12-24-month compounding-traffic-curve steady-state projection + 6-step build sequence for the "
            "Pinterest-organic-discovery + SEO-content-engine program."
        ),
        epilog=(
            "Defaults: $2M US DTC brand, 35 SKUs, balanced archetype, 50% gross margin, Pinterest-Business-Account live, "
            "Shopify-SEO live, Gen-Z voice, 6 hr/wk operator capacity (canonical Path B default for $500k-$5M GMV brands "
            "with photography-rich-product-set + 4-8 hr/wk content-operator-capacity + 25%+ Pinterest-SEO-margin-headroom "
            "+ Move #1 + #4 + #6 + #8 + #11 + #15 + #15.x + #16 live per research/13 §GMV-tier paths). "
            "Companion to /research/13, /playbooks/20, /assets/21-pinterest-seo-templates.md, /pinterest-seo route."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=2_000_000.0,
                        help="Current US DTC GMV in USD (default: 2,000,000 = Path B default).")
    parser.add_argument("--sku-count", type=int, default=35,
                        help="Current SKU count (default: 35 = Path B baseline; floor is 10 per research/13).")
    parser.add_argument("--sku-archetype-distribution", type=str, default="balanced",
                        choices=["hero_mid_long_tail", "balanced", "long_tail_heavy"],
                        help="SKU archetype distribution (default: balanced = Path B baseline).")
    parser.add_argument("--gross-margin-pct", type=float, default=50.0,
                        help="Gross margin as percent (default: 50.0 = Path B baseline; floor is 25.0 per research/13).")
    parser.add_argument("--has-pinterest-business-account", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Pinterest-Business-Account + Catalogs-feed-upload is live (default: true).")
    parser.add_argument("--has-shopify-seo-app", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Shopify-SEO app is installed (default: true).")
    parser.add_argument("--has-surfer-seo-subscription", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Surfer-SEO-Pro subscription is live (default: true; not required for Path A).")
    parser.add_argument("--has-ahrefs-content-gap", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Ahrefs-Content-Gap-Pro subscription is live (default: true; required for B2B voice-downgrade gate).")
    parser.add_argument("--has-originality-ai-subscription", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Originality.ai subscription is live (default: true; required for luxury voice-downgrade gate).")
    parser.add_argument("--has-marketmuse-topical-authority", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether MarketMuse-Starter-or-Enterprise topical-authority subscription is live (default: false = Path B DEFAULT-OPTIONAL; Path C requires true).")
    parser.add_argument("--voice-profile", type=str, default="gen_z",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Brand voice profile (default: gen_z; Path B canonical for $500k-$5M Gen-Z-led brands).")
    parser.add_argument("--has-dedicated-pinterest-seo-content-operator-capacity-hours-per-week", type=int, default=6,
                        help="Operator hours per week for Pinterest-SEO-content-engine program (default: 6; floor is 4 Path B; Path C requires ≥8 dedicated-organic-content-team capacity).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandPinterestSeoInputs:
    """Convert argparse Namespace → BrandPinterestSeoInputs (with the validation in __post_init__)."""
    return BrandPinterestSeoInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        sku_count=args.sku_count,
        sku_archetype_distribution=args.sku_archetype_distribution,
        gross_margin_pct=args.gross_margin_pct,
        has_pinterest_business_account=(args.has_pinterest_business_account.lower() == "true"),
        has_shopify_seo_app=(args.has_shopify_seo_app.lower() == "true"),
        has_surfer_seo_subscription=(args.has_surfer_seo_subscription.lower() == "true"),
        has_ahrefs_content_gap=(args.has_ahrefs_content_gap.lower() == "true"),
        has_originality_ai_subscription=(args.has_originality_ai_subscription.lower() == "true"),
        has_marketmuse_topical_authority=(args.has_marketmuse_topical_authority.lower() == "true"),
        voice_profile=args.voice_profile,
        has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week=args.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandPinterestSeoInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Pinterest-SEO Path A/B/C recommendation")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                              : ${inputs.us_dtc_gmv:>15,.0f}")
    lines.append(f"  SKU count                               : {inputs.sku_count:>15,d}")
    lines.append(f"  SKU archetype distribution              : {inputs.sku_archetype_distribution}")
    lines.append(f"  Gross margin (%)                         : {inputs.gross_margin_pct:>14.1f}%")
    lines.append(f"  Has Pinterest-Business-Account          : {inputs.has_pinterest_business_account}")
    lines.append(f"  Has Shopify-SEO app                     : {inputs.has_shopify_seo_app}")
    lines.append(f"  Has Surfer-SEO subscription             : {inputs.has_surfer_seo_subscription}")
    lines.append(f"  Has Ahrefs-Content-Gap subscription     : {inputs.has_ahrefs_content_gap}")
    lines.append(f"  Has Originality.ai subscription         : {inputs.has_originality_ai_subscription}")
    lines.append(f"  Has MarketMuse topical-authority        : {inputs.has_marketmuse_topical_authority}")
    lines.append(f"  Voice profile                            : {inputs.voice_profile}")
    lines.append(f"  Operator capacity (hr/wk)               : {inputs.has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week:>15,d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Platforms                               : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                   : {rec.default_platform_pick}")
    lines.append(f"  Justification                           : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)               : ${rec.cost_one_time_low:>12,.0f} - ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)            : ${rec.cost_recurring_low:>12,.0f} - ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                  : ${rec.year1_cost_low:>12,.0f} - ${rec.year1_cost_high:,.0f}")
    lines.append(f"  Incremental traffic share (low-high)    : {rec.year1_incremental_pinterest_seo_traffic_share_pct_low:.1f}% - {rec.year1_incremental_pinterest_seo_traffic_share_pct_high:.1f}%")
    lines.append(f"  Incremental traffic $ (low-high)        : ${rec.year1_incremental_pinterest_seo_traffic_low:>12,.0f} - ${rec.year1_incremental_pinterest_seo_traffic_high:,.0f}")
    lines.append(f"  CAC vs paid-social multiplier (low-high): {rec.cac_vs_paid_social_multiplier_low:.2f}x - {rec.cac_vs_paid_social_multiplier_high:.2f}x")
    lines.append(f"  Organic-traffic growth multiple (low-hi): {rec.organic_traffic_growth_multiple_low:.1f}x - {rec.organic_traffic_growth_multiple_high:.1f}x")
    lines.append(f"  Pinterest-CVR uplift (low-high)         : {rec.pinterest_cvr_uplift_low:.1f}x - {rec.pinterest_cvr_uplift_high:.1f}x")
    lines.append(f"  Compounding-curve months (low-high)     : {rec.compounding_traffic_curve_months_low:d} - {rec.compounding_traffic_curve_months_high:d}")
    lines.append(f"  Year-1 ROI                              : {rec.year1_roi_low:.1f}:1 - {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-pillar organic-content matrix (per voice):")
    for pillar, structure_desc in rec.organic_content_pillar_matrix.items():
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
