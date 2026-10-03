/**
 * TDD contract tests for `lifecycle-fleet-rollup.ts`.
 *
 * Covers:
 *   - empty map → all zeros, no flows scored, no worstFlows
 *   - all-PASS → allPassed=true, no FAIL/NEEDS_WORK, estLost=0
 *   - all-FAIL → atRiskRevenueUsd sums, hasAnyFail=true, worstFlows sorted
 *   - tie-break: worstFlows ordered by rev desc when scores tie
 *   - sanitizeKpisByFlow filters unknown flow_ids + non-numeric fields
 *   - per-pillar estLost band sums the canonical REVENUE_FLOORS_PER_PILLAR
 *   - canonicalPassKpis from lifecycle-flow-health is used to seed 13 PASS
 *
 * Run with: `npx jiti src/lib/__tests__/lifecycle-fleet-rollup.test.ts`
 */

import {
  PATH_B_FLOWS,
  canonicalPassKpis,
  type FlowKpis,
} from "../lifecycle-flow-health";
import {
  LIFECYCLE_FLEET_STORAGE_KEY,
  LIFECYCLE_FLEET_UPDATE_EVENT,
  REVENUE_FLOORS_PER_PILLAR_HIGH,
  REVENUE_FLOORS_PER_PILLAR_LOW,
  canonicalFleetFlows,
  sanitizeKpisByFlow,
  summarizeLifecycleFleet,
} from "../lifecycle-fleet-rollup";

const assert = (cond: unknown, msg: string): void => {
  if (!cond) throw new Error("FAIL: " + msg);
};

// ----- empty -----
{
  const sum = summarizeLifecycleFleet({});
  assert(sum.flowsScored === 0, "empty: flowsScored === 0");
  assert(sum.totalFlows === 13, "empty: totalFlows === 13");
  assert(sum.pass === 0, "empty: pass === 0");
  assert(sum.warn === 0, "empty: warn === 0");
  assert(sum.needWork === 0, "empty: needWork === 0");
  assert(sum.fail === 0, "empty: fail === 0");
  assert(sum.atRiskRevenueUsd === 0, "empty: atRiskRevenueUsd === 0");
  assert(sum.healthyRevenueUsd === 0, "empty: healthyRevenueUsd === 0");
  assert(sum.totalRevenueUsd === 0, "empty: totalRevenueUsd === 0");
  assert(sum.worstFlows.length === 0, "empty: worstFlows.length === 0");
  assert(sum.hasAnyFail === false, "empty: hasAnyFail === false");
  assert(sum.hasAnyNeedWork === false, "empty: hasAnyNeedWork === false");
  assert(sum.allPassed === false, "empty: allPassed === false");
  assert(sum.estLostRevenueBand.low === 0, "empty: estLost low === 0");
  assert(sum.estLostRevenueBand.high === 0, "empty: estLost high === 0");
  assert(
    Object.keys(sum.atRiskByPillar).length === 0,
    "empty: atRiskByPillar empty",
  );
}

// ----- all PASS (seed canonical pass for all 13) -----
{
  const map: Record<string, FlowKpis> = {};
  for (const f of PATH_B_FLOWS) map[f.flow_id] = canonicalPassKpis(f);
  const sum = summarizeLifecycleFleet(map);
  assert(sum.flowsScored === 13, "all-pass: flowsScored === 13");
  assert(sum.pass === 13, `all-pass: pass === 13 (got ${sum.pass})`);
  assert(sum.warn === 0, "all-pass: warn === 0");
  assert(sum.needWork === 0, "all-pass: needWork === 0");
  assert(sum.fail === 0, "all-pass: fail === 0");
  assert(sum.hasAnyFail === false, "all-pass: hasAnyFail === false");
  assert(sum.hasAnyNeedWork === false, "all-pass: hasAnyNeedWork === false");
  assert(sum.allPassed === true, "all-pass: allPassed === true");
  assert(sum.atRiskRevenueUsd === 0, "all-pass: atRiskRevenueUsd === 0");
  assert(sum.healthyRevenueUsd > 0, "all-pass: healthyRevenueUsd > 0");
  assert(sum.totalRevenueUsd === sum.healthyRevenueUsd, "all-pass: total = healthy");
  assert(sum.worstFlows.length === 3, "all-pass: worstFlows.length === 3");
  // estLost should be 0 because no at-risk flows
  assert(sum.estLostRevenueBand.low === 0, "all-pass: estLost low === 0");
  assert(sum.estLostRevenueBand.high === 0, "all-pass: estLost high === 0");
}

