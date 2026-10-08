/**
 * `calculator-roi-payback.ts` — Move #N.23.4 payback-period enrichment.
 *
 * Closes the canonical "calculator ROI rank shows $ lift but not
 * 'how fast does the operator's tool cost get paid back?'" gap.
 *
 * The Calculator ROI rank card (Move #N.23 + N.23.1 cohort split)
 * already surfaces:
 *
 *   - projected annual lift (high band) on the operator's numbers
 *   - low-band lift (defensive floor)
 *   - days-to-ship badge
 *
 * But operators buying a tool don't just ask "how much do I make?" — they
 * ask "how fast does the tool pay for itself?". A $5k/mo lift with a
 * $120/mo Klaviyo bill pays back in 120 / 5000 = ~0.024 months (~17 hours
 * of revenue). A $50/mo bill on a $1k/mo lift pays back in ~6 months.
 * The payback-period signal is what tells the operator "this move is
 * not just the highest $ — it's also the fastest ROI" vs "this move has
 * the highest $ but the tool takes 8 months to pay back itself".
 *
 * This module adds one enrichment per `CalculatorRoiRankRow`:
 *
 *   - `costHigh` (the move's cost band high) is sourced from
 *     `MOVE_RECOMMENDATIONS` (already exposed on the row via the move
 *     lookup, not currently in the row shape — we look it up here by
 *     slug to avoid coupling the row shape to the move cost fields).
 *   - `paybackMonths = costHigh / (annualLiftHigh / 12)` — months for
 *     the projected annual lift to cover the operator's tool cost.
 *     `Infinity` when cost is zero (free tool, no payback needed),
 *     `null` when not measurable (annual lift is zero / negative).
 *   - `paybackToneClass(usdPerDay)` — emerald < 3 months (fast ROI),
 *     sky < 6 months, amber < 12 months, rose > 12 months (slow).
 *
 * Pure-logic. No DOM, no localStorage. The component layer in
 * `calculator-roi-rank.tsx` reads the move cost via
 * `getMoveCostBySlug(row.slug)` and calls
 * `buildPaybackEnrichment(row, costHigh)` to enrich each row.
 */

import type { CalculatorRoiRankRow } from "./calculator-roi-rank";
import { MOVE_RECOMMENDATIONS } from "./next-move";

/**
 * Per-row payback enrichment returned by `buildPaybackEnrichment`.
 */
export interface CalculatorRoiPayback {
  /** `MOVE_RECOMMENDATIONS[i].costHigh` for the row's slug. */
  costHighUsd: number;
  /**
   * Months for the projected annual lift (high band) to cover the
   * operator's tool cost. `Infinity` when cost is zero (free tool);
   * `null` when annual lift is zero / negative (not measurable).
   */
  paybackMonths: number | null;
  /**
   * Stable color tone class — emerald (< 3 mo), sky (< 6 mo), amber
   * (< 12 mo), rose (> 12 mo). Matches the canonical SROI band
   * convention from `next-move-sroi.ts` for cross-card consistency.
   */
  toneClass: string;
  /** Display string — "< 1mo" for sub-month, "12mo" for >= 12mo, "∞" for free. */
  display: string;
}

/**
 * Lookup `costHigh` for a given row by the move's slug. Defensive — if
 * the slug is not in `MOVE_RECOMMENDATIONS`, returns 0 (free tool).
 */
export function getMoveCostBySlug(slug: string): number {
  const move = MOVE_RECOMMENDATIONS.find((m) => m.id === slug);
  if (!move) return 0;
  return Math.max(0, move.costHigh);
}

/**
 * Format a payback-months figure for display. Caps at "12mo+" for any
 * figure >= 12. Returns "∞" for Infinity (free tool), "—" for null
 * (not measurable), "< 1mo" for sub-month.
 */
export function formatPaybackMonths(months: number | null): string {
  if (months === null) return "—";
  if (!Number.isFinite(months)) return "∞";
  if (months < 1) return "< 1mo";
  if (months >= 12) return "12mo+";
  return `${months.toFixed(months < 10 ? 1 : 0)}mo`;
}

/**
 * Tonal class for the payback chip. Mirrors the SROI band convention
 * (emerald/sky/amber/rose) so the operator's eye reads the two cards
 * with the same mental model:
 *   < 3 months    → emerald (fast payback — high-leverage)
 *   < 6 months    → sky (moderate)
 *   < 12 months   → amber (slow but recoverable)
 *   >= 12 months  → rose (slow — operator should weigh cost vs lift)
 *   Infinity      → emerald (free tool — pay back = immediately)
 *   null / NaN    → muted (not measurable)
 */
export function paybackToneClass(months: number | null): string {
  if (months === null) {
    return "border-border bg-background text-muted-foreground";
  }
  if (!Number.isFinite(months)) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (months < 3) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (months < 6) {
    return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (months < 12) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
}

/**
 * Build the payback enrichment for a single `CalculatorRoiRankRow`.
 *
 * Behaviour:
 *   - Looks up `costHigh` for `row.slug` via `getMoveCostBySlug`.
 *   - Computes `paybackMonths = costHigh / (annualLiftHigh / 12)`.
 *   - `Infinity` when cost is zero, `null` when annual lift is zero /
 *     negative (defensive).
 *   - Returns the empty-string tone class for `paybackMonths === null`
 *     so callers can `data-testid` accordingly.
 */
export function buildPaybackEnrichment(row: CalculatorRoiRankRow): CalculatorRoiPayback {
  const costHighUsd = getMoveCostBySlug(row.slug);
  const monthlyLiftHigh = row.monthlyLiftHigh;

  let paybackMonths: number | null;
  if (costHighUsd <= 0) {
    paybackMonths = Infinity;
  } else if (!Number.isFinite(monthlyLiftHigh) || monthlyLiftHigh <= 0) {
    paybackMonths = null;
  } else {
    paybackMonths = costHighUsd / monthlyLiftHigh;
  }

  return {
    costHighUsd,
    paybackMonths,
    toneClass: paybackToneClass(paybackMonths),
    display: formatPaybackMonths(paybackMonths),
  };
}

/**
 * Canonical pin: the 7 calculator-backed Top-10 slugs MUST each produce
 * a measurable payback enrichment. Future ticks that shrink the
 * calculator join below 7 must update this pin AND the matching test
 * in `calculator-roi-payback.test.ts`. Also pins that paybackMonths is
 * `null` for zero-lift edges and `Infinity` for zero-cost moves.
 */
export const CANONICAL_CALCULATOR_ROI_PAYBACK = {
  expectedSlugs: [
    "01-abandoned-cart-flow-klaviyo",
    "02-post-purchase-upsell-reconvert",
    "03-checkout-audit-baymard",
    "04-welcome-series-klaviyo",
    "06-sms-welcome-and-cart-abandon",
    "07-loyalty-program-smile",
    "10-ai-ad-creative-iteration",
  ] as const,
  /** Future ticks can't quietly drop the join below this. */
  minMatches: 7,
  /** Each canonical slug MUST resolve to a defined costHigh (no NaN). */
  costHighDefined: true,
  /** Display formatters: free tool → "∞", zero-lift → "—". */
  freeToolDisplay: "∞",
  notMeasurableDisplay: "—",
} as const;