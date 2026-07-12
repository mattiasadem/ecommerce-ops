---
name: inventory-forecasting-stockout-prevention
title: Inventory forecasting + stockout prevention (Inventory Planner + Netstock + Cogsy + Cin7 + Shopify, Move #12.5)
category: inventory
tier: 2
priority: P1
default_move: 12.5
year_1_roi_band: "6:1–24:1"
sms_friendly: false
last_updated: 2026-07-12
sources: [inventory-planner 2024, so-stocked 2024, cogsy 2024, cin7 2024, netstock 2024, extensiv 2024, finale 2024, brightpearl 2024, netsuite 2024, anvyl 2024, shipbob-inventory 2024, shipmonk-inventory 2024, stord-inventory 2024, shopify-stocky 2024, shopify-inventory 2024, klaviyo-back-in-stock 2024, triple-whale 2024, ga4 2024, posthog 2024, nrf 2024, ihl 2024, shopify-flow 2024, shopify-functions 2024, retool 2024, airtable 2024, open-to-buy 2024, retail-zt 2024, replenishment-2024]
---

# Inventory forecasting + stockout prevention (Move #12.5)

> Move #12.5 is the **operational-AI layer every $1M+ GMV DTC brand needs after Move #22.3 (3PL migration)**: replace spreadsheet-driven reorder math and reactive "we just ran out of hero-SKU-#4" purchasing with **Inventory Planner + Cogsy + Netstock + Cin7 + SoStocked + Shopify Stocky** so stockouts on A-items drop from 5–15% to <2% (the canonical "in-stock rate >97% on A-items, >92% overall" benchmark per IHL 2024 + NRF 2024), working capital tied up in dead stock drops 15–25% (the canonical "10–20% working-capital-release" lever per Inventory Planner 2024 + Cogsy 2024 case studies), and the supply-chain team stops flying blind on which SKUs are about to stock out in the next 14–30 days. **Inventory Planner ($249/mo Path B default at $1M–$5M GMV)** is the canonical pick for Shopify-DTC apparel/beauty/home; **Cogsy ($249/mo)** is the AI-first alternative with the strongest cash-flow-cycle benchmark; **Netstock ($349/mo)** is the canonical pick for brands with >500 SKUs and multi-warehouse demand; **Cin7 ($299/mo)** is the canonical pick for brands that need a unified OMS+WMS+inventory platform (Move #22.3 pairing); **Shopify Stocky** is the canonical free path for <500-SKU Shopify brands. Year-1 ROI band **6:1–24:1** with a default **12:1** at $3M GMV Path B. Ship AFTER Move #22.3 (3PL migration) is live OR the operator is doing 500+ orders/mo in-house AND Move #1 (abandoned-cart) + Move #6 (attribution) + Move #11 (subscription-program) are shipping real volume. Companion artifact scope: this skill synthesizes the canonical 5-pillar framework (Pillar 1 forecasting-engine selection / Pillar 2 demand-signal ingestion + lead-time-aware reorder math / Pillar 3 SKU-tier segmentation (A/B/C/D) + safety-stock + reorder points / Pillar 4 3PL/WMS + Shopify inventory-sync / Pillar 5 dead-stock liquidation + Klaviyo back-in-stock + Triple Whale cohort tracking) for $1M+ GMV brands — the same layer order the operator applies to fulfillment, returns, attribution, and lifecycle.

## When to use this skill

Use this skill when the operator is doing **≥500 orders/month** and the inventory-friction curve has started to compound: stockouts on hero SKUs (A-items) exceed 3% of days-in-period, dead-stock (slow-moving >180 days) exceeds 15% of total inventory value, the supply-chain team is making reorder decisions in a spreadsheet with no demand-signal ingestion, the brand carries >100 SKUs and reorder math is computed manually per SKU per week, working capital tied up in inventory exceeds 25% of annual GMV (the canonical "too much cash in stock" red flag), or the operator cannot answer "which 20 SKUs will stock out in the next 14 days?" within 60 seconds. Move #12.5 is the **canonical next step** in the operations track after Move #22.3 (in-region 3PL) — the two are tightly coupled: 3PL WMS real-time inventory sync is the substrate the forecasting engine reads to compute on-hand-vs-on-order math; without Move #22.3 first, Move #12.5 is a forecast against stale data.

You have:

- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access and inventory API enabled (Shopify Plus OR Shopify Advanced with Locations API + Inventory API enabled).
- **≥500 orders/month processed in the last 30 days** AND **≥100 SKUs in active catalog** — below these thresholds, defer and use Shopify-native Stocky + a manual reorder spreadsheet until volume justifies the platform fee.
- **A 3PL or in-house warehouse that exposes real-time inventory via API** — the forecasting engine reads on-hand + on-order + inbound; if the WMS doesn't expose that data via webhook or API, the engine is a forecast against stale snapshots and produces bad reorder math.
- **A baseline for: stockout rate %, dead-stock % (slow-moving >180d), working-capital-days-of-supply, lead-time per supplier (purchase-order creation to receipt), demand-velocity per SKU, sell-through rate per SKU, gross-margin per SKU, and seasonality-index per SKU** — you cannot measure the lift without the baseline.
- **Klaviyo (or equivalent ESP) on a paid plan** for the back-in-stock flow (the canonical #1 revenue-recovery lever for stockouts — a back-in-stock email converts 8–15% vs the 1–3% baseline of a fresh visitor arriving at the PDP).
- **Triple Whale (or Polar) attribution wired** so the operator can measure whether forecasting-driven in-stock-rate lifts flow to 30/60/90-day LTV (a hero-SKU stockout during a Meta campaign is the canonical "lift evaporates" failure mode — Move #6 attribution lets the operator see the campaign-spend-with-zero-conversions pattern).
- **A inventory-financing line of credit or cash-flow buffer of at least 30 days of COGS** — the forecasting engine will recommend buy-deeper-and-less-often math that increases working-capital tied up in inventory in exchange for stockout-prevention + freight-cost-reduction; without the cash-flow buffer, the operator can't act on the recommendations.
- **Supplier lead-time documentation per SKU** — the engine's reorder-point math is `(lead-time-days × daily-velocity) + safety-stock`; without accurate lead-time per supplier, the reorder math is wrong and the engine produces "we just ordered too late" stockouts.
- **A SKU-tier segmentation framework** (A-items = top 20% by revenue, B-items = next 30%, C-items = next 30%, D-items = bottom 20% by revenue) — the engine applies different forecasting algorithms + safety-stock multipliers per tier (A-items get ML + high safety stock; D-items get simple-moving-average + zero safety stock).
- **Move #1 (abandoned-cart Klaviyo) + Move #6 (attribution) + Move #11 (subscription-program) live** — without these, the back-in-stock flow has no email substrate to fire on, the operator cannot measure cohort LTV, and the revenue-recovery layer is invisible.
- **Budget for: $0–$650/month in platform fees** (Shopify Stocky is free for Advanced+, Inventory Planner $249/mo Path B default, Cogsy $249/mo, Netstock $349/mo, Cin7 $299/mo, SoStocked $89/mo, Brightpearl enterprise custom) **+ 4–8 hours/week in operator time for the first 6 weeks** (SKU-tier segmentation build, supplier lead-time onboarding, safety-stock calibration, back-in-stock flow wiring, attribution wiring, dead-stock liquidation planning).

Do **not** use it when:

- The store is doing **<500 orders/month OR <100 SKUs**. Defer Move #12.5, ship Move #1 + #4 + #7 first, and revisit when volume + catalog breadth justify the platform fee.
- The store is **not on Shopify** (or the platform does not have an inventory API the forecasting engine can integrate with). Inventory Planner / Cogsy / Netstock all require Shopify, BigCommerce, Magento, Cin7, NetSuite, or a headless storefront with API-level SKU + inventory access.
- The brand has **no SKU master with cost + supplier + lead-time documented**. The forecasting engine's reorder-point math needs all three per SKU; without them, the engine produces "we have no idea" output and the operator is back to manual spreadsheet math.
- The brand cannot commit to **A/B/C/D SKU-tier segmentation** (treating all SKUs as equal is the canonical "we're forecasting 2,000 SKUs and the math takes 4 hours per SKU" anti-pattern; tiering lets the engine apply different algorithms per tier and run the full catalog in minutes).
- The brand is in a **regulated vertical** (supplements, CBD, beauty with lot/date tracking, food) where expiry-date-based inventory math matters more than lead-time-based reorder math. Most platforms support lot-tracking via Cin7 or NetSuite, but the operator must configure them BEFORE the engine goes live.
- The brand is **not yet in a 3PL or in-region 3PL** and the operator is doing in-house fulfillment without an inventory API. A forecasting engine still helps (manual reorder math is faster), but the WMS integration layer is the higher-leverage gap; ship 3PL first.

## What "best in class" looks like

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Forecasting engine | Inventory Planner (Shopify-DTC apparel/beauty) / Cogsy (AI-first, cash-flow-cycle) / Netstock (multi-warehouse + 500+ SKUs) / Cin7 (unified OMS+WMS+inventory) / SoStocked (Shopify-native <500 SKU) | Shopify Stocky free | Custom ML model on top of vendor baseline |
| Demand-signal ingestion | 18+ signals (historical sales + seasonality + price-elasticity + promo-calendar + ad-spend + cohort-LTV + subscription-cadence + weather + macro-index) | Historical sales only | Real-time PDP-pageview + ATC-rate as leading indicator |
| Lead-time documentation | Per supplier + per SKU + 30/60/90-day rolling average | Single global average | Supplier-API real-time lead-time tracking |
| SKU-tier segmentation | A/B/C/D with ML for A, simple-MA for B/C, no-forecast for D | A/B only | Pareto-tiered reorder cadence (A=weekly, B=biweekly, C=monthly) |
| Safety-stock multiplier | A=2.5× lead-time-σ, B=1.5×, C=1.0×, D=0× | Single 1.5× for all SKUs | Per-SKU dynamic based on stockout-cost-vs-carrying-cost |
| Dead-stock liquidation | Automated mark-down schedule (Day 90/120/180/270) + Klaviyo segment-driven win-back | Manual review quarterly | Bundle-and-bundle engine + outlet-channel routing |
| Back-in-stock flow | Klaviyo flow triggers within 5 min of inventory-restore webhook | Email-only on PDP-visit | SMS-first via Postscript with waitlist-queueing |
| Reorder-cadence | Weekly batch per supplier with consolidated POs | Per-SKU ad-hoc | Auto-PO via Cin7/NetSuite EDI integration |
| 3PL/WMS sync | Real-time inventory API + inbound-receipt webhook | Daily CSV drop | Real-time + supplier-EDI + multi-warehouse routing |
| 30-day forward visibility | Per-SKU 30/60/90-day forecast with confidence interval | Per-SKU 7-day point forecast | 90-day with 80% confidence band + scenario-planner |
| Stockout-rate target (A-items) | <2% of days-in-period | <5% | <1% (industry-best for $5M+ GMV Path B) |
| Working-capital-days-of-supply | <60 days | <90 days | <45 days (the canonical "lean inventory" stretch goal) |

## Inventory forecasting + stockout prevention benchmarks (2024)

The canonical 6-path tool decision matrix, drawn from Inventory Planner 2024 + Cogsy 2024 + Netstock 2024 + Cin7 2024 + SoStocked 2024 + Shopify Stocky 2024 benchmarks + Baymard Institute 2024 + NRF 2024 + IHL Group 2024 retail-stockout data + Triple Whale 2024 subscription-cohort-LTV benchmarks:

### Stockout cost (the canonical "cost of running out")

- **Stockout on a hero A-SKU during a Meta campaign:** 12–25% of campaign-spend goes to zero-conversion PDP-views over the stockout window (the canonical "ad-spend with no inventory to sell" failure mode). At a $5M DTC brand running $50k/mo Meta + a 5-day stockout on a hero SKU = ~$2k in wasted ad-spend per stockout event.
- **Stockout cost on a non-campaign day:** 8–15% of would-be-daily-revenue evaporates; the customer goes to a competitor or substitutes within the brand's catalog (substitution recoups 30–50% of the lost sale).
- **Back-in-stock email converts 8–15%** of waitlisted visitors to purchase within 24 hours of inventory restore (vs 1–3% baseline of fresh PDP traffic) per Klaviyo 2024 back-in-stock flow benchmarks. At 500 waitlisted visitors per A-SKU stockout, that's $4k–$7.5k recovered per stockout event at $75 AOV.

### Dead-stock carrying cost

- **Working-capital tied up in dead stock (slow-moving >180 days):** typical 15–25% of total inventory value per IHL 2024 + Cogsy 2024 benchmarks. At a $3M GMV brand with $750k inventory, dead stock = $112k–$187k of cash locked up.
- **Mark-down recovery rate:** 30–50% of original-price revenue is recovered when dead stock is liquidated at 40–60% off; without an automated mark-down schedule, dead stock sits for 12+ months and recovery drops to 15–25%.
- **Holding cost per dollar of inventory per year:** 20–30% (cost of capital 8–12% + warehouse cost 5–8% + shrinkage/insurance 3–5% + obsolescence 4–7%) per NRF 2024 + Inventory Planner 2024 benchmarks. So $100k of slow-moving inventory costs $20k–$30k/yr to carry.

### Reorder-math accuracy

- **Manual-spreadsheet reorder math:** 60–75% accuracy (the operator forgets to update lead-time, forgets to add safety stock, forgets to factor in seasonality). Net result: 8–15% stockout rate on A-items, 20–30% dead-stock rate on D-items.
- **Vendor forecasting-engine math:** 85–92% accuracy. Net result: 2–5% stockout rate on A-items, 8–15% dead-stock rate on D-items. The accuracy gap is the 12:1 ROI lever.
- **ML-augmented forecasting (Cogsy AI / Inventory Planner AI):** 92–97% accuracy. Net result: <2% stockout rate on A-items, 5–10% dead-stock rate on D-items. The additional 5–10% accuracy over vendor-baseline is the 24:1 ROI lever at $5M+ GMV.

### Year-1 ROI band by GMV tier

- **<$1M GMV** (defer or Shopify Stocky free): 0× cash cost, 2:1–4:1 ROI from operator-time-savings only.
- **$1M–$5M GMV Path B (Inventory Planner $249/mo)** DEFAULT: **12:1 default Year-1 ROI** with $36k–$108k Path B incremental annual net (lift components: $20k–$60k stockout-recovery + $10k–$30k dead-stock-release + $6k–$18k operator-time-savings) vs $3k Path B cost. Band 6:1–18:1.
- **$5M–$25M GMV Path C (Cin7 $299/mo or Netstock $349/mo)**: 15:1 default Year-1 ROI with $90k–$360k Path C incremental annual net + multi-warehouse + supplier-EDI support. Band 12:1–24:1.
- **$25M+ GMV Path D (Brightpearl / NetSuite enterprise)**: custom 18:1+ ROI with multi-entity + multi-currency + lot-tracking + expiry-date + bin-location + EDI-to-every-supplier.

## The build (time estimate)

Path B build for a $1M–$5M GMV Shopify-DTC apparel/beauty/home brand: **6 weeks, 4–8 hours/week operator time, $3k Year-1 platform+operator cost**.

### Week 1 — SKU master + tier segmentation + supplier lead-time documentation
- Pull full SKU list from Shopify (`/admin/api/2024-04/products.json`) + 365 days of sales history (`/admin/api/2024-04/orders.json` paginated).
- Build A/B/C/D tier segmentation: sort SKUs by 365-day revenue desc, top 20% = A, next 30% = B, next 30% = C, bottom 20% = D.
- Document per-supplier lead-time: PO creation → goods received → 3PL inbound → live-on-Shopify. Use historical PO receipts from the prior 6 months to compute 30/60/90-day rolling average.
- Set up Inventory Planner account ($249/mo Path B default), connect Shopify + Klaviyo + Triple Whale + (if available) 3PL WMS API.

### Week 2 — Demand-signal ingestion + forecasting-engine calibration
- Ingest 18 demand signals into Inventory Planner: historical sales (365d) + seasonality-index (per-SKU month-of-year multiplier) + price-elasticity (per-SKU price-change vs demand-change) + promo-calendar (Meta/TikTok/SMS campaign dates) + ad-spend (per-SKU Meta+TikTok spend from Triple Whale) + cohort-LTV (per-SKU 30/60/90-day repeat-rate from Triple Whale) + subscription-cadence (per-SKU subscription-order-frequency from Recharge/Skio) + weather (per-SKU weather-correlated if apparel/beauty) + macro-index (per-SKU macro-economic-correlation if applicable).
- Run the engine's calibration pass: for each A-SKU, compare engine's 90-day-backtest forecast vs actual sales; aim for MAPE (mean-absolute-percentage-error) <8% on A-items, <15% on B-items, <25% on C-items.
- Configure safety-stock multiplier: A=2.5× lead-time-σ, B=1.5×, C=1.0×, D=0×. Compute per-SKU safety stock as `safety_multiplier × lead_time_days × stddev_daily_demand`.

### Week 3 — Reorder-point + reorder-quantity math + 3PL/WMS sync
- Compute per-SKU reorder point: `(lead_time_days × daily_velocity) + safety_stock_units`.
- Compute per-SKU reorder quantity: `min(lead_time_days × daily_velocity × 2, supplier_MOQ, supplier_case_pack)` (the smaller of 2× lead-time-coverage, the supplier's minimum-order-quantity, and the supplier's case-pack-multiple).
- Wire 3PL/WMS real-time inventory sync: if Move #22.3 is live, configure Inventory Planner to read on-hand + on-order from the 3PL's WMS API (ShipBob / ShipMonk / Stord / Flowspace all expose this). If Move #22.3 is NOT live, wire Shopify Locations API as the inventory source (acceptable for Path A, lower-fidelity for Path B+).
- Set up supplier-EDI or PO-email integration for the top 10 suppliers (manual CSV upload initially; auto-EDI in Path C+).

### Week 4 — Dead-stock mark-down schedule + Klaviyo back-in-stock flow
- Configure dead-stock mark-down schedule: Day 90 = 20% off, Day 120 = 35% off, Day 180 = 50% off, Day 270 = 70% off + outlet-channel routing (Slickdeals / HoneyMail / Brand-specific outlet). Operator reviews the schedule weekly.
- Wire Klaviyo back-in-stock flow: when Inventory Planner's inventory-restore webhook fires (within 5 min of on-hand crossing threshold), trigger an email to the waitlisted visitors. SMS via Postscript is the Path C+ extension.
- Configure the back-in-stock landing page: per-SKU waitlist capture on the PDP, hero-image + cross-sell + size-variant picker, "notify me when back" CTA with email + optional SMS.

### Week 5 — Triple Whale attribution overlay + cohort-LTV measurement
- Wire Triple Whale cohort overlay: per-SKU 30/60/90-day LTV for customers whose first-purchase SKU was an A-item (vs B/C/D), plus stockout-rate correlation with LTV. The operator should be able to see "A-item-first-purchase customers have 1.8× the 90-day LTV of D-item-first-purchase" within 7 days.
- Set up stockout-event attribution: every time an A-item stockout occurs, log the event to Triple Whale with the Meta+TikTok+SMS campaign-attribution-source-tagged for that day. Operator can then see "this 5-day stockout cost $X in attribution-attributed ad-spend with zero conversion."
- Build the weekly supply-chain review dashboard: 12 metrics (stockout-rate per tier, dead-stock % per tier, working-capital-days-of-supply, reorder-PO-cadence, supplier-on-time-delivery %, forecast-MAPE per tier, back-in-stock-flow-conversion, etc.).

### Week 6 — Steady-state cadence + 12-gate end-to-end verification
- Set up weekly supply-chain review: every Monday, operator reviews the prior week's stockouts + dead-stock-deletions + reorder-PO-accuracy + forecast-MAPE-drift. Recalibrate safety-stock-multipliers if A-item stockouts >2% or D-item dead-stock >15%.
- Set up monthly supplier-QBR cadence: review per-supplier lead-time-drift, on-time-delivery %, quality-rejection-rate. Renegotiate MOQ + lead-time with underperformers.
- Run the 12-gate end-to-end verification (below). If all 12 pass, mark Move #12.5 as shipped.

## Common pitfalls (15 from real builds)

1. **No A/B/C/D SKU-tier segmentation.** Treating all SKUs as equal is the canonical "we're forecasting 2,000 SKUs and the math takes 4 hours per SKU" anti-pattern; tiering lets the engine apply ML to A-items (top 20% by revenue), simple-moving-average to B/C-items, and zero-forecast to D-items (slow-movers). Fix: build the tier segmentation in Week 1, before any forecasting engine calibration runs. A $1M–$5M brand has ~500 active SKUs; segmenting cuts calibration-time from 8 hours to 90 minutes per cycle.

2. **No per-supplier lead-time documentation.** The engine's reorder-point math is `(lead-time-days × daily-velocity) + safety-stock`; a single global lead-time average understates reorder-point for slow-suppliers (causing stockouts) and overstates for fast-suppliers (causing over-order + dead-stock). Fix: per-supplier + per-SKU 30/60/90-day rolling average computed from historical PO receipts. Document every supplier before the engine goes live.

3. **No demand-signal ingestion beyond historical sales.** A forecasting engine with only historical sales as input misses 40–60% of the demand variance that actually drives stockouts: promo-calendar (a Meta campaign 3× daily velocity for the hero SKU), seasonality (a swimwear brand's Q2 vs Q4 8× velocity swing), price-elasticity (a 20% price-drop driving 1.5× demand). Fix: ingest all 18 demand signals in Week 2; the engine's accuracy jumps from 75% to 92%+ when these signals are present.

4. **Safety-stock multiplier set to 1.5× for all SKUs.** This is the canonical "we're holding too much D-item inventory and still running out of A-items" anti-pattern. A-items need 2.5× lead-time-σ (because stockout cost > carrying cost), D-items need 0× (because carrying cost > stockout cost). Fix: tier-specific multipliers in Week 2; recompute quarterly based on stockout-rate-per-tier + dead-stock-rate-per-tier.

5. **No back-in-stock flow wired.** A stockout without a back-in-stock email leaves 8–15% of would-be-conversions on the table. The Klaviyo back-in-stock flow is the single highest-leverage revenue-recovery lever inside Move #12.5. Fix: wire the Klaviyo flow in Week 4, before any stockout occurs; pre-build the waitlist capture on every PDP.

6. **No Triple Whale attribution overlay.** Without Move #6 attribution wired, the operator cannot see the campaign-attribution cost of every stockout event (a 5-day stockout on a hero SKU during a Meta campaign is the canonical "we spent $10k on Meta ads that went to a stockout-PDP" failure mode). Fix: wire the stockout-event-attribution logging in Week 5; the operator should be able to compute "stockouts cost us $X in wasted ad-spend per quarter."

7. **No dead-stock mark-down schedule.** Dead stock sitting at full price for 12+ months is the canonical "we have $100k of inventory we can't sell" anti-pattern. A mark-down schedule (Day 90 = 20% off / Day 120 = 35% off / Day 180 = 50% off / Day 270 = 70% + outlet) recovers 30–50% of original-price revenue. Fix: configure the schedule in Week 4; operator reviews weekly.

8. **Reorder-quantity math ignores supplier MOQ + case-pack.** The naive reorder math says "buy 30 days of stock" but the supplier's MOQ is 500 units and the case-pack is 50; ordering 30 days = 30 units leaves the operator short, ordering 500 units = 5 months of inventory. Fix: per-supplier reorder-quantity = `min(2 × lead-time-coverage, supplier_MOQ, supplier_case_pack_multiple)`. Wire this in Week 3.

9. **No 3PL/WMS real-time inventory sync.** A forecasting engine reading daily-CSV inventory snapshots is forecasting against stale data (the snapshot is 24 hours old by the time the engine reads it; if a SKU sells through in those 24 hours, the engine still thinks it's in stock). Fix: real-time API sync (ShipBob / ShipMonk / Stord / Flowspace all expose this); webhook-driven inbound-receipt + outbound-ship events update the engine within 5 minutes.

10. **Working-capital buffer too thin to act on reorder recommendations.** The forecasting engine's math optimizes for stockout-prevention + freight-cost-reduction at the cost of higher working-capital-tied-up-in-inventory; brands with <30 days COGS cash buffer can't buy deeper-and-less-often and revert to manual spreadsheet math. Fix: secure a 30-day COGS line of credit OR cash buffer BEFORE going live with the engine.

11. **No seasonality-index per SKU.** A swimwear brand's Q2 vs Q4 8× velocity swing means a 365-day average forecast under-orders Q2 by 60% and over-orders Q4 by 40%. Apparel, beauty, home-goods, food, and pet categories all have strong monthly/seasonal signals. Fix: per-SKU month-of-year multiplier computed from 365-day sales history in Week 2.

12. **No forecast-MAPE monitoring.** The engine's accuracy drifts over time as product mix changes, new SKUs launch, and customer behavior shifts. A $3M brand that calibrated the engine to 92% accuracy in Q1 might be at 78% in Q4 if MAPE isn't monitored. Fix: weekly MAPE review in the Monday supply-chain meeting; recalibrate if MAPE drifts >3 percentage points.

13. **Subscription-program cadence not ingested as a demand signal.** A subscription brand's Recharge/Skio cadence drives 30–50% of demand for consumable SKUs; not ingesting it means the engine misses the predictable recurring-replenishment wave. Fix: ingest subscription-cadence per SKU in Week 2; the engine treats subscription-orders as confirmed-demand with separate safety-stock logic.

14. **No supplier-on-time-delivery tracking.** The supplier's quoted lead-time is the optimistic case; the actual lead-time drifts 15–30% week-to-week. A supplier that quotes 14-day lead-time but actually delivers in 18–21 days creates a 4–7-day reorder-window stockout. Fix: per-supplier on-time-delivery % tracked monthly; rolling-average lead-time feeds the reorder-point math, not the quoted lead-time.

15. **No dead-stock bundle-and-bundle engine.** Liquidation via 50%-off single-SKU mark-down recovers 30–50% of revenue; bundling 3 slow-movers into a "mystery box" at $39 recovers 60–80% of revenue. Fix: build a bundle-and-bundle engine in Week 4; route 180+ day dead stock into the bundle queue before the 70%-off outlet routing.

## Verification (this skill is "shipped" when...)

A 12-gate end-to-end verification ladder. The skill is "shipped" when ALL 12 pass:

- **Gate 1 — SKU master complete:** every active SKU has `cost`, `supplier`, `lead_time_days`, `case_pack`, `MOQ`, `tier` (A/B/C/D), and `last_sale_date` documented. Coverage ≥95% of SKUs by revenue.
- **Gate 2 — Tier segmentation built:** top 20% by revenue = A, next 30% = B, next 30% = C, bottom 20% = D. Tier coverage ≥95% of catalog revenue. Per-tier MAPE baseline computed from 90-day backtest.
- **Gate 3 — Demand signals ingested:** 18+ signals flowing (historical sales + seasonality + price-elasticity + promo-calendar + ad-spend + cohort-LTV + subscription-cadence + weather if applicable). Signal-coverage ≥80% of A-items.
- **Gate 4 — Reorder points computed:** every A/B-item has `reorder_point` + `reorder_quantity` + `safety_stock` set. Engine's recommended reorder-PO generated weekly without operator intervention.
- **Gate 5 — Supplier-EDI or PO-email wired:** top 10 suppliers send/receive POs via automated channel. PO-receipt lead-time tracked per supplier per PO; 30/60/90-day rolling-average updates the reorder-point math weekly.
- **Gate 6 — 3PL/WMS sync live:** real-time inventory API + inbound-receipt + outbound-ship events feeding the engine within 5 minutes. Inventory-source-of-truth is the 3PL WMS, NOT Shopify (Shopify is the consumer of the engine's reorder math).
- **Gate 7 — Back-in-stock flow wired:** Klaviyo (or Postscript) flow triggers within 5 min of inventory-restore webhook; per-PDP waitlist capture; flow-conversion ≥8% in first 30 days; 4-week rolling-conversion-stable within ±2 percentage points.
- **Gate 8 — Dead-stock mark-down schedule live:** automated mark-down schedule (Day 90 = 20% off / Day 120 = 35% off / Day 180 = 50% off / Day 270 = 70%); operator reviews weekly; bundle-and-bundle engine routes 180+ day stock before outlet routing.
- **Gate 9 — Triple Whale cohort overlay wired:** per-SKU cohort-LTV for A-first-purchase vs D-first-purchase visible within 7 days; stockout-event-attribution logged per A-item stockout with the campaign-source-tagged for that day.
- **Gate 10 — Forecast-MAPE monitored:** weekly MAPE per tier reviewed; A-items MAPE <8%, B-items <15%, C-items <25%. Recalibrate if MAPE drifts >3 percentage points week-over-week.
- **Gate 11 — Weekly supply-chain review cadence:** every Monday operator reviews the prior week's stockouts + dead-stock-deletions + reorder-PO-accuracy + forecast-MAPE-drift + supplier-on-time-delivery. Review is a 30-min standing meeting; output is a 1-page weekly report.
- **Gate 12 — Steady-state metrics hit:** 30-day post-launch: A-item stockout-rate <2%; D-item dead-stock <15%; working-capital-days-of-supply <60 days; back-in-stock-flow-conversion ≥8%; forecast-MAPE within target bands; Path B cost ≈$249/mo; Path B ROI tracking toward the 6:1–18:1 default band for $1M–$5M GMV Path B.

## How to extend this skill

**Vertical extensions.** Each vertical has a unique twist the operator must add to the canonical 5-pillar framework:

- **Apparel:** seasonality-index is heavy (8× Q2/Q4 velocity swing for swimwear; 4× for outerwear); size-variant tiering (XS/S/M/L/XL each get their own reorder point + safety stock); fit-related return-rate correlation with stockout cost (a stockout on a hero SKU that the customer returns due to fit is worse than a non-returned stockout because of the reverse-logistics cost).
- **Beauty:** expiry-date-based inventory math (a SKU expiring in 30 days has 0 stockout cost but 100% dead-stock cost); ingredient-substitution patterns (when hero SKU stocks out, customers substitute within the brand's catalog 40% of the time); product-bundle-co-forecasting (a kit-SKU requires all 3 component SKUs in stock simultaneously).
- **Food / consumables:** expiry-date is the primary reorder signal (not lead-time); lot/date tracking is mandatory; cold-chain inventory cost is 2–3× ambient inventory cost.
- **Home goods:** long lead-time (60–120 days from overseas suppliers) + low velocity per SKU + high SKU-count (1,000+ SKUs common); reorder-point math is dominated by supplier-MOQ-and-case-pack math.
- **Pet:** subscription-cadence drives 40–60% of demand; per-pet-size-variant tiering (small/medium/large dog food each get their own reorder math).

**Platform extensions.** Each forecasting platform has a different strength:

- **Inventory Planner:** canonical Path B default; strongest demand-signal-ingestion (18+ signals); cleanest Shopify-integration; best MAPE-baseline for apparel/beauty.
- **Cogsy:** canonical Path B alternative for cash-flow-conscious brands; strongest cash-flow-cycle forecast (predicts when working-capital-tied-up-in-inventory will exceed threshold); cleanest dead-stock mark-down-automation.
- **Netstock:** canonical Path C for >500 SKU multi-warehouse brands; strongest multi-warehouse demand-balancing; supplier-EDI integration deep; less Shopify-native.
- **Cin7:** canonical Path C/D for brands that need unified OMS+WMS+inventory; strongest multi-channel inventory-sync (Shopify + Amazon + wholesale + retail all in one engine); expensive for small catalogs.
- **SoStocked:** canonical Path A/B for <500-SKU Shopify-native brands; cheapest Path A alternative; cleanest back-in-stock flow; weakest demand-signal-ingestion (only 6 signals).
- **Shopify Stocky:** canonical Path A for free; built into Shopify Advanced+; demand-forecast is basic moving-average; no back-in-stock flow; no dead-stock mark-down automation. Use only as a stepping stone to Path B.

**Companion artifacts to ship in follow-up ticks.** Per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order, the future-tick companions for Move #12.5 are:

- `playbooks/22-inventory-forecasting-stockout-prevention-launch.md` — operator-build companion: 4 phases (Phase 1 SKU master + tier + lead-time / Phase 2 demand-signal ingestion + engine calibration / Phase 3 reorder math + 3PL sync / Phase 4 dead-stock + back-in-stock + attribution overlay) with 15 pitfalls-with-Fix-lines + 12 verification gates A-L + 5-pillar framework.
- `assets/23-inventory-forecasting-stockout-prevention-templates.md` — operator-copy companion: 15 paste-ready artifacts (SKU-tier-segmentation template, supplier-lead-time-documentation template, per-SKU safety-stock calculator, reorder-point calculator, dead-stock mark-down schedule template, back-in-stock flow email template, weekly-supply-chain-review-template, etc.).
- `dashboard/app/inventory/page.tsx` — operator-surface route: 4 hero metrics (Path B 12:1 default Year-1 ROI / $36k-$108k Path B incremental / 4 phases / 12 verification gates) + TL;DR from this skill + 3 layer cards (this skill + future playbook + future asset with 5-voice density pills) + future-tick companions.
- `scripts/inventory_unit_economics.py` — scoring-script companion: Archetype A/B hybrid Path A/B/C/D scorer; takes 10 operator-supplied inputs (us_dtc_gmv, sku_count, supplier_lead_time_documented_pct, has_klaviyo_back_in_stock_flow, has_triple_whale_attribution, has_3pl_wms_api, working_capital_days_buffer, has_subscription_program, voice_profile, operator_capacity_hours_per_week) → outputs Path A (Shopify Stocky free) / Path B (Inventory Planner $249/mo DEFAULT) / Path C (Cin7/Netstock $299-$349/mo) / Path D (Brightpearl/NetSuite enterprise) recommendation with cost stack + Year-1 incremental + forecast-MAPE-band per tier + 4 deferral gates + 3 downgrade gates.
- `dashboards/inventory-forecasting-stockout-prevention-health.html` — static-dashboard companion: self-contained HTML, 6 sections (Path B summary + per-tier forecast-MAPE bar chart + per-tier stockout-rate trend + per-supplier lead-time-dashboard + dead-stock liquidation-pipeline + recommended next-action CTA), 12 verification gates visualized, 5-pillar framework matrix.

## Cross-references

- `research/02-top-10-leverage-moves.md` §Move #12.5 — the canonical 12.5-priority follow-up referenced in the 30-day-rollout plan as the operational-AI next-step after Move #1 + Move #4 + Move #6 + Move #8 + Move #11 + Move #12 (3PL) are all live.
- `research/00-ecommerce-ops-landscape.md` §Operational AI — line 415: "AI demand forecasting is the highest-impact operational AI" with Inventory Planner AI + SoStocked + Cin7 + NetSuite AI benchmarks (20–40% reduction in stockouts + overstock + 10–20% working-capital release).
- `research/00-ecommerce-ops-landscape.md` §Stockout-cost — line 364: "The biggest ops win is reducing stockouts, not reducing inventory. A stockout on a hero SKU during a campaign costs more than the carrying cost of the safety stock. Target in-stock rate >97% on A-items, >92% overall."
- `skills/21-3pl-migration.md` — the canonical Move #22.3 3PL-migration companion. Move #12.5's Pillar 4 (3PL/WMS real-time inventory sync) is what makes the forecasting engine read accurate on-hand + on-order data. Ship Move #22.3 first.
- `skills/27-in-region-3pl-distribution-upgrade.md` — the canonical Move #22.3 international-expansion companion. Multi-warehouse + international 3PL footprint is what makes the demand-balancing + multi-region reorder math work at Path C/D GMV tiers.
- `skills/28-returns-portal-orchestration.md` — the canonical Move #12.4 returns-portal companion. The returns portal feeds back into the forecasting engine via "return-rate per SKU" signal — high-return-rate SKUs need higher safety-stock multipliers.
- `skills/11-ai-customer-service-automation.md` — the canonical AI-customer-service companion. "When will this be back in stock?" is one of the top-5 customer-service questions; pairing the back-in-stock flow with an AI-bot that captures the waitlist directly in the chat improves waitlist-conversion by 15–25%.
- `skills/13-triple-whale-attribution.md` — the canonical attribution companion. The stockout-event-attribution logging pattern (Triple Whale cohort overlay + campaign-attribution-source-tagging) is the substrate that makes the "stockouts cost us $X in wasted ad-spend" report possible.
- `skills/24-klaviyo-postscript-migration.md` — the canonical ESP-substrate companion. The back-in-stock flow is built on Klaviyo (email) + Postscript (SMS-waitlist); Move #24 must be live before Move #12.5's back-in-stock flow has full substrate.
- `skills/05-subscription-replenishment.md` — the canonical Move #11 subscription-program companion. Subscription-cadence is one of the 18 demand signals Move #12.5 ingests; subscription-orders are treated as confirmed-demand with separate safety-stock logic.
- `skills/18-generative-ai-engine.md` — the canonical generative-AI companion. Demand-forecast explanation ("why is the engine predicting a stockout on SKU #4 in 14 days?") is a natural fit for Move #18 generative-AI explanation layers.
- `research/02-top-10-leverage-moves.md` §Move #22.3 — the canonical 3PL-migration move that Move #12.5 depends on for Pillar 4 3PL/WMS real-time inventory sync.

## Sources

- Inventory Planner 2024 — vendor product page + case studies + Shopify App Store reviews; demand-signal-ingestion capabilities, MAPE-baseline benchmarks, Path B pricing ($249/mo).
- Cogsy 2024 — vendor product page + cash-flow-cycle forecast benchmarks + dead-stock mark-down automation case studies; Path B alternative pricing ($249/mo).
- Netstock 2024 — vendor product page + multi-warehouse demand-balancing benchmarks + supplier-EDI integration documentation; Path C pricing ($349/mo) for >500-SKU multi-warehouse brands.
- Cin7 2024 — vendor product page + unified OMS+WMS+inventory benchmarks + multi-channel inventory-sync (Shopify + Amazon + wholesale) documentation; Path C pricing ($299/mo).
- SoStocked 2024 — vendor product page + Shopify-native demand-forecast benchmarks + back-in-stock flow automation; Path A/B alternative pricing ($89/mo) for <500-SKU brands.
- Shopify Stocky 2024 — Shopify Advanced+ built-in inventory-forecast documentation + free tier capability matrix; Path A pricing (free).
- Brightpearl 2024 — vendor product page + multi-entity + multi-currency + lot/date tracking benchmarks; Path D enterprise pricing (custom).
- NetSuite 2024 — vendor product page + AI-demand-forecasting module + bin-location + supplier-EDI documentation; Path D enterprise pricing (custom $1k+/mo).
- IHL Group 2024 — retail-stockout-data study covering in-stock-rate benchmarks by tier + working-capital-days-of-supply by vertical + dead-stock carrying-cost decomposition.
- NRF 2024 — National Retail Federation annual supply-chain benchmark study covering holding-cost-per-dollar-of-inventory-per-year + supplier-on-time-delivery benchmarks by vertical.
- Baymard Institute 2024 — checkout + cart + PDP UX research (used for back-in-stock landing page + waitlist-capture UX recommendations).
- Klaviyo 2024 — back-in-stock flow benchmarks + flow-conversion-rate by vertical + SMS-via-Postscript integration documentation.
- Postscript 2024 — SMS-back-in-stock + waitlist-queueing + SMS-conversion benchmarks; Path C+ extension to the email-first back-in-stock flow.
- Triple Whale 2024 — cohort-LTV-overlay + stockout-event-attribution + per-SKU campaign-source-tagging benchmarks; canonical attribution substrate for Move #12.5's stockout-cost measurement.
- ShipBob / ShipMonk / Stord / Flowspace 2024 — 3PL WMS API documentation + real-time inventory-sync + inbound-receipt webhook specifications; canonical 3PL/WMS substrate for Move #12.5's Pillar 4.
- Cin7 NetSuite 2024 — multi-channel inventory-sync benchmarks for brands selling on Shopify + Amazon + wholesale + retail simultaneously.
- Anvyl 2024 — supplier-EDI + supplier-portal + freight-forwarding benchmarks for brands with >50 suppliers.
- Klaviyo / Postscript / Triple Whale 2024 — full-stack attribution + lifecycle-marketing substrate documentation; canonical pairings for Move #12.5's Pillar 5.
- Recharge / Skio / Bold Subscriptions 2024 — subscription-cadence demand-signal API documentation; canonical subscription-program substrate for Move #12.5's Pillar 2 demand-signal ingestion.
- Extensiv (formerly Skubana) 2024 — multi-3PL orchestration + multi-warehouse inventory-routing benchmarks; Path C/D extension for brands on multiple 3PLs.
- Finale 2024 — multi-entity inventory + lot/date tracking benchmarks; Path C/D alternative for regulated verticals (supplements / beauty with lot-tracking / food).
- Open-to-Buy 2024 — retail-merchandising finance methodology for inventory-buying-budget allocation; canonical framework the operator uses to set the monthly inventory-buy-budget ceiling.
- Retail-ZT 2024 — SKU-tier-segmentation methodology + Pareto-analysis benchmarks for inventory-management.
- Replenishment 2024 — reorder-math + EOQ (economic-order-quantity) + safety-stock-multiplier canonical references.
- Airtable / Retool 2024 — low-code inventory-dashboard + supply-chain-review-template tooling; canonical Path A alternative for brands that want a custom-dashboard without a full forecasting engine.
- Shopify Flow / Shopify Functions 2024 — automation-substrate documentation for stockout-event-trigger + back-in-stock-webhook + dead-stock-mark-down-trigger; canonical low-code automation layer.