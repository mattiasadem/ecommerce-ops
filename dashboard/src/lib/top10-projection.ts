/**
 * `Top-10 rollout projection` — what does shipping ALL canonical Top-10 moves
 * unlock for the operator's store over the next 12 months?
 *
 * Cross-page-intelligence + interactive-tool that complements the
 * single-move `pickNextMove` (which projects ONE move at a time). This
 * engine aggregates every Top-10 move's lift band, subtracts already-
 * shipped moves, adds operator cost stacks, and emits a Year-1 picture
 * the operator can act on.
 *
 * Pure data — no DOM, no localStorage. Inputs are `YourStoreInputs` +
 * `ShippedMap` (already-serialized browser objects).
 *
 * Math model:
 *   - Each move's lift is `liftFraction × monthlyRevenue`.
 *   - We sum lifts LOW and HIGH independently (so the answer is a band,
 *     not a fake point estimate).
 *   - Cost is summed HIGH-side (operator realistically budgets the
 *     upper band; surprises are bad).
 *   - ROI band = liftLow..liftHigh ÷ costHigh.
 *   - Shipped moves are EXCLUDED from both lift and cost.
 *   - Days-to-ship is the SUM of remaining move days — gives the
 *     operator a "this is what 90 days of shipping gets you" picture.
 *
 * Edge cases handled:
 *   - 0 unshipped moves → returns empty projection + "all shipped" rationale
 *   - all moves prereq-blocked → still projects lift+cost (operator can see
 *     what unblocking gets them) but emits a "blocked" flag for the UI
 *   - costHigh = 0 (free moves only) → ROI band reported as Infinity, but
 *     formatted as "∞:1" downstream
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import {
  MOVE_RECOMMENDATIONS,
  MoveRecommendation,
} from "./next-move";

export interface Top10Projection {
  monthlyRevenue: number;
  annualRevenue: number;

  /** Number of unshipped moves included in the projection. */
  movesRemaining: number;
  /** Number of moves already shipped (excluded from the math). */
  movesShipped: number;
  /** Number of remaining moves whose prereqs aren't met yet. */
  movesPrereqBlocked: number;

  /** Cumulative $ lift per month across remaining moves (low end). */
  monthlyLiftLow: number;
  /** Cumulative $ lift per month across remaining moves (high end). */
  monthlyLiftHigh: number;
  /** Annualized lift (low..high). */
  annualLiftLow: number;
  annualLiftHigh: number;

  /** Total operator cost / month (high side) across remaining moves. */
  monthlyCostLow: number;
  monthlyCostHigh: number;
  /** Annual cost stack. */
  annualCostLow: number;
  annualCostHigh: number;

  /** ROI band — annual lift ÷ annual cost (low..high). */
  annualRoiLow: number;
  annualRoiHigh: number;

  /** Total calendar days to ship every remaining move (sum of daysToShip). */
  totalDaysToShip: number;

  /** Per-move breakdown, sorted by priority rank. */
  perMove: Array<{
    move: MoveRecommendation;
    monthlyLiftLow: number;
    monthlyLiftHigh: number;
    monthlyCostLow: number;
    monthlyCostHigh: number;
    daysToShip: number;
  }>;

  /** Pre-formatted copy block — Markdown the operator can paste. */
  summaryMarkdown: string;

  /** Human-readable "what this means" line for the card header. */
  headline: string;
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${Math.round(n / 1000).toLocaleString("en-US")}k`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtRoi(n: number): string {
  if (!Number.isFinite(n)) return "∞:1";
  if (n >= 100) return `${Math.round(n)}:1`;
  return `${n.toFixed(1)}:1`;
}

export function projectTop10Rollout(
  inputs: YourStoreInputs | null,
  shippedPlaybooks: Record<string, unknown>,
): Top10Projection {
  const store: YourStoreInputs = inputs ?? YOUR_STORE_DEFAULTS;
  const monthlyRevenue = store.aov * store.monthlyOrders;
  const annualRevenue = monthlyRevenue * 12;

  const shippedSet = new Set(Object.keys(shippedPlaybooks));

  // Filter to remaining (unshipped) moves, partition by prereq-blocked.
  const remaining: Array<MoveRecommendation> = [];
  const prereqBlockedSet = new Set<string>();
  let prereqBlockedCount = 0;
  for (const m of MOVE_RECOMMENDATIONS) {
    if (shippedSet.has(m.id)) continue;
    const missing = m.prereqIds.find((pid) => !shippedSet.has(pid));
    if (missing) {
      prereqBlockedSet.add(m.id);
      prereqBlockedCount += 1;
    }
    remaining.push(m);
  }

  // Sum lift + cost across the remaining moves.
  let monthlyLiftLow = 0;
  let monthlyLiftHigh = 0;
  let monthlyCostLow = 0;
  let monthlyCostHigh = 0;
  let totalDaysToShip = 0;
  const perMove: Top10Projection["perMove"] = [];

  for (const m of remaining) {
    const mLow = monthlyRevenue * m.liftLow;
    const mHigh = monthlyRevenue * m.liftHigh;
    monthlyLiftLow += mLow;
    monthlyLiftHigh += mHigh;
    monthlyCostLow += m.costLow;
    monthlyCostHigh += m.costHigh;
    totalDaysToShip += m.daysToShip;
    perMove.push({
      move: m,
      monthlyLiftLow: mLow,
      monthlyLiftHigh: mHigh,
      monthlyCostLow: m.costLow,
      monthlyCostHigh: m.costHigh,
      daysToShip: m.daysToShip,
    });
  }

  const annualLiftLow = monthlyLiftLow * 12;
  const annualLiftHigh = monthlyLiftHigh * 12;
  const annualCostLow = monthlyCostLow * 12;
  const annualCostHigh = monthlyCostHigh * 12;
  const annualRoiLow = annualCostHigh > 0 ? annualLiftLow / annualCostHigh : Infinity;
  const annualRoiHigh = annualCostHigh > 0 ? annualLiftHigh / annualCostHigh : Infinity;

  // Headline.
  let headline: string;
  if (remaining.length === 0) {
    headline = `All ${MOVE_RECOMMENDATIONS.length} Top-10 moves shipped. You're running a best-in-class stack — re-audit quarterly or branch into Move #11+.`;
  } else if (prereqBlockedCount === remaining.length) {
    headline = `${remaining.length} moves remaining, all blocked by prereqs. Ship the prerequisites first to unlock ${fmtMoney(monthlyLiftHigh)}/mo potential.`;
  } else if (prereqBlockedCount > 0) {
    headline = `${remaining.length} moves remaining (${prereqBlockedCount} blocked). Shipping the eligible ones unlocks ${fmtMoney(monthlyLiftLow)}-${fmtMoney(monthlyLiftHigh)}/mo.`;
  } else {
    headline = `${remaining.length} moves remaining. Shipping all unlocks ${fmtMoney(monthlyLiftLow)}-${fmtMoney(monthlyLiftHigh)}/mo (${fmtMoney(annualLiftLow)}-${fmtMoney(annualLiftHigh)}/yr).`;
  }

  // Summary Markdown.
  const mdLines: string[] = [];
  mdLines.push(`## Top-10 rollout projection (${store.aov} AOV × ${store.monthlyOrders.toLocaleString("en-US")} orders/mo × ${(store.grossMargin * 100).toFixed(0)}% margin)`);
  mdLines.push("");
  mdLines.push(`- **Current monthly revenue:** ${fmtMoney(monthlyRevenue)} (${fmtMoney(annualRevenue)}/yr)`);
  mdLines.push(`- **Moves shipped:** ${shippedSet.size} / ${MOVE_RECOMMENDATIONS.length}`);
  mdLines.push(`- **Moves remaining:** ${remaining.length} (${prereqBlockedCount} blocked by prereqs)`);
  mdLines.push(`- **Projected annual lift:** ${fmtMoney(annualLiftLow)} – ${fmtMoney(annualLiftHigh)}`);
  mdLines.push(`- **Projected annual cost:** ${fmtMoney(annualCostLow)} – ${fmtMoney(annualCostHigh)}`);
  mdLines.push(`- **Year-1 ROI band:** ${fmtRoi(annualRoiLow)} – ${fmtRoi(annualRoiHigh)}`);
  mdLines.push(`- **Total days-to-ship:** ${totalDaysToShip} days (~${Math.ceil(totalDaysToShip / 30)} months)`);
  mdLines.push("");
  mdLines.push("### Per-move breakdown");
  mdLines.push("");
  mdLines.push("| # | Move | Lift / mo | Cost / mo | Days |");
  mdLines.push("|---|------|-----------|-----------|------|");
  for (const pm of perMove) {
    const blockedTag = prereqBlockedSet.has(pm.move.id) ? " 🔒" : "";
    mdLines.push(
      `| ${pm.move.priorityRank} | ${pm.move.name}${blockedTag} | ${fmtMoney(pm.monthlyLiftLow)}-${fmtMoney(pm.monthlyLiftHigh)} | ${fmtMoney(pm.monthlyCostLow)}-${fmtMoney(pm.monthlyCostHigh)} | ${pm.daysToShip}d |`
    );
  }
  mdLines.push("");
  mdLines.push(
    `_Generated from /top-10 — your-store inputs: AOV ${fmtMoney(store.aov)} × ${store.monthlyOrders.toLocaleString("en-US")} orders/mo × ${(store.grossMargin * 100).toFixed(0)}% margin._`
  );

  return {
    monthlyRevenue,
    annualRevenue,
    movesRemaining: remaining.length,
    movesShipped: shippedSet.size,
    movesPrereqBlocked: prereqBlockedCount,
    monthlyLiftLow,
    monthlyLiftHigh,
    annualLiftLow,
    annualLiftHigh,
    monthlyCostLow,
    monthlyCostHigh,
    annualCostLow,
    annualCostHigh,
    annualRoiLow,
    annualRoiHigh,
    totalDaysToShip,
    perMove,
    summaryMarkdown: mdLines.join("\n"),
    headline,
  };
}

export const PROJECTION_FORMATTERS = {
  fmtMoney,
  fmtRoi,
};
