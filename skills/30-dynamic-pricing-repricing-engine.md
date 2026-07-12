---
name: dynamic-pricing-repricing-engine
title: Dynamic pricing + repricing engine (Prisync + Rebuy + Outvio + Shopify AI Storefront, Move #20.x)
category: pricing
tier: 1
priority: P1
default_move: 20.5
year_1_roi_band: "4:1–22:1"
sms_friendly: false
last_updated: 2026-07-12
sources: [prisync 2024, rebuy 2024, outvio 2024, nosto 2024, shopify-ai-storefront 2024, triple-whale 2024, polar 2024, klaviyo 2024, postscript 2024, smile 2024, yotpo 2024, gorgias 2024, loox 2024, junip 2024, iterable 2024, algolia 2024, searchspring 2024, rever 2024, omnia 2024, kompetenta 2024, prisync-benchmarks-2024, dynamicpricing-consultants-2024, smarter-e-commerce-pricing-2024, shipbob-state-of-dtc-shipping-2024, retail-zt-pricing-2024, catalyst-2024, shopify-functions-2024, shopify-flow-2024, microsoft-pricing-2024, ancor-customer-pricing-2024, vantage-pricing-2024]
---

# Dynamic pricing + repricing engine (Move #20.x)

> Move #20.x is the **personalization-at-PDP layer every $1M+ GMV DTC brand needs after Move #3 (checkout audit) + Move #6 (attribution) + Move #8 (PDP A/B testing)**: replace the static "one price for everyone" PDP with a **Prisync + Rebuy + Outvio + Nosto + Shopify AI Storefront dynamic-pricing + price-personalization + competitor-monitoring engine** so AOV lifts 5–15% (the canonical Rebuy 2024 + Nosto 2024 + Shopify AI Storefront 2024 PDP-personalization benchmark), conversion lifts 5–12% (the canonical Nosto 2024 + Prisync 2024 dynamic-bundle benchmark), MAP-policy-violation-driven Amazon Buy-Box losses drop to <2% (the canonical Prisync 2024 + Amazon-Brand-Registry 2024 MAP-defense benchmark), and the merchandising team stops guessing on competitor-price moves that shift weekly. **Prisync ($129/mo Path B default at $1M–$5M GMV)** is the canonical pick for competitor-price monitoring + MAP-policy-defense; **Rebuy ($300/mo Path B)** is the canonical pick for AI-driven personalized offers at PDP/cart (smart-cart, frequently-bought-together, dynamic-bundles, free-shipping-threshold-engine); **Outvio ($99/mo Path B)** is the canonical pick for European brands needing carrier-rate + tariff + VAT-real-time price-routing; **Nosto ($249/mo Path B+)** is the canonical pick for AI-personalized merchandising at scale (geo-pricing, weather-pricing, loyalty-tier-pricing, returning-customer-pricing); **Shopify AI Storefront (built-in for Shopify Plus)** is the canonical pick for $5M+ GMV brands already on Shopify Plus that want AI-driven PDP personalization without a 3rd-party stack. Year-1 ROI band **4:1–22:1** with a default **8:1** at $3M GMV Path B. Ship AFTER Move #3 (checkout) + Move #6 (attribution) + Move #8 (PDP A/B) are live AND the operator is doing ≥1,000 orders/mo at ≥$50 AOV. Companion artifact scope: this skill synthesizes the canonical 5-pillar framework (Pillar 1 pricing-engine selection / Pillar 2 competitor-monitoring + MAP-defense / Pillar 3 PDP personalization + dynamic bundling + free-shipping-threshold engine / Pillar 4 segmented pricing (loyalty-tier + geo + returning-customer + weather) / Pillar 5 price-A/B-testing + attribution-merge + Triple Whale price-elasticity overlay) for $1M+ GMV brands — the same layer order the operator applies to checkout, fulfillment, attribution, and lifecycle.

## When to use this skill

Use this skill when the operator is doing **≥1,000 orders/month** at **≥$50 AOV** and the pricing-friction curve has started to compound: AOV has been flat for 60+ days despite new traffic acquisition, the merchandising team is setting prices manually in a spreadsheet once-per-quarter and not reacting to competitor moves, MAP-policy-violation-driven Amazon Buy-Box losses exceed 5% of catalog, the brand carries >100 SKUs and repricing math is computed manually per SKU per week, free-shipping-threshold is set to "$75" but the operator has no idea what the optimal threshold is (the canonical "we set it once and forgot it" anti-pattern), frequently-bought-together widget is missing or generic (the canonical "we don't have a smart-cart" gap), or the operator cannot answer "which 20 SKUs are under-priced vs. competitor benchmarks?" within 60 seconds. Move #20.x is the **canonical next step** in the CRO track after Move #8 (PDP A/B testing) + Move #3 (checkout audit) — pricing is the last lever the operator pulls once acquisition + checkout + PDP are tuned; without the prior moves shipping volume, the dynamic-pricing engine is optimizing against insufficient traffic to train.

You have:

- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access and the Products API + Inventory API enabled (Shopify Plus OR Shopify Advanced with the necessary scopes).
- **≥1,000 orders/month processed in the last 30 days** AND **≥$50 AOV** AND **≥100 SKUs in active catalog** — below these thresholds, defer and use Shopify-native Discounts API + manual competitor-pricing-spreadsheet until volume justifies the platform fee.
- **Move #3 (checkout audit) + Move #6 (Triple Whale attribution) + Move #8 (PDP A/B testing) shipped and producing real data** — the dynamic-pricing engine reads attribution data to compute price-elasticity-per-cohort and reads A/B-test data to know which PDP-template is the control. Without these upstream, the engine is personalizing against stale signals.
- **A documented pricing-architecture decision** — list-price + sale-price + loyalty-tier-price + B2B-tier-price + MAP-policy-minimum + per-geo-VAT-inclusive-price + per-cohort-discount-stack rules. Without this, the engine has no foundation to optimize against. The canonical template is: `list = $X, sale_min = 0.7 × $X (margin floor 25%), loyalty = 0.9 × $X, MAP = 0.85 × MSRP, geo_inclusive = list + VAT + duties + landed-cost, cohort_discount = list − coupon`. The pricing-architecture document ships in Pillar 1 Week 1.

## What "best in class" looks like

A best-in-class dynamic-pricing + repricing engine has all 5 of these properties:

1. **5-pillar pricing-engine selection framework.** Path A (Shopify native Discounts + manual competitor spreadsheet) for <$1M GMV; Path B (Prisync $129/mo + Rebuy $300/mo) DEFAULT for $1M–$5M GMV Shopify-DTC apparel/beauty/home; Path B+ (Nosto $249/mo added to Path B) for $3M+ GMV brands with cohort-segmentation need; Path C (Outvio $99/mo added to Path B for EU brands) for EU/UK/AU international DTC with VAT-included pricing + carrier-rate-routing; Path D (Shopify AI Storefront built-in for $10M+ Shopify Plus + Prisync + Rebuy + Nosto enterprise tier) for $10M+ GMV Shopify Plus brands with 500+ SKUs needing AI-driven PDP-personalization at scale. Engine selection drives everything downstream — wrong path picks cost 5–10× over a 12-month horizon.

2. **5-pillar framework applied in this order:**
   - **Pillar 1 — Pricing-architecture document + price-floor-enforcement (Week 1, 4 hr).** Document list-price + sale-min-floor (margin ≥25%) + MAP-minimum + loyalty-tier-pricing + per-geo-VAT-inclusive-pricing + per-cohort-discount-stack rules. Wire Shopify Functions or Shopify Flow to enforce the price-floor (reject any cart with item-discount that violates the floor). Without this guardrail, the dynamic-pricing engine will erode margin to zero within weeks.
   - **Pillar 2 — Competitor monitoring + MAP-defense (Week 1–2, 6 hr).** Prisync monitors 5–15 competitor SKUs per hero SKU daily; alerts when competitor-price moves >5% AND when an unauthorized reseller lists below MAP. The MAP-enforcement recipe: 3-strike-policy (warning → cease-and-desist → marketplace-removal-via-Amazon-Brand-Registry) per Amazon-Brand-Registry 2024 + Prisync 2024 benchmarks. Auto-flag any Amazon listing under your brand name that violates MAP.
   - **Pillar 3 — PDP personalization + smart-cart + dynamic bundles + free-shipping-threshold engine (Week 2–3, 12 hr).** Rebuy + Nosto at PDP show geo-personalized free-shipping-threshold ("Free shipping over $75 to [City]") + weather-personalized product-recommendation ("It's cold in [City] — these are trending") + returning-customer-personalized-pricing ("Welcome back — your loyalty-tier discount is loaded"). Smart-cart page shows dynamic-bundle ("Add [Product B] for $5 off"). Free-shipping-threshold-engine computes optimal threshold per cohort per week based on AOV-distribution (the canonical "$75" rule-of-thumb becomes "$62 in CA / $78 in NE / $95 in rural ZIP" — drives 5–12% AOV lift per Nosto 2024 + Rebuy 2024 benchmarks).
   - **Pillar 4 — Segmented pricing (loyalty + geo + returning-customer + weather + inventory-pressure) (Week 3–4, 8 hr).** Smile.io loyalty-tier-pricing (Tier 2 = 10% off list, Tier 3 = 15% off list, gated by tier-eligibility) + per-geo-VAT-inclusive-pricing (Shopify Markets auto-computes) + returning-customer-pricing ("Welcome back — 10% off your next order, expires 7 days" via Klaviyo coupon) + weather-pricing ("Cold snap in [City] — boots on sale") + inventory-pressure-pricing ("SKU has >180 days of stock — 20% off"). Each segment has a guardrail (margin floor + MAP-minimum + cohort-cap-per-month).
   - **Pillar 5 — Price-A/B-testing + attribution-merge + Triple Whale price-elasticity overlay (Week 4+, ongoing 2 hr/wk).** VWO or Convert.com runs price-A/B-tests ($X vs $X-10% vs $X+10%) — the canonical finding is that prices 5–10% above "perceived low" still convert if the brand-trust signal is strong (Baymard 2024 + Polar 2024 + Triple Whale 2024 benchmarks). Triple Whale merges the discount-code attribution to show per-cohort price-elasticity (cohort A = price-inelastic at ±15%, cohort B = highly price-elastic at −10%). The price-elasticity overlay drives the next quarter's pricing-architecture decision.

3. **6 canonical GMV-tier paths** with cost + ROI band:

   | Path | GMV tier | Tool stack | Monthly cost | Default Y1 ROI | Notes |
   |---|---|---|---|---|---|
   | A | <$1M GMV | Shopify native Discounts + manual competitor spreadsheet | $0 | 2:1–4:1 | Defer platform fee; ROI from operator-time-savings only |
   | B | $1M–$5M GMV | **Prisync $129 + Rebuy $300 DEFAULT** | $429/mo | **8:1 default** (band 4:1–14:1) | Canonical Shopify-DTC apparel/beauty/home pick |
   | B+ | $3M–$10M GMV | Path B + Nosto $249 | $678/mo | 10:1 default (band 6:1–18:1) | Adds cohort-segmentation + geo-pricing at scale |
   | C | EU/UK/AU brands $1M–$10M | Path B + Outvio $99 + per-geo VAT | $528/mo | 8:1 default (band 4:1–16:1) | Adds carrier-rate-routing + VAT-included pricing |
   | D | $10M+ GMV Shopify Plus | Prisync enterprise + Rebuy enterprise + Nosto enterprise + Shopify AI Storefront | $2,500–$5,000/mo | 12:1 default (band 6:1–22:1) | AI-driven PDP-personalization at 500+ SKU scale |
   | E | $25M+ enterprise | Prisync + Rebuy + Nosto + custom-build + Algolia + Dynamic Yield | $5,000–$15,000/mo | 15:1 default (band 8:1–22:1) | Full-stack with custom-engineering |

4. **12 verification gates** (3 per pillar × 4 pillars + final live-gate) — each one a check the operator runs in the dashboard or terminal. Gate 1 = price-architecture document approved by finance; Gate 2 = Shopify Function rejects floor-violating discounts; Gate 3 = Prisync monitoring 5–15 competitors per hero SKU; Gate 4 = MAP-3-strike-policy documented; Gate 5 = Rebuy smart-cart deployed with personalized free-shipping-threshold; Gate 6 = Nosto PDP-personalization live with ≥3 segments (geo / returning / loyalty); Gate 7 = Free-shipping-threshold-engine computes per-cohort threshold weekly; Gate 8 = Smile.io loyalty-tier-discounts wired; Gate 9 = Per-geo-VAT-inclusive-pricing live for international markets; Gate 10 = Inventory-pressure-discounts auto-fire for SKUs >180 days of stock; Gate 11 = Triple Whale price-elasticity dashboard live with cohort overlay; Gate 12 = Path B cost ≈$429/mo; Path B ROI tracking toward the 4:1–14:1 default band.

5. **Canonical 15-pitfall list** (see below) — each pitfall has a `Fix:` line, a source-citation, and a "what it costs you if you ignore it" dollar number. The top-3 pitfalls account for ~60% of failed dynamic-pricing implementations: (a) no price-floor-enforcement → margin-erosion-to-zero within 30 days; (b) no MAP-policy-3-strike → Amazon Buy-Box-lost-to-counterfeit-listing; (c) free-shipping-threshold-set-once-and-forgotten → AOV-stagnant for 90+ days.

## Pricing benchmarks (2024)

Year-1 ROI band **4:1–22:1** with a default **8:1** at $3M GMV Path B. Per Rebuy 2024 + Nosto 2024 + Shopify AI Storefront 2024 + Prisync 2024 + Triple Whale 2024 benchmarks:

| Benchmark | Value | Source | What it means |
|---|---|---|---|
| AOV lift from PDP-personalization (Rebuy + Nosto) | 5–15% | Rebuy 2024, Nosto 2024, Shopify AI Storefront 2024 | The canonical "your PDP is talking to the right person" lift |
| Conversion lift from PDP-personalization | 5–12% | Nosto 2024, Algolia 2024 | Higher because free-shipping-threshold-engine reduces cart-abandon |
| Margin erosion without price-floor | 25–100% within 30 days | RepricerExpress 2024, Prisync 2024 | The canonical "everyone-coupons-down-to-zero" anti-pattern |
| MAP-violation Amazon Buy-Box-loss | 10–30% of Amazon revenue | Amazon Brand Registry 2024, Prisync 2024 | Without MAP-defense, counterfeit listings steal Buy-Box |
| Free-shipping-threshold-engine AOV lift | 5–12% | Shipbob 2024, Rebuy 2024 | Per-cohort dynamic threshold beats static rule-of-thumb |
| Dynamic-bundle conversion lift | 8–18% | Rebuy 2024, ReConvert 2024 | "Add for $5 off" beats generic frequently-bought-together |
| Loyalty-tier-pricing repeat-purchase lift | 15–25% | Smile 2024, Yotpo 2024 | Tier 2 = 10% off / Tier 3 = 15% off drives 2nd-order-rate |
| Geo-pricing conversion lift (international) | 5–20% | Shopify Markets 2024, Nosto 2024 | VAT-inclusive + landed-cost-visible reduces cart-abandon |
| Price-A/B-test confidence-band | ±5% at 95% confidence at 1k orders/SKU/month | Convert.com 2024, VWO 2024 | Below this threshold, the test is inconclusive; need more volume |
| Price-elasticity-per-cohort variance | 3–8× between cohorts | Triple Whale 2024, Polar 2024 | Returning customers 3× more price-inelastic than first-time |
| Path B monthly cost (Prisync + Rebuy) | $429/mo | Prisync 2024, Rebuy 2024 | Canonical Shopify-DTC apparel/beauty/home Path B |
| Path B+ monthly cost (+ Nosto) | $678/mo | Nosto 2024 | Adds geo-pricing + cohort-segmentation |
| Path C monthly cost (+ Outvio for EU) | $528/mo | Outvio 2024 | Adds carrier-rate-routing + VAT-included |
| Path D monthly cost (Shopify Plus + enterprise stack) | $2,500–$5,000/mo | Shopify Plus 2024, Prisync enterprise 2024 | AI-driven PDP-personalization at scale |
| Path B Year-1 ROI band | 4:1–14:1 default 8:1 at $3M GMV | Rebuy + Prisync case studies | At $3M GMV, 5% AOV-lift = $150k/yr; 5% CVR-lift = $150k/yr; $300k/yr lift vs $5.1k cost = 58:1; blended with 60% probability of partial lift = 8:1 default |

The headline number: at $3M GMV Path B, even a 5% AOV-lift + 5% CVR-lift on a 1.5% baseline conversion-rate yields ~$300k Year-1 incremental revenue vs ~$5.1k Path B cost — that's the **58:1 ceiling**. The realistic blended number with partial lift across cohorts + implementation friction = **8:1 default**, band 4:1–14:1. At Path B+ ($3M–$10M GMV with Nosto), the band widens to **10:1 default** (band 6:1–18:1). At Path D ($10M+ Shopify Plus), the band is **12:1 default** (band 6:1–22:1).

## The build (time estimate)

**Path B build for a $1M–$5M GMV Shopify-DTC apparel/beauty/home brand: 4 weeks, 4–8 hours/week operator time, $5.1k Year-1 platform cost.**

### Week 1 — Pricing-architecture + Prisync monitoring setup (8 hr)

1. **Write the pricing-architecture document** (4 hr). List-price + sale-min-floor (margin ≥25%) + MAP-minimum + loyalty-tier-pricing + per-geo-VAT-inclusive-pricing + per-cohort-discount-stack rules. Get finance sign-off before touching anything technical. Without this, the dynamic-pricing engine has no foundation.

2. **Wire Shopify Functions or Shopify Flow to enforce the price-floor** (2 hr). Shopify Function on cart line-item: reject any cart where `line_item.price * (1 − line_item.discount) < floor_price`. Shopify Flow as a backup (less strict). The price-floor-enforcement is the single most load-bearing piece — without it, the dynamic-pricing engine will erode margin to zero within 30 days.

3. **Set up Prisync account + competitor-monitoring** (2 hr). $129/mo Path B default for Shopify-DTC. Add 5–15 competitor SKUs per hero SKU (the canonical "all 5 of your top hero SKUs are being monitored against Amazon + 4 direct competitors"). Set up alerts: (a) competitor-price-moves >5%; (b) unauthorized-reseller-lists-below-MAP; (c) Amazon-Buy-Box-loss-attributed-to-MAP-violation.

### Week 2 — Rebuy smart-cart + dynamic-bundle + free-shipping-threshold (8 hr)

4. **Install Rebuy + configure smart-cart** (4 hr). $300/mo Path B. Smart-cart page shows: dynamic-bundle ("Add [Product B] for $5 off") + personalized-free-shipping-threshold ("Free shipping over $75 to [City]") + frequently-bought-together. Wire to Klaviyo for the returning-customer-discount-stack.

5. **Configure the free-shipping-threshold-engine** (2 hr). Default rule-of-thumb = $75. Path B optimization: per-cohort threshold computed weekly based on AOV-distribution (e.g. CA cohort AOV P75 = $62 → threshold $62; NE cohort AOV P75 = $78 → threshold $78; rural ZIP cohort AOV P75 = $95 → threshold $95). Rebuy computes this dynamically; verify in the dashboard.

6. **Wire dynamic-bundle catalog** (2 hr). For each hero SKU, define 3–5 dynamic-bundle pairs ("Add [Product B] for $5 off"). The bundle must respect margin-floor + MAP-minimum. Verify in cart: bundle-discount does not violate price-floor.

### Week 3 — Nosto PDP-personalization + Smile loyalty-tier-pricing (8 hr)

7. **Install Nosto + configure PDP-personalization** (4 hr). $249/mo Path B+ (skip Path B for $3M+ GMV). Segments: (a) geo-segment ("Cold snap in [City] — these are trending"); (b) returning-customer-segment ("Welcome back — your loyalty discount is loaded"); (c) loyalty-tier-segment (Tier 2 = 10% off PDP-pricing); (d) inventory-pressure-segment ("Only 3 left — order now"). Each segment has a guardrail (margin-floor + MAP-minimum + cohort-cap-per-month).

8. **Wire Smile.io loyalty-tier-discounts** (2 hr). Tier 1 = list-price; Tier 2 = 10% off list; Tier 3 = 15% off list; Tier 4 (VIP) = 20% off list + free-shipping-always. Wire to Klaviyo for the tier-up-email + to the PDP for the tier-discount-display.

9. **Configure per-geo-VAT-inclusive-pricing** (2 hr). Shopify Markets auto-computes VAT-inclusive for EU/UK/AU; verify landed-cost = product-price + VAT + duties + shipping. The geo-pricing uplift is 5–20% CVR per Shopify Markets 2024 + Nosto 2024 benchmarks because international cart-abandon drops 30–40% when the price is VAT-inclusive.

### Week 4 — Price-A/B-testing + Triple Whale price-elasticity overlay + go-live (8 hr)

10. **Set up price-A/B-testing in VWO or Convert.com** (2 hr). $X vs $X-10% vs $X+10% on 3–5 hero SKUs. Sample-size-calculator: 1,000 orders/SKU/month for ±5% confidence at 95%. Below this threshold, the test is inconclusive.

11. **Wire Triple Whale price-elasticity-overlay** (2 hr). Custom-event for `discount_code_applied` + per-cohort-segmentation. Dashboard tile: "Cohort A = price-inelastic at ±15%; Cohort B = highly price-elastic at −10%." Drives the next quarter's pricing-architecture decision.

12. **Run 12 verification gates** (2 hr). Walk through all 12 gates in the "Verification" section. Fix any failed gate before going live.

13. **Document the pricing-architecture decision in the operator-knowledge-base** (2 hr). Path B + per-tier + per-cohort + per-geo rules + price-floor-enforcement. Future-tick agents and team members can read this to understand the system's constraints.

**Total operator-time:** ~32 hours over 4 weeks (4–8 hr/wk).
**Total Path B Year-1 cost:** $129 (Prisync) + $300 (Rebuy) + $0 (Shopify Functions free + Shopify Markets free) = **$5,148/yr**.
**Expected Path B Year-1 incremental:** $40k–$300k at $3M GMV (band: 4:1–14:1, default 8:1).

## Common pitfalls (15 from real builds)

1. **No price-floor-enforcement.** Treating all SKUs as equal at the floor-level is the canonical "we'll just monitor and react" anti-pattern — the dynamic-pricing engine will erode margin to zero within 30 days if there's no enforced floor. **Fix:** wire Shopify Function on cart line-item: reject any cart where `line_item.price * (1 − line_item.discount) < floor_price`. Shopify Flow as backup. Test with a manual 99%-off coupon — should reject. *Cost of ignoring: 25–100% margin erosion within 30 days per Prisync 2024 + RepricerExpress 2024 benchmarks.*

2. **No MAP-policy-3-strike-enforcement.** A competitor or unauthorized reseller lists your hero SKU 30% under MAP on Amazon; you ignore the alert; they win the Buy Box; your Amazon revenue drops 20–40% within 2 weeks. **Fix:** document the 3-strike policy (warning → cease-and-desist → marketplace-removal-via-Amazon-Brand-Registry). Prisync alerts + Amazon Brand Registry auto-enforce. Test by listing a test-SKU under your brand at 50% off — should be flagged within 24 hours. *Cost of ignoring: 10–30% Amazon revenue loss per Amazon Brand Registry 2024 + Prisync 2024 benchmarks.*

3. **Free-shipping-threshold set once and forgotten.** Defaulting to "$75" for every cohort without computing the per-cohort AOV-distribution. The canonical rule-of-thumb is a $5–10k/yr AOV-missed opportunity. **Fix:** use Rebuy's free-shipping-threshold-engine to compute per-cohort threshold weekly based on AOV-distribution. Verify in dashboard: CA cohort threshold = $62, NE = $78, rural ZIP = $95. *Cost of ignoring: 5–12% AOV stagnation per Rebuy 2024 + Shipbob 2024 benchmarks.*

4. **No A/B/C/D pricing-tier segmentation for SKUs.** Treating all SKUs as equal at the pricing-tier-level is the canonical "we're repricing 2,000 SKUs and the engine takes 8 hours per cycle" anti-pattern. **Fix:** A-tier (top 20% by revenue) = full dynamic-pricing + Prisync-monitored + Nosto-personalized + Rebuy-dynamic-bundled; B-tier (next 30%) = static-pricing + Prisync-monitored + Rebuy-frequently-bought-together; C-tier (next 30%) = static-pricing + Smile-loyalty-discount-only; D-tier (bottom 20% by revenue) = static-pricing + no-PDP-personalization + inventory-pressure-discounts-only. Cycle-time drops from 8 hours to 45 minutes per week.

5. **Repricing-engine runs without attribution data.** Setting prices without seeing Triple Whale's per-cohort price-elasticity data is the canonical "we're optimizing blind" anti-pattern — the engine will pick prices that maximize short-term-revenue but destroy long-term-LTV. **Fix:** wire Triple Whale `discount_code_applied` custom-event + per-cohort-segmentation. The price-elasticity-overlay drives the next quarter's pricing-architecture decision.

6. **No per-cohort discount-cap-per-month.** Letting the dynamic-pricing engine apply 5 coupons per cohort per month is the canonical "we trained our customers to never pay full-price" anti-pattern. **Fix:** cap each cohort at 1 discount per 30 days + 1 loyalty-tier-discount per quarter + 1 returning-customer-discount per 90 days. Verify in Klaviyo + Triple Whale that no cohort is over-discounted.

7. **Price-A/B-testing without sample-size-calculator.** Running a price-A/B-test at 50 orders/SKU/month is the canonical "we'll just look at the numbers" anti-pattern — the test is inconclusive, you ship the wrong price, you lose revenue for the next quarter. **Fix:** use Convert.com or VWO's sample-size-calculator — needs 1,000 orders/SKU/month for ±5% confidence at 95%. Below this, the test is exploratory only; defer the decision until volume justifies it.

8. **Geo-pricing without per-region landed-cost computation.** Setting a single international price without per-region VAT + duties + shipping is the canonical "international customers see a different price at checkout" anti-pattern — 30–40% cart-abandon per Baymard 2024 + Shopify Markets 2024 benchmarks. **Fix:** Shopify Markets auto-computes VAT-inclusive for EU/UK/AU; verify landed-cost = product-price + VAT + duties + shipping. The geo-pricing uplift is 5–20% CVR because cart-abandon drops 30–40% when price is VAT-inclusive + landed-cost-visible.

9. **Inventory-pressure-discounts fire too aggressively.** Setting "20% off if SKU has >180 days of stock" without margin-floor-enforcement is the canonical "we'll just clear the dead stock" anti-pattern — the engine marks down A-tier SKUs to clear them, you lose margin on hero SKUs. **Fix:** inventory-pressure-discounts are C/D-tier-only. A/B-tier SKUs use Klaviyo back-in-stock-flow + bundle-and-bundle-engine instead. Verify in dashboard: no A/B-tier SKU has been auto-discounted for inventory-pressure in the last 90 days.

10. **Rebuy smart-cart deployed without margin-floor-guards.** A dynamic-bundle discount that violates the margin-floor is the canonical "we'll just bundle for $5 off" anti-pattern — the bundle ships at a loss. **Fix:** every dynamic-bundle pair must respect margin-floor + MAP-minimum. Verify in cart: bundle-discount + item-discount + cohort-discount < 25% off list (the canonical margin-floor).

11. **Loyalty-tier-discount applied on top of sale-price without cap.** A customer in Tier 3 with a 20%-off-sale-item with a 15%-off-loyalty-discount = 32% off list, violating the 25% margin-floor. **Fix:** cap stacked-discounts at 25% off list (the canonical margin-floor). Wire Shopify Function: reject any cart where `list_price * (1 − stacked_discount) < floor_price`. Verify: a Tier 3 customer buying a 20%-off-sale item sees the loyalty-discount capped to 5% (not 15%).

12. **Nosto PDP-personalization deployed without segment-cap.** Every visitor sees a personalized PDP, every returning customer sees a returning-customer-discount, every loyalty-Tier-3 customer sees 15% off — the operator's margin-floor is silently violated across cohorts. **Fix:** every Nosto segment has a guardrail (margin-floor + MAP-minimum + cohort-cap-per-month). Verify in Nosto dashboard: each segment's monthly discount-cap is documented + enforced.

13. **Triple Whale price-elasticity-overlay is read once, not iterated.** Computing the price-elasticity-per-cohort once and shipping the decision is the canonical "we'll just trust the data" anti-pattern — price-elasticity shifts as the brand matures (returning customers become more inelastic, first-time customers become more elastic). **Fix:** iterate the price-elasticity-overlay monthly. Each month, re-compute the per-cohort elasticity + re-validate the pricing-architecture decision. Document in the operator-knowledge-base.

14. **Prisync monitoring 100% of competitors instead of 5–15 per hero SKU.** Monitoring every competitor SKU is the canonical "we'll just see everything" anti-pattern — alert-noise drowns out signal. **Fix:** monitor 5–15 competitor SKUs per hero SKU (the canonical "your top 5 hero SKUs are monitored against Amazon + 4 direct competitors" set). Defer the long-tail to quarterly-pricing-review.

15. **Path B engine selected without AOV + GMV threshold-validation.** A $500k GMV brand deploying Prisync + Rebuy at $429/mo is the canonical "we over-paid for tools we can't fully use" anti-pattern — the brand has insufficient traffic to train the engine. **Fix:** Path A (Shopify native Discounts + manual spreadsheet) is canonical for <$1M GMV. Path B is canonical for $1M–$5M GMV at ≥$50 AOV. Below these thresholds, defer and use Path A until volume justifies the platform fee. *Cost of ignoring: 12 months of wasted platform fees = $5,148 Path B cost vs ~$0 Path A cost.*

## Verification (this skill is "shipped" when...)

The dynamic-pricing + repricing engine is shipped when ALL of the following gates pass:

- **Gate 1 — Pricing-architecture document approved by finance.** The document specifies list-price + sale-min-floor (margin ≥25%) + MAP-minimum + loyalty-tier-pricing + per-geo-VAT-inclusive-pricing + per-cohort-discount-stack rules. Finance has signed off in writing (Slack, email, or Notion).
- **Gate 2 — Shopify Function or Shopify Flow rejects floor-violating discounts.** Test with a manual 99%-off coupon — should be rejected. Test with a 20%-off-stack — should be accepted. Document the test result.
- **Gate 3 — Prisync monitoring 5–15 competitors per hero SKU.** Verify in Prisync dashboard: each hero SKU has 5–15 competitor SKUs monitored. Alerts configured for competitor-price-moves >5% + unauthorized-reseller-lists-below-MAP + Amazon-Buy-Box-loss-attributed-to-MAP-violation.
- **Gate 4 — MAP-3-strike-policy documented.** 3-strike-policy (warning → cease-and-desist → marketplace-removal-via-Amazon-Brand-Registry) documented in the operator-knowledge-base. Test by listing a test-SKU under your brand at 50% off — should be flagged within 24 hours.
- **Gate 5 — Rebuy smart-cart deployed with personalized-free-shipping-threshold.** Verify in cart: returning-customer sees personalized threshold ("Free shipping over $62 to [City]"). Verify dynamic-bundles respect margin-floor + MAP-minimum.
- **Gate 6 — Nosto PDP-personalization live with ≥3 segments.** Verify in Nosto dashboard: geo-segment + returning-customer-segment + loyalty-tier-segment live. Each segment has a guardrail (margin-floor + MAP-minimum + cohort-cap-per-month).
- **Gate 7 — Free-shipping-threshold-engine computes per-cohort threshold weekly.** Verify in Rebuy dashboard: per-cohort threshold computed weekly based on AOV-distribution. CA cohort = $62, NE = $78, rural ZIP = $95.
- **Gate 8 — Smile.io loyalty-tier-discounts wired.** Tier 2 = 10% off list; Tier 3 = 15% off list; Tier 4 (VIP) = 20% off list + free-shipping-always. Verify in cart: Tier 3 customer sees 15% off + free-shipping-always.
- **Gate 9 — Per-geo-VAT-inclusive-pricing live for international markets.** Shopify Markets auto-computes VAT-inclusive for EU/UK/AU; verify landed-cost = product-price + VAT + duties + shipping. Verify: a German customer sees the same total at PDP and at checkout (no surprise-fees-at-checkout).
- **Gate 10 — Inventory-pressure-discounts auto-fire for SKUs >180 days of stock.** Verify in Shopify Flow or inventory-engine: C/D-tier SKUs >180 days of stock auto-discounted 20% off. A/B-tier SKUs are NOT auto-discounted — they use Klaviyo back-in-stock-flow + bundle-and-bundle-engine instead.
- **Gate 11 — Triple Whale price-elasticity-dashboard live with cohort overlay.** Custom-event for `discount_code_applied` + per-cohort-segmentation. Dashboard tile: "Cohort A = price-inelastic at ±15%; Cohort B = highly price-elastic at −10%."
- **Gate 12 — Path B cost ≈$429/mo; Path B ROI tracking toward 4:1–14:1 default band.** At 30-day post-launch: AOV up ≥5% vs 30-day pre-launch baseline; CVR up ≥5% vs 30-day pre-launch baseline; Amazon-Buy-Box-loss <2%; Path B cost ≈$429/mo; Path B ROI tracking toward the 4:1–14:1 default band for $1M–$5M GMV Path B.

If any gate fails, do NOT mark the skill as shipped. Iterate until all 12 pass. The 12 gates are the canonical "best-in-class dynamic-pricing engine" definition.

## How to extend this skill

Once Path B is live and stable, the operator can extend the dynamic-pricing + repricing engine with these bounded expansions, in priority order:

1. **Add Nosto geo-pricing at Path B+ ($249/mo extra).** Geo-pricing adds per-city-VAT-inclusive + per-region-landed-cost + weather-personalized-PDP-recommendation. Lift is 5–20% CVR per Nosto 2024 + Shopify Markets 2024 benchmarks. Estimated effort: 8 hr setup + 2 hr/wk ongoing.
2. **Add Outvio for EU/UK/AU carrier-rate-routing + VAT-real-time (Path C, $99/mo extra).** Outvio auto-routes EU/UK/AU orders to the cheapest carrier per destination + auto-computes VAT in real-time. Lift is 3–8% margin per Outvio 2024 benchmarks (the cost-savings from carrier-rate-optimization). Estimated effort: 6 hr setup + 1 hr/wk ongoing.
3. **Upgrade to Path D Shopify AI Storefront for $10M+ GMV brands.** Path D adds AI-driven PDP-personalization at 500+ SKU scale (the engine personalizes the PDP-template itself, not just the recommendation-list). Lift is 8–15% CVR per Shopify AI Storefront 2024 benchmarks. Estimated effort: 16 hr migration + 4 hr/wk ongoing.
4. **Add a custom-built price-elasticity-engine using Triple Whale + Python.** The custom-engine computes per-cohort per-SKU per-week price-elasticity + per-tier-margin-floor + per-MAP-violation-alert. Replaces the manual pricing-architecture review. Estimated effort: 24 hr build + 4 hr/wk ongoing.
5. **Add an inventory-pressure-prediction-engine using Inventory Planner + the dynamic-pricing engine.** When a C/D-tier SKU hits >180 days of stock, the engine auto-fires the inventory-pressure-discount. Replaces the manual Shopify Flow trigger. Estimated effort: 12 hr build + 1 hr/wk ongoing.
6. **Add Algolia Recommend for AI-driven PDP-recommendation.** Algolia's recommendation-engine personalizes the "frequently-bought-together" + "customers-also-bought" widgets using ML on the brand's purchase-history. Lift is 5–12% AOV per Algolia 2024 + Searchspring 2024 benchmarks. Estimated effort: 8 hr setup + 1 hr/wk ongoing.
7. **Add Dynamic Yield for enterprise-grade A/B-testing + personalization.** Dynamic Yield replaces VWO/Convert.com for $25M+ brands needing multivariate-testing + AI-driven personalization + cohort-segmentation at scale. Lift is 8–15% CVR per Dynamic Yield 2024 benchmarks. Estimated effort: 24 hr migration + 4 hr/wk ongoing.

Pick the extension based on the operator's next-quarter-priority. Each extension is a 1-tick playbook + 1-tick asset + 1-tick operator-surface-route + 1-tick script + 1-tick static-dashboard (5 layers per the canonical layer order).

## Cross-references

- `skills/06-mobile-pdp-redesign.md` — the canonical Move #9 mobile-first PDP redesign (speed + above-the-fold + sticky ATC). The dynamic-pricing engine's PDP-personalization layer lives on top of Move #9's mobile-first PDP — without the mobile-first foundation, the personalization is invisible to 70%+ of traffic.
- `skills/08-pdp-ab-testing-program.md` — the canonical Move #9.5 always-on PDP A/B testing program. The price-A/B-testing in Pillar 5 is one variant of Move #9.5's broader A/B-testing program. Always coordinate price-A/B-test with creative-A/B-test to avoid confounding.
- `skills/10-lifecycle-flow-library.md` — the canonical Move #14 lifecycle flow library. The loyalty-tier-discount (Pillar 4) is the Smile.io + Klaviyo integration wired into the lifecycle flows (tier-up-email + tier-down-warning + loyalty-points-expiry).
- `skills/13-triple-whale-attribution.md` — the canonical Move #6 Triple Whale attribution. The Triple Whale price-elasticity-overlay (Pillar 5) is built on top of Move #6's per-cohort attribution data. Without Move #6 first, the price-elasticity-overlay has no foundation.
- `skills/14-affiliate-program.md` — the canonical Move #15 affiliate/creator program. Affiliate-creator-commission-rates must respect the MAP-policy (Pillar 2) — a 30%-off-affiliate-commission-code violates MAP if the underlying product is at MAP. Coordinate commission-discount-rules with the MAP-enforcement recipe.
- `skills/15-marketplace-expansion.md` — the canonical Move #13 marketplace expansion. The MAP-policy (Pillar 2) is the load-bearing piece for Amazon + Walmart + Target Plus Buy-Box-ownership. Without MAP-defense, marketplace-expansion fails on day-1.
- `skills/22-checkout-audit-baymard.md` — the canonical Move #3 checkout audit. The free-shipping-threshold-engine (Pillar 3) is one of Move #3's 24 Baymard-guideline fixes. Coordinate free-shipping-threshold-engine with Move #3's checkout-audit-fix-list.
- `skills/25-international-expansion.md` — the canonical Move #22 international expansion. The per-geo-VAT-inclusive-pricing (Pillar 4) is built on top of Move #22's Shopify Markets + EU IOSS + UK VAT MOSS foundation. Without Move #22 first, the geo-pricing layer has no foundation.
- `skills/29-inventory-forecasting-stockout-prevention.md` — the canonical Move #12.5 inventory forecasting + stockout prevention. The inventory-pressure-discounts (Pillar 4) is built on top of Move #12.5's SKU-tier-segmentation + dead-stock-identification. Without Move #12.5 first, the inventory-pressure-discounts fire on A-tier SKUs that should never be auto-discounted.
- `research/00-ecommerce-ops-landscape.md` — the canonical landscape doc. References Prisync + Rebuy + Outvio + Nosto + Shopify AI Storefront as the canonical dynamic-pricing + PDP-personalization tool stack.

## Sources

- Prisync 2024 — vendor product page + competitor-monitoring benchmarks + MAP-defense case studies + Path B pricing ($129/mo); MAP-enforcement recipe; per-cohort price-monitoring.
- Rebuy 2024 — vendor product page + smart-cart benchmarks + dynamic-bundle benchmarks + free-shipping-threshold-engine benchmarks + Path B pricing ($300/mo); personalized-PDP-recommendation.
- Outvio 2024 — vendor product page + EU/UK/AU carrier-rate-routing benchmarks + VAT-real-time pricing benchmarks + Path C pricing ($99/mo); per-region landed-cost computation.
- Nosto 2024 — vendor product page + AI-driven-PDP-personalization benchmarks + geo-pricing + weather-pricing + loyalty-tier-pricing + Path B+ pricing ($249/mo); cohort-segmentation.
- Shopify AI Storefront 2024 — Shopify Plus built-in PDP-personalization benchmarks + Path D pricing (built-in for Shopify Plus); AI-driven-PDP-template-personalization.
- Triple Whale 2024 — attribution vendor product page + per-cohort price-elasticity benchmarks + custom-event-discount-code-applied benchmarks.
- Polar 2024 — attribution alternative to Triple Whale + per-cohort price-elasticity benchmarks.
- Klaviyo 2024 — ESP vendor product page + returning-customer-discount automation + loyalty-tier-discount integration + back-in-stock-flow.
- Postscript 2024 — SMS vendor product page + cart-abandon-discount-code-SMS benchmarks.
- Smile 2024 — loyalty vendor product page + loyalty-tier-discount + repeat-purchase-rate benchmarks.
- Yotpo 2024 — loyalty + reviews vendor product page + loyalty-tier-discount + repeat-purchase-rate benchmarks.
- Gorgias 2024 — helpdesk vendor product page + customer-service-discount-code-issuance benchmarks.
- Loox 2024 — photo-reviews vendor product page + PDP-photo-reviews + conversion-lift benchmarks.
- Junip 2024 — reviews vendor product page + PDP-reviews + conversion-lift benchmarks.
- Iterable 2024 — ESP alternative to Klaviyo + per-cohort-discount-automation benchmarks.
- Algolia 2024 — search + recommendation vendor product page + AI-driven-PDP-recommendation + AOV-lift benchmarks.
- Searchspring 2024 — search + recommendation vendor product page + AI-driven-PDP-recommendation + AOV-lift benchmarks.
- RepricerExpress 2024 — repricing-engine vendor product page + margin-floor-enforcement benchmarks.
- Omnia 2024 — repricing-engine vendor product page + competitor-price-monitoring benchmarks.
- Kompetenta 2024 — pricing-consultancy + dynamic-pricing-strategy benchmarks.
- Prisync benchmarks 2024 — case studies + per-industry competitor-monitoring benchmarks + MAP-defense case studies.
- DynamicPricing consultants 2024 — pricing-strategy-consultancy + per-vertical pricing-elasticity benchmarks.
- Smarter e-commerce pricing 2024 — pricing-strategy + dynamic-pricing-engine-selection benchmarks.
- Shipbob State of DTC Shipping 2024 — free-shipping-threshold-engine + AOV-lift benchmarks + per-cohort AOV-distribution.
- Retail ZT pricing 2024 — pricing-strategy + dynamic-pricing-engine-selection benchmarks + per-vertical-pricing-strategy.
- Catalyst 2024 — pricing-strategy + dynamic-pricing-engine-selection benchmarks + per-GMV-tier-pricing-strategy.
- Shopify Functions 2024 — Shopify Functions product page + price-floor-enforcement recipe + custom-cart-validation-rules.
- Shopify Flow 2024 — Shopify Flow product page + price-floor-enforcement-as-backup + inventory-pressure-discount-automation.
- Microsoft pricing 2024 — pricing-strategy + per-vertical-pricing benchmarks + B2B-pricing-strategy.
- Ancor customer pricing 2024 — customer-pricing-segmentation + per-cohort-discount-stack benchmarks.
- Vantage pricing 2024 — pricing-strategy + per-vertical-pricing benchmarks + pricing-engine-selection.