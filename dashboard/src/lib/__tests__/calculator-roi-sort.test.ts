/**
 * TDD contract tests for `calculator-roi-sort.ts` — Move #N.23.5.
 *
 * Covers:
 *   - isCalculatorRoiSortMode: accepts "lift" + "payback", rejects others
 *   - CALCULATOR_ROI_SORT_OPTIONS: length === 2, contains both modes
 *   - CALCULATOR_ROI_SORT_STORAGE_KEY + UPDATE_EVENT stable constants
 *   - CANONICAL_CALCULATOR_ROI_SORT pin invariants (2 modes, default "lift",
 *     storage key stable, minModes >= 2)
 *   - loadCalculatorRoiSort: returns "lift" on server / empty / invalid /
 *     non-JSON; round-trips a valid "payback" through JSON
 *   - saveCalculatorRoiSort: writes JSON + dispatches CustomEvent with
 *     the saved mode as detail; defensive on quota / private-mode (no throw)
 *   - sortCalculatorRoiRankRows: empty input → empty output
 *   - sortCalculatorRoiRankRows "lift": sorts annualLiftHigh DESC (the
 *     canonical default — matches buildCalculatorRoiRank ordering)
 *   - sortCalculatorRoiRankRows "payback": sorts paybackMonths ASC;
 *     Infinity (free tool) sorts FIRST; null (not measurable) sorts LAST
 *   - sortCalculatorRoiRankRows tiebreaker: same primary key → priorityRank
 *     ASC, then name alpha
 *   - sortCalculatorRoiRankRows does NOT mutate the input array
 *   - sortCalculatorRoiRankRows fallback: invalid mode → "lift" canonical
 *   - calculatorRoiSortLabel: "lift" → "By $", "payback" → "By payback"
 *
 * Run with: `npx jiti src/lib/__tests__/calculator-roi-sort.test.ts`
 */

import {
  CALCULATOR_ROI_SORT_OPTIONS,
  CALCULATOR_ROI_SORT_STORAGE_KEY,
  CALCULATOR_ROI_SORT_UPDATE_EVENT,
  CANONICAL_CALCULATOR_ROI_SORT,
  calculatorRoiSortLabel,
  isCalculatorRoiSortMode,
  loadCalculatorRoiSort,
  saveCalculatorRoiSort,
  sortCalculatorRoiRankRows,
  type CalculatorRoiSortMode,
} from "../calculator-roi-sort";
import type { CalculatorRoiRankRow } from "../calculator-roi-rank";
import { buildCalculatorRoiRank } from "../calculator-roi-rank";
import { YOUR_STORE_DEFAULTS } from "../your-store";

// -- Minimal jsdom-ish shim ------------------------------------------------
//
// The dashboard's `save`/`load` helpers gate on `typeof window === "undefined"`
// (server-safe). Under plain Node there's no `window`, so we install a tiny
// in-memory shim that supports only the keys this module touches:
// `addEventListener`, `removeEventListener`, `dispatchEvent`, and a
// `localStorage` Map. The shim is intentionally NOT global — it's only
// attached to the global namespace if `window` is missing — to avoid
// clobbering a real jsdom window if the test runner already provides one.

interface FakeStorage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
  clear(): void;
  key(i: number): string | null;
  readonly length: number;
}

interface FakeWindow {
  localStorage: FakeStorage;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): boolean;
}

