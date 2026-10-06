/**
 * `shipped-freshness-drift.test.ts` — pure-logic tests for the
 * shipped-playbook freshness-drift detector.
 *
 * Covers: classifyDrift, driftToneClass, summaryHeadline,
 * summaryToneClass, buildShippedFreshnessDrift (the main entry
 * point), and relativeDay.
 *
 * Run with: `npx jiti src/lib/__tests__/shipped-freshness-drift.test.ts`
 */

import {
  buildShippedFreshnessDrift,
  classifyDrift,
  describeDriftState,
  driftToneClass,
  relativeDay,
  summaryHeadline,
  summaryToneClass,
  type ShippedDriftRow,
} from "../shipped-freshness-drift";
import { freshnessTier } from "../content";
import type { Playbook } from "../content";

const day = (n: number, ref: Date) => {
  // Returns an ISO date `n` days BEFORE `ref`, computed in UTC so we
  // match the lib's UTC-midnight math. YYYY-MM-DD prefix so the
  // freshnessTier function (which appends `T00:00:00Z`) parses cleanly.
  const d = new Date(
    Date.UTC(
      ref.getUTCFullYear(),
      ref.getUTCMonth(),
      ref.getUTCDate() - n
    )
  );
  return d.toISOString().slice(0, 10);
};

const NOW = new Date("2026-10-06T12:00:00Z");

const playbooks: Pick<Playbook, "file" | "title" | "lastTouched">[] = [
  {
    file: "01-abandoned-cart-flow-klaviyo.md",
    title: "Abandoned-Cart Klaviyo flow",
    lastTouched: day(23, NOW), // updated 23d ago
  },
  {
    file: "02-post-purchase-upsell-reconvert.md",
    title: "Post-Purchase Upsell",
    lastTouched: day(180, NOW), // updated 180d ago (stale tier)
  },
  {
    file: "03-checkout-audit-baymard.md",
    title: "Checkout Audit (Baymard)",
    lastTouched: day(5, NOW), // updated 5d ago (fresh)
  },
  {
    file: "04-welcome-series-klaviyo.md",
    title: "Welcome Series",
    lastTouched: undefined as unknown as string, // no lastTouched
  },
  {
    file: "05-migrate-to-klaviyo-postscript.md",
    title: "Migrate to Klaviyo + Postscript",
    lastTouched: day(7, NOW),
  },
];

let pass = 0;
let fail = 0;
const failures: string[] = [];

function ok(label: string, cond: boolean, detail?: unknown) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    failures.push(`${label}${detail ? " — " + JSON.stringify(detail) : ""}`);
    console.log(`  ✗ ${label}${detail ? " — " + JSON.stringify(detail) : ""}`);
  }
}

function eq<T>(label: string, got: T, want: T) {
  ok(label, JSON.stringify(got) === JSON.stringify(want), { got, want });
}

console.log("\n--- classifyDrift ---");
eq("null → unknown", classifyDrift(null), "unknown");
eq("negative → none (current)", classifyDrift(-10), "none");
eq("zero → none (current)", classifyDrift(0), "none");
eq("1d → mild", classifyDrift(1), "mild");
eq("30d → mild (boundary)", classifyDrift(30), "mild");
eq("31d → significant", classifyDrift(31), "significant");
eq("90d → significant (boundary)", classifyDrift(90), "significant");
eq("91d → severe", classifyDrift(91), "severe");
eq("365d → severe", classifyDrift(365), "severe");

console.log("\n--- describeDriftState ---");
eq("none", describeDriftState("none"), "current");
eq("mild", describeDriftState("mild"), "mild drift");
eq("significant", describeDriftState("significant"), "re-read before next iter");
eq("severe", describeDriftState("severe"), "stale — re-read now");
eq("unknown", describeDriftState("unknown"), "no freshness data");

console.log("\n--- driftToneClass ---");
ok("none contains emerald", driftToneClass("none").includes("emerald"));
ok("mild contains sky", driftToneClass("mild").includes("sky"));
ok("significant contains amber", driftToneClass("significant").includes("amber"));
ok("severe contains rose", driftToneClass("severe").includes("rose"));
ok("unknown is muted", driftToneClass("unknown").includes("muted"));

