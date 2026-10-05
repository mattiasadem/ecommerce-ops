"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import {
  loadWhatIf,
  NEXT_MOVE_WHAT_IF_STORAGE_KEY,
  NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
  type WhatIfMap,
} from "@/lib/next-move-what-if";
import {
  loadYourStore,
  type YourStoreInputs,
} from "@/lib/your-store";
import {
  buildPlanCalendar,
  buildPlanCalendarWithSroi,
  describeSroiDelta,
  loadPlanStartDate,
  planCalendarToIcs,
  planCalendarToMarkdown,
  planSizeToneClass,
  PLAN_START_STORAGE_KEY,
  PLAN_START_UPDATE_EVENT,
  savePlanStartDate,
  sroiDeltaToneClass,
  type PlanCalendar,
  type PlanCalendarWithSroi,
} from "@/lib/next-move-plan-calendar";
import { formatUsd } from "@/lib/format";

/**
 * `Next-move plan calendar` — Move #N.14 — per-move ship-by date + ICS export
 * for the what-if scenario simulator.
 *
 * Move #N.13's what-if card lets the operator toggle 0..N moves into a
 * hypothetical plan and shows the cumulative lift / SROI delta. What it
 * can't answer is: "OK so WHEN do I ship each move? When's the deadline
 * for Move #3? Can I drag this into Google Calendar?"
 *
 * This card closes that gap:
 *
 *   1. **Plan-start date picker** — operator enters (or accepts the default
 *      = today). Stored in `ecom-ops:next-move-plan-start:v1` (separate
 *      key from the what-if map so editing the start date doesn't
 *      disturb the plan list).
 *
 *   2. **Ship-by timeline** — for every move in the plan (priority-sorted),
 *      a 1-line card showing start → ship-by + days-to-ship + cumulative
 *      days + SROI pill. Mirrors the `runWhatIf` ordering exactly.
 *
 *   3. **Download .ics** — one-click export of a real RFC 5545 file with
 *      one all-day event per move + a master "Plan start" event. Stable
 *      UIDs (keyed by `startDate + moveId`) so re-exports dedupe in the
 *      operator's calendar. Imports into Google / Apple / Outlook.
 *
 *   4. **Copy timeline** — paste-ready markdown with a 6-column table
 *      (#, move, start, ship-by, days, SROI) + plan summary header
 *      (start / final-ship-by / total days / cumulative lift / cost /
 *      SROI delta).
 *
 * Hydration: uses the standard `useState(false)` + `useEffect` mirror
 * so the SSR markup byte-matches the first client render. Pre-hydration
 * the card shows a "Loading calendar…" stub.
 *
 * Cross-tab sync: listens to the what-if map's `storage` event +
 * same-tab `ecom-ops:next-move-what-if:update` event + the plan-start
 * `ecom-ops:next-move-plan-start:update` event. Edits to either the
 * toggle grid (Move #N.13) or the plan-start picker propagate here
 * within ~1 second.
 *
 * Empty state: when the what-if plan is empty, the card shows a
 * "Add a move to your plan first" CTA pointing at the toggle grid.
 */
