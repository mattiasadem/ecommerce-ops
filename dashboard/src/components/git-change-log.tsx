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
import { cn } from "@/lib/utils";

/**
 * `Real change log` — live-data panel on `/journal`.
 *
 * Renders the actual git commit history of the dashboard subtree,
 * captured at build time by `scripts/parse-content.mjs` and embedded
 * into `content.json`. The list shows the most-recent 200 commits by
 * default with three filters:
 *
 *   1. Text search across subject + body (case-insensitive substring)
 *   2. Author filter chips (multi-select — click to toggle)
 *   3. Conventional-commit prefix filter (feat / fix / chore / docs /
 *      style / refactor / perf / test / skill / journal)
 *
 * Each row expands on click to show the full commit body (git's
 * `commit message body` — anything after the first blank line). The
 * short SHA links to GitHub for one-click inspection. A copy-as-markdown
 * button lets the operator paste a filtered subset into a Slack thread.
 *
 * Storage:
 *   ecom-ops:git-log:filters:v1   -> { query, authors, prefixes }
 *
 * Why a build-time capture (not a runtime `git log` server route):
 *   Vercel-side builds only ship the dashboard subtree — no parent
 *   .git directory. A runtime route would always return "no commits".
 *   Capturing at build time means every cron tick re-bakes the log.
 */

const STORAGE_KEY = "ecom-ops:git-log:filters:v1";
const MAX_VISIBLE_DEFAULT = 30;

interface StoredFilters {
  query: string;
  authors: string[];
  prefixes: string[];
}

const CONVENTIONAL_PREFIXES = [
  "feat",
  "fix",
  "chore",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "skill",
  "journal",
] as const;

const EMPTY_FILTERS: StoredFilters = { query: "", authors: [], prefixes: [] };

interface Props {
  commits: {
    sha: string;
    date: string;
    author: string;
    subject: string;
    body: string;
  }[];
  repoUrl: string;
}

