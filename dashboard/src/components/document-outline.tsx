"use client";

/**
 * `DocumentOutline` — Move #N.26 sticky TOC sidebar for the long-form
 * documents on `/research/[slug]` and `/skills/[slug]`.
 *
 * What the operator sees:
 *
 *   ┌─────────────────────────────────┐
 *   │ Document outline · 12 sections │
 *   │ 3 of 12 viewed · scroll to read │
 *   │ ───────────────────────────────  │
 *   │  Unit economics                 │   ← currently viewed (emerald
 *   │  CAC payback                    │     │
 *   │  AOV tiers                      │     │
 *   │    └ consumables               │   ← indented H3
 *   │    └ apparel                   │     │
 *   │  ─── show all 12 ───            │   ← when >8 rows
 *   └─────────────────────────────────┘
 *
 * Sticky on the left column on desktop (≥md breakpoint), collapses
 * to a top-of-page in-flow block on mobile so the sticky behavior
 * doesn't break on small viewports.
 *
 * Hydration-safe:
 *
 *   - SSR renders the stub (`<DocumentOutlineStub />`) — a static
 *     placeholder with the same `data-testid="document-outline-stub"`
 *     + stub copy "Loading outline…" + stub caption "Outline appears
 *     after first paint." The stub has NO interactivity and NO
 *     IntersectionObserver, so it doesn't add any client-side weight
 *     during the SSR pass.
 *   - On mount, `useEffect` computes the initial outline from the
 *     server-passed `markdown` prop via `buildDocumentOutline`, then
 *     sets up the IntersectionObserver on the actual `<h2 id="...">` /
 *     `<h3 id="...">` elements in the rendered markdown article.
 *   - The observer callback updates `viewedHashes` (Set<string>); the
 *     sidebar re-renders with the new "X of Y viewed" badge.
 *   - The "active section" highlight is also observer-driven: the
 *     topmost intersecting heading is `activeHash`. The sidebar shows
 *     a left-border accent on that row.
 *
 * Persistence: this component is **read-only**. It does NOT write to
 * localStorage. The viewed-count is purely a function of the current
 * IntersectionObserver state and resets on page reload — the operator
 * doesn't need cross-session "I last-read the CAC payback section"
 * state for a long doc. (Future Move #N.26.x could layer on a
 * "last-read position" localStorage key if there's demand.)
 *
 * Anchor behavior: each row is an `<a href="#<hash>">` that smooth-
 * scrolls to the rendered heading via the existing `scroll-mt-24` CSS
 * on the H2/H3 elements. The browser handles the URL hash update so
 * the operator can copy/paste the section URL.
 *
 * No new npm dependencies. Uses native `IntersectionObserver` +
 * `window.scrollTo({ behavior: "smooth" })`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  buildDocumentOutline,
  outlineHeadline,
  outlineH2Count,
  outlineProgressLabel,
  outlineToneClass,
  truncateOutlineHeading,
  DEFAULT_OUTLINE_VISIBLE_ROWS,
  CANONICAL_DOCUMENT_OUTLINE,
  type OutlineSummary,
} from "@/lib/document-outline";

interface DocumentOutlineProps {
  /** Raw markdown body (post-H1-stripped). The component extracts the
   *  H2/H3 outline from this on mount. */
  markdown: string;
  /** Optional CSS class for the outer sticky container. */
  className?: string;
  /** When true, mount the sticky sidebar variant (desktop ≥md). When
   *  false, mount the in-flow collapsible variant (mobile <md). */
  sticky?: boolean;
}

/** Stub rendered during SSR + until hydration completes. Same shape as
 *  the post-hydration outline card so the layout doesn't shift. */
function DocumentOutlineStub({ sticky }: { sticky: boolean }) {
  return (
    <aside
      data-testid="document-outline-stub"
      className={cn(
        "rounded-md border border-border bg-card",
        sticky ? "sticky top-20" : "",
      )}
    >
      <div className="p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Document outline
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {CANONICAL_DOCUMENT_OUTLINE.stubLabel}
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground/70">
          {CANONICAL_DOCUMENT_OUTLINE.stubCaption}
        </div>
      </div>
    </aside>
  );
}

