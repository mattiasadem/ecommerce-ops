/**
 * Attribution Quality Audit math — direct TypeScript port of
 * `/scripts/attribution_quality_audit.py`.
 *
 * Used by the interactive `<AttributionQualityAudit />` component on the
 * `/attribution-quality` page. The math and canonical thresholds are
 * kept byte-identical to the Python CLI so an operator can sanity-check
 * the same numbers in the browser and the terminal without drift.
 *
 * Canonical thresholds (the 6 gates — verified by the Python CLI's
 * `attribution_quality_audit.py --check <gate>` flags):
 * - Gate A: Meta CAPI match rate >= 90% + dedup ratio in [0.8, 1.5]
 *           + coverage >= 95% of expected_orders_last_7d
 * - Gate C: Meta Pixel coverage >= 95% of expected_pageviews
 * - Gate D: Google Enhanced Conversions quality_tier in {Good, Excellent}
 *           AND hashed_email_coverage_pct >= 80%
 * - Gate E: GA4 <-> Triple Whale |rev| delta <= 5% AND order delta <= 3%
 * - Gate F: Klaviyo <-> Triple Whale cohort roundtrip match >= 95%
 *           (with sample size >= 5 orders)
 * - Gate G: Week-over-week drift on match rate + revenue delta <= 5pp
 */

export interface MetaCapiFixture {
  pixel_events: number;
  capi_events: number;
  matched_events: number;
  expected_orders_last_7d: number;
}

export interface MetaPixelFixture {
  pixel_fired_count: number;
  expected_pageviews: number;
}

export interface GoogleEcFixture {
  quality_tier: "Good" | "Excellent" | "Needs improvement" | "Unavailable" | "";
  hashed_email_coverage_pct: number;
  total_conversions: number;
  conversions_with_hashed_email: number;
}

export interface Ga4TwRevenueFixture {
  ga4_revenue_last_7d: number;
  tw_revenue_last_7d: number;
  actual_orders_last_7d: number;
  expected_orders_last_7d: number;
}

export interface KlaviyoTwSampleOrder {
  order_id: string;
  klaviyo_cohort: string;
  tw_cohort: string;
}

export interface KlaviyoTwCohortFixture {
  sample_orders: KlaviyoTwSampleOrder[];
}

export interface AttributionDriftFixture {
  measurement_window_days: number;
  drift_threshold_pct: number;
  current_match_rate_pct: number;
  previous_match_rate_pct: number;
  current_revenue_delta_pct: number;
  previous_revenue_delta_pct: number;
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

export interface AuditInputs {
  meta_capi: Partial<MetaCapiFixture>;
  meta_pixel: Partial<MetaPixelFixture>;
  google_ec: Partial<GoogleEcFixture>;
  ga4_tw: Partial<Ga4TwRevenueFixture>;
  klaviyo_tw: Partial<KlaviyoTwCohortFixture>;
  drift: Partial<AttributionDriftFixture>;
}

export const AUDIT_FIXTURE_FILES = {
  meta_capi_match: "meta_capi_match.json",
  meta_pixel_coverage: "meta_pixel_coverage.json",
  google_enhanced_quality: "google_enhanced_quality.json",
  ga4_tw_revenue: "ga4_tw_revenue.json",
  klaviyo_tw_cohort: "klaviyo_tw_cohort.json",
  attribution_drift: "attribution_drift.json",
} as const;

export const AUDIT_GATE_LABELS = {
  meta_capi_match_rate: "Gate A · Meta CAPI match rate + dedup ratio + coverage",
  meta_pixel_coverage: "Gate C · Meta Pixel coverage",
  google_enhanced_conversions_quality: "Gate D · Google Enhanced Conversions quality tier + email coverage",
  ga4_tw_revenue_delta: "Gate E · GA4 ↔ Triple Whale revenue + order delta",
  klaviyo_tw_cohort_roundtrip: "Gate F · Klaviyo ↔ Triple Whale cohort roundtrip",
  attribution_drift: "Gate G · Week-over-week match-rate + revenue-delta drift",
} as const;

export const CANONICAL_THRESHOLDS = {
  MIN_META_CAPI_MATCH_RATE_PCT: 90.0,
  MIN_META_COVERAGE_PCT: 95.0,
  MIN_DEDUP_RATIO: 0.8,
  MAX_DEDUP_RATIO: 1.5,
  MIN_META_PIXEL_COVERAGE_PCT: 95.0,
  ACCEPTABLE_GOOGLE_EC_QUALITY: new Set(["Good", "Excellent"]),
  MIN_GOOGLE_EC_HASHED_EMAIL_PCT: 80.0,
  MAX_GA4_TW_REVENUE_DELTA_PCT: 5.0,
  MAX_ORDER_COUNT_DELTA_PCT: 3.0,
  MIN_COHORT_ROUNDTRIP_MATCH_PCT: 95.0,
  MIN_SAMPLE_ORDERS: 5,
  DEFAULT_DRIFT_THRESHOLD_PCT: 5.0,
} as const;

// ----- Helpers -----

function clampInt(value: unknown, min = 0, max = 10_000_000): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return Math.round(n);
}

