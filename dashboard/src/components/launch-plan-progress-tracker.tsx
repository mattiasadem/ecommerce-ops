"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LAUNCH_PLAN_CATALOG,
  LaunchPlanProgressMap,
  LaunchPlanProgressSummary,
  buildLaunchPlanProgressRollup,
  crossReferenceRolloutCatalog,
  launchPlanProgressToMarkdown,
  launchPlanRollupHealthTag,
  loadLaunchPlanProgress,
  saveLaunchPlanProgress,
  toggleLaunchPlanDay,
} from "@/lib/launch-plan-progress";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `LaunchPlanProgressTracker` — Interactive + state-persistent tracker
 * for the 10 launch-plan generators.
 *
 * Each plan has 30 days; click a day cell to mark it shipped (or
 * un-shipped). State persists per-browser via the
 * `ecom-ops:launch-plan-progress:v1` localStorage key. The component
 * surfaces:
 *
 *   - **Per-plan progress bar** with W1/W2/W3/W4 breakdown
 *   - **Aggregate rollup** — total days shipped, % complete, realised
 *     Year-1 net margin, band counts
 *   - **Standup-ready markdown export** — copy or download
 *   - **Plan links** — deep-link back to the per-move launch-plan page
 *
 * Hydration-safe: SSR renders the empty-state stub; the client hydrates
 * from localStorage on mount. Cross-tab sync via the `storage` event.
 */

interface LaunchPlanProgressTrackerProps {
  /** Default mode: "compact" = one row per plan; "expanded" = 30-day grid. */
  variant?: "compact" | "expanded";
}

