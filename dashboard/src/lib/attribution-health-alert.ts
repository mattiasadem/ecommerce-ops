/**
 * Attribution-Health Alert math — direct browser port of
 * `scripts/attribution_health_alert_unit_economics.py` (the Move #6.10
 * Path A/B/C/D/E scorer). Used by the interactive
 * `<AttributionHealthAlertCalculator />` component on
 * `/playbooks/06.10-attribution-health-alert-webhook-launch`.
 *
 * The math, canonical path tiers (A / B / C / D / E), per-path cost stacks,
 * Year-1 ROI bands, 13-field alert-payload shape, 5 canonical webhook
 * thresholds, and 5-pillar framework matrix are derived from
 * `playbooks/06.10-attribution-health-alert-webhook-launch.md` and the
 * Move #6.10 webhook script (`scripts/attribution_health_alert_webhook.py`).
 *
 * Path tiers (canonical, from playbook 06.10 §"Which alert-cadence fits your team"):
 *   - Path A: solo / <$5k/mo paid → hermetic-local-archive-only (.alerts/ directory,
 *     no Slack dispatch); weekly Monday 09:00 cron.
 *   - Path B: small team / $5k–$50k/mo paid → Slack-webhook + Linear-fallback;
 *     weekly Monday 09:05 cron (5 min after Move #6.8). DEFAULT.
 *   - Path C: larger team / $50k–$250k/mo paid → Slack + Linear + PagerDuty-low-urgency;
 *     every-4-hours cron (06:00 / 10:00 / 14:00 / 18:00 UTC).
 *   - Path D: enterprise / $250k+/mo paid → PagerDuty-high + Opsgenie + Slack + Linear;
 *     hourly cron (minute 5 of every hour).
 *   - Path E: pre-launch defer (<$500/mo paid) — no Move #6.10 install yet.
 *
 * Year-1 ROI bands (canonical, from playbook 06.10 §"Cost & ROI estimate"):
 *   - Path A: ∞ (zero cost; capped at 0-1 incident/yr)
 *   - Path B: 60:1 conservative / 150:1 expected at $1M–$5M GMV
 *   - Path C: 40:1 / 100:1 (muted by on-call-rotation overhead)
 *   - Path D: 20:1 / 60:1 (muted by dedicated on-call rotation cost)
 *   - Path E: defer (no install)
 *
 * Deferral / downgrade gates (mirrors canonical playbook §"Prerequisites"):
 *   1. paid_spend < $500/mo → defer (Path E)
 *   2. move_6_8_cadence = "none" → defer (Move #6.8 must be running first)
 *   3. archive_storage_gb_per_year > 10 → defer (rotate archives older than 90 days)
 *   4. cooldown_seconds < 0 → defer (canonical floor is 0; canonical Path B = 3600)
 *   5. on-call coverage below path minimum → downgrade (C/D → B or A)
 *   6. voice_profile = "luxury" without PagerDuty → downgrade (D → C; C → B)
 *   7. voice_profile = "b2b" without Linear → downgrade (D → C; C → B)
 *   8. has_webhook_url = false → surface Path A (hermetic local archive)
 */

// ----- Type definitions ----------------------------------------------------

export type AttributionAlertPath = "A" | "B" | "C" | "D" | "E";

export type VoiceProfile = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type TeamSize = "solo" | "small" | "larger" | "enterprise";
export type Move68Cadence = "weekly" | "daily" | "monthly" | "none";

export interface AttributionAlertInputs {
  paidSpend: number;                                    // monthly paid-spend in USD
  teamSize: TeamSize;
  voiceProfile: VoiceProfile;
  move68Cadence: Move68Cadence;
  hasWebhookUrl: boolean;
  hasLinearFallback: boolean;
  hasPagerdutyFallback: boolean;
  hasOpsgenieFallback: boolean;
  onCallCoverageHoursPerDay: number;                    // 0..24
  alertArchiveStorageGbPerYear: number;                 // GB / yr
  cooldownSeconds: number;
}

export interface AttributionAlertForecast {
  path: AttributionAlertPath;
  pathLabel: string;
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;
  downgrades: string[];
  deferredFor: string[];
  // Cost stack (USD)
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  // Avoided-incidents projection
  year1AvoidedIncidentsLow: number;
  year1AvoidedIncidentsHigh: number;
  year1IncrementalAttributionRecoveryLow: number;
  year1IncrementalAttributionRecoveryHigh: number;
  year1NetRoiLow: number;        // can be Infinity for Path A
  year1NetRoiHigh: number;       // can be Infinity for Path A
  // Cadence
  alertCadence: string;
  cooldownSecondsRecommended: number;
  // Pinned contract
  canonicalAlertPayloadFields: string[];
  canonicalWebhookThresholds: Record<string, number | boolean>;
  attributionAlertPillarMatrix: Record<string, string>;
  buildSequence: string[];
  healthBand: "great" | "good" | "marginal" | "weak" | "defer" | "no-cost";
}

