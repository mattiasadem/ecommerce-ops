/**
 * `tiktok-shop-path.ts` — Pure math for the `/tiktok` Path A/B/C scorer.
 *
 * Direct browser port of `scripts/tiktok_shop_unit_economics.py`. Given a
 * brand's current TikTok-Shop-fit inputs (12 fields), the calculator picks
 * one of 3 paths and emits a full recommendation:
 *
 *   Path A: creator-affiliate-only + shoppable-video-ads (free; <$500k GMV;
 *           3-6:1 conservative Year-1 ROI)
 *   Path B: + LIVE-shopping 4-hour-week + Triple-Whale + Klaviyo
 *           (DEFAULT for $500k-$5M brands; 6-12:1 Year-1 ROI default 8.5:1
 *           at $2M US DTC base)
 *   Path C: full TikTok-Shop-orchestration (daily-LIVE + TikTok-Shop-affiliate
 *           + dedicated-creator-affiliate-manager; $5M+ GMV; 4-8:1 muted by
 *           6-12-month build-cycle)
 *
 * Defers + downgrades are pinned:
 * - Defer if GMV <$100k, SKUs <10, margin <25%, LIVE <4 hr/wk, no TikTok
 *   Business Account, no Shopify-TikTok-Channel, creator-pool <10.
 * - Downgrade one tier if Triple-Whale-TikTok-attribution missing.
 * - Downgrade one tier if luxury + no Klaviyo-TikTok-channel.
 * - Downgrade one tier if b2b + creator-pool <50.
 * - Downgrade one tier if gen-z + LIVE <8 hr/wk.
 * - Downgrade Path C → Path B if LIVE <8 hr/wk.
 *
 * Math is hermetic — no API, no DOM. Same numbers as the Python CLI so an
 * operator can sanity-check the browser and the terminal without drift.
 */

export type PathName = "A" | "B" | "C";
export type VoiceProfile =
  | "default"
  | "luxury"
  | "sustainable"
  | "gen_z"
  | "b2b";
export type SkuDistribution =
  | "12_hero_23_wholesale"
  | "balanced_50_50"
  | "mostly_hero_70_30"
  | "mostly_wholesale_30_70";

export interface TikTokShopInputs {
  usDtcGmv: number;                                   // USD
  skuCount: number;
  skuArchetypeDistribution: SkuDistribution;
  grossMarginPct: number;                            // 0-100
  hasTiktokBusinessAccount: boolean;
  hasTiktokShopSellerCenter: boolean;
  hasShopifyTiktokChannel: boolean;
  hasKlaviyoTiktokChannel: boolean;
  hasTripleWhaleTiktokAttribution: boolean;
  creatorAffiliatePoolSize: number;
  voiceProfile: VoiceProfile;
  hasLiveShoppingStudioCapacityHoursPerWeek: number;
}

export interface TikTokShopRecommendation {
  path: PathName;
  basePath: PathName;
  downgraded: boolean;
  deferReasons: string[];
  downgradeReasons: string[];
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  year1IncrementalGmvSharePctLow: number;
  year1IncrementalGmvSharePctHigh: number;
  year1IncrementalGmvLow: number;
  year1IncrementalGmvHigh: number;
  liveCohortLtvMultiplierLow: number;
  liveCohortLtvMultiplierHigh: number;
  sparkAdsRoasLow: number;
  sparkAdsRoasHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  creatorAffiliatePayoutMatrix: Record<VoiceProfile, string>;
  buildSequence: string[];
}

// ----- Canonical thresholds (pinned — mirrors Python) ------------------------

export const PATH_A_FLOOR = 100_000;
export const PATH_B_FLOOR = 500_000;
export const PATH_C_FLOOR = 5_000_000;

export const MIN_SKU_COUNT = 10;
export const MIN_GROSS_MARGIN_PCT = 25;
export const LIVE_CAPACITY_GATE_HR_WK = 4;
export const MIN_CREATOR_AFFILIATE_POOL_SIZE = 10;
export const PATH_C_LIVE_CAPACITY_FLOOR = 8;

