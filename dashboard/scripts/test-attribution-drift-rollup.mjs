import assert from "node:assert/strict";
import fs from "node:fs";

const libPath = new URL("../src/lib/attribution-drift-rollup.ts", import.meta.url);
const componentPath = new URL("../src/components/attribution-drift-rollup.tsx", import.meta.url);
const pagePath = new URL("../app/attribution-quality/page.tsx", import.meta.url);

assert.ok(fs.existsSync(libPath), "RED: drift-rollup TypeScript math module must exist");
assert.ok(fs.existsSync(componentPath), "RED: interactive drift-rollup component must exist");

const libSource = fs.readFileSync(libPath, "utf8");
const componentSource = fs.readFileSync(componentPath, "utf8");
const pageSource = fs.readFileSync(pagePath, "utf8");

assert.match(libSource, /MATCH_RATE_DRIFT_PP:\s*3(?:\.0)?/, "D1 match-rate threshold stays pinned at 3pp");
assert.match(libSource, /COVERAGE_DRIFT_PP:\s*2(?:\.0)?/, "D2 coverage threshold stays pinned at 2pp");
assert.match(libSource, /MULTI_PLATFORM_DROP_MAX:\s*1/, "D3 simultaneous-drop threshold stays pinned at one platform");
assert.match(libSource, /export function buildDriftRollup/, "lib exports the canonical rollup scorer");
assert.match(libSource, /export function renderDriftRollupMarkdown/, "lib exports a usable report artifact");
assert.match(componentSource, /ecom-ops:attribution-drift-rollup:v1/, "rollup inputs persist across sessions");
assert.match(componentSource, /ecom-ops:attribution-quality-audit:v1/, "rollup imports Meta current metrics from Move #6.5");
assert.match(componentSource, /ecom-ops:tiktok-attribution-audit:v1/, "rollup imports TikTok current metrics from Move #6.6");
assert.match(componentSource, /ecom-ops:snap-pinterest-attribution-audit:v1/, "rollup imports Snap current metrics from Move #6.7");
assert.match(componentSource, /storage/, "rollup listens for source-audit updates across tabs");
assert.match(componentSource, /Copy incident report/, "component emits a paste-ready operator artifact");
assert.match(pageSource, /<AttributionDriftRollup\s*\/>/, "Move #6.8 rollup is mounted on /attribution-quality");

const {
  CANONICAL_DRIFT_THRESHOLDS,
  buildDriftRollup,
  renderDriftRollupMarkdown,
} = await import(libPath.href);

assert.deepEqual(CANONICAL_DRIFT_THRESHOLDS, {
  MATCH_RATE_DRIFT_PP: 3,
  COVERAGE_DRIFT_PP: 2,
  MULTI_PLATFORM_DROP_MAX: 1,
});

const stable = buildDriftRollup({
  platforms: [
    { id: "meta", label: "Meta + Google + GA4", currentMatchRate: 94, previousMatchRate: 92, currentCoverage: 96, previousCoverage: 95 },
    { id: "tiktok", label: "TikTok", currentMatchRate: 88, previousMatchRate: 86, currentCoverage: 93, previousCoverage: 92 },
    { id: "snap", label: "Snap + Pinterest", currentMatchRate: 84, previousMatchRate: 82, currentCoverage: 90, previousCoverage: 89 },
  ],
  recentChange: "none",
});
assert.equal(stable.driftDetected, false, "values inside strict canonical thresholds stay stable");
assert.equal(stable.healthScore, 100, "all canonical drift gates passing scores 100");
assert.equal(stable.platformsWithMatchRateDrop, 0);

const incident = buildDriftRollup({
  platforms: [
    { id: "meta", label: "Meta + Google + GA4", currentMatchRate: 86, previousMatchRate: 94, currentCoverage: 88, previousCoverage: 96 },
    { id: "tiktok", label: "TikTok", currentMatchRate: 78, previousMatchRate: 88, currentCoverage: 84, previousCoverage: 93 },
    { id: "snap", label: "Snap + Pinterest", currentMatchRate: 82, previousMatchRate: 84, currentCoverage: 89, previousCoverage: 90 },
  ],
  recentChange: "theme_liquid_update",
});
assert.equal(incident.driftDetected, true);
assert.equal(incident.platformsWithMatchRateDrop, 2, "D3 detects two simultaneous >3pp match-rate drops");
assert.equal(incident.rootCause?.id, "theme_liquid_update");
assert.ok(incident.healthScore < 70, "multi-platform incident lands below the incident score boundary");
assert.ok(incident.prioritizedFixes[0].includes("theme.liquid"), "selected shared change is prioritized first");
const markdown = renderDriftRollupMarkdown(incident);
assert.match(markdown, /# Attribution Cross-Platform Drift Rollup/);
assert.match(markdown, /2 platforms with simultaneous match-rate drops/);
assert.match(markdown, /theme\.liquid snippet update/);

console.log("PASS attribution drift Move #6.8 interactive rollup contract + behavior");
