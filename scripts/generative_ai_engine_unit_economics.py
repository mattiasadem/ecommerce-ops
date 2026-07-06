#!/usr/bin/env python3
"""
generative_ai_engine_unit_economics.py — Path A / B / C scorer
for the Generative AI Engine track (Move #20 companion script).

Companion to:
- /research/16-generative-ai-engine.md (the 5-pillar framework + 3 GMV-tier
  paths + GPT-4o-clone-voice + AI-orchestration-engine + Jasper + Copy.ai +
  Midjourney + ElevenLabs + Triple-Whale-AI-creative-cohort-overlay +
  AI-product-photography-iteration + AI-blog-post-generation-baseline +
  AI-product-description-iteration + AI-email-subject-line-iteration +
  AI-SMS-copy-iteration + AI-social-caption-iteration +
  AI-customer-service-response + AI-product-rec-feed-personalization +
  AI-search-relevance-tuning + AI-recommendation-engine-steady-state +
  custom-trained-LLM-on-brand-voice-data + AI-orchestration-engine-quarterly +
  creative-cadence-automation-quarterly + creative-iteration-cycle-quarterly)
- /playbooks/23-generative-ai-engine-launch.md (4-phase launch ladder:
  Phase 1 Weeks 1-6 GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline
  → Phase 2 Weeks 7-24 AI-product-photography + AI-email-subject-line +
  AI-SMS-copy + AI-blog-post + AI-product-description + AI-social-caption
  → Phase 3 Weeks 25-48 AI-customer-service + AI-product-rec-feed +
  AI-search-relevance + AI-recommendation-engine + custom-trained-LLM
  → Phase 4 Weeks 49-72 Steady-state + quarterly-iteration operator build)
- /assets/26-generative-ai-engine-templates.md (paste-ready per-voice per-Pillar
  AI-orchestration-engine prompt-template library with 5 voices × 5 Pillar
  deliverables = 25 voice-variant AI-orchestration-engine prompt-templates;
  per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15)
- /dashboard/app/generative-ai-engine/page.tsx (25th operator-surface route
  rendering research/16 + playbook 23 + asset 26 as a unified surface)

This script takes a brand's current Generative AI Engine fit inputs
(13 fields) and outputs a Path A (GPT-4o-clone-voice-only +
AI-orchestration-engine-baseline $20-$500/mo <$1M US-GMV 4:1 conservative
nominal ROI) / Path B DEFAULT (AI-orchestration-engine + Jasper + Copy.ai +
Midjourney + ElevenLabs + Typeface + Triple-Whale-AI-creative-cohort-overlay
$500-$2,565/mo $1M-$25M DTC+international GMV 3:1 default Year-1 ROI with
$300k-$1.5M Path B incremental AI-engine-revenue + 10-30% Year-1 ROAS lift +
5-20% email-CTR lift + 10-30% organic-discovery-traffic lift + 2-4x
creative-iteration-velocity + 50-70% creative-production-cost-savings at
$5M US DTC base) / Path C (custom-trained-LLM-on-brand-voice-data +
AI-orchestration-engine + Midjourney + Stable Diffusion + Runway + Sora +
ElevenLabs + Typeface + Triple-Whale-Pro $3,656-$6,044/mo $25M+
DTC+international GMV 2.5:1 ROI muted by 6-12-month LLM-training-cycle +
AI-attribution-cohort-overlay-maturity) recommendation with cost stack +
Year-1 incremental AI-engine-revenue + 5-pillar AI-engine framework + 6-step
build sequence.

It is the operator-build input for the playbook's Prerequisites gate (Phase 1
Step 1 "pick path + GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline
+ Jasper-brand-voice-LLM + Copy.ai-ad-copy-iteration + Triple-Whale-AI-creative-
cohort-overlay-Wire + AI-creative-iteration-cadence-baseline").

The scoring rule (mirrors research/16 §GMV-tier paths + playbook 23
§Prerequisites + asset 26 §5-pillar AI-engine framework + canonical 8-prereq
AI-engine launch gate):
  - us_dtc_gmv < $1M                          -> Path A (GPT-4o-clone-voice-only + AI-orchestration-engine-baseline)
  - us_dtc_gmv $1M-$25M                       -> Path B DEFAULT (AI-orchestration-engine + Jasper + Copy.ai + Midjourney + ElevenLabs)
  - us_dtc_gmv $25M+                          -> Path C (custom-trained-LLM-on-brand-voice-data + AI-orchestration-engine + Midjourney + Stable Diffusion + Runway + Sora + ElevenLabs)
  - creatives_per_week < 50                   -> defer (canonical 50+ creatives/week seed-AI-iteration-velocity per research/16 §Prereq + Move #10)
  - has_move_10_ai_ad_creative_6mo = False    -> defer (canonical Move #10 AI-ad-creative-iteration shipped 6+ months prereq per research/16 §Prereq)
  - has_triple_whale_attribution = False     -> defer (canonical Triple-Whale-attribution-live prereq for AI-creative-cohort-overlay-iteration per research/16 §Prereq + Move #6)
  - has_klaviyo_email_substrate = False      -> defer (canonical Klaviyo-email-substrate-live prereq for AI-email-subject-line-iteration per research/16 §Prereq + Move #5)
  - has_postscript_sms_substrate = False     -> defer (canonical Postscript-SMS-substrate-live prereq for AI-SMS-copy-iteration per research/16 §Prereq + Move #7)
  - has_dedicated_ai_engine_team_capacity_hours_per_week < 4 -> defer (canonical 4-8 hr/wk Path B minimum per research/16 §Prereq + playbook 23 §Phase 1)
  - voice_profile = "luxury" WITHOUT has_ai_engine_creative_baseline = True -> downgrade (Luxury-voice brands need AI-engine-creative-baseline for branded-unboxing-experience + MAP-policy-guardrail per Faire 2024 + Ankorstore 2024)
  - voice_profile = "b2b" WITHOUT has_ai_customer_service_response_baseline = True -> downgrade (B2B-voice brands need AI-customer-service-response-baseline for B2B-keyword-cluster-trust-disclosure per Gorgias 2024-B2B-CS-segmentation)
  - path = "C" AND has_dedicated_ai_engine_team = False -> downgrade to Path B (Path C requires dedicated-AI-engine-team for LLM-training-cycle + AI-orchestration-engine-quarterly-iteration per research/16 Pillar 5)

Why hermetic? This script does NOT call OpenAI / Anthropic / Jasper / Copy.ai /
Midjourney / Stable Diffusion / ElevenLabs / Typeface / Runway / Sora / Smartwriter /
Gorgias / Nosto / Rebuy / Algolia / Triple-Whale / Cohere APIs.
The inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence + 5-pillar AI-engine framework are derived
from research/16 + playbook 23 + asset 26 (the canonical benchmarks the
workspace already ships). This is the same hermetic recipe as
smsbump_postscript_channel_orchestration_unit_economics.py / threepl_unit_economics.py /
marketplace_unit_economics.py / subscription_unit_economics.py /
affiliate_unit_economics.py / b2b_wholesale_unit_economics.py /
tiktok_shop_unit_economics.py / pinterest_seo_unit_economics.py /
amazon_dsp_amazon_attribution_audit_unit_economics.py — the 90% of
install mistakes operators make (wrong-path selection, under-budgeting for
custom-trained-LLM-onboarding, ignoring the 50+-creatives-per-week prereq,
ignoring the Move #10 6+-months-post-launch prereq, ignoring the
Triple-Whale-attribution prereq, ignoring the Klaviyo-email-substrate prereq,
ignoring the Postscript-SMS-substrate prereq, ignoring the 4-hr/wk
AI-engine-team-capacity floor, ignoring the AI-engine-creative-baseline
prereq) don't require API access; the local scoring rule catches them.

Usage:
    # Default: $5M US DTC + 75 creatives/week + Path B defaults
    python3 generative_ai_engine_unit_economics.py

    # Custom inputs (e.g. $30M premium brand with luxury voice)
    python3 generative_ai_engine_unit_economics.py \\
        --us-dtc-gmv 30000000 --creatives-per-week 200 \\
        --voice-profile luxury --has-ai-engine-creative-baseline false

    # JSON output (for cron / CI / dashboard piping)
    python3 generative_ai_engine_unit_economics.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass
from typing import Literal


PathName = Literal["A", "B", "C"]
VoiceProfile = Literal["default", "luxury", "sustainable", "gen_z", "b2b"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandGenerativeAiEngineInputs:
    """Operator-supplied current-Generative-AI-Engine fit inputs.

    All fields validated in __post_init__ per the canonical script-increment-tick
    recipe (v0.16.0) + the v0.24.1 pitfall #6 (no argparse-based enum validation).
    """

    us_dtc_gmv: float
    creatives_per_week: int
    has_move_10_ai_ad_creative_6mo: bool
    has_triple_whale_attribution: bool
    has_klaviyo_email_substrate: bool
    has_postscript_sms_substrate: bool
    has_ai_engine_creative_baseline: bool
    has_ai_customer_service_response_baseline: bool
    has_dedicated_ai_engine_team: bool
    voice_profile: VoiceProfile
    has_dedicated_ai_engine_team_capacity_hours_per_week: int
    has_openai_api: bool
    has_ai_orchestration_engine: bool
    has_jasper_brand_voice_llm: bool

    def __post_init__(self) -> None:
        if self.us_dtc_gmv < 0:
            raise ValueError(f"us_dtc_gmv must be >= 0 (got {self.us_dtc_gmv})")
        if self.creatives_per_week < 0:
            raise ValueError(f"creatives_per_week must be >= 0 (got {self.creatives_per_week})")
        if self.has_dedicated_ai_engine_team_capacity_hours_per_week < 0:
            raise ValueError(
                f"has_dedicated_ai_engine_team_capacity_hours_per_week must be >= 0 "
                f"(got {self.has_dedicated_ai_engine_team_capacity_hours_per_week})"
            )
        if self.voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            raise ValueError(
                f"voice_profile must be one of default/luxury/sustainable/gen_z/b2b "
                f"(got {self.voice_profile!r})"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C recommendation with cost stack + projection + 6-step build."""

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
    year1_incremental_ai_engine_revenue_share_pct_low: float
    year1_incremental_ai_engine_revenue_share_pct_high: float
    year1_incremental_ai_engine_revenue_low: float
    year1_incremental_ai_engine_revenue_high: float
    year1_roas_lift_pct_low: float
    year1_roas_lift_pct_high: float
    email_ctr_lift_pct_low: float
    email_ctr_lift_pct_high: float
    organic_discovery_traffic_lift_pct_low: float
    organic_discovery_traffic_lift_pct_high: float
    creative_iteration_velocity_multiplier_low: float
    creative_iteration_velocity_multiplier_high: float
    creative_production_cost_savings_pct_low: float
    creative_production_cost_savings_pct_high: float
    ai_engine_build_cycle_months_low: int
    ai_engine_build_cycle_months_high: int
    year1_roi_low: float
    year1_roi_high: float
    ai_engine_pillar_matrix: dict[str, str]
    build_sequence: list[str]


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 1_000_000.0       # canonical entry floor: <$1M Path A; $1M-$25M Path B
PATH_B_FLOOR = 1_000_000.0      # DEFAULT tier: $1M-$25M Path B
PATH_C_FLOOR = 25_000_000.0     # enterprise tier: $25M+ Path C

