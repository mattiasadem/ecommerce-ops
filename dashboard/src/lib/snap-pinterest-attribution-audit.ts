/**
 * Snap + Pinterest Attribution Quality Audit math — direct TypeScript port
 * of `/scripts/snap_pinterest_attribution_audit.py`.
 *
 * Used by the interactive `<SnapPinterestAttributionAudit />` component on
 * the `/tiktok` page (paired next to the existing `<TiktokAttributionAudit />`
 * Move #6.6 component — both are Move #6.x attribution-quality-audit
 * siblings). The math and canonical thresholds are kept byte-identical to
 * the Python CLI so an operator can sanity-check the same numbers in the
 * browser and the terminal without drift.
 *
 * Canonical thresholds (per scripts/snap_pinterest_attribution_audit.py):
 *
 * Snap (the 4th-largest paid social stack for DTC):
 *   - Gate A — CAPI match rate >= 80% + dedup ratio in [0.7, 1.5]
 *             + coverage >= 92% of expected_orders_last_7d
 *   - Gate C — Pixel coverage >= 88% of expected_pageviews
 *   - Gate D — Email Matching Quality (EMQ) >= 70% of total_events
 *
 * Pinterest (the 5th-largest paid social stack for DTC):
 *   - Gate A' — CAPI match rate >= 85% + dedup ratio in [0.7, 1.5]
 *              + coverage >= 93% of expected_orders_last_7d
 *   - Gate C' — Tag coverage >= 85% of expected_pageviews
 *   - Gate D' — Enhanced Match coverage >= 75% of total_events
 */

export interface SnapCapiMatchFixture {
  pixel_events: number;
  capi_events: number;
  matched_events: number;
  expected_orders_last_7d: number;
}

export interface SnapPixelCoverageFixture {
  pixel_fired_count: number;
  expected_pageviews: number;
}

export interface SnapEmqFixture {
  emq_coverage_pct: number;
  matched_with_identifier: number;
  total_events: number;
}

export interface PinterestCapiMatchFixture {
  pixel_events: number;
  capi_events: number;
  matched_events: number;
  expected_orders_last_7d: number;
}

export interface PinterestTagCoverageFixture {
  tag_fired_count: number;
  expected_pageviews: number;
}

export interface PinterestEnhancedMatchFixture {
  enhanced_match_coverage_pct: number;
  matched_with_identifier: number;
  total_events: number;
}

export type GateStatus = "PASS" | "FAIL";

export type Platform = "snap" | "pinterest";

export interface GateResult {
  gate_name: string;
  platform: Platform;
  label: string;
  passed: boolean;
  detail: string;
  remediation: string | null;
  /** Headline percentage that drives the verdict chip color (0–100). */
  headline_pct: number | null;
  /** Headline label (e.g. "Match rate", "EMQ coverage"). */
  headline_label: string | null;
}

export interface AuditReport {
  gates: GateResult[];
  overall_passed: boolean;
  passed_count: number;
  total_count: number;
}

export interface AuditInputs {
  snapCapi: Partial<SnapCapiMatchFixture>;
  snapPixel: Partial<SnapPixelCoverageFixture>;
  snapEmq: Partial<SnapEmqFixture>;
  pinterestCapi: Partial<PinterestCapiMatchFixture>;
  pinterestTag: Partial<PinterestTagCoverageFixture>;
  pinterestEnhanced: Partial<PinterestEnhancedMatchFixture>;
}

export const SNAP_PINTEREST_FIXTURE_FILES = {
  snap_capi_match: "snap_capi_match.json",
  snap_pixel_coverage: "snap_pixel_coverage.json",
  snap_emq: "snap_emq.json",
  pinterest_capi_match: "pinterest_capi_match.json",
  pinterest_tag_coverage: "pinterest_tag_coverage.json",
  pinterest_enhanced_match: "pinterest_enhanced_match.json",
} as const;

