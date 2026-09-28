"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AMAZON_DSP_DEFAULTS,
  AmazonDspInputs,
  PathRecommendation,
  VoiceProfile,
  recommendPath,
  renderAmazonDspMarkdown,
  validateAmazonDspInputs,
} from "@/lib/amazon-dsp-amazon-attribution";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Amazon-DSP + Amazon-Attribution Path A / B / C scorer.
 *
 * Direct browser port of `scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py`.
 * The operator enters 12 inputs (US DTC GMV, marketplace GMV %, SKU count,
 * hero-SKU count, gross margin %, 4 boolean integration gates, voice profile,
 * dedicated DSP-marketing-team capacity, has-halo-defense-creative-assets)
 * and the panel picks one of the 3 canonical paths (A / B / C) with the
 * cost stack + Year-1 incremental Halo-defense-revenue band + CAC vs
 * paid-social multiplier + Brand-search-volume-lift + AMC-cohort-overlay
 * resolution-lift + Halo-defense-rate + Halo-attribution-modeling-maturity
 * + 5-pillar framework matrix (per voice) + 6-step build sequence for the
 * recommended path.
 *
 * Defaults match the Python CLI's $5M US DTC + $10M Amazon Path B baseline
 * (3.5:1-35:1 Year-1 ROI Path B default). State persists to localStorage
 * (`ecom-ops:amazon-dsp-path:v1`). Copy-report emits a paste-ready markdown
 * handoff (matches `python3 scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py`
 * byte-for-byte via `renderAmazonDspMarkdown`).
 *
 * Mounted on `/amazon-dsp-amazon-attribution-audit` between the hero
 * metric cards and the research/14 TL;DR card so it's the first thing
 * the operator sees when they want to actually plan a build.
 */

const STORAGE_KEY = "ecom-ops:amazon-dsp-path:v1";
const STORAGE_UPDATE_EVENT = "ecom-ops:amazon-dsp-path:update";

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function loadStored(): AmazonDspInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usDtcGmv: clamp(Number(parsed.usDtcGmv) || 0, 0, 1_000_000_000),
      marketplaceGmvPct: clamp(Number(parsed.marketplaceGmvPct) || 0, 0, 100),
      skuCount: clamp(Number(parsed.skuCount) || 0, 0, 100_000),
      heroSkuCount: clamp(Number(parsed.heroSkuCount) || 0, 0, 100_000),
      grossMarginPct: clamp(Number(parsed.grossMarginPct) || 0, 0, 100),
      hasAmazonSellerCentralAccount: Boolean(parsed.hasAmazonSellerCentralAccount),
      hasBrandRegistryTrademark: Boolean(parsed.hasBrandRegistryTrademark),
      hasAmazonAttributionProOrAdvancedTools: Boolean(parsed.hasAmazonAttributionProOrAdvancedTools),
      hasDspManagedServiceOrSelfServeAccount: Boolean(parsed.hasDspManagedServiceOrSelfServeAccount),
      voiceProfile: (parsed.voiceProfile as VoiceProfile) ?? AMAZON_DSP_DEFAULTS.voiceProfile,
      hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek: clamp(
        Number(parsed.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek) || 0,
        0,
        168,
      ),
      hasHaloDefenseCreativeAssets: Boolean(parsed.hasHaloDefenseCreativeAssets),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: AmazonDspInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    window.dispatchEvent(new CustomEvent(STORAGE_UPDATE_EVENT));
  } catch {
    /* localStorage may be unavailable; silently degrade */
  }
}

const VOICE_OPTIONS: { value: VoiceProfile; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "luxury", label: "Luxury" },
  { value: "sustainable", label: "Sustainable" },
  { value: "gen_z", label: "Gen-Z" },
  { value: "b2b", label: "B2B" },
];

