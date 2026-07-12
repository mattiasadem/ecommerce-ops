/**
 * International-expansion Path A / B / C / C+ scorer — direct TypeScript port of
 * `/scripts/international_market_fit.py`.
 *
 * Companion to:
 * - /research/04-international-expansion.md (5-pillar framework + 4 GMV-tier paths)
 * - /playbooks/11-international-rollout.md (4-phase cross-border launch)
 * - /assets/13-international-pricing-card.md (7-market x 5-voice price card)
 *
 * Scoring rule (mirrors research/04 + playbook 11):
 *   - US GMV < $1M                -> Path A (CA only) — defer
 *   - US GMV $1M-$10M             -> Path B (CA + UK + EU + AU) — DEFAULT
 *   - US GMV $10M-$50M            -> Path C (all 7 markets)
 *   - US GMV $50M+                -> Path C+ (Path C + in-region 3PL)
 *   - US contribution margin <30% -> downgrade one tier (playbook 11 Prereq #6)
 *   - supply_chain_complexity = 3 -> downgrade one tier (US-only packaging)
 *   - operator_capacity <4 hr/wk  -> downgrade one tier (playbook 11 Prereq #8)
 */

export type PathName = "A" | "B" | "C" | "C+";
export type CategoryFit = "high" | "medium" | "low";

export type Category =
  | "apparel"
  | "beauty"
  | "home_goods"
  | "electronics"
  | "jewelry"
  | "pet"
  | "food"
  | "supplements"
  | "cbd"
  | "alcohol"
  | "firearms"
  | "medical_devices"
  | "other";

export type SupplyChainComplexity = 1 | 2 | 3;

export interface BrandInternationalInputs {
  usGmv: number;
  category: Category;
  usAov: number;
  usContributionMarginPct: number;
  supplyChainComplexity: SupplyChainComplexity;
  operatorCapacityHoursPerWeek: number;
}

export interface PathRecommendation {
  path: PathName;
  markets: string[];
  justification: string;
  costOneTimeLow: number;
  costOneTimeHigh: number;
  costRecurringLow: number;
  costRecurringHigh: number;
  expectedLiftLowPct: number;
  expectedLiftHighPct: number;
  year1RoiLow: number;
  year1RoiHigh: number;
  year1IncrementalRevenueLow: number;
  year1IncrementalRevenueHigh: number;
  year1CostLow: number;
  year1CostHigh: number;
  perMarketRevenue: Record<string, number>;
  buildSequence: string[];
}

// ----- Category classification -------------------------------------------

export const CATEGORY_FIT: Record<Category, CategoryFit> = {
  apparel: "high",
  beauty: "high",
  home_goods: "high",
  electronics: "medium",
  jewelry: "medium",
  pet: "medium",
  food: "low",
  supplements: "low",
  cbd: "low",
  alcohol: "low",
  firearms: "low",
  medical_devices: "low",
  other: "medium",
};

export function classifyCategory(category: Category): CategoryFit {
  return CATEGORY_FIT[category] ?? "medium";
}

// ----- Path band thresholds ----------------------------------------------

export const PATH_B_FLOOR = 1_000_000;
export const PATH_C_FLOOR = 10_000_000;
export const PATH_C_PLUS_FLOOR = 50_000_000;

// Path costs (USD): [one_time_low, one_time_high, recurring_low, recurring_high]
export const PATH_COSTS: Record<PathName, readonly [number, number, number, number]> = {
  A: [500, 2_000, 50, 200],
  B: [2_500, 7_500, 600, 1_200],
  C: [15_000, 30_000, 1_500, 2_500],
  "C+": [25_000, 100_000, 2_000, 8_000],
};

// Path lift bands (% of US base GMV, Year-1).
export const PATH_LIFT: Record<PathName, readonly [number, number]> = {
  A: [5, 15],
  B: [30, 80],
  C: [50, 150],
  "C+": [75, 200],
};

// Path Year-1 ROI bands.
export const PATH_ROI: Record<PathName, readonly [number, number]> = {
  A: [15, 40],
  B: [20, 60],
  C: [30, 100],
  "C+": [40, 120],
};

export const PATH_MARKETS: Record<PathName, readonly string[]> = {
  A: ["CA"],
  B: ["CA", "UK", "EU", "AU"],
  C: ["CA", "UK", "EU", "AU", "JP", "DACH", "Nordics"],
  "C+": ["CA", "UK", "EU", "AU", "JP", "DACH", "Nordics"],
};