export function LaunchPlanProgressTracker({
  variant = "expanded",
}: LaunchPlanProgressTrackerProps) {
  const [progress, setProgress] = useState<LaunchPlanProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    setProgress(loadLaunchPlanProgress());
    setHydrated(true);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydrated) return;
    saveLaunchPlanProgress(progress);
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("ecom-ops:launch-plan-progress:update", {
            detail: { count: Object.keys(progress).length },
          })
        );
      } catch {
        /* ignore */
      }
    }
  }, [progress, hydrated]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(ev: StorageEvent) {
      if (ev.key === "ecom-ops:launch-plan-progress:v1") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
          setProgress(parsed ?? {});
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rollup = useMemo(
    () => buildLaunchPlanProgressRollup(progress),
    [progress]
  );

  const xref = useMemo(() => crossReferenceRolloutCatalog(), []);

  function handleToggle(planId: string, day: number) {
    setProgress((m) => toggleLaunchPlanDay(m, planId, day));
  }

  function handleResetPlan(planId: string) {
    setProgress((m) => {
      const next = { ...m };
      delete next[planId];
      return next;
    });
  }

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(launchPlanProgressToMarkdown(rollup))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleDownload() {
    if (typeof window === "undefined") return;
    const md = launchPlanProgressToMarkdown(rollup);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-plan-progress-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const healthTag = launchPlanRollupHealthTag(rollup);
  const bandLabel = {
    "all-shipped": "All shipped",
    "on-track": "On track",
    started: "Started",
    untouched: "Untouched",
  }[healthTag];

  return (
    <div className="flex flex-col gap-6">
      {/* Rollup header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rollup</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Days shipped
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {formatInt(rollup.totalCompletedDays)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / {formatInt(rollup.totalDays)}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Completion
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {(rollup.overallCompletionRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Realised Y1 margin
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {formatUsd(rollup.overallRealisedYear1NetMarginUsd)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                of {formatUsd(rollup.overallDefaultYear1NetMarginUsd)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Health
              </span>
              <span className="text-xl font-semibold">{bandLabel}</span>
              <span className="text-[10px] text-muted-foreground">
                {rollup.bandCounts.complete} complete · {rollup.bandCounts.onTrack} on-track ·{" "}
                {rollup.bandCounts.started} started · {rollup.bandCounts.untouched} untouched
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted",
                copied && "border-emerald-500/60 bg-emerald-500/10 text-emerald-700"
              )}
            >
              {copied ? "Copied!" : "Copy markdown rollup"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Download .md
            </button>
            <span className="ml-auto text-[10px] text-muted-foreground">
              Saved to{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:launch-plan-progress:v1
              </code>
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  healthTag === "all-shipped"
                    ? "bg-emerald-500"
                    : healthTag === "on-track"
                    ? "bg-sky-500"
                    : healthTag === "started"
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30"
                )}
                style={{
                  width: `${Math.min(rollup.overallCompletionRatio * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-plan list */}
      <div className="flex flex-col gap-3">
        {rollup.summaries.map((s) => (
          <PlanRow
            key={s.planId}
            summary={s}
            dayMap={progress[s.planId] ?? {}}
            variant={variant}
            onToggle={handleToggle}
            onReset={handleResetPlan}
          />
        ))}
      </div>

      {/* Cross-reference with master rollout catalog */}
      {xref.matched.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Cross-reference with Master Rollout Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            <p>
              {xref.matched.length} of {LAUNCH_PLAN_CATALOG.length} plan IDs
              are also tracked in the Master Rollout Calendar catalog.{" "}
              {xref.missingInMaster.length === 0
                ? "All matched."
                : `${xref.missingInMaster.length} missing from Master Rollout Calendar: ${xref.missingInMaster.join(", ")}.`}
            </p>
            <p className="mt-2">
              Open{" "}
              <Link href="/master-rollout-calendar" className="text-foreground underline">
                /master-rollout-calendar
              </Link>{" "}
              to see the build-order view.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PlanRowProps {
  summary: LaunchPlanProgressSummary;
  dayMap: Record<string, string>;
  variant: "compact" | "expanded";
  onToggle: (planId: string, day: number) => void;
  onReset: (planId: string) => void;
}

function PlanRow({ summary: s, dayMap, variant, onToggle, onReset }: PlanRowProps) {
  const bandColor = {
    complete: "bg-emerald-500",
    "on-track": "bg-sky-500",
    started: "bg-amber-500",
    untouched: "bg-muted-foreground/30",
  }[s.band];

  const bandLabel = {
    complete: "Complete",
    "on-track": "On track",
    started: "Started",
    untouched: "Untouched",
  }[s.band];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm">
            <Link href={s.href} className="hover:underline">
              {s.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Move {s.moveRef}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              s.band === "complete" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
              s.band === "on-track" && "border-sky-500/40 bg-sky-500/10 text-sky-700",
              s.band === "started" && "border-amber-500/40 bg-amber-500/10 text-amber-700"
            )}
          >
            {bandLabel}
          </Badge>
          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
            {s.completedDays} / {s.totalDays} days · {formatUsd(s.realisedYear1NetMarginUsd)} / {formatUsd(s.defaultYear1NetMarginUsd)}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full transition-all", bandColor)}
              style={{ width: `${Math.min(s.completionRatio * 100, 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            {s.weeks.map((w) => (
              <span key={w.week}>
                W{w.week}: {w.completed}/{w.total}
              </span>
            ))}
            {s.firstShippedAt && (
              <span>
                first: {s.firstShippedAt.slice(0, 10)}
              </span>
            )}
            {s.lastShippedAt && (
              <span>last: {s.lastShippedAt.slice(0, 10)}</span>
            )}
          </div>
        </div>
        {variant === "expanded" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: s.totalDays }).map((_, i) => {
              const day = i + 1;
              const shipped = typeof dayMap[String(day)] === "string";
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggle(s.planId, day)}
                  aria-label={`Day ${day} ${shipped ? "shipped" : "not shipped"}`}
                  aria-pressed={shipped}
                  className={cn(
                    "h-7 w-7 rounded-sm border text-[10px] tabular-nums transition-colors",
                    shipped
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                    day % 7 === 0 && "mr-1"
                  )}
                >
                  {day}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onReset(s.planId)}
              className="ml-2 h-7 rounded-sm border border-border bg-background px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Reset
            </button>
          </div>
        )}
      </CardHeader>
      {variant === "compact" && (
        <CardContent className="pt-0">
          <button
            type="button"
            onClick={() => onReset(s.planId)}
            className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Reset this plan
          </button>
        </CardContent>
      )}
    </Card>
  );
}
