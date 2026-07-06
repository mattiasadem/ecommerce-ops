"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShippedMap,
  formatShippedAt,
  loadShippedPlaybooks,
  saveShippedPlaybooks,
  setShippedNotes,
  toggleShipped,
  clearShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

/**
 * `My shipped playbooks` — interactive progress tracker.
 *
 * Operator sees a progress strip (X of N shipped) above the playbook list.
 * Each playbook card now has a "Mark shipped" toggle that, when on, expands
 * to show a date + a free-form notes field (e.g. "shipped to dev store
 * 2026-07-05; Klaviyo flow live; first 30% lift in week 1").
 *
 * State lives in localStorage (`ecom-ops:shipped-playbooks:v1`) so the
 * tracker survives reloads and is per-browser. A reset-everything button
 * wipes the map after a confirm dialog.
 *
 * Mounted on `/playbooks` above the playbook list. Also used on `/` to
 * render a compact "X / N shipped" progress card via `<ShippedProgressStrip />`.
 */

const PROGRESS_INTENT: Record<
  "starter" | "rolling" | "scaling" | "complete",
  { label: string; tone: string }
> = {
  starter: {
    label: "starter (0–24%)",
    tone: "border-border bg-muted text-muted-foreground",
  },
  rolling: {
    label: "rolling (25–49%)",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  scaling: {
    label: "scaling (50–74%)",
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  complete: {
    label: "complete (75%+)",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

function progressIntent(pct: number): keyof typeof PROGRESS_INTENT {
  if (pct >= 75) return "complete";
  if (pct >= 50) return "scaling";
  if (pct >= 25) return "rolling";
  return "starter";
}

interface PlaybookRow {
  id: string;
  title: string;
}

interface ShippedPlaybooksProps {
  playbooks: PlaybookRow[];
}

/**
 * Full tracker — mounted on `/playbooks`. Shows the progress strip + a
 * "Mark shipped" toggle inline on every playbook card.
 */
export function ShippedPlaybooks({ playbooks }: ShippedPlaybooksProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (server renders with empty map so
  // the markup matches between server and client — no hydration mismatch).
  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveShippedPlaybooks(shipped);
  }, [shipped, hydrated]);

  const shippedCount = useMemo(() => Object.keys(shipped).length, [shipped]);
  const total = playbooks.length;
  const pct = total ? (shippedCount / total) * 100 : 0;
  const intent = progressIntent(pct);

  const onToggle = (id: string) => {
    setShipped((prev) => toggleShipped(prev, id));
  };
  const onNotes = (id: string, notes: string) => {
    setShipped((prev) => setShippedNotes(prev, id, notes));
  };
  const onReset = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      `Reset shipped playbook tracker? This unmarks all ${shippedCount} shipped playbooks.`
    );
    if (!ok) return;
    setShipped(clearShippedPlaybooks());
  };

  return (
    <div className="flex flex-col gap-4">
      <ProgressStrip
        shippedCount={shippedCount}
        total={total}
        pct={pct}
        intent={intent}
        hydrated={hydrated}
        onReset={onReset}
      />

      <div className="flex flex-col gap-3">
        {playbooks.map((p, i) => {
          const entry = shipped[p.id];
          const isShipped = !!entry;
          return (
            <PlaybookRowCard
              key={p.id}
              index={i + 1}
              playbook={p}
              entry={entry ?? null}
              hydrated={hydrated}
              onToggle={() => onToggle(p.id)}
              onNotes={(v) => onNotes(p.id, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ProgressStripProps {
  shippedCount: number;
  total: number;
  pct: number;
  intent: keyof typeof PROGRESS_INTENT;
  hydrated: boolean;
  onReset: () => void;
}

function ProgressStrip({
  shippedCount,
  total,
  pct,
  intent,
  hydrated,
  onReset,
}: ProgressStripProps) {
  const tag = PROGRESS_INTENT[intent];
  return (
    <div
      id="shipped-progress"
      className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-semibold">My shipped playbooks</h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              tag.tone
            )}
          >
            {tag.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
            {hydrated
              ? `${shippedCount} / ${total} shipped · ${pct.toFixed(0)}%`
              : "loading…"}
          </span>
          {hydrated && shippedCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Reset shipped playbook tracker"
            >
              Reset
            </button>
          )}
        </div>
      </header>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            intent === "complete"
              ? "bg-emerald-500"
              : intent === "scaling"
                ? "bg-sky-500"
                : intent === "rolling"
                  ? "bg-amber-500"
                  : "bg-muted-foreground/40"
          )}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Mark a playbook as shipped once it&apos;s live in your store. Add a
        short note (date shipped, Klaviyo flow ID, first CVR delta) so the
        tracker doubles as your deployment log. Persisted to your browser
        only — clearing site data wipes it.
      </p>
    </div>
  );
}

interface PlaybookRowCardProps {
  index: number;
  playbook: PlaybookRow;
  entry: { shippedAt: string; notes?: string } | null;
  hydrated: boolean;
  onToggle: () => void;
  onNotes: (v: string) => void;
}

function PlaybookRowCard({
  index,
  playbook,
  entry,
  hydrated,
  onToggle,
  onNotes,
}: PlaybookRowCardProps) {
  const isShipped = !!entry;
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 transition-colors",
        isShipped ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className="font-mono text-[10px] text-muted-foreground mt-1 shrink-0">
          PB-{String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-[12rem]">
          <div className="text-sm font-medium leading-tight">
            {playbook.title}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            /playbooks/{playbook.id}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isShipped && hydrated && (
            <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Shipped {formatShippedAt(entry!.shippedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={isShipped}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
              isShipped
                ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span aria-hidden="true">{isShipped ? "✓" : "○"}</span>
            <span>{isShipped ? "Shipped" : "Mark shipped"}</span>
          </button>
        </div>
      </div>
      {isShipped && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Optional note (date, Klaviyo flow ID, first CVR delta…)"
            defaultValue={entry?.notes ?? ""}
            onChange={(e) => onNotes(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label={`Notes for ${playbook.id}`}
          />
        </div>
      )}
    </div>
  );
}

interface ProgressCardProps {
  playbooks: PlaybookRow[];
}

/**
 * Compact progress card — mounted on `/` (Overview). Shows shipped / total
 * + the percentage + the progress intent label. Read-only on the Overview
 * page; the full editor lives on `/playbooks`.
 */
export function ShippedProgressStrip({ playbooks }: ProgressCardProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  const shippedCount = Object.keys(shipped).length;
  const total = playbooks.length;
  const pct = total ? (shippedCount / total) * 100 : 0;
  const intent = progressIntent(pct);
  const tag = PROGRESS_INTENT[intent];

  return (
    <a
      href="/playbooks#shipped-progress"
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            tag.tone
          )}
        >
          {tag.label}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {hydrated ? `${shippedCount} / ${total}` : "—"}
        </span>
      </div>
      <div className="text-sm font-medium leading-snug">
        Track which playbooks you&apos;ve shipped
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            intent === "complete"
              ? "bg-emerald-500"
              : intent === "scaling"
                ? "bg-sky-500"
                : intent === "rolling"
                  ? "bg-amber-500"
                  : "bg-muted-foreground/40"
          )}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs text-accent group-hover:underline">
        Open the tracker <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}