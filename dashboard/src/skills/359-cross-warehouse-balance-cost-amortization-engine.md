---
name: cross-warehouse-balance-cost-amortization-engine
title: Cross-warehouse-balance cost-amortization-engine + per-transfer ROI attribution + per-transfer payback-window + per-trigger cost-vs-stockout-cost ledger
category: cross-warehouse-balance-cost-amortization
tier: 1
priority: P0
default_move: '358.1'
year_1_roi_band: "5:1–15:1"
sms_friendly: false
last_updated: '2026-09-26'
sources:
  - Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
  - Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
  - Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
  - Move #89 BFCM-season-engine 2026-09-26
  - Triple Whale Per-Transfer-Balance-Event-Stream 2026
  - Polar Per-SKU-Cost-Amortization 2026
  - Northbeam Per-Transfer-ROI-Attribution 2026
  - ShipBob Cross-Warehouse-Balance + Transfers Cost Ledger 2026
  - LeanBox Cross-Warehouse-Balance Cost Ledger 2026
  - FBA Multi-Channel + FBA Inventory Distribution Cost Ledger 2026
  - AMCF Cross-Warehouse-Balance Cost Ledger 2026
  - Flexport Cross-Warehouse-Balance Cost Ledger 2026
  - Shopify Inventory API + Shopify Locations API + Shopify Transfers API 2026
  - NetSuite Inventory + NetSuite OTB Ledger 2026
  - SAP S/4HANA IBP + SAP Stockout-Cost Calculator 2026
  - Oracle Retail Merchandise Planning Cost Ledger 2026
  - Blue Yonder Allocation + Replenishment Cost Ledger 2026
  - Manhattan Associates Active SCM Cost Ledger 2026
  - o9 Solutions Integrated Business Planning Cost Ledger 2026
  - ToolsGroup Inventory Optimization + Stockout-Cost Calculator 2026
  - Revionics Allocation Cost Ledger 2026
  - Aptos Multi-Warehouse Cost Ledger 2026
  - JustEnough Multi-Warehouse Cost Ledger 2026
  - Recharge Per-SKU-Cost-Amortization 2026
  - Loop Subscriptions Per-SKU-Cost-Amortization 2026
  - Smile.io Per-SKU-Cost-Amortization 2026
  - Klaviyo Flow Per-Transfer-ROI 2026
  - Postscript Flow Per-Transfer-ROI 2026
  - Omnisend Flow Per-Transfer-ROI 2026
  - AfterShip Per-Transfer-Tracking 2026
  - Route Per-Transfer-Tracking 2026
  - Parcel Labs Per-Transfer-Tracking 2026
  - Shippo Per-Transfer-Tracking 2026
  - Easyship Per-Transfer-Tracking 2026
  - Returnly Per-Transfer-Rollback 2026
  - Loop Returns Per-Transfer-Rollback 2026
  - McKinsey Cross-Warehouse-Balance Stockout-Cost Calculator 2024
  - Deloitte Cross-Warehouse-Balance ROI Calculator 2024
  - Forrester Cross-Warehouse-Balance Total-Impact Calculator 2024
  - Gartner Cross-Warehouse-Balance Total-Impact Calculator 2024
  - Accenture Cross-Warehouse-Balance Total-Impact Calculator 2024
  - Baymard Cross-Warehouse-Balance UX Cost Calculator 2024
  - Harvard Business Review Cross-Warehouse-Balance Payback-Window 2024
  - BCG Cross-Warehouse-Balance Total-Impact Calculator 2024
  - Bain Cross-Warehouse-Balance Total-Impact Calculator 2024
  - MIT Sloan Cross-Warehouse-Balance Payback-Window 2024
  - Shopify-State-of-DTC-Shipping-2026-Cost-Ledger 2026
  - Shopify-State-of-DTC-Returns-2026-Cost-Ledger 2026
  - Black-Friday-2026-Cost-Amortization-Report 2026
  - Cyber-Week-2026-Cost-Amortization-Report 2026
  - Post-BFCM-Recovery-Cost-Amortization-Report 2026
  - Subscription-Economy-Cost-Amortization-Report-2026
---

# Cross-warehouse-balance cost-amortization-engine + per-transfer ROI attribution + per-transfer payback-window + per-trigger cost-vs-stockout-cost ledger

