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
  loadReReadMap,
  type ReReadMap,
} from "@/lib/recipe-reread";
import {
  buildReReadFreshness,
  renderReReadFreshnessMarkdown,
  rereadFreshnessHeadline,
  rereadFreshnessRowTone,
  rereadFreshnessSectionLabel,
  rereadFreshnessSectionTone,
  rereadFreshnessToneClass,
  type ReReadFreshnessSummary,
  type SectionFreshness,
} from "@/lib/reread-freshness-gap";

interface Props {
  playbooks: Playbook[];
  maxRows?: number;
}

/**
 * `Reread freshness gap` — Move #N.21 card on `/` Overview, mounted
 * directly below the Move #N.20 re-read progress card.
 *
 * Closes the canonical "I marked this section re-read, but has the
 * playbook itself been updated since I marked it?" gap. The drift
 * detector (Move #N.16) tells the operator the playbook is stale;
 * the recipe card (Move #N.18) tells them where to re-read first;
 * the re-read progress card (Move #N.20) tracks which sections
 * they have marked re-read. This card goes one step further: for
 * every marked section, it compares the mark's `reReadAt` to the
 * playbook's `lastTouched` and surfaces a "stale since re-read"
 * verdict (rose) when the playbook has been updated since the
 * mark, or "current as of re-read" (emerald) when the mark is
 * still authoritative. Per-section worst-gap (days) drives both
 * the per-row tone and the card border tone.
 *
 * Why this matters: the trio of cards above close the WHAT / WHERE
 * / HAVE-I loop. This card closes the IS-IT-STILL-ACCURATE loop
 * without it, an operator can mark a section re-read, walk away for
 * a month, and discover the playbook has been silently re-written
 * by a sister-cron tick — the mark is technically there, but the
 * material has shifted under it. Move #N.21 surfaces the gap
 * before the operator has to find it the hard way.
 *
 * Storage: READ-ONLY over `ecom-ops:shipped-playbooks:v1` (Move
 * #N.7) + `ecom-ops:recipe-reread:v1` (Move #N.20). Does not write.
 *
 * Hydration safety: card renders a "Loading freshness…" stub on
 * first paint so the SSG-rendered output byte-matches the first
 * client render. Real freshness hydrates on mount.
 *
 * Cross-tab + same-tab sync: `storage` event (other tabs updating
 * the re-read key OR the shipped key) AND the same-tab
 * `ecom-ops:recipe-reread:update` CustomEvent so marking a section
 * in Move #N.20 updates this card on the same tick.
 */
export function RereadFreshnessGap({ playbooks, maxRows = 5 }: Props) {
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

  // Build the same shippedRows input the recipe lib needs (mirrors
  // the pattern in `recipe-reread-progress.tsx` so all three cards
  // see the same input ordering).
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

  const summary: ReReadFreshnessSummary = useMemo(
    () => buildReReadFreshness(recipe, reReadMap, playbooks),
    [recipe, reReadMap, playbooks]
  );

  if (!hydrated) {
    return (
      <Card
        id="reread-freshness-gap"
        className="border-dashed border-border bg-card/50"
      >
        <CardHeader>
          <CardTitle className="text-base">Re-read freshness gap</CardTitle>
          <CardDescription>Loading freshness…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Render nothing when 0 shipped or 0 marks — no empty-state noise.
  // The drift + recipe + re-read cards above already gate on these
  // conditions, so a fourth "no marks" card would be redundant.
  if (summary.totalShipped === 0 || summary.totalMarks === 0) {
    return null;
  }

  const tone = rereadFreshnessToneClass(summary);
  const headline = rereadFreshnessHeadline(summary);
  const md = renderReReadFreshnessMarkdown(summary);

  return (
    <Card
      id="reread-freshness-gap"
      className={cn(tone, "transition-colors")}
    >
      <CardHeader className="flex flex-col gap-2 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <CardTitle className="text-base">Re-read freshness gap</CardTitle>
            <CardDescription>
              For every section you marked re-read, has the playbook
              itself been updated since the mark? Stale sections
              (playbook updated after your mark) are surfaced first.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.totalStale > 0 ? (
              <Badge
                variant="outline"
                className="border-rose-500/40 text-rose-700 dark:text-rose-300 text-[10px]"
              >
                {summary.totalStale} stale
              </Badge>
            ) : null}
            {summary.totalCurrent > 0 ? (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
              >
                {summary.totalCurrent} current
              </Badge>
            ) : null}
            {summary.totalUnknown > 0 ? (
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px]"
              >
                {summary.totalUnknown} unknown
              </Badge>
            ) : null}
            <CopyButton value={md} label="Copy freshness log" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{headline}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          {summary.rows
            .filter((r) => r.markedCount > 0)
            .map((row) => {
              const rowTone = rereadFreshnessRowTone(row);
              return (
                <li
                  key={row.id}
                  data-testid={`reread-freshness-row-${row.id}`}
                  className="flex flex-col gap-2 border-b border-border/40 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Link
                        href={`/playbooks/${row.id}`}
                        className={cn(
                          "text-sm font-medium underline-offset-2 hover:underline",
                          rowTone
                        )}
                      >
                        {row.title}
                      </Link>
                      {row.staleCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-rose-500/40 text-rose-700 dark:text-rose-300 text-[10px]"
                        >
                          {row.staleCount}/{row.markedCount} stale
                        </Badge>
                      ) : null}
                      {row.currentCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
                        >
                          {row.currentCount} current
                        </Badge>
                      ) : null}
                      {row.unknownCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px]"
                        >
                          {row.unknownCount} unknown
                        </Badge>
                      ) : null}
                      {row.maxGapDays !== null ? (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          worst +{row.maxGapDays}d gap
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {row.sections
                      .filter((s) => s.reReadAt !== null)
                      .map((s) => (
                        <FreshnessChip
                          key={s.hash}
                          section={s}
                          playbookId={row.id}
                        />
                      ))}
                  </div>
                </li>
              );
            })}
        </ul>
        <p className="text-[10px] text-muted-foreground">
          Reads <code className="font-mono">{RE_READ_STORAGE_KEY}</code> ×
          each playbook&apos;s <code className="font-mono">lastTouched</code>
          (parsed at build time from playbook frontmatter). Stale =
          playbook updated after the re-read mark. Current = mark
          is at or after the last touch. Unknown = no
          <code className="font-mono"> lastTouched</code> on the
          playbook. Same-tab updates flow through the
          <code className="font-mono"> {RE_READ_UPDATE_EVENT}</code>
          {" + "}
          <code className="font-mono">{SHIPPED_PLAYBOOKS_UPDATE_EVENT}</code>
          {" "}CustomEvents so marking a section on the re-read
          progress card re-renders this card on the same tick.
        </p>
      </CardContent>
    </Card>
  );
}

function FreshnessChip({
  section,
  playbookId,
}: {
  section: SectionFreshness;
  playbookId: string;
}) {
  const tone = rereadFreshnessSectionTone(section.state);
  const label = rereadFreshnessSectionLabel(section);
  return (
    <Link
      href={`/playbooks/${playbookId}#${section.hash}`}
      data-testid={`reread-freshness-chip-${playbookId}-${section.hash}`}
      className={cn(
        "inline-flex items-center gap-2 self-start rounded-md border px-2 py-1 text-[10px] hover:underline underline-offset-2",
        tone
      )}
    >
      <span className="font-medium uppercase tracking-wider">
        {section.label}
      </span>
      <span className="text-foreground/80">{section.heading}</span>
      <span className="ml-1 tabular-nums">· {label}</span>
    </Link>
  );
}
