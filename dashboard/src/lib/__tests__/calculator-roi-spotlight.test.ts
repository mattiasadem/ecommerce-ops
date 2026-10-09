/**
 * TDD contract tests for `calculator-roi-spotlight.ts` — Move #N.24.
 *
 * Covers:
 *   - buildCalculatorRoiSpotlight returns expected top-N rows
 *   - spotlight rows are ranked by annualLiftHigh DESC
 *   - spotlight rows are all on-the-table (unshipped) by default
 *   - spotlight subline handles 0-shipped + N-shipped + all-shipped
 *   - spotlight headline handles 0 / 0-shipped / mixed / all-shipped
 *   - formatSpotlightUsd 6 cases ($0 / $N / $Nk / $N.Nk / $N.NM / NaN+negative)
 *   - CANONICAL_CALCULATOR_ROI_SPOTLIGHT invariants (3 maxRows, 7 minMatches)
 *
 * Run with: `npx jiti src/lib/__tests__/calculator-roi-spotlight.test.ts`
 */

import {
  CANONICAL_CALCULATOR_ROI_SPOTLIGHT,
  buildCalculatorRoiSpotlight,
  formatSpotlightUsd,
  spotlightHeadline,
  spotlightSubline,
  spotlightToneClass,
} from "../calculator-roi-spotlight";
import { YOUR_STORE_DEFAULTS } from "../your-store";

