/**
 * 3PL migration Path A / B / C scorer — direct TypeScript port of
 * `/scripts/threepl_unit_economics.py`.
 *
 * Used by the interactive `<ThreeplPathCalculator />` component on
 * the `/3pl` page. The math, defaults, thresholds, per-path cost
 * stack, Year-1 incremental net band, ship-cost-savings band, and
 * 6-step build sequence strings are kept byte-identical to the
 * Python CLI so an operator can sanity-check the same numbers in
 * the browser and the terminal without drift.
 *
 * Companion to:
 * - /research/07-3pl-migration.md (the 5-pillar framework + 3 GMV-tier paths)
 * - /playbooks/14-3pl-migration.md (4-phase operator build)
 * - /assets/15-3pl-selection-card.md (paste-ready 7-3PL × 5-voice cost-comparison)
 * - /dashboard/app/3pl/page.tsx (operator-surface route)
 *
 * Scoring rule (mirrors research/07 §GMV-tier paths + playbook 14
 * §Prerequisites + asset 15 §3-tier size-match decision matrix):
 *   - orders_per_month < 500           → Path A as deferral (3PL break-even floor)
 *   - orders_per_month 500–2,000       → Path A (SMB 3PL solo — ShipBob Starter / SFN)
 *   - orders_per_month 2,000–10,000    → Path B (mid-market multi-warehouse) DEFAULT
 *   - orders_per_month 10,000+         → Path C (enterprise multi-3PL orchestration)
 *   - has_warehouse_lease = False      → downgrade one tier (no savings to unlock)
 *   - ship_cost_per_order < $6         → downgrade one tier (cost-benefit less compelling)
 *   - sku_complexity = subscription    → upgrade one tier (kitting + bundling required)
 *   - international_volume_pct >= 20%  → upgrade one tier (intl 3PL footprint needed)
 *   - operator_capacity < 2 hr/wk      → defer (insufficient capacity per Prereq #12)
 */

export type PathName = "A" | "B" | "C";
export type SkuComplexity =
  | "standard"
  | "subscription"
  | "bundles"
  | "fragile"
  | "hazmat"
  | "temperature_controlled";

export interface BrandOpsInputs {
  ordersPerMonth: number;
  aov: number; // USD, 0 < aov <= 10_000
  currentShipCostPerOrder: number; // USD, >= 0
  currentShipTimeDays: number; // P50 days, >= 0
  hasWarehouseLease: boolean;
  skuCount: number;
  skuComplexity: SkuComplexity;
  internationalVolumePct: number; // 0..100
  operatorCapacityHoursPerWeek: number; // floor 2
}

export interface PathRecommendation {
  path: PathName;
  warehouses: string[];
  threeplDefault: string;
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1ThreeplCostLow: number;
  year1ThreeplCostHigh: number;
  year1IncrementalNetLow: number;
  year1IncrementalNetHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  shipCostSavingsPctLow: number;
  shipCostSavingsPctHigh: number;
  shipTimeImprovementDaysLow: number;
  shipTimeImprovementDaysHigh: number;
  buildSequence: string[];
}

export interface PerPathSavings {
  annualOrders: number;
  year1ShipCostSavingsLow: number;
  year1ShipCostSavingsMid: number;
  year1ShipCostSavingsHigh: number;
  year1WarehouseSavingsMid: number;
  year1NpsLiftMid: number;
  year1IncrementalNetLow: number;
  year1IncrementalNetHigh: number;
  year1ThreeplCostLow: number;
  year1ThreeplCostHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  shipTimeImprovementDaysLow: number;
  shipTimeImprovementDaysHigh: number;
}

// ----- Canonical thresholds (research/07 §Path A/B/C) --------------------

const PATH_A_FLOOR = 500;
const PATH_B_FLOOR = 2_000;
const PATH_C_FLOOR = 10_000;

const WAREHOUSE_LEASE_DOWNGRADE_ENABLED = true;
const SHIP_COST_DOWNGRADE_THRESHOLD = 6.0;
const SUBSCRIPTION_UPGRADE_ENABLED = true;
const INTERNATIONAL_UPGRADE_THRESHOLD_PCT = 20;
const CAPACITY_GATE_HR_WK = 2;

