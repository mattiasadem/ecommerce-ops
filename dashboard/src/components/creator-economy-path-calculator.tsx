"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandCreatorEconomyInputs,
  CREATOR_ECONOMY_DEFAULTS,
  PathName,
  PathRecommendation,
  SkuArchetypeDistribution,
  VoiceProfile,
  pathBadgeClasses,
  pathLongLabel,
  recommendCreatorEconomyPath,
  renderCreatorEconomyMarkdown,
  validateCreatorEconomyInputs,
} from "@/lib/creator-economy";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive creator-economy Path A / B / C scorer.
 *
 * Direct browser port of `scripts/creator_economy_unit_economics.py`. The
 * operator enters 12 inputs (US DTC GMV, SKU count, SKU archetype distribution,
 * gross margin %, has-Aspire/Collabstr, has-GRIN/CreatorIQ, has-creator-tier-
 * mix-baseline, has-content-licensing-template, has-whitelisting-ads-template,
 * has-Triple-Whale-creator-cohort-overlay, voice profile, operator capacity
 * hr/wk) and the panel picks one of the 3 canonical paths (A / B / C) with
 * the cost stack + Year-1 incremental creator-economy-revenue band +
 * LTV multiplier band + active-creator-count band + content-licensing 2-4×
 * uplift band + 5-way-comparison-correction band + 5-payout-creator-economy-
 * structures matrix + 6-step build sequence for the recommended path.
 *
 * Defaults match the Python CLI's $2M US DTC Path B default ($2M GMV, 35 SKUs,
 * hero_mid_long_tail archetype, 50% gross margin, Aspire-or-Collabstr account,
 * no GRIN/CreatorIQ, creator-tier-mix-baseline yes, content-licensing + whitelisting
 * both drafted, no Triple-Whale-creator-cohort-overlay, Gen-Z voice, 6 hr/wk
 * operator). State persists to localStorage
 * (`ecom-ops:creator-economy-path:v1`). Copy-report emits a paste-ready
 * markdown handoff byte-for-byte with
 * `python3 scripts/creator_economy_unit_economics.py` via
 * `renderCreatorEconomyMarkdown`.
 *
 * Mounted on `/creators` between the Path B default ROI card row and the
 * 4-phase ladder card.
 */

const STORAGE_KEY = "ecom-ops:creator-economy-path:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandCreatorEconomyInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usDtcGmv: clamp(Number(parsed.usDtcGmv) || 0, 0, 1_000_000_000),
      skuCount: clamp(Math.round(Number(parsed.skuCount) || 0), 0, 10_000),
      skuArchetypeDistribution:
        (parsed.skuArchetypeDistribution as SkuArchetypeDistribution) ??
        CREATOR_ECONOMY_DEFAULTS.skuArchetypeDistribution,
      grossMarginPct: clamp(
        Number(parsed.grossMarginPct) || 0,
        0,
        100,
      ),
      hasAspireOrCollabstrAccount:
        parsed.hasAspireOrCollabstrAccount !== undefined
          ? Boolean(parsed.hasAspireOrCollabstrAccount)
          : CREATOR_ECONOMY_DEFAULTS.hasAspireOrCollabstrAccount,
      hasGrinOrCreatoriqAccount:
        parsed.hasGrinOrCreatoriqAccount !== undefined
          ? Boolean(parsed.hasGrinOrCreatoriqAccount)
          : CREATOR_ECONOMY_DEFAULTS.hasGrinOrCreatoriqAccount,
      hasCreatorTierMixBaseline:
        parsed.hasCreatorTierMixBaseline !== undefined
          ? Boolean(parsed.hasCreatorTierMixBaseline)
          : CREATOR_ECONOMY_DEFAULTS.hasCreatorTierMixBaseline,
      hasContentLicensingTemplate:
        parsed.hasContentLicensingTemplate !== undefined
          ? Boolean(parsed.hasContentLicensingTemplate)
          : CREATOR_ECONOMY_DEFAULTS.hasContentLicensingTemplate,
      hasWhitelistingAdsTemplate:
        parsed.hasWhitelistingAdsTemplate !== undefined
          ? Boolean(parsed.hasWhitelistingAdsTemplate)
          : CREATOR_ECONOMY_DEFAULTS.hasWhitelistingAdsTemplate,
      hasTripleWhaleCreatorCohortOverlay:
        parsed.hasTripleWhaleCreatorCohortOverlay !== undefined
          ? Boolean(parsed.hasTripleWhaleCreatorCohortOverlay)
          : CREATOR_ECONOMY_DEFAULTS.hasTripleWhaleCreatorCohortOverlay,
      voiceProfile:
        (parsed.voiceProfile as VoiceProfile) ??
        CREATOR_ECONOMY_DEFAULTS.voiceProfile,
      hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek: clamp(
        Math.round(
          Number(parsed.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek) ||
            0,
        ),
        0,
        80,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandCreatorEconomyInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // localStorage may be unavailable (e.g. private mode); silently no-op.
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
  variant = "neutral",
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
  variant?: "neutral" | "warn";
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors",
        value
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : variant === "warn"
            ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
      title={hint}
    >
      <span className="text-[10px] uppercase tracking-wider font-mono">{label}</span>
      <span className="text-xs font-semibold">{value ? "✓ Yes" : "✗ No"}</span>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>
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

function RoiBadge({ low, high }: { low: number; high: number }) {
  const mid = (low + high) / 2;
  if (mid >= 8) {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
        Strong (≥8:1 mid)
      </span>
    );
  }
  if (mid >= 5) {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40">
        Solid (5-8:1 mid)
      </span>
    );
  }
  if (mid >= 3) {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
        Fair (3-5:1 mid)
      </span>
    );
  }
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40">
      Weak (&lt;3:1 mid)
    </span>
  );
}

