/**
 * Lifecycle flow health-check math — direct TypeScript port of
 * `/scripts/lifecycle_flow_health_check.py`.
 *
 * Used by the interactive `<LifecycleFlowHealthAudit />` component on the
 * `/lifecycle` page. The math, canonical KPI benchmarks, and 13 Path-B flows
 * are kept byte-identical to the Python CLI so an operator can sanity-check
 * the same numbers in the browser and the terminal without drift.
 *
 * Canonical KPI thresholds (verified by Python test_canonical_thresholds_published):
 * - Gate A: open_rate >= 35%         (Klaviyo 2024 benchmark)
 * - Gate B: click_rate >= 4%         (Klaviyo 2024 benchmark)
 * - Gate C: cvr      >= 0.8%         (Klaviyo 2024 benchmark)
 * - Gate D: unsub    <= 0.3%         (deliverability floor per Klaviyo + Postscript)
 * - Gate E: revenue/1k >= pillar floor (per-pillar floor)
 * - Gate F: flow_attribution_match >= 60% (Triple Whale cohort-sync signal)
 */

export interface FlowKpis {
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;
  unsubscribes: number;
  revenue: number;
  flow_attributed: number;
}

export interface LifecycleFlow {
  flow_id: string;
  flow_name: string;
  pillar: string;
  tier: number;
  channel: string;
}

export type FlowVerdict = "PASS" | "WARN" | "NEEDS_WORK" | "FAIL";

export interface FlowGateFailure {
  gate: string;
  message: string;
}

export interface FlowScore {
  flow_id: string;
  flow_name: string;
  pillar: string;
  tier: number;
  channel: string;
  verdict: FlowVerdict;
  overall_score: number; // 0..100
  gates_passed: number;
  gates_failed: number;
  failed_gates: FlowGateFailure[];
  // measured values (0..1 ratios unless revenue_per_1k is in $)
  open_rate: number;
  click_rate: number;
  cvr: number;
  unsubscribe_rate: number;
  revenue_per_1k: number;
  flow_attribution_match: number;
}

// ----- Canonical KPI thresholds (pinned) -------------------------------------

export const OPEN_RATE_FLOOR = 0.35;
export const CLICK_RATE_FLOOR = 0.04;
export const CVR_FLOOR = 0.008;
export const UNSUBSCRIBE_RATE_CEIL = 0.003;
export const FLOW_ATTRIBUTION_MATCH_FLOOR = 0.6;

// Per-pillar revenue floors in $/1k sent
export const REVENUE_FLOORS_PER_PILLAR: Record<string, [number, number]> = {
  P1_browse_abandon: [300.0, 800.0],
  P2_winback_sunset: [400.0, 1200.0],
  P3_post_purchase_loyalty: [500.0, 1500.0],
  P4_replenishment: [800.0, 2500.0],
  P5_celebratory: [200.0, 800.0],
};

// 13 Path-B live flows (canonical — matches scripts/lifecycle_flow_health_check.py PATH_B_FLOWS)
export const PATH_B_FLOWS: LifecycleFlow[] = [
  // Tier 1 (5 flows)
  { flow_id: "1.1_browse_abandon", flow_name: "Browse-abandon", pillar: "P1_browse_abandon", tier: 1, channel: "email" },
  { flow_id: "1.2_winback", flow_name: "Customer winback", pillar: "P2_winback_sunset", tier: 1, channel: "email" },
  { flow_id: "1.3_post_purchase_xsell", flow_name: "Post-purchase cross-sell", pillar: "P3_post_purchase_loyalty", tier: 1, channel: "email" },
  { flow_id: "1.4_sunset", flow_name: "Sunset flow (subscriber-not-buyer)", pillar: "P2_winback_sunset", tier: 1, channel: "email" },
  { flow_id: "1.5_shipping_confirmation", flow_name: "Shipping confirmation + transit", pillar: "P3_post_purchase_loyalty", tier: 1, channel: "email" },
  // Tier 2 (5 flows)
  { flow_id: "2.1_birthday", flow_name: "Birthday", pillar: "P5_celebratory", tier: 2, channel: "email" },
  { flow_id: "2.2_anniversary", flow_name: "Anniversary", pillar: "P5_celebratory", tier: 2, channel: "email" },
  { flow_id: "2.3_loyalty_tier_up_down", flow_name: "Loyalty tier-up + tier-down", pillar: "P3_post_purchase_loyalty", tier: 2, channel: "email" },
  { flow_id: "2.4_nps_detractor_followup", flow_name: "NPS-detractor follow-up", pillar: "P3_post_purchase_loyalty", tier: 2, channel: "email" },
  { flow_id: "2.5_subscription_dunning", flow_name: "Subscription renewal + dunning", pillar: "P3_post_purchase_loyalty", tier: 2, channel: "email" },
  // Tier 3 subset (3 flows)
  { flow_id: "3.1_vip_early_access", flow_name: "VIP early-access + product drops", pillar: "P3_post_purchase_loyalty", tier: 3, channel: "email" },
  { flow_id: "3.2_replenishment", flow_name: "Replenishment reminder (consumables)", pillar: "P4_replenishment", tier: 3, channel: "email" },
  { flow_id: "3.4_account_never_purchased", flow_name: "Account-created-but-never-purchased", pillar: "P1_browse_abandon", tier: 3, channel: "email" },
];

