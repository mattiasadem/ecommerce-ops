"use client";

/**
 * `CalculatorRoiChip` — Move #N.25 per-playbook ROI chip.
 *
 * The compact roi chip rendered at the top of every calculator-backed
 * `/playbooks/[slug]` page (above the embedded calculator). It answers
 * the canonical "before I open this calculator, what's this move
 * projected to make on my numbers? — and how fast does the tool pay
 * for itself?" question in one row of chips.
 *
 * What's on the chip:
 *
 *   - `+$XXX/yr` projected annual lift on the operator's numbers
 *     (high band; defensive "—" for zero/non-finite)
 *   - `low $XX/yr` low band lift (defensive floor)
 *   - `⏱ Xmo` payback chip (Move #N.23.4 enrichment — emerald /
 *     sky / amber / rose with free-tool `∞` and not-measurable `—`
 *     branches)
 *   - `#3 of 7` rank-within-calculator-backed-Top-10 chip (e.g. "this
 *     move is the 3rd-highest projected lift on the canonical
 *     calculator-backed Top-10")
 *   - `Xd` days-to-ship badge
 *   - `On the table` / `Shipped` cohort badge
 *   - Defaults badge in the header (when `usingDefaults`)
 *
 * Hydration-safe:
 *
 *   - SSR uses `YourStoreInputs | null` → `usingDefaults=true` and
 *     renders the AMBER Defaults headline ("Projects $X/yr at default
 *     ..."). Static, no client-only state, no `Date.now`, no
 *     `localStorage` — so SSR + first-paint HTML match byte-for-byte.
 *   - On mount, `useEffect` reads the localStorage keys and `setHydrated(true)`.
 *   - Cross-tab `storage` event listener + same-tab
 *     `SHIPPED_PLAYBOOKS_UPDATE_EVENT` / `YOUR_STORE_UPDATE_EVENT`
 *     listeners re-compute on either side.
 *
 * Renders null when `slug` is not in the calculator-backed Top-10 (so
 * non-Top-10 playbooks without calculators get no visual noise).
 *
 * This is intentionally a TINY chip — one row of badges — not a full
 * card. Operators opening a playbook already see the calculator
 * itself below. The chip's job is the answer-at-a-glance: "is this
 * move worth opening the calculator on my numbers?" + "how fast does
 * the tool pay for itself?".
 */

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  YOUR_STORE_DEFAULTS,
  YOUR_STORE_STORAGE_KEY,
  type YourStoreInputs,
} from "@/lib/your-store";
import {
  SHIPPED_PLAYBOOKS_STORAGE_KEY,
  SHIPPED_PLAYBOOKS_UPDATE_EVENT,
} from "@/lib/shipped-playbooks";
import {
  buildCalculatorRoiChip,
  calculatorRoiChipHeadline,
  calculatorRoiChipRankLabel,
  calculatorRoiChipToneClass,
  formatChipUsd,
  CANONICAL_CALCULATOR_ROI_CHIP,
  type CalculatorRoiChipRow,
} from "@/lib/calculator-roi-chip";
import { paybackToneClass, formatPaybackMonths } from "@/lib/calculator-roi-payback";

interface CalculatorRoiChipProps {
  /** The playbook slug from the URL — must match a key in `CALCULATOR_REGISTRY`. */
  slug: string;
}

