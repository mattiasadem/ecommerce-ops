/**
 * retention-projection.ts — Pure scoring engine for the interactive
 * retention projection calculator on `/retention`.
 *
 * Models the canonical Move #14 lifecycle-flow-library 4-tier build-out
 * + the per-tier lift in 12-month repeat purchase rate + the resulting
 * LTV uplift + Year-1 incremental net revenue + ROI per tier.
 *
 * The math mirrors the canonical research/05 §Lifecycle-marketing §5-pillar
 * framework + asset/05 §Retention-metrics-reference-card benchmarks:
 *   Tier 1 = Welcome + Cart-abandon + Sunset + Shipping-conf + Browse-abandon
 *            (5 flows, ~6 hr, +5 percentage-points to RPR over 6 months)
 *   Tier 2 = Tier 1 + Customer-winback + NPS-detractor + Birthday +
 *            Loyalty-tier-up + Loyalty-tier-down
 *            (10 flows, +8pp to RPR over 90 days)
 *   Tier 3 = Tier 2 + VIP-early-access + Post-purchase-cross-sell +
 *            Replenishment + Stock-back + Loyalty-points-expiry +
 *            Subscription-renewal
 *            (12 flows, +10pp to RPR over 90 days)
 *   Tier 4 = Tier 3 + Referral-activation + Anniversary + Account-never-purchased +
 *            Seasonal-gift-guide + Sunset-rescue
 *            (17 flows, +12pp to RPR over 90 days)
 *
 * Costs per tier mirror research/05: Tier 1 = Klaviyo + Postscript base = $300-$1,500/mo
 *                                          Tier 2 = Tier 1 + Smile.io $50-$500/mo
 *                                          Tier 3 = Tier 2 + Triple Whale $250-$1,000/mo
 *                                          Tier 4 = Tier 3 + advanced Klaviyo + Gorgias deflect
 *
 * Voice-driven RPR benchmark bands (per asset/05 §Metric 5):
 *   Default: 20-30% / Lux: 30-50% / Sustainable: 25-40% / Gen-Z: 15-25% / B2B: 60-90%
 */

export type Voice = "default" | "luxury" | "sustainable" | "gen_z" | "b2b";
export type Tier = 1 | 2 | 3 | 4;

export interface RetentionInputs {
  /** Monthly new customers acquired (in window). */
  monthlyOrders: number;
  /** Average order value in USD. */
  aov: number;
  /** Gross margin (0..1). */
  grossMargin: number;
  /** Current 12-month repeat purchase rate (0..1). */
  currentRpr: number;
  /** Optional: voice override for benchmark band. */
  voice: Voice;
}

export interface TierProjection {
  tier: Tier;
  label: string;
  /** RPR after this tier ships (probability-weighted: current + lift). */
  projectedRpr: number;
  /** Lift in pp on top of current RPR (probability-weighted). */
  rprLiftPp: number;
  /** 12-month LTV per customer at the projected RPR (revenue, USD). */
  ltv12mo: number;
  /** Lift in LTV per customer vs current. */
  ltvLiftPerCustomer: number;
  /** Annual incremental revenue (over the operator's whole customer base of 12 × monthlyOrders). */
  year1IncrementalRevenue: number;
  /** One-time setup + ongoing cost stack band for this tier. */
  costSetupLow: number;
  costSetupHigh: number;
  costRecurringMonthlyLow: number;
  costRecurringMonthlyHigh: number;
  /** Year-1 total cost = setup + 12 × recurring midpoint. */
  year1CostLow: number;
  year1CostHigh: number;
  /** Year-1 ROI band (revenue / cost). */
  year1RoiLow: number;
  year1RoiHigh: number;
  /** The 5 flows that make up this tier. */
  flows: string[];
  /** A 1-line "what ships in this tier" rationale. */
  rationale: string;
}

