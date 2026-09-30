"use client";

import { useEffect, useMemo, useState } from "react";
import {
  checkoutAuditPlanDayDate,
  checkoutAuditPlanToMarkdown,
  buildCheckoutAuditLaunchPlan,
  CheckoutAuditLaunchPlanPayload,
} from "@/lib/checkout-audit-launch-plan";
import { CheckoutAuditInputs } from "@/lib/checkout-audit-export";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:cro:checkout-audit:v1";
const UPDATE_EVENT = "ecom-ops:cro:checkout-audit:update";

/**
 * One-click "Generate 30-day Checkout Audit launch plan" button.
 *
 * Reads the operator's saved `CheckoutAuditInputs` from localStorage,
 * scores the audit (same math as `scripts/checkout_audit_score.py` +
 * `dashboard/src/lib/checkout-audit.ts`), and produces a paste-ready
 * 30-day markdown checklist grouped into 4 weeks:
 *
 *   W1 — Severity L baseline + 5 highest-lift fixes (guest checkout,
 *        Shop Pay / Apple Pay / Google Pay, address autocomplete,
 *        single-page checkout, sticky place-order, real shipping cost)
 *   W2 — Severity M fixes (minimum fields, inline validation, BNPL,
 *        payment icons, trust badges, no guest redirect, touch-targets)
 *   W3 — Severity S polish (no password meter, field labels visible,
 *        inline errors, secure-checkout lock, returns link, 16px fonts)
 *   W4 — E5 real-device test, score-after-W3 readout, +CVR-lift proxy,
 *        Move #4 (mobile-PDP) cross-link, 30-day readout deck.
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * Cross-tab sync: listens to the standard `storage` event (so a flip in
 * another tab re-hydrates) and the custom `ecom-ops:cro:checkout-audit:update`
 * event the audit fires after each save (so same-tab edits propagate
 * without remount).
 *
 * Mounted on `/checkout-audit-launch-plan` next to the title and on the
 * `/cro` page next to the audit Export button for at-handbook discovery.
 */
export function CheckoutAuditLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [savedInputs, setSavedInputs] = useState<
    CheckoutAuditInputs | null | undefined
  >(undefined);
  const [startDate, setStartDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setSavedInputs(parsed as CheckoutAuditInputs);
        } else {
          setSavedInputs(null);
        }
      } else {
        setSavedInputs(null);
      }
    } catch {
      setSavedInputs(null);
    }
    setHydrated(true);

    function refresh() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setSavedInputs(parsed as CheckoutAuditInputs);
          }
        }
      } catch {
        /* ignore */
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, []);

  const plan: CheckoutAuditLaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildCheckoutAuditLaunchPlan({
      inputs: savedInputs ?? undefined,
      startDate,
    });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(
    () => (plan ? checkoutAuditPlanToMarkdown(plan) : ""),
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
      a.download = `checkout-audit-launch-plan-${plan.startDate}.md`;
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

  // Snapshot values
  const score = plan?.audit.score ?? 0;
  const band = plan?.audit.healthBand ?? "Missing";
  const liftLowPct = ((plan?.audit.cvrLiftLow ?? 0) * 100).toFixed(1);
  const liftHighPct = ((plan?.audit.cvrLiftHigh ?? 0) * 100).toFixed(1);

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
          aria-label="30-day checkout audit launch plan"
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Checkout Audit — 30-day launch plan
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Move #3 · Baymard 24-guideline Checkout Audit · 4-week
                  implementation plan · {plan.days.length}-day checklist
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
                  htmlFor="checkout-plan-start"
                  className="block text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  Plan start date
                </label>
                <input
                  id="checkout-plan-start"
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
                    <div className="text-muted-foreground">Baymard score</div>
                    <div className="font-medium tabular-nums">
                      {score}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Health band</div>
                    <div className="font-medium truncate" title={band}>
                      {band.split("(")[0].trim()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">
                      Cumulative CVR lift band
                    </div>
                    <div className="font-medium tabular-nums">
                      +{liftLowPct}% to +{liftHighPct}%
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
                {plan.days.length} days · 4 weeks · 30 actions
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

void formatInt;
void formatUsd;