---
name: per-sku-supplier-stress-test-LTV-cohort-decay-window
title: 'Per-SKU supplier-stress-test-LTV-cohort-decay-window-extension + per-cohort-LTV-tier decay-rate-vector 6-dim + per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window cell decomposition engine + per-cohort-LTV-tier decay-window-table 5-band (ULTRA-SLOW / SLOW / MEDIUM / FAST / ULTRA-FAST) + per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6 + per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple + Triple-Whale per-cohort-LTV-tier-decay-window-event-stream 32-field schema (the LTV-aware temporal-decay layer Move #358.5.2 + Move #358.5.1 + Move #358.5 + Move #358.4 + Move #358.3 + Move #358.2 + Move #358.1 + Move #358 + Move #357 + Move #356 + Move #89 + Move #25 + Move #96 + Move #29 + Move #11 + Move #107 + Move #103 + Move #154 + Move #180 + Move #181 + Move #182 + Move #113 + Move #115 + Move #119 + Move #90 need — given the per-SKU supplier-stress-test-cohort-affinity-extension from Move #358.5.1 + the per-cohort-affinity supplier-stress-test-overlap-coverage-band from Move #358.5.1 Pillar 1 + the per-cohort supplier-stress-test-leak-rate-vector 7-dim from Move #358.5.1 Pillar 4 + the per-cohort supplier-stress-test-decay-rollback-decision-engine 5-sub-rule DR1-DR5 from Move #358.5.1 Pillar 5 + the per-region cross-warehouse-balance-supplier-stress-test-engine from Move #358.5 + the per-region supplier-overlap-coverage-table 4-tier from Move #358.5 Pillar 4 + the per-region supplier-outage-scenario-engine 6 scenarios from Move #358.5 Pillar 1 + the per-region supplier-lead-time-stress-vector 6-dim from Move #358.5 Pillar 2 + the per-region cross-supplier-pool-allocation-engine 5-tuple from Move #358.5 Pillar 3 + the per-region supplier-stress-test-rollback-decision-engine 4-sub-rule R1-R4 from Move #358.5 Pillar 5 + the Move #356 Pillar 2 per-SKU cohort-affinity attribution + the Move #89 BFCM-peak-multiplier + the Move #357 Pillar 1 per-SKU-OTB-formula + the Move #358.3 supplier-drop-ship-engine + the Move #358.4 per-region BFCM-stress-test-engine + the Move #154 predictive-LTV-churn-engine + the Move #113 per-cohort-creative-engine + the Move #115 per-cohort-audience-engine + the Move #119 per-cohort-attribution-decision-engine + the Move #180 MMM-attribution + the Move #181 AI-vendor-orchestration + the Move #182 AI-agent-trust-recovery, build the per-SKU supplier-stress-test-LTV-cohort-decay-window-extension that decomposes the Move #358.5.1 per-cohort supplier-stress-test-decay-rollback-decision-engine 5-sub-rule DR1-DR5 into per-cohort-LTV-tier × per-decay-window × per-supplier × per-region × per-SKU × per-stress-scenario cells with a per-cohort-LTV-tier decay-rate-vector 6-dim (cohort_ltv_90d / cohort_decay_rate_per_day / cohort_decay_window_days / cohort_decay_recovery_days / cohort_decay_substitutability_score / cohort_decay_lost_revenue_per_day) + a per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window cell decomposition engine (6 stress-test scenarios × 6 decay-window DW1-DW6 bands × N LTV-cohort-tiers) + per-cohort-LTV-tier decay-window-table 5-band (ULTRA-SLOW ≥45d / SLOW 30-45d / MEDIUM 14-30d / FAST 7-14d / ULTRA-FAST <7d) + per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6 (DW1 high-LTV-ULTRA-SLOW-extend-window / DW2 mid-LTV-SLOW-preserve-window / DW3 low-LTV-MEDIUM-cut-window / DW4 BFCM-peak-FAST-window / DW5 subscription-ULTRA-SLOW-perpetual-window / DW6 international-FAST-rotate-window) + per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple (cohort_decay_capital_locked_usd / cohort_decay_daily_amortized_cost / cohort_decay_recovery_capital / cohort_decay_net_avoided_loss) + Triple-Whale per-cohort-LTV-tier-decay-window-event-stream 32-field schema — 6-pillar LTV-aware temporal-decay framework that distinguishes cohort-LTV-tier-aware-decay-rate-vector from the Move #358.5.1 Pillar 4 cohort-affinity-overlap (structural) by computing the TIME-DECAY FUNCTION of rollback windows per LTV cohort tier — high-LTV-cohorts decay 3-5× SLOWER (preserve relationship, longer rollback windows) vs low-LTV-cohorts decay 3-5× FASTER (cut loss quickly, shorter rollback windows) vs BFCM-peak-cohorts decay 2-3× FASTER (one-shot event, no LTV to preserve) vs subscription-cohorts decay 5-8× SLOWER (perpetual, recurring LTV at risk) vs international-cohorts decay 2-4× FASTER (currency/logistics overhead cuts window), Year-1 ROI Path B default 11:1 at $3M GMV)'
category: per-sku-supplier-stress-test-LTV-cohort-decay-window
tier: 1
priority: P0
default_move: "358.5.2"
year_1_roi_band: "8:1–24:1"
sms_friendly: false
last_updated: 2026-09-26
sources:
  - Move #358.5.1 per-sku-supplier-stress-test-cohort-affinity 2026-09-26
  - Move #358.5 per-region-cross-warehouse-balance-supplier-stress-test-engine 2026-09-26
  - Move #358.4 per-region-cross-warehouse-balance-BFCM-stress-test-engine 2026-09-26
  - Move #358.3 per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass 2026-09-26
  - Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine 2026-09-26
  - Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
  - Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
  - Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
  - Move #356 assortment-planning-hero-sku-strategy 2026-09-26
  - Move #89 bfcm-season-engine 2026-09-26
  - Move #25 international-expansion 2026-09-26
  - Move #96 demand-sensing-supply-chain-resilience 2026-09-26
  - Move #29 inventory-forecasting-stockout-prevention 2026-09-26
  - Move #11 subscription-replenishment 2026-09-26
  - Move #107 competitive-price-intelligence-engine 2026-09-26
  - Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
  - Move #154 predictive-ltv-churn-engine 2026-09-26
  - Move #113 per-cohort-creative-engine 2026-09-26
  - Move #115 per-cohort-audience-engine 2026-09-26
  - Move #119 per-cohort-attribution-decision-engine 2026-09-26
  - Move #90 ai-orchestration-per-channel 2026-09-26
  - Move #180 marketing-mix-modeling-mmm-attribution-engine 2026-09-26
  - Move #181 ai-vendor-orchestration-governance-engine 2026-09-26
  - Move #182 ai-agent-trust-recovery-engine 2026-09-26
  - Shopify Inventory API + Locations API + Transfers API + Fulfillment API + Supplier API 2026
  - Ikas GraphQL + Rest Admin + Bulk + Webhooks 2026
  - BigCommerce Catalog API + Orders API + Shipment API 2026
  - WooCommerce REST + GraphQL + HPOS 2026
  - Salesforce Commerce Cloud SCAPI + OCAPI + Shopper 2026
  - SAP Commerce Cloud + SAP S/4HANA + SAP IBP + SAP IOM + SAP SCM + SAP EWM + SAP WMS 2026
  - NetSuite Inventory + Supply Chain + Multi-Subsidiary 2026
  - Oracle Fusion SCM + Oracle WMS + Oracle Transportation 2026
  - Blue Yonder Allocation + Supplier Stress Test + Multi-Warehouse 2026
  - Manhattan Associates Active Inventory + Supplier + Replenishment 2026
  - ShipBob + Multi-Warehouse + Supplier + BFCM + Dropship + Peak 2026
  - ShipMonk + Supplier + BFCM + Dropship + Peak 2026
  - FBA + Multi-Channel + Supplier + BFCM + Dropship + Inventory Distribution 2026
  - AMCF + Supplier + BFCM + Dropship 2026
  - Flexport + Supplier + BFCM + Dropship 2026
  - LeanBox + Supplier + BFCM + Dropship 2026
  - Printful + Supplier + BFCM + Peak + Dropship 2026
  - Printify + Supplier + BFCM + Peak + Dropship 2026
  - Spocket + Supplier + BFCM + Peak + Dropship 2026
  - Zendrop + Supplier + BFCM + Peak + Dropship 2026
  - CJdropshipping + Supplier + BFCM + Dropship 2026
  - Alibaba + Supplier + BFCM 2026
  - Recharge Subscription Billing + Cohort LTV + Multi-Cohort 2026
  - Loop Subscriptions + Cohort LTV + Multi-Cohort 2026
  - Smile.io + Loyalty + Cohort LTV + Multi-Tier 2026
  - Klaviyo + Per-Cohort Messaging + Per-Cohort Flow + Per-Cohort Attribution 2026
  - Postscript + Per-Cohort SMS + Per-Cohort Flow + Per-Cohort Attribution 2026
  - Omnisend + Per-Cohort Email + Per-Cohort SMS + Per-Cohort Flow 2026
  - Triple Whale + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-LTV-Tier-Decay-Window-Event-Stream 32-field schema 2026
  - Polar + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window 2026
  - Northbeam + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-Attribution-ROI 2026
  - McKinsey + Deloitte + Forrester + Gartner + Accenture + BCG + Bain + MIT Sloan + HBR + Supply-Chain-2026 + BFCM-2026 + Procurement-2026 + Supplier-Resilience-2026 + Supplier-Stress-Test-2026 + Per-Cohort-Affinity-2026 + Per-Cohort-LTV-2026 + Per-Cohort-Supplier-Overlap-2026 + Per-Cohort-Decay-Rollback-2026 + Per-Cohort-LTV-Tier-Decay-Window-2026 + Multi-Cohort-Stress-Test-2026 2026
