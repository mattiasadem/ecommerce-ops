/**
 * Unit tests for the 5-Cohort LTV Simulator — Move #N.62.
 *
 * Covers:
 *   - simulateCohortLtv produces stable, deterministic output for fixed inputs
 *   - normalizeCohortMix balances to 100
 *   - shiftCohortMix applies the delta correctly
 *   - bandForLtv / bandForRepeatRate thresholds
 *   - horizon selector (6/12/24) scales revenue proportionally
 */

import {
  COHORT_PROFILES,
  DEFAULT_COHORT_MIX,
  bandForLtv,
  bandForRepeatRate,
  normalizeCohortMix,
  shiftCohortMix,
  simulateCohortLtv,
} from "../cohort-ltv-simulator";

describe("cohort-ltv-simulator", () => {
  test("DEFAULT_COHORT_MIX sums to 100", () => {
    const sum = Object.values(DEFAULT_COHORT_MIX).reduce((n, v) => n + v, 0);
    expect(sum).toBeCloseTo(100, 6);
  });

  test("COHORT_PROFILES has 5 entries with unique ids", () => {
    expect(COHORT_PROFILES).toHaveLength(5);
    const ids = new Set(COHORT_PROFILES.map((p) => p.id));
    expect(ids.size).toBe(5);
  });

  test("normalizeCohortMix balances raw mix to 100", () => {
    const raw = { vip: 10, loyal: 20, firstTime: 30, mobileBrowse: 40, dormant: 50 };
    const normalized = normalizeCohortMix(raw);
    const sum = Object.values(normalized).reduce((n, v) => n + v, 0);
    expect(sum).toBeCloseTo(100, 6);
    // VIP should be smallest share (10/150 ≈ 6.67%).
    expect(normalized.vip).toBeCloseTo((10 / 150) * 100, 4);
  });

  test("normalizeCohortMix falls back to defaults on all-zero input", () => {
    const raw = { vip: 0, loyal: 0, firstTime: 0, mobileBrowse: 0, dormant: 0 };
    const normalized = normalizeCohortMix(raw);
    expect(normalized).toEqual(DEFAULT_COHORT_MIX);
  });

  test("shiftCohortMix moves deltaPp from→to and normalizes", () => {
    const base = { ...DEFAULT_COHORT_MIX };
    const next = shiftCohortMix(base, "mobileBrowse", "firstTime", 8);
    // Pre-normalization: mobileBrowse drops by 8, firstTime rises by 8.
    expect(next.mobileBrowse).toBeLessThan(DEFAULT_COHORT_MIX.mobileBrowse);
    expect(next.firstTime).toBeGreaterThan(DEFAULT_COHORT_MIX.firstTime);
    // Sum stays ~100 after normalization.
    const sum = Object.values(next).reduce((n, v) => n + v, 0);
    expect(sum).toBeCloseTo(100, 6);
  });

  test("simulateCohortLtv: 1000 orders × $75 AOV × 70% margin → 12mo revenue ~ $1.0M–$2.0M (includes repeats)", () => {
    const result = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: DEFAULT_COHORT_MIX,
      horizonMonths: 12,
    });
    // First-order revenue = 1000 * 75 * 12 = $900k floor.
    // Repeat revenue (across 5 cohorts) lifts the total above that.
    expect(result.totalRevenue).toBeGreaterThan(900_000);
    expect(result.totalRevenue).toBeLessThan(2_000_000);
    expect(result.totalMargin).toBeCloseTo(result.totalRevenue * 0.70, 2);
    expect(result.rows).toHaveLength(5);
  });

  test("simulateCohortLtv: 24mo horizon doubles 12mo revenue proportionally", () => {
    const r12 = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: DEFAULT_COHORT_MIX,
      horizonMonths: 12,
    });
    const r24 = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: DEFAULT_COHORT_MIX,
      horizonMonths: 24,
    });
    // Should be approximately 2× (repeat math has compounding).
    expect(r24.totalRevenue / r12.totalRevenue).toBeGreaterThan(1.8);
    expect(r24.totalRevenue / r12.totalRevenue).toBeLessThan(2.5);
  });

  test("simulateCohortLtv: rows sum to total revenue", () => {
    const result = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: DEFAULT_COHORT_MIX,
      horizonMonths: 12,
    });
    const rowsSum = result.rows.reduce((n, r) => n + r.cohortRevenue, 0);
    expect(rowsSum).toBeCloseTo(result.totalRevenue, 4);
  });

  test("bandForLtv thresholds", () => {
    expect(bandForLtv(500, 100)).toBe("great"); // 5x
    expect(bandForLtv(300, 100)).toBe("healthy"); // 3x
    expect(bandForLtv(200, 100)).toBe("weak"); // 2x
    expect(bandForLtv(100, 100)).toBe("danger"); // 1x
  });

  test("bandForRepeatRate thresholds", () => {
    expect(bandForRepeatRate(0.40)).toBe("great");
    expect(bandForRepeatRate(0.30)).toBe("healthy");
    expect(bandForRepeatRate(0.20)).toBe("weak");
    expect(bandForRepeatRate(0.10)).toBe("danger");
  });

  test("weighted repeat rate reflects cohort mix", () => {
    const result = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: { vip: 0, loyal: 0, firstTime: 0, mobileBrowse: 100, dormant: 0 },
      horizonMonths: 12,
    });
    // All mobileBrowse → weighted repeat ≈ mobileBrowse's 12% rate.
    expect(result.weightedRepeatRate).toBeCloseTo(0.12, 4);
  });

  test("VIP cohort has highest LTV (aovMultiplier 1.6 + 70% repeat)", () => {
    const result = simulateCohortLtv({
      monthlyOrders: 1000,
      aov: 75,
      grossMargin: 0.70,
      cohortMix: { vip: 100, loyal: 0, firstTime: 0, mobileBrowse: 0, dormant: 0 },
      horizonMonths: 12,
    });
    const vip = result.rows.find((r) => r.id === "vip")!;
    expect(vip.ltv).toBeGreaterThan(150); // $75 * 1.6 = $120 base + repeats
    expect(vip.ltv).toBeGreaterThan(result.rows.find((r) => r.id === "dormant")!.ltv);
  });
});