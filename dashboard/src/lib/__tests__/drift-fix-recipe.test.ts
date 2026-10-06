/**
 * `drift-fix-recipe.test.ts` — pure-logic tests for the Move #N.18
 * drift-fix-recipe rollup.
 *
 * Covers: sectionPriority, headingToHash, buildDriftFixRecipe,
 * recipeToneClass, recipeHeadline, renderRecipeMarkdown, findPlaybook.
 *
 * Run with: `npx jiti src/lib/__tests__/drift-fix-recipe.test.ts`
 */

import {
  buildDriftFixRecipe,
  findPlaybook,
  headingToHash,
  recipeHeadline,
  recipeToneClass,
  renderRecipeMarkdown,
  sectionPriority,
  type DriftFixRecipeSummary,
} from "../drift-fix-recipe";
import type { Playbook } from "../content";

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

console.log("--- sectionPriority ---");
eq("Common pitfalls → pitfalls 100", sectionPriority("Common pitfalls").label, "pitfalls");
eq("Common pitfalls matched", sectionPriority("Common pitfalls").matched, true);
eq("How to ship → ship recipe 95", sectionPriority("How to ship").label, "ship recipe");
eq("Verification → verification 90", sectionPriority("Verification gates").label, "verification");
eq("What to ship → ship list 88", sectionPriority("What to ship").label, "ship list");
eq("Step-by-step → step-by-step 80", sectionPriority("Step-by-step").label, "step-by-step");
eq("How it works → how it works 70", sectionPriority("How it works").label, "how it works");
eq("Implementation → implementation 68", sectionPriority("Implementation notes").label, "implementation");
eq("ROI section → roi 20", sectionPriority("Year-1 ROI").label, "roi");
eq("Why → why 5", sectionPriority("Why this matters").label, "why");
eq("Intro → intro 3", sectionPriority("Intro").label, "intro");
eq("TL;DR → tl;dr 2", sectionPriority("TL;DR").label, "tl;dr");
eq("Unmatched → section weight 0", sectionPriority("Totally novel heading").weight, 0);
eq("Unmatched → section matched false", sectionPriority("Totally novel heading").matched, false);
eq("Empty heading → unmatched", sectionPriority("").matched, false);
eq("Case-insensitive: COMMON PITFALLS", sectionPriority("COMMON PITFALLS").label, "pitfalls");
eq("Common pitfalls wins over Step-by-step", sectionPriority("Common pitfalls").weight > sectionPriority("Step-by-step").weight, true);

console.log("\n--- headingToHash ---");
eq("Simple heading", headingToHash("Common pitfalls"), "common-pitfalls");
eq("Heading with apostrophe-stripped", headingToHash("Don't ship it"), "dont-ship-it");
eq("Heading with multiple spaces", headingToHash("How  it  works"), "how-it-works");
eq("Empty heading → empty", headingToHash(""), "");
eq("Special chars stripped", headingToHash("Step-by-step (Day 1)"), "step-by-step-day-1");
eq("Numbered heading", headingToHash("1. Why this matters"), "1-why-this-matters");

console.log("\n--- buildDriftFixRecipe (empty) ---");
{
  const s = buildDriftFixRecipe([], 5, 3);
  eq("empty rows length", s.rows.length, 0);
  eq("empty totalShipped", s.totalShipped, 0);
  eq("empty withRecipe", s.withRecipe, 0);
  eq("empty noSections", s.noSections, 0);
  eq("empty maxDriftDays", s.maxDriftDays, null);
}

console.log("\n--- buildDriftFixRecipe (1 row, Common pitfalls wins) ---");
{
  const shipped = [
    {
      id: "01-abandoned-cart",
      title: "Abandoned-Cart Klaviyo",
      driftDays: 120,
      numberedSections: [
        { heading: "TL;DR", body: "x" },
        { heading: "Why this matters", body: "x" },
        { heading: "Step-by-step", body: "x" },
        { heading: "Common pitfalls", body: "x" },
        { heading: "Verification gates", body: "x" },
      ],
    },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 3);
  eq("1 row", s.rows.length, 1);
  eq("totalShipped", s.totalShipped, 1);
  eq("withRecipe", s.withRecipe, 1);
  eq("maxDriftDays", s.maxDriftDays, 120);
  eq("readFirst[0] is Common pitfalls", s.rows[0].readFirst[0].heading, "Common pitfalls");
  eq("readFirst[0] label is pitfalls", s.rows[0].readFirst[0].label, "pitfalls");
  eq("readFirst[0] hash is common-pitfalls", s.rows[0].readFirst[0].hash, "common-pitfalls");
  eq("readFirst[1] is Verification gates", s.rows[0].readFirst[1].heading, "Verification gates");
  eq("readFirst[2] is Step-by-step", s.rows[0].readFirst[2].heading, "Step-by-step");
  eq("readFirst[3] undefined (only 3 returned)", s.rows[0].readFirst[3], undefined);
  eq("totalSections 5", s.rows[0].totalSections, 5);
}

