/**
 * `recipe-reread.test.ts` — pure-logic tests for the Move #N.20
 * recipe-re-read progress tracker. Mirrors the `drift-fix-recipe.test.ts`
 * pattern.
 *
 * Covers: loadReReadMap (defensive parse), markReRead, clearReRead,
 * resetReReadForPlaybook, buildReReadSummary, reReadToneClass,
 * reReadHeadline, renderReReadMarkdown, reReadSectionTone,
 * reReadRowTone, reReadRelativeDay.
 *
 * Run with: `npx jiti src/lib/__tests__/recipe-reread.test.ts`
 */

import {
  buildReReadSummary,
  clearReRead,
  markReRead,
  reReadHeadline,
  reReadRelativeDay,
  reReadRowTone,
  reReadSectionTone,
  reReadToneClass,
  renderReReadMarkdown,
  resetReReadForPlaybook,
  type ReReadMap,
  type ReReadSummary,
} from "../recipe-reread";
import { buildDriftFixRecipe, type DriftFixRecipeSummary } from "../drift-fix-recipe";

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
function truthy(name: string, actual: unknown): void {
  if (actual) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    failures.push(`${name}: expected truthy, got ${JSON.stringify(actual)}`);
    console.log(`  ✗ ${name}: expected truthy, got ${JSON.stringify(actual)}`);
  }
}

// Fixture: two shipped playbooks with parsed sections.
const SHIPPED = [
  {
    id: "01-abandoned-cart",
    title: "Abandoned cart flow",
    driftDays: 97,
    numberedSections: [
      { heading: "TL;DR", body: "" },
      { heading: "Common pitfalls", body: "" },
      { heading: "How to ship", body: "" },
      { heading: "Verification", body: "" },
      { heading: "Why this matters", body: "" },
    ],
  },
  {
    id: "04-welcome-series",
    title: "Welcome series",
    driftDays: 12,
    numberedSections: [
      { heading: "Common pitfalls", body: "" },
      { heading: "Step-by-step", body: "" },
      { heading: "Verification", body: "" },
    ],
  },
];

function makeRecipe(): DriftFixRecipeSummary {
  return buildDriftFixRecipe(SHIPPED, 5, 3);
}

console.log("--- markReRead / clearReRead / resetReReadForPlaybook ---");
{
  let m: ReReadMap = {};
  m = markReRead(m, "01-abandoned-cart", "common-pitfalls");
  eq("mark one section: 1 entry", Object.keys(m).length, 1);
  eq("mark one section: 1 hash in playbook", Object.keys(m["01-abandoned-cart"]).length, 1);
  m = markReRead(m, "01-abandoned-cart", "how-to-ship");
  eq("mark second: 2 hashes", Object.keys(m["01-abandoned-cart"]).length, 2);
  m = markReRead(m, "04-welcome-series", "common-pitfalls");
  eq("mark across playbooks: 2 playbooks", Object.keys(m).length, 2);
  m = markReRead(m, "01-abandoned-cart", "common-pitfalls"); // idempotent
  eq("idempotent re-mark: still 2 hashes", Object.keys(m["01-abandoned-cart"]).length, 2);
  m = clearReRead(m, "01-abandoned-cart", "how-to-ship");
  eq("clear one: 1 hash left in playbook", Object.keys(m["01-abandoned-cart"]).length, 1);
  m = clearReRead(m, "01-abandoned-cart", "common-pitfalls");
  eq("clear last: playbook entry removed", m["01-abandoned-cart"] === undefined, true);
  m = markReRead(m, "01-abandoned-cart", "x");
  m = markReRead(m, "04-welcome-series", "y");
  m = resetReReadForPlaybook(m, "01-abandoned-cart");
  eq("reset playbook: 01 entry removed", m["01-abandoned-cart"] === undefined, true);
  eq("reset playbook: 04 still there", m["04-welcome-series"] !== undefined, true);
  // defensive: empty / whitespace inputs are no-ops
  const before = m;
  eq("mark empty id no-op", markReRead(m, "", "x"), before);
  eq("mark empty hash no-op", markReRead(m, "x", ""), before);
  eq("clear missing section no-op", clearReRead(m, "04-welcome-series", "nope"), before);
  eq("reset missing playbook no-op", resetReReadForPlaybook(m, "nope"), before);
}

console.log("\n--- buildReReadSummary (empty) ---");
{
  const recipe = makeRecipe();
  const s = buildReReadSummary(recipe, {});
  eq("empty: 0 totalMarks", s.totalMarks, 0);
  eq("empty: 0 withReRead", s.withReRead, 0);
  eq("empty: 0 fullyReRead", s.fullyReRead, 0);
  eq("empty: totalSections matches recipe", s.totalSections, recipe.rows.reduce((acc, r) => acc + r.readFirst.length, 0));
  // Note: with 0 marks every row IS incomplete, so worstIncompletePercent = 100
  // (the "no incomplete rows" case is covered by the all-fully-read block).
  eq("empty: worstIncompletePercent = 100 (every row incomplete)", s.worstIncompletePercent, 100);
}

