/**
 * Post-Purchase Upsell ROI math — direct TypeScript port of
 * /scripts/post_purchase_upsell_roi.py.
 *
 * Used by the interactive `<PostPurchaseUpsellROICalculator />` component on
 * the `/playbooks` page. The math, defaults, and health-band thresholds are
 * kept identical to the Python CLI so an operator can sanity-check in the
 * browser and re-run the same numbers in the terminal without drift.
 */

export interface PostPurchaseUpsellInputs {
  ordersPerMonth: number; // Orders placed / month
  baseAov: number; // Average order value of the original order
  upsellAcceptanceRate: number; // Fraction of orders that accept the upsell (0..1)
  upsellAov: number; // Price of the upsell offer
  upsellMargin: number; // Gross margin on the upsell (0..1)
  platformCostPerOrder: number; // USD per order charged by the upsell app
}

export interface PostPurchaseUpsellForecast {
  upsellUnitsPerMonth: number;
  incrementalRevenuePerMonth: number;
  incrementalMarginPerMonth: number;
  platformCostPerMonth: number;
  netLiftPerMonth: number;
  /** Net lift per $1 platform cost (0 when platform cost is 0). */
  roiRatio: number;
  newBlendedAov: number;
  aovLiftPct: number;
  healthBand: string;
}

export const POST_PURCHASE_UPSELL_DEFAULTS: PostPurchaseUpsellInputs = {
  ordersPerMonth: 1000,
  baseAov: 80,
  upsellAcceptanceRate: 0.15,
  upsellAov: 35,
  upsellMargin: 0.70,
  platformCostPerOrder: 0.10,
};

export function forecastPostPurchaseUpsell(
  inputs: PostPurchaseUpsellInputs,
): PostPurchaseUpsellForecast {
  const upsellUnits = Math.round(inputs.ordersPerMonth * inputs.upsellAcceptanceRate);
  const incrementalRevenue = upsellUnits * inputs.upsellAov;
  const incrementalMargin = incrementalRevenue * inputs.upsellMargin;
  const platformCost = inputs.ordersPerMonth * inputs.platformCostPerOrder;
  const netLift = incrementalMargin - platformCost;
  const roi = platformCost > 0 ? netLift / platformCost : 0;

  const newBlendedAov =
    inputs.ordersPerMonth > 0
      ? (inputs.ordersPerMonth * inputs.baseAov + incrementalRevenue) /
        inputs.ordersPerMonth
      : inputs.baseAov;
  const aovLiftPct =
    inputs.baseAov > 0 ? (newBlendedAov - inputs.baseAov) / inputs.baseAov : 0;

  return {
    upsellUnitsPerMonth: upsellUnits,
    incrementalRevenuePerMonth: incrementalRevenue,
    incrementalMarginPerMonth: incrementalMargin,
    platformCostPerMonth: platformCost,
    netLiftPerMonth: netLift,
    roiRatio: roi,
    newBlendedAov,
    aovLiftPct,
    healthBand: healthBand(roi, platformCost),
  };
}

export function healthBand(roi: number, platformCost: number): string {
  // Mirror the Python CLI's `health_band()` exactly: zero-cost guard first,
  // then numeric thresholds.
  if (platformCost <= 0) return "great (no platform cost — set cost to see true ROI)";
  if (roi >= 30) return `great (>=30:1 net lift per $1 platform cost, ${roi.toFixed(1)}:1)`;
  if (roi >= 15) return `good (15-30:1, ${roi.toFixed(1)}:1)`;
  if (roi >= 5) return `marginal (5-15:1, ${roi.toFixed(1)}:1)`;
  return `weak (<5:1 net lift per $1 platform cost, ${roi.toFixed(1)}:1)`;
}

export function healthBandShort(
  roi: number,
): "great" | "good" | "marginal" | "weak" | "negative" | "zero-cost" {
  // 0 here implies platform-cost-was-zero AND netLift<=0 (Python returns 0).
  // We treat 0 with zero platform cost as "great (no cost tracked)".
  if (roi === 0) return "zero-cost";
  if (roi >= 30) return "great";
  if (roi >= 15) return "good";
  if (roi >= 5) return "marginal";
  if (roi > 0) return "weak";
  return "negative";
}

export function healthBandIntent(
  short: ReturnType<typeof healthBandShort>,
): "positive" | "accent" | "warning" | "danger" | "neutral" {
  switch (short) {
    case "great":
      return "positive";
    case "good":
      return "accent";
    case "marginal":
      return "warning";
    case "weak":
      return "danger";
    case "negative":
      return "danger";
    case "zero-cost":
      return "neutral";
  }
}