export const SNAP_PINTEREST_GATE_LABELS = {
  snap_capi_match_rate: "Snap Gate A · CAPI match rate + dedup + coverage",
  snap_pixel_coverage: "Snap Gate C · Pixel coverage",
  snap_emq: "Snap Gate D · Email Matching Quality (EMQ)",
  pinterest_capi_match_rate:
    "Pinterest Gate A' · CAPI match rate + dedup + coverage",
  pinterest_tag_coverage: "Pinterest Gate C' · Tag coverage",
  pinterest_enhanced_match: "Pinterest Gate D' · Enhanced Match coverage",
} as const;

export const CANONICAL_THRESHOLDS = {
  // Snap
  MIN_SNAP_CAPI_MATCH_RATE_PCT: 80.0,
  MIN_SNAP_CAPI_COVERAGE_PCT: 92.0,
  MIN_SNAP_DEDUP_RATIO: 0.7,
  MAX_SNAP_DEDUP_RATIO: 1.5,
  MIN_SNAP_PIXEL_COVERAGE_PCT: 88.0,
  MIN_SNAP_EMQ_PCT: 70.0,
  // Pinterest
  MIN_PINTEREST_CAPI_MATCH_RATE_PCT: 85.0,
  MIN_PINTEREST_CAPI_COVERAGE_PCT: 93.0,
  MIN_PINTEREST_DEDUP_RATIO: 0.7,
  MAX_PINTEREST_DEDUP_RATIO: 1.5,
  MIN_PINTEREST_TAG_COVERAGE_PCT: 85.0,
  MIN_PINTEREST_ENHANCED_MATCH_PCT: 75.0,
} as const;

// ----- Snap Gate A — CAPI match rate + dedup ratio + coverage -----

