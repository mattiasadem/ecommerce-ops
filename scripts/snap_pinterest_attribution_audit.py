#!/usr/bin/env python3
"""
snap_pinterest_attribution_audit.py — Measurement-quality audit for the
Snapchat Pixel + Conversions API (CAPI) AND Pinterest Tag + Conversions API
attribution stack (Move #6.7 playbook).

Companion to `/playbooks/06.7-snap-pinterest-attribution-quality-audit.md`.
This script is NOT a Snap or Pinterest API client — it does not require API
credentials and cannot authenticate against either platform. Instead, it's
a HERMETIC measurement-quality audit that validates the local fixture data
the operator has staged from each platform's diagnostic export.

The 6 quality gates are NUMERIC THRESHOLDS (not just key-presence checks
like the Move #6 companion script). The Move #6 script validates
INSTALLATION; this script validates MEASUREMENT QUALITY — the difference
between "the CAPI token is set" and "the events are matching across
pixel + CAPI with the right dedup, coverage, and advanced matching
enabled." Same shape as Move #6.6 (TikTok audit) but extended to two
long-tail platforms.

Why Move #6.7 is scoped to 2 platforms x 3 gates = 6 gates? Snapchat
and Pinterest are the 4th and 5th largest paid social platforms for DTC
stores (combined ~5-10% of paid social spend in 2025). They share the
exact same audit pattern as TikTok (pixel + CAPI + advanced match)
but with their own platform-specific thresholds. The audit gap is
silent: Triple Whale's integrations show green checkmarks as long as
the tokens are present — they don't check whether events are matching.

The single most important gate is the CAPI event_id match rate on each
platform. Snap's docs state that match rates below 60% silently degrade
campaign optimization; Pinterest's docs state that below 70% they
throttle. Both thresholds are LESS strict than Meta's 90% because these
platforms have smaller install bases and a smaller proportion of logged-in
users, so the realistic canonical-pass band is lower.

Usage:
    # Default: read fixtures from ./snap_pinterest_fixtures/
    python3 snap_pinterest_attribution_audit.py

    # Custom fixture directory
    python3 snap_pinterest_attribution_audit.py --fixtures-dir ./my_fixtures/

    # Run a single gate
    python3 snap_pinterest_attribution_audit.py --check snap_capi_match_rate
    python3 snap_pinterest_attribution_audit.py --check pinterest_capi_match_rate

    # JSON output (for cron / CI)
    python3 snap_pinterest_attribution_audit.py --json

    # Bootstrap a starter fixture set
    python3 snap_pinterest_attribution_audit.py --bootstrap ./snap_pinterest_fixtures/

Fixtures (one JSON file per gate):

  snap_capi_match.json      — Gate A: Snap CAPI event_id match rate + dedup + coverage
  snap_pixel_coverage.json  — Gate C: Snap Pixel coverage
  snap_emq.json             — Gate D: Snap Email Matching Quality (EMQ)
  pinterest_capi_match.json — Gate A': Pinterest CAPI event_id match rate + dedup + coverage
  pinterest_pixel_coverage.json — Gate C': Pinterest Tag coverage
  pinterest_enhanced_match.json — Gate D': Pinterest Enhanced Match coverage

Run end-to-end (canonical-pass fixtures):
    python3 snap_pinterest_attribution_audit.py --bootstrap ./snap_pinterest_fixtures/
    python3 snap_pinterest_attribution_audit.py --fixtures-dir ./snap_pinterest_fixtures/
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any, Callable


# ----- Snap canonical thresholds (Move #6.7 Gate A/C/D) -----
# Snap Pixel + CAPI is the 4th-largest paid social stack for DTC.
# Snap's own docs state that CAPI event_id match rates below 60%
# silently degrade campaign optimization; below 40% Snap throttles
# CAPI delivery entirely. The threshold is LESS strict than Meta's
# 90% (Move #6.5) and TikTok's 85% (Move #6.6) because Snap's install
# base is smaller and a 80% match rate is realistically the best most
# stores achieve in steady state.

# Gate A — Snap CAPI event_id match rate + dedup + coverage
MIN_SNAP_CAPI_MATCH_RATE_PCT = 80.0
# Floor + ceiling on dedup ratio (pixel_events / capi_events)
# Snap's pattern is closer to Meta's (dedup ratio is tight in steady state)
# 0.7 = more CAPI than pixel (unusual)
# 1.5 = more pixel than CAPI (typical; pixel fires on browser, CAPI from server)
MIN_SNAP_DEDUP_RATIO = 0.7
MAX_SNAP_DEDUP_RATIO = 1.5
# Coverage floor: matched_events must be >= this fraction of expected orders
MIN_SNAP_CAPI_COVERAGE_PCT = 92.0  # slightly less strict than Meta's 95%

# Gate C — Snap Pixel coverage (browser-side intent signals)
# 88% is canonical-pass; 70-88% is normal ad-blocker-induced loss;
# below 70% means the pixel is not on every page (theme.liquid edit missed)
MIN_SNAP_PIXEL_COVERAGE_PCT = 88.0

# Gate D — Snap Email Matching Quality (EMQ) coverage
# Snap's EMQ is the analogue to Meta's CAPI + Google's EC + TikTok's Advanced Matching
# without EMQ Snap can only match on coarse signals (device ID, IP)
# 70% is the realistic canonical-pass band (vs Meta 90%, Google 80%, TikTok 75%)
MIN_SNAP_EMQ_PCT = 70.0


# ----- Pinterest canonical thresholds (Move #6.7 Gate A'/C'/D') -----
# Pinterest Tag + Conversions API is the 5th-largest paid social stack for DTC.
# Pinterest's docs state that CAPI match rates below 70% silently degrade
# campaign optimization; below 50% Pinterest throttles. Pinterest's install
# is more mature than Snap so thresholds are slightly stricter (85% match rate).

# Gate A' — Pinterest CAPI event_id match rate + dedup + coverage
MIN_PINTEREST_CAPI_MATCH_RATE_PCT = 85.0
MIN_PINTEREST_DEDUP_RATIO = 0.7
MAX_PINTEREST_DEDUP_RATIO = 1.5
MIN_PINTEREST_CAPI_COVERAGE_PCT = 93.0

# Gate C' — Pinterest Tag coverage
MIN_PINTEREST_TAG_COVERAGE_PCT = 85.0

# Gate D' — Pinterest Enhanced Match coverage
MIN_PINTEREST_ENHANCED_MATCH_PCT = 75.0


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

def check_snap_capi_match_rate(fixture: dict[str, Any]) -> GateResult:
    """Gate A — Snap CAPI event_id match rate + dedup ratio + coverage.

    Contract: matched_events / expected_orders >= 80% (match rate),
    pixel_events / capi_events in [0.7, 1.5] (dedup ratio),
    matched_events / expected_orders >= 92% (coverage).
    Snap's docs say match rates below 60% silently degrade campaign
    optimization; below 40% Snap throttles CAPI delivery entirely.
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
            gate_name="snap_capi_match_rate",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Export from Snap Pixel Manager > Diagnostics > Event Quality > last 7d. "
                "Set pixel_events, capi_events, matched_events, and expected_orders_last_7d "
                "(from Shopify Analytics) in snap_capi_match.json"
            ),
        )
    pixel_events = int(fixture["pixel_events"])
    capi_events = int(fixture["capi_events"])
    matched_events = int(fixture["matched_events"])
    expected_orders = int(fixture["expected_orders_last_7d"])

    if expected_orders <= 0:
        return GateResult(
            gate_name="snap_capi_match_rate",
            passed=False,
            detail=f"expected_orders_last_7d={expected_orders} must be > 0",
            remediation=(
                "expected_orders_last_7d must be the count of orders "
                "shipped in the last 7 days from Shopify Analytics"
            ),
        )
    if matched_events < 0 or pixel_events < 0 or capi_events < 0:
        return GateResult(
            gate_name="snap_capi_match_rate",
            passed=False,
            detail=f"Negative event counts not allowed (matched={matched_events}, pixel={pixel_events}, capi={capi_events})",
            remediation="Re-export the Snap diagnostic; check that the report is not corrupted",
        )
    if matched_events > min(pixel_events, capi_events):
        return GateResult(
            gate_name="snap_capi_match_rate",
            passed=False,
            detail=(
                f"matched_events={matched_events} > min(pixel={pixel_events}, capi={capi_events}). "
                f"Matched events cannot exceed either source — likely export error"
            ),
            remediation=(
                "Re-export from Snap Pixel Manager > Diagnostics; ensure "
                "you're exporting 'Purchase' event dedup status, not raw counts"
            ),
        )

    match_rate = (matched_events / expected_orders) * 100.0 if expected_orders else 0.0
    if capi_events > 0:
        dedup_ratio = pixel_events / capi_events
    elif pixel_events > 0:
        dedup_ratio = float("inf")
    else:
        dedup_ratio = 1.0

    fail_reasons = []
    if match_rate < MIN_SNAP_CAPI_MATCH_RATE_PCT:
        fail_reasons.append(
            f"match rate {match_rate:.1f}% < {MIN_SNAP_CAPI_MATCH_RATE_PCT:.0f}% target"
        )
    if not (MIN_SNAP_DEDUP_RATIO <= dedup_ratio <= MAX_SNAP_DEDUP_RATIO):
        if dedup_ratio == float("inf"):
            fail_reasons.append("CAPI events = 0 (Snap cannot optimize without server-side events)")
        else:
            fail_reasons.append(
                f"dedup ratio {dedup_ratio:.2f} outside [{MIN_SNAP_DEDUP_RATIO:.1f}, {MAX_SNAP_DEDUP_RATIO:.1f}]"
            )
    coverage_pct = (matched_events / expected_orders) * 100.0
    if coverage_pct < MIN_SNAP_CAPI_COVERAGE_PCT:
        fail_reasons.append(
            f"coverage {coverage_pct:.1f}% < {MIN_SNAP_CAPI_COVERAGE_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="snap_capi_match_rate",
            passed=False,
            detail=(
                f"Match: {matched_events}/{expected_orders} = {match_rate:.1f}% | "
                f"Dedup ratio: {dedup_ratio:.2f} | "
                f"Pixel: {pixel_events}, CAPI: {capi_events} | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If match rate is low: (a) verify event_id is identical in "
                "pixel + CAPI payloads (Triple Whale -> Settings -> Snap -> "
                "event_id mapping); (b) check that the Snap pixel is on "
                "every page (theme.liquid) and that CAPI is firing on "
                "order creation. If dedup ratio is off: re-check that "
                "the SAME order is not being sent twice (look for "
                "double-firing in Snap Pixel Manager > Test Events). "
                "If coverage is low: orders older than 7d in the diagnostic "
                "are expiring — re-export with a longer window"
            ),
        )
    return GateResult(
        gate_name="snap_capi_match_rate",
        passed=True,
        detail=(
            f"Match rate: {match_rate:.1f}% (target >={MIN_SNAP_CAPI_MATCH_RATE_PCT:.0f}%) | "
            f"Dedup ratio: {dedup_ratio:.2f} (in [{MIN_SNAP_DEDUP_RATIO:.1f}, {MAX_SNAP_DEDUP_RATIO:.1f}]) | "
            f"Coverage: {coverage_pct:.1f}% of {expected_orders} expected orders"
        ),
    )


