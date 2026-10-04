/**
 * `master-rollout-calendar.ts` — Cross-page-intelligence multi-move
 * 90-day rollout planner.
 *
 * The dashboard ships **9 per-move launch-plan generators** (PDP A/B,
 * Welcome Series, Abandoned Cart, Loyalty, Post-Purchase Upsell,
 * SMS-Welcome-Cart, Attribution-Health-Alert, Subscription Program, 3PL,
 * Checkout Audit). Each one takes the operator's per-move calculator
 * inputs and emits a 30-day calendar-paced markdown checklist.
 *
 * That works. What's missing is the cross-move view: the operator runs
 * 2–4 of those generators and now has 60–120 days of un-sequenced work.
 * What do they ship first? Which moves collide on Klaviyo? What's the
 * combined Year-1 ROI?
 *
 * This module reads the saved per-move inputs (via the component layer,
 * which has access to localStorage), sequences them in canonical
 * foundation-first build order (foundation: SMS-WC → Welcome →
 * Abandoned Cart → Post-Purchase → Loyalty → Subscriptions; CRO: PDP
 * A/B → Checkout Audit; attribution: Attribution-Alert; ops: 3PL),
 * detects Klaviyo / Klaviyo-SMS / same-week build collisions, computes
 * the combined Year-1 ROI (sums net margin / cost across moves), and
 * produces a paste-ready 90-day markdown checklist + RFC 5545 .ics for
 * Google / Apple / Outlook calendar import.
 *
 * Build-order rationale:
 *   - SMS-WC first (cheapest, fastest, drives 20-40% list-growth that
 *     every later flow needs)
 *   - Welcome Series second (needs SMS-WC opt-ins to perform)
 *   - Abandoned Cart third (highest-ROI single flow; needs Klaviyo
 *     flows already wired)
 *   - Post-Purchase Upsell fourth (needs AC-recovered revenue + saved
 *     payment methods to work)
 *   - PDP A/B fifth (CRO; needs analytics wired)
 *   - Checkout Audit sixth (CRO; needs PDP fix-list implemented first
 *     so checkout conversions don't pretend the worst leaks)
 *   - Loyalty seventh (needs Post-Purchase upsell data + segments)
 *   - Subscription eighth (needs Loyalty infrastructure)
 *   - Attribution-Alert ninth (needs attribution quality baseline)
 *   - 3PL tenth (needs order volume from all prior flows)
 *
 * Collision detection:
 *   - Two SMS-touches in the same week → "Klaviyo-SMS collision" warning
 *   - Two Klaviyo-flow-builds in the same week → "Klaviyo collision"
 *   - Same-week builds of > 2 instruments → "staff-constraint collision"
 *
 * Combined ROI:
 *   - netMarginPerYear / totalSendCostPerYear across all moves that
 *     have saved inputs (otherwise the operator's first visit shows
 *     industry-default ROI).
 *   - health band = "great" if >=30:1; "good" if >=15:1; "marginal" if
 *     >=5:1; "weak" otherwise.
 *
 * Pure — no DOM, no localStorage side effects (those live in the
 * component layer).
 */

import type { YourStoreInputs } from "./your-store";
import { YOUR_STORE_DEFAULTS } from "./your-store";

// ─────────────────────────────────────────────────────────────────
// Catalog entry — every supported move
// ─────────────────────────────────────────────────────────────────

export interface RolloutCatalogEntry {
  /** Stable id used in localStorage + .ics UID */
  id: string;
  /** Display title (used in the gantt chart + checklist) */
  title: string;
  /** Move # reference (e.g. "#1", "#6") for the header */
  moveRef: string;
  /** Storage key for the per-move calculator inputs */
  storageKey: string;
  /** Category — drives collision detection rules */
  category:
    | "sms-list-growth"
    | "klaviyo-email-flow"
    | "klaviyo-sms-flow"
    | "cro-experiment"
    | "cro-audit"
    | "loyalty-program"
    | "subscription-program"
    | "attribution-instrumentation"
    | "ops-3pl"
    | "post-purchase-upsell"
    | "affiliate-program";
  /** Canonical Phase — week 1 = foundation, week 4 = CRO, etc. */
  buildPhase: 1 | 2 | 3 | 4;
  /** Walk order within phase (lower runs first) */
  phaseOrder: number;
  /** Total days the move's launch plan consumes (typically 30) */
  durationDays: number;
  /** What goes on the .ics SUMMARY */
  icsSummary: (inputs: unknown) => string;
  /** Industry-default Year-1 net ROI ratio (used if no inputs saved) */
  defaultYear1RoiRatio: number;
  /** Industry-default Year-1 net margin (USD; used if no inputs saved) */
  defaultYear1NetMarginUsd: number;
  /** Industry-default Year-1 total cost (USD; used if no inputs saved) */
  defaultYear1CostUsd: number;
}

