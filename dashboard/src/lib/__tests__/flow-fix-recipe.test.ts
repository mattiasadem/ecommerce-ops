/**
 * Tests for `flow-fix-recipe` (Move #N.12).
 *
 * Run with:
 *   cd /data/workspace/ecommerce-ops/dashboard
 *   npx jiti src/lib/__tests__/flow-fix-recipe.test.ts
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  PATH_B_FLOWS,
  scoreFlow,
  canonicalPassKpis,
  type FlowKpis,
  type LifecycleFlow,
  type FlowScore,
} from "../lifecycle-flow-health";
import {
  GATE_META,
  FLOW_PLAYBOOK_REFS,
  parseGateKey,
  buildFlowFixRecipe,
  totalMonthlyRevenueAtRiskUsd,
  totalTopFixLiftHighUsdPer1k,
  sroiToneClass,
  formatUsdPer1k,
  formatSroiPerDay,
  formatEffortDays,
  recipeToMarkdown,
  FLOW_FIX_RECIPE_STORAGE_KEY,
  FLOW_FIX_RECIPE_UPDATE_EVENT,
  type GateKey,
  type FlowFixRecipe,
} from "../flow-fix-recipe";

// ----- Fixtures --------------------------------------------------------------

/** All-gates-failing KPI set — open 10%, click 1%, CVR 0.1%, unsub 0.6%, rev $50/1k, attr 20%. */
function failAllKpis(flow: LifecycleFlow): FlowKpis {
  return {
    sent: 2000,
    opens: 200,    // 10% (under 35%)
    clicks: 20,    // 1% (under 4%)
    conversions: 2, // 0.1% (under 0.8%)
    unsubscribes: 12, // 0.6% (over 0.3%)
    revenue: 100,  // $50/1k (well under any pillar floor)
    flow_attributed: 0, // 0% (under 60%)
  };
}

/** All-gates-passing KPI set — uses the canonicalPassKpis helper from
 *  lifecycle-flow-health so the pass-fixture is byte-identical to the
 *  audit panel's "Seed canonical pass" button. */
function passAllKpis(flow: LifecycleFlow): FlowKpis {
  return canonicalPassKpis(flow);
}

function recipeFor(flow: LifecycleFlow, kpis: FlowKpis): FlowFixRecipe {
  const score: FlowScore = scoreFlow(flow, kpis);
  return buildFlowFixRecipe(score, kpis.sent);
}

// ----- Tests -----------------------------------------------------------------

test("GATE_META — all 6 gates are defined with non-zero effort + lift", () => {
  const keys: GateKey[] = ["A", "B", "C", "D", "E", "F"];
  for (const k of keys) {
    const meta = GATE_META[k];
    assert.ok(meta, `gate ${k} must be defined`);
    assert.equal(meta.key, k);
    assert.ok(meta.name.length > 0);
    assert.ok(meta.description.length > 0);
    assert.ok(meta.effortDays > 0, `gate ${k} must have positive effort`);
    assert.ok(meta.diagnosticTab.length > 0);
    assert.ok(meta.changes.length >= 1, `gate ${k} must have at least one change`);
  }
  // Gate E must have the highest lift band (it's the revenue gate).
  assert.ok(
    GATE_META.E.expectedLiftPer1kHighUsd > GATE_META.A.expectedLiftPer1kHighUsd,
    "Gate E should have higher lift than Gate A",
  );
  // Gate F (attribution) has no direct $ lift.
  assert.equal(GATE_META.F.expectedLiftPer1kLowUsd, 0);
  assert.equal(GATE_META.F.expectedLiftPer1kHighUsd, 0);
});

test("FLOW_PLAYBOOK_REFS — all 13 Path-B flows have a playbook ref", () => {
  for (const flow of PATH_B_FLOWS) {
    const ref = FLOW_PLAYBOOK_REFS[flow.flow_id];
    assert.ok(ref, `flow ${flow.flow_id} must have a playbook ref`);
    assert.ok(ref.playbookId.length > 0);
    assert.ok(ref.title.length > 0);
    assert.ok(ref.href.startsWith("/"), `ref href must be site-relative, got ${ref.href}`);
    assert.ok(ref.reason.length > 0);
  }
  assert.equal(Object.keys(FLOW_PLAYBOOK_REFS).length, PATH_B_FLOWS.length);
});

