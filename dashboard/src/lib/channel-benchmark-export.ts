/**
 * `channel-benchmark-export` — pure-logic builders for a single CSV bundle
 * containing every channel-specific benchmark table from research/00 § 2.
 *
 * Closes the operator's "I want one CSV with all 6 channel benchmarks in it"
 * loop. The 6 individual `<ResearchTable>` blocks on `/channels` each expose
 * their own per-table CSV / Copy / Markdown buttons (Move #128.ao parallel),
 * but an operator building a channel-P&L spreadsheet wants ALL six tables in
 * ONE file so they can pivot across channels without copy-pasting between
 * per-table CSVs.
 *
 * CSV layout:
 *   - metadata header block (schema, version, exportedAt, source)
 *   - 1 blank line
 *   - per-channel table block in canonical order:
 *     <table> sub-heading as a comment-style header,
 *     column headers,
 *     data rows,
 *     1 blank separator line between tables
 *
 * Companion component: `dashboard/src/components/channel-benchmark-export-button.tsx`.
 * Mounted on `dashboard/app/channels/page.tsx` immediately after the
 * Channel Mix Budget Allocator Card.
 */

import type { TableRow } from "./content";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
function csvEscape(value: string): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface ChannelBenchmarkBlock {
  /** Canonical channel key (matches the keys on `/channels`). */
  id:
    | "meta"
    | "google"
    | "tiktok"
    | "organic"
    | "email"
    | "influencer";
  /** Operator-facing heading — used as the section header in the CSV. */
  title: string;
  /** Display columns in the order they should appear. */
  headers: string[];
  /** Pre-extracted data rows from the ResearchTable. */
  rows: TableRow[];
}

export interface ChannelBenchmarkExportMeta {
  /** ISO date stamp (YYYY-MM-DD). */
  exportedAt: string;
  /** Optional label override for the file name. */
  label?: string;
}

/**
 * Build the CSV body bundling every channel benchmark into a single file.
 *
 * Format:
 *   # ecommerce-ops-channel-benchmarks
 *   # schema,ecommerce-ops-channel-benchmarks
 *   # version,1
 *   # exported_at,2026-09-20
 *   # source,research/00-ecommerce-ops-landscape.md § 2
 *   # channel_count,6
 *   # total_rows,42
 *
 *   ## Channel: Meta (Facebook + Instagram)
 *   Channel,2025 typical range,Source
 *   ...
 *
 *   ## Channel: Google Ads
 *   ...
 *
 * RFC 4180 line endings (\r\n) for Excel / Numbers / Google Sheets parity.
 */
export function buildChannelBenchmarkCsv(
  blocks: ChannelBenchmarkBlock[],
  meta: ChannelBenchmarkExportMeta,
): string {
  const lines: string[] = [];
  const totalRows = blocks.reduce((s, b) => s + b.rows.length, 0);

  lines.push("# ecommerce-ops-channel-benchmarks");
  lines.push("# schema,ecommerce-ops-channel-benchmarks");
  lines.push("# version,1");
  lines.push(`# exported_at,${csvEscape(meta.exportedAt)}`);
  lines.push(`# label,${csvEscape(meta.label ?? "Channel benchmarks bundle")}`);
  lines.push(
    "# source,research/00-ecommerce-ops-landscape.md § 2 (Acquisition Channels Ranked by ROI)",
  );
  lines.push(`# channel_count,${blocks.length}`);
  lines.push(`# total_rows,${totalRows}`);

  for (const block of blocks) {
    lines.push("");
    lines.push(`# --- Channel: ${block.title} (${block.id}) ---`);
    lines.push(`# row_count,${block.rows.length}`);
    lines.push(`# column_count,${block.headers.length}`);
    if (block.rows.length === 0) {
      lines.push("# (no rows)");
      continue;
    }
    lines.push(block.headers.map(csvEscape).join(","));
    for (const r of block.rows) {
      lines.push(block.headers.map((h) => csvEscape(r[h] ?? "")).join(","));
    }
  }

  return lines.join("\r\n") + "\r\n";
}

/**
 * Build the filename for the channel benchmark export.
 * Format: `ecom-ops-channel-benchmarks-<YYYY-MM-DD>.csv`.
 */
export function channelBenchmarkFilename(meta: ChannelBenchmarkMetaLike): string {
  const date = meta.exportedAt || new Date().toISOString().slice(0, 10);
  return `ecom-ops-channel-benchmarks-${date}.csv`;
}

/** Minimal shape needed to compute the filename. */
export interface ChannelBenchmarkMetaLike {
  exportedAt: string;
}

/**
 * Validate a bundle before emitting a CSV — refuses empty input and emits
 * a stable error string so the calling component can show an alert instead
 * of producing an empty file. Returns null on success.
 */
export function validateChannelBenchmarkBundle(
  blocks: ChannelBenchmarkBlock[],
): string | null {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return "No channel benchmarks available — content bundle is empty.";
  }
  const missing = blocks.filter(
    (b) => !b.headers.length || !b.rows.length,
  );
  if (missing.length === blocks.length) {
    return "All channel benchmarks are empty — nothing to export.";
  }
  return null;
}