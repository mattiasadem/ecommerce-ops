"use client";

import { useEffect, useMemo, useState } from "react";
import {
  STOCKOUT_DEFAULTS,
  StockoutInputs,
  computeStockoutRisk,
  mergeFromYourStoreForStockout,
  renderStockoutMarkdown,
  stockoutVerdictTag,
  validateStockoutInputs,
  type Verdict,
} from "@/lib/stockout-risk";
import { loadYourStore } from "@/lib/your-store";
import { formatInt, formatUsd } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * `Stockout-risk calculator` — interactive tool on `/inventory`.
 *
 * Direct browser port of the stockout-risk math in
 * `research/06-inventory-ops.md §forecasting-basics` + `playbooks/...` (no
 * dedicated Python CLI yet — math is derived from canonical DTC inventory
 * benchmarks).
 *
 * Operator enters 8 inputs:
 *   - monthlyOrders, aov, grossMargin        (from Your-store on Overview)
 *   - onHandUnits, weeklySellThroughPct       (current sellable inventory)
 *   - supplierLeadTimeDays, safetyStockWeeks  (supply + buffer posture)
 *   - reorderCadenceDays                      (PO cadence)
 *   - wholesaleCostPctOfAov                   (wholesale ÷ retail)
 *
 * The panel responds with:
 *   - Weeks-of-stock + expected-stockout-in-days (cover math)
 *   - Days-of-cover-gap vs reorder-arrival window (positive = at risk)
 *   - Lost revenue + lost margin if stockout hits (over the gap window)
 *   - Recommended PO size + wholesale cost (so the reorder is sized correctly)
 *   - 5-band verdict (STOCKOUT IMMINENT / TIGHT / WATCH / HEALTHY / OVERSTOCKED)
 *   - Annual carry cost (only meaningful when stock > 26 weeks)
 *
 * Why this is on `/inventory`: the page historically had two research tables
 * (3PL vs in-house cost stack + Major 3PLs) + the InventoryCostComparator.
 * Closing the loop with a sell-through × lead-time × cadence calculator
 * turns the page from a static reference into the operator's actual
 * weekly-stockout dashboard.
 *
 * Cross-page intelligence: on mount, reads `ecom-ops:your-store:v1` from
 * Overview. If the operator edits AOV / monthlyOrders / grossMargin there,
 * the calculator re-hydrates on focus via the `storage` event.
 *
 * State-persistence contract: `ecom-ops:stockout-risk:v1` (full inputs map).
 * Bump the suffix on incompatible schema changes — old keys fall through
 * to Your-store or defaults on next mount.
 */

const STORAGE_KEY = "ecom-ops:stockout-risk:v1";

type InputField = keyof StockoutInputs;

const NUMBER_FIELDS: Array<{
  field: InputField;
  label: string;
  step: number;
  min: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}> = [
  { field: "monthlyOrders", label: "Monthly orders", step: 50, min: 0, suffix: "orders/mo", hint: "from Overview (auto)" },
  { field: "aov", label: "AOV", step: 1, min: 1, prefix: "$", suffix: "USD", hint: "from Overview (auto)" },
  { field: "grossMargin", label: "Gross margin", step: 0.05, min: 0, max: 1, suffix: "fraction (0.70 = 70%)", hint: "from Overview (auto)" },
  { field: "onHandUnits", label: "On-hand units", step: 50, min: 0, suffix: "sellable now", hint: "Shopify Inventory" },
  { field: "weeklySellThroughPct", label: "Weekly sell-through", step: 0.05, min: 0, max: 5, suffix: "fraction sold per week", hint: "0.25 = 4-week cover" },
  { field: "supplierLeadTimeDays", label: "Supplier lead time", step: 1, min: 0, suffix: "days from PO", hint: "Asia ocean = 60-90d" },
  { field: "safetyStockWeeks", label: "Safety stock weeks", step: 0.5, min: 0, suffix: "weeks buffer on hand", hint: "1-4 wk typical" },
  { field: "reorderCadenceDays", label: "Reorder cadence", step: 1, min: 1, suffix: "days between POs", hint: "14 = biweekly" },
  { field: "wholesaleCostPctOfAov", label: "Wholesale ÷ AOV", step: 0.05, min: 0, max: 1, suffix: "fraction (0.40 typical)", hint: "COGS / retail" },
];

const VERDICT_TONE: Record<Verdict, string> = {
  stockout_imminent: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  tight: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  watch: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  healthy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  overstocked: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
};