test("parseGateKey — extracts the gate letter from FlowGateFailure.gate", () => {
  assert.equal(parseGateKey({ gate: "A (open_rate)", message: "x" }), "A");
  assert.equal(parseGateKey({ gate: "B (click_rate)", message: "x" }), "B");
  assert.equal(parseGateKey({ gate: "C (cvr)", message: "x" }), "C");
  assert.equal(parseGateKey({ gate: "D (unsub_rate)", message: "x" }), "D");
  assert.equal(parseGateKey({ gate: "E (revenue)", message: "x" }), "E");
  assert.equal(parseGateKey({ gate: "F (attribution)", message: "x" }), "F");
  assert.equal(parseGateKey({ gate: "unknown", message: "x" }), null);
});

test("buildFlowFixRecipe — failAllKpis produces 6 gate fixes on every flow", () => {
  for (const flow of PATH_B_FLOWS) {
    const recipe = recipeFor(flow, failAllKpis(flow));
    assert.equal(recipe.gateFixes.length, 6, `${flow.flow_id} must have 6 failed gates`);
    // All 6 gate keys are present
    const keys = new Set(recipe.gateFixes.map((g) => g.gate));
    for (const k of ["A", "B", "C", "D", "E", "F"] as GateKey[]) {
      assert.ok(keys.has(k), `${flow.flow_id} missing gate ${k}`);
    }
  }
});

test("buildFlowFixRecipe — gateFixes are sorted by expectedLiftHighUsd desc (SROI tie-break)", () => {
  const flow = PATH_B_FLOWS[0]; // 1.1_browse_abandon, P1 floor=[300,800]
  const recipe = recipeFor(flow, failAllKpis(flow));
  for (let i = 1; i < recipe.gateFixes.length; i++) {
    assert.ok(
      recipe.gateFixes[i - 1].expectedLiftHighUsd >= recipe.gateFixes[i].expectedLiftHighUsd,
      `gateFixes[${i - 1}].lift >= gateFixes[${i}].lift`,
    );
  }
  // P1 floorHi=800, so Gate A's high lift = 800*1.0 = 800 and Gate E's high lift
  // = floorHi=800. They tie on lift — tie-break by SROI: A=2000/d beats E=275/d
  // because A is a 0.25d effort vs E's 2d effort. So the topFix is A.
  assert.equal(recipe.topFixGate, "A");
  assert.ok(recipe.topFixLiftHighUsd > 0);
  // Gate E must still appear (just not at the top)
  const hasE = recipe.gateFixes.some((g) => g.gate === "E");
  assert.ok(hasE, "Gate E must be in the recipe");
});

test("buildFlowFixRecipe — Gate E lift matches the per-pillar floor band", () => {
  for (const flow of PATH_B_FLOWS) {
    const recipe = recipeFor(flow, failAllKpis(flow));
    const gateE = recipe.gateFixes.find((g) => g.gate === "E");
    assert.ok(gateE, `${flow.flow_id} must have Gate E fix`);
    // Pillar floors: P1=[300,800], P2=[400,1200], P3=[500,1500], P4=[800,2500], P5=[200,800]
    const expectedRanges: Record<string, [number, number]> = {
      P1_browse_abandon: [300, 800],
      P2_winback_sunset: [400, 1200],
      P3_post_purchase_loyalty: [500, 1500],
      P4_replenishment: [800, 2500],
      P5_celebratory: [200, 800],
    };
    const [expectedLo, expectedHi] = expectedRanges[flow.pillar] ?? [300, 1000];
    assert.equal(gateE.expectedLiftLowUsd, expectedLo, `${flow.flow_id} Gate E low`);
    assert.equal(gateE.expectedLiftHighUsd, expectedHi, `${flow.flow_id} Gate E high`);
  }
});

test("buildFlowFixRecipe — Gate F (attribution) has 0 lift + lowest SROI", () => {
  const flow = PATH_B_FLOWS[0];
  const recipe = recipeFor(flow, failAllKpis(flow));
  const gateF = recipe.gateFixes.find((g) => g.gate === "F");
  assert.ok(gateF);
  assert.equal(gateF.expectedLiftLowUsd, 0);
  assert.equal(gateF.expectedLiftHighUsd, 0);
  // Gate F has the lowest SROI among all gates
  for (const g of recipe.gateFixes) {
    if (g.gate !== "F") {
      assert.ok(g.sroiUsdPerDay >= gateF.sroiUsdPerDay, `${g.gate} sroi >= F sroi`);
    }
  }
});