// ----- Path floor constants (paid-spend monthly USD) -----------------------

const PATH_E_FLOOR = 500;
const PATH_A_FLOOR = 5_000;
const PATH_B_FLOOR = 50_000;
const PATH_C_FLOOR = 250_000;

const MAX_ARCHIVE_STORAGE_GB_PER_YEAR = 10;
const MIN_ON_CALL_COVERAGE_HOURS_PER_DAY = 8;

const VALID_TEAM_SIZES: TeamSize[] = ["solo", "small", "larger", "enterprise"];
const VALID_VOICE_PROFILES: VoiceProfile[] = [
  "default",
  "luxury",
  "sustainable",
  "gen_z",
  "b2b",
];
const VALID_MOVE68_CADENCES: Move68Cadence[] = [
  "weekly",
  "daily",
  "monthly",
  "none",
];

// ----- Per-path cost / recovery / ROI tables --------------------------------

const PATH_COSTS: Record<AttributionAlertPath, [number, number, number, number]> = {
  A: [0, 0, 0, 0], // hermetic local-archive only (zero recurring cost)
  B: [2, 50, 8, 102], // Slack-webhook + Linear-fallback $8/mo + $2/mo amortized setup
  C: [50, 500, 35, 250], // Slack + Linear + PagerDuty-low + on-call-rotation
  D: [500, 5_000, 333, 2_000], // PagerDuty + Opsgenie + dedicated on-call-rotation
  E: [0, 0, 0, 0], // pre-launch defer
};

const PATH_AVOIDED_INCIDENTS: Record<AttributionAlertPath, [number, number]> = {
  A: [0, 1],
  B: [1, 2],
  C: [2, 4],
  D: [4, 8],
  E: [0, 0],
};

const PATH_RECOVERY_PER_INCIDENT: Record<AttributionAlertPath, [number, number]> = {
  A: [1_000, 5_000],
  B: [5_000, 15_000],
  C: [15_000, 50_000],
  D: [50_000, 200_000],
  E: [0, 0],
};

const PATH_ROI_BANDS: Record<AttributionAlertPath, [number, number]> = {
  A: [Infinity, Infinity],
  B: [60, 150],
  C: [40, 100],
  D: [20, 60],
  E: [0, 0],
};

const PATH_ALERT_CADENCE: Record<AttributionAlertPath, string> = {
  A: "Weekly Monday 09:00 (hermetic-local-archive-only; no Slack dispatch)",
  B: "Weekly Monday 09:05 (5 minutes after Move #6.8 09:00; Slack-webhook + Linear-fallback)",
  C: "Every-4-hours (06:00/10:00/14:00/18:00 UTC daily; Slack + Linear + PagerDuty-low-urgency)",
  D: "Hourly (PagerDuty + Opsgenie + dedicated on-call; Move #6.10 + Move #6.8 daily cadence)",
  E: "DEFER (no Move #6.10 install until paid-spend grows to $500+/mo)",
};

const PATH_COOLDOWN_SECONDS: Record<AttributionAlertPath, number> = {
  A: 604_800, // 7 days
  B: 3_600, // 1 hour (canonical Path B default)
  C: 600, // 10 minutes
  D: 300, // 5 minutes
  E: 0,
};