const PATH_RANK: Record<PathName, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, PathName> = { 0: "A", 1: "B", 2: "C" };

// Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [3_000.0, 8_000.0, 700.0, 1_500.0],
  B: [8_000.0, 25_000.0, 2_000.0, 4_500.0],
  C: [50_000.0, 150_000.0, 8_000.0, 25_000.0],
};

const PATH_THREEPL_COST_YEAR1: Record<PathName, [number, number]> = {
  A: [8_400.0, 18_000.0],
  B: [24_000.0, 54_000.0],
  C: [96_000.0, 300_000.0],
};

const PATH_INCREMENTAL_NET_YEAR1: Record<PathName, [number, number]> = {
  A: [9_000.0, 75_000.0],
  B: [66_000.0, 420_000.0],
  C: [620_000.0, 5_600_000.0],
};

const PATH_ROI: Record<PathName, [number, number]> = {
  A: [5.0, 8.0],
  B: [8.0, 16.0],
  C: [7.0, 14.0],
};

const PATH_SHIP_COST_SAVINGS_PCT: Record<PathName, [number, number]> = {
  A: [5.0, 15.0],
  B: [10.0, 20.0],
  C: [15.0, 25.0],
};

const PATH_SHIP_TIME_IMPROVEMENT_DAYS: Record<PathName, [number, number]> = {
  A: [0.5, 1.5],
  B: [1.0, 3.0],
  C: [2.0, 5.0],
};

const PATH_WAREHOUSES: Record<PathName, string[]> = {
  A: ["Single 3PL warehouse (ShipBob or Shopify Fulfillment Network)"],
  B: ["Multi-warehouse 2-4 sites (East + West coast + optionally Central)"],
  C: ["Distributed 3PL (US + per-region 3PL for EU + UK + CA + AU + JP)"],
};

const PATH_DEFAULT_3PL: Record<PathName, string> = {
  A: "ShipBob Starter (default Tier 1; Shopify-native integration + no minimum)",
  B: "ShipBob Mid-Market (default Tier 2; multi-warehouse + dedicated AM)",
  C: "Stord + Flowspace + Extensiv orchestrator (multi-3PL enterprise)",
};

// ----- Build-sequence templates (mirrors asset 15 §3-tier size-match
// decision matrix + playbook 14 §Phase 1+2+3+4) ---------------------------

