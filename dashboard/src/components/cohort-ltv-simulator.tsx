"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { formatInt, formatPercent, formatUsd } from "@/lib/format";
import { loadYourStore } from "@/lib/your-store";
import {
  COHORT_LTV_STORAGE_KEY,
  COHORT_PROFILES,
  COHORT_SHIFT_PRESETS,
  DEFAULT_COHORT_MIX,
  normalizeCohortMix,
  shiftCohortMix,
  simulateCohortLtv,
  type CohortLtvInputs,
  type CohortLtvResult,
  type CohortProfile,
} from "@/lib/cohort-ltv-simulator";
import { cn } from "@/lib/utils";

/**
 * `Cohort LTV Simulator` — Move #N.62 — interactive cross-tool on `/today`.
 *
 * 5-cohort LTV simulator that splits the operator's monthly orders into
 * VIP / Loyal / First-time / Mobile-browse / Dormant and projects each
 * cohort's 12-month LTV + repeat rate × contribution to revenue.
 *
 * Why a simulator (vs a static dashboard widget):
 *
 *   Operators can re-mix the cohort sliders and see live revenue shift.
 *   Three preset "shifts" represent canonical lifecycle interventions
 *   (browse-abandon flow → move mobile-browse into first-time; winback
 *   → move dormant into loyal; VIP tier-up → move loyal into VIP).
 *
 *   The simulator answers: "If I ship this flow, what happens to my
 *   12-month revenue + average LTV + repeat rate?" — the canonical
 *   "I have cohorts on paper but can't model moves between them" gap.
 *
 * Inputs:
 *   - Reads Your-Store (`ecom-ops:your-store:v1`) on mount for AOV /
 *     orders / margin defaults.
 *   - Reads cohort mix from `ecom-ops:cohort-ltv-simulator:v1` so the
 *     operator's edits persist across reloads.
 *   - 5 sliders (one per cohort) — total auto-normalizes to 100%.
 *
 * Outputs:
 *   - Per-cohort row: share% · cohort AOV · 12-mo LTV · 12-mo revenue ·
 *     revenue-share bar.
 *   - Aggregate strip: total 12-mo revenue · margin · orders · avg LTV
 *     · weighted repeat rate · LTV band · repeat band.
 *   - Copy-as-markdown report for Slack/Notion handoff.
 *
 * Hydration: standard `useState(false)` + `useEffect` mirror — SSR
 * markup mirrors first client render (4-skeleton stub).
 *
 * Cross-tab sync: listens to `storage` events for the two keys
 * (Your-store + cohort-mix) so an edit on `/settings` or another tab
 * propagates within ~1s.
 */

const HORIZON_OPTIONS = [6, 12, 24] as const;

interface StoredState {
  cohortMix: Record<CohortProfile["id"], number>;
  horizonMonths: number;
}

const EMPTY_STATE: StoredState = {
  cohortMix: { ...DEFAULT_COHORT_MIX },
  horizonMonths: 12,
};

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COHORT_LTV_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const mix = parsed.cohortMix as Record<string, number> | undefined;
    if (!mix) return null;
    const merged: Record<CohortProfile["id"], number> = { ...DEFAULT_COHORT_MIX };
    for (const profile of COHORT_PROFILES) {
      const v = Number(mix[profile.id]);
      if (Number.isFinite(v)) merged[profile.id] = Math.max(0, v);
    }
    const horizon = Number(parsed.horizonMonths);
    return {
      cohortMix: merged,
      horizonMonths: [6, 12, 24].includes(horizon) ? horizon : 12,
    };
  } catch {
    return null;
  }
}

