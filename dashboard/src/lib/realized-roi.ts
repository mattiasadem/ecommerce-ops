/**
 * `Realized ROI` — how much annual lift the operator has already captured
 * from shipped playbooks vs how much potential lift remains on the table.
 *
 * Cross-page-intelligence that fuses three canonical inputs:
 *
 *   1. Your-store inputs (`ecom-ops:your-store:v1`) — AOV, monthly orders,
 *      gross margin. The same shared key every other calculator reads.
 *
 *   2. Shipped-playbooks map (`ecom-ops:shipped-playbooks:v1`) — the
 *      operator-owned progress tracker the cron-health-card already reads.
 *
 *   3. The canonical `MOVE_RECOMMENDATIONS` table — same source the
 *      `next-move` recommender and `top-10-projection` rollup both read.
 *
 * The engine partitions `MOVE_RECOMMENDATIONS` into three buckets:
 *
 *   - **shipped** — operator has ticked this playbook as shipped.
 *   - **unshipped + ready** — playbook not shipped AND no unshipped
 *     prereqs blocking it.
 *   - **unshipped + blocked** — playbook not shipped AND at least one of
 *     its prereqs is still unshipped.
 *
 * It then emits four cumulative stats:
 *
 *   - **annualLiftCaptured** — annualized lift from the shipped bucket
 *   - **annualLiftReady**     — annualized lift from the ready bucket
 *   - **annualLiftBlocked**   — annualized lift from the blocked bucket
 *   - **realizedPct**         — captured ÷ (captured + ready + blocked)
 *     — clamped 0..100, NaN-guarded.
 *
 * Pure data — no DOM, no localStorage side effects.
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";
import type { ShippedMap } from "./shipped-playbooks";
import {
  MOVE_RECOMMENDATIONS,
  MoveRecommendation,
} from "./next-move";

export interface RealizedRoiBucket {
  moves: MoveRecommendation[];
  monthlyLiftLow: number;
  monthlyLiftHigh: number;
  annualLiftLow: number;
  annualLiftHigh: number;
  /** Sum of monthly cost (high side). */
  monthlyCostHigh: number;
  annualCostHigh: number;
}

export interface RealizedRoi {
  monthlyRevenue: number;
  annualRevenue: number;

  shipped: RealizedRoiBucket;
  ready: RealizedRoiBucket;
  blocked: RealizedRoiBucket;

  /** captured ÷ total potential. Clamped 0..100. NaN-guarded to 0. */
  realizedPct: number;

  /** Headline — short, operator-facing. */
  headline: string;
  rationale: string;

  /** Pre-formatted Markdown summary. */
  summaryMarkdown: string;
}

const MONTHS_PER_YEAR = 12;

function safe(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}

function emptyBucket(): RealizedRoiBucket {
  return {
    moves: [],
    monthlyLiftLow: 0,
    monthlyLiftHigh: 0,
    annualLiftLow: 0,
    annualLiftHigh: 0,
    monthlyCostHigh: 0,
    annualCostHigh: 0,
  };
}

function sumMove(
  move: MoveRecommendation,
  monthlyRevenue: number,
): { liftLow: number; liftHigh: number; costHigh: number } {
  return {
    liftLow: safe(move.liftLow) * monthlyRevenue,
    liftHigh: safe(move.liftHigh) * monthlyRevenue,
    costHigh: safe(move.costHigh),
  };
}

