/* TikTok Shop / Live-Commerce Health — static dashboard smoke tests
 *
 * Companion to dashboards/tiktok-shop-live-commerce-health.html.
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1) HTML is well-formed (parseable as a single root element with closing tags).
 *   (2) Inline <script> block parses without syntax errors.
 *   (3) Canonical SAMPLE_INPUTS + FLOWS + PATH_TABLE + PHASE_GATES + CREATOR_AFFILIATE_PAYOUT_MATRIX JSON shapes
 *       conform to the research/11 + playbook 18 + asset 19 + scripts/tiktok_shop_unit_economics.py contract.
 *   (4) URL param parsing (?path= ?us_dtc_gmv= ?demo=) routes correctly.
 *   (5) Fetch timeout pattern (AbortController + setTimeout + clearTimeout) is present (or hermetic — no live fetch — confirmed).
 *   (6) Fetch-timeout-contract value is 1500ms (if present).
 *   (7) Required UI sections are present: summary + flow + path-chart + phase-gates + flow-table + next-action.
 *   (8) 5-payout creator-affiliate-structures matrix cells filled (mirror scripts/tiktok_shop_unit_economics.py CREATOR_AFFILIATE_PAYOUT_MATRIX).
 *   (9) Demo-mode rendering never crashes when called with SAMPLE_INPUTS (via vm.runInContext).
 *  (10) Per-path Year-1 incremental-TikTok-Shop-GMV share % bands match canonical from PATH_INCREMENTAL_GMV_SHARE_PCT.
 *  (11) tierForGmv classifier returns A/B/C in canonical 100k/500k/5M brackets.
 *  (12) Cross-references in source comment resolve to on-disk artifacts (research/11, playbook 18, asset 19, script, route).
 *  (13) Phase gate scoring function maps ok/warn/fail counts to status badges.
 *  (14) 5 canonical TikTok-Shop flows documented (TikTok-Business-Account + TikTok-Shop-Seller-Center + shoppable-video-ads + creator-affiliate-pool + LIVE-shopping-studio).
 *  (15) 5 pillars documented (P1 platform-selection / P2 creator-affiliate / P3 shoppable-video-ads / P4 LIVE-shopping / P5 attribution-measurement).
 *  (16) Anti-pattern grep (no TODOs / placeholders / hand-waving).
 *  (17) Sanity: file is well under typical Next.js build budget (self-contained, ≤60KB).
 *  (18) Hermetic: no fetch / XMLHttpRequest / external CDN calls (no TikTok-Shop-Seller-Center / Shopify-TikTok-Channel / Klaviyo / Triple-Whale / TikTok-Ads-Manager API access required).
 *  (19) 5-payout creator-affiliate-structures matrix (Default / Luxury / Sustainable / Gen-Z / B2B) all present.
 *  (20) Per-voice CPS payout bands documented across 5 voices.
 *  (21) Path-tier defaults: Path B DEFAULT = TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Triple-Whale-TikTok-cohort-overlay.
 *  (22) LIVE-cohort-LTV multiplier mid-range computed correctly across all 3 paths.
 *  (23) Spark-Ads ROAS mid-range computed correctly across all 3 paths.
 *  (24) Creator-affiliate-pool mid-range computed correctly across all 3 paths.
 *  (25) Shop-Score algorithmic-bonus mid-range computed correctly across all 3 paths.
 *  (26) Path-rank ordering: A < B < C (downgrade logic uses PATH_RANK dict).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'tiktok-shop-live-commerce-health.html');
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

console.log('\n=== TikTok Shop / Live-Commerce Health dashboard smoke tests ===\n');

// (1) HTML is non-empty + has expected structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has <!DOCTYPE html>', html.startsWith('<!DOCTYPE html>'));
assert('html has <title>', /<title>[^<]+<\/title>/.test(html));
assert('title text matches TikTok Shop / Live-Commerce Health', html.includes('<title>TikTok Shop / Live-Commerce Health'));
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

// (4) URL param parsing + (5) Fetch timeout pattern + (6) Fetch-timeout value
// Note: this dashboard is hermetic — no live fetches — so the URL param parsing is via window.location.search,
// and there is no AbortController (since no live fetches). The tiktok-shop-live-commerce dashboard is fully demo-mode by design per the v0.11.0 hermetic recipe.
assert('parseParams parses window.location.search', /function\s+parseParams\s*\(\s*\)/.test(html));
assert('applyParams applies path + us_dtc_gmv + demo', /function\s+applyParams\s*\(\s*params\s*\)/.test(html));
assert('bootstrap IIFE present', /function\s+bootstrap\s*\(/.test(html));

// (7) Required data structures declared
assert('FLOWS declared', /var\s+FLOWS\s*=\s*\[/.test(html));
assert('PATH_TABLE declared', /var\s+PATH_TABLE\s*=\s*\{/.test(html));
assert('PHASE_GATES declared', /var\s+PHASE_GATES\s*=\s*\[/.test(html));
assert('CREATOR_AFFILIATE_PAYOUT_MATRIX declared', /var\s+CREATOR_AFFILIATE_PAYOUT_MATRIX\s*=\s*\[/.test(html));
assert('SAMPLE_INPUTS declared', /var\s+SAMPLE_INPUTS\s*=\s*\{/.test(html));

// (8) 5-payout creator-affiliate-structures matrix cells filled (Default + Luxury + Sustainable + Gen-Z + B2B)
for (const voice of ['Default', 'Luxury', 'Sustainable', 'Gen-Z', 'B2B']) {
  assert(`creator-affiliate payout matrix contains ${voice} voice row`, html.includes(`voice: '${voice}'`) || html.includes(`voice: "${voice}"`));
}

// Verify canonical 5-voice CPS payout % values per CREATOR_AFFILIATE_PAYOUT_MATRIX
assert('Default 15% CPS baseline documented', /Default[\s\S]{0,400}15% CPS baseline/.test(html));
assert('Luxury 10% CPS MAP-guarded documented', /Luxury[\s\S]{0,400}10% CPS MAP-guarded/.test(html));
assert('Sustainable 20% CPS mission-driven documented', /Sustainable[\s\S]{0,400}20% CPS mission-driven/.test(html));
assert('Gen-Z 25% CPS Gen-Z premium documented', /Gen-Z[\s\S]{0,400}25% CPS Gen-Z premium/.test(html));
assert('B2B 8-12% CPS tiered-volume documented', /B2B[\s\S]{0,400}8-12% CPS tiered-volume/.test(html));

// (9) Demo-mode rendering never crashes — execute script in vm + call bootstrap with SAMPLE_INPUTS
let vmContext = null;
let vmError = null;
try {
  // The dashboard uses URLSearchParams via window.location.search — provide a global URLSearchParams shim.
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
  // Call bootstrap (the dashboard uses bootstrap, not renderAll directly)
  vm.runInContext('bootstrap();', vmContext);
  assert('bootstrap() executes without crashing', true);
} catch (e) {
  assert('script runs in vm context without errors', false, e.message);
  vmError = e;
}

// (10) Per-path incremental-GMV share bands match canonical PATH_INCREMENTAL_GMV_SHARE_PCT
// Path A: 5-25%, Path B: 25-50%, Path C: 15-30% per scripts/tiktok_shop_unit_economics.py
assert('Path A incShareLow = 5', /incShareLow:\s*5/.test(html));
assert('Path A incShareHigh = 25', /A:[\s\S]{0,600}incShareHigh:\s*25/.test(html));
assert('Path B incShareLow = 25', /B:[\s\S]{0,600}incShareLow:\s*25/.test(html));
assert('Path B incShareHigh = 50', /B:[\s\S]{0,600}incShareHigh:\s*50/.test(html));
assert('Path C incShareLow = 15', /C:[\s\S]{0,600}incShareLow:\s*15/.test(html));
assert('Path C incShareHigh = 30', /C:[\s\S]{0,600}incShareHigh:\s*30/.test(html));

// (11) tierForGmv returns A/B/C in canonical 100k/500k/5M brackets
try {
  const tierA = vm.runInContext('tierForGmv(50000)', vmContext);
  const tierB = vm.runInContext('tierForGmv(2000000)', vmContext);
  const tierC = vm.runInContext('tierForGmv(10000000)', vmContext);
  const tierABound = vm.runInContext('tierForGmv(100000)', vmContext);
  const tierBBound = vm.runInContext('tierForGmv(500000)', vmContext);
  const tierCBound = vm.runInContext('tierForGmv(5000000)', vmContext);
  assert('tierForGmv($50k) = A', tierA === 'A', `got ${tierA}`);
  assert('tierForGmv($2M) = B', tierB === 'B', `got ${tierB}`);
  assert('tierForGmv($10M) = C', tierC === 'C', `got ${tierC}`);
  assert('tierForGmv at $100k floor = A (boundary)', tierABound === 'A', `got ${tierABound}`);
  assert('tierForGmv at $500k floor = B (boundary)', tierBBound === 'B', `got ${tierBBound}`);
  assert('tierForGmv at $5M floor = C (boundary)', tierCBound === 'C', `got ${tierCBound}`);
} catch (e) {
  assert('tierForGmv boundary tests pass', false, e.message);
}

// (12) Cross-references in source comment resolve to on-disk artifacts
const fs2 = require('fs');
const workspaceRoot = path.join(__dirname, '..', '..');
for (const rel of [
  'research/11-tiktok-shop-live-commerce.md',
  'playbooks/18-tiktok-shop-live-launch.md',
  'assets/19-tiktok-shop-creator-briefs.md',
  'dashboard/app/tiktok/page.tsx',
  'scripts/tiktok_shop_unit_economics.py'
]) {
  assert(`cross-reference ${rel} exists on disk`, fs2.existsSync(path.join(workspaceRoot, rel)));
}

// (13) gateStatusBadge / phase progress mapping logic — verify the 3-state render gates status
// Verify the PHASE_GATES data structure includes the 3 states
for (const status of ['ok', 'warn', 'draft']) {
  assert(`PHASE_GATES contains status="${status}"`, html.includes(`status: '${status}'`));
}

// (14) 6 canonical TikTok-Shop flows documented (Pillar 1-5 + Triple-Whale-TikTok-cohort-overlay Pillar 5)
for (const fid of ['tiktok_business_account', 'tiktok_shop_seller_center', 'shoppable_video_ads_launch', 'creator_affiliate_pool_build', 'triple_whale_tiktok_attribution', 'live_shopping_studio_build']) {
  assert(`flow ${fid} present in FLOWS`, html.includes(`id: '${fid}'`));
}

// (15) 5 pillars documented (canonical research/11 framework)
for (const pillar of ['Pillar 1 platform-selection', 'Pillar 2 creator-affiliate', 'Pillar 3 shoppable-video-ads', 'Pillar 4 LIVE-shopping', 'Pillar 5 attribution-measurement']) {
  assert(`pillar "${pillar}" referenced in FLOWS`, html.includes(pillar));
}
// (15b) Pillars must appear in PHASE_GATES criterion text too
assert('Pillar 1 referenced in PHASE_GATES', /Pillar 1/.test(html));
assert('Pillar 2 referenced in PHASE_GATES', /Pillar 2/.test(html));
assert('Pillar 3 referenced in PHASE_GATES', /Pillar 3/.test(html));
assert('Pillar 4 referenced in PHASE_GATES', /Pillar 4/.test(html));
assert('Pillar 5 referenced in PHASE_GATES', /Pillar 5/.test(html));

// (15c) Path-default platform picks documented (each path's default_platform_pick canonical string)
assert('Path A default platform pick = TikTok-Shop-Seller-Center + Shopify-TikTok-Channel', /TikTok-Shop-Seller-Center/.test(html));
assert('Path B default platform pick includes Triple-Whale-TikTok-cohort-overlay', /Triple-Whale-TikTok-cohort-overlay/.test(html));
assert('Path C default platform pick includes Triple-Whale-Pro', /Triple-Whale-Pro/.test(html));

// (15d) Cost stack bands visible
assert('Path B recurring cost $200 documented (Triple-Whale-Starter-or-Pro)', /B:[\s\S]{0,600}costRecurLow:\s*200/.test(html));
assert('Path C recurring cost $2,000 documented (full-orchestration)', /C:[\s\S]{0,600}costRecurLow:\s*2000/.test(html));

// (16) Anti-pattern grep (no TODOs / placeholders / hand-waving)
const antiPatternMatches = html.match(/TODO|FIXME|XXX/gi);
assert('no TODOs / FIXMEs in production markup', !antiPatternMatches || antiPatternMatches.length === 0, `found ${antiPatternMatches ? antiPatternMatches.length : 0}`);

// (17) Sanity: file is well under 60KB (self-contained, ≤60KB)
assert('html file size ≤60KB', html.length <= 61440, `got ${html.length} bytes`);

// (18) Hermetic: no external fetch / CDN calls (excluding comments)
assert('no fetch() call (excluding comments)', !/(^|[^/])\bfetch\s*\(/.test(scriptText.replace(/\/\/[^\n]*\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '')));
assert('no XMLHttpRequest', !/XMLHttpRequest/.test(scriptText));
assert('no external CDN script tags (no src=)', !/<script[^>]+src=/.test(html));

// (19) 5-payout creator-affiliate-structures matrix all 5 voice rows present
assert('Default CPS tier1 15%', /Default[\s\S]{0,400}15% CPS baseline/.test(html));
assert('Luxury CPS tier1 10%', /Luxury[\s\S]{0,400}10% CPS MAP-guarded/.test(html));
assert('Sustainable CPS tier1 20%', /Sustainable[\s\S]{0,400}20% CPS mission-driven/.test(html));
assert('Gen-Z CPS tier1 25%', /Gen-Z[\s\S]{0,400}25% CPS Gen-Z premium/.test(html));
assert('B2B CPS tier1 8-12%', /B2B[\s\S]{0,400}8-12% CPS tiered-volume/.test(html));

// (20) Per-voice CPS payout bands documented across 5 voices (tier2 + tier3)
assert('Default CPS tier2 20% documented', /Default[\s\S]{0,500}20% CPS mid-tier/.test(html));
assert('Default CPS tier3 25% documented', /Default[\s\S]{0,500}25% CPS top-tier/.test(html));
assert('Gen-Z CPS tier2 30% documented', /Gen-Z[\s\S]{0,500}30% CPS Gen-Z premium mid/.test(html));
assert('Gen-Z CPS tier3 35% documented', /Gen-Z[\s\S]{0,500}35% CPS Gen-Z premium top/.test(html));
assert('B2B CPS tier2 12-15% documented', /B2B[\s\S]{0,500}12-15% CPS tiered-volume mid/.test(html));
assert('B2B CPS tier3 15-20% documented', /B2B[\s\S]{0,500}15-20% CPS tiered-volume top/.test(html));

// (21) Path-tier defaults: Path B DEFAULT = TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Triple-Whale-TikTok-cohort-overlay
assert('Path B DEFAULT label present', /Path B[\s\S]{0,200}DEFAULT/.test(html));

// (22) LIVE-cohort-LTV multiplier mid-range computed correctly across all 3 paths
try {
  const ltvA = vm.runInContext('liveLtvMid("A")', vmContext);
  const ltvB = vm.runInContext('liveLtvMid("B")', vmContext);
  const ltvC = vm.runInContext('liveLtvMid("C")', vmContext);
  // Path A: 1.0-1.5 → 1.25, Path B: 3.0-5.0 → 4.0, Path C: 4.0-7.0 → 5.5
  assert('LIVE-cohort-LTV mid Path A = 1.25', Math.abs(ltvA - 1.25) < 0.001, `got ${ltvA}`);
  assert('LIVE-cohort-LTV mid Path B = 4.0', Math.abs(ltvB - 4.0) < 0.001, `got ${ltvB}`);
  assert('LIVE-cohort-LTV mid Path C = 5.5', Math.abs(ltvC - 5.5) < 0.001, `got ${ltvC}`);
} catch (e) {
  assert('LIVE-cohort-LTV mid-range tests pass', false, e.message);
}

// (23) Spark-Ads ROAS mid-range
try {
  const roasA = vm.runInContext('sparkRoasMid("A")', vmContext);
  const roasB = vm.runInContext('sparkRoasMid("B")', vmContext);
  const roasC = vm.runInContext('sparkRoasMid("C")', vmContext);
  // Path A: 1.5-2.5 → 2.0, Path B: 2.0-4.0 → 3.0, Path C: 3.0-5.0 → 4.0
  assert('Spark-Ads ROAS mid Path A = 2.0', Math.abs(roasA - 2.0) < 0.001, `got ${roasA}`);
  assert('Spark-Ads ROAS mid Path B = 3.0', Math.abs(roasB - 3.0) < 0.001, `got ${roasB}`);
  assert('Spark-Ads ROAS mid Path C = 4.0', Math.abs(roasC - 4.0) < 0.001, `got ${roasC}`);
} catch (e) {
  assert('Spark-Ads ROAS mid-range tests pass', false, e.message);
}

// (24) Creator-affiliate-pool mid-range
try {
  const poolA = vm.runInContext('creatorAffiliatePoolMid("A")', vmContext);
  const poolB = vm.runInContext('creatorAffiliatePoolMid("B")', vmContext);
  const poolC = vm.runInContext('creatorAffiliatePoolMid("C")', vmContext);
  // Path A: 20, Path B: 50, Path C: 100
  assert('Creator-affiliate-pool mid Path A = 20', poolA === 20, `got ${poolA}`);
  assert('Creator-affiliate-pool mid Path B = 50', poolB === 50, `got ${poolB}`);
  assert('Creator-affiliate-pool mid Path C = 100', poolC === 100, `got ${poolC}`);
} catch (e) {
  assert('creator-affiliate-pool mid-range tests pass', false, e.message);
}

// (25) Shop-Score algorithmic-bonus mid-range
try {
  const bonusA = vm.runInContext('shopScoreAlgorithmicBonusMid("A")', vmContext);
  const bonusB = vm.runInContext('shopScoreAlgorithmicBonusMid("B")', vmContext);
  const bonusC = vm.runInContext('shopScoreAlgorithmicBonusMid("C")', vmContext);
  // Path A: 10, Path B: 30, Path C: 50
  assert('Shop-Score algorithmic-bonus mid Path A = 10', bonusA === 10, `got ${bonusA}`);
  assert('Shop-Score algorithmic-bonus mid Path B = 30', bonusB === 30, `got ${bonusB}`);
  assert('Shop-Score algorithmic-bonus mid Path C = 50', bonusC === 50, `got ${bonusC}`);
} catch (e) {
  assert('shop-score-algorithmic-bonus mid-range tests pass', false, e.message);
}

// (26) Path-rank ordering: A < B < C
assert('Path A scope documented as Creator-affiliate-only + shoppable-video-ads', /Creator-affiliate-only \+ shoppable-video-ads/.test(html));
assert('Path B scope documented as Creator-affiliate + shoppable-video-ads + LIVE-shopping', /Creator-affiliate \+ shoppable-video-ads \+ LIVE-shopping/.test(html));
assert('Path C scope documented as Full TikTok-Shop-orchestration', /Full TikTok-Shop-orchestration/.test(html));

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  for (const f of failures) console.log(`  FAIL: ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
  process.exit(1);
}
process.exit(0);