console.log("\n--- buildReReadSummary (1 mark on playbook #1) ---");
{
  const recipe = makeRecipe();
  const now = new Date("2026-10-07T12:00:00Z");
  const reread: ReReadMap = markReRead(
    {},
    "01-abandoned-cart",
    "common-pitfalls",
    now
  );
  const s = buildReReadSummary(recipe, reread, now);
  const row1 = s.rows.find((r) => r.id === "01-abandoned-cart")!;
  const row2 = s.rows.find((r) => r.id === "04-welcome-series")!;
  eq("1 mark: totalMarks = 1", s.totalMarks, 1);
  eq("1 mark: withReRead = 1", s.withReRead, 1);
  eq("1 mark: fullyReRead = 0", s.fullyReRead, 0);
  eq("1 mark: row1 percent = 33", row1.percent, 33);
  eq("1 mark: row1 reReadCount = 1", row1.reReadCount, 1);
  eq("1 mark: row1 isFullyReRead = false", row1.isFullyReRead, false);
  eq("1 mark: row2 percent = 0", row2.percent, 0);
  eq("1 mark: row2 reReadCount = 0", row2.reReadCount, 0);
  eq("1 mark: row1 first section has reReadAt", row1.sections[0].reReadAt !== null, true);
  eq("1 mark: row1 first section reReadDaysAgo 0", row1.sections[0].reReadDaysAgo, 0);
  // worstIncomplete: row1 = 100 - 33 = 67, row2 = 100
  eq("1 mark: worstIncompletePercent = 100", s.worstIncompletePercent, 100);
}

console.log("\n--- buildReReadSummary (fully re-read) ---");
{
  const recipe = makeRecipe();
  let m: ReReadMap = {};
  for (const s of recipe.rows[0].readFirst) {
    m = markReRead(m, "01-abandoned-cart", s.hash);
  }
  const s = buildReReadSummary(recipe, m);
  const row1 = s.rows.find((r) => r.id === "01-abandoned-cart")!;
  eq("fully: row1 isFullyReRead = true", row1.isFullyReRead, true);
  eq("fully: row1 percent = 100", row1.percent, 100);
  eq("fully: fullyReRead count = 1", s.fullyReRead, 1);
  // row1 is fully re-read so it shouldn't contribute to worstIncomplete;
  // row2 = 0/3 = 0% → 100% incomplete → worst = 100
  eq("fully: worstIncompletePercent = 100 (from row2)", s.worstIncompletePercent, 100);
}

console.log("\n--- buildReReadSummary (all fully re-read) ---");
{
  const recipe = makeRecipe();
  let m: ReReadMap = {};
  for (const r of recipe.rows) {
    for (const s of r.readFirst) {
      m = markReRead(m, r.id, s.hash);
    }
  }
  const s = buildReReadSummary(recipe, m);
  eq("all fully: fullyReRead = 2", s.fullyReRead, 2);
  eq("all fully: worstIncompletePercent null (no incomplete rows)", s.worstIncompletePercent, null);
  eq("all fully: totalMarks = totalSections", s.totalMarks, s.totalSections);
}

console.log("\n--- reReadToneClass ---");
{
  const empty: ReReadSummary = {
    rows: [],
    totalShipped: 0,
    withReRead: 0,
    fullyReRead: 0,
    totalMarks: 0,
    totalSections: 0,
    worstIncompletePercent: null,
  };
  truthy("empty → border-border", reReadToneClass(empty).includes("border-border"));
  const noSections: ReReadSummary = { ...empty, totalShipped: 1, totalSections: 0 };
  truthy("no sections → border-border", reReadToneClass(noSections).includes("border-border"));
  const rose: ReReadSummary = {
    ...empty,
    totalShipped: 2,
    totalSections: 6,
    fullyReRead: 0,
    worstIncompletePercent: 100,
  };
  truthy("100% incomplete → rose", reReadToneClass(rose).includes("rose"));
  const amber: ReReadSummary = { ...rose, worstIncompletePercent: 60 };
  truthy("60% incomplete → amber", reReadToneClass(amber).includes("amber"));
  const emerald: ReReadSummary = { ...rose, worstIncompletePercent: 20 };
  truthy("20% incomplete → emerald", reReadToneClass(emerald).includes("emerald"));
  const allFull: ReReadSummary = { ...rose, fullyReRead: 2, worstIncompletePercent: null };
  truthy("all fully re-read → emerald", reReadToneClass(allFull).includes("emerald"));
}