console.log("\n--- summaryToneClass ---");
ok("0/0 → emerald (current)", summaryToneClass(0, 0).includes("emerald"));
ok("0/3 → amber (drifting)", summaryToneClass(0, 3).includes("amber"));
ok("1/3 → rose (severe wins)", summaryToneClass(1, 3).includes("rose"));
ok("2/0 → rose (severe only)", summaryToneClass(2, 0).includes("rose"));

console.log("\n--- summaryHeadline ---");
eq(
  "no shipped",
  summaryHeadline({
    rows: [],
    totalShipped: 0,
    driftedCount: 0,
    severeCount: 0,
    maxDriftDays: null,
  }),
  "No shipped playbooks yet"
);
eq(
  "all current (1)",
  summaryHeadline({
    rows: [],
    totalShipped: 1,
    driftedCount: 0,
    severeCount: 0,
    maxDriftDays: -5,
  }),
  "All 1 shipped playbook is current"
);
eq(
  "all current (5)",
  summaryHeadline({
    rows: [],
    totalShipped: 5,
    driftedCount: 0,
    severeCount: 0,
    maxDriftDays: 0,
  }),
  "All 5 shipped playbooks are current"
);
eq(
  "drifted (plural)",
  summaryHeadline({
    rows: [],
    totalShipped: 7,
    driftedCount: 2,
    severeCount: 0,
    maxDriftDays: 60,
  }),
  "2 shipped playbooks drifting from the current version"
);
eq(
  "drifted (singular)",
  summaryHeadline({
    rows: [],
    totalShipped: 3,
    driftedCount: 1,
    severeCount: 0,
    maxDriftDays: 35,
  }),
  "1 shipped playbook drifting from the current version"
);
eq(
  "severe (plural)",
  summaryHeadline({
    rows: [],
    totalShipped: 10,
    driftedCount: 4,
    severeCount: 2,
    maxDriftDays: 200,
  }),
  "2 shipped playbooks >90d behind current best practice"
);
eq(
  "severe (singular)",
  summaryHeadline({
    rows: [],
    totalShipped: 4,
    driftedCount: 1,
    severeCount: 1,
    maxDriftDays: 120,
  }),
  "1 shipped playbook >90d behind current best practice"
);

console.log("\n--- buildShippedFreshnessDrift (empty) ---");
{
  const s = buildShippedFreshnessDrift({}, playbooks, NOW);
  eq("empty rows", s.rows, []);
  eq("totalShipped 0", s.totalShipped, 0);
  eq("driftedCount 0", s.driftedCount, 0);
  eq("severeCount 0", s.severeCount, 0);
  eq("maxDriftDays null", s.maxDriftDays, null);
}

console.log("\n--- buildShippedFreshnessDrift (1 shipped, current) ---");
{
  // Ship Move #3 2 days ago — playbook updated 5 days ago — so shipped
  // AFTER the last update, drift = 2 - 5 = -3 (current).
  const s = buildShippedFreshnessDrift(
    { "03-checkout-audit-baymard": { shippedAt: day(2, NOW) } },
    playbooks,
    NOW
  );
  eq("1 row", s.rows.length, 1);
  const r = s.rows[0];
  eq("id", r.id, "03-checkout-audit-baymard");
  eq("title", r.title, "Checkout Audit (Baymard)");
  eq("daysSinceShipped 2", r.daysSinceShipped, 2);
  eq("daysSincePlaybookLastTouched 5", r.daysSincePlaybookLastTouched, 5);
  eq("driftDays -3", r.driftDays, -3);
  eq("driftState none", r.driftState, "none");
  eq("playbookFreshnessTier fresh", r.playbookFreshnessTier, "fresh");
  eq("totalShipped 1", s.totalShipped, 1);
  eq("driftedCount 0", s.driftedCount, 0);
  eq("severeCount 0", s.severeCount, 0);
  eq("maxDriftDays -3", s.maxDriftDays, -3);
}

console.log("\n--- buildShippedFreshnessDrift (1 shipped, severe drift) ---");
{
  // Ship Move #1 200 days ago — playbook updated 23 days ago — drift = 200 - 23 = 177 (severe).
  const s = buildShippedFreshnessDrift(
    { "01-abandoned-cart-flow-klaviyo": { shippedAt: day(200, NOW) } },
    playbooks,
    NOW
  );
  eq("1 row", s.rows.length, 1);
  const r = s.rows[0];
  eq("driftDays 177", r.driftDays, 177);
  eq("driftState severe", r.driftState, "severe");
  eq("playbookFreshnessTier aging", r.playbookFreshnessTier, "aging");
  eq("driftedCount 1", s.driftedCount, 1);
  eq("severeCount 1", s.severeCount, 1);
  eq("maxDriftDays 177", s.maxDriftDays, 177);
}

