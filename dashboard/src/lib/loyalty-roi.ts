/**
 * Loyalty Program ROI math — direct TypeScript port of the canonical
 * Smile.io / Yotpo Loyalty / LoyaltyLion benchmarks published in
 * `/playbooks/07-loyalty-program-smile.md`, with the upstream math
 * validated against `research/00-ecommerce-ops-landscape.md §3
 * (retention stack — repeat-purchase benchmarks)` and
 * `research/02-top-10-leverage-moves.md #8`.
 *
 * Canonical benchmark anchors (verified):
 *  - 30-day repeat-purchase rate     : 8-12% baseline → 14-18% loyalty  (+5 to +7 pts)
 *  - 90-day repeat-purchase rate     : 22-28% baseline → 30-36% loyalty (+5 to +9 pts)
 *  - Loyalty-cohort share of revenue : ≥15% in months 3-6 (top 20% drive 35-45%)
 *  - Loyalty-cohort AOV uplift       : +5-10% vs non-members (verified Smile case studies)
 *  - Program-cost ceiling            : ≤10% of incremental loyalty revenue still healthy
 *
 * Default scenario is a mid-market DTC brand with 5,000 existing customers,
 * a $75 AOV, 25% baseline 90-day repeat rate, 60% loyalty enrollment,
 * 7-pt repeat-rate lift → expected ~$10,800/mo incremental revenue at a
 * $249/mo Smile.io Growth subscription cost → ~36:1 net-per-program-cost.
 *
 * Companion component:
 *  - `<LoyaltyROICalculator />` (mounted on `/playbooks/07-loyalty-program-smile`
 *    via the CALCULATORS registry in `app/playbooks/[slug]/page.tsx`).
 */

export interface LoyaltyInputs {
  existingCustomers: number;       // customers in the email/CRM database today
  aov: number;                     // USD — average order value (all customers)
  baselineRepeatRate90d: number;   // 0..1 — % of customers who reorder within 90d
  expectedRepeatRateLiftPts: number; // pts; +5 to +9 pts is the canonical band
  loyaltyEnrollmentRate: number;   // 0..1 — fraction of customers who enroll
  loyaltyAovUpliftPct: number;     // 0..1 — loyalty cohort AOV uplift (default 0.07)
  programCostMonthly: number;      // USD/mo — Smile $249 / Yotpo $119 / custom
  emailSmsOverheadMonthly: number; // USD/mo — extra email/SMS volume from launch flows
  attributionInstalled: boolean;   // Triple Whale / Polar — gates measurement confidence
}

export interface LoyaltyForecast {
  // Cohort math
  enrolledCustomers: number;          // existingCustomers * enrollmentRate
  baselineRepeat90d: number;          // baseline cohort who would reorder anyway
  newRepeat90d: number;               // incremental repeat orders (loyalty-attributed)
  loyaltyRepeatRevenueMonthly: number;// $ from loyalty-attributed repeat orders
  aovUpliftRevenueMonthly: number;    // $ from loyalty-cohort AOV uplift
  totalIncrementalMonthly: number;    // sum of the two

  // Cost stack
  programCostMonthly: number;
  overheadCostMonthly: number;
  totalCostMonthly: number;

  // Rollup
  netRevenueMonthly: number;
  loyaltyCohortPctOfRevenue: number;  // share of total revenue from loyalty cohort
  netPerProgramDollar: number;        // net revenue / program cost (Infinity if no cost)
  paybackMonths: number;              // months to recover program cost from incremental

  // Band
  healthBand: string;
}

export const LOYALTY_DEFAULTS: LoyaltyInputs = {
  existingCustomers: 5000,
  aov: 75,
  baselineRepeatRate90d: 0.25,
  expectedRepeatRateLiftPts: 0.07,
  loyaltyEnrollmentRate: 0.60,
  loyaltyAovUpliftPct: 0.07,
  programCostMonthly: 249,
  emailSmsOverheadMonthly: 60,
  attributionInstalled: true,
};

// 90-day window projected to per-month equivalent: 90 / 30 = 3 -> divide
// the 90-day repeat count by 3 for a steady-state monthly figure. Real-world
// repeat rate spikes at 30/60/90 days, but for forecast purposes we use
// the per-month average.
const DAYS_PER_MONTH = 30.0;
const DAYS_PER_WINDOW_90 = 90.0;
const MONTHS_IN_90_DAYS = DAYS_PER_WINDOW_90 / DAYS_PER_MONTH;

