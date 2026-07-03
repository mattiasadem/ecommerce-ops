#!/usr/bin/env python3
"""
attribution_health_alert_unit_economics.py — Path A / B / C scorer for the
Move #6.10 attribution-health alert webhook track (companion to
scripts/attribution_health_alert_webhook.py).

Companion to:
- scripts/attribution_health_alert_webhook.py (1st-layer Move #6.10 hardening
  substrate — the 5-decision-rule engine that fires the alert; this script
  computes WHICH alert-cadence to recommend based on the operator's spend
  tier + team size + operator-capacity inputs)
- playbooks/06.10-attribution-health-alert-webhook-launch.md (2nd-layer
  operator-build runbook — Step 4 cron-wire + Step 6 investigate-failures +
  Step 7 on-call-rotation; this script is the operator-build INPUT for
  §Prerequisites + §Step 4 cron-wire — the operator runs this BEFORE wiring
  the cron to confirm the Path A/B/C cadence + cost stack match their scale)
- assets/24-attribution-health-alert-payload-template.md (3rd-layer
  operator-copy companion — per-voice per-hypothesis alert templates;
  this script surfaces the 5-path alert-cadence decision matrix as
  programmatically-derived inputs the operator copies into the runbook)
- dashboard/app/attribution-health-alert-archive/page.tsx (4th-layer
  Next.js operator-surface — renders this script's Path A/B/C
  recommendation + cost stack as the operator-visible hero metrics)

This script takes a brand's current Move #6.10 attribution-health-alert
fit inputs (11 fields: team_size + paid_spend + webhook_url_config +
alert_archive_storage_gb_per_year + cooldown_seconds +
slack_channel_on_call_rotation_coverage_hours_per_day +
move_6_8_cadence + has_linear_fallback + has_pagerduty_fallback +
has_opsgenie_fallback + voice_profile) and outputs a Path A
(weekly-archive-only $0-$500k GMV solo-operator hermetic-local-archive-only)
/ Path B DEFAULT ($500k-$5M DTC daily-or-weekly Slack-webhook +
Linear-fallback 60:1 to 150:1 net annual ROI $8/mo) / Path C
($5M-$25M enterprise every-4-hours Slack + Linear + PagerDuty-low-urgency
$35/mo) / Path D ($25M+ enterprise hourly PagerDuty + Opsgenie $333/mo) /
Path E (pre-revenue pre-launch DEFER) recommendation with cost stack +
Year-1 incremental attribution-regression-detection value + alert-cadence
rationale + canonical 5-webhook-thresholds + 13-field alert-payload shape
pin + 6-step build sequence.

The scoring rule (mirrors playbook/06.10 §Which alert-cadence fits your team
+ §Cost & ROI estimate + canonical 5-path alert-cadence decision matrix per
playbook/06.10 §Step 4 cron-wire):
  - paid_spend < $500/mo                                 → Path E (pre-launch defer; no attribution-alert needed yet)
  - paid_spend $500-$5k + team_size = solo               → Path A (weekly-archive-only, hermetic-local-archive)
  - paid_spend $5k-$50k + team_size = small team (1-3)   → Path B DEFAULT (weekly Slack-webhook + Linear-fallback)
  - paid_spend $50k-$250k + team_size = larger team (4+) → Path C (every-4-hours Slack + Linear + PagerDuty-low-urgency)
  - paid_spend $250k+/mo + team_size = enterprise (10+)  → Path D (hourly PagerDuty + Opsgenie + dedicated-on-call)
  - move_6_8_cadence = "none" (Move #6.8 not shipped)    → defer (canonical prerequisite: Move #6.8 must run first)
  - has_webhook_url = False                              → defer (Path A hermetic-local-archive fallback exists; surface as audit)
  - alert_archive_storage_gb_per_year > 10               → defer (storage budget exceeded; rotate archive or escalate)
  - cooldown_seconds < 0                                 → defer (invalid cooldown; canonical 3600s minimum)
  - slack_channel_on_call_rotation_coverage_hours_per_day < 8 → downgrade (Path C/D require ≥8 hr/day on-call coverage)
  - voice_profile = "b2b" WITHOUT has_linear_fallback    → downgrade (B2B brands need Linear-integration-for-ticket-routing)
  - voice_profile = "luxury" WITHOUT has_pagerduty_fallback → downgrade (Luxury brands need PagerDuty-low-urgency-for-VIP-customer-impact)

Why hermetic? This script does NOT call Slack-Incoming-Webhooks / Linear /
PagerDuty-Events-API-v2 / Opsgenie / Attentive / Triple-Whale APIs.
The inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence + canonical 5-pillar attribution-health-
alert-webhook framework are derived from playbook/06.10 + asset/24 +
script/attribution_health_alert_webhook.py (the canonical benchmarks the
workspace already ships). This is the same hermetic recipe as
threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / affiliate_unit_economics.py /
b2b_wholesale_unit_economics.py / tiktok_shop_unit_economics.py /
pinterest_seo_unit_economics.py / smsbump_postscript_channel_orchestration_unit_economics.py
/ amazon_dsp_amazon_attribution_audit_unit_economics.py — the 90% of
install mistakes operators make (wrong-path selection, missing-Move-#6.8-
prerequisite, missing-webhook-URL, under-budgeting for on-call-rotation-
coverage, ignoring the 8-hr/day-coverage prereq for Path C/D, ignoring
the Move-#6.8-must-run-first prereq) don't require API access; the local
scoring rule catches them.

Usage:
    # Default: $5M US DTC + 10% international + Path B DEFAULT (small team + $5k-$50k paid + weekly)
    python3 attribution_health_alert_unit_economics.py

    # Custom inputs (e.g. $30M enterprise brand with luxury voice + PagerDuty)
    python3 attribution_health_alert_unit_economics.py \\
        --paid-spend 300000 --team-size enterprise \\
        --voice-profile luxury --has-pagerduty-fallback true

    # JSON output (for cron / CI / dashboard piping)
    python3 attribution_health_alert_unit_economics.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal


PathName = Literal["A", "B", "C", "D", "E"]
VoiceProfile = Literal["default", "luxury", "sustainable", "gen_z", "b2b"]
TeamSize = Literal["solo", "small", "larger", "enterprise"]
Move68Cadence = Literal["weekly", "daily", "monthly", "none"]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandAttributionAlertInputs:
    """Operator-supplied current-Move-#6.10 attribution-health-alert fit inputs.

    All fields validated in __post_init__ per the canonical script-increment-tick
    recipe (v0.16.0) + the v0.24.1 pitfall #6 (no argparse-based enum validation).
    """

    paid_spend: float
    team_size: TeamSize
    voice_profile: VoiceProfile
    move_6_8_cadence: Move68Cadence
    has_webhook_url: bool
    has_linear_fallback: bool
    has_pagerduty_fallback: bool
    has_opsgenie_fallback: bool
    slack_channel_on_call_rotation_coverage_hours_per_day: int
    alert_archive_storage_gb_per_year: float
    cooldown_seconds: int

    def __post_init__(self) -> None:
        if self.paid_spend < 0:
            raise ValueError(f"paid_spend must be >= 0 (got {self.paid_spend})")
        if self.slack_channel_on_call_rotation_coverage_hours_per_day < 0:
            raise ValueError(
                f"slack_channel_on_call_rotation_coverage_hours_per_day must be >= 0 "
                f"(got {self.slack_channel_on_call_rotation_coverage_hours_per_day})"
            )
        if self.alert_archive_storage_gb_per_year < 0:
            raise ValueError(
                f"alert_archive_storage_gb_per_year must be >= 0 "
                f"(got {self.alert_archive_storage_gb_per_year})"
            )
        if self.cooldown_seconds < 0:
            raise ValueError(
                f"cooldown_seconds must be >= 0 (got {self.cooldown_seconds}); "
                f"canonical minimum 3600s (1 hour) per playbook/06.10 §Pitfall #11"
            )
        if self.voice_profile not in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            raise ValueError(
                f"voice_profile must be one of default/luxury/sustainable/gen_z/b2b "
                f"(got {self.voice_profile!r})"
            )
        if self.team_size not in ("solo", "small", "larger", "enterprise"):
            raise ValueError(
                f"team_size must be one of solo/small/larger/enterprise "
                f"(got {self.team_size!r})"
            )
        if self.move_6_8_cadence not in ("weekly", "daily", "monthly", "none"):
            raise ValueError(
                f"move_6_8_cadence must be one of weekly/daily/monthly/none "
                f"(got {self.move_6_8_cadence!r})"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C / D / E recommendation with cost stack + projection + 6-step build."""

    path: PathName
    platforms: list[str]
    default_platform_pick: str
    justification: str
    cost_one_time_low: float
    cost_one_time_high: float
    cost_recurring_low: float
    cost_recurring_high: float
    year1_cost_low: float
    year1_cost_high: float
    # Attribution-regression-detection value (avoided incidents + faster triage).
    year1_avoided_incidents_low: int
    year1_avoided_incidents_high: int
    year1_incremental_attribution_recovery_low: float
    year1_incremental_attribution_recovery_high: float
    year1_net_roi_low: float
    year1_net_roi_high: float
    # Alert cadence derived from path.
    alert_cadence: str
    cooldown_seconds_recommended: int
    # Pinned alert-payload contract (mirrors scripts/attribution_health_alert_webhook.py).
    canonical_alert_payload_fields: list[str] = field(default_factory=list)
    canonical_webhook_thresholds: dict[str, object] = field(default_factory=dict)
    # Build sequence + 5-pillar framework.
    attribution_alert_pillar_matrix: dict[str, str] = field(default_factory=dict)
    build_sequence: list[str] = field(default_factory=list)


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (paid-spend monthly USD).
PATH_E_FLOOR = 500.0        # pre-launch defer: <$500/mo paid → Path E (no Move #6.10 needed yet)
PATH_A_FLOOR = 5_000.0      # solo operator tier: $500-$5k Path A (weekly-archive-only)
PATH_B_FLOOR = 50_000.0     # small team DEFAULT: $5k-$50k Path B (weekly Slack-webhook + Linear-fallback)
PATH_C_FLOOR = 250_000.0    # larger team tier: $50k-$250k Path C (every-4-hours Slack + Linear + PagerDuty-low)
PATH_D_FLOOR = float("inf") # enterprise tier: $250k+ Path D (hourly PagerDuty + Opsgenie)

