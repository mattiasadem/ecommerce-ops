/**
 * `document-outline.test.ts` — pure-logic tests for the Move #N.26
 * document-outline TOC sidebar.
 *
 * Covers: outlineSlugify, buildDocumentOutline, outlineHeadline,
 * outlineToneClass, outlineProgressLabel, truncateOutlineHeading,
 * outlineH2Count, DEFAULT_OUTLINE_VISIBLE_ROWS, CANONICAL_DOCUMENT_OUTLINE.
 *
 * Run with: `npx jiti src/lib/__tests__/document-outline.test.ts`
 */

import {
  buildDocumentOutline,
  outlineHeadline,
  outlineH2Count,
  outlineProgressLabel,
  outlineSlugify,
  outlineToneClass,
  truncateOutlineHeading,
  DEFAULT_OUTLINE_VISIBLE_ROWS,
  CANONICAL_DOCUMENT_OUTLINE,
  type OutlineSummary,
} from "../document-outline";

let pass = 0;
let fail = 0;
const failures: string[] = [];
function eq(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    failures.push(`${name}: expected ${e}, got ${a}`);
    console.log(`  ✗ ${name}: expected ${e}, got ${a}`);
  }
}

console.log("--- outlineSlugify ---");
eq("Simple heading", outlineSlugify("Unit economics"), "unit-economics");
// The slugify helper in the markdown renderer uses `/[^a-z0-9]+/g`
  // which collapses the apostrophe into a single dash. We mirror that
  // behavior here so the TOC anchor matches the rendered H2 id.
  eq("Heading with apostrophe", outlineSlugify("Don't ship it"), "don-t-ship-it");
eq("Heading with parentheses", outlineSlugify("Step-by-step (Day 1)"), "step-by-step-day-1");
eq("Numbered heading 1.", outlineSlugify("1. Why this matters"), "1-why-this-matters");
eq("Empty heading → empty", outlineSlugify(""), "");
eq("Heading with multiple spaces", outlineSlugify("How  it  works"), "how-it-works");
eq("Heading with ampersand", outlineSlugify("Risks & tradeoffs"), "risks-tradeoffs");
eq("Caps preserved lowercased", outlineSlugify("UNIT ECONOMICS"), "unit-economics");
eq("Long heading truncated to 80", outlineSlugify("a".repeat(120)).length, 80);

console.log("\n--- buildDocumentOutline ---");
{
  // Empty markdown
  const empty = buildDocumentOutline("");
  eq("empty md → total 0", empty.total, 0);
  eq("empty md → h2Count 0", empty.h2Count, 0);
  eq("empty md → h3Count 0", empty.h3Count, 0);
  eq("empty md → rows.length 0", empty.rows.length, 0);

  // Realistic landscape doc fragment. The test markdown has
  // 4 H2 + 4 H3 (one fewer H3 than the docstring originally counted).
  const md = [
    "# Title ignored",
    "",
    "## Executive Summary",
    "",
    "Some prose.",
    "",
    "## 1. Unit Economics Benchmarks",
    "",
    "### AOV tiers",
    "",
    "### CAC payback",
    "",
    "## 2. Acquisition",
    "",
    "### Meta (Facebook)",
    "",
    "### TikTok",
    "",
    "## 3. Conversion",
    "",
  ].join("\n");
  const s = buildDocumentOutline(md);
  eq("realistic → total 8 rows (4 H2 + 4 H3)", s.total, 8);
  eq("realistic → h2Count 4", s.h2Count, 4);
  eq("realistic → h3Count 4", s.h3Count, 4);
  eq("realistic first row heading", s.rows[0].heading, "Executive Summary");
  eq("realistic first row level", s.rows[0].level, 2);
  eq("realistic first row hash", s.rows[0].hash, "executive-summary");
  eq("realistic H3 row at index 2", s.rows[2].heading, "AOV tiers");
  eq("realistic H3 row level", s.rows[2].level, 3);
  eq("realistic last row heading", s.rows[s.rows.length - 1].heading, "3. Conversion");
  eq("realistic index sequence monotonic", s.rows.every((r, i) => r.index === i), true);

  // Skips H1
  eq("only H1 → total 0", buildDocumentOutline("# Just a title\n\nProse.").total, 0);

  // Skips empty H2 / H3 lines
  const sparse = buildDocumentOutline("## \n\n### \n\n## Real\n");
  eq("sparse → 1 row", sparse.total, 1);
  eq("sparse → 'Real' heading", sparse.rows[0].heading, "Real");

  // Defensive: maxRows cap
  const many = buildDocumentOutline(
    Array.from({ length: 30 }, (_, i) => `## Section ${i}`).join("\n"),
    10,
  );
  eq("cap 10 → 10 rows", many.total, 10);
}

console.log("\n--- outlineHeadline ---");
{
  const empty = { rows: [], total: 0, h2Count: 0, h3Count: 0 } as OutlineSummary;
  eq("empty → 'Document outline'", outlineHeadline(empty), "Document outline");
  const onlyH2 = {
    rows: [],
    total: 5,
    h2Count: 5,
    h3Count: 0,
  } as OutlineSummary;
  eq("5 H2 + 0 H3 → 'Document outline · 5 sections'", outlineHeadline(onlyH2), "Document outline · 5 sections");
  const mixed = {
    rows: [],
    total: 8,
    h2Count: 3,
    h3Count: 5,
  } as OutlineSummary;
  eq("mixed → 'Document outline · 3 sections · 5 sub-sections'", outlineHeadline(mixed), "Document outline · 3 sections · 5 sub-sections");
}