function pathBadgeClasses(path: "A" | "B" | "C"): string {
  if (path === "C") return "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  if (path === "B") return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

function pathLongLabel(path: "A" | "B" | "C"): string {
  if (path === "C") return "Path C — Enterprise ($25M+ US DTC + $25M+ Amazon base)";
  if (path === "B") return "Path B — DEFAULT ($5M-$25M DTC+Amazon base)";
  return "Path A — Entry ($100k-$5M DTC+Amazon base)";
}

function fmtUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
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

export function AmazonDspPathCalculator() {
  const [inputs, setInputs] = useState<AmazonDspInputs>(AMAZON_DSP_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(() => validateAmazonDspInputs(inputs), [inputs]);

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(AMAZON_DSP_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderAmazonDspMarkdown(inputs, rec);
  }, [inputs, rec, validationError]);

  function patch<K extends keyof AmazonDspInputs>(key: K, value: AmazonDspInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(AMAZON_DSP_DEFAULTS);
  }

  const totalGmvBase = inputs.usDtcGmv * (1.0 + inputs.marketplaceGmvPct / 100.0);

  return (
    <div
      id="amazon-dsp-path-calculator"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-base font-semibold tracking-tight">
          Amazon-DSP + Amazon-Attribution path picker
        </h2>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            pathBadgeClasses(rec.path),
          )}
        >
          {pathLongLabel(rec.path)}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          Total GMV base ${fmtUsdShort(totalGmvBase)}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Enter your US DTC GMV + marketplace GMV share + SKU counts + 4 integration gates
        + voice + DSP-marketing-team capacity. The panel picks Path A / B / C against the
        research/14 GMV-tier thresholds and surfaces the cost stack + Year-1 incremental
        Halo-defense-revenue band + the 5-pillar framework matrix (per voice) + the
        6-step build sequence. Same math as{" "}
        <code className="font-mono text-[10px]">scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py</code>.
      </p>

      {/* ===== INPUT GRID ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <NumberInput
          label="US DTC GMV ($)"
          value={inputs.usDtcGmv}
          onChange={(n) => patch("usDtcGmv", n)}
          step={100_000}
          hint="<$100k defer · $100k-$5M Path A · $5M-$25M Path B · $25M+ Path C"
        />
        <NumberInput
          label="Marketplace GMV share"
          value={inputs.marketplaceGmvPct}
          onChange={(n) => patch("marketplaceGmvPct", n)}
          step={5}
          max={100}
          suffix="%"
          hint="Amazon + Walmart + Target Plus + EU marketplaces"
        />
        <NumberInput
          label="Total SKU count"
          value={inputs.skuCount}
          onChange={(n) => patch("skuCount", n)}
          hint="Floor 5 (research/14 §Prereq)"
        />
        <NumberInput
          label="Hero SKU count"
          value={inputs.heroSkuCount}
          onChange={(n) => patch("heroSkuCount", n)}
          hint="Floor 5 Amazon-listed hero SKUs"
        />
        <NumberInput
          label="Gross margin"
          value={inputs.grossMarginPct}
          onChange={(n) => patch("grossMarginPct", n)}
          suffix="%"
          hint="Floor 25% (Amazon-DSP-margin-headroom)"
        />
        <NumberInput
          label="DSP-team capacity"
          value={inputs.hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek}
          onChange={(n) => patch("hasDedicatedAmazonDspMarketingTeamCapacityHoursPerWeek", n)}
          suffix="hr/wk"
          hint="Floor 4 hr/wk (canonical Path B minimum)"
        />
        <SelectInput<VoiceProfile>
          label="Voice profile"
          value={inputs.voiceProfile}
          options={VOICE_OPTIONS}
          onChange={(v) => patch("voiceProfile", v)}
          hint="Luxury + no Halo-defense-creative → downgrade · B2B + no attribution → downgrade"
        />
      </div>

      {/* ===== BOOLEAN GATES ===== */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        <BooleanToggle
          label="Seller-Central acct"
          value={inputs.hasAmazonSellerCentralAccount}
          onChange={(v) => patch("hasAmazonSellerCentralAccount", v)}
          hint="Active with 5+ listed SKUs + Buy-Box ≥90%"
        />
        <BooleanToggle
          label="Brand-Registry TM"
          value={inputs.hasBrandRegistryTrademark}
          onChange={(v) => patch("hasBrandRegistryTrademark", v)}
          hint="USPTO-registered; required for Halo-defense-levers"
        />
        <BooleanToggle
          label="Attribution-Pro/AMC"
          value={inputs.hasAmazonAttributionProOrAdvancedTools}
          onChange={(v) => patch("hasAmazonAttributionProOrAdvancedTools", v)}
          hint="Beta-deprecation-August-2025 migration required"
        />
        <BooleanToggle
          label="DSP-account"
          value={inputs.hasDspManagedServiceOrSelfServeAccount}
          onChange={(v) => patch("hasDspManagedServiceOrSelfServeAccount", v)}
          hint="$35k+ self-serve OR $2k-$10k/mo managed-service"
        />
        <BooleanToggle
          label="Halo-creatives"
          value={inputs.hasHaloDefenseCreativeAssets}
          onChange={(v) => patch("hasHaloDefenseCreativeAssets", v)}
          hint="5+ Halo-creatives per Amazon-Creative-Assets-2024-5-specs"
        />
      </div>

      {/* ===== RESULTS ===== */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Year-1 cost
          </div>
          <div className="font-mono text-sm tabular-nums">
            {fmtUsdShort(rec.year1CostLow)} – {fmtUsdShort(rec.year1CostHigh)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Incremental Halo-defense revenue
          </div>
          <div className="font-mono text-sm tabular-nums">
            {fmtUsdShort(rec.year1IncrementalHaloDefenseRevenueLow)} – {fmtUsdShort(rec.year1IncrementalHaloDefenseRevenueHigh)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Year-1 ROI
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.year1RoiLow.toFixed(1)}:1 – {rec.year1RoiHigh.toFixed(1)}:1
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            CAC vs paid-social
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.cacVsPaidSocialMultiplierLow.toFixed(2)}x – {rec.cacVsPaidSocialMultiplierHigh.toFixed(2)}x
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Brand-search lift
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.brandSearchVolumeLiftMultipleLow.toFixed(1)}x – {rec.brandSearchVolumeLiftMultipleHigh.toFixed(1)}x
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AMC-cohort resolution
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.amcCohortOverlayResolutionLiftMultipleLow.toFixed(1)}x – {rec.amcCohortOverlayResolutionLiftMultipleHigh.toFixed(1)}x
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Halo-defense rate
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.haloDefenseRatePctLow.toFixed(1)}% – {rec.haloDefenseRatePctHigh.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Halo-modeling maturity
          </div>
          <div className="font-mono text-sm tabular-nums">
            {rec.haloAttributionModelingMaturityMonthsLow}–{rec.haloAttributionModelingMaturityMonthsHigh} mo
          </div>
        </div>
      </div>

      {/* ===== JUSTIFICATION ===== */}
      <div className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground/90">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Justification
        </div>
        {rec.justification}
      </div>

      {/* ===== DEFAULT PLATFORM PICK ===== */}
      <div className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground/90">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Default platform pick
        </div>
        {rec.defaultPlatformPick}
      </div>

      {/* ===== 5-PILLAR FRAMEWORK MATRIX (per voice) ===== */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          5-pillar Amazon-DSP framework — {inputs.voiceProfile} voice × Path {rec.path}
        </div>
        {Object.entries(rec.amazonDspPillarMatrix).map(([pillar, desc]) => (
          <div key={pillar} className="rounded-md border border-border bg-background p-2">
            <div className="text-[10px] font-semibold text-foreground/90">{pillar}</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>

      {/* ===== BUILD SEQUENCE ===== */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          6-step build sequence (Path {rec.path})
        </div>
        <ol className="flex flex-col gap-1.5 text-[11px] leading-relaxed">
          {rec.buildSequence.map((step, i) => (
            <li key={i} className="rounded-md border border-border bg-background p-2 text-foreground/90">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <CopyButton value={report} label="Copy report" />
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground/90 transition-colors hover:bg-muted"
        >
          Reset to defaults
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
          State persisted to localStorage · {STORAGE_KEY}
        </span>
      </div>
    </div>
  );
}