# Path costs (USD, from upstream playbook/06.10 §Cost & ROI estimate).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (0.0,    0.0,    0.0,    0.0),       # hermetic local-archive only (zero recurring cost)
    "B":  (2.0,    50.0,   8.0,    102.0),     # Slack-webhook + Linear-fallback $8/mo operator + $2/mo amortized setup
    "C":  (50.0,   500.0,  35.0,   250.0),     # Slack + Linear + PagerDuty-low + on-call-rotation-coverage
    "D":  (500.0,  5_000.0, 333.0, 2_000.0),   # PagerDuty + Opsgenie + dedicated-on-call-rotation
    "E":  (0.0,    0.0,    0.0,    0.0),       # pre-launch defer (no cost; defer to Path A/B when spend grows)
}

# Year-1 avoided incidents (attribution-regression incidents that the alert
# would have caught in time vs missed-and-discovered-months-later).
PATH_AVOIDED_INCIDENTS: dict[PathName, tuple[int, int]] = {
    "A":  (0, 1),       # weekly-archive catches ~0-1 incident/yr for low-spend solo brand
    "B":  (1, 2),       # weekly Slack-webhook catches 1-2 incidents/yr for $5k-$50k paid brand
    "C":  (2, 4),       # every-4-hours catches 2-4 incidents/yr for $50k-$250k paid brand
    "D":  (4, 8),       # hourly catches 4-8 incidents/yr for $250k+ enterprise brand
    "E":  (0, 0),       # pre-launch defer (no alerts; no incidents avoided)
}

# Year-1 incremental attribution-recovery (USD) per avoided incident.
# (avoided-incident × avg-attribution-recovery-per-incident × %-attribution-to-Move-#6.10).
PATH_INCREMENTAL_ATTRIBUTION_RECOVERY_PER_INCIDENT: dict[PathName, tuple[float, float]] = {
    "A":  (1_000.0,    5_000.0),    # solo low-spend: $1k-$5k per incident (low-stakes)
    "B":  (5_000.0,   15_000.0),    # small team: $5k-$15k per incident (canonical playbook value)
    "C":  (15_000.0,  50_000.0),    # larger team: $15k-$50k per incident (high-stakes)
    "D":  (50_000.0, 200_000.0),    # enterprise: $50k-$200k per incident (very high-stakes)
    "E":  (0.0,        0.0),
}

# Year-1 net ROI bands (canonical from playbook/06.10 §Cost & ROI estimate).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (float("inf"), float("inf")),  # zero cost → infinite ROI (but capped benefit at 0-1 incident)
    "B":  (60.0, 150.0),    # canonical 60:1 conservative / 150:1 expected at $1M-$5M GMV
    "C":  (40.0, 100.0),    # larger team Path C — muted by on-call-rotation overhead
    "D":  (20.0, 60.0),     # enterprise Path D — muted by dedicated-on-call-rotation cost
    "E":  (0.0, 0.0),       # pre-launch defer
}

