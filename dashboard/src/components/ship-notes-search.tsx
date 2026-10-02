"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LaunchPlanNotesMap,
  loadLaunchPlanNotes,
  summariseLaunchPlanNotes,
} from "@/lib/launch-plan-progress-notes";
import {
  LaunchPlanProgressMap,
  loadLaunchPlanProgress,
} from "@/lib/launch-plan-progress";
import {
  buildShipNoteSearchIndex,
  highlightMatchedText,
  searchShipNotes,
  searchShipNotesToMarkdown,
  snippetForHit,
} from "@/lib/launch-plan-notes-search";
import { cn } from "@/lib/utils";

/**
 * `ShipNotesSearch` — Free-text search across the per-day ship notes
 * for all 10 launch-plan generators (Move #N.4).
 *
 * The companion to `LaunchPlanProgressTracker`. Operators accumulate
 * notes as they ship — "Day 5 blocked: Klaviyo template QA held by
 * brand team", "Day 8 Shop Pay live in prod", "Day 12 pending legal
 * review", etc. Once a few weeks of notes accumulate, free-text
 * search across the corpus is load-bearing: "find every 'blocked'
 * mention", "find every 'Klaviyo' reference", "find every note where
 * a specific teammate is @-mentioned".
 *
 * Reads the same two localStorage keys the tracker writes:
 *   - `ecom-ops:launch-plan-progress:v1` (which days shipped)
 *   - `ecom-ops:launch-plan-progress-notes:v1` (the per-day notes)
 *
 * Hydration-safe: SSR renders the empty-state stub; the client
 * hydrates from localStorage on mount. Cross-tab sync via the
 * `storage` event for both keys.
 *
 * Renders:
 *   - Search input (debounced 150ms)
 *   - Indexed-count line ("3 indexed")
 *   - Result rows: per-hit `<mark>` highlight + plan link + day link
 *     back to the per-plan tracker
 *   - Copy / Download markdown buttons for the result rollup
 *   - Suggested-queries chip row for common operator workflows
 */
