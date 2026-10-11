/**
 * Tests for `dashboard/src/lib/playbook-outline-wiring.ts` — Move #N.27.1
 * sticky `<DocumentOutline>` wiring decisions for `/playbooks/[slug]`.
 *
 * Run with: `npx jiti src/lib/__tests__/playbook-outline-wiring.test.ts`
 *
 * Coverage:
 *   - `PLAYBOOK_OUTLINE_WIRING` pin invariants (sticky offset /
 *     grid template / outer max-w / content max-w / data-attribute
 *     names / headline prefix — so a future tick can't quietly drop
 *     the sticky offset, change the column ratio, or rename the
 *     "Playbook outline" prefix without bumping the canonical pin)
 *   - `PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH` (46 — same as
 *     `CANONICAL_DOCUMENT_OUTLINE.defaultMaxHeadingLength`)
 *   - `playbookOutlineIsWorthMounting` 4 cases (0 rows / 1 row /
 *     2 rows / many rows)
 *   - `playbookOutlineContentColumnClass` (re-export of content
 *     max-w so the wiring contract is grep-able from the playbook
 *     context)
 *   - Integration: realistic playbook markdown body extracted via
 *     the existing `buildDocumentOutline` lib produces a summary
 *     that the wiring helper accepts / rejects correctly
 *
 * The actual `<DocumentOutline>` component is tested separately in
 * `src/lib/__tests__/document-outline.test.ts`. This file is about
 * the playbook-page-specific wiring decisions.
 */

import {
  buildDocumentOutline,
  type OutlineSummary,
} from "../document-outline";
import {
  PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH,
  PLAYBOOK_OUTLINE_WIRING,
  playbookOutlineContentColumnClass,
  playbookOutlineIsWorthMounting,
} from "../playbook-outline-wiring";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PLAYBOOK_OUTLINE_WIRING pin invariants
// ─────────────────────────────────────────────────────────────────────────
console.log("\n— PLAYBOOK_OUTLINE_WIRING pin invariants —");

check(
  "stickyTopClass pins to top-20 (matches site header height)",
  PLAYBOOK_OUTLINE_WIRING.stickyTopClass === "top-20",
);

check(
  "gridTemplateClass pins to md:grid-cols-[220px_minmax(0,1fr)]",
  PLAYBOOK_OUTLINE_WIRING.gridTemplateClass === "md:grid-cols-[220px_minmax(0,1fr)]",
);

check(
  "gridGapClass pins to gap-6",
  PLAYBOOK_OUTLINE_WIRING.gridGapClass === "gap-6",
);

check(
  "sidebarOrderClass pins to order-1 md:order-1 (left on desktop, top on mobile)",
  PLAYBOOK_OUTLINE_WIRING.sidebarOrderClass === "order-1 md:order-1",
);

check(
  "contentOrderClass pins to order-2 md:order-2 (right on desktop, below on mobile)",
  PLAYBOOK_OUTLINE_WIRING.contentOrderClass === "order-2 md:order-2",
);

check(
  "autoExpandFirstNH2s pins to 2 (matches research + skill pages)",
  PLAYBOOK_OUTLINE_WIRING.autoExpandFirstNH2s === 2,
);

check(
  "outerMaxWidthClass pins to max-w-5xl (raised from max-w-3xl for 2-col grid)",
  PLAYBOOK_OUTLINE_WIRING.outerMaxWidthClass === "max-w-5xl",
);

check(
  "contentMaxWidthClass pins to max-w-3xl (prose line-length)",
  PLAYBOOK_OUTLINE_WIRING.contentMaxWidthClass === "max-w-3xl",
);

check(
  "documentBodyAttribute pins to data-document-body",
  PLAYBOOK_OUTLINE_WIRING.documentBodyAttribute === "data-document-body",
);

check(
  "documentBodyValue pins to 'true'",
  PLAYBOOK_OUTLINE_WIRING.documentBodyValue === "true",
);

check(
  "headlinePrefix pins to 'Playbook outline' (vs default 'Document outline')",
  PLAYBOOK_OUTLINE_WIRING.headlinePrefix === "Playbook outline",
);

// ─────────────────────────────────────────────────────────────────────────
// Heading-truncation length
// ─────────────────────────────────────────────────────────────────────────
console.log("\n— Heading-truncation length —");

