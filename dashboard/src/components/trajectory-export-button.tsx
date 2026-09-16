"use client";

import { useEffect, useMemo, useState } from "react";
import {
  projectTrajectory,
  TRAJECTORY_FORMATTERS,
  type TrajectoryProjection,
} from "@/lib/trajectory-projection";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import {
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import {
  buildTrajectoryCsv,
  buildTrajectoryMarkdown,
  trajectoryExportFilename,
} from "@/lib/trajectory-export";
import { cn } from "@/lib/utils";

/**
 * `Trajectory export` — one-click CSV + Markdown downloads of the
 * 12-month revenue projection.
 *
 * Companion to Move #6.16's `TrajectoryPanel`. Closes the operator
 * "paste my curve into Slack / Notion / Linear / email" loop.
 *
 * Two buttons:
 *   - **CSV** — metadata block + 12-row monthly table. Drop into a
 *     spreadsheet to pivot, sort, or filter.
 *   - **MD** — a polished Markdown report (mirror of the in-panel
 *     summary + export footer line).
 *
 * Reads the same canonical localStorage keys as the panel:
 *   - `ecom-ops:your-store:v1`
 *   - `ecom-ops:shipped-playbooks:v1`
 *
 * Cross-tab sync via `storage` event so the export reflects the
 * latest operator state without a page reload.
 *
 * `compact` variant for the Overview card mount (smaller button row);
 * the full toolbar variant for the `/today` mount.
 *
 * Mirrors the canonical `Top10ExportButton` / `ProgressExportButton`
 * visual style so the dashboard's "export" surfaces stay consistent.
 */
export interface TrajectoryExportButtonProps {
  /** When true, render a compact pill row that fits inside an Overview card. */
  compact?: boolean;
}

export function TrajectoryExportButton({
  compact = false,
}: TrajectoryExportButtonProps) {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore());
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const projection: TrajectoryProjection | null = useMemo(
    () => (hydrated ? projectTrajectory(store, shipped) : null),
    [hydrated, store, shipped],
  );

  // Server-side / pre-hydration: render a muted placeholder so the
  // component shape doesn't pop in late.
  if (!hydrated || !projection) {
    return (
      <div
        data-testid="trajectory-export-placeholder"
        className={cn(
          "text-[10px] text-muted-foreground italic",
          compact ? "py-1" : "py-2",
        )}
      >
        Computing trajectory export…
      </div>
    );
  }

  const handleDownload = (ext: "csv" | "md") => {
    const meta = {
      aov: store?.aov ?? YOUR_STORE_DEFAULTS.aov,
      monthlyOrders: store?.monthlyOrders ?? YOUR_STORE_DEFAULTS.monthlyOrders,
      grossMargin: store?.grossMargin ?? YOUR_STORE_DEFAULTS.grossMargin,
      exportedAt: new Date().toISOString().slice(0, 10),
    };
    const body =
      ext === "csv"
        ? buildTrajectoryCsv(projection, meta)
        : buildTrajectoryMarkdown(projection, meta);
    const mime = ext === "csv" ? "text/csv" : "text/markdown";
    const filename = trajectoryExportFilename(ext, meta.exportedAt);
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

  const { fmtMoney } = TRAJECTORY_FORMATTERS;
  const peekProjection = `12 months · baseline ${fmtMoney(projection.baselineMonthlyRevenue)}/mo · Year-1 lift ${fmtMoney(projection.year1LiftLow)}-${fmtMoney(projection.year1LiftHigh)}`;

  return (
    <div
      data-testid="trajectory-export"
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "" : "pt-1",
      )}
    >
      <button
        type="button"
        onClick={() => handleDownload("csv")}
        data-testid="trajectory-export-csv"
        aria-label="Download trajectory as CSV"
        title={`Download 12-month CSV — ${peekProjection}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
      >
        <span aria-hidden="true">↓</span>
        <span>CSV</span>
      </button>
      <button
        type="button"
        onClick={() => handleDownload("md")}
        data-testid="trajectory-export-md"
        aria-label="Download trajectory as Markdown"
        title={`Download 12-month Markdown report — ${peekProjection}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors",
          "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
      >
        <span aria-hidden="true">↓</span>
        <span>MD</span>
      </button>
      <span className="text-[9px] text-muted-foreground italic">
        12-mo trajectory export
      </span>
    </div>
  );
}
