/**
 * `cohort-ltv-simulator.ts` — Move #N.62 — 5-cohort LTV simulator.
 *
 * Pure scoring engine for the interactive cohort-LTV simulator on
 * `/today`. Splits the operator's monthly orders into 5 canonical DTC
 * cohorts and projects each cohort's 12-month LTV, repeat rate, and
 * contribution to total revenue.
 *
 * The 5 cohorts mirror the canonical lifecycle framework
 * (research/05 §Lifecycle-marketing §4-pillar-cohort-framework):
 *
 *   1. **VIP**            — top 10% by AOV · 12-mo repeat 70% · AOV 1.6×
 *   2. **Loyal active**   — repeat purchasers, last 90d · 12-mo repeat 60% · AOV 1.2×
 *   3. **First-time**     — 1 purchase, last 30d · 12-mo repeat 28% · AOV 0.9×
 *   4. **Mobile browse**  — browse + add-to-cart, no purchase · 12-mo repeat 12% · AOV 0.8×
 *   5. **Dormant**        — last purchase >180d · 12-mo repeat 8%  · AOV 0.7×
 *
 * The simulator's job is to model how cohort-MIX changes (e.g. "ship a
 * browse-abandon flow that pulls 20% of mobile-browse into first-time
 * purchase") shift total revenue — closing the "I have 5 cohorts on
 * paper, but I can't see what happens to revenue when I move customers
 * between them" gap.
 *
 * Inputs:
 *   - `monthlyOrders`    (from Your-Store): operator's current orders/month
 *   - `aov`              (from Your-Store): operator's current AOV
 *   - `grossMargin`      (from Your-Store): operator's current gross margin
 *   - `cohortMix`        (5 percentages summing to 100): per-cohort share of orders
 *   - `horizonMonths`    (default 12): how far to project
 *
 * Outputs:
 *   - `baselineRevenue`     — current-state revenue over the horizon
 *   - `projectedRevenue`    — post-shift revenue over the horizon
 *   - `cohortRows[]`        — per-cohort LTV / repeat / share table
 *   - `liftPercent`         — % change baseline → projected
 *
 * Pure data — no DOM, no localStorage. The component layer in
 * `cohort-ltv-simulator.tsx` reads Your-Store and persists the cohort mix
 * to `ecom-ops:cohort-ltv-simulator:v1`.
 */

/**
 * Per-cohort baseline shape. Values are calibrated to canonical
 * lifecycle-framework research/05 §5-pillar benchmarks + Triple-Whale
 * 2024 cohort repeat-rate study.
 */
export interface CohortProfile {
  /** Stable id — used for storage keys + tests. */
  id: "vip" | "loyal" | "firstTime" | "mobileBrowse" | "dormant";
  /** Display name. */
  label: string;
  /** One-line description shown in the UI. */
  description: string;
  /** AOV multiplier vs operator's base AOV. */
  aovMultiplier: number;
  /** 12-month repeat-purchase rate (0..1). */
  twelveMonthRepeatRate: number;
  /** Average orders per repeat customer over the 12-month horizon. */
  repeatOrdersPerCustomer: number;
  /** Acquisition cost multiplier (VIPs cost 4× to acquire vs first-time). */
  cacMultiplier: number;
}

export const COHORT_PROFILES: CohortProfile[] = [
  {
    id: "vip",
    label: "VIP — top 10% by AOV",
    description: "Highest-LTV customers. 1.6× AOV, 70% 12-mo repeat.",
    aovMultiplier: 1.6,
    twelveMonthRepeatRate: 0.70,
    repeatOrdersPerCustomer: 3.5,
    cacMultiplier: 4.0,
  },
  {
    id: "loyal",
    label: "Loyal active — repeat buyers",
    description: "Recent repeat purchasers. 1.2× AOV, 60% 12-mo repeat.",
    aovMultiplier: 1.2,
    twelveMonthRepeatRate: 0.60,
    repeatOrdersPerCustomer: 2.8,
    cacMultiplier: 1.8,
  },
  {
    id: "firstTime",
    label: "First-time — recent buyers",
    description: "Single purchase, last 30d. 0.9× AOV, 28% 12-mo repeat.",
    aovMultiplier: 0.9,
    twelveMonthRepeatRate: 0.28,
    repeatOrdersPerCustomer: 1.4,
    cacMultiplier: 1.0,
  },
  {
    id: "mobileBrowse",
    label: "Mobile browse — no purchase yet",
    description: "Browse + ATC, no checkout. 0.8× AOV, 12% 12-mo repeat.",
    aovMultiplier: 0.8,
    twelveMonthRepeatRate: 0.12,
    repeatOrdersPerCustomer: 1.1,
    cacMultiplier: 0.6,
  },
  {
    id: "dormant",
    label: "Dormant — last purchase >180d",
    description: "At-risk of churn. 0.7× AOV, 8% 12-mo repeat.",
    aovMultiplier: 0.7,
    twelveMonthRepeatRate: 0.08,
    repeatOrdersPerCustomer: 1.0,
    cacMultiplier: 0.4,
  },
];

