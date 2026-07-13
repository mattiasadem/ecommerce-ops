/**
 * Parity tests for the Generative-AI-Engine Path A/B/C scorer.
 *
 * Mirrors `scripts/generative_ai_engine_unit_economics.py` byte-for-byte on
 * canonical scenarios. Run via `node --import tsx scripts/tests/generative-ai-engine.test.ts`
 * or via `npm run test` from the dashboard directory.
 */
import assert from "node:assert/strict";
import {
  GENERATIVE_AI_DEFAULTS,
  recommendPath,
  renderGenerativeAiMarkdown,
} from "../../src/lib/generative-ai-engine";

// Scenario 1: $3M US DTC, all gates clear → Path B DEFAULT.
// Python output:
//   PATH: B
//   YEAR1_COST: 8000.0 80780.0
//   YEAR1_INC_REV: 90000.0 450000.0
//   ROI: 6.0 187.0
const pathB = recommendPath(GENERATIVE_AI_DEFAULTS);
assert.equal(pathB.path, "B");
assert.equal(pathB.baseTier, "B");
assert.equal(pathB.isDeferred, false);
assert.deepEqual(pathB.year1Cost, [8000, 80780]);
assert.deepEqual(pathB.year1IncrementalRevenue, [90000, 450000]);
assert.deepEqual(pathB.year1Roi, [6, 187]);
assert.equal(pathB.oneTimeCost[0], 2000);
assert.equal(pathB.oneTimeCost[1], 50000);
assert.equal(pathB.recurringMonthlyCost[0], 500);
assert.equal(pathB.recurringMonthlyCost[1], 2565);

// Scenario 2: $500k + low creatives → Path A + DEFERRED (5+ deferral gates).
const pathADeferred = recommendPath({
  ...GENERATIVE_AI_DEFAULTS,
  usDtcGmv: 500_000,
  creativesPerWeek: 20,
  capacityHoursPerWeek: 2,
  hasMove10AiAdCreative6mo: false,
  hasTripleWhaleAttribution: false,
  hasKlaviyoEmailSubstrate: false,
  hasPostscriptSmsSubstrate: false,
  hasAiEngineCreativeBaseline: false,
});
assert.equal(pathADeferred.path, "A");
assert.equal(pathADeferred.baseTier, "A");
assert.equal(pathADeferred.isDeferred, true);
assert.ok(pathADeferred.deferralReasons.length >= 5,
  `expected ≥5 deferral gates, got ${pathADeferred.deferralReasons.length}`);
assert.ok(pathADeferred.justification.startsWith("DEFER"));

// Scenario 3: $30M + luxury voice without AI-engine baseline → Path C downgraded to Path B.
// baseTier C, luxury without ai_engine_creative_baseline → downgrade to B.
// has_dedicated_ai_engine_team=False also fires path-C-dedicated-team downgrade (C→B).
const pathCDowngraded = recommendPath({
  ...GENERATIVE_AI_DEFAULTS,
  usDtcGmv: 30_000_000,
  voiceProfile: "luxury",
  hasAiEngineCreativeBaseline: false,
});
assert.equal(pathCDowngraded.baseTier, "C");
// Both gates fire: luxury downgrade + Path-C dedicated-team downgrade.
// After luxury: C → B. After path-C-team: still B (no further downgrade).
assert.equal(pathCDowngraded.path, "B");
assert.ok(pathCDowngraded.downgradeReasons.length >= 1);

// Scenario 4: $30M + luxury WITH AI baseline + dedicated team → Path C clean.
const pathCClean = recommendPath({
  ...GENERATIVE_AI_DEFAULTS,
  usDtcGmv: 30_000_000,
  voiceProfile: "luxury",
  hasAiEngineCreativeBaseline: true,
  hasAiCustomerServiceBaseline: true,
  hasDedicatedAiEngineTeam: true,
});
assert.equal(pathCClean.baseTier, "C");
assert.equal(pathCClean.path, "C");
assert.equal(pathCClean.isDeferred, false);
assert.deepEqual(pathCClean.year1Cost, [50_000 + 3_656 * 12, 250_000 + 6_044 * 12]);

// Scenario 5: $30k GMV → Path A canonical (no deferrals with defaults).
const pathASmall = recommendPath({
  ...GENERATIVE_AI_DEFAULTS,
  usDtcGmv: 30_000,
  creativesPerWeek: 60,
});
assert.equal(pathASmall.path, "A");
assert.equal(pathASmall.baseTier, "A");
assert.equal(pathASmall.isDeferred, false);
assert.deepEqual(pathASmall.year1Cost, [500 + 20 * 12, 2000 + 500 * 12]);

// Markdown render is non-empty and contains canonical tokens.
const md = renderGenerativeAiMarkdown(GENERATIVE_AI_DEFAULTS, pathB);
assert.ok(md.includes("Path B"));
assert.ok(md.includes("Year-1"));
assert.ok(md.includes("Pencil Pro"));
assert.ok(md.includes("Build Sequence"));
assert.ok(md.includes("Pillar 1"));
assert.ok(pathB.pillarMatrix.length === 5);
assert.ok(pathB.buildSequence.length === 6);

console.log(
  `generative-ai-engine parity OK (${[
    "scenario1-pathB-clean",
    "scenario2-pathA-deferred-5gates",
    "scenario3-pathC-downgraded-luxury",
    "scenario4-pathC-clean",
    "scenario5-pathA-small-gmv",
  ].join(", ")})`,
);