// Catalog — drives the build order + collision detection.
// `defaultYear1*` values come from the canonical playbook benchmarks
// (Klaviyo, Postscript, Baymard, Triple Whale, Shopify reports).
export const ROLLOUT_CATALOG: RolloutCatalogEntry[] = [
  {
    id: "sms-wc",
    title: "SMS-Welcome-Cart Flow (Postscript + Klaviyo)",
    moveRef: "#6",
    storageKey: "ecom-ops:playbooks:sms-wc-roi:v1",
    category: "klaviyo-sms-flow",
    buildPhase: 1,
    phaseOrder: 1,
    durationDays: 30,
    icsSummary: () => "SMS-WC launch — Klaviyo + Postscript",
    defaultYear1RoiRatio: 18.0,
    defaultYear1NetMarginUsd: 54000,
    defaultYear1CostUsd: 3000,
  },
  {
    id: "welcome-series",
    title: "Welcome Series (Klaviyo)",
    moveRef: "#3",
    storageKey: "ecom-ops:playbooks:ws-roi:v1",
    category: "klaviyo-email-flow",
    buildPhase: 1,
    phaseOrder: 2,
    durationDays: 30,
    icsSummary: () => "Welcome Series launch — Klaviyo",
    defaultYear1RoiRatio: 12.0,
    defaultYear1NetMarginUsd: 84000,
    defaultYear1CostUsd: 7000,
  },
  {
    id: "abandoned-cart",
    title: "Abandoned-Cart Flow (Klaviyo + Postscript)",
    moveRef: "#1",
    storageKey: "ecom-ops:playbooks:ac-roi:v1",
    category: "klaviyo-email-flow",
    buildPhase: 2,
    phaseOrder: 1,
    durationDays: 30,
    icsSummary: () => "Abandoned-Cart launch — Klaviyo + Postscript",
    defaultYear1RoiRatio: 35.0,
    defaultYear1NetMarginUsd: 175000,
    defaultYear1CostUsd: 5000,
  },
  {
    id: "post-purchase-upsell",
    title: "Post-Purchase Upsell (Klaviyo + Recharge / Appstle)",
    moveRef: "#9.6",
    storageKey: "ecom-ops:playbooks:ppu-roi:v1",
    category: "post-purchase-upsell",
    buildPhase: 2,
    phaseOrder: 2,
    durationDays: 30,
    icsSummary: () => "Post-Purchase Upsell launch — Klaviyo + Recharge",
    defaultYear1RoiRatio: 9.0,
    defaultYear1NetMarginUsd: 45000,
    defaultYear1CostUsd: 5000,
  },
  {
    id: "pdp-ab",
    title: "PDP A/B Test (VWO / Dynamic Yield / Optimizely)",
    moveRef: "#9.5",
    storageKey: "ecom-ops:playbooks:pdp-ab:v1",
    category: "cro-experiment",
    buildPhase: 3,
    phaseOrder: 1,
    durationDays: 30,
    icsSummary: () => "PDP A/B launch — VWO / Dynamic Yield",
    defaultYear1RoiRatio: 22.0,
    defaultYear1NetMarginUsd: 110000,
    defaultYear1CostUsd: 5000,
  },
  {
    id: "checkout-audit",
    title: "Baymard Checkout Audit Implementation (24 guidelines)",
    moveRef: "#3",
    storageKey: "ecom-ops:cro:checkout-audit:v1",
    category: "cro-audit",
    buildPhase: 3,
    phaseOrder: 2,
    durationDays: 30,
    icsSummary: () => "Checkout Audit fix — Baymard 24 guidelines",
    defaultYear1RoiRatio: 16.0,
    defaultYear1NetMarginUsd: 80000,
    defaultYear1CostUsd: 5000,
  },
  {
    id: "loyalty",
    title: "Loyalty Program (Smile.io / LoyaltyLion / Yotpo)",
    moveRef: "#8",
    storageKey: "ecom-ops:playbooks:loyalty-roi:v1",
    category: "loyalty-program",
    buildPhase: 4,
    phaseOrder: 1,
    durationDays: 30,
    icsSummary: () => "Loyalty Program launch — Smile.io",
    defaultYear1RoiRatio: 11.0,
    defaultYear1NetMarginUsd: 77000,
    defaultYear1CostUsd: 7000,
  },
  {
    id: "subscription",
    title: "Subscription Program (Recharge / Skio / Stay AI)",
    moveRef: "#11",
    storageKey: "ecom-ops:subscription-path:v1",
    category: "subscription-program",
    buildPhase: 4,
    phaseOrder: 2,
    durationDays: 30,
    icsSummary: () => "Subscription Program launch — Recharge",
    defaultYear1RoiRatio: 8.3,
    defaultYear1NetMarginUsd: 124500,
    defaultYear1CostUsd: 15000,
  },
  {
    id: "attribution-alert",
    title: "Attribution-Health Alert Webhook (Move #6.10)",
    moveRef: "#6.10",
    storageKey: "ecom-ops:playbooks:attribution-alert:v1",
    category: "attribution-instrumentation",
    buildPhase: 4,
    phaseOrder: 3,
    durationDays: 30,
    icsSummary: () => "Attribution-Alert webhook launch — Move #6.10",
    defaultYear1RoiRatio: 105.0,
    defaultYear1NetMarginUsd: 105000,
    defaultYear1CostUsd: 1000,
  },
  {
    id: "3pl",
    title: "3PL Fulfillment Migration (ShipBob / ShipMonk / ShipHero)",
    moveRef: "#52",
    storageKey: "ecom-ops:playbooks:threepl:v1",
    category: "ops-3pl",
    buildPhase: 4,
    phaseOrder: 4,
    durationDays: 30,
    icsSummary: () => "3PL Migration — ShipBob / ShipMonk",
    defaultYear1RoiRatio: 5.0,
    defaultYear1NetMarginUsd: 50000,
    defaultYear1CostUsd: 10000,
  },
  {
    id: "affiliate-program",
    title: "Affiliate Program (Refersion / Levanta / Impact)",
    moveRef: "#16",
    storageKey: "ecom-ops:affiliate-path:v1",
    category: "affiliate-program",
    buildPhase: 4,
    phaseOrder: 5,
    durationDays: 30,
    icsSummary: () => "Affiliate Program launch — Refersion / Levanta",
    defaultYear1RoiRatio: 6.0,
    defaultYear1NetMarginUsd: 144000,
    defaultYear1CostUsd: 24000,
  },
];

