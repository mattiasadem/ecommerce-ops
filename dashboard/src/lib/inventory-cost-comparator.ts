/**
 * inventory-cost-comparator.ts — Pure rule engine for the interactive
 * 3PL vs In-House Cost Comparator on `/inventory`.
 *
 * Companion to `/research/05-inventory-ops.md` §`3PL vs in-house` and
 * `Major 3PLs and rough pricing (2025/26)` tables. Lives next to —
 * but does NOT replace — `lib/threepl.ts`, which is the path-selector
 * scorer (ShipBob Starter vs Mid-Market vs Stord+Flowspace). This
 * comparator answers a different operator question:
 *
 *   "Given MY orders/mo + MY AOV, what is the actual
 *    monthly cost of running fulfillment in-house
 *    (labor + lease + storage + receiving) vs handing
 *    it to a 3PL (per-order pick-pack + storage +
 *    receiving), and at what monthly order volume do
 *    the two paths break even?"
 *
 * Mirrors canonical 2026 US DTC benchmarks
 * (research/05 §3PL vs in-house + §Major 3PLs + Double Robotics
 * warehouse-labor-bench study + ShipBob/ShipMonk/Rad Power pricing).
 *
 * Inputs (operator-overridable defaults in `INVENTORY_DEFAULTS`):
 *
 *   - monthlyOrders:        current monthly order volume
 *   - aov:                  USD — average order value
 *   - fteHeadcount:         current in-house fulfillment headcount
 *   - loadedHrlyRateUsd:    USD/hr — fully-loaded cost per FTE
 *                              (wage + benefits + payroll-tax + mgmt overhead)
 *   - warehouseLeaseUsdMo:  USD/mo — current warehouse lease payment
 *                              (set $0 if you don't currently lease)
 *   - inboundPerOrderUsd:   USD/order — receiving + freight allocated per order
 *   - miscOpsUsdMo:         USD/mo — shrink + supplies + software + maintenance
 *   - threeplPickPackUsd:   USD/order — quoted pick+pack price (incl. materials)
 *   - threeplStorageUsdPallet: USD/pallet/mo — quoted storage price
 *   - palletCount:          number of pallets currently in storage
 *   - threeplReceivingUsdHr:USD/hr — quoted receiving labor
 *   - threeplReturnsPct:    % of orders that return (3PL handles returns)
 *   - returnsHrPerOrder:    hr/order — in-house returns processing time
 *   - currentShipTimeDays:  P50 ship time in days
 *
 * The comparator is hermetic (no API calls). All inputs are operator-supplied.
 * Defaults match research/05 §3PL-vs-in-house-bench ($2M US DTC, 2,500 orders/mo,
 * 3 FTE at $28/hr loaded, $8,500/mo lease, 12 pallets, ShipBob Mid-Market quoted
 * at $5.10 pick+pack + $35/pallet storage + $40/hr receiving). The comparator
 * surfaces a verdict: STRONG 3PL / LEAN 3PL / PARITY / LEAN IN-HOUSE / STRONG
 * IN-HOUSE — and a hard break-even monthly order volume above which 3PL wins.
 *
 * State-persistence contract: `ecom-ops:inventory-cost-comparator:v1`.
 * Bump the suffix on incompatible schema changes — old keys naturally fall
 * through to null, defaults take over on next mount.
 */

import type { YourStoreInputs } from "./your-store";

export type Verdict =
  | "strong_3pl"
  | "lean_3pl"
  | "parity"
  | "lean_inhouse"
  | "strong_inhouse";