const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1 (1 hr) — Pick path + 3PL: Path A = ShipBob Starter (default Tier 1) OR Shopify Fulfillment Network (Shopify-Plus brands). Verify ≥500 orders/mo for 3 consecutive months per research/07 §Prereq #2.",
    "Step 2 (2 hr) — RFQ to 3+ 3PLs (ShipBob + Shopify Fulfillment Network + one regional SMB 3PL): request quote on pick-pack + storage + receiving + kitting + returns + SLA-ship-time per asset 15 §RFQ brief template.",
    "Step 3 (3 hr) — Sign contract: volume tier (committed-minimum-volume-discount) + returns-tier + 95%+ SLA with financial-penalty-for-misses + $1M+ inventory-insurance per asset 15 §8 SLA-defense contract clauses.",
    "Step 4 (4 hr) — WMS integration build: Shopify-ShipBob SKU-mapping + shipping-rate-card override + return-portal per playbook 14 §Phase 1 Step 1.5.",
    "Step 5 (2 hr) — Test orders: 10 test orders in 3PL sandbox; verify pick-pack-accuracy ≥99.5% + ship-cost matches quoted + branded packing slip renders correctly.",
    "Step 6 (1 hr/wk ongoing) — Per-3PL ship-cost monitoring + weekly SLA report review + NPS-by-fulfillment-channel cohort slice per playbook 14 §Phase 4.",
  ],
  B: [
    "Step 1 (1 hr) — Pick path + 3PL: Path B = ShipBob Mid-Market (default Tier 2; multi-warehouse) OR ShipMonk OR Red Stag (large-parcel). Verify ≥2,000 orders/mo + ≥1 SKU with consistent demand + Move #1 + #4 + #6 + #8 shipped.",
    "Step 2 (3 hr) — RFQ to 5+ 3PLs + multi-warehouse negotiation: 3 mid-market 3PLs (ShipBob + ShipMonk + Red Stag) + 2 enterprise-tier 3PLs (Stord + Flowspace) for upgrade-path. Negotiate multi-warehouse tier (drops pick-pack at 5,000+ orders/mo).",
    "Step 3 (4 hr) — Sign contract + multi-warehouse setup: Path A SLA-defense clauses + multi-warehouse tier + dedicated account-manager + cross-warehouse-balance monitoring per playbook 14 §Phase 2 Step 2.2.",
    "Step 4 (8 hr) — WMS integration + per-warehouse inventory-routing algorithm: Shopify-3PL SKU-mapping + per-warehouse-routing logic + cross-warehouse-balance-monitoring dashboard + 2nd-warehouse-onboarding pilot.",
    "Step 5 (8 hr) — Inventory pull + 3PL inbound: SKU-level cycle-count + barcoded-receiving + 1-week reconciliation per research/07 §Pitfall 1 (lost inventory) fix. Run parallel-ship week where 3PL ships 50/50 with existing warehouse.",
    "Step 6 (3 hr/wk ongoing) — Multi-warehouse ship-cost monitoring + ship-time P50+P95 tracking + branded-packing-slip A/B test + NPS-by-fulfillment-channel cohort slice per playbook 14 §Phase 3+4.",
  ],
  C: [
    "Step 1 (2 hr) — Pick path + multi-3PL architecture: Path C = Stord (orchestrator) + Flowspace (B2B) + Extensiv (per-region specialist) + ShipBob (SMB SKUs) + Red Stag (large/heavy SKUs) + per-market 3PL for EU + UK + CA + AU + JP per research/07 §Pillar 4.",
    "Step 2 (8 hr) — RFQ + 3PL orchestrator contracting: Stord / Flowspace / Extensiv + per-region 3PLs (EU + UK + CA + AU + JP) + freight + parcel + returns. Negotiate multi-region SLA dashboards + dedicated supply-chain-manager + B2B-fulfillment add-on.",
    "Step 3 (8 hr) — Sign contracts + multi-region setup: Path B SLA-defense clauses + multi-region-tier + per-region-SLA-financial-penalties + $5M+ inventory-insurance + 30-day-notice-no-penalty-termination per playbook 14 §Phase 3.",
    "Step 4 (24 hr) — WMS integration + Extensiv orchestrator build + per-region inventory-routing: Shopify-Stord-Flowspace-Extensiv SKU-mapping + per-region-routing logic + freight-parcel-returns-orchestration.",
    "Step 5 (24 hr) — Inventory pull + per-region 3PL inbound: SKU-level cycle-count + per-region-pilot + 1-week reconciliation + international 3PL footpring enablement per research/07 §Pillar 4 (2-3 day ship time to EU + UK + CA + AU + JP).",
    "Step 6 (15 hr/wk ongoing + dedicated supply-chain manager) — Per-region ship-cost monitoring + ship-time P50+P95 tracking + NPS-by-fulfillment-channel cohort slice + multi-region SLA dashboards + per-region RFQ-re-bid per playbook 14 §Phase 4.",
  ],
};

// ----- Defaults -----------------------------------------------------------

export const THREEPL_DEFAULTS: BrandOpsInputs = {
  ordersPerMonth: 2500,
  aov: 75.0,
  currentShipCostPerOrder: 8.5,
  currentShipTimeDays: 3.0,
  hasWarehouseLease: true,
  skuCount: 50,
  skuComplexity: "standard",
  internationalVolumePct: 5.0,
  operatorCapacityHoursPerWeek: 5,
};

// ----- SKU complexity classification --------------------------------------

function classifySkuComplexity(skuComplexity: string): SkuComplexity {
  // bundles uses the same kitting-SOP as subscription per research/07 Pillar 1.
  if (skuComplexity === "bundles") return "subscription";
  if (
    skuComplexity === "standard" ||
    skuComplexity === "subscription" ||
    skuComplexity === "fragile" ||
    skuComplexity === "hazmat" ||
    skuComplexity === "temperature_controlled"
  ) {
    return skuComplexity as SkuComplexity;
  }
  return "standard";
}

