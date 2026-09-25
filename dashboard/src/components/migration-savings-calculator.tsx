"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MIGRATION_DEFAULTS,
  MigrationInputs,
  MigrationPath,
  SOURCE_ESP_OPTIONS,
  SourceEsp,
  forecastMigrationSavings,
  renderMigrationMarkdown,
  validateMigrationInputs,
} from "@/lib/migration-savings";
import { CopyButton } from "@/components/copy-button";
import { loadYourStore } from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * Interactive Migration Savings calculator — Playbook 05 (Move #5).
 *
 * Direct browser port of `playbooks/05-migrate-to-klaviyo-postscript.md`
 * §"Which migration path applies to you" + `research/01-tools-stack-comparison.md`
 * §Pricing. The operator enters:
 *
 *   - Source ESP (Mailchimp / Klaviyo+Attentive / Klaviyo+alt SMS / Klaviyo-only
 *     / Sendlane / Brevo / HubSpot / Iterable / Customer.io / ActiveCampaign).
 *   - Volume: email contacts + SMS subscribers + monthly SMS sends.
 *   - Revenue: monthly email-attributed + monthly SMS-attributed.
 *   - Operator blended rate ($/hr) for one-time cutover cost.
 *
 * The panel auto-picks the canonical migration path (A/B/C/D) per the playbook
 * table, then projects:
 *   - One-time cutover cost (hours × blended rate).
 *   - Current monthly cost (source ESP + source SMS).
 *   - Target monthly cost (Klaviyo + Postscript Growth).
 *   - Monthly savings (cost only) + monthly revenue lift (email/SMS attribution gain).
 *   - Total monthly benefit + breakeven months + Year-1 net benefit.
 *   - 3 risk warnings per path (TCPA, deliverability, custom-field mapping).
 *
 * State persists to localStorage (`ecom-ops:playbooks:migration-savings:v1`)
 * so the operator's real numbers survive reloads. Copy-report emits a
 * paste-ready markdown handoff (current cost → target cost → benefit →
 * risks → summary) byte-faithful with the playbook's "Which migration
 * path applies to you" table.
 *
 * Mounted on `/playbooks/05-migrate-to-klaviyo-postscript` via the
 * `CALCULATORS` registry in `app/playbooks/[slug]/page.tsx`.
 */

const STORAGE_KEY = "ecom-ops:playbooks:migration-savings:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): MigrationInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      contacts: clamp(Number(parsed.contacts) || 0, 0, 10_000_000),
      smsSubscribers: clamp(Math.round(Number(parsed.smsSubscribers) || 0), 0, 10_000_000),
      smsSendsPerMonth: clamp(Math.round(Number(parsed.smsSendsPerMonth) || 0), 0, 100_000_000),
      monthlyEmailRevenue: clamp(Number(parsed.monthlyEmailRevenue) || 0, 0, 100_000_000),
      monthlySmsRevenue: clamp(Number(parsed.monthlySmsRevenue) || 0, 0, 100_000_000),
      sourceEsp: (parsed.sourceEsp as SourceEsp) ?? MIGRATION_DEFAULTS.sourceEsp,
      operatorBlendedRate: clamp(Number(parsed.operatorBlendedRate) || 50, 0, 500),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: MigrationInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function fmtUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtUsdFull(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function fmtMonths(n: number): string {
  if (!Number.isFinite(n)) return "n/a";
  if (n <= 0) return "0 mo";
  return `${n.toFixed(1)} mo`;
}

function pathBadgeClasses(path: MigrationPath): string {
  const map: Record<MigrationPath, string> = {
    A: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
    B: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40",
    C: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40",
    D: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/40",
  };
  return map[path];
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  hint,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onChange(Number.isNaN(num) ? 0 : num);
          }}
          className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {suffix && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>
      )}
    </label>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (next: T) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.hint ? `${opt.label} (${opt.hint})` : opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>
      )}
    </label>
  );
}

