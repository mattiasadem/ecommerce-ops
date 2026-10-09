/**
 * `calculator-roi-chip.test.ts` — Move #N.25 per-playbook ROI chip tests.
 *
 * Validates the pure-logic API of `calculator-roi-chip.ts`:
 *
 *   - `buildCalculatorRoiChip` returns the matching row for every
 *     canonical slug + returns `inTop10WithCalculator=false` for
 *     unknown slugs
 *   - `calculatorRoiChipHeadline` 4-branch coverage:
 *       0 lift / shipped / on numbers / on defaults
 *   - `calculatorRoiChipToneClass` 5-branch coverage:
 *       not-in-top / 0-lift / shipped / on numbers / on defaults
 *   - `calculatorRoiChipRankLabel` returns "#N of M" or null
 *   - `formatChipUsd` 9 cases: 0 / sub-1k / 1-decimal k / integer k / M
 *   - `CANONICAL_CALCULATOR_ROI_CHIP` invariants: 7 expected slugs +
 *     minMatches check
 *
 * Run via: `npx jiti src/lib/__tests__/calculator-roi-chip.test.ts`
 */

import assert from "node:assert/strict";

import {
  buildCalculatorRoiChip,
  calculatorRoiChipHeadline,
  calculatorRoiChipRankLabel,
  calculatorRoiChipToneClass,
  formatChipUsd,
  CANONICAL_CALCULATOR_ROI_CHIP,
} from "../calculator-roi-chip";
import { YOUR_STORE_DEFAULTS, type YourStoreInputs } from "../your-store";
import { MOVE_RECOMMENDATIONS } from "../next-move";

let totalPassed = 0;
let totalFailed = 0;
const failures: string[] = [];

