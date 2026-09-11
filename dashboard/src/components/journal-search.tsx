"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import {
  ALL_TICK_STATUSES,
  ALL_TICK_TYPES,
  CategorizedJournalEntry,
  EMPTY_FILTERS,
  JournalFilters,
  JournalStats,
  TICK_STATUS_LABEL,
  TICK_STATUS_TONE,
  TICK_TYPE_LABEL,
  TICK_TYPE_TONE,
  applyJournalFilters,
  computeJournalStats,
  categorizeJournal,
} from "@/lib/journal-categorize";
import { cn } from "@/lib/utils";

/**
 * `Journal search & filter` — interactive-tool on `/journal`.
 *
 * Replaces the flat list-of-`<pre>`-blocks on /journal with a
 * searchable, filterable, facet-rich timeline:
 *
 *   1. Text search across the full heading + body (case-insensitive
 *      substring) — the operator types "postscript" or "checkout audit"
 *      and the timeline narrows immediately.
 *   2. Tick-type filter chips (Skill · Feature · Static · Infra · Other) —
 *      multi-select, clicking toggles.
 *   3. Status filter chips (Kept · Blocked · No status) — multi-select.
 *   4. Stats strip: total entries · kept · blocked · last-7-days.
 *   5. Filtered results list with tick-type chip + status chip per card.
 *   6. One-click "Copy filtered list as markdown" for handoff.
 *   7. Persistence: filters survive reload via localStorage.
 *
 * Storage:
 *   ecom-ops:journal:search:v1   -> JournalFilters (query + selected facets)
 *
 * No new dependency. Pure-TypeScript / React. Uses the same shell
 * markup the old /journal used so the layout stays consistent with the
 * rest of the dashboard.
 */

type RawJournalEntry = { heading: string; body: string };

const STORAGE_KEY = "ecom-ops:journal:search:v1";

interface StoredFilters {
  query: string;
  tickTypes: string[];
  tickStatuses: string[];
}

const STORAGE_DEFAULTS: StoredFilters = {
  query: "",
  tickTypes: [],
  tickStatuses: [],
};

function loadFilters(): JournalFilters {
  if (typeof window === "undefined") return EMPTY_FILTERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw) as Partial<StoredFilters>;
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      tickTypes: Array.isArray(parsed.tickTypes)
        ? (parsed.tickTypes.filter((t) =>
            ALL_TICK_TYPES.includes(t as (typeof ALL_TICK_TYPES)[number]),
          ) as JournalFilters["tickTypes"])
        : [],
      tickStatuses: Array.isArray(parsed.tickStatuses)
        ? (parsed.tickStatuses.filter((s) =>
            ALL_TICK_STATUSES.includes(s as (typeof ALL_TICK_STATUSES)[number]),
          ) as JournalFilters["tickStatuses"])
        : [],
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

function saveFilters(filters: JournalFilters): void {
  if (typeof window === "undefined") return;
  const payload: StoredFilters = {
    query: filters.query,
    tickTypes: filters.tickTypes,
    tickStatuses: filters.tickStatuses,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full / disabled — silently ignore.
  }
}

export interface JournalSearchProps {
  /** Pre-parsed journal entries from `content.journal`. */
  entries: RawJournalEntry[];
}

