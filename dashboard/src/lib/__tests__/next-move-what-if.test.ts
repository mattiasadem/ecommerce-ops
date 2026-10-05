/**
 * Move #N.13 — what-if scenario simulator tests.
 * Pure-logic tests. Run via `npx jiti src/lib/__tests__/next-move-what-if.test.ts`.
 */

import { runWhatIf, toggleWhatIf, whatIfToMarkdown, describeSroiDelta, sroiDeltaToneClass, NEXT_MOVE_WHAT_IF_STORAGE_KEY, NEXT_MOVE_WHAT_IF_UPDATE_EVENT } from "../next-move-what-if";
import { YOUR_STORE_DEFAULTS } from "../your-store";
import { MOVE_RECOMMENDATIONS } from "../next-move";

let passed = 0;
let failed = 0;
function assert(name: string, cond: boolean, extra?: string) {
  if (cond) {
    passed++;
    console.log(`  PASS ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${extra ? ` — ${extra}` : ""}`);
  }
}
function eq(a: unknown, b: unknown, name: string) {
  assert(name, a === b, `expected ${b}, got ${a}`);
}

console.log("Move #N.13 — next-move-what-if.ts");

// -- Scenario 1: empty plan matches baseline
{
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, {});
  eq(sim.hypotheticalMoves.length, 0, "1.1 empty plan → 0 hypotheticals");
  eq(sim.unknownMoveIds.length, 0, "1.2 empty plan → 0 unknowns");
  eq(sim.cumulativeLiftLowUsd, 0, "1.3 empty plan → 0 cumulative lift low");
  eq(sim.cumulativeLiftHighUsd, 0, "1.4 empty plan → 0 cumulative lift high");
  eq(sim.cumulativeDaysToShip, 0, "1.5 empty plan → 0 days");
  eq(sim.cumulativeCostMidUsd, 0, "1.6 empty plan → 0 cost");
  eq(sim.sroiDeltaUsdPerDay, 0, "1.7 empty plan → 0 SROI delta");
  eq(sim.topMoveChanged, false, "1.8 empty plan → top unchanged");
  eq(sim.baseline.move?.id, sim.projected.move?.id, "1.9 empty plan → baseline.move === projected.move");
}

