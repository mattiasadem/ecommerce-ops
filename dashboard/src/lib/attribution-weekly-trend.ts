/**
 * Attribution weekly trend — browser port of the pure trend-analysis core
 * in `/scripts/attribution_weekly_rollup_trend.py` (Move #6.5 weekly-rollup-trend).
 *
 * The cross-platform drift rollup (`attribution-drift-rollup.ts`) is a
 * 1-vs-1 detector — it compares this cycle vs the last cycle and fires
 * a single drift alert. That misses SLOW EROSION patterns: a match-rate
 * drifting -0.4pp/week for 6 weeks = -2.4pp cumulative which the 1-vs-1
 * detector still flags as <3.0pp each individual week, but the TREND
 * is clearly negative.
 *
 * The weekly-trend layer closes that gap. Operator pastes up to 12
 * weekly rollups (each is a snapshot of per-platform match-rate +
 * coverage) and the panel computes:
 *
 *   1. cumulative_delta per platform per metric (sum-of-weekly-deltas)
 *   2. consecutive_decline_weeks per platform (trailing streak count)
 *   3. direction per platform per metric (improving | declining | stable)
 *   4. fire-or-not vs the canonical thresholds (3.0pp match, 2.0pp
 *      coverage, 4-week consecutive decline)
 *
 * Mirrors the Python CLI thresholds and remediation texts 1:1 — no drift
 * between the browser and the terminal.
 */

export const CANONICAL_TREND_THRESHOLDS = {
  TREND_WINDOW_WEEKS: 12,
  FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP: 3.0,
  FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP: 2.0,
  FIRE_ON_CONSECUTIVE_DECLINE_WEEKS: 4,
} as const;

export const PER_PLATFORM_METRIC_KEYS = ["match_rate", "coverage"] as const;
export type TrendMetricKey = (typeof PER_PLATFORM_METRIC_KEYS)[number];
export type TrendDirection = "improving" | "declining" | "stable";

export interface WeeklyRollupEntry {
  /** ISO date for this rollup (YYYY-MM-DD). Used purely as a UI label. */
  weekEnding: string;
  /** Platform label → value for that week. 0-100 percentage. */
  matchRates: Record<string, number>;
  coverages: Record<string, number>;
}

export interface WeeklyTrendInputs {
  /** Up to TREND_WINDOW_WEEKS weekly rollup entries, oldest first. */
  weeks: WeeklyRollupEntry[];
}

export interface PlatformMetricTrend {
  values: Array<number | null>;
  cumulativeDelta: number;
  consecutiveDeclineWeeks: number;
  direction: TrendDirection;
}

export interface PlatformTrend {
  matchRate: PlatformMetricTrend;
  coverage: PlatformMetricTrend;
}

export interface FiredRule {
  rule:
    | "cumulative_match_rate_drift"
    | "cumulative_coverage_drift"
    | "consecutive_decline";
  detail: string;
  threshold: number;
}

export interface WeeklyTrendResult {
  weeksAnalyzed: number;
  trendWindowWeeks: number;
  perPlatformTrend: Record<string, PlatformTrend>;
  cumulativeDrift: {
    matchRateMaxDriftPp: number;
    coverageMaxDriftPp: number;
  };
  consecutiveDeclinePlatforms: string[];
  firedRules: FiredRule[];
  overallPassed: boolean;
  severity: "info" | "warning" | "critical";
  summary: string;
  remediation: string;
}

type RemediationFn = (weeks: number, threshold: number) => string;
type StableRemediationFn = (weeks: number) => string;
type ConsecutiveDeclineFn = (declineStreak: number, platform: string) => string;

