"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AuditInputs,
  CANONICAL_THRESHOLDS,
  canonicalPassAll,
  EapiMatchFixture,
  PixelCoverageFixture,
  AdvancedMatchingFixture,
  buildAuditReport,
  renderAuditMarkdown,
  stressTestFailAll,
  verdictBadgeClasses,
  verdictShortLabel,
} from "@/lib/tiktok-attribution-audit";
import { cn } from "@/lib/utils";

/**
 * Interactive TikTok Attribution Quality Audit.
 *
 * Direct browser port of `scripts/tiktok_attribution_audit.py`. The operator
 * enters 3 diagnostic JSON snapshots — EAPI event_id match (Gate A),
 * TikTok Pixel coverage (Gate C), and Advanced Matching coverage (Gate D)
 * — and the panel scores every gate against the canonical thresholds
 * (match rate ≥ 85%, dedup ratio in [0.7, 1.6], coverage ≥ 95%,
 * pixel coverage ≥ 90%, Advanced Matching ≥ 75%) and surfaces a
 * per-gate PASS/FAIL chip + prioritized remediation text per failed gate.
 *
 * Mirrors the canonical 6-thresholds-pinned-by-test pattern from the
 * Python CLI so an operator can sanity-check the same numbers in the
 * browser and the terminal without drift.
 *
 * Inputs persist to localStorage (`ecom-ops:tiktok-attribution-audit:v1`)
 * so the operator's diagnostic snapshots survive reloads. Copy-report
 * emits a paste-ready markdown audit to the clipboard. Reset-defaults
 * clears all 3 gates.
 *
 * Mounted on `/tiktok` between the per-platform research tables and
 * the "Future-tick companions" footer.
 */

const STORAGE_KEY = "ecom-ops:tiktok-attribution-audit:v1";

