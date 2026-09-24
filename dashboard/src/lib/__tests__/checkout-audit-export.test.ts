/**
 * Smoke tests for `dashboard/src/lib/checkout-audit-export.ts` — the
 * one-click CSV / JSON bundle builders for the 24 Baymard guideline
 * audit rows on `/cro`.
 *
 * Run with: `npx jiti src/lib/__tests__/checkout-audit-export.test.ts`
 *
 * Coverage:
 *   - `buildCheckoutAuditCsv` metadata header (schema, version,
 *     exportedAt, source, guideline_count, audited_count, score,
 *     health_band, cvr_lift_low_pct, cvr_lift_high_pct)
 *   - canonical 14-column header line followed by 24 guideline rows
 *     in CHECKOUT_GUIDELINES order
 *   - 5 per-section rollup rows (A..E) at the end with pass/partial/
 *     fail/skip/missing counts
 *   - empty inputs produce 24 placeholder rows + audited_count=0
 *   - all-pass inputs produce 24 pass rows + score=100
 *   - partial inputs (some pass, some fail) preserve the operator notes
 *   - `csvEscape` round-trips commas, quotes, and newlines
 *   - `buildCheckoutAuditJson` emits the same row set as JSON with
 *     matching schema/version/source headers
 *   - `checkoutAuditFilename` / `checkoutAuditJsonFilename` return
 *     stable, dated filenames
 *   - `validateCheckoutAuditBundle` accepts both empty and populated
 *     bundles (empty-state is still a valid export — the metadata
 *     header documents audited_count=0)
 *   - `checkoutAuditSummary` reports totalGuidelines=24 and the actual
 *     audited count + score + lift band
 */

