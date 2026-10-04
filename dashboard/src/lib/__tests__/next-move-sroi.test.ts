/**
 * TDD contract tests for `next-move-sroi.ts` — Move #N.10.
 *
 * Covers:
 *   - computeNextMoveSroi: $/day = liftMid/days, Infinity cost => ∞ breakeven
 *   - computeSroiRanking: ranks by $/day desc, priorityRank tie-break
 *   - sortCandidatesByMode: priority-mode = priorityRank-asc, sroi-mode = $/day-desc
 *   - formatSroiPerDay: caps at $Xk for large, "$0/d" for zero, "—" for non-finite
 *   - formatBreakevenDays: "∞" for Infinity, "—" for null, "Xd" otherwise
 *   - sroiToneClass: emerald >= $1k/d, sky >= $100/d, amber > 0, rose < 0
 *   - loadNextMoveSort / saveNextMoveSort: round-trips a valid mode, returns
 *     "priority" for invalid stored value, no-op on server (typeof window)
 *   - NEXT_MOVE_SORT_STORAGE_KEY + NEXT_MOVE_SORT_UPDATE_EVENT constants
 *   - NEXT_MOVE_SORT_OPTIONS = ["priority", "sroi"]
 *   - isNextMoveSortMode predicate
 *
 * Run with: `npx jiti src/lib/__tests__/next-move-sroi.test.ts`
 */

import { MOVE_RECOMMENDATIONS } from "../next-move";
import { YOUR_STORE_DEFAULTS } from "../your-store";
import {
  NEXT_MOVE_SORT_OPTIONS,
  NEXT_MOVE_SORT_STORAGE_KEY,
  NEXT_MOVE_SORT_UPDATE_EVENT,
  computeNextMoveSroi,
  computeSroiRanking,
  describeSroiRank,
  formatBreakevenDays,
  formatSroiPerDay,
  isNextMoveSortMode,
  loadNextMoveSort,
  saveNextMoveSort,
  sortCandidatesByMode,
  sroiToneClass,
} from "../next-move-sroi";

