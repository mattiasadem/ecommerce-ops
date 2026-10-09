/**
 * `calculator-roi-spotlight.ts` — Move #N.24 calculator ROI spotlight.
 *
 * Closes the canonical "the calculator ROI rank card only lives on /"
 * gap. Move #N.23 / N.23.1 / N.23.4 / N.23.5 answered the operator's
 * "open WHICH calculator first on my numbers?" question on the Overview
 * (`/`) page. But the operator browsing the `/playbooks` catalog (the
 * 30-tool list with search + freshness + shipped toggles) had no in-
 * context reminder of which Top-10 calculator-backed moves are
 * projected highest on THEIR numbers — they had to bounce to `/` to
 * see it, then back to `/playbooks` to open the calculator.
 *
 * This module produces a **compact top-3 spotlight** for the catalog:
 *
 *   - Joins `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` ×
 *     `YourStoreInputs` — same triple as `calculator-roi-rank.ts`.
 *   - For each of the top-N rows, attaches the `payback` enrichment
 *     (Move #N.23.4 — `costHigh / monthlyLiftHigh` + tone class).
 *   - For each row, attaches the `cohort` marker (Move #N.23.1 — shipped
 *     vs unshipped relative to `ecom-ops:shipped-playbooks:v1`).
 *   - Provides a `spotlightHeadline` / `spotlightToneClass` /
 *     `spotlightSubline` trio so the catalog can render a single-line
 *     answer + per-row mini-card with the same `$X/yr` + `⏱ Xmo`
 *     + cohort badge language the `/` card uses.
 *
 * The spotlight is intentionally smaller than the `/` card:
 *
 *   - `maxRows = 3` (catalog-level scan, not the full top-5)
 *   - no per-row Open ↗ link list (the catalog already has full links)
 *   - no sort toggle (the operator is browsing, not picking)
 *   - shows only the on-the-table cohort + a one-line "you've shipped
 *     K of M — $X captured" subline so the operator sees the captured
 *     figure without scrolling
 *
 * Pure-logic. No DOM, no localStorage side effects. The component layer
 * in `calculator-roi-spotlight.tsx` is responsible for storage listeners
 * and hydration-safe stubs.
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import type { CalculatorRoiRankRow } from "./calculator-roi-rank";
import { buildCalculatorRoiRank } from "./calculator-roi-rank";
import type { CalculatorRoiCohort } from "./calculator-roi-cohort";
import { buildCalculatorRoiCohort } from "./calculator-roi-cohort";
import type { CalculatorRoiPayback } from "./calculator-roi-payback";
import { buildPaybackEnrichment } from "./calculator-roi-payback";

// -- Public types -----------------------------------------------------------

/**
 * One row in the catalog spotlight — a `CalculatorRoiRankRow` enriched
 * with the payback chip (Move #N.23.4) + cohort marker (Move #N.23.1).
 */
export interface CalculatorRoiSpotlightRow {
  row: CalculatorRoiRankRow;
  payback: CalculatorRoiPayback;
  /** Whether the operator has shipped this playbook (`ecom-ops:shipped-playbooks:v1`). */
  shipped: boolean;
}

/**
 * The full spotlight summary returned by `buildCalculatorRoiSpotlight`.
 *
 * Mirrors `CalculatorRoiRankSummary` + `CalculatorRoiCohort` so the
 * component can render the same `+ $X/yr` + cohort split language
 * the `/` card already uses, just in a compact 3-row strip.
 */
export interface CalculatorRoiSpotlightSummary {
  /** Top-N rows (by `annualLiftHigh` DESC, default N = 3). */
  rows: CalculatorRoiSpotlightRow[];
  /** Cohort split (shipped vs on-the-table) for the full rank, not just the top-N. */
  cohort: CalculatorRoiCohort;
  /** Aggregate summary from `buildCalculatorRoiRank` (re-exposed for headline/tone). */
  summary: ReturnType<typeof buildCalculatorRoiRank>;
  /** How many of the top-N rows were shipped. */
  topShippedCount: number;
  /** How many of the top-N rows were unshipped. */
  topUnshippedCount: number;
}

// -- Public API -----------------------------------------------------------

/**
 * Build the catalog-level calculator ROI spotlight.
 *
 * @param store  The operator's `YourStoreInputs` (or null → defaults).
 * @param shipped The operator's `ShippedMap` (or empty → no shipped yet).
 * @param maxRows How many top rows to surface. Default 3.
 */
