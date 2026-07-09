/**
 * Marketplace-expansion Path A / B / C scorer — direct TypeScript port of
 * `/scripts/marketplace_unit_economics.py`.
 *
 * Used by the interactive `<MarketplacePathCalculator />` component on
 * the `/marketplace` page. The math, defaults, thresholds, and 6-step
 * build sequence strings are kept byte-identical to the Python CLI so
 * an operator can sanity-check the same numbers in the browser and the
 * terminal without drift.
 *
 * Companion to:
 * - /research/06-marketplace-expansion.md (the 5-pillar framework + 3 GMV-tier paths)
 * - /playbooks/13-marketplace-launch.md (4-phase Amazon + Walmart + EU launch ladder)
 * - /assets/15-marketplace-listing-card.md (paste-ready 5-marketplace x 5-voice listing copy)
 * - /dashboard/app/marketplace/page.tsx (operator-surface route)
 *
 * Scoring rule (mirrors research/06 §GMV-tier paths + playbook 13 §Prerequisites):
 *   - us_gmv < $500k                         → defer (Path A surfaced as audit only)
 *   - us_gmv $500k-$1M                       → Path A (Amazon-only)
 *   - us_gmv $1M-$5M                         → Path A or B (B is DEFAULT once Walmart-ready)
 *   - us_gmv $5M-$10M                        → Path B (Amazon + Walmart) DEFAULT
 *   - us_gmv $10M+                           → Path C (all marketplaces including international)
 *   - category = consumables                 → upgrade one tier (Subscribe-and-Save)
 *   - category = luxury                      → downgrade one tier (25-35% Amazon-Halo cannibalization)
 *   - amazon_fulfillment_mode = FBM         → downgrade one tier (no FBA carrying cost)
 *   - brand_registry_status = pending        → defer (Brand Registry is canonical Phase 1 prereq)
 *   - has_uspto_trademark = False            → defer (Brand Registry requires a LIVE trademark)
 *   - operator_capacity_hours_per_week < 5   → defer (Phase 1 Amazon requires 5 hr/wk ongoing)
 *
 * Why hermetic: this module does not call Amazon Seller Central / Walmart
 * Seller Center / Target Plus Roundel / Amazon Attribution / Triple Whale
 * APIs. The inputs are operator-supplied via the form; the cost stack +
 * per-path projection + 6-step build sequence are derived from research/06
 * + playbook 13 + asset 15 (the canonical benchmarks the workspace
 * already ships). The math is identical to the Python CLI so the
 * operator can stress-test path-selection without spinning up a venv.
 */

export type PathName = "A" | "B" | "C";

export type Category =
  | "default"
  | "consumables"
  | "luxury"
  | "sustainable"
  | "gen_z"
  | "b2b"
  | "fragile"
  | "subscription";

export type FulfillmentMode = "FBA" | "FBM" | "SFP" | "hybrid";

export type BrandRegistryStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "rejected"
  | "not_applicable";

export interface BrandChannelInputs {
  usGmv: number;
  aov: number;
  contributionMarginPct: number; // 0..100
  category: Category;
  amazonFulfillmentMode: FulfillmentMode;
  brandRegistryStatus: BrandRegistryStatus;
  hasUsptoTrademark: boolean;
  operatorCapacityHoursPerWeek: number;
}

export interface PathRecommendation {
  path: PathName;
  marketplaces: string[];
  defaultMarketplacePick: string;
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  year1IncrementalRevenuePctLow: number;
  year1IncrementalRevenuePctHigh: number;
  year1IncrementalRevenueLow: number;
  year1IncrementalRevenueHigh: number;
  year1DtcCannibalizationRateLow: number;
  year1DtcCannibalizationRateHigh: number;
  year1AdjustedNetRevenueLow: number;
  year1AdjustedNetRevenueHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  marketplaceRevenueBreakdown: Record<string, number>;
  buildSequence: string[];
}

// ----- Path band thresholds (US DTC GMV) ---------------------------------