console.log("\n--- buildShippedFreshnessDrift (1 shipped, unknown lastTouched) ---");
{
  // Move #4 has lastTouched: undefined — drift should be null and state unknown.
  const s = buildShippedFreshnessDrift(
    { "04-welcome-series-klaviyo": { shippedAt: day(60, NOW) } },
    playbooks,
    NOW
  );
  eq("1 row", s.rows.length, 1);
  const r = s.rows[0];
  eq("driftDays null", r.driftDays, null);
  eq("driftState unknown", r.driftState, "unknown");
  eq("daysSincePlaybookLastTouched null", r.daysSincePlaybookLastTouched, null);
  eq("playbookFreshnessTier unknown", r.playbookFreshnessTier, "unknown");
  eq("driftedCount 0 (unknown excluded)", s.driftedCount, 0);
  eq("maxDriftDays null (no lastTouched)", s.maxDriftDays, null);
}

console.log("\n--- buildShippedFreshnessDrift (sort by drift desc) ---");
{
  // Ship 4 playbooks with different drift values; the summary should
  // return the top 3 by drift desc.
  const shipped = {
    "01-abandoned-cart-flow-klaviyo": { shippedAt: day(200, NOW) }, // drift 200-23 = 177 (severe)
    "02-post-purchase-upsell-reconvert": { shippedAt: day(60, NOW) }, // drift 60-180 = -120 (current)
    "03-checkout-audit-baymard": { shippedAt: day(40, NOW) }, // drift 40-5 = 35 (significant)
    "05-migrate-to-klaviyo-postscript": { shippedAt: day(5, NOW) }, // drift 5-7 = -2 (current)
  };
  const s = buildShippedFreshnessDrift(shipped, playbooks, NOW, 3);
  eq("3 rows (capped at maxRows)", s.rows.length, 3);
  eq("first row is most-drifted", s.rows[0].id, "01-abandoned-cart-flow-klaviyo");
  eq("first row driftState severe", s.rows[0].driftState, "severe");
  eq("second row is significant", s.rows[1].id, "03-checkout-audit-baymard");
  eq("second row driftState significant", s.rows[1].driftState, "significant");
  eq("third row is current (migrate wins over upsell — same tier, but newer)", s.rows[2].id, "05-migrate-to-klaviyo-postscript");
  eq("third row driftState none", s.rows[2].driftState, "none");
  eq("totalShipped 4", s.totalShipped, 4);
  eq("driftedCount 2 (severe + significant)", s.driftedCount, 2);
  eq("severeCount 1", s.severeCount, 1);
  eq("maxDriftDays 177", s.maxDriftDays, 177);
}

console.log("\n--- buildShippedFreshnessDrift (mild drift tier boundary) ---");
{
  // Custom playbook: ship 60 days ago, updated 50 days ago. Drift = 10.
  // (Use a custom playbook so the shared fixture's lastTouched of
  // `day(23, NOW)` doesn't override our intent.)
  const customPb = [
    { file: "01-mild.md", title: "Mild", lastTouched: day(50, NOW) },
  ];
  const s = buildShippedFreshnessDrift(
    { "01-mild": { shippedAt: day(60, NOW) } },
    customPb,
    NOW
  );
  eq("driftDays 10", s.rows[0].driftDays, 10);
  eq("driftState mild", s.rows[0].driftState, "mild");
  eq("driftedCount 0 (mild not counted)", s.driftedCount, 0);
}

console.log("\n--- buildShippedFreshnessDrift (notes pass through) ---");
{
  // The notes field is preserved on the entry; the lib doesn't read it
  // but it should not crash when it's present.
  const s = buildShippedFreshnessDrift(
    {
      "03-checkout-audit-baymard": {
        shippedAt: day(2, NOW),
        notes: "shipped to dev store; first 12% lift in week 1",
      },
    },
    playbooks,
    NOW
  );
  eq("1 row", s.rows.length, 1);
  ok("notes preserved on entry (we don't expose it, but no crash)", s.rows[0].title === "Checkout Audit (Baymard)");
}

