"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AFFILIATE_DEFAULTS,
  BrandAffiliateInputs,
  IQZone,
  PathName,
  PathRecommendation,
  PerPathRevenue,
  VoiceProfile,
  pathBadgeClasses,
  pathLongLabel,
  projectPerPathRevenue,
  recommendPath,
  renderAffiliateMarkdown,
  validateAffiliateInputs,
} from "@/lib/affiliate";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive affiliate-program Path A / B / C scorer.
 *
 * Direct browser port of `scripts/affiliate_unit_economics.py`. The operator
 * enters 12 inputs (US DTC GMV, AOV, expected affiliate count, base commission
 * tier, voice profile, has-Triple-Whale, has-Klaviyo-post-purchase,
 * has-Smile-loyalty, has-Levanta, has-Impact, IQ zone, operator capacity
 * hr/wk) and the panel picks one of the 3 canonical paths (A / B / C) with
 * the cost stack + Year-1 attributed revenue band + LTV multiplier band +
 * affiliate count band + cookie-deprecation recovery band +
 * sustainable-mission-alignment-verifier score + 6-step build sequence for
 * the recommended path.
 *
 * Defaults match the Python CLI's $2M US DTC Path B default ($2M GMV,
 * $50 AOV, 25 expected affiliates, Sustainable voice, Triple Whale + Klaviyo
 * + Smile all wired, no Levanta, no Impact, mid IQ zone, 6 hr/wk operator).
 * State persists to localStorage (`ecom-ops:affiliate-path:v1`).
 * Copy-report emits a paste-ready markdown handoff byte-for-byte with
 * `python3 scripts/affiliate_unit_economics.py --json` via
 * `renderAffiliateMarkdown`.
 *
 * Mounted on `/affiliates` between the asset-17 card and the demoted
 * "Future-tick companion" footer.
 */

const STORAGE_KEY = "ecom-ops:affiliate-path:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandAffiliateInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usGmv: clamp(Number(parsed.usGmv) || 0, 0, 1_000_000_000),
      aov: clamp(Number(parsed.aov) || 50, 0, 10_000),
      expectedAffiliateCount: clamp(
        Math.round(Number(parsed.expectedAffiliateCount) || 0),
        0,
        10_000,
      ),
      commissionTier: clamp(Number(parsed.commissionTier) || 0, 0, 100),
      voiceProfile: (parsed.voiceProfile as VoiceProfile) ?? AFFILIATE_DEFAULTS.voiceProfile,
      hasTripleWhale:
        parsed.hasTripleWhale !== undefined
          ? Boolean(parsed.hasTripleWhale)
          : AFFILIATE_DEFAULTS.hasTripleWhale,
      hasKlaviyoPostPurchase:
        parsed.hasKlaviyoPostPurchase !== undefined
          ? Boolean(parsed.hasKlaviyoPostPurchase)
          : AFFILIATE_DEFAULTS.hasKlaviyoPostPurchase,
      hasSmileLoyalty:
        parsed.hasSmileLoyalty !== undefined
          ? Boolean(parsed.hasSmileLoyalty)
          : AFFILIATE_DEFAULTS.hasSmileLoyalty,
      hasLevanta:
        parsed.hasLevanta !== undefined ? Boolean(parsed.hasLevanta) : AFFILIATE_DEFAULTS.hasLevanta,
      hasImpact:
        parsed.hasImpact !== undefined ? Boolean(parsed.hasImpact) : AFFILIATE_DEFAULTS.hasImpact,
      iqZone: (parsed.iqZone as IQZone) ?? AFFILIATE_DEFAULTS.iqZone,
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

function storeInputs(inputs: BrandAffiliateInputs) {
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
        <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>
      )}
    </label>
  );
}

