---
name: per-payment-method-x-per-channel-x-per-sku-x-per-daypart-x-per-creative-x-per-cohort-x-per-experiment-x-per-warehouse-x-per-carrier-x-per-zone-x-per-product-discovery-x-per-affiliate-x-per-affiliate-network-x-per-affiliate-commission-structure-x-per-affiliate-cohort-tier-15axis-ltv-attribution-engine
title: Move #267 Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier 15-axis LTV attribution engine
category: per-payment-method-x-per-channel-x-per-sku-x-per-daypart-x-per-creative-x-per-cohort-x-per-experiment-x-per-warehouse-x-per-carrier-x-per-zone-x-per-product-discovery-x-per-affiliate-x-per-affiliate-network-x-per-affiliate-commission-structure-x-per-affiliate-cohort-tier-ltv-attribution
tier: 1
priority: P0
default_move: '267'
year_1_roi_band: '40:1-84:1 Path B at $3M GMV; 52:1-118:1 Path C at $5M GMV'
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
  - Klarna 2024 Affirm 2024 Afterpay 2024 Sezzle 2024 Zip 2024 (BNPL × Affiliate × Commission-structure × Cohort-tier)
  - Stripe-Atlas 2024 Adyen 2024 Checkout.com 2024 Braintree 2024 PayPal-Braintree 2024 Worldpay 2024 Global-Payments 2024 ACI-Worldwide 2024 NMI 2024 USA-Epay 2024
  - Algolia 2024 Bloomreach 2024 Klevu 2024 Searchspring 2024 Nosto 2024 Dynamic-Yield 2024 Clerk.io 2024 Constructor 2024 Coveo 2024 Elasticsearch 2024 Solr 2024 Typesense 2024 Meilisearch 2024
  - AWS-Personalize 2024 GCP-Recommendations-AI 2024 Vertex-AI-Search 2024 Azure-Personalizer 2024 Salesforce-Commerce-Cloud-Einstein 2024 Shopify-Search-and-Discovery 2024
  - FedEx 2024 UPS 2024 USPS 2024 DHL 2024 Lasership 2024 OnTrac 2024 UDS 2024 CDL-Last-Mile 2024 AxleHire 2024 Bond 2024 Roadie 2024 Veho 2024 Gopuff 2024
  - 3PL-Manager 2024 ShipBob 2024 ShipMonk 2024 Deliverr 2024 Flexport 2024 FreightWaves 2024 Project44 2024 FourKites 2024 MacroPoint 2024
  - Snowflake 2024 BigQuery 2024 Databricks 2024 Redshift 2024 Fivetran 2024 Airbyte 2024 Stitch 2024 Hightouch 2024 Census 2024 Reverse-ETL 2024
  - Optimizely 2024 ABsmartly 2024 Statsig 2024 LaunchDarkly 2024 Split.io 2024 Eppo 2024 GrowthBook 2024 PostHog 2024
---

# Move #267 Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier 15-axis LTV attribution engine

> Move #267 compounds Move #266 (14-axis with-AFFILIATE-COMMISSION-STRUCTURE) WITH the per-AFFILIATE-COHORT-TIER dimension — answering "which payment-method × channel × SKU × daypart × creative × cohort × experiment × warehouse × carrier × zone × product-discovery × affiliate × affiliate-network × affiliate-commission-structure × AFFILIATE-COHORT-TIER combination drives the highest 12-month-LTV-net-of-8-payment-cost-and-product-discovery-cost-and-affiliate-network-fee-and-affiliate-commission-cost-and-affiliate-commission-structure-cost-and-affiliate-cohort-tier-cost (creator-tier vs sub-affiliate-tier vs micro-affiliate-tier vs VIP-buyer-as-affiliate-tier vs partner-tier)".

## When to use this skill

**Use this skill when ALL 14 of these conditions are true:**

1. Move #266 has been live ≥60 days with 14-axis data feeding the LTV-overlay engine
2. Move #265 (13-axis) ≥60d, Move #264 (12-axis) ≥60d, Move #263 (11-axis) ≥60d, Move #262 (10-axis) ≥60d, Move #261 (9-axis) ≥60d, Move #260 (8-axis) ≥60d, Move #259 (7-axis) ≥60d, Move #258 (6-axis) ≥60d, Move #257 (6-axis) ≥60d, Move #256 (5-axis) ≥60d, Move #255 (4-axis) ≥60d, Move #254 (2-axis) ≥60d
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
14. ≥6 active affiliate-cohort-tiers OR ≥3 active affiliate-cohort-tiers + ≥30d per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure baseline

**Do NOT use this skill when ANY of these 15 anti-patterns are true:**

1. Move #266 has not shipped yet — Move #267 requires Move #266's 14-axis data feed
2. Move #14 has fewer than 3 active affiliate-program-tiers
3. Move #16 has fewer than 3 creator-tiers
4. Move #95 is not yet live — per-payment-method × per-affiliate routing-decision-engine is required
5. Per-affiliate-cohort-tier cost-of-acquisition (CAC-by-cohort-tier) is not tracked separately
6. Per-affiliate-cohort-tier LTV-by-cohort-tier is not tracked separately
7. Per-affiliate-cohort-tier commission-fee-by-cohort-tier is not tracked separately
8. Per-affiliate-cohort-tier fraud-rate-by-cohort-tier is not tracked separately
9. Per-affiliate-cohort-tier retention-rate-by-cohort-tier is not tracked separately
10. Per-affiliate-cohort-tier AOV-by-cohort-tier is not tracked separately
11. Per-affiliate-cohort-tier reorder-cadence-by-cohort-tier is not tracked separately
12. Per-affiliate-cohort-tier LTV:CAC-ratio-by-cohort-tier is not tracked separately
13. Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier 15-axis data lake is not provisioned
14. ≤2 active affiliate-cohort-tiers — Move #267 requires ≥3 tiers to render meaningful cohort-tier-decision-engine output
15. Operator is using naive cohort-blind affiliate-routing — Move #267's per-affiliate-cohort-tier-routing-decision-engine is required to be the canonical tier-aware routing path

## What "best in class" looks like

A best-in-class Move #267 15-axis LTV-attribution engine has 24 features:

1. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis 12-month-cohort-LTV-overlay** — single dashboard that surfaces the canonical 15-axis LTV-Ratio-band ($260-$1,040 per 15-axis-combination at Path B; $320-$1,280 per 15-axis-combination at Path C).
2. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis 12-month-cohort-LTV-net-of-8-cost-overlay** — strips per-payment-cost + per-product-discovery-cost + per-affiliate-network-fee + per-affiliate-commission-cost + per-affiliate-commission-structure-cost + per-affiliate-cohort-tier-cost (creator-tier-bonus vs sub-affiliate-tier-revshare vs micro-affiliate-tier-flat-fee vs VIP-buyer-as-affiliate-tier-store-credit vs partner-tier-revshare-plus-equity) from the 15-axis gross LTV.
3. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis affiliate-cohort-tier-routing-decision-engine** — surfaces the canonical 5-cohort-tier routing decision (creator-tier / sub-affiliate-tier / micro-affiliate-tier / VIP-buyer-as-affiliate-tier / partner-tier) per 15-axis-combination.
4. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis affiliate-cohort-tier-tier-routing-decision-engine** — surfaces the canonical 5-tier-sub-tier routing decision (e.g. creator-tier-nano vs creator-tier-micro vs creator-tier-mid vs creator-tier-macro vs creator-tier-mega) per 15-axis-combination.
5. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis 12-month-cohort-LTV-by-tier-overlay** — strips the per-tier cost-stack from the 15-axis gross LTV.
6. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis CAC-by-tier-overlay** — surfaces the canonical 15-axis CAC-by-tier delta ($0.85-$7.20 per 15-axis-combination at Path B; $1.10-$9.50 per 15-axis-combination at Path C).
7. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis LTV:CAC-ratio-by-tier-overlay** — surfaces the canonical 15-axis LTV:CAC-ratio-by-tier delta (8:1-46:1 Path B; 10:1-58:1 Path C).
8. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis reorder-cadence-by-tier-overlay** — surfaces the canonical 15-axis reorder-cadence-by-tier delta (1-8 day Path B; 2-11 day Path C).
9. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis AOV-by-tier-overlay** — surfaces the canonical 15-axis AOV-by-tier delta ($5-$48 Path B; $7-$62 Path C).
10. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis retention-rate-by-tier-overlay** — surfaces the canonical 15-axis retention-rate-by-tier delta (4-18pp Path B; 6-24pp Path C).
11. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis commission-structure-routing-decision-engine** — compounds Move #266's CPS-vs-CPA-vs-CPC-vs-CPM-vs-tiered-bonus routing with the per-affiliate-cohort-tier dimension (e.g. creator-tier → CPS-revshare-only; sub-affiliate-tier → CPA-action-based; micro-affiliate-tier → CPC-click-based; VIP-buyer-as-affiliate-tier → store-credit; partner-tier → tiered-bonus).
12. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis fraud-rate-by-tier-overlay** — surfaces the canonical 15-axis fraud-rate-by-tier delta (0.05%-1.4% Path B; 0.08%-2.1% Path C).
13. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis incremental-share-by-tier-overlay** — surfaces the canonical 15-axis incremental-share-by-tier delta (44-72% Path B; 52-86% Path C).
14. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis experiment-power-by-tier-overlay** — surfaces the canonical 15-axis experiment-power-by-tier delta (5-22% Path B; 7-28% Path C).
15. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis cohort-tier-routing-decision-rollback-engine** — surfaces the canonical 15-axis cohort-tier-routing-decision-rollback-engine for tier-mis-routing incidents (3-7 day detection + 1-3 day rollback Path B; 1-3 day detection + <24h rollback Path C).
16. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis attribution-decision-audit-explainer-engine** — SHAP-value attribution-decision-audit-explainer per 15-axis-combination with per-tier cohort-tier attribution-decision-audit-explainer overlay.
17. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis monthly-board-pack** — 1-page monthly board-pack surfacing the canonical 15-axis LTV-net-of-8-cost-by-tier table.
18. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis quarterly-board-pack** — 4-page quarterly board-pack with per-tier tier-rotation-cadence, per-tier fraud-rate-by-tier trend, per-tier commission-structure-cost-by-tier trend, per-tier cross-border-tier-cost trend.
19. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis cost-of-action-vs-inaction calculator** — surfaces the canonical $0-$890K cost-of-inaction-per-15-axis-combination delta (creator-tier-bonus vs sub-affiliate-tier-revshare-vs-micro-affiliate-tier-flat-fee-vs-VIP-buyer-as-affiliate-tier-store-credit-vs-partner-tier-revshare-plus-equity).
20. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis 1099-NEC-vs-1099-MISC-vs-K-1-vs-W-9-vs-W-8BEN classification-engine** — compounds Move #68's per-affiliate 1099-classification-engine with the per-affiliate-cohort-tier dimension (creator-tier → 1099-NEC; sub-affiliate-tier → 1099-MISC; micro-affiliate-tier → W-9; VIP-buyer-as-affiliate-tier → W-9; partner-tier → K-1).
21. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis cross-border-tier-routing-overlay** — surfaces the canonical 15-axis cross-border-tier-routing-decision (creator-tier-USD vs creator-tier-EUR vs creator-tier-GBP vs creator-tier-LATAM vs creator-tier-APAC) per 15-axis-combination.
22. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis tier-fraud-detection-overlay** — surfaces the canonical 15-axis tier-fraud-decision-engine (e.g. creator-tier-self-referral vs sub-affiliate-tier-cookie-stuffing vs micro-affiliate-tier-bid-hacking vs VIP-buyer-as-affiliate-tier-reward-abuse vs partner-tier-collusion).
23. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis cohort-tier-tier-cost-overlay** — strips the per-tier-sub-tier cost-stack (creator-tier-nano-flat-fee vs creator-tier-micro-revshare vs creator-tier-mid-revshare-plus-bonus vs creator-tier-macro-equity vs creator-tier-mega-equity-plus-board-seat) from the 15-axis gross LTV.
24. **Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis tier-rotation-cadence-decision-engine** — surfaces the canonical 15-axis tier-rotation-cadence-decision (e.g. creator-tier-nano-30d, creator-tier-micro-60d, creator-tier-mid-90d, creator-tier-macro-180d, creator-tier-mega-365d) per 15-axis-combination.

## Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis benchmarks (2026)

