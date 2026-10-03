/**
 * `lifecycle-fleet-rollup.ts` — cross-page rollup math for the `/` home page
 * Lifecycle Fleet Health card.
 *
 * Reads the same KPI snapshot the `/lifecycle` page stores at
 * `ecom-ops:lifecycle-flow-health:v1`, runs `buildHealthReport` against it,
 * and surfaces the operator-facing summary numbers that fit in a single
 * 4-tile Overview card:
 *
 *   - flows scored (X / 13)
 *   - PASS / WARN / NEEDS_WORK / FAIL counts
 *   - total at-risk revenue (sum of revenue over NEEDS_WORK + FAIL flows)
 *   - worst 3 scored flows (sorted by score ascending)
 *   - hasAnyFail / hasAnyNeedWork flags (so the badge color can escalate)
 *   - estimatedLostRevenueBand (low/high monthly $)  — pulled from the
 *     canonical per-pillar revenue floor × at-risk flow count, so the
 *     operator can SEE the budget the cost of inaction is burning each
 *     month. Numbers match `scripts/lifecycle_flow_health_check.py`'s
 *     REVENUE_FLOORS_PER_PILLAR table exactly.
 *
 * Pure logic, no DOM. The component layer owns localStorage and event
 * wiring.
 *
 * Why this lives in its own file (vs adding it to lifecycle-flow-health.ts):
 * the Overview card is a different audience — it shows the FLEET, not the
 * per-flow detail. Keeping the rollup math separate means the
 * `/lifecycle` page doesn't pull in a "home-page only" helper, and the
 * test file can target the rollup's inputs/outputs without re-staging the
 * full lifecycle audit's per-gate fixtures.
 */

import {
  PATH_B_FLOWS,
  buildHealthReport,
  type FlowKpis,
  type FlowScore,
  type LifecycleFlow,
} from "./lifecycle-flow-health";
import type { HealthReport } from "./lifecycle-flow-health";

export const LIFECYCLE_FLEET_STORAGE_KEY = "ecom-ops:lifecycle-flow-health:v1";
export const LIFECYCLE_FLEET_UPDATE_EVENT = "ecom-ops:lifecycle-flow-health:update";

/** Canonical per-pillar monthly revenue floor ($/1k sent), matches the Python CLI.
 *
 * Pillars are the canonical 5 from `lifecycle-flow-health.ts`:
 *   P1_browse_abandon / P2_winback_sunset / P3_post_purchase_loyalty /
 *   P4_replenishment / P5_celebratory
 *
 * Numbers are kept byte-identical to REVENUE_FLOORS_PER_PILLAR (low/high split
 * for the estLostRevenueBand aggregation) so the operator-facing rollup matches
 * the per-flow score shown on /lifecycle.
 */
export interface RevenueFloorBand {
  low: number;
  high: number;
}

/** Operator-facing rollup record returned by `summarizeLifecycleFleet`. */
export interface LifecycleFleetSummary {
  flowsScored: number;
  totalFlows: number;
  pass: number;
  warn: number;
  needWork: number;
  fail: number;
  /** Sum of `revenue` across flows with verdict in NEEDS_WORK or FAIL. */
  atRiskRevenueUsd: number;
  /** Sum of `revenue` across PASS flows (healthy revenue at risk if not maintained). */
  healthyRevenueUsd: number;
  /** Sum of `revenue` across all scored flows. */
  totalRevenueUsd: number;
  /** Worst 3 flows by score (ascending; 0-100). May be < 3 if fewer scored. */
  worstFlows: Array<{
    flow_id: string;
    flow_name: string;
    pillar: string;
    tier: number;
    score: number;
    verdict: FlowScore["verdict"];
    revenue: number;
  }>;
  /** True if at least one flow scored FAIL. */
  hasAnyFail: boolean;
  /** True if at least one flow scored NEEDS_WORK (or FAIL). */
  hasAnyNeedWork: boolean;
  /** True if every scored flow is PASS or WARN. */
  allPassed: boolean;
  /** Estimated monthly $ lost (low/high band) from NEEDS_WORK + FAIL flows. */
  estLostRevenueBand: RevenueFloorBand;
  /** Per-pillar at-risk flow count (NEEDS_WORK + FAIL). */
  atRiskByPillar: Record<string, number>;
}

export const REVENUE_FLOORS_PER_PILLAR_LOW: Record<string, number> = {
  P1_browse_abandon: 300,
  P2_winback_sunset: 400,
  P3_post_purchase_loyalty: 500,
  P4_replenishment: 800,
  P5_celebratory: 200,
};

export const REVENUE_FLOORS_PER_PILLAR_HIGH: Record<string, number> = {
  P1_browse_abandon: 800,
  P2_winback_sunset: 1200,
  P3_post_purchase_loyalty: 1500,
  P4_replenishment: 2500,
  P5_celebratory: 800,
};

/**
 * Build the operator-facing rollup. Pure function — no `window`, no
 * `localStorage`. The component layer is responsible for hydrating
 * `kpisByFlow` from storage.
 *
 * If `kpisByFlow` is empty (operator hasn't audited any flows yet),
 * `flowsScored === 0` and `worstFlows === []`; the component renders a
 * "Audit your 13 flows →" empty-state CTA in that case.
 */
