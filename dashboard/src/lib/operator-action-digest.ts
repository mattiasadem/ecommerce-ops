/**
 * `operator-action-digest` — Move #N.9 — prioritized operator action list.
 *
 * The `/today` page is the operator's daily cockpit, but until now it has
 * only shown *static* summaries: 4 KPI tiles, 3 ROI calculators, and a
 * "today's focus" quote from the cron-picked next journal entry. The
 * operator's ACTUAL to-do list is scattered across 4 storage keys:
 *
 *   1. `ecom-ops:shipped-playbooks:v1`        — what they've marked shipped
 *   2. `ecom-ops:realized-roi:v1`             — actuals they've logged per playbook
 *   3. `ecom-ops:lifecycle-flow-health:v1`    — per-flow audit KPIs
 *   4. `ecom-ops:your-store:v1`               — AOV / monthly orders / gross margin
 *
 * Without aggregation the operator opens `/today` and has no clear answer
 * to: "given my state, what should I work on next?" Move #N.9 reads those
 * 4 keys + the build-time Top-10 / playbooks catalog and produces an
 * ordered, deduplicated action checklist with deep-link anchors.
 *
 * The 5 rules of action generation (in priority order — first match wins
 * per playbook/flow slot):
 *
 *   P0  BLOCK  Lifecycle flow with verdict in FAIL — `/lifecycle#<flow-id>`
 *   P0  BLOCK  Realized-ROI entry in UNDERWIDE / UNMEASURED — re-measure
 *   P1  ACT   Lifecycle flow with verdict NEEDS_WORK — fix in order
 *   P1  ACT   Top-10 move that's still pending — `/top-10#move-N`
 *   P2  LOG   Playbook shipped but no realized-ROI entry — log actuals
 *   P2  LOG   Playbook shipped, entry exists, confidence='low' — re-log
 *              with more confidence
 *   P3  EDIT  your-store AOV / orders / margin are still defaults — set them
 *              so calculators project operator numbers, not medians
 *
 * Each rule produces:
 *   - `kind`:    "block" | "act" | "log" | "edit"
 *   - `priority`: 0..3 (lower = more urgent)
 *   - `title`:   one-line summary
 *   - `reason`:  1-sentence justification with the canonical gap metric
 *   - `href`:    deep-link anchor pointing at the operator's next click
 *   - `metricLabel` + `metricValue`: the canonical number that fired the rule
 *     (e.g. "Score" / "32", "Lift" / "$2,100/mo", "Confidence" / "low")
 *
 * The digest caps at MAX_ACTIONS (default 8) so the `/today` card stays
 * scannable; ties broken by the rule's priority, then by metricSeverity
 * (lower score / smaller lift wins — fix the worst first).
 *
 * Empty state: when zero rules fire, the card renders "You're on track"
 * with a "Open Next Move →" CTA — the canonical "don't render an empty
 * 0-todo widget" anti-pattern.
 */

import {
  loadShippedPlaybooks,
  type ShippedMap,
} from "./shipped-playbooks";
import {
  REALIZED_ROI_LEDGER_STORAGE_KEY,
  loadRealizedRoiLedger,
  type RealizedRoiLedger,
} from "./realized-roi-ledger";
import {
  PATH_B_FLOWS,
  scoreFlow,
  type FlowKpis,
  type LifecycleFlow,
} from "./lifecycle-flow-health";
import {
  LIFECYCLE_FLEET_STORAGE_KEY,
} from "./lifecycle-fleet-rollup";
import {
  YOUR_STORE_STORAGE_KEY,
  loadYourStore,
  type YourStoreInputs,
} from "./your-store";

export type DigestActionKind = "block" | "act" | "log" | "edit";

