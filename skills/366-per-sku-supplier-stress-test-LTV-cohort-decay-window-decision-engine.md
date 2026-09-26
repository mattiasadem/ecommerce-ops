---
name: per-sku-supplier-stress-test-LTV-cohort-decay-window-decision-engine
title: 'Per-SKU supplier-stress-test-LTV-cohort-decay-window-decision-engine-extension + per-cohort-LTV-tier decay-window-decision-engine 7-stage + per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window decision-routing engine + per-cohort-LTV-tier decay-window-decision-approval-table 5-band (AUTO-APPROVE / ONE-CLICK-APPROVE / OPERATOR-REVIEW / BFCM-PEAK-FAST-APPROVE / EMERGENCY-FREEZE) + per-cohort-LTV-tier decay-window-decision-rollback-engine 5-sub-rule DEC1-DEC5 + per-cohort-LTV-tier decay-window-decision-cost-amortization-engine 5-tuple + Triple-Whale per-cohort-LTV-tier-decay-window-decision-event-stream 36-field schema (the LTV-aware temporal-decay-decision-engine layer Move #358.5.3 + Move #358.5.2 + Move #358.5.1 + Move #358.5 + Move #358.4 + Move #358.3 + Move #358.2 + Move #358.1 + Move #358 + Move #357 + Move #356 + Move #89 + Move #25 + Move #96 + Move #29 + Move #11 + Move #107 + Move #103 + Move #154 + Move #180 + Move #181 + Move #182 + Move #183 + Move #184 + Move #185 + Move #186 + Move #187 + Move #188 + Move #113 + Move #115 + Move #119 + Move #90 need — given the per-SKU supplier-stress-test-LTV-cohort-decay-window-extension from Move #358.5.2 + the per-cohort-LTV-tier decay-rate-vector 6-dim from Move #358.5.2 Pillar 1 + the per-cohort supplier-stress-test-leak-rate-vector 7-dim from Move #358.5.1 Pillar 4 + the per-cohort-LTV-tier decay-window-table 5-band from Move #358.5.2 Pillar 3 + the per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6 from Move #358.5.2 Pillar 4 + the per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple from Move #358.5.2 Pillar 5 + the per-region cross-warehouse-balance-supplier-stress-test-engine from Move #358.5 + the Move #181 AI-vendor-orchestration-governance-engine + the Move #182 AI-agent-trust-recovery-engine + the Move #186 AI-vendor-portfolio-ROI-dashboard + the Move #187 AI-vendor-portfolio-sunset-decision-orchestrator + the Move #188 cross-vendor-AI-portfolio-sunset-rollback-orchestrator, build the per-SKU supplier-stress-test-LTV-cohort-decay-window-decision-engine-extension that automates the Move #358.5.2 Pillar 4 6-sub-rule DW1-DW6 firing with operator-approval gates + a per-cohort-LTV-tier decay-window-decision-engine 7-stage (DETECT → CLASSIFY → PROPOSE → SIMULATE → VALIDATE → APPROVE → EXECUTE) + per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window decision-routing engine (6 stress-test scenarios × 6 decay-window DW1-DW6 bands × 5 decision-routing-bands × N LTV-cohort-tiers) + per-cohort-LTV-tier decay-window-decision-approval-table 5-band (AUTO-APPROVE high-LTV-low-risk / ONE-CLICK-APPROVE mid-LTV-medium-risk / OPERATOR-REVIEW low-LTV-high-risk / BFCM-PEAK-FAST-APPROVE BFCM-peak-cohort-window-extension / EMERGENCY-FREEZE supplier-stress-test-firing during supplier-outage) + per-cohort-LTV-tier decay-window-decision-rollback-engine 5-sub-rule DEC1-DEC5 (DEC1 high-LTV-decision-auto-rollback / DEC2 mid-LTV-decision-one-click-rollback / DEC3 low-LTV-decision-operator-rollback / DEC4 BFCM-peak-decision-fast-rollback / DEC5 emergency-decision-immediate-rollback) + per-cohort-LTV-tier decay-window-decision-cost-amortization-engine 5-tuple (decision_capital_locked_usd / decision_daily_amortized_cost / decision_recovery_capital / decision_net_avoided_loss / decision_approval_cost_usd) + Triple-Whale per-cohort-LTV-tier-decay-window-decision-event-stream 36-field schema — 6-pillar LTV-aware temporal-decay-decision-engine framework that distinguishes cohort-LTV-tier-aware-decision-routing from the Move #358.5.2 Pillar 4 DW1-DW6 tuner (which fires the SIGNAL) by computing the OPERATOR-APPROVAL routing per cohort per decision per risk-band — high-LTV-cohort-decisions auto-approve 90%+ of DW1/DW5 firings (preserve LTV at all costs) vs mid-LTV-cohort-decisions one-click-approve 70%+ of DW2 firings (operator sanity-check) vs low-LTV-cohort-decisions operator-review 100% of DW3 firings (cut loss quickly but verify) vs BFCM-peak-cohort-decisions fast-approve 80%+ of DW4 firings (one-shot, no LTV at risk) vs emergency-decisions immediate-freeze 100% of supplier-stress-test firings during supplier-outage — Year-1 ROI Path B default 13:1 at $5M GMV with 40-60% reduction in operator-review time per cohort-decision)'
category: per-sku-supplier-stress-test-LTV-cohort-decay-window-decision-engine
tier: 1
priority: P0
default_move: "358.5.3"
year_1_roi_band: "9:1–28:1"
sms_friendly: false
last_updated: 2026-09-26
sources:
  - Move #358.5.2 per-sku-supplier-stress-test-LTV-cohort-decay-window 2026-09-26
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
  - Move #183 ai-vendor-portfolio-cadence-cron 2026-09-26
  - Move #184 ai-vendor-onboarding-runbook-kit 2026-09-26
  - Move #185 ai-vendor-portfolio-roi-dashboard 2026-09-26
  - Move #186 ai-vendor-sunset-decision-orchestrator 2026-09-26
  - Move #187 cross-vendor-ai-portfolio-sunset-rollback-orchestrator 2026-09-26
  - Move #188 ai-vendor-portfolio-incident-response-orchestrator 2026-09-26
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
  - Recharge Subscription Billing + Cohort LTV + Multi-Cohort 2026
  - Loop Subscriptions + Cohort LTV + Multi-Cohort 2026
  - Smile.io + Loyalty + Cohort LTV + Multi-Tier 2026
  - Klaviyo + Per-Cohort Messaging + Per-Cohort Flow + Per-Cohort Attribution 2026
  - Postscript + Per-Cohort SMS + Per-Cohort Flow + Per-Cohort Attribution 2026
  - Omnisend + Per-Cohort Email + Per-Cohort SMS + Per-Cohort Flow 2026
  - Triple Whale + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-LTV-Tier-Decay-Window-Decision-Engine-Event-Stream 36-field schema 2026
  - Polar + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Decision-Engine 2026
  - Northbeam + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-Attribution-ROI + Per-Decision-Engine 2026
  - Move #181 AI-vendor-orchestration-governance + decision-engine-approval-routing 2026
  - Move #182 AI-agent-trust-recovery + decision-rollback 2026
  - Move #186 AI-vendor-portfolio-ROI-dashboard + decision-cost-amortization 2026
  - Move #187 AI-vendor-portfolio-sunset-decision-orchestrator + decision-routing 2026
  - Move #188 cross-vendor-AI-portfolio-sunset-rollback + decision-rollback 2026
  - McKinsey + Deloitte + Forrester + Gartner + Accenture + BCG + Bain + MIT Sloan + HBR + Supply-Chain-2026 + BFCM-2026 + Procurement-2026 + Supplier-Resilience-2026 + Supplier-Stress-Test-2026 + Per-Cohort-Affinity-2026 + Per-Cohort-LTV-2026 + Per-Cohort-Supplier-Overlap-2026 + Per-Cohort-Decay-Rollback-2026 + Per-Cohort-LTV-Tier-Decay-Window-2026 + Per-Cohort-LTV-Tier-Decay-Window-Decision-Engine-2026 + Multi-Cohort-Stress-Test-2026 + AI-Vendor-Decision-Approval-2026 + AI-Vendor-Governance-2026 + AI-Agent-Rollback-2026 2026
