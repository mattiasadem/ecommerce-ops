// affiliate.ts — TypeScript port of scripts/affiliate_unit_economics.py
// Move #15 affiliate-program Path A / B / C scorer.
//
// Mirrors research/09 §GMV-tier paths + playbook 16 §Phase 1+2+3+4 + asset 17
// §5-voice commission-tier matrix + the canonical 6-step
// cookie-deprecation mitigation recipe.

export type PathName = "A" | "B" | "C";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type IQZone = "low" | "mid" | "high";

export interface BrandAffiliateInputs {
  usGmv: number;
  aov: number;
  expectedAffiliateCount: number;
  commissionTier: number;
  voiceProfile: VoiceProfile;
  hasTripleWhale: boolean;
  hasKlaviyoPostPurchase: boolean;
  hasSmileLoyalty: boolean;
  hasLevanta: boolean;
  hasImpact: boolean;
  iqZone: IQZone;
  operatorCapacityHoursPerWeek: number;
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
  year1AttributedRevenueSharePctLow: number;
  year1AttributedRevenueSharePctHigh: number;
  year1AttributedRevenueLow: number;
  year1AttributedRevenueHigh: number;
  ltvMultiplierLow: number;
  ltvMultiplierHigh: number;
  year1AffiliateCountLow: number;
  year1AffiliateCountHigh: number;
  cookieDeprecationRecoveryPctLow: number;
  cookieDeprecationRecoveryPctHigh: number;
  sustainableMissionAlignScoreLow: number;
  sustainableMissionAlignScoreHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  commissionTierMatrix: Record<string, string>;
  buildSequence: string[];
}

export interface PerPathRevenue {
  usGmv: number;
  expectedAffiliateCount: number;
  year1AttributedRevenuePctMid: number;
  year1AttributedRevenueLow: number;
  year1AttributedRevenueMid: number;
  year1AttributedRevenueHigh: number;
  ltvMultiplierMid: number;
  affiliateCountMid: number;
  perAffiliateRevenueMid: number;
  cookieDeprecationRecoveryPctMid: number;
  sustainableMissionAlignScoreMid: number;
  year1PlatformCostLow: number;
  year1PlatformCostMid: number;
  year1PlatformCostHigh: number;
  year1CommissionCostMid: number;
  year1OpsCostMid: number;
  year1RecruitmentCostMid: number;
  year1TotalCostMid: number;
  year1RoiLow: number;
  year1RoiMid: number;
  year1RoiHigh: number;
}

// ----- Canonical constants (from research/09 + playbook 16 + asset 17) -----

export const PATH_A_FLOOR = 100_000;
export const PATH_B_FLOOR = 500_000;
export const PATH_C_FLOOR = 5_000_000;

export const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0.0, 500.0, 0.0, 25.0],
  B: [500.0, 2500.0, 239.0, 489.0],
  C: [5000.0, 15000.0, 1500.0, 4000.0],
};

export const PATH_ATTRIBUTED_REVENUE_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [8.0, 20.0],
  B: [20.0, 40.0],
  C: [30.0, 50.0],
};

export const PATH_LTV_MULTIPLIER: Record<PathName, [number, number]> = {
  A: [1.5, 2.0],
  B: [2.0, 3.0],
  C: [2.5, 3.5],
};

export const COOKIE_DEPRECATION_RECOVERY_PCT: Record<PathName, [number, number]> = {
  A: [5.0, 15.0],
  B: [25.0, 35.0],
  C: [40.0, 60.0],
};

export const SUSTAINABLE_MISSION_ALIGN_SCORE: Record<PathName, [number, number]> = {
  A: [40, 65],
  B: [60, 85],
  C: [70, 95],
};

