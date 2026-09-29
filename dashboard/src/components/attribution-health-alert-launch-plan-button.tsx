"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildAttributionHealthAlertLaunchPlan,
  attributionHealthAlertPlanDayDate,
  attributionHealthAlertPlanToMarkdown,
  AttributionHealthAlertLaunchPlanPayload,
  ATTRIBUTION_HEALTH_ALERT_PLAN_SUMMARY,
} from "@/lib/attribution-health-alert-launch-plan";
import {
  ATTRIBUTION_ALERT_DEFAULTS,
  AttributionAlertInputs,
} from "@/lib/attribution-health-alert";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:playbooks:attribution-alert:v1";

/**
 * One-click "Generate 30-day Attribution-Health Alert launch plan" button.
 *
 * Reads the operator's saved `AttributionAlertInputs` from localStorage
 * (key `ecom-ops:playbooks:attribution-alert:v1`), overlays the Your-store
 * AOV/orders/margin when present, and produces a paste-ready 30-day markdown
 * checklist grouped into 4 weeks.
 *
 *   W1 — Baseline + Move #6.8 pre-flight + 13-field payload contract
 *   W2 — Webhook / Slack / Linear / PagerDuty build + payload shape
 *   W3 — Soft-launch to 10% → 50% → 100% + per-channel readout
 *   W4 — D-7 / D-14 / D-21 readouts + attribution-recovery audit + iteration backlog
 *
 * Path-aware: the snapshot block + the W2 build sequence + the W3 ramp
 * cadence all reference the operator's Path A / B / C / D / E verdict
 * (Path E defers the whole plan with a "DEFER" snapshot block).
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * No new localStorage key — the plan is derived state. Pasting the
 * markdown into Linear / Notion / Google Cal is the durable artifact.
 */
export function AttributionHealthAlertLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [savedInputs, setSavedInputs] =
    useState<Partial<AttributionAlertInputs> | null>(null);
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

  const plan: AttributionHealthAlertLaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildAttributionHealthAlertLaunchPlan({
      inputs: savedInputs ?? undefined,
      startDate,
    });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(
    () => (plan ? attributionHealthAlertPlanToMarkdown(plan) : ""),
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
      a.download = `attribution-health-alert-launch-plan-${plan.startDate}.md`;
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

  const f = plan?.forecast;
  const roiLow = f && Number.isFinite(f.year1NetRoiLow) ? `${f.year1NetRoiLow.toFixed(1)}:1` : "∞";
  const roiHigh = f && Number.isFinite(f.year1NetRoiHigh) ? `${f.year1NetRoiHigh.toFixed(1)}:1` : "∞";

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

      {open && plan && f && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="30-day Attribution-Health Alert launch plan"
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Attribution-Health Alert — 30-day launch plan
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Move #6.10 · always-on attribution-health alert webhook
                  dispatcher (Slack + Linear + PagerDuty + Opsgenie) ·{" "}
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
                  htmlFor="aha-plan-start"
                  className="block text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Plan start date
                </label>
                <input
                  id="aha-plan-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Snapshot
                </p>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Path verdict</div>
                    <div className="font-medium">
                      {plan.path} — {plan.pathLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Year-1 net ROI</div>
                    <div className="font-medium tabular-nums">
                      {roiLow} – {roiHigh}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Year-1 cost stack
                    </div>
                    <div className="font-medium tabular-nums">
                      {formatUsd(f.year1CostLow)} – {formatUsd(f.year1CostHigh)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Avoided incidents / yr
                    </div>
                    <div className="font-medium tabular-nums">
                      {formatInt(f.year1AvoidedIncidentsLow)} –{" "}
                      {formatInt(f.year1AvoidedIncidentsHigh)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Alert cadence</div>
                    <div className="font-medium tabular-nums">
                      {f.alertCadence}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cooldown</div>
                    <div className="font-medium tabular-nums">
                      {f.cooldownSecondsRecommended.toLocaleString("en-US")}s
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-y border-border bg-muted/30 px-4 py-3">
              <button
                type="button"
                onClick={copy}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5",
                  "text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                )}
              >
                {copied ? "✓ Copied" : "📋 Copy markdown"}
              </button>
              <button
                type="button"
                onClick={download}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border bg-background",
                  "px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                )}
              >
                {downloaded ? "✓ Downloaded" : "⬇ Download .md"}
              </button>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {ATTRIBUTION_HEALTH_ALERT_PLAN_SUMMARY.totalDays} days ·{" "}
                {ATTRIBUTION_HEALTH_ALERT_PLAN_SUMMARY.totalActions} actions
              </span>
            </div>

            <div className="p-4">
              <pre className="max-h-[44vh] overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed">
                {markdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mirror the canonical PLAN_DAYS count for the summary badge in the modal.
// Single source of truth lives in attribution-health-alert-launch-plan.ts.
const PLAN_DAYS_COUNT = 30;

void ATTRIBUTION_ALERT_DEFAULTS;
void attributionHealthAlertPlanDayDate;