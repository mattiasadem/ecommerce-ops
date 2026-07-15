import fs from "node:fs";
import assert from "node:assert/strict";

const componentPath = new URL("../src/components/attribution-quality-audit.tsx", import.meta.url);
const libPath = new URL("../src/lib/attribution-quality-audit.ts", import.meta.url);
const source = fs.readFileSync(componentPath, "utf8");
const libSource = fs.readFileSync(libPath, "utf8");

// ----- Component-level contract assertions -----

assert.match(
  source,
  /import\s*\{[\s\S]*buildAuditReport[\s\S]*renderAuditMarkdown[\s\S]*\}\s*from\s*"@\/lib\/attribution-quality-audit"/,
  "component imports the canonical helpers from the lib module",
);
assert.match(
  source,
  /export function AttributionQualityAudit/,
  "component exports AttributionQualityAudit as the canonical entry point",
);
assert.match(
  source,
  /useState<AuditInputs>\(\(\) => emptyInputs\(\)\)/,
  "component initializes inputs with the empty defaults (so first render is deterministic)",
);
assert.match(
  source,
  /localStorage\.getItem\(STORAGE_KEY\)/,
  "component reads the persisted snapshot key during hydration",
);
assert.match(
  source,
  /localStorage\.setItem\(STORAGE_KEY,\s*JSON\.stringify\(inputs\)\)/,
  "component persists every input change to localStorage",
);
assert.match(
  source,
  /canonicalPassAll\(\)/,
  "seed-canonical-pass handler wires through the canonical-pass fixture",
);
assert.match(
  source,
  /stressTestFailAll\(\)/,
  "stress-test handler wires through the stress-test fixture",
);
assert.match(
  source,
  /const report = useMemo\(\(\) => buildAuditReport\(inputs\), \[inputs\]\)/,
  "audit report is memoized on the inputs dependency",
);
assert.match(
  source,
  /gateAPreview|gateCPreview|gateDPreview|gateEPreview|gateFPreview|gateGPreview/,
  "component renders all 6 inline gate previews",
);

// ----- Lib-level threshold assertions (these are the canonical pins) -----

assert.match(
  libSource,
  /MIN_META_CAPI_MATCH_RATE_PCT:\s*90/,
  "Gate A Meta CAPI match rate floor pinned at 90%",
);
assert.match(
  libSource,
  /MIN_DEDUP_RATIO:\s*0\.8/,
  "Gate A dedup ratio floor pinned at 0.8",
);
assert.match(
  libSource,
  /MAX_DEDUP_RATIO:\s*1\.5/,
  "Gate A dedup ratio ceiling pinned at 1.5",
);
assert.match(
  libSource,
  /MIN_META_COVERAGE_PCT:\s*95/,
  "Gate A Meta coverage floor pinned at 95%",
);
assert.match(
  libSource,
  /MIN_META_PIXEL_COVERAGE_PCT:\s*95/,
  "Gate C Meta Pixel coverage floor pinned at 95%",
);
assert.match(
  libSource,
  /MIN_GOOGLE_EC_HASHED_EMAIL_PCT:\s*80/,
  "Gate D Google EC email coverage floor pinned at 80%",
);
assert.match(
  libSource,
  /MAX_GA4_TW_REVENUE_DELTA_PCT:\s*5/,
  "Gate E GA4↔TW revenue delta ceiling pinned at 5%",
);
assert.match(
  libSource,
  /MAX_ORDER_COUNT_DELTA_PCT:\s*3/,
  "Gate E order count delta ceiling pinned at 3%",
);
assert.match(
  libSource,
  /MIN_COHORT_ROUNDTRIP_MATCH_PCT:\s*95/,
  "Gate F cohort roundtrip floor pinned at 95%",
);
assert.match(
  libSource,
  /MIN_SAMPLE_ORDERS:\s*5/,
  "Gate F minimum sample size pinned at 5 orders",
);
assert.match(
  libSource,
  /DEFAULT_DRIFT_THRESHOLD_PCT:\s*5/,
  "Gate G drift threshold default pinned at 5pp",
);

// ----- Lib API surface -----

assert.match(
  libSource,
  /export function buildAuditReport/,
  "lib exposes buildAuditReport for the component to consume",
);
assert.match(
  libSource,
  /export function renderAuditMarkdown/,
  "lib exposes renderAuditMarkdown for the copy-report handler",
);
assert.match(
  libSource,
  /export function canonicalPassAll/,
  "lib exposes canonicalPassAll for the seed-canonical-pass handler",
);
assert.match(
  libSource,
  /export function stressTestFailAll/,
  "lib exposes stressTestFailAll for the stress-test handler",
);

// ----- Storage key matches the canonical pattern -----

assert.match(
  source,
  /ecom-ops:attribution-quality-audit:v1/,
  "storage key matches the canonical cross-feature pattern (ecom-ops:<feature>:v1)",
);

console.log("PASS attribution-quality Move #6.5 verification contract");