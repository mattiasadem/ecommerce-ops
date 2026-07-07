"use client";

/**
 * `Content search & filter` — generic client-side filter bar for any
 * library of documents (assets today; research/playbooks on the same
 * shape tomorrow). Mounts a text query + freshness-tier chip group on
 * top of a flat document list, persists both to localStorage, and
 * renders the same card markup the parent route would have
 * server-rendered.
 *
 * Why this move: 27 assets is past the comfortable scroll length, and
 * the dashboard's existing `playbook-search.tsx` already proved the
 * pattern (interactive-tool + state-persistence in one bounded tick).
 * Porting the shape here is one linear copy — no new dependency, no
 * API route. The `kind` discriminator lets the same `<ContentSearch>`
 * component mount on `/research` and other library routes later.
 *
 * Storage keys:
 *   ecom-ops:content:search:v1   -> { kind, query, tier }
 *   per-kind reset (no shipped/playbook concerns here).
 */

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
import { freshnessLabel, freshnessTier } from "@/lib/content";
import { cn } from "@/lib/utils";

export type FreshnessFilter = "all" | "fresh" | "aging" | "stale" | "unknown";

export interface ContentSearchItem {
  id: string;
  title: string;
  file: string;
  meta?: string[];
  numberedSections?: Array<{ heading: string; body?: string }>;
  lastTouched?: string | null;
  sectionCount?: number;
  size?: number;
  voiceGated?: boolean;
  voiceCounts?: Record<string, number>;
}

interface SearchState {
  query: string;
  tier: FreshnessFilter;
}

const STORAGE_KEY = "ecom-ops:content:search:v1";

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
    style:
      "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10",
  },
  {
    value: "stale",
    label: "Stale",
    style:
      "border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10",
  },
  {
    value: "unknown",
    label: "Unknown",
    style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
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

const DEFAULT_STATE: SearchState = { query: "", tier: "all" };

function readStoredState(kind: string): SearchState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.kind !== kind) return DEFAULT_STATE; // ignore other-kind entries
    const query =
      typeof parsed.query === "string" ? parsed.query.slice(0, 200) : "";
    const tier: FreshnessFilter =
      typeof parsed.tier === "string" &&
      TIER_FILTERS.some((t) => t.value === parsed.tier)
        ? (parsed.tier as FreshnessFilter)
        : "all";
    return { query, tier };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeStoredState(kind: string, s: SearchState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ kind, ...s }),
    );
  } catch {
    // Quota / private mode — silent.
  }
}

function matchesQuery(item: ContentSearchItem, q: string): boolean {
  if (!q) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  if (item.file.toLowerCase().includes(q)) return true;
  if ((item.meta ?? []).some((m) => m.toLowerCase().includes(q))) return true;
  if (
    (item.numberedSections ?? []).some((s) =>
      s.heading.toLowerCase().includes(q),
    )
  ) {
    return true;
  }
  return false;
}

export function ContentSearch({
  kind,
  items,
  routePrefix,
  itemLabel = "Asset",
  itemNumberPrefix = "AS",
  itemNumberField,
}: {
  kind: "assets" | "research" | "playbooks";
  items: ContentSearchItem[];
  routePrefix: string; // e.g. "/assets"
  itemLabel?: string;
  itemNumberPrefix?: string; // "AS" for assets, "PB" for playbooks, "RD" for research
  itemNumberField?: keyof ContentSearchItem; // which field carries the per-doc number
}) {
  const [state, setState] = useState<SearchState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState(kind));
    setHydrated(true);
  }, [kind]);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(kind, state);
  }, [kind, state, hydrated]);

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => {
        if (state.tier !== "all") {
          const tier = freshnessTier(item.lastTouched ?? undefined);
          if (tier !== state.tier) return false;
        }
        return matchesQuery(item, q);
      });
  }, [items, state]);

  const visible = filtered.length;
  const total = items.length;

  const clearFilters = () => {
    setState({ query: "", tier: "all" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Filter bar */}
      <Card className="border-border/60 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="text-sm font-medium">
              Filter {itemLabel.toLowerCase()}s
              <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
                {visible} of {total} visible
              </span>
            </CardTitle>
            {(state.query || state.tier !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] underline text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <div className="relative">
              <input
                type="search"
                aria-label={`Search ${itemLabel.toLowerCase()}s`}
                placeholder={`Search ${total} ${itemLabel.toLowerCase()}s — title, meta, section headings…`}
                value={state.query}
                onChange={(e) =>
                  setState((s) => ({ ...s, query: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground pr-1">
                Freshness
              </span>
              {TIER_FILTERS.map((t) => {
                const isActive = state.tier === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setState((s) => ({ ...s, tier: t.value }))
                    }
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : t.style,
                    )}
                    aria-pressed={isActive}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      {visible === 0 ? (
        <Card className="border-dashed border-border/60 bg-background/40">
          <CardContent className="py-8 text-center text-sm text-muted-foreground space-y-3">
            <div>
              No {itemLabel.toLowerCase()}s match the current filters.
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs underline text-foreground hover:text-foreground/80"
            >
              Clear filters
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(({ item }) => {
            const tier = freshnessTier(item.lastTouched ?? undefined);
            const label = freshnessLabel(item.lastTouched ?? undefined);
            return (
              <Card key={item.id} id={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-baseline gap-3">
                    {itemNumberField && item[itemNumberField] != null && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {itemNumberPrefix}-
                        {String(item[itemNumberField]).padStart(2, "0")}
                      </span>
                    )}
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <div className="ml-auto flex flex-wrap items-center gap-1.5">
                      {label && (
                        <Badge
                          variant="outline"
                          className={FRESHNESS_BADGE[tier] ?? FRESHNESS_BADGE.unknown}
                          title={item.lastTouched ? `Last edited ${item.lastTouched}` : undefined}
                        >
                          {label}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {item.sectionCount ?? 0} sections ·{" "}
                        {((item.size ?? 0) / 1024).toFixed(1)}kb
                      </Badge>
                      <CopyButton value={item.id} label="Copy ID" />
                    </div>
                  </div>
                  <CardDescription className="font-mono text-[11px]">
                    {routePrefix}/{item.file}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(item.meta ?? []).length > 0 && (
                    <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground list-disc pl-5">
                      {(item.meta ?? []).map((m, j) => (
                        <li key={j}>{m}</li>
                      ))}
                    </ul>
                  )}
                  {item.voiceGated && item.voiceCounts && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      {Object.entries(item.voiceCounts).map(
                        ([voice, count]) => (
                          <span
                            key={voice}
                            className={
                              count >= 15
                                ? "rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400"
                                : "rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400"
                            }
                          >
                            {voice}: {count}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  {(item.numberedSections ?? []).length > 0 && (
                    <details className="rounded-lg border border-border p-3">
                      <summary className="cursor-pointer text-xs font-medium">
                        Section preview ({(item.numberedSections ?? []).length})
                      </summary>
                      <ol className="mt-2 space-y-1 text-[11px] text-muted-foreground list-decimal pl-5">
                        {(item.numberedSections ?? [])
                          .slice(0, 12)
                          .map((s, k) => (
                            <li key={k}>
                              <span className="text-foreground">
                                {s.heading}
                              </span>
                              {s.body && (
                                <span className="block text-muted-foreground line-clamp-2 mt-0.5">
                                  {s.body.replace(/\n+/g, " ").slice(0, 220)}…
                                </span>
                              )}
                            </li>
                          ))}
                      </ol>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
