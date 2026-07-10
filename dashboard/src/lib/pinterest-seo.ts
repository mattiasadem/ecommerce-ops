// pinterest-seo.ts — Path A / B / C scorer for the Pinterest-organic-discovery
// + SEO-content-engine track (Move #17 companion script).
//
// Direct TypeScript port of `scripts/pinterest_seo_unit_economics.py`. The
// operator enters 12 inputs (US DTC GMV, SKU count, SKU archetype distribution,
// gross margin %, 7 platform-integration booleans, voice profile, operator
// capacity hr/wk) and the panel picks one of the 3 canonical paths (A / B / C)
// with the cost stack + Year-1 incremental Pinterest-SEO-traffic band +
// CAC vs paid-social multiplier + 12-24-month compounding-traffic-curve
// steady-state projection + 6-step build sequence for the recommended path.
//
// Defaults match the Python CLI's $2M US DTC Path B default (Gen-Z voice,
// 35 SKUs, balanced archetype, 50% gross margin, all integrations live except
// MarketMuse, 6 hr/wk operator capacity).
//
// Math is byte-identical to the Python CLI: scoring rule (Path A floor $100k,
// Path B floor $500k DEFAULT, Path C floor $5M), 6 hard-deferral gates (capacity
// <4 hr/wk, SKU count <10, gross margin <25%, has_pinterest_business_account
// =False, has_shopify_seo_app=False, has_dedicated_..._capacity <4 hr/wk), 3
// downgrade gates (Path C capacity <8 hr/wk, luxury without Originality.ai,
// B2B without Ahrefs-Content-Gap), and 6-step build sequence per Path.

export type PathName = "A" | "B" | "C";
export type VoiceProfile =
  | "default"
  | "luxury"
  | "sustainable"
  | "gen_z"
  | "b2b";
export type SkuArchetype =
  | "hero_mid_long_tail"
  | "balanced"
  | "long_tail_heavy";

// ----- Brand input / path recommendation dataclasses ----------------------

export interface BrandPinterestSeoInputs {
  usDtcGmv: number;
  skuCount: number;
  skuArchetypeDistribution: SkuArchetype;
  grossMarginPct: number;
  hasPinterestBusinessAccount: boolean;
  hasShopifySeoApp: boolean;
  hasSurferSeoSubscription: boolean;
  hasAhrefsContentGap: boolean;
  hasOriginalityAiSubscription: boolean;
  hasMarketmuseTopicalAuthority: boolean;
  voiceProfile: VoiceProfile;
  hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek: number;
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
  year1IncrementalPinterestSeoTrafficSharePctLow: number;
  year1IncrementalPinterestSeoTrafficSharePctHigh: number;
  year1IncrementalPinterestSeoTrafficLow: number;
  year1IncrementalPinterestSeoTrafficHigh: number;
  cacVsPaidSocialMultiplierLow: number;
  cacVsPaidSocialMultiplierHigh: number;
  organicContentPillarMatrix: Record<string, string>;
  pinterestCvrUpliftLow: number;
  pinterestCvrUpliftHigh: number;
  organicTrafficGrowthMultipleLow: number;
  organicTrafficGrowthMultipleHigh: number;
  compoundingTrafficCurveMonthsLow: number;
  compoundingTrafficCurveMonthsHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  buildSequence: string[];
}

// ----- Canonical path-tier + cost-stack + projection tables ---------------

export const PATH_A_FLOOR = 100_000.0;
export const PATH_B_FLOOR = 500_000.0;
export const PATH_C_FLOOR = 5_000_000.0;
export const MIN_SKU_COUNT = 10;
export const MIN_GROSS_MARGIN_PCT = 25.0;
export const CAPACITY_GATE_HR_WK = 4;
export const PATH_C_CAPACITY_HR_WK = 8;
export const LUXURY_DOWNGRADE_ENABLED = true;
export const B2B_DOWNGRADE_ENABLED = true;
export const PATH_C_CAPACITY_DOWNGRADE_ENABLED = true;

// (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high)
export const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0.0, 2_000.0, 50.0, 100.0],
  B: [500.0, 3_000.0, 200.0, 1_000.0],
  C: [2_000.0, 10_000.0, 1_000.0, 5_000.0],
};

export const PATH_INCREMENTAL_TRAFFIC_SHARE_PCT: Record<
  PathName,
  [number, number]
> = {
  A: [2.5, 12.5],
  B: [10.0, 50.0],
  C: [10.0, 50.0],
};

export const PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER: Record<
  PathName,
  [number, number]
> = {
  A: [0.6, 0.85],
  B: [0.6, 0.85],
  C: [0.4, 0.7],
};

export const PATH_ORGANIC_TRAFFIC_GROWTH_MULTIPLE: Record<
  PathName,
  [number, number]
> = {
  A: [2.0, 5.0],
  B: [5.0, 15.0],
  C: [10.0, 25.0],
};

export const PATH_PINTEREST_CVR_UPLIFT: Record<PathName, [number, number]> = {
  A: [1.5, 3.0],
  B: [3.0, 5.0],
  C: [4.0, 6.0],
};

export const PATH_COMPOUNDING_CURVE_MONTHS: Record<PathName, [number, number]> =
  {
    A: [6, 12],
    B: [12, 24],
    C: [18, 24],
  };

export const PATH_ROI: Record<PathName, [number, number]> = {
  A: [5.0, 8.0],
  B: [4.0, 8.0],
  C: [3.0, 5.0],
};

