/**
 * Move #128.ar smoke test — trajectory scenario preset import/export helpers.
 *
 * Validates that `exportPresets` + `importPresets` round-trip correctly:
 *   - Empty-state exports a valid empty-shape payload (no presets = 0)
 *   - exportPresets("A"/"B"/"any") slots the filter correctly
 *   - presetBundleFilename() returns slot-stamped file names
 *   - importPresets handles three payload shapes (full storage, bare array,
 *     single preset) — all converge on the same valid result
 *   - importPresets refuses malformed JSON, bad schema, and un-validatable
 *     presets (returns ok:false with a descriptive status)
 *   - importPresets replaceExisting:true OVERWRITES matching ids
 *   - importPresets default merge mode SKIPS matching ids
 *   - importPresets respects PRESETS_MAX — overflowing entries are skipped
 *   - Coercion of missing timestamps + missing moveId defaults
 *
 * Mirrors the structure of `trajectory-scenario-presets.test.ts` so the two
 * suites read identically.
 */

import {
  countPresets,
  exportPresets,
  importPresets,
  loadPresets,
  PRESETS_EVENT,
  PRESETS_STORAGE_KEY,
  presetBundleFilename,
  savePreset,
  type ScenarioPreset,
} from "../trajectory-scenario-presets";

// ---------------------------------------------------------------------------
// Polyfill window for Node 22
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var window: {
    localStorage: Map<string, string>;
    dispatchEvent: (e: { type: string }) => void;
  };
  // eslint-disable-next-line no-var
  var localStorage: Map<string, string>;
}

class MemStorage {
  private store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
  clear(): void {
    this.store.clear();
  }
  key(i: number): string | null {
    return Array.from(this.store.keys())[i] ?? null;
  }
  get length(): number {
    return this.store.size;
  }
}

const mem = new MemStorage();
let eventLog: string[] = [];

globalThis.window = {
  localStorage: mem as unknown as Map<string, string>,
  dispatchEvent: (e: { type: string }) => {
    eventLog.push(e.type);
  },
} as unknown as typeof window;
globalThis.localStorage = mem as unknown as Map<string, string>;

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
function assert(cond: unknown, label: string): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function reset(): void {
  mem.clear();
  eventLog = [];
}

function primeTwoAOneB(): void {
  savePreset({
    name: "Aggressive Q1",
    slot: "A",
    moveId: "01-abandoned-cart-flow-klaviyo",
    delayDays: 0,
    now: new Date("2026-09-18T12:00:00Z"),
  });
  savePreset({
    name: "Conservative Q1",
    slot: "A",
    moveId: "04-welcome-series-klaviyo",
    delayDays: 60,
    now: new Date("2026-09-18T12:00:00Z"),
  });
  savePreset({
    name: "Compare B",
    slot: "B",
    moveId: "03-checkout-audit-baymard",
    delayDays: 30,
    now: new Date("2026-09-18T12:00:00Z"),
  });
}

console.log("\n--- Move #128.ar: trajectory scenario preset import/export ---");

// --- empty-state ---
reset();
{
  const empty = exportPresets("any");
  assert(empty.count === 0, "empty export: count = 0");
  const parsed = JSON.parse(empty.json);
  assert(Array.isArray(parsed.presets) && parsed.presets.length === 0, "empty export: json has empty presets array");
  assert(parsed.schema === "ecom-ops-trajectory-scenario-presets", "empty export: json has correct schema");
  assert(typeof empty.filename === "string" && empty.filename.includes("all"), "empty export: filename includes slot 'all'");
}

// --- presetBundleFilename slot stamps ---
assert(presetBundleFilename("A").includes("-a-"), "presetBundleFilename A has -a- stamp");
assert(presetBundleFilename("B").includes("-b-"), "presetBundleFilename B has -b- stamp");
assert(presetBundleFilename("any").includes("-all-"), "presetBundleFilename any has -all- stamp");

