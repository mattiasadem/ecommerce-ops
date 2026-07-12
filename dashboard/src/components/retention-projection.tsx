"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RetentionInputs,
  RetentionProjection,
  Voice,
  VOICE_BANDS,
  TIER_SPECS,
  RETENTION_DEFAULTS,
  BAND_LABEL,
  bandToneStyles,
  classifyRpr,
  projectRetention,
  renderRetentionMarkdown,
} from "@/lib/retention-projection";
import { formatInt, formatPercent, formatUsd } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import {
  YOUR_STORE_DEFAULTS,
  YourStoreInputs,
  loadYourStore,
} from "@/lib/your-store";
import { cn } from "@/lib/utils";

/**
 * `Retention Projection Calculator` — interactive scoring engine on
 * `/retention`. The 4 reference tables on `/retention` (order-of-build
 * stack + table-stakes six flows + shipped playbooks + cross-references)
 * are static ResearchTables with no live numbers. This panel closes the
 * loop: the operator enters their real monthly-orders / AOV / gross-margin
 * (pulled from `ecom-ops:your-store:v1` on Overview) + their current
 * 12-month repeat-purchase-rate + their primary brand voice, and sees
 *
 *   - Baseline 12-month LTV per customer (revenue × margin × (1 + RPR))
 *   - Per-tier projection of LTV uplift (Tier 1 / 2 / 3 / 4) — the
 *     canonical research/05 4-tier lifecycle-flow-library build sequence
 *   - Year-1 incremental revenue per tier
 *   - Year-1 cost stack (one-time setup + 12 × recurring) per tier
 *   - Year-1 ROI band per tier
 *   - Recommended tier = smallest tier that lifts the operator into the
 *     "good" or "great" RPR band for their voice
 *   - A health-band chip (great / good / median / below / red flag) for
 *     the current RPR, mirrored against the asset/05 voice-bands
 *
 * State persists to localStorage (`ecom-ops:retention-projection:v1`) so
 * the operator's tuning survives reloads. The 3 inputs from Your-store
 * remain the canonical source (read-only, refreshed on focus via the
 * `storage` event).
 *
 * Mounted on `/retention` between the table-stakes-six card and the
 * shipped-playbooks card so it's the "second thing the operator sees"
 * after the order-of-build reference table.
 */

const STORAGE_KEY = "ecom-ops:retention-projection:v1";

interface StoredState {
  currentRpr: number;
  voice: Voice;
}

function loadStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      currentRpr:
        typeof parsed.currentRpr === "number" &&
        Number.isFinite(parsed.currentRpr)
          ? Math.max(0, Math.min(1, parsed.currentRpr))
          : RETENTION_DEFAULTS.currentRpr,
      voice: (parsed.voice as Voice) ?? RETENTION_DEFAULTS.voice,
    };
  } catch {
    return null;
  }
}

function saveStored(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage may be unavailable; silently degrade */
  }
}

const VOICE_OPTIONS: Voice[] = ["default", "luxury", "sustainable", "gen_z", "b2b"];

const VOICE_LABEL: Record<Voice, string> = Object.fromEntries(
  VOICE_OPTIONS.map((v) => [v, VOICE_BANDS[v].label] as const),
) as Record<Voice, string>;

