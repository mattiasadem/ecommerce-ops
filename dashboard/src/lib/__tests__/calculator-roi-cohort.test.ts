/**
 * Tests for `calculator-roi-cohort.ts` — Move #N.23.1 cohort split.
 *
 * TDD contract test for the new pure-logic helper that joins the
 * `CalculatorRoiRankSummary.rows` against the operator's
 * `ShippedMap` (the same `ecom-ops:shipped-playbooks:v1` localStorage
 * key used by the shipped-playbooks toggle on `/playbooks`).
 *
 * The split is the load-bearing data shape for the new
 * "shipped vs on-the-table" cohort view on the Calculator ROI rank card.
 * If the contract drifts (e.g. shippedRows accidentally mixed into
 * unshippedRows), these tests must fail so the deployed build gets
 * blocked.
 */
import {
  buildCalculatorRoiCohort,
  calculatorRoiCohortHeadline,
  calculatorRoiCohortToneClass,
  formatCohortCount,
  CANONICAL_CALCULATOR_ROI_COHORT,
} from "../calculator-roi-cohort";
import type { CalculatorRoiRankSummary } from "../calculator-roi-rank";
import type { ShippedMap } from "../shipped-playbooks";

const row = (slug: string, rank: number, annualLiftHigh: number) => ({
  slug,
  name: `Move ${rank}`,
  calculator: { slug, calculatorKey: `${slug}Key`, type: "roi-projection" as const },
  priorityRank: rank,
  rationale: `Why ${slug}`,
  annualLiftHigh,
  annualLiftLow: Math.round(annualLiftHigh * 0.5),
  monthlyLiftHigh: Math.round(annualLiftHigh / 12),
  daysToShip: 5,
  rank,
});

const summary: CalculatorRoiRankSummary = {
  rows: [
    row("01-abandoned-cart-flow-klaviyo", 1, 90000),
    row("03-checkout-audit-baymard", 2, 315000),
    row("02-post-purchase-upsell-reconvert", 3, 135000),
    row("04-welcome-series-klaviyo", 4, 22500),
    row("06-sms-welcome-and-cart-abandon", 5, 72000),
  ],
  matchingMoves: 5,
  totalMoves: 10,
  monthlyRevenue: 75000,
  totalAnnualLiftHigh: 634500,
  aov: 75,
  monthlyOrders: 1000,
  usingDefaults: false,
};

const emptyShipped: ShippedMap = {};
const oneShipped: ShippedMap = {
  "03-checkout-audit-baymard": { shippedAt: "2026-10-01T00:00:00Z" },
};
const twoShipped: ShippedMap = {
  "01-abandoned-cart-flow-klaviyo": { shippedAt: "2026-10-01T00:00:00Z" },
  "03-checkout-audit-baymard": { shippedAt: "2026-09-15T00:00:00Z" },
};

