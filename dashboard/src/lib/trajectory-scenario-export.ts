/**
 * `Trajectory scenario export` — pure-logic CSV builder for the comparator's
 * Scenario A + Scenario B state, plus their deltas vs. the baseline.
 *
 * Closes the operator "share my what-if with the team" loop. The comparator
 * card on `/` (and the compact variant on `/today`) shows the active Scenario
 * A — and optionally Scenario B — alongside their deltas vs. the baseline
 * 12-month trajectory. Until now, an operator who wanted to share a saved
 * scenario pair had no portable artifact. This module produces a CSV with:
 *
 *   - Metadata header block (schema, version, exportedAt, AOV, orders,
 *     margin, baseline headline + Year-1 totals)
 *   - Baseline row (month-by-month revenue / cost / ships-this-month)
 *   - Scenario A row (with move + delay metadata + delta vs baseline)
 *   - Scenario B row (only when enabled — with the same shape)
 *
 * Drop into a spreadsheet to pivot / sort / compare scenarios side by side
 * without copy-pasting from the in-page delta grid.
 *
 * Reuses the canonical CSV-escape pattern from `trajectory-export.ts` and
 * `progress-export.ts` so a future reader who learns one export module learns
 * all three.
 */

import type { TrajectoryProjection } from "./trajectory-projection";
import {
  type TrajectoryScenarioDelta,
  computeTrajectoryScenarioDelta,
} from "./trajectory-projection";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface ScenarioExportMoveMeta {
  /** Move id (e.g. "01-abandoned-cart-flow-klaviyo"). */
  moveId: string;
  /** Human-readable move name (e.g. "Abandoned cart flow · Klaviyo"). */
  moveName: string;
  /** Days of delay applied (positive integer). */
  delayDays: number;
  /** Original ship-month index (1..12) without the delay. null when not on horizon. */
  originalShipMonth: number | null;
  /** Delayed ship-month index (1..12) after the delay. null when not on horizon. */
  delayedShipMonth: number | null;
}

export interface ScenarioExportSlot {
  /** "baseline" | "A" | "B". */
  label: "baseline" | "A" | "B";
  /** Trajectory projection for this scenario. For "baseline" this is the un-delayed projection. */
  projection: TrajectoryProjection;
  /** Move metadata for this scenario (null for baseline). */
  move: ScenarioExportMoveMeta | null;
  /** Delta vs. baseline (always zero for the baseline slot itself). */
  deltaVsBaseline: TrajectoryScenarioDelta | null;
}

export interface ScenarioExportMeta {
  /** Operator's AOV (USD) — for the metadata header block. */
  aov: number;
  /** Operator's monthly orders. */
  monthlyOrders: number;
  /** Operator's gross margin (0..1). */
  grossMargin: number;
  /** ISO date stamp (YYYY-MM-DD) at export time. */
  exportedAt: string;
}

/**
 * Build the CSV body for a trajectory-scenario export.
 *
 * Layout:
 *   - 1 metadata block (key,value) at the top
 *   - blank line
 *   - 1 row per scenario × month (scenario, month, revenue_low, revenue_high,
 *     cost_low, cost_high, ships_this_month, ships_cumulative, ships_names,
 *     y1_lift_delta_low, y1_lift_delta_high, y1_cost_delta_low,
 *     y1_cost_delta_high, y1_roi_delta_low, y1_roi_delta_high,
 *     peak_revenue_delta_low, peak_revenue_delta_high, has_impact)
 *
 * Always emits the baseline + Scenario A. Scenario B only appears when its
 * slot is provided.
 *
 * Trailing newline per RFC 4180.
 */