export const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "Pinterest-Business-Account free + Catalogs-feed-upload + Idea-Pin-creation",
    "Shopify-SEO built-in free (or Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo)",
    "Ahrefs-Content-Gap-Starter $99/mo",
    "Surfer-SEO-Lite free (manual content-optimization)",
  ],
  B: [
    "Path A platform set +",
    "Surfer-SEO-Pro $89/mo (AI-content-optimization + NLP-keywords-coverage)",
    "Ahrefs-Content-Gap-Pro $199/mo",
    "Originality.ai-Pro $60/mo (AI-content-detection + helpful-content-update-compliance-audit)",
    "MarketMuse-Starter $300/mo (topical-authority-methodology + content-pruning)",
    "Triple-Whale-Starter $179/mo (organic-cohort-LTV-overlay)",
    "Klaviyo-Standard-with-organic-source-segment $0-$45/mo (Pinterest-driven-cart-abandon + SEO-driven-welcome-flow)",
    "Pinterest-Catalog-ads-5%-of-budget (organic-best-performer-amplifier)",
  ],
  C: [
    "Path B platform set +",
    "MarketMuse-Enterprise $3k/mo (topical-authority-at-scale)",
    "Originality.ai-Enterprise $500/mo (compliance-validation-at-scale)",
    "Triple-Whale-Pro $1,290/mo (organic-LTV-iteration-at-scale)",
    "Ahrefs-Advanced $399/mo",
    "Surfer-SEO-Business (AI-content-optimization-at-scale)",
    "Dedicated organic content team $4k-$6k/mo (8-16 hr/wk capacity)",
  ],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "Pinterest-Business-Account free + Shopify-SEO built-in free + Ahrefs-Content-Gap-Starter $99/mo (default Path A; $50-$100/mo total cost stack for $100k-$500k GMV brands with photography-rich-product-set + 5+ hr/wk content-operator-capacity — canonical starter-bundle for organic-discovery-launch)",
  B: "Pinterest-Business-Account + Shopify-SEO built-in + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Originality.ai-Pro + MarketMuse-Starter + Triple-Whale-Starter + Klaviyo-organic-source-segment + Pinterest-Catalog-ads-5%-of-budget (default Path B; $200-$1k/mo total cost stack for $500k-$5M GMV brands with 4-8 hr/wk content-operator-capacity — canonical DEFAULT for $2M US DTC brand per research/13 §GMV-tier paths + playbook 20 §Phase 2)",
  C: "Path B + MarketMuse-Enterprise + Originality.ai-Enterprise + Triple-Whale-Pro + Ahrefs-Advanced + Surfer-SEO-Business + dedicated-organic-content-team (default Path C; $1k-$5k/mo total cost stack for $5M+ GMV brands with dedicated-organic-content-team + 8-16 hr/wk content-operator-capacity — canonical enterprise-bundle for organic-orchestration-launch at scale)",
};

// ----- 5-pillar organic-content pillar matrix (5 voices × 5 pillars) -------

export const ORGANIC_CONTENT_PILLAR_MATRIX: Record<
  string,
  Record<VoiceProfile, string>
