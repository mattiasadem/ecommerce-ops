"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PlanDay,
  PlanSummary,
  generateThirtyDayPlan,
  renderPlanMarkdown,
} from "@/lib/thirty-day-plan";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { loadShippedPlaybooks } from "@/lib/shipped-playbooks";
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
 *   5. Two one-click actions: "Copy markdown" (paste-ready) and "Download
 *      .md" (saved as `30-day-plan-YYYY-MM-DD.md`).
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

  // On mount, peek at localStorage so the button can advertise what it
  // will personalize from. Don't auto-generate — operators decide when.
  useEffect(() => {
    const stored = loadYourStore();
    setYourStoreDetected(stored !== null);
    const shipped = loadShippedPlaybooks();
    setShippedDetected(Object.keys(shipped).length);
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
    }, 50);
  };

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
            30-day calendar · 4 weeks · markdown copy + .md download
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