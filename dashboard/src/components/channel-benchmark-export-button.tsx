"use client";

import { useMemo, useState } from "react";

import {
  buildChannelBenchmarkCsv,
  channelBenchmarkFilename,
  validateChannelBenchmarkBundle,
  type ChannelBenchmarkBlock,
} from "@/lib/channel-benchmark-export";
import { cn } from "@/lib/utils";

/**
 * `Channel Benchmark Export Button` — one-click CSV download of the 6
 * channel-specific benchmark tables from research/00 § 2 (Meta, Google,
 * TikTok, Organic, Email+SMS, Influencer) into a single file.
 *
 * Closes the operator loop the journal's Move #2 calls out: the
 * `<ResearchTable>` blocks each expose per-table export buttons, but an
 * operator building a channel-P&L spreadsheet wants ALL six tables in
 * ONE file so they can pivot across channels without copy-pasting between
 * per-table CSVs.
 *
 * The component is presentation-only — the 6 `TableRow[]` arrays are passed
 * in as `blocks` props from the parent (which already extracts them via
 * `findTable` from `lib/content`). The component handles:
 *   - one-click CSV download via Blob + anchor + `URL.revokeObjectURL`
 *   - row/column count badge so the operator sees the bundle size before
 *     clicking
 *   - empty/error state with operator-facing message
 *   - 1.5s "Downloaded" confirmation chip
 *
 * Mounted on `dashboard/app/channels/page.tsx` immediately after the
 * Channel Mix Budget Allocator Card, in its own bordered card with the
 * Move #2 framing copy.
 */

interface ChannelBenchmarkExportButtonProps {
  blocks: ChannelBenchmarkBlock[];
  className?: string;
}

function downloadBlob(filename: string, mime: string, content: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ChannelBenchmarkExportButton({
  blocks,
  className,
}: ChannelBenchmarkExportButtonProps) {
  const [confirmation, setConfirmation] = useState<"idle" | "downloaded" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const totalRows = blocks.reduce((s, b) => s + b.rows.length, 0);
    const totalCols = blocks.reduce(
      (s, b) => s + (b.headers.length || 0),
      0,
    );
    return { totalRows, totalCols, channelCount: blocks.length };
  }, [blocks]);

  const exportedAt = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const onDownload = () => {
    const validationError = validateChannelBenchmarkBundle(blocks);
    if (validationError) {
      setError(validationError);
      setConfirmation("error");
      window.setTimeout(() => setConfirmation("idle"), 1500);
      return;
    }
    try {
      const csv = buildChannelBenchmarkCsv(blocks, { exportedAt });
      const filename = channelBenchmarkFilename({ exportedAt });
      downloadBlob(filename, "text/csv", csv);
      setError(null);
      setConfirmation("downloaded");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to build CSV bundle.",
      );
      setConfirmation("error");
    }
    window.setTimeout(() => setConfirmation("idle"), 1500);
  };

  const baseButton =
    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      data-testid="channel-benchmark-export-row"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          One-click CSV bundle
        </span>
        <span className="text-xs text-muted-foreground">
          All {totals.channelCount} channel benchmark tables (Meta, Google,
          TikTok, Organic, Email+SMS, Influencer) in one file —{" "}
          <span
            className="font-mono tabular-nums"
            data-testid="channel-benchmark-export-total-rows"
          >
            {totals.totalRows} rows
          </span>
          ,{" "}
          <span className="font-mono tabular-nums">
            {totals.totalCols} cells
          </span>
          .
        </span>
      </div>
      <div className="flex items-center gap-2">
        {error && (
          <span
            className="text-[10px] text-rose-600 dark:text-rose-400"
            role="alert"
            data-testid="channel-benchmark-export-error"
          >
            {error}
          </span>
        )}
        <button
          type="button"
          onClick={onDownload}
          aria-label="Download all channel benchmarks as a single CSV"
          title="Bundle every channel benchmark table from research/00 § 2 into one CSV"
          className={cn(
            baseButton,
            confirmation === "downloaded"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : confirmation === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          data-testid="channel-benchmark-export-button"
        >
          <span aria-hidden="true">
            {confirmation === "downloaded"
              ? "✓"
              : confirmation === "error"
                ? "!"
                : "↓"}
          </span>
          <span>
            {confirmation === "downloaded"
              ? "Downloaded"
              : confirmation === "error"
                ? "Error"
                : "Export all 6 as CSV"}
          </span>
        </button>
      </div>
    </div>
  );
}