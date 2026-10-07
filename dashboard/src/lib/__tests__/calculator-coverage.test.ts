/**
 * Move #N.17 — `calculator-coverage.ts` test suite.
 *
 * Pins the canonical calculator registry: 22 of 30 playbooks have an
 * in-browser calculator wired on their detail page. The remaining 8
 * fall through to the playbook markdown + the Python CLI script in
 * `scripts/`. The test asserts the type-mix + missing-slug list stays
 * stable across ticks so the card always tells the truth.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  CALCULATOR_REGISTRY,
  CALCULATOR_TYPE_GLYPH,
  CALCULATOR_TYPE_LABEL,
  CALCULATOR_TYPE_TONE,
  buildCalculatorCoverage,
  coverageHeadline,
  coverageToneClass,
  CANONICAL_CALCULATOR_COVERAGE,
  type CalculatorTypeMeta,
} from "../calculator-coverage";

// --- Build a synthetic catalog of all 30 playbooks -------------------
const ALL_PLAYBOOK_SLUGS = [
  "01-abandoned-cart-flow-klaviyo",
  "02-post-purchase-upsell-reconvert",
  "03-checkout-audit-baymard",
  "04-welcome-series-klaviyo",
  "05-migrate-to-klaviyo-postscript",
  "06-install-attribution-triplewhale-or-polar",
  "06-sms-welcome-and-cart-abandon",
  "06.10-attribution-health-alert-webhook-launch",
  "06.5-attribution-quality-audit",
  "06.5-weekly-rollup-trend-launch",
  "06.6-tiktok-attribution-quality-audit",
  "06.7-snap-pinterest-attribution-quality-audit",
  "06.8-cross-platform-attribution-drift-unification",
  "07-loyalty-program-smile",
  "09-mobile-pdp-redesign",
  "09.5-pdp-ab-testing-program",
  "10-ai-ad-creative-iteration",
  "11-international-rollout",
  "12-lifecycle-flow-library",
  "13-marketplace-launch",
  "14-3pl-migration",
  "15-subscription-program-launch",
  "16-affiliate-program-launch",
  "17-b2b-wholesale-launch",
  "18-tiktok-shop-live-launch",
  "19-creator-economy-launch",
  "20-pinterest-seo-launch",
  "21-amazon-dsp-amazon-attribution-audit-launch",
  "22-smsbump-postscript-channel-orchestration-launch",
  "23-generative-ai-engine-launch",
];

const SYNTHETIC_CATALOG = ALL_PLAYBOOK_SLUGS.map((slug) => ({
  file: `${slug}.md`,
  title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  meta: [],
  sectionCount: 6,
  numberedSections: [],
  size: 8000,
  lastTouched: "2026-10-01T00:00:00Z",
}));

test("calculator-coverage: canonical registry has exactly 24 entries", () => {
  assert.equal(CALCULATOR_REGISTRY.length, 24);
});

test("calculator-coverage: canonical counts match CANONICAL_CALCULATOR_COVERAGE", () => {
  assert.equal(CALCULATOR_REGISTRY.length, CANONICAL_CALCULATOR_COVERAGE.withCalculator);
  const typeCount: Record<string, number> = {};
  for (const entry of CALCULATOR_REGISTRY) {
    typeCount[entry.type] = (typeCount[entry.type] ?? 0) + 1;
  }
  for (const [type, n] of Object.entries(CANONICAL_CALCULATOR_COVERAGE.typeMix)) {
    if (type === "none") continue;
    assert.equal(typeCount[type] ?? 0, n, `typeMix.${type}`);
  }
});

test("calculator-coverage: registry slugs are unique and sorted lexically", () => {
  const slugs = CALCULATOR_REGISTRY.map((r) => r.slug);
  assert.deepEqual(slugs, slugs.slice().sort());
  assert.equal(new Set(slugs).size, slugs.length);
});

test("calculator-coverage: every calculator entry has a non-empty type + key", () => {
  for (const entry of CALCULATOR_REGISTRY) {
    assert.ok(entry.slug.length > 0);
    assert.ok(entry.calculatorKey.length > 0);
    assert.ok(entry.type.length > 0);
    assert.ok(["roi-projection", "path-abc", "audit-scorer", "size-test", "savings"].includes(entry.type));
  }
});

test("calculator-coverage: buildCalculatorCoverage happy path", () => {
  const summary = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  assert.equal(summary.total, 30);
  assert.equal(summary.withCalculator, 24);
  assert.equal(summary.withoutCalculator, 6);
  assert.equal(summary.coveragePct, 80);
  // type-mix matches canonical (30 = 24 + 6).
  assert.equal(summary.typeMix["roi-projection"], 6);
  assert.equal(summary.typeMix["path-abc"], 10);
  assert.equal(summary.typeMix["audit-scorer"], 6);
  assert.equal(summary.typeMix["size-test"], 1);
  assert.equal(summary.typeMix["savings"], 1);
  assert.equal(summary.typeMix.none, 6);
});

test("calculator-coverage: missingSlugs list is sorted + complete", () => {
  const summary = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  const expectedMissing = [
    "06-install-attribution-triplewhale-or-polar",
    "06.5-weekly-rollup-trend-launch",
    "06.8-cross-platform-attribution-drift-unification",
    "21-amazon-dsp-amazon-attribution-audit-launch",
    "22-smsbump-postscript-channel-orchestration-launch",
    "23-generative-ai-engine-launch",
  ];
  assert.deepEqual(summary.missingSlugs, expectedMissing);
  // Each missing slug is NOT in the registry.
  const regSlugs = new Set(CALCULATOR_REGISTRY.map((r) => r.slug));
  for (const m of summary.missingSlugs) {
    assert.ok(!regSlugs.has(m), `missing slug "${m}" should not be in registry`);
  }
});

test("calculator-coverage: rows are sorted with-calc-first then alphabetical", () => {
  const summary = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  // First 24 rows have a calculator; last 6 do not.
  for (let i = 0; i < 24; i++) {
    assert.ok(summary.rows[i].calculator !== null, `row ${i} should have a calculator`);
  }
  for (let i = 24; i < 30; i++) {
    assert.equal(summary.rows[i].calculator, null, `row ${i} should not have a calculator`);
  }
});

test("calculator-coverage: row includes title + slug + lastTouched", () => {
  const summary = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  for (const row of summary.rows) {
    assert.ok(row.slug.length > 0);
    assert.ok(row.title.length > 0);
    assert.equal(row.lastTouched, "2026-10-01T00:00:00Z");
  }
});

test("calculator-coverage: empty catalog returns zeros", () => {
  const summary = buildCalculatorCoverage([]);
  assert.equal(summary.total, 0);
  assert.equal(summary.withCalculator, 0);
  assert.equal(summary.withoutCalculator, 0);
  assert.equal(summary.coveragePct, 0);
  assert.deepEqual(summary.rows, []);
  // type-mix still has every key (initialized to 0).
  assert.equal(summary.typeMix["roi-projection"], 0);
  assert.equal(summary.typeMix.none, 0);
});

test("calculator-coverage: defensive against missing file field", () => {
  const catalog = [...SYNTHETIC_CATALOG, { file: "", title: "X", meta: [], sectionCount: 0, numberedSections: [], size: 0 }];
  const summary = buildCalculatorCoverage(catalog);
  // The empty-file row is skipped.
  assert.equal(summary.total, 30);
});

test("calculator-coverage: headline strings for 3 coverage states", () => {
  const summary = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  // 24/30 = "X · Y have a calculator · M don't".
  const h1 = coverageHeadline(summary);
  assert.match(h1, /^30 playbooks/);
  assert.match(h1, /24 have a calculator/);
  assert.match(h1, /6 don.t$/);

  // 0/0 = empty.
  const empty = buildCalculatorCoverage([]);
  assert.equal(coverageHeadline(empty), "No playbook in the catalog");

  // 100% coverage (synthetic).
  const fullCatalog = CALCULATOR_REGISTRY.map((r) => ({
    file: `${r.slug}.md`,
    title: r.slug,
    meta: [],
    sectionCount: 0,
    numberedSections: [],
    size: 0,
  }));
  const full = buildCalculatorCoverage(fullCatalog);
  assert.match(coverageHeadline(full), /^All 24 playbooks/);
});

test("calculator-coverage: tone class picks emerald / amber / rose", () => {
  // 24/30 = 80% → amber.
  const amber = buildCalculatorCoverage(SYNTHETIC_CATALOG);
  const t1 = coverageToneClass(amber);
  assert.match(t1, /amber/);
  // 22/21 full = 100% → emerald.
  const fullCatalog = CALCULATOR_REGISTRY.map((r) => ({
    file: `${r.slug}.md`,
    title: r.slug,
    meta: [],
    sectionCount: 0,
    numberedSections: [],
    size: 0,
  }));
  const full = buildCalculatorCoverage(fullCatalog);
  const t2 = coverageToneClass(full);
  assert.match(t2, /emerald/);
  // 0/30 = 0% → rose.
  const none = buildCalculatorCoverage(
    ALL_PLAYBOOK_SLUGS.filter(
      (s) => !CALCULATOR_REGISTRY.some((r) => r.slug === s),
    ).map((slug) => ({
      file: `${slug}.md`,
      title: slug,
      meta: [],
      sectionCount: 0,
      numberedSections: [],
      size: 0,
    })),
  );
  const t3 = coverageToneClass(none);
  assert.match(t3, /rose/);
});

test("calculator-coverage: type labels + tones + glyphs are non-empty for every type", () => {
  const types = ["roi-projection", "path-abc", "audit-scorer", "size-test", "savings"] as const;
  for (const t of types) {
    assert.ok(CALCULATOR_TYPE_LABEL[t].length > 0);
    assert.ok(CALCULATOR_TYPE_TONE[t].length > 0);
    assert.ok(CALCULATOR_TYPE_GLYPH[t].length > 0);
  }
});

test("calculator-coverage: slug → calculatorKey mapping is type-stable", () => {
  // The 6 ROI projections map to calculators that compute recovered / incremental revenue.
  const roiKeys = CALCULATOR_REGISTRY
    .filter((r: CalculatorTypeMeta) => r.type === "roi-projection")
    .map((r) => r.calculatorKey);
  for (const k of [
    "AbandonedCartROICalculator",
    "PostPurchaseUpsellROICalculator",
    "WelcomeSeriesROICalculator",
    "SmsWelcomeCartROICalculator",
    "LoyaltyROICalculator",
    "AiAdCreativeROICalculator",
  ]) {
    assert.ok(roiKeys.includes(k), `${k} should be tagged roi-projection`);
  }
});