export interface RetentionProjection {
  inputs: RetentionInputs;
  /** Baseline 12-month LTV at the operator's current RPR. */
  baselineLtv12mo: number;
  /** Per-tier projections (4 tiers). */
  tiers: TierProjection[];
  /** Recommended next tier (smallest tier that lifts the operator into the
   *  "good" or "great" RPR band for their voice). */
  recommendedTier: Tier;
  /** Current RPR band classification (red-flag / below / median / good / great). */
  currentBand: BandClassification;
  /** Target RPR after recommended tier ships. */
  targetBand: BandClassification;
  /** Single-sentence headline summary. */
  headline: string;
}

export type BandClassification = "great" | "good" | "median" | "below" | "red_flag";

// ----- Voice-driven RPR benchmark bands ----------------------------------

export interface VoiceBand {
  voice: Voice;
  label: string;
  /** [below-red, median-low, median-high, top-quartile-high] */
  bandThresholds: readonly [number, number, number, number];
  rationale: string;
}

export const VOICE_BANDS: Record<Voice, VoiceBand> = {
  default: {
    voice: "default",
    label: "Default (US DTC apparel/beauty/home)",
    bandThresholds: [0.20, 0.30, 0.40, 0.50],
    rationale: "Default 2026 benchmarks per asset/05",
  },
  luxury: {
    voice: "luxury",
    label: "Luxury",
    bandThresholds: [0.30, 0.40, 0.50, 0.60],
    rationale: "Luxury buys less frequently, far higher loyalty",
  },
  sustainable: {
    voice: "sustainable",
    label: "Sustainable",
    bandThresholds: [0.25, 0.35, 0.45, 0.55],
    rationale: "Mission-driven loyalty lifts RPR",
  },
  gen_z: {
    voice: "gen_z",
    label: "Gen-Z",
    bandThresholds: [0.15, 0.22, 0.30, 0.40],
    rationale: "Lower AOV but high volume; RPR ceiling is lower",
  },
  b2b: {
    voice: "b2b",
    label: "B2B",
    bandThresholds: [0.60, 0.70, 0.80, 0.90],
    rationale: "B2B is contracted/replenishment-driven; RPR structurally higher",
  },
};

// ----- Tier definitions ---------------------------------------------------

interface TierSpec {
  tier: Tier;
  label: string;
  /** Probability-weighted RPR lift (in pp) over baseline. */
  rprLiftPpWeighted: number;
  /** Low end of the RPR lift band (in pp). */
  rprLiftPpLow: number;
  /** High end of the RPR lift band (in pp). */
  rprLiftPpHigh: number;
  /** One-time setup cost band. */
  setupLow: number;
  setupHigh: number;
  /** Recurring monthly cost band. */
  monthlyLow: number;
  monthlyHigh: number;
  /** The 5+ flows that ship in this tier. */
  flows: string[];
  /** Single-line rationale. */
  rationale: string;
}