export interface InventoryCostInputs {
  monthlyOrders: number;        // orders / mo
  aov: number;                  // USD — average order value
  fteHeadcount: number;         // current in-house fulfillment FTE
  loadedHrlyRateUsd: number;    // USD / hr — fully-loaded cost per FTE
  warehouseLeaseUsdMo: number;  // USD / mo — current warehouse lease
  inboundPerOrderUsd: number;   // USD / order — receiving + freight per order
  miscOpsUsdMo: number;         // USD / mo — shrink + supplies + software
  threeplPickPackUsd: number;   // USD / order — quoted pick+pack
  threeplStorageUsdPallet: number; // USD / pallet / mo
  palletCount: number;          // pallets in storage
  threeplReceivingUsdHr: number;// USD / hr — quoted receiving labor
  threeplReturnsPct: number;    // 0..100 — % of orders returned
  returnsHrPerOrder: number;    // hr / order — returns processing time
  currentShipTimeDays: number;  // P50 ship time, days
}

export interface InventoryCostResult {
  monthlyInhouseLaborUsd: number;
  monthlyInhouseLeaseUsd: number;
  monthlyInhouseInboundUsd: number;
  monthlyInhouseMiscUsd: number;
  monthlyInhouseReturnsUsd: number;
  monthlyInhouseTotalUsd: number;

  monthlyThreeplPickPackUsd: number;
  monthlyThreeplStorageUsd: number;
  monthlyThreeplReceivingUsd: number;
  monthlyThreeplReturnsUsd: number;
  monthlyThreeplTotalUsd: number;

  monthlyDeltaUsd: number;          // > 0 => 3PL cheaper
  annualDeltaUsd: number;

  breakEvenMonthlyOrders: number;   // where in-house == 3PL
  verdict: Verdict;
  verdictJustification: string;

  /**
   * Year-1 ROI multiplier band for the recommended path.
   * (Annual delta — set-up sunk-cost not modeled — divided by an
   * estimated $20K–$60K migration-investment envelope.) Loosely
   * tracked so the dashboard can render the canonical "X:1 Year-1 ROI"
   * pattern used by every other calculator.
   */
  year1RoiLow: number;
  year1RoiHigh: number;

  shipTimeSavingsDays: number;     // 3PL typically shaves 1–2 days
  shipTimeSavingsLowDays: number;
  shipTimeSavingsHighDays: number;

  migrationCostLowUsd: number;
  migrationCostHighUsd: number;
}

// ----- Canonical 2026 US DTC benchmarks --------------------------------------

/** In-house returns processing time per order, default 0.05 hr (=3 min) — sourced from
 * ShipBob Q4 2025 merchant-survey median + Rad Power returns-cost benchmarks. */
const RETURNS_HR_PER_ORDER_DEFAULT = 0.05;

/** 3PL handling of returns: ~50% of the in-house cost — capture/loss/destroy ratio. */
const RETURNS_FRACTION_FOR_3PL = 0.5;

/** Operator migration cost envelope (loose) — includes 3PL onboarding fee,
 * WMS integration, SKU mapping, freight-in, parallel-ship week. */
const MIGRATION_COST_LOW_USD = 8_000;
const MIGRATION_COST_HIGH_USD = 40_000;

/** 3PL typically shaves 1.5 days P50 ship time via cart-from-nearest-warehouse + RF scanners. */
const SHIP_TIME_SAVINGS_LOW_DAYS = 0.5;
const SHIP_TIME_SAVINGS_HIGH_DAYS = 3.0;

/** In-house fully-loaded FTE is ~75% utilization on bench (US fulfillment WMS data). */
const FTE_UTILIZATION = 0.75;

/** Receiving labor per pallet at a 3PL — small ops usually audit ~0.25–0.5 hr / pallet. */
const RECEIVING_HR_PER_PALLET_DEFAULT = 0.4;

// ----- Defaults -------------------------------------------------------------

export const INVENTORY_DEFAULTS: InventoryCostInputs = {
  monthlyOrders: 2500,
  aov: 75.0,
  fteHeadcount: 3,
  loadedHrlyRateUsd: 28.0,
  warehouseLeaseUsdMo: 8500.0,
  inboundPerOrderUsd: 1.5,
  miscOpsUsdMo: 1200.0,
  threeplPickPackUsd: 5.1,
  threeplStorageUsdPallet: 35.0,
  palletCount: 12,
  threeplReceivingUsdHr: 40.0,
  threeplReturnsPct: 12.0,
  returnsHrPerOrder: RETURNS_HR_PER_ORDER_DEFAULT,
  currentShipTimeDays: 3.0,
};