export const PATH_A_FLOOR = 500_000;
export const PATH_B_FLOOR = 1_000_000;
export const PATH_C_FLOOR = 10_000_000;

// ----- Path costs (USD, from research/06 §Cost & ROI estimate) ------------

// Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high)
const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [5_000, 15_000, 1_000, 2_500],
  B: [10_000, 25_000, 2_500, 5_000],
  C: [50_000, 100_000, 10_000, 20_000],
};

// Year-1 incremental net revenue bands (% of US-DTC-GMV)
const PATH_INCREMENTAL_REVENUE_PCT: Record<PathName, [number, number]> = {
  A: [20.0, 45.0],
  B: [30.0, 70.0],
  C: [40.0, 100.0],
};

// Year-1 DTC cannibalization rate
const PATH_DTC_CANNIBALIZATION_RATE: Record<PathName, [number, number]> = {
  A: [10.0, 20.0],
  B: [15.0, 25.0],
  C: [20.0, 35.0],
};

// Year-1 ROI bands (gross-revenue / cost, pre-cannibalization adjustment)
const PATH_ROI: Record<PathName, [number, number]> = {
  A: [5.0, 12.0],
  B: [8.0, 18.0],
  C: [6.0, 14.0],
};

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

// Path marketplace scope
const PATH_MARKETPLACES: Record<PathName, string[]> = {
  A: ["Amazon US (3P + Brand Registry + FBA + Sponsored Products + DSP branded defense)"],
  B: [
    "Amazon US (Path A fully)",
    "Walmart US (3P + WFS + Sponsored Products + Brand Portal)",
  ],
  C: [
    "Amazon US",
    "Walmart US",
    "Target Plus (Roundel application)",
    "Amazon EU (DE + FR + IT + ES + NL)",
    "Amazon JP",
    "bol",
    "Zalando",
    "Cdiscount",
  ],
};

const PATH_DEFAULT_MARKETPLACE_PICK: Record<PathName, string> = {
  A: "Amazon US (default Path A; 56% of US product-searches per Jungle Scout 2024)",
  B: "Amazon US + Walmart US (default Path B; Amazon first then Walmart at $5M+ GMV)",
  C: "All 8 marketplaces (default Path C; US + EU + JP + Target Plus)",
};

const MARKETPLACE_REVENUE_SHARES: Record<PathName, Record<string, number>> = {
  A: { "Amazon US": 100.0 },
  B: { "Amazon US": 65.0, "Walmart US": 35.0 },
  C: {
    "Amazon US": 35.0,
    "Walmart US": 15.0,
    "Target Plus": 8.0,
    "Amazon EU": 22.0,
    "Amazon JP": 8.0,
    bol: 5.0,
    Zalando: 4.0,
    Cdiscount: 3.0,
  },
};

// ----- Upgrade / downgrade gate toggles -----------------------------------
const CONSUMABLES_UPGRADE_ENABLED = true;
const LUXURY_DOWNGRADE_ENABLED = true;
const FBM_DOWNGRADE_ENABLED = true;
const REGISTRY_DEFER_ENABLED = true;
const TRADEMARK_DEFER_ENABLED = true;
export const CAPACITY_GATE_HR_WK = 5;

// ----- Build sequence (mirrors playbook 13 §Phase 1+2+3+4) ----------------