export function buildScenarioExportCsv(
  slots: ScenarioExportSlot[],
  meta: ScenarioExportMeta,
): string {
  const lines: string[] = [];

  // Metadata header — spreadsheet-friendly 2-column block (key,value per line).
  lines.push(`# ecommerce-ops-trajectory-scenario,schema=ecommerce-ops-trajectory-scenario`);
  lines.push(`# version,1`);
  lines.push(`exported_at,${csvEscape(meta.exportedAt)}`);
  lines.push(`aov_usd,${csvEscape(meta.aov.toFixed(2))}`);
  lines.push(`monthly_orders,${csvEscape(meta.monthlyOrders)}`);
  lines.push(
    `gross_margin_pct,${csvEscape((meta.grossMargin * 100).toFixed(1))}`,
  );

  // Per-scenario move + delay metadata (header block — easy to scan).
  for (const slot of slots) {
    lines.push(`scenario_${slot.label}_move_id,${csvEscape(slot.move?.moveId ?? "")}`);
    lines.push(`scenario_${slot.label}_move_name,${csvEscape(slot.move?.moveName ?? "")}`);
    lines.push(`scenario_${slot.label}_delay_days,${csvEscape(slot.move?.delayDays ?? 0)}`);
    lines.push(`scenario_${slot.label}_original_ship_month,${csvEscape(slot.move?.originalShipMonth ?? "")}`);
    lines.push(`scenario_${slot.label}_delayed_ship_month,${csvEscape(slot.move?.delayedShipMonth ?? "")}`);
  }

  // Scenario summary row — baseline headline + Year-1 totals (sourced from
  // baseline projection, since every scenario shares the same baseline).
  const baselineSlot = slots.find((s) => s.label === "baseline");
  if (baselineSlot) {
    lines.push(`baseline_monthly_revenue,${csvEscape(baselineSlot.projection.baselineMonthlyRevenue.toFixed(2))}`);
    lines.push(`baseline_annual_revenue,${csvEscape(baselineSlot.projection.baselineAnnualRevenue.toFixed(2))}`);
    lines.push(`moves_already_shipped,${csvEscape(baselineSlot.projection.movesAlreadyShipped)}`);
    lines.push(`total_moves,${csvEscape(baselineSlot.projection.totalMoves)}`);
    lines.push(`moves_on_horizon,${csvEscape(baselineSlot.projection.movesOnHorizon.length)}`);
    lines.push(`moves_beyond_horizon,${csvEscape(baselineSlot.projection.movesBeyondHorizon.length ?? 0)}`);
    lines.push(`year1_revenue_low,${csvEscape(baselineSlot.projection.year1RevenueLow.toFixed(2))}`);
    lines.push(`year1_revenue_high,${csvEscape(baselineSlot.projection.year1RevenueHigh.toFixed(2))}`);
    lines.push(`year1_cost_low,${csvEscape(baselineSlot.projection.year1CostLow.toFixed(2))}`);
    lines.push(`year1_cost_high,${csvEscape(baselineSlot.projection.year1CostHigh.toFixed(2))}`);
    lines.push(`year1_lift_low,${csvEscape(baselineSlot.projection.year1LiftLow.toFixed(2))}`);
    lines.push(`year1_lift_high,${csvEscape(baselineSlot.projection.year1LiftHigh.toFixed(2))}`);
    lines.push(`year1_roi_low,${csvEscape(baselineSlot.projection.year1RoiLow.toFixed(2))}`);
    lines.push(`year1_roi_high,${csvEscape(baselineSlot.projection.year1RoiHigh.toFixed(2))}`);
    lines.push(`baseline_headline,${csvEscape(baselineSlot.projection.headline)}`);
  }

  // Blank separator before the table.
  lines.push("");

  // Monthly × scenario table header.
  const headers = [
    "scenario",
    "move_id",
    "move_name",
    "delay_days",
    "month",
    "revenue_low_usd",
    "revenue_high_usd",
    "monthly_cost_low_usd",
    "monthly_cost_high_usd",
    "moves_shipped_this_month",
    "moves_shipped_cumulative",
    "ships_names",
    "y1_lift_delta_low_usd",
    "y1_lift_delta_high_usd",
    "y1_cost_delta_low_usd",
    "y1_cost_delta_high_usd",
    "y1_roi_delta_low",
    "y1_roi_delta_high",
    "peak_revenue_delta_low_usd",
    "peak_revenue_delta_high_usd",
    "has_impact",
  ];
  lines.push(headers.map(csvEscape).join(","));

  // 1 row per (scenario, month) — full 12-month per-scenario table.
  for (const slot of slots) {
    const d = slot.deltaVsBaseline;
    for (const m of slot.projection.months) {
      lines.push(
        [
          csvEscape(slot.label),
          csvEscape(slot.move?.moveId ?? ""),
          csvEscape(slot.move?.moveName ?? ""),
          csvEscape(slot.move?.delayDays ?? 0),
          csvEscape(m.month),
          csvEscape(m.revenueLow.toFixed(2)),
          csvEscape(m.revenueHigh.toFixed(2)),
          csvEscape(m.costLow.toFixed(2)),
          csvEscape(m.costHigh.toFixed(2)),
          csvEscape(m.movesShippedThisMonth.length),
          csvEscape(m.movesShippedCumulative),
          csvEscape(m.movesShippedThisMonth.join("; ")),
          csvEscape(d ? d.year1LiftLowDelta.toFixed(2) : 0),
          csvEscape(d ? d.year1LiftHighDelta.toFixed(2) : 0),
          csvEscape(d ? d.year1CostLowDelta.toFixed(2) : 0),
          csvEscape(d ? d.year1CostHighDelta.toFixed(2) : 0),
          csvEscape(d ? d.year1RoiLowDelta.toFixed(2) : 0),
          csvEscape(d ? d.year1RoiHighDelta.toFixed(2) : 0),
          csvEscape(d ? d.peakRevenueLowDelta.toFixed(2) : 0),
          csvEscape(d ? d.peakRevenueHighDelta.toFixed(2) : 0),
          csvEscape(d ? (d.hasImpact ? 1 : 0) : 0),
        ].join(","),
      );
    }
  }

  return lines.join("\n") + "\n";
}

/**
 * Convenience: build a `ScenarioExportSlot[]` from raw baseline + delayed
 * projections + move metadata. Caller computes the delayed projection via
 * `projectTrajectoryWithDelays(store, shipped, { [moveId]: delayDays })`.
 *
 * Auto-fills the delta-vs-baseline via `computeTrajectoryScenarioDelta`.
 */
export function buildScenarioExportSlots(args: {
  baseline: TrajectoryProjection;
  delayedA: TrajectoryProjection;
  delayedB?: TrajectoryProjection | null;
  moveA: ScenarioExportMoveMeta | null;
  moveB: ScenarioExportMoveMeta | null;
  scenarioBEnabled?: boolean;
}): ScenarioExportSlot[] {
  const slots: ScenarioExportSlot[] = [
    {
      label: "baseline",
      projection: args.baseline,
      move: null,
      deltaVsBaseline: null,
    },
    {
      label: "A",
      projection: args.delayedA,
      move: args.moveA,
      deltaVsBaseline: computeTrajectoryScenarioDelta(args.baseline, args.delayedA),
    },
  ];
  if (args.scenarioBEnabled && args.delayedB) {
    slots.push({
      label: "B",
      projection: args.delayedB,
      move: args.moveB,
      deltaVsBaseline: computeTrajectoryScenarioDelta(args.baseline, args.delayedB),
    });
  }
  return slots;
}

/** Suggested file name for a scenario export. */
export function scenarioExportFilename(
  exportedAt: string,
  includesB: boolean,
): string {
  const suffix = includesB ? "AB" : "A";
  return `ecom-ops-trajectory-scenario-${suffix}-${exportedAt}.csv`;
}