function clamp(value: number, min: number, max?: number): number {
  if (!Number.isFinite(value)) return min;
  const lo = Math.min(value, max ?? value);
  const hi = Math.max(value, min);
  return Math.min(hi, max ?? hi);
}

function loadStored(): StockoutInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      monthlyOrders: clamp(Number(parsed.monthlyOrders) || STOCKOUT_DEFAULTS.monthlyOrders, 0, 100_000_000),
      aov: clamp(Number(parsed.aov) || STOCKOUT_DEFAULTS.aov, 1, 100_000),
      grossMargin: clamp(Number(parsed.grossMargin) || STOCKOUT_DEFAULTS.grossMargin, 0, 1),
      onHandUnits: clamp(Number(parsed.onHandUnits) || STOCKOUT_DEFAULTS.onHandUnits, 0, 100_000_000),
      weeklySellThroughPct: clamp(Number(parsed.weeklySellThroughPct) || STOCKOUT_DEFAULTS.weeklySellThroughPct, 0, 5),
      supplierLeadTimeDays: clamp(Number(parsed.supplierLeadTimeDays) || STOCKOUT_DEFAULTS.supplierLeadTimeDays, 0, 365),
      safetyStockWeeks: clamp(Number(parsed.safetyStockWeeks) || STOCKOUT_DEFAULTS.safetyStockWeeks, 0, 52),
      reorderCadenceDays: clamp(Number(parsed.reorderCadenceDays) || STOCKOUT_DEFAULTS.reorderCadenceDays, 1, 365),
      wholesaleCostPctOfAov: clamp(Number(parsed.wholesaleCostPctOfAov) || STOCKOUT_DEFAULTS.wholesaleCostPctOfAov, 0, 1),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: StockoutInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private-mode */
  }
  // Same-tab dispatch (storage event only fires cross-tab on most browsers)
  try {
    window.dispatchEvent(new CustomEvent("ecom-ops:stockout-risk:update"));
  } catch {
    /* older browsers — ignore */
  }
}