export const SKU_DISTRIBUTION_OPTIONS: { value: SkuDistribution; label: string }[] = [
  { value: "12_hero_23_wholesale", label: "12 hero + 23 secondary" },
  { value: "balanced_50_50", label: "Balanced 50/50" },
  { value: "mostly_hero_70_30", label: "Mostly hero 70/30" },
  { value: "mostly_wholesale_30_70", label: "Mostly secondary 30/70" },
];

export const VOICE_PROFILE_OPTIONS: { value: VoiceProfile; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "luxury", label: "Luxury" },
  { value: "sustainable", label: "Sustainable" },
  { value: "gen_z", label: "Gen Z" },
  { value: "b2b", label: "B2B" },
];

const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0, 2_000, 0, 149],
  B: [2_000, 5_000, 0, 2_000],
  C: [5_000, 50_000, 2_000, 10_000],
};

const PATH_INCREMENTAL_GMV_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [5.0, 25.0],
  B: [25.0, 50.0],
  C: [15.0, 30.0],
};

const LIVE_COHORT_LTV_MULTIPLIER: Record<PathName, [number, number]> = {
  A: [1.0, 1.5],
  B: [3.0, 5.0],
  C: [4.0, 7.0],
};

const SPARK_ADS_ROAS_BANDS: Record<PathName, [number, number]> = {
  A: [1.5, 2.5],
  B: [2.0, 4.0],
  C: [3.0, 5.0],
};

const PATH_ROI: Record<PathName, [number, number]> = {
  A: [3.0, 6.0],
  B: [6.0, 12.0],
  C: [4.0, 8.0],
};

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "TikTok-Shop-Seller-Center",
    "Shopify-TikTok-Channel",
    "Klaviyo-Standard",
    "TikTok-Ads-Manager-Self-Serve",
    "TikTok-Shop-Creator-Marketplace",
  ],
  B: [
    "TikTok-Shop-Seller-Center",
    "Shopify-TikTok-Channel",
    "Klaviyo-TikTok-channel",
    "Triple-Whale-Starter-or-Pro",
    "TikTok-Ads-Manager",
    "TikTok-LIVE-Studio",
    "LIVE-shopping-studio-build",
  ],
  C: [
    "TikTok-Shop-Seller-Center",
    "Shopify-TikTok-Channel",
    "Klaviyo-TikTok-channel-full-integration",
    "Triple-Whale-Pro",
    "TikTok-Ads-Manager",
    "TikTok-Shop-Affiliate-Program",
    "TikTok-Shop-Analytics-Pro",
    "dedicated-creator-affiliate-manager",
  ],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "TikTok-Shop-Seller-Center + Shopify-TikTok-Channel (free; TikTok-Shop-takes 8%-commission + creator-affiliate CPS 10-25% per TikTok for Business 2024)",
  B: "TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Triple-Whale-TikTok-cohort-overlay (DEFAULT; 8.5:1 Year-1 ROI at $2M US DTC base)",
  C: "Full TikTok-Shop-orchestration including daily-LIVE-cadence + TikTok-Shop-affiliate-program + Klaviyo-TikTok-channel-full-integration + Triple-Whale-Pro (per research/11 §Path C)",
};

export const CREATOR_AFFILIATE_PAYOUT_MATRIX: Record<VoiceProfile, string> = {
  default: "15/20/25%",
  luxury: "10/12/15%",
  sustainable: "20/25/30%",
  gen_z: "25/30/35%",
  b2b: "8-12/12-15/15-20%",
};

// ----- Defaults ---------------------------------------------------------------

export const TIKTOK_SHOP_DEFAULTS: TikTokShopInputs = {
  usDtcGmv: 2_000_000,
  skuCount: 35,
  skuArchetypeDistribution: "12_hero_23_wholesale",
  grossMarginPct: 50,
  hasTiktokBusinessAccount: true,
  hasTiktokShopSellerCenter: true,
  hasShopifyTiktokChannel: true,
  hasKlaviyoTiktokChannel: true,
  hasTripleWhaleTiktokAttribution: true,
  creatorAffiliatePoolSize: 50,
  voiceProfile: "gen_z",
  hasLiveShoppingStudioCapacityHoursPerWeek: 8,
};

// ----- Scoring ----------------------------------------------------------------

