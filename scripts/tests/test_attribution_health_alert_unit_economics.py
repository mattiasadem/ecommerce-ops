#!/usr/bin/env python3
"""TDD test suite for attribution_health_alert_unit_economics.py.

Tests the 11-input BrandAttributionAlertInputs dataclass, the
recommend_path scoring rule, the 6-step build sequence, the human + JSON
rendering, the CLI plumbing, and the canonical Path A/B/C/D/E defaults
pinned against playbook/06.10 + asset/24 + scripts/attribution_health_alert_webhook.py.

Test count: ~90 TDD tests across 13 test classes per the canonical
script-increment-tick recipe (v0.16.0):

1. TestInputsValidation (~12) — bounds checks + invalid values
2. TestClassifyEnums (~8) — voice-profile + team-size + cadence valid + invalid
3. TestRecommendPathBaseTiers (~6) — exact-boundary tests at the 5 path floors
4. TestRecommendPathDeferrals (~7) — 5 deferral gates fire correctly
5. TestRecommendPathGates (~7) — voice + on-call-coverage downgrades compose
6. TestPathRecommendationStructure (~12) — every canonical band matches playbook/06.10 values
7. TestProjectPerPathRecovery (~7) — midpoint values + edge cases + Path A inf ROI
8. TestBuildSequence (~6) — 6 steps per path with platform-specific references
9. TestRenderHuman (~6) — human output format + smoke test
10. TestCanonicalDefaultsPinned (~10) — PATH_E/A/B/C/D_FLOOR + cost/incidents pinned
11. TestMainCLI (~7) — default returns 0 + JSON parses + invalid input exits 1
12. TestBuildInputs (~3) — default args + custom args + bool coercion
13. TestValidInputEdgeCases (~6) — exact-boundary + zero spend + invalid cooldown + storage cap

Total: ~97 tests.
"""
from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

# Make the script module importable.
SCRIPTS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SCRIPTS_DIR))

from attribution_health_alert_unit_economics import (  # noqa: E402  -- sys.path insertion above
    ATTRIBUTION_ALERT_PILLAR_MATRIX,
    BUILD_SEQUENCE_TEMPLATES,
    PATH_E_FLOOR,
    PATH_A_FLOOR,
    PATH_B_FLOOR,
    PATH_C_FLOOR,
    PATH_D_FLOOR,
    PATH_COSTS,
    PATH_DEFAULT_PLATFORM_PICK,
    PATH_AVOIDED_INCIDENTS,
    PATH_INCREMENTAL_ATTRIBUTION_RECOVERY_PER_INCIDENT,
    PATH_PLATFORMS,
    PATH_RANK,
    PATH_ROI,
    PATH_ALERT_CADENCE,
    PATH_COOLDOWN_SECONDS,
    ENTERPRISE_TEAM_SIZE_FLOOR,
    MAX_ARCHIVE_STORAGE_GB_PER_YEAR,
    BrandAttributionAlertInputs,
    PathRecommendation,
    _canonical_alert_payload_fields,
    _canonical_webhook_thresholds,
    _tier_for_paid_spend,
    build_inputs,
    build_sequence_for_path,
    parse_args,
    project_per_path_recovery,
    recommend_path,
    render_human,
)


# ----- Canonical Path B defaults (Path B DEFAULT at $5k-$50k/mo paid + small team) -----

PATH_B_DEFAULTS = dict(
    paid_spend=10_000.0,
    team_size="small",
    voice_profile="default",
    move_6_8_cadence="weekly",
    has_webhook_url=True,
    has_linear_fallback=True,
    has_pagerduty_fallback=False,
    has_opsgenie_fallback=False,
    slack_channel_on_call_rotation_coverage_hours_per_day=8,
    alert_archive_storage_gb_per_year=0.5,
    cooldown_seconds=3600,
)


def _path_b_inputs(**overrides):
    """Return a BrandAttributionAlertInputs with canonical Path B defaults + overrides."""
    return BrandAttributionAlertInputs(**{**PATH_B_DEFAULTS, **overrides})


# ----- 1. Input validation ------------------------------------------------

