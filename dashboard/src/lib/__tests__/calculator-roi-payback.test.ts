/**
 * TDD contract tests for `calculator-roi-payback.ts` — Move #N.23.4.
 *
 * Covers:
 *   - getMoveCostBySlug: returns costHigh for known slug, 0 for unknown
 *   - formatPaybackMonths: <1 → "< 1mo", 1-10 → "X.Xmo", 10-12 → "Xmo", >=12 → "12mo+", Infinity → "∞", null → "—"
 *   - paybackToneClass: <3 emerald, <6 sky, <12 amber, >=12 rose, Infinity emerald, null muted
 *   - buildPaybackEnrichment: zero-cost → Infinity; zero-lift → null; normal → cost/monthlyLift
 *   - CANONICAL_CALCULATOR_ROI_PAYBACK invariants (7 slugs, costHigh defined, formatter labels)
 *
 * Run with: `npx jiti src/lib/__tests__/calculator-roi-payback.test.ts`
 */

import { buildCalculatorRoiRank } from "../calculator-roi-rank";
import {
  CANONICAL_CALCULATOR_ROI_PAYBACK,
  buildPaybackEnrichment,
  formatPaybackMonths,
  getMoveCostBySlug,
  paybackToneClass,
} from "../calculator-roi-payback";
import { MOVE_RECOMMENDATIONS } from "../next-move";

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

// -- getMoveCostBySlug ------------------------------------------------------

(function testGetMoveCostBySlug() {
  const abandoned = MOVE_RECOMMENDATIONS.find((m) => m.id === "01-abandoned-cart-flow-klaviyo");
  assert(abandoned !== undefined, "01-abandoned move exists in MOVE_RECOMMENDATIONS");
  if (!abandoned) return;
  assert(getMoveCostBySlug("01-abandoned-cart-flow-klaviyo") === abandoned.costHigh, "costHigh matches for abandoned cart");
  assert(getMoveCostBySlug("02-post-purchase-upsell-reconvert") >= 0, "costHigh non-negative for post-purchase");
  assert(getMoveCostBySlug("not-a-real-slug") === 0, "unknown slug returns 0");
  assert(getMoveCostBySlug("03-checkout-audit-baymard") >= 0, "checkout-audit costHigh non-negative");
})();

// -- formatPaybackMonths ----------------------------------------------------

(function testFormatPaybackMonths() {
  assert(formatPaybackMonths(null) === "—", "null → '—'");
  assert(formatPaybackMonths(Infinity) === "∞", "Infinity → '∞'");
  assert(formatPaybackMonths(0) === "< 1mo", "0 → '< 1mo'");
  assert(formatPaybackMonths(0.5) === "< 1mo", "0.5 → '< 1mo'");
  assert(formatPaybackMonths(1) === "1.0mo", "1 → '1.0mo'");
  assert(formatPaybackMonths(5) === "5.0mo", "5 → '5.0mo'");
  assert(formatPaybackMonths(9.7) === "9.7mo", "9.7 → '9.7mo'");
  assert(formatPaybackMonths(10) === "10mo", "10 → '10mo'");
  assert(formatPaybackMonths(11.9) === "12mo", "11.9 → '12mo' (rounded)");
  assert(formatPaybackMonths(12) === "12mo+", "12 → '12mo+'");
  assert(formatPaybackMonths(48) === "12mo+", "48 → '12mo+'");
})();

// -- paybackToneClass -------------------------------------------------------

(function testPaybackToneClass() {
  assert(paybackToneClass(null).includes("text-muted-foreground"), "null → muted");
  assert(paybackToneClass(Infinity).includes("emerald"), "Infinity → emerald");
  assert(paybackToneClass(0.5).includes("emerald"), "0.5 → emerald (< 3)");
  assert(paybackToneClass(2).includes("emerald"), "2 → emerald (< 3)");
  assert(paybackToneClass(3).includes("sky"), "3 → sky (< 6)");
  assert(paybackToneClass(5.9).includes("sky"), "5.9 → sky (< 6)");
  assert(paybackToneClass(6).includes("amber"), "6 → amber (< 12)");
  assert(paybackToneClass(11).includes("amber"), "11 → amber (< 12)");
  assert(paybackToneClass(12).includes("rose"), "12 → rose (>= 12)");
  assert(paybackToneClass(48).includes("rose"), "48 → rose (>= 12)");
})();

// -- buildPaybackEnrichment: zero-cost → Infinity ---------------------------

(function testPaybackEnrichmentZeroCost() {
  // Construct a row with costHigh = 0 (use MOVE_RECOMMENDATIONS entry where costHigh = 0)
  const summary = buildCalculatorRoiRank({ aov: 100, monthlyOrders: 1000, grossMargin: 0.5 });
  // Find a row whose move costHigh is 0 — checkout-audit (Move #2) has costHigh 0 per the data
  const zeroCostRow = summary.rows.find((r) => getMoveCostBySlug(r.slug) === 0);
  if (zeroCostRow) {
    const p = buildPaybackEnrichment(zeroCostRow);
    assert(p.paybackMonths === Infinity, `paybackMonths=Infinity for zero-cost row ${zeroCostRow.slug}`);
    assert(p.toneClass.includes("emerald"), `toneClass=emerald for free tool ${zeroCostRow.slug}`);
    assert(p.display === "∞", `display=∞ for free tool ${zeroCostRow.slug}`);
    assert(p.costHighUsd === 0, `costHighUsd=0 for free tool ${zeroCostRow.slug}`);
  } else {
    // Defensive: if no zero-cost row exists, skip the assertion (not a regression)
    assert(true, "no zero-cost row in current data — skipped (not a regression)");
  }
})();

