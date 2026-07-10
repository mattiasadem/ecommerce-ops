"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandOpsInputs,
  PathRecommendation,
  SkuComplexity,
  THREEPL_DEFAULTS,
  healthBandTag,
  pathBadgeClasses,
  pathLongLabel,
  recommendPath,
  renderThreeplMarkdown,
  validateThreeplInputs,
} from "@/lib/threepl";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive 3PL migration Path A/B/C scorer.
 *
 * Direct browser port of `scripts/threepl_unit_economics.py`. The
 * operator enters 9 inputs (orders/mo, AOV, current ship cost, current
 * ship time, has warehouse lease, SKU count, SKU complexity,
 * international volume %, operator capacity hr/wk) and the panel picks
 * one of the 3 canonical paths (A / B / C) with the cost stack +
 * Year-1 incremental net band + Year-1 ROI band + ship-cost-savings
 * band + ship-time-improvement band + 6-step build sequence for the
 * recommended path.
 *
 * Defaults match the Python CLI's $1M US DTC Path B default (2,500
 * orders/mo, $75 AOV, $8.50 current ship cost, 3-day ship time).
 * State persists to localStorage (`ecom-ops:threepl-path:v1`).
 * Copy-report emits a paste-ready markdown handoff (matches
 * `python3 scripts/threepl_unit_economics.py` byte-for-byte via
 * `renderThreeplMarkdown`).
 *
 * Mounted on `/3pl` between the asset-15 card and the demoted
 * "Future-tick companion" footer.
 */

const STORAGE_KEY = "ecom-ops:threepl-path:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandOpsInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    // Defensive merge — keep defaults for any missing / wrong-type field.
    return {
      ordersPerMonth: clamp(Math.round(Number(parsed.ordersPerMonth) || 0), 0, 1_000_000),
      aov: clamp(Number(parsed.aov) || 75.0, 0, 10_000),
      currentShipCostPerOrder: clamp(
        Number(parsed.currentShipCostPerOrder) || 0,
        0,
        100,
      ),
      currentShipTimeDays: clamp(
        Number(parsed.currentShipTimeDays) || 0,
        0,
        30,
      ),
      hasWarehouseLease:
        parsed.hasWarehouseLease !== undefined
          ? Boolean(parsed.hasWarehouseLease)
          : true,
      skuCount: clamp(Math.round(Number(parsed.skuCount) || 0), 0, 100_000),
      skuComplexity:
        (parsed.skuComplexity as SkuComplexity) ?? THREEPL_DEFAULTS.skuComplexity,
      internationalVolumePct: clamp(
        Number(parsed.internationalVolumePct) || 0,
        0,
        100,
      ),
      operatorCapacityHoursPerWeek: clamp(
        Math.round(Number(parsed.operatorCapacityHoursPerWeek) || 0),
        0,
        168,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandOpsInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function fmtUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtUsdFull(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
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
        <span className="text-[9px] text-muted-foreground leading-tight">
          {hint}
        </span>
      )}
    </label>
  );
}

function BooleanToggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors",
        value
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
      title={hint}
    >
      <span className="text-[10px] uppercase tracking-wider font-mono">
        {label}
      </span>
      <span className="text-xs font-semibold">{value ? "✓ Yes" : "✗ No"}</span>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">
          {hint}
        </span>
      )}
    </button>
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
  options: { value: T; label: string }[];
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
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">
          {hint}
        </span>
      )}
    </label>
  );
}