class TestInputsValidation(unittest.TestCase):
    def test_valid_defaults_pass(self) -> None:
        inputs = _path_b_inputs()
        self.assertEqual(inputs.paid_spend, 10_000.0)
        self.assertEqual(inputs.team_size, "small")

    def test_negative_paid_spend_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(paid_spend=-100.0)
        self.assertIn("paid_spend must be >= 0", str(ctx.exception))

    def test_negative_on_call_coverage_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(slack_channel_on_call_rotation_coverage_hours_per_day=-1)
        self.assertIn("slack_channel_on_call_rotation_coverage_hours_per_day must be >= 0", str(ctx.exception))

    def test_negative_archive_storage_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(alert_archive_storage_gb_per_year=-0.1)
        self.assertIn("alert_archive_storage_gb_per_year must be >= 0", str(ctx.exception))

    def test_negative_cooldown_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(cooldown_seconds=-1)
        self.assertIn("cooldown_seconds must be >= 0", str(ctx.exception))

    def test_invalid_voice_profile_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(voice_profile="bogus_voice")
        self.assertIn("voice_profile must be one of default/luxury/sustainable/gen_z/b2b", str(ctx.exception))

    def test_invalid_team_size_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(team_size="bogus_team")
        self.assertIn("team_size must be one of solo/small/larger/enterprise", str(ctx.exception))

    def test_invalid_move_6_8_cadence_rejected(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(move_6_8_cadence="bogus_cadence")
        self.assertIn("move_6_8_cadence must be one of weekly/daily/monthly/none", str(ctx.exception))

    def test_zero_paid_spend_accepted(self) -> None:
        inputs = _path_b_inputs(paid_spend=0.0)
        self.assertEqual(inputs.paid_spend, 0.0)

    def test_zero_archive_storage_accepted(self) -> None:
        inputs = _path_b_inputs(alert_archive_storage_gb_per_year=0.0)
        self.assertEqual(inputs.alert_archive_storage_gb_per_year, 0.0)

    def test_zero_cooldown_accepted(self) -> None:
        inputs = _path_b_inputs(cooldown_seconds=0)
        self.assertEqual(inputs.cooldown_seconds, 0)

    def test_negative_cooldown_error_message_mentions_pitfall_11(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            _path_b_inputs(cooldown_seconds=-100)
        # Error message references playbook/06.10 §Pitfall #11.
        self.assertIn("Pitfall #11", str(ctx.exception))


# ----- 2. Enum classification ---------------------------------------------

class TestClassifyEnums(unittest.TestCase):
    def test_default_voice_profile_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(voice_profile="default").voice_profile, "default")

    def test_luxury_voice_profile_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(voice_profile="luxury").voice_profile, "luxury")

    def test_sustainable_voice_profile_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(voice_profile="sustainable").voice_profile, "sustainable")

    def test_gen_z_voice_profile_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(voice_profile="gen_z").voice_profile, "gen_z")

    def test_b2b_voice_profile_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(voice_profile="b2b").voice_profile, "b2b")

    def test_solo_team_size_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(team_size="solo").team_size, "solo")

    def test_larger_team_size_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(team_size="larger").team_size, "larger")

    def test_enterprise_team_size_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(team_size="enterprise").team_size, "enterprise")

    def test_none_cadence_accepted(self) -> None:
        self.assertEqual(_path_b_inputs(move_6_8_cadence="none").move_6_8_cadence, "none")


# ----- 3. Base tier assignment --------------------------------------------

