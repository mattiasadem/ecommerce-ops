import assert from "node:assert/strict";
import fs from "node:fs";

const libPath = new URL("../src/lib/attribution-health-alert.ts", import.meta.url);
const componentPath = new URL(
  "../src/components/attribution-health-alert-calculator.tsx",
  import.meta.url,
);
const pagePath = new URL(
  "../app/attribution-health-alert-archive/page.tsx",
  import.meta.url,
);

assert.ok(fs.existsSync(libPath), "RED: Move #6.10 attribution-health-alert math module must exist");
assert.ok(fs.existsSync(componentPath), "RED: interactive Move #6.10 component must exist");
assert.ok(fs.existsSync(pagePath), "RED: /attribution-health-alert-archive page must exist");

const libSource = fs.readFileSync(libPath, "utf8");
const componentSource = fs.readFileSync(componentPath, "utf8");
const pageSource = fs.readFileSync(pagePath, "utf8");

// ===== Canonical pin: thresholds + payload + cooldown =====
assert.match(libSource, /PATH_E_FLOOR\s*=\s*500\b/, "PATH_E_FLOOR stays pinned at $500");
assert.match(libSource, /PATH_A_FLOOR\s*=\s*5_000\b/, "PATH_A_FLOOR stays pinned at $5k");
assert.match(libSource, /PATH_B_FLOOR\s*=\s*50_000\b/, "PATH_B_FLOOR stays pinned at $50k");
assert.match(libSource, /PATH_C_FLOOR\s*=\s*250_000\b/, "PATH_C_FLOOR stays pinned at $250k");
assert.match(
  libSource,
  /fire_on_match_rate_drift_pp:\s*3\.0/,
  "webhook match-rate threshold stays pinned at 3.0pp",
);
assert.match(
  libSource,
  /fire_on_coverage_drift_pp:\s*2\.0/,
  "webhook coverage threshold stays pinned at 2.0pp",
);
assert.match(
  libSource,
  /cooldown_seconds:\s*3600/,
  "webhook canonical cooldown stays pinned at 3600s",
);
assert.match(
  libSource,
  /PATH_COOLDOWN_SECONDS[\s\S]*?B:\s*3_600/,
  "Path B canonical cooldown stays pinned at 3600s",
);

// ===== Canonical exports =====
assert.match(
  libSource,
  /export function recommendPath/,
  "lib exports the canonical Move #6.10 Path A/B/C/D/E scorer",
);
assert.match(
  libSource,
  /export function projectPerPathRecovery/,
  "lib exports the per-path projection helper",
);
assert.match(
  libSource,
  /export function renderAttributionAlertMarkdown/,
  "lib exports a usable paste-ready report artifact",
);
assert.match(
  libSource,
  /export function validateInputs/,
  "lib exports input validation",
);
assert.match(
  libSource,
  /export const CANONICAL_WEBHOOK_THRESHOLDS/,
  "lib exports the canonical 5 webhook thresholds",
);

// ===== Component & page wire-up =====
assert.match(
  componentSource,
  /ecom-ops:attribution-health-alert:v1/,
  "calculator inputs persist across sessions",
);
assert.match(
  componentSource,
  /Copy report/,
  "component emits a paste-ready operator artifact",
);
assert.match(
  componentSource,
  /Move #6\.10/,
  "component surfaces Move #6.10 identifier",
);
assert.match(
  componentSource,
  /5-pillar attribution-health-alert-webhook framework/,
  "component surfaces the 5-pillar framework",
);
assert.match(
  pageSource,
  /<AttributionHealthAlertCalculator\s*\/>/,
  "Move #6.10 calculator is mounted on /attribution-health-alert-archive",
);

// ===== Behavior: scoring math is byte-identical to the Python CLI =====

const {
  ATTRIBUTION_ALERT_DEFAULTS,
  CANONICAL_WEBHOOK_THRESHOLDS,
  recommendPath,
  renderAttributionAlertMarkdown,
  projectPerPathRecovery,
  validateInputs,
} = await import(libPath.href);

assert.deepEqual(CANONICAL_WEBHOOK_THRESHOLDS, {
  fire_on_any_per_platform_fail: true,
  fire_on_cross_platform_drift: true,
  fire_on_match_rate_drift_pp: 3.0,
  fire_on_coverage_drift_pp: 2.0,
  cooldown_seconds: 3600,
});

// Default Path B: $10k/mo, small team, default voice, weekly Move #6.8,
// has-webhook-url, has-Linear, no PagerDuty, 8 hr/day, 0.5 GB/yr, 3600s.
const defaultRec = recommendPath(ATTRIBUTION_ALERT_DEFAULTS);
assert.equal(defaultRec.path, "B", "default $10k/mo Path B DEFAULT");
assert.equal(defaultRec.cooldownSecondsRecommended, 3600);
assert.match(defaultRec.alertCadence, /Weekly Monday 09:00/);
assert.match(defaultRec.justification, /All deferral gates clear/);
assert.equal(defaultRec.canonicalAlertPayloadFields.length, 13, "13-field alert payload pinned");
assert.equal(defaultRec.year1AvoidedIncidentsLow, 1);
assert.equal(defaultRec.year1AvoidedIncidentsHigh, 2);

