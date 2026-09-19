/**
 * Smoke test for Move #128.ao `trajectory-scenario-export.ts`.
 *
 * Verifies the CSV builder emits:
 *   - metadata block with version + schema + Your-store
 *   - per-scenario move metadata (id / name / delay / ship months)
 *   - baseline Year-1 totals
 *   - one row per (scenario × month)
 *   - delta columns wired with zero for baseline, real values for A & B
 *   - Scenario B omitted when not enabled
 *   - scenarioExportFilename produces A-only and AB suffixes
 *
 * Polyfills `window.localStorage` + `URL.createObjectURL` / `document.createElement`
 * to keep the import side-effect-free for Node.
 *
 * Run via `npx jiti src/lib/__tests__/trajectory-scenario-export.test.ts`.
 */

import {
  buildScenarioExportCsv,
  buildScenarioExportSlots,
  scenarioExportFilename,
  type ScenarioExportSlot,
} from "../trajectory-scenario-export";

// Polyfill URL.createObjectURL for any accidental client-side import (none here
// since the test imports only the pure-logic module, but harmless).
if (typeof globalThis.URL === "undefined") {
  // @ts-expect-error -- test polyfill
  globalThis.URL = { createObjectURL: () => "blob:test", revokeObjectURL: () => undefined };
}

interface MonthStub {
  month: number;
  revenueLow: number;
  revenueHigh: number;
  costLow: number;
  costHigh: number;
  movesShippedThisMonth: string[];
  movesShippedCumulative: number;
}

function stubProjection(seed: number): {
  baselineMonthlyRevenue: number;
  baselineAnnualRevenue: number;
  movesAlreadyShipped: number;
  totalMoves: number;
  movesOnHorizon: Array<{ move: { id: string }; shipMonth: number }>;
  movesBeyondHorizon: number;
  year1RevenueLow: number;
  year1RevenueHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  year1LiftLow: number;
  year1LiftHigh: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  headline: string;
  months: MonthStub[];
  summaryMarkdown: string;
} {
  const months: MonthStub[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenueLow: 10000 + seed + i * 50,
    revenueHigh: 12000 + seed + i * 50,
    costLow: 100 + seed,
    costHigh: 200 + seed,
    movesShippedThisMonth: [],
    movesShippedCumulative: 0,
  }));
  return {
    baselineMonthlyRevenue: 10000,
    baselineAnnualRevenue: 120000,
    movesAlreadyShipped: 0,
    totalMoves: 10,
    movesOnHorizon: [
      { move: { id: "01-abandoned-cart-flow-klaviyo" }, shipMonth: 3 },
    ],
    movesBeyondHorizon: 5,
    year1RevenueLow: 120000,
    year1RevenueHigh: 144000,
    year1CostLow: 1200,
    year1CostHigh: 2400,
    year1LiftLow: 0,
    year1LiftHigh: 24000,
    year1RoiLow: 0,
    year1RoiHigh: 10,
    headline: "Test headline",
    months,
    summaryMarkdown: "Test markdown",
  };
}

// Cast helper — the projection module has a strict interface; the stub covers
// the read fields the CSV builder consumes. We type-erase via `any` because
// the test only needs the structural surface.
const baseline = stubProjection(0) as any;
const delayedA = stubProjection(1) as any;
const delayedB = stubProjection(2) as any;

const meta = {
  aov: 50,
  monthlyOrders: 200,
  grossMargin: 0.6,
  exportedAt: "2026-09-18",
};

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    console.log(`  ✗ ${name} ${detail}`);
    failures++;
  }
}

console.log("trajectory-scenario-export.test.ts");

// 1) buildScenarioExportSlots — baseline + A only
{
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    moveA: {
      moveId: "01-abandoned-cart-flow-klaviyo",
      moveName: "Abandoned cart flow (Klaviyo)",
      delayDays: 30,
      originalShipMonth: 3,
      delayedShipMonth: 4,
    },
    moveB: null,
    scenarioBEnabled: false,
  });
  check("baseline + A only — slot count = 2", slots.length === 2, `got ${slots.length}`);
  check("baseline slot label", slots[0].label === "baseline");
  check("baseline slot delta = null", slots[0].deltaVsBaseline === null);
  check("A slot delta computed", slots[1].deltaVsBaseline !== null);
  check("A slot has move metadata", slots[1].move?.moveId === "01-abandoned-cart-flow-klaviyo");
  check("B slot absent when disabled", slots.length === 2);
}

// 2) buildScenarioExportSlots — A + B enabled
{
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    delayedB,
    moveA: {
      moveId: "01-abandoned-cart-flow-klaviyo",
      moveName: "Abandoned cart flow (Klaviyo)",
      delayDays: 30,
      originalShipMonth: 3,
      delayedShipMonth: 4,
    },
    moveB: {
      moveId: "03-checkout-audit-baymard",
      moveName: "Checkout audit (Baymard 24-pt)",
      delayDays: 60,
      originalShipMonth: 5,
      delayedShipMonth: 7,
    },
    scenarioBEnabled: true,
  });
  check("AB enabled — slot count = 3", slots.length === 3, `got ${slots.length}`);
  check("B slot label = B", slots[2].label === "B");
  check("B slot has move metadata", slots[2].move?.moveId === "03-checkout-audit-baymard");
  check("B slot delta computed", slots[2].deltaVsBaseline !== null);
}

