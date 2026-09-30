"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSubscriptionLaunchPlan,
  subscriptionLaunchPlanDayDate,
  subscriptionLaunchPlanToMarkdown,
  SubscriptionLaunchPlanPayload,
  SUBSCRIPTION_PLAN_SUMMARY,
} from "@/lib/subscription-launch-plan";
import {
  SUBSCRIPTION_DEFAULTS,
  SubscriptionInputs,
  fmtUsd,
} from "@/lib/subscription";
import { formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:subscription-path:v1";

/**
 * One-click "Generate 30-day Subscription Program launch plan" button.
 *
 * Reads the operator's saved `SubscriptionInputs` from localStorage
 * (key `ecom-ops:subscription-path:v1`), overlays the Your-store
 * AOV/orders/margin when present, and produces a paste-ready 30-day markdown
 * checklist grouped into 4 weeks.
 *
 *   W1 - Path picker + Recharge/Skio/Bold/Stay AI install + Subscribe-and-Save widget + Triple Whale cohort LTV
 *   W2 - Discount-tier matrix + Klaviyo welcome/SMS + dunning + customer portal + smart-cancellation + 3PL
 *   W3 - Soft-launch to 10% then 50% then 100% ramp + per-platform subscriber-conversion readouts
 *   W4 - D-7 / D-14 / D-21 subscriber-LTV-multiplier readout + replenishment + winback + 30-day program readout
 *
 * Path-aware: the snapshot block + the W2 build sequence + the W3 ramp
 * cadence + the W4 readouts all reference the operator's Path A / B / C
 * verdict (canonical gate: deferral if consumablesRevenueSharePct < 30%,
 * operator capacity < 2 hr/wk, monthly orders < 200, US GMV < $100k, or
 * monthly churn > 15%).
 *
 * The action: clicking generates -> opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * No new localStorage key - the plan is derived state. Pasting the
 * markdown into Linear / Notion / Google Cal is the durable artifact.
 */
export function SubscriptionLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [savedInputs, setSavedInputs] =
    useState<Partial<SubscriptionInputs> | null>(null);
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

  const plan: SubscriptionLaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildSubscriptionLaunchPlan({
      inputs: savedInputs ?? undefined,
      startDate,
    });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(
    () => (plan ? subscriptionLaunchPlanToMarkdown(plan) : ""),
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
      a.download = `subscription-launch-plan-${plan.startDate}.md`;
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

  const r = plan?.recommendation;
  const roiLow = r ? `${r.canonicalRoi[0].toFixed(1)}:1` : "—";
  const roiHigh = r ? `${r.canonicalRoi[1].toFixed(1)}:1` : "—";

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

      {open && plan && r && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="30-day Subscription Program launch plan"
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Subscription Program - 30-day launch plan
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Move #11 - always-on Subscription Program launch (Recharge +
                  Skio + Bold + Stay AI + Appstle + Seal + Loop multi-platform
                  orchestration) · {plan.days.length}-day checklist
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
                  htmlFor="sub-plan-start"
                  className="block text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Plan start date
                </label>
                <input
                  id="sub-plan-start"
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
                      Path {r.path}
                      {r.isDeferred ? " — DEFER" : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Canonical Year-1 ROI band
                    </div>
                    <div className="font-medium tabular-nums">
                      {roiLow} – {roiHigh}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Year-1 cost stack
                    </div>
                    <div className="font-medium tabular-nums">
                      {fmtUsd(r.year1Cost[0])} – {fmtUsd(r.year1Cost[1])}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Year-1 incremental subscription revenue
                    </div>
                    <div className="font-medium tabular-nums">
                      {fmtUsd(r.year1SubscriptionRevenue[0])} –{" "}
                      {fmtUsd(r.year1SubscriptionRevenue[1])}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Year-1 subscriber count (midpoint)
                    </div>
                    <div className="font-medium tabular-nums">
                      {formatInt(r.midpoint.subscriberCount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">LTV multiplier</div>
                    <div className="font-medium tabular-nums">
                      {r.ltvMultiplier[0]}x – {r.ltvMultiplier[1]}x
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Smart-cancellation recovery
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.smartCancellationRecoveryPct[0]}% –{" "}
                      {r.smartCancellationRecoveryPct[1]}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Dunning recovery
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.dunningRecoveryPct[0]}% – {r.dunningRecoveryPct[1]}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Winback recovery
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.winbackRecoveryPct[0]}% – {r.winbackRecoveryPct[1]}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Subscription share of US GMV
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.subscriptionRevenueSharePct[0]}% –{" "}
                      {r.subscriptionRevenueSharePct[1]}%
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
                {SUBSCRIPTION_PLAN_SUMMARY.totalDays} days ·{" "}
                {SUBSCRIPTION_PLAN_SUMMARY.totalActions} actions
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

void SUBSCRIPTION_DEFAULTS;
void subscriptionLaunchPlanDayDate;