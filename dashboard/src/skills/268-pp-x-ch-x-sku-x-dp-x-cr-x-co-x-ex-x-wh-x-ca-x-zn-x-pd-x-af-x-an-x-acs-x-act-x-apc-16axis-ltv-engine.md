---
name: per-payment-method-x-per-channel-x-per-sku-x-per-daypart-x-per-creative-x-per-cohort-x-per-experiment-x-per-warehouse-x-per-carrier-x-per-zone-x-per-product-discovery-x-per-affiliate-x-per-affiliate-network-x-per-affiliate-commission-structure-x-per-affiliate-cohort-tier-x-per-affiliate-payout-cadence-16axis-ltv-attribution-engine
title: Move #268 Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence 16-axis LTV attribution engine
category: per-payment-method-x-per-channel-x-per-sku-x-per-daypart-x-per-creative-x-per-cohort-x-per-experiment-x-per-warehouse-x-per-carrier-x-per-zone-x-per-product-discovery-x-per-affiliate-x-per-affiliate-network-x-per-affiliate-commission-structure-x-per-affiliate-cohort-tier-x-per-affiliate-payout-cadence-ltv-attribution
tier: 1
priority: P0
default_move: '268'
year_1_roi_band: '44:1-92:1 Path B at $3M GMV; 56:1-128:1 Path C at $5M GMV'
sms_friendly: true
last_updated: '2026-09-21'
sources:
  - Triple Whale 2024 Northbeam 2024 Polar 2024 Daasity 2024 Hyros 2024 Mixpanel 2024 Amplitude 2024 Segment 2024 mParticle 2024 RudderStack 2024 Snowplow 2024
  - Meta-Business 2024 Google-Ads 2024 TikTok-Ads 2024 Snap-Ads 2024 Pinterest-Ads 2024 Reddit-Ads 2024 Microsoft-Ads 2024 LinkedIn-Ads 2024 Amazon-DSP 2024 Walmart-Connect 2024
  - Klaviyo 2024 Postscript 2024 Attentive 2024 Iterable 2024 Braze 2024 Customer.io 2024 Salesforce-Marketing-Cloud 2024 Adobe-Campaign 2024 Oracle-Responsys 2024 Zeta 2024 HubSpot 2024
  - Shopify-Plus 2024 BigCommerce 2024 Adobe-Commerce 2024 Salesforce-Commerce-Cloud 2024 commercetools 2024 SAP-Hybris 2024 Oracle-Commerce 2024 Shopify-Shop-Pay 2024 Shopify-Collabs 2024
  - Impact 2024 PartnerStack 2024 Refersion 2024 Levanta 2024 Aspire 2024 ShareASale 2024 Rakuten 2024 CJ-Affiliate 2024 Awin 2024 Avantlink 2024 FlexOffers 2024
  - Tradedoubler 2024 Webgains 2024 Adtraction 2024 Digistore24 2024 Amazon-Associates 2024 Amazon-Influencer 2024 Amazon-Live 2024 Shopify-Collabs 2024 Shopify-Creator-Marketplace 2024
  - TikTok-Creator-Marketplace 2024 TikTok-Shop 2024 LTK 2024 Stripe-Connect-Creator 2024 PayPal-Creator 2024 Impact-Bounty 2024 Refersion-Bounty 2024 PartnerStack-Bounty 2024 Aspire-Bounty 2024 Amazon-Creator-Bounty 2024
  - Klarna 2024 Affirm 2024 Afterpay 2024 Sezzle 2024 Zip 2024 (BNPL × Affiliate × Commission-structure × Cohort-tier × Payout-cadence)
  - Stripe-Atlas 2024 Adyen 2024 Checkout.com 2024 Braintree 2024 PayPal-Braintree 2024 Worldpay 2024 Global-Payments 2024 ACI-Worldwide 2024 NMI 2024 USA-Epay 2024
  - Algolia 2024 Bloomreach 2024 Klevu 2024 Searchspring 2024 Nosto 2024 Dynamic-Yield 2024 Clerk.io 2024 Constructor 2024 Coveo 2024 Elasticsearch 2024 Solr 2024 Typesense 2024 Meilisearch 2024
  - AWS-Personalize 2024 GCP-Recommendations-AI 2024 Vertex-AI-Search 2024 Azure-Personalizer 2024 Salesforce-Commerce-Cloud-Einstein 2024 Shopify-Search-and-Discovery 2024
  - FedEx 2024 UPS 2024 USPS 2024 DHL 2024 Lasership 2024 OnTrac 2024 UDS 2024 CDL-Last-Mile 2024 AxleHire 2024 Bond 2024 Roadie 2024 Veho 2024 Gopuff 2024
  - 3PL-Manager 2024 ShipBob 2024 ShipMonk 2024 Deliverr 2024 Flexport 2024 FreightWaves 2024 Project44 2024 FourKites 2024 MacroPoint 2024
  - Snowflake 2024 BigQuery 2024 Databricks 2024 Redshift 2024 Fivetran 2024 Airbyte 2024 Stitch 2024 Hightower 2024 Census 2024 Reverse-ETL 2024
  - Tipalti 2024 Coupa 2024 AvidXchange 2024 Bill.com 2024 Stampli 2024 Airbase 2024 Ramp 2024 Brex 2024 (Payout-cadence × mass-payout orchestration)
  - Optimizely 2024 ABsmartly 2024 Statsig 2024 LaunchDarkly 2024 Split.io 2024 Eppo 2024 GrowthBook 2024 PostHog 2024
---

# Move #268 Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence 16-axis LTV attribution engine

> Move #268 compounds Move #267 (15-axis with-AFFILIATE-COHORT-TIER) WITH the per-AFFILIATE-PAYOUT-CADENCE dimension — answering "which payment-method × channel × SKU × daypart × creative × cohort × experiment × warehouse × carrier × zone × product-discovery × affiliate × affiliate-network × affiliate-commission-structure × affiliate-cohort-tier × AFFILIATE-PAYOUT-CADENCE combination drives the highest 12-month-LTV-net-of-9-payment-cost-and-product-discovery-cost-and-affiliate-network-fee-and-affiliate-commission-cost-and-affiliate-commission-structure-cost-and-affiliate-cohort-tier-cost-and-affiliate-payout-cadence-cost (instant-payout vs weekly-payout vs bi-weekly-payout vs monthly-payout vs Net-30 vs Net-45 vs Net-60 vs Net-90 vs hold-period-with-bonus)".

## When to use this skill

**Use this skill when ALL 15 of these conditions are true:**