function tierForGmv(usDtcGmv: number): PathName {
  if (usDtcGmv < PATH_B_FLOOR) return "A";
  if (usDtcGmv < PATH_C_FLOOR) return "B";
  return "C";
}

function buildSequenceForPath(path: PathName): string[] {
  if (path === "A") {
    return [
      "Step 1: TikTok-Shop-Seller-Center-onboarding (apply at seller-center.tiktok.com with category-approval for top SKU category per TikTok for Business 2024; 1-4 week approval-timeline).",
      "Step 2: TikTok-Shop-product-feed-optimization (per-SKU: TikTok-Shop-product-title <=100-chars + product-image 1:1-square->=800px + 3-5-additional-images + product-description-with-keywords + price-tier-fits-TikTok-Shop-impulse-pattern $15-$45 hero-SKU + 5%-15%-shipping-subsidy).",
      "Step 3: Onboard 10-20 creator-affiliates via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape (canonical 4-channel creator-affiliate-pool build per playbook 18 §Phase 1).",
      "Step 4: Launch shoppable-video-ads via TikTok-Ads-Manager with Spark-Ads-boost ($50-$500/day per audience-segment; 2-4× ROAS vs in-feed-ads-without-Product-Module per eMarketer 2024).",
      "Step 5: Wire Klaviyo-Standard + Triple-Whale-TikTok-attribution-Standard for TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow + TikTok-Shop-cohort-LTV-measurement.",
      "Step 6: Quarterly Shop-Score-baseline-audit (positive-review-rate >=95% / ship-on-time-rate >=95% / return-rate <=5%) + graduate-to-Path-B decision at $25k-$100k first-quarter TikTok-Shop-GMV threshold.",
    ];
  }
  if (path === "B") {
    return [
      "Step 1: TikTok-Shop-Seller-Center-onboarding + category-approval-application for the brand's top SKU category (Beauty / Fashion-Accessories / Home / Food-and-Beverage / Pet / Health per TikTok for Business 2024 category-approval-list; documentation [brand-registration + product-safety-cert + insurance-coverage + category-specific-test-results] + 1-4 week approval-timeline).",
      "Step 2: TikTok-Shop-product-feed-optimization + Shopify-TikTok-Channel-wiring (product-feed-sync $0; per-SKU TikTok-Shop-product-title + image + description + price-tier + shipping-subsidy per playbook 18 §Phase 1 + asset 19 §TikTok-Shop-product-listing-optimization-checklist).",
      "Step 3: Onboard 30-50 creator-affiliates via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape (canonical 4-channel creator-affiliate-pool build; canonical 5-payout creator-affiliate-structures [CPM $10-$30/1000-views / CPS 10-25%-of-GMV / flat-fee $200-$2k/creator/post / hybrid 5%-of-GMV + $200-base-fee / product-seeding-only $0 + free-product]).",
      "Step 4: LIVE-shopping-launch + 4-hour-week-LIVE-cadence (LIVE-shopping-studio-build $500-$2k one-time [Ring-light + iPhone-15-Pro + tripod + lavalier-mic + backdrop + teleprompter-app + LIVE-streaming-software Streamlabs-OBS-or-TikTok-LIVE-Studio $0/mo] + 1 LIVE-session-per-week 60-90-minutes per session + 5-segment-LIVE-show-runner-script-template [Segment 1 product-intro + Segment 2 demo + Segment 3 Q&A + Segment 4 creator-guest-takeover + Segment 5 closing-limited-time-offer] per asset 19).",
      "Step 5: Wire Klaviyo-TikTok-channel-full-integration ($0 with Klaviyo-Standard; $45/mo with Klaviyo-Email-and-SMS) + Triple-Whale-Starter-or-Pro ($179-$1,290/mo) for TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow + TikTok-Shop-cohort-LTV-overlay [TikTok-Shop-driven-cohort vs organic-DTC-cohort vs paid-Meta-cohort at 30/60/90-day windows].",
      "Step 6: Shop-Score-4.8+-audit-process (positive-review-rate >=95% / ship-on-time-rate >=95% / return-rate <=5% / chat-response-rate >=90% / chat-response-time <=5-min per asset 19 §Shop-Score-4.8+-audit-template) + LIVE-cadence-optimization-flow + Triple-Whale-cohort-LTV-iteration-cycle-weekly + graduate-to-Path-C decision at $500k-$1M first-year TikTok-Shop-GMV threshold.",
    ];
  }
  return [
    "Step 1: TikTok-Shop-Seller-Center-onboarding + category-approval-application + all-Path-B-onboarding-pack (research/11 §8-prereq TikTok-Shop-onboarding-pack).",
    "Step 2: Hire/contract dedicated-creator-affiliate-manager $4k-$6k/mo + scale-creator-affiliate-pool to >=100 via TikTok-Shop-Creator-Marketplace + Aspire-agency + Collabstr + Instagram-hashtag-scrape + Move-#15-affiliate-program-Refersion-pool cross-pollination.",
    "Step 3: Daily-LIVE-cadence-build (3-5-sessions/week with rotating-creator-guest-takeovers per asset 19 §5-segment-LIVE-show-runner-script) + LIVE-show-production-cost $300-$1k/session budget + dedicated-studio-buildout $5k-$10k.",
    "Step 4: Launch TikTok-Shop-affiliate-program (separate from creator-affiliate-onboarding in Path A/B) with 20-30%-of-GMV commission + 30-day-cookie-window per Move-#15-affiliate-program-Playbook-16-benchmarks + Klaviyo-TikTok-channel-full-integration $45/mo + Triple-Whale-Pro $1,290/mo.",
    "Step 5: TikTok-Shop-Analytics-Pro subscription $99-$499/mo + dedicated-cohort-LTV-team + Triple-Whale-Pro-cohort-overlay-iteration (TikTok-Shop-driven-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV weekly-iteration-cycle).",
    "Step 6: Shop-Score-4.8+-steady-state + LIVE-cohort-LTV-multiplier-optimization (4-7× per LIVE_COHORT_LTV_MULTIPLIER Path C) + Spark-Ads-ROAS-optimization (3-5× per SPARK_ADS_ROAS_BANDS Path C) + Top-View-Ads-launch ($50k-$200k/day for major-product-launches-and-pr-events; canonical Path C-only-lever).",
  ];
}

