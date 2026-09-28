/**
 * Amazon-DSP + Amazon-Attribution Path A / B / C scorer — direct TypeScript
 * port of `/scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py`.
 *
 * Used by the interactive `<AmazonDspPathCalculator />` component on the
 * `/amazon-dsp-amazon-attribution-audit` page. The math, defaults,
 * thresholds, and 6-step build sequence strings are kept byte-identical
 * to the Python CLI so an operator can sanity-check the same numbers in
 * the browser and the terminal without drift.
 *
 * Companion to:
 * - /research/14-amazon-dsp-amazon-attribution-audit.md (the 5-pillar framework + 3 GMV-tier paths)
 * - /playbooks/21-amazon-dsp-amazon-attribution-audit-launch.md (4-phase launch ladder)
 * - /assets/22-amazon-dsp-amazon-attribution-audit-templates.md (5 voices × 6 SKU archetypes = 30 cells)
 * - /dashboard/app/amazon-dsp-amazon-attribution-audit/page.tsx (operator-surface route)
 *
 * Scoring rule (mirrors research/14 §GMV-tier paths + playbook 21 §Prerequisites):
 *  - us_dtc_gmv < $100k                                  → defer (Path A surfaced as audit only)
 *  - us_dtc_gmv $100k-$5M                                → Path A (Sponsored-Products + Brand-Registry + Halo-defense-via-Brand-Registry-only)
 *  - us_dtc_gmv $5M-$25M                                 → Path B DEFAULT (Amazon-DSP + Halo-defense-programmatic-display + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge 3:1 default Year-1 ROI)
 *  - us_dtc_gmv $25M+                                    → Path C (full-Amazon-DSP-omnichannel-programmatic-display + Halo-defense + AMC-cohort-iteration + advanced-Amazon-Brand-Analytics-measurement 2.5:1 muted)
 *  - sku_count < 5                                       → defer (canonical 5+ Amazon-listed hero SKUs)
 *  - hero_sku_count < 5                                  → defer (canonical 5+ Amazon-listed hero SKUs for Amazon-DSP-launch)
 *  - gross_margin_pct < 25%                              → defer (canonical 25%+ Amazon-DSP-margin-headroom)
 *  - has_amazon_seller_central_account = False           → defer
 *  - has_brand_registry_trademark = False                → defer
 *  - has_amazon_attribution_pro_or_advanced_tools = False → defer
 *  - has_dsp_managed_service_or_self_serve_account = False → defer
 *  - voice_profile = "luxury" w/o has_halo_defense_creative_assets → downgrade one tier
 *  - voice_profile = "b2b" w/o has_amazon_attribution_pro_or_advanced_tools → downgrade one tier
 *  - path = "C" AND has_amazon_attribution_pro_or_advanced_tools = False → downgrade to Path B
 */

export type PathName = "A" | "B" | "C";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";

export interface AmazonDspInputs {
  usDtcGmv: number;
  marketplaceGmvPct: number; // 0..100
  skuCount: number;
  heroSkuCount: number;
  grossMarginPct: number; // 0..100
  hasAmazonSellerCentralAccount: boolean;
  hasBrandRegistryTrademark: boolean;
  hasAmazonAttributionProOrAdvancedTools: boolean;
  hasDspManagedServiceOrSelfServeAccount: boolean;
  voiceProfile: VoiceProfile;
  hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek: number;
  hasHaloDefenseCreativeAssets: boolean;
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
  year1IncrementalHaloDefenseRevenueSharePctLow: number;
  year1IncrementalHaloDefenseRevenueSharePctHigh: number;
  year1IncrementalHaloDefenseRevenueLow: number;
  year1IncrementalHaloDefenseRevenueHigh: number;
  cacVsPaidSocialMultiplierLow: number;
  cacVsPaidSocialMultiplierHigh: number;
  brandSearchVolumeLiftMultipleLow: number;
  brandSearchVolumeLiftMultipleHigh: number;
  amcCohortOverlayResolutionLiftMultipleLow: number;
  amcCohortOverlayResolutionLiftMultipleHigh: number;
  haloDefenseRatePctLow: number;
  haloDefenseRatePctHigh: number;
  haloAttributionModelingMaturityMonthsLow: number;
  haloAttributionModelingMaturityMonthsHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  amazonDspPillarMatrix: Record<string, string>;
  buildSequence: string[];
}

// ----- Canonical thresholds (research/14 §Path A/B/C) --------------------

const PATH_A_FLOOR = 100_000;
const PATH_B_FLOOR = 5_000_000;
const PATH_C_FLOOR = 25_000_000;

const MIN_SKU_COUNT = 5;
const MIN_HERO_SKU_COUNT = 5;
const MIN_GROSS_MARGIN_PCT = 25;
const CAPACITY_GATE_HR_WK = 4;

const LUXURY_DOWNGRADE_ENABLED = true;
const B2B_DOWNGRADE_ENABLED = true;
const PATH_C_DSP_DOWNGRADE_ENABLED = true;

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

// [cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high]
const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0, 2_000, 500, 1_000],
  B: [2_000, 25_000, 1_000, 5_000],
  C: [10_000, 50_000, 5_000, 25_000],
};

const PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [1.0, 4.0],
  B: [2.0, 30.0],
  C: [5.0, 30.0],
};

const PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER: Record<PathName, [number, number]> = {
  A: [0.7, 1.0],
  B: [0.5, 0.7],
  C: [0.4, 0.6],
};

const PATH_BRAND_SEARCH_VOLUME_LIFT_MULTIPLE: Record<PathName, [number, number]> = {
  A: [1.5, 3.0],
  B: [5.0, 10.0],
  C: [8.0, 15.0],
};

const PATH_AMC_COHORT_OVERLAY_RESOLUTION_LIFT_MULTIPLE: Record<PathName, [number, number]> = {
  A: [1.0, 1.5],
  B: [2.0, 3.0],
  C: [3.0, 5.0],
};

