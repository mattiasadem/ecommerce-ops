/**
 * `Next-move what-if scenario simulator` — Move #N.13.
 *
 * Closes the canonical "I want to plan my next 2 weeks — what if I shipped
 * Move #1 AND Move #3 next week, what does the queue look like after, and
 * what's the cumulative monthly lift?" gap.
 *
 * The existing next-move card has a single algorithmic #1 + a static
 * compare table of the top 3 eligible moves. The what-if simulator lets
 * the operator toggle ANY number of "hypothetical" moves (ones they plan
 * to ship next) and see:
 *   1. The re-ranked post-hypothetical queue (what the algorithm will
 *      recommend AFTER the operator ships their plan)
 *   2. The cumulative monthly lift across all toggled moves (sum of
 *      personalized $ lift per move, additive per pickNextMove's cap)
 *   3. The new algorithmic #1 after the hypothetical ships
 *   4. The SROI delta vs the baseline (no hypotheticals) — so the
 *      operator can see "shipping these 3 moves drops my best $/day
 *      from $1.9k/d to $900/d because the big-SROI ones are already
 *      in the plan"
 *
 * State is operator-owned (localStorage), key `ecom-ops:next-move-what-if:v1`.
 * Schema: `Record<moveId, { addedAt: ISOString }>` — matches the
 * shipped-playbooks shape minus the notes so a single toggle UI can
 * borrow the `toggleShipped` helper.
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component).
 */

import {
  MOVE_RECOMMENDATIONS,
  type MoveRecommendation,
  type NextMoveResult,
  pickNextMove,
} from "./next-move";
import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import {
  computeSroiRanking,
  type NextMoveSroi,
} from "./next-move-sroi";

// -- Storage layer --------------------------------------------------------

export const NEXT_MOVE_WHAT_IF_STORAGE_KEY = "ecom-ops:next-move-what-if:v1";
export const NEXT_MOVE_WHAT_IF_UPDATE_EVENT = "ecom-ops:next-move-what-if:update";

export interface WhatIfEntry {
  addedAt: string; // ISO 8601
}

export type WhatIfMap = Record<string, WhatIfEntry>;

export function loadWhatIf(): WhatIfMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NEXT_MOVE_WHAT_IF_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: WhatIfMap = {};
    for (const [k, v] of Object.entries(parsed as WhatIfMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as WhatIfEntry).addedAt !== "string") continue;
      out[k] = { addedAt: (v as WhatIfEntry).addedAt };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveWhatIf(map: WhatIfMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      NEXT_MOVE_WHAT_IF_STORAGE_KEY,
      JSON.stringify(map)
    );
    window.dispatchEvent(
      new CustomEvent(NEXT_MOVE_WHAT_IF_UPDATE_EVENT, { detail: map })
    );
  } catch {
    /* quota / private-mode */
  }
}

export function clearWhatIf(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NEXT_MOVE_WHAT_IF_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(NEXT_MOVE_WHAT_IF_UPDATE_EVENT, { detail: {} })
    );
  } catch {
    /* ignore */
  }
}

export function toggleWhatIf(map: WhatIfMap, moveId: string): WhatIfMap {
  const next = { ...map };
  if (next[moveId]) {
    delete next[moveId];
  } else {
    next[moveId] = { addedAt: new Date().toISOString() };
  }
  return next;
}

// -- Pure-logic simulator --------------------------------------------------

export interface WhatIfSimulation {
  /** Baseline (no hypotheticals applied). */
  baseline: NextMoveResult;
  /** Post-hypothetical (with hypotheticals merged into shipped). */
  projected: NextMoveResult;
  /** The hypothetical moves the operator added (resolved to canonical moves). */
  hypotheticalMoves: MoveRecommendation[];
  /** The moves that were toggled but aren't in MOVE_RECOMMENDATIONS (retired / typo). */
  unknownMoveIds: string[];
  /** Combined shipped+hypothetical map (used for the projected call). */
  mergedShipped: Record<string, unknown>;
  /** Sum of per-move personalized monthly $ lift (low end, additive cap). */
  cumulativeLiftLowUsd: number;
  /** Sum of per-move personalized monthly $ lift (high end, additive cap). */
  cumulativeLiftHighUsd: number;
  /** Sum of per-move days-to-ship (calendar days if shipped serially). */
  cumulativeDaysToShip: number;
  /** Sum of per-move cost / month midpoint across the hypotheticals. */
  cumulativeCostMidUsd: number;
  /** Baseline best SROI (top of SROI ranking) — for delta calc. */
  baselineBestSroiUsdPerDay: number;
  /** Projected best SROI after hypotheticals ship. */
  projectedBestSroiUsdPerDay: number;
  /** SROI delta: projected - baseline. Negative = hypotheticals consume the high-SROI moves. */
  sroiDeltaUsdPerDay: number;
  /** True if the algorithmic #1 changed as a result of the hypotheticals. */
  topMoveChanged: boolean;
  /** SROI ranking for the baseline (length = MOVE_RECOMMENDATIONS.length). */
  baselineSroiRanking: NextMoveSroi[];
  /** SROI ranking for the projected (post-hypothetical) state. */
  projectedSroiRanking: NextMoveSroi[];
  /** Per-hypothetical SROI snapshot (the moves the operator plans to ship). */
  hypotheticalSroi: Array<{ move: MoveRecommendation; sroi: NextMoveSroi }>;
}