export const TIER_SPECS: Record<Tier, TierSpec> = {
  1: {
    tier: 1,
    label: "Tier 1 — Foundation (5 flows, ~6 hr)",
    rprLiftPpWeighted: 0.05,
    rprLiftPpLow: 0.03,
    rprLiftPpHigh: 0.08,
    setupLow: 200,
    setupHigh: 800,
    monthlyLow: 300,
    monthlyHigh: 1500,
    flows: [
      "Welcome series (5 emails / 14 days)",
      "Abandoned cart (3 emails + 1 SMS)",
      "Shipping confirmation (operational, branded)",
      "Browse-abandon (1 email + 1 SMS)",
      "Sunset flow (90–180d no-engagement suppression)",
    ],
    rationale:
      "Cheapest retention lift available — these 5 flows reuse the Move #1 + #4 + #7 Klaviyo + Postscript wiring already live at most brands.",
  },
  2: {
    tier: 2,
    label: "Tier 2 — Winback + Loyalty (5 more flows, ~10 hr)",
    rprLiftPpWeighted: 0.08,
    rprLiftPpLow: 0.05,
    rprLiftPpHigh: 0.11,
    setupLow: 600,
    setupHigh: 2000,
    monthlyLow: 400,
    monthlyHigh: 2200,
    flows: [
      "Customer winback (90–180d no-purchase)",
      "NPS-detractor follow-up (Delighted webhook → Gorgias)",
      "Birthday (Klaviyo date-property)",
      "Loyalty tier-up (Smile.io webhook)",
      "Loyalty tier-down (Smile.io webhook)",
    ],
    rationale:
      "Adds the canonical second-order wins — moves Tier-1 customers up the loyalty ladder and rescues the 60-70% of acquired customers who never repurchase.",
  },
  3: {
    tier: 3,
    label: "Tier 3 — VIP + Cross-sell (3 more flows, ~14 hr)",
    rprLiftPpWeighted: 0.10,
    rprLiftPpLow: 0.07,
    rprLiftPpHigh: 0.14,
    setupLow: 1200,
    setupHigh: 4500,
    monthlyLow: 700,
    monthlyHigh: 3500,
    flows: [
      "VIP early-access (loyalty tier 3+)",
      "Post-purchase cross-sell (7-day post-purchase)",
      "Replenishment (90-day reorder prediction)",
    ],
    rationale:
      "Compounds the loyalty data — VIP and replenishment flows are the structural LTV-leverage points that justify a Recharge subscription module.",
  },
  4: {
    tier: 4,
    label: "Tier 4 — Full library (5 more flows, ~18 hr)",
    rprLiftPpWeighted: 0.12,
    rprLiftPpLow: 0.08,
    rprLiftPpHigh: 0.17,
    setupLow: 1800,
    setupHigh: 6500,
    monthlyLow: 1100,
    monthlyHigh: 4800,
    flows: [
      "Referral activation (loyalty points for friend-referral)",
      "Anniversary (1-year post-first-purchase)",
      "Account-never-purchased (Klaviyo + Recharge)",
      "Seasonal gift-guide (Q4 holiday bundle)",
      "Sunset-rescue (smart-segment winback before suppression)",
    ],
    rationale:
      "The full 17-flow library — closes the canonical Tier 1+2+3+4 gap (research/05 §TL;DR says Tier-1-only captures only 15-20% of total retention lift).",
  },
};

// ----- Core projection math ----------------------------------------------

/**
 * 12-month LTV per customer at a given RPR.
 *
 * Math: in a 12-month window, each customer makes either 1 purchase
 * (the "no repeat" case, probability 1 - RPR) or 2 purchases (the "repeat"
 * case, probability RPR). Average orders/customer/yr = 1 + RPR. Multiply
 * by AOV × gross-margin to get 12-month gross-profit LTV. The gross-profit
 * framing is the one operators use for CAC comparison (the question this
 * calculator answers is "how much can I pay for a customer?").
 */
export function ltv12moAtRpr(rpr: number, aov: number, grossMargin: number): number {
  const ordersPerCustomerPerYr = 1 + Math.max(0, Math.min(1, rpr));
  return ordersPerCustomerPerYr * aov * grossMargin;
}

/**
 * Classify an RPR into a 5-band status for the given voice.
 */
export function classifyRpr(rpr: number, voice: Voice): BandClassification {
  const [redBelow, medianLow, medianHigh, topHigh] = VOICE_BANDS[voice].bandThresholds;
  if (rpr < redBelow) return "red_flag";
  if (rpr < medianLow) return "below";
  if (rpr < medianHigh) return "median";
  if (rpr < topHigh) return "good";
  return "great";
}