let passed = 0;
let failed = 0;
function assert(cond: unknown, label: string): void {
  if (cond) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${label}`);
  }
}

// -- buildCalculatorRoiSpotlight -------------------------------------------

(function testBuildSpotlightBasics() {
  const s = buildCalculatorRoiSpotlight(null, {}, 3);

  assert(s.rows.length <= 3, `rows.length (${s.rows.length}) <= maxRows (3)`);
  assert(s.rows.length > 0, `rows.length (${s.rows.length}) > 0 with 0 shipped`);
  assert(s.summary.matchingMoves >= CANONICAL_CALCULATOR_ROI_SPOTLIGHT.minMatches,
    `matchingMoves (${s.summary.matchingMoves}) >= minMatches (${CANONICAL_CALCULATOR_ROI_SPOTLIGHT.minMatches})`);
  assert(s.rows.every((r) => !r.shipped), "all default rows are unshipped");
  assert(s.rows.every((r) => r.payback !== undefined), "all rows have payback enrichment");
  assert(s.rows.every((r) => r.payback.paybackMonths !== undefined), "all rows have computed paybackMonths");
  assert(s.summary.usingDefaults === true, "null store → usingDefaults true");

  // Rows sorted by annualLiftHigh DESC.
  for (let i = 1; i < s.rows.length; i++) {
    const prev = s.rows[i - 1];
    const curr = s.rows[i];
    if (!prev || !curr) continue;
    assert(
      prev.row.annualLiftHigh >= curr.row.annualLiftHigh,
      `row[${i - 1}].liftHigh (${prev.row.annualLiftHigh}) >= row[${i}].liftHigh (${curr.row.annualLiftHigh})`,
    );
  }
})();

// -- spotlightHeadline ------------------------------------------------------

(function testHeadline() {
  // 0 shipped → no cohort prefix
  const s0 = buildCalculatorRoiSpotlight(null, {}, 3);
  const h0 = spotlightHeadline(s0);
  assert(h0 !== null, "headline non-null with 0 shipped");
  assert(
    h0 !== null && /calculator-backed moves/.test(h0),
    "0-shipped headline mentions 'calculator-backed moves'",
  );

  // Shipped the top row
  const topRow = s0.rows[0];
  if (topRow) {
    const s1 = buildCalculatorRoiSpotlight(null, { [topRow.row.slug]: true }, 3);
    const h1 = spotlightHeadline(s1);
    assert(h1 !== null, "headline non-null with 1 shipped");
    assert(
      h1 !== null && /shipped/.test(h1),
      "1-shipped headline mentions 'shipped'",
    );
  }

  // Ship ALL the top-3 — the spotlight surfaces all top-N regardless
  // of shipped status (the operator wants to see "I've shipped all
  // 3 of my top-3 — here's the next calculator" with shipped badges
  // on every row). The headline should reflect the all-shipped state.
  const allShippedMap: Record<string, boolean> = {};
  for (const r of s0.rows) {
    allShippedMap[r.row.slug] = true;
  }
  const sAll = buildCalculatorRoiSpotlight(null, allShippedMap, 3);
  assert(sAll.rows.length === 3, `all-top-shipped → 3 spotlight rows (got ${sAll.rows.length})`);
  assert(sAll.rows.every((r) => r.shipped), "all rows have shipped=true");
  assert(sAll.topShippedCount === 3, "topShippedCount = 3");
  assert(sAll.topUnshippedCount === 0, "topUnshippedCount = 0");
  const hAll = spotlightHeadline(sAll);
  assert(hAll !== null, "all-top-shipped → headline non-null");
  assert(hAll !== null && /All top/.test(hAll), "all-top-shipped headline mentions 'All top'");
})();

// -- spotlightSubline ------------------------------------------------------

(function testSubline() {
  // 0 shipped → "On the table — open a calculator to model on your numbers"
  const s0 = buildCalculatorRoiSpotlight(null, {}, 3);
  const sl0 = spotlightSubline(s0);
  assert(/On the table/.test(sl0), `0-shipped subline mentions 'On the table' (got: ${sl0})`);
  assert(/open a calculator/.test(sl0), `0-shipped subline mentions 'open a calculator' (got: ${sl0})`);

  // 1 shipped → "1 captured · M on the table"
  const topRow = s0.rows[0];
  if (topRow) {
    const s1 = buildCalculatorRoiSpotlight(null, { [topRow.row.slug]: true }, 3);
    const sl1 = spotlightSubline(s1);
    assert(/captured/.test(sl1), `1-shipped subline mentions 'captured' (got: ${sl1})`);
    assert(/on the table/.test(sl1), `1-shipped subline mentions 'on the table' (got: ${sl1})`);
  }

  // All shipped → "All top N shipped — captured $X/yr"
  // Ship all top-3 to trigger the all-shipped branch.
  const allShippedMap: Record<string, boolean> = {};
  for (const r of s0.rows) {
    allShippedMap[r.row.slug] = true;
  }
  const sAll = buildCalculatorRoiSpotlight(null, allShippedMap, 3);
  const slAll = spotlightSubline(sAll);
  assert(/All top/.test(slAll), `all-shipped subline mentions 'All top' (got: ${slAll})`);
})();

// -- spotlightToneClass ----------------------------------------------------

(function testToneClass() {
  const sDefault = buildCalculatorRoiSpotlight(null, {}, 3);
  assert(/amber/.test(spotlightToneClass(sDefault)), "toneClass has amber when on defaults");

  const sOnNumbers = buildCalculatorRoiSpotlight(
    { aov: 200, monthlyOrders: 5000, grossMargin: 0.6 },
    {},
    3,
  );
  assert(/emerald/.test(spotlightToneClass(sOnNumbers)), "toneClass has emerald when on numbers");
})();

// -- formatSpotlightUsd -----------------------------------------------------

(function testFormatSpotlightUsd() {
  assert(formatSpotlightUsd(0) === "$0", "0 → '$0'");
  assert(formatSpotlightUsd(500) === "$500", "500 → '$500'");
  assert(formatSpotlightUsd(999) === "$999", "999 → '$999'");
  assert(formatSpotlightUsd(1000) === "$1k", "1000 → '$1k'");
  assert(formatSpotlightUsd(15000) === "$15k", "15000 → '$15k'");
  assert(formatSpotlightUsd(75000) === "$75k", "75000 → '$75k'");
  assert(formatSpotlightUsd(1000000) === "$1M", "1000000 → '$1M'");
  assert(formatSpotlightUsd(2500000) === "$3M", "2500000 → '$3M' (rounded)");
  assert(formatSpotlightUsd(150000) === "$150k", "150000 → '$150k'");
  assert(formatSpotlightUsd(NaN) === "—", "NaN → '—'");
  assert(formatSpotlightUsd(-100) === "—", "-100 → '—'");
  assert(formatSpotlightUsd(Infinity) === "—", "Infinity → '—'");
})();

// -- CANONICAL pin ----------------------------------------------------------

(function testCanonicalPin() {
  assert(CANONICAL_CALCULATOR_ROI_SPOTLIGHT.defaultMaxRows === 3, "defaultMaxRows = 3");
  assert(CANONICAL_CALCULATOR_ROI_SPOTLIGHT.minMatches === 7, "minMatches = 7");
  assert(CANONICAL_CALCULATOR_ROI_SPOTLIGHT.emptyRowsAllowed === true, "emptyRowsAllowed = true");
})();

// -- Defensive: store = null falls back to YOUR_STORE_DEFAULTS --------------

(function testNullStoreFallback() {
  const sNull = buildCalculatorRoiSpotlight(null, {}, 3);
  const sDefaults = buildCalculatorRoiSpotlight(YOUR_STORE_DEFAULTS, {}, 3);
  assert(
    sNull.summary.monthlyRevenue === sDefaults.summary.monthlyRevenue,
    "null store uses YOUR_STORE_DEFAULTS (monthlyRevenue matches)",
  );
  assert(
    sNull.summary.aov === sDefaults.summary.aov,
    "null store uses YOUR_STORE_DEFAULTS (aov matches)",
  );
})();

// -- Summary

if (failed === 0) {
  console.log(`PASS: ${passed} assertions`);
} else {
  console.error(`FAIL: ${failed} of ${passed + failed} assertions failed`);
  process.exit(1);
}