export function checkSnapCapiMatchRate(
  fixture: Partial<SnapCapiMatchFixture>,
): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.snap_capi_match_rate;
  const required = [
    "pixel_events",
    "capi_events",
    "matched_events",
    "expected_orders_last_7d",
  ];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "snap_capi_match_rate",
      platform: "snap",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Snap Pixel Manager > Diagnostics > Event Quality > last 7d and populate snap_capi_match.json with pixel_events, capi_events, matched_events, expected_orders_last_7d",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_events = clampInt(fixture.pixel_events);
  const capi_events = clampInt(fixture.capi_events);
  const matched_events = clampInt(fixture.matched_events);
  const expected_orders = clampInt(fixture.expected_orders_last_7d);

  if (expected_orders <= 0) {
    return {
      gate_name: "snap_capi_match_rate",
      platform: "snap",
      label,
      passed: false,
      detail: `expected_orders_last_7d=${expected_orders} must be > 0`,
      remediation:
        "expected_orders_last_7d must be the count of orders shipped in the last 7 days from Shopify Analytics",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events < 0 || pixel_events < 0 || capi_events < 0) {
    return {
      gate_name: "snap_capi_match_rate",
      platform: "snap",
      label,
      passed: false,
      detail: `Negative event counts not allowed (matched=${matched_events}, pixel=${pixel_events}, capi=${capi_events})`,
      remediation: "Re-export the Snap diagnostic; check for corrupted export",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events > Math.min(pixel_events, capi_events)) {
    return {
      gate_name: "snap_capi_match_rate",
      platform: "snap",
      label,
      passed: false,
      detail: `matched_events=${matched_events} > min(pixel=${pixel_events}, capi=${capi_events}). Matched events cannot exceed either source — likely export error`,
      remediation:
        "Re-export from Snap Pixel Manager > Diagnostics; ensure you're exporting 'Purchase' event dedup status, not raw counts",
      headline_pct: null,
      headline_label: null,
    };
  }

  const match_rate = (matched_events / expected_orders) * 100;
  let dedup_ratio: number;
  if (capi_events > 0) {
    dedup_ratio = pixel_events / capi_events;
  } else if (pixel_events > 0) {
    dedup_ratio = Number.POSITIVE_INFINITY;
  } else {
    dedup_ratio = 1.0;
  }

  const failReasons: string[] = [];
  if (match_rate < CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_MATCH_RATE_PCT) {
    failReasons.push(
      `match rate ${match_rate.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_MATCH_RATE_PCT}% target`,
    );
  }
  if (
    !(
      CANONICAL_THRESHOLDS.MIN_SNAP_DEDUP_RATIO <= dedup_ratio &&
      dedup_ratio <= CANONICAL_THRESHOLDS.MAX_SNAP_DEDUP_RATIO
    )
  ) {
    if (dedup_ratio === Number.POSITIVE_INFINITY) {
      failReasons.push("CAPI events = 0 (Snap cannot optimize without server-side events)");
    } else {
      failReasons.push(
        `dedup ratio ${dedup_ratio.toFixed(2)} outside [${CANONICAL_THRESHOLDS.MIN_SNAP_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_SNAP_DEDUP_RATIO}]`,
      );
    }
  }
  const coverage_pct = (matched_events / expected_orders) * 100;
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_COVERAGE_PCT) {
    failReasons.push(
      `coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_COVERAGE_PCT}% target`,
    );
  }

  if (failReasons.length > 0) {
    const dedupDisplay =
      dedup_ratio === Number.POSITIVE_INFINITY ? "∞" : dedup_ratio.toFixed(2);
    return {
      gate_name: "snap_capi_match_rate",
      platform: "snap",
      label,
      passed: false,
      detail: `Match: ${matched_events}/${expected_orders} = ${match_rate.toFixed(1)}% | Dedup: ${dedupDisplay} | Pixel: ${pixel_events}, CAPI: ${capi_events} | Failures: ${failReasons.join("; ")}`,
      remediation:
        "If match rate is low: (a) verify event_id is identical in pixel + CAPI payloads (Triple Whale → Settings → Snap → event_id mapping); (b) check that the Snap pixel is on every page (theme.liquid) and that CAPI fires on order creation. If dedup ratio is off: re-check that the SAME order is not being sent twice (look for double-firing in Snap Pixel Manager > Test Events). If coverage is low: orders older than 7d in the diagnostic are expiring — re-export with a longer window",
      headline_pct: match_rate,
      headline_label: "Match rate",
    };
  }
  return {
    gate_name: "snap_capi_match_rate",
    platform: "snap",
    label,
    passed: true,
    detail: `✓ Match: ${match_rate.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_SNAP_CAPI_MATCH_RATE_PCT}%) | ✓ Dedup: ${dedup_ratio.toFixed(2)} (in [${CANONICAL_THRESHOLDS.MIN_SNAP_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_SNAP_DEDUP_RATIO}]) | ✓ Coverage: ${coverage_pct.toFixed(1)}% of ${expected_orders} expected orders`,
    remediation: null,
    headline_pct: match_rate,
    headline_label: "Match rate",
  };
}

// ----- Snap Gate C — Pixel coverage -----

