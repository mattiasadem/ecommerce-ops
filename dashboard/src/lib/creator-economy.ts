// creator-economy.ts — TypeScript port of scripts/creator_economy_unit_economics.py
// Move #19 creator-economy Path A / B / C scorer.
//
// Mirrors research/12 §GMV-tier paths + playbook 19 §Phase 1+2+3+4 + asset 20
// §5-payout creator-economy-structures matrix + 5-voice creator-payout-structure
// matrix + canonical 6-step creator-economy-build-sequence per path.

export type PathName = "A" | "B" | "C";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type SkuArchetypeDistribution =
  | "hero_mid_long_tail"
  | "balanced"
  | "long_tail_heavy";

export interface BrandCreatorEconomyInputs {
  usDtcGmv: number;
  skuCount: number;
  skuArchetypeDistribution: SkuArchetypeDistribution;
  grossMarginPct: number;
  hasAspireOrCollabstrAccount: boolean;
  hasGrinOrCreatoriqAccount: boolean;
  hasCreatorTierMixBaseline: boolean;
  hasContentLicensingTemplate: boolean;
  hasWhitelistingAdsTemplate: boolean;
  hasTripleWhaleCreatorCohortOverlay: boolean;
  voiceProfile: VoiceProfile;
  hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek: number;
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
  year1IncrementalCreatorEconomyRevenueSharePctLow: number;
  year1IncrementalCreatorEconomyRevenueSharePctHigh: number;
  year1IncrementalCreatorEconomyRevenueLow: number;
  year1IncrementalCreatorEconomyRevenueHigh: number;
  ltvMultiplierLow: number;
  ltvMultiplierHigh: number;
  activeCreatorCountLow: number;
  activeCreatorCountHigh: number;
  contentLicensing2xTo4xUpliftLow: number;
  contentLicensing2xTo4xUpliftHigh: number;
  fiveWayComparisonCreatorEconomyAttributionCorrectionPctLow: number;
  fiveWayComparisonCreatorEconomyAttributionCorrectionPctHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  creatorPayoutStructureMatrix: Record<string, string>;
  buildSequence: string[];
}

// ----- Canonical constants (from research/12 + playbook 19 + asset 20) ---

export const PATH_A_FLOOR = 100_000;
export const PATH_B_FLOOR = 500_000;
export const PATH_C_FLOOR = 5_000_000;

export const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0.0, 500.0, 0.0, 50.0],
  B: [1000.0, 5000.0, 500.0, 3000.0],
  C: [10_000.0, 25_000.0, 3000.0, 15_000.0],
};

export const PATH_INCREMENTAL_REVENUE_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [5.0, 12.5],
  B: [10.0, 30.0],
  C: [15.0, 30.0],
};

export const PATH_LTV_MULTIPLIER: Record<PathName, [number, number]> = {
  A: [1.5, 2.0],
  B: [2.0, 4.0],
  C: [2.5, 4.0],
};

export const PATH_CONTENT_LICENSING_UPLIFT: Record<PathName, [number, number]> = {
  A: [1.0, 1.5],
  B: [2.0, 4.0],
  C: [3.0, 4.0],
};

export const PATH_FIVE_WAY_COMPARISON_CORRECTION_PCT: Record<PathName, [number, number]> = {
  A: [10.0, 20.0],
  B: [30.0, 50.0],
  C: [40.0, 50.0],
};

export const PATH_ROI: Record<PathName, [number, number]> = {
  A: [6.0, 6.0],
  B: [8.0, 16.7],
  C: [6.0, 6.0],
};

export const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
export const RANK_PATH: Record<number, PathName> = {
  0: "A",
  1: "B",
  2: "C",
};

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "Collabstr free (10%-of-creator-payment; canonical Path A starter)",
    "Aspire SaaS free tier",
    "Tagger free",
  ],
  B: [
    "Aspire SaaS $500-$2k/mo (DEFAULT Path B)",
    "Agency $500-$2k/mo (alternative)",
    "Levanta cross-channel $499/mo (overlay)",
  ],
  C: [
    "GRIN $2.5k+/mo (enterprise-creator-relationship-management for $5M+ brands)",
    "CreatorIQ $2.5k+/mo (alternative enterprise CRM)",
    "Aspire SaaS $500-$2k/mo (Path B baseline)",
    "Collabstr $0 + 10%-of-creator-payment",
    "Tagger $1k+/mo (social-listening)",
  ],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "Collabstr 10%-of-creator-payment (default Path A; $0/mo for <$500k GMV brands; canonical micro-creator-UGC-product-seeding-only baseline)",
  B: "Aspire SaaS $500-$2k/mo (default Path B; $500-$3k/mo total cost stack for $500k-$5M GMV brands — canonical DEFAULT for $2M US DTC brand with Gen-Z / Millennial audience-skew ≥40% + creator-pool-baseline ≥30)",
  C: "GRIN $2.5k+/mo OR CreatorIQ $2.5k+/mo (default Path C; $3k-$15k/mo total cost stack for $5M+ GMV brands with dedicated-creator-economy-manager + macro-creator-flagship-campaigns + content-licensing-renewal-cadence)",
};

