/**
 * B2B / Wholesale Path A / B / C scorer — direct TypeScript port of
 * `/scripts/b2b_wholesale_unit_economics.py`.
 *
 * Used by the interactive `<B2BWholesalePathCalculator />` component on
 * the `/b2b` page. The math, defaults, thresholds, and 6-step build
 * sequence strings are kept byte-identical to the Python CLI so an
 * operator can sanity-check the same numbers in the browser and the
 * terminal without drift.
 *
 * Companion to:
 * - /research/10-b2b-wholesale.md (the 5-pillar framework + 3 GMV-tier paths)
 * - /playbooks/17-b2b-wholesale-launch.md (4-phase launch ladder)
 * - /assets/18-b2b-wholesale-kits.md (paste-ready wholesale listings)
 * - /dashboard/app/b2b/page.tsx (operator-surface route)
 *
 * Scoring rule (mirrors research/10 §GMV-tier paths + playbook 17 §Prerequisites):
 *  - us_dtc_gmv < $100k                                  → defer (Path A surfaced as audit only)
 *  - us_dtc_gmv $100k-$500k                              → Path A (Faire + Tundra + Ankorstore + Handshake marketplace-only)
 *  - us_dtc_gmv $500k-$5M                                → Path B (… + Shopify B2B DEFAULT 8.5:1 ROI)
 *  - us_dtc_gmv $5M+                                     → Path C (full B2B-orchestration including RSP/KeHE/UNFI 6:1 muted)
 *  - sku_count < 10                                      → defer
 *  - gross_margin_pct < 25%                              → defer
 *  - operator_capacity < 4 hr/wk                         → defer
 *  - has_faire_account = False                           → defer
 *  - has_handshake_shopify = False                       → defer
 *  - has_net_suite_wholesale = False AND path == "C"     → defer
 *  - voice_profile = "luxury" w/o corporate-gifting      → downgrade one tier
 *  - voice_profile = "sustainable" w/o corporate-gifting → downgrade one tier
 *  - dedicated_sales_rep < 1 hr/wk AND path == "C"       → downgrade to Path B
 */

export type PathName = "A" | "B" | "C";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type SkuArchetypeDistribution =
  | "12_hero_23_wholesale"
  | "balanced_50_50"
  | "mostly_hero_70_30"
  | "mostly_wholesale_30_70";

export interface BrandB2BInputs {
  usDtcGmv: number;
  skuCount: number;
  skuArchetypeDistribution: SkuArchetypeDistribution;
  grossMarginPct: number; // 0..100
  moqOperationalCapacity: number; // 1..10
  hasFaireAccount: boolean;
  hasHandshakeShopify: boolean;
  hasNetSuiteWholesale: boolean;
  hasRspOrKehePitch: boolean;
  hasCorporateGiftingCatalog: boolean;
  voiceProfile: VoiceProfile;
  hasDedicatedSalesRepCapacityHoursPerWeek: number;
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
  year1IncrementalRevenueSharePctLow: number;
  year1IncrementalRevenueSharePctHigh: number;
  year1IncrementalRevenueLow: number;
  year1IncrementalRevenueHigh: number;
  reorderRatePctLow: number;
  reorderRatePctHigh: number;
  wholesaleAttachRatePctLow: number;
  wholesaleAttachRatePctHigh: number;
  mapPolicySavingsPctLow: number;
  mapPolicySavingsPctHigh: number;
  dtcCannibalizationAdjustedNetRevenueLow: number;
  dtcCannibalizationAdjustedNetRevenueHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  wholesaleDiscountMatrix: Record<string, string>;
  buildSequence: string[];
}

export interface PerPathRevenue {
  year1IncrementalRevenueLow: number;
  year1IncrementalRevenueHigh: number;
  year2PlusWholesaleAttachRateLow: number;
  year2PlusWholesaleAttachRateHigh: number;
  reorderRatePctLow: number;
  reorderRatePctHigh: number;
  mapPolicySavingsPctLow: number;
  mapPolicySavingsPctHigh: number;
  dtcCannibalizationRate: number;
  cannibalizationAdjustedNetRevenueLow: number;
  cannibalizationAdjustedNetRevenueHigh: number;
}

// ----- Canonical thresholds (research/10 §Path A/B/C) --------------------

const PATH_A_FLOOR = 100_000;
const PATH_B_FLOOR = 500_000;
const PATH_C_FLOOR = 5_000_000;