function accumulate(
  bucket: RealizedRoiBucket,
  move: MoveRecommendation,
  monthlyRevenue: number,
): void {
  const { liftLow, liftHigh, costHigh } = sumMove(move, monthlyRevenue);
  bucket.moves.push(move);
  bucket.monthlyLiftLow += liftLow;
  bucket.monthlyLiftHigh += liftHigh;
  bucket.annualLiftLow += liftLow * MONTHS_PER_YEAR;
  bucket.annualLiftHigh += liftHigh * MONTHS_PER_YEAR;
  bucket.monthlyCostHigh += costHigh;
  bucket.annualCostHigh += costHigh * MONTHS_PER_YEAR;
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${Math.round(n / 1000).toLocaleString("en-US")}k`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

export function projectRealizedRoi(
  store: YourStoreInputs | null,
  shipped: ShippedMap,
): RealizedRoi {
  const inputs: YourStoreInputs = store ?? YOUR_STORE_DEFAULTS;
  const monthlyRevenue = safe(inputs.aov) * safe(inputs.monthlyOrders);

  const shippedBucket = emptyBucket();
  const readyBucket = emptyBucket();
  const blockedBucket = emptyBucket();

  for (const move of MOVE_RECOMMENDATIONS) {
    const isShipped = Boolean(shipped[move.id]);
    if (isShipped) {
      accumulate(shippedBucket, move, monthlyRevenue);
      continue;
    }

    // Any unshipped prereq counts as blocking.
    const hasBlockingPrereq = move.prereqIds.some(
      (id) => !shipped[id] && MOVE_RECOMMENDATIONS.some((m) => m.id === id),
    );
    if (hasBlockingPrereq) {
      accumulate(blockedBucket, move, monthlyRevenue);
    } else {
      accumulate(readyBucket, move, monthlyRevenue);
    }
  }

  const totalLow =
    shippedBucket.annualLiftLow +
    readyBucket.annualLiftLow +
    blockedBucket.annualLiftLow;
  const totalHigh =
    shippedBucket.annualLiftHigh +
    readyBucket.annualLiftHigh +
    blockedBucket.annualLiftHigh;

  const capturedLow = shippedBucket.annualLiftLow;
  const capturedHigh = shippedBucket.annualLiftHigh;
  const realizedPct =
    totalHigh > 0
      ? Math.min(100, Math.max(0, (capturedHigh / totalHigh) * 100))
      : 0;

  // Headline adapts to bucket state.
  let headline: string;
  let rationale: string;
  if (shippedBucket.moves.length === 0) {
    headline = "No moves shipped yet — full potential on the table";
    rationale = `Ship the next move to start capturing the ${fmtMoney(totalLow)}–${fmtMoney(totalHigh)}/yr potential.`;
  } else if (readyBucket.moves.length === 0 && blockedBucket.moves.length === 0) {
    headline = "Top-10 stack fully shipped — best-in-class";
    rationale = `You've captured the full ${fmtMoney(capturedLow)}–${fmtMoney(capturedHigh)}/yr from the canonical 10.`;
  } else {
    headline = `Captured ${fmtPct(realizedPct)} of ${fmtMoney(totalLow)}–${fmtMoney(totalHigh)}/yr potential`;
    const next = readyBucket.moves[0] ?? blockedBucket.moves[0];
    if (next) {
      const nextLow = readyBucket.moves[0]
        ? readyBucket.monthlyLiftLow
        : 0;
      const nextHigh = readyBucket.moves[0]
        ? readyBucket.monthlyLiftHigh
        : 0;
      rationale = readyBucket.moves.length > 0
        ? `Ship "${next.name}" to unlock another ${fmtMoney(nextLow)}–${fmtMoney(nextHigh)}/mo.`
        : `${blockedBucket.moves.length} move${blockedBucket.moves.length === 1 ? "" : "s"} blocked by unshipped prereqs — clear the prereq first.`;
    } else {
      rationale = "All remaining moves need their prereqs shipped first.";
    }
  }

  const summaryMarkdown = [
    `**Realized ROI** — ${headline}`,
    "",
    `- Annual lift captured: ${fmtMoney(capturedLow)}–${fmtMoney(capturedHigh)}`,
    `- Annual lift remaining (ready): ${fmtMoney(readyBucket.annualLiftLow)}–${fmtMoney(readyBucket.annualLiftHigh)}`,
    `- Annual lift remaining (blocked): ${fmtMoney(blockedBucket.annualLiftLow)}–${fmtMoney(blockedBucket.annualLiftHigh)}`,
    `- Realized: ${fmtPct(realizedPct)}`,
    `- Revenue base: ${fmtMoney(monthlyRevenue)}/mo · ${fmtMoney(monthlyRevenue * MONTHS_PER_YEAR)}/yr`,
    "",
    `Shipped: ${shippedBucket.moves.map((m) => m.name).join(", ") || "—"}`,
    `Ready to ship: ${readyBucket.moves.map((m) => m.name).join(", ") || "—"}`,
    `Blocked: ${blockedBucket.moves.map((m) => m.name).join(", ") || "—"}`,
  ].join("\n");

  return {
    monthlyRevenue,
    annualRevenue: monthlyRevenue * MONTHS_PER_YEAR,
    shipped: shippedBucket,
    ready: readyBucket,
    blocked: blockedBucket,
    realizedPct,
    headline,
    rationale,
    summaryMarkdown,
  };
}

export const REALIZED_ROI_FORMATTERS = {
  money: fmtMoney,
  pct: fmtPct,
};
