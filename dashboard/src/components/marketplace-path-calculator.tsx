"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandChannelInputs,
  BrandRegistryStatus,
  Category,
  FulfillmentMode,
  MARKETPLACE_DEFAULTS,
  PathRecommendation,
  clampFloat,
  clampInt,
  fulfillmentBadgeClasses,
  pathBadgeClasses,
  pathLongLabel,
  recommendPath,
  registryBadgeClasses,
  renderMarketplaceMarkdown,
  validateMarketplaceInputs,
  categoryBadgeClasses,
} from "@/lib/marketplace";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Marketplace-expansion Path A/B/C scorer.
 *
 * Direct browser port of `scripts/marketplace_unit_economics.py`. The
 * operator enters 8 inputs (US DTC GMV, AOV, contribution margin, category,
 * Amazon fulfillment mode, Brand Registry status, USPTO trademark flag,
 * operator capacity hr/wk) and the panel picks one of the 3 canonical
 * paths (A / B / C) with the cost stack + Year-1 incremental revenue +
 * DTC-cannibalization-adjusted net revenue + Year-1 ROI + per-marketplace
 * revenue breakdown + the 6-step build sequence.
 *
 * Defaults match the Python CLI's $5M US DTC brand baseline (Path B,
 * 12:1 midpoint Year-1 ROI). State persists to localStorage
 * (`ecom-ops:marketplace-path:v1`). Copy-report emits a paste-ready
 * markdown handoff (matches `python3 scripts/marketplace_unit_economics.py`
 * byte-for-byte via `renderMarketplaceMarkdown`).
 *
 * Mounted on `/marketplace` between the asset-15 card and the demoted
 * "Future-tick companions" footer.
 */

const STORAGE_KEY = "ecom-ops:marketplace-path:v1";

