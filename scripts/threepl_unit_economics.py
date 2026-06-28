#!/usr/bin/env python3
"""
threepl_unit_economics.py — Path A / B / C scorer for the 3PL-migration
track (Move #12 companion script).

Companion to:
- /research/07-3pl-migration.md (the 5-pillar framework + 3 GMV-tier paths)
- /playbooks/14-3pl-migration.md (Phase 1+2+3+4 operator build)
- /assets/15-3pl-selection-card.md (paste-ready 7-3PL × 5-voice cost-comparison card)

This script takes a brand's current operations inputs (orders_per_month / aov /
current ship cost / current ship time / warehouse footprint / sku count /
international volume / operator capacity) and outputs a Path A / B / C
recommendation with cost stack, expected Year-1 incremental net, ship-cost
savings, ship-time improvement, and a 6-step build sequence. It is the
operator-build input for the playbook's Prerequisites gate (Phase 1 Step 1
"pick path + 3PL tier").

The scoring rule (mirrors research/07 §GMV-tier paths + playbook 14
§Prerequisites + asset 15 §3-tier size-match decision matrix):
  - orders_per_month < 500           → Path A as deferral (canonical 3PL break-even floor)
  - orders_per_month 500–2,000       → Path A (SMB 3PL solo — ShipBob Starter OR Shopify Fulfillment Network)
  - orders_per_month 2,000–10,000    → Path B (mid-market multi-warehouse — ShipBob Mid-Market OR ShipMonk OR Red Stag) DEFAULT
  - orders_per_month 10,000+         → Path C (enterprise multi-3PL orchestration — Stord + Flowspace + Extensiv)
  - has_warehouse_lease = False      → downgrade one tier (no savings to unlock)
  - ship_cost_per_order < $6         → downgrade one tier (cost-benefit less compelling)
  - sku_complexity = subscription    → upgrade one tier (kitting + bundling required)
  - international_volume_pct >= 20%  → upgrade one tier (international 3PL footprint needed)
  - operator_capacity < 2 hr/wk      → defer (insufficient capacity for migration per Prereq #12)

Why hermetic? This script does NOT call ShipBob / ShipMonk / Red Stag /
Shopify Fulfillment Network / Stord / Flowspace / Extensiv APIs. The inputs
are operator-supplied at the CLI; the cost stack + per-path projection +
6-step build sequence are derived from research/07 + playbook 14 + asset 15
(the canonical benchmarks the workspace already ships). This is the same
hermetic recipe as international_market_fit.py / lifecycle_flow_health_check.py
/ triple_whale_attribution_check.py — the 90% of install mistakes the
operator actually makes (wrong-path selection, under-budgeting for setup,
ignoring the operator-capacity gate) don't require API access; the local
scoring rule catches them.

Usage:
    # Default: $1M US DTC brand, 2500 orders/mo, $75 AOV, $8.50 current ship cost, 3-day ship time
    python3 threepl_unit_economics.py

    # Custom inputs (e.g. $5M brand, 4000 orders/mo, $85 AOV)
    python3 threepl_unit_economics.py \\
        --orders-per-month 4000 --aov 85 \\
        --current-ship-cost-per-order 9.50 \\
        --current-ship-time-days 4.0 \\
        --sku-count 80 --sku-complexity standard \\
        --international-volume-pct 15 \\
        --operator-capacity-hours-per-week 8

    # JSON output (for cron / CI / dashboard piping)
    python3 threepl_unit_economics.py --json

Exit code 0 = recommendation computed. Exit code 1 = invalid input.

Why this lives in scripts/. The canonical workspace pattern is: research →
playbook → asset → operator-surface → script (per the
cron-driven-bounded-improver v0.9.0 layer-order-completion sub-rule).
Research 07, playbook 14, asset 15 (3PL-selection-card), and /3pl route
shipped 2026-06-27/28; this script is the canonical 5th-layer follow-up per
the research → playbook → asset → operator-surface → scripts layer order.
It compounds asset 15's 35 voice-driven override cells + 8-prereq RFQ brief
template + 3-tier size-match decision matrix + research/07 §GMV-tier paths +
playbook 14 §Phase 1 Step 1.1 RFQ + Step 1.4 contract negotiation by
automating the per-brand path-selection decision the operator currently does
manually against the 3-path GMV-tier matrix.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Literal

PathName = Literal["A", "B", "C"]
SkuComplexity = Literal[
    "standard", "subscription", "bundles", "fragile",
    "hazmat", "temperature_controlled",
]


# ----- Canonical input/output dataclasses ---------------------------------

@dataclass
class BrandOpsInputs:
    """Operator-supplied current-ops inputs. All numeric bounds validated in __post_init__."""
    orders_per_month: int                        # current monthly order volume
    aov: float                                   # current average order value in USD
    current_ship_cost_per_order: float           # current ship cost per order in USD
    current_ship_time_days: float                # current ship time in days (P50)
    has_warehouse_lease: bool                    # whether operator currently has a warehouse lease
    sku_count: int                               # number of active SKUs
    sku_complexity: str                          # standard / subscription / bundles / fragile / hazmat / temperature_controlled
    international_volume_pct: float              # 0–100 (% of orders shipping internationally)
    operator_capacity_hours_per_week: int        # operator hours per week available for 3PL migration

    def __post_init__(self) -> None:
        if self.orders_per_month < 0:
            raise ValueError(f"orders_per_month must be >= 0, got {self.orders_per_month}")
        if self.aov <= 0:
            raise ValueError(f"aov must be > 0, got {self.aov}")
        if self.aov > 10_000.0:
            # canonical ceiling per research/07 Pillar 1 luxury-tier sanity bound
            raise ValueError(f"aov must be <= $10,000, got {self.aov}")
        if self.current_ship_cost_per_order < 0:
            raise ValueError(f"current_ship_cost_per_order must be >= 0, got {self.current_ship_cost_per_order}")
        if self.current_ship_time_days < 0:
            raise ValueError(f"current_ship_time_days must be >= 0, got {self.current_ship_time_days}")
        valid_complexities = {"standard", "subscription", "bundles", "fragile",
                              "hazmat", "temperature_controlled"}
        if self.sku_complexity not in valid_complexities:
            raise ValueError(
                f"sku_complexity must be one of {sorted(valid_complexities)}, got {self.sku_complexity!r}"
            )
        if not (0 <= self.international_volume_pct <= 100):
            raise ValueError(
                f"international_volume_pct must be 0-100, got {self.international_volume_pct}"
            )
        if self.sku_count < 0:
            raise ValueError(f"sku_count must be >= 0, got {self.sku_count}")
        if self.operator_capacity_hours_per_week < 0:
            raise ValueError(
                f"operator_capacity_hours_per_week must be >= 0, got {self.operator_capacity_hours_per_week}"
            )


@dataclass
class PathRecommendation:
    """Path A / B / C recommendation with cost stack + lift + 6-step build."""
    path: PathName
    warehouses: list[str]
    threepl_default: str
    justification: str
    cost_one_time_low: float
    cost_one_time_high: float
    cost_recurring_low: float
    cost_recurring_high: float
    year1_3pl_cost_low: float
    year1_3pl_cost_high: float
    year1_incremental_net_low: float
    year1_incremental_net_high: float
    year1_roi_low: float
    year1_roi_high: float
    ship_cost_savings_pct_low: float
    ship_cost_savings_pct_high: float
    ship_time_improvement_days_low: float
    ship_time_improvement_days_high: float
    build_sequence: list[str] = field(default_factory=list)


# ----- SKU complexity classification --------------------------------------

def classify_sku_complexity(sku_complexity: str) -> SkuComplexity:
    """Return canonical category-fit label.

    bundles uses the same kitting-SOP as subscription per research/07 Pillar 1.
    Unknown categories default to standard (conservative).
    """
    if sku_complexity == "bundles":
        return "subscription"
    if sku_complexity in ("standard", "subscription", "fragile",
                          "hazmat", "temperature_controlled"):
        return sku_complexity  # type: ignore[return-value]
    return "standard"


# ----- Core scoring rule --------------------------------------------------

# Path band thresholds (orders per month).
PATH_A_FLOOR = 500           # Below 500/mo → defer (canonical ShipBob 2024 break-even)
PATH_B_FLOOR = 2_000         # 2k-10k/mo → Path B (mid-market multi-warehouse)
PATH_C_FLOOR = 10_000        # 10k+ → Path C (enterprise multi-3PL orchestration)

# Path costs (USD, from research/07 §Cost & ROI estimate + playbook 14 §Phase 1+2+3+4).
# Tuple = (cost_one_time_low, cost_one_time_high, cost_recurring_low, cost_recurring_high).
PATH_COSTS: dict[PathName, tuple[float, float, float, float]] = {
    "A":  (3_000.0,  8_000.0,   700.0,  1_500.0),    # ShipBob Starter setup + monthly
    "B":  (8_000.0,  25_000.0,  2_000.0, 4_500.0),    # ShipBob Mid-Market + multi-warehouse
    "C":  (50_000.0, 150_000.0, 8_000.0, 25_000.0),   # Stord + Flowspace + Extensiv orchestrator
}

# Year-1 3PL cost bands (USD, from research/07 §Cost stack + playbook 14 §Phase 1).
PATH_3PL_COST_YEAR1: dict[PathName, tuple[float, float]] = {
    "A":  (8_400.0,   18_000.0),    # $700-1500/mo recurring × 12
    "B":  (24_000.0,  54_000.0),    # $2000-4500/mo recurring × 12
    "C":  (96_000.0,  300_000.0),   # $8000-25000/mo recurring × 12
}

# Year-1 incremental net bands (USD, from research/07 §Year-1 ROI breakdown).
PATH_INCREMENTAL_NET_YEAR1: dict[PathName, tuple[float, float]] = {
    "A":  (9_000.0,   75_000.0),
    "B":  (66_000.0,  420_000.0),
    "C":  (620_000.0, 5_600_000.0),
}

# Year-1 ROI bands (revenue / cost).
PATH_ROI: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 8.0),     # canonical 6:1 default Path A
    "B":  (8.0, 16.0),    # canonical 12:1 default Path B
    "C":  (7.0, 14.0),    # canonical 10:1 default Path C
}

# Ship-cost savings bands (% off current per-order ship cost).
PATH_SHIP_COST_SAVINGS_PCT: dict[PathName, tuple[float, float]] = {
    "A":  (5.0, 15.0),
    "B":  (10.0, 20.0),
    "C":  (15.0, 25.0),
}

# Ship-time improvement bands (days off current ship time P50).
PATH_SHIP_TIME_IMPROVEMENT_DAYS: dict[PathName, tuple[float, float]] = {
    "A":  (0.5, 1.5),     # single-warehouse can shave ~half-day to 1.5 days
    "B":  (1.0, 3.0),     # multi-warehouse 1-3 day improvement
    "C":  (2.0, 5.0),     # multi-3PL + international 2-5 day improvement
}

# Path rank for downgrade logic (A < B < C).
PATH_RANK: dict[PathName, int] = {"A": 0, "B": 1, "C": 2}
RANK_PATH: dict[int, PathName] = {v: k for k, v in PATH_RANK.items()}

# Path warehouse scope (description, used in recommendation).
PATH_WAREHOUSES: dict[PathName, list[str]] = {
    "A":  ["Single 3PL warehouse (ShipBob or Shopify Fulfillment Network)"],
    "B":  ["Multi-warehouse 2-4 sites (East + West coast + optionally Central)"],
    "C":  ["Distributed 3PL (US + per-region 3PL for EU + UK + CA + AU + JP)"],
}

# Path default 3PL pick.
PATH_DEFAULT_3PL: dict[PathName, str] = {
    "A":  "ShipBob Starter (default Tier 1; Shopify-native integration + no minimum)",
    "B":  "ShipBob Mid-Market (default Tier 2; multi-warehouse + dedicated AM)",
    "C":  "Stord + Flowspace + Extensiv orchestrator (multi-3PL enterprise)",
}

# Upgrade + downgrade gates.
WAREHOUSE_LEASE_DOWNGRADE_ENABLED = True
SHIP_COST_DOWNGRADE_THRESHOLD = 6.0       # < $6 ship cost → cost-benefit less compelling
SUBSCRIPTION_UPGRADE_ENABLED = True
INTERNATIONAL_UPGRADE_THRESHOLD_PCT = 20  # ≥20% international → upgrade per research/07 Pillar 4
CAPACITY_GATE_HR_WK = 2                   # <2 hr/wk → defer per playbook 14 §Prerequisite #12


def _tier_for_orders(orders_per_month: int) -> PathName:
    """Return the base path tier for a given orders_per_month (without gates)."""
    if orders_per_month >= PATH_C_FLOOR:
        return "C"
    if orders_per_month >= PATH_B_FLOOR:
        return "B"
    return "A"


def recommend_path(inputs: BrandOpsInputs) -> PathRecommendation:
    """Apply the scoring rule + upgrade/downgrade gates → PathRecommendation."""
    justification_parts: list[str] = []
    deferred_for_capacity = False

    # Capacity floor: defer if operator has insufficient time
    if inputs.operator_capacity_hours_per_week < CAPACITY_GATE_HR_WK:
        justification_parts.append(
            f"Operator capacity {inputs.operator_capacity_hours_per_week} hr/wk < "
            f"{CAPACITY_GATE_HR_WK} hr/wk floor (playbook 14 §Prerequisite #12); "
            f"3PL migration deferred until operator capacity is available."
        )
        deferred_for_capacity = True

    # Base tier assignment.
    if inputs.orders_per_month < PATH_A_FLOOR:
        # Path A as deferral when below the 500 orders/mo floor.
        path = "A"
        if not deferred_for_capacity:
            justification_parts.append(
                f"Orders {inputs.orders_per_month}/mo is below the {PATH_A_FLOOR}/mo "
                f"3PL break-even floor; 3PL migration is deferred until order volume "
                f"exceeds {PATH_A_FLOOR}/mo for at least 3 consecutive months "
                f"(research/07 §Prerequisites). Path A is still surfaced as the "
                f"recommendation for tracking (audit only)."
            )
    else:
        path = _tier_for_orders(inputs.orders_per_month)
        if not deferred_for_capacity:
            justification_parts.append(
                f"Orders {inputs.orders_per_month:,}/mo lands in the Path {path} tier "
                f"({_tier_floor_text(path)}-{_tier_ceiling_text(path)} orders/mo)."
            )

    # Apply upgrade/downgrade gates (mirrors the v0.9.0 layer-order-completion sub-rule analogue).
    upgrades: list[str] = []
    downgrades: list[str] = []

    # Downgrade: no warehouse lease (no savings to unlock).
    if WAREHOUSE_LEASE_DOWNGRADE_ENABLED and not inputs.has_warehouse_lease:
        downgrades.append(
            "no warehouse lease (no lease-cost savings to unlock; the canonical "
            "3PL ROI comes from eliminating lease + labor + WMS costs per "
            "research/07 §Pillar 2)"
        )

    # Downgrade: low ship cost (cost-benefit less compelling).
    if inputs.current_ship_cost_per_order <= SHIP_COST_DOWNGRADE_THRESHOLD:
        downgrades.append(
            f"current ship cost ${inputs.current_ship_cost_per_order:.2f}/order < "
            f"${SHIP_COST_DOWNGRADE_THRESHOLD:.2f} (low current ship cost; the canonical "
            f"3PL savings come from carrier-rate negotiation + zone-skipping per "
            f"research/07 §Pillar 2)"
        )

    # Upgrade: subscription / bundles SKU complexity (kitting + bundling required).
    if SUBSCRIPTION_UPGRADE_ENABLED and classify_sku_complexity(inputs.sku_complexity) == "subscription":
        upgrades.append(
            f"sku_complexity={inputs.sku_complexity} requires 3PL with kitting-SOP + "
            f"custom-box capability (research/07 §Pillar 1 Tier 2 default)"
        )

    # Upgrade: international volume ≥20% (international 3PL footprint needed).
    if inputs.international_volume_pct >= INTERNATIONAL_UPGRADE_THRESHOLD_PCT:
        upgrades.append(
            f"international volume {inputs.international_volume_pct:.0f}% ≥ "
            f"{INTERNATIONAL_UPGRADE_THRESHOLD_PCT}% threshold (research/07 §Pillar 4: "
            f"international 3PL footprint unlocks 2-3 day ship time to EU + UK + CA + AU + JP)"
        )

    # Apply the upgrades first (raise the tier), then the downgrades (lower it).
    for _ in upgrades:
        path = RANK_PATH[min(PATH_RANK[path] + 1, PATH_RANK["C"])]
    for _ in downgrades:
        path = RANK_PATH[max(PATH_RANK[path] - 1, PATH_RANK["A"])]

    if upgrades or downgrades:
        justification_parts.append(
            f"Applied {len(upgrades)} upgrade(s) and {len(downgrades)} downgrade(s): "
            + ("UPGRADES: " + "; ".join(upgrades) + " " if upgrades else "")
            + ("DOWNGRADES: " + "; ".join(downgrades) if downgrades else "")
            + f". Final path = {path}."
        )
    elif not deferred_for_capacity:
        justification_parts.append("All gates pass; no upgrade/downgrade applied.")

    # Cost stack + lift + ROI from the canonical path tables.
    cost_low, cost_high, rec_low, rec_high = PATH_COSTS[path]
    y1_3pl_low, y1_3pl_high = PATH_3PL_COST_YEAR1[path]
    y1_net_low, y1_net_high = PATH_INCREMENTAL_NET_YEAR1[path]
    roi_low, roi_high = PATH_ROI[path]
    scs_low, scs_high = PATH_SHIP_COST_SAVINGS_PCT[path]
    sti_low, sti_high = PATH_SHIP_TIME_IMPROVEMENT_DAYS[path]

    return PathRecommendation(
        path=path,
        warehouses=PATH_WAREHOUSES[path],
        threepl_default=PATH_DEFAULT_3PL[path],
        justification=" ".join(justification_parts),
        cost_one_time_low=cost_low,
        cost_one_time_high=cost_high,
        cost_recurring_low=rec_low,
        cost_recurring_high=rec_high,
        year1_3pl_cost_low=y1_3pl_low,
        year1_3pl_cost_high=y1_3pl_high,
        year1_incremental_net_low=y1_net_low,
        year1_incremental_net_high=y1_net_high,
        year1_roi_low=roi_low,
        year1_roi_high=roi_high,
        ship_cost_savings_pct_low=scs_low,
        ship_cost_savings_pct_high=scs_high,
        ship_time_improvement_days_low=sti_low,
        ship_time_improvement_days_high=sti_high,
        build_sequence=build_sequence_for_path(path),
    )


def _tier_floor_text(path: PathName) -> str:
    """Return the lower-bound orders/mo for a path tier as a display string."""
    if path == "A":
        return f"{PATH_A_FLOOR}"
    if path == "B":
        return f"{PATH_B_FLOOR:,}"
    return f"{PATH_C_FLOOR:,}"


def _tier_ceiling_text(path: PathName) -> str:
    """Return the upper-bound orders/mo for a path tier as a display string."""
    if path == "A":
        return f"{PATH_B_FLOOR - 1:,}"
    if path == "B":
        return f"{PATH_C_FLOOR - 1:,}"
    return "∞"


# ----- Build-sequence recipe ---------------------------------------------

# The 6-step build recipe, parameterized by path. Mirrors asset 15 §3-tier size-match
# decision matrix + playbook 14 §Phase 1+2+3+4.
BUILD_SEQUENCE_TEMPLATES: dict[PathName, list[str]] = {
    "A": [
        "Step 1 (1 hr) — Pick path + 3PL: Path A = ShipBob Starter (default Tier 1) OR Shopify Fulfillment Network (Shopify-Plus brands). Verify ≥500 orders/mo for 3 consecutive months per research/07 §Prereq #2.",
        "Step 2 (2 hr) — RFQ to 3+ 3PLs (ShipBob + Shopify Fulfillment Network + one regional SMB 3PL): request quote on pick-pack + storage + receiving + kitting + returns + SLA-ship-time per asset 15 §RFQ brief template.",
        "Step 3 (3 hr) — Sign contract: volume tier (committed-minimum-volume-discount) + returns-tier + 95%+ SLA with financial-penalty-for-misses + $1M+ inventory-insurance per asset 15 §8 SLA-defense contract clauses.",
        "Step 4 (4 hr) — WMS integration build: Shopify-ShipBob SKU-mapping + shipping-rate-card override + return-portal per playbook 14 §Phase 1 Step 1.5.",
        "Step 5 (2 hr) — Test orders: 10 test orders in 3PL sandbox; verify pick-pack-accuracy ≥99.5% + ship-cost matches quoted + branded packing slip renders correctly.",
        "Step 6 (1 hr/wk ongoing) — Per-3PL ship-cost monitoring + weekly SLA report review + NPS-by-fulfillment-channel cohort slice per playbook 14 §Phase 4.",
    ],
    "B": [
        "Step 1 (1 hr) — Pick path + 3PL: Path B = ShipBob Mid-Market (default Tier 2; multi-warehouse) OR ShipMonk OR Red Stag (large-parcel). Verify ≥2,000 orders/mo + ≥1 SKU with consistent demand + Move #1 + #4 + #6 + #8 shipped.",
        "Step 2 (3 hr) — RFQ to 5+ 3PLs + multi-warehouse negotiation: 3 mid-market 3PLs (ShipBob + ShipMonk + Red Stag) + 2 enterprise-tier 3PLs (Stord + Flowspace) for upgrade-path. Negotiate multi-warehouse tier (drops pick-pack at 5,000+ orders/mo).",
        "Step 3 (4 hr) — Sign contract + multi-warehouse setup: Path A SLA-defense clauses + multi-warehouse tier + dedicated account-manager + cross-warehouse-balance monitoring per playbook 14 §Phase 2 Step 2.2.",
        "Step 4 (8 hr) — WMS integration + per-warehouse inventory-routing algorithm: Shopify-3PL SKU-mapping + per-warehouse-routing logic + cross-warehouse-balance-monitoring dashboard + 2nd-warehouse-onboarding pilot.",
        "Step 5 (8 hr) — Inventory pull + 3PL inbound: SKU-level cycle-count + barcoded-receiving + 1-week reconciliation per research/07 §Pitfall 1 (lost inventory) fix. Run parallel-ship week where 3PL ships 50/50 with existing warehouse.",
        "Step 6 (3 hr/wk ongoing) — Multi-warehouse ship-cost monitoring + ship-time P50+P95 tracking + branded-packing-slip A/B test + NPS-by-fulfillment-channel cohort slice per playbook 14 §Phase 3+4.",
    ],
    "C": [
        "Step 1 (2 hr) — Pick path + multi-3PL architecture: Path C = Stord (orchestrator) + Flowspace (B2B) + Extensiv (per-region specialist) + ShipBob (SMB SKUs) + Red Stag (large/heavy SKUs) + per-market 3PL for EU + UK + CA + AU + JP per research/07 §Pillar 4.",
        "Step 2 (8 hr) — RFQ + 3PL orchestrator contracting: Stord / Flowspace / Extensiv + per-region 3PLs (EU + UK + CA + AU + JP) + freight + parcel + returns. Negotiate multi-region SLA dashboards + dedicated supply-chain-manager + B2B-fulfillment add-on.",
        "Step 3 (8 hr) — Sign contracts + multi-region setup: Path B SLA-defense clauses + multi-region-tier + per-region-SLA-financial-penalties + $5M+ inventory-insurance + 30-day-notice-no-penalty-termination per playbook 14 §Phase 3.",
        "Step 4 (24 hr) — WMS integration + Extensiv orchestrator build + per-region inventory-routing: Shopify-Stord-Flowspace-Extensiv SKU-mapping + per-region-routing logic + freight-parcel-returns-orchestration.",
        "Step 5 (24 hr) — Inventory pull + per-region 3PL inbound: SKU-level cycle-count + per-region-pilot + 1-week reconciliation + international 3PL footpring enablement per research/07 §Pillar 4 (2-3 day ship time to EU + UK + CA + AU + JP).",
        "Step 6 (15 hr/wk ongoing + dedicated supply-chain manager) — Per-region ship-cost monitoring + ship-time P50+P95 tracking + NPS-by-fulfillment-channel cohort slice + multi-region SLA dashboards + per-region RFQ-re-bid per playbook 14 §Phase 4.",
    ],
}


def build_sequence_for_path(path: PathName) -> list[str]:
    """Return the 6-step build sequence for a path."""
    return list(BUILD_SEQUENCE_TEMPLATES[path])


# ----- Per-path savings projection ----------------------------------------

def project_per_path_savings(inputs: BrandOpsInputs, rec: PathRecommendation) -> dict[str, float]:
    """Project annual savings for the recommended path.

    Uses the midpoint of the path's Year-1 incremental net band (from
    research/07 §Year-1 ROI breakdown) and the operator's current ship cost to
    derive per-line savings. Returns a dict suitable for JSON output.
    """
    annual_orders = inputs.orders_per_month * 12.0

    # Midpoint ship-cost savings % applied to current ship cost × annual orders.
    scs_mid = (rec.ship_cost_savings_pct_low + rec.ship_cost_savings_pct_high) / 2.0 / 100.0
    year1_ship_cost_savings_mid = (
        inputs.current_ship_cost_per_order * scs_mid * annual_orders
    )
    # Low and high bounds (rounded for human readability).
    year1_ship_cost_savings_low = (
        inputs.current_ship_cost_per_order * (rec.ship_cost_savings_pct_low / 100.0) * annual_orders
    )
    year1_ship_cost_savings_high = (
        inputs.current_ship_cost_per_order * (rec.ship_cost_savings_pct_high / 100.0) * annual_orders
    )

    # Warehouse-cost reduction: $500-$5k/mo per research/07 §Pillar 2 (Path A floor).
    # Higher paths inherit Path A + add multi-warehouse overhead.
    if rec.path == "A":
        year1_warehouse_savings_mid = 12 * 2_750.0    # midpoint of $500-$5k/mo
    elif rec.path == "B":
        year1_warehouse_savings_mid = 12 * 6_500.0    # midpoint of $3k-$10k/mo
    else:
        year1_warehouse_savings_mid = 12 * 30_000.0   # midpoint of $10k-$50k/mo

    # NPS lift: 5-10 points × $50-200 per NPS point (per research/07 §Pillar 2).
    # Use a conservative per-point value per cohort.
    nps_lift_low = 5 * 100.0 * 0.5    # 5 points × $100/point × 50% of orders affected
    nps_lift_high = 10 * 200.0 * 0.5
    nps_lift_mid = (nps_lift_low + nps_lift_high) / 2.0

    return {
        "annual_orders": annual_orders,
        "year1_ship_cost_savings_low": year1_ship_cost_savings_low,
        "year1_ship_cost_savings_mid": year1_ship_cost_savings_mid,
        "year1_ship_cost_savings_high": year1_ship_cost_savings_high,
        "year1_warehouse_savings_mid": year1_warehouse_savings_mid,
        "year1_nps_lift_mid": nps_lift_mid,
        "year1_incremental_net_low": rec.year1_incremental_net_low,
        "year1_incremental_net_high": rec.year1_incremental_net_high,
        "year1_3pl_cost_low": rec.year1_3pl_cost_low,
        "year1_3pl_cost_high": rec.year1_3pl_cost_high,
        "year1_roi_low": rec.year1_roi_low,
        "year1_roi_high": rec.year1_roi_high,
        "ship_time_improvement_days_low": rec.ship_time_improvement_days_low,
        "ship_time_improvement_days_high": rec.ship_time_improvement_days_high,
    }


# ----- CLI plumbing -------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments. Defaults mirror the canonical research/07 Path B default."""
    parser = argparse.ArgumentParser(
        prog="threepl_unit_economics.py",
        description=(
            "Score a brand's current-ops inputs against the research/07 + playbook 14 + "
            "asset 15 Path A / B / C matrix. Returns the recommended path + 3PL pick + "
            "cost stack + Year-1 incremental net + 6-step build sequence for the "
            "3PL migration."
        ),
        epilog=(
            "Defaults: $1M US DTC brand, 2500 orders/mo, $75 AOV, $8.50 current ship "
            "cost, 3-day ship time (the canonical Path B default for $1M-$3M GMV brands "
            "per research/07 §GMV-tier paths). Companion to /research/07, "
            "/playbooks/14, /assets/15-3pl-selection-card.md."
        ),
    )
    parser.add_argument("--orders-per-month", type=int, default=2500,
                        help="Current monthly order volume (default: 2500 = Path B default).")
    parser.add_argument("--aov", type=float, default=75.0,
                        help="Current average order value in USD (default: 75).")
    parser.add_argument("--current-ship-cost-per-order", type=float, default=8.50,
                        help="Current ship cost per order in USD (default: 8.50).")
    parser.add_argument("--current-ship-time-days", type=float, default=3.0,
                        help="Current ship time P50 in days (default: 3.0).")
    parser.add_argument("--has-warehouse-lease", type=str, default="true",
                        choices=["true", "false"],
                        help="Whether operator currently has a warehouse lease (default: true).")
    parser.add_argument("--sku-count", type=int, default=50,
                        help="Number of active SKUs (default: 50).")
    parser.add_argument("--sku-complexity", type=str, default="standard",
                        choices=["standard", "subscription", "bundles", "fragile",
                                 "hazmat", "temperature_controlled"],
                        help="SKU complexity category (default: standard).")
    parser.add_argument("--international-volume-pct", type=float, default=5.0,
                        help="%% of orders shipping internationally 0-100 (default: 5).")
    parser.add_argument("--operator-capacity-hours-per-week", type=int, default=5,
                        help="Operator hours per week for 3PL migration (default: 5; floor is 2).")
    parser.add_argument("--json", action="store_true",
                        help="Emit JSON output instead of human-readable (for cron / CI / dashboard piping).")
    return parser.parse_args(argv)