export function NextMovePlanCalendar() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfMap>({});
  const [planStart, setPlanStart] = useState<string>(() =>
    // Server-render uses today; client mount will replace with stored value.
    new Date().toISOString().slice(0, 10)
  );
  const [hydrated, setHydrated] = useState(false);
  const [downloadHint, setDownloadHint] = useState<string | null>(null);

  // Hydrate on mount.
  useEffect(() => {
    setStore(loadYourStore());
    setWhatIf(loadWhatIf());
    setPlanStart(loadPlanStartDate());
    setHydrated(true);

    function handleStorage(e: StorageEvent) {
      if (e.key && e.key === NEXT_MOVE_WHAT_IF_STORAGE_KEY) {
        setWhatIf(loadWhatIf());
      } else if (e.key && e.key === PLAN_START_STORAGE_KEY) {
        setPlanStart(loadPlanStartDate());
      } else if (e.key && e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore());
      }
    }
    function handleSameTabWhatIf() {
      setWhatIf(loadWhatIf());
    }
    function handleSameTabPlanStart() {
      setPlanStart(loadPlanStartDate());
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
      handleSameTabWhatIf as EventListener
    );
    window.addEventListener(
      PLAN_START_UPDATE_EVENT,
      handleSameTabPlanStart as EventListener
    );
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
        handleSameTabWhatIf as EventListener
      );
      window.removeEventListener(
        PLAN_START_UPDATE_EVENT,
        handleSameTabPlanStart as EventListener
      );
    };
  }, []);

  const cal: PlanCalendar = useMemo(
    () => buildPlanCalendar(whatIf, planStart),
    [whatIf, planStart]
  );
  const calWithSroi: PlanCalendarWithSroi = useMemo(
    () => buildPlanCalendarWithSroi(whatIf, planStart, store ?? undefined),
    [whatIf, planStart, store]
  );

  const planSize = cal.planSize;

  // Hydration-safe stub
  if (!hydrated) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-[11px] text-muted-foreground"
        data-testid="plan-calendar-loading"
      >
        Loading calendar…
      </div>
    );
  }

  // Empty state — no moves in the plan
  if (planSize === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-[11px] text-muted-foreground"
        data-testid="plan-calendar-empty"
      >
        <strong className="font-semibold text-foreground">What-if plan calendar</strong>
        <span> · </span>
        Add at least one move to your plan above to see ship-by dates and the
        downloadable calendar file.
      </div>
    );
  }

  const ics = planCalendarToIcs(cal);
  const md = planCalendarToMarkdown(calWithSroi);

  function downloadIcs() {
    try {
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `what-if-plan-${cal.startDate}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadHint(`Downloaded ${a.download}`);
      setTimeout(() => setDownloadHint(null), 2500);
    } catch {
      setDownloadHint("Download blocked — use Copy .ics instead");
      setTimeout(() => setDownloadHint(null), 3000);
    }
  }

  function onStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    setPlanStart(v);
    savePlanStartDate(v);
  }

  return (
    <div
      className="rounded-lg border border-border bg-card p-3"
      data-testid="plan-calendar-card"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            What-if plan calendar
          </span>
          <Badge
            variant="outline"
            className={cn("text-[9px]", planSizeToneClass(planSize))}
            data-testid="plan-calendar-size"
          >
            {planSize} move{planSize === 1 ? "" : "s"}
          </Badge>
        </div>
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Plan start:</span>
          <input
            type="date"
            value={planStart}
            onChange={onStartDateChange}
            className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] tabular-nums text-foreground"
            data-testid="plan-calendar-start"
          />
        </label>
      </div>

      {/* Summary strip */}
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div
          className="rounded-lg border border-border bg-background/40 p-2"
          data-testid="plan-calendar-final-ship"
        >
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Final ship-by
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            {cal.finalShipByDate ?? "—"}
          </div>
        </div>
        <div
          className="rounded-lg border border-border bg-background/40 p-2"
          data-testid="plan-calendar-total-days"
        >
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Calendar days
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            {cal.totalDays}d
          </div>
        </div>
        <div
          className="rounded-lg border border-border bg-background/40 p-2"
          data-testid="plan-calendar-cumulative-lift"
        >
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Cumulative lift
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            {formatUsd(calWithSroi.cumulativeLiftLowUsd)} –{" "}
            {formatUsd(calWithSroi.cumulativeLiftHighUsd)}/mo
          </div>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2",
            sroiDeltaToneClass(calWithSroi.sroiDeltaUsdPerDay)
          )}
          data-testid="plan-calendar-sroi-delta"
        >
          <div className="text-[9px] uppercase tracking-wider opacity-80">
            Best $/day delta
          </div>
          <div className="text-sm font-semibold tabular-nums mt-0.5">
            {describeSroiDelta(calWithSroi.sroiDeltaUsdPerDay)}
          </div>
        </div>
      </div>

      {/* Timeline — one row per move */}
      <div
        className="mb-3 flex flex-col gap-1"
        data-testid="plan-calendar-timeline"
      >
        {cal.entries.map((entry) => {
          const sroi = calWithSroi.perEntrySroi.find(
            (e) => e.entry.move.id === entry.move.id
          );
          return (
            <div
              key={entry.move.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5"
              data-testid={`plan-calendar-row-${entry.move.id}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                  #{entry.planOrder + 1}
                </span>
                <span className="text-[11px] font-medium truncate">
                  Move #{entry.move.priorityRank} — {entry.move.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] tabular-nums text-muted-foreground">
                <span data-testid={`plan-calendar-start-${entry.move.id}`}>
                  {entry.startDate}
                </span>
                <span>→</span>
                <span
                  className="font-semibold text-foreground"
                  data-testid={`plan-calendar-shipby-${entry.move.id}`}
                >
                  {entry.shipByDate}
                </span>
                <span className="text-[9px]">({entry.move.daysToShip}d)</span>
                {sroi ? (
                  <span
                    className="ml-1 inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums"
                    title={`SROI per move`}
                  >
                    {formatUsd(sroi.sroiUsdPerDay)}/d
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action bar — download .ics + copy timeline */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={downloadIcs}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
          data-testid="plan-calendar-download-ics"
        >
          <span aria-hidden="true">📅</span>
          <span>Download .ics</span>
        </button>
        <CopyButton
          value={md}
          label="Copy timeline"
          className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
        />
        <CopyButton
          value={ics}
          label="Copy .ics"
          className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
        />
        {downloadHint ? (
          <span
            className="text-[10px] text-emerald-700 dark:text-emerald-300"
            data-testid="plan-calendar-download-hint"
          >
            {downloadHint}
          </span>
        ) : null}
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {planSize} event{planSize === 1 ? "" : "s"} · {cal.totalDays}d horizon
        </span>
      </div>

      <div className="mt-2 text-[9px] text-muted-foreground">
        Storage: {PLAN_START_STORAGE_KEY} (start) + {NEXT_MOVE_WHAT_IF_STORAGE_KEY}{" "}
        (plan) · Drag the .ics into Google / Apple / Outlook to add every
        move as a calendar event.
      </div>
    </div>
  );
}
