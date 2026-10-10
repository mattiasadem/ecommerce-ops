/**
 * `lifecycle-pillar-scoreboard.ts` — per-pillar rollup of the
 * `/lifecycle` Lifecycle Flow Health Audit.
 *
 * Direct browser port of the `aggregate_by_pillar()` section of
 * `scripts/lifecycle_flow_health_check.py` (the same per-pillar
 * `floors` table is the source of truth on both sides).
 *
 * Reads the same `ecom-ops:lifecycle-flow-health:v1` storage key the
 * Lifecycle Flow Health Audit writes and the Lifecycle Fleet Rollup
 * (`/`) reads. Groups the 13 Path-B flows into the 5 canonical
 * pillars (P1 Browse-abandon / P2 Winback / P3 Post-purchase-loyalty
 * / P4 Replenishment / P5 Celebratory) and produces a per-pillar
 * scoreboard:
 *
 *   - average_score              (mean of overall_score across flows
 *                                 audited in this pillar)
 *   - worst_score                (single lowest overall_score in the
 *                                 pillar; surfaces the "1 flow to fix")
 *   - best_score                 (single highest overall_score in the
 *                                 pillar)
 *   - worst_flow                 (the FlowScore object with the lowest
 *                                 overall_score)
 *   - worst_gate                 (the most-failed gate letter across
 *                                 flows in this pillar, with a one-line
 *                                 explanation)
 *   - verdict_counts             ({PASS, WARN, NEEDS_WORK, FAIL})
 *   - flows_scored               (count of flows actually audited)
 *   - at_risk_revenue_monthly    (sum of revenue over NEEDS_WORK + FAIL
 *                                 flows in this pillar)
 *   - lost_revenue_band          ([low, high] $/mo from per-pillar
 *                                 floor × at-risk flow count, mirrors
 *                                 lifecycle-fleet-rollup.ts)
 *   - pillar_label               (canonical human label, mirrors
 *                                 pillarShort from lifecycle-flow-health)
 *
 * Pure logic. The component layer owns localStorage + event wiring.
 *
 * Why this lives in its own file (vs adding to lifecycle-flow-health.ts):
 * the lifecycle-flow-health.ts module is the per-flow math — adding
 * the per-pillar aggregation there would force every audit re-render
 * to recompute the rollup. Keeping it separate means the rollup is
 * computed once per mount, and the audit's per-flow score list stays
 * the load-bearing data structure for both the audit table and the
 * fleet rollup.
 */

import {
  FlowKpis,
  FlowScore,
  LifecycleFlow,
  PATH_B_FLOWS,
  REVENUE_FLOORS_PER_PILLAR,
  pillarShort,
  buildHealthReport,
} from "./lifecycle-flow-health";

export const PILLAR_IDS = [
  "P1_browse_abandon",
  "P2_winback_sunset",
  "P3_post_purchase_loyalty",
  "P4_replenishment",
  "P5_celebratory",
] as const;
export type PillarId = (typeof PILLAR_IDS)[number];

export interface PillarScoreboard {
  pillar: PillarId;
  pillar_label: string;
  flows_scored: number;
  verdict_counts: { PASS: number; WARN: number; NEEDS_WORK: number; FAIL: number };
  average_score: number; // 0..100
  worst_score: number;
  best_score: number;
  worst_flow: FlowScore | null;
  worst_gate: { gate: string; message: string; count: number } | null;
  at_risk_revenue_monthly: number;
  lost_revenue_band: [number, number];
}

export interface LifecyclePillarScoreboardResult {
  pillars: PillarScoreboard[];
  flows_scored: number;
  pillars_scored: number; // distinct pillars with at least 1 audited flow
  total_at_risk_revenue_monthly: number;
  total_lost_revenue_band: [number, number];
  worst_pillar: PillarScoreboard | null;
  has_any_fail: boolean;
  has_any_needs_work: boolean;
}

// ----- helpers -----

function emptyVerdictCounts() {
  return { PASS: 0, WARN: 0, NEEDS_WORK: 0, FAIL: 0 };
}

/**
 * Find the most-failed gate across flows in this pillar. Tie-break by
 * gate order (A → F).
 */