function emptyInputs(): AuditInputs {
  return {
    eapi: { pixel_events: 0, eapi_events: 0, matched_events: 0, expected_orders_last_7d: 0 },
    pixel: { pixel_fired_count: 0, expected_pageviews: 0 },
    advanced: { hashed_identifier_coverage_pct: 0, matched_with_identifier: 0, total_events: 0 },
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
  hint,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
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

export function TiktokAttributionAudit() {
  const [inputs, setInputs] = useState<AuditInputs>(() => emptyInputs());
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs({
        eapi: { ...emptyInputs().eapi, ...(stored.eapi ?? {}) },
        pixel: { ...emptyInputs().pixel, ...(stored.pixel ?? {}) },
        advanced: { ...emptyInputs().advanced, ...(stored.advanced ?? {}) },
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const report = useMemo(() => buildAuditReport(inputs), [inputs]);

  const setEapi = (next: Partial<EapiMatchFixture>) =>
    setInputs((prev) => ({ ...prev, eapi: { ...prev.eapi, ...next } }));
  const setPixel = (next: Partial<PixelCoverageFixture>) =>
    setInputs((prev) => ({ ...prev, pixel: { ...prev.pixel, ...next } }));
  const setAdvanced = (next: Partial<AdvancedMatchingFixture>) =>
    setInputs((prev) => ({ ...prev, advanced: { ...prev.advanced, ...next } }));

  const seedCanonicalPass = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Seed all 3 gates with the canonical-pass fixture set?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    setInputs(canonicalPassAll());
  };

  const stressTestFail = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Stress-test: shift all 3 gates to the FAIL band (low match rate, low coverage, low advanced matching)?\n\nThis overwrites any operator-entered numbers in this browser.",
      );
      if (!ok) return;
    }
    setInputs(stressTestFailAll());
  };

  const resetAll = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Reset all 3 gates to empty (no diagnostic data entered)?");
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
      : report.passed_count >= 2
        ? "border-sky-500/40 bg-sky-500/5"
        : report.passed_count >= 1
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-rose-500/40 bg-rose-500/5";

  // Derive live verdict chip counts
  const failedGates = report.gates.filter((g) => !g.passed);
  const passedGates = report.gates.filter((g) => g.passed);

  return (
    <div
      id="tiktok-attribution-audit"
      className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", fleetRingColor)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive audit · Move #6.6 verification
          </span>
          <h3 className="text-base font-semibold leading-tight">
            TikTok attribution quality — score 3 gates in 2 minutes
          </h3>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/tiktok_attribution_audit.py</code>.
            Enter the 3 diagnostic snapshots from TikTok Events Manager &gt; Diagnostics
            tab (last 7d): <strong>Gate A</strong> EAPI event_id match rate + dedup ratio +
            coverage (target ≥ 85% / [0.7, 1.6] / ≥ 95%), <strong>Gate C</strong> Pixel
            coverage (target ≥ 90% of expected pageviews), and <strong>Gate D</strong>
            Advanced Matching coverage (target ≥ 75% of total events). The panel scores
            each gate and surfaces prioritized remediation text per failure. Inputs
            persist to your browser; use the seed/stress buttons to demo the PASS and
            FAIL bands without typing 9 numbers.
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
            {report.total_count === 0 ? "Enter diagnostic data below" : `${report.passed_count} of 3 PASS`}
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
            {passedGates.map((g) => g.gate_name.replace("tiktok_", "").replace("_rate", "")).join(" · ") || "none"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Failed gates</span>
          <span className="text-xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {failedGates.length}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {failedGates.map((g) => g.gate_name.replace("tiktok_", "").replace("_rate", "")).join(" · ") || "none"}
          </span>
        </div>
      </div>

      {/* Input panels — one per gate */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Diagnostic inputs (export from TikTok Events Manager &gt; Diagnostics &gt; last 7d)
        </span>

        {/* Gate A — EAPI match + dedup + coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate A · tiktok_eapi_match.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                TikTok EAPI event_id match rate + dedup ratio + coverage
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: match rate ≥ {CANONICAL_THRESHOLDS.MIN_EAPI_MATCH_RATE_PCT}% · dedup in [{CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO}, {CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO}] · coverage ≥ {CANONICAL_THRESHOLDS.MIN_EAPI_COVERAGE_PCT}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Pixel events"
              value={inputs.eapi.pixel_events ?? 0}
              onChange={(v) => setEapi({ pixel_events: clamp(v, 0, 1_000_000) })}
              hint="Browser-side TikTok pixel fires"
            />
            <NumberInput
              label="EAPI events"
              value={inputs.eapi.eapi_events ?? 0}
              onChange={(v) => setEapi({ eapi_events: clamp(v, 0, 1_000_000) })}
              hint="Server-side Events API fires"
            />
            <NumberInput
              label="Matched events"
              value={inputs.eapi.matched_events ?? 0}
              onChange={(v) => setEapi({ matched_events: clamp(v, 0, 1_000_000) })}
              hint="Pixel + EAPI deduped on event_id"
            />
            <NumberInput
              label="Expected orders (7d)"
              value={inputs.eapi.expected_orders_last_7d ?? 0}
              onChange={(v) => setEapi({ expected_orders_last_7d: clamp(v, 0, 100_000) })}
              hint="From Shopify Analytics"
            />
          </div>
        </div>

        {/* Gate C — Pixel coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate C · tiktok_pixel_coverage.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                TikTok Pixel coverage (browser-side intent signals)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: pixel coverage ≥ {CANONICAL_THRESHOLDS.MIN_PIXEL_COVERAGE_PCT}% of expected pageviews
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Pixel fired count"
              value={inputs.pixel.pixel_fired_count ?? 0}
              onChange={(v) => setPixel({ pixel_fired_count: clamp(v, 0, 10_000_000) })}
              hint="Pageview events captured"
            />
            <NumberInput
              label="Expected pageviews"
              value={inputs.pixel.expected_pageviews ?? 0}
              onChange={(v) => setPixel({ expected_pageviews: clamp(v, 0, 10_000_000) })}
              hint="From Shopify or GA4 same window"
            />
          </div>
        </div>

        {/* Gate D — Advanced Matching */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Gate D · tiktok_advanced_matching.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                TikTok Advanced Matching coverage (email + phone + external_id)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: hashed identifier coverage ≥ {CANONICAL_THRESHOLDS.MIN_ADVANCED_MATCHING_PCT}% of total events
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Hashed identifier coverage %"
              value={inputs.advanced.hashed_identifier_coverage_pct ?? 0}
              onChange={(v) => setAdvanced({ hashed_identifier_coverage_pct: clamp(v, 0, 100) })}
              step={0.1}
              hint="Or derive from matched / total below"
              suffix="%"
            />
            <NumberInput
              label="Matched with identifier"
              value={inputs.advanced.matched_with_identifier ?? 0}
              onChange={(v) => setAdvanced({ matched_with_identifier: clamp(v, 0, 10_000_000) })}
              hint="Events with email/phone hashed"
            />
            <NumberInput
              label="Total events"
              value={inputs.advanced.total_events ?? 0}
              onChange={(v) => setAdvanced({ total_events: clamp(v, 0, 10_000_000) })}
              hint="All TikTok events in window"
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
              className={cn(
                "rounded-lg border p-3 flex flex-col gap-1.5",
                verdictBadgeClasses(g.passed),
              )}
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
                        {g.headline_pct.toFixed(1)}%
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
          Defaults match a $1M–$5M GMV DTC brand (Path B weekly cadence, 3 gates ×
          canonical 85% / 95% / 90% / 75% / [0.7, 1.6] thresholds pinned by
          test_canonical_thresholds_published). Open playbook{" "}
          <code className="font-mono text-[11px]">06.6-tiktok-attribution-quality-audit</code>{" "}
          for the full Move #6.6 verification gate list + Slack/Linear alert wiring.
        </span>
        <span className="font-mono text-[10px]">
          PASS · FAIL
        </span>
      </div>
    </div>
  );
}