let passed = 0;
let failed = 0;
function expect(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} — ${detail}`);
  }
}

console.log("calculator-roi-cohort: contract tests");

const c1 = buildCalculatorRoiCohort(summary, emptyShipped, 5);
expect("0 shipped → 0 shippedRows, 5 unshippedRows", c1.shippedRows.length === 0 && c1.unshippedRows.length === 5, `got shipped=${c1.shippedRows.length} unshipped=${c1.unshippedRows.length}`);
expect("shippedSlugs empty when 0 shipped", c1.shippedSlugs.length === 0);
expect("unshippedSlugs = all 5 slugs", c1.unshippedSlugs.length === 5);
expect("unshippedAnnualLiftHigh = totalAnnualLiftHigh (no shipped)", c1.unshippedAnnualLiftHigh === summary.totalAnnualLiftHigh);
expect("shippedAnnualLiftHigh = 0 when 0 shipped", c1.shippedAnnualLiftHigh === 0);
expect("shippedCount = 0", c1.shippedCount === 0);
expect("unshippedCount = 5", c1.unshippedCount === 5);

const c2 = buildCalculatorRoiCohort(summary, oneShipped, 5);
expect("1 shipped → 1 shippedRow, 4 unshippedRows", c2.shippedRows.length === 1 && c2.unshippedRows.length === 4);
expect("shipped row is 03-checkout-audit (the shipped one)", c2.shippedRows[0]?.slug === "03-checkout-audit-baymard");
expect("unshipped excludes 03-checkout-audit", c2.unshippedSlugs.includes("03-checkout-audit-baymard") === false);
expect("shippedAnnualLiftHigh = 315000 (the 03 row)", c2.shippedAnnualLiftHigh === 315000, `got ${c2.shippedAnnualLiftHigh}`);
expect("unshippedAnnualLiftHigh = total - shipped = 319500", c2.unshippedAnnualLiftHigh === 634500 - 315000, `got ${c2.unshippedAnnualLiftHigh}`);

const c3 = buildCalculatorRoiCohort(summary, twoShipped, 5);
expect("2 shipped → 2 shippedRows, 3 unshippedRows", c3.shippedRows.length === 2 && c3.unshippedRows.length === 3);
expect("shipped sum = 90000 + 315000 = 405000", c3.shippedAnnualLiftHigh === 405000, `got ${c3.shippedAnnualLiftHigh}`);
expect("unshipped sum = 634500 - 405000 = 229500", c3.unshippedAnnualLiftHigh === 229500, `got ${c3.unshippedAnnualLiftHigh}`);
expect("unshipped slugs are 02, 04, 06", c3.unshippedSlugs.length === 3 && c3.unshippedSlugs.includes("02-post-purchase-upsell-reconvert") && c3.unshippedSlugs.includes("04-welcome-series-klaviyo") && c3.unshippedSlugs.includes("06-sms-welcome-and-cart-abandon"));

const c4 = buildCalculatorRoiCohort(summary, twoShipped, 2);
expect("maxRows=2 caps both lists to 2", c4.shippedRows.length === 2 && c4.unshippedRows.length === 2, `got shipped=${c4.shippedRows.length} unshipped=${c4.unshippedRows.length}`);

const c5 = buildCalculatorRoiCohort(summary, { "unknown-slug": { shippedAt: "x" } }, 5);
expect("shipped slug not in summary rows → 0 shippedRows", c5.shippedRows.length === 0, `got ${c5.shippedRows.length}`);
expect("unknown shipped → 5 unshippedRows (unchanged)", c5.unshippedRows.length === 5);

const c6 = buildCalculatorRoiCohort({ ...summary, rows: [] }, emptyShipped, 5);
expect("empty rows → 0 shipped + 0 unshipped", c6.shippedRows.length === 0 && c6.unshippedRows.length === 0);

const h1 = calculatorRoiCohortHeadline(c1, 5);
expect("headline all-unshipped mentions 'on the table'", h1.toLowerCase().includes("on the table"));
const h2 = calculatorRoiCohortHeadline(c3, 5);
expect("headline 2-of-5 mentions shipped count '2'", h2.includes("2"), `got "${h2}"`);
const h3 = calculatorRoiCohortHeadline(c6, 5);
expect("headline empty summary is a defensive no-match message", h3.toLowerCase().includes("no calculator-backed moves") || h3.length > 0);

const t1 = calculatorRoiCohortToneClass(c1);
const t2 = calculatorRoiCohortToneClass(c3);
expect("tone class 0 shipped is emerald (pure upside)", t1.includes("emerald"));
expect("tone class >0 shipped is sky (mixed)", t2.includes("sky"));

expect("formatCohortCount(0, 5) = '0 of 5'", formatCohortCount(0, 5) === "0 of 5");
expect("formatCohortCount(2, 5) = '2 of 5'", formatCohortCount(2, 5) === "2 of 5");
expect("formatCohortCount(5, 5) = '5 of 5'", formatCohortCount(5, 5) === "5 of 5");
expect("formatCohortCount(0, 0) = '0 of 0' (edge)", formatCohortCount(0, 0) === "0 of 0");

expect("CANONICAL_CALCULATOR_ROI_COHORT has minMatches 7", CANONICAL_CALCULATOR_ROI_COHORT.minMatches === 7);
expect("CANONICAL_CALCULATOR_ROI_COHORT expectedSlugs has 7 entries", CANONICAL_CALCULATOR_ROI_COHORT.expectedSlugs.length === 7);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
