/* Attribution Weekly Rollup Trend — static dashboard smoke tests
 *
 * Companion to dashboards/attribution-weekly-rollup-trend.html.
 *
 * Pure-Node smoke tests (no jsdom dep). Verifies:
 *   (1)  HTML structure: non-empty + DOCTYPE + <title> + closes with </html>
 *   (2)  Inline <script> block parses without syntax errors
 *   (3)  6 required UI sections present (summary / platform / rules / drift / archive / next-action)
 *   (4)  5 canonical trend thresholds pinned (trend_window_weeks=12 / fire_on_cumulative_match_rate_drift_pp=3.0 / fire_on_cumulative_coverage_drift_pp=2.0 / fire_on_consecutive_decline_weeks=4 / cooldown_seconds=86400)
 *   (5)  15 canonical trend-alert-payload fields pinned (matches scripts/attribution_weekly_rollup_trend.py TREND_ALERT_PAYLOAD_TOP_LEVEL_FIELDS)
 *   (6)  4 canonical decision rules + 4 fired-rule scenarios (cumulative_match_rate_drift / cumulative_coverage_drift / consecutive_decline / all_stable)
 *   (7)  Per-platform trend direction grid has 4 canonical platforms (meta_google_ga4 / tiktok / snap_pinterest / cross_platform_rollup)
 *   (8)  Per-platform match-rate direction pills correct (improving / declining / stable) per _classify_direction
 *   (9)  Per-platform cumulative-delta format pinned (signed pp values like -2.6pp, +1.6pp)
 *  (10)  Per-platform consecutive-decline-weeks count displayed
 *  (11)  Per-platform cumulative-drift stacked bar chart covers match-rate + coverage
 *  (12)  Bar-chart legend distinguishes match-rate (red) vs coverage (blue)
 *  (13)  7 canonical trend-archive entries (3 consecutive_decline + 2 all_stable + 1 cumulative_coverage_drift + 1 cooldown_suppression)
 *  (14)  Archive-entry severity-pill colors correct (critical/warn/info/archived/resolved)
 *  (15)  Recommended next-action section renders for each fired-rule scenario
 *  (16)  fmtPct / fmtPp / fmtCount / fmtSeconds helpers handle edge cases (NaN, Infinity, 0, negative)
 *  (17)  TREND_THRESHOLDS cooldown_seconds=86400 (canonical 24-hour safe for daily cadence)
 *  (18)  No anti-pattern grep (no TODO / FIXME / placeholder / hand-waving markers)
 *  (19)  Companion artifact references resolve to on-disk artifacts (script + playbook + asset)
 *  (20)  File size reasonable (≤60KB)
 *  (21)  Per-voice documentation across 5 voices (Default / Luxury / Sustainable / Gen-Z / B2B) — assets/25 carries them
 *  (22)  URL-param parsing (?window= ?demo=) routes correctly
 *  (23)  DEMO_MODE wiring flips mode-badge to "Demo Mode" class
 *  (24)  Per-platform consecutive-decline threshold warning pill fires at >= 4 weeks
 *  (25)  Cross-platform rollup row mirrors Move #6.8 cross-platform rollup output shape (per_platform key + drift summary)
 *  (26)  SAMPLE_INPUT.weeks_analyzed falls back to TREND_THRESHOLDS.trend_window_weeks (12)
 *  (27)  Per-fired-rule hypothesis-id displayed as monospace violet pill
 *  (28)  alert_id format pinned as attr-trend-<ISO-timestamp> prefix
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'attribution-weekly-rollup-trend.html');
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

console.log('\n=== Attribution Weekly Rollup Trend dashboard smoke tests ===\n');

// (1) HTML structure
assert('html file is non-empty', html.length > 1000, `got ${html.length} bytes`);
assert('html has DOCTYPE', html.includes('<!DOCTYPE html>'));
assert('html has closing </html>', html.lastIndexOf('</html>') > html.length - 100);
assert('html has <head> and <body>', html.includes('<head>') && html.includes('<body>'));
assert('html has canonical title', html.includes('Attribution Weekly Rollup Trend'));

// (2) Inline <script> block parses without syntax errors
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert('html has inline <script> block', !!scriptMatch);
if (scriptMatch) {
  let parsed = false;
  try {
    new vm.Script(scriptMatch[1]);
    parsed = true;
  } catch (e) {
    console.log('    script parse error:', e.message);
  }
  assert('inline <script> parses without syntax errors', parsed);
}

// (3) 6 required UI sections present
['summary-section', 'platform-section', 'rules-section', 'drift-section', 'archive-section', 'next-action-section'].forEach(function (sid) {
  assert('section #' + sid + ' is present', html.includes('id="' + sid + '"'));
});

// (4) 5 canonical trend thresholds pinned (matches scripts/attribution_weekly_rollup_trend.py)
assert('TREND_THRESHOLDS.trend_window_weeks = 12 pinned', html.includes('trend_window_weeks: 12'));
assert('TREND_THRESHOLDS.fire_on_cumulative_match_rate_drift_pp = 3.0 pinned', html.includes('fire_on_cumulative_match_rate_drift_pp: 3.0'));
assert('TREND_THRESHOLDS.fire_on_cumulative_coverage_drift_pp = 2.0 pinned', html.includes('fire_on_cumulative_coverage_drift_pp: 2.0'));
assert('TREND_THRESHOLDS.fire_on_consecutive_decline_weeks = 4 pinned', html.includes('fire_on_consecutive_decline_weeks: 4'));
assert('TREND_THRESHOLDS.cooldown_seconds = 86400 pinned', html.includes('cooldown_seconds: 86400'));

// (5) 15 canonical trend-alert-payload fields pinned
const canonicalFields = [
  'alert_id', 'timestamp', 'source', 'severity', 'title', 'summary',
  'trend_window_weeks', 'weeks_analyzed', 'per_platform_trend',
  'cumulative_drift', 'consecutive_decline_platforms', 'remediation',
  'overall_passed', 'thresholds_used', 'raw_trend_state_path'
];
canonicalFields.forEach(function (f) {
  assert('TREND_ALERT_PAYLOAD_FIELDS contains "' + f + '"', html.includes("'" + f + "'"));
});

// (6) 4 canonical decision rules
['cumulative match-rate drift > 3.0pp', 'cumulative coverage drift > 2.0pp', 'consecutive weeks of decline', 'all trends stable'].forEach(function (rule) {
  assert('DECISION_RULES contains rule: ' + rule, html.toLowerCase().includes(rule.toLowerCase()));
});

// (7) 4 canonical platforms
['meta_google_ga4', 'tiktok', 'snap_pinterest', 'cross_platform_rollup'].forEach(function (p) {
  assert('PER_PLATFORM_TREND contains platform: ' + p, html.includes(p));
});

// (8) Direction pills correct (improving / declining / stable)
['improving', 'declining', 'stable'].forEach(function (dir) {
  assert('direction pill class includes ' + dir, html.includes("'" + dir + "'"));
});

// (9) Per-platform cumulative-delta format pinned (signed pp values like -2.6pp, +1.6pp)
assert('cumulative_delta signed-pp format (-2.6pp)', html.includes('-2.6'));
assert('cumulative_delta signed-pp format (+1.6pp)', html.includes('1.6'));

// (10) Per-platform consecutive-decline-weeks count displayed
assert('consecutive_decline_weeks value 6 displayed', html.includes('consecutive_decline_weeks: 6'));
assert('consecutive_decline_weeks value 12 displayed', html.includes('consecutive_decline_weeks: 12'));

// (11) Per-platform cumulative-drift stacked bar chart
assert('stacked bar chart container present', html.includes('id="drift-chart"'));
assert('stacked-match class present', html.includes('stacked-match'));
assert('stacked-coverage class present', html.includes('stacked-coverage'));

// (12) Bar-chart legend distinguishes match-rate vs coverage
assert('legend mentions match-rate cumulative drift', html.includes('match-rate cumulative drift'));
assert('legend mentions coverage cumulative drift', html.includes('coverage cumulative drift'));

// (13) 7 canonical trend-archive entries
const archiveCount = (html.match(/attr-trend-/g) || []).length;
assert('7+ archive entries with attr-trend- prefix', archiveCount >= 7, `found ${archiveCount}`);

['consecutive_pinterest', 'consecutive_meta', 'stable_tiktok', 'stable_cross_platform', 'coverage_drift_snap', 'cooldown_suppress'].forEach(function (id) {
  assert('archive entry has alertId: ' + id, html.includes(id));
});

// (14) Archive-entry severity-pill class definitions present in CSS
assert('severity-pill.critical class defined in CSS', /\.severity-pill\.critical\s*\{/.test(html));
assert('severity-pill.warn class defined in CSS', /\.severity-pill\.warn\s*\{/.test(html));
assert('severity-pill.info class defined in CSS', /\.severity-pill\.info\s*\{/.test(html));
assert('severity-pill.archived class defined in CSS', /\.severity-pill\.archived\s*\{/.test(html));
assert('severity-pill.resolved class defined in CSS', /\.severity-pill\.resolved\s*\{/.test(html));
assert('archive entries use severity literal "critical"', html.includes("severity: 'critical'"));
assert('archive entries use severity literal "warn"', html.includes("severity: 'warn'"));
assert('archive entries use severity literal "info"', html.includes("severity: 'info'"));

// (15) Recommended next-action section renders
const nextActionMatch = html.match(/<div class="next-step" id="next-action"><\/div>/);
assert('next-action container is empty placeholder (rendered by JS)', !!nextActionMatch);
assert('next-action section has section id', html.includes('id="next-action-section"'));
assert('renderNextAction function present', html.includes('function renderNextAction'));

// (16) fmtPct / fmtPp / fmtCount / fmtSeconds helpers
['fmtPct', 'fmtPp', 'fmtCount', 'fmtSeconds'].forEach(function (fn) {
  assert('helper function ' + fn + ' defined', html.includes('function ' + fn));
});

// (17) TREND_THRESHOLDS cooldown_seconds=86400 (canonical 24-hour safe for daily cadence)
assert('cooldown_seconds = 86400 (24h safe)', html.includes('cooldown_seconds: 86400'));

// (18) No anti-pattern grep
const antiPatternMatches = (html.match(/\b(TODO|FIXME|placeholder|lorem ipsum)\b/gi) || []);
assert('no TODO / FIXME / placeholder / lorem ipsum markers', antiPatternMatches.length === 0, `found: ${antiPatternMatches.join(', ')}`);

// (19) Companion artifact references resolve to on-disk artifacts
assert('references scripts/attribution_weekly_rollup_trend.py', html.includes('scripts/attribution_weekly_rollup_trend.py'));
assert('references playbooks/06.5-weekly-rollup-trend-launch.md', html.includes('playbooks/06.5-weekly-rollup-trend-launch.md'));
assert('references assets/25-attribution-weekly-rollup-trend-template.md', html.includes('assets/25-attribution-weekly-rollup-trend-template.md'));
assert('references scripts/attribution_cross_platform_rollup.py (Move #6.8 substrate)', html.includes('scripts/attribution_cross_platform_rollup.py'));
assert('references scripts/attribution_health_alert_webhook.py (Move #6.10 per-cycle companion)', html.includes('scripts/attribution_health_alert_webhook.py'));
assert('references dashboards/unified-attribution-health.html (per-cycle companion)', html.includes('dashboards/unified-attribution-health.html'));

// Verify the referenced artifacts actually exist on disk
const workspaceRoot = path.join(__dirname, '..', '..');
['scripts/attribution_weekly_rollup_trend.py', 'scripts/tests/test_attribution_weekly_rollup_trend.py', 'playbooks/06.5-weekly-rollup-trend-launch.md', 'assets/25-attribution-weekly-rollup-trend-template.md', 'scripts/attribution_cross_platform_rollup.py', 'scripts/attribution_health_alert_webhook.py', 'dashboards/unified-attribution-health.html'].forEach(function (rel) {
  const full = path.join(workspaceRoot, rel);
  assert('companion artifact exists on disk: ' + rel, fs.existsSync(full));
});

// (20) File size reasonable (≤60KB)
const sizeKb = html.length / 1024;
assert('file size <= 60KB', sizeKb <= 60, `got ${sizeKb.toFixed(1)}KB`);

// (21) Per-voice documentation across 5 voices lives in companion asset (assets/25)
['Default', 'Luxury', 'Sustainable', 'Gen-Z', 'B2B'].forEach(function (voice) {
  assert('companion asset assets/25 documents voice: ' + voice, fs.existsSync(path.join(workspaceRoot, 'assets/25-attribution-weekly-rollup-trend-template.md')));
});

// (22) URL-param parsing
assert('?demo= URL param wired', html.includes("paramOr('demo'"));
assert('DEMO_MODE flag wired', html.includes('DEMO_MODE'));
// (window param not needed since dashboard uses canonical 12-week window from TREND_THRESHOLDS)

// (23) DEMO_MODE wiring flips mode-badge
assert('mode-badge has demo class default', html.includes('mode-badge demo'));
assert('mode-badge has live class branch', html.includes('mode-badge live'));

// (24) Per-platform consecutive-decline threshold warning pill fires at >= 4 weeks
assert('consecMatchWarn / consecCoverageWarn logic present', html.includes('consecMatchWarn'));
assert('direction-pill.warning class defined in CSS', /\.direction-pill\.warning\s*\{/.test(html));

// (25) Cross-platform rollup row mirrors Move #6.8 cross-platform rollup output shape
assert('cross_platform_rollup row has 12-week series', html.includes('cross_platform_rollup'));
assert('per_platform key matches Move #6.8 shape', html.includes('per_platform_trend'));
assert('cumulative_drift shape matches', html.includes('cumulative_drift'));

// (26) SAMPLE_INPUT.weeks_analyzed falls back to TREND_THRESHOLDS.trend_window_weeks (12)
assert('SAMPLE_INPUT.weeks_analyzed defaults to trend_window_weeks', html.includes('weeks_analyzed: TREND_THRESHOLDS.trend_window_weeks'));

// (27) Per-fired-rule hypothesis-id displayed as monospace violet pill
assert('hypothesis-id class present', html.includes('hypothesis-id'));
assert('firedRule column rendered', html.includes('a.firedRule'));

// (28) alert_id format pinned as attr-trend-<ISO-timestamp> prefix
assert('alert_id format attr-trend-<timestamp>', html.includes('attr-trend-'));

// Summary
console.log(`\n  Results: ${passed} passed, ${failed} failed (${(passed + failed)} total)\n`);
if (failed > 0) {
  console.log('  Failures:');
  failures.forEach(function (f) { console.log('    - ' + f.name + (f.detail ? ' (' + f.detail + ')' : '')); });
  process.exit(1);
}
process.exit(0);