function clampFloat(value: unknown, min = 0, max = 100): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// ----- Gate A — Meta CAPI match rate + dedup ratio + coverage -----

export function checkMetaCapiMatchRate(fixture: Partial<MetaCapiFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.meta_capi_match_rate;
  const required = ["pixel_events", "capi_events", "matched_events", "expected_orders_last_7d"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "meta_capi_match_rate",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Export Meta Events Manager > Diagnostics > last 7d and populate meta_capi_match.json with pixel_events, capi_events, matched_events, expected_orders_last_7d (from Shopify Analytics)",
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
      gate_name: "meta_capi_match_rate",
      label,
      passed: false,
      detail: `expected_orders_last_7d=${expected_orders} must be > 0`,
      remediation: "expected_orders_last_7d must be the count of orders shipped in the last 7 days from Shopify Analytics",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events < 0 || pixel_events < 0 || capi_events < 0) {
    return {
      gate_name: "meta_capi_match_rate",
      label,
      passed: false,
      detail: `Negative event counts not allowed (matched=${matched_events}, pixel=${pixel_events}, capi=${capi_events})`,
      remediation: "Re-export the Meta diagnostic; check that the report is not corrupted",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (matched_events > Math.min(pixel_events, capi_events)) {
    return {
      gate_name: "meta_capi_match_rate",
      label,
      passed: false,
      detail: `matched_events=${matched_events} > min(pixel=${pixel_events}, capi=${capi_events}). Matched events cannot exceed either source — likely export error`,
      remediation: "Re-export from Meta Events Manager > Diagnostics; ensure you're exporting 'Purchase' event dedup status, not raw counts",
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

  const fail_reasons: string[] = [];
  if (match_rate < CANONICAL_THRESHOLDS.MIN_META_CAPI_MATCH_RATE_PCT) {
    fail_reasons.push(`match rate ${match_rate.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_META_CAPI_MATCH_RATE_PCT.toFixed(0)}% target`);
  }
  if (!(CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO <= dedup_ratio && dedup_ratio <= CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO)) {
    if (dedup_ratio === Number.POSITIVE_INFINITY) {
      fail_reasons.push("CAPI events = 0 (Meta cannot optimize without server-side events)");
    } else {
      fail_reasons.push(
        `dedup ratio ${dedup_ratio.toFixed(2)} outside [${CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO.toFixed(1)}, ${CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO.toFixed(1)}]`,
      );
    }
  }
  const coverage_pct = (matched_events / expected_orders) * 100;
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_META_COVERAGE_PCT) {
    fail_reasons.push(`coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_META_COVERAGE_PCT.toFixed(0)}% target`);
  }

  if (fail_reasons.length > 0) {
    return {
      gate_name: "meta_capi_match_rate",
      label,
      passed: false,
      detail: `Match: ${matched_events}/${expected_orders} = ${match_rate.toFixed(1)}% | Dedup ratio: ${dedup_ratio.toFixed(2)} | Pixel: ${pixel_events}, CAPI: ${capi_events} | Failures: ${fail_reasons.join("; ")}`,
      remediation:
        "If match rate is low: (a) verify event_id is identical in pixel + CAPI payloads (Triple Whale → Settings → CAPI → event_id mapping); (b) check that the Meta pixel is on every page (theme.liquid) and that CAPI is firing on order creation. If dedup ratio is off: re-check that the SAME order is not being sent twice (look for double-firing in the Meta Events Manager > Test Events). If coverage is low: orders older than 7d in the diagnostic are expiring — re-export with a longer window",
      headline_pct: match_rate,
      headline_label: "Match rate",
    };
  }
  return {
    gate_name: "meta_capi_match_rate",
    label,
    passed: true,
    detail: `✓ Match rate: ${match_rate.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_META_CAPI_MATCH_RATE_PCT.toFixed(0)}%) | ✓ Dedup ratio: ${dedup_ratio.toFixed(2)} (in [${CANONICAL_THRESHOLDS.MIN_DEDUP_RATIO.toFixed(1)}, ${CANONICAL_THRESHOLDS.MAX_DEDUP_RATIO.toFixed(1)}]) | ✓ Coverage: ${coverage_pct.toFixed(1)}% of ${expected_orders} expected orders`,
    remediation: null,
    headline_pct: match_rate,
    headline_label: "Match rate",
  };
}

// ----- Gate C — Meta Pixel coverage -----

export function checkMetaPixelCoverage(fixture: Partial<MetaPixelFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.meta_pixel_coverage;
  const required = ["pixel_fired_count", "expected_pageviews"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "meta_pixel_coverage",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Set both 'pixel_fired_count' (Meta Events Manager > Diagnostics > PageView event count, last 7d) and 'expected_pageviews' (Shopify Analytics > Total sessions, last 7d) in meta_pixel_coverage.json",
      headline_pct: null,
      headline_label: null,
    };
  }
  const pixel_count = clampInt(fixture.pixel_fired_count);
  const expected_pv = clampInt(fixture.expected_pageviews);

  if (expected_pv <= 0) {
    return {
      gate_name: "meta_pixel_coverage",
      label,
      passed: false,
      detail: `expected_pageviews=${expected_pv} must be > 0`,
      remediation: "Re-check Shopify Analytics for the 7-day session count",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (pixel_count < 0) {
    return {
      gate_name: "meta_pixel_coverage",
      label,
      passed: false,
      detail: `pixel_fired_count=${pixel_count} cannot be negative`,
      remediation: "Re-export from Meta Events Manager; check for corrupted export",
      headline_pct: null,
      headline_label: null,
    };
  }
  const coverage_pct = (pixel_count / expected_pv) * 100;
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_META_PIXEL_COVERAGE_PCT) {
    return {
      gate_name: "meta_pixel_coverage",
      label,
      passed: false,
      detail: `Pixel coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_META_PIXEL_COVERAGE_PCT.toFixed(0)}% target. Pixel fired: ${pixel_count}, Expected pageviews: ${expected_pv}`,
      remediation:
        "(a) Verify the Meta pixel base code is in theme.liquid just before </head>; (b) check that no Content-Security-Policy headers are blocking facebook.com/tr; (c) note that ad-blocker-induced loss of ~15% is normal — if coverage is below 80%, look for theme.liquid missing the pixel snippet entirely",
      headline_pct: coverage_pct,
      headline_label: "Pixel coverage",
    };
  }
  return {
    gate_name: "meta_pixel_coverage",
    label,
    passed: true,
    detail: `✓ Pixel coverage: ${coverage_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_META_PIXEL_COVERAGE_PCT.toFixed(0)}%) | Pixel fired: ${pixel_count} of ${expected_pv} expected pageviews`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Pixel coverage",
  };
}

// ----- Gate D — Google Enhanced Conversions quality -----

export function checkGoogleEnhancedConversionsQuality(fixture: Partial<GoogleEcFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.google_enhanced_conversions_quality;
  const required = ["quality_tier", "hashed_email_coverage_pct", "total_conversions", "conversions_with_hashed_email"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "google_enhanced_conversions_quality",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Set all four keys in google_enhanced_quality.json: 'quality_tier' (Google Ads > Conversions > Diagnostics > Enhanced Conversions), 'hashed_email_coverage_pct', 'total_conversions', and 'conversions_with_hashed_email'",
      headline_pct: null,
      headline_label: null,
    };
  }
  const tier = String(fixture.quality_tier ?? "");
  const validTiers = new Set(["Good", "Excellent", "Needs improvement", "Unavailable"]);
  if (!validTiers.has(tier)) {
    return {
      gate_name: "google_enhanced_conversions_quality",
      label,
      passed: false,
      detail: `Unknown quality_tier '${tier}' (expected one of Good/Excellent/Needs improvement/Unavailable)`,
      remediation: "Re-export from Google Ads > Conversions > Diagnostics",
      headline_pct: null,
      headline_label: null,
    };
  }
  const coverage_pct = clampFloat(fixture.hashed_email_coverage_pct, 0, 100);
  const total_conv = clampInt(fixture.total_conversions);
  const conv_with_email = clampInt(fixture.conversions_with_hashed_email);

  if (total_conv <= 0) {
    return {
      gate_name: "google_enhanced_conversions_quality",
      label,
      passed: false,
      detail: `total_conversions=${total_conv} must be > 0`,
      remediation: "Re-export Google Ads > Conversions > last-7d report",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (coverage_pct < 0 || coverage_pct > 100) {
    return {
      gate_name: "google_enhanced_conversions_quality",
      label,
      passed: false,
      detail: `hashed_email_coverage_pct=${coverage_pct} out of [0, 100] range`,
      remediation: "Re-export; the percentage should be (conversions_with_hashed_email / total_conversions) * 100",
      headline_pct: null,
      headline_label: null,
    };
  }

  const fail_reasons: string[] = [];
  if (!CANONICAL_THRESHOLDS.ACCEPTABLE_GOOGLE_EC_QUALITY.has(tier)) {
    fail_reasons.push(`quality tier '${tier}' not in ${Array.from(CANONICAL_THRESHOLDS.ACCEPTABLE_GOOGLE_EC_QUALITY).join("/")}`);
  }
  if (coverage_pct < CANONICAL_THRESHOLDS.MIN_GOOGLE_EC_HASHED_EMAIL_PCT) {
    fail_reasons.push(`hashed email coverage ${coverage_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_GOOGLE_EC_HASHED_EMAIL_PCT.toFixed(0)}% target`);
  }

  if (fail_reasons.length > 0) {
    return {
      gate_name: "google_enhanced_conversions_quality",
      label,
      passed: false,
      detail: `Tier: ${tier} | Email coverage: ${coverage_pct.toFixed(1)}% (${conv_with_email}/${total_conv}) | Failures: ${fail_reasons.join("; ")}`,
      remediation:
        "If tier is 'Unavailable' or 'Needs improvement': (a) verify the Google Ads conversion tag has 'Include user data' enabled (Tag Configuration > Advanced > Include user-provided data); (b) verify the Klaviyo-to-Google sync is sending hashed email (not plaintext). If email coverage is low: most Klaviyo profiles have an email but guest checkouts may not — enable 'Email collection on guest checkout' in Shopify",
      headline_pct: coverage_pct,
      headline_label: "Email coverage",
    };
  }
  return {
    gate_name: "google_enhanced_conversions_quality",
    label,
    passed: true,
    detail: `✓ Quality tier: ${tier} | ✓ Email coverage: ${coverage_pct.toFixed(1)}% (${conv_with_email}/${total_conv} conversions)`,
    remediation: null,
    headline_pct: coverage_pct,
    headline_label: "Email coverage",
  };
}

// ----- Gate E — GA4 <-> Triple Whale revenue delta -----

export function checkGa4TwRevenueDelta(fixture: Partial<Ga4TwRevenueFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.ga4_tw_revenue_delta;
  const required = ["ga4_revenue_last_7d", "tw_revenue_last_7d", "actual_orders_last_7d", "expected_orders_last_7d"];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "ga4_tw_revenue_delta",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Set all four keys in ga4_tw_revenue.json: 'ga4_revenue_last_7d' (GA4 > Monetization > Purchase revenue, last 7d), 'tw_revenue_last_7d' (Triple Whale > Revenue, last 7d), 'actual_orders_last_7d' (Shopify > Orders last 7d), 'expected_orders_last_7d' (the Shopify ground truth)",
      headline_pct: null,
      headline_label: null,
    };
  }
  const ga4_rev = clampFloat(fixture.ga4_revenue_last_7d, 0, 1e9);
  const tw_rev = clampFloat(fixture.tw_revenue_last_7d, 0, 1e9);
  const actual_orders = clampInt(fixture.actual_orders_last_7d);
  const expected_orders = clampInt(fixture.expected_orders_last_7d);

  if (tw_rev <= 0) {
    return {
      gate_name: "ga4_tw_revenue_delta",
      label,
      passed: false,
      detail: `tw_revenue_last_7d=${tw_rev} must be > 0 (Triple Whale should always have positive revenue for a paying store)`,
      remediation: "If Triple Whale shows 0 revenue, the order webhook is broken — re-check the Move #6 Step 1 install and the Triple Whale > Settings > Integrations > Shopify",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (expected_orders <= 0) {
    return {
      gate_name: "ga4_tw_revenue_delta",
      label,
      passed: false,
      detail: `expected_orders_last_7d=${expected_orders} must be > 0`,
      remediation: "Re-check Shopify Analytics for the 7-day order count",
      headline_pct: null,
      headline_label: null,
    };
  }

  const revenue_delta_pct = (Math.abs(ga4_rev - tw_rev) / tw_rev) * 100;
  const order_delta_pct = expected_orders > 0 ? (Math.abs(actual_orders - expected_orders) / expected_orders) * 100 : 0;

  const fail_reasons: string[] = [];
  if (revenue_delta_pct > CANONICAL_THRESHOLDS.MAX_GA4_TW_REVENUE_DELTA_PCT) {
    fail_reasons.push(`revenue delta ${revenue_delta_pct.toFixed(1)}% > ${CANONICAL_THRESHOLDS.MAX_GA4_TW_REVENUE_DELTA_PCT.toFixed(0)}% target`);
  }
  if (order_delta_pct > CANONICAL_THRESHOLDS.MAX_ORDER_COUNT_DELTA_PCT) {
    fail_reasons.push(`order count delta ${order_delta_pct.toFixed(1)}% > ${CANONICAL_THRESHOLDS.MAX_ORDER_COUNT_DELTA_PCT.toFixed(0)}% target`);
  }

  const headline = Math.max(revenue_delta_pct, order_delta_pct);
  if (fail_reasons.length > 0) {
    return {
      gate_name: "ga4_tw_revenue_delta",
      label,
      passed: false,
      detail: `GA4: $${ga4_rev.toFixed(2)} | TW: $${tw_rev.toFixed(2)} | Revenue delta: ${revenue_delta_pct.toFixed(1)}% | Orders: ${actual_orders} actual vs ${expected_orders} expected (${order_delta_pct.toFixed(1)}% delta) | Failures: ${fail_reasons.join("; ")}`,
      remediation:
        "If revenue delta is high: Triple Whale is the source of truth (it merges pixel + CAPI + survey), so a 5%+ delta with GA4 means GA4 is undercounting (expected: GA4 typically shows 60-70% of TW revenue post-iOS14.5). If TW < GA4: a refund is miscategorized or a test order leaked in. If order count delta is high: a fulfillment webhook is delayed — check Shopify > Settings > Notifications > Order fulfillment",
      headline_pct: headline,
      headline_label: "Worse delta",
    };
  }
  return {
    gate_name: "ga4_tw_revenue_delta",
    label,
    passed: true,
    detail: `✓ Revenue delta: ${revenue_delta_pct.toFixed(1)}% (target ≤${CANONICAL_THRESHOLDS.MAX_GA4_TW_REVENUE_DELTA_PCT.toFixed(0)}%) | GA4: $${ga4_rev.toFixed(2)}, TW: $${tw_rev.toFixed(2)} | ✓ Order delta: ${order_delta_pct.toFixed(1)}% (target ≤${CANONICAL_THRESHOLDS.MAX_ORDER_COUNT_DELTA_PCT.toFixed(0)}%)`,
    remediation: null,
    headline_pct: headline,
    headline_label: "Worse delta",
  };
}

// ----- Gate F — Klaviyo <-> Triple Whale cohort roundtrip -----

export function checkKlaviyoTwCohortRoundtrip(fixture: Partial<KlaviyoTwCohortFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.klaviyo_tw_cohort_roundtrip;
  if (!("sample_orders" in fixture)) {
    return {
      gate_name: "klaviyo_tw_cohort_roundtrip",
      label,
      passed: false,
      detail: "Missing 'sample_orders' key",
      remediation:
        "Add 'sample_orders' to klaviyo_tw_cohort.json — a list of at least 5 recent orders with each entry having 'order_id', 'klaviyo_cohort', and 'tw_cohort' fields",
      headline_pct: null,
      headline_label: null,
    };
  }
  const sample_orders = fixture.sample_orders;
  if (!Array.isArray(sample_orders)) {
    return {
      gate_name: "klaviyo_tw_cohort_roundtrip",
      label,
      passed: false,
      detail: "'sample_orders' must be a list",
      remediation: "Re-export from Klaviyo + Triple Whale; sample_orders must be a JSON array",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (sample_orders.length < CANONICAL_THRESHOLDS.MIN_SAMPLE_ORDERS) {
    return {
      gate_name: "klaviyo_tw_cohort_roundtrip",
      label,
      passed: false,
      detail: `Need at least ${CANONICAL_THRESHOLDS.MIN_SAMPLE_ORDERS} sample orders, got ${sample_orders.length}. Sample size too small to be meaningful`,
      remediation: `Add at least ${CANONICAL_THRESHOLDS.MIN_SAMPLE_ORDERS} recent orders to sample_orders (random sample from Shopify > Orders > last 30d)`,
      headline_pct: null,
      headline_label: null,
    };
  }

  let malformed = 0;
  let matched = 0;
  for (const order of sample_orders) {
    if (!order || typeof order !== "object") {
      malformed += 1;
      continue;
    }
    const o = order as Partial<KlaviyoTwSampleOrder>;
    if (!("order_id" in o) || !("klaviyo_cohort" in o) || !("tw_cohort" in o)) {
      malformed += 1;
      continue;
    }
    const k = String(o.klaviyo_cohort ?? "").trim();
    const t = String(o.tw_cohort ?? "").trim();
    if (k && t && k.toLowerCase() === t.toLowerCase()) {
      matched += 1;
    }
  }

  const total_valid = sample_orders.length - malformed;
  if (total_valid <= 0) {
    return {
      gate_name: "klaviyo_tw_cohort_roundtrip",
      label,
      passed: false,
      detail: `All ${sample_orders.length} sample orders are malformed (missing required keys)`,
      remediation: "Each sample order must have 'order_id', 'klaviyo_cohort', and 'tw_cohort' fields. Re-export and re-format",
      headline_pct: null,
      headline_label: null,
    };
  }

  const match_pct = (matched / total_valid) * 100;
  if (match_pct < CANONICAL_THRESHOLDS.MIN_COHORT_ROUNDTRIP_MATCH_PCT) {
    return {
      gate_name: "klaviyo_tw_cohort_roundtrip",
      label,
      passed: false,
      detail: `Cohort match: ${matched}/${total_valid} = ${match_pct.toFixed(1)}% < ${CANONICAL_THRESHOLDS.MIN_COHORT_ROUNDTRIP_MATCH_PCT.toFixed(0)}% target. Malformed: ${malformed}`,
      remediation:
        "If match is low: (a) check that the Triple Whale ↔ Klaviyo cohort sync is firing on the order.created webhook (not on the abandoned_cart event — those are different); (b) verify the cohort name in Klaviyo is the EXACT name (case-sensitive) used in Triple Whale; (c) re-sync by toggling the Klaviyo integration in Triple Whale > Settings > Integrations > Klaviyo",
      headline_pct: match_pct,
      headline_label: "Match rate",
    };
  }
  return {
    gate_name: "klaviyo_tw_cohort_roundtrip",
    label,
    passed: true,
    detail: `✓ Cohort match: ${matched}/${total_valid} = ${match_pct.toFixed(1)}% (target ≥${CANONICAL_THRESHOLDS.MIN_COHORT_ROUNDTRIP_MATCH_PCT.toFixed(0)}%) | Sample size: ${sample_orders.length}`,
    remediation: null,
    headline_pct: match_pct,
    headline_label: "Match rate",
  };
}

// ----- Gate G — Attribution drift -----

export function checkAttributionDrift(fixture: Partial<AttributionDriftFixture>): GateResult {
  const label = AUDIT_GATE_LABELS.attribution_drift;
  const required = [
    "measurement_window_days",
    "drift_threshold_pct",
    "current_match_rate_pct",
    "previous_match_rate_pct",
    "current_revenue_delta_pct",
    "previous_revenue_delta_pct",
  ];
  const missing = required.filter((k) => !(k in fixture));
  if (missing.length > 0) {
    return {
      gate_name: "attribution_drift",
      label,
      passed: false,
      detail: `Missing keys: ${missing.join(", ")}`,
      remediation:
        "Set all six keys in attribution_drift.json. 'measurement_window_days' (e.g. 7), 'drift_threshold_pct' (e.g. 5.0), 'current_match_rate_pct' (this run's Gate A), 'previous_match_rate_pct' (last run's Gate A), and the current/previous revenue deltas from Gate E",
      headline_pct: null,
      headline_label: null,
    };
  }
  const window_days = clampInt(fixture.measurement_window_days, 1, 365);
  const threshold = clampFloat(fixture.drift_threshold_pct, 0.1, 100);
  const curr_match = clampFloat(fixture.current_match_rate_pct, 0, 100);
  const prev_match = clampFloat(fixture.previous_match_rate_pct, 0, 100);
  const curr_rev = clampFloat(fixture.current_revenue_delta_pct, 0, 100);
  const prev_rev = clampFloat(fixture.previous_revenue_delta_pct, 0, 100);

  if (window_days <= 0) {
    return {
      gate_name: "attribution_drift",
      label,
      passed: false,
      detail: `measurement_window_days=${window_days} must be > 0`,
      remediation: "measurement_window_days is the lookback window (7 or 14 typical)",
      headline_pct: null,
      headline_label: null,
    };
  }
  if (threshold <= 0) {
    return {
      gate_name: "attribution_drift",
      label,
      passed: false,
      detail: `drift_threshold_pct=${threshold} must be > 0`,
      remediation: "drift_threshold_pct is the maximum acceptable week-over-week change (5.0 typical)",
      headline_pct: null,
      headline_label: null,
    };
  }

  const match_drift = Math.abs(curr_match - prev_match);
  const rev_drift = Math.abs(curr_rev - prev_rev);
  const fail_reasons: string[] = [];
  if (match_drift > threshold) {
    fail_reasons.push(
      `match rate drift ${match_drift.toFixed(1)}pp > ${threshold.toFixed(1)}pp target (current ${curr_match.toFixed(1)}% vs previous ${prev_match.toFixed(1)}%)`,
    );
  }
  if (rev_drift > threshold) {
    fail_reasons.push(
      `revenue delta drift ${rev_drift.toFixed(1)}pp > ${threshold.toFixed(1)}pp target (current ${curr_rev.toFixed(1)}% vs previous ${prev_rev.toFixed(1)}%)`,
    );
  }

  const headline = Math.max(match_drift, rev_drift);
  if (fail_reasons.length > 0) {
    return {
      gate_name: "attribution_drift",
      label,
      passed: false,
      detail: `Window: ${window_days}d | Threshold: ${threshold.toFixed(1)}pp | Match drift: ${match_drift.toFixed(1)}pp (curr ${curr_match.toFixed(1)}% vs prev ${prev_match.toFixed(1)}%) | Rev drift: ${rev_drift.toFixed(1)}pp (curr ${curr_rev.toFixed(1)}% vs prev ${prev_rev.toFixed(1)}%) | Failures: ${fail_reasons.join("; ")}`,
      remediation:
        "A large drift in match rate or revenue delta means something changed in the attribution stack. Common causes: (a) a new ad platform was added without CAPI setup; (b) a refund/return policy change is being double-counted; (c) a webhook is delayed (Shopify > Settings > Notifications); (d) the Meta pixel was removed during a theme update",
      headline_pct: headline,
      headline_label: "Worst drift",
    };
  }
  return {
    gate_name: "attribution_drift",
    label,
    passed: true,
    detail: `✓ Window: ${window_days}d | ✓ Match drift: ${match_drift.toFixed(1)}pp (curr ${curr_match.toFixed(1)}% vs prev ${prev_match.toFixed(1)}%) | ✓ Rev drift: ${rev_drift.toFixed(1)}pp (curr ${curr_rev.toFixed(1)}% vs prev ${prev_rev.toFixed(1)}%)`,
    remediation: null,
    headline_pct: headline,
    headline_label: "Worst drift",
  };
}

// ----- Aggregation -----

export function buildAuditReport(inputs: AuditInputs): AuditReport {
  const gates: GateResult[] = [
    checkMetaCapiMatchRate(inputs.meta_capi),
    checkMetaPixelCoverage(inputs.meta_pixel),
    checkGoogleEnhancedConversionsQuality(inputs.google_ec),
    checkGa4TwRevenueDelta(inputs.ga4_tw),
    checkKlaviyoTwCohortRoundtrip(inputs.klaviyo_tw),
    checkAttributionDrift(inputs.drift),
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
  lines.push("# Attribution Quality Audit — Move #6.5 Verification");
  lines.push("");
  lines.push(
    `**Result:** ${report.passed_count}/${report.total_count} gates passing — ${report.overall_passed ? "ALL GATES PASSED" : "SOME GATES FAILED"}`,
  );
  lines.push("");
  lines.push("**Same math as `scripts/attribution_quality_audit.py`.**");
  lines.push("");
  for (const gate of report.gates) {
    lines.push(`## ${gate.label}`);
    lines.push("");
    lines.push(`**Status:** ${gate.passed ? "✓ PASS" : "✗ FAIL"}`);
    if (gate.headline_pct !== null && gate.headline_label !== null) {
      lines.push("");
      lines.push(`**Headline:** ${gate.headline_label} = ${gate.headline_pct.toFixed(1)}%`);
    }
    lines.push("");
    lines.push(gate.detail);
    if (!gate.passed && gate.remediation) {
      lines.push("");
      lines.push(`**Remediation:** ${gate.remediation}`);
    }
    lines.push("");
  }
  // Echo the raw fixtures (without redaction) so the report is portable.
  lines.push("## Raw inputs");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(inputs, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("_Browser port of `scripts/attribution_quality_audit.py` — Move #6.5 attribution quality audit._");
  return lines.join("\n");
}

// ----- Canonical-pass + stress-test fixtures -----

export function canonicalPassAll(): AuditInputs {
  return {
    meta_capi: { pixel_events: 1000, capi_events: 950, matched_events: 920, expected_orders_last_7d: 950 },
    meta_pixel: { pixel_fired_count: 10000, expected_pageviews: 10500 },
    google_ec: {
      quality_tier: "Good",
      hashed_email_coverage_pct: 85,
      total_conversions: 950,
      conversions_with_hashed_email: 808,
    },
    ga4_tw: { ga4_revenue_last_7d: 65000, tw_revenue_last_7d: 67500, actual_orders_last_7d: 950, expected_orders_last_7d: 950 },
    klaviyo_tw: {
      sample_orders: [
        { order_id: "1001", klaviyo_cohort: "Welcome Series", tw_cohort: "Welcome Series" },
        { order_id: "1002", klaviyo_cohort: "SMS Welcome", tw_cohort: "SMS Welcome" },
        { order_id: "1003", klaviyo_cohort: "Loyalty Member", tw_cohort: "Loyalty Member" },
        { order_id: "1004", klaviyo_cohort: "Abandoned Cart", tw_cohort: "Abandoned Cart" },
        { order_id: "1005", klaviyo_cohort: "Organic", tw_cohort: "Organic" },
      ],
    },
    drift: {
      measurement_window_days: 7,
      drift_threshold_pct: 5,
      current_match_rate_pct: 96.8,
      previous_match_rate_pct: 95,
      current_revenue_delta_pct: 3.7,
      previous_revenue_delta_pct: 4.1,
    },
  };
}

export function stressTestFailAll(): AuditInputs {
  return {
    meta_capi: { pixel_events: 1000, capi_events: 100, matched_events: 200, expected_orders_last_7d: 950 },
    meta_pixel: { pixel_fired_count: 4500, expected_pageviews: 10500 },
    google_ec: {
      quality_tier: "Needs improvement",
      hashed_email_coverage_pct: 35,
      total_conversions: 950,
      conversions_with_hashed_email: 332,
    },
    ga4_tw: { ga4_revenue_last_7d: 50000, tw_revenue_last_7d: 67500, actual_orders_last_7d: 750, expected_orders_last_7d: 950 },
    klaviyo_tw: {
      sample_orders: [
        { order_id: "2001", klaviyo_cohort: "Welcome Series", tw_cohort: "Paid Social" },
        { order_id: "2002", klaviyo_cohort: "SMS Welcome", tw_cohort: "Organic" },
        { order_id: "2003", klaviyo_cohort: "Loyalty Member", tw_cohort: "Paid Social" },
        { order_id: "2004", klaviyo_cohort: "Abandoned Cart", tw_cohort: "Welcome Series" },
        { order_id: "2005", klaviyo_cohort: "Organic", tw_cohort: "Paid Search" },
      ],
    },
    drift: {
      measurement_window_days: 7,
      drift_threshold_pct: 5,
      current_match_rate_pct: 75.2,
      previous_match_rate_pct: 95,
      current_revenue_delta_pct: 12.8,
      previous_revenue_delta_pct: 4.1,
    },
  };
}

// ----- UI helpers -----

export function verdictBadgeClasses(passed: boolean): string {
  return passed
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400";
}

export function verdictShortLabel(passed: boolean): string {
  return passed ? "PASS" : "FAIL";
}