export function checkSnapPixelCoverage(
  fixture: Partial<SnapPixelCoverageFixture>,
): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.snap_pixel_coverage;
  const required = ["pixel_fired_count", "expected_pageviews"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "snap_pixel_coverage",
      platform: "snap",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Snap Pixel Manager > Diagnostics > Pageview events and populate snap_pixel_coverage.json with pixel_fired_count, expected_pageviews",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_fired = clampInt(fixture.pixel_fired_count);
  const expected_pv = clampInt(fixture.expected_pageviews);

  if (expected_pv <= 0) {
    return {
      gate_name: "snap_pixel_coverage",
      platform: "snap",
      label,
      passed: false,
      detail: `expected_pageviews=${expected_pv} must be > 0`,
      remediation: "expected_pageviews must be the pageview count from Shopify Analytics or GA4 over the same 7d window",
      headline_pct: null,
      headline_label: null,
    };
  }
  const coverage_pct = (pixel_fired / expected_pv) * 100;

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_SNAP_PIXEL_COVERAGE_PCT) {
    return {
      gate_name: "snap_pixel_coverage",
      platform: "snap",
      label,
      passed: false,
      detail: `Pixel coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_SNAP_PIXEL_COVERAGE_PCT}% target (${pixel_fired}/${expected_pv} pageviews)`,
      remediation:
        "Snap Pixel coverage below 88% means the pixel is missing from one or more theme templates. Audit theme.liquid for the Snap pixel base code; common misses: cart drawer, post-purchase upsell, search results, 404 page. Coverage between 70–88% is normal ad-blocker loss.",
      headline_pct: coverage_pct,
      headline_label: "Pixel coverage",
    };
  }
  return {
    gate_name: "snap_pixel_coverage",
    platform: "snap",
    label,
    passed: true,
    detail: `✓ Pixel coverage: ${coverage_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_SNAP_PIXEL_COVERAGE_PCT}%) | ${pixel_fired}/${expected_pv} pageviews`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Pixel coverage",
  };
}

// ----- Snap Gate D — Email Matching Quality (EMQ) -----

export function checkSnapEmq(fixture: Partial<SnapEmqFixture>): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.snap_emq;
  const required = [
    "emq_coverage_pct",
    "matched_with_identifier",
    "total_events",
  ];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "snap_emq",
      platform: "snap",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Snap Pixel Manager > Advanced Matching subtab and populate snap_emq.json with emq_coverage_pct, matched_with_identifier, total_events",
      headline_pct: null,
      headline_label: null,
    };
  }
  let coverage_pct = clampFloat(fixture.emq_coverage_pct);
  const matched = clampInt(fixture.matched_with_identifier);
  const total = clampInt(fixture.total_events);
  if ((coverage_pct === 0 || Number.isNaN(coverage_pct)) && total > 0) {
    coverage_pct = (matched / total) * 100;
  }
  if (coverage_pct > 100) coverage_pct = 100;
  if (coverage_pct < 0) coverage_pct = 0;

  if (total <= 0) {
    return {
      gate_name: "snap_emq",
      platform: "snap",
      label,
      passed: false,
      detail: `total_events=${total} must be > 0`,
      remediation: "Re-export Snap Pixel Manager > Advanced Matching; check that there are Purchase events in the window",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched < 0 || coverage_pct < 0 || coverage_pct > 100) {
    return {
      gate_name: "snap_emq",
      platform: "snap",
      label,
      passed: false,
      detail: `Invalid values: matched_with_identifier=${matched}, emq_coverage_pct=${coverage_pct} out of [0, 100]`,
      remediation: "Re-export from Snap Pixel Manager; check for corrupted export or out-of-range percentage",
      headline_pct: null,
      headline_label: null,
    };
  }

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_SNAP_EMQ_PCT) {
    return {
      gate_name: "snap_emq",
      platform: "snap",
      label,
      passed: false,
      detail: `Email matching coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_SNAP_EMQ_PCT}% target (${matched}/${total} events with identifier)`,
      remediation:
        "(a) Verify Snap Advanced Matching toggle is ON in Pixel Manager → Settings → Advanced Matching → enable for email + phone + mobile_advertiser_id; (b) verify the Klaviyo-to-Snap sync is sending hashed identifiers (not plaintext); (c) if coverage is still low, most Klaviyo profiles have an email but guest checkouts may not — enable 'Email collection on guest checkout' in Shopify. Without MAID, iOS match rate caps at ~50%.",
      headline_pct: coverage_pct,
      headline_label: "EMQ coverage",
    };
  }
  return {
    gate_name: "snap_emq",
    platform: "snap",
    label,
    passed: true,
    detail: `✓ EMQ coverage: ${coverage_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_SNAP_EMQ_PCT}%) | ${matched}/${total} events with identifier`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "EMQ coverage",
  };
}