const TREND_REMEDIATION: {
  cumulative_match_rate_drift: RemediationFn;
  cumulative_coverage_drift: RemediationFn;
  consecutive_decline: ConsecutiveDeclineFn;
  all_stable: StableRemediationFn;
} = {
  cumulative_match_rate_drift: (
    weeks: number,
    threshold: number,
  ): string =>
    `Cumulative match-rate drift across the ${weeks}-week trend window exceeds ${threshold}pp threshold. Investigate the Move #6.5/6.6/6.7 per-platform audit fixtures — a slow erosion pattern typically indicates one of the 5 canonical root-cause hypotheses (theme_liquid_update / capi_token_rotation / ios_consent_banner / app_uninstall / advanced_matching_toggle). Run the weekly cadence per playbooks/06.8 §Step 5 to triage.`,
  cumulative_coverage_drift: (
    weeks: number,
    threshold: number,
  ): string =>
    `Cumulative coverage drift across the ${weeks}-week trend window exceeds ${threshold}pp threshold. Investigate per-platform pixel coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 Gate A'. Run the weekly cadence per playbooks/06.8 §Step 5.`,
  consecutive_decline: (
    declineStreak: number,
    platform: string,
  ): string =>
    `${declineStreak} consecutive weeks of declining match-rate direction on ${platform}. Strong signal of slow erosion that 1-vs-1 drift detection misses (individual weeks may stay below the 3.0pp MatchRate-drift threshold while the trend is clearly negative). Run the weekly cadence per playbooks/06.8 §Step 5.`,
  all_stable: (weeks: number): string =>
    `All ${weeks} weeks of trend data show stable-or-improving per-platform match-rate + coverage. Continue the weekly cadence per playbooks/06.8 §Step 5 and re-run this trend tool at next cycle.`,
};

function classifyDirection(
  values: Array<number | null>,
): { cumulative: number; streak: number; direction: TrendDirection } {
  const clean = values.filter((v): v is number => v !== null);
  if (clean.length < 2) {
    return { cumulative: 0, streak: 0, direction: "stable" };
  }
  const cumulative = clean[clean.length - 1] - clean[0];
  let streak = 0;
  for (let i = clean.length - 1; i > 0; i--) {
    if (clean[i] < clean[i - 1]) streak++;
    else break;
  }
  let direction: TrendDirection = "stable";
  if (streak >= 2) direction = "declining";
  else if (cumulative > 0.5) direction = "improving";
  else if (cumulative < -0.5) direction = "declining";
  return { cumulative, streak, direction };
}