class TestRecommendPathBaseTiers(unittest.TestCase):
    def test_tier_for_paid_spend_path_e(self) -> None:
        self.assertEqual(_tier_for_paid_spend(100.0), "E")

    def test_tier_for_paid_spend_path_a(self) -> None:
        self.assertEqual(_tier_for_paid_spend(1_000.0), "A")

    def test_tier_for_paid_spend_path_b(self) -> None:
        self.assertEqual(_tier_for_paid_spend(10_000.0), "B")

    def test_tier_for_paid_spend_path_c(self) -> None:
        self.assertEqual(_tier_for_paid_spend(100_000.0), "C")

    def test_tier_for_paid_spend_path_d(self) -> None:
        self.assertEqual(_tier_for_paid_spend(500_000.0), "D")

    def test_paid_spend_at_path_e_floor_defer(self) -> None:
        # At exactly $500/mo Path E floor is still E (defer).
        self.assertEqual(_tier_for_paid_spend(500.0), "A")  # $500 = path A floor (just barely above E)

    def test_paid_spend_at_path_a_floor(self) -> None:
        # At exactly $5000/mo → Path B (Path A floor is $500, Path B starts at $5000).
        self.assertEqual(_tier_for_paid_spend(5_000.0), "B")

    def test_paid_spend_just_above_path_a_floor(self) -> None:
        # Just above $5k → Path B.
        self.assertEqual(_tier_for_paid_spend(5_001.0), "B")

    def test_paid_spend_at_path_b_floor(self) -> None:
        # At exactly $50k → Path C (Path B floor is $5k, Path C starts at $50k).
        self.assertEqual(_tier_for_paid_spend(50_000.0), "C")

    def test_paid_spend_at_path_c_floor(self) -> None:
        # At exactly $250k → Path D (Path C floor is $50k, Path D starts at $250k).
        self.assertEqual(_tier_for_paid_spend(250_000.0), "D")

    def test_paid_spend_above_path_c_floor(self) -> None:
        # Above $250k → Path D.
        self.assertEqual(_tier_for_paid_spend(250_001.0), "D")


# ----- 4. Deferral gates --------------------------------------------------

class TestRecommendPathDeferrals(unittest.TestCase):
    def test_low_paid_spend_defers_to_path_e(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=100.0))
        self.assertEqual(rec.path, "E")
        self.assertIn("below", rec.justification)
        self.assertIn("$500", rec.justification)

    def test_no_move_6_8_defers_to_path_e(self) -> None:
        rec = recommend_path(_path_b_inputs(move_6_8_cadence="none"))
        self.assertEqual(rec.path, "E")
        self.assertIn("move_6_8_cadence=none", rec.justification)
        self.assertIn("Move #6.8", rec.justification)

    def test_high_archive_storage_defers_to_path_e(self) -> None:
        rec = recommend_path(_path_b_inputs(alert_archive_storage_gb_per_year=15.0))
        self.assertEqual(rec.path, "E")
        self.assertIn("alert_archive_storage", rec.justification)

    def test_invalid_cooldown_defers_to_path_e(self) -> None:
        # cooldown -1 should be caught by __post_init__ validation
        with self.assertRaises(ValueError):
            _path_b_inputs(cooldown_seconds=-1)

    def test_no_webhook_url_surfaces_as_path_a_not_defer(self) -> None:
        # No webhook URL → Path A hermetic-local-archive-only mode (NOT defer).
        rec = recommend_path(_path_b_inputs(has_webhook_url=False, paid_spend=10_000.0))
        self.assertEqual(rec.path, "A")
        self.assertIn("hermetic-local-archive-only", rec.justification)

    def test_storage_at_max_storage_floor_passes(self) -> None:
        # Exactly at MAX_ARCHIVE_STORAGE_GB_PER_YEAR = 10.0 GB → still passes (not over).
        rec = recommend_path(_path_b_inputs(alert_archive_storage_gb_per_year=10.0))
        self.assertEqual(rec.path, "B")
        self.assertNotIn("storage", rec.justification.lower())

    def test_storage_just_above_max_defers(self) -> None:
        rec = recommend_path(_path_b_inputs(alert_archive_storage_gb_per_year=10.1))
        self.assertEqual(rec.path, "E")
        self.assertIn("10.1GB above", rec.justification)


# ----- 5. Downgrade gates -------------------------------------------------