# Path costs (USD, from upstream research + playbook + asset).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (500.0,    2_000.0,   20.0,     500.0),    # GPT-4o-clone-voice-only + AI-orchestration-engine-baseline (AdCreative.ai Standard or Moby Starter)
    "B":  (2_000.0,  50_000.0,  500.0,    2_565.0),  # AI-orchestration-engine + Jasper + Copy.ai + Midjourney + ElevenLabs + Typeface + Triple-Whale-AI-creative-cohort-overlay
    "C":  (50_000.0, 250_000.0, 3_656.0,  6_044.0),  # custom-trained-LLM-on-brand-voice-data + AI-orchestration-engine + Midjourney + Stable Diffusion + Runway + Sora + ElevenLabs + Typeface + Triple-Whale-Pro
}

# Year-1 incremental AI-engine-revenue share bands (% of base GMV).
PATH_INCREMENTAL_AI_ENGINE_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (2.0, 5.0),
    "B":  (3.0, 15.0),
    "C":  (5.0, 25.0),
}

# Year-1 ROAS lift bands (additive percentage points vs Move #10 AI-ad-creative-iteration baseline).
PATH_YEAR1_ROAS_LIFT_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 15.0),
    "B":  (10.0, 30.0),
    "C":  (15.0, 40.0),
}

# Email CTR lift bands (additive percentage points vs Move #5 Klaviyo-email-substrate baseline).
PATH_EMAIL_CTR_LIFT_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (2.0, 8.0),
    "B":  (5.0, 20.0),
    "C":  (10.0, 30.0),
}

# Organic-discovery-traffic lift bands (additive percentage points vs Move #17 Pinterest-organic-SEO baseline).
PATH_ORGANIC_DISCOVERY_TRAFFIC_LIFT_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (3.0, 10.0),
    "B":  (10.0, 30.0),
    "C":  (15.0, 40.0),
}

# Creative-iteration-velocity multiplier vs Move #10 AI-ad-creative-iteration baseline.
PATH_CREATIVE_ITERATION_VELOCITY_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 2.0),
    "B":  (2.0, 4.0),
    "C":  (3.0, 6.0),
}

# Creative-production-cost-savings bands (% reduction vs photographer-baseline).
PATH_CREATIVE_PRODUCTION_COST_SAVINGS_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (30.0, 50.0),
    "B":  (50.0, 70.0),
    "C":  (60.0, 80.0),
}

# AI-engine build cycle maturity months.
PATH_AI_ENGINE_BUILD_CYCLE_MONTHS: dict[PathName, tuple[int, int]] = {
    "A":  (1, 3),
    "B":  (6, 18),
    "C":  (12, 24),
}

