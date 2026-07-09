"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AuditInputs,
  canonicalPassAll,
  stressTestFailAll,
  buildAuditReport,
  renderAuditMarkdown,
  verdictBadgeClasses,
  verdictShortLabel,
  CANONICAL_THRESHOLDS,
  SnapCapiMatchFixture,
  SnapPixelCoverageFixture,
  SnapEmqFixture,
  PinterestCapiMatchFixture,
  PinterestTagCoverageFixture,
  PinterestEnhancedMatchFixture,
} from "@/lib/snap-pinterest-attribution-audit";
import { cn } from "@/lib/utils";

/**
 * Interactive Snap + Pinterest Attribution Quality Audit.
 *
 * Direct browser port of `scripts/snap_pinterest_attribution_audit.py`. The
 * operator enters 6 diagnostic JSON snapshots across 2 platforms x 3 gates:
 *   Snap Gate A — CAPI event_id match rate + dedup + coverage (80% / [0.7, 1.5] / 92%)
 *   Snap Gate C — Pixel coverage (>= 88%)
 *   Snap Gate D — Email Matching Quality (EMQ) (>= 70%)
 *   Pinterest Gate A' — CAPI match rate + dedup + coverage (85% / [0.7, 1.5] / 93%)
 *   Pinterest Gate C' — Tag coverage (>= 85%)
 *   Pinterest Gate D' — Enhanced Match coverage (>= 75%)
 *
 * The panel scores all 6 gates, surfaces a per-platform split (Snap vs
 * Pinterest) + per-gate PASS/FAIL chip with headline % + remediation text on
 * failure, and provides seed-canonical-pass / stress-test-FAIL / reset /
 * copy-report actions.
 *
 * State persists to localStorage (`ecom-ops:snap-pinterest-attribution-audit:v1`)
 * so an operator's diagnostic snapshots survive reloads. Mounted on `/tiktok`
 * immediately below the existing Move #6.6 `<TiktokAttributionAudit />` — both
 * are Move #6.x attribution-quality-audit siblings and pair naturally on the
 * same per-platform-research-table page.
 */
const STORAGE_KEY = "ecom-ops:snap-pinterest-attribution-audit:v1";

