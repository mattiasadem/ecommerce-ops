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
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import type { Playbook } from "@/lib/content";
import {
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  SHIPPED_PLAYBOOKS_UPDATE_EVENT,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import {
  buildDriftFixRecipe,
  findPlaybook,
  type DriftFixRecipeSummary,
} from "@/lib/drift-fix-recipe";
import {
  RE_READ_STORAGE_KEY,
  RE_READ_UPDATE_EVENT,
  buildReReadSummary,
  clearReRead,
  loadReReadMap,
  markReRead,
  reReadHeadline,
  reReadRelativeDay,
  reReadRowTone,
  reReadSectionTone,
  reReadToneClass,
  renderReReadMarkdown,
  resetReReadForPlaybook,
  type ReReadMap,
  type ReReadSummary,
} from "@/lib/recipe-reread";

interface Props {
  playbooks: Playbook[];
  maxRows?: number;
}

/**
 * `Recipe re-read progress` — Move #N.20 card on `/` Overview, mounted
 * directly below the Move #N.18 drift fix recipe card.
 *
 * Closes the canonical loop on Move #N.18: the recipe card tells the
 * operator *which* sections to re-read first; this card tracks *which*
 * sections the operator has actually re-read. Per-row a "X of Y re-read"
 * progress bar + a chain of section chips with Mark / Unmark buttons,
 * so the operator can close the loop on actual re-learning — not just
 * "drift detected" or "here's a recipe" but "I've now re-read 2 of the
 * 3 sections on Move #1, the third is the one I was avoiding."
 *
 * Storage: `ecom-ops:recipe-reread:v1` (a separate key from
 * `ecom-ops:shipped-playbooks:v1` because the shipped map is a
 * one-shot event while the re-read map is a continuous state).
 *
 * Hydration safety: card renders a "Loading progress…" stub on first
 * paint so the SSG-rendered output byte-matches the first client
 * render. Real progress hydrates on mount.
 *
 * Cross-tab + same-tab sync: `storage` event (other tabs updating the
 * re-read key OR the shipped key) AND the same-tab
 * `ecom-ops:recipe-reread:update` CustomEvent so toggling a section on
 * this card updates the recipe card AND vice versa.
 */
export function RecipeRereadProgress({ playbooks, maxRows = 5 }: Props) {
  const [shipped, setShipped] = useState<Record<string, unknown>>({});
  const [reReadMap, setReReadMap] = useState<ReReadMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setReReadMap(loadReReadMap());
    setHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (!e.key) {
        setShipped(loadShippedPlaybooks());
        setReReadMap(loadReReadMap());
        return;
      }
      if (e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY) {
        setShipped(loadShippedPlaybooks());
      } else if (e.key === RE_READ_STORAGE_KEY) {
        setReReadMap(loadReReadMap());
      }
    };
    const handleShippedUpdate = () => setShipped(loadShippedPlaybooks());
    const handleReReadUpdate = () => setReReadMap(loadReReadMap());
    window.addEventListener("storage", handleStorage);
    window.addEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, handleShippedUpdate);
    window.addEventListener(RE_READ_UPDATE_EVENT, handleReReadUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, handleShippedUpdate);
      window.removeEventListener(RE_READ_UPDATE_EVENT, handleReReadUpdate);
    };
  }, []);

  // Build the per-shipped-row input the recipe lib needs (mirrors the
  // shape drift-fix-recipe-rollup uses).
  const shippedRows = useMemo(() => {
    const out: Array<{
      id: string;
      title: string;
      driftDays: number | null;
      numberedSections: { heading: string; body: string }[];
    }> = [];
    const shippedMap = shipped as Record<string, { shippedAt: string }>;
    for (const [id, entry] of Object.entries(shippedMap)) {
      if (!entry || typeof entry.shippedAt !== "string") continue;
      const pb = findPlaybook(playbooks, id);
      if (!pb) continue;
      const now = new Date();
      const shippedDate = new Date(entry.shippedAt);
      if (Number.isNaN(shippedDate.getTime())) continue;
      const lastTouched = pb.lastTouched ? new Date(pb.lastTouched) : null;
      const day = 24 * 60 * 60 * 1000;
      const daysSinceShipped = Math.max(
        0,
        Math.floor((now.getTime() - shippedDate.getTime()) / day)
      );
      let driftDays: number | null = null;
      if (lastTouched && !Number.isNaN(lastTouched.getTime())) {
        const daysSinceTouched = Math.max(
          0,
          Math.floor((now.getTime() - lastTouched.getTime()) / day)
        );
        driftDays = daysSinceShipped - daysSinceTouched;
      }
      out.push({
        id,
        title: pb.title,
        driftDays,
        numberedSections: pb.numberedSections ?? [],
      });
    }
    out.sort((a, b) => {
      if (a.driftDays === null && b.driftDays === null) return 0;
      if (a.driftDays === null) return 1;
      if (b.driftDays === null) return -1;
      return b.driftDays - a.driftDays;
    });
    return out;
  }, [shipped, playbooks]);

  const recipe: DriftFixRecipeSummary = useMemo(
    () => buildDriftFixRecipe(shippedRows, maxRows, 3),
    [shippedRows, maxRows]
  );

  const summary: ReReadSummary = useMemo(
    () => buildReReadSummary(recipe, reReadMap),
    [recipe, reReadMap]
  );

  if (!hydrated) {
    return (
      <Card
        id="recipe-reread-progress"
        className="border-dashed border-border bg-card/50"
      >
        <CardHeader>
          <CardTitle className="text-base">Re-read progress</CardTitle>
          <CardDescription>Loading progress…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Render nothing when the operator has 0 shipped playbooks — no
  // empty-state noise. The drift fix recipe card above already gates
  // on shipped > 0.
  if (summary.totalShipped === 0) {
    return null;
  }

  // No recipe sections to track (e.g. all shipped playbooks have no
  // numberedSections parsed yet). Still surface a one-liner so the
  // operator knows the card is alive but waiting on parse-content.
  if (summary.totalSections === 0) {
    return (
      <Card id="recipe-reread-progress" className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Re-read progress</CardTitle>
          <CardDescription>
            {summary.totalShipped} shipped · no recipe sections parsed yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tone = reReadToneClass(summary);
  const headline = reReadHeadline(summary);
  const md = renderReReadMarkdown(summary);

  const onMark = (playbookId: string, hash: string) => {
    const next = markReRead(reReadMap, playbookId, hash);
    setReReadMap(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RE_READ_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(RE_READ_UPDATE_EVENT));
    }
  };

  const onUnmark = (playbookId: string, hash: string) => {
    const next = clearReRead(reReadMap, playbookId, hash);
    setReReadMap(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RE_READ_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(RE_READ_UPDATE_EVENT));
    }
  };

  const onReset = (playbookId: string) => {
    const next = resetReReadForPlaybook(reReadMap, playbookId);
    setReReadMap(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RE_READ_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(RE_READ_UPDATE_EVENT));
    }
  };

  return (
    <Card
      id="recipe-reread-progress"
      className={cn(tone, "transition-colors")}
    >
      <CardHeader className="flex flex-col gap-2 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <CardTitle className="text-base">Re-read progress</CardTitle>
            <CardDescription>
              Which recipe sections have you actually re-read since the
              playbook drifted.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.fullyReRead > 0 ? (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
              >
                {summary.fullyReRead} fully re-read
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-[10px]"
            >
              {summary.totalMarks}/{summary.totalSections} sections
            </Badge>
            <CopyButton value={md} label="Copy re-read log" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{headline}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          {summary.rows.map((row) => {
            const rowTone = reReadRowTone(row.percent, row.totalSections);
            return (
              <li
                key={row.id}
                data-testid={`recipe-reread-row-${row.id}`}
                className="flex flex-col gap-2 border-b border-border/40 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Link
                      href={`/playbooks/${row.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] tabular-nums", rowTone)}
                    >
                      {row.totalSections === 0
                        ? "no recipe"
                        : row.isFullyReRead
                        ? "fully re-read"
                        : `${row.reReadCount}/${row.totalSections} re-read`}
                    </Badge>
                  </div>
                  {row.reReadCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => onReset(row.id)}
                      className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                      aria-label={`Reset re-read state for ${row.title}`}
                    >
                      Reset
                    </button>
                  ) : null}
                </div>

                {/* Inline progress bar — width = percent, tone matches rowTone. */}
                {row.totalSections > 0 ? (
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    aria-label={`Re-read progress for ${row.title}: ${row.percent}%`}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        row.percent === 100
                          ? "bg-emerald-500"
                          : row.percent >= 50
                          ? "bg-sky-500"
                          : row.percent > 0
                          ? "bg-amber-500"
                          : "bg-muted"
                      )}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Recipe sections
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {row.sections.map((s) => {
                      const pill = reReadSectionTone(s.reReadAt);
                      const relative = reReadRelativeDay(s.reReadAt);
                      return (
                        <span
                          key={`${row.id}::${s.hash}`}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Link
                            href={`/playbooks/${row.id}#${s.hash}`}
                            className={cn(
                              "inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 hover:bg-muted transition-colors",
                              pill.tone
                            )}
                            data-testid={`recipe-reread-link-${row.id}-${s.hash}`}
                          >
                            <span className="text-[10px]">{pill.label}</span>
                            <span>{s.heading}</span>
                            {s.reReadAt ? (
                              <span className="text-[10px] text-muted-foreground">
                                · {relative}
                              </span>
                            ) : null}
                          </Link>
                          {s.reReadAt ? (
                            <button
                              type="button"
                              onClick={() => onUnmark(row.id, s.hash)}
                              className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Unmark ${s.heading} as re-read`}
                            >
                              Unmark
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onMark(row.id, s.hash)}
                              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                              aria-label={`Mark ${s.heading} as re-read`}
                            >
                              Mark re-read
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-[10px] text-muted-foreground">
          Reads <code>ecom-ops:recipe-reread:v1</code> · mark a section
          re-read once you have actually re-read it since the playbook
          drifted · "Reset" clears all marks for a single playbook
          (use when unshipping + reshipping to start a fresh review
          cycle). Cross-tab via <code>storage</code>, same-tab via{" "}
          <code>ecom-ops:recipe-reread:update</code>.
        </p>
      </CardContent>
    </Card>
  );
}