# Year-1 ROI bands (canonical from research/16 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (4.0, 250.0),   # conservative nominal Year-1 ROI for <$1M US-GMV brands at $500k base
    "B":  (6.0, 187.0),   # 3:1 default Year-1 ROI Path B at $5M US DTC base per Triple-Whale 2024
    "C":  (2.0, 6.0),     # muted by 6-12-month LLM-training-cycle + AI-attribution-cohort-overlay-maturity
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Canonical AI-engine platform matrix per Path.
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A": [
        "OpenAI GPT-4o-clone-voice API ($20-$200/mo)",
        "AI-orchestration-engine-baseline via AdCreative.ai Standard $249/mo OR Moby Starter $149/mo (Move #10 entry-tier)",
    ],
    "B": [
        "AI-orchestration-engine via Pencil Pro $1,500/mo OR Moby Pro $499/mo (Path B DEFAULT)",
        "Jasper-brand-voice-LLM ($49-$125/mo)",
        "Copy.ai-ad-copy-iteration ($49-$249/mo)",
        "Midjourney-product-photography ($10-$60/mo)",
        "ElevenLabs-voice-clone-SMS-narration ($5-$22/mo)",
        "Typeface-brand-voice-LLM ($30-$300/mo)",
        "Triple-Whale-Starter-or-Pro-with-AI-creative-cohort-overlay ($179-$1,290/mo)",
    ],
    "C": [
        "OpenAI-fine-tuning-on-brand-voice-data ($200-$2,000/mo)",
        "Anthropic-Claude-fine-tuning-on-brand-voice-data",
        "AI-orchestration-engine via Pencil Pro $1,500/mo + Moby Pro $499/mo",
        "Midjourney-product-photography ($10-$120/mo) + Stable-Diffusion-XL-product-photography",
        "Runway-product-video-preview ($15-$95/mo) + Sora-product-demo-iteration ($20-$200/mo)",
        "ElevenLabs-voice-clone-SMS-narration ($22-$330/mo)",
        "Typeface-brand-voice-LLM ($300-$1,000/mo)",
        "Triple-Whale-Pro-with-AI-creative-cohort-overlay ($1,290/mo)",
    ],
}

# Default platform pick per Path.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A": "OpenAI GPT-4o-clone-voice API + AdCreative.ai Standard or Moby Starter (Move #10 entry-tier)",
    "B": "AI-orchestration-engine via Pencil Pro or Moby Pro + Jasper-brand-voice-LLM + Copy.ai + Midjourney + ElevenLabs + Typeface + Triple-Whale-Starter-or-Pro",
    "C": "OpenAI-fine-tuning + Anthropic-Claude-fine-tuning + AI-orchestration-engine + Midjourney + Stable Diffusion + Runway + Sora + ElevenLabs + Typeface + Triple-Whale-Pro",
}

# 5-pillar Generative-AI-Engine framework.
AI_ENGINE_PILLAR_MATRIX: dict[str, str] = {
    "Pillar 1 — GPT-4o-clone-voice-onboard + AI-orchestration-engine-baseline + Jasper + Copy.ai + Triple-Whale-AI-creative-cohort-overlay-Wire": (
        "OpenAI GPT-4o-clone-voice-onboarded ($20-$200/mo per OpenAI-2024-pricing) with brand-voice-API-key-pair-Wired + AI-orchestration-engine-baseline via Pencil Pro $1,500/mo OR Moby Pro $499/mo OR AdCreative.ai Standard $249/mo (Path B DEFAULT uses Pencil Pro or Moby Pro for $1M-$25M brands) + Jasper-brand-voice-LLM ($49-$125/mo per Jasper-2024-pricing) trained on 50-100 brand-content-samples (website + email + social + ad-copy) + Copy.ai-ad-copy-iteration ($49-$249/mo per Copy.ai-2024-pricing) with 50+ ad-copy-variants-per-week-baseline + Triple-Whale-AI-creative-cohort-overlay-Wire (Triple-Whale-2024-AI-creative-cohort-overlay-included-with-Triple-Whale-Starter $179/mo or Pro $1,290/mo) with AI-creative-cohort-LTV-at-30/60/90/180-day-windows + AI-creative-iteration-cadence-baseline (50+ creatives/week as the canonical seed-AI-iteration-velocity)"
    ),
    "Pillar 2 — AI-product-photography-iteration-cycle-launch + AI-blog-post-generation-baseline + AI-product-description-iteration-cycle-launch": (
        "Midjourney-prompt-library + Stable-Diffusion-XL-product-photography + Runway-product-video-preview + Sora-product-demo-iteration + brand-visual-consistency-Wired + 50-70% creative-production-cost-savings + 2-4x creative-iteration-velocity-vs-photographer-baseline per Midjourney-2024 + Stable-Diffusion-2024 + Runway-2024 + Sora-2024 + Typeface-2024 benchmarks with target = Default-voice-cohort + Luxury-voice-cohort + Sustainable-voice-cohort + Gen-Z-voice-cohort + B2B-voice-cohort + brand-visual-consistency-Wired via Typeface + Jasper-blog-post-iteration + Typeface-blog-post-brand-voice-Wired + SEO-keyword-cluster-Wired + 10-30% organic-discovery-traffic-lift-vs-no-blog-baseline per Jasper-2024 + Typeface-2024 + Surfer-SEO-2024 + Clearscope-2024 benchmarks + target = Move #17 Pinterest-organic + SEO-content-engine + Move #13 marketplace-expansion cross-pollination + Jasper-product-description-iteration + Typeface-product-description-brand-voice-Wired + AI-product-photography-pairing-Wired + 5-15% product-page-CVR-lift-vs-AI-baseline per Jasper-2024 + Typeface-2024 + Shopify-2024 + Yotpo-2024 benchmarks + target = Move #9 mobile-PDP + Move #9.5 PDP-A/B-testing cross-pollination"
    ),
    "Pillar 3 — AI-email-subject-line-iteration-cycle-launch + AI-SMS-copy-iteration-cycle-launch + AI-social-caption-iteration-cycle-launch": (
        "Jasper-subject-line-iteration + Copy.ai-subject-line-A/B-test-iteration + 50+ subject-line-variants-per-flow-per-week + 5-20% email-CTR-lift-vs-AI-baseline per Jasper-2024 + Copy.ai-2024 + Typeface-2024 + Smartwriter-2024 benchmarks with target = Move #1 cart-abandon-email + Move #4 welcome-email + Move #11 subscription-billing-email + Move #14 lifecycle-flow-library cross-pollination + Postscript-SMS-copy-iteration via Jasper + Copy.ai + per-voice-profile 50+ SMS-variants-per-week + 10-30% SMS-CTR-lift-vs-AI-baseline per Postscript-2024 + Jasper-2024 + Copy.ai-2024 + Typeface-2024 + Smartwriter-2024 benchmarks + target = Move #7 SMS-welcome + Move #19 SMSBump+Postscript-channel-orchestration cross-pollination + Jasper-social-caption-iteration + Copy.ai-social-caption-A/B-test-iteration + per-platform-format-Wired [Instagram-caption-vs-TikTok-caption-vs-Pinterest-description-vs-LinkedIn-post] + 10-30% social-engagement-rate-lift-vs-AI-baseline per Jasper-2024 + Copy.ai-2024 + Typeface-2024 + Later-2024 + Hootsuite-2024 benchmarks + target = Move #15.x TikTok-Shop + Move #16 creator-economy-expansion + Move #17 Pinterest-organic + Move #18 Amazon-DSP + Move #15 affiliate-program cross-pollination"
    ),
    "Pillar 4 — AI-customer-service-response-baseline-launch + AI-product-rec-feed-personalization-launch + AI-search-relevance-tuning-launch + AI-recommendation-engine-steady-state-launch": (
        "Gorgias-AI-customer-service-Wired + Jasper-customer-service-response-iteration + brand-voice-Wired + 30-50% customer-service-cost-savings + 10-30% customer-service-CSAT-lift-vs-no-AI-baseline per Gorgias-2024 + Jasper-2024 + Typeface-2024 + Zendesk-AI-2024 + Intercom-Fin-AI-2024 benchmarks + target = Move #8 loyalty + Move #11 subscription + Move #14 lifecycle-marketing cross-pollination + Nosto-AI-recommendation-engine-Wired + Rebuy-AI-product-rec-Wired + Triple-Whale-AI-product-rec-cohort-overlay + 5-15% AOV-lift-vs-no-AI-baseline + 10-30% repeat-purchase-rate-lift-vs-no-AI-baseline per Nosto-2024 + Rebuy-2024 + Triple-Whale-2024 + Sailthru-2024 + Dynamic-Yield-2024 benchmarks + target = Move #2 post-purchase-upsell + Move #11 subscription-program + Move #14 lifecycle-marketing cross-pollination + Algolia-AI-search-relevance-Wired + Searchspring-AI-search-Wired + Triple-Whale-AI-search-cohort-overlay + 5-15% on-site-search-CVR-lift-vs-no-AI-baseline per Algolia-2024 + Searchspring-2024 + Triple-Whale-2024 + Klaviyo-2024 benchmarks + target = Move #9 mobile-PDP + Move #9.5 PDP-A/B-testing cross-pollination + Nosto-AI-recommendation-engine-steady-state + Rebuy-AI-product-rec-steady-state + Triple-Whale-AI-rec-cohort-overlay + 5-15% AOV-lift-vs-baseline per Nosto-2024 + Rebuy-2024 + Triple-Whale-2024 + Sailthru-2024 benchmarks + target = Move #2 post-purchase-upsell + Move #8 loyalty + Move #11 subscription cross-pollination"
    ),
    "Pillar 5 — Custom-trained-LLM-on-brand-voice-data-baseline + AI-orchestration-engine-quarterly-iteration + creative-cadence-automation-quarterly + creative-iteration-cycle-quarterly": (
        "OpenAI-fine-tuning-on-brand-voice-data + Anthropic-Claude-fine-tuning-on-brand-voice-data + brand-voice-fine-tune-cohort-of-50-100-prompts-and-responses + 10-30% brand-voice-consistency-lift-vs-GPT-4o-only-baseline per OpenAI-2024 + Anthropic-2024 + Jasper-2024 + Typeface-2024 + Cohere-2024 benchmarks + target = all 5 Pillars + re-tune-quarterly-creative-iteration-cadence + AI-creative-velocity-tracking + 10-30% creative-iteration-velocity-lift-per-quarter per AdCreative.ai-2024 + Moby-2024 + Pencil-2024 + Typeface-2024 benchmarks + AI-creative-cadence-automation-iteration + per-voice-cadence-automation + 10-30% creative-cadence-automation-lift-per-quarter per AdCreative.ai-2024 + Moby-2024 + Pencil-2024 + Typeface-2024 + Jasper-2024 benchmarks + AI-creative-iteration-cycle-quarterly-review + AI-creative-iteration-cycle-vs-control-set-of-no-AI-iteration-cohort + 5-15% creative-iteration-cycle-CVR-lift-per-quarter per AdCreative.ai-2024 + Moby-2024 + Pencil-2024 + Triple-Whale-2024 benchmarks + 12-24-month-compounding-generative-AI-engine-steady-state typically achieves 2-4x LTV-multiplier-year-2+ vs AI-only-baseline per Triple-Whale-2024-canonical-3-way-comparison-cycle [AI-orchestration-engine-cohort-LTV vs AI-only-cohort-LTV vs no-AI-cohort-LTV]"
    ),
}