export function CreatorEconomyPathCalculator() {
  const [inputs, setInputs] = useState<BrandCreatorEconomyInputs>(
    CREATOR_ECONOMY_DEFAULTS,
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
    () => validateCreatorEconomyInputs(inputs),
    [inputs],
  );

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendCreatorEconomyPath(CREATOR_ECONOMY_DEFAULTS);
    return recommendCreatorEconomyPath(inputs);
  }, [inputs, validationError]);

  const report = useMemo(() => {
    if (validationError) {
      return renderCreatorEconomyMarkdown(
        CREATOR_ECONOMY_DEFAULTS,
        recommendCreatorEconomyPath(CREATOR_ECONOMY_DEFAULTS),
      );
    }
    return renderCreatorEconomyMarkdown(inputs, rec);
  }, [inputs, rec, validationError]);

  function patch<K extends keyof BrandCreatorEconomyInputs>(
    key: K,
    next: BrandCreatorEconomyInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: next }));
  }

  function resetDefaults() {
    setInputs(CREATOR_ECONOMY_DEFAULTS);
  }

  return (
    <div
      id="creator-economy-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Creator-economy Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #19
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/creator_economy_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current-creator-economy-fit inputs (US DTC
          GMV, SKU count, SKU archetype distribution, gross margin %,
          has-Aspire/Collabstr account, has-GRIN/CreatorIQ, has-creator-tier-mix-baseline,
          has-content-licensing-template, has-whitelisting-ads-template,
          has-Triple-Whale-creator-cohort-overlay, voice profile, operator
          capacity hr/wk) &rarr; see the canonical Path A / B / C
          recommendation with cost stack, Year-1 incremental creator-economy
          revenue band, LTV multiplier band, active creator count band,
          content-licensing 2-4× uplift band, 5-way-comparison-correction band,
          5-payout-creator-economy-structures matrix, and the 6-step build
          sequence for the recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS — numeric ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US DTC GMV"
          value={inputs.usDtcGmv}
          onChange={(v) => patch("usDtcGmv", clamp(v, 0, 1_000_000_000))}
          step={10000}
          suffix="$"
          hint="<$100k → defer (Path A as audit)"
        />
        <NumberInput
          label="SKU count"
          value={inputs.skuCount}
          onChange={(v) => patch("skuCount", clamp(Math.round(v), 0, 10_000))}
          step={1}
          hint="<10 → defer (creator-tier-mix-baseline)"
        />
        <NumberInput
          label="Gross margin"
          value={inputs.grossMarginPct}
          onChange={(v) => patch("grossMarginPct", clamp(v, 0, 100))}
          step={1}
          suffix="%"
          hint="<25% → defer (creator-CPS break-even)"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek}
          onChange={(v) =>
            patch(
              "hasDedicatedCreatorEconomyManagerCapacityHoursPerWeek",
              clamp(Math.round(v), 0, 80),
            )
          }
          step={1}
          suffix="hr/wk"
          hint="<4 hr/wk → defer (Path B minimum)"
        />
      </div>

      {/* ===== INPUTS — selects ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SelectInput
          label="SKU archetype distribution"
          value={inputs.skuArchetypeDistribution}
          options={[
            { value: "hero_mid_long_tail", label: "Hero / Mid / Long-tail" },
            { value: "balanced", label: "Balanced" },
            { value: "long_tail_heavy", label: "Long-tail heavy" },
          ]}
          onChange={(v) => patch("skuArchetypeDistribution", v)}
          hint="hero_mid_long_tail = canonical 60/30/10 mix per research/12"
        />
        <SelectInput
          label="Voice profile"
          value={inputs.voiceProfile}
          options={[
            { value: "default", label: "Default" },
            { value: "luxury", label: "Luxury (MAP-policy-guardrails)" },
            { value: "sustainable", label: "Sustainable (mission-aligned)" },
            { value: "gen_z", label: "Gen-Z (short-form amplification)" },
            { value: "b2b", label: "B2B (case-study rights)" },
          ]}
          onChange={(v) => patch("voiceProfile", v)}
          hint="5 voices → 5-payout creator-economy matrix"
        />
      </div>

      {/* ===== INPUTS — boolean toggles ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
        <BooleanToggle
          label="Aspire / Collabstr"
          value={inputs.hasAspireOrCollabstrAccount}
          onChange={(v) => patch("hasAspireOrCollabstrAccount", v)}
          hint="creator-discovery-platform-account (Path A baseline)"
        />
        <BooleanToggle
          label="GRIN / CreatorIQ"
          value={inputs.hasGrinOrCreatoriqAccount}
          onChange={(v) => patch("hasGrinOrCreatoriqAccount", v)}
          hint="enterprise-CRM (Path C prereq $5M+)"
        />
        <BooleanToggle
          label="Creator-tier-mix audit"
          value={inputs.hasCreatorTierMixBaseline}
          onChange={(v) => patch("hasCreatorTierMixBaseline", v)}
          hint="60/30/10 micro/mid/macro baseline"
        />
        <BooleanToggle
          label="Content-licensing template"
          value={inputs.hasContentLicensingTemplate}
          onChange={(v) => patch("hasContentLicensingTemplate", v)}
          hint="3-clause template drafted with legal counsel"
          variant="warn"
        />
        <BooleanToggle
          label="Whitelisting-ads template"
          value={inputs.hasWhitelistingAdsTemplate}
          onChange={(v) => patch("hasWhitelistingAdsTemplate", v)}
          hint="Meta Brand Collabs + TikTok Creator Marketplace"
        />
        <BooleanToggle
          label="Triple-Whale creator-cohort"
          value={inputs.hasTripleWhaleCreatorCohortOverlay}
          onChange={(v) => patch("hasTripleWhaleCreatorCohortOverlay", v)}
          hint="5-way-comparison cycle substrate"
          variant="warn"
        />
      </div>

      {validationError && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {validationError} (showing defaults)
        </div>
      )}

      {/* ===== OUTPUT — recommendation ===== */}
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recommendation
            </span>
            <span className={pathBadgeClasses(rec.path as PathName)}>
              Path {rec.path}
            </span>
            <span className="text-xs text-muted-foreground">
              {pathLongLabel(rec.path as PathName)}
            </span>
            <RoiBadge low={rec.year1RoiLow} high={rec.year1RoiHigh} />
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              Default platform pick:{" "}
            </span>
            {rec.defaultPlatformPick}
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            {rec.justification}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Year-1 incremental creator-economy revenue
              </div>
              <div className="text-base font-semibold tabular-nums">
                {fmtUsdShort(rec.year1IncrementalCreatorEconomyRevenueLow)} –{" "}
                {fmtUsdShort(rec.year1IncrementalCreatorEconomyRevenueHigh)}
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {rec.year1IncrementalCreatorEconomyRevenueSharePctLow.toFixed(1)}%
                –{rec.year1IncrementalCreatorEconomyRevenueSharePctHigh.toFixed(1)}%
                of US DTC GMV
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Year-1 cost stack
              </div>
              <div className="text-base font-semibold tabular-nums">
                {fmtUsdShort(rec.year1CostLow)} – {fmtUsdShort(rec.year1CostHigh)}
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                setup {fmtUsdShort(rec.costOneTimeLow)} –{" "}
                {fmtUsdShort(rec.costOneTimeHigh)} + monthly{" "}
                {fmtUsdShort(rec.costRecurringLow)} –{" "}
                {fmtUsdShort(rec.costRecurringHigh)}
              </div>
            </div>
          </div>
        </div>

        {/* Per-band grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              LTV multiplier
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {rec.ltvMultiplierLow.toFixed(1)}× –{" "}
              {rec.ltvMultiplierHigh.toFixed(1)}×
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Active creators
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {rec.activeCreatorCountLow} – {rec.activeCreatorCountHigh}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Content-licensing uplift
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {rec.contentLicensing2xTo4xUpliftLow.toFixed(1)}× –{" "}
              {rec.contentLicensing2xTo4xUpliftHigh.toFixed(1)}×
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              5-way-comparison correction
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {rec.fiveWayComparisonCreatorEconomyAttributionCorrectionPctLow.toFixed(0)}%
              –{rec.fiveWayComparisonCreatorEconomyAttributionCorrectionPctHigh.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Platforms list */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Platforms in scope ({rec.platforms.length})
          </div>
          <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            {rec.platforms.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </div>

        {/* 5-payout creator-economy-structures matrix */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            5-payout creator-economy-structures matrix (research/12 Pillar 2 + asset 20)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {Object.entries(rec.creatorPayoutStructureMatrix).map(
              ([voice, structureDesc]) => {
                const isCurrent = voice === inputs.voiceProfile;
                return (
                  <div
                    key={voice}
                    className={cn(
                      "rounded border p-1.5 text-[10px] leading-snug",
                      isCurrent
                        ? "border-accent/60 bg-accent/10 text-foreground font-medium"
                        : "border-border bg-background/30 text-muted-foreground",
                    )}
                  >
                    <span className="font-mono uppercase tracking-wider">
                      {voice}
                    </span>
                    {isCurrent && (
                      <span className="ml-1 rounded bg-accent/30 px-1 text-[8px] font-mono uppercase tracking-wider">
                        current
                      </span>
                    )}
                    <div className="mt-0.5">{structureDesc}</div>
                  </div>
                );
              },
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
              scripts/creator_economy_unit_economics.py
            </code>{" "}
            — Move #19 creator-economy track.
          </span>
        </div>
      </div>
    </div>
  );
}