export function RetentionProjectionCalculator() {
  const [stored, setStored] = useState<StoredState | null>(null);
  const [yourStore, setYourStore] = useState<YourStoreInputs | null>(null);
  const [currentRpr, setCurrentRpr] = useState<number>(RETENTION_DEFAULTS.currentRpr);
  const [voice, setVoice] = useState<Voice>(RETENTION_DEFAULTS.voice);

  // Hydrate from localStorage on mount + listen for cross-page Your-store changes.
  useEffect(() => {
    setStored(loadStored());
    setYourStore(loadYourStore());

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = loadStored();
        setStored(next);
        if (next) {
          setCurrentRpr(next.currentRpr);
          setVoice(next.voice);
        }
      }
      if (e.key === "ecom-ops:your-store:v1") {
        setYourStore(loadYourStore());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // After first hydration, apply stored overrides once.
  useEffect(() => {
    if (stored === null) return;
    setCurrentRpr(stored.currentRpr);
    setVoice(stored.voice);
  }, [stored]);

  // Persist on every change.
  useEffect(() => {
    saveStored({ currentRpr, voice });
  }, [currentRpr, voice]);

  const projection: RetentionProjection = useMemo(() => {
    const ys = yourStore ?? YOUR_STORE_DEFAULTS;
    return projectRetention({
      monthlyOrders: ys.monthlyOrders,
      aov: ys.aov,
      grossMargin: ys.grossMargin,
      currentRpr,
      voice,
    });
  }, [yourStore, currentRpr, voice]);

  const markdown = useMemo(() => renderRetentionMarkdown(projection), [projection]);

  const baselineLtv = projection.baselineLtv12mo;
  const recommendedTier = projection.recommendedTier;
  const recommendedSpec = TIER_SPECS[recommendedTier];

  const yourStoreDetected = yourStore !== null;
  const targetsBandLabel = BAND_LABEL[projection.targetBand];

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:p-6"
      data-testid="retention-projection-calculator"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
          <span>Retention projection</span>
          <span>·</span>
          <span className="text-foreground">4-tier lifecycle library</span>
          <span className="ml-auto text-[10px] tabular-nums">
            {yourStoreDetected ? "Using Your-store" : "Defaults · edit on Overview"}
          </span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          What does shipping the lifecycle library do to your 12-month LTV?
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          {projection.headline}
        </p>
      </header>

      {/* ---- Inputs ---- */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <NumberField
          label="Current 12-month repeat purchase rate"
          value={currentRpr}
          onChange={setCurrentRpr}
          min={0}
          max={1}
          step={0.01}
          suffix="(0% – 100%)"
          format={(v) => formatPercent(v, 1)}
          ariaLabel="Current 12-month repeat purchase rate"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Primary brand voice
          </label>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-5">
            {VOICE_OPTIONS.map((v) => {
              const active = voice === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVoice(v)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  aria-pressed={active}
                >
                  {VOICE_LABEL[v]}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Drives the RPR benchmark band per asset/05 §Metric 5 (Default 20–30% / Lux 30–50% / Sustainable 25–40% / Gen-Z 15–25% / B2B 60–90%).
          </p>
        </div>
      </div>

      {/* ---- Baseline + current band ---- */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricTile
          label="Baseline 12-mo LTV / customer"
          value={formatUsd(baselineLtv)}
          sub={`AOV × margin × (1 + RPR) at ${formatPercent(currentRpr, 0)} RPR`}
        />
        <MetricTile
          label="Current RPR band"
          value={BAND_LABEL[projection.currentBand]}
          sub={`Voice: ${VOICE_LABEL[voice]}`}
          tone={bandToneStyles(projection.currentBand)}
        />
        <MetricTile
          label="Recommended tier"
          value={`Tier ${recommendedTier}`}
          sub={recommendedSpec.label.split("—")[1]?.trim() ?? recommendedSpec.label}
          tone="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
        />
      </div>

      {/* ---- Tier-by-tier projection ---- */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-foreground">
          Tier-by-tier projection
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {projection.tiers.map((t) => {
            const isRecommended = t.tier === recommendedTier;
            const tierBand = classifyRpr(t.projectedRpr, voice);
            return (
              <article
                key={t.tier}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  isRecommended
                    ? "border-sky-500/40 bg-sky-500/5 shadow-sm"
                    : "border-border bg-card",
                )}
                data-tier={t.tier}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold tabular-nums">
                    Tier {t.tier}
                  </h4>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      bandToneStyles(tierBand),
                    )}
                  >
                    {BAND_LABEL[tierBand]}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                  {t.label.split("—")[1]?.trim() ?? t.label}
                </p>

                <dl className="mt-3 flex flex-col gap-1 text-[11px] tabular-nums">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">RPR</dt>
                    <dd className="font-medium">
                      {formatPercent(t.projectedRpr, 1)}{" "}
                      <span className="text-muted-foreground">
                        (+{(t.rprLiftPp * 100).toFixed(0)}pp)
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">12-mo LTV</dt>
                    <dd className="font-medium">{formatUsd(t.ltv12mo)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">LTV lift</dt>
                    <dd className="font-medium text-emerald-700 dark:text-emerald-300">
                      +{formatUsd(t.ltvLiftPerCustomer)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Year-1 incr.</dt>
                    <dd className="font-medium">
                      {formatInt(t.year1IncrementalRevenue / 1000)}k
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Year-1 cost</dt>
                    <dd className="font-medium">
                      ${formatInt(t.year1CostLow / 1000)}k–${formatInt(
                        t.year1CostHigh / 1000,
                      )}k
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-border pt-1 mt-1">
                    <dt className="text-muted-foreground">Year-1 ROI</dt>
                    <dd className="font-semibold tabular-nums">
                      {t.year1RoiLow >= 100
                        ? `${formatInt(t.year1RoiLow)}×`
                        : `${t.year1RoiLow.toFixed(1).replace(/\.0$/, "")}×`}
                      {" – "}
                      {t.year1RoiHigh >= 100
                        ? `${formatInt(t.year1RoiHigh)}×`
                        : `${t.year1RoiHigh.toFixed(1).replace(/\.0$/, "")}×`}
                    </dd>
                  </div>
                </dl>

                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    {t.flows.length} flows
                  </summary>
                  <ul className="mt-1.5 flex flex-col gap-1 text-[11px] text-muted-foreground">
                    {t.flows.map((flow) => (
                      <li key={flow} className="leading-snug">
                        · {flow}
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Annual incremental revenue = LTV lift × {formatInt(projection.inputs.monthlyOrders * 12)} customers/yr (12 × Your-store monthly orders).{" "}
          {projection.targetBand === projection.currentBand
            ? `Already at ${targetsBandLabel} band — Tier 1 recommended as a defensive "lock it in with a built library" move.`
            : `After full Tier 4 library, projected band: ${targetsBandLabel}.`}
        </p>
      </div>

      {/* ---- Rationale ---- */}
      <div className="rounded-md border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Recommended-tier rationale:</strong>{" "}
        {recommendedSpec.rationale}
      </div>

      {/* ---- Action row ---- */}
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          value={markdown}
          label="Copy markdown report"
          className="text-[11px]"
        />
        <button
          type="button"
          onClick={() => {
            setCurrentRpr(RETENTION_DEFAULTS.currentRpr);
            setVoice(RETENTION_DEFAULTS.voice);
          }}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors"
        >
          Reset to defaults
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
          ecom-ops:retention-projection:v1
        </span>
      </div>
    </div>
  );
}

// ----- Sub-components -----------------------------------------------------

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  format: (v: number) => string;
  ariaLabel?: string;
}

function NumberField(props: NumberFieldProps) {
  const { label, value, onChange, min, max, step, suffix, format, ariaLabel } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={`rp-${label}`}>
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5">
        <input
          id={`rp-${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={ariaLabel ?? label}
          className="flex-1 accent-sky-500"
        />
        <span className="min-w-[64px] text-right text-xs font-medium tabular-nums">
          {format(value)}
        </span>
      </div>
      {suffix && (
        <p className="text-[11px] text-muted-foreground">{suffix}</p>
      )}
    </div>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}

function MetricTile(props: MetricTileProps) {
  const { label, value, sub, tone } = props;
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone ?? "border-border bg-card",
      )}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
