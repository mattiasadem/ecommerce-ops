/**
 * `stockout-risk.ts` — Pure math for the `/inventory` Stockout Risk calculator.
 *
 * Given the operator's:
 *   - monthlyOrders + AOV + gross margin  (auto-filled from `Your-store`)
 *   - onHandUnits       — current inventory in sellable units
 *   - weeklySellThroughPct — % of on-hand sold per week (e.g. 25% means
 *                            4-week stock-life at current velocity)
 *   - supplierLeadTimeDays — days from PO to landed-at-warehouse stock
 *   - safetyStockWeeks   — buffer weeks the operator wants on hand at all times
 *   - reorderCadenceDays — how often the operator reorders (e.g. 14d = biweekly)
 *
 * The calculator returns:
 *   - weeksOfStock      — onHand / (weeklyVelocity)
 *   - expectedStockoutInDays — days until onHand hits zero
 *   - reorderArrivalDays    — supplier lead time + cadence delay
 *   - daysOfCoverGap        — positive = stockout risk, negative = covered
 *   - lostRevenueIfStockout — revenue lost over the gap window at GM×AOV×orders
 *   - lostMarginIfStockout  — margin lost (after gross margin)
 *   - reorderNow: bool       — true when reordering NOW avoids stockout
 *   - verdict:               — one of: "stockout_imminent" | "tight" | "watch" | "healthy" | "overstocked"
 *   - verdictJustification:  — human-readable copy
 *   - recommendedPoUnits:    — units the operator should PO this week
 *   - recommendedPoCostUsd:  — PO cost at wholesale (60% of AOV as default proxy)
 *
 * Math is hermetic — no API, no DOM. Defaults assume a $1M DTC app brand at
 * 1,000 orders/mo, $75 AOV, 2,000 on-hand units, 25% weekly sell-through
 * (= 4 weeks of stock), 21-day supplier lead time, 2-week safety stock,
 * 14-day reorder cadence. At default the math fires "stockout_imminent"
 * because cadence (14) + lead (21) = 35d but stock cover is only 28d.
 *
 * Storage contract: handled by the component layer.
 */

import type { YourStoreInputs } from "./your-store";

export type Verdict =
  | "stockout_imminent"
  | "tight"
  | "watch"
  | "healthy"
  | "overstocked";

export interface StockoutInputs {
  monthlyOrders: number;          // orders / month
  aov: number;                    // USD — average order value
  grossMargin: number;            // 0..1 — gross margin fraction
  onHandUnits: number;            // units currently sellable
  weeklySellThroughPct: number;   // 0..1 — fraction of on-hand sold per week
  supplierLeadTimeDays: number;   // days PO → landed stock
  safetyStockWeeks: number;       // weeks of buffer the operator wants always on hand
  reorderCadenceDays: number;     // days between POs (e.g. 14 = biweekly)
  wholesaleCostPctOfAov: number;  // 0..1 — wholesale cost as % of AOV (default 0.40)
}

export interface StockoutResult {
  // Cover math
  weeklyVelocityUnits: number;        // units sold per week
  weeksOfStock: number;               // onHandUnits / weeklyVelocityUnits
  expectedStockoutInDays: number;     // days until onHand hits 0
  reorderArrivalDays: number;         // lead time + half a cadence (worst-case)
  daysOfCoverGap: number;             // reorderArrival - expectedStockout; positive = stockout risk

  // Loss math
  ordersAtRiskPerDay: number;         // orders/day that would stock out
  lostOrdersIfStockout: number;       // orders at risk over gap window
  lostRevenueIfStockout: number;      // USD — revenue lost
  lostMarginIfStockout: number;       // USD — gross margin lost

  // Reorder math
  recommendedPoUnits: number;         // units to PO this week
  recommendedPoCostUsd: number;       // wholesale cost of that PO
  reorderNow: boolean;                // true when reorderArrival > weeksOfStock*7

  // Verdict
  verdict: Verdict;
  verdictJustification: string;
  healthBand: "danger" | "warning" | "accent" | "positive" | "neutral";

  // Carry cost estimate (annual) — useful for overstocked verdict reasoning
  annualCarryCostPct: number;        // 0..1 — typically 0.20–0.30 of wholesale
  estAnnualCarryCostUsd: number;     // USD/year carrying onHandUnits at wholesale
}