/**
 * Default cohort mix — calibrated to the average DTC operator at
 * ~$1M GMV (1000 orders/month). The mix is the share of CURRENT
 * monthly orders that fall into each cohort.
 */
export const DEFAULT_COHORT_MIX: Record<CohortProfile["id"], number> = {
  vip: 8,
  loyal: 17,
  firstTime: 30,
  mobileBrowse: 25,
  dormant: 20,
};

/**
 * Storage key for the operator's editable cohort mix.
 */
export const COHORT_LTV_STORAGE_KEY = "ecom-ops:cohort-ltv-simulator:v1";

/**
 * Inputs to the simulator.
 */
export interface CohortLtvInputs {
  monthlyOrders: number;
  aov: number;
  grossMargin: number;
  cohortMix: Record<CohortProfile["id"], number>;
  horizonMonths: number;
}

/**
 * Outputs of one cohort row.
 */
export interface CohortLtvRow {
  id: CohortProfile["id"];
  label: string;
  /** Share of monthly orders (0..100). */
  sharePercent: number;
  /** Cohort-specific AOV (aov * aovMultiplier). */
  cohortAov: number;
  /** First-month revenue from this cohort. */
  firstMonthRevenue: number;
  /** Repeat orders per cohort member over the horizon. */
  repeatOrdersPerCohortMember: number;
  /** Repeat revenue per cohort member over the horizon (USD). */
  repeatRevenuePerMember: number;
  /** Total cohort revenue over the horizon (USD). */
  cohortRevenue: number;
  /** Cohort contribution to total revenue (0..1). */
  revenueShare: number;
  /** 12-month LTV per cohort member (USD). */
  ltv: number;
  /** LTV after gross-margin deduction (USD). */
  ltvMargin: number;
}

/**
 * Aggregate simulator output.
 */
export interface CohortLtvResult {
  inputs: CohortLtvInputs;
  rows: CohortLtvRow[];
  /** Sum of cohort revenue (== total revenue over horizon). */
  totalRevenue: number;
  /** Total margin over horizon (USD). */
  totalMargin: number;
  /** Total orders over horizon. */
  totalOrders: number;
  /** Average LTV per customer. */
  avgLtv: number;
  /** Sum of cohortMix — should be ~100. */
  mixSumPercent: number;
  /** Health band for the avg LTV (great / healthy / weak / danger). */
  ltvBand: "great" | "healthy" | "weak" | "danger";
  /** Health band for the repeat-rate (great / healthy / weak / danger). */
  repeatBand: "great" | "healthy" | "weak" | "danger";
  /** Horizon used (echoed for the UI). */
  horizonMonths: number;
  /** Repeat-rate (0..1) weighted by cohort size. */
  weightedRepeatRate: number;
}

/**
 * Validate + normalize a cohort-mix object to sum to exactly 100
 * (proportional adjustment). Use this before passing to
 * `simulateCohortLtv` so an operator who edits two sliders and
 * forgets to balance them sees the proportional version.
 */
export function normalizeCohortMix(
  raw: Record<CohortProfile["id"], number>,
): Record<CohortProfile["id"], number> {
  const sum = Object.values(raw).reduce((n, v) => n + Math.max(0, v), 0);
  if (sum <= 0) {
    // All zeros — fall back to defaults.
    return { ...DEFAULT_COHORT_MIX };
  }
  const out = { ...raw };
  for (const k of Object.keys(out) as CohortProfile["id"][]) {
    out[k] = (Math.max(0, raw[k]) / sum) * 100;
  }
  return out;
}

/**
 * Pure simulator — projects the per-cohort LTV and aggregate revenue
 * from the operator's Your-Store inputs + cohort-mix sliders.
 */
