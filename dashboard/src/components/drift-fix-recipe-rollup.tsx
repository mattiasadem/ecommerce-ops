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
import {
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";

const SHIPPED_PLAYBOOKS_UPDATE_EVENT = "ecom-ops:shipped-playbooks:update";
import {
  buildDriftFixRecipe,
  recipeHeadline,
  recipeToneClass,
  renderRecipeMarkdown,
  findPlaybook,
  type DriftFixRecipeSummary,
} from "@/lib/drift-fix-recipe";
import type { Playbook } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * `Drift fix recipe rollup` — Move #N.18 cross-page-intelligence card on
 * `/` Overview, mounted directly below the Move #N.16
 * shipped-freshness-drift card.
 *
 * For every shipped playbook, the card surfaces the operator's
 * read-first order: which H2 sections of the playbook to re-read
 * first based on the playbook's `numberedSections` parsed at build
 * time. Sections are ranked by the priority keyword list in
 * `drift-fix-recipe.ts` (Common pitfalls > How to ship > Verification >
 * Step-by-step > Implementation > Playbook body > … > Intro / TL;DR).
 * Each "read first" entry is a real link to `/playbooks/[slug]#[hash]`
 * so the operator can click straight from the rollup into the
 * relevant section.
 *
 * Per-row signals:
 *   - Playbook title + drift pill (rose >90d / amber 30-90d / emerald
 *     ≤30d) — the same drift the Move #N.16 card surfaces, so the
 *     operator doesn't have to look at two cards to triage.
 *   - "Read first" chain: 1-3 section links with a small label tag
 *     (e.g. "pitfalls", "ship recipe", "verification").
 *   - "+N more sections" if the playbook has more than 3 sections and
 *     the link still points to the playbook.
 *   - "No sections parsed" fallback for playbooks with an empty
 *     numberedSections array (still rare but possible).
 *
 * Card-level signals:
 *   - Headline: "X of Y shipped have a re-read recipe" (or "X shipped
 *     · all have a re-read recipe" when coverage is 100%).
 *   - Card border tone scales by maxDriftDays (rose >90d / amber
 *     30-90d / emerald ≤30d) — same scaling as the drift card so the
 *     two cards visually pair.
 *   - "Copy re-read checklist" button emits a paste-ready markdown
 *     table (via `renderRecipeMarkdown`).
 *
 * Hydration safety: the card renders a "Loading recipe…" stub on
 * first paint so the SSG-rendered output byte-matches the first
 * client render. Real sections hydrate on mount.
 *
 * State-synthesis:
 *   - Reads `ecom-ops:shipped-playbooks:v1` (same key Move #N.16 +
 *     RecentlyShipped + RealizedRoiPanel read).
 *   - Cross-tab sync via the `storage` event (other tabs updating
 *     the same key) AND the same-tab
 *     `ecom-ops:shipped-playbooks:update` CustomEvent so toggling a
 *     shipped row on `/playbooks` updates this card within the same
 *     browser tick.
 *
 * Why this matters: Move #N.16 ships the WHAT (drift score). This
 * card ships the WHERE (read these sections first). Together they
 * answer the canonical "I shipped Move #1 4 months ago — has the
 * playbook changed? If so, what do I need to re-learn?" question
 * with one click. The operator no longer has to open the playbook
 * and scroll to figure out which section changed.
 */

interface Props {
  playbooks: Playbook[];
  maxRows?: number;
}

function driftPillTone(drift: number | null): { label: string; tone: string } {
  if (drift === null) {
    return { label: "no drift data", tone: "border-border text-muted-foreground" };
  }
  if (drift > 90) {
    return { label: `${drift}d drift`, tone: "border-rose-500/40 text-rose-700 dark:text-rose-300" };
  }
  if (drift > 30) {
    return { label: `${drift}d drift`, tone: "border-amber-500/40 text-amber-700 dark:text-amber-300" };
  }
  if (drift > 0) {
    return { label: `${drift}d drift`, tone: "border-sky-500/40 text-sky-700 dark:text-sky-300" };
  }
  return { label: "current", tone: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300" };
}

export function DriftFixRecipeRollup({ playbooks, maxRows = 5 }: Props) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY) {
        setShipped(loadShippedPlaybooks());
      }
    };
    const handleCustom = () => setShipped(loadShippedPlaybooks());
    window.addEventListener("storage", handleStorage);
    window.addEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, handleCustom);
    };
  }, []);

  // Build a flat per-shipped-row list of {id, title, driftDays, numberedSections}
  // for the lib. Mirrors Move #N.16's input shape (id + title + driftDays)
  // and adds the `numberedSections` lookup from the playbook catalog.
  const shippedRows = useMemo(() => {
    const out: Array<{
      id: string;
      title: string;
      driftDays: number | null;
      numberedSections: { heading: string; body: string }[];
    }> = [];
    for (const [id, entry] of Object.entries(shipped)) {
      if (!entry || typeof entry.shippedAt !== "string") continue;
      const pb = findPlaybook(playbooks, id);
      if (!pb) continue;
      // Compute drift the same way Move #N.16 does so the pill value
      // matches the drift card exactly.
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
    // Sort: highest drift first (matches Move #N.16 ordering).
    out.sort((a, b) => {
      if (a.driftDays === null && b.driftDays === null) return 0;
      if (a.driftDays === null) return 1;
      if (b.driftDays === null) return -1;
      return b.driftDays - a.driftDays;
    });
    return out;
  }, [shipped, playbooks]);

  const summary: DriftFixRecipeSummary = useMemo(
    () => buildDriftFixRecipe(shippedRows, maxRows, 3),
    [shippedRows, maxRows]
  );

  if (!hydrated) {
    return (
      <Card id="drift-fix-recipe" className="border-dashed border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Drift fix recipe</CardTitle>
          <CardDescription>Loading recipe…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Render nothing when the operator has 0 shipped playbooks — no
  // empty-state noise. Move #N.16's card already covers the "0 shipped"
  // CTA via ShippedProgressStrip on `/`.
  if (summary.totalShipped === 0) {
    return null;
  }

  const tone = recipeToneClass(summary);
  const headline = recipeHeadline(summary);
  const md = renderRecipeMarkdown(summary);

  return (
    <Card id="drift-fix-recipe" className={cn(tone, "transition-colors")}>
      <CardHeader className="flex flex-col gap-2 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <CardTitle className="text-base">Drift fix recipe</CardTitle>
            <CardDescription>
              What to re-read first on each drifted shipped playbook.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.noSections > 0 ? (
              <Badge
                variant="outline"
                className="border-border text-muted-foreground text-[10px]"
              >
                {summary.noSections} no-sections
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="border-border text-muted-foreground text-[10px]"
            >
              {summary.withRecipe}/{summary.totalShipped} with recipe
            </Badge>
            <CopyButton value={md} label="Copy re-read checklist" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{headline}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {summary.rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No drifted playbooks to surface a recipe for.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {summary.rows.map((row) => {
              const pill = driftPillTone(row.driftDays);
              const extra = Math.max(0, row.totalSections - row.readFirst.length);
              return (
                <li
                  key={row.id}
                  data-testid={`drift-fix-recipe-row-${row.id}`}
                  className="flex flex-col gap-1.5 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/playbooks/${row.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] tabular-nums", pill.tone)}
                    >
                      {pill.label}
                    </Badge>
                  </div>
                  {row.readFirst.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Read first
                      </span>
                      {row.readFirst.map((s, i) => (
                        <span key={s.hash} className="flex items-center gap-1.5">
                          <Link
                            href={`/playbooks/${row.id}#${s.hash}`}
                            className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 hover:bg-muted transition-colors"
                          >
                            <span className="text-[10px] text-muted-foreground">
                              {s.label}
                            </span>
                            <span>{s.heading}</span>
                          </Link>
                          {i < row.readFirst.length - 1 ? (
                            <span className="text-muted-foreground">→</span>
                          ) : null}
                        </span>
                      ))}
                      {extra > 0 ? (
                        <Link
                          href={`/playbooks/${row.id}`}
                          className="text-[10px] text-muted-foreground hover:underline"
                        >
                          +{extra} more section{extra === 1 ? "" : "s"}
                        </Link>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No sections parsed for this playbook yet.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground">
          Reads <code>ecom-ops:shipped-playbooks:v1</code> · ranks sections
          by priority keyword (pitfalls → ship recipe → verification →
          step-by-step → …) · links go to{" "}
          <code>/playbooks/[slug]#[section-hash]</code>.
        </p>
      </CardContent>
    </Card>
  );
}
