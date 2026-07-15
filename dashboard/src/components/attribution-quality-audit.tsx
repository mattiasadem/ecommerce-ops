"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AUDIT_GATE_LABELS,
  AuditInputs,
  AttributionDriftFixture,
  buildAuditReport,
  canonicalPassAll,
  checkMetaCapiMatchRate,
  checkMetaPixelCoverage,
  checkGoogleEnhancedConversionsQuality,
  checkGa4TwRevenueDelta,
  checkKlaviyoTwCohortRoundtrip,
  checkAttributionDrift,
  Ga4TwRevenueFixture,
  GoogleEcFixture,
  KlaviyoTwCohortFixture,
  KlaviyoTwSampleOrder,
  MetaCapiFixture,
  MetaPixelFixture,
  renderAuditMarkdown,
  stressTestFailAll,
  verdictBadgeClasses,
  verdictShortLabel,
} from "@/lib/attribution-quality-audit";
import { cn } from "@/lib/utils";

/**
 * Interactive Attribution Quality Audit (Move #6.5).
 *
 * Direct browser port of `scripts/attribution_quality_audit.py`. The
 * operator enters 6 diagnostic snapshots — Meta CAPI match rate (Gate A),
 * Meta Pixel coverage (Gate C), Google Enhanced Conversions quality
 * (Gate D), GA4 ↔ Triple Whale revenue delta (Gate E), Klaviyo ↔ Triple
 * Whale cohort roundtrip (Gate F), and week-over-week attribution drift
 * (Gate G) — and the panel scores every gate against the canonical
 * thresholds pinned by the Python CLI (match rate ≥ 90%, dedup ratio in
 * [0.8, 1.5], coverage ≥ 95%, Google EC tier in {Good, Excellent} with
 * email coverage ≥ 80%, GA4↔TW revenue delta ≤ 5% + order delta ≤ 3%,
 * cohort roundtrip ≥ 95% with sample size ≥ 5, week-over-week drift ≤
 * 5pp on match rate + revenue delta). Each failed gate surfaces its
 * prioritized remediation text inline.
 *
 * Mirrors the canonical 6-gates-pinned-by-test pattern from the Python
 * CLI so an operator can sanity-check the same numbers in the browser
 * and the terminal without drift. Inputs persist to localStorage
 * (`ecom-ops:attribution-quality-audit:v1`) so the operator's diagnostic
 * snapshots survive reloads. Copy-report emits a paste-ready markdown
 * audit to the clipboard. Reset-defaults clears all 6 gates. Seed /
 * stress buttons demo the canonical PASS and FAIL bands without typing
 * every number.
 *
 * Mounted on `/attribution-quality` (new route, the canonical
 * Move #6.5 destination) + embedded on the `/tiktok` channel page
 * underneath the per-platform Move #6.6/6.7 audits so the operator has
 * a single page that walks from per-platform (6.6/6.7) → global
 * attribution stack (6.5) → cohort roundtrip (Gate F) → drift
 * monitoring (Gate G).
 */

const STORAGE_KEY = "ecom-ops:attribution-quality-audit:v1";

