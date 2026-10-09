/**
 * `calculator-roi-sort.ts` — Move #N.23.5 payback-aware sort toggle.
 *
 * Closes the canonical "calculator ROI rank sorts by $ only" gap.
 *
 * The Calculator ROI rank card (Move #N.23 + N.23.1 cohort split + N.23.4
 * payback chip) already surfaces:
 *
 *   - projected annual lift (high band) on the operator's numbers
 *   - low-band lift
 *   - days-to-ship badge
 *   - payback chip (costHigh ÷ monthlyLiftHigh)
 *
 * But the rows are ALWAYS sorted by `annualLiftHigh DESC` — the
 * operator's "highest $ first" lens. Operators frequently ask the
 * practical follow-up: "which calculator has the FASTEST payback at
 * MY scale?". A move with $50k/yr projected lift but a $5k/mo tool
 * cost ($60k/yr) pays back in 12 months at a low-revenue store — a
 * worse near-term bet than a $30k/yr lift on a free tool that pays
 * back immediately, even though the $30k row ranks lower.
 *
 * This module adds a sort-toggle:
 *
 *   - `CalculatorRoiSortMode = "lift" | "payback"`
 *   - `loadCalculatorRoiSort()` / `saveCalculatorRoiSort()`: localStorage
 *     round-trip with the canonical `ecom-ops:calculator-roi-sort:v1` key
 *     and same-tab `ecom-ops:calculator-roi-sort:update` event
 *   - `sortCalculatorRoiRankRows(rows, mode)`: returns a NEW array
 *     sorted by either `annualLiftHigh DESC` ("lift", canonical) or
 *     `paybackMonths ASC` ("payback", fast-ROI first)
 *
 * The payback mode puts rows where `paybackMonths` is lowest first
 * (Infinity sorts to the TOP — free tools are the fastest possible
 * payback). Null `paybackMonths` (not measurable — zero lift) sorts to
 * the bottom. The lift mode is unchanged from the prior canonical
 * behavior so existing tests stay green.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component). Hydration-safe: `loadCalculatorRoiSort()` returns
 * `"lift"` on the server, so the SSR markup mirrors the default-priority
 * state and the client re-sorts on mount.
 */

import type { CalculatorRoiRankRow } from "./calculator-roi-rank";
import {
  buildPaybackEnrichment,
} from "./calculator-roi-payback";

// -- Public types -----------------------------------------------------------

/** Sort options presented to the operator on the Calculator ROI rank card.
 *  - `"lift"`     — canonical, sort by `annualLiftHigh DESC` (default).
 *  - `"payback"`  — fast-ROI lens, sort by `paybackMonths ASC` (Infinity top).
 */
export type CalculatorRoiSortMode = "lift" | "payback";

/** LocalStorage key + same-tab update event for the sort preference.
 *  Bump suffix when the schema changes incompatibly. */
export const CALCULATOR_ROI_SORT_STORAGE_KEY = "ecom-ops:calculator-roi-sort:v1";
export const CALCULATOR_ROI_SORT_UPDATE_EVENT = "ecom-ops:calculator-roi-sort:update";

/** Canonical sort options presented to the operator (length must stay >= 2). */
export const CALCULATOR_ROI_SORT_OPTIONS: CalculatorRoiSortMode[] = ["lift", "payback"];

export function isCalculatorRoiSortMode(v: unknown): v is CalculatorRoiSortMode {
  return v === "lift" || v === "payback";
}

export function loadCalculatorRoiSort(): CalculatorRoiSortMode {
  if (typeof window === "undefined") return "lift";
  try {
    const raw = window.localStorage.getItem(CALCULATOR_ROI_SORT_STORAGE_KEY);
    if (!raw) return "lift";
    const parsed = JSON.parse(raw);
    return isCalculatorRoiSortMode(parsed) ? parsed : "lift";
  } catch {
    return "lift";
  }
}

export function saveCalculatorRoiSort(mode: CalculatorRoiSortMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CALCULATOR_ROI_SORT_STORAGE_KEY,
      JSON.stringify(mode),
    );
    window.dispatchEvent(
      new CustomEvent(CALCULATOR_ROI_SORT_UPDATE_EVENT, { detail: mode }),
    );
  } catch {
    /* quota / private-mode */
  }
}

// -- Sort helper ------------------------------------------------------------

