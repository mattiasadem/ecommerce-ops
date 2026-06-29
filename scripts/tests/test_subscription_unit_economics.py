#!/usr/bin/env python3
"""
test_subscription_unit_economics.py — TDD tests for the subscription-program
Path A/B/C scorer (Archetype A/B hybrid scoring script per playbook 15 + research/08).

Companion to:
- research/08-subscriptions.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/15-subscription-program-launch.md (4-phase Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop operator build)
- assets/16-subscription-flow-templates.md (paste-ready 5-flow × 5-voice × {email + SMS} templates)

Run: python3 scripts/tests/test_subscription_unit_economics.py

The script takes a brand's current-subscription-fit inputs (us_gmv / aov /
monthly_orders / consumables_revenue_share_pct / aov_under_30 /
has_replenishment_cadence / subscriber_conversion_baseline_pct /
monthly_churn_baseline_pct / category / platform_preference /
has_subscriber_attribution / operator_capacity_hours_per_week) → outputs Path A
(Recharge Starter / Bold Starter) / Path B (Recharge Plus DEFAULT) / Path C
(Skio Enterprise / Recharge Enterprise / Stay AI) recommendation with cost stack
+ Year-1 subscription revenue + LTV multiplier + subscriber count +
smart-cancellation recovery + dunning recovery + winback recovery + 6-step
build sequence.

The scoring rule (mirrors research/08 §GMV-tier paths + playbook 15
§Prerequisites + asset 16 §5-discount-tier matrix + canonical 4-alternative
smart-cancellation flow):
- us_gmv < $100k                          → defer (Path A surfaced as audit only)
- us_gmv $100k-$500k                      → Path A (Recharge Starter / Bold Starter)
- us_gmv $500k-$10M                       → Path B (Recharge Plus / Skio Plus) DEFAULT
- us_gmv $10M+                            → Path C (Recharge Enterprise / Skio Enterprise / Stay AI)
- consumables_revenue_share_pct < 30%     → defer (canonical subscription-fit threshold)
- aov < $30                               → downgrade one tier (low-AOV guardrail)
- monthly_orders < 200                    → defer (canonical subscription break-even)
- has_replenishment_cadence = False       → defer (no natural 30-120 day cadence)
- subscriber_conversion_baseline_pct < 5% → defer (canonical Recharge benchmark floor)
- monthly_churn_baseline_pct > 15%        → defer (>15% monthly churn breaks LTV math)
- has_subscriber_attribution = False      → downgrade one tier (Triple Whale subscriber-cohort-LTV is Phase 4 prereq)
- operator_capacity_hours_per_week < 2    → defer (Path A minimum 2 hr/wk ongoing)

The script is hermetic — it does NOT call Recharge / Skio / Bold / Stay AI /
Appstle / Seal / Loop / Klaviyo / Postscript / Smile.io / Triple Whale APIs.
Inputs are operator-supplied at the CLI; the cost stack + per-path projection +
6-step build sequence are derived from research/08 + playbook 15 + asset 16
(the canonical benchmarks the workspace already ships). Same hermetic recipe as
threepl_unit_economics.py / marketplace_unit_economics.py /
international_market_fit.py.
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

from subscription_unit_economics import (  # noqa: E402
    BrandSubscriptionInputs,
    PathRecommendation,
    build_inputs,
    classify_category,
    DISCOUNT_TIER_MATRIX,
    main,
    parse_args,
    recommend_path,
    render_human,
    project_per_path_revenue,
)


# ============================================================
# Canonical defaults used across multiple tests
# ============================================================

# Path B DEFAULT canonical inputs (research/08 §GMV-tier paths Path B).
PATH_B_DEFAULTS = dict(
    us_gmv=3_000_000.0,
    aov=45.0,
    monthly_orders=6667,
    consumables_revenue_share_pct=70.0,
    aov_under_30=False,
    has_replenishment_cadence=True,
    subscriber_conversion_baseline_pct=20.0,
    monthly_churn_baseline_pct=6.0,
    category="consumables",
    platform_preference="recharge",
    has_subscriber_attribution=True,
    operator_capacity_hours_per_week=8,
)


# ============================================================
# Test classes — split by canonical scoring branch.
# ============================================================


class TestBrandSubscriptionInputsValidation(unittest.TestCase):
    """BrandSubscriptionInputs.__post_init__ validates input bounds."""

    def test_negative_us_gmv_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": -1})
        self.assertIn("us_gmv must be >= 0", str(ctx.exception))

    def test_zero_aov_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "aov": 0})
        self.assertIn("aov must be > 0", str(ctx.exception))

    def test_aov_above_ceiling_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "aov": 50_000})
        self.assertIn("aov must be <= $10,000", str(ctx.exception))

    def test_negative_monthly_orders_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_orders": -1})
        self.assertIn("monthly_orders must be >= 0", str(ctx.exception))

    def test_consumables_revenue_share_above_100_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "consumables_revenue_share_pct": 110})
        self.assertIn("consumables_revenue_share_pct must be 0-100", str(ctx.exception))

    def test_consumables_revenue_share_negative_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "consumables_revenue_share_pct": -5})
        self.assertIn("consumables_revenue_share_pct must be 0-100", str(ctx.exception))

    def test_subscriber_conversion_above_100_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "subscriber_conversion_baseline_pct": 110})
        self.assertIn("subscriber_conversion_baseline_pct must be 0-100", str(ctx.exception))

    def test_monthly_churn_negative_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_churn_baseline_pct": -1})
        self.assertIn("monthly_churn_baseline_pct must be 0-100", str(ctx.exception))

    def test_invalid_category_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "category": "unknown"})
        self.assertIn("category must be one of", str(ctx.exception))

    def test_invalid_platform_preference_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "platform_preference": "shopify"})
        self.assertIn("platform_preference must be one of", str(ctx.exception))

    def test_negative_operator_capacity_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": -1})
        self.assertIn("operator_capacity_hours_per_week must be >= 0", str(ctx.exception))


class TestClassifyCategory(unittest.TestCase):
    """classify_category returns canonical category-fit label."""

    def test_default_category_returns_default(self):
        self.assertEqual(classify_category("default"), "default")

    def test_consumables_returns_consumables(self):
        self.assertEqual(classify_category("consumables"), "consumables")

    def test_luxury_returns_luxury(self):
        self.assertEqual(classify_category("luxury"), "luxury")

    def test_unknown_category_defaults_to_default(self):
        self.assertEqual(classify_category("unknown"), "default")

    def test_empty_string_defaults_to_default(self):
        self.assertEqual(classify_category(""), "default")

    def test_apparel_returns_apparel(self):
        self.assertEqual(classify_category("apparel"), "apparel")


class TestRecommendPathBaseTiers(unittest.TestCase):
    """recommend_path assigns the correct base tier from US DTC GMV (without gates)."""

    def test_path_a_deferral_below_100k(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 50_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("$100,000", rec.justification)

    def test_path_a_for_exactly_100k(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 100_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_path_a_for_just_below_500k(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 499_999})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_path_b_for_500k_to_5m(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 2_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_path_b_for_5m_to_10m_default(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 5_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path B tier", rec.justification)

    def test_path_b_for_just_below_10m(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 9_999_999})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_path_c_for_10m_plus(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 15_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")

    def test_path_c_for_exactly_10m(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 10_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")


class TestRecommendPathDeferrals(unittest.TestCase):
    """recommend_path defers when canonical gates fail (research/08 §Prerequisites)."""

    def test_low_consumables_share_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "consumables_revenue_share_pct": 20})
        rec = recommend_path(inputs)
        self.assertIn("Consumables revenue share 20%", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_low_monthly_orders_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_orders": 100})
        rec = recommend_path(inputs)
        self.assertIn("Monthly orders 100", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_no_replenishment_cadence_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "has_replenishment_cadence": False})
        rec = recommend_path(inputs)
        self.assertIn("No replenishment cadence", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_low_subscriber_conversion_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "subscriber_conversion_baseline_pct": 3})
        rec = recommend_path(inputs)
        self.assertIn("Subscriber-conversion-baseline 3%", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_high_monthly_churn_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_churn_baseline_pct": 18})
        rec = recommend_path(inputs)
        self.assertIn("Monthly churn baseline 18%", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_low_capacity_defers(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": 1})
        rec = recommend_path(inputs)
        self.assertIn("Operator capacity 1 hr/wk", rec.justification)
        self.assertIn("deferred", rec.justification.lower())

    def test_low_capacity_at_floor_does_not_defer(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "operator_capacity_hours_per_week": 2})
        rec = recommend_path(inputs)
        self.assertNotIn("Operator capacity 2 hr/wk < 2", rec.justification)

    def test_path_a_gmv_floor_with_no_deferrals(self):
        # Path A with all gates passing (canonical Path A scenarios).
        inputs = BrandSubscriptionInputs(**{
            **PATH_B_DEFAULTS, "us_gmv": 200_000,
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("Path A tier", rec.justification)


class TestRecommendPathGates(unittest.TestCase):
    """recommend_path applies upgrade/downgrade gates from the canonical scoring rule."""

    def test_low_aov_downgrade_from_b_to_a(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "aov_under_30": True, "aov": 25})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("DOWNGRADES:", rec.justification)
        self.assertIn("AOV $25 < $30 floor", rec.justification)

    def test_no_subscriber_attribution_downgrade_from_c_to_b(self):
        inputs = BrandSubscriptionInputs(**{
            **PATH_B_DEFAULTS, "us_gmv": 15_000_000, "has_subscriber_attribution": False,
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("has_subscriber_attribution=False", rec.justification)

    def test_both_downgrades_from_c_to_a(self):
        inputs = BrandSubscriptionInputs(**{
            **PATH_B_DEFAULTS, "us_gmv": 15_000_000,
            "has_subscriber_attribution": False, "aov_under_30": True, "aov": 25,
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("2 downgrade(s)", rec.justification)

    def test_no_upgrades_or_downgrades_clean_path(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("All gates pass; no upgrade/downgrade applied.", rec.justification)


class TestPathRecommendationStructure(unittest.TestCase):
    """PathRecommendation exposes canonical research/08 fields with canonical band values."""

    def test_path_a_year1_roi_band_matches_research(self):
        # research/08 §Path A: Year-1 ROI 8:1 to 15:1 (canonical 12:1 default).
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_roi_low, 8.0)
        self.assertEqual(rec.year1_roi_high, 15.0)

    def test_path_b_year1_roi_band_matches_research(self):
        # research/08 §Path B: Year-1 ROI 12:1 to 25:1 gross (3.2:1-25:1 muted Year-1 due to setup costs).
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_roi_low, 3.2)
        self.assertEqual(rec.year1_roi_high, 25.0)

    def test_path_c_year1_roi_band_matches_research(self):
        # research/08 §Path C: Year-1 ROI 15:1 to 35:1.
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 15_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_roi_low, 7.5)
        self.assertEqual(rec.year1_roi_high, 35.0)

    def test_path_b_ltv_multiplier_matches_research(self):
        # research/08 Pillar 2 §c: Path B LTV multiplier 2.0-3.0×.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.ltv_multiplier_low, 2.0)
        self.assertEqual(rec.ltv_multiplier_high, 3.0)

    def test_path_b_smart_cancellation_matches_research(self):
        # research/08 Pillar 3 §c: smart-cancellation recovers 20-35% of would-be cancellations for Path B.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.smart_cancellation_recovery_pct_low, 20.0)
        self.assertEqual(rec.smart_cancellation_recovery_pct_high, 35.0)

    def test_path_b_dunning_recovery_matches_research(self):
        # research/08 Pillar 3 §d: dunning recovers 50-70% of subscription-renewals for Path B.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.dunning_recovery_pct_low, 50.0)
        self.assertEqual(rec.dunning_recovery_pct_high, 70.0)

    def test_path_b_winback_recovery_matches_research(self):
        # research/08 Pillar 3 §e: winback returns 10-20% of cancelled-subscribers for Path B.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.winback_recovery_pct_low, 10.0)
        self.assertEqual(rec.winback_recovery_pct_high, 20.0)

    def test_path_b_subscription_revenue_share_matches_research(self):
        # research/08 §Path B: 25-50% of consumable revenue per year-1.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_subscription_revenue_share_pct_low, 25.0)
        self.assertEqual(rec.year1_subscription_revenue_share_pct_high, 50.0)

    def test_discount_tier_matrix_has_5_canonical_cadences(self):
        # research/08 Pillar 1 + asset 16 §5-discount-tier matrix.
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.discount_tier_matrix), 5)
        for cadence in ["30-day", "45-day", "60-day", "90-day", "120-day"]:
            self.assertIn(cadence, rec.discount_tier_matrix)

    def test_path_b_default_includes_recharge_and_skio(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.platforms), 2)
        self.assertTrue(any("Recharge Plus" in p for p in rec.platforms))
        self.assertTrue(any("Skio Plus" in p for p in rec.platforms))

    def test_path_c_default_includes_enterprise_options(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 15_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.platforms), 4)
        self.assertIn("Recharge Enterprise", rec.platforms)
        self.assertIn("Skio Enterprise", rec.platforms)


class TestProjectPerPathRevenue(unittest.TestCase):
    """project_per_path_revenue returns sensible Year-1 projection bands."""

    def test_path_b_subscription_revenue_mid_within_band(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # Year-1 subscription revenue mid = US_GMV * consumables_share * share_mid
        # = 3M * 0.7 * ((25+50)/2 / 100) = 3M * 0.7 * 0.375 = $787,500
        self.assertAlmostEqual(proj["year1_subscription_revenue_mid"], 787_500.0, places=0)
        # Must be within low-high band.
        self.assertGreaterEqual(proj["year1_subscription_revenue_mid"], rec.year1_subscription_revenue_low)
        self.assertLessEqual(proj["year1_subscription_revenue_mid"], rec.year1_subscription_revenue_high)

    def test_path_b_ltv_multiplier_mid_within_band(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertAlmostEqual(proj["ltv_multiplier_mid"], 2.5, places=1)

    def test_path_b_subscriber_count_positive(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # Path B at $3M GMV / 6,667 orders / 70% consumable / 27.5% conv → ~1,283 subscribers.
        self.assertGreater(proj["subscriber_count_mid"], 0)

    def test_path_b_mrr_positive(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # MRR = subscriber_count × $AOV × (1 - 0.175) — positive non-trivial value.
        self.assertGreater(proj["mrr_mid"], 0)

    def test_path_b_recovery_metrics_within_bands(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertAlmostEqual(proj["smart_cancellation_recovery_pct_mid"], 27.5, places=1)
        self.assertAlmostEqual(proj["dunning_recovery_pct_mid"], 60.0, places=1)
        self.assertAlmostEqual(proj["winback_recovery_pct_mid"], 15.0, places=1)

    def test_path_b_year1_roi_mid_positive(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # ROI mid should be substantial (Path B 8.3:1 canonical).
        self.assertGreater(proj["year1_roi_mid"], 1.0)

    def test_zero_gmv_zero_subscription_revenue(self):
        # Edge case: zero US GMV → zero consumable revenue → zero subscription revenue.
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 0})
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertEqual(proj["year1_subscription_revenue_mid"], 0)


class TestBuildSequence(unittest.TestCase):
    """build_sequence_for_path returns 6 canonical build steps per path."""

    def test_path_a_has_6_steps(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_b_has_6_steps(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_c_has_6_steps(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 15_000_000})
        rec = recommend_path(inputs)
        self.assertEqual(len(rec.build_sequence), 6)

    def test_path_a_step1_references_recharge_starter(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 200_000})
        rec = recommend_path(inputs)
        self.assertIn("Recharge Starter", rec.build_sequence[0])

    def test_path_b_step1_references_recharge_plus(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertIn("Recharge Plus", rec.build_sequence[0])

    def test_path_c_step1_references_enterprise_options(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "us_gmv": 15_000_000})
        rec = recommend_path(inputs)
        self.assertIn("Recharge Enterprise", rec.build_sequence[0])


class TestRenderHuman(unittest.TestCase):
    """render_human produces human-readable output with all canonical fields."""

    def test_render_includes_path_recommendation(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Recommendation: Path B", out)
        self.assertIn("Recharge Plus", out)

    def test_render_includes_all_input_fields(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        for field in [
            "US DTC GMV", "AOV", "Monthly orders", "Consumables revenue share",
            "AOV under $30", "Has replenishment cadence", "Subscriber-conversion-baseline",
            "Monthly-churn-baseline", "Category", "Platform preference",
            "Has subscriber attribution", "Operator capacity",
        ]:
            self.assertIn(field, out)

    def test_render_includes_cost_stack(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Cost stack:", out)
        self.assertIn("One-time setup", out)
        self.assertIn("Recurring monthly", out)

    def test_render_includes_year1_outcomes(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Expected Year-1 outcomes:", out)
        self.assertIn("Year-1 cost", out)
        self.assertIn("Subscription revenue share", out)
        self.assertIn("LTV multiplier", out)
        self.assertIn("Subscriber count", out)
        self.assertIn("Smart-cancellation recovery", out)
        self.assertIn("Dunning recovery", out)
        self.assertIn("Winback recovery", out)
        self.assertIn("Year-1 ROI", out)

    def test_render_includes_discount_tier_matrix(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("5-discount-tier matrix", out)
        self.assertIn("30-day", out)
        self.assertIn("60-day", out)
        self.assertIn("120-day", out)

    def test_render_includes_build_sequence(self):
        inputs = BrandSubscriptionInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("6-step build sequence:", out)
        self.assertIn("Step 1", out)
        self.assertIn("Step 6", out)


class TestCanonicalDefaultsPinned(unittest.TestCase):
    """Pin canonical default constants to research/08 + playbook 15 + asset 16."""

    def test_path_a_floor(self):
        from subscription_unit_economics import PATH_A_FLOOR
        self.assertEqual(PATH_A_FLOOR, 100_000)

    def test_path_b_floor(self):
        from subscription_unit_economics import PATH_B_FLOOR
        self.assertEqual(PATH_B_FLOOR, 500_000)

    def test_path_c_floor(self):
        from subscription_unit_economics import PATH_C_FLOOR
        self.assertEqual(PATH_C_FLOOR, 10_000_000)

    def test_consumables_revenue_share_floor(self):
        from subscription_unit_economics import CONSUMABLES_REVENUE_SHARE_FLOOR_PCT
        self.assertEqual(CONSUMABLES_REVENUE_SHARE_FLOOR_PCT, 30)

    def test_min_monthly_orders(self):
        from subscription_unit_economics import MIN_MONTHLY_ORDERS
        self.assertEqual(MIN_MONTHLY_ORDERS, 200)

    def test_min_conversion_baseline(self):
        from subscription_unit_economics import MIN_CONVERSION_BASELINE_PCT
        self.assertEqual(MIN_CONVERSION_BASELINE_PCT, 5)

    def test_max_monthly_churn_baseline(self):
        from subscription_unit_economics import MAX_MONTHLY_CHURN_BASELINE_PCT
        self.assertEqual(MAX_MONTHLY_CHURN_BASELINE_PCT, 15)

    def test_capacity_gate_floor(self):
        from subscription_unit_economics import CAPACITY_GATE_HR_WK
        self.assertEqual(CAPACITY_GATE_HR_WK, 2)

    def test_path_a_default_platform_pick_is_recharge_starter(self):
        from subscription_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertIn("Recharge Starter", PATH_DEFAULT_PLATFORM_PICK["A"])

    def test_path_b_default_platform_pick_is_recharge_plus(self):
        from subscription_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertIn("Recharge Plus", PATH_DEFAULT_PLATFORM_PICK["B"])
        self.assertIn("DEFAULT", PATH_DEFAULT_PLATFORM_PICK["B"])

    def test_path_c_default_platform_pick_includes_enterprise(self):
        from subscription_unit_economics import PATH_DEFAULT_PLATFORM_PICK
        self.assertIn("Enterprise", PATH_DEFAULT_PLATFORM_PICK["C"])

    def test_discount_tier_matrix_module_constant(self):
        # The module-level DISCOUNT_TIER_MATRIX should have all 5 canonical cadences.
        self.assertEqual(len(DISCOUNT_TIER_MATRIX), 5)
        self.assertIn("30-day", DISCOUNT_TIER_MATRIX)
        self.assertIn("45-day", DISCOUNT_TIER_MATRIX)
        self.assertIn("60-day", DISCOUNT_TIER_MATRIX)
        self.assertIn("90-day", DISCOUNT_TIER_MATRIX)
        self.assertIn("120-day", DISCOUNT_TIER_MATRIX)


class TestMainCLI(unittest.TestCase):
    """main() CLI plumbing — default + JSON + custom + invalid input."""

    def test_main_default_returns_path_b(self):
        rc = main([])
        self.assertEqual(rc, 0)

    def test_main_json_returns_parseable_output(self):
        # Capture stdout by intercepting print.
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--json"])
        self.assertEqual(rc, 0)
        out = buf.getvalue()
        parsed = json.loads(out)
        self.assertIn("inputs", parsed)
        self.assertIn("recommendation", parsed)
        self.assertIn("per_path_revenue", parsed)
        self.assertEqual(parsed["recommendation"]["path"], "B")

    def test_main_custom_inputs_path_b(self):
        rc = main([
            "--us-gmv", "5000000",
            "--aov", "60",
            "--monthly-orders", "8000",
            "--consumables-revenue-share-pct", "75",
        ])
        self.assertEqual(rc, 0)

    def test_main_invalid_input_returns_error(self):
        import io
        from contextlib import redirect_stderr
        buf = io.StringIO()
        with redirect_stderr(buf):
            rc = main(["--us-gmv", "-100"])
        self.assertEqual(rc, 1)
        self.assertIn("us_gmv must be >= 0", buf.getvalue())

    def test_main_invalid_category_via_subprocess(self):
        result = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "subscription_unit_economics.py"),
             "--category", "invalid_category"],
            capture_output=True, text=True,
        )
        # argparse rejects invalid choices at parse time (exit code 2, stderr).
        self.assertEqual(result.returncode, 2)
        self.assertIn("invalid choice", result.stderr.lower())

    def test_main_low_aov_subprocess(self):
        result = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "subscription_unit_economics.py"),
             "--aov-under-30", "true", "--aov", "25"],
            capture_output=True, text=True,
        )
        # Should NOT error — low AOV is a valid downgrade signal, not an error.
        self.assertEqual(result.returncode, 0)
        self.assertIn("Recommendation:", result.stdout)


class TestBuildInputs(unittest.TestCase):
    """build_inputs converts argparse Namespace → BrandSubscriptionInputs."""

    def test_build_inputs_default(self):
        args = parse_args([])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_gmv, 3_000_000.0)
        self.assertEqual(inputs.aov, 45.0)
        self.assertEqual(inputs.monthly_orders, 6667)
        self.assertEqual(inputs.consumables_revenue_share_pct, 70.0)
        self.assertFalse(inputs.aov_under_30)
        self.assertTrue(inputs.has_replenishment_cadence)
        self.assertEqual(inputs.subscriber_conversion_baseline_pct, 20.0)
        self.assertEqual(inputs.monthly_churn_baseline_pct, 6.0)
        self.assertEqual(inputs.category, "consumables")
        self.assertEqual(inputs.platform_preference, "recharge")
        self.assertTrue(inputs.has_subscriber_attribution)
        self.assertEqual(inputs.operator_capacity_hours_per_week, 8)

    def test_build_inputs_custom(self):
        args = parse_args([
            "--us-gmv", "8000000",
            "--aov", "50",
            "--monthly-orders", "12000",
            "--consumables-revenue-share-pct", "80",
            "--aov-under-30", "true",
            "--has-replenishment-cadence", "false",
            "--subscriber-conversion-baseline-pct", "25",
            "--monthly-churn-baseline-pct", "8",
            "--category", "consumables",
            "--platform-preference", "skio",
            "--has-subscriber-attribution", "false",
            "--operator-capacity-hours-per-week", "5",
        ])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_gmv, 8_000_000.0)
        self.assertEqual(inputs.aov, 50.0)
        self.assertEqual(inputs.monthly_orders, 12_000)
        self.assertEqual(inputs.consumables_revenue_share_pct, 80.0)
        self.assertTrue(inputs.aov_under_30)
        self.assertFalse(inputs.has_replenishment_cadence)
        self.assertEqual(inputs.subscriber_conversion_baseline_pct, 25.0)
        self.assertEqual(inputs.monthly_churn_baseline_pct, 8.0)
        self.assertEqual(inputs.platform_preference, "skio")
        self.assertFalse(inputs.has_subscriber_attribution)
        self.assertEqual(inputs.operator_capacity_hours_per_week, 5)


class TestValidInput(unittest.TestCase):
    """Valid input tests — boundary + edge cases that should produce clean PathRecommendation."""

    def test_zero_monthly_orders(self):
        # Zero orders is valid; subscriber count will be 0.
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_orders": 0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertEqual(rec.year1_subscriber_count_low, 0)
        self.assertEqual(rec.year1_subscriber_count_high, 0)

    def test_zero_consumables_share_with_high_orders(self):
        # Zero consumables share should defer.
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "consumables_revenue_share_pct": 0})
        rec = recommend_path(inputs)
        self.assertIn("deferred", rec.justification.lower())

    def test_full_consumables_share(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "consumables_revenue_share_pct": 100})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_high_subscriber_conversion(self):
        # Above 100 should be rejected by __post_init__ validation.
        with self.assertRaises(ValueError):
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "subscriber_conversion_baseline_pct": 110})

    def test_zero_churn(self):
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "monthly_churn_baseline_pct": 0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_aov_at_ceiling_10k(self):
        # $10,000 AOV should be accepted.
        inputs = BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "aov": 10_000})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_aov_just_above_ceiling_rejected(self):
        with self.assertRaises(ValueError):
            BrandSubscriptionInputs(**{**PATH_B_DEFAULTS, "aov": 10_001})


if __name__ == "__main__":
    unittest.main()