const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1 (5 hr) — Pick path + Amazon scope: Path A = Amazon US 3P + Brand Registry + FBA. Verify ≥$500k US DTC GMV for 3 consecutive months + Move #1 + #4 + #6 + #8 shipped per research/06 §Prereq #1.",
    "Step 2 (4 hr) — USPTO trademark registration + Amazon Brand Registry enrollment: file USPTO trademark (~$750 + 8-12 weeks) → enroll in Amazon Brand Registry (free, requires LIVE trademark in TSDR) per playbook 13 §Phase 1 Step 1.1+1.2.",
    "Step 3 (4 hr) — Seller Central 1P-vs-3P decision + FBA inbound: choose 3P (default for $500k-$5M GMV per research/06 §Pillar 1) → create FBA shipment + SKU labeling (FNSKU barcodes) + inbound inventory ≥50 units hero SKU.",
    "Step 4 (8 hr) — Listing creation + A+ content + Brand Store + backend keywords: title (≤200 chars, ≤2.5% keyword density) + 5 bullets + description + A+ content modules + Brand Store + backend search terms per asset 15 §paste-ready per-marketplace per-voice templates.",
    "Step 5 (2 hr) — Sponsored Products + Sponsored Brands launch: $50/day Sponsored Products auto + $30/day Sponsored Brands + Amazon DSP branded-keyword defense $500-$2,000/mo per playbook 13 §Phase 1 Step 1.7+1.10.",
    "Step 6 (5 hr/wk ongoing) — Vine review acquisition + Buy-Box monitoring + Triple Whale Marketplace Sync: Vine $200/SKU → 50+ reviews in first 30 days → Buy-Box >90% → Triple Whale Marketplace Sync attribution per playbook 13 §Phase 1 Step 1.8+1.11.",
  ],
  B: [
    "Step 1 (10 hr) — Pick path + dual-marketplace scope: Path B = Amazon US fully + Walmart US 3P. Verify ≥$1M US DTC GMV + Amazon Path A steady-state (60+ days) + Move #1 + #4 + #6 + #8 shipped per research/06 §Prereq #1.",
    "Step 2 (6 hr) — Amazon DSP branded-keyword defense + Walmart Brand Registry: Amazon DSP $1,500-$3,000/mo branded-keyword bidding → reduce brand-search-impression-share-loss → Walmart Brand Portal enrollment (free) per playbook 13 §Phase 2 Step 2.1+2.3.",
    "Step 3 (8 hr) — Walmart Seller Center setup + WFS inbound: apply at seller.walmart.com → WFS (Walmart Fulfillment Services) → create WFS shipment + SKU labeling + inbound inventory ≥50 units hero SKU per playbook 13 §Phase 2 Step 2.2.",
    "Step 4 (10 hr) — Walmart listing creation + Walmart Sponsored Products + Walmart Connect: per-asset-15 templates → Walmart Sponsored Products $30/day + Walmart Connect $15/day → Walmart Buy-Box ownership >85% per playbook 13 §Phase 2 Step 2.4+2.6.",
    "Step 5 (6 hr) — Triple Whale Walmart sync + cross-marketplace Buy-Box monitoring: Triple Whale Walmart integration → combine Amazon + Walmart Buy-Box + ROAS + reviews view → weekly Monday morning review cadence per playbook 13 §Phase 2 Step 2.7+2.10.",
    "Step 6 (10 hr/wk ongoing) — Dual-marketplace PPC + dual-marketplace SEO + cross-marketplace inventory-routing: combined-Amazon+Walmart ACoS <30% monitoring → cross-marketplace-inventory-turn >6x/yr → dedicated marketplace-manager-or-founder-operator per playbook 13 §Phase 2 Step 2.9+2.10.",
  ],
  C: [
    "Step 1 (20 hr) — Pick path + multi-marketplace architecture: Path C = Path B fully + Amazon EU (DE + FR + IT + ES + NL) + bol + Zalando + Cdiscount + Amazon JP + Target Plus + Walmart International (CA + MX). Verify ≥$10M US DTC GMV + Path B steady-state + dedicated marketplace manager per research/06 §Prereq #1.",
    "Step 2 (30 hr) — EU compliance stack + Pan-European FBA: VAT-MOSS registration ($2k-$5k one-time) + CE marking + EPR registration + GPSR Responsible-Person service ($10k-$30k one-time + $2k-$10k/yr) + Pan-European FBA enrollment + inventory distribution across EU fulfillment centers per playbook 13 §Phase 3 Step 3.1+3.2.",
    "Step 3 (40 hr) — Per-marketplace seller-account setup + per-marketplace listings: Amazon EU 5-marketplaces (DE + FR + IT + ES + NL) + bol seller account + Zalando Partner Program + Cdiscount Pro subscription + Amazon JP seller + Target Plus Roundel application + Walmart International (CA + MX) per playbook 13 §Phase 3 Step 3.3.",
    "Step 4 (24 hr) — Per-marketplace language localization + per-marketplace returns-infrastructure: per-marketplace-translated title + bullets + description + A+ content per language (DE + FR + IT + ES + NL + JP) + per-marketplace returns-infrastructure + per-marketplace PPC launch per playbook 13 §Phase 3 Step 3.4.",
    "Step 5 (16 hr) — Target Plus wholesale-discount setup + Walmart International cross-border fulfillment: Target Plus wholesale discount (typically 8-15% off retail) + Walmart International cross-border + cross-marketplace inventory-routing algorithm per playbook 13 §Phase 4 Step 4.1+4.2.",
    "Step 6 (25 hr/wk ongoing + dedicated marketplace manager) — Per-marketplace ACoS + per-marketplace CAC payback + blended LTV:CAC across all channels: per-marketplace ACoS monitoring + per-marketplace CAC payback <12 months + blended-LTV:CAC >3:1 across Shopify + Amazon + Walmart + EU marketplaces + JP per playbook 13 §Phase 4 Step 4.3+4.4.",
  ],
};