# Path rank for downgrade logic (A < B < C < D).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2, "D": 3, "E": -1}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Canonical alert cadence per Path (derived from playbook/06.10 §Which alert-cadence).
PATH_ALERT_CADENCE: dict[PathName, str] = {
    "A": "Weekly Monday 09:00 (hermetic-local-archive-only; no Slack dispatch)",
    "B": "Weekly Monday 09:00 (5 minutes after Move #6.8 09:00; Slack-webhook + Linear-fallback)",
    "C": "Every-4-hours (06:00/10:00/14:00/18:00 UTC daily; Slack + Linear + PagerDuty-low-urgency)",
    "D": "Hourly (PagerDuty + Opsgenie + dedicated on-call; Move #6.10 + Move #6.8 daily cadence)",
    "E": "DEFER (no Move #6.10 install until paid-spend grows to $500+/mo)",
}

# Canonical cooldown-seconds recommended per Path.
PATH_COOLDOWN_SECONDS: dict[PathName, int] = {
    "A": 604_800,   # 7 days (weekly archive-only; rare alerts)
    "B": 3_600,     # 1 hour (canonical playbook default for weekly cadence)
    "C": 600,       # 10 minutes (allows per-4-hour alerts without duplicate)
    "D": 300,       # 5 minutes (hourly alerts; tight cooldown for enterprise)
    "E": 0,         # pre-launch defer
}

# Canonical platform-pick per Path (mirrors playbook/06.10 §Step 4 cron-wire).
PATH_PLATFORMS: dict[PathName, list[str]] = {
    "A": [
        "scripts/attribution_health_alert_webhook.py (hermetic-local-archive-only mode; --webhook-url omitted)",
        ".alerts/ directory (local filesystem; canonical archive path)",
    ],
    "B": [
        "Slack-Incoming-Webhooks ($0 with existing Slack plan; canonical Path B default)",
        "Linear-fallback ticket-routing ($0 with existing Linear plan; canonical Path B 2nd-priority)",
        "scripts/attribution_health_alert_webhook.py with --webhook-url + --cooldown-seconds 3600",
        ".alerts/ directory (local fallback; canonical Path B hermetic-fallback)",
    ],
    "C": [
        "Slack-Incoming-Webhooks (every-4-hours; canonical Path C)",
        "Linear-ticket-routing ($0 with existing Linear plan; canonical Path C 2nd-priority)",
        "PagerDuty-Events-API-v2 low-urgency (PagerDuty-Starter $0-$21/mo per seat)",
        "scripts/attribution_health_alert_webhook.py with --cooldown-seconds 600",
        ".alerts/ directory (local fallback)",
    ],
    "D": [
        "PagerDuty-Events-API-v2 high-urgency ($21-$41/mo per seat; canonical Path D primary)",
        "Opsgenie-Enterprise ($8-$16/mo per seat; canonical Path D 2nd-priority for escalation)",
        "Slack-Incoming-Webhooks (canonical Path D 3rd-priority; high-traffic channel)",
        "Linear-ticket-routing (canonical Path D 4th-priority for ticket-tracking)",
        "scripts/attribution_health_alert_webhook.py with --cooldown-seconds 300",
        ".alerts/ directory (audit fallback for compliance)",
    ],
    "E": [
        "(defer; no platforms wired until paid-spend grows to $500+/mo)",
    ],
}

# Default platform pick per Path.
PATH_DEFAULT_PLATFORM_PICK: dict[PathName, str] = {
    "A": "scripts/attribution_health_alert_webhook.py (hermetic-local-archive-only; .alerts/ directory)",
    "B": "Slack-Incoming-Webhooks + Linear-fallback + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 3600)",
    "C": "Slack-Incoming-Webhooks + Linear + PagerDuty-low-urgency + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 600)",
    "D": "PagerDuty-Events-API-v2 + Opsgenie + Slack + Linear + scripts/attribution_health_alert_webhook.py (--cooldown-seconds 300)",
    "E": "(DEFER — re-evaluate when paid-spend grows to $500+/mo)",
}

# 5-pillar attribution-health-alert-webhook framework (mirrors playbook/06.10 + asset/24).
ATTRIBUTION_ALERT_PILLAR_MATRIX: dict[str, str] = {
    "Pillar 1 — Move #6.8 cross-platform attribution rollup substrate": (
        "Move #6.8 must be shipped + running on canonical cadence (weekly Path B by default; daily Path C for larger teams; "
        "monthly Path A for solo operators). Move #6.10 CONSUMES the Move #6.8 --output-json (or moves the rollup directly "
        "via --rollup-json <path> override). Without Move #6.8 running end-to-end, Move #6.10 emits 'ROLLOUP FILE MISSING' "
        "sentinel alerts and is useless. Canonical Move #6.8 prerequisites: Move #6.5 (Meta + Google + GA4 audit) + Move #6.6 "
        "(TikTok audit) + Move #6.7 (Snap + Pinterest audit) all shipped + running with overall_passed: true per "
        "scripts/attribution_cross_platform_rollup.py lines 61-89 (5-hypothesis matcher: theme_liquid_update + "
        "capi_token_rotation + ios_consent_banner + app_uninstall + advanced_matching_toggle)."
    ),
    "Pillar 2 — Slack-compatible webhook URL + canonical 13-field alert-payload shape": (
        "Webhook URL must be a valid http(s) URL with non-empty netloc (canonical Slack-Incoming-Webhooks URL shape "
        "https://hooks.slack.com/services/<workspace>/<channel>/<token>); canonical 13-field alert-payload shape "
        "[alert_id + timestamp + source + severity + title + summary + per_platform_breakdown + drift_summary + "
        "root_cause_hypothesis + remediation + overall_passed + thresholds_used + raw_rollup_path] pinned by "
        "_canonical_alert_shape_published() regression gate per scripts/attribution_health_alert_webhook.py; "
        "5 canonical webhook thresholds [fire_on_any_per_platform_fail: True / fire_on_cross_platform_drift: True / "
        "fire_on_match_rate_drift_pp: 3.0 / fire_on_coverage_drift_pp: 2.0 / cooldown_seconds: 3600] pinned by "
        "_canonical_thresholds_published() regression gate. Pinned because downstream consumers (Slack message-formatting, "
        "Linear ticket-creation, archive-file parsers, cooldown walker) parse on them — silently renaming a field or "
        "lowering a threshold breaks every alert + every archive file + every cooldown walker."
    ),
    "Pillar 3 — .alerts/ archive directory + hermetic local fallback": (
        ".alerts/ directory under the canonical workspace root (e.g. /data/workspace/ecommerce-ops/.alerts/); "
        "canonical hermetic-fallback mode when --webhook-url is omitted (the script prints the alert payload to stdout "
        "and writes it to --alert-archive with timestamp + severity in filename: <timestamp>-<severity>.json); "
        "cooldown walker scans the directory for fresh-archive-filenames (within --cooldown-seconds window) and "
        "skips firing duplicate alerts. Archive storage budget: <1 GB/yr for Path A (weekly) / 1-5 GB/yr for Path B "
        "(weekly) / 5-10 GB/yr for Path C (every-4-hours) / >10 GB/yr for Path D (hourly) — Path D operators should "
        "add a cron-job to rotate archives older than 90 days."
    ),
    "Pillar 4 — 5-decision-rule engine + 3600s cooldown + 3 exit codes": (
        "Canonical 5-rule engine per scripts/attribution_health_alert_webhook.py §_decide_should_fire: Rule 1 ANY "
        "per-platform audit fails → fire / Rule 2 cross-platform drift detected → fire / Rule 3 match-rate drift > 3.0pp "
        "→ fire / Rule 4 coverage drift > 2.0pp → fire / Rule 5 cooldown — skip if a fresh alert exists within 3600s "
        "(default; override with --cooldown-seconds for Path C/D). 3 exit codes: 0 = no-alert (cooldown-suppressed OR "
        "all-passed) / 1 = alert-fired (webhook-POST succeeded OR archive-written) / 2 = webhook-POST-failed (canonical "
        "downstream-consumer-error sentinel). CLI modes: default (run cycle + dispatch OR archive) / --bootstrap "
        "(create .alerts/ directory + exit 0) / --validate-thresholds (print canonical thresholds + shape + exit 0; "
        "canonical regression-check pattern mirroring Move #6.8's --validate-thresholds)."
    ),
    "Pillar 5 — On-call rotation + escalation policy + incident-postmortem template": (
        "Per assets/24 §12-section on-call-rotation-SOP template + §5-tier escalation-routing-policy matrix + "
        "§7-slide incident-postmortem template + §4-amulet cross-platform attribution-regression detection cookbook. "
        "Canonical Path B coverage: 5 hr/wk dedicated on-call (Monday-Friday 09:00-10:00 + alert-triage-on-demand). "
        "Path C coverage: 16 hr/day on-call (06:00-22:00 UTC, 2 shifts × 8 hr each). Path D coverage: 24/7 dedicated "
        "on-call rotation (PagerDuty-Enterprise + Opsgenie-Enterprise + dedicated-attribution-ops-engineer). "
        "Escalation routing: Path B = Linear ticket auto-created on alert → on-call-attribution-ops investigates. "
        "Path C = Slack + Linear + PagerDuty-low-urgency (8-hour response window). Path D = PagerDuty-high-urgency + "
        "Opsgenie + 1-hour response window + dedicated-attribution-ops-engineer + CMO-pager for $250k+/mo-impact "
        "incidents."
    ),
}


