#!/usr/bin/env python3
"""
test_post_purchase_upsell_roi.py — TDD tests for the post-purchase upsell ROI
forecast script.

Companion to /playbooks/02-post-purchase-upsell-reconvert.md.

Run from the workspace root:
    python3 scripts/tests/test_post_purchase_upsell_roi.py

The script under test:
- Validates FlowInputs (acceptance rate in [0,1], AOV > 0, take_rate in [0,1],
  upsell_aov > 0, etc.)
- Forecasts monthly incremental AOV / incremental revenue / incremental margin
  / monthly platform cost / net lift / ROI ratio
- Classifies a health band ("great" / "good" / "marginal" / "weak")
- Renders a human-readable summary with the key figures
- Emits JSON via --json that roundtrips through json.loads
- Exits non-zero on invalid CLI input
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.dirname(HERE)
WORKSPACE_ROOT = os.path.dirname(SCRIPTS_DIR)
SCRIPT_PATH = os.path.join(SCRIPTS_DIR, "post_purchase_upsell_roi.py")


class ImportFlowInputs(unittest.TestCase):
    """The forecast module exposes FlowInputs and Forecast dataclasses + forecast() fn."""

    @classmethod
    def setUpClass(cls):
        # Add scripts/ to sys.path so we can import the module directly.
        sys.path.insert(0, SCRIPTS_DIR)
        cls.mod = __import__("post_purchase_upsell_roi")

    def test_flowinputs_and_forecast_importable(self):
        self.assertTrue(hasattr(self.mod, "FlowInputs"))
        self.assertTrue(hasattr(self.mod, "Forecast"))
        self.assertTrue(hasattr(self.mod, "forecast"))

    def test_health_band_function_exists(self):
        self.assertTrue(callable(getattr(self.mod, "health_band", None)))


class FlowInputsValidation(unittest.TestCase):
    """Boundary checks on FlowInputs constructor."""

    @classmethod
    def setUpClass(cls):
        sys.path.insert(0, SCRIPTS_DIR)
        cls.mod = __import__("post_purchase_upsell_roi")

    def _make(self, **kw):
        defaults = dict(
            orders_per_month=1000,
            base_aov=80.0,
            upsell_acceptance_rate=0.12,
            upsell_aov=35.0,
            upsell_margin=0.65,
            platform_cost_per_order=0.10,
        )
        defaults.update(kw)
        return self.mod.FlowInputs(**defaults)

    def test_default_construction_succeeds(self):
        fi = self._make()
        self.assertEqual(fi.orders_per_month, 1000)
        self.assertEqual(fi.upsell_acceptance_rate, 0.12)

    def test_negative_orders_rejected(self):
        with self.assertRaises(ValueError):
            self._make(orders_per_month=-5)

    def test_zero_base_aov_rejected(self):
        with self.assertRaises(ValueError):
            self._make(base_aov=0)

    def test_negative_base_aov_rejected(self):
        with self.assertRaises(ValueError):
            self._make(base_aov=-10)

    def test_acceptance_rate_above_one_rejected(self):
        with self.assertRaises(ValueError):
            self._make(upsell_acceptance_rate=1.5)

    def test_negative_acceptance_rate_rejected(self):
        with self.assertRaises(ValueError):
            self._make(upsell_acceptance_rate=-0.1)

    def test_negative_upsell_aov_rejected(self):
        with self.assertRaises(ValueError):
            self._make(upsell_aov=-5)

    def test_margin_above_one_rejected(self):
        with self.assertRaises(ValueError):
            self._make(upsell_margin=1.1)

    def test_negative_margin_rejected(self):
        with self.assertRaises(ValueError):
            self._make(upsell_margin=-0.05)

    def test_negative_platform_cost_rejected(self):
        with self.assertRaises(ValueError):
            self._make(platform_cost_per_order=-0.10)


class ForecastMath(unittest.TestCase):
    """Verify the forecast outputs for canonical inputs."""

    @classmethod
    def setUpClass(cls):
        sys.path.insert(0, SCRIPTS_DIR)
        cls.mod = __import__("post_purchase_upsell_roi")

    def _forecast(self, **kw):
        defaults = dict(
            orders_per_month=1000,
            base_aov=80.0,
            upsell_acceptance_rate=0.12,
            upsell_aov=35.0,
            upsell_margin=0.65,
            platform_cost_per_order=0.10,
        )
        defaults.update(kw)
        return self.mod.forecast(self.mod.FlowInputs(**defaults))

    def test_zero_orders_yields_zero_everywhere(self):
        f = self._forecast(orders_per_month=0)
        self.assertEqual(f.incremental_revenue_per_month, 0.0)
        self.assertEqual(f.incremental_margin_per_month, 0.0)
        self.assertEqual(f.net_lift_per_month, 0.0)
        self.assertEqual(f.upsell_units_per_month, 0)
        self.assertEqual(f.roi_ratio, 0.0)
        # No orders → no platform cost → "no platform cost" branch in health_band.
        self.assertEqual(f.health_band, "great (no platform cost)")

    def test_default_inputs_match_published_benchmarks(self):
        """1,000 orders * 15% accept * $35 upsell * 70% margin = $3,675 net margin/mo.

        Sourced from ReConvert/AfterSell public case studies: 15-20% acceptance,
        65-75% gross margin on consumables. At default $0.10/order platform
        cost, that lands at 36.75:1 net lift per $1 platform cost → "great".
        """
        f = self._forecast(
            orders_per_month=1000,
            base_aov=80.0,
            upsell_acceptance_rate=0.15,
            upsell_aov=35.0,
            upsell_margin=0.70,
            platform_cost_per_order=0.10,
        )
        self.assertEqual(f.upsell_units_per_month, 150)
        self.assertAlmostEqual(f.incremental_revenue_per_month, 5250.0, places=2)
        self.assertAlmostEqual(
            f.incremental_margin_per_month, 5250.0 * 0.70, places=2
        )
        # 3675 - 100 = 3575 net lift
        self.assertAlmostEqual(f.net_lift_per_month, 5250.0 * 0.70 - 100.0, places=2)
        # ROI = net lift / cost = 3575 / 100 = 35.75
        self.assertAlmostEqual(f.roi_ratio, 35.75, places=2)
        self.assertIn("great", f.health_band)

    def test_higher_acceptance_lifts_revenue(self):
        f_low = self._forecast(upsell_acceptance_rate=0.10)
        f_high = self._forecast(upsell_acceptance_rate=0.20)
        self.assertGreater(
            f_high.incremental_revenue_per_month,
            f_low.incremental_revenue_per_month,
        )
        self.assertGreater(
            f_high.incremental_margin_per_month,
            f_low.incremental_margin_per_month,
        )

    def test_higher_upsell_aov_lifts_revenue(self):
        f_low = self._forecast(upsell_aov=20.0)
        f_high = self._forecast(upsell_aov=60.0)
        self.assertGreater(
            f_high.incremental_revenue_per_month,
            f_low.incremental_revenue_per_month,
        )

    def test_higher_margin_lifts_net_lift(self):
        f_low = self._forecast(upsell_margin=0.40)
        f_high = self._forecast(upsell_margin=0.75)
        self.assertGreater(
            f_high.incremental_margin_per_month,
            f_low.incremental_margin_per_month,
        )
        self.assertGreater(f_high.net_lift_per_month, f_low.net_lift_per_month)

    def test_zero_acceptance_yields_zero_incremental_revenue(self):
        f = self._forecast(upsell_acceptance_rate=0.0)
        self.assertEqual(f.incremental_revenue_per_month, 0.0)
        self.assertEqual(f.upsell_units_per_month, 0)

    def test_health_band_thresholds(self):
        # great >= 30:1
        f_great = self._forecast(
            orders_per_month=5000,
            base_aov=120.0,
            upsell_acceptance_rate=0.20,
            upsell_aov=60.0,
            upsell_margin=0.75,
            platform_cost_per_order=0.10,
        )
        self.assertIn("great", f_great.health_band)
        # weak < 5:1
        f_weak = self._forecast(
            orders_per_month=50,
            base_aov=40.0,
            upsell_acceptance_rate=0.02,
            upsell_aov=10.0,
            upsell_margin=0.30,
            platform_cost_per_order=0.30,
        )
        self.assertIn("weak", f_weak.health_band)


class RenderHuman(unittest.TestCase):
    """The human-render output includes the key figures as LOOSE substrings."""

    @classmethod
    def setUpClass(cls):
        sys.path.insert(0, SCRIPTS_DIR)
        cls.mod = __import__("post_purchase_upsell_roi")

    def test_render_contains_key_figures(self):
        fi = self.mod.FlowInputs(
            orders_per_month=1000,
            base_aov=80.0,
            upsell_acceptance_rate=0.15,
            upsell_aov=35.0,
            upsell_margin=0.70,
            platform_cost_per_order=0.10,
        )
        f = self.mod.forecast(fi)
        out = self.mod.render_human(f)
        # Loose substring assertions: don't pin whitespace/currency/format.
        # Render rounds ROI to 1 decimal (35.7:1); assert on the loose form.
        self.assertIn("5,250", out, msg=f"expected incremental revenue 5,250 in: {out}")
        self.assertIn("3,675", out, msg=f"expected incremental margin 3,675 in: {out}")
        self.assertIn("35.7", out, msg=f"expected roi 35.7 (loose, render rounds) in: {out}")
        self.assertIn("100", out, msg=f"expected platform cost 100 in: {out}")
        self.assertIn("great", out, msg=f"expected great health band in: {out}")


class CLIBehavior(unittest.TestCase):
    """The CLI runs, accepts --json, emits valid JSON, and rejects bad input."""

    @classmethod
    def setUpClass(cls):
        sys.path.insert(0, SCRIPTS_DIR)
        cls.mod = __import__("post_purchase_upsell_roi")

    def _run(self, *args, expect_ok=True):
        result = subprocess.run(
            [sys.executable, SCRIPT_PATH, *args],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result

    def test_help_exits_zero_and_describes_args(self):
        r = self._run("--help")
        self.assertEqual(r.returncode, 0)
        self.assertIn("--orders", r.stdout)
        self.assertIn("--aov", r.stdout)
        self.assertIn("--acceptance", r.stdout)
        self.assertIn("--upsell-aov", r.stdout)
        self.assertIn("--margin", r.stdout)
        self.assertIn("--cost", r.stdout)
        self.assertIn("--json", r.stdout)

    def test_default_run_succeeds_and_renders_human(self):
        r = self._run()
        self.assertEqual(r.returncode, 0)
        self.assertIn("5,250", r.stdout)
        # Render rounds ROI to 1 decimal ("35.7:1"); assert on the loose form.
        self.assertIn("35.7", r.stdout)

    def test_json_output_is_valid_json(self):
        r = self._run("--json")
        self.assertEqual(r.returncode, 0)
        # Last non-empty line should be the JSON envelope
        payload = json.loads(r.stdout.strip())
        self.assertIn("forecast", payload)
        self.assertIn("inputs", payload)
        self.assertIn("health_band", payload["forecast"])

    def test_json_roundtrip_contains_numeric_fields(self):
        r = self._run(
            "--orders", "1000",
            "--aov", "80",
            "--acceptance", "0.15",
            "--upsell-aov", "35",
            "--margin", "0.70",
            "--cost", "0.10",
            "--json",
        )
        self.assertEqual(r.returncode, 0)
        payload = json.loads(r.stdout.strip())
        self.assertEqual(
            payload["forecast"]["incremental_revenue_per_month"], 5250.0
        )
        self.assertEqual(payload["forecast"]["upsell_units_per_month"], 150)

    def test_invalid_input_exits_nonzero(self):
        r = self._run("--aov", "-50")
        self.assertNotEqual(r.returncode, 0)
        # Should mention the validation failure on stderr
        combined = (r.stderr + r.stdout).lower()
        self.assertTrue(
            "aov" in combined or "value" in combined or "error" in combined,
            msg=f"expected validation error, got: {combined}",
        )

    def test_invalid_acceptance_exits_nonzero(self):
        r = self._run("--acceptance", "1.5")
        self.assertNotEqual(r.returncode, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