function worstGateForPillar(scores: FlowScore[]): {
  gate: string;
  message: string;
  count: number;
} | null {
  if (scores.length === 0) return null;
  const tally = new Map<string, { gate: string; message: string; count: number }>();
  for (const s of scores) {
    for (const failure of s.failed_gates) {
      const cur = tally.get(failure.gate);
      if (cur) cur.count += 1;
      else tally.set(failure.gate, { gate: failure.gate, message: failure.message, count: 1 });
    }
  }
  if (tally.size === 0) return null;
  const all = Array.from(tally.values());
  // Sort: highest count first, then gate letter (A→F) for tie-break.
  all.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.gate.localeCompare(b.gate);
  });
  return all[0];
}

// ----- main reducer -----

export function buildPillarScoreboard(
  kpisByFlow: Record<string, FlowKpis>,
): LifecyclePillarScoreboardResult {
  const report = buildHealthReport(kpisByFlow);
  const scoresByPillar: Record<string, FlowScore[]> = {};
  for (const p of PILLAR_IDS) scoresByPillar[p] = [];

  for (const s of report.scores) {
    if (!scoresByPillar[s.pillar]) scoresByPillar[s.pillar] = [];
    scoresByPillar[s.pillar].push(s);
  }

  const pillars: PillarScoreboard[] = [];
  let totalAtRisk = 0;
  const totalBand: [number, number] = [0, 0];
  let hasAnyFail = false;
  let hasAnyNeedsWork = false;
  let worstPillar: PillarScoreboard | null = null;

  for (const pillarId of PILLAR_IDS) {
    const scores = scoresByPillar[pillarId] ?? [];
    if (scores.length === 0) continue;

    const verdictCounts = emptyVerdictCounts();
    let scoreSum = 0;
    let worstFlow: FlowScore | null = null;
    let bestScore = -Infinity;
    let worstScore = Infinity;
    let atRiskRevenue = 0;

    for (const s of scores) {
      verdictCounts[s.verdict] += 1;
      scoreSum += s.overall_score;
      if (s.overall_score > bestScore) bestScore = s.overall_score;
      if (s.overall_score < worstScore) worstScore = s.overall_score;
      if (!worstFlow || s.overall_score < worstFlow.overall_score) worstFlow = s;
      if (s.verdict === "NEEDS_WORK" || s.verdict === "FAIL") {
        // Use the revenue field from the input KPI snapshot — same
        // source the fleet rollup reads (kpisByFlow), so the
        // pillar-level at-risk $ sum reconciles with the fleet-level
        // rollup exactly.
        const k = kpisByFlow[s.flow_id];
        if (k) atRiskRevenue += k.revenue;
      }
    }

    const [floorLo, floorHi] = REVENUE_FLOORS_PER_PILLAR[pillarId] ?? [300, 1000];
    // Per-pillar at-risk count = NEEDS_WORK + FAIL flows (matches fleet rollup).
    const atRiskCount = verdictCounts.NEEDS_WORK + verdictCounts.FAIL;
    const bandLow = floorLo * atRiskCount;
    const bandHigh = floorHi * atRiskCount;

    const entry: PillarScoreboard = {
      pillar: pillarId,
      pillar_label: pillarShort(pillarId),
      flows_scored: scores.length,
      verdict_counts: verdictCounts,
      average_score: Math.round(scoreSum / scores.length),
      worst_score: worstScore === Infinity ? 0 : worstScore,
      best_score: bestScore === -Infinity ? 0 : bestScore,
      worst_flow: worstFlow,
      worst_gate: worstGateForPillar(scores),
      at_risk_revenue_monthly: Math.round(atRiskRevenue * 100) / 100,
      lost_revenue_band: [Math.round(bandLow * 100) / 100, Math.round(bandHigh * 100) / 100],
    };

    pillars.push(entry);
    totalAtRisk += atRiskRevenue;
    totalBand[0] += bandLow;
    totalBand[1] += bandHigh;
    if (entry.verdict_counts.FAIL > 0) hasAnyFail = true;
    if (entry.verdict_counts.NEEDS_WORK > 0) hasAnyNeedsWork = true;
    if (!worstPillar || entry.average_score < worstPillar.average_score) {
      worstPillar = entry;
    }
  }

  return {
    pillars,
    flows_scored: report.scores.length,
    pillars_scored: pillars.length,
    total_at_risk_revenue_monthly: Math.round(totalAtRisk * 100) / 100,
    total_lost_revenue_band: [
      Math.round(totalBand[0] * 100) / 100,
      Math.round(totalBand[1] * 100) / 100,
    ],
    worst_pillar: worstPillar,
    has_any_fail: hasAnyFail,
    has_any_needs_work: hasAnyNeedsWork,
  };
}

// ----- markdown export -----