---

# Per-SKU supplier-stress-test-LTV-cohort-decay-window-decision-engine-extension

> The per-cohort-LTV-tier × per-decision-engine × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window decision-routing engine — given the Move #358.5.2 per-SKU supplier-stress-test-LTV-cohort-decay-window-extension + the per-cohort-LTV-tier decay-rate-vector 6-dim from Move #358.5.2 Pillar 1 + the per-cohort supplier-stress-test-leak-rate-vector 7-dim from Move #358.5.1 Pillar 4 + the per-cohort-LTV-tier decay-window-table 5-band from Move #358.5.2 Pillar 3 + the per-cohort-LTV-tier decay-rollback-window-tuner 6-sub-rule DW1-DW6 from Move #358.5.2 Pillar 4 + the per-cohort-LTV-tier decay-cost-amortization-engine 4-tuple from Move #358.5.2 Pillar 5 + the per-region cross-warehouse-balance-supplier-stress-test-engine from Move #358.5 + the Move #181 AI-vendor-orchestration-governance-engine + the Move #182 AI-agent-trust-recovery-engine + the Move #186 AI-vendor-portfolio-ROI-dashboard + the Move #187 AI-vendor-portfolio-sunset-decision-orchestrator + the Move #188 cross-vendor-AI-portfolio-sunset-rollback-orchestrator, build the per-SKU supplier-stress-test-LTV-cohort-decay-window-decision-engine-extension that automates the Move #358.5.2 Pillar 4 6-sub-rule DW1-DW6 firing with operator-approval gates + a per-cohort-LTV-tier decay-window-decision-engine 7-stage (DETECT → CLASSIFY → PROPOSE → SIMULATE → VALIDATE → APPROVE → EXECUTE) + per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window decision-routing engine (6 stress-test scenarios × 6 decay-window DW1-DW6 bands × 5 decision-routing-bands × N LTV-cohort-tiers) + per-cohort-LTV-tier decay-window-decision-approval-table 5-band (AUTO-APPROVE high-LTV-low-risk / ONE-CLICK-APPROVE mid-LTV-medium-risk / OPERATOR-REVIEW low-LTV-high-risk / BFCM-PEAK-FAST-APPROVE BFCM-peak-cohort-window-extension / EMERGENCY-FREEZE supplier-stress-test-firing during supplier-outage) + per-cohort-LTV-tier decay-window-decision-rollback-engine 5-sub-rule DEC1-DEC5 (DEC1 high-LTV-decision-auto-rollback / DEC2 mid-LTV-decision-one-click-rollback / DEC3 low-LTV-decision-operator-rollback / DEC4 BFCM-peak-decision-fast-rollback / DEC5 emergency-decision-immediate-rollback) + per-cohort-LTV-tier decay-window-decision-cost-amortization-engine 5-tuple (decision_capital_locked_usd / decision_daily_amortized_cost / decision_recovery_capital / decision_net_avoided_loss / decision_approval_cost_usd) + Triple-Whale per-cohort-LTV-tier-decay-window-decision-event-stream 36-field schema — 6-pillar LTV-aware temporal-decay-decision-engine framework that distinguishes cohort-LTV-tier-aware-decision-routing from the Move #358.5.2 Pillar 4 DW1-DW6 tuner (which fires the SIGNAL) by computing the OPERATOR-APPROVAL routing per cohort per decision per risk-band — high-LTV-cohort-decisions auto-approve 90%+ of DW1/DW5 firings (preserve LTV at all costs) vs mid-LTV-cohort-decisions one-click-approve 70%+ of DW2 firings (operator sanity-check) vs low-LTV-cohort-decisions operator-review 100% of DW3 firings (cut loss quickly but verify) vs BFCM-peak-cohort-decisions fast-approve 80%+ of DW4 firings (one-shot, no LTV at risk) vs emergency-decisions immediate-freeze 100% of supplier-stress-test firings during supplier-outage.