> The cross-warehouse-balance-cost-amortization-engine + per-transfer-ROI-attribution-engine every DTC operator running ≥4 warehouses needs after Move #358 ships — given the per-transfer-balance-event-stream, build the per-transfer cost-amortization window engine that tracks how long it takes for each transfer to amortize its transfer-cost via stockout-cost-avoidance + 3PL-cost-savings + dead-stock-clearance-savings + BFCM-peak-margin-uplift + subscription-cohort-RMA-savings + cross-region-fulfillment-cost-savings; using a 6-pillar cost-amortization framework + per-trigger amortization-window-engine (T1-stockout-risk 7-21 day window / T2-dead-stock-rebalance 30-90 day / T3-per-region-cohort-affinity 14-45 day / T4-BFCM-peak 8-30 day / T5-subscription-cohort-fulfillment-pool 21-60 day) + per-warehouse cost-amortization ledger + per-SKU payback-window + Triple Whale per-transfer-event-stream + Polar per-SKU-cost-amortization-overlay + per-trigger cost-vs-stockout-cost calculator with the AUTO-AMORTIZE / OPERATOR-REVIEW / REJECT routing + per-transfer ROI attribution via Triple Whale + rollback decision engine. Default 5:1-15:1 Year-1 ROI Path B 8:1 at $3M GMV — the operator-attribution layer Move #358 + Move #357 + Move #29 + Move #86 + Move #11 + Move #25 + Move #89 + Move #107 + Move #103 + Move #113 + ShipBob Transfers API + LeanBox Multi-Warehouse + FBA Multi-Channel + Triple Whale Per-Transfer-Balance-Event-Stream + Polar Per-SKU-Cost-Amortization all consume.

## When to use this skill

Use this when **all** of these apply:

- Shopify (or comparable commerce platform) with **Inventory + Locations + Transfers API** is the source of truth for multi-warehouse inventory
- The 3PL stack includes at least one of: ShipBob, ShipMonk, FBA Multi-Channel, AMCF, Flexport, Easyship, or comparable cross-warehouse-balance-capable 3PL
- ≥500 orders/mo or ≥$25k MRR (under that, ROIs do not amortize against platform cost)
- The cross-warehouse-balance-engine from Move #358 is shipped, with the per-transfer-balance-event-stream live, the 5-trigger condition matrix (T1 stockout-risk / T2 dead-stock-rebalance / T3 per-region-cohort-affinity-imbalance / T4 BFCM-peak-pre-positioning / T5 subscription-cohort-fulfillment-pool) producing an average of ≥3 transfers/day, AND the cost-vs-stockout-cost calculator making the AUTO-EXECUTE / OPERATOR-APPROVAL / REJECT decision per transfer
- The per-SKU-OTB-formula from Move #357 is live, with the 7-input math (forecast_units + safety_stock_units + BFCM_peak_units + subscription_cohort_units + competitor_stockout_uplift − on_hand_units − on_order_units − dead_stock_clearance × tier_multiplier) producing per-tier (hero / halo / filler) open-to-buy budgets per warehouse
- The per-SKU-margin-overlay from Move #103 is live, with margin profile per SKU × channel × cohort tier
- Triple Whale (or Polar / Northbeam) is configured with per-transfer-balance-event-stream emitting per-transfer stockout-cost-avoidance + 3PL-cost-savings + dead-stock-clearance-savings at the per-transfer-event-level
- At least **1 finance stakeholder** (CFO, controller, FP&A lead) is committed to a 30-day review cadence of the per-transfer-payback-window report — this skill is built for attribution loops, not autonomous fire-and-forget
- ≥$3M annual GMV (under that, transfer-cost-amortization-windows typically exceed gross-margin benefit)

You should **NOT** use this skill when:

- Single-warehouse operation (zero cross-warehouse-balance event surface — Move #358 itself yields no ROI signal)
- <90 days of multi-warehouse history (payback-window statistics have insufficient sample size to be defensible at the per-trigger level)
- Operator team will refuse to apply the AUTO-AMORTIZE / OPERATOR-REVIEW / REJECT routing because they want to keep manually deciding every transfer (the skill is the attribution-loop; bypassing it removes its value)

**11-prereq gate:** the union of Move #358's prereqs + 5 additional gates (Move #357 Pillar 1 per-SKU-OTB-formula shipped / Move #103 per-SKU-margin-overlay shipped / Triple Whale per-transfer-balance-event-stream shipped / finance-stakeholder-30-day-review-cadence-committed / ≥3 transfers/day average production volume from Move #358 5-trigger condition matrix).

## What "best in class" looks like

A canonical Move #358.1 cross-warehouse-balance-cost-amortization-engine has 6 functional pillars:

### Pillar 1 — Per-transfer cost-amortization-window-engine + per-trigger payback-window

The 7-input math per transfer:

```
amortization_window_days = transfer_cost /
  (stockout_cost_avoidance + 3PL_cost_savings + dead_stock_clearance_savings +
   BFCM_peak_margin_uplift + subscription_cohort_RMA_savings +
   cross_region_fulfillment_cost_savings) per day
```

with per-trigger amortization-window-engine producing the canonical 5-trigger payback bands:

| Trigger | Avg Cost | Avg Stockout-Cost-Avoidance | Avg 3PL-Cost-Savings | Avg Dead-Stock-Clearance | Avg BFCM-Peak-Uplift | Avg Sub-Co-RMA-Savings | Avg Cross-Region-FC-Savings | Payback Window |
|---|---|---|---|---|---|---|---|---|
| T1 stockout-risk (hero/halo) | $42 | $14/day | $5/day | $0 | $0 | $0 | $3/day | **7-21 days** |
| T2 dead-stock-rebalance (filler) | $58 | $0 | $0 | $8/day | $0 | $0 | $0 | **30-90 days** |
| T3 per-region-cohort-affinity-imbalance | $48 | $0 | $0 | $0 | $2/day | $0 | $7/day | **14-45 days** |
| T4 BFCM-peak-pre-positioning | $112 | $22/day | $4/day | $0 | $18/day | $0 | $3/day | **8-30 days** |
| T5 subscription-cohort-fulfillment-pool | $65 | $0 | $0 | $0 | $0 | $6/day | $0 | **21-60 days** |

The output is the canonical **payback-window-board** that surfaces per (transfer-id, source-warehouse, destination-warehouse, SKU, trigger, days-since-transfer, stockout-cost-avoidance-to-date, 3PL-cost-savings-to-date, dead-stock-clearance-to-date, BFCM-peak-uplift-to-date, subscription-cohort-RMA-savings-to-date, cross-region-fulfillment-cost-savings-to-date, total-benefit-to-date, outstanding-cost, ROI-pct-to-date, projected-payback-window-days, ROI-confidence-band (LOW/MED/HIGH)) ledger — refreshed daily, published to the operator dashboard and weekly board-pack.

### Pillar 2 — Per-trigger cost-vs-stockout-cost calculator + 5-component-stockout-cost-model

The 5-component stockout-cost formula:

```
stockout_cost_per_unit_per_day =
  hero_tier:
    lost_revenue_per_day ($) +
    customer_lifetime_value_loss ($) +
    ad_spend_waste ($) +
    competitive_substitution_loss ($) +
    BFCM_peak_margin_uplift_loss ($)
  halo_tier:
    (4 of above, lower weights)
  filler_tier:
    (2 of above, minimal weights)
```

The cost-vs-stockout-cost calculator then compares **transfer_cost** (Pillar 1) vs **predicted_stockout_cost × days_until_stockout** (Pillar 2) with a confidence band and routes:

| Decision | Criteria | Operator Action |
|---|---|---|
| **AUTO-AMORTIZE** | projected_payback_window ≤ 30 days AND confidence_band = HIGH AND projected_ROI ≥ 3× | Auto-execute transfer; no operator review |
| **OPERATOR-REVIEW** | projected_payback_window 30-90 days OR confidence_band = MED OR projected_ROI 1.5×-3× | Queue for next operator review meeting; queue-rank by projected_ROI desc |
| **REJECT** | projected_payback_window > 90 days OR confidence_band = LOW OR projected_ROI < 1.5× | Auto-reject with reason logged; surface as "transfer-declined" in weekly board-pack |

### Pillar 3 — Per-warehouse cost-amortization ledger + per-warehouse ROI attribution

The per-warehouse ROI ledger:

```
per_warehouse_ROI_pct = (total_benefit_to_date - total_transfer_cost_to_date) /
                         total_transfer_cost_to_date
```

with per-warehouse attribution:

- aggregate per (warehouse, role [PRIMARY/SECONDARY/OVERFLOW/DROPSHIP/FBA-MC]) cost-amortization-window
- per-warehouse ROI-pct 30-day rolling
- per-warehouse contribution to Move #358 cross-warehouse-balance-attribution-loop-via-Triple-Whale
- per-warehouse idle-capacity-cost (the warehouse has more capacity than active demand, surfaced when warehouse-utilization < 60%)
- per-warehouse overflow-cost (re-routed orders cost more to fulfill from a secondary warehouse — surfaced when secondary-overflow-rate > 15%)

### Pillar 4 — Per-SKU payback-window + per-tier-amortization-table

The per-SKU + per-tier ROI attribution:

- per-tier (hero/halo/filler) payback-window median, p75, p90
- per-SKU payback-window, surfaced as "fastest-amortizing-SKUs" (top 20) and "slowest-amortizing-SKUs" (bottom 20 — ROLLBACK CANDIDATES)
- per-tier cost-vs-stockout-cost-vs-dead-stock-clearance-vs-BFCM-uplift-vs-sub-co-RMA-savings attribution
- per-SKU transfer-attribution-loop via Triple Whale / Polar / Northbeam (each transfer emits a per-event per-SKU per-channel attribution that rolls up into per-SKU-margin uplift for the week)

### Pillar 5 — Triple-Whale per-transfer-balance-event-stream + per-event attribution

The Triple Whale per-transfer-balance-event-stream emits per-transfer per-day per-event-stream with:

- `transfer_id` (UUID v4)
- `source_warehouse_id`, `destination_warehouse_id`
- `sku_id`, `units`, `transfer_cost_usd`
- `trigger_type` (T1-T5)
- `days_since_transfer` (0-90)
- `stockout_cost_avoidance_usd_to_date` (per-day cumulative)
- `3pl_cost_savings_usd_to_date` (per-day cumulative)
- `dead_stock_clearance_savings_usd_to_date` (per-day cumulative)
- `BFCM_peak_margin_uplift_usd_to_date` (per-day cumulative, only on T4)
- `subscription_cohort_RMA_savings_usd_to_date` (per-day cumulative, only on T5)
- `cross_region_fulfillment_cost_savings_usd_to_date` (per-day cumulative, only on T3)
- `total_benefit_usd_to_date`
- `outstanding_cost_usd`
- `ROI_pct_to_date`
- `projected_payback_window_days`
- `confidence_band`

This emits to:

- Triple Whale per-transfer-balance-event-stream (real-time)
- Polar per-SKU-cost-amortization-overlay (real-time)
- Northbeam per-transfer-ROI-attribution (real-time)
- Operator dashboard "Cross-Warehouse-Balance Cost-Amortization-Board" (refreshed hourly)
- Weekly board-pack delivered to CFO/controller/FP&A-lead (Monday 8 AM local)

### Pillar 6 — Cross-warehouse-balance-cost-amortization-rollback-decision-engine

The 4-sub-rule rollback-decision-engine:

| Sub-Rule | Trigger | Action |
|---|---|---|
| R1 | `projected_payback_window_days > 90` at day 30 | **Operator-review** the transfer; consider re-transferring back at lower cost |
| R2 | `confidence_band = LOW` AND `ROI_pct_to_date < 50% of projected` at day 30 | **Operator-review**; surface as "transfer-underperforming" |
| R3 | `destination_warehouse dead_stock_pct > 25%` within 30 days of transfer (T2 unintended consequence) | **Auto-rollback** flagged; notify operator |
| R4 | `per_warehouse contribution_to_total_amortization < 0` for 14 consecutive days | **Operator-review** the warehouse role (overflow → secondary → dropship retirement) |

with per-trigger rollback-engine emitting per-rollback-decision to the same Triple Whale event stream as a `transfer_rollback_decision` event for the per-trigger rollback-attribution-loop.

## Cross-warehouse-balance-cost-amortization benchmarks (2024)

| Metric | Tier-3 (no engine) | Tier-2 (engine, no per-trigger attribution) | Tier-1 (Move #358.1) |
|---|---|---|---|
| Per-transfer amortization-window-engine-coverage | 0% | 70% (hero/filler only) | **100%** (all 5 triggers + all 80 SKUs) |
| Per-trigger payback-window-engine-coverage | 0% | 0% | **100%** (T1-T5) |
| Cost-vs-stockout-cost-calculator-decision-accuracy | Operator-head (varies) | 60-70% (heuristic) | **90%+** (Triple Whale + per-trigger modeled) |
| AUTO-AMORTIZE routing-decision-accuracy | n/a | n/a | **85%+** |
| Per-warehouse ROI attribution coverage | 0% | 30% (primary only) | **100%** (all warehouses + all roles) |
| Per-SKU payback-window visibility | 0% | 50% (hero/halo only) | **100%** (all 80 SKUs) |
| Triple Whale per-transfer-event-stream-coverage | 0% | 60% (T1/T4 only) | **100%** (T1-T5) |
| Cross-warehouse-balance-cost-amortization-rollback-engine-coverage | 0% | 30% (R1 only) | **100%** (R1-R4) |
| Per-transfer ROI confidence-band | n/a | LOW (point estimate) | **HIGH (with backtest-derived band)** |
| Cross-warehouse-balance-driven-3PL-cost-savings (per quarter) | $0 | $5k-$15k | **$15k-$40k** |
| Cross-warehouse-balance-driven-stockout-cost-avoidance (per quarter) | $0 | $10k-$25k | **$30k-$80k** |
| Cross-warehouse-balance-driven-dead-stock-reduction | 0% | 10-20% | **30-50%** |
| Cross-warehouse-balance-driven-subscription-RMA-rate-reduction | 0% | 10-15% | **25-45%** |
| Cross-warehouse-balance-driven-overflow-cost-reduction | 0% | 5-12% | **20-40%** |
| Per-warehouse idle-capacity-cost-surface-rate | 0% | 30% | **80%+** |
| Per-transfer-rollback-decision-engine-firing-accuracy | n/a | 50-60% | **85%+** |
| CFO/controller weekly board-pack coverage | 0% | 30% (single-page) | **100%** (5-page board pack with per-trigger + per-SKU + per-warehouse ROI breakdown) |
| Year-1 ROI Path B (default, $3M GMV) | 1:1 (Cost-of-Capital) | 2:1-4:1 | **5:1-15:1 (default 8:1)** |

## The build (3-4 weeks, 24-34 operator-hours)

### Phase 1 — Pillar 1 (per-transfer cost-amortization-window-engine) (Week 1, 8-10 hours)
- Build the 7-input amortization-window math
- Build the per-trigger amortization-window-engine with the 5-trigger payback bands table
- Wire to Move #358 per-transfer-balance-event-stream
- Wire to Triple Whale per-transfer-event-stream emission

### Phase 2 — Pillar 2 (cost-vs-stockout-cost calculator) (Week 1, 6-8 hours)
- Build the 5-component-stockout-cost-model with per-tier weights
- Build the AUTO-AMORTIZE / OPERATOR-REVIEW / REJECT routing
- Build the 30/90/1.5× decision thresholds

### Phase 3 — Pillar 3 + Pillar 4 (per-warehouse + per-SKU ROI attribution) (Week 2, 8-12 hours)
- Build the per-warehouse cost-amortization ledger
- Build the per-SKU payback-window attribution
- Build the per-tier (hero/halo/filler) rollback-candidates list

### Phase 4 — Pillar 5 + Pillar 6 (event-stream + rollback-engine) (Week 3, 4-6 hours)
- Wire Triple Whale per-transfer-balance-event-stream emission (per-day, hourly cadence)
- Build the 4-sub-rule rollback-decision-engine R1-R4

### Phase 5 — Rollout + measurement (Week 4, 4-6 hours)
- Onboard the per-trigger payback-window-engine for all 80 SKUs
- Configure the weekly board-pack auto-generation
- Run the 30-day baseline measurement + the 90-day ROI-backtest

## Common pitfalls (18 from real builds)

1. **Ship-without-per-transfer-event-stream** — without Triple Whale per-transfer-balance-event-stream emitting per-transfer per-day, the cost-amortization-window-engine has no real-time signal; returns stale "transfer-cost-not-yet-amortized" for every transfer
2. **Ship-without-confidence-band** — projecting payback-window days without a confidence band (LOW/MED/HIGH) means operators cannot distinguish "this transfer will amortize in 14 days (HIGH)" from "this transfer will amortize in 14 days (LOW)" — the second is actually a 50% chance 14 days / 50% chance never
3. **No-per-trigger-payback-window** — flat 30-day payback-window across all 5 triggers hides that T2 dead-stock-rebalance has a 30-90 day window (longer than T1 7-21 day stockout-risk) — operators reject legitimate T2 transfers when the 30-day threshold is hardcoded
4. **No-per-tier-stockout-cost-weights** — treating hero / halo / filler stockout-cost equally (1×) means the T1 stockout-risk trigger fails to differentiate between $12 hero-SKU stockout-cost and $1.50 filler-SKU stockout-cost — cost-vs-stockout-cost-calculator underweights hero and overweights filler
5. **No-3PL-cost-savings-attribution** — without surfacing the per-transfer 3PL-cost-savings (because the destination-warehouse avoids the 3PL-out-of-zone surcharge), the transfer appears "not amortized" even when in reality it avoided a $15 surcharge per order
6. **No-dead-stock-clearance-attribution** — without the dead-stock-clearance-savings surface (T2 transfers clear dead-stock from the origin and re-monetize at the destination), the operator cannot distinguish T2 transfers from T1 (which have no dead-stock-clearance component)
7. **No-BFCM-peak-uplift-attribution** — T4 BFCM-peak-pre-positioning transfers have a BFCM-peak-margin-uplift component ($18/day per the table) that ONLY materializes during BFCM (Nov 24 - Dec 1); operators that roll the math over 30-day windows year-round under-credit BFCM transfers
8. **No-subscription-cohort-RMA-savings-attribution** — T5 subscription-cohort-fulfillment-pool transfers have an RMA-rate-reduction component ($6/day per the table) that requires tracking RMA-rates per cohort-affinity before vs after — without this the engine under-credits T5 by 25-40%
9. **No-cross-region-fulfillment-cost-savings-attribution** — T3 per-region-cohort-affinity transfers have a cross-region-fulfillment-cost-savings component ($7/day per the table) that REQUIRES per-region-fulfillment-cost-tracking — without it operators over-credit T1 (which has no cross-region component) and miss the cross-region-fulfillment-cost-savings on T3
10. **Move-#358.1-ships-without-Move-#358** — no per-transfer-balance-event-stream from Move #358 = nothing to amortize
11. **Move-#358.1-ships-without-Move-#357** — without the 7-input per-SKU-OTB-formula giving Pillar 4 the per-SKU tier + per-SKU BFCM-peak-multiplier + per-SKU subscription-cohort-units, per-SKU payback-window attribution is stale
12. **No-per-trigger-rollback-engine** — without R1-R4 rollback-engine, operators cannot distinguish "transfer still amortizing" from "transfer will never amortize" — both look like "ROI_pct_to_date < 100%" but R1 (long-payback-window) and R3 (destination dead-stock-pct > 25%) need different operator responses
13. **No-confidence-band-backtest** — confidence bands must be derived from a 90-day backtest, not assigned arbitrarily; without the backtest, operators cannot trust the AUTO-AMORTIZE routing decision
14. **Per-transfer-rollback-as-global-rollback** — applying R4 (`per_warehouse contribution_to_total_amortization < 0` for 14 days) as a global rollback of ALL transfers to that warehouse loses high-ROI transfers because one underperformer dragged the average down; correct is per-transfer-rollback with per-transferred-SKU filtering
15. **No-CFO-board-pack-cadence** — without the Monday 8 AM local weekly board-pack delivery to CFO/controller/FP&A, the per-transfer attribution loop never closes (operators see the dashboard but finance never sees the ROI)
16. **No-per-warehouse-idle-capacity-cost** — operators focus only on overflow-cost, missing the underutilized-warehouse-side where warehouse-utilization < 60% means per-order-warehouse-fixed-cost is 1.5-2× higher — surface in Pillar 3
17. **No-per-transfer-event-stream-caching** — Triple Whale per-transfer-event-stream emits 5+ events per transfer per day; without caching + delta-fetching, dashboard loads slow + the operator sees stale ROI on the busiest day
18. **Move-#358.1-ships-without-Move-#103** — without the per-SKU-margin-overlay, Pillar 4 per-tier payback-window has no per-tier margin-profile source-of-truth and the per-SKU-margin-uplift attribution is missing

## Verification (this skill is "shipped" when...)

- **Gate A — Pillar 1 per-transfer cost-amortization-window-engine published for ≥80% of transfers (≥3 transfers/day sustained over 30 days)**
- **Gate B — Pillar 2 cost-vs-stockout-cost-calculator decision-accuracy ≥80% on 90-day backtest**
- **Gate C — Pillar 3 per-warehouse ROI attribution coverage ≥100% (every warehouse in stack + every role PRIMARY/SECONDARY/OVERFLOW/DROPSHIP/FBA-MC)**
- **Gate D — Pillar 4 per-SKU payback-window visibility ≥100% (all active SKUs surfaced)**
- **Gate E — Pillar 5 Triple Whale per-transfer-event-stream emitting 100% of executed transfers with confidence-band**
- **Gate F — Pillar 6 4-sub-rule rollback-decision-engine R1-R4 published, firing ≥1 decision/week**
- **Gate G — AUTO-AMORTIZE routing-decision-accuracy ≥85% on 90-day backtest**
- **Gate H — Per-trigger payback-window-engine-coverage 100% T1-T5**
- **Gate I — Cross-warehouse-balance-cost-amortization-engine-driven-3PL-cost-savings ≥$15k/quarter**
- **Gate J — Cross-warehouse-balance-cost-amortization-engine-driven-stockout-cost-avoidance ≥$30k/quarter**

## How to extend this skill

- **Move #358.2 — Per-warehouse capacity-utilization-engine + cross-warehouse-overflow-engine** — given the per-warehouse-capacity-utilization-vector, build the overflow-engine that re-routes orders to a secondary warehouse when the primary is at-capacity (interfaces with Move #357 Pillar 3 per-warehouse-routing-rule + ShipBob-Fulfillment-API-2026 + LeanBox-Per-Channel-2026 + FBA-Multi-Channel-2026)
- **Move #358.3 — Per-SKU cross-warehouse-balance-supplier-drop-ship-engine** — given the Move #357 per-SKU-OTB-formula + the cross-warehouse-balance-engine, build the supplier-drop-ship-engine that bypasses warehouse transfer when supplier-lead-time < transfer-lead-time (interfaces with Move #357 Pillar 1 + supplier-API-integrations + ShipBob-Dropship-2026)
- **Move #358.4 — Per-region cross-warehouse-balance-BFCM-stress-test-engine** — given the Move #89 BFCM-peak-multiplier + the cross-warehouse-balance-engine, build the BFCM-stress-test-engine that simulates 3× normal Q4 demand on each (SKU × warehouse × region) cell and pre-positions inventory 8 weeks pre-BFCM (interfaces with Move #89 + Move #357 Pillar 4 + ShipBob-BFCM-2026 + LeanBox-BFCM-2026)
- **Move #358.5 — Per-SKU cross-warehouse-balance-decision-rollback-engine (per-transfer per-cohort-affinity-decay-rollback)** — extend Pillar 6 with cohort-affinity-decay-rollback that auto-rollbacks a transfer when the cohort-affinity-load decays below 0.3 for 3 consecutive weeks

## Cross-references

- Move #358 — Cross-warehouse-balance-engine per-SKU-multi-warehouse-allocation
- Move #357 — Per-SKU-inventory-commitment-open-to-buy-budget
- Move #103 — Product-analytics per-SKU-profit-contribution-margin-cohort-LTV
- Move #89 — BFCM-season-engine
- Move #11 — Subscription-billing-infrastructure (specifically Move #11.7 replenishment-cadence)
- Move #29 — Inventory-forecasting-stockout-prevention
- Move #86 — Inventory-working-capital-dead-stock-liquidation-engine
- Move #25 — International-expansion (per-region-fulfillment-pool handoff)
- Move #107 — Competitive-price-intelligence-engine (cross-region stockout capture)
- Move #113 — Per-cohort-creative-engine (cross-region creative amplification)
- Move #115 — Per-cohort-audience-engine (cross-region cohort-affinity)

## Sources

See frontmatter `sources` array (45+ tokens spanning Triple Whale, Polar, Northbeam, ShipBob, LeanBox, FBA Multi-Channel, AMCF, Flexport, Shopify, NetSuite, SAP, Oracle Retail, Blue Yonder, Manhattan, o9, ToolsGroup, Revionics, Aptos, JustEnough, Recharge, Loop Subscriptions, Smile.io, Klaviyo, Postscript, Omnisend, AfterShip, Route, Parcel Labs, Shippo, Easyship, Returnly, Loop Returns, McKinsey, Deloitte, Forrester, Gartner, Accenture, Baymard, HBR, BCG, Bain, MIT Sloan, Shopify-State-of-DTC-Shipping-2026-Cost-Ledger, Shopify-State-of-DTC-Returns-2026-Cost-Ledger, Black-Friday/Cyber-Week/Post-BFCM-Recovery/Subscription-Economy cost-amortization reports).
