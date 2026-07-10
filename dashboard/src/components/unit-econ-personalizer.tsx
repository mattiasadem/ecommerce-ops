"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/metric-card";
import {
  UNIT_ECON_DEFAULTS,
  explainHealthBand,
  projectUnitEcon,
  HEALTH_BANDS,
  type UnitEconInputs,
} from "@/lib/unit-economics-personalizer";
import {
  YOUR_STORE_STORAGE_KEY,
  loadYourStore,
  YourStoreInputs as YS,
} from "@/lib/your-store";
import { formatInt, formatRatio, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * `Unit Economics — your numbers` interactive panel.
 *
 * On mount: pulls AOV / monthly orders / gross margin from
 * `ecom-ops:your-store:v1` (the same key the Your-store card on Overview
 * writes). Falls back to canonical $75 AOV · 1,000 orders · 70% margin.
 *
 * Two operator-tunable inputs (12-month repeat rate + payback window in
 * months) start at canonical 30% / 9-month defaults and persist to the
 * panel's own localStorage key so reload keeps the dial where the operator
 * left it. Your-store AOV/orders/margin stay in their own key — that's
 * the shared inputs; this panel just reads them.
 *
 * Live computation — every keystroke recomputes the seven projections and
 * the health band dial. No network, no submit button.
 */

const STORAGE_KEY = "ecom-ops:unit-econ:personalizer:v1";

interface StoredOverrides {
  repeatRate12mo: number;
  paybackMonths: number;
}

const STORAGE_DEFAULTS: StoredOverrides = {
  repeatRate12mo: UNIT_ECON_DEFAULTS.repeatRate12mo,
  paybackMonths: UNIT_ECON_DEFAULTS.paybackMonths,
};

const PAYBACK_OPTIONS: Array<6 | 9 | 12 | 18> = [6, 9, 12, 18];

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadOverrides(): StoredOverrides {
  if (typeof window === "undefined") return STORAGE_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return STORAGE_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<StoredOverrides>;
    return {
      repeatRate12mo: clamp(Number(parsed.repeatRate12mo ?? STORAGE_DEFAULTS.repeatRate12mo), 0, 1),
      paybackMonths: clamp(
        Number(parsed.paybackMonths ?? STORAGE_DEFAULTS.paybackMonths),
        6,
        18,
      ) as 6 | 9 | 12 | 18,
    };
  } catch {
    return STORAGE_DEFAULTS;
  }
}

function saveOverrides(o: StoredOverrides): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