const PATH_HALO_DEFENSE_RATE_PCT: Record<PathName, [number, number]> = {
  A: [15.0, 25.0],
  B: [25.0, 40.0],
  C: [30.0, 45.0],
};

const PATH_HALO_ATTRIBUTION_MODELING_MATURITY_MONTHS: Record<PathName, [number, number]> = {
  A: [0, 6],
  B: [6, 12],
  C: [12, 24],
};

const PATH_ROI: Record<PathName, [number, number]> = {
  A: [3.0, 4.0],
  B: [3.5, 35.0],
  C: [2.0, 3.0],
};

const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "Amazon-Ads-Console-self-serve-Sponsored-Products + Sponsored-Brands ($500-$1k/mo)",
    "Amazon-Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire",
    "Amazon-Seller-Central-account-active (5+ listed-SKUs)",
    "Amazon-Creative-Assets-specs baseline-build per Amazon-Creative-Assets-2024 (1 SKU × 5-spec bundle)",
  ],
  B: [
    "Path A platform set +",
    "Amazon-DSP-account-onboard via Amazon-Ads-Console-self-serve-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service ($0 self-serve OR $2k-$10k/mo managed-service)",
    "Amazon-Audiences-Insights-engaged-shoppers-recent-30-day audience-segment-launch with $1k-$5k/mo-programmatic-display-budget",
    "Amazon-Marketing-Cloud (AMC) cohort-overlay-instrumentation + 5-canonical-cohort-queries [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort]",
    "Amazon-Attribution-Pro-or-advanced-tools OR AMC-license OR 3rd-party-attribution-provider-Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua-Enterprise ($600/mo Pro OR AMC-license-direct OR $2k-$10k/mo 3rd-party) — Beta-deprecation-August-2025-migration",
    "Triple-Whale-Starter-or-Pro $179/mo-Starter-or-$1,290/mo-Pro with Amazon-cohort-overlay-wire + post-purchase-survey-with-Amazon-source-tracking",
    "Klaviyo-Standard-with-Amazon-source-segment $0-$45/mo (Amazon-source-cart-abandon + Amazon-source-welcome-flow + Amazon-source-cohort-LTV)",
    "Halo-defense-creative-assets-baseline 5+-Halo-defense-creative-assets-built-per-Amazon-Creative-Assets-2024-canonical-5-specs (5-second-static-banner + 5-second-video-9:16-1:1-16:9 + 3-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense])",
  ],
  C: [
    "Path B platform set +",
    "Amazon-Marketing-Cloud-Enterprise-direct-license ($1k-$5k/mo) with AMC-Enterprise-cohort-iteration-cycles-quarterly",
    "Amazon-Attribution-Enterprise OR Tinuiti-Enterprise OR Pacvue-Enterprise OR Helium-10-Enterprise OR Perpetua-Enterprise ($5k-$10k/mo) — full-3rd-party-attribution-provider-migration per Amazon-Attribution-2024-Beta-to-GA-migration-guide",
    "Triple-Whale-Pro $1,290/mo with AMC-cohort-overlay + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle",
    "Halo-defense-creative-asset-iteration-cycle-quarterly 50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense + sponsored-brands-video + sponsored-display-product + sponsored-brands-product]",
    "Brand-search-volume-lift-attribution-flow-via-Amazon-Marketing-Cloud-cohort-overlay + Brand-Analytics-engaged-daily-visitors-lift + Helium-10-brand-search-volume-lift-tracking",
    "Dedicated in-house-DSP-marketing-team $10k-$25k/mo OR fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise ($5k-$25k/mo) for $25M+ brands",
  ],
};

const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "Amazon-Ads-Console-self-serve-Sponsored-Products + Sponsored-Brands + Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire (default Path A; $500-$1k/mo total cost stack for <$5M DTC+Amazon brands with Amazon-Seller-Central-presence-only and no-DSP-budget-yet — canonical starter-bundle for Halo-defense-via-Brand-Registry-only pre-DSP ramp-up per research/14 §Path A)",
  B: "Amazon-Ads-Console-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service + Amazon-Audiences-Insights-engaged-shoppers + Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Starter-or-Pro + Klaviyo-Amazon-source-segment + Halo-defense-creative-assets-baseline 5+-Halo-defense-creative-assets-built-per-Amazon-Creative-Assets-2024-canonical-5-specs (default Path B; $1k-$5k/mo total cost stack for $5M-$25M DTC+Amazon brands with mature Amazon-presence + DSP-budget $500+/mo + Halo-defense-creative-assets-baseline — canonical DEFAULT for $5M US DTC + $10M Amazon base per research/14 §Path B + playbook 21 §Phase 2)",
  C: "Path B + Amazon-Marketing-Cloud-Enterprise-direct-license + Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise + Triple-Whale-Pro + Halo-defense-creative-asset-iteration-cycle-quarterly 50+-Halo-defense-creative-assets-pipelined + Brand-search-volume-lift-attribution-flow + dedicated-in-house-DSP-marketing-team-OR-fully-managed-service-Enterprise (default Path C; $5k-$25k/mo total cost stack for $25M+ DTC+Amazon brands with mature Amazon-presence + dedicated-in-house-DSP-marketing-team-capacity-OR-fully-managed-service-Enterprise — canonical enterprise-bundle for full-Amazon-DSP-orchestration at scale per research/14 §Path C + playbook 21 §Phase 4)",
};