const MIN_SKU_COUNT = 10;
const MIN_GROSS_MARGIN_PCT = 25;
const CAPACITY_GATE_HR_WK = 4;
const MIN_MOQ_OPERATIONAL_CAPACITY = 3;
const PATH_C_DEDICATED_REP_FLOOR = 1;

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0, 2_000, 0, 149],
  B: [2_000, 5_000, 149, 499],
  C: [5_000, 50_000, 1_000, 5_000],
};

const PATH_INCREMENTAL_REVENUE_SHARE_PCT: Record<PathName, [number, number]> = {
  A: [5, 15],
  B: [50, 100],
  C: [15, 50],
};

const WHOLESALE_ATTACH_RATE_PCT: Record<PathName, [number, number]> = {
  A: [15, 25],
  B: [55, 75],
  C: [40, 60],
};

const REORDER_RATE_PCT: Record<PathName, [number, number]> = {
  A: [40, 60],
  B: [60, 80],
  C: [50, 70],
};

const MAP_POLICY_SAVINGS_PCT: Record<PathName, [number, number]> = {
  A: [15, 25],
  B: [30, 50],
  C: [40, 60],
};

const DTC_CANNIBALIZATION_RATE: Record<PathName, number> = {
  A: 0.25,
  B: 0.175,
  C: 0.30,
};

const PATH_ROI: Record<PathName, [number, number]> = {
  A: [3, 6],
  B: [6, 11],
  C: [4, 8],
};

const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: ["Faire", "Tundra", "Ankorstore", "Handshake (Shopify B2B)"],
  B: [
    "Faire",
    "Tundra",
    "Ankorstore",
    "Handshake (Shopify B2B)",
    "Shopify B2B / Shopify Plus B2B",
  ],
  C: [
    "Faire",
    "Tundra",
    "Ankorstore",
    "Handshake (Shopify B2B)",
    "Shopify Plus B2B",
    "Amazon Business",
    "RSP / KeHE / UNFI direct-distributor",
  ],
};

const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "Faire (free; 25% first-order + 15% reorders commission per Faire 2024)",
  B: "Faire + Handshake (Shopify B2B) (Faire default + Handshake native Shopify-integration)",
  C: "Faire + Handshake + Amazon Business + RSP/KeHE/UNFI (full B2B-orchestration per research/10 §Path C)",
};

const WHOLESALE_DISCOUNT_MATRIX: Record<string, string> = {
  default: "35% luxury (MAP-protected) / 50% canonical / 55% high-volume",
  luxury: "35% luxury protecting MAP / 50% canonical (MAP-enforced)",
  sustainable: "40% sustainable-clean-beauty / 50% canonical / 55% high-volume",
  gen_z: "50% canonical / 55% high-volume (standard wholesale-default for Gen-Z SKU)",
  b2b: "55% high-volume (volume-discount expected for B2B-channel) / 60% distributor-tier",
};

// ----- Build-sequence recipe ---------------------------------------------