// -- Scenario 2: add Move #1 (highest-priority, highest-SROI)
{
  const plan = { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" } };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  eq(sim.hypotheticalMoves.length, 1, "2.1 one-move plan → 1 hypothetical");
  eq(sim.hypotheticalMoves[0].id, "01-abandoned-cart-flow-klaviyo", "2.2 hypothetical is Move #1");
  const m = MOVE_RECOMMENDATIONS[0]; // 01-abandoned-cart
  const expectedLiftLow = YOUR_STORE_DEFAULTS.aov * YOUR_STORE_DEFAULTS.monthlyOrders * m.liftLow;
  const expectedLiftHigh = YOUR_STORE_DEFAULTS.aov * YOUR_STORE_DEFAULTS.monthlyOrders * m.liftHigh;
  eq(sim.cumulativeLiftLowUsd, expectedLiftLow, "2.3 lift low matches expected");
  eq(sim.cumulativeLiftHighUsd, expectedLiftHigh, "2.4 lift high matches expected");
  eq(sim.cumulativeDaysToShip, m.daysToShip, "2.5 days match");
  eq(sim.topMoveChanged, true, "2.6 top changed after consuming #1");
  // After consuming #1, baseline's #1 (Move #1) should now point to Move #2 or higher
  assert("2.7 projected.move.id != Move #1", sim.projected.move?.id !== "01-abandoned-cart-flow-klaviyo", `got ${sim.projected.move?.id}`);
}

// -- Scenario 3: SROI delta — consuming the TOP-SROI move drops projected best
{
  // For $75 AOV × 1k orders = $75k monthly revenue, the canonical SROI
  // top is Move #6 (install attribution: 0.175 mid / 2d → $6562.5/d).
  // Move #3 is #2 at $4125/d, Move #1 is #3 at $1875/d. To drop the
  // projected best SROI, we must consume the actual top-SROI move.
  const baselineRanking = runWhatIf(YOUR_STORE_DEFAULTS, {}, {}).baselineSroiRanking;
  const topBaselineSroi = baselineRanking[0].sroiUsdPerDay;
  assert("3.1 baseline top SROI > 0", topBaselineSroi > 0, `got ${topBaselineSroi}`);
  eq(baselineRanking[0].moveId, "06-install-attribution-triplewhale-or-polar", "3.1b baseline top is Move #6 (attribution)");

  const plan = { "06-install-attribution-triplewhale-or-polar": { addedAt: "2026-10-05T00:00:00Z" } };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  assert(
    "3.2 SROI delta is negative when consuming top-SROI move",
    sim.sroiDeltaUsdPerDay < 0,
    `got ${sim.sroiDeltaUsdPerDay}`
  );
  assert(
    "3.3 projected best SROI < baseline best SROI",
    sim.projectedBestSroiUsdPerDay < sim.baselineBestSroiUsdPerDay,
    `proj=${sim.projectedBestSroiUsdPerDay} base=${sim.baselineBestSroiUsdPerDay}`
  );
}

// -- Scenario 4: hypotheticals merge with already-shipped
{
  // Already shipped Move #1 (abandoned cart, rank 1) + Move #3 (checkout
  // audit, rank 2 = checkout-audit); hypothetically add Move #2 (post-
  // purchase upsell, rank 4). With #1, #2 (checkout), and #2 (post-
  // purchase) all in the merged map, the projected pick is the next
  // eligible unblocked move by priority: rank 3 = welcome series.
  const shipped = {
    "01-abandoned-cart-flow-klaviyo": { shippedAt: "2026-09-01T00:00:00Z" },
    "03-checkout-audit-baymard": { shippedAt: "2026-09-01T00:00:00Z" },
  };
  const plan = { "02-post-purchase-upsell-reconvert": { addedAt: "2026-10-05T00:00:00Z" } };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, shipped, plan);
  eq(sim.projected.move?.id, "04-welcome-series-klaviyo", "4.1 projected is Move #3 (welcome series, rank 3)");
  assert("4.2 mergedShipped has 3 keys", Object.keys(sim.mergedShipped).length === 3, `got ${Object.keys(sim.mergedShipped).length}`);
  eq(sim.cumulativeLiftHighUsd, YOUR_STORE_DEFAULTS.aov * YOUR_STORE_DEFAULTS.monthlyOrders * 0.15, "4.3 cumulative lift uses Move #2 (post-purchase) band");
}

// -- Scenario 5: unknown move IDs are flagged, not crashing
{
  const plan = {
    "this-does-not-exist": { addedAt: "2026-10-05T00:00:00Z" },
    "03-checkout-audit-baymard": { addedAt: "2026-10-05T00:00:00Z" },
  };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  eq(sim.hypotheticalMoves.length, 1, "5.1 unknown IDs are dropped, known ones kept");
  eq(sim.hypotheticalMoves[0].id, "03-checkout-audit-baymard", "5.2 known ID is Move #3");
  eq(sim.unknownMoveIds.length, 1, "5.3 unknownMoveIds has 1 entry");
  eq(sim.unknownMoveIds[0], "this-does-not-exist", "5.4 unknownMoveIds[0] is the typo");
}

// -- Scenario 6: hypotheticalSroi array carries per-move SROI
{
  const plan = {
    "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" },
    "03-checkout-audit-baymard": { addedAt: "2026-10-05T00:00:00Z" },
  };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  eq(sim.hypotheticalSroi.length, 2, "6.1 hypotheticalSroi has 2 entries");
  assert("6.2 hypotheticalSroi[0] has positive sroi", sim.hypotheticalSroi[0].sroi.sroiUsdPerDay > 0, `got ${sim.hypotheticalSroi[0].sroi.sroiUsdPerDay}`);
  // Move #3 (zero cost, 5d) is the highest-SROI move; Move #1 is second.
  // Verify both SROIs are captured, but don't assert sort order (depends
  // on the canonical SROI ranking which is SROI desc + priority tie-break).
  const sroi0Id = sim.hypotheticalSroi[0].move.id;
  assert("6.3 hypotheticalSroi[0] is a known move", sroi0Id === "01-abandoned-cart-flow-klaviyo" || sroi0Id === "03-checkout-audit-baymard");
}