const PATH_PLATFORMS: Record<AttributionAlertPath, string[]> = {
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

const PATH_DEFAULT_PLATFORM_PICK: Record<AttributionAlertPath, string> = {
  A: "scripts/attribution_health_alert_webhook.py (hermetic-local-archive-only; .alerts/ directory)",
  B: "Slack-Incoming-Webhooks + Linear-fallback + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 3600)",
  C: "Slack-Incoming-Webhooks + Linear + PagerDuty-low-urgency + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 600)",
  D: "PagerDuty-Events-API-v2 + Opsgenie + Slack + Linear + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 300)",
  E: "(DEFER — re-evaluate when paid-spend grows to $500+/mo)",
};

const PATH_LABEL: Record<AttributionAlertPath, string> = {
  A: "Path A — Hermetic local-archive only (solo / <$5k/mo paid)",
  B: "Path B — Slack-webhook + Linear-fallback (DEFAULT; small team / $5k–$50k/mo paid)",
  C: "Path C — Slack + Linear + PagerDuty-low (larger team / $50k–$250k/mo paid)",
  D: "Path D — PagerDuty + Opsgenie + dedicated on-call (enterprise / $250k+/mo paid)",
  E: "Path E — DEFER (pre-launch; paid-spend < $500/mo)",
};

// 5-pillar attribution-health-alert-webhook framework (mirrors playbook 06.10 + asset/24).
const PILLAR_MATRIX: Record<string, string> = {
  "Pillar 1 — Move #6.8 cross-platform attribution rollup substrate":
    "Move #6.8 must be shipped + running on canonical cadence (weekly Path B by default; daily Path C for larger teams; monthly Path A for solo operators). Move #6.10 CONSUMES the Move #6.8 --output-json. Without Move #6.8 running end-to-end, Move #6.10 emits 'ROLLOUP FILE MISSING' sentinel alerts and is useless. Canonical Move #6.8 prerequisites: Move #6.5 (Meta + Google + GA4 audit) + Move #6.6 (TikTok audit) + Move #6.7 (Snap + Pinterest audit) all shipped + running with overall_passed: true.",
  "Pillar 2 — Slack-compatible webhook URL + canonical 13-field alert-payload shape":
    "Webhook URL must be a valid http(s) URL; canonical Slack-Incoming-Webhooks URL shape https://hooks.slack.com/services/<workspace>/<channel>/<token>; canonical 13-field alert-payload shape [alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path] pinned by regression gate; 5 canonical webhook thresholds [fire_on_any_per_platform_fail: true / fire_on_cross_platform_drift: true / fire_on_match_rate_drift_pp: 3.0 / fire_on_coverage_drift_pp: 2.0 / cooldown_seconds: 3600] pinned by regression gate. Pinned because downstream consumers (Slack message-formatting, Linear ticket-creation, archive-file parsers, cooldown walker) parse on them.",
  "Pillar 3 — .alerts/ archive directory + hermetic local fallback":
    ".alerts/ directory under the canonical workspace root; canonical hermetic-fallback mode when --webhook-url is omitted (the script writes to --alert-archive with timestamp + severity in filename: <timestamp>-<severity>.json); cooldown walker scans the directory for fresh-archive-filenames (within --cooldown-seconds window) and skips firing duplicate alerts. Archive storage budget: <1 GB/yr Path A / 1-5 GB/yr Path B / 5-10 GB/yr Path C / >10 GB/yr Path D — Path D operators should add a cron-job to rotate archives older than 90 days.",
  "Pillar 4 — 5-decision-rule engine + 3600s cooldown + 3 exit codes":
    "Canonical 5-rule engine: Rule 1 ANY per-platform audit fails → fire / Rule 2 cross-platform drift detected → fire / Rule 3 match-rate drift > 3.0pp → fire / Rule 4 coverage drift > 2.0pp → fire / Rule 5 cooldown — skip if a fresh alert exists within 3600s. 3 exit codes: 0 = no-alert (cooldown-suppressed OR all-passed) / 1 = alert-fired (webhook-POST succeeded OR archive-written) / 2 = webhook-POST-failed.",
  "Pillar 5 — On-call rotation + escalation policy + incident-postmortem template":
    "Per assets/24 §12-section on-call-rotation-SOP template + §5-tier escalation-routing-policy matrix. Canonical Path B coverage: 5 hr/wk dedicated on-call. Path C coverage: 16 hr/day on-call (06:00-22:00 UTC, 2 shifts × 8 hr each). Path D coverage: 24/7 dedicated on-call rotation. Escalation routing: Path B = Linear ticket auto-created on alert → on-call-attribution-ops investigates. Path C = Slack + Linear + PagerDuty-low-urgency (8-hour response window). Path D = PagerDuty-high-urgency + Opsgenie + 1-hour response window + dedicated-attribution-ops-engineer + CMO-pager for $250k+/mo-impact incidents.",
};

// 6-step build sequences (mirrors scripts/attribution_health_alert_unit_economics.py §BUILD_SEQUENCE_TEMPLATES).
const BUILD_SEQUENCE: Record<AttributionAlertPath, string[]> = {
  A: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py (canonical Move #6.10 hardening script; requires Python 3.10+ stdlib only; no pip deps).",
    "Step 2: Bootstrap the .alerts/ archive directory via python3 scripts/attribution_health_alert_webhook.py --bootstrap (creates .alerts/ under the canonical workspace root).",
    "Step 3: Run --validate-thresholds to confirm the canonical 5 webhook thresholds + 13-field alert-payload shape are pinned.",
    "Step 4: Wire the cron (Path A weekly Monday 09:00): 0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/",
    "Step 5: Read the .alerts/ archive directory weekly (hermetic-mode); no Slack dispatch — operator reads archive files directly via cat .alerts/<timestamp>-<severity>.json",
    "Step 6: Document the archive-review cadence + on-call rotation; Path A has NO Slack-on-call requirement (hermetic-local-archive-only); operator reviews archive weekly + takes corrective action on demand.",
  ],
  B: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL per playbook/06.10 §Step 1 + §Step 5; canonical 13-field payload shape + 5 webhook thresholds pinned by regression gates.",
    "Step 2: Bootstrap the .alerts/ archive directory via --bootstrap + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID env vars.",
    "Step 3: Run --validate-thresholds to confirm canonical thresholds + alert shape.",
    "Step 4: Wire the cron (Path B weekly Monday 09:05): 0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 3600",
    "Step 5: Configure Slack alert format; create #attribution-alerts channel + invite on-call rotation + per-hypothesis triage-decision-tree (per assets/24 §5-hypothesis triage decision-tree).",
    "Step 6: Steady-state weekly on-call rotation + 5 hr/wk dedicated triage (canonical Step 7); Linear-fallback auto-creates a Linear ticket on alert → on-call-attribution-ops investigates; 7-slide incident-postmortem-template shipped after every fired-alert.",
  ],
  C: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL + Linear-fallback + PagerDuty-Events-API-v2 integration (PagerDuty-Starter $0-$21/mo per seat).",
    "Step 2: Bootstrap .alerts/ + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY (per-service-routing).",
    "Step 3: Run --validate-thresholds + manually fire a test alert via --webhook-url + a synthetic-rollup JSON to confirm all 3 channels (Slack + Linear + PagerDuty-low) receive the alert with the canonical 13-field payload shape.",
    "Step 4: Wire the cron (Path C every 4 hours): 0 6,10,14,18 * * * cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 600",
    "Step 5: Configure Slack + Linear + PagerDuty-low-urgency routing (8-hour response window per assets/24 §5-tier escalation-routing-policy); create #attribution-alerts channel + invite 16-hr/day on-call rotation team.",
    "Step 6: Steady-state 16-hr/day on-call rotation + monthly archive-rotation-cadence review; 7-slide incident-postmortem-template shipped after every fired-alert with PagerDuty-acknowledgement timestamp.",
  ],
  D: [
    "Step 1: Install scripts/attribution_health_alert_webhook.py + create PagerDuty-Events-API-v2 high-urgency integration + Opsgenie-Enterprise integration ($8-$16/mo per seat) + Slack + Linear.",
    "Step 2: Bootstrap .alerts/ + set PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY + OPSGENIE_API_KEY + SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + ATTRIBUTION_ALERT_CMO_PAGER_EMAIL.",
    "Step 3: Run --validate-thresholds + fire a test alert via --webhook-url + synthetic-rollup JSON to confirm all 4 channels (PagerDuty-high + Opsgenie + Slack + Linear) receive the alert; PagerDuty-acknowledgement should fire within 1 minute.",
    "Step 4: Wire the cron (Path D hourly at minute 5): 5 * * * * cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py --webhook-url \"$PAGERDUTY_EVENTS_API_URL\" --rollup-json .rollups/attribution_latest.json --alert-archive .alerts/ --cooldown-seconds 300",
    "Step 5: Configure PagerDuty-high-urgency routing + Opsgenie-escalation + Slack + Linear; PagerDuty-Enterprise-dedicated-attribution-ops-engineer on-call 24/7; 1-hour response window + CMO-pager for $250k+/mo-impact incidents.",
    "Step 6: Steady-state 24/7 dedicated on-call rotation + weekly archive-rotation-cadence review + monthly 5-way-comparison-cycle + quarterly playbook-update-cycle; canonical 4-amulet cross-platform attribution-regression detection cookbook (per assets/24 §4-amulet) reviewed quarterly; 7-slide incident-postmortem-template shipped within 24 hours of every fired-alert.",
  ],
  E: [
    "Step 1: Defer Move #6.10 install until paid-spend grows to $500+/mo (canonical Path E defer rationale); the Move #6 attribution-quality-audit substrate (Move #6 + #6.5 + #6.6 + #6.7 + #6.8) should still be wired + running.",
    "Step 2: Document the defer-rationale in operator-build runbook; set calendar reminder for Q+1 quarterly review to re-evaluate Move #6.10 install when paid-spend grows.",
    "Step 3: When paid-spend grows to $500+/mo, re-run this script with the new inputs to confirm Path A/B recommendation.",
    "Step 4: Install scripts/attribution_health_alert_webhook.py per Path A or Path B 6-step build sequence.",
    "Step 5: Configure Slack-Incoming-Webhook URL (if Path B) + Linear-fallback (if Path B) + .alerts/ archive directory.",
    "Step 6: Wire the cron (Path A weekly Monday 09:00 OR Path B weekly Monday 09:05) + document the on-call rotation + escalation policy per Pillar 5.",
  ],
};

