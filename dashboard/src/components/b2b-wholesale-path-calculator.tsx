"use client";

import { useEffect, useMemo, useState } from "react";
import {
  B2B_DEFAULTS,
  BrandB2BInputs,
  PathRecommendation,
  SkuArchetypeDistribution,
  VoiceProfile,
  clamp,
  pathBadgeClasses,
  pathLongLabel,
  recommendPath,
  renderB2BMarkdown,
  validateB2BInputs,
} from "@/lib/b2b-wholesale";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive B2B / Wholesale Path A/B/C scorer.
 *
 * Direct browser port of `scripts/b2b_wholesale_unit_economics.py`. The
 * operator enters 13 inputs (US DTC GMV, SKU count, SKU archetype
 * distribution, gross margin, MOQ operational capacity, 5 boolean
 * integration gates, voice profile, dedicated sales-rep hours/week) and
 * the panel picks one of the 3 canonical paths (A / B / C) with the
 * cost stack + Year-1 incremental B2B revenue band + reorder-rate band +
 * MAP-policy-savings band + DTC-cannibalization-adjusted net revenue +
 * Year-1 ROI band + the canonical 6-step build sequence for the
 * recommended path.
 *
 * Defaults match the Python CLI's $2M US DTC brand baseline (Path B,
 * 8.5:1 midpoint Year-1 ROI). State persists to localStorage
 * (`ecom-ops:b2b-wholesale-path:v1`). Copy-report emits a paste-ready
 * markdown handoff (matches `python3 scripts/b2b_wholesale_unit_economics.py`
 * byte-for-byte via `renderB2BMarkdown`).
 *
 * Mounted on `/b2b` between the asset-18 card and the demoted
 * "Future-tick companions" footer.
 */

const STORAGE_KEY = "ecom-ops:b2b-wholesale-path:v1";

function loadStored(): BrandB2BInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    // Defensive merge — keep defaults for any missing / wrong-type field.
    return {
      usDtcGmv: clamp(Number(parsed.usDtcGmv) || 0, 0, 100_000_000),
      skuCount: clamp(Number(parsed.skuCount) || 0, 0, 10_000),
      skuArchetypeDistribution:
        (parsed.skuArchetypeDistribution as SkuArchetypeDistribution) ??
        B2B_DEFAULTS.skuArchetypeDistribution,
      grossMarginPct: clamp(Number(parsed.grossMarginPct) || 0, 0, 100),
      moqOperationalCapacity: clamp(
        Number(parsed.moqOperationalCapacity) || 1,
        1,
        10,
      ),
      hasFaireAccount: Boolean(parsed.hasFaireAccount),
      hasHandshakeShopify: Boolean(parsed.hasHandshakeShopify),
      hasNetSuiteWholesale: Boolean(parsed.hasNetSuiteWholesale),
      hasRspOrKehePitch: Boolean(parsed.hasRspOrKehePitch),
      hasCorporateGiftingCatalog: Boolean(parsed.hasCorporateGiftingCatalog),
      voiceProfile: (parsed.voiceProfile as VoiceProfile) ?? B2B_DEFAULTS.voiceProfile,
      hasDedicatedSalesRepCapacityHoursPerWeek: clamp(
        Number(parsed.hasDedicatedSalesRepCapacityHoursPerWeek) || 0,
        0,
        168,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandB2BInputs) {
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
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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
        {suffix && <span className="text-[10px] text-muted-foreground font-mono">{suffix}</span>}
      </div>
      {hint && <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>}
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
      <span className="text-[10px] uppercase tracking-wider font-mono">{label}</span>
      <span className="text-xs font-semibold">{value ? "✓ Yes" : "✗ No"}</span>
      {hint && <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>}
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
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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
      {hint && <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>}
    </label>
  );
}

