/**
 * SMS Welcome + Cart-Abandon ROI math — direct TypeScript port of the
 * playbook 06 canonical benchmarks (no equivalent Python CLI today; math is
 * derived from `/scripts/welcome_series_roi.py` + `playbooks/06-sms-welcome-and-cart-abandon.md`).
 *
 * Used by the interactive `<SmsWelcomeCartROICalculator />` component on the
 * `/playbooks/06-sms-welcome-and-cart-abandon` page. The 4 flows are
 * canonical:
 *   - SMS-1 Welcome (1 SMS, 5 min after explicit SMS opt-in, 10% code)
 *   - SMS-2 Cart-Abandon Reminder 1 (1 SMS, 1h after cart start, soft copy)
 *   - SMS-3 Cart-Abandon Reminder 2 (1 SMS, 24h, 10% escalation code)
 *   - SMS-4 Post-Purchase Review Request (1 SMS, 7d after fulfillment)
 *
 * Each flow has its own projected recovery / CVR / AOV / discount posture,
 * and the totals roll up into a single forecast with health-band verdict.
 *
 * Defaults match the canonical $1M-GMV apparel DTC brand baseline:
 *   - 1,000 SMS opt-ins / mo
 *   - 2,500 carts / mo (40% of 6,250 sessions × 40% add-to-cart)
 *   - 800 orders / mo
 *   - $75 AOV, 70% gross margin
 *   - Welcome-SMS lift: +20% CVR on top of 3% baseline
 *   - Cart-recovery rates: 5% (soft) + 3% (escalation)
 *   - Review-SMS CVR: 20% (vs 4% email baseline)
 *   - SMS-1 + SMS-3 carry a 10% discount; SMS-2 + SMS-4 do not
 *   - $0.014/SMS (Postscript + carrier)
 */

export interface SmsWelcomeCartInputs {
  smsOptinsPerMonth: number;        // Distinct SMS opt-ins / month (full TCPA-compliant)
  baselineFirstPurchaseCvr: number; // 0..1 — opt-in → first purchase on email-only (3%)
  cartStartsPerMonth: number;       // Carts started / month (2.5× orders for mid DTC)
  ordersPerMonth: number;           // Orders / month (denominator for review-SMS math)
  aov: number;                      // USD — average order value
  grossMargin: number;              // 0..1 — gross margin fraction
  discountFraction: number;         // 0..1 — 0.10 = 10% off (SMS-1 + SMS-3 only)
  cartRecoveryRate1: number;        // 0..1 — SMS-2 recovery rate on cart starts (5%)
  cartRecoveryRate2: number;        // 0..1 — SMS-3 incremental recovery on cart starts (3%)
  welcomeLiftPct: number;           // 0..1 — SMS-1 CVR lift on top of baseline (0.20)
  reviewCvr: number;                // 0..1 — SMS-4 review-submission CVR (0.20)
  reviewValuePerSubmission: number; // USD — value to brand per review submitted (UGC + ranking + SEO + direct)
  smsCostPerMessage: number;        // USD per SMS sent (Postscript + carrier + 10DLC amortized)
}

export interface SmsFlowBreakdown {
  orders: number;          // Recovered / driven orders / month
  grossRevenue: number;    // Gross revenue / month
  discountCost: number;    // Discount cost / month (only on flows that carry a code)
  netMargin: number;       // Net margin / month (after discount)
  sendCost: number;        // SMS send cost / month
  netRevenue: number;      // Net margin - send cost
  smsCount: number;        // SMS messages sent / month for this flow
}

