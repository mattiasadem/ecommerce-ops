/**
 * `lifecycle-flow-export` — pure-logic builders for a single CSV / JSON
 * bundle containing every Path-B lifecycle-flow KPI snapshot + per-gate
 * verdict + score + operator copy-paste handoff row.
 *
 * Closes the operator's "I want one CSV with all 13 flow audits in it" loop.
 * The `<LifecycleFlowHealthAudit />` component on `/lifecycle` already
 * exposes the per-flow verdicts + scores inline + a copy-markdown button,
 * but an operator building a fleet-wide Klaviyo audit spreadsheet wants
 * ALL 13 flows + ALL 6 gates × N flows gate pass/fail in ONE file so they
 * can pivot across flows without copy-pasting between per-flow markdown
 * blocks.
 *
 * CSV layout (analogous to channel-benchmark-export):
 *   - metadata header block (schema, version, exportedAt, source)
 *   - 1 blank line
 *   - canonical column header row
 *   - per-flow row in canonical order (PATH_B_FLOWS order)
 *   - empty placeholder rows for flows that have not been scored
 *
 * JSON layout — see `LifecycleFlowExportPayload` below. Same key set as
 * the CSV, just nested. Reuses the `FlowScore` shape from the existing
 * `lifecycle-flow-health` module so downstream consumers (dashboards,
 * other crons, CI quality gates) can compare against the in-memory
 * scores without schema-drift.
 *
 * Companion component: `dashboard/src/components/lifecycle-flow-export-button.tsx`.
 * Mounted on `dashboard/app/lifecycle/page.tsx` immediately after the
 * `<LifecycleFlowHealthAudit />` block. Pure data — no DOM, no
 * localStorage side effects. Inputs are the already-hydrated
 * `Record<flow_id, FlowKpis>` map the audit component reads from
 * `ecom-ops:lifecycle-flow-health:v1` on mount.
 */

import {
  PATH_B_FLOWS,
  type FlowKpis,
  type FlowScore,
  scoreFlow,
} from "./lifecycle-flow-health";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
export function csvEscape(value: string | number | undefined | null): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface LifecycleFlowExportMeta {
  /** ISO date stamp (YYYY-MM-DD). */
  exportedAt: string;
  /** Optional label override for the file name. */
  label?: string;
}

export interface LifecycleFlowCsvRow {
  flow_id: string;
  flow_name: string;
  pillar: string;
  tier: number | string;
  channel: string;
  scored: boolean;
  score: number | string;
  verdict: string;
  gates_passed: number | string;
  gates_failed: number | string;
  /** One column per gate: A_pass, B_pass, C_pass, D_pass, E_pass, F_pass — "pass" / "fail" / "n/a". */
  A_pass: string;
  B_pass: string;
  C_pass: string;
  D_pass: string;
  E_pass: string;
  F_pass: string;
  /** The KPI snapshot for the row (zeroed when not entered). */
  sent: number | string;
  opens: number | string;
  clicks: number | string;
  conversions: number | string;
  unsubscribes: number | string;
  revenue: number | string;
  flow_attributed: number | string;
}

const CSV_HEADERS: ReadonlyArray<keyof LifecycleFlowCsvRow> = [
  "flow_id",
  "flow_name",
  "pillar",
  "tier",
  "channel",
  "scored",
  "score",
  "verdict",
  "gates_passed",
  "gates_failed",
  "A_pass",
  "B_pass",
  "C_pass",
  "D_pass",
  "E_pass",
  "F_pass",
  "sent",
  "opens",
  "clicks",
  "conversions",
  "unsubscribes",
  "revenue",
  "flow_attributed",
];

/** Per-gate key → gate label (matched to canonical Gate A..F naming). */
export const GATE_KEYS = ["A", "B", "C", "D", "E", "F"] as const;
export type GateKey = (typeof GATE_KEYS)[number];

/**
 * Look up which gate a given failure row references by its `gate` field —
 * `evaluateGates` emits strings like `"A (open_rate)"`. We extract the
 * leading letter so the per-row CSV can show A_pass / B_pass / ... / F_pass.
 */
