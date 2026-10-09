"use client";

/**
 * `Calculator ROI spotlight` — Move #N.24 cross-page-intelligence card
 * for the `/playbooks` catalog.
 *
 * Closes the canonical "calculator ROI rank only lives on /" gap.
 *
 * The `/` card (Move #N.23 + N.23.1 + N.23.4 + N.23.5) answered
 * "open WHICH calculator first on my numbers?" with a full top-5 rank
 * + cohort split + payback chip + sort toggle. Operators browsing the
 * `/playbooks` catalog (30 wired calculators, freshness filter,
 * shipped-toggle) had to bounce to `/` to see the projected lift on
 * their numbers — then back to `/playbooks` to open the calculator.
 *
 * The spotlight is a compact top-3 strip designed for catalog scanning:
 *
 *   - top-3 by `annualLiftHigh DESC` (no sort toggle — catalog users
 *     are browsing, not picking)
 *   - one-line headline: "N calculator-backed moves — top projects
 *     $X/yr on your numbers" (or shipped-aware variant)
 *   - per-row mini-card: rank chip + playbook name + `+$X/yr` +
 *     `⏱ Xmo` payback chip + cohort badge (unshipped → emerald,
 *     shipped → muted)
 *   - subline: "N captured · M on the table"
 *   - hydration-safe stub pattern (SSR renders `Loading…`)
 *   - cross-tab `storage` listener for live sync with `ecom-ops:your-store:v1`
 *     + `ecom-ops:shipped-playbooks:v1`
 *
 * Renders nothing when 0 calculator-backed moves exist (defensive).
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
import {
  buildCalculatorRoiSpotlight,
  formatSpotlightUsd,
  spotlightHeadline,
  spotlightSubline,
  spotlightToneClass,
  type CalculatorRoiSpotlightSummary,
} from "@/lib/calculator-roi-spotlight";
import { loadYourStore, YOUR_STORE_STORAGE_KEY, type YourStoreInputs } from "@/lib/your-store";
import {
  loadShippedPlaybooks,
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  SHIPPED_PLAYBOOKS_UPDATE_EVENT,
  type ShippedMap,
} from "@/lib/shipped-playbooks";
import { cn } from "@/lib/utils";

interface Props {
  /** Number of top rows to surface. Default 3. */
  maxRows?: number;
}

export function CalculatorRoiSpotlight({ maxRows = 3 }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<ShippedMap>({});

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setStore(loadYourStore());
    setShipped(loadShippedPlaybooks());
    setHydrated(true);
  }, []);

  // Cross-tab `storage` listener — the canonical pattern across the
  // dashboard (see `calculator-roi-rank.tsx`, `benchmark-dial.tsx`,
  // `realized-roi.tsx`).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === YOUR_STORE_STORAGE_KEY ||
        e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY ||
        e.key === null
      ) {
        setStore(loadYourStore());
        setShipped(loadShippedPlaybooks());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Same-tab CustomEvent for the shipped key (storage only fires across
  // tabs — see `shipped-playbooks.ts`).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onUpdate = () => setShipped(loadShippedPlaybooks());
    window.addEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onUpdate);
  }, []);

  const spotlight: CalculatorRoiSpotlightSummary = buildCalculatorRoiSpotlight(
    store,
    Object.fromEntries(Object.entries(shipped).map(([k, v]) => [k, !!v.shippedAt])),
    maxRows,
  );

  // Defensive: no matches → render nothing.
  if (spotlight.summary.matchingMoves === 0) return null;
  if (spotlight.rows.length === 0) return null;

  const toneCls = spotlightToneClass(spotlight);
  const headline = spotlightHeadline(spotlight);
  const subline = spotlightSubline(spotlight);

  return (
    <Card
      data-testid="calculator-roi-spotlight-card"
      className={cn("border", toneCls)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm bg-emerald-500"
              aria-hidden="true"
            />
            <CardTitle className="text-sm font-semibold">
              Calculator ROI spotlight — your numbers
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {spotlight.summary.usingDefaults && (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-300"
              >
                Defaults
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {spotlight.summary.matchingMoves} wired
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {!hydrated ? (
            <span>Loading your numbers…</span>
          ) : headline ? (
            headline
          ) : (
            subline
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {hydrated && spotlight.rows.length > 0 && (
          <ul className="space-y-1.5" data-testid="calculator-roi-spotlight-list">
            {spotlight.rows.map(({ row, payback, shipped: isShipped }) => (
              <li
                key={row.slug}
                className="flex items-center gap-2 rounded-md border border-border/50 bg-background/40 px-2 py-1.5"
                data-testid={`calculator-roi-spotlight-row-${row.slug}`}
              >
                <Badge
                  variant="outline"
                  className="text-[10px] tabular-nums w-7 justify-center"
                >
                  #{row.rank}
                </Badge>
                <Link
                  href={`/playbooks/${row.slug}`}
                  className="text-xs font-medium hover:underline truncate flex-1"
                  data-testid={`calculator-roi-spotlight-link-${row.slug}`}
                >
                  {row.name}
                </Link>
                {isShipped && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-sky-500/30 text-sky-700 dark:text-sky-300"
                    data-testid={`calculator-roi-spotlight-shipped-${row.slug}`}
                  >
                    shipped
                  </Badge>
                )}
                <span
                  className="text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300"
                  data-testid={`calculator-roi-spotlight-lift-${row.slug}`}
                >
                  +${formatSpotlightUsd(row.annualLiftHigh)}/yr
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", payback.toneClass)}
                  data-testid={`calculator-roi-spotlight-payback-${row.slug}`}
                  title={
                    !Number.isFinite(payback.paybackMonths)
                      ? "Free tool — no payback needed"
                      : payback.paybackMonths === null
                          ? "Payback period not measurable"
                          : `${payback.paybackMonths.toFixed(1)} months to pay back ${formatSpotlightUsd(payback.costHighUsd)} tool cost`
                  }
                >
                  ⏱ {payback.display}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {hydrated && (
          <div className="flex items-center justify-between pt-1">
            <span
              className="text-[10px] text-muted-foreground"
              data-testid="calculator-roi-spotlight-subline"
            >
              {subline}
            </span>
            <Link
              href="/#calculator-roi-rank"
              className="text-[10px] uppercase tracking-wider text-accent hover:underline"
            >
              Full rank on / →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}