export const PATH_B_FLOW_INDEX: Record<string, LifecycleFlow> = Object.fromEntries(
  PATH_B_FLOWS.map((f) => [f.flow_id, f]),
);

// ----- Math helpers -----------------------------------------------------------

function safeDiv(num: number, denom: number, defaultValue = 0): number {
  return denom === 0 ? defaultValue : num / denom;
}

function evaluateGates(
  flow: LifecycleFlow,
  kpis: FlowKpis,
): { failed: FlowGateFailure[]; measured: Record<string, number> } {
  const sent = kpis.sent;
  const opens = kpis.opens;
  const clicks = kpis.clicks;
  const conversions = kpis.conversions;
  const unsubscribes = kpis.unsubscribes;
  const revenue = kpis.revenue;
  const flowAttributed = kpis.flow_attributed;

  const openRate = safeDiv(opens, sent);
  const clickRate = safeDiv(clicks, sent);
  const cvr = safeDiv(conversions, sent);
  const unsubRate = safeDiv(unsubscribes, sent);
  const revPer1k = safeDiv(revenue, sent) * 1000;
  const attrMatch = conversions > 0 ? safeDiv(flowAttributed, conversions) : 0;

  const measured: Record<string, number> = {
    open_rate: openRate,
    click_rate: clickRate,
    cvr,
    unsubscribe_rate: unsubRate,
    revenue_per_1k: revPer1k,
    flow_attribution_match: attrMatch,
  };

  const failed: FlowGateFailure[] = [];

  if (openRate < OPEN_RATE_FLOOR) {
    failed.push({
      gate: "A (open_rate)",
      message: `Open rate ${(openRate * 100).toFixed(1)}% < ${(OPEN_RATE_FLOOR * 100).toFixed(0)}% floor — check subject line + send-time`,
    });
  }
  if (clickRate < CLICK_RATE_FLOOR) {
    failed.push({
      gate: "B (click_rate)",
      message: `Click rate ${(clickRate * 100).toFixed(1)}% < ${(CLICK_RATE_FLOOR * 100).toFixed(0)}% floor — check CTA copy + product image`,
    });
  }
  if (cvr < CVR_FLOOR) {
    failed.push({
      gate: "C (cvr)",
      message: `CVR ${(cvr * 100).toFixed(2)}% < ${(CVR_FLOOR * 100).toFixed(1)}% floor — check product-page CVR + discount + urgency`,
    });
  }
  if (unsubRate > UNSUBSCRIBE_RATE_CEIL) {
    failed.push({
      gate: "D (unsub_rate)",
      message: `Unsubscribe rate ${(unsubRate * 100).toFixed(2)}% > ${(UNSUBSCRIBE_RATE_CEIL * 100).toFixed(2)}% ceiling — check frequency + list hygiene`,
    });
  }
  const [floorLo] = REVENUE_FLOORS_PER_PILLAR[flow.pillar] ?? [300, 1000];
  if (revPer1k < floorLo) {
    failed.push({
      gate: "E (revenue)",
      message: `Revenue $${revPer1k.toFixed(0)}/1k < $${floorLo.toFixed(0)}/1k floor for ${flow.pillar} — check AOV + discount depth + product-fit`,
    });
  }
  if (conversions > 0 && attrMatch < FLOW_ATTRIBUTION_MATCH_FLOOR) {
    failed.push({
      gate: "F (attribution)",
      message: `Flow-attribution match ${(attrMatch * 100).toFixed(0)}% < ${(FLOW_ATTRIBUTION_MATCH_FLOOR * 100).toFixed(0)}% floor — check Klaviyo+Triple Whale integration + UTM tw_camp tag`,
    });
  }

  return { failed, measured };
}

export function scoreToVerdict(score: number): FlowVerdict {
  if (score >= 90) return "PASS";
  if (score >= 75) return "WARN";
  if (score >= 50) return "NEEDS_WORK";
  return "FAIL";
}