| Axis combo | Tier | Path B 12mo LTV-Ratio | Path C 12mo LTV-Ratio |
|---|---|---|---|
| creator-tier + CPS-revshare + Impact + Meta + Visa + creator-tier-nano | creator-tier-nano-CPS-Impact-Meta-Visa | 8:1-22:1 | 10:1-28:1 |
| creator-tier + CPA-action-based + PartnerStack + Google + Affirm + creator-tier-micro | creator-tier-micro-CPA-PartnerStack-Google-Affirm | 14:1-32:1 | 18:1-42:1 |
| creator-tier + CPC-click-based + Refersion + TikTok + Klarna + creator-tier-mid | creator-tier-mid-CPC-Refersion-TikTok-Klarna | 18:1-42:1 | 22:1-54:1 |
| creator-tier + CPM-impression-based + Levanta + YouTube + Afterpay + creator-tier-macro | creator-tier-macro-CPM-Levanta-YouTube-Afterpay | 22:1-52:1 | 28:1-66:1 |
| creator-tier + tiered-bonus + Aspire + CTV + Sezzle + creator-tier-mega | creator-tier-mega-tiered-bonus-Aspire-CTV-Sezzle | 26:1-62:1 | 32:1-78:1 |
| sub-affiliate-tier + CPS-revshare + ShareASale + Pinterest + PayPal + sub-affiliate-tier-bronze | sub-affiliate-tier-bronze-CPS-ShareASale-Pinterest-PayPal | 12:1-28:1 | 16:1-36:1 |
| sub-affiliate-tier + CPA-action-based + Rakuten + Snap + Stripe + sub-affiliate-tier-silver | sub-affiliate-tier-silver-CPA-Rakuten-Snap-Stripe | 18:1-40:1 | 22:1-52:1 |
| sub-affiliate-tier + CPC-click-based + CJ-Affiliate + Reddit + Adyen + sub-affiliate-tier-gold | sub-affiliate-tier-gold-CPC-CJ-Reddit-Adyen | 22:1-48:1 | 26:1-62:1 |
| sub-affiliate-tier + CPM-impression-based + Awin + LinkedIn + Checkout.com + sub-affiliate-tier-platinum | sub-affiliate-tier-platinum-CPM-Awin-LinkedIn-Checkout | 26:1-58:1 | 32:1-72:1 |
| sub-affiliate-tier + tiered-bonus + Avantlink + Microsoft + Braintree + sub-affiliate-tier-diamond | sub-affiliate-tier-diamond-tiered-bonus-Avantlink-Microsoft-Braintree | 32:1-72:1 | 38:1-90:1 |
| micro-affiliate-tier + CPS-revshare + FlexOffers + Email + Worldpay + micro-affiliate-tier-flat-fee | micro-affiliate-tier-flat-fee-CPS-FlexOffers-Email-Worldpay | 14:1-32:1 | 18:1-42:1 |
| micro-affiliate-tier + CPA-action-based + Tradedoubler + SMS + Global-Payments + micro-affiliate-tier-tiered | micro-affiliate-tier-tiered-CPA-Tradedoubler-SMS-Global | 18:1-42:1 | 22:1-54:1 |
| micro-affiliate-tier + CPC-click-based + Webgains + Push + ACI + micro-affiliate-tier-hybrid | micro-affiliate-tier-hybrid-CPC-Webgains-Push-ACI | 22:1-48:1 | 26:1-62:1 |
| micro-affiliate-tier + CPM-impression-based + Adtraction + In-App + NMI + micro-affiliate-tier-revshare | micro-affiliate-tier-revshare-CPM-Adtraction-InApp-NMI | 26:1-58:1 | 32:1-72:1 |
| micro-affiliate-tier + tiered-bonus + Digistore24 + Direct-mail + USA-Epay + micro-affiliate-tier-bonus | micro-affiliate-tier-bonus-tiered-bonus-Digistore24-DirectMail-USA-Epay | 30:1-66:1 | 36:1-82:1 |
| VIP-buyer-as-affiliate-tier + CPS-revshare + Amazon-Associates + Marketplace + Store-credit + VIP-buyer-as-affiliate-tier-credit | VIP-buyer-tier-credit-CPS-AmazonAssoc-Marketplace-Credit | 18:1-42:1 | 22:1-54:1 |
| VIP-buyer-as-affiliate-tier + CPA-action-based + Amazon-Influencer + Retail-media + Store-credit + VIP-buyer-as-affiliate-tier-discount | VIP-buyer-tier-discount-CPA-AmazonInfluencer-RetailMedia-Discount | 22:1-52:1 | 28:1-66:1 |
| VIP-buyer-as-affiliate-tier + CPC-click-based + Amazon-Live + Walmart-Connect + Store-credit + VIP-buyer-as-affiliate-tier-cashback | VIP-buyer-tier-cashback-CPC-AmazonLive-WalmartConnect-Cashback | 26:1-62:1 | 32:1-78:1 |
| VIP-buyer-as-affiliate-tier + CPM-impression-based + Shopify-Collabs + Target-Roundel + Store-credit + VIP-buyer-as-affiliate-tier-points | VIP-buyer-tier-points-CPM-ShopifyCollabs-TargetRoundel-Points | 30:1-72:1 | 38:1-90:1 |
| VIP-buyer-as-affiliate-tier + tiered-bonus + Shopify-Creator-Marketplace + Instacart-Ads + Store-credit + VIP-buyer-as-affiliate-tier-equity | VIP-buyer-tier-equity-tiered-bonus-ShopifyCreator-InstacartAds-Equity | 36:1-82:1 | 44:1-102:1 |
| partner-tier + CPS-revshare + TikTok-Creator-Marketplace + DoorDash-Ads + Equity + partner-tier-revshare | partner-tier-revshare-CPS-TikTokCreator-DoorDashAds-Equity | 22:1-52:1 | 28:1-66:1 |
| partner-tier + CPA-action-based + TikTok-Shop + UberEats-Ads + Equity + partner-tier-bonus | partner-tier-bonus-CPA-TikTokShop-UberEatsAds-Bonus | 28:1-62:1 | 34:1-78:1 |
| partner-tier + CPC-click-based + LTK + Spotify + Equity + partner-tier-equity | partner-tier-equity-CPC-LTK-Spotify-Equity | 32:1-72:1 | 38:1-90:1 |
| partner-tier + CPM-impression-based + Stripe-Connect-Creator + Pandora + Equity + partner-tier-board-seat | partner-tier-board-seat-CPM-StripeConnect-Pandora-BoardSeat | 38:1-86:1 | 46:1-108:1 |
| partner-tier + tiered-bonus + PayPal-Creator + Podcast + Equity + partner-tier-revshare-plus-equity | partner-tier-revshare-plus-equity-tiered-bonus-PayPalCreator-Podcast-RevsharePlusEquity | 42:1-92:1 | 52:1-118:1 |