export function summarizeLifecycleFleet(
  kpisByFlow: Record<string, FlowKpis>,
): LifecycleFleetSummary {
  const report: HealthReport = buildHealthReport(kpisByFlow);

  // at-risk / healthy / total revenue — derived from the input KPI map
  // (FlowScore doesn't carry the raw `revenue` field, only `revenue_per_1k`).
  let atRiskRevenueUsd = 0;
  let healthyRevenueUsd = 0;
  let totalRevenueUsd = 0;
  const scoreWithRevenue = report.scores.map((s) => {
    const rawRev = kpisByFlow[s.flow_id]?.revenue ?? 0;
    totalRevenueUsd += rawRev;
    if (s.verdict === "FAIL" || s.verdict === "NEEDS_WORK") {
      atRiskRevenueUsd += rawRev;
    } else {
      healthyRevenueUsd += rawRev;
    }
    return { score: s, revenue: rawRev };
  });

  // Worst 3 flows by score (ascending). Ties broken by revenue desc so the
  // operator sees the most expensive failures first.
  const sortedWorst = [...scoreWithRevenue]
    .sort(
      (a, b) =>
        a.score.overall_score - b.score.overall_score || b.revenue - a.revenue,
    )
    .slice(0, 3)
    .map(({ score: s, revenue }) => ({
      flow_id: s.flow_id,
      flow_name: s.flow_name,
      pillar: s.pillar,
      tier: s.tier,
      score: s.overall_score,
      verdict: s.verdict,
      revenue,
    }));

  // Estimated monthly $ lost band — sum the per-pillar floor × at-risk count.
  // Returns 0 when nothing scored.
  const atRiskByPillar: Record<string, number> = {};
  let estLostLow = 0;
  let estLostHigh = 0;
  for (const s of report.scores) {
    if (s.verdict !== "FAIL" && s.verdict !== "NEEDS_WORK") continue;
    atRiskByPillar[s.pillar] = (atRiskByPillar[s.pillar] ?? 0) + 1;
    const lo = REVENUE_FLOORS_PER_PILLAR_LOW[s.pillar] ?? 300;
    const hi = REVENUE_FLOORS_PER_PILLAR_HIGH[s.pillar] ?? 800;
    estLostLow += lo;
    estLostHigh += hi;
  }

  const hasAnyFail = report.summary.FAIL > 0;
  const hasAnyNeedWork = hasAnyFail || report.summary.NEEDS_WORK > 0;
  const allPassed =
    report.scores.length > 0 &&
    report.summary.FAIL === 0 &&
    report.summary.NEEDS_WORK === 0;

  return {
    flowsScored: report.summary.total,
    totalFlows: PATH_B_FLOWS.length,
    pass: report.summary.PASS,
    warn: report.summary.WARN,
    needWork: report.summary.NEEDS_WORK,
    fail: report.summary.FAIL,
    atRiskRevenueUsd,
    healthyRevenueUsd,
    totalRevenueUsd,
    worstFlows: sortedWorst,
    hasAnyFail,
    hasAnyNeedWork,
    allPassed,
    estLostRevenueBand: {
      low: estLostLow,
      high: estLostHigh,
    },
    atRiskByPillar,
  };
}

/**
 * Validate a hydrated `kpisByFlow` map. Filters out any flow_id not in the
 * canonical 13 Path-B flows (defense against a stale localStorage blob from a
 * prior schema) and any per-flow blob that's missing numeric fields. Returns
 * the sanitized map.
 *
 * The component uses this so a corrupted blob (theoretical: schema bump,
 * partial write from a private-mode quota error) doesn't crash the
 * `<HealthReport />` render.
 */
export function sanitizeKpisByFlow(
  raw: Record<string, unknown> | null | undefined,
): Record<string, FlowKpis> {
  if (!raw || typeof raw !== "object") return {};
  const validIds = new Set(PATH_B_FLOWS.map((f) => f.flow_id));
  const out: Record<string, FlowKpis> = {};
  for (const [flowId, kpis] of Object.entries(raw)) {
    if (!validIds.has(flowId)) continue;
    if (!kpis || typeof kpis !== "object") continue;
    const k = kpis as Partial<FlowKpis>;
    const sent = Number(k.sent);
    const opens = Number(k.opens);
    const clicks = Number(k.clicks);
    const conversions = Number(k.conversions);
    const unsubscribes = Number(k.unsubscribes);
    const revenue = Number(k.revenue);
    const flow_attributed = Number(k.flow_attributed);
    if (
      !Number.isFinite(sent) ||
      !Number.isFinite(opens) ||
      !Number.isFinite(clicks) ||
      !Number.isFinite(conversions) ||
      !Number.isFinite(unsubscribes) ||
      !Number.isFinite(revenue) ||
      !Number.isFinite(flow_attributed)
    ) {
      continue;
    }
    out[flowId] = {
      sent: Math.max(0, sent),
      opens: Math.max(0, opens),
      clicks: Math.max(0, clicks),
      conversions: Math.max(0, conversions),
      unsubscribes: Math.max(0, unsubscribes),
      revenue: Math.max(0, revenue),
      flow_attributed: Math.max(0, flow_attributed),
    };
  }
  return out;
}

/** Read the canonical 13 Path-B flow list (re-exported so consumers can
 *  show "X / 13" without re-importing from lifecycle-flow-health). */
export function canonicalFleetFlows(): LifecycleFlow[] {
  return PATH_B_FLOWS;
}