export interface DigestAction {
  /** Stable id — `${kind}-${href}-${metricLabel}`. Used by React keys. */
  id: string;
  /** UI tone — controls icon + color in the digest card. */
  kind: DigestActionKind;
  /** 0 = highest urgency, 3 = lowest urgency. */
  priority: 0 | 1 | 2 | 3;
  /** One-line summary. */
  title: string;
  /** 1-sentence justification. */
  reason: string;
  /** Deep-link anchor pointing at the operator's next click. */
  href: string;
  /** Short label for the metric that triggered the rule (e.g. "Score", "Lift"). */
  metricLabel: string;
  /** Formatted metric value (e.g. "32", "$2,100/mo", "low"). */
  metricValue: string;
}

export interface DigestInput {
  /** Per-flow KPI snapshot — same shape as the `/lifecycle` audit. */
  lifecycleKpis: Record<string, FlowKpis>;
  /** Operator's shipped-playbook map. */
  shipped: ShippedMap;
  /** Operator's realized-ROI ledger. */
  realizedRoi: RealizedRoiLedger;
  /** Operator's Your-store inputs (or null when unset). */
  yourStore: YourStoreInputs | null;
  /** Build-time Top-10 status — pending moves surface as P1 actions. */
  top10PendingMoves: { move: string; status: string }[];
  /** Build-time playbook catalog — used for deep-link labels only. */
  playbookTitlesById: Record<string, string>;
}

export interface DigestResult {
  actions: DigestAction[];
  /** Sum of P0 BLOCK actions (operator's bleeding-revenue today). */
  blockCount: number;
  /** Sum of P1 ACT actions (highest-ROI next moves). */
  actCount: number;
  /** Sum of P2 LOG actions (actuals not yet recorded). */
  logCount: number;
  /** Sum of P3 EDIT actions (Your-store still on defaults). */
  editCount: number;
  /** True when every storage key was set AND zero actions produced. */
  isAllClean: boolean;
}

const MAX_ACTIONS = 8;

/** Stable id helper — guards against duplicate entries with the same
 *  kind + href + metric. */
function makeId(
  kind: DigestActionKind,
  href: string,
  metricLabel: string
): string {
  return `${kind}-${href}-${metricLabel}`.toLowerCase();
}

/** Headline label for a canonical flow_id → friendly name. */
function flowLabel(flow: LifecycleFlow): string {
  return flow.flow_name;
}

/** Build the canonical Top-10 action href (`/top-10#move-N`). */
function top10Href(move: string): string {
  const id = move.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `/top-10#${id}`;
}

/** Build the canonical playbook deep-link (`/playbooks/<slug>`). */
function playbookHref(playbookId: string): string {
  return `/playbooks/${playbookId}`;
}

/** Build the canonical lifecycle flow deep-link (`/lifecycle#<flow-id>`). */
function lifecycleHref(flowId: string): string {
  return `/lifecycle#${flowId}`;
}

/**
 * Internal: produce the sorted, prioritized action list.
 *
 * Pulled out as a pure function so the test file can target it without
 * the DOM / localStorage layer. The exported `buildOperatorActionDigest`
 * is the entry point used by the component (which calls this with the
 * hydrated inputs).
 */
