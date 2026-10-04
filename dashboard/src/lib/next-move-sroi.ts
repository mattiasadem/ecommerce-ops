/**
 * `Next-move SROI` — Speed-Return-On-Investment per-move scoring.
 *
 * The `next-move.ts` algorithm ranks by `priorityRank` (canonical Top-10
 * order). But operators frequently ask the practical question: "which
 * move gives me the most $$ per day I have to spend shipping it?" A
 * $5K/mo lift in 30 days ($167/day) is a worse near-term bet than a
 * $3K/mo lift in 3 days ($1K/day) — even if the longer one is "Move #1".
 *
 * This module computes **SROI = projectedLiftMidDollars / daysToShip**
 * (a $/day figure, matching the operator's mental model of "this move
 * pays for itself faster") plus **breakevenDays = costMid / liftMidPerDay**
 * (how many days for the projected lift to pay back the operator's
 * monthly cost — Infinity if cost is zero, "—" if not measurable).
 *
 * SROI is **advisory** — it never replaces the canonical `priorityRank`
 * recommendation. Instead the compare table exposes a sort toggle
 * ("Priority" / "SROI") so the operator can flip the table without
 * touching the algorithmic pick.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component).
 */

import {
  MOVE_RECOMMENDATIONS,
  type MoveRecommendation,
} from "./next-move";
import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";

// -- Public types -----------------------------------------------------------

export type NextMoveSortMode = "priority" | "sroi";

/** LocalStorage key + same-tab update event for the sort preference.
 *  Bump suffix when the schema changes incompatibly. */
export const NEXT_MOVE_SORT_STORAGE_KEY = "ecom-ops:next-move-sort:v1";
export const NEXT_MOVE_SORT_UPDATE_EVENT = "ecom-ops:next-move-sort:update";

/** Canonical sort options presented to the operator. */
export const NEXT_MOVE_SORT_OPTIONS: NextMoveSortMode[] = ["priority", "sroi"];

export function isNextMoveSortMode(v: unknown): v is NextMoveSortMode {
  return v === "priority" || v === "sroi";
}

export function loadNextMoveSort(): NextMoveSortMode {
  if (typeof window === "undefined") return "priority";
  try {
    const raw = window.localStorage.getItem(NEXT_MOVE_SORT_STORAGE_KEY);
    if (!raw) return "priority";
    const parsed = JSON.parse(raw);
    return isNextMoveSortMode(parsed) ? parsed : "priority";
  } catch {
    return "priority";
  }
}

export function saveNextMoveSort(mode: NextMoveSortMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NEXT_MOVE_SORT_STORAGE_KEY, JSON.stringify(mode));
    window.dispatchEvent(
      new CustomEvent(NEXT_MOVE_SORT_UPDATE_EVENT, { detail: mode })
    );
  } catch {
    /* quota / private-mode */
  }
}

// -- Per-move SROI computation ---------------------------------------------

export interface NextMoveSroi {
  moveId: string;
  /** Projected lift / month at low end (USD). */
  liftLowUsd: number;
  /** Projected lift / month at high end (USD). */
  liftHighUsd: number;
  /** Projected lift / month midpoint (USD). */
  liftMidUsd: number;
  /** Operator cost / month midpoint (USD). */
  costMidUsd: number;
  /** Days the operator is expected to spend shipping the move. */
  daysToShip: number;
  /** $/day of projected lift (midpoint). Higher is better. */
  sroiUsdPerDay: number;
  /** Net-first-month $/day after subtracting operator cost. Can be
   *  negative when cost > projected lift. Higher is better. */
  netSroiUsdPerDay: number;
  /** Days for the projected lift (midpoint) to pay back the operator's
   *  monthly cost. Infinity if cost is zero. null if not measurable
   *  (e.g. lift is zero). Lower is better. */
  breakevenDays: number | null;
  /** Per-move SROI rank within the candidate set, 1 = highest $/day. */
  sroiRank: number;
}

/** Compute SROI for a single move against a Your-store monthly revenue
 *  baseline. Pure — no side effects, no clamping (caller decides how
 *  to render the result). */
export function computeNextMoveSroi(
  move: MoveRecommendation,
  monthlyRevenue: number
): NextMoveSroi {
  const liftLowUsd = monthlyRevenue * move.liftLow;
  const liftHighUsd = monthlyRevenue * move.liftHigh;
  const liftMidUsd = (liftLowUsd + liftHighUsd) / 2;
  const costMidUsd = (move.costLow + move.costHigh) / 2;
  const safeDays = Math.max(1, move.daysToShip);

  const sroiUsdPerDay = liftMidUsd / safeDays;
  const netSroiUsdPerDay = (liftMidUsd - costMidUsd) / safeDays;

  let breakevenDays: number | null;
  if (costMidUsd <= 0) {
    breakevenDays = Infinity;
  } else if (liftMidUsd <= 0) {
    breakevenDays = null;
  } else {
    // costMid / (liftMid / days) = costMid * days / liftMid
    breakevenDays = (costMidUsd * safeDays) / liftMidUsd;
  }

  return {
    moveId: move.id,
    liftLowUsd,
    liftHighUsd,
    liftMidUsd,
    costMidUsd,
    daysToShip: move.daysToShip,
    sroiUsdPerDay,
    netSroiUsdPerDay,
    breakevenDays,
    sroiRank: 0, // filled in by computeSroiRanking
  };
}