function tierFloorText(path: PathName): string {
  if (path === "A") return `${PATH_A_FLOOR}`;
  if (path === "B") return `${PATH_B_FLOOR.toLocaleString("en-US")}`;
  return `${PATH_C_FLOOR.toLocaleString("en-US")}`;
}

function tierCeilingText(path: PathName): string {
  if (path === "A") return `${(PATH_B_FLOOR - 1).toLocaleString("en-US")}`;
  if (path === "B") return `${(PATH_C_FLOOR - 1).toLocaleString("en-US")}`;
  return "∞";
}

function tierForOrders(ordersPerMonth: number): PathName {
  if (ordersPerMonth >= PATH_C_FLOOR) return "C";
  if (ordersPerMonth >= PATH_B_FLOOR) return "B";
  return "A";
}

// ----- Input validation ---------------------------------------------------

export function validateThreeplInputs(inputs: BrandOpsInputs): string | null {
  if (inputs.ordersPerMonth < 0)
    return `orders_per_month must be >= 0, got ${inputs.ordersPerMonth}`;
  if (inputs.aov <= 0) return `aov must be > 0, got ${inputs.aov}`;
  if (inputs.aov > 10_000.0)
    return `aov must be <= $10,000, got ${inputs.aov}`;
  if (inputs.currentShipCostPerOrder < 0)
    return `current_ship_cost_per_order must be >= 0, got ${inputs.currentShipCostPerOrder}`;
  if (inputs.currentShipTimeDays < 0)
    return `current_ship_time_days must be >= 0, got ${inputs.currentShipTimeDays}`;
  const validComplexities: SkuComplexity[] = [
    "standard",
    "subscription",
    "bundles",
    "fragile",
    "hazmat",
    "temperature_controlled",
  ];
  if (!validComplexities.includes(inputs.skuComplexity))
    return `sku_complexity must be one of ${validComplexities.join("/")}, got "${inputs.skuComplexity}"`;
  if (inputs.internationalVolumePct < 0 || inputs.internationalVolumePct > 100)
    return `international_volume_pct must be 0-100, got ${inputs.internationalVolumePct}`;
  if (inputs.skuCount < 0) return `sku_count must be >= 0, got ${inputs.skuCount}`;
  if (inputs.operatorCapacityHoursPerWeek < 0)
    return `operator_capacity_hours_per_week must be >= 0, got ${inputs.operatorCapacityHoursPerWeek}`;
  return null;
}

// ----- Core scoring rule --------------------------------------------------

