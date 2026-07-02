"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ABANDONED_CART_DEFAULTS,
  AbandonedCartInputs,
  forecastAbandonedCart,
  formatInt,
  formatRatio,
  formatUsd,
  healthBandIntent,
  healthBandShort,
} from "@/lib/abandoned-cart-roi";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Abandoned-Cart ROI Calculator.
 *
 * Direct browser port of `scripts/abandoned_cart_roi.py`. Operator enters
 * their real monthly checkout-starts, AOV, recovery-rate, and email/SMS
 * unit costs; the panel forecasts monthly recovered revenue, total send
 * cost, net revenue, and ROI ratio with a health-band label. Inputs
 * persist to localStorage so the operator can return to the same numbers
 * between sessions.
 *
 * Used on the /playbooks page above the abandoned-cart playbook card.
 * Same math + defaults as the Python CLI — no drift.
 */

const STORAGE_KEY = "ecom-ops:playbooks:ac-roi:v1";

type InputField = keyof AbandonedCartInputs;

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
  { field: "checkoutsPerMonth", label: "Checkout-starts / month", step: 50, min: 0, suffix: "events" },
  { field: "aov", label: "Average order value (AOV)", step: 5, min: 1, prefix: "$", suffix: "USD" },
  {
    field: "recoveryRate",
    label: "Recovery rate",
    step: 0.01,
    min: 0,
    max: 1,
    suffix: "fraction (e.g. 0.10 = 10%)",
  },
  { field: "emailCount", label: "Emails per cart", step: 1, min: 0, suffix: "Klaviyo flow emails" },
  {
    field: "emailDeliveryRate",
    label: "Email delivery rate",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction delivered to inbox",
  },
  { field: "emailRate", label: "Cost / delivered email", step: 0.0001, min: 0, prefix: "$", suffix: "USD" },
  { field: "smsCount", label: "SMS per opted-in cart", step: 1, min: 0, suffix: "Postscript SMS" },
  { field: "smsOptinRate", label: "SMS opt-in rate", step: 0.05, min: 0, max: 1, suffix: "fraction opted-in" },
  { field: "smsRate", label: "Cost / SMS sent", step: 0.001, min: 0, prefix: "$", suffix: "USD + carrier" },
];

function loadStored(): AbandonedCartInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as AbandonedCartInputs;
  } catch {
    /* ignore */
  }
  return null;
}

function storeInputs(inputs: AbandonedCartInputs) {
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

export function AbandonedCartROICalculator() {
  const [inputs, setInputs] = useState<AbandonedCartInputs>(ABANDONED_CART_DEFAULTS);
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

  const fc = useMemo(() => forecastAbandonedCart(inputs), [inputs]);
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
      const ok = window.confirm("Reset to default abandoned-cart ROI inputs?");
      if (!ok) return;
    }
    setInputs(ABANDONED_CART_DEFAULTS);
  };

  const copyReport = async () => {
    const md = [
      `# Abandoned-Cart Flow — ROI Forecast`,
      ``,
      `Inputs:`,
      `  Checkout-starts / month      : ${formatInt(inputs.checkoutsPerMonth)}`,
      `  AOV                          : ${formatUsd(inputs.aov)}`,
      `  Recovery rate                : ${(inputs.recoveryRate * 100).toFixed(1)}%`,
      `  Emails / cart                : ${inputs.emailCount}`,
      `  Email cost / delivered       : ${formatUsd(inputs.emailRate)}`,
      `  Email delivery rate          : ${(inputs.emailDeliveryRate * 100).toFixed(1)}%`,
      `  SMS / opted-in cart          : ${inputs.smsCount}`,
      `  SMS cost / message           : ${formatUsd(inputs.smsRate)}`,
      `  SMS opt-in rate              : ${(inputs.smsOptinRate * 100).toFixed(1)}%`,
      ``,
      `Forecast (monthly):`,
      `  Recovered orders             : ${fc.recoveredOrdersPerMonth.toFixed(1)}`,
      `  Recovered revenue            : ${formatUsd(fc.recoveredRevenuePerMonth)}`,
      `  Email send cost              : ${formatUsd(fc.emailSendCostPerMonth)}`,
      `  SMS send cost                : ${formatUsd(fc.smsSendCostPerMonth)}`,
      `  Total send cost              : ${formatUsd(fc.totalSendCostPerMonth)}`,
      `  Net revenue                  : ${formatUsd(fc.netRevenuePerMonth)}`,
      `  Revenue / $1 sent            : ${formatRatio(fc.roiRatio)}`,
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
    <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", INTENT_RING[band])}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #1
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Try the abandoned-cart ROI on your real numbers
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as <code className="font-mono text-[11px]">scripts/abandoned_cart_roi.py</code>.
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
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
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
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{cfg.suffix}</span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Recovered revenue
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatUsd(fc.recoveredRevenuePerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {fc.recoveredOrdersPerMonth.toFixed(1)} recovered orders / mo
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
              fc.netRevenuePerMonth > 0 ? "text-success" : "text-danger"
            )}
          >
            {formatUsd(fc.netRevenuePerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            recovered − send cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Revenue / $1 sent
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              intent === "positive" && "text-success",
              intent === "accent" && "text-accent",
              intent === "warning" && "text-warning",
              intent === "danger" && "text-danger"
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
          Defaults match a $1M-GMV DTC brand (1.2k checkouts/mo, $75 AOV, 10%
          recovery, Klaviyo + Postscript). Open the playbook below for the
          paste-ready build sequence.
        </span>
        <CopyButton value="01-abandoned-cart-flow-klaviyo" label="Copy playbook ID" />
      </div>
    </div>
  );
}