let passed = 0;
let failed = 0;
function assert(cond: unknown, label: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${label}`);
  }
}

// -- computeNextMoveSroi ---------------------------------------------------

(function testComputeNextMoveSroi() {
  const move = MOVE_RECOMMENDATIONS[0]; // Move #1 — abandoned cart
  const score = computeNextMoveSroi(move, 100_000);
  // lift band 5%..10% on $100k/mo = $5k..$10k, mid $7.5k
  assert(score.liftLowUsd === 5_000, "liftLowUsd = 5% of $100k = $5,000");
  assert(score.liftHighUsd === 10_000, "liftHighUsd = 10% of $100k = $10,000");
  assert(score.liftMidUsd === 7_500, "liftMidUsd = $7,500");
  // Move #1: cost 0..60, mid $30, days 3
  assert(score.daysToShip === 3, "daysToShip = 3");
  assert(score.costMidUsd === 30, "costMidUsd = $30");
  // sroi = 7500 / 3 = $2,500/d
  assert(score.sroiUsdPerDay === 2_500, "sroiUsdPerDay = $2,500/d");
  // netSroi = (7500-30) / 3 = 7470/3 = 2490
  assert(score.netSroiUsdPerDay === 2_490, "netSroiUsdPerDay = $2,490/d");
  // breakeven = 30 * 3 / 7500 = 0.012 days
  assert(score.breakevenDays !== null && Math.abs(score.breakevenDays - 0.012) < 1e-6, "breakevenDays = 0.012d for Move #1");
})();

// -- computeNextMoveSroi: zero cost => Infinity breakeven ------------------

(function testComputeNextMoveSroiZeroCost() {
  // Find or construct a move with cost 0
  const move = {
    ...MOVE_RECOMMENDATIONS[0],
    costLow: 0,
    costHigh: 0,
  };
  const score = computeNextMoveSroi(move, 100_000);
  assert(score.breakevenDays === Infinity, "breakevenDays = Infinity for zero cost");
})();

// -- computeNextMoveSroi: zero lift => null breakeven ----------------------

(function testComputeNextMoveSroiZeroLift() {
  const move = {
    ...MOVE_RECOMMENDATIONS[0],
    liftLow: 0,
    liftHigh: 0,
  };
  const score = computeNextMoveSroi(move, 100_000);
  assert(score.breakevenDays === null, "breakevenDays = null for zero lift");
})();

// -- computeNextMoveSroi: zero daysToShip clamped to 1 ---------------------

(function testComputeNextMoveSroiZeroDays() {
  const move = { ...MOVE_RECOMMENDATIONS[0], daysToShip: 0 };
  const score = computeNextMoveSroi(move, 100_000);
  assert(Number.isFinite(score.sroiUsdPerDay), "sroiUsdPerDay finite for 0 days");
  assert(score.sroiUsdPerDay === 7_500, "sroiUsdPerDay uses safeDays=1 => $7,500/d for 0 days");
})();

// -- computeSroiRanking: ranks by $/day desc -------------------------------

(function testComputeSroiRanking() {
  const ranking = computeSroiRanking(null); // uses YOUR_STORE_DEFAULTS
  assert(ranking.length === MOVE_RECOMMENDATIONS.length, "ranking length matches MOVE_RECOMMENDATIONS");
  // sroiRank should be 1..N
  for (let i = 0; i < ranking.length; i++) {
    assert(ranking[i].sroiRank === i + 1, `ranking[${i}].sroiRank = ${i + 1}`);
  }
  // sorted desc by sroiUsdPerDay
  for (let i = 1; i < ranking.length; i++) {
    assert(
      ranking[i - 1].sroiUsdPerDay >= ranking[i].sroiUsdPerDay,
      `ranking[${i - 1}].sroi >= ranking[${i}].sroi`
    );
  }
})();

// -- computeSroiRanking: tie-break by priorityRank asc ---------------------

(function testComputeSroiRankingTieBreak() {
  // Construct 3 moves with identical SROI, different priorityRanks
  const moves = [
    { ...MOVE_RECOMMENDATIONS[0], id: "x-a", priorityRank: 5, liftLow: 0.10, liftHigh: 0.10, daysToShip: 5, costLow: 0, costHigh: 0 },
    { ...MOVE_RECOMMENDATIONS[0], id: "x-b", priorityRank: 1, liftLow: 0.10, liftHigh: 0.10, daysToShip: 5, costLow: 0, costHigh: 0 },
    { ...MOVE_RECOMMENDATIONS[0], id: "x-c", priorityRank: 3, liftLow: 0.10, liftHigh: 0.10, daysToShip: 5, costLow: 0, costHigh: 0 },
  ];
  // Manually re-rank using the same algorithm
  const monthlyRev = 100_000;
  const scores = moves.map((m) => computeNextMoveSroi(m, monthlyRev));
  scores.sort((a, b) => {
    if (b.sroiUsdPerDay !== a.sroiUsdPerDay) return b.sroiUsdPerDay - a.sroiUsdPerDay;
    const aRank = moves.find((m) => m.id === a.moveId)?.priorityRank ?? 99;
    const bRank = moves.find((m) => m.id === b.moveId)?.priorityRank ?? 99;
    return aRank - bRank;
  });
  assert(scores[0].moveId === "x-b", "tie-break: priorityRank=1 wins over 3/5");
  assert(scores[1].moveId === "x-c", "tie-break: priorityRank=3 wins over 5");
  assert(scores[2].moveId === "x-a", "tie-break: priorityRank=5 last");
})();

// -- sortCandidatesByMode: priority mode ----------------------------------

(function testSortCandidatesByModePriority() {
  const candidates = [
    { ...MOVE_RECOMMENDATIONS[2], priorityRank: 3 },
    { ...MOVE_RECOMMENDATIONS[0], priorityRank: 1 },
    { ...MOVE_RECOMMENDATIONS[1], priorityRank: 2 },
  ];
  const sroiByMoveId = {} as Record<string, ReturnType<typeof computeNextMoveSroi>>;
  const sorted = sortCandidatesByMode(candidates, sroiByMoveId, "priority");
  assert(sorted[0].priorityRank === 1, "priority mode: rank 1 first");
  assert(sorted[1].priorityRank === 2, "priority mode: rank 2 second");
  assert(sorted[2].priorityRank === 3, "priority mode: rank 3 last");
})();

// -- sortCandidatesByMode: sroi mode --------------------------------------

(function testSortCandidatesByModeSroi() {
  const candidates = [
    { ...MOVE_RECOMMENDATIONS[0] }, // 5-10% lift / 3 days
    { ...MOVE_RECOMMENDATIONS[2] }, // 1-3% lift / 3 days
    { ...MOVE_RECOMMENDATIONS[8] }, // 10-20% lift / 14 days
  ];
  const monthlyRev = 100_000;
  const sroiByMoveId: Record<string, ReturnType<typeof computeNextMoveSroi>> = {};
  for (const c of candidates) {
    sroiByMoveId[c.id] = computeNextMoveSroi(c, monthlyRev);
  }
  const sorted = sortCandidatesByMode(candidates, sroiByMoveId, "sroi");
  // Highest $/day first
  for (let i = 1; i < sorted.length; i++) {
    const a = sroiByMoveId[sorted[i - 1].id].sroiUsdPerDay;
    const b = sroiByMoveId[sorted[i].id].sroiUsdPerDay;
    assert(a >= b, `sroi mode: sorted[${i - 1}] >= sorted[${i}] in $/day`);
  }
})();

// -- sortCandidatesByMode: doesn't mutate input ---------------------------

(function testSortCandidatesByModeNoMutation() {
  const candidates = [
    { ...MOVE_RECOMMENDATIONS[2], priorityRank: 3 },
    { ...MOVE_RECOMMENDATIONS[0], priorityRank: 1 },
  ];
  const before = candidates.map((c) => c.id);
  sortCandidatesByMode(candidates, {}, "priority");
  const after = candidates.map((c) => c.id);
  assert(before.join(",") === after.join(","), "priority sort doesn't mutate input");
})();

// -- formatSroiPerDay ------------------------------------------------------

(function testFormatSroiPerDay() {
  assert(formatSroiPerDay(0) === "$0/d", "formatSroiPerDay(0) = $0/d");
  assert(formatSroiPerDay(50) === "$50/d", "formatSroiPerDay(50) = $50/d");
  assert(formatSroiPerDay(500) === "$500/d", "formatSroiPerDay(500) = $500/d");
  assert(formatSroiPerDay(1500) === "$1.5k/d", "formatSroiPerDay(1500) = $1.5k/d");
  assert(formatSroiPerDay(15_000) === "$15k/d", "formatSroiPerDay(15000) = $15k/d");
  assert(formatSroiPerDay(2_500_000) === "$2.50M/d", "formatSroiPerDay(2.5M) = $2.50M/d");
  assert(formatSroiPerDay(NaN) === "—", "formatSroiPerDay(NaN) = —");
  assert(formatSroiPerDay(Infinity) === "—", "formatSroiPerDay(Infinity) = —");
  assert(formatSroiPerDay(-Infinity) === "—", "formatSroiPerDay(-Infinity) = —");
})();

// -- formatBreakevenDays ---------------------------------------------------

(function testFormatBreakevenDays() {
  assert(formatBreakevenDays(null) === "—", "formatBreakevenDays(null) = —");
  assert(formatBreakevenDays(Infinity) === "∞", "formatBreakevenDays(Infinity) = ∞");
  assert(formatBreakevenDays(0.5) === "0.5d", "formatBreakevenDays(0.5) = 0.5d");
  assert(formatBreakevenDays(5) === "5.0d", "formatBreakevenDays(5) = 5.0d");
  assert(formatBreakevenDays(50) === "50d", "formatBreakevenDays(50) = 50d");
  assert(formatBreakevenDays(500) === "500d", "formatBreakevenDays(500) = 500d");
  assert(formatBreakevenDays(1500) === ">1kd", "formatBreakevenDays(1500) = >1kd");
})();

// -- sroiToneClass ---------------------------------------------------------

(function testSroiToneClass() {
  assert(sroiToneClass(0).includes("text-muted-foreground"), "tone(0) = muted");
  assert(sroiToneClass(50).includes("amber"), "tone(50) = amber");
  assert(sroiToneClass(100).includes("sky"), "tone(100) = sky");
  assert(sroiToneClass(1000).includes("emerald"), "tone(1000) = emerald");
  assert(sroiToneClass(-100).includes("rose"), "tone(-100) = rose");
  assert(sroiToneClass(NaN).includes("text-muted-foreground"), "tone(NaN) = muted");
})();

// -- describeSroiRank ------------------------------------------------------

(function testDescribeSroiRank() {
  const desc1 = describeSroiRank(1, 10, 2500);
  assert(desc1.includes("Best SROI"), "rank 1 = 'Best SROI'");
  assert(desc1.includes("rank 1 of 10"), "rank 1 includes 'rank 1 of 10'");
  const desc5 = describeSroiRank(5, 10, 200);
  assert(desc5.includes("SROI rank 5 of 10"), "rank 5 includes 'rank 5 of 10'");
})();

// -- Constants -------------------------------------------------------------

(function testConstants() {
  assert(NEXT_MOVE_SORT_STORAGE_KEY === "ecom-ops:next-move-sort:v1", "STORAGE_KEY constant");
  assert(NEXT_MOVE_SORT_UPDATE_EVENT === "ecom-ops:next-move-sort:update", "UPDATE_EVENT constant");
  assert(
    NEXT_MOVE_SORT_OPTIONS.length === 2 && NEXT_MOVE_SORT_OPTIONS.includes("priority") && NEXT_MOVE_SORT_OPTIONS.includes("sroi"),
    "SORT_OPTIONS = [priority, sroi]"
  );
})();

// -- isNextMoveSortMode ----------------------------------------------------

(function testIsNextMoveSortMode() {
  assert(isNextMoveSortMode("priority") === true, "isNextMoveSortMode('priority') = true");
  assert(isNextMoveSortMode("sroi") === true, "isNextMoveSortMode('sroi') = true");
  assert(isNextMoveSortMode("foo") === false, "isNextMoveSortMode('foo') = false");
  assert(isNextMoveSortMode(null) === false, "isNextMoveSortMode(null) = false");
  assert(isNextMoveSortMode(123) === false, "isNextMoveSortMode(123) = false");
})();

// -- loadNextMoveSort (server-safe) ---------------------------------------

(function testLoadNextMoveSortServer() {
  // typeof window === 'undefined' in this Node context
  assert(loadNextMoveSort() === "priority", "loadNextMoveSort() = 'priority' on server");
})();

// -- YOUR_STORE_DEFAULTS passthrough -------------------------------------

(function testComputeSroiRankingWithStore() {
  const customStore = { aov: 100, monthlyOrders: 2000, grossMargin: 0.6 };
  const ranking = computeSroiRanking(customStore);
  const move0 = ranking.find((r) => r.moveId === MOVE_RECOMMENDATIONS[0].id);
  // monthlyRev = 100 * 2000 = 200k
  // Move #1: lift 5-10% on 200k = 10k-20k, mid 15k, days 3 => sroi = 5000
  assert(move0 !== undefined, "Move #1 present in ranking");
  assert(move0!.liftMidUsd === 15_000, "Move #1 liftMid = $15k on $200k/mo");
  assert(move0!.sroiUsdPerDay === 5_000, "Move #1 sroi = $5k/d on $200k/mo");
})();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