const BUILD_SEQUENCES: Record<PathName, string[]> = {
  A: [
    "Step 1 — Wholesale-pricing calculator: configure 50%-off-MSRP default in Shopify B2B settings + NET-30 terms-card (2.5% pre-pay-discount per Stripe B2B 2024) + MAP-policy-page with 3-strike-enforcement per Sherman-Antitrust-Act-RPM-policy-compliance (research/10 Pillar 2).",
    "Step 2 — Apply for Faire vendor account (free; 25% first-order + 15% reorders commission per Faire 2024); create Tundra + Ankorstore + Handshake storefronts (all free).",
    "Step 3 — Build 8-prereq distributor-onboarding pack: registration-cert + EIN-letter + resale-certificate per Streamlined-Sales-Tax-Project + product-insurance $1M+ GL + $1M product-liability + warehouse-safety-cert FDA OR CPSC-registered + UPC-barcode GS1-Company-Prefix $250/yr + casepack-spec-sheet (research/10 Pillar 5).",
    "Step 4 — List 12-30 hero SKUs on Faire + Tundra + Ankorstore + Handshake with wholesale-pricing auto-applied; activate Klaviyo B2B-tier reorder-reminder flow at 75% typical-purchase-cadence (research/10 Pillar 3).",
    "Step 5 — Build corporate-gifting-catalog (10-30 hero SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers); validate first 10-25 retailer-account reorder cycle for 60%+ reorder-rate per Salesforce B2B Commerce 2024 (research/10 Pillar 3).",
    "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) before steady-state; canonical Year-1 ROI Path A 3-6:1 at <$500k GMV / 10-25 first-retailer-accounts / 40-60% reorder-rate (research/10 §Cost & ROI estimate).",
  ],
  B: [
    "Step 1 — Wholesale-pricing calculator: configure 50%-off-MSRP default in Shopify B2B settings + NET-30 terms-card (2.5% pre-pay-discount per Stripe B2B 2024) + MAP-policy-page with 3-strike-enforcement per Sherman-Antitrust-Act-RPM-policy-compliance (research/10 Pillar 2).",
    "Step 2 — Apply for Faire vendor account (free; 25% first-order + 15% reorders commission per Faire 2024); create Tundra + Ankorstore + Handshake storefronts; install Shopify B2B OR upgrade to Shopify Plus B2B for full B2B-portal with company-accounts + credit-terms + bulk-pricing + reorder-automation.",
    "Step 3 — Build 8-prereq distributor-onboarding pack + RangeMe product-discovery listing + 5-clause wholesale-distribution-agreement template [commission + payment-terms + termination + indemnity + IP] (research/10 Pillar 5 + asset 18).",
    "Step 4 — List 12-30 hero SKUs + 30+ wholesale-eligible secondary SKUs on Faire + Tundra + Ankorstore + Handshake with Handshake-catalog-automation (auto-sync new DTC SKUs to B2B channel with wholesale-pricing auto-applied); activate 4-cadence Klaviyo B2B-tier flow [B2B reorder-reminder + sample-pack-shipped + first-reorder-thank-you + monthly-stockist-update] (research/10 Pillar 3).",
    "Step 5 — Build corporate-gifting-catalog (10-30 hero SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers) + 4-email-direct-buyer-cadence [introduction + sample-pack-shipping + follow-up + sales-call-booking] + TradeGala-virtual-trade-show subscription $200-$2,000/mo (research/10 Pillar 3 + playbook 17 §Phase 2).",
    "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) + Gate C (10 prereqs) before steady-state; canonical Year-1 ROI Path B 6-11:1 (8.5:1 midpoint) at $500k-$5M GMV / 25-100 retailer-accounts / 60-80% reorder-rate-by-Year-2 / $1M-$5M Path B incremental B2B revenue (research/10 §Cost & ROI estimate + playbook 17 §4-phase launch ladder).",
  ],
  C: [
    "Step 1 — Wholesale-pricing calculator + NET-30 terms-card + MAP-policy-page (canonical 60% off MSRP for distributor-tier + 50% for Shopify B2B + 45% for premium-DTC) + Amazon Business B2B-specialty-tier-cert $39.99/mo for office/hospitality/healthcare/industrial SKUs only per Marketplace Pulse 2024 wholesale-specialty-report (research/10 Pillar 2).",
    "Step 2 — Apply for Faire vendor account + Tundra + Ankorstore + Handshake + Shopify Plus B2B $2,300/mo full-portal + NetSuite Wholesale OR A2X EDI integration for EDI 832/850 catalog-syndication to RSP/KeHE/UNFI/dot Foods (research/10 Pillar 5).",
    "Step 3 — Build 8-prereq distributor-onboarding pack + dedicated 0.5-1.0 FTE sales-rep-capacity for 6-18-month distributor-onboarding-cycle + distributor-pitch deck with canonical 7-path B2B-platform decision matrix + RSP/KeHE/UNFI direct-pitch sequences (research/10 Pillar 5 + playbook 17 §Phase 3).",
    "Step 4 — List 12-30 hero SKUs + 100+ wholesale-eligible SKUs on Faire + Tundra + Ankorstore + Handshake + Shopify Plus B2B + Amazon Business B2B-specialty-tier + RangeMe product-discovery + first RSP/KeHE/UNFI pitch meetings scheduled.",
    "Step 5 — Build geographic-exclusivity-tier (state-level top-20 + city-level top-5 per Faire 2024 + Handshake geographic-exclusion benchmarks) + Triple Whale B2B-cohort-LTV-overlay for ARPU-cannibalization-monitoring-quarterly + TradeGala-virtual-trade-show + 1 in-person-trade-show-per-Year-1 (NY NOW + ASD Market Week + Surf Expo + MAGIC + PROJECT + NYIGF + NACDS) (research/10 Pillar 3 + Pillar 4 + playbook 17 §Phase 4).",
    "Step 6 — Verify Gate A (10 prereqs) + Gate B (10 prereqs) + Gate C (10 prereqs) + Gate D (9 prereqs) before steady-state; canonical Year-1 ROI Path C 4-8:1 muted by distributor-onboarding-cycle + sales-rep-cost; Year-3+ ramp to 14-20:1 once distributor-portfolio is mature (research/10 §Cost & ROI estimate + playbook 17 §4-phase launch ladder).",
  ],
};

