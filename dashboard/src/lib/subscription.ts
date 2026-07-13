/** Browser-side port of scripts/subscription_unit_economics.py. */

export type SubscriptionPath = "A" | "B" | "C";
export type SubscriptionCategory =
  | "default"
  | "consumables"
  | "luxury"
  | "sustainable"
  | "gen_z"
  | "b2b"
  | "fragile"
  | "apparel";
export type SubscriptionPlatform =
  | "recharge"
  | "skio"
  | "bold"
  | "stay_ai"
  | "appstle"
  | "seal"
  | "loop";

export interface SubscriptionInputs {
  usGmv: number;
  aov: number;
  monthlyOrders: number;
  consumablesRevenueSharePct: number;
  hasReplenishmentCadence: boolean;
  subscriberConversionBaselinePct: number;
  monthlyChurnBaselinePct: number;
  category: SubscriptionCategory;
  platformPreference: SubscriptionPlatform;
  hasSubscriberAttribution: boolean;
  operatorCapacityHoursPerWeek: number;
}

export interface SubscriptionRecommendation {
  path: SubscriptionPath;
  isDeferred: boolean;
  deferralReasons: string[];
  downgrades: string[];
  platforms: string[];
  defaultPlatformPick: string;
  justification: string;
  oneTimeCost: [number, number];
  recurringMonthlyCost: [number, number];
  year1Cost: [number, number];
  subscriptionRevenueSharePct: [number, number];
  year1SubscriptionRevenue: [number, number];
  ltvMultiplier: [number, number];
  year1SubscriberCount: [number, number];
  smartCancellationRecoveryPct: [number, number];
  dunningRecoveryPct: [number, number];
  winbackRecoveryPct: [number, number];
  canonicalRoi: [number, number];
  discountTierMatrix: Record<string, string>;
  buildSequence: string[];
  midpoint: {
    subscriptionRevenue: number;
    subscriberCount: number;
    mrr: number;
    year1Cost: number;
    grossRevenuePerDollar: number;
  };
}

export const SUBSCRIPTION_DEFAULTS: SubscriptionInputs = {
  usGmv: 3_000_000,
  aov: 45,
  monthlyOrders: 6667,
  consumablesRevenueSharePct: 70,
  hasReplenishmentCadence: true,
  subscriberConversionBaselinePct: 20,
  monthlyChurnBaselinePct: 6,
  category: "consumables",
  platformPreference: "recharge",
  hasSubscriberAttribution: true,
  operatorCapacityHoursPerWeek: 8,
};

const PATH_COSTS: Record<SubscriptionPath, [number, number, number, number]> = {
  A: [0, 500, 99, 149],
  B: [500, 2000, 499, 499],
  C: [2000, 10000, 1000, 5000],
};
const REVENUE_SHARE: Record<SubscriptionPath, [number, number]> = {
  A: [15, 30],
  B: [25, 50],
  C: [40, 70],
};
const LTV_MULTIPLIER: Record<SubscriptionPath, [number, number]> = {
  A: [1.5, 2.5],
  B: [2, 3],
  C: [2.5, 3.5],
};
const CONVERSION_RATE: Record<SubscriptionPath, [number, number]> = {
  A: [10, 20],
  B: [20, 35],
  C: [25, 40],
};
const SMART_CANCELLATION: Record<SubscriptionPath, [number, number]> = {
  A: [10, 20],
  B: [20, 35],
  C: [30, 45],
};
const DUNNING: Record<SubscriptionPath, [number, number]> = {
  A: [40, 55],
  B: [50, 70],
  C: [60, 80],
};
const WINBACK: Record<SubscriptionPath, [number, number]> = {
  A: [5, 12],
  B: [10, 20],
  C: [15, 25],
};
const CANONICAL_ROI: Record<SubscriptionPath, [number, number]> = {
  A: [8, 15],
  B: [3.2, 25],
  C: [7.5, 35],
};
const PATH_PLATFORMS: Record<SubscriptionPath, string[]> = {
  A: ["Recharge Starter ($99/mo) or Bold Starter ($49/mo)"],
  B: ["Recharge Plus ($499/mo) — default", "Skio Plus ($499/mo)"],
  C: ["Recharge Enterprise", "Skio Enterprise", "Seal Subscriptions", "Stay AI"],
};
const DEFAULT_PLATFORM: Record<SubscriptionPath, string> = {
  A: "Recharge Starter — default for fewer than 1,000 subscribers",
  B: "Recharge Plus — default for $500k–$10M GMV consumables brands",
  C: "Recharge Enterprise, Skio Enterprise, or Seal — for 10,000+ subscribers",
};

export const DISCOUNT_TIER_MATRIX: Record<string, string> = {
  "30-day": "5% off — vitamins, pet treats, supplements",
  "45-day": "10% off — cosmetics and skincare",
  "60-day": "15% off — personal care, oral care, household (default)",
  "90-day": "20% off — food, beverage, pet food",
  "120-day": "25% off — multi-packs and curated boxes",
};

