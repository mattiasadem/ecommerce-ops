"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PlanDay,
  PlanSummary,
  generateThirtyDayPlan,
  renderPlanMarkdown,
} from "@/lib/thirty-day-plan";
import { renderPlanIcs, validatePlanIcs } from "@/lib/thirty-day-plan-ics";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { loadShippedPlaybooks } from "@/lib/shipped-playbooks";
import {
  PLAN_HISTORY_MAX_PLANS,
  PLAN_HISTORY_STORAGE_KEY,
  PLAN_HISTORY_UPDATE_EVENT,
  PlanHistoryPayload,
  SavedPlan,
  clearPlanHistory,
  deletePlanFromHistory,
  diffPlans,
  loadPlanHistory,
  persistGeneratedPlan,
} from "@/lib/plan-history";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `30-day plan generator` — cross-page-intelligence on top of Your-store +
 * Shipped-playbooks.
 *
 * One button ("Generate my 30-day plan") that:
 *   1. Reads Your-store (AOV / monthly orders / gross margin) from localStorage
 *      — falls back to YOUR_STORE_DEFAULTS if the operator hasn't visited
 *      Overview yet.
 *   2. Reads Shipped-playbooks — skips already-shipped moves and rebuilds
 *      the 30-day sequence from the remaining queue.
 *   3. Allocates tasks across 30 calendar days with weekend buffer days and
 *      a 3-tasks-per-workday cap.
 *   4. Renders the plan in-browser with a daily breakdown + a summary tile
 *      strip (revenue projection + projected $ lift).
 *   5. Three one-click actions: "Copy markdown" (paste-ready), "Download
 *      .md" (saved as `30-day-plan-YYYY-MM-DD.md`), and "Download .ics"
 *      (saved as `30-day-plan-YYYY-MM-DD.ics` — a valid RFC 5545 file
 *      that imports cleanly into Google Calendar, Apple Calendar, and
 *      Outlook; one VEVENT per workday at 09:00–10:00 local time).
 *
 * Lives on `/30-day-plan` as a one-click action — no inputs to type, no
 * server round-trip, no new dependency.
 */

type PlanState =
  | { kind: "idle" }
  | { kind: "generating" }
  | { kind: "ready"; days: PlanDay[]; summary: PlanSummary; markdown: string; inputs: YourStoreInputs };

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtPercent(n: number): string {
  return `+${(n * 100).toFixed(0)}%`;
}