// Path rank for downgrade logic.
export const PATH_RANK: Record<PathName, number> = {
  A: 0,
  B: 1,
  C: 2,
  "C+": 3,
};

// Margin + supply-chain + capacity gates.
export const MARGIN_GATE_PCT = 30;
export const CAPACITY_GATE_HR_WK = 4;

// Per-market lift share within a path.
export const PER_MARKET_LIFT_SHARE: Record<PathName, Record<string, number>> = {
  A: { CA: 1.0 },
  B: { CA: 0.35, UK: 0.30, EU: 0.25, AU: 0.10 },
  C: { CA: 0.20, UK: 0.18, EU: 0.16, AU: 0.10, JP: 0.14, DACH: 0.12, Nordics: 0.10 },
  "C+": {
    CA: 0.18,
    UK: 0.16,
    EU: 0.15,
    AU: 0.10,
    JP: 0.16,
    DACH: 0.13,
    Nordics: 0.12,
  },
};

// ----- Core scoring rule -------------------------------------------------

function tierForGmv(usGmv: number): PathName {
  if (usGmv >= PATH_C_PLUS_FLOOR) return "C+";
  if (usGmv >= PATH_C_FLOOR) return "C";
  if (usGmv >= PATH_B_FLOOR) return "B";
  return "A";
}

function tierCeiling(path: PathName): number {
  if (path === "A") return PATH_B_FLOOR;
  if (path === "B") return PATH_C_FLOOR;
  if (path === "C") return PATH_C_PLUS_FLOOR;
  return Infinity;
}

function rankToPath(rank: number): PathName {
  if (rank >= PATH_RANK["C+"]) return "C+";
  if (rank >= PATH_RANK["C"]) return "C";
  if (rank >= PATH_RANK["B"]) return "B";
  return "A";
}

export function recommendPath(inputs: BrandInternationalInputs): PathRecommendation {
  const justificationParts: string[] = [];

  // Path A as deferral when below the $1M floor.
  let path: PathName;
  if (inputs.usGmv < PATH_B_FLOOR) {
    path = "A";
    justificationParts.push(
      `US GMV $${inputs.usGmv.toLocaleString()} is below the $${PATH_B_FLOOR.toLocaleString()} floor; international expansion is deferred until US GMV exceeds $1M (per playbook 11 Prerequisites).`,
    );
  } else {
    path = tierForGmv(inputs.usGmv);
    const ceiling = tierCeiling(path);
    const ceilingStr =
      ceiling === Infinity ? "$50M+" : `$${ceiling.toLocaleString()}`;
    justificationParts.push(
      `US GMV $${inputs.usGmv.toLocaleString()} lands in the ${path} tier ($${PATH_B_FLOOR.toLocaleString()}-${ceilingStr}).`,
    );
  }

  // Apply downgrade gates.
  const downgrades: string[] = [];
  if (inputs.usContributionMarginPct < MARGIN_GATE_PCT) {
    downgrades.push(
      `US contribution margin ${inputs.usContributionMarginPct.toFixed(0)}% < ${MARGIN_GATE_PCT}% gate (playbook 11 Prerequisite #6)`,
    );
  }
  if (inputs.supplyChainComplexity === 3) {
    downgrades.push(
      "supply chain complexity = 3 (heavy/bulky with US-only packaging); playbook 11 Gate A flags in-region 3PL as required",
    );
  }
  if (inputs.operatorCapacityHoursPerWeek < CAPACITY_GATE_HR_WK) {
    downgrades.push(
      `operator capacity ${inputs.operatorCapacityHoursPerWeek} hr/wk < ${CAPACITY_GATE_HR_WK} hr/wk floor (playbook 11 Prerequisite #8)`,
    );
  }
  for (let i = 0; i < downgrades.length; i++) {
    path = rankToPath(PATH_RANK[path] - 1);
  }
  if (downgrades.length > 0) {
    justificationParts.push(
      `Downgraded from base tier by ${downgrades.length} gate(s): ${downgrades.join("; ")}. Final path = ${path}.`,
    );
  } else {
    justificationParts.push("All gates pass; no downgrade applied.");
  }

  const [costOneTimeLow, costOneTimeHigh, costRecurringLow, costRecurringHigh] =
    PATH_COSTS[path];
  const [liftLow, liftHigh] = PATH_LIFT[path];
  const [roiLow, roiHigh] = PATH_ROI[path];
  const year1IncrementalRevenueLow = inputs.usGmv * (liftLow / 100);
  const year1IncrementalRevenueHigh = inputs.usGmv * (liftHigh / 100);
  const year1CostLow = costOneTimeLow + costRecurringLow;
  const year1CostHigh = costOneTimeHigh + costRecurringHigh;

  // Per-market revenue projection.
  const midpointLiftPct = (liftLow + liftHigh) / 2;
  const totalInternationalRevenue = inputs.usGmv * (midpointLiftPct / 100);
  const shares = PER_MARKET_LIFT_SHARE[path];
  const perMarketRevenue: Record<string, number> = {};
  for (const [market, share] of Object.entries(shares)) {
    perMarketRevenue[market] = totalInternationalRevenue * share;
  }

  return {
    path,
    markets: [...PATH_MARKETS[path]],
    justification: justificationParts.join(" "),
    costOneTimeLow,
    costOneTimeHigh,
    costRecurringLow,
    costRecurringHigh,
    expectedLiftLowPct: liftLow,
    expectedLiftHighPct: liftHigh,
    year1RoiLow: roiLow,
    year1RoiHigh: roiHigh,
    year1IncrementalRevenueLow,
    year1IncrementalRevenueHigh,
    year1CostLow,
    year1CostHigh,
    perMarketRevenue,
    buildSequence: [...BUILD_SEQUENCE_TEMPLATES[path]],
  };
}

