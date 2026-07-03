/**
 * Welcome Series ROI math — direct TypeScript port of
 * `/scripts/welcome_series_roi.py`.
 *
 * Used by the interactive `<WelcomeSeriesROICalculator />` component on the
 * `/playbooks` page. The math, defaults, and health-band thresholds are kept
 * byte-identical to the Python CLI so an operator can sanity-check the same
 * numbers in the browser and the terminal without drift.
 */

export interface WelcomeSeriesInputs {
  optinsPerMonth: number;          // Newsletter / quiz / popup opt-ins / month
  firstPurchaseCvr: number;        // 0..1 — share of opt-ins that buy in 14 days
  aov: number;                     // Average order value (USD)
  grossMargin: number;             // 0..1
  welcomeDiscount: number;         // 0..1 (0.10 = 10% off first order)
  emailCostPerDelivered: number;   // USD per delivered email (Klaviyo)
  emailCount: number;              // Emails per series (default 5)
  emailDeliveryRate: number;       // 0..1
  smsCostPerMessage: number;       // USD per SMS sent (Postscript + carrier)
  smsCount: number;                // SMS per opted-in subscriber (default 1)
  smsOptinRate: number;            // 0..1
  horizonDays: number;             // Forecast horizon (default 90)
}

export interface WelcomeSeriesForecast {
  firstOrdersPerMonth: number;
  revenuePerMonth: number;
  marginPerMonth: number;
  discountCostPerMonth: number;
  netMarginPerMonth: number;
  emailSendCostPerMonth: number;
  smsSendCostPerMonth: number;
  totalSendCostPerMonth: number;
  netRevenuePerMonth: number;
  roiRatio: number;            // net_margin / total_send_cost
  revenuePerDollarSent: number;
  revenuePerOptin: number;
  marginPerOptin: number;
  breakevenCvr: number;        // +Infinity when discount >= margin
  healthBand: string;
}

export const WELCOME_SERIES_DEFAULTS: WelcomeSeriesInputs = {
  optinsPerMonth: 1000,
  firstPurchaseCvr: 0.03,
  aov: 75,
  grossMargin: 0.70,
  welcomeDiscount: 0.10,
  emailCostPerDelivered: 0.0005,
  emailCount: 5,
  emailDeliveryRate: 0.70,
  smsCostPerMessage: 0.012,
  smsCount: 1,
  smsOptinRate: 0.30,
  horizonDays: 90,
};

export function forecastWelcomeSeries(inputs: WelcomeSeriesInputs): WelcomeSeriesForecast {
  const firstOrders = inputs.optinsPerMonth * inputs.firstPurchaseCvr;
  const revenue = firstOrders * inputs.aov;
  const margin = revenue * inputs.grossMargin;
  const discountCost = revenue * inputs.welcomeDiscount;
  const netMargin = margin - discountCost;

  const emailCost =
    inputs.emailCount *
    inputs.optinsPerMonth *
    inputs.emailDeliveryRate *
    inputs.emailCostPerDelivered;
  const smsCost =
    inputs.smsCount *
    inputs.optinsPerMonth *
    inputs.smsOptinRate *
    inputs.smsCostPerMessage;
  const totalSendCost = emailCost + smsCost;
  const netRevenue = netMargin - totalSendCost;

  const roiRatio =
    totalSendCost > 0
      ? netMargin / totalSendCost
      : netMargin > 0
        ? Infinity
        : -Infinity;

  const revenuePerOptin = inputs.optinsPerMonth > 0 ? netRevenue / inputs.optinsPerMonth : 0;
  const marginPerOptin = inputs.optinsPerMonth > 0 ? netMargin / inputs.optinsPerMonth : 0;

  const marginAfterDiscount = inputs.grossMargin - inputs.welcomeDiscount;
  let breakevenCvr: number;
  if (marginAfterDiscount <= 0) {
    breakevenCvr = Infinity;
  } else if (inputs.optinsPerMonth <= 0) {
    breakevenCvr = 0;
  } else {
    breakevenCvr =
      totalSendCost / (inputs.optinsPerMonth * inputs.aov * marginAfterDiscount);
  }

  return {
    firstOrdersPerMonth: firstOrders,
    revenuePerMonth: revenue,
    marginPerMonth: margin,
    discountCostPerMonth: discountCost,
    netMarginPerMonth: netMargin,
    emailSendCostPerMonth: emailCost,
    smsSendCostPerMonth: smsCost,
    totalSendCostPerMonth: totalSendCost,
    netRevenuePerMonth: netRevenue,
    roiRatio,
    revenuePerDollarSent: roiRatio,
    revenuePerOptin,
    marginPerOptin,
    breakevenCvr,
    healthBand: healthBand(roiRatio),
  };
}

export function healthBand(roiRatio: number): string {
  // Mirror the Python CLI's branch order — guards on total send cost == 0 live in
  // the caller, this helper just buckets a ratio number.
  if (!Number.isFinite(roiRatio)) {
    // Distinguish +inf (great with no send cost) from -inf (negative with no send cost).
    return roiRatio > 0
      ? "great (positive net, no send cost tracked)"
      : "weak (no send cost tracked, net <= 0)";
  }
  if (roiRatio >= 30) return "great (>=30:1, top-tier welcome flow)";
  if (roiRatio >= 10) return "good (10-30:1, healthy DTC welcome flow)";
  if (roiRatio >= 3) return "marginal (3-10:1, tune subject lines + send cadence)";
  if (roiRatio > 0) return "weak (<3:1, investigate discount cost + send frequency)";
  return "negative (cost > margin — reduce email count or discount)";
}

export function healthBandShort(
  roiRatio: number,
): "great" | "good" | "marginal" | "weak" | "negative" | "zero-cost" {
  if (!Number.isFinite(roiRatio)) return roiRatio > 0 ? "great" : "weak";
  if (roiRatio >= 30) return "great";
  if (roiRatio >= 10) return "good";
  if (roiRatio >= 3) return "marginal";
  if (roiRatio > 0) return "weak";
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