// ----- Defaults — match scripts/b2b_wholesale_unit_economics.py ----------

export const B2B_DEFAULTS: BrandB2BInputs = {
  usDtcGmv: 2_000_000,
  skuCount: 35,
  skuArchetypeDistribution: "12_hero_23_wholesale",
  grossMarginPct: 50,
  moqOperationalCapacity: 8,
  hasFaireAccount: true,
  hasHandshakeShopify: true,
  hasNetSuiteWholesale: false,
  hasRspOrKehePitch: false,
  hasCorporateGiftingCatalog: true,
  voiceProfile: "b2b",
  hasDedicatedSalesRepCapacityHoursPerWeek: 8,
};

// ----- Validation --------------------------------------------------------

export function validateB2BInputs(inputs: BrandB2BInputs): string | null {
  if (inputs.usDtcGmv < 0) return "usDtcGmv must be >= 0";
  if (inputs.skuCount < 0) return "skuCount must be >= 0";
  if (inputs.grossMarginPct < 0 || inputs.grossMarginPct > 100)
    return "grossMarginPct must be in [0, 100]";
  if (inputs.moqOperationalCapacity < 1 || inputs.moqOperationalCapacity > 10)
    return "moqOperationalCapacity must be in [1, 10]";
  if (inputs.hasDedicatedSalesRepCapacityHoursPerWeek < 0)
    return "sales-rep capacity must be >= 0";
  return null;
}

// ----- Tier + path classification ----------------------------------------

function tierForGmv(usDtcGmv: number): PathName {
  if (usDtcGmv < PATH_B_FLOOR) return "A";
  if (usDtcGmv < PATH_C_FLOOR) return "B";
  return "C";
}

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function tierFloorText(path: PathName): string {
  if (path === "A") return `${PATH_A_FLOOR.toLocaleString("en-US")}`;
  if (path === "B") return `${PATH_B_FLOOR.toLocaleString("en-US")}`;
  return `${PATH_C_FLOOR.toLocaleString("en-US")}`;
}

function tierCeilingText(path: PathName): string {
  if (path === "A") return `${(PATH_B_FLOOR - 1).toLocaleString("en-US")}`;
  if (path === "B") return `${(PATH_C_FLOOR - 1).toLocaleString("en-US")}`;
  return "10,000,000";
}

// ----- Core scoring rule --------------------------------------------------