// ----- Build-sequence recipe --------------------------------------------

export const BUILD_SEQUENCE_TEMPLATES: Record<PathName, readonly string[]> = {
  A: [
    "Step 1 (30 min) — Pick path + markets: Path A = CA only. Verify US-baseline AOV + per-voice first-order-discount policy from Asset 02.",
    "Step 2 (1 hr) — Activate Shopify Markets for CA: pricing rules + CAD display + per-market voice-variant PDP copy.",
    "Step 3 (45 min) — Wire USMCA duty-free DDP for CA (<= $40 USD tariff exemption covers most apparel + home goods + beauty).",
    "Step 4 (1 hr) — Set per-market free-shipping threshold (CA $99 default; raise to $129 for heavier categories).",
    "Step 5 (skip for Path A) — Path B/C only: pre-stage JP + DACH + Nordics rows as drafts in Markets -> Drafts.",
    "Step 6 (45 min, ongoing) — Run per-market contribution-margin calculator (Asset 13) + verify the 5 verification gates pass.",
  ],
  B: [
    "Step 1 (30 min) — Pick path + markets: Path B = CA + UK + EU + AU. Verify US contribution margin >= 30% per Prerequisite #6.",
    "Step 2 (1 hr) — Activate Shopify Markets for CA + UK + EU-DE + EU-FR + AU: per-market pricing + currency display + per-market voice-variant PDP copy.",
    "Step 3 (45 min) — Wire DDP for IOSS (EU <= EUR 150) + UK VAT MOSS (<= GBP 135) + AU GST (register at AUD 75k threshold).",
    "Step 4 (1 hr) — Set per-market free-shipping thresholds: CA $99 / UK GBP 75 / EU EUR 89 / AU $149. Wire Klarna + AfterPay for DACH + AU.",
    "Step 5 (30 min, Path C pre-stage) — Pre-stage JP + DACH-AT + Nordics-S/E rows as drafts in Markets -> Drafts.",
    "Step 6 (45 min, ongoing) — Run per-market contribution-margin calculator + verify the 5 verification gates from Asset 13.",
  ],
  C: [
    "Step 1 (30 min) — Pick path + markets: Path C = all 7 markets with in-region 3PL distribution (US + EU + AU + JP).",
    "Step 2 (2 hr) — Activate Shopify Markets for all 7 markets: per-market pricing + currency display + native-language voice profiles (DE/FR/ES/JP) per Pillar 5.",
    "Step 3 (2 hr) — Wire DDP + IOSS + UK VAT MOSS + AU GST + JP consumption tax. Register in-region 3PLs (EU + UK + AU + JP).",
    "Step 4 (1 hr) — Set per-market free-shipping thresholds (CA $99 / UK GBP 75 / EU EUR 89 / AU $149 / JP JPY 14900 / DACH-AT EUR 89 / Nordics EUR 89). Wire Klarna + AfterPay + iDEAL + Bancontact + Konbini + Alipay.",
    "Step 5 (1 hr) — Pre-launch: deepL + native-speaker translation review + cultural-adaptation pass + per-market ad-campaign launch.",
    "Step 6 (1 hr/wk ongoing) — Per-market contribution-margin calculator + per-market CAC payback tracking + quarterly FX-rate refresh per Asset 13 Pitfall #10.",
  ],
  "C+": [
    "Step 1 (1 hr) — Pick path + markets: Path C+ = all 7 markets with distributed 3-region 3PL (US + EU + AU) for 1-5 day fulfillment.",
    "Step 2 (3 hr) — Activate Shopify Markets Enterprise for all 7 markets with multi-region fulfillment routing + per-market pricing.",
    "Step 3 (3 hr) — Wire DDP + IOSS + UK VAT MOSS + AU GST + JP consumption tax + distributed 3-region 3PL onboarding.",
    "Step 4 (2 hr) — Set per-market free-shipping thresholds (Path C defaults). Wire all BNPL + local payment methods (Klarna + AfterPay + iDEAL + Bancontact + Konbini + Alipay + WeChat Pay).",
    "Step 5 (2 hr) — Pre-launch: native-language voice profiles (DE/FR/ES/JP/IT/NL) + cultural-adaptation pass + per-market ad-campaign launch with localized creative.",
    "Step 6 (2 hr/wk ongoing) — Per-market P&L tracking + per-market CAC payback + monthly FX-rate refresh + per-market impact reporting per Asset 12 Pillar 1 (carbon) + Pillar 5 (community) for Sustainable voice.",
  ],
};

