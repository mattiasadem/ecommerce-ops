/**
 * `calculator-roi-cohort.ts` — Move #N.23.1 cohort split.
 *
 * Splits the `CalculatorRoiRankSummary.rows` (top-N calculator-backed
 * Top-10 moves, projected on the operator's `YourStoreInputs`) into two
 * cohorts based on whether the operator has already marked the underlying
 * playbook as shipped in `ecom-ops:shipped-playbooks:v1`:
 *
 *   1. **Shipped cohort** — the operator has already shipped the playbook
 *      in their store. These rows are surfaced in a "Already shipped"
 *      sub-section so the operator sees both the *captured* lift AND the
 *      move's identity (calculator key, days-to-ship, link back to the
 *      playbook).
 *   2. **On-the-table cohort** — the operator has NOT shipped the
 *      playbook yet. These rows are the actual candidates to open
 *      next; they are the canonical "what should I open first on my
 *      numbers?" answer.
 *
 * The split is purely cross-page-intelligence + state-persistence:
 * - `MOVE_RECOMMENDATIONS` (Move #1) tells us which Top-10 moves exist.
 * - `CALCULATOR_REGISTRY` (Move #N.17) tells us which have a calculator.
 * - `YourStoreInputs` (the canonical "Your-store" card) provides the
 *   revenue math.
 * - `ShippedMap` (the canonical `ecom-ops:shipped-playbooks:v1` key from
 *   the `playbook-shipped-toggle` button on `/playbooks`) tells us which
 *   the operator has personally shipped.
 *
 * With all four signals joined, the operator gets a single answer to
 * "what calculator should I open NEXT, knowing what I've already shipped?"
 * — instead of the previous Move #N.23 answer of "what calculator has the
 * highest projected lift on my numbers, ignoring what I've already done?".
 *
 * Closes the canonical "I have a calculator rank — but I don't know if
 * I've already shipped the #1 row" gap. The shipped sub-section also
 * doubles as a "what I've captured" reminder.
 *
 * Pure data — no DOM, no localStorage. The component layer in
 * `calculator-roi-rank.tsx` reads `ecom-ops:shipped-playbooks:v1` and
 * passes the map in.
 */

import type { CalculatorRoiRankRow, CalculatorRoiRankSummary } from "./calculator-roi-rank";
import type { ShippedMap } from "./shipped-playbooks";

/**
 * The cohort split of the calculator ROI rank top-N rows.
 */
export interface CalculatorRoiCohort {
  /** Top-N rows where the operator has already shipped the underlying playbook. */
  shippedRows: CalculatorRoiRankRow[];
  /** Top-N rows where the operator has NOT yet shipped the underlying playbook. */
  unshippedRows: CalculatorRoiRankRow[];
  /** Slug list mirror of `shippedRows` (for `data-` attributes and tests). */
  shippedSlugs: string[];
  /** Slug list mirror of `unshippedRows`. */
  unshippedSlugs: string[];
  /** `shippedRows.length` cached. */
  shippedCount: number;
  /** `unshippedRows.length` cached. */
  unshippedCount: number;
  /** Sum of `annualLiftHigh` across `shippedRows`. */
  shippedAnnualLiftHigh: number;
  /** Sum of `annualLiftHigh` across `unshippedRows`. */
  unshippedAnnualLiftHigh: number;
}

/**
 * Build the cohort split for a calculator ROI rank summary, given the
 * operator's `ShippedMap`.
 *
 * Behaviour:
 *  - For each row in `summary.rows`, check whether its `slug` is present
 *    in `shipped`. If so, put it in `shippedRows`; otherwise `unshippedRows`.
 *  - Both lists preserve the original rank order from `summary.rows`
 *    (which is sorted by `annualLiftHigh DESC`).
 *  - `maxRows` caps each list independently.
 *  - Slugs present in `shipped` but NOT in `summary.rows` are silently
 *    ignored (defensive — e.g. an operator marks a non-Top-10 playbook
 *    shipped and that slug never appears here).
 *  - Empty `rows` → empty cohorts (no throw).
 */
