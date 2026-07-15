/**
 * Cross-platform attribution drift rollup — browser port of the pure scoring
 * layer in `/scripts/attribution_cross_platform_rollup.py` (Move #6.8).
 *
 * The dashboard tool consumes the current headline metrics from the persisted
 * Move #6.5 / #6.6 / #6.7 audit inputs, compares them with an operator-owned
 * previous baseline, applies the exact D1/D2/D3 thresholds from the Python
 * rollup, and produces one prioritized incident report.
 */

export const CANONICAL_DRIFT_THRESHOLDS = {
  MATCH_RATE_DRIFT_PP: 3,
  COVERAGE_DRIFT_PP: 2,
  MULTI_PLATFORM_DROP_MAX: 1,
} as const;

export type PlatformId = "meta" | "tiktok" | "snap";
export type RecentChange =
  | "none"
  | "theme_liquid_update"
  | "capi_token_rotation"
  | "ios_consent_banner"
  | "app_uninstall"
  | "advanced_matching_toggle";

export interface PlatformDriftInput {
  id: PlatformId;
  label: string;
  currentMatchRate: number;
  previousMatchRate: number;
  currentCoverage: number;
  previousCoverage: number;
}

export interface DriftRollupInputs {
  platforms: PlatformDriftInput[];
  recentChange: RecentChange;
}

export interface PlatformDriftResult extends PlatformDriftInput {
  matchRateDelta: number;
  coverageDelta: number;
  complete: boolean;
  matchRateBreach: boolean;
  coverageBreach: boolean;
  significantDrop: boolean;
}

export interface DriftGateResult {
  id: "D1" | "D2" | "D3";
  label: string;
  passed: boolean;
  value: number;
  threshold: number;
  unit: "pp" | "platforms";
}

export interface RootCauseHypothesis {
  id: Exclude<RecentChange, "none"> | "unknown";
  label: string;
  remediation: string;
}

export interface DriftRollupResult {
  platforms: PlatformDriftResult[];
  gates: DriftGateResult[];
  completePlatformCount: number;
  driftDetected: boolean;
  healthScore: number | null;
  maxMatchRateDriftPp: number;
  maxCoverageDriftPp: number;
  platformsWithMatchRateDrop: number;
  rootCause: RootCauseHypothesis | null;
  prioritizedFixes: string[];
}

const ROOT_CAUSES: Record<Exclude<RecentChange, "none">, RootCauseHypothesis> = {
  theme_liquid_update: {
    id: "theme_liquid_update",
    label: "theme.liquid snippet update",
    remediation:
      "Revert or inspect the theme.liquid change first; confirm Meta, TikTok, and Snap base pixels fire on PDP load before changing platform-specific settings.",
  },
  capi_token_rotation: {
    id: "capi_token_rotation",
    label: "CAPI token rotation",
    remediation:
      "Refresh the affected platform CAPI/EAPI access tokens, then send one test Purchase event with the same event_id from browser and server.",
  },
  ios_consent_banner: {
    id: "ios_consent_banner",
    label: "iOS consent banner change",
    remediation:
      "Verify the consent banner still forwards permitted hashed identifiers and does not delay pixel initialization beyond the first page view.",
  },
  app_uninstall: {
    id: "app_uninstall",
    label: "App uninstall or app conflict",
    remediation:
      "Audit recent Shopify app installs/uninstalls and duplicate event emitters; restore the attribution app or remove the conflicting snippet, then re-test.",
  },
  advanced_matching_toggle: {
    id: "advanced_matching_toggle",
    label: "Advanced Matching / EMQ toggle flipped off",
    remediation:
      "Re-enable Advanced Matching or EMQ in each affected Events Manager and verify email/phone hashing is present in test-event payloads.",
  },
};