// --- populated export ---
reset();
primeTwoAOneB();
{
  const all = exportPresets("any");
  assert(all.count === 3, "populated export 'any' has 3 presets");
  assert(JSON.parse(all.json).presets.length === 3, "populated export 'any' json has 3 presets");
  assert(JSON.parse(all.json).schema === "ecom-ops-trajectory-scenario-presets", "export schema is correct");
  assert(JSON.parse(all.json).version === 1, "export version is 1");

  const onlyA = exportPresets("A");
  assert(onlyA.count === 2, "export 'A' filters to 2 presets");
  const onlyB = exportPresets("B");
  assert(onlyB.count === 1, "export 'B' filters to 1 preset");

  assert(onlyA.filename.includes("-a-"), "export A filename stamped");
  assert(onlyB.filename.includes("-b-"), "export B filename stamped");
}

// --- malformed JSON refuses ---
reset();
{
  const r = importPresets({ json: "{ not json" });
  assert(!r.ok, "malformed JSON refused (ok:false)");
  assert(r.added === 0 && r.skipped === 0, "malformed JSON added=0 skipped=0");
  assert(/parse|JSON/i.test(r.status), `malformed JSON status mentions parse: "${r.status}"`);
}

// --- empty payload (no presets) ---
reset();
{
  const r = importPresets({ json: '{"schema":"ecom-ops-trajectory-scenario-presets","version":1,"presets":[]}' });
  assert(r.ok, "empty preset array is ok:true (no-op)");
  assert(r.added === 0, "empty preset array added=0");
  assert(r.status.includes("No presets"), `empty status: "${r.status}"`);
}

// --- full storage round-trip ---
reset();
primeTwoAOneB();
{
  const exported = exportPresets("any");
  const payload = exported.json;
  // Now wipe and re-import.
  mem.clear();
  eventLog = [];
  const r = importPresets({ json: payload });
  assert(r.ok, "full-storage round-trip import ok:true");
  assert(r.added === 3, `full-storage round-trip added 3 (got ${r.added})`);
  assert(r.total === 3, "full-storage round-trip total 3");
  assert(countPresets("any") === 3, "localStorage has 3 presets after round-trip");
  assert(eventLog.includes(PRESETS_EVENT), "full-storage import dispatches PRESETS_EVENT");
}

// --- bare array import ---
reset();
{
  const bare: ScenarioPreset[] = [
    {
      id: "bare-1",
      name: "Bare 1",
      slot: "A",
      moveId: "01-x",
      delayDays: 0,
      createdAt: "2026-09-18",
      updatedAt: "2026-09-18",
    },
    {
      id: "bare-2",
      name: "Bare 2",
      slot: "B",
      moveId: null,
      delayDays: 30,
      createdAt: "2026-09-18",
      updatedAt: "2026-09-18",
    },
  ];
  const r = importPresets({ json: JSON.stringify(bare) });
  assert(r.ok, "bare-array import ok:true");
  assert(r.added === 2, "bare-array added 2");
  assert(loadPresets().length === 2, "localStorage has 2 after bare-array import");
}

// --- single preset (object) import ---
reset();
{
  const single = {
    id: "single-1",
    name: "Single preset",
    slot: "A",
    moveId: "05-y",
    delayDays: 7,
    createdAt: "2026-09-18",
    updatedAt: "2026-09-18",
  };
  const r = importPresets({ json: JSON.stringify(single) });
  assert(r.ok, "single-object import ok:true");
  assert(r.added === 1, "single-object added 1");
  assert(loadPresets()[0].name === "Single preset", "single-object persisted correctly");
}

// --- invalid preset (bad slot) refused ---
reset();
{
  const bad = [{
    id: "bad-1",
    name: "Bad slot",
    slot: "Z", // not A or B
    moveId: "01-x",
    delayDays: 0,
    createdAt: "2026-09-18",
    updatedAt: "2026-09-18",
  }];
  const r = importPresets({ json: JSON.stringify(bad) });
  assert(!r.ok, "invalid-slot preset refused (ok:false)");
  assert(loadPresets().length === 0, "localStorage empty after invalid-slot refused");
  assert(/valid|No valid/i.test(r.status), `invalid-slot status: "${r.status}"`);
}