function emptyInputs(): AuditInputs {
  return {
    meta_capi: { pixel_events: 0, capi_events: 0, matched_events: 0, expected_orders_last_7d: 0 },
    meta_pixel: { pixel_fired_count: 0, expected_pageviews: 0 },
    google_ec: { quality_tier: "", hashed_email_coverage_pct: 0, total_conversions: 0, conversions_with_hashed_email: 0 },
    ga4_tw: { ga4_revenue_last_7d: 0, tw_revenue_last_7d: 0, actual_orders_last_7d: 0, expected_orders_last_7d: 0 },
    klaviyo_tw: {
      sample_orders: [
        { order_id: "", klaviyo_cohort: "", tw_cohort: "" },
        { order_id: "", klaviyo_cohort: "", tw_cohort: "" },
        { order_id: "", klaviyo_cohort: "", tw_cohort: "" },
        { order_id: "", klaviyo_cohort: "", tw_cohort: "" },
        { order_id: "", klaviyo_cohort: "", tw_cohort: "" },
      ],
    },
    drift: {
      measurement_window_days: 7,
      drift_threshold_pct: 5,
      current_match_rate_pct: 0,
      previous_match_rate_pct: 0,
      current_revenue_delta_pct: 0,
      previous_revenue_delta_pct: 0,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function loadStored(): AuditInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as AuditInputs;
  } catch {
    return null;
  }
}

function storeInputs(inputs: AuditInputs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
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

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AttributionQualityAudit() {
  const [inputs, setInputs] = useState<AuditInputs>(() => emptyInputs());
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      // Merge stored with empty defaults so newly-added keys still pick up
      // a sensible starting state (e.g. sample_orders is always an array).
      const merged = emptyInputs();
      if (stored.meta_capi) merged.meta_capi = { ...merged.meta_capi, ...stored.meta_capi };
      if (stored.meta_pixel) merged.meta_pixel = { ...merged.meta_pixel, ...stored.meta_pixel };
      if (stored.google_ec) merged.google_ec = { ...merged.google_ec, ...stored.google_ec };
      if (stored.ga4_tw) merged.ga4_tw = { ...merged.ga4_tw, ...stored.ga4_tw };
      if (stored.klaviyo_tw) {
        merged.klaviyo_tw = {
          sample_orders: Array.isArray(stored.klaviyo_tw.sample_orders)
            ? (stored.klaviyo_tw.sample_orders as KlaviyoTwSampleOrder[])
            : merged.klaviyo_tw?.sample_orders ?? [],
        };
      }
      if (stored.drift) merged.drift = { ...merged.drift, ...stored.drift };
      setInputs(merged);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const report = useMemo(() => buildAuditReport(inputs), [inputs]);

  // Per-gate inline previews — uses the canonical pass/fail logic for
  // each gate independently so the operator sees the verdict shift as
  // they type, before scrolling to the per-gate verdict list below.
  const gateAPreview = useMemo(() => checkMetaCapiMatchRate(inputs.meta_capi), [inputs.meta_capi]);
  const gateCPreview = useMemo(() => checkMetaPixelCoverage(inputs.meta_pixel), [inputs.meta_pixel]);
  const gateDPreview = useMemo(() => checkGoogleEnhancedConversionsQuality(inputs.google_ec), [inputs.google_ec]);
  const gateEPreview = useMemo(() => checkGa4TwRevenueDelta(inputs.ga4_tw), [inputs.ga4_tw]);
  const gateFPreview = useMemo(() => checkKlaviyoTwCohortRoundtrip(inputs.klaviyo_tw), [inputs.klaviyo_tw]);
  const gateGPreview = useMemo(() => checkAttributionDrift(inputs.drift), [inputs.drift]);

  const setMetaCapi = (next: Partial<MetaCapiFixture>) =>
    setInputs((prev) => ({ ...prev, meta_capi: { ...(prev.meta_capi ?? {}), ...next } }));
  const setMetaPixel = (next: Partial<MetaPixelFixture>) =>
    setInputs((prev) => ({ ...prev, meta_pixel: { ...(prev.meta_pixel ?? {}), ...next } }));
  const setGoogleEc = (next: Partial<GoogleEcFixture>) =>
    setInputs((prev) => ({ ...prev, google_ec: { ...(prev.google_ec ?? {}), ...next } }));
  const setGa4Tw = (next: Partial<Ga4TwRevenueFixture>) =>
    setInputs((prev) => ({ ...prev, ga4_tw: { ...(prev.ga4_tw ?? {}), ...next } }));
  const setKlaviyoTw = (next: Partial<KlaviyoTwCohortFixture>) =>
    setInputs((prev) => ({ ...prev, klaviyo_tw: { ...(prev.klaviyo_tw ?? {}), ...next } }));
  const setDrift = (next: Partial<AttributionDriftFixture>) =>
    setInputs((prev) => ({ ...prev, drift: { ...(prev.drift ?? {}), ...next } }));

  const setSampleOrder = (index: number, patch: Partial<KlaviyoTwSampleOrder>) => {
    const current = inputs.klaviyo_tw?.sample_orders ?? [];
    const next = [...current];
    while (next.length <= index) {
      next.push({ order_id: "", klaviyo_cohort: "", tw_cohort: "" });
    }
    next[index] = { ...next[index], ...patch };
    setKlaviyoTw({ sample_orders: next });
  };

  const seedCanonicalPass = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Seed all 6 gates with the canonical-pass fixture set?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    setInputs(canonicalPassAll());
  };

  const stressTestFail = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Stress-test: shift all 6 gates to the FAIL band (low match rate, low coverage, low email coverage, high revenue delta, low cohort match, high drift)?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    setInputs(stressTestFailAll());
  };

  const resetAll = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset all 6 gates to empty (no diagnostic data entered)?");
      if (!ok) return;
    }
    setInputs(emptyInputs());
  };

  const copyReport = async () => {
    const md = renderAuditMarkdown(report, inputs);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const fleetRingColor =
    report.passed_count === report.total_count
      ? "border-emerald-500/40 bg-emerald-500/5"
      : report.passed_count >= 4
        ? "border-sky-500/40 bg-sky-500/5"
        : report.passed_count >= 2
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-rose-500/40 bg-rose-500/5";

  const failedGates = report.gates.filter((g) => !g.passed);
  const passedGates = report.gates.filter((g) => g.passed);

  return (
    <div
      id="attribution-quality-audit"
      className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", fleetRingColor)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive audit · Move #6.5 verification
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Attribution quality — score 6 gates in 3 minutes
          </h3>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/attribution_quality_audit.py</code>.
            Enter the 6 diagnostic snapshots from the operator&apos;s last 7d exports:
            <strong> Gate A</strong> Meta CAPI event_id match rate + dedup ratio + coverage
            (target ≥ 90% / [0.8, 1.5] / ≥ 95%), <strong>Gate C</strong> Meta Pixel coverage
            (target ≥ 95% of expected pageviews), <strong>Gate D</strong> Google Enhanced
            Conversions quality tier (Good/Excellent) + hashed email coverage (≥ 80%),
            <strong> Gate E</strong> GA4 ↔ Triple Whale revenue delta (≤ 5%) + order delta
            (≤ 3%), <strong>Gate F</strong> Klaviyo ↔ Triple Whale cohort roundtrip (≥ 95%
            of ≥ 5 sample orders), and <strong>Gate G</strong> week-over-week drift on match
            rate + revenue delta (≤ 5pp). The panel scores every gate against the canonical
            thresholds pinned by the Python CLI and surfaces prioritized remediation text per
            failure. Inputs persist to your browser; use the seed/stress buttons to demo the
            PASS and FAIL bands without typing 25 numbers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={seedCanonicalPass}
            className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Seed canonical pass
          </button>
          <button
            type="button"
            onClick={stressTestFail}
            className="inline-flex items-center rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Stress-test FAIL
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={copyReport}
            className={cn(
              "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {copied ? "Copied ✓" : "Copy report"}
          </button>
        </div>
      </div>

      {/* Fleet summary strip */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Gates scored</span>
          <span className="text-xl font-semibold tabular-nums">
            {report.passed_count}
            <span className="text-base text-muted-foreground font-normal"> / {report.total_count}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            {report.total_count === 0 ? "Enter diagnostic data below" : `${report.passed_count} of 6 PASS`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall</span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              report.overall_passed ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
            )}
          >
            {report.overall_passed ? "ALL PASS" : "SOME FAIL"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {report.overall_passed ? "✓ Ship it" : "✗ Investigate failed gates"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Passed gates</span>
          <span className="text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {passedGates.length}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {passedGates.map((g) => g.gate_name.replace(/_/g, " ")).join(" · ") || "none"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Failed gates</span>
          <span className="text-xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {failedGates.length}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {failedGates.map((g) => g.gate_name.replace(/_/g, " ")).join(" · ") || "none"}
          </span>
        </div>
      </div>

      {/* Input panels — one per gate */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Diagnostic inputs (export from Meta / Google / GA4 / Klaviyo / Triple Whale &gt; last 7d)
        </span>

        {/* Gate A — Meta CAPI */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate A · meta_capi_match.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.meta_capi_match_rate}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateAPreview.passed),
              )}
            >
              {verdictShortLabel(gateAPreview.passed)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <NumberInput
              label="Pixel events"
              value={inputs.meta_capi?.pixel_events ?? 0}
              onChange={(v) => setMetaCapi({ pixel_events: clamp(v, 0, 10_000_000) })}
              hint="Meta Events Manager > Diagnostics > Purchase"
            />
            <NumberInput
              label="CAPI events"
              value={inputs.meta_capi?.capi_events ?? 0}
              onChange={(v) => setMetaCapi({ capi_events: clamp(v, 0, 10_000_000) })}
              hint="Server-side events"
            />
            <NumberInput
              label="Matched events"
              value={inputs.meta_capi?.matched_events ?? 0}
              onChange={(v) => setMetaCapi({ matched_events: clamp(v, 0, 10_000_000) })}
              hint="event_id dedup successful"
            />
            <NumberInput
              label="Expected orders / 7d"
              value={inputs.meta_capi?.expected_orders_last_7d ?? 0}
              onChange={(v) => setMetaCapi({ expected_orders_last_7d: clamp(v, 1, 10_000_000) })}
              hint="Shopify Analytics ground truth"
            />
          </div>
        </div>

        {/* Gate C — Meta Pixel coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate C · meta_pixel_coverage.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.meta_pixel_coverage}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateCPreview.passed),
              )}
            >
              {verdictShortLabel(gateCPreview.passed)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <NumberInput
              label="Pixel fired count"
              value={inputs.meta_pixel?.pixel_fired_count ?? 0}
              onChange={(v) => setMetaPixel({ pixel_fired_count: clamp(v, 0, 10_000_000) })}
              hint="Meta Diagnostics > PageView (last 7d)"
            />
            <NumberInput
              label="Expected pageviews"
              value={inputs.meta_pixel?.expected_pageviews ?? 0}
              onChange={(v) => setMetaPixel({ expected_pageviews: clamp(v, 1, 10_000_000) })}
              hint="Shopify Analytics > Total sessions"
            />
            <div className="col-span-2 flex items-end">
              <span className="text-[10px] text-muted-foreground">
                Coverage = pixel_fired_count / expected_pageviews (target ≥ 95%)
              </span>
            </div>
          </div>
        </div>

        {/* Gate D — Google Enhanced Conversions quality */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate D · google_enhanced_quality.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.google_enhanced_conversions_quality}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateDPreview.passed),
              )}
            >
              {verdictShortLabel(gateDPreview.passed)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <SelectInput
              label="Quality tier"
              value={inputs.google_ec?.quality_tier ?? ""}
              onChange={(v) => setGoogleEc({ quality_tier: v as GoogleEcFixture["quality_tier"] })}
              options={[
                { value: "", label: "(unset)" },
                { value: "Good", label: "Good" },
                { value: "Excellent", label: "Excellent" },
                { value: "Needs improvement", label: "Needs improvement" },
                { value: "Unavailable", label: "Unavailable" },
              ]}
            />
            <NumberInput
              label="Hashed email coverage"
              value={inputs.google_ec?.hashed_email_coverage_pct ?? 0}
              onChange={(v) => setGoogleEc({ hashed_email_coverage_pct: clamp(v, 0, 100) })}
              step={0.1}
              suffix="%"
              hint="(conversions_with_hashed / total) * 100"
            />
            <NumberInput
              label="Total conversions"
              value={inputs.google_ec?.total_conversions ?? 0}
              onChange={(v) => setGoogleEc({ total_conversions: clamp(v, 1, 10_000_000) })}
              hint="Google Ads > Conversions > last-7d"
            />
            <NumberInput
              label="Conversions w/ hashed email"
              value={inputs.google_ec?.conversions_with_hashed_email ?? 0}
              onChange={(v) =>
                setGoogleEc({ conversions_with_hashed_email: clamp(v, 0, 10_000_000) })
              }
              hint="Subset of total"
            />
          </div>
        </div>

        {/* Gate E — GA4 ↔ Triple Whale revenue delta */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate E · ga4_tw_revenue.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.ga4_tw_revenue_delta}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateEPreview.passed),
              )}
            >
              {verdictShortLabel(gateEPreview.passed)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <NumberInput
              label="GA4 revenue / 7d"
              value={inputs.ga4_tw?.ga4_revenue_last_7d ?? 0}
              onChange={(v) => setGa4Tw({ ga4_revenue_last_7d: clamp(v, 0, 100_000_000) })}
              step={0.01}
              suffix="$"
              hint="GA4 > Monetization > Purchase"
            />
            <NumberInput
              label="Triple Whale revenue / 7d"
              value={inputs.ga4_tw?.tw_revenue_last_7d ?? 0}
              onChange={(v) => setGa4Tw({ tw_revenue_last_7d: clamp(v, 1, 100_000_000) })}
              step={0.01}
              suffix="$"
              hint="Triple Whale > Revenue"
            />
            <NumberInput
              label="Actual orders / 7d"
              value={inputs.ga4_tw?.actual_orders_last_7d ?? 0}
              onChange={(v) => setGa4Tw({ actual_orders_last_7d: clamp(v, 0, 10_000_000) })}
              hint="Shopify > Orders last 7d"
            />
            <NumberInput
              label="Expected orders / 7d"
              value={inputs.ga4_tw?.expected_orders_last_7d ?? 0}
              onChange={(v) => setGa4Tw({ expected_orders_last_7d: clamp(v, 1, 10_000_000) })}
              hint="Ground truth (often = actual)"
            />
          </div>
        </div>

        {/* Gate F — Klaviyo ↔ Triple Whale cohort roundtrip */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate F · klaviyo_tw_cohort.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.klaviyo_tw_cohort_roundtrip}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateFPreview.passed),
              )}
            >
              {verdictShortLabel(gateFPreview.passed)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Pull at least 5 recent orders (random sample from Shopify &gt; Orders &gt; last 30d). For each,
            look up the Klaviyo cohort from the customer profile and the Triple Whale cohort from the
            order detail. Match rate target ≥ 95% (case-insensitive).
          </p>
          <div className="flex flex-col gap-2">
            {(inputs.klaviyo_tw?.sample_orders ?? []).slice(0, 5).map((row, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-2">
                <span className="self-center text-[10px] uppercase tracking-wider text-muted-foreground">
                  Order {i + 1}
                </span>
                <TextInput
                  label=""
                  value={row.order_id ?? ""}
                  onChange={(v) => setSampleOrder(i, { order_id: v })}
                  placeholder="order_id"
                />
                <TextInput
                  label=""
                  value={row.klaviyo_cohort ?? ""}
                  onChange={(v) => setSampleOrder(i, { klaviyo_cohort: v })}
                  placeholder="Klaviyo cohort"
                />
                <TextInput
                  label=""
                  value={row.tw_cohort ?? ""}
                  onChange={(v) => setSampleOrder(i, { tw_cohort: v })}
                  placeholder="Triple Whale cohort"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gate G — Week-over-week drift */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate G · attribution_drift.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                {AUDIT_GATE_LABELS.attribution_drift}
              </span>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                verdictBadgeClasses(gateGPreview.passed),
              )}
            >
              {verdictShortLabel(gateGPreview.passed)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            <NumberInput
              label="Window days"
              value={inputs.drift?.measurement_window_days ?? 7}
              onChange={(v) => setDrift({ measurement_window_days: clamp(v, 1, 365) })}
              hint="7 or 14 typical"
            />
            <NumberInput
              label="Drift threshold"
              value={inputs.drift?.drift_threshold_pct ?? 5}
              onChange={(v) => setDrift({ drift_threshold_pct: clamp(v, 0.1, 100) })}
              step={0.1}
              suffix="pp"
            />
            <NumberInput
              label="Curr match rate"
              value={inputs.drift?.current_match_rate_pct ?? 0}
              onChange={(v) => setDrift({ current_match_rate_pct: clamp(v, 0, 100) })}
              step={0.1}
              suffix="%"
              hint="This run's Gate A"
            />
            <NumberInput
              label="Prev match rate"
              value={inputs.drift?.previous_match_rate_pct ?? 0}
              onChange={(v) => setDrift({ previous_match_rate_pct: clamp(v, 0, 100) })}
              step={0.1}
              suffix="%"
              hint="Last run's Gate A"
            />
            <NumberInput
              label="Curr rev delta"
              value={inputs.drift?.current_revenue_delta_pct ?? 0}
              onChange={(v) => setDrift({ current_revenue_delta_pct: clamp(v, 0, 100) })}
              step={0.1}
              suffix="%"
              hint="This run's Gate E"
            />
            <NumberInput
              label="Prev rev delta"
              value={inputs.drift?.previous_revenue_delta_pct ?? 0}
              onChange={(v) => setDrift({ previous_revenue_delta_pct: clamp(v, 0, 100) })}
              step={0.1}
              suffix="%"
              hint="Last run's Gate E"
            />
          </div>
        </div>
      </div>

      {/* Per-gate verdict list */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Per-gate verdicts
        </span>
        <div className="flex flex-col gap-2">
          {report.gates.map((g) => (
            <div
              key={g.gate_name}
              className={cn("rounded-lg border p-3 flex flex-col gap-1.5", verdictBadgeClasses(g.passed))}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] opacity-70">{g.gate_name}</span>
                  <span className="text-sm font-semibold leading-tight">{g.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {g.headline_pct !== null && (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-2xl font-semibold tabular-nums">
                        {g.headline_pct.toFixed(1)}
                        {g.gate_name === "attribution_drift" || g.gate_name === "ga4_tw_revenue_delta" ? "pp" : "%"}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        {g.headline_label}
                      </span>
                    </div>
                  )}
                  <span className="rounded-md border border-current/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                    {verdictShortLabel(g.passed)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{g.detail}</p>
              {!g.passed && g.remediation && (
                <p className="text-[11px] leading-relaxed opacity-90">
                  <span className="font-semibold">→ Remediation:</span> {g.remediation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          Defaults match a $1M–$5M GMV DTC brand (Path B weekly cadence, 6 gates × canonical 90%
          / 95% / 80% / 5% / 95% / 5pp thresholds pinned by the Python CLI&apos;s
          `--check &lt;gate&gt;` flags). Open playbook{" "}
          <code className="font-mono text-[11px]">06.5-attribution-quality-audit</code> for the
          full Move #6.5 verification gate list + Slack/Linear alert wiring.
        </span>
        <span className="font-mono text-[10px]">PASS · FAIL</span>
      </div>
    </div>
  );
}