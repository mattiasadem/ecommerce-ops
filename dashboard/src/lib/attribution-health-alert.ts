// attribution-health-alert.ts — TypeScript port of
// scripts/attribution_health_alert_unit_economics.py
// Move #6.10 attribution-health-alert-webhook Path A/B/C/D/E scorer.
//
// Mirrors playbook/06.10 §Which alert-cadence + §Cost & ROI estimate +
// §Step 4 cron-wire + asset/24 §5-path alert-cadence decision matrix.

export type PathName = "A" | "B" | "C" | "D" | "E";
export type TeamSize = "solo" | "small" | "larger" | "enterprise";
export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type Move68Cadence = "weekly" | "daily" | "monthly" | "none";

export interface BrandAttributionAlertInputs {
  paidSpend: number;
  teamSize: TeamSize;
  voiceProfile: VoiceProfile;
  move68Cadence: Move68Cadence;
  hasWebhookUrl: boolean;
  hasLinearFallback: boolean;
  hasPagerdutyFallback: boolean;
  hasOpsgenieFallback: boolean;
  slackChannelOnCallRotationCoverageHoursPerDay: number;
  alertArchiveStorageGbPerYear: number;
  cooldownSeconds: number;
}

export interface PathRecommendation {
  path: PathName;
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  year1AvoidedIncidentsLow: number;
  year1AvoidedIncidentsHigh: number;
  year1IncrementalAttributionRecoveryLow: number;
  year1IncrementalAttributionRecoveryHigh: number;
  year1NetRoiLow: number;
  year1NetRoiHigh: number;
  alertCadence: string;
  cooldownSecondsRecommended: number;
  canonicalAlertPayloadFields: string[];
  canonicalWebhookThresholds: Record<string, number | boolean>;
  attributionAlertPillarMatrix: Record<string, string>;
  buildSequence: string[];
}

export interface PerPathRecovery {
  year1CostMidFull: number;
  year1RecoveryMid: number;
  year1IncidentsMid: number;
  year1NetRoiMidFullCost: number;
  year1NetRoiMidFinal: number;
  alertCadence: string;
  cooldownSecondsRecommended: number;
}

// ----- Canonical constants (pinned) -----

export const PATH_E_FLOOR = 500;
export const PATH_A_FLOOR = 5_000;
export const PATH_B_FLOOR = 50_000;
export const PATH_C_FLOOR = 250_000;

export const MIN_ON_CALL_COVERAGE_HOURS_PER_DAY = 8;
export const MAX_ARCHIVE_STORAGE_GB_PER_YEAR = 10;
export const MIN_COOLDOWN_SECONDS = 0;
export const LUXURY_PAGERDUTY_DOWNGRADE_ENABLED = true;
export const B2B_LINEAR_DOWNGRADE_ENABLED = true;
export const MOVE_6_8_PREREQ_ENABLED = true;

export const PATH_COSTS: Record<PathName, [number, number, number, number]> = {
  A: [0, 0, 0, 0],
  B: [2, 50, 8, 102],
  C: [50, 500, 35, 250],
  D: [500, 5_000, 333, 2_000],
  E: [0, 0, 0, 0],
};

export const PATH_AVOIDED_INCIDENTS: Record<PathName, [number, number]> = {
  A: [0, 1],
  B: [1, 2],
  C: [2, 4],
  D: [4, 8],
  E: [0, 0],
};

export const PATH_INCREMENTAL_ATTRIBUTION_RECOVERY_PER_INCIDENT: Record<
  PathName,
  [number, number]
> = {
  A: [1_000, 5_000],
  B: [5_000, 15_000],
  C: [15_000, 50_000],
  D: [50_000, 200_000],
  E: [0, 0],
};

export const PATH_ROI: Record<PathName, [number, number]> = {
  A: [Infinity, Infinity],
  B: [60, 150],
  C: [40, 100],
  D: [20, 60],
  E: [0, 0],
};

