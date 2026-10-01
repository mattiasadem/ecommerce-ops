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
import {
  LaunchPlanNotesMap,
  NOTE_MAX_LENGTH,
  buildLaunchPlanProgressWithNotes,
  launchPlanNotesRollupToMarkdown,
  loadLaunchPlanNotes,
  previewLaunchPlanNote,
  saveLaunchPlanNotes,
  setLaunchPlanNote,
  summariseLaunchPlanNotes,
} from "@/lib/launch-plan-progress-notes";
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
  const [notes, setNotes] = useState<LaunchPlanNotesMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notesCopied, setNotesCopied] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    setProgress(loadLaunchPlanProgress());
    setNotes(loadLaunchPlanNotes());
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

  // Persist notes on every change (independent key from progress).
  useEffect(() => {
    if (!hydrated) return;
    saveLaunchPlanNotes(notes);
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("ecom-ops:launch-plan-progress-notes:update", {
            detail: { count: Object.keys(notes).length },
          })
        );
      } catch {
        /* ignore */
      }
    }
  }, [notes, hydrated]);

  // Cross-tab sync — both keys.
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
      } else if (ev.key === "ecom-ops:launch-plan-progress-notes:v1") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
          setNotes(parsed ?? {});
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
    // Also clear notes for the plan so the operator gets a clean slate.
    setNotes((m) => {
      if (!(planId in m)) return m;
      const next = { ...m };
      delete next[planId];
      return next;
    });
  }

  function handleSetNote(planId: string, day: number, note: string) {
    setNotes((m) => setLaunchPlanNote(m, planId, day, note));
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

  function handleCopyNotes() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(launchPlanNotesRollupToMarkdown(notes, progress))
      .then(() => {
        setNotesCopied(true);
        setTimeout(() => setNotesCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleDownloadNotes() {
    if (typeof window === "undefined") return;
    const md = launchPlanNotesRollupToMarkdown(notes, progress);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-plan-ship-notes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const rollup = useMemo(
    () => buildLaunchPlanProgressRollup(progress),
    [progress]
  );

  const notesRollup = useMemo(
    () => summariseLaunchPlanNotes(notes, progress),
    [notes, progress]
  );

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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
            <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Ship notes
              </span>
              <span className="text-xl font-semibold tabular-nums">
                {formatInt(notesRollup.totalNotes)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {notesRollup.plansWithNotes} of {LAUNCH_PLAN_CATALOG.length} plans annotated · 280 chars max per note
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
            <button
              type="button"
              onClick={handleCopyNotes}
              className={cn(
                "rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted",
                notesCopied && "border-emerald-500/60 bg-emerald-500/10 text-emerald-700"
              )}
            >
              {notesCopied ? "Copied!" : "Copy ship-notes rollup"}
            </button>
            <button
              type="button"
              onClick={handleDownloadNotes}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Download notes .md
            </button>
            <span className="ml-auto text-[10px] text-muted-foreground">
              Saved to{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:launch-plan-progress:v1
              </code>{" "}
              +{" "}
              <code className="rounded bg-muted px-1">
                ecom-ops:launch-plan-progress-notes:v1
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
            notesMap={notes[s.planId] ?? {}}
            variant={variant}
            onToggle={handleToggle}
            onSetNote={handleSetNote}
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
  notesMap: Record<string, string>;
  variant: "compact" | "expanded";
  onToggle: (planId: string, day: number) => void;
  onSetNote: (planId: string, day: number, note: string) => void;
  onReset: (planId: string) => void;
}

function PlanRow({
  summary: s,
  dayMap,
  notesMap,
  variant,
  onToggle,
  onSetNote,
  onReset,
}: PlanRowProps) {
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

  const enriched = buildLaunchPlanProgressWithNotes(
    s.planId,
    { [s.planId]: dayMap },
    { [s.planId]: notesMap }
  );

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
            {s.completedDays} / {s.totalDays} days · {formatUsd(s.realisedYear1NetMarginUsd)} / {formatUsd(s.defaultYear1NetMarginUsd)} · {enriched.daysWithNotes} notes
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
              const hasNote = typeof notesMap[String(day)] === "string";
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggle(s.planId, day)}
                  aria-label={`Day ${day} ${shipped ? "shipped" : "not shipped"}${hasNote ? " with note" : ""}`}
                  aria-pressed={shipped}
                  title={
                    hasNote
                      ? `Day ${day}: ${previewLaunchPlanNote(notesMap[String(day)])}`
                      : `Day ${day} ${shipped ? "shipped" : "not shipped"}`
                  }
                  className={cn(
                    "relative h-7 w-7 rounded-sm border text-[10px] tabular-nums transition-colors",
                    shipped
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                    day % 7 === 0 && "mr-1"
                  )}
                >
                  {day}
                  {hasNote && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-1 ring-background"
                    />
                  )}
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
        {variant === "expanded" && enriched.totalShippedDays > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Ship notes</span>
              <span className="text-foreground normal-case tracking-normal">
                {enriched.daysWithNotes} of {enriched.totalShippedDays} ticked day
                {enriched.totalShippedDays === 1 ? "" : "s"} annotated
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground normal-case tracking-normal">
                max {NOTE_MAX_LENGTH} chars per note
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {enriched.days.map((d) => (
                <ShipNoteRow
                  key={d.day}
                  planId={s.planId}
                  day={d.day}
                  shippedAt={d.shippedAt}
                  note={d.note}
                  onSetNote={onSetNote}
                />
              ))}
            </div>
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

interface ShipNoteRowProps {
  planId: string;
  day: number;
  shippedAt: string;
  note: string | null;
  onSetNote: (planId: string, day: number, note: string) => void;
}

function ShipNoteRow({
  planId,
  day,
  shippedAt,
  note,
  onSetNote,
}: ShipNoteRowProps) {
  const [draft, setDraft] = useState<string>(note ?? "");
  const [savedFlash, setSavedFlash] = useState(false);

  // If the persisted note changes externally (storage event / cross-tab),
  // re-sync the local draft.
  useEffect(() => {
    setDraft(note ?? "");
  }, [note, planId, day]);

  const remaining = NOTE_MAX_LENGTH - draft.length;
  const trimmed = draft.length > NOTE_MAX_LENGTH ? draft.slice(0, NOTE_MAX_LENGTH) : draft;

  function commit(value: string) {
    const safe = value.length > NOTE_MAX_LENGTH ? value.slice(0, NOTE_MAX_LENGTH) : value;
    onSetNote(planId, day, safe);
    if (safe.trim().length > 0) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-md border border-border bg-background px-3 py-2 transition-colors",
        savedFlash && "border-emerald-500/60 bg-emerald-500/5"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span className="rounded-sm bg-muted px-1.5 py-0.5 tabular-nums text-foreground">
          Day {day}
        </span>
        <span>shipped {shippedAt.slice(0, 10)}</span>
        <span className="ml-auto tabular-nums">
          {remaining} chars left
        </span>
      </div>
      <textarea
        value={draft}
        rows={2}
        onChange={(e) => setDraft(e.target.value.slice(0, NOTE_MAX_LENGTH))}
        onBlur={() => commit(draft)}
        placeholder={`Why did you ship Day ${day}? (e.g. "guest checkout live in dev; Shop Pay pending review")`}
        className="w-full resize-y rounded-sm border border-border bg-background px-2 py-1.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
        maxLength={NOTE_MAX_LENGTH}
        aria-label={`Note for Day ${day}`}
      />
      {trimmed.trim().length > 0 && (
        <span className="text-[10px] text-emerald-700">
          {savedFlash ? "Saved!" : "Saved to ecom-ops:launch-plan-progress-notes:v1"}
        </span>
      )}
      {trimmed.trim().length === 0 && (
        <span className="text-[10px] text-muted-foreground">
          Leave blank to clear the note (note persists only if non-empty).
        </span>
      )}
    </div>
  );
}