export function StockoutRiskCalculator() {
  const [inputs, setInputs] = useState<StockoutInputs>(() => STOCKOUT_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [storeSource, setStoreSource] = useState<
    "stored" | "your-store" | "defaults"
  >("defaults");

  // Hydrate from localStorage; fall back to Your-store overlay; else defaults.
  useEffect(() => {
    const stored = loadStored();
    const yourStore = loadYourStore();
    if (stored) {
      setInputs(stored);
      setStoreSource("stored");
    } else if (yourStore) {
      setInputs(mergeFromYourStoreForStockout(STOCKOUT_DEFAULTS, yourStore));
      setStoreSource("your-store");
    } else {
      setStoreSource("defaults");
    }
    setHydrated(true);
  }, []);

  // Cross-tab + same-tab: refresh Your-store when the storage event fires.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "ecom-ops:your-store:v1") return;
      // Only overlay when the operator hasn't already saved their own inputs.
      if (storeSource !== "your-store") return;
      const yourStore = loadYourStore();
      if (!yourStore) return;
      setInputs((prev) => mergeFromYourStoreForStockout(prev, yourStore));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [storeSource]);

  const validation = validateStockoutInputs(inputs);
  const result = useMemo(() => {
    if (validation) return null;
    try {
      return computeStockoutRisk(inputs);
    } catch {
      return null;
    }
  }, [inputs, validation]);

  const updateField = (field: InputField, raw: string) => {
    const num = Number(raw);
    setInputs((prev) => ({ ...prev, [field]: Number.isFinite(num) ? num : 0 }));
  };

  const resetDefaults = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const yourStore = loadYourStore();
    if (yourStore) {
      setInputs(mergeFromYourStoreForStockout(STOCKOUT_DEFAULTS, yourStore));
      setStoreSource("your-store");
    } else {
      setInputs(STOCKOUT_DEFAULTS);
      setStoreSource("defaults");
    }
  };

  const saveCurrent = () => {
    storeInputs(inputs);
    setStoreSource("stored");
  };

  const markdown = result
    ? renderStockoutMarkdown(inputs, result)
    : "";

  // Only persist when the user has opted in OR explicitly saved. Don't
  // write to localStorage on every keystroke (that would surprise the
  // operator who landed fresh from the navigation).
  useEffect(() => {
    if (storeSource === "stored") storeInputs(inputs);
  }, [inputs, storeSource]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-5">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Stockout risk — weeks-of-stock × lead time × cadence
          </h3>
          <p className="text-xs text-muted-foreground">
            Cross-checks your on-hand inventory against supplier lead time +
            reorder cadence + safety buffer. Lost-revenue math uses your
            AOV × gross margin.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {storeSource === "your-store" ? (
            <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
              from Your-store
            </span>
          ) : null}
          {storeSource === "stored" ? (
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              saved
            </span>
          ) : null}
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={saveCurrent}
            disabled={!hydrated}
            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-300"
          >
            Save as my numbers
          </button>
        </div>
      </header>

      {/* Number grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
        {NUMBER_FIELDS.map(({ field, label, step, min, max, prefix, suffix, hint }) => (
          <label key={field} className="flex flex-col gap-0.5">
            <span className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              {hint ? (
                <span className="text-[9px] text-muted-foreground/70">{hint}</span>
              ) : null}
            </span>
            <span className="flex items-center gap-1">
              {prefix ? (
                <span className="text-[10px] text-muted-foreground">{prefix}</span>
              ) : null}
              <input
                type="number"
                inputMode="decimal"
                step={step}
                min={min}
                max={max}
                value={Number.isFinite(inputs[field] as number) ? (inputs[field] as number) : ""}
                onChange={(e) => updateField(field, e.currentTarget.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {suffix ? (
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  {suffix}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>

      {/* Verdict strip + key numbers */}
      {result ? (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "rounded-md border px-3 py-2.5 text-sm",
              VERDICT_TONE[result.verdict],
            )}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest">
                {stockoutVerdictTag(result.verdict).label}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {result.reorderNow ? "reorder now" : "cover absorbs arrival"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed">
              {result.verdictJustification}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label="Weeks of stock"
              value={`${result.weeksOfStock.toFixed(1)} wk`}
              hint={`velocity ${formatInt(result.weeklyVelocityUnits)} u/wk`}
            />
            <Stat
              label="Stockout in"
              value={`${Math.max(0, result.expectedStockoutInDays).toFixed(0)} d`}
              hint={`reorder arrival ${result.reorderArrivalDays.toFixed(0)} d`}
              tone={result.daysOfCoverGap > 0 ? "danger" : "neutral"}
            />
            <Stat
              label="Revenue at risk"
              value={formatUsd(result.lostRevenueIfStockout)}
              hint={`${formatInt(result.lostOrdersIfStockout)} orders over ${Math.max(0, result.daysOfCoverGap).toFixed(0)}d`}
              tone={result.lostRevenueIfStockout > 0 ? "danger" : "positive"}
            />
            <Stat
              label="Margin at risk"
              value={formatUsd(result.lostMarginIfStockout)}
              hint={`at ${(inputs.grossMargin * 100).toFixed(0)}% gross margin`}
              tone={result.lostMarginIfStockout > 0 ? "danger" : "positive"}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reorder this week
              </h4>
              <p className="mt-1 text-sm">
                PO size{" "}
                <span className="font-semibold tabular-nums">
                  {formatInt(result.recommendedPoUnits)}
                </span>{" "}
                units, wholesale cost{" "}
                <span className="font-semibold tabular-nums">
                  {formatUsd(result.recommendedPoCostUsd)}
                </span>{" "}
                (at {(inputs.wholesaleCostPctOfAov * 100).toFixed(0)}% of AOV).
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Target = cover lead time ({inputs.supplierLeadTimeDays}d) + half
                cadence + {inputs.safetyStockWeeks}-week buffer minus current
                on-hand.
              </p>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Carry cost (annual)
              </h4>
              <p className="mt-1 text-sm">
                {formatUsd(result.estAnnualCarryCostUsd)}
                <span className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  ~{(result.annualCarryCostPct * 100).toFixed(0)}% of on-hand wholesale
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Becomes a real drag when weeks-of-stock exceeds 26 — pushes the
                verdict into OVERSTOCKED.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton
              value={markdown}
              label="Copy audit report"
              variant="outline"
            />
            <span className="text-[11px] text-muted-foreground">
              paste-ready for standup / Notion / Slack
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-rose-700 dark:text-rose-300">
          {validation ? `Invalid input: ${validation}` : "Math failed."}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "danger" | "positive" | "neutral";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-700 dark:text-rose-300"
      : tone === "positive"
        ? "text-emerald-700 dark:text-emerald-300"
        : "";
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 font-mono tabular-nums text-base font-semibold", toneClass)}>
        {value}
      </div>
      {hint ? (
        <div className="text-[10px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