/** Compute SROI for every move in the canonical Top-10 set, then rank
 *  by `sroiUsdPerDay` desc (ties broken by `priorityRank` asc — the
 *  canonical ordering is the tie-break so the table stays stable). */
export function computeSroiRanking(
  store: YourStoreInputs | null
): NextMoveSroi[] {
  const effective = store ?? YOUR_STORE_DEFAULTS;
  const monthlyRevenue = effective.aov * effective.monthlyOrders;
  const scores = MOVE_RECOMMENDATIONS.map((m) => computeNextMoveSroi(m, monthlyRevenue));
  scores.sort((a, b) => {
    if (b.sroiUsdPerDay !== a.sroiUsdPerDay) {
      return b.sroiUsdPerDay - a.sroiUsdPerDay;
    }
    const aRank = MOVE_RECOMMENDATIONS.find((m) => m.id === a.moveId)?.priorityRank ?? 99;
    const bRank = MOVE_RECOMMENDATIONS.find((m) => m.id === b.moveId)?.priorityRank ?? 99;
    return aRank - bRank;
  });
  return scores.map((s, i) => ({ ...s, sroiRank: i + 1 }));
}

/** Sort an array of candidate moves by the chosen sort mode. Returns a
 *  new array (does not mutate). The "priority" sort is the canonical
 *  priorityRank-asc order; the "sroi" sort is sroiUsdPerDay-desc with
 *  priorityRank as tie-break. */
export function sortCandidatesByMode(
  candidates: MoveRecommendation[],
  sroiByMoveId: Record<string, NextMoveSroi>,
  mode: NextMoveSortMode
): MoveRecommendation[] {
  const next = [...candidates];
  if (mode === "priority") {
    next.sort((a, b) => a.priorityRank - b.priorityRank);
    return next;
  }
  // SROI sort: $/day desc, priorityRank asc as tie-break
  next.sort((a, b) => {
    const aSroi = sroiByMoveId[a.id]?.sroiUsdPerDay ?? 0;
    const bSroi = sroiByMoveId[b.id]?.sroiUsdPerDay ?? 0;
    if (bSroi !== aSroi) return bSroi - aSroi;
    return a.priorityRank - b.priorityRank;
  });
  return next;
}

// -- Display helpers (used by the component for rendering) ----------------

/** Format a $/day figure for display. Caps at $Xk for large numbers,
 *  returns "$0" for zero, returns "—" for non-finite / null. */
export function formatSroiPerDay(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "$0/d";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M/d`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k/d`;
  return `$${Math.round(n).toLocaleString("en-US")}/d`;
}

/** Format a breakeven-days figure. Returns "∞" for Infinity (zero cost),
 *  "—" for null (no measurable lift), "Xd" otherwise. */
export function formatBreakevenDays(d: number | null): string {
  if (d === null) return "—";
  if (!Number.isFinite(d)) return "∞";
  if (d >= 1000) return ">1kd";
  if (d >= 100) return `${Math.round(d)}d`;
  if (d >= 10) return `${d.toFixed(0)}d`;
  return `${d.toFixed(1)}d`;
}

/** Tonal class for a SROI badge — emerald for high, sky for medium,
 *  amber for low, muted for zero. Tuned to the canonical $/day bands:
 *    >= $1k/d → emerald (high-impact)
 *    >= $100/d → sky (moderate)
 *    > 0      → amber (low)
 *    === 0    → muted (none)
 *    < 0      → rose (negative net — cost > lift) */
export function sroiToneClass(usdPerDay: number): string {
  if (!Number.isFinite(usdPerDay)) return "border-border bg-background text-muted-foreground";
  if (usdPerDay >= 1000) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (usdPerDay >= 100) return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  if (usdPerDay > 0) return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (usdPerDay === 0) return "border-border bg-background text-muted-foreground";
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
}

/** Plain-language description of the SROI rank, used for accessibility
 *  labels + copy-as-slack summaries. */
export function describeSroiRank(
  rank: number,
  total: number,
  sroiUsdPerDay: number
): string {
  const fmt = formatSroiPerDay(sroiUsdPerDay);
  if (rank === 1) return `Best SROI: ${fmt} (rank 1 of ${total})`;
  return `SROI rank ${rank} of ${total}: ${fmt}`;
}