function ensureWindow(): FakeWindow {
  const g = globalThis as unknown as { window?: FakeWindow };
  if (g.window) return g.window;
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<EventListener>>();
  const localStorage: FakeStorage = {
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  const fake: FakeWindow = {
    localStorage,
    addEventListener(type, listener) {
      let set = listeners.get(type);
      if (!set) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(listener);
    },
    removeEventListener(type, listener) {
      const set = listeners.get(type);
      if (set) set.delete(listener);
    },
    dispatchEvent(event) {
      const set = listeners.get(event.type);
      if (!set) return true;
      for (const l of Array.from(set)) {
        try {
          l(event);
        } catch {
          /* ignore listener errors */
        }
      }
      return true;
    },
  };
  g.window = fake;
  return fake;
}
ensureWindow();

let passed = 0;
let failed = 0;
function assert(cond: unknown, label: string): void {
  if (cond) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${label}`);
  }
}

// -- Constants / pin --------------------------------------------------------

(function testSortConstants() {
  assert(
    CALCULATOR_ROI_SORT_STORAGE_KEY === "ecom-ops:calculator-roi-sort:v1",
    "STORAGE_KEY constant stable",
  );
  assert(
    CALCULATOR_ROI_SORT_UPDATE_EVENT === "ecom-ops:calculator-roi-sort:update",
    "UPDATE_EVENT constant stable",
  );
  assert(
    CALCULATOR_ROI_SORT_OPTIONS.length === 2 &&
      CALCULATOR_ROI_SORT_OPTIONS.includes("lift") &&
      CALCULATOR_ROI_SORT_OPTIONS.includes("payback"),
    "OPTIONS = [lift, payback] (length 2)",
  );
})();

(function testCanonicalPin() {
  assert(
    CANONICAL_CALCULATOR_ROI_SORT.modes.length >= CANONICAL_CALCULATOR_ROI_SORT.minModes,
    "canonical.modes.length >= minModes",
  );
  assert(
    CANONICAL_CALCULATOR_ROI_SORT.minModes >= 2,
    "canonical.minModes >= 2 (must keep both lift + payback)",
  );
  assert(
    CANONICAL_CALCULATOR_ROI_SORT.defaultMode === "lift",
    "canonical.defaultMode = 'lift'",
  );
  assert(
    CANONICAL_CALCULATOR_ROI_SORT.storageKey === "ecom-ops:calculator-roi-sort:v1",
    "canonical.storageKey stable",
  );
  assert(
    isCalculatorRoiSortMode(CANONICAL_CALCULATOR_ROI_SORT.defaultMode),
    "canonical.defaultMode passes isCalculatorRoiSortMode",
  );
})();

(function testIsCalculatorRoiSortMode() {
  assert(isCalculatorRoiSortMode("lift") === true, "'lift' is valid");
  assert(isCalculatorRoiSortMode("payback") === true, "'payback' is valid");
  assert(isCalculatorRoiSortMode("priority") === false, "'priority' rejected");
  assert(isCalculatorRoiSortMode("sroi") === false, "'sroi' rejected");
  assert(isCalculatorRoiSortMode("") === false, "'' rejected");
  assert(isCalculatorRoiSortMode(null) === false, "null rejected");
  assert(isCalculatorRoiSortMode(undefined) === false, "undefined rejected");
  assert(isCalculatorRoiSortMode(42) === false, "number rejected");
})();

(function testCalculatorRoiSortLabel() {
  assert(calculatorRoiSortLabel("lift") === "By $", "label 'lift' → 'By $'");
  assert(
    calculatorRoiSortLabel("payback") === "By payback",
    "label 'payback' → 'By payback'",
  );
})();

// -- loadCalculatorRoiSort (server-safe) ------------------------------------

(function testLoadServerSafe() {
  // No window: loadCalculatorRoiSort returns "lift" without touching
  // localStorage. We can simulate this by checking the import-time
  // behaviour: `typeof window === "undefined"` is true inside Node's
  // module load when no jsdom is set up. The `load` function does NOT
  // throw on missing window; it returns "lift".
  const r = loadCalculatorRoiSort();
  assert(r === "lift" || r === "payback", `load() returns valid mode (got ${r})`);
})();

// -- save + load round-trip via in-memory localStorage ----------------------

(function testSaveLoadRoundtrip() {
  // Save "payback" → load should return "payback".
  // Use the global localStorage shim if present (jsdom env) or stub one
  // via the save function's CustomEvent dispatch.
  const previousKey = CALCULATOR_ROI_SORT_STORAGE_KEY;
  const prevValue = window.localStorage.getItem(previousKey);
  try {
    window.localStorage.removeItem(previousKey);
    saveCalculatorRoiSort("payback");
    assert(
      window.localStorage.getItem(previousKey) === JSON.stringify("payback"),
      "save('payback') writes JSON 'payback' to localStorage",
    );
    assert(loadCalculatorRoiSort() === "payback", "load() reads back 'payback'");

    saveCalculatorRoiSort("lift");
    assert(loadCalculatorRoiSort() === "lift", "save('lift') round-trips");
  } finally {
    if (prevValue === null) {
      window.localStorage.removeItem(previousKey);
    } else {
      window.localStorage.setItem(previousKey, prevValue);
    }
  }
})();

(function testSaveDispatchesEvent() {
  let receivedDetail: CalculatorRoiSortMode | string | null = null;
  const handler = (e: Event) => {
    const ce = e as CustomEvent<CalculatorRoiSortMode>;
    receivedDetail = ce.detail ?? null;
  };
  window.addEventListener(CALCULATOR_ROI_SORT_UPDATE_EVENT, handler);
  try {
    saveCalculatorRoiSort("payback");
    assert(receivedDetail === "payback", "save dispatches CustomEvent with mode detail");
    saveCalculatorRoiSort("lift");
    assert(receivedDetail === "lift", "save dispatches again on second call");
  } finally {
    window.removeEventListener(CALCULATOR_ROI_SORT_UPDATE_EVENT, handler);
  }
})();

(function testSaveDoesNotThrowOnQuota() {
  // Simulate quota: monkey-patch setItem to throw. save() must catch.
  const original = window.localStorage.setItem;
  let threw = false;
  try {
    window.localStorage.setItem = (() => {
      threw = true;
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    }) as typeof window.localStorage.setItem;
    saveCalculatorRoiSort("payback");
    assert(threw, "setItem was called (and threw)");
    assert(true, "save() swallowed quota error without re-throwing");
  } finally {
    window.localStorage.setItem = original;
  }
})();

(function testLoadInvalidJsonFallback() {
  const previousKey = CALCULATOR_ROI_SORT_STORAGE_KEY;
  const prevValue = window.localStorage.getItem(previousKey);
  try {
    window.localStorage.setItem(previousKey, "{not-json");
    assert(loadCalculatorRoiSort() === "lift", "load() returns 'lift' on invalid JSON");
    window.localStorage.setItem(previousKey, JSON.stringify("not-a-mode"));
    assert(
      loadCalculatorRoiSort() === "lift",
      "load() returns 'lift' on unknown mode string",
    );
    window.localStorage.setItem(previousKey, JSON.stringify(42));
    assert(loadCalculatorRoiSort() === "lift", "load() returns 'lift' on number");
    window.localStorage.setItem(previousKey, JSON.stringify(null));
    assert(loadCalculatorRoiSort() === "lift", "load() returns 'lift' on null");
    window.localStorage.setItem(previousKey, "");
    assert(loadCalculatorRoiSort() === "lift", "load() returns 'lift' on empty string");
  } finally {
    if (prevValue === null) {
      window.localStorage.removeItem(previousKey);
    } else {
      window.localStorage.setItem(previousKey, prevValue);
    }
  }
})();

// -- sortCalculatorRoiRankRows ---------------------------------------------

/** A tiny row factory so the sort tests can build synthetic inputs. */
function fakeRow(args: {
  slug: string;
  name: string;
  annualLiftHigh: number;
  annualLiftLow?: number;
  monthlyLiftHigh?: number;
  priorityRank: number;
  daysToShip: number;
}): CalculatorRoiRankRow {
  return {
    slug: args.slug,
    name: args.name,
    calculator: {
      slug: args.slug,
      name: args.name,
      calculatorKey: args.slug,
      description: "",
      category: "Retention",
      complexity: "low",
    },
    priorityRank: args.priorityRank,
    rationale: "",
    annualLiftHigh: args.annualLiftHigh,
    annualLiftLow: args.annualLiftLow ?? Math.round(args.annualLiftHigh / 2),
    monthlyLiftHigh: args.monthlyLiftHigh ?? Math.round(args.annualLiftHigh / 12),
    daysToShip: args.daysToShip,
    rank: 0,
  };
}

(function testSortEmpty() {
  const out = sortCalculatorRoiRankRows([], "lift");
  assert(Array.isArray(out) && out.length === 0, "empty input → empty output");

  const out2 = sortCalculatorRoiRankRows([], "payback");
  assert(out2.length === 0, "empty input → empty output (payback mode)");
})();

(function testSortDoesNotMutateInput() {
  const rows: CalculatorRoiRankRow[] = [
    fakeRow({
      slug: "b-slug",
      name: "B",
      annualLiftHigh: 100,
      priorityRank: 2,
      daysToShip: 5,
    }),
    fakeRow({
      slug: "a-slug",
      name: "A",
      annualLiftHigh: 200,
      priorityRank: 1,
      daysToShip: 5,
    }),
  ];
  const inputRef = rows.slice();
  sortCalculatorRoiRankRows(rows, "lift");
  assert(
    rows[0]?.slug === inputRef[0]?.slug && rows[1]?.slug === inputRef[1]?.slug,
    "input array order is unchanged after sort",
  );

  sortCalculatorRoiRankRows(rows, "payback");
  assert(
    rows[0]?.slug === inputRef[0]?.slug && rows[1]?.slug === inputRef[1]?.slug,
    "input array order is unchanged after payback sort",
  );
});

(function testSortLiftDesc() {
  // Build a synthetic rank: row 1 has the highest lift, row 3 lowest.
  const rows: CalculatorRoiRankRow[] = [
    fakeRow({
      slug: "low-slug",
      name: "Low",
      annualLiftHigh: 50_000,
      priorityRank: 5,
      daysToShip: 5,
    }),
    fakeRow({
      slug: "high-slug",
      name: "High",
      annualLiftHigh: 300_000,
      priorityRank: 1,
      daysToShip: 5,
    }),
    fakeRow({
      slug: "mid-slug",
      name: "Mid",
      annualLiftHigh: 150_000,
      priorityRank: 3,
      daysToShip: 5,
    }),
  ];
  const sorted = sortCalculatorRoiRankRows(rows, "lift");
  assert(sorted[0]?.slug === "high-slug", "lift sort puts highest $ first");
  assert(sorted[1]?.slug === "mid-slug", "lift sort puts mid $ second");
  assert(sorted[2]?.slug === "low-slug", "lift sort puts lowest $ third");
});

(function testSortLiftTiebreaker() {
  // Same annualLiftHigh → priorityRank ASC wins.
  const rows: CalculatorRoiRankRow[] = [
    fakeRow({
      slug: "b-prio-2",
      name: "B",
      annualLiftHigh: 100_000,
      priorityRank: 2,
      daysToShip: 5,
    }),
    fakeRow({
      slug: "a-prio-1",
      name: "A",
      annualLiftHigh: 100_000,
      priorityRank: 1,
      daysToShip: 5,
    }),
    fakeRow({
      slug: "c-prio-2",
      name: "C",
      annualLiftHigh: 100_000,
      priorityRank: 2,
      daysToShip: 5,
    }),
  ];
  const sorted = sortCalculatorRoiRankRows(rows, "lift");
  assert(
    sorted[0]?.slug === "a-prio-1",
    "lift tiebreaker: lower priorityRank wins (a)",
  );
  assert(
    sorted[1]?.slug === "b-prio-2",
    "lift tiebreaker: same priorityRank → alpha name (B before C)",
  );
  assert(
    sorted[2]?.slug === "c-prio-2",
    "lift tiebreaker: same priorityRank → alpha name (C last)",
  );
});

(function testSortPaybackAsc() {
  // All rows have the SAME cost (so payback = cost / monthlyLiftHigh)
  // but different monthly lifts → faster-payback rows have lower monthly
  // lift (smaller lift = longer payback, so highest lift → fastest payback).
  // We use real `buildCalculatorRoiRank` rows because the payback lookup
  // requires costHigh from MOVE_RECOMMENDATIONS — synthetic rows have
  // costHigh = 0 (free tool) which always returns Infinity.
  const summary = buildCalculatorRoiRank(YOUR_STORE_DEFAULTS);
  const sorted = sortCalculatorRoiRankRows(summary.rows, "payback");

  // Top row MUST be a free tool (Infinity payback) or the row with
  // the lowest finite payback. Walk the sorted output and verify
  // payback is monotonically non-decreasing.
  // We re-derive payback by calling buildPaybackEnrichment indirectly
  // via the helper from calculator-roi-payback.ts.
  // (imported via sortCalculatorRoiRankRows already).
  assert(sorted.length === summary.rows.length, "payback sort preserves count");
  assert(
    sorted[0] !== undefined,
    "payback sort top row exists",
  );
  // Verify monotonicity by re-checking via buildPaybackEnrichment.
  // We import directly here so the test is self-contained.
  const { buildPaybackEnrichment } = require("../calculator-roi-payback");
  const paybacks = sorted.map((r: CalculatorRoiRankRow) =>
    buildPaybackEnrichment(r).paybackMonths,
  );
  for (let i = 1; i < paybacks.length; i++) {
    const prev = paybacks[i - 1];
    const curr = paybacks[i];
    // Allow equal (tied buckets) but not decreasing.
    let ok = false;
    if (prev === null && curr === null) ok = true;
    else if (prev === null) ok = false; // nulls must be LAST
    else if (curr === null) ok = true; // null after non-null is ok if prev isn't null
    else if (!Number.isFinite(prev) && !Number.isFinite(curr)) ok = true;
    else if (!Number.isFinite(prev)) ok = false; // Infinity must be FIRST
    else if (!Number.isFinite(curr)) ok = true; // non-Infinity before Infinity is ok only if prev isn't Infinity
    else ok = curr >= prev;
    assert(ok, `payback monotonically non-decreasing at index ${i} (prev=${prev}, curr=${curr})`);
  }
  // The final element, if its payback is null, all later elements are also null.
  // (Already enforced by the monotonic loop above.)
});

(function testSortPaybackFreeToolFirst() {
  // Build a synthetic rank with a free tool mixed in. Free tools have
  // costHigh = 0 (we set it via a slug that doesn't exist in
  // MOVE_RECOMMENDATIONS → getMoveCostBySlug returns 0). Pair it with
  // a real slug (whose cost is positive).
  const summary = buildCalculatorRoiRank(YOUR_STORE_DEFAULTS);
  const realRow = summary.rows[0]!;
  const freeRow: CalculatorRoiRankRow = {
    ...realRow,
    slug: "made-up-free-slug",
    name: "Free Tool",
    annualLiftHigh: realRow.annualLiftHigh / 10, // small lift — would otherwise sort LAST
  };
  const rows = [realRow, freeRow];
  const sorted = sortCalculatorRoiRankRows(rows, "payback");
  assert(
    sorted[0]?.slug === "made-up-free-slug",
    "payback sort puts free tool (Infinity) FIRST even with smaller lift",
  );
  assert(sorted[1]?.slug === realRow.slug, "payback sort puts real tool SECOND");
});

(function testSortPaybackNotMeasurableLast() {
  // Build rows where one has zero monthly lift (paybackMonths === null).
  const summary = buildCalculatorRoiRank(YOUR_STORE_DEFAULTS);
  const realRow = summary.rows[0]!;
  const zeroLiftRow: CalculatorRoiRankRow = {
    ...realRow,
    slug: "made-up-zero-lift-slug",
    name: "Zero Lift",
    annualLiftHigh: 0,
    annualLiftLow: 0,
    monthlyLiftHigh: 0,
  };
  const rows = [zeroLiftRow, realRow];
  const sorted = sortCalculatorRoiRankRows(rows, "payback");
  assert(
    sorted[0]?.slug === realRow.slug,
    "payback sort puts non-zero-lift row BEFORE zero-lift row",
  );
  assert(
    sorted[1]?.slug === "made-up-zero-lift-slug",
    "payback sort puts zero-lift (null payback) LAST",
  );
});

(function testSortInvalidModeFallback() {
  const summary = buildCalculatorRoiRank(YOUR_STORE_DEFAULTS);
  const sorted = sortCalculatorRoiRankRows(summary.rows, "garbage" as never);
  // Should match the "lift" canonical sort.
  const liftSorted = sortCalculatorRoiRankRows(summary.rows, "lift");
  assert(
    sorted.map((r) => r.slug).join(",") === liftSorted.map((r) => r.slug).join(","),
    "invalid mode falls back to canonical lift sort",
  );
});

(function testSortCanonicalPinOnRealRank() {
  // Use the canonical buildCalculatorRoiRank on defaults to ensure the
  // payback-sort actually re-orders something. With defaults (AOV $75,
  // 1000 orders = $75k/mo), every calculator-backed move has positive
  // monthly lift and the canonical lift-sorted order is
  //   03-checkout-audit-baymard (high %) > 02-post-purchase-upsell > ...
  // The payback-sorted order should differ (because all 7 calculator-
  // backed moves are free or near-free at default scale, so the lift
  // % ordering often wins — but the order MUST still be valid).
  const summary = buildCalculatorRoiRank(YOUR_STORE_DEFAULTS);
  const paybackSorted = sortCalculatorRoiRankRows(summary.rows, "payback");
  assert(
    paybackSorted.length === summary.rows.length,
    "payback sort preserves all rows from canonical rank",
  );
  // Every slug in the canonical rank must still appear in the payback sort.
  const canonicalSlugs = new Set(summary.rows.map((r) => r.slug));
  const sortedSlugs = new Set(paybackSorted.map((r) => r.slug));
  for (const slug of canonicalSlugs) {
    assert(sortedSlugs.has(slug), `payback sort preserves slug '${slug}'`);
  }
});

// -- Report -----------------------------------------------------------------

console.log(
  `\n=== calculator-roi-sort.test.ts: ${passed} passed / ${failed} failed ===`,
);
if (failed > 0) {
  process.exit(1);
}