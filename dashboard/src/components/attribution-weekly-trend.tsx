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
import { CopyButton } from "@/components/copy-button";
import {
  buildWeeklyTrend,
  CANONICAL_TREND_THRESHOLDS,
  canonicalStableTrend,
  renderWeeklyTrendMarkdown,
  stressFailTrend,
  WeeklyRollupEntry,
  WeeklyTrendResult,
} from "@/lib/attribution-weekly-trend";
import { cn } from "@/lib/utils";

/**
 * Attribution Weekly Trend Tracker (Move #6.5 weekly-rollup-trend).
 *
 * The 1-vs-1 drift detector (`AttributionDriftRollup`) catches a single
 * week-vs-last-week match-rate drop ≥ 3pp. But it misses SLOW EROSION:
 * a match-rate drifting -0.4pp/week for 6 weeks = -2.4pp cumulative
 * which the 1-vs-1 detector still flags as <3.0pp each individual
 * week, while the TREND is clearly negative. This tracker closes that
 * gap by looking at up to 12 weekly rollups and computing:
 *
 *   - cumulative_delta per platform per metric (oldest → newest)
 *   - consecutive_decline_weeks (trailing-streak count)
 *   - direction per platform (improving | declining | stable)
 *   - fire-or-not vs the canonical thresholds (3.0pp match, 2.0pp
 *     coverage, 4-week consecutive decline)
 *
 * Browser port of `scripts/attribution_weekly_rollup_trend.py`. Inputs
 * persist to localStorage (`ecom-ops:attribution-weekly-trend:v1`) so
 * the operator can keep adding weeks over multiple sessions.
 */

const STORAGE_KEY = "ecom-ops:attribution-weekly-trend:v1";
const MAX_WEEKS = CANONICAL_TREND_THRESHOLDS.TREND_WINDOW_WEEKS;

const SEVERITY_STYLES: Record<"info" | "warning" | "critical", string> = {
  info: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  critical: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

const DIRECTION_STYLES: Record<"improving" | "declining" | "stable", string> = {
  improving: "text-emerald-700 dark:text-emerald-300",
  declining: "text-rose-700 dark:text-rose-300",
  stable: "text-muted-foreground",
};

const DIRECTION_GLYPH: Record<"improving" | "declining" | "stable", string> = {
  improving: "↑",
  declining: "↓",
  stable: "→",
};

function emptyWeek(indexFromEnd: number): WeeklyRollupEntry {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7 * indexFromEnd);
  return {
    weekEnding: d.toISOString().slice(0, 10),
    matchRates: {},
    coverages: {},
  };
}

function defaultWeeks(): WeeklyRollupEntry[] {
  // Empty 12-week skeleton — operators fill the most recent weeks.
  return Array.from({ length: MAX_WEEKS }, (_, i) =>
    emptyWeek(MAX_WEEKS - 1 - i),
  );
}

function isComplete(week: WeeklyRollupEntry): boolean {
  return (
    Object.keys(week.matchRates).length > 0 &&
    Object.keys(week.coverages).length > 0
  );
}

function parseStored(): WeeklyRollupEntry[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return null;
    // Accept any length up to MAX_WEEKS, falling back to default skeleton.
    return parsed.slice(-MAX_WEEKS).map((w: Partial<WeeklyRollupEntry>) => ({
      weekEnding: String(w.weekEnding ?? ""),
      matchRates: w.matchRates && typeof w.matchRates === "object" ? w.matchRates : {},
      coverages: w.coverages && typeof w.coverages === "object" ? w.coverages : {},
    }));
  } catch {
    return null;
  }
}

function persist(weeks: WeeklyRollupEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
  } catch {
    // Ignore storage failures (e.g. SSR or quota).
  }
}

function platformList(weeks: WeeklyRollupEntry[]): string[] {
  const set = new Set<string>();
  for (const w of weeks) {
    Object.keys(w.matchRates ?? {}).forEach((k) => set.add(k));
    Object.keys(w.coverages ?? {}).forEach((k) => set.add(k));
  }
  return Array.from(set).sort();
}