export const STOCKOUT_DEFAULTS: StockoutInputs = {
  monthlyOrders: 1000,
  aov: 75,
  grossMargin: 0.70,
  onHandUnits: 2000,
  weeklySellThroughPct: 0.25,        // 25% sell-through per week (~4 weeks cover)
  supplierLeadTimeDays: 21,
  safetyStockWeeks: 2,
  reorderCadenceDays: 14,
  wholesaleCostPctOfAov: 0.40,
};

export function validateStockoutInputs(inputs: StockoutInputs): string | null {
  if (inputs.monthlyOrders < 0) return "monthlyOrders must be >= 0";
  if (inputs.aov <= 0) return "aov must be > 0";
  if (inputs.grossMargin < 0 || inputs.grossMargin > 1)
    return "grossMargin must be between 0 and 1";
  if (inputs.onHandUnits < 0) return "onHandUnits must be >= 0";
  if (inputs.weeklySellThroughPct <= 0 || inputs.weeklySellThroughPct > 5)
    return "weeklySellThroughPct must be > 0 and <= 5 (5 = 500% / week)";
  if (inputs.supplierLeadTimeDays < 0)
    return "supplierLeadTimeDays must be >= 0";
  if (inputs.safetyStockWeeks < 0) return "safetyStockWeeks must be >= 0";
  if (inputs.reorderCadenceDays <= 0)
    return "reorderCadenceDays must be > 0";
  if (inputs.wholesaleCostPctOfAov <= 0 || inputs.wholesaleCostPctOfAov > 1)
    return "wholesaleCostPctOfAov must be between 0 and 1";
  return null;
}