// 3) buildScenarioExportCsv — schema + version + metadata block
{
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    moveA: {
      moveId: "01-abandoned-cart-flow-klaviyo",
      moveName: "Abandoned cart flow (Klaviyo)",
      delayDays: 30,
      originalShipMonth: 3,
      delayedShipMonth: 4,
    },
    moveB: null,
    scenarioBEnabled: false,
  });
  const csv = buildScenarioExportCsv(slots, meta);
  check(
    "schema header present",
    csv.includes("# ecommerce-ops-trajectory-scenario,schema=ecommerce-ops-trajectory-scenario"),
  );
  check("version = 1", csv.includes("\n# version,1\n") || csv.includes(",# version,1,") || csv.includes("version,1"));
  check("exported_at = 2026-09-18", csv.includes("exported_at,2026-09-18"));
  check("aov_usd = 50.00", csv.includes("aov_usd,50.00"));
  check("monthly_orders = 200", csv.includes("monthly_orders,200"));
  check("gross_margin_pct = 60.0", csv.includes("gross_margin_pct,60.0"));
  check("scenario_A_move_id present", csv.includes("scenario_A_move_id,01-abandoned-cart-flow-klaviyo"));
  check("scenario_A_delay_days = 30", csv.includes("scenario_A_delay_days,30"));
  check("scenario_B_move_id absent when B disabled", !csv.includes("scenario_B_move_id,"));
  check("year1_lift_low present", csv.includes("year1_lift_low,"));
  check("baseline_headline present", csv.includes("baseline_headline,Test headline"));
}

// 4) CSV row count — baseline + A = 24 rows (2 scenarios × 12 months)
{
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    moveA: {
      moveId: "01-abandoned-cart-flow-klaviyo",
      moveName: "Abandoned cart flow (Klaviyo)",
      delayDays: 30,
      originalShipMonth: 3,
      delayedShipMonth: 4,
    },
    moveB: null,
    scenarioBEnabled: false,
  });
  const csv = buildScenarioExportCsv(slots, meta);
  // Count comma-separated rows in the table block (after the blank line).
  const [_, tableBlock] = csv.split("\n\n");
  const dataRows = tableBlock.split("\n").slice(1).filter(Boolean);
  check("A-only export has 24 data rows", dataRows.length === 24, `got ${dataRows.length}`);
  // Baseline rows should have y1_lift_delta = 0
  const baselineRow = dataRows.find((r) => r.startsWith("baseline,"));
  check("baseline row exists", baselineRow !== undefined);
  check("baseline row has zero deltas", baselineRow!.includes(",0,0,0,0,0,0,0,0,0"));
  // A row should have non-zero move metadata
  const aRow = dataRows.find((r) => r.startsWith("A,"));
  check("A row exists", aRow !== undefined);
  check(
    "A row has move_id",
    aRow!.includes(",01-abandoned-cart-flow-klaviyo,"),
  );
}

// 5) CSV row count — A + B = 36 rows (3 scenarios × 12 months)
{
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    delayedB,
    moveA: {
      moveId: "01-abandoned-cart-flow-klaviyo",
      moveName: "Abandoned cart flow (Klaviyo)",
      delayDays: 30,
      originalShipMonth: 3,
      delayedShipMonth: 4,
    },
    moveB: {
      moveId: "03-checkout-audit-baymard",
      moveName: "Checkout audit (Baymard 24-pt)",
      delayDays: 60,
      originalShipMonth: 5,
      delayedShipMonth: 7,
    },
    scenarioBEnabled: true,
  });
  const csv = buildScenarioExportCsv(slots, meta);
  const [_, tableBlock] = csv.split("\n\n");
  const dataRows = tableBlock.split("\n").slice(1).filter(Boolean);
  check("AB export has 36 data rows", dataRows.length === 36, `got ${dataRows.length}`);
  check("B rows present", dataRows.some((r) => r.startsWith("B,")));
  check("B row has move_id", dataRows.find((r) => r.startsWith("B,"))!.includes(",03-checkout-audit-baymard,"));
  check("B metadata block emitted", csv.includes("scenario_B_move_id,03-checkout-audit-baymard"));
  check("B delay metadata emitted", csv.includes("scenario_B_delay_days,60"));
}

// 6) scenarioExportFilename — A-only vs AB
{
  const a = scenarioExportFilename("2026-09-18", false);
  const ab = scenarioExportFilename("2026-09-18", true);
  check("A-only filename", a === "ecom-ops-trajectory-scenario-A-2026-09-18.csv", `got ${a}`);
  check("AB filename", ab === "ecom-ops-trajectory-scenario-AB-2026-09-18.csv", `got ${ab}`);
}

// 7) CSV escape — quoted when comma/quote/newline present
{
  const trickyMove = {
    moveId: "test-with,comma",
    moveName: `Name with "quote"`,
    delayDays: 30,
    originalShipMonth: 1,
    delayedShipMonth: 2,
  };
  const slots: ScenarioExportSlot[] = buildScenarioExportSlots({
    baseline,
    delayedA,
    moveA: trickyMove,
    moveB: null,
    scenarioBEnabled: false,
  });
  const csv = buildScenarioExportCsv(slots, meta);
  check("comma escape works", csv.includes('"test-with,comma"'));
  check("quote escape works", csv.includes('"Name with ""quote"""'));
}

if (failures > 0) {
  console.log(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll tests passed");
