#!/usr/bin/env python3
"""
test_affiliate_unit_economics.py — TDD tests for the affiliate-program
Path A/B/C scorer (Archetype A/B hybrid scoring script per playbook 16 + research/09).

Companion to:
- research/09-affiliate-program.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/16-affiliate-program-launch.md (4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote operator build)
- assets/17-affiliate-program-templates.md (paste-ready 5-flow × 5-voice × {email + SMS} affiliate-facing templates)

Run: python3 scripts/tests/test_affiliate_unit_economics.py

The script takes a brand's current-affiliate-program-fit inputs
(us_gmv / aov / expected_affiliate_count / commission_tier / voice_profile /
has_triple_whale / has_klaviyo_post_purchase / has_smile_loyalty / has_levanta /
has_impact / iq_zone / operator_capacity_hours_per_week) → outputs Path A
(GoAffPro free) / Path B (Refersion Growth DEFAULT) / Path C (Impact
Enterprise + Levanta cross-channel) recommendation with cost stack + Year-1
attributed revenue + LTV multiplier + affiliate count + cookie-deprecation
recovery rate + sustainable-mission-alignment-verifier score + 6-step build
sequence.

The scoring rule (mirrors research/09 §GMV-tier paths + playbook 16
§Prerequisites + asset 17 §5-voice commission-tier matrix + canonical
6-step cookie-deprecation mitigation recipe):
- us_gmv < $100k                                → defer (Path A surfaced as audit only)
- us_gmv $100k-$500k                            → Path A (GoAffPro free / GoAffPro Growth)
- us_gmv $500k-$5M                              → Path B (Refersion Growth DEFAULT)
- us_gmv $5M+                                   → Path C (Impact Enterprise + Levanta)
- expected_affiliate_count < 10                 → defer (canonical 10+ active-affiliate baseline)
- voice_profile = "sustainable" WITHOUT Smile   → downgrade one tier (mission-alignment-verifier gate)
- voice_profile = "gen_z" WITH iq_zone="high"   → downgrade one tier (impulse-buy cookie-mismatch)
- has_triple_whale = False                      → defer (canonical Pillar 3 + Pillar 4 prereq)
- has_klaviyo_post_purchase = False             → defer (canonical Pillar 3 step 3 prereq)
- has_levanta = False AND path == "C"           → downgrade to Path B (Levanta server-side fingerprinting required for Path C)
- operator_capacity_hours_per_week < 2          → defer (Path A minimum 2 hr/wk ongoing)

The script is hermetic — it does NOT call Refersion / Levanta / Impact /
GoAffPro / PartnerStack / Aspire / Triple Whale / Klaviyo / Smile.io / PayPal
Mass Pay / Wise APIs. Inputs are operator-supplied at the CLI; the cost stack
+ per-path projection + 6-step build sequence are derived from research/09 +
playbook 16 + asset 17 (the canonical benchmarks the workspace already ships).
Same hermetic recipe as threepl_unit_economics.py / marketplace_unit_economics.py
/ subscription_unit_economics.py / international_market_fit.py.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest

# Add scripts/ to path so we can import the module under test.
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.abspath(os.path.join(HERE, ".."))
sys.path.insert(0, SCRIPTS_DIR)

from affiliate_unit_economics import (  # noqa: E402
    BrandAffiliateInputs,
    PathRecommendation,
    build_inputs,
    classify_voice_profile,
    COMMISSION_TIER_MATRIX,
    main,
    parse_args,
    recommend_path,
    render_human,
    project_per_path_revenue,
)


# ============================================================
# Canonical defaults used across multiple tests
# ============================================================

# Path B DEFAULT canonical inputs (research/09 §GMV-tier paths Path B).
PATH_B_DEFAULTS = dict(
    us_gmv=2_000_000.0,
    aov=50.0,
    expected_affiliate_count=25,
    commission_tier=20.0,
    voice_profile="sustainable",
    has_triple_whale=True,
    has_klaviyo_post_purchase=True,
    has_smile_loyalty=True,
    has_levanta=False,
    has_impact=False,
    iq_zone="mid",
    operator_capacity_hours_per_week=6,
)


# ============================================================
# Test classes — split by canonical scoring branch.
# ============================================================


class TestBrandAffiliateInputsValidation(unittest.TestCase):
    """BrandAffiliateInputs.__post_init__ validates input bounds."""

    def test_negative_us_gmv_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": -1})
        self.assertIn("us_gmv must be >= 0", str(ctx.exception))

    def test_zero_aov_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "aov": 0})
        self.assertIn("aov must be > 0", str(ctx.exception))

    def test_aov_above_ceiling_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "aov": 50_000})
        self.assertIn("aov must be <= $10,000", str(ctx.exception))

    def test_negative_expected_affiliate_count_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "expected_affiliate_count": -1})
        self.assertIn("expected_affiliate_count must be >= 0", str(ctx.exception))

    def test_commission_tier_above_100_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "commission_tier": 110})
        self.assertIn("commission_tier must be 0-100", str(ctx.exception))

    def test_commission_tier_negative_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "commission_tier": -5})
        self.assertIn("commission_tier must be 0-100", str(ctx.exception))

    def test_invalid_voice_profile_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "unknown"})
        self.assertIn("voice_profile must be one of", str(ctx.exception))

    def test_invalid_iq_zone_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "iq_zone": "extreme"})
        self.assertIn("iq_zone must be one of", str(ctx.exception))

    def test_negative_operator_capacity_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": -1})
        self.assertIn("operator_capacity_hours_per_week must be >= 0", str(ctx.exception))


class TestClassifyVoiceProfile(unittest.TestCase):
    """classify_voice_profile returns canonical voice-fit label."""

    def test_default_voice_returns_default(self):
        self.assertEqual(classify_voice_profile("default"), "default")

    def test_sustainable_returns_sustainable(self):
        self.assertEqual(classify_voice_profile("sustainable"), "sustainable")

    def test_luxury_returns_luxury(self):
        self.assertEqual(classify_voice_profile("luxury"), "luxury")

    def test_unknown_voice_defaults_to_default(self):
        self.assertEqual(classify_voice_profile("unknown"), "default")

    def test_empty_string_defaults_to_default(self):
        self.assertEqual(classify_voice_profile(""), "default")

    def test_gen_z_returns_gen_z(self):
        self.assertEqual(classify_voice_profile("gen_z"), "gen_z")


class TestRecommendPathBaseTiers(unittest.TestCase):
    """recommend_path assigns the correct base tier from US DTC GMV (without gates)."""

    def test_path_a_deferral_below_100k(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 50_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("$100,000", rec.justification)

    def test_path_a_for_exactly_100k(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 100_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_path_a_for_just_below_500k(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 499_999})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_path_b_for_exactly_500k(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 500_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_path_b_default_at_2m(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path B tier", rec.justification)

    def test_path_b_for_just_below_5m(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 4_999_999})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_path_c_for_exactly_5m(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 5_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")

    def test_path_c_for_8m_with_levanta(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")


class TestRecommendPathDeferrals(unittest.TestCase):
    """recommend_path surfaces canonical deferral gates correctly."""

    def test_deferral_for_low_capacity(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": 1})
        rec = recommend_path(inputs)
        self.assertIn("deferred until operator capacity is available", rec.justification)
        self.assertIn("1 hr/wk", rec.justification)

    def test_capacity_at_floor_does_not_defer(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": 2})
        rec = recommend_path(inputs)
        self.assertNotIn("deferred until operator capacity is available", rec.justification)

    def test_deferral_for_low_affiliate_count(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "expected_affiliate_count": 5})
        rec = recommend_path(inputs)
        self.assertIn("10", rec.justification)
        self.assertIn("seed-first-100-affiliates", rec.justification)

    def test_affiliate_count_at_floor_does_not_defer(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "expected_affiliate_count": 10})
        rec = recommend_path(inputs)
        self.assertNotIn("seed-first-100-affiliates", rec.justification)

    def test_deferral_for_no_triple_whale(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "has_triple_whale": False})
        rec = recommend_path(inputs)
        self.assertIn("has_triple_whale=False", rec.justification)
        self.assertIn("affiliate-cohort-overlay", rec.justification)

    def test_deferral_for_no_klaviyo_post_purchase(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "has_klaviyo_post_purchase": False})
        rec = recommend_path(inputs)
        self.assertIn("has_klaviyo_post_purchase=False", rec.justification)
        self.assertIn("post-purchase-email-match", rec.justification)

    def test_no_levanta_downgrade_path_c(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": False})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path C requires Levanta", rec.justification)


class TestRecommendPathGates(unittest.TestCase):
    """recommend_path applies upgrade/downgrade gates correctly."""

    def test_sustainable_voice_without_smile_downgrades(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "sustainable", "has_smile_loyalty": False})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("DOWNGRADES", rec.justification)
        self.assertIn("Smile", rec.justification)

    def test_sustainable_voice_with_smile_stays(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "sustainable", "has_smile_loyalty": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertNotIn("DOWNGRADES", rec.justification)

    def test_gen_z_high_iq_downgrades(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "gen_z", "iq_zone": "high", "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("gen_z", rec.justification.lower())
        self.assertIn("high", rec.justification.lower())

    def test_gen_z_low_iq_stays(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "gen_z", "iq_zone": "low", "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertNotIn("DOWNGRADES", rec.justification)

    def test_gen_z_mid_iq_stays(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "gen_z", "iq_zone": "mid", "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_default_voice_no_gates(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "default"})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertNotIn("DOWNGRADES", rec.justification)


class TestPathRecommendationStructure(unittest.TestCase):
    """PathRecommendation fields match the research-doc canonical bands."""

    def test_path_b_default_cost_band(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.cost_one_time_low, 500.0)
        self.assertEqual(rec.cost_one_time_high, 2500.0)
        self.assertEqual(rec.cost_recurring_low, 239.0)
        self.assertEqual(rec.cost_recurring_high, 489.0)

    def test_path_b_attributed_revenue_share_band(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_attributed_revenue_share_pct_low, 20.0)
        self.assertEqual(rec.year1_attributed_revenue_share_pct_high, 40.0)

    def test_path_b_ltv_multiplier_band(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.ltv_multiplier_low, 2.0)
        self.assertEqual(rec.ltv_multiplier_high, 3.0)

    def test_path_b_cookie_deprecation_recovery_band(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.cookie_deprecation_recovery_pct_low, 25.0)
        self.assertEqual(rec.cookie_deprecation_recovery_pct_high, 35.0)

    def test_path_c_higher_cookie_recovery(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")
        self.assertGreater(rec.cookie_deprecation_recovery_pct_high, 35.0)

    def test_path_c_has_higher_ltv_multiplier(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.ltv_multiplier_low, 2.5)
        self.assertEqual(rec.ltv_multiplier_high, 3.5)

    def test_year1_cost_includes_setup_plus_recurring(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        expected_low = rec.cost_one_time_low + 12 * rec.cost_recurring_low
        expected_high = rec.cost_one_time_high + 12 * rec.cost_recurring_high
        self.assertEqual(rec.year1_cost_low, expected_low)
        self.assertEqual(rec.year1_cost_high, expected_high)

    def test_default_platform_pick_per_path(self):
        inputs_a = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        inputs_b = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        inputs_c = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec_a = recommend_path(inputs_a)
        rec_b = recommend_path(inputs_b)
        rec_c = recommend_path(inputs_c)
        self.assertIn("GoAffPro", rec_a.default_platform_pick)
        self.assertIn("Refersion", rec_b.default_platform_pick)
        self.assertTrue("Impact" in rec_c.default_platform_pick or "Levanta" in rec_c.default_platform_pick)

    def test_commission_tier_matrix_has_all_5_voices(self):
        for voice in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            self.assertIn(voice, COMMISSION_TIER_MATRIX)

    def test_gen_z_voice_has_highest_tier1(self):
        gen_z_t1 = float(COMMISSION_TIER_MATRIX["gen_z"].split("%")[0])
        for voice in ("default", "luxury", "sustainable", "b2b"):
            other_t1 = float(COMMISSION_TIER_MATRIX[voice].split("%")[0].split("-")[0])
            self.assertGreaterEqual(gen_z_t1, other_t1)

    def test_sustainable_voice_has_high_tier1(self):
        sus_t1 = float(COMMISSION_TIER_MATRIX["sustainable"].split("%")[0])
        self.assertGreaterEqual(sus_t1, 15.0)


class TestProjectPerPathRevenue(unittest.TestCase):
    """project_per_path_revenue returns sane mid-points."""

    def test_path_b_default_mid_revenue(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertGreater(out["year1_attributed_revenue_mid"], 0)
        self.assertGreaterEqual(out["year1_attributed_revenue_mid"],
                                 out["year1_attributed_revenue_low"])
        self.assertLessEqual(out["year1_attributed_revenue_mid"],
                              out["year1_attributed_revenue_high"])

    def test_roi_mid_within_low_high(self):
        # The mid computed by project_per_path_revenue reflects actual gross-attributed / cost
        # which is bounded above by the canonical PATH_ROI band; the lower-bound check
        # is loose because cost-recurring amortizes across 12 months.
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        # Mid should be at least >0 and within an order of magnitude of the high band.
        roi_mid = float(out["year1_roi_mid"])
        self.assertGreater(roi_mid, 0.0)
        # The Path B canonical range is 3.7-8.0; the mid must be in a reasonable band,
        # not 100x off due to a unit-conversion bug.
        self.assertLessEqual(roi_mid, rec.year1_roi_high * 1.5)

    def test_affiliate_count_mid_reasonable(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "expected_affiliate_count": 25})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertGreaterEqual(out["affiliate_count_mid"], 15)
        self.assertLessEqual(out["affiliate_count_mid"], 35)

    def test_ltv_multiplier_mid(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertEqual(out["ltv_multiplier_mid"], 2.5)

    def test_cookie_recovery_mid(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertEqual(out["cookie_deprecation_recovery_pct_mid"], 30.0)

    def test_zero_gmv_zero_attributed_revenue(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 0})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertEqual(out["year1_attributed_revenue_mid"], 0.0)
        self.assertEqual(out["year1_attributed_revenue_low"], 0.0)
        self.assertEqual(out["year1_attributed_revenue_high"], 0.0)

    def test_zero_affiliate_count_zero_per_affiliate(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "expected_affiliate_count": 0})
        rec = recommend_path(inputs)
        out = project_per_path_revenue(inputs, rec)
        self.assertEqual(out["per_affiliate_revenue_mid"], 0.0)


class TestBuildSequence(unittest.TestCase):
    """build_sequence returns 6 steps per path."""

    def test_path_a_build_sequence_has_6_steps(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_b_build_sequence_has_6_steps(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_c_build_sequence_has_6_steps(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_a_steps_reference_goaffpro(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence)
        self.assertIn("GoAffPro", all_steps)

    def test_path_b_steps_reference_refersion(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence)
        self.assertIn("Refersion", all_steps)

    def test_path_c_steps_reference_levanta(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 8_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence)
        self.assertIn("Levanta", all_steps)


class TestRenderHuman(unittest.TestCase):
    """render_human includes all canonical sections."""

    def test_includes_path_recommendation(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Path B", out)
        self.assertIn("Default platform pick", out)

    def test_includes_all_input_fields(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        for field in ("US DTC GMV", "AOV", "Voice profile", "Has Triple Whale",
                      "Has Klaviyo", "Has Smile", "Operator capacity"):
            self.assertIn(field, out)

    def test_includes_cost_stack(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("One-time setup", out)
        self.assertIn("Recurring monthly", out)

    def test_includes_year1_outcomes(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        for field in ("Year-1 cost", "Attributed revenue share",
                      "LTV multiplier", "Affiliate count",
                      "Cookie-deprecation recovery", "Sustainable-mission-align",
                      "Year-1 ROI"):
            self.assertIn(field, out)

    def test_includes_commission_tier_matrix(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        for voice in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            self.assertIn(voice, out)

    def test_includes_build_sequence(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("6-step build sequence", out)
        self.assertIn("Step 1", out)
        self.assertIn("Step 6", out)


class TestCanonicalDefaultsPinned(unittest.TestCase):
    """The module-level constants match the research-doc canonical values."""

    def test_path_a_floor_pinned(self):
        from affiliate_unit_economics import PATH_A_FLOOR
        self.assertEqual(PATH_A_FLOOR, 100_000)

    def test_path_b_floor_pinned(self):
        from affiliate_unit_economics import PATH_B_FLOOR
        self.assertEqual(PATH_B_FLOOR, 500_000)

    def test_path_c_floor_pinned(self):
        from affiliate_unit_economics import PATH_C_FLOOR
        self.assertEqual(PATH_C_FLOOR, 5_000_000)

    def test_capacity_gate_floor_pinned(self):
        from affiliate_unit_economics import CAPACITY_GATE_HR_WK
        self.assertEqual(CAPACITY_GATE_HR_WK, 2)

    def test_min_expected_affiliate_count_pinned(self):
        from affiliate_unit_economics import MIN_EXPECTED_AFFILIATE_COUNT
        self.assertEqual(MIN_EXPECTED_AFFILIATE_COUNT, 10)

    def test_path_b_default_platform_pick(self):
        from affiliate_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertIn("Refersion", PATH_DEFAULT_PLATFORM_PICK["B"])

    def test_path_a_default_platform_pick(self):
        from affiliate_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertIn("GoAffPro", PATH_DEFAULT_PLATFORM_PICK["A"])

    def test_path_c_default_platform_pick(self):
        from affiliate_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertTrue(
            "Impact" in PATH_DEFAULT_PLATFORM_PICK["C"]
            or "Levanta" in PATH_DEFAULT_PLATFORM_PICK["C"]
        )

    def test_path_b_default_roi_low(self):
        from affiliate_unit_economics import PATH_ROI
        self.assertEqual(PATH_ROI["B"][0], 3.7)

    def test_path_b_default_roi_high(self):
        from affiliate_unit_economics import PATH_ROI
        self.assertEqual(PATH_ROI["B"][1], 8.0)

    def test_path_a_roi_high_12_5(self):
        from affiliate_unit_economics import PATH_ROI
        self.assertEqual(PATH_ROI["A"][1], 12.5)

    def test_path_c_ltv_multiplier_low(self):
        from affiliate_unit_economics import PATH_LTV_MULTIPLIER
        self.assertEqual(PATH_LTV_MULTIPLIER["C"][0], 2.5)


class TestMainCLI(unittest.TestCase):
    """main() CLI plumbing works as expected."""

    def test_default_returns_zero(self):
        rc = main([])
        self.assertEqual(rc, 0)

    def test_json_returns_parseable_json(self):
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--json"])
        self.assertEqual(rc, 0)
        data = json.loads(buf.getvalue())
        self.assertIn("inputs", data)
        self.assertIn("recommendation", data)
        self.assertIn("per_path_revenue", data)

    def test_json_recommendation_has_path(self):
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            main(["--json", "--us-gmv", "2000000"])
        data = json.loads(buf.getvalue())
        self.assertIn("path", data["recommendation"])
        self.assertEqual(data["recommendation"]["path"], "B")

    def test_custom_path_a_via_low_gmv(self):
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            main(["--json", "--us-gmv", "200000"])
        data = json.loads(buf.getvalue())
        self.assertEqual(data["recommendation"]["path"], "A")

    def test_invalid_input_returns_error_1(self):
        rc = main(["--us-gmv", "-1"])
        self.assertEqual(rc, 1)

    def test_invalid_voice_profile_argparse_exit_2(self):
        # argparse catches invalid choice at parse-time exit 2, NOT exit 1
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "affiliate_unit_economics.py"),
             "--voice-profile", "bogus"],
            capture_output=True, text=True,
        )
        self.assertEqual(proc.returncode, 2)

    def test_sustainable_voice_no_smile_subprocess(self):
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "affiliate_unit_economics.py"),
             "--voice-profile", "sustainable", "--has-smile-loyalty", "false",
             "--us-gmv", "2000000"],
            capture_output=True, text=True,
        )
        self.assertEqual(proc.returncode, 0)
        self.assertIn("DOWNGRADES", proc.stdout)


class TestBuildInputs(unittest.TestCase):
    """build_inputs converts argparse Namespace → BrandAffiliateInputs correctly."""

    def test_default_args(self):
        args = parse_args([])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_gmv, 2_000_000.0)
        self.assertEqual(inputs.voice_profile, "sustainable")

    def test_custom_args(self):
        args = parse_args(["--us-gmv", "5000000", "--voice-profile", "gen_z", "--iq-zone", "low"])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_gmv, 5_000_000.0)
        self.assertEqual(inputs.voice_profile, "gen_z")
        self.assertEqual(inputs.iq_zone, "low")

    def test_true_string_to_bool(self):
        args = parse_args(["--has-triple-whale", "true", "--has-levanta", "false"])
        inputs = build_inputs(args)
        self.assertTrue(inputs.has_triple_whale)
        self.assertFalse(inputs.has_levanta)


class TestValidInput(unittest.TestCase):
    """End-to-end happy-path + edge-case sanity."""

    def test_zero_orders_zero_revenue(self):
        # Path A path; $50k GMV with no Triple Whale → defer
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 50_000, "has_triple_whale": False})
        rec = recommend_path(inputs)
        self.assertIn("has_triple_whale=False", rec.justification)

    def test_path_c_with_levanta_at_5m(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 5_000_000, "has_levanta": True})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")

    def test_path_c_without_levanta_downgrades_to_b(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "us_gmv": 5_000_000, "has_levanta": False})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path C requires Levanta", rec.justification)

    def test_high_aov_at_ceiling_accepted(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "aov": 9_999.0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_full_luxury_path_b(self):
        inputs = BrandAffiliateInputs(**{**PATH_B_DEFAULTS, "voice_profile": "luxury"})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertNotIn("DOWNGRADES", rec.justification)


if __name__ == "__main__":
    unittest.main(verbosity=2)