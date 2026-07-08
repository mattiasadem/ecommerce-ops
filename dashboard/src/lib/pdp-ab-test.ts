/**
 * `pdp-ab-test.ts` — Pure scoring + forecast engine for the interactive
 * PDP A/B test analyzer.
 *
 * Direct TypeScript port of `/scripts/pdp_ab_test.py` (the canonical Move
 * #9.5 calculator). Implements the two-proportion z-test + a steady-state
 * program ROI forecast so an operator can analyze a finished A/B test
 * and stress-test the always-on testing cadence without leaving the
 * browser.
 *
 * Statistical method (matches the Python CLI):
 *   z = (p_v - p_c) / sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_v))
 *   where p_pool = (x_c + x_v) / (n_c + n_v).
 *   Two-sided p-value via the standard normal CDF (Abramowitz & Stegun
 *   7.1.26 approximation).
 *
 * Decision bands:
 *   winner       — confidence >= target AND relative_lift > 0
 *   loser        — confidence >= target AND relative_lift < 0
 *   inconclusive — otherwise (small sample / low lift / no signal)
 *
 * Program ROI bands (annualized net per $1 program cost):
 *   great >= 20:1 — top-tier always-on program
 *   good  >= 10:1 — mature testing program
 *   fair  >=  5:1 — acceptable; optimize operator hours
 *   weak  <   5:1 — lower operator hours or raise avg lift
 *
 * Pure data — no DOM, no localStorage side effects (those live in the
 * component).
 */

export interface AbTestInputs {
  controlSessions: number;
  controlConversions: number;
  variantSessions: number;
  variantConversions: number;
  aov: number;
  margin: number; // 0..1
  monthlyPdpSessions: number;
  toolMonthlyCost: number;
  operatorHoursPerMonth: number;
  operatorHourlyRate: number;
  confidenceTarget: number; // 0..1
  avgRelativeLift: number; // 0..5
  testsPerMonth: number;
}

export interface AbTestResult {
  controlRate: number;
  variantRate: number;
  absoluteLift: number;
  relativeLift: number;
  zScore: number;
  pValue: number;
  confidence: number;
  isSignificant: boolean;
  decision: "winner" | "loser" | "inconclusive";
  decisionLabel: string;
}

export interface ProgramForecast {
  grossMarginLiftPerMonth: number;
  totalProgramCostPerMonth: number;
  netRevenuePerMonth: number;
  netRevenuePerYear: number;
  annualizedCost: number;
  annualizedRatio: number;
  healthBand: string;
  healthBandShort: "great" | "good" | "fair" | "weak";
}

// ---- Canonical defaults (match scripts/pdp_ab_test.py) --------------------

export const PDP_AB_TEST_DEFAULTS: AbTestInputs = {
  controlSessions: 10000,
  controlConversions: 200,
  variantSessions: 10000,
  variantConversions: 240,
  aov: 75,
  margin: 0.7,
  monthlyPdpSessions: 10000,
  toolMonthlyCost: 200,
  operatorHoursPerMonth: 2,
  operatorHourlyRate: 50,
  confidenceTarget: 0.95,
  avgRelativeLift: 0.05,
  testsPerMonth: 4,
};

// ---- Math helpers ---------------------------------------------------------

/** Standard normal cumulative distribution function (CDF). */
function phi(x: number): number {
  // A&S 7.1.26 constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  let sign = 1;
  let xa = x;
  if (xa < 0) {
    sign = -1;
    xa = -xa;
  }

  const t = 1.0 / (1.0 + p * xa);
  const y =
    1.0 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
      t *
      Math.exp((-xa * xa) / 2.0);
  return 0.5 * (1.0 + sign * y);
}

/** Two-sided p-value from a z-score: P(|Z| >= |z|) under H0. */
function twoSidedPValue(z: number): number {
  return 2.0 * (1.0 - phi(Math.abs(z)));
}

// ---- Analysis -------------------------------------------------------------