// Pinned canonical contract.
const CANONICAL_ALERT_PAYLOAD_FIELDS = [
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

const CANONICAL_WEBHOOK_THRESHOLDS: Record<string, number | boolean> = {
  fire_on_any_per_platform_fail: true,
  fire_on_cross_platform_drift: true,
  fire_on_match_rate_drift_pp: 3.0,
  fire_on_coverage_drift_pp: 2.0,
  cooldown_seconds: 3600,
};

// ----- Defaults + options ---------------------------------------------------

export const ATTRIBUTION_ALERT_DEFAULTS: AttributionAlertInputs = {
  paidSpend: 10_000, // Path B DEFAULT base
  teamSize: "small",
  voiceProfile: "default",
  move68Cadence: "weekly",
  hasWebhookUrl: true,
  hasLinearFallback: true,
  hasPagerdutyFallback: false,
  hasOpsgenieFallback: false,
  onCallCoverageHoursPerDay: 8,
  alertArchiveStorageGbPerYear: 0.5,
  cooldownSeconds: 3600,
};

export const TEAM_SIZE_OPTIONS: { value: TeamSize; label: string; hint: string }[] = [
  { value: "solo", label: "Solo operator", hint: "1 person" },
  { value: "small", label: "Small team", hint: "1-3 people" },
  { value: "larger", label: "Larger team", hint: "4-9 people" },
  { value: "enterprise", label: "Enterprise", hint: "10+ people" },
];

export const VOICE_PROFILE_OPTIONS: { value: VoiceProfile; label: string; hint: string }[] = [
  { value: "default", label: "Default", hint: "Standard DTC" },
  { value: "luxury", label: "Luxury", hint: "VIP-customer-impact" },
  { value: "sustainable", label: "Sustainable", hint: "Mission-driven" },
  { value: "gen_z", label: "Gen Z", hint: "Trend-led" },
  { value: "b2b", label: "B2B", hint: "Account-managed" },
];

export const MOVE68_CADENCE_OPTIONS: { value: Move68Cadence; label: string; hint: string }[] = [
  { value: "weekly", label: "Weekly", hint: "Path B DEFAULT" },
  { value: "daily", label: "Daily", hint: "Path C" },
  { value: "monthly", label: "Monthly", hint: "Path A" },
  { value: "none", label: "None / not shipped", hint: "DEFER" },
];

// ----- Validation ----------------------------------------------------------

export function validateAttributionAlertInputs(inputs: AttributionAlertInputs): string[] {
  const errors: string[] = [];
  if (inputs.paidSpend < 0) errors.push("Paid-spend must be ≥ 0");
  if (inputs.paidSpend > 10_000_000) errors.push("Paid-spend must be ≤ $10M/mo");
  if (!VALID_TEAM_SIZES.includes(inputs.teamSize)) {
    errors.push("Team size must be one of solo/small/larger/enterprise");
  }
  if (!VALID_VOICE_PROFILES.includes(inputs.voiceProfile)) {
    errors.push("Voice profile must be one of default/luxury/sustainable/gen_z/b2b");
  }
  if (!VALID_MOVE68_CADENCES.includes(inputs.move68Cadence)) {
    errors.push("Move #6.8 cadence must be one of weekly/daily/monthly/none");
  }
  if (inputs.onCallCoverageHoursPerDay < 0) {
    errors.push("On-call coverage must be ≥ 0 hr/day");
  }
  if (inputs.onCallCoverageHoursPerDay > 24) {
    errors.push("On-call coverage must be ≤ 24 hr/day");
  }
  if (inputs.alertArchiveStorageGbPerYear < 0) {
    errors.push("Alert archive storage must be ≥ 0 GB/yr");
  }
  if (inputs.cooldownSeconds < 0) {
    errors.push("Cooldown seconds must be ≥ 0");
  }
  return errors;
}

// ----- Helper formatters ----------------------------------------------------

function fmtInf(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  return value.toFixed(0);
}

function fmtRoi(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  if (value >= 1000) return `${Math.round(value)}:1`;
  return `${value.toFixed(1)}:1`;
}

// ----- Core scoring rule ----------------------------------------------------

function tierForPaidSpend(paidSpend: number): AttributionAlertPath {
  if (paidSpend < PATH_E_FLOOR) return "E";
  if (paidSpend < PATH_A_FLOOR) return "A";
  if (paidSpend < PATH_B_FLOOR) return "B";
  if (paidSpend < PATH_C_FLOOR) return "C";
  return "D";
}

function validateOnCallCoverage(
  path: AttributionAlertPath,
  coverage: number,
): boolean {
  if (path === "A" || path === "E") return true;
  if (path === "B") return coverage >= 1;
  if (path === "C") return coverage >= MIN_ON_CALL_COVERAGE_HOURS_PER_DAY;
  if (path === "D") return coverage >= 24;
  return false;
}

function onCallFloorForPath(path: AttributionAlertPath): number {
  if (path === "A" || path === "E") return 0;
  if (path === "B") return 1;
  if (path === "C") return MIN_ON_CALL_COVERAGE_HOURS_PER_DAY;
  if (path === "D") return 24;
  return 0;
}

function healthBandFor(path: AttributionAlertPath): AttributionAlertForecast["healthBand"] {
  if (path === "E") return "defer";
  if (path === "A") return "no-cost";
  // Path B/C/D: use mid ROI band (canonical PATH_ROI midpoints).
  const [lo, hi] = PATH_ROI_BANDS[path];
  const mid = (lo + hi) / 2;
  if (mid >= 100) return "great";
  if (mid >= 50) return "good";
  if (mid >= 25) return "marginal";
  return "weak";
}

// ----- Public forecast function --------------------------------------------

export function forecastAttributionAlert(
  inputs: AttributionAlertInputs,
): AttributionAlertForecast {
  const justificationParts: string[] = [];
  const deferredFor: string[] = [];
  const downgrades: string[] = [];

  // ---- Deferral gates ----
  let deferredForLowSpend = false;
  if (inputs.paidSpend < PATH_E_FLOOR) {
    deferredForLowSpend = true;
    deferredFor.push("low-spend");
    justificationParts.push(
      `paid_spend=$${Math.round(inputs.paidSpend).toLocaleString()}/mo below $${PATH_E_FLOOR.toLocaleString()}/mo Path E floor; defer Move #6.10 install until paid-spend grows to $500+/mo`,
    );
  }

  let deferredForNoMove68 = false;
  if (inputs.move68Cadence === "none") {
    deferredForNoMove68 = true;
    deferredFor.push("no-move-6-8");
    justificationParts.push(
      "move_6_8_cadence=none; canonical Move #6.8 prerequisite (Move #6.8 cross-platform attribution rollup must be shipped + running end-to-end before Move #6.10 can consume its output)",
    );
  }

  // Path A hermetic-local-archive fallback exists when hasWebhookUrl=false.
  // We do NOT defer; we surface Path A as the canonical audit mode.
  if (!inputs.hasWebhookUrl) {
    justificationParts.push(
      "has_webhook_url=false; Move #6.10 will run in Path A hermetic-local-archive-only mode (.alerts/ directory writes; no Slack dispatch). Set has_webhook_url=true to enable Slack + Linear + PagerDuty + Opsgenie dispatch per playbook/06.10 §Step 4 cron-wire",
    );
  }

  let deferredForHighStorage = false;
  if (inputs.alertArchiveStorageGbPerYear > MAX_ARCHIVE_STORAGE_GB_PER_YEAR) {
    deferredForHighStorage = true;
    deferredFor.push("high-storage");
    justificationParts.push(
      `alert_archive_storage_gb_per_year=${inputs.alertArchiveStorageGbPerYear.toFixed(1)}GB above ${MAX_ARCHIVE_STORAGE_GB_PER_YEAR}GB floor; defer until archive rotation policy added (canonical Path D operators should add cron-job to rotate archives older than 90 days)`,
    );
  }

  let deferredForInvalidCooldown = false;
  if (inputs.cooldownSeconds < 0) {
    deferredForInvalidCooldown = true;
    deferredFor.push("invalid-cooldown");
    justificationParts.push(
      `cooldown_seconds=${inputs.cooldownSeconds} below 0 floor; defer until cooldown_seconds >= 0 (canonical Path B = 3600s per playbook/06.10 §Pitfall #11)`,
    );
  }

  // ---- Base tier assignment ----
  const anyDeferral =
    deferredForLowSpend ||
    deferredForNoMove68 ||
    deferredForHighStorage ||
    deferredForInvalidCooldown;

  let path: AttributionAlertPath;
  if (anyDeferral) {
    path = "E";
  } else if (!inputs.hasWebhookUrl) {
    path = "A";
  } else {
    path = tierForPaidSpend(inputs.paidSpend);
  }

  // ---- On-call coverage downgrade ----
  if (
    (path === "C" || path === "D") &&
    !validateOnCallCoverage(path, inputs.onCallCoverageHoursPerDay)
  ) {
    const floor = onCallFloorForPath(path);
    const newPath: AttributionAlertPath =
      inputs.teamSize === "small" || inputs.teamSize === "larger" ? "B" : "A";
    downgrades.push(
      `Path ${path} requires ≥${floor} hr/day on-call coverage (operator has ${inputs.onCallCoverageHoursPerDay} hr/day); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  // ---- Voice profile downgrade: luxury without PagerDuty ----
  if (
    inputs.voiceProfile === "luxury" &&
    !inputs.hasPagerdutyFallback &&
    (path === "C" || path === "D")
  ) {
    const newPath: AttributionAlertPath = path === "D" ? "C" : "B";
    downgrades.push(
      `Luxury voice without PagerDuty-fallback (VIP-customer-impact-requires-immediate-triage); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  // ---- Voice profile downgrade: b2b without Linear ----
  if (
    inputs.voiceProfile === "b2b" &&
    !inputs.hasLinearFallback &&
    (path === "C" || path === "D")
  ) {
    const newPath: AttributionAlertPath = path === "D" ? "C" : "B";
    downgrades.push(
      `B2B voice without Linear-fallback (B2B-ticket-routing-required-for-account-management); ${path} → ${newPath}`,
    );
    path = newPath;
  }

  // Compose justification.
  let justification: string;
  if (justificationParts.length > 0) {
    justification = justificationParts.join(" | ");
  } else {
    justification = `All deferral gates clear; base tier for paid_spend=$${Math.round(inputs.paidSpend).toLocaleString()}/mo + team_size=${inputs.teamSize} → Path ${path}`;
  }
  if (downgrades.length > 0) {
    justification += ` | Downgrades applied: ${downgrades.join("; ")}`;
  }

  // ---- Cost stack + Year-1 projection ----
  const [costOneTimeLow, costOneTimeHigh, costRecurringLow, costRecurringHigh] =
    PATH_COSTS[path];
  const [recoveryPerIncidentLow, recoveryPerIncidentHigh] =
    PATH_RECOVERY_PER_INCIDENT[path];
  const [incidentsLow, incidentsHigh] = PATH_AVOIDED_INCIDENTS[path];
  const [roiLowBand, roiHighBand] = PATH_ROI_BANDS[path];

  const year1CostLow = costOneTimeLow + 12.0 * costRecurringLow;
  const year1CostHigh = costOneTimeHigh + 12.0 * costRecurringHigh;

  const year1RecoveryLow = incidentsLow * recoveryPerIncidentLow;
  const year1RecoveryHigh = incidentsHigh * recoveryPerIncidentHigh;

  // ROI computation (clamped to canonical band).
  let year1RoiLow: number;
  let year1RoiHigh: number;
  if (year1CostLow <= 0) {
    year1RoiLow = year1RecoveryLow > 0 ? Infinity : 0;
  } else {
    year1RoiLow = year1RecoveryLow / year1CostLow;
  }
  if (year1CostHigh <= 0) {
    year1RoiHigh = year1RecoveryHigh > 0 ? Infinity : 0;
  } else {
    year1RoiHigh = year1RecoveryHigh / year1CostHigh;
  }

  // Clamp to canonical band (Path A is ∞).
  if (!Number.isFinite(roiLowBand) && !Number.isFinite(roiHighBand)) {
    year1RoiLow = Infinity;
    year1RoiHigh = Infinity;
  } else if (!Number.isFinite(roiLowBand)) {
    year1RoiHigh = Math.min(year1RoiHigh, roiHighBand);
    year1RoiLow = Math.max(year1RoiLow, 0);
  } else if (!Number.isFinite(roiHighBand)) {
    year1RoiLow = Math.max(year1RoiLow, roiLowBand);
    year1RoiHigh = Math.min(year1RoiHigh, 1_000_000);
  } else {
    year1RoiLow = Math.max(year1RoiLow, roiLowBand);
    year1RoiHigh = Math.min(year1RoiHigh, roiHighBand);
  }
  if (year1RoiHigh < year1RoiLow) year1RoiHigh = year1RoiLow;

  return {
    path,
    pathLabel: PATH_LABEL[path],
    platforms: [...PATH_PLATFORMS[path]],
    defaultPlatformPick: PATH_DEFAULT_PLATFORM_PICK[path],
    justification,
    downgrades,
    deferredFor,
    costOneTimeLow,
    costOneTimeHigh,
    costRecurringLow,
    costRecurringHigh,
    year1CostLow,
    year1CostHigh,
    year1AvoidedIncidentsLow: incidentsLow,
    year1AvoidedIncidentsHigh: incidentsHigh,
    year1IncrementalAttributionRecoveryLow: year1RecoveryLow,
    year1IncrementalAttributionRecoveryHigh: year1RecoveryHigh,
    year1NetRoiLow: year1RoiLow,
    year1NetRoiHigh: year1RoiHigh,
    alertCadence: PATH_ALERT_CADENCE[path],
    cooldownSecondsRecommended: PATH_COOLDOWN_SECONDS[path],
    canonicalAlertPayloadFields: [...CANONICAL_ALERT_PAYLOAD_FIELDS],
    canonicalWebhookThresholds: { ...CANONICAL_WEBHOOK_THRESHOLDS },
    attributionAlertPillarMatrix: { ...PILLAR_MATRIX },
    buildSequence: [...BUILD_SEQUENCE[path]],
    healthBand: healthBandFor(path),
  };
}

// ----- Markdown report ------------------------------------------------------

export function renderAttributionAlertMarkdown(
  inputs: AttributionAlertInputs,
  f: AttributionAlertForecast,
): string {
  const fmtUsd = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtHrs = (n: number) =>
    n === Infinity ? "∞" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return [
    `## Attribution-Health Alert Path ${f.path} — ${f.pathLabel}`,
    ``,
    `**Inputs:**`,
    `- Paid-spend monthly: ${fmtUsd(inputs.paidSpend)}/mo`,
    `- Team size: ${inputs.teamSize}`,
    `- Voice profile: ${inputs.voiceProfile}`,
    `- Move #6.8 cadence: ${inputs.move68Cadence}`,
    `- Has webhook URL: ${inputs.hasWebhookUrl ? "yes" : "no"}`,
    `- Has Linear-fallback: ${inputs.hasLinearFallback ? "yes" : "no"}`,
    `- Has PagerDuty-fallback: ${inputs.hasPagerdutyFallback ? "yes" : "no"}`,
    `- Has Opsgenie-fallback: ${inputs.hasOpsgenieFallback ? "yes" : "no"}`,
    `- On-call coverage: ${inputs.onCallCoverageHoursPerDay} hr/day`,
    `- Alert archive storage: ${inputs.alertArchiveStorageGbPerYear.toFixed(1)} GB/yr`,
    `- Cooldown seconds: ${inputs.cooldownSeconds}`,
    ``,
    `### Recommendation`,
    `- Path: ${f.path} — ${f.pathLabel}`,
    `- Alert cadence: ${f.alertCadence}`,
    `- Cooldown (recommended): ${f.cooldownSecondsRecommended.toLocaleString("en-US")}s`,
    `- Platforms in scope: ${f.platforms.length}`,
    f.platforms.map((p) => `- ${p}`).join("\n"),
    `- Default platform pick: ${f.defaultPlatformPick}`,
    ``,
    `### Cost stack`,
    `- One-time setup: ${fmtUsd(f.costOneTimeLow)} - ${fmtUsd(f.costOneTimeHigh)}`,
    `- Recurring monthly: ${fmtUsd(f.costRecurringLow)} - ${fmtUsd(f.costRecurringHigh)}`,
    ``,
    `### Year-1 outcomes`,
    `- Year-1 cost: ${fmtUsd(f.year1CostLow)} - ${fmtUsd(f.year1CostHigh)}`,
    `- Year-1 avoided incidents: ${f.year1AvoidedIncidentsLow} - ${f.year1AvoidedIncidentsHigh}`,
    `- Year-1 incremental attribution recovery: ${fmtUsd(f.year1IncrementalAttributionRecoveryLow)} - ${fmtUsd(f.year1IncrementalAttributionRecoveryHigh)}`,
    `- Year-1 net ROI: ${fmtRoi(f.year1NetRoiLow)} - ${fmtRoi(f.year1NetRoiHigh)}`,
    ``,
    `### Justification`,
    f.justification,
    f.downgrades.length > 0
      ? `\n### Downgrades applied\n${f.downgrades.map((d) => `- ${d}`).join("\n")}`
      : "",
    ``,
    `### Canonical alert-payload shape (13-field)`,
    f.canonicalAlertPayloadFields.map((field) => `- ${field}`).join("\n"),
    ``,
    `### Canonical webhook thresholds (5-field)`,
    Object.entries(f.canonicalWebhookThresholds)
      .map(([k, v]) => `- ${k}: ${typeof v === "boolean" ? v : fmtHrs(Number(v))}`)
      .join("\n"),
    ``,
    `### 6-step build sequence`,
    f.buildSequence.map((s) => `${s}`).join("\n"),
  ]
    .filter((s) => s !== "")
    .join("\n");
}