export function buildWeeklyTrend(inputs: WeeklyTrendInputs): WeeklyTrendResult {
  const trendWindow = CANONICAL_TREND_THRESHOLDS.TREND_WINDOW_WEEKS;
  const weeks = inputs.weeks.slice(-trendWindow);
  const weeksAnalyzed = weeks.length;

  // Build per-platform × per-metric series.
  const perPlatformSeries: Record<
    string,
    Record<TrendMetricKey, Array<number | null>>
  > = {};
  for (const rollup of weeks) {
    for (const platform of new Set([
      ...Object.keys(rollup.matchRates ?? {}),
      ...Object.keys(rollup.coverages ?? {}),
    ])) {
      if (!perPlatformSeries[platform]) {
        perPlatformSeries[platform] = { match_rate: [], coverage: [] };
      }
      perPlatformSeries[platform].match_rate.push(
        rollup.matchRates?.[platform] ?? null,
      );
      perPlatformSeries[platform].coverage.push(
        rollup.coverages?.[platform] ?? null,
      );
    }
  }

  // Classify each platform × metric.
  const perPlatformTrend: Record<string, PlatformTrend> = {};
  for (const [platform, series] of Object.entries(perPlatformSeries)) {
    const matchCls = classifyDirection(series.match_rate);
    const covCls = classifyDirection(series.coverage);
    perPlatformTrend[platform] = {
      matchRate: {
        values: series.match_rate,
        cumulativeDelta: Number(matchCls.cumulative.toFixed(3)),
        consecutiveDeclineWeeks: matchCls.streak,
        direction: matchCls.direction,
      },
      coverage: {
        values: series.coverage,
        cumulativeDelta: Number(covCls.cumulative.toFixed(3)),
        consecutiveDeclineWeeks: covCls.streak,
        direction: covCls.direction,
      },
    };
  }

  // Aggregate cumulative-drift max-across-platforms (absolute value).
  let maxMatchDrift = 0;
  let maxCoverageDrift = 0;
  for (const metrics of Object.values(perPlatformTrend)) {
    maxMatchDrift = Math.max(
      maxMatchDrift,
      Math.abs(metrics.matchRate.cumulativeDelta),
    );
    maxCoverageDrift = Math.max(
      maxCoverageDrift,
      Math.abs(metrics.coverage.cumulativeDelta),
    );
  }

  // Decide which rules fire.
  const firedRules: FiredRule[] = [];
  if (maxMatchDrift > CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP) {
    firedRules.push({
      rule: "cumulative_match_rate_drift",
      detail: `cumulative match-rate drift ${maxMatchDrift.toFixed(1)}pp exceeds ${CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP}pp threshold`,
      threshold: CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_MATCH_RATE_DRIFT_PP,
    });
  }
  if (maxCoverageDrift > CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP) {
    firedRules.push({
      rule: "cumulative_coverage_drift",
      detail: `cumulative coverage drift ${maxCoverageDrift.toFixed(1)}pp exceeds ${CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP}pp threshold`,
      threshold: CANONICAL_TREND_THRESHOLDS.FIRE_ON_CUMULATIVE_COVERAGE_DRIFT_PP,
    });
  }
  const consecutiveThreshold =
    CANONICAL_TREND_THRESHOLDS.FIRE_ON_CONSECUTIVE_DECLINE_WEEKS;
  const consecutivePlatforms: string[] = [];
  for (const [platform, metrics] of Object.entries(perPlatformTrend)) {
    if (metrics.matchRate.consecutiveDeclineWeeks >= consecutiveThreshold) {
      consecutivePlatforms.push(platform);
    }
  }
  if (consecutivePlatforms.length) {
    firedRules.push({
      rule: "consecutive_decline",
      detail: `consecutive-decline-of-${consecutiveThreshold}+ on: ${consecutivePlatforms.sort().join(", ")}`,
      threshold: consecutiveThreshold,
    });
  }

  // Build remediation text.
  const remediationParts: string[] = [];
  for (const fired of firedRules) {
    if (fired.rule === "cumulative_match_rate_drift") {
      remediationParts.push(
        TREND_REMEDIATION.cumulative_match_rate_drift(
          weeksAnalyzed,
          fired.threshold,
        ),
      );
    } else if (fired.rule === "cumulative_coverage_drift") {
      remediationParts.push(
        TREND_REMEDIATION.cumulative_coverage_drift(
          weeksAnalyzed,
          fired.threshold,
        ),
      );
    } else if (fired.rule === "consecutive_decline") {
      remediationParts.push(
        TREND_REMEDIATION.consecutive_decline(
          fired.threshold,
          consecutivePlatforms.join(", "),
        ),
      );
    }
  }
  if (!remediationParts.length) {
    remediationParts.push(TREND_REMEDIATION.all_stable(weeksAnalyzed));
  }

  const severity: "info" | "warning" | "critical" = !firedRules.length
    ? "info"
    : firedRules.length >= 2
      ? "critical"
      : "warning";

  const summary = firedRules.length
    ? firedRules.map((r) => r.detail).join("; ")
    : `all trends stable across ${weeksAnalyzed} weeks`;

  return {
    weeksAnalyzed,
    trendWindowWeeks: trendWindow,
    perPlatformTrend,
    cumulativeDrift: {
      matchRateMaxDriftPp: Number(maxMatchDrift.toFixed(3)),
      coverageMaxDriftPp: Number(maxCoverageDrift.toFixed(3)),
    },
    consecutiveDeclinePlatforms: consecutivePlatforms.sort(),
    firedRules,
    overallPassed: firedRules.length === 0,
    severity,
    summary,
    remediation: remediationParts.join(" "),
  };
}

/**
 * Seed weekly rollups that match the canonical Move #6.5/6.6/6.7
 * benchmarks: 12 weeks of stable-or-improving match rates on Meta,
 * TikTok, Snap+Pinterest, Google — used as the "all-pass" smoke test
 * and as a default for fresh operators.
 */