function buildSequenceForPath(path: PathName): string[] {
  return [...BUILD_SEQUENCE_TEMPLATES[path]];
}

function classifyCategory(category: string): Category {
  const valid: Category[] = [
    "default",
    "consumables",
    "luxury",
    "sustainable",
    "gen_z",
    "b2b",
    "fragile",
    "subscription",
  ];
  return (valid as string[]).includes(category) ? (category as Category) : "default";
}

function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  return "A";
}

function tierFloorText(path: PathName): string {
  if (path === "A") return `${PATH_A_FLOOR.toLocaleString()}`;
  if (path === "B") return `${PATH_B_FLOOR.toLocaleString()}`;
  return `${PATH_C_FLOOR.toLocaleString()}`;
}

function tierCeilingText(path: PathName): string {
  if (path === "A") return `${(PATH_B_FLOOR - 1).toLocaleString()}`;
  if (path === "B") return `${(PATH_C_FLOOR - 1).toLocaleString()}`;
  return "∞";
}

export function recommendPath(inputs: BrandChannelInputs): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForCapacity = false;
  let deferredForRegistry = false;
  let deferredForTrademark = false;

  // Capacity floor
  if (inputs.operatorCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Operator capacity ${inputs.operatorCapacityHoursPerWeek} hr/wk < ${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 13 §Prerequisite #8 + #22); marketplace expansion deferred until operator capacity is available.`,
    );
    deferredForCapacity = true;
  }

  // Brand Registry floor
  if (REGISTRY_DEFER_ENABLED && inputs.brandRegistryStatus === "pending") {
    justificationParts.push(
      `Brand Registry status '${inputs.brandRegistryStatus}' (playbook 13 §Gate A2); marketplace expansion deferred until USPTO trademark registration + Amazon Brand Registry enrollment are submitted at minimum.`,
    );
    deferredForRegistry = true;
  }

  // USPTO trademark floor
  if (TRADEMARK_DEFER_ENABLED && !inputs.hasUsptoTrademark) {
    justificationParts.push(
      `No USPTO trademark registered (playbook 13 §Gate A1); marketplace expansion deferred until trademark is registered. Amazon Brand Registry requires a LIVE USPTO trademark in TSDR.`,
    );
    deferredForTrademark = true;
  }

  // Base tier assignment
  let path: PathName;
  if (inputs.usGmv < PATH_A_FLOOR) {
    path = "A";
    if (
      !deferredForCapacity &&
      !deferredForRegistry &&
      !deferredForTrademark
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usGmv.toLocaleString(undefined, { maximumFractionDigits: 0 })} is below the $${PATH_A_FLOOR.toLocaleString()} marketplace-expansion entry floor; marketplace launch is deferred until US DTC GMV exceeds $${PATH_A_FLOOR.toLocaleString()} for at least 3 consecutive months (research/06 §Prerequisites). Path A is still surfaced as the recommendation for tracking (audit only).`,
      );
    }
  } else {
    path = tierForGmv(inputs.usGmv);
    if (
      !deferredForCapacity &&
      !deferredForRegistry &&
      !deferredForTrademark
    ) {
      justificationParts.push(
        `US DTC GMV $${inputs.usGmv.toLocaleString(undefined, { maximumFractionDigits: 0 })} lands in the Path ${path} tier ($${tierFloorText(path)} - $${tierCeilingText(path)} GMV).`,
      );
    }
  }

  // Upgrade / downgrade gates
  const upgrades: string[] = [];
  const downgrades: string[] = [];

  if (
    CONSUMABLES_UPGRADE_ENABLED &&
    classifyCategory(inputs.category) === "consumables"
  ) {
    upgrades.push(
      `category=${inputs.category} unlocks Subscribe-and-Save + recurring-revenue marketplaces (research/06 §Pillar 3: consumables get 15-25% higher marketplace-LTV vs default category due to repeat-purchase flywheel)`,
    );
  }

  if (
    LUXURY_DOWNGRADE_ENABLED &&
    classifyCategory(inputs.category) === "luxury"
  ) {
    downgrades.push(
      `category=${inputs.category} faces Amazon Halo 25-35% DTC-cannibalization vs 10-20% default (Marketplace Pulse 2024: luxury buyers are 3-4× more likely to search Amazon for the same brand); defer Path B/C until brand-canary discipline is fully in place (research/06 §Pillar 2)`,
    );
  }

  if (
    FBM_DOWNGRADE_ENABLED &&
    inputs.amazonFulfillmentMode === "FBM"
  ) {
    downgrades.push(
      `amazon_fulfillment_mode=${inputs.amazonFulfillmentMode} avoids Amazon's FBA pick-pack + storage + aged-inventory-surcharge; the canonical marketplace-ROI comes from FBA-driven conversion lift (Prime badge + Buy-Box), not from the cost savings (research/06 §Pillar 3)`,
    );
  }

  for (let i = 0; i < upgrades.length; i++) {
    path = RANK_PATH[Math.min(PATH_RANK[path] + 1, PATH_RANK["C"])];
  }
  for (let i = 0; i < downgrades.length; i++) {
    path = RANK_PATH[Math.max(PATH_RANK[path] - 1, PATH_RANK["A"])];
  }

  if (upgrades.length > 0 || downgrades.length > 0) {
    const parts: string[] = [];
    if (upgrades.length > 0) {
      parts.push("UPGRADES: " + upgrades.join("; "));
    }
    if (downgrades.length > 0) {
      parts.push("DOWNGRADES: " + downgrades.join("; "));
    }
    justificationParts.push(
      `Applied ${upgrades.length} upgrade(s) and ${downgrades.length} downgrade(s): ${parts.join(" ")}. Final path = ${path}.`,
    );
  } else if (
    !deferredForCapacity &&
    !deferredForRegistry &&
    !deferredForTrademark
  ) {
    justificationParts.push("All gates pass; no upgrade/downgrade applied.");
  }

  // Cost stack + lift + ROI
  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [incPctLow, incPctHigh] = PATH_INCREMENTAL_REVENUE_PCT[path];
  const [canLow, canHigh] = PATH_DTC_CANNIBALIZATION_RATE[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const incRevLow = inputs.usGmv * (incPctLow / 100);
  const incRevHigh = inputs.usGmv * (incPctHigh / 100);
  const adjustedNetLow = incRevLow * (1 - canHigh / 100);
  const adjustedNetHigh = incRevHigh * (1 - canLow / 100);

  const marketplaceRevenue: Record<string, number> = {};
  for (const [marketplace, pct] of Object.entries(
    MARKETPLACE_REVENUE_SHARES[path],
  )) {
    marketplaceRevenue[marketplace] =
      (pct / 100) * ((incRevLow + incRevHigh) / 2);
  }

  return {
    path,
    marketplaces: [...PATH_MARKETPLACES[path]],
    defaultMarketplacePick: PATH_DEFAULT_MARKETPLACE_PICK[path],
    justification: justificationParts.join(" "),
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1CostLow: costLow + 12 * recLow,
    year1CostHigh: costHigh + 12 * recHigh,
    year1IncrementalRevenuePctLow: incPctLow,
    year1IncrementalRevenuePctHigh: incPctHigh,
    year1IncrementalRevenueLow: incRevLow,
    year1IncrementalRevenueHigh: incRevHigh,
    year1DtcCannibalizationRateLow: canLow,
    year1DtcCannibalizationRateHigh: canHigh,
    year1AdjustedNetRevenueLow: adjustedNetLow,
    year1AdjustedNetRevenueHigh: adjustedNetHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    marketplaceRevenueBreakdown: marketplaceRevenue,
    buildSequence: buildSequenceForPath(path),
  };
}