check(
  "PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH is 46 (matches CANONICAL_DOCUMENT_OUTLINE)",
  PLAYBOOK_OUTLINE_DEFAULT_MAX_HEADING_LENGTH === 46,
);

// ─────────────────────────────────────────────────────────────────────────
// playbookOutlineIsWorthMounting — guard against too-short playbooks
// ─────────────────────────────────────────────────────────────────────────
console.log("\n— playbookOutlineIsWorthMounting —");

const emptySummary: OutlineSummary = {
  rows: [],
  total: 0,
  h2Count: 0,
  h3Count: 0,
};

const oneRowSummary: OutlineSummary = {
  rows: [{ level: 2, heading: "Only section", hash: "only-section", index: 0 }],
  total: 1,
  h2Count: 1,
  h3Count: 0,
};

const twoRowSummary: OutlineSummary = {
  rows: [
    { level: 2, heading: "Section A", hash: "section-a", index: 0 },
    { level: 2, heading: "Section B", hash: "section-b", index: 1 },
  ],
  total: 2,
  h2Count: 2,
  h3Count: 0,
};

check(
  "0 H2 rows → false (no outline)",
  playbookOutlineIsWorthMounting(emptySummary) === false,
);

check(
  "1 H2 row → false (single-row outline is noise)",
  playbookOutlineIsWorthMounting(oneRowSummary) === false,
);

check(
  "2 H2 rows → true (smallest worthwhile case)",
  playbookOutlineIsWorthMounting(twoRowSummary) === true,
);

check(
  "50 H2 rows → true (long playbook, definitely worthwhile)",
  playbookOutlineIsWorthMounting({
    rows: Array.from({ length: 50 }, (_, i) => ({
      level: 2 as const,
      heading: `Section ${i}`,
      hash: `section-${i}`,
      index: i,
    })),
    total: 50,
    h2Count: 50,
    h3Count: 0,
  }) === true,
);

// ─────────────────────────────────────────────────────────────────────────
// playbookOutlineContentColumnClass — re-export of content max-w
// ─────────────────────────────────────────────────────────────────────────
console.log("\n— playbookOutlineContentColumnClass —");

check(
  "contentColumnClass re-exports PLAYBOOK_OUTLINE_WIRING.contentMaxWidthClass",
  playbookOutlineContentColumnClass === "max-w-3xl",
);

check(
  "contentColumnClass is string",
  typeof playbookOutlineContentColumnClass === "string",
);

// ─────────────────────────────────────────────────────────────────────────
// Integration: realistic playbook markdown body
// ─────────────────────────────────────────────────────────────────────────
console.log("\n— Integration: realistic playbook markdown —");

const abandonCartBody = `# 01 Abandoned Cart Flow — Klaviyo

This is the lead paragraph, ignored by the outline builder.

## Why this playbook matters

The cart-abandon rate is 65-75% across DTC.

### The CVR gap

Most operators don't know their per-flow CVR.

### The flow cap

3 active flows is the safe ceiling.

## The 5-email flow

Welcome → Browse → Cart → Social Proof → Last Chance.

### Subject-line rules

Under 40 chars, name + benefit + urgency.

## Pre-flight checklist

Before turning the flow on.

## Realized ROI ledger

How to log actuals.
`;

const abandonCartSummary = buildDocumentOutline(abandonCartBody);

check(
  "abandon-cart markdown: H1 skipped, 4 H2s + 3 H3s extracted",
  abandonCartSummary.total === 7 &&
    abandonCartSummary.h2Count === 4 &&
    abandonCartSummary.h3Count === 3,
);

check(
  "abandon-cart outline is worth mounting (7 rows ≥ 2)",
  playbookOutlineIsWorthMounting(abandonCartSummary) === true,
);

// Short playbook (1 H2) should not mount
const shortPlaybookBody = `# Short Playbook

Lead paragraph.

## Only one section

Body text.
`;

const shortSummary = buildDocumentOutline(shortPlaybookBody);

check(
  "short-playbook markdown: 1 H2 extracted",
  shortSummary.total === 1 && shortSummary.h2Count === 1,
);

check(
  "short-playbook outline is NOT worth mounting (1 row < 2)",
  playbookOutlineIsWorthMounting(shortSummary) === false,
);

// ─────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────
console.log(`\n— Summary — ${passed} passed, ${failed} failed —`);
if (failed > 0) {
  console.error("\nFailures:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("OK");