// -- Scenario 7: SROI delta with custom Your-store
{
  // $150 AOV × 4k orders = $600k/mo.
  // Note: baseline best SROI is Move #3 (zero cost, 5d, 0.275 mid-lift
  // → $33k/d). After consuming Move #1, projected best is STILL Move #3
  // (zero cost), so delta = 0 in this scenario — Move #3 was never in
  // the hypothetical plan. This is the canonical "the high-SROI zero-
  // cost moves are untouched" case.
  const bigStore = { aov: 150, monthlyOrders: 4000, grossMargin: 0.7 };
  const sim = runWhatIf(bigStore, {}, { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" } });
  assert("7.1 big-store SROI > 0", sim.baselineBestSroiUsdPerDay > 0, `got ${sim.baselineBestSroiUsdPerDay}`);
  eq(sim.sroiDeltaUsdPerDay, 0, "7.2 big-store delta is 0 (Move #3 still wins)");
  // Cumulative lift = 600k × 0.075 = 45000
  eq(sim.cumulativeLiftLowUsd, 600000 * 0.05, "7.3 cumulative lift low = $30k");
  eq(sim.cumulativeLiftHighUsd, 600000 * 0.10, "7.4 cumulative lift high = $60k");
}

// -- Scenario 8: hypotheticals containing a prereq-blocked move are not blocked
{
  // Move #10 (10-ai-ad-creative-iteration) needs Move #6 (06-install-attribution)
  // If we hypothetically add both, projected ranking should still work
  const plan = {
    "10-ai-ad-creative-iteration": { addedAt: "2026-10-05T00:00:00Z" },
    "06-install-attribution-triplewhale-or-polar": { addedAt: "2026-10-05T00:00:00Z" },
  };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  eq(sim.hypotheticalMoves.length, 2, "8.1 two hypotheticals");
  // Both should be in hypotheticalSroi
  eq(sim.hypotheticalSroi.length, 2, "8.2 both have SROI snapshots");
}

// -- Scenario 9: zero hypotheticals + already-shipped-everything → null projected.move
{
  const allShipped: Record<string, unknown> = {};
  for (const m of MOVE_RECOMMENDATIONS) {
    allShipped[m.id] = { shippedAt: "2026-09-01T00:00:00Z" };
  }
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, allShipped, {});
  eq(sim.projected.move, null, "9.1 projected.move null when all shipped");
  eq(sim.topMoveChanged, false, "9.2 topMoveChanged false (both null)");
  eq(sim.sroiDeltaUsdPerDay, 0, "9.3 SROI delta 0 when nothing to compare");
}

// -- Scenario 10: tone-class thresholds
{
  eq(sroiDeltaToneClass(0), "border-border bg-background text-muted-foreground", "10.1 delta=0 → muted");
  eq(sroiDeltaToneClass(100), "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300", "10.2 delta=100 → sky");
  eq(sroiDeltaToneClass(1000), "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", "10.3 delta=1000 → emerald");
  eq(sroiDeltaToneClass(-100), "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300", "10.4 delta=-100 → amber");
  eq(sroiDeltaToneClass(-1000), "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300", "10.5 delta=-1000 → rose");
  eq(sroiDeltaToneClass(NaN), "border-border bg-background text-muted-foreground", "10.6 NaN → muted");
}

// -- Scenario 11: describeSroiDelta formats
{
  eq(describeSroiDelta(0), "Best $/day unchanged", "11.1 delta=0 → unchanged");
  eq(describeSroiDelta(1500), "+$1.5k/d", "11.2 delta=1500 → +$1.5k/d (1-decimal k)");
  eq(describeSroiDelta(-2500), "−$2.5k/d", "11.3 delta=-2500 → −$2.5k/d");
  eq(describeSroiDelta(NaN), "—", "11.4 NaN → —");
  eq(describeSroiDelta(15000), "+$15k/d", "11.5 delta=15000 → +$15k/d (round k)");
  eq(describeSroiDelta(-1500000), "−$1.50M/d", "11.6 delta=-1.5M → −$1.50M/d");
}

// -- Scenario 12: toggleWhatIf pure
{
  const m1 = toggleWhatIf({}, "01-abandoned-cart-flow-klaviyo");
  eq(Object.keys(m1).length, 1, "12.1 toggle add → 1 key");
  const m2 = toggleWhatIf(m1, "01-abandoned-cart-flow-klaviyo");
  eq(Object.keys(m2).length, 0, "12.2 toggle remove → 0 keys");
  const m3 = toggleWhatIf(m1, "03-checkout-audit-baymard");
  eq(Object.keys(m3).length, 2, "12.3 toggle add second → 2 keys");
}

// -- Scenario 13: whatIfToMarkdown for empty plan
{
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, {});
  const md = whatIfToMarkdown(sim);
  assert("13.1 empty markdown has plan header", md.includes("# What-if shipping plan"));
  assert("13.2 empty markdown mentions no moves", md.includes("No moves added"));
  assert("13.3 empty markdown has timestamp", md.includes("_Generated"));
}