export function CalculatorRoiChip({ slug }: CalculatorRoiChipProps) {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<YourStoreInputs | null>(null);
  const [shipped, setShipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHydrated(true);
    const recompute = () => {
      // Your-store.
      try {
        const raw = window.localStorage.getItem(YOUR_STORE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const aov = Number(parsed?.aov);
          const monthlyOrders = Number(parsed?.monthlyOrders);
          const grossMargin = Number(parsed?.grossMargin);
          if (
            Number.isFinite(aov) &&
            Number.isFinite(monthlyOrders) &&
            Number.isFinite(grossMargin) &&
            aov > 0 &&
            monthlyOrders > 0
          ) {
            setStore({
              aov,
              monthlyOrders,
              grossMargin,
            });
          } else {
            setStore(null);
          }
        } else {
          setStore(null);
        }
      } catch {
        setStore(null);
      }
      // Shipped.
      try {
        const rawShipped = window.localStorage.getItem(SHIPPED_PLAYBOOKS_STORAGE_KEY);
        if (rawShipped) {
          const parsed = JSON.parse(rawShipped);
          if (parsed && typeof parsed === "object") {
            const flat: Record<string, boolean> = {};
            for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
              flat[k] =
                v === true ||
                (typeof v === "object" && v !== null && (v as { shipped?: boolean }).shipped === true);
            }
            setShipped(flat);
          } else {
            setShipped({});
          }
        } else {
          setShipped({});
        }
      } catch {
        setShipped({});
      }
    };

    recompute();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === YOUR_STORE_STORAGE_KEY ||
        e.key === SHIPPED_PLAYBOOKS_STORAGE_KEY ||
        e.key === null
      ) {
        recompute();
      }
    };
    const onShippedUpdate = () => recompute();
    window.addEventListener("storage", onStorage);
    window.addEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onShippedUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SHIPPED_PLAYBOOKS_UPDATE_EVENT, onShippedUpdate);
    };
  }, []);

  // SSR + first-paint: render the stub so SSR HTML matches client
  // first paint (no Date/localStorage reads on server).
  if (!hydrated) {
    return (
      <div
        data-testid="calculator-roi-chip-stub"
        className="rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground"
      >
        {CANONICAL_CALCULATOR_ROI_CHIP.stubLabel}
      </div>
    );
  }

  const row: CalculatorRoiChipRow = buildCalculatorRoiChip(slug, store, shipped);

  // Slug not in calculator-backed rank → render nothing (defensive:
  // non-Top-10 playbooks shouldn't show a chip from another move's math).
  if (!row.inTop10WithCalculator || !row.row || !row.payback) {
    return null;
  }

  const headline = calculatorRoiChipHeadline(row);
  const toneClass = calculatorRoiChipToneClass(row);
  const rankLabel = calculatorRoiChipRankLabel(row, row.row ? 7 : 0);

  // Projected lifts — defensive NaN-safe formatters.
  const annualLiftHighFmt = formatChipUsd(row.row.annualLiftHigh);
  const annualLiftLowFmt = formatChipUsd(row.row.annualLiftLow);
  const paybackDisplay = formatPaybackMonths(row.payback.paybackMonths);
  const paybackTone = paybackToneClass(row.payback.paybackMonths);
  const paybackTitle =
    row.payback.paybackMonths === null
      ? "Projected lift is zero — payback not measurable"
      : !Number.isFinite(row.payback.paybackMonths)
        ? "Free tool — no payback needed"
        : `Tool cost ${formatChipUsd(row.payback.costHighUsd)} / projected monthly lift ${formatChipUsd(
            row.row.monthlyLiftHigh,
          )} → ${row.payback.paybackMonths.toFixed(1)} months`;

  return (
    <section
      data-testid="calculator-roi-chip"
      data-slug={slug}
      className={`rounded-md border px-4 py-3 text-sm ${toneClass}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Calculator ROI chip
        </span>
        {row.usingDefaults ? (
          <Badge variant="outline" className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            Defaults
          </Badge>
        ) : null}
        {rankLabel ? (
          <Badge variant="outline" className="text-[10px] font-mono">
            {rankLabel}
          </Badge>
        ) : null}
        <Badge variant="outline" className="text-[10px]">
          {row.row.daysToShip}d to ship
        </Badge>
        {row.shipped ? (
          <Badge variant="outline" className="text-[10px] border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300">
            Shipped
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            On the table
          </Badge>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {headline ? (
          <span className="text-sm font-medium text-foreground">{headline}</span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          title={`High band: ${formatChipUsd(row.row.annualLiftHigh)}/yr`}
        >
          +${annualLiftHighFmt}/yr
        </Badge>
        <Badge variant="outline" className="text-[10px] text-muted-foreground" title={`Low band: ${annualLiftLowFmt}/yr`}>
          low ${annualLiftLowFmt}/yr
        </Badge>
        <Badge
          variant="outline"
          className={`text-[10px] ${paybackTone}`}
          title={paybackTitle}
          data-testid={`calculator-roi-chip-payback-${slug}`}
        >
          ⏱ {paybackDisplay}
        </Badge>
        <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
          {row.row.calculator.calculatorKey}
        </Badge>
      </div>
      <Separator className="my-3" />
      <div className="text-[10px] text-muted-foreground">
        Live on Your-store <span className="font-mono">{YOUR_STORE_STORAGE_KEY}</span>
        {row.usingDefaults
          ? ` · defaults: AOV $${YOUR_STORE_DEFAULTS.aov}/order · ${YOUR_STORE_DEFAULTS.monthlyOrders} orders/mo · ${Math.round(YOUR_STORE_DEFAULTS.grossMargin * 100)}% margin`
          : ` · AOV $${store?.aov ?? 0} · ${store?.monthlyOrders ?? 0} orders/mo`}
        {" · "}
        <a href="/" className="underline hover:text-foreground">
          see full rank on /
        </a>
      </div>
    </section>
  );
}