export const PATH_ROI: Record<PathName, [number, number]> = {
  A: [8.0, 12.5],
  B: [3.7, 8.0],
  C: [3.5, 5.0],
};

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: ["GoAffPro free (Shopify app; $0/mo; canonical Path A starter)"],
  B: [
    "Refersion Growth ($239/mo) DEFAULT",
    "Refersion Scale ($489/mo)",
    "Levanta Growth ($499/mo) cross-channel",
  ],
  C: [
    "Impact Partnership Cloud Enterprise ($1k+/mo)",
    "Levanta cross-channel ($499/mo)",
    "Aspire ($500+/mo) influencer-marketing",
    "PartnerStack B2B-affiliate (Path C B2B-voice)",
  ],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "GoAffPro free (default Path A; Shopify-native; $0/mo for <$500k GMV brands)",
  B: "Refersion Growth (default Path B; $239/mo for $500k-$5M GMV brands — canonical DEFAULT for $2M US DTC brand)",
  C: "Impact Partnership Cloud Enterprise OR Levanta cross-channel (default Path C; $1k-$4k/mo for $5M+ GMV brands with Levanta server-side fingerprinting)",
};

export const COMMISSION_TIER_MATRIX: Record<string, string> = {
  default: "15% / 20% / 25% (Default voice — canonical balanced program per Awin 2024)",
  luxury: "10% / 12% / 15% (Luxury voice — lower commission + longer cookie window 60d)",
  sustainable:
    "20% / 25% / 30% (Sustainable voice — higher commission to attract mission-aligned creators per assets/12-impact-data-pipeline.md)",
  gen_z: "25% / 30% / 35% (Gen-Z voice — highest commission + shortest cookie window 7d for impulse buys)",
  b2b: "8-12% / 12-15% / 15-20% (B2B voice — lower base + longer cookie 90d + NET-60 payout per B2B sales-cycle)",
};

export const SUSTAINABLE_DOWNGRADE_ENABLED = true;
export const GENZ_DOWNGRADE_ENABLED = true;
export const CAPACITY_GATE_HR_WK = 2;
export const MIN_EXPECTED_AFFILIATE_COUNT = 10;

