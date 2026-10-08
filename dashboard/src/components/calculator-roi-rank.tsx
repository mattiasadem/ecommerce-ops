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
import { loadYourStore, YOUR_STORE_STORAGE_KEY, type YourStoreInputs } from "@/lib/your-store";
import { cn } from "@/lib/utils";



interface Props {
  /** Number of top rows to surface. Default 5. */
  maxRows?: number;
}

export function CalculatorRoiRank({ maxRows = 5 }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<YourStoreInputs | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setStore(loadYourStore());
    setHydrated(true);
  }, []);

  // Cross-tab `storage` listener (the canonical pattern across the
  // dashboard — see `benchmark-dial.tsx`, `realized-roi.tsx`, etc.).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === YOUR_STORE_STORAGE_KEY || e.key === null) {
        setStore(loadYourStore());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const summary: CalculatorRoiRankSummary = buildCalculatorRoiRank(store);

  // Defensive: no matches → render nothing.
  if (summary.matchingMoves === 0) return null;

  // Defensive: catalog empty → render nothing.
  if (summary.rows.length === 0) return null;

  const toneClass = calculatorRoiRankToneClass(summary);
  const headline = calculatorRoiRankHeadline(summary);
  const top = summary.rows.slice(0, maxRows);

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
                    top.reduce((s, r) => s + r.annualLiftHigh, 0),
                  )
                : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {summary.usingDefaults
                ? "Set your AOV / orders on / to personalize"
                : `Across top ${top.length} calculator-backed moves`}
            </div>
          </div>
        </div>

        <Separator />

        {/* === RANKED ROWS =============================================
            Each row is the playbook calculator that, on the operator's
            CURRENT `YourStoreInputs`, projects the highest annual lift
            (high band). Each row links to `/playbooks/[slug]` so the
            operator can drill in. */}
        <ul className="space-y-1.5" data-testid="calculator-roi-rank-list">
          {top.map((row) => (
            <li
              key={row.slug}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/50 px-2 py-1.5"
              data-testid={`calculator-roi-rank-row-${row.slug}`}
            >
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
                    className="font-mono text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300"
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
            </li>
          ))}
        </ul>

        {/* === FOOTER ====================================================
            Explains the math + the cross-tab sync + the storage key. */}
        <div className="text-[10px] text-muted-foreground">
          Lift = your AOV × monthly orders × 12 × move&apos;s high-band lift %.
          Reads <span className="font-mono">{YOUR_STORE_STORAGE_KEY}</span> +
          cross-tab <span className="font-mono">storage</span>. Set your
          numbers on the <Link href="#your-store" className="underline">Your-store card</Link> to
          personalize.
        </div>
      </CardContent>
    </Card>
  );
}