// ----- mixed: 1 FAIL + 1 NEEDS_WORK + 1 PASS + 1 WARN + 9 unscored -----
{
  // Take 5 specific flows so we can drive deterministic verdicts.
  // We seed PASS for all 13 first, then mutate 4 of them.
  const map: Record<string, FlowKpis> = {};
  for (const f of PATH_B_FLOWS) map[f.flow_id] = canonicalPassKpis(f);
  // Mutate one to FAIL: cut CVR by 95%, drop revenue 50x, kill clicks, kill opens
  const failFlow = PATH_B_FLOWS[0];
  map[failFlow.flow_id] = {
    ...map[failFlow.flow_id],
    conversions: 0,
    revenue: 10,
    clicks: 1,
    opens: 5,
  };
  // Mutate one to NEEDS_WORK: cut CVR by 50%, drop revenue 4x
  const nwFlow = PATH_B_FLOWS[1];
  map[nwFlow.flow_id] = {
    ...map[nwFlow.flow_id],
    conversions: Math.floor(map[nwFlow.flow_id].conversions * 0.3),
    revenue: 200,
  };
  // Mutate one to WARN: bump unsubs slightly, drop revenue modestly
  const warnFlow = PATH_B_FLOWS[2];
  map[warnFlow.flow_id] = {
    ...map[warnFlow.flow_id],
    unsubscribes: map[warnFlow.flow_id].unsubscribes + 5,
    revenue: 800,
  };
  // One flow stays at PASS (index 3)

  const sum = summarizeLifecycleFleet(map);
  assert(sum.flowsScored === 13, "mixed: all 13 still scored");
  assert(sum.fail >= 1, `mixed: fail >= 1 (got ${sum.fail})`);
  assert(sum.needWork >= 1, `mixed: needWork >= 1 (got ${sum.needWork})`);
  assert(sum.hasAnyFail === true, "mixed: hasAnyFail === true");
  assert(sum.hasAnyNeedWork === true, "mixed: hasAnyNeedWork === true");
  assert(sum.allPassed === false, "mixed: allPassed === false");
  assert(sum.atRiskRevenueUsd > 0, "mixed: atRiskRevenueUsd > 0");
  assert(sum.healthyRevenueUsd > 0, "mixed: healthyRevenueUsd > 0");
  assert(
    sum.totalRevenueUsd === sum.atRiskRevenueUsd + sum.healthyRevenueUsd,
    "mixed: total = atRisk + healthy",
  );
  // worstFlows should contain the FAIL flow as #1
  assert(sum.worstFlows.length === 3, "mixed: worstFlows.length === 3");
  assert(sum.worstFlows[0].flow_id === failFlow.flow_id, "mixed: worst[0] is fail flow");
  assert(sum.worstFlows[0].verdict === "FAIL", "mixed: worst[0] verdict is FAIL");
  assert(
    sum.worstFlows[0].score <= sum.worstFlows[1].score,
    "mixed: worst sorted ascending",
  );

  // estLost: should sum at-least 1 floor for the FAIL pillar + 1 for the NEEDS_WORK pillar
  const failPillar = failFlow.pillar;
  const nwPillar = nwFlow.pillar;
  const expectedLoLow =
    (REVENUE_FLOORS_PER_PILLAR_LOW[failPillar] ?? 250) +
    (REVENUE_FLOORS_PER_PILLAR_LOW[nwPillar] ?? 250);
  const expectedHiHigh =
    (REVENUE_FLOORS_PER_PILLAR_HIGH[failPillar] ?? 700) +
    (REVENUE_FLOORS_PER_PILLAR_HIGH[nwPillar] ?? 700);
  assert(
    sum.estLostRevenueBand.low >= expectedLoLow,
    `mixed: estLost low >= ${expectedLoLow} (got ${sum.estLostRevenueBand.low})`,
  );
  assert(
    sum.estLostRevenueBand.high >= expectedHiHigh,
    `mixed: estLost high >= ${expectedHiHigh} (got ${sum.estLostRevenueBand.high})`,
  );

  // atRiskByPillar contains both pillars
  assert(
    sum.atRiskByPillar[failPillar] !== undefined,
    `mixed: atRiskByPillar[${failPillar}] present`,
  );
  assert(
    sum.atRiskByPillar[nwPillar] !== undefined,
    `mixed: atRiskByPillar[${nwPillar}] present`,
  );
}