const BAND_TONE_STYLES: Record<BandClassification, string> = {
  great: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  good: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  median: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  below: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  red_flag: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const BAND_LABEL: Record<BandClassification, string> = {
  great: "Great",
  good: "Good",
  median: "Median",
  below: "Below median",
  red_flag: "Red flag",
};

export function bandToneStyles(band: BandClassification): string {
  return BAND_TONE_STYLES[band];
}

export const RETENTION_DEFAULTS: RetentionInputs = {
  monthlyOrders: 1000,
  aov: 75,
  grossMargin: 0.70,
  currentRpr: 0.20,
  voice: "default",
};

export function projectRetention(inputs: RetentionInputs): RetentionProjection {
  const monthlyOrders = Math.max(0, inputs.monthlyOrders);
  const aov = Math.max(0, inputs.aov);
  const grossMargin = Math.max(0, Math.min(1, inputs.grossMargin));
  const rpr = Math.max(0, Math.min(1, inputs.currentRpr));

  const baselineLtv12mo = ltv12moAtRpr(rpr, aov, grossMargin);

  // Customer base for the year: assume operator acquires `monthlyOrders`
  // customers/month → 12 * monthlyOrders for the annual math. This matches
  // the canonical research/05 §Year-1-revenue math.
  const annualCustomers = monthlyOrders * 12;

  const tiers: TierProjection[] = ([1, 2, 3, 4] as Tier[]).map((tierNum) => {
    const spec = TIER_SPECS[tierNum];
    const projectedRpr = Math.min(1, rpr + spec.rprLiftPpWeighted);
    const projLtv = ltv12moAtRpr(projectedRpr, aov, grossMargin);
    const ltvLiftPerCustomer = projLtv - baselineLtv12mo;
    // Year-1 incremental revenue = % of the base that moves to the projected
    // RPR (probability-weighted across all customers) — full-year run-rate,
    // since by the time the tier is fully ramped the next-year base will be
    // a fresh acquisition cohort. The operator's existing cohort that is now
    // at the projected RPR delivers the cumulative lift.
    const year1IncrementalRevenue = ltvLiftPerCustomer * annualCustomers;
    const year1CostLow = spec.setupLow + 12 * spec.monthlyLow;
    const year1CostHigh = spec.setupHigh + 12 * spec.monthlyHigh;
    const year1RoiLow =
      year1CostLow > 0 ? year1IncrementalRevenue / year1CostHigh : Infinity;
    const year1RoiHigh =
      year1CostHigh > 0 ? year1IncrementalRevenue / year1CostLow : Infinity;
    return {
      tier: spec.tier,
      label: spec.label,
      projectedRpr,
      rprLiftPp: spec.rprLiftPpWeighted,
      ltv12mo: projLtv,
      ltvLiftPerCustomer,
      year1IncrementalRevenue,
      costSetupLow: spec.setupLow,
      costSetupHigh: spec.setupHigh,
      costRecurringMonthlyLow: spec.monthlyLow,
      costRecurringMonthlyHigh: spec.monthlyHigh,
      year1CostLow,
      year1CostHigh,
      year1RoiLow,
      year1RoiHigh,
      flows: spec.flows,
      rationale: spec.rationale,
    };
  });

  // Recommend the smallest tier that lifts the operator into "good" or
  // "great". If they're already there, recommend Tier 1 anyway as the
  // "lock it in with a built library" move.
  const targetBand = classifyRpr(
    Math.min(1, rpr + TIER_SPECS[4].rprLiftPpWeighted),
    inputs.voice,
  );
  const currentBand = classifyRpr(rpr, inputs.voice);

  let recommendedTier: Tier = 1;
  for (const t of [1, 2, 3, 4] as Tier[]) {
    const projectedAfter = rpr + TIER_SPECS[t].rprLiftPpWeighted;
    const cls = classifyRpr(projectedAfter, inputs.voice);
    if (cls === "good" || cls === "great") {
      recommendedTier = t;
      break;
    }
  }
  // If the operator is already in great/good, the smallest tier is still
  // recommended as a defensive measure (to ensure the flows are built).
  if (currentBand === "great" || currentBand === "good") {
    recommendedTier = Math.min(recommendedTier, 1) as Tier;
  }

  const headline = buildHeadline(inputs, currentBand, recommendedTier);

  return {
    inputs: { ...inputs, monthlyOrders, aov, grossMargin, currentRpr: rpr },
    baselineLtv12mo,
    tiers,
    recommendedTier,
    currentBand,
    targetBand,
    headline,
  };
}

function buildHeadline(
  inputs: RetentionInputs,
  currentBand: BandClassification,
  recommendedTier: Tier,
): string {
  const band = BAND_LABEL[currentBand];
  const tierPct = Math.round(TIER_SPECS[recommendedTier].rprLiftPpWeighted * 100);
  const nextTier = TIER_SPECS[recommendedTier].label.split("—")[1]?.trim().split("(")[0]?.trim();
  return `Current 12-month RPR is ${(inputs.currentRpr * 100).toFixed(0)}% — ${band.toLowerCase()} for ${
    VOICE_BANDS[inputs.voice].label
  } voice. Tier ${recommendedTier} (${
    nextTier ?? TIER_SPECS[recommendedTier].label
  }) lifts RPR by ~${tierPct}pp with the canonical research/05 4-tier build sequence.`;
}

// ----- Markdown report ---------------------------------------------------

export function renderRetentionMarkdown(p: RetentionProjection): string {
  const lines: string[] = [];
  lines.push(`# Retention projection — ${VOICE_BANDS[p.inputs.voice].label}`);
  lines.push("");
  lines.push(p.headline);
  lines.push("");
  lines.push(`**Inputs:** ${p.inputs.monthlyOrders.toLocaleString()} monthly orders · $${p.inputs.aov.toFixed(2)} AOV · ${(p.inputs.grossMargin * 100).toFixed(0)}% gross margin · ${(p.inputs.currentRpr * 100).toFixed(1)}% 12-month repeat purchase rate.`);
  lines.push("");
  lines.push(`**Baseline 12-month LTV per customer:** $${p.baselineLtv12mo.toFixed(2)}`);
  lines.push(`**Current band:** ${BAND_LABEL[p.currentBand]}`);
  lines.push(`**Recommended tier:** Tier ${p.recommendedTier} — ${TIER_SPECS[p.recommendedTier].label.split("—")[1]?.trim() ?? ""}`);
  lines.push("");
  lines.push("## Tier-by-tier projections");
  for (const t of p.tiers) {
    lines.push("");
    lines.push(`### ${t.label}`);
    lines.push(`- **Projected RPR:** ${(t.projectedRpr * 100).toFixed(1)}% (+${(t.rprLiftPp * 100).toFixed(0)}pp)`);
    lines.push(`- **12-month LTV per customer:** $${t.ltv12mo.toFixed(2)} (+$${t.ltvLiftPerCustomer.toFixed(2)} vs baseline)`);
    lines.push(`- **Year-1 incremental revenue:** $${Math.round(t.year1IncrementalRevenue).toLocaleString()}`);
    lines.push(`- **Cost stack:** $${t.costSetupLow.toLocaleString()}-$${t.costSetupHigh.toLocaleString()} setup + $${t.costRecurringMonthlyLow.toLocaleString()}-$${t.costRecurringMonthlyHigh.toLocaleString()}/mo recurring = $${t.year1CostLow.toLocaleString()}-$${t.year1CostHigh.toLocaleString()} Year-1 total`);
    lines.push(`- **Year-1 ROI band:** ${t.year1RoiLow.toFixed(1).replace(/\.0$/, "")}× - ${t.year1RoiHigh >= 100 ? `${Math.round(t.year1RoiHigh).toLocaleString()}×` : `${t.year1RoiHigh.toFixed(1).replace(/\.0$/, "")}×`}`);
    lines.push(`- **Flows:**`);
    for (const flow of t.flows) {
      lines.push(`  - ${flow}`);
    }
    lines.push(`- **Why this tier:** ${t.rationale}`);
  }
  lines.push("");
  lines.push("## Companion artifacts");
  lines.push("- research/05-lifecycle-marketing.md — the canonical 4-tier library");
  lines.push("- playbooks/12-lifecycle-flow-library.md — operator-build walkthrough");
  lines.push("- assets/05-retention-metrics.md — 12-metric retention reference card");
  lines.push("- scripts/abandoned_cart_roi.py + welcome_series_roi.py — sibling ROI scripts (already shipped as React calculators)");
  return lines.join("\n");
}