test("buildFlowFixRecipe — passAllKpis produces an empty gateFixes array", () => {
  for (const flow of PATH_B_FLOWS) {
    const recipe = recipeFor(flow, passAllKpis(flow));
    assert.equal(recipe.gateFixes.length, 0, `${flow.flow_id} should have no failed gates`);
    assert.equal(recipe.totalExpectedLiftLowUsd, 0);
    assert.equal(recipe.totalExpectedLiftHighUsd, 0);
    assert.equal(recipe.topFixGate, null);
    assert.equal(recipe.topFixLiftHighUsd, 0);
    assert.equal(recipe.monthlyRevenueAtRiskUsd, 0);
  }
});

test("buildFlowFixRecipe — monthlyRevenueAtRiskUsd = totalExpectedLiftHighUsd * sent / 1000", () => {
  const flow = PATH_B_FLOWS[0];
  const kpis = failAllKpis(flow); // sent = 2000
  const recipe = recipeFor(flow, kpis);
  const expected = Math.round((recipe.totalExpectedLiftHighUsd * kpis.sent) / 1000);
  assert.equal(recipe.monthlyRevenueAtRiskUsd, expected);
});

test("buildFlowFixRecipe — SROI = midLift / effortDays", () => {
  const flow = PATH_B_FLOWS[0];
  const recipe = recipeFor(flow, failAllKpis(flow));
  for (const fix of recipe.gateFixes) {
    const expectedSroi = ((fix.expectedLiftLowUsd + fix.expectedLiftHighUsd) / 2) / fix.effortDays;
    assert.equal(fix.sroiUsdPerDay, expectedSroi);
  }
});

test("buildFlowFixRecipe — recipe carries flow metadata + score + playbook", () => {
  const flow = PATH_B_FLOWS[0]; // 1.1_browse_abandon
  const recipe = recipeFor(flow, failAllKpis(flow));
  assert.equal(recipe.flowId, flow.flow_id);
  assert.equal(recipe.flowName, flow.flow_name);
  assert.equal(recipe.pillar, flow.pillar);
  assert.equal(recipe.tier, flow.tier);
  assert.equal(recipe.channel, flow.channel);
  assert.ok(recipe.score >= 0 && recipe.score <= 100);
  assert.ok(["PASS", "WARN", "NEEDS_WORK", "FAIL"].includes(recipe.verdict));
  assert.ok(recipe.playbook, "1.1_browse_abandon must have a playbook ref");
  assert.equal(recipe.playbook!.playbookId, "01-abandoned-cart-flow-klaviyo");
});

test("buildFlowFixRecipe — SROI = midLift / effortDays", () => {
  const flow = PATH_B_FLOWS[0]; // 1.1_browse_abandon, P1 floor=[300,800]
  const recipe = recipeFor(flow, failAllKpis(flow));
  for (const fix of recipe.gateFixes) {
    const expectedSroi = ((fix.expectedLiftLowUsd + fix.expectedLiftHighUsd) / 2) / fix.effortDays;
    assert.equal(fix.sroiUsdPerDay, expectedSroi);
  }
  // Spot-check Gate A on P1: A lift is mid-floor fraction [mid*0.25, mid*1.0] = [200, 800],
  // effort 0.25d → SROI = (200+800)/2 / 0.25 = 500 / 0.25 = 2000/d
  const gateA = recipe.gateFixes.find((g) => g.gate === "A");
  assert.ok(gateA);
  assert.equal(gateA.sroiUsdPerDay, 2000);
  // Spot-check Gate E on P1: E lift = pillar floor band [300, 800], effort 2d → SROI = 275/d
  const gateE = recipe.gateFixes.find((g) => g.gate === "E");
  assert.ok(gateE);
  assert.equal(gateE.sroiUsdPerDay, 275);
});

test("totalMonthlyRevenueAtRiskUsd + totalTopFixLiftHighUsdPer1k sum across recipes", () => {
  const recipes = PATH_B_FLOWS.slice(0, 3).map((f) => recipeFor(f, failAllKpis(f)));
  const totalRev = totalMonthlyRevenueAtRiskUsd(recipes);
  const expectedRev = recipes.reduce((s, r) => s + r.monthlyRevenueAtRiskUsd, 0);
  assert.equal(totalRev, expectedRev);
  const totalTop = totalTopFixLiftHighUsdPer1k(recipes);
  const expectedTop = recipes.reduce((s, r) => s + r.topFixLiftHighUsd, 0);
  assert.equal(totalTop, expectedTop);
});

