// smsbump-postscript-channel-orchestration.ts — TypeScript port of
// scripts/smsbump_postscript_channel_orchestration_unit_economics.py
// Move #19 SMSBump + Postscript Channel Orchestration Path A / B / C scorer.
//
// Mirrors research/15 §GMV-tier paths + playbook 22 §Phase 1+2+3+4 +
// asset 23 §5-pillar SMSBump + Postscript-channel-orchestration framework +
// the canonical 8-prereq SMSBump + Postscript-channel-orchestration
// onboarding pack.

export type PathName = "A" | "B" | "C";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";

export interface BrandSmsbumpPostscriptInputs {
  usDtcGmv: number;
  internationalGmvPct: number;
  smsListSize: number;
  hasPostscriptPrimary: boolean;
  hasSmsbumpAccount: boolean;
  hasKlaviyoSmsSegmentOverlay: boolean;
  hasAttentiveEnterpriseSecondary: boolean;
  hasDlrMonitoringWired: boolean;
  hasTripleWhaleSmsMerge: boolean;
  voiceProfile: VoiceProfile;
  hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: number;
  hasSmsOrchestrationCreativeBaseline: boolean;
}

export interface PathRecommendation {
  path: PathName;
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  year1IncrementalSmsOrchestrationRevenueSharePctLow: number;
  year1IncrementalSmsOrchestrationRevenueSharePctHigh: number;
  year1IncrementalSmsOrchestrationRevenueLow: number;
  year1IncrementalSmsOrchestrationRevenueHigh: number;
  smsListGrowthRateVsPostscriptOnlyLow: number;
  smsListGrowthRateVsPostscriptOnlyHigh: number;
  smsDeliverabilityVsPostscriptOnlyBaselineLow: number;
  smsDeliverabilityVsPostscriptOnlyBaselineHigh: number;
  smsCohortLtvMultiplierVsPostscriptOnlyLow: number;
  smsCohortLtvMultiplierVsPostscriptOnlyHigh: number;
  smsOrchestrationBuildCycleMonthsLow: number;
  smsOrchestrationBuildCycleMonthsHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  smsbumpPostscriptPillarMatrix: Record<string, string>;
  buildSequence: string[];
}

export interface PerPathRevenue {
  totalGmvBase: number;
  internationalGmv: number;
  year1RevenueMid: number;
  year1CostMidFull: number;
  year1RoiMidFullCost: number;
  year1RoiMidBand: number;
  year1RoiMidFinal: number;
  smsListGrowthRateMid: number;
  smsDeliverabilityImprovementMid: number;
  smsCohortLtvMultiplierMid: number;
}

// ----- Canonical constants (from research/15 + playbook 22 + asset 23) -----

export const PATH_A_FLOOR = 500_000;
export const PATH_B_FLOOR = 1_000_000;
export const PATH_C_FLOOR = 25_000_000;

export const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [200.0, 500.0, 200.0, 500.0],
  B: [2_000.0, 25_000.0, 1_000.0, 5_000.0],
  C: [25_000.0, 100_000.0, 3_000.0, 15_000.0],
};

export const PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [2.0, 5.0],
  B: [3.0, 15.0],
  C: [5.0, 25.0],
};

export const PATH_SMS_LIST_GROWTH_RATE_VS_POSTSCRIPT_ONLY: Record<PathName, [number, number]> = {
  A: [5.0, 15.0],
  B: [20.0, 40.0],
  C: [30.0, 60.0],
};

export const PATH_SMS_DELIVERABILITY_VS_POSTSCRIPT_ONLY_BASELINE: Record<PathName, [number, number]> = {
  A: [2.0, 5.0],
  B: [5.0, 15.0],
  C: [10.0, 20.0],
};

export const PATH_SMS_COHORT_LTV_MULTIPLIER_VS_POSTSCRIPT_ONLY: Record<PathName, [number, number]> = {
  A: [1.2, 1.5],
  B: [2.0, 3.0],
  C: [2.5, 4.0],
};

export const PATH_SMS_ORCHESTRATION_BUILD_CYCLE_MONTHS: Record<PathName, [number, number]> = {
  A: [1, 3],
  B: [6, 18],
  C: [12, 24],
};