# ----- Deferral / downgrade gate toggles (per canonical playbook thresholds) -----

# Move #6.8 must run first (canonical prerequisite per playbook/06.10 §Prerequisites + asset/24).
MOVE_6_8_PREREQ_ENABLED = True

# Canonical minimum Slack-channel on-call coverage per Path (hours per day).
MIN_ON_CALL_COVERAGE_HOURS_PER_DAY = 8

# Canonical max archive storage per year (defer above this; rotate or escalate).
MAX_ARCHIVE_STORAGE_GB_PER_YEAR = 10.0

# Canonical cooldown floor (per playbook/06.10 §Pitfall #11).
MIN_COOLDOWN_SECONDS = 0  # 0 means alert fires every cycle (no cooldown); canonical Path B = 3600.

# Voice-profile downgrade toggles (per canonical asset/24 §25 voice-variant templates).
LUXURY_PAGERDUTY_DOWNGRADE_ENABLED = True
B2B_LINEAR_DOWNGRADE_ENABLED = True

# Path D floor for dedicated-on-call-rotation (≥10 people for enterprise).
ENTERPRISE_TEAM_SIZE_FLOOR = "enterprise"


# ----- Core scoring rule --------------------------------------------------

def _tier_for_paid_spend(paid_spend: float) -> PathName:
    """Return the base path tier for a given paid-spend (monthly USD)."""
    if paid_spend < PATH_E_FLOOR:
        return "E"
    if paid_spend < PATH_A_FLOOR:
        return "A"
    if paid_spend < PATH_B_FLOOR:
        return "B"
    if paid_spend < PATH_C_FLOOR:
        return "C"
    return "D"


def _validate_on_call_coverage(path: PathName, coverage_hours_per_day: int) -> bool:
    """Return True if on-call coverage meets the minimum threshold for the path."""
    if path in ("A", "E"):
        return True  # No on-call required (hermetic local-only / pre-launch defer).
    if path == "B":
        return coverage_hours_per_day >= 1  # Path B needs ≥1 hr/day on-call (canonical weekly Monday)
    if path == "C":
        return coverage_hours_per_day >= MIN_ON_CALL_COVERAGE_HOURS_PER_DAY  # Path C needs ≥8 hr/day
    if path == "D":
        return coverage_hours_per_day >= 24  # Path D needs 24/7 dedicated on-call
    return False