export const AFFILIATE_DEFAULTS: BrandAffiliateInputs = {
  usGmv: 2_000_000,
  aov: 50,
  expectedAffiliateCount: 25,
  commissionTier: 20,
  voiceProfile: "sustainable",
  hasTripleWhale: true,
  hasKlaviyoPostPurchase: true,
  hasSmileLoyalty: true,
  hasLevanta: false,
  hasImpact: false,
  iqZone: "mid",
  operatorCapacityHoursPerWeek: 6,
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

export function recommendPath(inputs: BrandAffiliateInputs): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForCapacity = false;
  let deferredForAffiliateCount = false;
  let deferredForTripleWhale = false;
  let deferredForKlaviyo = false;
  let deferredForLevanta = false;

  // Capacity floor: defer if operator has insufficient time.
  if (inputs.operatorCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Operator capacity ${inputs.operatorCapacityHoursPerWeek} hr/wk < ${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 16 §Prerequisite #8 + asset 17 §5-voice commission-tier matrix); affiliate program deferred until operator capacity is available.`,
    );
    deferredForCapacity = true;
  }

  // Expected-affiliate-count floor: defer if <10 (canonical 10+ active-affiliate baseline).
  if (inputs.expectedAffiliateCount < MIN_EXPECTED_AFFILIATE_COUNT) {
    justificationParts.push(
      `Expected affiliate count ${inputs.expectedAffiliateCount} < ${MIN_EXPECTED_AFFILIATE_COUNT} floor (Awin 2024 + research/09 §Prerequisites: 10+ active affiliates is the canonical Year-1 baseline for any affiliate program to generate attributable revenue); affiliate program deferred until seed-first-100-affiliates loop (playbook 16 §Phase 2 Step 2.5) is executed.`,
    );
    deferredForAffiliateCount = true;
  }

  // Triple Whale cohort-LTV deferral (canonical Pillar 3 + Pillar 4 prerequisite).
  if (!inputs.hasTripleWhale) {
    justificationParts.push(
      "has_triple_whale=False (research/09 Pillar 3 Step 6 + Pillar 4 §b: Triple Whale affiliate-cohort-overlay is the canonical cookie-deprecation step 6 + the canonical cohort-LTV-measurement substrate; without it, neither 4-step cohort-LTV SQL nor Triple Whale ?tw_camp=affiliate_<id> UTM attribution is wired); affiliate program deferred until Triple Whale is installed + cohort LTV is filtered to affiliate_id.",
    );
    deferredForTripleWhale = true;
  }

  // Klaviyo post-purchase-email-match deferral (canonical Pillar 3 step 3 cookie-deprecation).
  if (!inputs.hasKlaviyoPostPurchase) {
    justificationParts.push(
      "has_klaviyo_post_purchase=False (research/09 Pillar 3 Step 3: Klaviyo post-purchase-email-match is the canonical iOS 14.5+ cookie-deprecation step 3; matches affiliate-driven customers via Klaviyo 'Marketplace Purchaser (last 30 days)' segment + post-purchase email UTM triple-tag); affiliate program deferred until Klaviyo post-purchase flow + UTM triple-tag are wired.",
    );
    deferredForKlaviyo = true;
  }

  // Base tier assignment.
  let path: PathName;
  if (inputs.usGmv < PATH_A_FLOOR) {
    path = "A";
    if (
      !deferredForCapacity &&
      !deferredForAffiliateCount &&
      !deferredForTripleWhale &&
      !deferredForKlaviyo &&
      !deferredForLevanta
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} is below the $${PATH_A_FLOOR.toLocaleString("en-US")} affiliate-program entry floor; affiliate launch is deferred until US DTC GMV exceeds $${PATH_A_FLOOR.toLocaleString("en-US")} (research/09 §Prerequisites). Path A is still surfaced as the recommendation for tracking (audit only).`,
      );
    }
  } else {
    path = tierForGmv(inputs.usGmv);
    if (
      !deferredForCapacity &&
      !deferredForAffiliateCount &&
      !deferredForTripleWhale &&
      !deferredForKlaviyo &&
      !deferredForLevanta
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} lands in the Path ${path} tier ($${tierFloorText(path)} - $${tierCeilingText(path)} GMV).`,
      );
    }
  }

  // Levanta deferral only fires if path was bumped to C and Levanta is missing.
  if (path === "C" && !inputs.hasLevanta) {
    justificationParts.push(
      "Path C requires Levanta server-side fingerprinting (research/09 Pillar 3 Step 5: Levanta is the canonical Path C cookie-deprecation step 5; without it, Path C reverts to Path B with 40-60% recovery vs 25-35%); downgrade to Path B until Levanta is installed (Levanta Growth $499/mo).",
    );
    deferredForLevanta = true;
    path = "B";
  }

  // Apply upgrade/downgrade gates.
  const downgrades: string[] = [];
  if (
    SUSTAINABLE_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "sustainable" &&
    !inputs.hasSmileLoyalty
  ) {
    downgrades.push(
      "voice_profile=sustainable WITHOUT has_smile_loyalty=True (research/09 Pillar 5 + assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier: Smile.io 2x points for affiliate-driven customers is the canonical verification that the brand is committed to sustainability economics; without it, Tier-3 30% Sustainable commission is unverified and the path is downgraded by one tier)",
    );
  }
  if (GENZ_DOWNGRADE_ENABLED && inputs.voiceProfile === "gen_z" && inputs.iqZone === "high") {
    downgrades.push(
      "voice_profile=gen_z WITH iq_zone=high (research/09 Pillar 1: Gen-Z 25-30-35% commission + 7-day cookie window is calibrated for impulse-buy on mid/low-tier SKUs; high-IQ-zone brands attract premium-buyers where the 7-day cookie window misses the typical 14-21 day Gen-Z high-IQ purchase cycle); downgrade one tier",
    );
  }

  for (let i = 0; i < downgrades.length; i++) {
    const currentRank = PATH_RANK[path];
    path = RANK_PATH[Math.max(currentRank - 1, PATH_RANK["A"])];
  }

  if (downgrades.length > 0) {
    justificationParts.push(
      `Applied ${downgrades.length} downgrade(s): DOWNGRADES: ${downgrades.join("; ")} Final path = ${path}.`,
    );
  } else if (
    !deferredForCapacity &&
    !deferredForAffiliateCount &&
    !deferredForTripleWhale &&
    !deferredForKlaviyo &&
    !deferredForLevanta
  ) {
    justificationParts.push("All gates pass; no downgrade applied.");
  }

  // Cost stack + attributed revenue + LTV + cookie recovery + mission align + ROI from the canonical path tables.
  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [shareLow, shareHigh] = PATH_ATTRIBUTED_REVENUE_SHARE_PCT[path];
  const [ltvLow, ltvHigh] = PATH_LTV_MULTIPLIER[path];
  const [cookLow, cookHigh] = COOKIE_DEPRECATION_RECOVERY_PCT[path];
  const [susLow, susHigh] = SUSTAINABLE_MISSION_ALIGN_SCORE[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const attributedRevenueLow = inputs.usGmv * (shareLow / 100.0);
  const attributedRevenueHigh = inputs.usGmv * (shareHigh / 100.0);

  return {
    path,
    platforms: PATH_PLATFORMS[path],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification: justificationParts.join(" "),
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1CostLow: costLow + 12 * recLow,
    year1CostHigh: costHigh + 12 * recHigh,
    year1AttributedRevenueSharePctLow: shareLow,
    year1AttributedRevenueSharePctHigh: shareHigh,
    year1AttributedRevenueLow: attributedRevenueLow,
    year1AttributedRevenueHigh: attributedRevenueHigh,
    ltvMultiplierLow: ltvLow,
    ltvMultiplierHigh: ltvHigh,
    year1AffiliateCountLow: Math.floor(inputs.expectedAffiliateCount * 0.7),
    year1AffiliateCountHigh: Math.floor(inputs.expectedAffiliateCount * 1.2),
    cookieDeprecationRecoveryPctLow: cookLow,
    cookieDeprecationRecoveryPctHigh: cookHigh,
    sustainableMissionAlignScoreLow: susLow,
    sustainableMissionAlignScoreHigh: susHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    commissionTierMatrix: { ...COMMISSION_TIER_MATRIX },
    buildSequence: buildSequenceForPath(path),
  };
}

