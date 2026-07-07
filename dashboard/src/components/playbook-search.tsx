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
import { CopyButton } from "@/components/copy-button";
import {
  freshnessLabel,
  freshnessTier,
} from "@/lib/content";
import {
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

/**
 * `Playbook search & filter` — interactive-tool + state-persistence on
 * `/playbooks`. Replaces the flat loop with a client-side filter bar
 * (text + freshness tier + shipped state), persists the query to
 * localStorage so the operator's "show me X" survives a reload, and
 * renders a filtered list of playbook cards using the same markup the
 * old server-rendered loop produced.
 *
 * Why this move: 30 playbooks is past the comfortable scroll length.
 * Roadmap P2 (search across playbooks) + P3 (better filter affordances)
 * collapsed into one bounded tick. No new dependency.
 *
 * Storage keys:
 *   ecom-ops:playbooks:search:v1   -> { query, tier, shippedFilter }
 * Reads:
 *   ecom-ops:shipped-playbooks:v1  -> existing Shipped-playbooks tracker
 */

type FreshnessFilter = "all" | "fresh" | "aging" | "stale" | "unknown";
type ShippedFilter = "all" | "shipped" | "unshipped";

interface SearchState {
  query: string;
  tier: FreshnessFilter;
  shippedFilter: ShippedFilter;
}

const STORAGE_KEY = "ecom-ops:playbooks:search:v1";

const TIER_FILTERS: Array<{ value: FreshnessFilter; label: string; style: string }> = [
  {
    value: "all",
    label: "All",
    style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
  },
  {
    value: "fresh",
    label: "Fresh",
    style:
      "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10",
  },
  {
    value: "aging",
    label: "Aging",
    style: "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10",
  },
  {
    value: "stale",
    label: "Stale",
    style: "border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10",
  },
  {
    value: "unknown",
    label: "Unknown",
    style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
  },
];

const SHIPPED_FILTERS: Array<{
  value: ShippedFilter;
  label: string;
  style: string;
}> = [
  {
    value: "all",
    label: "All",
    style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
  },
  {
    value: "shipped",
    label: "Shipped",
    style:
      "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10",
  },
  {
    value: "unshipped",
    label: "Unshipped",
    style: "border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10",
  },
];

const FRESHNESS_BADGE: Record<string, string> = {
  fresh:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  aging:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  stale: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

const DEFAULT_STATE: SearchState = {
  query: "",
  tier: "all",
  shippedFilter: "all",
};

function readStoredState(): SearchState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Defensive merge — every field falls back to its default if missing/wrong type.
    const query =
      typeof parsed.query === "string" ? parsed.query.slice(0, 200) : "";
    const tier: FreshnessFilter =
      typeof parsed.tier === "string" &&
      TIER_FILTERS.some((t) => t.value === parsed.tier)
        ? (parsed.tier as FreshnessFilter)
        : "all";
    const shippedFilter: ShippedFilter =
      typeof parsed.shippedFilter === "string" &&
      SHIPPED_FILTERS.some((s) => s.value === parsed.shippedFilter)
        ? (parsed.shippedFilter as ShippedFilter)
        : "all";
    return { query, tier, shippedFilter };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeStoredState(s: SearchState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Quota / private mode — silent.
  }
}

export interface PlaybookListItem {
  id: string;
  title: string;
  file: string;
  meta: string[];
  numberedSections?: Array<{ heading: string; body?: string }>;
  lastTouched?: string | null;
  sectionCount: number;
  size: number;
}

export function PlaybookSearch({
  playbooks,
}: {
  playbooks: PlaybookListItem[];
}) {
  const [state, setState] = useState<SearchState>(DEFAULT_STATE);
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount so the first interactive paint
  // matches the SSR-rendered list (zero hydration mismatch).
  useEffect(() => {
    setState(readStoredState());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration so we don't blow
  // away an existing stored query with the default).
  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(state);
  }, [state, hydrated]);

  // Filter the list deterministically: text matches title + meta +
  // numbered-section headings; tier is exact; shipped checks the
  // shipped-id set.
  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return playbooks
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => {
        if (state.tier !== "all") {
          const tier = freshnessTier(p.lastTouched ?? undefined);
          if (tier !== state.tier) return false;
        }
        if (state.shippedFilter !== "all") {
          const isShipped = Boolean(shipped[p.id]?.shippedAt);
          if (state.shippedFilter === "shipped" && !isShipped) return false;
          if (state.shippedFilter === "unshipped" && isShipped) return false;
        }
        if (!q) return true;
        if (p.title.toLowerCase().includes(q)) return true;
        if (p.file.toLowerCase().includes(q)) return true;
        if (p.meta.some((m) => m.toLowerCase().includes(q))) return true;
        if ((p.numberedSections ?? []).some((s) => s.heading.toLowerCase().includes(q))) {
          return true;
        }
        return false;
      });
  }, [playbooks, state, shipped]);

  function clearAll() {
    setState(DEFAULT_STATE);
  }

  const shippedCount = hydrated
    ? playbooks.filter((p) => Boolean(shipped[p.id]?.shippedAt)).length
    : 0;
  const hasFilter =
    state.query.trim() !== "" ||
    state.tier !== "all" ||
    state.shippedFilter !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="text-base">
              Filter playbooks · {filtered.length} of {playbooks.length} visible
            </CardTitle>
            {hasFilter ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <span aria-hidden="true">✕</span>
                <span>Clear filters</span>
              </button>
            ) : null}
          </div>
          <CardDescription>
            Type to search title / meta / sections. Filter by freshness or
            shipped state. Filter persists across reloads.
            {hydrated && shippedCount > 0 ? (
              <span className="ml-2">
                You have shipped <strong className="text-foreground">{shippedCount}</strong>{" "}
                playbook{shippedCount === 1 ? "" : "s"}.
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="search"
              value={state.query}
              onChange={(e) => setState((s) => ({ ...s, query: e.target.value }))}
              placeholder="Search 30 playbooks — title, meta, section headings…"
              aria-label="Search playbooks"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
            {state.query ? (
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, query: "" }))}
                aria-label="Clear search text"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 select-none">
                ⌕
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Freshness
            </span>
            {TIER_FILTERS.map((opt) => {
              const active = state.tier === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, tier: opt.value }))}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : opt.style
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Shipped
            </span>
            {SHIPPED_FILTERS.map((opt) => {
              const active = state.shippedFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setState((s) => ({ ...s, shippedFilter: opt.value }))
                  }
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : opt.style
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtered list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <p>No playbooks match the current filters.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:text-foreground hover:bg-muted transition-colors"
            >
              Clear filters
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(({ p, i }) => {
            const tier = freshnessTier(p.lastTouched ?? undefined);
            const label = freshnessLabel(p.lastTouched ?? undefined);
            const isShipped = Boolean(shipped[p.id]?.shippedAt);
            return (
              <Card key={p.file} id={p.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      PB-{String(i + 1).padStart(2, "0")}
                    </span>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                      {isShipped ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          title={`Shipped on ${shipped[p.id]!.shippedAt}`}
                        >
                          ✓ Shipped
                        </Badge>
                      ) : null}
                      {label ? (
                        <Badge
                          variant="outline"
                          className={
                            FRESHNESS_BADGE[tier] ?? FRESHNESS_BADGE.unknown
                          }
                          title={
                            p.lastTouched
                              ? `Last edited ${p.lastTouched}`
                              : undefined
                          }
                        >
                          {label}
                        </Badge>
                      ) : null}
                      <Badge variant="outline">
                        {p.sectionCount} sections ·{" "}
                        {(p.size / 1024).toFixed(1)}kb
                      </Badge>
                      <CopyButton value={p.id} label="Copy ID" />
                    </div>
                  </div>
                  <CardDescription className="font-mono text-[11px]">
                    /playbooks/{p.file}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {p.meta.length > 0 ? (
                    <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                      {p.meta.slice(0, 6).map((m, j) => (
                        <li key={j}>{m}</li>
                      ))}
                    </ul>
                  ) : null}
                  {(p.numberedSections ?? []).length > 0 ? (
                    <details className="rounded-lg border border-border p-3">
                      <summary className="cursor-pointer text-xs font-medium">
                        Section preview ({(p.numberedSections ?? []).length})
                      </summary>
                      <ol className="mt-2 space-y-1 text-[11px] text-muted-foreground list-decimal pl-5">
                        {(p.numberedSections ?? []).slice(0, 12).map((s, k) => (
                          <li key={k}>
                            <span className="text-foreground">{s.heading}</span>
                            {s.body ? (
                              <span className="block text-muted-foreground line-clamp-2 mt-0.5">
                                {s.body.replace(/\n+/g, " ").slice(0, 220)}…
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </details>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