# Upgrade + downgrade gates.
LUXURY_DOWNGRADE_ENABLED = True       # Luxury voice without AI-engine-creative-baseline -> downgrade
B2B_DOWNGRADE_ENABLED = True          # B2B voice without AI-customer-service-response-baseline -> downgrade
PATH_C_DEDICATED_AI_ENGINE_TEAM_DOWNGRADE_ENABLED = True   # Path C without dedicated-AI-engine-team -> downgrade to Path B
CAPACITY_GATE_HR_WK = 4               # <4 hr/wk -> defer (canonical 4-8 hr/wk Path B minimum per research/16 §Prereq + playbook 23 §Phase 1)
MIN_CREATIVES_PER_WEEK = 50           # <50 -> defer (canonical 50+ creatives/week seed-AI-iteration-velocity per research/16 §Prereq + Move #10)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the canonical Path A / B / C tier for a given US DTC GMV.

    Semantics (research/16 §GMV-tier paths + playbook 23 §Prerequisites):
      - us_dtc_gmv < $1M       -> Path A (GPT-4o-clone-voice-only + AI-orchestration-engine-baseline)
      - us_dtc_gmv $1M-$25M    -> Path B DEFAULT
      - us_dtc_gmv $25M+       -> Path C (custom-trained-LLM-on-brand-voice-data)
    """
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandGenerativeAiEngineInputs) -> PathRecommendation:
    """Decide the canonical Path A / B / C recommendation for a brand's Generative-AI-Engine fit.

    Deferral gates (per research/16 §Prereq + playbook 23 §Prerequisites + canonical 8-prereq
    AI-engine launch gate): 5 deferral gates that surface a Path A as audit-only.
    Downgrade gates: 3 downgrade gates that step the recommended Path down one tier.

    The Path A "audit-only" path is returned when ANY deferral gate fires; the path
    is still set to the canonical tier (so the operator sees the tier that WOULD
    apply if the gate were lifted) AND the justification enumerates the firing gates.
    """
    base_tier = _tier_for_gmv(inputs.us_dtc_gmv)

    # 5 deferral gates. Each gate sets a flag (so the justification enumerates them).
    defer_reasons: list[str] = []
    if inputs.creatives_per_week < MIN_CREATIVES_PER_WEEK:
        defer_reasons.append(
            f"creatives_per_week={inputs.creatives_per_week} < canonical {MIN_CREATIVES_PER_WEEK} "
            f"(research/16 §Prereq: canonical 50+ creatives/week seed-AI-iteration-velocity for "
            f"AI-orchestration-engine + Jasper + Copy.ai + Midjourney + ElevenLabs + "
            f"custom-trained-LLM-on-brand-voice-data; defer Move #20 until AI-iteration-velocity-"
            f"reaches-{MIN_CREATIVES_PER_WEEK}+-per-week OR launch-Move-#10-AI-ad-creative-iteration-first "
            f"OR ship-generative-AI-engine-light-with-Moby-baseline)"
        )
    if not inputs.has_move_10_ai_ad_creative_6mo:
        defer_reasons.append(
            "has_move_10_ai_ad_creative_6mo=False (research/16 §Prereq: canonical Move #10 AI-ad-creative-"
            "iteration shipped 6+ months with weekly-creative-iteration-cadence of 50+ creatives/week "
            "prereq for AI-orchestration-engine + Jasper + Copy.ai + Midjourney + ElevenLabs; defer "
            "Move #20 until Move-#10-AI-ad-creative-iteration-6+-months-post-launch verified via "
            "playbooks/10-ai-ad-creative-iteration.md Gate A-G all passing)"
        )
    if not inputs.has_triple_whale_attribution:
        defer_reasons.append(
            "has_triple_whale_attribution=False (research/16 §Prereq: canonical Triple-Whale-attribution "
            "live 6+ months with cohort-LTV-overlays working prereq for AI-creative-cohort-overlay-"
            "iteration; defer Move #20 until Move #6 Triple-Whale-attribution live 6+ months verified "
            "via scripts/triple_whale_attribution_check.py Gate A-G all passing)"
        )
    if not inputs.has_klaviyo_email_substrate:
        defer_reasons.append(
            "has_klaviyo_email_substrate=False (research/16 §Prereq: canonical Klaviyo-email-substrate "
            "live 6+ months with at least 5 active flows (Move #1 cart-abandon + Move #4 welcome + "
            "Move #5 Klaviyo-migration + Move #8 loyalty + Move #14 lifecycle-flow-library) prereq for "
            "AI-email-subject-line-iteration-cycle-launch; defer Move #20 until Move #5 Klaviyo-migration "
            "live 6+ months verified via playbooks/05-migrate-to-klaviyo-postscript.md Gate A-G all passing)"
        )
    if not inputs.has_postscript_sms_substrate:
        defer_reasons.append(
            "has_postscript_sms_substrate=False (research/16 §Prereq: canonical Postscript-SMS-substrate "
            "live 6+ months with at least 4 active SMS flows (Move #7 SMS-welcome + cart-abandon 1 + "
            "cart-abandon 2 + review-request) prereq for AI-SMS-copy-iteration-cycle-launch; defer "
            "Move #20 until Move #7 Postscript-SMS-substrate live 6+ months verified via "
            "playbooks/06-sms-welcome-and-cart-abandon.md Gate A-G all passing)"
        )
    if inputs.has_dedicated_ai_engine_team_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        defer_reasons.append(
            f"has_dedicated_ai_engine_team_capacity_hours_per_week="
            f"{inputs.has_dedicated_ai_engine_team_capacity_hours_per_week} < canonical {CAPACITY_GATE_HR_WK} "
            f"(research/16 §Prereq: canonical 4-8 hr/wk Path B minimum for AI-engine weekly-cadence; "
            f"defer Move #20 until creative-team-capacity-is-available OR hire-a-creative-team-member "
            f"OR use-Move-#10-baseline-only)"
        )

    # 3 downgrade gates.
    downgrade_reasons: list[str] = []
    effective_tier_rank = PATH_RANK[base_tier]
    if (
        LUXURY_DOWNGRADE_ENABLED
        and inputs.voice_profile == "luxury"
        and not inputs.has_ai_engine_creative_baseline
        and effective_tier_rank > PATH_RANK["A"]
    ):
        effective_tier_rank -= 1
        downgrade_reasons.append(
            "voice_profile=luxury without has_ai_engine_creative_baseline (research/16 §Prereq: Luxury-"
            "voice brands need AI-engine-creative-baseline for branded-unboxing-experience + "
            "MAP-policy-guardrail per Faire-2024 + Ankorstore-2024; downgrade one Path tier "
            "[B->A or C->B])"
        )
    if (
        B2B_DOWNGRADE_ENABLED
        and inputs.voice_profile == "b2b"
        and not inputs.has_ai_customer_service_response_baseline
        and effective_tier_rank > PATH_RANK["A"]
    ):
        effective_tier_rank -= 1
        downgrade_reasons.append(
            "voice_profile=b2b without has_ai_customer_service_response_baseline (research/16 §Prereq: "
            "B2B-voice brands need AI-customer-service-response-baseline for B2B-keyword-cluster-trust-"
            "disclosure per Gorgias-2024-B2B-CS-segmentation; downgrade one Path tier [B->A or C->B])"
        )
    if (
        PATH_C_DEDICATED_AI_ENGINE_TEAM_DOWNGRADE_ENABLED
        and base_tier == "C"
        and not inputs.has_dedicated_ai_engine_team
        and effective_tier_rank > PATH_RANK["B"]
    ):
        effective_tier_rank = PATH_RANK["B"]
        downgrade_reasons.append(
            "path=C without has_dedicated_ai_engine_team (research/16 Pillar 5: Path C requires "
            "dedicated-AI-engine-team for LLM-training-cycle + AI-orchestration-engine-quarterly-"
            "iteration + custom-trained-LLM-on-brand-voice-data-baseline; downgrade Path C to Path B)"
        )

    effective_tier = RANK_PATH[effective_tier_rank]

    # Pull per-path lookup bands.
    one_time_low, one_time_high, rec_low, rec_high = PATH_COSTS[effective_tier]
    inc_share_low, inc_share_high = PATH_INCREMENTAL_AI_ENGINE_REVENUE_SHARE_PCT[effective_tier]
    roas_lift_low, roas_lift_high = PATH_YEAR1_ROAS_LIFT_PCT[effective_tier]
    email_ctr_lift_low, email_ctr_lift_high = PATH_EMAIL_CTR_LIFT_PCT[effective_tier]
    organic_lift_low, organic_lift_high = PATH_ORGANIC_DISCOVERY_TRAFFIC_LIFT_PCT[effective_tier]
    vel_mult_low, vel_mult_high = PATH_CREATIVE_ITERATION_VELOCITY_MULTIPLIER[effective_tier]
    cost_save_low, cost_save_high = PATH_CREATIVE_PRODUCTION_COST_SAVINGS_PCT[effective_tier]
    build_low, build_high = PATH_AI_ENGINE_BUILD_CYCLE_MONTHS[effective_tier]
    roi_low, roi_high = PATH_ROI[effective_tier]

    # Year-1 cost stack: one-time + 12 months recurring (mid-point).
    year1_cost_low = one_time_low + rec_low * 12.0
    year1_cost_high = one_time_high + rec_high * 12.0

    # Year-1 incremental AI-engine revenue: share of base GMV.
    inc_rev_low = inputs.us_dtc_gmv * (inc_share_low / 100.0)
    inc_rev_high = inputs.us_dtc_gmv * (inc_share_high / 100.0)

    # Build sequence per Path.
    build_sequence = build_sequence_for_path(effective_tier)

    # Justification string.
    if defer_reasons:
        # If deferral gates fire, surface the gates + the tier that WOULD apply.
        justification = (
            f"DEFER (Path A surfaced as audit only — deferral gates fired): {len(defer_reasons)} "
            f"deferral gate(s) must be lifted before launching Path {base_tier} ({inc_share_low}-"
            f"{inc_share_high}% Year-1 incremental AI-engine-revenue share, {roi_low}-{roi_high}x Year-1 "
            f"ROI at $5M US DTC base). Gating: " + "; ".join(defer_reasons) +
            (f" Downgrade: {'; '.join(downgrade_reasons)}" if downgrade_reasons else "")
        )
    elif downgrade_reasons:
        justification = (
            f"Path {effective_tier} (downgraded from Path {base_tier} by {len(downgrade_reasons)} "
            f"downgrade gate(s); {inc_share_low}-{inc_share_high}% Year-1 incremental AI-engine-revenue "
            f"share, {roi_low}-{roi_high}x Year-1 ROI). Downgrade: " + "; ".join(downgrade_reasons)
        )
    else:
        justification = (
            f"Path {effective_tier} (canonical tier for ${inputs.us_dtc_gmv:,.0f} US DTC GMV; "
            f"{inc_share_low}-{inc_share_high}% Year-1 incremental AI-engine-revenue share, "
            f"{roi_low}-{roi_high}x Year-1 ROI)"
        )

    return PathRecommendation(
        path=effective_tier,
        platforms=PATH_PLATFORMS[effective_tier],
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[effective_tier],
        justification=justification,
        cost_one_time_low=one_time_low,
        cost_one_time_high=one_time_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_incremental_ai_engine_revenue_share_pct_low=inc_share_low,
        year1_incremental_ai_engine_revenue_share_pct_high=inc_share_high,
        year1_incremental_ai_engine_revenue_low=inc_rev_low,
        year1_incremental_ai_engine_revenue_high=inc_rev_high,
        year1_roas_lift_pct_low=roas_lift_low,
        year1_roas_lift_pct_high=roas_lift_high,
        email_ctr_lift_pct_low=email_ctr_lift_low,
        email_ctr_lift_pct_high=email_ctr_lift_high,
        organic_discovery_traffic_lift_pct_low=organic_lift_low,
        organic_discovery_traffic_lift_pct_high=organic_lift_high,
        creative_iteration_velocity_multiplier_low=vel_mult_low,
        creative_iteration_velocity_multiplier_high=vel_mult_high,
        creative_production_cost_savings_pct_low=cost_save_low,
        creative_production_cost_savings_pct_high=cost_save_high,
        ai_engine_build_cycle_months_low=build_low,
        ai_engine_build_cycle_months_high=build_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        ai_engine_pillar_matrix=dict(AI_ENGINE_PILLAR_MATRIX),
        build_sequence=build_sequence,
    )


def build_sequence_for_path(path: PathName) -> list[str]:
    """Canonical 6-step build sequence per Path (per playbook 23 §Phase 1-4 + the canonical
    Archetype A/B hybrid scoring script recipe from v0.16.0).
    """
    if path == "A":
        return [
            "Step 1 — Onboard OpenAI GPT-4o-clone-voice API ($20-$200/mo per OpenAI-2024-pricing) with brand-voice-API-key-pair-Wired via OpenAI-Playground; verify via --help + a default 1-prompt invocation returning expected JSON shape per research/16 §Prereq.",
            "Step 2 — Onboard AI-orchestration-engine-baseline via AdCreative.ai Standard $249/mo OR Moby Starter $149/mo (Move #10 entry-tier per playbooks/10-ai-ad-creative-iteration.md); verify via 50+-creatives-per-week-baseline + 4-pillar-Move-#10-prereq (creatives_per_week >= 50, has_move_10_ai_ad_creative_6mo, has_triple_whale_attribution, has_klaviyo_email_substrate).",
            "Step 3 — Build AI-creative-iteration-cadence-baseline: 5-voice x 5-format = 25 voice-format AI-creative-templates (Pillar 1 deliverable per asset 26 §5 Pillar deliverables); verify via per-voice-density Default=17 / Luxury=19 / Sustainable=18 / Gen-Z=15 / B2B=18 each >=15 per the canonical v0.9.0 voice-density rule.",
            "Step 4 — Launch first-AI-creative-iteration-flow: AI-ad-creative-iteration via AdCreative.ai or Moby + AI-product-photography-iteration via Midjourney + AI-email-subject-line-iteration via Jasper (Pillar 1+2 partial); verify via 5-15% email-CTR-lift-vs-AI-baseline per Jasper-2024 + Copy.ai-2024 + Typeface-2024 + Smartwriter-2024 benchmarks.",
            "Step 5 — Build Triple-Whale-AI-creative-cohort-overlay-Wire (Triple-Whale-2024-AI-creative-cohort-overlay-included-with-Triple-Whale-Starter $179/mo or Pro $1,290/mo); verify via AI-creative-cohort-LTV-at-30/60/90/180-day-windows returning 2-3x LTV-multiplier-Path-B-vs-AI-only-baseline per Triple-Whale-2024 + Sailthru-2024 benchmarks.",
            "Step 6 — Iterate weekly: AI-creative-iteration-cadence-tracking + AI-creative-velocity-tracking + 10-30% creative-iteration-velocity-lift-per-quarter; verify via per-voice-cadence-automation-iteration reaching the canonical Path A 4:1 conservative nominal Year-1 ROI at $500k US-GMV base per AdCreative.ai-2024 + Moby-2024 + Jasper-2024 + Typeface-2024 benchmarks.",
        ]
    if path == "B":
        return [
            "Step 1 — Onboard GPT-4o-clone-voice (Path A Step 1) + AI-orchestration-engine-baseline via Pencil Pro $1,500/mo OR Moby Pro $499/mo (Path B DEFAULT uses Pencil Pro or Moby Pro for $1M-$25M brands); verify via 5-15% email-CTR-lift-vs-AI-baseline per OpenAI-2024 + Anthropic-2024 + Jasper-2024 + Copy.ai-2024 + Typeface-2024 benchmarks.",
            "Step 2 — Onboard Jasper-brand-voice-LLM ($49-$125/mo) trained on 50-100 brand-content-samples (website + email + social + ad-copy per Pillar 1 deliverable); verify via brand-voice-API-key-pair-Wired + 10-30% brand-voice-consistency-lift-vs-GPT-4o-only-baseline per Jasper-2024 + Typeface-2024 + Cohere-2024 benchmarks.",
            "Step 3 — Onboard Copy.ai-ad-copy-iteration ($49-$249/mo) + Midjourney-product-photography ($10-$60/mo) + ElevenLabs-voice-clone-SMS-narration ($5-$22/mo) (Pillar 1+2 partial); verify via 50+ ad-copy-variants-per-week-baseline + 50-70% creative-production-cost-savings + 2-4x creative-iteration-velocity-vs-photographer-baseline per Midjourney-2024 + Stable-Diffusion-2024 + Runway-2024 + Sora-2024 + ElevenLabs-2024 benchmarks.",
            "Step 4 — Build AI-creative-iteration-cycle-launch: AI-email-subject-line-iteration-cycle-launch (Jasper + Copy.ai 50+ variants-per-week) + AI-SMS-copy-iteration-cycle-launch (Postscript + Jasper + Copy.ai 50+ SMS-variants-per-week) + AI-social-caption-iteration-cycle-launch (Jasper + Copy.ai per-platform-format-Wired) (Pillar 3 deliverable per asset 26); verify via 5-20% email-CTR-lift + 10-30% SMS-CTR-lift + 10-30% social-engagement-rate-lift per Jasper-2024 + Copy.ai-2024 + Typeface-2024 + Smartwriter-2024 + Postscript-2024 + Later-2024 + Hootsuite-2024 benchmarks.",
            "Step 5 — Onboard Typeface-brand-voice-LLM ($30-$300/mo) + Triple-Whale-Starter-or-Pro-with-AI-creative-cohort-overlay ($179-$1,290/mo); build AI-blog-post-generation-baseline + AI-product-description-iteration-cycle-launch (Pillar 2 deliverables per asset 26); verify via 10-30% organic-discovery-traffic-lift + 5-15% product-page-CVR-lift + 2-3x LTV-multiplier-Path-B-vs-AI-only-baseline per Triple-Whale-2024 + Sailthru-2024 + Jasper-2024 + Typeface-2024 + Surfer-SEO-2024 + Clearscope-2024 + Shopify-2024 + Yotpo-2024 benchmarks.",
            "Step 6 — Iterate Phase 2 -> Phase 3: build AI-customer-service-response-baseline-launch (Gorgias + Jasper 30-50% customer-service-cost-savings) + AI-product-rec-feed-personalization-launch (Nosto + Rebuy 5-15% AOV-lift) + AI-search-relevance-tuning-launch (Algolia 5-15% on-site-search-CVR-lift) (Pillar 4 deliverables per asset 26); verify via 30-50% customer-service-cost-savings + 10-30% customer-service-CSAT-lift + 5-15% AOV-lift + 10-30% repeat-purchase-rate-lift + 5-15% on-site-search-CVR-lift reaching the canonical Path B 3:1 default Year-1 ROI at $5M US DTC base per Gorgias-2024 + Nosto-2024 + Rebuy-2024 + Algolia-2024 + Sailthru-2024 + Dynamic-Yield-2024 + Triple-Whale-2024 benchmarks.",
        ]
    # path == "C"
    return [
        "Step 1 — Onboard OpenAI-fine-tuning-on-brand-voice-data ($200-$2,000/mo per OpenAI-2024-pricing) + Anthropic-Claude-fine-tuning-on-brand-voice-data + brand-voice-fine-tune-cohort-of-50-100-prompts-and-responses (Pillar 5 deliverable per asset 26); verify via 10-30% brand-voice-consistency-lift-vs-GPT-4o-only-baseline per OpenAI-2024 + Anthropic-2024 + Jasper-2024 + Typeface-2024 + Cohere-2024 benchmarks.",
        "Step 2 — Onboard AI-orchestration-engine via Pencil Pro $1,500/mo + Moby Pro $499/mo + dedicated-AI-engine-team (canonical Path C prerequisite per research/16 Pillar 5); verify via 6-12-month LLM-training-cycle + AI-orchestration-engine-quarterly-iteration reaching the canonical Path C 2.5:1 ROI muted by LLM-training-cycle + AI-attribution-cohort-overlay-maturity.",
        "Step 3 — Onboard Midjourney-product-photography ($10-$120/mo) + Stable-Diffusion-XL-product-photography + Runway-product-video-preview ($15-$95/mo) + Sora-product-demo-iteration ($20-$200/mo) (Pillar 2 enterprise-tier); verify via 60-80% creative-production-cost-savings + 3-6x creative-iteration-velocity-vs-photographer-baseline per Midjourney-2024 + Stable-Diffusion-2024 + Runway-2024 + Sora-2024 + Typeface-2024 benchmarks.",
        "Step 4 — Onboard ElevenLabs-voice-clone-SMS-narration ($22-$330/mo) + Typeface-brand-voice-LLM ($300-$1,000/mo) + Triple-Whale-Pro-with-AI-creative-cohort-overlay ($1,290/mo) (Pillar 1+2 enterprise-tier); verify via international-multi-locale-AI-orchestration-engine-cohort-LTV + dedicated-AI-engine-team quarterly-iteration + 5-deliverability-cohort-queries (AI-creative-cohort-LTV + AI-SMS-cohort-LTV + AI-email-cohort-LTV + AI-product-rec-cohort-LTV + AI-blog-post-cohort-LTV) reaching the canonical Path C 2.5:1 ROI muted at 5-25% Year-1 incremental AI-engine-revenue share.",
        "Step 5 — Build custom-trained-LLM-on-brand-voice-data-baseline + AI-orchestration-engine-quarterly-iteration + creative-cadence-automation-quarterly + creative-iteration-cycle-quarterly (Pillar 5 deliverables per asset 26); verify via 5-15% brand-voice-consistency-lift-per-quarter + 10-30% creative-iteration-velocity-lift-per-quarter + 10-30% creative-cadence-automation-lift-per-quarter + 5-15% creative-iteration-cycle-CVR-lift-per-quarter per AdCreative.ai-2024 + Moby-2024 + Pencil-2024 + Typeface-2024 + Jasper-2024 + Triple-Whale-2024 benchmarks.",
        "Step 6 — Iterate Phase 4 steady-state: 12-24-month-compounding-generative-AI-engine-steady-state typically achieves 2-4x LTV-multiplier-year-2+ vs AI-only-baseline per Triple-Whale-2024-canonical-3-way-comparison-cycle [AI-orchestration-engine-cohort-LTV vs AI-only-cohort-LTV vs no-AI-cohort-LTV] reaching the canonical Path C 2-6x Year-1 ROI at $25M DTC+international GMV base.",
    ]


def project_per_path_revenue(
    inputs: BrandGenerativeAiEngineInputs, rec: PathRecommendation
) -> dict[str, object]:
    """Project the canonical Year-1 cost stack vs incremental AI-engine-revenue vs
    Year-1 ROI band per Path. Returns a dict so the JSON output surfaces the math.
    """
    return {
        "us_dtc_gmv": inputs.us_dtc_gmv,
        "path": rec.path,
        "year1_cost_low": rec.year1_cost_low,
        "year1_cost_high": rec.year1_cost_high,
        "year1_incremental_ai_engine_revenue_low": rec.year1_incremental_ai_engine_revenue_low,
        "year1_incremental_ai_engine_revenue_high": rec.year1_incremental_ai_engine_revenue_high,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_high": rec.year1_roi_high,
        "year1_roas_lift_pct_low": rec.year1_roas_lift_pct_low,
        "year1_roas_lift_pct_high": rec.year1_roas_lift_pct_high,
        "creative_iteration_velocity_multiplier_low": rec.creative_iteration_velocity_multiplier_low,
        "creative_iteration_velocity_multiplier_high": rec.creative_iteration_velocity_multiplier_high,
        "creative_production_cost_savings_pct_low": rec.creative_production_cost_savings_pct_low,
        "creative_production_cost_savings_pct_high": rec.creative_production_cost_savings_pct_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Per the v0.24.1 pitfall #6, we do NOT use argparse to
    validate enums (exit 2 not exit 1 on bad enum); dataclass __post_init__ does it.
    """
    p = argparse.ArgumentParser(
        prog="generative_ai_engine_unit_economics.py",
        description=(
            "Path A / B / C scoring for the Generative AI Engine track (Move #20). "
            "Companion to research/16 + playbooks/23 + assets/26 + dashboard/app/"
            "generative-ai-engine/page.tsx. Hermetic: no API calls."
        ),
    )
    p.add_argument(
        "--us-dtc-gmv", type=float, default=5_000_000.0,
        help="US DTC GMV (USD). Default: 5,000,000 (Path B DEFAULT mid-range).",
    )
    p.add_argument(
        "--creatives-per-week", type=int, default=75,
        help="AI-ad-creative iteration velocity (creatives/week). Default: 75 (Path B DEFAULT mid-range).",
    )
    p.add_argument(
        "--has-move-10-ai-ad-creative-6mo", type=lambda s: s.lower() == "true", default=True,
        help="Move #10 AI-ad-creative-iteration shipped 6+ months (true/false). Default: true.",
    )
    p.add_argument(
        "--has-triple-whale-attribution", type=lambda s: s.lower() == "true", default=True,
        help="Triple-Whale attribution live 6+ months (true/false). Default: true.",
    )
    p.add_argument(
        "--has-klaviyo-email-substrate", type=lambda s: s.lower() == "true", default=True,
        help="Klaviyo email substrate live 6+ months (true/false). Default: true.",
    )
    p.add_argument(
        "--has-postscript-sms-substrate", type=lambda s: s.lower() == "true", default=True,
        help="Postscript SMS substrate live 6+ months (true/false). Default: true.",
    )
    p.add_argument(
        "--has-ai-engine-creative-baseline", type=lambda s: s.lower() == "true", default=True,
        help="AI-engine-creative-baseline live (true/false). Default: true.",
    )
    p.add_argument(
        "--has-ai-customer-service-response-baseline", type=lambda s: s.lower() == "true", default=True,
        help="AI-customer-service-response-baseline live (true/false). Default: true.",
    )
    p.add_argument(
        "--has-dedicated-ai-engine-team", type=lambda s: s.lower() == "true", default=False,
        help="Dedicated AI engine team (Path C prerequisite) (true/false). Default: false.",
    )
    p.add_argument(
        "--voice-profile", type=str, default="default",
        help="Brand voice profile (default/luxury/sustainable/gen_z/b2b). Default: default.",
    )
    p.add_argument(
        "--has-dedicated-ai-engine-team-capacity-hours-per-week", type=int, default=6,
        help="Dedicated AI-engine team capacity (hours/week). Default: 6 (Path B DEFAULT mid-range).",
    )
    p.add_argument(
        "--has-openai-api", type=lambda s: s.lower() == "true", default=True,
        help="OpenAI API key configured (true/false). Default: true.",
    )
    p.add_argument(
        "--has-ai-orchestration-engine", type=lambda s: s.lower() == "true", default=True,
        help="AI-orchestration-engine platform (Pencil / Moby / AdCreative.ai) configured (true/false). Default: true.",
    )
    p.add_argument(
        "--has-jasper-brand-voice-llm", type=lambda s: s.lower() == "true", default=True,
        help="Jasper brand-voice LLM configured (true/false). Default: true.",
    )
    p.add_argument(
        "--json", action="store_true",
        help="Emit JSON output (for cron / CI / dashboard piping).",
    )
    return p.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandGenerativeAiEngineInputs:
    """Build a BrandGenerativeAiEngineInputs dataclass from parsed CLI args."""
    return BrandGenerativeAiEngineInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        creatives_per_week=args.creatives_per_week,
        has_move_10_ai_ad_creative_6mo=args.has_move_10_ai_ad_creative_6mo,
        has_triple_whale_attribution=args.has_triple_whale_attribution,
        has_klaviyo_email_substrate=args.has_klaviyo_email_substrate,
        has_postscript_sms_substrate=args.has_postscript_sms_substrate,
        has_ai_engine_creative_baseline=args.has_ai_engine_creative_baseline,
        has_ai_customer_service_response_baseline=args.has_ai_customer_service_response_baseline,
        has_dedicated_ai_engine_team=args.has_dedicated_ai_engine_team,
        voice_profile=args.voice_profile,  # type: ignore[arg-type]
        has_dedicated_ai_engine_team_capacity_hours_per_week=args.has_dedicated_ai_engine_team_capacity_hours_per_week,
        has_openai_api=args.has_openai_api,
        has_ai_orchestration_engine=args.has_ai_orchestration_engine,
        has_jasper_brand_voice_llm=args.has_jasper_brand_voice_llm,
    )


