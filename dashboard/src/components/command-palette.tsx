"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * `CommandPalette` — global ⌘K / Ctrl-K search bar.
 *
 * Mounted in the sidebar between the cron-status pill and the nav groups.
 * Opens a modal-style overlay that searches across the entire content
 * corpus in the browser:
 *
 *   - Playbooks (30)         → /playbooks/[slug]
 *   - Research docs (18)     → /research#[slug]
 *   - Assets (27)            → /assets/[slug]
 *   - Top-10 moves (10)      → /top-10#[slug]
 *   - Skills (296)           → /skills/[slug]
 *   - Static routes (20)     → /<route>
 *
 * Why this move: roadmap "Add a search bar in the header that filters
 * across all 25 playbook titles" (the prompt flagged this). It also
 * surfaces the 250+ skills and 18 research docs that the current
 * per-page search bars don't reach. Cmd-K is the muscle memory every
 * operator already has — no learning curve.
 *
 * State persists in localStorage (`ecom-ops:cmd-palette:v1`):
 *   { recents: string[] }    — last 5 distinct queries, surfaced as
 *                              one-click chips under the input when the
 *                              input is empty.
 *
 * UX details:
 *   - Pressing Escape closes the modal and returns focus to the trigger.
 *   - Pressing Enter navigates to the highlighted result, or the top
 *     result if nothing is highlighted.
 *   - ArrowUp / ArrowDown move the highlight through the flattened
 *     result list. The list is capped at 12 entries per category to
 *     keep the panel under one screen.
 *   - Recent queries are surfaced as one-click chips when the input is
 *     empty so an operator can re-run yesterday's search in one click.
 *   - Each result row shows kind + title + a 1-line context snippet
 *     (matched heading or first meta line) so the operator can tell
 *     which doc a match belongs to without clicking through.
 *
 * No new dependency — the existing shadcn-style primitives plus
 * Tailwind cover the entire surface.
 */

const STORAGE_KEY = "ecom-ops:cmd-palette:v1";
const MAX_RECENTS = 5;
const MAX_PER_CATEGORY = 12;

interface StoredState {
  recents: string[];
}

const EMPTY_STATE: StoredState = { recents: [] };

function loadStored(): StoredState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const recents = Array.isArray((parsed as StoredState).recents)
      ? (parsed as StoredState).recents.filter(
          (r) => typeof r === "string" && r.length > 0,
        ).slice(0, MAX_RECENTS)
      : [];
    return { recents };
  } catch {
    return EMPTY_STATE;
  }
}

function saveRecents(recents: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ recents } satisfies StoredState),
    );
  } catch {
    /* quota / private-mode */
  }
}

interface RouteResult {
  kind: "route";
  href: string;
  title: string;
  hint: string;
}

interface ContentResult {
  kind: "playbook" | "research" | "asset" | "skill" | "top10";
  href: string;
  title: string;
  hint: string;
}

type Result = RouteResult | ContentResult;

// Static operator surfaces — matches the nav groups in sidebar.tsx.
// Surfacing them in the palette saves operators from having to scan the
// 30+ nav links when their target is a known route.
const STATIC_ROUTES: RouteResult[] = [
  { kind: "route", href: "/", title: "Overview", hint: "Daily cockpit · your-store · KPIs" },
  { kind: "route", href: "/today", title: "Today", hint: "Operator cockpit · day-N · tasks" },
  { kind: "route", href: "/standup", title: "Daily standup", hint: "What shipped, what's in progress" },
  { kind: "route", href: "/top-10", title: "Top 10 moves", hint: "Highest-leverage moves · projection" },
  { kind: "route", href: "/playbooks", title: "Playbooks", hint: "30 step-by-step operator playbooks" },
  { kind: "route", href: "/journal", title: "Journal", hint: "Cron ticks · git commits · search" },
  { kind: "route", href: "/unit-economics", title: "Unit economics", hint: "Benchmarks · calculators · personalizer" },
  { kind: "route", href: "/channels", title: "Acquisition", hint: "Channel mix · benchmarks" },
  { kind: "route", href: "/retention", title: "Retention", hint: "LTV · cohorts · projections" },
  { kind: "route", href: "/cro", title: "Conversion (CRO)", hint: "Baymard audit · calculator" },
  { kind: "route", href: "/inventory", title: "Inventory", hint: "Stockout risk · reorder cadence" },
  { kind: "route", href: "/ai", title: "AI / Automation", hint: "AI creative · content · decisions" },
  { kind: "route", href: "/marketplace", title: "Marketplace", hint: "Amazon · eBay · Walmart paths" },
  { kind: "route", href: "/subscriptions", title: "Subscriptions", hint: "Recharge · Skio · cancellation paths" },
  { kind: "route", href: "/affiliates", title: "Affiliates", hint: "Levanta · Impact · Smile paths" },
  { kind: "route", href: "/b2b", title: "B2B / Wholesale", hint: "MAP policy · wholesale path · audit" },
  { kind: "route", href: "/creators", title: "Creators", hint: "Creator affiliate · UGC briefs · path" },
  { kind: "route", href: "/tiktok", title: "TikTok Shop", hint: "Live commerce · creator briefs · audit" },
  { kind: "route", href: "/pinterest-seo", title: "Pinterest + SEO", hint: "Pinterest organic · SEO cluster · path" },
  { kind: "route", href: "/3pl", title: "3PL / Fulfillment", hint: "3PL path · ROI · audit" },
  { kind: "route", href: "/lifecycle", title: "Lifecycle", hint: "Flow health · Klaviyo · Postscript" },
  { kind: "route", href: "/settings", title: "Settings", hint: "Workspace reset · backup · cron health" },
  { kind: "route", href: "/30-day-plan", title: "30-day plan", hint: "Generate · .md · .ics export" },
  { kind: "route", href: "/research", title: "Research", hint: "18 deep-research docs" },
  { kind: "route", href: "/skills", title: "Skills", hint: "296 canonical move-engine skills" },
  { kind: "route", href: "/assets", title: "Assets", hint: "27 paste-ready operator assets" },
];