export function recommendPath(inputs: BrandOpsInputs): PathRecommendation {
  const justificationParts: string[] = [];
  let deferredForCapacity = false;

  // Capacity floor: defer if operator has insufficient time.
  if (inputs.operatorCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    justificationParts.push(
      `Operator capacity ${inputs.operatorCapacityHoursPerWeek} hr/wk < ` +
        `${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 14 §Prerequisite #12); ` +
        `3PL migration deferred until operator capacity is available.`,
    );
    deferredForCapacity = true;
  }

  // Base tier assignment.
  let path: PathName;
  if (inputs.ordersPerMonth < PATH_A_FLOOR) {
    // Path A as deferral when below the 500 orders/mo floor.
    path = "A";
    if (!deferredForCapacity) {
      justificationParts.push(
        `Orders ${inputs.ordersPerMonth}/mo is below the ${PATH_A_FLOOR}/mo ` +
          `3PL break-even floor; 3PL migration is deferred until order volume ` +
          `exceeds ${PATH_A_FLOOR}/mo for at least 3 consecutive months ` +
          `(research/07 §Prerequisites). Path A is still surfaced as the ` +
          `recommendation for tracking (audit only).`,
      );
    }
  } else {
    path = tierForOrders(inputs.ordersPerMonth);
    if (!deferredForCapacity) {
      justificationParts.push(
        `Orders ${inputs.ordersPerMonth.toLocaleString("en-US")}/mo lands in the Path ${path} tier ` +
          `(${tierFloorText(path)}-${tierCeilingText(path)} orders/mo).`,
      );
    }
  }

  // Apply upgrade/downgrade gates.
  const upgrades: string[] = [];
  const downgrades: string[] = [];

  if (
    WAREHOUSE_LEASE_DOWNGRADE_ENABLED &&
    !inputs.hasWarehouseLease
  ) {
    downgrades.push(
      "no warehouse lease (no lease-cost savings to unlock; the canonical " +
        "3PL ROI comes from eliminating lease + labor + WMS costs per " +
        "research/07 §Pillar 2)",
    );
  }

  if (inputs.currentShipCostPerOrder <= SHIP_COST_DOWNGRADE_THRESHOLD) {
    downgrades.push(
      `current ship cost $${inputs.currentShipCostPerOrder.toFixed(2)}/order < ` +
        `$${SHIP_COST_DOWNGRADE_THRESHOLD.toFixed(2)} (low current ship cost; the canonical ` +
        `3PL savings come from carrier-rate negotiation + zone-skipping per ` +
        `research/07 §Pillar 2)`,
    );
  }

  if (
    SUBSCRIPTION_UPGRADE_ENABLED &&
    classifySkuComplexity(inputs.skuComplexity) === "subscription"
  ) {
    upgrades.push(
      `sku_complexity=${inputs.skuComplexity} requires 3PL with kitting-SOP + ` +
        `custom-box capability (research/07 §Pillar 1 Tier 2 default)`,
    );
  }

  if (inputs.internationalVolumePct >= INTERNATIONAL_UPGRADE_THRESHOLD_PCT) {
    upgrades.push(
      `international volume ${inputs.internationalVolumePct.toFixed(0)}% ≥ ` +
        `${INTERNATIONAL_UPGRADE_THRESHOLD_PCT}% threshold (research/07 §Pillar 4: ` +
        `international 3PL footprint unlocks 2-3 day ship time to EU + UK + CA + AU + JP)`,
    );
  }

  // Apply upgrades first (raise the tier), then the downgrades (lower it).
  for (let i = 0; i < upgrades.length; i++) {
    path = RANK_PATH[Math.min(PATH_RANK[path] + 1, PATH_RANK["C"])];
  }
  for (let i = 0; i < downgrades.length; i++) {
    path = RANK_PATH[Math.max(PATH_RANK[path] - 1, PATH_RANK["A"])];
  }

  if (upgrades.length > 0 || downgrades.length > 0) {
    justificationParts.push(
      `Applied ${upgrades.length} upgrade(s) and ${downgrades.length} downgrade(s): ` +
        (upgrades.length > 0 ? "UPGRADES: " + upgrades.join("; ") + " " : "") +
        (downgrades.length > 0 ? "DOWNGRADES: " + downgrades.join("; ") : "") +
        `. Final path = ${path}.`,
    );
  } else if (!deferredForCapacity) {
    justificationParts.push("All gates pass; no upgrade/downgrade applied.");
  }

  // Cost stack + lift + ROI from the canonical path tables.
  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [y1ThreeplLow, y1ThreeplHigh] = PATH_THREEPL_COST_YEAR1[path];
  const [y1NetLow, y1NetHigh] = PATH_INCREMENTAL_NET_YEAR1[path];
  const [roiLow, roiHigh] = PATH_ROI[path];
  const [scsLow, scsHigh] = PATH_SHIP_COST_SAVINGS_PCT[path];
  const [stiLow, stiHigh] = PATH_SHIP_TIME_IMPROVEMENT_DAYS[path];

  return {
    path,
    warehouses: [...PATH_WAREHOUSES[path]],
    threeplDefault: PATH_DEFAULT_3PL[path],
    justification: justificationParts.join(" "),
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1ThreeplCostLow: y1ThreeplLow,
    year1ThreeplCostHigh: y1ThreeplHigh,
    year1IncrementalNetLow: y1NetLow,
    year1IncrementalNetHigh: y1NetHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    shipCostSavingsPctLow: scsLow,
    shipCostSavingsPctHigh: scsHigh,
    shipTimeImprovementDaysLow: stiLow,
    shipTimeImprovementDaysHigh: stiHigh,
    buildSequence: [...BUILD_SEQUENCE_TEMPLATES[path]],
  };
}