export const PATH_ALERT_CADENCE: Record<PathName, string> = {
  A: "Weekly Monday 09:00 (hermetic-local-archive-only; no Slack dispatch)",
  B: "Weekly Monday 09:00 (5 minutes after Move #6.8 09:00; Slack-webhook + Linear-fallback)",
  C: "Every-4-hours (06:00/10:00/14:00/18:00 UTC daily; Slack + Linear + PagerDuty-low-urgency)",
  D: "Hourly (PagerDuty + Opsgenie + dedicated on-call; Move #6.10 + Move #6.8 daily cadence)",
  E: "DEFER (no Move #6.10 install until paid-spend grows to $500+/mo)",
};

export const PATH_COOLDOWN_SECONDS: Record<PathName, number> = {
  A: 604_800,
  B: 3_600,
  C: 600,
  D: 300,
  E: 0,
};

export const PATH_PLATFORMS: Record<PathName, string[]> = {
  A: [
    "scripts/attribution_health_alert_webhook.py (hermetic-local-archive-only mode; --webhook-url omitted)",
    ".alerts/ directory (local filesystem; canonical archive path)",
  ],
  B: [
    "Slack-Incoming-Webhooks ($0 with existing Slack plan; canonical Path B default)",
    "Linear-fallback ticket-routing ($0 with existing Linear plan; canonical Path B 2nd-priority)",
    "scripts/attribution_health_alert_webhook.py with --webhook-url + --cooldown-seconds 3600",
    ".alerts/ directory (local fallback; canonical Path B hermetic-fallback)",
  ],
  C: [
    "Slack-Incoming-Webhooks (every-4-hours; canonical Path C)",
    "Linear-ticket-routing ($0 with existing Linear plan; canonical Path C 2nd-priority)",
    "PagerDuty-Events-API-v2 low-urgency (PagerDuty-Starter $0-$21/mo per seat)",
    "scripts/attribution_health_alert_webhook.py with --cooldown-seconds 600",
    ".alerts/ directory (local fallback)",
  ],
  D: [
    "PagerDuty-Events-API-v2 high-urgency ($21-$41/mo per seat; canonical Path D primary)",
    "Opsgenie-Enterprise ($8-$16/mo per seat; canonical Path D 2nd-priority for escalation)",
    "Slack-Incoming-Webhooks (canonical Path D 3rd-priority; high-traffic channel)",
    "Linear-ticket-routing (canonical Path D 4th-priority for ticket-tracking)",
    "scripts/attribution_health_alert_webhook.py with --cooldown-seconds 300",
    ".alerts/ directory (audit fallback for compliance)",
  ],
  E: ["(defer; no platforms wired until paid-spend grows to $500+/mo)"],
};

export const PATH_DEFAULT_PLATFORM_PICK: Record<PathName, string> = {
  A: "scripts/attribution_health_alert_webhook.py (hermetic-local-archive-only; .alerts/ directory)",
  B: "Slack-Incoming-Webhooks + Linear-fallback + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 3600)",
  C: "Slack-Incoming-Webhooks + Linear + PagerDuty-low-urgency + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 600)",
  D: "PagerDuty-Events-API-v2 + Opsgenie + Slack + Linear + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 300)",
  E: "(DEFER — re-evaluate when paid-spend grows to $500+/mo)",
};

