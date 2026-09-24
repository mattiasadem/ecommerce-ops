"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LOYALTY_DEFAULTS,
  LoyaltyInputs,
  forecastLoyalty,
  formatNetPerDollarProgram,
  loyaltyHealthBandShort,
} from "@/lib/loyalty-roi";
import { formatInt, formatUsd } from "@/lib/format";
import { loadYourStore, mergeFromYourStore } from "@/lib/your-store";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Loyalty Program ROI Calculator.
 *
 * Direct browser port of the canonical Smile.io / Yotpo Loyalty /
 * LoyaltyLion benchmark math from `playbooks/07-loyalty-program-smile.md`.
 * Operator enters 9 inputs (existing customers, AOV, baseline 90-day repeat
 * rate, expected +pts repeat-rate lift, enrollment rate, AOV uplift, program
 * cost, email/SMS overhead, attribution toggle) and the panel projects:
 *   - Enrolled customers per month
 *   - Incremental repeat orders (loyalty-attributed) over a 90-day window
 *   - Loyalty repeat revenue / mo
 *   - AOV-uplift revenue / mo
 *   - Total incremental revenue / mo
 *   - Loyalty cohort's share of total monthly revenue
 *   - Net revenue / month (incremental - total program cost)
 *   - Net per $1 of program cost (canonical handshake metric)
 *   - Payback months
 *   - Health band (great / good / marginal / weak / negative / unverified)
 *
 * Defaults match the playbook's mid-market DTC case (5k customers, $75 AOV,
 * 25% baseline 90-day repeat rate, +7 pts lift, 60% enrollment, $249/mo
 * Smile.io Growth + $60/mo email/SMS overhead → ~$5.3k/mo net, ~21:1
 * net-per-program-cost).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:loyalty-roi:v1`) so
 * the operator's real numbers survive reloads. Copy-report emits a
 * paste-ready markdown forecast. Reset-defaults returns to the canonical
 * baseline. Wired to Your-store via `mergeFromYourStore` — when the
 * operator has saved AOV + monthlyOrders in `/`'s Overview panel and has
 * not typed their own values, default customer base is approximate from
 * monthlyOrders (we assume a 12x monthly order / customer-base ratio for
 * SMB DTC).
 *
 * Mounted on `/playbooks/07-loyalty-program-smile` via the CALCULATORS
 * registry in `app/playbooks/[slug]/page.tsx`.
 */

const STORAGE_KEY = "ecom-ops:playbooks:loyalty-roi:v1";

type InputField = keyof LoyaltyInputs;

const NUMBER_FIELDS: Array<{
  field: Exclude<InputField, "attributionInstalled">;
  label: string;
  step: number;
  min: number;
  max?: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
}> = [
  {
    field: "existingCustomers",
    label: "Existing customer base",
    step: 250,
    min: 0,
    suffix: "customers in CRM today",
  },
  {
    field: "aov",
    label: "Average order value (AOV)",
    step: 5,
    min: 1,
    prefix: "$",
    suffix: "USD / order",
  },
  {
    field: "baselineRepeatRate90d",
    label: "Baseline 90-day repeat rate",
    step: 0.01,
    min: 0,
    max: 1,
    suffix: "fraction (0.25 = 25%)",
  },
  {
    field: "expectedRepeatRateLiftPts",
    label: "Expected repeat-rate lift",
    step: 0.01,
    min: 0,
    max: 0.2,
    suffix: "pts (+0.07 = +7 pts)",
  },
  {
    field: "loyaltyEnrollmentRate",
    label: "Loyalty enrollment rate",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction enrolled within 30d",
  },
  {
    field: "loyaltyAovUpliftPct",
    label: "Loyalty-cohort AOV uplift",
    step: 0.01,
    min: 0,
    max: 0.30,
    suffix: "fraction (+0.07 = +7% AOV)",
  },
  {
    field: "programCostMonthly",
    label: "Program cost",
    step: 25,
    min: 0,
    prefix: "$",
    suffix: "USD / mo (Smile $249 · Yotpo $119 · custom)",
  },
  {
    field: "emailSmsOverheadMonthly",
    label: "Email + SMS overhead",
    step: 10,
    min: 0,
    prefix: "$",
    suffix: "USD / mo extra launch-flow volume",
  },
];

function loadStored(): LoyaltyInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...LOYALTY_DEFAULTS, ...(parsed as Partial<LoyaltyInputs>) };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: LoyaltyInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function clamp(value: number, min: number, max?: number): number {
  if (Number.isNaN(value)) return min;
  let v = value;
  if (v < min) v = min;
  if (typeof max === "number" && v > max) v = max;
  return v;
}

const BAND_RING: Record<string, string> = {
  great: "border-emerald-500/40 bg-emerald-500/5",
  good: "border-sky-500/40 bg-sky-500/5",
  marginal: "border-amber-500/40 bg-amber-500/5",
  weak: "border-rose-500/40 bg-rose-500/5",
  negative: "border-rose-500/40 bg-rose-500/5",
  unverified: "border-border bg-muted/40",
};

export function LoyaltyROICalculator() {
  const [inputs, setInputs] = useState<LoyaltyInputs>(LOYALTY_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setFromYourStore(false);
    } else {
      // Lightweight Your-store projection: if operator saved `your-store`
      // on Overview and has not picked values yet, use:
      //   aov  <- yourStore.aov                       (direct)
      //   existingCustomers <- max(100, yourStore.monthlyOrders * 12)
      //     (SMB DTC has roughly 12× the monthly-orders size in cumulative
      //     customer base; this is a rough proxy, surfaced explicitly via
      //     the `From Your-store` pill)
      const yourStore = loadYourStore();
      if (yourStore && (yourStore.aov > 0 || yourStore.monthlyOrders > 0)) {
        const projectedCustomers = Math.max(
          100,
          Math.round(yourStore.monthlyOrders * 12),
        );
        setInputs(
          mergeFromYourStore(
            { ...LOYALTY_DEFAULTS, existingCustomers: projectedCustomers },
            yourStore,
            { attributionInstalled: true },
          ) as LoyaltyInputs,
        );
        setFromYourStore(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const fc = useMemo(() => forecastLoyalty(inputs), [inputs]);
  const band = loyaltyHealthBandShort(fc.healthBand);
  const twelveMoNet = fc.netRevenueMonthly * 12;

  const setField = (
    field: Exclude<InputField, "attributionInstalled">,
    raw: string,
  ) => {
    const cfg = NUMBER_FIELDS.find((f) => f.field === field);
    if (!cfg) return;
    const num = parseFloat(raw);
    setInputs((prev) => ({
      ...prev,
      [field]: clamp(
        Number.isNaN(num) ? cfg.min : num,
        cfg.min,
        typeof cfg.max === "number" ? cfg.max : undefined,
      ),
    }));
  };

  const toggleAttribution = () => {
    setInputs((prev) => ({
      ...prev,
      attributionInstalled: !prev.attributionInstalled,
    }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset to default loyalty ROI inputs?");
      if (!ok) return;
    }
    setInputs(LOYALTY_DEFAULTS);
    setFromYourStore(false);
  };

  const copyReport = async () => {
    const md = [
      `# Loyalty Program — ROI Forecast (Move #8, Playbook 07)`,
      ``,
      `Inputs:`,
      `  Existing customer base          : ${formatInt(inputs.existingCustomers)}`,
      `  Average order value (AOV)       : ${formatUsd(inputs.aov)}`,
      `  Baseline 90-day repeat rate     : ${(inputs.baselineRepeatRate90d * 100).toFixed(1)}%`,
      `  Expected repeat-rate lift       : +${(inputs.expectedRepeatRateLiftPts * 100).toFixed(1)} pts`,
      `  Loyalty enrollment rate         : ${(inputs.loyaltyEnrollmentRate * 100).toFixed(0)}%`,
      `  Loyalty-cohort AOV uplift       : +${(inputs.loyaltyAovUpliftPct * 100).toFixed(1)}%`,
      `  Program cost                    : ${formatUsd(inputs.programCostMonthly)} / mo`,
      `  Email + SMS overhead            : ${formatUsd(inputs.emailSmsOverheadMonthly)} / mo`,
      `  Attribution installed           : ${inputs.attributionInstalled ? "yes" : "no"}`,
      ``,
      `Forecast (monthly):`,
      `  Enrolled customers              : ${formatInt(fc.enrolledCustomers)}`,
      `  Incremental repeat orders (90d) : ${formatInt(fc.newRepeat90d)}`,
      `  Loyalty repeat revenue          : ${formatUsd(fc.loyaltyRepeatRevenueMonthly)}`,
      `  AOV-uplift revenue              : ${formatUsd(fc.aovUpliftRevenueMonthly)}`,
      `  Total incremental revenue       : ${formatUsd(fc.totalIncrementalMonthly)}`,
      `  Total program cost              : ${formatUsd(fc.totalCostMonthly)}`,
      `  Net revenue                     : ${formatUsd(fc.netRevenueMonthly)}`,
      `  Loyalty share of revenue        : ${(fc.loyaltyCohortPctOfRevenue * 100).toFixed(1)}%`,
      `  Net per $1 program cost         : ${formatNetPerDollarProgram(fc.netPerProgramDollar)}`,
      `  Payback (program cost ÷ net)    : ${Number.isFinite(fc.paybackMonths) ? fc.paybackMonths.toFixed(2) + " mo" : "n/a"}`,
      `  12-month net (compounded)       : ${formatUsd(twelveMoNet)}`,
      ``,
      `Health band: ${fc.healthBand}`,
    ].join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      id="loyalty-roi"
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4",
        BAND_RING[band],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #8 · Playbook 07
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Try the loyalty program ROI on your real numbers
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">
              playbooks/07-loyalty-program-smile.md
            </code>{" "}
            (Smile.io / Yotpo Loyalty / LoyaltyLion benchmarks). Inputs persist
            to your browser so you can come back later.
          </p>
          {fromYourStore && hydrated && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              AOV + customer base prefilled from Your store on Overview
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={copyReport}
            className={cn(
              "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {copied ? "Copied ✓" : "Copy report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-4">
        {NUMBER_FIELDS.map((cfg) => (
          <label key={cfg.field} className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {cfg.label}
            </span>
            <div className="flex items-center gap-1">
              {cfg.prefix && (
                <span className="text-xs text-muted-foreground font-mono">
                  {cfg.prefix}
                </span>
              )}
              <input
                type="number"
                inputMode="decimal"
                step={cfg.step}
                min={cfg.min}
                max={cfg.max}
                value={inputs[cfg.field]}
                onChange={(e) => setField(cfg.field, e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {cfg.suffix && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {cfg.suffix}
                </span>
              )}
            </div>
          </label>
        ))}
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Attribution installed
          </span>
          <button
            type="button"
            onClick={toggleAttribution}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              inputs.attributionInstalled
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {inputs.attributionInstalled ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Triple Whale / Polar installed (recommended)
              </>
            ) : (
              <>No attribution — quoted ROI is a self-reported estimate</>
            )}
          </button>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Enrolled customers
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatInt(fc.enrolledCustomers)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatInt(inputs.existingCustomers)} baseline ·{" "}
            {(inputs.loyaltyEnrollmentRate * 100).toFixed(0)}% enrolled
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Incremental repeat (90d)
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatInt(fc.newRepeat90d)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            from +{(inputs.expectedRepeatRateLiftPts * 100).toFixed(1)} pts lift
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total incremental / mo
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalIncrementalMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.loyaltyRepeatRevenueMonthly)} repeat ·{" "}
            {formatUsd(fc.aovUpliftRevenueMonthly)} AOV
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cohort share of revenue
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {(fc.loyaltyCohortPctOfRevenue * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            target ≥15% by month 3-6
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total program cost / mo
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalCostMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.programCostMonthly)} program ·{" "}
            {formatUsd(fc.overheadCostMonthly)} email/SMS
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net revenue / mo
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.netRevenueMonthly > 0 ? "text-success" : "text-danger",
            )}
          >
            {formatUsd(fc.netRevenueMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            incremental − total cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net per $1 program
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.netRevenueMonthly > 0 ? "text-success" : "text-danger",
            )}
          >
            {formatNetPerDollarProgram(fc.netPerProgramDollar)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            canonical handshake metric
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Payback
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              Number.isFinite(fc.paybackMonths) && fc.paybackMonths <= 3
                ? "text-success"
                : "text-foreground",
            )}
          >
            {Number.isFinite(fc.paybackMonths)
              ? `${fc.paybackMonths.toFixed(2)} mo`
              : "n/a"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            program cost ÷ monthly net
          </span>
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
        <strong className="font-medium text-foreground">Verdict: </strong>
        {fc.healthBand}
      </div>
    </div>
  );
}