function saveStoredState(s: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COHORT_LTV_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

const BAND_TONE: Record<string, string> = {
  great: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  healthy: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  weak: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const BAND_LABEL: Record<string, string> = {
  great: "Great",
  healthy: "Healthy",
  weak: "Weak",
  danger: "Danger",
};

export function CohortLtvSimulator() {
  const [stored, setStored] = useState<StoredState>(EMPTY_STATE);
  const [yourStore, setYourStore] = useState<{
    monthlyOrders: number;
    aov: number;
    grossMargin: number;
  } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const base = loadStoredState();
    if (base) setStored(base);
    setYourStore(loadYourStore());
    setHydrated(true);
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === COHORT_LTV_STORAGE_KEY) {
        const s = loadStoredState();
        if (s) setStored(s);
      } else if (e.key === "ecom-ops:your-store:v1") {
        setYourStore(loadYourStore());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist on edit.
  useEffect(() => {
    if (!hydrated) return;
    saveStoredState(stored);
  }, [stored, hydrated]);

  const inputs: CohortLtvInputs = useMemo(() => {
    const ys = yourStore ?? {
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
    };
    return {
      monthlyOrders: ys.monthlyOrders,
      aov: ys.aov,
      grossMargin: ys.grossMargin,
      cohortMix: stored.cohortMix,
      horizonMonths: stored.horizonMonths,
    };
  }, [yourStore, stored]);

  const result: CohortLtvResult = useMemo(
    () => simulateCohortLtv(inputs),
    [inputs],
  );

  function updateCohortShare(id: CohortProfile["id"], value: number) {
    setStored((s) => ({
      ...s,
      cohortMix: { ...s.cohortMix, [id]: Math.max(0, Math.min(100, value)) },
    }));
  }

  function applyPreset(preset: (typeof COHORT_SHIFT_PRESETS)[number]) {
    setStored((s) => ({
      ...s,
      cohortMix: shiftCohortMix(s.cohortMix, preset.from, preset.to, preset.deltaPp),
    }));
  }

  function reset() {
    setStored({ cohortMix: { ...DEFAULT_COHORT_MIX }, horizonMonths: 12 });
  }

  const markdownReport = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# 5-Cohort LTV Simulator — ${result.horizonMonths}-month projection`);
    lines.push("");
    lines.push(
      `**Inputs:** ${formatInt(inputs.monthlyOrders)} orders/mo · ${formatUsd(inputs.aov)} AOV · ${formatPercent(inputs.grossMargin, 0)} gross margin`,
    );
    lines.push("");
    lines.push("| Cohort | Share | AOV | 12-mo LTV | 12-mo revenue | Revenue share |");
    lines.push("|---|---|---|---|---|---|");
    for (const r of result.rows) {
      lines.push(
        `| ${r.label} | ${r.sharePercent.toFixed(1)}% | ${formatUsd(r.cohortAov)} | ${formatUsd(r.ltv)} | ${formatUsd(r.cohortRevenue)} | ${formatPercent(r.revenueShare, 1)} |`,
      );
    }
    lines.push("");
    lines.push(`**Total revenue (${result.horizonMonths}mo):** ${formatUsd(result.totalRevenue)}`);
    lines.push(`**Total margin (${result.horizonMonths}mo):** ${formatUsd(result.totalMargin)}`);
    lines.push(`**Total orders (${result.horizonMonths}mo):** ${formatInt(result.totalOrders)}`);
    lines.push(`**Avg LTV per customer:** ${formatUsd(result.avgLtv)} · band: ${BAND_LABEL[result.ltvBand]}`);
    lines.push(`**Weighted repeat rate:** ${formatPercent(result.weightedRepeatRate, 1)} · band: ${BAND_LABEL[result.repeatBand]}`);
    return lines.join("\n");
  }, [result, inputs]);

  // Pre-hydration stub — deterministic 4-skeleton row, no client-only
  // state, so SSR markup matches first paint.
  if (!hydrated) {
    return (
      <Card id="cohort-ltv-simulator" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />
            <CardTitle className="text-sm font-semibold">
              5-Cohort LTV Simulator
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Move #N.62
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Project per-cohort LTV + 12-month revenue from your Your-store numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-full rounded bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="cohort-ltv-simulator" className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />
            <CardTitle className="text-sm font-semibold">
              5-Cohort LTV Simulator
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Move #N.62
            </Badge>
            {yourStore ? (
              <Badge variant="outline" className="text-[10px] border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                Reading Your-store
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Using defaults
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CopyButton
              label="Copy report"
              value={markdownReport}
            />
            <button
              type="button"
              onClick={reset}
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              aria-label="Reset cohort mix to defaults"
            >
              Reset
            </button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Move the sliders to re-mix your 5 cohorts. See live LTV × repeat ×
          revenue per cohort. Preset shifts represent real lifecycle
          interventions (browse-abandon → first-time, winback → loyal,
          VIP tier-up).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Horizon picker + headline numbers */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Horizon
            </span>
            <div className="flex gap-1">
              {HORIZON_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() =>
                    setStored((s) => ({ ...s, horizonMonths: h }))
                  }
                  className={cn(
                    "rounded border px-2 py-1 text-[10px] font-medium tabular-nums",
                    stored.horizonMonths === h
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={`Set horizon to ${h} months`}
                >
                  {h}mo
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total revenue
              </div>
              <div className="font-mono tabular-nums font-semibold">
                {formatUsd(result.totalRevenue)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Margin
              </div>
              <div className="font-mono tabular-nums">
                {formatUsd(result.totalMargin)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Avg LTV
              </div>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                {formatUsd(result.avgLtv)}
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", BAND_TONE[result.ltvBand])}
                >
                  {BAND_LABEL[result.ltvBand]}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Repeat rate
              </div>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                {formatPercent(result.weightedRepeatRate, 1)}
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", BAND_TONE[result.repeatBand])}
                >
                  {BAND_LABEL[result.repeatBand]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Per-cohort sliders + row table */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {COHORT_PROFILES.map((profile, idx) => {
              const r = result.rows[idx];
              const share = stored.cohortMix[profile.id];
              return (
                <div
                  key={profile.id}
                  className="rounded border border-border p-2"
                  data-cohort={profile.id}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">
                        {profile.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {profile.description}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums text-xs">
                      <div className="font-semibold">{share.toFixed(1)}%</div>
                      <div className="text-[10px] text-muted-foreground">
                        LTV {formatUsd(r.ltv)}
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={share}
                    onChange={(e) =>
                      updateCohortShare(profile.id, Number(e.target.value))
                    }
                    aria-label={`${profile.label} share`}
                    className="mt-2 w-full accent-foreground"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      AOV {formatUsd(r.cohortAov)} ·{" "}
                      {formatUsd(r.cohortRevenue)} rev
                    </span>
                    <span className="tabular-nums">
                      {formatPercent(r.revenueShare, 0)} of total
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full bg-foreground"
                      style={{ width: `${Math.min(100, r.revenueShare * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Preset shifts */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Try a shift
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            {COHORT_SHIFT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded border border-border p-2 text-left text-xs hover:border-foreground"
                aria-label={`Apply ${preset.label} shift`}
              >
                <div className="font-semibold text-foreground">
                  {preset.label}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}