/**
 * Return a NEW array of `CalculatorRoiRankRow` sorted by `mode`.
 *
 * Behaviour:
 *  - **"lift"** — sort by `annualLiftHigh DESC, priorityRank ASC, name ASC`.
 *    Identical to the prior canonical sort in `buildCalculatorRoiRank`.
 *  - **"payback"** — sort by `paybackMonths ASC, annualLiftHigh DESC`.
 *    `paybackMonths === Infinity` (free tool) sorts FIRST (fastest
 *    possible payback). `paybackMonths === null` (not measurable —
 *    zero lift) sorts LAST. Within the same payback bucket the
 *    canonical `annualLiftHigh DESC` tiebreaker preserves the
 *    operator's "highest $ wins on ties" mental model.
 *
 * The function does NOT mutate the input array. The input `rows` are
 * already in their canonical-shape from `buildCalculatorRoiRank`, so
 * we look up `costHigh` per row via `buildPaybackEnrichment` to compute
 * the paybackMonths value used for sorting.
 *
 * Defensive:
 *  - Empty `rows` → empty array (no throw).
 *  - `mode` that is not in `CALCULATOR_ROI_SORT_OPTIONS` → falls back
 *    to "lift" (canonical default).
 */
export function sortCalculatorRoiRankRows(
  rows: CalculatorRoiRankRow[],
  mode: CalculatorRoiSortMode,
): CalculatorRoiRankRow[] {
  const safeMode: CalculatorRoiSortMode = isCalculatorRoiSortMode(mode)
    ? mode
    : "lift";
  const copy = [...rows];

  if (safeMode === "payback") {
    // Compute payback once per row to avoid recomputing inside the comparator.
    const paybackBySlug = new Map<string, number | null>();
    for (const row of copy) {
      paybackBySlug.set(row.slug, buildPaybackEnrichment(row).paybackMonths);
    }

    copy.sort((a, b) => {
      const apRaw = paybackBySlug.get(a.slug);
      const bpRaw = paybackBySlug.get(b.slug);
      // Map.get returns `T | undefined`; the only undefined path is a
      // slug we just iterated into the map — but TS doesn't know that,
      // so narrow defensively to keep the comparator branches typed.
      const ap: number | null = apRaw === undefined ? null : apRaw;
      const bp: number | null = bpRaw === undefined ? null : bpRaw;

      // Null (not measurable) goes LAST.
      if (ap === null && bp === null) return tiebreaker(a, b);
      if (ap === null) return 1;
      if (bp === null) return -1;

      // Infinity (free tool) goes FIRST. Two Infinities tie on payback —
      // fall through to the lift tiebreaker.
      if (!Number.isFinite(ap) && !Number.isFinite(bp)) return tiebreaker(a, b);
      if (!Number.isFinite(ap)) return -1;
      if (!Number.isFinite(bp)) return 1;

      // Normal: ascending payback (lower months = faster ROI = better).
      if (ap !== bp) return ap - bp;
      return tiebreaker(a, b);
    });
    return copy;
  }

  // "lift" — canonical annualLiftHigh DESC.
  copy.sort(tiebreaker);
  return copy;
}

/**
 * Canonical tiebreaker shared by both sort modes. When two rows tie on
 * the primary sort key, the canonical priorityRank (lower = higher
 * priority) wins, then name (alpha) wins.
 */
function tiebreaker(
  a: CalculatorRoiRankRow,
  b: CalculatorRoiRankRow,
): number {
  if (b.annualLiftHigh !== a.annualLiftHigh) return b.annualLiftHigh - a.annualLiftHigh;
  if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
  return a.name.localeCompare(b.name);
}

/**
 * Short label for the toggle button — "By $", "By payback".
 * Pure formatter so the component can render it directly.
 */
export function calculatorRoiSortLabel(mode: CalculatorRoiSortMode): string {
  if (mode === "payback") return "By payback";
  return "By $";
}

/**
 * Stable invariant — keeps the sort modes from quietly shrinking below
 * the canonical 2-option toggle (lift + payback). Future ticks that add
 * a third sort mode (e.g. "by SROI $/day") must update this pin AND the
 * matching test in `calculator-roi-sort.test.ts`.
 */
export const CANONICAL_CALCULATOR_ROI_SORT = {
  /** Canonical sort modes presented to the operator. */
  modes: ["lift", "payback"] as const,
  /** Minimum number of sort modes the toggle must keep. */
  minModes: 2,
  /** Default mode when localStorage is empty / invalid. */
  defaultMode: "lift" as CalculatorRoiSortMode,
  /** Stable localStorage key. */
  storageKey: "ecom-ops:calculator-roi-sort:v1",
} as const;