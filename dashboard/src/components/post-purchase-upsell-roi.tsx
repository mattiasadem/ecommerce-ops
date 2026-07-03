"use client";

import { useEffect, useMemo, useState } from "react";
import {
  POST_PURCHASE_UPSELL_DEFAULTS,
  PostPurchaseUpsellInputs,
  forecastPostPurchaseUpsell,
  healthBandIntent,
  healthBandShort,
} from "@/lib/post-purchase-upsell-roi";
import { formatInt, formatPercent, formatRatio, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

/**
 * Interactive Post-Purchase Upsell ROI Calculator.
 *
 * Direct browser port of `scripts/post_purchase_upsell_roi.py`. Operator
 * enters orders/month, base AOV, upsell acceptance rate, upsell AOV,
 * upsell margin, and platform cost-per-order; the panel forecasts upsell
 * units accepted, incremental revenue, incremental margin, platform cost,
 * net lift, blended AOV lift %, and ROI ratio (net lift per $1 platform
 * cost).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:ppu-roi:v1`) so the
 * operator's real numbers survive reloads. Copy-report emits a paste-ready
 * markdown forecast to the clipboard. Reset-defaults returns to the
 * canonical 1k-order / $80 AOV / 15% accept / $35 upsell / 70% margin /
 * $0.10 ReConvert baseline (35.7:1 great band).
 *
 * Mounted on `/playbooks` next to the abandoned-cart and welcome-series
 * calculators. Same math + defaults as the Python CLI — no drift.
 */

const STORAGE_KEY = "ecom-ops:playbooks:ppu-roi:v1";

type InputField = keyof PostPurchaseUpsellInputs;

const NUMBER_FIELDS: Array<{
  field: InputField;
  label: string;
  step: number;
  min: number;
  max?: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
}> = [
  {
    field: "ordersPerMonth",
    label: "Orders / month",
    step: 50,
    min: 0,
    suffix: "completed checkouts",
  },
  {
    field: "baseAov",
    label: "Base AOV",
    step: 5,
    min: 1,
    prefix: "$",
    suffix: "USD before upsell",
  },
  {
    field: "upsellAcceptanceRate",
    label: "Upsell acceptance rate",
    step: 0.01,
    min: 0,
    max: 1,
    suffix: "fraction (0.15 = 15%)",
  },
  {
    field: "upsellAov",
    label: "Upsell AOV",
    step: 5,
    min: 1,
    prefix: "$",
    suffix: "price of the offer",
  },
  {
    field: "upsellMargin",
    label: "Upsell gross margin",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction (0.70 = 70%)",
  },
  {
    field: "platformCostPerOrder",
    label: "Platform cost / order",
    step: 0.05,
    min: 0,
    prefix: "$",
    suffix: "ReConvert / AfterSell",
  },
];

function loadStored(): PostPurchaseUpsellInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as PostPurchaseUpsellInputs;
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: PostPurchaseUpsellInputs) {
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

export function PostPurchaseUpsellROICalculator() {
  const [inputs, setInputs] = useState<PostPurchaseUpsellInputs>(
    POST_PURCHASE_UPSELL_DEFAULTS,
  );
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const fc = useMemo(() => forecastPostPurchaseUpsell(inputs), [inputs]);
  const band = healthBandShort(fc.roiRatio);
  const intent = healthBandIntent(band);

  const setField = (field: InputField, raw: string) => {
    const cfg = NUMBER_FIELDS.find((f) => f.field === field);
    if (!cfg) return;
    const num = parseFloat(raw);
    setInputs((prev) => ({
      ...prev,
      [field]: clamp(Number.isNaN(num) ? cfg.min : num, cfg.min, cfg.max),
    }));
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset to default post-purchase upsell ROI inputs?");
      if (!ok) return;
    }
    setInputs(POST_PURCHASE_UPSELL_DEFAULTS);
  };

  const copyReport = async () => {
    const md = [
      `# Post-Purchase Upsell — Monthly Forecast`,
      ``,
      `Inputs:`,
      `  Orders / month              : ${formatInt(inputs.ordersPerMonth)}`,
      `  Base AOV                    : ${formatUsd(inputs.baseAov)}`,
      `  Upsell acceptance rate      : ${formatPercent(inputs.upsellAcceptanceRate)}`,
      `  Upsell AOV                  : ${formatUsd(inputs.upsellAov)}`,
      `  Upsell gross margin         : ${formatPercent(inputs.upsellMargin, 1)}`,
      `  Platform cost / order       : ${formatUsd(inputs.platformCostPerOrder)}`,
      ``,
      `Forecast (monthly):`,
      `  Upsells accepted / month    : ${formatInt(fc.upsellUnitsPerMonth)}`,
      `  Incremental revenue / mo    : ${formatUsd(fc.incrementalRevenuePerMonth)}`,
      `  Incremental margin / mo     : ${formatUsd(fc.incrementalMarginPerMonth)}`,
      `  Platform cost / mo          : ${formatUsd(fc.platformCostPerMonth)}`,
      `  Net lift / mo               : ${formatUsd(fc.netLiftPerMonth)}`,
      `  ROI ratio                   : ${formatRatio(fc.roiRatio)}  (net lift / platform cost)`,
      `  New blended AOV             : ${formatUsd(fc.newBlendedAov)}`,
      `  AOV lift                    : ${formatPercent(fc.aovLiftPct, 1)}`,
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

  const INTENT_RING: Record<string, string> = {
    great: "border-emerald-500/40 bg-emerald-500/5",
    good: "border-sky-500/40 bg-sky-500/5",
    marginal: "border-amber-500/40 bg-amber-500/5",
    weak: "border-rose-500/40 bg-rose-500/5",
    negative: "border-rose-500/40 bg-rose-500/5",
    "zero-cost": "border-border bg-muted/40",
  };

  return (
    <div
      id="post-purchase-upsell-roi"
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4",
        INTENT_RING[band],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #2
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Try the post-purchase upsell ROI on your real numbers
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/post_purchase_upsell_roi.py</code>.
            Inputs persist to your browser so you can come back later.
          </p>
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

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Incremental margin
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.incrementalMarginPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            from {formatInt(fc.upsellUnitsPerMonth)} upsells / mo
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Platform cost
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.platformCostPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(inputs.platformCostPerOrder)} × {formatInt(inputs.ordersPerMonth)} orders
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net lift
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.netLiftPerMonth > 0 ? "text-success" : "text-danger",
            )}
          >
            {formatUsd(fc.netLiftPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            margin − platform cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net lift / $1 platform
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              intent === "positive" && "text-success",
              intent === "accent" && "text-accent",
              intent === "warning" && "text-warning",
              intent === "danger" && "text-danger",
            )}
          >
            {formatRatio(fc.roiRatio)}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {fc.healthBand}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 border-t border-border/60 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Incremental revenue / mo
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.incrementalRevenuePerMonth)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            New blended AOV
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.newBlendedAov)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AOV lift
          </span>
          <span
            className={cn(
              "text-base font-semibold tabular-nums",
              fc.aovLiftPct >= 0 ? "text-success" : "text-danger",
            )}
          >
            {fc.aovLiftPct >= 0 ? "+" : ""}
            {formatPercent(fc.aovLiftPct, 1)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match a $1M-GMV DTC brand (1k orders/mo, $80 AOV, 15%
          acceptance, $35 upsell, 70% margin, $0.10/order ReConvert). Open
          playbook{" "}
          <code className="font-mono text-[11px]">02-post-purchase-upsell-reconvert</code>
          {" "}below for the paste-ready build sequence.
        </span>
        <CopyButton value="02-post-purchase-upsell-reconvert" label="Copy playbook ID" />
      </div>
    </div>
  );
}