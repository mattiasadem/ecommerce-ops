"use client";

import { useEffect, useMemo, useState } from "react";
import {
  planToMarkdown,
  buildLaunchPlan,
  LaunchPlanPayload,
  dayDate,
} from "@/lib/pdp-ab-launch-plan";
import { PDP_AB_TEST_DEFAULTS } from "@/lib/pdp-ab-test";
import { formatAnnualizedRatio } from "@/lib/pdp-ab-test";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ecom-ops:playbooks:pdp-ab:v1";

/**
 * One-click "Generate 30-day PDP A/B launch plan" button.
 *
 * Reads the operator's saved PdpAbTest inputs from localStorage, overlays
 * the Your-store AOV/orders/margin when present, and produces a
 * paste-ready 30-day markdown checklist grouped into 4 weeks.
 *
 *   W1 — Tools, hypothesis backlog, baseline
 *   W2 — Variant build, QA, instrumentation
 *   W3 — Test #1 launch + monitoring
 *   W4 — Test #1 readout + Test #2 kickoff + 30-day program readout
 *
 * The action: clicking generates → opens a modal with a copy-to-clipboard
 * + download-as-markdown button. Closes on Escape or backdrop click.
 *
 * No new localStorage key — the plan is derived state. Pasting the
 * markdown into Linear / Notion / Google Cal is the durable artifact.
 */
export function PdpAbLaunchPlanButton() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // First-paint ⇒ load saved PDP inputs (so the "snapshot" block in the
  // modal reflects the operator's real numbers, not the always-defaults).
  const [savedInputs, setSavedInputs] =
    useState<Partial<typeof PDP_AB_TEST_DEFAULTS> | null>(null);
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

  const plan: LaunchPlanPayload | null = useMemo(() => {
    if (!hydrated) return null;
    return buildLaunchPlan({ inputs: savedInputs ?? undefined, startDate });
  }, [hydrated, savedInputs, startDate]);

  const markdown = useMemo(() => (plan ? planToMarkdown(plan) : ""), [plan]);

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
    if (!markdown) return;
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pdp-ab-launch-plan-${startDate}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1500);
    } catch {
      setDownloaded(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="pdp-ab-launch-plan-open"
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors"
        )}
      >
        <span aria-hidden="true">▦</span>
        <span>Generate 30-day launch plan</span>
      </button>

      {open && plan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdp-ab-launch-plan-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Move #9.5 · One-click action
                </span>
                <h3
                  id="pdp-ab-launch-plan-title"
                  className="text-base font-semibold leading-tight"
                >
                  30-day PDP A/B launch plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Day-by-day checklist grouped into 4 weeks of work. Paste into Linear, Notion, Google Cal, or your project channel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                ✕
              </button>
            </header>

            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 text-xs">
              <label className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </label>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Verdict
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    plan.forecast.program.healthBandShort === "great"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : plan.forecast.program.healthBandShort === "good"
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : plan.forecast.program.healthBandShort === "fair"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  )}
                >
                  {plan.forecast.program.healthBandShort} · {formatAnnualizedRatio(plan.forecast.program.annualizedRatio)} ann.
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Days
                </span>
                <span className="text-sm font-semibold tabular-nums">{plan.days.length}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  data-testid="pdp-ab-launch-plan-copy"
                  className={cn(
                    "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    copied
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {copied ? "Copied ✓" : "Copy markdown"}
                </button>
                <button
                  type="button"
                  onClick={download}
                  data-testid="pdp-ab-launch-plan-download"
                  className={cn(
                    "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    downloaded
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-foreground bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {downloaded ? "Downloaded ✓" : "Download .md"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre
                data-testid="pdp-ab-launch-plan-md"
                className="whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 text-[11px] leading-relaxed font-mono"
              >
                {markdown}
              </pre>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Day-by-day mapping: Day 1 = {dayDate(plan.startDate, 1)} · Day 30 = {dayDate(plan.startDate, 30)}.
                All 30 days span 4 weeks (W1=Days 1-7, W2=Days 8-14, W3=Days 15-21, W4=Days 22-30).
                {plan.yourStore ? " Numbers reflect Your-store + your saved PDP inputs." : " No Your-store yet — using calculator defaults."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