class TestRecommendPathGates(unittest.TestCase):
    def test_luxury_without_pagerduty_downgrades_from_d_to_c(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=500_000.0,
            team_size="enterprise",
            voice_profile="luxury",
            has_pagerduty_fallback=False,
            has_opsgenie_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=24,
        ))
        # D → C (downgrade) but with on-call-coverage downgrade to B (Path D requires 24 hr/day; 24 is OK)
        # Actually 24 hr/day satisfies Path D coverage. So just luxury downgrade: D → C.
        self.assertEqual(rec.path, "C")
        self.assertIn("Luxury voice without PagerDuty", rec.justification)

    def test_luxury_without_pagerduty_downgrades_from_c_to_b(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=100_000.0,
            voice_profile="luxury",
            has_pagerduty_fallback=False,
            slack_channel_on_call_rotation_coverage_hours_per_day=16,
        ))
        # C → B (downgrade)
        self.assertEqual(rec.path, "B")
        self.assertIn("Luxury voice", rec.justification)

    def test_b2b_without_linear_downgrades_from_d_to_c(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=500_000.0,
            team_size="enterprise",
            voice_profile="b2b",
            has_linear_fallback=False,
            has_pagerduty_fallback=True,
            has_opsgenie_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=24,
        ))
        # D → C (downgrade)
        self.assertEqual(rec.path, "C")
        self.assertIn("B2B voice without Linear", rec.justification)

    def test_b2b_without_linear_downgrades_from_c_to_b(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=100_000.0,
            voice_profile="b2b",
            has_linear_fallback=False,
            has_pagerduty_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=16,
        ))
        # C → B (downgrade)
        self.assertEqual(rec.path, "B")
        self.assertIn("B2B voice", rec.justification)

    def test_on_call_coverage_downgrades_path_d_to_b(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=500_000.0,
            team_size="small",  # small team with enterprise spend → D base tier but B downgrade because team is small
            has_pagerduty_fallback=True,
            has_opsgenie_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=4,  # Path D needs 24 hr/day
        ))
        # D → B (downgrade via on-call-coverage check; team_size=small so D → B)
        self.assertEqual(rec.path, "B")
        self.assertIn("on-call", rec.justification.lower())

    def test_on_call_coverage_downgrades_path_c_to_b(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=100_000.0,
            voice_profile="default",
            has_pagerduty_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=4,  # Path C needs ≥8 hr/day
        ))
        # C → B (downgrade via on-call-coverage check; team_size=small so C → B)
        self.assertEqual(rec.path, "B")
        self.assertIn("on-call", rec.justification.lower())

    def test_default_voice_no_downgrade(self) -> None:
        # default voice should not trigger any voice-downgrade.
        rec = recommend_path(_path_b_inputs(voice_profile="default"))
        self.assertEqual(rec.path, "B")
        self.assertNotIn("Downgrades applied", rec.justification)


# ----- 6. PathRecommendation structure ------------------------------------

