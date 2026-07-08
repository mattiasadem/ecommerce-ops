/**
 * AI Ad-Creative ROI math — direct TypeScript port of
 * `/scripts/ai_ad_creative_roi.py`.
 *
 * Used by the interactive `<AiAdCreativeROICalculator />` component on the
 * `/playbooks` page (Move #10 — AI ad-creative iteration). The math,
 * defaults, and health-band thresholds are kept byte-identical to the
 * Python CLI so an operator can sanity-check the same numbers in the
 * browser and the terminal without drift.
 */

export interface AiAdCreativeInputs {
  monthlyAdSpend: number;           // USD — total paid-ad spend / month
  baselineRoas: number;             // x — current ROAS (e.g. 2.5 = $2.50 revenue per $1 spend)
  expectedRoasLiftPct: number;      // 0..1 — expected ROAS lift (0.20 = +20%)
  aiToolCostMonthly: number;        // USD — single AI tool cost / month
  aiToolsCount: number;             // 1..n — number of paid tools in the stack
  creativeVariantsPerWeek: number;  // variants / week produced by AI tools
  operatorHoursPerWeek: number;     // hours / week spent curating AI outputs
  operatorHourlyCost: number;       // USD/hour fully-loaded operator cost
  attributionTool: boolean;         // Triple Whale / Polar installed (measurement confidence)
}

export interface AiAdCreativeForecast {
  baselineRevenueMonthly: number;   // ad_spend * baseline_roas
  liftRevenueMonthly: number;       // baseline_revenue * lift_pct
  postRoas: number;                 // baseline_roas * (1 + lift_pct)
  aiToolCostMonthly: number;        // ai_tool_cost * ai_tools_count
  operatorCostMonthly: number;      // operator_hours_per_week * WEEKS_PER_MONTH * operator_hourly_cost
  totalCostMonthly: number;         // ai_tool_cost + operator_cost
  netRevenueMonthly: number;        // lift_revenue - total_cost
  netPerDollarTool: number;         // net_revenue / ai_tool_cost (Infinity if no tool cost)
  variantsPerMonth: number;         // variants_per_week * WEEKS_PER_MONTH
  costPerVariant: number;           // total_cost / variants_per_month
  revenuePerVariant: number;        // lift_revenue / variants_per_month
  roasLiftPaybackDays: number;      // days of lift_revenue to cover ai_tool_cost
  healthBand: string;
}

// 52 weeks per year / 12 months = 4.333... weeks per month.
const WEEKS_PER_MONTH = 52.0 / 12.0;

export const AI_AD_CREATIVE_DEFAULTS: AiAdCreativeInputs = {
  monthlyAdSpend: 5000,
  baselineRoas: 2.5,
  expectedRoasLiftPct: 0.20,
  aiToolCostMonthly: 149,
  aiToolsCount: 1,
  creativeVariantsPerWeek: 10,
  operatorHoursPerWeek: 2,
  operatorHourlyCost: 50,
  attributionTool: true,
};

export function forecastAiAdCreative(inputs: AiAdCreativeInputs): AiAdCreativeForecast {
  const baselineRevenue = inputs.monthlyAdSpend * inputs.baselineRoas;
  const liftRevenue = baselineRevenue * inputs.expectedRoasLiftPct;
  const postRoas = inputs.baselineRoas * (1.0 + inputs.expectedRoasLiftPct);

  const aiToolCost = inputs.aiToolCostMonthly * inputs.aiToolsCount;
  const operatorCost =
    inputs.operatorHoursPerWeek * WEEKS_PER_MONTH * inputs.operatorHourlyCost;
  const totalCost = aiToolCost + operatorCost;
  const netRevenue = liftRevenue - totalCost;

  let netPerDollarTool: number;
  if (aiToolCost > 0) {
    netPerDollarTool = netRevenue / aiToolCost;
  } else {
    netPerDollarTool = netRevenue > 0 ? Infinity : -Infinity;
  }

  const variantsPerMonth = inputs.creativeVariantsPerWeek * WEEKS_PER_MONTH;
  let costPerVariant: number;
  let revenuePerVariant: number;
  if (variantsPerMonth > 0) {
    costPerVariant = totalCost / variantsPerMonth;
    revenuePerVariant = liftRevenue / variantsPerMonth;
  } else {
    costPerVariant = 0;
    revenuePerVariant = 0;
  }

  let paybackDays: number;
  if (liftRevenue > 0 && aiToolCost > 0) {
    paybackDays = (aiToolCost / liftRevenue) * 30.0;
  } else {
    paybackDays = 0;
  }

  return {
    baselineRevenueMonthly: baselineRevenue,
    liftRevenueMonthly: liftRevenue,
    postRoas: postRoas,
    aiToolCostMonthly: aiToolCost,
    operatorCostMonthly: operatorCost,
    totalCostMonthly: totalCost,
    netRevenueMonthly: netRevenue,
    netPerDollarTool,
    variantsPerMonth,
    costPerVariant,
    revenuePerVariant,
    roasLiftPaybackDays: paybackDays,
    healthBand: computeHealthBand(netPerDollarTool, netRevenue, aiToolCost),
  };
}

function computeHealthBand(
  netPerDollarTool: number,
  netRevenue: number,
  aiToolCost: number,
): string {
  if (aiToolCost === 0) {
    return netRevenue > 0
      ? "great (positive net, no AI tool cost tracked)"
      : "weak (no AI tool cost tracked, net <= 0)";
  }
  if (!Number.isFinite(netPerDollarTool)) {
    return netPerDollarTool > 0
      ? "great (no AI tool cost tracked)"
      : "negative (no AI tool cost tracked)";
  }
  if (netPerDollarTool >= 10) {
    return "great (>=10:1 net per $1 AI tool cost, top-tier creative iteration)";
  }
  if (netPerDollarTool >= 3) {
    return "good (3-10:1, healthy AI creative ROI)";
  }
  if (netPerDollarTool >= 1) {
    return "marginal (1-3:1, tune tool stack or focus operator hours on top performers)";
  }
  if (netPerDollarTool > 0) {
    return "weak (<1:1, AI tool cost exceeds net lift — defer or downgrade tool)";
  }
  return "negative (net lift < 0 — increase ad spend, lift pct, or downgrade tool)";
}

/**
 * Map our 5-tier health band into a UI intent that drives ring-color +
 * accent-color decisions (matches the welcome-series / abandoned-cart /
 * post-purchase pattern).
 */
export type HealthBandIntent =
  | "great"
  | "good"
  | "marginal"
  | "weak"
  | "negative"
  | "zero-cost";

export function aiAdCreativeHealthBandShort(band: string): HealthBandIntent {
  if (band.startsWith("great")) return "great";
  if (band.startsWith("good")) return "good";
  if (band.startsWith("marginal")) return "marginal";
  if (band.startsWith("weak")) return "weak";
  return "negative";
}

/**
 * Pad the AI tool cost up so it never divides by zero in the displayed
 * `net per $1 tool cost` ratio. Mirrors the Python CLI's "zero-cost →
 * infinite ratio" handling.
 */
export function formatNetPerDollarTool(value: number): string {
  if (value === Infinity) return "∞ (no AI tool cost tracked)";
  if (value === -Infinity) return "−∞ (no AI tool cost tracked)";
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}×`;
}
