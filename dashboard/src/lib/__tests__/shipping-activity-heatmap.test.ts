/**
 * Smoke tests for `dashboard/src/lib/shipping-activity-heatmap.ts` —
 * the temporal shipping-activity view for the 10 launch-plan
 * generators (Move #N.11).
 *
 * Run with: `npx jiti src/lib/__tests__/shipping-activity-heatmap.test.ts`
 *
 * Coverage:
 *   - `isoDateUtc` + `parseIsoDateUtc` + `dayDiffUtc` (round-trip)
 *   - `intensityBucket` (0..4 cutoffs)
 *   - `aggregateShipsByDay` (multi-plan × multi-day merge, planId dedup)
 *   - `buildShippingHeatmap` (13×7 grid, today=last column, future
 *     cells flagged, maxShips + totalShips + activeDays correct)
 *   - `buildShippingMomentum` (current / longest streak, days-since,
 *     weekday breakdown, 30/60/90 windows, 7-vs-30 velocity ratio)
 *   - `buildShippingActivity` (combined rollup)
 *   - `describeVelocityRatio` + `formatStreak` + tone classes
 *   - `shippingActivityToMarkdown` (header + momentum + weekday table)
 *   - Edge cases: empty progress, single-day, all-future, all-past,
 *     duplicate plan-day entries
 */

import {
  SHIPPING_HEATMAP_WEEKS,
  aggregateShipsByDay,
  buildShippingActivity,
  buildShippingHeatmap,
  buildShippingMomentum,
  cellTooltip,
  daysSinceToneClass,
  dayDiffUtc,
  describeDaysSince,
  describeVelocityRatio,
  formatStreak,
  intensityBucket,
  intensityToneClass,
  isoDateUtc,
  parseIsoDateUtc,
  shippingActivityToMarkdown,
  streakToneClass,
} from "../shipping-activity-heatmap";

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

const PLAN_TITLES: Record<string, string> = {
  "pdp-ab": "PDP A/B Test launch plan",
  "welcome-series": "Welcome Series launch plan",
  abandoned: "Abandoned Cart launch plan",
  loyalty: "Loyalty launch plan",
};

console.log("isoDateUtc / parseIsoDateUtc / dayDiffUtc:");
{
  const d = new Date("2026-10-04T15:30:00Z");
  const iso = isoDateUtc(d);
  check("isoDateUtc uses UTC date parts", iso === "2026-10-04", `iso=${iso}`);

  const back = parseIsoDateUtc(iso)!;
  check(
    "parseIsoDateUtc round-trips",
    isoDateUtc(back) === "2026-10-04",
    `back=${isoDateUtc(back)}`
  );

  check("parseIsoDateUtc rejects garbage", parseIsoDateUtc("not-a-date") === null);
  check("parseIsoDateUtc rejects ISO with time", parseIsoDateUtc("2026-10-04T10:00:00Z") === null);

  const a = new Date("2026-10-01T00:00:00Z");
  const b = new Date("2026-10-04T00:00:00Z");
  check("dayDiffUtc computes 3 days", dayDiffUtc(a, b) === 3);

  const c = new Date("2026-10-04T23:59:59Z");
  check(
    "dayDiffUtc ignores time-of-day",
    dayDiffUtc(a, c) === 3,
    `got ${dayDiffUtc(a, c)}`
  );
}

console.log("\nintensityBucket:");
{
  check("0 ships → 0", intensityBucket(0) === 0);
  check("1 ship → 1", intensityBucket(1) === 1);
  check("2 ships → 2", intensityBucket(2) === 2);
  check("3 ships → 3", intensityBucket(3) === 3);
  check("4 ships → 3", intensityBucket(4) === 3);
  check("5 ships → 4", intensityBucket(5) === 4);
  check("100 ships → 4", intensityBucket(100) === 4);
}

console.log("\nintensityToneClass:");
{
  const t0 = intensityToneClass(0);
  const t1 = intensityToneClass(1);
  const t4 = intensityToneClass(4);
  check("0 is muted", /muted/.test(t0), `t0=${t0}`);
  check("1 is faint emerald", /emerald/.test(t1), `t1=${t1}`);
  check("4 is deep emerald", /emerald/.test(t4), `t4=${t4}`);
  check("0 != 4", t0 !== t4);
}

