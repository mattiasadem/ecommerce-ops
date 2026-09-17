/**
 * `Ikas trend export` — pure-logic CSV + Markdown builders for the
 * rolling 12-sample revenue history captured by `<IkasTrendStrip />`.
 *
 * Closes the "share my live revenue trend" loop. The trend strip
 * (Move #6.14.b) captures a rolling window of the last 12 fetches
 * (~6 minutes at the canonical 30s auto-refresh cadence) and renders
 * a sparkline + Δ vs oldest sample in the dashboard — but until now
 * the operator had no way to export that history. They had three
 * workarounds: (a) screenshot the sparkline (lossy, can't pivot),
 * (b) open the Vercel function logs and grep `revenue30dUsd`
 * (technical, slow), or (c) give up and assume the session is flat.
 *
 * This module renders two portable artifacts:
 *   - CSV — `fetched_at, revenue_30d, order_count_30d, currency,
 *           minutes_since_prev, delta_revenue, delta_orders` rows
 *           with a metadata header block. Drop into a spreadsheet to
 *           pivot, sort, or filter.
 *   - MD  — a polished Markdown table + session summary line, paste
 *           directly into Slack / Notion / Linear / email handoff.
 *
 * Reuses the canonical CSV-escape pattern from
 * `progress-export.ts` + `trajectory-export.ts` so a future reader
 * who learns one export module learns all four.
 */
import type { IkasTrendSample } from "@/components/ikas-trend-strip";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface IkasTrendExportMeta {
  /** ISO date stamp (YYYY-MM-DD) at export time. */
  exportedAt: string;
  /** ISO timestamp when the trend capture window started (oldest sample). */
  windowStartAt: string | null;
  /** ISO timestamp when the trend capture window ended (newest sample). */
  windowEndAt: string | null;
  /** Canonical source URL or endpoint label for traceability. */
  source?: string;
}

/**
 * Build the CSV body for an Ikas trend export.
 *
 * Layout:
 *   - 1 metadata block (key,value) at the top
 *   - blank line
 *   - header row for the sample table
 *   - N data rows (one per sample, oldest-first by convention)
 *
 * Trailing newline per RFC 4180. Pre-computed per-row deltas (vs
 * the previous sample, oldest-first) let the operator spot
 * stagnation / spikes / dips without re-computing in the spreadsheet.
 */
export function buildIkasTrendCsv(
  samples: IkasTrendSample[],
  meta: IkasTrendExportMeta,
): string {
  const lines: string[] = [];

  // Metadata header — spreadsheet-friendly 2-column block.
  lines.push("# ecommerce-ops-ikas-trend");
  lines.push("# schema,ecommerce-ops-ikas-trend");
  lines.push("# version,1");
  lines.push(csvEscape("exported_at"), csvEscape(meta.exportedAt));
  lines.push(csvEscape("source"), csvEscape(meta.source ?? "/api/ikas/overview"));
  lines.push(csvEscape("sample_count"), csvEscape(samples.length));
  lines.push(csvEscape("window_start_at"), csvEscape(meta.windowStartAt ?? ""));
  lines.push(csvEscape("window_end_at"), csvEscape(meta.windowEndAt ?? ""));
  if (samples.length > 0) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    lines.push(csvEscape("revenue_first"), csvEscape(first.revenue30dUsd.toFixed(2)));
    lines.push(csvEscape("revenue_last"), csvEscape(last.revenue30dUsd.toFixed(2)));
    const revDelta = last.revenue30dUsd - first.revenue30dUsd;
    lines.push(csvEscape("revenue_delta_first_to_last"), csvEscape(revDelta.toFixed(2)));
    const ordDelta = last.orderCount30d - first.orderCount30d;
    lines.push(csvEscape("orders_delta_first_to_last"), csvEscape(ordDelta));
    lines.push(
      csvEscape("direction"),
      csvEscape(revDelta > 0.5 ? "up" : revDelta < -0.5 ? "down" : "flat"),
    );
  } else {
    lines.push(csvEscape("revenue_first"), csvEscape(""));
    lines.push(csvEscape("revenue_last"), csvEscape(""));
    lines.push(csvEscape("revenue_delta_first_to_last"), csvEscape(""));
    lines.push(csvEscape("orders_delta_first_to_last"), csvEscape(""));
    lines.push(csvEscape("direction"), csvEscape("n/a"));
  }

  // Blank separator before the table.
  lines.push("");

  // Sample table header.
  const headers = [
    "fetched_at",
    "revenue_30d",
    "order_count_30d",
    "currency",
    "minutes_since_prev",
    "delta_revenue",
    "delta_orders",
  ];
  lines.push(headers.map(csvEscape).join(","));

  // N data rows — oldest-first so the operator reads chronologically.
  let prev: IkasTrendSample | null = null;
  let prevMs: number | null = null;
  for (const s of samples) {
    const ms = Date.parse(s.fetchedAt);
    const minutesSincePrev =
      prevMs !== null && Number.isFinite(ms - prevMs)
        ? ((ms - prevMs) / 60000).toFixed(2)
        : "";
    const deltaRevenue =
      prev !== null ? (s.revenue30dUsd - prev.revenue30dUsd).toFixed(2) : "";
    const deltaOrders = prev !== null ? s.orderCount30d - prev.orderCount30d : "";
    lines.push(
      [
        csvEscape(s.fetchedAt),
        csvEscape(s.revenue30dUsd.toFixed(2)),
        csvEscape(s.orderCount30d),
        csvEscape(s.currency ?? ""),
        csvEscape(minutesSincePrev),
        csvEscape(deltaRevenue),
        csvEscape(deltaOrders),
      ].join(","),
    );
    prev = s;
    prevMs = Number.isFinite(ms) ? ms : null;
  }

  return lines.join("\n") + "\n";
}

