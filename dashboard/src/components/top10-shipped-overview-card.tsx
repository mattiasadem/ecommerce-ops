"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar } from "@/components/bar";
import { type Top10Status } from "@/lib/content";

/**
 * `Top 10 shipped by you` — Overview-page companion to the
 * `/top-10` per-row "Mark shipped" toggle.
 *
 * Reads the SAME localStorage key the `/top-10` page writes to
 * (`ecom-ops:top10-shipped:v1`) so the operator's progress is
 * visible on the home page without having to navigate to `/top-10`.
 *
 * Cross-tab + same-tab sync via the same custom DOM event the
 * `/top-10` page fires on every toggle (`ecom-ops:top10-shipped:update`),
 * so a click on `/top-10` updates this card instantly when the user
 * navigates back to `/` (and vice versa if we ever mount a similar
 * widget there).
 *
 * Storage key: `ecom-ops:top10-shipped:v1` (canonical, same as
 * the `/top-10` tracker — DO NOT split into a separate key).
 *
 * Layout: a compact Card with twin progress bars (canonical cron
 * count vs operator-local count) and a "Mark next" hint linking
 * back to `/top-10`. SSR-safe (renders a stable placeholder until
 * the client-side hydration runs).
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

/**
 * Mirror of `moveIdFromStatus` from `/components/top10-shipped-tracker.tsx`.
 * Kept identical to avoid drift — if you change one, change both.
 */
function moveIdFromStatus(s: Top10Status): string {
  const rankMatch = /#(\d+)/.exec(s.move);
  if (rankMatch && rankMatch[1]) {
    return `top10:#${rankMatch[1]}`;
  }
  const slug = s.move
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `top10:${slug || "unknown"}`;
}

export function Top10ShippedOverviewCard({ status }: { status: Top10Status[] }) {
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

  const total = status.length;
  const canonicalShipped = status.filter((s) => s.shipped).length;
  const canonicalPending = status.filter((s) => s.pending).length;
  const canonicalPct = total ? (canonicalShipped / total) * 100 : 0;

  const myShipped = useMemo(() => {
    if (!hydrated) return 0;
    const set = new Set<string>();
    for (const s of status) {
      if (shipped[moveIdFromStatus(s)]) set.add(moveIdFromStatus(s));
    }
    return set.size;
  }, [shipped, status, hydrated]);
  const myPct = total ? (myShipped / total) * 100 : 0;

  // Find the next pending move that hasn't been shipped by the operator
  // yet — drives the "Mark next →" CTA.
  const nextForYou = useMemo(() => {
    if (!hydrated) return null;
    const pending = status.find(
      (s) => s.pending && !shipped[moveIdFromStatus(s)],
    );
    return pending ?? status.find((s) => s.pending) ?? null;
  }, [status, shipped, hydrated]);

  const intentTone =
    hydrated && myShipped >= 5
      ? "border-emerald-500/40 bg-emerald-500/5"
      : hydrated && myShipped >= 1
        ? "border-sky-500/40 bg-sky-500/5"
        : "border-dashed border-border/60 bg-muted/30";

  return (
    <Card
      id="top10-shipped-overview"
      data-testid="top10-shipped-overview-card"
      className={`border ${intentTone} transition-colors`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Top 10 — shipped by you</CardTitle>
            {hydrated && myShipped > 0 ? (
              <Badge variant="success" className="text-[10px] uppercase tracking-wider">
                {myShipped} / {total}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                Not started
              </Badge>
            )}
          </div>
          <a
            href="/top-10"
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            aria-label="Open the Top 10 ranked list"
          >
            Open list →
          </a>
        </div>
        <CardDescription>
          What <span className="font-medium text-foreground">you</span> have
          shipped in your store, vs what the canonical queue says is shipped.
          Toggles on <a className="underline hover:text-foreground" href="/top-10">/top-10</a>{" "}
          write to the same browser key this card reads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Canonical (cron)</span>
            <span className="tabular-nums">
              {canonicalShipped}/{total} · {canonicalPct.toFixed(0)}% · {canonicalPending} pending
            </span>
          </div>
          <Bar value={canonicalPct} intent="accent" label="canonical" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>You (this browser)</span>
            <span className="tabular-nums">
              {hydrated ? `${myShipped}/${total} · ${myPct.toFixed(0)}%` : "—"}
            </span>
          </div>
          <Bar value={myPct} intent="success" label="you" />
        </div>
        {hydrated && nextForYou ? (
          <a
            href="/top-10"
            className="mt-1 flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-xs hover:bg-muted transition-colors"
            aria-label={`Open Top 10 and mark ${nextForYou.move} as shipped`}
          >
            <span className="text-muted-foreground">
              Next to mark:{" "}
              <span className="font-medium text-foreground">
                {nextForYou.move}
              </span>
            </span>
            <span className="text-accent">Mark on /top-10 →</span>
          </a>
        ) : null}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          State lives in your browser only — clearing site data wipes it. Open
          the same dashboard in a different browser / device and the count
          starts fresh.
        </p>
      </CardContent>
    </Card>
  );
}
