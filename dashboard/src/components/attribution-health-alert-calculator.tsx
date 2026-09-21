"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ATTRIBUTION_ALERT_DEFAULTS,
  ATTRIBUTION_ALERT_PILLAR_MATRIX,
  BrandAttributionAlertInputs,
  CANONICAL_WEBHOOK_THRESHOLDS,
  Move68Cadence,
  PATH_PLATFORMS,
  PathName,
  PathRecommendation,
  PerPathRecovery,
  TeamSize,
  VoiceProfile,
  pathBadgeClasses,
  pathLongLabel,
  projectPerPathRecovery,
  recommendPath,
  renderAttributionAlertMarkdown,
  validateInputs,
} from "@/lib/attribution-health-alert";
import { CopyButton } from "@/components/copy-button";
import {
  YOUR_STORE_DEFAULTS,
  YOUR_STORE_STORAGE_KEY,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { formatInt, formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Interactive Move #6.10 attribution-health-alert Path A/B/C/D/E scorer.
 *
 * Direct browser port of `scripts/attribution_health_alert_unit_economics.py`.
 * Operator enters 11 inputs (paid_spend, team_size, voice_profile, Move #6.8
 * cadence, has-webhook-url, has-Linear/PagerDuty/Opsgenie fallbacks,
 * on-call coverage hours/day, archive storage GB/yr, cooldown seconds)
 * and the panel picks Path A (hermetic-local-archive-only) / Path B DEFAULT
 * (Slack-webhook + Linear-fallback) / Path C (Slack + Linear + PagerDuty-low)
 * / Path D (PagerDuty + Opsgenie + Slack + Linear) / Path E (defer) with the
 * cost stack, Year-1 incremental attribution recovery band, Year-1 net ROI
 * band, alert cadence, cooldown-seconds-recommended, the canonical 13-field
 * alert-payload shape, the 5 canonical webhook thresholds, the 5-pillar
 * attribution-health-alert-webhook framework, and the 6-step build sequence
 * for the recommended path.
 *
 * Defaults match the Python CLI's $10k/mo Path B DEFAULT (small team,
 * default voice, weekly Move #6.8, has-webhook-url, has-Linear, no
 * PagerDuty, 8 hr/day coverage, 0.5 GB/yr storage, 3600s cooldown).
 * State persists to localStorage (`ecom-ops:attribution-health-alert:v1`).
 * Copy-report emits a paste-ready markdown handoff byte-for-byte with
 * `python3 scripts/attribution_health_alert_unit_economics.py --json` via
 * `renderAttributionAlertMarkdown`.
 *
 * Mounted on `/attribution-health-alert-archive` between the Future-tick
 * companions footer and the bottom of the page (closes the canonical
 * 5th-layer Archetype A/B hybrid Path A/B/C calculator per the
 * Future-tick companions footer + playbook/06.10 §Next moves).
 */

const STORAGE_KEY = "ecom-ops:attribution-health-alert:v1";

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function loadStored(): BrandAttributionAlertInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      paidSpend: clamp(Number(parsed.paidSpend) || 0, 0, 10_000_000),
      teamSize: (parsed.teamSize as TeamSize) ?? ATTRIBUTION_ALERT_DEFAULTS.teamSize,
      voiceProfile: (parsed.voiceProfile as VoiceProfile) ?? ATTRIBUTION_ALERT_DEFAULTS.voiceProfile,
      move68Cadence: (parsed.move68Cadence as Move68Cadence) ?? ATTRIBUTION_ALERT_DEFAULTS.move68Cadence,
      hasWebhookUrl:
        parsed.hasWebhookUrl !== undefined
          ? Boolean(parsed.hasWebhookUrl)
          : ATTRIBUTION_ALERT_DEFAULTS.hasWebhookUrl,
      hasLinearFallback:
        parsed.hasLinearFallback !== undefined
          ? Boolean(parsed.hasLinearFallback)
          : ATTRIBUTION_ALERT_DEFAULTS.hasLinearFallback,
      hasPagerdutyFallback:
        parsed.hasPagerdutyFallback !== undefined
          ? Boolean(parsed.hasPagerdutyFallback)
          : ATTRIBUTION_ALERT_DEFAULTS.hasPagerdutyFallback,
      hasOpsgenieFallback:
        parsed.hasOpsgenieFallback !== undefined
          ? Boolean(parsed.hasOpsgenieFallback)
          : ATTRIBUTION_ALERT_DEFAULTS.hasOpsgenieFallback,
      slackChannelOnCallRotationCoverageHoursPerDay: clamp(
        Math.round(
          Number(parsed.slackChannelOnCallRotationCoverageHoursPerDay) || 0,
        ),
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

function storeInputs(inputs: BrandAttributionAlertInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}

function fmtUsdFull(n: number): string {
  if (n === Infinity) return "∞";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function fmtRoi(n: number): string {
  if (n === Infinity) return "∞";
  return `${n.toFixed(1)}:1`;
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

export function AttributionHealthAlertCalculator() {
  const [inputs, setInputs] = useState<BrandAttributionAlertInputs>(
    ATTRIBUTION_ALERT_DEFAULTS,
  );
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<YourStoreInputs>(YOUR_STORE_DEFAULTS);
  const [storeIsLive, setStoreIsLive] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setInputs(stored);
    const ys = loadYourStore();
    if (ys) {
      setStore(ys);
      setStoreIsLive(true);
    }
    setHydrated(true);
  }, []);

  // Cross-tab + same-tab sync: if the operator edits Your-store on Overview
  // while this page is open, the personalized panel re-projects in place.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === YOUR_STORE_STORAGE_KEY) {
        const refreshed = loadYourStore();
        if (refreshed) {
          setStore(refreshed);
          setStoreIsLive(true);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (hydrated) storeInputs(inputs);
  }, [inputs, hydrated]);

  const validationError = useMemo(() => validateInputs(inputs), [inputs]);

  const rec: PathRecommendation = useMemo(() => {
    if (validationError) return recommendPath(ATTRIBUTION_ALERT_DEFAULTS);
    return recommendPath(inputs);
  }, [inputs, validationError]);

  const projection: PerPathRecovery = useMemo(() => {
    if (validationError)
      return projectPerPathRecovery(
        ATTRIBUTION_ALERT_DEFAULTS,
        recommendPath(ATTRIBUTION_ALERT_DEFAULTS),
      );
    return projectPerPathRecovery(inputs, rec);
  }, [inputs, rec, validationError]);

  function patch<K extends keyof BrandAttributionAlertInputs>(
    key: K,
    value: BrandAttributionAlertInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setInputs(ATTRIBUTION_ALERT_DEFAULTS);
  }

  const report = useMemo(() => {
    if (validationError) return `# Validation error: ${validationError}`;
    return renderAttributionAlertMarkdown(inputs, rec, projection);
  }, [inputs, rec, projection, validationError]);

  // Detect the canonical per-path health verdict.
  const health = useMemo(() => {
    const mid = (rec.year1NetRoiLow + rec.year1NetRoiHigh) / 2;
    if (mid === Infinity) return { label: "Great (∞:1, zero-cost)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40" };
    if (mid >= 60) return { label: "Great (≥60:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40" };
    if (mid >= 30) return { label: "Strong (30-60:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40" };
    if (mid >= 10) return { label: "Fair (10-30:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40" };
    return { label: "Weak (<10:1 mid)", classes: "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40" };
  }, [rec.year1NetRoiLow, rec.year1NetRoiHigh]);

  const allPaths: PathName[] = ["A", "B", "C", "D", "E"];

  return (
    <div
      id="attribution-health-alert-calculator"
      className="rounded-lg border-2 border-accent/40 bg-card p-4 sm:p-6 space-y-4"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold tracking-tight">
            Move #6.10 attribution-health-alert Path A/B/C/D/E scorer
          </h2>
          <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
            Interactive · Move #6.10 · 5-path
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct port of{" "}
          <code className="rounded bg-muted px-1">
            scripts/attribution_health_alert_unit_economics.py
          </code>
          . Enter your brand&rsquo;s current-Move-#6.10 alert-webhook fit
          inputs (paid spend, team size, voice profile, Move #6.8 cadence,
          has-webhook-URL, has-Linear / PagerDuty / Opsgenie fallbacks,
          on-call coverage hr/day, archive storage GB/yr, cooldown seconds)
          &rarr; see the canonical Path A / B / C / D / E recommendation
          with cost stack, Year-1 incremental attribution recovery band,
          Year-1 net ROI band, alert cadence, cooldown-seconds-recommended,
          the canonical 13-field alert-payload shape, the 5 canonical
          webhook thresholds, the 5-pillar attribution-health-alert-webhook
          framework, and the 6-step build sequence for the recommended
          path. State persists to{" "}
          <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>.
        </p>
      </header>

      {/* ===== INPUTS — numeric ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <NumberInput
          label="Paid-spend monthly"
          value={inputs.paidSpend}
          onChange={(v) => patch("paidSpend", clamp(v, 0, 10_000_000))}
          step={1000}
          suffix="$"
          hint="<$500 → Path E defer"
        />
        <NumberInput
          label="Slack on-call coverage"
          value={inputs.slackChannelOnCallRotationCoverageHoursPerDay}
          onChange={(v) =>
            patch("slackChannelOnCallRotationCoverageHoursPerDay", clamp(Math.round(v), 0, 24))
          }
          step={1}
          suffix="hr/day"
          hint="Path C≥8 / Path D≥24"
        />
        <NumberInput
          label="Archive storage"
          value={inputs.alertArchiveStorageGbPerYear}
          onChange={(v) => patch("alertArchiveStorageGbPerYear", clamp(v, 0, 100))}
          step={0.5}
          suffix="GB/yr"
          hint=">10GB → defer"
        />
        <NumberInput
          label="Cooldown seconds"
          value={inputs.cooldownSeconds}
          onChange={(v) => patch("cooldownSeconds", clamp(Math.round(v), 0, 604800))}
          step={60}
          suffix="s"
          hint="Path B canonical 3600"
        />
      </div>

      {/* ===== INPUTS — select ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <SelectInput
          label="Team size"
          value={inputs.teamSize}
          onChange={(v) => patch("teamSize", v)}
          options={[
            { value: "solo", label: "Solo operator" },
            { value: "small", label: "Small team (1-3, canonical Path B)" },
            { value: "larger", label: "Larger team (4+)" },
            { value: "enterprise", label: "Enterprise (10+, Path D)" },
          ]}
          hint="<solo> + no on-call → Path A"
        />
        <SelectInput
          label="Voice profile"
          value={inputs.voiceProfile}
          onChange={(v) => patch("voiceProfile", v)}
          options={[
            { value: "default", label: "Default (canonical balanced)" },
            { value: "luxury", label: "Luxury (PagerDuty required for Path D/C)" },
            { value: "sustainable", label: "Sustainable" },
            { value: "gen_z", label: "Gen-Z" },
            { value: "b2b", label: "B2B (Linear required for Path D/C)" },
          ]}
          hint="Luxury w/o PagerDuty → downgrade"
        />
        <SelectInput
          label="Move #6.8 cadence"
          value={inputs.move68Cadence}
          onChange={(v) => patch("move68Cadence", v)}
          options={[
            { value: "weekly", label: "Weekly (canonical Path B)" },
            { value: "daily", label: "Daily (Path C)" },
            { value: "monthly", label: "Monthly (Path A solo)" },
            { value: "none", label: "None (DEFER — Move #6.8 prerequisite)" },
          ]}
          hint="none → defer"
        />
      </div>

      {/* ===== INPUTS — boolean toggles ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <BooleanToggle
          label="Has webhook URL"
          value={inputs.hasWebhookUrl}
          onChange={(v) => patch("hasWebhookUrl", v)}
          hint="No → Path A hermetic-local-archive"
        />
        <BooleanToggle
          label="Has Linear-fallback"
          value={inputs.hasLinearFallback}
          onChange={(v) => patch("hasLinearFallback", v)}
          hint="B2B → required for Path C/D"
        />
        <BooleanToggle
          label="Has PagerDuty"
          value={inputs.hasPagerdutyFallback}
          onChange={(v) => patch("hasPagerdutyFallback", v)}
          hint="Luxury → required for Path C/D"
        />
        <BooleanToggle
          label="Has Opsgenie"
          value={inputs.hasOpsgenieFallback}
          onChange={(v) => patch("hasOpsgenieFallback", v)}
          hint="Path D enterprise"
          variant="warn"
        />
        <BooleanToggle
          label="Reset defaults"
          value={false}
          onChange={() => resetDefaults()}
          hint="Restore $10k/mo Path B defaults"
        />
      </div>

      {validationError && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          ⚠ {validationError}
        </div>
      )}

      {/* ===== OUTPUTS ===== */}
      <div className="space-y-3">
        <PersonalizedRecoveryPanel
          rec={rec}
          projection={projection}
          store={store}
          storeIsLive={storeIsLive}
        />
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
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold">Justification:</span> {rec.justification}
          </div>
        </div>

        {/* 5-way comparison strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {allPaths.map((p) => {
            const isCurrent = p === rec.path;
            const platformCount = PATH_PLATFORMS[p].length;
            return (
              <div
                key={p}
                className={cn(
                  "rounded-md border p-2 space-y-1",
                  isCurrent
                    ? "border-accent/60 bg-accent/10"
                    : "border-border bg-background/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={pathBadgeClasses(p)}>Path {p}</span>
                  {isCurrent && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-accent">
                      ★ Picked
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground leading-snug">
                  {pathLongLabel(p)}
                </div>
                <div className="text-[9px] text-muted-foreground tabular-nums">
                  {platformCount} platform{platformCount === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost + projection grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-md border border-border bg-background/30 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 cost
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdFull(rec.year1CostLow)} – {fmtUsdFull(rec.year1CostHigh)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Setup + 12 mo recurring
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/30 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Avoided incidents / yr
            </div>
            <div className="text-base font-semibold tabular-nums">
              {rec.year1AvoidedIncidentsLow} – {rec.year1AvoidedIncidentsHigh}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Attribution regressions caught
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/30 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Y1 incremental recovery
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtUsdFull(rec.year1IncrementalAttributionRecoveryLow)} –{" "}
              {fmtUsdFull(rec.year1IncrementalAttributionRecoveryHigh)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Net of recovery × incidents
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/30 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Year-1 net ROI
            </div>
            <div className="text-base font-semibold tabular-nums">
              {fmtRoi(rec.year1NetRoiLow)} – {fmtRoi(rec.year1NetRoiHigh)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Mid: {fmtRoi(projection.year1NetRoiMidFinal)}
            </div>
          </div>
        </div>

        {/* Cadence + cooldown + platforms */}
        <div className="rounded-md border border-border bg-background/30 p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Alert cadence
              </div>
              <div className="text-xs">{rec.alertCadence}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Cooldown seconds (recommended)
              </div>
              <div className="text-xs tabular-nums">
                {rec.cooldownSecondsRecommended.toLocaleString()} s
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Platforms ({rec.platforms.length})
            </div>
            <ul className="text-[11px] text-muted-foreground leading-snug list-disc pl-5 space-y-0.5">
              {rec.platforms.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Default platform pick
            </div>
            <div className="text-[11px] font-mono">{rec.defaultPlatformPick}</div>
          </div>
        </div>

        {/* Canonical alert-payload + thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-background/30 p-3 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              13-field canonical alert-payload shape
            </div>
            <ul className="text-[10px] font-mono leading-snug list-disc pl-5">
              {rec.canonicalAlertPayloadFields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border bg-background/30 p-3 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              5 canonical webhook thresholds
            </div>
            <ul className="text-[10px] font-mono leading-snug">
              {Object.entries(CANONICAL_WEBHOOK_THRESHOLDS).map(([k, v]) => (
                <li key={k}>
                  <span className="text-muted-foreground">{k}:</span> {String(v)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5-pillar framework + 6-step build */}
        <details className="rounded-md border border-border bg-background/30 p-3">
          <summary className="text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer">
            5-pillar attribution-health-alert-webhook framework (click to expand)
          </summary>
          <div className="mt-2 space-y-2">
            {Object.entries(ATTRIBUTION_ALERT_PILLAR_MATRIX).map(([k, v]) => (
              <div key={k} className="text-[10px] leading-relaxed">
                <span className="font-semibold">{k}</span>
                <p className="text-muted-foreground mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-md border border-border bg-background/30 p-3">
          <summary className="text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer">
            6-step build sequence for Path {rec.path} (click to expand)
          </summary>
          <ol className="mt-2 space-y-1 list-decimal pl-5 text-[11px] leading-relaxed">
            {rec.buildSequence.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </details>

        {/* Copy report */}
        <div className="flex items-center gap-2 pt-1">
          <CopyButton
            value={report}
            label="Copy report"
            className="text-[10px] font-mono uppercase tracking-wider"
          />
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-md border border-border bg-background/50 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:bg-background"
          >
            Reset defaults
          </button>
          <span className="text-[10px] text-muted-foreground">
            Persists to <code className="rounded bg-muted px-1">{STORAGE_KEY}</code>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Personalised Recovery Panel — cross-page-intelligence layer.
 *
 * Reads the operator's `Your-store` (AOV / monthly orders / gross margin)
 * from `ecom-ops:your-store:v1` on mount and re-projects the picked Path's
 * Year-1 incremental attribution recovery onto the operator's actual revenue
 * base. Falls back to canonical $75 AOV × 1,000 orders × 70% margin defaults
 * when Your-store hasn't been set yet.
 *
 * Personalisation math (matches the canonical script's recovery bands):
 *   annual_revenue = aov × monthly_orders × 12
 *   net_cost       = year1CostMid                (one-time + 12 mo recurring)
 *   gross_recovery = year1IncrementalAttributionRecovery    (low..high)
 *   net_recovery   = gross_recovery - net_cost
 *   recovery_pct   = net_recovery / annual_revenue            (% of annual rev)
 *   payback_months = net_cost / (gross_recovery_mid / 12)
 *   margin_recovery = net_recovery × gross_margin
 *
 * The personalisation is most useful when Your-store is set (the
 * "Live numbers" badge lights up). Without it, the panel renders the
 * defaults so the operator still sees the projection shape, but the
 * dollar values are tied to industry-median inputs.
 */
function PersonalizedRecoveryPanel({
  rec,
  projection,
  store,
  storeIsLive,
}: {
  rec: PathRecommendation;
  projection: PerPathRecovery;
  store: YourStoreInputs;
  storeIsLive: boolean;
}) {
  const annualizedRevenue = store.aov * store.monthlyOrders * 12;
  const annualGrossMarginRevenue = annualizedRevenue * store.grossMargin;
  const recoveryLow = rec.year1IncrementalAttributionRecoveryLow;
  const recoveryHigh = rec.year1IncrementalAttributionRecoveryHigh;
  const recoveryMid = (recoveryLow + recoveryHigh) / 2;
  const costMid = projection.year1CostMidFull;
  const netRecoveryLow = recoveryLow - costMid;
  const netRecoveryHigh = recoveryHigh - costMid;
  const netRecoveryMid = (netRecoveryLow + netRecoveryHigh) / 2;
  const recoveryPctLow =
    annualizedRevenue > 0 ? (netRecoveryLow / annualizedRevenue) * 100 : 0;
  const recoveryPctHigh =
    annualizedRevenue > 0 ? (netRecoveryHigh / annualizedRevenue) * 100 : 0;
  const marginRecoveryLow = netRecoveryLow * store.grossMargin;
  const marginRecoveryHigh = netRecoveryHigh * store.grossMargin;
  // Months to recoup the alert infra cost from the recovered attribution drift.
  // Cap at 99 to keep the UI legible when recovery is path-E (zero).
  const paybackMonths =
    recoveryMid > 0 ? Math.min(99, costMid / (recoveryMid / 12)) : 99;
  // Use the projected $500 threshold for the "live numbers" badge — below
  // that the percentage is noise.
  const hasMeaningfulProjection = storeIsLive && annualizedRevenue >= 12_000;

  return (
    <div
      id="attribution-health-alert-personalized"
      className={cn(
        "rounded-md border p-3 space-y-3",
        hasMeaningfulProjection
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-background/30",
      )}
    >
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">
            Personalised recovery · tied to Your-store
          </h3>
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider",
              hasMeaningfulProjection
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {hasMeaningfulProjection ? "Live numbers" : "Industry-median default"}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Source · {hasMeaningfulProjection ? "Your-store" : "YOUR_STORE_DEFAULTS"}
        </span>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Annual gross revenue
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatUsd(annualizedRevenue)}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            {formatUsd(store.aov)} × {formatInt(store.monthlyOrders)} × 12
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Y1 net recovery (after infra)
          </div>
          <div className="text-base font-semibold tabular-nums text-accent">
            {formatUsd(netRecoveryLow)} – {formatUsd(netRecoveryHigh)}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            = {formatUsd(recoveryLow)} – {formatUsd(recoveryHigh)} −{" "}
            {formatUsd(costMid)} infra
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            % of annual revenue
          </div>
          <div className="text-base font-semibold tabular-nums">
            {recoveryPctLow >= 0 ? "+" : ""}
            {recoveryPctLow.toFixed(2)}% – {recoveryPctHigh >= 0 ? "+" : ""}
            {recoveryPctHigh.toFixed(2)}%
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            NET recovery ÷ annual revenue
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net margin $ + infra payback
          </div>
          <div className="text-base font-semibold tabular-nums">
            {formatUsd(marginRecoveryLow)} – {formatUsd(marginRecoveryHigh)}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            at {formatPercent(store.grossMargin, 0)} · pays back in{" "}
            {paybackMonths >= 99 ? "— (path E)" : `${paybackMonths.toFixed(1)} mo`}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background/30 p-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hasMeaningfulProjection ? (
            <>
              Path {rec.path} ({pathLongLabel(rec.path).toLowerCase()}) on Your-store
              &rsquo;s <span className="text-foreground font-semibold">{formatUsd(annualizedRevenue)}/yr</span>{" "}
              gross base ({formatUsd(annualGrossMarginRevenue)} net margin) recovers{" "}
              <span className="text-foreground font-semibold">
                {formatUsd(recoveryLow)} – {formatUsd(recoveryHigh)}
              </span>{" "}
              in attribution drift per year. After the canonical{" "}
              <span className="text-foreground font-semibold">{formatUsd(costMid)}</span>{" "}
              Year-1 infra cost (Path {rec.path}), the net lift is{" "}
              <span className="text-foreground font-semibold">
                {formatUsd(netRecoveryLow)} – {formatUsd(netRecoveryHigh)}
              </span>{" "}
              ({recoveryPctLow.toFixed(1)}–{recoveryPctHigh.toFixed(1)}% of annual revenue). Edit Your-store on
              Overview to see this number change in real time.
            </>
          ) : (
            <>
              The personalised recovery projection requires Your-store set on
              Overview (or annualised revenue ≥ $12,000). Industry medians:{" "}
              {formatUsd(YOUR_STORE_DEFAULTS.aov)} ×{" "}
              {formatInt(YOUR_STORE_DEFAULTS.monthlyOrders)} × 12 ={" "}
              <span className="text-foreground font-semibold">
                {formatUsd(
                  YOUR_STORE_DEFAULTS.aov * YOUR_STORE_DEFAULTS.monthlyOrders * 12,
                )}
              </span>{" "}
              gross annual revenue.{" "}
              {storeIsLive
                ? `Your current annualised revenue (${formatUsd(annualizedRevenue)}) is below the $12k threshold for a meaningful projection — confirm AOV × monthly orders on Overview.`
                : "Set Your-store on Overview to see the projection become live."}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
