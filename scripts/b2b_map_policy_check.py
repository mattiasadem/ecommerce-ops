#!/usr/bin/env python3
"""
b2b_map_policy_check.py — Move #14.5 B2B-MAP-policy check + alert webhook

A wire script that consumes the canonical B2B-MAP-policy state JSON output
(describing a brand's MAP-policy posture across the 5 canonical Pillar-4 levers
from research/10-b2b-wholesale.md), decides whether to fire an alert based on
canonical MAP-policy-cannibalization-defense thresholds, and dispatches the
alert to a webhook URL (Slack-compatible by default), prints to stdout, and/or
writes a local alert archive.

This is the canonical **Track 9-12 hardening** deferred follow-up to Move
#14.5 B2B-wholesale — the script wires the existing research/10 Pillar-4
MAP-policy + DTC-cannibalization-defense substrate to a webhook so the
operator gets a single per-cycle MAP-policy-health alert (instead of
discovering MAP-violation-erosion post-hoc from 30-50% DTC-traffic loss
per Faire 2024 benchmarks).

The script consumes a canonical B2B-MAP-policy state JSON with shape:

    {
      "brand_id": "<string>",
      "captured_at": "<ISO timestamp>",
      "wholesale_channel_active": <bool>,
      "wholesale_sku_count": <int>,
      "wholesale_arpu_ratio_vs_dtc": <float 0-1>,
      "dtc_cannibalization_pct": <float>,
      "levers": {
        "map_policy_page_published": <bool>,
        "three_strike_enforcement_active": <bool>,
        "geographic_exclusivity_top_20": <bool>,
        "city_level_exclusivity_top_5": <bool>,
        "channel_exclusivity_tier": <bool>,
        "shopify_b2b_handshake_geographic_exclusion": <bool>,
        "map_policy_enforcement_tooling": <bool>,
        "arpu_cannibalization_monitoring": <bool>
      },
      "map_violations_last_30d": <int>,
      "first_violation_warnings_last_30d": <int>,
      "second_violation_suspensions_last_30d": <int>,
      "third_violation_terminations_last_30d": <int>
    }

Hermetic: when --webhook-url is omitted (or --skip-webhook is set), the script
prints the alert payload to stdout and writes it to --alert-archive. The
Slack-compatible JSON payload shape is pinned by
test_canonical_alert_shape_published so future contributors don't silently
change which fields downstream consumers parse on.

Companion artifacts:
- research/10-b2b-wholesale.md Pillar 4 (the canonical 5-lever MAP-policy +
  DTC-cannibalization-defense substrate)
- playbooks/17-b2b-wholesale-launch.md (the operator-build companion)
- assets/18-b2b-wholesale-kits.md (the operator-copy companion, MAP-policy-page
  template + RFQ-brief template + 5-clause wholesale-distribution-agreement
  template)
- scripts/b2b_wholesale_unit_economics.py (the scoring-script that emits
  map_policy_savings_pct_low/high + dtc_cannibalization_rate used as a
  primary signal by this check)
- dashboards/b2b-wholesale-channel-health.html (the 6th-layer static dashboard)

Companion tick: 2026-07-10 ecommerce-ops improver track-9-12 hardening tick
(closes the canonical Move-#14.5-B2B-MAP-policy-check deferred gap per v0.36.0
Track 9-12 hardening recipe + the prior tick's `541c4e4` next-action
recommendation).
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


# Canonical MAP-policy check thresholds — pinned by test_canonical_thresholds_published.
# NEVER loosen these without a documented reason AND a TICK: <date> marker.
# Mirrors research/10 Pillar 4 + scripts/b2b_wholesale_unit_economics.py MAP_POLICY_SAVINGS_PCT
# and DTC_CANNIBALIZATION_RATE constants.
MAP_POLICY_THRESHOLDS: dict[str, Any] = {
    # Fire when any of the 5 canonical Pillar-4 levers is MISSING and the
    # wholesale channel is active (the canonical MAP-policy-cannibalization
    # defense is incomplete).
    "fire_on_any_pillar_4_lever_missing": True,
    # Fire when the 3-strike enforcement is not active and MAP-policy-page
    # is published (publishing without enforcement is the canonical
    # MAP-violation-erosion anti-pattern per Faire 2024 + research/10 Pillar 4).
    "fire_on_no_3_strike_enforcement": True,
    # Fire when DTC cannibalization exceeds this percent (the canonical
    # unprotected-erosion threshold per research/10 Pillar 4 + Faire 2024).
    "fire_on_dtc_cannibalization_pct": 25.0,
    # Fire when 2+ third-violation terminations occurred in the last 30 days
    # (a signal that retailer compliance is breaking down).
    "fire_on_3rd_violation_terminations_30d": 2,
    # Cooldown: skip firing the same alert more than once per cooldown seconds.
    "cooldown_seconds": 86400,  # 24-hour cooldown for daily-cadence MAP checks
}


# Canonical alert payload fields — pinned by test_canonical_alert_shape_published.
ALERT_PAYLOAD_TOP_LEVEL_FIELDS: list[str] = [
    "alert_id",
    "timestamp",
    "source",
    "severity",
    "title",
    "summary",
    "lever_breakdown",
    "dtc_cannibalization_summary",
    "root_cause_hypothesis",
    "remediation",
    "overall_passed",
    "thresholds_used",
    "raw_state_path",
]


# Canonical webhook timeout (seconds). Slack webhooks typically respond in <2s.
WEBHOOK_TIMEOUT_SECONDS: float = 5.0

# Canonical 5 Pillar-4 lever keys (research/10 Pillar 4 + scripts/b2b_wholesale_unit_economics.py).
PILLAR_4_LEVERS: list[str] = [
    "map_policy_page_published",
    "three_strike_enforcement_active",
    "geographic_exclusivity_top_20",
    "channel_exclusivity_tier",
    "map_policy_enforcement_tooling",
]

# Canonical optional levers (rolled-up defenses that strengthen the 5-lever baseline).
OPTIONAL_PILLAR_4_LEVERS: list[str] = [
    "city_level_exclusivity_top_5",
    "shopify_b2b_handshake_geographic_exclusion",
    "arpu_cannibalization_monitoring",
]

# Canonical remediation text per missing-lever scenario.
LEVER_REMEDIATION: dict[str, str] = {
    "map_policy_page_published": (
        "Publish the canonical MAP-policy-page on brand.com listing every SKU's "
        "MAP-price + Wholesale-Auto-Effective-Price + 3-strike-enforcement "
        "(1st-violation written-warning / 2nd-violation 30-day-suspension / "
        "3rd-violation permanent-termination) per research/10 Pillar 4 + "
        "Sherman-Antitrust-Act-RPM-policy-per-se-exemption. Without it, "
        "30-50% of DTC-traffic erodes per Faire 2024 benchmarks. Use the "
        "paste-ready MAP-policy-page template from assets/18 §MAP-policy-page."
    ),
    "three_strike_enforcement_active": (
        "Activate the 3-strike enforcement alongside the MAP-policy-page: "
        "1st-violation written-warning / 2nd-violation 30-day-suspension / "
        "3rd-violation permanent-termination per research/10 Pillar 4 + "
        "Faire 2024 vendor-survey. Brands without internal-enforcement-team "
        "lose 50-60% of MAP-policy-effectiveness. Document the "
        "enforcement-procedure in playbooks/17 §Phase 3."
    ),
    "geographic_exclusivity_top_20": (
        "Offer state-by-state geographic-exclusivity for top-20-accounts "
        "(e.g. Splash is the only authorized California retailer) per "
        "Faire 2024 + Handshake geographic-exclusion-benchmarks. Default = "
        "state-level exclusivity for top-20-accounts. Without it, 40-60% of "
        "DTC-traffic in shared-territories erodes per research/10 Pillar 4 "
        "Pitfall #8. See playbooks/17 §Phase 3 + assets/18 §geographic-"
        "exclusivity-template."
    ),
    "channel_exclusivity_tier": (
        "Define a per-channel-exclusivity-tier matrix (e.g. "
        "Faire-only / Shopify-B2B-only / Amazon-Business-only / RSP-only) per "
        "research/10 Pillar 4 + Faire 2024 benchmarks. Without it, "
        "wholesale-channel cannibalizes DTC-traffic in shared-channels. "
        "See assets/18 §per-channel-MOQ-casepack-matrix for the canonical "
        "tier-template."
    ),
    "map_policy_enforcement_tooling": (
        "Wire the MAP-policy-violation-reporting channel from each "
        "marketplace (Faire + Tundra + Ankorstore + Handshake) into a "
        "single enforcement-inbox (e.g. map-violations@brand.com or a Slack "
        "channel) per research/10 Pillar 4 + Faire 2024 vendor-survey. "
        "Brands without an internal-enforcement-team lose 50-60% of "
        "MAP-policy-effectiveness. See playbooks/17 §Phase 3 step 5."
    ),
    "city_level_exclusivity_top_5": (
        "OPTIONAL reinforcement: offer city-level geographic-exclusivity "
        "for top-5-accounts (e.g. Nordstrom SF vs Nordstrom LA) per Faire "
        "2024 + Handshake benchmarks. Compounds state-level-exclusivity."
    ),
    "shopify_b2b_handshake_geographic_exclusion": (
        "OPTIONAL reinforcement: configure Handshake geographic-exclusion in "
        "Shopify B2B settings (block out-of-territory buyer-PO) per "
        "research/10 Pillar 4 + Handshake 2024 benchmarks. Compounds "
        "state-level-exclusivity for Shopify-B2B-channel."
    ),
    "arpu_cannibalization_monitoring": (
        "OPTIONAL reinforcement: wire Triple-Whale B2B-cohort-LTV-overlay "
        "for ARPU-cannibalization-monitoring-quarterly per research/10 Pillar 4 "
        "+ Triple-Whale 2024 benchmarks. Catches DTC-revenue-leakage the "
        "MAP-policy-page misses (e.g. wholesale-buyer-DTC-funnel-attribution)."
    ),
}


def _canonical_thresholds_published() -> dict[str, Any]:
    """Return the canonical MAP-policy check thresholds — pinned regression gate."""
    return dict(MAP_POLICY_THRESHOLDS)


def _canonical_alert_shape_published() -> list[str]:
    """Return the canonical alert-payload top-level fields — pinned regression gate."""
    return list(ALERT_PAYLOAD_TOP_LEVEL_FIELDS)


def _canonical_levers_published() -> list[str]:
    """Return the canonical 5 Pillar-4 levers + 3 optional levers — pinned regression gate."""
    return list(PILLAR_4_LEVERS) + list(OPTIONAL_PILLAR_4_LEVERS)


def _is_http_url(url: str) -> bool:
    """Return True iff url has an http(s) scheme and a non-empty netloc."""
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _load_state_json(state_path: Path) -> dict[str, Any]:
    """Load the B2B-MAP-policy state JSON.

    Returns a normalized dict. If the state file is missing or malformed,
    returns a sentinel dict with overall_passed=False and an error message
    instead of raising — so the check can dispatch a "state unhealthy"
    alert without crashing.

    Sentinel shape mirrors the canonical happy-path shape so downstream
    consumers can parse uniformly.
    """
    sentinel_levers = {lever: False for lever in PILLAR_4_LEVERS + OPTIONAL_PILLAR_4_LEVERS}
    if not state_path.exists():
        return {
            "error": f"B2B-MAP-POLICY STATE FILE MISSING: {state_path}",
            "overall_passed": False,
            "brand_id": None,
            "wholesale_channel_active": False,
            "wholesale_sku_count": 0,
            "wholesale_arpu_ratio_vs_dtc": 1.0,
            "dtc_cannibalization_pct": 0.0,
            "levers": sentinel_levers,
            "map_violations_last_30d": 0,
            "first_violation_warnings_last_30d": 0,
            "second_violation_suspensions_last_30d": 0,
            "third_violation_terminations_last_30d": 0,
        }
    try:
        with open(state_path) as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return {
                "error": f"B2B-MAP-POLICY STATE JSON NOT A DICT: {type(data).__name__}",
                "overall_passed": False,
                "brand_id": None,
                "wholesale_channel_active": False,
                "wholesale_sku_count": 0,
                "wholesale_arpu_ratio_vs_dtc": 1.0,
                "dtc_cannibalization_pct": 0.0,
                "levers": sentinel_levers,
                "map_violations_last_30d": 0,
                "first_violation_warnings_last_30d": 0,
                "second_violation_suspensions_last_30d": 0,
                "third_violation_terminations_last_30d": 0,
            }
        # Coerce levers dict to canonical 8-lever shape (fill missing keys with False).
        levers = data.get("levers", {}) or {}
        if not isinstance(levers, dict):
            levers = {}
        normalized_levers = {lever: bool(levers.get(lever, False)) for lever in PILLAR_4_LEVERS + OPTIONAL_PILLAR_4_LEVERS}
        data["levers"] = normalized_levers
        return data
    except (json.JSONDecodeError, OSError) as e:
        return {
            "error": f"B2B-MAP-POLICY STATE JSON DECODE FAILED: {e}",
            "overall_passed": False,
            "brand_id": None,
            "wholesale_channel_active": False,
            "wholesale_sku_count": 0,
            "wholesale_arpu_ratio_vs_dtc": 1.0,
            "dtc_cannibalization_pct": 0.0,
            "levers": sentinel_levers,
            "map_violations_last_30d": 0,
            "first_violation_warnings_last_30d": 0,
            "second_violation_suspensions_last_30d": 0,
            "third_violation_terminations_last_30d": 0,
        }


def _decide_should_fire(
    state: dict[str, Any],
    thresholds: dict[str, Any],
) -> tuple[bool, str]:
    """Decide whether to fire a MAP-policy check alert based on state + thresholds.

    Returns (should_fire, reason) where reason is a human-readable string
    suitable for the alert summary (e.g. "2 Pillar-4 levers missing: ...")
    """
    wholesale_active = bool(state.get("wholesale_channel_active", False))
    levers = state.get("levers", {}) or {}

    # Rule 1: 3-strike enforcement not active while MAP-policy-page IS published.
    # This is the canonical anti-pattern per Faire 2024 (publishing without
    # enforcement loses 50-60% of MAP-policy-effectiveness). Check this BEFORE
    # the general "missing lever" rule so the operator sees the specific
    # anti-pattern message rather than the generic "N levers missing" message.
    if thresholds.get("fire_on_no_3_strike_enforcement", True) and wholesale_active:
        if levers.get("map_policy_page_published") and not levers.get("three_strike_enforcement_active"):
            return True, (
                "MAP-policy-page published WITHOUT 3-strike enforcement active — "
                "canonical MAP-violation-erosion anti-pattern (publishing without "
                "enforcement loses 50-60% of MAP-policy-effectiveness per Faire 2024)"
            )

    # Rule 2: ANY Pillar-4 lever missing AND wholesale channel is active → fire.
    # Wholesale without MAP-policy-defense = canonical 30-50% DTC-traffic erosion.
    if thresholds.get("fire_on_any_pillar_4_lever_missing", True) and wholesale_active:
        missing_pillar_4 = [
            lever for lever in PILLAR_4_LEVERS
            if not levers.get(lever, False)
        ]
        if missing_pillar_4:
            return True, (
                f"{len(missing_pillar_4)} of {len(PILLAR_4_LEVERS)} canonical Pillar-4 "
                f"MAP-policy levers missing (wholesale active): "
                f"{', '.join(missing_pillar_4)}"
            )

    # Rule 3: DTC cannibalization exceeds threshold.
    cannibalization_pct = float(state.get("dtc_cannibalization_pct", 0.0))
    threshold_pct = float(thresholds.get("fire_on_dtc_cannibalization_pct", 25.0))
    if cannibalization_pct > threshold_pct:
        return True, (
            f"DTC cannibalization {cannibalization_pct:.1f}% exceeds threshold "
            f"{threshold_pct:.1f}% — wholesale-channel-erosion above the canonical "
            f"unprotected-erosion band per research/10 Pillar 4"
        )

    # Rule 4: 3rd-violation terminations exceed threshold (retailer compliance breakdown).
    terminations_30d = int(state.get("third_violation_terminations_last_30d", 0))
    terminations_threshold = int(thresholds.get("fire_on_3rd_violation_terminations_30d", 2))
    if terminations_30d >= terminations_threshold:
        return True, (
            f"{terminations_30d} 3rd-violation terminations in last 30d exceeds "
            f"threshold {terminations_threshold} — retailer-compliance breakdown "
            f"signal (brand should audit wholesale-buyer-portfolio + consider "
            f"distribution-agreement-renewals)"
        )

    return False, "all Pillar-4 levers active, cannibalization within band"


def _build_alert_payload(
    state: dict[str, Any],
    should_fire_reason: str,
    raw_state_path: Path,
    thresholds: dict[str, Any],
) -> dict[str, Any]:
    """Build the canonical Slack-compatible alert payload.

    The shape is pinned by test_canonical_alert_shape_published so downstream
    consumers can parse it without surprise.
    """
    levers = state.get("levers", {}) or {}
    wholesale_active = bool(state.get("wholesale_channel_active", False))
    cannibalization_pct = float(state.get("dtc_cannibalization_pct", 0.0))
    overall_passed = bool(state.get("overall_passed", not should_fire_reason.startswith("all ")))

    # Build a per-lever breakdown the operator can scan quickly.
    lever_breakdown: list[dict[str, Any]] = []
    any_missing = False
    for lever in PILLAR_4_LEVERS + OPTIONAL_PILLAR_4_LEVERS:
        active = bool(levers.get(lever, False))
        is_canonical = lever in PILLAR_4_LEVERS
        if is_canonical and not active:
            any_missing = True
        lever_breakdown.append({
            "lever": lever,
            "active": active,
            "canonical": is_canonical,
            "category": "pillar_4_canonical" if is_canonical else "pillar_4_optional",
            "remediation": LEVER_REMEDIATION.get(
                lever,
                "No remediation text pinned for this lever — see research/10 Pillar 4.",
            ),
        })

    # Build the per-violation breakdown.
    violations_30d = int(state.get("map_violations_last_30d", 0))
    first_warnings_30d = int(state.get("first_violation_warnings_last_30d", 0))
    second_suspensions_30d = int(state.get("second_violation_suspensions_last_30d", 0))
    third_terminations_30d = int(state.get("third_violation_terminations_last_30d", 0))

    if wholesale_active and (any_missing or cannibalization_pct > float(thresholds.get("fire_on_dtc_cannibalization_pct", 25.0))):
        severity = "critical"
        title_prefix = "🔴 B2B-MAP-POLICY ALERT"
    elif wholesale_active:
        severity = "warning"
        title_prefix = "⚠️ B2B-MAP-POLICY DRIFT"
    else:
        severity = "info"
        title_prefix = "ℹ️ B2B-MAP-POLICY HEALTH"

    title = f"{title_prefix}: {should_fire_reason}"
    brand_id = state.get("brand_id", "<unknown-brand>")

    # Build the canonical root-cause hypothesis (which lever is most-likely the
    # root cause, derived from the lever-breakdown).
    root_cause = None
    missing_pillar_4 = [
        lever for lever in PILLAR_4_LEVERS
        if not levers.get(lever, False)
    ]
    if missing_pillar_4:
        root_cause = {
            "id": missing_pillar_4[0],
            "label": missing_pillar_4[0],
            "category": "pillar_4_canonical",
            "remediation": LEVER_REMEDIATION.get(
                missing_pillar_4[0],
                "No remediation text pinned — see research/10 Pillar 4.",
            ),
            "additional_missing_levers": missing_pillar_4[1:],
        }
    elif cannibalization_pct > float(thresholds.get("fire_on_dtc_cannibalization_pct", 25.0)):
        root_cause = {
            "id": "high_dtc_cannibalization",
            "label": "high_dtc_cannibalization",
            "category": "dtc_erosion",
            "remediation": (
                "Investigate which wholesale-buyer is selling below MAP-price. "
                "Audit the wholesale-eligible-SKU-subset — likely 100% of SKUs are "
                "wholesale-available (the canonical anti-pattern per research/10 "
                "Pillar 4 Pitfall #9). Default fix: wholesale-eligible-SKU-subset "
                "of 12-30 hero SKUs + 5-10 exclusive-wholesale-SKUs + 5-10 "
                "B2B-exclusive-SKUs."
            ),
            "additional_missing_levers": [],
        }
    elif third_terminations_30d >= int(thresholds.get("fire_on_3rd_violation_terminations_30d", 2)):
        root_cause = {
            "id": "retailer_compliance_breakdown",
            "label": "retailer_compliance_breakdown",
            "category": "compliance",
            "remediation": (
                "Audit the wholesale-buyer-portfolio for repeat-offender retailers. "
                "Consider tightening distribution-agreement-terms + reviewing "
                "geographic-exclusivity-tier-coverage. See playbooks/17 §Phase 3."
            ),
            "additional_missing_levers": [],
        }

    return {
        "alert_id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "move-14.5-b2b-map-policy-check",
        "severity": severity,
        "title": title,
        "summary": (
            f"brand={brand_id}; wholesale_channel_active={wholesale_active}; "
            f"{sum(1 for p in lever_breakdown if p['canonical'] and not p['active'])} "
            f"of {len(PILLAR_4_LEVERS)} canonical Pillar-4 levers missing; "
            f"DTC cannibalization {cannibalization_pct:.1f}%; "
            f"violations_last_30d={violations_30d} (1st={first_warnings_30d}/"
            f"2nd={second_suspensions_30d}/3rd={third_terminations_30d})"
        ),
        "lever_breakdown": lever_breakdown,
        "dtc_cannibalization_summary": {
            "cannibalization_pct": cannibalization_pct,
            "threshold_pct": float(thresholds.get("fire_on_dtc_cannibalization_pct", 25.0)),
            "above_threshold": cannibalization_pct > float(thresholds.get("fire_on_dtc_cannibalization_pct", 25.0)),
            "wholesale_arpu_ratio_vs_dtc": float(state.get("wholesale_arpu_ratio_vs_dtc", 1.0)),
            "wholesale_sku_count": int(state.get("wholesale_sku_count", 0)),
        },
        "root_cause_hypothesis": root_cause,
        "remediation": (
            root_cause["remediation"]
            if root_cause
            else "All canonical Pillar-4 MAP-policy levers active and DTC cannibalization within band. Continue daily-cadence MAP-policy-check + quarterly ARPU-cannibalization-monitoring."
        ),
        "overall_passed": overall_passed,
        "thresholds_used": dict(thresholds),
        "raw_state_path": str(raw_state_path),
    }


def _post_webhook(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    """POST the payload to the webhook URL using stdlib urllib.

    Returns a dict with at minimum: { "posted": bool, "status_code": int, "error": str|None }.

    NOTE: we use urllib.request (stdlib only — no extra deps) to keep this
    script hermetic per the canonical Archetype C/D-light pattern. Slack-compatible
    payloads use Content-Type: application/json. We send JSON in the body —
    Slack accepts JSON directly via Incoming Webhooks.
    """
    result: dict[str, Any] = {
        "posted": False,
        "status_code": 0,
        "error": None,
        "url": url,
    }
    if not _is_http_url(url):
        result["error"] = f"Invalid webhook URL: {url!r}"
        return result

    body = json.dumps(payload).encode("utf-8")
    try:
        req = Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(req, timeout=WEBHOOK_TIMEOUT_SECONDS) as resp:  # noqa: S310 — caller-supplied URL
            result["status_code"] = int(getattr(resp, "status", 0))
            result["posted"] = 200 <= result["status_code"] < 300
            return result
    except HTTPError as e:
        result["status_code"] = int(getattr(e, "code", 0))
        result["error"] = f"HTTP {result['status_code']}: {e.reason if hasattr(e, 'reason') else e}"
        return result
    except URLError as e:
        result["error"] = f"URL ERROR: {e.reason if hasattr(e, 'reason') else e}"
        return result
    except Exception as e:  # noqa: BLE001
        result["error"] = f"WEBHOOK POST FAILED: {e}"
        return result


def _archive_alert(
    payload: dict[str, Any],
    archive_dir: Path,
    post_result: dict[str, Any],
) -> Path:
    """Write the alert payload + post result to a timestamped archive file.

    Returns the archive file path.
    """
    archive_dir.mkdir(parents=True, exist_ok=True)
    ts = payload.get("alert_id", datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    severity = payload.get("severity", "info")
    archive_file = archive_dir / f"map-alert-{ts}-{severity}.json"
    archive_data = {
        "payload": payload,
        "post_result": post_result,
    }
    with open(archive_file, "w") as f:
        json.dump(archive_data, f, indent=2, sort_keys=True)
    return archive_file


def _respect_cooldown(
    archive_dir: Path,
    cooldown_seconds: int,
) -> tuple[bool, str]:
    """Return (should_skip, reason) — True if the last alert in archive_dir
    is within the cooldown window.

    Looks for the most recent archive file (map-alert-*.json) and compares its
    timestamp against now(). If within cooldown, returns True with a reason.
    """
    if not archive_dir.exists():
        return False, ""
    try:
        archive_files = sorted(archive_dir.glob("map-alert-*.json"))
    except OSError:
        return False, ""
    if not archive_files:
        return False, ""
    most_recent = archive_files[-1]
    try:
        # alert_id format: YYYYMMDDTHHMMSSZ (20 chars)
        ts_str = most_recent.stem.replace("map-alert-", "").split("-")[0]
        last_ts = datetime.strptime(ts_str, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - last_ts).total_seconds()
        if elapsed < float(cooldown_seconds):
            return True, f"cooldown active: last alert {elapsed:.0f}s ago < {cooldown_seconds}s threshold"
    except (ValueError, IndexError):
        # If we can't parse the filename, default to firing (don't suppress alerts).
        return False, ""
    return False, ""


def main_with_args(argv: list[str]) -> int:
    """Main entry point with explicit argv (for in-process testing).

    Equivalent to `main()` but takes argv as a list, allowing tests to
    invoke the CLI without subprocess overhead. The standalone `main()`
    entry point delegates to this with `sys.argv[1:]`.
    """
    parser = argparse.ArgumentParser(
        description=(
            "Move #14.5 B2B-MAP-policy check — consumes a B2B-MAP-policy state JSON "
            "describing a brand's MAP-policy posture across the canonical Pillar-4 "
            "levers from research/10, decides whether to fire based on canonical "
            "thresholds, and dispatches to a Slack-compatible webhook URL or writes "
            "to a local archive directory (hermetic fallback)."
        ),
    )
    parser.add_argument(
        "--state-json",
        type=Path,
        default=None,
        help="Path to the B2B-MAP-policy state JSON output (required unless --bootstrap or --validate-thresholds).",
    )
    parser.add_argument(
        "--webhook-url",
        type=str,
        default=None,
        help="Slack-compatible webhook URL (optional; if omitted the script is hermetic).",
    )
    parser.add_argument(
        "--alert-archive",
        type=Path,
        default=Path("./.map-alerts/"),
        help="Directory to archive alerts (default: ./.map-alerts/).",
    )
    parser.add_argument(
        "--cooldown-seconds",
        type=int,
        default=None,
        help="Override the cooldown seconds (default: use canonical from MAP_POLICY_THRESHOLDS).",
    )
    parser.add_argument(
        "--skip-cooldown",
        action="store_true",
        help="Skip cooldown check (force-fire even if a recent alert exists).",
    )
    parser.add_argument(
        "--skip-webhook",
        action="store_true",
        help="Skip the webhook POST (still build + archive + print payload).",
    )
    parser.add_argument(
        "--bootstrap",
        type=Path,
        default=None,
        help="Bootstrap mode: create the .map-alerts/ directory under the given path.",
    )
    parser.add_argument(
        "--validate-thresholds",
        action="store_true",
        help="Validate the canonical thresholds + alert shape are still published (regression check).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the alert payload + post result as JSON on stdout.",
    )

    args = parser.parse_args(argv)

    # --bootstrap mode: create the .map-alerts/ directory.
    if args.bootstrap is not None:
        args.bootstrap.mkdir(parents=True, exist_ok=True)
        alerts_dir = args.bootstrap / ".map-alerts"
        alerts_dir.mkdir(parents=True, exist_ok=True)
        print(f"Bootstrap: created {alerts_dir}/", file=sys.stderr)
        return 0

    # --validate-thresholds mode: regression check.
    if args.validate_thresholds:
        thresholds = _canonical_thresholds_published()
        shape = _canonical_alert_shape_published()
        levers = _canonical_levers_published()
        print(f"Canonical MAP-policy thresholds: {json.dumps(thresholds, sort_keys=True)}")
        print(f"Canonical alert shape ({len(shape)} fields): {', '.join(shape)}")
        print(f"Canonical Pillar-4 levers ({len(levers)} keys): {', '.join(levers)}")
        return 0

    if args.state_json is None:
        parser.error("--state-json is required (unless --bootstrap or --validate-thresholds is set)")

    thresholds = _canonical_thresholds_published()
    if args.cooldown_seconds is not None:
        thresholds["cooldown_seconds"] = int(args.cooldown_seconds)

    # 1. Load the state JSON.
    state = _load_state_json(args.state_json)

    # 2. Decide whether to fire.
    should_fire, reason = _decide_should_fire(state, thresholds)

    # 3. Respect cooldown (unless --skip-cooldown).
    cooldown_status: dict[str, Any] = {
        "skipped": False,
        "reason": None,
        "applied": False,
    }
    if should_fire and not args.skip_cooldown:
        is_skip, skip_reason = _respect_cooldown(args.alert_archive, int(thresholds["cooldown_seconds"]))
        if is_skip:
            should_fire = False
            cooldown_status["skipped"] = True
            cooldown_status["reason"] = skip_reason
            cooldown_status["applied"] = True
            reason = f"cooldown: {skip_reason}"

    # 4. Build the alert payload (always — useful for debugging).
    payload = _build_alert_payload(state, reason, args.state_json, thresholds)

    # 5. Dispatch.
    post_result: dict[str, Any] = {
        "posted": False,
        "status_code": 0,
        "error": None,
        "url": args.webhook_url,
        "skipped": False,
    }
    archive_file: Path | None = None

    if should_fire and args.webhook_url and not args.skip_webhook:
        post_result = _post_webhook(args.webhook_url, payload)

    # 6. Archive (only when we would have fired, OR when --skip-cooldown was used).
    # If cooldown skipped the fire, archive nothing — operator doesn't need a no-op record.
    if should_fire or cooldown_status["applied"]:
        archive_file = _archive_alert(payload, args.alert_archive, post_result)

    # 7. Output.
    if args.json:
        output = {
            "should_fire": should_fire,
            "reason": reason,
            "cooldown_status": cooldown_status,
            "payload": payload,
            "post_result": post_result,
            "archive_file": str(archive_file) if archive_file else None,
        }
        print(json.dumps(output, indent=2, sort_keys=True))
        return 1 if should_fire else 0

    # Human-readable output.
    print(f"should_fire: {should_fire}")
    print(f"reason: {reason}")
    if cooldown_status["applied"]:
        print(f"cooldown: {cooldown_status['reason']}")
    if should_fire and args.webhook_url and not args.skip_webhook:
        if post_result["posted"]:
            print(f"webhook: posted (status {post_result['status_code']})")
        else:
            print(f"webhook: FAILED ({post_result['error']})")
    if archive_file:
        print(f"archive: {archive_file}")
    return 1 if should_fire else 0


def main() -> int:
    """CLI entry point — delegates to `main_with_args(sys.argv[1:])`."""
    return main_with_args(sys.argv[1:])


if __name__ == "__main__":
    sys.exit(main())