// ----- Pinterest Gate A' — CAPI match rate + dedup ratio + coverage -----

export function checkPinterestCapiMatchRate(
  fixture: Partial<PinterestCapiMatchFixture>,
): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.pinterest_capi_match_rate;
  const required = [
    "pixel_events",
    "capi_events",
    "matched_events",
    "expected_orders_last_7d",
  ];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "pinterest_capi_match_rate",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Pinterest Tag Manager > Diagnostics > last 7d and populate pinterest_capi_match.json with pixel_events, capi_events, matched_events, expected_orders_last_7d",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_events = clampInt(fixture.pixel_events);
  const capi_events = clampInt(fixture.capi_events);
  const matched_events = clampInt(fixture.matched_events);
  const expected_orders = clampInt(fixture.expected_orders_last_7d);

  if (expected_orders <= 0) {
    return {
      gate_name: "pinterest_capi_match_rate",
      platform: "pinterest",
      label,
      passed: false,
      detail: `expected_orders_last_7d=${expected_orders} must be > 0`,
      remediation:
        "expected_orders_last_7d must be the count of orders shipped in the last 7 days from Shopify Analytics",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events < 0 || pixel_events < 0 || capi_events < 0) {
    return {
      gate_name: "pinterest_capi_match_rate",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Negative event counts not allowed (matched=${matched_events}, pixel=${pixel_events}, capi=${capi_events})`,
      remediation: "Re-export the Pinterest diagnostic; check for corrupted export",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events > Math.min(pixel_events, capi_events)) {
    return {
      gate_name: "pinterest_capi_match_rate",
      platform: "pinterest",
      label,
      passed: false,
      detail: `matched_events=${matched_events} > min(pixel=${pixel_events}, capi=${capi_events}). Matched events cannot exceed either source — likely export error`,
      remediation:
        "Re-export from Pinterest Tag Manager > Diagnostics; ensure you're exporting 'Checkout' event dedup status, not raw counts",
      headline_pct: null,
      headline_label: null,
    };
  }

  const match_rate = (matched_events / expected_orders) * 100;
  let dedup_ratio: number;
// Continuation of the file. Preceded by `  const match_rate = (matched_events / expected_orders) * 100;\n  let dedup_ratio: number;`

  if (capi_events > 0) {
    dedup_ratio = pixel_events / capi_events;
  } else if (pixel_events > 0) {
    dedup_ratio = Number.POSITIVE_INFINITY;
  } else {
    dedup_ratio = 1.0;
  }

  const failReasons: string[] = [];
  if (match_rate < CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_MATCH_RATE_PCT) {
    failReasons.push(
      `match rate ${match_rate.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_MATCH_RATE_PCT}% target`,
    );
  }
  if (
    !(
      CANONICAL_THRESHOLDS.MIN_PINTEREST_DEDUP_RATIO <= dedup_ratio &&
      dedup_ratio <= CANONICAL_THRESHOLDS.MAX_PINTEREST_DEDUP_RATIO
    )
  ) {
    if (dedup_ratio === Number.POSITIVE_INFINITY) {
      failReasons.push("CAPI events = 0 (Pinterest cannot optimize without server-side events)");
    } else {
      failReasons.push(
        `dedup ratio ${dedup_ratio.toFixed(2)} outside [${CANONICAL_THRESHOLDS.MIN_PINTEREST_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_PINTEREST_DEDUP_RATIO}]`,
      );
    }
  }
  const coverage_pct = (matched_events / expected_orders) * 100;
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_COVERAGE_PCT) {
    failReasons.push(
      `coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_COVERAGE_PCT}% target`,
    );
  }

  if (failReasons.length > 0) {
    const dedupDisplay =
      dedup_ratio === Number.POSITIVE_INFINITY ? "\u221e" : dedup_ratio.toFixed(2);
    return {
      gate_name: "pinterest_capi_match_rate",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Match: ${matched_events}/${expected_orders} = ${match_rate.toFixed(1)}% | Dedup: ${dedupDisplay} | Pixel: ${pixel_events}, CAPI: ${capi_events} | Failures: ${failReasons.join("; ")}`,
      remediation:
        "If match rate is low: (a) verify event_id is identical in pixel + CAPI payloads (Triple Whale > Settings > Pinterest > event_id mapping); (b) check that the Pinterest tag is on every page (theme.liquid) and that CAPI fires on order creation. If dedup ratio is off: re-check that the SAME order is not being sent twice. If coverage is low: orders older than 7d in the diagnostic are expiring \u2014 re-export with a longer window",
      headline_pct: match_rate,
      headline_label: "Match rate",
    };
  }
  return {
    gate_name: "pinterest_capi_match_rate",
    platform: "pinterest",
    label,
    passed: true,
    detail: `\u2713 Match: ${match_rate.toFixed(1)}% (target \u2265${CANONICAL_THRESHOLDS.MIN_PINTEREST_CAPI_MATCH_RATE_PCT}%) | \u2713 Dedup: ${dedup_ratio.toFixed(2)} (in [${CANONICAL_THRESHOLDS.MIN_PINTEREST_DEDUP_RATIO}, ${CANONICAL_THRESHOLDS.MAX_PINTEREST_DEDUP_RATIO}]) | \u2713 Coverage: ${coverage_pct.toFixed(1)}% of ${expected_orders} expected orders`,
    remediation: null,
    headline_pct: match_rate,
    headline_label: "Match rate",
  };
}

