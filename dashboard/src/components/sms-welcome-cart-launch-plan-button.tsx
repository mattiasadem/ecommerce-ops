"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSmsWelcomeCartLaunchPlan,
  smsWelcomeCartPlanDayDate,
  smsWelcomeCartPlanToMarkdown,
  SmsWelcomeCartLaunchPlanPayload,
} from "@/lib/sms-welcome-cart-launch-plan";
import {
  SMS_WELCOME_CART_DEFAULTS,
  SmsWelcomeCartInputs,
} from "@/lib/sms-welcome-cart-roi";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:playbooks:sms-wc-roi:v1";

/**
 * One-click "Generate 30-day SMS Welcome + Cart-Abandon launch plan" button.
 *
 * Reads the operator's saved SmsWelcomeCartInputs from localStorage, overlays
 * the Your-store AOV/orders/margin when present, and produces a
 * paste-ready 30-day markdown checklist grouped into 4 weeks.
 *
 *   W1 — Opt-in sources, Postscript + 10DLC, SMS-keyword + opt-in flow
 *   W2 — SMS-1 Welcome + SMS-2 Cart-Soft + SMS-3 Cart-Escalation + SMS-4 Review build
 *   W3 — Soft-launch to 10% → 50% → 100% + baseline reads
 *   W4 — D-21 / D-25 / D-28 / D-30 readouts + iteration backlog
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * No new localStorage key — the plan is derived state. Pasting the
 * markdown into Linear / Notion / Google Cal is the durable artifact.
 */
export function SmsWelcomeCartLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [savedInputs, setSavedInputs] =
    useState<Partial<SmsWelcomeCartInputs> | null>(null);
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

  const plan: SmsWelcomeCartLaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildSmsWelcomeCartLaunchPlan({
      inputs: savedInputs ?? undefined,
      startDate,
    });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(
    () => (plan ? smsWelcomeCartPlanToMarkdown(plan) : ""),
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
      a.download = `sms-welcome-cart-launch-plan-${plan.startDate}.md`;
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
          aria-label="30-day SMS welcome + cart-abandon launch plan"
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  SMS Welcome + Cart-Abandon — 30-day launch plan
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Move #6 · always-on 4-SMS Postscript flow (Welcome + Cart-Soft +
                  Cart-Escalation + Review) · {plan.days.length}-day checklist
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
                  htmlFor="smswc-plan-start"
                  className="block text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Plan start date
                </label>
                <input
                  id="smswc-plan-start"
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
                    <div className="text-muted-foreground">Verdict</div>
                    <div className="font-medium">{plan.forecast.healthBand}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ROI ratio</div>
                    <div className="font-medium tabular-nums">
                      {Number.isFinite(plan.forecast.roiRatio)
                        ? `${plan.forecast.roiRatio.toFixed(1)}×`
                        : "∞"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Orders / month</div>
                    <div className="font-medium tabular-nums">
                      {formatInt(plan.forecast.totalOrders)} orders
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Net revenue</div>
                    <div className="font-medium tabular-nums">
                      {formatUsd(plan.forecast.totalNetRevenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Cart recovery combined
                    </div>
                    <div className="font-medium tabular-nums">
                      {(plan.forecast.cartRecoveryCombinedPct * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Reviews / month
                    </div>
                    <div className="font-medium tabular-nums">
                      {formatInt(plan.forecast.reviewsSubmitted)} reviews
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
                {plan.days.length} days · {PLAN_DAYS_COUNT} actions
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
// Single source of truth lives in sms-welcome-cart-launch-plan.ts.
const PLAN_DAYS_COUNT = 30;

void SMS_WELCOME_CART_DEFAULTS;
void smsWelcomeCartPlanDayDate;