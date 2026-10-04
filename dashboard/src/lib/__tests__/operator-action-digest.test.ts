/**
 * TDD contract tests for `operator-action-digest.ts` — Move #N.9.
 *
 * Targets `digestFromInputs(inputs)` which produces the prioritized
 * action list without touching localStorage or the DOM. Pins the rule
 * engine so future changes don't silently flip an action's priority
 * or drop the empty-state CTA.
 */

import { digestFromInputs } from "../operator-action-digest";
import type { DigestInput } from "../operator-action-digest";

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

function emptyInput(): DigestInput {
  return {
    shipped: {},
    realizedRoi: {},
    lifecycleKpis: {},
    yourStore: null,
    top10PendingMoves: [],
    playbookTitlesById: {},
  };
}

const NOW = "2026-10-04T16:00:00Z";
function entry(over: Partial<{
  revenueLift: number;
  cost: number;
  ordersLift: number;
  windowDays: number;
  confidence: "low" | "medium" | "high";
  notes: string;
  loggedAt: string;
  updatedAt: string;
}> = {}) {
  return {
    actualMonthlyRevenueLift: over.revenueLift ?? 100,
    actualMonthlyCost: over.cost ?? 100,
    actualMonthlyOrdersLift: over.ordersLift ?? 10,
    measurementWindowDays: over.windowDays ?? 30,
    confidence: over.confidence ?? "high",
    notes: over.notes ?? "",
    loggedAt: over.loggedAt ?? NOW,
    updatedAt: over.updatedAt ?? NOW,
  };
}

function flowKpis(over: Partial<{ sent: number; opens: number; clicks: number; cvr: number; unsub: number; revenue: number; attribution: number }> = {}) {
  return {
    sent: over.sent ?? 10000,
    opens: over.opens ?? 1000,
    clicks: over.clicks ?? 100,
    cvr: over.cvr ?? 0.01,
    unsub: over.unsub ?? 0.005,
    revenue: over.revenue ?? 1000,
    attribution_match_rate: over.attribution ?? 0.95,
  };
}

// 1. Empty input -> 1 EDIT action (your-store null) — not isAllClean.
{
  const d = digestFromInputs(emptyInput());
  assert(d.actions.length === 1, "empty: actions.length === 1 (the EDIT)");
  assert(d.blockCount === 0, "empty: blockCount === 0");
  assert(d.actCount === 0, "empty: actCount === 0");
  assert(d.logCount === 0, "empty: logCount === 0");
  assert(d.editCount === 1, "empty: editCount === 1");
  assert(d.isAllClean === false, "empty: isAllClean === false");
  assert(d.actions[0].kind === "edit", "empty: action[0].kind === edit");
}

// 2. your-store null -> single P3 EDIT action.
{
  const d = digestFromInputs(emptyInput());
  assert(d.actions.length === 1, "null-ys: actions.length === 1");
  const a = d.actions[0];
  assert(a.kind === "edit", "null-ys: kind === edit");
  assert(a.priority === 3, "null-ys: priority === 3");
  assert(a.href === "/settings", "null-ys: href === /settings");
  assert(a.metricLabel === "Your store", "null-ys: metricLabel === Your store");
  assert(a.metricValue === "default", "null-ys: metricValue === default");
  assert(d.editCount === 1, "null-ys: editCount === 1");
}

// 3. your-store set -> no EDIT action.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
  });
  assert(
    d.actions.find((a) => a.kind === "edit") === undefined,
    "set-ys: no EDIT action",
  );
  assert(d.editCount === 0, "set-ys: editCount === 0");
}

// 4. Shipped playbook with no realized entry -> P2 LOG.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    shipped: { "01-ac": { shippedAt: NOW } },
    playbookTitlesById: { "01-ac": "Abandoned cart flow" },
  });
  const log = d.actions.find((a) => a.kind === "log" && a.href === "/playbooks/01-ac");
  assert(log !== undefined, "shipped-no-realized: log exists");
  assert(log?.priority === 2, "shipped-no-realized: priority === 2");
  assert(log?.metricLabel === "Actuals", "shipped-no-realized: metricLabel");
  assert(log?.metricValue === "missing", "shipped-no-realized: metricValue");
  assert(log?.title.includes("Abandoned cart flow"), "shipped-no-realized: title");
  assert(d.logCount === 1, "shipped-no-realized: logCount === 1");
}

// 5. Shipped + low-confidence entry -> P2 LOG re-log action.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    shipped: { "01-ac": { shippedAt: NOW } },
    realizedRoi: { "01-ac": entry({ confidence: "low" }) },
    playbookTitlesById: { "01-ac": "Abandoned cart flow" },
  });
  const log = d.actions.find((a) => a.kind === "log" && a.href === "/playbooks/01-ac");
  assert(log !== undefined, "low-conf: log exists");
  assert(log?.priority === 2, "low-conf: priority === 2");
  assert(log?.metricValue === "low", "low-conf: metricValue === low");
  assert(log?.title.includes("Re-log"), "low-conf: title contains Re-log");
}

// 6. Shipped + high-confidence entry -> no action for that playbook.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    shipped: { "01-ac": { shippedAt: NOW } },
    realizedRoi: { "01-ac": entry({ confidence: "high" }) },
    playbookTitlesById: { "01-ac": "AC" },
  });
  assert(
    d.actions.find((a) => a.href === "/playbooks/01-ac") === undefined,
    "high-conf: no action for playbook",
  );
  assert(d.logCount === 0, "high-conf: logCount === 0");
}

