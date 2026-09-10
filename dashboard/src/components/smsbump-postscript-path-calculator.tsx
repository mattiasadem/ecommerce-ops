"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrandSmsbumpPostscriptInputs,
  PathName,
  PathRecommendation,
  PerPathRevenue,
  SMSBUMP_POSTSCRIPT_DEFAULTS,
  VoiceProfile,
  pathBadgeClasses,
  pathLongLabel,
  projectPerPathRevenue,
  recommendPath,
  renderSmsbumpPostscriptMarkdown,
  validateSmsbumpPostscriptInputs,
} from "@/lib/smsbump-postscript-channel-orchestration";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive SMSBump + Postscript Channel Orchestration Path A / B / C scorer.
 *
 * Direct browser port of `scripts/smsbump_postscript_channel_orchestration_unit_economics.py`.
 * The operator enters 12 inputs (US DTC GMV, international GMV share %, SMS
 * list size, 6 prerequisite boolean toggles, voice profile, dedicated
 * SMS-orchestration-team hr/wk, SMS-orchestration-creative-baseline) and the
 * panel picks one of the 3 canonical paths (A / B / C) with the cost stack +
 * Year-1 incremental SMS-orchestration-revenue band + SMS-list-growth-rate
 * vs Postscript-only + SMS-deliverability vs Postscript-only baseline +
 * SMS-cohort-LTV-multiplier vs Postscript-only + SMS-orchestration-build-cycle
 * months + the 5-pillar framework + 6-step build sequence for the recommended
 * path.
 *
 * Defaults match the Python CLI's $5M US DTC + 10% international + 100k SMS
 * list Path B default (all 8 SMSBump + Postscript prereqs wired; default voice;
 * 6 hr/wk dedicated team; creative baseline live). State persists to
 * localStorage (`ecom-ops:smsbump-postscript-path:v1`). Copy-report emits a
 * paste-ready markdown handoff byte-for-byte with
 * `python3 scripts/smsbump_postscript_channel_orchestration_unit_economics.py --json`
 * via `renderSmsbumpPostscriptMarkdown`.
 *
 * Mounted on `/smsbump-postscript-channel-orchestration` between the asset-23
 * card and the demoted "Future-tick companion" footer.
 */

