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
import { Bar } from "@/components/bar";
import { type Top10Status } from "@/lib/content";

/**
 * `Top 10 — my shipped moves` — operator-owned progress tracker on
 * `/top-10`. Reuses the same mental model as the per-playbook shipped
 * tracker on `/playbooks`: an operator-owned localStorage map of
 * "things I personally shipped in my store", keyed by a stable move id.
 *
 * Why this is a separate key from `ecom-ops:shipped-playbooks:v1`:
 *   - Top-10 moves are higher-level than playbooks; one move often ties
 *     to multiple playbooks (e.g. "Move #3 — Retention stack" covers
 *     01-cart + 04-welcome + 07-sms + 12-lifecycle). Counting top-10
 *     ships separately prevents the operator from over-counting.
 *   - The build-time `top10.status` array is what the cron tracks. This
 *     is what the operator tracks. Two distinct audiences, two distinct
 *     keys.
 *
 * Storage key:
 *   `ecom-ops:top10-shipped:v1` -> Record<moveId, { shippedAt: ISO }>
 *   moveId = `top10:` + (priorityRank extracted from the move text,
 *   falls back to the move string itself).
 *
 * What it does:
 *   1. Renders the Progress card showing BOTH build-time shipped count
 *      (canonical — the cron writes this) AND the operator's personal
 *      shipped count (this key).
 *   2. Renders each top-10 row with a per-row "Mark shipped" toggle
 *      that writes/clears the operator's localStorage entry on click.
 *   3. Re-renders live as the operator clicks — no submit, no page reload.
 *   4. Fires a `storage`-style event so any other component reading the
 *      same key (e.g. a future Overview "your shipped moves" widget) can
 *      stay in sync. Uses a custom DOM event on `window` so we don't
 *      pollute the localStorage storage-event channel.
 *
 * Why not fire `storage`: storage events only fire in OTHER tabs, not
 * the tab that wrote the key. So this component listens to its own
 * custom `ecom-ops:top10-shipped:update` event AND any future consumer
 * can also listen.
 */
const STORAGE_KEY = "ecom-ops:top10-shipped:v1";
const UPDATE_EVENT = "ecom-ops:top10-shipped:update";

interface ShippedEntry {
  shippedAt: string;
}
type ShippedMap = Record<string, ShippedEntry>;

function loadShipped(): ShippedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: ShippedMap = {};
    for (const [k, v] of Object.entries(parsed as ShippedMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as ShippedEntry).shippedAt !== "string") continue;
      out[k] = { shippedAt: (v as ShippedEntry).shippedAt };
    }
    return out;
  } catch {
    return {};
  }
}

function saveShipped(map: ShippedMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    // Custom DOM event so same-tab consumers (e.g. a future Overview
    // widget) can subscribe without a polling loop.
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { map } }),
    );
  } catch {
    /* quota / private-mode */
  }
}

function toggleShipped(map: ShippedMap, id: string): ShippedMap {
  const next = { ...map };
  if (next[id]) {
    delete next[id];
  } else {
    next[id] = { shippedAt: new Date().toISOString() };
  }
  return next;
}

/**
 * Derive a stable id from a top10 status row. Priority rank comes first
 * (matches the `01-`, `02-`, ... convention in the move text — see
 * research/02-top-10-leverage-moves.md). Falls back to a sanitized
 * version of the move text so unsynced rows still get a stable id.
 */
function moveIdFromStatus(s: Top10Status): string {
  const rankMatch = /#(\d+)/.exec(s.move);
  if (rankMatch && rankMatch[1]) {
    return `top10:#${rankMatch[1]}`;
  }
  // Fallback: slugified move text (first 60 chars).
  const slug = s.move
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `top10:${slug || "unknown"}`;
}

function formatShippedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

/**
 * Renders just the per-row "Mark shipped" toggle + the operator's
 * personal shipped badge. The page owns the row layout; this component
 * slots the interactive bits into the existing markup.
 */
export function Top10RowToggle({ status }: { status: Top10Status }) {
  const id = useMemo(() => moveIdFromStatus(status), [status]);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShipped());
    setHydrated(true);
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ map: ShippedMap }>;
      if (ce.detail && ce.detail.map) setShipped(ce.detail.map);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setShipped(loadShipped());
    };
    window.addEventListener(UPDATE_EVENT, onUpdate as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onUpdate as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isShipped = Boolean(shipped[id]);
  const entry = shipped[id];

  function onToggle() {
    const next = toggleShipped(shipped, id);
    setShipped(next);
    saveShipped(next);
  }

  if (!hydrated) {
    // SSR placeholder — mirrors the unhydrated badge so layout is stable.
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isShipped}
      aria-label={
        isShipped
          ? `Unmark move ${id} as shipped in my store`
          : `Mark move ${id} as shipped in my store`
      }
      data-testid={`top10-toggle-${id}`}
      className={
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors " +
        (isShipped
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
          : "border-border bg-muted text-muted-foreground hover:border-foreground/40 hover:text-foreground")
      }
      title={
        isShipped
          ? `Shipped in your store on ${formatShippedAt(entry!.shippedAt)}. Click to unmark.`
          : "Click to mark as shipped in your store"
      }
    >
      <span aria-hidden="true">{isShipped ? "✓" : "○"}</span>
      <span>{isShipped ? "Shipped by you" : "Mark shipped"}</span>
    </button>
  );
}

/**
 * Renders the Progress card with the canonical shipped count + the
 * operator's personal shipped count side-by-side. Mounted at the top
 * of `/top-10` above the ranked list.
 */
export function Top10ShippedProgress({
  status,
  children,
}: {
  status: Top10Status[];
  children?: React.ReactNode;
}) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShipped());
    setHydrated(true);
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ map: ShippedMap }>;
      if (ce.detail && ce.detail.map) setShipped(ce.detail.map);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setShipped(loadShipped());
    };
    window.addEventListener(UPDATE_EVENT, onUpdate as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onUpdate as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const canonicalShipped = status.filter((s) => s.shipped).length;
  const canonicalPending = status.filter((s) => s.pending).length;
  const total = status.length;
  const myShipped = useMemo(() => {
    const set = new Set<string>();
    for (const s of status) {
      if (shipped[moveIdFromStatus(s)]) set.add(moveIdFromStatus(s));
    }
    return set.size;
  }, [shipped, status]);
  const myPct = total ? (myShipped / total) * 100 : 0;
  const canonicalPct = total ? (canonicalShipped / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress</CardTitle>
        <CardDescription>
          {canonicalShipped} shipped of {total} (cron-canonical) · {canonicalPending}{" "}
          pending.{" "}
          {hydrated ? (
            <>
              <span
                className={
                  myShipped > 0
                    ? "font-medium text-emerald-700 dark:text-emerald-300"
                    : ""
                }
              >
                You: {myShipped} / {total} shipped
              </span>
              {myShipped > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    saveShipped({});
                    setShipped({});
                  }}
                  className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  aria-label="Reset my top-10 shipped tracker"
                >
                  Reset
                </button>
              ) : null}
            </>
          ) : (
            <span>· You: — / {total} shipped (hydrating)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Canonical (cron)</span>
            <span className="tabular-nums">
              {canonicalShipped}/{total} · {canonicalPct.toFixed(0)}%
            </span>
          </div>
          <Bar value={canonicalPct} intent="accent" label="canonical" />
        </div>
        {hydrated ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>You (this browser)</span>
              <span className="tabular-nums">
                {myShipped}/{total} · {myPct.toFixed(0)}%
              </span>
            </div>
            <Bar value={myPct} intent="success" label="you" />
          </div>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}