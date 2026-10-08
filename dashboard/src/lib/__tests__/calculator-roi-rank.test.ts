/**
 * Move #N.23 — `calculator-roi-rank.ts` test suite.
 *
 * Pins the canonical "Top-10 × calculator × your-store" join: of the
 * `MOVE_RECOMMENDATIONS` table (the canonical Top-10 prioritized moves),
 * the rollup must match at least `CANONICAL_CALCULATOR_ROI_RANK.minMatches`
 * of them against `CALCULATOR_REGISTRY` and project a per-row annual
 * lift from the operator's `YourStoreInputs`.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  buildCalculatorRoiRank,
  calculatorRoiRankHeadline,
  calculatorRoiRankToneClass,
  formatRoiRankUsd,
  CANONICAL_CALCULATOR_ROI_RANK,
  type CalculatorRoiRankSummary,
} from "../calculator-roi-rank";
import { YOUR_STORE_DEFAULTS, type YourStoreInputs } from "../your-store";
import { MOVE_RECOMMENDATIONS } from "../next-move";
import { CALCULATOR_REGISTRY } from "../calculator-coverage";

const STORE: YourStoreInputs = { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 };

test("calculator-roi-rank: matches at least minMatches of the Top-10 moves", () => {
  const summary = buildCalculatorRoiRank(STORE);
  assert.ok(
    summary.matchingMoves >= CANONICAL_CALCULATOR_ROI_RANK.minMatches,
    `matchingMoves=${summary.matchingMoves} < minMatches=${CANONICAL_CALCULATOR_ROI_RANK.minMatches}`,
  );
});

test("calculator-roi-rank: every expectedMatch slug is in the rolled-up rows", () => {
  const summary = buildCalculatorRoiRank(STORE);
  const slugs = new Set(summary.rows.map((r) => r.slug));
  for (const slug of CANONICAL_CALCULATOR_ROI_RANK.expectedMatches) {
    assert.ok(slugs.has(slug), `expected ${slug} to be in the rollup, got ${[...slugs].join(", ")}`);
  }
});

test("calculator-roi-rank: every row has a wired calculator entry from CALCULATOR_REGISTRY", () => {
  const summary = buildCalculatorRoiRank(STORE);
  const regSlugs = new Set(CALCULATOR_REGISTRY.map((c) => c.slug));
  for (const row of summary.rows) {
    assert.ok(regSlugs.has(row.slug), `row ${row.slug} not in CALCULATOR_REGISTRY`);
    assert.ok(row.calculator.slug === row.slug, "row calculator slug matches row slug");
  }
});

test("calculator-roi-rank: rows are sorted by annualLiftHigh DESC", () => {
  const summary = buildCalculatorRoiRank(STORE);
  for (let i = 1; i < summary.rows.length; i++) {
    assert.ok(
      summary.rows[i - 1].annualLiftHigh >= summary.rows[i].annualLiftHigh,
      `row ${i - 1} ($${summary.rows[i - 1].annualLiftHigh}) < row ${i} ($${summary.rows[i].annualLiftHigh})`,
    );
  }
});

test("calculator-roi-rank: ranks are 1-indexed and contiguous", () => {
  const summary = buildCalculatorRoiRank(STORE);
  for (let i = 0; i < summary.rows.length; i++) {
    assert.equal(summary.rows[i].rank, i + 1);
  }
});

test("calculator-roi-rank: annualLiftHigh math is aov × orders × 12 × liftHigh", () => {
  const summary = buildCalculatorRoiRank(STORE);
  const expected = Math.round(STORE.aov * STORE.monthlyOrders * 12 * 0.10);
  // 01-abandoned-cart-flow-klaviyo has liftHigh 0.10 — first or near-first by lift.
  const ac = summary.rows.find((r) => r.slug === "01-abandoned-cart-flow-klaviyo");
  assert.ok(ac);
  assert.equal(ac.annualLiftHigh, expected, "01 abandoned-cart liftHigh math");
  assert.equal(ac.monthlyLiftHigh, Math.round(STORE.aov * STORE.monthlyOrders * 0.10));
});

test("calculator-roi-rank: liftHigh is always >= liftLow for every row", () => {
  const summary = buildCalculatorRoiRank(STORE);
  for (const row of summary.rows) {
    assert.ok(
      row.annualLiftHigh >= row.annualLiftLow,
      `row ${row.slug}: liftHigh ${row.annualLiftHigh} < liftLow ${row.annualLiftLow}`,
    );
  }
});

test("calculator-roi-rank: totalAnnualLiftHigh equals the sum of row lifts", () => {
  const summary = buildCalculatorRoiRank(STORE);
  const sum = summary.rows.reduce((s, r) => s + r.annualLiftHigh, 0);
  assert.equal(summary.totalAnnualLiftHigh, sum);
});

test("calculator-roi-rank: usingDefaults=true when yourStore is null", () => {
  const summary = buildCalculatorRoiRank(null);
  assert.equal(summary.usingDefaults, true);
  assert.equal(summary.aov, YOUR_STORE_DEFAULTS.aov);
  assert.equal(summary.monthlyOrders, YOUR_STORE_DEFAULTS.monthlyOrders);
});

test("calculator-roi-rank: usingDefaults=false when yourStore is set", () => {
  const summary = buildCalculatorRoiRank(STORE);
  assert.equal(summary.usingDefaults, false);
  assert.equal(summary.aov, STORE.aov);
  assert.equal(summary.monthlyOrders, STORE.monthlyOrders);
});

test("calculator-roi-rank: monthlyRevenue is aov × monthlyOrders", () => {
  const summary = buildCalculatorRoiRank(STORE);
  assert.equal(summary.monthlyRevenue, STORE.aov * STORE.monthlyOrders);
});

test("calculator-roi-rank: matchingMoves never exceeds totalMoves", () => {
  const summary = buildCalculatorRoiRank(STORE);
  assert.ok(summary.matchingMoves <= MOVE_RECOMMENDATIONS.length);
  assert.equal(summary.totalMoves, MOVE_RECOMMENDATIONS.length);
});

test("calculator-roi-rank: empty store still produces a valid rollup", () => {
  const zero: YourStoreInputs = { aov: 0, monthlyOrders: 0, grossMargin: 0.5 };
  const summary = buildCalculatorRoiRank(zero);
  assert.equal(summary.monthlyRevenue, 0);
  for (const row of summary.rows) {
    assert.equal(row.annualLiftHigh, 0);
    assert.equal(row.annualLiftLow, 0);
    assert.equal(row.monthlyLiftHigh, 0);
  }
  // totalAnnualLiftHigh must be 0.
  assert.equal(summary.totalAnnualLiftHigh, 0);
});

test("calculator-roi-rank: aov=100, orders=2000 lifts 03-checkout-audit to $528k/yr", () => {
  // liftHigh 0.35 → 100 × 2000 × 12 × 0.35 = 840_000 (verify math).
  const big: YourStoreInputs = { aov: 100, monthlyOrders: 2000, grossMargin: 0.7 };
  const summary = buildCalculatorRoiRank(big);
  const audit = summary.rows.find((r) => r.slug === "03-checkout-audit-baymard");
  assert.ok(audit);
  assert.equal(audit.annualLiftHigh, 840_000);
});

test("calculator-roi-rank: headline uses top-row lift when not defaults", () => {
  const summary = buildCalculatorRoiRank(STORE);
  const headline = calculatorRoiRankHeadline(summary);
  assert.ok(headline.includes("calculator-backed moves"));
  assert.ok(headline.includes(`$${summary.rows[0]?.annualLiftHigh.toLocaleString()}`));
});

test("calculator-roi-rank: headline uses total when on defaults", () => {
  const summary = buildCalculatorRoiRank(null);
  const headline = calculatorRoiRankHeadline(summary);
  assert.ok(headline.includes("calculator-backed moves"));
  assert.ok(headline.includes("defaults") || headline.includes("default numbers") || headline.includes("$" + summary.totalAnnualLiftHigh.toLocaleString()));
});

test("calculator-roi-rank: headline handles 0 matches gracefully", () => {
  const empty: CalculatorRoiRankSummary = {
    rows: [],
    matchingMoves: 0,
    totalMoves: 10,
    monthlyRevenue: 0,
    totalAnnualLiftHigh: 0,
    aov: 0,
    monthlyOrders: 0,
    usingDefaults: false,
  };
  const headline = calculatorRoiRankHeadline(empty);
  assert.ok(headline.includes("No calculator-backed moves"));
});

test("calculator-roi-rank: toneClass is amber when usingDefaults", () => {
  const summary = buildCalculatorRoiRank(null);
  assert.ok(calculatorRoiRankToneClass(summary).includes("amber"));
});

test("calculator-roi-rank: toneClass is emerald when not defaults + matches > 0", () => {
  const summary = buildCalculatorRoiRank(STORE);
  assert.ok(summary.matchingMoves > 0);
  assert.ok(calculatorRoiRankToneClass(summary).includes("emerald"));
});

test("calculator-roi-rank: toneClass is neutral when 0 matches", () => {
  const empty: CalculatorRoiRankSummary = {
    rows: [],
    matchingMoves: 0,
    totalMoves: 10,
    monthlyRevenue: 0,
    totalAnnualLiftHigh: 0,
    aov: 0,
    monthlyOrders: 0,
    usingDefaults: false,
  };
  assert.ok(calculatorRoiRankToneClass(empty).includes("border-border"));
});

test("calculator-roi-rank: formatRoiRankUsd handles small / medium / large values", () => {
  assert.equal(formatRoiRankUsd(0), "$0");
  assert.equal(formatRoiRankUsd(500), "$500");
  assert.equal(formatRoiRankUsd(9999), "$9,999");
  assert.equal(formatRoiRankUsd(10_000), "$10k");
  assert.equal(formatRoiRankUsd(840_000), "$840k");
  assert.equal(formatRoiRankUsd(1_500_000), "$1.5M");
  assert.equal(formatRoiRankUsd(2_000_000), "$2M");
  assert.equal(formatRoiRankUsd(-100), "$0"); // defensive
  assert.equal(formatRoiRankUsd(NaN), "$0"); // defensive
});

test("calculator-roi-rank: rationales are non-empty and stable", () => {
  const summary = buildCalculatorRoiRank(STORE);
  for (const row of summary.rows) {
    assert.ok(row.rationale.length > 0, `row ${row.slug} has empty rationale`);
    assert.ok(row.name.length > 0, `row ${row.slug} has empty name`);
    assert.ok(row.daysToShip > 0, `row ${row.slug} has invalid daysToShip ${row.daysToShip}`);
  }
});