def check_snap_pixel_coverage(fixture: dict[str, Any]) -> GateResult:
    """Gate C — Snap Pixel coverage (browser-side intent signals).

    Contract: pixel_fired_count / expected_pageviews >= 88%.
    Low coverage means the pixel is not on every page (usually a
    theme.liquid edit was missed) or is being blocked by an ad blocker.
    """
    required = {"pixel_fired_count", "expected_pageviews"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="snap_pixel_coverage",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'pixel_fired_count' (Snap Pixel Manager > "
                "Diagnostics > PageView event count, last 7d) and "
                "'expected_pageviews' (Shopify Analytics > Total sessions, "
                "last 7d) in snap_pixel_coverage.json"
            ),
        )
    pixel_count = int(fixture["pixel_fired_count"])
    expected_pv = int(fixture["expected_pageviews"])
    if expected_pv <= 0:
        return GateResult(
            gate_name="snap_pixel_coverage",
            passed=False,
            detail=f"expected_pageviews={expected_pv} must be > 0",
            remediation="Re-check Shopify Analytics for the 7-day session count",
        )
    if pixel_count < 0:
        return GateResult(
            gate_name="snap_pixel_coverage",
            passed=False,
            detail=f"pixel_fired_count={pixel_count} cannot be negative",
            remediation="Re-export from Snap Pixel Manager; check for corrupted export",
        )
    coverage_pct = (pixel_count / expected_pv) * 100.0
    if coverage_pct < MIN_SNAP_PIXEL_COVERAGE_PCT:
        return GateResult(
            gate_name="snap_pixel_coverage",
            passed=False,
            detail=(
                f"Pixel coverage {coverage_pct:.1f}% < {MIN_SNAP_PIXEL_COVERAGE_PCT:.0f}% target. "
                f"Pixel fired: {pixel_count}, Expected pageviews: {expected_pv}"
            ),
            remediation=(
                "(a) Verify the Snap Pixel base code is in theme.liquid "
                "just before </head>; (b) check that no Content-Security-"
                "Policy headers are blocking sc-static.net or snap.licdn.com; "
                "(c) note that ad-blocker-induced loss of ~15% is normal — "
                "if coverage is below 70%, look for theme.liquid missing "
                "the pixel snippet entirely"
            ),
        )
    return GateResult(
        gate_name="snap_pixel_coverage",
        passed=True,
        detail=(
            f"Pixel coverage: {coverage_pct:.1f}% (target >={MIN_SNAP_PIXEL_COVERAGE_PCT:.0f}%) | "
            f"Pixel fired: {pixel_count} of {expected_pv} expected pageviews"
        ),
    )