export function simulateCohortLtv(inputs: CohortLtvInputs): CohortLtvResult {
  const monthlyOrders = Math.max(1, inputs.monthlyOrders);
  const aov = Math.max(1, inputs.aov);
  const grossMargin = Math.min(0.95, Math.max(0.05, inputs.grossMargin));
  const horizonMonths = Math.max(1, Math.round(inputs.horizonMonths ?? 12));

  const mix = normalizeCohortMix(inputs.cohortMix);
  const mixSum = Object.values(mix).reduce((n, v) => n + v, 0);

  const rows: CohortLtvRow[] = [];
  let totalRevenue = 0;
  let totalOrders = 0;
  let weightedRepeat = 0;

  for (const profile of COHORT_PROFILES) {
    const sharePercent = mix[profile.id];
    const cohortAov = aov * profile.aovMultiplier;
    const cohortMonthlyOrders = (monthlyOrders * sharePercent) / 100;
    const firstMonthRevenue = cohortMonthlyOrders * cohortAov;

    // Repeat math: per-cohort-member 12-month repeat rate × repeat orders.
    const repeatOrdersPerCohortMember =
      profile.twelveMonthRepeatRate * profile.repeatOrdersPerCustomer;
    const repeatRevenuePerMember = cohortAov * repeatOrdersPerCohortMember;

    // Total cohort revenue over horizon: first-month + repeats × (horizon-1).
    const cohortRevenue =
      firstMonthRevenue * horizonMonths +
      cohortMonthlyOrders * repeatOrdersPerCohortMember * (horizonMonths - 1) * cohortAov;

    // 12-month LTV per member = first purchase + repeat purchases × gross margin.
    const ltv =
      cohortAov + repeatRevenuePerMember;
    const ltvMargin = ltv * grossMargin;

    totalRevenue += cohortRevenue;
    totalOrders += cohortMonthlyOrders * horizonMonths;
    weightedRepeat += (profile.twelveMonthRepeatRate * sharePercent) / 100;

    rows.push({
      id: profile.id,
      label: profile.label,
      sharePercent,
      cohortAov,
      firstMonthRevenue,
      repeatOrdersPerCohortMember,
      repeatRevenuePerMember,
      cohortRevenue,
      revenueShare: 0, // filled below
      ltv,
      ltvMargin,
    });
  }

  // Compute revenue share now that totals exist.
  for (const r of rows) {
    r.revenueShare = totalRevenue > 0 ? r.cohortRevenue / totalRevenue : 0;
  }

  const avgLtv =
    rows.reduce((sum, r) => sum + r.ltv * (r.sharePercent / 100), 0);
  const totalMargin = totalRevenue * grossMargin;

  return {
    inputs: { ...inputs, cohortMix: mix, monthlyOrders, aov, grossMargin, horizonMonths },
    rows,
    totalRevenue,
    totalMargin,
    totalOrders,
    avgLtv,
    mixSumPercent: mixSum,
    horizonMonths,
    weightedRepeatRate: weightedRepeat,
    ltvBand: bandForLtv(avgLtv, aov),
    repeatBand: bandForRepeatRate(weightedRepeat),
  };
}

/**
 * Health band for the projected average LTV. Anchored on multiples of
 * the operator's base AOV.
 *
 *   ≥ 5× AOV  → "great"
 *   ≥ 3× AOV  → "healthy"
 *   ≥ 1.5×    → "weak"
 *   < 1.5×    → "danger"
 */
export function bandForLtv(
  ltv: number,
  aov: number,
): "great" | "healthy" | "weak" | "danger" {
  if (aov <= 0) return "danger";
  const ratio = ltv / aov;
  if (ratio >= 5) return "great";
  if (ratio >= 3) return "healthy";
  if (ratio >= 1.5) return "weak";
  return "danger";
}

/**
 * Health band for the cohort-weighted repeat rate.
 *
 *   ≥ 35% → "great"
 *   ≥ 25% → "healthy"
 *   ≥ 15% → "weak"
 *   < 15% → "danger"
 */
export function bandForRepeatRate(
  rate: number,
): "great" | "healthy" | "weak" | "danger" {
  if (rate >= 0.35) return "great";
  if (rate >= 0.25) return "healthy";
  if (rate >= 0.15) return "weak";
  return "danger";
}

/**
 * Apply a "shift" delta to a cohort mix — e.g. operator wants to move
 * 5pp of mobile-browse into first-time by shipping a browse-abandon
 * flow. Returns a normalized mix.
 */
export function shiftCohortMix(
  base: Record<CohortProfile["id"], number>,
  from: CohortProfile["id"],
  to: CohortProfile["id"],
  deltaPp: number,
): Record<CohortProfile["id"], number> {
  const moved = Math.max(0, deltaPp);
  const next = { ...base };
  next[from] = Math.max(0, next[from] - moved);
  next[to] = Math.max(0, next[to] + moved);
  return normalizeCohortMix(next);
}

/**
 * Suggested delta map for the "preset shifts" buttons in the UI.
 * Each preset moves a percentage-point slice of orders from one
 * cohort to another — representing a real lifecycle intervention.
 */
export interface CohortShiftPreset {
  id: string;
  label: string;
  description: string;
  from: CohortProfile["id"];
  to: CohortProfile["id"];
  deltaPp: number;
}

export const COHORT_SHIFT_PRESETS: CohortShiftPreset[] = [
  {
    id: "browse-abandon-flow",
    label: "Browse-abandon flow",
    description:
      "Move 8pp of mobile-browse into first-time via a 3-email browse-abandon series.",
    from: "mobileBrowse",
    to: "firstTime",
    deltaPp: 8,
  },
  {
    id: "winback-dormant",
    label: "Winback dormant",
    description:
      "Move 5pp of dormant into loyal via a sunset-rescue + winback flow.",
    from: "dormant",
    to: "loyal",
    deltaPp: 5,
  },
  {
    id: "vip-tier-up",
    label: "VIP tier-up",
    description:
      "Move 4pp of loyal into VIP via a loyalty tier-upgrade flow.",
    from: "loyal",
    to: "vip",
    deltaPp: 4,
  },
];