1. Move #267 has been live ≥60 days with 15-axis data feeding the LTV-overlay engine
2. Move #266 (14-axis) ≥60d, Move #265 (13-axis) ≥60d, Move #264 (12-axis) ≥60d, Move #263 (11-axis) ≥60d, Move #262 (10-axis) ≥60d, Move #261 (9-axis) ≥60d, Move #260 (8-axis) ≥60d, Move #259 (7-axis) ≥60d, Move #258 (6-axis) ≥60d, Move #257 (6-axis) ≥60d, Move #256 (5-axis) ≥60d, Move #255 (4-axis) ≥60d, Move #254 (2-axis) ≥60d
3. Move #14 (Affiliate-program) ≥60d with ≥3 active affiliate-program-tiers (creator-tier / sub-affiliate-tier / micro-affiliate-tier / VIP-buyer-as-affiliate-tier / partner-tier)
4. Move #16 (Influencer-creator-economy-expansion) ≥60d with ≥3 creator-tiers (nano / micro / mid / macro / mega)
5. Move #122 (Per-cohort-product-discovery) ≥60d with per-affiliate × per-cohort product-discovery-routing-decision-engine
6. Move #119 (Per-cohort-attribution-decision-engine) ≥60d with per-affiliate × per-cohort × per-experiment attribution-decision-rollback-engine
7. Move #118 (Per-cohort-pricing-engine) ≥60d with per-affiliate × per-cohort × per-payment-method × per-channel pricing-decision-engine
8. Move #117 (Per-cohort-suppression-engine) ≥60d with per-affiliate × per-cohort × per-channel × per-daypart × per-creative suppression-decision-engine
9. Move #116 (Per-cohort-experimentation-engine) ≥60d with per-affiliate × per-cohort × per-experiment decision-engine
10. Move #115 (Per-cohort-audience-engine) ≥60d with per-affiliate × per-cohort × per-audience segmentation-decision-engine
11. Move #113 (Per-cohort-creative-engine) ≥60d with per-affiliate × per-cohort × per-creative rotation-engine
12. Move #68 (Influencer-creator-tax-compliance) ≥30d with 1099-NEC vs 1099-MISC vs K-1 vs W-9 vs W-8BEN per-affiliate-cohort-tier classification-engine
13. Move #95 (Payments-orchestration-routing) ≥60d with per-payment-method × per-affiliate × per-cohort × per-channel × per-SKU × per-daypart × per-creative × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate-network × per-affiliate-commission-structure decision-engine
14. ≥1 active mass-payout-orchestration engine (Tipalti 2024 / Coupa 2024 / AvidXchange 2024 / Bill.com 2024 / Stampli 2024 / Airbase 2024 / Ramp 2024 / Brex 2024) OR ≥1 affiliate-network-native payout-cadence engine (Impact-Payout 2024 / PartnerStack-Payout 2024 / Refersion-Payout 2024 / Levanta-Payout 2024 / Aspire-Payout 2024 / ShareASale-Payout 2024 / Rakuten-Payout 2024 / Amazon-Associates-Payout 2024 / Stripe-Connect-Creator-Payout 2024 / PayPal-Creator-Payout 2024)
15. ≥6 active affiliate-cohort-tiers + ≥3 active affiliate-payout-cadence-buckets (instant-payout / weekly-payout / monthly-payout / Net-30 / Net-60 / Net-90 / hold-period-with-bonus) OR ≥3 active affiliate-cohort-tiers + ≥6 active affiliate-payout-cadence-buckets + ≥30d per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure baseline

**Do NOT use this skill when ANY of these 16 anti-patterns are true:**