export function ThirtyDayPlanGenerator() {
  const [plan, setPlan] = useState<PlanState>({ kind: "idle" });
  const [yourStoreDetected, setYourStoreDetected] = useState<boolean | null>(null);
  const [shippedDetected, setShippedDetected] = useState<number | null>(null);
  const [history, setHistory] = useState<PlanHistoryPayload | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [comparePlanId, setComparePlanId] = useState<string | null>(null);

  // On mount, peek at localStorage so the button can advertise what it
  // will personalize from. Don't auto-generate — operators decide when.
  useEffect(() => {
    const stored = loadYourStore();
    setYourStoreDetected(stored !== null);
    const shipped = loadShippedPlaybooks();
    setShippedDetected(Object.keys(shipped).length);
    setHistory(loadPlanHistory());
  }, []);

  // Cross-tab + same-tab sync — react when another tab (or the same tab
  // via another component) writes to the plan-history storage key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLAN_HISTORY_STORAGE_KEY) setHistory(loadPlanHistory());
    };
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ count: number }>;
      setHistory(loadPlanHistory());
      if (ce.detail && typeof ce.detail.count === "number") {
        // no-op — count badge re-derives from history on next render
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(PLAN_HISTORY_UPDATE_EVENT, onUpdate as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PLAN_HISTORY_UPDATE_EVENT, onUpdate as EventListener);
    };
  }, []);

  const inputsLabel = useMemo(() => {
    if (yourStoreDetected === null) return "Checking Your-store…";
    if (yourStoreDetected) return "Using Your-store inputs from Overview";
    return "Will use defaults ($75 AOV · 1,000 orders/mo · 70% margin) — visit Overview to personalize";
  }, [yourStoreDetected]);

  const shippedLabel = useMemo(() => {
    if (shippedDetected === null) return "Checking shipped playbooks…";
    if (shippedDetected === 0) return "0 shipped playbooks detected — full Top-10 sequence";
    return `${shippedDetected} shipped playbook${shippedDetected === 1 ? "" : "s"} detected — will skip + remap`;
  }, [shippedDetected]);

  const generate = () => {
    setPlan({ kind: "generating" });
    // Tiny defer so the button visibly transitions to "generating…".
    setTimeout(() => {
      const stored = loadYourStore();
      const inputs = stored ?? YOUR_STORE_DEFAULTS;
      const shipped = loadShippedPlaybooks();
      const { days, summary } = generateThirtyDayPlan(inputs, shipped);
      const markdown = renderPlanMarkdown(days, summary, inputs);
      setPlan({ kind: "ready", days, summary, markdown, inputs });
      // Persist to history (ring buffer — oldest dropped at MAX_PLANS).
      const { savedId } = persistGeneratedPlan({ inputs, summary, days });
      setLastSavedId(savedId);
      setHistory(loadPlanHistory());
    }, 50);
  };

  const restorePlan = useCallback((saved: SavedPlan) => {
    const markdown = renderPlanMarkdown(saved.days, saved.summary, saved.inputs);
    setPlan({
      kind: "ready",
      days: saved.days,
      summary: saved.summary,
      markdown,
      inputs: saved.inputs,
    });
    setLastSavedId(saved.id);
    setComparePlanId(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const onDeletePlan = useCallback((planId: string) => {
    deletePlanFromHistory(planId);
    setHistory(loadPlanHistory());
    if (comparePlanId === planId) setComparePlanId(null);
  }, [comparePlanId]);

  const onClearHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!history || history.plans.length === 0) return;
    const ok = window.confirm(
      `Clear all ${history.plans.length} saved plan${history.plans.length === 1 ? "" : "s"}? This cannot be undone.`,
    );
    if (!ok) return;
    clearPlanHistory();
    setHistory(loadPlanHistory());
    setLastSavedId(null);
    setComparePlanId(null);
  }, [history]);

  // Currently-displayed plan (SavedPlan shape) — built from the in-page
  // plan state so the diff panel can compare against any saved plan.
  const currentAsSaved = useMemo<SavedPlan | null>(() => {
    if (plan.kind !== "ready" || !lastSavedId) return null;
    return {
      id: lastSavedId,
      savedAt: new Date().toISOString(),
      label: "",
      inputs: plan.inputs,
      summary: plan.summary,
      days: plan.days,
    };
  }, [plan, lastSavedId]);

  const compareTarget = useMemo(() => {
    if (!comparePlanId || !history) return null;
    return history.plans.find((p) => p.id === comparePlanId) ?? null;
  }, [comparePlanId, history]);

  const compareDelta = useMemo(() => {
    if (!currentAsSaved || !compareTarget) return null;
    return diffPlans(compareTarget, currentAsSaved);
  }, [currentAsSaved, compareTarget]);

  const onDownload = () => {
    if (plan.kind !== "ready") return;
    const filename = `30-day-plan-${plan.summary.startDate}.md`;
    const blob = new Blob([plan.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onDownloadIcs = () => {
    if (plan.kind !== "ready") return;
    const ics = renderPlanIcs(plan.days, plan.summary);
    const filename = `30-day-plan-${plan.summary.startDate}.ics`;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Validate the generated .ics in the browser — surfaces any RFC 5545
  // regression before the operator imports it into their calendar.
  const icsValidation = useMemo(() => {
    if (plan.kind !== "ready") return null;
    const ics = renderPlanIcs(plan.days, plan.summary);
    return validatePlanIcs(ics);
  }, [plan]);

  return (
    <div className="flex flex-col gap-4">
      {/* === INPUT-STATUS + GENERATE === */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Your-store inputs
          </div>
          <div className="text-xs font-medium leading-snug">{inputsLabel}</div>
          <a
            href="/"
            className="text-[10px] text-accent hover:underline mt-auto"
          >
            Edit on Overview →
          </a>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Shipped playbooks
          </div>
          <div className="text-xs font-medium leading-snug">{shippedLabel}</div>
          <a
            href="/playbooks#shipped-progress"
            className="text-[10px] text-accent hover:underline mt-auto"
          >
            Update tracker →
          </a>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Output
          </div>
          <div className="text-xs font-medium leading-snug">
            30-day calendar · 4 weeks · markdown + .ics export
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={plan.kind === "generating"}
            className={cn(
              "mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background px-3 py-2 text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            )}
          >
            {plan.kind === "idle" && (
              <>
                <span>Generate my 30-day plan</span>
                <span aria-hidden="true">→</span>
              </>
            )}
            {plan.kind === "generating" && <span>Generating…</span>}
            {plan.kind === "ready" && (
              <>
                <span>Regenerate</span>
                <span aria-hidden="true">↻</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* === SAVED PLAN HISTORY === */}
      <PlanHistoryPanel
        history={history}
        lastSavedId={lastSavedId}
        comparePlanId={comparePlanId}
        currentAsSaved={currentAsSaved}
        compareTarget={compareTarget}
        compareDelta={compareDelta}
        onRestore={restorePlan}
        onDelete={onDeletePlan}
        onClear={onClearHistory}
        onSetCompare={(id) => setComparePlanId((cur) => (cur === id ? null : id))}
        currentInputs={plan.kind === "ready" ? plan.inputs : null}
      />

      {/* === READY: SUMMARY + ACTIONS + CALENDAR === */}
      {plan.kind === "ready" && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryTile
              label="Current monthly revenue"
              value={fmtMoney(plan.summary.projectedMonthlyRevenue)}
              sub={`${plan.inputs.aov.toLocaleString("en-US")} AOV × ${plan.inputs.monthlyOrders.toLocaleString("en-US")} orders`}
              tone="neutral"
            />
            <SummaryTile
              label="Planned moves"
              value={`${plan.summary.plannedCount} / ${plan.summary.plannedCount + plan.summary.shippedCount}`}
              sub={`${plan.summary.shippedCount} already shipped (skipped)`}
              tone="accent"
            />
            <SummaryTile
              label="Projected lift (low)"
              value={fmtPercent(plan.summary.projectedLiftLow)}
              sub={`≈ ${fmtMoney(plan.summary.projectedLiftDollarsLow)}/mo at your AOV × orders`}
              tone="positive"
            />
            <SummaryTile
              label="Projected lift (high)"
              value={fmtPercent(plan.summary.projectedLiftHigh)}
              sub={`≈ ${fmtMoney(plan.summary.projectedLiftDollarsHigh)}/mo at your AOV × orders`}
              tone="positive"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton
              value={plan.markdown}
              label="Copy markdown"
              className="bg-foreground text-background hover:bg-foreground/90"
            />
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider hover:bg-muted transition-colors"
            >
              <span aria-hidden="true">↓</span>
              <span>Download .md</span>
            </button>
            <button
              type="button"
              onClick={onDownloadIcs}
              data-testid="download-ics"
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-accent hover:bg-accent/20 transition-colors"
              title="Import into Google Calendar, Apple Calendar, or Outlook — one VEVENT per workday, 9am–10am"
            >
              <span aria-hidden="true">📅</span>
              <span>Download .ics (calendar)</span>
            </button>
            {icsValidation && (
              <span
                data-testid="ics-validation-pill"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  icsValidation.length === 0
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                )}
                title={
                  icsValidation.length === 0
                    ? "RFC 5545 valid — safe to import"
                    : icsValidation.join("\n")
                }
              >
                <span aria-hidden="true">{icsValidation.length === 0 ? "✓" : "✗"}</span>
                <span>
                  .ics {icsValidation.length === 0 ? "valid" : `${icsValidation.length} issue${icsValidation.length === 1 ? "" : "s"}`}
                </span>
              </span>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">
              Starts {plan.summary.startDate} · 30 days · weekends are catch-up
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Rationale: </span>
            {plan.summary.skipRationale}
          </div>

          <div className="flex flex-col gap-2">
            {plan.days.map((d) => (
              <DayRow key={d.day} day={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "neutral" | "accent" | "positive";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "accent"
      ? "border-accent/40 bg-accent/5"
      : "border-border bg-card";
  return (
    <div className={cn("rounded-lg border p-3 flex flex-col gap-1", toneClass)}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function DayRow({ day }: { day: PlanDay }) {
  const isWeekend = day.tasks.every(
    (t) => t.label.startsWith("Buffer day") || t.label.startsWith("If caught up")
  );
  const movePills = day.moveIds;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex flex-col gap-2",
        isWeekend
          ? "border-border bg-muted/30"
          : "border-border bg-card"
      )}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          Day {String(day.day).padStart(2, "0")}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
          {day.weekday}
        </span>
        <span className="text-xs font-medium">{day.weekLabel}</span>
        {movePills.map((id) => (
          <a
            key={id}
            href={`/playbooks#${id}`}
            className="ml-auto inline-flex items-center rounded-md border border-accent/30 bg-accent/5 px-1.5 py-0.5 text-[10px] font-mono text-accent hover:bg-accent/10 transition-colors"
            title={`Open playbook ${id}`}
          >
            {id}
          </a>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground italic">{day.theme}</div>
      <ul className="space-y-1 text-xs leading-relaxed">
        {day.tasks.map((t, i) => (
          <li key={i} className="flex flex-col gap-0.5">
            <span className="text-foreground">
              <span className="text-muted-foreground mr-1">·</span>
              {t.label}
            </span>
            {t.verify && (
              <span className="text-[10px] text-muted-foreground pl-4">
                ✓ Verify: {t.verify}
              </span>
            )}
            {t.estLift && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 pl-4">
                📈 Expected lift: {t.estLift}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Saved plan history panel
// ---------------------------------------------------------------------------

interface PlanHistoryPanelProps {
  history: PlanHistoryPayload | null;
  lastSavedId: string | null;
  comparePlanId: string | null;
  currentAsSaved: SavedPlan | null;
  compareTarget: SavedPlan | null;
  compareDelta: ReturnType<typeof diffPlans> | null;
  onRestore: (plan: SavedPlan) => void;
  onDelete: (planId: string) => void;
  onClear: () => void;
  onSetCompare: (planId: string) => void;
  currentInputs: YourStoreInputs | null;
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10);
}

function fmtDelta(n: number, money = false): string {
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  const abs = Math.abs(n);
  if (money) return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
  return `${sign}${abs.toLocaleString("en-US")}`;
}

function PlanHistoryPanel({
  history,
  lastSavedId,
  comparePlanId,
  currentAsSaved,
  compareTarget,
  compareDelta,
  onRestore,
  onDelete,
  onClear,
  onSetCompare,
  currentInputs,
}: PlanHistoryPanelProps) {
  // SSR-safe empty state — the panel surfaces only after hydration.
  if (history === null) return null;

  const plans = history.plans;
  const isEmpty = plans.length === 0;

  return (
    <section
      id="plan-history"
      data-testid="plan-history-panel"
      className="rounded-lg border border-border bg-card/40 p-4 flex flex-col gap-3"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold">Saved 30-day plan history</h3>
          <span
            className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums"
            data-testid="plan-history-count"
          >
            {isEmpty
              ? "no plans saved yet — generate one to start"
              : `${plans.length} of ${PLAN_HISTORY_MAX_PLANS} saved`}
          </span>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={onClear}
            data-testid="plan-history-clear"
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-rose-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </header>

      {isEmpty && (
        <p className="text-xs text-muted-foreground italic">
          Every plan you generate is auto-saved here for the next{" "}
          {PLAN_HISTORY_MAX_PLANS} iterations — restore any past plan with one
          click, or pick two to compare side-by-side.
        </p>
      )}

      {!isEmpty && (
        <ul className="flex flex-col gap-1.5" data-testid="plan-history-list">
          {plans.map((p) => {
            const isCurrent = p.id === lastSavedId;
            const isComparing = comparePlanId === p.id;
            const isMatchable =
              currentInputs !== null &&
              p.inputs.aov === currentInputs.aov &&
              p.inputs.monthlyOrders === currentInputs.monthlyOrders &&
              p.inputs.grossMargin === currentInputs.grossMargin;
            return (
              <li
                key={p.id}
                data-testid={`plan-history-row-${p.id}`}
                className={cn(
                  "rounded-md border px-3 py-2 flex flex-wrap items-center gap-2 text-xs",
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border bg-card",
                )}
              >
                <span
                  className="font-mono text-[10px] text-muted-foreground tabular-nums"
                  title={`Saved at ${p.savedAt}`}
                >
                  {fmtDate(p.savedAt)}
                </span>
                {p.label && (
                  <span className="text-[10px] italic text-foreground">
                    — {p.label}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {fmtMoney(p.summary.projectedMonthlyRevenue)}/mo ·{" "}
                  {fmtMoney(p.summary.projectedLiftDollarsLow)}–
                  {fmtMoney(p.summary.projectedLiftDollarsHigh)} lift ·{" "}
                  {p.summary.plannedCount} planned
                </span>
                {isCurrent && (
                  <span className="text-[10px] uppercase tracking-wider rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                    current
                  </span>
                )}
                {isMatchable && !isCurrent && (
                  <span className="text-[10px] uppercase tracking-wider rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
                    same inputs
                  </span>
                )}
                <div className="ml-auto flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSetCompare(p.id)}
                    data-testid={`plan-history-compare-${p.id}`}
                    disabled={!currentAsSaved || isCurrent}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                      isComparing
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-card hover:bg-muted",
                      (!currentAsSaved || isCurrent) && "opacity-50 cursor-not-allowed",
                    )}
                    title={
                      !currentAsSaved
                        ? "Generate or restore a plan first"
                        : isCurrent
                        ? "Already the active plan"
                        : "Toggle side-by-side compare"
                    }
                  >
                    {isComparing ? "Comparing ✓" : "Compare"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestore(p)}
                    data-testid={`plan-history-restore-${p.id}`}
                    disabled={isCurrent}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                      "border-foreground/20 bg-foreground text-background hover:bg-foreground/90",
                      isCurrent && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        window.confirm(
                          `Delete saved plan from ${fmtDate(p.savedAt)}?`,
                        )
                      ) {
                        onDelete(p.id);
                      }
                    }}
                    data-testid={`plan-history-delete-${p.id}`}
                    className="rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compareTarget && compareDelta && currentAsSaved && (
        <div
          data-testid="plan-history-compare-panel"
          className="rounded-md border border-accent/40 bg-accent/5 p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Compare · saved {fmtDate(compareTarget.savedAt)} → current
            </h4>
            <button
              type="button"
              onClick={() => onSetCompare(compareTarget.id)}
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-4">
            <DeltaStat
              label="AOV"
              display={`${currentAsSaved.inputs.aov.toLocaleString("en-US")}`}
              delta={fmtDelta(compareDelta.aovDelta, true)}
              inverse={false}
            />
            <DeltaStat
              label="Monthly orders"
              display={`${currentAsSaved.inputs.monthlyOrders.toLocaleString("en-US")}`}
              delta={fmtDelta(compareDelta.ordersDelta)}
              inverse={false}
            />
            <DeltaStat
              label="Gross margin"
              display={`${(currentAsSaved.inputs.grossMargin * 100).toFixed(0)}%`}
              delta={fmtDelta(Math.round(compareDelta.marginDelta * 1000), false)}
              inverse={false}
            />
            <DeltaStat
              label="Monthly revenue"
              display={fmtMoney(currentAsSaved.summary.projectedMonthlyRevenue)}
              delta={fmtDelta(compareDelta.monthlyRevenueDelta, true)}
              inverse={false}
            />
            <DeltaStat
              label="Lift $ (low)"
              display={fmtMoney(currentAsSaved.summary.projectedLiftDollarsLow)}
              delta={fmtDelta(compareDelta.liftDollarsDeltaLow, true)}
              inverse={false}
            />
            <DeltaStat
              label="Lift $ (high)"
              display={fmtMoney(currentAsSaved.summary.projectedLiftDollarsHigh)}
              delta={fmtDelta(compareDelta.liftDollarsDeltaHigh, true)}
              inverse={false}
            />
            <DeltaStat
              label="Planned moves"
              display={`${currentAsSaved.summary.plannedCount}`}
              delta={fmtDelta(compareDelta.plannedCountDelta)}
              inverse={false}
            />
            <DeltaStat
              label="Already shipped"
              display={`${currentAsSaved.summary.shippedCount}`}
              delta={fmtDelta(compareDelta.shippedCountDelta)}
              inverse={false}
            />
          </dl>
          {compareDelta.startDateChanged && (
            <p className="text-[10px] text-muted-foreground italic">
              ℹ Start date differs ({compareTarget.summary.startDate} →{" "}
              {currentAsSaved.summary.startDate}) — calendar anchor shifted.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function DeltaStat({
  label,
  display,
  delta,
  inverse,
}: {
  label: string;
  display: string;
  delta: string;
  inverse: boolean;
}) {
  // Positive deltas are good for everything in this panel. The `inverse`
  // arg exists for future fields where direction matters (e.g. CAC) — kept
  // as a typed hook so the renderer doesn't drift.
  void inverse;
  const tone =
    delta === "0"
      ? "text-muted-foreground"
      : delta.startsWith("+")
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="tabular-nums">
        <span className="font-medium">{display}</span>{" "}
        <span className={cn("text-[10px]", tone)}>{delta}</span>
      </dd>
    </div>
  );
}