export function ThreeplPathCalculator() {
  const [inputs, setInputs] = useState<BrandOpsInputs>(THREEPL_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(
    () => validateThreeplInputs(inputs),
    [inputs],
  );

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(THREEPL_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  function patch<K extends keyof BrandOpsInputs>(
    key: K,
    value: BrandOpsInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(THREEPL_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderThreeplMarkdown(inputs, rec);
  }, [inputs, rec, validationError]);

  const health = healthBandTag(rec.year1RoiLow, rec.year1RoiHigh);

  return (
    <div
      id="threepl-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            3PL migration Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #12
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/threepl_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current-ops inputs (orders/mo, AOV,
          current ship cost, ship time, has warehouse lease, SKU count +
          complexity, international volume %, operator capacity hr/wk)
          &rarr; see the canonical Path A / B / C recommendation with cost
          stack, Year-1 incremental net band, ship-cost savings, ship-time
          improvement, Year-1 ROI, and the 6-step build sequence for the
          recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="Orders / month"
          value={inputs.ordersPerMonth}
          onChange={(v) => patch("ordersPerMonth", clamp(Math.round(v), 0, 1_000_000))}
          step={100}
          hint="<500 → defer"
        />
        <NumberInput
          label="AOV ($)"
          value={inputs.aov}
          onChange={(v) => patch("aov", clamp(v, 0, 10_000))}
          step={1}
          suffix="$"
          hint="$0-$10k"
        />
        <NumberInput
          label="Current ship cost / order"
          value={inputs.currentShipCostPerOrder}
          onChange={(v) =>
            patch("currentShipCostPerOrder", clamp(v, 0, 100))
          }
          step={0.5}
          suffix="$"
          hint="<$6 → downgrade"
        />
        <NumberInput
          label="Current ship time P50"
          value={inputs.currentShipTimeDays}
          onChange={(v) => patch("currentShipTimeDays", clamp(v, 0, 30))}
          step={0.5}
          suffix="days"
        />
        <NumberInput
          label="SKU count"
          value={inputs.skuCount}
          onChange={(v) => patch("skuCount", clamp(Math.round(v), 0, 100_000))}
          step={5}
        />
        <NumberInput
          label="International volume %"
          value={inputs.internationalVolumePct}
          onChange={(v) => patch("internationalVolumePct", clamp(v, 0, 100))}
          step={1}
          suffix="%"
          hint="≥20% → upgrade"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(v) =>
            patch(
              "operatorCapacityHoursPerWeek",
              clamp(Math.round(v), 0, 168),
            )
          }
          step={1}
          suffix="hr/wk"
          hint="<2 → defer"
        />
        <SelectInput
          label="SKU complexity"
          value={inputs.skuComplexity}
          onChange={(v) => patch("skuComplexity", v)}
          options={[
            { value: "standard", label: "Standard" },
            { value: "subscription", label: "Subscription" },
            { value: "bundles", label: "Bundles" },
            { value: "fragile", label: "Fragile" },
            { value: "hazmat", label: "Hazmat" },
            { value: "temperature_controlled", label: "Temp-controlled" },
          ]}
          hint="subscription / bundles → upgrade"
        />
      </div>

      {/* Boolean integration gates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <BooleanToggle
          label="Has warehouse lease"
          value={inputs.hasWarehouseLease}
          onChange={(v) => patch("hasWarehouseLease", v)}
          hint="No → downgrade (no lease savings to unlock)"
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
            <span className={pathBadgeClasses(rec.path)}>
              Path {rec.path}
            </span>
            <span className="text-xs font-medium">
              {pathLongLabel(rec.path)}
            </span>
            <span className={health.classes}>
              {health.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.justification}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Default 3PL pick:
            </span>{" "}
            {rec.threeplDefault}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Warehouses:
            </span>{" "}
            {rec.warehouses[0]}
          </p>
        </div>

        {/* 4-tile primary output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 incremental net
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalNetLow)}–
              {fmtUsdShort(rec.year1IncrementalNetHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {fmtUsdFull(rec.year1IncrementalNetLow)} –{" "}
              {fmtUsdFull(rec.year1IncrementalNetHigh)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 3PL cost stack
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1ThreeplCostLow)}–
              {fmtUsdShort(rec.year1ThreeplCostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              setup {fmtUsdShort(rec.costOneTimeLow)}–
              {fmtUsdShort(rec.costOneTimeHigh)} + monthly{" "}
              {fmtUsdShort(rec.costRecurringLow)}–
              {fmtUsdShort(rec.costRecurringHigh)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1RoiLow.toFixed(0)}:1 – {rec.year1RoiHigh.toFixed(0)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              mid {((rec.year1RoiLow + rec.year1RoiHigh) / 2).toFixed(1)}:1
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ship cost savings
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.shipCostSavingsPctLow.toFixed(0)}%–
              {rec.shipCostSavingsPctHigh.toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              ship time -{rec.shipTimeImprovementDaysLow.toFixed(1)}–
              {rec.shipTimeImprovementDaysHigh.toFixed(1)} days
            </div>
          </div>
        </div>

        {/* 6-step build sequence */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            6-step build sequence · Path {rec.path}
          </div>
          <ol className="space-y-1 list-decimal pl-5 text-xs leading-relaxed text-muted-foreground">
            {rec.buildSequence.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton
            value={report}
            label="Copy markdown report"
            className="text-xs"
          />
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted transition-colors"
          >
            Reset defaults
          </button>
          <span className="text-[10px] text-muted-foreground">
            Same math as{" "}
            <code className="rounded bg-muted px-1">
              scripts/threepl_unit_economics.py
            </code>{" "}
            — Move #12 3PL migration track.
          </span>
        </div>
      </div>
    </div>
  );
}