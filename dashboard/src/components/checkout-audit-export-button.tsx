"use client";

import { useMemo, useState } from "react";
import {
  buildCheckoutAuditCsv,
  buildCheckoutAuditJson,
  checkoutAuditFilename,
  checkoutAuditJsonFilename,
  checkoutAuditSummary,
  validateCheckoutAuditBundle,
  type CheckoutAuditExportPayload,
  type CheckoutAuditInputs,
} from "@/lib/checkout-audit-export";
import { cn } from "@/lib/utils";

/**
 * `Checkout Audit Export Button` — one-click CSV (or JSON) download of
 * the 24 Baymard guideline audit rows into a single file.
 *
 * Closes the operator loop Move #P2 calls out: the `<CheckoutAudit />`
 * component on `/cro` surfaces the per-guideline verdict + score inline
 * + a copy-markdown button, but an operator building a Baymard-style
 * fleet audit spreadsheet wants all 24 guidelines + all 4 statuses
 * (pass/partial/fail/skip) + per-section rollup + scoring math in ONE
 * file so they can pivot across guidelines (sorted by severity,
 * filtered to FAIL status, group-by-section) without copy-pasting
 * between per-section markdown blocks.
 *
 * Layout:
 *   - 14 columns per guideline row (guideline_id, section, section_title,
 *     severity, severity_weight, title, prompt, status, status_point,
 *     weighted_points, max_weighted_points, lift_low_pct, lift_high_pct,
 *     notes)
 *   - 5 per-section rollup rows at the bottom (A..E)
 *   - canonical row order = CHECKOUT_GUIDELINES order (matches the
 *     audit's default order, matches `scripts/checkout_audit_score.py`
 *     GUIDELINES order — no drift between CLI + browser + export)
 *
 * Both CSV and JSON are produced from the SAME pure-logic builder, so
 * swapping between formats is a single click away.
 *
 * Storage: this component is presentation-only — the 24-guideline inputs
 * map is passed in as an `inputs` prop. It reads NOTHING from
 * localStorage on its own; the audit panel owns that state.
 *
 * Mounted on `dashboard/app/cro/page.tsx` immediately after the
 * `<CheckoutAudit />` block, in its own bordered card with the Move #P2
 * framing copy.
 */

interface CheckoutAuditExportButtonProps {
  inputs: CheckoutAuditInputs;
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

export function CheckoutAuditExportButton({
  inputs,
  className,
}: CheckoutAuditExportButtonProps) {
  const [confirmation, setConfirmation] = useState<"idle" | "csv" | "json" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => checkoutAuditSummary(inputs), [inputs]);

  const exportedAt = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const meta = useMemo(
    () => ({ exportedAt }),
    [exportedAt],
  );

  const handleCsv = () => {
    setError(null);
    const err = validateCheckoutAuditBundle(inputs);
    if (err) {
      setError(err);
      setConfirmation("error");
      setTimeout(() => setConfirmation("idle"), 2500);
      return;
    }
    const csv = buildCheckoutAuditCsv(inputs, meta);
    downloadBlob(checkoutAuditFilename(meta), "text/csv", csv);
    setConfirmation("csv");
    setTimeout(() => setConfirmation("idle"), 2000);
  };

  const handleJson = () => {
    setError(null);
    const err = validateCheckoutAuditBundle(inputs);
    if (err) {
      setError(err);
      setConfirmation("error");
      setTimeout(() => setConfirmation("idle"), 2500);
      return;
    }
    const payload: CheckoutAuditExportPayload = buildCheckoutAuditJson(
      inputs,
      meta,
    );
    downloadBlob(
      checkoutAuditJsonFilename(meta),
      "application/json",
      JSON.stringify(payload, null, 2),
    );
    setConfirmation("json");
    setTimeout(() => setConfirmation("idle"), 2000);
  };

  const buttonLabel =
    confirmation === "csv"
      ? "Downloaded CSV"
      : confirmation === "json"
      ? "Downloaded JSON"
      : confirmation === "error"
      ? "Export failed"
      : "Download CSV";

  const jsonLabel =
    confirmation === "json"
      ? "Downloaded JSON"
      : "Download JSON";

  const buttonTone =
    confirmation === "csv"
      ? "border-emerald-500 bg-emerald-500 text-white"
      : confirmation === "error"
      ? "border-rose-500 bg-rose-500 text-white"
      : "border-accent bg-accent text-accent-foreground hover:bg-accent/90";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex flex-col gap-3",
        className,
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-sm font-semibold">
            One-click fleet export · Baymard 24
          </h3>
          <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {totals.totalGuidelines} guidelines · {totals.auditedCount} audited
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {exportedAt}
        </span>
      </header>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Bundles every Baymard guideline (pass/partial/fail/skip status +
        severity-weighted points + expected lift band + operator notes +
        per-section rollup rows) into one CSV or JSON file. Open it in
        Sheets / Excel / Notion DB and group-by section, sort by severity,
        filter to FAIL — without copy-pasting between the inline panels.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCsv}
          className={cn(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            buttonTone,
          )}
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          onClick={handleJson}
          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          {jsonLabel}
        </button>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
          {totals.totalGuidelines} rows · 5 section rollups
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Score
          </div>
          <div className="text-xl font-semibold tabular-nums mt-0.5">
            {totals.score}<span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totals.healthBand}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Audited
          </div>
          <div className="text-xl font-semibold tabular-nums mt-0.5">
            {totals.auditedCount}
            <span className="text-xs text-muted-foreground">
              {" "}/ {totals.totalGuidelines}
            </span>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Lift low %
          </div>
          <div className="text-xl font-semibold tabular-nums text-accent mt-0.5">
            +{totals.cvrLiftLowPct.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Lift high %
          </div>
          <div className="text-xl font-semibold tabular-nums text-accent mt-0.5">
            +{totals.cvrLiftHighPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
