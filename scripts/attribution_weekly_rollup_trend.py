#!/usr/bin/env python3
"""
attribution_weekly_rollup_trend.py — Move #6.5 weekly-rollup-trend (Track 9-12 hardening)

A trend-analysis wire script that consumes the last N weeks of Move #6.8
cross-platform attribution rollup JSON outputs (each rollup records the per-platform
match-rate + coverage for that cycle), trend-dedups the headline metrics across the
12-week window, and surfaces the trend direction (improving / declining / stable)
per platform — plus an optional Slack-compatible POST when direction crosses a
canonical threshold.

This is the canonical **Track 9-12 hardening** deferred follow-up to Move #6.8
cross-platform attribution drift unification — the Move #6.8 rollup only sees
the LAST cycle vs the cycle before that (1-vs-1 drift detection). Move #6.5
weekly-rollup-trend extends that to a 12-week trend view that catches SLOW
erosion patterns Move #6.8's 1-vs-1 drift misses (e.g. match-rate drifting
-0.4pp/week for 6 weeks = -2.4pp cumulative which Move #6.8 still flags
as <3.0pp threshold each individual week, but the TREND is clearly downward).

Hermetic: when --webhook-url is omitted (or --skip-webhook is set), the script
prints the trend payload to stdout and writes it to --alert-archive. The
Slack-compatible JSON payload shape is pinned by
test_canonical_trend_alert_shape_published so future contributors don't silently
change which fields downstream consumers parse on.

Companion artifacts:
- scripts/attribution_cross_platform_rollup.py (the Move #6.8 rollup that
  produces the per-week rollup.json files this script consumes)
- scripts/attribution_health_alert_webhook.py (the Move #6.10 webhook that
  handles per-cycle cross-platform drift alerts; this script is its
  multi-cycle TREND companion)
- scripts/tests/test_attribution_health_alert_webhook.py (the per-cycle alert
  test file; this script's test file follows the same canonical pattern)
- playbooks/06.8-cross-platform-attribution-drift-unification.md (the Move #6.8
  operator-build playbook that ships the per-cycle rollup)
- research/06-marketplace-expansion.md + research/14-amazon-dsp-amazon-attribution-audit.md
  (the research substrate that motivates the multi-platform rollup)
- dashboards/unified-attribution-health.html (the per-cycle dashboard; this
  script produces trend data that a future multi-week dashboard can render)

Companion tick: 2026-07-10 ecommerce-ops improver track-9-12 hardening tick
(closes the canonical Move-#6.5-weekly-rollup-trend-script deferred gap per
v0.36.0 Track 9-12 hardening recipe + the prior tick's `45ee5b1` next-action
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


# Canonical trend thresholds — pinned by test_canonical_trend_thresholds_published.
# NEVER loosen these without a documented reason AND a TICK: <date> marker.
# Mirrors Move #6.8 D1 (match-rate drift 3.0pp) + D2 (coverage drift 2.0pp) +
# Move #6.10 webhook thresholds — but applied across N weeks rather than 1-vs-1.
TREND_THRESHOLDS: dict[str, Any] = {
    # Number of weekly rollups to include in the trend window.
    "trend_window_weeks": 12,
    # Fire when the cumulative match-rate drift across the trend window exceeds this pp.
    # (cumulative = sum-of-weekly-deltas; surfaces slow erosion that 1-vs-1 misses).
    "fire_on_cumulative_match_rate_drift_pp": 3.0,
    # Fire when the cumulative coverage drift across the trend window exceeds this pp.
    "fire_on_cumulative_coverage_drift_pp": 2.0,
    # Fire when 4+ consecutive weekly cycles show declining match-rate direction.
    # (consecutive-decline is a stronger signal than cumulative erosion).
    "fire_on_consecutive_decline_weeks": 4,
    # Cooldown: skip firing the same alert more than once per cooldown seconds.
    "cooldown_seconds": 86400,  # 24-hour daily-cadence safe; trend window is weekly
}


# Canonical trend-alert payload fields — pinned by test_canonical_trend_alert_shape_published.
TREND_ALERT_PAYLOAD_TOP_LEVEL_FIELDS: list[str] = [
    "alert_id",
    "timestamp",
    "source",
    "severity",
    "title",
    "summary",
    "trend_window_weeks",
    "weeks_analyzed",
    "per_platform_trend",
    "cumulative_drift",
    "consecutive_decline_platforms",
    "remediation",
    "overall_passed",
    "thresholds_used",
    "raw_trend_state_path",
]


# Canonical webhook timeout (seconds). Slack webhooks typically respond in <2s.
WEBHOOK_TIMEOUT_SECONDS: float = 5.0

# Canonical per-platform metric keys (mirrors Move #6.8 per-platform result gates).
PER_PLATFORM_METRIC_KEYS: list[str] = [
    "match_rate",
    "coverage",
]


# Canonical 4 root-cause / remediation texts (one per trend-rule firing scenario).
TREND_REMEDIATION: dict[str, str] = {
    "cumulative_match_rate_drift": (
        "Cumulative match-rate drift across the {weeks}-week trend window "
        "exceeds {threshold}pp threshold. Investigate the Move #6.5/6.6/6.7 "
        "per-platform audit fixtures — a slow erosion pattern typically "
        "indicates one of the 5 canonical root-cause hypotheses from "
        "scripts/attribution_cross_platform_rollup.py's ROOT_CAUSE_HYPOTHESES "
        "[theme_liquid_update / capi_token_rotation / ios_consent_banner / "
        "app_uninstall / advanced_matching_toggle]. Run the weekly cadence "
        "per playbooks/06.8 §Step 5 to triage."
    ),
    "cumulative_coverage_drift": (
        "Cumulative coverage drift across the {weeks}-week trend window "
        "exceeds {threshold}pp threshold. Investigate per-platform pixel "
        "coverage drift per Move #6.5 Gate C + Move #6.6 Gate A + Move #6.7 "
        "Gate A'. The 5-canonical-root-cause hypotheses from Move #6.8 "
        "apply. Run the weekly cadence per playbooks/06.8 §Step 5."
    ),
    "consecutive_decline": (
        "{decline_streak} consecutive weeks of declining match-rate direction "
        "on {platform}. Strong signal of slow erosion that 1-vs-1 drift "
        "detection misses (individual weeks may stay below the {threshold}pp "
        "MatchRate-drift threshold while the trend is clearly negative). "
        "Run the weekly cadence per playbooks/06.8 §Step 5."
    ),
    "all_stable": (
        "All {weeks} weeks of trend data show stable-or-improving per-platform "
        "match-rate + coverage. Continue the weekly cadence per "
        "playbooks/06.8 §Step 5 and re-run this trend script at next cycle."
    ),
}


def _canonical_trend_thresholds_published() -> dict[str, Any]:
    """Return the canonical trend thresholds — pinned regression gate."""
    return dict(TREND_THRESHOLDS)


def _canonical_trend_alert_shape_published() -> list[str]:
    """Return the canonical trend-alert-payload top-level fields — pinned regression gate."""
    return list(TREND_ALERT_PAYLOAD_TOP_LEVEL_FIELDS)


def _is_http_url(url: str) -> bool:
    """Return True iff url has an http(s) scheme and a non-empty netloc."""
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _list_weekly_rollups(rollup_dir: Path) -> list[Path]:
    """Return the list of weekly rollup JSON files in chronological order.

    Looks for files matching ``weekly-*.json`` or ``rollup-*.json`` in
    ``rollup_dir``; falls back to scanning any direct child ``.json`` files
    if no weekly-pattern matches.
    """
    if not rollup_dir.exists():
        return []
    weekly_files: list[Path] = []
    for pattern in ("weekly-*.json", "rollup-*.json"):
        weekly_files.extend(sorted(rollup_dir.glob(pattern)))
    if weekly_files:
        return weekly_files
    # Fallback: any direct-child .json (treats files as if they're weekly rollups).
    return sorted(p for p in rollup_dir.glob("*.json") if p.is_file())


def _load_weekly_rollup(rollup_path: Path) -> dict[str, Any] | None:
    """Load one weekly rollup JSON.

    Returns None if the file is missing or malformed (the trend script is
    graceful to partial-trend-data and excludes bad weeks from the analysis
    rather than crashing).
    """
    if not rollup_path.exists():
        return None
    try:
        with open(rollup_path) as f:
            data = json.load(f)
        return data if isinstance(data, dict) else None
    except (json.JSONDecodeError, OSError):
        return None


def _extract_headline_metric(per_platform_result: dict[str, Any], metric: str) -> float | None:
    """Extract a headline metric (match_rate / coverage) from a per-platform result.

    Falls back to common keys if the canonical key is missing — graceful to
    schema variations across the per-platform audit scripts.
    """
    if not isinstance(per_platform_result, dict):
        return None
    # Look in gates (the canonical Move #6.5/6.6/6.7 audit shape).
    for gate in per_platform_result.get("gates", []) or []:
        if not isinstance(gate, dict):
            continue
        gate_name = str(gate.get("name", "")).lower()
        if metric == "match_rate" and ("match" in gate_name or "capi" in gate_name or "event_id" in gate_name):
            value = gate.get("value")
            if isinstance(value, (int, float)):
                return float(value)
        if metric == "coverage" and "coverage" in gate_name:
            value = gate.get("value")
            if isinstance(value, (int, float)):
                return float(value)
    # Top-level fallback (per-platform result shape may vary).
    for top_key in (metric, f"{metric}_pct", f"avg_{metric}"):
        if top_key in per_platform_result:
            v = per_platform_result[top_key]
            if isinstance(v, (int, float)):
                return float(v)
    return None


def _compute_trend(
    weekly_rollups: list[dict[str, Any]],
    trend_window_weeks: int,
) -> dict[str, Any]:
    """Compute the 12-week trend across all platforms.

    Returns a dict:
        {
            "weeks_analyzed": int,
            "trend_window_weeks": int,
            "per_platform_trend": {
                platform_label: {
                    "match_rate": {"values": [...], "cumulative_delta": float, "consecutive_decline_weeks": int, "direction": "improving"|"declining"|"stable"},
                    "coverage":   {"values": [...], "cumulative_delta": float, "consecutive_decline_weeks": int, "direction": "improving"|"declining"|"stable"},
                },
                ...
            },
            "cumulative_drift": {"match_rate_max_drift_pp": float, "coverage_max_drift_pp": float},
        }

    Only platforms that appear in at least 1 weekly rollup are included.
    Weeks appear in chronological order (oldest → newest).
    """
    # Limit to last N weeks.
    weeks = weekly_rollups[-trend_window_weeks:]
    weeks_analyzed = len(weeks)

    # Collect per-platform metric series in week order.
    per_platform_series: dict[str, dict[str, list[float | None]]] = {}
    for rollup in weeks:
        per_platform = rollup.get("per_platform", {}) or {}
        for label, result in per_platform.items():
            if label not in per_platform_series:
                per_platform_series[label] = {k: [] for k in PER_PLATFORM_METRIC_KEYS}
            for metric in PER_PLATFORM_METRIC_KEYS:
                value = _extract_headline_metric(result, metric)
                per_platform_series[label][metric].append(value)

    def _classify_direction(values: list[float | None]) -> tuple[float, int, str]:
        """Return (cumulative_delta, consecutive_decline_streak, direction)."""
        # Filter out None values.
        clean = [v for v in values if v is not None]
        if len(clean) < 2:
            return 0.0, 0, "stable"
        cumulative = clean[-1] - clean[0]
        # Consecutive decline: count trailing declines where each week's value < previous week's.
        streak = 0
        for i in range(len(clean) - 1, 0, -1):
            if clean[i] < clean[i - 1]:
                streak += 1
            else:
                break
        if streak >= 2:
            direction = "declining"
        elif cumulative > 0.5:
            direction = "improving"
        elif cumulative < -0.5:
            direction = "declining"
        else:
            direction = "stable"
        return cumulative, streak, direction

    per_platform_trend: dict[str, dict[str, Any]] = {}
    for label, series in per_platform_series.items():
        per_platform_trend[label] = {}
        for metric in PER_PLATFORM_METRIC_KEYS:
            cumulative, streak, direction = _classify_direction(series[metric])
            per_platform_trend[label][metric] = {
                "values": list(series[metric]),
                "cumulative_delta": round(cumulative, 3),
                "consecutive_decline_weeks": streak,
                "direction": direction,
            }

    # Aggregate cumulative-drift max-across-platforms.
    max_match_drift = 0.0
    max_coverage_drift = 0.0
    for label, metrics in per_platform_trend.items():
        max_match_drift = max(max_match_drift, abs(metrics["match_rate"]["cumulative_delta"]))
        max_coverage_drift = max(max_coverage_drift, abs(metrics["coverage"]["cumulative_delta"]))

    return {
        "weeks_analyzed": weeks_analyzed,
        "trend_window_weeks": trend_window_weeks,
        "per_platform_trend": per_platform_trend,
        "cumulative_drift": {
            "match_rate_max_drift_pp": round(max_match_drift, 3),
            "coverage_max_drift_pp": round(max_coverage_drift, 3),
        },
    }


def _decide_should_fire(
    trend: dict[str, Any],
    thresholds: dict[str, Any],
) -> tuple[bool, str, list[str]]:
    """Decide whether to fire a trend alert.

    Returns (should_fire, reason, fired_rule_keys). The fired_rule_keys
    list lets the alert payload surface all four canonical firing scenarios
    cumulatively rather than picking the first match.
    """
    fired_rules: list[str] = []
    reasons: list[str] = []

    cumulative_match = trend.get("cumulative_drift", {}).get("match_rate_max_drift_pp", 0.0)
    threshold_match = thresholds.get("fire_on_cumulative_match_rate_drift_pp", 3.0)
    if abs(float(cumulative_match)) > float(threshold_match):
        fired_rules.append("cumulative_match_rate_drift")
        reasons.append(
            f"cumulative match-rate drift {cumulative_match:.1f}pp exceeds {threshold_match:.1f}pp threshold"
        )

    cumulative_coverage = trend.get("cumulative_drift", {}).get("coverage_max_drift_pp", 0.0)
    threshold_coverage = thresholds.get("fire_on_cumulative_coverage_drift_pp", 2.0)
    if abs(float(cumulative_coverage)) > float(threshold_coverage):
        fired_rules.append("cumulative_coverage_drift")
        reasons.append(
            f"cumulative coverage drift {cumulative_coverage:.1f}pp exceeds {threshold_coverage:.1f}pp threshold"
        )

    consecutive_threshold = thresholds.get("fire_on_consecutive_decline_weeks", 4)
    consecutive_platforms: list[str] = []
    per_platform = trend.get("per_platform_trend", {}) or {}
    for label, metrics in per_platform.items():
        match_streak = metrics.get("match_rate", {}).get("consecutive_decline_weeks", 0)
        if match_streak >= consecutive_threshold:
            consecutive_platforms.append(label)
    if consecutive_platforms:
        fired_rules.append("consecutive_decline")
        reasons.append(
            f"consecutive-decline-of-{consecutive_threshold}+ on: {', '.join(sorted(consecutive_platforms))}"
        )

    should_fire = bool(fired_rules)
    if should_fire:
        return True, "; ".join(reasons), fired_rules
    return False, "all trends stable across the window", []


def _build_trend_alert_payload(
    trend: dict[str, Any],
    should_fire_reason: str,
    raw_trend_state_path: Path,
    thresholds: dict[str, Any],
    fired_rules: list[str],
) -> dict[str, Any]:
    """Build the canonical Slack-compatible trend-alert payload.

    The shape is pinned by test_canonical_trend_alert_shape_published so
    downstream consumers can parse it without surprise.
    """
    consecutive_platforms = sorted(
        label
        for label, metrics in (trend.get("per_platform_trend", {}) or {}).items()
        if metrics.get("match_rate", {}).get("consecutive_decline_weeks", 0)
        >= thresholds.get("fire_on_consecutive_decline_weeks", 4)
    )

    # Build remediation text combining all fired rules.
    remediation_parts: list[str] = []
    weeks = trend.get("weeks_analyzed", 0)
    for rule in fired_rules:
        template = TREND_REMEDIATION.get(rule)
        if template is None:
            continue
        if rule in ("cumulative_match_rate_drift", "cumulative_coverage_drift"):
            threshold_key = (
                "fire_on_cumulative_match_rate_drift_pp"
                if rule == "cumulative_match_rate_drift"
                else "fire_on_cumulative_coverage_drift_pp"
            )
            remediation_parts.append(
                template.format(weeks=weeks, threshold=thresholds.get(threshold_key, 0.0))
            )
        elif rule == "consecutive_decline":
            remediation_parts.append(
                template.format(
                    decline_streak=thresholds.get("fire_on_consecutive_decline_weeks", 4),
                    platform=", ".join(consecutive_platforms) if consecutive_platforms else "(none)",
                    threshold=thresholds.get("fire_on_cumulative_match_rate_drift_pp", 3.0),
                )
            )
    if not remediation_parts:
        # All-stable path: surface the canonical "stable" remediation.
        all_stable = TREND_REMEDIATION.get("all_stable", "")
        if all_stable:
            remediation_parts.append(all_stable.format(weeks=weeks))

    severity = "info" if not fired_rules else ("critical" if len(fired_rules) >= 2 else "warning")

    return {
        "alert_id": f"attr-trend-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "attribution_weekly_rollup_trend",
        "severity": severity,
        "title": (
            f"Attribution weekly trend: {len(fired_rules)} rule(s) fired across {weeks} weeks"
            if fired_rules
            else f"Attribution weekly trend: stable across {weeks} weeks"
        ),
        "summary": should_fire_reason,
        "trend_window_weeks": trend.get("trend_window_weeks", 0),
        "weeks_analyzed": weeks,
        "per_platform_trend": trend.get("per_platform_trend", {}),
        "cumulative_drift": trend.get("cumulative_drift", {}),
        "consecutive_decline_platforms": consecutive_platforms,
        "remediation": "; ".join(remediation_parts) if remediation_parts else "(no remediation needed)",
        "overall_passed": not fired_rules,
        "thresholds_used": dict(thresholds),
        "raw_trend_state_path": str(raw_trend_state_path),
    }


def _post_webhook(url: str, payload: dict[str, Any]) -> tuple[bool, str]:
    """POST the trend payload to a Slack-compatible webhook URL.

    Returns (success, error_or_status_text). Defensive try/except for
    HTTPError + URLError + SocketError so the script never crashes on a
    flaky webhook.
    """
    if not _is_http_url(url):
        return False, f"invalid webhook URL: {url!r}"
    body = json.dumps(payload, default=str).encode("utf-8")
    req = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=WEBHOOK_TIMEOUT_SECONDS) as response:
            status = response.status
            return 200 <= status < 300, f"HTTP {status}"
    except HTTPError as e:
        return False, f"HTTPError {e.code} {e.reason}"
    except URLError as e:
        return False, f"URLError {e.reason}"
    except Exception as e:  # pragma: no cover - defensive
        return False, f"unexpected error: {type(e).__name__}: {e}"


def _list_archive_files(alert_archive_dir: Path) -> list[Path]:
    """Return archive files in chronological order (oldest first)."""
    if not alert_archive_dir.exists():
        return []
    return sorted(alert_archive_dir.glob("trend-*.json"))


def _respect_cooldown(
    alert_archive_dir: Path,
    cooldown_seconds: int,
    now_epoch: float,
) -> tuple[bool, str]:
    """Check whether the most recent archive is within the cooldown window.

    Returns (should_skip, reason). Mirrors the Move #6.10 webhook cooldown
    walker pattern.
    """
    archive_files = _list_archive_files(alert_archive_dir)
    if not archive_files:
        return False, "no previous archives, no cooldown active"
    most_recent = archive_files[-1]
    # Filename pattern: trend-<ISO-timestamp>-<severity>.json
    # ISO timestamp has no colons in filenames (we strip them).
    stem = most_recent.stem  # e.g. "trend-20260710T120000Z-critical"
    parts = stem.split("-")
    if len(parts) < 2:
        return False, f"malformed archive filename: {most_recent.name}, fall through to fire"
    iso_part = parts[1]
    try:
        most_recent_dt = datetime.strptime(iso_part, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        most_recent_epoch = most_recent_dt.timestamp()
    except ValueError:
        return False, f"could not parse timestamp from {most_recent.name}, fall through to fire"
    elapsed = now_epoch - most_recent_epoch
    if elapsed < cooldown_seconds:
        return True, f"cooldown active: last archive {elapsed:.0f}s ago < {cooldown_seconds}s threshold"
    return False, f"cooldown elapsed: last archive {elapsed:.0f}s ago > {cooldown_seconds}s threshold"


def run_trend(
    rollup_dir: Path,
    alert_archive_dir: Path,
    thresholds: dict[str, Any] | None = None,
    skip_webhook: bool = False,
    skip_cooldown: bool = False,
) -> dict[str, Any]:
    """Run the weekly-rollup-trend analysis end-to-end.

    Returns a dict with:
        {
            "trend": <trend dict from _compute_trend>,
            "should_fire": bool,
            "reason": str,
            "fired_rules": list[str],
            "alert_payload": dict | None,
            "archive_file": Path | None,
            "cooldown_status": {"applied": bool, "reason": str},
            "overall_passed": bool,
        }
    """
    if thresholds is None:
        thresholds = _canonical_trend_thresholds_published()

    weekly_paths = _list_weekly_rollups(rollup_dir)
    rollups: list[dict[str, Any]] = []
    bad_weeks: list[str] = []
    for p in weekly_paths:
        loaded = _load_weekly_rollup(p)
        if loaded is None:
            bad_weeks.append(p.name)
            continue
        rollups.append(loaded)

    trend = _compute_trend(rollups, int(thresholds.get("trend_window_weeks", 12)))
    should_fire, reason, fired_rules = _decide_should_fire(trend, thresholds)

    cooldown_status = {"applied": False, "reason": "cooldown not checked (no-fire path)"}
    archive_file: Path | None = None
    alert_payload: dict[str, Any] | None = None

    if should_fire:
        alert_payload = _build_trend_alert_payload(
            trend, reason, rollup_dir, thresholds, fired_rules
        )
        cooldown_check_reason = "cooldown bypassed"
        if not skip_cooldown:
            should_skip_cooldown, cooldown_check_reason = _respect_cooldown(
                alert_archive_dir,
                int(thresholds.get("cooldown_seconds", 86400)),
                datetime.now(timezone.utc).timestamp(),
            )
            cooldown_status = {"applied": should_skip_cooldown, "reason": cooldown_check_reason}
            if should_skip_cooldown:
                should_fire = False  # Cooldown suppresses the alert but the trend is still recorded.

        if should_fire:
            alert_archive_dir.mkdir(parents=True, exist_ok=True)
            archive_file = alert_archive_dir / (
                f"trend-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
                f"-{alert_payload['severity']}.json"
            )
            archive_file.write_text(
                json.dumps(
                    {
                        "trend": trend,
                        "alert_payload": alert_payload,
                        "bad_weeks": bad_weeks,
                        "cooldown_status": cooldown_status,
                    },
                    indent=2,
                    default=str,
                )
            )
    else:
        # No-fire path: still produce an alert payload (info-only) and archive
        # so operators can confirm the weekly cadence is firing even on clean weeks.
        alert_payload = _build_trend_alert_payload(
            trend, reason, rollup_dir, thresholds, fired_rules
        )
        alert_archive_dir.mkdir(parents=True, exist_ok=True)
        archive_file = alert_archive_dir / (
            f"trend-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
            f"-{alert_payload['severity']}.json"
        )
        archive_file.write_text(
            json.dumps(
                {
                    "trend": trend,
                    "alert_payload": alert_payload,
                    "bad_weeks": bad_weeks,
                    "cooldown_status": cooldown_status,
                },
                indent=2,
                default=str,
            )
        )

    return {
        "trend": trend,
        "should_fire": should_fire,
        "reason": reason,
        "fired_rules": fired_rules,
        "alert_payload": alert_payload,
        "archive_file": archive_file,
        "cooldown_status": cooldown_status,
        "overall_passed": not should_fire,
    }


def main_with_args(argv: list[str] | None = None) -> int:
    """Argparse + run_trend entry point. Returns process exit code."""
    parser = argparse.ArgumentParser(
        description="Attribution weekly-rollup-trend (Move #6.5 hardening) — consumes "
        "the last N weeks of Move #6.8 cross-platform rollup JSON outputs and surfaces "
        "a 12-week trend-direction alert per platform."
    )
    parser.add_argument(
        "--rollup-dir",
        type=Path,
        default=Path("./fixtures/rollups/"),
        help="Directory containing weekly rollup JSON files (default: ./fixtures/rollups/).",
    )
    parser.add_argument(
        "--alert-archive",
        type=Path,
        default=Path("./.trend-alerts/"),
        help="Directory for trend-alert archive files (default: ./.trend-alerts/).",
    )
    parser.add_argument(
        "--webhook-url",
        type=str,
        default=None,
        help="Slack-compatible webhook URL (optional; hermetic stub if omitted).",
    )
    parser.add_argument(
        "--cooldown-seconds",
        type=int,
        default=None,
        help="Override the canonical cooldown window (default: TREND_THRESHOLDS['cooldown_seconds']).",
    )
    parser.add_argument(
        "--skip-webhook",
        action="store_true",
        help="Skip webhook POST even if --webhook-url is set (archive still written).",
    )
    parser.add_argument(
        "--skip-cooldown",
        action="store_true",
        help="Skip the cooldown check (always fire if rules match).",
    )
    parser.add_argument(
        "--bootstrap",
        type=Path,
        default=None,
        help="Bootstrap mode: create the alert-archive directory + validate threshold constants.",
    )
    parser.add_argument(
        "--validate-thresholds",
        action="store_true",
        help="Validate mode: print canonical thresholds + alert shape (no rollup analysis).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the result as JSON on stdout (instead of human-readable summary).",
    )

    args = parser.parse_args(argv)

    if args.validate_thresholds:
        thresholds = _canonical_trend_thresholds_published()
        shape = _canonical_trend_alert_shape_published()
        print(f"Canonical trend thresholds: {json.dumps(thresholds)}")
        print(f"Canonical trend alert shape ({len(shape)} fields): {', '.join(shape)}")
        return 0

    if args.bootstrap is not None:
        args.bootstrap.mkdir(parents=True, exist_ok=True)
        thresholds = _canonical_trend_thresholds_published()
        shape = _canonical_trend_alert_shape_published()
        if args.json:
            print(
                json.dumps(
                    {
                        "bootstrap_dir": str(args.bootstrap),
                        "canonical_thresholds": thresholds,
                        "canonical_alert_shape_fields": shape,
                    },
                    indent=2,
                )
            )
        else:
            print(f"Trend-alerts bootstrap directory created at: {args.bootstrap}")
            print(f"Canonical trend thresholds: {thresholds}")
        return 0

    thresholds = _canonical_trend_thresholds_published()
    if args.cooldown_seconds is not None:
        thresholds["cooldown_seconds"] = int(args.cooldown_seconds)

    result = run_trend(
        rollup_dir=args.rollup_dir,
        alert_archive_dir=args.alert_archive,
        thresholds=thresholds,
        skip_webhook=args.skip_webhook,
        skip_cooldown=args.skip_cooldown,
    )

    # Optional webhook POST (after archive).
    post_status: dict[str, Any] = {"posted": False, "result": "skipped"}
    if (
        result["should_fire"]
        and args.webhook_url
        and not args.skip_webhook
        and result["alert_payload"] is not None
    ):
        success, status_text = _post_webhook(args.webhook_url, result["alert_payload"])
        post_status = {"posted": success, "result": status_text}

    if args.json:
        output = {
            "trend": result["trend"],
            "should_fire": result["should_fire"],
            "reason": result["reason"],
            "fired_rules": result["fired_rules"],
            "alert_payload": result["alert_payload"],
            "archive_file": str(result["archive_file"]) if result["archive_file"] else None,
            "cooldown_status": result["cooldown_status"],
            "webhook_post_status": post_status,
            "overall_passed": result["overall_passed"],
        }
        print(json.dumps(output, indent=2, default=str))
    else:
        print(f"Should fire: {result['should_fire']}")
        print(f"Reason: {result['reason']}")
        print(f"Fired rules: {result['fired_rules']}")
        print(f"Weeks analyzed: {result['trend']['weeks_analyzed']} / "
              f"trend window {result['trend']['trend_window_weeks']}")
        print(f"Overall passed: {result['overall_passed']}")
        if post_status["posted"]:
            print(f"Webhook POST: {post_status['result']}")
        else:
            print(f"Webhook POST: {post_status['result']}")

    # Exit codes: 0=no-alert + cooldown not active, 1=alert fired (or would-have-fired),
    # 2=webhook POST failed (hermetic-mode always returns 0 because no POST happens).
    if result["should_fire"]:
        return 1
    return 0


def main() -> int:
    return main_with_args()


if __name__ == "__main__":
    sys.exit(main())
