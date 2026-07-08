/**
 * TikTok Attribution Quality Audit math — direct TypeScript port of
 * `/scripts/tiktok_attribution_audit.py`.
 *
 * Used by the interactive `<TiktokAttributionAudit />` component on the
 * `/tiktok` page. The math and canonical thresholds are kept byte-identical
 * to the Python CLI so an operator can sanity-check the same numbers in the
 * browser and the terminal without drift.
 *
 * Canonical thresholds (verified by Python test_canonical_thresholds_published):
 * - Gate A: EAPI event_id match rate >= 85% + dedup ratio in [0.7, 1.6]
 *           + coverage >= 95% of expected_orders_last_7d
 * - Gate C: Pixel coverage >= 90% of expected_pageviews
 * - Gate D: Advanced Matching coverage >= 75% of total events
 */

export interface EapiMatchFixture {
  pixel_events: number;
  eapi_events: number;
  matched_events: number;
  expected_orders_last_7d: number;
}

export interface PixelCoverageFixture {
  pixel_fired_count: number;
  expected_pageviews: number;
}

export interface AdvancedMatchingFixture {
  hashed_identifier_coverage_pct: number;
  matched_with_identifier: number;
  total_events: number;
}

export type GateStatus = "PASS" | "FAIL";

export interface GateResult {
  gate_name: string;
  label: string;
  passed: boolean;
  detail: string;
  remediation: string | null;
  /** Headline percentage that drives the verdict chip color (0–100). */
  headline_pct: number | null;
  /** Headline label (e.g. "Match rate", "Pixel coverage"). */
  headline_label: string | null;
}

export interface AuditReport {
  gates: GateResult[];
  overall_passed: boolean;
  passed_count: number;
  total_count: number;
}

export const TIKTOK_AUDIT_FIXTURE_FILES = {
  tiktok_eapi_match: "tiktok_eapi_match.json",
  tiktok_pixel_coverage: "tiktok_pixel_coverage.json",
  tiktok_advanced_matching: "tiktok_advanced_matching.json",
} as const;

export const TIKTOK_AUDIT_GATE_LABELS = {
  tiktok_eapi_match_rate: "Gate A · EAPI match rate + dedup + coverage",
  tiktok_pixel_coverage: "Gate C · Pixel coverage",
  tiktok_advanced_matching: "Gate D · Advanced Matching coverage",
} as const;

export const CANONICAL_THRESHOLDS = {
  MIN_EAPI_MATCH_RATE_PCT: 85.0,
  MIN_EAPI_COVERAGE_PCT: 95.0,
  MIN_DEDUP_RATIO: 0.7,
  MAX_DEDUP_RATIO: 1.6,
  MIN_PIXEL_COVERAGE_PCT: 90.0,
  MIN_ADVANCED_MATCHING_PCT: 75.0,
} as const;

// ----- Gate A — EAPI match rate + dedup ratio + coverage -----