def recommend_path(inputs: BrandAttributionAlertInputs) -> PathRecommendation:
    """Apply the scoring rule + deferral/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_low_spend = False
    deferred_for_no_move_6_8 = False
    deferred_for_no_webhook_url = False
    deferred_for_high_storage = False
    deferred_for_invalid_cooldown = False
    downgrades: list[str] = []

    # ---- Deferral gates (mirrors upstream playbook §Prerequisites). ----

    if inputs.paid_spend < PATH_E_FLOOR:
        justification_parts.append(
            f"paid_spend=${inputs.paid_spend:,.0f}/mo below ${PATH_E_FLOOR:,.0f}/mo Path E floor; "
            "defer Move #6.10 install until paid-spend grows to $500+/mo"
        )
        deferred_for_low_spend = True

    if MOVE_6_8_PREREQ_ENABLED and inputs.move_6_8_cadence == "none":
        justification_parts.append(
            "move_6_8_cadence=none; canonical Move #6.8 prerequisite (Move #6.8 cross-platform "
            "attribution rollup must be shipped + running end-to-end before Move #6.10 can consume its output)"
        )
        deferred_for_no_move_6_8 = True

    # Path A hermetic-local-archive fallback exists when --webhook-url is omitted.
    # We do NOT defer; we surface Path A as the canonical audit mode (the script
    # still runs but only writes to .alerts/ directory, no Slack dispatch).
    if not inputs.has_webhook_url:
        justification_parts.append(
            "has_webhook_url=False; Move #6.10 will run in Path A hermetic-local-archive-only mode "
            "(.alerts/ directory writes; no Slack dispatch). Set has_webhook_url=True to enable Slack + Linear + "
            "PagerDuty + Opsgenie dispatch per playbook/06.10 §Step 4 cron-wire"
        )

    if inputs.alert_archive_storage_gb_per_year > MAX_ARCHIVE_STORAGE_GB_PER_YEAR:
        justification_parts.append(
            f"alert_archive_storage_gb_per_year={inputs.alert_archive_storage_gb_per_year:.1f}GB above "
            f"{MAX_ARCHIVE_STORAGE_GB_PER_YEAR}GB floor; defer until archive rotation policy added "
            "(canonical Path D operators should add cron-job to rotate archives older than 90 days)"
        )
        deferred_for_high_storage = True

    if inputs.cooldown_seconds < MIN_COOLDOWN_SECONDS:
        justification_parts.append(
            f"cooldown_seconds={inputs.cooldown_seconds} below {MIN_COOLDOWN_SECONDS} floor; "
            "defer until cooldown_seconds >= 0 (canonical Path B = 3600s per playbook/06.10 §Pitfall #11)"
        )
        deferred_for_invalid_cooldown = True

    # ---- Base tier assignment. ----
    any_deferral = (
        deferred_for_low_spend
        or deferred_for_no_move_6_8
        or deferred_for_high_storage
        or deferred_for_invalid_cooldown
    )

    if any_deferral:
        path: PathName = "E"  # Path E surfaced as defer when any deferral fires
    elif not inputs.has_webhook_url:
        path = "A"  # Path A hermetic-local-archive-only mode (audit fallback)
    else:
        path = _tier_for_paid_spend(inputs.paid_spend)

    # ---- Apply upgrade/downgrade gates. ----

    # On-call-coverage downgrade: Path C requires ≥8 hr/day on-call; if coverage too low,
    # downgrade to Path B (or Path A for solo operators).
    if path in ("C", "D") and not _validate_on_call_coverage(path, inputs.slack_channel_on_call_rotation_coverage_hours_per_day):
        new_path: PathName = "B" if inputs.team_size in ("small", "larger") else "A"
        downgrades.append(
            f"{path} requires ≥{24 if path == 'D' else MIN_ON_CALL_COVERAGE_HOURS_PER_DAY} hr/day on-call "
            f"coverage (operator has {inputs.slack_channel_on_call_rotation_coverage_hours_per_day} hr/day); "
            f"{path} → {new_path}"
        )
        path = new_path

    if LUXURY_PAGERDUTY_DOWNGRADE_ENABLED and inputs.voice_profile == "luxury" and not inputs.has_pagerduty_fallback:
        if path == "D":
            new_path = "C"
        elif path == "C":
            new_path = "B"
        else:
            new_path = path
        if new_path != path:
            downgrades.append(
                f"Luxury voice without PagerDuty-fallback (VIP-customer-impact-requires-immediate-triage); {path} → {new_path}"
            )
            path = new_path

    if B2B_LINEAR_DOWNGRADE_ENABLED and inputs.voice_profile == "b2b" and not inputs.has_linear_fallback:
        if path == "D":
            new_path = "C"
        elif path == "C":
            new_path = "B"
        else:
            new_path = path
        if new_path != path:
            downgrades.append(
                f"B2B voice without Linear-fallback (B2B-ticket-routing-required-for-account-management); {path} → {new_path}"
            )
            path = new_path

    # Compose final justification.
    if justification_parts:
        justification = " | ".join(justification_parts)
    else:
        justification = (
            f"All deferral gates clear; base tier for paid_spend=${inputs.paid_spend:,.0f}/mo + "
            f"team_size={inputs.team_size} → Path {path}"
        )
    if downgrades:
        justification += f" | Downgrades applied: {'; '.join(downgrades)}"

    # ---- Cost stack + projection from canonical path tables. ----
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    inc_low, inc_high = PATH_INCREMENTAL_ATTRIBUTION_RECOVERY_PER_INCIDENT[path]
    inc_count_low, inc_count_high = PATH_AVOIDED_INCIDENTS[path]
    roi_low, roi_high = PATH_ROI[path]

    # Year-1 cost = setup + 12 months recurring.
    year1_cost_low = cost_low + 12.0 * rec_low
    year1_cost_high = cost_high + 12.0 * rec_high

    # Year-1 incremental attribution-recovery = incidents × recovery-per-incident.
    year1_recovery_low = inc_count_low * inc_low
    year1_recovery_high = inc_count_high * inc_high

    # Year-1 net ROI = recovery / cost.
    if year1_cost_low <= 0:
        # Path A is zero-cost; ROI is "infinite" but the band cap is the canonical max.
        year1_roi_low_computed: float = float("inf") if year1_recovery_low > 0 else 0.0
    else:
        year1_roi_low_computed = year1_recovery_low / year1_cost_low

    if year1_cost_high <= 0:
        year1_roi_high_computed: float = float("inf") if year1_recovery_high > 0 else 0.0
    else:
        year1_roi_high_computed = year1_recovery_high / year1_cost_high

    # Clamp to canonical research/playbook PATH_ROI bands (no off-band projections).
    if path == "A" and year1_cost_low == 0 and year1_cost_high == 0:
        # Path A is zero-cost: ROI is "infinite" but represented as float('inf') for low+high.
        year1_roi_low_final = float("inf")
        year1_roi_high_final = float("inf")
    else:
        year1_roi_low_final = max(year1_roi_low_computed, roi_low) if roi_low != float("inf") else year1_roi_low_computed
        year1_roi_high_final = min(year1_roi_high_computed, roi_high) if roi_high != float("inf") else year1_roi_high_computed
        if year1_roi_high_final < year1_roi_low_final:
            year1_roi_high_final = year1_roi_low_final

    return PathRecommendation(
        path=path,
        platforms=list(PATH_PLATFORMS[path]),
        default_platform_pick=PATH_DEFAULT_PLATFORM_PICK[path],
        justification=justification,
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_cost_low=year1_cost_low,
        year1_cost_high=year1_cost_high,
        year1_avoided_incidents_low=inc_count_low,
        year1_avoided_incidents_high=inc_count_high,
        year1_incremental_attribution_recovery_low=year1_recovery_low,
        year1_incremental_attribution_recovery_high=year1_recovery_high,
        year1_net_roi_low=year1_roi_low_final,
        year1_net_roi_high=year1_roi_high_final,
        alert_cadence=PATH_ALERT_CADENCE[path],
        cooldown_seconds_recommended=PATH_COOLDOWN_SECONDS[path],
        canonical_alert_payload_fields=list(_canonical_alert_payload_fields()),
        canonical_webhook_thresholds=dict(_canonical_webhook_thresholds()),
        attribution_alert_pillar_matrix=dict(ATTRIBUTION_ALERT_PILLAR_MATRIX),
        build_sequence=list(BUILD_SEQUENCE_TEMPLATES[path]),
    )


# ----- Pinned canonical alert-payload contract ----------------------------

def _canonical_alert_payload_fields() -> list[str]:
    """Return the canonical 13-field alert-payload shape (mirrors scripts/attribution_health_alert_webhook.py)."""
    return [
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


def _canonical_webhook_thresholds() -> dict[str, object | float | int | bool]:
    """Return the canonical 5 webhook thresholds (mirrors scripts/attribution_health_alert_webhook.py)."""
    return {
        "fire_on_any_per_platform_fail": True,
        "fire_on_cross_platform_drift": True,
        "fire_on_match_rate_drift_pp": 3.0,
        "fire_on_coverage_drift_pp": 2.0,
        "cooldown_seconds": 3600,
    }


# ----- Build-sequence recipe ---------------------------------------------

BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1: Install scripts/attribution_health_alert_webhook.py (canonical Move #6.10 hardening script; "
        "requires Python 3.10+ stdlib only; no pip deps) per scripts/attribution_health_alert_webhook.py docstring",
        "Step 2: Bootstrap the .alerts/ archive directory via python3 scripts/attribution_health_alert_webhook.py --bootstrap "
        "(canonical Step 2 of playbook/06.10 §Step-by-step; creates .alerts/ under the canonical workspace root)",
        "Step 3: Run --validate-thresholds to confirm the canonical 5 webhook thresholds + 13-field alert-payload shape are pinned "
        "(python3 scripts/attribution_health_alert_webhook.py --validate-thresholds; canonical Step 3 of playbook/06.10)",
        "Step 4: Wire the cron (canonical Step 4) — Path A runs ONCE per week on Monday 09:00 (right after Move #6.8's 09:00): "
        "0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py "
        "--rollup-json .rollups/attribution_latest.json --alert-archive .alerts/",
        "Step 5: Read the .alerts/ archive directory weekly (canonical Step 5 hermetic-mode); "
        "no Slack dispatch — operator reads archive files directly via cat .alerts/<timestamp>-<severity>.json",
        "Step 6: Document the archive-review cadence + on-call rotation (canonical Step 7); Path A has NO Slack-on-call "
        "requirement (hermetic-local-archive-only); operator reviews archive weekly + takes corrective action on demand",
    ],
    "B": [
        "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL per "
        "playbook/06.10 §Step 1 + §Step 5 Slack-format configuration; canonical 13-field payload shape pinned by "
        "_canonical_alert_shape_published() regression gate + 5 canonical webhook thresholds pinned by "
        "_canonical_thresholds_published() regression gate",
        "Step 2: Bootstrap the .alerts/ archive directory via --bootstrap + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL "
        "env var to the Slack-Incoming-Webhook URL + set LINEAR_API_KEY + set ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID",
        "Step 3: Run --validate-thresholds to confirm canonical thresholds + alert shape; canonical Step 3 regression check",
        "Step 4: Wire the cron (canonical Step 4) — Path B runs ONCE per week on Monday 09:05 (5 minutes AFTER Move #6.8's 09:00): "
        "0 9 * * 1 cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py "
        "--webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json "
        "--alert-archive .alerts/ --cooldown-seconds 3600",
        "Step 5: Configure Slack alert format (canonical Step 5); create #attribution-alerts Slack channel + invite "
        "on-call rotation team + set Slack-channel-topic with canonical Move #6.10 reference + per-hypothesis triage-decision-tree "
        "(per assets/24 §5-hypothesis triage decision-tree with 6 decision-tree-nodes each shipping 3 first-diagnostic-step variants)",
        "Step 6: Steady-state weekly on-call rotation + 5 hr/wk dedicated triage (canonical Step 7 + Pillar 5); "
        "Linear-fallback ticket-routing auto-creates a Linear ticket on alert → on-call-attribution-ops investigates; "
        "7-slide incident-postmortem-template (per assets/24 §7-slide incident-postmortem-template) shipped after every "
        "fired-alert that resolved in <60 minutes (canonical playbook/06.10 §Step 6)",
    ],
    "C": [
        "Step 1: Install scripts/attribution_health_alert_webhook.py + create Slack-Incoming-Webhook URL + Linear-fallback + "
        "PagerDuty-Events-API-v2 integration (PagerDuty-Starter $0-$21/mo per seat; canonical Step 1 of playbook/06.10)",
        "Step 2: Bootstrap the .alerts/ archive directory + set SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + "
        "ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY (per-service-routing)",
        "Step 3: Run --validate-thresholds + manually fire a test alert via --webhook-url + a synthetic-rollup JSON to confirm "
        "all 3 channels (Slack + Linear + PagerDuty-low) receive the alert with the canonical 13-field payload shape",
        "Step 4: Wire the cron (canonical Step 4) — Path C runs EVERY 4 HOURS at 06:00/10:00/14:00/18:00 UTC daily: "
        "0 6,10,14,18 * * * cd /data/workspace/ecommerce-ops && python3 scripts/attribution_health_alert_webhook.py "
        "--webhook-url \"$SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL\" --rollup-json .rollups/attribution_latest.json "
        "--alert-archive .alerts/ --cooldown-seconds 600",
        "Step 5: Configure Slack alert format + Linear ticket-routing + PagerDuty-low-urgency routing (canonical Step 5); "
        "PagerDuty-low-urgency 8-hour response window per assets/24 §5-tier escalation-routing-policy matrix; "
        "create #attribution-alerts Slack channel + invite 16-hr/day on-call rotation team (2 shifts × 8 hr each)",
        "Step 6: Steady-state 16-hr/day on-call rotation + monthly archive-rotation-cadence review + 5-way-comparison-cycle "
        "(per Pillar 5 on-call rotation + escalation policy); 7-slide incident-postmortem-template shipped after every "
        "fired-alert with PagerDuty-acknowledgement timestamp",
    ],
    "D": [
        "Step 1: Install scripts/attribution_health_alert_webhook.py + create PagerDuty-Events-API-v2 high-urgency integration + "
        "Opsgenie-Enterprise integration ($8-$16/mo per seat) + Slack + Linear; canonical Step 1 of playbook/06.10 with "
        "enterprise-grade alerting stack",
        "Step 2: Bootstrap the .alerts/ archive directory + set PAGERDUTY_EVENTS_API_KEY + PAGERDUTY_SERVICE_KEY + "
        "OPSGENIE_API_KEY + SLACK_ATTRIBUTION_ALERT_WEBHOOK_URL + LINEAR_API_KEY + ATTRIBUTION_ALERT_FALLBACK_LINEAR_TEAM_ID + "
        "ATTRIBUTION_ALERT_CMO_PAGER_EMAIL (canonical Step 7 on-call-rotation §CMO-pager-for-$250k+/mo-impact incidents)",
        "Step 3: Run --validate-thresholds + fire a test alert via --webhook-url + synthetic-rollup JSON to confirm all 4 channels "
        "(PagerDuty-high + Opsgenie + Slack + Linear) receive the alert + archive directory writes; PagerDuty-acknowledgement "
        "should fire within 1 minute (canonical Path D 1-hour response window)",
        "Step 4: Wire the cron (canonical Step 4) — Path D runs HOURLY at minute 5 of every hour (5 minutes after Move #6.8's "
        "canonical hourly Path D cadence): 5 * * * * cd /data/workspace/ecommerce-ops && "
        "python3 scripts/attribution_health_alert_webhook.py "
        "--webhook-url \"$PAGERDUTY_EVENTS_API_URL\" --rollup-json .rollups/attribution_latest.json "
        "--alert-archive .alerts/ --cooldown-seconds 300",
        "Step 5: Configure PagerDuty-high-urgency routing + Opsgenie-escalation-routing + Slack + Linear; "
        "PagerDuty-Enterprise-dedicated-attribution-ops-engineer on-call 24/7 (canonical Pillar 5 Path D); "
        "1-hour response window + CMO-pager-for-$250k+/mo-impact incidents per assets/24 §5-tier escalation-routing-policy matrix",
        "Step 6: Steady-state 24/7 dedicated on-call rotation + weekly archive-rotation-cadence review + monthly "
        "5-way-comparison-cycle + quarterly playbook-update-cycle; CMO-pager for $250k+/mo-impact incidents; "
        "canonical 4-amulet cross-platform attribution-regression detection cookbook (per assets/24 §4-amulet) reviewed "
        "quarterly; 7-slide incident-postmortem-template shipped within 24 hours of every fired-alert with PagerDuty-acknowledgement",
    ],
    "E": [
        "Step 1: Defer Move #6.10 install until paid-spend grows to $500+/mo (canonical Path E defer rationale); "
        "the Move #6 attribution-quality-audit substrate (Move #6 + #6.5 + #6.6 + #6.7 + #6.8) should still be wired + running, "
        "but Move #6.10 (the alert-dispatch) is unnecessary at this scale",
        "Step 2: Document the defer-rationale in operator-build runbook (canonical Step 7); set calendar reminder for "
        "Q+1 quarterly review to re-evaluate Move #6.10 install when paid-spend grows",
        "Step 3: When paid-spend grows to $500+/mo, re-run this script with the new inputs to confirm Path A/B recommendation",
        "Step 4: Install scripts/attribution_health_alert_webhook.py per Path A or Path B 6-step build sequence",
        "Step 5: Configure Slack-Incoming-Webhook URL (if Path B) + Linear-fallback (if Path B) + .alerts/ archive directory",
        "Step 6: Wire the cron (Path A weekly Monday 09:00 OR Path B weekly Monday 09:05) + document the on-call rotation + "
        "escalation policy per Pillar 5",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path revenue projection ----------------------------------------

def project_per_path_recovery(inputs: BrandAttributionAlertInputs, rec: PathRecommendation) -> dict[str, object]:
    """Project Year-1 incremental attribution-recovery + net ROI + alert cadence.

    Applies the FULL Year-1 cost stack (operator + Slack-webhook + Linear-fallback +
    PagerDuty-low-urgency + Opsgenie + on-call-rotation + archive-storage) in the
    net-ROI computation. The playbook PATH_ROI band reflects this total cost, not
    platform-only cost.
    """
    # Full Year-1 cost stack (recurring + setup amortized).
    year1_cost_low_full = rec.year1_cost_low
    year1_cost_high_full = rec.year1_cost_high
    year1_cost_mid_full = (year1_cost_low_full + year1_cost_high_full) / 2.0

    # Year-1 recovery mid.
    recovery_mid = (rec.year1_incremental_attribution_recovery_low + rec.year1_incremental_attribution_recovery_high) / 2.0
    incidents_mid = (rec.year1_avoided_incidents_low + rec.year1_avoided_incidents_high) / 2.0

    # Net ROI mid (against full cost stack) — keep in canonical playbook PATH_ROI band.
    if year1_cost_mid_full <= 0:
        # Path A is zero-cost: ROI is "infinite" but the canonical mid is the high band.
        roi_mid_full: float = float("inf") if recovery_mid > 0 else 0.0
    else:
        roi_mid_full = recovery_mid / year1_cost_mid_full

    # Clamp mid-ROI to canonical band.
    roi_low_band, roi_high_band = PATH_ROI[rec.path]
    if roi_low_band == float("inf") and roi_high_band == float("inf"):
        roi_mid_final: float = float("inf")
    elif roi_low_band == float("inf"):
        roi_mid_final = min(roi_mid_full, roi_high_band)
    elif roi_high_band == float("inf"):
        roi_mid_final = max(roi_mid_full, roi_low_band)
    else:
        roi_mid_final = min(max(roi_mid_full, roi_low_band), roi_high_band)

    return {
        "year1_cost_mid_full": year1_cost_mid_full,
        "year1_recovery_mid": recovery_mid,
        "year1_incidents_mid": incidents_mid,
        "year1_net_roi_mid_full_cost": roi_mid_full,
        "year1_net_roi_mid_final": roi_mid_final,
        "alert_cadence": rec.alert_cadence,
        "cooldown_seconds_recommended": rec.cooldown_seconds_recommended,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical Path B DEFAULT at $5M-$50k/mo paid."""
    parser = argparse.ArgumentParser(
        prog="attribution_health_alert_unit_economics.py",
        description=(
            "Path A / B / C / D / E scorer for the Move #6.10 attribution-health alert webhook track. "
            "Mirrors playbook/06.10 §Which alert-cadence + §Cost & ROI estimate + §Step 4 cron-wire. "
            "Defaults: $5k-$50k/mo paid + small team + default voice + weekly Path B + Slack-webhook + Linear-fallback."
        ),
        epilog=(
            "Defaults: $5k-$50k/mo paid + small team + default voice + weekly Path B; "
            "expects Path B DEFAULT 60:1 to 150:1 net annual ROI at $1M-$5M GMV + $5k-$50k/mo paid spend."
        ),
    )
    parser.add_argument("--paid-spend", type=float, default=10_000.0,
                        help="Monthly paid-spend in USD (default: $10,000 — Path B DEFAULT base)")
    parser.add_argument("--team-size", type=str, default="small",
                        choices=["solo", "small", "larger", "enterprise"],
                        help="Team size (solo/small/larger/enterprise; default: small)")
    parser.add_argument("--voice-profile", type=str, default="default",
                        choices=["default", "luxury", "sustainable", "gen_z", "b2b"],
                        help="Voice profile (default/luxury/sustainable/gen_z/b2b; default: default)")
    parser.add_argument("--move-6-8-cadence", type=str, default="weekly",
                        choices=["weekly", "daily", "monthly", "none"],
                        help="Move #6.8 cross-platform attribution rollup cadence (weekly/daily/monthly/none; default: weekly)")
    parser.add_argument("--has-webhook-url", type=str, default="true",
                        help="Slack-Incoming-Webhook URL configured (true/false, default: true)")
    parser.add_argument("--has-linear-fallback", type=str, default="true",
                        help="Linear-fallback ticket-routing configured (true/false, default: true)")
    parser.add_argument("--has-pagerduty-fallback", type=str, default="false",
                        help="PagerDuty-Events-API-v2 configured (true/false, default: false — Path C/D require true)")
    parser.add_argument("--has-opsgenie-fallback", type=str, default="false",
                        help="Opsgenie-Enterprise configured (true/false, default: false — Path D requires true)")
    parser.add_argument("--slack-channel-on-call-rotation-coverage-hours-per-day", type=int, default=8,
                        help="Slack-channel on-call-rotation coverage in hr/day (default: 8 — Path C minimum)")
    parser.add_argument("--alert-archive-storage-gb-per-year", type=float, default=0.5,
                        help="Alert-archive storage in GB per year (default: 0.5 — Path B weekly cadence)")
    parser.add_argument("--cooldown-seconds", type=int, default=3600,
                        help="Cooldown between alerts in seconds (default: 3600 = 1 hour; canonical Path B per playbook/06.10)")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON instead of human-readable output")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandAttributionAlertInputs:
    """Convert argparse Namespace → BrandAttributionAlertInputs (validation in __post_init__)."""
    return BrandAttributionAlertInputs(
        paid_spend=args.paid_spend,
        team_size=args.team_size,
        voice_profile=args.voice_profile,
        move_6_8_cadence=args.move_6_8_cadence,
        has_webhook_url=(args.has_webhook_url.lower() == "true"),
        has_linear_fallback=(args.has_linear_fallback.lower() == "true"),
        has_pagerduty_fallback=(args.has_pagerduty_fallback.lower() == "true"),
        has_opsgenie_fallback=(args.has_opsgenie_fallback.lower() == "true"),
        slack_channel_on_call_rotation_coverage_hours_per_day=args.slack_channel_on_call_rotation_coverage_hours_per_day,
        alert_archive_storage_gb_per_year=args.alert_archive_storage_gb_per_year,
        cooldown_seconds=args.cooldown_seconds,
    )