export const PATH_ROI: Record<PathName, [number, number]> = {
  A: [4.0, 8.0],
  B: [2.4, 107.0],
  C: [2.0, 6.0],
};

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "Postscript-Starter-or-Growth-tier ($0-$800/mo)",
    "Postscript-DLR-monitoring-Suite ($0-$200/mo with Growth+)",
  ],
  B: [
    "Postscript-Growth-or-Scale-tier ($500-$2k/mo)",
    "SMSBump-Basic-or-Pro-tier ($100-$400/mo)",
    "Klaviyo-Email-and-SMS-or-SMS-channel-add-on ($45-$145/mo)",
    "Triple-Whale-Starter-or-Pro-with-SMS-source-merge ($179-$1,290/mo)",
    "MMS-platform Postscript-MMS-launch or Attentive-MMS-launch ($0-$100/mo)",
    "Inbox-by-Postscript-or-Attentive-Concierge ($0-$2k/mo)",
  ],
  C: [
    "Attentive-Enterprise-primary ($5k-$25k/mo)",
    "SMSBump-Enterprise international-multi-locale-orchestration",
    "Postscript-Enterprise-secondary",
    "RCS-business-messaging-Enterprise (GSMA-RCS rollout)",
    "MMS-Enterprise (rich-media-attachments + video-previews)",
    "Two-way-conversations-Enterprise",
    "AI-orchestration-engine-license",
  ],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "Postscript-Growth-tier + DLR-monitoring-Suite",
  B: "SMSBump-Pro-tier + Postscript-Scale-tier + Klaviyo-SMS-segment-overlay + Triple-Whale-Pro-with-SMS-merge + MMS-platform Postscript-MMS-launch",
  C: "Attentive-Enterprise-primary + SMSBump-Enterprise + RCS-business-messaging + AI-orchestration-engine",
};

export const SMSBUMP_POSTSCRIPT_PILLAR_MATRIX: Record<string, string> = {
  "Pillar 1 — Postscript-primary-onboard + DLR-monitoring-Wire + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay":
    "Postscript-Starter-or-Growth-or-Scale-tier-active-with-Move-#7-4-flow-shipped-6+-months-post-launch-verified + 50k+-opted-in-US-SMS-subscribers + DLR-monitoring-Suite-Wire (Postscript-2024-DLR-monitoring-Suite + Attentive-2024-DLR-monitoring-Wire + SMSBump-2024-DLR-monitoring + Klaviyo-2024-DLR-monitoring-baseline + Sailthru-2024-deliverability-reach-cohort + canonical-5-deliverability-cohort-queries) + Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-Wired + voice-profile-webhook-mapping-Wired + Triple-Whale-SMS-source-merge-cohort-overlay-Wired + build SMS-orchestration-creative-baseline (5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates)",
  "Pillar 2 — SMSBump-international-SMS-onboard + international-multi-locale-SMSBump-orchestration + SMSBump-post-purchase-flow-launch":
    "SMSBump-Basic-or-Pro-tier-onboard + Shopify-Markets-Basic-or-Pro-live-with-international-order-volume-baseline-active-locales-5+ + locale-specific-SMS-routing-baseline-Wired + locale-specific-currency-display-baseline + locale-specific-DLR-monitoring-baseline + 7-canonical-locales (US-EN / UK-EN / CA-EN+FR / EU-DE+FR+IT+ES / AU-EN / JP-JA / BR-PT + MX-ES) + per-locale-TCPA-compliance-baseline + 5+ locale-specific-SMS-keyword-libraries + SMSBump-post-purchase-flow-launch",
  "Pillar 3 — MMS-luxury-voice-SKU-SMS-launch + rich-media-attachments + video-previews + branded-unboxing-experience":
    "MMS-platform-onboard (Postscript-MMS-launch $0-with-Postscript-Scale-tier + Attentive-2024-MMS-luxury-voice-SKU-launch + Klaviyo-2024-MMS-channel-add-on $0-$100/mo + SMSBump-2024-MMS-launch) + 5+-MMS-luxury-voice-SKU-SMS-creative-assets-build per MMS-2024-canonical-5-specs (rich-media-attachments + video-previews + branded-unboxing-experience + luxury-voice-content-2-3×-CTR-vs-text-SMS-baseline) + MMS-deliverability-monitoring-Wire",
  "Pillar 4 — Two-way-conversations-creator-cohort-launch + RCS-business-messaging-Gen-Z-voice-Flash-Sale-launch + voice-profile-routing-inbox":
    "Inbox-by-Postscript-or-Attentive-Concierge-onboard + creator-response-routing-via-Inbox-by-Postscript + creator-engagement-LTV-iteration + creator-SMS-deliverability-stability-monitoring + creator-cohort-LTV-overlay-with-Move-#16-creator-economy-expansion + voice-profile-routing-inbox + Attentive-RCS-business-messaging-onboard + GSMA-RCS-2024-2-4×-SMS-engagement-rate-vs-SMS-text-baseline + 6 RCS-spec-card-types (Hero-card + Rich-media-card + Carousel-card + Read-receipt-card + Suggested-reply-card + Suggested-action-card)",
  "Pillar 5 — SMS-cohort-LTV-attrition-1%-rule-iteration + SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle-iteration + SMS-cost-stack-decision-recipe":
    "Postscript-DLR-monitoring-Wire + Attentive-DLR-monitoring-Wire + SMSBump-DLR-monitoring-Wire + Klaviyo-DLR-monitoring-Wire-baseline + 5-canonical-deliverability-cohort-queries (SMS-bounce-rate-cohort + SMS-opt-out-rate-cohort + SMS-spam-complaint-rate-cohort + SMS-deliverability-rate-cohort + SMS-cohort-LTV-vs-baseline-cohort) + SMS-cohort-attrition-1%-rule-iteration-cycle + 5-way-comparison-cycle (SMS-orchestration-cohort-LTV vs SMS-Postscript-only-cohort-LTV vs SMSBump-only-cohort-LTV vs Klaviyo-SMS-only-cohort-LTV vs Attentive-only-cohort-LTV) + SMS-cost-stack-decision-recipe",
};