// Path E: defer below $500/mo
const lowSpendRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 100,
});
assert.equal(lowSpendRec.path, "E", "below $500/mo → Path E defer");
assert.match(lowSpendRec.justification, /below \$500/);

// Path A: $1k/mo but no webhook URL → Path A hermetic-local-archive
const pathARec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 1_000,
  hasWebhookUrl: false,
});
assert.equal(pathARec.path, "A", "no-webhook-URL → Path A hermetic-local-archive");

// Path C: $50k/mo, larger team, has-PagerDuty → Path C
const pathCRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 75_000,
  teamSize: "larger",
  hasPagerdutyFallback: true,
});
assert.equal(pathCRec.path, "C", "$50k-$250k/mo → Path C");
assert.equal(pathCRec.cooldownSecondsRecommended, 600);

// Path D: $300k/mo, enterprise, has-PagerDuty + has-Opsgenie + 24/7 coverage → Path D
const pathDRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 300_000,
  teamSize: "enterprise",
  hasPagerdutyFallback: true,
  hasOpsgenieFallback: true,
  slackChannelOnCallRotationCoverageHoursPerDay: 24,
});
assert.equal(pathDRec.path, "D", "$250k+/mo enterprise → Path D");
assert.equal(pathDRec.cooldownSecondsRecommended, 300);

// Voice downgrade: B2B without Linear at $75k/mo Path C → downgrade to Path B
const b2bDowngradeRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 75_000,
  teamSize: "larger",
  voiceProfile: "b2b",
  hasPagerdutyFallback: true,
  hasLinearFallback: false,
});
assert.equal(
  b2bDowngradeRec.path,
  "B",
  "B2B w/o Linear at $50k-$250k/mo → Path B (downgrade from Path C)",
);
assert.match(b2bDowngradeRec.justification, /B2B voice without Linear-fallback/);

// Luxury downgrade: Luxury without PagerDuty at $75k/mo Path C → downgrade to Path B
const luxuryDowngradeRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 75_000,
  teamSize: "larger",
  voiceProfile: "luxury",
  hasPagerdutyFallback: false,
});
assert.equal(
  luxuryDowngradeRec.path,
  "B",
  "Luxury w/o PagerDuty at $50k-$250k/mo → Path B (downgrade from Path C)",
);
assert.match(luxuryDowngradeRec.justification, /Luxury voice without PagerDuty-fallback/);

// Move #6.8 prerequisite defer: move_6_8_cadence=none → Path E
const noMove68Rec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 10_000,
  move68Cadence: "none",
});
assert.equal(noMove68Rec.path, "E", "move_6_8_cadence=none → Path E defer");
assert.match(noMove68Rec.justification, /move_6_8_cadence=none/);

// Validation error: negative cooldown
const validationErr = validateInputs({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  cooldownSeconds: -1,
});
assert.ok(validationErr, "negative cooldown must return validation error");
assert.match(validationErr ?? "", /cooldown_seconds must be >= 0/);

// Year-1 cost: Path B default $10k/mo → cost_low = 2 + 12*8 = $98; cost_high = 50 + 12*102 = $1274
assert.equal(defaultRec.year1CostLow, 98);
assert.equal(defaultRec.year1CostHigh, 1274);

// Year-1 incremental recovery: Path B = 1-2 incidents × $5k-$15k/incident
assert.equal(defaultRec.year1IncrementalAttributionRecoveryLow, 5_000);
assert.equal(defaultRec.year1IncrementalAttributionRecoveryHigh, 30_000);

// Mid-ROI projection sanity: mid cost = (98 + 1274) / 2 = 686, mid recovery = (5000 + 30000)/2 = 17500
const proj = projectPerPathRecovery(ATTRIBUTION_ALERT_DEFAULTS, defaultRec);
assert.equal(proj.year1CostMidFull, 686);
assert.equal(proj.year1RecoveryMid, 17_500);

// Markdown report contract
const report = renderAttributionAlertMarkdown(ATTRIBUTION_ALERT_DEFAULTS, defaultRec, proj);
assert.match(report, /Move #6\.10 Attribution-Health-Alert/);
assert.match(report, /Recommendation: Path B/);
assert.match(report, /Year-1 net ROI/);
assert.match(report, /13-field alert-payload shape/);
assert.match(report, /Canonical 5 webhook thresholds/);
assert.match(report, /6-step build sequence/);

// Path A: zero-cost → infinite ROI
const pathAInfRec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 1_000,
  hasWebhookUrl: false,
});
assert.equal(pathAInfRec.year1NetRoiLow, Infinity, "Path A zero-cost → infinite low ROI");
assert.equal(pathAInfRec.year1NetRoiHigh, Infinity, "Path A zero-cost → infinite high ROI");

// Path E: zero cost AND zero recovery → 0:1 ROI
const pathERec = recommendPath({
  ...ATTRIBUTION_ALERT_DEFAULTS,
  paidSpend: 100,
});
assert.equal(pathERec.year1NetRoiLow, 0, "Path E below $500 → 0:1 low");
assert.equal(pathERec.year1NetRoiHigh, 0, "Path E below $500 → 0:1 high");

console.log("PASS attribution health alert Move #6.10 Path A/B/C/D/E scorer contract + behavior");
