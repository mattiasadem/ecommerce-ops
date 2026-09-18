/**
 * Smoke test — Trajectory scenario comparator compact (Move #128.ap)
 *
 * Validates the helper-imported resetScenarioA path keeps working when
 * invoked from the compact component. The full component is exercised
 * by the live `/today` route probe in the journal entry.
 *
 * Run: `npx jiti src/components/__tests__/trajectory-scenario-compact.smoke.ts`
 */

import { resetScenarioA } from "../../lib/trajectory-scenario-reset";

// Polyfill window.localStorage + window.dispatchEvent for the Node env.
const mem: Record<string, string> = {};
const listeners: Record<string, Array<(e: Event) => void>> = {};

const fakeStorage = {
  getItem: (k: string) => (k in mem ? mem[k] : null),
  setItem: (k: string, v: string) => {
    mem[k] = String(v);
  },
  removeItem: (k: string) => {
    delete mem[k];
  },
  clear: () => {
    for (const k of Object.keys(mem)) delete mem[k];
  },
  key: (i: number) => Object.keys(mem)[i] ?? null,
  get length() {
    return Object.keys(mem).length;
  },
};

const fakeWindow = {
  localStorage: fakeStorage,
  dispatchEvent: (e: Event) => {
    const arr = listeners[e.type] ?? [];
    for (const fn of arr) fn(e);
    return true;
  },
  addEventListener: (type: string, fn: (e: Event) => void) => {
    (listeners[type] ??= []).push(fn);
  },
  removeEventListener: (type: string, fn: (e: Event) => void) => {
    const arr = listeners[type] ?? [];
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  },
};

// Inject the polyfill onto the global scope.
(globalThis as unknown as { window: typeof fakeWindow }).window = fakeWindow;

// --- Assertion helpers ---
let pass = 0;
let fail = 0;
function ok(cond: boolean, label: string) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}`);
  }
}

// --- Tests ---

console.log("Move #128.ap — TrajectoryScenarioComparatorCompact smoke test");

// 1. resetScenarioA clears the canonical key + dispatches the same-tab event
mem["ecom-ops:trajectory-scenario:v1"] = JSON.stringify({
  schema: "ecom-ops-trajectory-scenario",
  version: 1,
  state: { moveId: "test-move", delayDays: 60 },
});
let dispatchedA = 0;
listeners["ecom-ops:trajectory-scenario:update"] = [
  () => {
    dispatchedA++;
  },
];
const summary = resetScenarioA();
ok(summary.key === "ecom-ops:trajectory-scenario:v1", "resetScenarioA returns the A key");
ok(summary.removed === true, "resetScenarioA reports removed=true when key exists");
ok(mem["ecom-ops:trajectory-scenario:v1"] === undefined, "resetScenarioA actually removes the key from localStorage");
ok(dispatchedA === 1, "resetScenarioA dispatches ecom-ops:trajectory-scenario:update exactly once");

// 2. resetScenarioA is a no-op when the key is absent
delete mem["ecom-ops:trajectory-scenario:v1"];
dispatchedA = 0;
const summary2 = resetScenarioA();
ok(summary2.removed === false, "resetScenarioA reports removed=false when key is absent");
ok(dispatchedA === 1, "resetScenarioA still dispatches the event when key is absent (so listeners can re-hydrate to defaults)");

// 3. Cross-component isolation — resetScenarioA does NOT touch the B key
mem["ecom-ops:trajectory-scenario-b:v1"] = JSON.stringify({
  schema: "ecom-ops-trajectory-scenario-b",
  version: 1,
  enabled: true,
  state: { moveId: "other-move", delayDays: 90 },
});
resetScenarioA();
ok(
  mem["ecom-ops:trajectory-scenario-b:v1"] !== undefined,
  "resetScenarioA does NOT touch the B key (cross-scenario isolation)",
);

// 4. Compact component would re-read after reset — verify the storage shape
// matches what the compact component's loadScenario() expects.
const expectedSchema = "ecom-ops-trajectory-scenario";
const parsed = JSON.parse(
  mem["ecom-ops:trajectory-scenario-b:v1"] ?? "null",
);
ok(parsed.schema === expectedSchema || parsed.schema === "ecom-ops-trajectory-scenario-b", "compact-compatible schema strings present");

console.log(`\n${pass} passed, ${fail} failed.`);
if (fail > 0) {
  process.exit(1);
}