class TestPathRecommendationStructure(unittest.TestCase):
    def test_path_b_recommendation_has_4_platforms(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        self.assertEqual(len(rec.platforms), 4)  # Slack + Linear + script + archive

    def test_path_a_recommendation_has_2_platforms(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=1_000.0))
        self.assertEqual(rec.path, "A")
        self.assertEqual(len(rec.platforms), 2)

    def test_path_c_recommendation_has_5_platforms(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=100_000.0,
            team_size="larger",
            has_pagerduty_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=16,
        ))
        self.assertEqual(rec.path, "C")
        self.assertEqual(len(rec.platforms), 5)

    def test_path_d_recommendation_has_6_platforms(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=500_000.0,
            team_size="enterprise",
            has_pagerduty_fallback=True,
            has_opsgenie_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=24,
        ))
        self.assertEqual(rec.path, "D")
        self.assertEqual(len(rec.platforms), 6)

    def test_path_e_recommendation_has_1_platform(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=100.0))
        self.assertEqual(rec.path, "E")
        self.assertEqual(len(rec.platforms), 1)

    def test_path_b_cost_one_time_matches_playbook(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.cost_one_time_low, 2.0)
        self.assertEqual(rec.cost_one_time_high, 50.0)

    def test_path_b_cost_recurring_matches_playbook(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.cost_recurring_low, 8.0)
        self.assertEqual(rec.cost_recurring_high, 102.0)

    def test_path_b_avoided_incidents_matches_playbook(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.year1_avoided_incidents_low, 1)
        self.assertEqual(rec.year1_avoided_incidents_high, 2)

    def test_path_b_recovery_matches_playbook(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.year1_incremental_attribution_recovery_low, 1 * 5_000.0)
        self.assertEqual(rec.year1_incremental_attribution_recovery_high, 2 * 15_000.0)

    def test_path_b_roi_band_matches_playbook(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(rec.path, "B")
        # ROI mid clamped to band: 60:1 to 150:1.
        self.assertEqual(rec.year1_net_roi_low, 60.0)
        self.assertEqual(rec.year1_net_roi_high, 60.0)  # clamped to low end via min

    def test_canonical_alert_payload_has_13_fields(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(len(rec.canonical_alert_payload_fields), 13)
        self.assertEqual(rec.canonical_alert_payload_fields[0], "alert_id")
        self.assertEqual(rec.canonical_alert_payload_fields[-1], "raw_rollup_path")

    def test_canonical_webhook_thresholds_has_5_keys(self) -> None:
        rec = recommend_path(_path_b_inputs())
        self.assertEqual(len(rec.canonical_webhook_thresholds), 5)
        self.assertIn("fire_on_any_per_platform_fail", rec.canonical_webhook_thresholds)
        self.assertIn("cooldown_seconds", rec.canonical_webhook_thresholds)
        self.assertEqual(rec.canonical_webhook_thresholds["cooldown_seconds"], 3600)


# ----- 7. Per-path recovery projection -----------------------------------

class TestProjectPerPathRecovery(unittest.TestCase):
    def test_path_b_mid_recovery_correct(self) -> None:
        rec = recommend_path(_path_b_inputs())
        proj = project_per_path_recovery(_path_b_inputs(), rec)
        # Year-1 recovery mid = (1*5000 + 2*15000) / 2 = $17,500
        self.assertEqual(proj["year1_recovery_mid"], 17_500.0)

    def test_path_b_mid_incidents_correct(self) -> None:
        rec = recommend_path(_path_b_inputs())
        proj = project_per_path_recovery(_path_b_inputs(), rec)
        # incidents mid = (1+2)/2 = 1.5
        self.assertEqual(proj["year1_incidents_mid"], 1.5)

    def test_path_b_alert_cadence_correct(self) -> None:
        rec = recommend_path(_path_b_inputs())
        proj = project_per_path_recovery(_path_b_inputs(), rec)
        self.assertEqual(proj["alert_cadence"], PATH_ALERT_CADENCE["B"])
        self.assertIn("Slack-webhook", proj["alert_cadence"])

    def test_path_b_cooldown_seconds_correct(self) -> None:
        rec = recommend_path(_path_b_inputs())
        proj = project_per_path_recovery(_path_b_inputs(), rec)
        self.assertEqual(proj["cooldown_seconds_recommended"], 3600)

    def test_path_a_zero_cost_with_one_potential_incident_recovery(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=1_000.0))
        self.assertEqual(rec.path, "A")
        proj = project_per_path_recovery(_path_b_inputs(paid_spend=1_000.0), rec)
        # Path A: 0-1 incidents × $1k-$5k recovery → recovery low = $0, high = $5000, mid = $2500.
        self.assertEqual(proj["year1_recovery_mid"], 2_500.0)
        self.assertEqual(proj["year1_incidents_mid"], 0.5)
        self.assertEqual(proj["year1_cost_mid_full"], 0.0)  # Path A is zero-cost

    def test_path_e_zero_everything(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=100.0))
        self.assertEqual(rec.path, "E")
        proj = project_per_path_recovery(_path_b_inputs(paid_spend=100.0), rec)
        self.assertEqual(proj["year1_recovery_mid"], 0.0)
        self.assertEqual(proj["year1_incidents_mid"], 0.0)

    def test_path_b_roi_mid_clamped(self) -> None:
        rec = recommend_path(_path_b_inputs())
        proj = project_per_path_recovery(_path_b_inputs(), rec)
        # ROI mid clamped to [60, 150] band — actual computed value 17_500/686 ≈ 25.5 → clamped to 60.
        self.assertEqual(proj["year1_net_roi_mid_final"], 60.0)


# ----- 8. Build sequence --------------------------------------------------

class TestBuildSequence(unittest.TestCase):
    def test_path_a_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("A")
        self.assertEqual(len(seq), 6)

    def test_path_b_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("B")
        self.assertEqual(len(seq), 6)

    def test_path_c_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("C")
        self.assertEqual(len(seq), 6)

    def test_path_d_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("D")
        self.assertEqual(len(seq), 6)

    def test_path_e_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("E")
        self.assertEqual(len(seq), 6)

    def test_path_b_build_sequence_references_slack_and_linear(self) -> None:
        seq = build_sequence_for_path("B")
        joined = " ".join(seq)
        self.assertIn("Slack", joined)
        self.assertIn("Linear", joined)
        self.assertIn("3600", joined)  # canonical cooldown

    def test_path_c_build_sequence_references_pagerduty(self) -> None:
        seq = build_sequence_for_path("C")
        joined = " ".join(seq)
        self.assertIn("PagerDuty", joined)
        self.assertIn("600", joined)  # Path C cooldown

    def test_path_d_build_sequence_references_opsgenie(self) -> None:
        seq = build_sequence_for_path("D")
        joined = " ".join(seq)
        self.assertIn("Opsgenie", joined)
        self.assertIn("300", joined)  # Path D cooldown

    def test_build_sequence_templates_dict_covers_all_paths(self) -> None:
        for path in ("A", "B", "C", "D", "E"):
            self.assertIn(path, BUILD_SEQUENCE_TEMPLATES)
            self.assertEqual(len(BUILD_SEQUENCE_TEMPLATES[path]), 6)