export interface SmsWelcomeCartForecast {
  sms1: SmsFlowBreakdown;          // Welcome SMS
  sms2: SmsFlowBreakdown;          // Cart-Abandon Soft
  sms3: SmsFlowBreakdown;          // Cart-Abandon Escalation
  sms4: SmsFlowBreakdown;          // Post-Purchase Review Request
  totalOrders: number;             // Sum of orders across 4 flows
  totalGrossRevenue: number;
  totalDiscountCost: number;
  totalNetMargin: number;
  totalSendCost: number;
  totalNetRevenue: number;
  roiRatio: number;                // net_margin / total_send_cost
  revenuePerSms: number;           // gross_revenue / sms_sent
  netPerSms: number;               // net_revenue / sms_sent
  paybackPerDollar: number;        // gross_revenue / total_send_cost
  cartRecoveryCombinedPct: number; // (sms2.orders + sms3.orders) / cart_starts
  reviewsSubmitted: number;        // reviews/mo from SMS-4
  healthBand: string;
  healthBandShort:
    | "great"
    | "good"
    | "marginal"
    | "weak"
    | "negative"
    | "zero-cost";
}

export const SMS_WELCOME_CART_DEFAULTS: SmsWelcomeCartInputs = {
  smsOptinsPerMonth: 1000,
  baselineFirstPurchaseCvr: 0.03,
  cartStartsPerMonth: 2500,
  ordersPerMonth: 800,
  aov: 75,
  grossMargin: 0.7,
  discountFraction: 0.1,
  cartRecoveryRate1: 0.05,
  cartRecoveryRate2: 0.03,
  welcomeLiftPct: 0.2,
  reviewCvr: 0.2,
  reviewValuePerSubmission: 5, // $5 conservative value per submitted review (UGC + ranking + SEO uplift)
  smsCostPerMessage: 0.014,
};

function buildFlow(
  orders: number,
  aov: number,
  grossMargin: number,
  discountFraction: number,
  hasDiscount: boolean,
  smsCount: number,
  smsCostPerMessage: number,
  customValuePerOrder: number = 0,
): SmsFlowBreakdown {
  const grossRevenue = orders * aov;
  const discountCost = hasDiscount ? grossRevenue * discountFraction : 0;
  const margin = grossRevenue * grossMargin;
  const netMargin = margin - discountCost;
  const sendCost = smsCount * smsCostPerMessage;
  // For SMS-4 (review-request), the per-orders value is review-CVR * orders rather
  // than recovered orders, so add `customValuePerOrder` ($5/submission).
  const valueAdded = customValuePerOrder;
  const netRevenue = netMargin + valueAdded - sendCost;
  return {
    orders,
    grossRevenue,
    discountCost,
    netMargin,
    sendCost,
    netRevenue,
    smsCount,
  };
}