console.log("\n--- buildDriftFixRecipe (How to ship wins) ---");
{
  const shipped = [
    {
      id: "02-ppu",
      title: "Post-Purchase Upsell",
      driftDays: 60,
      numberedSections: [
        { heading: "Why", body: "x" },
        { heading: "How to ship", body: "x" },
        { heading: "Verification", body: "x" },
        { heading: "Tactics", body: "x" },
      ],
    },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 3);
  eq("readFirst[0] is How to ship", s.rows[0].readFirst[0].heading, "How to ship");
  eq("readFirst[1] is Verification", s.rows[0].readFirst[1].heading, "Verification");
  eq("readFirst[2] is Tactics", s.rows[0].readFirst[2].heading, "Tactics");
}

console.log("\n--- buildDriftFixRecipe (drift null) ---");
{
  const shipped = [
    {
      id: "x",
      title: "X",
      driftDays: null,
      numberedSections: [{ heading: "Common pitfalls", body: "x" }],
    },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 3);
  eq("drift null propagated", s.rows[0].driftDays, null);
  eq("maxDriftDays null", s.maxDriftDays, null);
}

console.log("\n--- buildDriftFixRecipe (no sections) ---");
{
  const shipped = [
    { id: "x", title: "X", driftDays: 30, numberedSections: [] },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 3);
  eq("no sections → readFirst empty", s.rows[0].readFirst.length, 0);
  eq("noSections count", s.noSections, 1);
  eq("withRecipe count", s.withRecipe, 0);
}

