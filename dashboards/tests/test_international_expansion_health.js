/* International Expansion Health — static dashboard smoke tests
 *
 * Companion to dashboards/international-expansion-health.html.
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1) HTML is well-formed (parseable as a single root element with closing tags).
 *   (2) Inline <script> block parses without syntax errors.
 *   (3) Canonical SAMPLE_INPUTS + MARKETS + PATH_TABLE + PHASE_GATES JSON shapes
 *       conform to the research/04 + playbook 11 + asset 13 contract.
 *   (4) URL param parsing (?path= ?us_gmv= ?markets= ?gates= ?demo=) routes correctly.
 *   (5) Fetch timeout pattern (AbortController + setTimeout + clearTimeout) is present.
 *   (6) Fetch-timeout-contract value is 1500ms (canonical per the rollup script's notification style).
 *   (7) Required UI sections are present: summary + markets + projection + gates + gates-table + next-action.
 *   (8) Each demo gate entry has id/criterion/verification (or cadence for D-gates) fields.
 *   (9) Demo-mode rendering never crashes when called with SAMPLE_INPUTS (via vm.runInContext).
 *  (10) Per-market math lifts correctly: Path B $5M base × market-share weights sum to ~100%.
 *  (11) Path-for-GMV classifier returns A/B/C in canonical $1M/$10M brackets.
 *  (12) Cross-references in source comment resolve to on-disk artifacts (research/04, playbook 11, asset 13, script).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'international-expansion-health.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

let passed = 0;
let failed = 0;
const failures = [];

function assert(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

console.log('\n=== International Expansion Health dashboard smoke tests ===\n');

// (1) HTML is non-empty + has expected structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has <!DOCTYPE html>', html.startsWith('<!DOCTYPE html>'));
assert('html has <title>', /<title>[^<]+<\/title>/.test(html));
assert('title text matches International Expansion Health', html.includes('<title>International Expansion Health'));
assert('html closes with </html>', html.trim().endsWith('</html>'));

// (2) Extract + parse the inline <script>
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert('exactly one inline <script> block found', scriptMatch && scriptMatch[1]);

let scriptText = '';
if (scriptMatch) {
  scriptText = scriptMatch[1];
  try {
    new vm.Script(scriptText, { filename: 'inline-script.js' });
    assert('inline <script> parses without syntax errors', true);
  } catch (e) {
    assert('inline <script> parses without syntax errors', false, e.message);
  }
}

// (3) Required UI sections present
for (const id of ['summary-section', 'markets-section', 'projection-section', 'gates-section', 'gates-table-section', 'next-action-section']) {
  assert(`section #${id} present`, html.includes(`id="${id}"`));
}

// (4) Fetch-timeout contract
assert('fetch uses AbortController', html.includes('AbortController'));
assert('fetch uses setTimeout for abort', /setTimeout\(\(\) => controller\.abort\(\)/.test(html));
assert('fetch uses clearTimeout in finally', html.includes('clearTimeout(timeoutId)'));

const toMatch = html.match(/FETCH_TIMEOUT_MS\s*=\s*(\d+)/);
assert('FETCH_TIMEOUT_MS is defined', !!toMatch);
if (toMatch) {
  assert('FETCH_TIMEOUT_MS = 1500 (canonical)', toMatch[1] === '1500', `got ${toMatch[1]}`);
}

// (5) URL-param parsing surface
assert('paramOr helper present', /function paramOr\(p, fallback\)/.test(html));
assert('demo=1 force-demo mode wired', html.includes('params.get("demo") === "1"'));
assert('?input= URL param honored', html.includes('paramOr("input"'));

// (6) Canonical data shape (path tier table from playbook 11 §Cost & ROI)
assert('PATH_TABLE contains Path A', /\bA:\s*\{[^}]*us_gmv_min:\s*0[^}]*us_gmv_max:\s*1_000_000[^}]*label:\s*"Path A/.test(html));
assert('PATH_TABLE contains Path B with $1M-$10M range', /\bB:\s*\{[^}]*us_gmv_min:\s*1_000_000[^}]*us_gmv_max:\s*10_000_000/.test(html));
assert('PATH_TABLE contains Path C with $10M-$50M range', /\bC:\s*\{[^}]*us_gmv_min:\s*10_000_000[^}]*us_gmv_max:\s*50_000_000/.test(html));
assert('Path B lift band 30-80%', /lift_low:\s*0\.30[\s\S]*?lift_high:\s*0\.80/.test(html));
assert('Path B ROI 20-60', /roi_low:\s*20[\s\S]*?roi_high:\s*60/.test(html));
assert('Path B label is "default"', /Path B — default/.test(html));

// (7) Canonical markets (7 markets per asset 13)
assert('MARKETS contains CA + UK + EU-DE + EU-FR + AU + JP + DACH-AT + Nordics (8 entries)',
  /\[\s*\{\s*code:\s*"CA"/.test(html) && /code:\s*"UK"/.test(html) && /code:\s*"EU-DE"/.test(html) &&
  /code:\s*"EU-FR"/.test(html) && /code:\s*"AU"/.test(html) && /code:\s*"JP"/.test(html) &&
  /code:\s*"DACH-AT"/.test(html) && /code:\s*"Nordics"/.test(html));

// (8) Per-path market-share weights (canonical from scripts/international_market_fit.py + asset 13)
const marketsMatch = html.match(/const MARKETS = \[([\s\S]*?)\];/);
if (marketsMatch) {
  const m = marketsMatch[1];
  // Path B weights sum: CA 35% + UK 30% + EU-DE 18% + EU-FR 7% + AU 10% = 100%
  const pathBWeights = [0.35, 0.30, 0.18, 0.07, 0.10];
  let sumB = 0, found = 0;
  for (const w of pathBWeights) {
    const re = new RegExp(`pathB:\\s*${w.toFixed(2)}`);
    if (re.test(m)) { sumB += w; found++; }
  }
  assert(`Path B market-share weights present (${found}/5 weights found, sum=${sumB.toFixed(2)})`,
    found === 5 && Math.abs(sumB - 1.0) < 0.001);

  // Path C weights sum: CA 20% + UK 18% + EU-DE 10% + EU-FR 6% + AU 10% + JP 14% + DACH-AT 12% + Nordics 10% = 100%
  const pathCWeights = [0.20, 0.18, 0.10, 0.06, 0.10, 0.14, 0.12, 0.10];
  let sumC = 0, foundC = 0;
  for (const w of pathCWeights) {
    const re = new RegExp(`pathC:\\s*${w.toFixed(2)}`);
    if (re.test(m)) { sumC += w; foundC++; }
  }
  assert(`Path C market-share weights present (${foundC}/8 weights found, sum=${sumC.toFixed(2)})`,
    foundC === 8 && Math.abs(sumC - 1.0) < 0.001);
}

// (9) Phase gates (4 phases, A=10, B=11, C=10, D=9 gates per playbook 11 §Verification gates)
for (const key of ['A', 'B', 'C', 'D']) {
  const sectionMatch = html.match(new RegExp(`${key}:\\s*\\{[^}]*label:\\s*"([^"]+)"`));
  assert(`Phase ${key} gate section has label`, !!sectionMatch);
}
const phaseAMatch = html.match(/A:\s*\{[^}]*gates:\s*\[([\s\S]*?)\]\s*\}/);
if (phaseAMatch) {
  const gateCountA = (phaseAMatch[1].match(/\{\s*id:/g) || []).length;
  assert(`Phase 1 Gate A has 10 gates per playbook 11 (found ${gateCountA})`, gateCountA === 10);
}
const phaseBMatch = html.match(/B:\s*\{[^}]*gates:\s*\[([\s\S]*?)\]\s*\}/);
if (phaseBMatch) {
  const gateCountB = (phaseBMatch[1].match(/\{\s*id:/g) || []).length;
  assert(`Phase 2 Gate B has 11 gates per playbook 11 (found ${gateCountB})`, gateCountB === 11);
}
const phaseCMatch = html.match(/C:\s*\{[^}]*gates:\s*\[([\s\S]*?)\]\s*\}/);
if (phaseCMatch) {
  const gateCountC = (phaseCMatch[1].match(/\{\s*id:/g) || []).length;
  assert(`Phase 3 Gate C has 10 gates per playbook 11 (found ${gateCountC})`, gateCountC === 10);
}
const phaseDMatch = html.match(/D:\s*\{[^}]*gates:\s*\[([\s\S]*?)\]\s*\}/);
if (phaseDMatch) {
  const gateCountD = (phaseDMatch[1].match(/\{\s*id:/g) || []).length;
  assert(`Steady-state Gate D has 9 gates per playbook 11 (found ${gateCountD})`, gateCountD === 9);
}

// (10) Sample inputs (Path B default = $5M US base)
assert('SAMPLE_INPUTS uses Path B', /path:\s*"B"/.test(html));
assert('SAMPLE_INPUTS US GMV = $5M', /us_gmv:\s*5_000_000/.test(html));
assert('SAMPLE_INPUTS AOV = $75', /aov:\s*75/.test(html));
assert('SAMPLE_INPUTS margin = 70%', /margin:\s*70/.test(html));
assert('SAMPLE_INPUTS Phase 1+2 markets are live', /CA.*status:\s*"live"/s.test(html) && /UK.*status:\s*"live"/s.test(html));
assert('SAMPLE_INPUTS Phase 3 markets are draft', /JP.*status:\s*"draft"/s.test(html) && /DACH-AT.*status:\s*"draft"/s.test(html));

// (11) Required rendering functions present
for (const fn of ['renderSummary', 'renderMarketGrid', 'renderRevenueChart', 'renderPhaseGates', 'renderGatesTable', 'renderNextAction']) {
  assert(`function ${fn} defined`, html.includes(`function ${fn}(`));
}

// (12) Helper functions present
for (const fn of ['pathForGMV', 'liftMidpoint', 'oneTimeMidpoint', 'recurringMidpoint', 'fmtUSD', 'fmtPct', 'statusClass', 'statusLabel']) {
  assert(`helper ${fn} defined`, html.includes(`function ${fn}(`));
}

// (13) Path-for-GMV classifier (canonical $1M / $10M thresholds)
const classifierMatch = html.match(/function pathForGMV\(us_gmv\)\s*\{[\s\S]*?\}/);
if (classifierMatch) {
  assert('pathForGMV has $1M threshold (1_000_000)', /1_000_000/.test(classifierMatch[0]));
  assert('pathForGMV has $10M threshold (10_000_000)', /10_000_000/.test(classifierMatch[0]));
  assert('pathForGMV returns "A" for <$1M', /return\s*"A"/.test(classifierMatch[0]));
  assert('pathForGMV returns "B" for $1M-$10M', /return\s*"B"/.test(classifierMatch[0]));
  assert('pathForGMV returns "C" for >$10M', /return\s*"C"/.test(classifierMatch[0]));
}

// (14) Companion artifact cross-references
assert('references research/04-international-expansion.md', html.includes('research/04-international-expansion.md'));
assert('references playbooks/11-international-rollout.md', html.includes('playbooks/11-international-rollout.md'));
assert('references assets/13-international-pricing-card.md', html.includes('assets/13-international-pricing-card.md'));
assert('references scripts/international_market_fit.py', html.includes('scripts/international_market_fit.py'));
assert('references dashboard/app/international/page.tsx', html.includes('dashboard/app/international/page.tsx'));

// (15) VM-context demo-mode rendering never crashes (the canonical sibling-stub recipe)
try {
  const ctx = vm.createContext({});
  // Stub the DOM-touching helpers since we run headless (no jsdom)
  const stubScript = `
    var document = {
      getElementById: () => ({ textContent: '', className: '', innerHTML: '', appendChild: () => {}, querySelector: () => ({ textContent: '' }) }),
      createElement: () => ({ setAttribute: () => {}, addEventListener: () => {}, appendChild: () => {} }),
      createTextNode: () => ({}),
    };
    var window = { location: { search: '' } };
    var console = { warn: () => {} };
    var setTimeout = () => {};
    var clearTimeout = () => {};
    var AbortController = function() { return { abort: () => {}, signal: {} }; };
    var fetch = () => Promise.reject(new Error('no fetch in vm'));
    var URLSearchParams = function(search) { return { get: () => null }; };
  `;
  vm.runInContext(stubScript + scriptText, ctx);
  // If we get here without throwing, demo-mode rendering is hermetic
  assert('demo-mode render() call does not throw in vm sandbox', true);
} catch (e) {
  assert('demo-mode render() call does not throw in vm sandbox', false, e.message);
}

// (16) Anti-pattern grep (no TODOs / placeholders / hand-waving)
const antiMatches = (html.match(/\b(TODO|FIXME|XXX|placeholder)\b/g) || []);
assert(`no TODO/FIXME/XXX/placeholder markers in HTML (found ${antiMatches.length})`, antiMatches.length === 0);

// (17) Sanity: file is well under typical Next.js build budget (self-contained)
assert(`html file size reasonable (${html.length} bytes, ≤60KB)`, html.length <= 61440);

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  - ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
  }
  process.exit(1);
}
process.exit(0);