export function DocumentOutline({
  markdown,
  className,
  sticky = true,
}: DocumentOutlineProps) {
  // SSR + first paint: render the stub. We avoid calling
  // buildDocumentOutline during SSR (it's a pure function on a string,
  // but the IntersectionObserver wiring below MUST run client-side).
  const [hydrated, setHydrated] = useState(false);
  const [summary, setSummary] = useState<OutlineSummary>({
    rows: [],
    total: 0,
    h2Count: 0,
    h3Count: 0,
  });
  const [viewedHashes, setViewedHashes] = useState<Set<string>>(new Set());
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [expandedH2, setExpandedH2] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // On mount, compute the outline + start observing headings.
  useEffect(() => {
    const s = buildDocumentOutline(markdown);
    setSummary(s);
    setHydrated(true);

    // Auto-expand the first 2 H2 sections so the operator sees
    // sub-sections immediately on a long doc (no extra clicks).
    const initialExpanded = new Set<string>();
    let expanded = 0;
    for (const r of s.rows) {
      if (r.level === 2 && expanded < 2) {
        initialExpanded.add(r.hash);
        expanded++;
      }
    }
    setExpandedH2(initialExpanded);

    if (typeof window === "undefined") return;
    if (s.total === 0) return;

    // Observe every H2/H3 in the rendered markdown article. The TOC
    // anchor is <a href="#<hash>"> and the markdown renderer emits
    // <h2 id="<hash>"> / <h3 id="<hash>"> with the same slugify().
    const observed: Element[] = [];
    const visibleHashes = new Set<string>();
    let currentActive: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) {
            visibleHashes.add(id);
            // Pick the topmost intersecting heading as "active".
            if (currentActive === null) {
              currentActive = id;
              setActiveHash(id);
            }
          } else {
            // Don't remove from visibleHashes (counts as "viewed" forever
            // for this session) — only update activeHash if the leaving
            // heading was the current active.
            if (currentActive === id) {
              currentActive = null;
            }
          }
        }
        // Recompute activeHash: pick the topmost (smallest top in px)
        // intersecting heading. This handles the case where the
        // observer fires "leave" on the old active before "enter" on
        // the new one — so we just re-scan all observed entries.
        let topmostHash: string | null = null;
        let topmostY = Number.POSITIVE_INFINITY;
        for (const el of observed) {
          if (!visibleHashes.has(el.id)) continue;
          const rect = el.getBoundingClientRect();
          // Anchor to the top 25% of the viewport so "active" flips
          // BEFORE the heading scrolls out of view.
          if (rect.top < topmostY && rect.top < window.innerHeight * 0.25) {
            topmostY = rect.top;
            topmostHash = el.id;
          }
        }
        if (topmostHash !== null) {
          setActiveHash(topmostHash);
        }
        setViewedHashes(new Set(visibleHashes));
      },
      {
        // Anchor the active-flip threshold at the top 25% of the
        // viewport. rootMargin shrinks the "intersecting" zone so a
        // heading at the bottom of the viewport doesn't count as
        // "viewed" yet.
        rootMargin: "-10% 0px -75% 0px",
        threshold: 0,
      },
    );

    // Find headings in the rendered article. The detail pages wrap
    // the markdown body in <article>; we scope the query there so
    // the outline never picks up unrelated H2s (e.g. the page header
    // H1 doesn't have an id, but if a sibling Card ever introduced
    // one, we'd ignore it).
    const article = document.querySelector(
      "article[data-document-body='true']",
    ) as HTMLElement | null;
    const scope: ParentNode = article || document;
    const headings = scope.querySelectorAll("h2[id], h3[id]");
    headings.forEach((h) => {
      observer.observe(h);
      observed.push(h);
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [markdown]);

  const viewedCount = viewedHashes.size;
  const h2Total = outlineH2Count(summary);

  // Progress is tracked against H2 rows only (canonical "section"
  // unit). H3s are sub-sections and only count when their parent H2
  // is viewed.
  const h2ViewedCount = useMemo(() => {
    let n = 0;
    for (const r of summary.rows) {
      if (r.level === 2 && viewedHashes.has(r.hash)) n++;
    }
    return n;
  }, [summary.rows, viewedHashes]);

  // Visible rows (H2 always; H3 only when parent H2 is expanded).
  const visibleRows = useMemo(() => {
    if (showAll) return summary.rows;
    // First DEFAULT_OUTLINE_VISIBLE_ROWS H2 rows + their (collapsed)
    // H3 children, IF the H2 is in the first N.
    const h2Rows = summary.rows.filter((r) => r.level === 2);
    const firstH2Hashes = new Set(
      h2Rows.slice(0, DEFAULT_OUTLINE_VISIBLE_ROWS).map((r) => r.hash),
    );
    return summary.rows.filter((r) => {
      if (r.level === 2) return firstH2Hashes.has(r.hash);
      // H3: include when its preceding H2 is in the visible set
      // (so the operator sees the "…" preview of sub-sections).
      const parentIdx = summary.rows.findIndex(
        (x) => x.level === 2 && x.hash && summary.rows.indexOf(x) < summary.rows.indexOf(r),
      );
      const parent = parentIdx >= 0 ? summary.rows[parentIdx] : null;
      return parent && firstH2Hashes.has(parent.hash);
    });
  }, [summary.rows, showAll]);

  // Show-all toggle state: show the button only when there are more
  // H2 rows than the default visible count.
  const hasMoreH2 = useMemo(() => {
    return summary.h2Count > DEFAULT_OUTLINE_VISIBLE_ROWS;
  }, [summary.h2Count]);

  // Click handler: smooth-scroll + update URL hash without jumping.
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      // Let the browser handle the default jump if smooth-scroll is
      // unavailable (very old browsers). Otherwise prevent default and
      // smooth-scroll.
      if (typeof window === "undefined") return;
      const target = document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without triggering a navigation jump.
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", `#${hash}`);
      }
      // Immediately mark the target as viewed + active so the operator
      // sees instant feedback even before the IntersectionObserver fires.
      setViewedHashes((prev) => new Set([...prev, hash]));
      setActiveHash(hash);
    },
    [],
  );

  // Toggle H2 expand/collapse for sub-sections.
  const toggleH2Expanded = useCallback((hash: string) => {
    setExpandedH2((prev) => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  }, []);

  // Stub during SSR + first paint.
  if (!hydrated) {
    return (
      <div className={cn(className, "")}>
        <DocumentOutlineStub sticky={sticky} />
      </div>
    );
  }

  // Empty markdown — render an "empty" card, not the stub.
  if (summary.total === 0) {
    return (
      <aside
        data-testid="document-outline-empty"
        className={cn(
          "rounded-md border border-border bg-card p-3",
          sticky ? "sticky top-20" : "",
          className,
        )}
      >
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Document outline
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          No headings parsed.
        </div>
      </aside>
    );
  }

  return (
    <aside
      data-testid="document-outline"
      data-stuck={sticky ? "1" : "0"}
      className={cn(
        "rounded-md border",
        outlineToneClass(summary, h2ViewedCount),
        sticky ? "sticky top-20" : "",
        className,
      )}
    >
      <div className="p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {outlineHeadline(summary)}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px]">
          <span
            className={cn(
              "tabular-nums font-medium",
              h2ViewedCount >= h2Total
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300",
            )}
          >
            {outlineProgressLabel(h2ViewedCount, h2Total)}
          </span>
          {h2ViewedCount >= h2Total && h2Total > 0 ? (
            <span
              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300"
              data-testid="document-outline-done"
            >
              done
            </span>
          ) : null}
        </div>
      </div>
      <div className="border-t border-border/50 px-1 py-1">
        <ul className="space-y-0.5" data-testid="document-outline-list">
          {visibleRows.map((r) => {
            const isActive = r.hash === activeHash;
            const isViewed = viewedHashes.has(r.hash);
            const isExpanded = expandedH2.has(r.hash);
            // H2 rows: clickable anchor + caret toggle for sub-sections.
            // H3 rows: just a clickable anchor, indented.
            return (
              <li
                key={`${r.level}-${r.index}-${r.hash}`}
                className={cn(
                  "relative",
                  r.level === 3 ? "pl-5" : "",
                )}
                data-level={r.level}
                data-testid={`document-outline-row-${r.level}-${r.hash}`}
              >
                {r.level === 2 ? (
                  <div
                    className={cn(
                      "group flex items-stretch gap-0.5 rounded",
                      isActive
                        ? "bg-emerald-500/10"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {/* H2 caret: only when the H2 has at least one H3 child */}
                    <button
                      type="button"
                      onClick={() => toggleH2Expanded(r.hash)}
                      aria-expanded={isExpanded ? "true" : "false"}
                      data-testid={`document-outline-toggle-${r.hash}`}
                      className={cn(
                        "flex h-6 w-4 shrink-0 items-center justify-center text-[10px] text-muted-foreground hover:text-foreground",
                        // Hide caret if there are no H3s at all.
                        summary.h3Count === 0 ? "invisible" : "",
                      )}
                      tabIndex={summary.h3Count === 0 ? -1 : 0}
                    >
                      {isExpanded ? "▾" : "▸"}
                    </button>
                    <a
                      href={`#${r.hash}`}
                      onClick={(e) => handleAnchorClick(e, r.hash)}
                      className={cn(
                        "flex-1 truncate rounded px-1.5 py-1 text-[11px] leading-snug",
                        isActive
                          ? "font-semibold text-emerald-700 dark:text-emerald-300"
                          : isViewed
                          ? "text-foreground/90"
                          : "text-muted-foreground",
                        "border-l-2",
                        isActive
                          ? "border-emerald-500"
                          : "border-transparent",
                      )}
                      title={r.heading}
                      data-active={isActive ? "1" : "0"}
                      data-viewed={isViewed ? "1" : "0"}
                    >
                      {truncateOutlineHeading(r.heading)}
                    </a>
                  </div>
                ) : (
                  <a
                    href={`#${r.hash}`}
                    onClick={(e) => handleAnchorClick(e, r.hash)}
                    className={cn(
                      "block truncate rounded px-1.5 py-1 text-[11px] leading-snug",
                      isActive
                        ? "font-semibold text-emerald-700 dark:text-emerald-300"
                        : isViewed
                        ? "text-foreground/80"
                        : "text-muted-foreground",
                      "border-l-2 ml-3",
                      isActive ? "border-emerald-500" : "border-transparent",
                    )}
                    title={r.heading}
                    data-active={isActive ? "1" : "0"}
                    data-viewed={isViewed ? "1" : "0"}
                  >
                    {truncateOutlineHeading(r.heading)}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        {hasMoreH2 && !showAll ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-2 w-full rounded border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            data-testid="document-outline-show-all"
          >
            Show all {summary.h2Count} sections
          </button>
        ) : null}
        {hasMoreH2 && showAll ? (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="mt-2 w-full rounded border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            data-testid="document-outline-show-less"
          >
            Collapse
          </button>
        ) : null}
      </div>
    </aside>
  );
}