def check_snap_emq(fixture: dict[str, Any]) -> GateResult:
    """Gate D — Snap Email Matching Quality (EMQ) coverage.

    Contract: matched_with_identifier / total_events >= 70%.
    EMQ is Snap's version of Meta's CAPI + Google's EC + TikTok's Advanced Matching
    — without it Snap can only match on coarse signals (device ID, IP)
    and attribution falls back to last-click.
    """
    required = {
        "emq_coverage_pct",
        "matched_with_identifier",
        "total_events",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="snap_emq",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all three keys in snap_emq.json: "
                "'emq_coverage_pct' (Snap Pixel Manager > Advanced Matching "
                "subtab), 'matched_with_identifier' (count of events with "
                "hashed identifiers), and 'total_events' (count of all "
                "Purchase events in window)"
            ),
        )
    coverage_pct = float(fixture["emq_coverage_pct"])
    matched_with_id = int(fixture["matched_with_identifier"])
    total_events = int(fixture["total_events"])

    if total_events <= 0:
        return GateResult(
            gate_name="snap_emq",
            passed=False,
            detail=f"total_events={total_events} must be > 0",
            remediation="Re-export Snap Pixel Manager > Advanced Matching; check that there are Purchase events in the window",
        )
    if matched_with_id < 0 or coverage_pct < 0 or coverage_pct > 100:
        return GateResult(
            gate_name="snap_emq",
            passed=False,
            detail=(
                f"Invalid values: matched_with_identifier={matched_with_id}, "
                f"emq_coverage_pct={coverage_pct} out of [0, 100]"
            ),
            remediation="Re-export from Snap Pixel Manager; check for corrupted export or out-of-range percentage",
        )

    if coverage_pct < MIN_SNAP_EMQ_PCT:
        return GateResult(
            gate_name="snap_emq",
            passed=False,
            detail=(
                f"Email matching coverage {coverage_pct:.1f}% < {MIN_SNAP_EMQ_PCT:.0f}% target. "
                f"Matched with identifier: {matched_with_id}/{total_events}"
            ),
            remediation=(
                "(a) Verify the Snap Advanced Matching toggle is ON in "
                "Pixel Manager -> Settings -> Advanced Matching -> enable "
                "for email + phone + mobile advertiser ID; (b) verify the "
                "Klaviyo-to-Snap sync is sending hashed identifiers (not "
                "plaintext); (c) if coverage is still low, most Klaviyo "
                "profiles have an email but guest checkouts may not — "
                "enable 'Email collection on guest checkout' in Shopify"
            ),
        )
    return GateResult(
        gate_name="snap_emq",
        passed=True,
        detail=(
            f"Email matching coverage: {coverage_pct:.1f}% "
            f"(target >={MIN_SNAP_EMQ_PCT:.0f}%) | "
            f"Matched with identifier: {matched_with_id}/{total_events} events"
        ),
    )