// ----- Build-sequence recipe --------------------------------------------

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1 (2 hr) — Pick path + GoAffPro setup: Path A = GoAffPro free (Shopify app, $0/mo). Verify ≥$100k US DTC GMV + ≥10 expected affiliates + Triple Whale + Klaviyo post-purchase email-match wired per research/09 §Prereq #1-#8.",
    "Step 2 (2 hr) — Phase 1 platform + commission tiers: configure Default 15/20/25% commission tiers + 30-day cookie window + NET-30 payout schedule + 3-clause affiliate agreement (commission + payment-terms + termination) + FTC disclosure language (#ad/#sponsored/#partner at start of every affiliate-driven post) per playbook 16 §Phase 1 Step 1.3.",
    "Step 3 (4 hr) — Phase 2 recruitment + onboarding + landing-page live: seed-first-100-affiliates loop (existing-customer-list scrape via Klaviyo 'Engaged customers with social handles' segment + micro-influencer outreach via Aspire + Collabstr + Instagram hashtag scrape + public-listing on Awin + Impact + Levanta marketplaces) per playbook 16 §Phase 2 Step 2.5 + paste-ready affiliate-application landing-page skeleton from asset 17.",
    "Step 4 (2 hr) — Phase 3 cookie-deprecation mitigation (minimal — Path A is the canonical 'manual + UTM' tier): install Shopify CAPI server-side + UTM fallback ?tw_camp=affiliate_<id> + post-purchase email triple-tag in Klaviyo per research/09 Pillar 3 Steps 1-4 + Triple Whale cohort-overlay per Step 6 (no Levanta server-side fingerprinting at Path A; manual UTM attribution only).",
    "Step 5 (2 hr) — Phase 4 cohort-LTV measurement (manual SQL): Triple Whale → Reports → Cohort LTV → filter to affiliate_id → compare 30d/60d/90d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 1.5-2.0× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 + the canonical 4-step cohort-LTV SQL.",
    "Step 6 (2 hr/wk ongoing) — Affiliate-application review + FTC-compliance audit + 4-trigger tier-promotion: review affiliate applications weekly + verify FTC disclosure language on every post + apply the 4-trigger tier-promotion SOP [volume $5k+/90d → Tier-2 / cohort-LTV $300+ → Tier-2 / content-quality 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible / tenure 180d + Triggers 1+2 → Tier-3] per playbook 16 §Phase 4 Step 4.4-4.6 + quarterly compliance audit every 90 days per research/09 Pillar 5.",
  ],
  B: [
    "Step 1 (5 hr) — Pick path + Refersion Growth setup: Path B = Refersion Growth ($239/mo) DEFAULT OR Refersion Scale ($489/mo) for $500k+ brands OR Levanta Growth ($499/mo) cross-channel for creator-led brands. Verify ≥$500k US DTC GMV + ≥20 expected affiliates + Move #1 + #4 + #6 + #8 shipped per research/09 §Prereq #1.",
    "Step 2 (10 hr) — Phase 1 platform + commission tiers + per-voice cookie windows + per-voice payout schedules: configure 5-voice commission-tier matrix [Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%] + per-voice cookie windows [Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d] + per-voice payout schedules [Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60] + 3-clause affiliate agreement + FTC disclosure language per playbook 16 §Phase 1 Step 1.3 + asset 17 §per-voice FTC-disclosure templates.",
    "Step 3 (8 hr) — Phase 2 recruitment + onboarding + 5-flow × 5-voice email + SMS templates: seed-first-100-affiliates loop + 4-email onboarding-sequence template (Day 0 welcome + Day 7 first-content-prompt + Day 30 first-payout-celebration + Day 60 tier-promotion-educational) per asset 17 §Flow 1-5 + Klaviyo conditional-content syntax with `voice_profile` customer-property webhook mapping + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA per playbook 16 §Phase 2 Step 2.1-2.4.",
    "Step 4 (8 hr) — Phase 3 cookie-deprecation mitigation (full — Path B is the canonical 'Triple Whale + Klaviyo' tier): install Shopify CAPI server-side + UTM fallback + post-purchase email match in Klaviyo + Shopify Pixel + Triple Whale affiliate-cohort-overlay (NO Levanta server-side fingerprinting at Path B; manual UTM + Triple Whale attribution only) per research/09 Pillar 3 Steps 1-6 + iOS 14.5+ cookie-deprecation mitigation recovering 25-35% of would-be-lost attribution.",
    "Step 5 (4 hr) — Phase 4 cohort-LTV measurement (4-step SQL): Triple Whale → Reports → Cohort LTV → filter to affiliate_id + per-voice profile → compare 30d/60d/90d/180d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 2.0-3.0× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 + the canonical 4-step cohort-LTV SQL + Sustainable-mission-alignment-verifier for Sustainable voice.",
    "Step 6 (4 hr/wk ongoing) — Churn-alert + 4-trigger tier-promotion + quarterly FTC-compliance audit + Smile.io 2x points: Triple Whale → Alerts → affiliate_churn_rate > 8%/mo → Slack alert + apply the 4-trigger tier-promotion SOP per playbook 16 §Phase 4 Step 4.4 + Smile.io 2× points rule for affiliate-driven customers with >$300 90-day LTV per playbook 16 §Phase 4 Step 4.5 + quarterly compliance audit every 90 days per research/09 Pillar 5.",
  ],
  C: [
    "Step 1 (10 hr) — Pick path + multi-platform architecture: Path C = Impact Partnership Cloud Enterprise ($1k+/mo) + Levanta cross-channel ($499/mo) + Aspire ($500+/mo) influencer-marketing + PartnerStack (B2B-voice only). Verify ≥$5M US DTC GMV + Path B steady-state + Levanta installed + dedicated affiliate-team per research/09 §Prereq #1.",
    "Step 2 (20 hr) — Phase 1 multi-platform + commission tiers + per-voice cookie windows + per-voice payout schedules (Path C extended): configure Impact + Levanta + Aspire + PartnerStack with full 5-voice commission-tier matrix + per-voice cookie windows + per-voice payout schedules + 3-clause affiliate agreement + FTC disclosure language + 5-voice FTC-disclosure templates per playbook 16 §Phase 1 Step 1.3-1.5 + asset 17 §per-voice FTC-disclosure templates.",
    "Step 3 (15 hr) — Phase 2 enterprise recruitment + onboarding + Awin + Impact + Levanta marketplace listing + affiliate-network-manager: seed-first-1000-affiliates loop (Path B loop extended to 10×) + multi-platform 4-email onboarding-sequence template + Klaviyo conditional-content syntax + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA + Aspire creator-marketing + Impact cross-network syndication + PartnerStack B2B network + public-listing on Awin + Impact + Levanta + Refersion marketplaces + per-affiliate Awin + Impact + Levanta + Refersion marketplace profile per playbook 16 §Phase 2 Step 2.1-2.6 (Path C extended).",
    "Step 4 (15 hr) — Phase 3 cookie-deprecation mitigation (full Path C — Levanta server-side fingerprinting): install Shopify CAPI server-side + UTM fallback + post-purchase email match in Klaviyo + Shopify Pixel + Levanta server-side fingerprinting (canonical Path C cookie-deprecation step 5) + Triple Whale affiliate-cohort-overlay per research/09 Pillar 3 Steps 1-6 (Path C extended) + iOS 14.5+ cookie-deprecation mitigation recovering 40-60% of would-be-lost attribution vs 25-35% at Path B.",
    "Step 5 (10 hr) — Phase 4 cohort-LTV measurement (multi-platform sync): Triple Whale → Reports → Cohort LTV → filter to affiliate_id + per-voice profile + per-platform (Impact / Levanta / Aspire / PartnerStack) → compare 30d/60d/90d/180d/365d cohort LTV for affiliate-driven vs DTC-baseline customers → expected 2.5-3.5× affiliate-LTV multiplier per playbook 16 §Phase 4 Step 4.1 (Path C extended) + the canonical 4-step cohort-LTV SQL + Sustainable-mission-alignment-verifier for Sustainable voice + cross-platform subscription-LTV comparison per Move #11 cross-pollination.",
    "Step 6 (10+ hr/wk ongoing + dedicated affiliate-team) — Cross-platform affiliate-LTV monitoring + churn-optimization + affiliate-program-QBR + quarterly FTC-compliance audit + dedicated affiliate-program-manager: per playbook 16 §Phase 4 Step 4.4-4.6 Path C extended + quarterly affiliate-program-QBR every 90 days + cross-platform subscription-LTV comparison per Move #11 + cross-channel cross-platform affiliate-LTV monitoring across Impact + Levanta + Aspire + PartnerStack.",
  ],
};

