"use client";

import { useMemo, useState } from "react";
import {
  buildLifecycleFlowAuditCsv,
  buildLifecycleFlowAuditJson,
  lifecycleFlowAuditFilename,
  lifecycleFlowAuditJsonFilename,
  lifecycleFlowAuditSummary,
  validateLifecycleFlowAuditBundle,
  type LifecycleFlowExportPayload,
} from "@/lib/lifecycle-flow-export";
import type { FlowKpis } from "@/lib/lifecycle-flow-health";
import { cn } from "@/lib/utils";

/**
 * `Lifecycle Flow Audit Export Button` — one-click CSV (or JSON) download
 * of the 13 Path-B lifecycle-flow audit rows into a single file.
 *
 * Closes the operator loop Move #P2 calls out: the
 * `<LifecycleFlowHealthAudit />` component on `/lifecycle` surfaces the
 * per-flow verdict + score inline + a copy-markdown button, but an
 * operator building a fleet-wide Klaviyo audit spreadsheet wants all 13
 * flows + all 6 per-gate pass/fail columns in ONE file so they can pivot
 * across flows (sorted by score, filtered to FAIL tier, etc.) without
 * copy-pasting between per-flow markdown blocks.
 *
 * Layout:
 *   - 23 columns per row (flow_id + flow_name + pillar + tier + channel
 *     + scored + score + verdict + gates_passed + gates_failed + A..F
 *     pass/fail + 7 KPI inputs)
 *   - canonical row order = PATH_B_FLOWS order (matches the audit's
 *     default order, matches `scripts/lifecycle_flow_health_check.py`
 *     row order — no drift between CLI + browser + export)
 *
 * Both CSV and JSON are produced from the SAME pure-logic builder, so
 * swapping between formats is a single click away.
 *
 * Storage: this component is presentation-only — the 13-flow KPI map is
 * passed in as a `kpisByFlow` prop. It reads NOTHING from localStorage
 * on its own; the audit panel owns that state.
 *
 * Mounted on `dashboard/app/lifecycle/page.tsx` immediately after the
 * `<LifecycleFlowHealthAudit />` block, in its own bordered card with
 * the Move #P2 framing copy.
 */

interface LifecycleFlowExportButtonProps {
  kpisByFlow: Record<string, FlowKpis>;
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

export function LifecycleFlowExportButton({
  kpisByFlow,
  className,
}: LifecycleFlowExportButtonProps) {
  const [confirmation, setConfirmation] = useState<"idle" | "csv" | "json" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => lifecycleFlowAuditSummary(kpisByFlow), [kpisByFlow]);

  const exportedAt = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  function onDownload(kind: "csv" | "json"): void {
    const validationError = validateLifecycleFlowAuditBundle(kpisByFlow);
    if (validationError) {
      setError(validationError);
      setConfirmation("error");
      window.setTimeout(() => setConfirmation("idle"), 2000);
      return;
    }
    try {
      if (kind === "csv") {
        const csv = buildLifecycleFlowAuditCsv(kpisByFlow, { exportedAt });
        const filename = lifecycleFlowAuditFilename({ exportedAt });
        downloadBlob(filename, "text/csv", csv);
      } else {
        const json: LifecycleFlowExportPayload = buildLifecycleFlowAuditJson(
          kpisByFlow,
          { exportedAt },
        );
        const filename = lifecycleFlowAuditJsonFilename({ exportedAt });
        downloadBlob(filename, "application/json", `${JSON.stringify(json, null, 2)}\n`);
      }
      setError(null);
      setConfirmation(kind);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to build export bundle.",
      );
      setConfirmation("error");
    }
    window.setTimeout(() => setConfirmation("idle"), 2000);
  }

  const baseBtn =
    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3",
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      data-testid="lifecycle-flow-audit-export-row"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          One-click fleet export
        </span>
        <span className="text-xs text-muted-foreground">
          All {totals.totalFlows} Path-B lifecycle flows ({totals.scoredFlows}{" "}
          scored, {totals.totalFlows - totals.scoredFlows} unscored) + 6
          gate-columns (A–F) + raw KPI inputs in one file — paste into a
          spreadsheet for fleet-wide pivoting.
        </span>
        {error && (
          <span className="text-[10px] text-rose-700 dark:text-rose-400">
            {error}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onDownload("csv")}
          className={cn(
            baseBtn,
            confirmation === "csv"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-accent bg-accent/10 text-accent hover:bg-accent/20",
          )}
          data-testid="lifecycle-flow-export-csv"
        >
          {confirmation === "csv" ? "Downloaded ✓" : "Download CSV"}
        </button>
        <button
          type="button"
          onClick={() => onDownload("json")}
          className={cn(
            baseBtn,
            confirmation === "json"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
          data-testid="lifecycle-flow-export-json"
        >
          {confirmation === "json" ? "Downloaded ✓" : "Download JSON"}
        </button>
      </div>
    </div>
  );
}