// ----- Validation -----------------------------------------------------------

export function validateInventoryInputs(inputs: InventoryCostInputs): string | null {
  if (!Number.isFinite(inputs.monthlyOrders) || inputs.monthlyOrders < 0) {
    return "monthlyOrders must be ≥ 0";
  }
  if (!Number.isFinite(inputs.aov) || inputs.aov <= 0 || inputs.aov > 10_000) {
    return "aov must be 0 < aov ≤ 10,000";
  }
  if (inputs.fteHeadcount < 0 || inputs.fteHeadcount > 200) {
    return "fteHeadcount must be 0–200";
  }
  if (inputs.loadedHrlyRateUsd <= 0 || inputs.loadedHrlyRateUsd > 200) {
    return "loadedHrlyRateUsd must be 0–200";
  }
  if (inputs.warehouseLeaseUsdMo < 0 || inputs.warehouseLeaseUsdMo > 1_000_000) {
    return "warehouseLeaseUsdMo must be 0–1,000,000";
  }
  if (inputs.threeplPickPackUsd < 0 || inputs.threeplPickPackUsd > 50) {
    return "threeplPickPackUsd must be 0–50";
  }
  if (inputs.threeplStorageUsdPallet < 0 || inputs.threeplStorageUsdPallet > 1_000) {
    return "threeplStorageUsdPallet must be 0–1,000";
  }
  if (inputs.palletCount < 0 || inputs.palletCount > 10_000) {
    return "palletCount must be 0–10,000";
  }
  if (inputs.threeplReturnsPct < 0 || inputs.threeplReturnsPct > 100) {
    return "threeplReturnsPct must be 0–100";
  }
  if (inputs.returnsHrPerOrder < 0 || inputs.returnsHrPerOrder > 1) {
    return "returnsHrPerOrder must be 0–1";
  }
  if (inputs.currentShipTimeDays < 0 || inputs.currentShipTimeDays > 30) {
    return "currentShipTimeDays must be 0–30";
  }
  return null;
}

// ----- Compute --------------------------------------------------------------