export const ATTRIBUTION_ALERT_PILLAR_MATRIX: Record<string, string> = {
  "Pillar 1 — Move #6.8 cross-platform attribution rollup substrate":
    "Move #6.8 must be shipped + running on canonical cadence (weekly Path B by default; daily Path C for larger teams; monthly Path A for solo operators). Move #6.10 CONSUMES the Move #6.8 --output-json (or moves the rollup directly via --rollup-json <path> override). Without Move #6.8 running end-to-end, Move #6.10 emits 'ROLLOUP FILE MISSING' sentinel alerts and is useless.",
  "Pillar 2 — Slack-compatible webhook URL + canonical 13-field alert-payload shape":
    "Webhook URL must be a valid http(s) URL with non-empty netloc (canonical Slack-Incoming-Webhooks URL shape https://hooks.slack.com/services/<workspace>/<channel>/<token>); canonical 13-field alert-payload shape [alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path]; 5 canonical webhook thresholds [fire_on_any_per_platform_fail: True / fire_on_cross_platform_drift: True / fire_on_match_rate_drift_pp: 3.0 / fire_on_coverage_drift_pp: 2.0 / cooldown_seconds: 3600] pinned.",
  "Pillar 3 — .alerts/ archive directory + hermetic local fallback":
    ".alerts/ directory under the canonical workspace root; canonical hermetic-fallback mode when --webhook-url is omitted (the script prints the alert payload to stdout and writes it to --alert-archive with timestamp + severity in filename). Archive storage budget: <1 GB/yr for Path A / 1-5 GB/yr for Path B / 5-10 GB/yr for Path C / >10 GB/yr for Path D.",
  "Pillar 4 — 5-decision-rule engine + 3600s cooldown + 3 exit codes":
    "5-rule engine: Rule 1 ANY per-platform audit fails → fire / Rule 2 cross-platform drift detected → fire / Rule 3 match-rate drift > 3.0pp → fire / Rule 4 coverage drift > 2.0pp → fire / Rule 5 cooldown — skip if a fresh alert exists within 3600s. 3 exit codes: 0 = no-alert / 1 = alert-fired / 2 = webhook-POST-failed.",
  "Pillar 5 — On-call rotation + escalation policy + incident-postmortem template":
    "Path B coverage: 5 hr/wk dedicated on-call. Path C coverage: 16 hr/day on-call. Path D coverage: 24/7 dedicated on-call rotation. Escalation: Path B = Linear → on-call-attribution-ops / Path C = Slack + Linear + PagerDuty-low-urgency 8h / Path D = PagerDuty-high + Opsgenie 1h.",
};

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, string[]> = {
  A: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py (canonical Move #6.10 hardening script; Python 3.10+ stdlib only; no pip deps).",
    "Step 2: Bootstrap the .alerts/ archive directory via python3 scripts/attribution_health_alert_webhook.py --bootstrap.",
    "Step 3: Run --validate-thresholds to confirm the canonical 5 webhook thresholds + 13-field alert-payload shape are pinned.",
    "Step 4: Wire the cron (Path A weekly Monday 09:00): 0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/.",
    "Step 5: Read the .alerts/ archive directory weekly (hermetic-mode); no Slack dispatch — operator reads archive files directly via cat .alerts/<timestamp>-<severity>.json.",
    "Step 6: Document the archive-review cadence + on-call rotation; Path A has NO Slack-on-call requirement (hermetic-local-archive-only).",
  ],
  B: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL per playbook/06.10 §Step 1 + §Step 5.",
    "Step 2: Bootstrap the .alerts/ archive directory via --bootstrap + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL env var + set LINEAR_API_KEY + set ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID.",
    "Step 3: Run --validate-thresholds to confirm canonical thresholds + alert shape.",
    "Step 4: Wire the cron (Path B weekly Monday 09:05): 0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 3600.",
    "Step 5: Configure Slack alert format; create #attribution-alerts Slack channel + invite on-call rotation team + set Slack-channel-topic with canonical Move #6.10 reference + 5-hypothesis triage decision-tree.",
    "Step 6: Steady-state weekly on-call rotation + 5 hr/wk dedicated triage; Linear-fallback ticket-routing auto-creates a Linear ticket on alert.",
  ],
  C: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL + Linear-fallback + PagerDuty-Events-API-v2 integration ($0-$21/mo per seat).",
    "Step 2: Bootstrap .alerts/ + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY.",
    "Step 3: Run --validate-thresholds + manually fire a test alert to confirm all 3 channels (Slack + Linear + PagerDuty-low) receive the alert with the canonical 13-field payload.",
    "Step 4: Wire the cron (Path C every-4-hours): 0 6,10,14,18 * * * cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 600.",
    "Step 5: Configure Slack alert format + Linear ticket-routing + PagerDuty-low-urgency routing; 8-hour response window per assets/24 §5-tier escalation-routing-policy matrix; 16-hr/day on-call rotation team (2 shifts × 8 hr each).",
    "Step 6: Steady-state 16-hr/day on-call rotation + monthly archive-rotation-cadence review.",
  ],
  D: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create PagerDuty-Events-API-v2 high-urgency integration + Opsgenie-Enterprise integration ($8-$16/mo per seat) + Slack + Linear.",
    "Step 2: Bootstrap .alerts/ + set PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY + OPSGENIE_API_KEY + SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + ATTRIBUTION_ALERT_CMO_PAGER_EMAIL.",
    "Step 3: Run --validate-thresholds + fire a test alert to confirm all 4 channels (PagerDuty-high + Opsgenie + Slack + Linear) receive the alert + archive directory writes.",
    "Step 4: Wire the cron (Path D hourly minute 5): 5 * * * * cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$PAGERDUTY_EVENTS_API_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 300.",
    "Step 5: Configure PagerDuty-high-urgency routing + Opsgenie-escalation-routing + Slack + Linear; 24/7 dedicated on-call rotation; 1-hour response window + CMO-pager for $250k+/mo-impact incidents.",
    "Step 6: Steady-state 24/7 dedicated on-call rotation + weekly archive-rotation review + monthly 5-way-comparison-cycle + quarterly playbook-update-cycle.",
  ],
  E: [
    "Step 1: Defer Move #6.10 install until paid-spend grows to $500+/mo (canonical Path E defer rationale); the Move #6 attribution-quality-audit substrate should still be wired + running.",
    "Step 2: Document the defer-rationale in operator-build runbook; set quarterly review reminder.",
    "Step 3: When paid-spend grows to $500+/mo, re-run this calculator with the new inputs to confirm Path A/B recommendation.",
    "Step 4: Install scripts/attribution_health_alert_webhook.py per Path A or Path B 6-step build sequence.",
    "Step 5: Configure Slack-Incoming-Webhook URL (if Path B) + Linear-fallback (if Path B) + .alerts/ archive directory.",
    "Step 6: Wire the cron (Path A weekly Monday 09:00 OR Path B weekly Monday 09:05) + document the on-call rotation + escalation policy.",
  ],
};