// ─────────────────────────────────────────────────────────────────
// Inputs / Outputs
// ─────────────────────────────────────────────────────────────────

export interface RolloutMoveInputs {
  /** Move id (matches RolloutCatalogEntry.id) */
  id: string;
  /** Whether the operator has actually saved calculator inputs */
  hasInputs: boolean;
  /** Per-move Year-1 ROI ratio (netMargin / totalCost). 0 if not yet run. */
  year1RoiRatio: number;
  /** Per-move Year-1 net margin (USD). 0 if not yet run. */
  year1NetMarginUsd: number;
  /** Per-move Year-1 total cost (USD). 0 if not yet run. */
  year1CostUsd: number;
}

export interface ScheduledRolloutMove extends RolloutCatalogEntry {
  /** Start day in the 90-day window (1-indexed) */
  startDay: number;
  /** End day in the 90-day window (1-indexed, capped at 90) */
  endDay: number;
  /** Inputs sourced from the per-move calculator (or null) */
  inputs: RolloutMoveInputs | null;
  /** Week bucket used for collision detection (1-indexed, 1..13) */
  weekBucket: number;
}

export interface RolloutCollision {
  week: number;
  weekStartDate: string;
  weekEndDate: string;
  moveIds: string[];
  /** What kind of collision */
  kind:
    | "klaviyo-sms-collision"
    | "klaviyo-email-collision"
    | "staff-constraint-collision";
  severity: "info" | "warn" | "block";
  message: string;
}

