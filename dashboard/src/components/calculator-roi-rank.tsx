"use client";

/**
 * `Calculator ROI rank` — Move #N.23 cross-page-intelligence card on `/`.
 *
 * Closes the canonical "calculator-to-roi gap": the operator has 30 wired
 * calculators + 10 prioritized Top-10 moves + their own AOV/orders/margin,
 * but no single answer to "open WHICH calculator first to put the most
 * dollars on the board?". The card joins `MOVE_RECOMMENDATIONS` ×
 * `CALCULATOR_REGISTRY` × `YourStoreInputs` and surfaces the top-N ranked
 * by projected annual lift (high band) on the operator's numbers.
 *
 * **Move #N.23.1 — cohort split (this file's added behavior).** The card
 * now ALSO reads `ecom-ops:shipped-playbooks:v1` (the canonical operator-
 * owned shipped map from the `/playbooks` toggle) and splits the top-N
 * rows into two cohorts:
 *
 *   1. **On the table** — `unshippedRows`. The calculator-backed move
 *      that the operator has NOT yet shipped. This is the canonical
 *      "open WHICH calculator first?" answer.
 *   2. **Already shipped** — `shippedRows`. The calculator-backed move
 *      that the operator has already shipped in their store. Doubles as
 *      a "what I've captured" reminder.
 *
 * Both lists are projected on the operator's `YourStoreInputs` — so the
 * operator sees: "I shipped 2 of the top 5 ($405k/yr captured) — 3 still
 * on the table ($230k/yr to put on the board)".
 *
 * Hydration-safe: SSR uses `YourStoreInputs | null` → renders a stub or
 * a defaults-on-amber variant. Once mounted, the client reads
 * `ecom-ops:your-store:v1` and re-computes live. Cross-tab `storage`
 * event keeps two open tabs in sync.
 *
 * Renders nothing when the catalog is empty or when no move has a wired
 * calculator (defensive — should never happen in practice).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
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
  buildCalculatorRoiRank,
  calculatorRoiRankHeadline,
  calculatorRoiRankToneClass,
  formatRoiRankUsd,
  type CalculatorRoiRankSummary,
} from "@/lib/calculator-roi-rank";
import {
  buildCalculatorRoiCohort,
  calculatorRoiCohortHeadline,
  calculatorRoiCohortToneClass,
  formatCohortCount,
  type CalculatorRoiCohort,
} from "@/lib/calculator-roi-cohort";
import { buildPaybackEnrichment } from "@/lib/calculator-roi-payback";
import { loadYourStore, YOUR_STORE_STORAGE_KEY, type YourStoreInputs } from "@/lib/your-store";
import {
  loadShippedPlaybooks,
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  SHIPPED_PLAYBOOKS_UPDATE_EVENT,
  type ShippedMap,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

interface Props {
  /** Number of top rows to surface. Default 5. */
  maxRows?: number;
}