export function ShipNotesSearch() {
  const [progress, setProgress] = useState<LaunchPlanProgressMap>({});
  const [notes, setNotes] = useState<LaunchPlanNotesMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    setProgress(loadLaunchPlanProgress());
    setNotes(loadLaunchPlanNotes());
    setHydrated(true);
  }, []);

  // Cross-tab sync — both keys.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(ev: StorageEvent) {
      if (ev.key === "ecom-ops:launch-plan-progress:v1") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
          setProgress(parsed ?? {});
        } catch {
          /* ignore */
        }
      } else if (ev.key === "ecom-ops:launch-plan-progress-notes:v1") {
        try {
          const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
          setNotes(parsed ?? {});
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Debounce the query 150ms.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(rawQuery), 150);
    return () => window.clearTimeout(t);
  }, [rawQuery]);

  const index = useMemo(
    () => buildShipNoteSearchIndex(notes, progress),
    [notes, progress]
  );

  const result = useMemo(
    () => searchShipNotes(index, debouncedQuery, 100),
    [index, debouncedQuery]
  );

  const notesRollup = useMemo(
    () => summariseLaunchPlanNotes(notes, progress),
    [notes, progress]
  );

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(searchShipNotesToMarkdown(result))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function handleDownload() {
    if (typeof window === "undefined") return;
    const md = searchShipNotesToMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-plan-notes-search-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const queryTrimmed = debouncedQuery.trim();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Search ship notes</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Cross-plan full-text
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {notesRollup.totalNotes} indexed
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Free-text search across every note attached to a ticked day on
          all 10 launch-plan pages. Multi-term queries are AND-joined
          (e.g. <code>Klaviyo blocked</code> finds notes that mention
          both). Quoted phrases match literally (e.g.{" "}
          <code>&quot;brand team&quot;</code>).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Query
            </span>
            <input
              type="search"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder='e.g. blocked, "brand team", Klaviyo QA'
              aria-label="Search ship notes"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              "blocked",
              "Klaviyo",
              "Shop Pay",
              '"legal review"',
              "pending",
              '"brand team"',
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRawQuery(s)}
                className={cn(
                  "rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] hover:bg-muted",
                  rawQuery === s && "border-foreground/40 bg-muted"
                )}
              >
                {s}
              </button>
            ))}
            {queryTrimmed && (
              <button
                type="button"
                onClick={() => setRawQuery("")}
                className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {hydrated ? (
              queryTrimmed ? (
                <>
                  {result.hits.length} match
                  {result.hits.length === 1 ? "" : "es"} of{" "}
                  {notesRollup.totalNotes} indexed note
                  {notesRollup.totalNotes === 1 ? "" : "s"}
                </>
              ) : (
                <>
                  {notesRollup.totalNotes} indexed note
                  {index.length === 1 ? "" : "s"} across{" "}
                  {notesRollup.plansWithNotes} plan
                  {notesRollup.plansWithNotes === 1 ? "" : "s"} — type
                  above to search
                </>
              )
            ) : (
              "Hydrating…"
            )}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!queryTrimmed || result.hits.length === 0}
              className={cn(
                "rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                copied && "border-emerald-500/60 bg-emerald-500/10 text-emerald-700"
              )}
            >
              {copied ? "Copied!" : "Copy result markdown"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!queryTrimmed || result.hits.length === 0}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download .md
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {hydrated && queryTrimmed && result.hits.length === 0 && (
            <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              No matches for{" "}
              <code className="rounded bg-background px-1 text-foreground">
                {debouncedQuery}
              </code>
              . Try a broader term or shorter phrase.
            </div>
          )}

          {hydrated &&
            queryTrimmed &&
            result.hits.map((hit, idx) => {
              const snip = snippetForHit(hit, 40);
              const segs = highlightMatchedText(
                snip.matched,
                snip.localMatchStart,
                snip.localMatchEnd
              );
              return (
                <div
                  key={`${hit.planId}-${hit.day}-${idx}`}
                  className="flex flex-col gap-1 rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <Link
                      href={hit.planHref}
                      className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:underline"
                    >
                      {hit.planTitle}
                    </Link>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 tabular-nums text-foreground">
                      Day {hit.day}
                    </span>
                    <span>shipped {hit.shippedAt.slice(0, 10)}</span>
                    <span className="ml-auto tabular-nums">
                      {hit.matchCount} match
                      {hit.matchCount === 1 ? "" : "es"}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed text-foreground">
                    {snip.prefix}
                    {segs.map((s, i) =>
                      s.highlighted ? (
                        <mark
                          key={i}
                          className="rounded-sm bg-amber-300/60 px-0.5 text-foreground"
                        >
                          {s.text}
                        </mark>
                      ) : (
                        <span key={i}>{s.text}</span>
                      )
                    )}
                    {snip.suffix}
                  </div>
                </div>
              );
            })}

          {hydrated &&
            !queryTrimmed &&
            notesRollup.totalNotes === 0 && (
              <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                No notes yet. Open any ticked day on a launch-plan
                card and type a short note — it&apos;ll appear here
                once you start writing.
              </div>
            )}

          {hydrated &&
            !queryTrimmed &&
            notesRollup.totalNotes > 0 && (
              <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                Showing all {notesRollup.totalNotes} indexed notes
                across {notesRollup.plansWithNotes} plan
                {notesRollup.plansWithNotes === 1 ? "" : "s"}. Type a
                query above to filter, or click a chip to start.
              </div>
            )}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Search reads{" "}
          <code className="rounded bg-muted px-1">
            ecom-ops:launch-plan-progress-notes:v1
          </code>{" "}
          +{" "}
          <code className="rounded bg-muted px-1">
            ecom-ops:launch-plan-progress:v1
          </code>
          . Notes on un-ticked days are excluded from the index.
        </p>
      </CardContent>
    </Card>
  );
}