export const LUXURY_DOWNGRADE_ENABLED = true;
export const B2B_DOWNGRADE_ENABLED = true;
export const PATH_C_ATTENTIVE_DOWNGRADE_ENABLED = true;
export const CAPACITY_GATE_HR_WK = 4;
export const MIN_SMS_LIST_SIZE = 50_000;
export const MIN_INTERNATIONAL_GMV_PCT = 5.0;

export const SMSBUMP_POSTSCRIPT_DEFAULTS: BrandSmsbumpPostscriptInputs = {
  usDtcGmv: 5_000_000,
  internationalGmvPct: 10.0,
  smsListSize: 100_000,
  hasPostscriptPrimary: true,
  hasSmsbumpAccount: true,
  hasKlaviyoSmsSegmentOverlay: true,
  hasAttentiveEnterpriseSecondary: false,
  hasDlrMonitoringWired: true,
  hasTripleWhaleSmsMerge: true,
  voiceProfile: "default",
  hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: 6,
  hasSmsOrchestrationCreativeBaseline: true,
};

function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  return "A";
}

function tierFloorText(path: PathName): string {
  if (path === "A") return `${PATH_A_FLOOR.toLocaleString("en-US")}`;
  if (path === "B") return `${PATH_B_FLOOR.toLocaleString("en-US")}`;
  return `${PATH_C_FLOOR.toLocaleString("en-US")}`;
}

function tierCeilingText(path: PathName): string {
  if (path === "A") return `${(PATH_B_FLOOR - 1).toLocaleString("en-US")}`;
  if (path === "B") return `${(PATH_C_FLOOR - 1).toLocaleString("en-US")}`;
  return "∞";
}

// ----- Core scoring rule -------------------------------------------------

