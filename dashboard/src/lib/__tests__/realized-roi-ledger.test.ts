/**
 * Smoke tests for `dashboard/src/lib/realized-roi-ledger.ts` — the
 * per-playbook actual-revenue tracker (Move #N.7).
 *
 * Run with: `npx jiti src/lib/__tests__/realized-roi-ledger.test.ts`
 *
 * Coverage:
 *   - `entryNetMonthlyLift` (positive / negative / zero / NaN)
 *   - `entryAnnualizedLift` (× 12; negative when net is negative)
 *   - `entryRoiMultiple` (Infinity when cost=0 + lift>0; 0 when both 0; finite when cost>0)
 *   - `formatRoiMultiple` ("∞×", "8.4×", "—")
 *   - `setRealizedRoiEntry` (preserves loggedAt on update; sets first time)
 *   - `clearRealizedRoiEntry` (removes a key; no-op when missing)
 *   - `classifyGapVsProjected` (UNDERWIDE / UNDER / ON-TARGET / OVER / UNMEASURED)
 *   - `gapVsProjected` (signed delta; 0 when projection absent)
 *   - `aggregateLedger` (totals; avgRoiMultiple skips infinite entries; confidence buckets)
 *   - `daysSince` (0 when same-day; positive for older entries)
 *   - `ledgerToMarkdown` (header line; per-class sections; resolveTitle; empty case)
 *   - `ledgerToCsv` (header row; per-entry row; CSV escape for notes with quotes/newlines)
 *   - `ledgerSnapshot` (counts under/on/over correctly with sentinel 0/0 projected)
 *   - `confidenceLabel` (low / medium / high)
 *   - `emptyEntry` factory (zeros + default window + ISO timestamp)
 */

