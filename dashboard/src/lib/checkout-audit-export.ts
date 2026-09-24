/**
 * `checkout-audit-export` — pure-logic builders for a single CSV / JSON
 * bundle containing every Baymard 24-guideline audit row + per-section /
 * per-severity verdict + score + operator copy-paste handoff row.
 *
 * Closes the operator's "I want one CSV with all 24 guideline audits in
 * it" loop. The `<CheckoutAudit />` component on `/cro` already exposes
 * the per-guideline verdict + score inline + a copy-markdown button, but
 * an operator building a Baymard-style fleet audit spreadsheet wants ALL
 * 24 guidelines + ALL 4 statuses (pass/partial/fail/skip) + per-section
 * rollup + scoring math in ONE file so they can pivot across the
 * guideline matrix (sorted by severity, filtered to FAIL status, etc.)
 * without copy-pasting between per-section markdown blocks.
 *
 * CSV layout (analogous to lifecycle-flow-export):
 *   - metadata header block (schema, version, exportedAt, source)
 *   - 1 blank line
 *   - canonical column header row
 *   - per-guideline row in canonical CHECKOUT_GUIDELINES order
 *   - per-section summary footer rows
 *
 * JSON layout — see `CheckoutAuditExportPayload` below. Same key set as
 * the CSV, just nested. Reuses the `AuditResult` shape from the existing
 * `checkout-audit` module so downstream consumers (dashboards, other
 * crons, CI quality gates) can compare against the in-memory scores
 * without schema-drift.
 *
 * Companion component: `dashboard/src/components/checkout-audit-export-button.tsx`.
 * Mounted on `dashboard/app/cro/page.tsx` immediately after the
 * `<CheckoutAudit />` block. Pure data — no DOM, no localStorage side
 * effects. Inputs are the already-hydrated `AuditInputs` map the audit
 * component reads from `ecom-ops:cro:checkout-audit:v1` on mount.
 */

import {
  CHECKOUT_GUIDELINES,
  SECTION_TITLES,
  SEVERITY_WEIGHT,
  scoreAudit,
  type AuditResult,
  type CheckoutGuideline,
} from "./checkout-audit";
import type { AuditStatus } from "./checkout-audit";

/** RFC 4180 cell escape — quoted if contains comma, quote, or newline. */
export function csvEscape(value: string | number | undefined | null): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface CheckoutAuditExportMeta {
  /** ISO date stamp (YYYY-MM-DD). */
  exportedAt: string;
  /** Optional label override for the file name. */
  label?: string;
}

export interface CheckoutAuditCsvRow {
  guideline_id: string;
  section: string;
  section_title: string;
  severity: string;
  severity_weight: number | string;
  title: string;
  prompt: string;
  status: string;
  status_point: number | string;
  weighted_points: number | string;
  max_weighted_points: number | string;
  lift_low_pct: number | string;
  lift_high_pct: number | string;
  notes: string;
}

const CSV_HEADERS: ReadonlyArray<keyof CheckoutAuditCsvRow> = [
  "guideline_id",
  "section",
  "section_title",
  "severity",
  "severity_weight",
  "title",
  "prompt",
  "status",
  "status_point",
  "weighted_points",
  "max_weighted_points",
  "lift_low_pct",
  "lift_high_pct",
  "notes",
];

/** Audit inputs shape consumed by the audit component (mirrors its `AuditInputs`). */
export type CheckoutAuditInputs = Record<
  string,
  { status: AuditStatus; notes?: string }
>;

function statusPointFor(status: AuditStatus | "missing" | undefined): number {
  if (!status || status === "missing" || status === "fail") return 0;
  if (status === "pass") return 1.0;
  if (status === "partial") return 0.5;
  return 0; // skip → not counted (handled via empty weighted_points)
}

function rowFromGuideline(
  g: CheckoutGuideline,
  inputs: CheckoutAuditInputs,
): CheckoutAuditCsvRow {
  const entry = inputs[g.id];
  const status: AuditStatus | "missing" = entry?.status ?? "missing";
  const weight = SEVERITY_WEIGHT[g.severity];
  const statusPoint = statusPointFor(status);
  const weightedPoints =
    status === "skip" ? "" : weight * statusPoint;
  return {
    guideline_id: g.id,
    section: g.section,
    section_title: SECTION_TITLES[g.section],
    severity: g.severity,
    severity_weight: weight,
    title: g.title,
    prompt: g.prompt,
    status,
    status_point: statusPoint,
    weighted_points: weightedPoints,
    max_weighted_points: weight,
    lift_low_pct: g.liftLow * 100,
    lift_high_pct: g.liftHigh * 100,
    notes: entry?.notes ?? "",
  };
}