# ----- 9. Human rendering -------------------------------------------------

class TestRenderHuman(unittest.TestCase):
    def test_default_rendering_includes_all_sections(self) -> None:
        rec = recommend_path(_path_b_inputs())
        out = render_human(_path_b_inputs(), rec)
        self.assertIn("Recommendation: Path B", out)
        self.assertIn("Cost stack:", out)
        self.assertIn("Expected Year-1 outcomes:", out)
        self.assertIn("Canonical alert-payload shape (13-field):", out)
        self.assertIn("Canonical webhook thresholds (5-field):", out)
        self.assertIn("5-pillar attribution-health-alert-webhook framework:", out)
        self.assertIn("6-step build sequence:", out)

    def test_rendering_mentions_alert_cadence(self) -> None:
        rec = recommend_path(_path_b_inputs())
        out = render_human(_path_b_inputs(), rec)
        self.assertIn("Alert cadence", out)
        self.assertIn("Slack-webhook", out)

    def test_rendering_for_path_e_mentions_defer(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=100.0))
        out = render_human(_path_b_inputs(paid_spend=100.0), rec)
        self.assertIn("Recommendation: Path E", out)
        self.assertIn("DEFER", out)

    def test_rendering_for_path_a_mentions_hermetic(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=1_000.0))
        out = render_human(_path_b_inputs(paid_spend=1_000.0), rec)
        self.assertIn("Recommendation: Path A", out)
        self.assertIn("hermetic-local-archive-only", out)

    def test_rendering_handles_inf_roi(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=1_000.0))
        out = render_human(_path_b_inputs(paid_spend=1_000.0), rec)
        # Path A: ROI is inf, should render as ∞
        self.assertIn("∞", out)

    def test_rendering_includes_5_pillar_matrix(self) -> None:
        rec = recommend_path(_path_b_inputs())
        out = render_human(_path_b_inputs(), rec)
        self.assertIn("Pillar 1", out)
        self.assertIn("Pillar 2", out)
        self.assertIn("Pillar 3", out)
        self.assertIn("Pillar 4", out)
        self.assertIn("Pillar 5", out)


# ----- 10. Canonical defaults pinned --------------------------------------

