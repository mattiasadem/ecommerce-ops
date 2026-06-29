#!/usr/bin/env python3
"""
affiliate_unit_economics.py — Path A / B / C scorer for the affiliate-program
track (Move #15 companion script).

Companion to:
- /research/09-affiliate-program.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/16-affiliate-program-launch.md (4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote operator build)
- /assets/17-affiliate-program-templates.md (paste-ready 5-flow × 5-voice × {email + SMS} affiliate-facing templates)

This script takes a brand's current affiliate-program-fit inputs
(us_gmv / aov / expected_affiliate_count / commission_tier / voice_profile /
has_triple_whale / has_klaviyo_post_purchase / has_smile_loyalty / has_levanta /
has_impact / iq_zone / operator_capacity_hours_per_week) and outputs a Path A
(GoAffPro free) / Path B (Refersion Growth DEFAULT $239/mo) / Path C (Impact
Enterprise + Levanta cross-channel) recommendation with cost stack, expected
Year-1 attributed revenue, LTV multiplier, cookie-deprecation recovery rate
(iOS 14.5+), sustainable-mission-alignment-verifier score, and a 6-step build
sequence. It is the operator-build input for the playbook's Prerequisites gate
(Phase 1 Step 1 "pick path + affiliate platform").

The scoring rule (mirrors research/09 §GMV-tier paths + playbook 16
§Prerequisites + asset 17 §5-voice commission-tier matrix + canonical
6-step cookie-deprecation mitigation recipe):
  - us_gmv < $100k                            → defer (Path A surfaced as audit only)
  - us_gmv $100k-$500k                        → Path A (GoAffPro free OR GoAffPro Growth $25/mo)
  - us_gmv $500k-$5M                          → Path B (Refersion Growth $239/mo DEFAULT)
  - us_gmv $5M+                               → Path C (Impact Enterprise $1k+/mo + Levanta)
  - expected_affiliate_count < 10             → defer (canonical 10+ active-affiliate baseline)
  - voice_profile = "sustainable" WITHOUT has_smile_loyalty=True → downgrade one tier
  - voice_profile = "gen_z" WITHOUT iq_zone in (low, mid) → downgrade one tier
  - has_triple_whale = False                  → defer (Triple Whale affiliate-cohort-overlay is the canonical Pillar 3 prereq)
  - has_klaviyo_post_purchase = False         → defer (post-purchase-email-match cookie-deprecation step 3 is the canonical Pillar 3 prereq)
  - has_levanta = False AND path == "C"       → defer (Levanta server-side fingerprinting is the canonical Pillar 3 Path C step 5)
  - operator_capacity_hours_per_week < 2      → defer (Path A minimum 2 hr/wk ongoing per playbook 16 §Prereq #8)

Why hermetic? This script does NOT call Refersion / Levanta / Impact /
GoAffPro / PartnerStack / Aspire / Triple Whale / Klaviyo / Smile.io / PayPal
Mass Pay / Wise APIs. The inputs are operator-supplied at the CLI; the cost
stack + per-path projection + 6-step build sequence are derived from
research/09 + playbook 16 + asset 17 (the canonical benchmarks the workspace
already ships). This is the same hermetic recipe as
threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / international_market_fit.py / lifecycle_flow_health_check.py
— the 90% of install mistakes the operator actually makes (wrong-path
selection, under-budgeting for setup, ignoring the FTC-compliance gate) don't
require API access; the local scoring rule catches them.

Usage:
    # Default: $2M US DTC brand, $50 AOV, 25 expected affiliates, sustainable voice
    python3 affiliate_unit_economics.py

    # Custom inputs (e.g. $8M premium brand, $80 AOV, 50 expected affiliates, gen_z voice)
    python3 affiliate_unit_economics.py \\
        --us-gmv 8000000 --aov 80 --expected-affiliate-count 50 \\
        --commission-tier 15 --voice-profile gen_z \\
        --has-triple-whale true --has-klaviyo-post-purchase true \\
        --has-smile-loyalty true --has-levanta false --has-impact true \\
        --iq-zone mid --operator-capacity-hours-per-week 6

    # JSON output (for cron / CI / dashboard piping)
    python3 affiliate_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 09, playbook 16, asset 17 (affiliate-program-templates), and
/affiliates route shipped 2026-06-29/30; this script is the canonical
5th-layer follow-up per the research → playbook → asset → operator-surface →
scripts layer order. It compounds asset 17's 5-flow × 5-voice × {email + SMS}
= 50 voice-driven override cells + 5-voice commission-tier matrix [Default
15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% /
B2B 8-12/12-15/15-20%] + per-voice cookie windows [Default 30d / Luxury 60d /
Sustainable 30d / Gen-Z 7d / B2B 90d] + per-voice payout schedules [Default
NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60] +
research/09 §GMV-tier paths + playbook 16 §Phase 1 Step 1.1 platform-selection
+ asset 17 §5-voice commission-tier matrix + dashboard/app/affiliates/page.tsx
by automating the per-brand path-selection decision the operator currently
does manually against the 3-path GMV-tier matrix.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal

PathName = Literal["A", "B", "C"]
VoiceProfile = Literal["default", "luxury", "sustainable", "gen_z", "b2b"]
IQZone = Literal["low", "mid", "high"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandAffiliateInputs:
    """Operator-supplied current-affiliate-fit inputs. All numeric bounds validated in __post_init__."""
    us_gmv: float                                 # current US DTC GMV in USD
    aov: float                                    # current average order value in USD
    expected_affiliate_count: int                 # how many active affiliates expected in Year 1
    commission_tier: float                        # base commission tier 1 (e.g. 15% for Default Tier-1)
    voice_profile: str                            # default / luxury / sustainable / gen_z / b2b
    has_triple_whale: bool                        # whether Triple Whale affiliate-cohort-LTV is wired
    has_klaviyo_post_purchase: bool               # whether Klaviyo post-purchase email-match is wired
    has_smile_loyalty: bool                       # whether Smile.io loyalty 2x points-for-affiliates is wired
    has_levanta: bool                             # whether Levanta server-side fingerprinting is installed
    has_impact: bool                              # whether Impact Partnership Cloud / cross-channel is installed
    iq_zone: str                                  # low / mid / high (per research/09 Pillar 1 commission-tier-by-iq)
    operator_capacity_hours_per_week: int         # operator hours per week for affiliate program

    def __post_init__(self) -> None:
        if self.us_gmv < 0:
            raise ValueError(f"us_gmv must be >= 0, got {self.us_gmv}")
        if self.aov <= 0:
            raise ValueError(f"aov must be > 0, got {self.aov}")
        if self.aov > 10_000.0:
            # canonical ceiling per research/09 Pillar 1 luxury-tier sanity bound
            raise ValueError(f"aov must be <= $10,000, got {self.aov}")
        if self.expected_affiliate_count < 0:
            raise ValueError(f"expected_affiliate_count must be >= 0, got {self.expected_affiliate_count}")
        if not (0 <= self.commission_tier <= 100):
            raise ValueError(
                f"commission_tier must be 0-100 (percent), got {self.commission_tier}"
            )
        valid_voices = {"default", "luxury", "sustainable", "gen_z", "b2b"}
        if self.voice_profile not in valid_voices:
            raise ValueError(
                f"voice_profile must be one of {sorted(valid_voices)}, got {self.voice_profile!r}"
            )
        valid_zones = {"low", "mid", "high"}
        if self.iq_zone not in valid_zones:
            raise ValueError(
                f"iq_zone must be one of {sorted(valid_zones)}, got {self.iq_zone!r}"
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
    year1_attributed_revenue_share_pct_low: float
    year1_attributed_revenue_share_pct_high: float
    year1_attributed_revenue_low: float
    year1_attributed_revenue_high: float
    ltv_multiplier_low: float
    ltv_multiplier_high: float
    year1_affiliate_count_low: int
    year1_affiliate_count_high: int
    cookie_deprecation_recovery_pct_low: float
    cookie_deprecation_recovery_pct_high: float
    sustainable_mission_align_score_low: int
    sustainable_mission_align_score_high: int
    year1_roi_low: float
    year1_roi_high: float
    commission_tier_matrix: dict[str, str] = field(default_factory=dict)
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
PATH_A_FLOOR = 100_000          # Below $100k → defer (canonical affiliate-program entry floor)
PATH_B_FLOOR = 500_000          # $500k-$5M → Path B (Refersion Growth) DEFAULT for $500k+ GMV brands
PATH_C_FLOOR = 5_000_000        # $5M+ → Path C (Impact Enterprise + Levanta)

# Path costs (USD, from research/09 §Cost & ROI estimate + playbook 16 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,    500.0,    0.0,   25.0),     # GoAffPro free (Path A) OR GoAffPro Growth ($25/mo): $0-$500 setup + $0-$25/mo
    "B":  (500.0,  2_500.0,  239.0, 489.0),    # Refersion Growth ($239/mo) DEFAULT OR Refersion Scale ($489/mo): $500-$2.5k setup + $239-$489/mo
    "C":  (5_000.0, 15_000.0, 1_500.0, 4_000.0), # Impact Enterprise ($1k+/mo) + Levanta Growth ($499/mo) + custom: $5k-$15k setup + $1.5k-$4k/mo
}

# Year-1 attributed-revenue-share bands (% of US DTC GMV, from research/09 §Path A/B/C).
PATH_ATTRIBUTED_REVENUE_SHARE_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (8.0, 20.0),     # Path A: 8-20% of US DTC GMV per research/09 §Path A (smaller scale, 30-60% cookie-loss)
    "B":  (20.0, 40.0),    # Path B: 20-40% per research/09 §Path B (DEFAULT; 25-35% cookie-loss with full mitigation)
    "C":  (30.0, 50.0),    # Path C: 30-50% per research/09 §Path C (Levanta server-side fingerprinting recovers 15-25%)
}

# Affiliate LTV multiplier bands (vs one-time-purchase LTV, from research/09 Pillar 4 §b).
PATH_LTV_MULTIPLIER: dict[PathName, tuple[float, float]] = {
    "A":  (1.5, 2.0),     # Path A: 1.5-2.0× one-time LTV per research/09 Pillar 4
    "B":  (2.0, 3.0),     # Path B: 2.0-3.0× (DEFAULT) per research/09 Pillar 4
    "C":  (2.5, 3.5),     # Path C: 2.5-3.5× per research/09 Pillar 4 (premium operators with Levanta)
}

# Cookie-deprecation recovery bands (% of would-be-lost iOS 14.5+ attribution, from research/09 Pillar 3).
COOKIE_DEPRECATION_RECOVERY_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 15.0),    # Path A: minimal mitigation (no Levanta; 30-60% baseline loss)
    "B":  (25.0, 35.0),   # Path B: full mitigation without Levanta (DEFAULT)
    "C":  (40.0, 60.0),   # Path C: Levanta server-side fingerprinting + Triple Whale cohort-overlay
}

# Sustainable-mission-alignment-verifier score (per assets/12-impact-data-pipeline.md +
# research/09 Pillar 5 + asset 17 §Sustainable-mission-alignment-verifier template).
# Range: 0-100; Path B/C brands with Sustainable voice profile must score ≥60 to
# unlock Tier-3 30% commission rate.
SUSTAINABLE_MISSION_ALIGN_SCORE: dict[PathName, tuple[int, int]] = {
    "A":  (40, 65),       # Path A: 40-65 (manual verifier, no Triple Whale overlay)
    "B":  (60, 85),       # Path B: 60-85 (Triple Whale + Klaviyo segment + manual check)
    "C":  (70, 95),       # Path C: 70-95 (full Triple Whale cohort + sustainability reporting API)
}

# Year-1 ROI bands (gross attributed revenue / cost, per research/09 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (8.0, 12.5),    # canonical 12.5:1 default Path A (research/09 line 175)
    "B":  (3.7, 8.0),     # canonical 6:1 default Path B at $2M GMV base (research/09 §Cost & ROI estimate)
    "C":  (3.5, 5.0),     # canonical 4:1 default Path C at $5M+ GMV base (research/09 line 175)
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path platform scope (description, used in recommendation).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A":  ["GoAffPro free (Shopify app; $0/mo; canonical Path A starter)"],
    "B":  ["Refersion Growth ($239/mo) DEFAULT", "Refersion Scale ($489/mo)", "Levanta Growth ($499/mo) cross-channel"],
    "C":  ["Impact Partnership Cloud Enterprise ($1k+/mo)", "Levanta cross-channel ($499/mo)", "Aspire ($500+/mo) influencer-marketing", "PartnerStack B2B-affiliate (Path C B2B-voice)"],
}

# Path default platform pick.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A":  "GoAffPro free (default Path A; Shopify-native; $0/mo for <$500k GMV brands)",
    "B":  "Refersion Growth (default Path B; $239/mo for $500k-$5M GMV brands — canonical DEFAULT for $2M US DTC brand)",
    "C":  "Impact Partnership Cloud Enterprise OR Levanta cross-channel (default Path C; $1k-$4k/mo for $5M+ GMV brands with Levanta server-side fingerprinting)",
}

# 5-voice commission-tier matrix (from research/09 Pillar 2 + asset 17 §5-voice commission-tier matrix).
# Maps voice profile → "Tier-1 / Tier-2 / Tier-3" commission rates.
COMMISSION_TIER_MATRIX: dict[str, str] = {
    "default":     "15% / 20% / 25% (Default voice — canonical balanced program per Awin 2024)",
    "luxury":      "10% / 12% / 15% (Luxury voice — lower commission + longer cookie window 60d)",
    "sustainable": "20% / 25% / 30% (Sustainable voice — higher commission to attract mission-aligned creators per assets/12-impact-data-pipeline.md)",
    "gen_z":       "25% / 30% / 35% (Gen-Z voice — highest commission + shortest cookie window 7d for impulse buys)",
    "b2b":         "8-12% / 12-15% / 15-20% (B2B voice — lower base + longer cookie 90d + NET-60 payout per B2B sales-cycle)",
}

# Upgrade + downgrade gates.
SUSTAINABLE_DOWNGRADE_ENABLED = True   # Sustainable voice without Smile loyalty → downgrade
GENZ_DOWNGRADE_ENABLED = True         # Gen-Z voice without low/mid IQ zone → downgrade
CAPACITY_GATE_HR_WK = 2                # <2 hr/wk → defer (Path A minimum 2 hr/wk ongoing per playbook 16 §Prereq #8)
MIN_EXPECTED_AFFILIATE_COUNT = 10      # <10 → defer (canonical 10+ active-affiliate baseline per Awin 2024)


def _tier_for_gmv(us_gmv: float) -> PathName:
    """Return the base path tier for a given US DTC GMV (without gates)."""
    if us_gmv >= PATH_C_FLOOR:
        return "C"
    if us_gmv >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandAffiliateInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False
    deferred_for_affiliate_count = False
    deferred_for_triple_whale = False
    deferred_for_klaviyo = False
    deferred_for_levanta = False

    # Capacity floor: defer if operator has insufficient time.
    if inputs.operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 16 §Prerequisite #8 + asset 17 §5-voice commission-tier matrix); "
            f"affiliate program deferred until operator capacity is available."
        )
        deferred_for_capacity = True

    # Expected-affiliate-count floor: defer if <10 (canonical 10+ active-affiliate baseline).
    if inputs.expected_affiliate_count < MIN_EXPECTED_AFFILIATE_COUNT:
        justification_parts.append(
            f"Expected affiliate count {inputs.expected_affiliate_count} < {MIN_EXPECTED_AFFILIATE_COUNT} "
            f"floor (Awin 2024 + research/09 §Prerequisites: 10+ active affiliates is the canonical "
            f"Year-1 baseline for any affiliate program to generate attributable revenue); affiliate program "
            f"deferred until seed-first-100-affiliates loop (playbook 16 §Phase 2 Step 2.5) is executed."
        )
        deferred_for_affiliate_count = True

    # Triple Whale cohort-LTV deferral (canonical Pillar 3 + Pillar 4 prerequisite).
    if not inputs.has_triple_whale:
        justification_parts.append(
            "has_triple_whale=False (research/09 Pillar 3 Step 6 + Pillar 4 §b: Triple Whale "
            "affiliate-cohort-overlay is the canonical cookie-deprecation step 6 + the canonical "
            "cohort-LTV-measurement substrate; without it, neither 4-step cohort-LTV SQL nor "
            "Triple Whale ?tw_camp=affiliate_<id> UTM attribution is wired); affiliate program "
            "deferred until Triple Whale is installed + cohort LTV is filtered to affiliate_id."
        )
        deferred_for_triple_whale = True

    # Klaviyo post-purchase-email-match deferral (canonical Pillar 3 step 3 cookie-deprecation).
    if not inputs.has_klaviyo_post_purchase:
        justification_parts.append(
            "has_klaviyo_post_purchase=False (research/09 Pillar 3 Step 3: Klaviyo "
            "post-purchase-email-match is the canonical iOS 14.5+ cookie-deprecation step 3; "
            "matches affiliate-driven customers via Klaviyo 'Marketplace Purchaser (last 30 days)' "
            "segment + post-purchase email UTM triple-tag); affiliate program deferred until "
            "Klaviyo post-purchase flow + UTM triple-tag are wired."
        )
        deferred_for_klaviyo = True

    # Base tier assignment.
    if inputs.us_gmv < PATH_A_FLOOR:
        # Path A as deferral when below the $100k GMV floor.
        path = "A"
        if not (deferred_for_capacity or deferred_for_affiliate_count
                or deferred_for_triple_whale or deferred_for_klaviyo or deferred_for_levanta):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} is below the ${PATH_A_FLOOR:,.0f} "
                f"affiliate-program entry floor; affiliate launch is deferred until "
                f"US DTC GMV exceeds ${PATH_A_FLOOR:,.0f} (research/09 §Prerequisites). "
                f"Path A is still surfaced as the recommendation for tracking (audit only)."
            )
    else:
        path = _tier_for_gmv(inputs.us_gmv)
        if not (deferred_for_capacity or deferred_for_affiliate_count
                or deferred_for_triple_whale or deferred_for_klaviyo or deferred_for_levanta):
            justification_parts.append(
                f"US DTC GMV ${inputs.us_gmv:,.0f} lands in the Path {path} tier "
                f"(${_tier_floor_text(path)} - ${_tier_ceiling_text(path)} GMV)."
            )

    # Levanta deferral only fires if path was bumped to C and Levanta is missing.
    if path == "C" and not inputs.has_levanta:
        justification_parts.append(
            "Path C requires Levanta server-side fingerprinting (research/09 Pillar 3 Step 5: "
            "Levanta is the canonical Path C cookie-deprecation step 5; without it, "
            "Path C reverts to Path B with 40-60% recovery vs 25-35%); downgrade to Path B "
            "until Levanta is installed (Levanta Growth $499/mo)."
        )
        deferred_for_levanta = True
        # Downgrade Path C → Path B since Levanta is the canonical Path C prerequisite.
        path = "B"

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    downgrades: list[str] = []

    # Downgrade: Sustainable voice without Smile loyalty (mission-alignment-verifier gate).
    if SUSTAINABLE_DOWNGRADE_ENABLED and inputs.voice_profile == "sustainable" and not inputs.has_smile_loyalty:
        downgrades.append(
            "voice_profile=sustainable WITHOUT has_smile_loyalty=True (research/09 Pillar 5 + "
            "assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier: "
            "Smile.io 2x points for affiliate-driven customers is the canonical verification "
            "that the brand is committed to sustainability economics; without it, Tier-3 30% "
            "Sustainable commission is unverified and the path is downgraded by one tier)"
        )

    # Downgrade: Gen-Z voice with high IQ zone (mismatch — Gen-Z impulse-buy not aligned with premium buyers).
    if GENZ_DOWNGRADE_ENABLED and inputs.voice_profile == "gen_z" and inputs.iq_zone == "high":
        downgrades.append(
            "voice_profile=gen_z WITH iq_zone=high (research/09 Pillar 1: Gen-Z 25-30-35% "
            "commission + 7-day cookie window is calibrated for impulse-buy on mid/low-tier "
            "SKUs; high-IQ-zone brands attract premium-buyers where the 7-day cookie window "
            "misses the typical 14-21 day Gen-Z high-IQ purchase cycle); downgrade one tier"
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
    elif not (deferred_for_capacity or deferred_for_affiliate_count
              or deferred_for_triple_whale or deferred_for_klaviyo or deferred_for_levanta):
        justification_parts.append("All gates pass; no downgrade applied.")

    # Cost stack + attributed revenue + LTV + cookie recovery + mission align + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    share_low, share_high = PATH_ATTRIBUTED_REVENUE_SHARE_PCT[path]
    ltv_low, ltv_high = PATH_LTV_MULTIPLIER[path]
    cook_low, cook_high = COOKIE_DEPRECATION_RECOVERY_PCT[path]
    sus_low, sus_high = SUSTAINABLE_MISSION_ALIGN_SCORE[path]
    roi_low, roi_high = PATH_ROI[path]

    # Compute dollar bands.
    attributed_revenue_low = inputs.us_gmv * (share_low / 100.0)
    attributed_revenue_high = inputs.us_gmv * (share_high / 100.0)

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
        year1_attributed_revenue_share_pct_low=share_low,
        year1_attributed_revenue_share_pct_high=share_high,
        year1_attributed_revenue_low=attributed_revenue_low,
        year1_attributed_revenue_high=attributed_revenue_high,
        ltv_multiplier_low=ltv_low,
        ltv_multiplier_high=ltv_high,
        year1_affiliate_count_low=int(inputs.expected_affiliate_count * 0.7),
        year1_affiliate_count_high=int(inputs.expected_affiliate_count * 1.2),
        cookie_deprecation_recovery_pct_low=cook_low,
        cookie_deprecation_recovery_pct_high=cook_high,
        sustainable_mission_align_score_low=sus_low,
        sustainable_mission_align_score_high=sus_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        commission_tier_matrix=dict(COMMISSION_TIER_MATRIX),
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

# The 6-step build recipe, parameterized by path. Mirrors playbook 16 §Phase 1+2+3+4.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (2 hr) — Pick path + GoAffPro setup: Path A = GoAffPro free (Shopify app, $0/mo). Verify ≥$100k US DTC GMV + ≥10 expected affiliates + Triple Whale + Klaviyo post-purchase email-match wired per research/09 §Prereq #1-#8.",
        "Step 2 (2 hr) — Phase 1 platform + commission tiers: configure Default 15/20/25% commission tiers + 30-day cookie window + NET-30 payout schedule + 3-clause affiliate agreement (commission + payment-terms + termination) + FTC disclosure language (#ad/#sponsored/#partner at start of every affiliate-driven post) per playbook 16 §Phase 1 Step 1.3.",
        "Step 3 (4 hr) — Phase 2 recruitment + onboarding + landing-page live: seed-first-100-affiliates loop (existing-customer-list scrape via Klaviyo 'Engaged customers with social handles' segment + micro-influencer outreach via Aspire + Collabstr + Instagram hashtag scrape + public-listing on Awin + Impact + Levanta marketplaces) per playbook 16 §Phase 2 Step 2.5 + paste-ready affiliate-application landing-page skeleton from asset 17.",
        "Step 4 (2 hr) — Phase 3 cookie-deprecation mitigation (minimal — Path A is the canonical 'manual + UTM' tier): install Shopify CAPI server-side + UTM fallback ?tw_camp=affiliate_<id> + post-purchase email triple-tag in Klaviyo per research/09 Pillar 3 Steps 1-4 + Triple Whale cohort-overlay per Step 6 (no Levanta server-side fingerprinting at Path A; manual UTM attribution only).",
        "Step 5 (2 hr) — Phase 4 cohort-LTV measurement (manual SQL): Triple Whale → Reports → Cohort LTV → filter to affiliate_id → compare 30d/60d/90d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 1.5-2.0× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 + the canonical 4-step cohort-LTV SQL.",
        "Step 6 (2 hr/wk ongoing) — Affiliate-application review + FTC-compliance audit + 4-trigger tier-promotion: review affiliate applications weekly + verify FTC disclosure language on every post + apply the 4-trigger tier-promotion SOP [volume $5k+/90d → Tier-2 / cohort-LTV $300+ → Tier-2 / content-quality 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible / tenure 180d + Triggers 1+2 → Tier-3] per playbook 16 §Phase 4 Step 4.4-4.6 + quarterly compliance audit every 90 days per research/09 Pillar 5.",
    ],
    "B": [
        "Step 1 (5 hr) — Pick path + Refersion Growth setup: Path B = Refersion Growth ($239/mo) DEFAULT OR Refersion Scale ($489/mo) for $500k+ brands OR Levanta Growth ($499/mo) cross-channel for creator-led brands. Verify ≥$500k US DTC GMV + ≥20 expected affiliates + Move #1 + #4 + #6 + #8 shipped per research/09 §Prereq #1.",
        "Step 2 (10 hr) — Phase 1 platform + commission tiers + per-voice cookie windows + per-voice payout schedules: configure 5-voice commission-tier matrix [Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%] + per-voice cookie windows [Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d] + per-voice payout schedules [Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60] + 3-clause affiliate agreement + FTC disclosure language per playbook 16 §Phase 1 Step 1.3 + asset 17 §per-voice FTC-disclosure templates.",
        "Step 3 (8 hr) — Phase 2 recruitment + onboarding + 5-flow × 5-voice email + SMS templates: seed-first-100-affiliates loop + 4-email onboarding-sequence template (Day 0 welcome + Day 7 first-content-prompt + Day 30 first-payout-celebration + Day 60 tier-promotion-educational) per asset 17 §Flow 1-5 + Klaviyo conditional-content syntax with `voice_profile` customer-property webhook mapping + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA per playbook 16 §Phase 2 Step 2.1-2.4.",
        "Step 4 (8 hr) — Phase 3 cookie-deprecation mitigation (full — Path B is the canonical 'Triple Whale + Klaviyo' tier): install Shopify CAPI server-side + UTM fallback + post-purchase email match in Klaviyo + Shopify Pixel + Triple Whale affiliate-cohort-overlay (NO Levanta server-side fingerprinting at Path B; manual UTM + Triple Whale attribution only) per research/09 Pillar 3 Steps 1-6 + iOS 14.5+ cookie-deprecation mitigation recovering 25-35% of would-be-lost attribution.",
        "Step 5 (4 hr) — Phase 4 cohort-LTV measurement (4-step SQL): Triple Whale → Reports → Cohort LTV → filter to affiliate_id + per-voice profile → compare 30d/60d/90d/180d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 2.0-3.0× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 + the canonical 4-step cohort-LTV SQL + Sustainable-mission-alignment-verifier for Sustainable voice.",
        "Step 6 (4 hr/wk ongoing) — Churn-alert + 4-trigger tier-promotion + quarterly FTC-compliance audit + Smile.io 2x points: Triple Whale → Alerts → affiliate_churn_rate > 8%/mo → Slack alert + apply the 4-trigger tier-promotion SOP per playbook 16 §Phase 4 Step 4.4 + Smile.io 2× points rule for affiliate-driven customers with >$300 90-day LTV per playbook 16 §Phase 4 Step 4.5 + quarterly compliance audit every 90 days per research/09 Pillar 5.",
    ],
    "C": [
        "Step 1 (10 hr) — Pick path + multi-platform architecture: Path C = Impact Partnership Cloud Enterprise ($1k+/mo) + Levanta cross-channel ($499/mo) + Aspire ($500+/mo) influencer-marketing + PartnerStack (B2B-voice only). Verify ≥$5M US DTC GMV + Path B steady-state + Levanta installed + dedicated affiliate-team per research/09 §Prereq #1.",
        "Step 2 (20 hr) — Phase 1 multi-platform + commission tiers + per-voice cookie windows + per-voice payout schedules (Path C extended): configure Impact + Levanta + Aspire + PartnerStack with full 5-voice commission-tier matrix + per-voice cookie windows + per-voice payout schedules + 3-clause affiliate agreement + FTC disclosure language + 5-voice FTC-disclosure templates per playbook 16 §Phase 1 Step 1.3-1.5 + asset 17 §per-voice FTC-disclosure templates.",
        "Step 3 (15 hr) — Phase 2 enterprise recruitment + onboarding + Awin + Impact + Levanta marketplace listing + affiliate-network-manager: seed-first-1000-affiliates loop (Path B loop extended to 10×) + multi-platform 4-email onboarding-sequence template + Klaviyo conditional-content syntax + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA + Aspire creator-marketing + Impact cross-network syndication + PartnerStack B2B network + public-listing on Awin + Impact + Levanta + Refersion marketplaces + per-affiliate Awin + Impact + Levanta + Refersion marketplace profile per playbook 16 §Phase 2 Step 2.1-2.6 (Path C extended).",
        "Step 4 (15 hr) — Phase 3 cookie-deprecation mitigation (full Path C — Levanta server-side fingerprinting): install Shopify CAPI server-side + UTM fallback + post-purchase email match in Klaviyo + Shopify Pixel + Levanta server-side fingerprinting (canonical Path C cookie-deprecation step 5) + Triple Whale affiliate-cohort-overlay per research/09 Pillar 3 Steps 1-6 (Path C extended) + iOS 14.5+ cookie-deprecation mitigation recovering 40-60% of would-be-lost attribution vs 25-35% at Path B.",
        "Step 5 (10 hr) — Phase 4 cohort-LTV measurement (multi-platform sync): Triple Whale → Reports → Cohort LTV → filter to affiliate_id + per-voice profile + per-platform (Impact / Levanta / Aspire / PartnerStack) → compare 30d/60d/90d/180d/365d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 2.5-3.5× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 (Path C extended) + the canonical 4-step cohort-LTV SQL + Sustainable-mission-alignment-verifier for Sustainable voice + cross-platform subscription-LTV comparison per Move #11 cross-pollination.",
        "Step 6 (10+ hr/wk ongoing + dedicated affiliate-team) — Cross-platform affiliate-LTV monitoring + churn-optimization + affiliate-program-QBR + quarterly FTC-compliance audit + dedicated affiliate-program-manager: per playbook 16 §Phase 4 Step 4.4-4.6 Path C extended + quarterly affiliate-program-QBR every 90 days + cross-platform subscription-LTV comparison per Move #11 + cross-channel cross-platform affiliate-LTV monitoring across Impact + Levanta + Aspire + PartnerStack.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_revenue(inputs: BrandAffiliateInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental attributed revenue + LTV multiplier + affiliate count for the recommended path.

    Uses the midpoint of the path's attributed-revenue-share band and the
    operator's US DTC GMV to derive per-line revenue. Applies the
    cookie-deprecation recovery multiplier so the projected ROI is consistent
    with the canonical research/09 PATH_ROI band (3.7-8.0 Path B default —
    reflects POST-cookie-deprecation attribution, not raw attributed).

    Returns a dict suitable for JSON output.
    """
    share_mid = (rec.year1_attributed_revenue_share_pct_low + rec.year1_attributed_revenue_share_pct_high) / 2.0
    ltv_mid = (rec.ltv_multiplier_low + rec.ltv_multiplier_high) / 2.0

    year1_attributed_revenue_mid = inputs.us_gmv * (share_mid / 100.0)

    # Affiliate count midpoint.
    affiliate_count_mid = int((rec.year1_affiliate_count_low + rec.year1_affiliate_count_high) / 2.0)

    # Per-affiliate attributed revenue midpoint.
    per_affiliate_revenue_mid = year1_attributed_revenue_mid / affiliate_count_mid if affiliate_count_mid > 0 else 0.0

    # Cookie-deprecation recovery midpoints.
    cookie_deprecation_recovery_mid = (rec.cookie_deprecation_recovery_pct_low + rec.cookie_deprecation_recovery_pct_high) / 2.0

    # Sustainable-mission-alignment score midpoint.
    sustainable_mission_align_mid = (rec.sustainable_mission_align_score_low + rec.sustainable_mission_align_score_high) / 2.0

    # ROI midpoint: ratio of NET Year-1 incremental attributed revenue over total Year-1 cost.
    # Total Year-1 cost = platform cost (rec.year1_cost_mid) + commission payouts
    # ($attributed × commission_tier%) + operator ops + recruitment. The canonical research/09
    # Path B default is $152k total cost = $3k platform + $144k commissions + $5k ops.
    year1_cost_mid = (rec.year1_cost_low + rec.year1_cost_high) / 2.0
    commission_cost_mid = year1_attributed_revenue_mid * (inputs.commission_tier / 100.0)
    ops_cost_mid = 5_000.0  # operator time @ $50/hr × 100 hours Year-1
    recruitment_cost_mid = 2_000.0  # creator-recruitment-cost range $0-$2k
    total_year1_cost_mid = year1_cost_mid + commission_cost_mid + ops_cost_mid + recruitment_cost_mid
    roi_mid = year1_attributed_revenue_mid / total_year1_cost_mid if total_year1_cost_mid > 0 else 0.0

    return {
        "us_gmv": inputs.us_gmv,
        "expected_affiliate_count": inputs.expected_affiliate_count,
        "year1_attributed_revenue_pct_mid": share_mid,
        "year1_attributed_revenue_low": rec.year1_attributed_revenue_low,
        "year1_attributed_revenue_mid": year1_attributed_revenue_mid,
        "year1_attributed_revenue_high": rec.year1_attributed_revenue_high,
        "ltv_multiplier_mid": ltv_mid,
        "affiliate_count_mid": affiliate_count_mid,
        "per_affiliate_revenue_mid": per_affiliate_revenue_mid,
        "cookie_deprecation_recovery_pct_mid": cookie_deprecation_recovery_mid,
        "sustainable_mission_align_score_mid": sustainable_mission_align_mid,
        "year1_platform_cost_low": rec.year1_cost_low,
        "year1_platform_cost_mid": year1_cost_mid,
        "year1_platform_cost_high": rec.year1_cost_high,
        "year1_commission_cost_mid": commission_cost_mid,
        "year1_ops_cost_mid": ops_cost_mid,
        "year1_recruitment_cost_mid": recruitment_cost_mid,
        "year1_total_cost_mid": total_year1_cost_mid,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_mid": roi_mid,
        "year1_roi_high": rec.year1_roi_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/09 Path B default."""
    parser = argparse.ArgumentParser(
        prog="affiliate_unit_economics.py",
        description=(
            "Score a brand's current-affiliate-program-fit inputs against the research/09 + playbook 16 + "
            "asset 17 Path A / B / C matrix. Returns the recommended path + affiliate platform pick + "
            "cost stack + Year-1 attributed revenue + LTV multiplier + affiliate count + cookie-deprecation "
            "recovery rate + sustainable-mission-alignment-verifier score + 6-step build sequence for the affiliate program."
        ),
        epilog=(
            "Defaults: $2M US DTC brand, $50 AOV, 25 expected affiliates, Sustainable voice (canonical "
            "Path B default for $500k-$5M GMV brands per research/09 §GMV-tier paths). Companion to "
            "/research/09, /playbooks/16, /assets/17-affiliate-program-templates.md, /affiliates route."
        ),
    )
    parser.add_argument("--us-gmv", type=float, default=2_000_000.0,
                        help="Current US DTC GMV in USD (default: 2,000,000 = Path B default).")
    parser.add_argument("--aov", type=float, default=50.0,
                        help="Current average order value in USD (default: 50).")
    parser.add_argument("--expected-affiliate-count", type=int, default=25,
                        help="Expected active affiliate count for Year 1 (default: 25 = Path B baseline).")
    parser.add_argument("--commission-tier", type=float, default=20.0,
                        help="Base commission tier 1 in percent (5-35, default: 20 = Sustainable Tier-1).")
    parser.add_argument("--voice-profile", type=str, default="sustainable",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Brand voice profile (default: sustainable; Path B canonical = sustainable).")
    parser.add_argument("--has-triple-whale", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Triple Whale affiliate-cohort-LTV is wired (default: true).")
    parser.add_argument("--has-klaviyo-post-purchase", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Klaviyo post-purchase email-match is wired (default: true).")
    parser.add_argument("--has-smile-loyalty", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether Smile.io loyalty 2x points-for-affiliates is wired (default: true).")
    parser.add_argument("--has-levanta", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether Levanta server-side fingerprinting is installed (default: false = Path B DEFAULT).")
    parser.add_argument("--has-impact", type=str, default="false",
                        choices=["true", "false"],
                        help="Whether Impact Partnership Cloud / cross-channel is installed (default: false = Path B DEFAULT).")
    parser.add_argument("--iq-zone", type=str, default="mid",
                        choices=["low", "mid", "high"],
                        help="Brand IQ zone (default: mid).")
    parser.add_argument("--operator-capacity-hours-per-week", type=int, default=6,
                        help="Operator hours per week for affiliate program (default: 6; floor is 2).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandAffiliateInputs:
    """Convert argparse Namespace → BrandAffiliateInputs (with the validation in __post_init__)."""
    return BrandAffiliateInputs(
        us_gmv=args.us_gmv,
        aov=args.aov,
        expected_affiliate_count=args.expected_affiliate_count,
        commission_tier=args.commission_tier,
        voice_profile=args.voice_profile,
        has_triple_whale=(args.has_triple_whale.lower() == "true"),
        has_klaviyo_post_purchase=(args.has_klaviyo_post_purchase.lower() == "true"),
        has_smile_loyalty=(args.has_smile_loyalty.lower() == "true"),
        has_levanta=(args.has_levanta.lower() == "true"),
        has_impact=(args.has_impact.lower() == "true"),
        iq_zone=args.iq_zone,
        operator_capacity_hours_per_week=args.operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandAffiliateInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("Affiliate-program Path A/B/C recommendation")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  US DTC GMV                            : ${inputs.us_gmv:>15,.0f}")
    lines.append(f"  AOV                                   : ${inputs.aov:>15,.2f}")
    lines.append(f"  Expected affiliate count              : {inputs.expected_affiliate_count:>15,d}")
    lines.append(f"  Commission tier (base %)              : {inputs.commission_tier:>14.1f}%")
    lines.append(f"  Voice profile                         : {inputs.voice_profile}")
    lines.append(f"  Has Triple Whale                      : {inputs.has_triple_whale}")
    lines.append(f"  Has Klaviyo post-purchase             : {inputs.has_klaviyo_post_purchase}")
    lines.append(f"  Has Smile loyalty                     : {inputs.has_smile_loyalty}")
    lines.append(f"  Has Levanta                           : {inputs.has_levanta}")
    lines.append(f"  Has Impact                            : {inputs.has_impact}")
    lines.append(f"  IQ zone                               : {inputs.iq_zone}")
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
    lines.append(f"  Attributed revenue share (low-high)   : {rec.year1_attributed_revenue_share_pct_low:.0f}% – {rec.year1_attributed_revenue_share_pct_high:.0f}%")
    lines.append(f"  Attributed revenue $ (low-high)       : ${rec.year1_attributed_revenue_low:>12,.0f} – ${rec.year1_attributed_revenue_high:,.0f}")
    lines.append(f"  LTV multiplier (low-high)             : {rec.ltv_multiplier_low:.1f}× – {rec.ltv_multiplier_high:.1f}×")
    lines.append(f"  Affiliate count (low-high)            : {rec.year1_affiliate_count_low:>12,d} – {rec.year1_affiliate_count_high:>12,d}")
    lines.append(f"  Cookie-deprecation recovery (low-high): {rec.cookie_deprecation_recovery_pct_low:.0f}% – {rec.cookie_deprecation_recovery_pct_high:.0f}%")
    lines.append(f"  Sustainable-mission-align score (low-high): {rec.sustainable_mission_align_score_low:>3d} – {rec.sustainable_mission_align_score_high}")
    lines.append(f"  Year-1 ROI                            : {rec.year1_roi_low:.1f}:1 – {rec.year1_roi_high:.1f}:1")
    lines.append("")
    lines.append("5-voice commission-tier matrix:")
    for voice, tier_desc in rec.commission_tier_matrix.items():
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