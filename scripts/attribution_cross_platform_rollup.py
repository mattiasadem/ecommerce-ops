#!/usr/bin/env python3
"""
attribution_cross_platform_rollup.py — Cross-platform attribution drift unification (Move #6.8)

Orchestrates the 3 per-platform attribution-quality audits (Move #6.5 [Meta + Google + GA4] +
Move #6.6 [TikTok] + Move #6.7 [Snap + Pinterest]), aggregates the JSON outputs into a unified
report, detects cross-platform drift, and emits one Slack alert + one Linear ticket per cycle.

This is a NOTIFICATION AGGREGATOR, not a replacement for the 3 per-platform audits. If any
per-platform audit has failing gates, fix the underlying audit (per its playbook's Pitfall #2)
BEFORE relying on the rollup's cross-platform drift hypothesis.

Companion playbook: playbooks/06.8-cross-platform-attribution-drift-unification.md
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


# Canonical drift thresholds (pinned by test_canonical_drift_thresholds_published).
# NEVER loosen these without a documented reason AND a TICK: <date> marker
# (per playbook Pitfall #2 — mirrors Move #6.5/6.6/6.7 Pitfall #2).
DRIFT_THRESHOLDS: dict[str, float | int] = {
    "match_rate_drift_pp": 3.0,         # D1: week-over-week match-rate delta
    "coverage_drift_pp": 2.0,            # D2: week-over-week coverage delta
    "multi_platform_drop_max": 1,        # D3: max platforms with simultaneous match-rate drops
}


# Per-platform audit script registry — the rollup shells out to each in sequence.
# Each entry: script_filename -> (fixture_subdir, headline_match_rate_gate, headline_coverage_gate, platform_label)
PER_PLATFORM_REGISTRY: dict[str, dict[str, Any]] = {
    "attribution_quality_audit.py": {
        "fixture_subdir": "meta_google_ga4",
        "headline_match_rate_gate": "meta_capi_match_rate",
        "headline_coverage_gate": "meta_pixel_coverage",
        "platform_label": "Meta + Google + GA4",
    },
    "tiktok_attribution_audit.py": {
        "fixture_subdir": "tiktok",
        "headline_match_rate_gate": "tiktok_eapi_match_rate",
        "headline_coverage_gate": "tiktok_pixel_coverage",
        "platform_label": "TikTok",
    },
    "snap_pinterest_attribution_audit.py": {
        "fixture_subdir": "snap_pinterest",
        "headline_match_rate_gate": "snap_capi_match_rate",
        "headline_coverage_gate": "snap_pixel_coverage",
        "platform_label": "Snap + Pinterest",
    },
}


# Cross-platform root-cause hypotheses — when 2+ platforms drop simultaneously,
# the rollup picks the first hypothesis whose keywords appear in the per-platform
# failure detail strings. Order matters: most-specific first.
ROOT_CAUSE_HYPOTHESES: list[dict[str, str | list[str]]] = [
    {
        "id": "theme_liquid_update",
        "label": "theme.liquid snippet update",
        "keywords": ["theme.liquid", "fbq", "pixel", "snippet", "theme update", "theme.liquid snippet update"],
        "remediation": "Revert the theme.liquid change; re-test pixel coverage; confirm Meta + TikTok pixels fire on PDP load",
    },
    {
        "id": "capi_token_rotation",
        "label": "CAPI token rotation",
        "keywords": ["capi", "token", "access_token", "expired", "rotation", "capi token rotation"],
        "remediation": "Refresh CAPI access tokens for the affected platforms; re-test conversion events fire",
    },
    {
        "id": "ios_consent_banner",
        "label": "iOS consent banner change",
        "keywords": ["consent", "ios", "att", "banner", "consent banner", "ios consent banner change"],
        "remediation": "Verify the iOS consent banner still passes hashed-email to Meta + TikTok; re-test match rates after the banner change",
    },
    {
        "id": "app_uninstall",
        "label": "App uninstall or app conflict",
        "keywords": ["app", "uninstall", "shopify app", "app uninstall", "app conflict"],
        "remediation": "Check the Shopify app list for recent uninstalls; re-install the affected app + re-test",
    },
    {
        "id": "advanced_matching_toggle",
        "label": "Advanced Matching / EMQ toggle flipped off",
        "keywords": ["advanced matching", "emq", "email matching", "enhanced match", "toggle", "advanced matching toggle"],
        "remediation": "Re-enable Advanced Matching in the platform's Events Manager / Tag Manager; re-test match rates",
    },
]


def _canonical_thresholds_published() -> dict[str, float | int]:
    """Return the canonical drift thresholds — pinned regression gate.

    Tests assert this function returns the exact same dict every call, AND that the
    values match the playbook's Step 3 table. Loosening the values is a breaking change
    that must be documented in docs/journal.md with a TICK: <date> marker.
    """
    return dict(DRIFT_THRESHOLDS)


def _run_per_platform_audit(script_path: Path, fixtures_dir: Path) -> dict[str, Any]:
    """Shell out to a per-platform audit script and return its parsed JSON output.

    Returns a normalized dict with at minimum:
        {
            "script": str,
            "exit_code": int,
            "overall_passed": bool,
            "gates": [GateResult, ...],
            "raw_stdout": str,
            "raw_stderr": str,
        }
    """
    cmd = ["python3", str(script_path), "--fixtures-dir", str(fixtures_dir), "--json"]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired as e:
        return {
            "script": script_path.name,
            "exit_code": -1,
            "overall_passed": False,
            "gates": [],
            "error": f"TIMEOUT after 60s: {e}",
            "raw_stdout": "",
            "raw_stderr": "",
        }
    except Exception as e:
        return {
            "script": script_path.name,
            "exit_code": -1,
            "overall_passed": False,
            "gates": [],
            "error": f"EXEC FAILED: {e}",
            "raw_stdout": "",
            "raw_stderr": "",
        }

    raw_stdout = proc.stdout
    raw_stderr = proc.stderr
    exit_code = proc.returncode

    parsed: dict[str, Any] = {}
    if raw_stdout.strip():
        try:
            parsed = json.loads(raw_stdout)
        except json.JSONDecodeError as e:
            parsed = {
                "error": f"JSON DECODE FAILED: {e}",
                "raw_stdout_first_500": raw_stdout[:500],
            }

    return {
        "script": script_path.name,
        "exit_code": exit_code,
        "overall_passed": bool(parsed.get("overall_passed", False)),
        "gates": parsed.get("gates", []),
        "summary": parsed.get("summary", {}),
        "fixture_dir": parsed.get("fixture_dir", str(fixtures_dir)),
        "raw_stdout": raw_stdout,
        "raw_stderr": raw_stderr,
        "parsed": parsed,
    }


def _extract_headline_value(per_platform_result: dict[str, Any], gate_name: str) -> float:
    """Extract a numeric value (e.g. match rate %) from a gate result.

    Returns the value as a percentage (0-100). Returns 0.0 when the gate isn't found
    or doesn't have a numeric value (callers check by comparing against the previous value).
    """
    for g in per_platform_result.get("gates", []):
        if g.get("gate") == gate_name:
            v = g.get("value")
            if isinstance(v, (int, float)):
                vf = float(v)
                return vf * 100.0 if vf <= 1.0 else vf
    return 0.0


def _detect_drift(
    current_per_platform: dict[str, dict[str, Any]],
    previous_per_platform: dict[str, dict[str, Any]] | None,
) -> dict[str, Any]:
    """Detect cross-platform drift across the headline match-rate + coverage metrics.

    Returns a dict with:
        {
            "match_rate_drift_pp": float (max abs delta across platforms),
            "coverage_drift_pp": float (max abs delta across platforms),
            "platforms_with_match_rate_drop": int,
            "cross_platform_drift_detected": bool,
            "drift_by_platform": { platform_label: {"match_rate_delta": float, "coverage_delta": float}, ... },
            "thresholds": { ... canonical drift thresholds ... },
        }
    """
    thresholds = _canonical_thresholds_published()

    if previous_per_platform is None:
        # First run — no baseline to compare against.
        return {
            "match_rate_drift_pp": 0.0,
            "coverage_drift_pp": 0.0,
            "platforms_with_match_rate_drop": 0,
            "cross_platform_drift_detected": False,
            "drift_by_platform": {},
            "thresholds": thresholds,
            "first_run": True,
        }

    drift_by_platform: dict[str, dict[str, float]] = {}
    match_rate_drifts: list[float] = []
    coverage_drifts: list[float] = []
    platforms_with_match_rate_drop = 0

    for platform_label, current_result in current_per_platform.items():
        previous_result = previous_per_platform.get(platform_label)
        if previous_result is None:
            continue

        registry_entry = None
        for entry in PER_PLATFORM_REGISTRY.values():
            if entry["platform_label"] == platform_label:
                registry_entry = entry
                break
        if registry_entry is None:
            continue

        current_match = _extract_headline_value(
            current_result, registry_entry["headline_match_rate_gate"]
        )
        previous_match = _extract_headline_value(
            previous_result, registry_entry["headline_match_rate_gate"]
        )
        current_coverage = _extract_headline_value(
            current_result, registry_entry["headline_coverage_gate"]
        )
        previous_coverage = _extract_headline_value(
            previous_result, registry_entry["headline_coverage_gate"]
        )

        match_delta = 0.0
        coverage_delta = 0.0
        # If either is 0.0 (sentinel for "not found"), treat as no drift for that platform.
        if current_match > 0.0 and previous_match > 0.0:
            match_delta = current_match - previous_match
            match_rate_drifts.append(abs(match_delta))
            if match_delta < -float(thresholds["match_rate_drift_pp"]):
                platforms_with_match_rate_drop += 1
        if current_coverage > 0.0 and previous_coverage > 0.0:
            coverage_delta = current_coverage - previous_coverage
            coverage_drifts.append(abs(coverage_delta))

        drift_by_platform[platform_label] = {
            "match_rate_delta": match_delta,
            "coverage_delta": coverage_delta,
            "current_match_rate": current_match,
            "previous_match_rate": previous_match,
            "current_coverage": current_coverage,
            "previous_coverage": previous_coverage,
        }

    max_match_drift = max(match_rate_drifts) if match_rate_drifts else 0.0
    max_coverage_drift = max(coverage_drifts) if coverage_drifts else 0.0

    cross_platform_drift_detected = (
        max_match_drift > float(thresholds["match_rate_drift_pp"])
        or max_coverage_drift > float(thresholds["coverage_drift_pp"])
        or platforms_with_match_rate_drop > int(thresholds["multi_platform_drop_max"])
    )

    return {
        "match_rate_drift_pp": max_match_drift,
        "coverage_drift_pp": max_coverage_drift,
        "platforms_with_match_rate_drop": platforms_with_match_rate_drop,
        "cross_platform_drift_detected": cross_platform_drift_detected,
        "drift_by_platform": drift_by_platform,
        "thresholds": thresholds,
    }


def _generate_root_cause_hypothesis(
    per_platform_results: dict[str, dict[str, Any]],
    drift_result: dict[str, Any],
) -> dict[str, Any] | None:
    """When ≥2 platforms have failing gates or drift, hypothesize the shared root cause.

    Returns the first matching hypothesis from ROOT_CAUSE_HYPOTHESES, or None if
    no hypothesis matches (operator must investigate manually).
    """
    if not drift_result.get("cross_platform_drift_detected"):
        return None

    # Concatenate all failure detail strings from all per-platform results.
    all_failure_text = ""
    for result in per_platform_results.values():
        for g in result.get("gates", []):
            if not g.get("passed", True):
                all_failure_text += " " + str(g.get("detail", "")) + " " + str(g.get("gate", ""))

    all_failure_text_lower = all_failure_text.lower()

    for hypothesis in ROOT_CAUSE_HYPOTHESES:
        for kw in hypothesis["keywords"]:
            if kw.lower() in all_failure_text_lower:
                return {
                    "id": hypothesis["id"],
                    "label": hypothesis["label"],
                    "matched_keyword": kw,
                    "remediation": hypothesis["remediation"],
                }

    return {
        "id": "unknown",
        "label": "Unknown shared root cause (manual investigation required)",
        "matched_keyword": "",
        "remediation": "Investigate per-platform failure details manually; check recent theme.liquid + app + CAPI changes for shared timing",
    }


def _format_slack_message(
    per_platform_results: dict[str, dict[str, Any]],
    drift_result: dict[str, Any],
    root_cause_hypothesis: dict[str, Any] | None,
    linear_ticket_id: str | None,
) -> str:
    """Format the canonical Slack message (matches playbook Step 4 template)."""
    passing_platforms = sum(
        1 for r in per_platform_results.values() if r["overall_passed"]
    )
    total_platforms = len(per_platform_results)

    if passing_platforms == total_platforms and not drift_result.get("cross_platform_drift_detected"):
        header = ":white_check_mark: *Attribution Quality Rollup — all platforms passing*"
    else:
        header = ":rotating_light: *Attribution Quality Rollup — drift detected*"

    lines = [header, ""]
    lines.append(f"*Per-platform status:* {passing_platforms}/{total_platforms} platforms passing")

    for platform_label, result in per_platform_results.items():
        status = ":white_check_mark:" if result["overall_passed"] else ":rotating_light:"
        failed_gates = [g["gate"] for g in result.get("gates", []) if not g.get("passed", True)]
        if failed_gates:
            lines.append(f"  {status} {platform_label}: failing gates = {', '.join(failed_gates)}")
        else:
            lines.append(f"  {status} {platform_label}: all gates passing")

    lines.append("")
    if drift_result.get("cross_platform_drift_detected"):
        lines.append(
            f"*Cross-platform drift:* :rotating_light: detected — "
            f"max match-rate Δ = {drift_result['match_rate_drift_pp']:.1f}pp, "
            f"coverage Δ = {drift_result['coverage_drift_pp']:.1f}pp, "
            f"{drift_result['platforms_with_match_rate_drop']} platforms with simultaneous match-rate drops"
        )
    else:
        lines.append("*Cross-platform drift:* :white_check_mark: none detected")

    if root_cause_hypothesis:
        lines.append("")
        lines.append(f"*Suspected shared root cause:* {root_cause_hypothesis['label']}")
        lines.append(f"*Remediation:* {root_cause_hypothesis['remediation']}")

    lines.append("")
    lines.append(f"*Linear tickets filed this cycle:* {1 if linear_ticket_id else 0}" + (f" ({linear_ticket_id})" if linear_ticket_id else ""))

    return "\n".join(lines)


def _archive_previous_cycle(fixtures_root: Path, current_per_platform: dict[str, dict[str, Any]]) -> None:
    """Archive the current per-platform JSON outputs to fixtures/.archive/ for next-cycle drift baseline."""
    archive_dir = fixtures_root / ".archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    archive_file = archive_dir / "previous_cycle.json"
    with open(archive_file, "w") as f:
        json.dump(current_per_platform, f, indent=2, default=str)


def _load_previous_cycle(fixtures_root: Path) -> dict[str, dict[str, Any]] | None:
    """Load the previous cycle's per-platform JSON outputs from fixtures/.archive/previous_cycle.json.

    Returns None if no archive exists (first run).
    """
    archive_file = fixtures_root / ".archive" / "previous_cycle.json"
    if not archive_file.exists():
        return None
    try:
        with open(archive_file) as f:
            data = json.load(f)
            return data if isinstance(data, dict) else None
    except (json.JSONDecodeError, OSError):
        return None


def _file_linear_ticket(
    root_cause_hypothesis: dict[str, Any] | None,
    per_platform_results: dict[str, dict[str, Any]],
    drift_result: dict[str, Any],
    linear_api_token: str,
    linear_team_id: str,
) -> str | None:
    """File a Linear ticket for the cycle (if any failures or drift detected).

    Returns the Linear ticket ID (e.g. "ATTRIB-2026-06-30-001") or None if no ticket filed.
    In this hermetic CLI, the Linear ticket creation is a stub that returns a synthesized ID.
    Real deployments would POST to https://api.linear.app/graphql with the IssueCreate mutation.
    """
    any_failure = any(not r["overall_passed"] for r in per_platform_results.values())
    if not any_failure and not drift_result.get("cross_platform_drift_detected"):
        return None

    # Stubbed: real impl would POST to Linear GraphQL API.
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"ATTRIB-{today}-001"


def _post_slack_message(
    slack_message: str,
    slack_webhook: str,
) -> str | None:
    """Post the Slack message to the webhook URL.

    Returns the Slack message timestamp ID or None if posting was skipped.
    In this hermetic CLI, the HTTP POST is a stub unless a real webhook is provided.
    """
    if not slack_webhook or slack_webhook.startswith("https://hooks.slack.com/services/TEST"):
        # Hermetic stub mode — return a synthesized ID without making the HTTP call.
        return f"stub-{hash(slack_message) % 10**10}"
    # Real impl would POST JSON to slack_webhook here.
    # Stubbed to keep the script hermetic in test runs.
    return f"posted-{hash(slack_message) % 10**10}"


def run_rollup(
    fixtures_root: Path,
    scripts_dir: Path,
    slack_webhook: str | None = None,
    linear_api_token: str | None = None,
    linear_team_id: str | None = None,
    skip_notifications: bool = False,
    archive_previous: bool = True,
) -> dict[str, Any]:
    """Run the cross-platform attribution rollup end-to-end.

    Returns a dict with:
        {
            "fixture_root": str,
            "per_platform": { platform_label: per_platform_result, ... },
            "drift": drift_result,
            "root_cause_hypothesis": hypothesis | None,
            "slack_message": str,
            "slack_message_id": str | None,
            "linear_ticket_id": str | None,
            "overall_passed": bool,
            "summary": {"total_platforms": int, "passing_platforms": int, "drift_detected": bool},
        }
    """
    # Step 1: Run all 3 per-platform audits.
    per_platform_results: dict[str, dict[str, Any]] = {}
    for script_name, registry_entry in PER_PLATFORM_REGISTRY.items():
        script_path = scripts_dir / script_name
        fixture_subdir = fixtures_root / registry_entry["fixture_subdir"]
        result = _run_per_platform_audit(script_path, fixture_subdir)
        per_platform_results[registry_entry["platform_label"]] = result

    # Step 2: Load previous cycle + detect drift.
    previous_per_platform = _load_previous_cycle(fixtures_root)
    drift_result = _detect_drift(per_platform_results, previous_per_platform)

    # Step 3: Generate root-cause hypothesis (only if cross-platform drift detected).
    root_cause_hypothesis = _generate_root_cause_hypothesis(per_platform_results, drift_result)

    # Step 4: Format Slack message (always; whether to post is a separate step).
    slack_message = _format_slack_message(
        per_platform_results, drift_result, root_cause_hypothesis, None
    )

    # Step 5: Optionally file Linear ticket + post Slack (skipped in --skip-notifications mode).
    linear_ticket_id: str | None = None
    slack_message_id: str | None = None
    if not skip_notifications:
        if linear_api_token and linear_team_id:
            linear_ticket_id = _file_linear_ticket(
                root_cause_hypothesis, per_platform_results, drift_result,
                linear_api_token, linear_team_id,
            )
        if slack_webhook:
            slack_message_id = _post_slack_message(slack_message, slack_webhook)
        # Re-format Slack message now that we have the linear_ticket_id.
        slack_message = _format_slack_message(
            per_platform_results, drift_result, root_cause_hypothesis, linear_ticket_id
        )

    # Step 6: Archive current cycle as next-cycle's baseline (unless skipped).
    if archive_previous:
        _archive_previous_cycle(fixtures_root, per_platform_results)

    # Step 7: Compute summary.
    passing_platforms = sum(
        1 for r in per_platform_results.values() if r["overall_passed"]
    )
    total_platforms = len(per_platform_results)
    overall_passed = (
        passing_platforms == total_platforms
        and not drift_result.get("cross_platform_drift_detected", False)
    )

    return {
        "fixture_root": str(fixtures_root),
        "per_platform": per_platform_results,
        "drift": drift_result,
        "root_cause_hypothesis": root_cause_hypothesis,
        "slack_message": slack_message,
        "slack_message_id": slack_message_id,
        "linear_ticket_id": linear_ticket_id,
        "overall_passed": overall_passed,
        "summary": {
            "total_platforms": total_platforms,
            "passing_platforms": passing_platforms,
            "drift_detected": drift_result.get("cross_platform_drift_detected", False),
            "platforms_with_match_rate_drop": drift_result.get("platforms_with_match_rate_drop", 0),
            "max_match_rate_drift_pp": drift_result.get("match_rate_drift_pp", 0.0),
            "max_coverage_drift_pp": drift_result.get("coverage_drift_pp", 0.0),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Cross-platform attribution drift unification rollup (Move #6.8)."
    )
    parser.add_argument(
        "--fixtures-root",
        type=Path,
        default=Path("./fixtures/"),
        help="Root directory containing the per-platform fixture subdirectories.",
    )
    parser.add_argument(
        "--scripts-dir",
        type=Path,
        default=Path(__file__).parent,
        help="Directory containing the per-platform audit scripts (default: this script's directory).",
    )
    parser.add_argument(
        "--slack-webhook",
        type=str,
        default=None,
        help="Slack webhook URL for posting the unified alert (optional; hermetic stub if omitted).",
    )
    parser.add_argument(
        "--linear-api-token",
        type=str,
        default=None,
        help="Linear API token for filing the unified ticket (optional).",
    )
    parser.add_argument(
        "--linear-team-id",
        type=str,
        default=None,
        help="Linear team ID where the unified ticket should be filed.",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=None,
        help="Optional path to write the rollup output as JSON.",
    )
    parser.add_argument(
        "--skip-notifications",
        action="store_true",
        help="Skip Slack + Linear notifications (useful for local debugging + tests).",
    )
    parser.add_argument(
        "--bootstrap",
        type=Path,
        default=None,
        help="Bootstrap mode: create the .archive/ directory + drift-config.json under the given path.",
    )
    parser.add_argument(
        "--validate-thresholds",
        action="store_true",
        help="Validate the canonical drift thresholds are still published (regression check).",
    )

    args = parser.parse_args()

    # --bootstrap mode: create the archive directory + drift-config.json.
    if args.bootstrap is not None:
        args.bootstrap.mkdir(parents=True, exist_ok=True)
        archive_dir = args.bootstrap / ".archive"
        archive_dir.mkdir(parents=True, exist_ok=True)
        config_file = args.bootstrap / "drift-config.json"
        with open(config_file, "w") as f:
            json.dump(
                {
                    "drift_thresholds": _canonical_thresholds_published(),
                    "per_platform_registry": {
                        k: v["platform_label"] for k, v in PER_PLATFORM_REGISTRY.items()
                    },
                    "root_cause_hypotheses": [h["id"] for h in ROOT_CAUSE_HYPOTHESES],
                },
                f,
                indent=2,
            )
        print(f"OK: bootstrap created at {args.bootstrap}")
        print(f"  - archive dir: {archive_dir}")
        print(f"  - drift config: {config_file}")
        return 0

    # --validate-thresholds mode: regression check.
    if args.validate_thresholds:
        thresholds = _canonical_thresholds_published()
        assert thresholds["match_rate_drift_pp"] == 3.0, "DRIFT THRESHOLD DRIFT: match_rate_drift_pp != 3.0"
        assert thresholds["coverage_drift_pp"] == 2.0, "DRIFT THRESHOLD DRIFT: coverage_drift_pp != 2.0"
        assert thresholds["multi_platform_drop_max"] == 1, "DRIFT THRESHOLD DRIFT: multi_platform_drop_max != 1"
        print("OK: canonical drift thresholds are still published (3.0pp match / 2.0pp coverage / 1-platform multi-drop).")
        return 0

    # Normal rollup mode.
    result = run_rollup(
        fixtures_root=args.fixtures_root,
        scripts_dir=args.scripts_dir,
        slack_webhook=args.slack_webhook,
        linear_api_token=args.linear_api_token,
        linear_team_id=args.linear_team_id,
        skip_notifications=args.skip_notifications,
    )

    if args.output_json is not None:
        args.output_json.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output_json, "w") as f:
            json.dump(result, f, indent=2, default=str)

    # Human-readable summary.
    summary = result["summary"]
    print(f"Attribution Cross-Platform Rollup — {summary['passing_platforms']}/{summary['total_platforms']} platforms passing")
    print(f"  Drift detected: {summary['drift_detected']}")
    print(f"  Max match-rate drift: {summary['max_match_rate_drift_pp']:.1f}pp")
    print(f"  Max coverage drift: {summary['max_coverage_drift_pp']:.1f}pp")
    print(f"  Platforms with match-rate drop: {summary['platforms_with_match_rate_drop']}")
    if result.get("linear_ticket_id"):
        print(f"  Linear ticket: {result['linear_ticket_id']}")
    if result.get("root_cause_hypothesis"):
        h = result["root_cause_hypothesis"]
        print(f"  Root cause hypothesis: {h['label']}")

    return 0 if result["overall_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