export function analyzeAbTest(inputs: AbTestInputs): AbTestResult {
  const { controlSessions, controlConversions, variantSessions, variantConversions, confidenceTarget } = inputs;
  const nC = controlSessions;
  const nV = variantSessions;
  const xC = controlConversions;
  const xV = variantConversions;

  const pC = nC > 0 ? xC / nC : 0;
  const pV = nV > 0 ? xV / nV : 0;
  const absoluteLift = pV - pC;
  const relativeLift = pC > 0 ? absoluteLift / pC : 0;

  const nTotal = nC + nV;
  const xTotal = xC + xV;

  let zScore = 0;
  let pValue = 1;
  if (nTotal > 0 && xTotal > 0 && xTotal < nTotal) {
    const pPool = xTotal / nTotal;
    const seSquared = pPool * (1 - pPool) * (1 / nC + 1 / nV);
    if (seSquared > 0) {
      zScore = absoluteLift / Math.sqrt(seSquared);
      pValue = twoSidedPValue(zScore);
    }
  }

  const confidence = Math.max(0, Math.min(1, 1 - pValue));
  const isSignificant = confidence >= confidenceTarget;

  let decision: "winner" | "loser" | "inconclusive";
  if (isSignificant && relativeLift > 0) {
    decision = "winner";
  } else if (isSignificant && relativeLift < 0) {
    decision = "loser";
  } else {
    decision = "inconclusive";
  }

  const decisionLabel =
    decision === "winner"
      ? "Winner (variant beats control)"
      : decision === "loser"
        ? "Loser (variant underperforms control — revert)"
        : "Inconclusive (not enough evidence — keep running or stop)";

  return {
    controlRate: pC,
    variantRate: pV,
    absoluteLift,
    relativeLift,
    zScore,
    pValue,
    confidence,
    isSignificant,
    decision,
    decisionLabel,
  };
}

// ---- Program ROI forecast -------------------------------------------------

export function forecastProgramRoi(inputs: AbTestInputs): ProgramForecast {
  const { aov, avgRelativeLift, monthlyPdpSessions, margin, toolMonthlyCost, operatorHoursPerMonth, operatorHourlyRate } = inputs;

  const grossMarginLift = aov * avgRelativeLift * monthlyPdpSessions * margin;
  const operatorCost = operatorHoursPerMonth * operatorHourlyRate;
  const totalCost = toolMonthlyCost + operatorCost;

  const netMonthly = grossMarginLift - totalCost;
  const netAnnual = netMonthly * 12;
  const annualizedCost = totalCost * 12;

  let ratio: number;
  if (annualizedCost > 0) {
    ratio = netAnnual / annualizedCost;
  } else {
    ratio = netAnnual > 0 ? Infinity : 0;
  }

  let band: ProgramForecast["healthBandShort"];
  let healthBand: string;
  if (ratio >= 20) {
    band = "great";
    healthBand = `great (>=20:1 annualized, top-tier always-on program, ${ratio.toFixed(1)}:1)`;
  } else if (ratio >= 10) {
    band = "good";
    healthBand = `good (10-20:1 annualized, mature testing program, ${ratio.toFixed(1)}:1)`;
  } else if (ratio >= 5) {
    band = "fair";
    healthBand = `fair (5-10:1 annualized, acceptable — optimize operator hours, ${ratio.toFixed(1)}:1)`;
  } else {
    band = "weak";
    healthBand = `weak (<5:1 annualized, lower operator hours or raise avg lift, ${ratio.toFixed(1)}:1)`;
  }

  return {
    grossMarginLiftPerMonth: grossMarginLift,
    totalProgramCostPerMonth: totalCost,
    netRevenuePerMonth: netMonthly,
    netRevenuePerYear: netAnnual,
    annualizedCost,
    annualizedRatio: ratio,
    healthBand,
    healthBandShort: band,
  };
}

// ---- Aggregate forecast ---------------------------------------------------

export interface AbTestPackage {
  analysis: AbTestResult;
  program: ProgramForecast;
}

export function forecastPdpAbTest(inputs: AbTestInputs): AbTestPackage {
  return {
    analysis: analyzeAbTest(inputs),
    program: forecastProgramRoi(inputs),
  };
}

/** Format the annualized ratio with infinite-guard for zero-cost programs. */
export function formatAnnualizedRatio(r: number): string {
  if (!Number.isFinite(r)) return "∞";
  if (r === 0) return "0.0×";
  return `${r.toFixed(1)}×`;
}

/** Decision chip palette intent. */
export type DecisionIntent = "winner" | "loser" | "inconclusive";
export function decisionIntent(d: DecisionIntent): "great" | "good" | "weak" {
  return d === "winner" ? "great" : d === "loser" ? "weak" : "good";
}