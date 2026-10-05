/**
 * `flow-fix-recipe` — Move #N.12 — per-flow prioritized fix recipe.
 *
 * The Move #N.9 operator-action-digest on `/today` lists P0 BLOCK actions
 * like "Lifecycle flow 1.1_browse_abandon FAIL → /lifecycle#1.1_browse_abandon"
 * but when the operator lands on `/lifecycle`, the existing audit panel only
 * shows the SCORE + the failed-gate error messages ("Open rate 12% < 35% floor").
 * The operator is then left asking: "OK so which gate do I fix FIRST, what does
 * the fix look like in Klaviyo/Postscript, and how much monthly revenue will
 * it recover?" — exactly the questions this module answers.
 *
 * The Move #N.12 recipe complements the existing audit in three ways:
 *
 *   1. **Priority ordering** — not all failed gates are equal. A FAIL on
 *      Gate E (revenue) costs 10-100x more monthly $ than a FAIL on Gate A
 *      (open_rate). The recipe sorts failed gates by their $/1k impact
 *      descending so the operator fixes the highest-ROI gate first.
 *
 *   2. **Concrete fix spec** — every gate has a copy-pasteable spec:
 *      - The diagnostic to read first (which Klaviyo/Postscript tab)
 *      - The 1-3 things to change (subject line, send-time, CTA, etc.)
 *      - The expected lift band (low/high $/1k sent recovered)
 *      - The time to ship (a few minutes → a day)
 *
 *   3. **Per-flow Playbook link** — the recipe points at the canonical
 *      playbook that already covers this flow (playbook 12 for lifecycle,
 *      playbook 1 for cart-abandon, etc.) so the operator can read the
 *      long-form spec after they've decided the order.
 *
 * Pure data — no DOM, no localStorage side effects. The component layer
 * (flow-fix-recipe.tsx) owns the hash-anchor deep-link wiring, the
 * copy-to-clipboard button, and the cross-tab sync.
 *
 * Numbers are pinned to the canonical KPI thresholds in
 * `lifecycle-flow-health.ts` (OPEN_RATE_FLOOR, CLICK_RATE_FLOOR, CVR_FLOOR,
 * UNSUBSCRIBE_RATE_CEIL, REVENUE_FLOORS_PER_PILLAR, FLOW_ATTRIBUTION_MATCH_FLOOR)
 * so an operator can sanity-check the recipe math against the audit math
 * without drift.
 */

import {
  FLOW_ATTRIBUTION_MATCH_FLOOR,
  OPEN_RATE_FLOOR,
  CLICK_RATE_FLOOR,
  CVR_FLOOR,
  UNSUBSCRIBE_RATE_CEIL,
  REVENUE_FLOORS_PER_PILLAR,
  PATH_B_FLOW_INDEX,
  type LifecycleFlow,
  type FlowScore,
  type FlowGateFailure,
  type FlowVerdict,
} from "./lifecycle-flow-health";

// ----- Gate metadata --------------------------------------------------------

export type GateKey = "A" | "B" | "C" | "D" | "E" | "F";

export interface GateMeta {
  key: GateKey;
  /** Display name (matches the gate name in the audit panel) */
  name: string;
  /** One-line description shown in the recipe header */
  description: string;
  /**
   * Expected lift if the gate is brought to the canonical floor.
   * Low / high $/1k sent recovered. Conservative (low) = 25% of the
   * pillar mid-floor; aggressive (high) = 100% of the pillar mid-floor.
   * Gate E (revenue) is special — it uses the actual revenue gap, not a
   * fraction of the floor.
   */
  expectedLiftPer1kLowUsd: number;
  expectedLiftPer1kHighUsd: number;
  /**
   * Effort to ship — used to compute $/effort. Drives the priority sort
   * within a flow (a $500/d fix in 2 hours beats a $1000/d fix in 5 days).
   */
  effortDays: number;
  /** Diagnostic tab in Klaviyo/Postscript */
  diagnosticTab: string;
  /** The 1-3 concrete changes — copy-pasteable into a Klaviyo flow-edit comment */
  changes: string[];
}

