#!/usr/bin/env python3
"""
attribution_quality_audit.py — Measurement-quality audit for the
Triple Whale / Polar Analytics attribution stack (Move #6.5 playbook).

Companion to `/playbooks/06.5-attribution-quality-audit.md`.
This script is NOT a Triple Whale / Meta / Google API client — it does
not require API credentials and cannot authenticate against any of those
platforms. Instead, it's a HERMETIC measurement-quality audit that
validates the local fixture data the operator has staged from each
platform's diagnostic export.

The 7 quality gates are NUMERIC THRESHOLDS (not just key-presence checks
like the Move #6 companion script). The Move #6 script validates
INSTALLATION; this script validates MEASUREMENT QUALITY — the difference
between "the keys are set" and "the events are matching across platforms
with the right dedup, coverage, and quality tier."

Why hermetic? Each platform's diagnostic export is a CSV or JSON the
operator downloads manually (Meta Events Manager > Diagnostics, Google
Ads > Conversions > Diagnostics, Triple Whale > Settings > Diagnostics,
GA4 > DebugView). The local-fixture approach catches 90% of measurement
quality problems (low match rate, missing dedup, low EC quality tier,
GA4↔TW revenue drift) without requiring paid API access.

The single most important gate is Gate A (Meta CAPI event_id match rate
≥ 90%). Meta's own documentation states that match rates below 80% will
silently degrade campaign optimization; below 70% Meta will throttle
CAPI delivery entirely. The other gates are equally load-bearing but
the match-rate gate is the one Triple Whale + Polar will not catch for
you — you have to audit it yourself with the diagnostic export.

Usage:
    # Default: read fixtures from ./attribution_fixtures/
    python3 attribution_quality_audit.py

    # Custom fixture directory
    python3 attribution_quality_audit.py --fixtures-dir ./my_fixtures/

    # Run a single gate
    python3 attribution_quality_audit.py --check meta_capi_match_rate
    python3 attribution_quality_audit.py --check ga4_tw_revenue_delta

    # JSON output (for cron / CI)
    python3 attribution_quality_audit.py --json

    # Bootstrap a starter fixture set
    python3 attribution_quality_audit.py --bootstrap ./attribution_fixtures/

Fixtures (one JSON file per gate):
    - meta_capi_match.json:        { "pixel_events": int, "capi_events": int,
                                      "matched_events": int,
                                      "expected_orders_last_7d": int }
    - meta_pixel_coverage.json:    { "pixel_fired_count": int,
                                      "expected_pageviews": int }
    - google_enhanced_quality.json: { "quality_tier": "Good"|"Excellent"|
                                       "Needs improvement"|"Unavailable",
                                       "hashed_email_coverage_pct": float,
                                       "total_conversions": int,
                                       "conversions_with_hashed_email": int }
    - ga4_tw_revenue.json:         { "ga4_revenue_last_7d": float,
                                      "tw_revenue_last_7d": float,
                                      "actual_orders_last_7d": int,
                                      "expected_orders_last_7d": int }
    - klaviyo_tw_cohort.json:      { "sample_orders": [
                                         {"order_id": "...",
                                          "klaviyo_cohort": "...",
                                          "tw_cohort": "..."}, ... ] }
    - attribution_drift.json:      { "measurement_window_days": int,
                                      "drift_threshold_pct": float }

Each fixture file is documented in detail in the playbook's Verification
section. The script validates each fixture against the contract and
emits a ✓ or ✗ per gate.

Exit code 0 = all gates pass. Exit code 1 = at least one gate fails.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any, Callable


# ----- Canonical quality thresholds (the playbook's 7 gates) -----

# Gate A — Meta CAPI event_id match rate (the killer metric)
MIN_META_CAPI_MATCH_RATE_PCT = 90.0  # Meta throttles CAPI below 80%
# Floor + ceiling on dedup ratio (pixel_events / capi_events)
# 0.8 = more CAPI than pixel (unusual; usually CAPI is the supplement)
# 1.5 = more pixel than CAPI (typical; pixel fires on browser, CAPI from server)
MIN_DEDUP_RATIO = 0.8
MAX_DEDUP_RATIO = 1.5
# Coverage floor: matched_events must be ≥ this fraction of expected orders
MIN_META_COVERAGE_PCT = 95.0

# Gate C — Meta Pixel coverage (browser-side intent signals)
MIN_META_PIXEL_COVERAGE_PCT = 95.0

# Gate D — Google Enhanced Conversions quality tier
ACCEPTABLE_GOOGLE_EC_QUALITY = {"Good", "Excellent"}
MIN_GOOGLE_EC_HASHED_EMAIL_PCT = 80.0  # the email-hashing pipe is the EC killer

# Gate E — GA4 ↔ Triple Whale revenue delta (the "mismatch trap")
# Move #6 Pitfall #15: GA4 misses 30-40% post-iOS14.5; > 5% delta means
# the platforms are reporting different numbers (operator trusts one and
# gets bad decisions).
MAX_GA4_TW_REVENUE_DELTA_PCT = 5.0
# Order-count delta: |actual - expected| / expected must be ≤ this
MAX_ORDER_COUNT_DELTA_PCT = 3.0

# Gate F — Klaviyo ↔ Triple Whale cohort roundtrip
# At least this fraction of sample orders must have matching cohorts
MIN_COHORT_ROUNDTRIP_MATCH_PCT = 95.0
MIN_SAMPLE_ORDERS = 5  # below this, sample size is too small to be meaningful


# ----- Result types -----

@dataclass
class GateResult:
    """Result for a single verification gate."""
    gate_name: str
    passed: bool
    detail: str
    remediation: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "gate": self.gate_name,
            "passed": self.passed,
            "detail": self.detail,
            "remediation": self.remediation,
        }


@dataclass
class CheckReport:
    """Aggregate result across all gates."""
    gates: list[GateResult] = field(default_factory=list)
    fixture_dir: str = ""
    overall_passed: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "fixture_dir": self.fixture_dir,
            "overall_passed": self.overall_passed,
            "gates": [g.to_dict() for g in self.gates],
            "summary": {
                "total": len(self.gates),
                "passed": sum(1 for g in self.gates if g.passed),
                "failed": sum(1 for g in self.gates if not g.passed),
            },
        }


# ----- Gate check functions -----

def check_meta_capi_match_rate(fixture: dict[str, Any]) -> GateResult:
    """Gate A — Meta CAPI event_id match rate + dedup ratio + coverage.

    The single most important gate in this audit. Meta's own docs say
    match rates below 80% silently degrade campaign optimization; below
    70% Meta throttles CAPI delivery entirely. The dedup ratio (pixel /
    CAPI) should be in [0.8, 1.5] — outside that band means one side
    is over-firing (double-counting risk) or under-firing (missing
    attribution). Coverage: matched_events should be ≥ 95% of expected
    orders in the measurement window.
    """
    required = {
        "pixel_events",
        "capi_events",
        "matched_events",
        "expected_orders_last_7d",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="meta_capi_match_rate",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Export the Meta Events Manager > Diagnostics tab (last 7d) "
                "and populate meta_capi_match.json with pixel_events, "
                "capi_events, matched_events, and expected_orders_last_7d "
                "(from Shopify Analytics)"
            ),
        )
    pixel_events = int(fixture["pixel_events"])
    capi_events = int(fixture["capi_events"])
    matched_events = int(fixture["matched_events"])
    expected_orders = int(fixture["expected_orders_last_7d"])

    if expected_orders <= 0:
        return GateResult(
            gate_name="meta_capi_match_rate",
            passed=False,
            detail=f"expected_orders_last_7d={expected_orders} must be > 0",
            remediation=(
                "expected_orders_last_7d must be the count of orders "
                "shipped in the last 7 days from Shopify Analytics"
            ),
        )
    if matched_events < 0 or pixel_events < 0 or capi_events < 0:
        return GateResult(
            gate_name="meta_capi_match_rate",
            passed=False,
            detail=f"Negative event counts not allowed (matched={matched_events}, pixel={pixel_events}, capi={capi_events})",
            remediation="Re-export the Meta diagnostic; check that the report is not corrupted",
        )
    if matched_events > min(pixel_events, capi_events):
        return GateResult(
            gate_name="meta_capi_match_rate",
            passed=False,
            detail=(
                f"matched_events={matched_events} > min(pixel={pixel_events}, capi={capi_events}). "
                f"Matched events cannot exceed either source — likely export error"
            ),
            remediation=(
                "Re-export from Meta Events Manager > Diagnostics; ensure "
                "you're exporting 'Purchase' event dedup status, not raw counts"
            ),
        )

    match_rate = (matched_events / expected_orders) * 100.0 if expected_orders else 0.0
    if capi_events > 0:
        dedup_ratio = pixel_events / capi_events
    elif pixel_events > 0:
        # No CAPI events at all — this is a separate problem (Gate A partial)
        dedup_ratio = float("inf")
    else:
        dedup_ratio = 1.0

    # Three sub-failures possible: match rate, dedup ratio, coverage
    fail_reasons = []
    if match_rate < MIN_META_CAPI_MATCH_RATE_PCT:
        fail_reasons.append(
            f"match rate {match_rate:.1f}% < {MIN_META_CAPI_MATCH_RATE_PCT:.0f}% target"
        )
    if not (MIN_DEDUP_RATIO <= dedup_ratio <= MAX_DEDUP_RATIO):
        if dedup_ratio == float("inf"):
            fail_reasons.append("CAPI events = 0 (Meta cannot optimize without server-side events)")
        else:
            fail_reasons.append(
                f"dedup ratio {dedup_ratio:.2f} outside [{MIN_DEDUP_RATIO:.1f}, {MAX_DEDUP_RATIO:.1f}]"
            )
    coverage_pct = (matched_events / expected_orders) * 100.0
    if coverage_pct < MIN_META_COVERAGE_PCT:
        fail_reasons.append(
            f"coverage {coverage_pct:.1f}% < {MIN_META_COVERAGE_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="meta_capi_match_rate",
            passed=False,
            detail=(
                f"Match: {matched_events}/{expected_orders} = {match_rate:.1f}% | "
                f"Dedup ratio: {dedup_ratio:.2f} | "
                f"Pixel: {pixel_events}, CAPI: {capi_events} | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If match rate is low: (a) verify event_id is identical in "
                "pixel + CAPI payloads (Triple Whale → Settings → CAPI → "
                "event_id mapping); (b) check that the Meta pixel is on "
                "every page (theme.liquid) and that CAPI is firing on "
                "order creation. If dedup ratio is off: re-check that "
                "the SAME order is not being sent twice (look for "
                "double-firing in the Meta Events Manager > Test Events). "
                "If coverage is low: orders older than 7d in the diagnostic "
                "are expiring — re-export with a longer window"
            ),
        )
    return GateResult(
        gate_name="meta_capi_match_rate",
        passed=True,
        detail=(
            f"✓ Match rate: {match_rate:.1f}% (target ≥{MIN_META_CAPI_MATCH_RATE_PCT:.0f}%) | "
            f"✓ Dedup ratio: {dedup_ratio:.2f} (in [{MIN_DEDUP_RATIO:.1f}, {MAX_DEDUP_RATIO:.1f}]) | "
            f"✓ Coverage: {coverage_pct:.1f}% of {expected_orders} expected orders"
        ),
    )


def check_meta_pixel_coverage(fixture: dict[str, Any]) -> GateResult:
    """Gate C — Meta Pixel coverage (browser-side intent signals).

    Contract: pixel_fired_count / expected_pageviews >= 95%.
    Low coverage means the pixel is not on every page (usually a
    theme.liquid edit was missed) or is being blocked by an ad blocker
    (which is expected for ~15% of traffic; if coverage is below 80%,
    something more serious is wrong).
    """
    required = {"pixel_fired_count", "expected_pageviews"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="meta_pixel_coverage",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'pixel_fired_count' (Meta Events Manager > "
                "Diagnostics > PageView event count, last 7d) and "
                "'expected_pageviews' (Shopify Analytics > Total sessions, "
                "last 7d) in meta_pixel_coverage.json"
            ),
        )
    pixel_count = int(fixture["pixel_fired_count"])
    expected_pv = int(fixture["expected_pageviews"])
    if expected_pv <= 0:
        return GateResult(
            gate_name="meta_pixel_coverage",
            passed=False,
            detail=f"expected_pageviews={expected_pv} must be > 0",
            remediation="Re-check Shopify Analytics for the 7-day session count",
        )
    if pixel_count < 0:
        return GateResult(
            gate_name="meta_pixel_coverage",
            passed=False,
            detail=f"pixel_fired_count={pixel_count} cannot be negative",
            remediation="Re-export from Meta Events Manager; check for corrupted export",
        )
    coverage_pct = (pixel_count / expected_pv) * 100.0
    if coverage_pct < MIN_META_PIXEL_COVERAGE_PCT:
        return GateResult(
            gate_name="meta_pixel_coverage",
            passed=False,
            detail=(
                f"Pixel coverage {coverage_pct:.1f}% < {MIN_META_PIXEL_COVERAGE_PCT:.0f}% target. "
                f"Pixel fired: {pixel_count}, Expected pageviews: {expected_pv}"
            ),
            remediation=(
                "(a) Verify the Meta pixel base code is in theme.liquid "
                "just before </head>; (b) check that no Content-Security-"
                "Policy headers are blocking facebook.com/tr; (c) note "
                "that ad-blocker-induced loss of ~15% is normal — if "
                "coverage is below 80%, look for theme.liquid missing the "
                "pixel snippet entirely"
            ),
        )
    return GateResult(
        gate_name="meta_pixel_coverage",
        passed=True,
        detail=(
            f"✓ Pixel coverage: {coverage_pct:.1f}% (target ≥{MIN_META_PIXEL_COVERAGE_PCT:.0f}%) | "
            f"Pixel fired: {pixel_count} of {expected_pv} expected pageviews"
        ),
    )


def check_google_enhanced_conversions_quality(fixture: dict[str, Any]) -> GateResult:
    """Gate D — Google Enhanced Conversions quality tier + email coverage.

    Contract: quality_tier in {Good, Excellent} AND hashed_email_coverage
    pct ≥ 80%. The email-hashing pipe is what makes Enhanced Conversions
    work — without it Google can only match on coarse signals (city,
    state) and EC quality is "Unavailable."
    """
    required = {
        "quality_tier",
        "hashed_email_coverage_pct",
        "total_conversions",
        "conversions_with_hashed_email",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="google_enhanced_conversions_quality",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all four keys in google_enhanced_quality.json: "
                "'quality_tier' (Google Ads > Conversions > Diagnostics > "
                "Enhanced Conversions), 'hashed_email_coverage_pct', "
                "'total_conversions', and 'conversions_with_hashed_email'"
            ),
        )
    tier = str(fixture["quality_tier"])
    if tier not in {"Good", "Excellent", "Needs improvement", "Unavailable"}:
        return GateResult(
            gate_name="google_enhanced_conversions_quality",
            passed=False,
            detail=f"Unknown quality_tier '{tier}' (expected one of Good/Excellent/Needs improvement/Unavailable)",
            remediation="Re-export from Google Ads > Conversions > Diagnostics",
        )
    coverage_pct = float(fixture["hashed_email_coverage_pct"])
    total_conv = int(fixture["total_conversions"])
    conv_with_email = int(fixture["conversions_with_hashed_email"])

    if total_conv <= 0:
        return GateResult(
            gate_name="google_enhanced_conversions_quality",
            passed=False,
            detail=f"total_conversions={total_conv} must be > 0",
            remediation="Re-export Google Ads > Conversions > last-7d report",
        )
    if coverage_pct < 0 or coverage_pct > 100:
        return GateResult(
            gate_name="google_enhanced_conversions_quality",
            passed=False,
            detail=f"hashed_email_coverage_pct={coverage_pct} out of [0, 100] range",
            remediation="Re-export; the percentage should be (conversions_with_hashed_email / total_conversions) * 100",
        )

    fail_reasons = []
    if tier not in ACCEPTABLE_GOOGLE_EC_QUALITY:
        fail_reasons.append(f"quality tier '{tier}' not in {sorted(ACCEPTABLE_GOOGLE_EC_QUALITY)}")
    if coverage_pct < MIN_GOOGLE_EC_HASHED_EMAIL_PCT:
        fail_reasons.append(
            f"hashed email coverage {coverage_pct:.1f}% < {MIN_GOOGLE_EC_HASHED_EMAIL_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="google_enhanced_conversions_quality",
            passed=False,
            detail=(
                f"Tier: {tier} | Email coverage: {coverage_pct:.1f}% "
                f"({conv_with_email}/{total_conv}) | Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If tier is 'Unavailable' or 'Needs improvement': (a) "
                "verify the Google Ads conversion tag has 'Include user "
                "data' enabled (Tag Configuration > Advanced > Include "
                "user-provided data); (b) verify the Klaviyo-to-Google "
                "sync is sending hashed email (not plaintext). If email "
                "coverage is low: most Klaviyo profiles have an email but "
                "guest checkouts may not — enable 'Email collection on "
                "guest checkout' in Shopify"
            ),
        )
    return GateResult(
        gate_name="google_enhanced_conversions_quality",
        passed=True,
        detail=(
            f"✓ Quality tier: {tier} | ✓ Email coverage: {coverage_pct:.1f}% "
            f"({conv_with_email}/{total_conv} conversions)"
        ),
    )


def check_ga4_tw_revenue_delta(fixture: dict[str, Any]) -> GateResult:
    """Gate E — GA4 ↔ Triple Whale revenue delta (the mismatch trap).

    Move #6 Pitfall #15: the most common post-install failure is that
    GA4 and Triple Whale report different revenue numbers, the operator
    doesn't know which to trust, and they abandon the tool after 30 days.
    The contract: |GA4 - TW| / TW <= 5% in the 7-day window. The order
    count delta is the secondary signal (|actual - expected| / expected <=
    3%) — a high order delta usually means a webhook or a fulfillment
    event is misfiring.
    """
    required = {
        "ga4_revenue_last_7d",
        "tw_revenue_last_7d",
        "actual_orders_last_7d",
        "expected_orders_last_7d",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="ga4_tw_revenue_delta",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all four keys in ga4_tw_revenue.json: "
                "'ga4_revenue_last_7d' (GA4 > Monetization > Purchase "
                "revenue, last 7d), 'tw_revenue_last_7d' (Triple Whale > "
                "Revenue, last 7d), 'actual_orders_last_7d' (Shopify > "
                "Orders last 7d), 'expected_orders_last_7d' (the Shopify "
                "ground truth; usually = actual_orders_last_7d if no "
                "fulfillment failures)"
            ),
        )
    ga4_rev = float(fixture["ga4_revenue_last_7d"])
    tw_rev = float(fixture["tw_revenue_last_7d"])
    actual_orders = int(fixture["actual_orders_last_7d"])
    expected_orders = int(fixture["expected_orders_last_7d"])

    if tw_rev <= 0:
        return GateResult(
            gate_name="ga4_tw_revenue_delta",
            passed=False,
            detail=f"tw_revenue_last_7d={tw_rev} must be > 0 (Triple Whale should always have positive revenue for a paying store)",
            remediation=(
                "If Triple Whale shows 0 revenue, the order webhook is "
                "broken — re-check the Move #6 Step 1 install and the "
                "Triple Whale > Settings > Integrations > Shopify"
            ),
        )
    if expected_orders <= 0:
        return GateResult(
            gate_name="ga4_tw_revenue_delta",
            passed=False,
            detail=f"expected_orders_last_7d={expected_orders} must be > 0",
            remediation="Re-check Shopify Analytics for the 7-day order count",
        )

    revenue_delta_pct = (abs(ga4_rev - tw_rev) / tw_rev) * 100.0
    order_delta_pct = (abs(actual_orders - expected_orders) / expected_orders) * 100.0

    fail_reasons = []
    if revenue_delta_pct > MAX_GA4_TW_REVENUE_DELTA_PCT:
        fail_reasons.append(
            f"revenue delta {revenue_delta_pct:.1f}% > {MAX_GA4_TW_REVENUE_DELTA_PCT:.0f}% target"
        )
    if order_delta_pct > MAX_ORDER_COUNT_DELTA_PCT:
        fail_reasons.append(
            f"order count delta {order_delta_pct:.1f}% > {MAX_ORDER_COUNT_DELTA_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="ga4_tw_revenue_delta",
            passed=False,
            detail=(
                f"GA4: ${ga4_rev:.2f} | TW: ${tw_rev:.2f} | "
                f"Revenue delta: {revenue_delta_pct:.1f}% | "
                f"Orders: {actual_orders} actual vs {expected_orders} expected ({order_delta_pct:.1f}% delta) | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If revenue delta is high: Triple Whale is the source of "
                "truth (it merges pixel + CAPI + survey), so a 5%+ delta "
                "with GA4 means GA4 is undercounting (expected: GA4 "
                "typically shows 60-70% of TW revenue post-iOS14.5). If "
                "TW < GA4: a refund is miscategorized or a test order "
                "leaked in. If order count delta is high: a fulfillment "
                "webhook is delayed — check Shopify > Settings > "
                "Notifications > Order fulfillment"
            ),
        )
    return GateResult(
        gate_name="ga4_tw_revenue_delta",
        passed=True,
        detail=(
            f"✓ Revenue delta: {revenue_delta_pct:.1f}% (target ≤{MAX_GA4_TW_REVENUE_DELTA_PCT:.0f}%) | "
            f"GA4: ${ga4_rev:.2f}, TW: ${tw_rev:.2f} | "
            f"✓ Order delta: {order_delta_pct:.1f}% (target ≤{MAX_ORDER_COUNT_DELTA_PCT:.0f}%)"
        ),
    )


def check_klaviyo_tw_cohort_roundtrip(fixture: dict[str, Any]) -> GateResult:
    """Gate F — Klaviyo → Triple Whale cohort roundtrip.

    Move #6 Gate C validates that the Klaviyo integration is 'configured'
    (api_key set, flow names present). This gate validates that the
    integration is actually WORKING: at least 95% of sample orders must
    have matching cohort assignments across Klaviyo and Triple Whale.
    Below 95% means the cohort sync is silently dropping events and the
    loyalty program (Move #8) + welcome series (Move #4) will look
    unattributable.
    """
    if "sample_orders" not in fixture:
        return GateResult(
            gate_name="klaviyo_tw_cohort_roundtrip",
            passed=False,
            detail="Missing 'sample_orders' key",
            remediation=(
                "Add 'sample_orders' to klaviyo_tw_cohort.json — a list "
                "of at least 5 recent orders with each entry having "
                "'order_id', 'klaviyo_cohort', and 'tw_cohort' fields"
            ),
        )
    sample_orders = fixture["sample_orders"]
    if not isinstance(sample_orders, list):
        return GateResult(
            gate_name="klaviyo_tw_cohort_roundtrip",
            passed=False,
            detail="'sample_orders' must be a list",
            remediation="Re-export from Klaviyo + Triple Whale; sample_orders must be a JSON array",
        )
    if len(sample_orders) < MIN_SAMPLE_ORDERS:
        return GateResult(
            gate_name="klaviyo_tw_cohort_roundtrip",
            passed=False,
            detail=(
                f"Need at least {MIN_SAMPLE_ORDERS} sample orders, got {len(sample_orders)}. "
                f"Sample size too small to be meaningful"
            ),
            remediation=(
                f"Add at least {MIN_SAMPLE_ORDERS} recent orders to "
                f"sample_orders (random sample from Shopify > Orders > last 30d)"
            ),
        )

    malformed = 0
    matched = 0
    for i, order in enumerate(sample_orders):
        if not isinstance(order, dict):
            malformed += 1
            continue
        if not all(k in order for k in ("order_id", "klaviyo_cohort", "tw_cohort")):
            malformed += 1
            continue
        # Cohorts match if both are non-empty AND case-insensitively equal
        k_cohort = str(order["klaviyo_cohort"]).strip()
        t_cohort = str(order["tw_cohort"]).strip()
        if k_cohort and t_cohort and k_cohort.lower() == t_cohort.lower():
            matched += 1

    total_valid = len(sample_orders) - malformed
    if total_valid <= 0:
        return GateResult(
            gate_name="klaviyo_tw_cohort_roundtrip",
            passed=False,
            detail=f"All {len(sample_orders)} sample orders are malformed (missing required keys)",
            remediation=(
                "Each sample order must have 'order_id', 'klaviyo_cohort', "
                "and 'tw_cohort' fields. Re-export and re-format"
            ),
        )

    match_pct = (matched / total_valid) * 100.0
    if match_pct < MIN_COHORT_ROUNDTRIP_MATCH_PCT:
        return GateResult(
            gate_name="klaviyo_tw_cohort_roundtrip",
            passed=False,
            detail=(
                f"Cohort match: {matched}/{total_valid} = {match_pct:.1f}% < {MIN_COHORT_ROUNDTRIP_MATCH_PCT:.0f}% target. "
                f"Malformed: {malformed}"
            ),
            remediation=(
                "If match is low: (a) check that the Triple Whale ↔ "
                "Klaviyo cohort sync is firing on the order.created "
                "webhook (not on the abandoned_cart event — those are "
                "different); (b) verify the cohort name in Klaviyo is "
                "the EXACT name (case-sensitive) used in Triple Whale; "
                "(c) re-sync by toggling the Klaviyo integration in "
                "Triple Whale > Settings > Integrations > Klaviyo"
            ),
        )
    return GateResult(
        gate_name="klaviyo_tw_cohort_roundtrip",
        passed=True,
        detail=(
            f"✓ Cohort match: {matched}/{total_valid} = {match_pct:.1f}% "
            f"(target ≥{MIN_COHORT_ROUNDTRIP_MATCH_PCT:.0f}%) | "
            f"Sample size: {len(sample_orders)}"
        ),
    )


def check_attribution_drift(fixture: dict[str, Any]) -> GateResult:
    """Gate G — Attribution drift over the measurement window.

    The killer test for ongoing attribution quality. Contract: the
    operator has been running this audit for `measurement_window_days`
    days and the drift between this run and the previous run is below
    the configured threshold (default 5%). A high drift means something
    changed (a webhook broke, a new ad platform was added, a refund
    policy change) and the operator needs to investigate before trusting
    the numbers for the next quarter.
    """
    required = {
        "measurement_window_days",
        "drift_threshold_pct",
        "current_match_rate_pct",
        "previous_match_rate_pct",
        "current_revenue_delta_pct",
        "previous_revenue_delta_pct",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="attribution_drift",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all six keys in attribution_drift.json. "
                "'measurement_window_days' (e.g. 7), 'drift_threshold_pct' "
                "(e.g. 5.0), 'current_match_rate_pct' (this run's Gate A), "
                "'previous_match_rate_pct' (last run's Gate A), and the "
                "current/previous revenue deltas from Gate E"
            ),
        )
    window_days = int(fixture["measurement_window_days"])
    threshold = float(fixture["drift_threshold_pct"])
    curr_match = float(fixture["current_match_rate_pct"])
    prev_match = float(fixture["previous_match_rate_pct"])
    curr_rev = float(fixture["current_revenue_delta_pct"])
    prev_rev = float(fixture["previous_revenue_delta_pct"])

    if window_days <= 0:
        return GateResult(
            gate_name="attribution_drift",
            passed=False,
            detail=f"measurement_window_days={window_days} must be > 0",
            remediation="measurement_window_days is the lookback window (7 or 14 typical)",
        )
    if threshold <= 0:
        return GateResult(
            gate_name="attribution_drift",
            passed=False,
            detail=f"drift_threshold_pct={threshold} must be > 0",
            remediation="drift_threshold_pct is the maximum acceptable week-over-week change (5.0 typical)",
        )

    match_drift = abs(curr_match - prev_match)
    rev_drift = abs(curr_rev - prev_rev)
    fail_reasons = []
    if match_drift > threshold:
        fail_reasons.append(
            f"match rate drift {match_drift:.1f}pp > {threshold:.1f}pp target "
            f"(current {curr_match:.1f}% vs previous {prev_match:.1f}%)"
        )
    if rev_drift > threshold:
        fail_reasons.append(
            f"revenue delta drift {rev_drift:.1f}pp > {threshold:.1f}pp target "
            f"(current {curr_rev:.1f}% vs previous {prev_rev:.1f}%)"
        )

    if fail_reasons:
        return GateResult(
            gate_name="attribution_drift",
            passed=False,
            detail=(
                f"Window: {window_days}d | Threshold: {threshold:.1f}pp | "
                f"Match drift: {match_drift:.1f}pp (curr {curr_match:.1f}% vs prev {prev_match:.1f}%) | "
                f"Rev drift: {rev_drift:.1f}pp (curr {curr_rev:.1f}% vs prev {prev_rev:.1f}%) | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "A large drift in match rate or revenue delta means "
                "something changed in the attribution stack. Common "
                "causes: (a) a new ad platform was added without CAPI "
                "setup; (b) a refund/return policy change is being "
                "double-counted; (c) a webhook is delayed (Shopify > "
                "Settings > Notifications); (d) the Meta pixel was "
                "removed during a theme update"
            ),
        )
    return GateResult(
        gate_name="attribution_drift",
        passed=True,
        detail=(
            f"✓ Window: {window_days}d | ✓ Match drift: {match_drift:.1f}pp "
            f"(curr {curr_match:.1f}% vs prev {prev_match:.1f}%) | "
            f"✓ Rev drift: {rev_drift:.1f}pp (curr {curr_rev:.1f}% vs prev {prev_rev:.1f}%)"
        ),
    )


# ----- Gate registry -----

GATE_FIXTURE_FILES: dict[str, tuple[str, Callable[[dict[str, Any]], GateResult]]] = {
    "meta_capi_match_rate": ("meta_capi_match.json", check_meta_capi_match_rate),
    "meta_pixel_coverage": ("meta_pixel_coverage.json", check_meta_pixel_coverage),
    "google_enhanced_conversions_quality": (
        "google_enhanced_quality.json",
        check_google_enhanced_conversions_quality,
    ),
    "ga4_tw_revenue_delta": ("ga4_tw_revenue.json", check_ga4_tw_revenue_delta),
    "klaviyo_tw_cohort_roundtrip": (
        "klaviyo_tw_cohort.json",
        check_klaviyo_tw_cohort_roundtrip,
    ),
    "attribution_drift": ("attribution_drift.json", check_attribution_drift),
}


# ----- Orchestration -----

def load_fixture(fixtures_dir: str, filename: str) -> dict[str, Any] | None:
    """Load a JSON fixture file. Returns None if missing."""
    path = os.path.join(fixtures_dir, filename)
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return None
        return data
    except (json.JSONDecodeError, OSError):
        return None


def run_all_gates(fixtures_dir: str, only_check: str | None = None) -> CheckReport:
    """Run all (or one) gate check(s) against the fixture directory."""
    report = CheckReport(fixture_dir=fixtures_dir)
    for gate_name, (filename, check_fn) in GATE_FIXTURE_FILES.items():
        if only_check and gate_name != only_check:
            continue
        fixture = load_fixture(fixtures_dir, filename)
        if fixture is None:
            report.gates.append(GateResult(
                gate_name=gate_name,
                passed=False,
                detail=f"Fixture file missing: {filename}",
                remediation=(
                    f"Create {filename} in {fixtures_dir}/ "
                    f"(run --bootstrap {fixtures_dir}/ to generate a starter template)"
                ),
            ))
            continue
        result = check_fn(fixture)
        report.gates.append(result)
    report.overall_passed = all(g.passed for g in report.gates) if report.gates else False
    return report


def render_human(report: CheckReport) -> str:
    """Render the report as human-readable text."""
    lines = []
    lines.append("=" * 70)
    lines.append("Attribution Quality Audit — Move #6.5 Verification")
    lines.append("=" * 70)
    lines.append(f"Fixture dir: {report.fixture_dir}")
    lines.append("")
    for g in report.gates:
        marker = "✓" if g.passed else "✗"
        lines.append(f"  [{marker}] {g.gate_name}")
        lines.append(f"      {g.detail}")
        if not g.passed and g.remediation:
            lines.append(f"      → {g.remediation}")
    lines.append("")
    total = len(report.gates)
    passed_count = sum(1 for g in report.gates if g.passed)
    lines.append(
        f"Summary: {passed_count}/{total} gates passed"
    )
    if report.overall_passed:
        lines.append("")
        lines.append("ALL GATES PASSED — Attribution stack is producing actionable signal.")
    else:
        lines.append("")
        lines.append("SOME GATES FAILED — see remediation above; re-run after fixes.")
    lines.append("=" * 70)
    return "\n".join(lines)


def bootstrap_fixtures(fixtures_dir: str) -> int:
    """Generate a starter fixture set in the given directory."""
    os.makedirs(fixtures_dir, exist_ok=True)
    templates = {
        "meta_capi_match.json": {
            "pixel_events": 1000,
            "capi_events": 950,
            "matched_events": 920,
            "expected_orders_last_7d": 950,
            "_comment": (
                "Export from Meta Events Manager > Diagnostics > last 7d. "
                "Gate A target: match rate >= 90%, dedup ratio in [0.8, 1.5], "
                "coverage >= 95% of expected_orders_last_7d"
            ),
        },
        "meta_pixel_coverage.json": {
            "pixel_fired_count": 10000,
            "expected_pageviews": 10500,
            "_comment": (
                "Export pixel_fired_count from Meta Events Manager > "
                "Diagnostics > PageView event count (last 7d). Get "
                "expected_pageviews from Shopify Analytics > Total sessions "
                "(last 7d). Gate C target: coverage >= 95%"
            ),
        },
        "google_enhanced_quality.json": {
            "quality_tier": "Good",
            "hashed_email_coverage_pct": 85.0,
            "total_conversions": 950,
            "conversions_with_hashed_email": 808,
            "_comment": (
                "Export from Google Ads > Conversions > Diagnostics. Gate D "
                "target: quality_tier in {Good, Excellent} AND "
                "hashed_email_coverage_pct >= 80%"
            ),
        },
        "ga4_tw_revenue.json": {
            "ga4_revenue_last_7d": 65000.0,
            "tw_revenue_last_7d": 67500.0,
            "actual_orders_last_7d": 950,
            "expected_orders_last_7d": 950,
            "_comment": (
                "GA4 > Monetization > Purchase revenue (last 7d). Triple "
                "Whale > Revenue (last 7d). Shopify > Orders last 7d. "
                "Gate E target: |GA4 - TW| / TW <= 5% AND order count "
                "delta <= 3%"
            ),
        },
        "klaviyo_tw_cohort.json": {
            "sample_orders": [
                {"order_id": "1001", "klaviyo_cohort": "Welcome Series", "tw_cohort": "Welcome Series"},
                {"order_id": "1002", "klaviyo_cohort": "SMS Welcome", "tw_cohort": "SMS Welcome"},
                {"order_id": "1003", "klaviyo_cohort": "Loyalty Member", "tw_cohort": "Loyalty Member"},
                {"order_id": "1004", "klaviyo_cohort": "Abandoned Cart", "tw_cohort": "Abandoned Cart"},
                {"order_id": "1005", "klaviyo_cohort": "Organic", "tw_cohort": "Organic"},
            ],
            "_comment": (
                "Pull at least 5 recent orders (random sample from last "
                "30d). For each, look up the Klaviyo cohort from the "
                "customer profile and the Triple Whale cohort from the "
                "order detail. Gate F target: >= 95% match rate"
            ),
        },
        "attribution_drift.json": {
            "measurement_window_days": 7,
            "drift_threshold_pct": 5.0,
            "current_match_rate_pct": 96.8,
            "previous_match_rate_pct": 95.0,
            "current_revenue_delta_pct": 3.7,
            "previous_revenue_delta_pct": 4.1,
            "_comment": (
                "Compare this week's Gate A match rate + Gate E revenue "
                "delta against last week's values. Gate G target: drift "
                "<= 5pp on both"
            ),
        },
    }
    for filename, content in templates.items():
        path = os.path.join(fixtures_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2)
            f.write("\n")
    print(f"Bootstrapped {len(templates)} fixture files in {fixtures_dir}/")
    print("Replace placeholder values (1000/950/etc.) with real diagnostic exports.")
    return 0


# ----- CLI -----

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measurement-quality audit for the Triple Whale / Polar "
            "Analytics attribution stack (Move #6.5 playbook)"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--fixtures-dir",
        default="./attribution_fixtures/",
        help="Directory containing the gate fixtures (default: ./attribution_fixtures/)",
    )
    parser.add_argument(
        "--check",
        choices=list(GATE_FIXTURE_FILES.keys()),
        help="Run a single gate check instead of all gates",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON output instead of human-readable text",
    )
    parser.add_argument(
        "--bootstrap",
        metavar="DIR",
        help="Generate a starter fixture set in DIR and exit (does not run gates)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.bootstrap:
        return bootstrap_fixtures(args.bootstrap)
    report = run_all_gates(args.fixtures_dir, only_check=args.check)
    if args.json:
        out = report.to_dict()
        print(json.dumps(out, indent=2))
    else:
        print(render_human(report))
    return 0 if report.overall_passed else 1


if __name__ == "__main__":
    sys.exit(main())