// --- merge mode (default) skips existing ids ---
reset();
savePreset({
  name: "Original",
  slot: "A",
  moveId: "01-x",
  delayDays: 0,
  now: new Date("2026-09-18T12:00:00Z"),
});
eventLog = [];
{
  const existing = loadPresets();
  const r = importPresets({
    json: JSON.stringify({
      schema: "ecom-ops-trajectory-scenario-presets",
      version: 1,
      presets: [
        existing[0], // same id → should be skipped in merge mode
        {
          id: "fresh-1",
          name: "Fresh",
          slot: "A",
          moveId: "02-y",
          delayDays: 15,
          createdAt: "2026-09-18",
          updatedAt: "2026-09-18",
        },
      ],
    }),
  });
  assert(r.ok, "merge-mode import ok:true");
  assert(r.added === 1, `merge-mode added 1 new (got ${r.added})`);
  assert(r.skipped === 1, `merge-mode skipped 1 (got ${r.skipped})`);
  assert(loadPresets().length === 2, "localStorage has 2 after merge");
}

// --- replaceExisting:true overwrites matching ids ---
reset();
savePreset({
  name: "Replace Target",
  slot: "A",
  moveId: "01-original",
  delayDays: 0,
  now: new Date("2026-09-18T12:00:00Z"),
});
{
  const existing = loadPresets();
  const r = importPresets({
    replaceExisting: true,
    json: JSON.stringify({
      schema: "ecom-ops-trajectory-scenario-presets",
      version: 1,
      presets: [
        {
          ...existing[0],
          moveId: "02-replaced", // overwrite
          delayDays: 99,
          updatedAt: "2026-09-19",
        },
      ],
    }),
  });
  assert(r.ok, "replace-mode import ok:true");
  assert(r.added === 1, "replace-mode counts overwrite as added");
  assert(loadPresets()[0].moveId === "02-replaced", "replace-mode actually overwrote the moveId");
  assert(loadPresets()[0].delayDays === 99, "replace-mode actually overwrote the delayDays");
}

// --- PRESETS_MAX cap respected (overflow → skipped) ---
reset();
{
  const overflow: ScenarioPreset[] = [];
  for (let i = 0; i < 20; i++) {
    overflow.push({
      id: `cap-${i}`,
      name: `Cap ${i}`,
      slot: i % 2 === 0 ? "A" : "B",
      moveId: null,
      delayDays: 0,
      createdAt: "2026-09-18",
      updatedAt: "2026-09-18",
    });
  }
  const r = importPresets({ json: JSON.stringify(overflow) });
  assert(r.ok, "cap-overflow import ok:true");
  assert(loadPresets().length === 12, `PRESETS_MAX cap enforced: localStorage has 12 (got ${loadPresets().length})`);
  assert(r.added === 12, `cap-overflow added 12 (got ${r.added})`);
  assert(r.skipped === 8, `cap-overflow skipped 8 (got ${r.skipped})`);
}

// --- missing timestamps + moveId default to today + null ---
reset();
{
  const partial = {
    id: "partial-1",
    name: "Partial",
    slot: "A",
    delayDays: 0,
    // no moveId, no createdAt, no updatedAt
  };
  const r = importPresets({ json: JSON.stringify(partial) });
  assert(r.ok, "partial-import ok:true");
  const stored = loadPresets()[0];
  assert(stored.moveId === null, "missing moveId defaults to null");
  assert(/^\d{4}-\d{2}-\d{2}$/.test(stored.createdAt), `missing createdAt defaults to today ISO (got "${stored.createdAt}")`);
  assert(stored.createdAt === stored.updatedAt, "missing createdAt and updatedAt both default to today");
}

// --- primitive payload (string/number) refused ---
reset();
{
  const r1 = importPresets({ json: '"just a string"' });
  assert(!r1.ok, "string payload refused");
  const r2 = importPresets({ json: "42" });
  assert(!r2.ok, "number payload refused");
  const r3 = importPresets({ json: "null" });
  assert(!r3.ok, "null payload refused");
}

// --- end-to-end: save 2 → export → wipe → import → re-apply ---
reset();
savePreset({
  name: "Aggressive Q1",
  slot: "A",
  moveId: "01-abandoned-cart-flow-klaviyo",
  delayDays: 0,
  now: new Date("2026-09-18T12:00:00Z"),
});
savePreset({
  name: "Conservative Q1",
  slot: "A",
  moveId: "04-welcome-series-klaviyo",
  delayDays: 60,
  now: new Date("2026-09-18T12:00:00Z"),
});
{
  const exported = exportPresets("any");
  mem.clear();
  eventLog = [];
  const r = importPresets({ json: exported.json });
  assert(r.ok && r.added === 2 && countPresets("any") === 2, "end-to-end round-trip: 2 presets re-imported after wipe");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