export const GATE_META: Record<GateKey, GateMeta> = {
  A: {
    key: "A",
    name: "Subject + send-time (open rate)",
    description: "Open rate below the 35% Klaviyo 2024 floor.",
    expectedLiftPer1kLowUsd: 50,
    expectedLiftPer1kHighUsd: 200,
    effortDays: 0.25,
    diagnosticTab: "Klaviyo → Analytics → Flow → Email step → Open rate over time",
    changes: [
      "Test 3 subject lines: emoji prefix vs no-emoji, 6-8 words, with vs without personalization token {{ first_name }}",
      "Shift send-time by 4-6 hours toward the per-recipient local peak (Klaviyo → Smart Sending time)",
      "Verify From-name matches a real human (e.g. 'Sarah at Acme' beats 'Acme Co.')",
    ],
  },
  B: {
    key: "B",
    name: "CTA + product image (click rate)",
    description: "Click rate below the 4% Klaviyo 2024 floor.",
    expectedLiftPer1kLowUsd: 75,
    expectedLiftPer1kHighUsd: 300,
    effortDays: 0.5,
    diagnosticTab: "Klaviyo → Analytics → Flow → Email step → Click rate over time",
    changes: [
      "Add a single primary CTA button (not a text link) with action verb ('Shop the drop' > 'Learn more')",
      "Move the hero product image above the fold and add a hover-revealed secondary image",
      "Reduce copy above the CTA to <40 words — the 1-2-1 rule (1 hook, 2 features, 1 CTA)",
    ],
  },
  C: {
    key: "C",
    name: "CVR (product page + urgency)",
    description: "Conversion rate below the 0.8% Klaviyo 2024 floor.",
    expectedLiftPer1kLowUsd: 100,
    expectedLiftPer1kHighUsd: 500,
    effortDays: 1,
    diagnosticTab: "Klaviyo → Analytics → Flow → Email step → Placed order rate",
    changes: [
      "Link the CTA to a deep-linked product page (not category page) with UTM `?utm_source=klaviyo&utm_medium=email&utm_campaign=<flow_id>`",
      "Add a time-bound incentive: free shipping over $X OR 10% off if order in next 24h",
      "Add 3 reviews and a star-rating block to the landing page above the buy button",
    ],
  },
  D: {
    key: "D",
    name: "Frequency + list hygiene (unsub rate)",
    description: "Unsubscribe rate above the 0.3% deliverability ceiling.",
    expectedLiftPer1kLowUsd: 25,
    expectedLiftPer1kHighUsd: 100,
    effortDays: 1,
    diagnosticTab: "Klaviyo → List → Unsubscribe rate (segment by flow)",
    changes: [
      "Add a frequency cap: suppress any subscriber who got 5+ emails in the last 7 days",
      "Suppress unengaged subscribers (0 opens in 90 days) from this flow",
      "Add a preference center link in the footer so engaged subscribers can self-segment down (instead of unsubscribing entirely)",
    ],
  },
  E: {
    key: "E",
    name: "Revenue/1k (AOV + discount + product-fit)",
    description: "Revenue per 1k sent below the per-pillar floor.",
    expectedLiftPer1kLowUsd: 200,
    expectedLiftPer1kHighUsd: 1200,
    effortDays: 2,
    diagnosticTab: "Klaviyo → Analytics → Flow → Revenue per recipient (segment by product)",
    changes: [
      "Test a discount depth ladder: 10% off (recover ~25% of revenue gap) vs 15% off (recover ~50%) vs 20% off (recover ~80%)",
      "Cross-sell a complementary product in the email body (not a product the subscriber already bought)",
      "Switch from single-product to top-3 by-velocity carousel — Klaviyo dynamic block `viewed_but_not_bought`",
    ],
  },
  F: {
    key: "F",
    name: "Attribution match (Klaviyo + Triple Whale)",
    description: "Flow-attribution match below the 60% Triple Whale cohort-sync floor.",
    expectedLiftPer1kLowUsd: 0,
    expectedLiftPer1kHighUsd: 0,
    effortDays: 0.5,
    diagnosticTab: "Triple Whale → Cohorts → Klaviyo flow cohort",
    changes: [
      "Verify the Klaviyo + Triple Whale integration is connected (Settings → Integrations → Klaviyo → Connected)",
      "Add `tw_camp=<flow_id>` to every CTA link in the flow emails (so Triple Whale can attribute)",
      "Wait 7 days for the cohort-sync to propagate before re-checking the attribution match",
    ],
  },
};

// ----- Per-flow Playbook link -----------------------------------------------

export interface PlaybookRef {
  /** Playbook id (e.g. "01-abandoned-cart-flow-klaviyo") */
  playbookId: string;
  /** Title shown in the recipe */
  title: string;
  /** Path on the site */
  href: string;
  /** Why this playbook is the canonical fix for this flow */
  reason: string;
}