export function recommendPath(inputs: TikTokShopInputs): TikTokShopRecommendation {
  const deferReasons: string[] = [];
  const downgradeReasons: string[] = [];

  // Defer gates
  if (inputs.hasLiveShoppingStudioCapacityHoursPerWeek < LIVE_CAPACITY_GATE_HR_WK) {
    deferReasons.push(
      `LIVE-shopping-studio capacity ${inputs.hasLiveShoppingStudioCapacityHoursPerWeek} hr/wk < ${LIVE_CAPACITY_GATE_HR_WK} hr/wk floor (research/11 §Prerequisites Gate A prereq 5 + playbook 18 §8-prereq gate); TikTok Shop / live-commerce launch deferred until LIVE-cadence-capacity is available.`,
    );
  }
  if (inputs.skuCount < MIN_SKU_COUNT) {
    deferReasons.push(
      `SKU count ${inputs.skuCount} < ${MIN_SKU_COUNT} floor (Jungle Scout 2024 TikTok-Shop-product-feed-baseline: 10+ SKUs is the canonical minimum for any TikTok Shop / live-commerce program to generate attributable revenue); launch deferred until SKU-broadness improves.`,
    );
  }
  if (inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT) {
    deferReasons.push(
      `Gross margin ${inputs.grossMarginPct.toFixed(1)}% < ${MIN_GROSS_MARGIN_PCT}% floor (research/11 §Prerequisites: 25%+ TikTok-Shop-margin-headroom needed for TikTok-Shop-takes 8%-commission + creator-affiliate 10-25%-of-GMV + shipping-subsidy 5-15%-of-AOV = 30-50% of GMV cost-stack); launch deferred until margin improves.`,
    );
  }
  if (!inputs.hasTiktokBusinessAccount) {
    deferReasons.push(
      `TikTok Business Account not active (research/11 §Prerequisites Gate A prereq 1: TikTok-Business-Account is the canonical entry point for any TikTok Shop / live-commerce program — TikTok for Business 2024 free signup); launch deferred until account is live.`,
    );
  }
  if (!inputs.hasShopifyTiktokChannel) {
    deferReasons.push(
      `Shopify-TikTok-Channel not wired (research/11 §Prerequisites Gate A prereq 6: Shopify-TikTok-Channel is the canonical product-feed substrate for TikTok-Shop-onboarding — $0/mo); launch deferred until channel is wired.`,
    );
  }
  if (inputs.creatorAffiliatePoolSize < MIN_CREATOR_AFFILIATE_POOL_SIZE) {
    deferReasons.push(
      `Creator-affiliate-pool size ${inputs.creatorAffiliatePoolSize} < ${MIN_CREATOR_AFFILIATE_POOL_SIZE} floor (playbook 18 §Phase 1: 20-50 creator-affiliate-pool-baseline via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape; brands with <10 pool should defer); launch deferred until creator-affiliate-pool grows.`,
    );
  }
  if (inputs.usDtcGmv < PATH_A_FLOOR) {
    deferReasons.push(
      `US DTC GMV $${inputs.usDtcGmv.toLocaleString("en-US")} < $${PATH_A_FLOOR.toLocaleString("en-US")} Path A floor — TikTok Shop / live-commerce launch deferred until DTC-substrate-is-steady-state (canonical 8-prereq TikTok-Shop-onboarding-pack from research/11 §Prerequisites + playbook 18 §8-prereq gate). Path A surfaced as audit only.`,
    );
  }

  const basePath = tierForGmv(inputs.usDtcGmv);
  let candidate: PathName = basePath;

  // Downgrade gates
  if (
    !inputs.hasTripleWhaleTiktokAttribution &&
    PATH_RANK[candidate] > PATH_RANK["A"]
  ) {
    const newRank = Math.max(PATH_RANK[candidate] - 1, PATH_RANK["A"]);
    downgradeReasons.push(
      `Triple-Whale-TikTok-attribution not wired — Triple-Whale-TikTok-cohort-overlay is the canonical attribution substrate (research/11 Pillar 5); without it undercount TikTok-Shop-driven-DTC-attribution by 30-50% per Triple-Whale 2024 benchmarks. Downgrade one tier ${candidate} → ${RANK_PATH[newRank]}.`,
    );
    candidate = RANK_PATH[newRank];
  }
  if (
    inputs.voiceProfile === "luxury" &&
    !inputs.hasKlaviyoTiktokChannel &&
    PATH_RANK[candidate] > PATH_RANK["A"]
  ) {
    const newRank = Math.max(PATH_RANK[candidate] - 1, PATH_RANK["A"]);
    downgradeReasons.push(
      `Luxury-voice without Klaviyo-TikTok-channel — MAP-policy-guardrails + creator-brief-guardrails gate (research/11 Pillar 2 + asset 19 §5-payout-structures + 16 CFR Part 255 compliance). Downgrade one tier ${candidate} → ${RANK_PATH[newRank]}.`,
    );
    candidate = RANK_PATH[newRank];
  }
  if (
    inputs.voiceProfile === "b2b" &&
    inputs.creatorAffiliatePoolSize < 50 &&
    PATH_RANK[candidate] > PATH_RANK["A"]
  ) {
    const newRank = Math.max(PATH_RANK[candidate] - 1, PATH_RANK["A"]);
    downgradeReasons.push(
      `B2B-voice with creator-affiliate-pool ${inputs.creatorAffiliatePoolSize} < 50 floor — B2B-voice-without-wholesale-channel gate (research/11 Pillar 2 + asset 19 §5-payout-structures). Downgrade one tier ${candidate} → ${RANK_PATH[newRank]}.`,
    );
    candidate = RANK_PATH[newRank];
  }
  if (
    inputs.voiceProfile === "gen_z" &&
    inputs.hasLiveShoppingStudioCapacityHoursPerWeek < 8 &&
    PATH_RANK[candidate] > PATH_RANK["A"]
  ) {
    const newRank = Math.max(PATH_RANK[candidate] - 1, PATH_RANK["A"]);
    downgradeReasons.push(
      `Gen-Z-voice with LIVE-shopping-studio-capacity ${inputs.hasLiveShoppingStudioCapacityHoursPerWeek} hr/wk < 8 floor — Gen-Z-voice-without-TikTok-content-cadence gate (research/11 Pillar 4 + asset 19 §5-segment-LIVE-show-runner-script); Gen-Z-audience requires daily-or-near-daily TikTok-content-cadence per eMarketer 2024 benchmarks. Downgrade one tier ${candidate} → ${RANK_PATH[newRank]}.`,
    );
    candidate = RANK_PATH[newRank];
  }
  if (
    candidate === "C" &&
    inputs.hasLiveShoppingStudioCapacityHoursPerWeek < PATH_C_LIVE_CAPACITY_FLOOR
  ) {
    downgradeReasons.push(
      `Path C with LIVE-shopping-studio-capacity ${inputs.hasLiveShoppingStudioCapacityHoursPerWeek} hr/wk < ${PATH_C_LIVE_CAPACITY_FLOOR} hr/wk floor — full TikTok-Shop-orchestration requires daily-LIVE-cadence (3-5-sessions/week); brands with <8 hr/wk should run Path B with 4-hour-week-cadence. Downgrade Path C → Path B.`,
    );
    candidate = "B";
  }

  const finalPath = candidate;
  const downgraded = finalPath !== basePath;

  const [cost_ot_low, cost_ot_high, cost_rec_low, cost_rec_high] = PATH_COSTS[finalPath];
  const year1_cost_low = cost_ot_low + cost_rec_low;
  const year1_cost_high = cost_ot_high + cost_rec_high;

  const [gm_share_low, gm_share_high] = PATH_INCREMENTAL_GMV_SHARE_PCT[finalPath];
  const year1_incremental_gmv_low = inputs.usDtcGmv * (gm_share_low / 100);
  const year1_incremental_gmv_high = inputs.usDtcGmv * (gm_share_high / 100);

  const [live_ltv_low, live_ltv_high] = LIVE_COHORT_LTV_MULTIPLIER[finalPath];
  const [spark_roas_low, spark_roas_high] = SPARK_ADS_ROAS_BANDS[finalPath];
  const [roi_low, roi_high] = PATH_ROI[finalPath];

  // Build justification
  const summaryParts: string[] = [];
  if (deferReasons.length > 0) summaryParts.push(...deferReasons);
  if (downgradeReasons.length > 0) {
    summaryParts.push(`Downgrade gates applied: ${downgradeReasons.join(" ")}`);
  }
  summaryParts.push(
    `Path ${finalPath} recommendation: ${PATH_PLATFORMS[finalPath][0]} + creator-affiliate-pool + LIVE-shopping-cadence + Triple-Whale-TikTok-cohort-overlay. Cost stack $${cost_ot_low.toLocaleString("en-US")}-$${cost_ot_high.toLocaleString("en-US")} one-time + $${cost_rec_low.toLocaleString("en-US")}-$${cost_rec_high.toLocaleString("en-US")}/mo recurring. Year-1 incremental TikTok-Shop GMV $${year1_incremental_gmv_low.toLocaleString("en-US", { maximumFractionDigits: 0 })}-$${year1_incremental_gmv_high.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${gm_share_low.toFixed(1)}-${gm_share_high.toFixed(1)}% of US DTC GMV); Year-1 ROI ${roi_low.toFixed(1)}-${roi_high.toFixed(1)}×; LIVE-cohort-LTV multiplier ${live_ltv_low.toFixed(1)}-${live_ltv_high.toFixed(1)}×; Spark-Ads-ROAS ${spark_roas_low.toFixed(1)}-${spark_roas_high.toFixed(1)}×. Default platform pick: ${PATH_DEFAULT_PLATFORM_PICK[finalPath]}.`,
  );

  return {
    path: finalPath,
    basePath,
    downgraded,
    deferReasons,
    downgradeReasons,
    platforms: [...PATH_PLATFORMS[finalPath]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[finalPath],
    justification: summaryParts.join(" "),
    costOneTimeLow: cost_ot_low,
    costOneTimeHigh: cost_ot_high,
    costRecurringLow: cost_rec_low,
    costRecurringHigh: cost_rec_high,
    year1CostLow: year1_cost_low,
    year1CostHigh: year1_cost_high,
    year1IncrementalGmvSharePctLow: gm_share_low,
    year1IncrementalGmvSharePctHigh: gm_share_high,
    year1IncrementalGmvLow: year1_incremental_gmv_low,
    year1IncrementalGmvHigh: year1_incremental_gmv_high,
    liveCohortLtvMultiplierLow: live_ltv_low,
    liveCohortLtvMultiplierHigh: live_ltv_high,
    sparkAdsRoasLow: spark_roas_low,
    sparkAdsRoasHigh: spark_roas_high,
    year1RoiLow: roi_low,
    year1RoiHigh: roi_high,
    creatorAffiliatePayoutMatrix: { ...CREATOR_AFFILIATE_PAYOUT_MATRIX },
    buildSequence: buildSequenceForPath(finalPath),
  };
}

// ----- Markdown rendering -----------------------------------------------------

export function renderTikTokShopMarkdown(rec: TikTokShopRecommendation): string {
  const lines: string[] = [];
  lines.push(`# TikTok Shop Path ${rec.path} recommendation`);
  if (rec.downgraded) {
    lines.push("");
    lines.push(
      `> ⚠️ Downgraded from base Path ${rec.basePath} (one or more downgrade gates fired — see below).`,
    );
  }
  lines.push("");
  lines.push(`**Default platform pick:** ${rec.defaultPlatformPick}`);
  lines.push("");
  lines.push("## Cost stack");
  lines.push(
    `- One-time: $${rec.costOneTimeLow.toLocaleString("en-US")} – $${rec.costOneTimeHigh.toLocaleString("en-US")}`,
  );
  lines.push(
    `- Recurring: $${rec.costRecurringLow.toLocaleString("en-US")} – $${rec.costRecurringHigh.toLocaleString("en-US")}/mo`,
  );
  lines.push(
    `- Year-1 cost: $${rec.year1CostLow.toLocaleString("en-US")} – $${rec.year1CostHigh.toLocaleString("en-US")}`,
  );
  lines.push("");
  lines.push("## Year-1 outcomes");
  lines.push(
    `- Incremental TikTok-Shop GMV: $${Math.round(rec.year1IncrementalGmvLow).toLocaleString("en-US")} – $${Math.round(rec.year1IncrementalGmvHigh).toLocaleString("en-US")} (${rec.year1IncrementalGmvSharePctLow.toFixed(1)}-${rec.year1IncrementalGmvSharePctHigh.toFixed(1)}% of US DTC GMV)`,
  );
  lines.push(`- Year-1 ROI: ${rec.year1RoiLow.toFixed(1)}-${rec.year1RoiHigh.toFixed(1)}×`);
  lines.push(
    `- LIVE-cohort LTV multiplier: ${rec.liveCohortLtvMultiplierLow.toFixed(1)}-${rec.liveCohortLtvMultiplierHigh.toFixed(1)}×`,
  );
  lines.push(
    `- Spark-Ads ROAS: ${rec.sparkAdsRoasLow.toFixed(1)}-${rec.sparkAdsRoasHigh.toFixed(1)}×`,
  );
  lines.push("");
  lines.push("## Platforms");
  for (const p of rec.platforms) lines.push(`- ${p}`);
  lines.push("");
  lines.push("## Creator-affiliate payout matrix (5 voices × 3 tiers)");
  for (const [voice, payout] of Object.entries(rec.creatorAffiliatePayoutMatrix)) {
    lines.push(`- ${voice}: ${payout}`);
  }
  lines.push("");
  lines.push("## 6-step build sequence");
  for (const step of rec.buildSequence) lines.push(`- ${step}`);
  if (rec.deferReasons.length > 0) {
    lines.push("");
    lines.push("## Defer reasons");
    for (const d of rec.deferReasons) lines.push(`- ${d}`);
  }
  if (rec.downgradeReasons.length > 0) {
    lines.push("");
    lines.push("## Downgrade reasons");
    for (const d of rec.downgradeReasons) lines.push(`- ${d}`);
  }
  return lines.join("\n");
}
