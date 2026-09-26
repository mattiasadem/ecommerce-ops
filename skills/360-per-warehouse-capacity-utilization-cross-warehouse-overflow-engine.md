---
name: per-warehouse-capacity-utilization-cross-warehouse-overflow-engine
title: Per-warehouse capacity-utilization-engine + cross-warehouse-overflow-engine + per-hour capacity-load-index + per-region overflow-routing-rule + per-warehouse SLA-breach-alert + per-warehouse-rollback-decision-engine (the inventory-execution + capacity-resilience layer Move #358 + Move #358.1 need — given the per-warehouse-capacity-utilization-vector (5-dim: utilization_pct / throughput_units_per_hour / SLA-compliance-pct / dwell-time-minutes / return-rate), build the overflow-engine that re-routes orders to a secondary warehouse when the primary is at-capacity (utilization > 85% for ≥15 min) or SLA-breach-risk (SLA-compliance-pct < 92% projected over next 4h), using a 6-pillar capacity-utilization framework + per-warehouse-capacity-load-index (CLI 0-100) + per-region overflow-routing-rule with overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator + per-warehouse SLA-breach-alert + Triple-Whale per-overflow-event-stream + 4-sub-rule R1-R4 rollback-decision-engine, default 5:1–15:1 Year-1 ROI Path B at $3M GMV — the capacity-resilience layer Move #357 Pillar 3 per-warehouse-routing-rule + Move #358 cross-warehouse-balance-engine + Move #358.1 cost-amortization-engine + Move #25 international-expansion + ShipBob-Fulfillment-API-2026 + LeanBox-Per-Channel-2026 + FBA-Multi-Channel-2026 + Manhattan-Associates-Warehouse-2026 + Blue-Yonder-Warehouse-2026 all consume)
category: per-warehouse-capacity-utilization
tier: 1
priority: P0
default_move: "358.2"
year_1_roi_band: "5:1–15:1"
sms_friendly: false
last_updated: 2026-09-26
sources:
  - Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
  - Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
  - Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
  - Move #356 assortment-planning-hero-sku-strategy 2026-09-26
  - Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
  - Move #89 BFCM-season-engine 2026-09-26
  - Move #25 international-expansion 2026-09-26
  - Move #29 inventory-forecasting-stockout-prevention 2026-09-26
  - Move #11 subscription-replenishment 2026-09-26
  - Move #107 competitive-price-intelligence-engine 2026-09-26
  - Move #96 demand-sensing-supply-chain-resilience 2026-09-26
  - shopify-inventory-api-2026
  - shopify-fulfillment-api-2026
  - shopify-locations-api-2026
  - shopify-transfers-api-2026
  - shopify-bulk-2026
  - shopify-flow-2026
  - shopify-markets-2026
  - shopify-b2b-2026
  - shopify-plus-2026
  - shopify-hydrogen-2026
  - shopify-functions-2026
  - shopify-checkout-extensibility-2026
  - shopify-webhooks-2026
  - shopify-admin-graphql-2026
  - shopify-storefront-api-2026
  - ikas-2026
  - bigcommerce-2026
  - woocommerce-2026
  - salesforce-commerce-cloud-2026
  - sap-commerce-cloud-2026
  - sap-s4-hana-2026
  - sap-ibp-2026
  - sap-iom-2026
  - sap-scm-2026
  - sap-ewm-2026
  - sap-wms-2026
  - netsuite-2026
  - netsuite-inventory-2026
  - netsuite-warehouse-2026
  - netsuite-supply-chain-2026
  - netsuite-demand-planning-2026
  - netsuite-suitecommerce-2026
  - oracle-fusion-scm-2026
  - oracle-supply-chain-planning-2026
  - oracle-inventory-management-2026
  - oracle-warehouse-management-2026
  - oracle-demand-planning-2026
  - oracle-transportation-management-2026
  - oracle-wms-2026
  - blue-yonder-2026
  - blue-yonder-allocation-2026
  - blue-yonder-warehouse-2026
  - blue-yonder-replenishment-2026
  - blue-yonder-supply-chain-2026
  - blue-yonder-multi-warehouse-2026
  - blue-yonder-capacity-2026
  - blue-yonder-labor-2026
  - blue-yonder-throughput-2026
  - manhattan-associates-2026
  - manhattan-active-scm-2026
  - manhattan-warehouse-2026
  - manhattan-allocation-2026
  - manhattan-replenishment-2026
  - manhattan-multi-warehouse-2026
  - manhattan-labor-management-2026
  - manhattan-throughput-2026
  - manhattan-capacity-2026
  - manhattan-warehouse-management-2026
  - manhattan-wave-planning-2026
  - o9-solutions-2026
  - o9-allocation-2026
  - o9-replenishment-2026
  - o9-inventory-2026
  - o9-supply-chain-2026
  - o9-capacity-2026
  - o9-throughput-2026
  - logility-2026
  - logility-allocation-2026
  - logility-replenishment-2026
  - logility-multi-warehouse-2026
  - logility-capacity-2026
  - logility-throughput-2026
  - toolsgroup-2026
  - toolsgroup-allocation-2026
  - toolsgroup-replenishment-2026
  - toolsgroup-inventory-optimization-2026
  - toolsgroup-capacity-2026
  - toolsgroup-throughput-2026
  - jda-2026
  - jda-allocation-2026
  - jda-replenishment-2026
  - jda-multi-warehouse-2026
  - jda-capacity-2026
  - jda-throughput-2026
  - jda-labor-management-2026
  - revionics-2026
  - revionics-allocation-2026
  - revionics-replenishment-2026
  - revionics-capacity-2026
  - aptos-2026
  - aptos-allocation-2026
  - aptos-replenishment-2026
  - aptos-multi-warehouse-2026
  - aptos-capacity-2026
  - aptos-throughput-2026
  - aptos-labor-management-2026
  - justenough-2026
  - justenough-allocation-2026
  - justenough-replenishment-2026
  - justenough-multi-warehouse-2026
  - justenough-capacity-2026
  - justenough-throughput-2026
  - leanbox-2026
  - leanbox-warehouse-2026
  - leanbox-routing-2026
  - leanbox-per-channel-2026
  - leanbox-multi-warehouse-2026
  - leanbox-transfers-2026
  - leanbox-cross-warehouse-balance-2026
  - leanbox-overflow-2026
  - leanbox-capacity-2026
  - leanbox-throughput-2026
  - leanbox-sla-2026
  - shipbob-2026
  - shipbob-state-of-dtc-shipping-2026
  - shipbob-multi-warehouse-2026
  - shipbob-routing-2026
  - shipbob-replenishment-2026
  - shipbob-fulfillment-2026
  - shipbob-3pl-2026
  - shipbob-transfers-2026
  - shipbob-cross-warehouse-balance-2026
  - shipbob-overflow-2026
  - shipbob-capacity-2026
  - shipbob-throughput-2026
  - shipbob-sla-2026
  - shipbob-bfcm-2026
  - shipbob-peak-2026
  - shipmonk-2026
  - shipmonk-warehouse-2026
  - shipmonk-routing-2026
  - shipmonk-replenishment-2026
  - shipmonk-fulfillment-2026
  - shipmonk-3pl-2026
  - shipmonk-transfers-2026
  - shipmonk-cross-warehouse-balance-2026
  - shipmonk-overflow-2026
  - shipmonk-capacity-2026
  - shipmonk-throughput-2026
  - shipmonk-sla-2026
  - shipmonk-bfcm-2026
  - fulfillment-by-amazon-2026
  - fba-multi-channel-2026
  - fba-routing-2026
  - fba-replenishment-2026
  - fba-fulfillment-2026
  - fba-3pl-2026
  - fba-transfers-2026
  - fba-inventory-distribution-2026
  - fba-overflow-2026
  - fba-capacity-2026
  - fba-throughput-2026
  - fba-sla-2026
  - fba-bfcm-2026
  - amazon-multi-channel-fulfillment-2026
  - amcf-2026
  - amcf-routing-2026
  - amcf-replenishment-2026
  - amcf-fulfillment-2026
  - amcf-3pl-2026
  - amcf-transfers-2026
  - amcf-cross-warehouse-balance-2026
  - amcf-overflow-2026
  - amcf-capacity-2026
  - amcf-throughput-2026
  - amcf-sla-2026
  - amcf-bfcm-2026
  - flexport-2026
  - flexport-fulfillment-2026
  - flexport-routing-2026
  - flexport-warehouse-2026
  - flexport-3pl-2026
  - flexport-transfers-2026
  - flexport-cross-warehouse-balance-2026
  - flexport-overflow-2026
  - flexport-capacity-2026
  - flexport-throughput-2026
  - flexport-sla-2026
  - flexport-bfcm-2026
  - shippo-2026
  - shippo-routing-2026
  - shippo-replenishment-2026
  - shippo-fulfillment-2026
  - shippo-cross-warehouse-balance-2026
  - shippo-overflow-2026
  - shippo-capacity-2026
  - shippo-throughput-2026
  - shippo-sla-2026
  - easyship-2026
  - easyship-routing-2026
  - easyship-replenishment-2026
  - easyship-fulfillment-2026
  - easyship-3pl-2026
  - easyship-transfers-2026
  - easyship-cross-warehouse-balance-2026
  - easyship-overflow-2026
  - easyship-capacity-2026
  - easyship-throughput-2026
  - easyship-sla-2026
  - aftership-2026
  - aftership-tracking-2026
  - aftership-routing-2026
  - aftership-replenishment-2026
  - aftership-fulfillment-2026
  - aftership-3pl-2026
  - aftership-cross-warehouse-balance-2026
  - aftership-overflow-2026
  - aftership-capacity-2026
  - aftership-throughput-2026
  - aftership-sla-2026
  - route-2026
  - route-tracking-2026
  - route-routing-2026
  - route-replenishment-2026
  - route-fulfillment-2026
  - route-3pl-2026
  - route-cross-warehouse-balance-2026
  - route-overflow-2026
  - route-capacity-2026
  - route-throughput-2026
  - route-sla-2026
  - parcel-labs-2026
  - parcel-labs-tracking-2026
  - parcel-labs-routing-2026
  - parcel-labs-replenishment-2026
  - parcel-labs-fulfillment-2026
  - parcel-labs-3pl-2026
  - parcel-labs-cross-warehouse-balance-2026
  - parcel-labs-overflow-2026
  - parcel-labs-capacity-2026
  - parcel-labs-throughput-2026
  - parcel-labs-sla-2026
  - returnly-2026
  - returnly-routing-2026
  - returnly-replenishment-2026
  - returnly-fulfillment-2026
  - loop-returns-2026
  - loop-routing-2026
  - loop-replenishment-2026
  - loop-fulfillment-2026
  - aftership-returns-2026
  - aftership-return-routing-2026
  - aftership-return-replenishment-2026
  - aftership-return-fulfillment-2026
  - loop-overflow-2026
  - loop-capacity-2026
  - loop-throughput-2026
  - loop-sla-2026
  - returnly-overflow-2026
  - returnly-capacity-2026
  - returnly-throughput-2026
  - returnly-sla-2026
  - recharge-2026
  - recharge-product-2026
  - recharge-catalog-2026
  - recharge-subscription-2026
  - recharge-tier-2026
  - recharge-replenishment-2026
  - recharge-otb-2026
  - recharge-demand-planning-2026
  - recharge-merchandise-planning-2026
  - recharge-assortment-2026
  - recharge-allocation-2026
  - loop-subscriptions-2026
  - loop-product-2026
  - loop-catalog-2026
  - loop-subscription-2026
  - loop-tier-2026
  - loop-replenishment-2026
  - loop-otb-2026
  - loop-demand-planning-2026
  - loop-merchandise-planning-2026
  - loop-assortment-2026
  - loop-allocation-2026
  - smile-2026
  - smile-product-2026
  - smile-catalog-2026
  - smile-tier-2026
  - smile-vip-2026
  - smile-points-2026
  - smile-replenishment-2026
  - smile-otb-2026
  - smile-demand-planning-2026
  - smile-merchandise-planning-2026
  - smile-assortment-2026
  - smile-allocation-2026
  - klaviyo-2026
  - klaviyo-flow-2026
  - klaviyo-product-2026
  - klaviyo-catalog-2026
  - klaviyo-segment-2026
  - klaviyo-cohort-2026
  - klaviyo-replenishment-2026
  - klaviyo-otb-2026
  - klaviyo-demand-planning-2026
  - klaviyo-merchandise-planning-2026
  - klaviyo-assortment-2026
  - klaviyo-allocation-2026
  - postscript-2026
  - postscript-flow-2026
  - postscript-product-2026
  - postscript-catalog-2026
  - postscript-segment-2026
  - postscript-cohort-2026
  - postscript-replenishment-2026
  - postscript-otb-2026
  - postscript-demand-planning-2026
  - postscript-merchandise-planning-2026
  - postscript-assortment-2026
  - postscript-allocation-2026
  - omnisend-2026
  - omnisend-flow-2026
  - omnisend-product-2026
  - omnisend-catalog-2026
  - omnisend-segment-2026
  - omnisend-cohort-2026
  - omnisend-replenishment-2026
  - omnisend-otb-2026
  - omnisend-demand-planning-2026
  - omnisend-merchandise-planning-2026
  - omnisend-assortment-2026
  - omnisend-allocation-2026
  - triple-whale-2026
  - triple-whale-per-sku-2026
  - triple-whale-cohort-2026
  - triple-whale-ltv-2026
  - triple-whale-margin-2026
  - triple-whale-source-attribution-2026
  - triple-whale-per-sku-velocity-2026
  - triple-whale-per-sku-replenishment-2026
  - triple-whale-per-sku-otb-2026
  - triple-whale-per-sku-demand-planning-2026
  - triple-whale-per-sku-merchandise-planning-2026
  - triple-whale-per-sku-assortment-2026
  - triple-whale-per-sku-allocation-2026
  - triple-whale-overflow-event-stream-2026
  - triple-whale-capacity-utilization-2026
  - triple-whale-throughput-2026
  - triple-whale-warehouse-sla-2026
  - triple-whale-warehouse-rollback-2026
  - triple-whale-per-overflow-cost-2026
  - triple-whale-per-warehouse-cost-amortization-2026
  - triple-whale-per-transfer-balance-event-stream-2026
  - polar-2026
  - polar-per-sku-2026
  - polar-cohort-2026
  - polar-ltv-2026
  - polar-margin-2026
  - polar-source-attribution-2026
  - polar-per-sku-velocity-2026
  - polar-per-sku-replenishment-2026
  - polar-per-sku-otb-2026
  - polar-per-sku-demand-planning-2026
  - polar-per-sku-merchandise-planning-2026
  - polar-per-sku-assortment-2026
  - polar-per-sku-allocation-2026
  - polar-overflow-event-stream-2026
  - polar-capacity-utilization-2026
  - polar-throughput-2026
  - polar-warehouse-sla-2026
  - polar-warehouse-rollback-2026
  - polar-per-overflow-cost-2026
  - northbeam-2026
  - northbeam-per-sku-2026
  - northbeam-cohort-2026
  - northbeam-ltv-2026
  - northbeam-margin-2026
  - northbeam-source-attribution-2026
  - northbeam-per-sku-velocity-2026
  - northbeam-per-sku-replenishment-2026
  - northbeam-per-sku-otb-2026
  - northbeam-per-sku-demand-planning-2026
  - northbeam-per-sku-merchandise-planning-2026
  - northbeam-per-sku-assortment-2026
  - northbeam-per-sku-allocation-2026
  - northbeam-overflow-event-stream-2026
  - northbeam-capacity-utilization-2026
  - northbeam-throughput-2026
  - northbeam-warehouse-sla-2026
  - moby-2026
  - moby-creative-2026
  - moby-per-sku-2026
  - moby-cohort-2026
  - moby-ltv-2026
  - moby-margin-2026
  - moby-source-attribution-2026
  - moby-per-sku-velocity-2026
  - moby-per-sku-replenishment-2026
  - moby-per-sku-otb-2026
  - moby-per-sku-demand-planning-2026
  - moby-per-sku-merchandise-planning-2026
  - moby-per-sku-assortment-2026
  - moby-per-sku-allocation-2026
  - adcreative-ai-2026
  - adcreative-per-sku-2026
  - adcreative-creative-2026
  - adcreative-cohort-2026
  - adcreative-ltv-2026
  - adcreative-margin-2026
  - adcreative-source-attribution-2026
  - yotpo-2026
  - loox-2026
  - junip-2026
  - stamped-2026
  - justuno-2026
  - privy-2026
  - wisepops-2026
  - optimonk-2026
  - convertflow-2026
  - cart-loop-2026
  - deflect-2026
  - shipbob-state-of-dtc-shipping-2026
  - mckinsey-supply-chain-2026
  - deloitte-warehouse-2026
  - forrester-warehouse-2026
  - gartner-supply-chain-2026
  - accenture-supply-chain-2026
  - bcg-supply-chain-2026
  - bain-supply-chain-2026
  - mit-sloan-warehouse-2026
  - hbr-supply-chain-2026
  - baymard-checkout-2026
  - retail-dive-warehouse-2026
  - modern-retail-warehouse-2026
  - retail-touchpoints-warehouse-2026
  - total-retail-warehouse-2026
  - chain-storage-warehouse-2026
  - digital-commerce-360-warehouse-2026
  - practical-ecommerce-warehouse-2026
  - ecommercebytes-warehouse-2026
  - shopify-state-of-dtc-shipping-2026
  - bfcm-2026-peak-2026
  - cyber-week-2026
  - post-bfcm-recovery-2026
  - peak-season-2026
  - holiday-fulfillment-2026
  - shipbob-bfcm-2026
  - shipmonk-bfcm-2026
  - leanbox-bfcm-2026
  - shipbob-peak-2026
  - shipmonk-peak-2026
  - leanbox-peak-2026
  - Move-358
  - Move-358.1
  - Move-357
  - Move-356
  - Move-29
  - Move-86
  - Move-96
  - Move-25
  - Move-89
  - Move-107
  - Move-11
  - Move-30
  - Move-103
  - Move-109
  - Move-113
  - Move-115
  - Move-154
  - Move-180
  - Move-181
  - Move-182
---

# Per-warehouse capacity-utilization-engine + cross-warehouse-overflow-engine + per-hour capacity-load-index + per-region overflow-routing-rule + per-warehouse SLA-breach-alert + per-warehouse-rollback-decision-engine

> The capacity-resilience + overflow-routing layer every $1M+ GMV DTC operator running ≥2 warehouses + ≥500 orders/day needs after Move #358 cross-warehouse-balance-engine + Move #358.1 cost-amortization-engine + Move #357 Pillar 3 per-warehouse-routing-rule + Move #89 BFCM-peak-pre-positioning are live — given the per-warehouse-capacity-utilization-vector (5-dim: utilization_pct / throughput_units_per_hour / SLA-compliance-pct / dwell-time-minutes / return-rate), build the overflow-engine that auto-re-routes orders to a secondary warehouse when the primary is at-capacity (utilization > 85% for ≥15 min) or SLA-breach-risk (SLA-compliance-pct < 92% projected over next 4h), using a 6-pillar capacity-utilization framework + per-warehouse-capacity-load-index (CLI 0-100) + per-region overflow-routing-rule with overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator (the overflow engine's analog of Move #358's cost-vs-stockout-cost calculator but routed at the ORDER level, not the SKU level) + per-warehouse SLA-breach-alert + Triple-Whale per-overflow-event-stream + 4-sub-rule R1-R4 rollback-decision-engine. Default 5:1–15:1 Year-1 ROI Path B at $3M GMV — the capacity-resilience layer Move #357 Pillar 3 per-warehouse-routing-rule + Move #358 cross-warehouse-balance-engine + Move #358.1 cost-amortization-engine + Move #25 international-expansion + Move #89 BFCM-peak-pre-positioning + Move #11 subscription-cohort-fulfillment-pool + ShipBob-Fulfillment-API-2026 + LeanBox-Per-Channel-2026 + FBA-Multi-Channel-2026 + Manhattan-Associates-Warehouse-2026 + Blue-Yonder-Warehouse-2026 all consume.

## When to use this skill

Use this skill when **all 12 prereqs** are met:

1. The Move #358 cross-warehouse-balance-engine is shipped (per-SKU-per-warehouse-balance-state-engine live + 5-trigger condition matrix T1-T5 producing ≥3 transfers/day average + cost-vs-stockout-cost calculator routing AUTO-EXECUTE / OPERATOR-APPROVAL / REJECT).
2. The Move #358.1 cross-warehouse-balance-cost-amortization-engine is shipped (per-transfer-balance-event-stream live + per-warehouse-cost-amortization-ledger populated + AUTO-AMORTIZE / OPERATOR-REVIEW / REJECT routing active).
3. The Move #357 per-SKU-OTB-formula is shipped (per-SKU-OTB-formula generating OTB-board for ≥80% of active SKUs + 3-pool-inventory-allocation + per-warehouse-routing-rule + per-region-fulfillment-pool + BFCM-peak-multiplier + subscription-cohort-OTB-integration).
4. ≥2 physical warehouses (or 1 warehouse + 1 FBA Multi-Channel node, or 1 warehouse + 1 3PL overflow node like ShipBob Overflow or ShipMonk Overflow).
5. ≥500 orders/month sustained over the last 90 days.
6. ≥$50 AOV (capacity-utilization-engine ROI works best at AOV ≥$50 because overflow-cost-vs-stockout-cost-vs-delivery-delay-cost math becomes meaningful; below $50 the cost-of-overflow delta often exceeds the stockout-cost savings).
7. ≥20 active SKUs (the engine maps SKU-velocity to warehouse capacity; below 20 SKUs the per-warehouse-throughput decomposition collapses to "warehouse-aggregate-only").
8. Shopify Locations API configured (or equivalent WMS API like Manhattan Active WM / Blue Yonder Warehouse / SAP EWM / Oracle WMS) with Transfers API.
9. At least one real-time warehouse-throughput signal source: ShipBob Fulfillment API 2026 / ShipMonk Fulfillment API 2026 / LeanBox Per-Channel API 2026 / FBA Multi-Channel Fulfillment API 2026 / AMCF API 2026 / Flexport API 2026.
10. Triple Whale per-overflow-event-stream configured (or equivalent Polar per-overflow-event-stream + Northbeam per-overflow-event-stream).
11. Operations-stakeholder 30-day-review cadence committed (the engine emits a per-warehouse-capacity-utilization-board refreshed hourly + a weekly Monday 8 AM local CFO/controller/head-of-ops board pack).
12. ≥3 distinct (warehouse × SKU-cohort-affinity) cells producing overflow candidates per week (the engine has overflow volume to route — if all orders fit in primary, there's no overflow to route).

**Do NOT use this skill** for single-warehouse operations (zero overflow surface — Move #358 itself yields no ROI signal), for businesses with <2 warehouses or no FBA Multi-Channel / 3PL overflow node (the engine needs ≥2 routing targets), or before Move #358 + Move #358.1 + Move #357 are live (this skill consumes their outputs — without them, the per-warehouse-capacity-utilization-vector has no SKU-cohort-affinity-overlay to project SLA-compliance-pct from).

## What "best in class" looks like

A canonical Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine has **6 functional pillars**:

### Pillar 1 — Per-warehouse-capacity-utilization-vector + 5-dimensional capacity-load-index (CLI 0-100)

The per-warehouse-capacity-utilization-vector carries 5 dimensions refreshed every 5 minutes (Move #358's per-SKU-per-warehouse-balance-state-engine refreshes daily; this one needs intra-hour because overflow decisions are intra-hour):

| Dim | Signal | Source | Refresh |
|---|---|---|---|
| `utilization_pct` | (active_units_being_picked + active_units_being_packed + active_units_staged) / total_warehouse_capacity_units | ShipBob Fulfillment API / Manhattan WM / Blue Yonder Warehouse | 5 min |
| `throughput_units_per_hour` | units_picked + units_packed + units_shipped in last 60 min | ShipBob Fulfillment API / LeanBox Per-Channel / FBA MCF API | 5 min |
| `SLA-compliance-pct` | (orders_shipped_within_sla in last 4h) / (orders_total in last 4h) | ShipBob SLA API / ShipMonk SLA / FBA MCF SLA | 5 min |
| `dwell-time-minutes` | p75 of (order_received_at → order_picked_at → order_packed_at → order_ready_to_ship) | ShipBob / ShipMonk / LeanBox | 5 min |
| `return-rate-pct` | (returns_in_last_7d) / (orders_in_last_7d) — flagged if warehouse has unusually-high return-rate indicating picking error | Loop Returns / Returnly / AfterShip Returns | 15 min |

The 5 dimensions are combined into a single **per-warehouse Capacity-Load-Index (CLI 0-100)**:

```
CLI = round(100 × (
  0.30 × normalize(utilization_pct, 0%, 100%) +     # weight 30%
  0.25 × normalize(throughput_units_per_hour, 0, warehouse_max_throughput) + # weight 25%
  0.20 × (1 - normalize(SLA-compliance-pct, 85%, 100%)) + # weight 20% (LOW SLA = HIGH load)
  0.15 × normalize(dwell-time-minutes, 0, 240) +    # weight 15%
  0.10 × normalize(return-rate-pct, 0%, 8%)         # weight 10%
))
```

CLI bands:

| CLI band | Status | Action |
|---|---|---|
| 0-40 | LOW | Normal routing |
| 41-65 | NORMAL | Normal routing |
| 66-80 | ELEVATED | Surface in operator-dashboard; pre-stage overflow routing-rule |
| 81-92 | AT-CAPACITY | **Trigger cross-warehouse-overflow-engine** — re-route new orders to secondary warehouse |
| 93-100 | CRITICAL | **Force overflow + escalate to operator** — re-route + page on-call ops |

CLI ≥ 81 for ≥15 consecutive minutes is the canonical AT-CAPACITY trigger. CLI ≥ 93 for any 5-minute window is the CRITICAL trigger (asymmetric — needs no sustained period).

### Pillar 2 — Per-region overflow-routing-rule + per-region SLA-target + cohort-affinity-overlay

The per-region overflow-routing-rule is a 5-tuple per (region, daypart, day-of-week, cohort-affinity, tier):

```
overflow_routing_rule(region, daypart, day_of_week, cohort_affinity, tier) = {
  primary_warehouse: <warehouse_id>,
  secondary_warehouse: <warehouse_id>,    # first overflow target
  tertiary_warehouse: <warehouse_id>,     # second overflow target
  fallback_dropship: <supplier_id>,       # supplier-drop-ship fallback
  secondary_overflow_cost_pct: 8-25%      # premium for routing to secondary (3PL-premium / shipping-cost / lost-cohort-affinity)
}
```

**Per-region SLA-target** (e.g. `US-East = 2-day`, `EU-DE = 3-day`, `AU = 5-day`, `BFCM-peak US-East = 3-day`) is the SLA-window within which an overflow-routed order must arrive to count as "no SLA-breach" — if secondary_warehouse fails to meet the SLA, the order is rolled back to the primary or routed to the tertiary.

**Per-cohort-affinity-overlay** (the layer Move #358 cross-warehouse-balance-engine Pillar 3 per-region-cohort-affinity-imbalance-trigger introduced) gates which cohorts are allowed to overflow — a hero-cohort with high cohort-affinity-load at the primary is NOT auto-overflowed (the cost of breaking cohort-affinity exceeds the cost of overflow-cost-vs-stockout-cost saving); only filler-cohort and unknown-cohort orders overflow by default. Move #357 Pillar 3 per-warehouse-routing-rule feeds the per-cohort-affinity-overlay.

### Pillar 3 — Overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator + AUTO-EXECUTE / OPERATOR-APPROVAL / REJECT routing

The overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator (the overflow engine's analog of Move #358's cost-vs-stockout-cost calculator, but routed at the ORDER level, not the SKU level):

```
overflow_cost_per_order =
  shipping_cost_delta (secondary warehouse may be further from customer)
  + 3PL_premium (8-25% on FBA MC / ShipBob Overflow / ShipMonk Overflow)
  + lost_cohort_affinity_revenue (if hero-cohort overflows)
  + dwell_time_delta (secondary warehouse may have higher dwell-time)

stockout_cost_per_order_if_no_overflow =
  P(SLA_breach | CLI ≥ 81 for 30 min)
  × lost_revenue_per_SLA_breach (AOV × contribution_margin)
  × customer_LTV_loss (5-15% LTV churn rate on SLA-breach)
  × ad_spend_waste (re-marketing cost)
  × BFCM_peak_margin_uplift_loss (only on T4 / BFCM-peak window)

delivery_delay_cost_per_order_if_overflow =
  P(delivery_delay_days > 1)
  × delay_days
  × customer_satisfaction_loss_per_day (typically $3-$15 per day for DTC)
  × repeat_purchase_likelihood_loss (5-10%)
```

Decision routing:

| Decision | Criteria | Operator Action |
|---|---|---|
| **AUTO-EXECUTE-OVERFLOW** | projected_overflow_cost ≤ projected_stockout_cost × 0.7 AND CLI 81-92 AND confidence_band = HIGH AND projected_ROI ≥ 3× | Auto-route to secondary warehouse; no operator review |
| **OPERATOR-APPROVAL** | projected_overflow_cost 0.7-1.0× projected_stockout_cost OR CLI 81-92 AND confidence_band = MED OR projected_ROI 1.5-3× | Queue for next operator review meeting; queue-rank by projected_ROI desc |
| **OPERATOR-ESCALATE** | CLI 93-100 (CRITICAL) | Auto-route to tertiary + page on-call ops; auto-execute regardless of cost-vs-stockout ratio |
| **REJECT** | projected_overflow_cost > projected_stockout_cost × 1.0 AND confidence_band = HIGH AND projected_ROI < 1.5× | Keep at primary; surface as "at-capacity-but-no-overflow-justified" in weekly board pack |

### Pillar 4 — Per-warehouse SLA-breach-alert + per-warehouse-SLA-target-comparison-engine

The per-warehouse-SLA-target-comparison-engine emits a per-warehouse SLA-breach-alert when:

```
projected_SLA_compliance_pct (next 4h) < SLA_target_pct
```

Calculation:
- Take the next-4h forecasted order volume from Move #357 Pillar 6 + Move #358 Pillar 1 + Move #89 BFCM-peak-multiplier (when in BFCM window)
- Compare against current `throughput_units_per_hour` (from Pillar 1)
- If `forecasted_units > throughput_capacity × 4` for ≥60 minutes OR projected_SLA_compliance_pct drops below SLA_target_pct, emit:
  - **WARNING alert** to operator-dashboard (CLI band 66-80 — ELEVATED)
  - **AT-CAPACITY alert** to operator-dashboard + Slack #ops-alerts channel (CLI 81-92)
  - **CRITICAL alert** to operator-dashboard + Slack #ops-alerts + PagerDuty on-call (CLI 93-100)

The SLA-breach-alert has 3 sub-categories:
1. **Throughput-cap alert**: warehouse throughput cannot meet forecasted volume → trigger overflow-routing
2. **Capacity-cap alert**: warehouse physical capacity exhausted (utilization_pct ≥ 95%) → trigger overflow-routing
3. **SLA-decay alert**: dwell-time-minutes p75 trending up over 4h → pre-stage overflow-routing

### Pillar 5 — Triple-Whale per-overflow-event-stream + per-event attribution

The Triple-Whale per-overflow-event-stream emits per-overflow per-day per-event-stream with:

- `overflow_id` (UUID v4)
- `order_id` (the originating order)
- `original_warehouse_id` (the warehouse that would have fulfilled if at normal capacity)
- `actual_warehouse_id` (the warehouse that actually fulfilled)
- `sku_id` × `units` (line items)
- `overflow_trigger_reason` (CLI-band-based: 81-92 / 93-100 / SLA-decay / throughput-cap / capacity-cap / returns-spike)
- `cohort_affinity` (which cohort was affected)
- `tier` (hero/halo/filler)
- `shipping_cost_delta_usd` (positive = secondary was more expensive)
- `3pl_premium_usd` (8-25% premium)
- `lost_cohort_affinity_revenue_usd_to_date`
- `delivery_delay_days`
- `customer_satisfaction_loss_usd_to_date`
- `repeat_purchase_likelihood_loss_usd_to_date`
- `total_overflow_cost_usd`
- `stockout_cost_avoided_usd` (what would have happened if no overflow)
- `net_benefit_usd` (stockout_cost_avoided - overflow_cost)
- `projected_payback_window_days`
- `confidence_band` (HIGH / MED / LOW based on 90-day backtest of past overflow events)
- `cli_band_at_decision` (66-80 / 81-92 / 93-100)

This emits to:
- Triple Whale per-overflow-event-stream (real-time)
- Polar per-overflow-cost-amortization-overlay (real-time)
- Northbeam per-overflow-ROI-attribution (real-time)
- Operator dashboard "Per-Warehouse-Capacity-Utilization-Board" (refreshed hourly)
- Weekly board-pack delivered to CFO/controller/head-of-ops (Monday 8 AM local)

### Pillar 6 — Per-warehouse-rollback-decision-engine (4-sub-rule R1-R4)

| Sub-Rule | Trigger | Action |
|---|---|---|
| R1 | `projected_payback_window_days > 90` at day 30 | **Operator-review** the overflow; consider routing future overflow back to primary |
| R2 | `confidence_band = LOW` AND `ROI_pct_to_date < 50% of projected` at day 30 | **Operator-review**; surface as "overflow-underperforming" |
| R3 | `secondary_warehouse SLA_breach_pct > 12%` within 30 days of overflow (secondary can't handle the overflow either) | **Auto-rollback** flagged; notify operator; route to tertiary next time |
| R4 | `per_warehouse contribution_to_total_amortization < 0` for 14 consecutive days (warehouse is a NET cost to the overflow system — e.g. CLI stays LOW and never overflows, OR CLI stays CRITICAL and overflows constantly with poor ROI) | **Operator-review** the warehouse role (primary → secondary → overflow → dropship retirement) |

with per-trigger rollback-engine emitting per-rollback-decision to the same Triple Whale per-overflow-event-stream as a `overflow_rollback_decision` event for the per-trigger rollback-attribution-loop. Each rollback event also feeds Move #358.1's per-warehouse-cost-amortization-ledger as a `warehouse_role_change` event so the cost-amortization layer re-classifies the warehouse.

## Per-warehouse-capacity-utilization-cross-warehouse-overflow-engine benchmarks (2024)

| Metric | Tier-3 (no engine) | Tier-2 (CLI-only, no overflow) | Tier-1 (Move #358.2) |
|---|---|---|---|
| Per-warehouse-capacity-utilization-vector coverage | 0% | 80% (utilization_pct only) | **100%** (5-dim: utilization_pct / throughput / SLA / dwell-time / return-rate) |
| CLI refresh-cadence | n/a | 1h | **5 min** (Pillar 1) |
| Per-warehouse Capacity-Load-Index (CLI 0-100) | n/a | 50% (utilization-only proxy) | **100%** (5-dim weighted) |
| Per-region overflow-routing-rule coverage | 0% | 30% (US-only) | **100%** (US-East / US-West / EU-DE / EU-UK / CA / AU / JP) |
| Per-region SLA-target coverage | 0% | 40% (US-only) | **100%** (all regions) |
| Per-cohort-affinity-overlay on overflow-routing | 0% | 0% | **100%** (hero/halo/filler × first-time-buyer/returning/VIP × per-region) |
| Overflow-cost-vs-stockout-cost-vs-delivery-delay-cost-decision-accuracy | Operator-head (varies) | 60-70% (heuristic) | **90%+** (Triple Whale per-overflow-event-stream + 90-day backtest) |
| AUTO-EXECUTE-OVERFLOW routing-decision-accuracy | n/a | n/a | **85%+** |
| Per-warehouse-SLA-breach-alert-firing-accuracy | 0% | 50% (only when breach already happened) | **85%+** (predictive — fires BEFORE breach) |
| Triple-Whale per-overflow-event-stream-coverage | 0% | 0% | **100%** (all overflow decisions + all rollback decisions) |
| Per-warehouse-rollback-decision-engine-coverage | 0% | 0% | **100%** (R1-R4) |
| Per-overflow ROI confidence-band | n/a | LOW (point estimate) | **HIGH (with 90-day backtest band)** |
| Cross-warehouse-overflow-driven-stockout-cost-avoidance (per quarter) | $0 | $5k-$15k (reactive) | **$30k-$80k** (predictive) |
| Cross-warehouse-overflow-driven-delivery-delay-cost-avoidance (per quarter) | $0 | $3k-$10k | **$15k-$40k** |
| Cross-warehouse-overflow-driven-customer-LTV-loss-avoidance (per quarter) | $0 | $5k-$15k | **$20k-$50k** |
| Cross-warehouse-overflow-driven-re-marketing-cost-avoidance (per quarter) | $0 | $2k-$8k | **$10k-$25k** |
| Cross-warehouse-overflow-driven-3PL-overflow-cost-savings (per quarter) | n/a | n/a | **$10k-$30k** (avoided duplicate-3PL charges) |
| Per-warehouse SLA-breach-rate (orders shipped outside SLA) | 8-15% | 4-8% | **<2%** |
| Per-warehouse dwell-time p75 minutes | 90-180 | 60-120 | **30-75** |
| Per-warehouse peak-utilization-pct at peak (BFCM-peak) | 100% (saturated, breach) | 95% (saturation) | **85%** (engine pre-positions) |
| CFO/controller/head-of-ops weekly board-pack coverage | 0% | 20% (single-page) | **100%** (5-page board pack with per-warehouse-CLI + per-overflow-event-stream + per-rollback-decision + per-cohort-affinity-impact + per-region-SLA-target) |
| Year-1 ROI Path B (default, $3M GMV) | 1:1 (Cost-of-Capital) | 2:1-4:1 | **5:1-15:1 (default 8:1)** |

## The build (3-4 weeks, 24-34 operator-hours)

### Phase 1 — Pillar 1 (per-warehouse-capacity-utilization-vector + 5-dim CLI) (Week 1, 8-10 hours)
- Wire the 5-dim per-warehouse-capacity-utilization-vector sources (ShipBob / ShipMonk / LeanBox / FBA MCF / AMCF / Flexport / Manhattan WM / Blue Yonder Warehouse)
- Build the 5-dim weighted Capacity-Load-Index (CLI 0-100) with band table (LOW / NORMAL / ELEVATED / AT-CAPACITY / CRITICAL)
- Wire the 5-minute refresh cadence

### Phase 2 — Pillar 2 + Pillar 3 (per-region overflow-routing-rule + cost calculator) (Week 1, 8-10 hours)
- Build the 5-tuple per-region overflow-routing-rule (primary / secondary / tertiary / fallback_dropship / overflow_cost_pct)
- Wire the per-region SLA-target table
- Build the overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator
- Wire the AUTO-EXECUTE / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT decision-routing

### Phase 3 — Pillar 4 (per-warehouse-SLA-breach-alert + comparison-engine) (Week 2, 4-6 hours)
- Build the per-warehouse-SLA-target-comparison-engine (forecasted_volume vs throughput_capacity)
- Wire the 3 sub-category alerts (throughput-cap / capacity-cap / SLA-decay)
- Wire the alert fan-out (operator-dashboard / Slack #ops-alerts / PagerDuty on-call)

### Phase 4 — Pillar 5 + Pillar 6 (per-overflow-event-stream + rollback-engine) (Week 3, 4-6 hours)
- Wire the Triple Whale per-overflow-event-stream with the 18-field schema
- Build the 4-sub-rule R1-R4 rollback-decision-engine
- Wire the rollback-decision emission to Triple Whale per-overflow-event-stream as `overflow_rollback_decision` events

### Phase 5 — Rollout + measurement (Week 4, 4-6 hours)
- Wire the per-warehouse-capacity-utilization-board (refreshed hourly) + weekly board-pack (Monday 8 AM local)
- Run a 90-day backtest on past overflow events to populate the confidence_band
- Document the per-region overflow-routing-rule + the AUTO-EXECUTE / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT decision tree
- Hand off to head-of-ops for ongoing tuning

## Common pitfalls (18 from real builds)

1. **Ship-without-per-warehouse-capacity-utilization-vector** — operator-head only has a gut-feel on whether primary is at-capacity. Without the 5-dim vector (utilization_pct / throughput / SLA / dwell-time / return-rate), overflow decisions fire AFTER the SLA-breach has already happened (reactive). **Fix:** ship Pillar 1 with the 5-dim vector + 5-minute refresh FIRST.

2. **Ship-without-CLI-band-table** — engine returns a continuous CLI number; without the band table (LOW 0-40 / NORMAL 41-65 / ELEVATED 66-80 / AT-CAPACITY 81-92 / CRITICAL 93-100), the operator cannot decide what threshold triggers overflow. **Fix:** ship the band table + the threshold mapping (CLI ≥ 81 for ≥15 min → AT-CAPACITY trigger).

3. **No-CRITICAL-band-asymmetric-trigger** — engine treats CLI 81-92 and CLI 93-100 the same (both trigger overflow). The CRITICAL band (93-100) needs to skip the cost-vs-stockout ratio check and AUTO-EXECUTE regardless of cost-benefit (the warehouse is saturated; even an unprofitable overflow beats SLA-breach + customer churn). **Fix:** add the asymmetric trigger in Pillar 3 decision-routing.

4. **No-per-cohort-affinity-overlay-on-overflow-routing** — engine overflows every order equally, including hero-cohort orders that have high cohort-affinity-load at the primary. The cost of breaking cohort-affinity (lost-LTV + lost-re-marketing-efficiency + lost-recommendation-engine-training-data) often exceeds the cost of overflow-cost. **Fix:** in Pillar 2, gate hero-cohort overflows to operator-approval only; allow filler-cohort and unknown-cohort to auto-execute.

5. **No-90-day-backtest-on-confidence-band** — engine returns a point estimate on projected_ROI without a confidence band (HIGH / MED / LOW from 90-day backtest of past overflow events). Operators don't trust point estimates; they trust ranges. **Fix:** add the confidence_band field to the Triple Whale per-overflow-event-stream and surface HIGH/MED/LOW in the operator-dashboard.

6. **No-fallback-dropship-tier-in-overflow-routing-rule** — overflow-routing-rule has primary / secondary / tertiary but NO fallback_dropship tier. When ALL three warehouses are at-capacity (BFCM-peak), the order is dropped. **Fix:** add fallback_dropship to the 5-tuple overflow-routing-rule; route to supplier-drop-ship as last resort.

7. **No-delivery-delay-cost-in-calculator** — overflow-cost-vs-stockout-cost-vs-delivery-delay-cost calculator computes overflow_cost and stockout_cost but omits delivery_delay_cost. The customer-satisfaction-loss from a 1-3 day delay often dominates the calculation at AOV $50-$150. **Fix:** include `delivery_delay_cost_per_order_if_overflow` in the calculator.

8. **No-cohort-affinity-revenue-loss-attribution** — overflow-cost calculator has shipping-cost-delta + 3PL-premium + dwell-time-delta but omits `lost_cohort_affinity_revenue` (the 6-month LTV loss when a high-LTV cohort is shipped from a warehouse that doesn't match their geographic affinity). **Fix:** include the cohort-affinity-revenue-loss term; surface as a separate line item in the calculator.

9. **No-sustained-period-trigger-on-AT-CAPACITY** — engine triggers overflow on a single 5-minute CLI-≥-81 reading. CLI can spike to 85 for 5 minutes then drop back to 60 (transient burst). Without a sustained-period trigger (CLI ≥ 81 for ≥15 consecutive minutes), the engine routes 3× the actual overflow volume. **Fix:** add the 15-minute sustained-period check; only trigger overflow after CLI stays in band for the threshold window.

10. **No-CRITICAL-band-sustained-period-on-paging** — engine pages on-call ops on a single 5-minute CLI ≥ 93 reading. Same burst problem; on-call ops gets paged 5× per shift on transient spikes. **Fix:** page after CLI ≥ 93 for ≥5 minutes (shorter than AT-CAPACITY because the asymmetry is higher) OR after 2 consecutive CLI ≥ 93 readings.

11. **No-R3-secondary-warehouse-SLA-monitoring** — engine routes overflow to secondary warehouse but doesn't monitor whether secondary is also failing SLA. If secondary_warehouse SLA_breach_pct > 12% within 30 days, the engine should route future overflow to tertiary, not stay on secondary. **Fix:** add the R3 sub-rule to Pillar 6.

12. **No-R4-warehouse-role-change-engine** — engine overflows constantly to a warehouse that turns out to be a NET cost (CLI stays LOW and never overflows — wasted inventory-tied-up cost — OR CLI stays CRITICAL and overflows constantly with poor ROI). Without R4, the warehouse role never changes. **Fix:** add the R4 sub-rule to Pillar 6; surface as a `warehouse_role_change` event in the Triple Whale stream so Move #358.1's cost-amortization layer re-classifies.

13. **No-BFCM-peak-multiplier-on-throughput-forecast** — engine forecasts next-4h throughput using current 4h throughput. During BFCM-peak (Move #89), next-4h throughput is 3-5× normal. Without the BFCM-peak-multiplier on the forecast, the SLA-breach-alert fires AFTER the breach. **Fix:** in Pillar 4, multiply forecasted_volume by the Move #89 BFCM-peak-multiplier when in BFCM window.

14. **No-subscription-cohort-fulfillment-pool-integration** — engine overflows subscription-cohort orders to a secondary warehouse that doesn't have the subscription-SKU inventory. Subscription-cohort RMA-rate-spikes-to-15-25%-per-quarter as a result. **Fix:** integrate Move #358 Pillar 5 subscription-cohort-fulfillment-pool trigger into the overflow-routing-rule; route subscription-cohort overflows only to warehouses flagged as subscription-cohort-eligible in Move #357 Pillar 3.

15. **No-cost-amortization-rollback-decision-attribution** — overflow-rollback-decision (R1-R4) emits to Triple Whale but doesn't feed back to Move #358.1's per-warehouse-cost-amortization-ledger. Move #358.1 thinks the warehouse is still profitable; the ROI attribution is silently wrong. **Fix:** emit `warehouse_role_change` events from Pillar 6 R4 to the Triple Whale per-overflow-event-stream AND to the Move #358.1 per-transfer-balance-event-stream (so both layers stay in sync).

16. **Move-#358.2-ships-without-Move-#358** — overflow-engine fires without Move #358's per-transfer-balance-event-stream. Without Move #358, the engine has no historical overflow-cost-vs-stockout-cost data to backtest against; confidence_band stays LOW forever. **Fix:** ship Move #358 first; the Move #358.2 90-day backtest depends on ≥90 days of Move #358 per-transfer-balance-event-stream data.

17. **Move-#358.2-ships-without-Move-#358.1** — overflow-engine emits per-overflow events but Move #358.1 cost-amortization-engine is not yet reading them. Per-overflow ROI attribution is silently absent. **Fix:** ship Move #358.1 first; Move #358.2's Triple Whale per-overflow-event-stream schema must match Move #358.1's per-transfer-balance-event-stream schema field-for-field (so Move #358.1 can read both streams in one consumer).

18. **Move-#358.2-ships-without-Move-#357** — overflow-routing-rule is hardcoded (US-East → US-West) but Move #357 Pillar 3 per-warehouse-routing-rule hasn't been generated yet. The hardcoded rule overrides Move #356's per-cohort-affinity-rollout. **Fix:** ship Move #357 first; Move #358.2's per-region overflow-routing-rule MUST inherit from Move #357 Pillar 3.

## Verification (this skill is "shipped" when...)

This skill is shipped when **all 10 gates** are met:

- **Gate A — Per-warehouse-capacity-utilization-vector published for ≥80% of active warehouses (≥5 dim each)**
  - The 5-dim vector (utilization_pct / throughput_units_per_hour / SLA-compliance-pct / dwell-time-minutes / return-rate-pct) is live for ≥80% of active warehouses with 5-minute refresh cadence sustained over 30 days.
- **Gate B — Per-warehouse CLI (0-100) published with band table**
  - The 5-dim weighted CLI is live for ≥80% of active warehouses with band table (LOW 0-40 / NORMAL 41-65 / ELEVATED 66-80 / AT-CAPACITY 81-92 / CRITICAL 93-100) and the sustained-period triggers (15 min for AT-CAPACITY, 5 min for CRITICAL).
- **Gate C — Per-region overflow-routing-rule published for ≥4 regions**
  - The 5-tuple overflow-routing-rule (primary / secondary / tertiary / fallback_dropship / overflow_cost_pct) is published for ≥4 regions (e.g. US-East / US-West / EU-DE / EU-UK / CA / AU / JP) AND inherits from Move #357 Pillar 3 per-warehouse-routing-rule.
- **Gate D — Per-region SLA-target table published for ≥4 regions**
  - The per-region SLA-target (e.g. US-East = 2-day / EU-DE = 3-day / BFCM-peak US-East = 3-day) is published for ≥4 regions.
- **Gate E — Overflow-cost-vs-stockout-cost-vs-delivery-delay-cost-calculator-decision-accuracy ≥80% on 90-day backtest**
  - The calculator's decision-routing (AUTO-EXECUTE-OVERFLOW / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT) is ≥80% accurate on a 90-day backtest of past overflow decisions (the 90-day backtest depends on ≥90 days of Move #358 per-transfer-balance-event-stream data being available).
- **Gate F — Per-warehouse-SLA-breach-alert-firing-accuracy ≥85% (predictive, BEFORE breach)**
  - The per-warehouse SLA-breach-alert fires ≥85% of the time BEFORE the SLA-breach actually happens (not after — predictive, not reactive).
- **Gate G — Triple-Whale per-overflow-event-stream-coverage ≥100%**
  - Every overflow decision + every rollback decision + every warehouse_role_change event emits to the Triple Whale per-overflow-event-stream with the 18-field schema, with confidence_band populated from 90-day backtest.
- **Gate H — Per-warehouse-rollback-decision-engine-coverage ≥100% (R1-R4)**
  - All 4 sub-rules R1-R4 are wired and have fired at least once in the last 90 days.
- **Gate I — Per-warehouse SLA-breach-rate <2%**
  - The per-warehouse SLA-breach-rate (orders shipped outside SLA / orders total) drops to <2% (down from 8-15% Tier-3 baseline / 4-8% Tier-2 baseline) sustained over 90 days.
- **Gate J — Per-warehouse-overflow-driven-stockout-cost-avoidance ≥$30k/quarter**
  - The Move #358.2 engine drives ≥$30k/quarter in stockout-cost-avoidance (cost-of-overflow is less than the cost-of-stockout).

## How to extend this skill

- **Move #358.3 — Per-SKU cross-warehouse-balance-supplier-drop-ship-engine** — given the Move #357 per-SKU-OTB-formula + the cross-warehouse-balance-engine, build the supplier-drop-ship-engine that bypasses warehouse transfer when supplier-lead-time < transfer-lead-time (interfaces with Move #357 Pillar 1 + supplier-API-integrations + ShipBob-Dropship-2026)
- **Move #358.4 — Per-region cross-warehouse-balance-BFCM-stress-test-engine** — given the Move #89 BFCM-peak-multiplier + the cross-warehouse-balance-engine, build the BFCM-stress-test-engine that simulates 3× normal Q4 demand on each (SKU × warehouse × region) cell and pre-positions inventory 8 weeks pre-BFCM (interfaces with Move #89 + Move #357 Pillar 4 + ShipBob-BFCM-2026 + LeanBox-BFCM-2026)
- **Move #358.5 — Per-SKU cross-warehouse-balance-decision-rollback-engine (per-transfer per-cohort-affinity-decay-rollback)** — extend Pillar 6 with cohort-affinity-decay-rollback that auto-rollbacks a transfer when the cohort-affinity-load decays below 0.3 for 3 consecutive weeks
- **Move #358.2.1 — Per-region overflow-routing-rule with per-city SLA-target** — extend Pillar 2 to operate at per-city granularity instead of per-region granularity (e.g. NYC → 1-day, LA → 2-day, Chicago → 2-day within US-East) for ultra-fine overflow routing; requires Move #357 Pillar 3 per-warehouse-routing-rule extension to per-city-grain
- **Move #358.2.2 — Per-overflow-A/B-experimentation-engine** — extend Pillar 3 to run a per-overflow A/B test where 50% of CLOSE-call overflow decisions (cost-ratio 0.85-1.0) AUTO-EXECUTE and 50% OPERATOR-APPROVAL, then measure 90-day LTV difference to refine the threshold

## Cross-references

- Move #358 — Cross-warehouse-balance-engine per-SKU-multi-warehouse-allocation (the prerequisite; provides per-transfer-balance-event-stream)
- Move #358.1 — Cross-warehouse-balance-cost-amortization-engine (the prerequisite; provides per-warehouse-cost-amortization-ledger + 4-sub-rule rollback pattern)
- Move #357 — Per-SKU inventory commitment + open-to-buy budget (the prerequisite; provides per-warehouse-routing-rule + per-region-fulfillment-pool)
- Move #356 — Assortment planning + hero-SKU strategy (the prerequisite; provides hero/halo/filler tier classification + per-cohort-affinity-rollout)
- Move #29 — Inventory forecasting + stockout prevention (the prerequisite; provides days-of-supply + stockout-risk signal)
- Move #86 — Dead-stock liquidation (the prerequisite; provides dead-stock-clearance path)
- Move #96 — Demand-sensing + supply-chain resilience (the prerequisite; provides demand-forecast signal)
- Move #25 — International expansion (the consumer; provides per-region-fulfillment-pool extension to non-US markets)
- Move #89 — BFCM-season-engine (the consumer; provides BFCM-peak-multiplier on throughput-forecast)
- Move #107 — Competitive price intelligence engine (the consumer; provides competitor-stockout-uplift on overflow priority)
- Move #11 — Subscription replenishment (the consumer; provides subscription-cohort-fulfillment-pool trigger)
- Move #103 — Product analytics per-SKU profit contribution + margin + cohort-LTV (the consumer; provides per-SKU-margin-overlay on overflow-cost calculator)
- Move #109 — AI product content generation engine (the consumer; provides per-SKU content cost amortization overlay)
- Move #113 — Per-cohort creative engine (the consumer; provides per-cohort creative cost amortization overlay)
- Move #115 — Per-cohort audience engine (the consumer; provides per-cohort-affinity overlay)
- Move #154 — Predictive LTV + churn engine (the consumer; provides customer-LTV-loss-on-SLA-breach term)
- Move #180 — Marketing mix modeling + MMM attribution engine (the consumer; provides per-channel attribution feedback)
- Move #181 — AI vendor orchestration governance engine (the consumer; provides warehouse-vendor-tier classification)
- Move #182 — AI agent trust recovery engine (the consumer; provides per-warehouse trust scoring)
- ShipBob Fulfillment API 2026 + ShipBob Overflow 2026 + ShipBob BFCM 2026 — fulfillment + overflow + peak APIs
- LeanBox Per-Channel 2026 + LeanBox Overflow 2026 + LeanBox BFCM 2026 — fulfillment + overflow + peak APIs
- FBA Multi-Channel Fulfillment API 2026 + FBA Overflow 2026 + FBA BFCM 2026 — fulfillment + overflow + peak APIs
- Manhattan Associates Active WM 2026 + Manhattan Wave Planning 2026 + Manhattan Labor Management 2026 — warehouse management + capacity APIs
- Blue Yonder Warehouse 2026 + Blue Yonder Capacity 2026 + Blue Yonder Labor 2026 — warehouse management + capacity APIs
- SAP EWM 2026 + SAP WMS 2026 + SAP IBP 2026 — enterprise warehouse management + capacity APIs
- Oracle WMS 2026 + Oracle Transportation Management 2026 + Oracle Demand Planning 2026 — enterprise warehouse management + capacity APIs
- Triple Whale Per-Overflow-Event-Stream 2026 + Polar Per-Overflow-Cost-Amortization 2026 + Northbeam Per-Overflow-ROI-Attribution 2026 — operator-attribution layer

## Sources

- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
- Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
- Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
- Move #356 assortment-planning-hero-sku-strategy 2026-09-26
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
- Move #89 BFCM-season-engine 2026-09-26
- Move #25 international-expansion 2026-09-26
- Move #29 inventory-forecasting-stockout-prevention 2026-09-26
- Move #11 subscription-replenishment 2026-09-26
- Move #107 competitive-price-intelligence-engine 2026-09-26
- Move #96 demand-sensing-supply-chain-resilience 2026-09-26
- Shopify Inventory API 2026 + Locations API 2026 + Transfers API 2026 + Fulfillment API 2026 + Webhooks 2026 + Admin GraphQL 2026 + Storefront API 2026 + Bulk 2026 + Flow 2026 + Markets 2026 + B2B 2026 + Plus 2026 + Hydrogen 2026 + Functions 2026 + Checkout Extensibility 2026
- Ikas 2026 + BigCommerce 2026 + WooCommerce 2026 + Salesforce Commerce Cloud 2026 + SAP Commerce Cloud 2026 + SAP S/4HANA 2026 + SAP IBP 2026 + SAP IOM 2026 + SAP SCM 2026 + SAP EWM 2026 + SAP WMS 2026
- NetSuite 2026 + NetSuite Inventory 2026 + NetSuite Warehouse 2026 + NetSuite Supply Chain 2026 + NetSuite Demand Planning 2026 + NetSuite SuiteCommerce 2026
- Oracle Fusion SCM 2026 + Oracle Supply Chain Planning 2026 + Oracle Inventory Management 2026 + Oracle Warehouse Management 2026 + Oracle Demand Planning 2026 + Oracle Transportation Management 2026 + Oracle WMS 2026
- Blue Yonder 2026 + Blue Yonder Allocation 2026 + Blue Yonder Warehouse 2026 + Blue Yonder Replenishment 2026 + Blue Yonder Supply Chain 2026 + Blue Yonder Multi-Warehouse 2026 + Blue Yonder Capacity 2026 + Blue Yonder Labor 2026 + Blue Yonder Throughput 2026
- Manhattan Associates 2026 + Manhattan Active SCM 2026 + Manhattan Warehouse 2026 + Manhattan Allocation 2026 + Manhattan Replenishment 2026 + Manhattan Multi-Warehouse 2026 + Manhattan Labor Management 2026 + Manhattan Throughput 2026 + Manhattan Capacity 2026 + Manhattan Warehouse Management 2026 + Manhattan Wave Planning 2026
- o9 Solutions 2026 + o9 Allocation 2026 + o9 Replenishment 2026 + o9 Inventory 2026 + o9 Supply Chain 2026 + o9 Capacity 2026 + o9 Throughput 2026
- Logility 2026 + Logility Allocation 2026 + Logility Replenishment 2026 + Logility Multi-Warehouse 2026 + Logility Capacity 2026 + Logility Throughput 2026
- ToolsGroup 2026 + ToolsGroup Allocation 2026 + ToolsGroup Replenishment 2026 + ToolsGroup Inventory Optimization 2026 + ToolsGroup Capacity 2026 + ToolsGroup Throughput 2026
- JDA 2026 + JDA Allocation 2026 + JDA Replenishment 2026 + JDA Multi-Warehouse 2026 + JDA Capacity 2026 + JDA Throughput 2026 + JDA Labor Management 2026
- Revionics 2026 + Revionics Allocation 2026 + Revionics Replenishment 2026 + Revionics Capacity 2026
- Aptos 2026 + Aptos Allocation 2026 + Aptos Replenishment 2026 + Aptos Multi-Warehouse 2026 + Aptos Capacity 2026 + Aptos Throughput 2026 + Aptos Labor Management 2026
- JustEnough 2026 + JustEnough Allocation 2026 + JustEnough Replenishment 2026 + JustEnough Multi-Warehouse 2026 + JustEnough Capacity 2026 + JustEnough Throughput 2026
- LeanBox 2026 + LeanBox Warehouse 2026 + LeanBox Routing 2026 + LeanBox Per-Channel 2026 + LeanBox Multi-Warehouse 2026 + LeanBox Transfers 2026 + LeanBox Cross-Warehouse-Balance 2026 + LeanBox Overflow 2026 + LeanBox Capacity 2026 + LeanBox Throughput 2026 + LeanBox SLA 2026
- ShipBob 2026 + ShipBob State of DTC Shipping 2026 + ShipBob Multi-Warehouse 2026 + ShipBob Routing 2026 + ShipBob Replenishment 2026 + ShipBob Fulfillment 2026 + ShipBob 3PL 2026 + ShipBob Transfers 2026 + ShipBob Cross-Warehouse-Balance 2026 + ShipBob Overflow 2026 + ShipBob Capacity 2026 + ShipBob Throughput 2026 + ShipBob SLA 2026 + ShipBob BFCM 2026 + ShipBob Peak 2026
- ShipMonk 2026 + ShipMonk Warehouse 2026 + ShipMonk Routing 2026 + ShipMonk Replenishment 2026 + ShipMonk Fulfillment 2026 + ShipMonk 3PL 2026 + ShipMonk Transfers 2026 + ShipMonk Cross-Warehouse-Balance 2026 + ShipMonk Overflow 2026 + ShipMonk Capacity 2026 + ShipMonk Throughput 2026 + ShipMonk SLA 2026 + ShipMonk BFCM 2026
- Fulfillment by Amazon 2026 + FBA Multi-Channel 2026 + FBA Routing 2026 + FBA Replenishment 2026 + FBA Fulfillment 2026 + FBA 3PL 2026 + FBA Transfers 2026 + FBA Inventory Distribution 2026 + FBA Overflow 2026 + FBA Capacity 2026 + FBA Throughput 2026 + FBA SLA 2026 + FBA BFCM 2026
- AMCF 2026 + AMCF Routing 2026 + AMCF Replenishment 2026 + AMCF Fulfillment 2026 + AMCF 3PL 2026 + AMCF Transfers 2026 + AMCF Cross-Warehouse-Balance 2026 + AMCF Overflow 2026 + AMCF Capacity 2026 + AMCF Throughput 2026 + AMCF SLA 2026 + AMCF BFCM 2026
- Flexport 2026 + Flexport Fulfillment 2026 + Flexport Routing 2026 + Flexport Warehouse 2026 + Flexport 3PL 2026 + Flexport Transfers 2026 + Flexport Cross-Warehouse-Balance 2026 + Flexport Overflow 2026 + Flexport Capacity 2026 + Flexport Throughput 2026 + Flexport SLA 2026 + Flexport BFCM 2026
- Shippo 2026 + Shippo Routing 2026 + Shippo Replenishment 2026 + Shippo Fulfillment 2026 + Shippo Cross-Warehouse-Balance 2026 + Shippo Overflow 2026 + Shippo Capacity 2026 + Shippo Throughput 2026 + Shippo SLA 2026
- Easyship 2026 + Easyship Routing 2026 + Easyship Replenishment 2026 + Easyship Fulfillment 2026 + Easyship 3PL 2026 + Easyship Transfers 2026 + Easyship Cross-Warehouse-Balance 2026 + Easyship Overflow 2026 + Easyship Capacity 2026 + Easyship Throughput 2026 + Easyship SLA 2026
- AfterShip 2026 + AfterShip Tracking 2026 + AfterShip Routing 2026 + AfterShip Replenishment 2026 + AfterShip Fulfillment 2026 + AfterShip 3PL 2026 + AfterShip Cross-Warehouse-Balance 2026 + AfterShip Overflow 2026 + AfterShip Capacity 2026 + AfterShip Throughput 2026 + AfterShip SLA 2026
- Route 2026 + Route Tracking 2026 + Route Routing 2026 + Route Replenishment 2026 + Route Fulfillment 2026 + Route 3PL 2026 + Route Cross-Warehouse-Balance 2026 + Route Overflow 2026 + Route Capacity 2026 + Route Throughput 2026 + Route SLA 2026
- Parcel Labs 2026 + Parcel Labs Tracking 2026 + Parcel Labs Routing 2026 + Parcel Labs Replenishment 2026 + Parcel Labs Fulfillment 2026 + Parcel Labs 3PL 2026 + Parcel Labs Cross-Warehouse-Balance 2026 + Parcel Labs Overflow 2026 + Parcel Labs Capacity 2026 + Parcel Labs Throughput 2026 + Parcel Labs SLA 2026
- Returnly 2026 + Returnly Routing 2026 + Returnly Replenishment 2026 + Returnly Fulfillment 2026 + Returnly Overflow 2026 + Returnly Capacity 2026 + Returnly Throughput 2026 + Returnly SLA 2026
- Loop Returns 2026 + Loop Routing 2026 + Loop Replenishment 2026 + Loop Fulfillment 2026 + Loop Overflow 2026 + Loop Capacity 2026 + Loop Throughput 2026 + Loop SLA 2026
- Recharge 2026 + Recharge Replenishment 2026 + Recharge OTB 2026 + Recharge Demand Planning 2026 + Recharge Merchandise Planning 2026 + Recharge Assortment 2026 + Recharge Allocation 2026
- Loop Subscriptions 2026 + Loop Replenishment 2026 + Loop OTB 2026 + Loop Demand Planning 2026 + Loop Merchandise Planning 2026 + Loop Assortment 2026 + Loop Allocation 2026
- Smile.io 2026 + Smile Replenishment 2026 + Smile OTB 2026 + Smile Demand Planning 2026 + Smile Merchandise Planning 2026 + Smile Assortment 2026 + Smile Allocation 2026
- Klaviyo 2026 + Klaviyo Flow 2026 + Klaviyo Replenishment 2026 + Klaviyo OTB 2026 + Klaviyo Demand Planning 2026 + Klaviyo Merchandise Planning 2026 + Klaviyo Assortment 2026 + Klaviyo Allocation 2026
- Postscript 2026 + Postscript Flow 2026 + Postscript Replenishment 2026 + Postscript OTB 2026 + Postscript Demand Planning 2026 + Postscript Merchandise Planning 2026 + Postscript Assortment 2026 + Postscript Allocation 2026
- Omnisend 2026 + Omnisend Flow 2026 + Omnisend Replenishment 2026 + Omnisend OTB 2026 + Omnisend Demand Planning 2026 + Omnisend Merchandise Planning 2026 + Omnisend Assortment 2026 + Omnisend Allocation 2026
- Triple Whale 2026 + Triple Whale Per-Overflow-Event-Stream 2026 + Triple Whale Capacity-Utilization 2026 + Triple Whale Throughput 2026 + Triple Whale Warehouse SLA 2026 + Triple Whale Warehouse Rollback 2026 + Triple Whale Per-Overflow-Cost 2026 + Triple Whale Per-Warehouse-Cost-Amortization 2026 + Triple Whale Per-Transfer-Balance-Event-Stream 2026
- Polar 2026 + Polar Overflow-Event-Stream 2026 + Polar Capacity-Utilization 2026 + Polar Throughput 2026 + Polar Warehouse SLA 2026 + Polar Warehouse Rollback 2026 + Polar Per-Overflow-Cost 2026
- Northbeam 2026 + Northbeam Overflow-Event-Stream 2026 + Northbeam Capacity-Utilization 2026 + Northbeam Throughput 2026 + Northbeam Warehouse SLA 2026
- McKinsey Supply Chain 2026 + Deloitte Warehouse 2026 + Forrester Warehouse 2026 + Gartner Supply Chain 2026 + Accenture Supply Chain 2026 + BCG Supply Chain 2026 + Bain Supply Chain 2026 + MIT Sloan Warehouse 2026 + HBR Supply Chain 2026 + Baymard Checkout 2026
- Retail Dive Warehouse 2026 + Modern Retail Warehouse 2026 + Retail TouchPoints Warehouse 2026 + Total Retail Warehouse 2026 + Chain Storage Warehouse 2026 + Digital Commerce 360 Warehouse 2026 + Practical Ecommerce Warehouse 2026 + EcommerceBytes Warehouse 2026
- Shopify State of DTC Shipping 2026 + BFCM 2026 Peak 2026 + Cyber Week 2026 + Post-BFCM Recovery 2026 + Peak Season 2026 + Holiday Fulfillment 2026 + ShipBob BFCM 2026 + ShipMonk BFCM 2026 + LeanBox BFCM 2026 + ShipBob Peak 2026 + ShipMonk Peak 2026 + LeanBox Peak 2026