/**
 * Run a what-if simulation. Pure: does not read or write localStorage.
 *
 * @param yourStore     The operator's Your-store inputs (AOV / monthly
 *                      orders / gross margin). null falls back to defaults.
 * @param shipped       The operator's actual shipped-playbooks map.
 * @param whatIf        The operator's hypothetical "plan to ship" map.
 * @param overrideId    Optional override to apply to both baseline + projected.
 */
export function runWhatIf(
  yourStore: YourStoreInputs | null,
  shipped: Record<string, unknown>,
  whatIf: WhatIfMap,
  overrideId?: string | null
): WhatIfSimulation {
  const store: YourStoreInputs = yourStore ?? YOUR_STORE_DEFAULTS;
  const monthlyRevenue = store.aov * store.monthlyOrders;

  // 1. Resolve hypothetical move IDs to canonical moves.
  const knownMoves = new Set(MOVE_RECOMMENDATIONS.map((m) => m.id));
  const hypotheticalMoves: MoveRecommendation[] = [];
  const unknownMoveIds: string[] = [];
  for (const id of Object.keys(whatIf)) {
    const m = MOVE_RECOMMENDATIONS.find((mm) => mm.id === id);
    if (m) hypotheticalMoves.push(m);
    else unknownMoveIds.push(id);
  }
  // Sort hypotheticals by priority rank for the UI.
  hypotheticalMoves.sort((a, b) => a.priorityRank - b.priorityRank);

  // 2. Build merged shipped map (actual + hypotheticals). Hypotheticals
  //    are added under the same shippedEntry shape so pickNextMove treats
  //    them as already shipped.
  const mergedShipped: Record<string, unknown> = { ...shipped };
  for (const m of hypotheticalMoves) {
    if (!mergedShipped[m.id]) {
      mergedShipped[m.id] = { shippedAt: whatIf[m.id].addedAt, notes: "what-if plan" };
    }
  }

  // 3. Run the algorithm twice — baseline and projected.
  const baseline = pickNextMove(store, shipped, overrideId);
  const projected = pickNextMove(store, mergedShipped, overrideId);

  // 4. Cumulative lift across hypotheticals (per-move, additive).
  let cumulativeLiftLowUsd = 0;
  let cumulativeLiftHighUsd = 0;
  let cumulativeDaysToShip = 0;
  let cumulativeCostMidUsd = 0;
  for (const m of hypotheticalMoves) {
    cumulativeLiftLowUsd += monthlyRevenue * m.liftLow;
    cumulativeLiftHighUsd += monthlyRevenue * m.liftHigh;
    cumulativeDaysToShip += m.daysToShip;
    cumulativeCostMidUsd += (m.costLow + m.costHigh) / 2;
  }

  // 5. SROI deltas. baselineBestSroi is the top of the SROI ranking for
  //    the baseline state; projectedBestSroi is the top of the SROI
  //    ranking after hypotheticals ship. If the operator plans to ship
  //    Move #1 (the canonical highest-SROI move), the projected best SROI
  //    drops to Move #2's SROI, which is the load-bearing "your $/day
  //    declines as you consume the high-SROI moves" insight.
  const baselineSroiRanking = computeSroiRanking(store, shipped);
  const projectedSroiRanking = computeSroiRanking(store, mergedShipped);
  const baselineBestSroiUsdPerDay = baselineSroiRanking[0]?.sroiUsdPerDay ?? 0;
  const projectedBestSroiUsdPerDay = projectedSroiRanking[0]?.sroiUsdPerDay ?? 0;
  const sroiDeltaUsdPerDay =
    projectedBestSroiUsdPerDay - baselineBestSroiUsdPerDay;

  // 6. Per-hypothetical SROI snapshot.
  const hypotheticalSroi: Array<{ move: MoveRecommendation; sroi: NextMoveSroi }> = [];
  const baselineSroiByMoveId: Record<string, NextMoveSroi> = {};
  for (const r of baselineSroiRanking) baselineSroiByMoveId[r.moveId] = r;
  for (const m of hypotheticalMoves) {
    const sroi = baselineSroiByMoveId[m.id];
    if (sroi) hypotheticalSroi.push({ move: m, sroi });
  }

  // 7. Top-move-changed detection.
  const topMoveChanged =
    (baseline.move?.id ?? null) !== (projected.move?.id ?? null);

  return {
    baseline,
    projected,
    hypotheticalMoves,
    unknownMoveIds,
    mergedShipped,
    cumulativeLiftLowUsd,
    cumulativeLiftHighUsd,
    cumulativeDaysToShip,
    cumulativeCostMidUsd,
    baselineBestSroiUsdPerDay,
    projectedBestSroiUsdPerDay,
    sroiDeltaUsdPerDay,
    topMoveChanged,
    baselineSroiRanking,
    projectedSroiRanking,
    hypotheticalSroi,
  };
}