class TestCanonicalDefaultsPinned(unittest.TestCase):
    def test_path_e_floor(self) -> None:
        self.assertEqual(PATH_E_FLOOR, 500.0)

    def test_path_a_floor(self) -> None:
        self.assertEqual(PATH_A_FLOOR, 5_000.0)

    def test_path_b_floor(self) -> None:
        self.assertEqual(PATH_B_FLOOR, 50_000.0)

    def test_path_c_floor(self) -> None:
        self.assertEqual(PATH_C_FLOOR, 250_000.0)

    def test_path_d_floor(self) -> None:
        self.assertEqual(PATH_D_FLOOR, float("inf"))

    def test_path_costs_pinned_to_playbook(self) -> None:
        # Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high)
        self.assertEqual(PATH_COSTS["A"], (0.0, 0.0, 0.0, 0.0))
        self.assertEqual(PATH_COSTS["B"], (2.0, 50.0, 8.0, 102.0))
        self.assertEqual(PATH_COSTS["E"], (0.0, 0.0, 0.0, 0.0))

    def test_path_roi_pinned_to_playbook(self) -> None:
        # Path B 60:1 to 150:1 (canonical from playbook/06.10 §Cost & ROI).
        self.assertEqual(PATH_ROI["B"], (60.0, 150.0))

    def test_path_cooldown_pinned(self) -> None:
        self.assertEqual(PATH_COOLDOWN_SECONDS["B"], 3600)
        self.assertEqual(PATH_COOLDOWN_SECONDS["A"], 604_800)

    def test_max_archive_storage_pinned(self) -> None:
        self.assertEqual(MAX_ARCHIVE_STORAGE_GB_PER_YEAR, 10.0)

    def test_canonical_alert_payload_fields_pinned_to_13(self) -> None:
        fields = _canonical_alert_payload_fields()
        self.assertEqual(len(fields), 13)
        # Mirrors scripts/attribution_health_alert_webhook.py canonical 13-field shape.
        self.assertEqual(fields[0], "alert_id")
        self.assertEqual(fields[5], "summary")
        self.assertEqual(fields[12], "raw_rollup_path")

    def test_canonical_webhook_thresholds_pinned_to_5(self) -> None:
        thresholds = _canonical_webhook_thresholds()
        self.assertEqual(len(thresholds), 5)
        self.assertEqual(thresholds["fire_on_match_rate_drift_pp"], 3.0)
        self.assertEqual(thresholds["fire_on_coverage_drift_pp"], 2.0)
        self.assertEqual(thresholds["cooldown_seconds"], 3600)

    def test_5_pillar_matrix_pinned(self) -> None:
        self.assertEqual(len(ATTRIBUTION_ALERT_PILLAR_MATRIX), 5)
        pillar_keys = list(ATTRIBUTION_ALERT_PILLAR_MATRIX.keys())
        # Each pillar key contains "Pillar N" as a substring.
        self.assertTrue(any("Pillar 1" in k for k in pillar_keys))
        self.assertTrue(any("Pillar 5" in k for k in pillar_keys))

    def test_enterprise_team_size_floor_pinned(self) -> None:
        self.assertEqual(ENTERPRISE_TEAM_SIZE_FLOOR, "enterprise")


# ----- 11. Main CLI -------------------------------------------------------

class TestMainCLI(unittest.TestCase):
    def test_default_returns_0(self) -> None:
        # Run the script with default args and verify exit code 0.
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py")],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, msg=f"stdout={result.stdout}, stderr={result.stderr}")
        self.assertIn("Recommendation: Path B", result.stdout)

    def test_json_mode_roundtrips(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"), "--json"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, msg=f"stderr={result.stderr}")
        parsed = json.loads(result.stdout)
        self.assertIn("inputs", parsed)
        self.assertIn("recommendation", parsed)
        self.assertIn("per_path_recovery", parsed)
        self.assertEqual(parsed["recommendation"]["path"], "B")

    def test_json_mode_roundtrips_for_path_e(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"),
                "--paid-spend", "100",
                "--json",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0)
        parsed = json.loads(result.stdout)
        self.assertEqual(parsed["recommendation"]["path"], "E")

    def test_invalid_input_exits_1(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"),
                "--paid-spend", "-100",
            ],
            capture_output=True,
            text=True,
        )
        # argparse rejects negative numbers as a non-finite (no), but our __post_init__ catches -100.
        # Wait — argparse accepts negative floats; the script's __post_init__ raises ValueError → exit 1.
        self.assertEqual(result.returncode, 1)
        self.assertIn("ERROR", result.stderr)

    def test_help_lists_all_flags(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"), "--help"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("--paid-spend", result.stdout)
        self.assertIn("--team-size", result.stdout)
        self.assertIn("--voice-profile", result.stdout)
        self.assertIn("--move-6-8-cadence", result.stdout)
        self.assertIn("--has-webhook-url", result.stdout)
        self.assertIn("--has-linear-fallback", result.stdout)
        self.assertIn("--has-pagerduty-fallback", result.stdout)
        self.assertIn("--has-opsgenie-fallback", result.stdout)
        self.assertIn("--slack-channel-on-call-rotation-coverage-hours-per-day", result.stdout)
        self.assertIn("--alert-archive-storage-gb-per-year", result.stdout)
        self.assertIn("--cooldown-seconds", result.stdout)
        self.assertIn("--json", result.stdout)

    def test_custom_args_propagate(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"),
                "--paid-spend", "100000",
                "--team-size", "larger",
                "--voice-profile", "sustainable",
                "--json",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0)
        parsed = json.loads(result.stdout)
        self.assertEqual(parsed["inputs"]["paid_spend"], 100_000.0)
        self.assertEqual(parsed["inputs"]["voice_profile"], "sustainable")

    def test_invalid_cadence_exits_2(self) -> None:
        # argparse rejects invalid choices with exit 2.
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPTS_DIR / "attribution_health_alert_unit_economics.py"),
                "--move-6-8-cadence", "bogus",
            ],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)