export function MigrationSavingsCalculator() {
  const [inputs, setInputs] = useState<MigrationInputs>(MIGRATION_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [yourStoreApplied, setYourStoreApplied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
      setYourStoreApplied(false);
    } else {
      const ys = loadYourStore();
      if (ys) {
        // Project Your-store monthly orders × 12 / 0.20 (5% opt-in rate → 1 SMS subscriber per 20 orders)
        // and apply monthly revenue = aov × monthlyOrders.
        const projectedSmsSubs = Math.round(ys.monthlyOrders * 12 * 0.20);
        setInputs((prev) => ({
          ...prev,
          monthlyEmailRevenue: Math.round(ys.aov * ys.monthlyOrders),
          contacts: Math.max(prev.contacts, Math.round(ys.monthlyOrders * 12 * 0.6)),
          smsSubscribers: projectedSmsSubs,
        }));
        setYourStoreApplied(true);
      } else {
        setYourStoreApplied(false);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(() => {
    const errs = validateMigrationInputs(inputs);
    return errs.length > 0 ? errs[0] : null;
  }, [inputs]);

  const forecast = useMemo(() => {
    if (validationError) return forecastMigrationSavings(MIGRATION_DEFAULTS);
    return forecastMigrationSavings(inputs);
  }, [inputs, validationError]);

  function patch<K extends keyof MigrationInputs>(key: K, value: MigrationInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(MIGRATION_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderMigrationMarkdown(inputs, forecast);
  }, [inputs, forecast, validationError]);

  const health = useMemo(() => {
    if (forecast.isMoneyLosing) {
      return {
        label: "Money-losing Year-1",
        classes:
          "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40",
      };
    }
    const mid = (forecast.year1NetBenefitLow + forecast.year1NetBenefitHigh) / 2;
    if (mid >= 50_000)
      return {
        label: "Strong (≥$50k Year-1 mid)",
        classes:
          "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
      };
    if (mid >= 10_000)
      return {
        label: "Good ($10k-$50k Year-1 mid)",
        classes:
          "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40",
      };
    if (mid >= 0)
      return {
        label: "Marginal (positive but small)",
        classes:
          "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40",
      };
    return {
      label: "Money-losing Year-1",
      classes:
        "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40",
    };
  }, [forecast]);

  return (
    <div
      id="migration-savings-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Migration savings calculator
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #5
          </span>
          {yourStoreApplied ? (
            <span
              data-testid="your-store-applied-badge"
              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
              title="Contact count + email revenue auto-projected from Your-store AOV × monthly orders on Overview. Edit Your-store there to propagate."
            >
              Prefilled from Your-store
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pick your current email + SMS stack. The panel auto-recommends the
          canonical migration path (A / B / C / D from{" "}
          <code className="rounded bg-muted px-1">
            playbooks/05-migrate-to-klaviyo-postscript.md
          </code>
          ) and projects the cutover cost, current monthly cost vs target
          monthly cost, monthly revenue lift from segmentation + automation
          gains, breakeven window, and Year-1 net benefit. Three risk warnings
          per path (TCPA, deliverability warm-up, custom-field mapping) come
          from the playbook&rsquo;s §Prerequisites. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS — source picker ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SelectInput
          label="Current email + SMS stack"
          value={inputs.sourceEsp}
          onChange={(v) => patch("sourceEsp", v)}
          options={SOURCE_ESP_OPTIONS}
          hint="Path A/B/C/D auto-picked from this choice"
        />
        <NumberInput
          label="Operator blended rate"
          value={inputs.operatorBlendedRate}
          onChange={(v) => patch("operatorBlendedRate", clamp(v, 0, 500))}
          step={5}
          suffix="$/hr"
          hint="Cutover labor cost only"
        />
      </div>

      {/* ===== INPUTS — volume ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <NumberInput
          label="Email contacts / active profiles"
          value={inputs.contacts}
          onChange={(v) => patch("contacts", clamp(v, 0, 10_000_000))}
          step={500}
          hint="Drives Klaviyo + source ESP cost"
        />
        <NumberInput
          label="SMS subscribers"
          value={inputs.smsSubscribers}
          onChange={(v) =>
            patch("smsSubscribers", clamp(Math.round(v), 0, 10_000_000))
          }
          step={100}
          hint="0 if no prior SMS"
        />
        <NumberInput
          label="Monthly SMS sends"
          value={inputs.smsSendsPerMonth}
          onChange={(v) =>
            patch("smsSendsPerMonth", clamp(Math.round(v), 0, 100_000_000))
          }
          step={500}
          hint="$0.014/SMS Postscript, $0.025-$0.05 Attentive"
        />
        <NumberInput
          label="Monthly email revenue"
          value={inputs.monthlyEmailRevenue}
          onChange={(v) => patch("monthlyEmailRevenue", clamp(v, 0, 100_000_000))}
          step={500}
          suffix="$"
          hint="Baseline for revenue-lift %"
        />
        <NumberInput
          label="Monthly SMS revenue"
          value={inputs.monthlySmsRevenue}
          onChange={(v) => patch("monthlySmsRevenue", clamp(v, 0, 100_000_000))}
          step={500}
          suffix="$"
          hint="0 if no prior SMS"
        />
      </div>

      {validationError && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          ⚠ {validationError}
        </div>
      )}

      {/* ===== OUTPUTS ===== */}
      <div className="space-y-3">
        {/* Path recommendation strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recommendation
            </span>
            <span className={pathBadgeClasses(forecast.path)}>
              Path {forecast.path}
            </span>
            <span className="text-xs font-medium">{forecast.pathLabel}</span>
            <span className={health.classes}>{health.label}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">From:</span>{" "}
            {forecast.sourceLabel}{" "}
            <span className="font-mono uppercase tracking-wider">→ To:</span>{" "}
            {forecast.targetLabel}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Cutover window:
            </span>{" "}
            {forecast.cutoverDaysLow}–{forecast.cutoverDaysHigh} days ·{" "}
            <span className="font-mono uppercase tracking-wider">Risk:</span>{" "}
            {forecast.riskLevel}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {forecast.summary}
          </p>
        </div>

        {/* 4-tile cost strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Current monthly total
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.currentMonthlyTotal)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              ESP {fmtUsdShort(forecast.currentMonthlyEspCost)} + SMS{" "}
              {fmtUsdShort(forecast.currentMonthlySmsCost)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Target monthly total
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.newMonthlyTotal)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Klaviyo {fmtUsdShort(forecast.newMonthlyKlaviyoCost)} +
              Postscript {fmtUsdShort(forecast.newMonthlyPostscriptCost)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Monthly savings (cost only)
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.monthlySavingsLow)}–
              {fmtUsdShort(forecast.monthlySavingsHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              from ESP + SMS tier consolidation
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Monthly revenue lift
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.monthlyRevenueLiftLow)}–
              {fmtUsdShort(forecast.monthlyRevenueLiftHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              from segmentation + automation
            </div>
          </div>
        </div>

        {/* 4-tile breakeven strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total monthly benefit
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.totalMonthlyBenefitLow)}–
              {fmtUsdShort(forecast.totalMonthlyBenefitHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              savings + revenue lift
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Cutover cost (one-time)
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.cutoverCostLow)}–
              {fmtUsdShort(forecast.cutoverCostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              labor @ ${inputs.operatorBlendedRate}/hr
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Breakeven
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtMonths(forecast.breakevenMonthsLow)}–
              {fmtMonths(forecast.breakevenMonthsHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              cutover cost ÷ monthly benefit
            </div>
          </div>
          <div
            className={cn(
              "rounded-md border p-2",
              forecast.isMoneyLosing
                ? "border-rose-500/40 bg-rose-500/5"
                : "border-emerald-500/40 bg-emerald-500/5",
            )}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 net benefit
            </div>
            <div
              className={cn(
                "text-base font-semibold tabular-nums",
                forecast.isMoneyLosing
                  ? "text-rose-700 dark:text-rose-300"
                  : "text-emerald-700 dark:text-emerald-300",
              )}
            >
              {fmtUsdShort(forecast.year1NetBenefitLow)}–
              {fmtUsdShort(forecast.year1NetBenefitHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              12 × monthly benefit − cutover
            </div>
          </div>
        </div>

        {/* Risk strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Top risks for Path {forecast.path}
          </div>
          <ul className="text-xs text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
            {forecast.risks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <CopyButton value={report} label="Copy report" />
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset to canonical Mailchimp default
          </button>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {fmtUsdFull(forecast.year1NetBenefitLow)}–{fmtUsdFull(forecast.year1NetBenefitHigh)} Year-1 net
          </span>
        </div>
      </div>
    </div>
  );
}
