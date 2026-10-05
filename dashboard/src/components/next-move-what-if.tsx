"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MOVE_RECOMMENDATIONS,
  type MoveRecommendation,
} from "@/lib/next-move";
import {
  type YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { loadShippedPlaybooks, type ShippedMap } from "@/lib/shipped-playbooks";
import {
  type WhatIfMap,
  clearWhatIf,
  describeSroiDelta,
  loadWhatIf,
  NEXT_MOVE_WHAT_IF_STORAGE_KEY,
  NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
  runWhatIf,
  sroiDeltaToneClass,
  toggleWhatIf,
  saveWhatIf,
  whatIfToMarkdown,
} from "@/lib/next-move-what-if";
import {
  type NextMoveSroi,
  formatSroiPerDay,
  sroiToneClass,
} from "@/lib/next-move-sroi";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `Next-move what-if simulator` — Move #N.13.
 *
 * Cross-page-intelligence card that turns the canonical next-move
 * recommender into a planning tool. The operator can toggle 0..N
 * "hypothetical" moves (the ones they plan to ship next), and the
 * card re-computes:
 *   - The post-plan queue (which move will the algorithm recommend
 *     AFTER the operator ships their plan?)
 *   - Cumulative monthly $ lift across the plan
 *   - SROI delta (does the plan consume the high-$/day moves?)
 *   - Top-move-changed badge
 *
 * State lives in `ecom-ops:next-move-what-if:v1`. Cross-tab `storage`
 * event + same-tab `ecom-ops:next-move-what-if:update` CustomEvent.
 *
 * Renders a hydration-safe stub until `hydrated=true` so the SSR
 * markup matches the first client paint.
 */
export function NextMoveWhatIf() {
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [whatIf, setWhatIf] = useState<WhatIfMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setWhatIf(loadWhatIf());
    setHydrated(true);
    function handleStorage(e: StorageEvent) {
      if (e.key && e.key === NEXT_MOVE_WHAT_IF_STORAGE_KEY) {
        setWhatIf(loadWhatIf());
      }
      if (e.key && e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
      if (e.key && e.key === "ecom-ops:your-store:v1") {
        setStore(loadYourStore());
      }
    }
    function handleSameTabWhatIf() {
      setWhatIf(loadWhatIf());
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
      handleSameTabWhatIf as EventListener
    );
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        NEXT_MOVE_WHAT_IF_UPDATE_EVENT,
        handleSameTabWhatIf as EventListener
      );
    };
  }, []);

  const sim = useMemo(
    () => runWhatIf(store, shipped, whatIf),
    [store, shipped, whatIf]
  );

  function handleToggle(moveId: string) {
    const next = toggleWhatIf(whatIf, moveId);
    setWhatIf(next);
    saveWhatIf(next);
  }

  function handleClearAll() {
    clearWhatIf();
    setWhatIf({});
  }

  // Build the candidate pool: all moves, but disable already-shipped ones
  // (so the operator can't double-add a shipped move to the plan).
  const shippedSet = useMemo(
    () => new Set(Object.keys(shipped)),
    [shipped]
  );

  const whatIfSet = useMemo(
    () => new Set(Object.keys(whatIf)),
    [whatIf]
  );

  // Sort candidates by priority rank for the toggle grid.
  const candidateMoves = useMemo(
    () => [...MOVE_RECOMMENDATIONS].sort((a, b) => a.priorityRank - b.priorityRank),
    []
  );

  // Summary markdown for the copy button.
  const summary = useMemo(
    () => whatIfToMarkdown(sim),
    [sim]
  );

  // Quick flag for the "top-move changed" pill.
  const topChanged = sim.topMoveChanged;
  const projectedTop = sim.projected.move;
  const baselineTop = sim.baseline.move;
  const planSize = sim.hypotheticalMoves.length;

  return (
    <div
      className="mt-4 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4"
      data-testid="next-move-what-if"
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Move #N.13 · scenario simulator
          </div>
          <h3 className="text-sm font-semibold mt-1">
            What if I ship these next?
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Toggle the moves you plan to ship. The simulator re-runs the algorithm
            against the merged map (shipped + plan) and shows the projected queue,
            cumulative lift, and SROI delta.
          </p>
        </div>
        {hydrated && planSize > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors"
            data-testid="what-if-clear-all"
            aria-label="Clear all hypothetical moves"
          >
            Clear plan ({planSize})
          </button>
        ) : null}
      </header>

      {/* Empty state — visible until hydrated + no plan */}
      {!hydrated || planSize === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border bg-background/40 p-3 text-[11px] text-muted-foreground"
          data-testid="what-if-empty-state"
        >
          {!hydrated
            ? "Loading your what-if plan…"
            : "No moves in your plan yet — toggle any move below to add it. The simulator re-runs the algorithm against your merged (shipped + planned) map."}
        </div>
      ) : (
        <>
          {/* Plan summary tiles */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Cumulative lift / mo
              </div>
              <div className="text-sm font-semibold tabular-nums mt-0.5 text-emerald-700 dark:text-emerald-300">
                ${Math.round(sim.cumulativeLiftLowUsd).toLocaleString("en-US")}–${Math.round(sim.cumulativeLiftHighUsd).toLocaleString("en-US")}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                across {planSize} planned move{planSize === 1 ? "" : "s"}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Calendar days
              </div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">
                {sim.cumulativeDaysToShip}d
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                serial, no parallelization
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Cost / mo
              </div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">
                ${Math.round(sim.cumulativeCostMidUsd).toLocaleString("en-US")}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                midpoint of low/high band
              </div>
            </div>
            <div
              className={cn(
                "rounded-lg border p-2.5",
                sroiDeltaToneClass(sim.sroiDeltaUsdPerDay)
              )}
              data-testid="what-if-sroi-delta"
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80">
                Best $/day delta
              </div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">
                {describeSroiDelta(sim.sroiDeltaUsdPerDay)}
              </div>
              <div className="text-[9px] opacity-80 mt-0.5">
                {formatSroiPerDay(sim.baselineBestSroiUsdPerDay)} →{" "}
                {formatSroiPerDay(sim.projectedBestSroiUsdPerDay)}
              </div>
            </div>
          </div>

          {/* Top-move-changed banner */}
          {topChanged && projectedTop && baselineTop ? (
            <div
              className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-2.5 text-[11px] text-sky-700 dark:text-sky-300"
              data-testid="what-if-top-changed"
            >
              <strong className="font-semibold">Top pick changes after this plan:</strong>{" "}
              <span className="tabular-nums">Move #{baselineTop.priorityRank}</span>{" "}
              {baselineTop.name} →{" "}
              <span className="tabular-nums">Move #{projectedTop.priorityRank}</span>{" "}
              {projectedTop.name}
            </div>
          ) : projectedTop ? (
            <div
              className="mb-3 rounded-lg border border-border bg-background/40 p-2.5 text-[11px] text-muted-foreground"
              data-testid="what-if-top-unchanged"
            >
              Top pick stays the same after this plan: Move #{projectedTop.priorityRank} — {projectedTop.name}
            </div>
          ) : (
            <div
              className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-700 dark:text-emerald-300"
              data-testid="what-if-all-shipped"
            >
              🎉 All Top-10 moves are in this plan (or already shipped). Re-audit quarterly or branch into Move #11+.
            </div>
          )}
        </>
      )}

      {/* Toggle grid — one button per move, disabled if already shipped */}
      <div className="flex flex-wrap gap-1.5" data-testid="what-if-toggle-grid">
        {candidateMoves.map((m) => {
          const inPlan = whatIfSet.has(m.id);
          const isShipped = shippedSet.has(m.id);
          const sroi = sim.baselineSroiRanking.find((r) => r.moveId === m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => !isShipped && handleToggle(m.id)}
              disabled={isShipped}
              title={
                isShipped
                  ? `Move #${m.priorityRank} already shipped — remove via /playbooks#shipped-progress`
                  : inPlan
                    ? `Remove Move #${m.priorityRank} from plan`
                    : `Add Move #${m.priorityRank} to plan`
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                isShipped
                  ? "border-border bg-muted/30 text-muted-foreground/60 cursor-not-allowed line-through"
                  : inPlan
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-background text-foreground hover:bg-muted"
              )}
              data-testid={`what-if-toggle-${m.id}`}
              aria-pressed={inPlan}
            >
              <span className="tabular-nums">#{m.priorityRank}</span>
              <span>{m.name}</span>
              {sroi ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded border px-1 py-0.5 text-[9px] font-semibold tabular-nums",
                    sroiToneClass(sroi.sroiUsdPerDay)
                  )}
                  title={`SROI ${formatSroiPerDay(sroi.sroiUsdPerDay)}`}
                >
                  {formatSroiPerDay(sroi.sroiUsdPerDay)}
                </span>
              ) : null}
              {isShipped ? <span aria-hidden="true">✓</span> : inPlan ? <span aria-hidden="true">−</span> : <span aria-hidden="true">+</span>}
            </button>
          );
        })}
      </div>

      {/* Copy summary */}
      {planSize > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton
            value={summary}
            label="Copy plan"
            className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
          />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            Storage: {NEXT_MOVE_WHAT_IF_STORAGE_KEY}
          </span>
        </div>
      ) : null}
    </div>
  );
}
