import assert from "node:assert/strict";
import fs from "node:fs";

const libPath = new URL("../src/lib/smsbump-postscript-channel-orchestration.ts", import.meta.url);
const componentPath = new URL("../src/components/smsbump-postscript-path-calculator.tsx", import.meta.url);
const pagePath = new URL("../app/smsbump-postscript-channel-orchestration/page.tsx", import.meta.url);

assert.ok(fs.existsSync(libPath), "RED: SMSBump + Postscript TypeScript math module must exist");
assert.ok(fs.existsSync(componentPath), "RED: interactive SMSBump + Postscript component must exist");

const libSource = fs.readFileSync(libPath, "utf8");
const componentSource = fs.readFileSync(componentPath, "utf8");
const pageSource = fs.readFileSync(pagePath, "utf8");

// Lib API surface.
assert.match(libSource, /export function recommendPath/, "lib exports the canonical scorer");
assert.match(libSource, /export function renderSmsbumpPostscriptMarkdown/, "lib exports a usable report artifact");
assert.match(libSource, /export function validateSmsbumpPostscriptInputs/, "lib exports input validation");
assert.match(libSource, /export function projectPerPathRevenue/, "lib exports per-path revenue projection");

// Canonical thresholds pinned.
assert.match(libSource, /PATH_A_FLOOR\s*=\s*500_000/, "Path A floor stays pinned at $500k");
assert.match(libSource, /PATH_B_FLOOR\s*=\s*1_000_000/, "Path B floor stays pinned at $1M");
assert.match(libSource, /PATH_C_FLOOR\s*=\s*25_000_000/, "Path C floor stays pinned at $25M");
assert.match(libSource, /MIN_SMS_LIST_SIZE\s*=\s*50_000/, "SMS list size floor stays pinned at 50k");
assert.match(libSource, /MIN_INTERNATIONAL_GMV_PCT\s*=\s*5\.0/, "International GMV % floor stays pinned at 5.0%");
assert.match(libSource, /CAPACITY_GATE_HR_WK\s*=\s*4/, "Capacity gate hr/wk stays pinned at 4");