console.log("\n--- buildDriftFixRecipe (maxRows cap) ---");
{
  const shipped = [
    { id: "a", title: "A", driftDays: 200, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
    { id: "b", title: "B", driftDays: 150, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
    { id: "c", title: "C", driftDays: 100, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
    { id: "d", title: "D", driftDays: 50, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
    { id: "e", title: "E", driftDays: 25, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
    { id: "f", title: "F", driftDays: 5, numberedSections: [{ heading: "Common pitfalls", body: "x" }] },
  ];
  const s = buildDriftFixRecipe(shipped, 3, 3);
  eq("rows length capped at 3", s.rows.length, 3);
  eq("totalShipped still 6", s.totalShipped, 6);
  eq("first row highest drift", s.rows[0].id, "a");
  eq("maxDriftDays is highest", s.maxDriftDays, 200);
  const s2 = buildDriftFixRecipe(shipped, 0, 3);
  eq("maxRows 0 → 0 rows", s2.rows.length, 0);
}

console.log("\n--- buildDriftFixRecipe (maxSectionsPerRow cap) ---");
{
  const shipped = [
    {
      id: "a",
      title: "A",
      driftDays: 10,
      numberedSections: [
        { heading: "Common pitfalls", body: "x" },
        { heading: "How to ship", body: "x" },
        { heading: "Verification", body: "x" },
        { heading: "Step-by-step", body: "x" },
        { heading: "Tactics", body: "x" },
      ],
    },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 2);
  eq("readFirst capped at 2", s.rows[0].readFirst.length, 2);
  eq("totalSections still 5", s.rows[0].totalSections, 5);
  const sMin = buildDriftFixRecipe(shipped, 5, 1);
  eq("readFirst min cap 1", sMin.rows[0].readFirst.length, 1);
}

console.log("\n--- buildDriftFixRecipe (maxDriftDays skips nulls) ---");
{
  const shipped = [
    { id: "a", title: "A", driftDays: null, numberedSections: [] },
    { id: "b", title: "B", driftDays: 50, numberedSections: [] },
  ];
  const s = buildDriftFixRecipe(shipped, 5, 3);
  eq("maxDriftDays ignores null", s.maxDriftDays, 50);
}

console.log("\n--- buildDriftFixRecipe (deterministic on equal weights) ---");
{
  const shipped = [
    {
      id: "a",
      title: "A",
      driftDays: 10,
      numberedSections: [
        { heading: "Common pitfalls", body: "x" },
        { heading: "Verification", body: "x" },
      ],
    },
  ];
  const s1 = buildDriftFixRecipe(shipped, 5, 3);
  const s2 = buildDriftFixRecipe(shipped, 5, 3);
  eq("deterministic[0]", s1.rows[0].readFirst[0].heading, s2.rows[0].readFirst[0].heading);
  eq("deterministic[1]", s1.rows[0].readFirst[1].heading, s2.rows[0].readFirst[1].heading);
}

console.log("\n--- recipeToneClass ---");
eq("tone rose for >90d", recipeToneClass({ rows: [{ driftDays: 100 } as never], maxDriftDays: 100, totalShipped: 1, withRecipe: 1, noSections: 0 }), "border-rose-500/30 bg-rose-500/5");
eq("tone amber for 30-90d", recipeToneClass({ rows: [{ driftDays: 60 } as never], maxDriftDays: 60, totalShipped: 1, withRecipe: 1, noSections: 0 }), "border-amber-500/30 bg-amber-500/5");
eq("tone emerald for ≤30d", recipeToneClass({ rows: [{ driftDays: 10 } as never], maxDriftDays: 10, totalShipped: 1, withRecipe: 1, noSections: 0 }), "border-emerald-500/30 bg-emerald-500/5");
eq("tone neutral for null drift", recipeToneClass({ rows: [{ driftDays: null } as never], maxDriftDays: null, totalShipped: 1, withRecipe: 1, noSections: 0 }), "border-border bg-card");
eq("tone neutral for 0 rows", recipeToneClass({ rows: [], maxDriftDays: null, totalShipped: 0, withRecipe: 0, noSections: 0 }), "border-border bg-card");
eq("boundary drift=90 → amber (not rose)", recipeToneClass({ rows: [{ driftDays: 90 } as never], maxDriftDays: 90, totalShipped: 1, withRecipe: 1, noSections: 0 }).includes("amber"), true);
eq("boundary drift=91 → rose", recipeToneClass({ rows: [{ driftDays: 91 } as never], maxDriftDays: 91, totalShipped: 1, withRecipe: 1, noSections: 0 }).includes("rose"), true);
eq("boundary drift=30 → emerald", recipeToneClass({ rows: [{ driftDays: 30 } as never], maxDriftDays: 30, totalShipped: 1, withRecipe: 1, noSections: 0 }).includes("emerald"), true);
eq("boundary drift=31 → amber", recipeToneClass({ rows: [{ driftDays: 31 } as never], maxDriftDays: 31, totalShipped: 1, withRecipe: 1, noSections: 0 }).includes("amber"), true);

console.log("\n--- recipeHeadline ---");
eq("0 shipped headline", recipeHeadline({ rows: [], maxDriftDays: null, totalShipped: 0, withRecipe: 0, noSections: 0 }), "No shipped playbooks yet");
eq("all with recipe", recipeHeadline({ rows: [{ driftDays: 5 } as never], maxDriftDays: 5, totalShipped: 1, withRecipe: 1, noSections: 0 }), "1 shipped · all have a re-read recipe");
eq("partial with recipe", recipeHeadline({ rows: [{ driftDays: 5 } as never], maxDriftDays: 5, totalShipped: 3, withRecipe: 2, noSections: 1 }), "2 of 3 shipped have a re-read recipe");
eq("all no sections", recipeHeadline({ rows: [{ driftDays: 5 } as never], maxDriftDays: 5, totalShipped: 2, withRecipe: 0, noSections: 2 }), "2 shipped · sections not yet parsed");
eq("multi with-recipe headline", recipeHeadline({ rows: [{ driftDays: 5 } as never, { driftDays: 10 } as never] as never, maxDriftDays: 10, totalShipped: 2, withRecipe: 2, noSections: 0 }), "2 shipped · all have a re-read recipe");

console.log("\n--- renderRecipeMarkdown ---");
{
  const s: DriftFixRecipeSummary = {
    rows: [
      {
        id: "01-ac",
        title: "Abandoned Cart",
        driftDays: 120,
        readFirst: [
          { heading: "Common pitfalls", label: "pitfalls", hash: "common-pitfalls" },
          { heading: "Verification gates", label: "verification", hash: "verification-gates" },
        ],
        totalSections: 6,
      },
    ],
    totalShipped: 1,
    withRecipe: 1,
    noSections: 0,
    maxDriftDays: 120,
  };
  const md = renderRecipeMarkdown(s);
  eq("markdown has heading", md.includes("## Re-read recipe"), true);
  eq("markdown has table header", md.includes("| Playbook | Drift | Read first |"), true);
  eq("markdown has Abandoned Cart", md.includes("Abandoned Cart"), true);
  eq("markdown has 120d", md.includes("120d"), true);
  eq("markdown has Common pitfalls", md.includes("`Common pitfalls`"), true);
  eq("markdown has pitfalls label", md.includes("(pitfalls)"), true);
  eq("markdown has Generated", md.includes("_Generated"), true);
  eq("markdown has 1/1 fraction", md.includes("1/1"), true);
  const emptyMd = renderRecipeMarkdown({ rows: [], maxDriftDays: null, totalShipped: 0, withRecipe: 0, noSections: 0 });
  eq("empty md fallback", emptyMd.includes("No shipped playbooks yet"), true);
}

console.log("\n--- findPlaybook ---");
{
  const playbooks: Pick<Playbook, "file" | "title">[] = [
    { file: "01-abandoned-cart.md", title: "AC" },
    { file: "02-ppu.md", title: "PPU" },
  ] as Playbook[];
  eq("find by id without .md", findPlaybook(playbooks as Playbook[], "01-abandoned-cart")?.title, "AC");
  eq("find by id with .md", findPlaybook(playbooks as Playbook[], "01-abandoned-cart.md")?.title, "AC");
  eq("not found", findPlaybook(playbooks as Playbook[], "99-missing"), undefined);
  eq("empty catalog", findPlaybook([], "anything"), undefined);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
