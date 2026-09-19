/**
 * `B2B-MAP-policy self-check` — direct browser port of the rule engine in
 * `scripts/b2b_map_policy_check.py` (Move #14.5 B2B-wholesale companion).
 *
 * The operator enters their MAP-policy posture (5 canonical Pillar-4 levers +
 * 3 optional reinforcement levers from research/10 §Pillar 4, plus DTC
 * cannibalization % and last-30d violation counts). The rule engine decides
 * whether to fire a MAP-policy alert, classifies the severity
 * (critical / warning / info), and returns a structured alert payload +
 * per-lever remediation text the operator can copy to Slack.
 *
 * Scoring rules mirror the Python CLI's `_decide_should_fire` exactly:
 *   - Rule 1: MAP-page published WITHOUT 3-strike enforcement → critical
 *   - Rule 2: Any of the 5 Pillar-4 levers missing while wholesale active → critical
 *   - Rule 3: DTC cannibalization > 25% → critical
 *   - Rule 4: 3rd-violation terminations ≥ 2 in 30d → warning
 *   - Otherwise → info / pass
 *
 * Storage key: `ecom-ops:b2b-map-policy:v1`. State persists across reloads.
 */

export type MapLeverId =
  | "map_policy_page_published"
  | "three_strike_enforcement_active"
  | "geographic_exclusivity_top_20"
  | "channel_exclusivity_tier"
  | "map_policy_enforcement_tooling"
  | "city_level_exclusivity_top_5"
  | "shopify_b2b_handshake_geographic_exclusion"
  | "arpu_cannibalization_monitoring";

export interface MapLever {
  id: MapLeverId;
  label: string;
  description: string;
  canonical: boolean;
}