export function B2BWholesalePathCalculator() {
  const [inputs, setInputs] = useState<BrandB2BInputs>(B2B_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(() => validateB2BInputs(inputs), [inputs]);

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(B2B_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  function patch<K extends keyof BrandB2BInputs>(
    key: K,
    value: BrandB2BInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(B2B_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderB2BMarkdown(inputs, rec);
  }, [inputs, rec, validationError]);

  return (
    <div
      id="b2b-wholesale-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            B2B / wholesale Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #14.5
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of <code className="rounded bg-muted px-1">scripts/b2b_wholesale_unit_economics.py</code>.
          Enter your brand&rsquo;s current B2B-wholesale-fit inputs → see the canonical
          Path A / B / C recommendation with cost stack, Year-1 incremental
          B2B revenue band, reorder-rate band, MAP-policy savings,
          DTC-cannibalization-adjusted net revenue, Year-1 ROI, and the
          6-step build sequence for the recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US DTC GMV ($)"
          value={inputs.usDtcGmv}
          onChange={(v) => patch("usDtcGmv", clamp(v, 0, 100_000_000))}
          step={50_000}
          suffix="$"
          hint="current US DTC GMV"
        />
        <NumberInput
          label="SKU count"
          value={inputs.skuCount}
          onChange={(v) => patch("skuCount", clamp(Math.round(v), 0, 10_000))}
          step={1}
          hint="<10 → defer"
        />
        <SelectInput
          label="SKU archetype mix"
          value={inputs.skuArchetypeDistribution}
          onChange={(v) => patch("skuArchetypeDistribution", v)}
          options={[
            { value: "12_hero_23_wholesale", label: "12 hero / 23 wholesale" },
            { value: "balanced_50_50", label: "Balanced 50/50" },
            { value: "mostly_hero_70_30", label: "Mostly hero 70/30" },
            { value: "mostly_wholesale_30_70", label: "Mostly wholesale 30/70" },
          ]}
        />
        <NumberInput
          label="Gross margin %"
          value={inputs.grossMarginPct}
          onChange={(v) => patch("grossMarginPct", clamp(v, 0, 100))}
          step={1}
          suffix="%"
          hint="<25% → defer"
        />
        <NumberInput
          label="MOQ capacity (1-10)"
          value={inputs.moqOperationalCapacity}
          onChange={(v) =>
            patch("moqOperationalCapacity", clamp(Math.round(v), 1, 10))
          }
          step={1}
          hint="<3 → defer"
        />
        <NumberInput
          label="Sales-rep hr/wk"
          value={inputs.hasDedicatedSalesRepCapacityHoursPerWeek}
          onChange={(v) =>
            patch("hasDedicatedSalesRepCapacityHoursPerWeek", clamp(Math.round(v), 0, 168))
          }
          step={1}
          suffix="hr/wk"
          hint="<4 → defer"
        />
        <SelectInput
          label="Voice profile"
          value={inputs.voiceProfile}
          onChange={(v) => patch("voiceProfile", v)}
          options={[
            { value: "default", label: "Default" },
            { value: "luxury", label: "Luxury" },
            { value: "sustainable", label: "Sustainable" },
            { value: "gen_z", label: "Gen-Z" },
            { value: "b2b", label: "B2B" },
          ]}
          hint="luxury + no gifting → downgrade"
        />
      </div>

      {/* Boolean integration gates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <BooleanToggle
          label="Faire"
          value={inputs.hasFaireAccount}
          onChange={(v) => patch("hasFaireAccount", v)}
          hint="No → defer (canonical Path A entry point)"
        />
        <BooleanToggle
          label="Handshake"
          value={inputs.hasHandshakeShopify}
          onChange={(v) => patch("hasHandshakeShopify", v)}
          hint="No → defer (canonical Shopify-native B2B)"
        />
        <BooleanToggle
          label="NetSuite / A2X"
          value={inputs.hasNetSuiteWholesale}
          onChange={(v) => patch("hasNetSuiteWholesale", v)}
          hint="Required for Path C"
        />
        <BooleanToggle
          label="RSP / KeHE pitch"
          value={inputs.hasRspOrKehePitch}
          onChange={(v) => patch("hasRspOrKehePitch", v)}
          hint="Required for Path C distribution"
        />
        <BooleanToggle
          label="Gifting catalog"
          value={inputs.hasCorporateGiftingCatalog}
          onChange={(v) => patch("hasCorporateGiftingCatalog", v)}
          hint="MAP-protection gate for luxury/sustainable"
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
            <span className="text-xs font-medium">{pathLongLabel(rec.path)}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.justification}
          </p>
          <div className="flex flex-wrap gap-1">
            {rec.platforms.map((p) => (
              <span
                key={p}
                className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">Default pick:</span>{" "}
            {rec.defaultPlatformPick}
          </p>
        </div>

        {/* 4-tile output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 incremental revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalRevenueLow)}–{fmtUsdShort(rec.year1IncrementalRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.year1IncrementalRevenueSharePctLow.toFixed(0)}–{rec.year1IncrementalRevenueSharePctHigh.toFixed(0)}% of US DTC GMV
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 cost stack
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1CostLow)}–{fmtUsdShort(rec.year1CostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              setup {fmtUsdShort(rec.costOneTimeLow)}–{fmtUsdShort(rec.costOneTimeHigh)} + monthly {fmtUsdShort(rec.costRecurringLow)}–{fmtUsdShort(rec.costRecurringHigh)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              DTC-cannibalization-adj net
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.dtcCannibalizationAdjustedNetRevenueLow)}–{fmtUsdShort(rec.dtcCannibalizationAdjustedNetRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              MAP savings {rec.mapPolicySavingsPctLow.toFixed(0)}–{rec.mapPolicySavingsPctHigh.toFixed(0)}%
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1RoiLow.toFixed(1)}:1 – {rec.year1RoiHigh.toFixed(1)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              reorder {rec.reorderRatePctLow.toFixed(0)}–{rec.reorderRatePctHigh.toFixed(0)}% · attach {rec.wholesaleAttachRatePctLow.toFixed(0)}–{rec.wholesaleAttachRatePctHigh.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Wholesale-discount matrix */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            6-tier wholesale-discount matrix (per voice profile)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {Object.entries(rec.wholesaleDiscountMatrix).map(([voice, desc]) => (
              <div
                key={voice}
                className="rounded border border-border bg-muted/30 px-2 py-1 text-[10px] font-mono"
              >
                <span className="font-semibold uppercase tracking-wider">{voice}</span>
                <span className="text-muted-foreground"> · {desc}</span>
              </div>
            ))}
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
            Same math as <code className="rounded bg-muted px-1">scripts/b2b_wholesale_unit_economics.py</code> — Move #14.5 B2B / wholesale track.
          </span>
        </div>
      </div>
    </div>
  );
}