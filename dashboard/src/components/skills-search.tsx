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
  StudiedMap,
  confidenceLabel,
  confidenceTone,
  loadStudiedSkills,
  progressTierFor,
  saveStudiedSkills,
  setStudied,
} from "@/lib/skills-studied";
import { cn } from "@/lib/utils";

/**
 * `Skills library — search / filter / studied` — interactive-tool +
 * state-persistence on `/skills`.
 *
 * The skills library has 14+ skills across 12+ categories, and unlike
 * `/playbooks` it had no client-side filter bar. Operators scrolling
 * the index page had no way to find a specific skill quickly or to
 * track which skills they had studied/applied/shipped.
 *
 * Three things in one bounded tick (no new dependency):
 *   1. Text query + category filter + priority filter (server-side
 *      data, client-side filter — same pattern as `playbook-search`).
 *   2. "Mark studied" toggle on every skill card, with a 3-tier
 *      confidence ladder (studied / applied / shipped) so the
 *      operator can track how deep their engagement is.
 *   3. Top progress strip ("X of N skills engaged") with health band
 *      + reset-everything button.
 *
 * Reads / writes:
 *   ecom-ops:skills:studied:v1  -> StudiedMap
 *   ecom-ops:skills:search:v1   -> { query, category, priority }
 */

export type SkillsPriorityFilter = "all" | "P0" | "P1" | "P2" | "P3";
export type StudiedFilter = "all" | "studied" | "unstudied";

interface SkillsSearchProps {
  skills: Array<{
    file: string;
    title: string;
    category: string;
    priority: string;
    tier: number | null;
    defaultMove: number | null;
    yearOneRoiBand: string | null;
    smsFriendly: boolean;
    blurb: string;
    pitfallCount: number;
    sourceCount: number;
  }>;
}

interface SearchState {
  query: string;
  category: string;
  priority: SkillsPriorityFilter;
  studiedFilter: StudiedFilter;
}

const STORAGE_KEY = "ecom-ops:skills:search:v1";

