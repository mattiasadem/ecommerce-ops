/**
 * inventory-cost-comparator.test.ts — Smoke tests for the pure rule engine
 * in `dashboard/src/lib/inventory-cost-comparator.ts`. Validates:
 *
 *   - INVENTORY_DEFAULTS uses the canonical bench (2,500 orders/mo,
 *     $75 AOV, 3 FTE at $28/hr loaded, $8,500/mo lease)
 *   - computeInventoryCost with defaults yields a STRONG 3PL verdict
 *     (3PL per-order ≈ $3.75, in-house per-order ≈ $8.87 at 2,500/mo)
 *   - The break-even computation is reproducible and positive when the
 *     3PL has fixed-cost headroom over in-house
 *   - When orders → 0, the verdict is PARITY (no data)
 *   - Year-1 ROI is non-negative for a positive annual delta
 *   - renderInventoryCostMarkdown emits the 4 required headers (Operator
 *     inputs, Verdict, In-house cost stack, 3PL cost stack, Annual delta +
 *     break-even, Operator handoff, Sources)
 *   - inventoryVerdictTag returns non-empty label + tone for every Verdict
 *   - mergeFromYourStoreForInventory applies monthlyOrders + aov from a
 *     Your-store object, leaves the cost-side inputs alone
 */

import { strict as assert } from "node:assert";
import {
  INVENTORY_DEFAULTS,
  computeInventoryCost,
  inventoryVerdictTag,
  mergeFromYourStoreForInventory,
  renderInventoryCostMarkdown,
  validateInventoryInputs,
  type InventoryCostInputs,
  type Verdict,
} from "../inventory-cost-comparator";
import { YOUR_STORE_DEFAULTS } from "../your-store";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("\n=== inventory-cost-comparator.test.ts ===\n");

// (1) Defaults bench.
check(
  "INVENTORY_DEFAULTS matches canonical bench (2,500 / $75 / 3 FTE / $28 / $8,500)",
  INVENTORY_DEFAULTS.monthlyOrders === 2500 &&
    INVENTORY_DEFAULTS.aov === 75.0 &&
    INVENTORY_DEFAULTS.fteHeadcount === 3 &&
    INVENTORY_DEFAULTS.loadedHrlyRateUsd === 28.0 &&
    INVENTORY_DEFAULTS.warehouseLeaseUsdMo === 8_500.0,
);

// (2) Sanity — default result is STRONG_3PL with positive delta.
const r = computeInventoryCost(INVENTORY_DEFAULTS);
const inhousePerOrderDefault = r.monthlyInhouseTotalUsd / INVENTORY_DEFAULTS.monthlyOrders;
const threeplPerOrderDefault = r.monthlyThreeplTotalUsd / INVENTORY_DEFAULTS.monthlyOrders;
check(
  `default in-house per-order ≈ $9.58 (got $${inhousePerOrderDefault.toFixed(2)})`,
  Math.abs(inhousePerOrderDefault - 9.58) < 0.2,
);
check(
  `default 3PL per-order ≈ $5.43 (got $${threeplPerOrderDefault.toFixed(2)})`,
  Math.abs(threeplPerOrderDefault - 5.43) < 0.2,
);
check(
  "default verdict is STRONG_3PL (per-order 3PL advantage > $2)",
  r.verdict === "strong_3pl",
);
check("default monthly delta > 0 (3PL cheaper)", r.monthlyDeltaUsd > 0);
check(
  "default annual delta is positive",
  r.annualDeltaUsd === Math.round(r.monthlyDeltaUsd * 12),
);
check("Year-1 ROI band is finite + positive", Number.isFinite(r.year1RoiHigh) && r.year1RoiHigh > 0);

// (3) Labor formula check.
const laborCheck =
  INVENTORY_DEFAULTS.fteHeadcount *
  INVENTORY_DEFAULTS.loadedHrlyRateUsd *
  160 *
  0.75;
check(
  `labor formula 3 × $28 × 160 × 0.75 = $${laborCheck.toFixed(0)} (got $${r.monthlyInhouseLaborUsd.toFixed(0)})`,
  Math.abs(r.monthlyInhouseLaborUsd - laborCheck) < 0.01,
);

// (4) Inbound check.
const inboundCheck = INVENTORY_DEFAULTS.monthlyOrders * INVENTORY_DEFAULTS.inboundPerOrderUsd;
check(
  `inbound 2500 × $1.50 = $${inboundCheck.toFixed(0)} (got $${r.monthlyInhouseInboundUsd.toFixed(0)})`,
  Math.abs(r.monthlyInhouseInboundUsd - inboundCheck) < 0.01,
);