export interface RolloutSnapshot {
  generatedAt: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  /** Number of moves included in the 90-day calendar */
  movesCount: number;
  /** Number of moves with actually-saved inputs (rest are industry defaults) */
  movesWithInputsCount: number;
  /** Sum of all Year-1 net margin across all included moves */
  combinedYear1NetMarginUsd: number;
  /** Sum of all Year-1 total cost across all included moves */
  combinedYear1CostUsd: number;
  /** Combined ROI ratio */
  combinedYear1RoiRatio: number;
  /** Health band for the combined ROI */
  combinedHealthBand:
    | "great"
    | "good"
    | "marginal"
    | "weak"
    | "zero-cost";
  /** Whether the operator's Your-store inputs are present */
  hasYourStoreInputs: boolean;
  /** The Your-store inputs used (defaults if none saved) */
  yourStore: YourStoreInputs;
}

export interface MasterRolloutCalendarPayload {
  snapshot: RolloutSnapshot;
  moves: ScheduledRolloutMove[];
  collisions: RolloutCollision[];
}

// ─────────────────────────────────────────────────────────────────
// Helpers — date math + collision rules
// ─────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Foundation — list growth + welcome",
  2: "Revenue capture — abandon + upsell",
  3: "CRO — PDP test + checkout audit",
  4: "Retention + ops — loyalty, sub, attribution, 3PL",
};

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function ymdWeekBucket(ymd: string, startYmd: string): number {
  // Returns 1-indexed week number (week 1 = startYmd..startYmd+6)
  const [y, m, d] = ymd.split("-").map(Number);
  const [sy, sm, sd] = startYmd.split("-").map(Number);
  const date = Date.UTC(y, m - 1, d);
  const start = Date.UTC(sy, sm - 1, sd);
  return Math.floor((date - start) / (7 * 24 * 3600 * 1000)) + 1;
}

function collisionKind(
  moves: ScheduledRolloutMove[]
): "info" | "warn" | "block" {
  const cats = new Set(moves.map((m) => m.category));
  // Two SMS touches in same week → Klaviyo-SMS collision (warn)
  if (cats.has("klaviyo-sms-flow") && moves.length >= 2 && cats.size > 1) {
    return "warn";
  }
  // Two Klaviyo-email-flow builds in same week → Klaviyo collision (warn)
  const emailCount = moves.filter(
    (m) => m.category === "klaviyo-email-flow"
  ).length;
  if (emailCount >= 2) return "warn";
  // 3+ builds in same week → staff-constraint collision (block)
  if (moves.length >= 3) return "block";
  return "info";
}

function collisionMessage(
  kind: RolloutCollision["kind"],
  moves: ScheduledRolloutMove[]
): string {
  const titles = moves.map((m) => m.title.split(" (")[0]).join(" + ");
  switch (kind) {
    case "klaviyo-sms-collision":
      return `${titles} touch Klaviyo-SMS in the same week — sequence the Postscript config + segment build sequentially (run the build with smaller audience first).`;
    case "klaviyo-email-collision":
      return `${titles} both build Klaviyo email flows in the same week — sequence the Klaviyo flow-edit work (the longer flow first, shorter one after).`;
    case "staff-constraint-collision":
      return `${moves.length} instrument builds land in the same week (${titles}) — split the staff or compress to 2 concurrent builds max.`;
  }
}

// ─────────────────────────────────────────────────────────────────
// The generator
// ─────────────────────────────────────────────────────────────────

/**
 * Build a 90-day multi-move master rollout calendar.
 *
 * @param startDate Operator's chosen Day-1 (YYYY-MM-DD)
 * @param yourStore Your-store inputs (from /cross-page-intel)
 * @param moveInputsByStorageKey Map of `localStorage` JSON-parsed inputs by storage key. The component layer reads these. Undefined entries fall through to the catalog's industry defaults.
 */
