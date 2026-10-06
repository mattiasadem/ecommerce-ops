"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  buildCalculatorCoverage,
  coverageHeadline,
  coverageToneClass,
  CALCULATOR_TYPE_LABEL,
  CALCULATOR_TYPE_TONE,
  CALCULATOR_TYPE_GLYPH,
  type CalculatorType,
  type CalculatorCoverageSummary,
} from "@/lib/calculator-coverage";
import type { Playbook } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * `Calculator coverage card` — Move #N.17 cross-page-intelligence card on
 * `/` Overview.
 *
 * Closes the canonical "is every playbook backed by a working calculator?"
 * question. The dashboard has 30 playbooks + 22 per-page calculators (mounted
 * inside `/playbooks/[slug]` via the `CALCULATORS` map in
 * `app/playbooks/[slug]/page.tsx`), but the operator has no bird's-eye view
 * of which playbooks ship their own ROI tool vs which fall through to the
 * playbook markdown + the external Python CLI script in `scripts/`.
 *
 * What the card surfaces:
 *   - Headline: "X playbooks · Y have a calculator · Z don't" (or "All N have
 *     a calculator" when coverage is 100%).
 *   - Card-tone scales: emerald ≥90% / amber ≥50% / rose <50%.
 *   - Type-mix strip: 5 buckets (ROI projection / Path A-B-C / Audit
 *     scorer / Sample-size / Savings) + a "none" bucket for the un-tooled.
 *   - Per-row list of the 8 un-tooled playbooks, each with a click-through
 *     "Open playbook" link to `/playbooks/[slug]` so the operator can drill
 *     in and either ship the calculator next tick or read the playbook.
 *   - Storage-key footer explaining how the registry stays in sync with
 *     `app/playbooks/[slug]/page.tsx`'s `CALCULATORS` map (manual, with
 *     test-pinned constants on both sides).
 *
 * Why this matters: the shipped-tracker family answers "what shipped" and
 * the freshness-drift card answers "what shipped-but-stale"; this card
 * answers "what is backed by a working in-browser tool" — the third leg of
 * the shipped × fresh × tooled triple. The natural follow-up is
 * Move #N.18 — wire calculators for the 8 un-tooled playbooks (especially
 * `14-3pl-migration` which has a script but no React form, and the
 * `21/22/23` Path A/B/C playbooks that should each gain their own Path
 * calculator as separate components).
 */
interface CalculatorCoverageCardProps {
  playbooks: Playbook[];
  /** Max un-tooled rows to render in the body. Default 8 (= the current missing-slug count). */
  maxMissing?: number;
}

export function CalculatorCoverageCard({
  playbooks,
  maxMissing = 8,
}: CalculatorCoverageCardProps) {
  const summary = useMemo<CalculatorCoverageSummary>(
    () => buildCalculatorCoverage(playbooks),
    [playbooks],
  );

  // Defensive: catalog empty → render nothing (mirrors shipped-freshness-drift).
  if (summary.total === 0) return null;

  const toneClass = coverageToneClass(summary);
  const headline = coverageHeadline(summary);
  const typeOrder: Array<CalculatorType | "none"> = [
    "roi-projection",
    "path-abc",
    "audit-scorer",
    "size-test",
    "savings",
    "none",
  ];

  const missingRows = summary.rows
    .filter((r) => r.calculator === null)
    .slice(0, maxMissing);

  return (
    <Card
      data-testid="calculator-coverage-card"
      className={cn("border", toneClass)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-sky-500" aria-hidden="true" />
            <CardTitle className="text-sm font-semibold">
              Calculator coverage
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {summary.coveragePct.toFixed(1)}% tooled
          </Badge>
        </div>
        <CardDescription className="text-xs">{headline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* === TYPE-MIX STRIP =============================================
            Renders every calculator-type bucket as a Badge. The "none" bucket
            uses a rose-tinted style so the un-tooled count is unmistakable.
            Each badge shows the canonical label + glyph + count so the
            operator can read the rollup at a glance. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Type mix
          </span>
          {typeOrder.map((t) => {
            const n = summary.typeMix[t];
            if (n === 0 && t !== "none") return null;
            const label =
              t === "none" ? "No calculator" : CALCULATOR_TYPE_LABEL[t];
            const tone =
              t === "none"
                ? "border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/5"
                : CALCULATOR_TYPE_TONE[t];
            const g = t === "none" ? "—" : CALCULATOR_TYPE_GLYPH[t];
            return (
              <Badge
                key={t}
                variant="outline"
                className={cn("text-[10px] gap-1", tone)}
                data-testid={`calculator-coverage-type-${t}`}
              >
                <span aria-hidden="true">{g}</span>
                <span>{label}</span>
                <span className="font-mono">{n}</span>
              </Badge>
            );
          })}
        </div>

        <Separator />

        {/* === STATS STRIP ================================================
            3-up: total · with calculator · without. Mirrors the
            shipped-freshness-drift 3-up pattern for visual consistency. */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border/50 bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </div>
            <div className="text-base font-semibold tabular-nums">
              {summary.total}
            </div>
          </div>
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              With calculator
            </div>
            <div className="text-base font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
              {summary.withCalculator}
            </div>
          </div>
          <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-2">
            <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Without
            </div>
            <div className="text-base font-semibold tabular-nums text-rose-700 dark:text-rose-300">
              {summary.withoutCalculator}
            </div>
          </div>
        </div>

        {/* === MISSING-PLAYBOOKS LIST ====================================
            Renders the 8 un-tooled playbooks. Each row shows the playbook
            title + a click-through link to `/playbooks/[slug]` so the
            operator can drill into the playbook markdown + Python CLI
            script. The list is stable across ticks — adding a calculator
            for one of these slugs would remove it from the list, which is
            the canonical visual signal "you closed a coverage gap". */}
        {missingRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold tracking-tight">
                Playbooks without an in-browser calculator
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Click to open
              </span>
            </div>
            <ul className="space-y-1.5" data-testid="calculator-coverage-missing-list">
              {missingRows.map((row) => (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 rounded-md border border-rose-500/20 bg-rose-500/5 px-2 py-1.5"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-xs font-medium" title={row.title}>
                      {row.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {row.slug}
                    </span>
                  </div>
                  <Link
                    href={`/playbooks/${row.slug}`}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium hover:bg-muted transition-colors"
                    aria-label={`Open playbook ${row.title}`}
                  >
                    Open ↗
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === STORAGE-KEY FOOTER =========================================
            Explains where the canonical registry lives + how it stays in
            sync with the `CALCULATORS` map in the playbook detail page. */}
        <div className="rounded-md border border-border/50 bg-muted/30 p-2 text-[10px] text-muted-foreground">
          Registry: <code className="font-mono">CALCULATOR_REGISTRY</code> in{" "}
          <code className="font-mono">src/lib/calculator-coverage.ts</code>.
          Mirror of <code className="font-mono">CALCULATORS</code> map in{" "}
          <code className="font-mono">app/playbooks/[slug]/page.tsx</code>.
          Bump both on the same commit when a new calculator ships.
        </div>
      </CardContent>
    </Card>
  );
}