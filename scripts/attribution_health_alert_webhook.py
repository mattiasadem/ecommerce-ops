#!/usr/bin/env python3
"""
attribution_health_alert_webhook.py — Move #6.10 attribution-health alert webhook

A webhook receiver + dispatcher that consumes the Move #6.8 cross-platform
attribution rollup JSON output (and optionally the Move #6.5/6.6/6.7 per-platform
audit JSON outputs), decides whether to fire an alert based on canonical
gate pass/fail + cross-platform drift thresholds, and dispatches the alert to a
webhook URL (Slack-compatible by default), prints to stdout, and/or writes a
local alert archive.

This is the canonical **Track 9-12 hardening** deferred follow-up to Moves
#6.5 / #6.6 / #6.7 / #6.8 / #6.9 — the script wires the rollup output to a
webhook so the operator gets a single alert per cycle (instead of 3 separate
per-platform alerts) and the alert includes the cross-platform drift hypothesis
+ remediation per Move #6.8's `root_cause_hypothesis` field.

Hermetic: when --webhook-url is omitted (or the local-mode stub is enabled),
the script prints the alert payload to stdout and writes it to --alert-archive.
The Slack-compatible JSON payload shape is pinned by test_canonical_alert_shape_published
so future contributors don't silently change which fields downstream consumers
parse on.

Companion playbook: playbooks/06.10-attribution-health-alert-webhook-launch.md (shipped 2026-07-09 per the operator-build-tick follow-up to the 2026-07-03 hardening tick)
Companion tick: 2026-07-03 ecommerce-ops improver track-9-12 hardening tick
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


# Canonical webhook thresholds — pinned by test_canonical_thresholds_published.
# NEVER loosen these without a documented reason AND a TICK: <date> marker.
# (mirrors Move #6.5/6.6/6.7/6.8 Pitfall #2)
WEBHOOK_THRESHOLDS: dict[str, Any] = {
    # Fire when ANY per-platform audit has overall_passed=False.
    "fire_on_any_per_platform_fail": True,
    # Fire when the cross-platform drift was detected by the rollup.
    "fire_on_cross_platform_drift": True,
    # Fire when the max absolute match-rate drift across platforms exceeds this pp.
    "fire_on_match_rate_drift_pp": 3.0,
    # Fire when the max absolute coverage drift across platforms exceeds this pp.
    "fire_on_coverage_drift_pp": 2.0,
    # Cooldown: skip firing the same alert more than once per cooldown seconds.
    "cooldown_seconds": 3600,
}


# Canonical alert payload fields — pinned by test_canonical_alert_shape_published.
ALERT_PAYLOAD_TOP_LEVEL_FIELDS: list[str] = [
    "alert_id",
    "timestamp",
    "source",
    "severity",
    "title",
    "summary",
    "per_platform_breakdown",
    "drift_summary",
    "root_cause_hypothesis",
    "remediation",
    "overall_passed",
    "thresholds_used",
    "raw_rollup_path",
]


# Canonical webhook timeout (seconds). Slack webhooks typically respond in <2s.
WEBHOOK_TIMEOUT_SECONDS: float = 5.0


def _canonical_thresholds_published() -> dict[str, Any]:
    """Return the canonical webhook thresholds — pinned regression gate."""
    return dict(WEBHOOK_THRESHOLDS)


def _canonical_alert_shape_published() -> list[str]:
    """Return the canonical alert-payload top-level fields — pinned regression gate."""
    return list(ALERT_PAYLOAD_TOP_LEVEL_FIELDS)


def _is_http_url(url: str) -> bool:
    """Return True iff url has an http(s) scheme and a non-empty netloc."""
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _load_rollup_json(rollup_path: Path) -> dict[str, Any]:
    """Load the Move #6.8 cross-platform rollup JSON output.

    Returns a normalized dict. If the rollup file is missing or malformed,
    returns a sentinel dict with overall_passed=False and an error message
    instead of raising — so the webhook can dispatch a "rollup unhealthy"
    alert without crashing.
    """
    if not rollup_path.exists():
        return {
            "error": f"ROLLOUP FILE MISSING: {rollup_path}",
            "overall_passed": False,
            "per_platform": {},
            "drift": {
                "cross_platform_drift_detected": False,
                "match_rate_drift_pp": 0.0,
                "coverage_drift_pp": 0.0,
                "platforms_with_match_rate_drop": 0,
            },
            "root_cause_hypothesis": None,
            "summary": {},
        }
    try:
        with open(rollup_path) as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return {
                "error": f"ROLLOUP JSON NOT A DICT: {type(data).__name__}",
                "overall_passed": False,
                "per_platform": {},
                "drift": {
                    "cross_platform_drift_detected": False,
                    "match_rate_drift_pp": 0.0,
                    "coverage_drift_pp": 0.0,
                    "platforms_with_match_rate_drop": 0,
                },
                "root_cause_hypothesis": None,
                "summary": {},
            }
        return data
    except (json.JSONDecodeError, OSError) as e:
        return {
            "error": f"ROLLOUP JSON DECODE FAILED: {e}",
            "overall_passed": False,
            "per_platform": {},
            "drift": {
                "cross_platform_drift_detected": False,
                "match_rate_drift_pp": 0.0,
                "coverage_drift_pp": 0.0,
                "platforms_with_match_rate_drop": 0,
            },
            "root_cause_hypothesis": None,
            "summary": {},
        }


def _decide_should_fire(
    rollup: dict[str, Any],
    thresholds: dict[str, Any],
) -> tuple[bool, str]:
    """Decide whether to fire a webhook alert based on rollup + thresholds.

    Returns (should_fire, reason) where reason is a human-readable string
    suitable for the alert summary (e.g. "2 platforms failed gates").
    """
    # Rule 1: ANY per-platform audit failing → fire.
    if thresholds.get("fire_on_any_per_platform_fail", True):
        per_platform = rollup.get("per_platform", {}) or {}
        failing = [
            label for label, result in per_platform.items()
            if isinstance(result, dict) and result.get("overall_passed") is False
        ]
        if failing:
            return True, f"{len(failing)} per-platform audit(s) failed gates: {', '.join(sorted(failing))}"

    # Rule 2: cross-platform drift detected.
    drift = rollup.get("drift", {}) or {}
    if thresholds.get("fire_on_cross_platform_drift", True) and drift.get("cross_platform_drift_detected"):
        return True, f"cross-platform drift detected: match-rate drift {drift.get('match_rate_drift_pp', 0.0):.1f}pp / coverage drift {drift.get('coverage_drift_pp', 0.0):.1f}pp / {drift.get('platforms_with_match_rate_drop', 0)} platforms with match-rate drop"

    # Rule 3: max match-rate drift exceeds threshold (sanity check on the rollup output).
    match_drift = drift.get("match_rate_drift_pp", 0.0)
    if abs(float(match_drift)) > float(thresholds.get("fire_on_match_rate_drift_pp", 3.0)):
        return True, f"match-rate drift {match_drift:.1f}pp exceeds threshold {thresholds.get('fire_on_match_rate_drift_pp', 3.0):.1f}pp"

    # Rule 4: max coverage drift exceeds threshold.
    coverage_drift = drift.get("coverage_drift_pp", 0.0)
    if abs(float(coverage_drift)) > float(thresholds.get("fire_on_coverage_drift_pp", 2.0)):
        return True, f"coverage drift {coverage_drift:.1f}pp exceeds threshold {thresholds.get('fire_on_coverage_drift_pp', 2.0):.1f}pp"

    return False, "all gates passing, no drift detected"


def _build_alert_payload(
    rollup: dict[str, Any],
    should_fire_reason: str,
    raw_rollup_path: Path,
    thresholds: dict[str, Any],
) -> dict[str, Any]:
    """Build the canonical Slack-compatible alert payload.

    The shape is pinned by test_canonical_alert_shape_published so downstream
    consumers can parse it without surprise.
    """
    per_platform = rollup.get("per_platform", {}) or {}
    drift = rollup.get("drift", {}) or {}
    root_cause = rollup.get("root_cause_hypothesis") or {}
    summary = rollup.get("summary", {}) or {}
    overall_passed = rollup.get("overall_passed", False)

    # Build a compact per-platform breakdown the operator can scan quickly.
    per_platform_breakdown: list[dict[str, Any]] = []
    any_per_platform_fail = False
    for label in sorted(per_platform.keys()):
        result = per_platform[label]
        if not isinstance(result, dict):
            continue
        op_passed = bool(result.get("overall_passed", False))
        if not op_passed:
            any_per_platform_fail = True
        per_platform_breakdown.append({
            "platform": label,
            "overall_passed": op_passed,
            "exit_code": int(result.get("exit_code", -1)),
            "script": result.get("script", label),
            "gates_failing": [
                g.get("gate", "?") for g in result.get("gates", [])
                if isinstance(g, dict) and g.get("passed") is False
            ],
            "error": result.get("error"),
        })

    drift_match_pp = float(drift.get("match_rate_drift_pp", 0.0))
    drift_cov_pp = float(drift.get("coverage_drift_pp", 0.0))
    platforms_dropping = int(drift.get("platforms_with_match_rate_drop", 0))

    title_prefix = "🔴 ATTRIBUTION HEALTH ALERT" if any_per_platform_fail else "⚠️ ATTRIBUTION DRIFT WARNING"
    title = f"{title_prefix}: {should_fire_reason}"

    return {
        "alert_id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "move-6.10-attribution-health-alert-webhook",
        "severity": "critical" if any_per_platform_fail else "warning",
        "title": title,
        "summary": (
            f"{len(per_platform_breakdown)} platform(s) audited; "
            f"{sum(1 for p in per_platform_breakdown if not p['overall_passed'])} failing; "
            f"cross-platform drift detected: {drift.get('cross_platform_drift_detected', False)}; "
            f"max match-rate drift: {drift_match_pp:.1f}pp; "
            f"max coverage drift: {drift_cov_pp:.1f}pp; "
            f"platforms with match-rate drop: {platforms_dropping}"
        ),
        "per_platform_breakdown": per_platform_breakdown,
        "drift_summary": {
            "cross_platform_drift_detected": bool(drift.get("cross_platform_drift_detected", False)),
            "match_rate_drift_pp": drift_match_pp,
            "coverage_drift_pp": drift_cov_pp,
            "platforms_with_match_rate_drop": platforms_dropping,
            "drift_by_platform": drift.get("drift_by_platform", {}),
        },
        "root_cause_hypothesis": {
            "id": root_cause.get("id"),
            "label": root_cause.get("label"),
            "remediation": root_cause.get("remediation"),
        } if isinstance(root_cause, dict) and root_cause.get("id") else None,
        "remediation": (
            root_cause.get("remediation")
            if isinstance(root_cause, dict) else
            "No specific root-cause hypothesis matched. Run moves 6.5/6.6/6.7 individually for per-platform detail."
        ),
        "overall_passed": overall_passed,
        "thresholds_used": dict(thresholds),
        "raw_rollup_path": str(raw_rollup_path),
    }


def _post_webhook(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    """POST the payload to the webhook URL using stdlib urllib.

    Returns a dict with at minimum: { "posted": bool, "status_code": int, "error": str|None }.

    NOTE: we use urllib.request (stdlib only — no extra deps) to keep this
    script hermetic per the canonical Archetype C/D-light pattern. Slack-compatible
    payloads use application/x-www-form-urlencoded OR application/json. We send
    JSON in the body with Content-Type: application/json — Slack accepts JSON
    directly via Incoming Webhooks.
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
    archive_file = archive_dir / f"alert-{ts}-{severity}.json"
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

    Looks for the most recent archive file (alert-*.json) and compares its
    timestamp against now(). If within cooldown, returns True with a reason.
    """
    if not archive_dir.exists():
        return False, ""
    try:
        archive_files = sorted(archive_dir.glob("alert-*.json"))
    except OSError:
        return False, ""
    if not archive_files:
        return False, ""
    most_recent = archive_files[-1]
    try:
        # alert_id format: YYYYMMDDTHHMMSSZ (20 chars)
        ts_str = most_recent.stem.replace("alert-", "").split("-")[0]
        last_ts = datetime.strptime(ts_str, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - last_ts).total_seconds()
        if elapsed < float(cooldown_seconds):
            return True, f"cooldown active: last alert {elapsed:.0f}s ago < {cooldown_seconds}s threshold"
    except (ValueError, IndexError):
        # If we can't parse the filename, default to firing (don't suppress alerts).
        return False, ""
    return False, ""


def _check_cooldown_in_archive_only(archive_dir: Path) -> list[str]:
    """Return list of alert stems sorted ascending (for tests)."""
    if not archive_dir.exists():
        return []
    return sorted(p.stem for p in archive_dir.glob("alert-*.json"))


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Move #6.10 attribution-health alert webhook — consumes a Move #6.8 "
            "cross-platform rollup JSON, decides whether to fire based on canonical "
            "thresholds, and dispatches to a Slack-compatible webhook URL or "
            "writes to a local archive directory (hermetic fallback)."
        ),
    )
    parser.add_argument(
        "--rollup-json",
        type=Path,
        default=None,
        help="Path to the Move #6.8 rollup JSON output (required unless --bootstrap or --validate-thresholds).",
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
        default=Path("./.alerts/"),
        help="Directory to archive alerts (default: ./.alerts/).",
    )
    parser.add_argument(
        "--cooldown-seconds",
        type=int,
        default=None,
        help="Override the cooldown seconds (default: use canonical from WEBHOOK_THRESHOLDS).",
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
        help="Bootstrap mode: create the .alerts/ directory under the given path.",
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

    args = parser.parse_args()

    # --bootstrap mode: create the .alerts/ directory.
    if args.bootstrap is not None:
        args.bootstrap.mkdir(parents=True, exist_ok=True)
        alerts_dir = args.bootstrap / ".alerts"
        alerts_dir.mkdir(parents=True, exist_ok=True)
        print(f"Bootstrap: created {alerts_dir}/", file=sys.stderr)
        return 0

    # --validate-thresholds mode: regression check.
    if args.validate_thresholds:
        thresholds = _canonical_thresholds_published()
        shape = _canonical_alert_shape_published()
        print(f"Canonical thresholds: {json.dumps(thresholds, sort_keys=True)}")
        print(f"Canonical alert shape ({len(shape)} fields): {', '.join(shape)}")
        return 0

    if args.rollup_json is None:
        parser.error("--rollup-json is required (unless --bootstrap or --validate-thresholds is set)")

    thresholds = _canonical_thresholds_published()
    if args.cooldown_seconds is not None:
        thresholds["cooldown_seconds"] = int(args.cooldown_seconds)

    # 1. Load the rollup JSON.
    rollup = _load_rollup_json(args.rollup_json)

    # 2. Decide whether to fire.
    should_fire, reason = _decide_should_fire(rollup, thresholds)

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
    payload = _build_alert_payload(rollup, reason, args.rollup_json, thresholds)

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
        archive_file = _archive_alert(payload, args.alert_archive, post_result)
    elif should_fire:
        # Hermetic mode: archive + print but don't POST.
        post_result = {
            "posted": False,
            "status_code": 0,
            "error": None,
            "url": args.webhook_url,
            "skipped": True,
        }
        archive_file = _archive_alert(payload, args.alert_archive, post_result)
    else:
        post_result["skipped"] = True

    # 6. Emit.
    output: dict[str, Any] = {
        "should_fire": should_fire,
        "reason": reason,
        "cooldown_status": cooldown_status,
        "payload": payload,
        "post_result": post_result,
        "archive_file": str(archive_file) if archive_file else None,
        "overall_passed": rollup.get("overall_passed", False),
    }

    if args.json:
        print(json.dumps(output, indent=2, sort_keys=True))
    else:
        if should_fire:
            sev = payload.get("severity", "info").upper()
            print(f"[{sev}] {payload.get('title')}", file=sys.stderr)
            print(f"  Reason: {reason}", file=sys.stderr)
            print(f"  Summary: {payload.get('summary')}", file=sys.stderr)
            print(f"  Webhook POST: {post_result}", file=sys.stderr)
            if archive_file:
                print(f"  Archived: {archive_file}", file=sys.stderr)
        else:
            print(f"[OK] No alert fired ({reason})", file=sys.stderr)

    # Exit codes:
    #   0 = no alert fired (everything healthy or cooldown suppressed)
    #   1 = alert fired and either posted or archived (operator should investigate)
    #   2 = alert fired but webhook POST FAILED (operator MUST investigate)
    if should_fire and post_result.get("error") and not post_result.get("skipped", False):
        return 2
    if should_fire:
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