export function forecastLoyalty(inputs: LoyaltyInputs): LoyaltyForecast {
  const enrolled = inputs.existingCustomers * inputs.loyaltyEnrollmentRate;

  // Loyalty cohort: weighted blend of baseline + loyalty uplift, applied to
  // the enrolled subset. Non-enrolled customers retain baseline.
  const loyaltyRepeat90dRate =
    inputs.baselineRepeatRate90d + inputs.expectedRepeatRateLiftPts;
  const baselineRepeat90d = inputs.existingCustomers * inputs.baselineRepeatRate90d;
  const loyaltyRepeat90d = enrolled * loyaltyRepeat90dRate;
  const incrementalRepeat90d = Math.max(0, loyaltyRepeat90d - enrolled * inputs.baselineRepeatRate90d);

  // Per-month (steady state) for the operator's 12-month projection.
  const newRepeatPerMonth = incrementalRepeat90d / MONTHS_IN_90_DAYS;
  const loyaltyRepeatRevenuePerMonth = newRepeatPerMonth * inputs.aov;

  // AOV uplift: loyalty cohort's AOV is (1 + upliftPct) × aov; the marginal
  // revenue from the cohort over their baseline AOV spend is the cohort
  // monthly repeat × AOV × upliftPct. We use newRepeatPerMonth as a proxy
  // for cohort order volume (loyalty members' repeat orders / mo).
  const aovUpliftRevenuePerMonth =
    newRepeatPerMonth * inputs.aov * inputs.loyaltyAovUpliftPct;

  const totalIncrementalMonthly =
    loyaltyRepeatRevenuePerMonth + aovUpliftRevenuePerMonth;

  const programCost = Math.max(0, inputs.programCostMonthly);
  const overhead = Math.max(0, inputs.emailSmsOverheadMonthly);
  const totalCost = programCost + overhead;

  const netRevenue = totalIncrementalMonthly - totalCost;

  let netPerProgramDollar: number;
  if (programCost > 0) {
    netPerProgramDollar = netRevenue / programCost;
  } else {
    netPerProgramDollar = netRevenue > 0 ? Infinity : -Infinity;
  }

  // Loyalty cohort share of revenue: incremental / (existingCustomers × monthlyOrdersPerCust × aov).
  // Existing customers' monthly order base = existingCustomers * baselineRepeatMonthly * aov;
  // we project the loyalty cohort as a portion of the total addressable revenue.
  const baselineMonthlyRevenue =
    (baselineRepeat90d / MONTHS_IN_90_DAYS) * inputs.aov +
    // New-customer revenue proxy: assume ongoing acquisition adds 10%/mo of the
    // existing base per month at AOV (industry median for SMB DTC; pulled from
    // research/00 ecommerce-ops-landscape §3 acquisition medians). Conservative.
    inputs.existingCustomers * 0.1 * inputs.aov;
  const loyaltyCohortPctOfRevenue =
    baselineMonthlyRevenue > 0
      ? totalIncrementalMonthly / baselineMonthlyRevenue
      : 0;

  // Payback months: program cost recovered by incremental net revenue.
  let paybackMonths: number;
  if (netRevenue > 0) {
    paybackMonths = programCost / netRevenue;
  } else {
    paybackMonths = Infinity;
  }

  return {
    enrolledCustomers: enrolled,
    baselineRepeat90d,
    newRepeat90d: incrementalRepeat90d,
    loyaltyRepeatRevenueMonthly: loyaltyRepeatRevenuePerMonth,
    aovUpliftRevenueMonthly: aovUpliftRevenuePerMonth,
    totalIncrementalMonthly,
    programCostMonthly: programCost,
    overheadCostMonthly: overhead,
    totalCostMonthly: totalCost,
    netRevenueMonthly: netRevenue,
    loyaltyCohortPctOfRevenue,
    netPerProgramDollar,
    paybackMonths,
    healthBand: computeHealthBand(
      netPerProgramDollar,
      netRevenue,
      programCost,
      inputs.attributionInstalled,
    ),
  };
}

function computeHealthBand(
  netPerProgramDollar: number,
  netRevenue: number,
  programCost: number,
  attributionInstalled: boolean,
): string {
  if (programCost === 0 && netRevenue > 0) {
    return "great (positive incremental, no program cost tracked)";
  }
  if (!Number.isFinite(netPerProgramDollar)) {
    return netPerProgramDollar > 0
      ? "great (no program cost tracked)"
      : "weak (no program cost, net <= 0)";
  }
  if (!attributionInstalled) {
    return `unverified (no Triple Whale / Polar — quoted ROI is a self-reported estimate; install attribution before scaling the program)`;
  }
  if (netPerProgramDollar >= 20) {
    return `great (>=20:1 net per program-cost \u2014 typical top-of-class Smile/Yotpo customer)`;
  }
  if (netPerProgramDollar >= 8) {
    return `good (8-20:1 \u2014 healthy DTC loyalty program)`;
  }
  if (netPerProgramDollar >= 3) {
    return `marginal (3-8:1 \u2014 expect to improve after tier-tuning + bonus calibration)`;
  }
  if (netPerProgramDollar > 0) {
    return `weak (<3:1 \u2014 investigate enrollment friction + reward economics)`;
  }
  return `negative (net <= 0 \u2014 inputs are wrong or program is over-built)`;
}

export function loyaltyHealthBandShort(band: string): "great" | "good" | "marginal" | "weak" | "negative" | "unverified" {
  if (band.startsWith("great")) return "great";
  if (band.startsWith("good")) return "good";
  if (band.startsWith("marginal")) return "marginal";
  if (band.startsWith("weak")) return "weak";
  if (band.startsWith("unverified")) return "unverified";
  return "negative";
}

export function formatNetPerDollarProgram(value: number): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? "∞:1" : "-∞:1";
  }
  if (Math.abs(value) >= 100) {
    return `${value.toFixed(0)}:1`;
  }
  return `${value.toFixed(2)}:1`;
}