export const CREATOR_PAYOUT_STRUCTURE_MATRIX: Record<string, string> = {
  default:
    "60% product-seeding-only + 25% micro-CPS 15-20%-of-GMV + 10% mid-tier-CPS 20-25%-of-GMV + $100-base-fee + content-licensing-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Default voice — canonical balanced pyramid-distribution per Aspire 2024 + Tubular Labs 2024)",
  luxury:
    "60% product-seeding-only + 25% micro-CPS 10-15%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing-with-MAP-policy-guardrails + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Luxury voice — lower base + MAP-policy-guardrails required; never direct-discount-promotion per Faire 2024 + Ankorstore 2024 cross-reference)",
  sustainable:
    "60% product-seeding-only + 25% micro-CPS 20-25%-of-GMV + 10% mid-tier-CPS 25-30%-of-GMV + $100-base-fee + content-licensing + mission-aligned-payout-tier + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Sustainable voice — higher base + mission-aligned-payout-tier per assets/12-impact-data-pipeline.md)",
  gen_z:
    "60% product-seeding-only + 25% micro-CPS 25-30%-of-GMV + 10% mid-tier-CPS 30-35%-of-GMV + $100-base-fee + content-licensing + short-form-paid-amplification-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (Gen-Z voice — highest base + short-form-paid-amplification-rights per Tubular Labs 2024)",
  b2b:
    "60% product-seeding-only + 25% micro-CPS 8-12%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing + long-form-case-study-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights (B2B voice — lower base + long-form-case-study-rights per B2B sales-cycle 60-180 day)",
};

// Upgrade + downgrade gates.
export const LUXURY_DOWNGRADE_ENABLED = true;
export const SUSTAINABLE_DOWNGRADE_ENABLED = true;
export const CAPACITY_GATE_HR_WK = 4;
export const MIN_SKU_COUNT = 10;
export const MIN_GROSS_MARGIN_PCT = 25.0;

export const CREATOR_ECONOMY_DEFAULTS: BrandCreatorEconomyInputs = {
  usDtcGmv: 2_000_000,
  skuCount: 35,
  skuArchetypeDistribution: "hero_mid_long_tail",
  grossMarginPct: 50.0,
  hasAspireOrCollabstrAccount: true,
  hasGrinOrCreatoriqAccount: false,
  hasCreatorTierMixBaseline: true,
  hasContentLicensingTemplate: true,
  hasWhitelistingAdsTemplate: true,
  hasTripleWhaleCreatorCohortOverlay: false,
  voiceProfile: "gen_z",
  hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek: 6,
};

export function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  return "A";
}

export function tierFloorText(path: PathName): string {
  if (path === "A") return "100k";
  if (path === "B") return "500k";
  return "5M";
}

export function tierCeilingText(path: PathName): string {
  if (path === "A") return "500k";
  if (path === "B") return "5M";
  return "25M";
}