export function JournalSearch({ entries }: JournalSearchProps) {
  const categorized = useMemo(() => categorizeJournal(entries), [entries]);
  const stats = useMemo(() => computeJournalStats(categorized), [categorized]);

  const [hydrated, setHydrated] = useState(false);
  const [filters, setFilters] = useState<JournalFilters>(EMPTY_FILTERS);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setFilters(loadFilters());
    setHydrated(true);
  }, []);

  // Persist on change (skip the initial empty render to avoid clobbering
  // stored state with the default EMPTY_FILTERS during the same-tick
  // first paint).
  useEffect(() => {
    if (!hydrated) return;
    saveFilters(filters);
  }, [filters, hydrated]);

  const filtered = useMemo(
    () => applyJournalFilters(categorized, filters),
    [categorized, filters],
  );

  const toggleTickType = (t: (typeof ALL_TICK_TYPES)[number]) => {
    setFilters((prev) => {
      const has = prev.tickTypes.includes(t);
      return {
        ...prev,
        tickTypes: has
          ? prev.tickTypes.filter((x) => x !== t)
          : [...prev.tickTypes, t],
      };
    });
  };

  const toggleTickStatus = (s: (typeof ALL_TICK_STATUSES)[number]) => {
    setFilters((prev) => {
      const has = prev.tickStatuses.includes(s);
      return {
        ...prev,
        tickStatuses: has
          ? prev.tickStatuses.filter((x) => x !== s)
          : [...prev.tickStatuses, s],
      };
    });
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  const markdown = useMemo(
    () => buildFilteredMarkdown(filtered),
    [filtered],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* === STATS STRIP === */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Total entries"
          value={stats.total.toString()}
          sub={`${stats.byType.skill} skill · ${stats.byType.feature} feature`}
        />
        <StatTile
          label="Kept"
          value={stats.byStatus.keep.toString()}
          sub={`${pct(stats.byStatus.keep, stats.total)} of total`}
          tone="positive"
        />
        <StatTile
          label="Blocked"
          value={stats.byStatus.blocked.toString()}
          sub={stats.byStatus.blocked === 0 ? "none" : "deploy-blocked ticks"}
          tone={stats.byStatus.blocked > 0 ? "warning" : "neutral"}
        />
        <StatTile
          label="Last 7 days"
          value={stats.last7Days.toString()}
          sub={stats.last7Days === 0 ? "quiet window" : "recent cadence"}
        />
      </div>

      {/* === SEARCH + FILTERS === */}
      <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
          <input
            type="search"
            value={filters.query}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Search heading + body (e.g. 'klaviyo', 'checkout audit', 'move #19')…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Search journal entries"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {filtered.length}/{categorized.length}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              disabled={
                filters.query.length === 0 &&
                filters.tickTypes.length === 0 &&
                filters.tickStatuses.length === 0
              }
              className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <CopyButton
              value={markdown}
              label="Copy as markdown"
              className="bg-foreground text-background hover:bg-foreground/90"
            />
          </div>
        </div>

        <FacetRow
          label="Tick type"
          options={ALL_TICK_TYPES.map((t) => ({
            key: t,
            label: TICK_TYPE_LABEL[t],
            tone: TICK_TYPE_TONE[t],
            count: stats.byType[t],
            selected: filters.tickTypes.includes(t),
            onToggle: () => toggleTickType(t),
          }))}
        />
        <FacetRow
          label="Status"
          options={ALL_TICK_STATUSES.map((s) => ({
            key: s,
            label: TICK_STATUS_LABEL[s],
            tone: TICK_STATUS_TONE[s],
            count: stats.byStatus[s],
            selected: filters.tickStatuses.includes(s),
            onToggle: () => toggleTickStatus(s),
          }))}
        />
      </div>

      {/* === RESULTS LIST === */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="text-sm text-muted-foreground py-6">
              No entries match the current filters. Try removing a tick-type
              chip or clearing the search box.
            </CardContent>
          </Card>
        )}
        {filtered.map((entry) => (
          <JournalCard key={entry.index} entry={entry} />
        ))}
      </div>
    </div>
  );
}

// ---------- sub-components ----------

function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "warning"
      ? "border-rose-500/30 bg-rose-500/5"
      : "border-border bg-card";
  return (
    <div className={cn("rounded-lg border p-3 flex flex-col gap-1", toneClass)}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

interface FacetOption {
  key: string;
  label: string;
  tone: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
}

function FacetRow({
  label,
  options,
}: {
  label: string;
  options: FacetOption[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={opt.onToggle}
            aria-pressed={opt.selected}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
              opt.selected
                ? opt.tone
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <span>{opt.label}</span>
            <span className="text-[10px] tabular-nums opacity-70">
              {opt.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function JournalCard({ entry }: { entry: CategorizedJournalEntry }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
              TICK_TYPE_TONE[entry.tickType],
            )}
          >
            {TICK_TYPE_LABEL[entry.tickType]}
          </span>
          {entry.tickStatus !== "no-status" && (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                TICK_STATUS_TONE[entry.tickStatus],
              )}
            >
              {TICK_STATUS_LABEL[entry.tickStatus]}
            </span>
          )}
          {entry.displayDate && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {entry.displayDate}
            </span>
          )}
          <CardDescription className="ml-auto text-[10px] tabular-nums">
            #{entry.index + 1} from newest
          </CardDescription>
        </div>
        <CardTitle className="text-sm leading-snug mt-1.5">
          {entry.shortTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
          {entry.body || "(no body)"}
        </pre>
      </CardContent>
    </Card>
  );
}

// ---------- helpers ----------

function pct(n: number, d: number): string {
  if (d === 0) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

function buildFilteredMarkdown(entries: CategorizedJournalEntry[]): string {
  if (entries.length === 0) {
    return "_No journal entries match the current filters._";
  }
  const lines: string[] = [];
  lines.push(`# Filtered journal — ${entries.length} entries`);
  lines.push("");
  lines.push(`_Generated ${new Date().toISOString()}_`);
  lines.push("");
  for (const e of entries) {
    lines.push(`## ${e.displayDate ?? "—"} — ${e.shortTitle}`);
    lines.push("");
    lines.push(`_Tick type: ${TICK_TYPE_LABEL[e.tickType]} · Status: ${TICK_STATUS_LABEL[e.tickStatus]}_`);
    lines.push("");
    lines.push(e.body || "_(no body)_");
    lines.push("");
  }
  return lines.join("\n");
}
