"use client";

import { useEffect, useMemo, useState } from "react";
import {
  WELCOME_SERIES_DEFAULTS,
  WelcomeSeriesInputs,
  forecastWelcomeSeries,
  healthBandIntent,
  healthBandShort,
} from "@/lib/welcome-series-roi";
import { formatInt, formatPercent, formatRatio, formatUsd } from "@/lib/format";
import { loadYourStore, mergeFromYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

/**
 * Interactive Welcome-Series ROI Calculator.
 *
 * Direct browser port of `scripts/welcome_series_roi.py`. Operator enters
 * opt-ins/month, first-purchase CVR, AOV, gross margin, welcome discount,
 * email/SMS costs and delivery rates; the panel forecasts first orders,
 * gross margin, net margin after the welcome discount, total send cost
 * (email + SMS), and the ROI ratio (net margin per $1 of send cost).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:ws-roi:v1`) so the
 * operator's real numbers survive reloads. Copy-report emits a paste-ready
 * markdown forecast to the clipboard. Reset-defaults returns to the canonical
 * 1k-optin baseline.
 *
 * Mounted on `/playbooks` next to the abandoned-cart calculator. Same math
 * + defaults as the Python CLI — no drift.
 */

const STORAGE_KEY = "ecom-ops:playbooks:ws-roi:v1";

type InputField = keyof WelcomeSeriesInputs;

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
  { field: "optinsPerMonth", label: "Opt-ins / month", step: 50, min: 0, suffix: "newsletter / quiz / popup" },
  {
    field: "firstPurchaseCvr",
    label: "First-purchase CVR (14d)",
    step: 0.005,
    min: 0,
    max: 1,
    suffix: "fraction (e.g. 0.03 = 3%)",
  },
  { field: "aov", label: "Average order value (AOV)", step: 5, min: 1, prefix: "$", suffix: "USD" },
  {
    field: "grossMargin",
    label: "Gross margin",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction (0.70 = 70%)",
  },
  {
    field: "welcomeDiscount",
    label: "Welcome discount",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "first-order % off",
  },
  { field: "emailCount", label: "Emails / series", step: 1, min: 0, suffix: "Klaviyo flow emails" },
  {
    field: "emailDeliveryRate",
    label: "Email delivery rate",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction delivered to inbox",
  },
  { field: "emailCostPerDelivered", label: "Cost / delivered email", step: 0.0001, min: 0, prefix: "$", suffix: "USD" },
  { field: "smsCount", label: "SMS / opted-in subscriber", step: 1, min: 0, suffix: "Postscript SMS" },
  {
    field: "smsOptinRate",
    label: "SMS opt-in rate",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction opted-in",
  },
  { field: "smsCostPerMessage", label: "Cost / SMS sent", step: 0.001, min: 0, prefix: "$", suffix: "USD + carrier" },
  { field: "horizonDays", label: "Forecast horizon", step: 30, min: 7, suffix: "days (90 = one welcome cycle)" },
];