// ----- Defaults (canonical Path B for $5M US DTC brand) -----------------

export const MARKETPLACE_DEFAULTS: BrandChannelInputs = {
  usGmv: 5_000_000,
  aov: 75,
  contributionMarginPct: 40,
  category: "default",
  amazonFulfillmentMode: "FBA",
  brandRegistryStatus: "approved",
  hasUsptoTrademark: true,
  operatorCapacityHoursPerWeek: 10,
};

// ----- Input validation -------------------------------------------------

export interface ValidationError {
  field: keyof BrandChannelInputs;
  message: string;
}

export function validateMarketplaceInputs(
  inputs: BrandChannelInputs,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (inputs.usGmv < 0)
    errors.push({ field: "usGmv", message: "US DTC GMV must be >= 0" });
  if (inputs.aov <= 0)
    errors.push({ field: "aov", message: "AOV must be > 0" });
  if (inputs.aov > 10_000)
    errors.push({ field: "aov", message: "AOV must be <= $10,000" });
  if (inputs.contributionMarginPct < 0 || inputs.contributionMarginPct > 100)
    errors.push({
      field: "contributionMarginPct",
      message: "Contribution margin must be 0-100%",
    });
  if (inputs.operatorCapacityHoursPerWeek < 0)
    errors.push({
      field: "operatorCapacityHoursPerWeek",
      message: "Operator capacity must be >= 0",
    });
  return errors;
}

