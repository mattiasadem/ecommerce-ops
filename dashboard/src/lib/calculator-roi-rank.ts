/**
 * `calculator-roi-rank.ts` — Move #N.23 cross-page-intelligence library.
 *
 * Surfaces the canonical "which calculator is worth opening first on MY
 * numbers?" rollup: joins the canonical `MOVE_RECOMMENDATIONS` table (Top-10
 * prioritized moves with `liftLow` + `liftHigh` bands) against the
 * `CALCULATOR_REGISTRY` (30 wired calculators) and the operator's
 * `YourStoreInputs` (AOV / monthly orders / gross margin) to compute a
 * projected annual lift per wired-and-recommended playbook.
 *
 * The operator already has:
 *   - Calculator coverage (Move #N.17) — "every playbook is tooled"
 *   - Realized ROI (Move #N.7) — "what I've captured vs what's on the table"
 *   - Next-move (Move #1) — "which Top-10 move should I ship next"
 *
 * But the operator does NOT have a single answer to:
 *
 *   "I have 30 wired calculators + 10 prioritized moves + my AOV/orders/margin.
 *    Open WHICH calculator first to put the most dollars on the board?"
 *
 * This card answers that. It is a pure rollup of the existing data — no
 * calculator-side changes, no new tools, no new localStorage keys. The
 * lift number per row = `yourStore.aov * yourStore.monthlyOrders * 12 *
 * MOVE_RECOMMENDATIONS[i].liftHigh` (high band, optimistic). The operator
 * can see at a glance: "Playbook X is the calculator with the highest
 * projected annual lift on MY numbers — click to open".
 *
 * Closes the canonical "calculator-to-roi gap" between the calculator
 * coverage card (which says "100% tooled") and the next-move card (which
 * ranks by priority, not by your-store-personalized lift).
 *
 * Pure-logic: no React, no DOM, no localStorage. Hydration-safe callers
 * can compute on the server and pass the result into a client component
 * for re-computation on changes to the `ecom-ops:your-store:v1` key.
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import { CALCULATOR_REGISTRY, type CalculatorTypeMeta } from "./calculator-coverage";
import { MOVE_RECOMMENDATIONS, type MoveRecommendation } from "./next-move";

/**
 * One ranked row in the calculator ROI rollup.
 */
export interface CalculatorRoiRankRow {
  /** Playbook file basename without `.md`. */
  slug: string;
  /** Playbook / move display name from `MOVE_RECOMMENDATIONS`. */
  name: string;
  /** Calculator kind present on the playbook detail page. */
  calculator: CalculatorTypeMeta;
  /** Original move priority rank from `MOVE_RECOMMENDATIONS` (1 = highest). */
  priorityRank: number;
  /** One-line "why this move" — straight from `MOVE_RECOMMENDATIONS.rationale`. */
  rationale: string;
  /** Projected annual lift, HIGH band, in USD (rounded to nearest $). */
  annualLiftHigh: number;
  /** Projected annual lift, LOW band, in USD (rounded to nearest $). */
  annualLiftLow: number;
  /** `monthlyRevenue * liftHigh` — the per-month high band, in USD. */
  monthlyLiftHigh: number;
  /** Days-to-ship from the canonical `MOVE_RECOMMENDATIONS` table. */
  daysToShip: number;
  /** 1-indexed rank within the rolled-up list (1 = highest projected lift). */
  rank: number;
}

/**
 * The aggregate summary returned by `buildCalculatorRoiRank`.
 */
export interface CalculatorRoiRankSummary {
  rows: CalculatorRoiRankRow[];
  /** Number of `MOVE_RECOMMENDATIONS` entries that ALSO have a wired calculator. */
  matchingMoves: number;
  /** Total `MOVE_RECOMMENDATIONS` count (the Top-10 prioritized moves). */
  totalMoves: number;
  /** Operator's monthly revenue (USD) used for the lift projection. */
  monthlyRevenue: number;
  /** Sum of `annualLiftHigh` across all `rows`. */
  totalAnnualLiftHigh: number;
  /** Operator's AOV used for the projection. */
  aov: number;
  /** Operator's monthly orders used for the projection. */
  monthlyOrders: number;
  /** Whether the projection was run with defaults or with operator-set inputs. */
  usingDefaults: boolean;
}

const MONTHS_PER_YEAR = 12;

/**
 * Build the canonical calculator-ROI-rank summary for the operator's
 * current `YourStoreInputs` (or defaults when unset).
 *
 * Behaviour:
 *  - Joins `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` by `id` /
 *    `slug` — the canonical playbook file basename. Moves without a wired
 *    calculator are excluded (the operator can't open a calculator that
 *    doesn't exist).
 *  - For each match, projects lift from the operator's `aov ×
 *    monthlyOrders × 12 = monthlyRevenue` against the move's
 *    `liftLow` / `liftHigh` band.
 *  - Sorts rows by `annualLiftHigh DESC, priorityRank ASC, name ASC` so
 *    the operator sees the highest-leverage calculator first.
 *  - `usingDefaults` is true when the operator's `YourStoreInputs` was
 *    not set (so the card copy can flag "showing default numbers" until
 *    the operator opens Overview and configures their store).
 */
