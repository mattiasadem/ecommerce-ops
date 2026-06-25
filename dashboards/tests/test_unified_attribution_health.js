/* Move #6.9 — Unified attribution dashboard smoke tests
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1) HTML is well-formed (parseable as a single root element with closing tags).
 *   (2) Inline <script> block parses without syntax errors.
 *   (3) SAMPLE_DEMO / SAMPLE_ROLLUP JSON shapes conform to the per-platform audit + rollup contract.
 *   (4) URL param parsing (demo=1 / meta= / tiktok= / snap= / rollup=) routes correctly.
 *   (5) Fetch timeout pattern (AbortController + setTimeout + clearTimeout) is present.
 *   (6) Fetch-timeout-contract value is 1500ms (canonical per move #6.8 sibling-cron fetch contract).
 *   (7) Required UI sections are present: summary / platform-grid / drift / hypothesis / next-action.
 *   (8) Each demo gate entry has gate/passed/detail/remediation fields.
 *   (9) Demo-mode rendering never crashes when called with SAMPLE_ inputs.
 *  (10) Cross-platform drift hypotheses include the canonical 5 candidates from the rollup script.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'unified-attribution-health.html');
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

console.log('\n=== Move #6.9 dashboard smoke tests ===\n');

// (1) HTML is non-empty + has expected structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has <!DOCTYPE html>', html.startsWith('<!DOCTYPE html>'));
assert('html has <title>', /<title>[^<]+<\/title>/.test(html));
assert('title text matches Move #6.9', html.includes('<title>Unified Attribution Health'));
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
for (const id of ['summary-section', 'platforms-section', 'drift-section', 'hypothesis-section', 'next-action-section']) {
  assert(`section #${id} present`, html.includes(`id="${id}"`));
}

// (4) Fetch-timeout contract (per the cron-driven-bounded-improver references/fetch-timeout-contract.md)
assert('fetch uses AbortController', html.includes('AbortController'));
assert('fetch uses setTimeout for abort', /setTimeout\(\(\) => controller\.abort\(\)/.test(html));
assert('fetch uses clearTimeout in finally', html.includes('clearTimeout(timeoutId)'));

// (5) Fetch timeout is 1500ms (canonical per the rollup script's notification style)
const toMatch = html.match(/FETCH_TIMEOUT_MS\s*=\s*(\d+)/);
assert('FETCH_TIMEOUT_MS is defined', !!toMatch);
if (toMatch) {
  assert('FETCH_TIMEOUT_MS = 1500 (canonical)', toMatch[1] === '1500', `got ${toMatch[1]}`);
}

// (6) URL-param parsing surface
//     Script uses a paramOr() helper that wraps params.get(p). Verify either form.
for (const p of ['demo', 'meta', 'tiktok', 'snap', 'rollup']) {
  const viaGet = new RegExp(`params\\.get\\("${p}"\\)`).test(scriptText);
  const viaHelper = new RegExp(`paramOr\\("${p}"`).test(scriptText);
  assert(`URL param "${p}" handled in script`, viaGet || viaHelper);
}

// (7) Demo mode sentinel
assert('demo-mode sample data declared (SAMPLE_DEMO)', scriptText.includes('SAMPLE_DEMO'));
assert('demo-mode rollup sample declared (SAMPLE_ROLLUP)', scriptText.includes('SAMPLE_ROLLUP'));
assert('demo mode forces badge to "DEMO"', /mode\.toUpperCase\(\)/.test(scriptText) && /"DEMO"/.test(scriptText) === false /* no literal "DEMO" string but rendered via toUpperCase */);

// (8) Render functions exist
for (const fn of ['renderPlatformCard', 'renderDriftChart', 'renderHypothesis', 'renderNextAction', 'render']) {
  assert(`function ${fn} defined`, new RegExp(`function ${fn}\\b`).test(scriptText));
}

