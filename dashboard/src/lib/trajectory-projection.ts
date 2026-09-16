/**
 * `Trajectory projection` — 12-month revenue trajectory for the operator.
 *
 * Cross-page-intelligence + interactive-tool that answers the operator's
 * "what does my next year look like?" question:
 *
 *   - Month-1 baseline revenue = AOV × monthly orders (from Your-store).
 *   - Each unshipped Top-10 move starts contributing a fraction of its
 *     lift band in the month it ships. Shipping date = month-of-rollout
 *     based on cumulative `daysToShip` of moves already shipped before
 *     it, in priority-rank order.
 *   - Each move contributes (monthlyRevenue × liftFraction) PER MONTH
 *     starting from its ship-month through month 12.
 *   - Already-shipped moves contribute immediately (month-1 onwards).
 *   - Cost is summed cumulatively too — every month from a move's
 *     ship-month to month-12 counts the move's monthly cost.
 *
 * The result is a 12-element month array (low + high) that the UI
 * renders as a horizontal bar chart + headline tiles.
 *
 * Why this differs from `projectTop10Rollout` (which gives ONE Year-1
 * total): `top10-projection` answers "if I ship every move, what's
 * the total annual lift?" This module answers "what does each month
 * look like as I progressively ship moves?" — the operator wants
 * the curve, not just the endpoint.
 *
 * Pure data — no DOM, no localStorage side effects. Inputs are
 * `YourStoreInputs` + `ShippedMap`. Output is a plain object.
 *
 * Edge cases:
 *   - 0 unshipped moves → flat baseline curve; nothing ships over the year
 *   - all moves shipped immediately → full lift band from month-1
 *   - `monthlyRevenue = 0` (aov=0) → empty zeros (guards NaN)
 *   - days-to-ship > 360 → that move's first contribution month is
 *     clamped to month-12 (we still report lift contributed, just
 *     marked as "rolls into month 12+")
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import { MOVE_RECOMMENDATIONS, MoveRecommendation } from "./next-move";

export const TRAJECTORY_HORIZON_MONTHS = 12;

export interface MonthTrajectory {
  /** Month index 1..12 (1 = next month, 12 = month-12). */
  month: number;
  /** Cumulative monthly revenue at LOW end (baseline + lifts so far). */
  revenueLow: number;
  /** Cumulative monthly revenue at HIGH end (baseline + lifts so far). */
  revenueHigh: number;
  /** Cumulative monthly cost at LOW end. */
  costLow: number;
  /** Cumulative monthly cost at HIGH end. */
  costHigh: number;
  /** Names of moves whose lift kicks in THIS month (just shipped). */
  movesShippedThisMonth: string[];
  /** Cumulative # of moves shipped through this month. */
  movesShippedCumulative: number;
}

