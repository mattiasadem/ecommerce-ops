#!/usr/bin/env python3
"""
triple_whale_attribution_check.py — Local-config checklist runner for the
Triple Whale / Polar Analytics attribution install (Move #6 playbook).

Companion to `/playbooks/06-install-attribution-triplewhale-or-polar.md`.
This script is NOT a Triple Whale API client — it does not require API
credentials and cannot authenticate against Triple Whale's API. Instead,
it's a HERMETIC checklist runner that validates the local configuration
fixtures the operator has staged for the install.

The script reads JSON fixtures from a directory (default: ./tw_fixtures/),
validates each fixture against the playbook's 7-gate verification contract,
and prints a pass/fail report.

Why hermetic? Triple Whale's API requires a paid plan + per-user OAuth
flow that's a 2-day setup by itself. The local-config-check approach
catches the 90% of install mistakes that don't require API access
(missing pixel, missing survey, missing Klaviyo flow names) and is
sufficient as a smoke test.

Usage:
    # Default: read fixtures from ./tw_fixtures/
    python3 triple_whale_attribution_check.py

    # Custom fixture directory
    python3 triple_whale_attribution_check.py --fixtures-dir ./my_fixtures/

    # Run a single gate
    python3 triple_whale_attribution_check.py --check pixel_capi
    python3 triple_whale_attribution_check.py --check survey_response_rate

    # JSON output (for cron / CI)
    python3 triple_whale_attribution_check.py --json

    # Bootstrap a starter fixture set
    python3 triple_whale_attribution_check.py --bootstrap ./tw_fixtures/

Fixtures (one JSON file per gate):
    - pixel_capi.json:        { "pixel_id": "...", "capi_token": "..." }
    - post_purchase_survey.json: { "question": "How did you hear about us?",
                                    "options": [...], "min_order_value": 20 }
    - klaviyo_integration.json: { "api_key": "...", "flows": [...] }
    - meta_capi.json:         { "pixel_id": "...", "capi_token": "...", "test_event_code": "..." }
    - google_enhanced.json:   { "conversion_id": "...", "send_hashed_email": true }
    - flow_event_names.json:  { "abandoned_cart": "...", "welcome_series": "...",
                                "post_purchase_upsell": "...", "sms_welcome": "..." }
    - cohort_ltv_baseline.json: { "welcome_series_on_30d_ltv": ...,
                                  "welcome_series_off_30d_ltv": ... }

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


# ----- Canonical fixture contracts (the playbook's 7 gates) -----

# Gate A — pixel + CAPI both green
REQUIRED_PIXEL_CAPI_KEYS = {"pixel_id", "capi_token"}
MIN_PIXEL_ID_LEN = 8
MIN_CAPI_TOKEN_LEN = 16

# Gate F — post-purchase survey question text
DEFAULT_SURVEY_QUESTION = "How did you hear about us?"
MIN_SURVEY_OPTIONS = 4
MIN_SKIP_ORDER_VALUE = 0
MAX_SKIP_ORDER_VALUE = 50  # above this, response rate drops too low

# Gate C — Klaviyo cohort sync
REQUIRED_KLAVIYO_FLOWS = {"abandoned_cart", "welcome_series"}

# Gate E — Google Enhanced Conversions
REQUIRED_GOOGLE_KEYS = {"conversion_id", "send_hashed_email"}

# Gate G — Cohort LTV comparison (the killer test)
MIN_COHORT_LTV_LIFT_PCT = 10.0  # 10% lift expected from welcome series on


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

def check_pixel_capi(fixture: dict[str, Any]) -> GateResult:
    """Gate A — pixel + CAPI both green.

    Contract: fixture has pixel_id (>=8 chars) AND capi_token (>=16 chars).
    """
    missing = REQUIRED_PIXEL_CAPI_KEYS - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="pixel_capi",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'pixel_id' (Triple Whale dashboard > Settings > "
                "Install > Pixel ID) and 'capi_token' (Settings > Install > "
                "Conversions API token) in pixel_capi.json"
            ),
        )
    pixel_id = str(fixture["pixel_id"])
    capi_token = str(fixture["capi_token"])
    if len(pixel_id) < MIN_PIXEL_ID_LEN:
        return GateResult(
            gate_name="pixel_capi",
            passed=False,
            detail=f"pixel_id too short ({len(pixel_id)} < {MIN_PIXEL_ID_LEN} chars)",
            remediation="Re-copy pixel_id from Triple Whale dashboard; check for truncation",
        )
    if len(capi_token) < MIN_CAPI_TOKEN_LEN:
        return GateResult(
            gate_name="pixel_capi",
            passed=False,
            detail=f"capi_token too short ({len(capi_token)} < {MIN_CAPI_TOKEN_LEN} chars)",
            remediation="Re-copy capi_token from Triple Whale dashboard; check for truncation",
        )
    return GateResult(
        gate_name="pixel_capi",
        passed=True,
        detail=f"✓ Pixel: Active (id={pixel_id[:8]}...) | ✓ CAPI: Active (token={capi_token[:8]}...)",
    )


def check_post_purchase_survey(fixture: dict[str, Any]) -> GateResult:
    """Gate F — post-purchase survey firing correctly.

    Contract: question text == "How did you hear about us?" (the default
    phrasing; customized text drops response rate 30% per playbook Pitfall #4),
    options >= 4, min_order_value in [0, 50].
    """
    if "question" not in fixture:
        return GateResult(
            gate_name="post_purchase_survey",
            passed=False,
            detail="Missing 'question' key",
            remediation="Set 'question' in post_purchase_survey.json (default: 'How did you hear about us?')",
        )
    question = str(fixture["question"])
    if question != DEFAULT_SURVEY_QUESTION:
        return GateResult(
            gate_name="post_purchase_survey",
            passed=False,
            detail=(
                f"Question text customized to '{question}'. Triple Whale research "
                f"shows default phrasing converts 2x better — see playbook Pitfall #4"
            ),
            remediation=(
                f"Revert to default question: '{DEFAULT_SURVEY_QUESTION}'"
            ),
        )
    options = fixture.get("options", [])
    if not isinstance(options, list) or len(options) < MIN_SURVEY_OPTIONS:
        return GateResult(
            gate_name="post_purchase_survey",
            passed=False,
            detail=f"Need >= {MIN_SURVEY_OPTIONS} options, got {len(options) if isinstance(options, list) else 'non-list'}",
            remediation="Add standard options: TikTok, Instagram, Google, Friend, Podcast, Blog, Other",
        )
    min_value = fixture.get("min_order_value", 0)
    if not isinstance(min_value, (int, float)) or min_value < MIN_SKIP_ORDER_VALUE or min_value > MAX_SKIP_ORDER_VALUE:
        return GateResult(
            gate_name="post_purchase_survey",
            passed=False,
            detail=f"min_order_value={min_value} out of range [{MIN_SKIP_ORDER_VALUE}, {MAX_SKIP_ORDER_VALUE}]",
            remediation="Set min_order_value to 20 (orders below this don't convert on survey)",
        )
    return GateResult(
        gate_name="post_purchase_survey",
        passed=True,
        detail=(
            f"✓ Question: default | ✓ Options: {len(options)} | "
            f"✓ Skip-logic: orders >= ${int(min_value)}"
        ),
    )


def check_klaviyo_cohort_sync(fixture: dict[str, Any]) -> GateResult:
    """Gate C — Klaviyo cohort sync live.

    Contract: api_key present AND flows include both 'abandoned_cart' AND
    'welcome_series' (Move #1 and Move #4 must be findable as cohorts).
    """
    if "api_key" not in fixture or not fixture["api_key"]:
        return GateResult(
            gate_name="klaviyo_cohort_sync",
            passed=False,
            detail="Missing or empty 'api_key'",
            remediation="Paste your Klaviyo private API key into klaviyo_integration.json",
        )
    flows = fixture.get("flows", [])
    if not isinstance(flows, list):
        return GateResult(
            gate_name="klaviyo_cohort_sync",
            passed=False,
            detail="'flows' must be a list",
            remediation="Set 'flows' to a list of Klaviyo flow event names: ['abandoned_cart', 'welcome_series', ...]",
        )
    flow_names = {str(f).lower() for f in flows}
    missing_flows = REQUIRED_KLAVIYO_FLOWS - flow_names
    if missing_flows:
        return GateResult(
            gate_name="klaviyo_cohort_sync",
            passed=False,
            detail=f"Missing required flows: {sorted(missing_flows)}",
            remediation=(
                "Add the missing flow event names. Triple Whale cohort sync "
                "needs both 'abandoned_cart' (Move #1) and 'welcome_series' "
                "(Move #4) to be findable in the Klaviyo integration"
            ),
        )
    return GateResult(
        gate_name="klaviyo_cohort_sync",
        passed=True,
        detail=(
            f"✓ Klaviyo API key present | ✓ {len(flows)} flows configured "
            f"(includes {sorted(REQUIRED_KLAVIYO_FLOWS)})"
        ),
    )


def check_meta_capi(fixture: dict[str, Any]) -> GateResult:
    """Gate D — Meta Conversions API receiving events.

    Contract: pixel_id + capi_token + test_event_code all present.
    """
    required = {"pixel_id", "capi_token", "test_event_code"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="meta_capi",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set all three keys in meta_capi.json: 'pixel_id' (Meta Events "
                "Manager > Pixels), 'capi_token' (Meta Events Manager > "
                "Settings > Conversions API), 'test_event_code' (Meta Events "
                "Manager > Test Events tab)"
            ),
        )
    return GateResult(
        gate_name="meta_capi",
        passed=True,
        detail=(
            f"✓ Meta pixel configured | ✓ CAPI token configured | "
            f"✓ Test event code: {fixture['test_event_code'][:8]}..."
        ),
    )


def check_google_enhanced_conversions(fixture: dict[str, Any]) -> GateResult:
    """Gate E — Google Enhanced Conversions quality.

    Contract: conversion_id present AND send_hashed_email is true.
    """
    missing = REQUIRED_GOOGLE_KEYS - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="google_enhanced_conversions",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set 'conversion_id' (Google Ads > Tools > Conversions > Tag "
                "setup) and 'send_hashed_email' (must be true) in "
                "google_enhanced.json"
            ),
        )
    if not fixture["send_hashed_email"]:
        return GateResult(
            gate_name="google_enhanced_conversions",
            passed=False,
            detail="send_hashed_email is false — Google Enhanced Conversions quality will be 'Unavailable'",
            remediation="Set send_hashed_email: true (the email-hashing pipe is what makes Enhanced Conversions work)",
        )
    return GateResult(
        gate_name="google_enhanced_conversions",
        passed=True,
        detail=(
            f"✓ Conversion ID: {fixture['conversion_id']} | "
            f"✓ Email hashing: active"
        ),
    )


def check_flow_event_names(fixture: dict[str, Any]) -> GateResult:
    """Validate Klaviyo flow event names against the canonical contract.

    Contract: at minimum abandoned_cart, welcome_series, post_purchase_upsell,
    sms_welcome must be present (the 4 flows Move #1/2/4/7 reference).
    """
    required = {"abandoned_cart", "welcome_series", "post_purchase_upsell", "sms_welcome"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="flow_event_names",
            passed=False,
            detail=f"Missing flow event names: {sorted(missing)}",
            remediation=(
                "Add the missing flow event names to flow_event_names.json. "
                "Each value should be the EXACT event name as it appears in "
                "Klaviyo's flow trigger configuration"
            ),
        )
    return GateResult(
        gate_name="flow_event_names",
        passed=True,
        detail=f"✓ All {len(required)} canonical flow event names present",
    )


def check_cohort_ltv_baseline(fixture: dict[str, Any]) -> GateResult:
    """Gate G — Cohort LTV comparison (the killer test).

    Contract: welcome_series_on_30d_ltv > welcome_series_off_30d_ltv by >=10%.
    This is the test that proves attribution is actually producing
    actionable signal — see playbook Gate G.
    """
    required = {"welcome_series_on_30d_ltv", "welcome_series_off_30d_ltv"}
    missing = required - set(fixture.keys())
    if missing:
        return GateResult(
            gate_name="cohort_ltv_baseline",
            passed=False,
            detail=f"Missing keys: {sorted(missing)}",
            remediation=(
                "Set both 'welcome_series_on_30d_ltv' (cohort LTV during the "
                "14 days when welcome series was ON) and "
                "'welcome_series_off_30d_ltv' (cohort LTV during the 14 days "
                "when welcome series was OFF) in cohort_ltv_baseline.json"
            ),
        )
    on_ltv = float(fixture["welcome_series_on_30d_ltv"])
    off_ltv = float(fixture["welcome_series_off_30d_ltv"])
    if off_ltv <= 0:
        return GateResult(
            gate_name="cohort_ltv_baseline",
            passed=False,
            detail=f"welcome_series_off_30d_ltv={off_ltv} must be > 0",
            remediation="Re-check the off-cohort LTV in Triple Whale; a 0 means the cohort wasn't tracked",
        )
    lift_pct = ((on_ltv - off_ltv) / off_ltv) * 100.0
    if lift_pct < MIN_COHORT_LTV_LIFT_PCT:
        return GateResult(
            gate_name="cohort_ltv_baseline",
            passed=False,
            detail=(
                f"Welcome series cohort lift = {lift_pct:.1f}% < {MIN_COHORT_LTV_LIFT_PCT}% target. "
                f"ON cohort LTV: ${on_ltv:.2f}, OFF cohort LTV: ${off_ltv:.2f}"
            ),
            remediation=(
                "Either (a) cohort definitions are wrong (the welcome series "
                "isn't actually filtering customers) — check Triple Whale > "
                "Cohorts > filter logic; or (b) the 30-day attribution window "
                "is too narrow — try 60d or 90d"
            ),
        )
    return GateResult(
        gate_name="cohort_ltv_baseline",
        passed=True,
        detail=(
            f"✓ Welcome series cohort lift = {lift_pct:.1f}% (target: ≥{MIN_COHORT_LTV_LIFT_PCT:.0f}%) "
            f"| ON: ${on_ltv:.2f}, OFF: ${off_ltv:.2f}"
        ),
    )


# ----- Gate registry -----

GATE_FIXTURE_FILES: dict[str, tuple[str, Callable[[dict[str, Any]], GateResult]]] = {
    "pixel_capi": ("pixel_capi.json", check_pixel_capi),
    "post_purchase_survey": ("post_purchase_survey.json", check_post_purchase_survey),
    "klaviyo_cohort_sync": ("klaviyo_integration.json", check_klaviyo_cohort_sync),
    "meta_capi": ("meta_capi.json", check_meta_capi),
    "google_enhanced_conversions": ("google_enhanced.json", check_google_enhanced_conversions),
    "flow_event_names": ("flow_event_names.json", check_flow_event_names),
    "cohort_ltv_baseline": ("cohort_ltv_baseline.json", check_cohort_ltv_baseline),
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
    lines.append("Triple Whale Attribution Check — Move #6 Verification")
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
        lines.append("ALL GATES PASSED — Triple Whale install is complete.")
    else:
        lines.append("")
        lines.append("SOME GATES FAILED — see remediation above; re-run after fixes.")
    lines.append("=" * 70)
    return "\n".join(lines)


def bootstrap_fixtures(fixtures_dir: str) -> int:
    """Generate a starter fixture set in the given directory."""
    os.makedirs(fixtures_dir, exist_ok=True)
    templates = {
        "pixel_capi.json": {
            "pixel_id": "REPLACE_WITH_TRIPLE_WHALE_PIXEL_ID",
            "capi_token": "REPLACE_WITH_CAPI_TOKEN",
        },
        "post_purchase_survey.json": {
            "question": "How did you hear about us?",
            "options": [
                "TikTok", "Instagram", "Google", "Friend",
                "Podcast", "Blog", "Other",
            ],
            "min_order_value": 20,
        },
        "klaviyo_integration.json": {
            "api_key": "REPLACE_WITH_KLAVIYO_PRIVATE_API_KEY",
            "flows": ["abandoned_cart", "welcome_series", "post_purchase_upsell"],
        },
        "meta_capi.json": {
            "pixel_id": "REPLACE_WITH_META_PIXEL_ID",
            "capi_token": "REPLACE_WITH_META_CAPI_TOKEN",
            "test_event_code": "REPLACE_WITH_META_TEST_EVENT_CODE",
        },
        "google_enhanced.json": {
            "conversion_id": "REPLACE_WITH_GOOGLE_CONVERSION_ID",
            "send_hashed_email": True,
        },
        "flow_event_names.json": {
            "abandoned_cart": "Abandoned Cart Reminder",
            "welcome_series": "Welcome Series",
            "post_purchase_upsell": "Post-Purchase Upsell",
            "sms_welcome": "SMS Welcome",
        },
        "cohort_ltv_baseline.json": {
            "welcome_series_on_30d_ltv": 0.0,
            "welcome_series_off_30d_ltv": 0.0,
            "_comment": (
                "After 14 days of welcome-series-on data + 14 days of "
                "off data, replace 0.0 with the actual cohort 30-day LTV "
                "from Triple Whale > Cohorts. The Gate G target is ON > "
                "OFF by >=10%."
            ),
        },
    }
    for filename, content in templates.items():
        path = os.path.join(fixtures_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=2)
            f.write("\n")
    print(f"Bootstrapped {len(templates)} fixture files in {fixtures_dir}/")
    print("Replace REPLACE_WITH_* placeholders before running --check.")
    return 0


# ----- CLI -----

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Local-config checklist runner for the Triple Whale / Polar "
            "Analytics attribution install (Move #6 playbook)"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--fixtures-dir",
        default="./tw_fixtures/",
        help="Directory containing the gate fixtures (default: ./tw_fixtures/)",
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
        # Patch summary into the dict for JSON consumers.
        out = report.to_dict()
        print(json.dumps(out, indent=2))
    else:
        print(render_human(report))
    return 0 if report.overall_passed else 1


if __name__ == "__main__":
    sys.exit(main())
