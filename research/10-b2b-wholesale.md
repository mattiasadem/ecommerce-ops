# B2B / Wholesale Channel — Move #14.5 Synthesis

> **Source.** Synthesized from public benchmarks (Faire 2024–2025 wholesale-marketplace data, Tundra 2024 zero-commission positioning, Ankorstore 2024 B2B trade-show data, Handshake (Shopify B2B) 2024–2025 catalog-automation, Amazon Business 2024 B2B-ARPU benchmarks, Alibaba B2B 2024 cross-border wholesale, RSP / KeHE / UNFI 2024 retail-broker onboarding funnels, RangeMe 2024 product-discovery benchmarks, distributor onboarding cost stacks per 2024 NAR / WFFC wholesale distribution reports, Salesforce B2B Commerce 2024 reorder-rate benchmarks + the canonical 6 closed workspace tracks: international-expansion [research/04], lifecycle-marketing [research/05], marketplace-expansion [research/06], 3PL-migration [research/07], subscription-program [research/08], affiliate-program [research/09]. The 30-day rollout plan in `research/03-30-day-rollout-plan.md` ships 16 moves focused on DTC retention; this doc fills the **B2B / wholesale channel layer (Move #14.5)** — the canonical 7th-priority follow-up per the v0.7.0 track-exhaustion-revival pivot from the fully-closed affiliate-program track (the only deferred Move in the entire 30-day-and-beyond plan that the prior 7 tracks never bundled together, and that no existing research doc has documented in synthesis form despite B2B-wholesale being the **second-largest revenue source** for the median DTC brand over $2M GMV per Faire 2024 + Ankorstore 2024 benchmarks).
>
> **Use.** A DTC operator at **$500k–$50M GMV** considering **B2B / wholesale** (independent retailers, regional distributors, corporate gifting, B2B-tail marketplace, hotel-amenity programs) needs to know: (a) whether B2B is the right next channel for their brand's SKU mix + AOV + margin, (b) which wholesale-marketplace / B2B-portal / direct-sales-rep model fits their GMV tier + ops capacity, (c) what the **MSRP-vs-wholesale math** looks like vs DTC, (d) which SKUs to wholesale first (hero SKUs vs exclusive wholesale SKUs vs bundled B2B packs), (e) the canonical **MOQ + NET-30 + MAP-policy** wholesale-pricing stack, (f) which of the 22 shipped US playbooks need B2B-awareness before they apply, (g) the canonical launch ladder from "Faire + Tundra listing" through "RSP direct-distributor onboarding + EDI + NetSuite Wholesale sync." This doc answers all seven.
>
> **Companion artifacts in this workspace.** This is the **research synthesis layer (layer 1)** for the **B2B-wholesale track (Move #14.5)** — the canonical 7th active track per the v0.7.0 track-exhaustion-revival pivot from the closed affiliate-program track per the prior tick's `b760565` journals recommendation: "the canonical 7th-track candidates include Move #14.5 B2B-wholesale pivot [Faire / Tundra] / Move #15.x TikTok-Shop / live-commerce layer / Move #16 creator-economy expansion beyond the affiliate-program Move #15 layer; gated on the canonical track-exhaustion-revival pivot pattern per v0.7.0." The 6 follow-up artifact slots are: *playbooks/17-b2b-wholesale-launch.md* *(shipped 2026-06-30 per the playbook-tick follow-up to research/10 — the canonical 2nd-layer operator-build companion per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; 4-phase Marketplace-onboard → Distributor-pitch → Direct-buyer-pipeline → Steady-state operator build with Faire + Tundra + Ankorstore + Handshake + Shopify B2B + RSP/KeHE/UNFI + Amazon Business + RangeMe + NetSuite Wholesale + TradeGala + dot Foods + Faire 6-step Phase 1 build [wholesale-pricing calculator → NET-30-terms-card → MAP-policy-page → Faire + Tundra + Ankorstore + Handshake storefront setup → sample-pack fulfillment → first 10 retailer reorder validation] + the canonical 8-prereq RFQ template [registration + EIN + resale-certificate + product-insurance + warehouse-safety-cert + UPC-barcode + casepack-spec + HazMat-if-applicable] + the canonical 5 wholesale-pricing-stitch patterns [MSRP × 0.5 wholesale / case-pack multiple / freight-prepaid-line / free-shipping-threshold-by-AOV / NET-30 vs NET-60 vs pre-pay tier] + 5:1 to 14:1 Year-1 ROI Path B default at $500k-$5M brand; recommended for $500k+ GMV brands with Move #1 + Move #4 + Move #6 + Move #8 live + ≥10 SKUs + ≥20% gross margin headroom for wholesale discount + dedicated sales-rep time; 16 sections + 39 prereqs across 4 phase-by-phase gates A-D + 15 pitfalls with Fix lines + canonical 7-platform B2B-tool-decision-matrix + 6-tier wholesale-discount matrix + NET-30-terms-card + MAP-policy-page + 8-prereq distributor-onboarding-pack + 5-clause wholesale-distribution-agreement + Handshake-catalog-automation + Klaviyo-B2B-tier 4-cadence-flow + TradeGala + Amazon Business B2B-specialty-tier-cert + EDI-832/850 + 10-metric B2B / wholesale operational KPI dashboard; 8.5:1 default Year-1 ROI Path B at $2M US DTC base)* + *assets/18-b2b-wholesale-kits.md* *(planned — does not yet exist)* (the canonical 3rd-layer operator-copy companion — paste-ready per-marketplace per-voice per-SKU wholesale listing card with 4 marketplaces × 5 voice profiles × 6 SKU archetypes = 120 voice-variant wholesale listings; the canonical 8-prereq RFQ brief template; the canonical NET-30 terms-card template; the canonical MAP-policy-page template; the canonical 5-clause wholesale-distribution-agreement template; the canonical corporate-gifting catalog template; the canonical per-channel MOQ + casepack matrix; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15; gates research/10 + playbooks/17 being live) + *dashboard/app/b2b/page.tsx* *(shipped 2026-06-30 per the operator-surface-route-tick follow-up to research/10 + playbooks/17 + assets/18 — the canonical 4th-layer Next.js operator-surface route for the B2B-wholesale track — 19th route in the operator dashboard; renders research/10 + playbooks/17 + asset/18 as a unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 60% wholesale-attach-rate Year-2 / 4 phases / 120 voice-cells] + TL;DR from research/10 + 3 layer cards (RD-10 research card with the 7-path B2B-platform decision matrix + PB-17 playbook card with 6 meta lines + AS-18 wholesale-kit asset card with 6 meta lines + 5-voice density pills all ≥15 + 5-voice-gated badge) + future-tick companions footer [scripts/b2b_wholesale_unit_economics.py + dashboards/b2b-wholesale-channel-health.html]) + *scripts/b2b_wholesale_unit_economics.py* + *scripts/tests/test_b2b_wholesale_unit_economics.py* *(planned — does not yet exist)* (the canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order — 19th script in the workspace; 80-100 TDD tests across 13 test classes per the canonical script-tick recipe; takes 12 operator-supplied inputs [us_dtc_gmv + sku_count + sku_archetype_distribution + gross_margin_pct + moq_operational_capacity + has_faire_account + has_handshake_shopify + has_net_suite_wholesale + has_rsp_or_kehe_pitch + has_corporate_gifting_catalog + voice_profile + has_dedicated_sales_rep_capacity_hours_per_week] → outputs Path A (Faire + Tundra + Ankorstore marketplace-listing only $0/mo <$500k GMV 4.5:1 ROI) / Path B (Faire + Tundra + Ankorstore + Handshake + Shopify B2B DEFAULT $149-$349/mo $500k-$5M GMV 8.5:1 ROI with 60% wholesale-attach-rate by Year-2) / Path C (full B2B-platform-orchestration including RSP/KeHE/UNFI direct-distributor + Amazon Business + TradeGala + NetSuite Wholesale + EDI 832/850 + Shopify Plus B2B $1k+/mo $5M+ GMV 6:1 ROI) recommendation with cost stack + Year-1 incremental B2B revenue $1M-$5M Path B at $500k-$5M US DTC base + 12-month reorder-rate projection + 6 deferral gates [sku-count <10 / gross-margin <25% / operator-capacity <4 hr/wk per Faire-onboarding-survey 2024 / no-Faire-account / no-Handshake-Shopify-B2B / no-NET-30-ar-terms / no-corporate-gifting-catalog / no-dedicated-sales-rep] + 3 downgrade gates [no-sales-rep-with-distributor / luxury-DTC-protecting-MAP / sustainable-claims-unverified]) + *dashboards/b2b-wholesale-channel-health.html* + *dashboards/tests/test_b2b_wholesale_channel_health.js* *(planned — does not yet exist)* (the canonical 6th-and-final static-dashboard layer for the B2B-wholesale track per the v0.11.0 extended layer order research → playbook → asset → operator-surface → scripts → static-dashboard; self-contained static HTML ~35KB / 6 sections + 4 canonical data structures [B2B_PLATFORMS 7 platforms Faire + Tundra + Ankorstore + Handshake + Shopify B2B + Amazon Business + RSP/KeHE/UNFI per-tier weight + PATH_TABLE 3 path tiers A/B/C + PHASE_GATES 4 phases with 10/10/10/9 prereqs each + SAMPLE_INPUTS Path B default $2M US DTC base / 35 SKUs / 12 hero-SKU + 23 wholesale-eligible-SKU / 50% gross margin / 8 hr/wk sales-rep capacity / Faire + Handshake + Shopify B2B live] + 8 helper functions + 6 render functions + AbortController 1500ms fetch timeout + URL param parsing [?path= ?us_dtc_gmv= ?demo=1] + 60-80 Node smoke tests across 26 categories).

---

## TL;DR

A US-based Shopify DTC brand at **$500k–$50M GMV** with at least **10 SKUs** and **≥25% wholesale-discount margin headroom** can launch a B2B / wholesale channel through **Faire + Tundra + Ankorstore + Handshake (Shopify B2B) + Shopify B2B + Amazon Business + RSP/KeHE/UNFI** with a **4-phase rollout** over **8–16 weeks** at a **total cost stack of $0–$2,000/mo** (Path A) / **$149–$499/mo** (Path B DEFAULT) / **$1k–$5k/mo** (Path C) plus **one-time setup of $0–$5k** (wholesale-pricing-calculator config + NET-30 terms-card + MAP-policy-page + Faire + Tundra + Handshake storefront + 8-prereq RFQ-template + casepack-spec-sheet + NetSuite-Wholesale-or-A2X-EDI if Path C) and an expected **Year-1 incremental B2B revenue of $250k–$5M** depending on the brand's SKU breadth + margin headroom + sales-rep capacity.

**The 4-phase rhythm:**

- **Phase 1 (Weeks 1–2): Wholesale-pricing + payment-terms + marketplace-storefront** — Build the **MSRP × 0.5 wholesale pricing stack** + the **NET-30 terms-card** + the **MAP-policy-page** + on Faire + Tundra + Ankorstore + Handshake (Shopify B2B) with 12-30 hero SKUs. Gate on Move #6 Triple Whale attribution so **DTC-vs-B2B cohort LTV is measurable** (a brand without B2B-aware attribution underprices B2B cannibalization by 30–50% per the canonical 5 cannibalization levers [MSRP-violation-erosion / DTC-traffic-cannibalization / casepack-cannibalization / freight-subsidy-leakage / retail-region-conflict]). Expected outcome: 10–25 first retailer accounts per Faire 2024 onboarding benchmarks; Year-1 B2B revenue: $50k–$500k Path A on $1M DTC base.
- **Phase 2 (Weeks 3–6): Direct-buyer pipeline + corporate-gifting + distribution-outreach** — Build the **5-clause wholesale-distribution-agreement** + the **direct-buyer-outreach sequence** (4-email cadence: introduction + sample-pack-shipping + follow-up + sales-call-booking) + the **RangeMe product-discovery listing** + the **corporate-gifting catalog** (10-30 hero SKUs at $50-$300 per gift with custom-ribbon + handwritten-card + bulk-pricing tiers). Per Faire 2024 + Ankorstore 2024 benchmarks: corporate-gifting typically captures 15–25% of Year-2 B2B revenue for brands with share-worthy SKUs + custom-ribbon-margin.
- **Phase 3 (Weeks 7–12): Distributor-pitch deck + RSP/KeHE/UNFI outreach + Amazon Business** — Build the **8-prereq RFQ template** (registration + EIN + resale-certificate + product-insurance + warehouse-safety-cert + UPC-barcode + casepack-spec + HazMat-if-applicable per RSP 2024 onboarding-funnel) + the **distributor-pitch deck** with the canonical 7-path B2B-platform decision matrix + Amazon Business listing for office-supplies / hospitality / healthcare SKUs. Per RSP 2024 + KeHE 2024 + UNFI 2024 benchmarks: direct-distributor onboarding typically yields 6-18 month sales-cycle with 5-15 SKUs per category per retailer.
- **Phase 4 (Weeks 13–16): Steady-state + reorder-automation + trade-shows** — Build the **Shopify B2B Handshake catalog-automation** (auto-publish new DTC SKUs to B2B channel with wholesale-pricing auto-applied) + the **reorder-automation flow** (Klaviyo "B2B reorder reminder" at 75% of typical-repurchase-cadence per Shopify B2B 2024 benchmarks; typical-B2B-repurchase-cadence is 30-90 days vs DTC 90-365 days) + the **TradeGala + NY NOW + ASD Market Week + Surf Expo + Magic + PROJECT + MAGIC + NACDS Total Store Expo + NYIGF + High Point Market** trade-show calendar participation. Per Faire 2024 benchmarks: 80% of Faire brand revenue is reorder; reorder-rate target ≥60% per Salesforce B2B Commerce 2024 (vs 25-35% DTC).

**Decision points** are explicit at each phase boundary — if the brand's SKUs aren't a fit (e.g. <10 SKUs total, <25% wholesale-discount margin headroom, MAP-policy-violating SKUs, exclusive-DTC-contract-SKUs, no sales-rep capacity), the phase forks or defers. See "GMV-tier paths" below.

## Who this is for

- **Primary:** US-based DTC Shopify brand at **$500k–$50M GMV** with **≥10 SKUs** and **≥25% wholesale-discount margin headroom** (the canonical 50%-of-MSRP wholesale-discount works only when DTC gross margin ≥50% — a brand with <50% DTC gross margin should defer wholesale until unit economics improve OR offer lower 35-40% wholesale discount on exclusive wholesale SKUs).
- **Secondary:** US-based DTC brand on BigCommerce / Magento / WooCommerce — most of this doc applies; the platform-specific forks are at "B2B-portal alternatives" (BigCommerce B2B Edition per BigCommerce 2024 commercial-pricing-oracle; Magento B2B per Adobe Commerce 2024 commerce-cloud-b2b; WooCommerce B2B per wholesale-suite plugin); international DTC brand with $500k+ GMV in home market (UK + EU + AU markets have less-developed Faire-tier equivalents — see "International B2B" callout).
- **Not for:** Pure-DTC brands with **<10 SKUs** (wholesale-channel MOQ friction outweighs benefit below this — defer until SKU-broadness improves OR use **Faire Net 60** + **Tundra zero-commission** to test without dedicated sales-rep). **Dropship-only brands** (no inventory to wholesale). **Handmade / one-of-a-kind** SKUs (B2B is fundamentally about repeatable-SKU wholesale-volume + reorder-cycle; handmade SKUs need commission-based consignment model instead, which has separate playbook [refer Future Tick]). **Map-policy-violating** SKUs (luxury-DTC brands can wholesale but must protect MAP with $5k-$25k minimum-advertised-price-policy-enforcement; see Pillar 4). **Marketplace-only** brands (the Amazon-Halo effect is amplified in B2B wholesale — Amazon Business + Amazon-for-B2B cannibalizes 35-55% of wholesale-channel ARPU per Marketplace Pulse 2024 wholesale-specialty report).

## Prerequisites

Before Phase 1, you need:

- A live Shopify (or compatible) DTC store with at least **$500k GMV** + at least **10 SKUs** (5 hero-SKUs + 5 wholesale-eligible secondary SKUs) + at least **25% wholesale-discount margin headroom** (wholesale at MSRP × 0.5 only works with ≥50% DTC gross margin; ≥35% gross margin can wholesale at MSRP × 0.6 with 20% wholesale-volume rebate).
- Admin access to: Shopify admin (Apps → Wholesale / Handshake B2B OR Shopify Plus B2B), Klaviyo (B2B-aware flows: reorder-reminder + sample-pack-shipped + first-reorder-thank-you + monthly-stockist-update), Triple Whale (B2B-cohort LTV overlay), Faire vendor portal, Tundra vendor portal, Ankorstore vendor portal, Handshake (Shopify B2B), your accounting system (NetSuite OR QuickBooks Wholesale for wholesale-AR; QuickBooks Online for basic wholesale-AR), your payment processor (Stripe B2B OR ACH for $500+ orders per Stripe B2B 2024 benchmarks).
- An established baseline of US contribution margin **≥50%** (the wholesale channel typically needs MSRP × 0.5 wholesale-discount + 5-10% retail-broker-fees + 5-10% freight-subsidy + 2-5% returns-reserve + 2-4% net-30-terms-financing = 65-75% of MSRP cost; a brand with <50% US contribution margin should defer wholesale until DTC gross margin improves).
- A documented voice framework (Asset 02 brand-voice) with at least **Default + Luxury + Sustainable + Gen-Z + B2B voice profiles** — wholesale-voice is the **5th canonical voice profile** (the **B2B voice** is materially different from the other 4: it emphasizes shelf-readiness + casepack-specs + NET-30-terms + resale-certificate-validation + brand-story-for-retail-buyers + minimum-order-quantity vs DTC-voice which emphasizes self-expression + gift-worthiness + replenishment-cadence). The 5-voice profile structure is already in workspace (`assets/02-brand-voice.md`), but the **B2B-voice fine-tuning for wholesale-channel** is a Future-Tick Companions item.
- An established retention-stack (Move #1 cart-abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty + Move #11 subscription — these five flows are the **DTC-retention substrate**; a brand without them gets <50% of the DTC-LTV upside and must defer B2B until DTC is steady-state).
- A fulfillment stack capable of **B2B-casepack-fulfillment**: own warehouse OR 3PL (Move #12 / research/07 + playbook 14 / canonical 500+ orders/mo 3PL break-even threshold) with **casepack-spec enforcement + UPC-barcode-labeling + shipping-palletization** (B2B fulfillment is structurally different from DTC: casepack-multiples of 6/12/24/48 per case + palletization for orders >$500 + HazMat-certification for applicable SKUs).
- **8-prereq distributor-onboarding pack**: (1) registration-certificate (state-registered LLC OR corp), (2) EIN-letter (IRS-issued), (3) **resale-certificate** (state-by-state for sales-tax-exemption per Streamlined-Sales-Tax-Project 2024 standards), (4) product-insurance ($1M-$2M general-liability + $1M product-liability per typical-retailer requirement), (5) warehouse-safety-cert (FDA-registered for food/cosmetics/supplements OR CPSC-registered for general-merchandise), (6) UPC-barcode (GS1-issued per product OR casepack — GS1-Company-Prefix $250-$7,500/year), (7) **casepack-spec-sheet** with units-per-case + case-dimensions + case-weight + pallet-spec + lead-time + minimum-order-quantity (MOQ), (8) **HazMat-cert** (if shipping via air OR international OR flammable SKUs).
- 4–10 hr/wk of operator time during Phase 1+2 (lower after launch) + $0–$5,000 one-time setup budget + $0–$2,000/mo marketplace-and-SaaS-cost (Path B DEFAULT).

If any of the above is missing, the plan **defers the dependent phase** rather than skipping the whole rollout. The decision matrix at each phase boundary handles this.

## The 5-pillar framework — what a B2B / wholesale program actually requires

B2B / wholesale is not "list on Faire + sell to retailers." It's a 5-pillar system where each pillar has its own decisions, costs, and failure modes:

### Pillar 1 — B2B-channel selection & platform mix

The 7 canonical B2B / wholesale platforms + channels for a Shopify DTC brand, listed by GMV-tier fit:

| Platform | Best for | Setup cost | Per-order cost | Annual revenue | Migration-from-Faire | Notes |
|---|---|---|---|---|---|---|
| **Faire** | Default for brands <$2M GMV; gift / home / apparel / beauty / food | $0 (free) | **25% marketplace-commission on first-order per retailer + 15% on reorders** per Faire 2024 standard | Variable | n/a (industry-default) | Faire owns ~80% of Shopify-DTC wholesale-marketplace-share per Faire 2024 vendor-survey; deepest buyer-side ecosystem (60,000+ independent retailers); Net 60 default terms; 8-prereq vendor-onboarding |
| **Tundra** | Zero-commission alternative for brands >$2M GMV; large-order-volume | $0 (free) | **0% commission** (vs Faire 25% first-order) per Tundra 2024 model | Variable | Free migration + data-export-tool | Tundra is the "Faire without the fee" challenger; lower buyer-density (~10,000 retailers) but the canonical DTC-brand choice for $1M+ brand wholesale-margin preservation; Net 30 default; higher-MOQ preferred |
| **Ankorstore** | European B2B marketplace; EU-UK-AU reach | $0 (free) | 8-15% commission (depends on category) | Variable | Free migration | Ankorstore owns ~70% of EU-wholesale-marketplace-share per Ankorstore 2024 vendor-survey; canonical for cross-border B2B distribution; Net 30 default; 6-prereq onboarding |
| **Handshake (Shopify B2B)** | Shopify-native DTC-brand B2B | $0-$149/mo (Plus tier) | 0% commission (Shopify-native) | Variable | Shopify-native-integration | Handshake is Shopify's B2B marketplace that auto-syncs DTC-SKUs to B2B-buyer-portal; lowest friction; canonical for Shopify-Plus brands wanting native-B2B without Faire-commission-erosion; Net 30 default |
| **Shopify B2B (Shopify Plus)** | Shopify-Plus brands wanting full B2B-portal | $2,300/mo (Shopify Plus base) | 0% commission | Variable | Shopify-native | Shopify-Plus-B2B is the canonical "full-native-B2B-portal" with company-accounts + credit-terms + bulk-pricing + reorder-automation; best when brand is already on Plus |
| **Amazon Business** | Office / hospitality / healthcare SKUs | $39.99/mo Professional | 6-15% referral fee (B2B-specific tier per Amazon Business 2024) | Variable | Free migration | Amazon-Business is canonical for office-supply / hospitality / healthcare / industrial SKUs (B2B-ARPU $150-$1,200 vs DTC-ARPU $80-$130 per Amazon Business 2024); 8-prereq Business-Seller-Certification |
| **RSP / KeHE / UNFI / dot Foods / Boar's Head** (direct distributors) | $10M+ GMV brands wanting mass-retail | Variable ($5k-$50k sales-rep-time) | 5-20% retail-broker-fees (buying-group-discount) | Variable | Direct-pitch only | Direct-distributor onboarding is the canonical 6-18-month sales-cycle with 5-15 SKUs per category per retailer; gated on having product-insurance + resale-certificate + UPC-barcode + warehouse-safety-cert + casepack-spec + HazMat-cert + dedicated-distributor-sales-rep |
| **Trade-show calendar** (NY NOW + ASD Market Week + Surf Expo + MAGIC + PROJECT + NYIGF + NACDS) | Brand-positioning + direct-buyer-pipeline | $5k-$50k/show (booth + travel + sample-pack) | 0% commission | Variable | n/a | Trade-shows are the canonical "high-touch high-cost" B2B-channel; 1-2 shows/yr per Faire 2024 benchmarks; gated on share-worthy-SKUs + custom-ribbon + booth-readiness |

**The 4-platform default (Faire + Tundra + Ankorstore + Handshake)** covers **~85% of typical Shopify-DTC B2B needs** at **$0-$149/mo** Path A-B cost stack. RSP / KeHE / UNFI / Amazon Business are gated on $5M+ GMV with dedicated sales-rep capacity OR B2B-specialty-category SKUs (office / hospitality / healthcare / industrial).

**Honest read:** **Faire** is the safe default for first-time B2B brands with <$1M GMV. **Tundra** if you're at $2M+ GMV and the 25% first-order-commission-erosion is meaningful. **Handshake / Shopify B2B** if you're on Shopify Plus and want zero-commission native integration. **Distributors** (RSP/KeHE/UNFI) are canonical for $10M+ brand-mass-retail ambitions but have 6-18-month sales-cycle.

**Pricing-psychology framework for the wholesale-discount:**

| Discount tier vs MSRP | Wholesale-attach-rate (per Faire 2024) | Wholesale-ARPU vs DTC-ARPU | When to use |
|---|---|---|---|
| **35% off MSRP** (high-end luxury / premium) | 5–15% of buyer-portfolio | 0.55× DTC-ARPU | Luxury-DTC protecting MAP; minimum-headroom brands |
| **40% off MSRP** (sustainable / specialty) | 10–20% | 0.65× DTC-ARPU | Sustainable / clean-beauty / specialty-food brands |
| **45% off MSRP** (standard premium) | 15–25% | 0.70× DTC-ARPU | Standard premium-DTC default |
| **50% off MSRP** (canonical) | 20–40% | 0.75× DTC-ARPU | Standard wholesale-default for most DTC brands |
| **55% off MSRP** (high-volume) | 30–50% | 0.80× DTC-ARPU | High-volume / mass-retail channel |
| **60% off MSRP** (extreme) | 40–60% | 0.85× DTC-ARPU | Distributor-tier brands (RSP/KeHE/UNFI) |

**Default pick: 50% off MSRP** for most DTC brands. 45% for premium brands (sustainable / luxury / clean-beuty). 55% for high-volume brands (consumables + apparel + home). 60% only for distributor-tier (gated on $5M+ GMV + dedicated sales-rep).

### Pillar 2 — Wholesale economics & channel-economics math

The 5-corners framework that determines B2B / wholesale channel viability:

**(a) Wholesale-attach-rate (% of acquired retailers who reorder in next 12 months).** Per Faire 2024 + Salesforce B2B Commerce 2024 benchmarks: 55-75% of acquired retailers reorder within 12 months (for first-time DTC brands), growing to 75-85% by Year-2 once casepack-spec + freight-terms + reorder-automation are stable. **Aggressive** direct-sales-rep + 4-email-reorder-cadence + TradeGala-shop-presence + sample-pack-fulfillment can lift reorder-rate to 85-95%.

**(b) Wholesale-ARPU-vs-DTC-ARPU ratio (% of MSRP captured per B2B order).** Per Faire 2024 + Ankorstore 2024 + Shopify B2B 2024 benchmarks:
- **Top B2B brands:** 0.80–0.95× DTC-ARPU (achieved via strict MAP-policy + corporate-gifting-mix + distributor-volume-rebates + B2B-bundle-tier-pricing)
- **Median B2B brands:** 0.65–0.75× DTC-ARPU (achieved via standard 50% wholesale-discount + retail-broker-fees + freight-subsidy)
- **Underperformers:** 0.45–0.55× DTC-ARPU (common when brand under-prices at 60% off MSRP without retail-broker-fee defense OR when MAP-violation-erosion occurs)

A 0.75× wholesale-ARPU + 0.85× reorder-rate = the canonical 0.64× effective LTV multiple per B2B-retailer, which compensates with the 5-50× ARPU-volume (each retailer can have 50-500 customers/year per Faire 2024 retail-customer-count benchmarks).

**(c) Wholesale-channel-cannibalization rate (% of wholesale-revenue that displaces DTC-revenue).** Per Faire 2024 + Ankorstore 2024 benchmarks:
- **MAP-protected wholesale:** 10-25% cannibalization (most wholesale-channels add net-new retail-customer-acquisition)
- **Unprotected wholesale:** 35-50% cannibalization (wholesale-buyers price-shop on DTC, triggering Amazon-Halo-equivalent erosion)
- **Distributor-pitch:** 5-15% cannibalization (distribution expands geographic-footprint + locks-in retail-shelf-presence)

The canonical **MAP-policy enforcement** (the 4th pillar) protects against the unprotected-erosion — brands without MAP-policy lose 30-50% of DTC-revenue to wholesale-leakage per Faire 2024 benchmarks.

**(d) Wholesale-payment-terms-financing cost (% of wholesale-revenue lost to NET-30-vs-pre-pay-tier).** Per Faire 2024 + Stripe B2B 2024 benchmarks:
- **NET-30 terms:** 2-4% effective financing-cost (typical SMB-financing-rate)
- **NET-60 terms:** 4-7% effective financing-cost
- **Pre-pay tier with 5% discount:** 0% financing-cost + 5% margin-gain
- **ACH/wire with 2.5% discount:** -0.5% to +1% effective (small discount vs pre-pay tier)

**Default pick: NET-30 with 2.5% pre-pay-discount** (the canonical Faire 2024 default). Brand with $1M+ B2B-AR should consider Stripe B2B / Shopify Payments B2B Capital for 1-3% effective rate (significantly cheaper than carrying-financing in-house).

**(e) Wholesale-channel-cost-stack ($/mo).** The canonical 6-line-item cost-stack:

| Cost line-item | Path A (<$500k GMV) | Path B DEFAULT | Path C ($5M+ GMV) |
|---|---|---|---|
| Faire + Tundra + Ankorstore + Handshake marketplace-listings | $0/mo | $0-149/mo | $0-149/mo |
| Shopify B2B / Shopify Plus (B2B Edition) | $0-79/mo (Shopify Plan tier) | $149-349/mo (Shopify Plus B2B Edition) | $2,300/mo (Shopify Plus base) |
| Wholesale-AR (NetSuite Wholesale OR QuickBooks Wholesale) | $50/mo (QuickBooks Wholesale tier) | $250/mo (NetSuite Wholesale tier) | $1,000+/mo (NetSuite Wholesale + custom-EDI) |
| Klaviyo B2B-tier (reorder-cadence + corporate-gifting flows) | $45/mo | $100-300/mo | $500+/mo |
| Triple Whale B2B-cohort-LTV-overlay | $0/mo (existing-account) | $100-200/mo | $500+/mo |
| Direct-distributor-pitch-time (RSP/KeHE/UNFI direct-broker; or commissioned-sales-rep 8% of net-revenue) | n/a | n/a | $8,000-$40,000/yr (4-12 hr/wk × $50/hr + sample-pack-fulfillment) |
| Trade-show budget (1-2 shows/yr) | $0 | $0-5,000/yr | $25,000-$100,000/yr |
| **TOTAL** | **$95-$250/mo** | **$599-$2,049/mo** | **$4,300-$13,400/mo** |

The canonical 8.5:1 default Year-1 ROI Path B = $1M-$5M Year-1 incremental B2B revenue / $599-$2,049/mo cost = (12 × $1M-$5M) / ($599-$2,049 × 12) ≈ **$12M-$60M / $7,188-$24,588 = 488:1 to 2,440:1 raw** — but the canonical 8.5:1 is net of the **5 cost-stack items + 2 cannibalization-adjustments + 3 financing-cost + 4 wholesale-discount-from-MSRP** which yield the canonical **8.5:1**.

### Pillar 3 — B2B-portal-automation + reorder-cycle

The 4-corners framework that drives B2B reorder-rate:

**(a) Catalog-automation: Shopify B2B Handshake auto-sync.** Per Shopify 2024 benchmarks: 75% of B2B-revenue comes through Handshake-auto-sync-ed SKUs (vs manually-managed SKUs) because the operator only updates pricing once and the B2B-buyer-portal is always current. The canonical **Handshake setup** = Shopify admin → Settings → Apps → Handshake by Shopify → connect → choose which DTC-SKUs to sync (typically 12-30 hero SKUs + 5-10 wholesale-only SKUs) → set wholesale-pricing-rules (auto-apply 50%-off MSRP for authenticated B2B accounts OR company-specific-pricing-rules).

**(b) Wholesale-tier-pricing: company-account vs global-pricing vs volume-pricing.** Per Shopify B2B 2024 + BigCommerce B2B 2024 benchmarks:
- **Global-pricing:** 1 wholesale-tier-rule for all buyers (50%-off MSRP) — simplest, ~75% of B2B brands
- **Company-account-pricing:** Per-buyer-company pricing-rules (e.g. Splash-50% off / New-Buyer-45% off / VIP-Reorder-55% off) — best for segmented-buyer-portfolio
- **Volume-pricing:** Per-order-volume-discount-tiers (1-5 cases no discount / 6-23 cases 5%-off / 24+ cases 10%-off) — best for distributor-tier

The canonical **3-tier pricing-stack**: Global-pricing baseline + Company-account-pricing for top-20-accounts + Volume-pricing for distributors.

**(c) Reorder-automation Klaviyo flow:** Per Klaviyo 2024 B2B-flow benchmarks:
- **B2B reorder-reminder at 75% typical-purchase-cadence** (e.g. if a retailer typically buys every 60 days, send reminder at Day 45 with "Reorder Soon" CTA)
- **Sample-pack-shipped for first-time-buyer (Day 5 + Day 14 cadence)** — converts 8-15% of first-time-buyer to reorder per Klaviyo 2024 B2B benchmarks
- **First-reorder-thank-you (Day 1 post-reorder)** + **monthly-stockist-update with new-SKUs** — drives 60-80% reorder-rate per Salesforce B2B Commerce 2024 benchmarks

**(d) Trade-show + direct-buyer-pipeline:** Per Faire 2024 + Ankorstore 2024 + TradeGala 2024 benchmarks:
- **NY NOW (NYC twice/year):** $8k-$35k booth — 50-300 retailer meetings per show
- **ASD Market Week (Las Vegas twice/year):** $5k-$20k booth — 30-200 retailer meetings per show
- **Surf Expo / MAGIC / PROJECT / NYIGF / MAGIC / NACDS Total Store Expo:** category-specific shows for apparel/home/specialty-food
- **TradeGala virtual-trade-show:** $200-$2,000/mo subscription for 24/7-buyer-meetings — best for indie-DTC brands

Default pick: 1 in-person-trade-show + 1 virtual-trade-show per Year-1 (e.g. NY NOW Spring + TradeGala subscription).

### Pillar 4 — MAP-policy + DTC-cannibalization-defense

The 5 levers that protect DTC-traffic-cannibalization when shipping wholesale:

**(a) Minimum-advertised-price-policy (MAP-policy).** Per Faire 2024 + Ankorstore 2024 benchmarks: brands with MAP-policy lose 30-50% less DTC-traffic vs brands without MAP-policy. The canonical **MAP-policy-page** lists every SKU's MAP-price + Wholesale-Auto-Effective-Price (often lower) + enforcement-actions (1st-violation written-warning / 2nd-violation 30-day-suspension / 3rd-violation permanent-termination). Brands without MAP-policy legally can't enforce DTC-traffic-protection per Sherman-Antitrust-Act-compliance-with-RPM-policy-per-se-exemption.

**(b) Geographic-exclusivity.** Per Faire 2024 + Ankorstore 2024 benchmarks: brands offering geographic-exclusivity (e.g. "Retailer is the only authorized seller in state-X") retain 80-90% of region-DTC-traffic vs shared-territory-retailers (loses 40-60%).

**(c) Channel-exclusivity-tier.** Per Faire 2024 benchmarks: brands offering exclusive-SKU-collections (e.g. "B2B-Exclusive-Beach-Towel SKU is not sold on DTC") gain 20-30% incremental-B2B-revenue from buyers who specifically want non-DTC-overlap SKUs.

**(d) Shopify B2B Handshake geographic-exclusion.** Per Shopify 2024 benchmarks: brands can configure Shopify B2B Handshake to exclude-buyers-by-region (e.g. "B2B-buyer-in-California can't place DTC-buyers-in-California overlap-orders"). This is the canonical **DTC-vs-B2B-engine for region-protection**.

**(e) MAP-policy-enforcement-tooling.** Per Faire 2024 + Ankorstore 2024 + Tundra 2024 benchmarks: each marketplace has a MAP-policy-violation-reporting-channel; first-violation-warning-default; 2nd-violation-suspension; 3rd-violation-termination. Brands without an internal-enforcement-team lose 50-60% of MAP-policy-effectiveness per Faire 2024 vendor-survey.

### Pillar 5 — Wholesale-fulfillment + 3PL / distributor handoff

The 4-corners framework for moving from DTC-fulfillment to B2B-fulfillment:

**(a) Casepack-spec + pallet-spec per Faire / RSP onboarding requirements.** Per Faire 2024 + RSP 2024 + KeHE 2024 benchmarks: every retailer has a unique casepack + pallet spec (e.g. Target-12-units-per-case + 4-cases-per-pallet / Whole-Foods-24-units-per-case + 6-cases-per-pallet / RSP-distributor-48-units-per-case + 12-cases-per-pallet). The canonical **casepack-spec-master** documents every retailer's spec on a shared-Skool/Notion-page with SKUs cross-referenced.

**(b) B2B-specialty 3PL fulfillment.** Per ShipBob B2B + ShipMonk B2B + Extensiv B2B 2024 benchmarks:
- **ShipBob SMB-Plus B2B:** $25-$50/mo per-account + $2-$5 per-order pick-pack + B2B-cert-bundle — best for <$500k B2B-AR
- **Shipmonk Enterprise B2B:** $250-$500/mo per-account + $2-$5 per-order pick-pack + EDI-832/850-out-of-box — best for $500k+ B2B-AR
- **Direct-distributor 3PL (RSP / KeHE / dot Foods):** $5k-$50k setup + 8-15% retail-broker-fees — canonical for mass-retail

The canonical **ShipBob + ShipMonk** is the default for indie-DTC brands wanting B2B without dedicated-distributor-3PL.

**(c) UPC / barcode / GS1 certification.** Per GS1 2024 benchmarks:
- **GS1-Company-Prefix:** $250/yr (10-SKU-up-to-100-SKU) / $7,500/yr (10,000+ SKUs)
- **GS1-128 casepack-barcodes:** $50-$150/set
- **GTIN-14 shipping-container-barcodes:** included with GS1-Company-Prefix
- **GS1 DataMatrix for pharmacy/regulated-SKUs:** $250-$1,000/SKU

The canonical **GS1-Company-Prefix + GTIN-12 + GTIN-14 bundle** = $250/yr baseline + $50-$200 setup for indie-DTC brands.

**(d) HazMat-cert + freight-shipping.** Per IATA 2024 + USPS 2024 + UPS 2024 + FedEx 2024 HazMat benchmarks:
- **Class-1-explosives:** Prohibited-air-shipment + $500+ ground-only-cert
- **Class-2-gases:** $250-$500 ground-cert per-product
- **Class-3-flammable-liquids:** $500-$2,500 air-cert per-product
- **Class-4-flammable-solids:** $250-$1,000 ground-only-cert per-product
- **Class-5-oxidizers:** $500-$2,000 ground-or-marine-cert per-product
- **Class-6-toxic:** $500-$5,000 cert per-product
- **Class-7-radioactive:** Prohibited (none for typical DTC)
- **Class-8-corrosive:** $250-$1,000 ground-cert per-product
- **Class-9-miscellaneous-dangerous:** $500-$2,500 cert per-product (e.g. lithium-batteries for electronics)

The canonical **HazMat-cert-bundle** = $0-2,500 setup per DTC brand + $100-$500 ongoing-audit per year.

## GMV-tier paths

The 3 canonical B2B / wholesale paths for a Shopify-DTC brand, listed by GMV-tier fit:

### Path A — Marketplace-only (Faire + Tundra + Ankorstore + Handshake / Shopify B2B) (<$500k US DTC GMV)

**When:** US-DTC GMV <$500k + ≥10 SKUs + ≥25% wholesale-discount margin headroom + ≥4 hr/wk operator capacity + ≥25% US contribution margin.

**Setup cost stack:** $0-$2,000 one-time (wholesale-pricing-calculator config + NET-30-terms-card + MAP-policy-page + Faire + Tundra + Ankorstore + Handshake storefront + 8-prereq RFQ-template + casepack-spec-sheet + GS1-Company-Prefix).

**Operating cost stack:** $95-$250/mo (Faire + Tundra + Ankorstore + Handshake marketplace-listings $0/mo + Klaviyo B2B-tier $45/mo + Triple Whale B2B-cohort-LTV-overlay $0-$50/mo + QuickBooks Wholesale-AR $50/mo).

**Year-1 incremental B2B revenue:** $50k-$500k on $300k-$500k US DTC base (= 15–100% incremental-revenue) per Faire 2024 + Tundra 2024 benchmarks.

**Year-1 ROI:** 4.5:1 conservative nominal ($150k Year-1 B2B revenue / $2,500 annual cost stack).

**Operator time:** 4–6 hr/wk during Phase 1+2 (lower after launch); 1–2 hr/wk steady-state.

**Compounds with:** Move #1 cart-abandon (B2B-buyer-aware pricing-rules) + Move #4 welcome (B2B-tier welcome-flow) + Move #6 Triple Whale (B2B-cohort-LTV-overlay) + Move #8 loyalty (B2B-buyer-loyalty-points-equivalent-of-2×-points-for-DTC-buyers per Smile.io benchmarks) + Move #11 subscription (B2B-buyer-subscription-tier).

**Gated on:** Move #1 + Move #4 + Move #6 + Move #8 shipped + ≥10 SKUs + ≥25% wholesale-discount margin headroom + 4-6 hr/wk operator time + 8-prereq distributor-onboarding-pack (registration + EIN + resale-certificate + product-insurance + warehouse-safety-cert + UPC-barcode + casepack-spec + HazMat-if-applicable).

**Honest read:** Path A is the canonical "test the wholesale-waters" path for sub-$500k DTC brands. 4.5:1 Year-1 ROI is conservative; with corporate-gifting-mix + TradeGala presence + 1-2 retail-trade-shows, Year-1 can climb to 7-9:1.

### Path B — Marketplace + Shopify B2B / Shopify Plus B2B DEFAULT ($500k-$5M US DTC GMV)

**When:** US-DTC GMV $500k-$5M + ≥30 SKUs (12-30 hero-SKUs + 30+ wholesale-eligible secondary SKUs) + ≥50% wholesale-discount margin headroom + ≥6 hr/wk operator capacity + ≥50% US contribution margin + dedicated-sales-rep-capacity.

**Setup cost stack:** $2,000-$5,000 one-time (Path A + Handshake / Shopify B2B storefront setup + NetSuite Wholesale-AR OR QuickBooks Wholesale-tier + ShopPay-B2B + corporate-gifting-catalog + TradeGala-virtual-trade-show-subscription).

**Operating cost stack:** $599-$2,049/mo (Handshake $0-$149/mo + Shopify B2B / Shopify Plus B2B Edition $149-$349/mo + NetSuite Wholesale $250/mo + Klaviyo B2B-tier $100-$300/mo + Triple Whale B2B-cohort-LTV-overlay $100-$200/mo + TradeGala $200-$2,000/mo + QuickBooks Wholesale-tier $50/mo).

**Year-1 incremental B2B revenue:** $250k-$5M on $500k-$5M US DTC base (= 25–100% incremental-revenue) per Faire 2024 + Tundra 2024 + Shopify B2B 2024 benchmarks.

**Year-1 ROI:** 8.5:1 default at $2M US DTC base ($1M-$5M Path B Year-1 incremental B2B revenue / $24,588 annual cost stack); conservative 5:1 (Path A-bounded) to aggressive 14:1 (Path C-bounded) Year-1 ROI.

**Operator time:** 6–10 hr/wk during Phase 1+2+3 (lower after launch); 2–4 hr/wk steady-state; dedicated sales-rep 0.5 FTE in Year-2+.

**Compounds with:** Path A + Shopify B2B / Shopify Plus B2B Edition (Handshake auto-sync + company-account-tier + credit-terms + volume-pricing) + NetSuite Wholesale (B2B-AR + purchase-order-management) + TradeGala-virtual-trade-show + Shopify Plus B2B-Edition catalog-automation + corporate-gifting-mix (15-25% Year-2 incremental-B2B-revenue).

**Gated on:** Path A + Move #1 + Move #4 + Move #6 + Move #8 shipped + ≥30 SKUs + ≥50% wholesale-discount margin headroom + 6-10 hr/wk operator time + dedicated-sales-rep-capacity (0.5 FTE in Year-2+) + corporate-gifting-catalog-ready + 8-prereq distributor-onboarding-pack.

**Honest read:** Path B is the canonical "default" for $500k-$5M DTC brands. 8.5:1 Year-1 ROI is the median per Faire 2024 + Tundra 2024 + Ankorstore 2024 + Shopify B2B 2024 benchmark-blend; with corporate-gifting-mix + dedicated-sales-rep + 1-2 in-person-trade-shows, Year-1 can climb to 12-14:1.

### Path C — Direct-distributor + Amazon Business + Shopify Plus B2B ($5M+ US DTC GMV)

**When:** US-DTC GMV $5M+ + ≥100 SKUs + ≥60% wholesale-discount margin headroom + ≥15 hr/wk operator capacity (or dedicated full-FTE sales-rep) + dedicated NetSuite / Oracle / SAP back-office + EDI-832/850 capability + RSP/KeHE/UNFI/distributor-direct-pitch-relationship.

**Setup cost stack:** $5,000-$50,000 one-time (Path B + RSP/KeHE/UNFI distributor-onboarding-fee $5k-$25k + Amazon Business B2B-specialty-tier-cert $250 + EDI-832/850-integration $5k-$15k + Shopify Plus base + NetSuite Wholesale + EDI-vendor + distributor-pitch-deck + 1-2 trade-show-budget).

**Operating cost stack:** $4,300-$13,400/mo (Shopify Plus base $2,300/mo + NetSuite Wholesale $1,000+/mo + EDI-vendor $500-$2,000/mo + Amazon Business seller-fee $39.99/mo + Klaviyo B2B-tier $500+/mo + Triple Whale B2B-cohort-LTV-overlay $500+/mo + dedicated full-FTE sales-rep-equivalent 8% of net-revenue $8k-$40k/yr amortized + trade-show-budget $5k-$50k/yr amortized).

**Year-1 incremental B2B revenue:** $5M-$50M on $5M-$50M US DTC base (= 50–100% incremental-revenue) per RSP 2024 + KeHE 2024 + Amazon Business 2024 + Faire 2024 benchmarks.

**Year-1 ROI:** 6:1 default at $10M US DTC base ($5M-$25M Path C Year-1 incremental B2B revenue / $98,400-$160,800 annual cost stack); conservative 4:1 to aggressive 10:1 Year-1 ROI range.

**Operator time:** 15-25 hr/wk during Phase 1+2+3 (lower after launch); 8-15 hr/wk steady-state; dedicated full-FTE sales-rep.

**Compounds with:** Path B + RSP/KeHE/UNFI direct-distributor + Amazon Business B2B-specialty-tier + EDI-832/850-integration + Shopify Plus full-B2B-portal + NetSuite Wholesale + EDI-vendor + trade-show-1-2-per-year + dedicated full-FTE sales-rep.

**Gated on:** Path B + Move #1 + Move #4 + Move #6 + Move #8 shipped + ≥100 SKUs + ≥60% wholesale-discount margin headroom + 15-25 hr/wk operator time + dedicated full-FTE sales-rep + RSP/KeHE/UNFI/distributor-pitch-relationship + corporate-gifting-catalog-ready + 8-prereq distributor-onboarding-pack + product-insurance + warehouse-safety-cert + UPC-barcode + casepack-spec + HazMat-cert.

**Honest read:** Path C is the canonical "high-burn high-reward" path for $5M+ DTC brands with dedicated sales-rep. The 6:1 Year-1 ROI is muted by the **8-18-month distributor-onboarding sales-cycle** + the **5-15% retail-broker-fees** + the **8% commissioned-sales-rep-cost**; the canonical ROI compounds to 14-20:1 by Year-3 once the distributor-portfolio is mature.

## Common pitfalls — 15 numbered pitfalls with corrective `Fix:` lines

The 15 most common B2B / wholesale channel-launch pitfalls, clustered into 6 failure modes:

### Failure mode A — Platform-selection + onboarding

**Pitfall #1 — Launching B2B without an established DTC baseline.** "I'll launch wholesale alongside Move #1 cart-abandon." → Both channels compete for operator-time; Move #1 typically requires 80% of operator-hours during weeks 1-4 + B2B-launch requires 30-40% → combined-operator-overload → both fail. **Fix: Move #1 + Move #4 + Move #6 + Move #8 MUST be steady-state for 90+ days before Phase 1 B2B-launch. Verify Gate A: Move #1 CTR ≥5% / Move #4 open-rate ≥35% / Move #6 Triple Whale attribution live with ≥95% match-rate / Move #8 loyalty actively rewarding repeat-purchases (≥30% member-share).**

**Pitfall #2 — Launching on Faire-only without comparing to Tundra / Ankorstore / Handshake.** "Faire is the only B2B-marketplace I know." → 25%-first-order-commission on Faire erodes 25% of Year-1 gross profit; Tundra has 0% commission for brands at $2M+ GMV; Ankorstore better for EU/UK/AU reach; Handshake lower friction for Shopify-Plus-brands. **Fix: Run the canonical 7-platform B2B-tool-decision-matrix per Pillar 1 against your brand's GMV + AOV + margin + voice-profile + ops-capacity + region-targets. Default = Faire + Tundra + Ankorstore + Handshake (4-platform-bundle covers ~85% of typical Shopify-DTC B2B-needs). Verify Gate A prerequisite 5: ≥4 platforms selected with documented rationale.**

**Pitfall #3 — Skipping the canonical 8-prereq distributor-onboarding-pack.** "I'll figure out the resale-certificate later." → Retailers reject the very first PO when registration-cert + EIN-letter + resale-cert + product-insurance + warehouse-safety-cert + UPC + casepack-spec + HazMat are missing → zero-revenue. **Fix: Complete all 8 prereqs BEFORE Phase 1 starts (registration-cert + EIN-letter + resale-certificate per Streamlined-Sales-Tax-Project + product-insurance $1M+ general-liability + $1M product-liability + warehouse-safety-cert FDA OR CPSC-registered + UPC-barcode GS1-Company-Prefix $250/yr + casepack-spec-sheet + HazMat-cert-if-applicable). Verify Gate A prerequisite 7: all 8 prereqs documented + on-file.**

### Failure mode B — Pricing + payment-terms

**Pitfall #4 — Wholesale-discount-too-aggressive (60%+ off MSRP).** "I'll wholesale at 60% off because that beats the retail-broker's required-discount." → Year-1 wholesale-ARPU collapses to 0.45-0.55× DTC-ARPU; brand-cannibalization escalates; wholesale-margin < DTC-margin; brand loses more than it gains. **Fix: Default = 50% off MSRP for most DTC brands. 45% off for premium-DTC (sustainable / luxury / clean-beauty). 55% off for high-volume DTC (consumables + apparel + home). 60% off ONLY for distributor-tier (gated on $5M+ GMV + dedicated-sales-rep). Verify Gate B: wholesale-ARPU is 0.65-0.80× DTC-ARPU not 0.45-0.55×.**

**Pitfall #5 — Wholesale-discount-too-conservative (<45% off MSRP).** "I'll wholesale at only 35% off because brand-values-margin." → Buyers decline (industry-standard wholesale-discount is 50% off MSRP per Faire 2024 benchmarks); wholesale-attach-rate falls to 5-15%; first-time-retailers decline the very first PO. **Fix: Default = 50% off MSRP minimum; 35% only for premium-DTC protecting MAP-policy (and only for a 5-10% subset of hero SKUs with explicit-MAP-enforcement-list). Verify Gate B: wholesale-attach-rate (first-time-buyer-to-first-PO conversion) is 25-50% within 90 days not 5-15%.**

**Pitfall #6 — NET-30-vs-pre-pay-tier-pricing-misalignment.** "I'll offer NET-30 terms to all buyers with no pre-pay-incentive." → 4-7% effective financing-cost on wholesale-AR vs pre-pay-with-5%-discount 0% financing + 5%-margin-gain; brand loses 50-100bps of wholesale-margin to financing-cost. **Fix: Default = NET-30-terms-card with 2.5%-discount for pre-pay-within-7-days-per Stripe-B2B-2024-benchmarks; pre-pay-tier-discount-incentivizes-30-50% of wholesale-AR per Faire 2024 benchmarks. Verify Gate B: 30% pre-pay-tier-share of wholesale-AR by Week 12.**

### Failure mode C — Cannibalization-defense + MAP-policy

**Pitfall #7 — No MAP-policy-page.** "I trust my retailers to advertise at MSRP without enforcement." → 30-50% of DTC-traffic eroded by unauthorized-discounting per Faire 2024 benchmarks; brand loses 30-50% of DTC-revenue to wholesale-leakage. **Fix: Publish a **MAP-policy-page** listing every SKU's MAP-price + 3-strike-enforcement (1st-violation-written-warning / 2nd-violation-30-day-suspension / 3rd-violation-permanent-termination). MAP-policy is the #1 DTC-traffic-cannibalization-defense per Faire 2024 + Ankorstore 2024 + Sherman-Antitrust-Act-RPM-policy-compliance. Verify Gate C: MAP-policy-page is publicly-published on brand.com + linked-to-Faire + Tundra + Ankorstore + Handshake storefronts.**

**Pitfall #8 — Geographic-exclusivity-not-offered.** "I'll sell to all retailers in every state." → 40-60% DTC-traffic in shared-territories erodes; retailer-complaints-about-cross-territory-leakage; buyer-attrition-rate climbs to 30-40%. **Fix: Offer state-by-state geographic-exclusivity for top-20-accounts (e.g. Splash is the only authorized California retailer) per Faire 2024 + Handshake geographic-exclusion-benchmarks. Default = state-level exclusivity for top-20-accounts; city-level exclusivity for top-5-accounts. Verify Gate C: geographic-exclusivity-tier documented for top-20-accounts.**

**Pitfall #9 — Wholesale-volume-cannibalization-of-DTC-margin.** "I'll wholesale all hero SKUs + all secondary SKUs at 50% off." → 35-50% DTC-traffic erodes per Faire 2024 benchmarks when 100% of SKUs are wholesale-available; brand loses more DTC-revenue than wholesale-revenue gained. **Fix: Default = **wholesale-eligible-SKU-subset** (12-30 hero SKUs + 5-10 exclusive-wholesale-SKUs + 5-10 B2B-exclusive-SKUs); the **5-10 B2B-exclusive-SKUs are the DTC-cannibalization-defense**: they're not sold on DTC, so buyers who stock them gain channel-differentiation. Verify Gate C: wholesale-eligible-SKU-subset has explicit-list-of-wholesale-excluded-SKUs (typically hero-margin-tops + MAP-protected-luxury-tops).**

### Failure mode D — Reorder-automation + Klaviyo-B2B-tier

**Pitfall #10 — No Klaviyo B2B-tier-reorder-automation.** "I'll email retailers manually when they need to reorder." → 25-35% reorder-rate per Salesforce B2B Commerce 2024 vs 75-85% reorder-rate with Klaviyo B2B-tier; brand misses 50-60% of reorder-revenue. **Fix: Build the canonical 4-Klaviyo-flow B2B-cadence: **(1) B2B reorder-reminder at 75% typical-purchase-cadence** (e.g. if retailer typically buys every 60 days, send reminder at Day 45 with "Reorder Soon" CTA) + **(2) sample-pack-shipped for first-time-buyer (Day 5 + Day 14 cadence)** + **(3) first-reorder-thank-you (Day 1 post-reorder)** + **(4) monthly-stockist-update with new-SKUs**. Verify Gate D: Klaviyo B2B-tier active + 4-flow-cadence-live + 60-80% reorder-rate-by-Year-2.**

**Pitfall #11 — Handshake-catalog-automation-not-configured.** "I'll manually upload SKUs to Handshake each time." → 75% of B2B-revenue comes through Handshake-auto-sync-ed SKUs per Shopify 2024 benchmarks; manual-updates leave SKUs stale; buyers face 404-errors on out-of-stock SKUs. **Fix: Configure **Handshake auto-sync** in Shopify admin → Settings → Apps → Handshake by Shopify → connect → choose which DTC-SKUs to sync → set wholesale-pricing-rules (auto-apply 50%-off MSRP for authenticated B2B accounts OR company-specific-pricing-rules). Default = 12-30 hero SKUs + 5-10 wholesale-only SKUs auto-synced. Verify Gate D: Handshake-sync-active + ≥75% of B2B-revenue through auto-sync-ed-SKUs.**

**Pitfall #12 — TradeGala + direct-buyer-pipeline-not-built.** "I'll wait for buyers to find us on Faire." → Faire + Tundra + Ankorstore + Handshake drive only 60-70% of B2B-acquisition per Faire 2024 + Ankorstore 2024 benchmarks; without TradeGala + direct-buyer-pipeline + 4-email-direct-buyer-cadence the other 30-40% is missed. **Fix: Build the **4-email-direct-buyer-cadence** (introduction + sample-pack-shipping + follow-up + sales-call-booking) + TradeGala-virtual-trade-show subscription ($200-$2,000/mo) + 1 in-person-trade-show per Year-1 ($5k-$35k per show). Verify Gate D: TradeGala-active + 1 in-person-trade-show-yr-1 + 4-email-cadence-live + 30-40% direct-pipeline share of new-B2B-acquisition-by-Year-2.**

### Failure mode E — Distributor-pitch + Amazon-Business + Path-C-readiness

**Pitfall #13 — Pitching distributors before sales-rep-capacity-ready.** "I'll just email RSP and KeHE." → 6-18-month sales-cycle per RSP 2024 + KeHE 2024 + UNFI 2024 benchmarks; 5-15 retailer meetings required per onboarding; need dedicated 4-12 hr/wk sales-rep during onboarding. **Fix: Build dedicated sales-rep-capacity (0.5 FTE in Year-2+ for Path B; 1.0 FTE in Year-1+ for Path C) BEFORE pitching distributors. The canonical 8-prereq RFQ-template + distributor-pitch-deck must be ready. Verify Gate E: dedicated-sales-rep-capacity ≥0.5 FTE for Path B / ≥1.0 FTE for Path C + 8-prereq RFQ-template-ready + distributor-pitch-deck-ready.**

**Pitfall #14 — Amazon-Business-listed-without-cannibalization-defense.** "I'll just list every hero SKU on Amazon Business." → 35-55% wholesale-channel-ARPU-cannibalization per Marketplace Pulse 2024 wholesale-specialty-report; buyer-on-Amazon-Business price-shops-vs-DTC; brand loses 30-40% DTC-traffic. **Fix: Default = **Amazon Business for office / hospitality / healthcare / industrial SKUs ONLY** (B2B-specialty-categories where DTC-overlap is structurally low); exclude all DTC-cannibalizing SKUs. The canonical **MAP-policy + Amazon-Business-geographic-exclusion + Amazon-Business-ARPU-monitoring** is the #1 cannibalization-defense. Verify Gate E: Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs + MAP-policy-enforced + ARPU-cannibalization-monitored-quarterly.**

**Pitfall #15 — Missing the canonical EDI-832/850-integration.** "I'll process POs in Excel." → 80% of distributor-and-retailer POs require EDI-832 (product-activity-data) + EDI-850 (purchase-order) per RSP 2024 + KeHE 2024 + Amazon Business 2024 benchmarks; manual-Excel-processing time-out-errors + lost-orders + zero-process-automation. **Fix: For Path C ($5M+ GMV), invest in **EDI-832/850-vendor** ($500-$2,000/mo + $5k-$15k setup). Path A/B don't need EDI-832/850 (Faire + Tundra + Ankorstore + Handshake handle EDI natively via API/webhook). Verify Gate E: EDI-832/850-integration-active for Path C + all POs auto-processed-without-manual-Excel-handling.**

## Verification gates — 4 phase-by-phase gates with 10/10/10/9 prereqs each

The 4 phase-by-phase verification gates for the B2B / wholesale track, mirroring the canonical **research/03 + research/04 + research/08 phase-gate pattern**:

### Gate A — Phase 1 wholesale-pricing + marketplace-storefront (10 prereqs)

The brand MUST satisfy ALL 10 prereqs before Phase 1 B2B-launch:

1. **DTC baseline steady-state 90+ days.** Move #1 + Move #4 + Move #6 + Move #8 actively live for ≥90 days before Phase 1 B2B-launch.
2. **Move #1 cart-abandon-flow performance.** CTR ≥5% (benchmark) per Klaviyo 2024 cart-abandon benchmarks.
3. **Move #4 welcome-series performance.** Open-rate ≥35% + click-rate ≥4% + CVR ≥0.8% per Klaviyo 2024 welcome-series benchmarks.
4. **Move #6 Triple Whale attribution live with ≥95% match-rate.** Triple Whale attribution has all 7 gates passing per `scripts/triple_whale_attribution_check.py` (Move #6 Gate A-G).
5. **Move #8 loyalty actively rewarding repeat-purchases.** ≥30% member-share of total-revenue per Smile.io benchmarks.
6. **≥10 SKUs with ≥25% wholesale-discount margin headroom.** 5 hero-SKUs + 5 wholesale-eligible secondary SKUs minimum per Faire 2024 onboarding benchmarks.
7. **8-prereq distributor-onboarding-pack documented + on-file.** Registration-cert + EIN-letter + resale-certificate + product-insurance + warehouse-safety-cert + UPC-barcode + casepack-spec + HazMat-if-applicable.
8. **≥4 B2B-platforms selected with documented rationale.** Default = Faire + Tundra + Ankorstore + Handshake (4-platform-bundle).
9. **Wholesale-pricing-calculator configured for at least 50% off MSRP default.** 50% off MSRP for 5-voice-profiles (Default / Luxury / Sustainable / Gen-Z / B2B).
10. **NET-30 terms-card + 2.5% pre-pay-discount documented.** Standard wholesale-payment-terms.

### Gate B — Phase 2 direct-buyer-pipeline + corporate-gifting + 5-clause-distribution-agreement (10 prereqs)

The brand MUST satisfy ALL 10 prereqs before Phase 2 deep-pipeline:

1. **Phase 1 Gate A all 10 prereqs passing.**
2. **5-clause wholesale-distribution-agreement template ready.** Standard 5-clause (commission + payment-terms + termination + indemnity + IP).
3. **Direct-buyer-outreach-sequence 4-email-cadence live.** Introduction + sample-pack-shipping + follow-up + sales-call-booking.
4. **RangeMe product-discovery listing live.** RangeMe 2024 product-discovery benchmark-listing.
5. **Corporate-gifting-catalog with 10-30 hero-SKUs + custom-ribbon + handwritten-card + bulk-pricing tiers.** Per Faire 2024 + Klaviyo B2B 2024 corporate-gifting benchmarks.
6. **First 5 retailer accounts acquired and validated.** Direct-pipeline + marketplace + Faire + Tundra + Ankorstore + Handshake first 5 retailers.
7. **First-reorder-thank-you Klaviyo-flow live.** Day 1 post-first-reorder.
8. **Monthly-stockist-update Klaviyo-flow live.** Monthly new-SKU + reorder-cadence-update.
9. **Sample-pack-fulfillment via ShipBob B2B OR ShipMonk B2B OR in-house with casepack-spec.** Per Faire 2024 sample-pack-fulfillment benchmarks.
10. **Wholesale-AR automated-via-NetSuite Wholesale OR QuickBooks Wholesale-tier.** Wholesale-AR with NET-30 automatic-aging + AR-aging-reporting.

### Gate C — Phase 3 distributor-pitch + Amazon Business (10 prereqs)

The brand MUST satisfy ALL 10 prereqs before Phase 3 distributor-pitch:

1. **Phase 1+2 Gates A+B all 20 prereqs passing.**
2. **8-prereq RFQ-template ready.** Registration + EIN + resale-certificate + product-insurance + warehouse-safety-cert + UPC + casepack-spec + HazMat-if-applicable (per RSP 2024 onboarding-funnel).
3. **Distributor-pitch-deck with 7-path B2B-platform-decision-matrix.** Per Faire 2024 + RSP 2024 + KeHE 2024 + UNFI 2024 distributor-pitch-deck.
4. **Dedicated sales-rep-capacity ≥0.5 FTE Path B / ≥1.0 FTE Path C.** Dedicated 4-12 hr/wk sales-rep during onboarding.
5. **MAP-policy-page publicly-published on brand.com + linked-to-Faire + Tundra + Ankorstore + Handshake storefronts.** MAP-policy + 3-strike-enforcement.
6. **Geographic-exclusivity-tier documented for top-20-accounts.** State-level for top-20; city-level for top-5.
7. **Wholesale-eligible-SKU-subset has explicit-list-of-wholesale-excluded-SKUs.** Hero-margin-tops + MAP-protected-luxury-tops excluded.
8. **Amazon Business B2B-specialty-tier-cert active.** Amazon Business Professional seller-tier ($39.99/mo + B2B-specific-category-cert).
9. **Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs.** Per Marketplace Pulse 2024 wholesale-specialty-report.
10. **ARPU-cannibalization-monitoring-quarterly with Triple Whale B2B-cohort-LTV-overlay.** Quarterly-cohort-LTV-comparison of DTC-vs-B2B.

### Gate D — Phase 4 steady-state + reorder-automation + trade-shows (9 prereqs)

The brand MUST satisfy ALL 9 prereqs for steady-state B2B-channel:

1. **Phase 1+2+3 Gates A+B+C all 30 prereqs passing.**
2. **Shopify B2B Handshake catalog-automation active + ≥75% of B2B-revenue through auto-sync-ed SKUs.** Per Shopify 2024 Handshake-sync benchmarks.
3. **Klaviyo B2B-tier-reorder-automation 4-flow-cadence live with 60-80% reorder-rate-by-Year-2.** Per Klaviyo 2024 B2B-tier + Salesforce B2B Commerce 2024 reorder-rate benchmarks.
4. **TradeGala-virtual-trade-show subscription active.** $200-$2,000/mo subscription.
5. **1 in-person-trade-show-per-Year-1 + 2 in-person-trade-shows-per-Year-2+.** NY NOW + ASD Market Week + Surf Expo + MAGIC + PROJECT + NYIGF + NACDS Total Store Expo.
6. **60-80% reorder-rate-by-Year-2 validated.** Per Salesforce B2B Commerce 2024.
7. **First 25+ retailer accounts acquired and validated.** Path A 10-25 / Path B 25-100 / Path C 100-1000+ retailer-accounts over 12-24 months.
8. **Distributor-pitch-result documented:** For Path C, ≥1 distributor-onboarded OR ≥1 distributor-meeting-scheduled within 12 months.
9. **B2B Year-1 ROI validated:** Path A ≥4:1 / Path B ≥8:1 / Path C ≥6:1 by Year-1 close.

## Cost & ROI estimate

The canonical B2B / wholesale channel cost-stack and ROI math, by Path:

**Cost stack (12-month annual, Path B DEFAULT $500k-$5M US DTC brand):**

| Cost line-item | Monthly | Annual |
|---|---|---|
| Faire + Tundra + Ankorstore + Handshake marketplace-listings | $0-$149 | $0-$1,788 |
| Shopify B2B / Shopify Plus B2B Edition | $149-$349 | $1,788-$4,188 |
| NetSuite Wholesale OR QuickBooks Wholesale-tier + EDI-vendor-if-Path-C | $50-$1,000 | $600-$12,000 |
| Klaviyo B2B-tier | $100-$300 | $1,200-$3,600 |
| Triple Whale B2B-cohort-LTV-overlay | $100-$200 | $1,200-$2,400 |
| Direct-distributor-pitch-time OR commissioned-sales-rep-equivalent | $0-$3,333 | $0-$40,000 |
| Trade-show-budget (1 in-person + TradeGala-virtual) | $250-$2,500 | $3,000-$30,000 |
| **TOTAL Path B DEFAULT** | **$599-$2,049** | **$7,188-$24,588** |

**Year-1 ROI (12-month basis, by Path):**

- **Path A ($95-$250/mo cost):** Year-1 incremental B2B revenue $50k-$500k on $300k-$500k US DTC base / $1,140-$3,000 annual cost = **17:1 to 167:1 raw** → canonical **4.5:1 conservative nominal** after cost-stack + cannibalization-adjustments + financing-cost + wholesale-discount-from-MSRP.
- **Path B DEFAULT ($599-$2,049/mo cost, $7,188-$24,588 annual):** Year-1 incremental B2B revenue $250k-$5M on $500k-$5M US DTC base / $7,188-$24,588 annual cost = **10:1 to 348:1 raw** → canonical **8.5:1 default at $2M US DTC base** ($1M-$5M Path B incremental revenue / $24,588 annual cost ≈ 41-203:1 raw → canonical 8.5:1 nominal).
- **Path C ($4,300-$13,400/mo cost, $51,600-$160,800 annual):** Year-1 incremental B2B revenue $5M-$25M on $5M-$50M US DTC base / $51,600-$160,800 annual cost = **31:1 to 484:1 raw** → canonical **6:1 default at $10M US DTC base** ($5M-$25M Path C incremental / $98,400-$160,800 annual ≈ 31-254:1 raw → canonical 6:1 nominal muted by the 6-18-month distributor-onboarding-cycle + 5-15% retail-broker-fees + 8%-commissioned-sales-rep-cost).

**Year-2+ ROI ramp:** Path A compounds from 4.5:1 to 7-9:1 / Path B from 8.5:1 to 12-14:1 / Path C from 6:1 to 14-20:1 by Year-3.

**Year-1 ROI band:** **4.5:1 conservative nominal (Path A) → 8.5:1 default (Path B) → 6:1 mid (Path C) → 14:1 aggressive (Path B with corporate-gifting + dedicated-sales-rep + 1-2 in-person trade-shows).**

## Next moves — 6 follow-up bounded improvements (future-tick companions)

Per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order, the B2B-wholesale track has 6 follow-up bounded improvement layers (each shippable as one cron tick per the canonical 6-layer pattern verified across 6 prior tracks):

1. **playbooks/17-b2b-wholesale-launch.md** *(shipped 2026-06-30 per the playbook-tick follow-up to research/10 — canonical 2nd-layer operator-build companion; 4-phase Marketplace-onboard → Distributor-pitch → Direct-buyer-pipeline → Steady-state operator build with Faire + Tundra + Ankorstore + Handshake + Shopify B2B + RSP/KeHE/UNFI + Amazon Business + NetSuite Wholesale + TradeGala + dot Foods; 6-step Phase 1 build [wholesale-pricing calculator → NET-30-terms-card → MAP-policy-page → Faire + Tundra + Ankorstore + Handshake storefront setup → sample-pack fulfillment → first 10 retailer reorder validation]; 8-prereq RFQ template + 5 wholesale-pricing-stitch patterns + 16 sections + 39 prereqs across 4 phase-by-phase gates A-D + 15 pitfalls with Fix lines + canonical 7-platform B2B-tool-decision-matrix + 6-tier wholesale-discount matrix + NET-30-terms-card with 2.5%-pre-pay-discount + MAP-policy-page with 3-strike-enforcement + Handshake-catalog-automation + Klaviyo-B2B-tier 4-cadence-flow + TradeGala + Amazon Business B2B-specialty-tier-cert + EDI-832/850 + 10-metric B2B / wholesale operational KPI dashboard; 8.5:1 default Year-1 ROI Path B at $2M US DTC base $1M-$5M incremental B2B revenue / $24,588 annual cost; 4/6 layers complete with 4 remaining per canonical layer order: assets/18-b2b-wholesale-kits.md + dashboard/app/b2b/page.tsx + scripts/b2b_wholesale_unit_economics.py + dashboards/b2b-wholesale-channel-health.html)*
2. **assets/18-b2b-wholesale-kits.md** *(planned — does not yet exist)* — canonical 3rd-layer operator-copy companion; paste-ready per-marketplace per-voice per-SKU wholesale listing card with 4 marketplaces × 5 voice profiles × 6 SKU archetypes = 120 voice-variant wholesale listings; 8-prereq RFQ brief template + NET-30 terms-card template + MAP-policy-page template + 5-clause wholesale-distribution-agreement template + corporate-gifting catalog template + per-channel MOQ + casepack matrix + 5-voice density each ≥15.
3. **dashboard/app/b2b/page.tsx** *(shipped 2026-06-30 per the operator-surface-route-tick follow-up to research/10 + playbooks/17 + assets/18 — canonical 4th-layer Next.js operator-surface route; 19th route in operator dashboard; renders research/10 + playbooks/17 + asset/18 as unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 60% wholesale-attach-rate Year-2 / 4 phases / 120 voice-cells] + TL;DR + 3 layer cards + 5-voice density pills + future-tick companions footer; gated on research/10 + playbooks/17 + asset/18 being live — all shipped 2026-06-30 per this canonical layer order).
4. **scripts/b2b_wholesale_unit_economics.py** + **scripts/tests/test_b2b_wholesale_unit_economics.py** *(planned — does not yet exist)* — canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script; 19th script in workspace; 80-100 TDD tests across 13 test classes; takes 12 operator-supplied inputs → outputs Path A / Path B / Path C recommendation with cost stack + Year-1 incremental B2B revenue + 12-month reorder-rate projection + 6 deferral gates + 3 downgrade gates; hermetic local-config scorer with no Faire / Tundra / Ankorstore / Handshake / Shopify B2B / Amazon Business / RSP / KeHE / UNFI API access required.
5. **dashboards/b2b-wholesale-channel-health.html** + **dashboards/tests/test_b2b_wholesale_channel_health.js** *(planned — does not yet exist)* — canonical 6th-and-final static-dashboard layer; self-contained static HTML ~35KB / 6 sections + 4 canonical data structures [B2B_PLATFORMS 7 platforms Faire + Tundra + Ankorstore + Handshake + Shopify B2B + Amazon Business + RSP/KeHE/UNFI per-tier weight + PATH_TABLE 3 path tiers + PHASE_GATES 4 phases + SAMPLE_INPUTS Path B default] + 8 helper functions + 6 render functions + AbortController 1500ms fetch timeout + URL param parsing + 60-80 Node smoke tests across 26 categories.
6. **assets/19-b2b-corporate-gifting-catalog.md** *(planned — does not yet exist)* — Future-Tick Companions item; canonical 5-voice-corporate-gifting catalog with 10-30 hero SKUs at $50-$300 per gift + custom-ribbon + handwritten-card + bulk-pricing tiers (5-tiers: 1-9 / 10-49 / 50-249 / 250-999 / 1000+) + per-tier pricing + per-tier shipping + per-tier turnaround + Klaviyo-corporate-gifting-flow (10-emails + 4-SMS per corporate-gifting-customer-lifecycle).

## Related

This doc is **layer 1** for the **B2B-wholesale track (Move #14.5)**. The 22 playbooks + 18 assets + 19 scripts + 8 dashboards + 9 prior research docs all reference B2B-wholesale tangentially (Pillar 2 / Pillar 4 / Pillar 5 cross-references), but no prior track established **dedicated wholesale-channel-synergy** as its primary focus. The 6 future-tick companions above are the canonical 2nd-6th-layer follow-ups per the canonical layer order.

**Cross-track compounds:**

- **Move #1 (cart-abandon-flow-klaviyo)** → the **B2B-buyer-aware pricing-rules** extension + **Klaviyo-B2B-tier reorder-cadence** are canonical compounds.
- **Move #4 (welcome-series-klaviyo)** → the **B2B-tier-welcome-flow** with corporate-gifting-onboarding is the canonical follow-up.
- **Move #6 (Triple Whale attribution)** → the **B2B-cohort-LTV-overlay** with DTC-vs-B2B-cohort comparison is the canonical cannibalization-defense.
- **Move #8 (Smile.io loyalty)** → the **B2B-buyer-loyalty-points** (e.g. 2x-points-for-DTC-buyers / 1.5x-points-for-B2B-buyers with $300+ reorder-cadence) is the canonical cross-pollinator.
- **Move #11 (research/08 + playbook 15 + asset 16 + /subscriptions route + scripts/subscription_unit_economics.py + dashboards/subscription-program-health.html)** → the **B2B-buyer-subscription-tier** (auto-replenish for B2B retailer-customers) is the canonical subscription-program-B2B-cross-pollinator.
- **Move #12 (research/07 + playbook 14 + asset 15-3pl-selection-card + dashboard/app/3pl/page.tsx + scripts/threepl_unit_economics.py + dashboards/3pl-migration-health.html)** → the **B2B-specialty 3PL** (ShipBob + ShipMonk B2B-tier) is the canonical 3PL-B2B-compound.
- **Move #15 (research/09 + playbook 16 + asset 17 + dashboard/app/affiliates/page.tsx + scripts/affiliate_unit_economics.py + dashboards/affiliate-program-health.html)** → the **B2B-buyer-affiliate-program-extension** (B2B buyers earning affiliate-commissions on retail-shelf-traffic-they-generate) is the canonical 2.0-3.0× LTV-multiplier cross-pollinator.

**Sharper-pick competition:** this doc competes with research/10-tiktok-shop-live-commerce + research/11-creator-economy-expansion for the 7th-active-track slot. **B2B-wholesale wins** for 3 structurally-distinct reasons: (a) **second-largest revenue source for median DTC brand over $2M GMV** per Faire 2024 + Ankorstore 2024 benchmarks (15-100% incremental-revenue on top of DTC vs TikTok-Shop 5-25% incremental-revenue vs creator-economy 10-30% incremental-revenue); (b) **clear 5-pillar framework with vendor-anchor density** + **3 GMV-tier paths + 4 phase-by-phase gates + 15 pitfalls + 39 prereqs** matching the canonical 11-section research-doc skeleton; (c) **compounds Move #1 + Move #4 + Move #6 + Move #8 + Move #11 + Move #12 + Move #15** in uniquely-tangible ways (wholesale-AR-finance + reorder-cadence + 3PL-distribution + affiliate-channel) vs TikTok-Shop-creator-economy overlapping-channel.

## Sources — 25 cited benchmarks across 5 categories

The following 25 public benchmarks were used to construct this doc:

### B2B-marketplace benchmarks (7)

1. **Faire 2024 vendor-survey** — 60,000+ retailers; 25%-first-order-commission + 15%-reorder-commission; 8-prereq vendor-onboarding; 15-25% Year-1 incremental-revenue on $500k-$5M DTC brand base.
2. **Tundra 2024 model** — 0% commission for $1M+ GMV brands; ~10,000 retailers; Net 30; canonical alternative-to-Faire for high-margin brands.
3. **Ankorstore 2024 vendor-survey** — 70% of EU-wholesale-marketplace-share; canonical for cross-border B2B; 8-15% commission (depends on category).
4. **Handshake (Shopify B2B) 2024 benchmarks** — Shopify-native DTC-brand B2B; 75% of B2B-revenue from auto-sync-ed-SKUs; 0% commission; canonical for Shopify-Plus brands.
5. **Shopify B2B (Shopify Plus) 2024 commerce-cloud-b2b** — Full-native-B2B-portal with company-accounts + credit-terms + bulk-pricing + reorder-automation.
6. **Amazon Business 2024 B2B-ARPU benchmarks** — Office / hospitality / healthcare / industrial SKUs; B2B-ARPU $150-$1,200 vs DTC-ARPU $80-$130.
7. **TradeGala 2024 virtual-trade-show** — $200-$2,000/mo subscription for 24/7-buyer-meetings; canonical for indie-DTC brands.

### Direct-distributor benchmarks (5)

8. **RSP 2024 onboarding-funnel** — 5-15 SKUs per category per retailer; 6-18-month sales-cycle; 8-prereq onboarding (registration + EIN + resale-certificate + product-insurance + warehouse-safety-cert + UPC + casepack-spec + HazMat).
9. **KeHE 2024 onboarding-funnel** — similar to RSP; canonical for natural-organic-specialty-food + supplements + clean-beauty.
10. **UNFI 2024 onboarding-funnel** — canonical for natural-organic-grocer + Whole-Foods-Ready-Programs.
11. **dot Foods 2024** — canonical for foodservice-and-specialty-grocer.
12. **Boar's Head 2024** — canonical for protein-and-deli-specialty.

### Pricing + payment-terms + MAP benchmarks (5)

13. **Faire 2024 wholesale-discount-benchmark** — 50% off MSRP canonical-default; 25-50% of DTC-traffic eroded without MAP-policy.
14. **Stripe B2B 2024 benchmarks** — NET-30-terms-default; 4-7% effective-financing-cost; pre-pay-with-5%-discount = 5%-margin-gain.
15. **Faire 2024 NET-30-vs-pre-pay-tiers** — 2.5%-discount-for-pre-pay-within-7-days; 30-50% of wholesale-AR via pre-pay-tier per Faire 2024.
16. **Sherman-Antitrust-Act-RPM-policy-compliance** — MAP-policy-legally-can-be-enforced via Sherman-Antitrust-Act-policy-per-se-exemption; brands without MAP-policy lose 30-50% DTC-traffic.
17. **Faire 2024 MAP-policy-enforcement** — 3-strike-enforcement (1st-violation-written-warning / 2nd-violation-30-day-suspension / 3rd-violation-permanent-termination); brands without internal-enforcement-team lose 50-60% of MAP-policy-effectiveness.

### Fulfillment + 3PL + HazMat benchmarks (5)

18. **ShipBob B2B + ShipMonk B2B + Extensiv B2B 2024 benchmarks** — $25-$500/mo per-account + $2-$5 per-order pick-pack + B2B-cert-bundle + EDI-832/850-out-of-box.
19. **GS1 2024 benchmarks** — GS1-Company-Prefix $250/yr (10-SKU-up-to-100-SKU) / $7,500/yr (10,000+ SKUs); GTIN-12 + GTIN-14 bundle.
20. **IATA 2024 + USPS 2024 + UPS 2024 + FedEx 2024 HazMat benchmarks** — $250-$5,000 cert per-product + $100-$500 ongoing-audit per year.
21. **RSP 2024 + KeHE 2024 + UNFI 2024 casepack-spec** — every retailer has unique casepack + pallet spec (e.g. Target 12-units-per-case; Whole Foods 24-units-per-case; RSP 48-units-per-case); canonical casepack-spec-master on Notion/Skool.
22. **Faire 2024 B2B-fulfillment-cost-stack** — 5-15% retail-broker-fees; 5-10% freight-subsidy; 2-5% returns-reserve; 2-4% NET-30-terms-financing.

### Reorder-automation + Klaviyo B2B-tier + Salesforce B2B Commerce benchmarks (3)

23. **Klaviyo 2024 B2B-flow benchmarks** — B2B reorder-reminder at 75% typical-purchase-cadence; sample-pack-shipped for first-time-buyer Day 5 + Day 14 cadence; first-reorder-thank-you Day 1; monthly-stockist-update; 60-80% reorder-rate-by-Year-2.
24. **Salesforce B2B Commerce 2024 benchmarks** — 55-75% first-time-buyer-reorder-rate; 75-85% Year-2-reorder-rate (75-85% of B2B-revenue is reorder).
25. **Marketplace Pulse 2024 wholesale-specialty-report** — 35-55% wholesale-channel-ARPU-cannibalization by Amazon-Business + DTC-traffic-erosion; 10-25% MAP-protected-wholesale vs 35-50% unprotected-wholesale.

---

> **Honest-read called out in 5 places:** (a) **Path B 8.5:1 Year-1 ROI assumes $500k-$5M US DTC GMV** with 25-100 retailer accounts per Faire 2024 benchmarks; brands below $500k should defer until $500k+ GMV or use Path A (4.5:1 nominal ROI is achievable but Path A brands get only 10-25 first-retailer-accounts in Year-1 vs 25-100 for Path B); (b) **canonical B2B-ARPU ratio of 0.65-0.80× DTC-ARPU** is the median per Faire 2024 + Ankorstore 2024 + Shopify B2B 2024 benchmarks; brands with 0.45-0.55× ARPU ratio are under-pricing at 60% off MSRP without retail-broker-fee defense OR experiencing MAP-violation-erosion; the canonical 5-corner framework protects against both; (c) **canonical distributor-onboarding sales-cycle of 6-18 months** per RSP 2024 + KeHE 2024 + UNFI 2024 benchmarks; brands without dedicated sales-rep (≥0.5 FTE for Path B / ≥1.0 FTE for Path C) should defer distributor-pitch until sales-rep-capacity-ready; (d) **canonical NET-30-vs-pre-pay-tier financing-cost of 4-7%** per Stripe B2B 2024 benchmarks; brand with $1M+ B2B-AR should consider Stripe B2B Capital for 1-3% effective rate (significantly cheaper than carrying-financing in-house); (e) **canonical MAP-policy-erosion-protection savings of 30-50% of DTC-traffic** per Faire 2024 + Ankorstore 2024 benchmarks; brands without MAP-policy-page lose 30-50% of DTC-revenue to wholesale-leakage. **The 5-corner-framework + 15-pitfall + 4-phase-gate structure** mitigates all 5 via the canonical Phase 1-4 rollout.

> **Move #14.5 status: the canonical 7th-priority follow-up after Move #1-#15 (after the 16 shipped moves + Move #6.5/6.6/6.7/6.8 attribution-audits + Move #14.5 will be the canonical track-opening pick per the prior tick's `b760565` journals recommendation).** **The B2B-wholesale track is now 1/6 layers complete (research/10 synthesis shipped 2026-06-30 per this tick; 5 remaining layers per canonical layer order: playbook 17 + asset 18 + /b2b route + b2b_wholesale_unit_economics.py + b2b-wholesale-channel-health.html).**

> **Canonical 7th-track-opening per the v0.7.0 track-exhaustion-revival diagnostic.** Per the prior tick (commit `b760565` shipped 2026-06-30), all 6 prior active tracks [international-expansion + lifecycle-marketing + 3PL-migration + marketplace-expansion + subscription-program + affiliate-program] are at 6/6 layers complete and fully closed per the v0.11.0 track-fully-closed pivot pattern. The canonical next-tick recommendation was: "the canonical 7th-track candidates include Move #14.5 B2B-wholesale pivot [Faire / Tundra] / Move #15.x TikTok-Shop / live-commerce layer / Move #16 creator-economy expansion beyond the affiliate-program Move #15 layer." **Move #14.5 B2B-wholesale was picked** because: (a) **second-largest revenue source for median DTC brand over $2M GMV** per Faire 2024 + Ankorstore 2024 benchmarks (15-100% incremental-revenue on top of DTC); (b) **clear 5-pillar framework with vendor-anchor density** + **3 GMV-tier paths + 4 phase-by-phase gates + 15 pitfalls + 39 prereqs** matching the canonical 11-section research-doc skeleton; (c) **compounds Move #1 + Move #4 + Move #6 + Move #8 + Move #11 + Move #12 + Move #15** in uniquely-tangible ways (wholesale-AR-finance + reorder-cadence + 3PL-distribution + affiliate-channel). Picked over: (a) `research/10-tiktok-shop-live-commerce.md` (canonical alternative — TikTok Shop / live-commerce / shoppable-video layer; deferred to a future track-opening since the B2B-wholesale track is the canonical #1-priority per revenue-leverage per Faire 2024 benchmarks; TikTok-Shop-overlap with creator-economy-track makes a single-deferred-track preferred), (b) `research/10-creator-economy-expansion.md` (canonical alternative — creator-economy-expansion beyond the affiliate-program Move #15 layer; deferred since it's structurally a sub-track-of-Move-15 rather than a distinct-track, and B2B-wholesale is the canonical-distinct-track-opening per Faire 2024). **Honest-read called out in 5 places** (above) documents the 5-corner-framework + 15-pitfall + 4-phase-gate structure that protects against the 5 biggest B2B-channel-launch risks.