export function buildSequenceForPath(path: PathName): string[] {
  return [...BUILD_SEQUENCE_TEMPLATES[path]];
}

// ----- Per-path revenue projection --------------------------------------

export function projectPerPathRevenue(
  inputs: BrandAffiliateInputs,
  rec: PathRecommendation,
): PerPathRevenue {
  const shareMid = (rec.year1AttributedRevenueSharePctLow + rec.year1AttributedRevenueSharePctHigh) / 2.0;
  const ltvMid = (rec.ltvMultiplierLow + rec.ltvMultiplierHigh) / 2.0;
  const year1AttributedRevenueMid = inputs.usGmv * (shareMid / 100.0);
  const affiliateCountMid = Math.floor((rec.year1AffiliateCountLow + rec.year1AffiliateCountHigh) / 2.0);
  const perAffiliateRevenueMid = affiliateCountMid > 0 ? year1AttributedRevenueMid / affiliateCountMid : 0;
  const cookieDeprecationRecoveryMid =
    (rec.cookieDeprecationRecoveryPctLow + rec.cookieDeprecationRecoveryPctHigh) / 2.0;
  const sustainableMissionAlignMid =
    (rec.sustainableMissionAlignScoreLow + rec.sustainableMissionAlignScoreHigh) / 2.0;
  const year1CostMid = (rec.year1CostLow + rec.year1CostHigh) / 2.0;
  const commissionCostMid = year1AttributedRevenueMid * (inputs.commissionTier / 100.0);
  const opsCostMid = 5000.0;
  const recruitmentCostMid = 2000.0;
  const totalYear1CostMid = year1CostMid + commissionCostMid + opsCostMid + recruitmentCostMid;
  const roiMid = totalYear1CostMid > 0 ? year1AttributedRevenueMid / totalYear1CostMid : 0;

  return {
    usGmv: inputs.usGmv,
    expectedAffiliateCount: inputs.expectedAffiliateCount,
    year1AttributedRevenuePctMid: shareMid,
    year1AttributedRevenueLow: rec.year1AttributedRevenueLow,
    year1AttributedRevenueMid: year1AttributedRevenueMid,
    year1AttributedRevenueHigh: rec.year1AttributedRevenueHigh,
    ltvMultiplierMid: ltvMid,
    affiliateCountMid,
    perAffiliateRevenueMid,
    cookieDeprecationRecoveryPctMid: cookieDeprecationRecoveryMid,
    sustainableMissionAlignScoreMid: sustainableMissionAlignMid,
    year1PlatformCostLow: rec.year1CostLow,
    year1PlatformCostMid: year1CostMid,
    year1PlatformCostHigh: rec.year1CostHigh,
    year1CommissionCostMid: commissionCostMid,
    year1OpsCostMid: opsCostMid,
    year1RecruitmentCostMid: recruitmentCostMid,
    year1TotalCostMid: totalYear1CostMid,
    year1RoiLow: rec.year1RoiLow,
    year1RoiMid: roiMid,
    year1RoiHigh: rec.year1RoiHigh,
  };
}

