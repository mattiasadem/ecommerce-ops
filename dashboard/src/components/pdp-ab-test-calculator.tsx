"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PDP_AB_TEST_DEFAULTS,
  AbTestInputs,
  formatAnnualizedRatio,
  forecastPdpAbTest,
} from "@/lib/pdp-ab-test";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

/**
 * Interactive PDP A/B Test Analyzer.
 *
 * Direct browser port of `scripts/pdp_ab_test.py`. The operator enters
 * control + variant session/conversion counts, AOV, margin, monthly PDP
 * traffic, A/B tool monthly cost, operator hours + hourly rate, and
 * `avgRelativeLift` + `testsPerMonth` for the steady-state program
 * forecast; the panel returns:
 *
 *   - Per-test analysis: control / variant rate, absolute lift, relative
 *     lift, z-score, two-sided p-value, confidence, decision band
 *     (winner / loser / inconclusive) — two-proportion z-test, no scipy
 *     dependency.
 *
 *   - Program ROI forecast: gross margin lift per month, total program
 *     cost per month (tool + operator), net revenue per month + per year,
 *     annualized ratio (net $ per $1 program cost) and a 4-tier health
 *     verdict (great >=20:1 / good 10-20:1 / fair 5-10:1 / weak <5:1).
 *
 * Inputs persist to localStorage (`ecom-ops:playbooks:pdp-ab:v1`) so the
 * operator's real numbers survive reloads. Copy-report emits a paste-ready
 * markdown handoff (decision + z + p + program ROI block). Reset-defaults
 * returns to the canonical 10k-control / 10k-variant / +20% lift winner
 * case (z=1.93, p=0.041, 95.9% confidence, decision = "winner",
 * annualized ratio = 86.5:1, great band).
 *
 * Mounted on `/playbooks` next to the four existing ROI calculators
 * (abandoned-cart + post-purchase-upsell + welcome-series + AI ad-creative).
 * Same math + defaults as the Python CLI — no drift.
 */

const STORAGE_KEY = "ecom-ops:playbooks:pdp-ab:v1";

type NumberField =
  | "controlSessions"
  | "controlConversions"
  | "variantSessions"
  | "variantConversions"
  | "aov"
  | "margin"
  | "monthlyPdpSessions"
  | "toolMonthlyCost"
  | "operatorHoursPerMonth"
  | "operatorHourlyRate"
  | "confidenceTarget"
  | "avgRelativeLift"
  | "testsPerMonth";

interface NumberFieldConfig {
  field: NumberField;
  label: string;
  step: number;
  min: number;
  max?: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
  group: "test" | "program";
}

const NUMBER_FIELDS: NumberFieldConfig[] = [
  {
    field: "controlSessions",
    label: "Control sessions",
    step: 100,
    min: 0,
    suffix: "PDP visitors / arm",
    group: "test",
  },
  {
    field: "controlConversions",
    label: "Control conversions",
    step: 5,
    min: 0,
    suffix: "orders / arm",
    group: "test",
  },
  {
    field: "variantSessions",
    label: "Variant sessions",
    step: 100,
    min: 0,
    suffix: "PDP visitors / arm",
    group: "test",
  },
  {
    field: "variantConversions",
    label: "Variant conversions",
    step: 5,
    min: 0,
    suffix: "orders / arm",
    group: "test",
  },
  {
    field: "aov",
    label: "AOV",
    step: 5,
    min: 1,
    prefix: "$",
    suffix: "USD",
    group: "program",
  },
  {
    field: "margin",
    label: "Gross margin",
    step: 0.05,
    min: 0,
    max: 1,
    suffix: "fraction (0.70 = 70%)",
    group: "program",
  },
  {
    field: "monthlyPdpSessions",
    label: "Monthly PDP sessions",
    step: 1000,
    min: 0,
    suffix: "PDP traffic / mo",
    group: "program",
  },
  {
    field: "toolMonthlyCost",
    label: "A/B tool / mo",
    step: 25,
    min: 0,
    prefix: "$",
    suffix: "Convert.com / VWO / Shoplift",
    group: "program",
  },
  {
    field: "operatorHoursPerMonth",
    label: "Operator hr / mo",
    step: 0.5,
    min: 0,
    suffix: "hypothesis + review cadence",
    group: "program",
  },
  {
    field: "operatorHourlyRate",
    label: "Operator $/hr",
    step: 5,
    min: 0,
    prefix: "$",
    suffix: "loaded rate",
    group: "program",
  },
  {
    field: "confidenceTarget",
    label: "Confidence target",
    step: 0.01,
    min: 0.5,
    max: 0.999,
    suffix: "0.95 = 95% confidence (winner cutoff)",
    group: "test",
  },
  {
    field: "avgRelativeLift",
    label: "Avg relative lift",
    step: 0.01,
    min: 0,
    max: 2,
    suffix: "per test (0.05 = +5% CVR)",
    group: "program",
  },
  {
    field: "testsPerMonth",
    label: "Tests / month",
    step: 1,
    min: 0,
    suffix: "rolling 28-day test counter",
    group: "program",
  },
];