console.log("\n--- buildShippedFreshnessDrift (unknown shipped id is skipped) ---");
{
  const s = buildShippedFreshnessDrift(
    { "99-nonexistent-playbook": { shippedAt: day(30, NOW) } },
    playbooks,
    NOW
  );
  eq("0 rows (unknown id skipped)", s.rows.length, 0);
  eq("totalShipped 0", s.totalShipped, 0);
}

console.log("\n--- buildShippedFreshnessDrift (invalid shippedAt is skipped) ---");
{
  const s = buildShippedFreshnessDrift(
    {
      "03-checkout-audit-baymard": { shippedAt: "not-a-date" as unknown as string },
    },
    playbooks,
    NOW
  );
  eq("0 rows (invalid shippedAt skipped)", s.rows.length, 0);
  eq("totalShipped 0", s.totalShipped, 0);
}

console.log("\n--- buildShippedFreshnessDrift (custom maxRows) ---");
{
  const shipped = {
    "01-abandoned-cart-flow-klaviyo": { shippedAt: day(200, NOW) },
    "03-checkout-audit-baymard": { shippedAt: day(40, NOW) },
    "05-migrate-to-klaviyo-postscript": { shippedAt: day(5, NOW) },
  };
  const s1 = buildShippedFreshnessDrift(shipped, playbooks, NOW, 1);
  const s2 = buildShippedFreshnessDrift(shipped, playbooks, NOW, 10);
  eq("maxRows=1 caps at 1 row", s1.rows.length, 1);
  eq("maxRows=10 returns all 3", s2.rows.length, 3);
  eq("maxRows=0 caps at 0 rows", buildShippedFreshnessDrift(shipped, playbooks, NOW, 0).rows.length, 0);
}

console.log("\n--- buildShippedFreshnessDrift (lastTouched in the future) ---");
{
  // Edge case: playbook updated 3 days in the future (clock skew on
  // mtime). Drift = daysSinceShipped - (-3) = daysSinceShipped + 3.
  // Should still classify correctly.
  const futurePb = [
    {
      file: "01-future.md",
      title: "Future",
      // Full ISO 3 days past NOW (parse-content uses real mtime which
      // can be skewed ahead of now if the file was just written and
      // the parser ran a moment earlier).
      lastTouched: new Date(NOW.getTime() + 3 * 86400000).toISOString(),
    },
  ];
  const s = buildShippedFreshnessDrift(
    { "01-future": { shippedAt: new Date(NOW.getTime() - 7 * 86400000).toISOString() } },
    futurePb,
    NOW
  );
  eq("driftDays 10 (7 + 3)", s.rows[0].driftDays, 10);
  eq("driftState mild", s.rows[0].driftState, "mild");
}

console.log("\n--- buildShippedFreshnessDrift (sort: drift desc, then daysSinceShipped desc) ---");
{
  // Two playbooks with the same drift (both 30), different daysSinceShipped.
  // The one with more daysSinceShipped should come first.
  const samePb = [
    { file: "a.md", title: "A", lastTouched: day(0, NOW) },
    { file: "b.md", title: "B", lastTouched: day(0, NOW) },
  ];
  const s = buildShippedFreshnessDrift(
    {
      a: { shippedAt: day(60, NOW) }, // drift 60
      b: { shippedAt: day(100, NOW) }, // drift 100 — should come first
    },
    samePb,
    NOW
  );
  eq("b first (drift 100 > 60)", s.rows[0].id, "b");
  eq("a second", s.rows[1].id, "a");
}

console.log("\n--- relativeDay ---");
eq("today", relativeDay(day(0, NOW), NOW), "today");
eq("yesterday", relativeDay(day(1, NOW), NOW), "yesterday");
eq("3d ago", relativeDay(day(3, NOW), NOW), "3d ago");
eq("2w ago", relativeDay(day(14, NOW), NOW), "2w ago");
eq("3mo ago", relativeDay(day(90, NOW), NOW), "3mo ago");
eq("2y ago", relativeDay(day(730, NOW), NOW), "2y ago");
eq("invalid → empty", relativeDay("not-a-date", NOW), "");

console.log("\n--- freshnessTier compat ---");
eq("freshnessTier fresh", freshnessTier(day(5, NOW), NOW), "fresh");
eq("freshnessTier aging", freshnessTier(day(30, NOW), NOW), "aging");
eq("freshnessTier stale", freshnessTier(day(120, NOW), NOW), "stale");
eq("freshnessTier unknown", freshnessTier(undefined, NOW), "unknown");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
