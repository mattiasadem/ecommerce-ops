"use client";

import { useEffect, useState } from "react";
import {
  LIFECYCLE_FLEET_STORAGE_KEY,
  LIFECYCLE_FLEET_UPDATE_EVENT,
  canonicalFleetFlows,
  sanitizeKpisByFlow,
  summarizeLifecycleFleet,
  type LifecycleFleetSummary,
} from "@/lib/lifecycle-fleet-rollup";
import type { FlowKpis } from "@/lib/lifecycle-flow-health";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `Lifecycle Fleet Rollup` — cross-page intelligence card on `/` Overview.
 *
 * Reads the same KPI snapshot the `/lifecycle` Lifecycle Flow Health Audit
 * writes (`ecom-ops:lifecycle-flow-health:v1`) and surfaces the FLEET
 * health summary in 4 tiles + a "worst 3 flows" list:
 *
 *   - Flow health          (X / 13 scored — PASS / WARN / NEEDS_WORK / FAIL counts)
 *   - At-risk revenue/mo   (sum of revenue over NEEDS_WORK + FAIL flows)
 *   - Est. lost rev band   (low/high $/mo from canonical per-pillar floors)
 *   - Worst 3 flows        (score-asc; ties broken by revenue desc)
 *
 * Empty-state: if no KPIs are stored yet, the card renders a "Audit your 13
 * flows →" CTA pointing at `/lifecycle` instead of zeros. This is the
 * difference between a useful cross-page-intelligence surface and a useless
 * "everything is 0" widget.
 *
 * Hydration: uses the standard `useState(false)` + `useEffect` mirror so the
 * SSR markup byte-matches the first client render (no hydration mismatch on
 * the static `/` page). Listens to both `storage` (cross-tab) and the
 * `ecom-ops:lifecycle-flow-health:update` custom event (same-tab edits from
 * the `/lifecycle` page).
 *
 * Why this isn't wired into Your-store: the rollup's signal is per-flow KPI
 * snapshots (sent / opens / clicks / CVR / unsub / revenue / attribution
 * match) — a completely different shape from AOV / monthlyOrders / margin.
 * Your-store would not have anything meaningful to project onto it. This
 * reads its own dedicated storage key.
 */

const VERDICT_TILE_CLASSES: Record<
  "PASS" | "WARN" | "NEEDS_WORK" | "FAIL",
  string