export const ATTRIBUTION_ALERT_DEFAULTS: BrandAttributionAlertInputs = {
  paidSpend: 10_000,
  teamSize: "small",
  voiceProfile: "default",
  move68Cadence: "weekly",
  hasWebhookUrl: true,
  hasLinearFallback: true,
  hasPagerdutyFallback: false,
  hasOpsgenieFallback: false,
  slackChannelOnCallRotationCoverageHoursPerDay: 8,
  alertArchiveStorageGbPerYear: 0.5,
  cooldownSeconds: 3_600,
};

export function validateInputs(inputs: BrandAttributionAlertInputs): string | null {
  if (inputs.paidSpend < 0) return "paid_spend must be >= 0";
  if (inputs.slackChannelOnCallRotationCoverageHoursPerDay < 0)
    return "slack_channel_on_call_rotation_coverage_hours_per_day must be >= 0";
  if (inputs.alertArchiveStorageGbPerYear < 0)
    return "alert_archive_storage_gb_per_year must be >= 0";
  if (inputs.cooldownSeconds < 0)
    return "cooldown_seconds must be >= 0; canonical Path B = 3600s per playbook/06.10 §Pitfall #11";
  return null;
}

function tierForPaidSpend(paidSpend: number): PathName {
  if (paidSpend < PATH_E_FLOOR) return "E";
  if (paidSpend < PATH_A_FLOOR) return "A";
  if (paidSpend < PATH_B_FLOOR) return "B";
  if (paidSpend < PATH_C_FLOOR) return "C";
  return "D";
}