// Component persistence + interaction surface.
assert.match(componentSource, /ecom-ops:smsbump-postscript-path:v1/, "scorer inputs persist across sessions");
assert.match(componentSource, /Move #19/, "component badges itself as Move #19");
assert.match(componentSource, /SmsbumpPostscriptChannelOrchestrationCalculator/, "component exports canonical name");
assert.match(componentSource, /Copy SMSBump \+ Postscript report/, "component emits a paste-ready operator artifact");

// Page mount.
assert.match(pageSource, /<SmsbumpPostscriptChannelOrchestrationCalculator\s*\/>/, "Move #19 calculator is mounted on /smsbump-postscript-channel-orchestration");

// Functional tests against the actual scorer.
const {
  recommendPath,
  renderSmsbumpPostscriptMarkdown,
  projectPerPathRevenue,
  SMSBUMP_POSTSCRIPT_DEFAULTS,
  validateSmsbumpPostscriptInputs,
} = await import(libPath.href);

// Canonical pass: defaults → Path B.
const canonical = recommendPath(SMSBUMP_POSTSCRIPT_DEFAULTS);
assert.equal(canonical.path, "B", "canonical defaults land on Path B");
assert.equal(
  canonical.defaultPlatformPick.includes("SMSBump-Pro-tier"),
  true,
  "Path B default platform pick includes SMSBump-Pro-tier",
);
assert.ok(
  canonical.year1IncrementalSmsOrchestrationRevenueLow > 0,
  "Path B default surfaces positive incremental revenue",
);
assert.ok(canonical.year1RoiLow >= 2.4, "Path B default ROI low band respected");
assert.ok(canonical.year1RoiHigh <= 107, "Path B default ROI high band respected");
assert.equal(canonical.buildSequence.length, 6, "Path B build sequence is 6 steps");

// Luxury downgrade: Path C with luxury voice + no creative baseline → downgrade.
const luxuryC = recommendPath({
  ...SMSBUMP_POSTSCRIPT_DEFAULTS,
  usDtcGmv: 30_000_000,
  hasAttentiveEnterpriseSecondary: true,
  voiceProfile: "luxury",
  hasSmsOrchestrationCreativeBaseline: false,
});
assert.equal(luxuryC.path, "B", "Luxury voice without creative baseline downgrades Path C to Path B");
assert.ok(
  luxuryC.justification.includes("Luxury voice without SMS-orchestration-creative-baseline"),
  "Luxury downgrade fires the canonical justification",
);

// Path C without Attentive → downgrade to B.
const noAttentiveC = recommendPath({
  ...SMSBUMP_POSTSCRIPT_DEFAULTS,
  usDtcGmv: 30_000_000,
  hasAttentiveEnterpriseSecondary: false,
  voiceProfile: "default",
});
assert.equal(noAttentiveC.path, "B", "Path C without Attentive downgrades to Path B");
assert.ok(
  noAttentiveC.justification.includes("Path C without Attentive-Enterprise-secondary"),
  "Path C without Attentive downgrade fires the canonical justification",
);

// All deferral gates fire → defaults to Path A (audit-only).
const deferAll = recommendPath({
  usDtcGmv: 100_000,
  internationalGmvPct: 1.0,
  smsListSize: 5_000,
  hasPostscriptPrimary: false,
  hasSmsbumpAccount: false,
  hasKlaviyoSmsSegmentOverlay: false,
  hasAttentiveEnterpriseSecondary: false,
  hasDlrMonitoringWired: false,
  hasTripleWhaleSmsMerge: false,
  voiceProfile: "default",
  hasDedicatedSmsOrchestrationTeamCapacityHoursPerWeek: 1,
  hasSmsOrchestrationCreativeBaseline: false,
});
assert.equal(deferAll.path, "A", "all deferral gates fired → Path A surfaced as audit");
assert.ok(
  deferAll.justification.includes("below $500,000 Path A floor"),
  "low-GMV deferral justification rendered",
);
assert.ok(
  deferAll.justification.includes("below 5.0% floor"),
  "low-international deferral justification rendered",
);
assert.ok(
  deferAll.justification.includes("below 50,000 floor"),
  "low-SMS-list deferral justification rendered",
);

// Validation.
assert.equal(validateSmsbumpPostscriptInputs(SMSBUMP_POSTSCRIPT_DEFAULTS), null, "defaults validate clean");
assert.ok(
  validateSmsbumpPostscriptInputs({
    ...SMSBUMP_POSTSCRIPT_DEFAULTS,
    internationalGmvPct: 200,
  }),
  "international_gmv_pct > 100 fails validation",
);

// Per-path revenue projection.
const projection = projectPerPathRevenue(SMSBUMP_POSTSCRIPT_DEFAULTS, canonical);
assert.ok(projection.year1RevenueMid > 0, "projection surfaces positive Year-1 revenue");
assert.equal(
  projection.year1RoiMidFinal >= 2.4 && projection.year1RoiMidFinal <= 107,
  true,
  "projection ROI mid clamped to Path B band",
);
assert.equal(projection.totalGmvBase, 5_500_000, "projection computes total GMV base (US + 10% international)");

// Markdown rendering.
const md = renderSmsbumpPostscriptMarkdown(SMSBUMP_POSTSCRIPT_DEFAULTS, canonical, projection);
assert.match(md, /Path B/, "report names the recommended path");
assert.match(md, /Year-1 incr SMS-orch-revenue/, "report includes incremental revenue section");
assert.match(md, /5-pillar SMSBump/, "report includes 5-pillar framework section");
assert.match(md, /6-step build sequence/, "report includes 6-step build sequence section");
assert.match(md, /Per-path revenue projection/, "report includes per-path revenue projection when supplied");
assert.match(md, /Total GMV base/, "report surfaces total GMV base from projection");

console.log("PASS smsbump-postscript Move #19 Path A/B/C scorer contract");