// ----- Clamping helpers --------------------------------------------------

export function clampFloat(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ----- Defaults ----------------------------------------------------------

export const INTERNATIONAL_DEFAULTS: BrandInternationalInputs = {
  usGmv: 5_000_000,
  category: "apparel",
  usAov: 75,
  usContributionMarginPct: 70,
  supplyChainComplexity: 1,
  operatorCapacityHoursPerWeek: 8,
};

// ----- Markdown report renderer (mirrors Python CLI --report) ------------

export function renderInternationalMarkdown(
  inputs: BrandInternationalInputs,
  rec: PathRecommendation,
): string {
  const fmtUsd = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtPct = (n: number) => `${n.toFixed(0)}%`;

  return [
    `# International-expansion Path recommendation — Move #11`,
    ``,
    `## Inputs`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| US GMV | ${fmtUsd(inputs.usGmv)} |`,
    `| Category | ${inputs.category} |`,
    `| US AOV | ${fmtUsd(inputs.usAov)} |`,
    `| US contribution margin | ${fmtPct(inputs.usContributionMarginPct)} |`,
    `| Supply-chain complexity | ${inputs.supplyChainComplexity} |`,
    `| Operator capacity | ${inputs.operatorCapacityHoursPerWeek} hr/wk |`,
    ``,
    `## Recommended path: ${rec.path}`,
    ``,
    `**Markets:** ${rec.markets.join(", ")}`,
    ``,
    `**Justification:** ${rec.justification}`,
    ``,
    `## Cost stack (Year 1)`,
    ``,
    `| Item | Low | High |`,
    `|---|---|---|`,
    `| One-time setup | ${fmtUsd(rec.costOneTimeLow)} | ${fmtUsd(rec.costOneTimeHigh)} |`,
    `| Recurring (annual) | ${fmtUsd(rec.costRecurringLow)} | ${fmtUsd(rec.costRecurringHigh)} |`,
    `| **Total Year-1 cost** | **${fmtUsd(rec.year1CostLow)}** | **${fmtUsd(rec.year1CostHigh)}** |`,
    ``,
    `## Expected lift + ROI`,
    ``,
    `| Metric | Low | High |`,
    `|---|---|---|`,
    `| Year-1 incremental international revenue (% US base) | ${rec.expectedLiftLowPct.toFixed(0)}% | ${rec.expectedLiftHighPct.toFixed(0)}% |`,
    `| Year-1 incremental international revenue (USD) | ${fmtUsd(rec.year1IncrementalRevenueLow)} | ${fmtUsd(rec.year1IncrementalRevenueHigh)} |`,
    `| Year-1 ROI band | ${rec.year1RoiLow.toFixed(0)}:1 | ${rec.year1RoiHigh.toFixed(0)}:1 |`,
    ``,
    `## Per-market Year-1 revenue projection`,
    ``,
    `| Market | Revenue |`,
    `|---|---|`,
    ...rec.markets.map((m) => `| ${m} | ${fmtUsd(rec.perMarketRevenue[m] ?? 0)} |`),
    ``,
    `## 6-step build sequence`,
    ``,
    ...rec.buildSequence.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `---`,
    ``,
    `Generated by the Ecommerce Ops dashboard. Companion script: \`scripts/international_market_fit.py\`.`,
  ].join("\n");
}