const BUILD_SEQUENCE: Record<SubscriptionPath, string[]> = {
  A: [
    "Pick Recharge Starter or Bold Starter and verify the $100k GMV, 30% consumables-share, and 200-orders/month gates.",
    "Install a 10–15% subscribe-and-save widget on the 3–5 hero SKUs with a 30–120 day cadence.",
    "Enable the customer portal with cancel, pause, skip, and basic Recharge-to-Klaviyo dunning.",
    "Launch a three-message 30/60/90-day Klaviyo winback with a 15/20/25% ladder.",
    "Hold a two-month hero-SKU buffer and track FIFO/lot inventory manually.",
    "Review churn weekly; escalate when monthly churn exceeds 8%.",
  ],
  B: [
    "Pick Recharge Plus or Skio Plus and verify $500k+ GMV plus at least 1,000 potential subscribers.",
    "Install the subscribe-and-save widget on 3–5 hero SKUs using the cadence-based 5–25% discount matrix.",
    "Enable portal, smart cancellation, Recharge dunning, Klaviyo email, and Postscript SMS recovery.",
    "Launch pre-shipment reminders, replenishment cross-sell, native winback, and retargeting.",
    "Wire Triple Whale subscriber-cohort LTV and compare 30/60/90/180-day subscriber vs one-time LTV.",
    "Run churn alerts, Smile.io 2× subscription points, and a 4-hour/week optimization cadence.",
  ],
  C: [
    "Select Recharge Enterprise, Skio Enterprise, Seal, or Stay AI and assign a dedicated subscription owner.",
    "Install segmented subscribe-and-save offers across 5–10 hero SKUs and value tiers.",
    "Ship a full portal, six cancellation alternatives, Stripe Smart Retries, and custom dunning logic.",
    "Add AI cadence optimization, direct-mail winback, retargeting, and specialist recovery.",
    "Merge active, paused, and cancelled cohorts across platforms into Triple Whale 365-day LTV.",
    "Operate multi-3PL fulfillment and cross-platform churn/LTV monitoring with a dedicated team.",
  ],
};

const PATH_RANK: Record<SubscriptionPath, number> = { A: 0, B: 1, C: 2 };
const RANK_PATH: Record<number, SubscriptionPath> = { 0: "A", 1: "B", 2: "C" };

export function clampSubscriptionNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function validateSubscriptionInputs(inputs: SubscriptionInputs): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(inputs.usGmv) || inputs.usGmv < 0) errors.push("US GMV must be zero or greater.");
  if (!Number.isFinite(inputs.aov) || inputs.aov <= 0 || inputs.aov > 10_000) errors.push("AOV must be between $0.01 and $10,000.");
  if (!Number.isFinite(inputs.monthlyOrders) || inputs.monthlyOrders < 0) errors.push("Monthly orders must be zero or greater.");
  for (const [label, value] of [
    ["Consumables revenue share", inputs.consumablesRevenueSharePct],
    ["Subscriber conversion", inputs.subscriberConversionBaselinePct],
    ["Monthly churn", inputs.monthlyChurnBaselinePct],
  ] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`${label} must be between 0% and 100%.`);
  }
  if (!Number.isFinite(inputs.operatorCapacityHoursPerWeek) || inputs.operatorCapacityHoursPerWeek < 0) errors.push("Operator capacity must be zero or greater.");
  return errors;
}

function basePath(usGmv: number): SubscriptionPath {
  if (usGmv >= 10_000_000) return "C";
  if (usGmv >= 500_000) return "B";
  return "A";
}