function loadStored(): BrandChannelInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usGmv: clampFloat(Number(parsed.usGmv) || 0, 0, 1_000_000_000),
      aov: clampFloat(Number(parsed.aov) || 0, 0.01, 10_000),
      contributionMarginPct: clampFloat(
        Number(parsed.contributionMarginPct) || 0,
        0,
        100,
      ),
      category: (parsed.category as Category) ?? MARKETPLACE_DEFAULTS.category,
      amazonFulfillmentMode:
        (parsed.amazonFulfillmentMode as FulfillmentMode) ??
        MARKETPLACE_DEFAULTS.amazonFulfillmentMode,
      brandRegistryStatus:
        (parsed.brandRegistryStatus as BrandRegistryStatus) ??
        MARKETPLACE_DEFAULTS.brandRegistryStatus,
      hasUsptoTrademark:
        typeof parsed.hasUsptoTrademark === "boolean"
          ? parsed.hasUsptoTrademark
          : MARKETPLACE_DEFAULTS.hasUsptoTrademark,
      operatorCapacityHoursPerWeek: clampInt(
        Number(parsed.operatorCapacityHoursPerWeek) || 0,
        0,
        168,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandChannelInputs) {
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

export function MarketplacePathCalculator() {
  const [inputs, setInputs] = useState<BrandChannelInputs>(MARKETPLACE_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationErrors = useMemo(
    () => validateMarketplaceInputs(inputs),
    [inputs],
  );
  const hasValidationError = validationErrors.length > 0;

  const rec: PathRecommendation = useMemo(() => {
    if (hasValidationError) return recommendPath(MARKETPLACE_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, hasValidationError]);

  function patch<K extends keyof BrandChannelInputs>(
    key: K,
    value: BrandChannelInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(MARKETPLACE_DEFAULTS);
  }

  const report = useMemo(() => {
    if (hasValidationError) {
      return `# Validation error\n\n${validationErrors
        .map((e) => `- ${e.field}: ${e.message}`)
        .join("\n")}`;
    }
    return renderMarketplaceMarkdown(inputs, rec);
  }, [inputs, rec, hasValidationError, validationErrors]);

  return (
    <div
      id="marketplace-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Marketplace-expansion Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #13
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/marketplace_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current channel-mix inputs → see the
          canonical Path A / B / C recommendation with cost stack, Year-1
          incremental revenue, DTC-cannibalization-adjusted net revenue,
          Year-1 ROI band, per-marketplace revenue breakdown, and the
          6-step build sequence for the recommended path. State persists
          to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US DTC GMV ($)"
          value={inputs.usGmv}
          onChange={(v) => patch("usGmv", clampFloat(v, 0, 1_000_000_000))}
          step={50_000}
          suffix="$"
          hint="<$500k → defer"
        />
        <NumberInput
          label="AOV ($)"
          value={inputs.aov}
          onChange={(v) => patch("aov", clampFloat(v, 0.01, 10_000))}
          step={1}
          suffix="$"
          hint="≤$10,000 cap"
        />
        <NumberInput
          label="Contribution margin %"
          value={inputs.contributionMarginPct}
          onChange={(v) =>
            patch("contributionMarginPct", clampFloat(v, 0, 100))
          }
          step={1}
          suffix="%"
          hint="0..100"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(v) =>
            patch(
              "operatorCapacityHoursPerWeek",
              clampInt(v, 0, 168),
            )
          }
          step={1}
          suffix="hr/wk"
          hint="<5 → defer"
        />
        <SelectInput
          label="Category"
          value={inputs.category}
          onChange={(v) => patch("category", v)}
          options={[
            { value: "default", label: "Default" },
            { value: "consumables", label: "Consumables (upgrade)" },
            { value: "luxury", label: "Luxury (downgrade)" },
            { value: "sustainable", label: "Sustainable" },
            { value: "gen_z", label: "Gen-Z" },
            { value: "b2b", label: "B2B" },
            { value: "fragile", label: "Fragile" },
            { value: "subscription", label: "Subscription" },
          ]}
        />
        <SelectInput
          label="Amazon fulfillment mode"
          value={inputs.amazonFulfillmentMode}
          onChange={(v) => patch("amazonFulfillmentMode", v)}
          options={[
            { value: "FBA", label: "FBA (default)" },
            { value: "FBM", label: "FBM (downgrade)" },
            { value: "SFP", label: "SFP" },
            { value: "hybrid", label: "Hybrid" },
          ]}
        />
        <SelectInput
          label="Brand Registry status"
          value={inputs.brandRegistryStatus}
          onChange={(v) => patch("brandRegistryStatus", v)}
          options={[
            { value: "approved", label: "Approved" },
            { value: "submitted", label: "Submitted" },
            { value: "pending", label: "Pending (defer)" },
            { value: "rejected", label: "Rejected" },
            { value: "not_applicable", label: "N/A" },
          ]}
        />
        <BooleanToggle
          label="USPTO trademark"
          value={inputs.hasUsptoTrademark}
          onChange={(v) => patch("hasUsptoTrademark", v)}
          hint="No → defer (Brand Registry gate)"
        />
      </div>

      {hasValidationError && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 space-y-0.5">
          <div className="font-semibold">⚠ Validation errors:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((e, i) => (
              <li key={i}>
                {e.field}: {e.message}
              </li>
            ))}
          </ul>
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
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                pathBadgeClasses(rec.path),
              )}
            >
              Path {rec.path}
            </span>
            <span className="text-xs font-medium">
              {pathLongLabel(rec.path)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.justification}
          </p>
          <div className="flex flex-wrap gap-1">
            {rec.marketplaces.map((m) => (
              <span
                key={m}
                className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Default pick:
            </span>{" "}
            {rec.defaultMarketplacePick}
          </p>
        </div>

        {/* Input summary chips */}
        <div className="flex flex-wrap gap-1">
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono",
              categoryBadgeClasses(inputs.category),
            )}
          >
            {inputs.category}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono",
              fulfillmentBadgeClasses(inputs.amazonFulfillmentMode),
            )}
          >
            {inputs.amazonFulfillmentMode}
          </span>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-mono",
              registryBadgeClasses(inputs.brandRegistryStatus),
            )}
          >
            Brand Registry: {inputs.brandRegistryStatus}
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            US DTC GMV {fmtUsdShort(inputs.usGmv)}
          </span>
          <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            Capacity {inputs.operatorCapacityHoursPerWeek} hr/wk
          </span>
        </div>

        {/* 4-tile output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 incremental revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalRevenueLow)}–
              {fmtUsdShort(rec.year1IncrementalRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.year1IncrementalRevenuePctLow.toFixed(0)}–
              {rec.year1IncrementalRevenuePctHigh.toFixed(0)}% of US DTC GMV
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 cost stack
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1CostLow)}–
              {fmtUsdShort(rec.year1CostHigh)}
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
              DTC-cannibalization-adj net
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1AdjustedNetRevenueLow)}–
              {fmtUsdShort(rec.year1AdjustedNetRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              can rate {rec.year1DtcCannibalizationRateLow.toFixed(0)}–
              {rec.year1DtcCannibalizationRateHigh.toFixed(0)}%
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1RoiLow.toFixed(1)}:1 –{" "}
              {rec.year1RoiHigh.toFixed(1)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              gross revenue / cost
            </div>
          </div>
        </div>

        {/* Per-marketplace revenue breakdown */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Per-marketplace revenue breakdown (mid estimate)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {Object.entries(rec.marketplaceRevenueBreakdown).map(
              ([marketplace, revenue]) => (
                <div
                  key={marketplace}
                  className="rounded border border-border bg-muted/30 px-2 py-1.5"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {marketplace}
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {fmtUsdFull(revenue)}
                  </div>
                </div>
              ),
            )}
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
              scripts/marketplace_unit_economics.py
            </code>{" "}
            — Move #13 marketplace expansion.
          </span>
        </div>
      </div>
    </div>
  );
}