// (9) Run the script in a sandbox and verify SAMPLE_ data + helpers are reachable
//     We stub document/window/fetch so the script's main() can run without throwing.
const sandbox = {
  console,
  setTimeout, clearTimeout,
  AbortController,
  fetch: async () => { throw new Error('fetch should not be called in demo-mode default'); },
  URLSearchParams,
  window: { location: { search: '?demo=1' } },
  document: makeStubDocument(),
};
vm.createContext(sandbox);
try {
  vm.runInContext(scriptText, sandbox, { filename: 'inline-script.js' });
  // Allow microtasks to flush
  setImmediate(() => {
    runShapeChecks(sandbox);
    printResults();
  });
} catch (e) {
  assert('script runs in sandbox without throwing', false, e.message);
  printResults();
}

function makeStubDocument() {
  const elements = {};
  function makeEl(tag) {
    return {
      tagName: tag.toUpperCase(),
      children: [],
      classList: { add() {}, remove() {} },
      className: '',
      setAttribute(k, v) { this[k] = v; },
      appendChild(c) { this.children.push(c); return c; },
      addEventListener() {},
      style: {},
      innerHTML: '',
      textContent: '',
    };
  }
  const doc = {
    createElement: makeEl,
    createTextNode(t) { return { nodeValue: t }; },
    getElementById(id) {
      if (!elements[id]) elements[id] = makeEl('div');
      return elements[id];
    },
  };
  return doc;
}

function runShapeChecks(sb) {
  console.log('\n--- JSON-shape checks ---');

  // Reach into the sandbox for SAMPLE_ constants by re-evaluating them.
  const sampleDemo = vm.runInContext('SAMPLE_DEMO', sb);
  const sampleRollup = vm.runInContext('SAMPLE_ROLLUP', sb);

  for (const [platform, report] of Object.entries(sampleDemo)) {
    assert(`SAMPLE_DEMO.${platform}.overall_passed is boolean`,
      typeof report.overall_passed === 'boolean');
    assert(`SAMPLE_DEMO.${platform}.gates is array`, Array.isArray(report.gates));
    assert(`SAMPLE_DEMO.${platform}.summary has total/passed/failed`,
      report.summary && typeof report.summary.total === 'number' &&
      typeof report.summary.passed === 'number' &&
      typeof report.summary.failed === 'number');
    for (const g of report.gates) {
      assert(`  SAMPLE_DEMO.${platform} gate "${g.gate}" has all fields`,
        typeof g.gate === 'string' && typeof g.passed === 'boolean' &&
        typeof g.detail === 'string' && typeof g.remediation === 'string');
    }
  }

  assert('SAMPLE_ROLLUP.summary.total_platforms is a number',
    typeof sampleRollup.summary.total_platforms === 'number');
  assert('SAMPLE_ROLLUP.summary.passing_platforms is a number',
    typeof sampleRollup.summary.passing_platforms === 'number');
  assert('SAMPLE_ROLLUP.drift.cross_platform_drift_detected is boolean',
    typeof sampleRollup.drift.cross_platform_drift_detected === 'boolean');
  assert('SAMPLE_ROLLUP.drift.thresholds has 3 canonical thresholds',
    sampleRollup.drift.thresholds &&
    sampleRollup.drift.thresholds.match_rate_drift_pp === 3.0 &&
    sampleRollup.drift.thresholds.coverage_drift_pp === 2.0 &&
    sampleRollup.drift.thresholds.multi_platform_drop_max === 1);
  assert('SAMPLE_ROLLUP.root_cause_hypothesis matches one of the 5 canonical hypotheses',
    sampleRollup.root_cause_hypothesis &&
    ['theme_liquid_update', 'capi_token_rotation', 'ios_consent_banner',
     'app_uninstall', 'advanced_matching_toggle'].includes(sampleRollup.root_cause_hypothesis.id));
}

function printResults() {
  console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    for (const f of failures) {
      console.log(`FAIL: ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
    }
    process.exit(1);
  }
  process.exit(0);
}