export function recommendSubscriptionPath(inputs: SubscriptionInputs): SubscriptionRecommendation {
  const errors = validateSubscriptionInputs(inputs);
  if (errors.length) throw new Error(errors.join(" "));

  const deferralReasons: string[] = [];
  if (inputs.usGmv < 100_000) deferralReasons.push("US GMV is below the $100k subscription-program entry floor.");
  if (inputs.operatorCapacityHoursPerWeek < 2) deferralReasons.push("Operator capacity is below the 2 hr/week floor.");
  if (inputs.consumablesRevenueSharePct < 30) deferralReasons.push("Consumables revenue share is below the 30% fit floor.");
  if (inputs.monthlyOrders < 200) deferralReasons.push("Monthly orders are below the 200-order break-even floor.");
  if (!inputs.hasReplenishmentCadence) deferralReasons.push("No hero SKU has a natural 30–120 day replenishment cadence.");
  if (inputs.subscriberConversionBaselinePct < 5) deferralReasons.push("Subscriber conversion is below the 5% benchmark floor.");
  if (inputs.monthlyChurnBaselinePct > 15) deferralReasons.push("Monthly churn exceeds the 15% ceiling and breaks LTV math.");

  let path = basePath(inputs.usGmv);
  const downgrades: string[] = [];
  if (inputs.aov < 30) downgrades.push(`AOV $${inputs.aov.toFixed(0)} is below the $30 floor.`);
  if (!inputs.hasSubscriberAttribution) downgrades.push("Subscriber-cohort attribution is not wired.");
  for (const _ of downgrades) path = RANK_PATH[Math.max(0, PATH_RANK[path] - 1)];

  const [oneLow, oneHigh, recurringLow, recurringHigh] = PATH_COSTS[path];
  const share = REVENUE_SHARE[path];
  const consumableRevenue = inputs.usGmv * (inputs.consumablesRevenueSharePct / 100);
  const subscriptionRevenue: [number, number] = [
    consumableRevenue * (share[0] / 100),
    consumableRevenue * (share[1] / 100),
  ];
  const conversion = CONVERSION_RATE[path];
  const consumableOrders = inputs.monthlyOrders * (inputs.consumablesRevenueSharePct / 100);
  const subscriberCount: [number, number] = [
    Math.trunc(consumableOrders * (conversion[0] / 100)),
    Math.trunc(consumableOrders * (conversion[1] / 100)),
  ];
  const year1Cost: [number, number] = [oneLow + recurringLow * 12, oneHigh + recurringHigh * 12];
  const subscriptionRevenueMid = (subscriptionRevenue[0] + subscriptionRevenue[1]) / 2;
  const subscriberCountMid = Math.trunc(consumableOrders * (((conversion[0] + conversion[1]) / 2) / 100));
  const year1CostMid = (year1Cost[0] + year1Cost[1]) / 2;

  const justification = [
    inputs.usGmv < 100_000
      ? `US GMV ${fmtUsd(inputs.usGmv)} is below the entry floor; Path A is surfaced for audit tracking.`
      : `US GMV ${fmtUsd(inputs.usGmv)} lands in the Path ${basePath(inputs.usGmv)} tier.`,
    downgrades.length ? `${downgrades.length} downgrade(s) applied: ${downgrades.join(" ")}` : "All tier downgrade gates pass.",
    deferralReasons.length ? `Launch deferred: ${deferralReasons.join(" ")}` : "All launch-readiness gates pass.",
  ].join(" ");

  return {
    path,
    isDeferred: deferralReasons.length > 0,
    deferralReasons,
    downgrades,
    platforms: PATH_PLATFORMS[path],
    defaultPlatformPick: DEFAULT_PLATFORM[path],
    justification,
    oneTimeCost: [oneLow, oneHigh],
    recurringMonthlyCost: [recurringLow, recurringHigh],
    year1Cost,
    subscriptionRevenueSharePct: share,
    year1SubscriptionRevenue: subscriptionRevenue,
    ltvMultiplier: LTV_MULTIPLIER[path],
    year1SubscriberCount: subscriberCount,
    smartCancellationRecoveryPct: SMART_CANCELLATION[path],
    dunningRecoveryPct: DUNNING[path],
    winbackRecoveryPct: WINBACK[path],
    canonicalRoi: CANONICAL_ROI[path],
    discountTierMatrix: { ...DISCOUNT_TIER_MATRIX },
    buildSequence: [...BUILD_SEQUENCE[path]],
    midpoint: {
      subscriptionRevenue: subscriptionRevenueMid,
      subscriberCount: subscriberCountMid,
      mrr: subscriberCountMid * inputs.aov * (1 - 0.175),
      year1Cost: year1CostMid,
      grossRevenuePerDollar: year1CostMid > 0 ? subscriptionRevenueMid / year1CostMid : 0,
    },
  };
}

export function fmtUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function renderSubscriptionMarkdown(
  inputs: SubscriptionInputs,
  recommendation: SubscriptionRecommendation,
): string {
  const r = recommendation;
  return [
    `# Subscription Path ${r.path} recommendation`,
    "",
    `**Status:** ${r.isDeferred ? "Deferred until readiness gates pass" : "Ready to build"}`,
    `**Platform:** ${r.defaultPlatformPick}`,
    `**US GMV / AOV / orders:** ${fmtUsd(inputs.usGmv)} / ${fmtUsd(inputs.aov)} / ${inputs.monthlyOrders.toLocaleString()} monthly`,
    `**Year-1 cost:** ${fmtUsd(r.year1Cost[0])}–${fmtUsd(r.year1Cost[1])}`,
    `**Year-1 subscription revenue:** ${fmtUsd(r.year1SubscriptionRevenue[0])}–${fmtUsd(r.year1SubscriptionRevenue[1])}`,
    `**Subscriber count:** ${r.year1SubscriberCount[0].toLocaleString()}–${r.year1SubscriberCount[1].toLocaleString()}`,
    `**LTV multiplier:** ${r.ltvMultiplier[0].toFixed(1)}×–${r.ltvMultiplier[1].toFixed(1)}×`,
    `**Canonical Year-1 ROI:** ${r.canonicalRoi[0].toFixed(1)}:1–${r.canonicalRoi[1].toFixed(1)}:1`,
    "",
    "## Why this path",
    r.justification,
    "",
    "## 6-step build sequence",
    ...r.buildSequence.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");
}