def check_pinterest_capi_match_rate(fixture: dict[str, Any]) -> GateResult:
    """Gate A' — Pinterest CAPI event_id match rate + dedup + coverage.

    Contract: matched_events / expected_orders >= 85% (match rate),
    pixel_events / capi_events in [0.7, 1.5] (dedup ratio),
    matched_events / expected_orders >= 93% (coverage).
    Pinterest's docs are stricter than Snap's: below 70% Pinterest
    silently degrades campaign optimization; below 50% Pinterest
    throttles CAPI delivery entirely.
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
            gate_name="pinterest_capi_match_rate",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Export from Pinterest Tag Manager > Diagnostics > last 7d. "
                "Set pixel_events, capi_events, matched_events, and "
                "expected_orders_last_7d (from Shopify Analytics) in "
                "pinterest_capi_match.json"
            ),
        )
    pixel_events = int(fixture["pixel_events"])
    capi_events = int(fixture["capi_events"])
    matched_events = int(fixture["matched_events"])
    expected_orders = int(fixture["expected_orders_last_7d"])

    if expected_orders <= 0:
        return GateResult(
            gate_name="pinterest_capi_match_rate",
            passed=False,
            detail=f"expected_orders_last_7d={expected_orders} must be > 0",
            remediation=(
                "expected_orders_last_7d must be the count of orders "
                "shipped in the last 7 days from Shopify Analytics"
            ),
        )
    if matched_events < 0 or pixel_events < 0 or capi_events < 0:
        return GateResult(
            gate_name="pinterest_capi_match_rate",
            passed=False,
            detail=f"Negative event counts not allowed (matched={matched_events}, pixel={pixel_events}, capi={capi_events})",
            remediation="Re-export the Pinterest diagnostic; check that the report is not corrupted",
        )
    if matched_events > min(pixel_events, capi_events):
        return GateResult(
            gate_name="pinterest_capi_match_rate",
            passed=False,
            detail=(
                f"matched_events={matched_events} > min(pixel={pixel_events}, capi={capi_events}). "
                f"Matched events cannot exceed either source — likely export error"
            ),
            remediation=(
                "Re-export from Pinterest Tag Manager > Diagnostics; ensure "
                "you're exporting 'Checkout' event dedup status, not raw counts"
            ),
        )

    match_rate = (matched_events / expected_orders) * 100.0 if expected_orders else 0.0
    if capi_events > 0:
        dedup_ratio = pixel_events / capi_events
    elif pixel_events > 0:
        dedup_ratio = float("inf")
    else:
        dedup_ratio = 1.0

    fail_reasons = []
    if match_rate < MIN_PINTEREST_CAPI_MATCH_RATE_PCT:
        fail_reasons.append(
            f"match rate {match_rate:.1f}% < {MIN_PINTEREST_CAPI_MATCH_RATE_PCT:.0f}% target"
        )
    if not (MIN_PINTEREST_DEDUP_RATIO <= dedup_ratio <= MAX_PINTEREST_DEDUP_RATIO):
        if dedup_ratio == float("inf"):
            fail_reasons.append("CAPI events = 0 (Pinterest cannot optimize without server-side events)")
        else:
            fail_reasons.append(
                f"dedup ratio {dedup_ratio:.2f} outside [{MIN_PINTEREST_DEDUP_RATIO:.1f}, {MAX_PINTEREST_DEDUP_RATIO:.1f}]"
            )
    coverage_pct = (matched_events / expected_orders) * 100.0
    if coverage_pct < MIN_PINTEREST_CAPI_COVERAGE_PCT:
        fail_reasons.append(
            f"coverage {coverage_pct:.1f}% < {MIN_PINTEREST_CAPI_COVERAGE_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="pinterest_capi_match_rate",
            passed=False,
            detail=(
                f"Match: {matched_events}/{expected_orders} = {match_rate:.1f}% | "
                f"Dedup ratio: {dedup_ratio:.2f} | "
                f"Pixel: {pixel_events}, CAPI: {capi_events} | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If match rate is low: (a) verify event_id is identical in "
                "pixel + CAPI payloads (Triple Whale -> Settings -> Pinterest "
                "-> event_id mapping); (b) check that the Pinterest tag is "
                "on every page (theme.liquid) and that CAPI is firing on "
                "order creation. If dedup ratio is off: re-check that the "
                "SAME order is not being sent twice (look for double-firing "
                "in Pinterest Tag Manager > Test Events). If coverage is "
                "low: orders older than 7d in the diagnostic are expiring — "
                "re-export with a longer window"
            ),
        )
    return GateResult(
        gate_name="pinterest_capi_match_rate",
        passed=True,
        detail=(
            f"Match rate: {match_rate:.1f}% (target >={MIN_PINTEREST_CAPI_MATCH_RATE_PCT:.0f}%) | "
            f"Dedup ratio: {dedup_ratio:.2f} (in [{MIN_PINTEREST_DEDUP_RATIO:.1f}, {MAX_PINTEREST_DEDUP_RATIO:.1f}]) | "
            f"Coverage: {coverage_pct:.1f}% of {expected_orders} expected orders"
        ),
    )


def check_pinterest_tag_coverage(fixture: dict[str, Any]) -> GateResult:
    """Gate C' — Pinterest Tag coverage (browser-side intent signals).

    Contract: tag_fired_count / expected_pageviews >= 85%.
    Low coverage means the tag is not on every page (usually a
    theme.liquid edit was missed) or is being blocked by an ad blocker.
    Pinterest's threshold is lower than TikTok (90%) and Snap (88%)
    because the Pinterest tag has fewer coverage-fidelity optimizations.
    """
    required = {"tag_fired_count", "expected_pageviews"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="pinterest_tag_coverage",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'tag_fired_count' (Pinterest Tag Manager > "
                "Diagnostics > PageVisit event count, last 7d) and "
                "'expected_pageviews' (Shopify Analytics > Total sessions, "
                "last 7d) in pinterest_tag_coverage.json"
            ),
        )
    tag_count = int(fixture["tag_fired_count"])
    expected_pv = int(fixture["expected_pageviews"])
    if expected_pv <= 0:
        return GateResult(
            gate_name="pinterest_tag_coverage",
            passed=False,
            detail=f"expected_pageviews={expected_pv} must be > 0",
            remediation="Re-check Shopify Analytics for the 7-day session count",
        )
    if tag_count < 0:
        return GateResult(
            gate_name="pinterest_tag_coverage",
            passed=False,
            detail=f"tag_fired_count={tag_count} cannot be negative",
            remediation="Re-export from Pinterest Tag Manager; check for corrupted export",
        )
    coverage_pct = (tag_count / expected_pv) * 100.0
    if coverage_pct < MIN_PINTEREST_TAG_COVERAGE_PCT:
        return GateResult(
            gate_name="pinterest_tag_coverage",
            passed=False,
            detail=(
                f"Tag coverage {coverage_pct:.1f}% < {MIN_PINTEREST_TAG_COVERAGE_PCT:.0f}% target. "
                f"Tag fired: {tag_count}, Expected pageviews: {expected_pv}"
            ),
            remediation=(
                "(a) Verify the Pinterest tag base code is in theme.liquid "
                "just before </head>; (b) check that no Content-Security-"
                "Policy headers are blocking s.pinimg.com or ct.pinterest.com; "
                "(c) note that ad-blocker-induced loss of ~15% is normal — "
                "if coverage is below 70%, look for theme.liquid missing "
                "the tag snippet entirely"
            ),
        )
    return GateResult(
        gate_name="pinterest_tag_coverage",
        passed=True,
        detail=(
            f"Tag coverage: {coverage_pct:.1f}% (target >={MIN_PINTEREST_TAG_COVERAGE_PCT:.0f}%) | "
            f"Tag fired: {tag_count} of {expected_pv} expected pageviews"
        ),
    )


def check_pinterest_enhanced_match(fixture: dict[str, Any]) -> GateResult:
    """Gate D' — Pinterest Enhanced Match coverage.

    Contract: matched_with_identifier / total_events >= 75%.
    Enhanced Match is Pinterest's version of Meta's hashed email + Google's EC +
    TikTok's Advanced Matching + Snap's EMQ — without it Pinterest can only match
    on coarse signals (device ID, IP).
    """
    required = {
        "enhanced_match_coverage_pct",
        "matched_with_identifier",
        "total_events",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="pinterest_enhanced_match",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all three keys in pinterest_enhanced_match.json: "
                "'enhanced_match_coverage_pct' (Pinterest Tag Manager > "
                "Enhanced Match subtab), 'matched_with_identifier' (count "
                "of events with hashed identifiers), and 'total_events' "
                "(count of all Checkout events in window)"
            ),
        )
    coverage_pct = float(fixture["enhanced_match_coverage_pct"])
    matched_with_id = int(fixture["matched_with_identifier"])
    total_events = int(fixture["total_events"])

    if total_events <= 0:
        return GateResult(
            gate_name="pinterest_enhanced_match",
            passed=False,
            detail=f"total_events={total_events} must be > 0",
            remediation="Re-export Pinterest Tag Manager > Enhanced Match; check that there are Checkout events in the window",
        )
    if matched_with_id < 0 or coverage_pct < 0 or coverage_pct > 100:
        return GateResult(
            gate_name="pinterest_enhanced_match",
            passed=False,
            detail=(
                f"Invalid values: matched_with_identifier={matched_with_id}, "
                f"enhanced_match_coverage_pct={coverage_pct} out of [0, 100]"
            ),
            remediation="Re-export from Pinterest Tag Manager; check for corrupted export or out-of-range percentage",
        )

    if coverage_pct < MIN_PINTEREST_ENHANCED_MATCH_PCT:
        return GateResult(
            gate_name="pinterest_enhanced_match",
            passed=False,
            detail=(
                f"Enhanced match coverage {coverage_pct:.1f}% < {MIN_PINTEREST_ENHANCED_MATCH_PCT:.0f}% target. "
                f"Matched with identifier: {matched_with_id}/{total_events}"
            ),
            remediation=(
                "(a) Verify the Pinterest Enhanced Match toggle is ON in "
                "Tag Manager -> Settings -> Enhanced Match -> enable for "
                "email + external_id; (b) verify the Klaviyo-to-Pinterest "
                "sync is sending hashed identifiers (not plaintext); "
                "(c) if coverage is still low, most Klaviyo profiles have "
                "an email but guest checkouts may not — enable 'Email "
                "collection on guest checkout' in Shopify"
            ),
        )
    return GateResult(
        gate_name="pinterest_enhanced_match",
        passed=True,
        detail=(
            f"Enhanced match coverage: {coverage_pct:.1f}% "
            f"(target >={MIN_PINTEREST_ENHANCED_MATCH_PCT:.0f}%) | "
            f"Matched with identifier: {matched_with_id}/{total_events} events"
        ),
    )


# ----- Gate registry -----

GATE_FIXTURE_FILES: dict[str, tuple[str, Callable[[dict[str, Any]], GateResult]]] = {
    "snap_capi_match_rate": ("snap_capi_match.json", check_snap_capi_match_rate),
    "snap_pixel_coverage": ("snap_pixel_coverage.json", check_snap_pixel_coverage),
    "snap_emq": ("snap_emq.json", check_snap_emq),
    "pinterest_capi_match_rate": ("pinterest_capi_match.json", check_pinterest_capi_match_rate),
    "pinterest_tag_coverage": ("pinterest_tag_coverage.json", check_pinterest_tag_coverage),
    "pinterest_enhanced_match": ("pinterest_enhanced_match.json", check_pinterest_enhanced_match),
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
    lines.append("Snap + Pinterest Attribution Quality Audit - Move #6.7 Verification")
    lines.append("=" * 70)
    lines.append(f"Fixture dir: {report.fixture_dir}")
    lines.append("")
    for g in report.gates:
        marker = "OK" if g.passed else "FAIL"
        lines.append(f"  [{marker}] {g.gate_name}")
        lines.append(f"      {g.detail}")
        if not g.passed and g.remediation:
            lines.append(f"      -> {g.remediation}")
    lines.append("")
    total = len(report.gates)
    passed_count = sum(1 for g in report.gates if g.passed)
    lines.append(
        f"Summary: {passed_count}/{total} gates passed"
    )
    if report.overall_passed:
        lines.append("")
        lines.append("ALL GATES PASSED - Snap + Pinterest attribution stacks are producing actionable signal.")
    else:
        lines.append("")
        lines.append("SOME GATES FAILED - see remediation above; re-run after fixes.")
    lines.append("=" * 70)
    return "\n".join(lines)


def bootstrap_fixtures(fixtures_dir: str) -> int:
    """Generate a starter fixture set in the given directory.

    Bootstrap values satisfy the STRICTEST threshold per shared numerator
    (per the v2.41 bootstrap-fixture-union-of-thresholds recipe):
    - For Snap CAPI: matched/expected must satisfy match rate (>=80%)
      AND coverage (>=92%), so the strictest wins. Bootstrap uses 93%
      match rate + 93% coverage.
    - For Pinterest CAPI: matched/expected must satisfy match rate (>=85%)
      AND coverage (>=93%), so the strictest wins. Bootstrap uses 94%.
    """
    os.makedirs(fixtures_dir, exist_ok=True)
    templates = {
        # --- Snap fixtures ---
        "snap_capi_match.json": {
            "pixel_events": 930,
            "capi_events": 880,
            "matched_events": 855,
            "expected_orders_last_7d": 920,
            "_comment": (
                "Export from Snap Pixel Manager > Diagnostics > Event Quality > last 7d. "
                "Gate A target: match rate >= 80%, dedup ratio in [0.7, 1.5], "
                "coverage >= 92% of expected_orders_last_7d. "
                "Canonical-pass values: 855/920 = 92.9% match rate, "
                "930/880 = 1.057 dedup ratio, 855/920 = 92.9% coverage."
            ),
        },
        "snap_pixel_coverage.json": {
            "pixel_fired_count": 9000,
            "expected_pageviews": 10000,
            "_comment": (
                "Export pixel_fired_count from Snap Pixel Manager > "
                "Diagnostics > PageView event count (last 7d). Get "
                "expected_pageviews from Shopify Analytics > Total sessions "
                "(last 7d). Gate C target: coverage >= 88%. "
                "Canonical-pass: 9000/10000 = 90.0%."
            ),
        },
        "snap_emq.json": {
            "emq_coverage_pct": 75.0,
            "matched_with_identifier": 660,
            "total_events": 880,
            "_comment": (
                "Export from Snap Pixel Manager > Advanced Matching subtab. "
                "Gate D target: emq_coverage_pct >= 70%. "
                "Canonical-pass: 660/880 = 75.0%."
            ),
        },
        # --- Pinterest fixtures ---
        "pinterest_capi_match.json": {
            "pixel_events": 940,
            "capi_events": 890,
            "matched_events": 845,
            "expected_orders_last_7d": 900,
            "_comment": (
                "Export from Pinterest Tag Manager > Diagnostics > last 7d. "
                "Gate A' target: match rate >= 85%, dedup ratio in [0.7, 1.5], "
                "coverage >= 93% of expected_orders_last_7d. "
                "Canonical-pass values: 845/900 = 93.9% match rate, "
                "940/890 = 1.056 dedup ratio, 845/900 = 93.9% coverage."
            ),
        },
        "pinterest_tag_coverage.json": {
            "tag_fired_count": 8800,
            "expected_pageviews": 10000,
            "_comment": (
                "Export tag_fired_count from Pinterest Tag Manager > "
                "Diagnostics > PageVisit event count (last 7d). Get "
                "expected_pageviews from Shopify Analytics > Total sessions "
                "(last 7d). Gate C' target: coverage >= 85%. "
                "Canonical-pass: 8800/10000 = 88.0%."
            ),
        },
        "pinterest_enhanced_match.json": {
            "enhanced_match_coverage_pct": 80.0,
            "matched_with_identifier": 712,
            "total_events": 890,
            "_comment": (
                "Export from Pinterest Tag Manager > Enhanced Match subtab. "
                "Gate D' target: enhanced_match_coverage_pct >= 75%. "
                "Canonical-pass: 712/890 = 80.0%."
            ),
        },
    }
    for filename, content in templates.items():
        path = os.path.join(fixtures_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2)
            f.write("\n")
    print(f"Bootstrapped {len(templates)} fixture files in {fixtures_dir}/")
    print("Replace placeholder values with real Snap + Pinterest diagnostic exports.")
    return 0


# ----- CLI -----

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measurement-quality audit for the Snap Pixel + CAPI and "
            "Pinterest Tag + CAPI attribution stacks (Move #6.7 playbook)"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--fixtures-dir",
        default="./snap_pinterest_fixtures/",
        help="Directory containing the gate fixtures (default: ./snap_pinterest_fixtures/)",
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