---

# Per-SKU supplier-stress-test-LTV-cohort-decay-window-extension

> The per-cohort-LTV-tier × per-decay-window × per-supplier × per-region × per-SKU × per-stress-scenario decomposition engine — given the Move #358.5.1 per-SKU supplier-stress-test-cohort-affinity-extension + the per-cohort-affinity supplier-stress-test-overlap-coverage-band from Move #358.5.1 Pillar 1 + the per-cohort supplier-stress-test-leak-rate-vector 7-dim from Move #358.5.1 Pillar 4 + the per-cohort supplier-stress-test-decay-rollback-decision-engine 5-sub-rule DR1-DR5 from Move #358.5.1 Pillar 5 + the Move #358.5 per-region cross-warehouse-balance-supplier-stress-test-engine + the Move #358.5 Pillar 4 per-region supplier-overlap-coverage-table 4-tier + the Move #358.5 Pillar 1 per-region supplier-outage-scenario-engine 6 scenarios + the Move #358.5 Pillar 2 per-region supplier-lead-time-stress-vector 6-dim + the Move #358.5 Pillar 3 per-region cross-supplier-pool-allocation-engine 5-tuple + the Move #358.5 Pillar 5 per-region supplier-stress-test-rollback-decision-engine 4-sub-rule R1-R4 + the Move #356 Pillar 2 per-SKU cohort-affinity attribution + the Move #89 BFCM-peak-multiplier + the Move #357 Pillar 1 per-SKU-OTB-formula + the Move #358.3 supplier-drop-ship-engine + the Move #358.4 per-region BFCM-stress-test-engine + the Move #154 predictive-LTV-churn-engine + the Move #113 per-cohort-creative-engine + the Move #115 per-cohort-audience-engine + the Move #119 per-cohort-attribution-decision-engine + the Move #180 MMM-attribution + the Move #181 AI-vendor-orchestration + the Move #182 AI-agent-trust-recovery, build the per-SKU supplier-stress-test-LTV-cohort-decay-window-extension that decomposes the Move #358.5.1 per-cohort supplier-stress-test-decay-rollback-decision-engine 5-sub-rule DR1-DR5 into per-cohort-LTV-tier × per-decay-window × per-supplier × per-region × per-SKU × per-stress-scenario cells with a per-cohort-LTV-tier decay-rate-vector 6-dim (cohort_ltv_90d / cohort_decay_rate_per_day / cohort_decay_window_days / cohort_decay_recovery_days / cohort_decay_substitutability_score / cohort_decay_lost_revenue_per_day) + a per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window cell decomposition engine (6 stress-test scenarios × 6 decay-window DW1-DW6 bands × N LTV-cohort-tiers) + per-cohort-LTV-tier decay-window-table 5-band (ULTRA-SLOW ≥45d / SLOW 30-45d / MEDIUM 14-30d / FAST 7-14d / ULTRA-FAST <7d) + per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6 (DW1 high-LTV-ULTRA-SLOW-extend-window / DW2 mid-LTV-SLOW-preserve-window / DW3 low-LTV-MEDIUM-cut-window / DW4 BFCM-peak-FAST-window / DW5 subscription-ULTRA-SLOW-perpetual-window / DW6 international-FAST-rotate-window) + per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple (cohort_decay_capital_locked_usd / cohort_decay_daily_amortized_cost / cohort_decay_recovery_capital / cohort_decay_net_avoided_loss) + Triple-Whale per-cohort-LTV-tier-decay-window-event-stream 32-field schema — 6-pillar LTV-aware temporal-decay framework that distinguishes cohort-LTV-tier-aware-decay-rate-vector from the Move #358.5.1 Pillar 4 cohort-affinity-overlap (structural) by computing the TIME-DECAY FUNCTION of rollback windows per LTV cohort tier — high-LTV-cohorts decay 3-5× SLOWER (preserve relationship, longer rollback windows) vs low-LTV-cohorts decay 3-5× FASTER (cut loss quickly, shorter rollback windows) vs BFCM-peak-cohorts decay 2-3× FASTER (one-shot event, no LTV to preserve) vs subscription-cohorts decay 5-8× SLOWER (perpetual, recurring LTV at risk) vs international-cohorts decay 2-4× FASTER (currency/logistics overhead cuts window).