console.log("\n--- outlineToneClass ---");
{
  const empty = { rows: [], total: 0, h2Count: 0, h3Count: 0 } as OutlineSummary;
  eq("empty → muted", outlineToneClass(empty, 0), "border-border bg-card");
  eq("empty + viewed → muted", outlineToneClass(empty, 0), "border-border bg-card");
  const real = {
    rows: [],
    total: 12,
    h2Count: 12,
    h3Count: 0,
  } as OutlineSummary;
  eq("real + 0 viewed → muted", outlineToneClass(real, 0), "border-border bg-card");
  eq("real + 3 of 12 → amber", outlineToneClass(real, 3), "border-amber-500/30 bg-amber-500/5");
  eq("real + 12 of 12 → emerald", outlineToneClass(real, 12), "border-emerald-500/30 bg-emerald-500/5");
  eq("real + all viewed (>12) → emerald", outlineToneClass(real, 99), "border-emerald-500/30 bg-emerald-500/5");
}

console.log("\n--- outlineProgressLabel ---");
{
  eq("total 0 → 'no sections'", outlineProgressLabel(0, 0), "no sections");
  eq("total 12 + 0 viewed → 'scroll to start · 12 sections'", outlineProgressLabel(0, 12), "scroll to start · 12 sections");
  eq("total 12 + 3 viewed → '3 of 12 viewed'", outlineProgressLabel(3, 12), "3 of 12 viewed");
  eq("total 12 + 12 viewed → 'all 12 viewed'", outlineProgressLabel(12, 12), "all 12 viewed");
  eq("total 12 + 99 viewed → 'all 12 viewed'", outlineProgressLabel(99, 12), "all 12 viewed");
}

console.log("\n--- truncateOutlineHeading ---");
{
  eq("short → unchanged", truncateOutlineHeading("Unit economics", 46), "Unit economics");
  eq("exactly 46 → unchanged", truncateOutlineHeading("a".repeat(46), 46), "a".repeat(46));
  eq("47 → truncated with …", truncateOutlineHeading("a".repeat(47), 46), "a".repeat(45) + "…");
  eq("60 → truncated", truncateOutlineHeading("a".repeat(60), 46).length, 46);
  eq("empty → empty", truncateOutlineHeading("", 46), "");
  eq("null → empty", truncateOutlineHeading(null as unknown as string, 46), "");
  eq("default max 46", truncateOutlineHeading("a".repeat(80)).length, 46);
  // Real-world long heading
  eq(
    "real long heading truncated",
    truncateOutlineHeading(
      "This is a very long heading about unit economics benchmarks for healthy DTC brands",
    ).length <= 46,
    true,
  );
}

console.log("\n--- outlineH2Count ---");
{
  const mixed = {
    rows: [],
    total: 8,
    h2Count: 3,
    h3Count: 5,
  } as OutlineSummary;
  eq("mixed → 3 H2", outlineH2Count(mixed), 3);
  const onlyH3 = {
    rows: [],
    total: 5,
    h2Count: 0,
    h3Count: 5,
  } as OutlineSummary;
  eq("only H3 → 0", outlineH2Count(onlyH3), 0);
}

console.log("\n--- DEFAULT_OUTLINE_VISIBLE_ROWS ---");
eq("default visible rows = 8", DEFAULT_OUTLINE_VISIBLE_ROWS, 8);

console.log("\n--- CANONICAL_DOCUMENT_OUTLINE pin ---");
eq("pin expectedMaxLevels = 2", CANONICAL_DOCUMENT_OUTLINE.expectedMaxLevels, 2);
eq("pin defaultMaxHeadingLength = 46", CANONICAL_DOCUMENT_OUTLINE.defaultMaxHeadingLength, 46);
eq("pin progressDisplayThreshold = 1", CANONICAL_DOCUMENT_OUTLINE.progressDisplayThreshold, 1);
eq("pin stubLabel non-empty", typeof CANONICAL_DOCUMENT_OUTLINE.stubLabel, "string");
eq("pin stubLabel is 'Loading outline…'", CANONICAL_DOCUMENT_OUTLINE.stubLabel, "Loading outline…");
eq("pin stubCaption non-empty", typeof CANONICAL_DOCUMENT_OUTLINE.stubCaption, "string");
eq("pin truncationSuffix = '…'", CANONICAL_DOCUMENT_OUTLINE.truncationSuffix, "…");

console.log("\n--- integration: realistic 18-section landscape doc ---");
{
  // 18 H2 sections, no H3, all common canonical DTC headings
  const headings = [
    "Executive Summary",
    "Unit Economics Benchmarks",
    "Acquisition Channel Mix",
    "Retention Stack",
    "Conversion & CRO",
    "Inventory & Ops",
    "AI & Automation",
    "Lifecycle Marketing",
    "International Expansion",
    "Marketplace Expansion",
    "3PL Migration",
    "Subscriptions",
    "Affiliate Program",
    "B2B Wholesale",
    "TikTok Shop Live",
    "Creator Economy",
    "Pinterest SEO",
    "Amazon DSP",
  ];
  const md =
    "# Title\n\n" +
    headings.map((h) => `## ${h}\n\nProse for ${h}.\n`).join("\n");
  const s = buildDocumentOutline(md);
  eq("18-section → total 18", s.total, 18);
  eq("18-section → h2Count 18", s.h2Count, 18);
  eq("18-section → h3Count 0", s.h3Count, 0);
  eq("18-section first heading", s.rows[0].heading, "Executive Summary");
  eq("18-section last heading", s.rows[17].heading, "Amazon DSP");
  eq("18-section hash deterministic", s.rows[0].hash, outlineSlugify("Executive Summary"));
}

console.log(`\n--- ${pass} passed · ${fail} failed ---`);
if (fail > 0) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);