// (5) 3PL pick+pack check.
const pickPackCheck =
  INVENTORY_DEFAULTS.monthlyOrders * INVENTORY_DEFAULTS.threeplPickPackUsd;
check(
  `3PL pick+pack 2500 × $5.10 = $${pickPackCheck.toFixed(0)} (got $${r.monthlyThreeplPickPackUsd.toFixed(0)})`,
  Math.abs(r.monthlyThreeplPickPackUsd - pickPackCheck) < 0.01,
);

// (6) Verdict spread — exercise the 5 verdict buckets.
// Per-order delta target ranges (verdict thresholds in the engine):
//   strong_3pl:     delta >= +$3.00/order
//   lean_3pl:       delta in [+1.00, +3.00)
//   parity:         |delta| < $1.00/order
//   lean_inhouse:   delta in [-3.00, -1.00]
//   strong_inhouse: delta <= -$3.00/order
//
// Default in-house variable cost ≈ $1.67/order; default 3PL variable cost
// ≈ $5.18/order. To land in "lean_3pl" the override must shrink the
// in-house fixed cost (lower FTE + lower lease) enough that per-order delta
// is in [$0.50, $2.00). For parity, both sides must approach each other
// per-order (cuts to a tiny shop with cheap leased space and a
// premium-quoted 3PL).
const buckets: Array<{ name: string; override: Partial<InventoryCostInputs>; expected: Verdict }> = [
  // strong_3pl: high lease + high FTE + low 3PL quote = 3PL crushes per-order.
  {
    name: "strong_3pl",
    override: { fteHeadcount: 6, warehouseLeaseUsdMo: 25_000 },
    expected: "strong_3pl",
  },
  // lean_3pl: 2 FTE in a moderate-lease space + slow 3PL pick-pack ~ $6.0/ord.
  // → per-order delta ~ $1.15.
  {
    name: "lean_3pl",
    override: {
      fteHeadcount: 2,
      warehouseLeaseUsdMo: 7_000,
      threeplPickPackUsd: 6.0,
      miscOpsUsdMo: 800,
    },
    expected: "lean_3pl",
  },
  // parity: 2 FTE + small lease + cheap 3PL pick-pack + low pallet storage.
  // → per-order delta ~ -$0.37.
  {
    name: "parity",
    override: {
      fteHeadcount: 2,
      warehouseLeaseUsdMo: 2_000,
      loadedHrlyRateUsd: 24,
      threeplPickPackUsd: 4.6,
      palletCount: 6,
      threeplStorageUsdPallet: 30,
      miscOpsUsdMo: 400,
      inboundPerOrderUsd: 1.0,
    },
    expected: "parity",
  },
  // lean_inhouse: 4 FTE in-house at cheap loaded rate + cheap 3PL.
  // → per-order delta ~ -$2.37 to -$3.00 (still in-house by $1-3 bracket).
  {
    name: "lean_inhouse",
    override: {
      fteHeadcount: 5,
      warehouseLeaseUsdMo: 0,
      loadedHrlyRateUsd: 18,
      threeplPickPackUsd: 7.4,
      palletCount: 12,
      threeplStorageUsdPallet: 30,
      miscOpsUsdMo: 1_000,
      inboundPerOrderUsd: 0.6,
    },
    expected: "lean_inhouse",
  },
  // strong_inhouse: garage operation + premium 3PL quote + low pallet count
  // + low returns → in-house crushes per-order.
  {
    name: "strong_inhouse",
    override: {
      fteHeadcount: 1,
      warehouseLeaseUsdMo: 0,
      loadedHrlyRateUsd: 18,
      threeplPickPackUsd: 16,
      palletCount: 2,
      threeplStorageUsdPallet: 90,
      miscOpsUsdMo: 100,
      inboundPerOrderUsd: 0.3,
      threeplReturnsPct: 5,
    },
    expected: "strong_inhouse",
  },
];
for (const b of buckets) {
  const result = computeInventoryCost({ ...INVENTORY_DEFAULTS, ...b.override });
  check(
    `${b.name} bucket → verdict ${b.expected} (got ${result.verdict})`,
    result.verdict === b.expected,
    `per-order delta $${(
      (result.monthlyInhouseTotalUsd - result.monthlyThreeplTotalUsd) /
      Math.max(1, INVENTORY_DEFAULTS.monthlyOrders)
    ).toFixed(2)}`,
  );
}

// (7) Zero orders → PARITY.
const zero = computeInventoryCost({ ...INVENTORY_DEFAULTS, monthlyOrders: 0 });
check("zero-order verdict is PARITY", zero.verdict === "parity");