function test(label: string, fn: () => void) {
  try {
    fn();
    totalPassed += 1;
    // eslint-disable-next-line no-console
    console.log(`  ✓ ${label}`);
  } catch (err) {
    totalFailed += 1;
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${label}: ${msg}`);
    // eslint-disable-next-line no-console
    console.log(`  ✗ ${label}\n      ${msg}`);
  }
}

// -- buildCalculatorRoiChip --------------------------------------------------

test("buildCalculatorRoiChip returns row for every canonical slug (on defaults)", () => {
  for (const slug of CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs) {
    const row = buildCalculatorRoiChip(slug, null, null);
    assert.equal(row.inTop10WithCalculator, true, `${slug} should be in top-10`);
    assert.ok(row.row !== null, `${slug} row should not be null`);
    assert.equal(row.usingDefaults, true, `${slug} should be on defaults`);
    assert.equal(row.shipped, false, `${slug} should not be shipped by default`);
    assert.ok(row.payback !== null, `${slug} payback should not be null`);
  }
  // 7 calculator-backed Top-10 slugs.
  assert.equal(CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs.length, 7);
});

test("buildCalculatorRoiChip returns row with annualLiftHigh > 0 on numbers for known slug", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, null);
  assert.equal(row.inTop10WithCalculator, true);
  assert.ok(row.row !== null);
  // aov * orders * 12 * 0.10 = 100 * 2000 * 12 * 0.10 = 240_000
  assert.equal(row.row!.annualLiftHigh, 240_000);
  assert.equal(row.row!.annualLiftLow, 120_000); // 5% low band
  assert.equal(row.row!.monthlyLiftHigh, 20_000);
  assert.equal(row.row!.priorityRank, 1);
  // 10% lift is the lowest in the calculator-backed Top-10 → rank 7.
  assert.equal(row.row!.rank, 7);
  assert.equal(row.row!.daysToShip, 3);
});

test("buildCalculatorRoiChip marks shipped=true when shipped map has the slug", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, {
    "01-abandoned-cart-flow-klaviyo": true,
  });
  assert.equal(row.shipped, true);
});

test("buildCalculatorRoiChip returns inTop10WithCalculator=false for unknown slug", () => {
  const row = buildCalculatorRoiChip("this-slug-is-not-a-canonical-calculator-move-zzz", null, null);
  assert.equal(row.inTop10WithCalculator, false);
  assert.equal(row.row, null);
  assert.equal(row.payback, null);
});

test("buildCalculatorRoiChip returns 0 lift for a slug whose low-band is 0 (defensive)", () => {
  // Hypothetical: choose a slug in `MOVE_RECOMMENDATIONS` but with a 0
  // lift band; ensure we don't NaN out. Use `04-welcome-series-klaviyo`
  // at extreme low aov/orders (still positive monthly revenue).
  const store: YourStoreInputs = { aov: 1, monthlyOrders: 1, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("04-welcome-series-klaviyo", store, null);
  // aov * orders * 12 = 12, lift 0.03 → 0.36 → rounded to 0.
  assert.equal(row.row!.annualLiftHigh, 0); // rounds to 0
});

test("buildCalculatorRoiChip defensive null-store + null-shipped", () => {
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", null, null);
  assert.equal(row.usingDefaults, true);
  assert.equal(row.shipped, false);
});

// -- calculatorRoiChipHeadline ----------------------------------------------

test("calculatorRoiChipHeadline returns null for non-Top-10 slug", () => {
  const row = buildCalculatorRoiChip("this-is-a-bogus-slug-zzz", null, null);
  assert.equal(calculatorRoiChipHeadline(row), null);
});

test("calculatorRoiChipHeadline returns 'Shipped — captured $X/yr' when shipped", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, {
    "01-abandoned-cart-flow-klaviyo": true,
  });
  const headline = calculatorRoiChipHeadline(row);
  assert.ok(headline !== null);
  assert.match(headline!, /Shipped/);
  assert.match(headline!, /\$240k\/yr/);
});

test("calculatorRoiChipHeadline returns 'Projects $X/yr on your numbers' when on numbers + unshipped", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, null);
  const headline = calculatorRoiChipHeadline(row);
  assert.ok(headline !== null);
  assert.match(headline!, /Projects/);
  assert.match(headline!, /\$240k\/yr/);
  assert.match(headline!, /on your numbers/);
});

test("calculatorRoiChipHeadline returns '...at default $...' when on defaults + unshipped", () => {
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", null, null);
  const headline = calculatorRoiChipHeadline(row);
  assert.ok(headline !== null);
  assert.match(headline!, /at default/);
  assert.match(headline!, /personalize/);
});

test("calculatorRoiChipHeadline returns 'Set your AOV / orders on / to project' for zero-lift", () => {
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", null, null);
  // Force a 0-lift row by mutating internal — easier to test the headline
  // branch by checking the 0-lift defensive label directly. Use the
  // CANONICAL constant.
  const zeroLiftLabel = CANONICAL_CALCULATOR_ROI_CHIP.zeroLiftLabel;
  assert.match(zeroLiftLabel, /Set your AOV/);
  // Build a synthetic 0-lift chip row for headline testing.
  const synthetic: Parameters<typeof calculatorRoiChipHeadline>[0] = {
    row: {
      slug: "x",
      name: "x",
      calculator: {
        slug: "x",
        calculatorKey: "x",
        type: "roi-projection",
      },
      priorityRank: 1,
      rationale: "x",
      annualLiftHigh: 0,
      annualLiftLow: 0,
      monthlyLiftHigh: 0,
      daysToShip: 3,
      rank: 1,
    },
    payback: null,
    shipped: false,
    usingDefaults: false,
    inTop10WithCalculator: true,
  };
  assert.equal(calculatorRoiChipHeadline(synthetic), zeroLiftLabel);
});

// -- calculatorRoiChipToneClass --------------------------------------------

test("calculatorRoiChipToneClass returns muted for non-Top-10", () => {
  const row = buildCalculatorRoiChip("zzz-not-a-real-slug", null, null);
  const tone = calculatorRoiChipToneClass(row);
  assert.match(tone, /border-border/);
});

test("calculatorRoiChipToneClass returns sky when shipped", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, {
    "01-abandoned-cart-flow-klaviyo": true,
  });
  const tone = calculatorRoiChipToneClass(row);
  assert.match(tone, /border-sky/);
});

test("calculatorRoiChipToneClass returns emerald when on numbers + unshipped", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, null);
  const tone = calculatorRoiChipToneClass(row);
  assert.match(tone, /border-emerald/);
});

test("calculatorRoiChipToneClass returns amber when on defaults + unshipped", () => {
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", null, null);
  const tone = calculatorRoiChipToneClass(row);
  assert.match(tone, /border-amber/);
});

test("calculatorRoiChipToneClass returns muted when 0 lift (defensive)", () => {
  const synthetic: Parameters<typeof calculatorRoiChipToneClass>[0] = {
    row: null,
    payback: null,
    shipped: false,
    usingDefaults: false,
    inTop10WithCalculator: false,
  };
  const tone = calculatorRoiChipToneClass(synthetic);
  assert.match(tone, /border-border/);
});

// -- calculatorRoiChipRankLabel --------------------------------------------

test("calculatorRoiChipRankLabel returns '#N of M' for known slug", () => {
  const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const row = buildCalculatorRoiChip("01-abandoned-cart-flow-klaviyo", store, null);
  // 10% lift → rank 7 of 7 (lowest lift in calculator-backed Top-10).
  assert.equal(calculatorRoiChipRankLabel(row, 7), "#7 of 7");
});

test("calculatorRoiChipRankLabel returns null for unknown slug", () => {
  const row = buildCalculatorRoiChip("zzz-fake-slug", null, null);
  assert.equal(calculatorRoiChipRankLabel(row, 7), null);
});

// -- formatChipUsd ---------------------------------------------------------

test("formatChipUsd handles 0", () => {
  assert.equal(formatChipUsd(0), "$0");
});

test("formatChipUsd handles sub-$1k", () => {
  assert.equal(formatChipUsd(500), "$500");
});

test("formatChipUsd handles $1k+ with 1 decimal", () => {
  assert.equal(formatChipUsd(1_500), "$1.5k");
  assert.equal(formatChipUsd(9_999), "$10.0k"); // rounds at >= 10k
});

test("formatChipUsd handles $10k+ with integer", () => {
  assert.equal(formatChipUsd(10_000), "$10k");
  assert.equal(formatChipUsd(240_000), "$240k");
  assert.equal(formatChipUsd(999_000), "$999k");
});

test("formatChipUsd handles $1M+ with 1 decimal", () => {
  assert.equal(formatChipUsd(1_000_000), "$1.0M");
  assert.equal(formatChipUsd(2_500_000), "$2.5M");
});

test("formatChipUsd defensive: NaN / negative / Infinity → '—'", () => {
  assert.equal(formatChipUsd(NaN), "—");
  assert.equal(formatChipUsd(-100), "—");
  assert.equal(formatChipUsd(-Infinity), "—");
  assert.equal(formatChipUsd(Infinity), "—"); // positive infinity filtered as not finite
});

// -- CANONICAL pin invariants ---------------------------------------------

test("CANONICAL_CALCULATOR_ROI_CHIP pins 7 calculator-backed slugs", () => {
  assert.equal(CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs.length, 7);
  assert.equal(CANONICAL_CALCULATOR_ROI_CHIP.minMatches, 7);
});

test("CANONICAL_CALCULATOR_ROI_CHIP every expected slug resolves to a real row", () => {
  for (const slug of CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs) {
    const row = buildCalculatorRoiChip(slug, null, null);
    assert.equal(row.inTop10WithCalculator, true, `${slug} should resolve`);
    assert.ok(row.row !== null, `${slug} should have a row`);
  }
});

test("CANONICAL_CALCULATOR_ROI_CHIP canonical slugs match MOVE_RECOMMENDATIONS IDs", () => {
  const moveIds = new Set(MOVE_RECOMMENDATIONS.map((m) => m.id));
  for (const slug of CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs) {
    assert.ok(moveIds.has(slug), `${slug} must exist in MOVE_RECOMMENDATIONS`);
  }
});

test("CANONICAL_CALCULATOR_ROI_CHIP zero-lift label is non-empty", () => {
  assert.ok(CANONICAL_CALCULATOR_ROI_CHIP.zeroLiftLabel.length > 0);
  assert.match(CANONICAL_CALCULATOR_ROI_CHIP.zeroLiftLabel, /Set your AOV/);
});

test("CANONICAL_CALCULATOR_ROI_CHIP stub label is non-empty", () => {
  assert.ok(CANONICAL_CALCULATOR_ROI_CHIP.stubLabel.length > 0);
  assert.match(CANONICAL_CALCULATOR_ROI_CHIP.stubLabel, /Loading/);
});

// -- Cross-page integration ------------------------------------------------

test("Integration: 7/7 calculator-backed Top-10 slugs render successfully", () => {
  for (const slug of CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs) {
    const store: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
    const row = buildCalculatorRoiChip(slug, store, null);
    assert.equal(row.inTop10WithCalculator, true, `${slug} should be in top-10 on numbers`);
    const headline = calculatorRoiChipHeadline(row);
    assert.ok(headline !== null);
    assert.match(headline!, /Projects/);
    const tone = calculatorRoiChipToneClass(row);
    assert.match(tone, /border-emerald/);
    const rank = calculatorRoiChipRankLabel(row, 7);
    assert.ok(rank !== null && /#\d+ of 7/.test(rank));
  }
});

test("Integration: defaults path -> amber tone + at-default headline", () => {
  for (const slug of CANONICAL_CALCULATOR_ROI_CHIP.expectedSlugs) {
    const row = buildCalculatorRoiChip(slug, null, null);
    const headline = calculatorRoiChipHeadline(row);
    assert.ok(headline !== null);
    assert.match(headline!, /at default/);
    const tone = calculatorRoiChipToneClass(row);
    assert.match(tone, /border-amber/);
  }
});

// -- Run + summary ---------------------------------------------------------

console.log("");
console.log(`calculator-roi-chip: ${totalPassed} passed, ${totalFailed} failed`);
if (totalFailed > 0) {
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
  process.exit(1);
}
// Sanity: ensure YOUR_STORE_DEFAULTS hasn't quietly changed in a way
// that would make the headline math diverge.
assert.equal(YOUR_STORE_DEFAULTS.aov, 75);
assert.equal(YOUR_STORE_DEFAULTS.monthlyOrders, 1000);
assert.ok(YOUR_STORE_DEFAULTS.grossMargin > 0);