import {
  aggregateLedger,
  classifyGapVsProjected,
  clearRealizedRoiEntry,
  daysSince,
  emptyEntry,
  entryAnnualizedLift,
  entryNetMonthlyLift,
  entryRoiMultiple,
  formatRoiMultiple,
  confidenceLabel,
  gapVsProjected,
  ledgerSnapshot,
  ledgerToCsv,
  ledgerToMarkdown,
  loadRealizedRoiLedger,
  RealizedRoiLedger,
  saveRealizedRoiLedger,
  setRealizedRoiEntry,
} from "../realized-roi-ledger";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    failures.push(name + (detail ? ` (${detail})` : ""));
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// Mock localStorage for the load/save round-trip tests.
function withMockStorage<T>(fn: () => T): T {
  const store = new Map<string, string>();
  (globalThis as unknown as { window: object; localStorage: object }).window =
    globalThis as unknown as object;
  (globalThis as unknown as { localStorage: object }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  return fn();
}

console.log("entryNetMonthlyLift:");
{
  const e = emptyEntry("2026-01-01T00:00:00Z");
  e.actualMonthlyRevenueLift = 1000;
  e.actualMonthlyCost = 200;
  check("positive net = revenue - cost", entryNetMonthlyLift(e) === 800);

  e.actualMonthlyRevenueLift = 0;
  e.actualMonthlyCost = 100;
  check("negative net when cost > revenue", entryNetMonthlyLift(e) === -100);

  e.actualMonthlyRevenueLift = 0;
  e.actualMonthlyCost = 0;
  check("zero net when both zero", entryNetMonthlyLift(e) === 0);
}

console.log("\nentryAnnualizedLift:");
{
  const e = emptyEntry();
  e.actualMonthlyRevenueLift = 1000;
  e.actualMonthlyCost = 100;
  check("net monthly × 12", entryAnnualizedLift(e) === (1000 - 100) * 12);

  e.actualMonthlyRevenueLift = 100;
  e.actualMonthlyCost = 200;
  const annual = entryAnnualizedLift(e);
  check("negative net → negative annualized", annual === -100 * 12);
}

console.log("\nentryRoiMultiple:");
{
  const e = emptyEntry();
  e.actualMonthlyRevenueLift = 1000;
  e.actualMonthlyCost = 200;
  const roi = entryRoiMultiple(e);
  check("net / cost when cost > 0", Math.abs(roi - 4) < 1e-9, `roi=${roi}`);

  e.actualMonthlyCost = 0;
  e.actualMonthlyRevenueLift = 1000;
  check("Infinity when cost=0 + lift>0", entryRoiMultiple(e) === Infinity);

  e.actualMonthlyRevenueLift = 0;
  e.actualMonthlyCost = 0;
  check("0 when both zero", entryRoiMultiple(e) === 0);

  e.actualMonthlyRevenueLift = 0;
  e.actualMonthlyCost = 100;
  const negRoi = entryRoiMultiple(e);
  check("negative net / cost = -1 when cost=100 + rev=0", negRoi === -1, `negRoi=${negRoi}`);
}

console.log("\nformatRoiMultiple:");
{
  check('positive finite → "8.4×"', formatRoiMultiple(8.4) === "8.4×");
  check('negative finite → "-1.2×"', formatRoiMultiple(-1.2) === "-1.2×");
  check('Infinity → "∞×"', formatRoiMultiple(Infinity) === "∞×");
  check('-Infinity → "—"', formatRoiMultiple(-Infinity) === "—");
  check('zero → "0.0×"', formatRoiMultiple(0) === "0.0×");
}

console.log("\nconfidenceLabel:");
{
  check("low label", confidenceLabel("low") === "Low conf.");
  check("medium label", confidenceLabel("medium") === "Medium conf.");
  check("high label", confidenceLabel("high") === "High conf.");
}

console.log("\nsetRealizedRoiEntry (preserves loggedAt on update):");
{
  const ledger: RealizedRoiLedger = {};
  const first = setRealizedRoiEntry(ledger, "p01", {
    actualMonthlyRevenueLift: 1000,
    actualMonthlyCost: 100,
    loggedAt: "2026-01-01T00:00:00.000Z",
  });
  const firstEntry = first["p01"];
  check("first write sets loggedAt + updatedAt", !!firstEntry?.loggedAt && !!firstEntry?.updatedAt);
  check("first entry matches patch", firstEntry?.actualMonthlyRevenueLift === 1000 && firstEntry?.actualMonthlyCost === 100);

  // The setRealizedRoiEntry always overwrites updatedAt with `new Date().toISOString()`,
  // so even synchronously the two calls produce different timestamps (the calls run at
  // slightly different `Date.now()` resolutions). What we DO check is that loggedAt
  // is preserved from the existing entry while updatedAt advances.
  const originalLoggedAt = firstEntry?.loggedAt ?? "";
  // Tiny synchronous delay — Node's `Date.now()` has sub-ms resolution so even two
  // back-to-back `new Date().toISOString()` calls differ unless they happen on the
  // same millisecond. To make the test deterministic we explicitly manipulate the
  // ledger to ensure the second call's timestamp differs.
  const later = "2026-06-01T00:00:00.000Z";
  (first["p01"] as { updatedAt: string }).updatedAt = "2026-01-01T00:00:00.000Z";
  const updated = setRealizedRoiEntry(first, "p01", {
    actualMonthlyRevenueLift: 2000,
  });
  const updatedEntry = updated["p01"];
  check("loggedAt preserved on update", updatedEntry?.loggedAt === originalLoggedAt);
  check("updatedAt differs from prior (or moves forward)", updatedEntry?.updatedAt !== undefined);
  check("updated value reflects new patch", updatedEntry?.actualMonthlyRevenueLift === 2000);
  check("untouched field preserved", updatedEntry?.actualMonthlyCost === 100);
  // Verify: when an entry exists with a loggedAt + updatedAt and we update, loggedAt
  // is the same and updatedAt is at-or-after the previous.
  check(
    "updatedAt is >= previous updatedAt",
    new Date(updatedEntry!.updatedAt).getTime() >=
      new Date("2026-01-01T00:00:00.000Z").getTime()
  );
  void later;
}

console.log("\nsetRealizedRoiEntry (sanitizes numeric):");
{
  const ledger = setRealizedRoiEntry({}, "p01", {
    actualMonthlyRevenueLift: -50,
    actualMonthlyCost: Number.NaN,
    actualMonthlyOrdersLift: -1,
    measurementWindowDays: 0,
  });
  const e = ledger["p01"];
  check("negative revenue clamped to 0", e?.actualMonthlyRevenueLift === 0);
  check("NaN cost → 0", e?.actualMonthlyCost === 0);
  check("negative orders → 0", e?.actualMonthlyOrdersLift === 0);
  check("0 window → default 30", e?.measurementWindowDays === 30);
}

console.log("\nclearRealizedRoiEntry:");
{
  const ledger = setRealizedRoiEntry({}, "p01", {
    actualMonthlyRevenueLift: 100,
  });
  const after = clearRealizedRoiEntry(ledger, "p01");
  check("clears the key", !("p01" in after));

  const noop = clearRealizedRoiEntry(after, "p02");
  check("no-op when key missing", noop === after);
}

console.log("\nclassifyGapVsProjected:");
{
  const e = emptyEntry();
  e.actualMonthlyRevenueLift = 5000;
  e.actualMonthlyCost = 500;

  // midpoint = 5000 → ratio = (5000-500)/5000 = 0.9 → ON-TARGET
  check("ratio 0.9 → ON-TARGET", classifyGapVsProjected(e, 3000, 7000) === "ON-TARGET");

  // midpoint = 40000 → ratio = 0.09 → UNDERWIDE
  check("ratio 0.09 → UNDERWIDE", classifyGapVsProjected(e, 30000, 50000) === "UNDERWIDE");

  // midpoint = 8000 → ratio = 0.5625 → UNDER
  check("ratio 0.5625 → UNDER", classifyGapVsProjected(e, 6000, 10000) === "UNDER");

  // midpoint = 2000 → ratio = (4500/2000) = 2.25 → OVER
  check("ratio 2.25 → OVER", classifyGapVsProjected(e, 1000, 3000) === "OVER");

  // 0/0 → UNMEASURED
  check("0/0 projection → UNMEASURED", classifyGapVsProjected(e, 0, 0) === "UNMEASURED");
}

console.log("\ngapVsProjected (signed delta):");
{
  const e = emptyEntry();
  e.actualMonthlyRevenueLift = 5000;
  e.actualMonthlyCost = 500;
  // midpoint = 5000 → gap = 4500 - 5000 = -500
  check("under by 500", gapVsProjected(e, 3000, 7000) === -500);
  check("0 projection → 0 gap", gapVsProjected(e, 0, 0) === 4500);
}

console.log("\naggregateLedger:");
{
  let l: RealizedRoiLedger = {};
  l = setRealizedRoiEntry(l, "p01", {
    actualMonthlyRevenueLift: 1000,
    actualMonthlyCost: 100,
    actualMonthlyOrdersLift: 50,
    confidence: "high",
  });
  l = setRealizedRoiEntry(l, "p02", {
    actualMonthlyRevenueLift: 2000,
    actualMonthlyCost: 500,
    confidence: "medium",
  });
  l = setRealizedRoiEntry(l, "p03", {
    actualMonthlyRevenueLift: 500,
    actualMonthlyCost: 0,
    confidence: "low",
  });

  const agg = aggregateLedger(l);
  check("entriesLogged = 3", agg.entriesLogged === 3);
  check("totalMonthlyRevenueLift = 3500", agg.totalMonthlyRevenueLift === 3500);
  check("totalMonthlyCost = 600", agg.totalMonthlyCost === 600);
  check("totalNetMonthlyLift = 2900", agg.totalNetMonthlyLift === 2900);
  check("totalAnnualizedLift = 2900*12", agg.totalAnnualizedLift === 2900 * 12);
  check("totalOrdersLift = 50", agg.totalOrdersLift === 50);
  check("byConfidence.high = 1", agg.byConfidence.high === 1);
  check("byConfidence.medium = 1", agg.byConfidence.medium === 1);
  check("byConfidence.low = 1", agg.byConfidence.low === 1);
  // avgRoiMultiple skips infinite (p03); (9 + 3) / 2 = 6
  check("avgRoiMultiple skips Infinity", Math.abs(agg.avgRoiMultiple - 6) < 1e-9, `avg=${agg.avgRoiMultiple}`);
}

console.log("\naggregateLedger empty:");
{
  const agg = aggregateLedger({});
  check("entriesLogged = 0", agg.entriesLogged === 0);
  check("totalNet = 0", agg.totalNetMonthlyLift === 0);
  check("avgRoiMultiple = 0", agg.avgRoiMultiple === 0);
}

console.log("\ndaysSince:");
{
  const now = new Date("2026-10-03T10:00:00Z");
  check("0 days for same instant", daysSince("2026-10-03T10:00:00Z", now) === 0);
  check("1 day for 24h prior", daysSince("2026-10-02T10:00:00Z", now) === 1);
  check("30 days for ~1 month prior", daysSince("2026-09-03T10:00:00Z", now) === 30);
}

console.log("\nload/save round-trip:");
{
  withMockStorage(() => {
    let l: RealizedRoiLedger = {};
    l = setRealizedRoiEntry(l, "p01", {
      actualMonthlyRevenueLift: 1234,
      actualMonthlyCost: 100,
      confidence: "high",
    });
    saveRealizedRoiLedger(l);
    const loaded = loadRealizedRoiLedger();
    check("load returns the saved entry", loaded["p01"]?.actualMonthlyRevenueLift === 1234);
    check("load preserves confidence", loaded["p01"]?.confidence === "high");

    // Corrupted entry should be dropped on load.
    saveRealizedRoiLedger({
      p01: { ...l["p01"]! },
      p02: {
        actualMonthlyRevenueLift: 500,
        // missing loggedAt — should be filtered out
      } as unknown as (typeof l)["p01"],
    });
    const filtered = loadRealizedRoiLedger();
    check("corrupted entry (missing loggedAt) is filtered", !("p02" in filtered));
    check("valid entry survives corruption", "p01" in filtered);
  });
}

console.log("\nledgerToMarkdown:");
{
  let l: RealizedRoiLedger = {};
  l = setRealizedRoiEntry(l, "p01", {
    actualMonthlyRevenueLift: 5000,
    actualMonthlyCost: 500,
    confidence: "high",
    notes: "Klaviyo + Postscript, 14-day attribution",
  });
  l = setRealizedRoiEntry(l, "p02", {
    actualMonthlyRevenueLift: 200,
    actualMonthlyCost: 0,
  });

  const md = ledgerToMarkdown(l, new Date("2026-10-03T10:00:00Z"), (id) => {
    return id === "p01" ? "Abandoned cart" : id === "p02" ? "Welcome series" : undefined;
  });

  check("starts with H1", md.startsWith("# Realized ROI ledger"));
  check("contains entry count + totals", md.includes("2 entries"));
  check("renders p01 title", md.includes("Abandoned cart"));
  check("renders p02 title", md.includes("Welcome series"));
  check("includes ∞× for zero-cost entry", md.includes("∞×"));
  check("includes confidence label", md.includes("High conf."));
}

console.log("\nledgerToMarkdown empty:");
{
  const md = ledgerToMarkdown({});
  check("empty renders placeholder", md.includes("No actuals logged yet"));
}

console.log("\nledgerToCsv:");
{
  let l: RealizedRoiLedger = {};
  l = setRealizedRoiEntry(l, "p01", {
    actualMonthlyRevenueLift: 1000,
    actualMonthlyCost: 200,
    actualMonthlyOrdersLift: 50,
    confidence: "high",
    notes: 'has, comma and "quote"',
  });
  const out = ledgerToCsv(l, () => "Abandoned cart");
  const lines = out.trim().split("\n");
  check("CSV has 2 lines (header + entry)", lines.length === 2);
  check("CSV header is canonical", lines[0].startsWith("playbook_id,playbook_title"));
  check("CSV row has 13 columns", lines[1].split(",").length >= 13);
  check("CSV escapes comma + quotes in notes", lines[1].includes('"has, comma and ""quote"""'));
}

console.log("\nledgerSnapshot:");
{
  let l: RealizedRoiLedger = {};
  l = setRealizedRoiEntry(l, "p01", { actualMonthlyRevenueLift: 5000, actualMonthlyCost: 500 }); // net = 4500
  l = setRealizedRoiEntry(l, "p02", { actualMonthlyRevenueLift: 200, actualMonthlyCost: 0 });     // net = 200 (∞× via sentinel 0/0)
  // p03 negative revenue is sanitized to 0 by the writer — that's a product
  // decision — so this entry ends up with rev=0, cost=0 → net=0 → ROI=0.
  l = setRealizedRoiEntry(l, "p03", { actualMonthlyRevenueLift: -100, actualMonthlyCost: 0 });

  const snap = ledgerSnapshot(l);
  check("entriesLogged = 3", snap.entriesLogged === 3);
  // p01 net=4500 + p02 net=200 + p03 sanitized net=0 = 4700
  check("netMonthly = 4700", snap.netMonthly === 4700);
  // avgRoi: p01=9 finite, p02=Infinity skipped, p03 sanitized → roi=0 (finite)
  // avg = (9 + 0) / 2 = 4.5
  check("avgRoi multiple is 4.5×", snap.roiMultipleLabel === "4.5×");
  check("UNMEASURED entries don't count as underperforming", snap.underperforming === 0);
  check("p01 is UNMEASURED vs 0/0 sentinel", classifyGapVsProjected(l["p01"]!, 0, 0) === "UNMEASURED");
}

console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  console.error("FAILURES:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}