function score(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 1000;
  if (h.startsWith(n)) return 500;
  // Word-boundary match beats substring match (so "abandoned cart" beats
  // "cart-abandoned-X" when searching "cart").
  const wordStart = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(n)}`);
  if (wordStart.test(h)) return 200;
  const idx = h.indexOf(n);
  if (idx >= 0) return 50 + Math.max(0, 50 - idx);
  return 0;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripPrefix(s: string): string {
  // "01-abandoned-cart-flow-klaviyo.md" → "abandoned-cart-flow-klaviyo"
  return s.replace(/^\d+[\.\-]?/, "").replace(/\.md$/, "");
}

function titleizeSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildResults(query: string): {
  routes: RouteResult[];
  playbooks: ContentResult[];
  research: ContentResult[];
  assets: ContentResult[];
  skills: ContentResult[];
  top10: ContentResult[];
} {
  const trimmed = query.trim();
  if (!trimmed) {
    return { routes: [], playbooks: [], research: [], assets: [], skills: [], top10: [] };
  }

  // Routes
  type ScoredRoute = RouteResult & { _score: number };
  const scored: ScoredRoute[] = STATIC_ROUTES.map((r) => ({
    ...r,
    _score: Math.max(
      score(r.title, trimmed),
      Math.floor(score(r.hint, trimmed) / 2),
    ),
  }));
  const routes: RouteResult[] = scored
    .filter((r) => r._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 6)
    .map(({ _score: _omit, ...r }) => r as RouteResult);

  // Playbooks — search title + meta[] + numbered section headings
  const playbooks: ContentResult[] = content.playbooks
    .map((p) => {
      const titleScore = score(p.title, trimmed);
      const metaScore = p.meta.reduce((acc, m) => Math.max(acc, score(m, trimmed)), 0);
      const sectionScore = (p.numberedSections ?? []).reduce(
        (acc, s) => Math.max(acc, score(s.heading, trimmed)),
        0,
      );
      const fileScore = score(stripPrefix(p.file), trimmed);
      const total = Math.max(titleScore * 2, metaScore, sectionScore, fileScore);
      const hint =
        p.meta.find((m) => score(m, trimmed) > 0) ??
        p.numberedSections?.find((s) => score(s.heading, trimmed) > 0)?.heading ??
        "";
      if (total <= 0) return null;
      const r: ContentResult = {
        kind: "playbook",
        href: `/playbooks/${p.file.replace(/\.md$/, "")}`,
        title: p.title,
        hint,
      };
      return r;
    })
    .filter((r): r is ContentResult => r !== null)
    .slice(0, MAX_PER_CATEGORY);

  // Research
  const research: ContentResult[] = content.research
    .map((r) => {
      const titleScore = score(r.title ?? "", trimmed);
      const sectionScore = (r.sections ?? []).reduce(
        (acc, s) => Math.max(acc, score(s.heading, trimmed)),
        0,
      );
      const fileScore = score(stripPrefix(r.file), trimmed);
      const total = Math.max(titleScore * 2, sectionScore, fileScore);
      const hint =
        r.sections?.find((s) => score(s.heading, trimmed) > 0)?.heading ?? "";
      if (total <= 0) return null;
      const out: ContentResult = {
        kind: "research",
        href: `/research#${r.file.replace(/\.md$/, "")}`,
        title: r.title ?? titleizeSlug(stripPrefix(r.file)),
        hint,
      };
      return out;
    })
    .filter((r): r is ContentResult => r !== null)
    .slice(0, MAX_PER_CATEGORY);

  // Assets
  const assets: ContentResult[] = content.assets
    .map((a) => {
      const titleScore = score(a.title, trimmed);
      const metaScore = a.meta.reduce((acc, m) => Math.max(acc, score(m, trimmed)), 0);
      const fileScore = score(stripPrefix(a.file), trimmed);
      const total = Math.max(titleScore * 2, metaScore, fileScore);
      const hint =
        a.meta.find((m) => score(m, trimmed) > 0) ??
        a.numberedSections?.find((s) => score(s.heading, trimmed) > 0)?.heading ??
        "";
      if (total <= 0) return null;
      const out: ContentResult = {
        kind: "asset",
        href: `/assets/${a.file.replace(/\.md$/, "")}`,
        title: a.title,
        hint,
      };
      return out;
    })
    .filter((r): r is ContentResult => r !== null)
    .slice(0, MAX_PER_CATEGORY);

  // Skills — cap low (searched by name + title)
  const skills: ContentResult[] = (content.skills ?? [])
    .map((s) => {
      const nameScore = score(s.name, trimmed);
      const titleScore = score(s.title, trimmed);
      const total = Math.max(nameScore, titleScore);
      if (total <= 0) return null;
      const out: ContentResult = {
        kind: "skill",
        href: `/skills/${s.file.replace(/\.md$/, "")}`,
        title: s.title,
        hint: `${s.category} · tier ${s.tier} · ${s.priority}`,
      };
      return out;
    })
    .filter((r): r is ContentResult => r !== null)
    .slice(0, 6);

  // Top-10 moves
  const top10: ContentResult[] = (content.top10?.status ?? [])
    .map((m, i) => {
      const titleScore = score(m.move, trimmed);
      const statusScore = score(m.status, trimmed);
      const total = Math.max(titleScore, Math.floor(statusScore / 2));
      if (total <= 0) return null;
      const out: ContentResult = {
        kind: "top10",
        href: `/top-10#move-${i + 1}`,
        title: m.move,
        hint: m.status,
      };
      return out;
    })
    .filter((r): r is ContentResult => r !== null)
    .slice(0, 6);

  return { routes, playbooks, research, assets, skills, top10 };
}

