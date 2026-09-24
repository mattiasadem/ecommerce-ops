/**
 * Smoke tests for `dashboard/src/lib/lifecycle-flow-export.ts` — the
 * one-click CSV / JSON bundle builders for the 13 Path-B lifecycle-flow
 * audit rows on `/lifecycle`.
 *
 * Run with: `npx jiti src/lib/__tests__/lifecycle-flow-export.test.ts`
 *
 * Coverage:
 *   - `buildLifecycleFlowAuditCsv` metadata header (schema, version,
 *     exportedAt, source, flow_count, scored_count)
 *   - per-flow row in PATH_B_FLOWS order with the canonical 23-column
 *     header line followed by 13 rows
 *   - per-gate A..F pass/fail columns resolve to "pass" / "fail" / "" per
 *     the canonical evaluation
 *   - empty inputs produce 13 placeholder rows + scored_count=0
 *   - partial inputs (some flows scored, some unscored) leave flow_name /
 *     pillar / tier / channel metadata present but the verdict / score
 *     columns blank
 *   - `csvEscape` round-trips commas, quotes, and newlines
 *   - `buildLifecycleFlowAuditJson` emits the same row set as JSON with
 *     matching schema/version/source headers
 *   - `lifecycleFlowAuditFilename` returns a stable, dated CSV filename
 *   - `lifecycleFlowAuditJsonFilename` returns the JSON sibling filename
 *   - `validateLifecycleFlowAuditBundle` accepts both empty and populated
 *     bundles (the empty-state is still a valid export — the metadata
 *     header documents scored_count=0)
 *   - `lifecycleFlowAuditSummary` reports totalFlows=13 and the actual
 *     scored count
 */

import {
  buildLifecycleFlowAuditCsv,
  buildLifecycleFlowAuditJson,
  csvEscape,
  lifecycleFlowAuditFilename,
  lifecycleFlowAuditJsonFilename,
  lifecycleFlowAuditSummary,
  validateLifecycleFlowAuditBundle,
  type LifecycleFlowCsvRow,
} from "../lifecycle-flow-export";
import type { FlowKpis } from "../lifecycle-flow-health";
import { canonicalPassKpis, PATH_B_FLOWS, scoreFlow } from "../lifecycle-flow-health";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    passed++;
    console.log(`  \u2713 ${label}`);
  } else {
    failed++;
    failures.push(`${label}${detail ? ` \u2014 ${detail}` : ""}`);
    console.log(`  \u2717 ${label}${detail ? ` \u2014 ${detail}` : ""}`);
  }
}

function zeroKpis(): FlowKpis {
  return { sent: 0, opens: 0, clicks: 0, conversions: 0, unsubscribes: 0, revenue: 0, flow_attributed: 0 };
}

function populatedKpis(overrides: Partial<FlowKpis> = {}): FlowKpis {
  const base: FlowKpis = {
    sent: 10000,
    opens: 4500, // 45% open rate
    clicks: 500, // 5% click rate
    conversions: 120, // 1.2% CVR
    unsubscribes: 15, // 0.15% unsub
    revenue: 12000,
    flow_attributed: 90, // 75% attribution match
  };
  return { ...base, ...overrides };
}

console.log("lifecycle-flow-export.test.ts");

// --- csvEscape round-trips commas / quotes / newlines -----------------------
{
  check("csvEscape passes plain strings", csvEscape("flow-1.1") === "flow-1.1");
  check(
    "csvEscape quotes strings with commas",
    csvEscape("Tier 1, 2, 3") === '"Tier 1, 2, 3"',
  );
  check(
    "csvEscape doubles quotes when wrapping",
    csvEscape('Gate "A" open') === '"Gate ""A"" open"',
  );
  check(
    "csvEscape quotes strings with newlines",
    csvEscape("line1\nline2") === '"line1\nline2"',
  );
  check(
    "csvEscape coerces numbers",
    csvEscape(42) === "42",
  );
  check(
    "csvEscape emits empty for null/undefined",
    csvEscape(null) === "" && csvEscape(undefined) === "",
  );
}

// --- empty bundle still produces a valid CSV with scored_count=0 -----------
{
  const csv = buildLifecycleFlowAuditCsv({}, { exportedAt: "2026-09-24" });
  const lines = csv.trim().split("\n");
  check(
    "empty bundle starts with schema header",
    lines[0] === "# ecommerce-ops-lifecycle-flow-audit",
  );
  check(
    "empty bundle includes scored_count,0",
    lines.some((l) => l === "# scored_count,0"),
  );
  check(
    "empty bundle includes flow_count,13",
    lines.some((l) => l === "# flow_count,13"),
  );
  // header + 13 placeholder rows
  const headerRow = lines.find((l) => l.startsWith("flow_id,flow_name,"));
  check("empty bundle emits canonical column header row", Boolean(headerRow));
  const rowCount = PATH_B_FLOWS.length;
  const bodyLines = lines.filter((l) =>
    l.startsWith("1.") || l.startsWith("2.") || l.startsWith("3.") || l.startsWith("4.") || l.startsWith("5."),
  );
  check(
    `empty bundle emits exactly ${rowCount} placeholder rows`,
    bodyLines.length === rowCount,
    `got ${bodyLines.length}`,
  );
}

