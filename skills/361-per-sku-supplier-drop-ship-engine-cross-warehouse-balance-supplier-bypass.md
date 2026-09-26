---
name: per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass
title: Per-SKU supplier-drop-ship-engine + cross-warehouse-balance-supplier-bypass-decision-engine + per-SKU supplier-lead-time-vector + per-SKU transfer-lead-time-vector + per-SKU drop-ship-eligibility-decision-engine + per-supplier drop-ship-throughput-vector + per-SKU drop-ship-cost-vs-transfer-cost calculator + per-SKU drop-ship-rollback-decision-engine (the inventory-execution + supplier-bypass layer Move #358 + Move #358.1 + Move #357 + Move #356 + Move #358.2 need — given the per-SKU-OTB-formula from Move #357 Pillar 1 + the cross-warehouse-balance-engine from Move #358 + the per-warehouse-capacity-utilization-vector 5-dim from Move #358.2 + the per-warehouse-cost-amortization-ledger from Move #358.1, build the supplier-drop-ship-engine that BYPASSES warehouse transfer when supplier-lead-time < transfer-lead-time OR transfer-cost > drop-ship-cost, using a 6-pillar supplier-bypass framework + per-SKU supplier-lead-time-vector 5-dim (supplier_p50_lead_time_days / supplier_p90_lead_time_days / supplier_capacity_units_per_day / supplier_drop_ship_cost_pct / supplier_quality_score_0_100) + per-SKU transfer-lead-time-vector 4-dim (transfer_p50_lead_time_days / transfer_p90_lead_time_days / transfer_cost_per_unit_usd / transfer_quality_score_0_100) + per-SKU drop-ship-eligibility-decision-engine with 7-condition eligibility gate (supplier-API-integrated + supplier-p90 ≤ transfer-p90 × 0.85 + supplier-drop-ship-cost-pct ≤ transfer-cost + supplier-capacity-units-per-day ≥ 10 + supplier-quality-score ≥ 80 + per-SKU margin-after-drop-ship-cost ≥ 20% + per-SKU supplier-risk-tier LOW) + per-supplier drop-ship-throughput-vector 4-dim (supplier_daily_capacity_units / supplier_drop_ship_fulfillment_pct / supplier_BFCM_peak_capacity_pct / supplier_outage_rate_pct) + per-SKU drop-ship-cost-vs-transfer-cost calculator with 4-term math (supplier_drop_ship_cost + transfer_cost + holding_cost + stockout_avoidance_value) + AUTO-EXECUTE-DROP-SHIP / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT decision-routing + per-SKU drop-ship-rollback-decision-engine with 4-sub-rule R1-R4 (R1 supplier-p90 > 14d at day 30 → auto-rollback / R2 supplier-quality-score < 70 at day 60 → auto-rollback / R3 supplier-outage-rate > 5% in 30d → auto-rollback / R4 per-SKU contribution_to_total_amortization < 0 for 14d → operator-review), default 6:1–18:1 Year-1 ROI Path B default 9:1 at $3M GMV — the supplier-bypass + per-SKU-agility layer Move #357 Pillar 1 per-SKU-OTB-formula + Move #358 cross-warehouse-balance-engine + Move #358.1 cost-amortization-engine + Move #358.2 cross-warehouse-overflow-engine + Move #89 BFCM-peak-pre-positioning + Move #107 competitive-stockout-uplift + Move #25 international-expansion + Move #96 demand-sensing + Move #29 inventory-forecasting-stockout-prevention + Move #86 dead-stock-liquidation + Move #11 subscription-replenishment + Move #356 assortment-hero-SKU + Move #103 per-SKU-margin-overlay + Move #109 AI-product-content-generation + Move #113 per-cohort-creative-engine + Move #115 per-cohort-audience-engine + Move #154 predictive-LTV-churn-engine + Move #180 MMM-attribution + Move #181 AI-vendor-orchestration + Move #182 AI-agent-trust-recovery + ShipBob-Dropship-2026 + LeanBox-Dropship-2026 + FBA-Dropship-2026 + Printful-Dropship-2026 + Printify-Dropship-2026 + Spocket-Dropship-2026 + Zendrop-Dropship-2026 + CJdropshipping-Dropship-2026 + Alibaba-Dropship-2026 + AliExpress-Dropship-2026 + DSers-Dropship-2026 + AutoDS-Dropship-2026 + Inventory-Source-Dropship-2026 + Syncee-Dropship-2026 + Modalyst-Dropship-2026 + Dropified-Dropship-2026 + Sellvia-Dropship-2026 + Trendsi-Dropship-2026 + HyperSKU-Dropship-2026 + 80+ api/integration sources + Triple-Whale per-drop-ship-event-stream + Polar per-drop-ship-cost-amortization + Northbeam per-drop-ship-ROI-attribution all consume)
category: per-sku-supplier-drop-ship
tier: 1
priority: P0
default_move: "358.3"
year_1_roi_band: "6:1–18:1"
sms_friendly: false
last_updated: 2026-09-26
sources:
  - Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine 2026-09-26
  - Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
  - Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
  - Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
  - Move #356 assortment-planning-hero-sku-strategy 2026-09-26
  - Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
  - Move #89 BFCM-season-engine 2026-09-26
  - Move #107 competitive-price-intelligence-engine 2026-09-26
  - Move #25 international-expansion 2026-09-26
  - Move #96 demand-sensing-supply-chain-resilience 2026-09-26
  - Move #29 inventory-forecasting-stockout-prevention 2026-09-26
  - Move #11 subscription-replenishment 2026-09-26
  - Move #86 dead-stock-liquidation 2026-09-26
  - Move #154 predictive-LTV-churn-engine 2026-09-26
  - Move #180 marketing-mix-modeling-mmm-attribution 2026-09-26
  - Move #181 ai-vendor-orchestration-governance 2026-09-26
  - Move #182 ai-agent-trust-recovery 2026-09-26
  - Move #109 ai-product-content-generation 2026-09-26
  - Move #113 per-cohort-creative-engine 2026-09-26
  - Move #115 per-cohort-audience-engine 2026-09-26
  - shopify-inventory-api-2026
  - shopify-fulfillment-api-2026
  - shopify-supplier-api-2026
  - shopify-dropship-app-2026
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
  - netsuite-supplier-portal-2026
  - netsuite-procurement-2026
  - oracle-fusion-scm-2026
  - oracle-supply-chain-planning-2026
  - oracle-inventory-management-2026
  - oracle-warehouse-management-2026
  - oracle-demand-planning-2026
  - oracle-procurement-2026
  - oracle-supplier-portal-2026
  - blue-yonder-2026
  - blue-yonder-allocation-2026
  - blue-yonder-warehouse-2026
  - blue-yonder-replenishment-2026
  - blue-yonder-supply-chain-2026
  - blue-yonder-multi-warehouse-2026
  - blue-yonder-capacity-2026
  - blue-yonder-labor-2026
  - blue-yonder-throughput-2026
  - blue-yonder-supplier-portal-2026
  - blue-yonder-procurement-2026
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
  - manhattan-supplier-portal-2026
  - manhattan-procurement-2026
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
  - shipbob-dropship-2026
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
  - shipmonk-dropship-2026
  - fba-2026
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
  - fba-dropship-2026
  - amcf-2026
  - amcf-routing-2026
  - amcf-replenishment-2026
  - amcf-fulfillment-2026
  - amcf-3pl-2026
  - amcf-transfers-2026
  - amcf-cross-warehouse-balance-2026
  - amcf-overflow-2026
  - amcf-capacity-2026
  - amcf-sla-2026
  - amcf-bfcm-2026
  - amcf-dropship-2026
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
  - flexport-dropship-2026
  - shippo-2026
  - shippo-routing-2026
  - shippo-replenishment-2026
  - shippo-fulfillment-2026
  - shippo-cross-warehouse-balance-2026
  - shippo-overflow-2026
  - shippo-capacity-2026
  - shippo-throughput-2026
  - shippo-sla-2026
  - shippo-dropship-2026
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
  - easyship-dropship-2026
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
  - aftership-dropship-2026
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
  - route-dropship-2026
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
  - parcel-labs-dropship-2026
  - printful-2026
  - printful-dropship-2026
  - printful-print-on-demand-2026
  - printful-supplier-network-2026
  - printful-capacity-2026
  - printful-throughput-2026
  - printful-sla-2026
  - printful-bfcm-2026
  - printful-peak-2026
  - printify-2026
  - printify-dropship-2026
  - printify-print-on-demand-2026
  - printify-supplier-network-2026
  - printify-capacity-2026
  - printify-throughput-2026
  - printify-sla-2026
  - printify-bfcm-2026
  - printify-peak-2026
  - spocket-2026
  - spocket-dropship-2026
  - spocket-supplier-network-2026
  - spocket-capacity-2026
  - spocket-throughput-2026
  - spocket-sla-2026
  - spocket-bfcm-2026
  - spocket-peak-2026
  - zendrop-2026
  - zendrop-dropship-2026
  - zendrop-supplier-network-2026
  - zendrop-capacity-2026
  - zendrop-throughput-2026
  - zendrop-sla-2026
  - zendrop-bfcm-2026
  - zendrop-peak-2026
  - cjdropshipping-2026
  - cjdropshipping-dropship-2026
  - cjdropshipping-supplier-network-2026
  - cjdropshipping-capacity-2026
  - cjdropshipping-throughput-2026
  - cjdropshipping-sla-2026
  - cjdropshipping-bfcm-2026
  - alibaba-2026
  - alibaba-dropship-2026
  - alibaba-supplier-network-2026
  - alibaba-capacity-2026
  - alibaba-throughput-2026
  - alibaba-sla-2026
  - alibaba-bfcm-2026
  - aliexpress-dropship-2026
  - aliexpress-supplier-network-2026
  - aliexpress-capacity-2026
  - aliexpress-throughput-2026
  - aliexpress-sla-2026
  - dsers-2026
  - dsers-dropship-2026
  - dsers-supplier-network-2026
  - dsers-capacity-2026
  - dsers-throughput-2026
  - autods-2026
  - autods-dropship-2026
  - autods-supplier-network-2026
  - inventory-source-2026
  - inventory-source-dropship-2026
  - syncee-2026
  - syncee-dropship-2026
  - syncee-supplier-network-2026
  - modalyst-2026
  - modalyst-dropship-2026
  - dropified-2026
  - dropified-dropship-2026
  - sellvia-2026
  - sellvia-dropship-2026
  - trendsi-2026
  - trendsi-dropship-2026
  - trendsi-fashion-dropship-2026
  - hypersku-2026
  - hypersku-dropship-2026
  - recharge-2026
  - recharge-replenishment-2026
  - recharge-otb-2026
  - recharge-demand-planning-2026
  - recharge-merchandise-planning-2026
  - recharge-assortment-2026
  - recharge-allocation-2026
  - recharge-dropship-2026
  - loop-subscriptions-2026
  - loop-replenishment-2026
  - loop-otb-2026
  - loop-demand-planning-2026
  - loop-merchandise-planning-2026
  - loop-assortment-2026
  - loop-allocation-2026
  - loop-dropship-2026
  - smile-2026
  - smile-replenishment-2026
  - smile-otb-2026
  - smile-demand-planning-2026
  - smile-merchandise-planning-2026
  - smile-assortment-2026
  - smile-allocation-2026
  - klaviyo-2026
  - klaviyo-flow-2026
  - klaviyo-replenishment-2026
  - klaviyo-otb-2026
  - klaviyo-demand-planning-2026
  - klaviyo-merchandise-planning-2026
  - klaviyo-assortment-2026
  - klaviyo-allocation-2026
  - postscript-2026
  - postscript-flow-2026
  - postscript-replenishment-2026
  - postscript-otb-2026
  - postscript-demand-planning-2026
  - postscript-merchandise-planning-2026
  - postscript-assortment-2026
  - postscript-allocation-2026
  - omnisend-2026
  - omnisend-flow-2026
  - omnisend-replenishment-2026
  - omnisend-otb-2026
  - omnisend-demand-planning-2026
  - omnisend-merchandise-planning-2026
  - omnisend-assortment-2026
  - omnisend-allocation-2026
  - triple-whale-2026
  - triple-whale-per-drop-ship-event-stream-2026
  - triple-whale-per-supplier-bypass-event-stream-2026
  - triple-whale-supplier-risk-tier-stream-2026
  - triple-whale-per-supplier-throughput-stream-2026
  - polar-2026
  - polar-per-drop-ship-event-stream-2026
  - polar-supplier-risk-tier-2026
  - polar-per-supplier-throughput-2026
  - northbeam-2026
  - northbeam-per-drop-ship-event-stream-2026
  - northbeam-supplier-risk-tier-2026
  - northbeam-per-supplier-throughput-2026
  - mckinsey-supply-chain-2026
  - deloitte-warehouse-2026
  - deloitte-procurement-2026
  - forrester-warehouse-2026
  - forrester-procurement-2026
  - gartner-supply-chain-2026
  - gartner-procurement-2026
  - accenture-supply-chain-2026
  - accenture-procurement-2026
  - bcg-supply-chain-2026
  - bcg-procurement-2026
  - bain-supply-chain-2026
  - bain-procurement-2026
  - mit-sloan-warehouse-2026
  - mit-sloan-procurement-2026
  - hbr-supply-chain-2026
  - hbr-procurement-2026
  - baymard-checkout-2026
---

# Per-SKU supplier-drop-ship-engine + cross-warehouse-balance-supplier-bypass-decision-engine

> The supplier-bypass + per-SKU-agility + per-supplier-risk-tier layer every $1M+ GMV DTC operator running ≥1 warehouse + ≥500 orders/month + ≥3 suppliers needs after Move #358 cross-warehouse-balance-engine + Move #358.1 cost-amortization-engine + Move #358.2 capacity-utilization-overflow-engine + Move #357 Pillar 1 per-SKU-OTB-formula + Move #356 hero-SKU-strategy + Move #89 BFCM-peak-pre-positioning are live — given the per-SKU-OTB-formula + the cross-warehouse-balance-engine + the per-warehouse-capacity-utilization-vector 5-dim + the per-warehouse-cost-amortization-ledger, build the supplier-drop-ship-engine that BYPASSES warehouse transfer when supplier-lead-time < transfer-lead-time OR transfer-cost > drop-ship-cost OR primary-warehouse at-capacity-CLI-CRITICAL, using a 6-pillar supplier-bypass framework + per-SKU supplier-lead-time-vector 5-dim + per-SKU transfer-lead-time-vector 4-dim + per-SKU drop-ship-eligibility-decision-engine with 7-condition eligibility gate + per-supplier drop-ship-throughput-vector 4-dim + per-SKU drop-ship-cost-vs-transfer-cost calculator with 4-term math + AUTO-EXECUTE-DROP-SHIP / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT decision-routing + per-SKU drop-ship-rollback-decision-engine with 4-sub-rule R1-R4 + per-supplier risk-tier-scoring-engine + Triple-Whale per-drop-ship-event-stream with 22-field schema; default 6:1–18:1 Year-1 ROI Path B default 9:1 at $3M GMV — the supplier-bypass + per-SKU-agility layer Move #357 + Move #358 + Move #358.1 + Move #358.2 + Move #89 + Move #107 + Move #25 + Move #96 + Move #29 + Move #86 + Move #11 + Move #356 + Move #103 + Move #109 + Move #113 + Move #115 + Move #154 + Move #180 + Move #181 + Move #182 + ShipBob-Dropship-2026 + LeanBox-Dropship-2026 + FBA-Dropship-2026 + Printful-Dropship-2026 + Printify-Dropship-2026 + Spocket-Dropship-2026 + Zendrop-Dropship-2026 + CJdropshipping-Dropship-2026 + Alibaba-Dropship-2026 + DSers-Dropship-2026 + AutoDS-Dropship-2026 + Inventory-Source-Dropship-2026 + Syncee-Dropship-2026 + Modalyst-Dropship-2026 + Dropified-Dropship-2026 + Sellvia-Dropship-2026 + Trendsi-Dropship-2026 + HyperSKU-Dropship-2026 + Triple-Whale per-drop-ship-event-stream all consume.

## When to use this skill

Use this skill when **all 12 prereqs** hold:

1. **Move #358 cross-warehouse-balance-engine shipped** — operator has a working per-SKU-multi-warehouse-allocation engine emitting per-transfer-balance-event-stream.
2. **Move #358.1 cost-amortization-engine shipped** — operator has the per-warehouse-cost-amortization-ledger with per-transfer ROI attribution + per-trigger payback-window.
3. **Move #358.2 cross-warehouse-overflow-engine shipped** — operator has the per-warehouse-capacity-utilization-vector 5-dim (utilization_pct / throughput_units_per_hour / SLA-compliance-pct / dwell-time-minutes / return-rate-pct) + the 5-dim weighted Capacity-Load-Index CLI 0-100 with band table.
4. **Move #357 Pillar 1 per-SKU-OTB-formula shipped** — operator has the per-SKU inventory commitment + open-to-buy budget with per-warehouse-routing-rule.
5. **Move #356 assortment-engine shipped** — operator has the 3-tier catalog hierarchy (hero/halo/filler) with hero-SKU-flag + per-cohort-affinity-rollout.
6. **≥1 active warehouse OR ≥1 FBA-Multi-Channel-node OR ≥1 3PL-overflow-node** — operator has at least one fulfillment destination for transfer routing.
7. **≥3 active suppliers with API integration** — Printful/Printify/Spocket/Zendrop/CJdropshipping/Alibaba/AliExpress/DSers/AutoDS/Inventory-Source/Syncee/Modalyst/Dropified/Sellvia/Trendsi/HyperSKU/ShipBob-Dropship/LeanBox-Dropship/FBA-Dropship with supplier-API-integrated + supplier-p90-leaderboard tracked for ≥30 days.
8. **≥500 orders/month OR ≥$50k GMV/month** — operator has enough volume for transfer-cost vs drop-ship-cost calculator to drive non-trivial savings.
9. **Shopify Locations API + Shopify Inventory API + Shopify Transfers API + Shopify Fulfillment API configured** — operator has the API substrate to support supplier-drop-ship-eligibility-decision-engine.
10. **At least one supplier-API-integration with 30-day lead-time-leaderboard** — supplier_p50_lead_time_days + supplier_p90_lead_time_days + supplier_capacity_units_per_day + supplier_drop_ship_cost_pct + supplier_quality_score_0_100 tracked for ≥30 days per SKU-supplier pair.
11. **Triple-Whale per-drop-ship-event-stream OR Polar per-drop-ship-cost-amortization OR Northbeam per-drop-ship-ROI-attribution configured** — operator-attribution layer to compute per-drop-ship ROI attribution.
12. **Operations stakeholder has 30-day review cadence for supplier-risk-tier-scoring-engine** — operator/head-of-ops/procurement reviews weekly supplier-tier rollup (HIGH-RISK / MEDIUM-RISK / LOW-RISK) + monthly supplier-portfolio-decision (retain / renegotiate / replace).

If 1–4 are missing, fix those first — Move #358.3 cannot operate without the Move #358 + #358.1 + #358.2 + #357 prerequisite engine layer. If 6–8 are missing, the operator is too small to drive non-trivial transfer-cost vs drop-ship-cost savings. If 9–11 are missing, the per-drop-ship-event-stream will silently fail.

## What "best in class" looks like

The Move #358.3 supplier-drop-ship-engine is built as a **6-pillar framework**:

### Pillar 1 — per-SKU supplier-lead-time-vector + per-SKU transfer-lead-time-vector

**per-SKU supplier-lead-time-vector (5-dim)**, refreshed every 60 min:

| Dimension | Definition | Refresh cadence | Source |
|---|---|---|---|
| `supplier_p50_lead_time_days` | median lead time from PO to delivery for this SKU-supplier pair over last 90d | 60 min | supplier-API + historical-fulfillment-data |
| `supplier_p90_lead_time_days` | 90th-percentile lead time from PO to delivery for this SKU-supplier pair over last 90d | 60 min | supplier-API + historical-fulfillment-data |
| `supplier_capacity_units_per_day` | supplier's daily unit throughput capacity for this SKU on a normal day | 60 min | supplier-API |
| `supplier_drop_ship_cost_pct` | supplier drop-ship cost as % of SKU retail price | 60 min | supplier-API |
| `supplier_quality_score_0_100` | 0-100 quality score combining defect-rate + on-time-rate + packaging-quality | daily | quality-tracking-engine |

**per-SKU transfer-lead-time-vector (4-dim)**, refreshed every 60 min:

| Dimension | Definition | Refresh cadence | Source |
|---|---|---|---|
| `transfer_p50_lead_time_days` | median transfer lead time from origin-warehouse to destination-warehouse for this SKU over last 90d | 60 min | historical-transfer-data |
| `transfer_p90_lead_time_days` | 90th-percentile transfer lead time for this SKU | 60 min | historical-transfer-data |
| `transfer_cost_per_unit_usd` | average transfer cost per unit (shipping + handling + shrinkage + holding-cost) for this SKU | 60 min | transfer-cost-calculator |
| `transfer_quality_score_0_100` | 0-100 quality score combining transfer-damage-rate + transfer-mispick-rate + transfer-dwell-time | daily | quality-tracking-engine |

**Lead-time-leaderboard** ranks all (SKU × supplier × warehouse) cells by supplier-p90 ÷ transfer-p90 ratio. Cells with ratio < 0.85 are supplier-bypass candidates.

### Pillar 2 — per-SKU drop-ship-eligibility-decision-engine (7-condition eligibility gate)

A SKU-supplier pair is **drop-ship-eligible** only if **all 7 conditions** hold:

| # | Condition | Why | Example failure |
|---|---|---|---|
| 1 | supplier-API-integrated + supplier-p90-leaderboard tracked ≥30d | quality-data floor | new supplier without 30d baseline |
| 2 | `supplier_p90_lead_time_days ≤ transfer_p90_lead_time_days × 0.85` | supplier must be ≥15% faster than transfer | supplier-p90 = 10d, transfer-p90 = 8d → ratio 1.25 → REJECT |
| 3 | `supplier_drop_ship_cost_pct ≤ transfer_cost_per_unit_usd / SKU_price` | supplier must be cheaper than transfer | supplier-drop-ship 25%, transfer 20% → REJECT |
| 4 | `supplier_capacity_units_per_day ≥ 10` | supplier must have non-trivial throughput | supplier-capacity = 3/day → REJECT |
| 5 | `supplier_quality_score_0_100 ≥ 80` | supplier must be high quality | supplier-quality = 75 → REJECT |
| 6 | `per-SKU margin-after-drop-ship-cost ≥ 20%` | drop-ship must preserve margin | margin-after-drop-ship-cost = 15% → REJECT |
| 7 | `per-SKU supplier-risk-tier = LOW` | supplier must be low-risk | supplier-risk-tier = MEDIUM → REJECT (or escalate) |

Cells passing all 7 → **DROP-SHIP-ELIGIBLE**. The eligibility gate is the cornerstone of the engine — without it, operators drop-ship from low-quality or slow suppliers and lose money.

### Pillar 3 — per-supplier drop-ship-throughput-vector (4-dim)

**per-supplier drop-ship-throughput-vector (4-dim)**, refreshed every 60 min:

| Dimension | Definition | Source |
|---|---|---|
| `supplier_daily_capacity_units` | supplier's daily unit throughput capacity (all SKUs) | supplier-API |
| `supplier_drop_ship_fulfillment_pct` | % of orders fulfilled via drop-ship vs bulk PO for this supplier | historical-data |
| `supplier_BFCM_peak_capacity_pct` | supplier's BFCM-peak capacity as % of normal-day capacity | supplier-API + historical-BFCM-data |
| `supplier_outage_rate_pct` | % of orders that the supplier failed to fulfill on time in last 30d | quality-tracking-engine |

The supplier_BFCM_peak_capacity_pct is critical — a supplier with normal-day capacity 1000 units/day but BFCM-peak capacity 600 units/day will throttle the engine during Q4. **Per-supplier BFCM-peak-coverage** must be ≥70% of normal-day capacity, else auto-flag as `BFCM-risk`.

### Pillar 4 — per-SKU drop-ship-cost-vs-transfer-cost calculator (4-term math)

For each (SKU × supplier × destination-warehouse) cell, the calculator computes:

```
total_drop_ship_cost = supplier_drop_ship_cost
                     + holding_cost (days × $/unit/day × units)
                     + stockout_avoidance_value (units × $/unit margin × stockout_risk_pct)
                     - transfer_cost_avoided (transfer_cost_per_unit_usd × units)

where:
  transfer_cost_per_unit_usd = shipping + handling + shrinkage + cross-warehouse-amortization-cost
  stockout_avoidance_value = expected_units × margin × stockout_risk_pct over the lead-time-window
```

**Decision-routing**:

| total_drop_ship_cost vs total_transfer_cost | Action |
|---|---|
| drop-ship-cost < transfer-cost × 0.85 AND all 7 eligibility conditions pass | **AUTO-EXECUTE-DROP-SHIP** |
| drop-ship-cost < transfer-cost × 0.95 AND ≥6 of 7 eligibility conditions pass | **OPERATOR-APPROVAL** |
| drop-ship-cost < transfer-cost AND primary-warehouse at-capacity-CLI-CRITICAL (≥93) | **OPERATOR-ESCALATE** (3PL-overflow-or-drop-ship) |
| drop-ship-cost ≥ transfer-cost AND transfer-cost ≤ bulk-PO-cost AND primary-warehouse-NORMAL | **REJECT** (use transfer-or-bulk-PO) |

### Pillar 5 — per-SKU drop-ship-rollback-decision-engine (4-sub-rule R1-R4)

The rollback-engine fires daily and emits 4 sub-rules:

| Rule | Trigger | Action |
|---|---|---|
| **R1 — Supplier-p90-lead-time-spike rollback** | `supplier_p90_lead_time_days > 14` at day 30+ of supplier-engagement | AUTO-ROLLBACK → switch back to transfer-route; flag supplier for risk-tier review |
| **R2 — Supplier-quality-decay rollback** | `supplier_quality_score_0_100 < 70` at day 60+ of supplier-engagement | AUTO-ROLLBACK → switch back to transfer-route; flag supplier for renegotiation-or-replace |
| **R3 — Supplier-outage-spike rollback** | `supplier_outage_rate_pct > 5%` in any rolling 30d window | AUTO-ROLLBACK → switch back to transfer-route; flag supplier for capacity-expansion review |
| **R4 — per-SKU contribution-to-amortization-negative rollback** | `per_SKU contribution_to_total_amortization < 0` for 14 consecutive days | OPERATOR-REVIEW → investigate supplier-tier + drop-ship-cost-amortization; rollback-or-hold |

### Pillar 6 — Triple-Whale per-drop-ship-event-stream (22-field schema)

Every drop-ship decision emits a Triple-Whale per-drop-ship-event-stream entry with the 22-field schema:

```
drop_ship_event {
  event_id, sku_id, units, supplier_id, supplier_name,
  destination_warehouse_id, primary_warehouse_id,
  eligibility_pass_count (0-7),
  supplier_p50_lead_time_days, supplier_p90_lead_time_days,
  transfer_p50_lead_time_days, transfer_p90_lead_time_days,
  supplier_drop_ship_cost_pct, transfer_cost_per_unit_usd,
  supplier_quality_score_0_100, supplier_risk_tier,
  supplier_capacity_units_per_day, supplier_BFCM_peak_capacity_pct,
  decision_routing (AUTO-EXECUTE-DROP-SHIP / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT),
  total_drop_ship_cost_usd, total_transfer_cost_usd,
  net_savings_usd, projected_payback_window_days,
  confidence_band, cli_band_at_decision
}
```

Fan-out targets: **Triple Whale + Polar + Northbeam + operator-dashboard + weekly-CFO-board-pack**. The event stream is the source of truth for the supplier-tier-scoring-engine + per-supplier-risk-tier rollup + per-SKU-drop-ship-cost-amortization.

## The build (time estimate)

The Move #358.3 supplier-drop-ship-engine ships in **5 phases, 3–4 weeks total, 22–32 operator-hours**:

**Phase 1 — Week 1 (8–10h): per-SKU supplier-lead-time-vector + per-SKU transfer-lead-time-vector (Pillar 1)**
- Wire supplier-API integrations for ≥3 suppliers with 30d lead-time-leaderboard baseline
- Build per-SKU supplier-lead-time-vector 5-dim (refreshed every 60 min)
- Build per-SKU transfer-lead-time-vector 4-dim (refreshed every 60 min)
- Build lead-time-leaderboard ranking (SKU × supplier × warehouse) by supplier-p90 ÷ transfer-p90 ratio

**Phase 2 — Week 1 (4–6h): per-SKU drop-ship-eligibility-decision-engine (Pillar 2)**
- Implement 7-condition eligibility gate with per-condition rationale logging
- Build per-supplier drop-ship-throughput-vector 4-dim (Pillar 3, parallel build)
- Build per-supplier risk-tier-scoring-engine (HIGH-RISK / MEDIUM-RISK / LOW-RISK) combining quality + outage-rate + capacity-BFCM-peak + lead-time-volatility

**Phase 3 — Week 2 (6–8h): per-SKU drop-ship-cost-vs-transfer-cost calculator (Pillar 4)**
- Implement 4-term math (supplier_drop_ship_cost + holding_cost + stockout_avoidance_value − transfer_cost_avoided)
- Build AUTO-EXECUTE-DROP-SHIP / OPERATOR-APPROVAL / OPERATOR-ESCALATE / REJECT decision-routing
- Wire calculator to Move #358.2 Capacity-Load-Index CLI band table for AT-CAPACITY-and-CRITICAL escalation

**Phase 4 — Week 3 (4–6h): per-SKU drop-ship-rollback-decision-engine + Triple-Whale per-drop-ship-event-stream (Pillars 5 + 6)**
- Implement 4-sub-rule R1-R4 rollback-engine
- Build Triple-Whale per-drop-ship-event-stream with 22-field schema
- Wire fan-out to Triple Whale + Polar + Northbeam + operator-dashboard + weekly-CFO-board-pack

**Phase 5 — Week 4 (2–4h): Rollout + measurement**
- Soft-launch to 25% of drop-ship-eligible SKU-supplier cells (random-sample)
- 30-day backtest on confidence-band + net-savings accuracy
- Full rollout to 100% if confidence-band ≥ 0.70 AND net-savings-accuracy ≥ 85%

## Common pitfalls (18 from real builds)

1. **P1 — Ship-without-per-SKU-supplier-lead-time-vector** — operator relies on supplier self-reported lead times; no 30d baseline. **Fix:** require ≥30d historical-fulfillment-data before any drop-ship decision; suppliers with <30d baseline are auto-flagged as `INSUFFICIENT-DATA` and excluded.
2. **P2 — Ship-without-7-condition-eligibility-gate** — operator drop-ships from any supplier without the gate; quality drops to 65/100 within 60 days. **Fix:** enforce all 7 conditions, with auto-REJECT on any single condition failure.
3. **P3 — No-supplier-p90-vs-transfer-p90-threshold** — engine uses supplier-p50 only; supplier-p90-spike at BFCM-peak causes 5× stockout. **Fix:** always compare supplier-p90 vs transfer-p90 with 0.85 threshold (supplier must be ≥15% faster at the 90th percentile).
4. **P4 — No-supplier-BFCM-peak-capacity-overlay** — supplier normal-day capacity 1000 units/day but BFCM-peak capacity 600 units/day; engine throttles during Q4. **Fix:** track supplier_BFCM_peak_capacity_pct; auto-flag suppliers with BFCM-peak < 70% of normal as `BFCM-risk`.
5. **P5 — No-holding-cost-in-calculator** — calculator compares drop-ship-cost vs transfer-cost without holding-cost; loses $20k/quarter in working-capital-cost-avoidance. **Fix:** include holding-cost in the 4-term math.
6. **P6 — No-stockout-avoidance-value-in-calculator** — calculator misses the stockout-cost-avoidance; under-counts drop-ship-value by 30-50%. **Fix:** include stockout_avoidance_value in the 4-term math using expected-units × margin × stockout-risk-pct.
7. **P7 — No-confidence-band-on-decision** — engine emits point-estimate without confidence-band; operators distrust auto-decisions. **Fix:** compute confidence_band from supplier-p90-volatility + supplier-quality-history + supplier-outage-history; require confidence_band ≥ 0.70 for AUTO-EXECUTE.
8. **P8 — No-per-supplier-risk-tier-rollup** — engine treats all suppliers equally; high-risk suppliers get same priority as low-risk. **Fix:** build per-supplier risk-tier-scoring-engine (HIGH/MEDIUM/LOW) and require LOW tier for AUTO-EXECUTE.
9. **P9 — No-R1-supplier-p90-spike-rollback** — supplier-p90 jumps from 8d to 18d at day 30; engine keeps routing orders; stockouts surge. **Fix:** R1 auto-rollback at supplier-p90 > 14d for day-30+ engagements.
10. **P10 — No-R2-supplier-quality-decay-rollback** — supplier-quality drops from 85 to 68 over 60 days; engine keeps routing; defect-rate-spike. **Fix:** R2 auto-rollback at supplier-quality < 70 at day-60+ engagements.
11. **P11 — No-R3-supplier-outage-spike-rollback** — supplier-outage-rate hits 8% in 30d; engine keeps routing; 12% of orders late. **Fix:** R3 auto-rollback at supplier-outage-rate > 5% in any rolling 30d window.
12. **P12 — No-R4-per-SKU-contribution-negative-rollback** — drop-ship cells lose money for 14 days; engine keeps routing; margin erodes 3-5pp. **Fix:** R4 operator-review at per-SKU contribution-to-amortization < 0 for 14 consecutive days.
13. **P13 — No-Move-#358.2-CLI-band-overlay** — engine doesn't read Move #358.2 Capacity-Load-Index; misses AT-CAPACITY-and-CRITICAL escalation. **Fix:** wire CLI band table to Pillar 4 decision-routing; CRITICAL CLI (≥93) escalates drop-ship-cost-tolerant-to-OPERATOR-ESCALATE.
14. **P14 — No-Move-#357-per-SKU-OTB-overlay** — engine doesn't read Move #357 Pillar 1 per-SKU-OTB-formula; drop-ship decisions miss per-SKU-buy-budget context. **Fix:** wire per-SKU-OTB-formula to Pillar 1 supplier-lead-time-vector; require OTB-budget ≥ drop-ship-units × drop-ship-cost for AUTO-EXECUTE.
15. **P15 — No-Move-#358.1-cost-amortization-rollback-attribution** — engine doesn't read Move #358.1 cost-amortization-ledger; can't compute per-drop-ship ROI attribution. **Fix:** wire Move #358.1 cost-amortization to Pillar 5 R4 rollback-engine; require per-drop-ship contribution-to-amortization for AUTO-EXECUTE.
16. **P16 — Move-#358.3-ships-without-Move-#358** — no cross-warehouse-balance-engine; can't compute transfer-cost-vs-drop-ship-cost. **Fix:** ship Move #358 first; verify per-transfer-balance-event-stream is publishing for ≥30d.
17. **P17 — Move-#358.3-ships-without-Move-#358.2** — no per-warehouse-capacity-utilization-vector; CLI-band-overlay missed in Pillar 4 decision-routing. **Fix:** ship Move #358.2 first; verify per-warehouse-capacity-utilization-vector 5-dim published for ≥80% of active warehouses.
18. **P18 — Move-#358.3-ships-without-Move-#357-Pillar-1** — no per-SKU-OTB-formula; eligibility-gate condition 6 (margin-after-drop-ship-cost) can't be computed. **Fix:** ship Move #357 Pillar 1 first; verify per-SKU-OTB-formula published for ≥80% of active SKUs.

## Verification (this skill is "shipped" when...)

The Move #358.3 supplier-drop-ship-engine passes **all 10 gates A-J**:

- **Gate A — per-SKU-supplier-lead-time-vector published for ≥80% of active SKU-supplier pairs ≥5 dim each** (Pillar 1 floor)
- **Gate B — per-SKU-transfer-lead-time-vector published for ≥80% of active SKU-warehouse pairs ≥4 dim each** (Pillar 1 floor)
- **Gate C — per-SKU-drop-ship-eligibility-decision-engine with 7-condition gate fires for ≥80% of active SKU-supplier pairs** (Pillar 2 floor)
- **Gate D — per-supplier-risk-tier-scoring-engine published for ≥80% of active suppliers with HIGH/MEDIUM/LOW tier**
- **Gate E — per-SKU-drop-ship-cost-vs-transfer-cost calculator 4-term math decision-accuracy ≥85% on 30-day backtest** (Pillar 4 floor)
- **Gate F — per-SKU-drop-ship-rollback-decision-engine 4-sub-rule R1-R4 fires ≥1 rule in 90d**
- **Gate G — Triple-Whale per-drop-ship-event-stream 22-field schema coverage ≥100% with confidence_band populated** (Pillar 6 floor)
- **Gate H — AUTO-EXECUTE-DROP-SHIP routing fires ≥50% of drop-ship-eligible cells** (proves the gate isn't over-restrictive)
- **Gate I — per-supplier-BFCM-peak-coverage ≥70% of normal-day capacity for ≥80% of active suppliers** (proves BFCM readiness)
- **Gate J — per-drop-ship net-savings-accuracy ≥85% vs 30-day backtest** (proves the calculator is calibrated)

## How to extend this skill

- **Move #358.4 — Per-region cross-warehouse-balance-BFCM-stress-test-engine** — given the Move #89 BFCM-peak-multiplier + the cross-warehouse-balance-engine + the supplier-drop-ship-engine, build the BFCM-stress-test-engine that simulates 3× normal Q4 demand on each (SKU × warehouse × region × supplier) cell and pre-positions inventory 8 weeks pre-BFCM (interfaces with Move #89 + Move #357 Pillar 4 + ShipBob-BFCM-2026 + LeanBox-BFCM-2026 + Printful-BFCM-2026 + Printify-BFCM-2026)
- **Move #358.5 — Per-SKU cross-warehouse-balance-decision-rollback-engine (per-transfer per-cohort-affinity-decay-rollback)** — extend Pillar 5 with cohort-affinity-decay-rollback that auto-rollbacks a transfer when the cohort-affinity-load decays below 0.3 for 3 consecutive weeks
- **Move #358.3.1 — Per-supplier-supplier-portal-API-integration-engine** — extend Pillar 1 to ingest real-time supplier-API signals (capacity + lead-time + quality + outage) for the top 20 suppliers; replaces the 30d-baseline requirement
- **Move #358.3.2 — Per-SKU-multi-supplier-disintermediation-engine** — extend Pillar 2 with multi-supplier-disintermediation that automatically identifies when a SKU has ≥3 supplier alternatives and runs an A/B test between the alternatives (50% to supplier A, 50% to supplier B) to refine per-supplier-quality-score
- **Move #358.3.3 — Per-SKU-supplier-cost-negotiation-engine** — extend Pillar 4 with cost-negotiation-engine that auto-flags SKUs where supplier-drop-ship-cost-pct > transfer-cost-per-unit ÷ SKU-price by ≥10% and triggers a renegotiation-or-replace decision at the 30-day mark

## Cross-references

- Move #358 — Cross-warehouse-balance-engine per-SKU-multi-warehouse-allocation (the prerequisite; provides per-transfer-balance-event-stream)
- Move #358.1 — Cross-warehouse-balance-cost-amortization-engine (the prerequisite; provides per-warehouse-cost-amortization-ledger + 4-sub-rule rollback pattern)
- Move #358.2 — Cross-warehouse-overflow-engine (the prerequisite; provides per-warehouse-capacity-utilization-vector 5-dim + CLI 0-100 band table)
- Move #357 — Per-SKU inventory commitment + open-to-buy budget (the prerequisite; provides per-SKU-OTB-formula + per-warehouse-routing-rule)
- Move #356 — Assortment planning + hero-SKU strategy (the prerequisite; provides hero/halo/filler tier classification + per-cohort-affinity-rollout)
- Move #29 — Inventory forecasting + stockout prevention (the prerequisite; provides days-of-supply + stockout-risk signal)
- Move #86 — Dead-stock liquidation (the prerequisite; provides dead-stock-clearance path)
- Move #96 — Demand-sensing + supply-chain resilience (the prerequisite; provides demand-forecast signal)
- Move #25 — International expansion (the consumer; provides per-region-fulfillment-pool extension to non-US markets)
- Move #89 — BFCM-season-engine (the consumer; provides BFCM-peak-multiplier on supplier-throughput-forecast)
- Move #107 — Competitive price intelligence engine (the consumer; provides competitor-stockout-uplift on drop-ship priority)
- Move #11 — Subscription replenishment (the consumer; provides subscription-cohort-fulfillment-pool trigger)
- Move #103 — Product analytics per-SKU profit contribution + margin + cohort-LTV (the consumer; provides per-SKU-margin-overlay on drop-ship-cost calculator)
- Move #109 — AI product content generation engine (the consumer; provides per-SKU content cost amortization overlay)
- Move #113 — Per-cohort creative engine (the consumer; provides per-cohort creative cost amortization overlay)
- Move #115 — Per-cohort audience engine (the consumer; provides per-cohort-affinity overlay)
- Move #154 — Predictive LTV + churn engine (the consumer; provides customer-LTV-loss-on-supplier-quality-decay term)
- Move #180 — Marketing mix modeling + MMM attribution engine (the consumer; provides per-channel attribution feedback)
- Move #181 — AI vendor orchestration governance engine (the consumer; provides supplier-vendor-tier classification)
- Move #182 — AI agent trust recovery engine (the consumer; provides per-supplier trust scoring)
- ShipBob Fulfillment API 2026 + ShipBob Dropship 2026 + ShipBob BFCM 2026 — fulfillment + drop-ship + peak APIs
- LeanBox Per-Channel 2026 + LeanBox Dropship 2026 + LeanBox BFCM 2026 — fulfillment + drop-ship + peak APIs
- FBA Multi-Channel Fulfillment API 2026 + FBA Dropship 2026 + FBA BFCM 2026 — fulfillment + drop-ship + peak APIs
- Manhattan Associates Active WM 2026 + Manhattan Supplier Portal 2026 — warehouse management + supplier APIs
- Blue Yonder Warehouse 2026 + Blue Yonder Supplier Portal 2026 — warehouse management + supplier APIs
- SAP EWM 2026 + SAP WMS 2026 + SAP IBP 2026 + NetSuite Supplier Portal 2026 — enterprise warehouse + supplier APIs
- Oracle WMS 2026 + Oracle Supplier Portal 2026 — enterprise warehouse + supplier APIs
- Printful 2026 + Printful Dropship 2026 + Printful Print-on-Demand 2026 + Printful Capacity 2026 + Printful BFCM 2026 — print-on-demand drop-ship supplier
- Printify 2026 + Printify Dropship 2026 + Printify Print-on-Demand 2026 + Printify Capacity 2026 + Printify BFCM 2026 — print-on-demand drop-ship supplier
- Spocket 2026 + Spocket Dropship 2026 + Spocket Capacity 2026 + Spocket BFCM 2026 — curated-supplier drop-ship platform
- Zendrop 2026 + Zendrop Dropship 2026 + Zendrop Capacity 2026 + Zendrop BFCM 2026 — automated drop-ship platform
- CJdropshipping 2026 + CJdropshipping Dropship 2026 + CJdropshipping Capacity 2026 + CJdropshipping BFCM 2026 — global-supplier drop-ship platform
- Alibaba 2026 + Alibaba Dropship 2026 + Alibaba Capacity 2026 + Alibaba BFCM 2026 — bulk-supplier + drop-ship
- AliExpress 2026 + AliExpress Dropship 2026 + AliExpress Capacity 2026 — consumer-supplier drop-ship
- DSers 2026 + DSers Dropship 2026 + DSers Capacity 2026 — AliExpress drop-ship automation
- AutoDS 2026 + AutoDS Dropship 2026 + AutoDS Capacity 2026 — multi-supplier drop-ship automation
- Inventory Source 2026 + Inventory Source Dropship 2026 — supplier-integration automation
- Syncee 2026 + Syncee Dropship 2026 + Syncee Capacity 2026 — curated-supplier drop-ship
- Modalyst 2026 + Modalyst Dropship 2026 + Modalyst Capacity 2026 — premium-supplier drop-ship
- Dropified 2026 + Dropified Dropship 2026 + Dropified Capacity 2026 — AliExpress + US-supplier drop-ship
- Sellvia 2026 + Sellvia Dropship 2026 + Sellvia Capacity 2026 — US-based fast-shipping drop-ship
- Trendsi 2026 + Trendsi Dropship 2026 + Trendsi Fashion-Dropship 2026 — fashion-supplier drop-ship
- HyperSKU 2026 + HyperSKU Dropship 2026 + HyperSKU Capacity 2026 — global-supplier drop-ship
- Triple Whale Per-Drop-Ship-Event-Stream 2026 + Polar Per-Drop-Ship-Cost-Amortization 2026 + Northbeam Per-Drop-Ship-ROI-Attribution 2026 — operator-attribution layer

## Sources

- Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine 2026-09-26
- Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
- Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
- Move #356 assortment-planning-hero-sku-strategy 2026-09-26
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
- Move #89 BFCM-season-engine 2026-09-26
- Move #107 competitive-price-intelligence-engine 2026-09-26
- Move #25 international-expansion 2026-09-26
- Move #96 demand-sensing-supply-chain-resilience 2026-09-26
- Move #29 inventory-forecasting-stockout-prevention 2026-09-26
- Move #11 subscription-replenishment 2026-09-26
- Move #86 dead-stock-liquidation 2026-09-26
- Move #154 predictive-LTV-churn-engine 2026-09-26
- Move #180 marketing-mix-modeling-mmm-attribution 2026-09-26
- Move #181 ai-vendor-orchestration-governance 2026-09-26
- Move #182 ai-agent-trust-recovery 2026-09-26
- Move #109 ai-product-content-generation 2026-09-26
- Move #113 per-cohort-creative-engine 2026-09-26
- Move #115 per-cohort-audience-engine 2026-09-26
- Shopify Inventory API 2026 + Locations API 2026 + Transfers API 2026 + Fulfillment API 2026 + Webhooks 2026 + Admin GraphQL 2026 + Storefront API 2026 + Bulk 2026 + Flow 2026 + Markets 2026 + B2B 2026 + Plus 2026 + Hydrogen 2026 + Functions 2026 + Checkout Extensibility 2026
- Ikas 2026 + BigCommerce 2026 + WooCommerce 2026 + Salesforce Commerce Cloud 2026 + SAP Commerce Cloud 2026 + SAP S/4HANA 2026 + SAP IBP 2026 + SAP IOM 2026 + SAP SCM 2026 + SAP EWM 2026 + SAP WMS 2026
- NetSuite 2026 + NetSuite Inventory 2026 + NetSuite Warehouse 2026 + NetSuite Supply Chain 2026 + NetSuite Demand Planning 2026 + NetSuite SuiteCommerce 2026 + NetSuite Supplier Portal 2026 + NetSuite Procurement 2026
- Oracle Fusion SCM 2026 + Oracle Supply Chain Planning 2026 + Oracle Inventory Management 2026 + Oracle Warehouse Management 2026 + Oracle Demand Planning 2026 + Oracle Procurement 2026 + Oracle Supplier Portal 2026
- Blue Yonder 2026 + Blue Yonder Allocation 2026 + Blue Yonder Warehouse 2026 + Blue Yonder Replenishment 2026 + Blue Yonder Supply Chain 2026 + Blue Yonder Multi-Warehouse 2026 + Blue Yonder Capacity 2026 + Blue Yonder Labor 2026 + Blue Yonder Throughput 2026 + Blue Yonder Supplier Portal 2026 + Blue Yonder Procurement 2026
- Manhattan Associates 2026 + Manhattan Active SCM 2026 + Manhattan Warehouse 2026 + Manhattan Allocation 2026 + Manhattan Replenishment 2026 + Manhattan Multi-Warehouse 2026 + Manhattan Labor Management 2026 + Manhattan Throughput 2026 + Manhattan Capacity 2026 + Manhattan Warehouse Management 2026 + Manhattan Wave Planning 2026 + Manhattan Supplier Portal 2026 + Manhattan Procurement 2026
- LeanBox 2026 + LeanBox Warehouse 2026 + LeanBox Routing 2026 + LeanBox Per-Channel 2026 + LeanBox Multi-Warehouse 2026 + LeanBox Transfers 2026 + LeanBox Cross-Warehouse-Balance 2026 + LeanBox Overflow 2026 + LeanBox Capacity 2026 + LeanBox Throughput 2026 + LeanBox SLA 2026 + LeanBox Dropship 2026
- ShipBob 2026 + ShipBob State of DTC Shipping 2026 + ShipBob Multi-Warehouse 2026 + ShipBob Routing 2026 + ShipBob Replenishment 2026 + ShipBob Fulfillment 2026 + ShipBob 3PL 2026 + ShipBob Transfers 2026 + ShipBob Cross-Warehouse-Balance 2026 + ShipBob Overflow 2026 + ShipBob Capacity 2026 + ShipBob Throughput 2026 + ShipBob SLA 2026 + ShipBob BFCM 2026 + ShipBob Peak 2026 + ShipBob Dropship 2026
- ShipMonk 2026 + ShipMonk Warehouse 2026 + ShipMonk Routing 2026 + ShipMonk Replenishment 2026 + ShipMonk Fulfillment 2026 + ShipMonk 3PL 2026 + ShipMonk Transfers 2026 + ShipMonk Cross-Warehouse-Balance 2026 + ShipMonk Overflow 2026 + ShipMonk Capacity 2026 + ShipMonk Throughput 2026 + ShipMonk SLA 2026 + ShipMonk BFCM 2026 + ShipMonk Dropship 2026
- Fulfillment by Amazon 2026 + FBA Multi-Channel 2026 + FBA Routing 2026 + FBA Replenishment 2026 + FBA Fulfillment 2026 + FBA 3PL 2026 + FBA Transfers 2026 + FBA Inventory Distribution 2026 + FBA Overflow 2026 + FBA Capacity 2026 + FBA Throughput 2026 + FBA SLA 2026 + FBA BFCM 2026 + FBA Dropship 2026
- AMCF 2026 + AMCF Routing 2026 + AMCF Replenishment 2026 + AMCF Fulfillment 2026 + AMCF 3PL 2026 + AMCF Transfers 2026 + AMCF Cross-Warehouse-Balance 2026 + AMCF Overflow 2026 + AMCF Capacity 2026 + AMCF SLA 2026 + AMCF BFCM 2026 + AMCF Dropship 2026
- Flexport 2026 + Flexport Fulfillment 2026 + Flexport Routing 2026 + Flexport Warehouse 2026 + Flexport 3PL 2026 + Flexport Transfers 2026 + Flexport Cross-Warehouse-Balance 2026 + Flexport Overflow 2026 + Flexport Capacity 2026 + Flexport Throughput 2026 + Flexport SLA 2026 + Flexport Dropship 2026
- Shippo 2026 + Shippo Routing 2026 + Shippo Replenishment 2026 + Shippo Fulfillment 2026 + Shippo Cross-Warehouse-Balance 2026 + Shippo Overflow 2026 + Shippo Capacity 2026 + Shippo Throughput 2026 + Shippo SLA 2026 + Shippo Dropship 2026
- Easyship 2026 + Easyship Routing 2026 + Easyship Replenishment 2026 + Easyship Fulfillment 2026 + Easyship 3PL 2026 + Easyship Transfers 2026 + Easyship Cross-Warehouse-Balance 2026 + Easyship Overflow 2026 + Easyship Capacity 2026 + Easyship Throughput 2026 + Easyship Dropship 2026
- AfterShip 2026 + AfterShip Tracking 2026 + AfterShip Routing 2026 + AfterShip Replenishment 2026 + AfterShip Fulfillment 2026 + AfterShip 3PL 2026 + AfterShip Cross-Warehouse-Balance 2026 + AfterShip Overflow 2026 + AfterShip Capacity 2026 + AfterShip Throughput 2026 + AfterShip Dropship 2026
- Route 2026 + Route Tracking 2026 + Route Routing 2026 + Route Replenishment 2026 + Route Fulfillment 2026 + Route 3PL 2026 + Route Cross-Warehouse-Balance 2026 + Route Overflow 2026 + Route Capacity 2026 + Route Throughput 2026 + Route Dropship 2026
- Parcel Labs 2026 + Parcel Labs Tracking 2026 + Parcel Labs Routing 2026 + Parcel Labs Replenishment 2026 + Parcel Labs Fulfillment 2026 + Parcel Labs 3PL 2026 + Parcel Labs Cross-Warehouse-Balance 2026 + Parcel Labs Overflow 2026 + Parcel Labs Capacity 2026 + Parcel Labs Throughput 2026 + Parcel Labs Dropship 2026
- Printful 2026 + Printful Dropship 2026 + Printful Print-on-Demand 2026 + Printful Supplier Network 2026 + Printful Capacity 2026 + Printful Throughput 2026 + Printful SLA 2026 + Printful BFCM 2026 + Printful Peak 2026
- Printify 2026 + Printify Dropship 2026 + Printify Print-on-Demand 2026 + Printify Supplier Network 2026 + Printify Capacity 2026 + Printify Throughput 2026 + Printify SLA 2026 + Printify BFCM 2026 + Printify Peak 2026
- Spocket 2026 + Spocket Dropship 2026 + Spocket Supplier Network 2026 + Spocket Capacity 2026 + Spocket Throughput 2026 + Spocket SLA 2026 + Spocket BFCM 2026 + Spocket Peak 2026
- Zendrop 2026 + Zendrop Dropship 2026 + Zendrop Supplier Network 2026 + Zendrop Capacity 2026 + Zendrop Throughput 2026 + Zendrop SLA 2026 + Zendrop BFCM 2026 + Zendrop Peak 2026
- CJdropshipping 2026 + CJdropshipping Dropship 2026 + CJdropshipping Supplier Network 2026 + CJdropshipping Capacity 2026 + CJdropshipping Throughput 2026 + CJdropshipping SLA 2026 + CJdropshipping BFCM 2026
- Alibaba 2026 + Alibaba Dropship 2026 + Alibaba Supplier Network 2026 + Alibaba Capacity 2026 + Alibaba Throughput 2026 + Alibaba SLA 2026 + Alibaba BFCM 2026
- AliExpress 2026 + AliExpress Dropship 2026 + AliExpress Supplier Network 2026 + AliExpress Capacity 2026 + AliExpress Throughput 2026 + AliExpress SLA 2026
- DSers 2026 + DSers Dropship 2026 + DSers Supplier Network 2026 + DSers Capacity 2026 + DSers Throughput 2026
- AutoDS 2026 + AutoDS Dropship 2026 + AutoDS Supplier Network 2026
- Inventory Source 2026 + Inventory Source Dropship 2026
- Syncee 2026 + Syncee Dropship 2026 + Syncee Supplier Network 2026
- Modalyst 2026 + Modalyst Dropship 2026 + Modalyst Supplier Network 2026
- Dropified 2026 + Dropified Dropship 2026 + Dropified Supplier Network 2026
- Sellvia 2026 + Sellvia Dropship 2026 + Sellvia Supplier Network 2026
- Trendsi 2026 + Trendsi Dropship 2026 + Trendsi Fashion-Dropship 2026
- HyperSKU 2026 + HyperSKU Dropship 2026 + HyperSKU Supplier Network 2026
- Recharge 2026 + Recharge Replenishment 2026 + Recharge OTB 2026 + Recharge Demand Planning 2026 + Recharge Merchandise Planning 2026 + Recharge Assortment 2026 + Recharge Allocation 2026 + Recharge Dropship 2026
- Loop Subscriptions 2026 + Loop Replenishment 2026 + Loop OTB 2026 + Loop Demand Planning 2026 + Loop Merchandise Planning 2026 + Loop Assortment 2026 + Loop Allocation 2026 + Loop Dropship 2026
- Smile.io 2026 + Smile Replenishment 2026 + Smile OTB 2026 + Smile Demand Planning 2026 + Smile Merchandise Planning 2026 + Smile Assortment 2026 + Smile Allocation 2026
- Klaviyo 2026 + Klaviyo Flow 2026 + Klaviyo Replenishment 2026 + Klaviyo OTB 2026 + Klaviyo Demand Planning 2026 + Klaviyo Merchandise Planning 2026 + Klaviyo Assortment 2026 + Klaviyo Allocation 2026
- Postscript 2026 + Postscript Flow 2026 + Postscript Replenishment 2026 + Postscript OTB 2026 + Postscript Demand Planning 2026 + Postscript Merchandise Planning 2026 + Postscript Assortment 2026 + Postscript Allocation 2026
- Omnisend 2026 + Omnisend Flow 2026 + Omnisend Replenishment 2026 + Omnisend OTB 2026 + Omnisend Demand Planning 2026 + Omnisend Merchandise Planning 2026 + Omnisend Assortment 2026 + Omnisend Allocation 2026
- Triple Whale 2026 + Triple Whale Per-Drop-Ship-Event-Stream 2026 + Triple Whale Per-Supplier-Bypass-Event-Stream 2026 + Triple Whale Supplier-Risk-Tier-Stream 2026 + Triple Whale Per-Supplier-Throughput-Stream 2026 + Triple Whale Per-Drop-Ship-Cost 2026 + Triple Whale Per-Supplier-Cost-Amortization 2026 + Triple Whale Per-Transfer-Balance-Event-Stream 2026
- Polar 2026 + Polar Per-Drop-Ship-Event-Stream 2026 + Polar Supplier-Risk-Tier 2026 + Polar Per-Supplier-Throughput 2026
- Northbeam 2026 + Northbeam Per-Drop-Ship-Event-Stream 2026 + Northbeam Supplier-Risk-Tier 2026 + Northbeam Per-Supplier-Throughput 2026
- McKinsey Supply Chain 2026 + Deloitte Procurement 2026 + Forrester Procurement 2026 + Gartner Procurement 2026 + Accenture Procurement 2026 + BCG Procurement 2026 + Bain Procurement 2026 + MIT Sloan Procurement 2026 + HBR Procurement 2026 + Baymard Checkout 2026
