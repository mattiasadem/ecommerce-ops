"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AI_AD_CREATIVE_DEFAULTS,
  AiAdCreativeInputs,
  aiAdCreativeHealthBandShort,
  formatNetPerDollarTool,
  forecastAiAdCreative,
} from "@/lib/ai-ad-creative-roi";
import { formatInt, formatUsd } from "@/lib/format";
import { loadYourStore, mergeFromYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

/**
 * Interactive AI Ad-Creative Iteration ROI Calculator.
 *
 * Direct browser port of `scripts/ai_ad_creative_roi.py`. Operator enters
 * monthly ad spend, baseline ROAS, expected +% ROAS lift from AI creative,
 * AI tool cost + tool count, variants/week, operator hours + hourly cost,
 * and an attribution flag → instant forecast of baseline + lift revenue,
 * post-ROAS, total cost, net revenue, net per $1 of AI tool cost,
 * cost/revenue per variant, ROAS-lift payback days, and a 5-tier health
 * verdict (great ≥10:1 / good 3-10:1 / marginal 1-3:1 / weak / negative).
 *
 * Defaults match the Python CLI's $5k-mo + Triple Whale Moby Starter
 * baseline (12.87× net per $1 tool cost → great band).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:aic-roi:v1`) so the
 * operator's real numbers survive reloads. Copy-report button emits a
 * paste-ready markdown forecast. Reset-defaults returns to the canonical
 * baseline.
 *
 * Mounted on `/playbooks` (Move #10 AI ad-creative iteration card).
 * Integrated with Your-store via projection: monthlyOrders → `monthlyAdSpend`
 * is a poor proxy for "ad spend" so the projection only kicks in when the
 * operator has explicitly typed `monthlyAdSpend` as input — the live value
 * is left at the canonical $5k baseline unless the operator overrides it.
 * We surface the projection through a separate `From Your-store` pill that
 * only appears when monthlyAdSpend would actually be reasonable to use.
 */

const STORAGE_KEY = "ecom-ops:playbooks:aic-roi:v1";

type InputField = keyof AiAdCreativeInputs;

const NUMBER_FIELDS: Array<{
  field: Exclude<InputField, "attributionTool">;
  label: string;
  step: number;
  min: number;
  max?: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
}> = [
  {
    field: "monthlyAdSpend",
    label: "Monthly ad spend",
    step: 250,
    min: 0,
    prefix: "$",
    suffix: "USD",
  },
  {
    field: "baselineRoas",
    label: "Baseline ROAS",
    step: 0.1,
    min: 0.1,
    max: 20,
    suffix: "× (e.g. 2.5 = $2.50 rev / $1 spend)",
  },
  {
    field: "expectedRoasLiftPct",
    label: "Expected ROAS lift",
    step: 0.05,
    min: 0,
    max: 2,
    suffix: "fraction (0.20 = +20% ROAS lift)",
  },
  {
    field: "aiToolCostMonthly",
    label: "AI tool cost (each)",
    step: 25,
    min: 0,
    prefix: "$",
    suffix: "USD / tool / mo",
  },
  {
    field: "aiToolsCount",
    label: "AI tools in stack",
    step: 1,
    min: 1,
    max: 10,
    suffix: "1 (Moby) / 2 (Moby + AdCreative.ai)",
  },
  {
    field: "creativeVariantsPerWeek",
    label: "Variants / week",
    step: 5,
    min: 0,
    suffix: "AI-generated creative variants",
  },
  {
    field: "operatorHoursPerWeek",
    label: "Operator hours / week",
    step: 0.5,
    min: 0,
    suffix: "curating AI outputs",
  },
  {
    field: "operatorHourlyCost",
    label: "Operator hourly cost",
    step: 5,
    min: 0,
    prefix: "$",
    suffix: "USD fully-loaded",
  },
];

function loadStored(): AiAdCreativeInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...AI_AD_CREATIVE_DEFAULTS, ...(parsed as Partial<AiAdCreativeInputs>) };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: AiAdCreativeInputs) {
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

const INTENT_RING: Record<string, string> = {
  great: "border-emerald-500/40 bg-emerald-500/5",
  good: "border-sky-500/40 bg-sky-500/5",
  marginal: "border-amber-500/40 bg-amber-500/5",
  weak: "border-rose-500/40 bg-rose-500/5",
  negative: "border-rose-500/40 bg-rose-500/5",
  "zero-cost": "border-border bg-muted/40",
};

export function AiAdCreativeROICalculator() {
  const [inputs, setInputs] = useState<AiAdCreativeInputs>(AI_AD_CREATIVE_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setFromYourStore(false);
    } else {
      // Lightweight Your-store projection: if operator saved a non-empty
      // `your-store` and hasn't picked a value yet, use monthlyOrders as a
      // rough ad-spend hint (most SMB DTC = ~30–50% of revenue back into
      // ads; cap at $50k to avoid runaway values from very large stores).
      const yourStore = loadYourStore();
      if (yourStore && yourStore.monthlyOrders > 0) {
        const proxySpend = Math.min(50000, yourStore.monthlyOrders * 30);
        setInputs(
          mergeFromYourStore(
            { ...AI_AD_CREATIVE_DEFAULTS, monthlyAdSpend: proxySpend },
            yourStore,
            { attributionTool: true },
          ) as AiAdCreativeInputs,
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

  const fc = useMemo(() => forecastAiAdCreative(inputs), [inputs]);
  const band = aiAdCreativeHealthBandShort(fc.healthBand);

  const setField = (
    field: Exclude<InputField, "attributionTool">,
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
    setInputs((prev) => ({ ...prev, attributionTool: !prev.attributionTool }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset to default AI ad-creative ROI inputs?");
      if (!ok) return;
    }
    setInputs(AI_AD_CREATIVE_DEFAULTS);
    setFromYourStore(false);
  };

  const copyReport = async () => {
    const md = [
      `# AI Ad-Creative Iteration — ROI Forecast`,
      ``,
      `Inputs:`,
      `  Monthly ad spend              : ${formatUsd(inputs.monthlyAdSpend)}`,
      `  Baseline ROAS                 : ${inputs.baselineRoas.toFixed(2)}x`,
      `  Expected ROAS lift            : ${(inputs.expectedRoasLiftPct * 100).toFixed(1)}%`,
      `  AI tool cost (per tool)       : ${formatUsd(inputs.aiToolCostMonthly)}`,
      `  AI tools in stack             : ${inputs.aiToolsCount}`,
      `  Variants / week               : ${inputs.creativeVariantsPerWeek}`,
      `  Operator hours / week         : ${inputs.operatorHoursPerWeek.toFixed(1)}`,
      `  Operator hourly cost          : ${formatUsd(inputs.operatorHourlyCost)}`,
      `  Attribution installed         : ${inputs.attributionTool ? "yes" : "no"}`,
      ``,
      `Forecast (monthly):`,
      `  Baseline revenue              : ${formatUsd(fc.baselineRevenueMonthly)}`,
      `  Lift revenue (incremental)    : ${formatUsd(fc.liftRevenueMonthly)}`,
      `  Post-tool ROAS                : ${fc.postRoas.toFixed(2)}x`,
      `  AI tool stack cost            : ${formatUsd(fc.aiToolCostMonthly)}`,
      `  Operator cost                 : ${formatUsd(fc.operatorCostMonthly)}`,
      `  Total cost                    : ${formatUsd(fc.totalCostMonthly)}`,
      `  Net revenue (lift - cost)     : ${formatUsd(fc.netRevenueMonthly)}`,
      `  Net per $1 AI tool cost       : ${formatNetPerDollarTool(fc.netPerDollarTool)}`,
      `  Variants / month              : ${fc.variantsPerMonth.toFixed(1)}`,
      `  Cost per variant              : ${formatUsd(fc.costPerVariant)}`,
      `  Revenue per variant           : ${formatUsd(fc.revenuePerVariant)}`,
      `  ROAS lift payback (days)      : ${fc.roasLiftPaybackDays.toFixed(2)}`,
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
      id="ai-ad-creative-roi"
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4",
        INTENT_RING[band],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #10
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Try the AI ad-creative iteration ROI on your real numbers
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/ai_ad_creative_roi.py</code>
            . Inputs persist to your browser so you can come back later.
          </p>
          {fromYourStore && hydrated && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Ad-spend prefilled from Your store on Overview
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
                <span className="text-xs text-muted-foreground font-mono">{cfg.prefix}</span>
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
              inputs.attributionTool
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {inputs.attributionTool ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Triple Whale / Polar installed (recommended)
              </>
            ) : (
              <>No attribution — wild guess territory</>
            )}
          </button>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Lift revenue / mo
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.liftRevenueMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            post-ROAS {fc.postRoas.toFixed(2)}× on {formatUsd(inputs.monthlyAdSpend)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total cost / mo
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalCostMonthly)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.aiToolCostMonthly)} tool · {formatUsd(fc.operatorCostMonthly)} op
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
            lift revenue − total cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net per $1 AI tool
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              band === "great" && "text-success",
              band === "good" && "text-accent",
              band === "marginal" && "text-warning",
              (band === "weak" || band === "negative") && "text-danger",
            )}
          >
            {formatNetPerDollarTool(fc.netPerDollarTool)}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {fc.healthBand}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Variants / month
          </span>
          <span className="text-base font-semibold tabular-nums">
            {fc.variantsPerMonth.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cost / variant
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.costPerVariant)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Revenue / variant
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.revenuePerVariant)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            ROAS lift payback
          </span>
          <span className="text-base font-semibold tabular-nums">
            {fc.roasLiftPaybackDays.toFixed(2)} days
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match a $1M-GMV DTC brand on Triple Whale Moby Starter
          ($5k/mo spend × 2.5× baseline ROAS × +20% lift × $149/mo Moby × 2
          hr/wk curator × $50/hr operator = <strong className="font-semibold text-foreground">$1,917.67 net revenue / mo</strong>,{" "}
          <strong className="font-semibold text-success">12.87× net / $1 tool</strong>,
          great band). Open playbook{" "}
          <code className="font-mono text-[11px]">10-ai-ad-creative-iteration</code>{" "}
          below for the paste-ready build sequence. Output also projected live
          in the Next-move recommendation card on Overview.
        </span>
        <CopyButton value="10-ai-ad-creative-iteration" label="Copy playbook ID" />
      </div>
    </div>
  );
}
