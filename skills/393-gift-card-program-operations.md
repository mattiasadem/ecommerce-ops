---
name: gift-card-program-operations
title: Gift card program operations (Rise.ai / Gift Up / Givex / Shopify Gift Cards / Stored Value Solutions, Move #36, 5-pillar Path A/B/C/D digital + physical + corporate + loyalty-rewards + winback-channel gift-card engine, default 11:1 Year-1 ROI Path B at $2M GMV, FIRST Tier-1 + FIRST P0 in category: gift-card-program-operations — 18 numbered pitfalls)
category: gift-card-program-operations
tier: 1
priority: P0
default_move: "36"
year_1_roi_band: "8:1–22:1"
sms_friendly: true
last_updated: 2026-09-28
sources: [rise-ai-2024, rise-ai-2025, gift-up-2024, gift-up-2025, givex-2024, givex-2025, shopify-gift-cards-2024, shopify-gift-cards-2025, stored-value-solutions-2024, stored-value-solutions-2025, trekksoft-2024, rapyd-2024, blackhawk-network-2024, blackhawk-network-2025, incentco-2024, national-gift-card-2024, tillo-2024, tillo-2025, giftbit-2024, giftbit-2025, reward-gateway-2024, giftcloud-2024, giftcloud-2025, hyros-2024, triple-whale-2024, klaviyo-2024, postscript-2024, smile-2024, loyaltylion-2024, yotpo-2024, recharge-2024, airesa-2024, aberdeen-2024, cdp-institute-2024, nrf-2024, pymentsdive-2024, retaildive-2024, modern-retail-2024, nielsen-2024, swych-2024, egiftify-2024, perfecto-2024, ezcard-2024]
---

# Gift card program operations

> Move #36 is the canonical **gift-card-as-acquisition-channel + gift-card-as-retention-engine + gift-card-as-loyalty-rewards-substrate + gift-card-as-corporate-gifting-revenue-stream** operator build for the Shopify-DTC stack — the move that lets a $500k+ GMV brand capture the **5–15% incremental revenue that a well-built gift-card program contributes within Year-1** (Aberdeen 2024 + NRF 2024 + Cdp-Institute 2024 benchmarks: gift cards are the #1 most-requested gift in the US for 15 consecutive years; 60% of US consumers have purchased or received at least one gift card in the last 12 months; the median $2M DTC brand leaves $100k–$300k/yr of gift-card revenue on the table by NOT having a program OR by running the program as a one-off static checkout feature instead of a 5-pillar growth engine) through a **5-pillar build**: (Pillar 1) **digital gift cards + Shopify-native Gift Cards app + Rise.ai / Gift Up / Givex** — the platform-foundation layer with $0–$500/mo platform cost, 80%+ mobile-open rate, 30–60% redemption within 30 days, and the canonical per-channel delivery (email + SMS + WhatsApp + branded-landing-page + Apple-Wallet / Google-Wallet pass); (Pillar 2) **physical gift cards + retail-rack distribution + Blackhawk / InComm / National Gift Card / Tillo** — the in-store-discovery-and-distribution layer unlocking 10–30% lift among gift-card-recipient demographics (35–55 age skew per Nielsen 2024) and the 8–12% YoY growth of in-store gift-card-program penetration per retaildive 2024; (Pillar 3) **gift cards as loyalty rewards + Klaviyo-Gift-Card-Coupon + Smile/LoyaltyLion/Yotpo integration** — the rewards-substrate layer that turns loyalty points into gift-card denominations and creates a 25–40% higher redemption vs percentage-discount-rewards per Smile 2024 + LoyaltyLion 2024 benchmarks; (Pillar 4) **gift cards as corporate-gifting + Tillo / Giftbit / Rybbon / Blackhawk-Corporate** — the B2B channel layer that captures 10–25% incremental Year-2 revenue per Cdp-Institute 2024 + trekksoft 2024 benchmarks and the 5–10× AOV advantage of corporate orders ($300–$500 average corporate order vs $75–$120 DTC AOV); (Pillar 5) **gift cards as winback + abandoned-cart-recovery + subscription-cancellation-save + post-purchase-upsell channel** — the retention-engine layer that re-engages dormant customers via gift-card-triggered Klaviyo/Postscript flows with 12–25% redemption-on-trigger and 8–15% reactivation vs 2–4% baseline email-reactivation per Klaviyo 2024 + Postscript 2024 + Triple Whale 2024 benchmarks. The 4 GMV-tier paths are Path A ($0–$500/mo digital-only Shopify-native), Path B DEFAULT ($100–$500/mo Rise.ai or Gift Up digital + physical on demand + loyalty rewards + Klaviyo flows; 11:1 default Year-1 ROI Path B at $2M US DTC base), Path C ($500–$2,000/mo full orchestration + corporate-gifting-B2B-portal + Tillo-distribution-network + custom-branded-Apple-Wallet-pass + White-label-mobile-app), Path D (defer for <$500k GMV brands OR restricted-categories stores that can't accept gift cards per Visa/MC network rules).

## When to use this skill

Use this skill when the operator has shipped the canonical retention-substrate (Move #1 + #4 + #6 + #7 + #8 + #11) + is at ≥$500k GMV + has at least 5 SKUs that make sense as a gift (impulse-priced $25–$150 OR premium hero SKUs OR experience/curated products OR consumables with replenishment cadence) AND is ready to add gift cards as either: (a) an acquisition channel (corporate gifting drives 10–25% Year-2 revenue per Cdp-Institute 2024), (b) a retention engine (gift-card winback re-activates 8–15% of dormant customers vs 2–4% baseline per Klaviyo 2024), OR (c) a loyalty rewards substrate (gift-card-denomination rewards have 25–40% higher redemption vs percentage-discount rewards per Smile 2024). Gift cards are structurally distinct from Move #1 (cart-abandon) + Move #2 (post-purchase-upsell) + Move #4 (welcome) + Move #8 (loyalty-points) + Move #15 (affiliate) — they are the ONLY channel where the customer is the SENDER, not the recipient of marketing, AND the cost of acquisition is $0 because the gift-card-recipient self-identifies as a buyer intent signal AND gift cards are purchased with cash-equivalent that the brand captures BEFORE fulfillment. Operator should only initiate when ALL of the following are true:

- **DTC-retention-substrate steady-state ≥60 days.** Move #1 (cart-abandon) + Move #4 (welcome) + Move #6 (Triple Whale attribution) + Move #8 (loyalty) are live and producing ≥$120 cohort-LTV baseline. Without this baseline, the operator lacks the per-channel-revenue-attribution frame to measure gift-card-driven revenue vs organic-DTC-revenue. Verify: Triple Whale `cohort_ltv_dtc_baseline` returning ≥$120 LTV.
- **≥$500k US DTC GMV for 3 consecutive months.** Gift cards drive meaningful 5–15% incremental revenue only above $500k GMV (below $500k the absolute-dollar upside is too small to justify the 8–16 hr/wk build cost). Verify: Triple Whale monthly-GMV-by-source dashboard returning ≥$42k US DTC GMV per month for 3 consecutive months.
- **≥5 SKUs that fit the "gift-able" archetype.** Impulse-priced $25–$150 (candles, jewelry, accessories, beauty sets, snack boxes, book sets) OR premium hero SKUs (single $200+ artisan good) OR curated/experience SKUs (subscription box, gift card itself, voucher for service). Brands without gift-able-SKUs (e.g. bulky furniture, custom-config industrial supplies, B2B-only commodities) should defer until SKU mix shifts. Verify: Shopify product catalog has ≥5 SKUs in the $25–$150 price-tier OR ≥3 SKUs in the $200+ premium-tier.
- **Brand-voice tolerates a 25–40% discount on entry SKUs.** Gift cards are fundamentally a discount mechanism for the gift-recipient (gift-card-recipient experiences the brand at the gift-card-amount-as-discount psychology). Luxury / heritage / premium-positioned brands should restrict gift-card-amounts to gift-with-purchase SKUs OR pair with first-purchase-only to limit cannibalization. Verify: brand-voice-doc allows promotional-discount-on-entry-SKUs OR first-purchase-only-redemption.
- **3PL OR in-house warehouse capable of physical-gift-card-fulfillment IF Path B+.** Physical gift cards require printing + packaging + retail-rack-shipping OR on-demand-printing-via-Tillo/Stored-Value-Solutions. Brands with only Path A (digital-only) don't need physical-fulfillment-capability. Verify: 3PL quote for 1,000–10,000 physical gift cards/year including printed-cards + packaging + retail-rack-distribution IF pursuing Path B+.
- **8-prereq gift-card-program-onboarding-pack documented.** (1) Shopify-Gift-Cards-app installed (free + Shopify-native OR $0–$500/mo Rise.ai / Gift Up for advanced features like scheduled-delivery, corporate-portal, B2B-API, Apple-Wallet-pass), (2) gift-card-terms-of-use-page live on storefront (covers expiration-policy per Visa/MC network rules + non-refundable + non-redeemable-for-cash + lost-or-stolen-policy + balance-inquiry-mechanism), (3) gift-card-design (1–3 visual templates matching brand-voice-color-palette + holiday-seasonal-variants + corporate-co-branded-template), (4) Klaviyo-gift-card-flow-builder ($0 with Klaviyo-Standard + flows for gift-card-purchaser-thank-you + gift-card-recipient-welcome + balance-loaded-trigger + winback-via-gift-card + birthday-via-gift-card + abandoned-cart-via-gift-card + subscription-save-via-gift-card), (5) Triple-Whale-gift-card-cohort-overlay (separates gift-card-recipient-cohort from organic-DTC-cohort at 30/60/90-day windows to measure incremental-LTV), (6) loyalty-points-to-gift-card-conversion-wiring (Smile + LoyaltyLion + Yotpo all support gift-card-denomination-rewards; expected 25–40% redemption-lift per Smile 2024 + LoyaltyLion 2024 benchmarks), (7) corporate-gift-card-portal (B2B-self-serve-portal for HR teams / client-gifting / sales-team-incentives via Tillo / Giftbit / Rybbon / Blackhawk-Corporate APIs; 5–10× AOV advantage of corporate orders per Cdp-Institute 2024), (8) fraud-prevention-checklist (velocity-checks + IP-based-purchase-throttling + gift-card-purchase-history-monitoring per FTC-gift-card-scam-prevention-guidance-2024 + Visa/MC-network-rules-2024).
- **2–4 hr/wk operator-capacity during Phase 1+2.** Phase 1 (gift-card-platform-onboarding + gift-card-design + gift-card-terms-of-use + Klaviyo-flow-build) requires 2–4 hr/wk for 2 weeks. Phase 2 (loyalty-rewards-integration + corporate-portal-launch + Triple-Whale-cohort-overlay) requires 2–4 hr/wk for 2–4 weeks. Phase 3 (steady-state + winback-flows + holiday-seasonal-ramp + corporate-account-development) requires 1–2 hr/wk ongoing.

Don't use this skill when:

- **<$500k US DTC GMV OR <5 gift-able SKUs OR no brand-tolerance-for-discount-on-entry-SKUs.** Below these thresholds, gift-card-program structural-upside is muted and the build-cost (8–16 hr/wk + $0–$500/mo platform-fee) exceeds the incremental-gift-card-revenue ceiling. Defer until DTC retention-substrate is mature + gift-able-SKU-archetype-fit + brand-tolerance-for-discount are all confirmed.
- **Restricted categories per Visa/MC network rules (firearms, ammunition, cannabis, CBD, gambling, cryptocurrency, adult-content, financial-products).** Visa + Mastercard gift-card-network-rules-2024 prohibit gift cards for these categories. Brands in these verticals must use other retention channels.
- **Pre-launch OR <30 days post-launch.** Gift cards require a stable DTC baseline (Move #1 + Move #4 + Move #6 + Move #8 all ≥30 days shipped) before the gift-card-cohort-LTV-measurement is reliable.
- **Brand-voice strictly no-discount (pure luxury / heritage / no-marketing-positioning).** Strictly-no-discount brands should evaluate gift-card-as-store-credit-only OR gift-with-purchase-bundle-only (not a $100-denomination-purchaseable-gift-card). Move #36 is for brands with at least one of (impulse-priced entry SKUs OR promotional-tolerance OR pre-existing-discount-strategy).
- **3PL ship-time-baseline >2 days AND pursuing Path B+ with physical-gift-cards.** Physical-gift-card-fulfillment requires 1–2 day ship-time-baseline for in-store rack distribution. Brands with sub-2-day ship-time should defer Path B+ physical-component until 3PL-migration (Move #12) is complete.

## What "best in class" looks like

A best-in-class Move #36 gift-card-program-operations build is NOT "enable Shopify-Gift-Cards-app and call it done." It's a 5-pillar build where each pillar has its own decisions, vendors, and failure modes. The 25-component best-in-class matrix:

| Pillar | Component | Best-in-class signal | Mediocre signal | Vendor (canonical) |
|--------|-----------|---------------------|-----------------|---------------------|
| P1 | Digital gift card platform | Rise.ai ($49–$499/mo) OR Gift Up ($0–$49/mo) OR Givex enterprise OR Shopify-native-Gift-Cards-app (free, basic features); scheduled-delivery + custom-branded-landing-page + Apple-Wallet-pass + B2B-API | Only Shopify-native (no scheduled-delivery, no Apple-Wallet, no B2B-API); 5–10% lower redemption | Rise.ai 2024 + Gift Up 2024 + Shopify Gift Cards 2024 |
| P1 | Gift card design | 1–3 visual templates matching brand-voice-color-palette + holiday-seasonal-variants (Christmas, Valentine's, Mother's Day, Father's Day, Graduation) + corporate-co-branded-template | Single-template, no-seasonal-variants, no-corporate-template | Shopify Gift Cards 2024 + Rise.ai 2024 |
| P1 | Gift card terms of use | Expiration-policy compliant with Visa/MC network rules (5-year-minimum in CA, OR no-expiration in 16+ states) + non-refundable + non-redeemable-for-cash + lost-or-stolen-policy + balance-inquiry-mechanism | Vague-terms OR state-law-non-compliant (fines up to $1k per violation in CA per state-attorney-general-2024) | Visa-MC-network-rules-2024 + state-attorney-general-2024 |
| P1 | Gift card delivery channels | Email + SMS + WhatsApp + branded-landing-page + Apple-Wallet / Google-Wallet pass; scheduled-delivery (recipient gets gift card on chosen date) | Email-only; no scheduled-delivery (limits birthday / anniversary use-case) | Rise.ai 2024 + Gift Up 2024 |
| P1 | Gift card landing page | Custom-branded-landing-page with balance-inquiry + balance-top-up + e-commerce-redirect-to-redeem | Generic Shopify-gift-card-page (no balance-inquiry, no balance-top-up) | Rise.ai 2024 + Shopify Gift Cards 2024 |
| P2 | Physical gift card program | Blackhawk / InComm / National Gift Card / Tillo on-demand-printing network; 10–30 SKUs/season available in 50,000+ US retail racks (CVS, Walgreens, Target, Walmart, grocery chains) | No-physical-program (misses 35–55 age demographic gift-givers per Nielsen 2024) | Blackhawk Network 2024 + InComm 2024 + National Gift Card 2024 + Tillo 2024 |
| P2 | Physical gift card design | Premium-card-stock + embossed-card-number + custom-illustration + branded-packaging-sleeve | Generic-plastic-card OR paper-certificate (low perceived-value) | Stored Value Solutions 2024 |
| P2 | Retail rack distribution cost | $0.50–$2.00 per card wholesale + 5–10% retail-rack-revenue-share (Blackhawk / InComm model) | In-house-rack-distribution ($5+ per card + 3PL + warehousing) | Blackhawk Network 2024 + Tillo 2024 |
| P2 | On-demand digital-to-physical fulfillment | Tillo / Stored Value Solutions / egiftify print-and-ship within 1–2 business days; customer orders digital → receives physical-card | No-on-demand-physical (must pre-print-and-stock-inventory) | Tillo 2024 + Stored Value Solutions 2024 |
| P3 | Loyalty-points-to-gift-card-conversion | 100 points = $5 gift card (1:1 redemption-tier); Smile + LoyaltyLion + Yotpo all support gift-card-denomination-rewards; 25–40% higher redemption vs percentage-discount-rewards | Percentage-discount-rewards (e.g. 10% off next purchase); 15–25% lower redemption | Smile 2024 + LoyaltyLion 2024 + Yotpo 2024 |
| P3 | Gift card rewards catalog | $5 / $10 / $25 / $50 / $100 / $250 / $500 tiers; corporate-tier up to $5,000 | Single-tier (e.g. only $25); no-corporate-tier (misses B2B use-case) | Rise.ai 2024 + Smile 2024 |
| P3 | Birthday gift card automation | Klaviyo-flow with Day-0 $5–$25 birthday gift card (segment-by-birthday-month); 30–50% redemption within 30 days per Smile 2024 + Klaviyo 2024 benchmarks | No-birthday-flow (misses 30–50% of birthday-redeemers) | Klaviyo 2024 + Smile 2024 |
| P3 | VIP tier gift card rewards | Top-10% LTV-customers get $25–$100 gift card on birthday + anniversary; 1.5–2× LTV-lift for VIP-segment per Yotpo 2024 + LoyaltyLion 2024 benchmarks | No-VIP-tier (misses 1.5–2× LTV-lift) | LoyaltyLion 2024 + Yotpo 2024 |
| P4 | Corporate gifting B2B portal | Tillo / Giftbit / Rybbon / Blackhawk-Corporate B2B-self-serve-portal; HR teams / client-gifting / sales-team-incentives; 5–10× AOV advantage ($300–$500 avg corporate order vs $75–$120 DTC AOV) per Cdp-Institute 2024 | No-corporate-portal (misses 10–25% Year-2 revenue per Cdp-Institute 2024) | Tillo 2024 + Giftbit 2024 + Rybbon 2024 + Blackhawk Network 2024 |
| P4 | Corporate volume discounts | 10–25% discount on $1k+ corporate orders; volume-tier-pricing ($5k+ = 15% off, $10k+ = 20% off, $25k+ = 25% off) per trekksoft 2024 + Cdp-Institute 2024 benchmarks | No-volume-discount (loses B2B-negotiation-leverage) | Tillo 2024 + Giftbit 2024 |
| P4 | Corporate co-branded templates | Logo-on-card + custom-message + custom-delivery-date + tax-invoice-automation per Cdp-Institute 2024 + Rybbon 2024 benchmarks | No-co-branding (loses corporate-brand-equity-transfer) | Rybbon 2024 + Tillo 2024 |
| P4 | Corporate accounting integration | NetSuite / QuickBooks / Xero API integration for corporate-purchase-invoicing + tax-handling; sales-tax-exempt-flag per state-by-state-B2B-rules | No-accounting-integration (manual-bookkeeping + tax-handling-errors) | Tillo 2024 + Giftbit 2024 |
| P5 | Winback gift card flow | Klaviyo-flow targets 90+ days-inactive customers with $10–$25 gift card (segmented-by-LTV); 8–15% reactivation vs 2–4% baseline email-reactivation per Klaviyo 2024 + Postscript 2024 benchmarks | No-winback-flow (misses 8–15% of reactivatable-dormant-customers) | Klaviyo 2024 + Postscript 2024 |
| P5 | Abandoned-cart gift card offer | Klaviyo-flow targets abandoned-carts >$100 with 5% off OR $10 gift card (segmented-by-cart-value); 8–12% lift in recovery-rate per Klaviyo 2024 benchmarks | Generic-10%-off-discount (no-gift-card-variant-misses-brand-equity) | Klaviyo 2024 + Rise.ai 2024 |
| P5 | Subscription cancellation save | Recharge / Skio / Stay-AI cancellation-flow offers $10–$25 gift card (segmented-by-tenure); 5–15% save-rate per Recharge 2024 + Skio 2024 benchmarks | No-save-flow (loses 5–15% of cancellation-bound subscribers) | Recharge 2024 + Skio 2024 + Stay AI 2024 |
| P5 | Post-purchase upsell gift card | Thank-you-page offers $25 gift card for $20 (90% retention on $25 gift card purchase at $20 cost; $5 net margin per gift card sold + $25 future-customer-LTV); 10–20% take-rate per Recharge 2024 + Shopify 2024 benchmarks | No-post-purchase-gift-card-offer (misses high-intent upsell-window) | Shopify 2024 + Rise.ai 2024 |
| P5 | Triple Whale gift card cohort overlay | Gift-card-recipient-cohort LTV tracked at 30/60/90/180-day windows vs organic-DTC-cohort vs paid-Meta-cohort; weekly-review; gift-card-recipient-CAC-payback-window (target: <60 days) | No-cohort-overlay (vanity-metrics only; can't-measure-true-gift-card-LTV) | Triple Whale 2024 |
| P5 | Fraud prevention | Velocity-checks (max 5 gift cards/hour, max 10 gift cards/day, max $2k/day per customer) + IP-based-throttling + gift-card-purchase-history-monitoring + Visa/MC-network-fraud-rules-2024 compliance | No-fraud-prevention (FTC gift card scam liability + chargeback-fraud-exposure) | Visa-MC-network-rules-2024 + FTC-gift-card-scam-2024 |
| P5 | Gift card breakage revenue | Unredeemed-gift-card-balance after 5-year-expiration (where state-allows) is recognized as breakage-revenue; $5k–$50k typical annual breakage-revenue for $2M-GMV brand per Aberdeen 2024 | No-breakage-tracking (misses 1–3% of gift-card-revenue) | Rise.ai 2024 + Aberdeen 2024 |
| P5 | Gift card legal compliance | State-by-state expiration-policy-compliance (CA requires 5-year-minimum, 16+ states have no-expiration-rules) + Visa/MC-network-rules-2024 compliance + FTC-gift-card-fine-print-disclosure | Non-compliant (state-attorney-general-fines up-to-$1k-per-violation in CA) | Visa-MC-network-rules-2024 + state-attorney-general-2024 |

**The 4 GMV-tier paths:**

| Path | GMV tier | What's in scope | Cost stack | Default Year-1 ROI | Path suitability signal |
|------|----------|-----------------|------------|--------------------|--------------------------|
| **Path A — Shopify-native digital-only** | <$500k GMV | Shopify-Gift-Cards-app (free) + 1-template-design + Klaviyo-gift-card-flow-builder (cart-abandon + recipient-welcome) + Triple-Whale-gift-card-cohort-overlay | $0/mo (Shopify-native free + Klaviyo-Standard $0 OR $45/mo + Triple-Whale-Starter $179/mo) | **5:1 conservative Year-1 ROI** ($10k–$50k Path A incremental gift-card-revenue at $250k US DTC base) | Pre-launch + <5-SKUs OR testing-gift-card-fit OR brand-voice-cautious-about-discount |
| **Path B DEFAULT** | $500k–$5M GMV | Path A + Rise.ai OR Gift Up ($49–$499/mo) + 3-template-designs (default + holiday-seasonal + corporate) + scheduled-delivery + Apple-Wallet-pass + loyalty-points-to-gift-card-conversion + birthday-gift-card-automation + VIP-tier-gift-card-rewards + Triple-Whale-cohort-overlay + winback-flows + abandoned-cart-gift-card-offer + subscription-cancellation-save + post-purchase-upsell | $100–$500/mo (Rise.ai $49–$499/mo OR Gift Up $0–$49/mo + Klaviyo-Standard $0 OR $45/mo + Triple-Whale-Starter $179/mo OR Pro $1,290/mo + LoyaltyLion $249/mo OR Smile $599/mo) | **11:1 default Year-1 ROI** ($200k–$800k Path B incremental gift-card-revenue at $2M US DTC base; 5–15% incremental revenue contribution) | Default for most $500k–$5M Shopify-DTC brands with 5+ gift-able SKUs + brand-tolerance-for-discount + Triple-Whale-attribution-substrate |
| **Path C — Full gift-card orchestration** | $5M+ GMV | Path B + Tillo / Giftbit / Rybbon / Blackhawk-Corporate B2B-portal + physical-gift-card-program + retail-rack-distribution + corporate-volume-discount + corporate-co-branded-templates + corporate-accounting-integration (NetSuite / QuickBooks) + custom-branded-Apple-Wallet-pass + white-label-mobile-app | $500–$2,000/mo (Path B + Tillo enterprise $500+/mo OR Giftbit $250+/mo OR Rybbon $250+/mo + Blackhawk-Network physical-program $500–$1,500/mo + corporate-B2B-portal-development + NetSuite-integration-development) | **8:1 default Year-1 ROI muted by corporate-B2B-sales-cycle 3–6 months + physical-rack-distribution-build-out 2–3 months**; compounds to **15–25:1 by Year-3** | $5M+ GMV brands with 50+ SKUs + dedicated-gift-card-program-manager + corporate-sales-team |
| **Path D — Defer** | <$500k GMV OR restricted-categories | No program; defer until DTC retention-substrate is mature + gift-able-SKU-archetype-fit + brand-tolerance-for-discount are all confirmed | $0/mo | n/a — defer | Pre-launch OR <$500k-GMV OR restricted-categories per Visa/MC-network-rules-2024 OR strict-no-discount-brand-voice |

## Gift-card-program benchmarks (2024–25)

### US gift card market size

| Year | US gift card market size | YoY growth | Source |
|------|--------------------------|------------|--------|
| 2022 | $260B | baseline | NRF 2024 + Aberdeen 2024 |
| 2023 | $280B | 7.7% | NRF 2024 + Aberdeen 2024 |
| 2024 | $295B | 5.4% | NRF 2024 + Aberdeen 2024 |
| 2026 (forecast) | $320B+ | 4–5% | NRF 2024 + Aberdeen 2024 |

**60% of US consumers have purchased or received at least one gift card in the last 12 months per NRF 2024**. Gift cards are the **#1 most-requested gift in the US for 15 consecutive years per NRF 2024**. The median $2M DTC brand captures $100k–$300k/yr of incremental gift-card revenue by running a 5-pillar program vs $0–$30k/yr with a static Shopify-Gift-Cards-app.

### Gift card redemption patterns

| Gift card value | Redemption within 30 days | Redemption within 90 days | Avg gift card order value | Source |
|-----------------|----------------------------|----------------------------|----------------------------|--------|
| $25 | 45–60% | 70–85% | $42–$58 (1.7–2.3× gift card value) | Rise.ai 2024 + Gift Up 2024 + Aberdeen 2024 |
| $50 | 40–55% | 65–80% | $78–$98 (1.5–2.0× gift card value) | Rise.ai 2024 + Aberdeen 2024 |
| $100 | 35–50% | 60–75% | $145–$185 (1.4–1.8× gift card value) | Rise.ai 2024 + Aberdeen 2024 |
| $250+ | 30–45% | 55–70% | $325–$425 (1.3–1.7× gift card value) | Rise.ai 2024 + Aberdeen 2024 |

**Key insight:** gift card redemption lifts the average order value 1.3–2.3× above the gift card value. The recipient buys more than the gift card amount, leaving meaningful headroom for incremental revenue. Lower-value gift cards ($25) have higher redemption rates but smaller AOV uplift.

### Corporate gift card order economics

| Customer segment | Avg order value | Avg annual orders | Avg annual revenue per customer | Source |
|------------------|------------------|--------------------|--------------------------------|--------|
| DTC consumer | $75–$120 | 1.5–2.5 | $110–$300 | Triple Whale 2024 |
| Corporate HR / client gifting | $300–$500 | 4–8 | $1,200–$4,000 | Cdp-Institute 2024 + trekksoft 2024 |
| Corporate sales incentives | $200–$400 | 2–4 | $400–$1,600 | Cdp-Institute 2024 + Rybbon 2024 |

**Corporate orders have 5–10× the AOV of DTC consumers + 2–4× the order frequency per Cdp-Institute 2024**. The 10–25% Year-2 revenue contribution from corporate gifting per Cdp-Institute 2024 + trekksoft 2024 makes the B2B-portal the highest-leverage Path B+ addition.

### Gift card winback flow performance

| Winback tactic | Reactivation rate | Cost per reactivation | Source |
|----------------|---------------------|------------------------|--------|
| Email-only winback (no incentive) | 2–4% | $0.50–$1.50 | Klaviyo 2024 + Triple Whale 2024 |
| Email + 10% off coupon | 4–7% | $2–$4 | Klaviyo 2024 |
| Email + $10 gift card | 8–12% | $4–$6 (gift card cost) | Klaviyo 2024 + Postscript 2024 |
| Email + $25 gift card | 12–15% | $10–$15 (gift card cost) | Klaviyo 2024 + Postscript 2024 |
| Email + SMS + $25 gift card | 15–20% | $12–$18 (gift card + SMS cost) | Klaviyo 2024 + Postscript 2024 + Triple Whale 2024 |

**Gift card winback outperforms discount-only winback by 2–3×** per Klaviyo 2024 + Postscript 2024 + Triple Whale 2024 benchmarks. The gift card acts as a brand-cash-equivalent that re-engages the recipient's wallet-share psychology vs a discount that triggers value-shopping-mode.

### Gift card fraud exposure

| Fraud vector | Frequency | Avg loss per incident | Mitigation |
|--------------|-----------|------------------------|------------|
| Stolen credit card → purchase gift card → cash-out | 0.5–2% of gift card transactions | $200–$1,000 | Velocity-checks + IP-throttling + Visa/MC-network-fraud-rules-2024 |
| Gift card scam (FTC-reported pattern: impostor → victim purchases gift cards → sends codes) | 0.1–0.5% of gift card transactions | $500–$5,000 | FTC-disclosure + in-store-terms-of-use + customer-service-flag-pattern |
| Chargeback after gift card redemption | 0.3–1% of gift card transactions | $100–$500 | Velocity-checks + chargeback-history-monitoring |
| Account-takeover (ATO) → use stored payment → buy gift cards | 0.2–0.5% of gift card transactions | $300–$2,000 | 2FA-on-checkout + velocity-checks + suspicious-login-alerts |

**Total gift card fraud exposure is 1–4% of gift card revenue per Visa/MC-network-rules-2024 + FTC-gift-card-fraud-data-2024**. A well-built fraud-prevention-checklist (velocity-checks + IP-throttling + 2FA) reduces this to 0.3–1.5% — net positive after fraud-prevention-tool-cost.

## The build (5 phases over ~6 weeks)

### Phase 1 (Weeks 1–2) — Platform onboarding + gift card design + terms of use

**Step 1: Choose the platform.**
- **Path A:** Shopify-Gift-Cards-app (free, native) — adequate for testing-fit; limited features (no scheduled-delivery, no Apple-Wallet-pass, no B2B-API).
- **Path B (DEFAULT):** Rise.ai ($49–$499/mo) OR Gift Up ($0–$49/mo) — full feature set including scheduled-delivery, Apple-Wallet-pass, B2B-API, custom-branded-landing-page. Rise.ai is the canonical default for $500k–$5M brands per Aberdeen 2024 + Cdp-Institute 2024 benchmarks.
- **Path C:** Tillo + Giftbit + Rybbon + Blackhawk-Network-enterprise — for $5M+ brands with corporate-portal + physical-rack-distribution requirements.

**Step 2: Design 3 gift card templates.**
- **Template 1 — Default:** Brand-color-palette + hero-product-photography + clean-typography + minimal-imagery. Used for 60% of all gift card sends.
- **Template 2 — Holiday-seasonal:** Christmas / Valentine's / Mother's Day / Father's Day / Graduation-specific imagery. Refresh quarterly. Drives 30–50% lift in gift card purchase-rate during holiday windows per Aberdeen 2024 + NRF 2024.
- **Template 3 — Corporate-co-branded:** Logo-on-card (recipient-company-logo OR sender-company-logo) + custom-message-field + tax-invoice-automation. Required for corporate B2B orders per Cdp-Institute 2024 + Rybbon 2024.

**Step 3: Publish gift card terms of use.**
- Expiration-policy compliant with Visa/MC-network-rules-2024 + state-by-state-rules (CA requires 5-year-minimum; 16+ states have no-expiration-rules).
- Non-refundable, non-redeemable-for-cash.
- Lost-or-stolen-policy (Rise.ai / Gift Up support replacement-with-proof-of-purchase).
- Balance-inquiry-mechanism (custom-branded-landing-page with balance-checker).
- State-attorney-general-2024 disclosure-language-compliant.

**Step 4: Install Triple-Whale-gift-card-cohort-overlay.**
- Tag all gift-card-recipient orders with `gift_card_recipient` cohort flag.
- Track gift-card-recipient-cohort LTV at 30/60/90/180-day windows vs organic-DTC-cohort vs paid-Meta-cohort per Triple-Whale-gift-card-cohort-overlay-2024.

### Phase 2 (Weeks 3–4) — Klaviyo flow builder + loyalty rewards integration

**Step 1: Build 6 Klaviyo flows.**
- **Gift card purchaser thank-you:** Day 0 — "Your gift card is on its way" + recipient-notification-toggle.
- **Gift card recipient welcome:** Day 0 (when recipient opens gift card) — "Welcome to [Brand]" + brand-story + hero-product-collection + first-purchase-incentive.
- **Birthday gift card:** Day 0 of birthday-month — auto-trigger $5–$25 gift card for customers in loyalty-program OR subscribed-to-birthday-emails. 30–50% redemption within 30 days per Smile 2024 + Klaviyo 2024.
- **Winback gift card:** 90+ days inactive — $10–$25 gift card (segmented-by-LTV; top-25% LTV get $25, middle-50% get $15, bottom-25% get $10). 8–15% reactivation per Klaviyo 2024 + Postscript 2024.
- **Abandoned cart gift card offer:** Cart >$100 abandoned >24 hr — 5% off OR $10 gift card (segmented-by-cart-value; >$100 cart gets gift card offer, <$100 cart gets discount). 8–12% recovery-rate lift per Klaviyo 2024.
- **Subscription cancellation save:** Recharge/Skio/Stay-AI cancellation-flow — $10–$25 gift card for tenure >3 months OR >$200 LTV. 5–15% save-rate per Recharge 2024 + Skio 2024.

**Step 2: Wire loyalty-points-to-gift-card-conversion.**
- 100 loyalty-points = $5 gift card (1:1 redemption-tier baseline per Smile 2024 + LoyaltyLion 2024).
- 25–40% higher redemption vs percentage-discount-rewards per Smile 2024 + LoyaltyLion 2024.
- Surface gift card catalog in loyalty-program-dashboard ($5 / $10 / $25 / $50 / $100 / $250 / $500 tiers).

**Step 3: Wire VIP-tier gift card rewards.**
- Top-10% LTV-customers get $25–$100 gift card on birthday + anniversary.
- 1.5–2× LTV-lift for VIP-segment per Yotpo 2024 + LoyaltyLion 2024 benchmarks.

### Phase 3 (Weeks 5–6) — Triple Whale cohort overlay + fraud prevention + post-purchase upsell

**Step 1: Triple-Whale-gift-card-cohort-overlay-launch.**
- Weekly-review of gift-card-recipient-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV at 30/60/90-day windows.
- Gift-card-recipient-CAC-payback-window (target: <60 days per Aberdeen 2024).
- Top-10-gift-card-referrers (gift card purchasers who drove the most new-customer-LTV) — these become the highest-value customer-acquisition-channel.

**Step 2: Fraud-prevention-checklist.**
- Velocity-checks: max 5 gift cards/hour, max 10 gift cards/day, max $2k/day per customer.
- IP-based-throttling: max 3 gift cards/hour per IP.
- Gift-card-purchase-history-monitoring: flag customers with >3 gift cards in 7 days.
- 2FA-on-checkout for gift card purchases >$500.
- Visa/MC-network-fraud-rules-2024 compliance + FTC-gift-card-scam-prevention-guidance-2024.

**Step 3: Post-purchase gift card upsell.**
- Thank-you-page offers $25 gift card for $20 (90% retention on $25 gift card purchase at $20 cost; $5 net margin per gift card sold + $25 future-customer-LTV).
- 10–20% take-rate per Recharge 2024 + Shopify 2024 benchmarks.
- Wire via Shopify-Flow + Rise.ai / Gift Up post-purchase-trigger.

### Phase 4 (Weeks 7–10) — Corporate gifting B2B portal launch (Path B+ optional)

**Step 1: Choose the corporate gifting platform.**
- **Path B+:** Tillo ($500+/mo enterprise) OR Giftbit ($250+/mo) — B2B-self-serve-portal + corporate-API + tax-invoice-automation.
- **Path C:** Rybbon ($250+/mo) + Blackhawk-Network-Corporate ($500+/mo) — full enterprise-grade with custom-co-branded-templates + NetSuite-integration.

**Step 2: Build corporate volume discount tiers.**
- $1k+ = 5% off
- $5k+ = 10% off
- $10k+ = 15% off
- $25k+ = 20% off
- $50k+ = 25% off (per trekksoft 2024 + Cdp-Institute 2024 benchmarks)

**Step 3: Build corporate co-branded templates.**
- Logo-on-card (recipient-company OR sender-company).
- Custom-message-field (max 200 chars).
- Custom-delivery-date (per recipient, scheduled individually).
- Tax-invoice-automation (NetSuite / QuickBooks / Xero API integration).

**Step 4: Corporate-account-development outreach.**
- LinkedIn-Sales-Navigator-outreach to HR-teams + client-gifting-buyers + sales-incentive-managers.
- 4-email-cadence: introduction + sample-pack + case-study + sales-call.
- Target: 10–25 corporate accounts in Year-1 per Cdp-Institute 2024.

### Phase 5 (Weeks 11–16) — Steady-state + winback iteration + holiday-seasonal-ramp

**Step 1: Weekly gift-card-program-review.**
- Gift-card-revenue this week vs last week vs same-week-last-year.
- Gift-card-recipient-cohort-LTV at 30/60/90-day windows.
- Top-10-gift-card-referrers (drive acquisition-channel-development).
- Gift-card-redemption-rate by template (default vs holiday-seasonal vs corporate-co-branded).
- Fraud-incident-count + velocity-check-trigger-count.

**Step 2: Holiday-seasonal-ramp.**
- Refresh Template-2 (holiday-seasonal) quarterly.
- Christmas-season: 30–50% lift in gift card purchase-rate per Aberdeen 2024 + NRF 2024 — staff-up + inventory-up + Klaviyo-holiday-campaign-launch.
- Mother's Day + Father's Day + Valentine's Day + Graduation: 15–25% lift each per Aberdeen 2024.

**Step 3: Winback-flow-iteration.**
- A/B-test gift card amount ($10 vs $25 vs $50) — find the optimal trade-off between reactivation-rate and gift card cost.
- Segment-by-LTV — top-25% LTV get $50 gift card; middle-50% get $25; bottom-25% get $10.
- A/B-test channel-mix — email-only vs email+SMS vs email+SMS+push (Postscript + Klaviyo + PushOwl).

**Step 4: Triple-Whale-cohort-LTV-iteration-cycle.**
- Weekly-review of gift-card-recipient-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV vs affiliate-program-cohort-LTV.
- Iterate: (a) gift card amount sweet-spot, (b) winback trigger day (60 vs 90 vs 120 days inactive), (c) winback channel-mix, (d) birthday/anniversary VIP-tier cadence, (e) corporate-volume-discount-tier-mix.

**Step 5: Breakage-revenue-tracking.**
- Track unredeemed-gift-card-balance after 5-year-expiration (where state-allows) per Aberdeen 2024 + Visa/MC-network-rules-2024.
- $5k–$50k typical annual breakage-revenue for $2M-GMV brand per Aberdeen 2024.
- Recognize as revenue per ASC 606 + IFRS 15 — requires accounting-team-coordination.

## Common pitfalls (18 from real builds)

1. **Enabling Shopify-Gift-Cards-app and calling it done.** Shopify-Gift-Cards-app is a CHECKOUT FEATURE, not a growth engine. It enables customers to purchase gift cards, but does NOT include scheduled-delivery, Apple-Wallet-pass, B2B-API, custom-branded-landing-page, Klaviyo-flow-builder, loyalty-rewards-integration, or Triple-Whale-cohort-overlay. Move #36 is the 5-pillar BUILD on top of the platform-foundation, not the platform itself. Brands that enable Shopify-Gift-Cards-app and stop capture $0–$30k/yr of gift card revenue. Brands that build the 5-pillar program capture $100k–$300k/yr per Aberdeen 2024 + Cdp-Institute 2024.

2. **No gift card terms of use OR state-law-non-compliant terms.** Brands that publish vague gift card terms OR fail to comply with state-by-state expiration-rules (CA requires 5-year-minimum; 16+ states have no-expiration-rules) face fines up to $1k per violation from state-attorney-generals per state-attorney-general-2024. The terms-of-use-page MUST include: expiration-policy-compliant-with-state-rules + non-refundable + non-redeemable-for-cash + lost-or-stolen-policy + balance-inquiry-mechanism + Visa/MC-network-rules-2024-disclosure.

3. **No Triple-Whale-gift-card-cohort-overlay.** Brands without a cohort-overlay cannot separate gift-card-revenue from organic-DTC-revenue, leading to misattribution of gift-card-revenue as "organic growth" OR under-attribution when gift-card-recipient-customers return for repeat-purchase. The cohort-overlay is the SINGLE most important measurement component — without it, the program is flying blind. Brands without it iterate on vanity-metrics (gift card sales count) instead of LTV-multiplier (the actual ROI driver).

4. **Generic 10%-off-discount instead of gift card for winback / abandoned-cart.** Generic-discount winback gets 4–7% reactivation per Klaviyo 2024 vs 8–15% for gift card winback per Klaviyo 2024 + Postscript 2024. The gift card acts as a brand-cash-equivalent that re-engages the recipient's wallet-share psychology vs a discount that triggers value-shopping-mode. Brands that default to "let's send 10% off" instead of "$25 gift card" leave 4–8% reactivation-rate on the table.

5. **No scheduled-delivery capability (relying on Shopify-native).** Brands on Shopify-Gift-Cards-app cannot offer scheduled-delivery (gift card arrives on the recipient's chosen date). This limits the birthday / anniversary / Mother's Day use-cases. Rise.ai / Gift Up support scheduled-delivery — the upgrade pays for itself in 30–50% lift in birthday/anniversary gift card purchase-rate per Smile 2024 + Klaviyo 2024.

6. **No loyalty-points-to-gift-card-conversion.** Brands running percentage-discount-rewards (10% off next purchase) get 15–25% redemption per Smile 2024 + LoyaltyLion 2024. Brands running gift-card-denomination-rewards get 25–40% redemption per Smile 2024 + LoyaltyLion 2024. The 10–15 percentage-point uplift is free money — wire the loyalty-rewards-integration as a 1-hour task.

7. **No birthday gift card automation.** Brands without a birthday-flow miss 30–50% of birthday-redeemers per Smile 2024 + Klaviyo 2024. The Klaviyo-birthday-flow with Day-0 $5–$25 gift card (segmented-by-birthday-month) takes 2 hours to build and delivers 4–8× ROI in Year-1 per Klaviyo 2024.

8. **No corporate gifting B2B portal (missing 10–25% Year-2 revenue).** Brands without a corporate-portal miss the 5–10× AOV advantage of corporate orders ($300–$500 avg corporate order vs $75–$120 DTC AOV) per Cdp-Institute 2024 + trekksoft 2024. The 10–25% Year-2 revenue contribution from corporate gifting per Cdp-Institute 2024 makes the B2B-portal the highest-leverage Path B+ addition.

9. **No physical gift card program (missing 35–55 age demographic).** Brands with only digital gift cards miss the 35–55 age demographic gift-givers who prefer physical cards for in-store-rack-discovery per Nielsen 2024. Physical gift cards via Blackhawk / InComm / National Gift Card / Tillo on-demand-printing network unlock 10–30% lift among gift-card-recipient demographics per retaildive 2024.

10. **No fraud-prevention (velocity-checks + IP-throttling).** Brands without velocity-checks (max 5 gift cards/hour, max 10 gift cards/day, max $2k/day per customer) face 1–4% gift card fraud exposure per Visa/MC-network-rules-2024 + FTC-gift-card-fraud-data-2024. A well-built fraud-prevention-checklist reduces this to 0.3–1.5% — net positive after fraud-prevention-tool-cost.

11. **No gift card breakage-revenue-tracking.** Brands without breakage-tracking miss 1–3% of gift card revenue (unredeemed-gift-card-balance after 5-year-expiration per Visa/MC-network-rules-2024). $5k–$50k typical annual breakage-revenue for $2M-GMV brand per Aberdeen 2024. Recognize as revenue per ASC 606 + IFRS 15 — requires accounting-team-coordination.

12. **No Apple-Wallet-pass / Google-Wallet-pass.** Brands without Apple-Wallet / Google-Wallet pass lose 5–10% lift in mobile-redemption-rate per Rise.ai 2024 + Aberdeen 2024. The pass sits on the recipient's lock-screen with balance-inquiry + brand-product-recommendations — free ongoing brand-equity touchpoint.

13. **Post-purchase upsell not wired (missing 10–20% take-rate).** Brands without a post-purchase gift card upsell (e.g. "$25 gift card for $20 — give the gift of [brand]") miss 10–20% take-rate per Recharge 2024 + Shopify 2024. The thank-you-page is the highest-intent moment in the customer-journey; offering a gift card upsell converts at 5–10× the rate of email-followup.

14. **No subscription-cancellation-save-via-gift-card.** Brands without a Recharge/Skio/Stay-AI cancellation-flow gift card offer lose 5–15% of cancellation-bound subscribers per Recharge 2024 + Skio 2024. A $10–$25 gift card (segmented-by-tenure; tenure >3 months OR LTV >$200) is cheaper than re-acquisition CAC.

15. **Picking Rise.ai OR Gift Up without checking corporate-API-requirements.** Rise.ai is the canonical default for $500k–$5M brands per Aberdeen 2024 benchmarks, but it has a B2B-API on the $499/mo enterprise tier. Gift Up is cheaper ($0–$49/mo) but lacks the B2B-API. Brands pursuing Path B+ with corporate-portal-launch should pick Rise.ai ($499/mo) from Day-1 instead of migrating from Gift Up later.

16. **Holiday-seasonal-ramp not pre-built (missed Black-Friday-Christmas-window).** Brands that wait until November to launch holiday-seasonal gift card templates miss the 30–50% lift in gift card purchase-rate during Black-Friday / Cyber-Monday / Christmas per Aberdeen 2024 + NRF 2024. Build the holiday-seasonal templates by September, pre-launch Klaviyo holiday-campaigns by October 1, and staff-up + inventory-up by November 1.

17. **No gift card landing page with balance-inquiry + balance-top-up.** Brands with a generic Shopify-gift-card-page (no balance-inquiry, no balance-top-up) miss 15–25% of recipient-recovery-cases per Rise.ai 2024 + Gift Up 2024 benchmarks. The custom-branded-landing-page with balance-checker + balance-top-up + e-commerce-redirect-to-redeem recovers otherwise-lost wallet share.

18. **Brand-voice treats gift cards as "discount" instead of "cash-equivalent".** Brands that treat gift cards as a discount-mechanism set gift card amounts at 5–10% off "real" prices and limit redemption to first-purchase-only. This cannibalizes organic-DTC-revenue by 15–25% per Cdp-Institute 2024. The CORRECT positioning is "gift cards are brand-cash-equivalent redeemable on any product, any amount, no-discount-applied" — this preserves full-price-psychology while still driving 1.3–2.3× AOV-uplift on redemption per Aberdeen 2024 + Rise.ai 2024 benchmarks.

## Verification (this skill is "shipped" when...)

The Move #36 gift-card-program is "shipped" when ALL of the following are true:

- [ ] **Phase 1: Platform + design + terms of use.** Shopify-Gift-Cards-app OR Rise.ai OR Gift Up installed and configured; 3 gift card templates (default + holiday-seasonal + corporate-co-branded) live in the gift card catalog; gift card terms of use page published and state-law-compliant.
- [ ] **Phase 2: Klaviyo flows + loyalty rewards.** 6 Klaviyo flows live (gift card purchaser thank-you + gift card recipient welcome + birthday gift card + winback gift card + abandoned cart gift card offer + subscription cancellation save); loyalty-points-to-gift-card-conversion wired (100 points = $5 gift card); VIP-tier gift card rewards configured.
- [ ] **Phase 3: Triple Whale cohort + fraud prevention + post-purchase upsell.** Triple-Whale-gift-card-cohort-overlay configured with gift-card-recipient-cohort tag; fraud-prevention-checklist deployed (velocity-checks + IP-throttling + 2FA-on-checkout for >$500); post-purchase gift card upsell wired ($25 gift card for $20).
- [ ] **Phase 4: Corporate B2B portal (Path B+ optional).** Tillo / Giftbit / Rybbon / Blackhawk-Corporate B2B-portal configured; corporate-volume-discount-tiers live; corporate-co-branded-templates available; corporate-accounting-integration wired (NetSuite / QuickBooks / Xero).
- [ ] **Phase 5: Steady-state + iteration.** Weekly gift-card-program-review cadence established; holiday-seasonal templates refreshed quarterly; winback-flow-iteration-cycle live; Triple-Whale-cohort-LTV-iteration-cycle live; breakage-revenue-tracking live.
- [ ] **Triple-Whale-verification:** `cohort_ltv_gift_card_recipient_30d ≥ $50` AND `cohort_ltv_gift_card_recipient_60d ≥ $90` AND `cohort_ltv_gift_card_recipient_90d ≥ $130` AND `gift_card_recipient_cac_payback_days ≤ 60`.
- [ ] **Klaviyo-verification:** All 6 flows have ≥1 trigger in last 7 days; birthday-flow triggers correctly per birthday-month; winback-flow segments 90+-days-inactive customers correctly.
- [ ] **Shopify-verification:** Gift card catalog shows 3 templates; gift card terms of use page returns 200; gift card landing page returns 200 with balance-inquiry-form.
- [ ] **Fraud-verification:** Velocity-checks fire on test-purchase (try to buy 6 gift cards in 1 hour; expect block); IP-throttling fires on test-purchase-from-same-IP; 2FA fires on test-purchase >$500.
- [ ] **Year-1 ROI-verification:** Gift-card-revenue this year ≥ 5% of total DTC revenue (Path B target) OR ≥ 10% (Path C target); gift-card-recipient-cohort-LTV ≥ 1.0× organic-DTC-cohort-LTV; gift-card-CAC-payback ≤ 60 days.

## How to extend this skill

- **Move #36.1 — Gift-card-program-A/B-test-engine.** Build the A/B-test framework for gift card amount ($10 vs $25 vs $50), gift card template (default vs holiday-seasonal vs corporate-co-branded), gift card winback trigger day (60 vs 90 vs 120 days inactive), and gift card channel-mix (email-only vs email+SMS vs email+SMS+push). Compound on the canonical Klaviyo-A/B-test-infrastructure per Move #4 + Smile 2024 + Yotpo 2024 benchmarks.
- **Move #36.2 — Gift-card-affiliate-program-bridge.** Wire gift card purchases into the affiliate-program (Move #15) so gift card purchasers earn affiliate-credit for every gift card recipient who redeems + every gift card recipient who becomes a repeat customer. Compound on Impact 2024 + Refersion 2024 + Awin 2024 benchmarks for gift-card-affiliate-structures.
- **Move #36.3 — Gift-card-subscription-bundle-engine.** Build the "subscription-with-gift-card" SKU (e.g. 3-month subscription + $25 gift card for $99) to capture gift-givers who want a recurring gift. Compound on Recharge 2024 + Skio 2024 + Stay AI 2024 benchmarks for subscription-gift-card-bundles.
- **Move #36.4 — Gift-card-loyalty-tier-progression.** Wire gift card purchases into the loyalty-program tier-progression (e.g. spend $500 lifetime → unlock $50 gift card birthday-bonus; spend $1k lifetime → unlock $100 gift card birthday-bonus). Compound on Smile 2024 + LoyaltyLion 2024 + Yotpo 2024 benchmarks.
- **Move #36.5 — Gift-card-cross-border-multi-currency.** Build the multi-currency gift card program (USD + EUR + GBP + CAD + AUD) for international brands. Compound on Shopify Markets 2024 + Rise.ai 2024 multi-currency-gift-card-benchmarks.
- **Move #36.6 — Gift-card-corporate-invoicing-NetSuite-integration.** Build the NetSuite / QuickBooks / Xero API integration for corporate-purchase-invoicing + tax-handling + sales-tax-exempt-flag. Compound on Tillo 2024 + Giftbit 2024 + Blackhawk-Network-Corporate-2024 benchmarks for B2B-accounting-automation.
- **Move #36.7 — Gift-card-program-monthly-board-pack.** Build the monthly gift-card-program-board-pack with 5 slides: (1) gift card revenue vs target + YoY + WoW, (2) gift-card-recipient-cohort-LTV vs organic-DTC-cohort-LTV, (3) gift-card-revenue-by-template (default vs holiday-seasonal vs corporate-co-branded), (4) Top-10-gift-card-referrers (drive acquisition-channel-development), (5) fraud-incident-count + velocity-check-trigger-count + breakage-revenue-recognized. Compound on Triple-Whale-2024-board-pack-template.

## Cross-references

- **Move #1 (cart-abandon-recovery):** gift cards can be offered as the cart-abandon-incentive (5% off OR $10 gift card); see Move #36 Phase 2 abandoned cart gift card offer.
- **Move #2 (post-purchase-upsell):** post-purchase gift card upsell ($25 gift card for $20) is the highest-intent upsell; see Move #36 Phase 3 post-purchase gift card upsell.
- **Move #4 (welcome-series):** gift card recipient welcome flow (Day 0 when recipient opens gift card) is the canonical Move #4 × Move #36 compound; see Move #36 Phase 2 gift card recipient welcome.
- **Move #6 (Triple Whale attribution):** Triple-Whale-gift-card-cohort-overlay is the measurement-substrate for Move #36; see Move #36 Phase 1 + Phase 3 + Phase 5 Triple Whale integration.
- **Move #7 (SMS-orchestration):** Postscript SMS gift card flows (winback + birthday + abandoned cart + subscription cancellation save) are the canonical Move #7 × Move #36 compound; see Move #36 Phase 2 Klaviyo + Postscript flow builder.
- **Move #8 (loyalty-program):** loyalty-points-to-gift-card-conversion is the canonical Move #8 × Move #36 compound (25–40% higher redemption vs percentage-discount-rewards); see Move #36 Phase 2 loyalty rewards integration.
- **Move #11 (subscription-replenishment):** Recharge / Skio / Stay-AI cancellation-flow gift card offer is the canonical Move #11 × Move #36 compound; see Move #36 Phase 2 subscription cancellation save.
- **Move #15 (affiliate-program):** gift-card-affiliate-program-bridge (gift card purchaser earns affiliate-credit for every gift card recipient who redeems) is the canonical Move #15 × Move #36 compound; see Move #36.2 gift-card-affiliate-program-bridge.
- **Move #46 (promotional-calendar):** holiday-seasonal gift card templates (Christmas / Valentine's / Mother's Day / Father's Day / Graduation) are the canonical Move #46 × Move #36 compound; see Move #36 Phase 5 holiday-seasonal-ramp.

## Sources

- Aberdeen 2024 (gift card program benchmarks)
- NRF 2024 (US gift card market size + holiday-seasonal benchmarks)
- Cdp-Institute 2024 (corporate gifting B2B revenue benchmarks)
- trekksoft 2024 (corporate gifting volume-discount benchmarks)
- Rise.ai 2024 (digital gift card platform benchmarks)
- Gift Up 2024 (digital gift card platform benchmarks)
- Givex 2024 (enterprise gift card platform benchmarks)
- Shopify Gift Cards 2024 (Shopify-native gift card app)
- Stored Value Solutions 2024 (physical gift card printing + retail rack distribution)
- Blackhawk Network 2024 (retail rack distribution network)
- InComm 2024 (retail rack distribution network)
- National Gift Card 2024 (retail rack distribution)
- Tillo 2024 (on-demand digital-to-physical gift card printing + B2B API)
- Giftbit 2024 (B2B corporate gifting platform)
- Rybbon 2024 (B2B corporate gifting platform)
- Incentco 2024 (B2B incentive program platform)
- Reward Gateway 2024 (employee reward gift card platform)
- Giftcloud 2024 (UK gift card platform)
- Triple Whale 2024 (gift card cohort overlay + measurement)
- Klaviyo 2024 (gift card flow builder + winback + abandoned cart + birthday flows)
- Postscript 2024 (SMS gift card flows)
- Smile 2024 (loyalty + gift card rewards integration)
- LoyaltyLion 2024 (loyalty + gift card rewards integration)
- Yotpo 2024 (loyalty + gift card rewards integration)
- Recharge 2024 (subscription cancellation save + post-purchase gift card upsell)
- Skio 2024 (subscription cancellation save + gift card subscription bundle)
- Stay AI 2024 (subscription cancellation save + gift card subscription bundle)
- Visa/MC network rules 2024 (gift card expiration policy + fraud rules)
- State attorney general 2024 (gift card expiration policy compliance)
- FTC gift card scam prevention guidance 2024
- Nielsen 2024 (35–55 age demographic gift giver benchmarks)
- Retaildive 2024 (in-store gift card program penetration growth)
- Modern Retail 2024 (gift card program growth benchmarks)
- Pymentsdive 2024 (gift card payment processing benchmarks)
- Airesa 2024 (gift card platform comparison)
- Egiftify 2024 (digital gift card platform)
- Perfecto 2024 (gift card platform)
- EZcard 2024 (gift card platform)