// ----- Pinterest Gate C' \u2014 Tag coverage -----

export function checkPinterestTagCoverage(
  fixture: Partial<PinterestTagCoverageFixture>,
): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.pinterest_tag_coverage;
  const required = ["tag_fired_count", "expected_pageviews"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "pinterest_tag_coverage",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Pinterest Tag Manager > Diagnostics > PageVisit events and populate pinterest_tag_coverage.json with tag_fired_count, expected_pageviews",
      headline_pct: null,
      headline_label: null,
    };
  }
  const tag_fired = clampInt(fixture.tag_fired_count);
  const expected_pv = clampInt(fixture.expected_pageviews);

  if (expected_pv <= 0) {
    return {
      gate_name: "pinterest_tag_coverage",
      platform: "pinterest",
      label,
      passed: false,
      detail: `expected_pageviews=${expected_pv} must be > 0`,
      remediation:
        "expected_pageviews must be the pageview count from Shopify Analytics or GA4 over the same 7d window",
      headline_pct: null,
      headline_label: null,
    };
  }
  const coverage_pct = (tag_fired / expected_pv) * 100;

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_PINTEREST_TAG_COVERAGE_PCT) {
    return {
      gate_name: "pinterest_tag_coverage",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Tag coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_PINTEREST_TAG_COVERAGE_PCT}% target (${tag_fired}/${expected_pv} pageviews)`,
      remediation:
        "Pinterest Tag coverage below 85% means the tag is missing from one or more theme templates. Audit theme.liquid for the Pinterest tag base code; common misses: cart drawer, post-purchase upsell, search results, 404 page. Coverage between 70\u201385% is normal ad-blocker loss. The Pinterest tag has fewer coverage-fidelity optimizations than Meta/TikTok, so the threshold is intentionally lower.",
      headline_pct: coverage_pct,
      headline_label: "Tag coverage",
    };
  }
  return {
    gate_name: "pinterest_tag_coverage",
    platform: "pinterest",
    label,
    passed: true,
    detail: `\u2713 Tag coverage: ${coverage_pct.toFixed(1)}% (target \u2265${CANONICAL_THRESHOLDS.MIN_PINTEREST_TAG_COVERAGE_PCT}%) | ${tag_fired}/${expected_pv} pageviews`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Tag coverage",
  };
}

// ----- Pinterest Gate D' \u2014 Enhanced Match -----

export function checkPinterestEnhancedMatch(
  fixture: Partial<PinterestEnhancedMatchFixture>,
): GateResult {
  const label = SNAP_PINTEREST_GATE_LABELS.pinterest_enhanced_match;
  const required = [
    "enhanced_match_coverage_pct",
    "matched_with_identifier",
    "total_events",
  ];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "pinterest_enhanced_match",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Pinterest Tag Manager > Enhanced Match subtab and populate pinterest_enhanced_match.json with enhanced_match_coverage_pct, matched_with_identifier, total_events",
      headline_pct: null,
      headline_label: null,
    };
  }
  let coverage_pct = clampFloat(fixture.enhanced_match_coverage_pct);
  const matched = clampInt(fixture.matched_with_identifier);
  const total = clampInt(fixture.total_events);
  if ((coverage_pct === 0 || Number.isNaN(coverage_pct)) && total > 0) {
    coverage_pct = (matched / total) * 100;
  }
  if (coverage_pct > 100) coverage_pct = 100;
  if (coverage_pct < 0) coverage_pct = 0;

  if (total <= 0) {
    return {
      gate_name: "pinterest_enhanced_match",
      platform: "pinterest",
      label,
      passed: false,
      detail: `total_events=${total} must be > 0`,
      remediation:
        "Re-export Pinterest Tag Manager > Enhanced Match; check that there are Checkout events in the window",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched < 0 || coverage_pct < 0 || coverage_pct > 100) {
    return {
      gate_name: "pinterest_enhanced_match",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Invalid values: matched_with_identifier=${matched}, enhanced_match_coverage_pct=${coverage_pct} out of [0, 100]`,
      remediation:
        "Re-export from Pinterest Tag Manager; check for corrupted export or out-of-range percentage",
      headline_pct: null,
      headline_label: null,
    };
  }

  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_PINTEREST_ENHANCED_MATCH_PCT) {
    return {
      gate_name: "pinterest_enhanced_match",
      platform: "pinterest",
      label,
      passed: false,
      detail: `Enhanced match coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_PINTEREST_ENHANCED_MATCH_PCT}% target (${matched}/${total} events with identifier)`,
      remediation:
        "(a) Verify Pinterest Enhanced Match toggle is ON in Tag Manager > Settings > Enhanced Match > enable for email + external_id; (b) verify the Klaviyo-to-Pinterest sync is sending hashed identifiers (not plaintext); (c) if coverage is still low, most Klaviyo profiles have an email but guest checkouts may not \u2014 enable 'Email collection on guest checkout' in Shopify",
      headline_pct: coverage_pct,
      headline_label: "Enhanced match",
    };
  }
  return {
    gate_name: "pinterest_enhanced_match",
    platform: "pinterest",
    label,
    passed: true,
    detail: `\u2713 Enhanced Match: ${coverage_pct.toFixed(1)}% (target \u2265${CANONICAL_THRESHOLDS.MIN_PINTEREST_ENHANCED_MATCH_PCT}%) | ${matched}/${total} events with identifier`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Enhanced match",
  };
}