> = {
  "Pillar 1 — Pinterest-platform-foundation + Catalogs-feed-upload + Idea-Pin-creation": {
    default:
      "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics (Default voice — balanced beginner-friendly cadence)",
    luxury:
      "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + organic-disclosure-consistency-check (Luxury voice — disclosure-required for affiliate-creator-paid-placement per FTC 2024)",
    sustainable:
      "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + sustainable-keyword-spike-+35%-research (Sustainable voice — Pinterest-2024-keyword-spike-+35% per sustainability-vertical per Pinterest Predicts 2024)",
    gen_z:
      "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + Gen-Z-keyword-vertical-research (Gen-Z voice — 40%+ audience-skew + 3-5× higher Pinterest-CVR per Pinterest 2024)",
    b2b: "Pinterest-Business-Account + Catalogs-feed-upload + Idea-Pin-format-vertical-9:16 + 5-photos-per-product + Pinterest-Analytics + B2B-keyword-cluster-research (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
  "Pillar 2 — SEO-content-cluster-architecture + Surfer-SEO + Ahrefs-Content-Gap": {
    default:
      "5-cluster-topical-authority (5 Pillar-pages + 40-cluster-articles per Pillar = 200-articles) + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro (Default voice — canonical 200-article-target per MarketMuse 2024 + Ahrefs 2024)",
    luxury:
      "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + organic-disclosure-consistency (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated for helpful-content-update-compliance)",
    sustainable:
      "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + sustainable-keyword-universe (Sustainable voice — sustainable-keyword-spike-+35%-target per Pinterest Predicts 2024)",
    gen_z:
      "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Gen-Z-keyword-vertical (Gen-Z voice — Gen-Z-keyword-spike-+30%-YoY-target per SEMrush 2024)",
    b2b:
      "5-cluster-topical-authority + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + B2B-keyword-cluster + long-tail-B2B-keywords (B2B voice — required for the canonical B2B-downgrade gate; 60-180-day sales-cycle content-pruning)",
  },
  "Pillar 3 — Pinterest-vertical-pillar-set + Idea-Pin-cadence + Catalogs-feed-optimization": {
    default:
      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + 10-Idea-Pins-per-week cadence (Default voice — 200-Idea-Pin vertical-pillar-set baseline per Pinterest 2024)",
    luxury:
      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + organic-disclosure-pinned-format (Luxury voice — MAP-policy-guardrails for affiliate-creator-paid-placement per FTC 16 CFR Part 255)",
    sustainable:
      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + sustainable-mission-disclosure (Sustainable voice — sustainability-keyword-density-elevated)",
    gen_z:
      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + Gen-Z-trend-driven-cadence (Gen-Z voice — Gen-Z-trend-driven-cadence with 10-Idea-Pins-per-week baseline per Pinterest Predicts 2024)",
    b2b:
      "10-vertical-pillars × 15-product-Idea-Pins × 5-content-Idea-Pins = 200-Idea-Pins + 30-boards-organized-by-vertical-pillar + B2B-case-study-Idea-Pin-format (B2B voice — B2B-case-study-format with 60-180-day content-pruning)",
  },
  "Pillar 4 — Triple-Whale-organic-LTV + Originality.ai-AI-content-detection + helpful-content-update-compliance-audit": {
    default:
      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro-Starter + helpful-content-update-compliance-audit-quarterly (Default voice — canonical Triple-Whale 30-50%-attribution-correction + Google 2024 + Originality.ai 2024 compliance-validation)",
    luxury:
      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + elevated-E-E-A-T-signals (Luxury voice — luxury-E-E-A-T-signals required for helpful-content-update-compliance per Google 2024)",
    sustainable:
      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + sustainable-claims-verification (Sustainable voice — sustainable-claims-verification-compliance per FTC Green Guides 2024)",
    gen_z:
      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + Gen-Z-trend-driven-content (Gen-Z voice — Gen-Z-trend-driven-content + helpful-content-update-compliance)",
    b2b:
      "Triple-Whale-organic-cohort-LTV-overlay-wire + Originality.ai-Pro + B2B-factually-accuracy-validation + E-E-A-T-author-byline (B2B voice — B2B-factually-accuracy-validation + E-E-A-T-author-byline + author-bios-with-relevant-experience per Google 2024 + helpful-content-update-compliance)",
  },
  "Pillar 5 — Triple-Whale-organic-LTV-iteration + Originality.ai-validation-cycle + Pinterest-Catalog-ads-paid-amplifier": {
    default:
      "5-way-comparison-cycle (Pinterest-organic-driven-cohort-LTV vs SEO-organic-driven-cohort-LTV vs paid-Meta-cohort-LTV vs paid-Google-cohort-LTV vs paid-TikTok-cohort-LTV at 30/60/90/180-day windows) + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget (Default voice — canonical Triple-Whale 2024 30-50% organic-attribution-correction + Pinterest-Catalog-ads-2-3× ROAS Path B + 30-50%-incremental-organic-conversion-rate)",
    luxury:
      "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + MAP-policy-guardrails (Luxury voice — MAP-policy-guardrails required per FTC 16 CFR Part 255)",
    sustainable:
      "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + mission-disclosure (Sustainable voice — mission-disclosure + sustainable-keyword-density-elevated)",
    gen_z:
      "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
    b2b:
      "5-way-comparison-cycle + Originality.ai-30-day-validation-cycle + Pinterest-Catalog-ads-5%-of-budget + B2B-case-study-format (B2B voice — B2B-case-study-format + long-tail-content-style + 60-180-day content-pruning-cadence)",
  },
};

// ----- 6-step build sequence per Path -------------------------------------

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1: Pinterest-Business-Account onboarding — Pinterest-Business-Account free + Catalogs-feed-upload + Idea-Pin-creation + Pinterest-Analytics with 1:1-square-product-image-1000px+ + 1.91:1-product-image-secondary-1000px+ + product-description-500-char-with-keywords + 100%-product-tagging.",
    "Step 2: Shopify-SEO-baseline-audit — Shopify-SEO built-in free OR Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo + SEO-baseline-audit [meta-titles + meta-descriptions + heading-structure + image-alt-text + schema-markup + sitemap-generation + canonical-tags + 404-redirects + page-speed-baseline-50+ on PageSpeed-Insights per Ahrefs 2024 + SEMrush 2024 benchmarks].",
    "Step 3: Build first-SEO-content-cluster — 1 Pillar-page + 8-cluster-articles around long-tail-keyword-set like 'sustainable-resort-wear for women' + 4-trigger-cross-link-architecture using Surfer-SEO-Lite free for content-optimization [content-score-target-≥70 + NLP-keywords-coverage + heading-density + meta-data + image-alt-text + content-length-2000+-words + readability-Flesch-60-70].",
    "Step 4: Pin first-20-Idea-Pins — 10-pins-per-week cadence per Pinterest 2024 + Ahrefs-2024-case-studies with vertical-9:16-format + 10-second-product-demo + 1-CTA + destination-link-to-product-page + pin-description-500-char-with-keywords + 100%-product-tagging.",
    "Step 5: Ahrefs-Content-Gap-Starter wire-up — domain-rating-baseline + 30-keyword-universe-baseline + keyword-difficulty-≤40 for new-Pillar-pages + ≤20 for new-cluster-articles + competitor-domain-comparison-baseline per Ahrefs 2024 + SEMrush 2024 benchmarks.",
    "Step 6: Iterate Pinterest-SEO-traffic-compounding-curve-baseline — 5-15% incremental-traffic-contribution + 0.6-0.85× CAC vs paid-social + 6-12-month-compounding-curve-baseline + graduate-to-Path-B-after-6-12-months-as-Pinterest-SEO-traffic-compounding-curve-scales.",
  ],
  B: [
    "Step 1: Path A foundation — Pinterest-Business-Account + Shopify-SEO-baseline-audit + first-SEO-content-cluster + first-20-Pinterest-Idea-Pins + Ahrefs-Content-Gap-Starter baseline-wired (canonical Path A prerequisite stack).",
    "Step 2: Wire Surfer-SEO-Pro $89/mo + Ahrefs-Content-Gap-Pro $199/mo — AI-content-optimization [content-score-target-≥70 + NLP-keywords-coverage-≥80% + heading-density-target-1-H1-3-H2-per-cluster + meta-data-target-50-char-+-150-char + image-alt-text-100%-coverage + content-length-2000+-words + readability-Flesch-60-70] + competitive-content-gap-analysis [identify-keyword-gaps-vs-3-competitors + 30-content-gap-keywords-per-quarter]. This is the canonical Surfer-SEO-content-optimization + Ahrefs-Content-Gap integration per research/13 Pillar 2.",
    "Step 3: Originality.ai-Pro $60/mo wire-up — Originality.ai-AI-content-detection [>50%-AI-content = risk-of-deindexing per Google's March-2024-core-update / <30%-AI-content = safe / 100%-human-written = safest] + helpful-content-update-compliance-audit [semantic-relevance + people-first-content + E-E-A-T-signals [experience + expertise + authoritativeness + trustworthiness] + ad-revenue-not-primary-goal + factually-accurate + satisfying-user-search-intent per Google 2024 + Search-Engine-Roundtable 2024 benchmarks] + 30-day-AI-content-detection-validation-cycle.",
    "Step 4: MarketMuse-Starter $300/mo wire-up — SEO-5-cluster-topical-authority [5 Pillar-pages + 40-cluster-articles per Pillar = 200-articles across 5 topical-clusters covering root-keyword + 50-derived-long-tail-keywords-per-cluster + 20-question-keywords-per-cluster + semantic-LSI-keyword-universe] + topical-authority-score-target-≥80 + content-quality-score-target-≥70 + content-density-target-≥5-keywords-per-cluster + internal-link-density-target-3-internal-links-per-article per MarketMuse 2024 + Backlinko 2024 benchmarks.",
    "Step 5: Triple-Whale-Starter $179/mo + Klaviyo-Standard-with-organic-source-segment wire-up — Triple-Whale-organic-cohort-LTV-overlay [Pinterest-organic-driven-cohort-LTV + SEO-organic-driven-cohort-LTV vs paid-Meta-cohort-LTV vs paid-Google-cohort-LTV vs paid-TikTok-cohort-LTV at 30/60/90/180-day windows; iterate SEO-content-cluster + Pinterest-vertical-pillar based on canonical-organic-LTV-ranking] + Klaviyo-organic-source-segment [Pinterest-organic-segment + SEO-organic-segment with 30-day-LTV-by-segment per Triple-Whale 2024 + Klaviyo 2024 benchmarks].",
    "Step 6: Pinterest-Catalog-ads-5%-of-budget paid-amplifier — Pinterest-Catalog-ads-paid-amplifier-of-organic-best-performer-5%-of-budget per Pinterest-for-Business-2024 [2-3× ROAS vs in-feed-ads-without-product-catalog + 1.5× ROAS vs non-organic-amplifier-Catalog-ads + 30-50% incremental-organic-conversion-rate]. + Pinterest-vertical-pillar-set [10-vertical-pillars × 15-product-Idea-Pins-per-pillar × 5-content-Idea-Pins-per-pillar = 200-Idea-Pins total] + quarterly-content-pruning-canonical-process per Ahrefs-2024-content-pruning-recipe [>500-clicks-monthly = keep-and-expand / 100-500-clicks-monthly = optimize-with-content-pruning / <100-clicks-monthly = remove-and-301-to-pillar-page]. Compounds 12-24-month-compounding-traffic-curve baseline.",
  ],
  C: [
    "Step 1: Path B foundation — Pinterest-Business-Account + Shopify-SEO + Surfer-SEO-Pro + Ahrefs-Content-Gap-Pro + Originality.ai-Pro + MarketMuse-Starter + Triple-Whale-Starter + Klaviyo-organic-source-segment + Pinterest-Catalog-ads-5%-of-budget (canonical Path B prerequisite stack + Path A foundation).",
    "Step 2: MarketMuse-Enterprise $3k/mo + Originality.ai-Enterprise $500/mo wire-up — MarketMuse-Enterprise at-scale-topical-authority-methodology + content-pruning-canonical-process at scale per MarketMuse 2024 + Originality.ai 2024 benchmarks; Originality.ai-Enterprise at-scale-AI-content-detection + helpful-content-update-compliance-audit-cadence at scale per Google 2024 + Search-Engine-Roundtable-2024-benchmarks. This is the canonical enterprise-tier wire-up per research/13 Path C.",
    "Step 3: Triple-Whale-Pro $1,290/mo + Ahrefs-Advanced $399/mo wire-up — Triple-Whale-Pro at-scale-organic-cohort-LTV-overlay + Pinterest-driven-cart-abandon + Pinterest-driven-welcome-flow + Pinterest-cohort-LTV-iteration-cycle-quarterly per Triple-Whale 2024; Ahrefs-Advanced at-scale-competitive-content-gap-analysis + backlink-analysis + content-pruning-canonical-process per Ahrefs 2024. Critical for 5-way-comparison-cycle at scale.",
    "Step 4: Surfer-SEO-Business wire-up — Surfer-SEO-Business at-scale-AI-content-optimization + NLP-keywords-coverage-at-scale + heading-density-at-scale + content-length-2000+-words + readability-Flesch-60-70 + content-pruning-canonical-process-quarterly per Surfer-SEO-2024-case-studies. Compounds the Path B Surfer-SEO-Pro with at-scale throughput.",
    "Step 5: Hire dedicated organic content team $4k-$6k/mo — 8-16 hr/wk dedicated-organic-content-team per research/13 Pillar 5 + playbook 20 Phase 4 for 12-24-month organic-build-out-cycle. Path C requires dedicated-team; without it, downgrade to Path B. The team handles Pinterest-Idea-Pin-creative-assets + SEO-content-articles + Triple-Whale-organic-LTV-iteration + Originality.ai-AI-content-detection-validation + Pinterest-Catalog-ads-amplifier + content-pruning-cadence.",
    "Step 6: Steady-state + Topical-Authority-≥80 + 12-24-month-compounding-traffic-curve-steady-state — Topical-Authority-≥80-score-monitoring [MarketMuse-topical-authority-score-target-≥80 across all 5 topical-clusters] + Pinterest-Catalog-ads-paid-amplifier-steady-state-5%-of-budget + quarterly-content-refresh-cadence [refresh-top-10-Pinterest-Idea-Pins-every-90-days + update-top-20-SEO-articles-every-90-days-with-originality.ai-AI-content-detection-validation] + Triple-Whale-organic-LTV-iteration-cycle-quarterly + 12-24-month-compounding-traffic-curve-steady-state achieves 5-10× lower-CAC-Year-2+ vs paid-social per Ahrefs 2024 + Pinterest 2024 + SEMrush 2024 + Triple-Whale 2024 + MarketMuse 2024 benchmarks.",
  ],
};