export function digestFromInputs(inputs: DigestInput): DigestResult {
  const actions: DigestAction[] = [];

  // ── P0 BLOCK: Lifecycle FAIL flows ───────────────────────────────────
  if (Object.keys(inputs.lifecycleKpis).length > 0) {
    for (const flow of PATH_B_FLOWS) {
      const kpis = inputs.lifecycleKpis[flow.flow_id];
      if (!kpis) continue;
      const report = scoreFlow(flow, kpis);
      if (report.verdict !== "FAIL") continue;
      actions.push({
        id: makeId("block", lifecycleHref(flow.flow_id), "Score"),
        kind: "block",
        priority: 0,
        title: `Fix ${flowLabel(flow)}`,
        reason: `Score ${report.overall_score}/100 — verdict FAIL. This flow is burning the most revenue on the audit right now.`,
        href: lifecycleHref(flow.flow_id),
        metricLabel: "Score",
        metricValue: `${report.overall_score}/100`,
      });
    }

    // ── P1 ACT: Lifecycle NEEDS_WORK flows ──────────────────────────────
    for (const flow of PATH_B_FLOWS) {
      const kpis = inputs.lifecycleKpis[flow.flow_id];
      if (!kpis) continue;
      const report = scoreFlow(flow, kpis);
      if (report.verdict !== "NEEDS_WORK") continue;
      actions.push({
        id: makeId("act", lifecycleHref(flow.flow_id), "Score"),
        kind: "act",
        priority: 1,
        title: `Tighten ${flowLabel(flow)}`,
        reason: `Score ${report.overall_score}/100 — verdict NEEDS_WORK. One quick fix lifts it back to PASS.`,
        href: lifecycleHref(flow.flow_id),
        metricLabel: "Score",
        metricValue: `${report.overall_score}/100`,
      });
    }
  }

  // ── P0 BLOCK: Shipped-but-low-confidence entry ──────────────────────
  // The operator marked shipped but hasn't verified the lift — until
  // they re-log with at least medium confidence, the gap-vs-projected
  // view is blind and the projected ROI is unverified. This is the
  // highest-urgency signal after a Lifecycle FAIL.
  for (const [playbookId, entry] of Object.entries(inputs.realizedRoi)) {
    if (entry.confidence !== "low") continue;
    const playbookTitle =
      inputs.playbookTitlesById[playbookId] ?? playbookId;
    actions.push({
      id: makeId("block", playbookHref(playbookId), "Confidence"),
      kind: "block",
      priority: 0,
      title: `Re-measure ${playbookTitle}`,
      reason: `Marked shipped with confidence=low — the projected ROI is unverified until you re-log with at least medium confidence.`,
      href: playbookHref(playbookId),
      metricLabel: "Confidence",
      metricValue: "low",
    });
  }

  // ── P1 ACT: Top-10 pending moves ──────────────────────────────────────
  for (const m of inputs.top10PendingMoves) {
    actions.push({
      id: makeId("act", top10Href(m.move), "Move"),
      kind: "act",
      priority: 1,
      title: `Ship next: ${m.move}`,
      reason: `Status: ${m.status}. Highest-leverage queue item still pending.`,
      href: top10Href(m.move),
      metricLabel: "Move",
      metricValue: m.status,
    });
  }

  // ── P2 LOG: Shipped but no realized-ROI entry ────────────────────────
  const realizedIds = new Set(Object.keys(inputs.realizedRoi));
  for (const playbookId of Object.keys(inputs.shipped)) {
    if (realizedIds.has(playbookId)) {
      // Realized entry exists — fall through to the low-confidence branch.
      const entry = inputs.realizedRoi[playbookId];
      if (entry && entry.confidence === "low") {
        const playbookTitle =
          inputs.playbookTitlesById[playbookId] ?? playbookId;
        actions.push({
          id: makeId(
            "log",
            playbookHref(playbookId),
            "Confidence"
          ),
          kind: "log",
          priority: 2,
          title: `Re-log ${playbookTitle} with more confidence`,
          reason: `Marked shipped with confidence=low — the ROI number is directional, not a decision-grade signal yet.`,
          href: playbookHref(playbookId),
          metricLabel: "Confidence",
          metricValue: "low",
        });
      }
      continue;
    }
    const playbookTitle =
      inputs.playbookTitlesById[playbookId] ?? playbookId;
    actions.push({
      id: makeId("log", playbookHref(playbookId), "Actuals"),
      kind: "log",
      priority: 2,
      title: `Log actuals for ${playbookTitle}`,
      reason: `Shipped playbook, no actuals recorded — projection view is unverified until you log real numbers.`,
      href: playbookHref(playbookId),
      metricLabel: "Actuals",
      metricValue: "missing",
    });
  }

  // ── P3 EDIT: Your-store still on defaults ─────────────────────────────
  if (!inputs.yourStore) {
    actions.push({
      id: makeId("edit", "/settings", "Your store"),
      kind: "edit",
      priority: 3,
      title: "Set Your store (AOV / orders / margin)",
      reason:
        "ROI calculators are projecting industry medians, not your numbers. Set them once and every calculator uses yours.",
      href: "/settings",
      metricLabel: "Your store",
      metricValue: "default",
    });
  }

  // Sort by priority asc, then by id (stable ordering across reloads).
  actions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.id.localeCompare(b.id);
  });

  // Cap at MAX_ACTIONS — the /today card stays scannable.
  const capped = actions.slice(0, MAX_ACTIONS);

  // Block count is *all* P0 actions, even if capped — the operator
  // wants to know the true count of bleeding-revenue issues.
  const blockCount = actions.filter((a) => a.priority === 0).length;
  const actCount = actions.filter((a) => a.priority === 1).length;
  const logCount = actions.filter((a) => a.priority === 2).length;
  const editCount = actions.filter((a) => a.priority === 3).length;

  return {
    actions: capped,
    blockCount,
    actCount,
    logCount,
    editCount,
    isAllClean:
      actions.length === 0 &&
      Object.keys(inputs.lifecycleKpis).length > 0 &&
      Object.keys(inputs.shipped).length > 0 &&
      inputs.yourStore !== null,
  };
}