export function forecastSmsWelcomeCart(
  inputs: SmsWelcomeCartInputs,
): SmsWelcomeCartForecast {
  // SMS-1 Welcome: lift baseline CVR (e.g. 3% × 1.20 = 3.6%) — incremental orders
  // driven by the SMS = baseline orders × (welcomeLiftPct / (1 + welcomeLiftPct))
  // so at lift=20% incremental = baseline * 20/120 = 16.7% of the SM-opt-in base.
  const baselineOrders = inputs.smsOptinsPerMonth * inputs.baselineFirstPurchaseCvr;
  const sms1Orders =
    inputs.welcomeLiftPct > 0
      ? baselineOrders * (inputs.welcomeLiftPct / (1 + inputs.welcomeLiftPct))
      : 0;
  const sms1 = buildFlow(
    sms1Orders,
    inputs.aov,
    inputs.grossMargin,
    inputs.discountFraction,
    true,
    inputs.smsOptinsPerMonth,
    inputs.smsCostPerMessage,
  );

  // SMS-2 Cart-Abandon Soft: 1 SMS per cart-start (capped at SMS-opt-ins × cart-starts bucket,
  // but for clarity we treat cart-starts as the cohort, with SMS-opt-in rate baked into the
  // recovery rate). Send 1 SMS per cart-start.
  const sms2Orders = inputs.cartStartsPerMonth * inputs.cartRecoveryRate1;
  const sms2 = buildFlow(
    sms2Orders,
    inputs.aov,
    inputs.grossMargin,
    inputs.discountFraction,
    false,
    inputs.cartStartsPerMonth,
    inputs.smsCostPerMessage,
  );

  // SMS-3 Cart-Abandon Escalation: 1 SMS per cart-start that didn't convert from SMS-2.
  // Recovery rate is applied on the cart-start universe too (the SMS-3 2-5% benchmark).
  const sms3Orders = inputs.cartStartsPerMonth * inputs.cartRecoveryRate2;
  const sms3 = buildFlow(
    sms3Orders,
    inputs.aov,
    inputs.grossMargin,
    inputs.discountFraction,
    true,
    inputs.cartStartsPerMonth,
    inputs.smsCostPerMessage,
  );

  // SMS-4 Review Request: orders × reviewCvr = reviews submitted. Each review carries
  // `reviewValuePerSubmission` USD in UGC/SEO/ranking value (not a direct revenue line).
  const reviewsSubmitted = inputs.ordersPerMonth * inputs.reviewCvr;
  const sms4 = buildFlow(
    reviewsSubmitted,
    0, // AOV not relevant; no orders
    inputs.grossMargin,
    inputs.discountFraction,
    false,
    inputs.ordersPerMonth,
    inputs.smsCostPerMessage,
    reviewsSubmitted * inputs.reviewValuePerSubmission,
  );

  const totalOrders = sms1.orders + sms2.orders + sms3.orders + sms4.orders;
  const totalGrossRevenue =
    sms1.grossRevenue + sms2.grossRevenue + sms3.grossRevenue + sms4.grossRevenue;
  const totalDiscountCost = sms1.discountCost + sms3.discountCost;
  const totalNetMargin =
    sms1.netMargin +
    sms2.netMargin +
    sms3.netMargin +
    sms4.netMargin +
    reviewsSubmitted * inputs.reviewValuePerSubmission;
  const totalSendCost = sms1.sendCost + sms2.sendCost + sms3.sendCost + sms4.sendCost;
  const totalNetRevenue = totalNetMargin - totalSendCost;
  const totalSmsSent =
    sms1.smsCount + sms2.smsCount + sms3.smsCount + sms4.smsCount;

  const roiRatio =
    totalSendCost > 0
      ? totalNetMargin / totalSendCost
      : totalNetMargin > 0
        ? Infinity
        : -Infinity;

  const revenuePerSms = totalSmsSent > 0 ? totalNetMargin / totalSmsSent : 0;
  const netPerSms = totalSmsSent > 0 ? totalNetRevenue / totalSmsSent : 0;
  const paybackPerDollar =
    totalSendCost > 0 ? totalGrossRevenue / totalSendCost : Infinity;
  const cartRecoveryCombinedPct =
    inputs.cartStartsPerMonth > 0
      ? (sms2.orders + sms3.orders) / inputs.cartStartsPerMonth
      : 0;

  return {
    sms1,
    sms2,
    sms3,
    sms4,
    totalOrders,
    totalGrossRevenue,
    totalDiscountCost,
    totalNetMargin,
    totalSendCost,
    totalNetRevenue,
    roiRatio,
    revenuePerSms,
    netPerSms,
    paybackPerDollar,
    cartRecoveryCombinedPct,
    reviewsSubmitted,
    healthBand: healthBand(roiRatio),
    healthBandShort: healthBandShort(roiRatio),
  };
}

export function healthBand(roiRatio: number): string {
  if (!Number.isFinite(roiRatio)) {
    return roiRatio > 0
      ? "great (positive net, no send cost tracked)"
      : "weak (no send cost tracked, net <= 0)";
  }
  if (roiRatio >= 30) return "great (>=30:1, top-tier SMS flow stack)";
  if (roiRatio >= 10) return "good (10-30:1, healthy Postscript SMS flows)";
  if (roiRatio >= 3) return "marginal (3-10:1, raise opt-ins or review-value)";
  if (roiRatio > 0) return "weak (<3:1, investigate cart recovery + discount depth)";
  return "negative (cost > margin — drop discount or audit TCPA compliance)";
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