const PRIORITY_FILTERS: Array<{
  value: SkillsPriorityFilter;
  label: string;
  style: string;
}> = [
  { value: "all", label: "All priorities", style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted" },
  { value: "P0", label: "P0", style: "border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10" },
  { value: "P1", label: "P1", style: "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10" },
  { value: "P2", label: "P2", style: "border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10" },
  { value: "P3", label: "P3", style: "border-border text-muted-foreground hover:bg-muted" },
];

const STUDIED_FILTERS: Array<{
  value: StudiedFilter;
  label: string;
  style: string;
}> = [
  { value: "all", label: "All", style: "border-border text-muted-foreground hover:text-foreground hover:bg-muted" },
  { value: "unstudied", label: "Not studied", style: "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10" },
  { value: "studied", label: "Studied", style: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10" },
];

const DEFAULT_STATE: SearchState = {
  query: "",
  category: "all",
  priority: "all",
  studiedFilter: "all",
};

function readStoredState(): SearchState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      category:
        typeof parsed.category === "string" ? parsed.category : "all",
      priority: (PRIORITY_FILTERS.find((p) => p.value === parsed.priority)
        ?.value ?? "all") as SkillsPriorityFilter,
      studiedFilter: (STUDIED_FILTERS.find((s) => s.value === parsed.studiedFilter)
        ?.value ?? "all") as StudiedFilter,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeStoredState(state: SearchState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function SkillsSearch({ skills }: SkillsSearchProps) {
  const [state, setState] = useState<SearchState>(DEFAULT_STATE);
  const [studied, setStudiedState] = useState<StudiedMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(readStoredState());
    setStudiedState(loadStudiedSkills());
    setHydrated(true);
  }, []);

  // Persist on change (after hydration so the first render matches server)
  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(state);
  }, [state, hydrated]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const s of skills) seen.add(s.category || "general");
    return Array.from(seen).sort();
  }, [skills]);

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return skills.filter((s) => {
      if (state.category !== "all" && s.category !== state.category) return false;
      if (state.priority !== "all" && s.priority !== state.priority) return false;
      const id = s.file.replace(/\.md$/, "");
      const isOn = Boolean(studied[id]);
      if (state.studiedFilter === "studied" && !isOn) return false;
      if (state.studiedFilter === "unstudied" && isOn) return false;
      if (q.length === 0) return true;
      const hay = [
        s.title,
        s.blurb,
        s.category,
        s.priority,
        s.yearOneRoiBand || "",
        `move ${s.defaultMove ?? ""}`,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [skills, state, studied]);

  const totalEngaged = useMemo(
    () => Object.keys(studied).length,
    [studied],
  );
  const totalSkills = skills.length;
  const pct = totalSkills === 0 ? 0 : (totalEngaged / totalSkills) * 100;
  const tier = progressTierFor(pct);

  const onMark = (skillId: string, current?: StudiedMap[string]) => {
    const next = setStudied({ ...studied }, skillId, current?.confidence ?? "studied");
    setStudiedState(next);
    saveStudiedSkills(next);
  };

  const onClear = () => {
    if (typeof window === "undefined") return;
    if (
      !window.confirm(
        "Reset all skill study progress? This will clear all 'studied / applied / shipped' markers from this browser.",
      )
    )
      return;
    try {
      window.localStorage.removeItem("ecom-ops:skills:studied:v1");
      setStudiedState({});
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* === Progress strip === */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base">Skill library — your engagement</CardTitle>
              <CardDescription>
                Mark each skill as you study / apply / ship it. State auto-saved to your browser.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-rose-600 transition-colors"
            >
              Reset progress
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                {totalEngaged}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                / {totalSkills}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                engaged
              </span>
            </div>
            <Badge variant="outline" className={tier.tone}>
              {tier.label}
            </Badge>
            <div className="flex-1 min-w-[120px] h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pct.toFixed(1)}%` }}
                aria-label={`${pct.toFixed(0)}% of skills engaged`}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {pct.toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* === Filter bar === */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-3">
          <input
            type="search"
            placeholder="Search skill title, blurb, category, move #…"
            value={state.query}
            onChange={(e) =>
              setState((s) => ({ ...s, query: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            aria-label="Search skills"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Category
            </span>
            <CategoryChip
              active={state.category === "all"}
              onClick={() => setState((s) => ({ ...s, category: "all" }))}
              label="All"
            />
            {categories.map((c) => (
              <CategoryChip
                key={c}
                active={state.category === c}
                onClick={() => setState((s) => ({ ...s, category: c }))}
                label={c}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Priority
            </span>
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, priority: f.value }))
                }
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest transition-colors",
                  state.priority === f.value
                    ? "border-foreground bg-foreground text-background"
                    : f.style,
                )}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              Engagement
            </span>
            {STUDIED_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  setState((s) => ({ ...s, studiedFilter: f.value }))
                }
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest transition-colors",
                  state.studiedFilter === f.value
                    ? "border-foreground bg-foreground text-background"
                    : f.style,
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span className="tabular-nums">
              Showing {filtered.length} of {skills.length} skills
            </span>
            {(state.query ||
              state.category !== "all" ||
              state.priority !== "all" ||
              state.studiedFilter !== "all") && (
              <button
                type="button"
                onClick={() => setState(DEFAULT_STATE)}
                className="hover:text-foreground transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* === Filtered grid === */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No skills match these filters. Try widening the search or clearing
            one of the chips.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const id = s.file.replace(/\.md$/, "");
            const entry = studied[id];
            return (
              <Card
                key={s.file}
                className={cn(
                  "h-full transition-colors",
                  entry
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "hover:border-foreground/30",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-snug">
                      <a
                        href={`/skills/${id}`}
                        className="hover:underline"
                      >
                        {s.title}
                      </a>
                    </CardTitle>
                    <Badge
                      variant={
                        s.priority === "P0"
                          ? "danger"
                          : s.priority === "P1"
                            ? "warning"
                            : s.priority === "P2"
                              ? "secondary"
                              : "outline"
                      }
                      className="text-[10px] flex-shrink-0"
                    >
                      {s.priority}
                    </Badge>
                  </div>
                  <CardDescription className="text-[10px] font-mono">
                    Move #{s.defaultMove ?? "—"} · Tier {s.tier ?? "—"}
                    {s.smsFriendly ? " · SMS ✓" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3.6em]">
                    {s.blurb}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {s.pitfallCount} pitfalls · {s.sourceCount} sources
                    </span>
                    <span className="font-mono tabular-nums">
                      {s.yearOneRoiBand || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onMark(id, entry)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest transition-colors",
                        entry
                          ? confidenceTone(entry.confidence)
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                      aria-pressed={Boolean(entry)}
                    >
                      {entry
                        ? `${confidenceLabel(entry.confidence)} ✓`
                        : "Mark studied"}
                    </button>
                    {entry && (
                      <ConfidenceStepper
                        skillId={id}
                        current={entry.confidence ?? "studied"}
                        studied={studied}
                        setStudiedState={setStudiedState}
                      />
                    )}
                    <a
                      href={`/skills/${id}`}
                      className="ml-auto text-[10px] text-accent hover:underline"
                    >
                      Open →
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

function ConfidenceStepper({
  skillId,
  current,
  studied,
  setStudiedState,
}: {
  skillId: string;
  current: "studied" | "applied" | "shipped";
  studied: StudiedMap;
  setStudiedState: (m: StudiedMap) => void;
}) {
  const advance = () => {
    const next: "studied" | "applied" | "shipped" =
      current === "studied"
        ? "applied"
        : current === "applied"
          ? "shipped"
          : "studied";
    const updated: StudiedMap = {
      ...studied,
      [skillId]: {
        ...studied[skillId],
        confidence: next,
        studiedAt: new Date().toISOString(),
      },
    };
    setStudiedState(updated);
    saveStudiedSkills(updated);
  };
  return (
    <button
      type="button"
      onClick={advance}
      className="rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={`Advance confidence (currently ${confidenceLabel(current)})`}
    >
      ↻ {nextLabel(current)}
    </button>
  );
}

function nextLabel(current: "studied" | "applied" | "shipped"): string {
  if (current === "studied") return "Mark applied";
  if (current === "applied") return "Mark shipped";
  return "Restart";
}