// -- Display helpers -------------------------------------------------------

/** Tone class for the SROI delta pill. Positive = better SROI, negative
 *  = the plan consumed the high-SROI moves. */
export function sroiDeltaToneClass(deltaUsdPerDay: number): string {
  if (!Number.isFinite(deltaUsdPerDay) || deltaUsdPerDay === 0) {
    return "border-border bg-background text-muted-foreground";
  }
  if (deltaUsdPerDay > 500) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (deltaUsdPerDay > 0) {
    return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (deltaUsdPerDay > -500) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
}

/** Human-readable description of the SROI delta for the UI. */
export function describeSroiDelta(deltaUsdPerDay: number): string {
  if (!Number.isFinite(deltaUsdPerDay)) return "—";
  if (deltaUsdPerDay === 0) return "Best $/day unchanged";
  const sign = deltaUsdPerDay > 0 ? "+" : "−";
  const abs = Math.abs(deltaUsdPerDay);
  let formatted: string;
  if (abs >= 1_000_000) {
    formatted = `$${(abs / 1_000_000).toFixed(2)}M`;
  } else if (abs >= 10_000) {
    formatted = `$${Math.round(abs / 1000).toLocaleString("en-US")}k`;
  } else if (abs >= 1000) {
    formatted = `$${(abs / 1000).toFixed(1)}k`;
  } else {
    formatted = `$${Math.round(abs).toLocaleString("en-US")}`;
  }
  return `${sign}${formatted}/d`;
}

/** Compact "what-if plan" markdown export for the copy button. */
export function whatIfToMarkdown(sim: WhatIfSimulation): string {
  const lines: string[] = [];
  lines.push("# What-if shipping plan");
  lines.push("");
  if (sim.hypotheticalMoves.length === 0) {
    lines.push("_No moves added to the plan yet — toggle moves below to see the projected queue, cumulative lift, and SROI delta._");
  } else {
    lines.push("## Plan");
    for (const m of sim.hypotheticalMoves) {
      const sroi = sim.hypotheticalSroi.find((h) => h.move.id === m.id)?.sroi;
      const sroiTxt = sroi
        ? ` · SROI $${Math.round(sroi.sroiUsdPerDay).toLocaleString("en-US")}/d`
        : "";
      lines.push(
        `- Move #${m.priorityRank} — ${m.name} (${m.daysToShip}d, $${m.costLow}–$${m.costHigh}/mo)${sroiTxt}`
      );
    }
    lines.push("");
    lines.push("## Cumulative impact");
    lines.push(
      `- Total monthly lift: $${Math.round(sim.cumulativeLiftLowUsd).toLocaleString("en-US")}–$${Math.round(sim.cumulativeLiftHighUsd).toLocaleString("en-US")}`
    );
    lines.push(
      `- Total calendar days (serial): ${sim.cumulativeDaysToShip}`
    );
    lines.push(
      `- Total cost / month: $${Math.round(sim.cumulativeCostMidUsd).toLocaleString("en-US")}`
    );
    lines.push(
      `- SROI delta: ${describeSroiDelta(sim.sroiDeltaUsdPerDay)}`
    );
    lines.push("");
    if (sim.topMoveChanged && sim.projected.move) {
      lines.push(
        `**After this plan, the algorithm will recommend Move #${sim.projected.move.priorityRank} — ${sim.projected.move.name}.**`
      );
    } else if (sim.projected.move) {
      lines.push(
        `**Top pick stays the same after this plan: Move #${sim.projected.move.priorityRank} — ${sim.projected.move.name}.**`
      );
    } else {
      lines.push(
        `**All Top-10 moves are in this plan.**`
      );
    }
  }
  lines.push("");
  lines.push(`_Generated ${new Date().toISOString()} from ecommerce-ops-dashboard / overview._`);
  return lines.join("\n");
}