// ----- Defaults (Python CLI --defaults) -----------------------------------

export const PINTEREST_SEO_DEFAULTS: BrandPinterestSeoInputs = {
  usDtcGmv: 2_000_000,
  skuCount: 35,
  skuArchetypeDistribution: "balanced",
  grossMarginPct: 50.0,
  hasPinterestBusinessAccount: true,
  hasShopifySeoApp: true,
  hasSurferSeoSubscription: true,
  hasAhrefsContentGap: true,
  hasOriginalityAiSubscription: true,
  hasMarketmuseTopicalAuthority: false,
  voiceProfile: "gen_z",
  hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek: 6,
};

// ----- Helper: tier assignment --------------------------------------------

function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  return "A";
}

// ----- Validation (mirrors Python __post_init__) --------------------------

export function validatePinterestSeoInputs(
  inputs: BrandPinterestSeoInputs,
): string | null {
  if (inputs.usDtcGmv < 0) {
    return `us_dtc_gmv must be >= 0 (got ${inputs.usDtcGmv}); brands with $0 GMV should defer Pinterest-SEO until the live Shopify store is shipping.`;
  }
  if (inputs.skuCount < 0) {
    return `sku_count must be >= 0 (got ${inputs.skuCount}); pre-launch brands should defer Pinterest-SEO until at least 10 SKUs are live in the catalog.`;
  }
  if (inputs.grossMarginPct < 0 || inputs.grossMarginPct > 100) {
    return `gross_margin_pct must be 0-100 (got ${inputs.grossMarginPct}); a brand with <25% gross margin should defer Pinterest-SEO until margin improves.`;
  }
  if (
    inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek < 0
  ) {
    return `has_dedicated_pinterest_seo_content_operator_capacity_hours_per_week must be >= 0 (got ${inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek}).`;
  }
  const validVoices: VoiceProfile[] = [
    "default",
    "luxury",
    "sustainable",
    "gen_z",
    "b2b",
  ];
  if (!validVoices.includes(inputs.voiceProfile)) {
    return `voice_profile must be one of ${validVoices.join("|")} (got '${inputs.voiceProfile}').`;
  }
  const validArchetypes: SkuArchetype[] = [
    "hero_mid_long_tail",
    "balanced",
    "long_tail_heavy",
  ];
  if (!validArchetypes.includes(inputs.skuArchetypeDistribution)) {
    return `sku_archetype_distribution must be one of ${validArchetypes.join("|")} (got '${inputs.skuArchetypeDistribution}').`;
  }
  return null;
}