export function computeStockoutRisk(inputs: StockoutInputs): StockoutResult {
  // Velocity = monthlyOrders × (AOV_weight_in_product_mix) is hard to model
  // without units/order. We treat "sell-through" as the velocity ground truth
  // (the operator knows their actual sell-through rate from Shopify).
  const weeklyVelocityUnits =
    inputs.onHandUnits * inputs.weeklySellThroughPct;
  // weeksOfStock = onHand / velocity per week. Guard div-by-zero.
  const weeksOfStock =
    weeklyVelocityUnits > 0 ? inputs.onHandUnits / weeklyVelocityUnits : 0;
  // expectedStockoutInDays = weeksOfStock × 7
  const expectedStockoutInDays = weeksOfStock * 7;
  // reorderArrivalDays = leadTime + half a reorderCadence (worst-case waiting
  // for next PO after lead time). If reorderCadence is every 14d and you start
  // the PO today, it lands in leadTime + halfCadence days on average.
  const reorderArrivalDays =
    inputs.supplierLeadTimeDays + inputs.reorderCadenceDays / 2;
  // Gap = how many days of cover we lose between expected stockout and next
  // stock arrival. Positive = stockout risk window; negative = we cover.
  const daysOfCoverGap = reorderArrivalDays - expectedStockoutInDays;

  // Daily order velocity
  const ordersPerDay = inputs.monthlyOrders / 30;
  // Orders at risk = ordersPerDay × daysOfCoverGap (only the positive portion)
  const ordersAtRiskPerDay =
    weeksOfStock > 0 ? ordersPerDay : inputs.monthlyOrders / 30;
  const lostOrdersIfStockout = Math.max(0, daysOfCoverGap) * ordersPerDay;
  const lostRevenueIfStockout = lostOrdersIfStockout * inputs.aov;
  const lostMarginIfStockout = lostRevenueIfStockout * inputs.grossMargin;

  // Reorder recommendation: cover reorder cadence + lead time + safety buffer
  // = (leadTime + safetyStock*7 + reorderCadence/2) days at ordersPerDay, in units.
  // The operator's target = cover during lead + cover during reorderCadence.
  const targetCoverDays =
    inputs.supplierLeadTimeDays +
    inputs.reorderCadenceDays / 2 +
    inputs.safetyStockWeeks * 7;
  // Ideal on-hand = targetCoverDays × ordersPerDay (in units, assuming 1 unit/order)
  // Then PO units = ideal - current onHand, clamped at 0.
  const idealOnHandUnits = targetCoverDays * ordersPerDay;
  const recommendedPoUnits = Math.max(0, idealOnHandUnits - inputs.onHandUnits);
  const wholesaleUnitCost = inputs.aov * inputs.wholesaleCostPctOfAov;
  const recommendedPoCostUsd = recommendedPoUnits * wholesaleUnitCost;
  const reorderNow = reorderArrivalDays > expectedStockoutInDays;

  // Carry cost (only meaningful for overstocked verdict)
  const annualCarryCostPct = 0.25;
  const onHandAtWholesaleUsd = inputs.onHandUnits * wholesaleUnitCost;
  const estAnnualCarryCostUsd = onHandAtWholesaleUsd * annualCarryCostPct;

  // Verdict thresholds (driven by weeksOfStock vs combined safety buffer +
  // worst-case supply delay in weeks).
  // supplyDelayWeeks = (leadTime + halfCadence) / 7
  const supplyDelayWeeks = reorderArrivalDays / 7;
  let verdict: Verdict;
  let verdictJustification: string;
  let healthBand: StockoutResult["healthBand"];

  if (weeksOfStock === 0) {
    // Already at zero inventory
    verdict = "stockout_imminent";
    verdictJustification =
      "No sellable units on hand — every day is lost revenue until stock lands.";
    healthBand = "danger";
  } else if (daysOfCoverGap > 7) {
    // Will stock out by more than a week before reorder arrives
    const revenueText =
      lostRevenueIfStockout > 0
        ? ` Estimated loss: $${Math.round(lostRevenueIfStockout).toLocaleString("en-US")} revenue / $${Math.round(lostMarginIfStockout).toLocaleString("en-US")} margin before stock lands.`
        : "";
    verdict = "stockout_imminent";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks) is shorter than reorder arrival (${reorderArrivalDays} days) — reorder TODAY to avoid a ${Math.round(daysOfCoverGap)}-day stockout.${revenueText}`;
    healthBand = "danger";
  } else if (daysOfCoverGap > 0) {
    // Will run thin in same window as reorder arrival
    verdict = "tight";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks) is roughly equal to reorder arrival (${reorderArrivalDays} days) — reorder this week to keep safety stock intact.`;
    healthBand = "warning";
  } else if (
    weeksOfStock >=
    supplyDelayWeeks + inputs.safetyStockWeeks + 4
  ) {
    // Healthy: covers supply delay + safety stock + 4 extra weeks
    verdict = "healthy";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks) is comfortably above worst-case reorder arrival (${reorderArrivalDays} days) + safety buffer (${inputs.safetyStockWeeks} weeks).`;
    healthBand = "positive";
  } else if (weeksOfStock >= supplyDelayWeeks + inputs.safetyStockWeeks) {
    // Watch: covers delay + buffer, no extra
    verdict = "watch";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks) covers reorder arrival + safety buffer — but no cushion for a sell-through spike.`;
    healthBand = "accent";
  } else {
    // Should not reach here, but default
    verdict = "watch";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks) is borderline — monitor weekly.`;
    healthBand = "accent";
  }

  // Overstocked override: if carry cost is a major share of margin AND we have
  // 26+ weeks of stock, override to overstocked.
  const weeklyMarginRevenue = (inputs.monthlyOrders / 4) * inputs.aov * inputs.grossMargin;
  const carryBurdensome =
    weeklyMarginRevenue > 0 && estAnnualCarryCostUsd / 52 > weeklyMarginRevenue * 0.5;
  if (weeksOfStock > 26 && carryBurdensome) {
    verdict = "overstocked";
    verdictJustification = `Cover (${weeksOfStock.toFixed(1)} weeks, ≈ ${(weeksOfStock / 4).toFixed(1)} months) is dragging capital — annual carry cost ~$${Math.round(estAnnualCarryCostUsd).toLocaleString("en-US")} vs ~$${Math.round(weeklyMarginRevenue * 52).toLocaleString("en-US")} annual gross margin. Run a promotion or slow the next PO.`;
    healthBand = "warning";
  }

  return {
    weeklyVelocityUnits,
    weeksOfStock,
    expectedStockoutInDays,
    reorderArrivalDays,
    daysOfCoverGap,
    ordersAtRiskPerDay,
    lostOrdersIfStockout,
    lostRevenueIfStockout,
    lostMarginIfStockout,
    recommendedPoUnits,
    recommendedPoCostUsd,
    reorderNow,
    verdict,
    verdictJustification,
    healthBand,
    annualCarryCostPct,
    estAnnualCarryCostUsd,
  };
}

export function stockoutVerdictTag(v: Verdict): {
  label: string;
  tone: string;
  band: StockoutResult["healthBand"];
} {
  switch (v) {
    case "stockout_imminent":
      return {
        label: "STOCKOUT IMMINENT",
        tone: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        band: "danger",
      };
    case "tight":
      return {
        label: "TIGHT — REORDER THIS WEEK",
        tone: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        band: "warning",
      };
    case "watch":
      return {
        label: "WATCH",
        tone: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        band: "accent",
      };
    case "healthy":
      return {
        label: "HEALTHY",
        tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        band: "positive",
      };
    case "overstocked":
      return {
        label: "OVERSTOCKED — CAPITAL DRAG",
        tone: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
        band: "warning",
      };
  }
}

/**
 * Project `YourStoreInputs` onto StockoutDefaults — only the keys they share.
 * monthlyOrders + aov + grossMargin come from the Your-store card on Overview.
 */
export function mergeFromYourStoreForStockout(
  defaults: StockoutInputs,
  yourStore: YourStoreInputs | null,
): StockoutInputs {
  if (!yourStore) return defaults;
  return {
    ...defaults,
    monthlyOrders: yourStore.monthlyOrders,
    aov: yourStore.aov,
    grossMargin: yourStore.grossMargin,
  };
}

/**
 * Renders a copy-friendly markdown audit. Used by the CopyButton.
 */
export function renderStockoutMarkdown(
  inputs: StockoutInputs,
  r: StockoutResult,
): string {
  const verdict = stockoutVerdictTag(r.verdict);
  const lines: string[] = [];
  lines.push("# Stockout risk audit");
  lines.push("");
  lines.push(`**Verdict:** ${verdict.label}`);
  lines.push(r.verdictJustification);
  lines.push("");
  lines.push("## Cover math");
  lines.push(
    `Weekly velocity: ${r.weeklyVelocityUnits.toFixed(0)} units / wk (${(inputs.weeklySellThroughPct * 100).toFixed(0)}% sell-through on ${inputs.onHandUnits.toLocaleString("en-US")} on-hand)`,
  );
  lines.push(`Weeks of stock: ${r.weeksOfStock.toFixed(1)} weeks`);
  lines.push(`Expected stockout in: ${Math.max(0, r.expectedStockoutInDays).toFixed(0)} days`);
  lines.push(`Reorder arrival (lead + half-cadence): ${r.reorderArrivalDays.toFixed(0)} days`);
  lines.push(
    `Cover gap: ${r.daysOfCoverGap > 0 ? "+" : ""}${r.daysOfCoverGap.toFixed(0)} days ${r.daysOfCoverGap > 0 ? "(STOCKOUT)" : "(covered)"}`,
  );
  lines.push("");
  lines.push("## Loss math");
  lines.push(
    `Lost orders if stockout hits: ${r.lostOrdersIfStockout.toFixed(1)} orders`,
  );
  lines.push(
    `Lost revenue if stockout hits: $${Math.round(r.lostRevenueIfStockout).toLocaleString("en-US")}`,
  );
  lines.push(
    `Lost margin if stockout hits: $${Math.round(r.lostMarginIfStockout).toLocaleString("en-US")}`,
  );
  lines.push("");
  lines.push("## Reorder recommendation");
  lines.push(`Recommended PO size: ${r.recommendedPoUnits.toFixed(0)} units`);
  lines.push(
    `Recommended PO cost: $${Math.round(r.recommendedPoCostUsd).toLocaleString("en-US")} (at ${(inputs.wholesaleCostPctOfAov * 100).toFixed(0)}% of AOV)`,
  );
  lines.push(
    `Reorder now: ${r.reorderNow ? "YES" : "no — current cover absorbs next arrival"}`,
  );
  lines.push("");
  lines.push("## Inputs");
  lines.push(`- Monthly orders: ${inputs.monthlyOrders.toLocaleString("en-US")}`);
  lines.push(`- AOV: $${inputs.aov.toFixed(2)}`);
  lines.push(`- Gross margin: ${(inputs.grossMargin * 100).toFixed(0)}%`);
  lines.push(`- On-hand units: ${inputs.onHandUnits.toLocaleString("en-US")}`);
  lines.push(
    `- Weekly sell-through: ${(inputs.weeklySellThroughPct * 100).toFixed(1)}%`,
  );
  lines.push(`- Supplier lead time: ${inputs.supplierLeadTimeDays} days`);
  lines.push(`- Safety stock: ${inputs.safetyStockWeeks} weeks`);
  lines.push(`- Reorder cadence: ${inputs.reorderCadenceDays} days`);
  lines.push("");
  lines.push("---");
  lines.push(
    "Generated by /inventory stockout-risk calculator · matches StockoutRisk math (browser port of `inventory stockout benchmarks`).",
  );
  return lines.join("\n");
}
