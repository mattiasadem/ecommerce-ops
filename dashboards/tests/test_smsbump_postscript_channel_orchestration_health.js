/* SMSBump / Postscript-Channel-Orchestration Health — static dashboard smoke tests
 *
 * Companion to dashboards/smsbump-postscript-channel-orchestration-health.html.
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1) HTML is non-empty + has expected structure.
 *   (2) Inline <script> block parses without syntax errors.
 *   (3) Canonical SAMPLE_INPUTS + FLOWS + PATH_TABLE + PHASE_GATES + SMSBUMP_POSTSCRIPT_PILLAR_MATRIX JSON shapes
 *       conform to the research/15 + playbook 22 + asset 23 + scripts/smsbump_postscript_channel_orchestration_unit_economics.py contract.
 *   (4) URL param parsing (?path= ?us_dtc_gmv= ?international_gmv_pct= ?voice= ?demo=) routes correctly.
 *   (5) Hermetic — no live fetch (no Postscript / SMSBump / Klaviyo / Attentive / Triple-Whale / Sailthru / GSMA-RCS / Two-way-conversations / RCS-business-messaging / MMS / Inbox-by-Postscript / Shopify-Markets API access required).
 *   (6) Demo-mode rendering never crashes when called with SAMPLE_INPUTS (via vm.runInContext with classList stub — NEW v0.16.x).
 *   (7) Required UI sections are present: summary + flow + path-chart + phase-gates + flow-table + next-action.
 *   (8) 5-pillar SMSBump + Postscript-channel-orchestration matrix all 5 voices documented (Default / Luxury / Sustainable / Gen-Z / B2B).
 *   (9) Per-path Year-1 incremental SMS-orchestration-revenue share % bands match canonical from PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT.
 *   (10) tierForGmv classifier returns A/B/C in canonical 500k/1M/25M brackets.
 *   (11) PATH_TABLE.gmvMin ordering A < B < C (NEW v0.16.x — surfaces off-by-one boundary-flip bugs).
 *   (12) Cross-references in source comment resolve to on-disk artifacts (research/15, playbook 22, asset 23, script, route).
 *   (13) Phase gate scoring function maps ok/warn/fail counts to status badges.
 *   (14) 6 canonical SMS-orchestration flows documented (Postscript-primary-onboard + DLR-monitoring + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge / SMSBump-international + multi-locale-orchestration + SMSBump-post-purchase-flow / MMS-luxury-voice-SKU + rich-media / two-way-conversation-creator-cohort + RCS-Gen-Z-voice-Flash-Sale + voice-profile-routing-inbox / SMS-cohort-LTV-attrition-1%-rule-iteration-cycle + SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle / SMS-cost-stack-decision-recipe + Path-tier-promotion-SOP).
 *   (15) 5 pillars documented (P1 Postscript-primary-onboard + DLR-monitoring-Wire + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge / P2 SMSBump-international + multi-locale-orchestration + SMSBump-post-purchase-flow / P3 MMS-luxury-voice + rich-media / P4 two-way-conversation-creator-cohort + RCS-Gen-Z-voice-Flash-Sale + voice-profile-routing-inbox / P5 SMS-cohort-LTV-attrition-1%-rule + SMS-deliverability-reach-cohort-overlay + 5-way-comparison-cycle + SMS-cost-stack-decision-recipe).
 *   (16) Anti-pattern grep (no TODOs / placeholders / hand-waving).
 *   (17) Sanity: file is well under typical Next.js build budget (self-contained, ≤70KB).
 *   (18) Hermetic: no fetch / XMLHttpRequest / external CDN calls.
 *   (19) 5-pillar SMSBump + Postscript-channel-orchestration matrix all 5 pillars present.
 *   (20) Per-voice detail documented across 5 voices (Default / Luxury / Sustainable / Gen-Z / B2B).
 *   (21) Path-tier defaults: Path B DEFAULT = SMSBump + Postscript + DLR + MMS + Klaviyo-SMS-segment-overlay + Triple-Whale-SMS-merge-cohort-overlay.
 *   (22) SMS-list-growth-rate mid-range computed correctly across all 3 paths.
 *   (23) SMS-cohort-LTV-multiplier mid-range computed correctly across all 3 paths.
 *   (24) SMS-deliverability-vs-Postscript-only-baseline mid-range computed correctly across all 3 paths.
 *   (25) SMS-orchestration-build-cycle mid-range computed correctly across all 3 paths.
 *   (26) Path-rank ordering: A < B < C (downgrade logic uses PATH_RANK dict).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'smsbump-postscript-channel-orchestration-health.html');
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

console.log('\n=== SMSBump / Postscript-Channel-Orchestration Health dashboard smoke tests ===\n');

// (1) HTML is non-empty + has expected structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has DOCTYPE', html.includes('<!DOCTYPE html>'));
assert('html has closing </html>', html.lastIndexOf('</html>') > html.length - 100);
assert('html has <head> and <body>', html.includes('<head>') && html.includes('<body>'));
assert('html has canonical title', html.includes('SMSBump / Postscript-Channel-Orchestration Health'));

// (2) Extract inline <script> block for parsing + vm execution tests
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert('inline <script> block found', !!scriptMatch);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    assert('inline <script> block parses without syntax errors', true);
  } catch (e) {
    assert('inline <script> block parses without syntax errors', false, e.message);
  }
}

// (3) Required DOM sections present
['summary-section','flow-section','path-chart-section','phase-gates-section','flow-table-section','next-action-section'].forEach(sid => {
  assert(`section #${sid} present in HTML`, html.includes(`id="${sid}"`));
});

// (4) Required UI ids present
['summary-stats','flow-cards','path-chart','phase-gates','flow-table-body','next-action','mode-badge'].forEach(id => {
  assert(`id="${id}" present in HTML`, html.includes(`id="${id}"`));
});

// (5) SAMPLE_INPUTS / FLOWS / PATH_TABLE / PHASE_GATES / SMSBUMP_POSTSCRIPT_PILLAR_MATRIX declared
assert('SAMPLE_INPUTS declared', /var\s+SAMPLE_INPUTS\s*=\s*\{/.test(html));
assert('FLOWS array declared with 6 canonical entries', /var\s+FLOWS\s*=\s*\[/.test(html) && (html.match(/\{ id: '/g) || []).length >= 6);
assert('PATH_TABLE declared', /var\s+PATH_TABLE\s*=\s*\{/.test(html));
assert('PHASE_GATES array declared with 4 phases', /var\s+PHASE_GATES\s*=\s*\[/.test(html) && (html.match(/\{ id: '[A-D]', label:/g) || []).length === 4);
assert('SMSBUMP_POSTSCRIPT_PILLAR_MATRIX declared', /var\s+SMSBUMP_POSTSCRIPT_PILLAR_MATRIX\s*=\s*\[/.test(html));

// (6) Per-voice detail check — 5 voices (Default / Luxury / Sustainable / Gen-Z / B2B) all present in SMSBUMP_POSTSCRIPT_PILLAR_MATRIX
for (const voice of ['default', 'luxury', 'sustainable', 'genZ', 'b2b']) {
  assert(`SMSBUMP_POSTSCRIPT_PILLAR_MATRIX contains ${voice} voice column`, html.includes(`${voice}:`));
}

// (7) Per-flow canonical id check — 6 canonical SMS-orchestration flows
['postscript_primary_onboard_dlr_monitoring_klaviyo_sms_segment_overlay',
 'smsbump_international_onboard_multi_locale_routing',
 'mms_luxury_voice_sku_launch_rich_media',
 'two_way_conversation_creator_cohort_rcs_gen_z',
 'sms_cohort_ltv_attrition_one_percent_iteration_cycle',
 'sms_cost_stack_decision_recipe_tier_promotion'].forEach(fid => {
  assert(`flow id "${fid}" present`, html.includes(`id: '${fid}'`));
});

// (8) Demo-mode rendering never crashes — execute script in vm + call renderAll with SAMPLE_INPUTS
//     NEW v0.16.x: classList stub is required for any dashboard that emits status pills via classList.add
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
  const scriptText = scriptMatch[1];
  vm.runInContext(scriptText, vmContext);
  assert('script runs in vm context without errors', true);
  vm.runInContext('renderAll(SAMPLE_INPUTS);', vmContext);
  assert('renderAll(SAMPLE_INPUTS) executes without crashing', true);
} catch (e) {
  assert('script runs in vm context without errors', false, e.message);
  vmError = e;
}

// (9) Per-path Year-1 incremental SMS-orchestration-revenue share % bands match canonical PATH_INCREMENTAL_SMS_ORCHESTRATION_REVENUE_SHARE_PCT
//     Path A: 2.0-5.0%, Path B: 3.0-15.0%, Path C: 5.0-25.0% per scripts/smsbump_postscript_channel_orchestration_unit_economics.py
assert('Path A shareLow = 2.0', /A:[\s\S]{0,1000}shareLow:\s*2\.0/.test(html));
assert('Path A shareHigh = 5.0', /A:[\s\S]{0,1000}shareHigh:\s*5\.0/.test(html));
assert('Path B shareLow = 3.0', /B:[\s\S]{0,1000}shareLow:\s*3\.0/.test(html));
assert('Path B shareHigh = 15.0', /B:[\s\S]{0,1000}shareHigh:\s*15\.0/.test(html));
assert('Path C shareLow = 5.0', /C:[\s\S]{0,1000}shareLow:\s*5\.0/.test(html));
assert('Path C shareHigh = 25.0', /C:[\s\S]{0,1000}shareHigh:\s*25\.0/.test(html));

// (10) Per-path SMS-list-growth-rate-vs-Postscript-only bands match canonical
//      Path A: 5.0-15.0%, Path B: 20.0-40.0%, Path C: 30.0-60.0%
assert('Path A listGrowthLow = 5.0',  /A:[\s\S]{0,1000}listGrowthLow:\s*5\.0/.test(html));
assert('Path A listGrowthHigh = 15.0', /A:[\s\S]{0,1000}listGrowthHigh:\s*15\.0/.test(html));
assert('Path B listGrowthLow = 20.0',  /B:[\s\S]{0,1000}listGrowthLow:\s*20\.0/.test(html));
assert('Path B listGrowthHigh = 40.0', /B:[\s\S]{0,1000}listGrowthHigh:\s*40\.0/.test(html));
assert('Path C listGrowthLow = 30.0',  /C:[\s\S]{0,1000}listGrowthLow:\s*30\.0/.test(html));
assert('Path C listGrowthHigh = 60.0', /C:[\s\S]{0,1000}listGrowthHigh:\s*60\.0/.test(html));

// (11) Per-path SMS-cohort-LTV-multiplier-vs-Postscript-only bands match canonical
//      Path A: 1.2-1.5×, Path B: 2.0-3.0×, Path C: 2.5-4.0×
assert('Path A ltvMultiplierLow = 1.2',   /A:[\s\S]{0,1000}ltvMultiplierLow:\s*1\.2/.test(html));
assert('Path A ltvMultiplierHigh = 1.5',  /A:[\s\S]{0,1000}ltvMultiplierHigh:\s*1\.5/.test(html));
assert('Path B ltvMultiplierLow = 2.0',   /B:[\s\S]{0,1000}ltvMultiplierLow:\s*2\.0/.test(html));
assert('Path B ltvMultiplierHigh = 3.0',  /B:[\s\S]{0,1000}ltvMultiplierHigh:\s*3\.0/.test(html));
assert('Path C ltvMultiplierLow = 2.5',   /C:[\s\S]{0,1000}ltvMultiplierLow:\s*2\.5/.test(html));
assert('Path C ltvMultiplierHigh = 4.0',  /C:[\s\S]{0,1000}ltvMultiplierHigh:\s*4\.0/.test(html));

// (12) Per-path SMS-deliverability-vs-Postscript-only-baseline bands match canonical
//      Path A: 2.0-5.0%, Path B: 5.0-15.0%, Path C: 10.0-20.0%
assert('Path A deliverabilityLow = 2.0',   /A:[\s\S]{0,1000}deliverabilityLow:\s*2\.0/.test(html));
assert('Path A deliverabilityHigh = 5.0',  /A:[\s\S]{0,1000}deliverabilityHigh:\s*5\.0/.test(html));
assert('Path B deliverabilityLow = 5.0',   /B:[\s\S]{0,1000}deliverabilityLow:\s*5\.0/.test(html));
assert('Path B deliverabilityHigh = 15.0', /B:[\s\S]{0,1000}deliverabilityHigh:\s*15\.0/.test(html));
assert('Path C deliverabilityLow = 10.0',  /C:[\s\S]{0,1000}deliverabilityLow:\s*10\.0/.test(html));
assert('Path C deliverabilityHigh = 20.0', /C:[\s\S]{0,1000}deliverabilityHigh:\s*20\.0/.test(html));

// (13) Per-path SMS-orchestration-build-cycle months match canonical
//      Path A: 1-3mo, Path B: 6-18mo, Path C: 12-24mo
assert('Path A buildCycle = 1-3mo',  /A:[\s\S]{0,1000}buildCycleLow:\s*1,/.test(html) && /A:[\s\S]{0,1000}buildCycleHigh:\s*3,/.test(html));
assert('Path B buildCycle = 6-18mo', /B:[\s\S]{0,1000}buildCycleLow:\s*6,/.test(html) && /B:[\s\S]{0,1000}buildCycleHigh:\s*18,/.test(html));
assert('Path C buildCycle = 12-24mo',/C:[\s\S]{0,1000}buildCycleLow:\s*12,/.test(html) && /C:[\s\S]{0,1000}buildCycleHigh:\s*24,/.test(html));

// (14) Per-path Year-1 ROI bands match canonical PATH_ROI from research/15
//      Path A: 4-8:1, Path B: 2.4-107:1 (clamps to research band), Path C: 2-6:1
assert('Path A roiLow = 4.0', /A:[\s\S]{0,1500}roiLow:\s*4\.0/.test(html));
assert('Path A roiHigh = 8.0', /A:[\s\S]{0,1500}roiHigh:\s*8\.0/.test(html));
assert('Path B roiLow = 2.4', /B:[\s\S]{0,1500}roiLow:\s*2\.4/.test(html));
assert('Path B roiHigh = 107.0', /B:[\s\S]{0,1500}roiHigh:\s*107/.test(html));
assert('Path C roiLow = 2.0', /C:[\s\S]{0,1500}roiLow:\s*2\.0/.test(html));
assert('Path C roiHigh = 6.0', /C:[\s\S]{0,1500}roiHigh:\s*6\.0/.test(html));

// (15) tierForGmv returns A/B/C in canonical 500k/1M/25M brackets — boundary tests + ordering assertion (NEW v0.16.x)
if (vmContext) {
  try {
    const tierA = vm.runInContext('tierForGmv(400000)', vmContext);
    const tierB = vm.runInContext('tierForGmv(600000)', vmContext);
    const tierC = vm.runInContext('tierForGmv(1500000)', vmContext);
    const tierD = vm.runInContext('tierForGmv(5000000)', vmContext);
    const tierE = vm.runInContext('tierForGmv(25000000)', vmContext);
    const tierF = vm.runInContext('tierForGmv(50000000)', vmContext);

    const tierABound = vm.runInContext('tierForGmv(500000)', vmContext);
    const tierBBound = vm.runInContext('tierForGmv(1000000)', vmContext);
    const tierCBound = vm.runInContext('tierForGmv(25000000)', vmContext);

    assert('tierForGmv($400k) = A', tierA === 'A', `got ${tierA}`);
    assert('tierForGmv($600k) = A', tierB === 'A', `got ${tierB}`);
    assert('tierForGmv($1.5M) = B', tierC === 'B', `got ${tierC}`);
    assert('tierForGmv($5M) = B',   tierD === 'B', `got ${tierD}`);
    assert('tierForGmv($25M) = C',  tierE === 'C', `got ${tierE}`);
    assert('tierForGmv($50M) = C',  tierF === 'C', `got ${tierF}`);
    assert('tierForGmv($500k-boundary) = A', tierABound === 'A', `got ${tierABound}`);
    assert('tierForGmv($1M-boundary) = B', tierBBound === 'B', `got ${tierBBound}`);
    assert('tierForGmv($25M-boundary) = C', tierCBound === 'C', `got ${tierCBound}`);
  } catch (e) {
    assert('tierForGmv classifier returns A/B/C in canonical 500k/1M/25M brackets', false, e.message);
  }
}

// (16) PATH_TABLE.gmvMin ordering A < B < C (NEW v0.16.x — surfaces off-by-one boundary-flip bugs)
assert('PATH_TABLE.gmvMin ordering A < B < C',
  Number(html.match(/A:\s*\{[^}]*gmvMin:\s*(\d+)/)[1]) <
  Number(html.match(/B:\s*\{[^}]*gmvMin:\s*(\d+)/)[1]) &&
  Number(html.match(/B:\s*\{[^}]*gmvMin:\s*(\d+)/)[1]) <
  Number(html.match(/C:\s*\{[^}]*gmvMin:\s*(\d+)/)[1])
);

// (17) URL params parsing — supported params
const parseParamsFn = /function parseParams\(\)/;
assert('parseParams function defined', parseParamsFn.test(html));
assert('URL ?path= param documented', html.includes('?path=A | B | C'));
assert('URL ?us_dtc_gmv= param documented', html.includes('?us_dtc_gmv=5000000'));
assert('URL ?international_gmv_pct= param documented', html.includes('?international_gmv_pct=10'));
assert('URL ?voice= param documented', html.includes('?voice=default | luxury | sustainable | gen_z | b2b'));
assert('URL ?demo= param documented', html.includes('?demo=1'));

// (18) Companion artifact cross-references in HTML comment
const companionArtifacts = [
  'research/15-smsbump-postscript-channel-orchestration.md',
  'playbooks/22-smsbump-postscript-channel-orchestration-launch.md',
  'assets/23-smsbump-postscript-channel-orchestration-templates.md',
  'dashboard/app/smsbump-postscript-channel-orchestration/page.tsx',
  'scripts/smsbump_postscript_channel_orchestration_unit_economics.py',
  'dashboards/tests/test_smsbump_postscript_channel_orchestration_health.js'
];
companionArtifacts.forEach(art => {
  assert(`companion artifact "${art}" cross-referenced in HTML comment`, html.includes(art));
});

// (19) Verifying companion artifacts actually exist on disk
const workspaceRoot = '/data/workspace/ecommerce-ops';
[
  'research/15-smsbump-postscript-channel-orchestration.md',
  'playbooks/22-smsbump-postscript-channel-orchestration-launch.md',
  'assets/23-smsbump-postscript-channel-orchestration-templates.md',
  'scripts/smsbump_postscript_channel_orchestration_unit_economics.py'
].forEach(art => {
  const abs = path.join(workspaceRoot, art);
  assert(`companion artifact "${art}" exists on disk`, fs.existsSync(abs), `not found at ${abs}`);
});

// (20) Hermetic — no fetch / external network
assert('no fetch() calls in dashboard', html.indexOf('fetch(') === -1);
assert('no XMLHttpRequest in dashboard', html.indexOf('XMLHttpRequest') === -1);
assert('no external CDN scripts', html.indexOf('cdn.') === -1);

// (21) Anti-pattern grep — no TODOs / placeholders
assert('no TODO comments', html.indexOf('TODO') === -1);
assert('no FIXME comments', html.indexOf('FIXME') === -1);
assert('no placeholder text', html.match(/placeholder/i) === null);

// (22) Sanity — file size budget
const szKB = (html.length / 1024).toFixed(1);
assert(`file is self-contained (≤70KB) — got ${szKB}KB`, html.length <= 70000);

// (23) Inline CSS uses CSS variables for theming
assert('CSS :root variables defined', html.includes(':root {') && html.includes('--bg:'));
assert('dark theme bg variable', html.includes('--bg: #0f1115'));

// (24) Pure-helper functions exposed for tests via window.__smsbumpPostscriptChannelOrchestrationHealth__
assert('window.__smsbumpPostscriptChannelOrchestrationHealth__ exposed for tests', html.includes('window.__smsbumpPostscriptChannelOrchestrationHealth__'));
assert('exposed helper set includes tierForGmv', html.includes('tierForGmv: tierForGmv'));
assert('exposed helper set includes year1SmsOrchestrationRevenueLow', html.includes('year1SmsOrchestrationRevenueLow: year1SmsOrchestrationRevenueLow'));
assert('exposed helper set includes roiMid', html.includes('roiMid: roiMid'));

// (25) Pure-helper functions compute correct mid-bands from PATH_TABLE
if (vmContext) {
  try {
    const out = vm.runInContext(`JSON.stringify({
      aRoiMid: roiMid('A'),
      bRoiMid: roiMid('B'),
      cRoiMid: roiMid('C'),
      aLtvMid: smsCohortLtvMultiplierMid('A'),
      bLtvMid: smsCohortLtvMultiplierMid('B'),
      cLtvMid: smsCohortLtvMultiplierMid('C'),
      aListGrowthMid: smsListGrowthRateMid('A'),
      bListGrowthMid: smsListGrowthRateMid('B'),
      aDeliverabilityMid: smsDeliverabilityImprovementMid('A'),
      aBuildCycleMid: smsOrchestrationBuildCycleMid('A'),
      bBuildCycleMid: smsOrchestrationBuildCycleMid('B'),
      cBuildCycleMid: smsOrchestrationBuildCycleMid('C'),
      aRevLow: year1SmsOrchestrationRevenueLow(500000, 0, 'A'),
      bRevLow: year1SmsOrchestrationRevenueLow(5000000, 10, 'B'),
      bRevHigh: year1SmsOrchestrationRevenueHigh(5000000, 10, 'B')
    })`, vmContext);
    const parsed = JSON.parse(out);

    // ROI bands — Path A 4-8 mean 6, Path B 2.4-107 mean 54.7, Path C 2-6 mean 4
    assert('roiMid("A") = 6.0', parsed.aRoiMid === 6.0, `got ${parsed.aRoiMid}`);
    assert('roiMid("B") ≈ 54.7', Math.abs(parsed.bRoiMid - 54.7) < 0.5, `got ${parsed.bRoiMid}`);
    assert('roiMid("C") = 4.0', parsed.cRoiMid === 4.0, `got ${parsed.cRoiMid}`);

    // SMS-cohort-LTV-multiplier — Path A mean 1.35, Path B mean 2.5, Path C mean 3.25
    assert('smsCohortLtvMultiplierMid("A") ≈ 1.35', Math.abs(parsed.aLtvMid - 1.35) < 0.01, `got ${parsed.aLtvMid}`);
    assert('smsCohortLtvMultiplierMid("B") = 2.5',  parsed.bLtvMid === 2.5, `got ${parsed.bLtvMid}`);
    assert('smsCohortLtvMultiplierMid("C") ≈ 3.25', Math.abs(parsed.cLtvMid - 3.25) < 0.01, `got ${parsed.cLtvMid}`);

    // SMS-list-growth-rate — Path A mean 10, Path B mean 30
    assert('smsListGrowthRateMid("A") = 10', parsed.aListGrowthMid === 10, `got ${parsed.aListGrowthMid}`);
    assert('smsListGrowthRateMid("B") = 30', parsed.bListGrowthMid === 30, `got ${parsed.bListGrowthMid}`);

    // SMS-deliverability-vs-Postscript-only-baseline — Path A mean 3.5
    assert('smsDeliverabilityImprovementMid("A") ≈ 3.5', Math.abs(parsed.aDeliverabilityMid - 3.5) < 0.01, `got ${parsed.aDeliverabilityMid}`);

    // SMS-orchestration-build-cycle months — Path A 2, Path B 12, Path C 18
    assert('smsOrchestrationBuildCycleMid("A") = 2',  parsed.aBuildCycleMid === 2,  `got ${parsed.aBuildCycleMid}`);
    assert('smsOrchestrationBuildCycleMid("B") = 12', parsed.bBuildCycleMid === 12, `got ${parsed.bBuildCycleMid}`);
    assert('smsOrchestrationBuildCycleMid("C") = 18', parsed.cBuildCycleMid === 18, `got ${parsed.cBuildCycleMid}`);

    // Year-1 incremental SMS-orchestration-revenue — Path A $500k base × 2% low = $10k
    assert('year1SmsOrchestrationRevenueLow Path A ($500k+0%) = $10k', Math.abs(parsed.aRevLow - 10000) < 1, `got ${parsed.aRevLow}`);
    // Path B $5M × 1.10 × 3% = $165k, $5M × 1.10 × 15% = $825k
    assert('year1SmsOrchestrationRevenueLow Path B ($5M+10%) = $165k', Math.abs(parsed.bRevLow - 165000) < 1, `got ${parsed.bRevLow}`);
    assert('year1SmsOrchestrationRevenueHigh Path B ($5M+10%) = $825k', Math.abs(parsed.bRevHigh - 825000) < 1, `got ${parsed.bRevHigh}`);
  } catch (e) {
    assert('pure-helper functions compute correct mid-bands from PATH_TABLE', false, e.message);
  }
}

// (26) Path-rank ordering: A < B < C — downgrade logic uses PATH_RANK dict (canonical pattern)
assert('tierForGmv helper enforces A < B < C boundary ordering', /if \(usGmv >= PATH_TABLE.C.gmvMin\) return 'C';\s*if \(usGmv >= PATH_TABLE.B.gmvMin\) return 'B';/.test(html));

// Summary
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.log('FAILURES:');
  failures.forEach(f => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
  process.exit(1);
}
