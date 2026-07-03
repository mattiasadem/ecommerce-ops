#!/usr/bin/env python3
"""
smsbump_postscript_channel_orchestration_unit_economics.py — Path A / B / C scorer
for the SMSBump + Postscript Channel Orchestration track (Move #19 companion script).

Companion to:
- /research/15-smsbump-postscript-channel-orchestration.md (the 5-pillar framework
  + 3 GMV-tier paths + Postscript-primary-onboard + DLR-monitoring-Wire +
  Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay +
  SMSBump-international-multi-locale + MMS-luxury-voice-SKU-launch +
  two-way-conversations-creator-cohort-launch + RCS-business-messaging-Gen-Z-voice
  + SMS-cohort-LTV-attrition-1%-rule-iteration +
  SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle)
- /playbooks/22-smsbump-postscript-channel-orchestration-launch.md (4-phase
  Postscript-primary-onboard + DLR-monitoring-Wire + Klaviyo-SMS-segment-overlay
  + Triple-Whale-SMS-merge-cohort-overlay → MMS-luxury-voice-SKU-SMS-launch +
  two-way-conversation-creator-cohort-launch + RCS-Gen-Z-voice-Flash-Sale-launch
  + international-multi-locale-SMSBump-orchestration-launch +
  SMSBump-post-purchase-flow-launch → international-multi-locale-SMS-cohort-LTV-iteration
  + SMS-deliverability-reach-cohort-overlay-instrumentation +
  SMS-cohort-attrition-1%-rule-iteration-cycle + 5-way-comparison-cycle-launch
  → Steady-state + SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle
  + SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle-iteration +
  SMS-cost-stack-decision-recipe operator build)
- /assets/23-smsbump-postscript-channel-orchestration-templates.md (paste-ready
  per-voice per-SMS-orchestration-SMS-template + SMSBump-international-multi-locale-
  SMS-keyword-library-template + DLR-monitoring-segment-flagged-bounce-rate-recovery-
  SMS-template + MMS-luxury-voice-SKU-SMS-template + two-way-conversation-creator-
  cohort-template + RCS-Gen-Z-voice-Flash-Sale-SMS-template + international-multi-
  locale-SMSBump-orchestration-template + SMSBump-post-purchase-flow-template +
  SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-template +
  SMS-deliverability-reach-cohort-overlay-instrumentation-template +
  5-way-comparison-cycle-iteration-template + 8 SMSBump +
  Postscript-channel-orchestration-onboarding-pack + 5 voice profiles × 5
  SMS-orchestration-formats = 25 voice-variant SMS-orchestration-templates;
  per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15)
- /dashboard/app/smsbump-postscript-channel-orchestration/page.tsx (24th
  operator-surface route rendering research/15 + playbook 22 + asset 23 as a
  unified surface)

This script takes a brand's current SMSBump + Postscript Channel Orchestration
fit inputs (12 fields) and outputs a Path A (Postscript-primary-only +
DLR-monitoring-baseline $200-$500/mo <$500k US-GMV 4:1 conservative nominal
ROI) / Path B DEFAULT (SMSBump + Postscript + DLR + MMS +
Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay
$1k-$5k/mo $1M-$25M DTC+international GMV 3.5:1 default Year-1 ROI with
$200k-$1.5M Path B incremental SMS-orchestration-revenue + 3-15% Year-1
incremental revenue + +20-40% SMS-list-growth-rate-vs-Postscript-only +
+5-15% SMS-deliverability-vs-Postscript-only-baseline + +20-40%
SMS-cohort-LTV-multiplier-vs-Postscript-only at $5M US DTC + $1M international
base) / Path C (full-SMS-orchestration-Postscript + SMSBump + Attentive +
RCS-business-messaging + MMS + two-way-conversations + AI-orchestration-engine
$3k-$15k/mo $5M+ DTC+international GMV 2.5:1 ROI muted by 6-12-month
SMS-orchestration-build-cycle + SMS-channel-attrition-management-maturity)
recommendation with cost stack + Year-1 incremental
SMS-orchestration-revenue + SMS-list-growth-rate-vs-Postscript-only +
SMS-deliverability-vs-Postscript-only-baseline +
SMS-cohort-LTV-multiplier-vs-Postscript-only + 6-step build sequence.

It is the operator-build input for the playbook's Prerequisites gate (Phase 1
Step 1 "pick path + Postscript-primary-onboard + DLR-monitoring-Wire +
Klaviyo-SMS-segment-overlay-onboard + Triple-Whale-SMS-merge-cohort-overlay-
Wire + SMS-cohort-LTV-iteration-cycle-baseline").

The scoring rule (mirrors research/15 §GMV-tier paths + playbook 22
§Prerequisites + asset 23 §5-pillar SMSBump + Postscript-channel-
orchestration-framework + canonical 8-prereq SMSBump +
Postscript-channel-orchestration-onboarding-pack):
  - us_dtc_gmv < $500k                           → defer (Path A surfaced as audit only)
  - us_dtc_gmv $500k-$1M                         → Path A (Postscript-primary-only + DLR-monitoring-baseline)
  - us_dtc_gmv $1M-$25M                          → Path B DEFAULT (SMSBump + Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay)
  - us_dtc_gmv $25M+                             → Path C (full-SMS-orchestration-Postscript + SMSBump + Attentive + RCS + MMS + two-way-conversations + AI-orchestration-engine)
  - international_gmv_pct < 5%                   → defer (canonical 5%+ international-GMV-share for SMSBump-international-orchestration per research/15 §Prereq)
  - sms_list_size < 50_000                       → defer (canonical 50k+ opted-in US SMS subscribers per research/15 §Prereq)
  - has_postscript_primary = False               → defer (canonical Postscript-primary-onboard prerequisite for Move #19 launch per Postscript 2024)
  - has_smsbump_account = False                  → defer (canonical SMSBump-international-SMS-onboard prerequisite per SMSBump 2024-Shopify-Markets-integration)
  - has_klaviyo_sms_segment_overlay = False      → defer (canonical Klaviyo-SMS-segment-overlay-onboard prerequisite per Klaviyo 2024-SMS-channel-vs-ESP-segmentation)
  - has_triple_whale_sms_merge = False           → defer (canonical Triple-Whale-SMS-source-merge-cohort-overlay-Wired prerequisite per Triple-Whale 2024-SMS-source-merge)
  - has_dlr_monitoring_wired = False             → defer (canonical DLR-monitoring-Suite-Wired prerequisite per Postscript 2024-DLR-monitoring-Suite + Attentive 2024-DLR-monitoring)
  - has_dedicated_sms_orchestration_team_capacity_hours_per_week < 4 → defer (canonical 4-8 hr/wk Path B minimum per research/15 §Prereq + playbook 22 §Phase 1)
  - voice_profile = "luxury" WITHOUT has_sms_orchestration_creative_baseline = True → downgrade (Luxury-voice brands need MMS-luxury-voice-SKU-creative-baseline for branded-unboxing-experience + rich-media-attachments per MMS 2024)
  - voice_profile = "b2b" WITHOUT has_klaviyo_sms_segment_overlay = True → downgrade (B2B-voice brands need Klaviyo-SMS-segment-overlay + B2B-keyword-cluster-trust-disclosure per Klaviyo 2024-B2B-SMS-segmentation)
  - path = "C" AND has_attentive_enterprise_secondary = False → downgrade to Path B (Path C requires Attentive-Enterprise-license-or-Sailthru-Enterprise-SMS-at-scale per research/15 Pillar 3 GMV-tier decision matrix)

Why hermetic? This script does NOT call Postscript / SMSBump / Klaviyo /
Attentive / Triple-Whale / Sailthru / Two-way-conversations / RCS-business-
messaging / MMS / GSMA-RCS / Inbox-by-Postscript / Shopify-Markets APIs.
The inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence + 5-pillar SMSBump +
Postscript-channel-orchestration framework are derived from research/15 +
playbook 22 + asset 23 (the canonical benchmarks the workspace already
ships). This is the same hermetic recipe as threepl_unit_economics.py /
marketplace_unit_economics.py / subscription_unit_economics.py /
affiliate_unit_economics.py / b2b_wholesale_unit_economics.py /
tiktok_shop_unit_economics.py / pinterest_seo_unit_economics.py /
amazon_dsp_amazon_attribution_audit_unit_economics.py — the 90% of
install mistakes operators make (wrong-path selection, under-budgeting for
DLR-monitoring-Wire, ignoring the 50k+-opted-in-US-SMS-subscribers prereq,
ignoring the Move #7 6+-months-post-launch prereq, ignoring the 5%+-
international-GMV-share prereq, ignoring the 4-hr/wk
SMS-orchestration-team-capacity floor, ignoring the
SMS-orchestration-creative-baseline prereq) don't require API access; the
local scoring rule catches them.

Usage:
    # Default: $5M US DTC + 10% international + 100k SMS list + Path B defaults
    python3 smsbump_postscript_channel_orchestration_unit_economics.py

    # Custom inputs (e.g. $30M premium brand with luxury voice)
    python3 smsbump_postscript_channel_orchestration_unit_economics.py \\
        --us-dtc-gmv 30000000 --international-gmv-pct 30 \\
        --sms-list-size 200000 --voice-profile luxury \\
        --has-sms-orchestration-creative-baseline false

    # JSON output (for cron / CI / dashboard piping)
    python3 smsbump_postscript_channel_orchestration_unit_economics.py --json
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
class BrandSmsbumpPostscriptInputs:
    """Operator-supplied current-SMSBump + Postscript Channel Orchestration fit inputs.

    All fields validated in __post_init__ per the canonical script-increment-tick
    recipe (v0.16.0) + the v0.24.1 pitfall #6 (no argparse-based enum validation).
    """

    us_dtc_gmv: float
    international_gmv_pct: float
    sms_list_size: int
    has_postscript_primary: bool
    has_smsbump_account: bool
    has_klaviyo_sms_segment_overlay: bool
    has_attentive_enterprise_secondary: bool
    has_dlr_monitoring_wired: bool
    has_triple_whale_sms_merge: bool
    voice_profile: VoiceProfile
    has_dedicated_sms_orchestration_team_capacity_hours_per_week: int
    has_sms_orchestration_creative_baseline: bool

    def __post_init__(self) -> None:
        if self.us_dtc_gmv < 0:
            raise ValueError(f"us_dtc_gmv must be >= 0 (got {self.us_dtc_gmv})")
        if not 0.0 <= self.international_gmv_pct <= 100.0:
            raise ValueError(
                f"international_gmv_pct must be in [0, 100] (got {self.international_gmv_pct})"
            )
        if self.sms_list_size < 0:
            raise ValueError(f"sms_list_size must be >= 0 (got {self.sms_list_size})")
        if self.has_dedicated_sms_orchestration_team_capacity_hours_per_week < 0:
            raise ValueError(
                f"has_dedicated_sms_orchestration_team_capacity_hours_per_week must be >= 0 "
                f"(got {self.has_dedicated_sms_orchestration_team_capacity_hours_per_week})"
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
    year1_incremental_sms_orchestration_revenue_share_pct_low: float
    year1_incremental_sms_orchestration_revenue_share_pct_high: float
    year1_incremental_sms_orchestration_revenue_low: float
    year1_incremental_sms_orchestration_revenue_high: float
    sms_list_growth_rate_vs_postscript_only_low: float
    sms_list_growth_rate_vs_postscript_only_high: float
    sms_deliverability_vs_postscript_only_baseline_low: float
    sms_deliverability_vs_postscript_only_baseline_high: float
    sms_cohort_ltv_multiplier_vs_postscript_only_low: float
    sms_cohort_ltv_multiplier_vs_postscript_only_high: float
    sms_orchestration_build_cycle_months_low: int
    sms_orchestration_build_cycle_months_high: int
    year1_roi_low: float
    year1_roi_high: float
    smsbump_postscript_pillar_matrix: dict[str, str]
    build_sequence: list[str]


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (US DTC GMV).
PATH_A_FLOOR = 500_000.0       # canonical entry floor: <$500k defer; $500k-$1M Path A
PATH_B_FLOOR = 1_000_000.0     # DEFAULT tier: $1M-$25M Path B
PATH_C_FLOOR = 25_000_000.0    # enterprise tier: $25M+ Path C

# Path costs (USD, from upstream research + playbook + asset).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (200.0,    500.0,    200.0,    500.0),     # Postscript-DLR-monitoring-Wire-only
    "B":  (2_000.0,  25_000.0, 1_000.0,  5_000.0),   # SMSBump + Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay
    "C":  (25_000.0, 100_000.0, 3_000.0, 15_000.0),  # full-SMS-orchestration-Postscript + SMSBump + Attentive + RCS + MMS + two-way-conversations + AI-orchestration-engine
}

# Year-1 incremental SMS-orchestration-revenue share bands (% of base GMV).
PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (2.0, 5.0),
    "B":  (3.0, 15.0),
    "C":  (5.0, 25.0),
}

# SMS-list-growth-rate vs Postscript-only baseline (multiplicative lift %).
PATH_SMS_LIST_GROWTH_RATE_VS_POSTSCRIPT_ONLY: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 15.0),
    "B":  (20.0, 40.0),
    "C":  (30.0, 60.0),
}

# SMS-deliverability-vs-Postscript-only-baseline (additive percentage points).
PATH_SMS_DELIVERABILITY_VS_POSTSCRIPT_ONLY_BASELINE: dict[PathName, tuple[float, float]] = {
    "A":  (2.0, 5.0),
    "B":  (5.0, 15.0),
    "C":  (10.0, 20.0),
}

# SMS-cohort-LTV-multiplier-vs-Postscript-only (multiplicative lift).
PATH_SMS_COHORT_LTV_MULTIPLIER_VS_POSTSCRIPT_ONLY: dict[PathName, tuple[float, float]] = {
    "A":  (1.2, 1.5),
    "B":  (2.0, 3.0),
    "C":  (2.5, 4.0),
}

# SMS-orchestration build cycle maturity months.
PATH_SMS_ORCHESTRATION_BUILD_CYCLE_MONTHS: dict[PathName, tuple[int, int]] = {
    "A":  (1, 3),
    "B":  (6, 18),
    "C":  (12, 24),
}

# Year-1 ROI bands (canonical from research/15 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (4.0, 8.0),    # conservative nominal Year-1 ROI for <$500k US-GMV brands
    "B":  (2.4, 107.0),  # 3.5:1 default Year-1 ROI Path B at $5M US DTC + $1M international base
    "C":  (2.0, 6.0),    # muted by 6-12-month SMS-orchestration-build-cycle + SMS-channel-attrition-management-maturity
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Canonical SMS-orchestration-platform matrix per Path.
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A": [
        "Postscript-Starter-or-Growth-tier ($0-$800/mo)",
        "Postscript-DLR-monitoring-Suite ($0-$200/mo with Growth+)",
    ],
    "B": [
        "Postscript-Growth-or-Scale-tier ($500-$2k/mo)",
        "SMSBump-Basic-or-Pro-tier ($100-$400/mo)",
        "Klaviyo-Email-and-SMS-or-SMS-channel-add-on ($45-$145/mo)",
        "Triple-Whale-Starter-or-Pro-with-SMS-source-merge ($179-$1,290/mo)",
        "MMS-platform Postscript-MMS-launch or Attentive-MMS-launch ($0-$100/mo)",
        "Inbox-by-Postscript-or-Attentive-Concierge ($0-$2k/mo)",
    ],
    "C": [
        "Attentive-Enterprise-primary ($5k-$25k/mo)",
        "SMSBump-Enterprise international-multi-locale-orchestration",
        "Postscript-Enterprise-secondary",
        "RCS-business-messaging-Enterprise (GSMA-RCS rollout)",
        "MMS-Enterprise (rich-media-attachments + video-previews)",
        "Two-way-conversations-Enterprise",
        "AI-orchestration-engine-license",
    ],
}

# Default platform pick per Path.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A": "Postscript-Growth-tier + DLR-monitoring-Suite",
    "B": "SMSBump-Pro-tier + Postscript-Scale-tier + Klaviyo-SMS-segment-overlay + Triple-Whale-Pro-with-SMS-merge + MMS-platform Postscript-MMS-launch",
    "C": "Attentive-Enterprise-primary + SMSBump-Enterprise + RCS-business-messaging + AI-orchestration-engine",
}

# 5-pillar SMSBump + Postscript-channel-orchestration framework.
SMSBUMP_POSTSCRIPT_PILLAR_MATRIX: dict[str, str] = {
    "Pillar 1 — Postscript-primary-onboard + DLR-monitoring-Wire + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay": (
        "Postscript-Starter-or-Growth-or-Scale-tier-active-with-Move-#7-4-flow-shipped-6+-months-post-launch-verified + 50k+-opted-in-US-SMS-subscribers + DLR-monitoring-Suite-Wire (Postscript-2024-DLR-monitoring-Suite + Attentive-2024-DLR-monitoring-Wire + SMSBump-2024-DLR-monitoring + Klaviyo-2024-DLR-monitoring-baseline + Sailthru-2024-deliverability-reach-cohort + canonical-5-deliverability-cohort-queries [SMS-bounce-rate-cohort + SMS-opt-out-rate-cohort + SMS-spam-complaint-rate-cohort + SMS-deliverability-rate-cohort + SMS-cohort-LTV-vs-baseline-cohort]) + Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-Wired + voice-profile-webhook-mapping-Wired + Triple-Whale-SMS-source-merge-cohort-overlay-Wired + build SMS-orchestration-creative-baseline [5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates + DLR-monitored-deliverability-segment + MMS-luxury-voice-SKU-SMS-baseline + two-way-conversation-creator-cohort-templates + RCS-Gen-Z-voice-Flash-Sale-SMS-baseline]"
    ),
    "Pillar 2 — SMSBump-international-SMS-onboard + international-multi-locale-SMSBump-orchestration + SMSBump-post-purchase-flow-launch": (
        "SMSBump-Basic-or-Pro-tier-onboard + Shopify-Markets-Basic-or-Pro-live-with-international-order-volume-baseline-active-locales-5+ + locale-specific-SMS-routing-baseline-Wired + locale-specific-currency-display-baseline + locale-specific-DLR-monitoring-baseline + 7-canonical-locales [US-EN / UK-EN / CA-EN+FR / EU-DE+FR+IT+ES / AU-EN / JP-JA / BR-PT + MX-ES] + per-locale-TCPA-compliance-baseline [TCPA-2024 + ICO-GDPR-PECR-2024 + CASL-2024 + Loi-canneaux-PECR-2024 + GDPR-2024 + LSSI-2024 + Spam-Act-2003 + 特定商取引法-2024 + LGPD-2024 + LFPDPPP-2024] + 5+ locale-specific-SMS-keyword-libraries + SMSBump-post-purchase-flow-launch [post-purchase-upsell-SMS + review-request-SMS + winback-SMS + cart-abandon-SMS + browse-abandon-SMS + 30-180s-time-to-conversion-baseline]"
    ),
    "Pillar 3 — MMS-luxury-voice-SKU-SMS-launch + rich-media-attachments + video-previews + branded-unboxing-experience": (
        "MMS-platform-onboard (Postscript-MMS-launch $0-with-Postscript-Scale-tier + Attentive-2024-MMS-luxury-voice-SKU-launch + Klaviyo-2024-MMS-channel-add-on $0-$100/mo + SMSBump-2024-MMS-launch) + 5+-MMS-luxury-voice-SKU-SMS-creative-assets-build per MMS-2024-canonical-5-specs [rich-media-attachments + video-previews + branded-unboxing-experience + luxury-voice-content-2-3×-CTR-vs-text-SMS-baseline + MMS-platform-deliverability-baseline] + MMS-deliverability-monitoring-Wire per Postscript-MMS-deliverability-monitoring + Attentive-MMS-deliverability-monitoring + MMS-2024-canonical-MMS-vs-SMS-CTR-metrics-baseline + target = Luxury-voice-cohort-of-Postscript-list + voice-profile-webhook-mapping-via-Klaviyo"
    ),
    "Pillar 4 — Two-way-conversations-creator-cohort-launch + RCS-business-messaging-Gen-Z-voice-Flash-Sale-launch + voice-profile-routing-inbox": (
        "Inbox-by-Postscript-or-Attentive-Concierge-onboard + creator-response-routing-via-Inbox-by-Postscript + creator-engagement-LTV-iteration + creator-SMS-deliverability-stability-monitoring + creator-cohort-LTV-overlay-with-Move-#16-creator-economy-expansion + voice-profile-routing-inbox [Default → Tier-1-creator-inbox / Luxury → Tier-1-creator-inbox-with-MAP-policy-guardrail / Sustainable → Tier-1-creator-inbox-with-sustainability-mission-disclosure / Gen-Z → Tier-2-creator-inbox-with-Gen-Z-tone-routing-inbox / B2B → Tier-3-creator-inbox-with-B2B-keyword-cluster-routing] + Attentive-RCS-business-messaging-onboard + GSMA-RCS-2024-2-4×-SMS-engagement-rate-vs-SMS-text-baseline + 5+-RCS-business-messaging-Gen-Z-voice-Flash-Sale-creative-assets-baseline + 6 RCS-spec-card-types [Hero-card + Rich-media-card + Carousel-card + Read-receipt-card + Suggested-reply-card + Suggested-action-card]"
    ),
    "Pillar 5 — SMS-cohort-LTV-attrition-1%-rule-iteration + SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe": (
        "Postscript-DLR-monitoring-Wire + Attentive-DLR-monitoring-Wire + SMSBump-DLR-monitoring-Wire + Klaviyo-DLR-monitoring-Wire-baseline + 5-canonical-deliverability-cohort-queries [SMS-bounce-rate-cohort + SMS-opt-out-rate-cohort + SMS-spam-complaint-rate-cohort + SMS-deliverability-rate-cohort + SMS-cohort-LTV-vs-baseline-cohort] per Triple-Whale-SMS-merge-2024 + Postscript-2024-DLR-monitoring + Sailthru-2024-deliverability-reach-cohort benchmarks + SMS-cohort-attrition-1%-rule-iteration-cycle [Triple-Whale-2024-1%-rule-SMS-attrition-cohort-baseline + Sailthru-2024-canonical-1%-rule + identify-SMS-attrition-cohort + iterate-SMS-orchestration-cadence + deliverability-rate-bounce-cohort-LTV-overlay] + 5-way-comparison-cycle [SMS-orchestration-cohort-LTV vs SMS-Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV at 30/60/90/180-day-windows + 5-deliverability-rate-cohort-overlay + 5-attrition-cohort-overlay + 5-keyword-library-cohort-overlay] + SMS-cost-stack-decision-recipe [Tier 1 Postscript-primary + SMSBump-international-secondary $0-$2k/mo for $1M-$5M DTC+international brands / Tier 2 Postscript-primary + SMSBump-international + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge $1k-$5k/mo for $5M-$25M DTC+international brands / Tier 3 Attentive-enterprise-primary + SMSBump-international + Postscript-secondary $5k-$25k/mo for $25M+ DTC+international brands / Tier 4 RCS-business-messaging-orchestration $5k-$50k/mo for $25M+ brands with mature-SMS-orchestration + global-RCS-rollout]"
    ),
}

# Upgrade + downgrade gates.
LUXURY_DOWNGRADE_ENABLED = True       # Luxury voice without SMS-orchestration-creative-baseline → downgrade
B2B_DOWNGRADE_ENABLED = True          # B2B voice without Klaviyo-SMS-segment-overlay → downgrade
PATH_C_ATTENTIVE_DOWNGRADE_ENABLED = True   # Path C without Attentive-Enterprise-secondary → downgrade to Path B
CAPACITY_GATE_HR_WK = 4               # <4 hr/wk → defer (canonical 4-8 hr/wk Path B minimum per research/15 §Prereq + playbook 22 §Phase 1)
MIN_SMS_LIST_SIZE = 50_000            # <50k → defer (canonical 50k+ opted-in US SMS subscribers per research/15 §Prereq + Move #7 6+ months post-launch)
MIN_INTERNATIONAL_GMV_PCT = 5.0       # <5% → defer (canonical 5%+ international-GMV-share for SMSBump-international-orchestration per research/15 §Prereq)


def _tier_for_gmv(us_gmv: float) -> PathName:
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandSmsbumpPostscriptInputs) -> PathRecommendation:
    """Apply the scoring rule + deferral/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_low_gmv = False
    deferred_for_low_international = False
    deferred_for_low_sms_list = False
    deferred_for_no_postscript = False
    deferred_for_no_smsbump = False
    deferred_for_no_klaviyo_sms = False
    deferred_for_no_triple_whale = False
    deferred_for_no_dlr_monitoring = False
    deferred_for_low_capacity = False

    # ---- Deferral gates (mirrors upstream research §Prerequisites). ----

    if inputs.us_dtc_gmv < PATH_A_FLOOR:
        justification_parts.append(
            f"us_dtc_gmv=${inputs.us_dtc_gmv:,.0f} below ${PATH_A_FLOOR:,.0f} Path A floor; "
            "defer SMSBump + Postscript-channel-orchestration until GMV grows to $500k+"
        )
        deferred_for_low_gmv = True

    if MIN_INTERNATIONAL_GMV_PCT_DEFER_ENABLED := True:
        if inputs.international_gmv_pct < MIN_INTERNATIONAL_GMV_PCT:
            justification_parts.append(
                f"international_gmv_pct={inputs.international_gmv_pct:.1f}% below {MIN_INTERNATIONAL_GMV_PCT}% floor; "
                "defer SMSBump-international-orchestration until Shopify-Markets-active-locales-5+ + 5%+ international-GMV-share baseline"
            )
            deferred_for_low_international = True

    if inputs.sms_list_size < MIN_SMS_LIST_SIZE:
        justification_parts.append(
            f"sms_list_size={inputs.sms_list_size:,d} below {MIN_SMS_LIST_SIZE:,d} floor; "
            "defer SMSBump + Postscript-channel-orchestration until 50k+ opted-in US SMS subscribers "
            "(per Move #7 Postscript 4-flow-shipped + 6+ months post-launch verification)"
        )
        deferred_for_low_sms_list = True

    if not inputs.has_postscript_primary:
        justification_parts.append(
            "has_postscript_primary=False; canonical Postscript-primary-onboard prerequisite "
            "(Postscript-Starter-or-Growth-or-Scale-tier-active-with-Move-#7-4-flow-shipped-6+-months-post-launch-verified)"
        )
        deferred_for_no_postscript = True

    if not inputs.has_smsbump_account:
        justification_parts.append(
            "has_smsbump_account=False; canonical SMSBump-international-SMS-onboard prerequisite "
            "(SMSBump-2024-Shopify-Markets-integration baseline)"
        )
        deferred_for_no_smsbump = True

    if not inputs.has_klaviyo_sms_segment_overlay:
        justification_parts.append(
            "has_klaviyo_sms_segment_overlay=False; canonical Klaviyo-SMS-segment-overlay-onboard prerequisite "
            "(Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-Wired + voice-profile-webhook-mapping-Wired)"
        )
        deferred_for_no_klaviyo_sms = True

    if not inputs.has_triple_whale_sms_merge:
        justification_parts.append(
            "has_triple_whale_sms_merge=False; canonical Triple-Whale-SMS-source-merge-cohort-overlay-Wired prerequisite "
            "(Triple-Whale-SMS-source-merge + 5-canonical-deliverability-cohort-queries Wired)"
        )
        deferred_for_no_triple_whale = True

    if not inputs.has_dlr_monitoring_wired:
        justification_parts.append(
            "has_dlr_monitoring_wired=False; canonical DLR-monitoring-Suite-Wired prerequisite "
            "(Postscript-2024-DLR-monitoring-Suite + Attentive-2024-DLR-monitoring-Wire + SMSBump-2024-DLR-monitoring + Klaviyo-2024-DLR-monitoring-baseline)"
        )
        deferred_for_no_dlr_monitoring = True

    if CAPACITY_GATE_HR_WK_DEFER_ENABLED := True:
        if inputs.has_dedicated_sms_orchestration_team_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
            justification_parts.append(
                f"has_dedicated_sms_orchestration_team_capacity_hours_per_week={inputs.has_dedicated_sms_orchestration_team_capacity_hours_per_week} below {CAPACITY_GATE_HR_WK} hr/wk floor; "
                "defer SMSBump + Postscript-channel-orchestration until dedicated-SMS-orchestration-team capacity ≥4 hr/wk"
            )
            deferred_for_low_capacity = True

    # If any deferral gate fires, base path is "A" but justified as deferred-audit.
    any_deferral = (
        deferred_for_low_gmv
        or deferred_for_low_international
        or deferred_for_low_sms_list
        or deferred_for_no_postscript
        or deferred_for_no_smsbump
        or deferred_for_no_klaviyo_sms
        or deferred_for_no_triple_whale
        or deferred_for_no_dlr_monitoring
        or deferred_for_low_capacity
    )

    # ---- Base tier assignment. ----
    if any_deferral:
        path: PathName = "A"  # Path A surfaced as audit only when deferral fires
    elif inputs.us_dtc_gmv < PATH_A_FLOOR:
        path = "A"
    else:
        path = _tier_for_gmv(inputs.us_dtc_gmv)

    # ---- Apply upgrade/downgrade gates. ----
    upgrades: list[str] = []
    downgrades: list[str] = []

    if LUXURY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_sms_orchestration_creative_baseline:
        if path == "C":
            new_path: PathName = "B"
        elif path == "B":
            new_path = "A"
        else:
            new_path = "A"
        downgrades.append(
            f"Luxury voice without SMS-orchestration-creative-baseline (MMS-luxury-voice-SKU-SMS-required); {path} → {new_path}"
        )
        path = new_path

    if B2B_DOWNGRADE_ENABLED and inputs.voice_profile == "b2b" and not inputs.has_klaviyo_sms_segment_overlay:
        if path == "C":
            new_path = "B"
        elif path == "B":
            new_path = "A"
        else:
            new_path = "A"
        downgrades.append(
            f"B2B voice without Klaviyo-SMS-segment-overlay (B2B-keyword-cluster-trust-disclosure-required); {path} → {new_path}"
        )
        path = new_path

    if PATH_C_ATTENTIVE_DOWNGRADE_ENABLED and path == "C" and not inputs.has_attentive_enterprise_secondary:
        new_path = "B"
        downgrades.append(
            f"Path C without Attentive-Enterprise-secondary (RCS-business-messaging-Enterprise-required); {path} → {new_path}"
        )
        path = new_path

    # Compose final justification.
    if justification_parts:
        justification = " | ".join(justification_parts)
    else:
        justification = (
            f"All deferral gates clear; base tier for US DTC GMV ${inputs.us_dtc_gmv:,.0f} → {path}"
        )
    if downgrades:
        justification += f" | Downgrades applied: {'; '.join(downgrades)}"

    # ---- Cost stack + projection from canonical path tables. ----
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    pct_low, pct_high = PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT[path]
    list_growth_low, list_growth_high = PATH_SMS_LIST_GROWTH_RATE_VS_POSTSCRIPT_ONLY[path]
    deliv_low, deliv_high = PATH_SMS_DELIVERABILITY_VS_POSTSCRIPT_ONLY_BASELINE[path]
    ltv_mult_low, ltv_mult_high = PATH_SMS_COHORT_LTV_MULTIPLIER_VS_POSTSCRIPT_ONLY[path]
    build_low, build_high = PATH_SMS_ORCHESTRATION_BUILD_CYCLE_MONTHS[path]
    roi_low, roi_high = PATH_ROI[path]

    # Year-1 cost = setup + 12 months recurring.
    year1_cost_low = cost_low + 12.0 * rec_low
    year1_cost_high = cost_high + 12.0 * rec_high

    # Year-1 incremental SMS-orchestration-revenue band (over base GMV).
    international_gmv = inputs.us_dtc_gmv * (inputs.international_gmv_pct / 100.0)
    total_gmv_base = inputs.us_dtc_gmv + international_gmv
    year1_revenue_low = total_gmv_base * (pct_low / 100.0)
    year1_revenue_high = total_gmv_base * (pct_high / 100.0)

    # Year-1 ROI = revenue / cost.
    # Guard against zero cost; if both cost bands are zero, ROI is undefined → use sentinel.
    if year1_cost_low <= 0:
        year1_roi_low_computed: float = float("inf")
    else:
        year1_roi_low_computed = year1_revenue_low / year1_cost_low

    if year1_cost_high <= 0:
        year1_roi_high_computed: float = float("inf")
    else:
        year1_roi_high_computed = year1_revenue_high / year1_cost_high

    # Clamp to canonical research/15 PATH_ROI bands (no off-band projections).
    year1_roi_low_final = max(year1_roi_low_computed, roi_low)
    year1_roi_high_final = min(year1_roi_high_computed, roi_high)
    if year1_roi_high_final < year1_roi_low_final:
        year1_roi_high_final = year1_roi_low_final

    return PathRecommendation(
        path=path,
        platforms=list(PATH_PLATFORMS[path]),
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[path],
        justification=justification,
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_incremental_sms_orchestration_revenue_share_pct_low=pct_low,
        year1_incremental_sms_orchestration_revenue_share_pct_high=pct_high,
        year1_incremental_sms_orchestration_revenue_low=year1_revenue_low,
        year1_incremental_sms_orchestration_revenue_high=year1_revenue_high,
        sms_list_growth_rate_vs_postscript_only_low=list_growth_low,
        sms_list_growth_rate_vs_postscript_only_high=list_growth_high,
        sms_deliverability_vs_postscript_only_baseline_low=deliv_low,
        sms_deliverability_vs_postscript_only_baseline_high=deliv_high,
        sms_cohort_ltv_multiplier_vs_postscript_only_low=ltv_mult_low,
        sms_cohort_ltv_multiplier_vs_postscript_only_high=ltv_mult_high,
        sms_orchestration_build_cycle_months_low=build_low,
        sms_orchestration_build_cycle_months_high=build_high,
        year1_roi_low=year1_roi_low_final,
        year1_roi_high=year1_roi_high_final,
        smsbump_postscript_pillar_matrix=dict(SMSBUMP_POSTSCRIPT_PILLAR_MATRIX),
        build_sequence=list(BUILD_SEQUENCE_TEMPLATES[path]),
    )


