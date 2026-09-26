"use client";

/**
 * `Phased progress tracker` — per-playbook per-step checklist.
 *
 * Operator-owned state for every playbook that has a built-in
 * `## Step-by-step` section. Each playbook row on `/playbooks` collapses
 * to show the canonical phase list with a tickable checkbox. Ticking
 * persists to localStorage (`ecom-ops:playbook-phases:v1`) so the
 * progress survives reloads and is per-browser. A fleet-wide strip at the
 * top reports "X / N phases completed across Y playbooks" with a
 * progress bar + intent label + "Mark all complete on this playbook"
 * and "Reset this playbook" actions.
 *
 * State synthesis with the binary shipped-playbooks tracker
 * (`ecom-ops:shipped-playbooks:v1`):
 *   - A playbook with ALL phases complete but not yet flipped to
 *     "shipped" gets a one-click "Mark shipped now" affordance — the
 *     manual toggle is still required so the operator can attach a note
 *     and a shipped-on date.
 *   - A flipped-to-shipped playbook is excluded from the "needs flip"
 *     reminder (not nag-y).
 *
 * Cross-tab sync via:
 *   1. `storage` event (other tabs updating the same key)
 *   2. `ecom-ops:playbook-phases:update` CustomEvent (same-tab writers
 *      dispatching for in-page listeners e.g. realized-roi panel on `/`).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Playbook, PlaybookPhase } from "@/lib/content";
import {
  PLAYBOOK_PHASES_UPDATE_EVENT,
  PhaseMap,
  clearPlaybookPhases,
  countCompletedPhases,
  countTotalPhases,
  loadPhasedProgress,
  markAllPhases,
  pctComplete,
  progressIntent,
  renderPhasedMarkdown,
  savePhasedProgress,
  togglePhase,
  totalProgressPct,
} from "@/lib/playbook-phases";
import {
  ShippedMap,
  loadShippedPlaybooks,
  toggleShipped,
} from "@/lib/shipped-playbooks";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

interface Props {
  playbooks: Playbook[];
}

// ----- intent styling (mirrors shipped-playbooks tones) -----

const INTENT_TONES: Record<
  "complete" | "scaling" | "rolling" | "starter" | "none",
  string
> = {
  complete:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  scaling:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rolling:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  starter: "border-border bg-muted text-muted-foreground",
  none: "border-border bg-muted text-muted-foreground",
};

function barTone(tone: "complete" | "scaling" | "rolling" | "starter" | "none") {
  switch (tone) {
    case "complete":
      return "bg-emerald-500";
    case "scaling":
      return "bg-sky-500";
    case "rolling":
      return "bg-amber-500";
    default:
      return "bg-muted-foreground/40";
  }
}

// ----- main component -----

export function PhasedProgress({ playbooks }: Props) {
  const [progress, setProgress] = useState<PhaseMap>({});
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — server renders with empty state so
  // SSR markup matches first client render (no hydration mismatch).
  useEffect(() => {
    setProgress(loadPhasedProgress());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Cross-tab sync via storage event.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:playbook-phases:v1") {
        setProgress(loadPhasedProgress());
      }
      if (e.key === "ecom-ops:shipped-playbooks:v1") {
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab listeners (e.g. RealizedRoi on `/`).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ map: PhaseMap }>).detail;
      if (detail && detail.map) setProgress(detail.map);
    };
    window.addEventListener(PLAYBOOK_PHASES_UPDATE_EVENT, onUpdate);
    return () =>
      window.removeEventListener(PLAYBOOK_PHASES_UPDATE_EVENT, onUpdate);
  }, []);

  const playbooksWithPhases = useMemo(
    () => playbooks.filter((p) => (p.phases?.length ?? 0) > 0),
    [playbooks],
  );

  const fleet = useMemo(
    () => totalProgressPct(progress, playbooksWithPhases),
    [progress, playbooksWithPhases],
  );
  const fleetIntent = progressIntent(fleet);

  const totalDonePhases = useMemo(() => {
    let n = 0;
    for (const pb of playbooksWithPhases) {
      n += countCompletedPhases(progress, pb.file.replace(/\.md$/, ""));
    }
    return n;
  }, [progress, playbooksWithPhases]);

  const totalPhasesAll = useMemo(
    () =>
      playbooksWithPhases.reduce(
        (acc, pb) => acc + countTotalPhases(pb),
        0,
      ),
    [playbooksWithPhases],
  );

  const onToggle = useCallback(
    (playbookId: string, phaseId: string) => {
      setProgress((prev) => {
        const next = togglePhase(prev, playbookId, phaseId);
        savePhasedProgress(next);
        return next;
      });
    },
    [],
  );

  const onMarkAll = useCallback((pb: Playbook) => {
    setProgress((prev) => {
      const next = markAllPhases(prev, pb.file.replace(/\.md$/, ""), pb.phases ?? []);
      savePhasedProgress(next);
      return next;
    });
  }, []);

  const onClear = useCallback((pb: Playbook) => {
    setProgress((prev) => {
      const next = clearPlaybookPhases(prev, pb.file.replace(/\.md$/, ""));
      savePhasedProgress(next);
      return next;
    });
  }, []);

  const onFlipShipped = useCallback((pb: Playbook) => {
    const id = pb.file.replace(/\.md$/, "");
    setShipped((prev) => toggleShipped(prev, id));
  }, []);

  const onResetAll = useCallback(() => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `Reset phased progress on every playbook? This unchecks all ${totalDonePhases} ticked phases across ${playbooksWithPhases.length} playbooks.`,
    );
    if (!ok) return;
    setProgress({});
    savePhasedProgress({});
  }, [totalDonePhases, playbooksWithPhases.length]);

  const markdown = useMemo(
    () => renderPhasedMarkdown(progress, playbooksWithPhases),
    [progress, playbooksWithPhases],
  );

  return (
    <div className="flex flex-col gap-4">
      <FleetStrip
        hydrated={hydrated}
        totalDonePhases={totalDonePhases}
        totalPhasesAll={totalPhasesAll}
        fleetPct={fleet}
        fleetIntentLabel={fleetIntent.label}
        fleetIntentTone={fleetIntent.tone}
        playbookCount={playbooksWithPhases.length}
        markdown={markdown}
        onResetAll={onResetAll}
      />

      <div className="flex flex-col gap-2">
        {playbooksWithPhases.map((pb, i) => (
          <PlaybookPhasedRow
            key={pb.file}
            index={i}
            playbook={pb}
            progress={progress}
            isShipped={!!shipped[pb.file.replace(/\.md$/, "")]}
            hydrated={hydrated}
            onToggle={onToggle}
            onMarkAll={onMarkAll}
            onClear={onClear}
            onFlipShipped={onFlipShipped}
          />
        ))}
      </div>
    </div>
  );
}

// ----- fleet-wide progress strip -----

interface FleetStripProps {
  hydrated: boolean;
  totalDonePhases: number;
  totalPhasesAll: number;
  fleetPct: number;
  fleetIntentLabel: string;
  fleetIntentTone: "complete" | "scaling" | "rolling" | "starter" | "none";
  playbookCount: number;
  markdown: string;
  onResetAll: () => void;
}

function FleetStrip({
  hydrated,
  totalDonePhases,
  totalPhasesAll,
  fleetPct,
  fleetIntentLabel,
  fleetIntentTone,
  playbookCount,
  markdown,
  onResetAll,
}: FleetStripProps) {
  const tag = INTENT_TONES[fleetIntentTone];
  return (
    <div
      id="phased-progress"
      className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-semibold">Phased playbook progress</h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              tag,
            )}
          >
            {fleetIntentLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
            {hydrated
              ? `${totalDonePhases} / ${totalPhasesAll} phases · ${fleetPct.toFixed(0)}%`
              : "loading…"}
          </span>
          <CopyButton
            value={markdown}
            label="Copy report"
            className="text-[10px] font-medium uppercase tracking-wider"
          />
          {hydrated && totalDonePhases > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Reset phased progress across every playbook"
            >
              Reset
            </button>
          )}
        </div>
      </header>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barTone(fleetIntentTone))}
          style={{ width: `${Math.max(0, Math.min(100, fleetPct))}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Per-step checkboxes for the {playbookCount} playbooks that have a Step-by-step
        section. Tick each phase as you ship it; the binary &ldquo;Mark shipped&rdquo; toggle
        on the row below stays separate so you can still pin a shipped-on date + note.
        Persisted to your browser only — clearing site data wipes it.
      </p>
    </div>
  );
}

// ----- per-playbook row with collapsible phases -----

interface PlaybookPhasedRowProps {
  index: number;
  playbook: Playbook;
  progress: PhaseMap;
  isShipped: boolean;
  hydrated: boolean;
  onToggle: (playbookId: string, phaseId: string) => void;
  onMarkAll: (playbook: Playbook) => void;
  onClear: (playbook: Playbook) => void;
  onFlipShipped: (playbook: Playbook) => void;
}

function PlaybookPhasedRow({
  index,
  playbook,
  progress,
  isShipped,
  hydrated,
  onToggle,
  onMarkAll,
  onClear,
  onFlipShipped,
}: PlaybookPhasedRowProps) {
  const id = playbook.file.replace(/\.md$/, "");
  const phases = playbook.phases ?? [];
  const done = countCompletedPhases(progress, id);
  const total = phases.length;
  const pct = pctComplete(progress, playbook);
  const intent = progressIntent(pct);
  const allDone = total > 0 && done === total;

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        isShipped
          ? "border-emerald-500/40 bg-emerald-500/5"
          : pct >= 75
            ? "border-emerald-500/30"
            : pct >= 25
              ? "border-amber-500/30"
              : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex flex-wrap items-center gap-3 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
          PB-{String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 min-w-[12rem] text-sm font-medium leading-tight">
          {playbook.title}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            INTENT_TONES[intent.tone],
          )}
        >
          {hydrated ? `${done} / ${total} · ${pct.toFixed(0)}%` : "—"}
        </span>
        {isShipped && (
          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            shipped
          </span>
        )}
        <span className="text-[11px] text-muted-foreground" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border/50 px-4 py-3 flex flex-col gap-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", barTone(intent.tone))}
              style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
              aria-hidden="true"
            />
          </div>
          <ul className="flex flex-col gap-1.5">
            {phases.map((phase: PlaybookPhase) => {
              const checked = !!progress[id]?.[phase.id];
              return (
                <li key={phase.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`phase-${id}-${phase.id}`}
                    checked={checked}
                    onChange={() => onToggle(id, phase.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-emerald-500 focus:ring-1 focus:ring-accent"
                    aria-label={`Mark phase ${phase.heading} complete on ${id}`}
                  />
                  <label
                    htmlFor={`phase-${id}-${phase.id}`}
                    className={cn(
                      "text-xs leading-snug select-none cursor-pointer",
                      checked
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground mr-1">
                      Step {phase.order}
                    </span>
                    {phase.heading}
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onMarkAll(playbook)}
              disabled={allDone}
              className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Mark all phases complete
            </button>
            {done > 0 && (
              <button
                type="button"
                onClick={() => onClear(playbook)}
                className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Reset phases
              </button>
            )}
            <a
              href={`/playbooks/${id}`}
              className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-accent hover:underline"
            >
              Open playbook →
            </a>
            {allDone && !isShipped && hydrated && (
              <button
                type="button"
                onClick={() => onFlipShipped(playbook)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <span aria-hidden="true">✓</span>
                <span>Mark shipped now</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----- compact read-only card for `/` Overview or `/today` -----

interface CompactPhasedProgressProps {
  playbooks: Playbook[];
}

export function PhasedProgressStrip({ playbooks }: CompactPhasedProgressProps) {
  const [progress, setProgress] = useState<PhaseMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadPhasedProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecom-ops:playbook-phases:v1") {
        setProgress(loadPhasedProgress());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const playbooksWithPhases = useMemo(
    () => playbooks.filter((p) => (p.phases?.length ?? 0) > 0),
    [playbooks],
  );
  const pct = totalProgressPct(progress, playbooksWithPhases);
  const intent = progressIntent(pct);
  const tag = INTENT_TONES[intent.tone];

  return (
    <a
      href="/playbooks#phased-progress"
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            tag,
          )}
        >
          {intent.label}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {hydrated ? `${pct.toFixed(0)}%` : "—"}
        </span>
      </div>
      <div className="text-sm font-medium leading-snug">
        Per-phase playbook progress
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barTone(intent.tone))}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs text-accent group-hover:underline">
        Open phased tracker <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}