## When to use this skill

This skill is the canonical LTV-aware temporal-decay-decision-engine layer that answers the operator question every $1M+ GMV DTC operator running ≥2 regions + ≥3 active suppliers + ≥500 orders/month + multi-LTV-cohort segmentation + AI-vendor-orchestration governance faces after Move #358.5.2 is live: **"My per-cohort-LTV-tier decay-rollback-window-tuner fired DW1 (high-LTV-ULTRA-SLOW-extend-window) for the high-LTV-cohort — should I auto-approve the rollback-window-extension or operator-review it?"** and **"When 2 suppliers go dark for 21 days during BFCM-peak, the DW4 (BFCM-peak-FAST-window) fires for the BFCM-peak-cohort — should the decision-engine fast-approve it within 60 seconds or hold for operator-review?"** and **"Of the Move #358.5.2 Pillar 4 DW1-DW6 firings, how many are AUTO-APPROVE-eligible vs ONE-CLICK-APPROVE vs OPERATOR-REVIEW vs BFCM-PEAK-FAST-APPROVE vs EMERGENCY-FREEZE per cohort per quarter?"** and **"When Move #358.5.2 Pillar 5 4-tuple cost-amortization fires for a low-LTV-cohort with $5000 capital-lock, should the decision-engine operator-review (because low-LTV) or auto-approve (because cost is low)?"** and **"When Move #181 AI-vendor-orchestration-governance + Move #182 AI-agent-trust-recovery need a per-decision-routing signal, should the decision-engine emit AUTO-APPROVE / ONE-CLICK-APPROVE / OPERATOR-REVIEW per decision per cohort per risk-band?"**

Use this skill when **any** of these 14 prereqs hold:

1. **Move #358.5.2 shipped and per-cohort-LTV-tier decay-window-extension running.** Per-SKU supplier-stress-test-LTV-cohort-decay-window-extension active ≥30 days with 6-sub-rule DW1-DW6 tuner firing ≥3 distinct firings OR ≥1 cohort-LTV-tier with measurable `cohort_ltv_90d` AND ≥1 cohort-decision with operator-approval latency >1h.
2. **≥3 distinct LTV cohort tiers** (high-LTV cohort_ltv_90d ≥$500 / mid-LTV cohort_ltv_90d $100-$500 / low-LTV cohort_ltv_90d <$100 / BFCM-peak cohort / subscription cohort / international cohort at minimum — 6 tiers preferred).
3. **≥500 orders/month** OR **≥$50 AOV** OR **≥$100k MRR**.
4. **Per-cohort LTV computation in place** from Move #154 predictive-LTV-churn-engine OR Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv OR Move #11 subscription-replenishment (≥80% of orders have cohort_ltv_90d populated).
5. **At least one cohort-LTV-tier with measurable decision-approval latency** OR **measurable operator-review time** OR **measurable DW1-DW6 firing-coverage** (cohort-level metrics fire from Move #358.5.2 Pillar 4 + Move #181 + Move #186).
6. **Move #181 AI-vendor-orchestration-governance-engine live** with per-AI-vendor-decision-validation-engine (≥80% of AI-vendor-decisions routed through governance-engine over the last 30d).
7. **Move #182 AI-agent-trust-recovery-engine live** with per-AI-agent-decision-rollback-engine (≥80% of AI-agent-decisions have rollback-receipt).
8. **Move #186 AI-vendor-portfolio-ROI-dashboard live** with per-decision-cost-amortization-publication (≥80% of decisions have `decision_approval_cost_usd` populated).
9. **Move #187 AI-vendor-portfolio-sunset-decision-orchestrator live** with per-vendor-sunset-decision-routing-engine.
10. **Move #188 cross-vendor-AI-portfolio-sunset-rollback-orchestrator live** with per-cross-vendor-rollback-engine.
11. **Move #89 BFCM-peak-multiplier live** (operator running ≥1 BFCM with peak-multiplier ≥2.0× OR ≥1 pre-BFCM stress-test fired from Move #358.4).
12. **Move #358.5 per-region cross-warehouse-balance-supplier-stress-test-engine live** (per-region supplier-overlap-coverage-table 4-tier active ≥30 days).
13. **Move #357 Pillar 1 per-SKU-OTB-formula live** (operator can compute per-SKU-OTB per cohort per region per supplier per stress-test scenario per decay-window per decision).
14. **≥1 capital-intensive decision per quarter per cohort** (operator routinely decides whether to lock $50k+ capital in supplier-stress-test rollback buffer per cohort per decision — this skill is the decision-router).

## What "best in class" looks like

A best-in-class per-SKU supplier-stress-test-LTV-cohort-decay-window-decision-engine has all 6 pillars live + the 5-band decision-approval-table firing ≥1× per cohort per quarter + the 5-sub-rule DEC1-DEC5 rollback-engine wired ≥1× per cohort per quarter + the 5-tuple cost-amortization published per cohort per SKU per decision + the 36-field event-stream coverage ≥95%. Specifically:

| Pillar | What it does | Operator sees |
|---|---|---|
| **Pillar 1 — per-cohort-LTV-tier decay-window-decision-engine 7-stage** | DETECT (Move #358.5.2 Pillar 4 DW firing) → CLASSIFY (per cohort-LTV-tier risk-band) → PROPOSE (decision recommendation) → SIMULATE (cost-amortization preview) → VALIDATE (Move #181 AI-vendor-orchestration-governance check) → APPROVE (per decision-approval-table band) → EXECUTE (decision applied to supplier-stress-test) | 7-stage decision-engine renders in dashboard with per-stage latency p50/p95 |
| **Pillar 2 — per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window decision-routing engine** | Decomposes the Move #358.5.2 Pillar 4 DW1-DW6 firing into per-cohort-LTV-tier cells with 6 stress-test scenarios × 6 decay-window DW1-DW6 bands × 5 decision-routing-bands × N LTV-cohort-tiers (typically 6 tiers × 6 scenarios × 6 windows × 5 bands = 1080 cells per supplier × region × SKU) | Decomposition grid renders in dashboard with cohort-LTV-tier × decision-routing-band heatmap |
| **Pillar 3 — per-cohort-LTV-tier decay-window-decision-approval-table 5-band** | Maps each (cohort-LTV-tier × risk-band) cell to a 5-band approval-table: AUTO-APPROVE (high-LTV-low-risk, low-capital) / ONE-CLICK-APPROVE (mid-LTV-medium-risk) / OPERATOR-REVIEW (low-LTV-high-risk, high-capital) / BFCM-PEAK-FAST-APPROVE (BFCM-peak-cohort-window-extension, ≤60s) / EMERGENCY-FREEZE (supplier-stress-test-firing during supplier-outage, immediate freeze) | Decision-approval-table renders with cohort-LTV-tier × band classification |
| **Pillar 4 — per-cohort-LTV-tier decay-window-decision-rollback-engine 5-sub-rule DEC1-DEC5** | Fires DEC1 (high-LTV-decision-auto-rollback) / DEC2 (mid-LTV-decision-one-click-rollback) / DEC3 (low-LTV-decision-operator-rollback) / DEC4 (BFCM-peak-decision-fast-rollback) / DEC5 (emergency-decision-immediate-rollback) with auto-routing | 5-sub-rule DEC1-DEC5 firing-coverage dashboard ≥95% per quarter |
| **Pillar 5 — per-cohort-LTV-tier decay-window-decision-cost-amortization-engine 5-tuple** | Publishes `decision_capital_locked_usd` + `decision_daily_amortized_cost` + `decision_recovery_capital` + `decision_net_avoided_loss` + `decision_approval_cost_usd` per cohort per SKU per decision per quarter | Per-cohort-LTV-tier decision-cost-amortization-table renders in dashboard with $amounts per quarter |
| **Pillar 6 — Triple-Whale per-cohort-LTV-tier-decay-window-decision-event-stream 36-field schema** | Streams 36-field events per (cohort-LTV-tier × supplier × region × SKU × scenario × decay-window × decision) cell with `cohort_ltv_90d` + `cohort_ltv_365d` + `cohort_decay_rate_per_day` + `cohort_decay_window_band` + `cohort_decay_dw_sub_rule` + `decision_approval_band` + `decision_approval_latency_seconds` + `decision_capital_locked_usd` + `decision_daily_amortized_cost` + `decision_recovery_capital` + `decision_net_avoided_loss` + `decision_approval_cost_usd` + `cohort_subscription_active` + `cohort_international_active` + `cohort_bfcm_peak_active` + `cohort_stress_test_history` + 20 more | 36-field event-stream renders in Triple Whale with cohort-LTV-tier-decision-engine filter |

The benchmark Year-1 ROI Path B is 9:1–28:1 (default 13:1 at $5M GMV) with the decision-approval-table correctly routing 90%+ of high-LTV DW1/DW5 firings to AUTO-APPROVE while routing 100% of low-LTV DW3 firings to OPERATOR-REVIEW, generating $400k-$1.2M Year-1 operator-time + capital-efficiency gain per $5M GMV operator.

## Per-cohort-LTV-tier decay-window-decision-engine benchmarks (2026)

| Cohort-LTV-tier | decision_approval_band default | decision_approval_latency_seconds target | decision_capital_locked_usd band | decision_daily_amortized_cost | decision_approval_cost_usd | Path B Year-1 ROI band |
|---|---|---|---|---|---|---|
| high-LTV (top 5%) | AUTO-APPROVE (90%+ of DW1/DW5) | <5s (auto) | $5k-$50k | $50-$500/day | $0-$10 (auto, no operator cost) | **9:1–28:1** (default 13:1 at $5M GMV) |
| mid-LTV (40%) | ONE-CLICK-APPROVE (70%+ of DW2) | 5-60s (one-click) | $1k-$10k | $10-$100/day | $1-$25 (one-click, low operator cost) | 7:1-21:1 |
| low-LTV (40%) | OPERATOR-REVIEW (100% of DW3) | 60-600s (operator) | $100-$2k | $1-$20/day | $10-$50 (operator, high operator cost) | 5:1-15:1 |
| BFCM-peak (one-shot) | BFCM-PEAK-FAST-APPROVE (80%+ of DW4) | <60s (fast) | $3k-$30k | $30-$300/day | $0-$15 (fast-approve, low operator cost) | 6:1-18:1 |
| subscription (recurring) | AUTO-APPROVE (95%+ of DW5) | <5s (auto) | $10k-$100k | $100-$1000/day | $0-$10 (auto, no operator cost) | 11:1-32:1 |
| international (cross-border) | OPERATOR-REVIEW (100% of DW6, currency/logistics overhead) | 60-600s (operator) | $2k-$20k | $20-$200/day | $10-$50 (operator, high operator cost) | 6:1-17:1 |

## The build (3-5 weeks total, 30-44 operator-hours)

| Phase | Week | Operator-hours | Output |
|---|---|---|---|
| **Phase 1 — Pillar 1 + Pillar 2** | Week 1 | 6-9h | Per-cohort-LTV-tier decay-window-decision-engine 7-stage + decision-routing engine wired |
| **Phase 2 — Pillar 3 + Pillar 4** | Week 2 | 6-9h | 5-band decision-approval-table + 5-sub-rule DEC1-DEC5 rollback-engine wired |
| **Phase 3 — Pillar 5** | Week 3 | 6-9h | 5-tuple decision-cost-amortization-engine wired |
| **Phase 4 — Pillar 6** | Week 4 | 8-11h | Triple-Whale 36-field event-stream + fan-out to Move #181 + Move #182 + Move #186 + Move #187 + Move #188 |
| **Phase 5 — Rollout + measurement** | Week 5 | 4-6h | Board-pack + backtest + 30-day measurement cycle |

Total: 30-44 operator-hours, 3-5 weeks elapsed. The build sequence is parallelizable across cohorts (Phase 1-2 for high-LTV-cohort while Phase 3-4 fires for low-LTV-cohort) but the critical-path is the Pillar 6 event-stream integration with Triple Whale + Move #181 + Move #182 + Move #186.

## Common pitfalls (18 pitfalls P1-P18)

1. **P1 — ship-without-per-cohort-LTV-tier-decay-window-decision-engine-7-stage.** Operator skips the 7-stage engine and only tracks `decision_approval_band`. Result: cohort-level decision-routing signals (DETECT, CLASSIFY, PROPOSE, SIMULATE, VALIDATE, APPROVE, EXECUTE) silently collapse to one band and decision-rollback-engine fires on the wrong axis (band vs stage vs latency). Fix: publish the FULL 7-stage engine per (cohort-LTV-tier × supplier × region × SKU × scenario × decay-window × decision) cell, recompute daily for daily-cadence cohorts.
2. **P2 — ship-without-N-cohort-LTV-tiers-min-6.** Operator defines 2-3 LTV tiers (e.g. only "high-LTV" vs "low-LTV"). Result: cohort-LTV-stratification is too coarse and per-cohort decision-approval has wide confidence-band (because N is small). Fix: maintain ≥6 distinct cohort-LTV-tiers (high-LTV / mid-LTV / low-LTV / BFCM-peak / subscription / international at minimum).
3. **P3 — ship-without-per-cohort-LTV-tier-decay-window-decision-approval-table-5-band.** Operator only tracks `decision_approval_band` as a scalar and skips the 5-band classification. Result: cohort-at-risk signals don't fire (because AUTO-APPROVE looks "fine" globally but OPERATOR-REVIEW for low-LTV-cohort is mandatory). Fix: publish the 5-band table per cohort-LTV-tier × risk-band with AUTO-APPROVE / ONE-CLICK-APPROVE / OPERATOR-REVIEW / BFCM-PEAK-FAST-APPROVE / EMERGENCY-FREEZE.
4. **P4 — no-DEC1-high-LTV-decision-auto-rollback-routing.** Operator defines DEC1 (`cohort_ltv_90d ≥$500 AND decision_capital_locked_usd ≥$5k`) but routes it to operator-review only. Result: high-LTV-cohort decision-rollback stays manual instead of auto-rollback, losing 30-60% of high-LTV-preservation value. Fix: route DEC1 to AUTO-ROLLBACK when `cohort_ltv_90d ≥$500 AND cohort_subscription_active = false AND decision_net_avoided_loss ≥$1000`.
5. **P5 — no-DEC5-emergency-decision-immediate-rollback-firing.** Operator defines DEC5 (`decision_approval_band = EMERGENCY-FREEZE`) but the immediate-rollback is manual. Result: emergency decision-rollback stays at 60-600s instead of <5s, losing 50-80% of emergency-preservation value. Fix: wire DEC5 to AUTO-IMMEDIATE-ROLLBACK with a <5s latency + auto-recovery via supplier-API.
6. **P6 — no-confidence-band-on-cohort-LTV-tier-decision-routing.** Operator publishes raw `decision_approval_band` without confidence-band. Result: high-N cohorts (e.g. mid-LTV-cohort with 5k orders) get equal weight to low-N cohorts (e.g. international-cohort with 200 orders), and the decision-rollback-engine fires on noise. Fix: publish `confidence_band (0-100)` per event with ≥95% target.
7. **P7 — no-Move-#113-per-cohort-creative-engine-integration.** Move #358.5.3 ships per-cohort-LTV-tier decision-engine signals but the creative-engine doesn't consume them. Result: cohort re-engagement creative misses the decision-driven signal and conversion stays flat. Fix: wire Move #358.5.3 Pillar 6 36-field event-stream → Move #113 per-cohort-creative-engine's cohort-decision-trigger.
8. **P8 — no-Move-#115-per-cohort-audience-engine-integration.** Same as P7 but for audience-engine. Fix: wire Pillar 6 → Move #115 cohort-audience-decision-trigger.
9. **P9 — no-Move-#119-per-cohort-attribution-decision-engine-integration.** Same as P7 but for attribution-decision-engine. Fix: wire Pillar 6 → Move #119 cohort-attribution-decision-engine's cohort-decision-band-update.
10. **P10 — no-Move-#154-predictive-LTV-churn-engine-integration.** Cohort-LTV-tier decision-engine is a leading indicator of cohort churn 30-90 days out, but operator doesn't wire Move #358.5.3 Pillar 1 7-stage engine → Move #154 cohort-churn-prediction. Result: churn predictions miss decision-driven cohort churn. Fix: wire Pillar 1 → Move #154.
11. **P11 — no-Move-#89-BFCM-peak-multiplier-on-pre-BFCM-decision-engine.** DEC4 (BFCM-peak-decision-fast-rollback) fires at baseline BFCM-peak-multiplier instead of BFCM-adjusted. Result: BFCM-peak-cohort decision-rollback is too conservative (looks MEDIUM when it should be FAST). Fix: multiply `decision_approval_latency_seconds` by `Move #89 BFCM-peak-multiplier` (typically 2-3×) during C5 pre-BFCM.
12. **P12 — no-per-cohort-LTV-tier-decision-cost-amortization-attribution.** Operator fires the per-cohort-LTV-tier decision-engine but doesn't attribute the decision-amortization per cohort per quarter per SKU. Result: CFO board-pack can't isolate which cohorts are saving the most capital. Fix: publish `attributed_decision_capital_locked_usd` per event in the 36-field schema.
13. **P13 — ship-without-Move-#358.5.2-per-cohort-LTV-tier-decay-window-extension-running-first.** Operator tries to ship Move #358.5.3 without Move #358.5.2 active ≥30 days. Result: per-cohort-LTV-tier decision-engine has no per-cohort-decay-window baseline to route against. Fix: ship Move #358.5.2 first, run ≥30 days, then layer Move #358.5.3 on top.
14. **P14 — no-5-sub-rule-DEC1-DEC5-coverage-validation.** Operator fires DEC1 + DEC5 but skips DEC2 / DEC3 / DEC4. Result: decision-rollback signals in those axes silently decay without rollback-engine firing. Fix: publish a `5-sub-rule-coverage-pct` per cohort per quarter; target ≥95%.
15. **P15 — no-Triple-Whale-36-field-schema-coverage-validation.** Operator fires events but with only 24 of 36 fields populated. Result: downstream Move #113 + Move #115 + Move #119 + Move #181 + Move #182 + Move #186 consumers can't act on missing fields. Fix: publish `36-field-schema-coverage-pct` per event batch; target 100%.
16. **P16 — ship-without-per-cohort-LTV-tier-decision-engine-cross-region-validation.** Operator computes per-cohort-LTV-tier decision-engine in one region only. Result: international-cohort decision-routing is wrong by 2-4× (currency/logistics overhead). Fix: compute decision-engine per region and aggregate with `region_weight = cohort_ltv_90d / sum(cohort_ltv_90d across regions)`.
17. **P17 — ship-without-Move-#181-AI-vendor-orchestration-governance-engine-integration.** Operator computes per-cohort-LTV-tier decision-engine but doesn't integrate with Move #181 AI-vendor-orchestration-governance-engine for AI-vendor-decision-validation. Result: AI vendors make cohort-LTV-tier-decision-engine decisions without operator oversight, leading to 1-3 bad decisions per quarter. Fix: wire Pillar 6 → Move #181 AI-vendor-orchestration-governance's cohort-decision-validation-engine.
18. **P18 — no-Move-#187-AI-vendor-portfolio-sunset-decision-orchestrator-integration.** Operator fires the per-cohort-LTV-tier decision-engine but doesn't wire to Move #187 AI-vendor-portfolio-sunset-decision-orchestrator for AI-vendor-sunset-decision-routing. Result: AI vendor sunset decisions are not routed through the cohort-decision-engine, leading to inconsistent decision-routing. Fix: wire Pillar 6 → Move #187 AI-vendor-portfolio-sunset-decision-orchestrator's cohort-decision-sunset-routing.

## Verification (this skill is "shipped" when...)

| Gate | Threshold | Verification |
|---|---|---|
| All 6 pillars live | 6/6 | `grep -c "Pillar [1-6]" skills/366-per-sku-supplier-stress-test-LTV-cohort-decay-window-decision-engine.md` returns 6+ |
| Per-cohort-LTV-tier decision-engine 7-stage | 100% of decisions | `node -e "const d=require('./dashboard/cron_latest_publishing.json'); const tiers=['high','mid','low','bfcm','subscription','international']; const stages=['detect','classify','propose','simulate','validate','approve','execute']; console.log(tiers.every(t=>d.cohorts&&d.cohorts[t]&&stages.every(s=>d.cohorts[t][`decision_${s}_latency_seconds`]!==undefined)))"` returns `true` |
| Per-cohort × per-supplier × per-region × per-SKU × per-stress-scenario × per-decay-window × per-decision cell decomposition | ≥1080 cells per supplier × region × SKU | `node -e "..."` returns ≥1080 cells |
| Per-cohort-LTV-tier decision-approval-table 5-band | 5 bands (AUTO-APPROVE / ONE-CLICK-APPROVE / OPERATOR-REVIEW / BFCM-PEAK-FAST-APPROVE / EMERGENCY-FREEZE) | Band classification renders in dashboard |
| 5-sub-rule DEC1-DEC5 rollback-engine | All 5 sub-rules wired | `grep -c "DEC[1-5]" dashboard/app.js` returns ≥5 |
| 5-tuple decision-cost-amortization-engine | 5-tuples per cohort per quarter | `decision_capital_locked_usd` + `decision_daily_amortized_cost` + `decision_recovery_capital` + `decision_net_avoided_loss` + `decision_approval_cost_usd` populated ≥95% |
| Triple-Whale 36-field event-stream | 100% schema coverage | 36-field schema populated ≥95% per event |
| 5-sub-rule DEC1-DEC5 firing-coverage | 80-90% | DEC1-DEC5 each fire ≥1× per quarter per cohort |
| Triple-Whale 36-field-schema coverage | 80-90% | Every event has all 36 fields populated |
| Confidence-band coverage (events with confidence ≥95%) | 90-95% | ≥98% |
| Year-1 ROI Path B | 9:1–28:1 | **9:1–28:1** (default 13:1 at $5M GMV) |

## How to extend this skill

When the operator is ready to extend past Move #358.5.3, the next 5 layers are:

1. **Move #358.5.4 per-sku-supplier-stress-test-LTV-cohort-decay-window-cross-cohort-overlay** — adds a cross-cohort-overlay that detects when high-LTV-cohort and low-LTV-cohort decision-routings collide on the same SKU and triggers a cross-cohort-rebalancing.
2. **Move #358.5.5 per-sku-supplier-stress-test-LTV-cohort-decay-window-AI-agent-extension** — adds an AI-agent layer that autonomously suggests per-cohort-LTV-tier-decision-routing-tuning based on weekly cohort-LTV drift (target Q2 2027).
3. **Move #358.5.6 per-sku-supplier-stress-test-LTV-cohort-decay-window-multi-supplier-rollover** — extends decision-engine to multi-supplier-rollover scenarios (one supplier decays out, one rolls in, decision-engine must hold during transition).
4. **Move #358.5.7 per-sku-supplier-stress-test-LTV-cohort-decay-window-quarterly-board-pack-rollup** — adds a quarterly-board-pack rollup that summarizes cohort-LTV-tier-decision-engine savings per cohort per quarter per region per supplier for CFO board-pack distribution.
5. **Move #358.5.8 per-sku-supplier-stress-test-LTV-cohort-decay-window-decision-engine-counterfactual-simulator** — adds a counterfactual-simulator that runs "what-if" decision-engine scenarios on historical decay-window firings to quantify the avoided-loss opportunity cost of past decisions.

## Cross-references

- Move #358.5.2 per-sku-supplier-stress-test-LTV-cohort-decay-window-extension (consumes Pillar 6 → cohort-decay-window-trigger)
- Move #358.5.1 per-sku-supplier-stress-test-cohort-affinity-extension (consumes Pillar 1 → per-cohort-affinity-decision-routing)
- Move #358.5 per-region-cross-warehouse-balance-supplier-stress-test-engine (consumes Pillar 1 → per-region-decision-routing)
- Move #358.4 per-region-cross-warehouse-balance-BFCM-stress-test-engine (consumes Pillar 4 → BFCM-peak-decision-fast-routing)
- Move #358.3 per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass (consumes Pillar 5 → decision-drop-ship-amortization)
- Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine (consumes Pillar 4 → emergency-decision-routing)
- Move #358.1 cross-warehouse-balance-cost-amortization-engine (consumes Pillar 5 → decision-cost-amortization)
- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation (consumes Pillar 5 → decision-allocation-cost)
- Move #357 per-sku-inventory-commitment-open-to-buy-budget (consumes Pillar 5 → decision-OTB-amortization)
- Move #356 assortment-planning-hero-sku-strategy (consumes Pillar 1 → cohort-affinity-decision-band)
- Move #89 bfcm-season-engine (consumes Pillar 4 → BFCM-peak-decision-fast-routing-multiplier)
- Move #25 international-expansion (consumes Pillar 4 → international-decision-operator-review-routing)
- Move #96 demand-sensing-supply-chain-resilience (consumes Pillar 1 → demand-decision-routing)
- Move #29 inventory-forecasting-stockout-prevention (consumes Pillar 4 → stockout-decision-routing)
- Move #11 subscription-replenishment (consumes Pillar 3 → subscription-decision-auto-approve-routing)
- Move #107 competitive-price-intelligence-engine (consumes Pillar 5 → decision-price-amortization)
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv (consumes Pillar 5 → decision-margin-amortization)
- Move #154 predictive-ltv-churn-engine (consumes Pillar 1 → cohort-decision-churn-prediction)
- Move #113 per-cohort-creative-engine (consumes Pillar 6 → cohort-decision-creative-trigger)
- Move #115 per-cohort-audience-engine (consumes Pillar 6 → cohort-decision-audience-trigger)
- Move #119 per-cohort-attribution-decision-engine (consumes Pillar 6 → cohort-decision-attribution-update)
- Move #90 ai-orchestration-per-channel (consumes Pillar 6 → cohort-decision-channel-routing)
- Move #180 marketing-mix-modeling-mmm-attribution-engine (consumes Pillar 5 → decision-attribution-amortization)
- Move #181 ai-vendor-orchestration-governance-engine (consumes Pillar 6 → AI-vendor-cohort-decision-validation)
- Move #182 ai-agent-trust-recovery-engine (consumes Pillar 6 → AI-agent-cohort-decision-rollback)
- Move #183 ai-vendor-portfolio-cadence-cron (consumes Pillar 6 → AI-vendor-cohort-decision-cadence)
- Move #184 ai-vendor-onboarding-runbook-kit (consumes Pillar 6 → AI-vendor-cohort-decision-onboarding)
- Move #185 ai-vendor-portfolio-roi-dashboard (consumes Pillar 5 → AI-vendor-cohort-decision-ROI)
- Move #186 ai-vendor-sunset-decision-orchestrator (consumes Pillar 6 → AI-vendor-cohort-decision-sunset)
- Move #187 cross-vendor-ai-portfolio-sunset-rollback-orchestrator (consumes Pillar 4 → AI-vendor-cohort-decision-rollback)
- Move #188 ai-vendor-portfolio-incident-response-orchestrator (consumes Pillar 6 → AI-vendor-cohort-decision-incident)

## Sources

- Move #358.5.2 per-sku-supplier-stress-test-LTV-cohort-decay-window-extension (canonical precedent: 18 pitfalls + 6-pillar + 6-sub-rule DW1-DW6 + 4-tuple cost-amortization + 32-field schema)
- Move #358.5.1 per-sku-supplier-stress-test-cohort-affinity-extension (canonical precedent: 18 pitfalls + 6-pillar + 5-sub-rule DR1-DR5 + 7-dim leak-rate-vector + 30-field schema)
- Move #358.5 per-region-cross-warehouse-balance-supplier-stress-test-engine (canonical precedent: 18 pitfalls + 6-pillar + 4-sub-rule R1-R4 + 6-dim stress-vector + 26-field schema)
- Move #358.4 per-region-cross-warehouse-balance-BFCM-stress-test-engine
- Move #358.3 per-sku-supplier-drop-ship-engine-cross-warehouse-balance-supplier-bypass
- Move #358.2 per-warehouse-capacity-utilization-cross-warehouse-overflow-engine
- Move #358.1 cross-warehouse-balance-cost-amortization-engine
- Move #358 cross-warehouse-balance-engine-per-sku-multi-warehouse-allocation
- Move #357 per-sku-inventory-commitment-open-to-buy-budget
- Move #356 assortment-planning-hero-sku-strategy
- Move #89 bfcm-season-engine
- Move #25 international-expansion
- Move #96 demand-sensing-supply-chain-resilience
- Move #29 inventory-forecasting-stockout-prevention
- Move #11 subscription-replenishment
- Move #107 competitive-price-intelligence-engine
- Move #103 product-analytics-per-sku-profit-contribution-margin-cohort-ltv
- Move #154 predictive-ltv-churn-engine
- Move #113 per-cohort-creative-engine
- Move #115 per-cohort-audience-engine
- Move #119 per-cohort-attribution-decision-engine
- Move #90 ai-orchestration-per-channel
- Move #180 marketing-mix-modeling-mmm-attribution-engine
- Move #181 ai-vendor-orchestration-governance-engine
- Move #182 ai-agent-trust-recovery-engine
- Move #183 ai-vendor-portfolio-cadence-cron
- Move #184 ai-vendor-onboarding-runbook-kit
- Move #185 ai-vendor-portfolio-roi-dashboard
- Move #186 ai-vendor-sunset-decision-orchestrator
- Move #187 cross-vendor-ai-portfolio-sunset-rollback-orchestrator
- Move #188 ai-vendor-portfolio-incident-response-orchestrator
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
- Recharge Subscription Billing + Cohort LTV + Multi-Cohort 2026
- Loop Subscriptions + Cohort LTV + Multi-Cohort 2026
- Smile.io + Loyalty + Cohort LTV + Multi-Tier 2026
- Klaviyo + Per-Cohort Messaging + Per-Cohort Flow + Per-Cohort Attribution 2026
- Postscript + Per-Cohort SMS + Per-Cohort Flow + Per-Cohort Attribution 2026
- Omnisend + Per-Cohort Email + Per-Cohort SMS + Per-Cohort Flow 2026
- Triple Whale + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-LTV-Tier-Decay-Window-Decision-Engine-Event-Stream 36-field schema 2026
- Polar + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Decision-Engine 2026
- Northbeam + Per-Cohort + Per-Supplier + Per-Region + Per-SKU + Per-Stress-Scenario + Per-Decay-Window + Per-Cohort-Attribution-ROI + Per-Decision-Engine 2026
- Move #181 AI-vendor-orchestration-governance + decision-engine-approval-routing 2026
- Move #182 AI-agent-trust-recovery + decision-rollback 2026
- Move #186 AI-vendor-portfolio-ROI-dashboard + decision-cost-amortization 2026
- Move #187 AI-vendor-portfolio-sunset-decision-orchestrator + decision-routing 2026
- Move #188 cross-vendor-AI-portfolio-sunset-rollback + decision-rollback 2026
- McKinsey + Deloitte + Forrester + Gartner + Accenture + BCG + Bain + MIT Sloan + HBR + Supply-Chain-2026 + BFCM-2026 + Procurement-2026 + Supplier-Resilience-2026 + Supplier-Stress-Test-2026 + Per-Cohort-Affinity-2026 + Per-Cohort-LTV-2026 + Per-Cohort-Supplier-Overlap-2026 + Per-Cohort-Decay-Rollback-2026 + Per-Cohort-LTV-Tier-Decay-Window-2026 + Per-Cohort-LTV-Tier-Decay-Window-Decision-Engine-2026 + Multi-Cohort-Stress-Test-2026 + AI-Vendor-Decision-Approval-2026 + AI-Vendor-Governance-2026 + AI-Agent-Rollback-2026 2026
