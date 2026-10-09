"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { freshnessTier, freshnessLabel, type Playbook } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * `Next playbook nav` — cross-page-intelligence footer on every
 * `/playbooks/[slug]` detail page.
 *
 * Closes the canonical "I read playbook #01 and want #02 without
 * bouncing back to `/playbooks` and scanning the catalog" gap.
 *
 * Sorts the operator's playbook catalog by canonical number prefix
 * (`01`, `02`, ..., `23`, `06.5`, `06.6`, `06.7`, `06.8`) so the
 * "Next →" link follows the Move-number ordering the rest of the
 * dashboard uses (Move #1 → Move #2 → ... → Move #23 → Move #N.6.5
 * → Move #N.6.6 → ...). The natural sort is `String.localeCompare`
 * with `numeric: true` so `06.5` lands AFTER `06.10`.
 *
 * Renders two cards side-by-side at the bottom of every playbook
 * detail page:
 *   - `← Previous playbook` (disabled-styled when the current playbook
 *     is the first one)
 *   - `Next playbook →` (disabled-styled when the current playbook is
 *     the last one)
 *
 * Each card shows: number prefix + truncated title + freshness badge
 * (fresh <14d / aging 14-60d / stale >60d). Uses the SAME freshness
 * tier mapping the catalog header uses so the operator sees a
 * consistent color across pages.
 *
 * Mounted from `app/playbooks/[slug]/page.tsx` immediately above the
 * existing "Back to all playbooks" footer link.
 */

interface Props {
  /** The full playbook catalog (sorted by parse-content.mjs by filename). */
  playbooks: Playbook[];
  /** The current playbook's slug (file without `.md`). */
  currentSlug: string;
}

const TIER_STYLES: Record<string, string> = {
  fresh: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  aging: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  stale: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  unknown: "border-border bg-muted text-muted-foreground",
};

function numberPrefix(file: string): string {
  // Filenames look like "01-foo.md", "06.5-bar.md", "06.10-baz.md".
  // Return "01", "06.5", "06.10", or "" when unparseable.
  const m = /^(\d+(?:\.\d+)?)-/.exec(file);
  return m ? m[1] : "";
}

function sortedCatalog(playbooks: Playbook[]): Playbook[] {
  // Sort by numeric prefix ascending so the catalog follows the
  // canonical Move-number order. Filenames without a parseable prefix
  // land at the end.
  return [...playbooks].sort((a, b) => {
    const aKey = numberPrefix(a.file);
    const bKey = numberPrefix(b.file);
    if (!aKey && !bKey) return 0;
    if (!aKey) return 1;
    if (!bKey) return -1;
    // `numeric: true` so "06.10" sorts AFTER "06.5" (not lexicographically before).
    return aKey.localeCompare(bKey, undefined, { numeric: true });
  });
}

function PlaybookNavCard({
  playbook,
  direction,
}: {
  playbook: Playbook;
  direction: "prev" | "next";
}) {
  const slug = playbook.file.replace(/\.md$/, "");
  const prefix = numberPrefix(playbook.file);
  const tier = freshnessTier(playbook.lastTouched);
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.unknown;
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/playbooks/${slug}`}
      className="group flex-1 min-w-0"
      data-testid={`next-playbook-nav-${direction}-${slug}`}
    >
      <Card className="h-full border-border bg-card transition-colors hover:border-accent/40 hover:bg-accent/5">
        <CardContent className="p-4">
          <div
            className={cn(
              "flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground",
              isPrev ? "justify-start" : "justify-end",
            )}
          >
            <span aria-hidden="true">{isPrev ? "←" : ""}</span>
            <span>{isPrev ? "Previous playbook" : "Next playbook"}</span>
            <span aria-hidden="true">{!isPrev ? "→" : ""}</span>
          </div>
          <div
            className={cn(
              "mt-2 flex items-baseline gap-2",
              isPrev ? "justify-start" : "justify-end",
            )}
          >
            {prefix && (
              <span className="font-mono text-[11px] text-muted-foreground">
                #{prefix}
              </span>
            )}
            <span
              className={cn(
                "text-sm font-semibold tracking-tight truncate",
                isPrev ? "text-left" : "text-right",
              )}
              title={playbook.title}
            >
              {playbook.title}
            </span>
          </div>
          <div
            className={cn(
              "mt-2 flex items-center gap-1.5",
              isPrev ? "justify-start" : "justify-end",
            )}
          >
            <Badge variant="outline" className={cn("text-[10px]", tierStyle)}>
              {freshnessLabel(playbook.lastTouched)}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {playbook.sectionCount} sections
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NextPlaybookNav({ playbooks, currentSlug }: Props) {
  const sorted = sortedCatalog(playbooks);
  const currentIndex = sorted.findIndex(
    (p) => p.file.replace(/\.md$/, "") === currentSlug,
  );
  // Defensive: if the catalog is empty OR the current slug isn't in
  // the catalog (parity drift between content.json and the
  // filesystem), render nothing rather than a broken footer.
  if (currentIndex === -1) return null;
  if (sorted.length < 2) return null;

  const prev = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const next = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  // Defensive: at the catalog boundaries (first / last), still render
  // the other side so the operator has a navigation option.
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Playbook navigation"
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      data-testid="next-playbook-nav"
    >
      {prev ? (
        <PlaybookNavCard playbook={prev} direction="prev" />
      ) : (
        <div className="flex-1 min-w-0" aria-hidden="true" />
      )}
      {next ? (
        <PlaybookNavCard playbook={next} direction="next" />
      ) : (
        <div className="flex-1 min-w-0" aria-hidden="true" />
      )}
    </nav>
  );
}