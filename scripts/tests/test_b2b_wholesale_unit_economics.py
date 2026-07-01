#!/usr/bin/env python3
"""
test_b2b_wholesale_unit_economics.py — TDD tests for the B2B / wholesale
Path A/B/C scorer (Archetype A/B hybrid scoring script per playbook 17 + research/10).

Companion to:
- research/10-b2b-wholesale.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/17-b2b-wholesale-launch.md (4-phase Marketplace-onboard → Distributor-pitch → Direct-buyer-pipeline → Steady-state operator build)
- assets/18-b2b-wholesale-kits.md (paste-ready per-marketplace per-voice per-SKU wholesale listing cards)

Run: python3 scripts/tests/test_b2b_wholesale_unit_economics.py

The script takes a brand's current-B2B-wholesale-fit inputs
(us_dtc_gmv / sku_count / sku_archetype_distribution / gross_margin_pct /
moq_operational_capacity / has_faire_account / has_handshake_shopify /
has_net_suite_wholesale / has_rsp_or_kehe_pitch / has_corporate_gifting_catalog /
voice_profile / has_dedicated_sales_rep_capacity_hours_per_week) → outputs Path A
(Faire + Tundra + Ankorstore + Handshake marketplace-only) / Path B (Faire +
Tundra + Ankorstore + Handshake + Shopify B2B DEFAULT) / Path C (RSP/KeHE/UNFI +
Amazon Business + Shopify Plus B2B) recommendation with cost stack + Year-1
incremental B2B revenue + reorder-rate + wholesale-attach-rate + MAP-policy
savings + DTC-cannibalization-adjusted net revenue + 6-step build sequence +
6-tier wholesale-discount matrix.

The scoring rule (mirrors research/10 §GMV-tier paths + playbook 17
§Prerequisites + asset 18 §6-tier wholesale-discount matrix + canonical
8-prereq distributor-onboarding-pack):
- us_dtc_gmv < $100k                                   → defer (Path A surfaced as audit only)
- us_dtc_gmv $100k-$500k                               → Path A (Faire + Tundra + Ankorstore + Handshake marketplace-only)
- us_dtc_gmv $500k-$5M                                 → Path B (Faire + Tundra + Ankorstore + Handshake + Shopify B2B DEFAULT)
- us_dtc_gmv $5M+                                      → Path C (RSP/KeHE/UNFI + Amazon Business + Shopify Plus B2B)
- sku_count < 10                                       → defer (canonical 10+ SKU baseline per Faire 2024)
- gross_margin_pct < 25%                               → defer (canonical 25%+ wholesale-discount margin headroom per Faire 2024)
- has_dedicated_sales_rep_capacity_hours_per_week < 4  → defer (canonical 4-10 hr/wk Path A floor per Faire onboarding-survey 2024)
- moq_operational_capacity < 3                         → defer (canonical casepack-fulfillment readiness)
- has_faire_account = False                            → defer (Faire is the canonical Path A entry point)
- has_handshake_shopify = False                        → defer (Handshake is the canonical Shopify-native B2B-buyer-portal)
- has_net_suite_wholesale = False AND path == "C"      → downgrade to Path B (canonical Path C integration substrate)
- voice_profile = "luxury" WITHOUT has_corporate_gifting_catalog = True → downgrade one tier (MAP-protection gate)
- voice_profile = "sustainable" WITHOUT has_corporate_gifting_catalog = True → downgrade one tier (claims-verification gate)
- Path C with has_dedicated_sales_rep_capacity_hours_per_week < 1 → downgrade to Path B (RSP/KeHE/UNFI requires 0.5-1.0 FTE dedicated sales-rep)

The script is hermetic — it does NOT call Faire / Tundra / Ankorstore /
Handshake / Shopify B2B / Amazon Business / RSP / KeHE / UNFI / TradeGala /
RangeMe / NetSuite / QuickBooks / Triple Whale / Klaviyo APIs. Inputs are
operator-supplied at the CLI; the cost stack + per-path projection + 6-step
build sequence + 6-tier wholesale-discount matrix are derived from
research/10 + playbook 17 + asset 18 (the canonical benchmarks the workspace
already ships). Same hermetic recipe as threepl_unit_economics.py /
marketplace_unit_economics.py / subscription_unit_economics.py /
affiliate_unit_economics.py / international_market_fit.py /
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

from b2b_wholesale_unit_economics import (  # noqa: E402
    BrandB2BInputs,
    PATH_A_FLOOR,
    PATH_B_FLOOR,
    PATH_C_FLOOR,
    PATH_COSTS,
    PATH_DEFAULT_PLATFORM_PICK,
    PATH_INCREMENTAL_REVENUE_SHARE_PCT,
    PATH_PLATFORMS,
    PATH_RANK,
    PATH_ROI,
    RANK_PATH,
    REORDER_RATE_PCT,
    WHOLESALE_ATTACH_RATE_PCT,
    WHOLESALE_DISCOUNT_MATRIX,
    MAP_POLICY_SAVINGS_PCT,
    DTC_CANNIBALIZATION_RATE,
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

# Path B DEFAULT canonical inputs (research/10 §GMV-tier paths Path B).
PATH_B_DEFAULTS = dict(
    us_dtc_gmv=2_000_000.0,
    sku_count=35,
    sku_archetype_distribution="12_hero_23_wholesale",
    gross_margin_pct=50.0,
    moq_operational_capacity=8,
    has_faire_account=True,
    has_handshake_shopify=True,
    has_net_suite_wholesale=False,
    has_rsp_or_kehe_pitch=False,
    has_corporate_gifting_catalog=True,
    voice_profile="b2b",
    has_dedicated_sales_rep_capacity_hours_per_week=8,
)


# ============================================================
# Test classes — split by canonical scoring branch.
# ============================================================


class TestBrandB2BInputsValidation(unittest.TestCase):
    """BrandB2BInputs.__post_init__ validation for all 12 inputs."""

    def test_negative_us_dtc_gmv_raises(self) -> None:
        with self.assertRaises(ValueError) as ctx:
            BrandB2BInputs(us_dtc_gmv=-1, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
            })
        self.assertIn("us_dtc_gmv must be >= 0", str(ctx.exception))

    def test_zero_us_dtc_gmv_allowed(self) -> None:
        # Zero GMV is valid (still computes; will defer at the GMV-floor check).
        inputs = BrandB2BInputs(us_dtc_gmv=0, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
        })
        self.assertEqual(inputs.us_dtc_gmv, 0)

    def test_negative_sku_count_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(sku_count=-1, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "sku_count"
            })

    def test_gross_margin_pct_below_zero_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(gross_margin_pct=-1, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "gross_margin_pct"
            })

    def test_gross_margin_pct_above_100_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(gross_margin_pct=101, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "gross_margin_pct"
            })

    def test_moq_operational_capacity_below_1_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(moq_operational_capacity=0, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "moq_operational_capacity"
            })

    def test_moq_operational_capacity_above_10_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(moq_operational_capacity=11, **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "moq_operational_capacity"
            })

    def test_negative_sales_rep_capacity_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(has_dedicated_sales_rep_capacity_hours_per_week=-1, **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k != "has_dedicated_sales_rep_capacity_hours_per_week"
            })

    def test_invalid_sku_archetype_distribution_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(sku_archetype_distribution="invalid_archetype", **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "sku_archetype_distribution"
            })

    def test_invalid_voice_profile_raises(self) -> None:
        with self.assertRaises(ValueError):
            BrandB2BInputs(voice_profile="invalid_voice", **{
                k: v for k, v in PATH_B_DEFAULTS.items() if k != "voice_profile"
            })

    def test_zero_sku_count_is_valid(self) -> None:
        # Zero SKUs is technically valid; will defer at the sku-count-floor check.
        inputs = BrandB2BInputs(sku_count=0, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "sku_count"
        })
        self.assertEqual(inputs.sku_count, 0)


class TestClassifyVoiceProfile(unittest.TestCase):
    """classify_voice_profile returns the validated 5-profile enum."""

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
            classify_voice_profile("premium_luxury")


class TestRecommendPathBaseTiers(unittest.TestCase):
    """recommend_path base tier assignment for the 3 GMV-tier paths."""

    def test_us_dtc_gmv_50k_returns_path_a_deferred(self) -> None:
        inputs = BrandB2BInputs(us_dtc_gmv=50_000, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("below the $100,000", rec.justification)
        self.assertIn("Path A is still surfaced as the recommendation", rec.justification)

    def test_us_dtc_gmv_300k_returns_path_a(self) -> None:
        inputs = BrandB2BInputs(us_dtc_gmv=300_000, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("Path A tier", rec.justification)

    def test_us_dtc_gmv_2m_returns_path_b_default(self) -> None:
        inputs = BrandB2BInputs(us_dtc_gmv=2_000_000, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path B tier", rec.justification)
        self.assertIn("All gates pass", rec.justification)

    def test_us_dtc_gmv_4_9m_returns_path_b(self) -> None:
        inputs = BrandB2BInputs(us_dtc_gmv=4_999_999, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "us_dtc_gmv"
        })
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_us_dtc_gmv_8m_with_netsuite_returns_path_c(self) -> None:
        inputs = BrandB2BInputs(
            us_dtc_gmv=8_000_000,
            has_net_suite_wholesale=True,
            has_dedicated_sales_rep_capacity_hours_per_week=4,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("us_dtc_gmv", "has_net_suite_wholesale",
                             "has_dedicated_sales_rep_capacity_hours_per_week")
            },
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")
        self.assertIn("Path C tier", rec.justification)

    def test_us_dtc_gmv_8m_without_netsuite_downgrades_to_path_b(self) -> None:
        # NetSuite Wholesale missing → Path C downgrades to Path B.
        inputs = BrandB2BInputs(
            us_dtc_gmv=8_000_000,
            has_net_suite_wholesale=False,
            has_dedicated_sales_rep_capacity_hours_per_week=4,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("us_dtc_gmv", "has_net_suite_wholesale",
                             "has_dedicated_sales_rep_capacity_hours_per_week")
            },
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("Path C requires NetSuite Wholesale", rec.justification)


class TestRecommendPathDeferrals(unittest.TestCase):
    """6 deferral gates (sku_count / gross_margin / capacity / faire / handshake / moq)."""

    def test_sku_count_below_10_defers(self) -> None:
        inputs = BrandB2BInputs(sku_count=9, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "sku_count"
        })
        rec = recommend_path(inputs)
        self.assertIn("SKU count 9 < 10 floor", rec.justification)

    def test_gross_margin_below_25_defers(self) -> None:
        inputs = BrandB2BInputs(gross_margin_pct=24.0, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "gross_margin_pct"
        })
        rec = recommend_path(inputs)
        self.assertIn("Gross margin 24.0% < 25.0% floor", rec.justification)

    def test_sales_rep_capacity_below_4_defers(self) -> None:
        inputs = BrandB2BInputs(has_dedicated_sales_rep_capacity_hours_per_week=3, **{
            k: v for k, v in PATH_B_DEFAULTS.items()
            if k != "has_dedicated_sales_rep_capacity_hours_per_week"
        })
        rec = recommend_path(inputs)
        self.assertIn("3 hr/wk < 4 hr/wk floor", rec.justification)

    def test_no_faire_account_defers(self) -> None:
        inputs = BrandB2BInputs(has_faire_account=False, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "has_faire_account"
        })
        rec = recommend_path(inputs)
        self.assertIn("has_faire_account=False", rec.justification)

    def test_no_handshake_defers(self) -> None:
        inputs = BrandB2BInputs(has_handshake_shopify=False, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "has_handshake_shopify"
        })
        rec = recommend_path(inputs)
        self.assertIn("has_handshake_shopify=False", rec.justification)

    def test_moq_operational_capacity_below_3_defers(self) -> None:
        inputs = BrandB2BInputs(moq_operational_capacity=2, **{
            k: v for k, v in PATH_B_DEFAULTS.items() if k != "moq_operational_capacity"
        })
        rec = recommend_path(inputs)
        self.assertIn("MOQ-operational-capacity 2 < 3 floor", rec.justification)


class TestRecommendPathGates(unittest.TestCase):
    """3 downgrade gates (luxury + sustainable + Path C sales-rep)."""

    def test_luxury_without_corporate_gifting_downgrades(self) -> None:
        inputs = BrandB2BInputs(
            voice_profile="luxury",
            has_corporate_gifting_catalog=False,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("voice_profile", "has_corporate_gifting_catalog")
            },
        )
        rec = recommend_path(inputs)
        # Path B → Path A
        self.assertEqual(rec.path, "A")
        self.assertIn("voice_profile=luxury WITHOUT has_corporate_gifting_catalog",
                      rec.justification)
        self.assertIn("Applied 1 downgrade(s)", rec.justification)

    def test_sustainable_without_corporate_gifting_downgrades(self) -> None:
        inputs = BrandB2BInputs(
            voice_profile="sustainable",
            has_corporate_gifting_catalog=False,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("voice_profile", "has_corporate_gifting_catalog")
            },
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")
        self.assertIn("voice_profile=sustainable WITHOUT has_corporate_gifting_catalog",
                      rec.justification)

    def test_luxury_with_corporate_gifting_no_downgrade(self) -> None:
        inputs = BrandB2BInputs(
            voice_profile="luxury",
            has_corporate_gifting_catalog=True,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("voice_profile", "has_corporate_gifting_catalog")
            },
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        self.assertIn("All gates pass", rec.justification)

    def test_path_c_without_dedicated_rep_downgrades_to_b(self) -> None:
        # Path C with NetSuite + sales-rep=0 → sales-rep downgrade from Path C → Path B.
        # (NetSuite Wholesale IS installed here, so the NetSuite gate doesn't fire; only the sales-rep gate fires.)
        inputs = BrandB2BInputs(
            us_dtc_gmv=8_000_000,
            has_net_suite_wholesale=True,
            has_dedicated_sales_rep_capacity_hours_per_week=0,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("us_dtc_gmv", "has_net_suite_wholesale",
                             "has_dedicated_sales_rep_capacity_hours_per_week")
            },
        )
        rec = recommend_path(inputs)
        # Path C → B (sales-rep downgrade).
        self.assertEqual(rec.path, "B")
        self.assertIn("Path C with has_dedicated_sales_rep_capacity_hours_per_week=0",
                      rec.justification)
        self.assertIn("Applied 1 downgrade(s)", rec.justification)

    def test_path_c_with_dedicated_rep_stays_path_c(self) -> None:
        # Path C with sales-rep ≥1 hr/wk → stays Path C.
        inputs = BrandB2BInputs(
            us_dtc_gmv=8_000_000,
            has_net_suite_wholesale=True,
            has_dedicated_sales_rep_capacity_hours_per_week=4,
            **{
                k: v for k, v in PATH_B_DEFAULTS.items()
                if k not in ("us_dtc_gmv", "has_net_suite_wholesale",
                             "has_dedicated_sales_rep_capacity_hours_per_week")
            },
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")
        self.assertIn("Path C tier", rec.justification)


class TestPathRecommendationStructure(unittest.TestCase):
    """PathRecommendation dataclass has all required fields with correct types."""

    def _build_rec_for_default(self) -> PathRecommendation:
        return recommend_path(BrandB2BInputs(**PATH_B_DEFAULTS))

    def test_path_recommendation_has_path_field(self) -> None:
        rec = self._build_rec_for_default()
        self.assertEqual(rec.path, "B")
        self.assertIn(rec.path, ("A", "B", "C"))

    def test_path_recommendation_has_platforms_list(self) -> None:
        rec = self._build_rec_for_default()
        self.assertIsInstance(rec.platforms, list)
        # Path B has 5 platforms: Faire + Tundra + Ankorstore + Handshake + Shopify B2B / Shopify Plus B2B.
        self.assertEqual(len(rec.platforms), 5)
        self.assertIn("Faire", rec.platforms)
        self.assertIn("Handshake (Shopify B2B)", rec.platforms)

    def test_path_recommendation_has_default_platform_pick(self) -> None:
        rec = self._build_rec_for_default()
        self.assertIn("Faire + Handshake", rec.default_platform_pick)

    def test_path_recommendation_has_justification_string(self) -> None:
        rec = self._build_rec_for_default()
        self.assertIsInstance(rec.justification, str)
        self.assertGreater(len(rec.justification), 0)

    def test_path_recommendation_has_cost_stack(self) -> None:
        rec = self._build_rec_for_default()
        # Path B cost stack from research/10 §Cost & ROI.
        self.assertGreaterEqual(rec.cost_one_time_low, 0)
        self.assertGreaterEqual(rec.cost_one_time_high, rec.cost_one_time_low)
        self.assertGreaterEqual(rec.cost_recurring_low, 0)
        self.assertGreaterEqual(rec.cost_recurring_high, rec.cost_recurring_low)
        # Path B ranges: cost_one_time_low=2000, high=5000, recurring_low=149, high=499.
        self.assertEqual(rec.cost_one_time_low, 2_000)
        self.assertEqual(rec.cost_one_time_high, 5_000)
        self.assertEqual(rec.cost_recurring_low, 149)
        self.assertEqual(rec.cost_recurring_high, 499)

    def test_path_recommendation_has_year1_outcomes(self) -> None:
        rec = self._build_rec_for_default()
        # Year-1 incremental revenue share band for Path B is 50-100%.
        self.assertEqual(rec.year1_incremental_revenue_share_pct_low, 50.0)
        self.assertEqual(rec.year1_incremental_revenue_share_pct_high, 100.0)
        # Year-1 incremental revenue $ at $2M GMV Path B = $1M-$2M.
        self.assertEqual(rec.year1_incremental_revenue_low, 1_000_000.0)
        self.assertEqual(rec.year1_incremental_revenue_high, 2_000_000.0)

    def test_path_recommendation_has_reorder_rate(self) -> None:
        rec = self._build_rec_for_default()
        # Path B reorder rate 60-80% (research/10 Pillar 3 + Salesforce B2B 2024).
        self.assertEqual(rec.reorder_rate_pct_low, 60.0)
        self.assertEqual(rec.reorder_rate_pct_high, 80.0)

    def test_path_recommendation_has_wholesale_attach_rate(self) -> None:
        rec = self._build_rec_for_default()
        # Path B wholesale-attach-rate 55-75% Year-2+ (research/10 Pillar 2).
        self.assertEqual(rec.wholesale_attach_rate_pct_low, 55.0)
        self.assertEqual(rec.wholesale_attach_rate_pct_high, 75.0)

    def test_path_recommendation_has_map_policy_savings(self) -> None:
        rec = self._build_rec_for_default()
        # Path B MAP-policy savings 30-50% of DTC-traffic-leakage-prevented.
        self.assertEqual(rec.map_policy_savings_pct_low, 30.0)
        self.assertEqual(rec.map_policy_savings_pct_high, 50.0)

    def test_path_recommendation_has_cannibalization_adjusted_net(self) -> None:
        rec = self._build_rec_for_default()
        # Path B DTC-cannibalization-adjusted net = $1M-$2M × (1 - 0.175) = $825K-$1.65M.
        self.assertEqual(rec.dtc_cannibalization_adjusted_net_revenue_low, 825_000.0)
        self.assertEqual(rec.dtc_cannibalization_adjusted_net_revenue_high, 1_650_000.0)

    def test_path_recommendation_has_year1_roi(self) -> None:
        rec = self._build_rec_for_default()
        # Path B Year-1 ROI 6-11:1.
        self.assertEqual(rec.year1_roi_low, 6.0)
        self.assertEqual(rec.year1_roi_high, 11.0)

    def test_path_recommendation_has_wholesale_discount_matrix(self) -> None:
        rec = self._build_rec_for_default()
        self.assertIsInstance(rec.wholesale_discount_matrix, dict)
        # 5 voice profiles keyed in the matrix.
        for voice in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            self.assertIn(voice, rec.wholesale_discount_matrix)

    def test_path_recommendation_has_build_sequence_6_steps(self) -> None:
        rec = self._build_rec_for_default()
        self.assertIsInstance(rec.build_sequence, list)
        self.assertEqual(len(rec.build_sequence), 6)
        # Every step starts with "Step N".
        for i, step in enumerate(rec.build_sequence, start=1):
            self.assertTrue(step.startswith(f"Step {i}"), f"Step {i} expected prefix, got: {step[:30]}")


class TestProjectPerPathRevenue(unittest.TestCase):
    """project_per_path_revenue returns per-path Year-1 projections for all 3 paths."""

    def test_default_inputs_projects_all_three_paths(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertIn("A", proj)
        self.assertIn("B", proj)
        self.assertIn("C", proj)

    def test_recommended_path_appears_in_projection(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        self.assertEqual(proj["recommended_path"], "B")

    def test_path_a_projection_matches_constants(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        path_a = proj["A"]
        # Path A: 5-15% revenue share, 15-25% attach, 40-60% reorder, 15-25% MAP, 25% cannibalization.
        self.assertEqual(path_a["year1_incremental_revenue_low"], 2_000_000.0 * 0.05)
        self.assertEqual(path_a["year1_incremental_revenue_high"], 2_000_000.0 * 0.15)
        self.assertEqual(path_a["year2_plus_wholesale_attach_rate_low"], 15.0)
        self.assertEqual(path_a["year2_plus_wholesale_attach_rate_high"], 25.0)
        self.assertEqual(path_a["reorder_rate_pct_low"], 40.0)
        self.assertEqual(path_a["reorder_rate_pct_high"], 60.0)
        self.assertEqual(path_a["map_policy_savings_pct_low"], 15.0)
        self.assertEqual(path_a["map_policy_savings_pct_high"], 25.0)
        self.assertEqual(path_a["dtc_cannibalization_rate"], 0.25)

    def test_path_c_projection_has_higher_cost_per_year(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        proj = project_per_path_revenue(inputs, rec)
        # Path C recurring cost is higher than Path B.
        self.assertGreaterEqual(PATH_COSTS["C"][2], PATH_COSTS["B"][2])


class TestBuildSequence(unittest.TestCase):
    """build_sequence_for_path returns the 6-step recipe for each path."""

    def test_path_a_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("A")
        self.assertEqual(len(seq), 6)
        # Step 1 always references wholesale-pricing calculator.
        self.assertIn("Wholesale-pricing calculator", seq[0])

    def test_path_b_build_sequence_has_6_steps(self) -> None:
        seq = build_sequence_for_path("B")
        self.assertEqual(len(seq), 6)
        self.assertIn("Wholesale-pricing calculator", seq[0])

    def test_path_c_build_sequence_has_6_steps_with_amazon_business(self) -> None:
        seq = build_sequence_for_path("C")
        self.assertEqual(len(seq), 6)
        # Path C Step 1 mentions Amazon Business.
        self.assertIn("Amazon Business", seq[0])

    def test_build_sequence_for_path_returns_independent_list(self) -> None:
        # The function returns a NEW list (defensive copy) — caller mutations don't affect the canonical table.
        seq1 = build_sequence_for_path("B")
        seq1[0] = "MUTATED"
        seq2 = build_sequence_for_path("B")
        self.assertNotEqual(seq1[0], seq2[0])


class TestRenderHuman(unittest.TestCase):
    """render_human emits a multi-line human-readable block with all required sections."""

    def test_renders_recommendation_header(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("B2B / wholesale Path A/B/C recommendation", out)
        self.assertIn("Recommendation: Path B", out)

    def test_renders_inputs_section(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Inputs:", out)
        self.assertIn("US DTC GMV", out)
        self.assertIn("$2,000,000", out)
        self.assertIn("SKU count", out)

    def test_renders_cost_stack_section(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Cost stack:", out)
        self.assertIn("One-time setup", out)
        self.assertIn("Recurring monthly", out)

    def test_renders_year1_outcomes_section(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("Expected Year-1 outcomes:", out)
        self.assertIn("Incremental revenue", out)
        self.assertIn("Reorder rate", out)
        self.assertIn("Year-1 ROI", out)

    def test_renders_wholesale_discount_matrix_section(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("6-tier wholesale-discount matrix", out)
        self.assertIn("default", out)
        self.assertIn("luxury", out)
        self.assertIn("sustainable", out)

    def test_renders_build_sequence_section(self) -> None:
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        out = render_human(inputs, rec)
        self.assertIn("6-step build sequence:", out)
        for i in range(1, 7):
            self.assertIn(f"Step {i}", out)


class TestCanonicalDefaultsPinned(unittest.TestCase):
    """Pin canonical constants from research/10 + playbook 17 + asset 18."""

    def test_path_a_floor_is_100k(self) -> None:
        self.assertEqual(PATH_A_FLOOR, 100_000.0)

    def test_path_b_floor_is_500k(self) -> None:
        self.assertEqual(PATH_B_FLOOR, 500_000.0)

    def test_path_c_floor_is_5m(self) -> None:
        self.assertEqual(PATH_C_FLOOR, 5_000_000.0)

    def test_path_b_cost_stack_matches_research_10(self) -> None:
        # research/10 §Cost & ROI: Path B $2,000-$5,000 one-time + $149-$499/mo recurring.
        cost_low, cost_high, rec_low, rec_high = PATH_COSTS["B"]
        self.assertEqual((cost_low, cost_high, rec_low, rec_high), (2_000, 5_000, 149, 499))

    def test_path_b_incremental_revenue_share_matches_research_10(self) -> None:
        # research/10 §Path B: 50-100% Year-1 incremental B2B revenue.
        share_low, share_high = PATH_INCREMENTAL_REVENUE_SHARE_PCT["B"]
        self.assertEqual((share_low, share_high), (50.0, 100.0))

    def test_path_b_reorder_rate_matches_salesforce_b2b_2024(self) -> None:
        # research/10 Pillar 3 + Salesforce B2B Commerce 2024: 60-80% reorder.
        reorder_low, reorder_high = REORDER_RATE_PCT["B"]
        self.assertEqual((reorder_low, reorder_high), (60.0, 80.0))

    def test_path_b_wholesale_attach_rate_matches_faire_2024(self) -> None:
        # research/10 Pillar 2: 55-75% wholesale-attach-rate Year-2+.
        attach_low, attach_high = WHOLESALE_ATTACH_RATE_PCT["B"]
        self.assertEqual((attach_low, attach_high), (55.0, 75.0))

    def test_path_b_map_savings_matches_pillar_4(self) -> None:
        # research/10 Pillar 4: 30-50% MAP-policy savings.
        map_low, map_high = MAP_POLICY_SAVINGS_PCT["B"]
        self.assertEqual((map_low, map_high), (30.0, 50.0))

    def test_path_b_year1_roi_matches_research_10(self) -> None:
        # research/10 §Cost & ROI: Path B 6-11:1 default Year-1 ROI.
        roi_low, roi_high = PATH_ROI["B"]
        self.assertEqual((roi_low, roi_high), (6.0, 11.0))

    def test_wholesale_discount_matrix_has_5_voice_profiles(self) -> None:
        # asset 18 §6-tier wholesale-discount matrix: 5 voice profiles.
        self.assertEqual(len(WHOLESALE_DISCOUNT_MATRIX), 5)
        for voice in ("default", "luxury", "sustainable", "gen_z", "b2b"):
            self.assertIn(voice, WHOLESALE_DISCOUNT_MATRIX)

    def test_b2b_voice_discount_is_volume(self) -> None:
        # asset 18: b2b voice expects 55% high-volume + 60% distributor-tier.
        self.assertIn("55%", WHOLESALE_DISCOUNT_MATRIX["b2b"])
        self.assertIn("60%", WHOLESALE_DISCOUNT_MATRIX["b2b"])

    def test_luxury_voice_discount_protects_map(self) -> None:
        # asset 18: luxury voice expects 35% (MAP-protected).
        self.assertIn("35%", WHOLESALE_DISCOUNT_MATRIX["luxury"])
        self.assertIn("MAP", WHOLESALE_DISCOUNT_MATRIX["luxury"])

    def test_path_platforms_path_b_has_5_platforms(self) -> None:
        # research/10 Pillar 1 + playbook 17 §Phase 1: Path B = Faire + Tundra + Ankorstore + Handshake + Shopify B2B / Shopify Plus B2B.
        self.assertEqual(len(PATH_PLATFORMS["B"]), 5)
        self.assertIn("Faire", PATH_PLATFORMS["B"])
        self.assertIn("Tundra", PATH_PLATFORMS["B"])
        self.assertIn("Ankorstore", PATH_PLATFORMS["B"])
        self.assertIn("Handshake (Shopify B2B)", PATH_PLATFORMS["B"])
        self.assertIn("Shopify B2B / Shopify Plus B2B", PATH_PLATFORMS["B"])

    def test_path_c_includes_rsp_kehe_unfi(self) -> None:
        # research/10 Pillar 5: Path C includes RSP / KeHE / UNFI direct-distributor.
        self.assertIn("RSP / KeHE / UNFI direct-distributor", PATH_PLATFORMS["C"])

    def test_path_c_includes_amazon_business(self) -> None:
        # research/10 Pillar 1: Path C includes Amazon Business B2B-specialty-tier.
        self.assertIn("Amazon Business", PATH_PLATFORMS["C"])

    def test_dtc_cannibalization_rate_path_b_is_17_5_pct(self) -> None:
        # research/10 Pillar 4 §b: Path B median 17.5% cannibalization rate (10-25% MAP-protected range).
        self.assertEqual(DTC_CANNIBALIZATION_RATE["B"], 0.175)


class TestMainCLI(unittest.TestCase):
    """main() + parse_args() + build_inputs() CLI plumbing."""

    def test_default_args_yields_path_b(self) -> None:
        args = parse_args([])
        self.assertEqual(args.us_dtc_gmv, 2_000_000.0)
        self.assertEqual(args.sku_count, 35)
        self.assertEqual(args.voice_profile, "b2b")

    def test_custom_args_propagate_to_inputs(self) -> None:
        args = parse_args([
            "--us-dtc-gmv", "8000000",
            "--sku-count", "80",
            "--voice-profile", "luxury",
        ])
        inputs = build_inputs(args)
        self.assertEqual(inputs.us_dtc_gmv, 8_000_000.0)
        self.assertEqual(inputs.sku_count, 80)
        self.assertEqual(inputs.voice_profile, "luxury")

    def test_json_flag_is_false_by_default(self) -> None:
        args = parse_args([])
        self.assertFalse(args.json)

    def test_main_runs_with_defaults_returns_0(self) -> None:
        rc = main([])
        self.assertEqual(rc, 0)

    def test_main_with_invalid_input_returns_1(self) -> None:
        # Negative us_dtc_gmv triggers __post_init__ ValueError → exit 1.
        rc = main(["--us-dtc-gmv", "-1"])
        self.assertEqual(rc, 1)

    def test_main_with_json_emits_valid_json(self) -> None:
        import io
        from contextlib import redirect_stdout
        buf = io.StringIO()
        with redirect_stdout(buf):
            rc = main(["--json"])
        self.assertEqual(rc, 0)
        payload = json.loads(buf.getvalue())
        self.assertIn("inputs", payload)
        self.assertIn("recommendation", payload)
        self.assertIn("per_path_revenue", payload)
        self.assertEqual(payload["recommendation"]["path"], "B")

    def test_subprocess_cli_with_help_returns_0(self) -> None:
        result = subprocess.run(
            ["python3", os.path.join(SCRIPTS_DIR, "b2b_wholesale_unit_economics.py"), "--help"],
            capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("B2B / wholesale", result.stdout)
        self.assertIn("--us-dtc-gmv", result.stdout)
        self.assertIn("--sku-count", result.stdout)

    def test_subprocess_cli_default_runs(self) -> None:
        result = subprocess.run(
            ["python3", os.path.join(SCRIPTS_DIR, "b2b_wholesale_unit_economics.py")],
            capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Recommendation: Path B", result.stdout)

    def test_subprocess_cli_json_emits_parseable_json(self) -> None:
        result = subprocess.run(
            ["python3", os.path.join(SCRIPTS_DIR, "b2b_wholesale_unit_economics.py"), "--json"],
            capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0)
        payload = json.loads(result.stdout)
        self.assertEqual(payload["recommendation"]["path"], "B")


class TestBuildInputs(unittest.TestCase):
    """build_inputs() converts argparse Namespace → BrandB2BInputs."""

    def test_build_inputs_handles_string_bool_true(self) -> None:
        args = parse_args(["--has-faire-account", "true"])
        inputs = build_inputs(args)
        self.assertTrue(inputs.has_faire_account)

    def test_build_inputs_handles_string_bool_false(self) -> None:
        args = parse_args(["--has-faire-account", "false"])
        inputs = build_inputs(args)
        self.assertFalse(inputs.has_faire_account)

    def test_build_inputs_propagates_sales_rep_capacity(self) -> None:
        args = parse_args(["--has-dedicated-sales-rep-capacity-hours-per-week", "12"])
        inputs = build_inputs(args)
        self.assertEqual(inputs.has_dedicated_sales_rep_capacity_hours_per_week, 12)

    def test_build_inputs_propagates_sku_archetype(self) -> None:
        args = parse_args(["--sku-archetype-distribution", "balanced_50_50"])
        inputs = build_inputs(args)
        self.assertEqual(inputs.sku_archetype_distribution, "balanced_50_50")


class TestValidInput(unittest.TestCase):
    """Valid input sanity tests — covers Path A/B/C end-to-end + 2-voice variants + live mirror."""

    def test_valid_input_path_a_300k_default_voice(self) -> None:
        # Path A brand with default voice and all gates passing.
        inputs = BrandB2BInputs(
            us_dtc_gmv=300_000,
            sku_count=15,
            sku_archetype_distribution="balanced_50_50",
            gross_margin_pct=45.0,
            moq_operational_capacity=5,
            has_faire_account=True,
            has_handshake_shopify=True,
            has_net_suite_wholesale=False,
            has_rsp_or_kehe_pitch=False,
            has_corporate_gifting_catalog=True,
            voice_profile="default",
            has_dedicated_sales_rep_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "A")

    def test_valid_input_path_b_2m_sustainable_voice(self) -> None:
        # Path B brand with sustainable voice and corporate-gifting catalog → no downgrade.
        inputs = BrandB2BInputs(
            us_dtc_gmv=2_000_000,
            sku_count=40,
            sku_archetype_distribution="balanced_50_50",
            gross_margin_pct=55.0,
            moq_operational_capacity=7,
            has_faire_account=True,
            has_handshake_shopify=True,
            has_net_suite_wholesale=False,
            has_rsp_or_kehe_pitch=False,
            has_corporate_gifting_catalog=True,
            voice_profile="sustainable",
            has_dedicated_sales_rep_capacity_hours_per_week=10,
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")

    def test_valid_input_path_c_10m_genz_voice(self) -> None:
        # Path C brand with Gen-Z voice — Gen-Z has no special downgrade → stays Path C.
        inputs = BrandB2BInputs(
            us_dtc_gmv=10_000_000,
            sku_count=120,
            sku_archetype_distribution="mostly_wholesale_30_70",
            gross_margin_pct=45.0,
            moq_operational_capacity=9,
            has_faire_account=True,
            has_handshake_shopify=True,
            has_net_suite_wholesale=True,
            has_rsp_or_kehe_pitch=True,
            has_corporate_gifting_catalog=True,
            voice_profile="gen_z",
            has_dedicated_sales_rep_capacity_hours_per_week=20,
        )
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "C")

    def test_valid_input_live_mirror_default_path_b(self) -> None:
        """Live-mirror: the recommended path matches the floor-derived path for default Path B defaults."""
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.path, "B")
        # Cross-check against the floor constants.
        self.assertGreaterEqual(inputs.us_dtc_gmv, PATH_B_FLOOR)
        self.assertLess(inputs.us_dtc_gmv, PATH_C_FLOOR)

    def test_valid_input_live_mirror_year1_revenue_matches_floor(self) -> None:
        """Live-mirror: Year-1 incremental revenue $ at $2M Path B is exactly $1M-$2M."""
        inputs = BrandB2BInputs(**PATH_B_DEFAULTS)
        rec = recommend_path(inputs)
        self.assertEqual(rec.year1_incremental_revenue_low, 1_000_000.0)
        self.assertEqual(rec.year1_incremental_revenue_high, 2_000_000.0)


if __name__ == "__main__":
    unittest.main()