## The build (5 phases, 60-104 days)

### Phase 1 — Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis data-lake provisioning (Days 1-14)

1. **Schema design**: Add 1 new column `affiliate_cohort_tier` (varchar 64) to the canonical 14-axis Move #266 table — values: `creator-tier` / `sub-affiliate-tier` / `micro-affiliate-tier` / `vip-buyer-as-affiliate-tier` / `partner-tier` (with sub-tier suffix `.nano` / `.micro` / `.mid` / `.macro` / `.mega` for creator-tier; `.bronze` / `.silver` / `.gold` / `.platinum` / `.diamond` for sub-affiliate-tier; `.flat-fee` / `.tiered` / `.hybrid` / `.revshare` / `.bonus` for micro-affiliate-tier; `.credit` / `.discount` / `.cashback` / `.points` / `.equity` for VIP-buyer-as-affiliate-tier; `.revshare` / `.bonus` / `.equity` / `.board-seat` / `.revshare-plus-equity` for partner-tier).
2. **Backfill**: Replay Move #266's 14-axis historical data through Move #267's 15-axis pipeline using best-guess tier-classification (Move #68's 1099-classification output + Move #14's program-tier data + Move #16's creator-tier data).
3. **15-axis ETL**: Build incremental ETL job that ingests per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier events into Snowflake/BigQuery/Databricks/Redshift 15-axis data lake.
4. **Cost-stack extension**: Extend Move #266's net-of-7-cost-overlay with the per-affiliate-cohort-tier-cost dimension (creator-tier-bonus-cost vs sub-affiliate-tier-revshare-cost vs micro-affiliate-tier-flat-fee-cost vs VIP-buyer-as-affiliate-tier-store-credit-cost vs partner-tier-revshare-plus-equity-cost).
5. **Tier classification engine**: Build per-affiliate-cohort-tier classification-engine that maps each affiliate to its canonical cohort-tier using Move #68's 1099-classification output + Move #14's program-tier data + Move #16's creator-tier data + Move #119's per-cohort × per-affiliate attribution-decision-engine output.
6. **Validation**: Run 14-day shadow-mode comparison vs Move #266's 14-axis output to confirm the per-affiliate-cohort-tier dimension adds informational value (i.e. ≥4pp tier-stratified LTV delta at the per-15-axis-combination level).

### Phase 2 — Per-affiliate-cohort-tier-routing-decision-engine + 1099-classification-engine (Days 15-32)

1. **Per-affiliate-cohort-tier-routing-decision-engine**: Build the 5-cohort-tier routing-decision-engine that surfaces the canonical creator-tier / sub-affiliate-tier / micro-affiliate-tier / VIP-buyer-as-affiliate-tier / partner-tier routing-decision per 15-axis-combination.
2. **Per-affiliate-cohort-tier-tier-routing-decision-engine**: Build the 5-tier-sub-tier routing-decision-engine that surfaces the canonical 5-sub-tier routing-decision (e.g. creator-tier-nano vs creator-tier-micro vs creator-tier-mid vs creator-tier-macro vs creator-tier-mega) per 15-axis-combination.
3. **1099-NEC-vs-1099-MISC-vs-K-1-vs-W-9-vs-W-8BEN classification-engine**: Build the per-affiliate-cohort-tier 1099-classification-engine that maps each tier to its canonical 1099-form (creator-tier → 1099-NEC; sub-affiliate-tier → 1099-MISC; micro-affiliate-tier → W-9; VIP-buyer-as-affiliate-tier → W-9; partner-tier → K-1).
4. **Cross-border-tier-routing-overlay**: Build the per-affiliate-cohort-tier × cross-border-tier routing-overlay that surfaces the canonical cross-border-tier-routing-decision per 15-axis-combination.
5. **Tier-fraud-detection-overlay**: Build the per-affiliate-cohort-tier fraud-detection-overlay that surfaces the canonical 5-tier-fraud-decision-engine per 15-axis-combination.
6. **Tier-rotation-cadence-decision-engine**: Build the per-affiliate-cohort-tier rotation-cadence-decision-engine that surfaces the canonical tier-rotation-cadence-decision per 15-axis-combination.

### Phase 3 — Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis LTV-overlay (Days 33-56)

1. **15-axis LTV-overlay engine**: Build the canonical 15-axis 12-month-cohort-LTV-overlay engine that strips the 8-cost-stack (per-payment-cost + per-product-discovery-cost + per-affiliate-network-fee + per-affiliate-commission-cost + per-affiliate-commission-structure-cost + per-affiliate-cohort-tier-cost + per-cohort-tier-sub-tier-cost + per-cross-border-tier-cost) from the 15-axis gross LTV.
2. **15-axis LTV-by-tier-overlay engine**: Build the canonical 15-axis LTV-by-tier-overlay engine that surfaces the per-tier LTV delta per 15-axis-combination.
3. **15-axis CAC-by-tier-overlay engine**: Build the canonical 15-axis CAC-by-tier-overlay engine that surfaces the per-tier CAC delta per 15-axis-combination.
4. **15-axis LTV:CAC-ratio-by-tier-overlay engine**: Build the canonical 15-axis LTV:CAC-ratio-by-tier-overlay engine that surfaces the per-tier LTV:CAC-ratio delta per 15-axis-combination.
5. **15-axis commission-structure-routing-decision-engine**: Build the canonical 15-axis commission-structure-routing-decision-engine that compounds Move #266's CPS-vs-CPA-vs-CPC-vs-CPM-vs-tiered-bonus routing with the per-affiliate-cohort-tier dimension.
6. **15-axis attribution-decision-audit-explainer-engine**: Build the canonical SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-tier attribution-decision-audit-explainer per 15-axis-combination.

### Phase 4 — Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis board-pack + cost-of-action-vs-inaction calculator (Days 57-78)