// ----- Validation -------------------------------------------------------

export function validateAffiliateInputs(inputs: BrandAffiliateInputs): string | null {
  if (inputs.usGmv < 0) return `us_gmv must be >= 0, got ${inputs.usGmv}`;
  if (inputs.aov <= 0) return `aov must be > 0, got ${inputs.aov}`;
  if (inputs.aov > 10000) return `aov must be <= $10,000, got ${inputs.aov}`;
  if (inputs.expectedAffiliateCount < 0)
    return `expected_affiliate_count must be >= 0, got ${inputs.expectedAffiliateCount}`;
  if (inputs.commissionTier < 0 || inputs.commissionTier > 100)
    return `commission_tier must be 0-100 (percent), got ${inputs.commissionTier}`;
  const validVoices = ["default", "luxury", "sustainable", "gen_z", "b2b"];
  if (!validVoices.includes(inputs.voiceProfile))
    return `voice_profile must be one of ${validVoices.join(", ")}, got '${inputs.voiceProfile}'`;
  const validZones = ["low", "mid", "high"];
  if (!validZones.includes(inputs.iqZone))
    return `iq_zone must be one of ${validZones.join(", ")}, got '${inputs.iqZone}'`;
  if (inputs.operatorCapacityHoursPerWeek < 0)
    return `operator_capacity_hours_per_week must be >= 0, got ${inputs.operatorCapacityHoursPerWeek}`;
  return null;
}