export function recommendPath(inputs: BrandB2BInputs): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForSkuCount = false;
  let deferredForGrossMargin = false;
  let deferredForCapacity = false;
  let deferredForFaire = false;
  let deferredForHandshake = false;
  let deferredForMoq = false;
  let deferredForNetsuiteC = false;

  // Capacity floor.
  if (inputs.hasDedicatedSalesRepCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Deferred: has_dedicated_sales_rep_capacity_hours_per_week=${inputs.hasDedicatedSalesRepCapacityHoursPerWeek} < canonical ${CAPACITY_GATE_HR_WK} hr/wk floor per Faire 2024 onboarding-survey`,
    );
    deferredForCapacity = true;
  }

  // SKU floor.
  if (inputs.skuCount > 0 && inputs.skuCount < MIN_SKU_COUNT) {
    justificationParts.push(
      `Deferred: sku_count=${inputs.skuCount} < canonical ${MIN_SKU_COUNT} SKU baseline per Faire 2024 onboarding`,
    );
    deferredForSkuCount = true;
  }

  // Gross margin floor.
  if (inputs.grossMarginPct < MIN_GROSS_MARGIN_PCT) {
    justificationParts.push(
      `Deferred: gross_margin_pct=${inputs.grossMarginPct}% < canonical ${MIN_GROSS_MARGIN_PCT}% wholesale-discount-margin-headroom floor per Faire 2024`,
    );
    deferredForGrossMargin = true;
  }

  // MOQ operational capacity floor.
  if (inputs.moqOperationalCapacity < MIN_MOQ_OPERATIONAL_CAPACITY) {
    justificationParts.push(
      `Deferred: moq_operational_capacity=${inputs.moqOperationalCapacity} < canonical ${MIN_MOQ_OPERATIONAL_CAPACITY}/10 casepack-fulfillment readiness floor`,
    );
    deferredForMoq = true;
  }

  // Faire account gate.
  if (!inputs.hasFaireAccount) {
    justificationParts.push(
      `Deferred: has_faire_account=False (Faire is the canonical Path A entry point; defaults to Tundra + Handshake if unavailable)`,
    );
    deferredForFaire = true;
  }

  // Handshake / Shopify B2B gate.
  if (!inputs.hasHandshakeShopify) {
    justificationParts.push(
      `Deferred: has_handshake_shopify=False (Handshake is the canonical Shopify-native B2B-buyer-portal; Path B fallback to Shopify B2B Plus)`,
    );
    deferredForHandshake = true;
  }

  // Path-tier from GMV.
  let path = tierForGmv(inputs.usDtcGmv);
  if (deferredForFaire || deferredForHandshake || deferredForSkuCount || deferredForGrossMargin || deferredForCapacity || deferredForMoq) {
    path = "A"; // surfaced as audit only
    justificationParts.push(
      "Surfaced Path A as audit only because one or more hard-gates failed",
    );
  } else {
    justificationParts.push(
      `US DTC GMV $${fmtUsd(inputs.usDtcGmv)} lands in the Path ${path} tier ($${tierFloorText(path)} - $${tierCeilingText(path)} GMV).`,
    );
  }

  // Path C additional gate (NetSuite).
  if (path === "C" && !inputs.hasNetSuiteWholesale) {
    justificationParts.push(
      "Deferred: has_net_suite_wholesale=False is required for Path C (NetSuite Wholesale or A2X EDI is the canonical Path C integration substrate)",
    );
    deferredForNetsuiteC = true;
    path = "A"; // surfaced as audit only
  }

  // Apply luxury/sustainable downgrades (lower the tier).
  const downgrades: string[] = [];
  if (path !== "A") {
    if (inputs.voiceProfile === "luxury" && !inputs.hasCorporateGiftingCatalog) {
      downgrades.push(
        "voice_profile=luxury AND has_corporate_gifting_catalog=False → downgrade one tier (MAP-protection gate)",
      );
    }
    if (inputs.voiceProfile === "sustainable" && !inputs.hasCorporateGiftingCatalog) {
      downgrades.push(
        "voice_profile=sustainable AND has_corporate_gifting_catalog=False → downgrade one tier (claims-verification gate)",
      );
    }
    if (
      path === "C" &&
      inputs.hasDedicatedSalesRepCapacityHoursPerWeek < PATH_C_DEDICATED_REP_FLOOR
    ) {
      downgrades.push(
        `has_dedicated_sales_rep_capacity_hours_per_week=${inputs.hasDedicatedSalesRepCapacityHoursPerWeek} < canonical ${PATH_C_DEDICATED_REP_FLOOR} hr/wk for Path C → downgrade to Path B (RSP/KeHE/UNFI requires 0.5-1.0 FTE dedicated sales-rep; distributor-pitch fails 90% of the time and the path is downgraded to Path B)`,
      );
    }
  }
  for (let i = 0; i < downgrades.length; i++) {
    path = RANK_PATH[Math.max(PATH_RANK[path] - 1, PATH_RANK["A"])];
  }
  if (downgrades.length > 0) {
    justificationParts.push(
      `Applied ${downgrades.length} downgrade(s): DOWNGRADES: ${downgrades.join("; ")} Final path = ${path}.`,
    );
  } else if (
    !(
      deferredForSkuCount ||
      deferredForGrossMargin ||
      deferredForCapacity ||
      deferredForFaire ||
      deferredForHandshake ||
      deferredForMoq ||
      deferredForNetsuiteC
    )
  ) {
    justificationParts.push("All gates pass; no downgrade applied.");
  }

  // Cost stack + per-path projection.
  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [shareLow, shareHigh] = PATH_INCREMENTAL_REVENUE_SHARE_PCT[path];
  const [attachLow, attachHigh] = WHOLESALE_ATTACH_RATE_PCT[path];
  const [reorderLow, reorderHigh] = REORDER_RATE_PCT[path];
  const [mapLow, mapHigh] = MAP_POLICY_SAVINGS_PCT[path];
  const cannibalizationRate = DTC_CANNIBALIZATION_RATE[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const incrementalRevenueLow = inputs.usDtcGmv * (shareLow / 100);
  const incrementalRevenueHigh = inputs.usDtcGmv * (shareHigh / 100);
  const cannAdjNetLow = incrementalRevenueLow * (1 - cannibalizationRate);
  const cannAdjNetHigh = incrementalRevenueHigh * (1 - cannibalizationRate);

  return {
    path,
    platforms: [...PATH_PLATFORMS[path]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification: justificationParts.join(" "),
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1CostLow: costLow + 12 * recLow,
    year1CostHigh: costHigh + 12 * recHigh,
    year1IncrementalRevenueSharePctLow: shareLow,
    year1IncrementalRevenueSharePctHigh: shareHigh,
    year1IncrementalRevenueLow: incrementalRevenueLow,
    year1IncrementalRevenueHigh: incrementalRevenueHigh,
    reorderRatePctLow: reorderLow,
    reorderRatePctHigh: reorderHigh,
    wholesaleAttachRatePctLow: attachLow,
    wholesaleAttachRatePctHigh: attachHigh,
    mapPolicySavingsPctLow: mapLow,
    mapPolicySavingsPctHigh: mapHigh,
    dtcCannibalizationAdjustedNetRevenueLow: cannAdjNetLow,
    dtcCannibalizationAdjustedNetRevenueHigh: cannAdjNetHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    wholesaleDiscountMatrix: { ...WHOLESALE_DISCOUNT_MATRIX },
    buildSequence: [...BUILD_SEQUENCES[path]],
  };
}

// ----- Per-path revenue projection ---------------------------------------

export function projectPerPathRevenue(
  inputs: BrandB2BInputs,
  rec: PathRecommendation,
): Record<string, PerPathRevenue | PathName> {
  const projected: Record<string, PerPathRevenue | PathName> = {};
  for (const p of ["A", "B", "C"] as PathName[]) {
    const [shareLo, shareHi] = PATH_INCREMENTAL_REVENUE_SHARE_PCT[p];
    const [attachLo, attachHi] = WHOLESALE_ATTACH_RATE_PCT[p];
    const [reorderLo, reorderHi] = REORDER_RATE_PCT[p];
    const [mapLo, mapHi] = MAP_POLICY_SAVINGS_PCT[p];
    const rate = DTC_CANNIBALIZATION_RATE[p];
    const year1RevLo = inputs.usDtcGmv * (shareLo / 100);
    const year1RevHi = inputs.usDtcGmv * (shareHi / 100);
    projected[p] = {
      year1IncrementalRevenueLow: year1RevLo,
      year1IncrementalRevenueHigh: year1RevHi,
      year2PlusWholesaleAttachRateLow: attachLo,
      year2PlusWholesaleAttachRateHigh: attachHi,
      reorderRatePctLow: reorderLo,
      reorderRatePctHigh: reorderHi,
      mapPolicySavingsPctLow: mapLo,
      mapPolicySavingsPctHigh: mapHi,
      dtcCannibalizationRate: rate,
      cannibalizationAdjustedNetRevenueLow: year1RevLo * (1 - rate),
      cannibalizationAdjustedNetRevenueHigh: year1RevHi * (1 - rate),
    };
  }
  projected.recommendedPath = rec.path;
  return projected;
}

// ----- Render helpers ----------------------------------------------------

export function renderB2BMarkdown(
  inputs: BrandB2BInputs,
  rec: PathRecommendation,
): string {
  const lines: string[] = [];
  lines.push("B2B / wholesale Path A/B/C recommendation");
  lines.push("==================================================");
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                                 : $${fmtUsd(inputs.usDtcGmv).padStart(15)}`);
  lines.push(`  SKU count                                  : ${String(inputs.skuCount).padStart(15)}`);
  lines.push(`  SKU archetype distribution                 : ${inputs.skuArchetypeDistribution}`);
  lines.push(`  Gross margin %                             : ${inputs.grossMarginPct.toFixed(1)}%`);
  lines.push(`  MOQ operational capacity (1-10)            : ${String(inputs.moqOperationalCapacity).padStart(15)}`);
  lines.push(`  Has Faire account                          : ${inputs.hasFaireAccount}`);
  lines.push(`  Has Handshake (Shopify B2B)                : ${inputs.hasHandshakeShopify}`);
  lines.push(`  Has NetSuite Wholesale / A2X EDI           : ${inputs.hasNetSuiteWholesale}`);
  lines.push(`  Has RSP/KeHE/UNFI pitch                    : ${inputs.hasRspOrKehePitch}`);
  lines.push(`  Has corporate-gifting catalog              : ${inputs.hasCorporateGiftingCatalog}`);
  lines.push(`  Voice profile                              : ${inputs.voiceProfile}`);
  lines.push(
    `  Dedicated sales-rep capacity (hr/wk)       : ${String(inputs.hasDedicatedSalesRepCapacityHoursPerWeek).padStart(15)}`,
  );
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(`  Platforms                                  : ${rec.platforms.length} platform(s) in scope`);
  for (const p of rec.platforms) lines.push(`    - ${p}`);
  lines.push(`  Default platform pick                      : ${rec.defaultPlatformPick}`);
  lines.push(`  Justification                              : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)                  : $${fmtUsd(rec.costOneTimeLow).padStart(12)} – $${fmtUsd(rec.costOneTimeHigh)}`,
  );
  lines.push(
    `  Recurring monthly (low-high)               : $${fmtUsd(rec.costRecurringLow).padStart(12)} – $${fmtUsd(rec.costRecurringHigh)}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  Year-1 cost (low-high)                     : $${fmtUsd(rec.year1CostLow).padStart(12)} – $${fmtUsd(rec.year1CostHigh)}`,
  );
  lines.push(
    `  Incremental revenue share (low-high)       : ${rec.year1IncrementalRevenueSharePctLow.toFixed(0)}% – ${rec.year1IncrementalRevenueSharePctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Incremental revenue $ (low-high)           : $${fmtUsd(rec.year1IncrementalRevenueLow).padStart(12)} – $${fmtUsd(rec.year1IncrementalRevenueHigh)}`,
  );
  lines.push(
    `  Reorder rate (low-high)                    : ${rec.reorderRatePctLow.toFixed(0)}% – ${rec.reorderRatePctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Wholesale-attach-rate Yr2+ (low-high)      : ${rec.wholesaleAttachRatePctLow.toFixed(0)}% – ${rec.wholesaleAttachRatePctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  MAP-policy savings (low-high)              : ${rec.mapPolicySavingsPctLow.toFixed(0)}% – ${rec.mapPolicySavingsPctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  DTC-cannibalization-adj net $ (low-high)   : $${fmtUsd(rec.dtcCannibalizationAdjustedNetRevenueLow).padStart(12)} – $${fmtUsd(rec.dtcCannibalizationAdjustedNetRevenueHigh)}`,
  );
  lines.push(`  Year-1 ROI                                 : ${rec.year1RoiLow.toFixed(1)}:1 – ${rec.year1RoiHigh.toFixed(1)}:1`);
  lines.push("");
  lines.push("6-tier wholesale-discount matrix (per voice profile):");
  for (const [voice, desc] of Object.entries(rec.wholesaleDiscountMatrix)) {
    lines.push(`  ${voice.padEnd(13)} : ${desc}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) lines.push(`  ${step}`);
  lines.push("");
  return lines.join("\n");
}

export function pathBadgeClasses(path: PathName): string {
  if (path === "A") return "rounded border border-sky-500/40 bg-sky-500/15 px-2 py-1 text-sky-700 dark:text-sky-300 font-mono";
  if (path === "B") return "rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-emerald-700 dark:text-emerald-300 font-mono";
  return "rounded border border-violet-500/40 bg-violet-500/15 px-2 py-1 text-violet-700 dark:text-violet-300 font-mono";
}

export function pathLongLabel(path: PathName): string {
  if (path === "A") return "Path A · Faire + Tundra + Ankorstore + Handshake marketplace-only";
  if (path === "B") return "Path B · + Shopify B2B (DEFAULT) — $500k-$5M GMV";
  return "Path C · Full B2B-orchestration (RSP/KeHE/UNFI + Amazon Business + EDI 832/850)";
}

// Helper: clamp a number to the [min, max] range.
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}