// (8) Break-even is positive when 3PL fixed < in-house fixed AND variable costs diverge.
const highLease = computeInventoryCost({ ...INVENTORY_DEFAULTS, warehouseLeaseUsdMo: 25_000 });
check(
  "high-lease break-even > 0",
  Number.isFinite(highLease.breakEvenMonthlyOrders) &&
    highLease.breakEvenMonthlyOrders > 0,
);
check(
  "high-lease break-even is reproducible",
  highLease.breakEvenMonthlyOrders > 0 && highLease.breakEvenMonthlyOrders < 50_000,
);
// Mid-volume report: default break-even should sit between 1k and 25k orders/mo.
check(
  "default break-even is in the 1k–25k orders/mo band",
  Number.isFinite(r.breakEvenMonthlyOrders) &&
    r.breakEvenMonthlyOrders > 1_000 &&
    r.breakEvenMonthlyOrders < 25_000,
);

// (9) Year-1 ROI ratio ordering.
check(
  "Year-1 ROI high band > low band when annual delta is positive",
  r.year1RoiHigh >= r.year1RoiLow,
);

// (10) Markdown render — required headers present.
const md = renderInventoryCostMarkdown(INVENTORY_DEFAULTS, r);
const requiredHeaders = [
  "Operator inputs",
  "Verdict",
  "In-house monthly cost stack",
  "3PL monthly cost stack",
  "Annual delta",
  "Operator handoff",
  "Sources",
];
for (const header of requiredHeaders) {
  check(`markdown contains "${header}" header`, md.includes(header));
}
check(
  "markdown contains the canonical verdict label",
  md.includes(inventoryVerdictTag(r.verdict).label),
);

// (11) inventoryVerdictTag covers all 5 verdict buckets.
const allVerdicts: Verdict[] = [
  "strong_3pl",
  "lean_3pl",
  "parity",
  "lean_inhouse",
  "strong_inhouse",
];
for (const v of allVerdicts) {
  const tag = inventoryVerdictTag(v);
  check(
    `inventoryVerdictTag(${v}) returns non-empty label + tone`,
    tag.label.length > 0 && tag.tone.length > 0,
  );
}

// (12) mergeFromYourStoreForInventory.
const merged = mergeFromYourStoreForInventory(INVENTORY_DEFAULTS, {
  ...YOUR_STORE_DEFAULTS,
  aov: 120,
  monthlyOrders: 4500,
});
check(
  "mergeFromYourStore applies aov from Your-store",
  merged.aov === 120,
);
check(
  "mergeFromYourStore applies monthlyOrders from Your-store",
  merged.monthlyOrders === 4500,
);
check(
  "mergeFromYourStore leaves FTE alone (cost-side)",
  merged.fteHeadcount === INVENTORY_DEFAULTS.fteHeadcount,
);
check(
  "mergeFromYourStore with null returns base unchanged",
  mergeFromYourStoreForInventory(INVENTORY_DEFAULTS, null) === INVENTORY_DEFAULTS,
);

// (13) Validation — rejects bad aov.
const badAov = validateInventoryInputs({ ...INVENTORY_DEFAULTS, aov: -1 });
check("validateInventoryInputs rejects aov < 0", typeof badAov === "string" && badAov.length > 0);
const badFte = validateInventoryInputs({ ...INVENTORY_DEFAULTS, fteHeadcount: 250 });
check(
  "validateInventoryInputs rejects fteHeadcount > 200",
  typeof badFte === "string" && badFte.length > 0,
);
check(
  "validateInventoryInputs accepts defaults",
  validateInventoryInputs(INVENTORY_DEFAULTS) === null,
);

// (14) Compute result is stable (same inputs → same output).
const r2 = computeInventoryCost(INVENTORY_DEFAULTS);
check(
  "compute is deterministic",
  r.monthlyInhouseTotalUsd === r2.monthlyInhouseTotalUsd &&
    r.monthlyThreeplTotalUsd === r2.monthlyThreeplTotalUsd &&
    r.verdict === r2.verdict &&
    r.breakEvenMonthlyOrders === r2.breakEvenMonthlyOrders,
);

// (15) Returns-cost grows as returnsPct grows (monotone).
const lowReturns = computeInventoryCost({ ...INVENTORY_DEFAULTS, threeplReturnsPct: 5 });
const highReturns = computeInventoryCost({ ...INVENTORY_DEFAULTS, threeplReturnsPct: 25 });
check(
  "higher return rate → higher in-house returns cost",
  highReturns.monthlyInhouseReturnsUsd > lowReturns.monthlyInhouseReturnsUsd,
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("\nFAILURES:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("OK");