export function CalculatorRoiRank({ maxRows = 5 }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Cross-tab `storage` listener (the canonical pattern across the
  // dashboard — see `benchmark-dial.tsx`, `realized-roi.tsx`, etc.).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === YOUR_STORE_STORAGE_KEY || e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY || e.key === null) {
        setStore(loadYourStore());
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab CustomEvent for the shipped key (storage only fires across
  // tabs, not within the same tab — see `shipped-playbooks.ts`).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onUpdate = () => setShipped(loadShippedPlaybooks());
    window.addEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onUpdate);
  }, []);

  const summary: CalculatorRoiRankSummary = buildCalculatorRoiRank(store);
  const cohort: CalculatorRoiCohort = buildCalculatorRoiCohort(summary, shipped, maxRows);

  // Defensive: no matches → render nothing.
  if (summary.matchingMoves === 0) return null;

  // Defensive: catalog empty → render nothing.
  if (summary.rows.length === 0) return null;

  const toneClass = calculatorRoiRankToneClass(summary);
  const headline = calculatorRoiRankHeadline(summary);
  const cohortHeadline = calculatorRoiCohortHeadline(cohort, maxRows);

  return (
    <Card
      data-testid="calculator-roi-rank-card"
      className={cn("border", toneClass)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm bg-emerald-500"
              aria-hidden="true"
            />
            <CardTitle className="text-sm font-semibold">
              Calculator ROI rank — your numbers
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {summary.usingDefaults && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-300">
                Defaults
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {summary.matchingMoves} moves ranked
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {!hydrated ? (
            <span>Loading your numbers…</span>
          ) : (
            headline
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* === HEADLINE STATS =========================================
            Two-up: monthly revenue from your-store inputs (left) +
            total projected annual lift across the top-N matches (right). */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "rounded-md border border-border/50 bg-background/50 p-2",
            )}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Your monthly revenue
            </div>
            <div
              className="text-base font-semibold tabular-nums"
              data-testid="calculator-roi-rank-revenue"
            >
              {hydrated ? formatRoiRankUsd(summary.monthlyRevenue) : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              ${summary.aov} AOV × {summary.monthlyOrders.toLocaleString()} orders
            </div>
          </div>
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Top-N projected annual lift (high)
            </div>
            <div
              className="text-base font-semibold tabular-nums text-emerald-700 dark:text-emerald-300"
              data-testid="calculator-roi-rank-total-lift"
            >
              {hydrated
                ? formatRoiRankUsd(
                    summary.rows.slice(0, maxRows).reduce((s, r) => s + r.annualLiftHigh, 0),
                  )
                : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {summary.usingDefaults
                ? "Set your AOV / orders on / to personalize"
                : `Across top ${maxRows} calculator-backed moves`}
            </div>
          </div>
        </div>

        <Separator />

        {/* === COHORT SUB-HEADER (Move #N.23.1) ========================
            Mirrors the cohort split: "N of M shipped — K still on the
            table". Defaults-badge-style treatment for shipped count.
            Renders nothing when both cohorts are empty. */}
        {hydrated && (cohort.shippedCount > 0 || cohort.unshippedCount > 0) && (
          <div
            className={cn(
              "flex items-center justify-between rounded-md border p-2",
              calculatorRoiCohortToneClass(cohort),
            )}
            data-testid="calculator-roi-rank-cohort-summary"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  cohort.shippedCount === 0 ? "bg-emerald-500" : "bg-sky-500",
                )}
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium tabular-nums">
                {cohortHeadline}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {cohort.shippedCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-sky-500/30 text-sky-700 dark:text-sky-300"
                >
                  captured {formatRoiRankUsd(cohort.shippedAnnualLiftHigh)}/yr
                </Badge>
              )}
              {cohort.unshippedCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                >
                  on the table {formatRoiRankUsd(cohort.unshippedAnnualLiftHigh)}/yr
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* === ON-THE-TABLE COHORT (unshipped) =========================
            The canonical "open WHICH calculator first?" rows. Ranked
            by `annualLiftHigh DESC` and limited to `maxRows`. */}
        {cohort.unshippedRows.length > 0 && (
          <div className="space-y-1.5" data-testid="calculator-roi-rank-cohort-unshipped">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span className="inline-block h-1 w-3 rounded-sm bg-emerald-500" />
              On the table
              <span className="font-mono text-muted-foreground normal-case tracking-normal">
                ({formatCohortCount(cohort.unshippedRows.length, maxRows)} shown)
              </span>
            </div>
            <ul className="space-y-1.5" data-testid="calculator-roi-rank-list-unshipped">
              {cohort.unshippedRows.map((row) => (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5"
                  data-testid={`calculator-roi-rank-row-${row.slug}`}
                >
                  <RoiRankRowBody row={row} hydrated={hydrated} accent="emerald" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === SHIPPED COHORT =========================================
            Playbooks the operator has marked shipped via
            `ecom-ops:shipped-playbooks:v1`. Doubles as a
            "what I've captured" reminder with the projected lift
            frozen to the calculator's high-band figure. Renders only
            when at least one shipped row is present. */}
        {cohort.shippedRows.length > 0 && (
          <div className="space-y-1.5" data-testid="calculator-roi-rank-cohort-shipped">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
              <span className="inline-block h-1 w-3 rounded-sm bg-sky-500" />
              Already shipped
              <span className="font-mono text-muted-foreground normal-case tracking-normal">
                ({formatCohortCount(cohort.shippedRows.length, maxRows)} of {maxRows})
              </span>
            </div>
            <ul className="space-y-1.5" data-testid="calculator-roi-rank-list-shipped">
              {cohort.shippedRows.map((row) => (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 rounded-md border border-sky-500/20 bg-sky-500/5 px-2 py-1.5 opacity-90"
                  data-testid={`calculator-roi-rank-row-shipped-${row.slug}`}
                >
                  <RoiRankRowBody row={row} hydrated={hydrated} accent="sky" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === FOOTER ====================================================
            Explains the math + the cross-tab sync + the storage keys. */}
        <div className="text-[10px] text-muted-foreground">
          Lift = your AOV × monthly orders × 12 × move&apos;s high-band lift %.
          Reads <span className="font-mono">{YOUR_STORE_STORAGE_KEY}</span> +
          <span className="font-mono"> {SHIPPED_PLAYBOOKS_STORAGE_KEY}</span> +
          cross-tab <span className="font-mono">storage</span>. Set your
          numbers on the <Link href="#your-store" className="underline">Your-store card</Link> to
          personalize · mark shipped on <Link href="/playbooks#shipped-progress" className="underline">/playbooks</Link>.
          Payback = tool cost ÷ projected monthly lift.
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: a single ROI rank row.                              */
/* ------------------------------------------------------------------ */

interface RoiRankRowBodyProps {
  row: import("@/lib/calculator-roi-rank").CalculatorRoiRankRow;
  hydrated: boolean;
  accent: "emerald" | "sky";
}

function RoiRankRowBody({ row, hydrated, accent }: RoiRankRowBodyProps) {
  const liftClass =
    accent === "sky"
      ? "text-sky-700 dark:text-sky-300"
      : "text-emerald-700 dark:text-emerald-300";
  // Move #N.23.4 — payback-period enrichment. costHigh / (annualLiftHigh/12).
  const payback = buildPaybackEnrichment(row);
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            #{row.rank}
          </span>
          <span
            className="truncate text-xs font-medium"
            title={row.name}
          >
            {row.name}
          </span>
          <Badge
            variant="outline"
            className="ml-auto text-[10px] font-mono"
          >
            {row.daysToShip}d
          </Badge>
          {hydrated && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-mono tabular-nums",
                payback.toneClass,
              )}
              data-testid={`calculator-roi-rank-payback-${row.slug}`}
              title={
                payback.paybackMonths === null
                  ? "Payback period not measurable (zero projected lift)"
                  : payback.paybackMonths === Infinity
                    ? "Free tool — no payback needed"
                    : `Pays back tool cost in ${payback.paybackMonths.toFixed(1)} months at projected lift`
              }
              aria-label={`Payback ${payback.display}`}
            >
              ⏱ {payback.display}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            {row.calculator.calculatorKey}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {row.rationale}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex flex-col items-end gap-0.5">
          <span
            className={cn("font-mono text-xs font-semibold tabular-nums", liftClass)}
            data-testid={`calculator-roi-rank-lift-${row.slug}`}
          >
            {hydrated ? `+${formatRoiRankUsd(row.annualLiftHigh)}/yr` : "—"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {hydrated
              ? `low ${formatRoiRankUsd(row.annualLiftLow)}`
              : "—"}
          </span>
        </div>
        <Link
          href={`/playbooks/${row.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium hover:bg-muted transition-colors"
          aria-label={`Open ${row.name} calculator`}
        >
          Open ↗
        </Link>
      </div>
    </>
  );
}