/**
 * Build the Markdown body for an Ikas trend export.
 *
 * Mirrors the canonical `summaryMarkdown` style from the trajectory
 * export — polished prose at the top, sample table in the middle,
 * export footer line at the bottom.
 */
export function buildIkasTrendMarkdown(
  samples: IkasTrendSample[],
  meta: IkasTrendExportMeta,
): string {
  const lines: string[] = [];

  if (samples.length === 0) {
    lines.push("# Ikas live-revenue trend");
    lines.push("");
    lines.push(
      "_No samples captured yet — the trend strip fills as `/api/ikas/overview` returns data. Open `/` or `/today`, wait ~6 minutes, then re-export._",
    );
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(`_Exported ${meta.exportedAt} from IkasTrendStrip · schema ecommerce-ops-ikas-trend v1._`);
    return lines.join("\n");
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const revDelta = last.revenue30dUsd - first.revenue30dUsd;
  const ordDelta = last.orderCount30d - first.orderCount30d;
  const direction = revDelta > 0.5 ? "↑ up" : revDelta < -0.5 ? "↓ down" : "→ flat";
  const fmtRev = (n: number) =>
    `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  lines.push("# Ikas live-revenue trend");
  lines.push("");
  lines.push(
    `**Window:** ${samples.length} samples · ${meta.windowStartAt ?? "?"} → ${meta.windowEndAt ?? "?"}`,
  );
  lines.push(
    `**Direction:** ${direction} · Δ revenue ${fmtRev(first.revenue30dUsd)} → ${fmtRev(last.revenue30dUsd)} (${revDelta >= 0 ? "+" : ""}${fmtRev(revDelta)}) · Δ orders ${first.orderCount30d} → ${last.orderCount30d} (${ordDelta >= 0 ? "+" : ""}${ordDelta})`,
  );
  lines.push(`**Currency:** ${last.currency ?? "USD"} · **Source:** ${meta.source ?? "/api/ikas/overview"}`);
  lines.push("");
  lines.push("| Fetched at | Revenue (30d) | Orders (30d) | Δ vs prev |");
  lines.push("|---|---|---|---|");
  let prev: IkasTrendSample | null = null;
  for (const s of samples) {
    const dr =
      prev !== null ? (s.revenue30dUsd - prev.revenue30dUsd).toFixed(0) : "—";
    lines.push(`| ${s.fetchedAt} | ${fmtRev(s.revenue30dUsd)} | ${s.orderCount30d} | ${dr} |`);
    prev = s;
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`_Exported ${meta.exportedAt} from IkasTrendStrip · schema ecommerce-ops-ikas-trend v1._`);
  return lines.join("\n");
}

/** Suggested file name for an Ikas trend export. */
export function ikasTrendExportFilename(
  ext: "csv" | "md",
  exportedAt: string,
): string {
  return `ikas-trend-${exportedAt}.${ext}`;
}