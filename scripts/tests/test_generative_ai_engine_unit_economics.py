#!/usr/bin/env python3
"""TDD test suite for generative_ai_engine_unit_economics.py.

Tests the 13-input BrandGenerativeAiEngineInputs dataclass, the
recommend_path scoring rule, the 6-step build sequence, the human + JSON
rendering, the CLI plumbing, and the canonical Path A/B/C defaults
pinned against research/16 + playbook 23 + asset 26.

Test count: ~95 TDD tests across 13 test classes per the canonical
script-increment-tick recipe (v0.16.0):

1. TestInputsValidation (~10) — bounds checks + invalid values
2. TestClassifyVoiceProfile (~5) — voice-profile valid + invalid
3. TestRecommendPathBaseTiers (~10) — exact-boundary tests at the 3 GMV-tier floors
4. TestRecommendPathDeferrals (~10) — 5 deferral gates fire correctly + capacity at floor does NOT defer
5. TestRecommendPathGates (~7) — luxury + b2b + Path-C dedicated-team downgrade compose correctly
6. TestPathRecommendationStructure (~13) — every canonical band matches research/16 values
7. TestProjectPerPathRevenue (~7) — midpoint values + edge cases
8. TestBuildSequence (~9) — 6 steps per path with platform-specific references
9. TestRenderHuman (~8) — human output format + smoke test
10. TestCanonicalDefaultsPinned (~10) — PATH_A/B/C_FLOOR + cost/shares pinned
11. TestMainCLI (~6) — default returns 0 + JSON parses + invalid input exits 2
12. TestBuildInputs (~3) — default args + custom args
13. TestValidInputEdgeCases (~5) — zero GMV + zero creatives + capacity at floor + luxury with baseline + b2b with baseline

Total: ~103 tests.
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

from generative_ai_engine_unit_economics import (  # noqa: E402  -- sys.path insertion above
    AI_ENGINE_PILLAR_MATRIX,
    LUXURY_DOWNGRADE_ENABLED,
    B2B_DOWNGRADE_ENABLED,
    PATH_C_DEDICATED_AI_ENGINE_TEAM_DOWNGRADE_ENABLED,
    PATH_A_FLOOR,
    PATH_B_FLOOR,
    PATH_C_FLOOR,
    PATH_COSTS,
    PATH_DEFAULT_PLATFORM_PICK,
    PATH_INCREMENTAL_AI_ENGINE_REVENUE_SHARE_PCT,
    PATH_YEAR1_ROAS_LIFT_PCT,
    PATH_EMAIL_CTR_LIFT_PCT,
    PATH_ORGANIC_DISCOVERY_TRAFFIC_LIFT_PCT,
    PATH_CREATIVE_ITERATION_VELOCITY_MULTIPLIER,
    PATH_CREATIVE_PRODUCTION_COST_SAVINGS_PCT,
    PATH_AI_ENGINE_BUILD_CYCLE_MONTHS,
    PATH_ROI,
    PATH_PLATFORMS,
    PATH_RANK,
    RANK_PATH,
    BrandGenerativeAiEngineInputs,
    PathRecommendation,
    build_sequence_for_path,
    parse_args,
    build_inputs,
    main,
    project_per_path_revenue,
    recommend_path,
    render_human,
    MIN_CREATIVES_PER_WEEK,
    CAPACITY_GATE_HR_WK,
)


# ---------------------------------------------------------------------------
# 1. TestInputsValidation (~10 tests)
# ---------------------------------------------------------------------------
class TestInputsValidation(unittest.TestCase):
    """Validate BrandGenerativeAiEngineInputs bounds + invalid inputs."""

    def test_valid_full_pass(self):
        """All 13 fields valid + 5-voice profile — dataclass accepts."""
        BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=75,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=6,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_negative_gmv_raises(self):
        with self.assertRaises(ValueError):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=-1.0,
                creatives_per_week=50,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile="default",
                has_dedicated_ai_engine_team_capacity_hours_per_week=4,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_zero_gmv_accepted(self):
        BrandGenerativeAiEngineInputs(
            us_dtc_gmv=0.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_negative_creatives_raises(self):
        with self.assertRaises(ValueError):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=5_000_000.0,
                creatives_per_week=-1,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile="default",
                has_dedicated_ai_engine_team_capacity_hours_per_week=4,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_negative_capacity_raises(self):
        with self.assertRaises(ValueError):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=5_000_000.0,
                creatives_per_week=50,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile="default",
                has_dedicated_ai_engine_team_capacity_hours_per_week=-1,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_invalid_voice_profile_raises(self):
        with self.assertRaises(ValueError):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=5_000_000.0,
                creatives_per_week=50,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile="premium",  # invalid
                has_dedicated_ai_engine_team_capacity_hours_per_week=4,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_invalid_voice_profile_raises_uppercase(self):
        with self.assertRaises(ValueError):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=5_000_000.0,
                creatives_per_week=50,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile="LUXURY",  # invalid (case-sensitive)
                has_dedicated_ai_engine_team_capacity_hours_per_week=4,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_valid_voice_profiles_accepted(self):
        for vp in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            BrandGenerativeAiEngineInputs(
                us_dtc_gmv=5_000_000.0,
                creatives_per_week=50,
                has_move_10_ai_ad_creative_6mo=True,
                has_triple_whale_attribution=True,
                has_klaviyo_email_substrate=True,
                has_postscript_sms_substrate=True,
                has_ai_engine_creative_baseline=True,
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=False,
                voice_profile=vp,  # type: ignore[arg-type]
                has_dedicated_ai_engine_team_capacity_hours_per_week=4,
                has_openai_api=True,
                has_ai_orchestration_engine=True,
                has_jasper_brand_voice_llm=True,
            )

    def test_zero_creatives_accepted(self):
        BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=0,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_zero_capacity_accepted(self):
        BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=0,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )


# ---------------------------------------------------------------------------
# 2. TestClassifyVoiceProfile (~5 tests)
# ---------------------------------------------------------------------------
class TestClassifyVoiceProfile(unittest.TestCase):
    """Voice profile is validated in __post_init__ (canonical v0.16.0 pattern)."""

    def test_default_voice(self):
        inp = BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        self.assertEqual(inp.voice_profile, "default")

    def test_luxury_voice(self):
        inp = BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="luxury",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        self.assertEqual(inp.voice_profile, "luxury")

    def test_b2b_voice(self):
        inp = BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="b2b",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        self.assertEqual(inp.voice_profile, "b2b")

    def test_sustainable_voice(self):
        inp = BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="sustainable",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        self.assertEqual(inp.voice_profile, "sustainable")

    def test_gen_z_voice(self):
        inp = BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=50,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="gen_z",
            has_dedicated_ai_engine_team_capacity_hours_per_week=4,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        self.assertEqual(inp.voice_profile, "gen_z")


# ---------------------------------------------------------------------------
# 3. TestRecommendPathBaseTiers (~10 tests)
# ---------------------------------------------------------------------------
class TestRecommendPathBaseTiers(unittest.TestCase):
    """Exact-boundary tests for the 3 GMV-tier floors."""

    def _all_good(self, gmv: float) -> BrandGenerativeAiEngineInputs:
        """Helper: build a fully-passing BrandGenerativeAiEngineInputs at a given GMV."""
        return BrandGenerativeAiEngineInputs(
            us_dtc_gmv=gmv,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=True,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_path_a_at_floor_minus_one(self):
        rec = recommend_path(self._all_good(PATH_A_FLOOR - 1))
        self.assertEqual(rec.path, "A")

    def test_path_b_at_floor(self):
        rec = recommend_path(self._all_good(PATH_B_FLOOR))
        self.assertEqual(rec.path, "B")

    def test_path_b_at_midrange(self):
        rec = recommend_path(self._all_good(5_000_000.0))
        self.assertEqual(rec.path, "B")

    def test_path_c_at_floor(self):
        rec = recommend_path(self._all_good(PATH_C_FLOOR))
        self.assertEqual(rec.path, "C")

    def test_path_c_above_floor(self):
        rec = recommend_path(self._all_good(50_000_000.0))
        self.assertEqual(rec.path, "C")

    def test_path_b_below_path_c(self):
        rec = recommend_path(self._all_good(PATH_C_FLOOR - 1_000_000))
        self.assertEqual(rec.path, "B")

    def test_zero_gmv_returns_path_a(self):
        rec = recommend_path(self._all_good(0.0))
        self.assertEqual(rec.path, "A")

    def test_tiny_gmv_returns_path_a(self):
        rec = recommend_path(self._all_good(100_000.0))
        self.assertEqual(rec.path, "A")

    def test_exact_path_b_floor_returns_b(self):
        rec = recommend_path(self._all_good(PATH_B_FLOOR))
        self.assertEqual(rec.path, "B")

    def test_just_above_path_a_floor_returns_b(self):
        rec = recommend_path(self._all_good(PATH_A_FLOOR + 1))
        self.assertEqual(rec.path, "B")


# ---------------------------------------------------------------------------
# 4. TestRecommendPathDeferrals (~10 tests)
# ---------------------------------------------------------------------------
class TestRecommendPathDeferrals(unittest.TestCase):
    """5 deferral gates fire correctly; capacity at floor does NOT defer."""

    def _base(self, **overrides) -> BrandGenerativeAiEngineInputs:
        """Build a deferral-test base input with a passing GMV tier."""
        defaults = dict(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        defaults.update(overrides)
        return BrandGenerativeAiEngineInputs(**defaults)

    def test_no_deferral_when_all_passing(self):
        rec = recommend_path(self._base())
        self.assertIn(rec.path, ("A", "B", "C"))
        self.assertNotIn("DEFER", rec.justification)

    def test_low_creatives_defers(self):
        rec = recommend_path(self._base(creatives_per_week=MIN_CREATIVES_PER_WEEK - 1))
        self.assertIn("DEFER", rec.justification)
        self.assertIn("creatives_per_week", rec.justification)

    def test_no_move_10_defers(self):
        rec = recommend_path(self._base(has_move_10_ai_ad_creative_6mo=False))
        self.assertIn("DEFER", rec.justification)
        self.assertIn("has_move_10_ai_ad_creative_6mo", rec.justification)

    def test_no_triple_whale_defers(self):
        rec = recommend_path(self._base(has_triple_whale_attribution=False))
        self.assertIn("DEFER", rec.justification)
        self.assertIn("has_triple_whale_attribution", rec.justification)

    def test_no_klaviyo_defers(self):
        rec = recommend_path(self._base(has_klaviyo_email_substrate=False))
        self.assertIn("DEFER", rec.justification)
        self.assertIn("has_klaviyo_email_substrate", rec.justification)

    def test_no_postscript_defers(self):
        rec = recommend_path(self._base(has_postscript_sms_substrate=False))
        self.assertIn("DEFER", rec.justification)
        self.assertIn("has_postscript_sms_substrate", rec.justification)

    def test_low_capacity_defers(self):
        rec = recommend_path(
            self._base(has_dedicated_ai_engine_team_capacity_hours_per_week=CAPACITY_GATE_HR_WK - 1)
        )
        self.assertIn("DEFER", rec.justification)
        self.assertIn("capacity", rec.justification.lower())

    def test_capacity_at_floor_does_not_defer(self):
        rec = recommend_path(
            self._base(has_dedicated_ai_engine_team_capacity_hours_per_week=CAPACITY_GATE_HR_WK)
        )
        self.assertNotIn("DEFER", rec.justification)

    def test_multiple_deferrals_enumerated(self):
        rec = recommend_path(
            self._base(
                creatives_per_week=10,
                has_move_10_ai_ad_creative_6mo=False,
                has_triple_whale_attribution=False,
            )
        )
        self.assertIn("DEFER", rec.justification)
        self.assertIn("3 deferral gate", rec.justification)

    def test_all_deferrals_enumerated(self):
        rec = recommend_path(
            self._base(
                creatives_per_week=0,
                has_move_10_ai_ad_creative_6mo=False,
                has_triple_whale_attribution=False,
                has_klaviyo_email_substrate=False,
                has_postscript_sms_substrate=False,
                has_dedicated_ai_engine_team_capacity_hours_per_week=0,
            )
        )
        # 5 boolean gates + 1 capacity gate = 6 deferral gates
        self.assertIn("6 deferral gate", rec.justification)


# ---------------------------------------------------------------------------
# 5. TestRecommendPathGates (~7 tests)
# ---------------------------------------------------------------------------
class TestRecommendPathGates(unittest.TestCase):
    """3 downgrade gates: luxury / b2b / Path-C dedicated-team compose correctly."""

    def _base(self, **overrides) -> BrandGenerativeAiEngineInputs:
        defaults = dict(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        defaults.update(overrides)
        return BrandGenerativeAiEngineInputs(**defaults)

    def test_luxury_with_baseline_does_not_downgrade(self):
        rec = recommend_path(
            self._base(voice_profile="luxury", has_ai_engine_creative_baseline=True)
        )
        self.assertEqual(rec.path, "B")
        self.assertNotIn("downgrade", rec.justification.lower())

    def test_luxury_without_baseline_downgrades_b_to_a(self):
        rec = recommend_path(
            self._base(voice_profile="luxury", has_ai_engine_creative_baseline=False)
        )
        self.assertEqual(rec.path, "A")
        self.assertIn("downgrade", rec.justification.lower())
        self.assertIn("luxury", rec.justification.lower())

    def test_b2b_with_baseline_does_not_downgrade(self):
        rec = recommend_path(
            self._base(voice_profile="b2b", has_ai_customer_service_response_baseline=True)
        )
        self.assertEqual(rec.path, "B")
        self.assertNotIn("downgrade", rec.justification.lower())

    def test_b2b_without_baseline_downgrades_b_to_a(self):
        rec = recommend_path(
            self._base(voice_profile="b2b", has_ai_customer_service_response_baseline=False)
        )
        self.assertEqual(rec.path, "A")
        self.assertIn("downgrade", rec.justification.lower())
        self.assertIn("b2b", rec.justification.lower())

    def test_path_c_with_team_does_not_downgrade(self):
        rec = recommend_path(
            self._base(us_dtc_gmv=30_000_000.0, has_dedicated_ai_engine_team=True)
        )
        self.assertEqual(rec.path, "C")
        self.assertNotIn("downgrade", rec.justification.lower())

    def test_path_c_without_team_downgrades_to_b(self):
        rec = recommend_path(
            self._base(us_dtc_gmv=30_000_000.0, has_dedicated_ai_engine_team=False)
        )
        self.assertEqual(rec.path, "B")
        self.assertIn("downgrade", rec.justification.lower())
        self.assertIn("dedicated", rec.justification.lower())

    def test_path_a_luxury_does_not_downgrade_below_a(self):
        rec = recommend_path(
            self._base(
                us_dtc_gmv=500_000.0, voice_profile="luxury", has_ai_engine_creative_baseline=False
            )
        )
        self.assertEqual(rec.path, "A")


# ---------------------------------------------------------------------------
# 6. TestPathRecommendationStructure (~13 tests)
# ---------------------------------------------------------------------------
class TestPathRecommendationStructure(unittest.TestCase):
    """Every canonical band matches research/16 values (regression gate)."""

    def _base(self) -> BrandGenerativeAiEngineInputs:
        return BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_path_b_cost_stack_pinned(self):
        """research/16 §Cost & ROI: Path B cost stack $500-$2,565/mo recurring."""
        self.assertEqual(PATH_COSTS["B"], (2_000.0, 50_000.0, 500.0, 2_565.0))

    def test_path_a_cost_stack_pinned(self):
        """research/16 §Cost & ROI: Path A cost stack $20-$500/mo recurring."""
        self.assertEqual(PATH_COSTS["A"], (500.0, 2_000.0, 20.0, 500.0))

    def test_path_c_cost_stack_pinned(self):
        """research/16 §Cost & ROI: Path C cost stack $3,656-$6,044/mo recurring."""
        self.assertEqual(PATH_COSTS["C"], (50_000.0, 250_000.0, 3_656.0, 6_044.0))

    def test_path_b_year1_roas_lift_pinned(self):
        """research/16 §Cost & ROI: Path B 10-30% Year-1 ROAS lift."""
        self.assertEqual(PATH_YEAR1_ROAS_LIFT_PCT["B"], (10.0, 30.0))

    def test_path_b_email_ctr_lift_pinned(self):
        """research/16 §Cost & ROI: Path B 5-20% email-CTR lift."""
        self.assertEqual(PATH_EMAIL_CTR_LIFT_PCT["B"], (5.0, 20.0))

    def test_path_b_organic_lift_pinned(self):
        """research/16 §Cost & ROI: Path B 10-30% organic-discovery-traffic lift."""
        self.assertEqual(PATH_ORGANIC_DISCOVERY_TRAFFIC_LIFT_PCT["B"], (10.0, 30.0))

    def test_path_b_velocity_multiplier_pinned(self):
        """research/16 §Cost & ROI: Path B 2-4x creative-iteration-velocity multiplier."""
        self.assertEqual(PATH_CREATIVE_ITERATION_VELOCITY_MULTIPLIER["B"], (2.0, 4.0))

    def test_path_b_cost_savings_pinned(self):
        """research/16 §Cost & ROI: Path B 50-70% creative-production-cost-savings."""
        self.assertEqual(PATH_CREATIVE_PRODUCTION_COST_SAVINGS_PCT["B"], (50.0, 70.0))

    def test_path_b_build_cycle_pinned(self):
        """research/16 §Cost & ROI: Path B 6-18 months build cycle."""
        self.assertEqual(PATH_AI_ENGINE_BUILD_CYCLE_MONTHS["B"], (6, 18))

    def test_path_b_roi_pinned(self):
        """research/16 §Cost & ROI: Path B 6-187x Year-1 ROI (3:1 default at $5M base)."""
        self.assertEqual(PATH_ROI["B"], (6.0, 187.0))

    def test_path_b_incremental_share_pinned(self):
        """research/16 §Cost & ROI: Path B 3-15% Year-1 incremental AI-engine-revenue share."""
        self.assertEqual(PATH_INCREMENTAL_AI_ENGINE_REVENUE_SHARE_PCT["B"], (3.0, 15.0))

    def test_path_b_platforms_contains_pencil_pro(self):
        rec = recommend_path(self._base())
        self.assertEqual(rec.path, "B")
        self.assertTrue(
            any("Pencil Pro" in p for p in rec.platforms),
            f"Path B should include Pencil Pro platform: {rec.platforms}",
        )

    def test_path_b_pillar_matrix_has_5_pillars(self):
        self.assertEqual(len(AI_ENGINE_PILLAR_MATRIX), 5)
        for i in range(1, 6):
            self.assertTrue(
                any(k.startswith(f"Pillar {i}") for k in AI_ENGINE_PILLAR_MATRIX),
                f"Pillar {i} missing from AI_ENGINE_PILLAR_MATRIX",
            )


# ---------------------------------------------------------------------------
# 7. TestProjectPerPathRevenue (~7 tests)
# ---------------------------------------------------------------------------
class TestProjectPerPathRevenue(unittest.TestCase):
    """project_per_path_revenue returns the right shape + sane values."""

    def _base(self) -> BrandGenerativeAiEngineInputs:
        return BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_returns_dict(self):
        rec = recommend_path(self._base())
        out = project_per_path_revenue(self._base(), rec)
        self.assertIsInstance(out, dict)
        self.assertEqual(out["path"], "B")
        self.assertEqual(out["us_dtc_gmv"], 5_000_000.0)

    def test_year1_cost_low_matches_rec(self):
        rec = recommend_path(self._base())
        out = project_per_path_revenue(self._base(), rec)
        self.assertEqual(out["year1_cost_low"], rec.year1_cost_low)

    def test_year1_incremental_revenue_at_5m(self):
        rec = recommend_path(self._base())
        out = project_per_path_revenue(self._base(), rec)
        # Path B at $5M: 3-15% of $5M = $150k-$750k
        self.assertEqual(out["year1_incremental_ai_engine_revenue_low"], 150_000.0)
        self.assertEqual(out["year1_incremental_ai_engine_revenue_high"], 750_000.0)

    def test_year1_roi_band_pinned(self):
        rec = recommend_path(self._base())
        out = project_per_path_revenue(self._base(), rec)
        self.assertEqual(out["year1_roi_low"], 6.0)
        self.assertEqual(out["year1_roi_high"], 187.0)

    def test_path_a_zero_gmv_zero_revenue(self):
        inp = self._base()
        inp.us_dtc_gmv = 0.0
        rec = recommend_path(inp)
        out = project_per_path_revenue(inp, rec)
        self.assertEqual(out["year1_incremental_ai_engine_revenue_low"], 0.0)
        self.assertEqual(out["year1_incremental_ai_engine_revenue_high"], 0.0)

    def test_path_c_at_30m_uses_path_c_bands(self):
        inp = self._base()
        inp.us_dtc_gmv = 30_000_000.0
        inp.has_dedicated_ai_engine_team = True
        rec = recommend_path(inp)
        self.assertEqual(rec.path, "C")
        out = project_per_path_revenue(inp, rec)
        # Path C at $30M: 5-25% of $30M = $1.5M-$7.5M
        self.assertEqual(out["year1_incremental_ai_engine_revenue_low"], 1_500_000.0)
        self.assertEqual(out["year1_incremental_ai_engine_revenue_high"], 7_500_000.0)

    def test_creative_velocity_multiplier_pinned(self):
        rec = recommend_path(self._base())
        out = project_per_path_revenue(self._base(), rec)
        self.assertEqual(out["creative_iteration_velocity_multiplier_low"], 2.0)
        self.assertEqual(out["creative_iteration_velocity_multiplier_high"], 4.0)


# ---------------------------------------------------------------------------
# 8. TestBuildSequence (~9 tests)
# ---------------------------------------------------------------------------
class TestBuildSequence(unittest.TestCase):
    """6 steps per path with platform-specific references."""

    def test_path_a_6_steps(self):
        seq = build_sequence_for_path("A")
        self.assertEqual(len(seq), 6)

    def test_path_b_6_steps(self):
        seq = build_sequence_for_path("B")
        self.assertEqual(len(seq), 6)

    def test_path_c_6_steps(self):
        seq = build_sequence_for_path("C")
        self.assertEqual(len(seq), 6)

    def test_path_a_step1_mentions_gpt4o(self):
        seq = build_sequence_for_path("A")
        self.assertIn("GPT-4o", seq[0])

    def test_path_b_step1_mentions_pencil(self):
        seq = build_sequence_for_path("B")
        self.assertIn("Pencil Pro", seq[0])

    def test_path_c_step1_mentions_fine_tuning(self):
        seq = build_sequence_for_path("C")
        self.assertIn("fine-tuning", seq[0].lower())

    def test_path_b_steps_mention_jasper(self):
        seq = build_sequence_for_path("B")
        self.assertTrue(any("Jasper" in s for s in seq), "Path B should mention Jasper")

    def test_path_b_steps_mention_midjourney(self):
        seq = build_sequence_for_path("B")
        self.assertTrue(any("Midjourney" in s for s in seq), "Path B should mention Midjourney")

    def test_path_c_steps_mention_runway(self):
        seq = build_sequence_for_path("C")
        self.assertTrue(any("Runway" in s for s in seq), "Path C should mention Runway")


# ---------------------------------------------------------------------------
# 9. TestRenderHuman (~8 tests)
# ---------------------------------------------------------------------------
class TestRenderHuman(unittest.TestCase):
    """Human output format + smoke test."""

    def _base(self) -> BrandGenerativeAiEngineInputs:
        return BrandGenerativeAiEngineInputs(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )

    def test_render_includes_path(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("Path B", out)

    def test_render_includes_gmv(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("5,000,000", out)

    def test_render_includes_5_pillars(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        for i in range(1, 6):
            self.assertIn(f"Pillar {i}", out)

    def test_render_includes_cost_stack(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("One-time cost", out)
        self.assertIn("Recurring", out)
        self.assertIn("Year-1 cost stack", out)

    def test_render_includes_build_sequence(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("6-step build sequence", out)
        self.assertIn("Step 1", out)
        self.assertIn("Step 6", out)

    def test_render_includes_voice_profile(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("Voice profile:", out)
        self.assertIn("default", out)

    def test_render_contains_justification(self):
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertIn("Justification:", out)
        self.assertIn("canonical tier", out)

    def test_render_smoke(self):
        """No exceptions + non-empty output."""
        rec = recommend_path(self._base())
        out = render_human(self._base(), rec)
        self.assertGreater(len(out), 1000, "render_human output too short")
        self.assertIn("=" * 78, out)


# ---------------------------------------------------------------------------
# 10. TestCanonicalDefaultsPinned (~10 tests)
# ---------------------------------------------------------------------------
class TestCanonicalDefaultsPinned(unittest.TestCase):
    """PATH_A/B/C_FLOOR + cost/shares pinned (regression gate)."""

    def test_path_a_floor(self):
        self.assertEqual(PATH_A_FLOOR, 1_000_000.0)

    def test_path_b_floor(self):
        self.assertEqual(PATH_B_FLOOR, 1_000_000.0)

    def test_path_c_floor(self):
        self.assertEqual(PATH_C_FLOOR, 25_000_000.0)

    def test_min_creatives_per_week(self):
        self.assertEqual(MIN_CREATIVES_PER_WEEK, 50)

    def test_capacity_gate_hr_wk(self):
        self.assertEqual(CAPACITY_GATE_HR_WK, 4)

    def test_luxury_downgrade_enabled(self):
        self.assertTrue(LUXURY_DOWNGRADE_ENABLED)

    def test_b2b_downgrade_enabled(self):
        self.assertTrue(B2B_DOWNGRADE_ENABLED)

    def test_path_c_dedicated_team_downgrade_enabled(self):
        self.assertTrue(PATH_C_DEDICATED_AI_ENGINE_TEAM_DOWNGRADE_ENABLED)

    def test_path_rank_ordering(self):
        self.assertEqual(PATH_RANK["A"], 0)
        self.assertEqual(PATH_RANK["B"], 1)
        self.assertEqual(PATH_RANK["C"], 2)

    def test_rank_path_round_trip(self):
        for k, v in PATH_RANK.items():
            self.assertEqual(RANK_PATH[v], k)


# ---------------------------------------------------------------------------
# 11. TestMainCLI (~6 tests)
# ---------------------------------------------------------------------------
class TestMainCLI(unittest.TestCase):
    """default returns 0 + JSON parses + invalid input exits 2."""

    def test_default_returns_0(self):
        result = main([])
        self.assertEqual(result, 0)

    def test_default_prints_human_output(self):
        import io
        from contextlib import redirect_stdout
        f = io.StringIO()
        with redirect_stdout(f):
            result = main([])
        self.assertEqual(result, 0)
        out = f.getvalue()
        self.assertIn("Recommended Path:", out)
        self.assertIn("Path B", out)

    def test_json_flag_returns_0(self):
        import io
        from contextlib import redirect_stdout
        f = io.StringIO()
        with redirect_stdout(f):
            result = main(["--json"])
        self.assertEqual(result, 0)
        out = f.getvalue()
        # Must be valid JSON
        data = json.loads(out)
        self.assertEqual(data["recommendation"]["path"], "B")

    def test_json_flag_includes_inputs(self):
        import io
        from contextlib import redirect_stdout
        f = io.StringIO()
        with redirect_stdout(f):
            result = main(["--json", "--voice-profile", "luxury"])
        self.assertEqual(result, 0)
        out = f.getvalue()
        data = json.loads(out)
        self.assertEqual(data["inputs"]["voice_profile"], "luxury")

    def test_invalid_voice_profile_exits_2(self):
        import io
        from contextlib import redirect_stderr
        f = io.StringIO()
        with redirect_stderr(f):
            result = main(["--voice-profile", "premium"])
        self.assertEqual(result, 2)
        self.assertIn("Input validation error", f.getvalue())

    def test_custom_gmv(self):
        import io
        from contextlib import redirect_stdout
        f = io.StringIO()
        with redirect_stdout(f):
            result = main(["--us-dtc-gmv", "30000000", "--has-dedicated-ai-engine-team", "true"])
        self.assertEqual(result, 0)
        out = f.getvalue()
        self.assertIn("Path C", out)
        self.assertIn("30,000,000", out)


# ---------------------------------------------------------------------------
# 12. TestBuildInputs (~3 tests)
# ---------------------------------------------------------------------------
class TestBuildInputs(unittest.TestCase):
    """Default args + custom args."""

    def test_default_args_builds_inputs(self):
        args = parse_args([])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_dtc_gmv, 5_000_000.0)
        self.assertEqual(inputs.creatives_per_week, 75)
        self.assertEqual(inputs.voice_profile, "default")
        self.assertTrue(inputs.has_move_10_ai_ad_creative_6mo)
        self.assertTrue(inputs.has_triple_whale_attribution)
        self.assertTrue(inputs.has_klaviyo_email_substrate)
        self.assertTrue(inputs.has_postscript_sms_substrate)
        self.assertTrue(inputs.has_ai_engine_creative_baseline)
        self.assertTrue(inputs.has_ai_customer_service_response_baseline)
        self.assertFalse(inputs.has_dedicated_ai_engine_team)
        self.assertEqual(inputs.has_dedicated_ai_engine_team_capacity_hours_per_week, 6)
        self.assertTrue(inputs.has_openai_api)
        self.assertTrue(inputs.has_ai_orchestration_engine)
        self.assertTrue(inputs.has_jasper_brand_voice_llm)

    def test_custom_args_builds_inputs(self):
        args = parse_args(
            [
                "--us-dtc-gmv", "1000000",
                "--creatives-per-week", "50",
                "--voice-profile", "luxury",
                "--has-ai-engine-creative-baseline", "false",
                "--has-dedicated-ai-engine-team", "true",
            ]
        )
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_dtc_gmv, 1_000_000.0)
        self.assertEqual(inputs.creatives_per_week, 50)
        self.assertEqual(inputs.voice_profile, "luxury")
        self.assertFalse(inputs.has_ai_engine_creative_baseline)
        self.assertTrue(inputs.has_dedicated_ai_engine_team)

    def test_parse_args_boolean_coercion(self):
        """The lambda s: s.lower() == "true" coerces 'true' / 'false' to bool."""
        args = parse_args(["--has-move-10-ai-ad-creative-6mo", "TRUE"])
        self.assertTrue(args.has_move_10_ai_ad_creative_6mo)
        args = parse_args(["--has-move-10-ai-ad-creative-6mo", "False"])
        self.assertFalse(args.has_move_10_ai_ad_creative_6mo)
        args = parse_args(["--has-move-10-ai-ad-creative-6mo", "true"])
        self.assertTrue(args.has_move_10_ai_ad_creative_6mo)


# ---------------------------------------------------------------------------
# 13. TestValidInputEdgeCases (~5 tests)
# ---------------------------------------------------------------------------
class TestValidInputEdgeCases(unittest.TestCase):
    """Edge cases: zero GMV, zero creatives, capacity at floor, etc."""

    def _base(self, **overrides) -> BrandGenerativeAiEngineInputs:
        defaults = dict(
            us_dtc_gmv=5_000_000.0,
            creatives_per_week=100,
            has_move_10_ai_ad_creative_6mo=True,
            has_triple_whale_attribution=True,
            has_klaviyo_email_substrate=True,
            has_postscript_sms_substrate=True,
            has_ai_engine_creative_baseline=True,
            has_ai_customer_service_response_baseline=True,
            has_dedicated_ai_engine_team=False,
            voice_profile="default",
            has_dedicated_ai_engine_team_capacity_hours_per_week=8,
            has_openai_api=True,
            has_ai_orchestration_engine=True,
            has_jasper_brand_voice_llm=True,
        )
        defaults.update(overrides)
        return BrandGenerativeAiEngineInputs(**defaults)

    def test_zero_gmv_returns_path_a(self):
        rec = recommend_path(self._base(us_dtc_gmv=0.0))
        self.assertEqual(rec.path, "A")

    def test_zero_creatives_defers(self):
        rec = recommend_path(self._base(creatives_per_week=0))
        self.assertIn("DEFER", rec.justification)

    def test_capacity_at_floor_does_not_defer(self):
        rec = recommend_path(
            self._base(has_dedicated_ai_engine_team_capacity_hours_per_week=CAPACITY_GATE_HR_WK)
        )
        self.assertNotIn("DEFER", rec.justification)

    def test_luxury_with_baseline_at_high_gmv_still_path_c(self):
        """Voice=luxury + has_baseline + 30M GMV + has_team = Path C, no downgrade."""
        rec = recommend_path(
            self._base(
                us_dtc_gmv=30_000_000.0,
                voice_profile="luxury",
                has_ai_engine_creative_baseline=True,
                has_dedicated_ai_engine_team=True,
            )
        )
        self.assertEqual(rec.path, "C")

    def test_b2b_with_baseline_at_high_gmv_still_path_c(self):
        """Voice=b2b + has_baseline + 30M GMV + has_team = Path C, no downgrade."""
        rec = recommend_path(
            self._base(
                us_dtc_gmv=30_000_000.0,
                voice_profile="b2b",
                has_ai_customer_service_response_baseline=True,
                has_dedicated_ai_engine_team=True,
            )
        )
        self.assertEqual(rec.path, "C")


if __name__ == "__main__":
    unittest.main()
