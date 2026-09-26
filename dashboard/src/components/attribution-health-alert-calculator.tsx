"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ATTRIBUTION_ALERT_DEFAULTS,
  AttributionAlertForecast,
  AttributionAlertInputs,
  AttributionAlertPath,
  MOVE68_CADENCE_OPTIONS,
  TEAM_SIZE_OPTIONS,
  VOICE_PROFILE_OPTIONS,
  forecastAttributionAlert,
  renderAttributionAlertMarkdown,
  validateAttributionAlertInputs,
} from "@/lib/attribution-health-alert";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/**
 * Interactive Attribution-Health Alert Webhook calculator — Playbook 06.10 (Move #6.10).
 *
 * Direct browser port of `scripts/attribution_health_alert_unit_economics.py`
 * (the Move #6.10 Path A/B/C/D/E scorer). The operator enters:
 *
 *   - Volume: paid-spend monthly USD.
 *   - Team: team_size + voice_profile + Move #6.8 cadence + on-call coverage hours/day.
 *   - Stack: has_webhook_url + has_linear_fallback + has_pagerduty_fallback
 *     + has_opsgenie_fallback.
 *   - Operational: archive storage GB/yr + cooldown seconds.
 *
 * The panel auto-picks the canonical Move #6.10 path (A / B / C / D / E) per the
 * playbook §"Which alert-cadence fits your team" + §"Cost & ROI estimate",
 * applies deferral gates (low spend / no Move #6.8 / high archive / invalid cooldown)
 * and downgrade gates (on-call coverage / luxury voice / b2b voice), then projects:
 *
 *   - Path recommendation with justification + downgrades applied.
 *   - Cost stack (one-time + recurring monthly).
 *   - Year-1 avoided incidents + incremental attribution recovery.
 *   - Year-1 net ROI band (60:1-150:1 canonical Path B at $1M-$5M GMV).
 *   - Alert cadence + recommended cooldown-seconds.
 *   - Canonical 13-field alert-payload shape + 5 webhook thresholds (pinned contract).
 *   - 5-pillar attribution-alert-webhook framework matrix.
 *   - 6-step build sequence (per-path).
 *
 * State persists to localStorage (`ecom-ops:playbooks:attribution-health-alert:v1`)
 * so the operator's real inputs survive reloads. Copy-report emits a paste-ready
 * markdown handoff (inputs → recommendation → cost stack → Year-1 outcomes →
 * justification → canonical contract → 6-step build sequence) byte-faithful
 * with the playbook §"Cost & ROI estimate".
 *
 * Mounted on `/playbooks/06.10-attribution-health-alert-webhook-launch` via
 * the `CALCULATORS` registry in `app/playbooks/[slug]/page.tsx`.
 */

const STORAGE_KEY = "ecom-ops:playbooks:attribution-health-alert:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): AttributionAlertInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      paidSpend: clamp(Number(parsed.paidSpend) || 0, 0, 10_000_000),
      teamSize: parsed.teamSize ?? ATTRIBUTION_ALERT_DEFAULTS.teamSize,
      voiceProfile: parsed.voiceProfile ?? ATTRIBUTION_ALERT_DEFAULTS.voiceProfile,
      move68Cadence: parsed.move68Cadence ?? ATTRIBUTION_ALERT_DEFAULTS.move68Cadence,
      hasWebhookUrl:
        typeof parsed.hasWebhookUrl === "boolean"
          ? parsed.hasWebhookUrl
          : ATTRIBUTION_ALERT_DEFAULTS.hasWebhookUrl,
      hasLinearFallback:
        typeof parsed.hasLinearFallback === "boolean"
          ? parsed.hasLinearFallback
          : ATTRIBUTION_ALERT_DEFAULTS.hasLinearFallback,
      hasPagerdutyFallback:
        typeof parsed.hasPagerdutyFallback === "boolean"
          ? parsed.hasPagerdutyFallback
          : ATTRIBUTION_ALERT_DEFAULTS.hasPagerdutyFallback,
      hasOpsgenieFallback:
        typeof parsed.hasOpsgenieFallback === "boolean"
          ? parsed.hasOpsgenieFallback
          : ATTRIBUTION_ALERT_DEFAULTS.hasOpsgenieFallback,
      onCallCoverageHoursPerDay: clamp(
        Math.round(Number(parsed.onCallCoverageHoursPerDay) || 0),
        0,
        24,
      ),
      alertArchiveStorageGbPerYear: clamp(
        Number(parsed.alertArchiveStorageGbPerYear) || 0,
        0,
        100,
      ),
      cooldownSeconds: clamp(
        Math.round(Number(parsed.cooldownSeconds) || 0),
        0,
        604_800,
      ),
    };
  } catch {
    return null;
  }
}

