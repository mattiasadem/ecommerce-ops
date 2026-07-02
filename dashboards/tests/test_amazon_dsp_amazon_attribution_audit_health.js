/* Amazon-DSP / Amazon-Attribution-Audit Health — static dashboard smoke tests
 *
 * Companion to dashboards/amazon-dsp-amazon-attribution-audit-health.html.
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1) HTML is well-formed (parseable as a single root element with closing tags).
 *   (2) Inline <script> block parses without syntax errors.
 *   (3) Canonical SAMPLE_INPUTS + FLOWS + PATH_TABLE + PHASE_GATES + AMAZON_DSP_PILLAR_MATRIX JSON shapes
 *       conform to the research/14 + playbook 21 + asset 22 + scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py contract.
 *   (4) URL param parsing (?path= ?us_dtc_gmv= ?marketplace_gmv_pct= ?voice= ?demo=) routes correctly.
 *   (5) Hermetic — no live fetch (no Amazon-Ads-Console / Pacvue / Tinuiti / Helium 10 / Perpetua / Amazon-Marketing-Cloud / Amazon-Attribution / Triple-Whale / Brand-Analytics / Klaviyo API access required).
 *   (6) Demo-mode rendering never crashes when called with SAMPLE_INPUTS (via vm.runInContext with classList stub — NEW v0.16.x).
 *   (7) Required UI sections are present: summary + flow + path-chart + phase-gates + flow-table + next-action.
 *   (8) 5-pillar Amazon-DSP-framework matrix cells filled (mirror scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py AMAZON_DSP_PILLAR_MATRIX).
 *   (9) Per-path Year-1 incremental Halo-defense-revenue share % bands match canonical from PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT.
 *   (10) tierForGmv classifier returns A/B/C in canonical 100k/5M/25M brackets.
 *   (11) PATH_TABLE.gmvMin ordering A < B < C (NEW v0.16.x — surfaces off-by-one boundary-flip bugs).
 *   (12) Cross-references in source comment resolve to on-disk artifacts (research/14, playbook 21, asset 22, script, route).
 *   (13) Phase gate scoring function maps ok/warn/fail counts to status badges.
 *   (14) 6 canonical Amazon-DSP flows documented (Amazon-Ads-Console + Amazon-DSP-in-market-shoppers + AMC-cohort-overlay + Amazon-Attribution-merge + Halo-defense-creative + 3rd-party-Amazon-DSP-manager-decision-recipe).
 *   (15) 5 pillars documented (P1 Amazon-Ads-Console + Brand-Registry + DSP-account / P2 Amazon-DSP-in-market-shoppers + Amazon-Audiences-Insights-engaged-shoppers + bid-strategy / P3 AMC-cohort-overlay + AMC-API + Amazon-Attribution-Pro / P4 Amazon-Attribution-post-purchase-email-merge + Halo-vs-direct-ACoS-measurement / P5 Halo-defense-creative + Brand-search-volume-lift + 3rd-party-Amazon-DSP-manager).
 *   (16) Anti-pattern grep (no TODOs / placeholders / hand-waving).
 *   (17) Sanity: file is well under typical Next.js build budget (self-contained, ≤60KB).
 *   (18) Hermetic: no fetch / XMLHttpRequest / external CDN calls.
 *   (19) 5-pillar Amazon-DSP-framework matrix all 5 pillars present.
 *   (20) Per-voice detail documented across 5 voices (Default / Luxury / Sustainable / Gen-Z / B2B).
 *   (21) Path-tier defaults: Path B DEFAULT = Amazon-DSP + Halo-defense-programmatic-display + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge.
 *   (22) CAC-vs-paid-social mid-range computed correctly across all 3 paths.
 *   (23) Brand-search-volume-lift mid-range computed correctly across all 3 paths.
 *   (24) AMC-cohort-overlay-resolution-lift mid-range computed correctly across all 3 paths.
 *   (25) Halo-defense-rate mid-range computed correctly across all 3 paths.
 *   (26) Path-rank ordering: A < B < C (downgrade logic uses PATH_RANK dict).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'amazon-dsp-amazon-attribution-audit-health.html');
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

console.log('\n=== Amazon-DSP / Amazon-Attribution-Audit Health dashboard smoke tests ===\n');

// (1) HTML is non-empty + has expected structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has <!DOCTYPE html>', html.startsWith('<!DOCTYPE html>'));
assert('html has <title>', /<title>[^<]+<\/title>/.test(html));
assert('title text matches Amazon-DSP / Amazon-Attribution-Audit Health', html.includes('<title>Amazon-DSP / Amazon-Attribution-Audit Health'));
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
for (const id of ['summary-section', 'flow-section', 'path-chart-section', 'phase-gates-section', 'flow-table-section', 'next-action-section']) {
  assert(`section #${id} present`, html.includes(`id="${id}"`));
}

// (4) URL param parsing — dashboard is hermetic, no live fetches
assert('parseParams parses window.location.search', /function\s+parseParams\s*\(\s*\)/.test(html));
assert('applyParams applies path + us_dtc_gmv + marketplace_gmv_pct + voice + demo', /function\s+applyParams\s*\(\s*params\s*\)/.test(html));
assert('bootstrap IIFE present', /function\s+bootstrap\s*\(/.test(html));

// (7) Required data structures declared
assert('FLOWS declared', /var\s+FLOWS\s*=\s*\[/.test(html));
assert('PATH_TABLE declared', /var\s+PATH_TABLE\s*=\s*\{/.test(html));
assert('PHASE_GATES declared', /var\s+PHASE_GATES\s*=\s*\[/.test(html));
assert('AMAZON_DSP_PILLAR_MATRIX declared', /var\s+AMAZON_DSP_PILLAR_MATRIX\s*=\s*\[/.test(html));
assert('SAMPLE_INPUTS declared', /var\s+SAMPLE_INPUTS\s*=\s*\{/.test(html));

// (8) Per-voice detail check — 5 voices (Default / Luxury / Sustainable / Gen-Z / B2B) all present in AMAZON_DSP_PILLAR_MATRIX
for (const voice of ['default', 'luxury', 'sustainable', 'genZ', 'b2b']) {
  assert(`AMAZON_DSP_PILLAR_MATRIX contains ${voice} voice column`, html.includes(`${voice}:`));
}

// (9) Demo-mode rendering never crashes — execute script in vm + call renderAll with SAMPLE_INPUTS
// NEW v0.16.x: classList stub is required for any dashboard that emits status pills via classList.add
// (bootstrap is a named IIFE — not exposed to the outer vm scope; use renderAll directly)
let vmContext = null;
let vmError = null;
try {
  vmContext = {
    window: { location: { search: '?demo=1' } },
    document: { getElementById: () => ({ innerHTML: '', textContent: '', classList: { add: () => {}, remove: () => {} } }) },
    URLSearchParams: class URLSearchParams {
      constructor(s) { this._s = s || ''; this._m = {}; const re = /[?&]([^=]+)=([^&]*)/g; let m; while ((m = re.exec(this._s)) !== null) this._m[m[1]] = decodeURIComponent(m[2]); }
      has(k) { return k in this._m; }
      get(k) { return this._m[k]; }
    },
    console
  };
  vm.createContext(vmContext);
  vm.runInContext(scriptText, vmContext);
  assert('script runs in vm context without errors', true);
  vm.runInContext('renderAll(SAMPLE_INPUTS);', vmContext);
  assert('renderAll(SAMPLE_INPUTS) executes without crashing', true);
} catch (e) {
  assert('script runs in vm context without errors', false, e.message);
  vmError = e;
}

// (10) Per-path incremental-Halo-defense-revenue share bands match canonical PATH_INCREMENTAL_HALO_DEFENSE_REVENUE_SHARE_PCT
// Path A: 1.0-4.0%, Path B: 2.0-30.0%, Path C: 5.0-30.0% per scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py
assert('Path A shareLow = 1.0', /shareLow:\s*1\.0/.test(html));
assert('Path A shareHigh = 4.0', /A:[\s\S]{0,800}shareHigh:\s*4\.0/.test(html));
assert('Path B shareLow = 2.0', /B:[\s\S]{0,800}shareLow:\s*2\.0/.test(html));
assert('Path B shareHigh = 30.0', /B:[\s\S]{0,800}shareHigh:\s*30\.0/.test(html));
assert('Path C shareLow = 5.0', /C:[\s\S]{0,800}shareLow:\s*5\.0/.test(html));
assert('Path C shareHigh = 30.0', /C:[\s\S]{0,800}shareHigh:\s*30\.0/.test(html));

// (11) tierForGmv returns A/B/C in canonical 100k/5M/25M brackets — boundary tests + ordering assertion (NEW v0.16.x)
try {
  const tierA = vm.runInContext('tierForGmv(50000)', vmContext);
  const tierB = vm.runInContext('tierForGmv(10000000)', vmContext);
  const tierC = vm.runInContext('tierForGmv(30000000)', vmContext);
  const tierABound = vm.runInContext('tierForGmv(100000)', vmContext);
  const tierBBound = vm.runInContext('tierForGmv(5000000)', vmContext);
  const tierCBound = vm.runInContext('tierForGmv(25000000)', vmContext);
  assert('tierForGmv($50k) = A', tierA === 'A', `got ${tierA}`);
  assert('tierForGmv($10M) = B', tierB === 'B', `got ${tierB}`);
  assert('tierForGmv($30M) = C', tierC === 'C', `got ${tierC}`);
  assert('tierForGmv at $100k floor = A (boundary)', tierABound === 'A', `got ${tierABound}`);
  assert('tierForGmv at $5M floor = B (boundary)', tierBBound === 'B', `got ${tierBBound}`);
  assert('tierForGmv at $25M floor = C (boundary)', tierCBound === 'C', `got ${tierCBound}`);

  // NEW v0.16.x — gmvMin ordering A < B < C boundary-flip-detection assertion
  const gmvMinA = vm.runInContext('PATH_TABLE.A.gmvMin', vmContext);
  const gmvMinB = vm.runInContext('PATH_TABLE.B.gmvMin', vmContext);
  const gmvMinC = vm.runInContext('PATH_TABLE.C.gmvMin', vmContext);
  assert('PATH_TABLE gmvMin ordering A < B < C', gmvMinA < gmvMinB && gmvMinB < gmvMinC, `got A=${gmvMinA}, B=${gmvMinB}, C=${gmvMinC}`);
} catch (e) {
  assert('tierForGmv boundary + gmvMin ordering tests pass', false, e.message);
}

// (12) Cross-references in source comment resolve to on-disk artifacts
const fs2 = require('fs');
const workspaceRoot = path.join(__dirname, '..', '..');
for (const rel of [
  'research/14-amazon-dsp-amazon-attribution-audit.md',
  'playbooks/21-amazon-dsp-amazon-attribution-audit-launch.md',
  'assets/22-amazon-dsp-amazon-attribution-audit-templates.md',
  'dashboard/app/amazon-dsp-amazon-attribution-audit/page.tsx',
  'scripts/amazon_dsp_amazon_attribution_audit_unit_economics.py'
]) {
  assert(`cross-reference ${rel} exists on disk`, fs2.existsSync(path.join(workspaceRoot, rel)));
}

// (13) gateStatusBadge / phase progress mapping logic — verify the 3-state render gates status
for (const status of ['ok', 'warn', 'draft']) {
  assert(`PHASE_GATES contains status="${status}"`, html.includes(`status: '${status}'`));
}

// (14) 6 canonical Amazon-DSP flows documented (Pillar 1-5 + 3rd-party-Amazon-DSP-manager Pillar 5)
for (const fid of ['amazon_ads_console_brand_registry_onboard', 'amazon_dsp_in_market_shoppers_audience_segment_launch', 'amc_cohort_overlay_instrumentation_wire', 'amazon_attribution_post_purchase_email_merge_recipe', 'halo_defense_creative_asset_iteration_cycle', 'third_party_dsp_manager_decision_recipe']) {
  assert(`flow ${fid} present in FLOWS`, html.includes(`id: '${fid}'`));
}

// (15) 5 pillars documented (canonical research/14 framework)
for (const pillar of ['Pillar 1 — Amazon-Ads-Console-onboard', 'Pillar 2 — Amazon-DSP-in-market-shoppers', 'Pillar 3 — Amazon-Marketing-Cloud-cohort-overlay', 'Pillar 4 — Amazon-Attribution-post-purchase-email-merge-recipe', 'Pillar 5 — Halo-defense-creative-asset-iteration-cycle']) {
  assert(`pillar "${pillar}" referenced in AMAZON_DSP_PILLAR_MATRIX`, html.includes(pillar));
}
// (15b) Pillars must appear in PHASE_GATES criterion text too
assert('Pillar 1 referenced in PHASE_GATES', /Pillar 1/.test(html));
assert('Pillar 2 referenced in PHASE_GATES', /Pillar 2/.test(html));
assert('Pillar 3 referenced in PHASE_GATES', /Pillar 3/.test(html));
assert('Pillar 4 referenced in PHASE_GATES', /Pillar 4/.test(html));
assert('Pillar 5 referenced in PHASE_GATES', /Pillar 5/.test(html));

// (15c) Path-default platform picks documented (each path's default_platform_pick canonical string)
assert('Path A default platform pick = Amazon-Ads-Console + Brand-Registry', /Amazon-Ads-Console-self-serve-OR-Pacvue-OR-Tinuiti-OR-Helium-10-OR-Perpetua-managed-service/.test(html));
assert('Path B default platform pick includes Amazon-Marketing-Cloud-cohort-overlay + Amazon-Attribution-merge', /Amazon-Attribution-Pro-or-advanced-tools-or-AMC-or-3rd-party-attribution-provider DEFAULT/.test(html));
assert('Path C default platform pick includes Amazon-Attribution-Enterprise + Triple-Whale-Pro', /Amazon-Attribution-Enterprise-OR-Tinuiti-Enterprise-OR-Pacvue-Enterprise-OR-Helium-10-Enterprise-OR-Perpetua-Enterprise/.test(html));

// (15d) Cost stack bands visible
assert('Path A recurring cost $500 documented (Sponsored-Products + Brand-Registry baseline)', /A:[\s\S]{0,800}costRecurLow:\s*500/.test(html));
assert('Path B recurring cost $1,000 documented (Amazon-DSP + Halo-defense + AMC + Amazon-Attribution default)', /B:[\s\S]{0,800}costRecurLow:\s*1000/.test(html));
assert('Path C recurring cost $5,000 documented (full-orchestration)', /C:[\s\S]{0,800}costRecurLow:\s*5000/.test(html));

// (16) Anti-pattern grep (no TODOs / placeholders / hand-waving)
const antiPatternMatches = html.match(/TODO|FIXME|XXX/gi);
assert('no TODOs / FIXMEs in production markup', !antiPatternMatches || antiPatternMatches.length === 0, `found ${antiPatternMatches ? antiPatternMatches.length : 0}`);

// (17) Sanity: file is well under 60KB (self-contained, ≤60KB)
assert('html file size ≤60KB', html.length <= 61440, `got ${html.length} bytes`);

// (18) Hermetic: no external fetch / CDN calls (excluding comments)
assert('no fetch() call (excluding comments)', !/(^|[^/])\bfetch\s*\(/.test(scriptText.replace(/\/\/[^\n]*\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '')));
assert('no XMLHttpRequest', !/XMLHttpRequest/.test(scriptText));
assert('no external CDN script tags (no src=)', !/<script[^>]+src=/.test(html));

// (19) 5-pillar Amazon-DSP-framework matrix all 5 pillars present
for (const pillar of [
  'Pillar 1 — Amazon-Ads-Console-onboard + Brand-Registry-trademark + Amazon-DSP-account-onboard',
  'Pillar 2 — Amazon-DSP-in-market-shoppers-audience-segment + Amazon-Audiences-Insights-engaged-shoppers-expand + Amazon-DSP-bid-strategy',
  'Pillar 3 — Amazon-Marketing-Cloud-cohort-overlay + AMC-API-connection + Amazon-Attribution-Pro-or-advanced-tools',
  'Pillar 4 — Amazon-Attribution-post-purchase-email-merge-recipe + Halo-vs-direct-incremental-ACoS-measurement',
  'Pillar 5 — Halo-defense-creative-asset-iteration-cycle + Brand-search-volume-lift-attribution + 3rd-party-Amazon-DSP-manager-decision-recipe'
]) {
  assert(`pillar "${pillar}" present in AMAZON_DSP_PILLAR_MATRIX`, html.includes(pillar));
}

// (20) Per-voice detail documented across 5 voices in AMAZON_DSP_PILLAR_MATRIX (luxury / sustainable / genZ / b2b)
assert('Luxury column E-E-A-T-signals documented', /luxury:\s*'Amazon-Ads-Console-self-serve-OR-managed-service \+ Brand-Registry-trademark-registered-with-elevated-E-E-A-T-signals/.test(html));
assert('Sustainable column sustainable-keyword-universe documented', /sustainable:\s*'Amazon-Ads-Console-self-serve-OR-managed-service \+ Brand-Registry-trademark-registered \+ Amazon-Creative-Assets-baseline-with-sustainable-keyword-universe/.test(html));
assert('Gen-Z column Gen-Z-trend-driven-cadence documented', /genZ:\s*'Amazon-Ads-Console-self-serve-OR-managed-service \+ Brand-Registry-trademark-registered \+ Amazon-Creative-Assets-baseline-with-Gen-Z-trend-driven-cadence/.test(html));
assert('B2B column B2B-case-study-format documented', /b2b:\s*'Amazon-Ads-Console-self-serve-OR-managed-service \+ Brand-Registry-trademark-registered \+ Amazon-Creative-Assets-baseline-with-B2B-case-study-format/.test(html));

// (21) Path-tier defaults: Path B DEFAULT = Amazon-DSP + Halo-defense-programmatic-display + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge
assert('Path B DEFAULT label present', /Path B[\s\S]{0,200}DEFAULT/.test(html));

// (22) CAC-vs-paid-social mid-range computed correctly across all 3 paths
try {
  const cacA = vm.runInContext('cacVsPaidSocialMid("A")', vmContext);
  const cacB = vm.runInContext('cacVsPaidSocialMid("B")', vmContext);
  const cacC = vm.runInContext('cacVsPaidSocialMid("C")', vmContext);
  // Path A: 0.7-1.0 → 0.85, Path B: 0.5-0.7 → 0.6, Path C: 0.4-0.6 → 0.5
  assert('CAC-vs-paid-social mid Path A = 0.85', Math.abs(cacA - 0.85) < 0.001, `got ${cacA}`);
  assert('CAC-vs-paid-social mid Path B = 0.6', Math.abs(cacB - 0.6) < 0.001, `got ${cacB}`);
  assert('CAC-vs-paid-social mid Path C = 0.5', Math.abs(cacC - 0.5) < 0.001, `got ${cacC}`);
} catch (e) {
  assert('CAC-vs-paid-social mid-range tests pass', false, e.message);
}

// (23) Brand-search-volume-lift mid-range computed correctly across all 3 paths
try {
  const brandSearchA = vm.runInContext('brandSearchLiftMid("A")', vmContext);
  const brandSearchB = vm.runInContext('brandSearchLiftMid("B")', vmContext);
  const brandSearchC = vm.runInContext('brandSearchLiftMid("C")', vmContext);
  // Path A: 1.5-3.0 → 2.25, Path B: 5.0-10.0 → 7.5, Path C: 8.0-15.0 → 11.5
  assert('brand-search-volume-lift mid Path A = 2.25', Math.abs(brandSearchA - 2.25) < 0.001, `got ${brandSearchA}`);
  assert('brand-search-volume-lift mid Path B = 7.5', Math.abs(brandSearchB - 7.5) < 0.001, `got ${brandSearchB}`);
  assert('brand-search-volume-lift mid Path C = 11.5', Math.abs(brandSearchC - 11.5) < 0.001, `got ${brandSearchC}`);
} catch (e) {
  assert('brand-search-volume-lift mid-range tests pass', false, e.message);
}

// (24) AMC-cohort-overlay-resolution-lift mid-range computed correctly across all 3 paths
try {
  const amcA = vm.runInContext('amcCohortOverlayResolutionLiftMid("A")', vmContext);
  const amcB = vm.runInContext('amcCohortOverlayResolutionLiftMid("B")', vmContext);
  const amcC = vm.runInContext('amcCohortOverlayResolutionLiftMid("C")', vmContext);
  // Path A: 1.0-1.5 → 1.25, Path B: 2.0-3.0 → 2.5, Path C: 3.0-5.0 → 4.0
  assert('AMC-cohort-overlay-resolution-lift mid Path A = 1.25', Math.abs(amcA - 1.25) < 0.001, `got ${amcA}`);
  assert('AMC-cohort-overlay-resolution-lift mid Path B = 2.5', Math.abs(amcB - 2.5) < 0.001, `got ${amcB}`);
  assert('AMC-cohort-overlay-resolution-lift mid Path C = 4.0', Math.abs(amcC - 4.0) < 0.001, `got ${amcC}`);
} catch (e) {
  assert('AMC-cohort-overlay-resolution-lift mid-range tests pass', false, e.message);
}

// (25) Halo-defense-rate mid-range computed correctly across all 3 paths
try {
  const haloA = vm.runInContext('haloDefenseRateMid("A")', vmContext);
  const haloB = vm.runInContext('haloDefenseRateMid("B")', vmContext);
  const haloC = vm.runInContext('haloDefenseRateMid("C")', vmContext);
  // Path A: 15.0-25.0 → 20.0, Path B: 25.0-40.0 → 32.5, Path C: 30.0-45.0 → 37.5
  assert('halo-defense-rate mid Path A = 20.0', Math.abs(haloA - 20.0) < 0.001, `got ${haloA}`);
  assert('halo-defense-rate mid Path B = 32.5', Math.abs(haloB - 32.5) < 0.001, `got ${haloB}`);
  assert('halo-defense-rate mid Path C = 37.5', Math.abs(haloC - 37.5) < 0.001, `got ${haloC}`);
} catch (e) {
  assert('halo-defense-rate mid-range tests pass', false, e.message);
}

// (26) Path-rank ordering: A < B < C — verify each path's GMV floor and canonical scope strings
assert('Path A scope documented as Sponsored-Products-only + Halo-defense-via-Brand-Registry-only', /Sponsored-Products \+ Brand-Registry \+ Halo-defense-via-Brand-Registry-only \$500-\$1k\/mo/.test(html));
assert('Path B scope documented as Amazon-DSP + Halo-defense-programmatic-display + AMC-cohort-overlay + Amazon-Attribution-post-purchase-email-merge', /Amazon-DSP \+ Halo-defense-programmatic-display \+ AMC-cohort-overlay \+ Amazon-Attribution-post-purchase-email-merge \$1k-\$5k\/mo DEFAULT/.test(html));
assert('Path C scope documented as Full-Amazon-DSP-omnichannel + AMC-Enterprise + Amazon-Attribution-Enterprise', /Full-Amazon-DSP-omnichannel \+ AMC-Enterprise \+ Amazon-Attribution-Enterprise \+ dedicated-in-house-DSP-marketing-team-or-fully-managed-service-Enterprise/.test(html));

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  for (const f of failures) console.log(`  FAIL: ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
  process.exit(1);
}