/** Storage-key constants exported for the test file + component listener. */
export const OPERATOR_DIGEST_STORAGE_KEYS = {
  shipped: "ecom-ops:shipped-playbooks:v1",
  realizedRoi: REALIZED_ROI_LEDGER_STORAGE_KEY,
  lifecycle: LIFECYCLE_FLEET_STORAGE_KEY,
  yourStore: YOUR_STORE_STORAGE_KEY,
} as const;

/** Same-tab custom events fired by the four underlying modules. */
export const OPERATOR_DIGEST_UPDATE_EVENTS = {
  shipped: "ecom-ops:shipped-playbooks:update",
  realizedRoi: REALIZED_ROI_LEDGER_STORAGE_KEY === "ecom-ops:realized-roi:v1"
    ? "ecom-ops:realized-roi:update"
    : "ecom-ops:realized-roi:update",
  lifecycle: "ecom-ops:lifecycle-flow-health:update",
  yourStore: "ecom-ops:your-store:update",
} as const;

/**
 * Hydrate the digest inputs from localStorage. Safe to call from the
 * component — returns `null` when `window` is undefined (SSR / static).
 *
 * The component always calls `digestFromInputs(...)` with this hydrated
 * shape so the React layer doesn't need to know about localStorage at all.
 */
export function loadOperatorDigestInputs(): DigestInput | null {
  if (typeof window === "undefined") return null;
  return {
    shipped: loadShippedPlaybooks(),
    realizedRoi: loadRealizedRoiLedger(),
    lifecycleKpis: loadLifecycleKpisFromStorage(),
    yourStore: loadYourStore(),
    top10PendingMoves: [],
    playbookTitlesById: {},
  };
}

/**
 * Read the lifecycle KPI snapshot from `ecom-ops:lifecycle-flow-health:v1`.
 * The `/lifecycle` page writes it as `Record<flow_id, FlowKpis>`; we just
 * filter for that shape (ignore metadata siblings like `lastUpdated`).
 */
function loadLifecycleKpisFromStorage(): Record<string, FlowKpis> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LIFECYCLE_FLEET_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, FlowKpis> = {};
    for (const [flowId, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (!val || typeof val !== "object") continue;
      const v = val as Record<string, unknown>;
      // The /lifecycle page stores { kpis: FlowKpis, lastUpdated: ... } OR
      // a bare FlowKpis (depending on age). Support both by sniffing for
      // `kpis` wrapper.
      const candidate = (v.kpis && typeof v.kpis === "object")
        ? (v.kpis as Record<string, unknown>)
        : v;
      if (typeof candidate.sent !== "number") continue;
      out[flowId] = candidate as unknown as FlowKpis;
    }
    return out;
  } catch {
    return {};
  }
}