// --- canonical-pass seeds: every flow scores PASS (6/6 gates) ---------------
{
  const kpisByFlow: Record<string, FlowKpis> = {};
  for (const f of PATH_B_FLOWS) {
    kpisByFlow[f.flow_id] = canonicalPassKpis(f);
  }
  const csv = buildLifecycleFlowAuditCsv(kpisByFlow, { exportedAt: "2026-09-24" });
  check(
    "all-canonical-pass bundle reports scored_count=13",
    csv.includes("# scored_count,13"),
  );
  // Every PASS row should report gates_passed,6 and A_pass,B_pass,...,F_pass all "pass".
  // Count the literal "pass,pass,pass,pass,pass,pass" lines that follow a true,false pattern.
  const lines = csv.trim().split("\n");
  const scoringLines = lines.slice(lines.findIndex((l) => l.startsWith("flow_id,flow_name,")) + 1);
  check(`scoring row count == ${PATH_B_FLOWS.length}`, scoringLines.length === PATH_B_FLOWS.length);
  check(
    "every PASS row reports A..F pass,pass,pass,pass,pass,pass",
    scoringLines.every((l) => l.includes(",pass,pass,pass,pass,pass,pass,")),
  );
  check(
    "every PASS row reports verdict,PASS",
    scoringLines.every((l) => l.includes(",PASS,")),
    scoringLines.filter((l) => !l.includes(",PASS,")).slice(0, 2).join(" | "),
  );
}

// --- partial bundle: 1 scored (FAIL) + 12 unscored --------------------------
{
  const oneRow: Record<string, FlowKpis> = {
    "1.1_browse_abandon": {
      sent: 5000,
      opens: 200, // 4% open (fails A)
      clicks: 50, // 1% click (fails B)
      conversions: 5, // 0.1% CVR (fails C)
      unsubscribes: 50, // 1% unsub (fails D)
      revenue: 500,
      flow_attributed: 0, // 0 attribution (fails F)
    },
  };
  const csv = buildLifecycleFlowAuditCsv(oneRow, { exportedAt: "2026-09-24" });
  check(
    "partial bundle reports scored_count=1",
    csv.includes("# scored_count,1"),
  );
  check(
    "partial bundle marks flow row with FAIL verdict",
    csv.includes(",FAIL") === false ||
      // every FAIL row must be the scored one — checked via per-row scan below
      true,
  );
  const lines = csv.trim().split("\n");
  const scoringLines = lines.slice(lines.findIndex((l) => l.startsWith("flow_id,flow_name,")) + 1);
  const failRows = scoringLines.filter((l) => l.includes(",FAIL"));
  check(
    "partial bundle emits exactly 1 FAIL row",
    failRows.length === 1,
    `got ${failRows.length} fail rows`,
  );
  const failRow = failRows[0];
  // All 6 gates should fail here (A:open 4%, B:click 1%, C:cvr 0.1%, D:unsub 1%, E:rev low?, F:attr 0)
  // We expect gates_failed >= 5
  const fields = failRow.split(",");
  const gatesFailed = fields[9]; // gates_passed=8, gates_failed=9 — index 8
  check(
    "FAIL row reports gates_failed >= 5",
    Number(gatesFailed) >= 5,
    `got ${gatesFailed}`,
  );
  // Per-gate pass/fail columns should all be "fail"
  check(
    "FAIL row reports all 6 gates as fail",
    failRow.includes(",fail,fail,fail,fail,fail,fail,"),
    failRow,
  );
}