> = {
  PASS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  WARN: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  NEEDS_WORK: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  FAIL: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const VERDICT_LABEL: Record<"PASS" | "WARN" | "NEEDS_WORK" | "FAIL", string> = {
  PASS: "PASS",
  WARN: "WARN",
  NEEDS_WORK: "NEEDS_WORK",
  FAIL: "FAIL",
};

function shortPillar(pillar: string): string {
  const m: Record<string, string> = {
    P1_browse_abandon: "Browse-abandon",
    P2_winback_sunset: "Winback",
    P3_post_purchase_loyalty: "Post-purchase",
    P4_replenishment: "Replenishment",
    P5_celebratory: "Celebratory",
  };
  return m[pillar] ?? pillar;
}

function emptyState(): LifecycleFleetSummary {
  return summarizeLifecycleFleet({});
}

export function LifecycleFleetRollup() {
  const [hydrated, setHydrated] = useState(false);
  const [summary, setSummary] = useState<LifecycleFleetSummary>(emptyState);

  useEffect(() => {
    const refresh = () => {
      try {
        const raw = window.localStorage.getItem(LIFECYCLE_FLEET_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
        const sanitized = sanitizeKpisByFlow(parsed);
        setSummary(summarizeLifecycleFleet(sanitized));
      } catch {
        // localStorage may be unavailable; keep current summary.
      }
    };
    refresh();
    setHydrated(true);
    function onStorage(e: StorageEvent) {
      if (e.key === LIFECYCLE_FLEET_STORAGE_KEY) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(LIFECYCLE_FLEET_UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LIFECYCLE_FLEET_UPDATE_EVENT, refresh);
    };
  }, []);

  const flowsScored = summary.flowsScored;
  const totalFlows = summary.totalFlows;
  const noData = flowsScored === 0;

  // Top-level badge tone: FAIL dominates, else NEEDS_WORK, else all-OK.
  const cardTone = summary.hasAnyFail
    ? "border-rose-500/40"
    : summary.hasAnyNeedWork
      ? "border-amber-500/40"
      : "border-emerald-500/40";
  const badgeLabel = noData
    ? "Empty"
    : summary.hasAnyFail
      ? `${summary.fail} FAIL`
      : summary.hasAnyNeedWork
        ? `${summary.needWork} needs work`
        : `${summary.pass} PASS · all green`;

  // Estimated lost revenue band text — collapse to single number when low == high.
  const estLostText = (() => {
    const lo = summary.estLostRevenueBand.low;
    const hi = summary.estLostRevenueBand.high;
    if (lo === 0 && hi === 0) return "—";
    if (lo === hi) return formatUsd(lo);
    return `${formatUsd(lo)} – ${formatUsd(hi)}`;
  })();

  return (
    <div
      data-testid="lifecycle-fleet-rollup"
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-background/40 p-4 transition-colors",
        cardTone,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Lifecycle fleet health
          </span>
          <h3 className="text-base font-semibold tracking-tight">
            13 Path-B flows at a glance
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Reads the same KPI snapshot the{" "}
            <a
              href="/lifecycle"
              className="underline hover:text-foreground"
            >
              Lifecycle Flow Health Audit
            </a>{" "}
            writes. Update KPIs there and this card refreshes within ~1 second.
          </p>
        </div>
        <div
          className={cn(
            "rounded-md border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
            noData
              ? "border-border bg-muted text-muted-foreground"
              : summary.hasAnyFail
                ? VERDICT_TILE_CLASSES.FAIL
                : summary.hasAnyNeedWork
                  ? VERDICT_TILE_CLASSES.NEEDS_WORK
                  : VERDICT_TILE_CLASSES.PASS,
          )}
          data-testid="lifecycle-fleet-rollup-badge"
        >
          {badgeLabel}
        </div>
      </div>

      {/* 4-tile metric grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Tile 1: flows scored */}
        <div
          className="flex flex-col gap-0.5 rounded-md border border-border bg-background/60 p-3"
          data-testid="lifecycle-fleet-rollup-scored"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Flows scored
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {hydrated ? flowsScored : 0}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {totalFlows}
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            {noData
              ? "Audit your 13 Path-B flows"
              : `${flowsScored} of ${totalFlows} Path-B flows`}
          </span>
        </div>

        {/* Tile 2: verdict breakdown (PASS / WARN / NEEDS_WORK / FAIL inline) */}
        <div
          className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-3"
          data-testid="lifecycle-fleet-rollup-verdicts"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Verdict mix
          </span>
          <div className="grid grid-cols-4 gap-1 text-center">
            {(["PASS", "WARN", "NEEDS_WORK", "FAIL"] as const).map((v) => (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "text-lg font-semibold tabular-nums",
                    hydrated &&
                      (v === "PASS"
                        ? summary.pass
                        : v === "WARN"
                          ? summary.warn
                          : v === "NEEDS_WORK"
                            ? summary.needWork
                            : summary.fail) > 0
                      ? v === "PASS"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : v === "WARN"
                          ? "text-sky-700 dark:text-sky-400"
                          : v === "NEEDS_WORK"
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-rose-700 dark:text-rose-400"
                      : "text-muted-foreground",
                  )}
                  data-testid={`lifecycle-fleet-rollup-${v.toLowerCase()}-count`}
                >
                  {hydrated
                    ? v === "PASS"
                      ? summary.pass
                      : v === "WARN"
                        ? summary.warn
                        : v === "NEEDS_WORK"
                          ? summary.needWork
                          : summary.fail
                    : 0}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {VERDICT_LABEL[v]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tile 3: at-risk revenue */}
        <div
          className="flex flex-col gap-0.5 rounded-md border border-border bg-background/60 p-3"
          data-testid="lifecycle-fleet-rollup-at-risk"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            At-risk revenue / 30d
          </span>
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums",
              hydrated && summary.atRiskRevenueUsd > 0
                ? "text-rose-700 dark:text-rose-400"
                : "text-muted-foreground",
            )}
          >
            {hydrated ? formatUsd(summary.atRiskRevenueUsd) : "—"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            NEEDS_WORK + FAIL flows
          </span>
        </div>

        {/* Tile 4: est. lost revenue band */}
        <div
          className="flex flex-col gap-0.5 rounded-md border border-border bg-background/60 p-3"
          data-testid="lifecycle-fleet-rollup-est-lost"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Est. lost rev / mo
          </span>
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums",
              hydrated && summary.estLostRevenueBand.high > 0
                ? "text-rose-700 dark:text-rose-400"
                : "text-muted-foreground",
            )}
          >
            {hydrated ? estLostText : "—"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Canonical per-pillar floor
          </span>
        </div>
      </div>

      {/* Worst 3 flows (only when ≥1 at-risk flow exists) */}
      {hydrated && summary.worstFlows.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Worst 3 flows (score asc · revenue tie-break)
          </span>
          <ul className="flex flex-col gap-1.5">
            {summary.worstFlows.map((w) => (
              <li
                key={w.flow_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs"
                data-testid={`lifecycle-fleet-rollup-worst-${w.flow_id}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                      VERDICT_TILE_CLASSES[w.verdict],
                    )}
                  >
                    {w.verdict}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {w.flow_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {shortPillar(w.pillar)} · T{w.tier}
                  </span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Score
                  </span>
                  <span className="font-semibold">{w.score}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Rev
                  </span>
                  <span className="font-semibold">{formatUsd(w.revenue)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span data-testid="lifecycle-fleet-rollup-storage-key">
          Storage: <code className="rounded bg-muted px-1">{LIFECYCLE_FLEET_STORAGE_KEY}</code>
        </span>
        <a
          href="/lifecycle"
          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent/5 hover:border-accent/50 transition-colors"
          data-testid="lifecycle-fleet-rollup-cta"
        >
          {noData
            ? "Audit your 13 flows →"
            : summary.hasAnyNeedWork
              ? "Fix the worst flows →"
              : "Re-audit flows →"}
        </a>
      </div>

      {/* SSR placeholder — keeps the initial server-rendered HTML identical
          to the first client render so React doesn't flag a hydration
          mismatch on the static `/` page. The card flips to live data once
          `useEffect` runs. */}
      {!hydrated && (
        <span data-testid="lifecycle-fleet-rollup-stub" className="sr-only">
          Loading fleet health
        </span>
      )}

      {/* Sanity: the canonical fleet flow list is exposed at module-scope for
          test introspection; this no-op keeps tree-shaking honest about it. */}
      {canonicalFleetFlows().length > 0 && null}
    </div>
  );
}