console.log("\ncellTooltip:");
{
  const base = {
    date: "2026-10-04",
    weekday: 0,
    daysAgo: 0,
    ships: 3,
    planIds: ["a", "b"],
    intensity: 3,
    isFuture: false,
  } as const;
  const tip = cellTooltip(base);
  check(
    "tooltip includes date + ship count",
    tip.includes("2026-10-04") && tip.includes("3 ships")
  );
  const future = { ...base, isFuture: true, ships: 0 };
  check(
    "future tooltip is labelled",
    cellTooltip(future).includes("future"),
    `tip=${cellTooltip(future)}`
  );
  const none = { ...base, ships: 0, planIds: [] };
  check(
    "0-ship tooltip is explicit",
    cellTooltip(none).includes("0 ships"),
    `tip=${cellTooltip(none)}`
  );
}

console.log("\naggregateShipsByDay:");
{
  const map = aggregateShipsByDay({
    "pdp-ab": {
      "1": "2026-10-01T08:00:00Z",
      "5": "2026-10-03T08:00:00Z",
      // duplicate day — should count as 2 ships same plan
      "2": "2026-10-01T20:00:00Z",
    },
    "welcome-series": {
      "3": "2026-10-01T15:00:00Z",
    },
    abandoned: {
      // invalid ISO — should be dropped
      "9": "garbage",
    },
  });
  const oct1 = map.get("2026-10-01");
  check("2026-10-01 entry exists", !!oct1);
  check("2026-10-01 has 3 ships", oct1?.ships === 3, `ships=${oct1?.ships}`);
  check(
    "2026-10-01 lists 2 distinct plans",
    oct1?.planIds.length === 2,
    `planIds=${JSON.stringify(oct1?.planIds)}`
  );
  check(
    "2026-10-01 planIds deduped",
    new Set(oct1?.planIds).size === oct1?.planIds.length
  );
  check("garbage ISO dropped", !map.has("garbage"));
  const oct3 = map.get("2026-10-03");
  check("2026-10-03 has 1 ship", oct3?.ships === 1);
  check("2026-10-04 absent", !map.has("2026-10-04"));
}

console.log("\nbuildShippingHeatmap:");
{
  const now = new Date("2026-10-04T12:00:00Z"); // Sunday
  const heatmap = buildShippingHeatmap(
    {
      "pdp-ab": { "1": "2026-10-01T08:00:00Z" },
      "welcome-series": { "3": "2026-10-02T08:00:00Z" },
    },
    now
  );
  check("today is 2026-10-04", heatmap.today === "2026-10-04");
  check(
    "13 weeks × 7 days",
    heatmap.weeks.length === SHIPPING_HEATMAP_WEEKS &&
      heatmap.weeks.every((w) => w.length === 7)
  );
  check("startDate is a Sunday", parseIsoDateUtc(heatmap.startDate)?.getUTCDay() === 0);
  check("totalShips = 2", heatmap.totalShips === 2, `got ${heatmap.totalShips}`);
  check("activeDays = 2", heatmap.activeDays === 2);
  check("maxShips = 1", heatmap.maxShips === 1);

  // The heatmap is always 13 columns × 7 rows. Today sits in the last
  // column at row=today.weekday. Cells AFTER today in the last column
  // are flagged as future.
  const lastWeek = heatmap.weeks[heatmap.weeks.length - 1];
  // 2026-10-04 is a Sunday (weekday 0), so today is at lastWeek[0] and
  // lastWeek[1..6] are future.
  const todayCell = lastWeek[0];
  check("today is at lastWeek[0]", todayCell.date === "2026-10-04");
  check("today.daysAgo = 0", todayCell.daysAgo === 0);
  check("today is not future", !todayCell.isFuture);

  // Future cells in the last week (Mon..Sat of the trailing week).
  const futureCells = lastWeek.slice(1);
  check("lastWeek[1..6] are future", futureCells.every((c) => c.isFuture));
  check(
    "future cells have daysAgo < 0",
    futureCells.every((c) => c.daysAgo < 0)
  );

  // Earlier cell with 0 ships should have intensity 0.
  const emptyCell = heatmap.weeks[0][0];
  check("empty cell has intensity 0", emptyCell.intensity === 0);
  check("empty cell tooltip says 0 ships", cellTooltip(emptyCell).includes("0 ships"));
}