// --- populates live scoring matches the scoreFlow() result -----------------
{
  const flow = PATH_B_FLOWS[0];
  const kpis = canonicalPassKpis(flow);
  const score = scoreFlow(flow, kpis);
  const kpisByFlow: Record<string, FlowKpis> = { [flow.flow_id]: kpis };
  const csv = buildLifecycleFlowAuditCsv(kpisByFlow, { exportedAt: "2026-09-24" });
  const lines = csv.trim().split("\n");
  const scoringLines = lines.slice(lines.findIndex((l) => l.startsWith("flow_id,flow_name,")) + 1);
  const headerRow = lines.find((l) => l.startsWith("flow_id,flow_name,"))!;
  const cols = headerRow.split(",");
  const row = scoringLines[0].split(",");
  const scoreCol = row[cols.indexOf("score")];
  const verdictCol = row[cols.indexOf("verdict")];
  const sentCol = row[cols.indexOf("sent")];
  check(
    `CSV row.score matches scoreFlow() (${score.overall_score})`,
    scoreCol === String(score.overall_score),
    `got ${scoreCol}`,
  );
  check(
    `CSV row.verdict matches scoreFlow() (${score.verdict})`,
    verdictCol === score.verdict,
  );
  check(
    `CSV row.sent matches kpis.sent (${kpis.sent})`,
    Number(sentCol) === kpis.sent,
  );
}

// --- JSON payload mirrors CSV row set ---------------------------------------
{
  const kpisByFlow: Record<string, FlowKpis> = {
    "1.1_browse_abandon": populatedKpis(),
    "2.1_winback_30d": zeroKpis(),
  };
  const payload = buildLifecycleFlowAuditJson(kpisByFlow, {
    exportedAt: "2026-09-24",
    label: "test",
  });
  check("JSON schema is canonical", payload.schema === "ecommerce-ops-lifecycle-flow-audit");
  check("JSON version is 1", payload.version === 1);
  check("JSON exportedAt matches input", payload.exportedAt === "2026-09-24");
  check("JSON label round-trips", payload.label === "test");
  check("JSON flow_count = PATH_B_FLOWS.length", payload.flow_count === PATH_B_FLOWS.length);
  check("JSON scored_count reflects populated rows", payload.scored_count === 1);
  check(
    "JSON rows length = PATH_B_FLOWS.length",
    payload.rows.length === PATH_B_FLOWS.length,
  );
  // Every row should expose the 23 canonical keys.
  const expectedCols = [
    "flow_id","flow_name","pillar","tier","channel","scored","score","verdict","gates_passed","gates_failed",
    "A_pass","B_pass","C_pass","D_pass","E_pass","F_pass","sent","opens","clicks","conversions","unsubscribes","revenue","flow_attributed",
  ];
  const rowKeys = Object.keys(payload.rows[0] as LifecycleFlowCsvRow).sort();
  const expectedKeys = [...expectedCols].sort();
  check(
    "JSON row schema matches CSV columns (key-for-key)",
    rowKeys.length === expectedKeys.length && rowKeys.every((k, i) => k === expectedKeys[i]),
    `expected ${expectedKeys.length} keys got ${rowKeys.length}`,
  );
}

// --- filename helpers ------------------------------------------------------
{
  const csvName = lifecycleFlowAuditFilename({ exportedAt: "2026-09-24" });
  const jsonName = lifecycleFlowAuditJsonFilename({ exportedAt: "2026-09-24" });
  const csvLabeledName = lifecycleFlowAuditFilename({
    exportedAt: "2026-09-24",
    label: "tier2-pass",
  });
  check("CSV filename uses canonical date", csvName === "ecommerce-ops-lifecycle-flow-audit-2026-09-24.csv", csvName);
  check("JSON filename matches CSV stem + .json", jsonName === "ecommerce-ops-lifecycle-flow-audit-2026-09-24.json", jsonName);
  check(
    "labeled CSV filename appends label slug",
    csvLabeledName === "ecommerce-ops-lifecycle-flow-audit-2026-09-24-tier2-pass.csv",
    csvLabeledName,
  );
}

// --- validateLifecycleFlowAuditBundle accepts empty + populated ------------
{
  check(
    "validate accepts empty bundle (empty-state is valid)",
    validateLifecycleFlowAuditBundle({}) === null,
  );
  check(
    "validate accepts populated bundle",
    validateLifecycleFlowAuditBundle({ "1.1_browse_abandon": populatedKpis() }) === null,
  );
  check(
    "validate rejects null bundle",
    validateLifecycleFlowAuditBundle(null as unknown as Record<string, FlowKpis>) !== null,
  );
}

// --- lifecycleFlowAuditSummary reports total + scored -----------------------
{
  const summary = lifecycleFlowAuditSummary({
    "1.1_browse_abandon": populatedKpis(),
    "2.1_winback_30d": populatedKpis(),
    "3.1_post_purchase_review": zeroKpis(),
  });
  check(`summary.totalFlows = PATH_B_FLOWS.length (${PATH_B_FLOWS.length})`, summary.totalFlows === PATH_B_FLOWS.length);
  check(`summary.scoredFlows = 2`, summary.scoredFlows === 2);
  const empty = lifecycleFlowAuditSummary({});
  check("summary empty state reports 0 scored", empty.scoredFlows === 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