function finite(value: unknown): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.max(0, Math.min(100, numberValue));
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildDriftRollup(inputs: DriftRollupInputs): DriftRollupResult {
  const platforms = inputs.platforms.map((platform) => {
    const normalized = {
      ...platform,
      currentMatchRate: finite(platform.currentMatchRate),
      previousMatchRate: finite(platform.previousMatchRate),
      currentCoverage: finite(platform.currentCoverage),
      previousCoverage: finite(platform.previousCoverage),
    };
    const complete =
      normalized.currentMatchRate > 0 &&
      normalized.previousMatchRate > 0 &&
      normalized.currentCoverage > 0 &&
      normalized.previousCoverage > 0;
    const matchRateDelta = complete
      ? rounded(normalized.currentMatchRate - normalized.previousMatchRate)
      : 0;
    const coverageDelta = complete
      ? rounded(normalized.currentCoverage - normalized.previousCoverage)
      : 0;
    return {
      ...normalized,
      matchRateDelta,
      coverageDelta,
      complete,
      matchRateBreach:
        complete && Math.abs(matchRateDelta) > CANONICAL_DRIFT_THRESHOLDS.MATCH_RATE_DRIFT_PP,
      coverageBreach:
        complete && Math.abs(coverageDelta) > CANONICAL_DRIFT_THRESHOLDS.COVERAGE_DRIFT_PP,
      significantDrop:
        complete && matchRateDelta < -CANONICAL_DRIFT_THRESHOLDS.MATCH_RATE_DRIFT_PP,
    } satisfies PlatformDriftResult;
  });

  const completePlatforms = platforms.filter((platform) => platform.complete);
  const maxMatchRateDriftPp = rounded(
    Math.max(0, ...completePlatforms.map((platform) => Math.abs(platform.matchRateDelta))),
  );
  const maxCoverageDriftPp = rounded(
    Math.max(0, ...completePlatforms.map((platform) => Math.abs(platform.coverageDelta))),
  );
  const platformsWithMatchRateDrop = completePlatforms.filter(
    (platform) => platform.significantDrop,
  ).length;

  const gates: DriftGateResult[] = [
    {
      id: "D1",
      label: "Maximum week-over-week match-rate drift",
      passed: maxMatchRateDriftPp <= CANONICAL_DRIFT_THRESHOLDS.MATCH_RATE_DRIFT_PP,
      value: maxMatchRateDriftPp,
      threshold: CANONICAL_DRIFT_THRESHOLDS.MATCH_RATE_DRIFT_PP,
      unit: "pp",
    },
    {
      id: "D2",
      label: "Maximum week-over-week coverage drift",
      passed: maxCoverageDriftPp <= CANONICAL_DRIFT_THRESHOLDS.COVERAGE_DRIFT_PP,
      value: maxCoverageDriftPp,
      threshold: CANONICAL_DRIFT_THRESHOLDS.COVERAGE_DRIFT_PP,
      unit: "pp",
    },
    {
      id: "D3",
      label: "Platforms with simultaneous match-rate drops",
      passed:
        platformsWithMatchRateDrop <= CANONICAL_DRIFT_THRESHOLDS.MULTI_PLATFORM_DROP_MAX,
      value: platformsWithMatchRateDrop,
      threshold: CANONICAL_DRIFT_THRESHOLDS.MULTI_PLATFORM_DROP_MAX,
      unit: "platforms",
    },
  ];

  const driftDetected = completePlatforms.length > 0 && gates.some((gate) => !gate.passed);
  const healthScore =
    completePlatforms.length === 0
      ? null
      : Math.max(
          0,
          100 -
            (gates[0].passed ? 0 : 30) -
            (gates[1].passed ? 0 : 30) -
            (gates[2].passed ? 0 : 40),
        );

  const rootCause = driftDetected
    ? inputs.recentChange === "none"
      ? {
          id: "unknown" as const,
          label: "Unknown shared root cause",
          remediation:
            "Compare the timestamps of recent theme, app, consent, and token changes; investigate the first change shared by every affected platform.",
        }
      : ROOT_CAUSES[inputs.recentChange]
    : null;

  const prioritizedFixes: string[] = [];
  if (rootCause) prioritizedFixes.push(rootCause.remediation);
  for (const platform of [...completePlatforms].sort(
    (a, b) => a.matchRateDelta - b.matchRateDelta,
  )) {
    if (platform.significantDrop) {
      prioritizedFixes.push(
        `${platform.label}: match rate fell ${Math.abs(platform.matchRateDelta).toFixed(1)}pp. Re-run its Gate A test-event trace and verify browser/server event_id parity.`,
      );
    }
    if (platform.coverageBreach) {
      prioritizedFixes.push(
        `${platform.label}: coverage moved ${platform.coverageDelta > 0 ? "+" : ""}${platform.coverageDelta.toFixed(1)}pp. Check base-pixel firing against the same-session ground truth.`,
      );
    }
  }
  if (!driftDetected && completePlatforms.length > 0) {
    prioritizedFixes.push(
      "No incident action required. Save this current cycle as the next baseline after the weekly audit closes.",
    );
  }
  if (completePlatforms.length === 0) {
    prioritizedFixes.push(
      "Import or enter current and previous match-rate plus coverage values for at least one platform.",
    );
  }

  return {
    platforms,
    gates,
    completePlatformCount: completePlatforms.length,
    driftDetected,
    healthScore,
    maxMatchRateDriftPp,
    maxCoverageDriftPp,
    platformsWithMatchRateDrop,
    rootCause,
    prioritizedFixes,
  };
}