// ----- Aggregator -----

export function buildAuditReport(inputs: AuditInputs): AuditReport {
  const gates: GateResult[] = [
    checkSnapCapiMatchRate(inputs.snapCapi),
    checkSnapPixelCoverage(inputs.snapPixel),
    checkSnapEmq(inputs.snapEmq),
    checkPinterestCapiMatchRate(inputs.pinterestCapi),
    checkPinterestTagCoverage(inputs.pinterestTag),
    checkPinterestEnhancedMatch(inputs.pinterestEnhanced),
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
  lines.push("# Snap + Pinterest Attribution Quality Audit \u2014 Move #6.7 Verification");
  lines.push("");
  lines.push(
    `**Result:** ${report.passed_count}/${report.total_count} gates passing \u2014 ${report.overall_passed ? "ALL GATES PASSED" : "SOME GATES FAILED"}`,
  );
  lines.push("");
  const snap = report.gates.filter((g) => g.platform === "snap");
  const pinterest = report.gates.filter((g) => g.platform === "pinterest");
  lines.push("## Snap (4th-largest paid social stack for DTC)");
  lines.push("");
  for (const gate of snap) {
    lines.push(`### ${gate.label}`);
    lines.push("");
    lines.push(`**Status:** ${gate.passed ? "\u2713 PASS" : "\u2717 FAIL"}`);
    lines.push("");
    lines.push(gate.detail);
    if (!gate.passed && gate.remediation) {
      lines.push("");
      lines.push(`**Remediation:** ${gate.remediation}`);
    }
    lines.push("");
  }
  lines.push("## Pinterest (5th-largest paid social stack for DTC)");
  lines.push("");
  for (const gate of pinterest) {
    lines.push(`### ${gate.label}`);
    lines.push("");
    lines.push(`**Status:** ${gate.passed ? "\u2713 PASS" : "\u2717 FAIL"}`);
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
  lines.push(
    "_Same math as `scripts/snap_pinterest_attribution_audit.py` \u2014 Move #6.7 attribution quality audit (Snap + Pinterest)._",
  );
  return lines.join("\n");
}

// ----- Canonical-pass fixtures (mirror Python --bootstrap byte-for-byte) -----

export function canonicalPassSnapCapi(): SnapCapiMatchFixture {
  return {
    pixel_events: 930,
    capi_events: 880,
    matched_events: 855,
    expected_orders_last_7d: 920,
  };
}

export function canonicalPassSnapPixel(): SnapPixelCoverageFixture {
  return {
    pixel_fired_count: 9000,
    expected_pageviews: 10000,
  };
}

export function canonicalPassSnapEmq(): SnapEmqFixture {
  return {
    emq_coverage_pct: 75.0,
    matched_with_identifier: 660,
    total_events: 880,
  };
}

export function canonicalPassPinterestCapi(): PinterestCapiMatchFixture {
  return {
    pixel_events: 940,
    capi_events: 890,
    matched_events: 845,
    expected_orders_last_7d: 900,
  };
}

export function canonicalPassPinterestTag(): PinterestTagCoverageFixture {
  return {
    tag_fired_count: 8800,
    expected_pageviews: 10000,
  };
}

export function canonicalPassPinterestEnhanced(): PinterestEnhancedMatchFixture {
  return {
    enhanced_match_coverage_pct: 80.0,
    matched_with_identifier: 712,
    total_events: 890,
  };
}

export function canonicalPassAll(): AuditInputs {
  return {
    snapCapi: canonicalPassSnapCapi(),
    snapPixel: canonicalPassSnapPixel(),
    snapEmq: canonicalPassSnapEmq(),
    pinterestCapi: canonicalPassPinterestCapi(),
    pinterestTag: canonicalPassPinterestTag(),
    pinterestEnhanced: canonicalPassPinterestEnhanced(),
  };
}

export function stressTestFailAll(): AuditInputs {
  return {
    snapCapi: {
      pixel_events: 1000,
      capi_events: 1500,
      matched_events: 600,
      expected_orders_last_7d: 950,
    },
    snapPixel: {
      pixel_fired_count: 6500,
      expected_pageviews: 9500,
    },
    snapEmq: {
      emq_coverage_pct: 58.0,
      matched_with_identifier: 580,
      total_events: 1000,
    },
    pinterestCapi: {
      pixel_events: 1000,
      capi_events: 1500,
      matched_events: 580,
      expected_orders_last_7d: 950,
    },
    pinterestTag: {
      tag_fired_count: 6000,
      expected_pageviews: 9500,
    },
    pinterestEnhanced: {
      enhanced_match_coverage_pct: 58.0,
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