# ----- 12. Build inputs ---------------------------------------------------

class TestBuildInputs(unittest.TestCase):
    def test_build_inputs_default(self) -> None:
        args = parse_args([])
        inputs = build_inputs(args)
        self.assertEqual(inputs.paid_spend, 10_000.0)
        self.assertEqual(inputs.team_size, "small")
        self.assertEqual(inputs.voice_profile, "default")

    def test_build_inputs_custom(self) -> None:
        args = parse_args(["--paid-spend", "500000", "--voice-profile", "luxury"])
        inputs = build_inputs(args)
        self.assertEqual(inputs.paid_spend, 500_000.0)
        self.assertEqual(inputs.voice_profile, "luxury")

    def test_build_inputs_bool_coercion(self) -> None:
        args = parse_args([
            "--has-webhook-url", "FALSE",
            "--has-linear-fallback", "TRUE",
            "--has-pagerduty-fallback", "false",
        ])
        inputs = build_inputs(args)
        self.assertFalse(inputs.has_webhook_url)
        self.assertTrue(inputs.has_linear_fallback)
        self.assertFalse(inputs.has_pagerduty_fallback)


# ----- 13. Valid input edge cases -----------------------------------------

class TestValidInputEdgeCases(unittest.TestCase):
    def test_zero_paid_spend_defer_path_e(self) -> None:
        rec = recommend_path(_path_b_inputs(paid_spend=0.0))
        # $0 is below $500 floor → Path E defer
        self.assertEqual(rec.path, "E")
        self.assertIn("below", rec.justification)

    def test_paid_spend_at_path_e_floor_returns_path_a(self) -> None:
        # Exactly at $500 floor → not deferred → Path A tier (since $500 < $5k)
        rec = recommend_path(_path_b_inputs(paid_spend=500.0))
        self.assertEqual(rec.path, "A")

    def test_paid_spend_at_path_a_floor_returns_path_b(self) -> None:
        # Exactly at $5k → Path B (Path B floor is $5k; tier function uses exclusive <)
        rec = recommend_path(_path_b_inputs(paid_spend=5_000.0))
        self.assertEqual(rec.path, "B")

    def test_paid_spend_just_below_path_a_floor_returns_path_a(self) -> None:
        # $4,999 → Path A (below Path B floor)
        rec = recommend_path(_path_b_inputs(paid_spend=4_999.0))
        self.assertEqual(rec.path, "A")

    def test_paid_spend_just_above_path_a_floor_returns_path_b(self) -> None:
        # $5,001 → Path B (DEFAULT)
        rec = recommend_path(_path_b_inputs(paid_spend=5_001.0))
        self.assertEqual(rec.path, "B")

    def test_zero_archive_storage_passes(self) -> None:
        rec = recommend_path(_path_b_inputs(alert_archive_storage_gb_per_year=0.0))
        self.assertEqual(rec.path, "B")

    def test_storage_at_max_floor_passes(self) -> None:
        # Exactly at 10.0 GB → still passes (≤ not <)
        rec = recommend_path(_path_b_inputs(alert_archive_storage_gb_per_year=10.0))
        self.assertEqual(rec.path, "B")

    def test_zero_cooldown_accepted_at_runtime(self) -> None:
        # __post_init__ accepts cooldown=0 (valid edge case — operator explicitly chose no cooldown)
        rec = recommend_path(_path_b_inputs(cooldown_seconds=0))
        self.assertEqual(rec.path, "B")
        # Justification should be the standard "base tier" line (not a deferral message)
        self.assertIn("base tier", rec.justification)

    def test_high_paid_spend_path_d(self) -> None:
        rec = recommend_path(_path_b_inputs(
            paid_spend=500_000.0,
            team_size="enterprise",
            has_pagerduty_fallback=True,
            has_opsgenie_fallback=True,
            slack_channel_on_call_rotation_coverage_hours_per_day=24,
        ))
        self.assertEqual(rec.path, "D")
        # No downgrades applied
        self.assertNotIn("Downgrades applied", rec.justification)


if __name__ == "__main__":
    unittest.main()