// ----- Core scoring rule (recommend_path) ---------------------------------

export function recommendPath(
  inputs: BrandPinterestSeoInputs,
): PathRecommendation {
  const justificationParts: string[] = [];

  // 5 hard-deferral gates (each adds a justification segment if fired).
  if (
    inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek <
    CAPACITY_GATE_HR_WK
  ) {
    justificationParts.push(
      `Operator capacity ${inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek} hr/wk < ${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 20 §Prereq + asset 21 §cadence + research/13 Pillar 5); Pinterest-SEO-content-engine program deferred until operator capacity is available (canonical 4-8 hr/wk Path B minimum; brand should defer or outsource to MarketerHire $1k-$5k/mo / Verblio $0.05-$0.20/word per research/13 §Path B).`,
    );
  }
  if (inputs.skuCount < MIN_SKU_COUNT) {
    justificationParts.push(
      `SKU count ${inputs.skuCount} < ${MIN_SKU_COUNT} floor (research/13 §Prereq + playbook 20 §Prereq; Pinterest-SEO requires ≥10-SKUs for Pinterest-Idea-Pin vertical-pillar-set + SEO-content-cluster coverage; brands with <10-SKUs should defer until SKU-broadness improves OR bundle Kits to reach the threshold); Pinterest-SEO-content-engine program deferred until SKU-broadness is met.`,
    );
  }
  if (inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT) {
    justificationParts.push(
      `Gross margin ${inputs.grossMarginPct.toFixed(1)}% < ${MIN_GROSS_MARGIN_PCT.toFixed(1)}% floor (research/13 §Prereq; Pinterest-SEO consumes $200-$1k/mo cost stack for Surfer-SEO + Ahrefs + Originality.ai + MarketMuse + Triple-Whale + dedicated-content-operator-time + Idea-Pin-creative-assets + Pinterest-Catalog-ads-5%-of-budget; a brand with <${MIN_GROSS_MARGIN_PCT.toFixed(1)}% gross margin should defer Pinterest-SEO until margin improves OR offer organic-only-product-set at higher price-point); Pinterest-SEO-content-engine program deferred until gross margin improves.`,
    );
  }
  if (!inputs.hasPinterestBusinessAccount) {
    justificationParts.push(
      "has_pinterest_business_account=False (research/13 Pillar 1 + playbook 20 §Prerequisite #1: Pinterest-Business-Account + Pinterest-Catalogs-feed-upload + Idea-Pin-creation + Pinterest-Analytics + Pinterest-Catalog-ads-as-paid-amplifier + Pinterest-SEO-Insights is the canonical Pinterest-platform-foundation prerequisite for $100k+ GMV brands; without it, Pinterest-Idea-Pin vertical-pillar-set + Pinterest-Catalogs-feed-optimization + Pinterest-Catalog-ads-paid-amplifier cannot execute); Pinterest-SEO-content-engine program deferred until Pinterest-Business-Account is onboarded.",
    );
  }
  if (!inputs.hasShopifySeoApp) {
    justificationParts.push(
      "has_shopify_seo_app=False (research/13 Pillar 2 + playbook 20 §Prerequisite #2: Shopify-SEO built-in free OR Avada-SEO $30-$99/mo OR Plug-In-SEO $20-$50/mo is the canonical Shopify-SEO-baseline-audit prerequisite for $100k+ GMV brands; without it, SEO-baseline-audit + first-SEO-content-cluster + Pinterest-Idea-Pin-creative-assets + Pinterest-vertical-pillar-set cannot be optimized for helpful-content-update-compliance per Google 2024); Pinterest-SEO-content-engine program deferred until Shopify-SEO-app is installed.",
    );
  }

  // Base tier assignment.
  let path = tierForGmv(inputs.usDtcGmv);

  // 3 soft-downgrade gates (luxury without Originality.ai, B2B without
  // Ahrefs-Content-Gap, Path C with capacity <8 hr/wk).
  if (
    PATH_C_CAPACITY_DOWNGRADE_ENABLED &&
    path === "C" &&
    inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek <
      PATH_C_CAPACITY_HR_WK
  ) {
    const newRank = PATH_RANK[path] - 1;
    const newPath = RANK_PATH[Math.max(newRank, 0)];
    justificationParts.push(
      `Path C requires dedicated-organic-content-team ≥${PATH_C_CAPACITY_HR_WK} hr/wk (research/13 Pillar 5 + playbook 20 Phase 4); brand has ${inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek} hr/wk < ${PATH_C_CAPACITY_HR_WK} hr/wk. Path C downgraded to Path ${newPath}.`,
    );
    path = newPath;
  }

  if (
    LUXURY_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "luxury" &&
    !inputs.hasOriginalityAiSubscription
  ) {
    const newRank = PATH_RANK[path] - 1;
    const newPath = RANK_PATH[Math.max(newRank, 0)];
    justificationParts.push(
      `voice_profile='luxury' without has_originality_ai_subscription=True (research/13 Pillar 4 + playbook 20 §Prereq + asset 21 §luxury-voice-density; luxury-voice brands need elevated organic-disclosure-consistency + E-E-A-T-signals + factually-accuracy-validation for helpful-content-update-compliance per Google 2024 + Originality.ai 2024 — without Originality.ai-Pro, luxury-content organic-disclosure-consistency is forfeited and Google March-2024-core-update + June-2024-spam-brain-update deindexing-risk elevates to >30% per Google 2024 benchmarks). Path downgraded from ${RANK_PATH[PATH_RANK[path]]} to ${newPath}.`,
    );
    path = newPath;
  }

  if (
    B2B_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "b2b" &&
    !inputs.hasAhrefsContentGap
  ) {
    const newRank = PATH_RANK[path] - 1;
    const newPath = RANK_PATH[Math.max(newRank, 0)];
    justificationParts.push(
      `voice_profile='b2b' without has_ahrefs_content_gap=True (research/13 Pillar 2 + playbook 20 §Prereq + asset 21 §B2B-voice-density; B2B-voice brands need B2B-keyword-cluster + long-tail-B2B-keywords + 60-180-day-sales-cycle-aware content-pruning per Ahrefs 2024 + SEMrush 2024 benchmarks — without Ahrefs-Content-Gap-Pro, B2B-keyword-universe competitor-gap analysis is forfeited and SEO-page-1-rankings plateau at 30-50% of maximum per Ahrefs 2024 benchmarks). Path downgraded to ${newPath}.`,
    );
    path = newPath;
  }

  // Cost stack + projection from canonical path tables.
  const [
    costOneTimeLow,
    costOneTimeHigh,
    costRecurringLow,
    costRecurringHigh,
  ] = PATH_COSTS[path];
  const [
    incrementalShareLow,
    incrementalShareHigh,
  ] = PATH_INCREMENTAL_TRAFFIC_SHARE_PCT[path];
  const [cacLow, cacHigh] = PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER[path];
  const [growthLow, growthHigh] = PATH_ORGANIC_TRAFFIC_GROWTH_MULTIPLE[path];
  const [cvrLow, cvrHigh] = PATH_PINTEREST_CVR_UPLIFT[path];
  const [compLow, compHigh] = PATH_COMPOUNDING_CURVE_MONTHS[path];
  const [roiLow, roiHigh] = PATH_ROI[path];
  const year1CostLow = costOneTimeLow + costRecurringLow * 12.0;
  const year1CostHigh = costOneTimeHigh + costRecurringHigh * 12.0;
  const incrementalTrafficLow = inputs.usDtcGmv * (incrementalShareLow / 100.0);
  const incrementalTrafficHigh =
    inputs.usDtcGmv * (incrementalShareHigh / 100.0);

  // 5-pillar organic-content pillar matrix (per voice profile).
  const organicContentPillarMatrix: Record<string, string> = {};
  for (const [pillar, matrix] of Object.entries(ORGANIC_CONTENT_PILLAR_MATRIX)) {
    organicContentPillarMatrix[pillar] = matrix[inputs.voiceProfile];
  }

  const baseJustification = `Path ${path} recommended for $${inputs.usDtcGmv.toLocaleString("en-US")} US DTC GMV with ${inputs.skuCount} SKUs and ${inputs.voiceProfile} voice profile (research/13 §GMV-tier paths + playbook 20 §Phase 1+2+3+4 + asset 21 §5-voice organic-content-pillar-matrix).`;
  const justification =
    justificationParts.length > 0
      ? justificationParts.join(" | ")
      : baseJustification;

  return {
    path,
    platforms: [...PATH_PLATFORMS[path]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification,
    costOneTimeLow,
    costOneTimeHigh,
    costRecurringLow,
    costRecurringHigh,
    year1CostLow,
    year1CostHigh,
    year1IncrementalPinterestSeoTrafficSharePctLow: incrementalShareLow,
    year1IncrementalPinterestSeoTrafficSharePctHigh: incrementalShareHigh,
    year1IncrementalPinterestSeoTrafficLow: incrementalTrafficLow,
    year1IncrementalPinterestSeoTrafficHigh: incrementalTrafficHigh,
    cacVsPaidSocialMultiplierLow: cacLow,
    cacVsPaidSocialMultiplierHigh: cacHigh,
    organicContentPillarMatrix,
    pinterestCvrUpliftLow: cvrLow,
    pinterestCvrUpliftHigh: cvrHigh,
    organicTrafficGrowthMultipleLow: growthLow,
    organicTrafficGrowthMultipleHigh: growthHigh,
    compoundingTrafficCurveMonthsLow: compLow,
    compoundingTrafficCurveMonthsHigh: compHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    buildSequence: [...BUILD_SEQUENCE_TEMPLATES[path]],
  };
}

// ----- Per-path revenue projection (project_per_path_revenue) --------------

export interface PerPathRevenue {
  usDtcGmv: number;
  year1IncrementalPinterestSeoTrafficPctMid: number;
  year1IncrementalPinterestSeoTrafficLow: number;
  year1IncrementalPinterestSeoTrafficMid: number;
  year1IncrementalPinterestSeoTrafficHigh: number;
  cacVsPaidSocialMultiplierMid: number;
  organicTrafficGrowthMultipleMid: number;
  pinterestCvrUpliftMid: number;
  compoundingTrafficCurveMonthsMid: number;
  perArticleTrafficMid: number;
  articleCountMid: number;
  year1PlatformCostLow: number;
  year1PlatformCostMid: number;
  year1PlatformCostHigh: number;
  year1DedicatedOperatorCostMid: number;
  year1PinterestCatalogAdsCostMid: number;
  year1ContentProductionCostMid: number;
  year1IdeaPinCreativeAssetsCostMid: number;
  year1TripleWhaleOrganicLtvOverlayCostMid: number;
  totalYear1CostMid: number;
  roiMid: number;
}

export function projectPerPathRevenue(
  inputs: BrandPinterestSeoInputs,
  rec: PathRecommendation,
): PerPathRevenue {
  const shareMid =
    (rec.year1IncrementalPinterestSeoTrafficSharePctLow +
      rec.year1IncrementalPinterestSeoTrafficSharePctHigh) /
    2.0;
  const cacMid =
    (rec.cacVsPaidSocialMultiplierLow + rec.cacVsPaidSocialMultiplierHigh) /
    2.0;
  const growthMid =
    (rec.organicTrafficGrowthMultipleLow +
      rec.organicTrafficGrowthMultipleHigh) /
    2.0;
  const cvrMid = (rec.pinterestCvrUpliftLow + rec.pinterestCvrUpliftHigh) / 2.0;
  const compMid =
    (rec.compoundingTrafficCurveMonthsLow +
      rec.compoundingTrafficCurveMonthsHigh) /
    2.0;

  const year1IncrementalTrafficMid = inputs.usDtcGmv * (shareMid / 100.0);
  const articleCountMid = 200; // 5-cluster × 40-articles-per-cluster Path B+ baseline
  const perArticleTrafficMid =
    articleCountMid > 0 ? year1IncrementalTrafficMid / articleCountMid : 0.0;

  const year1CostMid = (rec.year1CostLow + rec.year1CostHigh) / 2.0;
  const contentProductionCostMid = 30_000.0; // 200-articles × $100 + 200-Idea-Pins × $50; Path B baseline
  const pinterestCatalogAdsBudgetMid = inputs.usDtcGmv * 0.05; // 5%-of-GMV per research/13 §Path B
  const dedicatedOperatorCostMid = 2_000.0; // 4-8 hr/wk × $25/hr × 50 wk = $5k/yr; Path B baseline $2k share-of-time
  const ideaPinCreativeAssetsCostMid = 1_500.0; // one-time-vertical-9:16-photo-bundle + product-photo-refresh cadence
  const tripleWhaleOrganicLtvOverlayCostMid = Math.max(
    2_148.0,
    inputs.usDtcGmv * 0.001,
  ); // Triple-Whale-Starter-or-Pro (floor $179/mo = $2,148/yr)

  const totalYear1CostMid =
    year1CostMid +
    contentProductionCostMid +
    pinterestCatalogAdsBudgetMid +
    dedicatedOperatorCostMid +
    ideaPinCreativeAssetsCostMid +
    tripleWhaleOrganicLtvOverlayCostMid;

  const roiMid =
    totalYear1CostMid > 0 ? year1IncrementalTrafficMid / totalYear1CostMid : 0.0;

  return {
    usDtcGmv: inputs.usDtcGmv,
    year1IncrementalPinterestSeoTrafficPctMid: shareMid,
    year1IncrementalPinterestSeoTrafficLow: rec.year1IncrementalPinterestSeoTrafficLow,
    year1IncrementalPinterestSeoTrafficMid: year1IncrementalTrafficMid,
    year1IncrementalPinterestSeoTrafficHigh: rec.year1IncrementalPinterestSeoTrafficHigh,
    cacVsPaidSocialMultiplierMid: cacMid,
    organicTrafficGrowthMultipleMid: growthMid,
    pinterestCvrUpliftMid: cvrMid,
    compoundingTrafficCurveMonthsMid: compMid,
    perArticleTrafficMid,
    articleCountMid,
    year1PlatformCostLow: rec.year1CostLow,
    year1PlatformCostMid: year1CostMid,
    year1PlatformCostHigh: rec.year1CostHigh,
    year1DedicatedOperatorCostMid: dedicatedOperatorCostMid,
    year1PinterestCatalogAdsCostMid: pinterestCatalogAdsBudgetMid,
    year1ContentProductionCostMid: contentProductionCostMid,
    year1IdeaPinCreativeAssetsCostMid: ideaPinCreativeAssetsCostMid,
    year1TripleWhaleOrganicLtvOverlayCostMid: tripleWhaleOrganicLtvOverlayCostMid,
    totalYear1CostMid,
    roiMid,
  };
}

// ----- Markdown report (byte-identical to Python render_human()) ----------

function padNum(n: number, width: number, decimals?: number): string {
  const formatted =
    decimals !== undefined ? n.toFixed(decimals) : Math.round(n).toString();
  return formatted.padStart(width);
}

function padStr(s: string, width: number): string {
  return s.padEnd(width);
}

export function renderPinterestSeoMarkdown(
  inputs: BrandPinterestSeoInputs,
  rec: PathRecommendation,
): string {
  const lines: string[] = [];
  lines.push("Pinterest-SEO Path A/B/C recommendation");
  lines.push("==================================================");
  lines.push("");
  lines.push("Inputs:");
  lines.push(
    `  US DTC GMV                              : $${padNum(inputs.usDtcGmv, 13, 0)}`,
  );
  lines.push(`  SKU count                               : ${padNum(inputs.skuCount, 13)}`);
  lines.push(
    `  SKU archetype distribution              : ${padStr(inputs.skuArchetypeDistribution, 20)}`,
  );
  lines.push(
    `  Gross margin (%)                         : ${padNum(inputs.grossMarginPct, 13, 1)}%`,
  );
  lines.push(
    `  Has Pinterest-Business-Account          : ${padStr(String(inputs.hasPinterestBusinessAccount), 17)}`,
  );
  lines.push(
    `  Has Shopify-SEO app                     : ${padStr(String(inputs.hasShopifySeoApp), 17)}`,
  );
  lines.push(
    `  Has Surfer-SEO subscription             : ${padStr(String(inputs.hasSurferSeoSubscription), 17)}`,
  );
  lines.push(
    `  Has Ahrefs-Content-Gap subscription     : ${padStr(String(inputs.hasAhrefsContentGap), 17)}`,
  );
  lines.push(
    `  Has Originality.ai subscription         : ${padStr(String(inputs.hasOriginalityAiSubscription), 17)}`,
  );
  lines.push(
    `  Has MarketMuse topical-authority        : ${padStr(String(inputs.hasMarketmuseTopicalAuthority), 17)}`,
  );
  lines.push(
    `  Voice profile                            : ${padStr(inputs.voiceProfile, 20)}`,
  );
  lines.push(
    `  Operator capacity (hr/wk)               : ${padNum(inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek, 13)}`,
  );
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(
    `  Platforms                               : ${rec.platforms.length} platform(s) in scope`,
  );
  for (const platform of rec.platforms) {
    lines.push(`    - ${platform}`);
  }
  lines.push(
    `  Default platform pick                   : ${rec.defaultPlatformPick}`,
  );
  lines.push(`  Justification                           : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)               : $${padNum(rec.costOneTimeLow, 10, 0)} - $${padNum(rec.costOneTimeHigh, 0, 0)}`,
  );
  lines.push(
    `  Recurring monthly (low-high)            : $${padNum(rec.costRecurringLow, 10, 0)} - $${padNum(rec.costRecurringHigh, 0, 0)}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  Year-1 cost (low-high)                  : $${padNum(rec.year1CostLow, 10, 0)} - $${padNum(rec.year1CostHigh, 0, 0)}`,
  );
  lines.push(
    `  Incremental traffic share (low-high)    : ${rec.year1IncrementalPinterestSeoTrafficSharePctLow.toFixed(1)}% - ${rec.year1IncrementalPinterestSeoTrafficSharePctHigh.toFixed(1)}%`,
  );
  lines.push(
    `  Incremental traffic $ (low-high)        : $${padNum(rec.year1IncrementalPinterestSeoTrafficLow, 10, 0)} - $${padNum(rec.year1IncrementalPinterestSeoTrafficHigh, 0, 0)}`,
  );
  lines.push(
    `  CAC vs paid-social multiplier (low-high): ${rec.cacVsPaidSocialMultiplierLow.toFixed(2)}x - ${rec.cacVsPaidSocialMultiplierHigh.toFixed(2)}x`,
  );
  lines.push(
    `  Organic-traffic growth multiple (low-hi): ${rec.organicTrafficGrowthMultipleLow.toFixed(1)}x - ${rec.organicTrafficGrowthMultipleHigh.toFixed(1)}x`,
  );
  lines.push(
    `  Pinterest-CVR uplift (low-high)         : ${rec.pinterestCvrUpliftLow.toFixed(1)}x - ${rec.pinterestCvrUpliftHigh.toFixed(1)}x`,
  );
  lines.push(
    `  Compounding-curve months (low-high)     : ${rec.compoundingTrafficCurveMonthsLow} - ${rec.compoundingTrafficCurveMonthsHigh}`,
  );
  lines.push(
    `  Year-1 ROI                              : ${rec.year1RoiLow.toFixed(1)}:1 - ${rec.year1RoiHigh.toFixed(1)}:1`,
  );
  lines.push("");
  lines.push("5-pillar organic-content matrix (per voice):");
  for (const [pillar, value] of Object.entries(rec.organicContentPillarMatrix)) {
    lines.push(`  ${pillar}`);
    lines.push(`    ${value}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}

// ----- Badge + label helpers ----------------------------------------------

export function pathBadgeClasses(path: PathName): string {
  // Path B (DEFAULT) gets the strongest emerald; Path A gets sky; Path C
  // gets violet — mirrors the welcome-series + b2b-wholesale + 3pl palette.
  if (path === "A")
    return "rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-300";
  if (path === "B")
    return "rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300";
  return "rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-violet-700 dark:text-violet-300";
}

export function pathLongLabel(path: PathName): string {
  if (path === "A")
    return "SMB Pinterest-SEO solo (Pinterest-Business-Account + Shopify-SEO built-in)";
  if (path === "B")
    return "Mid-market Pinterest-SEO + Triple-Whale organic-LTV (Surfer-SEO + Ahrefs + Originality.ai + MarketMuse + Triple-Whale + Klaviyo organic-source-segment)";
  return "Enterprise organic-orchestration (Path B + MarketMuse-Enterprise + Originality.ai-Enterprise + Triple-Whale-Pro + Ahrefs-Advanced + dedicated-content-team)";
}

export function voiceBadgeClasses(voice: VoiceProfile): string {
  // Voice profile chips — distinct palette per voice.
  if (voice === "luxury")
    return "rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300";
  if (voice === "sustainable")
    return "rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300";
  if (voice === "gen_z")
    return "rounded border border-fuchsia-500/40 bg-fuchsia-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300";
  if (voice === "b2b")
    return "rounded border border-indigo-500/40 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-300";
  return "rounded border border-slate-500/40 bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300";
}