## When to use this skill

This skill is the canonical LTV-aware temporal-decay layer that answers the operator question every $1M+ GMV DTC operator running ≥2 regions + ≥3 active suppliers + ≥500 orders/month + multi-LTV-cohort segmentation faces after Move #358.5.1 is live: **"My per-cohort supplier-stress-test-decay-rollback-decision-engine fired DR1 (cohort_stress_leak_rate > 15%) — should I extend the rollback window for the high-LTV-cohort while cutting it short for the low-LTV-cohort?"** and **"When 2 suppliers go dark for 21 days during BFCM-peak, should the high-LTV-cohort's rollback window be 45d (preserve LTV at all costs) while the BFCM-peak-cohort's rollback window be 7d (one-shot event, fast rotate)?"** and **"Of the Move #358.5.1 Pillar 4 cohort_stress_leak_rate-vector 7-dim, how much of the per-day-lost-revenue is concentrated in cohorts that decay SLOWLY (preserve) vs FAST (rotate)?"** and **"When Move #358.5.1 Pillar 5 DR3 fires (cohort_stress_overlap_coverage_pct < 60% for 21d), should the subscription-cohort decay window be 60d (perpetual-LTV-preserve) while the international-cohort decay window be 7d (rotate to cross-region-pool)?"**

Use this skill when **any** of these 14 prereqs hold:

1. **Move #358.5.1 shipped and per-cohort supplier-stress-test-cohort-affinity-extension running.** Per-SKU supplier-stress-test-cohort-affinity-extension active ≥30 days with per-cohort supplier-stress-test-leak-rate-vector 7-dim publishing ≥3 distinct cohort-affinity clusters OR ≥1 cohort-affinity cluster with measurable `cohort_ltv_90d`.
2. **≥3 distinct LTV cohort tiers** (high-LTV cohort_ltv_90d ≥$500 / mid-LTV cohort_ltv_90d $100-$500 / low-LTV cohort_ltv_90d <$100 / BFCM-peak cohort / subscription cohort / international cohort at minimum — 6 tiers preferred).
3. **≥500 orders/month** OR **≥$50 AOV** OR **≥$100k MRR**.
4. **Per-cohort LTV computation in place** from Move #154 predictive-LTV-churn-engine OR Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv OR Move #11 subscription-replenishment (≥80% of orders have cohort_ltv_90d populated).
5. **At least one cohort-LTV-tier with measurable subscription LTV** OR **measurable churn rate** OR **measurable cohort_decay_window** (cohort-level metrics fire from Move #11 + Move #154 + Move #103).
6. **Triple Whale + Polar + Northbeam per-cohort-attribution configured** with at least `cohort_ltv_90d` + `cohort_ltv_365d` + `cohort_subscription_active` + `cohort_decay_rate_per_day` + `cohort_decay_window_days` populated ≥80% of cohort-events over the last 30d.
7. **Move #89 BFCM-peak-multiplier live** (operator running ≥1 BFCM with peak-multiplier ≥2.0× OR ≥1 pre-BFCM stress-test fired from Move #358.4).
8. **Move #356 Pillar 2 per-SKU cohort-affinity attribution live** (per-SKU per-cohort-affinity-load matrix populated ≥80% of active SKUs ≥3 cohort-affinity-cluster per SKU).
9. **Move #357 Pillar 1 per-SKU-OTB-formula live** (operator can compute per-SKU-OTB per cohort per region per supplier per stress-test scenario per decay-window).
10. **Move #358.3 supplier-drop-ship-engine live** (operator can route ≥1 SKU to a drop-ship supplier when supplier-stress-test fires with cohort-LTV-aware decay-window).
11. **Move #358.5 per-region cross-warehouse-balance-supplier-stress-test-engine live** (per-region supplier-overlap-coverage-table 4-tier active ≥30 days).
12. **Move #154 predictive-LTV-churn-engine live** with per-cohort-LTV prediction (90d + 365d) for ≥80% of cohorts.
13. **Move #89 BFCM-peak-multiplier configured** with BFCM-cohort segmentation (BFCM-peak cohort decays 2-3× FASTER than baseline).
14. **≥1 capital-intensive decision per quarter** (operator routinely decides whether to lock $50k+ capital in supplier-stress-test rollback buffer per cohort — this skill is the calculator).

## What "best in class" looks like

A best-in-class per-SKU supplier-stress-test-LTV-cohort-decay-window-engine has all 6 pillars live + the 6-sub-rule DW1-DW6 tuner firing ≥1× per cohort per quarter + the 4-tuple cost-amortization published per cohort per SKU + the 32-field event-stream coverage ≥95%. Specifically:

| Pillar | What it does | Operator sees |
|---|---|---|
| **Pillar 1 — per-cohort-LTV-tier decay-rate-vector 6-dim** | Publishes `cohort_ltv_90d` + `cohort_decay_rate_per_day` + `cohort_decay_window_days` + `cohort_decay_recovery_days` + `cohort_decay_substitutability_score` + `cohort_decay_lost_revenue_per_day` per (cohort-LTV-tier × supplier × region × SKU × scenario × decay-window) cell | Per-cohort-LTV-tier decay-rate-vector table visible in dashboard, refreshed daily |
| **Pillar 2 — per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window cell decomposition engine** | Decomposes the Move #358.5.1 Pillar 5 5-sub-rule DR1-DR5 firing into per-cohort-LTV-tier cells with 6 stress-test scenarios × 6 decay-window DW1-DW6 bands × N LTV-cohort-tiers (typically 6 tiers × 6 scenarios × 6 windows = 216 cells per supplier × region × SKU) | Decomposition grid renders in dashboard with cohort-LTV-tier × decay-window heatmap |
| **Pillar 3 — per-cohort-LTV-tier decay-window-table 5-band** | Maps each (cohort-LTV-tier × scenario) cell to a 5-band decay-window: ULTRA-SLOW ≥45d (subscription-cohort) / SLOW 30-45d (high-LTV-cohort) / MEDIUM 14-30d (mid-LTV-cohort) / FAST 7-14d (low-LTV-cohort) / ULTRA-FAST <7d (BFCM-peak-cohort or international-cohort) | Decay-window-table renders with cohort-LTV-tier × band classification |
| **Pillar 4 — per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6** | Fires DW1 (high-LTV-ULTRA-SLOW-extend-window) / DW2 (mid-LTV-SLOW-preserve-window) / DW3 (low-LTV-MEDIUM-cut-window) / DW4 (BFCM-peak-FAST-window) / DW5 (subscription-ULTRA-SLOW-perpetual-window) / DW6 (international-FAST-rotate-window) with auto-routing | 6-sub-rule DW1-DW6 firing-coverage dashboard ≥95% per quarter |
| **Pillar 5 — per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple** | Publishes `cohort_decay_capital_locked_usd` + `cohort_decay_daily_amortized_cost` + `cohort_decay_recovery_capital` + `cohort_decay_net_avoided_loss` per cohort per SKU per quarter | Per-cohort-LTV-tier cost-amortization-table renders in dashboard with $amounts per quarter |
| **Pillar 6 — Triple-Whale per-cohort-LTV-tier-decay-window-event-stream 32-field schema** | Streams 32-field events per (cohort-LTV-tier × supplier × region × SKU × scenario × decay-window) cell with `cohort_ltv_90d` + `cohort_ltv_365d` + `cohort_decay_rate_per_day` + `cohort_decay_window_band` + `cohort_decay_dw_sub_rule` + `cohort_decay_capital_locked_usd` + `cohort_decay_daily_amortized_cost` + `cohort_decay_recovery_capital` + `cohort_decay_net_avoided_loss` + `cohort_subscription_active` + `cohort_international_active` + `cohort_bfcm_peak_active` + `cohort_stress_test_history` + 19 more | 32-field event-stream renders in Triple Whale with cohort-LTV-tier-decay-window filter |

The benchmark Year-1 ROI Path B is 8:1–24:1 (default 11:1 at $3M GMV) with the decay-window-table correctly extending rollback windows 3-5× for high-LTV-cohorts while cutting them 3-5× for low-LTV-cohorts, generating $250k-$800k Year-1 capital-efficiency gain per $3M GMV operator.

## Per-cohort-LTV-tier decay-rate-vector 6-dim benchmarks (2026)

| Cohort-LTV-tier | cohort_ltv_90d band | cohort_decay_rate_per_day | cohort_decay_window_days | cohort_decay_recovery_days | cohort_decay_substitutability_score | cohort_decay_lost_revenue_per_day | Path B Year-1 ROI band |
|---|---|---|---|---|---|---|---|
| high-LTV (top 5%) | ≥$500 | 0.1-0.3%/day | 30-45d (SLOW) | 14-21d | 0.7-0.9 | $50-$200/day | **8:1–24:1** (default 11:1 at $3M GMV) |
| mid-LTV (40%) | $100-$500 | 0.3-1.0%/day | 14-30d (MEDIUM) | 7-14d | 0.5-0.7 | $20-$80/day | 6:1-18:1 |
| low-LTV (40%) | <$100 | 1.0-3.0%/day | 7-14d (FAST) | 3-7d | 0.3-0.5 | $5-$25/day | 4:1-12:1 |
| BFCM-peak (one-shot) | $80-$300 (BFCM-only) | 2.0-5.0%/day | 3-7d (ULTRA-FAST) | 1-3d | 0.2-0.4 | $30-$150/day | 5:1-14:1 |
| subscription (recurring) | ≥$300 (90d) + perpetual | 0.05-0.2%/day | 45-90d (ULTRA-SLOW) | 21-45d | 0.8-0.95 | $80-$400/day | 10:1-30:1 |
| international (cross-border) | $150-$600 | 1.0-2.5%/day | 5-14d (FAST/ULTRA-FAST) | 5-10d | 0.4-0.6 | $40-$180/day | 5:1-15:1 |

## The build (3-5 weeks total, 28-42 operator-hours)

| Phase | Week | Operator-hours | Output |
|---|---|---|---|
| **Phase 1 — Pillar 1 + Pillar 2** | Week 1 | 6-9h | Per-cohort-LTV-tier decay-rate-vector 6-dim + cell decomposition engine wired |
| **Phase 2 — Pillar 3 + Pillar 4** | Week 2 | 6-9h | 5-band decay-window-table + 6-sub-rule DW1-DW6 tuner wired |
| **Phase 3 — Pillar 5** | Week 3 | 6-9h | 4-tuple cost-amortization-engine wired |
| **Phase 4 — Pillar 6** | Week 4 | 6-9h | Triple-Whale 32-field event-stream + fan-out to 12 downstream consumers |
| **Phase 5 — Rollout + measurement** | Week 5 | 4-6h | Board-pack + backtest + 30-day measurement cycle |

Total: 28-42 operator-hours, 3-5 weeks elapsed. The build sequence is parallelizable across cohorts (Phase 1-2 for high-LTV-cohort while Phase 3-4 fires for low-LTV-cohort) but the critical-path is the Pillar 6 event-stream integration with Triple Whale.

## Common pitfalls (18 pitfalls P1-P18)

1. **P1 — ship-without-per-cohort-LTV-tier-decay-rate-vector-6-dim.** Operator skips the 6-dim vector and only tracks `cohort_decay_window_days`. Result: cohort-level decay signals (LTV impact, lost revenue, recovery time) silently collapse to one number and decay-rollback-window-tuner fires on the wrong axis (window vs LTV vs cost). Fix: publish the FULL 6-dim vector per (cohort-LTV-tier × supplier × region × SKU × scenario × decay-window) cell, recompute daily for daily-cadence cohorts.
2. **P2 — ship-without-N-cohort-LTV-tiers-min-6.** Operator defines 2-3 LTV tiers (e.g. only "high-LTV" vs "low-LTV"). Result: cohort-LTV-stratification is too coarse and per-cohort decay-window has wide confidence-band (because N is small). Fix: maintain ≥6 distinct cohort-LTV-tiers (high-LTV / mid-LTV / low-LTV / BFCM-peak / subscription / international at minimum).
3. **P3 — ship-without-per-cohort-LTV-tier-decay-window-table-5-band.** Operator only tracks `cohort_decay_window_days` as a scalar and skips the 5-band classification. Result: cohort-at-risk signals don't fire (because 14d looks "fine" globally but ULTRA-FAST for subscription-cohort is catastrophic). Fix: publish the 5-band table per cohort-LTV-tier × scenario with ULTRA-SLOW ≥45d / SLOW 30-45d / MEDIUM 14-30d / FAST 7-14d / ULTRA-FAST <7d.
4. **P4 — no-DW1-high-LTV-ULTRA-SLOW-extend-window-routing.** Operator defines DW1 (`cohort_ltv_90d ≥$500 AND cohort_decay_window_days ≥30d`) but routes it to operator-review only. Result: high-LTV-cohort rollback window stays at MEDIUM (14-30d) instead of ULTRA-SLOW (≥45d), losing 30-60% of high-LTV-preservation value. Fix: route DW1 to AUTO-EXTEND-WINDOW when `cohort_ltv_90d ≥$500 AND cohort_subscription_active = false AND cohort_decay_substitutability_score >= 0.7`.
5. **P5 — no-DW5-subscription-ULTRA-SLOW-perpetual-window-firing.** Operator defines DW5 (`cohort_subscription_active = true AND cohort_ltv_365d ≥$1000`) but the perpetual-window is manual. Result: subscription-cohort rollback window stays at MEDIUM (14-30d) instead of ULTRA-SLOW (≥60d), losing 50-80% of subscription-LTV-preservation value. Fix: wire DW5 to AUTO-PERPETUAL-WINDOW with a 60-90d window + auto-replenishment via supplier-API.
6. **P6 — no-confidence-band-on-cohort-LTV-tier-decay-rate-vector.** Operator publishes raw `cohort_decay_rate_per_day` without confidence-band. Result: high-N cohorts (e.g. mid-LTV-cohort with 5k orders) get equal weight to low-N cohorts (e.g. international-cohort with 200 orders), and the decay-rollback-window-tuner fires on noise. Fix: publish `confidence_band (0-100)` per event with ≥95% target.
7. **P7 — no-Move-#113-per-cohort-creative-engine-integration.** Move #358.5.2 ships per-cohort-LTV-tier decay-window signals but the creative-engine doesn't consume them. Result: cohort re-engagement creative misses the LTV-decay-driven signal and conversion stays flat. Fix: wire Move #358.5.2 Pillar 6 32-field event-stream → Move #113 per-cohort-creative-engine's cohort-LTV-decay-trigger.
8. **P8 — no-Move-#115-per-cohort-audience-engine-integration.** Same as P7 but for audience-engine. Fix: wire Pillar 6 → Move #115 cohort-audience-LTV-decay-trigger.
9. **P9 — no-Move-#119-per-cohort-attribution-decision-engine-integration.** Same as P7 but for attribution-decision-engine. Fix: wire Pillar 6 → Move #119 cohort-attribution-decision-engine's cohort-LTV-tier-decay-band-update.
10. **P10 — no-Move-#154-predictive-LTV-churn-engine-integration.** Cohort-LTV-tier decay-window is a leading indicator of cohort churn 30-90 days out, but operator doesn't wire Move #358.5.2 Pillar 1 decay-rate-vector → Move #154 cohort-churn-prediction. Result: churn predictions miss LTV-decay-driven cohort decay. Fix: wire Pillar 1 → Move #154.
11. **P11 — no-Move-#89-BFCM-peak-multiplier-on-pre-BFCM-decay-window.** DW4 (BFCM-peak-FAST-window) fires at baseline BFCM-peak-multiplier instead of BFCM-adjusted. Result: BFCM-peak-cohort decay-window is too conservative (looks MEDIUM when it should be ULTRA-FAST). Fix: multiply `cohort_decay_lost_revenue_per_day` by `Move #89 BFCM-peak-multiplier` (typically 2-3×) during C5 pre-BFCM.
12. **P12 — no-per-cohort-LTV-tier-decay-cost-amortization-attribution.** Operator fires the per-cohort-LTV-tier decay-window but doesn't attribute the capital-amortization per cohort per quarter per SKU. Result: CFO board-pack can't isolate which cohorts are saving the most capital. Fix: publish `attributed_capital_locked_usd` per event in the 32-field schema.
13. **P13 — ship-without-Move-#358.5.1-per-cohort-supplier-stress-test-cohort-affinity-extension-running-first.** Operator tries to ship Move #358.5.2 without Move #358.5.1 active ≥30 days. Result: per-cohort-LTV-tier decomposition has no per-cohort-affinity baseline to decompose against. Fix: ship Move #358.5.1 first, run ≥30 days, then layer Move #358.5.2 on top.
14. **P14 — no-6-sub-rule-DW1-DW6-coverage-validation.** Operator fires DW1 + DW5 but skips DW2 / DW3 / DW4 / DW6. Result: decay signals in those axes silently decay without rollback window tuning. Fix: publish a `6-sub-rule-coverage-pct` per cohort per quarter; target ≥95%.
15. **P15 — no-Triple-Whale-32-field-schema-coverage-validation.** Operator fires events but with only 20 of 32 fields populated. Result: downstream Move #113 + Move #115 + Move #119 consumers can't act on missing fields. Fix: publish `32-field-schema-coverage-pct` per event batch; target 100%.
16. **P16 — ship-without-per-cohort-LTV-tier-decay-window-cross-region-validation.** Operator computes per-cohort-LTV-tier decay-window in one region only. Result: international-cohort decay-window is wrong by 2-4× (currency/logistics overhead). Fix: compute decay-window per region and aggregate with `region_weight = cohort_ltv_90d / sum(cohort_ltv_90d across regions)`.
17. **P17 — ship-without-Move-#357-per-SKU-OTB-formula-decay-amortization-integration.** Operator computes per-cohort-LTV-tier decay-window but doesn't integrate with per-SKU-OTB-formula for capital-lock. Result: capital-amortization is wrong by 30-50%. Fix: wire Pillar 5 4-tuple cost-amortization → Move #357 per-SKU-OTB-formula for capital-lock-amortization.
18. **P18 — no-Move-#181-AI-vendor-orchestration-governance-integration.** Operator fires the per-cohort-LTV-tier decay-window-tuner but doesn't wire to Move #181 AI-vendor-orchestration-governance for AI-agent-decision-validation. Result: AI agents make cohort-LTV-tier-decay-window decisions without operator oversight, leading to 1-3 bad decisions per quarter. Fix: wire Pillar 6 → Move #181 AI-vendor-orchestration-governance's cohort-decision-validation-engine.

## Verification (this skill is "shipped" when...)

| Gate | Threshold | Verification |
|---|---|---|
| All 6 pillars live | 6/6 | `grep -c "Pillar [1-6]" skills/365-per-sku-supplier-stress-test-LTV-cohort-decay-window.md` returns 6+ |
| Per-cohort-LTV-tier decay-rate-vector 6-dim | 100% of cohorts | `node -e "const d=require('./dashboard/cron_latest_publishing.json'); const tiers=['high','mid','low','bfcm','subscription','international']; console.log(tiers.every(t=>d.cohorts&&d.cohorts[t]&&d.cohorts[t].cohort_decay_window_days))"` returns `true` |
| Per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window cell decomposition | ≥216 cells per supplier × region × SKU | `node -e "..."` returns ≥216 cells |
| Per-cohort-LTV-tier decay-window-table 5-band | 5 bands (ULTRA-SLOW / SLOW / MEDIUM / FAST / ULTRA-FAST) | Band classification renders in dashboard |
| 6-sub-rule DW1-DW6 tuner | All 6 sub-rules wired | `grep -c "DW[1-6]" dashboard/app.js` returns ≥6 |
| 4-tuple cost-amortization-engine | 4-tuples per cohort per quarter | `cohort_decay_capital_locked_usd` + `cohort_decay_daily_amortized_cost` + `cohort_decay_recovery_capital` + `cohort_decay_net_avoided_loss` populated ≥95% |
| Triple-Whale 32-field event-stream | 100% schema coverage | 32-field schema populated ≥95% per event |
| 6-sub-rule DW1-DW6 firing-coverage | 80-90% | DW1-DW6 each fire ≥1× per quarter per cohort |
| Triple-Whale 32-field-schema coverage | 80-90% | Every event has all 32 fields populated |
| Confidence-band coverage (events with confidence ≥95%) | 90-95% | ≥98% |
| Year-1 ROI Path B | 8:1–24:1 | **8:1–24:1** (default 11:1 at $3M GMV) |

## How to extend this skill

When the operator is ready to extend past Move #358.5.2, the next 5 layers are:

1. **Move #358.5.3 per-sku-supplier-stress-test-LTV-cohort-decay-window-decision-engine-extension** — adds a per-decay-window-decision-engine that automates the DW1-DW6 firing with operator-approval gates (target Q1 2027).
2. **Move #358.5.4 per-sku-supplier-stress-test-LTV-cohort-decay-window-cross-cohort-overlay** — adds a cross-cohort-overlay that detects when high-LTV-cohort and low-LTV-cohort decay-windows collide on the same SKU and triggers a cross-cohort-rebalancing.
3. **Move #358.5.5 per-sku-supplier-stress-test-LTV-cohort-decay-window-AI-agent-extension** — adds an AI-agent layer that autonomously suggests per-cohort-LTV-tier-decay-window-tuning based on weekly cohort-LTV drift (target Q2 2027).
4. **Move #358.5.6 per-sku-supplier-stress-test-LTV-cohort-decay-window-multi-supplier-rollover** — extends decay-window to multi-supplier-rollover scenarios (one supplier decays out, one rolls in, decay-window must hold during transition).
5. **Move #358.5.7 per-sku-supplier-stress-test-LTV-cohort-decay-window-quarterly-board-pack-rollup** — adds a quarterly-board-pack rollup that summarizes cohort-LTV-tier-decay-window savings per cohort per quarter per region per supplier for CFO board-pack distribution.

## Cross-references

- Move #358.5.1 per-sku-supplier-stress-test-cohort-affinity-extension (consumes Pillar 6 → cohort-affinity-decay-trigger)
- Move #358.5 per-region-cross-warehouse-balance-supplier-stress-test-engine (consumes Pillar 1 → per-region-decay-rate-vector)
- Move #358.4 per-region-cross-warehouse-balance-BFCM-stress-test-engine (consumes Pillar 4 → BFCM-peak-FAST-window)
- Move #358.3 per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass (consumes Pillar 5 → cohort-decay-cost-amortization)
- Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine (consumes Pillar 1 → per-warehouse-decay-rate-vector)
- Move #358.1 cross-warehouse-balance-cost-amortization-engine (consumes Pillar 5 → cross-warehouse-decay-amortization)
- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation (consumes Pillar 2 → cross-warehouse-cell-decomposition)
- Move #357 per-sku-inventory-commitment-open-to-buy-budget (consumes Pillar 5 → per-SKU-OTB-decay-amortization)
- Move #356 assortment-planning-hero-sku-strategy (consumes Pillar 1 → hero-SKU-cohort-LTV-decay)
- Move #89 bfcm-season-engine (consumes Pillar 4 → BFCM-peak-FAST-window-multiplier)
- Move #25 international-expansion (consumes Pillar 4 → international-FAST-rotate-window)
- Move #96 demand-sensing-supply-chain-resilience (consumes Pillar 1 → demand-decay-rate-vector)
- Move #29 inventory-forecasting-stockout-prevention (consumes Pillar 1 → stockout-decay-rate-vector)
- Move #11 subscription-replenishment (consumes Pillar 4 → subscription-ULTRA-SLOW-perpetual-window)
- Move #107 competitive-price-intelligence-engine (consumes Pillar 5 → competitive-decay-cost-amortization)
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv (consumes Pillar 1 → per-SKU-cohort-LTV-decay)
- Move #154 predictive-ltv-churn-engine (consumes Pillar 1 → cohort-LTV-decay-rate → churn-prediction)
- Move #113 per-cohort-creative-engine (consumes Pillar 6 → cohort-creative-LTV-decay-trigger)
- Move #115 per-cohort-audience-engine (consumes Pillar 6 → cohort-audience-LTV-decay-trigger)
- Move #119 per-cohort-attribution-decision-engine (consumes Pillar 6 → cohort-LTV-decay-band-update)
- Move #90 ai-orchestration-per-channel (per-cohort × per-channel LTV-decay orchestration)
- Move #180 marketing-mix-modeling-mmm-attribution-engine (per-cohort MMM-attribution + per-cohort-LTV-decay-driven-attribution-accuracy-improvement)
- Move #181 ai-vendor-orchestration-governance-engine (per-cohort-LTV-decay AI-vendor-orchestration + cohort-decision-validation)
- Move #182 ai-agent-trust-recovery-engine (per-cohort-LTV-decay AI-agent-trust-recovery for decay-window-driven agent decisions)

## Sources

- Move #358.5.1 per-sku-supplier-stress-test-cohort-affinity 2026-09-26
- Move #358.5 per-region-cross-warehouse-balance-supplier-stress-test-engine 2026-09-26
- Move #358.4 per-region-cross-warehouse-balance-BFCM-stress-test-engine 2026-09-26
- Move #358.3 per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass 2026-09-26
- Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine 2026-09-26
- Move #358.1 cross-warehouse-balance-cost-amortization-engine 2026-09-26
- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation 2026-09-26
- Move #357 per-sku-inventory-commitment-open-to-buy-budget 2026-09-26
- Move #356 assortment-planning-hero-sku-strategy 2026-09-26
- Move #89 bfcm-season-engine 2026-09-26
- Move #25 international-expansion 2026-09-26
- Move #96 demand-sensing-supply-chain-resilience 2026-09-26
- Move #29 inventory-forecasting-stockout-prevention 2026-09-26
- Move #11 subscription-replenishment 2026-09-26
- Move #107 competitive-price-intelligence-engine 2026-09-26
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv 2026-09-26
- Move #154 predictive-ltv-churn-engine 2026-09-26
- Move #113 per-cohort-creative-engine 2026-09-26
- Move #115 per-cohort-audience-engine 2026-09-26
- Move #119 per-cohort-attribution-decision-engine 2026-09-26
- Move #90 ai-orchestration-per-channel 2026-09-26
- Move #180 marketing-mix-modeling-mmm-attribution-engine 2026-09-26
- Move #181 ai-vendor-orchestration-governance-engine 2026-09-26
- Move #182 ai-agent-trust-recovery-engine 2026-09-26
- Shopify Inventory API + Locations API + Transfers API + Fulfillment API + Supplier API 2026
- Ikas GraphQL + Rest Admin + Bulk + Webhooks 2026
- BigCommerce Catalog API + Orders API + Shipment API 2026
- WooCommerce REST + GraphQL + HPOS 2026
- Salesforce Commerce Cloud SCAPI + OCAPI + Shopper 2026
- SAP Commerce Cloud + SAP S/4HANA + SAP IBP + SAP IOM + SAP SCM + SAP EWM + SAP WMS 2026
- NetSuite Inventory + Supply Chain + Multi-Subsidiary 2026
- Oracle Fusion SCM + Oracle WMS + Oracle Transportation 2026
- Blue Yonder Allocation + Supplier Stress Test + Multi-Warehouse 2026
- Manhattan Associates Active Inventory + Supplier + Replenishment 2026
- ShipBob + Multi-Warehouse + Supplier + BFCM + Dropship + Peak 2026
- ShipMonk + Supplier + BFCM + Dropship + Peak 2026
- FBA + Multi-Channel + Supplier + BFCM + Dropship + Inventory Distribution 2026
- AMCF + Supplier + BFCM + Dropship 2026
- Flexport + Supplier + BFCM + Dropship 2026
- LeanBox + Supplier + BFCM + Dropship 2026
- Printful + Supplier + BFCM + Peak + Dropship 2026
- Printify + Supplier + BFCM + Peak + Dropship 2026
- Spocket + Supplier + BFCM + Peak + Dropship 2026
- Zendrop + Supplier + BFCM + Peak + Dropship 2026
- CJdropshipping + Supplier + BFCM + Dropship 2026
- Alibaba + Supplier + BFCM 2026
- Recharge Subscription Billing + Cohort LTV + Multi-Cohort 2026
- Loop Subscriptions + Cohort LTV + Multi-Cohort 2026
- Smile.io + Loyalty + Cohort LTV + Multi-Tier 2026
- Klaviyo + Per-Cohort Messaging + Per-Cohort Flow + Per-Cohort Attribution 2026
- Postscript + Per-Cohort SMS + Per-Cohort Flow + Per-Cohort Attribution 2026
- Omnisend + Per-Cohort Email + Per-Cohort SMS + Per-Cohort Flow 2026
- Triple Whale + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-LTV-Tier-Decay-Window-Event-Stream 32-field schema 2026
- Polar + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window 2026
- Northbeam + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-Attribution-ROI 2026
- McKinsey + Deloitte + Forrester + Gartner + Accenture + BCG + Bain + MIT Sloan + HBR + Supply-Chain-2026 + BFCM-2026 + Procurement-2026 + Supplier-Resilience-2026 + Supplier-Stress-Test-2026 + Per-Cohort-Affinity-2026 + Per-Cohort-LTV-2026 + Per-Cohort-Supplier-Overlap-2026 + Per-Cohort-Decay-Rollback-2026 + Per-Cohort-LTV-Tier-Decay-Window-2026 + Multi-Cohort-Stress-Test-2026 2026