// ----- tie-break: same score, higher revenue first -----
{
  const map: Record<string, FlowKpis> = {};
  // Seed only 2 flows with identical bad KPIs
  const f1 = PATH_B_FLOWS[0];
  const f2 = PATH_B_FLOWS[1];
  // Force both into FAIL: tiny sent, low everything
  const failKpis: FlowKpis = {
    sent: 100,
    opens: 5,
    clicks: 1,
    conversions: 0,
    unsubscribes: 1,
    revenue: 100, // both same score
    flow_attributed: 30,
  };
  map[f1.flow_id] = { ...failKpis, revenue: 5000 };
  map[f2.flow_id] = { ...failKpis, revenue: 1000 };
  // Add 11 PASS so flowsScored === 13 (only matters for totalFlows assertion)
  for (let i = 2; i < PATH_B_FLOWS.length; i++) {
    map[PATH_B_FLOWS[i].flow_id] = canonicalPassKpis(PATH_B_FLOWS[i]);
  }
  const sum = summarizeLifecycleFleet(map);
  assert(sum.flowsScored === 13, "tie: all 13 scored");
  assert(sum.fail === 2, `tie: fail === 2 (got ${sum.fail})`);
  assert(sum.worstFlows.length === 3, "tie: worstFlows.length === 3");
  // Both FAIL flows must be in the worst 3; higher-revenue FAIL first.
  assert(
    sum.worstFlows[0].flow_id === f1.flow_id && sum.worstFlows[0].revenue === 5000,
    "tie: worst[0] is the $5000 flow (tie-break by revenue)",
  );
  assert(
    sum.worstFlows[1].flow_id === f2.flow_id && sum.worstFlows[1].revenue === 1000,
    "tie: worst[1] is the $1000 flow",
  );
  assert(
    sum.worstFlows[0].score <= sum.worstFlows[1].score,
    "tie: sorted ascending by score",
  );
}

// ----- sanitize: filters unknown flow_id + non-numeric fields -----
{
  const raw = {
    [PATH_B_FLOWS[0].flow_id]: {
      sent: 1000,
      opens: 400,
      clicks: 50,
      conversions: 5,
      unsubscribes: 2,
      revenue: 500,
      flow_attributed: 800,
    },
    // Unknown flow id — must be filtered out
    "bogus_flow_id_9999": {
      sent: 9999,
      opens: 9999,
      clicks: 9999,
      conversions: 9999,
      unsubscribes: 9999,
      revenue: 9999,
      flow_attributed: 9999,
    },
    // Non-numeric — must be filtered out
    [PATH_B_FLOWS[1].flow_id]: {
      sent: "not_a_number",
      opens: 400,
      clicks: 50,
      conversions: 5,
      unsubscribes: 2,
      revenue: 500,
      flow_attributed: 800,
    },
    // Missing fields — must be filtered out
    [PATH_B_FLOWS[2].flow_id]: {
      sent: 1000,
      opens: 400,
      // clicks missing
      conversions: 5,
      unsubscribes: 2,
      revenue: 500,
      flow_attributed: 800,
    },
  };
  const sanitized = sanitizeKpisByFlow(raw);
  assert(
    Object.keys(sanitized).length === 1,
    `sanitize: only 1 valid flow (got ${Object.keys(sanitized).length})`,
  );
  assert(
    sanitized[PATH_B_FLOWS[0].flow_id] !== undefined,
    "sanitize: kept valid flow",
  );
  assert(
    sanitized["bogus_flow_id_9999"] === undefined,
    "sanitize: filtered bogus id",
  );
  assert(
    sanitized[PATH_B_FLOWS[1].flow_id] === undefined,
    "sanitize: filtered non-numeric",
  );
  assert(
    sanitized[PATH_B_FLOWS[2].flow_id] === undefined,
    "sanitize: filtered missing field",
  );
}