export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return Math.round(value);
}

export function clampFloat(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ----- UI helpers --------------------------------------------------------

export function pathBadgeClasses(path: PathName): string {
  if (path === "A") return "bg-sky-100 text-sky-800 border-sky-200";
  if (path === "B")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-violet-100 text-violet-800 border-violet-200";
}

export function pathLongLabel(path: PathName): string {
  if (path === "A")
    return "Path A — Amazon US only (3P + FBA + Brand Registry)";
  if (path === "B")
    return "Path B — Amazon + Walmart US (DEFAULT for $5M+ GMV brands)";
  return "Path C — All marketplaces (US + EU + JP + Target Plus)";
}

export function categoryBadgeClasses(category: Category): string {
  if (category === "luxury") return "bg-rose-100 text-rose-800 border-rose-200";
  if (category === "consumables")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (category === "sustainable")
    return "bg-lime-100 text-lime-800 border-lime-200";
  if (category === "gen_z")
    return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
  if (category === "b2b")
    return "bg-slate-100 text-slate-800 border-slate-200";
  if (category === "fragile")
    return "bg-amber-100 text-amber-800 border-amber-200";
  if (category === "subscription")
    return "bg-cyan-100 text-cyan-800 border-cyan-200";
  return "bg-zinc-100 text-zinc-800 border-zinc-200";
}

export function fulfillmentBadgeClasses(mode: FulfillmentMode): string {
  if (mode === "FBA") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (mode === "FBM") return "bg-amber-100 text-amber-800 border-amber-200";
  if (mode === "SFP") return "bg-sky-100 text-sky-800 border-sky-200";
  return "bg-violet-100 text-violet-800 border-violet-200";
}

export function registryBadgeClasses(status: BrandRegistryStatus): string {
  if (status === "approved")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "submitted")
    return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "pending")
    return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "rejected")
    return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-zinc-100 text-zinc-800 border-zinc-200";
}