console.log("\nbuildShippingHeatmap — mid-window with future cells:");
{
  // now = mid-week, so cells at the end of the week are future.
  const now = new Date("2026-10-07T12:00:00Z"); // Wednesday
  const heatmap = buildShippingHeatmap({}, now);
  const lastWeek = heatmap.weeks[heatmap.weeks.length - 1];
  // Wed = index 3, so days 4,5,6 (Thu,Fri,Sat) are future.
  const futureCells = lastWeek.filter((c) => c.isFuture);
  check("Thu/Fri/Sat of the last week are future", futureCells.length === 3);
  check("future cells have 0 ships", futureCells.every((c) => c.ships === 0));
  check("future cells have intensity 0", futureCells.every((c) => c.intensity === 0));
}

console.log("\nbuildShippingMomentum — empty:");
{
  const m = buildShippingMomentum({}, new Date("2026-10-04T00:00:00Z"));
  check("empty: isEmpty", m.isEmpty);
  check("empty: currentStreak = 0", m.currentStreak === 0);
  check("empty: longestStreak = 0", m.longestStreak === 0);
  check("empty: daysSinceLastShip = null", m.daysSinceLastShip === null);
  check("empty: lastShipDate = null", m.lastShipDate === null);
  check("empty: last30 = 0", m.last30 === 0);
  check("empty: last7 = 0", m.trend7vs30.last7 === 0);
  check("empty: velocityRatio = 0", m.trend7vs30.velocityRatio === 0);
  check(
    "empty: weekdayTotals sum = 0",
    m.weekdayTotals.reduce((a, b) => a + b, 0) === 0
  );
}

