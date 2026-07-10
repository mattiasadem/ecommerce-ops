"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandPinterestSeoInputs,
  PathRecommendation,
  PINTEREST_SEO_DEFAULTS,
  PathName,
  SkuArchetype,
  VoiceProfile,
  pathBadgeClasses,
  pathLongLabel,
  recommendPath,
  renderPinterestSeoMarkdown,
  validatePinterestSeoInputs,
  voiceBadgeClasses,
} from "@/lib/pinterest-seo";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Pinterest-SEO Path A / B / C scorer.
 *
 * Direct browser port of `scripts/pinterest_seo_unit_economics.py`. The
 * operator enters 12 inputs (US DTC GMV, SKU count, SKU archetype
 * distribution, gross margin %, 7 platform-integration booleans, voice
 * profile, operator capacity hr/wk) and the panel picks one of the 3
 * canonical paths (A / B / C) with the cost stack + Year-1 incremental
 * Pinterest-SEO-traffic band + CAC vs paid-social multiplier +
 * 12-24-month compounding-traffic-curve steady-state projection +
 * 5-pillar organic-content matrix (per voice) + 6-step build sequence for
 * the recommended path.
 *
 * Defaults match the Python CLI's $2M US DTC Path B default (Gen-Z voice,
 * 35 SKUs, balanced archetype, 50% gross margin, all integrations live
 * except MarketMuse, 6 hr/wk operator capacity).
 *
 * State persists to localStorage (`ecom-ops:pinterest-seo-path:v1`).
 * Copy-report emits a paste-ready markdown handoff (matches
 * `python3 scripts/pinterest_seo_unit_economics.py` byte-for-byte via
 * `renderPinterestSeoMarkdown`).
 *
 * Mounted on `/pinterest-seo` between the asset-21 card and the demoted
 * "Future-tick companion" footer.
 */
