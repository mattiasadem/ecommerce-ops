#!/usr/bin/env python3
"""
test_3pl_unit_economics.py — TDD tests for the 3PL-migration Path A/B/C
scorer (Archetype A/B hybrid scoring script per playbook 14 + research/07).

Companion to:
- research/07-3pl-migration.md (5-pillar framework + 3 GMV-tier paths)
- playbooks/14-3pl-migration.md (Phase 1+2+3+4 operator build)
- assets/15-3pl-selection-card.md (paste-ready 7-3PL × 5-voice cost-comparison card)

Run: python3 scripts/tests/test_3pl_unit_economics.py

The script takes a brand's current operations inputs (orders_per_month / aov /
current ship cost / current ship time / warehouse footprint / sku count /
international volume) → outputs Path A (SMB 3PL solo) / Path B (mid-market
multi-warehouse) / Path C (enterprise multi-3PL orchestration) recommendation
with cost stack + expected Year-1 incremental net + ship-cost savings +
ship-time improvement + 6-step build sequence.

The scoring rule (mirrors research/07 §GMV-tier paths + playbook 14
§Prerequisites + asset 15 §3-tier size-match decision matrix):
- orders_per_month < 500               → defer (Path A recommended for tracking)
- orders_per_month 500–2,000           → Path A (SMB 3PL solo)
- orders_per_month 2,000–10,000        → Path B (mid-market multi-warehouse) DEFAULT
- orders_per_month 10,000+             → Path C (enterprise multi-3PL orchestration)
- has_warehouse_lease = False          → downgrade one tier (no savings to unlock)
- ship_cost_per_order > $9 baseline    → downgrade one tier (cost-benefit less compelling)
- sku_complexity = "subscription"      → upgrade one tier (kitting + bundling required)
- international_volume_pct >= 20       → upgrade one tier (international 3PL footprint needed)
- operator_capacity_hours_per_week < 2 → defer (insufficient capacity for migration)

The script is hermetic — it does NOT call ShipBob / ShipMonk / Red Stag / Stord /
Flowspace / Extensiv APIs. Inputs are operator-supplied at the CLI; the cost
stack + per-path projection + 6-step build sequence are derived from
research/07 + playbook 14 + asset 15 (the canonical benchmarks the workspace
already ships). Same hermetic recipe as international_market_fit.py /
lifecycle_flow_health_check.py / triple_whale_attribution_check.py.
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

from threepl_unit_economics import (  # noqa: E402
    BrandOpsInputs,
    PathRecommendation,
    build_inputs,
    classify_sku_complexity,
    main,
    parse_args,
    recommend_path,
    render_human,
    project_per_path_savings,
)


# ============================================================
# Test classes — split by canonical scoring branch.
# ============================================================


class TestBrandOpsInputsValidation(unittest.TestCase):
    """BrandOpsInputs.__post_init__ validates input bounds."""

    def test_negative_orders_per_month_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=-1,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_zero_aov_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_negative_aov_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=-10,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_aov_above_ceiling_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=20000,  # canonical ceiling per research/07 Pillar 1 luxury-tier
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_negative_ship_cost_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=-1,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_negative_ship_time_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=-1,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_sku_complexity_must_be_canonical(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="weird",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_international_volume_pct_above_100_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=101,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_negative_sku_count_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=-1,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_negative_operator_capacity_rejected(self):
        try:
            BrandOpsInputs(
                orders_per_month=1000,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=-1,
            )
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_valid_inputs_construct(self):
        inputs = BrandOpsInputs(
            orders_per_month=2500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        assert inputs.orders_per_month == 2500
        assert inputs.aov == 75.0


class TestClassifySkuComplexity(unittest.TestCase):
    """classify_sku_complexity returns canonical category-fit labels."""

    def test_standard_is_standard(self):
        assert classify_sku_complexity("standard") == "standard"

    def test_subscription_is_subscription(self):
        assert classify_sku_complexity("subscription") == "subscription"

    def test_bundles_is_subscription(self):
        # bundles use the same kitting-SOP as subscriptions
        assert classify_sku_complexity("bundles") == "subscription"

    def test_fragile_is_fragile(self):
        assert classify_sku_complexity("fragile") == "fragile"

    def test_hazmat_is_hazmat(self):
        assert classify_sku_complexity("hazmat") == "hazmat"

    def test_temperature_controlled_is_temperature_controlled(self):
        assert classify_sku_complexity("temperature_controlled") == "temperature_controlled"

    def test_unknown_defaults_to_standard(self):
        # Conservative default per playbook 14 §Pillar 5
        assert classify_sku_complexity("made-up-category") == "standard"


class TestRecommendPathBaseTiers(unittest.TestCase):
    """Base tier assignment from orders_per_month (no gates applied)."""

    def test_below_500_orders_per_month_defers(self):
        # Below the canonical 500 orders/mo 3PL break-even
        inputs = BrandOpsInputs(
            orders_per_month=200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"  # Path A as deferral tracking
        assert "deferred" in rec.justification.lower() or "below" in rec.justification.lower()

    def test_500_to_2000_orders_per_month_is_path_a(self):
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"

    def test_2000_to_10000_orders_per_month_is_path_b_default(self):
        # Canonical Path B default per research/07
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "B"

    def test_10000_plus_orders_per_month_is_path_c(self):
        inputs = BrandOpsInputs(
            orders_per_month=15000,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "C"


class TestRecommendPathGates(unittest.TestCase):
    """Upgrade + downgrade gates per playbook 14 §Prerequisites."""

    def test_no_warehouse_lease_downgrades_one_tier(self):
        # 3500 orders/mo → Path B base; no lease → Path A (downgrade)
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=False,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"  # downgraded from Path B
        assert "lease" in rec.justification.lower() or "downgrade" in rec.justification.lower()

    def test_low_ship_cost_downgrades_one_tier(self):
        # 3500 orders/mo → Path B; $6 ship cost (< $9 baseline) → Path A
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=6.0,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"
        assert "ship" in rec.justification.lower() or "downgrade" in rec.justification.lower()

    def test_subscription_kitting_upgrades_one_tier(self):
        # 1200 orders/mo → Path A base; subscription → Path B
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="subscription",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "B"
        assert "kitting" in rec.justification.lower() or "subscription" in rec.justification.lower()

    def test_international_volume_25_pct_upgrades_one_tier(self):
        # 1200 orders/mo → Path A; intl 25% → Path B (per research/07 Pillar 4)
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=25,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "B"
        assert "international" in rec.justification.lower() or "upgrad" in rec.justification.lower()

    def test_low_operator_capacity_defers(self):
        # 1200 orders/mo → Path A; < 2 hr/wk → defer
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=1,
        )
        rec = recommend_path(inputs)
        assert "defer" in rec.justification.lower() or "capacity" in rec.justification.lower()

    def test_path_a_cannot_downgrade_below_a(self):
        # 200 orders/mo → Path A; no lease → already at A; stays A
        inputs = BrandOpsInputs(
            orders_per_month=200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=False,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"  # clamped at A

    def test_path_c_cannot_upgrade_past_c(self):
        # 15000 orders/mo → Path C; subscription → already at C; stays C
        inputs = BrandOpsInputs(
            orders_per_month=15000,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="subscription",
            international_volume_pct=30,
            operator_capacity_hours_per_week=15,
        )
        rec = recommend_path(inputs)
        assert rec.path == "C"  # clamped at C


class TestPathRecommendationStructure(unittest.TestCase):
    """PathRecommendation dataclass + per-path bands."""

    def test_path_a_default_6_to_1_roi(self):
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "A"
        assert 4.0 <= rec.year1_roi_low <= 8.0
        assert rec.year1_roi_high >= rec.year1_roi_low
        assert rec.year1_3pl_cost_low > 0
        assert rec.year1_3pl_cost_high >= rec.year1_3pl_cost_low

    def test_path_b_default_12_to_1_roi(self):
        # Canonical Path B default
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.path == "B"
        assert 8.0 <= rec.year1_roi_low <= 16.0
        assert rec.year1_roi_high >= rec.year1_roi_low

    def test_path_c_default_10_to_1_roi(self):
        inputs = BrandOpsInputs(
            orders_per_month=15000,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=15,
        )
        rec = recommend_path(inputs)
        assert rec.path == "C"
        assert 7.0 <= rec.year1_roi_low <= 14.0
        assert rec.year1_roi_high >= rec.year1_roi_low

    def test_all_paths_have_6_step_build_sequence(self):
        for orders in [800, 3500, 15000]:
            inputs = BrandOpsInputs(
                orders_per_month=orders,
                aov=75.0,
                current_ship_cost_per_order=8.5,
                current_ship_time_days=3.0,
                has_warehouse_lease=True,
                sku_count=50,
                sku_complexity="standard",
                international_volume_pct=5,
                operator_capacity_hours_per_week=5,
            )
            rec = recommend_path(inputs)
            assert len(rec.build_sequence) >= 5, f"Path {rec.path} has {len(rec.build_sequence)} steps"

    def test_ship_time_improvement_days_set(self):
        # Path B multi-warehouse should give 1-3 days ship-time improvement
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=4.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        assert rec.ship_time_improvement_days_low >= 0
        assert rec.ship_time_improvement_days_high >= rec.ship_time_improvement_days_low


class TestProjectPerPathSavings(unittest.TestCase):
    """project_per_path_savings computes annual savings for the recommended path."""

    def test_path_a_savings_in_range(self):
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        proj = project_per_path_savings(inputs, rec)
        # Path A: $9k-$75k Year-1 net per research/07
        assert 5_000 <= proj["year1_incremental_net_low"] <= 15_000
        assert proj["year1_incremental_net_high"] >= proj["year1_incremental_net_low"]
        assert proj["year1_ship_cost_savings_low"] > 0

    def test_path_b_savings_in_range(self):
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        proj = project_per_path_savings(inputs, rec)
        # Path B: $66k-$420k Year-1 net per research/07
        assert 50_000 <= proj["year1_incremental_net_low"] <= 100_000
        assert proj["year1_incremental_net_high"] >= proj["year1_incremental_net_low"]

    def test_path_c_savings_in_range(self):
        inputs = BrandOpsInputs(
            orders_per_month=15000,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=15,
        )
        rec = recommend_path(inputs)
        proj = project_per_path_savings(inputs, rec)
        # Path C: $620k-$5.6M Year-1 net per research/07
        assert proj["year1_incremental_net_low"] >= 500_000


class TestBuildSequenceForPath(unittest.TestCase):
    """Each path has a tailored 6-step build sequence per asset 15 / playbook 14."""

    def test_path_a_build_sequence_mentions_shipbob(self):
        inputs = BrandOpsInputs(
            orders_per_month=1200,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence).lower()
        assert "rfq" in all_steps
        assert "shipbob" in all_steps or "starter" in all_steps

    def test_path_b_build_sequence_mentions_multi_warehouse(self):
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence).lower()
        assert "multi-warehouse" in all_steps or "2nd" in all_steps or "east" in all_steps

    def test_path_c_build_sequence_mentions_international(self):
        inputs = BrandOpsInputs(
            orders_per_month=15000,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=15,
        )
        rec = recommend_path(inputs)
        all_steps = " ".join(rec.build_sequence).lower()
        assert "international" in all_steps or "eu" in all_steps or "jp" in all_steps or "orchestration" in all_steps


class TestRenderHuman(unittest.TestCase):
    """render_human produces a non-empty human-readable block."""

    def test_renders_recommendation_block(self):
        inputs = BrandOpsInputs(
            orders_per_month=3500,
            aov=75.0,
            current_ship_cost_per_order=8.5,
            current_ship_time_days=3.0,
            has_warehouse_lease=True,
            sku_count=50,
            sku_complexity="standard",
            international_volume_pct=5,
            operator_capacity_hours_per_week=5,
        )
        rec = recommend_path(inputs)
        text = render_human(inputs, rec)
        assert "3PL" in text or "Path" in text
        assert "orders_per_month" in text or "Orders" in text
        assert "build" in text.lower() or "step" in text.lower()
        assert len(text) > 500


class TestMainCLI(unittest.TestCase):
    """main() runs end-to-end + emits human or JSON."""

    def test_default_human_output(self, capsys=None):
        rc = main([])
        assert rc == 0

    def test_custom_inputs_path_b(self):
        rc = main([
            "--orders-per-month", "3500",
            "--aov", "75",
            "--current-ship-cost-per-order", "8.5",
            "--current-ship-time-days", "3",
            "--sku-count", "50",
            "--sku-complexity", "standard",
            "--international-volume-pct", "5",
            "--operator-capacity-hours-per-week", "5",
        ])
        assert rc == 0

    def test_json_output_is_valid_json(self, capsys=None):
        import io
        import contextlib

        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc = main(["--json"])
        assert rc == 0
        data = json.loads(buf.getvalue())
        assert "inputs" in data
        assert "recommendation" in data
        assert "per_path_savings" in data
        assert data["recommendation"]["path"] in ("A", "B", "C")

    def test_subprocess_help(self):
        # --help exits 0 and prints usage
        result = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/threepl_unit_economics.py", "--help"],
            capture_output=True, text=True
        )
        assert result.returncode == 0
        assert "usage" in result.stdout.lower() or "options" in result.stdout.lower()

    def test_subprocess_default_runs_clean(self):
        # The script must run with no args + exit 0 (the canonical sanity check).
        result = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/threepl_unit_economics.py"],
            capture_output=True, text=True
        )
        assert result.returncode == 0
        assert "Path" in result.stdout
        assert "3PL" in result.stdout or "Recommendation" in result.stdout

    def test_subprocess_json_runs_clean(self):
        result = subprocess.run(
            [sys.executable, SCRIPTS_DIR + "/threepl_unit_economics.py", "--json"],
            capture_output=True, text=True
        )
        assert result.returncode == 0
        # Round-trip via json.loads
        data = json.loads(result.stdout)
        assert "recommendation" in data


class TestBuildInputs(unittest.TestCase):
    """build_inputs converts argparse Namespace → BrandOpsInputs."""

    def test_defaults_to_path_b(self):
        args = parse_args([])
        inputs = build_inputs(args)
        # Default: 2500 orders/mo → Path B per research/07
        assert inputs.orders_per_month == 2500

    def test_custom_args_build_inputs(self):
        args = parse_args(["--orders-per-month", "5000", "--aov", "120"])
        inputs = build_inputs(args)
        assert inputs.orders_per_month == 5000
        assert inputs.aov == 120


class TestCanonicalDefaultsPublished(unittest.TestCase):
    """The canonical defaults are pinned — verified by this test (research/07 cite)."""

    def test_orders_per_month_floor_published(self):
        # The 500 orders/mo floor is the canonical ShipBob break-even threshold
        from threepl_unit_economics import PATH_A_FLOOR
        assert PATH_A_FLOOR == 500

    def test_path_b_floor_published(self):
        from threepl_unit_economics import PATH_B_FLOOR
        assert PATH_B_FLOOR == 2_000

    def test_path_c_floor_published(self):
        from threepl_unit_economics import PATH_C_FLOOR
        assert PATH_C_FLOOR == 10_000

    def test_international_threshold_published(self):
        # 20% international volume triggers upgrade per research/07 Pillar 4
        from threepl_unit_economics import INTERNATIONAL_UPGRADE_THRESHOLD_PCT
        assert INTERNATIONAL_UPGRADE_THRESHOLD_PCT == 20

    def test_capacity_floor_published(self):
        # <2 hr/wk = defer per playbook 14 §Prerequisite #12
        from threepl_unit_economics import CAPACITY_GATE_HR_WK
        assert CAPACITY_GATE_HR_WK == 2


def _run_via_unittest() -> int:
    """Run all test classes via unittest; return 0 on green, 1 on red."""
    import unittest
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for cls in [
        TestBrandOpsInputsValidation,
        TestClassifySkuComplexity,
        TestRecommendPathBaseTiers,
        TestRecommendPathGates,
        TestPathRecommendationStructure,
        TestProjectPerPathSavings,
        TestBuildSequenceForPath,
        TestRenderHuman,
        TestMainCLI,
        TestBuildInputs,
        TestCanonicalDefaultsPublished,
    ]:
        suite.addTests(loader.loadTestsFromTestCase(cls))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(_run_via_unittest())
