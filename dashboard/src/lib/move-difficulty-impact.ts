/**
 * `Move difficulty × impact map` — the 2D bubble chart that
 * complements the existing per-move Top-10 projection on `/top-10`.
 *
 * Cross-page-intelligence + interactive-tool that answers the operator's
 * "which move should I pick given everything that's still on my plate?"
 * question with a single visual:
 *
 *   X axis  = days-to-ship (difficulty / calendar cost)
 *   Y axis  = projected $ lift per month, personalized to Your-store
 *   bubble  = $/month operator cost (high side)
 *   color   = status:
 *               shipped         → green
 *               eligible        → blue  (not shipped, prereqs met)
 *               prereq-blocked  → amber (some upstream move still missing)
 *
 * Below the chart, the helper computes the "blocker chain" — for each
 * unshipped-but-eligible move, how many OTHER remaining moves list it
 * as a prereq. The move with the highest downstream-unlock count is
 * "the move to ship next if you want to unblock the most future
 * progress". This is a different ordering than `pickNextMove` (which
 * picks by priority-rank × ROI); this surfaces the unblock impact
 * explicitly.
 *
 * Pure data — no DOM, no localStorage side effects (those live in
 * the component). Inputs are Your-store + shipped-playbooks + the
 * canonical MOVE_RECOMMENDATIONS list. Outputs are plain objects.
 *
 * Edge cases handled:
 *   - 0 unshipped moves → empty chart + "all shipped" rationale
 *   - all moves prereq-blocked → still render chart with all amber
 *   - Your-store never set → defaults render with chip text
 *   - monthlyRevenue = 0 → y = 0 for every bubble (no NaN, no "Infinity:1")
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import { MOVE_RECOMMENDATIONS, MoveRecommendation } from "./next-move";

export type MoveStatus = "shipped" | "eligible" | "prereq-blocked";

export interface MoveDifficultyImpact {
  /** Move under analysis. */
  move: MoveRecommendation;
  /** Classification for color-coding. */
  status: MoveStatus;
  /** Which prereq is missing, if status === "prereq-blocked". */
  missingPrereqId: string | null;
  /** Days-to-ship (X-axis). */
  daysToShip: number;
  /** Projected $ lift per month at LOW end (Y-axis). */
  liftDollarsLow: number;
  /** Projected $ lift per month at HIGH end (Y-axis). */
  liftDollarsHigh: number;
  /** Operator cost / month at HIGH end (bubble size). */
  costDollars: number;
  /** Lift per day = liftHigh ÷ max(1, daysToShip) — "efficiency" metric. */
  liftPerDay: number;
  /** # of other unshipped moves whose prereqs include THIS move. */
  downstreamUnlocks: number;
  /** Names of moves that this move unblocks (sorted, may be empty). */
  downstreamNames: string[];
}

export interface BlockerChainEntry {
  /** The recommended blocker move (eligible + highest downstreamUnlocks). */
  move: MoveRecommendation;
  /** Number of downstream moves it unblocks. */
  downstreamUnlocks: number;
  /** Names of those moves. */
  downstreamNames: string[];
  /** Why this is the recommendation. */
  rationale: string;
}

export interface MoveDifficultyImpactMap {
  /** Monthly revenue base from Your-store (for context). */
  monthlyRevenue: number;
  /** 10 entries, one per Top-10 move, sorted by priority rank. */
  moves: MoveDifficultyImpact[];
  /** Max $ lift observed (for Y-axis scaling). */
  maxLiftDollars: number;
  /** Max cost observed (for bubble-size scaling). */
  maxCostDollars: number;
  /** Max days-to-ship observed (for X-axis scaling). */
  maxDays: number;
  /** Counts. */
  shippedCount: number;
  eligibleCount: number;
  prereqBlockedCount: number;
  /** The "ship this next to unblock the most" recommendation, or null
   *  if every move is shipped or no eligible moves remain. */
  blockerChain: BlockerChainEntry | null;
  /** True when Your-store came from defaults (operator never set it). */
  usingDefaults: boolean;
}

/**
 * Classify a single move: shipped, eligible (prereqs met), or
 * prereq-blocked (some upstream move still missing).
 */
export function classifyMove(
  move: MoveRecommendation,
  shippedSet: Set<string>
): { status: MoveStatus; missingPrereqId: string | null } {
  if (shippedSet.has(move.id)) {
    return { status: "shipped", missingPrereqId: null };
  }
  for (const prereqId of move.prereqIds) {
    if (!shippedSet.has(prereqId)) {
      return { status: "prereq-blocked", missingPrereqId: prereqId };
    }
  }
  return { status: "eligible", missingPrereqId: null };
}

/**
 * Count how many other UNSHIPPED moves list `targetId` as a prereq.
 * Used for "downstream unblock" computation — a move with 3 downstream
 * unlocks is "more leverage" than a move with 0.
 */
export function countDownstreamUnlocks(
  targetId: string,
  shippedSet: Set<string>
): { count: number; names: string[] } {
  const names: string[] = [];
  for (const m of MOVE_RECOMMENDATIONS) {
    if (shippedSet.has(m.id)) continue; // already shipped, doesn't need unblocking
    if (m.prereqIds.includes(targetId)) {
      names.push(m.name);
    }
  }
  return { count: names.length, names };
}

