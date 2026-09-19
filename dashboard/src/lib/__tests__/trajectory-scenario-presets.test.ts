/**
 * Move #128.aq smoke test — trajectory scenario preset helpers.
 *
 * Validates that `savePreset`, `applyPreset`, `deletePreset`, `renamePreset`,
 * `countPresets`, and the `PRESETS_EVENT` same-tab CustomEvent all behave
 * correctly against a Node 22 polyfilled `window.localStorage` + dispatch.
 *
 * Mirrors the structure of `trajectory-scenario-reset.test.ts` so the
 * two suites read identically.
 */

import {
  applyPreset,
  countPresets,
  deletePreset,
  loadPresets,
  PRESETS_EVENT,
  PRESETS_MAX,
  PRESETS_STORAGE_KEY,
  renamePreset,
  savePreset,
  normalizePresetName,
  presetId,
  todayIso,
} from "../trajectory-scenario-presets";

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
  return { windowLike, store, events };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

let browser: ReturnType<typeof makeBrowserStub>;

function reset() {
  browser = makeBrowserStub();
  // @ts-expect-error — test-only stub
  globalThis.window = browser.windowLike;
}

const FIXED_TODAY = new Date("2026-09-19T00:00:00.000Z");

async function run() {
  // -- Test 1: savePreset creates a new entry + persists
  reset();
  const r1 = savePreset({
    name: "  Aggressive Q1  ",
    slot: "A",
    moveId: "01-abandoned-cart-flow-klaviyo",
    delayDays: 30,
    now: FIXED_TODAY,
  });
  assert(r1 !== null, "savePreset returned null");
  assert(r1?.preset.name === "Aggressive Q1", `name not normalized: ${r1?.preset.name}`);
  assert(r1?.preset.slot === "A", "slot preserved");
  assert(r1?.preset.moveId === "01-abandoned-cart-flow-klaviyo", "moveId preserved");
  assert(r1?.preset.delayDays === 30, "delayDays preserved");
  assert(r1?.preset.createdAt === "2026-09-19", `createdAt: ${r1?.preset.createdAt}`);
  assert(r1?.preset.updatedAt === "2026-09-19", "updatedAt set");
  assert(r1?.replaced === false, "first save is not a replacement");
  // localStorage side-effect
  const persisted = browser.windowLike.localStorage.getItem(PRESETS_STORAGE_KEY);
  assert(persisted !== null, "persisted payload missing");
  assert(persisted!.includes("Aggressive Q1"), "persisted payload missing the name");
  // same-tab CustomEvent fired
  const evt = browser.events.find((e) => e.name === PRESETS_EVENT);
  assert(evt !== undefined, `CustomEvent ${PRESETS_EVENT} not dispatched`);

  // -- Test 2: loadPresets reads it back
  const loaded = loadPresets();
  assert(loaded.length === 1, `expected 1 preset, got ${loaded.length}`);
  assert(loaded[0].id === r1!.preset.id, "id mismatch on reload");
  assert(loaded[0].name === "Aggressive Q1", "name mismatch on reload");

  // -- Test 3: savePreset same name in same slot replaces (replaced=true)
  const r2 = savePreset({
    name: "Aggressive Q1",
    slot: "A",
    moveId: "02-welcome-series",
    delayDays: 60,
    now: FIXED_TODAY,
  });
  assert(r2 !== null, "second savePreset returned null");
  assert(r2?.replaced === true, "second save should be a replacement");
  assert(r2?.preset.moveId === "02-welcome-series", "moveId updated in place");
  assert(r2?.preset.delayDays === 60, "delayDays updated in place");
  const after2 = loadPresets();
  assert(after2.length === 1, `expected 1 preset after replace, got ${after2.length}`);

  // -- Test 4: empty / invalid name returns null
  const r3 = savePreset({
    name: "   ",
    slot: "A",
    moveId: "x",
    delayDays: 30,
    now: FIXED_TODAY,
  });
  assert(r3 === null, "empty name should refuse");

  const r4 = savePreset({
    name: "valid",
    slot: "A",
    moveId: "x",
    delayDays: -5,
    now: FIXED_TODAY,
  });
  assert(r4 === null, "negative delayDays should refuse");

  // -- Test 5: PRESETS_MAX cap is enforced
  reset();
  for (let i = 0; i < PRESETS_MAX; i++) {
    const r = savePreset({
      name: `Preset ${i}`,
      slot: "A",
      moveId: `move-${i}`,
      delayDays: 30 + i,
      now: FIXED_TODAY,
    });
    assert(r !== null, `savePreset #${i} should succeed`);
  }
  const overCap = savePreset({
    name: "Preset over cap",
    slot: "A",
    moveId: "move-over",
    delayDays: 30,
    now: FIXED_TODAY,
  });
  assert(overCap === null, `savePreset over cap (${PRESETS_MAX}) should refuse`);
  assert(loadPresets().length === PRESETS_MAX, `expected ${PRESETS_MAX} presets`);

  // -- Test 6: countPresets filters by slot
  reset();
  savePreset({ name: "A-one", slot: "A", moveId: null, delayDays: 30, now: FIXED_TODAY });
  savePreset({ name: "A-two", slot: "A", moveId: null, delayDays: 60, now: FIXED_TODAY });
  savePreset({ name: "B-one", slot: "B", moveId: null, delayDays: 90, now: FIXED_TODAY });
  assert(countPresets("any") === 3, `count any: ${countPresets("any")}`);
  assert(countPresets("A") === 2, `count A: ${countPresets("A")}`);
  assert(countPresets("B") === 1, `count B: ${countPresets("B")}`);

  // -- Test 7: applyPreset returns slot + move + delay
  const presets = loadPresets();
  const aTwo = presets.find((p) => p.name === "A-two")!;
  const applied = applyPreset({ id: aTwo.id });
  assert(applied !== null, "applyPreset returned null");
  assert(applied?.slot === "A", "applied slot");
  assert(applied?.delayDays === 60, "applied delayDays");

  // applyPreset with unknown id returns null
  const missing = applyPreset({ id: "nonexistent" });
  assert(missing === null, "unknown id should return null");

  // -- Test 8: renamePreset updates name + rejects collisions + empty
  const renamed = renamePreset({ id: aTwo.id, name: "A-two-renamed", now: FIXED_TODAY });
  assert(renamed !== null, "rename returned null");
  assert(renamed?.name === "A-two-renamed", "rename name");
  // collision check — renaming to an existing name in same slot refuses
  const collision = renamePreset({
    id: aTwo.id,
    name: "A-one",
    now: FIXED_TODAY,
  });
  assert(collision === null, "rename to existing slot name should refuse");
  // empty name refuses
  const empty = renamePreset({ id: aTwo.id, name: "  ", now: FIXED_TODAY });
  assert(empty === null, "rename to whitespace should refuse");

  // -- Test 9: deletePreset removes + returns true; second call is false
  const bOne = presets.find((p) => p.name === "B-one")!;
  assert(deletePreset(bOne.id) === true, "deletePreset first call true");
  assert(loadPresets().length === 2, "after delete count");
  assert(deletePreset(bOne.id) === false, "deletePreset second call false");

  // -- Test 10: helpers
  assert(normalizePresetName("  hello   world  ") === "hello world", `normalize: ${normalizePresetName("  hello   world  ")}`);
  assert(normalizePresetName("") === null, "normalize empty");
  assert(normalizePresetName("   ") === null, "normalize whitespace");
  // 40-char cap
  const long = "a".repeat(60);
  const normLong = normalizePresetName(long);
  assert(normLong !== null && normLong.length === 40, `long normalize len: ${normLong?.length}`);
  assert(presetId("Aggressive Q1!", "2026-09-19") === "aggressive-q1-20260919", `presetId: ${presetId("Aggressive Q1!", "2026-09-19")}`);
  assert(todayIso(FIXED_TODAY) === "2026-09-19", `todayIso: ${todayIso(FIXED_TODAY)}`);

  // -- Test 11: loadPresets ignores malformed payload
  reset();
  browser.windowLike.localStorage.setItem(
    PRESETS_STORAGE_KEY,
    JSON.stringify({ schema: "wrong-schema", version: 1, presets: [] }),
  );
  assert(loadPresets().length === 0, "wrong schema returns []");
  browser.windowLike.localStorage.setItem(PRESETS_STORAGE_KEY, "not-json");
  assert(loadPresets().length === 0, "garbage JSON returns []");

  console.log("trajectory-scenario-presets.test.ts — all 11 tests passed");
}

run().catch((err) => {
  console.error("trajectory-scenario-presets.test.ts FAILED:", err);
  process.exit(1);
});
