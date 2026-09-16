/**
 * `Trajectory export` — pure-logic builders for CSV + Markdown downloads
 * from a `TrajectoryProjection`.
 *
 * Closes the "share my 12-month revenue curve" loop. Operators have a
 * fully-personalized panel on `/` and `/today` — now they can hit one
 * button and download either:
 *
 *   - CSV   — 12-month per-row revenue / cost / ships table, plus a
 *             metadata header block (AOV × orders × margin + headline +
 *             Year-1 totals). Drop into a spreadsheet, sort by month,
 *             pivot on ships-this-month.
 *   - MD    — a polished Markdown report mirroring the in-panel summary,
 *             pasteable into Slack / Notion / Linear / email handoff.
 *
 * Math lives in `dashboard/src/lib/trajectory-projection.ts`. This module
 * is rendering only — every number is read from the projection object,
 * no recomputation, no I/O.
 *
 * Reuses the canonical CSV-escape pattern from `progress-export.ts` so
 * a future reader who learns one export module learns all three.
 */

import type { TrajectoryProjection } from "@/lib/trajectory-projection";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface TrajectoryExportMeta {
  /** Operator's AOV (USD) — for the metadata header block. */
  aov: number;
  /** Operator's monthly orders. */
  monthlyOrders: number;
  /** Operator's gross margin (0..1). */
  grossMargin: number;
  /** ISO date stamp (YYYY-MM-DD) at export time. */
  exportedAt: string;
  /** Optional label override for the file name. */
  label?: string;
}

/**
 * Build the CSV body for a trajectory export.
 *
 * Layout:
 *   - 1 metadata block (key,value) at the top
 *   - blank line
 *   - header row for the 12-month table
 *   - 12 data rows (one per month)
 *
 * Trailing newline per RFC 4180.
 */
export function buildTrajectoryCsv(
  projection: TrajectoryProjection,
  meta: TrajectoryExportMeta,
): string {
  const lines: string[] = [];

  // Metadata header — spreadsheet-friendly 2-column block.
  lines.push("# ecommerce-ops-trajectory");
  lines.push("# schema,ecommerce-ops-trajectory");
  lines.push("# version,1");
  lines.push(csvEscape("exported_at"), csvEscape(meta.exportedAt));
  lines.push(csvEscape("label"), csvEscape(meta.label ?? "12-month revenue trajectory"));
  lines.push(csvEscape("aov_usd"), csvEscape(meta.aov.toFixed(2)));
  lines.push(csvEscape("monthly_orders"), csvEscape(meta.monthlyOrders));
  lines.push(csvEscape("gross_margin_pct"), csvEscape((meta.grossMargin * 100).toFixed(1)));
  lines.push(csvEscape("baseline_monthly_revenue"), csvEscape(projection.baselineMonthlyRevenue.toFixed(2)));
  lines.push(csvEscape("baseline_annual_revenue"), csvEscape(projection.baselineAnnualRevenue.toFixed(2)));
  lines.push(csvEscape("moves_already_shipped"), csvEscape(projection.movesAlreadyShipped));
  lines.push(csvEscape("total_moves"), csvEscape(projection.totalMoves));
  lines.push(csvEscape("moves_on_horizon"), csvEscape(projection.movesOnHorizon.length));
  lines.push(csvEscape("moves_beyond_horizon"), csvEscape(projection.movesBeyondHorizon.length));
  lines.push(csvEscape("year1_revenue_low"), csvEscape(projection.year1RevenueLow.toFixed(2)));
  lines.push(csvEscape("year1_revenue_high"), csvEscape(projection.year1RevenueHigh.toFixed(2)));
  lines.push(csvEscape("year1_cost_low"), csvEscape(projection.year1CostLow.toFixed(2)));
  lines.push(csvEscape("year1_cost_high"), csvEscape(projection.year1CostHigh.toFixed(2)));
  lines.push(csvEscape("year1_lift_low"), csvEscape(projection.year1LiftLow.toFixed(2)));
  lines.push(csvEscape("year1_lift_high"), csvEscape(projection.year1LiftHigh.toFixed(2)));
  lines.push(csvEscape("year1_roi_low"), csvEscape(projection.year1RoiLow.toFixed(2)));
  lines.push(csvEscape("year1_roi_high"), csvEscape(projection.year1RoiHigh.toFixed(2)));
  lines.push(csvEscape("headline"), csvEscape(projection.headline));

  // Blank separator before the table.
  lines.push("");

  // Monthly table header.
  const headers = [
    "month",
    "revenue_low_usd",
    "revenue_high_usd",
    "monthly_cost_low_usd",
    "monthly_cost_high_usd",
    "moves_shipped_this_month",
    "moves_shipped_cumulative",
    "ships_names",
  ];
  lines.push(headers.map(csvEscape).join(","));

  // 12 data rows.
  for (const m of projection.months) {
    lines.push(
      [
        csvEscape(m.month),
        csvEscape(m.revenueLow.toFixed(2)),
        csvEscape(m.revenueHigh.toFixed(2)),
        csvEscape(m.costLow.toFixed(2)),
        csvEscape(m.costHigh.toFixed(2)),
        csvEscape(m.movesShippedThisMonth.length),
        csvEscape(m.movesShippedCumulative),
        csvEscape(m.movesShippedThisMonth.join("; ")),
      ].join(","),
    );
  }

  return lines.join("\n") + "\n";
}

/**
 * Build the Markdown body for a trajectory export.
 *
 * Mirrors `summaryMarkdown` from the projection, but adds an export
 * footer line with the metadata for traceability.
 */
export function buildTrajectoryMarkdown(
  projection: TrajectoryProjection,
  meta: TrajectoryExportMeta,
): string {
  const lines: string[] = [];
  lines.push(projection.summaryMarkdown);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`_Exported ${meta.exportedAt} from /trajectory · schema ecommerce-ops-trajectory v1._`);
  return lines.join("\n");
}

/** Suggested file name for a trajectory export. */
export function trajectoryExportFilename(
  ext: "csv" | "md",
  exportedAt: string,
): string {
  return `ecom-ops-trajectory-${exportedAt}.${ext}`;
}