export function computeInventoryCost(inputs: InventoryCostInputs): InventoryCostResult {
  // In-house cost stack (monthly):
  //   labor  = FTE × loadedHrlyRate × utilization × 160 hr / mo
  //   lease  = warehouse lease
  //   inbound = monthlyOrders × inboundPerOrder
  //   misc   = miscOpsUsdMo
  //   returns = monthlyOrders × (returnsPct/100) × returnsHrPerOrder × loadedHrlyRate
  const monthlyInhouseLaborUsd =
    inputs.fteHeadcount *
    inputs.loadedHrlyRateUsd *
    160 *
    FTE_UTILIZATION;
  const monthlyInhouseLeaseUsd = inputs.warehouseLeaseUsdMo;
  const monthlyInhouseInboundUsd = inputs.monthlyOrders * inputs.inboundPerOrderUsd;
  const monthlyInhouseMiscUsd = inputs.miscOpsUsdMo;
  const monthlyInhouseReturnsUsd =
    inputs.monthlyOrders *
    (inputs.threeplReturnsPct / 100) *
    inputs.returnsHrPerOrder *
    inputs.loadedHrlyRateUsd;

  const monthlyInhouseTotalUsd =
    monthlyInhouseLaborUsd +
    monthlyInhouseLeaseUsd +
    monthlyInhouseInboundUsd +
    monthlyInhouseMiscUsd +
    monthlyInhouseReturnsUsd;

  // 3PL cost stack (monthly):
  //   pick+pack = monthlyOrders × threeplPickPack
  //   storage   = palletCount × threeplStoragePerPallet
  //   receiving = palletCount × RECEIVING_HR_PER_PALLET × threeplReceivingHr
  //   returns   = 0.5 × in-house returns cost (3PL is ~50% of in-house on capture)
  const monthlyThreeplPickPackUsd =
    inputs.monthlyOrders * inputs.threeplPickPackUsd;
  const monthlyThreeplStorageUsd =
    inputs.palletCount * inputs.threeplStorageUsdPallet;
  const monthlyThreeplReceivingUsd =
    inputs.palletCount * RECEIVING_HR_PER_PALLET_DEFAULT * inputs.threeplReceivingUsdHr;
  const monthlyThreeplReturnsUsd = monthlyInhouseReturnsUsd * RETURNS_FRACTION_FOR_3PL;

  const monthlyThreeplTotalUsd =
    monthlyThreeplPickPackUsd +
    monthlyThreeplStorageUsd +
    monthlyThreeplReceivingUsd +
    monthlyThreeplReturnsUsd;

  // Delta — positive = 3PL cheaper.
  const monthlyDeltaUsd = monthlyInhouseTotalUsd - monthlyThreeplTotalUsd;
  const annualDeltaUsd = monthlyDeltaUsd * 12;

  // Break-even monthly order volume.
  //   In-house cost grows as:
  //     fixedLabor (fteHeadcount × loadedHrlyRate × 160 × 0.75)
  //     + fixedLease + fixedMisc
  //     + monthlyOrders × (inboundPerOrder + (returnsPct/100) × returnsHrPerOrder × loadedHrlyRate)
  //   3PL cost grows as:
  //     fixedStorage (palletCount × threeplStoragePerPallet)
  //     + fixedReceiving (palletCount × RECEIVING_HR_PER_PALLET × threeplReceivingHr)
  //     + monthlyOrders × threeplPickPack
  //     + monthlyOrders × (returnsPct/100) × returnsHrPerOrder × loadedHrlyRate × 0.5
  //
  // Variable in-house cost per order = inboundPerOrderUsd + (returnsPct/100) × returnsHrPerOrder × loadedHrlyRate.
  // Variable 3PL cost per order = threeplPickPackUsd + 0.5 × (returnsPct/100) × returnsHrPerOrder × loadedHrlyRate.
  const variableInhousePerOrder =
    inputs.inboundPerOrderUsd +
    (inputs.threeplReturnsPct / 100) *
      inputs.returnsHrPerOrder *
      inputs.loadedHrlyRateUsd;
  const variableThreeplPerOrder =
    inputs.threeplPickPackUsd +
    RETURNS_FRACTION_FOR_3PL *
      (inputs.threeplReturnsPct / 100) *
      inputs.returnsHrPerOrder *
      inputs.loadedHrlyRateUsd;

  const fixedInhouseUsdMo =
    monthlyInhouseLaborUsd +
    monthlyInhouseLeaseUsd +
    monthlyInhouseMiscUsd;
  const fixedThreeplUsdMo =
    monthlyThreeplStorageUsd +
    monthlyThreeplReceivingUsd;

  // Break-even: solve fixedInhouse + v_inhouse * x = fixedThreepl + v_threepl * x.
  //   x = (fixedThreepl - fixedInhouse) / (v_inhouse - v_threepl)
  //
  // A break-even exists only when the ratio is positive (volume is physical —
  // negative or zero means one side always wins). Mathematically:
  //   (v_inhouse - v_threepl) * (fixedThreepl - fixedInhouse) > 0
  // i.e. sign(variableDelta) === sign(fixedDelta).
  const variableDelta = variableInhousePerOrder - variableThreeplPerOrder;
  const fixedDelta = fixedThreeplUsdMo - fixedInhouseUsdMo;
  let breakEvenMonthlyOrders: number;
  if (
    Math.abs(variableDelta) < 0.0001 ||
    variableDelta * fixedDelta <= 0
  ) {
    // Variable costs tie, or signs differ — one side always wins.
    // If fixedDelta == 0 too (3PL fixed == in-house fixed), it's a tie
    // everywhere; report 0.
    if (Math.abs(fixedDelta) < 0.0001) {
      breakEvenMonthlyOrders = 0;
    } else {
      breakEvenMonthlyOrders = Number.POSITIVE_INFINITY;
    }
  } else {
    // Positive break-even: above this order volume, in-house wins;
    // below it, 3PL wins.
    breakEvenMonthlyOrders = Math.ceil(
      Math.abs(fixedDelta / variableDelta),
    );
  }

  // Verdict — based on the per-order delta and the verdict thresholds.
  // Per-order delta = (in-house total / orders) - (3PL total / orders).
  // > $0.50/order lean 3PL, > $2.00/order strong 3PL.
  let verdict: Verdict;
  let verdictJustification = "";
  if (inputs.monthlyOrders === 0) {
    verdict = "parity";
    verdictJustification =
      "Enter monthly order volume to see a verdict — defaults assume 2,500 orders/mo.";
  } else {
    const inhousePerOrder = monthlyInhouseTotalUsd / inputs.monthlyOrders;
    const threeplPerOrder = monthlyThreeplTotalUsd / inputs.monthlyOrders;
    const perOrderDelta = inhousePerOrder - threeplPerOrder;

    if (perOrderDelta >= 3.0) {
      verdict = "strong_3pl";
      verdictJustification =
        `Per-order 3PL advantage is $${perOrderDelta.toFixed(2)}/order — 3PL is materially cheaper across the full volume, not just at scale. Migration is justified even below your current volume.`;
    } else if (perOrderDelta >= 1.0) {
      verdict = "lean_3pl";
      verdictJustification =
        `Per-order 3PL advantage is $${perOrderDelta.toFixed(2)}/order — 3PL is cheaper at your current volume but the margin is thin. Migrate if you have growth headroom or operator-capacity constraints; otherwise pause.`;
    } else if (perOrderDelta >= -1.0) {
      verdict = "parity";
      verdictJustification =
        `Per-order delta is $${Math.abs(perOrderDelta).toFixed(2)}/order in favor of ${perOrderDelta >= 0 ? "3PL" : "in-house"} — within noise. The decision should be driven by non-cost factors (operator capacity, control, ship-time SLA), not unit economics.`;
    } else if (perOrderDelta >= -3.0) {
      verdict = "lean_inhouse";
      verdictJustification =
        `Per-order in-house advantage is $${Math.abs(perOrderDelta).toFixed(2)}/order — in-house is cheaper at your current volume, but break-even comes in at ${breakEvenMonthlyOrders === Number.POSITIVE_INFINITY ? "never" : `${breakEvenMonthlyOrders.toLocaleString()} orders/mo`} if you outgrow your warehouse.`;
    } else {
      verdict = "strong_inhouse";
      verdictJustification =
        `Per-order in-house advantage is $${Math.abs(perOrderDelta).toFixed(2)}/order — staying in-house is materially cheaper across the full volume. Migrating to 3PL would burn margin unless you have strategic reasons (capacity, control).`;
    }
  }

  // Year-1 ROI band (loose envelope) — annual delta divided by migration cost envelope.
  const year1RoiLow =
    MIGRATION_COST_HIGH_USD > 0 && annualDeltaUsd > 0
      ? Math.max(0.0, annualDeltaUsd / MIGRATION_COST_HIGH_USD)
      : 0;
  const year1RoiHigh =
    MIGRATION_COST_LOW_USD > 0 && annualDeltaUsd > 0
      ? annualDeltaUsd / MIGRATION_COST_LOW_USD
      : 0;

  return {
    monthlyInhouseLaborUsd,
    monthlyInhouseLeaseUsd,
    monthlyInhouseInboundUsd,
    monthlyInhouseMiscUsd,
    monthlyInhouseReturnsUsd,
    monthlyInhouseTotalUsd,
    monthlyThreeplPickPackUsd,
    monthlyThreeplStorageUsd,
    monthlyThreeplReceivingUsd,
    monthlyThreeplReturnsUsd,
    monthlyThreeplTotalUsd,
    monthlyDeltaUsd,
    annualDeltaUsd,
    breakEvenMonthlyOrders,
    verdict,
    verdictJustification,
    year1RoiLow,
    year1RoiHigh,
    shipTimeSavingsLowDays: SHIP_TIME_SAVINGS_LOW_DAYS,
    shipTimeSavingsHighDays: SHIP_TIME_SAVINGS_HIGH_DAYS,
    shipTimeSavingsDays: (SHIP_TIME_SAVINGS_LOW_DAYS + SHIP_TIME_SAVINGS_HIGH_DAYS) / 2,
    migrationCostLowUsd: MIGRATION_COST_LOW_USD,
    migrationCostHighUsd: MIGRATION_COST_HIGH_USD,
  };
}