export function AffiliatePathCalculator() {
  const [inputs, setInputs] = useState<BrandAffiliateInputs>(AFFILIATE_DEFAULTS);
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
    () => validateAffiliateInputs(inputs),
    [inputs],
  );

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(AFFILIATE_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  const projection: PerPathRevenue = useMemo(() => {
    if (validationError) return projectPerPathRevenue(AFFILIATE_DEFAULTS, recommendPath(AFFILIATE_DEFAULTS));
    return projectPerPathRevenue(inputs, rec);
  }, [inputs, rec, validationError]);

  function patch<K extends keyof BrandAffiliateInputs>(
    key: K,
    value: BrandAffiliateInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(AFFILIATE_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderAffiliateMarkdown(inputs, rec, projection);
  }, [inputs, rec, projection, validationError]);

  // Detect the canonical per-path health verdict.
  const health = useMemo(() => {
    const mid = (rec.year1RoiLow + rec.year1RoiHigh) / 2;
    if (mid >= 8) return { label: "Great (≥8:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40" };
    if (mid >= 5) return { label: "Good (5-8:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40" };
    if (mid >= 3) return { label: "Fair (3-5:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40" };
    return { label: "Weak (<3:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40" };
  }, [rec.year1RoiLow, rec.year1RoiHigh]);

  return (
    <div
      id="affiliate-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Affiliate-program Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #15
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/affiliate_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current-affiliate-fit inputs (US DTC GMV,
          AOV, expected affiliate count, base commission tier, voice profile,
          has-Triple-Whale / Klaviyo-post-purchase / Smile / Levanta / Impact,
          IQ zone, operator capacity hr/wk) &rarr; see the canonical Path A / B
          / C recommendation with cost stack, Year-1 attributed revenue band,
          LTV multiplier band, affiliate count band, cookie-deprecation
          recovery band, sustainable-mission-alignment-verifier score, and the
          6-step build sequence for the recommended path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS — numeric ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="US DTC GMV"
          value={inputs.usGmv}
          onChange={(v) => patch("usGmv", clamp(v, 0, 1_000_000_000))}
          step={10000}
          suffix="$"
          hint="<$100k → defer (Path A as audit)"
        />
        <NumberInput
          label="AOV"
          value={inputs.aov}
          onChange={(v) => patch("aov", clamp(v, 0, 10_000))}
          step={1}
          suffix="$"
          hint="$0-$10k ceiling"
        />
        <NumberInput
          label="Expected affiliates (Y1)"
          value={inputs.expectedAffiliateCount}
          onChange={(v) =>
            patch("expectedAffiliateCount", clamp(Math.round(v), 0, 10_000))
          }
          step={1}
          hint="<10 → defer"
        />
        <NumberInput
          label="Commission tier (base %)"
          value={inputs.commissionTier}
          onChange={(v) => patch("commissionTier", clamp(v, 0, 100))}
          step={1}
          suffix="%"
          hint="Default 15 / Sustainable 20"
        />
        <NumberInput
          label="Operator capacity"
          value={inputs.operatorCapacityHoursPerWeek}
          onChange={(v) =>
            patch("operatorCapacityHoursPerWeek", clamp(Math.round(v), 0, 168))
          }
          step={1}
          suffix="hr/wk"
          hint="<2 → defer"
        />
      </div>

      {/* ===== INPUTS — select ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SelectInput
          label="Voice profile"
          value={inputs.voiceProfile}
          onChange={(v) => patch("voiceProfile", v)}
          options={[
            { value: "default", label: "Default (canonical balanced)" },
            { value: "luxury", label: "Luxury (lower commission, 60d cookie)" },
            { value: "sustainable", label: "Sustainable (20/25/30%, mission-aligned)" },
            { value: "gen_z", label: "Gen-Z (25/30/35%, 7d cookie impulse)" },
            { value: "b2b", label: "B2B (8-20%, 90d cookie, NET-60)" },
          ]}
          hint="Sustainable without Smile → downgrade"
        />
        <SelectInput
          label="IQ zone"
          value={inputs.iqZone}
          onChange={(v) => patch("iqZone", v)}
          options={[
            { value: "low", label: "Low (impulse-buy tier)" },
            { value: "mid", label: "Mid (canonical Path B)" },
            { value: "high", label: "High (premium buyers)" },
          ]}
          hint="Gen-Z + high → downgrade"
        />
      </div>

      {/* ===== INPUTS — boolean toggles ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <BooleanToggle
          label="Has Triple Whale"
          value={inputs.hasTripleWhale}
          onChange={(v) => patch("hasTripleWhale", v)}
          hint="Required (Pillar 3+4)"
          variant="warn"
        />
        <BooleanToggle
          label="Has Klaviyo post-purchase"
          value={inputs.hasKlaviyoPostPurchase}
          onChange={(v) => patch("hasKlaviyoPostPurchase", v)}
          hint="Required (Pillar 3 step 3)"
          variant="warn"
        />
        <BooleanToggle
          label="Has Smile loyalty"
          value={inputs.hasSmileLoyalty}
          onChange={(v) => patch("hasSmileLoyalty", v)}
          hint="Sustainable → required"
        />
        <BooleanToggle
          label="Has Levanta"
          value={inputs.hasLevanta}
          onChange={(v) => patch("hasLevanta", v)}
          hint="Path C requires"
        />
        <BooleanToggle
          label="Has Impact"
          value={inputs.hasImpact}
          onChange={(v) => patch("hasImpact", v)}
          hint="Cross-channel Path C"
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
            <span className={pathBadgeClasses(rec.path)}>Path {rec.path}</span>
            <span className="text-xs font-medium">{pathLongLabel(rec.path)}</span>
            <span className={health.classes}>{health.label}</span>
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
              Platforms in scope:
            </span>{" "}
            {rec.platforms.join(" · ")}
          </p>
        </div>

        {/* 4-tile primary output strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 attributed revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1AttributedRevenueLow)}–
              {fmtUsdShort(rec.year1AttributedRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.year1AttributedRevenueSharePctLow.toFixed(0)}%–
              {rec.year1AttributedRevenueSharePctHigh.toFixed(0)}% of US GMV
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 platform cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1CostLow)}–{fmtUsdShort(rec.year1CostHigh)}
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
              {rec.year1RoiLow.toFixed(1)}:1 – {rec.year1RoiHigh.toFixed(1)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              mid {projection.year1RoiMid.toFixed(1)}:1 (gross revenue / total cost)
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              LTV multiplier
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.ltvMultiplierLow.toFixed(1)}×–
              {rec.ltvMultiplierHigh.toFixed(1)}×
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              vs DTC baseline one-time LTV
            </div>
          </div>
        </div>

        {/* 4-tile secondary strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Active affiliates (Y1)
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1AffiliateCountLow}–{rec.year1AffiliateCountHigh}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              expected {inputs.expectedAffiliateCount} × [0.7, 1.2]
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Cookie-deprecation recovery
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.cookieDeprecationRecoveryPctLow.toFixed(0)}%–
              {rec.cookieDeprecationRecoveryPctHigh.toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              iOS 14.5+ attribution
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Mission-align score
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.sustainableMissionAlignScoreLow}–
              {rec.sustainableMissionAlignScoreHigh}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              ≥60 unlocks Tier-3 (Sustainable)
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Per-affiliate revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(projection.perAffiliateRevenueMid)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              mid / yr per active affiliate
            </div>
          </div>
        </div>

        {/* 5-voice commission-tier matrix */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            5-voice commission-tier matrix (research/09 Pillar 2 + asset 17)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {Object.entries(rec.commissionTierMatrix).map(([voice, tierDesc]) => {
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
                  <span className="font-mono uppercase tracking-wider">{voice}</span>
                  {isCurrent && (
                    <span className="ml-1 rounded bg-accent/30 px-1 text-[8px] font-mono uppercase tracking-wider">
                      current
                    </span>
                  )}
                  <div className="mt-0.5">{tierDesc}</div>
                </div>
              );
            })}
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
              scripts/affiliate_unit_economics.py
            </code>{" "}
            — Move #15 affiliate-program track.
          </span>
        </div>
      </div>
    </div>
  );
}