const STORAGE_KEY = "ecom-ops:smsbump-postscript-path:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandSmsbumpPostscriptInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      usDtcGmv: clamp(Number(parsed.usDtcGmv) || 0, 0, 1_000_000_000),
      internationalGmvPct: clamp(Number(parsed.internationalGmvPct) || 0, 0, 100),
      smsListSize: clamp(Math.round(Number(parsed.smsListSize) || 0), 0, 100_000_000),
      hasPostscriptPrimary:
        parsed.hasPostscriptPrimary !== undefined
          ? Boolean(parsed.hasPostscriptPrimary)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasPostscriptPrimary,
      hasSmsbumpAccount:
        parsed.hasSmsbumpAccount !== undefined
          ? Boolean(parsed.hasSmsbumpAccount)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasSmsbumpAccount,
      hasKlaviyoSmsSegmentOverlay:
        parsed.hasKlaviyoSmsSegmentOverlay !== undefined
          ? Boolean(parsed.hasKlaviyoSmsSegmentOverlay)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasKlaviyoSmsSegmentOverlay,
      hasAttentiveEnterpriseSecondary:
        parsed.hasAttentiveEnterpriseSecondary !== undefined
          ? Boolean(parsed.hasAttentiveEnterpriseSecondary)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasAttentiveEnterpriseSecondary,
      hasDlrMonitoringWired:
        parsed.hasDlrMonitoringWired !== undefined
          ? Boolean(parsed.hasDlrMonitoringWired)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasDlrMonitoringWired,
      hasTripleWhaleSmsMerge:
        parsed.hasTripleWhaleSmsMerge !== undefined
          ? Boolean(parsed.hasTripleWhaleSmsMerge)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasTripleWhaleSmsMerge,
      voiceProfile: (parsed.voiceProfile as VoiceProfile) ?? SMSBUMP_POSTSCRIPT_DEFAULTS.voiceProfile,
      hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: clamp(
        Math.round(Number(parsed.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek) || 0),
        0,
        168,
      ),
      hasSmsOrchestrationCreativeBaseline:
        parsed.hasSmsOrchestrationCreativeBaseline !== undefined
          ? Boolean(parsed.hasSmsOrchestrationCreativeBaseline)
          : SMSBUMP_POSTSCRIPT_DEFAULTS.hasSmsOrchestrationCreativeBaseline,
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: BrandSmsbumpPostscriptInputs) {
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

export function SmsbumpPostscriptChannelOrchestrationCalculator() {
  const [inputs, setInputs] = useState<BrandSmsbumpPostscriptInputs>(
    SMSBUMP_POSTSCRIPT_DEFAULTS,
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
    () => validateSmsbumpPostscriptInputs(inputs),
    [inputs],
  );

  const rec: PathRecommendation | null = useMemo(() => {
    if (validationError) return null;
    return recommendPath(inputs);
  }, [inputs, validationError]);

  const projection: PerPathRevenue | null = useMemo(() => {
    if (!rec) return null;
    return projectPerPathRevenue(inputs, rec);
  }, [inputs, rec]);

  const patch = <K extends keyof BrandSmsbumpPostscriptInputs>(
    key: K,
    value: BrandSmsbumpPostscriptInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setInputs(SMSBUMP_POSTSCRIPT_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* quota / private mode */
    }
  };

  const seedCanonicalPass = () => {
    setInputs({
      usDtcGmv: 5_000_000,
      internationalGmvPct: 10.0,
      smsListSize: 100_000,
      hasPostscriptPrimary: true,
      hasSmsbumpAccount: true,
      hasKlaviyoSmsSegmentOverlay: true,
      hasAttentiveEnterpriseSecondary: true,
      hasDlrMonitoringWired: true,
      hasTripleWhaleSmsMerge: true,
      voiceProfile: "default",
      hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: 6,
      hasSmsOrchestrationCreativeBaseline: true,
    });
  };

  const stressTestFailAll = () => {
    setInputs({
      usDtcGmv: 250_000,
      internationalGmvPct: 1.0,
      smsListSize: 10_000,
      hasPostscriptPrimary: false,
      hasSmsbumpAccount: false,
      hasKlaviyoSmsSegmentOverlay: false,
      hasAttentiveEnterpriseSecondary: false,
      hasDlrMonitoringWired: false,
      hasTripleWhaleSmsMerge: false,
      voiceProfile: "luxury",
      hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: 1,
      hasSmsOrchestrationCreativeBaseline: false,
    });
  };

  const copyReport = () => {
    if (!rec) return;
    const text = renderSmsbumpPostscriptMarkdown(
      inputs,
      rec,
      projection ?? undefined,
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  };

  if (!rec || !projection) {
    return (
      <div
        id="smsbump-postscript-path-calculator"
        className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
      >
        <header className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            SMSBump + Postscript Channel Orchestration Path A / B / C scorer
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fix the validation error below to compute a recommendation.
          </p>
        </header>
        {validationError && (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
            ⚠ {validationError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="smsbump-postscript-path-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            SMSBump + Postscript Channel Orchestration Path A / B / C scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #19
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/smsbump_postscript_channel_orchestration_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current-SMSBump + Postscript fit inputs
          (US DTC GMV, international GMV share %, SMS list size, 6 prerequisite
          toggles, voice profile, dedicated-SMS-orchestration-team hr/wk,
          SMS-orchestration-creative-baseline) &rarr; see the canonical Path A /
          B / C recommendation with cost stack, Year-1 incremental
          SMS-orchestration-revenue band, SMS-list-growth-rate vs
          Postscript-only, SMS-deliverability vs Postscript-only baseline,
          SMS-cohort-LTV-multiplier vs Postscript-only, and the 5-pillar
          framework + 6-step build sequence for the recommended path. State
          persists to{" "}
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
          hint="<$500k → defer (Path A as audit)"
        />
        <NumberInput
          label="International GMV share"
          value={inputs.internationalGmvPct}
          onChange={(v) => patch("internationalGmvPct", clamp(v, 0, 100))}
          step={0.5}
          suffix="%"
          hint="<5% → defer SMSBump-international"
        />
        <NumberInput
          label="SMS list size"
          value={inputs.smsListSize}
          onChange={(v) =>
            patch("smsListSize", clamp(Math.round(v), 0, 100_000_000))
          }
          step={1000}
          hint="<50k → defer"
        />
        <NumberInput
          label="Dedicated SMS-orchestration team"
          value={inputs.hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek}
          onChange={(v) =>
            patch(
              "hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek",
              clamp(Math.round(v), 0, 168),
            )
          }
          step={1}
          suffix="hr/wk"
          hint="<4 → defer"
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
            { value: "luxury", label: "Luxury (needs MMS-creative-baseline)" },
            { value: "sustainable", label: "Sustainable (mission-aligned)" },
            { value: "gen_z", label: "Gen-Z (RCS-Flash-Sale-ready)" },
            { value: "b2b", label: "B2B (needs Klaviyo-SMS-segment-overlay)" },
          ]}
          hint="Luxury without creative-baseline → downgrade"
        />
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={seedCanonicalPass}
            className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
          >
            Seed canonical pass
          </button>
          <button
            type="button"
            onClick={stressTestFailAll}
            className="rounded-md border border-rose-500/50 bg-rose-500/10 px-2 py-1 text-xs font-mono text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
          >
            Stress-test FAIL all
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono hover:bg-muted"
          >
            Reset defaults
          </button>
        </div>
      </div>

      {/* ===== INPUTS — boolean toggles ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <BooleanToggle
          label="Postscript-primary"
          value={inputs.hasPostscriptPrimary}
          onChange={(v) => patch("hasPostscriptPrimary", v)}
          hint="Required (Pillar 1)"
          variant="warn"
        />
        <BooleanToggle
          label="SMSBump account"
          value={inputs.hasSmsbumpAccount}
          onChange={(v) => patch("hasSmsbumpAccount", v)}
          hint="Required (Pillar 2)"
          variant="warn"
        />
        <BooleanToggle
          label="Klaviyo SMS overlay"
          value={inputs.hasKlaviyoSmsSegmentOverlay}
          onChange={(v) => patch("hasKlaviyoSmsSegmentOverlay", v)}
          hint="Required (Pillar 1)"
          variant="warn"
        />
        <BooleanToggle
          label="DLR monitoring"
          value={inputs.hasDlrMonitoringWired}
          onChange={(v) => patch("hasDlrMonitoringWired", v)}
          hint="Required (Pillar 1+5)"
          variant="warn"
        />
        <BooleanToggle
          label="Triple Whale SMS-merge"
          value={inputs.hasTripleWhaleSmsMerge}
          onChange={(v) => patch("hasTripleWhaleSmsMerge", v)}
          hint="Required (Pillar 5)"
          variant="warn"
        />
        <BooleanToggle
          label="Attentive Enterprise (secondary)"
          value={inputs.hasAttentiveEnterpriseSecondary}
          onChange={(v) => patch("hasAttentiveEnterpriseSecondary", v)}
          hint="Path C requires"
        />
        <BooleanToggle
          label="SMS-orch creative baseline"
          value={inputs.hasSmsOrchestrationCreativeBaseline}
          onChange={(v) => patch("hasSmsOrchestrationCreativeBaseline", v)}
          hint="Luxury needs this"
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
            <RoiBadge low={rec.year1RoiLow} high={rec.year1RoiHigh} />
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
              Year-1 incr SMS-orch revenue
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1IncrementalSmsOrchestrationRevenueLow)}–
              {fmtUsdShort(rec.year1IncrementalSmsOrchestrationRevenueHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.year1IncrementalSmsOrchestrationRevenueSharePctLow.toFixed(1)}%–
              {rec.year1IncrementalSmsOrchestrationRevenueSharePctHigh.toFixed(1)}% of total GMV
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(rec.year1CostLow)}–
              {fmtUsdShort(rec.year1CostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Setup {fmtUsdShort(rec.costOneTimeLow)}–
              {fmtUsdShort(rec.costOneTimeHigh)} + recurring{" "}
              {fmtUsdShort(rec.costRecurringLow)}–
              {fmtUsdShort(rec.costRecurringHigh)}/mo
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              SMS-list-growth vs Postscript-only
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.smsListGrowthRateVsPostscriptOnlyLow.toFixed(0)}%–
              {rec.smsListGrowthRateVsPostscriptOnlyHigh.toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Mid {projection.smsListGrowthRateMid.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              SMS-cohort-LTV multiplier
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.smsCohortLtvMultiplierVsPostscriptOnlyLow.toFixed(1)}×–
              {rec.smsCohortLtvMultiplierVsPostscriptOnlyHigh.toFixed(1)}×
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Deliverability +{projection.smsDeliverabilityImprovementMid.toFixed(1)}pp
            </div>
          </div>
        </div>

        {/* Total-GMV + ROI + build-cycle tile */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total GMV base (US + international)
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(projection.totalGmvBase)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              US {fmtUsdShort(inputs.usDtcGmv)} + intl{" "}
              {fmtUsdShort(projection.internationalGmv)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 ROI (full cost stack)
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1RoiLow.toFixed(1)}:1 – {rec.year1RoiHigh.toFixed(1)}:1
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Mid {projection.year1RoiMidFinal.toFixed(1)}:1 (band mid{" "}
              {projection.year1RoiMidBand.toFixed(1)}:1)
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              SMS-orch build-cycle
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.smsOrchestrationBuildCycleMonthsLow}–
              {rec.smsOrchestrationBuildCycleMonthsHigh} mo
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {rec.smsOrchestrationBuildCycleMonthsLow >= 12
                ? "Path C = enterprise"
                : rec.smsOrchestrationBuildCycleMonthsLow >= 6
                  ? "Path B = mid-tier"
                  : "Path A = starter"}
            </div>
          </div>
        </div>

        {/* 5-pillar framework */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            5-pillar SMSBump + Postscript-channel-orchestration framework
          </div>
          <ol className="space-y-1.5 list-decimal list-inside">
            {Object.entries(rec.smsbumpPostscriptPillarMatrix).map(
              ([pillar, desc]: [string, string]) => (
                <li key={pillar} className="text-[11px] leading-snug">
                  <span className="font-mono font-semibold">{pillar}</span>
                  <p className="text-muted-foreground mt-0.5 ml-5">{desc}</p>
                </li>
              ),
            )}
          </ol>
        </div>

        {/* 6-step build sequence */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            6-step build sequence (Path {rec.path})
          </div>
          <ol className="space-y-1 list-decimal list-inside">
            {rec.buildSequence.map((step: string, i: number) => (
              <li key={i} className="text-[11px] leading-snug text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Copy report */}
        <div className="flex items-center justify-end gap-2">
          <CopyButton
            value={renderSmsbumpPostscriptMarkdown(inputs, rec, projection)}
            label="Copy SMSBump + Postscript report"
            className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent hover:bg-accent/20"
          />
          <button
            type="button"
            onClick={copyReport}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-mono text-muted-foreground hover:bg-muted"
          >
            Copy via clipboard
          </button>
          <span className="text-[10px] text-muted-foreground">
            Total GMV base {fmtUsdFull(projection.totalGmvBase)}
          </span>
        </div>
      </div>
    </div>
  );
}