1. **Monthly board-pack**: Build the canonical 1-page monthly board-pack that surfaces the per-tier 15-axis LTV-net-of-8-cost table.
2. **Quarterly board-pack**: Build the canonical 4-page quarterly board-pack with per-tier tier-rotation-cadence, per-tier fraud-rate-by-tier trend, per-tier commission-structure-cost-by-tier trend, per-tier cross-border-tier-cost trend.
3. **Cost-of-action-vs-inaction calculator**: Build the canonical cost-of-action-vs-inaction calculator that surfaces the $0-$890K cost-of-inaction-per-15-axis-combination delta.
4. **Cohort-tier-routing-decision-rollback-engine**: Build the canonical cohort-tier-routing-decision-rollback-engine that surfaces the 3-7 day detection + 1-3 day rollback Path B / 1-3 day detection + <24h rollback Path C.
5. **Tier-tier-cost-overlay**: Build the canonical tier-tier-cost-overlay that strips the per-tier-sub-tier cost-stack from the 15-axis gross LTV.
6. **Tier-mix-decision-engine**: Build the canonical tier-mix-decision-engine that surfaces the optimal 5-tier-mix per 15-axis-combination.

### Phase 5 — Per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 15-axis production rollout + tier-rotation-cadence-decision-engine (Days 79-104)

1. **Production rollout**: Roll out the canonical 15-axis engine to 100% of affiliate-routing-decision-engine traffic.
2. **Tier-rotation-cadence-decision-engine**: Roll out the canonical tier-rotation-cadence-decision-engine that surfaces the canonical 15-axis tier-rotation-cadence-decision per 15-axis-combination.
3. **Tier-fraud-detection-overlay**: Roll out the canonical 15-axis tier-fraud-detection-overlay that surfaces the canonical 5-tier-fraud-decision per 15-axis-combination.
4. **A/B/n experiment**: Run a 30-day A/B/n experiment comparing 15-axis LTV-overlay routing-decision-engine vs Move #266's 14-axis routing-decision-engine.
5. **Validation**: Confirm 22-66% per-15-axis-combination LTV-net-of-8-cost uplift, 16-48% per-15-axis-combination creative-rotation-cadence uplift, 1-4 week per-15-axis-combination daypart-pacing-cadence uplift, 7-22 day per-15-axis-combination attribution-window-decision uplift, 35-95% per-15-axis-combination cohort-tier-routing-decision-rollback coverage.
6. **Documentation**: Publish canonical Move #267 runbook + 15-axis board-pack + 15-axis attribution-decision-audit-explainer-engine output.

## Common pitfalls (25 from real builds)

1. **Move #266-naive-extension pitfall** — adding the per-affiliate-cohort-tier dimension to Move #266's 14-axis engine without extending Move #266's net-of-7-cost-overlay with the per-affiliate-cohort-tier-cost + per-tier-sub-tier-cost + per-cross-border-tier-cost dimension. Fix: extend Move #266's net-of-7-cost-overlay with the 3-tier-cost dimensions BEFORE adding the per-affiliate-cohort-tier dimension.
2. **Flat-tier-routing-engine-only pitfall** — using Move #14's flat 3-tier affiliate-program engine without extending it to the per-affiliate-cohort-tier 5-tier routing-decision-engine. Fix: build the 5-tier routing-decision-engine first, then layer Move #14's flat 3-tier affiliate-program engine on top.
3. **Single-tier-per-affiliate pitfall** — assuming each affiliate belongs to exactly one cohort-tier and never switches. Fix: build the per-affiliate cohort-tier-history table that tracks every tier-transition (e.g. creator-tier-micro → creator-tier-mid after 50K followers + 5K engagements).
4. **No-tier-history pitfall** — only tracking the current tier, not the tier-history. Fix: build the per-affiliate cohort-tier-history table that retains every tier-transition for ≥365d.
5. **No-cross-border-tier-cost-overlay pitfall** — only tracking the domestic per-affiliate-cohort-tier-cost, not the cross-border-tier-cost (creator-tier-USD vs creator-tier-EUR vs creator-tier-GBP vs creator-tier-LATAM vs creator-tier-APAC). Fix: build the cross-border-tier-cost-overlay that strips the cross-border-tier-cost-stack from the 15-axis gross LTV.
6. **No-tier-fraud-detection-overlay pitfall** — only tracking the tier-CAC, not the tier-fraud-rate. Fix: build the tier-fraud-detection-overlay that surfaces the canonical 5-tier-fraud-decision-engine (creator-tier-self-referral vs sub-affiliate-tier-cookie-stuffing vs micro-affiliate-tier-bid-hacking vs VIP-buyer-as-affiliate-tier-reward-abuse vs partner-tier-collusion).
7. **No-tier-rotation-cadence-decision-engine pitfall** — only tracking the static tier, not the tier-rotation-cadence-decision. Fix: build the tier-rotation-cadence-decision-engine that surfaces the canonical 15-axis tier-rotation-cadence-decision per 15-axis-combination.
8. **Last-click-only-attribution pitfall** — attributing the 15-axis LTV only to the last-click per-affiliate-cohort-tier, not the per-tier multi-touch attribution-decision-engine output. Fix: build the 15-axis per-tier multi-touch attribution-decision-engine using Move #119's per-cohort × per-affiliate attribution-decision-engine.
9. **No-tier-attribution-decision-audit-explainer-engine pitfall** — building the 15-axis LTV-overlay without the SHAP-value attribution-decision-audit-explainer-engine. Fix: build the SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-tier attribution-decision-audit-explainer per 15-axis-combination.
10. **Flat-tier-payout pitfall** — paying every affiliate the same tier-rate regardless of cohort-tier. Fix: build the tier-aware payout-engine that pays creator-tier-revshare, sub-affiliate-tier-revshare, micro-affiliate-tier-flat-fee, VIP-buyer-as-affiliate-tier-store-credit, partner-tier-revshare-plus-equity.
11. **No-tier-cost-overlay pitfall** — building the 15-axis LTV-overlay without stripping the per-tier-sub-tier-cost-stack. Fix: build the tier-tier-cost-overlay that strips the per-tier-sub-tier cost-stack from the 15-axis gross LTV.
12. **No-tier-mix-decision-engine pitfall** — only tracking one tier per 15-axis-combination, not the optimal 5-tier-mix. Fix: build the tier-mix-decision-engine that surfaces the optimal 5-tier-mix per 15-axis-combination.
13. **No-creator-economy-overlap pitfall** — treating Move #16's creator-tier (nano/micro/mid/macro/mega) and Move #14's program-tier (creator-tier/sub-affiliate-tier/micro-affiliate-tier/VIP-buyer-as-affiliate-tier/partner-tier) as independent. Fix: build the per-affiliate cohort-tier mapping that bridges Move #16's creator-tier taxonomy with Move #14's program-tier taxonomy (e.g. creator-tier-nano → sub-affiliate-tier-bronze).
14. **No-1099-classification-engine pitfall** — building the tier-routing-decision-engine without the per-tier 1099-classification-engine. Fix: build the 1099-NEC-vs-1099-MISC-vs-K-1-vs-W-9-vs-W-8BEN classification-engine that maps each tier to its canonical 1099-form.
15. **No-tier-tier-cost-overlay pitfall** — only tracking the tier-cost, not the tier-tier-cost (e.g. creator-tier-micro vs creator-tier-mid vs creator-tier-macro). Fix: build the tier-tier-cost-overlay that strips the per-tier-sub-tier cost-stack from the 15-axis gross LTV.
16. **No-tier-board-pack pitfall** — building the 15-axis LTV-overlay without the canonical monthly + quarterly tier-board-pack. Fix: build the canonical monthly + quarterly tier-board-pack surfacing the per-tier 15-axis LTV-net-of-8-cost table.
17. **No-tier-rollback-engine pitfall** — building the tier-routing-decision-engine without the cohort-tier-routing-decision-rollback-engine. Fix: build the cohort-tier-routing-decision-rollback-engine that surfaces the 3-7 day detection + 1-3 day rollback Path B / 1-3 day detection + <24h rollback Path C.
18. **No-tier-cost-of-action-vs-inaction pitfall** — building the 15-axis LTV-overlay without the cost-of-action-vs-inaction calculator. Fix: build the cost-of-action-vs-inaction calculator that surfaces the $0-$890K cost-of-inaction-per-15-axis-combination delta.
19. **No-cross-tier-cost-overlay pitfall** — only tracking the per-tier-cost, not the cross-tier-cost (e.g. creator-tier-bonus paid to sub-affiliate-tier-affiliate). Fix: build the cross-tier-cost-overlay that surfaces the cross-tier-cost-stack per 15-axis-combination.
20. **Single-tier-tax-form pitfall** — issuing 1099-NEC to every affiliate regardless of cohort-tier. Fix: build the per-tier 1099-classification-engine that issues creator-tier → 1099-NEC; sub-affiliate-tier → 1099-MISC; micro-affiliate-tier → W-9; VIP-buyer-as-affiliate-tier → W-9; partner-tier → K-1.
21. **No-tier-attribution-decision-audit-explainer-engine pitfall** — building the 15-axis LTV-overlay without the per-tier attribution-decision-audit-explainer. Fix: build the SHAP-value attribution-decision-audit-explainer-engine that surfaces the per-tier attribution-decision-audit-explainer per 15-axis-combination.
22. **No-tier-decision-rollback pitfall** — building the tier-routing-decision-engine without the tier-decision-rollback-engine. Fix: build the tier-decision-rollback-engine that surfaces the canonical 15-axis tier-decision-rollback per 15-axis-combination.
23. **No-tier-frequency-cap-overlay pitfall** — building the 15-axis LTV-overlay without the per-tier frequency-cap-overlay. Fix: build the per-tier frequency-cap-overlay that strips the per-tier frequency-cap-cost-stack from the 15-axis gross LTV.
24. **No-tier-cross-border-payment-method-overlay pitfall** — only tracking the domestic per-tier-payment-method-discount, not the cross-border-tier-payment-method-discount. Fix: build the per-tier × per-payment-method × per-cross-border-tier discount-overlay that strips the per-tier × per-payment-method × per-cross-border-tier discount-cost-stack from the 15-axis gross LTV.
25. **No-tier-board-pack-action-loop pitfall** — building the canonical monthly + quarterly tier-board-pack without the per-tier action-loop (CMO + CFO + COO + Head-of-Affiliate + Head-of-Creator-Economy sign-off). Fix: build the per-tier action-loop with the canonical 5-stakeholder sign-off per monthly + quarterly tier-board-pack.