// ----- Per-path savings projection ---------------------------------------

export function projectPerPathSavings(
  inputs: BrandOpsInputs,
  rec: PathRecommendation,
): PerPathSavings {
  const annualOrders = inputs.ordersPerMonth * 12.0;

  const scsMid =
    (rec.shipCostSavingsPctLow + rec.shipCostSavingsPctHigh) / 2.0 / 100.0;
  const year1ShipCostSavingsMid =
    inputs.currentShipCostPerOrder * scsMid * annualOrders;
  const year1ShipCostSavingsLow =
    inputs.currentShipCostPerOrder *
    (rec.shipCostSavingsPctLow / 100.0) *
    annualOrders;
  const year1ShipCostSavingsHigh =
    inputs.currentShipCostPerOrder *
    (rec.shipCostSavingsPctHigh / 100.0) *
    annualOrders;

  // Warehouse-cost reduction: $500-$5k/mo per research/07 §Pillar 2 (Path A floor).
  let year1WarehouseSavingsMid: number;
  if (rec.path === "A") year1WarehouseSavingsMid = 12 * 2_750.0;
  else if (rec.path === "B") year1WarehouseSavingsMid = 12 * 6_500.0;
  else year1WarehouseSavingsMid = 12 * 30_000.0;

  // NPS lift: 5-10 points × $50-200 per NPS point (research/07 §Pillar 2).
  const npsLiftLow = 5 * 100.0 * 0.5;
  const npsLiftHigh = 10 * 200.0 * 0.5;
  const year1NpsLiftMid = (npsLiftLow + npsLiftHigh) / 2.0;

  return {
    annualOrders,
    year1ShipCostSavingsLow,
    year1ShipCostSavingsMid,
    year1ShipCostSavingsHigh,
    year1WarehouseSavingsMid,
    year1NpsLiftMid,
    year1IncrementalNetLow: rec.year1IncrementalNetLow,
    year1IncrementalNetHigh: rec.year1IncrementalNetHigh,
    year1ThreeplCostLow: rec.year1ThreeplCostLow,
    year1ThreeplCostHigh: rec.year1ThreeplCostHigh,
    year1RoiLow: rec.year1RoiLow,
    year1RoiHigh: rec.year1RoiHigh,
    shipTimeImprovementDaysLow: rec.shipTimeImprovementDaysLow,
    shipTimeImprovementDaysHigh: rec.shipTimeImprovementDaysHigh,
  };
}

// ----- Markdown report (byte-identical to render_human()) ----------------