export function UnitEconPersonalizer() {
  const [yourStore, setYourStore] = useState<YS | null>(null);
  const [overrides, setOverrides] = useState<StoredOverrides>(STORAGE_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setYourStore(loadYourStore());
    setOverrides(loadOverrides());
    setHydrated(true);
  }, []);

  const inputs: UnitEconInputs = useMemo(() => {
    const ys = yourStore ?? {
      aov: UNIT_ECON_DEFAULTS.aov,
      monthlyOrders: UNIT_ECON_DEFAULTS.monthlyOrders,
      grossMargin: UNIT_ECON_DEFAULTS.grossMargin,
    };
    return {
      ...ys,
      repeatRate12mo: overrides.repeatRate12mo,
      paybackMonths: overrides.paybackMonths,
    };
  }, [yourStore, overrides]);

  const proj = useMemo(() => projectUnitEcon(inputs), [inputs]);
  const health = explainHealthBand(proj.healthBand);
  const bandColor = HEALTH_BANDS[proj.healthBand].color;

  const usingDefaults = yourStore === null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Your unit economics — personalized</CardTitle>
          <Badge variant="outline" className={cn("border", bandColor)}>
            {health.label}
          </Badge>
          {usingDefaults && hydrated && (
            <Badge variant="secondary" className="text-[10px]">
              Defaults · edit on Overview to personalize
            </Badge>
          )}
        </div>
        <CardDescription>
          Live projection against the canonical benchmarks. Operator-controlled dials:
          12-month repeat-rate and payback window (months). AOV / monthly orders /
          gross margin come from Your-store on the Overview page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* === Inputs row === */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="AOV (from Your-store)"
            value={inputs.aov}
            disabled
            unit="$"
            sub={usingDefaults ? "default $75 · edit on Overview" : "read-only — edit on Overview"}
          />
          <Field
            label="Monthly orders"
            value={inputs.monthlyOrders}
            disabled
            unit=""
            sub={usingDefaults ? "default 1,000 · edit on Overview" : "read-only — edit on Overview"}
            format="int"
          />
          <Field
            label="Gross margin"
            value={Math.round(inputs.grossMargin * 100)}
            disabled
            unit="%"
            sub={usingDefaults ? "default 70% · edit on Overview" : "read-only — edit on Overview"}
          />
        </div>

        <Separator />

        {/* === Tunable dials === */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RangeField
            label="12-month repeat purchase rate"
            value={Math.round(overrides.repeatRate12mo * 100)}
            unit="%"
            min={0}
            max={100}
            step={5}
            sub="Healthy DTC: ≥ 30% (Move #14 lifecycle-stack floor)"
            onChange={(n) => {
              const next = clamp(n / 100, 0, 1);
              const updated = { ...overrides, repeatRate12mo: next };
              setOverrides(updated);
              saveOverrides(updated);
            }}
          />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Payback window
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYBACK_OPTIONS.map((m) => {
                const active = overrides.paybackMonths === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const updated = { ...overrides, paybackMonths: m };
                      setOverrides(updated);
                      saveOverrides(updated);
                    }}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors",
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card hover:bg-muted",
                    )}
                    aria-pressed={active}
                  >
                    {m} mo
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              9 mo is the 2026 DTC median (3–6 mo → 6–9 mo since 2021).
            </p>
          </div>
        </div>

        <Separator />

        {/* === Projections strip === */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Monthly revenue"
            value={formatUsd(proj.monthlyRevenue)}
            sub={`${formatInt(inputs.monthlyOrders)} orders × ${formatUsd(inputs.aov)}`}
          />
          <MetricCard
            label="Annual gross profit"
            value={formatUsd(proj.annualGrossProfit)}
            sub={`${Math.round(inputs.grossMargin * 100)}% margin applied`}
            intent="positive"
          />
          <MetricCard
            label="Break-even CAC ceiling"
            value={formatUsd(proj.breakEvenCac)}
            sub="First-order gross profit (CAC must stay ≤ this)"
          />
          <MetricCard
            label={`Target CAC for ≥3:1 (${inputs.paybackMonths}mo)`}
            value={formatUsd(proj.targetCacFor3to1)}
            sub="Repeat-purchase subsidy factored in"
            intent="accent"
          />
        </div>

        {/* === Payback-window ladder === */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Max paid CAC by payback window
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {([6, 9, 12, 18] as const).map((m) => (
              <div
                key={m}
                className={cn(
                  "rounded-lg border bg-card px-3 py-2 flex flex-col gap-0.5",
                  m === inputs.paybackMonths
                    ? "border-accent ring-1 ring-accent"
                    : "border-border",
                )}
              >
                <span className="text-[10px] uppercase text-muted-foreground tabular-nums">
                  {m}-month payback
                </span>
                <span className="text-base font-semibold tabular-nums">
                  {formatUsd(proj.maxPaidCacByWindow[m])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* === Budget dial === */}
        <div className="rounded-lg border border-border bg-card/50 px-4 py-3 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs font-medium">Monthly new-customer growth budget</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatRatio(proj.breakevenLtvCac)} LTV:CAC baseline · ≥3:1 target
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="text-2xl font-semibold tabular-nums text-accent">
              {formatUsd(proj.monthlyGrowthBudget)}
            </span>
            <span className="text-xs text-muted-foreground">
              = {formatInt(proj.maxMonthlyNewCustomers)} new customers/mo at the {inputs.paybackMonths}-mo CAC ceiling
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The amount you can safely spend on acquisition per month while staying
            at ≥3:1 LTV:CAC. Drops dramatically as repeat rate falls or as you
            tighten the payback window.
          </p>
        </div>

        {/* === Health explanation === */}
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className={cn("text-xs font-medium", bandColor)}>
            Health band: {health.label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
            {health.detail}
          </p>
          {!YOUR_STORE_STORAGE_KEY.includes("your-store") && (
            /* Defensive guard — keep the build quiet when the storage key
               rename ever lands. */
            <span className="hidden" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  label: string;
  value: number;
  unit: string;
  sub: string;
  disabled?: boolean;
  format?: "int" | "usd";
}

function Field({ label, value, unit, sub, disabled, format = "usd" }: FieldProps) {
  const display =
    format === "int" ? formatInt(value) : format === "usd" ? formatUsd(value) : `${value}`;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <div
        className={cn(
          "flex items-baseline gap-1 rounded-md border border-border bg-muted/40 px-3 py-2",
          disabled && "opacity-80",
        )}
      >
        <span className="text-lg font-semibold tabular-nums">{display}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  sub: string;
  onChange: (n: number) => void;
}

function RangeField({ label, value, unit, min, max, step, sub, onChange }: RangeFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </label>
      <div className="flex items-baseline gap-2">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-accent"
          aria-label={label}
        />
        <span className="text-base font-semibold tabular-nums w-14 text-right">
          {value}
          {unit}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}
