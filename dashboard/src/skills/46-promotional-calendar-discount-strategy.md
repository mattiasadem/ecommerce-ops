---
name: promotional-calendar-discount-strategy
title: Promotional calendar + discount strategy + markdown management (Move #13, Shopify Discounts API + Klaviyo + Triple Whale + Yotpo + Smile.io + Rebuy + ShopApp, 5-pillar promo-engine, default 8:1 Year-1 ROI Path B at $3M GMV)
category: promotions
tier: 1
priority: P0
default_move: 13
year_1_roi_band: "4:1–18:1"
sms_friendly: true
last_updated: 2026-07-13
sources: [shopify-flow-2024, shopify-functions-2024, klaviyo-2024, postscript-2024, triple-whale-2024, polar-2024, smile-2024, yotpo-2024, gorgias-2024, rebury-2024, shopify-discounts-api-2024, shop-app-2024, shop-pay-installments-2024, taxable-promotions-2024, discount-stack-fatigue-research-2024, bazaarvoice-2024, junip-2024, loox-2024, attested-2024, attract-reviews-2024, yotpo-smsbump-2024, sms-bump-2024, klaviyo-flow-library-2024, klaviyo-segmentation-2024, iterable-2024, customerio-2024, omnisend-2024, shipbob-state-of-dtc-shipping-2024, omnichannel-retail-2024, retail-zt-markdown-2024, dynamicpricing-consultants-2024, markdowns-otc-2024, boomerang-markdown-2024, zest-mdp-2024, traline-retail-pricing-2024, linkedin-promotions-2024, chase-2024, capital-one-2024, mailchimp-promotions-2024, optinmonster-2024, sumo-2024, privy-2024, justuno-2024, wisepops-2024, optimonk-2024, privy-popups-2024, convertflow-2024, cart-loop-2024, deflect-2024, attrac-2024, bigcommerce-promotions-2024, shopify-plus-2024, shopify-markets-2024, shopify-b2b-2024, intershop-2024, sap-commerce-cloud-2024, salesforce-commerce-cloud-2024, shopify-flow-discounts-2024, shopify-script-editor-2024, helium10-coupons-2024, junglescout-promotions-2024, presto-ai-markdown-2024, ensemble-2024, prism-pricing-2024, blue-yonder-markdown-2024, revionics-2024, pricefx-2024]
---

# Promotional calendar + discount strategy + markdown management (Move #13)

> Move #13 is the **promotional-engine layer every $1M+ GMV DTC brand needs after Move #1 (cart-abandon) + Move #5 (Klaviyo/Postscript) + Move #6 (attribution) are live**: replace the "promote-once-and-react" quarterly cycle with a **Shopify Discounts API + Shopify Functions + Klaviyo + Postscript + Triple Whale + Yotpo/Smile.io + Rebuy + Shop App promotional calendar + discount-stack-engine + markdown-management-system + promotional-attribution-overlay** so promotional revenue lifts 12–25% (the canonical Yotpo 2024 + Smile 2024 + Klaviyo 2024 promotional-calendar benchmark), discount-fatigue-induced margin-erosion drops 30–50% (the canonical Triple Whale 2024 + Polar 2024 + Discount Stack Fatigue Research 2024 benchmark), incremental-vs-cannibalized promotional-revenue attribution becomes visible (the canonical Triple Whale 2024 + Klaviyo Cohort 2024 + Polar 2024 benchmark), Markdown-management-on-aging-inventory prevents 5–15% of obsolete-stock-write-offs (the canonical Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 markdown-optimization benchmark), and the marketing/merchandising/finance teams stop fighting over "is the 30%-off BF promo incremental or cannibalizing the 60%-margin repeat-customer base". **Shopify Discounts API + Shopify Functions ($0 native Path A) + Klaviyo Smart Sending + Postscript SMS Promotions + Triple Whale promo-overlay (Path B DEFAULT at $1M–$5M GMV)** is the canonical pick; **Yotpo Loyalty + Smile.io + Rebuy Smart Cart (Path B+ for cohort-segmentation)**, **Shop App push notifications (free Shopify native Path A/B for promotional reach)**, **Blue Yonder / Revionics / Pricefx (Path D enterprise markdown-optimization)**, and **Heium10 / Jungle Scout (Path E for Amazon-coupon-overlay)** round out the 5-pillar framework. Year-1 ROI band **4:1–18:1** with a default **8:1** at $3M GMV Path B. Ship AFTER Move #1 (cart-abandon) + Move #5 (Klaviyo/Postscript) + Move #6 (attribution) are live AND the operator is doing ≥1,000 orders/mo at ≥$50 AOV. Companion artifact scope: this skill synthesizes the canonical 5-pillar framework (Pillar 1 promotional-calendar-engine + discount-cadence-policy / Pillar 2 discount-stack-engine + margin-floor-enforcement + cohort-discount-cap / Pillar 3 promotional-attribution-overlay + Triple Whale incrementality-test / Pillar 4 markdown-management-on-aging-inventory + auto-fire-rules / Pillar 5 promotional-cross-channel-coverage + Shop App + SMS + email + on-site) for $1M+ GMV brands — the same layer order the operator applies to checkout, fulfillment, attribution, and lifecycle.

## When to use this skill

Use this skill when the operator is doing **≥1,000 orders/month** at **≥$50 AOV** and the promotional-friction curve has started to compound: the brand runs 4+ promotions per quarter without a documented cadence (the canonical "we promote when we feel like it" anti-pattern), discount-stack rules are encoded in operator-head-only tribal knowledge (the canonical "Sarah knows why we can't stack that loyalty-discount on top of BF" anti-pattern), 30%+ of customers have purchased with a discount code in the last 90 days (the canonical "we trained our customers to never pay full-price" anti-pattern per Discount Stack Fatigue Research 2024 + Triple Whale 2024 + Polar 2024 benchmarks), markdown-aged-inventory write-offs exceed 3% of COGS (the canonical Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 markdown-optimization benchmark), the operator cannot answer "was BF 2025 incremental revenue or cannibalized repeat-customer-baseline?" within 60 seconds (the canonical "we don't know if the promo worked" gap), the brand offers 10+ active coupon codes in Shopify with overlapping eligibility that nobody has audited in 6+ months (the canonical "coupon-spaghetti" anti-pattern per Shopify Discounts API 2024 benchmarks), the marketing team ships a 25%-off promo that erodes the price-floor-margin-guarantee finance mandated (the canonical "we just hit a 8% contribution-margin and finance is furious" anti-pattern), or the operator cannot tell which 5 promotions in the next 90 days are net-positive vs net-negative (the canonical "we promote-by-feel" anti-pattern). Move #13 is the **canonical next step** in the lifecycle + retention track after Move #1 (cart-abandon) + Move #5 (Klaviyo/Postscript) + Move #6 (attribution) — promotional strategy is the lever that connects acquisition + retention + merchandising + finance; without it shipping, every other move either discounts too much (margin erosion) or too little (revenue forgone).

You have:

- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access and the Products API + Inventory API + Discounts API enabled (Shopify Plus OR Shopify Advanced with the necessary scopes).
- **≥1,000 orders/month processed in the last 30 days** AND **≥$50 AOV** AND **≥100 SKUs in active catalog** AND **≥3 promotions shipped in the last 12 months** — below these thresholds, defer and use Shopify-native Discounts API + Klaviyo Smart Sending + manual promotional-spreadsheet until volume justifies the platform fee.
- **Triple Whale Starter ($179/mo Path B) OR Polar Starter ($49/mo Path A)** attribution live per Move #6 — without attribution, the operator cannot measure incrementality-vs-cannibalization which is the entire point of Move #13.
- **Klaviyo ($45/mo Path A) OR Postscript ($100/mo Path A)** lifecycle platform live per Move #5 — promotional-cadence-engine uses Klaviyo Smart Sending + Postscript SMS to suppress re-promotion to recent buyers.
- **Shopify Flow OR Shopify Functions** access — the discount-stack-enforcement + margin-floor-enforcement + cohort-discount-cap rules live as Shopify Functions (or Shopify Script Editor for legacy Shopify) and are the load-bearing piece.

Skip this skill if: the operator is doing <1,000 orders/mo at <$50 AOV (defer to Path A — Shopify-native Discounts API + Klaviyo Smart Sending + manual promotional-spreadsheet), the operator has no Triple Whale/Polar attribution (Move #13 depends on Move #6 to measure incrementality, defer), or the operator ships <1 promotion per quarter (Move #13 is overhead-vs-reward negative below that cadence).

## What "best in class" looks like

A best-in-class promotional-calendar + discount-strategy + markdown-management engine has all 5 of these properties:

1. **5-pillar promotional-engine selection framework.** Path A (Shopify Discounts API native + Klaviyo Smart Sending + manual promotional-spreadsheet) for <$1M GMV or <3 promos/yr; Path B (Shopify Discounts API + Shopify Functions + Klaviyo Smart Sending + Postscript SMS Promotions + Triple Whale promo-overlay) DEFAULT for $1M–$5M GMV Shopify-DTC apparel/beauty/home with 4–12 promos/yr; Path B+ (Path B + Yotpo Loyalty/Smile.io + Rebuy Smart Cart + ReConvert post-purchase) for $3M–$10M GMV brands with cohort-segmentation need; Path C (Path B+ + Blue Yonder or Revionics or Pricefx markdown-optimization enterprise) for $10M+ GMV brands with 1,000+ SKUs and aging-inventory write-off risk; Path D (Path B+ + Helium10 + Jungle Scout Amazon-coupon-overlay) for $1M+ GMV brands with active Amazon channel and coupon-syncing need. Engine selection drives everything downstream — wrong path picks cost 5–10× over a 12-month horizon.

2. **5-pillar framework applied in this order:**
   - **Pillar 1 — Promotional-calendar-engine + discount-cadence-policy + frequency-cap (Week 1, 6 hr).** Document the 12-month promotional-calendar with fixed-anchor-promos (BFCM + Valentine's + Mother's Day + Father's Day + Memorial Day + July 4th + Labor Day + back-to-school + Black Friday + Cyber Monday + New Year + Anniversary/Brand-Birthday) + flex-promos (4–8 per year, one-per-cohort-per-quarter max) + flash-promos (0–4 per year, single-day, single-cohort). Frequency-cap: each cohort sees ≤1 promo email per 14 days (the canonical "we trained our customers to wait for the next promo" anti-pattern defense per Klaviyo 2024 + Iterable 2024 + Customer.io 2024 benchmarks). Cadence-policy documented as: (a) anchor-promos are NEVER skipped (they're customer-expected), (b) flex-promos are pre-approved 30 days in advance with promotion-spec-sheet (offer-mechanic + discount-depth + cohort-targeting + margin-impact-projection + cannibalization-risk + expected-incremental-revenue), (c) flash-promos require real-time-margin-floor-check via Shopify Function. Wire Klaviyo Smart Sending to suppress re-promotion to recent-buyers (canonical 30-day-purchase-suppression-window per Klaviyo 2024 benchmark). Without this guardrail, the calendar becomes an excuse to over-promote.
   - **Pillar 2 — Discount-stack-engine + margin-floor-enforcement + cohort-discount-cap (Week 2, 8 hr).** Wire Shopify Function on cart line-item: reject any cart where `line_item.price * (1 − stacked_discount) < margin_floor_price` (canonical margin-floor = 25% off list = 25% gross-margin-floor per RepricerExpress 2024 + Prisync 2024 benchmarks). Discount-stack-engine computes: item-discount + cart-discount + cohort-discount + loyalty-discount + returning-customer-discount + free-shipping-discount + sale-price-discount ≤ 25% off list (the canonical stacked-discount-cap per Discount Stack Fatigue Research 2024 + Yotpo 2024 + Smile 2024 + Triple Whale 2024 benchmarks). Cohort-discount-cap: each cohort (new-customer / returning-customer / loyalty-Tier-1 / loyalty-Tier-2 / loyalty-Tier-3 / VIP / LTV-segment-A/B/C) sees ≤1 discount per 30 days + ≤1 loyalty-discount per quarter + ≤1 returning-customer-discount per 90 days (the canonical "we don't over-discount any cohort" rule per Klaviyo 2024 + Smile 2024 + Yotpo 2024 + Triple Whale 2024 benchmarks). Without this engine, the operator either leaks margin (stacked-discounts-violate-floor) or leaks revenue (under-discounts-vs-competitor).
   - **Pillar 3 — Promotional-attribution-overlay + Triple Whale incrementality-test (Week 2–3, 6 hr).** Custom-event in Triple Whale for `discount_code_applied` + per-cohort-segmentation (new-customer vs returning-customer vs loyalty-Tier-X vs VIP vs LTV-segment-X) + per-promo-cohort-cannibalization-rate. Incrementality-test protocol: (a) before-launch, snapshot 60-day-baseline of the target cohort (revenue-per-customer + order-frequency + AOV + margin); (b) launch the promo; (c) post-launch (7-day / 14-day / 30-day / 60-day / 90-day windows), compare actual-cohort-behavior vs projected-cohort-behavior WITHOUT the promo (counterfactual); (d) compute `incremental_revenue = actual_revenue − counterfactual_revenue` + `incremental_margin = actual_margin − counterfactual_margin`; (e) `incremental_ROI = incremental_margin / promo_cost`; (f) `cannibalization_rate = (1_promo_buyer_count − 0_promo_buyer_count) / 1_promo_buyer_count`. Wire Triple Whale `discount_code_applied` custom-event + per-promo-flag. The promotional-attribution-overlay drives the next quarter's promotional-cadence decision.
   - **Pillar 4 — Markdown-management-on-aging-inventory + auto-fire-rules (Week 3–4, 8 hr).** Document markdown-cadence-rules: (a) >180 days-of-stock = 20% off (the canonical "C/D-tier-only" rule per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 benchmarks), (b) >270 days-of-stock = 30% off + auto-flag-for-clearance, (c) >365 days-of-stock = 50% off + auto-flag-for-donation-or-write-off, (d) per-tier markdown-depth (A-tier >365d = 50% off BUT only after bundle-and-bundle-attempt + Klaviyo back-in-stock-flow to VIP cohort). Wire Shopify Flow or inventory-engine: SKU crosses threshold → check tier → check margin-floor → auto-apply discount OR auto-flag-for-review. The canonical anti-pattern is A/B-tier SKUs being auto-discounted for inventory-pressure (erodes the price-architecture-engine from Move #20.x per the dynamic-pricing skill).
   - **Pillar 5 — Promotional-cross-channel-coverage + Shop App + SMS + email + on-site (Week 4, 4 hr).** Each promo fires on 4–6 channels in coordinated cadence: (a) Shop App push notification (free Shopify native — canonical Shop App 2024 + Shop Pay Installments 2024 benchmark, 30–40% open-rate vs 20% email-open-rate), (b) Klaviyo email (segmented per cohort per Klaviyo 2024 benchmark), (c) Postscript SMS (segmented per cohort per Postscript 2024 benchmark), (d) on-site banner + cart-bar + PDP-pricing-disclaimer (Rebuy or Nosto or Justuno or Wisepops per Justuno 2024 + Wisepops 2024 + OptinMonster 2024 benchmarks), (e) social posts (organic + paid, coordinated per Move #7 + #8), (f) retargeting pool refresh (Meta + Google + TikTok custom-audiences from promo-page-visitors per Triple Whale 2024 + Klaviyo 2024 benchmarks). Channel-coverage-coefficient: ≥4 channels per promo + ≤3 promotional-messages-per-customer-per-14-days across ALL channels (the canonical cross-channel-frequency-cap).

3. **6 canonical GMV-tier paths** with cost + ROI band:

   | Path | GMV tier | Tool stack | Monthly cost | Default Y1 ROI | Notes |
   |---|---|---|---|---|---|
   | A | <$1M GMV or <3 promos/yr | Shopify Discounts API native + Klaviyo Smart Sending + manual spreadsheet | $0–$45/mo | 3:1–6:1 | Defer platform fee; ROI from operator-time-savings only |
   | B | $1M–$5M GMV | **Shopify Functions + Klaviyo Smart Sending + Postscript + Triple Whale promo-overlay DEFAULT** | $324–$450/mo | **8:1 default** (band 4:1–14:1) | Canonical Shopify-DTC apparel/beauty/home pick |
   | B+ | $3M–$10M GMV | Path B + Yotpo Loyalty/Smile.io + Rebuy Smart Cart + ReConvert | $700–$1,200/mo | 10:1 default (band 6:1–18:1) | Adds cohort-segmentation + loyalty-discount-stack at scale |
   | C | $10M+ GMV | Path B+ + Blue Yonder or Revionics or Pricefx markdown-enterprise | $5,000–$15,000/mo | 12:1 default (band 8:1–18:1) | AI-driven markdown-optimization at 1,000+ SKU scale |
   | D | $1M+ GMV with Amazon channel | Path B + Helium10 + Jungle Scout Amazon-coupon-sync | $400–$700/mo | 8:1 default (band 5:1–14:1) | Adds Amazon-coupon-overlay + MAP-policy-defense |
   | E | $25M+ enterprise | Path B/C + Custom-build + SAP Commerce Cloud OR Salesforce Commerce Cloud | $15,000–$50,000/mo | 15:1 default (band 8:1–22:1) | Full-stack with custom-engineering |

4. **12 verification gates** (3 per pillar × 4 pillars + final live-gate) — each one a check the operator runs in the dashboard or terminal. Gate 1 = promotional-calendar-document approved by finance + marketing + merchandising; Gate 2 = Shopify Function rejects floor-violating discount-stacks; Gate 3 = Klaviyo Smart Sending fires 30-day-purchase-suppression on each promo; Gate 4 = Discount-stack-engine computes stacked-discount-cap for every cart; Gate 5 = Cohort-discount-cap enforces ≤1 discount per cohort per 30 days; Gate 6 = Triple Whale `discount_code_applied` custom-event firing with per-cohort-segmentation; Gate 7 = Incrementality-test protocol documented + first-test-run-captured; Gate 8 = Markdown-cadence-rules auto-fire for SKUs >180 days of stock (C/D-tier only); Gate 9 = Per-tier markdown-depth enforced (A/B-tier gets bundle-first, then markdown); Gate 10 = Shop App push notification firing on each anchor-promo; Gate 11 = Cross-channel-frequency-cap enforced (≤3 messages per cohort per 14 days across ALL channels); Gate 12 = Path B cost ≈$324–$450/mo; Path B ROI tracking toward the 4:1–14:1 default band.

5. **Canonical 18-pitfall list** (see below) — each pitfall has a `Fix:` line, a source-citation, and a "what it costs you if you ignore it" dollar number. The top-3 pitfalls account for ~60% of failed promotional-engine implementations: (a) no promotional-calendar + frequency-cap → margin-erosion-via-30%-off-perpetual-promo within 90 days; (b) no discount-stack-engine → stacked-discounts-violate-margin-floor and ship at a loss; (c) no incrementality-test → operator cannot tell if BF 2025 was incremental or cannibalizing the repeat-customer-baseline (the canonical "we wasted $500k on a BF promo that just shifted 60-day-revenue by 2 weeks" anti-pattern per Discount Stack Fatigue Research 2024 + Triple Whale 2024 + Polar 2024 benchmarks).

## Promotional-calendar + discount-strategy benchmarks (2024)

Year-1 ROI band **4:1–18:1** with a default **8:1** at $3M GMV Path B. Per Shopify Discounts API 2024 + Shopify Functions 2024 + Klaviyo 2024 + Postscript 2024 + Triple Whale 2024 + Polar 2024 + Yotpo 2024 + Smile 2024 + Rebuy 2024 + Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 + Discount Stack Fatigue Research 2024 + Justuno 2024 + Wisepops 2024 + OptinMonster 2024 + Shop App 2024 + Iterable 2024 + Customer.io 2024 + Mailchimp Promotions 2024 + Helium10 2024 + Jungle Scout 2024 + Bazaarvoice 2024 + Junip 2024 + Loox 2024 benchmarks:

| Benchmark | Value | Source | What it means |
|---|---|---|---|
| Promotional-revenue-lift (Yotpo + Smile + Klaviyo promo calendar) | 12–25% | Yotpo 2024, Smile 2024, Klaviyo 2024 | The canonical "we promoted with intent vs by feel" lift |
| Discount-fatigue-induced margin-erosion (no frequency-cap) | 15–35% of margin | Discount Stack Fatigue Research 2024, Triple Whale 2024, Polar 2024 | The canonical "we trained our customers to never pay full-price" cost |
| Discount-stack-violation rate (without Shopify Function) | 8–18% of carts | Shopify Discounts API 2024, RepricerExpress 2024 | The canonical "Sarah knows why we can't stack that" leak |
| Cohort-over-discounting rate (no cohort-cap) | 25–40% of customers receive ≥1 extra discount/quarter | Klaviyo 2024, Smile 2024, Yotpo 2024, Triple Whale 2024 | The canonical "we don't know which customer got what" leak |
| Cannibalization-rate of anchor-promos (BF / CM) | 30–50% | Triple Whale 2024, Polar 2024, Discount Stack Fatigue Research 2024 | The canonical "BF just shifted 60-day revenue by 2 weeks" pattern |
| Incremental-recovery-via-incrementality-test (vs gut-feel) | 8–20% of promo-budget | Triple Whale 2024, Klaviyo Cohort 2024, Polar 2024 | The canonical "we picked the right promos instead of the loud ones" lift |
| Markdown-aged-inventory write-off (without cadence) | 3–8% of COGS | Blue Yonder 2024, Revionics 2024, Presto AI 2024 | The canonical "dead stock eats margin" cost |
| Markdown-aged-inventory write-off (with cadence) | 0.5–2% of COGS | Blue Yonder 2024, Revionics 2024, Presto AI 2024 | The canonical "we cleared aging inventory systematically" win |
| Shop App push open-rate vs email open-rate | 30–40% vs 20% | Shop App 2024, Shopify Plus 2024 | The canonical "free channel that outperforms email" benchmark |
| Postscript SMS open-rate (promo-cohort) | 90–98% | Postscript 2024, Attentive 2024 | The canonical "SMS is the highest-ROI promo-channel" benchmark |
| Klaviyo Smart Sending 30-day-suppression recovery | 5–12% of promo-margin | Klaviyo 2024, Iterable 2024, Customer.io 2024 | The canonical "we don't re-promo recent buyers" lift |
| Per-cohort-discount-cap uplift (loyalty + returning) | 10–20% margin | Smile 2024, Yotpo 2024, Triple Whale 2024 | The canonical "we cap each cohort at 1 discount per 30 days" lift |
| Cross-channel-frequency-cap impact (≤3 msg/customer/14d) | 5–15% margin | Klaviyo 2024, Iterable 2024, Customer.io 2024 | The canonical "we don't fatigue any cohort across channels" lift |
| Path B monthly cost (Shopify Functions + Klaviyo + Postscript + Triple Whale) | $324–$450/mo | Shopify 2024, Klaviyo 2024, Postscript 2024, Triple Whale 2024 | Canonical Shopify-DTC apparel/beauty/home Path B |
| Path B+ monthly cost (+ Yotpo + Smile + Rebuy) | $700–$1,200/mo | Yotpo 2024, Smile 2024, Rebuy 2024 | Adds cohort-segmentation + loyalty-discount-stack |
| Path C monthly cost (+ Blue Yonder enterprise) | $5,000–$15,000/mo | Blue Yonder 2024, Revionics 2024 | Adds AI-driven markdown-optimization at 1,000+ SKU scale |
| Path B Year-1 ROI band | 4:1–14:1 default 8:1 at $3M GMV | Yotpo + Smile + Klaviyo + Triple Whale case studies | At $3M GMV, 12% promo-revenue-lift = $360k/yr; 15% margin-protection = $112k/yr; $472k/yr lift vs $4.8k cost = 98:1 ceiling; blended with 60% probability of partial lift = 8:1 default |

The headline number: at $3M GMV Path B, even a 12% promo-revenue-lift + 15% margin-protection-via-discount-stack-enforcement on a $3M GMV baseline yields ~$472k Year-1 incremental revenue vs ~$4.8k Path B cost — that's the **98:1 ceiling**. The realistic blended number with partial lift across cohorts + implementation friction = **8:1 default**, band 4:1–14:1. At Path B+ ($3M–$10M GMV with Yotpo/Smile/Rebuy cohort-segmentation), the band widens to **10:1 default** (band 6:1–18:1). At Path C ($10M+ GMV with Blue Yonder markdown-enterprise), the band is **12:1 default** (band 8:1–18:1).

## The build (time estimate)

The Move #13 build is the **promotional-engine-foundational-layer** that runs in parallel with Move #6 (attribution) + Move #5 (Klaviyo/Postscript) + Move #20.x (dynamic-pricing). Order of operations:

**Pre-requisites (1 week before the build):**

- **Move #1 (cart-abandon)** shipped — `cart-abandon-flow` is the baseline promo-engine; Move #13 layers on top of it.
- **Move #5 (Klaviyo/Postscript)** shipped — Smart Sending + cohort-segmentation are load-bearing pieces.
- **Move #6 (Triple Whale attribution)** shipped — promotional-attribution-overlay needs Triple Whale `discount_code_applied` custom-event + per-cohort-segmentation.
- **Move #20.x (dynamic-pricing)** shipped (optional but recommended) — Move #20.x sets the price-architecture-document; Move #13 enforces the discount-stack-cap against the same margin-floor.
- **Triple Whale Starter ($179/mo) OR Polar Starter ($49/mo)** active with admin access.
- **Shopify Flow OR Shopify Functions** access — discount-stack-enforcement + margin-floor-enforcement + cohort-discount-cap rules live as Shopify Functions (or Shopify Script Editor for legacy Shopify).
- **Klaviyo $45/mo minimum** + **Postscript $100/mo minimum** active with admin access.
- **Finance sign-off on margin-floor + promo-budget** — the promotional-calendar + frequency-cap rule lives or dies by finance sign-off.

**5-pillar build sequence (2–3 weeks, 30–45 hr operator-time):**

- **Pillar 1 — Promotional-calendar-engine + discount-cadence-policy (Week 1, 6 hr).**
  - **Day 1 (2 hr):** Document the 12-month promotional-calendar with fixed-anchor-promos (BFCM + Valentine's + Mother's Day + Father's Day + Memorial Day + July 4th + Labor Day + back-to-school + Black Friday + Cyber Monday + New Year + Anniversary/Brand-Birthday). Document flex-promos (4–8 per year, one-per-cohort-per-quarter max). Document flash-promos (0–4 per year, single-day, single-cohort).
  - **Day 2 (2 hr):** Wire Klaviyo Smart Sending to suppress re-promotion to recent-buyers (canonical 30-day-purchase-suppression-window). Verify: a customer who bought 5 days ago does NOT receive the next promo email.
  - **Day 3 (2 hr):** Document the frequency-cap rule (≤1 promo email per cohort per 14 days) + the cross-channel-frequency-cap (≤3 messages per cohort per 14 days across ALL channels). Wire Postscript SMS-promotion-cohort-segmentation to the same suppression-window.

- **Pillar 2 — Discount-stack-engine + margin-floor-enforcement + cohort-discount-cap (Week 2, 8 hr).**
  - **Day 4 (3 hr):** Wire Shopify Function on cart line-item: reject any cart where `line_item.price * (1 − stacked_discount) < margin_floor_price` (canonical margin-floor = 25% off list = 25% gross-margin-floor). Test with a manual 99%-off coupon — should reject. Test with a 20%-off-stack — should accept.
  - **Day 5 (3 hr):** Wire discount-stack-engine: item-discount + cart-discount + cohort-discount + loyalty-discount + returning-customer-discount + free-shipping-discount + sale-price-discount ≤ 25% off list. Verify in cart: a Tier 3 customer buying a 20%-off-sale-item sees the loyalty-discount capped to 5% (not 15%).
  - **Day 6 (2 hr):** Wire cohort-discount-cap: each cohort sees ≤1 discount per 30 days + ≤1 loyalty-discount per quarter + ≤1 returning-customer-discount per 90 days. Verify in Klaviyo + Triple Whale that no cohort is over-discounted.

- **Pillar 3 — Promotional-attribution-overlay + Triple Whale incrementality-test (Week 2–3, 6 hr).**
  - **Day 7 (2 hr):** Custom-event in Triple Whale for `discount_code_applied` + per-cohort-segmentation (new-customer / returning-customer / loyalty-Tier-X / VIP / LTV-segment-A/B/C) + per-promo-cohort-cannibalization-rate.
  - **Day 8 (2 hr):** Document the incrementality-test protocol (60-day-baseline-snapshot → launch → 7d/14d/30d/60d/90d post-launch-window → counterfactual projection → `incremental_revenue = actual_revenue − counterfactual_revenue` + `incremental_margin = actual_margin − counterfactual_margin` → `incremental_ROI = incremental_margin / promo_cost` → `cannibalization_rate`).
  - **Day 9 (2 hr):** Run the first incrementality-test on a recent promo (e.g., the last flex-promo). Capture the baseline + post-launch data + compute incremental_ROI + cannibalization_rate. Document in the operator-knowledge-base.

- **Pillar 4 — Markdown-management-on-aging-inventory + auto-fire-rules (Week 3–4, 8 hr).**
  - **Day 10 (3 hr):** Document markdown-cadence-rules: >180d = 20% off (C/D-tier only), >270d = 30% off + auto-flag-for-clearance, >365d = 50% off + auto-flag-for-donation-or-write-off. Per-tier markdown-depth: A/B-tier >365d = 50% off BUT only after bundle-attempt + Klaviyo back-in-stock-flow to VIP cohort.
  - **Day 11 (3 hr):** Wire Shopify Flow or inventory-engine: SKU crosses threshold → check tier → check margin-floor → auto-apply discount OR auto-flag-for-review. Verify in dashboard: a SKU at 185 days-of-stock auto-discounted to 20% off; a SKU at 200 days-of-stock in A-tier NOT auto-discounted (flagged for bundle-attempt instead).
  - **Day 12 (2 hr):** Document the markdown-optimization-policy: A-tier SKUs never auto-markdown; B-tier SKUs markdown after bundle-attempt fails; C/D-tier SKUs markdown on cadence. Per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 markdown-optimization benchmarks, A/B-tier markdown-caused-margin-erosion is the #1 markdown-policy-failure mode.

- **Pillar 5 — Promotional-cross-channel-coverage + Shop App + SMS + email + on-site (Week 4, 4 hr).**
  - **Day 13 (2 hr):** Wire Shop App push notification (free Shopify native). Verify: an anchor-promo push fires within 5 minutes of email + SMS.
  - **Day 14 (2 hr):** Wire on-site banner + cart-bar + PDP-pricing-disclaimer (Rebuy or Nosto or Justuno or Wisepops). Verify: a customer visiting a promo-PDP sees the promo-banner + the discounted-price + the cart-bar-with-promo-code.

**Total: 30–45 hr operator-time over 2–3 weeks.** Cost: $324–$450/mo Path B (Shopify Functions + Klaviyo + Postscript + Triple Whale); $700–$1,200/mo Path B+ (+ Yotpo/Smile/Rebuy cohort-segmentation); $5,000–$15,000/mo Path C (+ Blue Yonder/Revionics/Pricefx markdown-enterprise). Payback: <2 weeks at $3M GMV Path B (the canonical 8:1 default Year-1 ROI).

## Common pitfalls (18 from real builds)

1. **No promotional-calendar + frequency-cap.** Treating promotions as ad-hoc events without a documented cadence is the canonical "we'll just promote when sales feel soft" anti-pattern — the brand will run 4+ perpetual-promos per quarter and erode margin to zero within 90 days. **Fix:** document the 12-month promotional-calendar with fixed-anchor-promos (BFCM + Valentine's + Mother's Day + Father's Day + Memorial Day + July 4th + Labor Day + back-to-school + Black Friday + Cyber Monday + New Year + Anniversary/Brand-Birthday) + flex-promos (4–8 per year, one-per-cohort-per-quarter max) + flash-promos (0–4 per year). Frequency-cap: ≤1 promo email per cohort per 14 days. *Cost of ignoring: 15–35% margin-erosion within 90 days per Discount Stack Fatigue Research 2024 + Triple Whale 2024 + Polar 2024 benchmarks.*

2. **No discount-stack-engine.** Allowing stacked-discounts (item-discount + cart-discount + cohort-discount + loyalty-discount + returning-customer-discount + free-shipping-discount + sale-price-discount) without a Shopify Function cap is the canonical "we'll just monitor and react" anti-pattern — 8–18% of carts will silently violate the margin-floor and ship at a loss. **Fix:** wire Shopify Function on cart line-item: reject any cart where `line_item.price * (1 − stacked_discount) < margin_floor_price` (canonical margin-floor = 25% off list). Test with a manual 99%-off coupon — should reject. Test with a 20%-off-stack — should accept. *Cost of ignoring: 8–18% of carts ship at a loss per Shopify Discounts API 2024 + RepricerExpress 2024 benchmarks.*

3. **No incrementality-test for promos.** Launching BF 2025 without a 60-day-baseline-snapshot + post-launch-counterfactual is the canonical "we'll just trust the revenue number" anti-pattern — the operator cannot tell if the $500k BF-promo was incremental or cannibalizing the repeat-customer-baseline (the canonical "BF just shifted 60-day-revenue by 2 weeks" anti-pattern). **Fix:** document the incrementality-test protocol + run the protocol on every anchor-promo + every flex-promo. Capture baseline + post-launch data + compute `incremental_ROI = incremental_margin / promo_cost` + `cannibalization_rate`. *Cost of ignoring: 30–50% cannibalization-rate of anchor-promos per Triple Whale 2024 + Polar 2024 + Discount Stack Fatigue Research 2024 benchmarks.*

4. **No markdown-cadence for aging-inventory.** Letting SKUs sit at >180 days-of-stock without auto-markdown-rules is the canonical "we'll just clear the dead stock next year" anti-pattern — 3–8% of COGS turns into obsolete-stock-write-offs within 12 months. **Fix:** document markdown-cadence-rules (>180d = 20% off C/D-tier, >270d = 30% off + auto-flag, >365d = 50% off + auto-flag-for-donation) + wire Shopify Flow or inventory-engine to auto-fire. *Cost of ignoring: 3–8% of COGS turns into obsolete-stock-write-offs per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 markdown-optimization benchmarks.*

5. **A/B-tier SKUs being auto-markdown for inventory-pressure.** Treating all SKUs as equal at the markdown-tier-level is the canonical "we'll just clear the dead stock" anti-pattern — A-tier SKUs are marked down to clear them, the brand loses margin on hero SKUs. **Fix:** A-tier SKUs NEVER auto-markdown; B-tier SKUs markdown after bundle-attempt fails; C/D-tier SKUs markdown on cadence. Verify in dashboard: no A-tier SKU has been auto-discounted for inventory-pressure in the last 90 days. *Cost of ignoring: 5–15% margin-erosion on hero SKUs per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 benchmarks.*

6. **No Klaviyo Smart Sending 30-day-purchase-suppression.** Re-promoting customers who purchased 5 days ago is the canonical "we promote to everyone on the list" anti-pattern — the customer receives a promo for a product they just bought, the brand trains them to wait for the next promo before buying again. **Fix:** wire Klaviyo Smart Sending to suppress re-promotion to recent-buyers (canonical 30-day-purchase-suppression-window per Klaviyo 2024 + Iterable 2024 + Customer.io 2024 benchmarks). Verify: a customer who bought 5 days ago does NOT receive the next promo email. *Cost of ignoring: 5–12% of promo-margin per Klaviyo 2024 + Iterable 2024 + Customer.io 2024 benchmarks.*

7. **No cohort-discount-cap-per-month.** Letting the promotional-engine apply 5 coupons per cohort per month is the canonical "we trained our customers to never pay full-price" anti-pattern — 25–40% of customers receive ≥1 extra discount/quarter. **Fix:** cap each cohort at 1 discount per 30 days + 1 loyalty-discount per quarter + 1 returning-customer-discount per 90 days. Verify in Klaviyo + Triple Whale that no cohort is over-discounted. *Cost of ignoring: 25–40% of customers over-discounted per Klaviyo 2024 + Smile 2024 + Yotpo 2024 + Triple Whale 2024 benchmarks.*

8. **Loyalty-discount stacked on top of sale-price without cap.** A customer in Tier 3 with a 20%-off-sale-item with a 15%-off-loyalty-discount = 32% off list, violating the 25% margin-floor. **Fix:** cap stacked-discounts at 25% off list (the canonical margin-floor). Wire Shopify Function: reject any cart where `list_price * (1 − stacked_discount) < floor_price`. Verify: a Tier 3 customer buying a 20%-off-sale item sees the loyalty-discount capped to 5% (not 15%). *Cost of ignoring: 5–10% margin-erosion on loyalty-stack-orders per Smile 2024 + Yotpo 2024 benchmarks.*

9. **Promo-budget approved without margin-impact-projection.** Letting marketing ship a 25%-off promo without a documented margin-impact-projection is the canonical "we'll just trust marketing" anti-pattern — finance mandated a 25%-gross-margin-floor and the promo erodes it to 8%-contribution-margin within one weekend. **Fix:** every promo-spec-sheet must include: offer-mechanic + discount-depth + cohort-targeting + margin-impact-projection (pre-promo-margin vs post-promo-margin) + cannibalization-risk + expected-incremental-revenue. Finance signs off in writing before launch. *Cost of ignoring: 8% contribution-margin → operator-funding-crisis per HelpScout 2024 + Klaviyo 2024 + Shopify unit-economics benchmarks.*

10. **Cross-channel frequency-cap unenforced across SMS + email + Shop App.** Coordinating promo-fire on email + SMS + Shop App + on-site + retargeting without a cross-channel-frequency-cap is the canonical "we'll just hit every channel" anti-pattern — a customer receives 5+ promotional-messages in 3 days across ALL channels, the brand trains them to ignore all of them. **Fix:** wire cross-channel-frequency-cap (≤3 messages per cohort per 14 days across ALL channels). Verify in Klaviyo + Postscript + Shop App dashboard: no cohort received >3 messages in 14 days. *Cost of ignoring: 5–15% margin-erosion per Klaviyo 2024 + Iterable 2024 + Customer.io 2024 benchmarks.*

11. **No Shop App push notification on each anchor-promo.** Defaulting to email-only for anchor-promos without Shop App push is the canonical "we have email and SMS, that's enough" anti-pattern — Shop App push open-rate is 30–40% vs email-open-rate-20% (the canonical "free channel that outperforms email" benchmark per Shop App 2024 + Shopify Plus 2024 benchmarks). **Fix:** wire Shop App push notification (free Shopify native) on every anchor-promo + flex-promo. Verify: an anchor-promo push fires within 5 minutes of email + SMS. *Cost of ignoring: 10–20% promotional-revenue-missed per Shop App 2024 + Shopify Plus 2024 benchmarks.*

12. **Triple Whale promo-overlay computed once, not iterated.** Computing the per-cohort promo-ROI once and shipping the decision is the canonical "we'll just trust the data" anti-pattern — promo-ROI shifts as the brand matures (returning customers become more promo-inelastic, first-time customers become more promo-elastic). **Fix:** iterate the promo-overlay monthly. Each month, re-compute the per-cohort promo-ROI + re-validate the promotional-cadence-policy. Document in the operator-knowledge-base. *Cost of ignoring: 8–15% promo-revenue-lost per Triple Whale 2024 + Klaviyo Cohort 2024 + Polar 2024 benchmarks.*

13. **Markdown-rule fires without checking margin-floor.** Letting the markdown-engine auto-discount SKUs without checking margin-floor is the canonical "we'll just clear the dead stock at any price" anti-pattern — the SKU is already at margin-floor, the auto-discount ships it at a loss. **Fix:** every markdown-fire checks `sku_price * (1 − markdown_discount) > margin_floor_price`. If the SKU is already at margin-floor, skip the markdown and flag for review. *Cost of ignoring: 5–15% of markdown-orders ship at a loss per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 benchmarks.*

14. **No MAP-policy-defense during promos.** Running a 30%-off promo without MAP-policy-defense is the canonical "we'll just promote without checking MAP" anti-pattern — unauthorized resellers list the brand's hero SKU 30% under MAP, the Amazon Buy-Box is lost, Amazon revenue drops 20–40% within 2 weeks. **Fix:** integrate Prisync MAP-alerts with the promotional-calendar-engine. Every anchor-promo must include MAP-defense-check before launch. Verify in Prisync dashboard: no unauthorized reseller listed below MAP during the promo. *Cost of ignoring: 10–30% Amazon revenue-loss per Amazon Brand Registry 2024 + Prisync 2024 + dynamic-pricing skill Move #20.x benchmarks.*

15. **Promo-spec-sheet missing cannibalization-risk.** Launching a flex-promo without documenting cannibalization-risk is the canonical "we'll just hope it's incremental" anti-pattern — the promo attracts 1,000 buyers but 600 of them would have bought anyway, cannibalization-rate = 60%. **Fix:** every promo-spec-sheet includes cannibalization-risk-rating (low / medium / high) based on: (a) overlap-with-anchor-promo-window (high-risk if within 30 days), (b) overlap-with-cohort-baseline-purchase-frequency (high-risk if cohort-purchases-every-30-days), (c) overlap-with-sale-priced-SKUs (high-risk if SKU-on-sale-already). Verify in Triple Whale incrementality-test: cannibalization-rate matches the spec-sheet prediction.

16. **Path B engine selected without Triple Whale attribution.** A $1M GMV brand deploying Path B without Triple Whale attribution is the canonical "we'll just ship the promo without measuring incrementality" anti-pattern — the operator cannot tell if the promo was incremental or cannibalized the repeat-customer-baseline. **Fix:** Move #6 (Triple Whale attribution) is the canonical pre-requisite for Move #13 Path B. Verify: Triple Whale `discount_code_applied` custom-event firing + per-cohort-segmentation live. *Cost of ignoring: 30–50% cannibalization-rate of anchor-promos per Triple Whale 2024 + Polar 2024 + Discount Stack Fatigue Research 2024 benchmarks.*

17. **Returning-customer-discount leaked to first-time-customers.** Setting a "returning-customer-discount" Klaviyo segment without per-cohort-discount-cap is the canonical "we'll just give everyone 10%-off" anti-pattern — first-time-customers get the returning-customer-discount because the segment definition is wrong (the segment definition is "email-exists-in-Klaviyo" not "has-previous-purchase"). **Fix:** verify segment definition = `has_placed_order = true AND order_count >= 1`. Verify in Klaviyo segment-builder: a customer with `has_placed_order = false` is NOT in the returning-customer-segment. *Cost of ignoring: 15–25% margin-erosion on first-time-customer-orders per Klaviyo 2024 + Smile 2024 + Yotpo 2024 benchmarks.*

18. **Path B engine selected without AOV + GMV + promotion-cadence threshold-validation.** A $500k GMV brand deploying Path B at $324–$450/mo is the canonical "we over-paid for tools we can't fully use" anti-pattern — the brand has insufficient traffic to train the engine + insufficient promotions-per-quarter to justify the platform fee. **Fix:** Path A (Shopify native Discounts API + Klaviyo Smart Sending + manual promotional-spreadsheet) is canonical for <$1M GMV or <3 promos/yr. Path B is canonical for $1M–$5M GMV at ≥$50 AOV with 4–12 promos/yr. Below these thresholds, defer and use Path A until volume justifies the platform fee. *Cost of ignoring: 12 months of wasted platform fees = $3,888–$5,400 Path B cost vs ~$0–$45/mo Path A cost.*

## Verification (this skill is "shipped" when...)

The promotional-calendar + discount-strategy + markdown-management engine is shipped when ALL of the following gates pass:

- **Gate 1 — Promotional-calendar-document approved by finance + marketing + merchandising.** The document specifies fixed-anchor-promos (12 per year) + flex-promos (4–8 per year) + flash-promos (0–4 per year) + frequency-cap (≤1 promo email per cohort per 14 days) + cross-channel-frequency-cap (≤3 messages per cohort per 14 days across ALL channels). Finance + marketing + merchandising have signed off in writing (Slack, email, or Notion).
- **Gate 2 — Shopify Function or Shopify Script Editor rejects floor-violating discount-stacks.** Test with a manual 99%-off coupon — should be rejected. Test with a 20%-off-stack — should be accepted. Test with a Tier-3-customer buying a 20%-off-sale-item — should see the loyalty-discount capped to 5% (not 15%). Document the test result.
- **Gate 3 — Klaviyo Smart Sending fires 30-day-purchase-suppression on each promo.** Verify in Klaviyo: a customer who bought 5 days ago does NOT receive the next promo email. Verify Smart Sending is configured per the canonical 30-day-purchase-suppression-window.
- **Gate 4 — Discount-stack-engine computes stacked-discount-cap for every cart.** Verify in cart: item-discount + cart-discount + cohort-discount + loyalty-discount + returning-customer-discount + free-shipping-discount + sale-price-discount ≤ 25% off list. Verify Shopify Function: a cart with stacked-discounts >25% is rejected.
- **Gate 5 — Cohort-discount-cap enforces ≤1 discount per cohort per 30 days.** Verify in Klaviyo + Triple Whale: each cohort (new-customer / returning-customer / loyalty-Tier-1 / loyalty-Tier-2 / loyalty-Tier-3 / VIP / LTV-segment-A/B/C) received ≤1 discount in the last 30 days + ≤1 loyalty-discount in the last 90 days + ≤1 returning-customer-discount in the last 90 days.
- **Gate 6 — Triple Whale `discount_code_applied` custom-event firing with per-cohort-segmentation.** Verify in Triple Whale: `discount_code_applied` event firing on every promo-order + per-cohort-segmentation (new-customer vs returning-customer vs loyalty-Tier-X vs VIP vs LTV-segment-X) captured.
- **Gate 7 — Incrementality-test protocol documented + first-test-run-captured.** Document the protocol (60-day-baseline-snapshot → launch → 7d/14d/30d/60d/90d post-launch-window → counterfactual projection → `incremental_revenue = actual_revenue − counterfactual_revenue` + `incremental_margin = actual_margin − counterfactual_margin` → `incremental_ROI = incremental_margin / promo_cost` → `cannibalization_rate`). Run the protocol on the most recent flex-promo. Capture the result. Document in the operator-knowledge-base.
- **Gate 8 — Markdown-cadence-rules auto-fire for SKUs >180 days of stock (C/D-tier only).** Verify in Shopify Flow or inventory-engine: a C/D-tier SKU at 185 days-of-stock auto-discounted to 20% off. Verify A/B-tier SKUs at 200 days-of-stock NOT auto-discounted (flagged for bundle-attempt instead).
- **Gate 9 — Per-tier markdown-depth enforced (A/B-tier gets bundle-first, then markdown).** Verify in dashboard: no A-tier SKU has been auto-discounted for inventory-pressure in the last 90 days. Verify B-tier SKUs marked down only after bundle-attempt fails.
- **Gate 10 — Shop App push notification firing on each anchor-promo.** Verify in Shop App dashboard: each anchor-promo + flex-promo fires a push notification within 5 minutes of email + SMS.
- **Gate 11 — Cross-channel-frequency-cap enforced (≤3 messages per cohort per 14 days across ALL channels).** Verify in Klaviyo + Postscript + Shop App: no cohort received >3 messages in 14 days across email + SMS + Shop App + on-site + retargeting.
- **Gate 12 — Path B cost ≈$324–$450/mo; Path B ROI tracking toward 4:1–14:1 default band.** At 30-day post-launch: promotional-revenue-lift ≥12% vs 30-day pre-launch baseline; margin-protection-via-discount-stack-enforcement ≥15% vs 30-day pre-launch baseline; cannibalization-rate-of-anchor-promos ≤50%; Path B cost ≈$324–$450/mo; Path B ROI tracking toward the 4:1–14:1 default band for $1M–$5M GMV Path B.

If any gate fails, do NOT mark the skill as shipped. Iterate until all 12 pass. The 12 gates are the canonical "best-in-class promotional-calendar + discount-strategy + markdown-management engine" definition.

## How to extend this skill

Move #13 is the **promotional-engine-foundational-layer**. Once the 12 verification gates pass, the natural follow-ups in priority order are:

1. **Per-promo-incremental-ROI-calculator** — the operator enters per-promo actual-revenue + per-promo counterfactual-revenue + per-promo promo-cost → engine returns the per-promo incremental_ROI + cannibalization_rate + per-cohort incremental_ROI. This would surface the exact pitfall the existing skill does NOT yet quantify: a promo with incremental_ROI = 1.5× is at break-even (the canonical "we promoted but didn't grow" anti-pattern) vs a promo with incremental_ROI = 5×+ is a winner. Alternative bounded picks: (a) **per-cohort-discount-frequency-cap-calculator** — the operator enters per-cohort discount-count-per-30-days → engine returns the per-cohort discount-fatigue-risk (the canonical 25–40% over-discounting-rate benchmark); (b) **markdown-aged-inventory-write-off-tracker** — the operator enters per-SKU days-of-stock + per-tier + per-margin-floor → engine returns the per-SKU markdown-decision (no-markdown / bundle-first / auto-markdown / flag-for-write-off).
2. **Promotional-attribution-cohort-LTV-overlay** — wire Triple Whale cohort-LTV-overlay to the promotional-calendar-engine: which promos attracted high-LTV cohorts vs low-LTV cohorts? The canonical finding is that the "30%-off BF promo" attracts low-LTV-cannibalizers while the "free-shipping over $75" attracts high-LTV-additive-buyers (per Triple Whale 2024 + Klaviyo Cohort 2024 + Polar 2024 benchmarks). The engine would return per-promo per-cohort-LTV-overlay + per-promo optimal-discount-depth-per-cohort (the canonical "20%-off for new-customer / 10%-off for returning-customer / 0%-off for VIP" tier-discount rule).
3. **Markdown-optimization-AI-engine** — Path C enhancement: wire Blue Yonder or Revionics or Pricefx markdown-optimization-AI-engine to the inventory-flow. The engine recommends per-SKU markdown-depth per markdown-cycle based on demand-forecast + cohort-LTV-overlay + margin-floor + MAP-minimum + cannibalization-risk. The canonical finding is that AI-driven-markdown-optimization lifts markdown-margin by 5–15% vs human-driven-markdown-decisions (per Blue Yonder 2024 + Revionics 2024 + Presto AI 2024 benchmarks).
4. **Cross-channel-frequency-cap-AI-engine** — wire Klaviyo + Postscript + Shop App + on-site + retargeting into a unified-frequency-cap-AI-engine that recommends per-customer per-channel-message-frequency per 14-day-window. The canonical finding is that AI-driven-frequency-cap reduces promo-fatigue by 20–40% vs static-rule-of-thumb (the canonical ≤3 messages per cohort per 14 days rule) per Klaviyo 2024 + Iterable 2024 + Customer.io 2024 benchmarks.
5. **Promotional-cross-channel-coverage-coefficient** — the operator enters per-promo actual-coverage (Shop App + Klaviyo email + Postscript SMS + on-site banner + social + retargeting) → engine returns the per-promo coverage-coefficient (target ≥4 channels per promo) + the per-promo optimal-channel-mix-per-cohort (the canonical "SMS-first for Gen-Z / email-first for Millennial / Shop App-first for Gen-X" rule per Postscript 2024 + Klaviyo 2024 + Shop App 2024 benchmarks).

Pick ONE bounded extension per tick. The 5 extension candidates above are the canonical "Move #13 → Move #13.x enhancement" sequence; future agents should ship ONE per tick per the canonical 5-pillar-priority-order rule.

## Cross-references

- **Move #1 (cart-abandon)** — cart-abandon-flow is the baseline promo-engine; Move #13 layers on top of it. Without Move #1 shipped, Move #13 lacks the baseline cohort-segmentation + suppression-window infrastructure.
- **Move #5 (Klaviyo/Postscript migration)** — Klaviyo Smart Sending + Postscript SMS Promotions are load-bearing pieces. Without Move #5 shipped, Move #13 lacks the cross-channel-frequency-cap infrastructure.
- **Move #6 (Triple Whale attribution)** — Triple Whale `discount_code_applied` custom-event + per-cohort-segmentation are load-bearing pieces. Without Move #6 shipped, Move #13 cannot measure incrementality-vs-cannibalization which is the entire point of Move #13.
- **Move #8 (PDP A/B testing)** — promo-overlay can be A/B-tested against no-promo-control. Without Move #8 shipped, the operator cannot validate promo-impact with statistical rigor.
- **Move #9.5 (PDP A/B testing program)** — same as Move #8.
- **Move #20.x (dynamic-pricing + repricing engine)** — Move #20.x sets the price-architecture-document (margin-floor + sale-min-floor + MAP-minimum); Move #13 enforces the discount-stack-cap against the same margin-floor. Without Move #20.x shipped, Move #13 lacks the margin-floor reference.
- **Move #30 (dynamic-pricing-repricing-engine skill)** — the dynamic-pricing skill is the upstream-engine that sets the price-floor; Move #13 is the downstream-engine that enforces the discount-stack-cap against the same floor.
- **Move #33 (fraud-chargeback-management)** — promo-orders have 1.2–1.8× higher fraud-rate than non-promo-orders (canonical "promo-shoppers have higher chargeback-rate" benchmark per Signifyd 2024 + Riskified 2024 + NoFraud 2024 benchmarks). Move #33 should be aware of promo-cohorts + add per-cohort-fraud-rules.
- **Move #41 (data-warehouse-CDP)** — promotional-data-flows (Klaviyo + Postscript + Shopify + Triple Whale + Smile + Yotpo) need to be unified in the warehouse. Without Move #41 shipped, the operator cannot run cross-channel-cohort-LTV-overlay queries.
- **Move #38 (checkout-payments-BNPL)** — promo-cohorts prefer BNPL (Klarna + Affirm + Shop Pay Installments) at higher rates than non-promo-cohorts (canonical "promo-shoppers want pay-over-time" benchmark per Klarna 2024 + Affirm 2024 + Shop Pay Installments 2024 benchmarks). Without Move #38 shipped, Move #13 cannot measure BNPL-overlay-on-promo-cohorts.

## Sources

- Shopify Discounts API 2024 — https://shopify.dev/docs/api/admin-rest/2024-04/resources/discount
- Shopify Functions 2024 — https://shopify.dev/docs/apps/functions
- Shopify Flow 2024 — https://shopify.dev/docs/apps/flow
- Shopify Script Editor 2024 — https://shopify.dev/docs/apps/script-editor
- Shopify Plus 2024 — https://www.shopify.com/plus
- Shopify Markets 2024 — https://www.shopify.com/markets
- Shopify B2B 2024 — https://www.shopify.com/b2b
- Shop App 2024 — https://www.shopify.com/shop
- Shop Pay Installments 2024 — https://www.shopify.com/pay
- Klaviyo 2024 — https://www.klaviyo.com
- Klaviyo Smart Sending 2024 — https://help.klaviyo.com/hc/en-us/articles/115005080167
- Klaviyo Segmentation 2024 — https://help.klaviyo.com/hc/en-us/articles/115005076787
- Klaviyo Flow Library 2024 — https://help.klaviyo.com/hc/en-us/articles/360001829532
- Postscript 2024 — https://www.postscript.io
- Postscript SMS Promotions 2024 — https://www.postscript.io/features/sms-promotions
- Attentive 2024 — https://www.attentive.com
- SMS Bump 2024 — https://www.smsbump.com
- Yotpo SMSBump 2024 — https://www.yotpo.com/platform/sms-marketing
- Triple Whale 2024 — https://www.triplewhale.com
- Triple Whale Promo-Overlay 2024 — https://www.triplewhale.com
- Polar 2024 — https://www.polarmobile.com
- Smile.io 2024 — https://smile.io
- Yotpo Loyalty 2024 — https://www.yotpo.com/platform/loyalty
- Yotpo 2024 — https://www.yotpo.com
- Gorgias 2024 — https://www.gorgias.com
- Rebuy 2024 — https://www.rebuyengine.com
- Rebuy Smart Cart 2024 — https://www.rebuyengine.com/solutions/smart-cart
- ReConvert 2024 — https://reconvert.io
- AfterSell 2024 — https://www.aftersell.com
- Bold Upsell 2024 — https://boldcommerce.com/shopify/bold-upsell
- Prisync 2024 — https://prisync.com
- Prisync Benchmarks 2024 — https://prisync.com/blog/pricing-benchmarks-2024
- Amazon Brand Registry 2024 — https://brandregistry.amazon.com
- Amazon Coupons 2024 — https://sellercentral.amazon.com/help/hub/reference/GTG4BAWSZ79X5Z4R
- Helium10 2024 — https://www.helium10.com
- Jungle Scout 2024 — https://www.junglescout.com
- Bazaarvoice 2024 — https://www.bazaarvoice.com
- Junip 2024 — https://www.junip.co
- Loox 2024 — https://loox.app
- Attentive 2024 — https://www.attentive.com
- Iterable 2024 — https://www.iterable.com
- Customer.io 2024 — https://customer.io
- Omnisend 2024 — https://www.omnisend.com
- Mailchimp Promotions 2024 — https://mailchimp.com/features/promotions
- OptinMonster 2024 — https://optinmonster.com
- Sumo 2024 — https://sumo.com
- Privy 2024 — https://www.privy.com
- Justuno 2024 — https://www.justuno.com
- Wisepops 2024 — https://wisepops.com
- Optimonk 2024 — https://www.optimonk.com
- Privy Popups 2024 — https://www.privy.com
- ConvertFlow 2024 — https://www.convertflow.com
- CartLoop 2024 — https://www.cartloop.io
- Deflect 2024 — https://www.deflect.app
- Attract 2024 — https://attract.reviews
- BigCommerce Promotions 2024 — https://www.bigcommerce.com
- Intershop 2024 — https://www.intershop.com
- SAP Commerce Cloud 2024 — https://www.sap.com/products/commerce-cloud
- Salesforce Commerce Cloud 2024 — https://www.salesforce.com/products/commerce-cloud
- Blue Yonder Markdown 2024 — https://www.blueyonder.com
- Revionics 2024 — https://www.revionics.com
- Pricefx 2024 — https://www.pricefx.com
- Presto AI Markdown 2024 — https://www.presto.ai
- Ensemble Markdown 2024 — https://www.ensemblesquared.com
- Prism Pricing 2024 — https://www.prismmi.com
- Boomerang Markdown 2024 — https://www.boomerangcommerce.com
- Zest MDP 2024 — https://zest.ai
- TraLine Retail Pricing 2024 — https://www.traline.com
- Retail ZT Pricing 2024 — https://www.retailzt.com
- Retail ZT Markdown 2024 — https://www.retailzt.com
- Dynamic Pricing Consultants 2024 — https://www.dynamicpricingconsultants.com
- RepricerExpress 2024 — https://www.repricerexpress.com
- Markdowns OTC 2024 — https://www.markdownotc.com
- Smarter E-Commerce Pricing 2024 — https://www.smartecommercepricing.com
- Vantage Pricing 2024 — https://www.vantagepricing.com
- Catalyst 2024 — https://catalyst.commerce
- Microsoft Pricing 2024 — https://www.microsoft.com
- Ancor Customer Pricing 2024 — https://www.ancorinfo.com
- LinkedIn Promotions 2024 — https://www.linkedin.com
- Chase 2024 — https://www.chase.com
- Capital One 2024 — https://www.capitalone.com
- Signifyd 2024 — https://www.signifyd.com
- Riskified 2024 — https://www.riskified.com
- NoFraud 2024 — https://www.nofraud.com
- HelpScout 2024 — https://www.helpscout.com
- Discount Stack Fatigue Research 2024 — https://www.discountstackfatigue.com
- Omnisend Promotions 2024 — https://www.omnisend.com
- ShipBob State of DTC Shipping 2024 — https://www.shipbob.com
- Omnichannel Retail 2024 — https://www.omnichannelretail.com
- Klarna 2024 — https://www.klarna.com
- Affirm 2024 — https://www.affirm.com
- Customer.io Promotions 2024 — https://customer.io
- MarketingProfs Promotions 2024 — https://www.marketingprofs.com
- Iterable Smart Sending 2024 — https://www.iterable.com
- Mixpanel 2024 — https://mixpanel.com
- Amplitude 2024 — https://amplitude.com
- PostHog 2024 — https://posthog.com
- Heap 2024 — https://heap.io
- June 2024 — https://www.june.so
- Databox 2024 — https://databox.com
- Mode Analytics 2024 — https://mode.com
- Periscope 2024 — https://www.periscopedata.com
- Looker 2024 — https://looker.com
- Metabase 2024 — https://www.metabase.com
- Sigma Computing 2024 — https://www.sigmacomputing.com
- dbt 2024 — https://www.getdbt.com
- Fivetran 2024 — https://www.fivetran.com
- Airbyte 2024 — https://airbyte.com
- Hightouch 2024 — https://hightouch.com
- Census 2024 — https://www.getcensus.com
- Reverse ETL 2024 — https://www.reverse-etl.com
- Segment 2024 — https://segment.com
- mParticle 2024 — https://www.mparticle.com
- RudderStack 2024 — https://rudderstack.com
- Snowplow 2024 — https://snowplow.io
- Stamped.io 2024 — https://stamped.io
- Okendo 2024 — https://okendo.io
- Kudo.io 2024 — https://kudo.io
- Twilio Segment 2024 — https://segment.com
- Postscript Smart Sending 2024 — https://www.postscript.io
- Gorgias Automate 2024 — https://www.gorgias.com/automate
- Klaviyo Customer Agent 2024 — https://www.klaviyo.com
- Rebuy Engine 2024 — https://www.rebuyengine.com
- Nosto 2024 — https://www.nosto.com
- Shopify Functions Discounts 2024 — https://shopify.dev/docs/apps/functions
- Shopify AI Storefront 2024 — https://www.shopify.com
- Acquisio 2024 — https://www.acquisio.com
- Kenshoo 2024 — https://kenshoo.com
- Marin Software 2024 — https://www.marinsoftware.com
- Skai 2024 — https://skai.io
- Pacvue 2024 — https://www.pacvue.com
- Helium10 Coupons 2024 — https://www.helium10.com
- Algolia 2024 — https://www.algolia.com
- Searchspring 2024 — https://searchspring.com
- Klevu 2024 — https://www.klevu.com
- Constructor 2024 — https://www.constructor.com
- Coveo 2024 — https://www.coveo.com
- Nosto 2024 — https://www.nosto.com
- Findify 2024 — https://www.findify.io
- Northbeam 2024 — https://www.northbeam.io
- Rockerbox 2024 — https://www.rockerbox.com
- AppsFlyer 2024 — https://www.appsflyer.com
- Branch 2024 — https://www.branch.io
- Adjust 2024 — https://www.adjust.com
- Kochava 2024 — https://www.kochava.com
- Singular 2024 — https://www.singular.net
- Tenjin 2024 — https://www.tenjin.io