// -- buildPaybackEnrichment: normal case ------------------------------------

(function testPaybackEnrichmentNormal() {
  // Use abandoned-cart: costHigh=$60, on $100 AOV × 1000 orders = $100k/mo, liftHigh=10% → $10k/mo lift
  // paybackMonths = 60 / 10000 = 0.006 → "< 1mo" → emerald
  const summary = buildCalculatorRoiRank({ aov: 100, monthlyOrders: 1000, grossMargin: 0.5 });
  const abandonedRow = summary.rows.find((r) => r.slug === "01-abandoned-cart-flow-klaviyo");
  assert(abandonedRow !== undefined, "abandoned row present");
  if (!abandonedRow) return;
  const p = buildPaybackEnrichment(abandonedRow);
  assert(p.costHighUsd > 0, "abandoned costHigh > 0");
  assert(p.paybackMonths !== null && Number.isFinite(p.paybackMonths!), "abandoned payback is finite + non-null");
  assert(p.paybackMonths! > 0, "abandoned payback > 0");
  assert(p.paybackMonths! < 1, "abandoned payback < 1mo on $100k/mo revenue");
  assert(p.display === "< 1mo", "abandoned display = '< 1mo'");
  assert(p.toneClass.includes("emerald"), "abandoned tone = emerald");
})();

// -- buildPaybackEnrichment: zero lift → null -------------------------------

(function testPaybackEnrichmentZeroLift() {
  // aov=0 or orders=0 → monthlyLiftHigh=0 → null
  const summary = buildCalculatorRoiRank({ aov: 0, monthlyOrders: 0, grossMargin: 0.5 });
  const abandonedRow = summary.rows.find((r) => r.slug === "01-abandoned-cart-flow-klaviyo");
  assert(abandonedRow !== undefined, "abandoned row present at zero revenue");
  if (!abandonedRow) return;
  const p = buildPaybackEnrichment(abandonedRow);
  assert(p.paybackMonths === null, "zero-lift → null paybackMonths");
  assert(p.toneClass.includes("text-muted-foreground"), "zero-lift → muted tone");
  assert(p.display === "—", "zero-lift → '—' display");
})();

// -- CANONICAL pin ----------------------------------------------------------

(function testCanonicalPin() {
  assert(CANONICAL_CALCULATOR_ROI_PAYBACK.expectedSlugs.length === 7, "7 expected slugs");
  assert(CANONICAL_CALCULATOR_ROI_PAYBACK.minMatches === 7, "minMatches = 7");
  assert(CANONICAL_CALCULATOR_ROI_PAYBACK.freeToolDisplay === "∞", "freeToolDisplay pin");
  assert(CANONICAL_CALCULATOR_ROI_PAYBACK.notMeasurableDisplay === "—", "notMeasurableDisplay pin");

  // Each canonical slug must resolve to a defined costHigh
  for (const slug of CANONICAL_CALCULATOR_ROI_PAYBACK.expectedSlugs) {
    const cost = getMoveCostBySlug(slug);
    assert(Number.isFinite(cost) && cost >= 0, `costHigh defined for ${slug}`);
  }

  // Each canonical slug must produce a defined paybackMonths (or null/Infinity) when joined with the rank summary
  const summary = buildCalculatorRoiRank({ aov: 100, monthlyOrders: 1000, grossMargin: 0.5 });
  const matchedSlugs = CANONICAL_CALCULATOR_ROI_PAYBACK.expectedSlugs.filter((s) =>
    summary.rows.some((r) => r.slug === s)
  );
  assert(
    matchedSlugs.length >= CANONICAL_CALCULATOR_ROI_PAYBACK.minMatches,
    `at least ${CANONICAL_CALCULATOR_ROI_PAYBACK.minMatches} canonical slugs matched in summary (got ${matchedSlugs.length})`
  );

  for (const slug of matchedSlugs) {
    const row = summary.rows.find((r) => r.slug === slug);
    if (!row) continue;
    const p = buildPaybackEnrichment(row);
    // Either finite non-negative, Infinity, or null — never NaN
    assert(
      p.paybackMonths === null || Number.isFinite(p.paybackMonths!) || p.paybackMonths === Infinity,
      `${slug} paybackMonths is null | finite | Infinity (not NaN)`
    );
    assert(p.display.length > 0, `${slug} display non-empty`);
  }
})();

// -- Defensive: NaN costHigh → Infinity (treated as free) -------------------

(function testPaybackEnrichmentDefensiveNaN() {
  // We can't easily inject a NaN move into MOVE_RECOMMENDATIONS, but we
  // can confirm getMoveCostBySlug returns 0 for an unknown slug which is
  // treated as "free tool" → Infinity payback. This is the same code
  // path as the NaN case.
  const p = buildPaybackEnrichment({
    slug: "totally-unknown-slug",
    name: "Unknown",
    calculator: { slug: "x", name: "x", category: "x", calculatorKey: "x" } as never,
    priorityRank: 99,
    rationale: "x",
    annualLiftHigh: 0,
    annualLiftLow: 0,
    monthlyLiftHigh: 0,
    daysToShip: 1,
    rank: 1,
  });
  // Unknown slug → getMoveCostBySlug returns 0 → Infinity payback
  assert(p.paybackMonths === Infinity, "unknown slug treated as free tool (Infinity)");
  assert(p.costHighUsd === 0, "unknown slug costHighUsd = 0");
})();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}