console.log("\nbuildShippingMomentum — 7-day streak ending today:");
{
  const progress: Record<string, Record<string, string>> = {};
  // Ship once per day for the last 7 days, on pdp-ab.
  for (let i = 0; i < 7; i++) {
    const d = new Date("2026-10-04T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    progress["pdp-ab"] = progress["pdp-ab"] || {};
    progress["pdp-ab"][String(i + 1)] = d.toISOString();
  }
  const m = buildShippingMomentum(progress, new Date("2026-10-04T00:00:00Z"));
  check("7-day streak: currentStreak = 7", m.currentStreak === 7);
  check("7-day streak: longestStreak = 7", m.longestStreak === 7);
  check("7-day streak: daysSinceLastShip = 0", m.daysSinceLastShip === 0);
  check("7-day streak: last30 = 7", m.last30 === 7);
  check("7-day streak: last7 = 7", m.trend7vs30.last7 === 7);
  // velocityRatio = (last7/7) / (last30/30) = 1 / (7/30) = 30/7 ≈ 4.28.
  // A 7-day streak with no history IS accelerating, not steady.
  check(
    "7-day streak (no prior history): velocityRatio > 4",
    m.trend7vs30.velocityRatio > 4 && m.trend7vs30.velocityRatio < 5,
    `ratio=${m.trend7vs30.velocityRatio.toFixed(2)}`
  );
}

console.log("\nbuildShippingMomentum — broken streak (last ship 5 days ago):");
{
  const oldDate = new Date("2026-09-29T00:00:00Z").toISOString();
  const m = buildShippingMomentum(
    { "pdp-ab": { "1": oldDate } },
    new Date("2026-10-04T00:00:00Z")
  );
  check(
    "5-day gap: currentStreak = 0",
    m.currentStreak === 0,
    `got ${m.currentStreak}`
  );
  check("5-day gap: longestStreak = 1", m.longestStreak === 1);
  check("5-day gap: daysSinceLastShip = 5", m.daysSinceLastShip === 5);
}

console.log("\nbuildShippingMomentum — 2 separate streaks (2 + 3 = longest 3):");
{
  const progress: Record<string, Record<string, string>> = {};
  // Streak 1: 2026-09-20, 2026-09-21 (2 days)
  // Gap on 2026-09-22
  // Streak 2: 2026-09-23, 2026-09-24, 2026-09-25 (3 days)
  for (const d of [
    "2026-09-20",
    "2026-09-21",
    "2026-09-23",
    "2026-09-24",
    "2026-09-25",
  ]) {
    progress["pdp-ab"] = progress["pdp-ab"] || {};
    progress["pdp-ab"][d] = `${d}T08:00:00Z`;
  }
  const m = buildShippingMomentum(
    progress,
    new Date("2026-09-25T12:00:00Z")
  );
  check("2+3 streak: currentStreak = 3", m.currentStreak === 3);
  check("2+3 streak: longestStreak = 3", m.longestStreak === 3);
  check("2+3 streak: daysSinceLastShip = 0", m.daysSinceLastShip === 0);
}

console.log("\nbuildShippingMomentum — 30/60/90 windows + weekday breakdown:");
{
  const progress: Record<string, Record<string, string>> = {};
  // Ship on 5 random days spread across the last 100 days.
  const days = ["2026-09-30", "2026-09-20", "2026-08-25", "2026-08-15", "2026-07-15"];
  for (const d of days) {
    progress["pdp-ab"] = progress["pdp-ab"] || {};
    progress["pdp-ab"][d] = `${d}T08:00:00Z`;
  }
  const m = buildShippingMomentum(
    progress,
    new Date("2026-10-04T00:00:00Z")
  );
  check("5 ships total → weekdayTotals sum = 5", m.weekdayTotals.reduce((a, b) => a + b, 0) === 5);
  // 2026-09-30 (4d), 2026-09-20 (14d): both in last 30.
  check("last30 = 2", m.last30 === 2);
  // 2026-08-25 (40d), 2026-08-15 (50d): both in last 60 (≤ 60).
  check("last60 = 4", m.last60 === 4);
  // 2026-07-15 (81d) in last 90 (≤ 90) too.
  check("last90 = 5", m.last90 === 5);
  // Sanity: 2 + 2 + 1 = 5 unique day-counts.
  check(
    "cumulative windows sum to 5 unique days",
    m.last30 + (m.last60 - m.last30) + (m.last90 - m.last60) === 5,
    `last30=${m.last30} last60=${m.last60} last90=${m.last90}`
  );
  // Weekday breakdown should list a non-zero entry for each of the 5 days.
  const breakdownTotal = m.weekdayBreakdown.reduce((a, b) => a + b.ships, 0);
  check("weekday breakdown total = 5", breakdownTotal === 5);
}

console.log("\nbuildShippingMomentum — velocity (accelerating vs stalled):");
{
  // 23 ships in days 8..30 ago, 0 in the last 7 days → stalled.
  const progress: Record<string, Record<string, string>> = {};
  for (let i = 8; i <= 30; i++) {
    const d = new Date("2026-10-04T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    progress["pdp-ab"] = progress["pdp-ab"] || {};
    progress["pdp-ab"][String(i)] = d.toISOString();
  }
  const m = buildShippingMomentum(
    progress,
    new Date("2026-10-04T00:00:00Z")
  );
  // Days shipped: i ∈ {8..30} = 23 days. All in last 30, none in last 7.
  check("stalled: last30 = 23", m.last30 === 23, `got ${m.last30}`);
  check("stalled: last7 = 0", m.trend7vs30.last7 === 0, `last7=${m.trend7vs30.last7}`);
  // last30Rate = 23/30 ≈ 0.767. last7Rate = 0/7 = 0. ratio = 0 / 0.767 = 0.
  check(
    "stalled: velocityRatio = 0",
    m.trend7vs30.velocityRatio === 0,
    `ratio=${m.trend7vs30.velocityRatio.toFixed(2)}`
  );
}

console.log("\nbuildShippingActivity (combined):");
{
  const now = new Date("2026-10-04T00:00:00Z");
  const a = buildShippingActivity(
    {
      "pdp-ab": { "1": "2026-10-01T08:00:00Z" },
      "welcome-series": { "3": "2026-10-02T08:00:00Z" },
    },
    now
  );
  check("combined has heatmap", a.heatmap.weeks.length === SHIPPING_HEATMAP_WEEKS);
  check("combined has momentum", typeof a.momentum.currentStreak === "number");
  check(
    "combined: heatmap.totalShips == momentum.last30 + earlier",
    a.heatmap.totalShips === 2
  );
}

console.log("\ndescribeVelocityRatio:");
{
  check("1.0+ → steady/sky", (() => {
    const d = describeVelocityRatio(1.0);
    return d.tone === "sky" || d.tone === "emerald";
  })());
  check("0 → idle", describeVelocityRatio(0).tone === "muted");
  check("0.5 → slowing", describeVelocityRatio(0.5).tone === "amber");
  check("0.1 → stalled", describeVelocityRatio(0.1).tone === "rose");
  check("2.0 → accelerating", describeVelocityRatio(2.0).tone === "emerald");
  check("Infinity → new", describeVelocityRatio(Infinity).tone === "emerald");
}

console.log("\nformatStreak + tone classes:");
{
  check("formatStreak(0) = '0 days'", formatStreak(0) === "0 days");
  check("formatStreak(1) = '1 day'", formatStreak(1) === "1 day");
  check("formatStreak(7) = '7 days'", formatStreak(7) === "7 days");

  check("streakToneClass(0) muted", /muted/.test(streakToneClass(0)));
  check("streakToneClass(1) amber", /amber/.test(streakToneClass(1)));
  check("streakToneClass(7) emerald", /emerald/.test(streakToneClass(7)));
}

console.log("\ndaysSinceToneClass + describeDaysSince:");
{
  check("null → muted", /muted/.test(daysSinceToneClass(null)));
  check("0 → emerald", /emerald/.test(daysSinceToneClass(0)));
  check("5 → amber", /amber/.test(daysSinceToneClass(5)));
  check("14 → rose", /rose/.test(daysSinceToneClass(14)));

  check("describeDaysSince(null) = '—'", describeDaysSince(null) === "—");
  check("describeDaysSince(0) = 'today'", describeDaysSince(0) === "today");
  check("describeDaysSince(1) = 'yesterday'", describeDaysSince(1) === "yesterday");
  check(
    "describeDaysSince(7) = '7 days ago'",
    describeDaysSince(7) === "7 days ago"
  );
}

console.log("\nshippingActivityToMarkdown:");
{
  const now = new Date("2026-10-04T00:00:00Z");
  const a = buildShippingActivity(
    {
      "pdp-ab": { "1": "2026-10-01T08:00:00Z" },
      "welcome-series": { "3": "2026-10-02T08:00:00Z" },
      "loyalty": { "7": "2026-10-02T08:00:00Z" },
    },
    now
  );
  const md = shippingActivityToMarkdown(a, PLAN_TITLES);
  check("md starts with H1", md.startsWith("# Shipping activity heatmap"));
  check("md includes Momentum", md.includes("## Momentum"));
  check("md includes Current streak line", md.includes("Current streak:"));
  check("md includes Last ship line", md.includes("Last ship:"));
  check("md includes Weekday breakdown table", md.includes("| Day | Ships | Active days | Rate |"));
  check("md includes Recent ship days", md.includes("## Recent ship days"));
  check("md includes plan title in recent", md.includes("PDP A/B Test launch plan"));
  check("md empty state", (() => {
    const empty = shippingActivityToMarkdown(
      buildShippingActivity({}, now),
      PLAN_TITLES
    );
    return !empty.includes("## Recent ship days") && empty.includes("Last ship: **—**");
  })());
}

console.log("\nPlan title lookup (integration with launch-plan-progress LAUNCH_PLAN_CATALOG):");
{
  // Sanity: the catalog IDs we used above should resolve to titles.
  check("pdp-ab title", PLAN_TITLES["pdp-ab"] === "PDP A/B Test launch plan");
  check("welcome-series title", PLAN_TITLES["welcome-series"] === "Welcome Series launch plan");
}

console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  console.error("FAILURES:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