export interface TrajectoryProjection {
  /** Baseline monthly revenue (no lifts). */
  baselineMonthlyRevenue: number;
  /** Annual baseline revenue (no lifts). */
  baselineAnnualRevenue: number;
  /** 12-element month array, indexed by month-1. */
  months: MonthTrajectory[];
  /** Moves that ship on or before month 12 (the rest roll past the horizon). */
  movesOnHorizon: Array<{
    move: MoveRecommendation;
    /** Month index 1..12 when this move starts contributing lift. */
    shipMonth: number;
    monthlyLiftLow: number;
    monthlyLiftHigh: number;
    monthlyCostLow: number;
    monthlyCostHigh: number;
  }>;
  /** Moves whose cumulative days-to-ship exceeded 360 → first-ship-month clamped to 12. */
  movesBeyondHorizon: MoveRecommendation[];
  /** Total moves shipped at the start of month-1 (from `shippedPlaybooks`). */
  movesAlreadyShipped: number;
  /** Total Top-10 moves considered. */
  totalMoves: number;
  /** Year-1 cumulative revenue at LOW end (sum of month revenues). */
  year1RevenueLow: number;
  /** Year-1 cumulative revenue at HIGH end. */
  year1RevenueHigh: number;
  /** Year-1 cumulative cost at LOW end. */
  year1CostLow: number;
  /** Year-1 cumulative cost at HIGH end. */
  year1CostHigh: number;
  /** Year-1 incremental lift = year1Revenue - baselineAnnualRevenue (low). */
  year1LiftLow: number;
  /** Year-1 incremental lift at HIGH end. */
  year1LiftHigh: number;
  /** Year-1 ROI = year1Lift / year1Cost (using HIGH cost side, conservative). */
  year1RoiLow: number;
  year1RoiHigh: number;
  /** Headline for the panel — "Year-1 lift band" + "month-by-month curve". */
  headline: string;
  /** Pre-formatted copy block — Markdown the operator can paste into a doc. */
  summaryMarkdown: string;
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

/**
 * Compute the 12-month revenue trajectory.
 *
 * Algorithm:
 *   1. Sort unshipped moves by priority rank (1 first).
 *   2. Walk in order, accumulating `daysToShip`. Convert cumulative
 *      days into "first contribution month" (1-indexed): ceil(cumDays/30).
 *      Clamp to TRAJECTORY_HORIZON_MONTHS.
 *   3. For each month m in [1..12]:
 *      - baselineMonthlyRevenue is constant
 *      - add up liftLow / liftHigh for every move whose shipMonth <= m
 *      - add up costLow / costHigh for every move whose shipMonth <= m
 *   4. Tally Year-1 totals by summing monthly revenues + costs.
 */
export function projectTrajectory(
  inputs: YourStoreInputs | null,
  shippedPlaybooks: Record<string, unknown>,
): TrajectoryProjection {
  const store: YourStoreInputs = inputs ?? YOUR_STORE_DEFAULTS;
  const baselineMonthlyRevenue = Math.max(0, store.aov * store.monthlyOrders);
  const baselineAnnualRevenue = baselineMonthlyRevenue * TRAJECTORY_HORIZON_MONTHS;

  const shippedSet = new Set(Object.keys(shippedPlaybooks));

  // 1. Walk unshipped moves in priority order; assign a ship-month to each.
  const queued = MOVE_RECOMMENDATIONS.filter((m) => !shippedSet.has(m.id));
  // Sort by priority rank ascending — same canonical order the rest of the
  // dashboard uses (Top-10 first, ties broken by id for stability).
  queued.sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    return a.id.localeCompare(b.id);
  });

  const movesOnHorizon: TrajectoryProjection["movesOnHorizon"] = [];
  const movesBeyondHorizon: MoveRecommendation[] = [];
  let cumDays = 0;
  for (const m of queued) {
    cumDays += m.daysToShip;
    // Convert cumulative days → month (1-indexed). ceil(days/30).
    // E.g. days=3 → month=1; days=30 → month=1; days=31 → month=2.
    const shipMonthRaw = Math.ceil(cumDays / 30);
    const shipMonth = Math.min(shipMonthRaw, TRAJECTORY_HORIZON_MONTHS);
    const monthlyLiftLow = baselineMonthlyRevenue * m.liftLow;
    const monthlyLiftHigh = baselineMonthlyRevenue * m.liftHigh;
    if (shipMonthRaw > TRAJECTORY_HORIZON_MONTHS) {
      movesBeyondHorizon.push(m);
      // Still record the on-horizon equivalent so the math is consistent
      // (it contributes from month 12 onwards within the horizon).
      movesOnHorizon.push({
        move: m,
        shipMonth,
        monthlyLiftLow,
        monthlyLiftHigh,
        monthlyCostLow: m.costLow,
        monthlyCostHigh: m.costHigh,
      });
    } else {
      movesOnHorizon.push({
        move: m,
        shipMonth,
        monthlyLiftLow,
        monthlyLiftHigh,
        monthlyCostLow: m.costLow,
        monthlyCostHigh: m.costHigh,
      });
    }
  }

  // 2. For each month, sum contributions from moves whose shipMonth <= m.
  const months: MonthTrajectory[] = [];
  for (let m = 1; m <= TRAJECTORY_HORIZON_MONTHS; m++) {
    let liftLow = 0;
    let liftHigh = 0;
    let costLow = 0;
    let costHigh = 0;
    const movesShippedThisMonth: string[] = [];
    let movesShippedCumulative = 0;
    for (const entry of movesOnHorizon) {
      if (entry.shipMonth <= m) {
        liftLow += entry.monthlyLiftLow;
        liftHigh += entry.monthlyLiftHigh;
        costLow += entry.monthlyCostLow;
        costHigh += entry.monthlyCostHigh;
        movesShippedCumulative += 1;
        if (entry.shipMonth === m) {
          movesShippedThisMonth.push(entry.move.name);
        }
      }
    }
    months.push({
      month: m,
      revenueLow: baselineMonthlyRevenue + liftLow,
      revenueHigh: baselineMonthlyRevenue + liftHigh,
      costLow,
      costHigh,
      movesShippedThisMonth,
      movesShippedCumulative,
    });
  }

  // 3. Tally Year-1 totals.
  let year1RevenueLow = 0;
  let year1RevenueHigh = 0;
  let year1CostLow = 0;
  let year1CostHigh = 0;
  for (const mo of months) {
    year1RevenueLow += mo.revenueLow;
    year1RevenueHigh += mo.revenueHigh;
    year1CostLow += mo.costLow;
    year1CostHigh += mo.costHigh;
  }
  const year1LiftLow = Math.max(0, year1RevenueLow - baselineAnnualRevenue);
  const year1LiftHigh = Math.max(0, year1RevenueHigh - baselineAnnualRevenue);
  const year1RoiLow = year1CostHigh > 0 ? year1LiftLow / year1CostHigh : Infinity;
  const year1RoiHigh = year1CostHigh > 0 ? year1LiftHigh / year1CostHigh : Infinity;

  // 4. Headline.
  let headline: string;
  if (movesOnHorizon.length === 0) {
    headline = `Every Top-10 move already shipped. Your 12-month revenue is flat at ${fmtMoney(baselineMonthlyRevenue)}/mo · ${fmtMoney(baselineAnnualRevenue)}/yr (no further lift from this queue).`;
  } else {
    headline = `Phased rollout unlocks ${fmtMoney(year1LiftLow)}–${fmtMoney(year1LiftHigh)} Year-1 lift · ${fmtMoney(baselineMonthlyRevenue)}/mo baseline → peak ${fmtMoney(months[TRAJECTORY_HORIZON_MONTHS - 1].revenueHigh)}/mo by month 12 (${fmtRoi(year1RoiLow)}–${fmtRoi(year1RoiHigh)} Year-1 ROI).`;
  }

  // 5. Summary Markdown.
  const mdLines: string[] = [];
  mdLines.push(`## 12-month revenue trajectory (${store.aov} AOV × ${store.monthlyOrders.toLocaleString("en-US")} orders/mo × ${(store.grossMargin * 100).toFixed(0)}% margin)`);
  mdLines.push("");
  mdLines.push(`- **Baseline monthly revenue:** ${fmtMoney(baselineMonthlyRevenue)}`);
  mdLines.push(`- **Baseline annual revenue:** ${fmtMoney(baselineAnnualRevenue)}`);
  mdLines.push(`- **Moves already shipped:** ${shippedSet.size} / ${MOVE_RECOMMENDATIONS.length}`);
  mdLines.push(`- **Moves on horizon (≤12 mo):** ${movesOnHorizon.length}`);
  if (movesBeyondHorizon.length) {
    mdLines.push(`- **Moves beyond horizon (>12 mo):** ${movesBeyondHorizon.length} — ${movesBeyondHorizon.map((m) => m.name).join(", ")}`);
  }
  mdLines.push(`- **Year-1 incremental lift:** ${fmtMoney(year1LiftLow)} – ${fmtMoney(year1LiftHigh)}`);
  mdLines.push(`- **Year-1 cumulative cost:** ${fmtMoney(year1CostLow)} – ${fmtMoney(year1CostHigh)}`);
  mdLines.push(`- **Year-1 ROI band:** ${fmtRoi(year1RoiLow)} – ${fmtRoi(year1RoiHigh)}`);
  mdLines.push("");
  mdLines.push("### Monthly breakdown");
  mdLines.push("");
  mdLines.push("| Month | Revenue (low–high) | Monthly cost | Moves shipped |");
  mdLines.push("|---|---|---|---|");
  for (const mo of months) {
    const movesShippedCell = mo.movesShippedThisMonth.length > 0
      ? mo.movesShippedThisMonth.join(", ")
      : (mo.movesShippedCumulative > 0 ? `(${mo.movesShippedCumulative} prior)` : "—");
    mdLines.push(
      `| M${mo.month} | ${fmtMoney(mo.revenueLow)}–${fmtMoney(mo.revenueHigh)} | ${fmtMoney(mo.costLow)}–${fmtMoney(mo.costHigh)} | ${movesShippedCell} |`,
    );
  }
  mdLines.push("");
  mdLines.push(
    `_Generated from /trajectory — your-store inputs: AOV ${fmtMoney(store.aov)} × ${store.monthlyOrders.toLocaleString("en-US")} orders/mo × ${(store.grossMargin * 100).toFixed(0)}% margin._`,
  );

  return {
    baselineMonthlyRevenue,
    baselineAnnualRevenue,
    months,
    movesOnHorizon,
    movesBeyondHorizon,
    movesAlreadyShipped: shippedSet.size,
    totalMoves: MOVE_RECOMMENDATIONS.length,
    year1RevenueLow,
    year1RevenueHigh,
    year1CostLow,
    year1CostHigh,
    year1LiftLow,
    year1LiftHigh,
    year1RoiLow,
    year1RoiHigh,
    headline,
    summaryMarkdown: mdLines.join("\n"),
  };
}

export const TRAJECTORY_FORMATTERS = {
  fmtMoney,
  fmtRoi,
};
