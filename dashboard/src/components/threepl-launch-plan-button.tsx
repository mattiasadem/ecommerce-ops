"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildThreeplLaunchPlan,
  threeplPlanDayDate,
  threeplPlanToMarkdown,
  ThreeplLaunchPlanPayload,
} from "@/lib/threepl-launch-plan";
import { BrandOpsInputs, THREEPL_DEFAULTS, pathLongLabel } from "@/lib/threepl";
import { formatUsd, formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:threepl-path:v1";

/**
 * One-click "Generate 30-day 3PL Migration launch plan" button.
 *
 * Reads the operator's saved BrandOpsInputs from localStorage, overlays
 * the Your-store AOV/orders/margin when present, and produces a
 * paste-ready 30-day markdown checklist grouped into 4 weeks.
 *
 *   W1 — 8-prereq RFQ brief + 3PL shortlist + scoring + reference calls
 *   W2 — 8-SLA-defense contract clauses + WMS build + Triple Whale overlay + 5-touch Klaviyo flows
 *   W3 — Inventory pull + per-region 3PL inbound + soft-launch 10% → 50% → 100% ramp + D-7 readout
 *   W4 — D-21 readout + annual contract re-bid + QBR + 30-day program readout + Path B → C decision
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * No new localStorage key — the plan is derived state. Pasting the
 * markdown into Linear / Notion / Google Cal is the durable artifact.
 */
export function ThreeplLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [savedInputs, setSavedInputs] = useState<Partial<BrandOpsInputs> | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setSavedInputs(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const plan: ThreeplLaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildThreeplLaunchPlan({
      inputs: savedInputs ?? undefined,
      startDate,
    });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(
    () => (plan ? threeplPlanToMarkdown(plan) : ""),
    [plan]
  );

  const copy = async () => {
    if (!markdown) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (!markdown || !plan) return;
    try {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threepl-launch-plan-${plan.startDate}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1500);
    } catch {
      /* ignore */
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border bg-background",
          "px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        )}
      >
        <span aria-hidden>📅</span>
        <span>Generate 30-day launch plan</span>
      </button>

      {open && plan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="30-day 3PL migration launch plan"
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  3PL Migration — 30-day launch plan
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Move #14 · Path{" "}
                  <span className="font-mono">{plan.recommendation.path}</span>{" "}
                  · {plan.recommendation.threeplDefault} ·{" "}
                  {plan.days.length}-day checklist
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="threepl-plan-start"
                  className="block text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Plan start date
                </label>
                <input
                  id="threepl-plan-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium",
                    "transition-colors",
                    copied
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <span aria-hidden>{copied ? "✓" : "📋"}</span>
                  <span>{copied ? "Copied" : "Copy markdown"}</span>
                </button>
                <button
                  type="button"
                  onClick={download}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium",
                    "transition-colors",
                    downloaded
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <span aria-hidden>{downloaded ? "✓" : "⬇"}</span>
                  <span>{downloaded ? "Saved" : "Download .md"}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-4 pt-0 md:grid-cols-2">
              <SnapshotCard plan={plan} />
              <YourStoreCard plan={plan} />
            </div>

            <div className="px-4 pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                30-day checklist
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Each day has a single checkbox-able action. Paste the whole
                block into Linear / Notion / Google Tasks / GitHub Issues —
                ticks remain functional.
              </p>
            </div>

            <ul className="flex flex-col divide-y divide-border px-4 pb-4">
              {plan.days.map((d) => (
                <li key={d.day} className="py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-12 shrink-0">
                      D{d.day.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground w-24 shrink-0">
                      {threeplPlanDayDate(plan.startDate, d.day)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-12 shrink-0">
                      W{d.week}
                    </span>
                    <span className="text-sm font-medium">{d.title}</span>
                  </div>
                  <p className="ml-28 mt-1 text-xs leading-relaxed text-muted-foreground">
                    {d.action}
                  </p>
                  <p className="ml-28 mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Deliverable: <span className="normal-case text-foreground">{d.deliverable}</span>
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-border bg-muted/30 px-4 py-3 text-[10px] text-muted-foreground">
              {plan.days.length}-day · 4-week checklist · Snapshot computed
              from <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>
              {plan.yourStore
                ? ` + Your-store (${plan.yourStore.aov.toFixed(0)} AOV · ${formatInt(plan.yourStore.monthlyOrders)} orders/mo)`
                : " (Your-store not set — using canonical 2,500 orders/mo · $75 AOV defaults)"}
              . Fallback:{" "}
              <code className="rounded bg-muted px-1">{JSON.stringify(THREEPL_DEFAULTS).slice(0, 60)}…</code>
              .
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SnapshotCard({ plan }: { plan: ThreeplLaunchPlanPayload }) {
  const r = plan.recommendation;
  const roiLow = r.year1RoiLow;
  const roiHigh = r.year1RoiHigh;
  const roiStr =
    !Number.isFinite(roiLow) || !Number.isFinite(roiHigh)
      ? "—"
      : roiLow === roiHigh
        ? `${roiLow.toFixed(1)}:1`
        : `${roiLow.toFixed(1)}-${roiHigh.toFixed(1)}:1`;

  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-sm bg-sky-500" />
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Snapshot
        </h4>
      </div>
      <div className="text-sm font-medium leading-snug">
        Path {r.path} · {r.threeplDefault}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Year-1 incremental net
          </div>
          <div className="font-mono tabular-nums">
            ${formatInt(Math.round(r.year1IncrementalNetLow))}–$
            {formatInt(Math.round(r.year1IncrementalNetHigh))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Year-1 ROI
          </div>
          <div className="font-mono tabular-nums">{roiStr}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ship-cost savings
          </div>
          <div className="font-mono tabular-nums">
            {(r.shipCostSavingsPctLow * 100).toFixed(0)}-{(r.shipCostSavingsPctHigh * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ship-time improvement
          </div>
          <div className="font-mono tabular-nums">
            {r.shipTimeImprovementDaysLow.toFixed(1)}-{r.shipTimeImprovementDaysHigh.toFixed(1)} days
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground leading-snug pt-1">
        {pathLongLabel(r.path)}
      </div>
    </div>
  );
}

function YourStoreCard({ plan }: { plan: ThreeplLaunchPlanPayload }) {
  if (plan.yourStore) {
    return (
      <div className="rounded-lg border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Your store overlay
          </h4>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              AOV
            </div>
            <div className="font-mono tabular-nums">
              {formatUsd(plan.yourStore.aov)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Orders/mo
            </div>
            <div className="font-mono tabular-nums">
              {formatInt(plan.yourStore.monthlyOrders)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Gross margin
            </div>
            <div className="font-mono tabular-nums">
              {(plan.yourStore.grossMargin * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Read from <code className="rounded bg-muted px-1">ecom-ops:your-store:v1</code>.
          Same math the calculator on <code className="rounded bg-muted px-1">/3pl</code> uses.
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border border-dashed p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-sm bg-muted-foreground" />
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Your store overlay
        </h4>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">
        Your-store not set. Snapshot uses the canonical 2,500 orders/mo · $75 AOV · 5% international Path B defaults. Set AOV / monthly orders / margin on{" "}
        <a className="underline" href="/settings">
          /settings
        </a>{" "}
        to personalize.
      </p>
    </div>
  );
}