export function checkEapiMatchRate(fixture: Partial<EapiMatchFixture>): GateResult {
  const label = TIKTOK_AUDIT_GATE_LABELS.tiktok_eapi_match_rate;
  const required = ["pixel_events", "eapi_events", "matched_events", "expected_orders_last_7d"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "tiktok_eapi_match_rate",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export TikTok Events Manager > Diagnostics tab (last 7d) and populate tiktok_eapi_match.json with pixel_events, eapi_events, matched_events, expected_orders_last_7d",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_events = clampInt(fixture.pixel_events);
  const eapi_events = clampInt(fixture.eapi_events);
  const matched_events = clampInt(fixture.matched_events);
  const expected_orders = clampInt(fixture.expected_orders_last_7d);

  if (expected_orders <= 0) {
    return {
      gate_name: "tiktok_eapi_match_rate",
      label,
      passed: false,
      detail: `expected_orders_last_7d=${expected_orders} must be > 0`,
      remediation: "expected_orders_last_7d must be the count of orders shipped in the last 7 days from Shopify Analytics",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events < 0 || pixel_events < 0 || eapi_events < 0) {
    return {
      gate_name: "tiktok_eapi_match_rate",
      label,
      passed: false,
      detail: `Negative event counts not allowed (matched=${matched_events}, pixel=${pixel_events}, eapi=${eapi_events})`,
      remediation: "Re-export the TikTok diagnostic; check that the report is not corrupted",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events > Math.min(pixel_events, eapi_events)) {
    return {
      gate_name: "tiktok_eapi_match_rate",
      label,
      passed: false,
      detail: `matched_events=${matched_events} > min(pixel=${pixel_events}, eapi=${eapi_events}). Matched events cannot exceed either source — likely export error`,
      remediation:
        "Re-export from TikTok Events Manager > Diagnostics; ensure you're exporting 'Purchase' event dedup status, not raw counts",
      headline_pct: null,
      headline_label: null,
    };
  }

  const match_rate = (matched_events / expected_orders) * 100;
  let dedup_ratio: number;
  if (eapi_events > 0) {
    dedup_ratio = pixel_events / eapi_events;
  } else if (pixel_events > 0) {
    dedup_ratio = Number.POSITIVE_INFINITY;
  } else {
    dedup_ratio = 1.0;
  }

  const failReasons: string[] = [];
  if (match_rate < CANONICAL_THRESHOLDS.MIN_EAPI_MATCH_RATE_PCT) {
    failReasons.push(`match rate ${match_rate.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_EAPI_MATCH_RATE_PCT}% target`);
  }
  if (!(CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO <= dedup_ratio && dedup_ratio <= CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO)) {
    if (dedup_ratio === Number.POSITIVE_INFINITY) {
      failReasons.push("EAPI events = 0 (TikTok cannot optimize without server-side events)");
    } else {
      failReasons.push(
        `dedup ratio ${dedup_ratio.toFixed(2)} outside [${CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO}]`,
      );
    }
  }
  const coverage_pct = (matched_events / expected_orders) * 100;
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_EAPI_COVERAGE_PCT) {
    failReasons.push(`coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_EAPI_COVERAGE_PCT}% target`);
  }

  if (failReasons.length > 0) {
    const dedupDisplay = dedup_ratio === Number.POSITIVE_INFINITY ? "∞" : dedup_ratio.toFixed(2);
    return {
      gate_name: "tiktok_eapi_match_rate",
      label,
      passed: false,
      detail: `Match: ${matched_events}/${expected_orders} = ${match_rate.toFixed(1)}% | Dedup: ${dedupDisplay} | Pixel: ${pixel_events}, EAPI: ${eapi_events} | Failures: ${failReasons.join("; ")}`,
      remediation:
        "If match rate is low: (a) verify event_id is identical in pixel + EAPI payloads (Triple Whale → Settings → TikTok → event_id mapping); (b) check that the TikTok pixel is on every page (theme.liquid) and that EAPI fires on order creation. If dedup is off: re-check that the SAME order is not being sent twice. If coverage is low: orders older than 7d in the diagnostic are expiring — re-export with a longer window.",
      headline_pct: match_rate,
      headline_label: "Match rate",
    };
  }
  const dedupPass = dedup_ratio.toFixed(2);
  return {
    gate_name: "tiktok_eapi_match_rate",
    label,
    passed: true,
    detail: `✓ Match: ${match_rate.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_EAPI_MATCH_RATE_PCT}%) | ✓ Dedup: ${dedupPass} (in [${CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO}]) | ✓ Coverage: ${coverage_pct.toFixed(1)}% of ${expected_orders} expected orders`,
    remediation: null,
    headline_pct: match_rate,
    headline_label: "Match rate",
  };
}

// ----- Gate C — Pixel coverage -----

export function checkPixelCoverage(fixture: Partial<PixelCoverageFixture>): GateResult {
  const label = TIKTOK_AUDIT_GATE_LABELS.tiktok_pixel_coverage;
  const required = ["pixel_fired_count", "expected_pageviews"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "tiktok_pixel_coverage",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export TikTok Events Manager > Diagnostics tab (last 7d) > Pageview events and populate tiktok_pixel_coverage.json",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_fired = clampInt(fixture.pixel_fired_count);
  const expected_pv = clampInt(fixture.expected_pageviews);

  if (expected_pv <= 0) {
    return {
      gate_name: "tiktok_pixel_coverage",
      label,
      passed: false,
      detail: `expected_pageviews=${expected_pv} must be > 0`,
      remediation: "expected_pageviews must be the pageview count from Shopify Analytics or GA4 over the same 7d window",
      headline_pct: null,
      headline_label: null,
    };
  }
  const coverage_pct = (pixel_fired / expected_pv) * 100;

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_PIXEL_COVERAGE_PCT) {
    return {
      gate_name: "tiktok_pixel_coverage",
      label,
      passed: false,
      detail: `Pixel coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_PIXEL_COVERAGE_PCT}% target (${pixel_fired}/${expected_pv} pageviews)`,
      remediation:
        "Pixel coverage below 90% means the TikTok pixel is missing from one or more theme templates. Audit theme.liquid for the TikTok pixel base code; common misses: cart drawer, post-purchase upsell, search results, 404 page. Coverage between 70–90% is normal ad-blocker loss.",
      headline_pct: coverage_pct,
      headline_label: "Pixel coverage",
    };
  }
  return {
    gate_name: "tiktok_pixel_coverage",
    label,
    passed: true,
    detail: `✓ Pixel coverage: ${coverage_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_PIXEL_COVERAGE_PCT}%) | ${pixel_fired}/${expected_pv} pageviews`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Pixel coverage",
  };
}

// ----- Gate D — Advanced Matching -----

export function checkAdvancedMatching(fixture: Partial<AdvancedMatchingFixture>): GateResult {
  const label = TIKTOK_AUDIT_GATE_LABELS.tiktok_advanced_matching;
  const required = ["hashed_identifier_coverage_pct", "matched_with_identifier", "total_events"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "tiktok_advanced_matching",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export TikTok Events Manager > pixel > Advanced Matching tab and populate tiktok_advanced_matching.json",
      headline_pct: null,
      headline_label: null,
    };
  }
  // Accept either explicit pct or derive from matched_with_identifier / total_events
  let coverage_pct = clampFloat(fixture.hashed_identifier_coverage_pct);
  const matched = clampInt(fixture.matched_with_identifier);
  const total = clampInt(fixture.total_events);
  if ((coverage_pct === 0 || Number.isNaN(coverage_pct)) && total > 0) {
    coverage_pct = (matched / total) * 100;
  }
  if (coverage_pct > 100) coverage_pct = 100;
  if (coverage_pct < 0) coverage_pct = 0;

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_ADVANCED_MATCHING_PCT) {
    return {
      gate_name: "tiktok_advanced_matching",
      label,
      passed: false,
      detail: `Hashed identifier coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_ADVANCED_MATCHING_PCT}% target (${matched}/${total} events with identifier)`,
      remediation:
        "Enable TikTok Advanced Matching: Events Manager → click pixel → Advanced Matching subtab → toggle ON for email + phone + external_id. Without it TikTok can only match on coarse signals (device ID, IP).",
      headline_pct: coverage_pct,
      headline_label: "Advanced match",
    };
  }
  return {
    gate_name: "tiktok_advanced_matching",
    label,
    passed: true,
    detail: `✓ Advanced Matching: ${coverage_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_ADVANCED_MATCHING_PCT}%) | ${matched}/${total} events with identifier`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Advanced match",
  };
}