function validateOnCallCoverage(path: PathName, coverageHoursPerDay: number): boolean {
  if (path === "A" || path === "E") return true;
  if (path === "B") return coverageHoursPerDay >= 1;
  if (path === "C") return coverageHoursPerDay >= MIN_ON_CALL_COVERAGE_HOURS_PER_DAY;
  if (path === "D") return coverageHoursPerDay >= 24;
  return false;
}

function canonicalAlertPayloadFields(): string[] {
  return [
    "alert_id",
    "timestamp",
    "source",
    "severity",
    "title",
    "summary",
    "per_platform_breakdown",
    "drift_summary",
    "root_cause_hypothesis",
    "remediation",
    "overall_passed",
    "thresholds_used",
    "raw_rollup_path",
  ];
}

export const CANONICAL_WEBHOOK_THRESHOLDS: Record<string, number | boolean> = {
  fire_on_any_per_platform_fail: true,
  fire_on_cross_platform_drift: true,
  fire_on_match_rate_drift_pp: 3.0,
  fire_on_coverage_drift_pp: 2.0,
  cooldown_seconds: 3600,
};

function canonicalWebhookThresholds(): Record<string, number | boolean> {
  return {
    fire_on_any_per_platform_fail: true,
    fire_on_cross_platform_drift: true,
    fire_on_match_rate_drift_pp: 3.0,
    fire_on_coverage_drift_pp: 2.0,
    cooldown_seconds: 3600,
  };
}