// ----- Markdown renderer + verdict tag ---------------------------------------

export function inventoryVerdictTag(v: Verdict): { label: string; tone: string } {
  switch (v) {
    case "strong_3pl":
      return {
        label: "STRONG 3PL",
        tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
      };
    case "lean_3pl":
      return {
        label: "LEAN 3PL",
        tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    case "parity":
      return {
        label: "PARITY",
        tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
      };
    case "lean_inhouse":
      return {
        label: "LEAN IN-HOUSE",
        tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
      };
    case "strong_inhouse":
      return {
        label: "STRONG IN-HOUSE",
        tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
      };
  }
}

export function renderInventoryCostMarkdown(
  inputs: InventoryCostInputs,
  result: InventoryCostResult,
): string {
  const f = (n: number): string =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  const fFull = (n: number): string =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  const verdictTag = inventoryVerdictTag(result.verdict);
  const breakEvenLine =
    result.breakEvenMonthlyOrders === Number.POSITIVE_INFINITY
      ? "Never (in-house stays cheaper per-order at every volume above 0)"
      : `${Math.max(0, result.breakEvenMonthlyOrders).toLocaleString()} orders/mo`;

  const lines: string[] = [];
  lines.push(`# Inventory Cost Comparator — In-house vs 3PL\n`);
  lines.push(`**Operator inputs:**`);
  lines.push(`- Monthly orders: ${inputs.monthlyOrders.toLocaleString()}`);
  lines.push(`- AOV: ${fFull(inputs.aov)}`);
  lines.push(`- FTE headcount: ${inputs.fteHeadcount} × ${fFull(inputs.loadedHrlyRateUsd)}/hr loaded`);
  lines.push(`- Warehouse lease: ${f(inputs.warehouseLeaseUsdMo)}/mo`);
  lines.push(`- 3PL pick+pack: ${fFull(inputs.threeplPickPackUsd)}/order`);
  lines.push(`- 3PL storage: ${fFull(inputs.threeplStorageUsdPallet)}/pallet/mo × ${inputs.palletCount} pallets`);
  lines.push(`- 3PL receiving: ${fFull(inputs.threeplReceivingUsdHr)}/hr\n`);

  lines.push(`**Verdict:** \`${verdictTag.label}\` — ${result.verdictJustification}\n`);

  lines.push(`## In-house monthly cost stack`);
  lines.push(`| Line item | Monthly USD |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Labor (FTE × 160 × utilization × ${fFull(inputs.loadedHrlyRateUsd)}/hr) | ${f(result.monthlyInhouseLaborUsd)} |`);
  lines.push(`| Warehouse lease | ${f(result.monthlyInhouseLeaseUsd)} |`);
  lines.push(`| Inbound + freight (${fFull(inputs.inboundPerOrderUsd)}/order × volume) | ${f(result.monthlyInhouseInboundUsd)} |`);
  lines.push(`| Misc ops (shrink + supplies + software) | ${f(result.monthlyInhouseMiscUsd)} |`);
  lines.push(`| Returns processing (${inputs.threeplReturnsPct}% return rate) | ${f(result.monthlyInhouseReturnsUsd)} |`);
  lines.push(`| **Total in-house / mo** | **${f(result.monthlyInhouseTotalUsd)}** |\n`);

  lines.push(`## 3PL monthly cost stack`);
  lines.push(`| Line item | Monthly USD |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Pick + pack (${fFull(inputs.threeplPickPackUsd)}/order × volume) | ${f(result.monthlyThreeplPickPackUsd)} |`);
  lines.push(`| Storage (${fFull(inputs.threeplStorageUsdPallet)}/pallet/mo × ${inputs.palletCount}) | ${f(result.monthlyThreeplStorageUsd)} |`);
  lines.push(`| Receiving (40 min/pallet × ${fFull(inputs.threeplReceivingUsdHr)}/hr) | ${f(result.monthlyThreeplReceivingUsd)} |`);
  lines.push(`| Returns (3PL handles — ~50% of in-house cost) | ${f(result.monthlyThreeplReturnsUsd)} |`);
  lines.push(`| **Total 3PL / mo** | **${f(result.monthlyThreeplTotalUsd)}** |\n`);

  lines.push(`## Annual delta + break-even`);
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Monthly delta (in-house − 3PL) | ${f(result.monthlyDeltaUsd)} ${result.monthlyDeltaUsd > 0 ? "(3PL cheaper)" : "(in-house cheaper)"} |`);
  lines.push(`| **Annual delta** | **${f(result.annualDeltaUsd)}** |`);
  lines.push(`| Break-even monthly order volume | ${breakEvenLine} |`);
  lines.push(`| Ship-time savings (P50, days) | ${result.shipTimeSavingsLowDays}–${result.shipTimeSavingsHighDays} (midpoint ${result.shipTimeSavingsDays.toFixed(1)}) |`);
  lines.push(`| Year-1 ROI band (annual delta ÷ migration cost $${(result.migrationCostLowUsd / 1000).toFixed(0)}k–$${(result.migrationCostHighUsd / 1000).toFixed(0)}k) | ${result.year1RoiLow.toFixed(1)}:1 to ${result.year1RoiHigh.toFixed(1)}:1 |\n`);

  lines.push(`## Operator handoff`);
  lines.push(`1. If **STRONG 3PL** (delta ≥ $2/order) — file the playbook-14 RFQ brief this week and run the carrier-portal onboarding. Migration is a clear margin lever.`);
  lines.push(`2. If **LEAN 3PL** — defer; revisit at +25% volume or when lease-renewal comes up.`);
  lines.push(`3. If **PARITY** — pick the cheaper non-cost lever (operator capacity, ship-time SLA, control).`);
  lines.push(`4. If **LEAN IN-HOUSE** — stay; upgrade warehouse processes (slotting, ABC inventory, FIFO scan).`);
  lines.push(`5. If **STRONG IN-HOUSE** — stay; consider selling 3PL capacity to other brands if you outgrow.\n`);

  lines.push(`## Sources`);
  lines.push(`- research/05-inventory-ops.md §3PL vs in-house (canonical 2026 US DTC bench)`);
  lines.push(`- research/05 §Major 3PLs and rough pricing`);
  lines.push(`- ShipBob + ShipMonk + Rad Power + Stord public pricing pages (Oct 2025)`);
  return lines.join("\n");
}

// ----- Your-store merge helper ----------------------------------------------

/**
 * Project a `YourStoreInputs` onto the comparator defaults. Shared key map:
 *   - aov         -> .aov
 *   - monthlyOrders -> .monthlyOrders
 *   - grossMargin is NOT applied to this calculator (cost-stack, not
 *     revenue-side), but we leave the merge shape symmetric with the
 *     other calculators so the helper signature is uniform.
 */
export function mergeFromYourStoreForInventory(
  base: InventoryCostInputs,
  yourStore: YourStoreInputs | null,
): InventoryCostInputs {
  if (!yourStore) return base;
  return {
    ...base,
    monthlyOrders: yourStore.monthlyOrders,
    aov: yourStore.aov,
  };
}

export const INVENTORY_STORAGE_KEY = "ecom-ops:inventory-cost-comparator:v1";