// 5-pillar Amazon-DSP framework matrix (5 pillars × 5 voices). Mirrors
// the canonical research/14 §5-pillar framework matrix verbatim.
const AMAZON_DSP_PILLAR_MATRIX: Record<string, Record<VoiceProfile, string>> = {
  "Pillar 1 — Amazon-Ads-Console-onboard + Amazon-Band-Registry-trademark-defensive-levers + Amazon-DSP-account-onboard": {
    default: "Amazon-Ads-Console-self-serve $0 + Amazon-Brand-Registry-trademark-registered USPTO-or-equivalent + Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit (Default voice — canonical entry-point for $5M-$25M DTC+Amazon brands)",
    luxury: "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered-with-USPTO + Amazon-Creative-Assets-baseline-with-elevated-E-E-A-T-signals + Amazon-Audiences-Insights-luxury-keyword-rank-baseline (Luxury voice — disclosure-required for affiliate-creator-paid-placement per FTC 16 CFR Part 255)",
    sustainable: "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-sustainable-keyword-universe + Amazon-Audiences-Insights-sustainable-keyword-rank-baseline (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance per FTC Green Guides 2024)",
    gen_z: "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-Gen-Z-trend-driven-cadence + Amazon-Audiences-Insights-Gen-Z-keyword-vertical-baseline (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
    b2b: "Amazon-Ads-Console-self-serve-OR-managed-service + Amazon-Brand-Registry-trademark-registered + Amazon-Creative-Assets-baseline-with-B2B-case-study-format + Amazon-Audiences-Insights-B2B-keyword-cluster-baseline (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
  "Pillar 2 — Amazon-DSP-in-market-shoppers-audience-segment-launch + Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy": {
    default: "5-canonical-Amazon-DSP-audience-segments [in-market-shoppers + lifestyle-contextual + competitor-product-targeting + brand-defense + lookalike-audience] + fixed-CPM-bid-strategy-with-$0.50-$5.00-CPM-band + dynamic-CPM-with-50th-percentile-bid-per-Audience-Insights-engaged-shoppers (Default voice — canonical Path B 5-audience-segment baseline per Amazon-DSP 2024)",
    luxury: "5-canonical-Amazon-DSP-audience-segments + luxury-keyword-spacing + dynamic-CPM-with-50th-percentile-bid + organic-disclosure-consistency (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated for helpful-content-update-compliance)",
    sustainable: "5-canonical-Amazon-DSP-audience-segments + sustainable-keyword-universe + dynamic-CPM-with-50th-percentile-bid + mission-disclosure (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance per FTC Green Guides 2024)",
    gen_z: "5-canonical-Amazon-DSP-audience-segments + Gen-Z-keyword-vertical + dynamic-CPM-with-50th-percentile-bid + Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier + short-form-content-style)",
    b2b: "5-canonical-Amazon-DSP-audience-segments + B2B-keyword-cluster + dynamic-CPM-with-50th-percentile-bid + B2B-case-study-format (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
  "Pillar 3 — Amazon-Marketing-Cloud-cohort-overlay-launch + AMC-API-connection-or-Amazon-Attribution-Pro-or-advanced-tools-Postscript-merge": {
    default: "Amazon-Marketing-Cloud-API-connection-wire + 5-canonical-cohort-queries-build [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort] + Amazon-Attribution-Pro-or-advanced-tools-or-3rd-party-attribution-provider-migration-Beta-deprecation-August-2025 (Default voice — canonical Path B AMC-cohort-overlay per research/14 §Pillar 3 + playbook 21 §Phase 2)",
    luxury: "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Tinuiti-Enterprise + luxury-keyword-cluster-cohort-overlay (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated)",
    sustainable: "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Pacvue-Enterprise + sustainable-keyword-cohort-overlay (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
    gen_z: "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Pro-or-advanced-tools-OR-Helium-10-Enterprise + Gen-Z-keyword-cohort-overlay (Gen-Z voice — Gen-Z-trend-driven-amplifier + cohort-LTV)",
    b2b: "AMC-API-connection-wire + 5-canonical-cohort-queries + Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise + B2B-keyword-cluster-cohort-overlay (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
  "Pillar 4 — Amazon-Attribution-post-purchase-email-merge-recipe-launch + Halo-vs-direct-incremental-ACoS-measurement-launch": {
    default: "Post-purchase-survey-instrumentation-wire-Triple-Whale-Postscript-merge-or-Pacvue-or-Helium-10-post-purchase-survey-with-Amazon-source-tracking + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-build (Default voice — canonical Path B Halo-vs-direct-incremental-ACoS-measurement per research/14 §Pillar 4 + playbook 21 §Phase 3)",
    luxury: "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-elevated-E-E-A-T-signals (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals elevated)",
    sustainable: "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-sustainable-claims-verification (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
    gen_z: "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-post-purchase-email-merge-instrumentation + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-Gen-Z-trend-driven-amplifier (Gen-Z voice — Gen-Z-trend-driven-amplifier)",
    b2b: "Post-purchase-survey-instrumentation-wire + Amazon-Attribution-Enterprise-OR-3rd-party-attribution-provider + Klaviyo-Amazon-source-segment-integration + Halo-vs-direct-incremental-ACoS-measurement-flow-with-B2B-case-study-format (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
  "Pillar 5 — Halo-defense-creative-asset-iteration-cycle + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe": {
    default: "Halo-defense-creative-asset-iteration-cycle-quarterly + Brand-search-volume-lift-attribution-flow-build + Halo-defense-steady-state-creative-asset-library-50+-Halo-defense-creative-assets-pipelined-across-5-pillars + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Default voice — canonical Path B Halo-defense-steady-state per research/14 §Pillar 5 + playbook 21 §Phase 4)",
    luxury: "Halo-defense-creative-asset-iteration-cycle-quarterly-with-elevated-E-E-A-T-signals + Brand-search-volume-lift-attribution-flow-with-luxury-keyword-spacing + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Luxury voice — luxury-keyword-spacing + E-E-A-T-signals)",
    sustainable: "Halo-defense-creative-asset-iteration-cycle-quarterly-with-sustainable-claims-verification + Brand-search-volume-lift-attribution-flow-with-sustainable-keyword-universe + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Sustainable voice — sustainable-keyword-universe + claims-verification-compliance)",
    gen_z: "Halo-defense-creative-asset-iteration-cycle-quarterly-with-Gen-Z-trend-driven-amplifier + Brand-search-volume-lift-attribution-flow-with-Gen-Z-keyword-vertical + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe (Gen-Z voice — Gen-Z-trend-driven-amplifier)",
    b2b: "Halo-defense-creative-asset-iteration-cycle-quarterly-with-B2B-case-study-format + Brand-search-volume-lift-attribution-flow-with-B2B-keyword-cluster + Halo-defense-steady-state-creative-asset-library + 3rd-party-Amazon-DSP-manager-decision-recipe-with-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise (B2B voice — long-tail-B2B-keyword-universe + 60-180-day sales-cycle-aware)",
  },
};

// ----- Build-sequence recipe (mirrors scripts/...BUILD_SEQUENCE_TEMPLATES) -----

const BUILD_SEQUENCES: Record<PathName, string[]> = {
  A: [
    "Step 1: Amazon-Ads-Console-account-creation $0 self-serve-or-3rd-party-managed-service-onboarding — Amazon-Seller-Central-account-active-with-5+-listed-SKUs + Brand-Registry-trademark-registered-with-USPTO-or-equivalent + Buy-Box-ownership-on-hero-SKUs-≥90% per Amazon-Ad-Business-2024 + Amazon-Brand-Registry-2024 canonical-protective-mechanism. Path A is for $500k-$5M DTC+Amazon brands with Amazon-Seller-Central-presence-only and no-DSP-budget-yet.",
    "Step 2: Amazon-Brand-Registry-trademark-registration USPTO-or-equivalent $50-$500/SKU + Amazon-Brand-Analytics-access-wire + Halo-defense-levers-enabled + Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs (1 SKU × 5-spec bundle: 5-second-static-banner + 5-second-video-9:16-1:1-16:9). Brand-Registry-trademark-registered is the canonical Amazon-DSP-launch prerequisite.",
    "Step 3: Amazon-Creative-Assets-baseline-build per-Amazon-Creative-Assets-2024-canonical-5-specs + 3-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense] baseline-build per Amazon-Brand-Registry-2024-canonical-protective-mechanism — even Path A benefits from a 5+-Halo-defense-creative-assets-baseline.",
    "Step 4: Amazon-Audiences-Insights-engaged-shoppers-baseline-audit + Amazon-brand-keyword-rank + competitor-Amazon-keyword-rank baseline + Brand-Analytics-engaged-daily-visitors-lift-baseline per Amazon-Audiences-Insights-2024-canonical-launch-prerequisite. Path A graduates-to-Path-B after 4-8 weeks as Amazon-DSP-presence-improves.",
    "Step 5: Sponsored-Products + Sponsored-Brands baseline-launch — $500-$1k/mo Sponsored-Products-and-Sponsored-Brands-budget → $2k-$4k/mo incremental-Amazon-attributed-revenue = 4:1 conservative nominal ROI per Amazon-Ad-Business-2024 + Tinuiti-2024 benchmarks. Path A is the canonical pre-DSP ramp-up.",
    "Step 6: Iterate Halo-defense-via-Brand-Registry-only — 15-25% Halo-defense-rate at $1M-$5M Amazon-presence per Amazon-Brand-Registry-2024 + Pacvue-2024 case-studies; graduate-to-Path-B-after-4-8-weeks-as-Amazon-presence-reaches-$5M+-AND-DSP-budget-reaches-$500+/mo per research/14 §Path A → Path B graduation-criteria.",
  ],
  B: [
    "Step 1: Path A foundation — Amazon-Ads-Console-account-active + Amazon-Seller-Central-account-active + Brand-Registry-trademark-registered + Amazon-Brand-Analytics-access-wire + Amazon-Creative-Assets-baseline-build + Amazon-Audiences-Insights-engaged-shoppers-baseline-audit (canonical Path A prerequisite stack).",
    "Step 2: Amazon-DSP-account-onboard via Amazon-Ads-Console-self-serve-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service — $0 self-serve-OR-$2k-$10k/mo-managed-service-Tier-1 per Amazon-Ads-Console-2024-canonical-launch-prerequisite. Wire-Amazon-DSP-account-credentials + first-Amazon-DSP-in-market-shoppers-campaign-launch with $1k-$5k/mo-programmatic-display-budget.",
    "Step 3: Amazon-Marketing-Cloud-cohort-overlay-instrumentation-wire + 5-canonical-cohort-queries-build [Amazon-DSP-impression-cohort + Amazon-DSP-click-cohort + Amazon-DSP-engaged-shoppers-cohort + Halo-defense-impression-cohort + Halo-defense-click-cohort] per Amazon-Marketing-Cloud-2024 + Seller-Snap-2024-canonical-5-cohort-queries. This is the canonical Path B Halo-defense-cohort-overlay instrumentation.",
    "Step 4: Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider-migration-Beta-deprecation-August-2025 — Amazon-Attribution-Pro-or-advanced-tools-$600/mo-or-AMC-license-direct-or-Tinuiti-Enterprise-or-Pacvue-Enterprise-or-Helium-10-Enterprise-or-Perpetua-Enterprise per Amazon-Attribution-2024-Beta-to-GA-migration-guide. Wire-Amazon-Attribution-post-purchase-email-merge-recipe-instrumentation + Triple-Whale-Amazon-cohort-overlay + Klaviyo-Amazon-source-segment-integration.",
    "Step 5: Halo-defense-creative-asset-iteration-cycle-quarterly — 50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories [lifestyle-contextual + competitor-product-targeting + brand-defense + sponsored-brands-video + sponsored-display-product + sponsored-brands-product] refreshed-every-90-days per Amazon-Creative-Assets-2024-canonical-quarterly-refresh-cadence + Pacvue-2024 + Helium-10-2024 + Tinuiti-2024 benchmarks.",
    "Step 6: Steady-state + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe — Tier 1 managed-service-Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua $2k-$10k/mo for $5M+ brands per research/14 §Pillar 5 GMV-tier decision matrix. Compounds research/14 §Path B 3.5:1-35:1 Year-1 ROI band + $300k-$3M Path B incremental Halo-defense-revenue + 5-30% Year-1 incremental revenue + 0.5-0.7× CAC vs paid-social + 5-10× brand-search-volume-lift at $5M US DTC + $10M Amazon base per Amazon-Ad-Business-2024 + Tinuiti-2024 + Pacvue-2024 + Amazon-Marketing-Cloud-2024 + Amazon-Brand-Registry-2024 + Amazon-Attribution-2024 benchmarks.",
  ],
  C: [
    "Step 1: Path B foundation — Amazon-Ads-Console + Amazon-Seller-Central + Brand-Registry + Amazon-DSP-account + AMC-cohort-overlay + Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Pro + Klaviyo-Amazon-source-segment + Halo-defense-creative-assets-baseline (canonical Path B prerequisite stack + Path A foundation).",
    "Step 2: Amazon-Marketing-Cloud-Enterprise-direct-license-wire ($1k-$5k/mo) with AMC-Enterprise-cohort-iteration-cycles-quarterly + 5-canonical-cohort-queries at-scale per Amazon-Marketing-Cloud-2024-Enterprise-cohort-overlay-instrumentation. This is the canonical enterprise-tier wire-up per research/14 Path C.",
    "Step 3: Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise ($5k-$10k/mo) — full-3rd-party-attribution-provider-migration per Amazon-Attribution-2024-Beta-to-GA-migration-guide. Wire-Amazon-Attribution-Enterprise-cohort-overlay + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle.",
    "Step 4: Triple-Whale-Pro $1,290/mo + AMC-cohort-overlay-wire + paid-Meta-cohort-LTV-vs-Amazon-DSP-cohort-LTV-vs-paid-Google-cohort-LTV 5-way-comparison-cycle at scale + Halo-vs-direct-incremental-ACoS-measurement-with-Bayesian-incremental-measurement per Amazon-Marketing-Cloud-2024-Enterprise-cohort-overlay-instrumentation. Critical for 5-way-comparison-cycle at scale.",
    "Step 5: Hire dedicated in-house-DSP-marketing-team $10k-$25k/mo OR fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise ($5k-$25k/mo) — 8-16 hr/wk dedicated-DSP-marketing-team per research/14 Pillar 5 + playbook 21 Phase 4 for 6-12-month DSP-build-out-cycle + 12-24-month Halo-attribution-modeling-maturity. Path C requires dedicated-in-house-team-or-fully-managed-service-Enterprise; without it, downgrade to Path B. The team handles Amazon-DSP-bid-optimization + AMC-cohort-iteration + Halo-defense-creative-asset-iteration + Halo-vs-direct-incremental-ACoS-measurement + Brand-search-volume-lift-attribution + 3rd-party-Amazon-DSP-manager-evaluation.",
    "Step 6: Steady-state + Brand-search-volume-lift-attribution-launch + Halo-defense-steady-state + 3rd-party-Amazon-DSP-manager-or-in-house-team-or-fully-managed-service-decision-recipe — Tier 2 in-house-team $10k-$25k/mo for $25M+ brands OR Tier 3 fully-managed-service-Pacvue-Enterprise-OR-Helium-10-Enterprise $5k-$25k/mo per research/14 §Pillar 5 GMV-tier decision matrix. Compounds research/14 §Path C 2.5:1 ROI muted by 6-12-month DSP-build-out-cycle + Halo-attribution-modeling-maturity + 12-24-month-Halo-defense-effective-rate-steady-state achieving 5-30% Year-1 incremental revenue + 0.4-0.6× CAC vs paid-social + 8-15× brand-search-volume-lift + 30-45% Halo-defense-rate at $25M US DTC + $25M+ Amazon base per Amazon-Ad-Business-2024 + Amazon-DSP-2024 + Amazon-Marketing-Cloud-2024 + Amazon-Brand-Registry-2024 benchmarks.",
  ],
};

// ----- Defaults (matches the Python CLI's $5M US DTC + $10M Amazon baseline) -----

export const AMAZON_DSP_DEFAULTS: AmazonDspInputs = {
  usDtcGmv: 5_000_000,
  marketplaceGmvPct: 50,
  skuCount: 30,
  heroSkuCount: 8,
  grossMarginPct: 50,
  hasAmazonSellerCentralAccount: true,
  hasBrandRegistryTrademark: true,
  hasAmazonAttributionProOrAdvancedTools: true,
  hasDspManagedServiceOrSelfServeAccount: true,
  voiceProfile: "default",
  hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek: 6,
  hasHaloDefenseCreativeAssets: true,
};

// ----- Validation + scoring rule -----------------------------------------

export function validateAmazonDspInputs(inputs: AmazonDspInputs): string | null {
  if (!Number.isFinite(inputs.usDtcGmv) || inputs.usDtcGmv < 0) {
    return "US DTC GMV must be ≥ 0";
  }
  if (!Number.isFinite(inputs.marketplaceGmvPct) || inputs.marketplaceGmvPct < 0 || inputs.marketplaceGmvPct > 100) {
    return "Marketplace GMV % must be in 0..100";
  }
  if (!Number.isFinite(inputs.skuCount) || inputs.skuCount < 0) {
    return "SKU count must be ≥ 0";
  }
  if (!Number.isFinite(inputs.heroSkuCount) || inputs.heroSkuCount < 0) {
    return "Hero SKU count must be ≥ 0";
  }
  if (inputs.heroSkuCount > inputs.skuCount) {
    return "Hero SKU count must be ≤ total SKU count";
  }
  if (!Number.isFinite(inputs.grossMarginPct) || inputs.grossMarginPct < 0 || inputs.grossMarginPct > 100) {
    return "Gross margin % must be in 0..100";
  }
  if (!Number.isFinite(inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek) ||
      inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek < 0) {
    return "Operator capacity (hr/wk) must be ≥ 0";
  }
  return null;
}

function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  if (usGmv >= PATH_A_FLOOR) return "A";
  return "A"; // <$100k → defer but base path is "A" for audit-only
}

export function recommendPath(inputs: AmazonDspInputs): PathRecommendation {
  const justificationParts: string[] = [];

  // Capacity floor: defer if operator has insufficient time.
  if (inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Operator capacity ${inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek} hr/wk < ` +
      `${CAPACITY_GATE_HR_WK} hr/wk floor (research/14 §Prereq + playbook 21 §Phase 1 + asset 22 §cadence); ` +
      `Amazon-DSP program deferred until operator capacity is available ` +
      `(canonical 4-8 hr/wk Path B minimum; brand should defer or outsource to ` +
      `Tinuiti-OR-Pacvue-OR-Helium-10-OR-Perpetua-Enterprise-managed-service $2k-$10k/mo per research/14 §Path B).`,
    );
  }

  // SKU-count floor
  if (inputs.skuCount < MIN_SKU_COUNT) {
    justificationParts.push(
      `SKU count ${inputs.skuCount} < ${MIN_SKU_COUNT} floor (research/14 §Prereq + ` +
      `playbook 21 §Prereq; Amazon-DSP requires ≥5-SKUs for Amazon-DSP-launch-typcial-5+-Amazon-listed-hero-SKUs baseline; ` +
      `brands with <5-SKUs should defer until SKU-broadness improves OR bundle Kits to reach the threshold); ` +
      `Amazon-DSP program deferred until SKU-broadness is met.`,
    );
  }

  // Hero-SKU-count floor
  if (inputs.heroSkuCount < MIN_HERO_SKU_COUNT) {
    justificationParts.push(
      `Hero SKU count ${inputs.heroSkuCount} < ${MIN_HERO_SKU_COUNT} floor (research/14 §Prereq + ` +
      `playbook 21 §8-prereq Amazon-DSP-onboarding-pack + asset 22 §Halo-defense-creative-assets-baseline; ` +
      `Amazon-DSP requires ≥5-Amazon-listed hero SKUs for Amazon-DSP-launch + Halo-defense-creative-assets-baseline; ` +
      `brands with <5-hero-SKUs should defer until hero-SKU-broadness improves); ` +
      `Amazon-DSP program deferred until hero-SKU-broadness is met.`,
    );
  }

  // Gross-margin floor
  if (inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT) {
    justificationParts.push(
      `Gross margin ${inputs.grossMarginPct.toFixed(1)}% < ${MIN_GROSS_MARGIN_PCT.toFixed(1)}% floor ` +
      `(research/14 §Prereq; Amazon-DSP consumes $1k-$5k/mo cost stack for ` +
      `Amazon-DSP-programmatic-display + Halo-defense-creative-assets + AMC-cohort-overlay-instrumentation + ` +
      `Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider + Triple-Whale-Amazon-cohort-overlay + ` +
      `DSP-marketing-team-time; a brand with <${MIN_GROSS_MARGIN_PCT.toFixed(1)}% gross margin should defer Amazon-DSP ` +
      `until margin improves OR offer Amazon-only-product-set at higher price-point); ` +
      `Amazon-DSP program deferred until gross margin improves.`,
    );
  }

  // Amazon-Seller-Central-account
  if (!inputs.hasAmazonSellerCentralAccount) {
    justificationParts.push(
      `has_amazon_seller_central_account=False (research/14 Pillar 1 + playbook 21 §Prerequisite #1: ` +
      `Amazon-Seller-Central-account-active-with-5+-listed-SKUs + Brand-Registry-trademark-registered + ` +
      `Buy-Box-ownership-on-hero-SKUs-≥90% is the canonical Amazon-Seller-Central-account-active prerequisite ` +
      `for $5M+ brands; without it, Amazon-DSP-in-market-shoppers-audience-segment-launch + ` +
      `Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy + AMC-cohort-overlay cannot execute); ` +
      `Amazon-DSP program deferred until Amazon-Seller-Central-account is active.`,
    );
  }

  // Brand-Registry
  if (!inputs.hasBrandRegistryTrademark) {
    justificationParts.push(
      `has_brand_registry_trademark=False (research/14 Pillar 1 + playbook 21 §Prerequisite #2: ` +
      `Amazon-Brand-Registry-trademark-registered-with-USPTO-or-equivalent + Amazon-Brand-Analytics-access-wire + ` +
      `Halo-defense-levers-enabled is the canonical Amazon-Brand-Registry-trademark-registered prerequisite ` +
      `for Amazon-DSP-launch per Amazon-Brand-Registry-2024-canonical-protective-mechanism; without it, ` +
      `Halo-defense-programmatic-display-effective-rate typically caps at 30-50% of structural-upside and ` +
      `competitor-product-targeting-defense is forfeited); Amazon-DSP program deferred until Brand-Registry-trademark-registered.`,
    );
  }

  // Amazon-Attribution-Pro-or-advanced-tools
  if (!inputs.hasAmazonAttributionProOrAdvancedTools) {
    justificationParts.push(
      `has_amazon_attribution_pro_or_advanced_tools=False (research/14 Pillar 3 + playbook 21 §Prerequisite #3 + ` +
      `Amazon-Attribution-2024-Beta-to-GA-migration-guide: Amazon-Attribution-Beta-deprecation-August-2025-forces-` +
      `migration-to-Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider-Tinuiti-or-Pacvue-` +
      `or-Helium-10-or-Perpetua-Enterprise; without attribution-instrumentation, Halo-vs-direct-incremental-ACoS-measurement ` +
      `is impossible and Amazon-DSP typically caps at 30-50% of structural-upside per Tinuiti-2024-Halo-effect-cohort-study); ` +
      `Amazon-DSP program deferred until attribution-instrumentation is wired.`,
    );
  }

  // DSP-account
  if (!inputs.hasDspManagedServiceOrSelfServeAccount) {
    justificationParts.push(
      `has_dsp_managed_service_or_self_serve_account=False (research/14 Pillar 1 + playbook 21 §Prerequisite #4 + ` +
      `Amazon-Ads-Console-2024-canonical-launch-prerequisite: DSP-managed-service-or-self-serve-account-or-Amazon-Ads-Console-` +
      `minimum-spend is the canonical Amazon-DSP-account-onboard prerequisite for $5M+ brands; without it, ` +
      `Amazon-DSP-in-market-shoppers-launch + Amazon-DSP-omnichannel-campaigns-launch + AMC-cohort-overlay-instrumentation ` +
      `cannot execute; brands without DSP-presence-or-budget should defer Amazon-DSP until DSP-minimum-spend-is-wired); ` +
      `Amazon-DSP program deferred until DSP-account is wired.`,
    );
  }

  // Base tier assignment
  let path: PathName = tierForGmv(inputs.usDtcGmv);

  // Luxury voice without Halo-defense-creative-assets → downgrade
  if (LUXURY_DOWNGRADE_ENABLED && inputs.voiceProfile === "luxury" && !inputs.hasHaloDefenseCreativeAssets) {
    const newRank = PATH_RANK[path] - 1;
    const newPath = RANK_PATH[Math.max(newRank, 0)];
    justificationParts.push(
      `voice_profile='luxury' without has_halo_defense_creative_assets=True (research/14 Pillar 1 + ` +
      `playbook 21 §Prereq + asset 22 §luxury-voice-density; luxury-voice brands need Halo-defense-creative-assets-baseline-` +
      `50+-Halo-defense-creative-assets-pipelined-across-5-pillars-Halo-defense-creative-pattern-categories for ` +
      `Brand-Registry-defensive-levers + elevated-E-E-A-T-signals per Amazon-Creative-Assets-2024-canonical-5-specs — ` +
      `without Halo-defense-creative-assets, luxury-Halo-defense-programmatic-display-effective-rate typically ` +
      `caps at 30-50% of maximum per Amazon-Brand-Registry-2024 + Pacvue-2024 benchmarks). Path downgraded from ${RANK_PATH[PATH_RANK[path]]} to ${newPath}.`,
    );
    path = newPath;
  }

  // B2B voice without attribution → downgrade
  if (B2B_DOWNGRADE_ENABLED && inputs.voiceProfile === "b2b" && !inputs.hasAmazonAttributionProOrAdvancedTools) {
    const newRank = PATH_RANK[path] - 1;
    const newPath = RANK_PATH[Math.max(newRank, 0)];
    justificationParts.push(
      `voice_profile='b2b' without has_amazon_attribution_pro_or_advanced_tools=True (research/14 Pillar 3 + ` +
      `playbook 21 §Prereq + asset 22 §B2B-voice-density; B2B-voice brands need Amazon-Attribution-Pro-or-advanced-tools-or-AMC-` +
      `or-3rd-party-attribution-provider for Halo-vs-direct-incremental-ACoS-measurement per Amazon-Marketing-Cloud-2024-canonical-` +
      `cohort-overlay-instrumentation — without it, B2B-Halo-vs-direct-incremental-ACoS-measurement-resolution typically ` +
      `caps at 30-50% of maximum and 60-180-day sales-cycle-aware content-pruning is forfeited). Path downgraded to ${newPath}.`,
    );
    path = newPath;
  }

  // Path C without attribution → downgrade to Path B
  if (PATH_C_DSP_DOWNGRADE_ENABLED && path === "C" && !inputs.hasAmazonAttributionProOrAdvancedTools) {
    justificationParts.push(
      `Path C requires Amazon-Attribution-Pro-or-advanced-tools-or-AMC-license-direct (research/14 Pillar 3 + ` +
      `playbook 21 §Prereq; Path C is enterprise-tier with full-Amazon-DSP-omnichannel-programmatic-display + ` +
      `AMC-Enterprise-cohort-iteration + Halo-defense-steady-state — without attribution-instrumentation, ` +
      `Path C typically caps at 30-50% of structural-upside). Path downgraded from C to B.`,
    );
    path = "B";
  }

  // Look up the cost / projection bands for the (possibly downgraded) path
  const [costOneTimeLow, costOneTimeHigh, costRecurringLow, costRecurringHigh] = PATH_COSTS[path];
  const [shareLow, shareHigh] = PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT[path];
  const [cacLow, cacHigh] = PATH_CAC_VS_PAID_SOCIAL_MULTIPLIER[path];
  const [brandSearchLow, brandSearchHigh] = PATH_BRAND_SEARCH_VOLUME_LIFT_MULTIPLE[path];
  const [amcCohortLow, amcCohortHigh] = PATH_AMC_COHORT_OVERLAY_RESOLUTION_LIFT_MULTIPLE[path];
  const [haloDefenseRateLow, haloDefenseRateHigh] = PATH_HALO_DEFENSE_RATE_PCT[path];
  const [haloMaturityLow, haloMaturityHigh] = PATH_HALO_ATTRIBUTION_MODELING_MATURITY_MONTHS[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const totalGmvBase = inputs.usDtcGmv * (1.0 + inputs.marketplaceGmvPct / 100.0);
  const year1CostLow = costOneTimeLow + costRecurringLow * 12;
  const year1CostHigh = costOneTimeHigh + costRecurringHigh * 12;
  const year1IncrementalHaloDefenseRevenueLow = totalGmvBase * (shareLow / 100.0);
  const year1IncrementalHaloDefenseRevenueHigh = totalGmvBase * (shareHigh / 100.0);

  const justification = justificationParts.length > 0
    ? justificationParts.join(" | ")
    : `Path ${path} recommended for $${inputs.usDtcGmv.toLocaleString()} US DTC + ` +
      `$${(totalGmvBase - inputs.usDtcGmv).toLocaleString()} Amazon base ` +
      `($${totalGmvBase.toLocaleString()} total GMV) with ${inputs.skuCount} SKUs ` +
      `(${inputs.heroSkuCount} hero) and ${inputs.voiceProfile} voice profile ` +
      `(research/14 §GMV-tier paths + playbook 21 §Phase 1+2+3+4 + asset 22 §5-pillar Amazon-DSP-framework).`;

  // 5-pillar matrix for the recommended path + voice (clone so each call
  // gets a fresh object — never share mutable refs across calls)
  const pillarMatrix: Record<string, string> = {};
  for (const [pillar, voiceMap] of Object.entries(AMAZON_DSP_PILLAR_MATRIX)) {
    pillarMatrix[pillar] = voiceMap[inputs.voiceProfile];
  }

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
    year1IncrementalHaloDefenseRevenueSharePctLow: shareLow,
    year1IncrementalHaloDefenseRevenueSharePctHigh: shareHigh,
    year1IncrementalHaloDefenseRevenueLow,
    year1IncrementalHaloDefenseRevenueHigh,
    cacVsPaidSocialMultiplierLow: cacLow,
    cacVsPaidSocialMultiplierHigh: cacHigh,
    brandSearchVolumeLiftMultipleLow: brandSearchLow,
    brandSearchVolumeLiftMultipleHigh: brandSearchHigh,
    amcCohortOverlayResolutionLiftMultipleLow: amcCohortLow,
    amcCohortOverlayResolutionLiftMultipleHigh: amcCohortHigh,
    haloDefenseRatePctLow: haloDefenseRateLow,
    haloDefenseRatePctHigh: haloDefenseRateHigh,
    haloAttributionModelingMaturityMonthsLow: haloMaturityLow,
    haloAttributionModelingMaturityMonthsHigh: haloMaturityHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    amazonDspPillarMatrix: pillarMatrix,
    buildSequence: [...BUILD_SEQUENCES[path]],
  };
}

// ----- Markdown handoff (matches scripts/...render_human output) ---------

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function renderAmazonDspMarkdown(inputs: AmazonDspInputs, rec: PathRecommendation): string {
  const lines: string[] = [];
  lines.push("Amazon-DSP + Amazon-Attribution Path A/B/C recommendation");
  lines.push("=".repeat(56));
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                                          : ${fmtUsd(inputs.usDtcGmv)}`);
  lines.push(`  Marketplace GMV share (%)                           : ${inputs.marketplaceGmvPct.toFixed(1)}%`);
  lines.push(`  Total DTC + Marketplace GMV base                    : ${fmtUsd(inputs.usDtcGmv * (1.0 + inputs.marketplaceGmvPct / 100.0))}`);
  lines.push(`  SKU count                                           : ${inputs.skuCount}`);
  lines.push(`  Hero SKU count                                      : ${inputs.heroSkuCount}`);
  lines.push(`  Gross margin (%)                                    : ${inputs.grossMarginPct.toFixed(1)}%`);
  lines.push(`  Has Amazon-Seller-Central-account                   : ${inputs.hasAmazonSellerCentralAccount}`);
  lines.push(`  Has Brand-Registry-trademark                        : ${inputs.hasBrandRegistryTrademark}`);
  lines.push(`  Has Amazon-Attribution-Pro-or-advanced-tools        : ${inputs.hasAmazonAttributionProOrAdvancedTools}`);
  lines.push(`  Has DSP-managed-service-or-self-serve-account       : ${inputs.hasDspManagedServiceOrSelfServeAccount}`);
  lines.push(`  Has Halo-defense-creative-assets                    : ${inputs.hasHaloDefenseCreativeAssets}`);
  lines.push(`  Voice profile                                       : ${inputs.voiceProfile}`);
  lines.push(`  Operator capacity (hr/wk)                           : ${inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek}`);
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
  lines.push(`  One-time setup (low-high)                           : ${fmtUsd(rec.costOneTimeLow)} - ${fmtUsd(rec.costOneTimeHigh)}`);
  lines.push(`  Recurring monthly (low-high)                        : ${fmtUsd(rec.costRecurringLow)} - ${fmtUsd(rec.costRecurringHigh)}`);
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(`  Year-1 cost (low-high)                              : ${fmtUsd(rec.year1CostLow)} - ${fmtUsd(rec.year1CostHigh)}`);
  lines.push(`  Incremental Halo-defense-revenue share (low-high)   : ${rec.year1IncrementalHaloDefenseRevenueSharePctLow.toFixed(1)}% - ${rec.year1IncrementalHaloDefenseRevenueSharePctHigh.toFixed(1)}%`);
  lines.push(`  Incremental Halo-defense-revenue $ (low-high)       : ${fmtUsd(rec.year1IncrementalHaloDefenseRevenueLow)} - ${fmtUsd(rec.year1IncrementalHaloDefenseRevenueHigh)}`);
  lines.push(`  CAC vs paid-social multiplier (low-high)            : ${rec.cacVsPaidSocialMultiplierLow.toFixed(2)}x - ${rec.cacVsPaidSocialMultiplierHigh.toFixed(2)}x`);
  lines.push(`  Brand-search-volume-lift multiple (low-high)        : ${rec.brandSearchVolumeLiftMultipleLow.toFixed(1)}x - ${rec.brandSearchVolumeLiftMultipleHigh.toFixed(1)}x`);
  lines.push(`  AMC-cohort-overlay resolution-lift (low-high)        : ${rec.amcCohortOverlayResolutionLiftMultipleLow.toFixed(1)}x - ${rec.amcCohortOverlayResolutionLiftMultipleHigh.toFixed(1)}x`);
  lines.push(`  Halo-defense-rate (low-high)                        : ${rec.haloDefenseRatePctLow.toFixed(1)}% - ${rec.haloDefenseRatePctHigh.toFixed(1)}%`);
  lines.push(`  Halo-attribution-modeling-maturity months (low-high): ${rec.haloAttributionModelingMaturityMonthsLow} - ${rec.haloAttributionModelingMaturityMonthsHigh}`);
  lines.push(`  Year-1 ROI                                          : ${rec.year1RoiLow.toFixed(1)}:1 - ${rec.year1RoiHigh.toFixed(1)}:1`);
  lines.push("");
  lines.push("5-pillar Amazon-DSP framework (per voice):");
  for (const [pillar, desc] of Object.entries(rec.amazonDspPillarMatrix)) {
    lines.push(`  ${pillar}`);
    lines.push(`    ${desc}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}