function formatPp(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}pp`;
}

export function AttributionWeeklyTrend() {
  const [weeks, setWeeks] = useState<WeeklyRollupEntry[]>(defaultWeeks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = parseStored();
    if (stored) setWeeks(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persist(weeks);
  }, [weeks, hydrated]);

  const platforms = useMemo(() => platformList(weeks), [weeks]);
  const result: WeeklyTrendResult = useMemo(
    () => buildWeeklyTrend({ weeks }),
    [weeks],
  );
  const markdown = useMemo(() => renderWeeklyTrendMarkdown(result), [result]);

  function updateWeek(idx: number, patch: Partial<WeeklyRollupEntry>): void {
    setWeeks((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function updatePlatformValue(
    idx: number,
    metric: "matchRates" | "coverages",
    platform: string,
    raw: string,
  ): void {
    const value = raw === "" ? undefined : Number(raw);
    setWeeks((prev) => {
      const next = prev.slice();
      const week = { ...next[idx] };
      const map = { ...(metric === "matchRates" ? week.matchRates : week.coverages) };
      if (value === undefined || Number.isNaN(value)) delete map[platform];
      else map[platform] = value;
      if (metric === "matchRates") week.matchRates = map;
      else week.coverages = map;
      next[idx] = week;
      return next;
    });
  }

  function addPlatform(platform: string): void {
    if (!platform || platforms.includes(platform)) return;
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        matchRates: { ...w.matchRates, [platform]: w.matchRates[platform] ?? 0 },
        coverages: { ...w.coverages, [platform]: w.coverages[platform] ?? 0 },
      })),
    );
  }

  function removePlatform(platform: string): void {
    setWeeks((prev) =>
      prev.map((w) => {
        const m = { ...w.matchRates };
        const c = { ...w.coverages };
        delete m[platform];
        delete c[platform];
        return { ...w, matchRates: m, coverages: c };
      }),
    );
  }

  function loadSeed(seed: WeeklyRollupEntry[]): void {
    setWeeks(seed);
  }

  function resetAll(): void {
    setWeeks(defaultWeeks());
  }

  const completeWeekCount = weeks.filter(isComplete).length;
  const canShowTrend = completeWeekCount >= 2;
  const directionEntries = Object.entries(result.perPlatformTrend);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">
              Weekly trend tracker (12-week)
            </CardTitle>
            <CardDescription>
              Browser port of{" "}
              <code className="font-mono text-[11px]">
                scripts/attribution_weekly_rollup_trend.py
              </code>
              . Detects slow-erosion match-rate / coverage drift that the
              1-vs-1 cross-platform drift detector misses.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={SEVERITY_STYLES[result.severity]}
            >
              {result.severity}
            </Badge>
            <Badge
              variant="outline"
              className={
                result.overallPassed
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
              }
            >
              {result.overallPassed ? "pass" : "fail"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {completeWeekCount} of {MAX_WEEKS} weeks complete · thresholds:{" "}
            {CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP}pp
            match ·{" "}
            {CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP}pp
            cov ·{" "}
            {CANONICAL_TREND_THRESHOLDS.FIRE_ON_CONSECUTIVE_DECLINE_WEEKS}-week
            streak
          </span>
          <span className="flex-1" />
          <button
            type="button"
            className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            onClick={() => loadSeed(canonicalStableTrend())}
          >
            Load stable seed
          </button>
          <button
            type="button"
            className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            onClick={() => loadSeed(stressFailTrend())}
          >
            Load fail-all seed
          </button>
          <button
            type="button"
            className="rounded px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={resetAll}
          >
            Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">Week ending</th>
                {platforms.length === 0 ? (
                  <th className="text-left p-2 font-medium text-muted-foreground italic">
                    (add a platform below)
                  </th>
                ) : (
                  platforms.flatMap((p) => [
                    <th
                      key={`${p}-m`}
                      className="text-right p-2 font-medium whitespace-nowrap"
                    >
                      {p} · match %
                    </th>,
                    <th
                      key={`${p}-c`}
                      className="text-right p-2 font-medium whitespace-nowrap"
                    >
                      {p} · cov %
                    </th>,
                  ])
                )}
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => (
                <tr
                  key={`week-${idx}`}
                  className={cn(
                    "border-b border-border/40",
                    !isComplete(week) && "opacity-50",
                  )}
                >
                  <td className="p-2 whitespace-nowrap">
                    <input
                      type="date"
                      className="w-[140px] rounded border border-input bg-background px-2 py-1 text-xs"
                      value={week.weekEnding}
                      onChange={(e) =>
                        updateWeek(idx, { weekEnding: e.target.value })
                      }
                    />
                  </td>
                  {platforms.length === 0 ? (
                    <td className="p-2 text-muted-foreground italic">—</td>
                  ) : (
                    platforms.flatMap((p) => [
                      <td key={`${idx}-${p}-m`} className="p-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          aria-label={`${p} match rate for week ${week.weekEnding}`}
                          className="w-[78px] rounded border border-input bg-background px-2 py-1 text-xs text-right tabular-nums"
                          value={week.matchRates[p] ?? ""}
                          onChange={(e) =>
                            updatePlatformValue(
                              idx,
                              "matchRates",
                              p,
                              e.target.value,
                            )
                          }
                        />
                      </td>,
                      <td key={`${idx}-${p}-c`} className="p-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          aria-label={`${p} coverage for week ${week.weekEnding}`}
                          className="w-[78px] rounded border border-input bg-background px-2 py-1 text-xs text-right tabular-nums"
                          value={week.coverages[p] ?? ""}
                          onChange={(e) =>
                            updatePlatformValue(
                              idx,
                              "coverages",
                              p,
                              e.target.value,
                            )
                          }
                        />
                      </td>,
                    ])
                  )}
                  <td className="p-1 text-right text-muted-foreground text-[10px]">
                    W-{MAX_WEEKS - 1 - idx}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PlatformManager
          platforms={platforms}
          onAdd={addPlatform}
          onRemove={removePlatform}
        />

        {canShowTrend ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-border bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cumulative match-rate max-drift
                </div>
                <div className="text-2xl font-semibold tabular-nums">
                  {result.cumulativeDrift.matchRateMaxDriftPp.toFixed(2)}pp
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  across {result.weeksAnalyzed} weeks · threshold{" "}
                  {CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP}pp
                </div>
              </div>
              <div className="rounded border border-border bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cumulative coverage max-drift
                </div>
                <div className="text-2xl font-semibold tabular-nums">
                  {result.cumulativeDrift.coverageMaxDriftPp.toFixed(2)}pp
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  across {result.weeksAnalyzed} weeks · threshold{" "}
                  {CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP}pp
                </div>
              </div>
            </div>

            {directionEntries.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Per-platform trend
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {directionEntries.map(([platform, trend]) => (
                    <div
                      key={platform}
                      className="rounded border border-border p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{platform}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {trend.matchRate.consecutiveDeclineWeeks}-week
                          streak
                        </span>
                      </div>
                      <div
                        className={cn(
                          "tabular-nums",
                          DIRECTION_STYLES[trend.matchRate.direction],
                        )}
                      >
                        {DIRECTION_GLYPH[trend.matchRate.direction]} match:{" "}
                        {formatPp(trend.matchRate.cumulativeDelta)}
                      </div>
                      <div
                        className={cn(
                          "tabular-nums",
                          DIRECTION_STYLES[trend.coverage.direction],
                        )}
                      >
                        {DIRECTION_GLYPH[trend.coverage.direction]} coverage:{" "}
                        {formatPp(trend.coverage.cumulativeDelta)}
                      </div>
                      <Sparkline
                        values={trend.matchRate.values}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.firedRules.length > 0 && (
              <div className="rounded border border-rose-500/30 bg-rose-500/5 p-3 text-xs space-y-1">
                <div className="font-semibold text-rose-700 dark:text-rose-300">
                  {result.firedRules.length} rule
                  {result.firedRules.length === 1 ? "" : "s"} fired
                </div>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.firedRules.map((rule, i) => (
                    <li key={i}>{rule.detail}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded border border-border bg-muted/20 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-semibold">Remediation</div>
                <CopyButton value={markdown} label="Copy report" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {result.remediation}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded border border-dashed border-border p-4 text-xs text-muted-foreground">
            Enter match-rate and coverage values for at least 2 weeks on at
            least 1 platform to see the trend analysis. Use{" "}
            <strong>Load stable seed</strong> for a passing baseline or{" "}
            <strong>Load fail-all seed</strong> for a stress test that fires
            all 3 rules.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlatformManager({
  platforms,
  onAdd,
  onRemove,
}: {
  platforms: string[];
  onAdd: (platform: string) => void;
  onRemove: (platform: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">Platforms:</span>
      {platforms.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5"
        >
          {p}
          <button
            type="button"
            className="text-muted-foreground hover:text-rose-500"
            onClick={() => onRemove(p)}
            aria-label={`Remove ${p}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder="Add platform…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            onAdd(draft.trim());
            setDraft("");
          }
        }}
        className="w-[120px] rounded border border-input bg-background px-2 py-1 text-xs"
      />
      <button
        type="button"
        className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
        onClick={() => {
          if (draft.trim()) {
            onAdd(draft.trim());
            setDraft("");
          }
        }}
      >
        Add
      </button>
    </div>
  );
}

function Sparkline({
  values,
  className,
}: {
  values: Array<number | null>;
  className?: string;
}) {
  const clean = values.filter((v): v is number => v !== null);
  if (clean.length < 2) return null;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const width = 220;
  const height = 32;
  const stepX = width / (clean.length - 1);
  const points = clean
    .map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`)
    .join(" ");
  const last = clean[clean.length - 1];
  const first = clean[0];
  const trend = last > first ? "stroke-emerald-500" : last < first ? "stroke-rose-500" : "stroke-muted-foreground";
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Match rate trend sparkline"
    >
      <polyline
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={trend}
        points={points}
      />
    </svg>
  );
}