export function renderThreeplMarkdown(
  inputs: BrandOpsInputs,
  rec: PathRecommendation,
): string {
  const lines: string[] = [];
  lines.push("3PL migration Path A/B/C recommendation");
  lines.push("==========================================");
  lines.push("");
  lines.push("Inputs:");
  lines.push(
    `  Orders per month                      : ${padNum(inputs.ordersPerMonth, 15)}`,
  );
  lines.push(
    `  AOV                                   : $${padNum(inputs.aov, 13, 2)}`,
  );
  lines.push(
    `  Current ship cost per order           : $${padNum(inputs.currentShipCostPerOrder, 13, 2)}`,
  );
  lines.push(
    `  Current ship time P50 (days)          : ${padNum(inputs.currentShipTimeDays, 15, 1)}`,
  );
  lines.push(
    `  Has warehouse lease                   : ${String(inputs.hasWarehouseLease).padEnd(15)}`,
  );
  lines.push(
    `  SKU count                             : ${padNum(inputs.skuCount, 15)}`,
  );
  lines.push(
    `  SKU complexity                        : ${inputs.skuComplexity}`,
  );
  lines.push(
    `  International volume %                : ${padNum(inputs.internationalVolumePct, 14, 0)}%`,
  );
  lines.push(
    `  Operator capacity (hr/wk)             : ${padNum(inputs.operatorCapacityHoursPerWeek, 15)}`,
  );
  lines.push("");
  lines.push(`Recommendation: Path ${rec.path}`);
  lines.push(`  Warehouses                           : ${rec.warehouses[0]}`);
  lines.push(`  Default 3PL pick                     : ${rec.threeplDefault}`);
  lines.push(`  Justification                        : ${rec.justification}`);
  lines.push("");
  lines.push("Cost stack:");
  lines.push(
    `  One-time setup (low-high)             : $${padNum(rec.costOneTimeLow, 10, 0)} – $${padNum(rec.costOneTimeHigh, 0, 0)}`,
  );
  lines.push(
    `  Recurring monthly (low-high)          : $${padNum(rec.costRecurringLow, 10, 0)} – $${padNum(rec.costRecurringHigh, 0, 0)}`,
  );
  lines.push("");
  lines.push("Expected Year-1 outcomes:");
  lines.push(
    `  3PL cost (low-high)                  : $${padNum(rec.year1ThreeplCostLow, 10, 0)} – $${padNum(rec.year1ThreeplCostHigh, 0, 0)}`,
  );
  lines.push(
    `  Incremental net (low-high)           : $${padNum(rec.year1IncrementalNetLow, 10, 0)} – $${padNum(rec.year1IncrementalNetHigh, 0, 0)}`,
  );
  lines.push(
    `  Year-1 ROI                           : ${rec.year1RoiLow.toFixed(0)}:1 – ${rec.year1RoiHigh.toFixed(0)}:1`,
  );
  lines.push(
    `  Ship cost savings                    : ${rec.shipCostSavingsPctLow.toFixed(0)}% – ${rec.shipCostSavingsPctHigh.toFixed(0)}%`,
  );
  lines.push(
    `  Ship time improvement (days)         : ${rec.shipTimeImprovementDaysLow.toFixed(1)} – ${rec.shipTimeImprovementDaysHigh.toFixed(1)}`,
  );
  lines.push("");
  lines.push("6-step build sequence:");
  for (const step of rec.buildSequence) {
    lines.push(`  ${step}`);
  }
  lines.push("");
  return lines.join("\n");
}

function padNum(n: number, width: number, decimals?: number): string {
  const formatted =
    decimals !== undefined ? n.toFixed(decimals) : Math.round(n).toString();
  // Right-justify to match Python's `{:>15,}` style — note the comma thousands
  // separator isn't used for floats by the Python CLI but we keep numbers
  // compact here. (The Python CLI doesn't include commas on the ship cost
  // either.)
  return formatted.padStart(width);
}

// ----- Badge + label helpers ---------------------------------------------

export function pathBadgeClasses(path: PathName): string {
  // Path B (DEFAULT) gets the strongest emerald; Path A gets sky; Path C
  // gets violet — mirrors the welcome-series + b2b-wholesale palette.
  if (path === "A")
    return "rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-300";
  if (path === "B")
    return "rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300";
  return "rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-violet-700 dark:text-violet-300";
}

export function pathLongLabel(path: PathName): string {
  if (path === "A") return "SMB 3PL solo (ShipBob Starter / Shopify Fulfillment Network)";
  if (path === "B") return "Mid-market multi-warehouse (ShipBob Mid-Market / ShipMonk / Red Stag)";
  return "Enterprise multi-3PL orchestration (Stord + Flowspace + Extensiv)";
}

export function healthBandTag(roiLow: number, roiHigh: number): {
  label: string;
  classes: string;
} {
  // ROI band from research/07: great ≥12:1, good 8-12:1, fair 5-8:1, weak <5:1.
  const mid = (roiLow + roiHigh) / 2;
  if (mid >= 12)
    return {
      label: "great",
      classes:
        "rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300",
    };
  if (mid >= 8)
    return {
      label: "good",
      classes:
        "rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-300",
    };
  if (mid >= 5)
    return {
      label: "fair",
      classes:
        "rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300",
    };
  return {
    label: "weak",
    classes:
      "rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-rose-700 dark:text-rose-300",
  };
}