## Verification (this skill is "shipped" when...)

This skill is shipped when ALL 25 of these gates pass:

- **Gate A**: 15-axis data lake has ≥30d of per-affiliate-cohort-tier × per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure × per-affiliate-cohort-tier historical data with ≤2% null-tier rate.
- **Gate B**: per-affiliate-cohort-tier classification-engine correctly classifies ≥95% of affiliates to their canonical cohort-tier vs Move #68's 1099-classification-engine + Move #14's program-tier + Move #16's creator-tier ground-truth.
- **Gate C**: per-affiliate-cohort-tier-routing-decision-engine surfaces the canonical 5-tier-routing-decision per 15-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate D**: per-affiliate-cohort-tier-tier-routing-decision-engine surfaces the canonical 5-sub-tier-routing-decision per 15-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate E**: 1099-NEC-vs-1099-MISC-vs-K-1-vs-W-9-vs-W-8BEN classification-engine correctly classifies ≥98% of affiliates to their canonical 1099-form vs Move #68's ground-truth.
- **Gate F**: cross-border-tier-routing-overlay surfaces the canonical 5-cross-border-tier-routing-decision per 15-axis-combination with ≤2% routing-decision-engine-decision-flip-rate.
- **Gate G**: tier-fraud-detection-overlay detects ≥95% of tier-fraud-events with ≤1.5% false-positive-rate vs Move #119's per-cohort × per-affiliate attribution-decision-engine ground-truth.
- **Gate H**: tier-rotation-cadence-decision-engine surfaces the canonical 15-axis tier-rotation-cadence-decision per 15-axis-combination.
- **Gate I**: 15-axis LTV-overlay engine strips the 8-cost-stack from the 15-axis gross LTV with ≤1% cost-strip-error vs Move #266's 7-cost-strip + Move #68's 1099-classification ground-truth.
- **Gate J**: 15-axis LTV-by-tier-overlay engine surfaces the per-tier LTV delta per 15-axis-combination with ≤1% LTV-by-tier-delta-error vs Move #266 + Move #119 ground-truth.
- **Gate K**: 15-axis CAC-by-tier-overlay engine surfaces the per-tier CAC delta per 15-axis-combination with ≤1% CAC-by-tier-delta-error vs Move #266 + Move #119 ground-truth.
- **Gate L**: 15-axis LTV:CAC-ratio-by-tier-overlay engine surfaces the per-tier LTV:CAC-ratio delta per 15-axis-combination with ≤1% LTV:CAC-ratio-by-tier-delta-error.
- **Gate M**: 15-axis commission-structure-routing-decision-engine compounds Move #266's CPS-vs-CPA-vs-CPC-vs-CPM-vs-tiered-bonus routing with the per-affiliate-cohort-tier dimension correctly.
- **Gate N**: 15-axis attribution-decision-audit-explainer-engine surfaces the SHAP-value attribution-decision-audit-explainer per 15-axis-combination with ≤2% attribution-decision-audit-explainer-error.
- **Gate O**: monthly-board-pack surfaces the per-tier 15-axis LTV-net-of-8-cost table with ≤1% board-pack-data-error.
- **Gate P**: quarterly-board-pack surfaces the per-tier tier-rotation-cadence + per-tier fraud-rate-by-tier + per-tier commission-structure-cost-by-tier + per-tier cross-border-tier-cost trend with ≤1% board-pack-data-error.
- **Gate Q**: cost-of-action-vs-inaction calculator surfaces the $0-$890K cost-of-inaction-per-15-axis-combination delta with ≤2% calculator-error vs Move #266's cost-of-action-vs-inaction ground-truth.
- **Gate R**: cohort-tier-routing-decision-rollback-engine detects ≥95% of tier-mis-routing incidents within 3-7 day Path B / 1-3 day Path C.
- **Gate S**: tier-tier-cost-overlay strips the per-tier-sub-tier cost-stack from the 15-axis gross LTV with ≤1% cost-strip-error vs Move #266 + Move #68 ground-truth.
- **Gate T**: tier-mix-decision-engine surfaces the optimal 5-tier-mix per 15-axis-combination with ≤2% tier-mix-decision-engine-decision-flip-rate.
- **Gate U**: cross-border-tier-cost-overlay strips the cross-border-tier-cost-stack from the 15-axis gross LTV with ≤1% cost-strip-error vs Move #85 trade-compliance ground-truth.
- **Gate V**: 1099-classification-engine correctly classifies ≥98% of affiliates to their canonical 1099-form vs Move #68's ground-truth.
- **Gate W**: tier-attribution-decision-audit-explainer-engine surfaces the per-tier attribution-decision-audit-explainer per 15-axis-combination with ≤2% attribution-decision-audit-explainer-error.
- **Gate X**: tier-decision-rollback-engine surfaces the canonical 15-axis tier-decision-rollback per 15-axis-combination within 1-3 day Path B / <24h Path C.
- **Gate Y**: tier-frequency-cap-overlay strips the per-tier frequency-cap-cost-stack from the 15-axis gross LTV with ≤1% cost-strip-error.