export function buildCalculatorRoiRank(
  yourStore: YourStoreInputs | null,
): CalculatorRoiRankSummary {
  const store: YourStoreInputs = yourStore ?? YOUR_STORE_DEFAULTS;
  const usingDefaults = yourStore === null;

  const calculatorBySlug: Record<string, CalculatorTypeMeta> = Object.fromEntries(
    CALCULATOR_REGISTRY.map((c) => [c.slug, c]),
  );

  // Join: keep only moves that have a wired calculator.
  const matches: Array<{ move: MoveRecommendation; calc: CalculatorTypeMeta }> = [];
  for (const move of MOVE_RECOMMENDATIONS) {
    const calc = calculatorBySlug[move.id];
    if (calc) matches.push({ move, calc });
  }

  const monthlyRevenue = Math.max(0, store.aov) * Math.max(0, store.monthlyOrders);
  const annualRevenue = monthlyRevenue * MONTHS_PER_YEAR;

  const rows: CalculatorRoiRankRow[] = matches
    .map(({ move, calc }) => {
      const annualLiftHigh = Math.max(0, Math.round(annualRevenue * move.liftHigh));
      const annualLiftLow = Math.max(0, Math.round(annualRevenue * move.liftLow));
      const monthlyLiftHigh = Math.max(0, Math.round(monthlyRevenue * move.liftHigh));
      return {
        slug: move.id,
        name: move.name,
        calculator: calc,
        priorityRank: move.priorityRank,
        rationale: move.rationale,
        annualLiftHigh,
        annualLiftLow,
        monthlyLiftHigh,
        daysToShip: move.daysToShip,
        rank: 0, // filled in after sort
      };
    })
    .sort((a, b) => {
      if (b.annualLiftHigh !== a.annualLiftHigh) return b.annualLiftHigh - a.annualLiftHigh;
      if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
      return a.name.localeCompare(b.name);
    })
    .map((row, idx) => ({ ...row, rank: idx + 1 }));

  const totalAnnualLiftHigh = rows.reduce((s, r) => s + r.annualLiftHigh, 0);

  return {
    rows,
    matchingMoves: matches.length,
    totalMoves: MOVE_RECOMMENDATIONS.length,
    monthlyRevenue: Math.round(monthlyRevenue),
    totalAnnualLiftHigh,
    aov: store.aov,
    monthlyOrders: store.monthlyOrders,
    usingDefaults,
  };
}

/**
 * Headline copy for the card title-bar. Mirrors the existing
 * `coverageHeadline` / `summaryHeadline` patterns.
 */
export function calculatorRoiRankHeadline(summary: CalculatorRoiRankSummary): string {
  if (summary.matchingMoves === 0) {
    return "No calculator-backed moves in the Top-10 yet";
  }
  if (summary.usingDefaults) {
    return `${summary.matchingMoves} calculator-backed moves — open the highest-leverage one to put $${summary.totalAnnualLiftHigh.toLocaleString()} on the table`;
  }
  return `${summary.matchingMoves} calculator-backed moves — your top one projects $${summary.rows[0]?.annualLiftHigh.toLocaleString() ?? 0}/yr on your numbers`;
}

/**
 * Tone class for the card border + body. Emerald when there's at least
 * one row and the operator's numbers are set; amber when defaults are in
 * use; neutral when 0 matches.
 */
export function calculatorRoiRankToneClass(summary: CalculatorRoiRankSummary): string {
  if (summary.matchingMoves === 0) {
    return "border-border bg-card";
  }
  if (summary.usingDefaults) {
    return "border-amber-500/30 bg-amber-500/5";
  }
  return "border-emerald-500/30 bg-emerald-500/5";
}

/**
 * Format a USD value for display in a tight tile. `$48k` for >= $10k,
 * `$1.2M` for >= $1M, raw for < $10k.
 */
export function formatRoiRankUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

/**
 * Stable invariant — the join MUST cover at least 7 of the Top-10 moves
 * (the canonical 6+ Top-10 moves that are tooled). When a new move is
 * added to `MOVE_RECOMMENDATIONS` without a calculator, the test in
 * `calculator-roi-rank.test.ts` will fail and force the agent to add
 * a calculator before claiming "calculator coverage is full".
 */
export const CANONICAL_CALCULATOR_ROI_RANK = {
  /** The canonical Top-10 × calculator mapping. Acts as the pin. */
  expectedMatches: [
    "01-abandoned-cart-flow-klaviyo",
    "02-post-purchase-upsell-reconvert",
    "03-checkout-audit-baymard",
    "04-welcome-series-klaviyo",
    "06-sms-welcome-and-cart-abandon",
    "07-loyalty-program-smile",
    "10-ai-ad-creative-iteration",
  ] as const,
  /** Minimum number of matches the rollup must keep producing. */
  minMatches: 7,
} as const;
