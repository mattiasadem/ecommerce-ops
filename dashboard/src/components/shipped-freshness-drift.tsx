"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShippedMap,
  loadShippedPlaybooks,
} from "@/lib/shipped-playbooks";
import {
  buildShippedFreshnessDrift,
  describeDriftState,
  driftToneClass,
  relativeDay,
  summaryHeadline,
  summaryToneClass,
  type ShippedDriftRow,
  type ShippedDriftSummary,
} from "@/lib/shipped-freshness-drift";
import { cn } from "@/lib/utils";
import type { Playbook } from "@/lib/content";

/**
 * `ShippedFreshnessDriftCard` — cross-page-intelligence card on `/` Overview.
 *
 * Surfaces the operator's shipped-but-stale playbooks: "you shipped Move #1
 * 127 days ago, but the playbook was last touched 23 days ago — your
 * implementation may be drifting from the current best practice." The card
 * ranks shipped playbooks by drift (shipped-old vs playbook-new) so the
 * operator knows which shipped work to re-read first.
 *
 * Why this matters: the shipped tracker already shows "X / N shipped" and
 * "last shipped: 3mo ago", but it does NOT show that the playbook itself
 * has been updated since. Best practices shift — Klaviyo ships new flow
 * types, Baymard publishes new checkout heuristics, Triple Whale adds new
 * attribution models. An operator who hasn't re-read their shipped playbook
 * in 6+ months may be running on stale tactics without knowing it.
 *
 * Sync:
 *   - `storage` event → cross-tab.
 *   - Custom DOM event `ecom-ops:shipped-playbooks:update` → same-tab.
 *
 * Tone:
 *   - 0 shipped → component renders nothing (no empty state pollution;
 *     the operator hasn't shipped anything yet, the existing cards cover
 *     the "you should ship something" CTA).
 *   - All current → emerald ("all N shipped are current").
 *   - Some drift → amber.
 *   - Any severe (>90d drift) → rose.
 */

interface ShippedFreshnessDriftCardProps {
  playbooks: Playbook[];
  /** Max rows to render in the card body. Default 5. */
  maxRows?: number;
}

const STORAGE_KEY = "ecom-ops:shipped-playbooks:v1";
const UPDATE_EVENT = "ecom-ops:shipped-playbooks:update";

function FreshnessTierBadge({
  tier,
}: {
  tier: ReturnType<typeof import("@/lib/content").freshnessTier>;
}) {
  const styles: Record<string, string> = {
    fresh: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    aging: "border-amber-500/30 text-amber-700 dark:text-amber-300",
    stale: "border-rose-500/30 text-rose-700 dark:text-rose-300",
    unknown: "border-border text-muted-foreground",
  };
  const labels: Record<string, string> = {
    fresh: "fresh",
    aging: "aging",
    stale: "stale playbook",
    unknown: "no data",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px]", styles[tier])}>
      {labels[tier]}
    </Badge>
  );
}

function DriftRow({ row }: { row: ShippedDriftRow }) {
  const driftLabel = row.driftDays === null
    ? "—"
    : row.driftDays <= 0
      ? "current"
      : `${row.driftDays}d drift`;
  return (
    <li
      data-testid="shipped-freshness-row"
      className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-3"
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <a
            href={`/playbooks#${row.id}`}
            className="text-sm font-medium leading-tight underline-offset-2 hover:underline"
          >
            {row.title}
          </a>
          <span
            data-testid="shipped-freshness-drift-pill"
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              driftToneClass(row.driftState)
            )}
          >
            {driftLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
          <span className="tabular-nums">
            shipped {relativeDay(row.shippedAt)} ({row.daysSinceShipped}d)
          </span>
          {row.lastTouched ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                playbook updated {relativeDay(row.lastTouched)}
                {row.daysSincePlaybookLastTouched !== null
                  ? ` (${row.daysSincePlaybookLastTouched}d)`
                  : ""}
              </span>
              <FreshnessTierBadge tier={row.playbookFreshnessTier} />
            </>
          ) : (
            <>
              <span aria-hidden="true">·</span>
              <span>playbook lastTouched unknown</span>
            </>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/80 leading-snug">
          {describeDriftState(row.driftState)}
          {row.driftState === "severe" || row.driftState === "significant"
            ? " — re-read the playbook before your next iteration."
            : row.driftState === "mild"
              ? " — give the playbook a quick scan."
              : ""}
        </p>
      </div>
      <a
        href={`/playbooks#${row.id}`}
        className="inline-flex shrink-0 items-center gap-1 self-start rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground hover:border-accent hover:text-accent sm:self-center"
      >
        Re-read <span aria-hidden="true">→</span>
      </a>
    </li>
  );
}

export function ShippedFreshnessDriftCard({
  playbooks,
  maxRows = 5,
}: ShippedFreshnessDriftCardProps) {
  const [shipped, setShipped] = useState<ShippedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setShipped(loadShippedPlaybooks());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== STORAGE_KEY) return;
      setShipped(loadShippedPlaybooks());
    };
    const onUpdate = () => setShipped(loadShippedPlaybooks());
    window.addEventListener("storage", onStorage);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(UPDATE_EVENT, onUpdate);
    };
  }, []);

  const summary: ShippedDriftSummary = buildShippedFreshnessDrift(
    shipped,
    playbooks,
    new Date(),
    maxRows
  );

  // Don't render at all when nothing is shipped — the existing
  // ShippedProgressStrip + RecentlyShippedPlaybooksCard already cover
  // the "you should ship something" CTA, and we don't want this card
  // to be the first thing the operator sees when they have nothing
  // to drift.
  if (hydrated && summary.totalShipped === 0) return null;
  if (!hydrated) {
    return (
      <Card data-testid="shipped-freshness-drift-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Shipped playbook drift
          </CardTitle>
          <CardDescription className="text-xs">
            Loading drift…
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tone = summaryToneClass(summary.severeCount, summary.driftedCount);
  const headline = summaryHeadline(summary);

  return (
    <Card
      data-testid="shipped-freshness-drift-card"
      className={cn("transition-colors", tone)}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold">
              Shipped playbook drift
            </CardTitle>
            <CardDescription className="text-xs">
              {headline}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.severeCount > 0 ? (
              <Badge
                variant="outline"
                className="border-rose-500/40 text-rose-700 dark:text-rose-300 text-[10px]"
              >
                {summary.severeCount} severe
              </Badge>
            ) : null}
            {summary.driftedCount > 0 ? (
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px]"
              >
                {summary.driftedCount} drifting
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
              >
                all current
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {summary.totalShipped} shipped
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {summary.rows.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Ship a playbook on{" "}
            <a className="underline hover:text-foreground" href="/playbooks#shipped-progress">
              /playbooks
            </a>{" "}
            to start tracking drift.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {summary.rows.map((row) => (
                <DriftRow key={row.id} row={row} />
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Drift = days since shipped − days since playbook last updated.
              Positive = the playbook has new content you haven&apos;t read.
              Synced from your browser — toggle on{" "}
              <a
                className="underline hover:text-foreground"
                href="/playbooks#shipped-progress"
              >
                /playbooks
              </a>
              .
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