console.log("\n--- reReadHeadline ---");
{
  const empty: ReReadSummary = {
    rows: [],
    totalShipped: 0,
    withReRead: 0,
    fullyReRead: 0,
    totalMarks: 0,
    totalSections: 0,
    worstIncompletePercent: null,
  };
  eq("0 shipped headline", reReadHeadline(empty), "No shipped playbooks yet");
  const noSec: ReReadSummary = { ...empty, totalShipped: 1 };
  eq("no sections headline", reReadHeadline(noSec), "No recipe sections to re-read yet");
  const someMarks: ReReadSummary = {
    ...empty,
    totalShipped: 2,
    totalSections: 6,
    withReRead: 1,
    fullyReRead: 0,
    totalMarks: 2,
  };
  truthy("partial marks headline mentions marks/sections", reReadHeadline(someMarks).includes("2 of 6"));
  const allFull: ReReadSummary = {
    ...empty,
    totalShipped: 2,
    totalSections: 6,
    withReRead: 2,
    fullyReRead: 2,
    totalMarks: 6,
  };
  truthy("all full headline says 'fully re-read'", reReadHeadline(allFull).includes("fully re-read"));
  const noneYet: ReReadSummary = { ...someMarks, withReRead: 0, totalMarks: 0 };
  truthy("none re-read headline mentions 'none re-read yet'", reReadHeadline(noneYet).includes("none re-read yet"));
}

console.log("\n--- renderReReadMarkdown ---");
{
  const recipe = makeRecipe();
  const s = buildReReadSummary(recipe, {});
  const md = renderReReadMarkdown(s);
  truthy("md has heading", md.includes("## Re-read progress"));
  truthy("md has table header", md.includes("| Playbook | Re-read | Last re-read |"));
  truthy("md has row for playbook 1", md.includes("Abandoned cart flow"));
  truthy("md has row for playbook 2", md.includes("Welcome series"));
  truthy("md has generated footer", md.includes("Generated"));
  truthy("md has count footer", md.includes("recipe sections marked"));
  // empty fallback
  const empty: ReReadSummary = {
    rows: [],
    totalShipped: 0,
    withReRead: 0,
    fullyReRead: 0,
    totalMarks: 0,
    totalSections: 0,
    worstIncompletePercent: null,
  };
  const mdEmpty = renderReReadMarkdown(empty);
  truthy("empty md fallback", mdEmpty.includes("No shipped playbooks yet"));
}

console.log("\n--- reReadSectionTone ---");
{
  const a = reReadSectionTone(null);
  eq("unread: label", a.label, "not re-read");
  truthy("unread: tone muted", a.tone.includes("border-border"));
  const b = reReadSectionTone("2026-10-07T10:00:00Z");
  eq("read: label", b.label, "re-read");
  truthy("read: tone emerald", b.tone.includes("emerald"));
}

console.log("\n--- reReadRowTone ---");
{
  truthy("0/0 muted", reReadRowTone(0, 0).includes("border-border"));
  truthy("0/3 muted", reReadRowTone(0, 3).includes("border-border"));
  truthy("1/3 amber", reReadRowTone(33, 3).includes("amber"));
  truthy("2/3 sky", reReadRowTone(67, 3).includes("sky"));
  truthy("3/3 emerald", reReadRowTone(100, 3).includes("emerald"));
}

console.log("\n--- reReadRelativeDay ---");
{
  const now = new Date("2026-10-07T12:00:00Z");
  eq("null → em-dash", reReadRelativeDay(null, now), "—");
  eq("invalid → em-dash", reReadRelativeDay("not a date", now), "—");
  eq("today", reReadRelativeDay("2026-10-07T01:00:00Z", now), "today");
  // floor(diff/day) means anything < 24h returns 0 → "today" (matches Move #N.16's relativeDay).
  // So "yesterday" needs a 25-47h-old timestamp.
  eq("yesterday (25h ago)", reReadRelativeDay("2026-10-06T11:00:00Z", now), "yesterday");
  eq("3d ago (3d 1h ago)", reReadRelativeDay("2026-10-04T11:00:00Z", now), "3d ago");
  eq("2w ago", reReadRelativeDay("2026-09-23T12:00:00Z", now), "2w ago");
  eq("2mo ago", reReadRelativeDay("2026-08-07T12:00:00Z", now), "2mo ago");
  eq("1y ago", reReadRelativeDay("2025-10-07T12:00:00Z", now), "1y ago");
}

console.log("\n--- invariant: reReadSummary rows match recipe rows ---");
{
  const recipe = makeRecipe();
  const s = buildReReadSummary(recipe, {});
  eq("rows length matches", s.rows.length, recipe.rows.length);
  for (let i = 0; i < s.rows.length; i++) {
    eq(`row[${i}].id matches`, s.rows[i].id, recipe.rows[i].id);
    eq(`row[${i}].totalSections matches`, s.rows[i].totalSections, recipe.rows[i].readFirst.length);
  }
}

console.log("\n--- invariant: id ordering preserved ---");
{
  const recipe = makeRecipe();
  const s = buildReReadSummary(recipe, {});
  eq("row 0 is playbook 1", s.rows[0].id, "01-abandoned-cart");
  eq("row 1 is playbook 2", s.rows[1].id, "04-welcome-series");
}

console.log(`\n=== recipe-reread: ${pass} pass, ${fail} fail ===`);
if (fail > 0) {
  console.error("FAILURES:");
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