export function buildCalculatorRoiSpotlight(
  store: YourStoreInputs | null,
  shipped: Record<string, boolean> | null,
  maxRows: number = 3,
): CalculatorRoiSpotlightSummary {
  const usingDefaults = store === null;
  const summary = buildCalculatorRoiRank(store ?? YOUR_STORE_DEFAULTS);
  // Override the summary's usingDefaults with our detection so the
  // tone class reflects what the operator passed (null = on defaults).
  const effectiveSummary: ReturnType<typeof buildCalculatorRoiRank> = {
    ...summary,
    usingDefaults,
  };
  // The cohort function expects `ShippedMap` (Record<string, ShippedEntry>);
  // we already coerced to a flat boolean map at the call site. Use a
  // duck-typed adapter via the boolean truthiness the cohort checks
  // (`if (shipped[row.slug])`).
  const cohort = buildCalculatorRoiCohort(
    summary,
    shipped as unknown as Parameters<typeof buildCalculatorRoiCohort>[1],
    maxRows,
  );

  // Take the top-N by `annualLiftHigh DESC` from the FULL summary
  // (not the cohort's per-list caps — we want the spotlight to be
  // honest: "the top-3 calculator-backed Top-10 moves projected on
  // your numbers, with shipped markers from the operator's map").
  const safeMax = Math.max(1, Math.min(maxRows, summary.rows.length));
  const topRows = summary.rows.slice(0, safeMax);

  const rows: CalculatorRoiSpotlightRow[] = topRows.map((r) => ({
    row: r,
    payback: buildPaybackEnrichment(r),
    shipped: !!(shipped ?? {})[r.slug],
  }));

  const topShippedCount = rows.filter((r) => r.shipped).length;
  const topUnshippedCount = rows.length - topShippedCount;

  return {
    rows,
    cohort,
    summary: effectiveSummary,
    topShippedCount,
    topUnshippedCount,
  };
}

/**
 * One-line headline for the catalog spotlight. Mirrors the language of
 * `calculatorRoiRankHeadline` but framed for catalog browsing:
 *
 *   - 0 matches → null (the component renders nothing)
 *   - 0 shipped + N unshipped → "Top N calculators for your numbers — top one projects $X/yr"
 *   - K shipped + N unshipped → "K of top-N shipped — N still on the table — next $X/yr"
 *   - all shipped → "All top-N shipped — $X/yr captured, next: $Y/yr"
 */
export function spotlightHeadline(s: CalculatorRoiSpotlightSummary): string | null {
  if (s.summary.matchingMoves === 0) return null;
  if (s.rows.length === 0) return null;

  const top = s.rows[0]?.row;
  if (!top) return null;

  const topFmt = formatSpotlightUsd(top.annualLiftHigh);
  const nextFmt = formatSpotlightUsd(top.annualLiftHigh); // same as top when all-shipped falls through

  if (s.topShippedCount === 0) {
    return `${s.rows.length} calculator-backed moves — top projects $${topFmt}/yr on your numbers`;
  }
  if (s.topUnshippedCount === 0) {
    return `All top ${s.rows.length} shipped — captured $${formatSpotlightUsd(
      s.rows.reduce((sum, r) => sum + r.row.annualLiftHigh, 0),
    )}/yr`;
  }
  return `${s.topShippedCount} of top-${s.rows.length} shipped · ${s.topUnshippedCount} on the table — next $${topFmt}/yr`;
}

/**
 * Tone class for the catalog spotlight card. Mirrors
 * `calculatorRoiRankToneClass` (emerald on numbers / amber on defaults).
 */
export function spotlightToneClass(s: CalculatorRoiSpotlightSummary): string {
  if (s.summary.usingDefaults) {
    return "border-amber-500/40 bg-amber-500/5";
  }
  return "border-emerald-500/40 bg-emerald-500/5";
}

/**
 * Subline for the catalog spotlight card.
 *
 *   - 0 shipped → "On the table — open a calculator to model on your numbers"
 *   - K shipped, K < N → "K captured · M on the table"
 *   - K shipped, K = N → "All top-N shipped — captured $X/yr"
 */
export function spotlightSubline(s: CalculatorRoiSpotlightSummary): string {
  if (s.topShippedCount === 0 && s.topUnshippedCount > 0) {
    return `On the table — open a calculator to model on your numbers`;
  }
  if (s.topUnshippedCount === 0) {
    return `All top ${s.rows.length} shipped — captured $${formatSpotlightUsd(
      s.rows.reduce((sum, r) => sum + r.row.annualLiftHigh, 0),
    )}/yr`;
  }
  return `${s.topShippedCount} captured · ${s.topUnshippedCount} on the table`;
}

/**
 * Compact USD formatter for the catalog spotlight card. Mirrors
 * `formatRoiRankUsd` but always returns just the figure (no `/yr`
 * suffix — the caller adds it).
 */
export function formatSpotlightUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd < 0) return "—";
  if (usd === 0) return "$0";
  if (usd < 1_000) return `$${Math.round(usd)}`;
  if (usd < 1_000_000) {
    const k = usd / 1_000;
    return `$${Math.round(k)}k`;
  }
  const m = usd / 1_000_000;
  return `$${Math.round(m)}M`;
}

/**
 * Canonical pin: the spotlight MUST always produce a top-3 (or fewer)
 * summary, even when the catalog is empty or unshipped. Future ticks
 * that shrink the calculator join below `minMatches` must update this
 * pin AND the matching test.
 */
export const CANONICAL_CALCULATOR_ROI_SPOTLIGHT = {
  defaultMaxRows: 3,
  minMatches: 7,
  /** Spotlight card always renders, even when no rows match (returns null row list). */
  emptyRowsAllowed: true,
} as const;