test("sroiToneClass — bucketing is correct", () => {
  assert.equal(sroiToneClass(0), "text-muted-foreground");
  assert.equal(sroiToneClass(50), "text-amber-700 dark:text-amber-400");
  assert.equal(sroiToneClass(100), "text-sky-700 dark:text-sky-400 font-semibold");
  assert.equal(sroiToneClass(1000), "text-emerald-700 dark:text-emerald-400 font-semibold");
  assert.equal(sroiToneClass(NaN), "text-muted-foreground");
  assert.equal(sroiToneClass(-100), "text-muted-foreground"); // negative → muted
  assert.equal(sroiToneClass(Infinity), "text-muted-foreground"); // Infinity not >= 1k numerically
});

test("formatUsdPer1k — $0 / $50 / $500 / $1.5k / $15k", () => {
  assert.equal(formatUsdPer1k(0), "$0");
  assert.equal(formatUsdPer1k(50), "$50");
  assert.equal(formatUsdPer1k(500), "$500");
  assert.equal(formatUsdPer1k(1500), "$1.5k");
  assert.equal(formatUsdPer1k(15000), "$15k");
  assert.equal(formatUsdPer1k(NaN), "$0");
  assert.equal(formatUsdPer1k(Infinity), "$0");
});

test("formatSroiPerDay — $0/d / $50/d / $500/d / $1.5k/d / $2.50M/d", () => {
  assert.equal(formatSroiPerDay(0), "$0/d");
  assert.equal(formatSroiPerDay(50), "$50/d");
  assert.equal(formatSroiPerDay(500), "$500/d");
  assert.equal(formatSroiPerDay(1500), "$1.5k/d");
  assert.equal(formatSroiPerDay(15000), "$15k/d");
  assert.equal(formatSroiPerDay(2_500_000), "$2.50M/d");
  assert.equal(formatSroiPerDay(NaN), "—");
  assert.equal(formatSroiPerDay(Infinity), "—");
});

test("formatEffortDays — 0.25d / 0.5d / 1d / 1 day / 2 days", () => {
  assert.equal(formatEffortDays(0.25), "0.25d");
  assert.equal(formatEffortDays(0.5), "0.5d");
  assert.equal(formatEffortDays(1), "1 day");
  assert.equal(formatEffortDays(2), "2 days");
  assert.equal(formatEffortDays(5), "5 days");
});

test("recipeToMarkdown — full recipe for failAllKpis has 6 gate sections", () => {
  const flow = PATH_B_FLOWS[0];
  const recipe = recipeFor(flow, failAllKpis(flow));
  const md = recipeToMarkdown(recipe);
  assert.match(md, /^# Fix recipe — /);
  assert.match(md, /## Prioritized fixes/);
  for (const k of ["A", "B", "C", "D", "E", "F"] as GateKey[]) {
    assert.match(md, new RegExp(`### Gate ${k} —`), `md must contain Gate ${k} section`);
  }
  assert.match(md, /Expected lift:/);
  assert.match(md, /Diagnostic:/);
  assert.match(md, /Changes:/);
});

test("recipeToMarkdown — passAllKpis emits the 'all gates passing' empty-state line", () => {
  const flow = PATH_B_FLOWS[0];
  const recipe = recipeFor(flow, passAllKpis(flow));
  const md = recipeToMarkdown(recipe);
  assert.match(md, /All gates passing/);
  assert.doesNotMatch(md, /## Prioritized fixes/);
});

test("recipeToMarkdown — playbook link is rendered in markdown", () => {
  const flow = PATH_B_FLOWS[0]; // 1.1_browse_abandon → 01-abandoned-cart-flow-klaviyo
  const recipe = recipeFor(flow, failAllKpis(flow));
  const md = recipeToMarkdown(recipe);
  assert.match(md, /Read first:.*01-abandoned-cart-flow-klaviyo/);
  assert.match(md, /\/playbooks\/01-abandoned-cart-flow-klaviyo/);
});

test("STORAGE_KEY + UPDATE_EVENT constants are stable", () => {
  assert.equal(FLOW_FIX_RECIPE_STORAGE_KEY, "ecom-ops:flow-fix-recipe:v1");
  assert.equal(FLOW_FIX_RECIPE_UPDATE_EVENT, "ecom-ops:flow-fix-recipe:update");
});