function gateLetter(gate: string): string | null {
  const m = /^([A-Z])\s*\(/.exec(gate);
  return m ? m[1] : null;
}

function rowFromScore(score: FlowScore, kpis: FlowKpis): LifecycleFlowCsvRow {
  const passes: Record<GateKey, "pass" | "fail"> = {
    A: "fail",
    B: "fail",
    C: "fail",
    D: "fail",
    E: "fail",
    F: "fail",
  };
  for (const failed of score.failed_gates) {
    const letter = gateLetter(failed.gate);
    if (letter && (GATE_KEYS as readonly string[]).includes(letter)) {
      passes[letter as GateKey] = "fail";
    }
  }
  for (const k of GATE_KEYS) {
    if (!score.failed_gates.some((f) => gateLetter(f.gate) === k)) {
      passes[k] = "pass";
    }
  }
  return {
    flow_id: score.flow_id,
    flow_name: score.flow_name,
    pillar: score.pillar,
    tier: score.tier,
    channel: score.channel,
    scored: true,
    score: score.overall_score,
    verdict: score.verdict,
    gates_passed: score.gates_passed,
    gates_failed: score.gates_failed,
    A_pass: passes.A,
    B_pass: passes.B,
    C_pass: passes.C,
    D_pass: passes.D,
    E_pass: passes.E,
    F_pass: passes.F,
    sent: kpis.sent,
    opens: kpis.opens,
    clicks: kpis.clicks,
    conversions: kpis.conversions,
    unsubscribes: kpis.unsubscribes,
    revenue: kpis.revenue,
    flow_attributed: kpis.flow_attributed,
  };
}

function emptyRow(flowId: string): LifecycleFlowCsvRow {
  return {
    flow_id: flowId,
    flow_name: "",
    pillar: "",
    tier: "",
    channel: "",
    scored: false,
    score: "",
    verdict: "",
    gates_passed: "",
    gates_failed: "",
    A_pass: "",
    B_pass: "",
    C_pass: "",
    D_pass: "",
    E_pass: "",
    F_pass: "",
    sent: "",
    opens: "",
    clicks: "",
    conversions: "",
    unsubscribes: "",
    revenue: "",
    flow_attributed: "",
  };
}

function flowMetaRow(flowId: string, kpisByFlow: Record<string, FlowKpis>): LifecycleFlowCsvRow {
  const flow = PATH_B_FLOWS.find((f) => f.flow_id === flowId);
  const kpis = kpisByFlow[flowId];
  if (!flow) return emptyRow(flowId);
  if (!kpis || (kpis.sent === 0 && kpis.opens === 0 && kpis.clicks === 0 && kpis.conversions === 0)) {
    return {
      ...emptyRow(flowId),
      flow_name: flow.flow_name,
      pillar: flow.pillar,
      tier: flow.tier,
      channel: flow.channel,
    };
  }
  const score = scoreFlow(flow, kpis);
  return rowFromScore(score, kpis);
}

/**
 * Build the CSV body bundling every Path-B lifecycle-flow audit into one
 * file.
 *
 * Format:
 *   # ecommerce-ops-lifecycle-flow-audit
 *   # schema,ecommerce-ops-lifecycle-flow-audit
 *   # version,1
 *   # exported_at,2026-09-24
 *   # source,research/05-lifecycle-marketing.md § Pillars + scripts/lifecycle_flow_health_check.py + playbook 12-lifecycle-flow-library
 *   # flow_count,13
 *   # scored_count,N
 *
 *   flow_id,flow_name,pillar,tier,channel,scored,score,verdict,gates_passed,gates_failed,A_pass,B_pass,C_pass,D_pass,E_pass,F_pass,sent,opens,clicks,conversions,unsubscribes,revenue,flow_attributed
 *   ... per-flow rows in PATH_B_FLOWS order ...
 */
export function buildLifecycleFlowAuditCsv(
  kpisByFlow: Record<string, FlowKpis>,
  meta: LifecycleFlowExportMeta,
): string {
  const scoredCount = Object.keys(kpisByFlow).filter((id) => {
    const k = kpisByFlow[id];
    return k && (k.sent > 0 || k.opens > 0 || k.clicks > 0 || k.conversions > 0);
  }).length;

  const lines: string[] = [];
  lines.push("# ecommerce-ops-lifecycle-flow-audit");
  lines.push(`# schema,ecommerce-ops-lifecycle-flow-audit`);
  lines.push(`# version,1`);
  lines.push(`# exported_at,${meta.exportedAt}`);
  if (meta.label) lines.push(`# label,${meta.label}`);
  lines.push(
    `# source,research/05-lifecycle-marketing.md + scripts/lifecycle_flow_health_check.py + playbook 12-lifecycle-flow-library`,
  );
  lines.push(`# flow_count,${PATH_B_FLOWS.length}`);
  lines.push(`# scored_count,${scoredCount}`);
  lines.push("");
  lines.push(CSV_HEADERS.map((h) => csvEscape(h)).join(","));
  for (const f of PATH_B_FLOWS) {
    const row = flowMetaRow(f.flow_id, kpisByFlow);
    lines.push(
      CSV_HEADERS.map((h) => csvEscape(row[h] as string | number | undefined)).join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export interface LifecycleFlowExportPayload {
  schema: "ecommerce-ops-lifecycle-flow-audit";
  version: 1;
  exportedAt: string;
  label?: string;
  source: string;
  flow_count: number;
  scored_count: number;
  rows: LifecycleFlowCsvRow[];
}

/**
 * Build the JSON payload — same data as the CSV but machine-readable.
 * Operators pipe this into BI tools / Notion DB / dashboards. Each row
 * carries the per-gate pass/fail granularity (6 columns) plus the raw
 * KPI inputs (7 columns), matching the CSV column order.
 */
export function buildLifecycleFlowAuditJson(
  kpisByFlow: Record<string, FlowKpis>,
  meta: LifecycleFlowExportMeta,
): LifecycleFlowExportPayload {
  const scoredCount = Object.keys(kpisByFlow).filter((id) => {
    const k = kpisByFlow[id];
    return k && (k.sent > 0 || k.opens > 0 || k.clicks > 0 || k.conversions > 0);
  }).length;
  const rows = PATH_B_FLOWS.map((f) => flowMetaRow(f.flow_id, kpisByFlow));
  const payload: LifecycleFlowExportPayload = {
    schema: "ecommerce-ops-lifecycle-flow-audit",
    version: 1,
    exportedAt: meta.exportedAt,
    source:
      "research/05-lifecycle-marketing.md + scripts/lifecycle_flow_health_check.py + playbook 12-lifecycle-flow-library",
    flow_count: PATH_B_FLOWS.length,
    scored_count: scoredCount,
    rows,
  };
  if (meta.label) payload.label = meta.label;
  return payload;
}

export function lifecycleFlowAuditFilename(meta: LifecycleFlowExportMeta): string {
  const slug = meta.label ? `-${meta.label}` : "";
  return `ecommerce-ops-lifecycle-flow-audit-${meta.exportedAt}${slug}.csv`;
}

export function lifecycleFlowAuditJsonFilename(meta: LifecycleFlowExportMeta): string {
  const slug = meta.label ? `-${meta.label}` : "";
  return `ecommerce-ops-lifecycle-flow-audit-${meta.exportedAt}${slug}.json`;
}

/**
 * Validate the export inputs before building — guards against accidentally
 * shipping an empty file when the operator hasn't entered any KPIs yet.
 *
 * Returns the operator-facing error message, or `null` if the inputs are
 * valid (even when zero flows are scored — the bundle header still tells
 * the receiver exactly how many flows were scored).
 */
export function validateLifecycleFlowAuditBundle(
  kpisByFlow: Record<string, FlowKpis>,
): string | null {
  if (typeof kpisByFlow !== "object" || kpisByFlow === null) {
    return "No KPI inputs available — open the audit panel and enter at least one flow's KPI snapshot before exporting.";
  }
  return null;
}

/**
 * Quick summary stats the button can advertise next to the "Download"
 * label — gives the operator a sense of what they'd get before clicking.
 */
export function lifecycleFlowAuditSummary(
  kpisByFlow: Record<string, FlowKpis>,
): { totalFlows: number; scoredFlows: number } {
  const scoredFlows = Object.keys(kpisByFlow).filter((id) => {
    const k = kpisByFlow[id];
    return k && (k.sent > 0 || k.opens > 0 || k.clicks > 0 || k.conversions > 0);
  }).length;
  return { totalFlows: PATH_B_FLOWS.length, scoredFlows };
}