function sectionRollupRow(
  section: string,
  rows: CheckoutAuditCsvRow[],
): CheckoutAuditCsvRow {
  const sectionRows = rows.filter((r) => r.section === section);
  const pass = sectionRows.filter((r) => r.status === "pass").length;
  const partial = sectionRows.filter((r) => r.status === "partial").length;
  const fail = sectionRows.filter((r) => r.status === "fail").length;
  const skip = sectionRows.filter((r) => r.status === "skip").length;
  const missing = sectionRows.filter((r) => r.status === "missing").length;
  return {
    guideline_id: `__section_${section}_rollup__`,
    section,
    section_title: SECTION_TITLES[section as CheckoutGuideline["section"]] ?? "",
    severity: "ROLLUP",
    severity_weight: "",
    title: `Section ${section} rollup — ${pass}P/${partial}Pa/${fail}F/${skip}S/${missing}M`,
    prompt: `${sectionRows.length} guidelines in this section`,
    status: `${pass}P · ${partial}Pa · ${fail}F · ${skip}S · ${missing}M`,
    status_point: "",
    weighted_points: "",
    max_weighted_points: "",
    lift_low_pct: "",
    lift_high_pct: "",
    notes: "",
  };
}

/**
 * Build the CSV body bundling every Baymard 24-guideline checkout audit
 * into one file.
 *
 * Format:
 *   # ecommerce-ops-checkout-audit
 *   # schema,ecommerce-ops-checkout-audit
 *   # version,1
 *   # exported_at,2026-09-24
 *   # source,scripts/checkout_audit_score.py + playbook 03-checkout-audit-baymard
 *   # guideline_count,24
 *   # audited_count,N
 *   # score,NN/100
 *   # health_band,<band>
 *   # cvr_lift_low_pct,X.X
 *   # cvr_lift_high_pct,X.X
 *
 *   guideline_id,section,section_title,severity,severity_weight,title,prompt,status,status_point,weighted_points,max_weighted_points,lift_low_pct,lift_high_pct,notes
 *   ... 24 per-guideline rows in canonical CHECKOUT_GUIDELINES order ...
 *   ... 5 per-section rollup rows (A..E) ...
 */