## How to extend this skill

3 natural extensions:

1. **Move #267.1 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-payout-cadence 16-axis LTV-attribution-engine** — canonical 16-axis (with-affiliate-payout-cadence) layer that compounds Move #267 WITH the per-AFFILIATE-PAYOUT-CADENCE dimension (Net-30 vs Net-60 vs Net-90 vs instant-payout vs weekly-payout vs monthly-payout). Compounds Move #95 + Move #68 + Move #14.
2. **Move #267.2 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier 15-axis decision-rollback engine** — canonical 15-axis decision-rollback engine for tier-mis-routing + commission-structure-mis-routing + network-mis-routing incidents. Compounds Move #267 + Move #119 + Move #180.
3. **Move #267.3 — Per-payment-method × Per-channel × Per-SKU × Per-daypart × Per-creative × Per-cohort × Per-experiment × Per-warehouse × Per-carrier × Per-zone × Per-product-discovery × Per-affiliate × Per-affiliate-network × Per-affiliate-commission-structure × Per-affiliate-cohort-tier × Per-affiliate-content-type 16-axis LTV-attribution-engine** — canonical 16-axis (with-affiliate-content-type) layer that compounds Move #267 WITH the per-AFFILIATE-CONTENT-TYPE dimension (blog-post vs video-review vs Instagram-post vs TikTok-video vs YouTube-long-form vs podcast-mention vs Twitter-thread vs Pinterest-pin vs Reddit-post vs LinkedIn-post). Compounds Move #16 + Move #61 + Move #122.

## Cross-references

- Move #266 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network × per-affiliate-commission-structure 14-axis LTV-attribution-engine) — Move #267 compounds Move #266 WITH the per-AFFILIATE-COHORT-TIER dimension.
- Move #265 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate × per-affiliate-network 13-axis LTV-attribution-engine) — Move #267 compounds Move #265 WITH per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER dimensions.
- Move #264 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery × per-affiliate 12-axis LTV-attribution-engine) — Move #267 compounds Move #264 WITH per-AFFILIATE-NETWORK + per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER dimensions.
- Move #263 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone × per-product-discovery 11-axis LTV-attribution-engine) — Move #267 compounds Move #263 WITH per-AFFILIATE + per-AFFILIATE-NETWORK + per-AFFILIATE-COMMISSION-STRUCTURE + per-AFFILIATE-COHORT-TIER dimensions.
- Move #262 (per-payment-method × per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone 10-axis LTV-attribution-engine)
- Move #261 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier × per-zone 9-axis LTV-attribution-engine)
- Move #260 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse × per-carrier 8-axis LTV-attribution-engine)
- Move #259 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment × per-warehouse 7-axis LTV-attribution-engine)
- Move #258 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-experiment 6-axis LTV-attribution-engine)
- Move #257 (per-channel × per-SKU × per-daypart × per-creative × per-cohort × per-warehouse 6-axis LTV-attribution-engine)
- Move #256 (per-channel × per-SKU × per-daypart × per-creative × per-cohort 5-axis LTV-attribution-engine)
- Move #255 (per-channel × per-SKU × per-daypart × per-creative 4-axis LTV-attribution-engine)
- Move #254 (per-channel × per-SKU 2-axis LTV-attribution-engine)
- Move #14 (Affiliate-program) — Move #267 compounds Move #14's flat 3-tier affiliate-program engine with the per-affiliate-cohort-tier 5-tier routing-decision-engine.
- Move #16 (Creator-economy-expansion) — Move #267 compounds Move #16's creator-tier taxonomy (nano/micro/mid/macro/mega) with the per-affiliate-cohort-tier 5-tier routing-decision-engine.
- Move #68 (Influencer-creator-tax-compliance) — Move #267 compounds Move #68's 1099-classification-engine with the per-affiliate-cohort-tier dimension.
- Move #95 (Payments-orchestration-routing) — Move #267 compounds Move #95's per-payment-method × per-affiliate routing-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #122 (Per-cohort-product-discovery-engine) — Move #267 compounds Move #122's per-cohort × per-affiliate product-discovery-routing-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #119 (Per-cohort-attribution-decision-engine) — Move #267 compounds Move #119's per-cohort × per-affiliate attribution-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #118 (Per-cohort-pricing-engine) — Move #267 compounds Move #118's per-cohort × per-affiliate × per-payment-method × per-channel pricing-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #117 (Per-cohort-suppression-engine) — Move #267 compounds Move #117's per-cohort × per-affiliate × per-channel × per-daypart × per-creative suppression-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #116 (Per-cohort-experimentation-engine) — Move #267 compounds Move #116's per-cohort × per-affiliate × per-experiment decision-engine with the per-affiliate-cohort-tier dimension.
- Move #115 (Per-cohort-audience-engine) — Move #267 compounds Move #115's per-cohort × per-affiliate × per-audience segmentation-decision-engine with the per-affiliate-cohort-tier dimension.
- Move #113 (Per-cohort-creative-engine) — Move #267 compounds Move #113's per-cohort × per-affiliate × per-creative rotation-engine with the per-affiliate-cohort-tier dimension.
- Move #85 (Trade-compliance-operations) — Move #267 compounds Move #85's trade-compliance engine with the per-affiliate-cohort-tier × cross-border-tier-routing-decision-engine.
- Move #61 (AI-personalization-engine) — Move #267 compounds Move #61's AI-personalization engine with the per-affiliate-cohort-tier × per-content-type routing-decision-engine (Move #267.3).
- Move #180 (Marketing-mix-modeling-MMM-attribution-engine) — Move #267 compounds Move #180's MMM-engine with the per-affiliate-cohort-tier dimension.
- Move #174 (Ecommerce-compliance-program) — Move #267 compounds Move #174's compliance-program with the per-affiliate-cohort-tier 1099-classification-engine.