export function recommendPath(inputs: BrandSmsbumpPostscriptInputs): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForLowGmv = false;
  let deferredForLowInternational = false;
  let deferredForLowSmsList = false;
  let deferredForNoPostscript = false;
  let deferredForNoSmsbump = false;
  let deferredForNoKlaviyoSms = false;
  let deferredForNoTripleWhale = false;
  let deferredForNoDlrMonitoring = false;
  let deferredForLowCapacity = false;

  if (inputs.usDtcGmv < PATH_A_FLOOR) {
    justificationParts.push(
      `us_dtc_gmv=$${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} below $${PATH_A_FLOOR.toLocaleString("en-US")} Path A floor; defer SMSBump + Postscript-channel-orchestration until GMV grows to $500k+`,
    );
    deferredForLowGmv = true;
  }

  if (inputs.internationalGmvPct < MIN_INTERNATIONAL_GMV_PCT) {
    justificationParts.push(
      `international_gmv_pct=${inputs.internationalGmvPct.toFixed(1)}% below ${MIN_INTERNATIONAL_GMV_PCT.toFixed(1)}% floor; defer SMSBump-international-orchestration until Shopify-Markets-active-locales-5+ + 5%+ international-GMV-share baseline`,
    );
    deferredForLowInternational = true;
  }

  if (inputs.smsListSize < MIN_SMS_LIST_SIZE) {
    justificationParts.push(
      `sms_list_size=${inputs.smsListSize.toLocaleString("en-US")} below ${MIN_SMS_LIST_SIZE.toLocaleString("en-US")} floor; defer SMSBump + Postscript-channel-orchestration until 50k+ opted-in US SMS subscribers (per Move #7 Postscript 4-flow-shipped + 6+ months post-launch verification)`,
    );
    deferredForLowSmsList = true;
  }

  if (!inputs.hasPostscriptPrimary) {
    justificationParts.push(
      "has_postscript_primary=False; canonical Postscript-primary-onboard prerequisite (Postscript-Starter-or-Growth-or-Scale-tier-active-with-Move-#7-4-flow-shipped-6+-months-post-launch-verified)",
    );
    deferredForNoPostscript = true;
  }

  if (!inputs.hasSmsbumpAccount) {
    justificationParts.push(
      "has_smsbump_account=False; canonical SMSBump-international-SMS-onboard prerequisite (SMSBump-2024-Shopify-Markets-integration baseline)",
    );
    deferredForNoSmsbump = true;
  }

  if (!inputs.hasKlaviyoSmsSegmentOverlay) {
    justificationParts.push(
      "has_klaviyo_sms_segment_overlay=False; canonical Klaviyo-SMS-segment-overlay-onboard prerequisite (Klaviyo-Email-and-SMS-or-Klaviyo-SMS-channel-add-on-Wired + voice-profile-webhook-mapping-Wired)",
    );
    deferredForNoKlaviyoSms = true;
  }

  if (!inputs.hasTripleWhaleSmsMerge) {
    justificationParts.push(
      "has_triple_whale_sms_merge=False; canonical Triple-Whale-SMS-source-merge-cohort-overlay-Wired prerequisite (Triple-Whale-SMS-source-merge + 5-canonical-deliverability-cohort-queries Wired)",
    );
    deferredForNoTripleWhale = true;
  }

  if (!inputs.hasDlrMonitoringWired) {
    justificationParts.push(
      "has_dlr_monitoring_wired=False; canonical DLR-monitoring-Suite-Wired prerequisite (Postscript-2024-DLR-monitoring-Suite + Attentive-2024-DLR-monitoring-Wire + SMSBump-2024-DLR-monitoring + Klaviyo-2024-DLR-monitoring-baseline)",
    );
    deferredForNoDlrMonitoring = true;
  }

  if (inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `has_dedicated_sms_orchestration_team_capacity_hours_per_week=${inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek} below ${CAPACITY_GATE_HR_WK} hr/wk floor; defer SMSBump + Postscript-channel-orchestration until dedicated-SMS-orchestration-team capacity ≥4 hr/wk`,
    );
    deferredForLowCapacity = true;
  }

  const anyDeferral =
    deferredForLowGmv ||
    deferredForLowInternational ||
    deferredForLowSmsList ||
    deferredForNoPostscript ||
    deferredForNoSmsbump ||
    deferredForNoKlaviyoSms ||
    deferredForNoTripleWhale ||
    deferredForNoDlrMonitoring ||
    deferredForLowCapacity;

  let path: PathName;
  if (anyDeferral) {
    path = "A";
  } else if (inputs.usDtcGmv < PATH_A_FLOOR) {
    path = "A";
  } else {
    path = tierForGmv(inputs.usDtcGmv);
  }

  // ---- Apply upgrade/downgrade gates. ----
  const downgrades: string[] = [];

  if (
    LUXURY_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "luxury" &&
    !inputs.hasSmsOrchestrationCreativeBaseline
  ) {
    let newPath: PathName = "A";
    if (path === "C") newPath = "B";
    else if (path === "B") newPath = "A";
    downgrades.push(
      `Luxury voice without SMS-orchestration-creative-baseline (MMS-luxury-voice-SKU-SMS-required); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  if (
    B2B_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "b2b" &&
    !inputs.hasKlaviyoSmsSegmentOverlay
  ) {
    let newPath: PathName = "A";
    if (path === "C") newPath = "B";
    else if (path === "B") newPath = "A";
    downgrades.push(
      `B2B voice without Klaviyo-SMS-segment-overlay (B2B-keyword-cluster-trust-disclosure-required); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  if (PATH_C_ATTENTIVE_DOWNGRADE_ENABLED && path === "C" && !inputs.hasAttentiveEnterpriseSecondary) {
    const newPath: PathName = "B";
    downgrades.push(
      `Path C without Attentive-Enterprise-secondary (RCS-business-messaging-Enterprise-required); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  let justification: string;
  if (justificationParts.length > 0) {
    justification = justificationParts.join(" | ");
  } else {
    justification = `All deferral gates clear; base tier for US DTC GMV $${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} → ${path}`;
  }
  if (downgrades.length > 0) {
    justification += ` | Downgrades applied: ${downgrades.join("; ")}`;
  } else if (
    !deferredForLowGmv &&
    !deferredForLowInternational &&
    !deferredForLowSmsList &&
    !deferredForNoPostscript &&
    !deferredForNoSmsbump &&
    !deferredForNoKlaviyoSms &&
    !deferredForNoTripleWhale &&
    !deferredForNoDlrMonitoring &&
    !deferredForLowCapacity
  ) {
    justification += ` | Path lands in tier ${path} ($${tierFloorText(path)} - $${tierCeilingText(path)} GMV); no downgrade applied.`;
  }

  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [pctLow, pctHigh] = PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT[path];
  const [listGrowthLow, listGrowthHigh] = PATH_SMS_LIST_GROWTH_RATE_VS_POSTSCRIPT_ONLY[path];
  const [delivLow, delivHigh] = PATH_SMS_DELIVERABILITY_VS_POSTSCRIPT_ONLY_BASELINE[path];
  const [ltvMultLow, ltvMultHigh] = PATH_SMS_COHORT_LTV_MULTIPLIER_VS_POSTSCRIPT_ONLY[path];
  const [buildLow, buildHigh] = PATH_SMS_ORCHESTRATION_BUILD_CYCLE_MONTHS[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const year1CostLow = costLow + 12.0 * recLow;
  const year1CostHigh = costHigh + 12.0 * recHigh;

  const internationalGmv = inputs.usDtcGmv * (inputs.internationalGmvPct / 100.0);
  const totalGmvBase = inputs.usDtcGmv + internationalGmv;
  const year1RevenueLow = totalGmvBase * (pctLow / 100.0);
  const year1RevenueHigh = totalGmvBase * (pctHigh / 100.0);

  // Year-1 ROI clamped to canonical research/15 PATH_ROI bands.
  let year1RoiLowComputed: number;
  let year1RoiHighComputed: number;
  if (year1CostLow <= 0) year1RoiLowComputed = Number.POSITIVE_INFINITY;
  else year1RoiLowComputed = year1RevenueLow / year1CostLow;
  if (year1CostHigh <= 0) year1RoiHighComputed = Number.POSITIVE_INFINITY;
  else year1RoiHighComputed = year1RevenueHigh / year1CostHigh;

  let year1RoiLowFinal = Math.max(year1RoiLowComputed, roiLow);
  let year1RoiHighFinal = Math.min(year1RoiHighComputed, roiHigh);
  if (year1RoiHighFinal < year1RoiLowFinal) year1RoiHighFinal = year1RoiLowFinal;

  return {
    path,
    platforms: [...PATH_PLATFORMS[path]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification,
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1CostLow,
    year1CostHigh,
    year1IncrementalSmsOrchestrationRevenueSharePctLow: pctLow,
    year1IncrementalSmsOrchestrationRevenueSharePctHigh: pctHigh,
    year1IncrementalSmsOrchestrationRevenueLow: year1RevenueLow,
    year1IncrementalSmsOrchestrationRevenueHigh: year1RevenueHigh,
    smsListGrowthRateVsPostscriptOnlyLow: listGrowthLow,
    smsListGrowthRateVsPostscriptOnlyHigh: listGrowthHigh,
    smsDeliverabilityVsPostscriptOnlyBaselineLow: delivLow,
    smsDeliverabilityVsPostscriptOnlyBaselineHigh: delivHigh,
    smsCohortLtvMultiplierVsPostscriptOnlyLow: ltvMultLow,
    smsCohortLtvMultiplierVsPostscriptOnlyHigh: ltvMultHigh,
    smsOrchestrationBuildCycleMonthsLow: buildLow,
    smsOrchestrationBuildCycleMonthsHigh: buildHigh,
    year1RoiLow: year1RoiLowFinal,
    year1RoiHigh: year1RoiHighFinal,
    smsbumpPostscriptPillarMatrix: { ...SMSBUMP_POSTSCRIPT_PILLAR_MATRIX },
    buildSequence: [...BUILD_SEQUENCE_TEMPLATES[path]],
  };
}

// ----- Build-sequence recipe ---------------------------------------------

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1: Onboard Postscript-Starter-or-Growth-tier + Move #7 Postscript-4-flow-shipped-6+-months-post-launch-verified baseline (per Postscript 2024 + playbook/06 §Gate A-D)",
    "Step 2: Wire Postscript-DLR-monitoring-Suite (Postscript-2024-DLR-monitoring-Suite-included-with-Postscript-Growth-or-Scale $0 with Growth + $0-$200/mo with Scale tier; canonical 5-deliverability-cohort-queries)",
    "Step 3: Launch first DLR-monitored-deliverability-segment + SMS-orchestration-baseline (per Postscript 2024 + Sailthru 2024-deliverability-reach-cohort benchmarks)",
    "Step 4: Build SMS-orchestration-creative-baseline (5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates + DLR-monitored-deliverability-segment + MMS-luxury-voice-SKU-SMS-baseline + two-way-conversation-creator-cohort-templates + RCS-Gen-Z-voice-Flash-Sale-SMS-baseline)",
    "Step 5: Iterate 30-day cadence on DLR-bounce-rate-cohort + SMS-deliverability-cohort (per Triple-Whale-SMS-merge-2024 + Postscript-2024-DLR-monitoring benchmarks)",
    "Step 6: Quarterly SMS-cost-stack-decision-recipe review (per research/15 Pillar 5 + playbook/22 §Phase 4)",
  ],
  B: [
    "Step 1: Onboard SMSBump-international-SMS via Shopify-Markets-integration ($100-$400/mo for Shopify Markets Basic / $500-$2k/mo for Shopify Markets Pro) + Activate Postscript-DLR-monitoring-Suite-Wire + Activate Klaviyo-SMS-segment-overlay-onboard + Activate Triple-Whale-SMS-source-merge-cohort-overlay-Wire",
    "Step 2: Build SMS-cohort-LTV-iteration-cycle-baseline + SMS-orchestration-creative-baseline (5-voice × 5-segment = 25 voice-segment SMS-orchestration-templates)",
    "Step 3: Launch MMS-luxury-voice-SKU-SMS + two-way-conversation-creator-cohort-launch + RCS-Gen-Z-voice-Flash-Sale-SMS (per MMS-2024 + Attentive-2024-MMS-benchmarks + Postscript-MMS-launch-2024 + GSMA-RCS-2024 + Two-way-conversations-2024 + RCS-business-messaging-2024)",
    "Step 4: Launch international-multi-locale-SMSBump-orchestration (Shopify-Markets-multi-locale-SMS-routing + 5+ locale-specific-SMS-keyword-libraries + locale-specific-TCPA-compliance-baseline + locale-specific-DLR-monitoring) + SMSBump-post-purchase-flow-launch",
    "Step 5: Iterate SMS-cohort-LTV + SMS-deliverability-cohort + SMS-cohort-attrition-1%-rule-iteration-cycle + 5-way-comparison-cycle",
    "Step 6: Steady-state SMS-cost-stack-decision-recipe review + SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-quarterly + SMS-deliverability-reach-cohort-overlay-instrumentation-quarterly + 5-way-comparison-cycle-iteration-quarterly (per research/15 Pillar 5 + playbook/22 §Phase 4)",
  ],
  C: [
    "Step 1: Onboard Attentive-Enterprise-primary ($5k-$25k/mo) + SMSBump-Enterprise international-multi-locale-orchestration + Postscript-Enterprise-secondary + RCS-business-messaging-Enterprise + MMS-Enterprise + Two-way-conversations-Enterprise + AI-orchestration-engine-license + dedicated-SMS-orchestration-team $4k-$6k/mo",
    "Step 2: Build SMS-orchestration-portfolio-50+-audience-segments + SMS-orchestration-creative-baseline (5-voice × 5-segment × multi-locale × multi-tier = 100+ voice-segment SMS-orchestration-templates)",
    "Step 3: Launch Attentive-Enterprise-cohort-iteration + RCS-business-messaging-global-rollout + AI-orchestration-engine + Two-way-conversations-Enterprise + MMS-Enterprise + dedicated-SMS-orchestration-team-managed-Enterprise-cohort-overlay",
    "Step 4: Launch international-multi-locale-SMSBump-orchestration-Enterprise (Shopify-Markets-multi-locale-SMS-routing + 7+ locale-specific-SMS-keyword-libraries + locale-specific-TCPA-compliance-baseline + locale-specific-DLR-monitoring) + SMSBump-post-purchase-flow-Enterprise-launch",
    "Step 5: Iterate SMS-cohort-LTV + SMS-deliverability-cohort + SMS-cohort-attrition-1%-rule-iteration-cycle-Enterprise + 5-way-comparison-cycle-Enterprise",
    "Step 6: Steady-state SMS-cost-stack-decision-recipe-Enterprise review + SMS-orchestration-cohort-LTV-attrition-1%-rule-iteration-cycle-Enterprise-quarterly + SMS-deliverability-reach-cohort-overlay-instrumentation-Enterprise-quarterly + 5-way-comparison-cycle-iteration-Enterprise-quarterly (per research/15 Pillar 5 + playbook/22 §Phase 4 + canonical 10-15:1 Year-3 steady-state)",
  ],
};

export function buildSequenceForPath(path: PathName): string[] {
  return [...BUILD_SEQUENCE_TEMPLATES[path]];
}

// ----- Per-path revenue projection ----------------------------------------

export function projectPerPathRevenue(
  inputs: BrandSmsbumpPostscriptInputs,
  rec: PathRecommendation,
): PerPathRevenue {
  const internationalGmv = inputs.usDtcGmv * (inputs.internationalGmvPct / 100.0);
  const totalGmvBase = inputs.usDtcGmv + internationalGmv;

  const [pctLow, pctHigh] = PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT[rec.path];
  const pctMid = (pctLow + pctHigh) / 2.0;
  const revenueMid = totalGmvBase * (pctMid / 100.0);

  const year1CostLowFull = rec.year1CostLow;
  const year1CostHighFull = rec.year1CostHigh;
  const year1CostMidFull = (year1CostLowFull + year1CostHighFull) / 2.0;

  let roiMidFull: number;
  if (year1CostMidFull <= 0) roiMidFull = Number.POSITIVE_INFINITY;
  else roiMidFull = revenueMid / year1CostMidFull;

  const [roiLowBand, roiHighBand] = PATH_ROI[rec.path];
  const roiMidBand = (roiLowBand + roiHighBand) / 2.0;
  const roiMidFinal = Math.min(Math.max(roiMidFull, roiLowBand), roiHighBand);

  return {
    totalGmvBase,
    internationalGmv,
    year1RevenueMid: revenueMid,
    year1CostMidFull,
    year1RoiMidFullCost: roiMidFull,
    year1RoiMidBand: roiMidBand,
    year1RoiMidFinal: roiMidFinal,
    smsListGrowthRateMid: (rec.smsListGrowthRateVsPostscriptOnlyLow + rec.smsListGrowthRateVsPostscriptOnlyHigh) / 2.0,
    smsDeliverabilityImprovementMid: (rec.smsDeliverabilityVsPostscriptOnlyBaselineLow + rec.smsDeliverabilityVsPostscriptOnlyBaselineHigh) / 2.0,
    smsCohortLtvMultiplierMid: (rec.smsCohortLtvMultiplierVsPostscriptOnlyLow + rec.smsCohortLtvMultiplierVsPostscriptOnlyHigh) / 2.0,
  };
}

// ----- Validation -------------------------------------------------------

export function validateSmsbumpPostscriptInputs(inputs: BrandSmsbumpPostscriptInputs): string | null {
  if (inputs.usDtcGmv < 0) return `us_dtc_gmv must be >= 0, got ${inputs.usDtcGmv}`;
  if (inputs.internationalGmvPct < 0 || inputs.internationalGmvPct > 100)
    return `international_gmv_pct must be in [0, 100], got ${inputs.internationalGmvPct}`;
  if (inputs.smsListSize < 0) return `sms_list_size must be >= 0, got ${inputs.smsListSize}`;
  if (inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek < 0)
    return `has_dedicated_sms_orchestration_team_capacity_hours_per_week must be >= 0, got ${inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek}`;
  const validVoices = ["default", "luxury", "sustainable", "gen_z", "b2b"];
  if (!validVoices.includes(inputs.voiceProfile))
    return `voice_profile must be one of ${validVoices.join(", ")}, got '${inputs.voiceProfile}'`;
  return null;
}

// ----- Display helpers --------------------------------------------------

export function pathBadgeClasses(path: PathName): string {
  const base = "rounded px-2 py-0.5 text-xs font-mono font-semibold";
  if (path === "A")
    return `${base} bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40`;
  if (path === "B")
    return `${base} bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40`;
  return `${base} bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/40`;
}

export function pathLongLabel(path: PathName): string {
  if (path === "A")
    return "Path A — Postscript-Growth-tier + DLR-monitoring-Suite (canonical $200-$500/mo for $500k-$1M US-GMV brands)";
  if (path === "B")
    return "Path B — SMSBump-Pro-tier + Postscript-Scale-tier + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge DEFAULT ($1k-$5k/mo for $1M-$25M DTC+international brands)";
  return "Path C — Attentive-Enterprise-primary + SMSBump-Enterprise + RCS-business-messaging + AI-orchestration-engine ($3k-$15k/mo for $25M+ DTC+international brands)";
}

// ----- Markdown rendering -----------------------------------------------

export function renderSmsbumpPostscriptMarkdown(
  inputs: BrandSmsbumpPostscriptInputs,
  rec: PathRecommendation,
  projection?: PerPathRevenue,
): string {
  const lines: string[] = [];
  lines.push("SMSBump + Postscript Channel Orchestration Path A/B/C recommendation");
  lines.push("=".repeat(64));
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                                          : $${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
  lines.push(`  International GMV share (%)                         : ${inputs.internationalGmvPct.toFixed(1)}%`);
  lines.push(`  SMS list size                                       : ${inputs.smsListSize.toLocaleString("en-US")}`);
  lines.push(`  Has Postscript-primary                              : ${inputs.hasPostscriptPrimary}`);
  lines.push(`  Has SMSBump-account                                 : ${inputs.hasSmsbumpAccount}`);
  lines.push(`  Has Klaviyo-SMS-segment-overlay                     : ${inputs.hasKlaviyoSmsSegmentOverlay}`);
  lines.push(`  Has Attentive-Enterprise-secondary                  : ${inputs.hasAttentiveEnterpriseSecondary}`);
  lines.push(`  Has DLR-monitoring-Wired                            : ${inputs.hasDlrMonitoringWired}`);
  lines.push(`  Has Triple-Whale-SMS-merge                          : ${inputs.hasTripleWhaleSmsMerge}`);
  lines.push(`  Voice profile                                       : ${inputs.voiceProfile}`);
  lines.push(`  Has dedicated-SMS-orchestration-team (hr/wk)        : ${inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek}`);
  lines.push(`  Has SMS-orchestration-creative-baseline             : ${inputs.hasSmsOrchestrationCreativeBaseline}`);
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(`  Platforms                                          : ${rec.platforms.length} platform(s) in scope`);
  for (const p of rec.platforms) {
    lines.push(`    - ${p}`);
  }
  lines.push(`  Default platform pick                               : ${rec.defaultPlatformPick}`);
  lines.push(`  Justification                                       : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)                           : $${rec.costOneTimeLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${rec.costOneTimeHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  Recurring monthly (low-high)                        : $${rec.costRecurringLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${rec.costRecurringHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  Year-1 cost (low-high)                              : $${rec.year1CostLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${rec.year1CostHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  Year-1 incr SMS-orch-revenue share % (low-high)     : ${rec.year1IncrementalSmsOrchestrationRevenueSharePctLow.toFixed(1)}% - ${rec.year1IncrementalSmsOrchestrationRevenueSharePctHigh.toFixed(1)}%`,
  );
  lines.push(
    `  Year-1 incr SMS-orch-revenue $ (low-high)           : $${rec.year1IncrementalSmsOrchestrationRevenueLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${rec.year1IncrementalSmsOrchestrationRevenueHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  SMS-list-growth-rate vs Postscript-only (low-high)  : ${rec.smsListGrowthRateVsPostscriptOnlyLow.toFixed(1)}% - ${rec.smsListGrowthRateVsPostscriptOnlyHigh.toFixed(1)}%`,
  );
  lines.push(
    `  SMS-deliverability vs Postscript-only (low-high)    : ${rec.smsDeliverabilityVsPostscriptOnlyBaselineLow.toFixed(1)}% - ${rec.smsDeliverabilityVsPostscriptOnlyBaselineHigh.toFixed(1)}%`,
  );
  lines.push(
    `  SMS-cohort-LTV-multiplier vs Postscript-only        : ${rec.smsCohortLtvMultiplierVsPostscriptOnlyLow.toFixed(1)}x - ${rec.smsCohortLtvMultiplierVsPostscriptOnlyHigh.toFixed(1)}x`,
  );
  lines.push(
    `  SMS-orchestration build-cycle months (low-high)     : ${rec.smsOrchestrationBuildCycleMonthsLow} - ${rec.smsOrchestrationBuildCycleMonthsHigh}`,
  );
  lines.push(`  Year-1 ROI                                          : ${rec.year1RoiLow.toFixed(1)}:1 - ${rec.year1RoiHigh.toFixed(1)}:1`);
  lines.push("");
  lines.push("5-pillar SMSBump + Postscript-channel-orchestration framework (per voice):");
  for (const [pillar, structureDesc] of Object.entries(rec.smsbumpPostscriptPillarMatrix)) {
    lines.push(`  ${pillar}`);
    lines.push(`    ${structureDesc}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  if (projection) {
    lines.push("Per-path revenue projection:");
    lines.push(`  Total GMV base (US DTC + international)             : $${projection.totalGmvBase.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    lines.push(`  International GMV                                   : $${projection.internationalGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    lines.push(`  Year-1 revenue (mid)                                : $${projection.year1RevenueMid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    lines.push(`  Year-1 cost mid (full stack)                        : $${projection.year1CostMidFull.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    lines.push(`  Year-1 ROI mid (full cost)                          : ${projection.year1RoiMidFinal.toFixed(1)}:1 (band mid: ${projection.year1RoiMidBand.toFixed(1)}:1)`);
    lines.push(`  SMS-list-growth-rate mid                            : ${projection.smsListGrowthRateMid.toFixed(1)}%`);
    lines.push(`  SMS-deliverability mid                              : ${projection.smsDeliverabilityImprovementMid.toFixed(1)}pp`);
    lines.push(`  SMS-cohort-LTV-multiplier mid                       : ${projection.smsCohortLtvMultiplierMid.toFixed(2)}x`);
  }
  lines.push("");
  return lines.join("\n");
}