export function recommendPath(inputs: BrandAttributionAlertInputs): PathRecommendation {
  const justificationParts: string[] = [];
  const downgrades: string[] = [];

  const deferredForLowSpend = inputs.paidSpend < PATH_E_FLOOR;
  const deferredForNoMove68 =
    MOVE_6_8_PREREQ_ENABLED && inputs.move68Cadence === "none";
  const deferredForHighStorage =
    inputs.alertArchiveStorageGbPerYear > MAX_ARCHIVE_STORAGE_GB_PER_YEAR;
  const deferredForInvalidCooldown = inputs.cooldownSeconds < MIN_COOLDOWN_SECONDS;

  if (deferredForLowSpend) {
    justificationParts.push(
      `paid_spend=$${inputs.paidSpend.toLocaleString()}/mo below $${PATH_E_FLOOR.toLocaleString()}/mo Path E floor; defer Move #6.10 install until paid-spend grows to $500+/mo`,
    );
  }

  if (deferredForNoMove68) {
    justificationParts.push(
      "move_6_8_cadence=none; canonical Move #6.8 prerequisite (Move #6.8 cross-platform attribution rollup must be shipped + running end-to-end before Move #6.10 can consume its output)",
    );
  }

  if (!inputs.hasWebhookUrl) {
    justificationParts.push(
      "has_webhook_url=False; Move #6.10 will run in Path A hermetic-local-archive-only mode (.alerts/ directory writes; no Slack dispatch). Set has_webhook_url=True to enable Slack + Linear + PagerDuty + Opsgenie dispatch per playbook/06.10 §Step 4 cron-wire",
    );
  }

  if (deferredForHighStorage) {
    justificationParts.push(
      `alert_archive_storage_gb_per_year=${inputs.alertArchiveStorageGbPerYear.toFixed(1)}GB above ${MAX_ARCHIVE_STORAGE_GB_PER_YEAR}GB floor; defer until archive rotation policy added`,
    );
  }

  if (deferredForInvalidCooldown) {
    justificationParts.push(
      `cooldown_seconds=${inputs.cooldownSeconds} below ${MIN_COOLDOWN_SECONDS} floor; canonical Path B = 3600s per playbook/06.10 §Pitfall #11`,
    );
  }

  const anyDeferral =
    deferredForLowSpend ||
    deferredForNoMove68 ||
    deferredForHighStorage ||
    deferredForInvalidCooldown;

  let path: PathName;
  if (anyDeferral) {
    path = "E";
  } else if (!inputs.hasWebhookUrl) {
    path = "A";
  } else {
    path = tierForPaidSpend(inputs.paidSpend);
  }

  // On-call-coverage downgrade
  if (
    (path === "C" || path === "D") &&
    !validateOnCallCoverage(path, inputs.slackChannelOnCallRotationCoverageHoursPerDay)
  ) {
    const newPath: PathName = inputs.teamSize === "small" || inputs.teamSize === "larger" ? "B" : "A";
    downgrades.push(
      `${path} requires ≥${path === "D" ? 24 : MIN_ON_CALL_COVERAGE_HOURS_PER_DAY} hr/day on-call coverage (operator has ${inputs.slackChannelOnCallRotationCoverageHoursPerDay} hr/day); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  // Luxury + PagerDuty downgrade
  if (
    LUXURY_PAGERDUTY_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "luxury" &&
    !inputs.hasPagerdutyFallback
  ) {
    let newPath: PathName = path;
    if (path === "D") newPath = "C";
    else if (path === "C") newPath = "B";
    if (newPath !== path) {
      downgrades.push(
        `Luxury voice without PagerDuty-fallback (VIP-customer-impact-requires-immediate-triage); ${path} → ${newPath}`,
      );
      path = newPath;
    }
  }

  // B2B + Linear downgrade
  if (
    B2B_LINEAR_DOWNGRADE_ENABLED &&
    inputs.voiceProfile === "b2b" &&
    !inputs.hasLinearFallback
  ) {
    let newPath: PathName = path;
    if (path === "D") newPath = "C";
    else if (path === "C") newPath = "B";
    if (newPath !== path) {
      downgrades.push(
        `B2B voice without Linear-fallback (B2B-ticket-routing-required-for-account-management); ${path} → ${newPath}`,
      );
      path = newPath;
    }
  }

  let justification: string;
  if (justificationParts.length > 0) {
    justification = justificationParts.join(" | ");
  } else {
    justification = `All deferral gates clear; base tier for paid_spend=$${inputs.paidSpend.toLocaleString()}/mo + team_size=${inputs.teamSize} → Path ${path}`;
  }
  if (downgrades.length > 0) {
    justification += ` | Downgrades applied: ${downgrades.join("; ")}`;
  }

  const [costLow, costHigh, recLow, recHigh] = PATH_COSTS[path];
  const [incLow, incHigh] = PATH_INCREMENTAL_ATTRIBUTION_RECOVERY_PER_INCIDENT[path];
  const [incCountLow, incCountHigh] = PATH_AVOIDED_INCIDENTS[path];
  const [roiLow, roiHigh] = PATH_ROI[path];

  const year1CostLow = costLow + 12 * recLow;
  const year1CostHigh = costHigh + 12 * recHigh;

  const year1RecoveryLow = incCountLow * incLow;
  const year1RecoveryHigh = incCountHigh * incHigh;

  let year1RoiLowComputed: number;
  if (year1CostLow <= 0) {
    year1RoiLowComputed = year1RecoveryLow > 0 ? Infinity : 0;
  } else {
    year1RoiLowComputed = year1RecoveryLow / year1CostLow;
  }
  let year1RoiHighComputed: number;
  if (year1CostHigh <= 0) {
    year1RoiHighComputed = year1RecoveryHigh > 0 ? Infinity : 0;
  } else {
    year1RoiHighComputed = year1RecoveryHigh / year1CostHigh;
  }

  let year1RoiLowFinal: number;
  let year1RoiHighFinal: number;
  if (path === "A" && year1CostLow === 0 && year1CostHigh === 0) {
    year1RoiLowFinal = Infinity;
    year1RoiHighFinal = Infinity;
  } else {
    if (roiLow === Infinity) {
      year1RoiLowFinal = year1RoiLowComputed;
    } else {
      year1RoiLowFinal = Math.max(year1RoiLowComputed, roiLow);
    }
    if (roiHigh === Infinity) {
      year1RoiHighFinal = year1RoiHighComputed;
    } else {
      year1RoiHighFinal = Math.min(year1RoiHighComputed, roiHigh);
    }
    if (year1RoiHighFinal < year1RoiLowFinal) {
      year1RoiHighFinal = year1RoiLowFinal;
    }
  }

  return {
    path,
    platforms: [...PATH_PLATFORMS[path]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification,
    costOneTimeLow: costLow,
    costOneTimeHigh: costHigh,
    costRecurringLow: recLow,
    costRecurringHigh: recHigh,
    year1CostLow,
    year1CostHigh,
    year1AvoidedIncidentsLow: incCountLow,
    year1AvoidedIncidentsHigh: incCountHigh,
    year1IncrementalAttributionRecoveryLow: year1RecoveryLow,
    year1IncrementalAttributionRecoveryHigh: year1RecoveryHigh,
    year1NetRoiLow: year1RoiLowFinal,
    year1NetRoiHigh: year1RoiHighFinal,
    alertCadence: PATH_ALERT_CADENCE[path],
    cooldownSecondsRecommended: PATH_COOLDOWN_SECONDS[path],
    canonicalAlertPayloadFields: canonicalAlertPayloadFields(),
    canonicalWebhookThresholds: canonicalWebhookThresholds(),
    attributionAlertPillarMatrix: { ...ATTRIBUTION_ALERT_PILLAR_MATRIX },
    buildSequence: [...BUILD_SEQUENCE_TEMPLATES[path]],
  };
}

export function projectPerPathRecovery(
  inputs: BrandAttributionAlertInputs,
  rec: PathRecommendation,
): PerPathRecovery {
  const year1CostMidFull = (rec.year1CostLow + rec.year1CostHigh) / 2;
  const recoveryMid =
    (rec.year1IncrementalAttributionRecoveryLow +
      rec.year1IncrementalAttributionRecoveryHigh) /
    2;
  const incidentsMid =
    (rec.year1AvoidedIncidentsLow + rec.year1AvoidedIncidentsHigh) / 2;

  let roiMidFull: number;
  if (year1CostMidFull <= 0) {
    roiMidFull = recoveryMid > 0 ? Infinity : 0;
  } else {
    roiMidFull = recoveryMid / year1CostMidFull;
  }

  const [roiLowBand, roiHighBand] = PATH_ROI[rec.path];
  let roiMidFinal: number;
  if (roiLowBand === Infinity && roiHighBand === Infinity) {
    roiMidFinal = Infinity;
  } else if (roiLowBand === Infinity) {
    roiMidFinal = Math.min(roiMidFull, roiHighBand);
  } else if (roiHighBand === Infinity) {
    roiMidFinal = Math.max(roiMidFull, roiLowBand);
  } else {
    roiMidFinal = Math.min(Math.max(roiMidFull, roiLowBand), roiHighBand);
  }

  return {
    year1CostMidFull,
    year1RecoveryMid: recoveryMid,
    year1IncidentsMid: incidentsMid,
    year1NetRoiMidFullCost: roiMidFull,
    year1NetRoiMidFinal: roiMidFinal,
    alertCadence: rec.alertCadence,
    cooldownSecondsRecommended: rec.cooldownSecondsRecommended,
  };
}

export function pathBadgeClasses(path: PathName): string {
  const base = "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold border";
  switch (path) {
    case "A":
      return `${base} border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300`;
    case "B":
      return `${base} border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300`;
    case "C":
      return `${base} border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300`;
    case "D":
      return `${base} border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300`;
    case "E":
      return `${base} border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300`;
  }
}

export function pathLongLabel(path: PathName): string {
  switch (path) {
    case "A":
      return "Hermetic local-archive-only ($0/mo, weekly Monday 09:00, solo operator)";
    case "B":
      return "Slack-webhook + Linear-fallback (DEFAULT $8/mo, weekly Monday 09:05, small team)";
    case "C":
      return "Slack + Linear + PagerDuty-low-urgency ($35/mo, every-4-hours, larger team)";
    case "D":
      return "PagerDuty + Opsgenie + Slack + Linear ($333/mo, hourly, enterprise 24/7)";
    case "E":
      return "DEFER (pre-launch or canonical prerequisite missing)";
  }
}

function fmtUsd(n: number): string {
  if (n === Infinity) return "∞";
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtRoi(n: number): string {
  if (n === Infinity) return "∞";
  return `${n.toFixed(1)}:1`;
}

export function renderAttributionAlertMarkdown(
  inputs: BrandAttributionAlertInputs,
  rec: PathRecommendation,
  proj: PerPathRecovery,
): string {
  const lines: string[] = [];
  lines.push("# Move #6.10 Attribution-Health-Alert Path A/B/C/D/E recommendation");
  lines.push("");
  lines.push("## Inputs");
  lines.push(`- Paid-spend monthly: ${fmtUsd(inputs.paidSpend)}`);
  lines.push(`- Team size: ${inputs.teamSize}`);
  lines.push(`- Voice profile: ${inputs.voiceProfile}`);
  lines.push(`- Move #6.8 cadence: ${inputs.move68Cadence}`);
  lines.push(`- Has webhook URL: ${inputs.hasWebhookUrl}`);
  lines.push(`- Has Linear-fallback: ${inputs.hasLinearFallback}`);
  lines.push(`- Has PagerDuty-fallback: ${inputs.hasPagerdutyFallback}`);
  lines.push(`- Has Opsgenie-fallback: ${inputs.hasOpsgenieFallback}`);
  lines.push(`- Slack on-call coverage: ${inputs.slackChannelOnCallRotationCoverageHoursPerDay} hr/day`);
  lines.push(`- Alert archive storage: ${inputs.alertArchiveStorageGbPerYear.toFixed(1)} GB/yr`);
  lines.push(`- Cooldown seconds: ${inputs.cooldownSeconds}`);
  lines.push("");
  lines.push(`## Recommendation: Path ${rec.path}`);
  lines.push(`- Alert cadence: ${rec.alertCadence}`);
  lines.push(`- Cooldown seconds (recommended): ${rec.cooldownSecondsRecommended.toLocaleString()}`);
  lines.push(`- Platforms: ${rec.platforms.length} platform(s) in scope`);
  for (const p of rec.platforms) lines.push(`  - ${p}`);
  lines.push(`- Default platform pick: ${rec.defaultPlatformPick}`);
  lines.push(`- Justification: ${rec.justification}`);
  lines.push("");
  lines.push("## Cost stack");
  lines.push(`- One-time setup: ${fmtUsd(rec.costOneTimeLow)} - ${fmtUsd(rec.costOneTimeHigh)}`);
  lines.push(`- Recurring monthly: ${fmtUsd(rec.costRecurringLow)} - ${fmtUsd(rec.costRecurringHigh)}`);
  lines.push("");
  lines.push("## Year-1 outcomes");
  lines.push(`- Year-1 cost: ${fmtUsd(rec.year1CostLow)} - ${fmtUsd(rec.year1CostHigh)}`);
  lines.push(
    `- Year-1 avoided incidents: ${rec.year1AvoidedIncidentsLow} - ${rec.year1AvoidedIncidentsHigh}`,
  );
  lines.push(
    `- Year-1 incremental attribution recovery: ${fmtUsd(rec.year1IncrementalAttributionRecoveryLow)} - ${fmtUsd(rec.year1IncrementalAttributionRecoveryHigh)}`,
  );
  lines.push(`- Year-1 net ROI: ${fmtRoi(rec.year1NetRoiLow)} - ${fmtRoi(rec.year1NetRoiHigh)}`);
  lines.push(`- Mid-ROI (full cost): ${fmtRoi(proj.year1NetRoiMidFullCost)}`);
  lines.push("");
  lines.push("## Canonical 13-field alert-payload shape");
  for (const f of rec.canonicalAlertPayloadFields) lines.push(`- ${f}`);
  lines.push("");
  lines.push("## Canonical 5 webhook thresholds");
  for (const [k, v] of Object.entries(rec.canonicalWebhookThresholds)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push("");
  lines.push("## 6-step build sequence");
  for (const step of rec.buildSequence) lines.push(`- ${step}`);
  return lines.join("\n");
}