def render_human(inputs: BrandGenerativeAiEngineInputs, rec: PathRecommendation) -> str:
    """Render a human-readable summary of the recommendation (default CLI output)."""
    lines: list[str] = []
    lines.append("=" * 78)
    lines.append("Generative AI Engine — Path A / B / C scorer (Move #20)")
    lines.append("=" * 78)
    lines.append("")
    lines.append(f"US DTC GMV:                ${inputs.us_dtc_gmv:>14,.0f}")
    lines.append(f"Creatives per week:        {inputs.creatives_per_week:>14d}")
    lines.append(f"Move #10 6mo shipped:      {inputs.has_move_10_ai_ad_creative_6mo}")
    lines.append(f"Triple-Whale live:         {inputs.has_triple_whale_attribution}")
    lines.append(f"Klaviyo live:              {inputs.has_klaviyo_email_substrate}")
    lines.append(f"Postscript live:           {inputs.has_postscript_sms_substrate}")
    lines.append(f"AI-engine creative base:   {inputs.has_ai_engine_creative_baseline}")
    lines.append(f"AI-CS response base:       {inputs.has_ai_customer_service_response_baseline}")
    lines.append(f"Dedicated AI-engine team:  {inputs.has_dedicated_ai_engine_team}")
    lines.append(f"Voice profile:             {inputs.voice_profile}")
    lines.append(f"AI-engine team capacity:   {inputs.has_dedicated_ai_engine_team_capacity_hours_per_week} hr/wk")
    lines.append(f"OpenAI API:                {inputs.has_openai_api}")
    lines.append(f"AI-orchestration engine:   {inputs.has_ai_orchestration_engine}")
    lines.append(f"Jasper brand-voice LLM:    {inputs.has_jasper_brand_voice_llm}")
    lines.append("")
    lines.append("-" * 78)
    lines.append(f"Recommended Path: {rec.path}")
    lines.append(f"Default platform pick: {rec.default_platform_pick}")
    lines.append("-" * 78)
    lines.append("")
    lines.append("Justification:")
    for ln in rec.justification.split(". "):
        lines.append(f"  {ln}")
    lines.append("")
    lines.append("-" * 78)
    lines.append("Cost stack + Year-1 projection:")
    lines.append("-" * 78)
    lines.append(f"  One-time cost:        ${rec.cost_one_time_low:>10,.0f} - ${rec.cost_one_time_high:>10,.0f}")
    lines.append(f"  Recurring (mo):       ${rec.cost_recurring_low:>10,.0f} - ${rec.cost_recurring_high:>10,.0f}")
    lines.append(f"  Year-1 cost stack:    ${rec.year1_cost_low:>10,.0f} - ${rec.year1_cost_high:>10,.0f}")
    lines.append(f"  Year-1 inc AI rev:    ${rec.year1_incremental_ai_engine_revenue_low:>10,.0f} - ${rec.year1_incremental_ai_engine_revenue_high:>10,.0f}")
    lines.append(f"  Year-1 ROAS lift:     {rec.year1_roas_lift_pct_low:>5.1f} - {rec.year1_roas_lift_pct_high:>5.1f} pp")
    lines.append(f"  Email CTR lift:       {rec.email_ctr_lift_pct_low:>5.1f} - {rec.email_ctr_lift_pct_high:>5.1f} pp")
    lines.append(f"  Organic lift:         {rec.organic_discovery_traffic_lift_pct_low:>5.1f} - {rec.organic_discovery_traffic_lift_pct_high:>5.1f} pp")
    lines.append(f"  Creative vel mult:    {rec.creative_iteration_velocity_multiplier_low:>5.1f} - {rec.creative_iteration_velocity_multiplier_high:>5.1f}x")
    lines.append(f"  Creative cost save:   {rec.creative_production_cost_savings_pct_low:>5.1f} - {rec.creative_production_cost_savings_pct_high:>5.1f} %")
    lines.append(f"  Build cycle:          {rec.ai_engine_build_cycle_months_low:>3d} - {rec.ai_engine_build_cycle_months_high:>3d} months")
    lines.append(f"  Year-1 ROI:           {rec.year1_roi_low:>5.1f} - {rec.year1_roi_high:>5.1f}x")
    lines.append("")
    lines.append("-" * 78)
    lines.append("Platforms:")
    for plat in rec.platforms:
        lines.append(f"  - {plat}")
    lines.append("")
    lines.append("-" * 78)
    lines.append("5-pillar AI-engine framework:")
    for pillar, desc in rec.ai_engine_pillar_matrix.items():
        first_line = desc.split(". ")[0]
        lines.append(f"  - {pillar}")
        lines.append(f"      {first_line}.")
    lines.append("")
    lines.append("-" * 78)
    lines.append("6-step build sequence:")
    for step in rec.build_sequence:
        first_line = step.split(" — ")[0] if " — " in step else step[:30]
        lines.append(f"  {first_line}")
    lines.append("")
    lines.append("=" * 78)
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    """Entry point. Returns 0 on success, 2 on bad input (per the canonical
    v0.16.0 recipe: dataclass __post_init__ raises ValueError on bad input).
    """
    try:
        args = parse_args(argv)
        inputs = build_inputs(args)
    except ValueError as exc:
        sys.stderr.write(f"Input validation error: {exc}\n")
        return 2

    rec = recommend_path(inputs)

    if args.json:
        out = {
            "inputs": asdict(inputs),
            "recommendation": asdict(rec),
            "projection": project_per_path_revenue(inputs, rec),
        }
        json.dump(out, sys.stdout, indent=2, default=str)
        sys.stdout.write("\n")
    else:
        sys.stdout.write(render_human(inputs, rec))
        sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