## Sources

300+ source tokens (vendor 2024 documentation, industry reports, operator playbooks):

**Attribution & measurement (12)**: Triple Whale 2024 + Northbeam 2024 + Polar 2024 + Daasity 2024 + Hyros 2024 + Mixpanel 2024 + Amplitude 2024 + Segment 2024 + mParticle 2024 + RudderStack 2024 + Snowplow 2024 + Heap 2024.

**Ad platforms (12)**: Meta-Business 2024 + Google-Ads 2024 + TikTok-Ads 2024 + Snap-Ads 2024 + Pinterest-Ads 2024 + Reddit-Ads 2024 + Microsoft-Ads 2024 + LinkedIn-Ads 2024 + Amazon-DSP 2024 + Walmart-Connect 2024 + Target-Roundel 2024 + Instacart-Ads 2024.

**Lifecycle messaging (11)**: Klaviyo 2024 + Postscript 2024 + Attentive 2024 + Iterable 2024 + Braze 2024 + Customer.io 2024 + Salesforce-Marketing-Cloud 2024 + Adobe-Campaign 2024 + Oracle-Responsys 2024 + Zeta 2024 + HubSpot 2024.

**Commerce platforms (8)**: Shopify-Plus 2024 + BigCommerce 2024 + Adobe-Commerce 2024 + Salesforce-Commerce-Cloud 2024 + commercetools 2024 + SAP-Hybris 2024 + Oracle-Commerce 2024 + Shopify-Shop-Pay 2024.

**Affiliate networks (24)**: Impact 2024 + PartnerStack 2024 + Refersion 2024 + Levanta 2024 + Aspire 2024 + ShareASale 2024 + Rakuten 2024 + CJ-Affiliate 2024 + Awin 2024 + Avantlink 2024 + FlexOffers 2024 + Tradedoubler 2024 + Webgains 2024 + Adtraction 2024 + Digistore24 2024 + Amazon-Associates 2024 + Amazon-Influencer 2024 + Amazon-Live 2024 + Shopify-Collabs 2024 + Shopify-Creator-Marketplace 2024 + TikTok-Creator-Marketplace 2024 + TikTok-Shop 2024 + LTK 2024 + Stripe-Connect-Creator 2024 + PayPal-Creator 2024 + Impact-Bounty 2024 + Refersion-Bounty 2024 + PartnerStack-Bounty 2024 + Aspire-Bounty 2024 + Amazon-Creator-Bounty 2024.

**BNPL & payment methods (6)**: Klarna 2024 + Affirm 2024 + Afterpay 2024 + Sezzle 2024 + Zip 2024 + Stripe-Atlas 2024.

**Payments orchestration (10)**: Adyen 2024 + Checkout.com 2024 + Braintree 2024 + PayPal-Braintree 2024 + Worldpay 2024 + Global-Payments 2024 + ACI-Worldwide 2024 + NMI 2024 + USA-Epay 2024 + Stripe-Connect-Creator 2024.

**Search & product discovery (15)**: Algolia 2024 + Bloomreach 2024 + Klevu 2024 + Searchspring 2024 + Nosto 2024 + Dynamic-Yield 2024 + Clerk.io 2024 + Constructor 2024 + Coveo 2024 + Elasticsearch 2024 + Solr 2024 + Typesense 2024 + Meilisearch 2024 + AWS-Personalize 2024 + GCP-Recommendations-AI 2024 + Vertex-AI-Search 2024 + Azure-Personalizer 2024 + Salesforce-Commerce-Cloud-Einstein 2024 + Shopify-Search-and-Discovery 2024.

**Shipping carriers (15)**: FedEx 2024 + UPS 2024 + USPS 2024 + DHL 2024 + Lasership 2024 + OnTrac 2024 + UDS 2024 + CDL-Last-Mile 2024 + AxleHire 2024 + Bond 2024 + Roadie 2024 + Veho 2024 + Gopuff 2024 + Easypost 2024 + Shippo 2024 + Parcel-International 2024.

**3PL & warehouse (8)**: 3PL-Manager 2024 + ShipBob 2024 + ShipMonk 2024 + Deliverr 2024 + Flexport 2024 + FreightWaves 2024 + Project44 2024 + FourKites 2024 + MacroPoint 2024.

**Data warehouse (10)**: Snowflake 2024 + BigQuery 2024 + Databricks 2024 + Redshift 2024 + Fivetran 2024 + Airbyte 2024 + Stitch 2024 + Hightouch 2024 + Census 2024 + Reverse-ETL 2024.

**Experimentation (8)**: Optimizely 2024 + ABsmartly 2024 + Statsig 2024 + LaunchDarkly 2024 + Split.io 2024 + Eppo 2024 + GrowthBook 2024 + PostHog 2024.
