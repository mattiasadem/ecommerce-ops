"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadIkasTrendHistory,
  type IkasTrendSample,
} from "@/components/ikas-trend-strip";
import {
  buildIkasTrendCsv,
  buildIkasTrendMarkdown,
  ikasTrendExportFilename,
} from "@/lib/ikas-trend-export";
import { cn } from "@/lib/utils";

/**
 * `Ikas trend export` — one-click CSV + Markdown downloads of the
 * rolling 12-sample live-revenue trend captured by `<IkasTrendStrip />`.
 *
 * Companion to Move #6.14.b's trend strip. Closes the operator
 * "paste my live trend into Slack / Notion / Linear / email" loop.
 *
 * Two buttons:
 *   - **CSV** — `fetched_at, revenue_30d, order_count_30d, currency,
 *     minutes_since_prev, delta_revenue, delta_orders` columns with a
 *     metadata header block. Drop into a spreadsheet to pivot, sort,
 *     or filter.
 *   - **MD** — a polished Markdown table + direction summary, paste
 *     directly into a Slack thread.
 *
 * Reads the same canonical localStorage key as the strip:
 *   - `ecom-ops:ikas-trend:v1`
 *
 * Cross-tab + same-tab sync via `storage` + `ecom-ops:ikas-trend:update`
 * custom DOM events so the export always reflects the latest sample
 * without a page reload.
 *
 * Mirrors the canonical `TrajectoryExportButton` / `Top10ExportButton`
 * visual style so the dashboard's "export" surfaces stay consistent.
 */
export interface IkasTrendExportButtonProps {
  /** When true, render a compact pill row that fits inside an Overview card. */
  compact?: boolean;
  /** Optional override of the latest-known timestamp from the parent. */
  latestFetchedAt?: string | null;
}

export function IkasTrendExportButton({
  compact = false,
  latestFetchedAt = null,
}: IkasTrendExportButtonProps) {
  const [samples, setSamples] = useState<IkasTrendSample[] | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSamples(loadIkasTrendHistory());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:ikas-trend:v1") {
        setSamples(loadIkasTrendHistory());
      }
    };
    const onCustom = () => setSamples(loadIkasTrendHistory());
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecom-ops:ikas-trend:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecom-ops:ikas-trend:update", onCustom);
    };
  }, []);

  const peekSummary = useMemo(() => {
    if (!samples || samples.length === 0) return "no samples captured";
    if (samples.length === 1) return `${samples.length} sample`;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const delta = last.revenue30dUsd - first.revenue30dUsd;
    const dir = delta > 0.5 ? "↑" : delta < -0.5 ? "↓" : "→";
    return `${samples.length} samples · ${dir} Δ${delta >= 0 ? "+" : ""}${delta.toFixed(0)}`;
  }, [samples]);

  // Server-side / pre-hydration: render a muted placeholder so the
  // component shape doesn't pop in late.
  if (!hydrated || samples === null) {
    return (
      <div
        data-testid="ikas-trend-export-placeholder"
        className={cn(
          "text-[10px] text-muted-foreground italic",
          compact ? "py-1" : "py-2",
        )}
      >
        Computing trend export…
      </div>
    );
  }

  const handleDownload = (ext: "csv" | "md") => {
    const exportedAt = new Date().toISOString().slice(0, 10);
    const meta = {
      exportedAt,
      windowStartAt: samples.length > 0 ? samples[0].fetchedAt : null,
      windowEndAt:
        samples.length > 0
          ? latestFetchedAt ?? samples[samples.length - 1].fetchedAt
          : null,
    };
    const body =
      ext === "csv"
        ? buildIkasTrendCsv(samples, meta)
        : buildIkasTrendMarkdown(samples, meta);
    const mime = ext === "csv" ? "text/csv" : "text/markdown";
    const filename = ikasTrendExportFilename(ext, meta.exportedAt);
    if (typeof document === "undefined") return;
    const blob = new Blob([body], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div
      data-testid="ikas-trend-export"
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "" : "pt-1",
      )}
    >
      <button
        type="button"
        onClick={() => handleDownload("csv")}
        data-testid="ikas-trend-export-csv"
        aria-label="Download Ikas trend as CSV"
        title={`Download trend CSV — ${peekSummary}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          samples.length === 0 && "opacity-50 cursor-not-allowed",
        )}
        disabled={samples.length === 0}
      >
        <span aria-hidden="true">↓</span>
        <span>CSV</span>
      </button>
      <button
        type="button"
        onClick={() => handleDownload("md")}
        data-testid="ikas-trend-export-md"
        aria-label="Download Ikas trend as Markdown"
        title={`Download trend Markdown report — ${peekSummary}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          samples.length === 0 && "opacity-50 cursor-not-allowed",
        )}
        disabled={samples.length === 0}
      >
        <span aria-hidden="true">↓</span>
        <span>MD</span>
      </button>
      <span className="text-[9px] text-muted-foreground italic">
        live-trend export
      </span>
    </div>
  );
}