export interface MapPolicyInputs {
  wholesaleChannelActive: boolean;
  wholesaleSkuCount: number;
  wholesaleArpuRatioVsDtc: number; // 0..1+ — wholesale ARPU / DTC ARPU
  dtcCannibalizationPct: number; // 0..100
  levers: Record<MapLeverId, boolean>;
  mapViolationsLast30d: number;
  firstViolationWarningsLast30d: number;
  secondViolationSuspensionsLast30d: number;
  thirdViolationTerminationsLast30d: number;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface LeverBreakdown {
  id: MapLeverId;
  label: string;
  canonical: boolean;
  active: boolean;
  category: "pillar_4_canonical" | "pillar_4_optional";
  remediation: string;
}

export interface MapPolicyAlert {
  shouldFire: boolean;
  severity: AlertSeverity;
  title: string;
  summary: string;
  reason: string;
  leverBreakdown: LeverBreakdown[];
  missingPillar4: MapLeverId[];
  missingOptional: MapLeverId[];
  rootCause: {
    id: string;
    label: string;
    category: string;
    remediation: string;
    additionalMissingLevers: MapLeverId[];
  } | null;
  cannibalizationPct: number;
  violations30d: number;
  thirdTerminations30d: number;
}

// Canonical lever definitions (mirrors scripts/b2b_map_policy_check.py PILLAR_4_LEVERS + OPTIONAL_PILLAR_4_LEVERS).
export const MAP_LEVERS: MapLever[] = [
  {
    id: "map_policy_page_published",
    label: "MAP-policy page published",
    description: "Brand.com MAP-price + Wholesale-Auto-Effective-Price + 3-strike-enforcement published",
    canonical: true,
  },
  {
    id: "three_strike_enforcement_active",
    label: "3-strike enforcement active",
    description: "1st-violation written-warning / 2nd-violation 30-day-suspension / 3rd-violation termination",
    canonical: true,
  },
  {
    id: "geographic_exclusivity_top_20",
    label: "Geographic exclusivity for top-20 accounts",
    description: "State-by-state geographic-exclusivity for top-20 wholesale accounts (e.g. Splash = CA-only)",
    canonical: true,
  },
  {
    id: "channel_exclusivity_tier",
    label: "Channel exclusivity tier matrix",
    description: "Per-channel-exclusivity-tier matrix (Faire-only / Shopify-B2B-only / Amazon-Business-only / RSP-only)",
    canonical: true,
  },
  {
    id: "map_policy_enforcement_tooling",
    label: "MAP-policy enforcement tooling",
    description: "MAP-policy-violation-reporting channel from each marketplace wired to single enforcement-inbox",
    canonical: true,
  },
  {
    id: "city_level_exclusivity_top_5",
    label: "City-level exclusivity (top-5)",
    description: "OPTIONAL — city-level geographic-exclusivity for top-5 accounts (e.g. Nordstrom SF vs LA)",
    canonical: false,
  },
  {
    id: "shopify_b2b_handshake_geographic_exclusion",
    label: "Handshake geographic-exclusion",
    description: "OPTIONAL — Handshake geographic-exclusion in Shopify B2B settings",
    canonical: false,
  },
  {
    id: "arpu_cannibalization_monitoring",
    label: "ARPU cannibalization monitoring",
    description: "OPTIONAL — Triple-Whale B2B-cohort-LTV-overlay for ARPU-cannibalization monitoring",
    canonical: false,
  },
];

export const CANONICAL_LEVERS = MAP_LEVERS.filter((l) => l.canonical).map((l) => l.id);
export const OPTIONAL_LEVERS = MAP_LEVERS.filter((l) => !l.canonical).map((l) => l.id);

// Thresholds — mirror scripts/b2b_map_policy_check.py MAP_POLICY_THRESHOLDS.
export const MAP_POLICY_THRESHOLDS = {
  fire_on_any_pillar_4_lever_missing: true,
  fire_on_no_3_strike_enforcement: true,
  fire_on_dtc_cannibalization_pct: 25.0,
  fire_on_3rd_violation_terminations_30d: 2,
};

const LEVER_REMEDIATION: Record<MapLeverId, string> = {
  map_policy_page_published:
    "Publish the canonical MAP-policy-page on brand.com listing every SKU's MAP-price + Wholesale-Auto-Effective-Price + 3-strike-enforcement (1st-violation written-warning / 2nd-violation 30-day-suspension / 3rd-violation permanent-termination) per research/10 Pillar 4. Without it, 30-50% of DTC-traffic erodes per Faire 2024 benchmarks. Use the paste-ready MAP-policy-page template from assets/18.",
  three_strike_enforcement_active:
    "Activate the 3-strike enforcement alongside the MAP-policy-page: 1st-violation written-warning / 2nd-violation 30-day-suspension / 3rd-violation permanent-termination per research/10 Pillar 4 + Faire 2024 vendor-survey. Brands without internal-enforcement-team lose 50-60% of MAP-policy-effectiveness. Document the enforcement-procedure in playbooks/17 §Phase 3.",
  geographic_exclusivity_top_20:
    "Offer state-by-state geographic-exclusivity for top-20-accounts (e.g. Splash is the only authorized California retailer) per Faire 2024 + Handshake geographic-exclusion-benchmarks. Default = state-level exclusivity for top-20-accounts. Without it, 40-60% of DTC-traffic in shared-territories erodes per research/10 Pillar 4 Pitfall #8. See playbooks/17 §Phase 3 + assets/18.",
  channel_exclusivity_tier:
    "Define a per-channel-exclusivity-tier matrix (e.g. Faire-only / Shopify-B2B-only / Amazon-Business-only / RSP-only) per research/10 Pillar 4 + Faire 2024 benchmarks. Without it, wholesale-channel cannibalizes DTC-traffic in shared-channels. See assets/18 §per-channel-MOQ-casepack-matrix for the canonical tier-template.",
  map_policy_enforcement_tooling:
    "Wire the MAP-policy-violation-reporting channel from each marketplace (Faire + Tundra + Ankorstore + Handshake) into a single enforcement-inbox (e.g. map-violations@brand.com or a Slack channel) per research/10 Pillar 4 + Faire 2024 vendor-survey. Brands without an internal-enforcement-team lose 50-60% of MAP-policy-effectiveness. See playbooks/17 §Phase 3 step 5.",
  city_level_exclusivity_top_5:
    "OPTIONAL reinforcement: offer city-level geographic-exclusivity for top-5-accounts (e.g. Nordstrom SF vs Nordstrom LA) per Faire 2024 + Handshake benchmarks. Compounds state-level-exclusivity.",
  shopify_b2b_handshake_geographic_exclusion:
    "OPTIONAL reinforcement: configure Handshake geographic-exclusion in Shopify B2B settings (block out-of-territory buyer-PO) per research/10 Pillar 4 + Handshake 2024 benchmarks. Compounds state-level-exclusivity for Shopify-B2B-channel.",
  arpu_cannibalization_monitoring:
    "OPTIONAL reinforcement: wire Triple-Whale B2B-cohort-LTV-overlay for ARPU-cannibalization-monitoring-quarterly per research/10 Pillar 4 + Triple-Whale 2024 benchmarks. Catches DTC-revenue-leakage the MAP-policy-page misses (e.g. wholesale-buyer-DTC-funnel-attribution).",
};

export const MAP_POLICY_DEFAULTS: MapPolicyInputs = {
  wholesaleChannelActive: true,
  wholesaleSkuCount: 80,
  wholesaleArpuRatioVsDtc: 0.85,
  dtcCannibalizationPct: 18,
  levers: {
    map_policy_page_published: true,
    three_strike_enforcement_active: true,
    geographic_exclusivity_top_20: false,
    channel_exclusivity_tier: false,
    map_policy_enforcement_tooling: false,
    city_level_exclusivity_top_5: false,
    shopify_b2b_handshake_geographic_exclusion: false,
    arpu_cannibalization_monitoring: false,
  },
  mapViolationsLast30d: 0,
  firstViolationWarningsLast30d: 0,
  secondViolationSuspensionsLast30d: 0,
  thirdViolationTerminationsLast30d: 0,
};

/**
 * Decide whether to fire a MAP-policy check alert — direct port of
 * `_decide_should_fire` in scripts/b2b_map_policy_check.py.
 */
export function decideShouldFire(inputs: MapPolicyInputs): {
  shouldFire: boolean;
  reason: string;
} {
  const wholesaleActive = inputs.wholesaleChannelActive;
  const levers = inputs.levers;
  const thresholds = MAP_POLICY_THRESHOLDS;

  // Rule 1: page published WITHOUT 3-strike enforcement (canonical anti-pattern).
  if (
    thresholds.fire_on_no_3_strike_enforcement &&
    wholesaleActive &&
    levers.map_policy_page_published &&
    !levers.three_strike_enforcement_active
  ) {
    return {
      shouldFire: true,
      reason:
        "MAP-policy-page published WITHOUT 3-strike enforcement active — canonical MAP-violation-erosion anti-pattern (publishing without enforcement loses 50-60% of MAP-policy-effectiveness per Faire 2024)",
    };
  }

  // Rule 2: any canonical Pillar-4 lever missing while wholesale is active.
  if (thresholds.fire_on_any_pillar_4_lever_missing && wholesaleActive) {
    const missingPillar4 = CANONICAL_LEVERS.filter((l) => !levers[l]);
    if (missingPillar4.length > 0) {
      return {
        shouldFire: true,
        reason: `${missingPillar4.length} of ${CANONICAL_LEVERS.length} canonical Pillar-4 MAP-policy levers missing (wholesale active): ${missingPillar4.join(", ")}`,
      };
    }
  }

  // Rule 3: DTC cannibalization exceeds threshold.
  if (inputs.dtcCannibalizationPct > thresholds.fire_on_dtc_cannibalization_pct) {
    return {
      shouldFire: true,
      reason: `DTC cannibalization ${inputs.dtcCannibalizationPct.toFixed(1)}% exceeds threshold ${thresholds.fire_on_dtc_cannibalization_pct.toFixed(1)}% — wholesale-channel-erosion above the canonical unprotected-erosion band per research/10 Pillar 4`,
    };
  }

  // Rule 4: 3rd-violation terminations ≥ threshold (retailer-compliance breakdown).
  if (
    inputs.thirdViolationTerminationsLast30d >= thresholds.fire_on_3rd_violation_terminations_30d
  ) {
    return {
      shouldFire: true,
      reason: `${inputs.thirdViolationTerminationsLast30d} 3rd-violation terminations in last 30d exceeds threshold ${thresholds.fire_on_3rd_violation_terminations_30d} — retailer-compliance breakdown signal (brand should audit wholesale-buyer-portfolio + consider distribution-agreement-renewals)`,
    };
  }

  return { shouldFire: false, reason: "all Pillar-4 levers active, cannibalization within band" };
}

/**
 * Build the canonical alert payload (Slack-compatible JSON shape).
 * Mirrors `_build_alert_payload` in scripts/b2b_map_policy_check.py.
 */
export function buildAlertPayload(inputs: MapPolicyInputs, brandId = "operator-store"): MapPolicyAlert {
  const { shouldFire, reason } = decideShouldFire(inputs);
  const levers = inputs.levers;
  const wholesaleActive = inputs.wholesaleChannelActive;

  // Per-lever breakdown.
  const leverBreakdown: LeverBreakdown[] = MAP_LEVERS.map((lever) => ({
    id: lever.id,
    label: lever.label,
    canonical: lever.canonical,
    active: !!levers[lever.id],
    category: lever.canonical ? "pillar_4_canonical" : "pillar_4_optional",
    remediation: LEVER_REMEDIATION[lever.id],
  }));

  const missingPillar4 = CANONICAL_LEVERS.filter((l) => !levers[l]) as MapLeverId[];
  const missingOptional = OPTIONAL_LEVERS.filter((l) => !levers[l]) as MapLeverId[];

  // Severity classification.
  const anyMissing = missingPillar4.length > 0;
  const cannibalizationHigh =
    inputs.dtcCannibalizationPct > MAP_POLICY_THRESHOLDS.fire_on_dtc_cannibalization_pct;
  let severity: AlertSeverity;
  let titlePrefix: string;
  if (wholesaleActive && (anyMissing || cannibalizationHigh)) {
    severity = "critical";
    titlePrefix = "🔴 B2B-MAP-POLICY ALERT";
  } else if (wholesaleActive) {
    severity = "warning";
    titlePrefix = "⚠️ B2B-MAP-POLICY DRIFT";
  } else {
    severity = "info";
    titlePrefix = "ℹ️ B2B-MAP-POLICY HEALTH";
  }

  // Root cause hypothesis.
  let rootCause: MapPolicyAlert["rootCause"] = null;
  if (missingPillar4.length > 0) {
    rootCause = {
      id: missingPillar4[0],
      label: missingPillar4[0],
      category: "pillar_4_canonical",
      remediation: LEVER_REMEDIATION[missingPillar4[0]],
      additionalMissingLevers: missingPillar4.slice(1),
    };
  } else if (cannibalizationHigh) {
    rootCause = {
      id: "high_dtc_cannibalization",
      label: "high_dtc_cannibalization",
      category: "dtc_erosion",
      remediation:
        "Investigate which wholesale-buyer is selling below MAP-price. Audit the wholesale-eligible-SKU-subset — likely 100% of SKUs are wholesale-available (the canonical anti-pattern per research/10 Pillar 4 Pitfall #9). Default fix: wholesale-eligible-SKU-subset of 12-30 hero SKUs + 5-10 exclusive-wholesale-SKUs + 5-10 B2B-exclusive-SKUs.",
      additionalMissingLevers: [],
    };
  } else if (
    inputs.thirdViolationTerminationsLast30d >=
    MAP_POLICY_THRESHOLDS.fire_on_3rd_violation_terminations_30d
  ) {
    rootCause = {
      id: "retailer_compliance_breakdown",
      label: "retailer_compliance_breakdown",
      category: "compliance",
      remediation:
        "Audit the wholesale-buyer-portfolio for repeat-offender retailers. Consider tightening distribution-agreement-terms + reviewing geographic-exclusivity-tier-coverage. See playbooks/17 §Phase 3.",
      additionalMissingLevers: [],
    };
  }

  const missingPillar4Count = missingPillar4.length;
  const title = shouldFire
    ? `${titlePrefix}: ${reason}`
    : `✅ B2B-MAP-POLICY PASS: ${reason}`;

  const summary =
    `brand=${brandId}; wholesale_channel_active=${wholesaleActive}; ` +
    `${missingPillar4Count} of ${CANONICAL_LEVERS.length} canonical Pillar-4 levers missing; ` +
    `dtc_cannibalization=${inputs.dtcCannibalizationPct.toFixed(1)}%; ` +
    `3rd_violation_terminations_30d=${inputs.thirdViolationTerminationsLast30d}; ` +
    `severity=${severity}`;

  return {
    shouldFire,
    severity,
    title,
    summary,
    reason,
    leverBreakdown,
    missingPillar4,
    missingOptional,
    rootCause,
    cannibalizationPct: inputs.dtcCannibalizationPct,
    violations30d: inputs.mapViolationsLast30d,
    thirdTerminations30d: inputs.thirdViolationTerminationsLast30d,
  };
}

/** Render the alert payload as a paste-ready Slack-compatible markdown block. */
export function renderMapPolicyMarkdown(alert: MapPolicyAlert, brandId = "operator-store"): string {
  const lines: string[] = [];
  lines.push(`**${alert.title}**`);
  lines.push("");
  lines.push(alert.summary);
  lines.push("");
  lines.push("**Per-lever status:**");
  for (const lever of alert.leverBreakdown) {
    const icon = lever.active ? "✅" : "❌";
    const tag = lever.canonical ? "[canonical]" : "[optional]";
    lines.push(`- ${icon} ${tag} \`${lever.id}\` — ${lever.label}`);
  }
  if (alert.missingPillar4.length > 0) {
    lines.push("");
    lines.push("**Remediation (canonical levers):**");
    for (const leverId of alert.missingPillar4) {
      const lever = alert.leverBreakdown.find((l) => l.id === leverId);
      if (lever) {
        lines.push(`- \`${leverId}\`: ${lever.remediation}`);
      }
    }
  }
  if (alert.rootCause) {
    lines.push("");
    lines.push(`**Root cause:** \`${alert.rootCause.id}\``);
    lines.push(alert.rootCause.remediation);
  }
  lines.push("");
  lines.push(`Source: move-14.5-b2b-map-policy-self-check · brand=${brandId}`);
  return lines.join("\n");
}

export function clampMapPolicyNumber(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

export function validateMapPolicyInputs(inputs: MapPolicyInputs): string[] {
  const errs: string[] = [];
  if (inputs.dtcCannibalizationPct < 0 || inputs.dtcCannibalizationPct > 100) {
    errs.push(`dtcCannibalizationPct must be 0-100, got ${inputs.dtcCannibalizationPct}`);
  }
  if (inputs.wholesaleArpuRatioVsDtc < 0 || inputs.wholesaleArpuRatioVsDtc > 5) {
    errs.push(
      `wholesaleArpuRatioVsDtc must be 0-5, got ${inputs.wholesaleArpuRatioVsDtc}`,
    );
  }
  if (inputs.wholesaleSkuCount < 0 || inputs.wholesaleSkuCount > 100000) {
    errs.push(`wholesaleSkuCount must be 0-100000, got ${inputs.wholesaleSkuCount}`);
  }
  for (const k of [
    "mapViolationsLast30d",
    "firstViolationWarningsLast30d",
    "secondViolationSuspensionsLast30d",
    "thirdViolationTerminationsLast30d",
  ] as const) {
    if (inputs[k] < 0 || inputs[k] > 100000 || !Number.isInteger(inputs[k])) {
      errs.push(`${k} must be a non-negative integer, got ${inputs[k]}`);
    }
  }
  return errs;
}

export const STORAGE_KEY = "ecom-ops:b2b-map-policy:v1";

export function loadStoredMapPolicy(): MapPolicyInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      wholesaleChannelActive: Boolean(parsed.wholesaleChannelActive ?? true),
      wholesaleSkuCount: clampMapPolicyNumber(Number(parsed.wholesaleSkuCount) || 0, 0, 100000),
      wholesaleArpuRatioVsDtc: clampMapPolicyNumber(
        Number(parsed.wholesaleArpuRatioVsDtc) || 0.85,
        0,
        5,
      ),
      dtcCannibalizationPct: clampMapPolicyNumber(
        Number(parsed.dtcCannibalizationPct) || 0,
        0,
        100,
      ),
      levers: {
        ...MAP_POLICY_DEFAULTS.levers,
        ...((parsed.levers as Partial<Record<MapLeverId, boolean>>) ?? {}),
      },
      mapViolationsLast30d: clampMapPolicyNumber(
        Math.round(Number(parsed.mapViolationsLast30d) || 0),
        0,
        100000,
      ),
      firstViolationWarningsLast30d: clampMapPolicyNumber(
        Math.round(Number(parsed.firstViolationWarningsLast30d) || 0),
        0,
        100000,
      ),
      secondViolationSuspensionsLast30d: clampMapPolicyNumber(
        Math.round(Number(parsed.secondViolationSuspensionsLast30d) || 0),
        0,
        100000,
      ),
      thirdViolationTerminationsLast30d: clampMapPolicyNumber(
        Math.round(Number(parsed.thirdViolationTerminationsLast30d) || 0),
        0,
        100000,
      ),
    };
  } catch {
    return null;
  }
}

export function saveMapPolicyInputs(inputs: MapPolicyInputs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    /* quota / private mode */
  }
}