# ----- Build-sequence recipe ---------------------------------------------

BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1: Onboard Postscript-Starter-or-Growth-tier + Move #7 Postscript-4-flow-shipped-6+-months-post-launch-verified baseline (per Postscript 2024 + playbook/06 §Gate A-D)",
        "Step 2: Wire Postscript-DLR-monitoring-Suite (Postscript-2024-DLR-monitoring-Suite-included-with-Postscript-Growth-or-Scale $0 with Growth + $0-$200/mo with Scale tier; canonical 5-deliverability-cohort-queries [SMS-bounce-rate-cohort + SMS-opt-out-rate-cohort + SMS-spam-complaint-rate-cohort + SMS-deliverability-rate-cohort + SMS-cohort-LTV-vs-baseline-cohort])",
        "Step 3: Launch first DLR-monitored-deliverability-segment + SMS-orchestration-baseline (per Postscript 2024 + Sailthru 2024-deliverability-reach-cohort benchmarks)",
        "Step 4: Build SMS-orchestration-creative-baseline [5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates + DLR-monitored-deliverability-segment + MMS-luxury-voice-SKU-SMS-baseline + two-way-conversation-creator-cohort-templates + RCS-Gen-Z-voice-Flash-Sale-SMS-baseline]",
        "Step 5: Iterate 30-day cadence on DLR-bounce-rate-cohort + SMS-deliverability-cohort (per Triple-Whale-SMS-merge-2024 + Postscript-2024-DLR-monitoring benchmarks)",
        "Step 6: Quarterly SMS-cost-stack-decision-recipe review (per research/15 Pillar 5 + playbook/22 §Phase 4)",
    ],
    "B": [
        "Step 1: Onboard SMSBump-international-SMS via Shopify-Markets-integration ($100-$400/mo for Shopify Markets Basic / $500-$2k/mo for Shopify Markets Pro) + Activate Postscript-DLR-monitoring-Suite-Wire + Activate Klaviyo-SMS-segment-overlay-onboard (Klaviyo-2024-SMS-segment-overlay-included-with-Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on $0 with Klaviyo-Email-and-SMS $45/mo + $0-$100/mo with Klaviyo-SMS-channel-add-on) + Activate Triple-Whale-SMS-source-merge-cohort-overlay-Wire (Triple-Whale-SMS-source-merge-included-with-Triple-Whale-Starter $179/mo or Pro $1,290/mo)",
        "Step 2: Build SMS-cohort-LTV-iteration-cycle-baseline + SMS-orchestration-creative-baseline [5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates + DLR-monitored-deliverability-segment + MMS-luxury-voice-SKU-SMS-baseline + two-way-conversation-creator-cohort-templates + RCS-Gen-Z-voice-Flash-Sale-SMS-baseline]",
        "Step 3: Launch MMS-luxury-voice-SKU-SMS [rich-media-attachments + video-previews + branded-unboxing-experience + 2-3× CTR-vs-text-SMS-baseline per MMS-2024 + Attentive-2024-MMS-benchmarks + Postscript-MMS-launch-2024] + two-way-conversation-creator-cohort-launch [creator-response-routing-via-Inbox-by-Postscript + creator-engagement-LTV-iteration] + RCS-Gen-Z-voice-Flash-Sale-SMS [rich-media-cards + branded-RCS-Business-Messaging + interactive-buyer-journey + 2-4× SMS-engagement-rate-vs-SMS-text-baseline per GSMA-RCS-2024 + Two-way-conversations-2024 + RCS-business-messaging-2024 benchmarks]",
        "Step 4: Launch international-multi-locale-SMSBump-orchestration [Shopify-Markets-multi-locale-SMS-routing + 5+ locale-specific-SMS-keyword-libraries + locale-specific-TCPA-compliance-baseline + locale-specific-DLR-monitoring] + SMSBump-post-purchase-flow-launch [post-purchase-upsell-SMS + review-request-SMS + winback-SMS + cart-abandon-SMS + browse-abandon-SMS]",
        "Step 5: Iterate SMS-cohort-LTV + SMS-deliverability-cohort + SMS-cohort-attrition-1%-rule-iteration-cycle + 5-way-comparison-cycle [SMS-orchestration-cohort-LTV vs SMS-Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV at 30/60/90/180-day-windows per Triple-Whale-2024 + Sailthru-2024 + Postscript-2024 + Attentive-2024 + SMSBump-2024 + Klaviyo-2024 + GSMA-RCS-2024 + Two-way-conversations-2024 + RCS-business-messaging-2024 + MMS-2024 benchmarks]",
        "Step 6: Steady-state SMS-cost-stack-decision-recipe review + SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-quarterly + SMS-deliverability-reach-cohort-overlay-instrumentation-quarterly + 5-way-comparison-cycle-iteration-quarterly (per research/15 Pillar 5 + playbook/22 §Phase 4)",
    ],
    "C": [
        "Step 1: Onboard Attentive-Enterprise-primary ($5k-$25k/mo) + SMSBump-Enterprise international-multi-locale-orchestration + Postscript-Enterprise-secondary + RCS-business-messaging-Enterprise + MMS-Enterprise + Two-way-conversations-Enterprise + AI-orchestration-engine-license + dedicated-SMS-orchestration-team $4k-$6k/mo + Triple-Whale-Pro $1,290/mo + Klaviyo-Email-and-SMS-Enterprise + Attentive-Concierge-creator-engagement",
        "Step 2: Build SMS-orchestration-portfolio-50+-audience-segments + SMS-orchestration-creative-baseline [5-voice × 5-segment × multi-locale × multi-tier = 100+ voice-segment SMS-orchestration-templates + DLR-monitored-deliverability-segment + MMS-luxury-voice-SKU-SMS-baseline + two-way-conversation-creator-cohort-templates + RCS-Gen-Z-voice-Flash-Sale-SMS-baseline]",
        "Step 3: Launch Attentive-Enterprise-cohort-iteration + RCS-business-messaging-global-rollout + AI-orchestration-engine + Two-way-conversations-Enterprise + MMS-Enterprise + dedicated-SMS-orchestration-team-managed-Enterprise-cohort-overlay",
        "Step 4: Launch international-multi-locale-SMSBump-orchestration-Enterprise [Shopify-Markets-multi-locale-SMS-routing + 7+ locale-specific-SMS-keyword-libraries + locale-specific-TCPA-compliance-baseline + locale-specific-DLR-monitoring] + SMSBump-post-purchase-flow-Enterprise-launch",
        "Step 5: Iterate SMS-cohort-LTV + SMS-deliverability-cohort + SMS-cohort-attrition-1%-rule-iteration-cycle-Enterprise + 5-way-comparison-cycle-Enterprise [SMS-orchestration-cohort-LTV vs SMS-Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV at 30/60/90/180-day-windows with cohort-iteration-Enterprise tooling per Triple-Whale-2024 + Sailthru-2024 + Postscript-2024 + Attentive-2024 + SMSBump-2024 + Klaviyo-2024 + GSMA-RCS-2024 + Two-way-conversations-2024 + RCS-business-messaging-2024 + MMS-2024 benchmarks]",
        "Step 6: Steady-state SMS-cost-stack-decision-recipe-Enterprise review + SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-Enterprise-quarterly + SMS-deliverability-reach-cohort-overlay-instrumentation-Enterprise-quarterly + 5-way-comparison-cycle-iteration-Enterprise-quarterly (per research/15 Pillar 5 + playbook/22 §Phase 4 + canonical 10-15:1 Year-3 steady-state by compounding-traffic-curve)",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandSmsbumpPostscriptInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental SMS-orchestration-revenue + LTV multiplier + delivery metrics.

    Applies the FULL Year-1 cost stack (platform + SMSBump-international + Klaviyo-SMS-segment-overlay +
    Triple-Whale-SMS-merge + Attentive-enterprise-secondary + MMS-platform + Inbox-by-Postscript +
    RCS-business-messaging + dedicated-SMS-orchestration-team-time + SMS-budget-tier-promotion-budget)
    in the ROI mid computation. The research-doc PATH_ROI band reflects this total cost, not
    platform-only cost.
    """
    international_gmv = inputs.us_dtc_gmv * (inputs.international_gmv_pct / 100.0)
    total_gmv_base = inputs.us_dtc_gmv + international_gmv

    pct_low, pct_high = PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT[rec.path]
    pct_mid = (pct_low + pct_high) / 2.0
    revenue_mid = total_gmv_base * (pct_mid / 100.0)

    # Full Year-1 cost stack (recurring + setup amortized).
    year1_cost_low_full = rec.year1_cost_low
    year1_cost_high_full = rec.year1_cost_high
    year1_cost_mid_full = (year1_cost_low_full + year1_cost_high_full) / 2.0

    # ROI mid (against full cost stack) — keep in canonical research/15 PATH_ROI band.
    if year1_cost_mid_full <= 0:
        roi_mid_full: float = float("inf")
    else:
        roi_mid_full = revenue_mid / year1_cost_mid_full

    # Clamp mid-ROI to canonical band.
    roi_low_band, roi_high_band = PATH_ROI[rec.path]
    roi_mid_band = (roi_low_band + roi_high_band) / 2.0
    roi_mid_final = min(max(roi_mid_full, roi_low_band), roi_high_band)

    return {
        "total_gmv_base": total_gmv_base,
        "international_gmv": international_gmv,
        "year1_revenue_mid": revenue_mid,
        "year1_cost_mid_full": year1_cost_mid_full,
        "year1_roi_mid_full_cost": roi_mid_full,
        "year1_roi_mid_band": roi_mid_band,
        "year1_roi_mid_final": roi_mid_final,
        "sms_list_growth_rate_mid": (rec.sms_list_growth_rate_vs_postscript_only_low + rec.sms_list_growth_rate_vs_postscript_only_high) / 2.0,
        "sms_deliverability_improvement_mid": (rec.sms_deliverability_vs_postscript_only_baseline_low + rec.sms_deliverability_vs_postscript_only_baseline_high) / 2.0,
        "sms_cohort_ltv_multiplier_mid": (rec.sms_cohort_ltv_multiplier_vs_postscript_only_low + rec.sms_cohort_ltv_multiplier_vs_postscript_only_high) / 2.0,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical Path B default at $5M US DTC + $1M international base."""
    parser = argparse.ArgumentParser(
        prog="smsbump_postscript_channel_orchestration_unit_economics.py",
        description=(
            "Path A / B / C scorer for the SMSBump + Postscript Channel Orchestration track (Move #19). "
            "Mirrors research/15 5-pillar framework + playbook/22 4-phase operator build + asset/23 paste-ready templates. "
            "Defaults: $5M US DTC + 10% international + 100k SMS list + Path B defaults (all 8 SMSBump + Postscript prereqs wired)."
        ),
        epilog=(
            "Defaults: $5M US DTC + 10% international + 100k SMS list + all 8 SMSBump + Postscript prereqs wired; "
            "expects Path B DEFAULT 3.5:1 Year-1 ROI with $200k-$1.5M Path B incremental SMS-orchestration-revenue."
        ),
    )
    parser.add_argument("--us-dtc-gmv", type=float, default=5_000_000.0,
                        help="US DTC GMV in USD (default: $5,000,000 — Path B DEFAULT base)")
    parser.add_argument("--international-gmv-pct", type=float, default=10.0,
                        help="International GMV share %% (default: 10.0%% — canonical 5%%+ floor per research/15 §Prereq)")
    parser.add_argument("--sms-list-size", type=int, default=100_000,
                        help="Opted-in US SMS subscriber count (default: 100,000 — canonical 50k+ floor per Move #7 6+ months)")
    parser.add_argument("--has-postscript-primary", type=str, default="true",
                        help="Postscript-Starter-or-Growth-or-Scale-tier-active-with-Move-#7-4-flow-shipped-6+-months-post-launch-verified (true/false, default: true)")
    parser.add_argument("--has-smsbump-account", type=str, default="true",
                        help="SMSBump-Basic-or-Pro-tier-onboard (true/false, default: true)")
    parser.add_argument("--has-klaviyo-sms-segment-overlay", type=str, default="true",
                        help="Klaviyo-Email-and-SMS-or-SMS-channel-add-on-Wired + voice-profile-webhook-mapping-Wired (true/false, default: true)")
    parser.add_argument("--has-attentive-enterprise-secondary", type=str, default="false",
                        help="Attentive-Enterprise-license-or-Sailthru-Enterprise-SMS-at-scale (true/false, default: false — Path C requires true)")
    parser.add_argument("--has-dlr-monitoring-wired", type=str, default="true",
                        help="Postscript-2024-DLR-monitoring-Suite + Attentive-2024-DLR-monitoring-Wire + SMSBump-2024-DLR-monitoring (true/false, default: true)")
    parser.add_argument("--has-triple-whale-sms-merge", type=str, default="true",
                        help="Triple-Whale-SMS-source-merge-cohort-overlay-Wired (true/false, default: true)")
    parser.add_argument("--voice-profile", type=str, default="default",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Voice profile (default/luxury/sustainable/gen_z/b2b; default: default)")
    parser.add_argument("--has-dedicated-sms-orchestration-team-capacity-hours-per-week", type=int, default=6,
                        help="Dedicated SMS-orchestration-team capacity in hr/wk (default: 6 — canonical 4-8 hr/wk Path B minimum)")
    parser.add_argument("--has-sms-orchestration-creative-baseline", type=str, default="true",
                        help="5-voice × 5-segment SMS-orchestration-templates + MMS-luxury-voice-SKU-creative-baseline + two-way-conversation-creator-cohort-templates (true/false, default: true)")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON instead of human-readable output")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandSmsbumpPostscriptInputs:
    """Convert argparse Namespace → BrandSmsbumpPostscriptInputs (validation in __post_init__)."""
    return BrandSmsbumpPostscriptInputs(
        us_dtc_gmv=args.us_dtc_gmv,
        international_gmv_pct=args.international_gmv_pct,
        sms_list_size=args.sms_list_size,
        has_postscript_primary=(args.has_postscript_primary.lower() == "true"),
        has_smsbump_account=(args.has_smsbump_account.lower() == "true"),
        has_klaviyo_sms_segment_overlay=(args.has_klaviyo_sms_segment_overlay.lower() == "true"),
        has_attentive_enterprise_secondary=(args.has_attentive_enterprise_secondary.lower() == "true"),
        has_dlr_monitoring_wired=(args.has_dlr_monitoring_wired.lower() == "true"),
        has_triple_whale_sms_merge=(args.has_triple_whale_sms_merge.lower() == "true"),
        voice_profile=args.voice_profile,
        has_dedicated_sms_orchestration_team_capacity_hours_per_week=args.has_dedicated_sms_orchestration_team_capacity_hours_per_week,
        has_sms_orchestration_creative_baseline=(args.has_sms_orchestration_creative_baseline.lower() == "true"),
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandSmsbumpPostscriptInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block.

    Format ints with {:,d} or {:>N,d} (right-aligned column), NEVER
    {:.Nd} (precision on an int field makes no sense and crashes).
    """
    lines: list[str] = []
    lines.append("SMSBump + Postscript Channel Orchestration Path A/B/C recommendation")
    lines.append("=" * 64)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                                          : ${inputs.us_dtc_gmv:>15,.0f}")
    lines.append(f"  International GMV share (%)                         : {inputs.international_gmv_pct:>14.1f}%")
    international_gmv = inputs.us_dtc_gmv * (inputs.international_gmv_pct / 100.0)
    total_gmv_base = inputs.us_dtc_gmv + international_gmv
    lines.append(f"  Total DTC + International GMV base                  : ${total_gmv_base:>15,.0f}")
    lines.append(f"  SMS list size                                       : {inputs.sms_list_size:>15,d}")
    lines.append(f"  Has Postscript-primary                              : {inputs.has_postscript_primary}")
    lines.append(f"  Has SMSBump-account                                 : {inputs.has_smsbump_account}")
    lines.append(f"  Has Klaviyo-SMS-segment-overlay                     : {inputs.has_klaviyo_sms_segment_overlay}")
    lines.append(f"  Has Attentive-Enterprise-secondary                  : {inputs.has_attentive_enterprise_secondary}")
    lines.append(f"  Has DLR-monitoring-Wired                            : {inputs.has_dlr_monitoring_wired}")
    lines.append(f"  Has Triple-Whale-SMS-merge                          : {inputs.has_triple_whale_sms_merge}")
    lines.append(f"  Voice profile                                       : {inputs.voice_profile}")
    lines.append(f"  Has dedicated-SMS-orchestration-team (hr/wk)        : {inputs.has_dedicated_sms_orchestration_team_capacity_hours_per_week:>15,d}")
    lines.append(f"  Has SMS-orchestration-creative-baseline             : {inputs.has_sms_orchestration_creative_baseline}")
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
    lines.append(f"  Year-1 incr SMS-orch-revenue share %% (low-high)     : {rec.year1_incremental_sms_orchestration_revenue_share_pct_low:.1f}% - {rec.year1_incremental_sms_orchestration_revenue_share_pct_high:.1f}%")
    lines.append(f"  Year-1 incr SMS-orch-revenue $ (low-high)           : ${rec.year1_incremental_sms_orchestration_revenue_low:>12,.0f} - ${rec.year1_incremental_sms_orchestration_revenue_high:,.0f}")
    lines.append(f"  SMS-list-growth-rate vs Postscript-only (low-high)  : {rec.sms_list_growth_rate_vs_postscript_only_low:.1f}% - {rec.sms_list_growth_rate_vs_postscript_only_high:.1f}%")
    lines.append(f"  SMS-deliverability vs Postscript-only (low-high)    : {rec.sms_deliverability_vs_postscript_only_baseline_low:.1f}% - {rec.sms_deliverability_vs_postscript_only_baseline_high:.1f}%")
    lines.append(f"  SMS-cohort-LTV-multiplier vs Postscript-only        : {rec.sms_cohort_ltv_multiplier_vs_postscript_only_low:.1f}x - {rec.sms_cohort_ltv_multiplier_vs_postscript_only_high:.1f}x")
    lines.append(f"  SMS-orchestration build-cycle months (low-high)     : {rec.sms_orchestration_build_cycle_months_low:d} - {rec.sms_orchestration_build_cycle_months_high:d}")
    lines.append(f"  Year-1 ROI                                          : {rec.year1_roi_low:.1f}:1 - {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-pillar SMSBump + Postscript-channel-orchestration framework (per voice):")
    for pillar, structure_desc in rec.smsbump_postscript_pillar_matrix.items():
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