export function buildCheckoutAuditCsv(
  inputs: CheckoutAuditInputs,
  meta: CheckoutAuditExportMeta,
): string {
  const result = scoreAudit(inputs);
  const auditedCount =
    result.passCount +
    result.partialCount +
    result.failCount +
    result.skipCount;

  const rows: CheckoutAuditCsvRow[] = CHECKOUT_GUIDELINES.map((g) =>
    rowFromGuideline(g, inputs),
  );

  const lines: string[] = [];
  lines.push("# ecommerce-ops-checkout-audit");
  lines.push(`# schema,ecommerce-ops-checkout-audit`);
  lines.push(`# version,1`);
  lines.push(`# exported_at,${meta.exportedAt}`);
  if (meta.label) lines.push(`# label,${meta.label}`);
  lines.push(
    `# source,scripts/checkout_audit_score.py + playbook 03-checkout-audit-baymard + dashboard checkout-audit`,
  );
  lines.push(`# guideline_count,${CHECKOUT_GUIDELINES.length}`);
  lines.push(`# audited_count,${auditedCount}`);
  lines.push(`# score,${result.score}`);
  lines.push(`# health_band,${result.healthBand}`);
  lines.push(
    `# cvr_lift_low_pct,${(result.cvrLiftLow * 100).toFixed(2)}`,
  );
  lines.push(
    `# cvr_lift_high_pct,${(result.cvrLiftHigh * 100).toFixed(2)}`,
  );
  lines.push("");
  lines.push(CSV_HEADERS.map((h) => csvEscape(h)).join(","));
  for (const row of rows) {
    lines.push(
      CSV_HEADERS.map((h) => csvEscape(row[h] as string | number | undefined)).join(","),
    );
  }
  // Per-section rollup rows so a spreadsheet can group-by section.
  for (const section of ["A", "B", "C", "D", "E"] as const) {
    lines.push(
      CSV_HEADERS.map((h) =>
        csvEscape(
          sectionRollupRow(section, rows)[h] as string | number | undefined,
        ),
      ).join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export interface CheckoutAuditExportPayload {
  schema: "ecommerce-ops-checkout-audit";
  version: 1;
  exportedAt: string;
  label?: string;
  source: string;
  guideline_count: number;
  audited_count: number;
  score: number;
  healthBand: string;
  cvrLiftLowPct: number;
  cvrLiftHighPct: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  skipCount: number;
  missingCount: number;
  rows: CheckoutAuditCsvRow[];
}

/**
 * Build the JSON payload — same data as the CSV but machine-readable.
 * Operators pipe this into BI tools / Notion DB / dashboards. Each row
 * carries the per-guideline status + weighted scoring + lift band + the
 * operator's optional notes, matching the CSV column order.
 */
export function buildCheckoutAuditJson(
  inputs: CheckoutAuditInputs,
  meta: CheckoutAuditExportMeta,
): CheckoutAuditExportPayload {
  const result = scoreAudit(inputs);
  const auditedCount =
    result.passCount +
    result.partialCount +
    result.failCount +
    result.skipCount;

  const rows: CheckoutAuditCsvRow[] = CHECKOUT_GUIDELINES.map((g) =>
    rowFromGuideline(g, inputs),
  );

  const payload: CheckoutAuditExportPayload = {
    schema: "ecommerce-ops-checkout-audit",
    version: 1,
    exportedAt: meta.exportedAt,
    source:
      "scripts/checkout_audit_score.py + playbook 03-checkout-audit-baymard + dashboard checkout-audit",
    guideline_count: CHECKOUT_GUIDELINES.length,
    audited_count: auditedCount,
    score: result.score,
    healthBand: result.healthBand,
    cvrLiftLowPct: result.cvrLiftLow * 100,
    cvrLiftHighPct: result.cvrLiftHigh * 100,
    passCount: result.passCount,
    partialCount: result.partialCount,
    failCount: result.failCount,
    skipCount: result.skipCount,
    missingCount: result.missingCount,
    rows,
  };
  if (meta.label) payload.label = meta.label;
  return payload;
}

export function checkoutAuditFilename(meta: CheckoutAuditExportMeta): string {
  const slug = meta.label ? `-${meta.label}` : "";
  return `ecommerce-ops-checkout-audit-${meta.exportedAt}${slug}.csv`;
}

export function checkoutAuditJsonFilename(meta: CheckoutAuditExportMeta): string {
  const slug = meta.label ? `-${meta.label}` : "";
  return `ecommerce-ops-checkout-audit-${meta.exportedAt}${slug}.json`;
}

/**
 * Validate the export inputs before building — guards against accidentally
 * shipping an empty file when the operator hasn't audited any guideline yet.
 *
 * Returns the operator-facing error message, or `null` if the inputs are
 * valid (even when zero guidelines are scored — the bundle header still
 * tells the receiver exactly how many guidelines were audited).
 */
export function validateCheckoutAuditBundle(
  inputs: CheckoutAuditInputs,
): string | null {
  if (typeof inputs !== "object" || inputs === null) {
    return "No audit inputs available — open the audit panel and mark at least one guideline before exporting.";
  }
  return null;
}

/**
 * Quick summary stats the button can advertise next to the "Download"
 * label — gives the operator a sense of what they'd get before clicking.
 */
export function checkoutAuditSummary(inputs: CheckoutAuditInputs): {
  totalGuidelines: number;
  auditedCount: number;
  score: number;
  healthBand: string;
  cvrLiftLowPct: number;
  cvrLiftHighPct: number;
} {
  const result = scoreAudit(inputs);
  const auditedCount =
    result.passCount +
    result.partialCount +
    result.failCount +
    result.skipCount;
  return {
    totalGuidelines: CHECKOUT_GUIDELINES.length,
    auditedCount,
    score: result.score,
    healthBand: result.healthBand,
    cvrLiftLowPct: result.cvrLiftLow * 100,
    cvrLiftHighPct: result.cvrLiftHigh * 100,
  };
}