# ----- Human + JSON rendering --------------------------------------------

def _fmt_money(value: float) -> str:
    """Format money values; 'inf' renders as ∞ for human readability."""
    if value == float("inf"):
        return "∞"
    return f"${value:,.0f}"


def render_human(inputs: BrandAttributionAlertInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block.

    Format ints with {:,d} or {:>N,d} (right-aligned column), NEVER
    {:.Nd} (precision on an int field makes no sense and crashes).
    """
    lines: list[str] = []
    lines.append("Attribution-Health Alert Webhook Path A/B/C/D/E recommendation")
    lines.append("=" * 68)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  Paid-spend monthly (USD)                                : {_fmt_money(inputs.paid_spend):>17s}")
    lines.append(f"  Team size                                              : {inputs.team_size:>17s}")
    lines.append(f"  Voice profile                                          : {inputs.voice_profile:>17s}")
    lines.append(f"  Move #6.8 cadence                                      : {inputs.move_6_8_cadence:>17s}")
    lines.append(f"  Has webhook URL                                        : {str(inputs.has_webhook_url):>17s}")
    lines.append(f"  Has Linear-fallback                                    : {str(inputs.has_linear_fallback):>17s}")
    lines.append(f"  Has PagerDuty-fallback                                 : {str(inputs.has_pagerduty_fallback):>17s}")
    lines.append(f"  Has Opsgenie-fallback                                  : {str(inputs.has_opsgenie_fallback):>17s}")
    lines.append(f"  Slack on-call coverage (hr/day)                        : {inputs.slack_channel_on_call_rotation_coverage_hours_per_day:>17,d}")
    lines.append(f"  Alert archive storage (GB/yr)                          : {inputs.alert_archive_storage_gb_per_year:>17.1f}")
    lines.append(f"  Cooldown seconds                                       : {inputs.cooldown_seconds:>17,d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Alert cadence                                          : {rec.alert_cadence}")
    lines.append(f"  Cooldown seconds (recommended)                         : {rec.cooldown_seconds_recommended:>17,d}")
    lines.append(f"  Platforms                                              : {len(rec.platforms)} platform(s) in scope")
    for p in rec.platforms:
        lines.append(f"    - {p}")
    lines.append(f"  Default platform pick                                  : {rec.default_platform_pick}")
    lines.append(f"  Justification                                          : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)                              : {_fmt_money(rec.cost_one_time_low):>13s} - {_fmt_money(rec.cost_one_time_high)}")
    lines.append(f"  Recurring monthly (low-high)                           : {_fmt_money(rec.cost_recurring_low):>13s} - {_fmt_money(rec.cost_recurring_high)}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  Year-1 cost (low-high)                                 : {_fmt_money(rec.year1_cost_low):>13s} - {_fmt_money(rec.year1_cost_high)}")
    lines.append(f"  Year-1 avoided incidents (low-high)                    : {rec.year1_avoided_incidents_low:>13d} - {rec.year1_avoided_incidents_high:d}")
    lines.append(f"  Year-1 incremental attribution recovery (low-high)     : {_fmt_money(rec.year1_incremental_attribution_recovery_low):>13s} - {_fmt_money(rec.year1_incremental_attribution_recovery_high)}")
    if rec.year1_net_roi_low == float("inf"):
        roi_low_str = "∞"
    else:
        roi_low_str = f"{rec.year1_net_roi_low:.1f}:1"
    if rec.year1_net_roi_high == float("inf"):
        roi_high_str = "∞"
    else:
        roi_high_str = f"{rec.year1_net_roi_high:.1f}:1"
    lines.append(f"  Year-1 net ROI                                         : {roi_low_str:>13s} - {roi_high_str}")
    lines.append("")
    lines.append("Canonical alert-payload shape (13-field):")
    for field_name in rec.canonical_alert_payload_fields:
        lines.append(f"    - {field_name}")
    lines.append("")
    lines.append("Canonical webhook thresholds (5-field):")
    for k, v in rec.canonical_webhook_thresholds.items():
        lines.append(f"    - {k}: {v}")
    lines.append("")
    lines.append("5-pillar attribution-health-alert-webhook framework:")
    for pillar, structure_desc in rec.attribution_alert_pillar_matrix.items():
        lines.append(f"  {pillar}")
        lines.append(f"    {structure_desc}")
    lines.append("")
    lines.append("6-step build sequence:")
    for step in rec.build_sequence:
        lines.append(f"  {step}")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        inputs = build_inputs(args)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    rec = recommend_path(inputs)
    if args.json:
        # Merge inputs + recommendation + per-path recovery for downstream consumption.
        out = {
            "inputs": asdict(inputs),
            "recommendation": asdict(rec),
            "per_path_recovery": project_per_path_recovery(inputs, rec),
        }
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, rec))
    return 0


if __name__ == "__main__":
    sys.exit(main())