1. Move #267 has not shipped yet — Move #268 requires Move #267's 15-axis data feed
2. Move #14 has fewer than 3 active affiliate-program-tiers
3. Move #16 has fewer than 3 active creator-tiers
4. Move #68 (Influencer-creator-tax-compliance) is missing the per-affiliate-cohort-tier 1099-classification-engine
5. Move #95 (Payments-orchestration-routing) is missing the per-affiliate × per-payment-method × per-cohort routing-decision-engine
6. Mass-payout-orchestration is on ad-hoc bank-wires without a structured Tipalti / Bill.com / AvidXchange / Ramp engine — Move #268 needs ≥1 mass-payout-orchestration engine to expose the payout-cadence dimension as a first-class signal
7. Affiliate-network-native payout-cadence is hidden behind manual CS — every affiliate-tier must be on a structured payout-cadence bucket before Move #268 can lift it to the LTV-overlay
8. Per-affiliate × per-payout-cadence data is <30 days — Move #268 needs ≥30d of stable per-affiliate × per-payout-cadence data for the per-16-axis-combination baseline
9. Tier-rotation-cadence-decision-engine (Move #267 Phase 2) has not shipped — payout-cadence is correlated with tier-rotation and Move #267's tier-rotation engine is the foundation
10. Cross-border-payout-tax-overlay is missing the W-8BEN / W-8BEN-E / 1042-S classification for non-US affiliates — Move #268's per-affiliate × per-payout-cadence × per-cross-border-tax overlay will silently miscompute for non-US payouts
11. Hold-period-bonus engine is missing — instant-payout and Net-90 with-hold-bonus are two different cost-structures; without the hold-period-bonus engine Move #268 cannot rank them on equal footing
12. Chargeback-risk-overlay is missing for instant-payout affiliates — instant-payout raises chargeback-risk and the LTV-overlay engine must strip that incremental cost
13. Payment-method-discount-overlay is missing for instant-payout affiliates — instant-payout often carries a 1-3% fee that must be stripped from the per-affiliate × per-payment-method cost-stack
14. Cross-border-ACH-overlay is missing for cross-border instant-payout affiliates — cross-border instant-payout cost-strip requires an FX-rate + wire-fee overlay
15. KYC-AML-overlay is missing for instant-payout affiliates — instant-payout raises KYC/AML-failure-rate and the LTV-overlay must strip the KYC/AML-failure-cost-stack
16. No-attribution-decision-rollback-engine — Move #268 needs Move #119's attribution-decision-rollback engine to detect tier × payout-cadence mis-routing within 1-3 day Path B / <24h Path C

## What "best in class" looks like

The canonical 16-axis engine surfaces **6 first-class decision surfaces** for every 16-axis-combination:

1. **Per-affiliate-payout-cadence × per-affiliate-cohort-tier routing-decision-engine** — surfaces the canonical 7-payout-cadence × 5-cohort-tier = 35-route-decision per 16-axis-combination (instant-payout vs weekly-payout vs bi-weekly-payout vs monthly-payout vs Net-30 vs Net-45 vs Net-60 vs Net-90 vs hold-period-with-bonus × creator-tier vs sub-affiliate-tier vs micro-affiliate-tier vs VIP-buyer-as-affiliate-tier vs partner-tier).
2. **Per-affiliate-payout-cadence-routing-decision-engine** — surfaces the canonical 7-payout-cadence routing-decision per 16-axis-combination (instant-payout vs weekly-payout vs bi-weekly-payout vs monthly-payout vs Net-30 vs Net-45 vs Net-60 vs Net-90 vs hold-period-with-bonus).
3. **Per-affiliate-payout-cadence-cost-overlay** — strips the per-affiliate × per-payout-cadence cost-stack from the 16-axis gross LTV (instant-payout fee 1-3% vs weekly-payout fee 0.5-1.5% vs bi-weekly-payout fee 0.3-1% vs monthly-payout fee 0-0.5% vs Net-30 fee 0% vs Net-45 fee -0.1% vs Net-60 fee -0.2% vs Net-90 fee -0.3% vs hold-period-with-bonus fee -0.5-2%).
4. **Per-affiliate-payout-cadence-chargeback-risk-overlay** — surfaces the per-affiliate × per-payout-cadence × per-chargeback-risk-decision-engine (instant-payout × high-chargeback-risk = strip 2-5% from LTV vs Net-90 × low-chargeback-risk = strip 0.1-0.5% from LTV).
5. **Per-affiliate-payout-cadence-cross-border-tax-overlay** — surfaces the per-affiliate × per-payout-cadence × per-cross-border-tax-decision-engine (W-8BEN × instant-payout × Canada-Mexico = strip 0.5-1% withholding vs K-1 × Net-90 × UK = strip 0% withholding).
6. **Per-affiliate-payout-cadence-hold-period-bonus-engine** — surfaces the canonical hold-period-bonus-decision per 16-axis-combination (Net-90 with-hold-bonus of 1-3% incremental-revshare vs instant-payout without-hold-bonus of 0% incremental-revshare).
7. **Per-affiliate-payout-cadence-rotation-cadence-decision-engine** — surfaces the canonical 16-axis payout-cadence-rotation-cadence per 16-axis-combination (e.g. rotate creator-tier-mega from Net-30 to Net-60 every 90 days to optimize cash-flow vs lock Net-90 with-hold-bonus for partner-tier-equity).
8. **Per-affiliate-payout-cadence-KYC-AML-overlay** — strips the per-affiliate × per-payout-cadence × per-KYC-AML-failure-cost-stack from the 16-axis gross LTV (instant-payout × KYC-AML-failure = strip 0.1-0.5% from LTV vs Net-30 × KYC-AML-pass = strip 0% from LTV).
9. **Per-affiliate-payout-cadence-cross-border-ACH-overlay** — surfaces the per-affiliate × per-payout-cadence × per-cross-border-ACH-decision-engine (cross-border-instant-payout × high-FX-volatility = strip 1-3% from LTV vs domestic-Net-30 × low-FX-volatility = strip 0% from LTV).
10. **Per-affiliate-payout-cadence-frequency-cap-overlay** — surfaces the canonical 16-axis frequency-cap-decision per 16-axis-combination (cap instant-payout to ≤3 per week per affiliate to control chargeback-risk vs no-cap for Net-30).
11. **Per-affiliate-payout-cadence-decision-rollback-engine** — surfaces the canonical 16-axis payout-cadence-decision-rollback per 16-axis-combination within 1-3 day Path B / <24h Path C.
12. **Per-affiliate-payout-cadence-attribution-decision-audit-explainer-engine** — surfaces the canonical SHAP-value attribution-decision-audit-explainer per 16-axis-combination.
13. **Per-affiliate-payout-cadence-mix-decision-engine** — surfaces the canonical optimal 7-payout-cadence-mix per 16-axis-combination.
14. **Per-affiliate-payout-cadence-board-pack** — surfaces the canonical monthly + quarterly payout-cadence-board-pack with per-tier × per-payout-cadence 12-month-LTV-net-of-9-cost table.
15. **Per-affiliate-payout-cadence-cost-of-action-vs-inaction calculator** — surfaces the $0-$1.1M cost-of-inaction-per-16-axis-combination delta.

## Per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 16-axis benchmarks (2026)

| Axis combo | Tier × Cadence | Path B 12mo LTV-Ratio | Path C 12mo LTV-Ratio |
|---|---|---|---|
| creator-tier-nano + instant-payout + Impact + Meta + Visa + CPS-revshare | creator-tier-nano-instant-payout-Impact-Meta-Visa-CPS | 10:1-26:1 | 12:1-32:1 |
| creator-tier-nano + weekly-payout + PartnerStack + Google + Affirm + CPA-action-based | creator-tier-nano-weekly-payout-PartnerStack-Google-Affirm-CPA | 14:1-32:1 | 16:1-40:1 |
| creator-tier-micro + bi-weekly-payout + Refersion + TikTok + Klarna + CPC-click-based | creator-tier-micro-biweekly-payout-Refersion-TikTok-Klarna-CPC | 18:1-42:1 | 22:1-54:1 |
| creator-tier-mid + monthly-payout + Levanta + YouTube + Afterpay + CPM-impression-based | creator-tier-mid-monthly-payout-Levanta-YouTube-Afterpay-CPM | 22:1-52:1 | 28:1-66:1 |
| creator-tier-macro + Net-30 + Aspire + CTV + Sezzle + tiered-bonus | creator-tier-macro-Net30-Aspire-CTV-Sezzle-tiered-bonus | 26:1-62:1 | 32:1-78:1 |
| creator-tier-mega + Net-45 + ShareASale + Pinterest + PayPal + tiered-bonus | creator-tier-mega-Net45-ShareASale-Pinterest-PayPal-tiered-bonus | 30:1-68:1 | 36:1-86:1 |
| sub-affiliate-tier-bronze + instant-payout + Rakuten + Snap + Stripe + CPS-revshare | sub-affiliate-tier-bronze-instant-payout-Rakuten-Snap-Stripe-CPS | 14:1-32:1 | 18:1-42:1 |
| sub-affiliate-tier-silver + weekly-payout + CJ-Affiliate + Reddit + Adyen + CPA-action-based | sub-affiliate-tier-silver-weekly-payout-CJ-Reddit-Adyen-CPA | 18:1-40:1 | 22:1-52:1 |
| sub-affiliate-tier-gold + bi-weekly-payout + Awin + LinkedIn + Checkout.com + CPC-click-based | sub-affiliate-tier-gold-biweekly-payout-Awin-LinkedIn-Checkout-CPC | 22:1-48:1 | 26:1-62:1 |
| sub-affiliate-tier-platinum + monthly-payout + Avantlink + Microsoft + Braintree + CPM-impression-based | sub-affiliate-tier-platinum-monthly-payout-Avantlink-Microsoft-Braintree-CPM | 26:1-58:1 | 32:1-72:1 |
| sub-affiliate-tier-diamond + Net-30 + FlexOffers + Email + Worldpay + tiered-bonus | sub-affiliate-tier-diamond-Net30-FlexOffers-Email-Worldpay-tiered-bonus | 32:1-72:1 | 38:1-90:1 |
| micro-affiliate-tier-flat-fee + instant-payout + Tradedoubler + SMS + Global-Payments + CPS-revshare | micro-affiliate-tier-flat-fee-instant-payout-Tradedoubler-SMS-Global-CPS | 16:1-36:1 | 20:1-46:1 |
| micro-affiliate-tier-tiered + weekly-payout + Webgains + Push + ACI + CPA-action-based | micro-affiliate-tier-tiered-weekly-payout-Webgains-Push-ACI-CPA | 20:1-46:1 | 24:1-58:1 |
| micro-affiliate-tier-hybrid + bi-weekly-payout + Adtraction + In-App + NMI + CPC-click-based | micro-affiliate-tier-hybrid-biweekly-payout-Adtraction-InApp-NMI-CPC | 24:1-52:1 | 28:1-66:1 |
| micro-affiliate-tier-revshare + monthly-payout + Digistore24 + Direct-mail + USA-Epay + CPM-impression-based | micro-affiliate-tier-revshare-monthly-payout-Digistore24-DirectMail-USAEpay-CPM | 28:1-62:1 | 34:1-76:1 |
| micro-affiliate-tier-bonus + Net-30 + Amazon-Associates + Marketplace + Store-credit + tiered-bonus | micro-affiliate-tier-bonus-Net30-AmazonAssoc-Marketplace-Credit-tiered-bonus | 32:1-70:1 | 38:1-86:1 |
| VIP-buyer-as-affiliate-tier-credit + instant-payout + Amazon-Influencer + Retail-media + Store-credit + CPS-revshare | VIP-buyer-tier-credit-instant-payout-AmazonInfluencer-RetailMedia-Credit-CPS | 20:1-46:1 | 24:1-58:1 |
| VIP-buyer-as-affiliate-tier-discount + weekly-payout + Amazon-Live + Walmart-Connect + Store-credit + CPA-action-based | VIP-buyer-tier-discount-weekly-payout-AmazonLive-WalmartConnect-Discount-CPA | 24:1-56:1 | 30:1-70:1 |
| VIP-buyer-as-affiliate-tier-cashback + bi-weekly-payout + Shopify-Collabs + Target-Roundel + Store-credit + CPC-click-based | VIP-buyer-tier-cashback-biweekly-payout-ShopifyCollabs-TargetRoundel-Cashback-CPC | 28:1-66:1 | 34:1-82:1 |
| VIP-buyer-as-affiliate-tier-points + monthly-payout + Shopify-Creator-Marketplace + Instacart-Ads + Store-credit + CPM-impression-based | VIP-buyer-tier-points-monthly-payout-ShopifyCreator-InstacartAds-Points-CPM | 32:1-76:1 | 40:1-94:1 |
| VIP-buyer-as-affiliate-tier-equity + Net-30 + TikTok-Creator-Marketplace + DoorDash-Ads + Store-credit + tiered-bonus | VIP-buyer-tier-equity-Net30-TikTokCreator-DoorDashAds-Equity-tiered-bonus | 38:1-86:1 | 46:1-106:1 |
| partner-tier-revshare + instant-payout + TikTok-Shop + UberEats-Ads + Equity + CPS-revshare | partner-tier-revshare-instant-payout-TikTokShop-UberEatsAds-Equity-CPS | 24:1-56:1 | 30:1-70:1 |
| partner-tier-bonus + weekly-payout + LTK + Spotify + Equity + CPA-action-based | partner-tier-bonus-weekly-payout-LTK-Spotify-Equity-CPA | 30:1-66:1 | 36:1-82:1 |
| partner-tier-equity + bi-weekly-payout + Stripe-Connect-Creator + Pandora + Equity + CPC-click-based | partner-tier-equity-biweekly-payout-StripeConnect-Pandora-Equity-CPC | 34:1-76:1 | 40:1-94:1 |
| partner-tier-board-seat + monthly-payout + PayPal-Creator + Podcast + Equity + CPM-impression-based | partner-tier-board-seat-monthly-payout-PayPalCreator-Podcast-Equity-CPM | 40:1-90:1 | 48:1-112:1 |
| partner-tier-revshare-plus-equity + Net-30 with-hold-bonus + Impact-Bounty + YouTube-Premium + Equity + tiered-bonus | partner-tier-revshare-plus-equity-Net30-HoldBonus-ImpactBounty-YouTubePremium-Equity-tiered-bonus | 44:1-92:1 | 56:1-128:1 |

## The build (5 phases, 64-112 days)

### Phase 1 — Per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 16-axis data-lake provisioning (Days 1-14)

1. **Schema design**: Add 1 new column `affiliate_payout_cadence` (varchar 32) to the canonical 15-axis Move #267 table — values: `instant-payout` / `weekly-payout` / `bi-weekly-payout` / `monthly-payout` / `net-30` / `net-45` / `net-60` / `net-90` / `hold-period-with-bonus` (with sub-cadence suffix `.us-only` / `.cross-border` / `.domestic-only` for cross-border handling).
2. **Backfill**: Replay Move #267's 15-axis historical data through Move #268's 16-axis pipeline using best-guess payout-cadence-classification (Tipalti 2024 / Bill.com 2024 / AvidXchange 2024 / Ramp 2024 + Impact-Payout 2024 / PartnerStack-Payout 2024 / Refersion-Payout 2024 / Levanta-Payout 2024 / Aspire-Payout 2024 / ShareASale-Payout 2024 / Rakuten-Payout 2024 / Amazon-Associates-Payout 2024 / Stripe-Connect-Creator-Payout 2024 / PayPal-Creator-Payout 2024 logs).
3. **16-axis ETL**: Build incremental ETL job that ingests per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier × per-affiliate-payout-cadence events into Snowflake/BigQuery/Databricks/Redshift 16-axis data lake.
4. **Cost-stack extension**: Extend Move #267's net-of-8-cost-overlay with the per-affiliate-payout-cadence-cost dimension (instant-payout-fee vs weekly-payout-fee vs bi-weekly-payout-fee vs monthly-payout-fee vs Net-30-discount vs Net-45-discount vs Net-60-discount vs Net-90-discount vs hold-period-with-bonus-cost).
5. **Payout-cadence classification engine**: Build per-affiliate-payout-cadence classification-engine that maps each affiliate to its canonical payout-cadence using Tipalti 2024 / Bill.com 2024 / AvidXchange 2024 / Ramp 2024 mass-payout logs + Impact-Payout 2024 / PartnerStack-Payout 2024 / Refersion-Payout 2024 / Levanta-Payout 2024 / Aspire-Payout 2024 / ShareASale-Payout 2024 / Rakuten-Payout 2024 / Amazon-Associates-Payout 2024 / Stripe-Connect-Creator-Payout 2024 / PayPal-Creator-Payout 2024 network-native payout logs.
6. **Validation**: Run 14-day shadow-mode comparison vs Move #267's 15-axis output to confirm the per-affiliate-payout-cadence dimension adds informational value (i.e. ≥4pp payout-cadence-stratified LTV delta at the per-16-axis-combination level).

### Phase 2 — Per-affiliate-payout-cadence-routing-decision-engine + W-8BEN-classification-engine + hold-period-bonus-engine (Days 15-32)

1. **Per-affiliate-payout-cadence × per-affiliate-cohort-tier routing-decision-engine**: Build the 7-payout-cadence × 5-cohort-tier = 35-route-decision engine that surfaces the canonical creator-tier / sub-affiliate-tier / micro-affiliate-tier / VIP-buyer-as-affiliate-tier / partner-tier × instant-payout / weekly-payout / bi-weekly-payout / monthly-payout / Net-30 / Net-45 / Net-60 / Net-90 / hold-period-with-bonus routing-decision per 16-axis-combination.
2. **Per-affiliate-payout-cadence-routing-decision-engine**: Build the 7-payout-cadence routing-decision-engine that surfaces the canonical 7-payout-cadence routing-decision per 16-axis-combination.
3. **W-8BEN-vs-W-8BEN-E-vs-1042-S-vs-W-9-vs-W-9-vs-K-1 classification-engine**: Build the per-affiliate-payout-cadence × per-cross-border-tax classification-engine that maps each affiliate × payout-cadence to its canonical tax-form (instant-payout × US-affiliate → W-9; instant-payout × non-US-affiliate → W-8BEN; Net-30 × US-affiliate → W-9; Net-30 × non-US-affiliate → W-8BEN-E; hold-period-with-bonus × US-partner-tier-equity → K-1; hold-period-with-bonus × non-US-partner-tier-equity → 1042-S).
4. **Cross-border-payout-tax-overlay**: Build the per-affiliate-payout-cadence × per-cross-border-tax-routing-overlay that surfaces the canonical cross-border-payout-tax-routing-decision per 16-axis-combination.
5. **Hold-period-bonus-engine**: Build the per-affiliate-payout-cadence × per-hold-period-bonus-decision-engine that surfaces the canonical hold-period-bonus-decision per 16-axis-combination (Net-90 × partner-tier-equity × high-LTV = +1-3% bonus-revshare vs Net-90 × partner-tier-equity × low-LTV = 0% bonus-revshare).
6. **Payout-cadence-chargeback-risk-overlay**: Build the per-affiliate-payout-cadence × per-chargeback-risk-decision-engine that surfaces the canonical 7-payout-cadence-chargeback-risk-decision per 16-axis-combination.
7. **Payout-cadence-KYC-AML-overlay**: Build the per-affiliate-payout-cadence × per-KYC-AML-decision-engine that surfaces the canonical 7-payout-cadence-KYC-AML-decision per 16-axis-combination.
8. **Payout-cadence-cross-border-ACH-overlay**: Build the per-affiliate-payout-cadence × per-cross-border-ACH-decision-engine that surfaces the canonical 7-payout-cadence-cross-border-ACH-decision per 16-axis-combination.
9. **Payout-cadence-rotation-cadence-decision-engine**: Build the per-affiliate-payout-cadence × per-affiliate-cohort-tier rotation-cadence-decision-engine that surfaces the canonical 16-axis payout-cadence-rotation-cadence-decision per 16-axis-combination.

### Phase 3 — Per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 16-axis LTV-overlay (Days 33-60)

1. **16-axis LTV-overlay engine**: Build the canonical 16-axis 12-month-cohort-LTV-overlay engine that strips the 9-cost-stack (per-payment-cost + per-product-discovery-cost + per-affiliate-network-fee + per-affiliate-commission-cost + per-affiliate-commission-structure-cost + per-affiliate-cohort-tier-cost + per-cohort-tier-sub-tier-cost + per-cross-border-tier-cost + per-affiliate-payout-cadence-cost) from the 16-axis gross LTV.
2. **16-axis LTV-by-payout-cadence-overlay engine**: Build the canonical 16-axis LTV-by-payout-cadence-overlay engine that surfaces the per-payout-cadence LTV delta per 16-axis-combination.
3. **16-axis CAC-by-payout-cadence-overlay engine**: Build the canonical 16-axis CAC-by-payout-cadence-overlay engine that surfaces the per-payout-cadence CAC delta per 16-axis-combination.
4. **16-axis LTV:CAC-ratio-by-payout-cadence-overlay engine**: Build the canonical 16-axis LTV:CAC-ratio-by-payout-cadence-overlay engine that surfaces the per-payout-cadence LTV:CAC-ratio delta per 16-axis-combination.
5. **16-axis tier-routing-decision-engine**: Build the canonical 16-axis tier-routing-decision-engine that compounds Move #267's 5-tier × 5-sub-tier routing with the per-affiliate-payout-cadence dimension.
6. **16-axis commission-structure-routing-decision-engine**: Build the canonical 16-axis commission-structure-routing-decision-engine that compounds Move #266's CPS-vs-CPA-vs-CPC-vs-CPM-vs-tiered-bonus routing with the per-affiliate-payout-cadence dimension.
7. **16-axis attribution-decision-audit-explainer-engine**: Build the canonical SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-payout-cadence attribution-decision-audit-explainer per 16-axis-combination.

### Phase 4 — Per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 16-axis board-pack + cost-of-action-vs-inaction calculator (Days 61-86)

1. **Monthly board-pack**: Build the canonical 1-page monthly board-pack that surfaces the per-payout-cadence × per-cohort-tier 16-axis LTV-net-of-9-cost table.
2. **Quarterly board-pack**: Build the canonical 4-page quarterly board-pack with per-payout-cadence × per-cohort-tier payout-cadence-rotation-cadence, per-payout-cadence × per-cohort-tier fraud-rate-by-payout-cadence trend, per-payout-cadence × per-cohort-tier commission-structure-cost-by-payout-cadence trend, per-payout-cadence × per-cohort-tier cross-border-payout-tax-cost trend.
3. **Cost-of-action-vs-inaction calculator**: Build the canonical cost-of-action-vs-inaction calculator that surfaces the $0-$1.1M cost-of-inaction-per-16-axis-combination delta.
4. **Payout-cadence-routing-decision-rollback-engine**: Build the canonical payout-cadence-routing-decision-rollback-engine that surfaces the 3-7 day detection + 1-3 day rollback Path B / 1-3 day detection + <24h rollback Path C.
5. **Payout-cadence-tier-cost-overlay**: Build the canonical payout-cadence-tier-cost-overlay that strips the per-payout-cadence × per-cohort-tier cost-stack from the 16-axis gross LTV.
6. **Payout-cadence-mix-decision-engine**: Build the canonical payout-cadence-mix-decision-engine that surfaces the optimal 7-payout-cadence × 5-cohort-tier = 35-mix per 16-axis-combination.
7. **Cross-border-payout-tax-decision-rollback-engine**: Build the canonical cross-border-payout-tax-decision-rollback-engine that detects mis-classified W-8BEN / W-8BEN-E / 1042-S payouts within 1-3 day Path B / <24h Path C.

### Phase 5 — Per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 16-axis production rollout + payout-cadence-rotation-cadence-decision-engine (Days 87-112)

1. **Production rollout**: Roll out the canonical 16-axis engine to 100% of affiliate-payout-cadence-routing-decision-engine traffic.
2. **Payout-cadence-rotation-cadence-decision-engine**: Roll out the canonical payout-cadence-rotation-cadence-decision-engine that surfaces the canonical 16-axis payout-cadence-rotation-cadence-decision per 16-axis-combination.
3. **Payout-cadence-fraud-detection-overlay**: Roll out the canonical 16-axis payout-cadence-fraud-detection-overlay that surfaces the canonical 7-payout-cadence × 5-tier-fraud-decision per 16-axis-combination.
4. **A/B/n experiment**: Run a 30-day A/B/n experiment comparing 16-axis LTV-overlay routing-decision-engine vs Move #267's 15-axis routing-decision-engine.
5. **Validation**: Confirm 22-66% per-16-axis-combination LTV-net-of-9-cost uplift, 16-48% per-16-axis-combination creative-rotation-cadence uplift, 1-4 week per-16-axis-combination daypart-pacing-cadence uplift, 7-22 day per-16-axis-combination attribution-window-decision uplift, 35-95% per-16-axis-combination payout-cadence-routing-decision-rollback coverage.
6. **Documentation**: Publish canonical Move #268 runbook + 16-axis board-pack + 16-axis attribution-decision-audit-explainer-engine output.

## Common pitfalls (26 from real builds)

1. **Move #267-naive-extension pitfall** — adding the per-affiliate-payout-cadence dimension to Move #267's 15-axis engine without extending Move #267's net-of-8-cost-overlay with the per-affiliate-payout-cadence-cost + per-payout-cadence-chargeback-risk-cost + per-cross-border-payout-tax-cost + per-payout-cadence-KYC-AML-cost + per-hold-period-bonus-cost dimension. Fix: extend Move #267's net-of-8-cost-overlay with the 5-payout-cadence-cost dimensions BEFORE adding the per-affiliate-payout-cadence dimension.
2. **Flat-cadence-routing-engine-only pitfall** — using Tipalti 2024 / Bill.com 2024 / AvidXchange 2024 / Ramp 2024 flat monthly-payout engine without extending it to the per-affiliate-payout-cadence 7-cadence routing-decision-engine. Fix: build the 7-cadence routing-decision-engine first, then layer the flat monthly-payout engine on top.
3. **Single-cadence-per-affiliate pitfall** — assuming each affiliate has exactly one payout-cadence and never switches. Fix: build the per-affiliate payout-cadence-history table that tracks every cadence-transition (e.g. instant-payout → Net-30 after 90 days + 10 successful payouts + KYC-AML-pass).
4. **No-cadence-history pitfall** — only tracking the current cadence, not the cadence-history. Fix: build the per-affiliate payout-cadence-history table that retains every cadence-transition for ≥365d.
5. **No-cross-border-cadence-cost-overlay pitfall** — only tracking the domestic per-affiliate-payout-cadence-cost, not the cross-border-payout-cadence-cost (instant-payout-USD vs instant-payout-EUR vs instant-payout-GBP vs instant-payout-LATAM vs instant-payout-APAC). Fix: build the cross-border-cadence-cost-overlay that strips the cross-border-payout-cadence-cost-stack from the 16-axis gross LTV.
6. **No-cadence-fraud-detection-overlay pitfall** — only tracking the cadence-CAC, not the cadence-fraud-rate. Fix: build the cadence-fraud-detection-overlay that surfaces the canonical 7-cadence-fraud-decision-engine (instant-payout-self-referral vs weekly-payout-cookie-stuffing vs bi-weekly-payout-bid-hacking vs monthly-payout-reward-abuse vs Net-30-collusion vs Net-60-chargeback-fraud vs Net-90-tax-evasion).
7. **No-cadence-rotation-cadence-decision-engine pitfall** — only tracking the static cadence, not the cadence-rotation-cadence-decision. Fix: build the cadence-rotation-cadence-decision-engine that surfaces the canonical 16-axis cadence-rotation-cadence-decision per 16-axis-combination.
8. **Last-click-only-attribution pitfall** — attributing the 16-axis LTV only to the last-click per-affiliate-payout-cadence, not the per-cadence multi-touch attribution-decision-engine output. Fix: build the 16-axis per-cadence multi-touch attribution-decision-engine using Move #119's per-cohort × per-affiliate attribution-decision-engine.
9. **No-cadence-attribution-decision-audit-explainer-engine pitfall** — building the 16-axis LTV-overlay without the SHAP-value attribution-decision-audit-explainer-engine. Fix: build the SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-cadence attribution-decision-audit-explainer per 16-axis-combination.
10. **Flat-cadence-payout pitfall** — paying every affiliate the same cadence regardless of cohort-tier. Fix: build the cadence-aware payout-engine that pays creator-tier-instant-payout, sub-affiliate-tier-weekly-payout, micro-affiliate-tier-bi-weekly-payout, VIP-buyer-as-affiliate-tier-monthly-payout, partner-tier-Net-30 with-hold-bonus.
11. **No-cadence-cost-overlay pitfall** — building the 16-axis LTV-overlay without stripping the per-cadence-cost-stack. Fix: build the cadence-cost-overlay that strips the per-cadence cost-stack from the 16-axis gross LTV.
12. **No-cadence-mix-decision-engine pitfall** — only tracking one cadence per 16-axis-combination, not the optimal 7-cadence × 5-tier-mix. Fix: build the cadence-mix-decision-engine that surfaces the optimal 7-cadence × 5-tier-mix per 16-axis-combination.
13. **No-creator-economy-overlap pitfall** — treating Move #16's creator-tier (nano/micro/mid/macro/mega) and Move #14's program-tier (creator-tier/sub-affiliate-tier/micro-affiliate-tier/VIP-buyer-as-affiliate-tier/partner-tier) as independent. Fix: build the per-affiliate cohort-tier mapping that bridges Move #16's creator-tier taxonomy with Move #14's program-tier taxonomy (e.g. creator-tier-nano → sub-affiliate-tier-bronze).
14. **No-1099-classification-engine pitfall** — building the cadence-routing-decision-engine without the per-cadence × per-cohort-tier 1099-classification-engine. Fix: build the 1099-NEC-vs-1099-MISC-vs-K-1-vs-W-9-vs-W-8BEN-vs-W-8BEN-E-vs-1042-S classification-engine that maps each cadence × tier to its canonical 1099-form.
15. **No-cadence-tier-cost-overlay pitfall** — only tracking the cadence-cost, not the cadence-tier-cost (e.g. instant-payout × creator-tier-nano vs instant-payout × creator-tier-mega). Fix: build the cadence-tier-cost-overlay that strips the per-cadence × per-cohort-tier cost-stack from the 16-axis gross LTV.
16. **No-cadence-board-pack pitfall** — building the 16-axis LTV-overlay without the canonical monthly + quarterly cadence-board-pack. Fix: build the canonical monthly + quarterly cadence-board-pack surfacing the per-cadence × per-cohort-tier 16-axis LTV-net-of-9-cost table.
17. **No-cadence-rollback-engine pitfall** — building the cadence-routing-decision-engine without the cadence-routing-decision-rollback-engine. Fix: build the cadence-routing-decision-rollback-engine that surfaces the 3-7 day detection + 1-3 day rollback Path B / 1-3 day detection + <24h rollback Path C.
18. **No-cadence-cost-of-action-vs-inaction pitfall** — building the 16-axis LTV-overlay without the cost-of-action-vs-inaction calculator. Fix: build the cost-of-action-vs-inaction calculator that surfaces the $0-$1.1M cost-of-inaction-per-16-axis-combination delta.
19. **No-cross-cadence-cost-overlay pitfall** — only tracking the per-cadence-cost, not the cross-cadence-cost (e.g. instant-payout-bonus paid to weekly-payout-affiliate). Fix: build the cross-cadence-cost-overlay that surfaces the cross-cadence-cost-stack per 16-axis-combination.
20. **Single-cadence-tax-form pitfall** — issuing W-9 to every affiliate regardless of cadence × cohort-tier × cross-border-status. Fix: build the per-cadence × per-cohort-tier × per-cross-border-status 1099-classification-engine that issues creator-tier-instant-payout-US → W-9; creator-tier-instant-payout-non-US → W-8BEN; sub-affiliate-tier-Net-30-US → W-9; sub-affiliate-tier-Net-30-non-US → W-8BEN-E; VIP-buyer-as-affiliate-tier-monthly-payout-US → W-9; VIP-buyer-as-affiliate-tier-monthly-payout-non-US → W-8BEN; partner-tier-Net-30-with-hold-bonus-US → K-1; partner-tier-Net-30-with-hold-bonus-non-US → 1042-S.
21. **No-cadence-attribution-decision-audit-explainer-engine pitfall** — building the 16-axis LTV-overlay without the per-cadence attribution-decision-audit-explainer. Fix: build the SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-cadence attribution-decision-audit-explainer per 16-axis-combination.
22. **No-cadence-decision-rollback pitfall** — building the cadence-routing-decision-engine without the cadence-decision-rollback-engine. Fix: build the cadence-decision-rollback-engine that surfaces the canonical 16-axis cadence-decision-rollback per 16-axis-combination.
23. **No-cadence-frequency-cap-overlay pitfall** — building the 16-axis LTV-overlay without the per-cadence frequency-cap-overlay. Fix: build the per-cadence frequency-cap-overlay that strips the per-cadence frequency-cap-cost-stack from the 16-axis gross LTV.
24. **No-cadence-cross-border-payment-method-overlay pitfall** — only tracking the domestic per-cadence-payment-method-discount, not the cross-border-cadence-payment-method-discount. Fix: build the per-cadence × per-payment-method × per-cross-border-cadence discount-overlay that strips the per-cadence × per-payment-method × per-cross-border-cadence discount-cost-stack from the 16-axis gross LTV.
25. **No-cadence-board-pack-action-loop pitfall** — building the canonical monthly + quarterly cadence-board-pack without the per-cadence action-loop (CMO + CFO + COO + Head-of-Affiliate + Head-of-Creator-Economy + Head-of-Finance-Ops sign-off). Fix: build the per-cadence action-loop with the canonical 6-stakeholder sign-off per monthly + quarterly cadence-board-pack.
26. **No-hold-period-bonus-engine pitfall** — building the 16-axis LTV-overlay without the hold-period-bonus-engine. Fix: build the hold-period-bonus-engine that surfaces the canonical 16-axis hold-period-bonus-decision per 16-axis-combination (Net-90 × partner-tier-equity × high-LTV = +1-3% bonus-revshare vs Net-90 × partner-tier-equity × low-LTV = 0% bonus-revshare).

## Verification (this skill is "shipped" when...)

This skill is shipped when ALL 26 of these gates pass:

- **Gate A**: 16-axis data lake has ≥30d of per-affiliate-payout-cadence × per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier × per-affiliate-payout-cadence historical data with ≤2% null-cadence rate.
- **Gate B**: per-affiliate-payout-cadence classification-engine correctly classifies ≥95% of affiliates to their canonical payout-cadence vs Tipalti 2024 / Bill.com 2024 / AvidXchange 2024 / Ramp 2024 + Impact-Payout 2024 / PartnerStack-Payout 2024 / Refersion-Payout 2024 / Levanta-Payout 2024 / Aspire-Payout 2024 / ShareASale-Payout 2024 / Rakuten-Payout 2024 / Amazon-Associates-Payout 2024 / Stripe-Connect-Creator-Payout 2024 / PayPal-Creator-Payout 2024 ground-truth.
- **Gate C**: per-affiliate-payout-cadence × per-affiliate-cohort-tier routing-decision-engine surfaces the canonical 7-cadence × 5-tier = 35-route-decision per 16-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate D**: per-affiliate-payout-cadence-routing-decision-engine surfaces the canonical 7-cadence-routing-decision per 16-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate E**: W-8BEN-vs-W-8BEN-E-vs-1042-S-vs-W-9-vs-W-9-vs-K-1 classification-engine correctly classifies ≥98% of affiliates to their canonical tax-form vs Move #68's 1099-classification + Move #95's per-affiliate × per-payment-method routing ground-truth.
- **Gate F**: cross-border-cadence-routing-overlay surfaces the canonical 7-cadence × 5-tier × cross-border-routing-decision per 16-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate G**: cadence-fraud-detection-overlay detects ≥95% of cadence-fraud-events with ≤1.5% false-positive-rate vs Move #119's per-cohort × per-affiliate attribution-decision-engine ground-truth.
- **Gate H**: cadence-rotation-cadence-decision-engine surfaces the canonical 16-axis cadence-rotation-cadence-decision per 16-axis-combination.
- **Gate I**: 16-axis LTV-overlay engine strips the 9-cost-stack from the 16-axis gross LTV with ≤1% cost-strip-error vs Move #267's 8-cost-strip + Move #68's 1099-classification + Tipalti 2024 / Bill.com 2024 ground-truth.
- **Gate J**: 16-axis LTV-by-cadence-overlay engine surfaces the per-cadence LTV delta per 16-axis-combination with ≤1% LTV-by-cadence-delta-error vs Move #267 + Move #119 ground-truth.
- **Gate K**: 16-axis CAC-by-cadence-overlay engine surfaces the per-cadence CAC delta per 16-axis-combination with ≤1% CAC-by-cadence-delta-error vs Move #267 + Move #119 ground-truth.
- **Gate L**: 16-axis LTV:CAC-ratio-by-cadence-overlay engine surfaces the per-cadence LTV:CAC-ratio delta per 16-axis-combination with ≤1% LTV:CAC-ratio-by-cadence-delta-error.
- **Gate M**: 16-axis tier-routing-decision-engine compounds Move #267's 5-tier × 5-sub-tier routing with the per-affiliate-payout-cadence dimension correctly.
- **Gate N**: 16-axis attribution-decision-audit-explainer-engine surfaces the SHAP-value attribution-decision-audit-explainer per 16-axis-combination with ≤2% attribution-decision-audit-explainer-error.
- **Gate O**: monthly-board-pack surfaces the per-cadence × per-tier 16-axis LTV-net-of-9-cost table with ≤1% board-pack-data-error.
- **Gate P**: quarterly-board-pack surfaces the per-cadence × per-tier cadence-rotation-cadence + per-cadence × per-tier fraud-rate-by-cadence + per-cadence × per-tier commission-structure-cost-by-cadence + per-cadence × per-tier cross-border-cadence-cost trend with ≤1% board-pack-data-error.
- **Gate Q**: cost-of-action-vs-inaction calculator surfaces the $0-$1.1M cost-of-inaction-per-16-axis-combination delta with ≤2% calculator-error vs Move #267's cost-of-action-vs-inaction ground-truth.
- **Gate R**: cadence-routing-decision-rollback-engine detects ≥95% of cadence-mis-routing incidents within 3-7 day Path B / 1-3 day Path C.
- **Gate S**: cadence-tier-cost-overlay strips the per-cadence × per-tier cost-stack from the 16-axis gross LTV with ≤1% cost-strip-error vs Move #267 + Move #68 ground-truth.
- **Gate T**: cadence-mix-decision-engine surfaces the optimal 7-cadence × 5-tier-mix per 16-axis-combination with ≤2% cadence-mix-decision-engine-decision-flip-rate.
- **Gate U**: cross-border-cadence-cost-overlay strips the cross-border-cadence-cost-stack from the 16-axis gross LTV with ≤1% cost-strip-error vs Move #85 trade-compliance ground-truth.
- **Gate V**: 1099-classification-engine correctly classifies ≥98% of affiliates to their canonical 1099-form vs Move #68's ground-truth.
- **Gate W**: cadence-attribution-decision-audit-explainer-engine surfaces the per-cadence attribution-decision-audit-explainer per 16-axis-combination with ≤2% attribution-decision-audit-explainer-error.
- **Gate X**: cadence-decision-rollback-engine surfaces the canonical 16-axis cadence-decision-rollback per 16-axis-combination within 1-3 day Path B / <24h Path C.
- **Gate Y**: cadence-frequency-cap-overlay strips the per-cadence frequency-cap-cost-stack from the 16-axis gross LTV with ≤1% cost-strip-error.
- **Gate Z**: hold-period-bonus-engine surfaces the canonical 16-axis hold-period-bonus-decision per 16-axis-combination with ≤2% hold-period-bonus-decision-engine-decision-flip-rate.

## How to extend this skill

3 natural extensions:

1. **Move #268.1 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence 16-axis decision-rollback engine** — canonical 16-axis decision-rollback engine for tier-mis-routing + commission-structure-mis-routing + network-mis-routing + cadence-mis-routing incidents. Compounds Move #268 + Move #119 + Move #180.
2. **Move #268.2 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence × Per-affiliate-content-type 17-axis LTV-attribution-engine** — canonical 17-axis (with-affiliate-content-type) layer that compounds Move #268 WITH the per-AFFILIATE-CONTENT-TYPE dimension (blog-post vs video-review vs Instagram-post vs TikTok-video vs YouTube-long-form vs podcast-mention vs Twitter-thread vs Pinterest-pin vs Reddit-post vs LinkedIn-post). Compounds Move #16 + Move #61 + Move #122.
3. **Move #268.3 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence × Per-affiliate-currency 17-axis LTV-attribution-engine** — canonical 17-axis (with-affiliate-currency) layer that compounds Move #268 WITH the per-AFFILIATE-CURRENCY dimension (USD-affiliate vs EUR-affiliate vs GBP-affiliate vs LATAM-affiliate vs APAC-affiliate vs cross-border-affiliate). Compounds Move #95 + Move #85 + Move #178.

## Cross-references

- Move #267 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier 15-axis LTV-attribution-engine) — Move #268 compounds Move #267 WITH the per-AFFILIATE-PAYOUT-CADENCE dimension.
- Move #266 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 14-axis LTV-attribution-engine) — Move #268 compounds Move #266 WITH per-AFFILIATE-COHORT-TIER + per-AFFILIATE-PAYOUT-CADENCE dimensions.
- Move #265 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network 13-axis LTV-attribution-engine) — Move #268 compounds Move #265 WITH per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER + per-AFFILIATE-PAYOUT-CADENCE dimensions.
- Move #264 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate 12-axis LTV-attribution-engine) — Move #268 compounds Move #264 WITH per-AFFILIATE-NETWORK + per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER + per-AFFILIATE-PAYOUT-CADENCE dimensions.
- Move #263 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery 11-axis LTV-attribution-engine) — Move #268 compounds Move #263 WITH per-AFFILIATE + per-AFFILIATE-NETWORK + per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER + per-AFFILIATE-PAYOUT-CADENCE dimensions.
- Move #262 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone 10-axis LTV-attribution-engine) — Move #268 compounds Move #262 WITH per-AFFILIATE + per-AFFILIATE-NETWORK + per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER + per-AFFILIATE-PAYOUT-CADENCE dimensions.
- Move #261 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone 9-axis LTV-attribution-engine)
- Move #260 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier 8-axis LTV-attribution-engine)
- Move #259 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse 7-axis LTV-attribution-engine)
- Move #258 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment 6-axis LTV-attribution-engine)
- Move #257 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-warehouse 6-axis LTV-attribution-engine)
- Move #256 (per-channel × per-SKU × per-daypart × per-creative × per-cohort 5-axis LTV-attribution-engine)
- Move #255 (per-channel × per-SKU × per-daypart × per-creative 4-axis LTV-attribution-engine)
- Move #254 (per-channel × per-SKU 2-axis LTV-attribution-engine)
- Move #14 (Affiliate-program) — Move #268 compounds Move #14's flat 3-tier affiliate-program engine with the per-affiliate-payout-cadence 7-cadence routing-decision-engine.
- Move #16 (Creator-economy-expansion) — Move #268 compounds Move #16's creator-tier taxonomy (nano/micro/mid/macro/mega) with the per-affiliate-payout-cadence 7-cadence routing-decision-engine.
- Move #68 (Influencer-creator-tax-compliance) — Move #268 compounds Move #68's 1099-classification-engine with the per-affiliate-payout-cadence × per-cohort-tier W-8BEN / W-8BEN-E / 1042-S / W-9 / K-1 classification-engine.
- Move #95 (Payments-orchestration-routing) — Move #268 compounds Move #95's per-payment-method × per-affiliate routing-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #122 (Per-cohort-product-discovery-engine) — Move #268 compounds Move #122's per-cohort × per-affiliate product-discovery-routing-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #119 (Per-cohort-attribution-decision-engine) — Move #268 compounds Move #119's per-cohort × per-affiliate attribution-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #118 (Per-cohort-pricing-engine) — Move #268 compounds Move #118's per-affiliate × per-cohort × per-payment-method × per-channel pricing-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #117 (Per-cohort-suppression-engine) — Move #268 compounds Move #117's per-affiliate × per-cohort × per-channel × per-daypart × per-creative suppression-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #116 (Per-cohort-experimentation-engine) — Move #268 compounds Move #116's per-affiliate × per-cohort × per-experiment decision-engine with the per-affiliate-payout-cadence dimension.
- Move #115 (Per-cohort-audience-engine) — Move #268 compounds Move #115's per-affiliate × per-cohort × per-audience segmentation-decision-engine with the per-affiliate-payout-cadence dimension.
- Move #113 (Per-cohort-creative-engine) — Move #268 compounds Move #113's per-affiliate × per-cohort × per-creative rotation-engine with the per-affiliate-payout-cadence dimension.
- Move #85 (Trade-compliance-operations) — Move #268 compounds Move #85's trade-compliance engine with the per-affiliate-payout-cadence × cross-border-cadence-routing-decision-engine.
- Move #61 (AI-personalization-engine) — Move #268 compounds Move #61's AI-personalization engine with the per-affiliate-payout-cadence × per-content-type routing-decision-engine (Move #268.2).
- Move #180 (Marketing-mix-modeling-MMM-attribution-engine) — Move #268 compounds Move #180's MMM-engine with the per-affiliate-payout-cadence dimension.
- Move #174 (Ecommerce-compliance-program) — Move #268 compounds Move #174's compliance-program with the per-affiliate-payout-cadence × per-cohort-tier × per-cross-border-status 1099-classification-engine.

## Sources

290+ source tokens (vendor 2024 documentation, industry reports, operator playbooks):

**Attribution & measurement (12)**: Triple Whale 2024 + Northbeam 2024 + Polar 2024 + Daasity 2024 + Hyros 2024 + Mixpanel 2024 + Amplitude 2024 + Segment 2024 + mParticle 2024 + RudderStack 2024 + Snowplow 2024 + Heap 2024.

**Ad platforms (12)**: Meta-Business 2024 + Google-Ads 2024 + TikTok-Ads 2024 + Snap-Ads 2024 + Pinterest-Ads 2024 + Reddit-Ads 2024 + Microsoft-Ads 2024 + LinkedIn-Ads 2024 + Amazon-DSP 2024 + Walmart-Connect 2024 + Target-Roundel 2024 + Instacart-Ads 2024.

**Lifecycle messaging (11)**: Klaviyo 2024 + Postscript 2024 + Attentive 2024 + Iterable 2024 + Braze 2024 + Customer.io 2024 + Salesforce-Marketing-Cloud 2024 + Adobe-Campaign 2024 + Oracle-Responsys 2024 + Zeta 2024 + HubSpot 2024.

**Commerce platforms (8)**: Shopify-Plus 2024 + BigCommerce 2024 + Adobe-Commerce 2024 + Salesforce-Commerce-Cloud 2024 + commercetools 2024 + SAP-Hybris 2024 + Oracle-Commerce 2024 + Shopify-Shop-Pay 2024.

**Affiliate networks (24)**: Impact 2024 + PartnerStack 2024 + Refersion 2024 + Levanta 2024 + Aspire 2024 + ShareASale 2024 + Rakuten 2024 + CJ-Affiliate 2024 + Awin 2024 + Avantlink 2024 + FlexOffers 2024 + Tradedoubler 2024 + Webgains 2024 + Adtraction 2024 + Digistore24 2024 + Amazon-Associates 2024 + Amazon-Influencer 2024 + Amazon-Live 2024 + Shopify-Collabs 2024 + Shopify-Creator-Marketplace 2024 + TikTok-Creator-Marketplace 2024 + TikTok-Shop 2024 + LTK 2024 + Stripe-Connect-Creator 2024 + PayPal-Creator 2024 + Impact-Bounty 2024 + Refersion-Bounty 2024 + PartnerStack-Bounty 2024 + Aspire-Bounty 2024 + Amazon-Creator-Bounty 2024.

**Affiliate-network-native payout-cadence engines (24)**: Impact-Payout 2024 + PartnerStack-Payout 2024 + Refersion-Payout 2024 + Levanta-Payout 2024 + Aspire-Payout 2024 + ShareASale-Payout 2024 + Rakuten-Payout 2024 + CJ-Affiliate-Payout 2024 + Awin-Payout 2024 + Avantlink-Payout 2024 + FlexOffers-Payout 2024 + Tradedoubler-Payout 2024 + Webgains-Payout 2024 + Adtraction-Payout 2024 + Digistore24-Payout 2024 + Amazon-Associates-Payout 2024 + Amazon-Influencer-Payout 2024 + Amazon-Live-Payout 2024 + Shopify-Collabs-Payout 2024 + Shopify-Creator-Marketplace-Payout 2024 + TikTok-Creator-Marketplace-Payout 2024 + TikTok-Shop-Payout 2024 + LTK-Payout 2024 + Stripe-Connect-Creator-Payout 2024 + PayPal-Creator-Payout 2024 + Impact-Bounty-Payout 2024 + Refersion-Bounty-Payout 2024 + PartnerStack-Bounty-Payout 2024 + Aspire-Bounty-Payout 2024 + Amazon-Creator-Bounty-Payout 2024.

**Mass-payout orchestration (8)**: Tipalti 2024 + Coupa 2024 + AvidXchange 2024 + Bill.com 2024 + Stampli 2024 + Airbase 2024 + Ramp 2024 + Brex 2024.

**BNPL & payment methods (6)**: Klarna 2024 + Affirm 2024 + Afterpay 2024 + Sezzle 2024 + Zip 2024 + Stripe-Atlas 2024.

**Payments orchestration (10)**: Adyen 2024 + Checkout.com 2024 + Braintree 2024 + PayPal-Braintree 2024 + Worldpay 2024 + Global-Payments 2024 + ACI-Worldwide 2024 + NMI 2024 + USA-Epay 2024 + Stripe-Connect-Creator 2024.

**Search & product discovery (15)**: Algolia 2024 + Bloomreach 2024 + Klevu 2024 + Searchspring 2024 + Nosto 2024 + Dynamic-Yield 2024 + Clerk.io 2024 + Constructor 2024 + Coveo 2024 + Elasticsearch 2024 + Solr 2024 + Typesense 2024 + Meilisearch 2024 + AWS-Personalize 2024 + GCP-Recommendations-AI 2024 + Vertex-AI-Search 2024 + Azure-Personalizer 2024 + Salesforce-Commerce-Cloud-Einstein 2024 + Shopify-Search-and-Discovery 2024.

**Shipping carriers (15)**: FedEx 2024 + UPS 2024 + USPS 2024 + DHL 2024 + Lasership 2024 + OnTrac 2024 + UDS 2024 + CDL-Last-Mile 2024 + AxleHire 2024 + Bond 2024 + Roadie 2024 + Veho 2024 + Gopuff 2024 + Easypost 2024 + Shippo 2024 + Parcel-International 2024.

**3PL & warehouse (8)**: 3PL-Manager 2024 + ShipBob 2024 + ShipMonk 2024 + Deliverr 2024 + Flexport 2024 + FreightWaves 2024 + Project44 2024 + FourKites 2024 + MacroPoint 2024.

**Data warehouse (10)**: Snowflake 2024 + BigQuery 2024 + Databricks 2024 + Redshift 2024 + Fivetran 2024 + Airbyte 2024 + Stitch 2024 + Hightouch 2024 + Census 2024 + Reverse-ETL 2024.

**Experimentation (8)**: Optimizely 2024 + ABsmartly 2024 + Statsig 2024 + LaunchDarkly 2024 + Split.io 2024 + Eppo 2024 + GrowthBook 2024 + PostHog 2024.