/**
 * Render a paste-ready markdown summary of the per-pillar scoreboard.
 * Used by the component's "Copy markdown" button.
 *
 * Output shape:
 *
 *   **Ecommerce Ops — Lifecycle Pillar Scoreboard**
 *   _13 flows audited · 5 pillars scored · X NEEDS_WORK · Y FAIL_
 *
 *   **P1 · Browse-abandon** · avg 78 · 2 PASS / 1 NEEDS_WORK / 0 FAIL
 *   · Worst flow: Account-created-but-never-purchased (score 62)
 *   · Worst gate: E (revenue) ×1 — Revenue $312/1k < $300/1k floor …
 *   · At-risk revenue/mo: $1,400 (band: $300–$800)
 *
 *   …
 *
 *   **Total at-risk revenue/mo:** $5,200 (band: $1,800–$5,000)
 *   **Worst pillar:** P4 · Replenishment (avg 52)
 *
 *   —
 *   Full audit: https://ecommerce-ops-iota.vercel.app/lifecycle
 */
export function renderPillarScoreboardMarkdown(
  result: LifecyclePillarScoreboardResult,
  generatedAt: Date = new Date(),
): string {
  const lines: string[] = [];
  const dateStr = generatedAt.toISOString().slice(0, 10);
  const failCount = result.pillars.reduce((n, p) => n + p.verdict_counts.FAIL, 0);
  const needsWorkCount = result.pillars.reduce(
    (n, p) => n + p.verdict_counts.NEEDS_WORK,
    0,
  );
  const passCount = result.pillars.reduce((n, p) => n + p.verdict_counts.PASS, 0);

  lines.push(`**Ecommerce Ops — Lifecycle Pillar Scoreboard**`);
  lines.push(
    `_${result.flows_scored} flows audited · ${result.pillars_scored} pillars scored · ${passCount} PASS · ${needsWorkCount} NEEDS_WORK · ${failCount} FAIL — ${dateStr}_`,
  );
  lines.push("");

  // Pillars sorted worst → best so the operator sees "fix this first".
  const sorted = [...result.pillars].sort((a, b) => a.average_score - b.average_score);
  for (const p of sorted) {
    lines.push(
      `**${p.pillar_label}** · avg ${p.average_score} · ${p.verdict_counts.PASS} PASS / ${p.verdict_counts.WARN} WARN / ${p.verdict_counts.NEEDS_WORK} NEEDS_WORK / ${p.verdict_counts.FAIL} FAIL`,
    );
    if (p.worst_flow) {
      lines.push(
        `· Worst flow: ${p.worst_flow.flow_name} (score ${p.worst_flow.overall_score} · ${p.worst_flow.verdict})`,
      );
    }
    if (p.worst_gate) {
      lines.push(
        `· Worst gate: ${p.worst_gate.gate} ×${p.worst_gate.count} — ${p.worst_gate.message}`,
      );
    }
    lines.push(
      `· At-risk revenue/mo: ${formatUsd(p.at_risk_revenue_monthly)} (band: ${formatUsd(p.lost_revenue_band[0])}–${formatUsd(p.lost_revenue_band[1])})`,
    );
    lines.push("");
  }

  lines.push(
    `**Total at-risk revenue/mo:** ${formatUsd(result.total_at_risk_revenue_monthly)} (band: ${formatUsd(result.total_lost_revenue_band[0])}–${formatUsd(result.total_lost_revenue_band[1])})`,
  );
  if (result.worst_pillar) {
    lines.push(
      `**Worst pillar:** ${result.worst_pillar.pillar_label} (avg ${result.worst_pillar.average_score})`,
    );
  }
  lines.push("");
  lines.push("—");
  lines.push("Full audit: https://ecommerce-ops-iota.vercel.app/lifecycle");

  return lines.join("\n");
}

function formatUsd(n: number): string {
  if (n >= 1000) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toFixed(0)}`;
}

// ----- exports for the canonical pillar-id list & seeded list of expected flows ----

export const PATH_B_FLOWS_BY_PILLAR: Record<PillarId, LifecycleFlow[]> = (() => {
  const out: Record<PillarId, LifecycleFlow[]> = {
    P1_browse_abandon: [],
    P2_winback_sunset: [],
    P3_post_purchase_loyalty: [],
    P4_replenishment: [],
    P5_celebratory: [],
  };
  for (const f of PATH_B_FLOWS) {
    if (out[f.pillar as PillarId]) out[f.pillar as PillarId].push(f);
  }
  return out;
})();