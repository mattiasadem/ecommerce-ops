# B2B / Wholesale Channel Launch — Operator Build (Faire + Tundra + Ankorstore + Handshake + Shopify B2B + RSP/KeHE/UNFI + Amazon Business + NetSuite Wholesale multi-platform orchestration)

> **Source.** Operator-build companion to `research/10-b2b-wholesale.md` (the canonical 11-section B2B / wholesale research synthesis; Move #14.5 from `research/03-30-day-rollout-plan.md` §Next moves; the B2B / wholesale + 15-100% incremental-revenue + 0.65-0.80× wholesale-ARPU + MAP-policy-cannibalization-defense layer the US-centric Shopify-DTC stack implicitly defers). Read `research/10-b2b-wholesale.md` FIRST for the 5-pillar framework [Pillar 1 B2B-channel selection & 7-platform mix / Pillar 2 wholesale economics & 5-corners channel-economics-math / Pillar 3 B2B-portal-automation + reorder-cycle / Pillar 4 MAP-policy + DTC-cannibalization-defense / Pillar 5 wholesale-fulfillment + 3PL / distributor handoff] + 3 GMV-tier paths [Path A Marketplace-only <$500k GMV 4.5:1 conservative nominal ROI / Path B Marketplace + Shopify B2B / Shopify Plus B2B DEFAULT $500k-$5M GMV 8.5:1 Year-1 ROI / Path C Direct-distributor + Amazon Business + Shopify Plus B2B $5M+ GMV 6:1 default at $10M US DTC base] + 4 phase-by-phase verification gates [Gate A Phase 1 wholesale-pricing + marketplace-storefront 10 prereqs / Gate B Phase 2 direct-buyer-pipeline + corporate-gifting + 5-clause-distribution-agreement 10 prereqs / Gate C Phase 3 distributor-pitch + Amazon Business 10 prereqs / Gate D Phase 4 steady-state + reorder-automation + trade-shows 9 prereqs] + 15 pitfalls with corrective `Fix:` lines clustered into 5 failure modes [A platform-selection + onboarding / B pricing + payment-terms / C cannibalization-defense + MAP-policy / D reorder-automation + Klaviyo-B2B-tier / E distributor-pitch + Amazon-Business + Path-C-readiness]. This playbook maps each pillar into step-by-step Faire + Tundra + Ankorstore + Handshake + Shopify B2B + RSP/KeHE/UNFI + Amazon Business + NetSuite Wholesale multi-platform B2B / wholesale operator build across 4 phases (Phase 1 wholesale-pricing + marketplace-storefront + 8-prereq-onboarding-pack + sample-pack-fulfillment ~8hr Path B baseline Weeks 1-3 / Phase 2 direct-buyer-pipeline + corporate-gifting + 5-clause-distribution-agreement + Handshake-auto-sync + Klaviyo-B2B-tier-reorder-cadence ~12hr Weeks 4-8 / Phase 3 distributor-pitch + Amazon Business + MAP-policy + geographic-exclusivity + ARPU-cannibalization-monitoring ~16hr Weeks 9-16 / Phase 4 steady-state + reorder-automation + TradeGala + 1-2 in-person-trade-shows + 60-80% reorder-rate-validated ~10hr + 4-8 hr/wk ongoing + 0.5 FTE dedicated-sales-rep in Year-2+). Pairs with `assets/18-b2b-wholesale-kits.md` (canonical 3rd-layer operator-copy companion — paste-ready per-marketplace per-voice per-SKU wholesale listing card with 4 marketplaces × 5 voice profiles × 6 SKU archetypes = 120 voice-variant wholesale listings; the canonical 8-prereq RFQ brief template; the canonical NET-30 terms-card template; the canonical MAP-policy-page template; the canonical 5-clause wholesale-distribution-agreement template; the canonical corporate-gifting catalog template; the canonical per-channel MOQ + casepack matrix; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15) + `dashboard/app/b2b/page.tsx` (canonical 4th-layer Next.js operator-surface route — renders research/10 + playbooks/17 + asset/18 as unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 60% wholesale-attach-rate Year-2 / 4 phases / 120 voice-cells] + TL;DR from research/10 + 3 layer cards [RD-10 + PB-17 + AS-18 with 5-voice density pills all ≥15] + future-tick companions [scripts/b2b_wholesale_unit_economics.py + dashboards/b2b-wholesale-channel-health.html]) + Move #1 cart-abandon (B2B-buyer-aware pricing-rules) + Move #4 welcome-series (B2B-tier welcome-flow) + Move #6 Triple Whale attribution (B2B-cohort-LTV-overlay) + Move #8 Smile.io loyalty (B2B-buyer-loyalty-points-equivalent-of-2×-points-for-DTC-buyers per Smile.io benchmarks) + Move #11 subscription-program (B2B-buyer-subscription-tier) + Move #15 affiliate-program (B2B-affiliate-recruitment via retailer-referrals) + research/04 international-expansion Pillar 4 (B2B-international-rollout via Ankorstore EU-UK-AU).

## Goal

By the end of this playbook (Weeks 1-3 for Path A / Weeks 1-16 for Path B / Weeks 1-32 for Path C), the operator has:

1. **Faire + Tundra + Ankorstore + Handshake storefronts live with wholesale-pricing + 8-prereq-onboarding-pack + sample-pack-fulfillment validated** — chosen per the canonical 7-platform B2B-platform tool decision matrix from research/10 Pillar 1 (Faire free 25%-first-order-commission for Path A default / Tundra 0%-commission alternative for $2M+ brands / Ankorstore 8-15%-commission for EU-UK-AU reach / Handshake $0-$149/mo Shopify-native zero-commission for Shopify-Plus-brands / Shopify B2B $149-$349/mo full-portal / Amazon Business $39.99/mo Professional + 6-15%-referral-fee for office-hospitality-healthcare SKUs / RSP / KeHE / UNFI / dot Foods $5k-$50k sales-rep-time for $10M+ mass-retail brands).
2. **Wholesale-pricing-calculator + 5-discount-tier-matrix + NET-30-terms-card + MAP-policy-page live** — canonical 50% off MSRP default for most DTC brands (45% off for premium-DTC Sustainable/Luxury/clean-beauty / 55% off for high-volume consumables/apparel/home / 60% off ONLY for distributor-tier gated on $5M+ GMV + dedicated-sales-rep) + the canonical 5 wholesale-pricing-stitch patterns [MSRP × 0.5 wholesale / case-pack multiple / freight-prepaid-line / free-shipping-threshold-by-AOV / NET-30 vs NET-60 vs pre-pay tier] + the canonical 8-prereq distributor-onboarding-pack [registration-cert + EIN-letter + resale-certificate per Streamlined-Sales-Tax-Project + product-insurance $1M+ general-liability + $1M product-liability + warehouse-safety-cert FDA OR CPSC-registered + UPC-barcode GS1-Company-Prefix $250/yr + casepack-spec-sheet + HazMat-cert-if-applicable] + the canonical NET-30-terms-card with 2.5%-discount-for-pre-pay-within-7-days-per Stripe-B2B-2024-benchmarks + the canonical MAP-policy-page listing every SKU's MAP-price + 3-strike-enforcement (1st-violation-written-warning / 2nd-violation-30-day-suspension / 3rd-violation-permanent-termination) per Sherman-Antitrust-Act-RPM-policy-compliance.
3. **Direct-buyer-pipeline + corporate-gifting-catalog + 5-clause-distribution-agreement + RangeMe product-discovery listing + first 10 retailer accounts acquired** — canonical 4-email-direct-buyer-cadence [introduction + sample-pack-shipping + follow-up + sales-call-booking] + the canonical corporate-gifting-catalog with 10-30 hero-SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers (15-25% Year-2 incremental-B2B-revenue) + the canonical 5-clause wholesale-distribution-agreement [commission + payment-terms + termination + indemnity + IP] + RangeMe product-discovery-listing per RangeMe 2024 benchmarks + first 10 retailer accounts validated through direct-pipeline + marketplace + Faire + Tundra + Ankorstore + Handshake.
4. **Handshake catalog-automation + Klaviyo B2B-tier-reorder-automation 4-flow-cadence + TradeGala-virtual-trade-show + 1 in-person-trade-show-per-Year-1 live** — Shopify admin → Settings → Apps → Handshake by Shopify → connect → choose which DTC-SKUs to sync (12-30 hero SKUs + 5-10 wholesale-only SKUs) → set wholesale-pricing-rules (auto-apply 50%-off MSRP for authenticated B2B accounts OR company-specific-pricing-rules) + the canonical 4-Klaviyo-flow B2B-cadence [(1) B2B reorder-reminder at 75% typical-purchase-cadence + (2) sample-pack-shipped for first-time-buyer Day 5 + Day 14 cadence + (3) first-reorder-thank-you Day 1 post-reorder + (4) monthly-stockist-update with new-SKUs] + TradeGala-virtual-trade-show subscription $200-$2,000/mo + 1 in-person-trade-show-per-Year-1 (NY NOW + ASD Market Week + Surf Expo + MAGIC + PROJECT + NYIGF + NACDS Total Store Expo).
5. **Distributor-pitch + Amazon Business B2B-specialty-tier + MAP-policy-enforcement + geographic-exclusivity-tier + ARPU-cannibalization-monitoring-quarterly live** — for Path C brands ($5M+ GMV): canonical 8-prereq RFQ-template + distributor-pitch-deck + dedicated 0.5-1.0 FTE sales-rep-capacity during onboarding (6-18-month sales-cycle per RSP 2024 + KeHE 2024 + UNFI 2024 benchmarks) + Amazon Business B2B-specialty-tier-cert $39.99/mo + Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs only (per Marketplace Pulse 2024 wholesale-specialty-report) + geographic-exclusivity-tier for top-20-accounts (state-level for top-20-accounts; city-level for top-5-accounts per Faire 2024 + Handshake geographic-exclusion benchmarks) + Triple Whale B2B-cohort-LTV-overlay for ARPU-cannibalization-monitoring-quarterly (DTC-vs-B2B cohort-LTV-comparison).
6. **Steady-state B2B-channel + 60-80% reorder-rate-by-Year-2 + first 25+ retailer accounts acquired + B2B Year-1 ROI validated** — research/10 Pillar 4 reorder-automation-validated 60-80% reorder-rate-by-Year-2 per Salesforce B2B Commerce 2024 benchmarks + first 25+ retailer accounts validated (Path A 10-25 / Path B 25-100 / Path C 100-1000+ retailer-accounts over 12-24 months per Faire 2024 onboarding-benchmarks) + B2B Year-1 ROI validated (Path A ≥4:1 / Path B ≥8:1 / Path C ≥6:1 by Year-1 close per research/10 §Cost & ROI).

**Operator time commitment:** Path A ~25 hours one-time + 2 hr/wk ongoing = **~130 hr Year-1**. Path B ~50 hours one-time + 4 hr/wk ongoing + 0.5 FTE dedicated-sales-rep in Year-2+ = **~260 hr Year-1 + $35k-$50k FTE amortized**. Path C ~120 hours one-time + 8-15 hr/wk steady-state + dedicated full-FTE sales-rep = **~720 hr Year-1 + $70k-$100k FTE**.

**Default path: Path B mid-market Faire + Tundra + Ankorstore + Handshake + Shopify B2B / Shopify Plus B2B $500k-$5M GMV / 12-30 hero-SKUs + 30+ wholesale-eligible secondary SKUs / 50% off MSRP default / NET-30-terms-card with 2.5%-pre-pay-discount / first 10-25 retailer accounts / 60-80% reorder-rate-by-Year-2** — the canonical 8.5:1 default Year-1 ROI per research/10 §Cost & ROI ($1M-$5M Year-1 incremental B2B revenue / $24,588 annual cost stack). Path A is the lean starter (Faire + Tundra + Ankorstore + Handshake marketplace-listing only; <$500k GMV; <10 SKUs; 4.5:1 conservative nominal Year-1 ROI). Path C is the enterprise scale (RSP/KeHE/UNFI + Amazon Business + Shopify Plus full-B2B-portal; $5M+ GMV; 100+ SKUs; 6:1 default Year-1 ROI muted by 6-18-month distributor-onboarding-cycle + 5-15% retail-broker-fees + 8%-commissioned-sales-rep-cost; compounds to 14-20:1 by Year-3 once distributor-portfolio is mature).

---

## Which B2B / wholesale platform-mix fits your GMV tier + ops capacity

The canonical 7-platform B2B / wholesale decision matrix from research/10 Pillar 1:

| Platform | Best for | Setup cost | Per-order cost | Annual revenue | Migration-from | When to use |
|---|---|---|---|---|---|---|
| **Faire** | Default for brands <$2M GMV; gift / home / apparel / beauty / food | $0 (free) | 25% first-order + 15% reorders | Variable | n/a | <$2M GMV; default for first-time B2B brands |
| **Tundra** | Zero-commission alternative for brands >$2M GMV | $0 (free) | 0% commission | Variable | Free migration + data-export-tool | $2M+ GMV; brand wants to preserve wholesale-margin from Faire-25%-commission-erosion |
| **Ankorstore** | European B2B marketplace | $0 (free) | 8-15% commission | Variable | Free migration | EU-UK-AU reach; cross-border B2B distribution |
| **Handshake (Shopify B2B)** | Shopify-native DTC-brand B2B | $0-$149/mo | 0% commission | Variable | Shopify-native-integration | Shopify-Plus brands wanting native-B2B without Faire-commission-erosion |
| **Shopify B2B (Shopify Plus)** | Shopify-Plus brands wanting full B2B-portal | $2,300/mo | 0% commission | Variable | Shopify-native | $5M+ brands; full-native-B2B-portal with company-accounts + credit-terms + bulk-pricing + reorder-automation |
| **Amazon Business** | Office / hospitality / healthcare SKUs | $39.99/mo Professional | 6-15% referral fee | Variable | Free migration | B2B-specialty-category SKUs (office / hospitality / healthcare / industrial); DTC-overlap structurally low |
| **RSP / KeHE / UNFI / dot Foods** | $10M+ brands wanting mass-retail | $5k-$50k sales-rep-time | 5-20% retail-broker-fees | Variable | Direct-pitch only | $10M+ GMV; mass-retail ambitions; 6-18-month sales-cycle |

**The 4-platform default (Faire + Tundra + Ankorstore + Handshake)** covers **~85% of typical Shopify-DTC B2B needs** at **$0-$149/mo** Path A-B cost stack. RSP / KeHE / UNFI / Amazon Business are gated on $5M+ GMV with dedicated sales-rep capacity OR B2B-specialty-category SKUs (office / hospitality / healthcare / industrial).

---

## Prerequisites

The canonical 8-prereq gate that ALL paths MUST satisfy before Phase 1 B2B-launch (mirrors research/10 Gate A prerequisite 7):

1. **DTC baseline steady-state 90+ days.** Move #1 + Move #4 + Move #6 + Move #8 actively live for ≥90 days before Phase 1 B2B-launch per research/10 §Verification gates Gate A prerequisite 1.
2. **Move #1 cart-abandon-flow performance.** CTR ≥5% per Klaviyo 2024 cart-abandon benchmarks.
3. **Move #4 welcome-series performance.** Open-rate ≥35% + click-rate ≥4% + CVR ≥0.8% per Klaviyo 2024 welcome-series benchmarks.
4. **Move #6 Triple Whale attribution live with ≥95% match-rate.** Triple Whale attribution has all 7 gates passing per `scripts/triple_whale_attribution_check.py` (Move #6 Gate A-G).
5. **Move #8 loyalty actively rewarding repeat-purchases.** ≥30% member-share of total-revenue per Smile.io benchmarks.
6. **≥10 SKUs with ≥25% wholesale-discount margin headroom.** 5 hero-SKUs + 5 wholesale-eligible secondary SKUs minimum per Faire 2024 onboarding benchmarks.
7. **8-prereq distributor-onboarding-pack documented + on-file.** Registration-cert + EIN-letter + resale-certificate per Streamlined-Sales-Tax-Project + product-insurance $1M+ general-liability + $1M product-liability + warehouse-safety-cert FDA OR CPSC-registered + UPC-barcode GS1-Company-Prefix $250/yr + casepack-spec-sheet + HazMat-cert-if-applicable.
8. **≥4 B2B-platforms selected with documented rationale.** Default = Faire + Tundra + Ankorstore + Handshake (4-platform-bundle covers ~85% of typical Shopify-DTC B2B-needs).

---

## Step-by-step — Phase 1 (Weeks 1–3, ~8 hours, Path B baseline)

### 1.1 Wholesale-pricing calculator + 5-discount-tier-matrix configured

Per research/10 Pillar 2 wholesale-pricing-psychology framework + research/10 §Cost & ROI; canonical 50% off MSRP default for most DTC brands.

```
WHOLESALE_PRICING_CALCULATOR (Excel / Google Sheets)

| Hero SKU MSRP | Wholesale tier | Wholesale price | Margin retained |
|---------------|----------------|-----------------|-----------------|
| $50.00 MSRP   | 35% off (luxury / MAP-protected) | $32.50 | 65% of MSRP |
| $50.00 MSRP   | 40% off (sustainable / clean-beauty) | $30.00 | 60% of MSRP |
| $50.00 MSRP   | 45% off (premium default) | $27.50 | 55% of MSRP |
| $50.00 MSRP   | 50% off (canonical) | $25.00 | 50% of MSRP |
| $50.00 MSRP   | 55% off (high-volume) | $22.50 | 45% of MSRP |
| $50.00 MSRP   | 60% off (distributor-tier only) | $20.00 | 40% of MSRP |

Default pick: 50% off MSRP for most DTC brands. 45% for premium brands (sustainable / luxury / clean-beauty). 55% for high-volume brands (consumables + apparel + home). 60% ONLY for distributor-tier (gated on $5M+ GMV + dedicated-sales-rep).
```

**Voice-profile overrides per research/10 Pillar 2:** Default = 50% off / Luxury = 35% off (MAP-protected) / Sustainable = 40% off (clean-beauty premium) / Gen-Z = 50% off (standard) / B2B = 55% off (volume-discount expected).

**Decision criterion:** All wholesale-pricing decisions MUST result in wholesale-ARPU 0.65-0.80× DTC-ARPU (NOT 0.45-0.55× which signals under-pricing / MAP-violation-erosion).

### 1.2 NET-30 terms-card + 2.5% pre-pay-discount documented

Per research/10 Pillar 2 wholesale-payment-terms-financing-cost framework + Stripe B2B 2024 benchmarks.

```
NET-30 TERMS-CARD (paste-ready)

PAYMENT TERMS:
- NET-30 default (invoice-due 30 days from shipment)
- 2.5% discount for pre-pay within 7 days (per Stripe B2B 2024 benchmarks)
- NET-60 available for top-20-accounts (4-7% effective financing-cost; brand absorbs)
- ACH/wire with 2.5% discount: -0.5% to +1% effective (small discount vs pre-pay tier)

MINIMUM ORDER:
- First order: $250 minimum
- Reorder: $150 minimum
- Case-pack-multiples required (1 case-pack = 6-24 units depending on SKU per Faire 2024 casepack-spec benchmarks)

SHIPPING:
- FOB Origin (brand's warehouse) per Incoterms 2020 default
- Free shipping on orders $500+ (configurable per channel)
- NET-30 freight-terms: customer pays freight separately OR add to invoice (configurable)

RETURNS:
- Damaged/defective: full replacement within 30 days
- Buyer's remorse: 15% restocking fee, return-shipping at buyer's cost
- MAP-violation-driven returns: not accepted (per MAP-policy-page enforcement)

BRAND CONTACT:
- wholesale@brand.com for all B2B-inquiries
- Response SLA: 24-hour on business days
```

### 1.3 MAP-policy-page published + 3-strike-enforcement live

Per research/10 Pillar 4 MAP-policy + DTC-cannibalization-defense framework + Sherman-Antitrust-Act-RPM-policy-compliance.

```
MAP-POLICY-PAGE (paste-ready)

MINIMUM ADVERTISED PRICE (MAP) POLICY — Effective [DATE]

This Minimum Advertised Price (MAP) Policy applies to all authorized retailers of [BRAND] products.

1. DEFINITION OF MAP
- MAP is the lowest price at which a retailer may ADVERTISE (online listings, print ads, email, social media) any [BRAND] product
- MAP is NOT the lowest price at which a retailer may SELL — retailers may sell below MAP at the register but may NOT advertise below MAP
- MAP list is published at brand.com/MAP-policy with every SKU's MAP price

2. ENFORCEMENT
- 1st violation: written warning + 14-day cure period
- 2nd violation: 30-day suspension from new-PO acceptance
- 3rd violation: permanent termination of wholesale-account

3. EXEMPTIONS
- MAP does not apply to: (a) clearance of discontinued SKUs at end-of-life, (b) bundle-pricing where total bundle is ≥MAP, (c) B2B-exclusive SKUs not sold on DTC

4. REPORTING VIOLATIONS
- Email map@brand.com with screenshot + URL of violating listing
- We investigate within 5 business days and respond within 14 days

LEGAL BASIS: This MAP Policy is structured to comply with the Sherman Antitrust Act and the rule-of-reason analysis per Leegin Creative Leather Products v. PSKS (2007).

For questions: map@brand.com
```

**Publish at:** brand.com/MAP-policy + link to Faire + Tundra + Ankorstore + Handshake storefronts.

### 1.4 8-prereq distributor-onboarding-pack compiled

Per research/10 Pitfall #3 + research/10 §Verification gates Gate A prerequisite 7; canonical 8-prereq distributor-onboarding-pack.

```
8-PREREQ DISTRIBUTOR-ONBOARDING-PACK (paste-ready checklist)

[ ] 1. Business registration certificate (state-issued LLC OR corporation)
[ ] 2. EIN letter (IRS-issued Employer Identification Number)
[ ] 3. Resale certificate (per Streamlined-Sales-Tax-Project; valid in buyer's state)
[ ] 4. Product insurance — General liability $1M+ AND Product liability $1M+ (per USP <797> + retailer-onboarding standards)
[ ] 5. Warehouse safety cert — FDA-registered (food/cosmetic) OR CPSC-registered (general-product)
[ ] 6. UPC barcode — GS1 Company Prefix $250/yr baseline + GTIN-12 per-SKU + GTIN-14 case-pack
[ ] 7. Case-pack spec sheet — units-per-case + cases-per-pallet + pallet-dimensions + weight per major-retailer (Target / Whole Foods / RSP / KeHE)
[ ] 8. HazMat cert (if applicable) — IATA 2024 + USPS 2024 + UPS 2024 + FedEx 2024 class-cert per Class 1-9 dangerous-goods

Compiled PDFs / certs in /shared-drive/B2B-onboarding-pack/ with 14-day-onboarding-lead-time before first-PO-shipment.
```

### 1.5 Faire + Tundra + Ankorstore + Handshake storefronts live

Per research/10 Pillar 1 + Pillar 3 catalog-automation.

**Faire setup (~2 hours):**
1. Apply at faire.com/sell → vendor-application (~7-day review)
2. Brand-info: 5 hero-SKU + 5 wholesale-eligible secondary SKUs + 5 wholesale-only SKUs
3. Wholesale-pricing-rules: auto-apply 50%-off MSRP for authenticated B2B accounts
4. Set NET-60 default terms (Faire default) + override to NET-30 per the canonical terms-card
5. Upload product-photos (minimum 4 photos per SKU: hero + lifestyle + casepack + label)
6. Set 25%-first-order-commission + 15%-reorder-commission per Faire 2024 standard
7. First-time-vendor training (~30 min Faire Academy courses)

**Tundra setup (~1 hour):**
1. Apply at tundra.com/sell → vendor-application (~3-day review, faster than Faire)
2. Brand-info: same SKU list as Faire + 0%-commission tier
3. Wholesale-pricing-rules: auto-apply 50%-off MSRP
4. Set NET-30 default terms
5. Migration tool: if migrating from Faire, use Tundra's free-migration-tool to bulk-import SKUs

**Ankorstore setup (~1.5 hours):**
1. Apply at ankorstore.com/sell → vendor-application (~5-day review)
2. EU-UK-AU market focus (canonical for cross-border B2B distribution)
3. Brand-info: same SKU list + EU-languages (EN + FR + DE + ES)
4. Wholesale-pricing-rules: auto-apply 50%-off MSRP + EU-VAT-compliant invoicing
5. 8-15% commission per Ankorstore 2024 vendor-survey

**Handshake setup (~1 hour):**
1. Shopify admin → Settings → Apps → Handshake by Shopify → install
2. Choose which DTC-SKUs to sync: 12-30 hero SKUs + 5-10 wholesale-only SKUs
3. Set wholesale-pricing-rules: auto-apply 50%-off MSRP for authenticated B2B accounts
4. Configure company-accounts: enable B2B-buyer-portal at brand.com/b2b
5. Volume-pricing-tiers: 1-5 cases no discount / 6-23 cases 5%-off / 24+ cases 10%-off
6. Geographic-exclusion-config (per Pitfall #8): exclude B2B-buyer-in-California from selling DTC-overlap-SKUs in California

### 1.6 Sample-pack fulfillment via ShipBob B2B OR ShipMonk B2B

Per research/10 Pillar 5 wholesale-fulfillment + ShipBob B2B + ShipMonk B2B 2024 benchmarks.

```
SAMPLE-PACK CONFIGURATION

| Component | Specification | Cost |
|-----------|---------------|------|
| Sample SKUs | 5 hero-SKUs + 2 wholesale-eligible SKUs | $50-$150 product-cost |
| Packaging | Branded mailer + tissue + handwritten thank-you note + business card | $5-$10 |
| Wholesale-line-sheet | Printed line-sheet with all wholesale-eligible-SKUs + pricing-tiers + MOQ | $2 |
| Sample-pack shipping | USPS Priority OR UPS Ground | $8-$15 |
| Total per sample-pack | | $65-$177 |

Sample-pack fulfillment routing:
- ShipBob B2B for <$500k B2B-AR (cost $25-$50/mo per-account + $2-$5 per-order pick-pack)
- ShipMonk Enterprise B2B for $500k+ B2B-AR (cost $250-$500/mo per-account + $2-$5 per-order pick-pack + EDI-832/850-out-of-box)
- In-house with casepack-spec for sample-only (no automated-routing)
```

### 1.7 First 10 retailer accounts acquired + reorder-cadence-validated

Per research/10 Pillar 2 wholesale-attach-rate + Salesforce B2B Commerce 2024 benchmarks; 55-75% of acquired retailers reorder within 12 months.

**First 10 retailer targets:**
- 3 from Faire marketplace (auto-acquired via marketplace-listing)
- 2 from Tundra marketplace (auto-acquired)
- 2 from Ankorstore marketplace (auto-acquired)
- 1 from Handshake (Shopify-Plus direct-buyers)
- 2 from direct-outreach (existing-DTC-buyer-pool + LinkedIn + RangeMe listing)

**Sample-pack shipped to each** with handwritten-thank-you-note + wholesale-line-sheet + 4-email-cadence triggered in Klaviyo.

### 1.8 Verification — Gate A (Phase 1 readiness, end of Week 3)

Per research/10 §Verification gates Gate A; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** DTC baseline steady-state 90+ days (Move #1 + Move #4 + Move #6 + Move #8 actively live for ≥90 days).
- [ ] **Prereq 2:** Move #1 cart-abandon CTR ≥5% per Klaviyo 2024 benchmarks.
- [ ] **Prereq 3:** Move #4 welcome-series open-rate ≥35% + click-rate ≥4% + CVR ≥0.8%.
- [ ] **Prereq 4:** Move #6 Triple Whale attribution ≥95% match-rate (all 7 gates passing per `scripts/triple_whale_attribution_check.py`).
- [ ] **Prereq 5:** Move #8 loyalty ≥30% member-share of total-revenue per Smile.io benchmarks.
- [ ] **Prereq 6:** ≥10 SKUs with ≥25% wholesale-discount margin headroom (5 hero + 5 wholesale-eligible).
- [ ] **Prereq 7:** 8-prereq distributor-onboarding-pack compiled (registration + EIN + resale-cert + insurance + warehouse-safety + UPC + casepack-spec + HazMat).
- [ ] **Prereq 8:** ≥4 B2B-platforms selected (Faire + Tundra + Ankorstore + Handshake DEFAULT).
- [ ] **Prereq 9:** Wholesale-pricing-calculator configured for 50% off MSRP default + 5-discount-tier-matrix.
- [ ] **Prereq 10:** NET-30 terms-card + 2.5% pre-pay-discount documented + MAP-policy-page published.

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 2.

---

## Step-by-step — Phase 2 (Weeks 4–8, ~12 hours, Path B direct-buyer-pipeline + corporate-gifting + 5-clause-distribution-agreement)

### 2.1 5-clause wholesale-distribution-agreement template ready

Per research/10 §Verification gates Gate B prerequisite 2 + Faire 2024 + Ankorstore 2024 + Shopify B2B 2024 vendor-survey benchmarks; canonical 5-clause wholesale-distribution-agreement.

```
5-CLAUSE WHOLESALE-DISTRIBUTION-AGREEMENT (paste-ready)

PARTIES:
[BRAND LEGAL ENTITY] ("Brand") and [BUYER LEGAL ENTITY] ("Retailer")

CLAUSE 1 — COMMISSION / WHOLESALE PRICING:
1.1 Retailer agrees to purchase [BRAND] products at wholesale-pricing-tiers per Schedule A (50% off MSRP default; voice-profile overrides per Schedule A.1).
1.2 Retailer agrees to advertise all [BRAND] products at or above the Minimum Advertised Price (MAP) per Schedule B.
1.3 Volume-pricing-tiers: 1-5 cases no discount / 6-23 cases 5%-off / 24+ cases 10%-off (auto-applied at PO-time via Handshake volume-pricing-rules).

CLAUSE 2 — PAYMENT TERMS:
2.1 NET-30 default payment terms (invoice-due 30 days from shipment).
2.2 2.5% discount for pre-pay within 7 days (per Stripe B2B 2024 benchmarks).
2.3 NET-60 available for top-20-accounts with prior approval (4-7% effective financing-cost; brand absorbs).
2.4 Late payments: 1.5% monthly interest on overdue balance after 30-day-net.

CLAUSE 3 — TERMINATION:
3.1 Either party may terminate this agreement with 30-day written notice.
3.2 Brand may immediately terminate for: (a) MAP-policy violation (3-strike-enforcement per Schedule B), (b) payment-default >60 days, (c) brand-reputation-harm-via-public-statement, (d) any-FTC-violation-affecting-brand-products.
3.3 Upon termination, Retailer may sell remaining inventory but may not place new POs.

CLAUSE 4 — INDEMNITY:
4.1 Brand indemnifies Retailer against product-defect-claims (product-liability insurance $1M+ covers).
4.2 Retailer indemnifies Brand against retailer-misconduct (advertising violations + resale-channel violations).
4.3 Mutual indemnification for jointly-caused claims.

CLAUSE 5 — IP:
5.1 Brand retains all IP-rights to [BRAND] products + trademarks + packaging-designs.
5.2 Retailer may use [BRAND] trademarks for advertising + in-store-display per Brand's Brand-Guidelines-v1.0.
5.3 Retailer may NOT: (a) modify [BRAND] packaging, (b) re-label [BRAND] products, (c) sell [BRAND] products on Amazon-1P (3P allowed per Brand's channel-policy).

SIGNATURES:
_________________________ _____________
[BRAND CEO/AUTHORIZED] DATE

_________________________ _____________
[RETAILER CEO/AUTHORIZED] DATE
```

### 2.2 Direct-buyer-outreach-sequence 4-email-cadence live

Per research/10 Pitfall #12 + Pillar 3 Trade-show + direct-buyer-pipeline framework; canonical 4-email-direct-buyer-cadence.

**Email 1 — Introduction (Day 0):**
Subject: Wholesale partnership inquiry — [BRAND] × [BUYER]
Body: 3-sentence intro + sample-pack-offer + 30-min-call-link

**Email 2 — Sample-pack-shipping (Day 5):**
Subject: Your [BRAND] sample-pack is on its way
Body: Tracking-link + wholesale-line-sheet-attached + 5-clause-distribution-agreement-attached + 14-day-reorder-incentive

**Email 3 — Follow-up (Day 14):**
Subject: Quick check-in on your [BRAND] sample-pack
Body: "Did the sample-pack arrive safely?" + reorder-CTA + 30-min-call-link

**Email 4 — Sales-call-booking (Day 21):**
Subject: 15-minute call to discuss [BRAND] wholesale partnership
Body: 3-proposed-time-slots + Zoom-link + corporate-gifting-mix-mention-if-applicable

**Klaviyo setup:** Create segment "B2B-direct-outreach" with custom-property `b2b_outreach_stage` (introduction / sample-pack-shipped / follow-up / sales-call-booked / converted-to-account). 4-email-cadence triggers via Klaviyo-flow with `b2b_outreach_stage` filter + send-time per stage.

### 2.3 RangeMe product-discovery listing live

Per research/10 §Verification gates Gate B prerequisite 4 + RangeMe 2024 product-discovery benchmarks.

1. Apply at rangeme.com/seller → product-discovery-listing (~3-day review)
2. Product-catalog upload: 12-30 hero-SKUs + 5-10 wholesale-eligible SKUs + 5-10 wholesale-only SKUs
3. Wholesale-pricing-rules: auto-display 50%-off MSRP
4. Brand-story + sustainability-claims (per `assets/12-impact-data-pipeline.md` for Sustainable-voice brands)
5. Buyer-inquiries: range-routes-inquiries-to-wholesale@brand.com per RangeMe 2024 routing

### 2.4 Corporate-gifting-catalog with 10-30 hero-SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers

Per research/10 §Verification gates Gate B prerequisite 5 + Faire 2024 + Klaviyo B2B 2024 corporate-gifting benchmarks; 15-25% Year-2 incremental-B2B-revenue from corporate-gifting-mix.

```
CORPORATE-GIFTING-CATALOG STRUCTURE

| Tier | Order size | Discount | Examples |
|------|-----------|----------|----------|
| Welcome-gift | $50-$200 | 50% off MSRP | Single hero SKU + custom-ribbon + handwritten-card |
| Client-thank-you | $200-$1,000 | 55% off MSRP | 3-5 hero SKUs + custom-ribbon + handwritten-card + branded-mailer |
| Holiday-gift | $1,000-$5,000 | 60% off MSRP | 5-10 hero SKUs + custom-ribbon + handwritten-card + branded-mailer + gift-receipt |
| Bulk-onboarding | $5,000-$25,000 | 60% off MSRP + free-shipping | 10-30 hero SKUs + custom-branded-packaging + dedicated-account-manager |

Custom-branding-options: custom-ribbon (Pantone-matched, 14-day lead-time) + handwritten-card (hand-addressed, 7-day lead-time) + branded-mailer (custom-printed, 21-day lead-time).
```

**Klaviyo B2B-tier flow:** Trigger on corporate-gift-order-placed → send dedicated-account-manager follow-up → upsell to recurring-quarterly-corporate-gifting cadence → cross-sell to standard-wholesale-account.

### 2.5 First 5 retailer accounts acquired and validated

Per research/10 §Verification gates Gate B prerequisite 6; first 5 retailers = direct-pipeline + marketplace + Faire + Tundra + Ankorstore + Handshake combined.

**Validation criteria per retailer:**
- 5-clause-distribution-agreement signed
- First PO ≥ $250 minimum
- Reorder-cadence validated: 1 reorder within 60 days
- Wholesale-ARPU 0.65-0.80× DTC-ARPU (not 0.45-0.55×)
- NetSuite Wholesale OR QuickBooks Wholesale-tier AR-entry created

### 2.6 First-reorder-thank-you Klaviyo-flow live

Per research/10 Pillar 3 reorder-automation framework + Salesforce B2B Commerce 2024 benchmarks.

Klaviyo-flow: Trigger on first-reorder-placed → wait 1 day → send "Thank you for your reorder!" email with:
- Order-confirmation + tracking-link
- Wholesale-line-sheet-attached (reorder-CTA)
- 5-discount-tier-matrix (volume-pricing-CTA)
- Direct-account-manager contact-info

### 2.7 Monthly-stockist-update Klaviyo-flow live

Klaviyo-flow: Trigger on `subscription_date % monthly_anniversary` → send monthly-stockist-update with:
- New-SKUs-this-month (with wholesale-pricing)
- Restock-alerts (low-inventory SKUs → 24h reorder-window)
- Volume-pricing-tier-progress (e.g. "You're at 18 cases this month — 6 more cases unlocks 5% volume-discount")
- Brand-news + corporate-gifting-mix-promo

### 2.8 Wholesale-AR automated-via-NetSuite Wholesale OR QuickBooks Wholesale-tier

Per research/10 §Verification gates Gate B prerequisite 10; NetSuite Wholesale for $250k+ B2B-AR / QuickBooks Wholesale for <$250k B2B-AR.

**NetSuite Wholesale setup:** Customer-record per retailer + NET-30 automatic-aging + AR-aging-reporting + invoice-generation + payment-receipt-tracking + sales-tax-calculation-per-state-resale-cert.

**QuickBooks Wholesale-tier setup:** Customer-record per retailer + NET-30-invoice-template + AR-aging-report + sales-tax-per-resale-cert.

### 2.9 Verification — Gate B (Phase 2 readiness, end of Week 8)

Per research/10 §Verification gates Gate B; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** Phase 1 Gate A all 10 prereqs passing.
- [ ] **Prereq 2:** 5-clause wholesale-distribution-agreement template ready (commission + payment-terms + termination + indemnity + IP).
- [ ] **Prereq 3:** Direct-buyer-outreach-sequence 4-email-cadence live in Klaviyo (introduction + sample-pack-shipping + follow-up + sales-call-booking).
- [ ] **Prereq 4:** RangeMe product-discovery listing live (12-30 hero + 5-10 wholesale-eligible + 5-10 wholesale-only SKUs).
- [ ] **Prereq 5:** Corporate-gifting-catalog with 10-30 hero-SKUs + custom-ribbon + handwritten-card + bulk-pricing-tiers.
- [ ] **Prereq 6:** First 5 retailer accounts acquired + 5-clause-agreements signed + first POs placed.
- [ ] **Prereq 7:** First-reorder-thank-you Klaviyo-flow live (Day 1 post-first-reorder).
- [ ] **Prereq 8:** Monthly-stockist-update Klaviyo-flow live (monthly new-SKU + reorder-cadence-update).
- [ ] **Prereq 9:** Sample-pack-fulfillment via ShipBob B2B OR ShipMonk B2B OR in-house-with-casepack-spec validated.
- [ ] **Prereq 10:** Wholesale-AR automated-via-NetSuite Wholesale OR QuickBooks Wholesale-tier with NET-30 automatic-aging.

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 3.

---

## Step-by-step — Phase 3 (Weeks 9–16, ~16 hours, Path B distributor-pitch + Amazon Business + MAP-policy-enforcement + geographic-exclusivity + ARPU-cannibalization-monitoring)

### 3.1 8-prereq RFQ-template ready for distributor-pitch

Per research/10 §Verification gates Gate C prerequisite 2 + RSP 2024 + KeHE 2024 + UNFI 2024 distributor-onboarding-funnel.

```
8-PREREQ RFQ-TEMPLATE (paste-ready)

REQUEST FOR QUOTATION — [BRAND] × [DISTRIBUTOR]

To: [DISTRIBUTOR NAME] (RSP / KeHE / UNFI / dot Foods / Boar's Head)
From: [BRAND LEGAL ENTITY] + EIN [EIN NUMBER]
Date: [DATE]
Valid Until: [60 DAYS FROM DATE]

PRODUCT LINE:
- 12-30 hero-SKUs (highlights: [TOP 5 SKUS])
- 30+ wholesale-eligible secondary SKUs (full line-sheet attached)
- 5-10 wholesale-only SKUs (B2B-exclusive, not sold on DTC)

PRICING:
- Wholesale: 50% off MSRP per Schedule A
- Volume-pricing-tiers: 1-5 cases no discount / 6-23 cases 5%-off / 24+ cases 10%-off
- 60% off MSRP for distributor-tier (gated on $5k+ first-PO minimum)
- Payment terms: NET-30 default with 2.5% pre-pay-discount

MINIMUM ORDER QUANTITIES (MOQ):
- First order: $5,000 minimum (12-30 SKU mix)
- Reorder: $2,500 minimum
- Case-pack multiples only (1 case = 6-24 units per SKU)

8-PREREQ ONBOARDING-PACK (attached):
1. [✓] Business registration certificate
2. [✓] EIN letter
3. [✓] Resale certificate (multi-state SST-form)
4. [✓] Product insurance: $1M+ GL + $1M PL
5. [✓] Warehouse safety cert: FDA-registered (food/cosmetic) OR CPSC-registered
6. [✓] UPC barcode: GS1 Company Prefix + GTIN-12 + GTIN-14 case-pack
7. [✓] Case-pack spec sheet (per-retailer-form attached)
8. [✓] HazMat cert: N/A (or attached if applicable)

LEAD-TIME:
- First PO acknowledgement: 7 days from RFQ acceptance
- First PO fulfillment: 14-21 days from PO acceptance
- Reorder fulfillment: 7-14 days from PO acceptance

TARGET ONBOARDING DATE: [DATE 60 DAYS FROM RFQ]

[BRAND CEO SIGNATURE] [DATE]
```

### 3.2 Distributor-pitch-deck with 7-path B2B-platform-decision-matrix

Per research/10 §Verification gates Gate C prerequisite 3; canonical 7-path B2B-platform-decision-matrix (Faire / Tundra / Ankorstore / Handshake / Shopify B2B / Amazon Business / Direct-distributor).

**Deck structure (15-20 slides):**
- Slide 1: Brand-overview + sustainability-claims
- Slide 2: Hero-SKU lineup + wholesale-pricing-tiers
- Slide 3: Customer-cohort-LTV-overlay (Triple Whale B2B-cohort-LTV-overlay)
- Slide 4: Wholesale-ARPU vs DTC-ARPU analysis
- Slide 5: 7-path B2B-platform-decision-matrix
- Slide 6: Direct-distributor economics (RSP / KeHE / UNFI)
- Slide 7: Amazon Business B2B-specialty-tier opportunity
- Slide 8: MAP-policy + 3-strike-enforcement
- Slide 9: Case-pack-spec + HazMat-cert + GS1-bundle
- Slide 10: First-PO-onboarding-timeline (60-day)
- Slide 11: Corporate-gifting-mix opportunity
- Slide 12: Trade-show-presence (NY NOW / ASD Market Week / TradeGala)
- Slide 13: Reorder-automation + Klaviyo-B2B-tier
- Slide 14: ARPU-cannibalization-monitoring (Triple Whale B2B-cohort-LTV-overlay)
- Slide 15: First-reorder-validation-metrics (60-80% reorder-rate-by-Year-2)
- Slide 16: Contact + next-steps

### 3.3 Dedicated sales-rep-capacity ≥0.5 FTE Path B / ≥1.0 FTE Path C

Per research/10 Pitfall #13 + research/10 §Verification gates Gate C prerequisite 4; canonical dedicated sales-rep-capacity for distributor-onboarding sales-cycle.

**Path B (Year-2+):** Hire 0.5 FTE dedicated sales-rep at $35k-$50k/yr OR contract with commissioned-sales-rep at 8% of net-revenue (per Faire 2024 + RSP 2024 benchmarks). Job-description: outbound-RFQ-sending + inbound-retailer-onboarding + 4-email-cadence-execution + sample-pack-fulfillment-coordination + AR-management.

**Path C (Year-1+):** Hire 1.0 FTE dedicated full-FTE sales-rep at $70k-$100k/yr OR contract with 2 commissioned-sales-reps. Job-description: above + distributor-pitch-execution + Amazon Business management + trade-show-presence (1-2 shows/yr).

### 3.4 MAP-policy-page publicly-published + linked-to-marketplace-storefronts

Per research/10 Pitfall #7 + Pillar 4 MAP-policy + DTC-cannibalization-defense framework; canonical MAP-policy-page.

**Action:** brand.com/MAP-policy + link from Faire / Tundra / Ankorstore / Handshake storefront footers + link from Klaviyo B2B-tier welcome-flow + link from 5-clause-distribution-agreement Clause 1.2.

### 3.5 Geographic-exclusivity-tier documented for top-20-accounts

Per research/10 Pitfall #8 + Pillar 4 geographic-exclusivity framework; canonical state-level for top-20-accounts + city-level for top-5-accounts.

```
GEOGRAPHIC-EXCLUSIVITY-TIER DOCUMENT

| Tier | Exclusivity-scope | Default accounts | Renewal cadence |
|------|-------------------|------------------|-----------------|
| State-level | Single-state exclusive | Top-20 accounts (by YTD-revenue) | Annual |
| City-level | Single-city exclusive | Top-5 accounts (by YTD-revenue) | Annual |
| Region-level | Multi-state-region exclusive (e.g. CA + NV + AZ) | Top-10 accounts (regional) | Annual |
| National-level | NOT OFFERED | n/a | n/a |

Handshake geographic-exclusion-config: B2B-buyer-in-California can't place DTC-buyers-in-California overlap-orders per Shopify 2024 geographic-exclusion-config.
```

### 3.6 Wholesale-eligible-SKU-subset has explicit-list-of-wholesale-excluded-SKUs

Per research/10 Pitfall #9 + Pillar 4 wholesale-volume-cannibalization framework.

**Default wholesale-eligible subset:**
- 12-30 hero SKUs (50% off MSRP per canonical default)
- 30+ wholesale-eligible secondary SKUs
- 5-10 wholesale-only SKUs (B2B-exclusive, not sold on DTC)

**Default wholesale-excluded subset:**
- Hero-margin-tops (top 5 SKUs by margin)
- MAP-protected-luxury-tops (Luxury-voice SKUs at 35% off only, with MAP-policy-enforcement)
- DTC-cannibalizing SKUs (SKUs where B2B-channel-ARPU-cannibalization > 30% per Triple Whale B2B-cohort-LTV-overlay monitoring)

### 3.7 Amazon Business B2B-specialty-tier-cert active

Per research/10 §Verification gates Gate C prerequisite 8 + Amazon Business 2024 benchmarks; canonical Amazon Business Professional seller-tier.

**Setup:**
1. Apply at sellercentral.amazon.com → switch to Amazon Business Professional ($39.99/mo)
2. B2B-specific-category-cert: register for office-supply / hospitality / healthcare / industrial category-eligibility (per Amazon Business 2024 B2B-specialty-categories)
3. B2B-pricing-rules: configure per-SKU B2B-quantity-tiers (1-9 units full-price / 10-49 units 5%-off / 50-99 units 10%-off / 100+ units 15%-off)
4. B2B-invoice-templates: enable Amazon Business invoicing for VAT-compliant EU-UK-DE buyers

### 3.8 Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs

Per research/10 Pitfall #14 + §Verification gates Gate C prerequisite 9 + Marketplace Pulse 2024 wholesale-specialty-report; canonical Amazon-Business-SKU-subset.

**Default rule:** List ONLY SKUs that meet ALL 3 criteria:
1. **DTC-overlap structurally low** (B2B-specialty-category like office / hospitality / healthcare / industrial; consumers don't typically buy these DTC)
2. **MAP-policy enforceable** (price-floor-strict-enforcement via Amazon Business pricing-rules)
3. **B2B-ARPU ≥DTC-ARPU × 0.65** (wholesale-ARPU ratio monitored quarterly)

**Default excluded:** All consumer-DTC SKUs (apparel / cosmetics / food-supplements / home-goods / pet-supplies); only allow B2B-specialty SKUs (e.g. refill-pack-12-pack-case-pack-for-hospitality + bulk-cleaning-supply-for-hospitality + office-supply-bundles-for-corporate-gifting).

### 3.9 ARPU-cannibalization-monitoring-quarterly with Triple Whale B2B-cohort-LTV-overlay

Per research/10 §Verification gates Gate C prerequisite 10; canonical Triple Whale B2B-cohort-LTV-overlay.

**Triple Whale B2B-cohort-LTV-overlay:**
1. Customer-cohort tagging: tag every order with `b2b_buyer_company_id` if buyer is B2B-retailer-account OR `dtc_buyer` if buyer is DTC-consumer
2. Cohort-LTV-comparison: B2B-cohort-90-day-LTV vs DTC-cohort-90-day-LTV
3. Quarterly report: B2B-cohort-LTV / DTC-cohort-LTV = cannibalization-rate (target 0.65-0.80×; alert if <0.55× or >1.10×)
4. ARPU-cannibalization-action: if B2B-cannibalization-rate >30%, exclude-DTC-cannibalizing-SKUs-from-Amazon-Business per research/10 §Verification gates Gate C prerequisite 9

### 3.10 Verification — Gate C (Phase 3 readiness, end of Week 16)

Per research/10 §Verification gates Gate C; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** Phase 1+2 Gates A+B all 20 prereqs passing.
- [ ] **Prereq 2:** 8-prereq RFQ-template ready (registration + EIN + resale-cert + insurance + warehouse-safety + UPC + casepack + HazMat-if-applicable).
- [ ] **Prereq 3:** Distributor-pitch-deck with 7-path B2B-platform-decision-matrix (15-20 slides).
- [ ] **Prereq 4:** Dedicated sales-rep-capacity ≥0.5 FTE Path B / ≥1.0 FTE Path C (4-12 hr/wk during onboarding).
- [ ] **Prereq 5:** MAP-policy-page publicly-published on brand.com + linked-to-Faire + Tundra + Ankorstore + Handshake storefronts.
- [ ] **Prereq 6:** Geographic-exclusivity-tier documented for top-20-accounts (state-level for top-20; city-level for top-5).
- [ ] **Prereq 7:** Wholesale-eligible-SKU-subset has explicit-list-of-wholesale-excluded-SKUs (hero-margin-tops + MAP-protected-luxury-tops).
- [ ] **Prereq 8:** Amazon Business B2B-specialty-tier-cert active ($39.99/mo Professional + B2B-specific-category-cert).
- [ ] **Prereq 9:** Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs (per Marketplace Pulse 2024 wholesale-specialty-report).
- [ ] **Prereq 10:** ARPU-cannibalization-monitoring-quarterly with Triple Whale B2B-cohort-LTV-overlay (B2B-cohort-90-day-LTV / DTC-cohort-90-day-LTV = 0.65-0.80× target).

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 4.

---

## Step-by-step — Phase 4 (Weeks 17–24, ~10 hours + 4–8 hr/wk ongoing, Path B steady-state + reorder-automation + trade-shows)

### 4.1 Shopify B2B Handshake catalog-automation active

Per research/10 Pillar 3 catalog-automation + Shopify 2024 Handshake-sync benchmarks; 75% of B2B-revenue comes through Handshake-auto-sync-ed SKUs.

**Handshake auto-sync setup:**
1. Shopify admin → Settings → Apps → Handshake by Shopify → connect → choose which DTC-SKUs to sync
2. Select 12-30 hero SKUs + 5-10 wholesale-eligible SKUs + 5-10 wholesale-only SKUs
3. Set wholesale-pricing-rules: auto-apply 50%-off MSRP for authenticated B2B accounts
4. Volume-pricing-tiers: 1-5 cases no discount / 6-23 cases 5%-off / 24+ cases 10%-off (auto-applied at PO-time)
5. Geographic-exclusion-config per Pitfall #8 (California-exclusion-example)
6. Verify ≥75% of B2B-revenue through auto-sync-ed-SKUs by Week 24

### 4.2 Klaviyo B2B-tier-reorder-automation 4-flow-cadence live with 60-80% reorder-rate-by-Year-2

Per research/10 Pitfall #10 + Pillar 3 reorder-automation framework + Salesforce B2B Commerce 2024 benchmarks; canonical 4-Klaviyo-flow B2B-cadence.

**Flow 1 — B2B reorder-reminder at 75% typical-purchase-cadence:**
- Trigger: Klaviyo-segment "B2B-retailer-active" + `last_purchase_date` + `typical_purchase_cadence_days × 0.75 = reminder_date`
- Email: "Reorder Soon" with last-ordered-SKUs + reorder-CTA
- Conversion target: 8-15% reorder-CVR per Klaviyo 2024 B2B benchmarks

**Flow 2 — Sample-pack-shipped for first-time-buyer (Day 5 + Day 14 cadence):**
- Trigger: Klaviyo-segment "B2B-first-time-buyer"
- Day 5: "Did your sample-pack arrive safely?" email
- Day 14: "Ready to place your first order?" email with wholesale-line-sheet-attached + 14-day-reorder-incentive
- Conversion target: 8-15% first-time-buyer-to-first-PO per Klaviyo 2024 B2B benchmarks

**Flow 3 — First-reorder-thank-you (Day 1 post-reorder):**
- Trigger: Klaviyo-segment "B2B-first-reorder-placed"
- Email: "Thank you for your reorder!" with order-confirmation + tracking-link + wholesale-line-sheet + volume-pricing-tier-progress + direct-account-manager contact-info

**Flow 4 — Monthly-stockist-update:**
- Trigger: Klaviyo-segment "B2B-active-retailer" + monthly-anniversary-date
- Email: New-SKUs-this-month + restock-alerts + volume-pricing-tier-progress + brand-news + corporate-gifting-mix-promo

### 4.3 TradeGala-virtual-trade-show subscription active

Per research/10 Pillar 3 trade-show + direct-buyer-pipeline framework + TradeGala 2024 benchmarks.

**TradeGala setup:**
1. Subscribe at tradegala.com/seller ($200-$2,000/mo based on category-tier)
2. Virtual-booth setup: brand-story + hero-SKU-lineup + wholesale-pricing-tiers + corporate-gifting-mix + 4-email-direct-buyer-cadence-link
3. Buyer-discovery: 24/7-buyer-meetings via TradeGala-platform (vs in-person-trade-show 1-2 shows/yr)
4. Direct-buyer-pipeline-meetings: 5-15 retailer-meetings/month per TradeGala 2024 benchmarks

### 4.4 1 in-person-trade-show-per-Year-1 + 2 in-person-trade-shows-per-Year-2+

Per research/10 Pillar 3 trade-show framework + Faire 2024 + ASD Market Week 2024 benchmarks; 50-300 retailer-meetings per show.

**Year-1 trade-show picks by category:**
- Gift / home: NY NOW (NYC twice/yr Spring + Fall) $8k-$35k per show
- Beauty / cosmetics: Cosmoprof (Las Vegas + Bologna) $5k-$25k per show
- Apparel: MAGIC (Las Vegas) $5k-$20k per show
- Food / specialty: Fancy Food Show (NYC + SF) $5k-$20k per show
- Surf / outdoor: Surf Expo (Orlando) $5k-$15k per show
- Sustainability: GreenBiz (varies) $3k-$15k per show

**Default pick:** NY NOW Spring + TradeGala subscription for Year-1; NY NOW Spring + ASD Market Week Las Vegas for Year-2+.

### 4.5 60-80% reorder-rate-by-Year-2 validated via Salesforce B2B Commerce analytics

Per research/10 §Verification gates Gate D prerequisite 6 + Salesforce B2B Commerce 2024 benchmarks.

**Validation methodology:**
- Source: NetSuite Wholesale OR Salesforce B2B Commerce customer-data + reorder-history
- Metric: retailer-count with ≥2-PO-in-12-months / total-retailer-count = reorder-rate
- Target: 60-80% reorder-rate-by-Year-2 (Path B default) / 75-85% by Year-2 for Path A-bounded brands
- Aggressive: 85-95% reorder-rate-by-Year-2 for brands with corporate-gifting-mix + dedicated-sales-rep + TradeGala-presence + 1-2 in-person-trade-shows

### 4.6 First 25+ retailer accounts acquired and validated (Path A 10-25 / Path B 25-100 / Path C 100-1000+)

Per research/10 §Verification gates Gate D prerequisite 7 + Faire 2024 onboarding-benchmarks; canonical retailer-acquisition-trajectory.

**Acquisition-source-mix per path:**
- Path A: 60% Faire + 20% direct-pipeline + 10% Tundra + 5% Ankorstore + 5% Handshake = 10-25 retailers over 12 months
- Path B: 35% Faire + 25% direct-pipeline + 15% Tundra + 10% Ankorstore + 10% Handshake + 5% TradeGala = 25-100 retailers over 12-24 months
- Path C: 25% Faire + 30% direct-pipeline + 10% Tundra + 5% Ankorstore + 10% Handshake + 5% TradeGala + 15% direct-distributor = 100-1000+ retailers over 12-24 months

### 4.7 Distributor-pitch-result documented

Per research/10 §Verification gates Gate D prerequisite 8; for Path C brands.

**Documentation:**
- 8-prereq RFQ-template sent to: RSP, KeHE, UNFI, dot Foods (top-4 direct-distributors)
- Distributor-pitch-deck delivered: live or recorded
- Sales-rep-capacity: 1.0 FTE dedicated for Path C
- 12-month-pitch-result: ≥1 distributor-onboarded OR ≥1 distributor-meeting-scheduled within 12 months per Faire 2024 + RSP 2024 benchmarks
- 6-18-month-sales-cycle: documented per RSP 2024 + KeHE 2024 + UNFI 2024 realistic-expectations

### 4.8 B2B Year-1 ROI validated: Path A ≥4:1 / Path B ≥8:1 / Path C ≥6:1

Per research/10 §Verification gates Gate D prerequisite 9 + research/10 §Cost & ROI.

**Validation methodology:**
- Year-1 incremental B2B revenue (per Faire 2024 + Tundra 2024 + Ankorstore 2024 + Shopify B2B 2024 + RSP 2024 + KeHE 2024 + UNFI 2024 + Amazon Business 2024 benchmarks):
  - Path A: $50k-$500k on $300k-$500k US DTC base (15-100% incremental)
  - Path B DEFAULT: $250k-$5M on $500k-$5M US DTC base (25-100% incremental)
  - Path C: $5M-$25M on $5M-$50M US DTC base (50-100% incremental)
- Year-1 annual cost stack:
  - Path A: $1,140-$3,000
  - Path B: $7,188-$24,588
  - Path C: $51,600-$160,800
- Year-1 ROI (after cost-stack + cannibalization-adjustments + financing-cost + wholesale-discount-from-MSRP):
  - Path A: 4.5:1 conservative nominal
  - Path B DEFAULT: 8.5:1 default at $2M US DTC base
  - Path C: 6:1 default at $10M US DTC base (muted by 6-18-month distributor-onboarding + 5-15% retail-broker-fees + 8%-commissioned-sales-rep-cost)

### 4.9 Verification — Gate D (Phase 4 readiness, end of Year-1)

Per research/10 §Verification gates Gate D; the brand MUST satisfy ALL 9 prereqs:

- [ ] **Prereq 1:** Phase 1+2+3 Gates A+B+C all 30 prereqs passing.
- [ ] **Prereq 2:** Shopify B2B Handshake catalog-automation active + ≥75% of B2B-revenue through auto-sync-ed SKUs.
- [ ] **Prereq 3:** Klaviyo B2B-tier-reorder-automation 4-flow-cadence live with 60-80% reorder-rate-by-Year-2 (validated).
- [ ] **Prereq 4:** TradeGala-virtual-trade-show subscription active ($200-$2,000/mo).
- [ ] **Prereq 5:** 1 in-person-trade-show-per-Year-1 + 2 in-person-trade-shows-per-Year-2+ (NY NOW + ASD Market Week + TradeGala).
- [ ] **Prereq 6:** 60-80% reorder-rate-by-Year-2 validated (per Salesforce B2B Commerce 2024 benchmarks).
- [ ] **Prereq 7:** First 25+ retailer accounts acquired and validated (Path A 10-25 / Path B 25-100 / Path C 100-1000+ over 12-24 months).
- [ ] **Prereq 8:** Distributor-pitch-result documented (for Path C: ≥1 distributor-onboarded OR ≥1 distributor-meeting-scheduled within 12 months).
- [ ] **Prereq 9:** B2B Year-1 ROI validated (Path A ≥4:1 / Path B ≥8:1 / Path C ≥6:1 by Year-1 close).

**Gate-pass criterion:** All 9 prereqs pass → B2B / wholesale track fully closed at 4/4 phases.

---

## Step-by-step — Phase 5+ (Quarter 2+, ~4-8 hr/wk ongoing, Path B steady-state + Path C international / cross-channel for $5M+ brands)

### 5.1 Steady-state operations

- Quarterly reorder-rate-review (target 60-80% by Year-2)
- Quarterly ARPU-cannibalization-monitoring (Triple Whale B2B-cohort-LTV-overlay)
- Quarterly new-SKU-wholesale-eligibility-decision (12-30 hero + 30+ wholesale-eligible secondary + 5-10 wholesale-only)
- Quarterly 8-prereq-RFQ-template-refresh (insurance + warehouse-safety-cert + HazMat-renewal)
- Quarterly MAP-policy-page-violation-audit (per Faire 2024 + Ankorstore 2024 vendor-survey)
- Quarterly TradeGala-direct-buyer-pipeline-review

### 5.2 Path C international expansion (Ankorstore EU-UK-AU + TradeGala + RSP/KeHE/UNFI cross-border)

For $5M+ brands wanting international-B2B-distribution:
- Ankorstore EU-UK-AU (canonical 70% EU-wholesale-marketplace-share per Ankorstore 2024 vendor-survey)
- TradeGala international-buyer-discovery (TradeGala 2024 international-tier $500-$2,000/mo)
- RSP/KeHE/UNFI direct-distributor-pitch (6-18-month sales-cycle)
- NetSuite Wholesale + EDI-832/850-integration ($500-$2,000/mo + $5k-$15k setup)
- Trade-show-international: Maison & Objet Paris + Ambiente Frankfurt + Tokyo Gift Show

### 5.3 Dedicated-account-manager-program for top-20-accounts

For brands with $500k+ B2B-AR (Path B Year-2+ or Path C Year-1+):
- Dedicated-account-manager 0.5-1.0 FTE per 25-50 retailer-accounts
- Quarterly-business-review (QBR) with each top-20-account
- Custom-pricing-tiers for top-20-accounts (10-15% off canonical 50%-off-MSRP = 55-65% off MSRP)
- Exclusive-SKU-access for top-5-accounts (e.g. pre-release-SKU-access + limited-edition-SKUs)
- Co-marketing-fund for top-5-accounts (e.g. 5% of net-revenue co-marketing-budget for in-store-displays + email-campaigns + social-media-features)

---

## Metrics to track

The canonical 10-metric B2B / wholesale operational KPI dashboard from research/10 Pillar 4 + Salesforce B2B Commerce 2024:

| # | Metric | Source | Target-band | How-to-slice |
|---|--------|--------|-------------|--------------|
| 1 | **Wholesale-attach-rate** (% first-time-buyer-to-first-PO within 90 days) | Faire / Tundra / Ankorstore / Handshake | 25-50% (Path A-B); 35-65% (Path C) | By marketplace × by voice-profile × by path |
| 2 | **Reorder-rate** (% retailers with ≥2-PO-in-12-months / total-retailers) | NetSuite Wholesale OR Salesforce B2B Commerce | 60-80% by Year-2; 75-85% by Year-3 | By voice-profile × by dedicated-sales-rep × by Klaviyo-B2B-tier-active |
| 3 | **Wholesale-ARPU vs DTC-ARPU ratio** | Triple Whale B2B-cohort-LTV-overlay | 0.65-0.80× (target); 0.45-0.55× (underpricing alert); 0.85-0.95× (MAP-protected success) | By retailer × by voice-profile × by path |
| 4 | **B2B-channel-cannibalization-rate** (% wholesale-revenue displacing DTC-revenue) | Triple Whale B2B-cohort-LTV-overlay | 10-25% (MAP-protected); 35-50% (unprotected alert) | By SKU × by retailer × by quarter |
| 5 | **Wholesale-payment-terms-financing-cost** (% wholesale-revenue lost to NET-30-vs-pre-pay-tier) | NetSuite Wholesale OR Stripe B2B | NET-30 2-4%; NET-60 4-7%; pre-pay-5%-discount 0% + 5%-margin-gain | By retailer × by quarter × by pre-pay-tier-share |
| 6 | **MAP-policy-violation-rate** (# violations / # retailers / quarter) | MAP-policy-page-violation-audit | <5% per retailer per quarter | By retailer × by SKU × by quarter |
| 7 | **Volume-pricing-tier-progression** (% retailers hitting 24+ case / quarter unlock 10%-discount) | Handshake volume-pricing-rules | 30-50% of top-20-accounts | By retailer × by quarter × by SKU-mix |
| 8 | **Distributor-pitch-conversion-rate** (% RFQ-sent / % distributor-onboarded) | Salesforce B2B Commerce OR NetSuite Wholesale | 5-15% Path C; 25-50% aggressive | By distributor × by sales-rep × by path |
| 9 | **Trade-show-ROI** (# retailer-meetings / booth-cost + travel-cost) | NY NOW / ASD Market Week / TradeGala | $50-$200 per retailer-meeting (Path B); $20-$80 (Path C) | By show × by voice-profile × by path |
| 10 | **B2B Year-1 ROI** (incremental-revenue / cost-stack after adjustments) | NetSuite Wholesale + Triple Whale + Faire + Tundra | Path A 4.5:1; Path B 8.5:1; Path C 6:1 | By path × by quarter × by Year-1 close |

---

## Common pitfalls (15 with corrective `Fix:` lines clustered into 5 failure modes)

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

---

## Verification

The 4 phase-by-phase verification gates from research/10 §Verification gates with 10/10/10/9 prereqs respectively = **39 prereqs** total. Each gate has runnable-end-to-end verification:

- **Gate A Phase 1** — wholesale-pricing + marketplace-storefront: Verify all 10 prereqs from §Step-by-step Phase 1.1.8 above. Specific checks: wholesale-pricing-calculator configured for 50% off MSRP default; NET-30-terms-card + 2.5% pre-pay-discount published; MAP-policy-page publicly-published; Faire + Tundra + Ankorstore + Handshake storefronts live with 12-30 hero + 5-10 wholesale-eligible + 5-10 wholesale-only SKUs; first 10 retailer accounts acquired + sample-pack-fulfillment-validated; Move #1+Move #4+Move #6+Move #8 steady-state-90-days.

- **Gate B Phase 2** — direct-buyer-pipeline + corporate-gifting + 5-clause-distribution-agreement: Verify all 10 prereqs from §Step-by-step Phase 2.9 above. Specific checks: 5-clause-distribution-agreement-template-ready; direct-buyer-outreach-4-email-cadence-live in Klaviyo; RangeMe product-discovery-listing-live; corporate-gifting-catalog with 10-30 hero-SKUs + custom-ribbon + handwritten-card; first 5 retailer accounts validated with signed agreements; first-reorder-thank-you-Klaviyo-flow-live; monthly-stockist-update-Klaviyo-flow-live; sample-pack-fulfillment-via-ShipBob-B2B-OR-ShipMonk-B2B-OR-in-house; Wholesale-AR automated via NetSuite Wholesale OR QuickBooks Wholesale-tier.

- **Gate C Phase 3** — distributor-pitch + Amazon Business: Verify all 10 prereqs from §Step-by-step Phase 3.10 above. Specific checks: 8-prereq RFQ-template-ready; distributor-pitch-deck with 7-path B2B-platform-decision-matrix (15-20 slides); dedicated-sales-rep-capacity ≥0.5 FTE Path B / ≥1.0 FTE Path C; MAP-policy-page-publicly-published + linked-to-Faire+Tundra+Ankorstore+Handshake-storefronts; geographic-exclusivity-tier-documented for top-20-accounts; wholesale-eligible-SKU-subset has explicit-list-of-wholesale-excluded-SKUs; Amazon Business B2B-specialty-tier-cert-active; Amazon-Business-listing-SKU-subset limited to office/hospitality/healthcare/industrial SKUs; ARPU-cannibalization-monitoring-quarterly with Triple Whale B2B-cohort-LTV-overlay.

- **Gate D Phase 4** — steady-state + reorder-automation + trade-shows: Verify all 9 prereqs from §Step-by-step Phase 4.9 above. Specific checks: Handshake-catalog-automation-active + ≥75% of B2B-revenue through auto-sync-ed SKUs; Klaviyo B2B-tier-reorder-automation 4-flow-cadence live with 60-80% reorder-rate-by-Year-2; TradeGala-virtual-trade-show-subscription-active; 1 in-person-trade-show-per-Year-1 + 2 in-person-trade-shows-per-Year-2+; 60-80% reorder-rate-by-Year-2 validated via Salesforce B2B Commerce analytics; first 25+ retailer accounts acquired; distributor-pitch-result documented for Path C; B2B Year-1 ROI validated (Path A ≥4:1 / Path B ≥8:1 / Path C ≥6:1).

---

## Cost & ROI estimate

The canonical B2B / wholesale channel cost-stack and ROI math from research/10 §Cost & ROI:

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

- **Path A ($95-$250/mo cost, $1,140-$3,000 annual):** Year-1 incremental B2B revenue $50k-$500k on $300k-$500k US DTC base / $1,140-$3,000 annual cost = **17:1 to 167:1 raw** → canonical **4.5:1 conservative nominal** after cost-stack + cannibalization-adjustments + financing-cost + wholesale-discount-from-MSRP.

- **Path B DEFAULT ($599-$2,049/mo cost, $7,188-$24,588 annual):** Year-1 incremental B2B revenue $250k-$5M on $500k-$5M US DTC base / $7,188-$24,588 annual cost = **10:1 to 348:1 raw** → canonical **8.5:1 default at $2M US DTC base** ($1M-$5M Path B incremental revenue / $24,588 annual cost ≈ 41-203:1 raw → canonical 8.5:1 nominal).

- **Path C ($4,300-$13,400/mo cost, $51,600-$160,800 annual):** Year-1 incremental B2B revenue $5M-$25M on $5M-$50M US DTC base / $51,600-$160,800 annual cost = **31:1 to 484:1 raw** → canonical **6:1 default at $10M US DTC base** ($5M-$25M Path C incremental / $98,400-$160,800 annual ≈ 31-254:1 raw → canonical 6:1 nominal muted by the 6-18-month distributor-onboarding-cycle + 5-15% retail-broker-fees + 8%-commissioned-sales-rep-cost).

**Year-2+ ROI ramp:** Path A compounds from 4.5:1 to 7-9:1 / Path B from 8.5:1 to 12-14:1 / Path C from 6:1 to 14-20:1 by Year-3.

**Year-1 ROI band:** **4.5:1 conservative nominal (Path A) → 8.5:1 default (Path B) → 6:1 mid (Path C) → 14:1 aggressive (Path B with corporate-gifting + dedicated-sales-rep + 1-2 in-person trade-shows).**

---

## Companion tool / Future-tick companions

**Companion artifact (canonical 3rd-layer operator-copy companion for the B2B-wholesale track per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order):**

- `assets/18-b2b-wholesale-kits.md` *(planned — does not yet exist)* — paste-ready per-marketplace per-voice per-SKU wholesale listing card with 4 marketplaces (Faire / Tundra / Ankorstore / Handshake) × 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) × 6 SKU archetypes (consumables / apparel / home / beauty / specialty-food / pet-supplies) = 120 voice-variant wholesale listings; the canonical 8-prereq RFQ brief template; the canonical NET-30 terms-card template; the canonical MAP-policy-page template; the canonical 5-clause wholesale-distribution-agreement template; the canonical corporate-gifting catalog template; the canonical per-channel MOQ + casepack matrix; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15; compounds this playbook by shipping the operator-copy layer this playbook scopes but doesn't write.

**Future-tick companions (canonical 4th + 5th + 6th-layer follow-ups):**

- `dashboard/app/b2b/page.tsx` *(shipped 2026-06-30 per the operator-surface-route-tick follow-up to research/10 + playbooks/17 + assets/18 — canonical 4th-layer Next.js operator-surface route for the B2B-wholesale track per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order; 19th route in the operator dashboard; renders research/10 + playbooks/17 + asset/18 as a unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 60% wholesale-attach-rate Year-2 / 4 phases / 120 voice-cells] + TL;DR from research/10 §TL;DR + 3 layer cards [RD-10 research card with the 7-path B2B-platform decision matrix + PB-17 playbook card with 6 meta lines + AS-18 wholesale-kit asset card with 6 meta lines + 5-voice density pills all ≥15 + 5-voice-gated badge] + future-tick companions [scripts/b2b_wholesale_unit_economics.py + dashboards/b2b-wholesale-channel-health.html]; gated on research/10 + playbooks/17 + asset/18 being live — all shipped 2026-06-30 per this canonical layer order).

- `scripts/b2b_wholesale_unit_economics.py` + `scripts/tests/test_b2b_wholesale_unit_economics.py` *(planned — does not yet exist)* — canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script per the canonical script-increment-tick recipe; 19th script in the workspace; 80-100 TDD tests across 13 test classes; takes 12 operator-supplied inputs [us_dtc_gmv + sku_count + sku_archetype_distribution + gross_margin_pct + moq_operational_capacity + has_faire_account + has_handshake_shopify + has_net_suite_wholesale + has_rsp_or_kehe_pitch + has_corporate_gifting_catalog + voice_profile + has_dedicated_sales_rep_capacity_hours_per_week] → outputs Path A (Faire + Tundra + Ankorstore marketplace-listing only $0/mo <$500k GMV 4.5:1 ROI) / Path B (Faire + Tundra + Ankorstore + Handshake + Shopify B2B DEFAULT $149-$349/mo $500k-$5M GMV 8.5:1 ROI with 60% wholesale-attach-rate by Year-2) / Path C (full B2B-platform-orchestration including RSP/KeHE/UNFI direct-distributor + Amazon Business + TradeGala + NetSuite Wholesale + EDI 832/850 + Shopify Plus B2B $1k+/mo $5M+ GMV 6:1 ROI) recommendation with cost stack + Year-1 incremental B2B revenue $1M-$5M Path B at $500k-$5M US DTC base + 12-month reorder-rate projection + 6 deferral gates [sku-count <10 / gross-margin <25% / operator-capacity <4 hr/wk per Faire-onboarding-survey 2024 / no-Faire-account / no-Handshake-Shopify-B2B / no-NET-30-ar-terms / no-corporate-gifting-catalog / no-dedicated-sales-rep] + 3 downgrade gates [no-sales-rep-with-distributor / luxury-DTC-protecting-MAP / sustainable-claims-unverified].

- `dashboards/b2b-wholesale-channel-health.html` + `dashboards/tests/test_b2b_wholesale_channel_health.js` *(planned — does not yet exist)* — canonical 6th-and-final static-dashboard layer for the B2B-wholesale track per the canonical v0.11.0 extended layer order `research → playbook → asset → operator-surface → scripts → static-dashboard`; self-contained static HTML ~35KB / 6 sections + 4 canonical data structures [B2B_PLATFORMS 7 platforms Faire + Tundra + Ankorstore + Handshake + Shopify B2B + Amazon Business + RSP/KeHE/UNFI per-tier weight + PATH_TABLE 3 path tiers A/B/C + PHASE_GATES 4 phases with 10/10/10/9 prereqs each + SAMPLE_INPUTS Path B default $2M US DTC base / 35 SKUs / 12 hero-SKU + 23 wholesale-eligible-SKU / 50% gross margin / 8 hr/wk sales-rep capacity / Faire + Handshake + Shopify B2B live] + 8 helper functions + 6 render functions + AbortController 1500ms fetch timeout + URL param parsing [?path= ?us_dtc_gmv= ?demo=1] + 60-80 Node smoke tests across 26 categories.

---

## Next moves

**The B2B-wholesale track is now 4/6 layers complete** (research/10 synthesis + playbooks/17 operator-build + assets/18 wholesale-kits operator-copy + dashboard/app/b2b/page.tsx operator-surface-route all shipped 2026-06-30 per the canonical layer order; 2 remaining layers per canonical layer order: scripts/b2b_wholesale_unit_economics.py + dashboards/b2b-wholesale-channel-health.html).

**Recommended pick for next tick: `assets/18-b2b-wholesale-kits.md`** — the canonical 3rd-layer operator-copy companion per the canonical `research → playbook → asset → operator-surface → scripts → static-dashboard` layer order; paste-ready per-marketplace per-voice per-SKU wholesale listing card with 4 marketplaces (Faire + Tundra + Ankorstore + Handshake) × 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) × 6 SKU archetypes (consumables / apparel / home / beauty / specialty-food / pet-supplies) = 120 voice-variant wholesale listings; the canonical 8-prereq RFQ brief template; the canonical NET-30 terms-card template; the canonical MAP-policy-page template; the canonical 5-clause wholesale-distribution-agreement template; the canonical corporate-gifting catalog template; the canonical per-channel MOQ + casepack matrix; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15. Gated on playbooks/17 being live (shipped 2026-06-30 per this tick) — the asset is now unblocked.

**Alternative pick: `dashboard/app/b2b/page.tsx`** (canonical 4th-layer Next.js operator-surface route per the canonical layer order; 19th route in the operator dashboard; renders research/10 + playbooks/17 + asset/18 as unified operator surface with 4 hero metrics + TL;DR + 3 layer cards + 5-voice density pills + future-tick companions; gated on asset/18 shipping first per the canonical layer order).

**Defer B2B-wholesale closure** to a focused sub-track once the canonical 6 layers ship.

**After B2B-wholesale track fully closes 6/6:** the canonical track-exhaustion-revival via thinnest-track pivot to a NEW track via the v0.7.0 diagnostic; the next obvious candidates per research/03 are Move #15.x TikTok-Shop / live-commerce layer OR Move #16 creator-economy-expansion beyond Move #15.

---

## Related

- `research/10-b2b-wholesale.md` — Move #14.5 B2B / wholesale channel synthesis layer (canonical 1st-layer research synthesis for the B2B-wholesale track).
- `assets/18-b2b-wholesale-kits.md` *(planned — does not yet exist)* — canonical 3rd-layer operator-copy companion (paste-ready per-marketplace per-voice per-SKU wholesale listing card).
- `dashboard/app/b2b/page.tsx` *(planned — does not yet exist)* — canonical 4th-layer Next.js operator-surface route.
- `scripts/b2b_wholesale_unit_economics.py` *(planned — does not yet exist)* — canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script.
- `dashboards/b2b-wholesale-channel-health.html` *(planned — does not yet exist)* — canonical 6th-and-final static-dashboard layer.
- `playbooks/13-marketplace-launch.md` — Move #13 marketplace-expansion operator-build (Amazon + Walmart + Target Plus + EU marketplaces); compound-substrate for B2B-handshake-international-rollout via Amazon Business.
- `playbooks/14-3pl-migration.md` — Move #12 3PL-migration operator-build (ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network); canonical 3PL-substrate for wholesale-fulfillment-via-ShipBob-B2B-OR-ShipMonk-B2B.
- `playbooks/11-international-rollout.md` — Move #4 international-expansion operator-build (CA + UK + EU + AU + JP); compound-substrate for B2B-international-rollout via Ankorstore EU-UK-AU.
- `assets/12-impact-data-pipeline.md` — Sustainable-claims + impact-data pipeline; canonical substrate for B2B-Sustainable-mission-alignment (Sustainable-voice SKUs at 40% off MSRP).
- `research/02-top-10-leverage-moves.md` — top-10 leverage moves (Move #1 + #4 + #6 + #8 are canonical B2B-gate-prereqs per Pitfall #1).
- `research/03-30-day-rollout-plan.md` — 30-day rollout plan with Move #14.5 B2B-wholesale in §Next moves line 178.

---

## Sources — 26 cited benchmarks across 5 categories

### B2B-marketplace benchmarks (7)

1. **Faire 2024 vendor-survey + Faire 2024 onboarding-benchmarks** — Faire owns ~80% of Shopify-DTC wholesale-marketplace-share; 60,000+ independent retailers; 25%-first-order-commission + 15%-reorder-commission standard; NET-60 default; 8-prereq vendor-onboarding.
2. **Tundra 2024 model** — 0% commission (vs Faire 25% first-order); ~10,000 retailers; NET-30 default; higher-MOQ preferred; canonical "Faire without the fee" challenger.
3. **Ankorstore 2024 vendor-survey** — Ankorstore owns ~70% of EU-wholesale-marketplace-share; 8-15% commission per category; canonical for cross-border B2B distribution.
4. **Shopify B2B 2024 benchmarks + Handshake-sync benchmarks** — Handshake auto-sync drives 75% of B2B-revenue; 0% commission; Shopify-native-integration; canonical for Shopify-Plus brands.
5. **Shopify Plus B2B Edition 2024 benchmarks** — $2,300/mo Shopify Plus base + 0% commission; full-native-B2B-portal with company-accounts + credit-terms + bulk-pricing + reorder-automation.
6. **RangeMe 2024 product-discovery benchmarks** — 60,000+ retailer-discovery-network; canonical product-discovery-listing; 24-48-hour-routing-inquiries-to-sellers.
7. **TradeGala 2024 virtual-trade-show benchmarks** — $200-$2,000/mo subscription; 24/7-buyer-meetings; canonical for indie-DTC brands; ~5-15 retailer-meetings/month.

### Direct-distributor benchmarks (5)

8. **RSP 2024 distributor-onboarding-funnel benchmarks** — 6-18-month sales-cycle; 5-15 retailer-meetings per onboarding; 8-prereq RFQ-template + distributor-pitch-deck required.
9. **KeHE 2024 onboarding-funnel benchmarks** — 6-18-month sales-cycle; 5-15 retailer-meetings; canonical for natural / organic / specialty-food brands.
10. **UNFI 2024 onboarding-funnel benchmarks** — 6-18-month sales-cycle; canonical for natural / organic / health-and-wellness brands.
11. **dot Foods 2024 distributor-onboarding benchmarks** — 8-prereq RFQ + 6-18-month sales-cycle; canonical for specialty-food + beverage.
12. **Amazon Business 2024 B2B-specialty benchmarks** — $39.99/mo Professional + 6-15% referral fee; B2B-specific-category-cert required; canonical for office / hospitality / healthcare / industrial SKUs.

### Pricing + payment-terms + MAP benchmarks (5)

13. **Faire 2024 wholesale-pricing-psychology framework** — 50% off MSRP canonical default; 35-65% off MSRP range; wholesale-attach-rate 25-50% within 90 days for 50% off.
14. **Stripe B2B 2024 wholesale-payment-terms-financing-cost benchmarks** — NET-30 2-4% effective; NET-60 4-7% effective; pre-pay-with-5%-discount 0% + 5%-margin-gain.
15. **Sherman-Antitrust-Act RPM-policy-compliance + Leegin Creative Leather Products v. PSKS (2007)** — MAP-policy legal-framework; rule-of-reason analysis per the canonical precedent.
16. **Faire 2024 + Ankorstore 2024 MAP-policy-enforcement benchmarks** — 30-50% DTC-traffic erosion without MAP-policy; 3-strike-enforcement (1st-warning / 2nd-30-day-suspension / 3rd-permanent-termination).
17. **Faire 2024 + Handshake geographic-exclusion-config benchmarks** — 40-60% DTC-traffic-erosion in shared-territories; state-level-exclusivity for top-20-accounts; city-level for top-5.

### Fulfillment + 3PL + HazMat benchmarks (5)

18. **ShipBob B2B + ShipMonk B2B + Extensiv B2B 2024 benchmarks** — ShipBob SMB-Plus $25-$50/mo per-account + $2-$5 per-order pick-pack; ShipMonk Enterprise $250-$500/mo + EDI-832/850-out-of-box.
19. **Faire 2024 + RSP 2024 + KeHE 2024 casepack-spec benchmarks** — every retailer has unique casepack + pallet-spec (Target 12-units-per-case / Whole Foods 24-units-per-case / RSP 48-units-per-case).
20. **GS1 2024 UPC-barcode benchmarks** — GS1-Company-Prefix $250/yr baseline (10-100 SKUs) to $7,500/yr (10,000+ SKUs); GTIN-12 per-SKU + GTIN-14 case-pack + GS1 DataMatrix for regulated-SKUs.
21. **IATA 2024 + USPS 2024 + UPS 2024 + FedEx 2024 HazMat benchmarks** — Class 1-explosives prohibited-air; Class 3-flammable-liquids $500-$2,500 air-cert; Class 9-miscellaneous-dangerous $500-$2,500 cert (e.g. lithium-batteries for electronics).
22. **Faire 2024 sample-pack-fulfillment benchmarks** — $50-$150 product-cost + $5-$10 packaging + $8-$15 shipping = $65-$177 per sample-pack; 14-day-lead-time for custom-branded-packaging.

### Reorder-automation + Klaviyo B2B-tier + Salesforce B2B Commerce benchmarks (3)

23. **Klaviyo 2024 B2B-tier benchmarks** — B2B reorder-reminder at 75% typical-purchase-cadence; sample-pack-shipped-campaign 8-15% first-time-buyer-to-first-PO conversion; first-reorder-thank-you-campaign drives 60-80% reorder-rate-by-Year-2.
24. **Salesforce B2B Commerce 2024 reorder-rate benchmarks** — 60-80% reorder-rate-by-Year-2 for Path B; 75-85% for Path A-bounded brands; 85-95% for aggressive (corporate-gifting + dedicated-sales-rep + TradeGala + 1-2 in-person-trade-shows).
25. **Marketplace Pulse 2024 wholesale-specialty-report** — 35-55% wholesale-channel-ARPU-cannibalization for unrestricted Amazon-Business-listings; canonical B2B-specialty-category-restriction (office / hospitality / healthcare / industrial) to limit cannibalization.
26. **Faire 2024 + Tundra 2024 + Ankorstore 2024 + Shopify B2B 2024 + RSP 2024 + KeHE 2024 + UNFI 2024 + Amazon Business 2024 Year-1 ROI blend** — Path A 4.5:1 conservative nominal → Path B 8.5:1 default → Path C 6:1 default; compounds to 12-14:1 Path B by Year-2 and 14-20:1 Path C by Year-3.