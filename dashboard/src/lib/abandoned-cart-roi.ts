/**
 * Abandoned-Cart Flow ROI math — direct TypeScript port of
 * /scripts/abandoned_cart_roi.py.
 *
 * Used by the interactive `<AbandonedCartROICalculator />` component on the
 * `/playbooks` page. The math, defaults, and health-band thresholds are kept
 * identical to the Python CLI so an operator can sanity-check in the browser
 * and re-run the same numbers in the terminal without drift.
 */

export interface AbandonedCartInputs {
  checkoutsPerMonth: number; // Checkout Started events / month
  aov: number; // Average order value in USD
  recoveryRate: number; // Fraction of checkouts recovered (0..1)
  emailRate: number; // USD per delivered email
  emailCount: number; // Emails per abandoned cart
  emailDeliveryRate: number; // Fraction of sends that reach the inbox
  smsRate: number; // USD per SMS sent
  smsCount: number; // SMS per opted-in cart
  smsOptinRate: number; // Fraction of carts that are SMS-opted-in
}

export interface AbandonedCartForecast {
  recoveredOrdersPerMonth: number;
  recoveredRevenuePerMonth: number;
  emailSendCostPerMonth: number;
  smsSendCostPerMonth: number;
  totalSendCostPerMonth: number;
  netRevenuePerMonth: number;
  roiRatio: number;
  revenuePerDollarSent: number;
  healthBand: string;
}

export const ABANDONED_CART_DEFAULTS: AbandonedCartInputs = {
  checkoutsPerMonth: 1200,
  aov: 75,
  recoveryRate: 0.10,
  emailRate: 0.0005,
  emailCount: 3,
  emailDeliveryRate: 0.70,
  smsRate: 0.012,
  smsCount: 2,
  smsOptinRate: 0.25,
};

export function forecastAbandonedCart(inputs: AbandonedCartInputs): AbandonedCartForecast {
  const recoveredOrders = inputs.checkoutsPerMonth * inputs.recoveryRate;
  const recoveredRevenue = recoveredOrders * inputs.aov;

  const emailCost =
    inputs.emailCount *
    inputs.checkoutsPerMonth *
    inputs.emailDeliveryRate *
    inputs.emailRate;

  const smsCost =
    inputs.smsCount *
    inputs.checkoutsPerMonth *
    inputs.smsOptinRate *
    inputs.smsRate;

  const totalSendCost = emailCost + smsCost;
  const netRevenue = recoveredRevenue - totalSendCost;
  const roiRatio = totalSendCost > 0 ? recoveredRevenue / totalSendCost : Infinity;

  return {
    recoveredOrdersPerMonth: recoveredOrders,
    recoveredRevenuePerMonth: recoveredRevenue,
    emailSendCostPerMonth: emailCost,
    smsSendCostPerMonth: smsCost,
    totalSendCostPerMonth: totalSendCost,
    netRevenuePerMonth: netRevenue,
    roiRatio,
    revenuePerDollarSent: roiRatio,
    healthBand: healthBand(roiRatio),
  };
}

export function healthBand(roiRatio: number): string {
  if (!Number.isFinite(roiRatio)) return "great (no send cost — set SMS/email costs to see ROI)";
  if (roiRatio >= 30) return "great (>=30:1, matches top-of-class Omnisend benchmark)";
  if (roiRatio >= 15) return "good (15-30:1, healthy DTC flow)";
  if (roiRatio >= 5) return "marginal (5-15:1, expect to improve after subject-line + segmentation tuning)";
  if (roiRatio > 0) return "weak (<5:1, investigate trigger filters + suppression)";
  return "negative (no ROI — inputs are wrong)";
}

export function healthBandShort(roiRatio: number): "great" | "good" | "marginal" | "weak" | "negative" | "zero-cost" {
  if (!Number.isFinite(roiRatio)) return "zero-cost";
  if (roiRatio >= 30) return "great";
  if (roiRatio >= 15) return "good";
  if (roiRatio >= 5) return "marginal";
  if (roiRatio > 0) return "weak";
  return "negative";
}

export function healthBandIntent(short: ReturnType<typeof healthBandShort>): "positive" | "accent" | "warning" | "danger" | "neutral" {
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

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}×`;
}