export function recommendCreatorEconomyPath(
  inputs: BrandCreatorEconomyInputs,
): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForCapacity = false;
  let deferredForSkuCount = false;
  let deferredForMargin = false;
  let deferredForTripleWhale = false;

  // Capacity floor: defer if operator has insufficient time.
  if (inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Operator capacity ${inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek} hr/wk < ${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 19 §Prerequisite + asset 20 §4-cadence Klaviyo flows); creator-economy program deferred until operator capacity is available.`,
    );
    deferredForCapacity = true;
  }

  // SKU count floor.
  if (inputs.skuCount < MIN_SKU_COUNT) {
    justificationParts.push(
      `SKU count ${inputs.skuCount} < ${MIN_SKU_COUNT} floor (research/12 §Prereq + playbook 19 §Phase 1 Step 1.2: canonical 10+ SKUs for creator-content product-seeding-coverage; <10 SKUs limits the mid-tier-creator-tier-mix-baseline 60/30/10 pyramid-distribution); creator-economy program deferred until SKU expansion.`,
    );
    deferredForSkuCount = true;
  }

  // Gross margin floor.
  if (inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT) {
    justificationParts.push(
      `Gross margin ${inputs.grossMarginPct.toFixed(1)}% < ${MIN_GROSS_MARGIN_PCT.toFixed(1)}% floor (research/12 Pillar 1 + asset 20 §sustainable-mission-aligned-payout-tier; creator-CPS 8-35%-of-GMV requires ≥25% gross margin to break even after creator-payout, content-licensing, and whitelisting-ads-cost-stack); creator-economy program deferred until gross margin exceeds ${MIN_GROSS_MARGIN_PCT.toFixed(1)}%. A brand with <${MIN_GROSS_MARGIN_PCT.toFixed(1)}% gross margin should defer creator-economy until the unit-economics baseline is fixed.`,
    );
    deferredForMargin = true;
  }

  // Triple Whale cohort-overlay deferral.
  if (!inputs.hasTripleWhaleCreatorCohortOverlay) {
    justificationParts.push(
      "has_triple_whale_creator_cohort_overlay=False (research/12 Pillar 5 + playbook 19 §Phase 4 Step 4.1: Triple-Whale creator-cohort-overlay-Wire is the canonical 5-way-comparison cycle substrate for creator-economy vs organic-DTC vs paid-Meta vs affiliate-program vs TikTok-Shop cohort-LTV; without it neither the 5-way-comparison schema nor the 30-50% attribution-correction fires); creator-economy program deferred until Triple-Whale creator-cohort-overlay is wired.",
    );
    deferredForTripleWhale = true;
  }

  // Base tier assignment.
  let path: PathName;
  if (inputs.usDtcGmv < PATH_A_FLOOR) {
    path = "A";
    if (
      !deferredForCapacity &&
      !deferredForSkuCount &&
      !deferredForMargin &&
      !deferredForTripleWhale
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} is below the $${PATH_A_FLOOR.toLocaleString("en-US")} creator-economy entry floor; creator-economy launch is deferred until US DTC GMV exceeds $${PATH_A_FLOOR.toLocaleString("en-US")} (research/12 §Prerequisites). Path A is still surfaced as the recommendation for tracking (audit only).`,
      );
    }
  } else {
    path = tierForGmv(inputs.usDtcGmv);
    if (
      !deferredForCapacity &&
      !deferredForSkuCount &&
      !deferredForMargin &&
      !deferredForTripleWhale
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })} lands in the Path ${path} tier ($${tierFloorText(path)} - $${tierCeilingText(path)} GMV).`,
      );
    }
  }

  // Apply upgrade/downgrade gates.
  const downgrades: string[] = [];
  if (
    LUXURY_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "luxury" &&
    !inputs.hasContentLicensingTemplate
  ) {
    downgrades.push(
      "voice_profile=luxury WITHOUT has_content_licensing_template=True (research/12 Pillar 3 + asset 20 §luxury-MAP-policy-guardrails: Luxury brands must have the 3-clause content-licensing-template with MAP-policy-guardrails drafted with legal counsel before paid amplification; without it, MAP violations on paid amplification can cost $10k+/violation per FTC 2024 16 CFR Part 255 + Faire 2024 + Ankorstore 2024 cross-reference); downgrade one tier",
    );
  }
  if (
    SUSTAINABLE_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "sustainable" &&
    !inputs.hasAspireOrCollabstrAccount
  ) {
    downgrades.push(
      "voice_profile=sustainable WITHOUT has_aspire_or_collabstr_account=True (research/12 Pillar 5 + assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier: Aspire or Collabstr creator-discovery-platform-account is the canonical verification that the brand is committed to sustainability economics; without it, Tier-3 30% Sustainable commission is unverified and the path is downgraded by one tier)",
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
    !deferredForSkuCount &&
    !deferredForMargin &&
    !deferredForTripleWhale
  ) {
    justificationParts.push("All gates pass; no downgrade applied.");
  }

  // Cost stack + incremental revenue + LTV + content-licensing uplift + 5-way-comparison correction + ROI from canonical path tables.
  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [shareLow, shareHigh] = PATH_INCREMENTAL_REVENUE_SHARE_PCT[path];
  const [ltvLow, ltvHigh] = PATH_LTV_MULTIPLIER[path];
  const [upliftLow, upliftHigh] = PATH_CONTENT_LICENSING_UPLIFT[path];
  const [corrLow, corrHigh] = PATH_FIVE_WAY_COMPARISON_CORRECTION_PCT[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const revenueLow = inputs.usDtcGmv * (shareLow / 100.0);
  const revenueHigh = inputs.usDtcGmv * (shareHigh / 100.0);

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
    year1IncrementalCreatorEconomyRevenueSharePctLow: shareLow,
    year1IncrementalCreatorEconomyRevenueSharePctHigh: shareHigh,
    year1IncrementalCreatorEconomyRevenueLow: revenueLow,
    year1IncrementalCreatorEconomyRevenueHigh: revenueHigh,
    ltvMultiplierLow: ltvLow,
    ltvMultiplierHigh: ltvHigh,
    activeCreatorCountLow: Math.max(0, Math.floor(inputs.usDtcGmv / 50_000)),
    activeCreatorCountHigh: Math.max(1, Math.floor((inputs.usDtcGmv / 25_000))),
    contentLicensing2xTo4xUpliftLow: upliftLow,
    contentLicensing2xTo4xUpliftHigh: upliftHigh,
    fiveWayComparisonCreatorEconomyAttributionCorrectionPctLow: corrLow,
    fiveWayComparisonCreatorEconomyAttributionCorrectionPctHigh: corrHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    creatorPayoutStructureMatrix: { ...CREATOR_PAYOUT_STRUCTURE_MATRIX },
    buildSequence: buildSequenceForPath(path),
  };
}

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1 (2 hr) — Pick path + Collabstr / Aspire setup: Path A = Collabstr free (10%-of-creator-payment) OR Aspire SaaS-free-tier. Verify ≥$100k US DTC GMV + ≥10 SKUs + ≥25% gross margin + Aspire-or-Collabstr account + 30+ micro-creator-pool-baseline + 4 hr/wk operator capacity per research/12 §Prereq #1-#8.",
    "Step 2 (2 hr) — Phase 1 platform + creator-tier-mix-baseline: configure 60% micro-creator-UGC-product-seeding-only payout (Path A baseline) + 60/30/10 creator-tier-mix-baseline (60% micro-creators 1k-10k-followers + 30% mid-tier-creators 10k-100k-followers + 10% macro-creators 100k+-followers per Move-#15-affiliate-program-benchmarks) + Triple-Whale creator-cohort-overlay-Wire (manual UTM only at Path A; no GRIN/CreatorIQ enterprise-CRM) per playbook 19 §Phase 1 Step 1.3 + asset 20 §creator-tier-mix-baseline.",
    "Step 3 (4 hr) — Phase 2 first-50-micro-creator-UGC-outreach + product-seeding: seed-first-50-micro-creators loop (existing-customer-list scrape via Klaviyo 'Engaged customers with social handles' segment + micro-creator outreach via Aspire + Collabstr + Instagram hashtag scrape + product-seeding-only $0 + free-product) per playbook 19 §Phase 1 Step 1.4 + asset 20 §30 voice-variant creator-discovery-outreach-templates + 5-payout-creator-economy-structures (Path A = product-seeding-only baseline).",
    "Step 4 (2 hr) — Phase 3 minimal content-licensing + whitelisting (Path A skips the templates): Path A is the canonical 'no-content-licensing-template' tier; creators retain full content rights and brand cannot amplify via paid channels. Skip the 3-clause content-licensing-template + whitelisting-ads-template per research/12 Pillar 3 + asset 20 §content-licensing-template §whitelisting-ads-template (Path B+ feature; Path A defaults to product-seeding-only).",
    "Step 5 (2 hr) — Phase 4 minimal Triple-Whale-cohort-LTV-measurement (manual): Triple-Whale → Reports → Cohort LTV → filter to creator-source-segment → compare 30d/60d/90d cohort LTV for creator-driven vs DTC-baseline customers → expected 1.5-2.0× creator-LTV multiplier per playbook 19 §Phase 4 Step 4.1 (no 5-way-comparison at Path A; manual UTM + Triple-Whale attribution only).",
    "Step 6 (2 hr/wk ongoing) — Creator-application review + FTC-compliance-disclosure-language audit + churn-monitoring: review creator applications weekly + verify FTC disclosure language on every post (`#ad` / `#sponsored` / `#partner` / `#gifted` per FTC 2024 16 CFR Part 255; $10k+/violation fine per FTC 2023-2024 enforcement) per playbook 19 §Phase 4 Step 4.6 + asset 20 §FTC-compliance-disclosure-language templates + creator-churn-rate-baseline (30-50%-annual micro-creator-churn per Awin 2024 + Aspire 2024 benchmarks).",
  ],
  B: [
    "Step 1 (5 hr) — Pick path + Aspire SaaS setup: Path B DEFAULT = Aspire SaaS $500-$2k/mo OR agency $500-$2k/mo for $500k+ brands. Verify ≥$500k US DTC GMV + ≥10 SKUs + ≥25% gross margin + 50-100 active creators (60% micro + 30% mid-tier + 10% macro per creator-tier-mix-baseline) + 4-8 hr/wk creator-economy-program-capacity + 3-clause-content-licensing-template drafted with legal counsel + whitelisting-ads-template drafted with legal counsel per research/12 §Prereq #1.",
    "Step 2 (10 hr) — Phase 1 platform + 5-payout-creator-economy-structures + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire: configure 5-voice creator-payout-structure matrix [Default 60% product-seeding-only + 25% micro-CPS 15-20%-of-GMV + 10% mid-tier-CPS 20-25%-of-GMV + $100-base-fee + content-licensing-rights + 5% macro-flat-fee $500-$5k/creator/campaign + content-licensing + whitelisting-rights / Luxury 60% product-seeding-only + 25% micro-CPS 10-15%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing-with-MAP-policy-guardrails + 5% macro-flat-fee + content-licensing + whitelisting-rights / Sustainable 60% product-seeding-only + 25% micro-CPS 20-25%-of-GMV + 10% mid-tier-CPS 25-30%-of-GMV + $100-base-fee + content-licensing + mission-aligned-payout-tier + 5% macro-flat-fee + content-licensing + whitelisting-rights / Gen-Z 60% product-seeding-only + 25% micro-CPS 25-30%-of-GMV + 10% mid-tier-CPS 30-35%-of-GMV + $100-base-fee + content-licensing + short-form-paid-amplification-rights + 5% macro-flat-fee + content-licensing + whitelisting-rights / B2B 60% product-seeding-only + 25% micro-CPS 8-12%-of-GMV + 10% mid-tier-CPS 12-18%-of-GMV + $100-base-fee + content-licensing + long-form-case-study-rights + 5% macro-flat-fee + content-licensing + whitelisting-rights] + 3-clause-content-licensing-template [perpetual-organic-usage + 90-day-paid-amplification + creator-attribution-required per Awin 2024 + Impact 2024 benchmarks] + whitelisting-ads-template [Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024 + YouTube-Shorts-Paid-Discovery-2024 + Pinterest-Creator-Reveal-2024] + Triple-Whale creator-cohort-overlay-Wire (canonical 5-way-comparison-cycle schema [creator-economy-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV vs affiliate-program-cohort-LTV [Move #15] vs TikTok-Shop-cohort-LTV [Move #15.x] at 30/60/90-day windows]) per playbook 19 §Phase 1 Step 1.3-1.5 + asset 20 §5-payout-creator-economy-structures contract-template + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec.",
    "Step 3 (8 hr) — Phase 2 mid-tier-creator-onboarding + 5-flow Klaviyo-creator-content-flows + FTC-compliance-disclosure-language-SOP: 20-50 mid-tier-creator-onboarding via CPS 20-30%-of-GMV + $100-base-fee + content-licensing-rights + 5-flow Klaviyo-creator-content-flow-templates [creator-content-welcome + creator-driven-cart-abandon + creator-driven-post-purchase + creator-tier-promotion-educational + 90-day-content-licensing-renewal-or-sunset-decision] with Klaviyo conditional-content syntax via `voice_profile` customer-property webhook mapping + Triple-Whale `?tw_camp=creator_<flow_id>_v<voice_profile>` UTM on every CTA + 4-trigger tier-promotion-SOP [volume $5k+/90d → Tier-2 / cohort-LTV $300+ → Tier-2 / content-quality 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible / tenure 180d + Triggers 1+2 → Tier-3] per Move-#15-affiliate-program-tier-promotion-pattern + FTC-compliance-disclosure-language-SOP per 16 CFR Part 255 [4 disclosure-types × 5 voices × 4 channels = 80 cell combinations; $10k+/violation fine] per playbook 19 §Phase 2 Step 2.1-2.4 + asset 20 §Klaviyo-creator-content-flow-templates + 4-trigger tier-promotion-SOP + FTC-compliance-disclosure-language templates.",
    "Step 4 (8 hr) — Phase 3 content-licensing-launch + whitelisting-ads-execution + 50-70% paid-amplification-budget-allocation: launch content-licensing-template-execution (creators sign 3-clause content-licensing per content-piece; brand-grants-perpetual-organic-usage + 90-day-paid-amplification) + whitelisting-ads-template-execution (creators grant brand-permission-to-run-creator-content-as-brand-paid-ads per Meta-Brand-Collabs-Manager 2024 + TikTok-Creator-Marketplace-2024) + paid-amplification-budget-allocation [Default 50% Meta / Luxury 60% Meta / Sustainable 40% Meta / Gen-Z 50% TikTok / B2B 50% LinkedIn] per asset 20 §content-licensing-template §whitelisting-ads-template §paid-amplification-budget-allocation + research/12 Pillar 3. Content-licensing 2-4× creator-content-ROI uplift per Awin 2024 + Impact 2024 benchmarks.",
    "Step 5 (4 hr) — Phase 4 Triple-Whale-creator-cohort-LTV-overlay + 5-way-comparison-cycle + 90-day-content-licensing-renewal-cadence: Triple-Whale → Reports → Cohort LTV → filter to creator-cohort-segment + per-voice profile → compare 30d/60d/90d/180d cohort LTV for creator-economy-driven vs organic-DTC vs paid-Meta vs affiliate-program [Move #15] vs TikTok-Shop [Move #15.x] at 30/60/90-day windows → expected 2.0-4.0× creator-LTV-multiplier per playbook 19 §Phase 4 Step 4.1 + 30-50% creator-economy-attribution-correction per Triple-Whale-2024-benchmarks + 90-day-content-licensing-renewal-or-sunset-decision [sunset creator-content-licensing with <0.5× average-creator-content-ROI; renew with ≥2× average-creator-content-ROI per Tubular Labs 2024 + Aspire 2024 benchmarks] per asset 20 §Triple-Whale-creator-cohort-overlay-Wire-spec.",
    "Step 6 (4-8 hr/wk ongoing) — Churn-alert + 4-trigger tier-promotion + quarterly FTC-compliance audit + Smile.io 2× points for creator-driven customers: Triple-Whale → Alerts → creator_churn_rate > 50%-annual-micro / 25%-annual-mid-tier / 10%-annual-macro → Slack alert + apply the 4-trigger tier-promotion-SOP per playbook 19 §Phase 4 Step 4.4 + quarterly FTC-compliance audit every 90 days per research/12 Pillar 5 + 90-day content-licensing-renewal-cadence per asset 20.",
  ],
  C: [
    "Step 1 (10 hr) — Pick path + multi-platform enterprise architecture: Path C = GRIN $2.5k+/mo OR CreatorIQ $2.5k+/mo (enterprise-creator-relationship-management for $5M+ brands) + Aspire SaaS $500-$2k/mo (Path B baseline) + Collabstr $0 + 10%-of-creator-payment + Tagger $1k+/mo (social-listening). Verify ≥$5M US DTC GMV + Path B steady-state + GRIN/CreatorIQ installed + dedicated-creator-economy-manager $4k-$6k/mo OR 16+ hr/wk operator capacity per research/12 §Prereq #1.",
    "Step 2 (20 hr) — Phase 1 multi-platform + 5-payout-creator-economy-structures + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire + GRIN/CreatorIQ-enterprise-CRM (Path C extended): Path B build + GRIN/CreatorIQ enterprise-creator-relationship-management [creator-relationship-management-CRM + content-approval-workflow + payout-orchestration + brand-safety-verification per FTC 2024 16-CFR-Part-255 + creator-content-licensing-tracking + creator-content-usage-rights-management] + dedicated-creator-economy-manager $4k-$6k/mo per playbook 19 §Phase 1 Step 1.3-1.5 (Path C extended) + asset 20 §5-payout-creator-economy-structures contract-template + content-licensing-template + whitelisting-ads-template + Triple-Whale-creator-cohort-overlay-Wire-spec + creator-discovery-platform-onboarding-templates [Aspire + Collabstr + GRIN + CreatorIQ + Tagger].",
    "Step 3 (15 hr) — Phase 2 enterprise creator-tier-mix-baseline + multi-platform 5-flow Klaviyo-creator-content-flows + Awin + Impact + Levanta marketplace listing + GRIN/CreatorIQ-affiliate-network-manager: 100-200 active creators (60% micro + 30% mid-tier + 10% macro per creator-tier-mix-baseline) + multi-platform 5-flow Klaviyo-creator-content-flow-templates + Klaviyo conditional-content syntax via `voice_profile` customer-property webhook mapping + Triple-Whale `?tw_camp=creator_<flow_id>_v<voice_profile>` UTM on every CTA + Awin + Impact + Levanta creator-economy-marketplace-listing + GRIN/CreatorIQ-affiliate-network-manager per playbook 19 §Phase 2 Step 2.1-2.6 (Path C extended) + asset 20 §Klaviyo-creator-content-flow-templates + 4-trigger tier-promotion-SOP + FTC-compliance-disclosure-language templates + 5-platform creator-discovery-platform-onboarding-templates.",
    "Step 4 (15 hr) — Phase 3 content-licensing-launch + whitelisting-ads-execution + brand-safety-verification + creator-content-usage-rights-management (Path C extended): Path B content-licensing-template-execution + whitelisting-ads-template-execution + brand-safety-verification per FTC 2024 16-CFR-Part-255 + creator-content-licensing-tracking + creator-content-usage-rights-management + 50-70% paid-amplification-budget-allocation per asset 20 §content-licensing-template §whitelisting-ads-template §paid-amplification-budget-allocation + research/12 Pillar 3. Content-licensing 3-4× creator-content-ROI uplift Path C per Awin 2024 + Impact 2024 benchmarks.",
    "Step 5 (10 hr) — Phase 4 multi-platform Triple-Whale-creator-cohort-LTV-overlay + 5-way-comparison + 90-day-content-licensing-renewal-cadence + cross-platform subscription-LTV comparison: Triple-Whale → Reports → Cohort LTV → filter to creator-cohort-segment + per-voice profile + per-platform (Aspire / Collabstr / GRIN / CreatorIQ / Tagger) → compare 30d/60d/90d/180d/365d cohort LTV for creator-economy-driven vs organic-DTC vs paid-Meta vs affiliate-program [Move #15] vs TikTok-Shop [Move #15.x] at 30/60/90-day windows → expected 2.5-4.0× creator-LTV-multiplier Path C per playbook 19 §Phase 4 Step 4.1 (Path C extended) + 40-50% creator-economy-attribution-correction Path C per Triple-Whale-2024-benchmarks + Sustainable-mission-alignment-verifier for Sustainable voice + 90-day-content-licensing-renewal-cadence per asset 20 §Triple-Whale-creator-cohort-overlay-Wire-spec.",
    "Step 6 (16+ hr/wk ongoing + dedicated-creator-economy-manager) — Cross-platform creator-LTV monitoring + churn-optimization + creator-economy-QBR + quarterly FTC-compliance audit + dedicated-creator-economy-manager: per playbook 19 §Phase 4 Step 4.4-4.6 Path C extended + quarterly creator-economy-program-QBR every 90 days + cross-platform subscription-LTV comparison per Move #11 + cross-channel cross-platform creator-LTV monitoring across Aspire / Collabstr / GRIN / CreatorIQ / Tagger.",
  ],
};