/**
 * Map of flow_id → the canonical playbook that already covers it. The
 * operator's "what to read first" link in the recipe. Path-B flows that
 * don't have a direct playbook point at playbook 12 (the lifecycle
 * flow library) which covers all 13 flows at a higher level.
 */
export const FLOW_PLAYBOOK_REFS: Record<string, PlaybookRef> = {
  "1.1_browse_abandon": {
    playbookId: "01-abandoned-cart-flow-klaviyo",
    title: "Abandoned-cart flow (Klaviyo)",
    href: "/playbooks/01-abandoned-cart-flow-klaviyo",
    reason: "Browse-abandon is a cart-abandon variant; the canonical Klaviyo cart flow is the load-bearing playbook.",
  },
  "1.2_winback": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Winback + sunset are deferred to the lifecycle library; the 4-tier launch ladder has the full spec.",
  },
  "1.3_post_purchase_xsell": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Post-purchase cross-sell is part of the lifecycle library; the launch ladder covers P3 pillars.",
  },
  "1.4_sunset": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Sunset flows are P2 winback; the lifecycle library has the trigger + filter spec.",
  },
  "1.5_shipping_confirmation": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Shipping confirmation is a P3 post-purchase flow; covered by the launch ladder.",
  },
  "2.1_birthday": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Birthday is a P5 celebratory flow; covered by the launch ladder.",
  },
  "2.2_anniversary": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Anniversary is a P5 celebratory flow; covered by the launch ladder.",
  },
  "2.3_loyalty_tier_up_down": {
    playbookId: "loyalty-program-launch-plan",
    title: "Loyalty program launch plan",
    href: "/loyalty-launch-plan",
    reason: "Loyalty tier flows are wired by the loyalty launch plan; the tier-up/tier-down trigger + filter is in step 4.",
  },
  "2.4_nps_detractor_followup": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "NPS-detractor is a P3 post-purchase flow; the lifecycle library has the Yotpo/Klaviyo sync spec.",
  },
  "2.5_subscription_dunning": {
    playbookId: "subscription-launch-plan",
    title: "Subscription launch plan",
    href: "/subscription-launch-plan",
    reason: "Subscription dunning is owned by the subscription launch plan; the 4-step dunning sequence is in step 3.",
  },
  "3.1_vip_early_access": {
    playbookId: "loyalty-program-launch-plan",
    title: "Loyalty program launch plan",
    href: "/loyalty-launch-plan",
    reason: "VIP early-access is a loyalty-feature flow; the launch plan has the Smile.io + Klaviyo tier-filter spec.",
  },
  "3.2_replenishment": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Replenishment is a P4 flow for consumables; the lifecycle library has the predicted-order-date trigger.",
  },
  "3.4_account_never_purchased": {
    playbookId: "12-lifecycle-flow-library",
    title: "Lifecycle flow library",
    href: "/playbooks/12-lifecycle-flow-library",
    reason: "Account-created-but-never-purchased is a P1 browse-abandon variant; the lifecycle library covers the trigger.",
  },
};

// ----- Recipe math -----------------------------------------------------------

export interface GateFix {
  gate: GateKey;
  name: string;
  /** The error message from the audit (e.g. "Open rate 12% < 35% floor") */
  measuredMessage: string;
  /** Expected lift $/1k sent (low, high) if the gate is brought to the floor */
  expectedLiftLowUsd: number;
  expectedLiftHighUsd: number;
  /** Days to ship the fix (from GATE_META.effortDays) */
  effortDays: number;
  /** $/day = expectedLiftMidUsd / effortDays (Infinity if effort=0) */
  sroiUsdPerDay: number;
  /** Diagnostic tab in Klaviyo/Postscript */
  diagnosticTab: string;
  /** The 1-3 concrete changes */
  changes: string[];
}

export interface FlowFixRecipe {
  flowId: string;
  flowName: string;
  pillar: string;
  tier: number;
  channel: string;
  score: number;
  verdict: FlowVerdict;
  /** Gates that failed, sorted by expected lift HIGH desc (fix the biggest first) */
  gateFixes: GateFix[];
  /** Sum of expected lift HIGH across all failed gates — the "if you fix everything" headline number */
  totalExpectedLiftLowUsd: number;
  totalExpectedLiftHighUsd: number;
  /** The single highest-impact fix's expected lift HIGH — "if you fix one gate only" */
  topFixLiftHighUsd: number;
  /** The single highest-impact fix's gate key — "fix this first" */
  topFixGate: GateKey | null;
  /** Estimated monthly revenue at risk = sum of expected lift HIGH * sent/1000 */
  monthlyRevenueAtRiskUsd: number;
  /** Per-flow Playbook ref */
  playbook: PlaybookRef | null;
}