export function scoreFlow(flow: LifecycleFlow, kpis: FlowKpis): FlowScore {
  const { failed, measured } = evaluateGates(flow, kpis);
  const gatesFailed = failed.length;
  const gatesPassed = 6 - gatesFailed;
  // 6 gates → 100 points → ~16.67 pts per gate
  const overallScore = Math.round((gatesPassed * 100) / 6);
  const verdict = scoreToVerdict(overallScore);

  return {
    flow_id: flow.flow_id,
    flow_name: flow.flow_name,
    pillar: flow.pillar,
    tier: flow.tier,
    channel: flow.channel,
    verdict,
    overall_score: overallScore,
    gates_passed: gatesPassed,
    gates_failed: gatesFailed,
    failed_gates: failed,
    open_rate: measured.open_rate,
    click_rate: measured.click_rate,
    cvr: measured.cvr,
    unsubscribe_rate: measured.unsubscribe_rate,
    revenue_per_1k: measured.revenue_per_1k,
    flow_attribution_match: measured.flow_attribution_match,
  };
}

export interface HealthReport {
  scores: FlowScore[];
  overall_passed: boolean;
  summary: {
    total: number;
    by_pillar: Record<string, number>;
    by_tier: Record<string, number>;
    PASS: number;
    WARN: number;
    NEEDS_WORK: number;
    FAIL: number;
  };
}

export function buildHealthReport(kpisByFlow: Record<string, FlowKpis>): HealthReport {
  const scores: FlowScore[] = [];
  for (const flow of PATH_B_FLOWS) {
    const kpis = kpisByFlow[flow.flow_id];
    if (!kpis) continue;
    scores.push(scoreFlow(flow, kpis));
  }

  const byPillar: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  for (const flow of PATH_B_FLOWS) {
    if (!kpisByFlow[flow.flow_id]) continue;
    byPillar[flow.pillar] = (byPillar[flow.pillar] ?? 0) + 1;
    byTier[`T${flow.tier}`] = (byTier[`T${flow.tier}`] ?? 0) + 1;
  }

  const verdictCounts = { PASS: 0, WARN: 0, NEEDS_WORK: 0, FAIL: 0 };
  for (const s of scores) verdictCounts[s.verdict] += 1;

  return {
    scores,
    overall_passed: scores.every((s) => s.verdict === "PASS" || s.verdict === "WARN"),
    summary: {
      total: scores.length,
      by_pillar: byPillar,
      by_tier: byTier,
      ...verdictCounts,
    },
  };
}

// ----- Canonical-pass fixture generator --------------------------------------

/**
 * Bootstrap the canonical-pass KPI set for one flow — matches the Python
 * `_do_bootstrap` fixture writer byte-for-byte (sent=2000, 42% open, 6% click,
 * 1.2% CVR, 0.15% unsub, 70% attribution match, revenue at mid-floor).
 *
 * Used by the UI's "Seed canonical pass" button so an operator can demo the
 * PASS band without typing 91 inputs.
 */
export function canonicalPassKpis(flow: LifecycleFlow): FlowKpis {
  const [floorLo, floorHi] = REVENUE_FLOORS_PER_PILLAR[flow.pillar] ?? [300, 1000];
  const targetRevPer1k = (floorLo + floorHi) / 2;
  const sent = 2000;
  return {
    sent,
    opens: Math.round(sent * 0.42),
    clicks: Math.round(sent * 0.06),
    conversions: Math.round(sent * 0.012),
    unsubscribes: Math.round(sent * 0.0015),
    revenue: Math.round(((targetRevPer1k * sent) / 1000) * 100) / 100,
    flow_attributed: Math.round(sent * 0.012 * 0.7),
  };
}

// ----- Display helpers --------------------------------------------------------

export function verdictIntent(v: FlowVerdict): "success" | "accent" | "warning" | "danger" {
  if (v === "PASS") return "success";
  if (v === "WARN") return "accent";
  if (v === "NEEDS_WORK") return "warning";
  return "danger";
}

export function verdictBadgeClasses(v: FlowVerdict): string {
  if (v === "PASS") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (v === "WARN") return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400";
  if (v === "NEEDS_WORK") return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400";
}

export function verdictShortLabel(v: FlowVerdict): string {
  if (v === "PASS") return "PASS · 90–100";
  if (v === "WARN") return "WARN · 75–89";
  if (v === "NEEDS_WORK") return "NEEDS_WORK · 50–74";
  return "FAIL · 0–49";
}

export function pillarShort(pillar: string): string {
  const m: Record<string, string> = {
    P1_browse_abandon: "P1 · Browse-abandon",
    P2_winback_sunset: "P2 · Winback",
    P3_post_purchase_loyalty: "P3 · Post-purchase",
    P4_replenishment: "P4 · Replenishment",
    P5_celebratory: "P5 · Celebratory",
  };
  return m[pillar] ?? pillar;
}