// ----- Markdown formatter (mirrors `render_human` byte-for-byte) ---------

export function renderMarketplaceMarkdown(
  inputs: BrandChannelInputs,
  rec: PathRecommendation,
): string {
  const usd = (v: number) =>
    v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const lines: string[] = [];
  lines.push("Marketplace-expansion Path A/B/C recommendation");
  lines.push("=".repeat(47));
  lines.push("");
  lines.push("Inputs:");
  lines.push(`  US DTC GMV                            : $${usd(inputs.usGmv).padStart(15)}`);
  lines.push(`  AOV                                   : $${inputs.aov.toFixed(2).padStart(15)}`);
  lines.push(`  Contribution margin                   : ${inputs.contributionMarginPct.toFixed(1).padStart(14)}%`);
  lines.push(`  Category                              : ${inputs.category}`);
  lines.push(`  Amazon fulfillment mode               : ${inputs.amazonFulfillmentMode}`);
  lines.push(`  Brand Registry status                 : ${inputs.brandRegistryStatus}`);
  lines.push(`  Has USPTO trademark                   : ${inputs.hasUsptoTrademark}`);
  lines.push(`  Operator capacity (hr/wk)             : ${String(inputs.operatorCapacityHoursPerWeek).padStart(15)}`);
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(`  Marketplaces                          : ${rec.marketplaces.length} marketplace(s) in scope`);
  for (const m of rec.marketplaces) {
    lines.push(`    - ${m}`);
  }
  lines.push(`  Default marketplace pick              : ${rec.defaultMarketplacePick}`);
  lines.push(`  Justification                         : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)             : $${usd(rec.costOneTimeLow).padStart(12)} – $${usd(rec.costOneTimeHigh)}`,
  );
  lines.push(
    `  Recurring monthly (low-high)          : $${usd(rec.costRecurringLow).padStart(12)} – $${usd(rec.costRecurringHigh)}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  Year-1 cost (low-high)                : $${usd(rec.year1CostLow).padStart(12)} – $${usd(rec.year1CostHigh)}`,
  );
  lines.push(
    `  Incremental revenue % (low-high)      : ${rec.year1IncrementalRevenuePctLow.toFixed(0)}% – ${rec.year1IncrementalRevenuePctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Incremental revenue $ (low-high)      : $${usd(rec.year1IncrementalRevenueLow).padStart(12)} – $${usd(rec.year1IncrementalRevenueHigh)}`,
  );
  lines.push(
    `  DTC cannibalization rate (low-high)   : ${rec.year1DtcCannibalizationRateLow.toFixed(0)}% – ${rec.year1DtcCannibalizationRateHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Adjusted net revenue $ (low-high)     : $${usd(rec.year1AdjustedNetRevenueLow).padStart(12)} – $${usd(rec.year1AdjustedNetRevenueHigh)}`,
  );
  lines.push(
    `  Year-1 ROI                            : ${rec.year1RoiLow.toFixed(0)}:1 – ${rec.year1RoiHigh.toFixed(0)}:1`,
  );
  lines.push("");
  lines.push("Marketplace revenue breakdown (mid estimate):");
  for (const [marketplace, revenue] of Object.entries(
    rec.marketplaceRevenueBreakdown,
  )) {
    lines.push(`  ${marketplace.padEnd(35)} : $${usd(revenue).padStart(12)}`);
  }
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}