export function canonicalStableTrend(): WeeklyRollupEntry[] {
  const out: WeeklyRollupEntry[] = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 7 * 12);
  const baseMatch: Record<string, number> = {
    Meta: 92.1,
    TikTok: 88.5,
    "Snap+Pinterest": 86.3,
    Google: 94.0,
  };
  const baseCov: Record<string, number> = {
    Meta: 96.5,
    TikTok: 95.2,
    "Snap+Pinterest": 93.1,
    Google: 97.0,
  };
  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i * 7);
    const iso = d.toISOString().slice(0, 10);
    const drift = i * 0.1; // small gradual improvement
    out.push({
      weekEnding: iso,
      matchRates: Object.fromEntries(
        Object.entries(baseMatch).map(([k, v]) => [k, v + drift]),
      ),
      coverages: Object.fromEntries(
        Object.entries(baseCov).map(([k, v]) => [k, v + drift]),
      ),
    });
  }
  return out;
}

/**
 * Stress-test seed that fires ALL 3 rules at once: cumulative match
 * rate drift > 3pp, cumulative coverage drift > 2pp, AND 4+ consecutive
 * weeks of decline on Meta. Used by the "stress-fail" button.
 */
export function stressFailTrend(): WeeklyRollupEntry[] {
  const out: WeeklyRollupEntry[] = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 7 * 12);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i * 7);
    const iso = d.toISOString().slice(0, 10);
    // Meta drops -0.6pp/week for 12 weeks = -7.2pp total → matches cumulative_match_rate_drift + consecutive_decline
    // Google stable, TikTok dropping slowly, Snap+Pinterest slightly off
    out.push({
      weekEnding: iso,
      matchRates: {
        Meta: 96.0 - i * 0.6,
        TikTok: 91.0 - i * 0.3,
        "Snap+Pinterest": 88.0 - i * 0.2,
        Google: 95.0 + i * 0.05,
      },
      coverages: {
        Meta: 97.0 - i * 0.25,
        TikTok: 96.0 - i * 0.15,
        "Snap+Pinterest": 94.0 - i * 0.18,
        Google: 97.5 + i * 0.02,
      },
    });
  }
  return out;
}

export function renderWeeklyTrendMarkdown(result: WeeklyTrendResult): string {
  const verdict = result.overallPassed
    ? "PASS"
    : result.severity === "critical"
      ? "FAIL (critical)"
      : "FAIL (warning)";
  const lines: string[] = [];
  lines.push(`# Attribution weekly trend (${result.weeksAnalyzed} weeks)`);
  lines.push("");
  lines.push(`**Verdict:** ${verdict}`);
  lines.push(`**Severity:** ${result.severity}`);
  lines.push(`**Summary:** ${result.summary}`);
  lines.push("");
  lines.push("## Per-platform trend");
  for (const [platform, trend] of Object.entries(result.perPlatformTrend)) {
    const m = trend.matchRate;
    const c = trend.coverage;
    lines.push(
      `- **${platform}** — match-rate: ${m.direction} (Δ ${m.cumulativeDelta >= 0 ? "+" : ""}${m.cumulativeDelta.toFixed(2)}pp, ${m.consecutiveDeclineWeeks}-week streak) · coverage: ${c.direction} (Δ ${c.cumulativeDelta >= 0 ? "+" : ""}${c.cumulativeDelta.toFixed(2)}pp, ${c.consecutiveDeclineWeeks}-week streak)`,
    );
  }
  lines.push("");
  lines.push("## Cumulative drift");
  lines.push(
    `- match-rate max-drift: ${result.cumulativeDrift.matchRateMaxDriftPp.toFixed(2)}pp`,
  );
  lines.push(
    `- coverage max-drift: ${result.cumulativeDrift.coverageMaxDriftPp.toFixed(2)}pp`,
  );
  lines.push("");
  lines.push("## Remediation");
  lines.push(result.remediation);
  return lines.join("\n");
}