function loadStored(): StoredFilters {
  if (typeof window === "undefined") return EMPTY_FILTERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_FILTERS;
    return {
      query: String(parsed.query ?? ""),
      authors: Array.isArray(parsed.authors)
        ? parsed.authors.map((a: unknown) => String(a))
        : [],
      prefixes: Array.isArray(parsed.prefixes)
        ? parsed.prefixes.map((p: unknown) => String(p))
        : [],
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

function saveStored(f: StoredFilters): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  } catch {
    /* quota */
  }
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${String(d.getUTCFullYear())}`;
  } catch {
    return iso;
  }
}

function conventionalPrefix(subject: string): string | null {
  const m = /^([a-z]+)(?:\([^)]+\))?!?:/.exec(subject);
  return m ? m[1] : null;
}

function classifyTone(
  prefix: string | null,
): "feat" | "fix" | "refactor" | "docs" | "skill" | "chore" | "other" {
  if (!prefix) return "other";
  if (prefix === "feat") return "feat";
  if (prefix === "fix") return "fix";
  if (prefix === "refactor" || prefix === "perf" || prefix === "style")
    return "refactor";
  if (prefix === "docs" || prefix === "journal") return "docs";
  if (prefix === "skill") return "skill";
  return "chore";
}

const TONE_STYLES: Record<string, string> = {
  feat: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  fix: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  refactor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  docs: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  skill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  chore: "bg-muted text-muted-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

export function GitChangeLog({ commits, repoUrl }: Props) {
  const [filters, setFilters] = useState<StoredFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  // Hydrate filters from localStorage on first paint.
  useEffect(() => {
    setFilters(loadStored());
  }, []);

  // Persist filters on change.
  useEffect(() => {
    saveStored(filters);
  }, [filters]);

  const allAuthors = useMemo(() => {
    const set = new Set<string>();
    for (const c of commits) set.add(c.author);
    return Array.from(set).sort();
  }, [commits]);

  const presentPrefixes = useMemo(() => {
    const set = new Set<string>();
    for (const c of commits) {
      const p = conventionalPrefix(c.subject);
      if (p) set.add(p);
    }
    // Only show conventional prefixes the project actually uses, in the canonical order.
    return CONVENTIONAL_PREFIXES.filter((p) => set.has(p));
  }, [commits]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return commits.filter((c) => {
      if (q && !`${c.subject}\n${c.body}`.toLowerCase().includes(q))
        return false;
      if (filters.authors.length && !filters.authors.includes(c.author))
        return false;
      if (filters.prefixes.length) {
        const p = conventionalPrefix(c.subject);
        if (!p || !filters.prefixes.includes(p)) return false;
      }
      return true;
    });
  }, [commits, filters]);

  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE_DEFAULT);

  function toggleAuthor(a: string): void {
    setFilters((f) => ({
      ...f,
      authors: f.authors.includes(a)
        ? f.authors.filter((x) => x !== a)
        : [...f.authors, a],
    }));
  }

  function togglePrefix(p: string): void {
    setFilters((f) => ({
      ...f,
      prefixes: f.prefixes.includes(p)
        ? f.prefixes.filter((x) => x !== p)
        : [...f.prefixes, p],
    }));
  }

  function resetFilters(): void {
    setFilters(EMPTY_FILTERS);
  }

  function asMarkdown(): string {
    return filtered
      .map((c) => `- \`${c.sha}\` ${fmtDate(c.date)} — ${c.subject}`)
      .join("\n");
  }

  if (!commits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Real change log</CardTitle>
          <CardDescription>
            Git commits to the dashboard subtree, captured at build time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No commits captured. Run{" "}
            <code className="rounded bg-muted px-1">node scripts/parse-content.mjs</code>{" "}
            locally and rebuild to populate this panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Real change log</CardTitle>
            <CardDescription>
              {commits.length} commits to the dashboard subtree, captured at
              build time. Click any row to expand the full message.
            </CardDescription>
          </div>
          <CopyButton value={asMarkdown()} label="Copy list" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Search input */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={filters.query}
            onChange={(e) =>
              setFilters((f) => ({ ...f, query: e.target.value }))
            }
            placeholder="Search subject or body…"
            aria-label="Search commits"
            className="flex-1 min-w-[200px] rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {(filters.query.length > 0 ||
            filters.authors.length > 0 ||
            filters.prefixes.length > 0) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Reset filters
            </button>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            Showing {visible.length} of {filtered.length}
            {filtered.length !== commits.length
              ? ` (filtered from ${commits.length})`
              : ""}
          </span>
        </div>

        {/* Prefix chips */}
        {presentPrefixes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Type
            </span>
            {presentPrefixes.map((p) => {
              const active = filters.prefixes.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePrefix(p)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? TONE_STYLES[classifyTone(p)]
                      : "bg-card text-muted-foreground border-border hover:bg-muted",
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}

        {/* Author chips */}
        {allAuthors.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Author
            </span>
            {allAuthors.map((a) => {
              const active = filters.authors.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAuthor(a)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:bg-muted",
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        )}

        {/* Commit list */}
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No commits match the current filters.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border border border-border rounded-md">
            {visible.map((c) => {
              const isOpen = !!expanded[c.sha];
              const prefix = conventionalPrefix(c.subject);
              const tone = classifyTone(prefix);
              const href = `${repoUrl}/commit/${c.sha}`;
              return (
                <li key={c.sha} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((s) => ({ ...s, [c.sha]: !s[c.sha] }))
                    }
                    aria-expanded={isOpen}
                    className="flex flex-col gap-1 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="text-muted-foreground text-[10px] mt-0.5 select-none"
                        aria-hidden="true"
                      >
                        {isOpen ? "▼" : "▶"}
                      </span>
                      <span className="flex-1 text-sm leading-snug">
                        {c.subject}
                      </span>
                      {prefix && (
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium",
                            TONE_STYLES[tone],
                          )}
                        >
                          {prefix}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pl-4 text-[11px] text-muted-foreground tabular-nums">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-foreground underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.sha}
                      </a>
                      <span>·</span>
                      <span>{fmtDate(c.date)}</span>
                      <span>·</span>
                      <span>{c.author}</span>
                    </div>
                  </button>
                  {isOpen && c.body && (
                    <pre className="ml-7 mr-3 mb-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                      {c.body}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Show all / collapse */}
        {filtered.length > MAX_VISIBLE_DEFAULT && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              {showAll
                ? `Collapse to ${MAX_VISIBLE_DEFAULT} most recent`
                : `Show all ${filtered.length} commits`}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