export function buildMasterRolloutCalendar(
  startDate: string,
  yourStore: YourStoreInputs | null,
  moveInputsByStorageKey: Record<string, RolloutMoveInputs | undefined>
): MasterRolloutCalendarPayload {
  const your = yourStore ?? YOUR_STORE_DEFAULTS;
  const endDate = ymdAddDays(startDate, 89);
  const generatedAt = new Date().toISOString();

  // 1. Schedule each catalog entry in canonical build order, walking
  //    day-by-day and skipping days that have another move scheduled.
  //    We pin phases back-to-back (foundation → revenue → CRO → retention)
  //    and within each phase use phaseOrder.
  const sortedCatalog = [...ROLLOUT_CATALOG].sort((a, b) => {
    if (a.buildPhase !== b.buildPhase)
      return a.buildPhase - b.buildPhase;
    return a.phaseOrder - b.phaseOrder;
  });

  const moves: ScheduledRolloutMove[] = [];
  let cursorDay = 1;
  for (const entry of sortedCatalog) {
    const startDay = cursorDay;
    const endDay = Math.min(startDay + entry.durationDays - 1, 90);
    const startYmd = ymdAddDays(startDate, startDay - 1);
    const weekBucket = ymdWeekBucket(startYmd, startDate);
    const inputs =
      moveInputsByStorageKey[entry.storageKey] ?? null;
    moves.push({
      ...entry,
      startDay,
      endDay,
      weekBucket,
      inputs,
    });
    cursorDay = endDay + 1;
    if (cursorDay > 90) break;
  }

  // 2. Detect collisions by weekBucket.
  const byWeek = new Map<number, ScheduledRolloutMove[]>();
  for (const m of moves) {
    const bucket = byWeek.get(m.weekBucket) ?? [];
    bucket.push(m);
    byWeek.set(m.weekBucket, bucket);
  }

  const collisions: RolloutCollision[] = [];
  for (const [week, wmoves] of byWeek.entries()) {
    if (wmoves.length < 2) continue;
    const weekStartDate = ymdAddDays(startDate, (week - 1) * 7);
    const weekEndDate = ymdAddDays(weekStartDate, 6);
    const cats = new Set(wmoves.map((m) => m.category));
    let kind: RolloutCollision["kind"] = "klaviyo-email-collision";
    if (wmoves.length >= 3) {
      kind = "staff-constraint-collision";
    } else if (cats.has("klaviyo-sms-flow")) {
      kind = "klaviyo-sms-collision";
    } else if (
      wmoves.filter((m) => m.category === "klaviyo-email-flow").length >= 2
    ) {
      kind = "klaviyo-email-collision";
    } else {
      kind = "klaviyo-email-collision";
    }
    const severity = collisionKind(wmoves);
    collisions.push({
      week,
      weekStartDate,
      weekEndDate,
      moveIds: wmoves.map((m) => m.id),
      kind,
      severity,
      message: collisionMessage(kind, wmoves),
    });
  }

  // 3. Combined ROI.
  let totalMargin = 0;
  let totalCost = 0;
  let movesWithInputsCount = 0;
  for (const m of moves) {
    const margin = m.inputs?.hasInputs
      ? m.inputs.year1NetMarginUsd
      : m.defaultYear1NetMarginUsd;
    const cost = m.inputs?.hasInputs
      ? m.inputs.year1CostUsd
      : m.defaultYear1CostUsd;
    totalMargin += margin;
    totalCost += cost;
    if (m.inputs?.hasInputs) movesWithInputsCount += 1;
  }
  const combinedYear1RoiRatio = totalCost > 0 ? totalMargin / totalCost : 0;
  const combinedBand = combinedHealthBand(combinedYear1RoiRatio);

  return {
    snapshot: {
      generatedAt,
      startDate,
      endDate,
      totalDays: 90,
      movesCount: moves.length,
      movesWithInputsCount,
      combinedYear1NetMarginUsd: totalMargin,
      combinedYear1CostUsd: totalCost,
      combinedYear1RoiRatio,
      combinedHealthBand: combinedBand,
      hasYourStoreInputs: yourStore !== null,
      yourStore: your,
    },
    moves,
    collisions,
  };
}