export function buildSequenceForPath(path: PathName): string[] {
  return [...BUILD_SEQUENCE_TEMPLATES[path]];
}

export function validateCreatorEconomyInputs(inputs: BrandCreatorEconomyInputs): string | null {
  if (inputs.usDtcGmv < 0) return `us_dtc_gmv must be >= 0, got ${inputs.usDtcGmv}`;
  if (inputs.skuCount < 0) return `sku_count must be >= 0, got ${inputs.skuCount}`;
  const validArchetypes = ["hero_mid_long_tail", "balanced", "long_tail_heavy"];
  if (!validArchetypes.includes(inputs.skuArchetypeDistribution))
    return `sku_archetype_distribution must be one of ${validArchetypes.join(", ")}, got '${inputs.skuArchetypeDistribution}'`;
  if (inputs.grossMarginPct < 0 || inputs.grossMarginPct > 100)
    return `gross_margin_pct must be 0-100, got ${inputs.grossMarginPct}`;
  if (inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek < 0)
    return `has_dedicated_creator_economy_manager_capacity_hours_per_week must be >= 0, got ${inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek}`;
  const validVoices = ["default", "luxury", "sustainable", "gen_z", "b2b"];
  if (!validVoices.includes(inputs.voiceProfile))
    return `voice_profile must be one of ${validVoices.join(", ")}, got '${inputs.voiceProfile}'`;
  return null;
}