function emptyInputs(): AuditInputs {
  return {
    snapCapi: {
      pixel_events: 0,
      capi_events: 0,
      matched_events: 0,
      expected_orders_last_7d: 0,
    },
    snapPixel: {
      pixel_fired_count: 0,
      expected_pageviews: 0,
    },
    snapEmq: {
      emq_coverage_pct: 0,
      matched_with_identifier: 0,
      total_events: 0,
    },
    pinterestCapi: {
      pixel_events: 0,
      capi_events: 0,
      matched_events: 0,
      expected_orders_last_7d: 0,
    },
    pinterestTag: {
      tag_fired_count: 0,
      expected_pageviews: 0,
    },
    pinterestEnhanced: {
      enhanced_match_coverage_pct: 0,
      matched_with_identifier: 0,
      total_events: 0,
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

export function SnapPinterestAttributionAudit() {
  const [inputs, setInputs] = useState<AuditInputs>(() => emptyInputs());
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setInputs({
        snapCapi: { ...emptyInputs().snapCapi, ...(stored.snapCapi ?? {}) },
        snapPixel: { ...emptyInputs().snapPixel, ...(stored.snapPixel ?? {}) },
        snapEmq: { ...emptyInputs().snapEmq, ...(stored.snapEmq ?? {}) },
        pinterestCapi: { ...emptyInputs().pinterestCapi, ...(stored.pinterestCapi ?? {}) },
        pinterestTag: { ...emptyInputs().pinterestTag, ...(stored.pinterestTag ?? {}) },
        pinterestEnhanced: { ...emptyInputs().pinterestEnhanced, ...(stored.pinterestEnhanced ?? {}) },
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storeInputs(inputs);
  }, [inputs, hydrated]);

  const report = useMemo(() => buildAuditReport(inputs), [inputs]);

  const setSnapCapi = (next: Partial<SnapCapiMatchFixture>) =>
    setInputs((prev) => ({ ...prev, snapCapi: { ...prev.snapCapi, ...next } }));
  const setSnapPixel = (next: Partial<SnapPixelCoverageFixture>) =>
    setInputs((prev) => ({ ...prev, snapPixel: { ...prev.snapPixel, ...next } }));
  const setSnapEmq = (next: Partial<SnapEmqFixture>) =>
    setInputs((prev) => ({ ...prev, snapEmq: { ...prev.snapEmq, ...next } }));
  const setPinterestCapi = (next: Partial<PinterestCapiMatchFixture>) =>
    setInputs((prev) => ({ ...prev, pinterestCapi: { ...prev.pinterestCapi, ...next } }));
  const setPinterestTag = (next: Partial<PinterestTagCoverageFixture>) =>
    setInputs((prev) => ({ ...prev, pinterestTag: { ...prev.pinterestTag, ...next } }));
  const setPinterestEnhanced = (next: Partial<PinterestEnhancedMatchFixture>) =>
    setInputs((prev) => ({ ...prev, pinterestEnhanced: { ...prev.pinterestEnhanced, ...next } }));

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
        "Stress-test: shift all 6 gates to the FAIL band (low match rate, low coverage, low EMQ / enhanced match)?\n\nThis overwrites any operator-entered numbers in this browser.",
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
  const snapGates = report.gates.filter((g) => g.platform === "snap");
  const pinterestGates = report.gates.filter((g) => g.platform === "pinterest");
  const snapPassed = snapGates.filter((g) => g.passed).length;
  const pinterestPassed = pinterestGates.filter((g) => g.passed).length;

  return (
    <div
      id="snap-pinterest-attribution-audit"
      className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", fleetRingColor)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Interactive audit · Move #6.7 verification (Snap + Pinterest)
          </span>
          <h3 className="text-base font-semibold leading-tight">
            Snap + Pinterest attribution quality — score 6 gates in 3 minutes
          </h3>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Same math as{" "}
            <code className="font-mono text-[11px]">scripts/snap_pinterest_attribution_audit.py</code>.
            Enter 6 diagnostic JSON snapshots across 2 platforms x 3 gates from Snap Pixel
            Manager &gt; Diagnostics and Pinterest Tag Manager &gt; Diagnostics (last 7d):
            <strong> Snap</strong> Gate A CAPI match + dedup + coverage (target ≥ 80% / [0.7, 1.5] / ≥ 92%),
            Snap Gate C Pixel coverage (target ≥ 88%), Snap Gate D EMQ (target ≥ 70%);{" "}
            <strong>Pinterest</strong> Gate A&apos; CAPI match + dedup + coverage (target ≥ 85% / [0.7, 1.5] / ≥ 93%),
            Pinterest Gate C&apos; Tag coverage (target ≥ 85%), Pinterest Gate D&apos; Enhanced Match (target ≥ 75%).
            The panel scores all 6 gates and surfaces prioritized remediation text per failure.
            Inputs persist to your browser; use seed/stress buttons to demo PASS and FAIL bands
            without typing 16 numbers.
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
            {report.total_count === 0
              ? "Enter diagnostic data below"
              : `${report.passed_count} of 6 PASS`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall</span>
          <span
            className={cn(
              "text-xl font-semibold tabular-nums",
              report.overall_passed
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-rose-700 dark:text-rose-400",
            )}
          >
            {report.overall_passed ? "ALL PASS" : "SOME FAIL"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {report.overall_passed ? "✓ Ship it" : "✗ Investigate failed gates"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Snap</span>
          <span className="text-xl font-semibold tabular-nums">
            {snapPassed}
            <span className="text-base text-muted-foreground font-normal"> / {snapGates.length}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">4th-largest paid social</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pinterest</span>
          <span className="text-xl font-semibold tabular-nums">
            {pinterestPassed}
            <span className="text-base text-muted-foreground font-normal"> / {pinterestGates.length}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">5th-largest paid social</span>
        </div>
      </div>

      {/* Snap input panels */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Snap diagnostic inputs (Snap Pixel Manager &gt; Diagnostics &gt; last 7d)
        </span>

        {/* Snap Gate A — CAPI match + dedup + coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Snap Gate A · snap_capi_match.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Snap CAPI event_id match rate + dedup ratio + coverage
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: match rate ≥ {CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_MATCH_RATE_PCT}% · dedup in [{CANONICAL_THRESHOLDS.MIN_SNAP_DEDUP_RATIO}, {CANONICAL_THRESHOLDS.MAX_SNAP_DEDUP_RATIO}] · coverage ≥ {CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_COVERAGE_PCT}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Pixel events"
              value={inputs.snapCapi.pixel_events ?? 0}
              onChange={(v) => setSnapCapi({ pixel_events: clamp(v, 0, 1_000_000) })}
              hint="Browser-side Snap pixel fires"
            />
            <NumberInput
              label="CAPI events"
              value={inputs.snapCapi.capi_events ?? 0}
              onChange={(v) => setSnapCapi({ capi_events: clamp(v, 0, 1_000_000) })}
              hint="Server-side CAPI fires"
            />
            <NumberInput
              label="Matched events"
              value={inputs.snapCapi.matched_events ?? 0}
              onChange={(v) => setSnapCapi({ matched_events: clamp(v, 0, 1_000_000) })}
              hint="Pixel + CAPI deduped on event_id"
            />
            <NumberInput
              label="Expected orders (7d)"
              value={inputs.snapCapi.expected_orders_last_7d ?? 0}
              onChange={(v) =>
                setSnapCapi({ expected_orders_last_7d: clamp(v, 0, 100_000) })
              }
              hint="From Shopify Analytics"
            />
          </div>
        </div>

        {/* Snap Gate C — Pixel coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Snap Gate C · snap_pixel_coverage.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Snap Pixel coverage (browser-side intent signals)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: pixel coverage ≥ {CANONICAL_THRESHOLDS.MIN_SNAP_PIXEL_COVERAGE_PCT}% of expected pageviews
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Pixel fired count"
              value={inputs.snapPixel.pixel_fired_count ?? 0}
              onChange={(v) => setSnapPixel({ pixel_fired_count: clamp(v, 0, 10_000_000) })}
              hint="Pageview events captured"
            />
            <NumberInput
              label="Expected pageviews"
              value={inputs.snapPixel.expected_pageviews ?? 0}
              onChange={(v) => setSnapPixel({ expected_pageviews: clamp(v, 0, 10_000_000) })}
              hint="From Shopify or GA4 same window"
            />
          </div>
        </div>

        {/* Snap Gate D — EMQ */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Snap Gate D · snap_emq.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Snap Email Matching Quality (EMQ) coverage
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: EMQ coverage ≥ {CANONICAL_THRESHOLDS.MIN_SNAP_EMQ_PCT}% of total events (enable mobile_advertiser_id for iOS match rates)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="EMQ coverage %"
              value={inputs.snapEmq.emq_coverage_pct ?? 0}
              onChange={(v) => setSnapEmq({ emq_coverage_pct: clamp(v, 0, 100) })}
              step={0.1}
              hint="Or derive from matched / total"
              suffix="%"
            />
            <NumberInput
              label="Matched with identifier"
              value={inputs.snapEmq.matched_with_identifier ?? 0}
              onChange={(v) =>
                setSnapEmq({ matched_with_identifier: clamp(v, 0, 10_000_000) })
              }
              hint="Events with email/phone hashed"
            />
            <NumberInput
              label="Total events"
              value={inputs.snapEmq.total_events ?? 0}
              onChange={(v) => setSnapEmq({ total_events: clamp(v, 0, 10_000_000) })}
              hint="All Snap Purchase events in window"
            />
          </div>
        </div>
      </div>

      {/* Pinterest input panels */}
      <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Pinterest diagnostic inputs (Pinterest Tag Manager &gt; Diagnostics &gt; last 7d)
        </span>

        {/* Pinterest Gate A' — CAPI match + dedup + coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Pinterest Gate A&apos; · pinterest_capi_match.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Pinterest CAPI event_id match rate + dedup ratio + coverage
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: match rate ≥ {CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_MATCH_RATE_PCT}% · dedup in [{CANONICAL_THRESHOLDS.MIN_PINTEREST_DEDUP_RATIO}, {CANONICAL_THRESHOLDS.MAX_PINTEREST_DEDUP_RATIO}] · coverage ≥ {CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_COVERAGE_PCT}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Pixel events"
              value={inputs.pinterestCapi.pixel_events ?? 0}
              onChange={(v) => setPinterestCapi({ pixel_events: clamp(v, 0, 1_000_000) })}
              hint="Browser-side Pinterest tag fires"
            />
            <NumberInput
              label="CAPI events"
              value={inputs.pinterestCapi.capi_events ?? 0}
              onChange={(v) => setPinterestCapi({ capi_events: clamp(v, 0, 1_000_000) })}
              hint="Server-side CAPI fires"
            />
            <NumberInput
              label="Matched events"
              value={inputs.pinterestCapi.matched_events ?? 0}
              onChange={(v) => setPinterestCapi({ matched_events: clamp(v, 0, 1_000_000) })}
              hint="Pixel + CAPI deduped on event_id"
            />
            <NumberInput
              label="Expected orders (7d)"
              value={inputs.pinterestCapi.expected_orders_last_7d ?? 0}
              onChange={(v) =>
                setPinterestCapi({ expected_orders_last_7d: clamp(v, 0, 100_000) })
              }
              hint="From Shopify Analytics"
            />
          </div>
        </div>

        {/* Pinterest Gate C' — Tag coverage */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Pinterest Gate C&apos; · pinterest_tag_coverage.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Pinterest Tag coverage (browser-side intent signals)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: tag coverage ≥ {CANONICAL_THRESHOLDS.MIN_PINTEREST_TAG_COVERAGE_PCT}% of expected pageviews (lower than Meta/TikTok — fewer coverage-fidelity optimizations)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Tag fired count"
              value={inputs.pinterestTag.tag_fired_count ?? 0}
              onChange={(v) => setPinterestTag({ tag_fired_count: clamp(v, 0, 10_000_000) })}
              hint="PageVisit events captured"
            />
            <NumberInput
              label="Expected pageviews"
              value={inputs.pinterestTag.expected_pageviews ?? 0}
              onChange={(v) => setPinterestTag({ expected_pageviews: clamp(v, 0, 10_000_000) })}
              hint="From Shopify or GA4 same window"
            />
          </div>
        </div>

        {/* Pinterest Gate D' — Enhanced Match */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-muted-foreground">
                Pinterest Gate D&apos; · pinterest_enhanced_match.json
              </span>
              <span className="text-sm font-semibold leading-tight">
                Pinterest Enhanced Match coverage (email + external_id)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: enhanced match coverage ≥ {CANONICAL_THRESHOLDS.MIN_PINTEREST_ENHANCED_MATCH_PCT}% of total events
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
            <NumberInput
              label="Enhanced match coverage %"
              value={inputs.pinterestEnhanced.enhanced_match_coverage_pct ?? 0}
              onChange={(v) =>
                setPinterestEnhanced({ enhanced_match_coverage_pct: clamp(v, 0, 100) })
              }
              step={0.1}
              hint="Or derive from matched / total"
              suffix="%"
            />
            <NumberInput
              label="Matched with identifier"
              value={inputs.pinterestEnhanced.matched_with_identifier ?? 0}
              onChange={(v) =>
                setPinterestEnhanced({ matched_with_identifier: clamp(v, 0, 10_000_000) })
              }
              hint="Events with email hashed"
            />
            <NumberInput
              label="Total events"
              value={inputs.pinterestEnhanced.total_events ?? 0}
              onChange={(v) =>
                setPinterestEnhanced({ total_events: clamp(v, 0, 10_000_000) })
              }
              hint="All Pinterest Checkout events in window"
            />
          </div>
        </div>
      </div>

      {/* Per-gate verdict list — split by platform */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Per-gate verdicts (worst-first)
        </span>
        <div className="flex flex-col gap-2">
          {[...failedGates, ...passedGates].map((g) => (
            <div
              key={g.gate_name}
              className={cn(
                "rounded-lg border p-3 flex flex-col gap-1.5",
                verdictBadgeClasses(g.passed),
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] opacity-70">
                    [{g.platform}] {g.gate_name}
                  </span>
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
          Defaults match a $500–$5k/mo Snap+Pinterest combined spend case (Path B weekly cadence,
          6 gates × canonical 80% / 92% / 85% / 93% / [0.7, 1.5] Snap+Pinterest dedup band /
          88% Snap pixel coverage / 85% Pinterest tag coverage / 70% Snap EMQ / 75% Pinterest
          enhanced match thresholds pinned by{" "}
          <code className="font-mono text-[11px]">test_canonical_thresholds_published</code>).
          Open playbook{" "}
          <code className="font-mono text-[11px]">06.7-snap-pinterest-attribution-quality-audit</code>{" "}
          for the full Move #6.7 verification gate list + Slack/Linear alert wiring.
        </span>
        <span className="font-mono text-[10px]">
          {passedGates.length}/{report.total_count} PASS
        </span>
      </div>
    </div>
  );
}