/**
 * Build the full map from inputs.
 */
export function buildMoveDifficultyImpactMap(
  store: YourStoreInputs | null,
  shipped: Record<string, { shippedAt: string } | unknown>
): MoveDifficultyImpactMap {
  const inputs: YourStoreInputs = store ?? YOUR_STORE_DEFAULTS;
  const monthlyRevenue = inputs.aov * inputs.monthlyOrders;
  const shippedSet = new Set(Object.keys(shipped ?? {}));

  const moves: MoveDifficultyImpact[] = MOVE_RECOMMENDATIONS.map((m) => {
    const { status, missingPrereqId } = classifyMove(m, shippedSet);
    const liftDollarsLow = monthlyRevenue * m.liftLow;
    const liftDollarsHigh = monthlyRevenue * m.liftHigh;
    const costDollars = m.costHigh;
    const liftPerDay = liftDollarsHigh / Math.max(1, m.daysToShip);
    const { count: downstreamUnlocks, names: downstreamNames } =
      countDownstreamUnlocks(m.id, shippedSet);
    return {
      move: m,
      status,
      missingPrereqId,
      daysToShip: m.daysToShip,
      liftDollarsLow,
      liftDollarsHigh,
      costDollars,
      liftPerDay,
      downstreamUnlocks,
      downstreamNames,
    };
  });

  const maxLiftDollars = Math.max(0, ...moves.map((x) => x.liftDollarsHigh));
  const maxCostDollars = Math.max(1, ...moves.map((x) => x.costDollars));
  const maxDays = Math.max(1, ...moves.map((x) => x.daysToShip));
  const shippedCount = moves.filter((x) => x.status === "shipped").length;
  const eligibleCount = moves.filter((x) => x.status === "eligible").length;
  const prereqBlockedCount = moves.filter(
    (x) => x.status === "prereq-blocked"
  ).length;

  // Blocker chain: among ELIGIBLE moves, the one with the most
  // downstream unlocks wins. Ties broken by priorityRank ascending.
  const eligible = moves.filter((x) => x.status === "eligible");
  let blockerChain: BlockerChainEntry | null = null;
  if (eligible.length > 0) {
    const sorted = [...eligible].sort((a, b) => {
      if (b.downstreamUnlocks !== a.downstreamUnlocks) {
        return b.downstreamUnlocks - a.downstreamUnlocks;
      }
      return a.move.priorityRank - b.move.priorityRank;
    });
    const top = sorted[0];
    if (top.downstreamUnlocks > 0) {
      blockerChain = {
        move: top.move,
        downstreamUnlocks: top.downstreamUnlocks,
        downstreamNames: top.downstreamNames,
        rationale:
          `Shipping "${top.move.name}" unblocks ${top.downstreamUnlocks} ` +
          `downstream move${top.downstreamUnlocks === 1 ? "" : "s"}: ` +
          top.downstreamNames.join(", ") +
          `.`,
      };
    }
  }

  return {
    monthlyRevenue,
    moves,
    maxLiftDollars,
    maxCostDollars,
    maxDays,
    shippedCount,
    eligibleCount,
    prereqBlockedCount,
    blockerChain,
    usingDefaults: store === null || store === YOUR_STORE_DEFAULTS,
  };
}

/**
 * Render a paste-ready markdown block summarizing the map. Operator
 * pastes this into Slack / Linear / Notion. Pure function; no DOM.
 */
export function renderDifficultyImpactMarkdown(
  map: MoveDifficultyImpactMap,
  store: YourStoreInputs
): string {
  const lines: string[] = [];
  lines.push(`# Move Difficulty × Impact — ${store.aov ? "$" + store.aov.toFixed(0) + " AOV · " + store.monthlyOrders.toFixed(0) + " orders/mo" : "default store"}`);
  lines.push("");
  lines.push(
    `Monthly revenue base: $${Math.round(map.monthlyRevenue).toLocaleString()} · ` +
      `${map.shippedCount} shipped · ${map.eligibleCount} eligible · ${map.prereqBlockedCount} prereq-blocked`
  );
  lines.push("");
  if (map.blockerChain) {
    lines.push(`## Recommended unblock move`);
    lines.push("");
    lines.push(
      `**${map.blockerChain.move.name}** (Move #${map.blockerChain.move.priorityRank}) — ${map.blockerChain.rationale}`
    );
    lines.push("");
  }
  lines.push(`## All moves`);
  lines.push("");
  lines.push("| # | Move | Status | Days | Lift/mo | Cost/mo | Unlocks |");
  lines.push("|---|------|--------|------|---------|---------|---------|");
  for (const m of map.moves) {
    const status =
      m.status === "shipped"
        ? "✅ shipped"
        : m.status === "eligible"
        ? "🟢 eligible"
        : `🔒 blocked on \`${m.missingPrereqId}\``;
    const lift = `$${Math.round(m.liftDollarsLow).toLocaleString()}-$${Math.round(m.liftDollarsHigh).toLocaleString()}`;
    const cost = `$${m.costDollars.toLocaleString()}`;
    lines.push(
      `| ${m.move.priorityRank} | ${m.move.name} | ${status} | ${m.daysToShip}d | ${lift} | ${cost} | ${m.downstreamUnlocks} |`
    );
  }
  return lines.join("\n");
}