// ----- Display helpers ---------------------------------------------------

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
    return "Path A — Collabstr free (micro-creator-UGC-product-seeding-only, $0/mo for $100k-$500k GMV brands)";
  if (path === "B")
    return "Path B — Aspire SaaS $500-$2k/mo DEFAULT (canonical for $500k-$5M GMV brands — $2M US DTC default)";
  return "Path C — GRIN / CreatorIQ + Aspire enterprise-CRM ($3k-$15k/mo for $5M+ GMV brands)";
}

// ----- Markdown rendering -----------------------------------------------

export function renderCreatorEconomyMarkdown(inputs: BrandCreatorEconomyInputs, rec: PathRecommendation): string {
  const lines: string[] = [];
  lines.push("Creator-economy Path A/B/C recommendation");
  lines.push("=".repeat(50));
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                            : $${inputs.usDtcGmv.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
  lines.push(`  SKU count                             : ${inputs.skuCount}`);
  lines.push(`  SKU archetype distribution            : ${inputs.skuArchetypeDistribution}`);
  lines.push(`  Gross margin (%)                      : ${inputs.grossMarginPct.toFixed(1)}%`);
  lines.push(`  Has Aspire or Collabstr account       : ${inputs.hasAspireOrCollabstrAccount}`);
  lines.push(`  Has GRIN or CreatorIQ account         : ${inputs.hasGrinOrCreatoriqAccount}`);
  lines.push(`  Has creator-tier-mix-baseline         : ${inputs.hasCreatorTierMixBaseline}`);
  lines.push(`  Has content-licensing template        : ${inputs.hasContentLicensingTemplate}`);
  lines.push(`  Has whitelisting-ads template         : ${inputs.hasWhitelistingAdsTemplate}`);
  lines.push(`  Has Triple-Whale creator-cohort       : ${inputs.hasTripleWhaleCreatorCohortOverlay}`);
  lines.push(`  Voice profile                         : ${inputs.voiceProfile}`);
  lines.push(`  Operator capacity (hr/wk)             : ${inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek}`);
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
    `  Incremental revenue share (low-high)  : ${rec.year1IncrementalCreatorEconomyRevenueSharePctLow.toFixed(1)}% – ${rec.year1IncrementalCreatorEconomyRevenueSharePctHigh.toFixed(1)}%`,
  );
  lines.push(
    `  Incremental revenue $ (low-high)      : $${rec.year1IncrementalCreatorEconomyRevenueLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${rec.year1IncrementalCreatorEconomyRevenueHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  );
  lines.push(
    `  LTV multiplier (low-high)             : ${rec.ltvMultiplierLow.toFixed(1)}× – ${rec.ltvMultiplierHigh.toFixed(1)}×`,
  );
  lines.push(
    `  Active creator count (low-high)       : ${rec.activeCreatorCountLow} – ${rec.activeCreatorCountHigh}`,
  );
  lines.push(
    `  Content-licensing uplift (low-high)   : ${rec.contentLicensing2xTo4xUpliftLow.toFixed(1)}× – ${rec.contentLicensing2xTo4xUpliftHigh.toFixed(1)}×`,
  );
  lines.push(
    `  5-way-comparison correction (low-high): ${rec.fiveWayComparisonCreatorEconomyAttributionCorrectionPctLow.toFixed(0)}% – ${rec.fiveWayComparisonCreatorEconomyAttributionCorrectionPctHigh.toFixed(0)}%`,
  );
  lines.push(`  Year-1 ROI                            : ${rec.year1RoiLow.toFixed(1)}:1 – ${rec.year1RoiHigh.toFixed(1)}:1`);
  lines.push("");
  lines.push("5-payout creator-economy-structures matrix (per voice):");
  for (const [voice, structureDesc] of Object.entries(rec.creatorPayoutStructureMatrix)) {
    lines.push(`  ${voice.padEnd(13)} : ${structureDesc}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}
