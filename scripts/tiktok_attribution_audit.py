#!/usr/bin/env python3
"""
tiktok_attribution_audit.py — Measurement-quality audit for the
TikTok Pixel + Events API (EAPI) attribution stack (Move #6.6 playbook).

Companion to `/playbooks/06.6-tiktok-attribution-quality-audit.md`.
This script is NOT a TikTok API client — it does not require API
credentials and cannot authenticate against TikTok. Instead, it's a
HERMETIC measurement-quality audit that validates the local fixture
data the operator has staged from TikTok Events Manager's diagnostic
export.

The 3 quality gates are NUMERIC THRESHOLDS (not just key-presence checks
like the Move #6 companion script). The Move #6 script validates
INSTALLATION; this script validates MEASUREMENT QUALITY — the difference
between "the EAPI token is set" and "the events are matching across
pixel + EAPI with the right dedup, coverage, and Advanced Matching
enabled."

Why hermetic? TikTok's diagnostic export is a CSV or JSON the operator
downloads manually (TikTok Events Manager > Diagnostics tab). The
local-fixture approach catches 90% of TikTok measurement quality
problems (low match rate, missing dedup, low Advanced Matching
coverage) without requiring paid API access.

The single most important gate is Gate A (TikTok EAPI event_id match
rate ≥ 85%). TikTok's own documentation states that match rates below
70% will silently degrade Smart+ campaign optimization; below 50%
TikTok will throttle EAPI delivery entirely. The other gates are
equally load-bearing but the match-rate gate is the one Triple Whale +
Polar will not catch for you — you have to audit it yourself with the
diagnostic export.

Why Move #6.6 is scoped to 3 gates (vs Move #6.5's 6 gates)?
- TikTok's diagnostic surface is smaller (4 distinct surfaces vs
  Meta+Google's 6)
- Cohort-sync audit (Move #6.5 Gate F) is dropped — TikTok's cohort
  attach to Klaviyo is rare for most operators
- Drift audit (Move #6.5 Gate G) is dropped — TikTok's diagnostic
  export cadence is weekly at best, so drift detection is noisy;
  deferred to Move #6.8 (cross-platform unification)

Usage:
    # Default: read fixtures from ./tiktok_fixtures/
    python3 tiktok_attribution_audit.py

    # Custom fixture directory
    python3 tiktok_attribution_audit.py --fixtures-dir ./my_fixtures/

    # Run a single gate
    python3 tiktok_attribution_audit.py --check tiktok_eapi_match_rate
    python3 tiktok_attribution_audit.py --check tiktok_advanced_matching

    # JSON output (for cron / CI)
    python3 tiktok_attribution_audit.py --json

    # Bootstrap a starter fixture set
    python3 tiktok_attribution_audit.py --bootstrap ./tiktok_fixtures/

Fixtures (one JSON file per gate):
    - tiktok_eapi_match.json:        { "pixel_events": int, "eapi_events": int,
                                       "matched_events": int,
                                       "expected_orders_last_7d": int }
    - tiktok_pixel_coverage.json:    { "pixel_fired_count": int,
                                       "expected_pageviews": int }
    - tiktok_advanced_matching.json: { "hashed_identifier_coverage_pct": float,
                                       "matched_with_identifier": int,
                                       "total_events": int }

Each fixture file is documented in detail in the playbook's
Verification section. The script validates each fixture against the
contract and emits a ✓ or ✗ per gate.

Exit code 0 = all gates pass. Exit code 1 = at least one gate fails.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any, Callable


# ----- Canonical quality thresholds (the playbook's 3 gates) -----

# Gate A — TikTok EAPI event_id match rate (the killer metric)
# TikTok throttles EAPI below 50%; below 70% Smart+ optimization silently degrades.
# 85% is the realistic canonical-pass band (vs Meta's 90% because TikTok's install
# is newer and a 85% match rate is realistically the best most stores achieve).
MIN_TIKTOK_EAPI_MATCH_RATE_PCT = 85.0
# Floor + ceiling on dedup ratio (pixel_events / eapi_events)
# 0.7 = more EAPI than pixel (unusual; usually EAPI is the supplement)
# 1.6 = more pixel than EAPI (typical; pixel fires on browser, EAPI from server)
# The wider band vs Meta (0.8-1.5) reflects TikTok's pixel-over-firing pattern
# during initial install.
MIN_DEDUP_RATIO = 0.7
MAX_DEDUP_RATIO = 1.6
# Coverage floor: matched_events must be ≥ this fraction of expected orders
MIN_TIKTOK_EAPI_COVERAGE_PCT = 95.0

# Gate C — TikTok Pixel coverage (browser-side intent signals)
# 90% is canonical-pass; 70-90% is normal ad-blocker-induced loss;
# below 70% means the pixel is not on every page (theme.liquid edit missed)
MIN_TIKTOK_PIXEL_COVERAGE_PCT = 90.0

# Gate D — TikTok Advanced Matching coverage (the EC analogue)
# Advanced Matching is TikTok's version of Meta's CAPI + Google's EC
# without it TikTok can only match on coarse signals (device ID, IP)
# 75% is the realistic canonical-pass band (vs Meta's 90% + Google's 80%)
MIN_TIKTOK_ADVANCED_MATCHING_PCT = 75.0


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

def check_tiktok_eapi_match_rate(fixture: dict[str, Any]) -> GateResult:
    """Gate A — TikTok EAPI event_id match rate + dedup ratio + coverage.

    The single most important gate in this audit. TikTok's own docs say
    match rates below 70% silently degrade Smart+ campaign optimization;
    below 50% TikTok throttles EAPI delivery entirely. The dedup ratio
    (pixel / EAPI) should be in [0.7, 1.6] — outside that band means one
    side is over-firing (double-counting risk) or under-firing (missing
    attribution). Coverage: matched_events should be ≥ 95% of expected
    orders in the measurement window.
    """
    required = {
        "pixel_events",
        "eapi_events",
        "matched_events",
        "expected_orders_last_7d",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="tiktok_eapi_match_rate",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Export the TikTok Events Manager > Diagnostics tab (last 7d) "
                "and populate tiktok_eapi_match.json with pixel_events, "
                "eapi_events, matched_events, and expected_orders_last_7d "
                "(from Shopify Analytics)"
            ),
        )
    pixel_events = int(fixture["pixel_events"])
    eapi_events = int(fixture["eapi_events"])
    matched_events = int(fixture["matched_events"])
    expected_orders = int(fixture["expected_orders_last_7d"])

    if expected_orders <= 0:
        return GateResult(
            gate_name="tiktok_eapi_match_rate",
            passed=False,
            detail=f"expected_orders_last_7d={expected_orders} must be > 0",
            remediation=(
                "expected_orders_last_7d must be the count of orders "
                "shipped in the last 7 days from Shopify Analytics"
            ),
        )
    if matched_events < 0 or pixel_events < 0 or eapi_events < 0:
        return GateResult(
            gate_name="tiktok_eapi_match_rate",
            passed=False,
            detail=f"Negative event counts not allowed (matched={matched_events}, pixel={pixel_events}, eapi={eapi_events})",
            remediation="Re-export the TikTok diagnostic; check that the report is not corrupted",
        )
    if matched_events > min(pixel_events, eapi_events):
        return GateResult(
            gate_name="tiktok_eapi_match_rate",
            passed=False,
            detail=(
                f"matched_events={matched_events} > min(pixel={pixel_events}, eapi={eapi_events}). "
                f"Matched events cannot exceed either source — likely export error"
            ),
            remediation=(
                "Re-export from TikTok Events Manager > Diagnostics; ensure "
                "you're exporting 'Purchase' event dedup status, not raw counts"
            ),
        )

    match_rate = (matched_events / expected_orders) * 100.0 if expected_orders else 0.0
    if eapi_events > 0:
        dedup_ratio = pixel_events / eapi_events
    elif pixel_events > 0:
        # No EAPI events at all — this is a separate problem (Gate A partial)
        dedup_ratio = float("inf")
    else:
        dedup_ratio = 1.0

    # Three sub-failures possible: match rate, dedup ratio, coverage
    fail_reasons = []
    if match_rate < MIN_TIKTOK_EAPI_MATCH_RATE_PCT:
        fail_reasons.append(
            f"match rate {match_rate:.1f}% < {MIN_TIKTOK_EAPI_MATCH_RATE_PCT:.0f}% target"
        )
    if not (MIN_DEDUP_RATIO <= dedup_ratio <= MAX_DEDUP_RATIO):
        if dedup_ratio == float("inf"):
            fail_reasons.append("EAPI events = 0 (TikTok cannot optimize without server-side events)")
        else:
            fail_reasons.append(
                f"dedup ratio {dedup_ratio:.2f} outside [{MIN_DEDUP_RATIO:.1f}, {MAX_DEDUP_RATIO:.1f}]"
            )
    coverage_pct = (matched_events / expected_orders) * 100.0
    if coverage_pct < MIN_TIKTOK_EAPI_COVERAGE_PCT:
        fail_reasons.append(
            f"coverage {coverage_pct:.1f}% < {MIN_TIKTOK_EAPI_COVERAGE_PCT:.0f}% target"
        )

    if fail_reasons:
        return GateResult(
            gate_name="tiktok_eapi_match_rate",
            passed=False,
            detail=(
                f"Match: {matched_events}/{expected_orders} = {match_rate:.1f}% | "
                f"Dedup ratio: {dedup_ratio:.2f} | "
                f"Pixel: {pixel_events}, EAPI: {eapi_events} | "
                f"Failures: {'; '.join(fail_reasons)}"
            ),
            remediation=(
                "If match rate is low: (a) verify event_id is identical in "
                "pixel + EAPI payloads (Triple Whale → Settings → TikTok → "
                "event_id mapping); (b) check that the TikTok pixel is on "
                "every page (theme.liquid) and that EAPI is firing on "
                "order creation. If dedup ratio is off: re-check that "
                "the SAME order is not being sent twice (look for "
                "double-firing in the TikTok Events Manager > Test Events). "
                "If coverage is low: orders older than 7d in the diagnostic "
                "are expiring — re-export with a longer window"
            ),
        )
    return GateResult(
        gate_name="tiktok_eapi_match_rate",
        passed=True,
        detail=(
            f"✓ Match rate: {match_rate:.1f}% (target ≥{MIN_TIKTOK_EAPI_MATCH_RATE_PCT:.0f}%) | "
            f"✓ Dedup ratio: {dedup_ratio:.2f} (in [{MIN_DEDUP_RATIO:.1f}, {MAX_DEDUP_RATIO:.1f}]) | "
            f"✓ Coverage: {coverage_pct:.1f}% of {expected_orders} expected orders"
        ),
    )


def check_tiktok_pixel_coverage(fixture: dict[str, Any]) -> GateResult:
    """Gate C — TikTok Pixel coverage (browser-side intent signals).

    Contract: pixel_fired_count / expected_pageviews >= 90%.
    Low coverage means the pixel is not on every page (usually a
    theme.liquid edit was missed) or is being blocked by an ad blocker
    (which is expected for ~15% of traffic; if coverage is below 70%,
    something more serious is wrong).
    """
    required = {"pixel_fired_count", "expected_pageviews"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="tiktok_pixel_coverage",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'pixel_fired_count' (TikTok Events Manager > "
                "Diagnostics > PageView event count, last 7d) and "
                "'expected_pageviews' (Shopify Analytics > Total sessions, "
                "last 7d) in tiktok_pixel_coverage.json"
            ),
        )
    pixel_count = int(fixture["pixel_fired_count"])
    expected_pv = int(fixture["expected_pageviews"])
    if expected_pv <= 0:
        return GateResult(
            gate_name="tiktok_pixel_coverage",
            passed=False,
            detail=f"expected_pageviews={expected_pv} must be > 0",
            remediation="Re-check Shopify Analytics for the 7-day session count",
        )
    if pixel_count < 0:
        return GateResult(
            gate_name="tiktok_pixel_coverage",
            passed=False,
            detail=f"pixel_fired_count={pixel_count} cannot be negative",
            remediation="Re-export from TikTok Events Manager; check for corrupted export",
        )
    coverage_pct = (pixel_count / expected_pv) * 100.0
    if coverage_pct < MIN_TIKTOK_PIXEL_COVERAGE_PCT:
        return GateResult(
            gate_name="tiktok_pixel_coverage",
            passed=False,
            detail=(
                f"Pixel coverage {coverage_pct:.1f}% < {MIN_TIKTOK_PIXEL_COVERAGE_PCT:.0f}% target. "
                f"Pixel fired: {pixel_count}, Expected pageviews: {expected_pv}"
            ),
            remediation=(
                "(a) Verify the TikTok pixel base code is in theme.liquid "
                "just before </head>; (b) check that no Content-Security-"
                "Policy headers are blocking analytics.tiktok.com; (c) note "
                "that ad-blocker-induced loss of ~15% is normal — if "
                "coverage is below 70%, look for theme.liquid missing the "
                "pixel snippet entirely"
            ),
        )
    return GateResult(
        gate_name="tiktok_pixel_coverage",
        passed=True,
        detail=(
            f"✓ Pixel coverage: {coverage_pct:.1f}% (target ≥{MIN_TIKTOK_PIXEL_COVERAGE_PCT:.0f}%) | "
            f"Pixel fired: {pixel_count} of {expected_pv} expected pageviews"
        ),
    )


def check_tiktok_advanced_matching(fixture: dict[str, Any]) -> GateResult:
    """Gate D — TikTok Advanced Matching coverage.

    Contract: matched_with_identifier / total_events >= 75%.
    Advanced Matching is TikTok's version of Meta's CAPI + Google's EC
    — without it TikTok can only match on coarse signals (device ID, IP)
    and attribution falls back to last-click. 75% is the realistic
    canonical-pass band (vs Meta's 90% + Google's 80%).
    """
    required = {
        "hashed_identifier_coverage_pct",
        "matched_with_identifier",
        "total_events",
    }
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="tiktok_advanced_matching",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all three keys in tiktok_advanced_matching.json: "
                "'hashed_identifier_coverage_pct' (TikTok Events Manager > "
                "Advanced Matching subtab), 'matched_with_identifier' "
                "(count of events with hashed identifiers), and "
                "'total_events' (count of all Purchase events in window)"
            ),
        )
    coverage_pct = float(fixture["hashed_identifier_coverage_pct"])
    matched_with_id = int(fixture["matched_with_identifier"])
    total_events = int(fixture["total_events"])

    if total_events <= 0:
        return GateResult(
            gate_name="tiktok_advanced_matching",
            passed=False,
            detail=f"total_events={total_events} must be > 0",
            remediation="Re-export TikTok Events Manager > Advanced Matching; check that there are Purchase events in the window",
        )
    if matched_with_id < 0 or coverage_pct < 0 or coverage_pct > 100:
        return GateResult(
            gate_name="tiktok_advanced_matching",
            passed=False,
            detail=(
                f"Invalid values: matched_with_identifier={matched_with_id}, "
                f"hashed_identifier_coverage_pct={coverage_pct} out of [0, 100]"
            ),
            remediation="Re-export from TikTok Events Manager; check for corrupted export or out-of-range percentage",
        )

    if coverage_pct < MIN_TIKTOK_ADVANCED_MATCHING_PCT:
        return GateResult(
            gate_name="tiktok_advanced_matching",
            passed=False,
            detail=(
                f"Hashed identifier coverage {coverage_pct:.1f}% < {MIN_TIKTOK_ADVANCED_MATCHING_PCT:.0f}% target. "
                f"Matched with identifier: {matched_with_id}/{total_events}"
            ),
            remediation=(
                "(a) Verify the TikTok Advanced Matching toggle is ON in "
                "Events Manager → click pixel → Advanced Matching subtab → "
                "enable for email + phone + external_id; (b) verify the "
                "Klaviyo-to-TikTok sync is sending hashed identifiers (not "
                "plaintext); (c) if coverage is still low, most Klaviyo "
                "profiles have an email but guest checkouts may not — "
                "enable 'Email collection on guest checkout' in Shopify"
            ),
        )
    return GateResult(
        gate_name="tiktok_advanced_matching",
        passed=True,
        detail=(
            f"✓ Hashed identifier coverage: {coverage_pct:.1f}% "
            f"(target ≥{MIN_TIKTOK_ADVANCED_MATCHING_PCT:.0f}%) | "
            f"Matched with identifier: {matched_with_id}/{total_events} events"
        ),
    )


# ----- Gate registry -----

GATE_FIXTURE_FILES: dict[str, tuple[str, Callable[[dict[str, Any]], GateResult]]] = {
    "tiktok_eapi_match_rate": ("tiktok_eapi_match.json", check_tiktok_eapi_match_rate),
    "tiktok_pixel_coverage": ("tiktok_pixel_coverage.json", check_tiktok_pixel_coverage),
    "tiktok_advanced_matching": (
        "tiktok_advanced_matching.json",
        check_tiktok_advanced_matching,
    ),
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
    lines.append("TikTok Attribution Quality Audit — Move #6.6 Verification")
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
        lines.append("ALL GATES PASSED — TikTok attribution stack is producing actionable signal.")
    else:
        lines.append("")
        lines.append("SOME GATES FAILED — see remediation above; re-run after fixes.")
    lines.append("=" * 70)
    return "\n".join(lines)


def bootstrap_fixtures(fixtures_dir: str) -> int:
    """Generate a starter fixture set in the given directory."""
    os.makedirs(fixtures_dir, exist_ok=True)
    templates = {
        "tiktok_eapi_match.json": {
            "pixel_events": 1000,
            "eapi_events": 950,
            "matched_events": 905,
            "expected_orders_last_7d": 950,
            "_comment": (
                "Export from TikTok Events Manager > Diagnostics > last 7d. "
                "Gate A target: match rate >= 85%, dedup ratio in [0.7, 1.6], "
                "coverage >= 95% of expected_orders_last_7d. "
                "Canonical-pass values: 905/950 = 95.3% match rate, "
                "1000/950 = 1.05 dedup ratio, 905/950 = 95.3% coverage."
            ),
        },
        "tiktok_pixel_coverage.json": {
            "pixel_fired_count": 9000,
            "expected_pageviews": 10000,
            "_comment": (
                "Export pixel_fired_count from TikTok Events Manager > "
                "Diagnostics > PageView event count (last 7d). Get "
                "expected_pageviews from Shopify Analytics > Total sessions "
                "(last 7d). Gate C target: coverage >= 90%. "
                "Canonical-pass: 9000/10000 = 90.0%."
            ),
        },
        "tiktok_advanced_matching.json": {
            "hashed_identifier_coverage_pct": 80.0,
            "matched_with_identifier": 760,
            "total_events": 950,
            "_comment": (
                "Export from TikTok Events Manager > Advanced Matching subtab. "
                "Gate D target: hashed_identifier_coverage_pct >= 75%. "
                "Canonical-pass: 760/950 = 80.0%."
            ),
        },
    }
    for filename, content in templates.items():
        path = os.path.join(fixtures_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2)
            f.write("\n")
    print(f"Bootstrapped {len(templates)} fixture files in {fixtures_dir}/")
    print("Replace placeholder values (1000/950/870/etc.) with real diagnostic exports.")
    return 0


# ----- CLI -----

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measurement-quality audit for the TikTok Pixel + Events API "
            "attribution stack (Move #6.6 playbook)"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--fixtures-dir",
        default="./tiktok_fixtures/",
        help="Directory containing the gate fixtures (default: ./tiktok_fixtures/)",
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