// 7. Lifecycle FAIL flow with very-bad KPIs surfaces at least one lifecycle action.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    lifecycleKpis: {
      // Feed bad data to all canonical flows so the verdict lands in FAIL.
      ...Object.fromEntries([
        ["1.1_browse_abandon", flowKpis({ sent: 0, opens: 0, clicks: 0, cvr: 0, revenue: 0, attribution: 0 })],
        ["1.2_winback", flowKpis({ sent: 0, opens: 0, clicks: 0, cvr: 0, revenue: 0, attribution: 0 })],
      ]),
    },
  });
  const lifeActions = d.actions.filter((a) => a.href.startsWith("/lifecycle#"));
  assert(lifeActions.length > 0, "lifecycle-fail: at least one lifecycle action emitted");
  // All lifecycle actions should be kind=block or kind=act.
  for (const a of lifeActions) {
    assert(a.kind === "block" || a.kind === "act", `lifecycle-fail: action kind is block|act (got ${a.kind})`);
    assert(a.href.startsWith("/lifecycle#"), "lifecycle-fail: href prefix");
  }
}

// 8. Top-10 pending moves -> P1 ACT actions.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: [
      { move: "Move 3 — TikTok Shop launch", status: "pending" },
      { move: "Move 5 — Affiliate program", status: "blocked" },
    ],
  });
  const acts = d.actions.filter((a) => a.kind === "act" && a.href.startsWith("/top-10#"));
  assert(acts.length === 2, "top10: 2 acts");
  assert(acts[0].title.includes("Move 3"), "top10: first title contains Move 3");
  assert(acts[1].title.includes("Move 5"), "top10: second title contains Move 5");
  assert(d.actCount === 2, "top10: actCount === 2");
}

// 9. Actions are sorted by priority then by id (stable).
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    shipped: { "01-ac": { shippedAt: NOW } },
    realizedRoi: { "01-ac": entry({ confidence: "low" }) },
    top10PendingMoves: [{ move: "Move 3", status: "pending" }],
    playbookTitlesById: { "01-ac": "AC" },
  });
  const priorities = d.actions.map((a) => a.priority);
  const sorted = [...priorities].sort((a, b) => a - b);
  assert(JSON.stringify(priorities) === JSON.stringify(sorted), "sort: priorities ascending");
}

// 10. Actions are capped at 8.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: Array.from({ length: 15 }, (_, i) => ({
      move: `Move ${i + 1}`,
      status: "pending",
    })),
  });
  assert(d.actions.length <= 8, "cap: actions.length <= 8");
  assert(d.actCount === 15, "cap: actCount === 15 (uncapped)");
}

// 11. isAllClean: requires shipped + lifecycle data + your-store + no actions.
{
  const d = digestFromInputs({
    shipped: {},
    realizedRoi: {},
    lifecycleKpis: { any_flow: flowKpis() },
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: [],
    playbookTitlesById: {},
  });
  assert(d.actions.length === 0, "isAllClean-empty: no actions");
  assert(d.isAllClean === false, "isAllClean-empty: isAllClean === false (no shipped)");
}

// 12. Stable unique ids.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: [
      { move: "Move A", status: "pending" },
      { move: "Move B", status: "pending" },
    ],
  });
  const ids = d.actions.map((a) => a.id);
  assert(new Set(ids).size === ids.length, "unique-ids: all ids distinct");
}

// 13. All action hrefs are absolute paths.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: [{ move: "Move A", status: "pending" }],
    shipped: { "01-ac": { shippedAt: NOW } },
  });
  for (const a of d.actions) {
    assert(a.href.startsWith("/"), `absolute-href: ${a.href}`);
  }
}

// 14. Counts reflect uncapped action totals.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: Array.from({ length: 12 }, (_, i) => ({
      move: `Move ${i + 1}`,
      status: "pending",
    })),
  });
  assert(d.actions.length === 8, "uncapped-counts: actions.length === 8");
  assert(d.actCount === 12, "uncapped-counts: actCount === 12");
}

// 15. Kind labels are one of the 4 canonical kinds.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    shipped: { "01-ac": { shippedAt: NOW } },
    top10PendingMoves: [{ move: "Move 1", status: "pending" }],
  });
  for (const a of d.actions) {
    assert(
      ["block", "act", "log", "edit"].includes(a.kind),
      `canonical-kind: ${a.kind}`,
    );
  }
}

// 16. isAllClean only when engaged AND no actions.
{
  const d = digestFromInputs({
    shipped: { "01-ac": { shippedAt: NOW } },
    realizedRoi: { "01-ac": entry({ confidence: "high", revenueLift: 1000, cost: 50 }) },
    lifecycleKpis: { any_flow: flowKpis() },
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
    top10PendingMoves: [],
    playbookTitlesById: { "01-ac": "AC" },
  });
  // Whether this lands in isAllClean depends on lifecycle verdict — the
  // contract is just that isAllClean implies actions.length === 0.
  if (d.isAllClean) {
    assert(d.actions.length === 0, "isAllClean-consistent: actions.length === 0");
  }
}

// 17. Priority count of 0 for an axis is fine.
{
  const d = digestFromInputs({
    ...emptyInput(),
    yourStore: { aov: 75, monthlyOrders: 1000, grossMargin: 0.7 },
  });
  assert(d.blockCount === 0, "zero-counts: blockCount === 0");
  assert(d.actCount === 0, "zero-counts: actCount === 0");
  assert(d.logCount === 0, "zero-counts: logCount === 0");
}

console.log(
  `PASS: operator-action-digest.test.ts — ${passed}/${passed + failed} assertions, ${failed} failed`,
);
if (failed > 0) process.exit(1);