/**
 * Parse the gate key from a FlowGateFailure.message — the audit panel emits
 * messages like "Open rate 12% < 35% floor — check subject line + send-time"
 * and the gate key is the leading "A (open_rate)" / "B (click_rate)" / etc.
 */
export function parseGateKey(failure: FlowGateFailure): GateKey | null {
  const m = /^([ABCDEF])\s*\(/.exec(failure.gate);
  if (!m) return null;
  return m[1] as GateKey;
}

/**
 * Compute the $/1k lift for a single gate. Gate E uses the actual
 * pillar-floor gap (because the lift IS the floor), the other gates
 * use a fraction of the pillar mid-floor (because the lift is a
 * downstream multiplier, not a direct revenue gap).
 */
function computeGateLift(
  gateKey: GateKey,
  flow: LifecycleFlow,
): { low: number; high: number } {
  if (gateKey === "F") {
    // Gate F (attribution) has no direct $ lift — it only changes measurement.
    return { low: 0, high: 0 };
  }
  if (gateKey === "E") {
    // Gate E (revenue) — the lift IS the gap to the pillar mid-floor.
    const [floorLo, floorHi] = REVENUE_FLOORS_PER_PILLAR[flow.pillar] ?? [300, 1000];
    return { low: floorLo, high: floorHi };
  }
  // Gates A/B/C/D — the lift is a downstream multiplier on the
  // pillar revenue mid-floor. Conservative = 25%, aggressive = 100%.
  const [, floorHi] = REVENUE_FLOORS_PER_PILLAR[flow.pillar] ?? [300, 1000];
  const mid = floorHi;
  return {
    low: Math.round(mid * 0.25),
    high: Math.round(mid * 1.0),
  };
}

/**
 * Build the per-flow fix recipe from a FlowScore. If the score is PASS
 * (zero failed gates), the recipe is still returned but with an empty
 * gateFixes array — the component renders "All gates passing — no fixes
 * needed" instead of nothing.
 */
export function buildFlowFixRecipe(score: FlowScore, kpiSent: number): FlowFixRecipe {
  const flow = PATH_B_FLOW_INDEX[score.flow_id];
  const gateFixes: GateFix[] = [];

  for (const failure of score.failed_gates) {
    const key = parseGateKey(failure);
    if (!key) continue;
    const meta = GATE_META[key];
    if (!meta) continue;
    const { low, high } = computeGateLift(key, flow);
    const effort = meta.effortDays;
    const mid = (low + high) / 2;
    const sroi = effort <= 0 ? Infinity : mid / effort;
    gateFixes.push({
      gate: key,
      name: meta.name,
      measuredMessage: failure.message,
      expectedLiftLowUsd: low,
      expectedLiftHighUsd: high,
      effortDays: effort,
      sroiUsdPerDay: sroi,
      diagnosticTab: meta.diagnosticTab,
      changes: meta.changes,
    });
  }

  // Sort by expected lift HIGH desc (fix the biggest dollar gate first),
  // tie-break by SROI ($/day) desc, then by gate letter asc.
  gateFixes.sort((a, b) => {
    if (b.expectedLiftHighUsd !== a.expectedLiftHighUsd) {
      return b.expectedLiftHighUsd - a.expectedLiftHighUsd;
    }
    if (b.sroiUsdPerDay !== a.sroiUsdPerDay) {
      return b.sroiUsdPerDay - a.sroiUsdPerDay;
    }
    return a.gate.localeCompare(b.gate);
  });

  const totalExpectedLiftLowUsd = gateFixes.reduce((s, g) => s + g.expectedLiftLowUsd, 0);
  const totalExpectedLiftHighUsd = gateFixes.reduce((s, g) => s + g.expectedLiftHighUsd, 0);
  const topFix = gateFixes[0];
  const topFixLiftHighUsd = topFix?.expectedLiftHighUsd ?? 0;
  const topFixGate = topFix?.gate ?? null;
  const monthlyRevenueAtRiskUsd = Math.round((totalExpectedLiftHighUsd * Math.max(kpiSent, 0)) / 1000);

  return {
    flowId: score.flow_id,
    flowName: score.flow_name,
    pillar: score.pillar,
    tier: score.tier,
    channel: score.channel,
    score: score.overall_score,
    verdict: score.verdict,
    gateFixes,
    totalExpectedLiftLowUsd,
    totalExpectedLiftHighUsd,
    topFixLiftHighUsd,
    topFixGate,
    monthlyRevenueAtRiskUsd,
    playbook: FLOW_PLAYBOOK_REFS[score.flow_id] ?? null,
  };
}

// ----- Display helpers -------------------------------------------------------

/** SROI $/day color tone — emerald >= $1k, sky >= $100, amber > 0, rose < 0, muted for 0/NaN. */
export function sroiToneClass(usdPerDay: number): string {
  if (!Number.isFinite(usdPerDay) || usdPerDay <= 0) return "text-muted-foreground";
  if (usdPerDay >= 1000) return "text-emerald-700 dark:text-emerald-400 font-semibold";
  if (usdPerDay >= 100) return "text-sky-700 dark:text-sky-400 font-semibold";
  return "text-amber-700 dark:text-amber-400";
}

/** Format a $/1k figure: $0, $50, $500, $1.5k, $15k. */
export function formatUsdPer1k(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "$0";
  if (Math.abs(n) < 1000) return `$${Math.round(n)}`;
  return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
}

/** Format a $/day figure: $0/d, $50/d, $500/d, $1.5k/d, $2.50M/d. */
export function formatSroiPerDay(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "$0/d";
  if (Math.abs(n) < 1000) return `$${Math.round(n)}/d`;
  if (Math.abs(n) < 1_000_000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k/d`;
  return `$${(n / 1_000_000).toFixed(2)}M/d`;
}

/** Effort: 0.25d, 0.5d, 1d, 2d. */
export function formatEffortDays(d: number): string {
  if (d < 1) return `${d}d`;
  if (d === 1) return "1 day";
  return `${d} days`;
}

/** Copy the recipe as a paste-ready markdown block. */
export function recipeToMarkdown(recipe: FlowFixRecipe): string {
  const lines: string[] = [];
  lines.push(`# Fix recipe — ${recipe.flowName} (${recipe.flowId})`);
  lines.push("");
  lines.push(`- **Pillar:** ${recipe.pillar}`);
  lines.push(`- **Tier:** T${recipe.tier}`);
  lines.push(`- **Channel:** ${recipe.channel}`);
  lines.push(`- **Current score:** ${recipe.score}/100 (${recipe.verdict})`);
  lines.push(`- **Monthly revenue at risk:** $${recipe.monthlyRevenueAtRiskUsd.toLocaleString()}`);
  if (recipe.playbook) {
    lines.push(`- **Read first:** [${recipe.playbook.title}](${recipe.playbook.href}) — ${recipe.playbook.reason}`);
  }
  lines.push("");
  if (recipe.gateFixes.length === 0) {
    lines.push("_All gates passing — no fixes needed._");
    return lines.join("\n");
  }
  lines.push("## Prioritized fixes (biggest lift first)");
  lines.push("");
  for (const fix of recipe.gateFixes) {
    lines.push(`### Gate ${fix.gate} — ${fix.name}`);
    lines.push("");
    lines.push(`- **Measured:** ${fix.measuredMessage}`);
    lines.push(`- **Expected lift:** ${formatUsdPer1k(fix.expectedLiftLowUsd)}–${formatUsdPer1k(fix.expectedLiftHighUsd)} per 1k sent`);
    lines.push(`- **Effort:** ${formatEffortDays(fix.effortDays)}`);
    lines.push(`- **SROI:** ${formatSroiPerDay(fix.sroiUsdPerDay)}`);
    lines.push(`- **Diagnostic:** ${fix.diagnosticTab}`);
    lines.push("- **Changes:**");
    for (const change of fix.changes) {
      lines.push(`  - ${change}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// ----- Aggregations ----------------------------------------------------------

/** Sum the monthly-revenue-at-risk across a list of recipes. */
export function totalMonthlyRevenueAtRiskUsd(recipes: FlowFixRecipe[]): number {
  return recipes.reduce((s, r) => s + r.monthlyRevenueAtRiskUsd, 0);
}

/** Sum the top-fix lift HIGH across a list of recipes (the "fix one gate" headline). */
export function totalTopFixLiftHighUsdPer1k(recipes: FlowFixRecipe[]): number {
  return recipes.reduce((s, r) => s + r.topFixLiftHighUsd, 0);
}

// ----- Storage key + event for cross-tab sync --------------------------------

export const FLOW_FIX_RECIPE_STORAGE_KEY = "ecom-ops:flow-fix-recipe:v1";
export const FLOW_FIX_RECIPE_UPDATE_EVENT = "ecom-ops:flow-fix-recipe:update";