const STORAGE_KEY = "ecom-ops:pinterest-seo-path:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandPinterestSeoInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const validVoices: VoiceProfile[] = [
      "default",
      "luxury",
      "sustainable",
      "gen_z",
      "b2b",
    ];
    const validArchetypes: SkuArchetype[] = [
      "hero_mid_long_tail",
      "balanced",
      "long_tail_heavy",
    ];
    return {
      usDtcGmv: clamp(
        Number(parsed.usDtcGmv) || PINTEREST_SEO_DEFAULTS.usDtcGmv,
        0,
        100_000_000,
      ),
      skuCount: clamp(
        Math.round(Number(parsed.skuCount) || PINTEREST_SEO_DEFAULTS.skuCount),
        0,
        100_000,
      ),
      skuArchetypeDistribution: validArchetypes.includes(
        parsed.skuArchetypeDistribution as SkuArchetype,
      )
        ? (parsed.skuArchetypeDistribution as SkuArchetype)
        : PINTEREST_SEO_DEFAULTS.skuArchetypeDistribution,
      grossMarginPct: clamp(
        Number(parsed.grossMarginPct) ||
          PINTEREST_SEO_DEFAULTS.grossMarginPct,
        0,
        100,
      ),
      hasPinterestBusinessAccount:
        parsed.hasPinterestBusinessAccount !== undefined
          ? Boolean(parsed.hasPinterestBusinessAccount)
          : PINTEREST_SEO_DEFAULTS.hasPinterestBusinessAccount,
      hasShopifySeoApp:
        parsed.hasShopifySeoApp !== undefined
          ? Boolean(parsed.hasShopifySeoApp)
          : PINTEREST_SEO_DEFAULTS.hasShopifySeoApp,
      hasSurferSeoSubscription:
        parsed.hasSurferSeoSubscription !== undefined
          ? Boolean(parsed.hasSurferSeoSubscription)
          : PINTEREST_SEO_DEFAULTS.hasSurferSeoSubscription,
      hasAhrefsContentGap:
        parsed.hasAhrefsContentGap !== undefined
          ? Boolean(parsed.hasAhrefsContentGap)
          : PINTEREST_SEO_DEFAULTS.hasAhrefsContentGap,
      hasOriginalityAiSubscription:
        parsed.hasOriginalityAiSubscription !== undefined
          ? Boolean(parsed.hasOriginalityAiSubscription)
          : PINTEREST_SEO_DEFAULTS.hasOriginalityAiSubscription,
      hasMarketmuseTopicalAuthority:
        parsed.hasMarketmuseTopicalAuthority !== undefined
          ? Boolean(parsed.hasMarketmuseTopicalAuthority)
          : PINTEREST_SEO_DEFAULTS.hasMarketmuseTopicalAuthority,
      voiceProfile: validVoices.includes(parsed.voiceProfile as VoiceProfile)
        ? (parsed.voiceProfile as VoiceProfile)
        : PINTEREST_SEO_DEFAULTS.voiceProfile,
      hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek: clamp(
        Math.round(
          Number(
            parsed.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek,
          ) ||
            PINTEREST_SEO_DEFAULTS.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek,
        ),
        0,
        168,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandPinterestSeoInputs) {
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
  positiveColor = "emerald",
  negativeColor = "amber",
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
  positiveColor?: "emerald" | "rose";
  negativeColor?: "amber" | "rose";
}) {
  const posCls =
    positiveColor === "rose"
      ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  const negCls =
    negativeColor === "rose"
      ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors",
        value ? posCls : negCls,
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

export function PinterestSeoPathCalculator() {
  const [inputs, setInputs] = useState<BrandPinterestSeoInputs>(
    PINTEREST_SEO_DEFAULTS,
  );
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
    () => validatePinterestSeoInputs(inputs),
    [inputs],
  );

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(PINTEREST_SEO_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  function patch<K extends keyof BrandPinterestSeoInputs>(
    key: K,
    value: BrandPinterestSeoInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(PINTEREST_SEO_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderPinterestSeoMarkdown(inputs, rec);
  }, [inputs, rec, validationError]);

  return (
    <div
      id="pinterest-seo-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Pinterest-SEO Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #17
          </span>
          <span className={voiceBadgeClasses(inputs.voiceProfile)}>
            {inputs.voiceProfile} voice
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/pinterest_seo_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current Pinterest-SEO-fit inputs (US DTC
          GMV, SKU count + archetype, gross margin %, 7 platform-integration
          booleans, voice profile, operator capacity hr/wk) &rarr; see the
          canonical Path A / B / C recommendation with cost stack, Year-1
          incremental Pinterest-SEO-traffic band, CAC vs paid-social
          multiplier, 12-24-month compounding-traffic-curve steady-state,
          5-pillar organic-content matrix (per voice), and the 6-step build
          sequence for the recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== CORE NUMERIC INPUTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US DTC GMV"
          value={inputs.usDtcGmv}
          onChange={(v) => patch("usDtcGmv", clamp(v, 0, 100_000_000))}
          step={100_000}
          suffix="$"
          hint="<100k → defer · $500k-$5M Path B · $5M+ Path C"
        />
        <NumberInput
          label="SKU count"
          value={inputs.skuCount}
          onChange={(v) => patch("skuCount", clamp(Math.round(v), 0, 100_000))}
          step={5}
          hint="<10 → defer"
        />
        <NumberInput
          label="Gross margin"
          value={inputs.grossMarginPct}
          onChange={(v) =>
            patch("grossMarginPct", clamp(v, 0, 100))
          }
          step={1}
          suffix="%"
          hint="<25% → defer"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek}
          onChange={(v) =>
            patch(
              "hasDedicatedPinterestSeoContentOperatorCapacityHoursPerWeek",
              clamp(Math.round(v), 0, 168),
            )
          }
          step={1}
          suffix="hr/wk"
          hint="<4 → defer · <8 → Path C downgrade"
        />
        <SelectInput
          label="SKU archetype"
          value={inputs.skuArchetypeDistribution}
          onChange={(v) => patch("skuArchetypeDistribution", v)}
          options={[
            { value: "hero_mid_long_tail", label: "Hero / Mid / Long-tail" },
            { value: "balanced", label: "Balanced" },
            { value: "long_tail_heavy", label: "Long-tail heavy" },
          ]}
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
          hint="luxury w/o Originality.ai → downgrade · B2B w/o Ahrefs → downgrade"
        />
      </div>

      {/* ===== PLATFORM-INTEGRATION BOOLEANS ===== */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Platform integrations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <BooleanToggle
            label="Pinterest-Business-Account"
            value={inputs.hasPinterestBusinessAccount}
            onChange={(v) => patch("hasPinterestBusinessAccount", v)}
            hint="No → defer (canonical prereq)"
            positiveColor="emerald"
            negativeColor="rose"
          />
          <BooleanToggle
            label="Shopify-SEO app"
            value={inputs.hasShopifySeoApp}
            onChange={(v) => patch("hasShopifySeoApp", v)}
            hint="No → defer (canonical prereq)"
            positiveColor="emerald"
            negativeColor="rose"
          />
          <BooleanToggle
            label="Surfer-SEO"
            value={inputs.hasSurferSeoSubscription}
            onChange={(v) => patch("hasSurferSeoSubscription", v)}
            hint="Path B/C: Pro $89/mo"
          />
          <BooleanToggle
            label="Ahrefs-Content-Gap"
            value={inputs.hasAhrefsContentGap}
            onChange={(v) => patch("hasAhrefsContentGap", v)}
            hint="B2B w/o this → downgrade"
          />
          <BooleanToggle
            label="Originality.ai"
            value={inputs.hasOriginalityAiSubscription}
            onChange={(v) => patch("hasOriginalityAiSubscription", v)}
            hint="Luxury w/o this → downgrade"
          />
          <BooleanToggle
            label="MarketMuse"
            value={inputs.hasMarketmuseTopicalAuthority}
            onChange={(v) => patch("hasMarketmuseTopicalAuthority", v)}
            hint="Path B: Starter $300/mo"
          />
        </div>
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
            <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider">
              Year-1 ROI {rec.year1RoiLow.toFixed(0)}:1 –{" "}
              {rec.year1RoiHigh.toFixed(0)}:1
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.justification}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Default platform pick:
            </span>{" "}
            {rec.defaultPlatformPick}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Platform scope ({rec.platforms.length}):
            </span>{" "}
            {rec.platforms.join(" · ")}
          </p>
        </div>

        {/* 4-tile primary output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 incremental Pinterest-SEO traffic
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalPinterestSeoTrafficLow)}–
              {fmtUsdShort(rec.year1IncrementalPinterestSeoTrafficHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.year1IncrementalPinterestSeoTrafficSharePctLow.toFixed(1)}–
              {rec.year1IncrementalPinterestSeoTrafficSharePctHigh.toFixed(1)}%
              of US DTC GMV
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
              CAC vs paid-social multiplier
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.cacVsPaidSocialMultiplierLow.toFixed(2)}×–
              {rec.cacVsPaidSocialMultiplierHigh.toFixed(2)}×
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Pinterest-CVR +{rec.pinterestCvrUpliftLow.toFixed(1)}×
              –{rec.pinterestCvrUpliftHigh.toFixed(1)}×
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Compounding-curve steady-state
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.compoundingTrafficCurveMonthsLow}–
              {rec.compoundingTrafficCurveMonthsHigh} mo
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              organic-traffic growth +{rec.organicTrafficGrowthMultipleLow.toFixed(0)}×
              –{rec.organicTrafficGrowthMultipleHigh.toFixed(0)}×
            </div>
          </div>
        </div>

        {/* 5-pillar organic-content matrix (per voice) */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            5-pillar organic-content matrix · {inputs.voiceProfile} voice
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            {Object.entries(rec.organicContentPillarMatrix).map(
              ([pillar, value]) => (
                <li key={pillar} className="space-y-0.5">
                  <div className="font-medium text-foreground/80">
                    {pillar}
                  </div>
                  <div className="pl-3">{value}</div>
                </li>
              ),
            )}
          </ul>
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
              scripts/pinterest_seo_unit_economics.py
            </code>{" "}
            — Move #17 Pinterest-SEO track.
          </span>
        </div>
      </div>
    </div>
  );
}