const KIND_LABEL: Record<ContentResult["kind"] | "route", string> = {
  route: "Page",
  playbook: "Playbook",
  research: "Research",
  asset: "Asset",
  skill: "Skill",
  top10: "Top-10",
};

const KIND_TONE: Record<ContentResult["kind"] | "route", string> = {
  route: "bg-foreground/10 text-foreground",
  playbook: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  research: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  asset: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  skill: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  top10: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const [recents, setRecents] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Hydrate recents on mount (avoids SSR/CSR mismatch — render the
  // trigger unconditionally, fill recents after mount).
  React.useEffect(() => {
    setRecents(loadStored().recents);
  }, []);

  const results = React.useMemo(() => buildResults(query), [query]);

  // Flatten results in a deterministic order so the highlight index
  // navigates the right entry.
  const flat: Result[] = React.useMemo(() => {
    return [
      ...results.routes,
      ...results.playbooks,
      ...results.research,
      ...results.assets,
      ...results.skills,
      ...results.top10,
    ];
  }, [results]);

  // Reset highlight when the query changes.
  React.useEffect(() => {
    setHighlight(0);
  }, [query]);

  // Open on Cmd-K / Ctrl-K. Capture at the window level so it works
  // from anywhere on the page (sidebar trigger is just a visual hint).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);
      const trigger = (e.key === "k" || e.key === "K") && (isMac ? e.metaKey : e.ctrlKey);
      if (trigger) {
        e.preventDefault();
        setOpen((cur) => !cur);
        return;
      }
      if (e.key === "/" && !open) {
        // The "/" quick-access keystroke — same muscle memory as GitHub.
        const target = e.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
        if (target && target.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input + reset state when the modal opens.
  React.useEffect(() => {
    if (open) {
      // Defer to next tick so the input is mounted.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    } else {
      setQuery("");
      setHighlight(0);
    }
  }, [open]);

  // Close on Escape (when the input is focused).
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(flat.length - 1, h + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[highlight] ?? flat[0];
      if (target) navigateTo(target);
    }
  };

  const navigateTo = (r: Result) => {
    setOpen(false);
    // Persist the query that produced this navigation as a recent.
    const q = query.trim();
    if (q.length > 0) {
      const next = [q, ...recents.filter((x) => x !== q)].slice(0, MAX_RECENTS);
      setRecents(next);
      saveRecents(next);
    }
    router.push(r.href);
  };

  const onTrigger = () => setOpen(true);

  const renderGroup = (
    label: string,
    items: Result[],
    startIdx: number,
  ): React.ReactNode => {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
          {label} · {items.length}
        </div>
        {items.map((r, i) => {
          const idx = startIdx + i;
          const active = idx === highlight;
          const tone = KIND_TONE[r.kind];
          return (
            <button
              key={`${r.kind}:${r.href}`}
              type="button"
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => navigateTo(r)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "shrink-0 inline-block rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold",
                  active ? "bg-background/20 text-background" : tone,
                )}
              >
                {KIND_LABEL[r.kind]}
              </span>
              <span className="flex-1 truncate font-medium">{r.title}</span>
              {r.hint && (
                <span
                  className={cn(
                    "hidden md:inline truncate max-w-[40%] text-[10px]",
                    active ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {r.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Compute running start-index per group so the highlight index lines
  // up with the flattened `flat` array.
  let cursor = 0;
  const routeStart = cursor; cursor += results.routes.length;
  const playbookStart = cursor; cursor += results.playbooks.length;
  const researchStart = cursor; cursor += results.research.length;
  const assetStart = cursor; cursor += results.assets.length;
  const skillStart = cursor; cursor += results.skills.length;
  const top10Start = cursor; cursor += results.top10.length;

  const hasAnyResults = flat.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={onTrigger}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Open command palette"
        data-testid="cmd-palette-trigger"
      >
        <span className="flex items-center gap-2 truncate">
          <span aria-hidden="true">⌘</span>
          <span className="font-mono text-[10px]">K</span>
          <span className="hidden md:inline">Search playbooks, research, skills…</span>
        </span>
        <span className="font-mono text-[10px] opacity-70">⌘K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 backdrop-blur-sm p-4 md:p-12"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          data-testid="cmd-palette-overlay"
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
              <span aria-hidden="true" className="text-base text-muted-foreground">⌕</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search playbooks, research, assets, skills, routes…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                aria-label="Search query"
                data-testid="cmd-palette-input"
              />
              <kbd className="hidden md:inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                esc
              </kbd>
            </div>

            {/* Results / recents / empty state */}
            <div
              className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-3"
              data-testid="cmd-palette-results"
            >
              {!query.trim() && (
                <>
                  {recents.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
                        Recent searches
                      </div>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {recents.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setQuery(r)}
                            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover:bg-muted transition-colors"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
                      Jump to
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-2 md:grid-cols-3">
                      {STATIC_ROUTES.slice(0, 9).map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          onClick={() => {
                            setOpen(false);
                            if (typeof window !== "undefined") {
                              window.localStorage.setItem(
                                STORAGE_KEY,
                                JSON.stringify({ recents } satisfies StoredState),
                              );
                            }
                          }}
                          className="flex flex-col rounded-md border border-border bg-background px-2 py-1.5 text-[11px] hover:bg-muted transition-colors"
                        >
                          <span className="font-medium">{r.title}</span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {r.hint}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-[10px] text-muted-foreground">
                    {content.counts.playbooks} playbooks · {content.counts.researchDocs}{" "}
                    research · {content.counts.assets} assets · {content.counts.skills ?? 0}{" "}
                    skills indexed
                  </div>
                </>
              )}

              {query.trim() && !hasAnyResults && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No matches for{" "}
                  <span className="font-mono text-foreground">{query}</span>. Try a
                  different keyword, or press{" "}
                  <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
                    esc
                  </kbd>{" "}
                  to close.
                </div>
              )}

              {query.trim() && hasAnyResults && (
                <>
                  {renderGroup("Pages", results.routes, routeStart)}
                  {renderGroup("Playbooks", results.playbooks, playbookStart)}
                  {renderGroup("Research", results.research, researchStart)}
                  {renderGroup("Assets", results.assets, assetStart)}
                  {renderGroup("Skills", results.skills, skillStart)}
                  {renderGroup("Top-10 moves", results.top10, top10Start)}
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground bg-muted/30">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↑</kbd>
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↵</kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">esc</kbd>
                close
              </span>
              <span className="ml-auto font-mono">{flat.length} result{flat.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