// ----- Display helpers --------------------------------------------------

export function pathBadgeClasses(path: PathName): string {
  const base = "rounded px-2 py-0.5 text-xs font-mono font-semibold";
  if (path === "A") return `${base} bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40`;
  if (path === "B") return `${base} bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40`;
  return `${base} bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/40`;
}

export function pathLongLabel(path: PathName): string {
  if (path === "A") return "Path A — GoAffPro free starter (canonical $0/mo for $100k-$500k GMV brands)";
  if (path === "B")
    return "Path B — Refersion Growth $239/mo DEFAULT (canonical for $500k-$5M GMV brands — $2M US DTC default)";
  return "Path C — Impact + Levanta + Aspire + PartnerStack enterprise ($5M+ GMV brands)";
}

// ----- Markdown rendering -----------------------------------------------

export function renderAffiliateMarkdown(
  inputs: BrandAffiliateInputs,
  rec: PathRecommendation,
  projection?: PerPathRevenue,
): string {
  const lines: string[] = [];
  lines.push("Affiliate-program Path A/B/C recommendation");
  lines.push("=".repeat(50));
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                            : $${inputs.usGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
  lines.push(`  AOV                                   : $${inputs.aov.toLocaleString("en-US", { maximumFractionDigits: 2 })}`);
  lines.push(`  Expected affiliate count              : ${inputs.expectedAffiliateCount}`);
  lines.push(`  Commission tier (base %)              : ${inputs.commissionTier.toFixed(1)}%`);
  lines.push(`  Voice profile                         : ${inputs.voiceProfile}`);
  lines.push(`  Has Triple Whale                      : ${inputs.hasTripleWhale}`);
  lines.push(`  Has Klaviyo post-purchase             : ${inputs.hasKlaviyoPostPurchase}`);
  lines.push(`  Has Smile loyalty                     : ${inputs.hasSmileLoyalty}`);
  lines.push(`  Has Levanta                           : ${inputs.hasLevanta}`);
  lines.push(`  Has Impact                            : ${inputs.hasImpact}`);
  lines.push(`  IQ zone                               : ${inputs.iqZone}`);
  lines.push(`  Operator capacity (hr/wk)             : ${inputs.operatorCapacityHoursPerWeek}`);
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(`  Platforms                             : ${rec.platforms.length} platform(s) in scope`);
  for (const p of rec.platforms) {
    lines.push(`    - ${p}`);
  }
  lines.push(`  Default platform pick                 : ${rec.defaultPlatformPick}`);
  lines.push(`  Justification                         : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)             : $${rec.costOneTimeLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${rec.costOneTimeHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  Recurring monthly (low-high)          : $${rec.costRecurringLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${rec.costRecurringHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  Year-1 cost (low-high)                : $${rec.year1CostLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${rec.year1CostHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  Attributed revenue share (low-high)   : ${rec.year1AttributedRevenueSharePctLow.toFixed(0)}% – ${rec.year1AttributedRevenueSharePctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Attributed revenue $ (low-high)       : $${rec.year1AttributedRevenueLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${rec.year1AttributedRevenueHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(`  LTV multiplier (low-high)             : ${rec.ltvMultiplierLow.toFixed(1)}× – ${rec.ltvMultiplierHigh.toFixed(1)}×`);
  lines.push(`  Affiliate count (low-high)            : ${rec.year1AffiliateCountLow} – ${rec.year1AffiliateCountHigh}`);
  lines.push(
    `  Cookie-deprecation recovery (low-high): ${rec.cookieDeprecationRecoveryPctLow.toFixed(0)}% – ${rec.cookieDeprecationRecoveryPctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Sustainable-mission-align score (low-high): ${rec.sustainableMissionAlignScoreLow} – ${rec.sustainableMissionAlignScoreHigh}`,
  );
  lines.push(`  Year-1 ROI                            : ${rec.year1RoiLow.toFixed(1)}:1 – ${rec.year1RoiHigh.toFixed(1)}:1`);
  lines.push("");
  lines.push("5-voice commission-tier matrix:");
  for (const [voice, tierDesc] of Object.entries(rec.commissionTierMatrix)) {
    lines.push(`  ${voice.padEnd(13)} : ${tierDesc}`);
  }
  if (projection) {
    lines.push("");
    lines.push("Per-path revenue projection:");
    lines.push(
      `  Year-1 attributed revenue (low-mid-high) : $${projection.year1AttributedRevenueLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${projection.year1AttributedRevenueMid.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${projection.year1AttributedRevenueHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    );
    lines.push(`  Per-affiliate revenue (mid)            : $${projection.perAffiliateRevenueMid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    lines.push(
      `  Year-1 total cost (mid)                : $${projection.year1TotalCostMid.toLocaleString("en-US", { maximumFractionDigits: 0 })} (platform $${projection.year1PlatformCostMid.toLocaleString("en-US", { maximumFractionDigits: 0 })} + commissions $${projection.year1CommissionCostMid.toLocaleString("en-US", { maximumFractionDigits: 0 })} + ops $${projection.year1OpsCostMid.toLocaleString("en-US", { maximumFractionDigits: 0 })} + recruitment $${projection.year1RecruitmentCostMid.toLocaleString("en-US", { maximumFractionDigits: 0 })})`,
    );
    lines.push(
      `  Year-1 ROI mid                         : ${projection.year1RoiMid.toFixed(1)}:1 (range ${projection.year1RoiLow.toFixed(1)}:1 – ${projection.year1RoiHigh.toFixed(1)}:1)`,
    );
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}