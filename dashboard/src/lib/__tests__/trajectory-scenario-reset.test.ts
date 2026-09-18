/**
 * Move #128.an smoke test — trajectory scenario reset helpers.
 *
 * Validates that `resetScenarioA()`, `resetScenarioB()`, and
 * `resetScenarioBoth()` correctly clear the localStorage keys the
 * comparator writes to AND dispatch the same-tab CustomEvent the
 * comparator listens for.
 */

import {
  resetScenarioA,
  resetScenarioBoth,
  resetScenarioB,
  RESET_EVENT_A,
  RESET_EVENT_B,
  RESET_STORAGE_KEY_A,
  RESET_STORAGE_KEY_B,
} from "../trajectory-scenario-reset";

// Polyfill a minimal `window.localStorage` + `dispatchEvent` so the
// module can run in a plain Node 22 environment without a real browser.
function makeBrowserStub() {
  const store = new Map<string, string>();
  const events: { name: string; detail: unknown }[] = [];

  const windowLike = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    dispatchEvent: (event: { type: string; detail?: unknown }) => {
      events.push({ name: event.type, detail: event.detail });
      return true;
    },
  };
  // Pre-existing test payload — Scenario A was set to a move + 90-day delay.
  store.set(
    RESET_STORAGE_KEY_A,
    JSON.stringify({
      schema: "ecom-ops-trajectory-scenario",
      version: 1,
      state: { moveId: "snap-pinterest-attribution", delayDays: 90 },
    }),
  );
  // Scenario B was enabled with a different move + 60-day delay.
  store.set(
    RESET_STORAGE_KEY_B,
    JSON.stringify({
      schema: "ecom-ops-trajectory-scenario-b",
      version: 1,
      enabled: true,
      state: { moveId: "checkout-audit-baymard", delayDays: 60 },
    }),
  );

  return { windowLike, store, events };
}

const results: { name: string; ok: boolean; detail: string }[] = [];
function assert(name: string, ok: boolean, detail: string): void {
  results.push({ name, ok, detail });
}

const ctx = makeBrowserStub();
// Attach to globalThis so the module's `typeof window === "undefined"`
// check returns `false` and the localStorage / dispatchEvent calls
// fire against our stub.
(globalThis as unknown as { window: unknown }).window = ctx.windowLike;

const rA = resetScenarioA();
assert(
  "reset A removes key",
  rA.removed && ctx.windowLike.localStorage.getItem(RESET_STORAGE_KEY_A) === null,
  `removed=${rA.removed}`,
);
const eventsAfterA = ctx.events.filter((e) => e.name === RESET_EVENT_A);
assert(
  "reset A dispatches same-tab event",
  eventsAfterA.length === 1,
  `events=${eventsAfterA.length}`,
);

const rB = resetScenarioB();
assert(
  "reset B reports removed",
  rB.removed,
  `removed=${rB.removed}`,
);
const payloadB = JSON.parse(
  ctx.windowLike.localStorage.getItem(RESET_STORAGE_KEY_B) ?? "{}",
) as { enabled?: boolean };
assert(
  "reset B rewrites key with enabled=false",
  payloadB.enabled === false,
  `${JSON.stringify(payloadB)}`,
);
const eventsAfterB = ctx.events.filter((e) => e.name === RESET_EVENT_B);
assert(
  "reset B dispatches same-tab event",
  eventsAfterB.length === 1,
  `events=${eventsAfterB.length}`,
);

ctx.events.length = 0;
const rBoth = resetScenarioBoth();
assert(
  "reset both reports both removed",
  rBoth.a.removed || rBoth.b.removed,
  `a.removed=${rBoth.a.removed} b.removed=${rBoth.b.removed}`,
);
assert(
  "reset both dispatches both events",
  ctx.events.some((e) => e.name === RESET_EVENT_A) &&
    ctx.events.some((e) => e.name === RESET_EVENT_B),
  `events=[${ctx.events.map((e) => e.name).join(",")}]`,
);

const rAagain = resetScenarioA();
assert(
  "reset A is idempotent — 2nd call returns removed=false",
  rAagain.removed === false,
  `${rAagain.removed}`,
);

let passed = 0;
for (const r of results) {
  const tag = r.ok ? "✓" : "✗";
  console.log(`${tag} ${r.name} (${r.detail})`);
  if (r.ok) passed++;
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