export function renderDriftRollupMarkdown(result: DriftRollupResult): string {
  const lines = [
    "# Attribution Cross-Platform Drift Rollup — Move #6.8",
    "",
    `**Status:** ${result.completePlatformCount === 0 ? "INCOMPLETE" : result.driftDetected ? "DRIFT DETECTED" : "STABLE"}`,
    `**Health score:** ${result.healthScore === null ? "n/a" : `${result.healthScore}/100`}`,
    `**Summary:** ${result.platformsWithMatchRateDrop} platforms with simultaneous match-rate drops; maximum match-rate drift ${result.maxMatchRateDriftPp.toFixed(1)}pp; maximum coverage drift ${result.maxCoverageDriftPp.toFixed(1)}pp.`,
    "",
    "## D1 / D2 / D3 gates",
    "",
    ...result.gates.map(
      (gate) =>
        `- **${gate.id} ${gate.passed ? "PASS" : "FAIL"}:** ${gate.label} = ${gate.value.toFixed(1)}${gate.unit === "pp" ? "pp" : ""} (threshold ≤ ${gate.threshold}${gate.unit === "pp" ? "pp" : " platform"}${gate.unit === "platforms" ? "s" : ""})`,
    ),
    "",
    "## Platform deltas",
    "",
    "| Platform | Current match | Previous match | Δ match | Current coverage | Previous coverage | Δ coverage |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...result.platforms.map((platform) =>
      platform.complete
        ? `| ${platform.label} | ${platform.currentMatchRate.toFixed(1)}% | ${platform.previousMatchRate.toFixed(1)}% | ${platform.matchRateDelta > 0 ? "+" : ""}${platform.matchRateDelta.toFixed(1)}pp | ${platform.currentCoverage.toFixed(1)}% | ${platform.previousCoverage.toFixed(1)}% | ${platform.coverageDelta > 0 ? "+" : ""}${platform.coverageDelta.toFixed(1)}pp |`
        : `| ${platform.label} | incomplete | incomplete | — | incomplete | incomplete | — |`,
    ),
    "",
  ];
  if (result.rootCause) {
    lines.push("## Suspected shared root cause", "", `**${result.rootCause.label}**`, "");
  }
  lines.push(
    "## Prioritized fixes",
    "",
    ...result.prioritizedFixes.map((fix, index) => `${index + 1}. ${fix}`),
    "",
    "---",
    "",
    "_Browser port of `scripts/attribution_cross_platform_rollup.py`; canonical thresholds: D1 3pp / D2 2pp / D3 max 1 platform._",
  );
  return lines.join("\n");
}