// -- Scenario 14: whatIfToMarkdown for populated plan
{
  const plan = { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" } };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  const md = whatIfToMarkdown(sim);
  assert("14.1 populated markdown has plan section", md.includes("## Plan"));
  assert("14.2 markdown mentions Move #1", md.includes("Move #1"));
  assert("14.3 markdown has cumulative impact", md.includes("Cumulative impact"));
  assert("14.4 markdown mentions SROI", md.includes("SROI"));
  assert("14.5 markdown has algorithm-recommendation footer", md.includes("algorithm will recommend"));
}

// -- Scenario 15: storage key + event constants
{
  eq(NEXT_MOVE_WHAT_IF_STORAGE_KEY, "ecom-ops:next-move-what-if:v1", "15.1 storage key");
  eq(NEXT_MOVE_WHAT_IF_UPDATE_EVENT, "ecom-ops:next-move-what-if:update", "15.2 update event");
}

// -- Scenario 16: hypotheticals sorted by priorityRank
{
  const plan = {
    "10-ai-ad-creative-iteration": { addedAt: "2026-10-05T00:00:00Z" },
    "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" },
    "04-welcome-series-klaviyo": { addedAt: "2026-10-05T00:00:00Z" },
  };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  eq(sim.hypotheticalMoves[0].priorityRank, 1, "16.1 first by rank=1");
  eq(sim.hypotheticalMoves[1].priorityRank, 3, "16.2 second by rank=3 (welcome)");
  eq(sim.hypotheticalMoves[2].priorityRank, 10, "16.3 third by rank=10");
}

// -- Scenario 17: overrideId forwarded to both baseline and projected
{
  // Override Move #5 (which has lower priority than Move #1)
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, {}, "05-migrate-to-klaviyo-postscript");
  eq(sim.baseline.move?.id, "05-migrate-to-klaviyo-postscript", "17.1 override applied to baseline");
  eq(sim.projected.move?.id, "05-migrate-to-klaviyo-postscript", "17.2 override applied to projected");
  eq(sim.topMoveChanged, false, "17.3 no change with no hypotheticals");
}

// -- Scenario 18: SROI ranking reflects projected state (post-plan)
{
  const plan = { "01-abandoned-cart-flow-klaviyo": { addedAt: "2026-10-05T00:00:00Z" } };
  const sim = runWhatIf(YOUR_STORE_DEFAULTS, {}, plan);
  // baseline ranking should include Move #1
  assert("18.1 baseline ranking includes Move #1", sim.baselineSroiRanking.some((r) => r.moveId === "01-abandoned-cart-flow-klaviyo"));
  // projected ranking should NOT include Move #1
  assert("18.2 projected ranking excludes Move #1", !sim.projectedSroiRanking.some((r) => r.moveId === "01-abandoned-cart-flow-klaviyo"));
  eq(sim.projectedSroiRanking.length, sim.baselineSroiRanking.length - 1, "18.3 projected is one shorter");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