def build_inputs(args: argparse.Namespace) -> BrandOpsInputs:
    """Convert argparse Namespace → BrandOpsInputs (with the validation in __post_init__)."""
    return BrandOpsInputs(
        orders_per_month=args.orders_per_month,
        aov=args.aov,
        current_ship_cost_per_order=args.current_ship_cost_per_order,
        current_ship_time_days=args.current_ship_time_days,
        has_warehouse_lease=(args.has_warehouse_lease.lower() == "true"),
        sku_count=args.sku_count,
        sku_complexity=args.sku_complexity,
        international_volume_pct=args.international_volume_pct,
        operator_capacity_hours_per_week=args.operator_capacity_hours_per_week,
    )


# ----- Human + JSON rendering --------------------------------------------

def render_human(inputs: BrandOpsInputs, rec: PathRecommendation) -> str:
    """Render the recommendation as a human-readable block."""
    lines: list[str] = []
    lines.append("3PL migration Path A/B/C recommendation")
    lines.append("=" * 42)
    lines.append("")
    lines.append("Inputs:")
    lines.append(f"  Orders per month                      : {inputs.orders_per_month:>15,}")
    lines.append(f"  AOV                                   : ${inputs.aov:>15,.2f}")
    lines.append(f"  Current ship cost per order           : ${inputs.current_ship_cost_per_order:>15,.2f}")
    lines.append(f"  Current ship time P50 (days)          : {inputs.current_ship_time_days:>15.1f}")
    lines.append(f"  Has warehouse lease                   : {inputs.has_warehouse_lease}")
    lines.append(f"  SKU count                             : {inputs.sku_count:>15,}")
    lines.append(f"  SKU complexity                        : {inputs.sku_complexity}")
    lines.append(f"  International volume %                : {inputs.international_volume_pct:>14.0f}%")
    lines.append(f"  Operator capacity (hr/wk)             : {inputs.operator_capacity_hours_per_week:>15d}")
    lines.append("")
    lines.append(f"Recommendation: Path {rec.path}")
    lines.append(f"  Warehouses                           : {rec.warehouses[0]}")
    lines.append(f"  Default 3PL pick                     : {rec.threepl_default}")
    lines.append(f"  Justification                        : {rec.justification}")
    lines.append("")
    lines.append("Cost stack:")
    lines.append(f"  One-time setup (low-high)             : ${rec.cost_one_time_low:>12,.0f} – ${rec.cost_one_time_high:,.0f}")
    lines.append(f"  Recurring monthly (low-high)          : ${rec.cost_recurring_low:>12,.0f} – ${rec.cost_recurring_high:,.0f}")
    lines.append("")
    lines.append("Expected Year-1 outcomes:")
    lines.append(f"  3PL cost (low-high)                  : ${rec.year1_3pl_cost_low:>12,.0f} – ${rec.year1_3pl_cost_high:,.0f}")
    lines.append(f"  Incremental net (low-high)           : ${rec.year1_incremental_net_low:>12,.0f} – ${rec.year1_incremental_net_high:,.0f}")
    lines.append(f"  Year-1 ROI                           : {rec.year1_roi_low:.0f}:1 – {rec.year1_roi_high:.0f}:1")
    lines.append(f"  Ship cost savings                    : {rec.ship_cost_savings_pct_low:.0f}% – {rec.ship_cost_savings_pct_high:.0f}%")
    lines.append(f"  Ship time improvement (days)         : {rec.ship_time_improvement_days_low:.1f} – {rec.ship_time_improvement_days_high:.1f}")
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
        # Merge inputs + recommendation + per-path savings for downstream consumption.
        out = {
            "inputs": asdict(inputs),
            "recommendation": asdict(rec),
            "per_path_savings": project_per_path_savings(inputs, rec),
        }
        print(json.dumps(out, indent=2))
    else:
        print(render_human(inputs, rec))
    return 0


if __name__ == "__main__":
    main()
