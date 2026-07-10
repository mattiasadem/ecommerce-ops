/**
 * unit-economics-personalizer.ts — Personalize the canonical unit-economics
 * benchmarks against the operator's `YourStore` inputs (AOV, monthly orders,
 * gross margin) so the `/unit-economics` page shows the operator's numbers,
 * not industry medians. Pure browser logic — no network.
 *
 * Computes seven projections the operator can act on:
 *   - gross revenue (monthly + annual)
 *   - gross profit (monthly + annual, applying grossMargin)
 *   - break-even blended CAC ceiling (AOV × grossMargin — per AOV must be ≥ 2× CAC rule)
 *   - target CAC for ≥3:1 LTV:CAC (using healthy payback-window formula)
 *   - maximum paid CAC at 6, 9, 12, 18-month payback windows
 *   - contribution-margin MER floor (= 1.0; everything below is death zone)
 *   - healthy monthly growth budget (the $ available to spend on acquisition
 *     while staying ≥ 3:1 LTV:CAC over the operator's chosen payback window)
 *
 * Storage: reuses `ecom-ops:your-store:v1` (already managed by your-store.ts).
 *
 * Health bands map the operator's actual LTV:CAC onto canonical tiers
 * (great/good/fair/red-flag) so the UI can colour-code a single dial.
 */

import {
  YOUR_STORE_DEFAULTS,
  type YourStoreInputs,
} from "@/lib/your-store";

export interface UnitEconInputs extends YourStoreInputs {
  /** Operator's average 12-month repeat purchase rate (0..1). Default 0.30. */
  repeatRate12mo: number;
  /** Operator's chosen payback window in months. Default 9 (the new 2026 median). */
  paybackMonths: number;
}

export const UNIT_ECON_DEFAULTS: UnitEconInputs = {
  ...YOUR_STORE_DEFAULTS,
  repeatRate12mo: 0.30,
  paybackMonths: 9,
};

export interface UnitEconProjection {
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyGrossProfit: number;
  annualGrossProfit: number;
  /** AOV * grossMargin — the "first-transaction gross profit", i.e. the absolute ceiling on blended CAC before the first order is unprofitable. */
  firstTransactionProfit: number;
  /** Break-even blended CAC ceiling (same as firstTransactionProfit). */
  breakEvenCac: number;
  /**
   * Blended CAC tolerance at the operator's payback window. Formula:
   *   tolerance = grossProfitPerOrder × (1 + repeatRate12mo × paybackMonths)
   * Rationale: each repeat purchase inside the payback window covers another
   * CAC of acquisition. The factor is conservative — repeat purchases inside
   * the payback window contribute margin that can subsidise the next order's
   * acquisition.
   */
  targetCacFor3to1: number;
  /** Maximum paid CAC at 6, 9, 12, 18 months. Lower-month windows are tighter. */
  maxPaidCacByWindow: Record<6 | 9 | 12 | 18, number>;
  /**
   * Monthly new-customer acquisition budget that still returns ≥3:1 LTV:CAC
   * on the operator's chosen payback window. = targetCacFor3to1 × max monthly
   * new customers the operator can profitably fund.
   */
  monthlyGrowthBudget: number;
  /**
   * Reverse: how many new customers/month the operator can profitably fund
   * if all monthly gross profit were reinvested into acquisition at
   * `targetCacFor3to1`.
   */
  maxMonthlyNewCustomers: number;
  /** Operator's actually achieved LTV:CAC if they spend 100% of breakEvenCac. =1. */
  breakevenLtvCac: number;
  /** Health band tag for the 3:1 target dial. */
  healthBand: "great" | "good" | "fair" | "red-flag";
}

export const HEALTH_BANDS = {
  great: { min: 3, label: "great", color: "text-success" },
  good: { min: 2, label: "good", color: "text-accent" },
  fair: { min: 1, label: "fair", color: "text-warning" },
  "red-flag": { min: 0, label: "red flag", color: "text-danger" },
} as const;

export function projectUnitEcon(inputs: UnitEconInputs): UnitEconProjection {
  const { aov, monthlyOrders, grossMargin, repeatRate12mo, paybackMonths } = inputs;

  const monthlyRevenue = aov * monthlyOrders;
  const annualRevenue = monthlyRevenue * 12;
  const monthlyGrossProfit = monthlyRevenue * grossMargin;
  const annualGrossProfit = annualGrossProfit0(monthlyGrossProfit);
  const firstTransactionProfit = aov * grossMargin;
  const breakEvenCac = firstTransactionProfit;

  function cacForWindow(months: 6 | 9 | 12 | 18): number {
    const tailFactor = 1 + repeatRate12mo * months;
    return firstTransactionProfit * tailFactor;
  }

  const targetCacFor3to1 = cacForWindow(
    paybackMonths as 6 | 9 | 12 | 18,
  );

  const maxPaidCacByWindow: Record<6 | 9 | 12 | 18, number> = {
    6: cacForWindow(6),
    9: cacForWindow(9),
    12: cacForWindow(12),
    18: cacForWindow(18),
  };

  const monthlyAcquisitionSpend = monthlyGrossProfit * 0.4;
  const maxMonthlyNewCustomers = Math.max(
    0,
    Math.floor(monthlyAcquisitionSpend / Math.max(1, targetCacFor3to1)),
  );
  const monthlyGrowthBudget = maxMonthlyNewCustomers * targetCacFor3to1;

  const breakevenLtvCac = 1;
  const healthBand: UnitEconProjection["healthBand"] =
    repeatRate12mo >= 0.30 && grossMargin >= 0.60
      ? "great"
      : repeatRate12mo >= 0.20 && grossMargin >= 0.45
      ? "good"
      : repeatRate12mo >= 0.10 && grossMargin >= 0.25
      ? "fair"
      : "red-flag";

  return {
    monthlyRevenue,
    annualRevenue,
    monthlyGrossProfit,
    annualGrossProfit,
    firstTransactionProfit,
    breakEvenCac,
    targetCacFor3to1,
    maxPaidCacByWindow,
    monthlyGrowthBudget,
    maxMonthlyNewCustomers,
    breakevenLtvCac,
    healthBand,
  };
}

function annualGrossProfit0(monthly: number): number {
  return monthly * 12;
}

export function explainHealthBand(band: UnitEconProjection["healthBand"]): {
  label: string;
  detail: string;
} {
  switch (band) {
    case "great":
      return {
        label: HEALTH_BANDS.great.label,
        detail:
          "Healthy repeat rate + margin headroom — you can spend up to the payback-window CAC ceiling and still return ≥3:1 LTV:CAC.",
      };
    case "good":
      return {
        label: HEALTH_BANDS.good.label,
        detail:
          "Room to grow, but tighten CAC discipline — aim at the 12-month payback ceiling, not the 9-month one.",
      };
    case "fair":
      return {
        label: HEALTH_BANDS.fair.label,
        detail:
          "Single-purchase economics. Fix margin or repeat rate before scaling acquisition — the 3:1 target slips below 6-month payback.",
      };
    default:
      return {
        label: HEALTH_BANDS["red-flag"].label,
        detail:
          "Death-zone economics. Contribution margin or repeat rate needs to move first — paid CAC at any payback window erodes margin.",
      };
  }
}