// ----- Aggregator -----

export interface AuditInputs {
  eapi: Partial<EapiMatchFixture>;
  pixel: Partial<PixelCoverageFixture>;
  advanced: Partial<AdvancedMatchingFixture>;
}

export function buildAuditReport(inputs: AuditInputs): AuditReport {
  const gates: GateResult[] = [
    checkEapiMatchRate(inputs.eapi),
    checkPixelCoverage(inputs.pixel),
    checkAdvancedMatching(inputs.advanced),
  ];
  return {
    gates,
    overall_passed: gates.every((g) => g.passed),
    passed_count: gates.filter((g) => g.passed).length,
    total_count: gates.length,
  };
}

export function renderAuditMarkdown(report: AuditReport, inputs: AuditInputs): string {
  const lines: string[] = [];
  lines.push("# TikTok Attribution Quality Audit — Move #6.6 Verification");
  lines.push("");
  lines.push(`**Result:** ${report.passed_count}/${report.total_count} gates passing — ${report.overall_passed ? "ALL GATES PASSED" : "SOME GATES FAILED"}`);
  lines.push("");
  for (const gate of report.gates) {
    lines.push(`## ${gate.label}`);
    lines.push("");
    lines.push(`**Status:** ${gate.passed ? "✓ PASS" : "✗ FAIL"}`);
    lines.push("");
    lines.push(gate.detail);
    if (!gate.passed && gate.remediation) {
      lines.push("");
      lines.push(`**Remediation:** ${gate.remediation}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push("_Same math as `scripts/tiktok_attribution_audit.py` — Move #6.6 attribution quality audit._");
  return lines.join("\n");
}

// ----- Canonical-pass fixtures -----

export function canonicalPassEapi(): EapiMatchFixture {
  return {
    pixel_events: 1000,
    eapi_events: 950,
    matched_events: 905,
    expected_orders_last_7d: 950,
  };
}

export function canonicalPassPixel(): PixelCoverageFixture {
  return {
    pixel_fired_count: 9000,
    expected_pageviews: 10000,
  };
}

export function canonicalPassAdvanced(): AdvancedMatchingFixture {
  return {
    hashed_identifier_coverage_pct: 80.0,
    matched_with_identifier: 760,
    total_events: 950,
  };
}

export function canonicalPassAll(): AuditInputs {
  return {
    eapi: canonicalPassEapi(),
    pixel: canonicalPassPixel(),
    advanced: canonicalPassAdvanced(),
  };
}

export function stressTestFailAll(): AuditInputs {
  return {
    eapi: {
      pixel_events: 1000,
      eapi_events: 1500,
      matched_events: 600,
      expected_orders_last_7d: 950,
    },
    pixel: {
      pixel_fired_count: 6500,
      expected_pageviews: 9500,
    },
    advanced: {
      hashed_identifier_coverage_pct: 58.0,
      matched_with_identifier: 580,
      total_events: 1000,
    },
  };
}

// ----- Helpers -----

function clampInt(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.trunc(v));
  const parsed = Number(v);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
}

function clampFloat(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const parsed = Number(v);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

export function verdictBadgeClasses(passed: boolean): string {
  return passed
    ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
    : "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800";
}

export function verdictShortLabel(passed: boolean): string {
  return passed ? "PASS" : "FAIL";
}