export function buildCalculatorRoiCohort(
  summary: CalculatorRoiRankSummary,
  shipped: ShippedMap,
  maxRows: number = 5,
): CalculatorRoiCohort {
  const safeMax = Math.max(0, Math.floor(maxRows));
  const shippedRows: CalculatorRoiRankRow[] = [];
  const unshippedRows: CalculatorRoiRankRow[] = [];

  for (const row of summary.rows) {
    if (shipped[row.slug]) {
      if (shippedRows.length < safeMax) shippedRows.push(row);
    } else {
      if (unshippedRows.length < safeMax) unshippedRows.push(row);
    }
  }

  const shippedAnnualLiftHigh = shippedRows.reduce((s, r) => s + r.annualLiftHigh, 0);
  const unshippedAnnualLiftHigh = unshippedRows.reduce((s, r) => s + r.annualLiftHigh, 0);

  return {
    shippedRows,
    unshippedRows,
    shippedSlugs: shippedRows.map((r) => r.slug),
    unshippedSlugs: unshippedRows.map((r) => r.slug),
    shippedCount: shippedRows.length,
    unshippedCount: unshippedRows.length,
    shippedAnnualLiftHigh,
    unshippedAnnualLiftHigh,
  };
}

/**
 * Headline for the cohort sub-section. Mirrors the `calculatorRoiRankHeadline`
 * style but explicitly mentions the shipped cohort so the operator
 * immediately sees both sides.
 */
export function calculatorRoiCohortHeadline(
  cohort: CalculatorRoiCohort,
  topN: number,
): string {
  if (cohort.shippedCount === 0 && cohort.unshippedCount === 0) {
    return "No calculator-backed moves in the Top-10 yet";
  }
  if (cohort.shippedCount === 0) {
    return `${formatCohortCount(cohort.shippedCount, topN)} shipped — all ${cohort.unshippedCount} on the table`;
  }
  if (cohort.unshippedCount === 0) {
    return `${formatCohortCount(cohort.shippedCount, topN)} shipped — top ${topN} fully captured`;
  }
  return `${formatCohortCount(cohort.shippedCount, topN)} shipped — ${cohort.unshippedCount} still on the table`;
}

/**
 * Tone class for the cohort sub-section. Emerald when 0 shipped (pure
 * upside — nothing captured yet, all on the table); sky when at least
 * one shipped (mixed state — operator is making progress); neutral when
 * 0 total rows.
 */
export function calculatorRoiCohortToneClass(cohort: CalculatorRoiCohort): string {
  const totalRows = cohort.shippedCount + cohort.unshippedCount;
  if (totalRows === 0) return "border-border bg-card";
  if (cohort.shippedCount === 0) return "border-emerald-500/30 bg-emerald-500/5";
  return "border-sky-500/30 bg-sky-500/5";
}

/**
 * Stable formatting helper for the "N of M shipped" label.
 * Pure: same inputs always produce the same string.
 */
export function formatCohortCount(shipped: number, total: number): string {
  const s = Math.max(0, Math.floor(shipped));
  const t = Math.max(0, Math.floor(total));
  return `${s} of ${t}`;
}

/**
 * Stable invariant — keeps the cohort split from quietly dropping below
 * the canonical Top-10 × calculator coverage. Future ticks that shrink
 * the calculator join below 7 must update this pin AND the matching
 * test in `calculator-roi-cohort.test.ts`.
 */
export const CANONICAL_CALCULATOR_ROI_COHORT = {
  /** The 7 Top-10 moves that currently have a wired calculator. */
  expectedSlugs: [
    "01-abandoned-cart-flow-klaviyo",
    "02-post-purchase-upsell-reconvert",
    "03-checkout-audit-baymard",
    "04-welcome-series-klaviyo",
    "06-sms-welcome-and-cart-abandon",
    "07-loyalty-program-smile",
    "10-ai-ad-creative-iteration",
  ] as const,
  /** Minimum number of Top-10 × calculator matches the cohort split must keep. */
  minMatches: 7,
  /** When the operator is on their numbers (not defaults), the cohort split
   *  must show at least this fraction of `topN` unshipped rows in its
   *  default-state — guards against future "all shipped" bugs. */
  minCoverageOnNumbers: 0.5,
} as const;