function loadStored(): WelcomeSeriesInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as WelcomeSeriesInputs;
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: WelcomeSeriesInputs) {
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

export function WelcomeSeriesROICalculator() {
  const [inputs, setInputs] = useState<WelcomeSeriesInputs>(WELCOME_SERIES_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fromYourStore, setFromYourStore] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setFromYourStore(false);
    } else {
      // Fall back to operator's cross-page Your-store inputs (if any).
      // For welcome-series we map orders -> optins as a flow-volume proxy.
      const yourStore = loadYourStore();
      if (yourStore) {
        setInputs(mergeFromYourStore(WELCOME_SERIES_DEFAULTS, yourStore));
        setFromYourStore(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const fc = useMemo(() => forecastWelcomeSeries(inputs), [inputs]);
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
      const ok = window.confirm("Reset to default welcome-series ROI inputs?");
      if (!ok) return;
    }
    setInputs(WELCOME_SERIES_DEFAULTS);
    setFromYourStore(false);
  };

  const copyReport = async () => {
    const md = [
      `# Welcome Series — ROI Forecast`,
      ``,
      `Inputs:`,
      `  Opt-ins / month              : ${formatInt(inputs.optinsPerMonth)}`,
      `  First-purchase CVR           : ${formatPercent(inputs.firstPurchaseCvr)}`,
      `  AOV                          : ${formatUsd(inputs.aov)}`,
      `  Gross margin                 : ${formatPercent(inputs.grossMargin, 1)}`,
      `  Welcome discount             : ${formatPercent(inputs.welcomeDiscount, 1)}`,
      `  Emails / series              : ${inputs.emailCount}`,
      `  Email cost / delivered       : ${formatUsd(inputs.emailCostPerDelivered)}`,
      `  Email delivery rate          : ${formatPercent(inputs.emailDeliveryRate, 1)}`,
      `  SMS / opted-in subscriber    : ${inputs.smsCount}`,
      `  SMS cost / message           : ${formatUsd(inputs.smsCostPerMessage)}`,
      `  SMS opt-in rate              : ${formatPercent(inputs.smsOptinRate, 1)}`,
      `  Forecast horizon (days)      : ${inputs.horizonDays}`,
      ``,
      `Forecast (monthly, over ${inputs.horizonDays}-day window):`,
      `  First orders                 : ${fc.firstOrdersPerMonth.toFixed(1)}`,
      `  Gross revenue                : ${formatUsd(fc.revenuePerMonth)}`,
      `  Gross margin                 : ${formatUsd(fc.marginPerMonth)}`,
      `  Discount cost                : ${formatUsd(fc.discountCostPerMonth)}`,
      `  Net margin (after discount)  : ${formatUsd(fc.netMarginPerMonth)}`,
      `  Email send cost              : ${formatUsd(fc.emailSendCostPerMonth)}`,
      `  SMS send cost                : ${formatUsd(fc.smsSendCostPerMonth)}`,
      `  Total send cost              : ${formatUsd(fc.totalSendCostPerMonth)}`,
      `  Net revenue (margin - cost)  : ${formatUsd(fc.netRevenuePerMonth)}`,
      `  Net margin / $1 sent         : ${formatRatio(fc.roiRatio)}`,
      `  Revenue / opt-in             : ${formatUsd(fc.revenuePerOptin)}`,
      `  Margin / opt-in              : ${formatUsd(fc.marginPerOptin)}`,
      `  Breakeven CVR                : ${Number.isFinite(fc.breakevenCvr) ? formatPercent(fc.breakevenCvr, 3) : "never (discount >= margin)"}`,
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
      id="welcome-series-roi"
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4",
        INTENT_RING[band],
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #4
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Try the welcome-series ROI on your real numbers
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/welcome_series_roi.py</code>.
            Inputs persist to your browser so you can come back later.
          </p>
          {fromYourStore && hydrated && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Prefilled from Your store on Overview
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
            Net margin
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.netMarginPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            after {formatPercent(inputs.welcomeDiscount, 0)} welcome discount
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total send cost
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.totalSendCostPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.emailSendCostPerMonth)} email · {formatUsd(fc.smsSendCostPerMonth)} SMS
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net revenue
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.netRevenuePerMonth > 0 ? "text-success" : "text-danger",
            )}
          >
            {formatUsd(fc.netRevenuePerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            margin − send cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net margin / $1 sent
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match a $1M-GMV DTC brand (1k opt-ins/mo, 3% CVR, $75 AOV, 70%
          margin, 5 Klaviyo emails + 1 Postscript SMS). Open playbook{" "}
          <code className="font-mono text-[11px]">04-welcome-series-klaviyo</code>
          {" "}below for the paste-ready build sequence.
        </span>
        <CopyButton value="04-welcome-series-klaviyo" label="Copy playbook ID" />
      </div>
    </div>
  );
}