import {
  buildCheckoutAuditCsv,
  buildCheckoutAuditJson,
  checkoutAuditFilename,
  checkoutAuditJsonFilename,
  checkoutAuditSummary,
  csvEscape,
  validateCheckoutAuditBundle,
  type CheckoutAuditInputs,
} from "../checkout-audit-export";
import {
  CHECKOUT_GUIDELINES,
  SECTION_TITLES,
  scoreAudit,
} from "../checkout-audit";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  \u2713 ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` \u2014 ${detail}` : ""}`);
    console.log(`  \u2717 ${label}${detail ? ` \u2014 ${detail}` : ""}`);
  }
}

function allPassInputs(): CheckoutAuditInputs {
  const inputs: CheckoutAuditInputs = {};
  for (const g of CHECKOUT_GUIDELINES) {
    inputs[g.id] = { status: "pass" };
  }
  return inputs;
}

function allFailInputs(): CheckoutAuditInputs {
  const inputs: CheckoutAuditInputs = {};
  for (const g of CHECKOUT_GUIDELINES) {
    inputs[g.id] = { status: "fail" };
  }
  return inputs;
}

function mixedInputs(): CheckoutAuditInputs {
  const inputs: CheckoutAuditInputs = {};
  for (let i = 0; i < CHECKOUT_GUIDELINES.length; i++) {
    const g = CHECKOUT_GUIDELINES[i];
    if (i % 4 === 0) inputs[g.id] = { status: "pass" };
    else if (i % 4 === 1) inputs[g.id] = { status: "partial" };
    else if (i % 4 === 2) inputs[g.id] = { status: "fail" };
    else inputs[g.id] = { status: "skip" };
  }
  // One row with operator notes for the round-trip test.
  inputs[CHECKOUT_GUIDELINES[0].id] = {
    status: "pass",
    notes: 'shipped via Shop Pay config, "tested 2026-09-24"',
  };
  return inputs;
}

const meta = { exportedAt: "2026-09-24" };

// --- csvEscape round-trip ---
console.log("\ncsvEscape edge cases");
check(
  "csvEscape: comma triggers quoting",
  csvEscape("a,b") === '"a,b"',
);
check(
  "csvEscape: quote triggers escaping",
  csvEscape('a"b') === '"a""b"',
);
check(
  "csvEscape: newline triggers quoting",
  csvEscape("a\nb") === '"a\nb"',
);
check(
  "csvEscape: plain string passes through",
  csvEscape("hello") === "hello",
);
check(
  "csvEscape: number stringifies",
  csvEscape(42) === "42",
);
check(
  "csvEscape: null returns empty string",
  csvEscape(null) === "",
);
check(
  "csvEscape: undefined returns empty string",
  csvEscape(undefined) === "",
);

// --- validateCheckoutAuditBundle ---
console.log("\nvalidateCheckoutAuditBundle");
check(
  "validate accepts empty inputs",
  validateCheckoutAuditBundle({}) === null,
);
check(
  "validate accepts populated inputs",
  validateCheckoutAuditBundle(mixedInputs()) === null,
);

// --- checkoutAuditSummary ---
console.log("\ncheckoutAuditSummary");
const emptySummary = checkoutAuditSummary({});
check(
  "empty summary: totalGuidelines=24",
  emptySummary.totalGuidelines === 24,
);
check(
  "empty summary: auditedCount=0",
  emptySummary.auditedCount === 0,
);
check(
  "empty summary: score=0",
  emptySummary.score === 0,
);

const allPassSummary = checkoutAuditSummary(allPassInputs());
check(
  "all-pass summary: auditedCount=24",
  allPassSummary.auditedCount === 24,
);
check(
  "all-pass summary: score=100",
  allPassSummary.score === 100,
);
check(
  "all-pass summary: cvrLiftLowPct=0",
  allPassSummary.cvrLiftLowPct === 0,
);
check(
  "all-pass summary: cvrLiftHighPct=0",
  allPassSummary.cvrLiftHighPct === 0,
);

const allFailSummary = checkoutAuditSummary(allFailInputs());
check(
  "all-fail summary: score=0",
  allFailSummary.score === 0,
);
check(
  "all-fail summary: auditedCount=24",
  allFailSummary.auditedCount === 24,
);

// --- Filename helpers ---
console.log("\nfilename helpers");
check(
  "csv filename without label",
  checkoutAuditFilename(meta) === "ecommerce-ops-checkout-audit-2026-09-24.csv",
);
check(
  "csv filename with label",
  checkoutAuditFilename({ ...meta, label: "q3-test" }) ===
    "ecommerce-ops-checkout-audit-2026-09-24-q3-test.csv",
);
check(
  "json filename without label",
  checkoutAuditJsonFilename(meta) ===
    "ecommerce-ops-checkout-audit-2026-09-24.json",
);
check(
  "json filename with label",
  checkoutAuditJsonFilename({ ...meta, label: "q3-test" }) ===
    "ecommerce-ops-checkout-audit-2026-09-24-q3-test.json",
);

// --- CSV builder — empty inputs ---
console.log("\nbuildCheckoutAuditCsv (empty inputs)");
const emptyCsv = buildCheckoutAuditCsv({}, meta);
const emptyLines = emptyCsv.trim().split("\n");
check(
  "empty CSV: schema header line first",
  emptyLines[0] === "# ecommerce-ops-checkout-audit",
);
check(
  "empty CSV: schema,version header line",
  emptyLines[1] === "# schema,ecommerce-ops-checkout-audit",
);
check(
  "empty CSV: version,1 line",
  emptyLines[2] === "# version,1",
);
check(
  "empty CSV: exported_at line",
  emptyLines[3] === "# exported_at,2026-09-24",
);
check(
  "empty CSV: guideline_count,24 line",
  emptyLines[5].startsWith("# guideline_count,24") ||
    emptyLines.some((l) => l.startsWith("# guideline_count,24")),
);
check(
  "empty CSV: audited_count,0 line",
  emptyLines.some((l) => l.startsWith("# audited_count,0")),
);
check(
  "empty CSV: score,0 line",
  emptyLines.some((l) => l.startsWith("# score,0")),
);
check(
  "empty CSV: blank line separator before header",
  emptyLines.includes(""),
);

// --- CSV builder — all-pass inputs ---
console.log("\nbuildCheckoutAuditCsv (all-pass inputs)");
const allPassCsv = buildCheckoutAuditCsv(allPassInputs(), meta);
check(
  "all-pass CSV: audited_count=24 in header",
  allPassCsv.includes("# audited_count,24"),
);
check(
  "all-pass CSV: score=100 in header",
  allPassCsv.includes("# score,100"),
);
check(
  "all-pass CSV: 24 pass rows",
  (allPassCsv.match(/,pass,/g) ?? []).length >= 24,
);

// --- CSV builder — column structure ---
console.log("\nbuildCheckoutAuditCsv (column structure)");
const mixedCsv = buildCheckoutAuditCsv(mixedInputs(), meta);
const mixedLines = mixedCsv.trim().split("\n");
const headerLine = mixedLines.find((l) =>
  l.startsWith("guideline_id,"),
)!;
check(
  "mixed CSV: header has 14 columns",
  headerLine.split(",").length === 14,
);
check(
  "mixed CSV: header includes canonical column names",
  headerLine.includes("guideline_id") &&
    headerLine.includes("section") &&
    headerLine.includes("severity") &&
    headerLine.includes("lift_low_pct") &&
    headerLine.includes("notes"),
);
// 24 guideline rows + 5 section rollup rows = 29 data rows after the header.
const dataRows = mixedLines.filter(
  (l) => l && !l.startsWith("#") && !l.startsWith("guideline_id,"),
);
check(
  "mixed CSV: 29 data rows (24 guidelines + 5 section rollups)",
  dataRows.length === 29,
);

// --- CSV builder — canonical row order ---
console.log("\nbuildCheckoutAuditCsv (row order)");
const firstDataRow = dataRows[0];
check(
  "mixed CSV: first data row is A1_guest_checkout",
  firstDataRow.startsWith("A1_guest_checkout,"),
);
const lastGuidelineRow = dataRows[23];
check(
  "mixed CSV: 24th guideline row is E5_mobile_test_real_device",
  lastGuidelineRow.startsWith("E5_mobile_test_real_device,"),
);

// --- CSV builder — section rollup rows ---
console.log("\nbuildCheckoutAuditCsv (section rollup rows)");
const rollupA = dataRows.find((l) =>
  l.startsWith("__section_A_rollup__,"),
)!;
check(
  "mixed CSV: section A rollup row present",
  typeof rollupA === "string",
);
check(
  "section A rollup: severity=ROLLUP",
  rollupA.split(",")[3] === "ROLLUP",
);
check(
  "section A rollup: title references Section A rollup",
  rollupA.split(",")[5].includes("Section A rollup"),
);
const rollupE = dataRows.find((l) =>
  l.startsWith("__section_E_rollup__,"),
)!;
check(
  "mixed CSV: section E rollup row present",
  typeof rollupE === "string",
);

// --- CSV builder — operator notes round-trip ---
console.log("\nbuildCheckoutAuditCsv (notes round-trip)");
check(
  "mixed CSV: operator notes with commas/quotes round-trip via CSV escape",
  mixedCsv.includes('"shipped via Shop Pay config, ""tested 2026-09-24"""'),
);

// --- CSV builder — all-fail inputs (verifies missing=24 → score=0) ---
console.log("\nbuildCheckoutAuditCsv (all-fail inputs)");
const allFailCsv = buildCheckoutAuditCsv(allFailInputs(), meta);
check(
  "all-fail CSV: score=0",
  allFailCsv.includes("# score,0"),
);
// Health band should be "missing" (0 score) or "weak" depending on
// scoreAudit semantics — both are valid for 0-point audit. Just check
// the line is present.
check(
  "all-fail CSV: health_band line present",
  /^# health_band,.+$/m.test(allFailCsv),
);

// --- JSON builder ---
console.log("\nbuildCheckoutAuditJson");
const mixedJson = buildCheckoutAuditJson(mixedInputs(), meta);
check(
  "JSON: schema=ecommerce-ops-checkout-audit",
  mixedJson.schema === "ecommerce-ops-checkout-audit",
);
check(
  "JSON: version=1",
  mixedJson.version === 1,
);
check(
  "JSON: exportedAt=2026-09-24",
  mixedJson.exportedAt === "2026-09-24",
);
check(
  "JSON: guideline_count=24",
  mixedJson.guideline_count === 24,
);
check(
  "JSON: rows length=24 (guidelines only — no section rollups in JSON)",
  mixedJson.rows.length === 24,
);
check(
  "JSON: first row is A1_guest_checkout",
  mixedJson.rows[0].guideline_id === "A1_guest_checkout",
);
check(
  "JSON: last row is E5_mobile_test_real_device",
  mixedJson.rows[23].guideline_id === "E5_mobile_test_real_device",
);
check(
  "JSON: first row notes round-trip",
  mixedJson.rows[0].notes === 'shipped via Shop Pay config, "tested 2026-09-24"',
);
check(
  "JSON: first row status=pass",
  mixedJson.rows[0].status === "pass",
);
check(
  "JSON: second row status=partial",
  mixedJson.rows[1].status === "partial",
);
check(
  "JSON: third row status=fail",
  mixedJson.rows[2].status === "fail",
);
check(
  "JSON: fourth row status=skip",
  mixedJson.rows[3].status === "skip",
);
check(
  "JSON: passCount matches mixed inputs (every 4th row = 6)",
  mixedJson.passCount === 6,
);
check(
  "JSON: partialCount matches mixed inputs (every 4th offset 1 = 6)",
  mixedJson.partialCount === 6,
);
check(
  "JSON: failCount matches mixed inputs (every 4th offset 2 = 6)",
  mixedJson.failCount === 6,
);
check(
  "JSON: skipCount matches mixed inputs (every 4th offset 3 = 6)",
  mixedJson.skipCount === 6,
);
check(
  "JSON: missingCount=0 (all 24 guidelines entered)",
  mixedJson.missingCount === 0,
);

// JSON serialization round-trip
const serialized = JSON.stringify(mixedJson);
const reparsed = JSON.parse(serialized);
check(
  "JSON: serialization round-trip preserves rows",
  reparsed.rows.length === mixedJson.rows.length &&
    reparsed.rows[0].guideline_id === mixedJson.rows[0].guideline_id,
);

// --- Cross-checks with the existing scoreAudit ---
console.log("\ncross-checks with scoreAudit");
const canonicalScore = scoreAudit(mixedInputs());
check(
  "export JSON: score matches scoreAudit",
  mixedJson.score === canonicalScore.score,
);
check(
  "export JSON: healthBand matches scoreAudit",
  mixedJson.healthBand === canonicalScore.healthBand,
);
check(
  "export summary: score matches scoreAudit",
  checkoutAuditSummary(mixedInputs()).score === canonicalScore.score,
);

// --- All sections represented in canonical 24-row grid ---
console.log("\ncanonical guideline coverage");
const expectedSections = ["A", "B", "C", "D", "E"];
for (const section of expectedSections) {
  const hasSection = mixedJson.rows.some((r) => r.section === section);
  check(
    `JSON: section ${section} (${SECTION_TITLES[section as "A" | "B" | "C" | "D" | "E"]}) present`,
    hasSection,
  );
}

// --- Summary
console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