function combinedHealthBand(
  r: number
): "great" | "good" | "marginal" | "weak" | "zero-cost" {
  if (!Number.isFinite(r) || r === 0) return "zero-cost";
  if (r >= 30) return "great";
  if (r >= 15) return "good";
  if (r >= 5) return "marginal";
  return "weak";
}

// ─────────────────────────────────────────────────────────────────
// Markdown — paste-ready checklist grouped by week
// ─────────────────────────────────────────────────────────────────

export function masterRolloutCalendarToMarkdown(
  payload: MasterRolloutCalendarPayload
): string {
  const { snapshot, moves, collisions } = payload;
  const fmtUsd = (n: number) =>
    `$${Math.round(n).toLocaleString("en-US")}`;
  const fmtRoi = (r: number) =>
    Number.isFinite(r) ? `${r.toFixed(1)}:1` : "—";

  const lines: string[] = [];
  lines.push(`# Master Rollout Calendar — 90 days`);
  lines.push("");
  lines.push(`Generated ${snapshot.generatedAt.slice(0, 16).replace("T", " ")} UTC`);
  lines.push(`Window: **${snapshot.startDate} → ${snapshot.endDate}**`);
  lines.push("");
  lines.push(`## Snapshot`);
  lines.push("");
  lines.push(
    `- **Moves scheduled:** ${snapshot.movesCount} (${snapshot.movesWithInputsCount} with saved calculator inputs)`
  );
  lines.push(`- **Combined Year-1 net margin:** ${fmtUsd(snapshot.combinedYear1NetMarginUsd)}`);
  lines.push(`- **Combined Year-1 total cost:** ${fmtUsd(snapshot.combinedYear1CostUsd)}`);
  lines.push(`- **Combined Year-1 ROI:** ${fmtRoi(snapshot.combinedYear1RoiRatio)} (${snapshot.combinedHealthBand})`);
  if (snapshot.hasYourStoreInputs) {
    lines.push(
      `- **Your-store:** AOV $${snapshot.yourStore.aov}, ${snapshot.yourStore.monthlyOrders} orders/mo, ${Math.round(snapshot.yourStore.grossMargin * 100)}% margin`
    );
  } else {
    lines.push(
      `- **Your-store:** industry defaults (AOV $${YOUR_STORE_DEFAULTS.aov}, ${YOUR_STORE_DEFAULTS.monthlyOrders} orders/mo, ${Math.round(YOUR_STORE_DEFAULTS.grossMargin * 100)}% margin) — visit Overview to personalize`
    );
  }
  lines.push("");
  if (collisions.length > 0) {
    lines.push(`## Collisions detected`);
    lines.push("");
    for (const c of collisions) {
      lines.push(
        `- **[${c.severity.toUpperCase()}] Week ${c.week} (${c.weekStartDate} → ${c.weekEndDate}) — ${c.kind}:** ${c.message}`
      );
    }
    lines.push("");
  }

  // Per-phase groupings
  for (const phase of [1, 2, 3, 4] as const) {
    const phaseMoves = moves.filter((m) => m.buildPhase === phase);
    if (phaseMoves.length === 0) continue;
    lines.push(`## Phase ${phase} — ${PHASE_LABELS[phase]}`);
    lines.push("");
    for (const m of phaseMoves) {
      const startYmd = ymdAddDays(snapshot.startDate, m.startDay - 1);
      const endYmd = ymdAddDays(snapshot.startDate, m.endDay - 1);
      const roi = m.inputs?.hasInputs
        ? fmtRoi(m.inputs.year1RoiRatio)
        : `${fmtRoi(m.defaultYear1RoiRatio)} (industry default — no saved inputs)`;
      const margin = m.inputs?.hasInputs
        ? fmtUsd(m.inputs.year1NetMarginUsd)
        : `${fmtUsd(m.defaultYear1NetMarginUsd)} (industry default)`;
      lines.push(
        `### Day ${m.startDay}–${m.endDay} (${startYmd} → ${endYmd}) — Move ${m.moveRef}: ${m.title}`
      );
      lines.push("");
      lines.push(`- **Duration:** ${m.durationDays} days`);
      lines.push(`- **Year-1 ROI:** ${roi}`);
      lines.push(`- **Year-1 net margin:** ${margin}`);
      lines.push(`- **Category:** ${m.category}`);
      lines.push(
        `- **Per-move plan:** open \`/playbooks\` and click "Generate 30-day launch plan" on the calculator for the full day-by-day checklist.`
      );
      lines.push("");
    }
  }

  lines.push(`---`);
  lines.push("");
  lines.push(
    `Generated by the Master Rollout Calendar — cross-page-intelligence across all 9 per-move launch-plan generators. Re-open this page any time to re-pull saved calculator inputs.`
  );
  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────
// RFC 5545 .ics — for Google / Apple / Outlook calendar import
// ─────────────────────────────────────────────────────────────────

const PROD_ID = "-//Ecommerce Ops//Master Rollout Calendar//EN";
const CALENDAR_NAME = "Master Rollout Calendar";

function fmtIcsLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}`;
}

function fmtIcsUtc(date: Date): string {
  return fmtIcsLocal(date) + "Z";
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Convert the master calendar to RFC 5545 .ics. One all-day event per
 * move (DTSTART;VALUE=DATE) so it shows up as a colored band in
 * Google / Apple / Outlook, not a 1-hour meeting block.
 */
export function masterRolloutCalendarToIcs(
  payload: MasterRolloutCalendarPayload
): string {
  const { snapshot, moves } = payload;
  const now = new Date();
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:${PROD_ID}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(`X-WR-CALNAME:${escapeIcsText(CALENDAR_NAME)}`);
  lines.push(`X-WR-CALDESC:${escapeIcsText(
    `Cross-page-intelligence 90-day rollout calendar across all ${snapshot.movesCount} per-move launch-plan generators (combined Year-1 ROI ${snapshot.combinedYear1RoiRatio.toFixed(1)}:1).`
  )}`);

  for (const m of moves) {
    const startYmd = ymdAddDays(snapshot.startDate, m.startDay - 1);
    const endYmd = ymdAddDays(snapshot.startDate, m.endDay);
    // DTEND is exclusive in RFC 5545 — add 1 day so the all-day event
    // covers the last day of the move.
    const startCompact = startYmd.replace(/-/g, "");
    const endCompact = endYmd.replace(/-/g, "");
    const roiText = m.inputs?.hasInputs
      ? `${m.inputs.year1RoiRatio.toFixed(1)}:1`
      : `${m.defaultYear1RoiRatio.toFixed(1)}:1 (industry default)`;
    const summary = `Move ${m.moveRef}: ${m.title.split(" (")[0]}`;
    const descLines = [
      `Move ${m.moveRef}: ${m.title}`,
      `Phase ${m.buildPhase}: ${PHASE_LABELS[m.buildPhase]}`,
      `Days ${m.startDay}-${m.endDay} of 90 (${startYmd} → ${ymdAddDays(snapshot.startDate, m.endDay - 1)})`,
      `Year-1 ROI: ${roiText}`,
      `Year-1 net margin: $${Math.round(
        m.inputs?.hasInputs ? m.inputs.year1NetMarginUsd : m.defaultYear1NetMarginUsd
      ).toLocaleString("en-US")}`,
      `Category: ${m.category}`,
      `Per-move checklist: open /playbooks and click "Generate 30-day launch plan" on the calculator.`,
    ];
    const description = descLines.join("\\n");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:master-rollout-${m.id}@ecommerce-ops`);
    lines.push(`DTSTAMP:${fmtIcsUtc(now)}`);
    lines.push(`DTSTART;VALUE=DATE:${startCompact}`);
    lines.push(`DTEND;VALUE=DATE:${endCompact}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  // RFC 5545 requires CRLF line endings; many parsers tolerate LF but
  // Google Calendar is strict.
  return lines.join("\r\n") + "\r\n";
}

/**
 * Format `ymdAddDays` re-export for callers.
 */
export { ymdAddDays };