// ----- sanitize: handles null / undefined / non-object -----
{
  assert(
    Object.keys(sanitizeKpisByFlow(null)).length === 0,
    "sanitize(null): empty",
  );
  assert(
    Object.keys(sanitizeKpisByFlow(undefined)).length === 0,
    "sanitize(undefined): empty",
  );
  assert(
    Object.keys(sanitizeKpisByFlow("not_an_object")).length === 0,
    "sanitize(string): empty",
  );
  assert(
    Object.keys(sanitizeKpisByFlow(42)).length === 0,
    "sanitize(number): empty",
  );
}

// ----- sanitize: clamps negative values to 0 -----
{
  const raw = {
    [PATH_B_FLOWS[0].flow_id]: {
      sent: -100, // negative
      opens: 400,
      clicks: 50,
      conversions: 5,
      unsubscribes: 2,
      revenue: -500, // negative
      flow_attributed: 800,
    },
  };
  const sanitized = sanitizeKpisByFlow(raw);
  assert(sanitized[PATH_B_FLOWS[0].flow_id].sent === 0, "sanitize: sent clamped to 0");
  assert(
    sanitized[PATH_B_FLOWS[0].flow_id].revenue === 0,
    "sanitize: revenue clamped to 0",
  );
}

// ----- storage key + update event constants (regression guard for cross-tab wiring) -----
{
  assert(
    LIFECYCLE_FLEET_STORAGE_KEY === "ecom-ops:lifecycle-flow-health:v1",
    "storage key matches lifecycle-flow-health-audit",
  );
  assert(
    LIFECYCLE_FLEET_UPDATE_EVENT === "ecom-ops:lifecycle-flow-health:update",
    "update event matches lifecycle-flow-health-audit",
  );
}

// ----- canonicalFleetFlows returns the 13 -----
{
  const flows = canonicalFleetFlows();
  assert(flows.length === 13, `canonicalFleetFlows: 13 flows (got ${flows.length})`);
  assert(
    flows.every((f) => typeof f.flow_id === "string" && f.flow_id.length > 0),
    "canonicalFleetFlows: every flow has a flow_id",
  );
}

// ----- summary when fewer than 3 flows scored: worstFlows.length === total -----
{
  const map: Record<string, FlowKpis> = {};
  map[PATH_B_FLOWS[0].flow_id] = canonicalPassKpis(PATH_B_FLOWS[0]);
  map[PATH_B_FLOWS[1].flow_id] = canonicalPassKpis(PATH_B_FLOWS[1]);
  const sum = summarizeLifecycleFleet(map);
  assert(sum.flowsScored === 2, "few: flowsScored === 2");
  assert(sum.worstFlows.length === 2, "few: worstFlows.length === 2");
}

console.log(
  `PASS: lifecycle-fleet-rollup.test.ts — ${[
    "empty",
    "all-pass",
    "mixed",
    "tie-break",
    "sanitize-bad",
    "sanitize-null",
    "sanitize-clamp",
    "constants",
    "canonical-flows",
    "few-flows",
  ].length}/10 scenarios OK`,
);