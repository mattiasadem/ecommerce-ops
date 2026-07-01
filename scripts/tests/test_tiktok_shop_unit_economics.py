#!/usr/bin/env python3
"""
test_tiktok_shop_unit_economics.py — TDD tests for the TikTok Shop /
live-commerce Path A/B/C scorer (Archetype A/B hybrid scoring script per
playbook 18 + research/11).

Companion to:
- research/11-tiktok-shop-live-commerce.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/18-tiktok-shop-live-launch.md (4-phase Creator-affiliate-onboard → Shoppable-video-ads → LIVE-shopping-launch → Steady-state operator build)
- assets/19-tiktok-shop-creator-briefs.md (paste-ready per-voice per-SKU-archetype creator-brief templates)

Run: python3 scripts/tests/test_tiktok_shop_unit_economics.py

The script takes a brand's current-TikTok-Shop-fit inputs
(us_dtc_gmv / sku_count / sku_archetype_distribution / gross_margin_pct /
has_tiktok_business_account / has_tiktok_shop_seller_center /
has_shopify_tiktok_channel / has_klaviyo_tiktok_channel /
has_triple_whale_tiktok_attribution / creator_affiliate_pool_size /
voice_profile / has_live_shopping_studio_capacity_hours_per_week) →
outputs Path A (creator-affiliate-only + shoppable-video-ads $0/mo <$500k
GMV) / Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping
4-hour-week $0-$2k/mo $500k-$5M GMV DEFAULT) / Path C (full
TikTok-Shop-orchestration $2k-$10k/mo $5M+ GMV) recommendation with cost
stack + Year-1 incremental TikTok-Shop GMV + LIVE-cohort-LTV multiplier +
Shop-Score 4.8+ audit-trail + Spark-Ads-ROAS + creator-tier-distribution +
5-payout creator-affiliate-structures matrix + 6-step build sequence.

The scoring rule (mirrors research/11 §GMV-tier paths + playbook 18
§Prerequisites + asset 19 §5-payout-structures + canonical
8-prereq TikTok-Shop-onboarding-pack):
- us_dtc_gmv < $100k                                  → defer (Path A surfaced as audit only)
- us_dtc_gmv $100k-$500k                              → Path A (creator-affiliate-only + shoppable-video-ads)
- us_dtc_gmv $500k-$5M                                → Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week DEFAULT)
- us_dtc_gmv $5M+                                     → Path C (full TikTok-Shop-orchestration)
- sku_count < 10                                      → defer (canonical TikTok-Shop-product-feed-baseline per Jungle Scout 2024)
- gross_margin_pct < 25%                              → defer (canonical TikTok-Shop-margin-headroom floor: TikTok-Shop 8%-commission + creator-affiliate 10-25%-of-GMV + shipping-subsidy 5-15%-of-AOV = 30-50% of GMV)
- has_tiktok_business_account = False                 → defer (TikTok-Business-Account is the canonical Path A entry point)
- has_shopify_tiktok_channel = False                  → defer (Shopify-TikTok-Channel is the canonical product-feed substrate)
- creator_affiliate_pool_size < 10                    → defer (canonical 20-50 creator-affiliate-pool-baseline per playbook 18 §Phase 1)
- has_live_shopping_studio_capacity_hours_per_week < 4 → defer (canonical 4-hour-week LIVE-cadence floor per TikTok-LIVE 2024)
- has_triple_whale_tiktok_attribution = False        → downgrade one tier (Triple-Whale-TikTok-cohort-overlay is the canonical attribution substrate; without it undercount TikTok-Shop-driven-DTC-attribution by 30-50%)
- voice_profile = "luxury" WITHOUT has_klaviyo_tiktok_channel = True → downgrade one tier (creator-brief-guardrails gate)
- voice_profile = "b2b" WITHOUT creator_affiliate_pool_size >= 50 → downgrade one tier (B2B-voice-without-wholesale-channel gate)
- voice_profile = "gen_z" WITHOUT has_live_shopping_studio_capacity_hours_per_week >= 8 → downgrade one tier (Gen-Z-voice-without-TikTok-content-cadence gate)
- Path C with has_live_shopping_studio_capacity_hours_per_week < 8 → downgrade to Path B (full TikTok-Shop-orchestration requires daily LIVE-cadence 16+ hr/wk)

The script is hermetic — it does NOT call TikTok-Shop-Seller-Center /
Shopify-TikTok-Channel / Klaviyo / Triple-Whale / TikTok-Ads-Manager /
TikTok-Shop-Creator-Marketplace / Aspire / Collabstr / Instagram APIs.
Inputs are operator-supplied at the CLI; the cost stack + per-path
projection + 6-step build sequence + 5-payout creator-affiliate-structures
matrix are derived from research/11 + playbook 18 + asset 19 (the canonical
benchmarks the workspace already ships). Same hermetic recipe as
threepl_unit_economics.py / marketplace_unit_economics.py /
subscription_unit_economics.py / affiliate_unit_economics.py /
b2b_wholesale_unit_economics.py / international_market_fit.py /
lifecycle_flow_health_check.py.
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

from tiktok_shop_unit_economics import (  # noqa: E402
    BrandTikTokShopInputs,
    PATH_A_FLOOR,
    PATH_B_FLOOR,
    PATH_C_FLOOR,
    PATH_COSTS,
    PATH_DEFAULT_PLATFORM_PICK,
    PATH_INCREMENTAL_GMV_SHARE_PCT,
    PATH_PLATFORMS,
    PATH_RANK,
    PATH_ROI,
    RANK_PATH,
    SPARK_ADS_ROAS_MULTIPLIER,
    LIVE_CVR_MULTIPLIER,
    CREATOR_AFFILIATE_PAYOUT_MATRIX,
    PathRecommendation,
    build_inputs,
    build_sequence_for_path,
    classify_voice_profile,
    main,
    parse_args,
    project_per_path_revenue,
    recommend_path,
    render_human,
)


# ============================================================
# Canonical defaults used across multiple tests
# ============================================================

# Path B DEFAULT canonical inputs (research/11 §GMV-tier paths Path B).
PATH_B_DEFAULTS = dict(
    us_dtc_gmv=2_000_000.0,
    sku_count=35,
    sku_archetype_distribution="12_hero_23_wholesale",
    gross_margin_pct=50.0,
    has_tiktok_business_account=True,
    has_tiktok_shop_seller_center=True,
    has_shopify_tiktok_channel=True,
    has_klaviyo_tiktok_channel=True,
    has_triple_whale_tiktok_attribution=True,
    creator_affiliate_pool_size=50,
    voice_profile="gen_z",
    has_live_shopping_studio_capacity_hours_per_week=8,
)


# ============================================================
# Test classes — split by canonical scoring branch.
# ============================================================


class TestBrandTikTokShopInputsValidation(unittest.TestCase):
    """BrandTikTokShopInputs.__post_init__ validation for all 12 inputs."""

    def test_negative_us_dtc_gmv_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": -1.0})

    def test_zero_us_dtc_gmv_allowed(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 0.0})
        self.assertEqual(inputs.us_dtc_gmv, 0.0)

    def test_negative_sku_count_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "sku_count": -1})

    def test_gross_margin_pct_below_zero_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "gross_margin_pct": -1.0})

    def test_gross_margin_pct_above_100_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "gross_margin_pct": 101.0})

    def test_negative_creator_affiliate_pool_size_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "creator_affiliate_pool_size": -1})

    def test_negative_live_studio_capacity_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "has_live_shopping_studio_capacity_hours_per_week": -1})

    def test_invalid_sku_archetype_distribution_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "sku_archetype_distribution": "invalid_shape"})

    def test_invalid_voice_profile_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "voice_profile": "minimalist"})

    def test_zero_sku_count_is_valid(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "sku_count": 0})
        self.assertEqual(inputs.sku_count, 0)

    def test_zero_creator_pool_size_is_valid(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "creator_affiliate_pool_size": 0})
        self.assertEqual(inputs.creator_affiliate_pool_size, 0)


class TestClassifyVoiceProfile(unittest.TestCase):
    """classify_voice_profile returns the canonical 5-voice profile or raises."""

    def test_default_returns_default(self) -> None:
        self.assertEqual(classify_voice_profile("default"), "default")

    def test_luxury_returns_luxury(self) -> None:
        self.assertEqual(classify_voice_profile("luxury"), "luxury")

    def test_sustainable_returns_sustainable(self) -> None:
        self.assertEqual(classify_voice_profile("sustainable"), "sustainable")

    def test_gen_z_returns_gen_z(self) -> None:
        self.assertEqual(classify_voice_profile("gen_z"), "gen_z")

    def test_b2b_returns_b2b(self) -> None:
        self.assertEqual(classify_voice_profile("b2b"), "b2b")

    def test_invalid_voice_raises(self) -> None:
        with self.assertRaises(ValueError):
            classify_voice_profile("boomer")


class TestRecommendPathBaseTiers(unittest.TestCase):
    """recommend_path base-tier behavior — no deferrals, no downgrades."""

    def test_us_dtc_gmv_50k_returns_path_a_deferred(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 50_000.0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        # Below Path A floor → defer is captured in justification.
        self.assertIn("defer", rec.justification.lower())

    def test_us_dtc_gmv_300k_returns_path_a(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 300_000.0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_us_dtc_gmv_2m_returns_path_b_default(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 2_000_000.0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_us_dtc_gmv_4_9m_returns_path_b(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 4_900_000.0})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_us_dtc_gmv_8m_with_capacity_returns_path_c(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 8_000_000.0, "has_live_shopping_studio_capacity_hours_per_week": 20})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")


class TestRecommendPathDeferrals(unittest.TestCase):
    """recommend_path deferral behavior — 6 canonical deferral gates."""

    def test_sku_count_below_10_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "sku_count": 5})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("SKU", rec.justification)

    def test_gross_margin_below_25_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "gross_margin_pct": 20.0})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("gross margin", rec.justification.lower())

    def test_live_studio_capacity_below_4_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "has_live_shopping_studio_capacity_hours_per_week": 2})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("LIVE", rec.justification)

    def test_no_tiktok_business_account_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "has_tiktok_business_account": False})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("TikTok Business", rec.justification)

    def test_no_shopify_tiktok_channel_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "has_shopify_tiktok_channel": False})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("Shopify-TikTok", rec.justification)

    def test_creator_pool_below_10_defers(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "creator_affiliate_pool_size": 5})
        rec = recommend_path(inputs)
        self.assertIn("defer", rec.justification.lower())
        self.assertIn("creator", rec.justification.lower())


class TestRecommendPathGates(unittest.TestCase):
    """recommend_path gate-upgrade + downgrade behavior — 4 canonical gates."""

    def test_triple_whale_off_downgrades_path_b_to_path_a(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 2_000_000.0, "has_triple_whale_tiktok_attribution": False})
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_luxury_without_klaviyo_downgrades(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 2_000_000.0, "voice_profile": "luxury", "has_klaviyo_tiktok_channel": False})
        rec = recommend_path(inputs)
        # luxury downgrades one tier → Path B → Path A
        self.assertEqual(rec.path, "A")

    def test_b2b_with_small_pool_downgrades(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 2_000_000.0, "voice_profile": "b2b", "creator_affiliate_pool_size": 30})
        rec = recommend_path(inputs)
        # b2b with <50 pool downgrades one tier → Path B → Path A
        self.assertEqual(rec.path, "A")

    def test_gen_z_with_low_live_capacity_downgrades(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 2_000_000.0, "voice_profile": "gen_z", "has_live_shopping_studio_capacity_hours_per_week": 5})
        rec = recommend_path(inputs)
        # gen_z with <8 LIVE capacity downgrades one tier → Path B → Path A
        self.assertEqual(rec.path, "A")

    def test_path_c_with_low_capacity_downgrades_to_path_b(self) -> None:
        inputs = BrandTikTokShopInputs(**{**PATH_B_DEFAULTS, "us_dtc_gmv": 8_000_000.0, "has_live_shopping_studio_capacity_hours_per_week": 4})
        rec = recommend_path(inputs)
        # Path C with <8 LIVE capacity → downgrade to Path B
        self.assertEqual(rec.path, "B")


class TestPathRecommendationStructure(unittest.TestCase):
    """PathRecommendation has the canonical 12-field shape."""

    def test_default_path_b_has_all_fields(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIsInstance(rec.platforms, list)
        self.assertGreater(len(rec.platforms), 0)
        self.assertIsInstance(rec.default_platform_pick, str)
        self.assertIsInstance(rec.justification, str)
        self.assertIsInstance(rec.cost_one_time_low, (int, float))
        self.assertIsInstance(rec.cost_one_time_high, (int, float))
        self.assertIsInstance(rec.cost_recurring_low, (int, float))
        self.assertIsInstance(rec.cost_recurring_high, (int, float))
        self.assertIsInstance(rec.year1_cost_low, (int, float))
        self.assertIsInstance(rec.year1_cost_high, (int, float))
        self.assertIsInstance(rec.year1_incremental_gmv_share_pct_low, (int, float))
        self.assertIsInstance(rec.year1_incremental_gmv_share_pct_high, (int, float))
        self.assertIsInstance(rec.year1_incremental_gmv_low, (int, float))
        self.assertIsInstance(rec.year1_incremental_gmv_high, (int, float))
        self.assertIsInstance(rec.live_cohort_ltv_multiplier_low, (int, float))
        self.assertIsInstance(rec.live_cohort_ltv_multiplier_high, (int, float))
        self.assertIsInstance(rec.spark_ads_roas_low, (int, float))
        self.assertIsInstance(rec.spark_ads_roas_high, (int, float))
        self.assertIsInstance(rec.year1_roi_low, (int, float))
        self.assertIsInstance(rec.year1_roi_high, (int, float))
        self.assertIsInstance(rec.creator_affiliate_payout_matrix, dict)
        self.assertIsInstance(rec.build_sequence, list)
        self.assertGreater(len(rec.build_sequence), 0)

    def test_cost_low_le_cost_high(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertLessEqual(rec.cost_one_time_low, rec.cost_one_time_high)
        self.assertLessEqual(rec.cost_recurring_low, rec.cost_recurring_high)
        self.assertLessEqual(rec.year1_cost_low, rec.year1_cost_high)
        self.assertLessEqual(rec.year1_incremental_gmv_low, rec.year1_incremental_gmv_high)
        self.assertLessEqual(rec.year1_roi_low, rec.year1_roi_high)

    def test_year1_cost_equals_one_time_plus_recurring(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        # year1_cost_low ≈ cost_one_time_low + cost_recurring_low
        self.assertAlmostEqual(rec.year1_cost_low, rec.cost_one_time_low + rec.cost_recurring_low, delta=1.0)
        self.assertAlmostEqual(rec.year1_cost_high, rec.cost_one_time_high + rec.cost_recurring_high, delta=1.0)


class TestProjectPerPathRevenue(unittest.TestCase):
    """project_per_path_revenue returns a dict with the canonical shape."""

    def test_project_returns_dict(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertIsInstance(proj, dict)
        self.assertIn("path", proj)
        self.assertIn("year1_incremental_gmv_low", proj)
        self.assertIn("year1_incremental_gmv_high", proj)
        self.assertIn("year1_cost_low", proj)
        self.assertIn("year1_cost_high", proj)
        self.assertIn("year1_roi_low", proj)
        self.assertIn("year1_roi_high", proj)

    def test_project_year1_incremental_gmv_in_range(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # Path B at $2M US DTC base → $500k-$1M Year-1 incremental TikTok-Shop GMV
        self.assertGreaterEqual(proj["year1_incremental_gmv_low"], 500_000.0)
        self.assertLessEqual(proj["year1_incremental_gmv_high"], 1_000_000.0)


class TestBuildSequence(unittest.TestCase):
    """build_sequence_for_path returns a non-empty list of 6 canonical steps."""

    def test_path_a_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("A")
        self.assertEqual(len(seq), 6)

    def test_path_b_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("B")
        self.assertEqual(len(seq), 6)

    def test_path_c_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("C")
        self.assertEqual(len(seq), 6)

    def test_path_b_step_1_is_seller_center(self) -> None:
        seq = build_sequence_for_path("B")
        # Canonical hyphenated form per research/11 Pillar 1: "TikTok-Shop-Seller-Center-onboarding".
        self.assertIn("Seller-Center", seq[0])

    def test_path_b_step_3_is_live_shopping(self) -> None:
        seq = build_sequence_for_path("B")
        live_step_found = any("LIVE" in s for s in seq)
        self.assertTrue(live_step_found)


class TestRenderHuman(unittest.TestCase):
    """render_human returns a multi-line human-readable report."""

    def test_render_human_returns_string(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        report = render_human(inputs, rec)
        self.assertIsInstance(report, str)
        self.assertGreater(len(report), 200)

    def test_render_human_contains_path_b(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        report = render_human(inputs, rec)
        self.assertIn("Path B", report)

    def test_render_human_contains_creator_payout_matrix(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        report = render_human(inputs, rec)
        # gen_z voice → 25/30/35% CPS tier
        self.assertIn("25/30/35", report)

    def test_render_human_contains_build_sequence(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        report = render_human(inputs, rec)
        self.assertIn("Build sequence", report)


class TestCanonicalDefaultsPinned(unittest.TestCase):
    """Pin canonical constants — refactoring must update tests first."""

    def test_path_a_floor_is_100k(self) -> None:
        self.assertEqual(PATH_A_FLOOR, 100_000.0)

    def test_path_b_floor_is_500k(self) -> None:
        self.assertEqual(PATH_B_FLOOR, 500_000.0)

    def test_path_c_floor_is_5m(self) -> None:
        self.assertEqual(PATH_C_FLOOR, 5_000_000.0)

    def test_path_a_costs_zero_to_low(self) -> None:
        self.assertEqual(PATH_COSTS["A"], (0, 2_000, 0, 149))

    def test_path_b_costs_default(self) -> None:
        self.assertEqual(PATH_COSTS["B"], (2_000, 5_000, 0, 2_000))

    def test_path_c_costs_high(self) -> None:
        self.assertEqual(PATH_COSTS["C"], (5_000, 50_000, 2_000, 10_000))

    def test_path_b_default_roi(self) -> None:
        self.assertEqual(PATH_ROI["B"], (6.0, 12.0))

    def test_path_b_incremental_gmv_share(self) -> None:
        # Path B 25-50% Year-1 incremental TikTok-Shop GMV
        self.assertEqual(PATH_INCREMENTAL_GMV_SHARE_PCT["B"], (25.0, 50.0))

    def test_spark_ads_roas_multiplier(self) -> None:
        # Path B Spark-Ads 2-4x ROAS multiplier
        self.assertEqual(SPARK_ADS_ROAS_MULTIPLIER, (2.0, 4.0))

    def test_live_cvr_multiplier(self) -> None:
        # Path B LIVE-shopping 3-5x CVR multiplier
        self.assertEqual(LIVE_CVR_MULTIPLIER, (3.0, 5.0))

    def test_creator_payout_matrix_has_5_voices(self) -> None:
        self.assertEqual(len(CREATOR_AFFILIATE_PAYOUT_MATRIX), 5)

    def test_creator_payout_matrix_gen_z_highest_cps(self) -> None:
        # gen_z = "25/30/35" (highest CPS tier per research/11 Pillar 2)
        self.assertEqual(CREATOR_AFFILIATE_PAYOUT_MATRIX["gen_z"], "25/30/35%")

    def test_creator_payout_matrix_default_15_20_25(self) -> None:
        self.assertEqual(CREATOR_AFFILIATE_PAYOUT_MATRIX["default"], "15/20/25%")

    def test_creator_payout_matrix_luxury_lowest(self) -> None:
        self.assertEqual(CREATOR_AFFILIATE_PAYOUT_MATRIX["luxury"], "10/12/15%")

    def test_creator_payout_matrix_sustainable_mid_high(self) -> None:
        self.assertEqual(CREATOR_AFFILIATE_PAYOUT_MATRIX["sustainable"], "20/25/30%")

    def test_creator_payout_matrix_b2b_tiered(self) -> None:
        self.assertEqual(CREATOR_AFFILIATE_PAYOUT_MATRIX["b2b"], "8-12/12-15/15-20%")

    def test_path_rank_a_b_c_order(self) -> None:
        self.assertEqual(PATH_RANK, {"A": 0, "B": 1, "C": 2})
        self.assertEqual(RANK_PATH, {0: "A", 1: "B", 2: "C"})


class TestMainCLI(unittest.TestCase):
    """main() CLI plumbing — --help, --json, valid input."""

    def test_main_help_exits_zero(self) -> None:
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "tiktok_shop_unit_economics.py"), "--help"],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        self.assertIn("usage", proc.stdout.lower())

    def test_main_json_default_exits_zero(self) -> None:
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "tiktok_shop_unit_economics.py"), "--json"],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        data = json.loads(proc.stdout)
        self.assertIn("path", data)
        self.assertEqual(data["path"], "B")

    def test_main_human_default_exits_zero(self) -> None:
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "tiktok_shop_unit_economics.py")],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        self.assertIn("Path B", proc.stdout)

    def test_main_invalid_voice_exits_two(self) -> None:
        # argparse returns exit 2 for invalid-choice usage errors (canonical behavior).
        proc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "tiktok_shop_unit_economics.py"), "--voice-profile", "boomer"],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 2)

    def test_main_low_gmv_exits_zero_with_defer(self) -> None:
        proc = subprocess.run(
            [
                sys.executable, os.path.join(SCRIPTS_DIR, "tiktok_shop_unit_economics.py"),
                "--us-dtc-gmv", "50000",
                "--sku-count", "5",
                "--gross-margin-pct", "10.0",
                "--no-tiktok-business-account",
                "--no-shopify-tiktok-channel",
                "--creator-affiliate-pool-size", "2",
                "--has-live-shopping-studio-capacity-hours-per-week", "0",
                "--json",
            ],
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(proc.returncode, 0)
        data = json.loads(proc.stdout)
        # All deferrals fire; path stays at A from tier floor
        self.assertEqual(data["path"], "A")
        self.assertIn("defer", data["justification"].lower())


class TestBuildInputs(unittest.TestCase):
    """build_inputs converts argparse Namespace → BrandTikTokShopInputs."""

    def test_build_inputs_returns_dataclass(self) -> None:
        args = parse_args([])
        inputs = build_inputs(args)
        self.assertIsInstance(inputs, BrandTikTokShopInputs)

    def test_build_inputs_with_overrides(self) -> None:
        args = parse_args([
            "--us-dtc-gmv", "8000000",
            "--voice-profile", "luxury",
            "--no-tiktok-business-account",
        ])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_dtc_gmv, 8_000_000.0)
        self.assertEqual(inputs.voice_profile, "luxury")
        self.assertFalse(inputs.has_tiktok_business_account)


class TestValidInput(unittest.TestCase):
    """End-to-end smoke — valid default input flows through the full pipeline."""

    def test_valid_input_path_b_default(self) -> None:
        inputs = BrandTikTokShopInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        report = render_human(inputs, rec)
        seq = build_sequence_for_path(rec.path)
        # Path B default at $2M US DTC base
        self.assertEqual(rec.path, "B")
        # year1 incremental GMV at $2M US DTC base should be $500k-$1M
        self.assertGreaterEqual(proj["year1_incremental_gmv_low"], 500_000.0)
        self.assertLessEqual(proj["year1_incremental_gmv_high"], 1_000_000.0)
        # 6-step build sequence
        self.assertEqual(len(seq), 6)
        # Report mentions Path B
        self.assertIn("Path B", report)
        # gen_z voice payout tier visible
        self.assertIn("25/30/35", report)

    def test_valid_input_path_c_high_gmv(self) -> None:
        inputs = BrandTikTokShopInputs(**{
            **PATH_B_DEFAULTS,
            "us_dtc_gmv": 12_000_000.0,
            "creator_affiliate_pool_size": 150,
            "has_live_shopping_studio_capacity_hours_per_week": 20,
        })
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # Path C at $12M US DTC base → 15-30% incremental → $1.8M-$3.6M
        self.assertEqual(rec.path, "C")
        self.assertGreaterEqual(proj["year1_incremental_gmv_low"], 1_500_000.0)
        self.assertLessEqual(proj["year1_incremental_gmv_high"], 4_000_000.0)


if __name__ == "__main__":
    unittest.main()