function storeInputs(inputs: AttributionAlertInputs) {
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

function fmtRoi(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n >= 1000) return `${Math.round(n)}:1`;
  return `${n.toFixed(1)}:1`;
}

function pathBadgeClasses(path: AttributionAlertPath): string {
  const map: Record<AttributionAlertPath, string> = {
    A: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
    B: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40",
    C: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40",
    D: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/40",
    E: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40",
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

function ToggleInput({
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
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "rounded-md border px-1.5 py-1 text-xs font-mono transition-colors",
          value
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        {value ? "configured" : "not configured"}
      </button>
      {hint && (
        <span className="text-[9px] text-muted-foreground leading-tight">{hint}</span>
      )}
    </label>
  );
}

function healthBadgeClasses(band: AttributionAlertForecast["healthBand"]): string {
  const map: Record<AttributionAlertForecast["healthBand"], string> = {
    great: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
    good: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40",
    marginal:
      "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40",
    weak: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40",
    defer: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40",
    "no-cost":
      "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40",
  };
  return map[band];
}

function healthLabel(band: AttributionAlertForecast["healthBand"]): string {
  switch (band) {
    case "great":
      return "Great (>=100:1 mid ROI)";
    case "good":
      return "Good (50-100:1 mid ROI)";
    case "marginal":
      return "Marginal (25-50:1 mid ROI)";
    case "weak":
      return "Weak (<25:1 mid ROI)";
    case "defer":
      return "Deferred (re-evaluate later)";
    case "no-cost":
      return "Zero-cost (hermetic local-archive)";
  }
}

export function AttributionHealthAlertCalculator() {
  const [inputs, setInputs] = useState<AttributionAlertInputs>(
    ATTRIBUTION_ALERT_DEFAULTS,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(() => {
    const errs = validateAttributionAlertInputs(inputs);
    return errs.length > 0 ? errs[0] : null;
  }, [inputs]);

  const forecast = useMemo(() => {
    if (validationError) return forecastAttributionAlert(ATTRIBUTION_ALERT_DEFAULTS);
    return forecastAttributionAlert(inputs);
  }, [inputs, validationError]);

  function patch<K extends keyof AttributionAlertInputs>(
    key: K,
    value: AttributionAlertInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(ATTRIBUTION_ALERT_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderAttributionAlertMarkdown(inputs, forecast);
  }, [inputs, forecast, validationError]);

  return (
    <div
      id="attribution-health-alert-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Attribution-health alert path calculator
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #6.10
          </span>
          <span className={pathBadgeClasses(forecast.path)}>
            Path {forecast.path}
          </span>
          <span className={healthBadgeClasses(forecast.healthBand)}>
            {healthLabel(forecast.healthBand)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pick your monthly paid-spend + team size + alerting stack. The panel
          auto-recommends the canonical Move #6.10 path (A / B / C / D / E
          from{" "}
          <code className="rounded bg-muted px-1">
            playbooks/06.10-attribution-health-alert-webhook-launch.md
          </code>
          ) with deferral gates (low spend / no Move #6.8 / high archive /
          invalid cooldown) and downgrade gates (on-call coverage / luxury
          voice / b2b voice), then projects the cost stack (one-time + monthly
          recurring), Year-1 avoided incidents + incremental attribution
          recovery, Year-1 net ROI band, alert cadence, canonical 13-field
          alert-payload shape, 5 canonical webhook thresholds, and the 6-step
          build sequence. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS — volume ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <NumberInput
          label="Monthly paid-spend"
          value={inputs.paidSpend}
          onChange={(v) => patch("paidSpend", clamp(v, 0, 10_000_000))}
          step={1000}
          suffix="$/mo"
          hint="Drives Path E/A/B/C/D tier"
        />
        <NumberInput
          label="On-call coverage"
          value={inputs.onCallCoverageHoursPerDay}
          onChange={(v) =>
            patch("onCallCoverageHoursPerDay", clamp(Math.round(v), 0, 24))
          }
          step={1}
          suffix="hr/day"
          hint="Path C ≥ 8 hr/day; Path D ≥ 24 hr/day"
        />
      </div>

      {/* ===== INPUTS — team + voice + cadence ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <SelectInput
          label="Team size"
          value={inputs.teamSize}
          onChange={(v) => patch("teamSize", v)}
          options={TEAM_SIZE_OPTIONS}
          hint="Drives path downgrade on coverage"
        />
        <SelectInput
          label="Voice profile"
          value={inputs.voiceProfile}
          onChange={(v) => patch("voiceProfile", v)}
          options={VOICE_PROFILE_OPTIONS}
          hint="Luxury/B2B trigger voice downgrades"
        />
        <SelectInput
          label="Move #6.8 cadence"
          value={inputs.move68Cadence}
          onChange={(v) => patch("move68Cadence", v)}
          options={MOVE68_CADENCE_OPTIONS}
          hint="Move #6.8 must run before Move #6.10"
        />
      </div>

      {/* ===== INPUTS — alerting stack ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ToggleInput
          label="Slack webhook URL"
          value={inputs.hasWebhookUrl}
          onChange={(v) => patch("hasWebhookUrl", v)}
          hint="Required for Path B/C/D"
        />
        <ToggleInput
          label="Linear fallback"
          value={inputs.hasLinearFallback}
          onChange={(v) => patch("hasLinearFallback", v)}
          hint="Required for B2B voice"
        />
        <ToggleInput
          label="PagerDuty fallback"
          value={inputs.hasPagerdutyFallback}
          onChange={(v) => patch("hasPagerdutyFallback", v)}
          hint="Required for Path C/D"
        />
        <ToggleInput
          label="Opsgenie fallback"
          value={inputs.hasOpsgenieFallback}
          onChange={(v) => patch("hasOpsgenieFallback", v)}
          hint="Required for Path D"
        />
      </div>

      {/* ===== INPUTS — operational ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <NumberInput
          label="Alert archive storage"
          value={inputs.alertArchiveStorageGbPerYear}
          onChange={(v) =>
            patch("alertArchiveStorageGbPerYear", clamp(v, 0, 100))
          }
          step={0.5}
          suffix="GB/yr"
          hint="Above 10 GB/yr defers (rotate)"
        />
        <NumberInput
          label="Cooldown seconds"
          value={inputs.cooldownSeconds}
          onChange={(v) =>
            patch("cooldownSeconds", clamp(Math.round(v), 0, 604_800))
          }
          step={60}
          suffix="s"
          hint="Canonical Path B = 3600"
        />
        <div className="flex items-end text-[10px] text-muted-foreground leading-tight">
          All inputs validated client-side. Tweak any field — entire grid
          + path + Year-1 ROI + cadence + canonical contract recompute
          instantly.
        </div>
      </div>

      {validationError && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          ⚠ {validationError}
        </div>
      )}

      {/* ===== OUTPUTS ===== */}
      <div className="space-y-3">
        {/* Recommendation strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recommendation
            </span>
            <span className={pathBadgeClasses(forecast.path)}>
              Path {forecast.path}
            </span>
            <span className="text-xs font-medium">{forecast.pathLabel}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Alert cadence:
            </span>{" "}
            {forecast.alertCadence}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Cooldown (recommended):
            </span>{" "}
            {forecast.cooldownSecondsRecommended.toLocaleString("en-US")}s
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider">
              Justification:
            </span>{" "}
            {forecast.justification}
          </p>
          {forecast.downgrades.length > 0 && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono">
                Downgrades applied
              </span>
              <ul className="text-[10px] text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
                {forecast.downgrades.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {forecast.deferredFor.length > 0 && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300 font-mono">
                Deferral gates triggered: {forecast.deferredFor.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* 4-tile cost strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              One-time setup
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.costOneTimeLow)}–
              {fmtUsdShort(forecast.costOneTimeHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              setup + provisioning
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recurring monthly
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.costRecurringLow)}–
              {fmtUsdShort(forecast.costRecurringHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              tools + on-call overhead
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.year1CostLow)}–
              {fmtUsdShort(forecast.year1CostHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              setup + 12 × recurring
            </div>
          </div>
          <div
            className={cn(
              "rounded-md border p-2",
              forecast.path === "E"
                ? "border-rose-500/40 bg-rose-500/5"
                : forecast.healthBand === "great" || forecast.healthBand === "good" || forecast.healthBand === "no-cost"
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-amber-500/40 bg-amber-500/5",
            )}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 net ROI
            </div>
            <div
              className={cn(
                "text-base font-semibold tabular-nums",
                forecast.path === "E"
                  ? "text-rose-700 dark:text-rose-300"
                  : forecast.healthBand === "great" || forecast.healthBand === "good" || forecast.healthBand === "no-cost"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300",
              )}
            >
              {fmtRoi(forecast.year1NetRoiLow)}–{fmtRoi(forecast.year1NetRoiHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              recovery ÷ year-1 cost
            </div>
          </div>
        </div>

        {/* 4-tile avoided-incidents strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 avoided incidents
            </div>
            <div className="text-base font-semibold tabular-nums">
              {forecast.year1AvoidedIncidentsLow}–
              {forecast.year1AvoidedIncidentsHigh}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              attribution regressions caught
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recovery per incident
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(
                forecast.year1AvoidedIncidentsLow > 0
                  ? forecast.year1IncrementalAttributionRecoveryLow /
                      forecast.year1AvoidedIncidentsLow
                  : 0,
              )}–
              {fmtUsdShort(
                forecast.year1AvoidedIncidentsHigh > 0
                  ? forecast.year1IncrementalAttributionRecoveryHigh /
                      forecast.year1AvoidedIncidentsHigh
                  : 0,
              )}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              avoided revenue drift
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 recovery total
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdShort(forecast.year1IncrementalAttributionRecoveryLow)}–
              {fmtUsdShort(forecast.year1IncrementalAttributionRecoveryHigh)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              incidents × per-incident
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Platforms in scope
            </div>
            <div className="text-base font-semibold tabular-nums">
              {forecast.platforms.length}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              Slack + Linear + PagerDuty + Opsgenie + scripts
            </div>
          </div>
        </div>

        {/* Platforms strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Platform stack for Path {forecast.path}
          </div>
          <ul className="text-xs text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
            {forecast.platforms.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
            <span className="font-mono uppercase tracking-wider">
              Default pick:
            </span>{" "}
            {forecast.defaultPlatformPick}
          </p>
        </div>

        {/* Canonical contract strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Canonical 13-field alert-payload shape (pinned)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {forecast.canonicalAlertPayloadFields.map((field) => (
              <span
                key={field}
                className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {field}
              </span>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground pt-2">
            Canonical 5-field webhook thresholds (pinned)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            {Object.entries(forecast.canonicalWebhookThresholds).map(([k, v]) => (
              <span
                key={k}
                className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {k}: {typeof v === "boolean" ? String(v) : v.toLocaleString("en-US")}
              </span>
            ))}
          </div>
        </div>

        {/* 5-pillar strip */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            5-pillar attribution-alert-webhook framework
          </div>
          <ul className="text-xs text-muted-foreground leading-relaxed space-y-2 list-none">
            {Object.entries(forecast.attributionAlertPillarMatrix).map(
              ([pillar, desc]) => (
                <li key={pillar} className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-accent">
                    {pillar}
                  </span>
                  <p className="text-xs">{desc}</p>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* 6-step build sequence */}
        <div className="rounded-md border border-border bg-background/50 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            6-step build sequence for Path {forecast.path}
          </div>
          <ol className="text-xs text-muted-foreground leading-relaxed space-y-1 list-decimal pl-4">
            {forecast.buildSequence.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <CopyButton value={report} label="Copy report" />
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted transition-colors"
          >
            Reset to canonical Path B defaults
          </button>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Year-1 net ROI {fmtRoi(forecast.year1NetRoiLow)}–
            {fmtRoi(forecast.year1NetRoiHigh)}
          </span>
        </div>
      </div>
    </div>
  );
}