function clamp(n: number, min: number, max?: number): number {
  if (!Number.isFinite(n)) return min;
  let x = n;
  if (x < min) x = min;
  if (typeof max === "number" && x > max) x = max;
  return x;
}

function loadStored(): AbTestInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AbTestInputs>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...PDP_AB_TEST_DEFAULTS, ...parsed };
  } catch {
    return null;
  }
}

function decisionIntentColor(d: "winner" | "loser" | "inconclusive"): string {
  if (d === "winner") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (d === "loser") return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function bandIntentColor(b: "great" | "good" | "fair" | "weak"): string {
  if (b === "great") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (b === "good") return "border-accent/40 bg-accent/10 text-accent";
  if (b === "fair") return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
}

export function PdpAbTestCalculator() {
  const [inputs, setInputs] = useState<AbTestInputs>(PDP_AB_TEST_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hydrate from localStorage on mount so server-render matches client
  // first paint (no hydration mismatch).
  useEffect(() => {
    setInputs(loadStored() ?? PDP_AB_TEST_DEFAULTS);
    setHydrated(true);
  }, []);

  // Persist after hydration (don't clobber on first paint).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      /* quota / private-mode */
    }
  }, [inputs, hydrated]);

  const fc = useMemo(() => forecastPdpAbTest(inputs), [inputs]);

  const setField = (field: NumberField, raw: string) => {
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
      const ok = window.confirm("Reset to default PDP A/B test inputs?");
      if (!ok) return;
    }
    setInputs(PDP_AB_TEST_DEFAULTS);
  };

  const copyReport = async () => {
    const md = [
      `# PDP A/B Test Analysis + Program Forecast`,
      ``,
      `## Test inputs`,
      `  Control sessions           : ${formatInt(inputs.controlSessions)}`,
      `  Control conversions        : ${formatInt(inputs.controlConversions)}`,
      `  Variant sessions           : ${formatInt(inputs.variantSessions)}`,
      `  Variant conversions        : ${formatInt(inputs.variantConversions)}`,
      `  Confidence target          : ${(inputs.confidenceTarget * 100).toFixed(1)}%`,
      ``,
      `## Analysis (two-proportion z-test)`,
      `  Control rate               : ${(fc.analysis.controlRate * 100).toFixed(2)}%`,
      `  Variant rate               : ${(fc.analysis.variantRate * 100).toFixed(2)}%`,
      `  Absolute lift              : ${(fc.analysis.absoluteLift * 100).toFixed(2)} pp`,
      `  Relative lift              : ${(fc.analysis.relativeLift * 100).toFixed(2)}%`,
      `  z-score                    : ${fc.analysis.zScore.toFixed(3)}`,
      `  p-value (two-sided)        : ${fc.analysis.pValue.toFixed(4)}`,
      `  Confidence                 : ${(fc.analysis.confidence * 100).toFixed(2)}%`,
      `  Significant?               : ${fc.analysis.isSignificant ? "yes" : "no"}`,
      `  Decision                   : ${fc.analysis.decisionLabel}`,
      ``,
      `## Program forecast`,
      `  AOV                        : ${formatUsd(inputs.aov)}`,
      `  Gross margin               : ${(inputs.margin * 100).toFixed(0)}%`,
      `  Monthly PDP sessions       : ${formatInt(inputs.monthlyPdpSessions)}`,
      `  Avg relative lift / test   : ${(inputs.avgRelativeLift * 100).toFixed(2)}%`,
      `  Tests / month              : ${formatInt(inputs.testsPerMonth)}`,
      `  Tool / month               : ${formatUsd(inputs.toolMonthlyCost)}`,
      `  Operator hr / month        : ${inputs.operatorHoursPerMonth.toFixed(1)}`,
      `  Operator $/hr              : ${formatUsd(inputs.operatorHourlyRate)}`,
      `  Gross margin lift / mo     : ${formatUsd(fc.program.grossMarginLiftPerMonth)}`,
      `  Total program cost / mo    : ${formatUsd(fc.program.totalProgramCostPerMonth)}`,
      `  Net revenue / month        : ${formatUsd(fc.program.netRevenuePerMonth)}`,
      `  Net revenue / year         : ${formatUsd(fc.program.netRevenuePerYear)}`,
      `  Annualized cost            : ${formatUsd(fc.program.annualizedCost)}`,
      `  Annualized ratio           : ${formatAnnualizedRatio(fc.program.annualizedRatio)}`,
      `  Health band                : ${fc.program.healthBand}`,
      ``,
      `_Same math as scripts/pdp_ab_test.py — Move #9.5 always-on PDP A/B testing._`,
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

  // Decision chip palette — kept in sync with intent helper.
  const decisionChipClass = decisionIntentColor(fc.analysis.decision);
  const programBandClass = bandIntentColor(fc.program.healthBandShort);

  return (
    <div
      id="pdp-ab-test"
      className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive calculator · Move #9.5
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Score a finished PDP A/B test + forecast the always-on program
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/pdp_ab_test.py</code>.
            Two-proportion z-test for the test you just ran, plus a steady-state
            program forecast for the rolling 4 tests/month cadence.
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

      {/* === INPUTS — two-group grid (test + program) ============== */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
        {NUMBER_FIELDS.filter((f) => f.group === "test").map((cfg) => (
          <NumberInput
            key={cfg.field}
            cfg={cfg}
            value={inputs[cfg.field]}
            onChange={(raw) => setField(cfg.field, raw)}
          />
        ))}
        {NUMBER_FIELDS.filter((f) => f.group === "program").map((cfg) => (
          <NumberInput
            key={cfg.field}
            cfg={cfg}
            value={inputs[cfg.field]}
            onChange={(raw) => setField(cfg.field, raw)}
          />
        ))}
      </div>

      {/* === PER-TEST ANALYSIS — 4-tile primary strip ============== */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Decision
          </span>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider",
              decisionChipClass,
            )}
          >
            {fc.analysis.decision}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-2">
            {fc.analysis.decisionLabel}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Relative lift
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.analysis.relativeLift > 0 ? "text-emerald-700 dark:text-emerald-300" : fc.analysis.relativeLift < 0 ? "text-rose-700 dark:text-rose-300" : "",
            )}
          >
            {fc.analysis.relativeLift > 0 ? "+" : ""}
            {(fc.analysis.relativeLift * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            {(fc.analysis.absoluteLift * 100).toFixed(2)} pp on{" "}
            {(fc.analysis.controlRate * 100).toFixed(2)}% →{" "}
            {(fc.analysis.variantRate * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Confidence
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.analysis.confidence >= inputs.confidenceTarget
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300",
            )}
          >
            {(fc.analysis.confidence * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            z = {fc.analysis.zScore.toFixed(3)} · p = {fc.analysis.pValue.toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Significant?
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.analysis.isSignificant ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground",
            )}
          >
            {fc.analysis.isSignificant ? "yes" : "no"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            target ≥ {(inputs.confidenceTarget * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* === PROGRAM ROI — 4-tile primary strip ==================== */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net revenue / mo
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.program.netRevenuePerMonth > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
            )}
          >
            {formatUsd(fc.program.netRevenuePerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.program.grossMarginLiftPerMonth)} gross −{" "}
            {formatUsd(fc.program.totalProgramCostPerMonth)} cost
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net revenue / yr
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.program.netRevenuePerYear > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
            )}
          >
            {formatUsd(fc.program.netRevenuePerYear)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            steady-state, not back-tested
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Annualized ratio
          </span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              fc.program.healthBandShort === "great" && "text-emerald-700 dark:text-emerald-300",
              fc.program.healthBandShort === "good" && "text-accent",
              fc.program.healthBandShort === "fair" && "text-amber-700 dark:text-amber-300",
              fc.program.healthBandShort === "weak" && "text-rose-700 dark:text-rose-300",
            )}
          >
            {formatAnnualizedRatio(fc.program.annualizedRatio)}
          </span>
          <span className="text-[10px] text-muted-foreground line-clamp-2">
            {fc.program.healthBand}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Health band
          </span>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider",
              programBandClass,
            )}
          >
            {fc.program.healthBandShort}
          </span>
          <span className="text-[10px] text-muted-foreground">
            annualized net per $1 program cost
          </span>
        </div>
      </div>

      {/* === SECONDARY STRIP — program cost / traffic / cadence ==== */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Tool cost / mo
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(inputs.toolMonthlyCost)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Convert.com / VWO / Shoplift
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Operator cost / mo
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(inputs.operatorHoursPerMonth * inputs.operatorHourlyRate)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {inputs.operatorHoursPerMonth.toFixed(1)} h × {formatUsd(inputs.operatorHourlyRate)}/h
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Gross margin lift / mo
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.program.grossMarginLiftPerMonth)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            aov × lift × sessions × margin
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Annualized cost
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatUsd(fc.program.annualizedCost)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatUsd(fc.program.totalProgramCostPerMonth)} / mo × 12
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match the canonical <strong className="font-semibold text-foreground">10k-control / 10k-variant / +20% lift winner case</strong>: z = 1.93, p = 0.041, 95.9% confidence, decision = <strong className="font-semibold text-emerald-700 dark:text-emerald-300">winner</strong>, net <strong className="font-semibold text-foreground">$25,950 / mo</strong> at +5% avg lift × 4 tests × $200/mo Convert.com + 2 hr/wk × $50/hr, annualized ratio <strong className="font-semibold text-emerald-700 dark:text-emerald-300">86.5×</strong> (great band). Open playbook{" "}
          <code className="font-mono text-[11px]">09.5-pdp-ab-testing-program</code>{" "}
          for the paste-ready build sequence (Convert.com Growth vs VWO vs Shoplift selection matrix, hypothesis backlog, multi-armed bandit vs A/B/n decision tree).
        </span>
        <CopyButton value="09.5-pdp-ab-testing-program" label="Copy playbook ID" />
      </div>
    </div>
  );
}

interface NumberInputProps {
  cfg: NumberFieldConfig;
  value: number;
  onChange: (raw: string) => void;
}

function NumberInput({ cfg, value, onChange }: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1">
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {cfg.suffix && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {cfg.suffix}
          </span>
        )}
      </div>
    </label>
  );
}