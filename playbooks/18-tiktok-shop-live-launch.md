# TikTok Shop / Live-Commerce Launch — Operator Build (TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Klaviyo-TikTok-channel + Triple-Whale-TikTok-attribution + LIVE-shopping-studio + creator-affiliate-onboarding)

> **Source.** Operator-build companion to `research/11-tiktok-shop-live-commerce.md` (the canonical 11-section TikTok Shop / live-commerce research synthesis; Move #15.x from `research/03-30-day-rollout-plan.md` §Next moves; the TikTok-Shop / live-commerce + 5-20% of US social-commerce GMV by 2026 + 70%+ TikTok users 18-34 = 3-5× higher TikTok-Shop-conversion + LIVE-shopping 5-15% CVR vs 1-3% in-feed + Shop-Score 4.8+ algorithmic-distribution-bonus layer the US-centric Shopify-DTC stack implicitly defers). Read `research/11-tiktok-shop-live-commerce.md` FIRST for the 5-pillar framework [Pillar 1 TikTok-Shop-Seller-Center + category-approval + product-feed-optimization / Pillar 2 creator-affiliate-onboarding + 5-payout-structures + creator-brief-templates / Pillar 3 shoppable-video-ads + Spark-Ads-boost + In-Feed-Ads-with-Product-Module + Top-View-Ads / Pillar 4 LIVE-shopping-launch + 4-hour-week-cadence + 5-segment-LIVE-show-runner-script / Pillar 5 Triple-Whale-TikTok-attribution + cohort-LTV-iteration + Shop-Score-4.8+-audit] + 3 GMV-tier paths [Path A creator-affiliate-only + shoppable-video-ads $0/mo <$500k GMV 4.5:1 conservative / Path B creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week $0-$2k/mo $500k-$5M GMV 8.5:1 default / Path C full TikTok-Shop-orchestration $2k-$10k/mo $5M+ GMV 6:1 muted by 6-12-month LIVE-cadence-build-cycle] + 4 phase-by-phase verification gates [Gate A Phase 1 TikTok-Shop-Seller-Center-onboarding + category-approval + first-50-creator-affiliate-onboarding 10 prereqs / Gate B Phase 2 shoppable-video-ads-launch + creator-affiliate-cohort-LTV-measurement 10 prereqs / Gate C Phase 3 LIVE-shopping-launch + TikTok-Shop-affiliate-program-launch 10 prereqs / Gate D Phase 4 steady-state + Shop-Score-4.8+ + LIVE-cadence-optimization 9 prereqs] + 15 pitfalls with corrective `Fix:` lines clustered into 6 failure modes [A platform-selection / B creator-affiliate / C shoppable-video-ads / D LIVE-shopping / E attribution-measurement / F operational cross-cutting]. This playbook maps each pillar into step-by-step TikTok-Shop-Seller-Center + Shopify-TikTok-Channel + Klaviyo-TikTok-channel + Triple-Whale-TikTok-attribution + LIVE-shopping-studio operator build across 4 phases (Phase 1 TikTok-Shop-onboarding + category-approval + 8-prereq-onboarding-pack + first-50-creator-affiliate ~12hr Path B baseline Weeks 1-2 / Phase 2 shoppable-video-ads-launch + Spark-Ads-boost + creator-affiliate-cohort-LTV-measurement + Triple-Whale-TikTok-attribution-wire ~16hr Weeks 3-6 / Phase 3 LIVE-shopping-studio-build + 4-hour-week-cadence-launch + 5-segment-LIVE-show-runner-script + TikTok-Shop-affiliate-program-launch + Triple-Whale-cohort-LTV-overlay-iteration ~24hr Weeks 7-12 / Phase 4 steady-state + Shop-Score-4.8+-audit + LIVE-cadence-optimization + Triple-Whale-cohort-LTV-iteration-cycle ~16hr + 4-8 hr/wk ongoing + dedicated-0.25-0.5-FTE-creator-Affiliate-manager in Year-2+ Weeks 13-16). Pairs with `assets/19-tiktok-shop-creator-briefs.md` *(planned — does not yet exist)* (canonical 3rd-layer operator-copy companion — paste-ready per-voice per-SKU-archetype creator-brief template with 5 voice profiles × 6 SKU archetypes = 30 voice-variant creator-briefs; the canonical LIVE-shopping-show-runner-script-template; the canonical TikTok-Shop-product-listing-optimization-checklist; the canonical creator-payout-contract-template with 5-payout-structures; the canonical Shop-Score-4.8+-audit-template; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15) + `dashboard/app/tiktok/page.tsx` *(planned — does not yet exist)* (canonical 4th-layer Next.js operator-surface route — renders research/11 + playbooks/18 + assets/19 as unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 4.8+ Shop-Score target / 4-phase LIVE cadence / 30 voice-cells] + TL;DR from research/11 + 3 layer cards [RD-11 + PB-18 + AS-19] + future-tick companions [scripts/tiktok_shop_unit_economics.py + dashboards/tiktok-shop-live-commerce-health.html]) + Move #1 cart-abandon (TikTok-Shop-cart-abandon-aware + creator-driven-cart-abandon) + Move #4 welcome-series (TikTok-Shop-welcome-flow + creator-endorsed-welcome) + Move #6 Triple Whale attribution (TikTok-Shop-cohort-LTV-overlay + creator-cohort-attribution) + Move #7 SMS (TikTok-Shop-flash-sale-SMS + creator-led-SMS) + Move #8 loyalty (TikTok-Shop-tier-promotion + Smile.io-creator-tier + 2× points for TikTok-Shop-driven-customers) + Move #11 subscription (TikTok-Shop-led-subscription-box + creator-cohort-subscription-tier) + Move #15 affiliate-program (TikTok-Shop-affiliate-program-on-top-of-Refersion-affiliate-program).

---

## Goal

By the end of this playbook (Weeks 1-2 for Path A / Weeks 1-16 for Path B / Weeks 1-32 for Path C), the operator has:

1. **TikTok-Shop-Seller-Center-onboarded + category-approval-approved + 8-prereq-onboarding-pack complete + first-50-creator-affiliate onboarded** — per the canonical 10 permitted-categories [Beauty / Fashion-Accessories / Home / Electronics / Food-and-Beverage / Pet / Baby / Health / Outdoor / Toys-and-Collectibles] from research/11 Pillar 1; category-approval-application-timeline 1-4 weeks per TikTok-for-Business-2024; rejection-rate 30-50% for first-time-applicants per Jungle-Scout-2024; canonical 8-prereq onboarding-pack [TikTok-Business-Account + category-approval-application + Shop-Score-baseline-audit + creator-affiliate-pool-baseline + LIVE-shopping-studio-build + TikTok-Shop-product-feed-optimization + Klaviyo-TikTok-channel-integration + Triple-Whale-TikTok-attribution-setup] + canonical creator-affiliate-pool-build via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape per the canonical 4-channel creator-affiliate-pool-build from Move #15 affiliate-program playbook-16 benchmarks.
2. **Shoppable-video-ads-launched + Spark-Ads-boost-running + creator-affiliate-cohort-LTV-measurement wired via Triple-Whale-TikTok-attribution** — per research/11 Pillar 3 shoppable-video-ads architecture; canonical Spark-Ads-boost [boost top-performing organic-creator-content as paid-Spark-Ads $50-$500/day per audience-segment; 50-70% of budget to Spark-Ads per TikTok-Ads-Manager-2024-benchmarks] + In-Feed-Ads with Product-Module (TikTok-Shop-product-card-in-feed; CVR 2-4× vs ads-without-Product-Module per eMarketer-2024) + Top-View-Ads (full-screen-takeover with TikTok-Shop-product-module) + Triple-Whale-TikTok-cohort-overlay-wire [TikTok-Shop-driven-cohort vs organic-DTC-cohort vs paid-Meta-cohort at 30/60/90-day windows per Triple-Whale-TikTok-attribution-2024].
3. **LIVE-shopping-studio-built + 4-hour-week-cadence-launched + 5-segment-LIVE-show-runner-script-tested + TikTok-Shop-affiliate-program-launched** — per research/11 Pillar 4 LIVE-shopping-launch-framework; canonical LIVE-shopping-studio-build $500-$2k one-time [Ring-light + iPhone-15-Pro + tripod + lavalier-mic + 1080p-webcam + backdrop + teleprompter-app + LIVE-streaming-software Streamlabs-OBS-or-TikTok-LIVE-Studio $0/mo] + canonical 4-hour-week-cadence [1-LIVE-session-per-week 60-90-minutes-per-session per TikTok-LIVE-2024-benchmarks; optimal cadence 1-2-sessions/week for brands with 4-8-hr/wk operator-capacity] + canonical 5-segment-LIVE-show-runner-script-template [Segment-1 product-intro with hero-SKU + Segment-2 demo + Segment-3 Q&A with chat-responder + Segment-4 creator-guest-takeover + Segment-5 closing-limited-time-offer with TikTok-Shop-flash-sale] + TikTok-Shop-affiliate-program-launch (separate from creator-affiliate-onboarding in Phase 1; 20-30%-of-GMV commission + 30-day-cookie-window per Move #15-affiliate-program-Playbook-16-benchmarks).
4. **Shop-Score-4.8+-audit-process live + LIVE-cadence-optimization-flow running + Triple-Whale-cohort-LTV-iteration-cycle weekly** — per research/11 Pillar 5 Shop-Score-steady-state-framework; canonical 5-metric Shop-Score-audit [positive-review-rate ≥95% / ship-on-time-rate ≥95% / return-rate ≤5% / chat-response-rate ≥90% / chat-response-time ≤5-min per TikTok-Shop-Shop-Score-2024]; canonical LIVE-cadence-optimization-flow [A/B-test 1-vs-2-vs-3-LIVE-sessions/week with same-creator + same-product + same-time-slot; measure GMV-per-hour-LIVE]; canonical Triple-Whale-cohort-LTV-iteration-cycle [weekly-review of TikTok-Shop-driven-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV; iterate creator-affiliate-payout-structure per the canonical 5-payout-structures].
5. **Steady-state TikTok-Shop / live-commerce channel live + 4.8+ Shop-Score validated + 5-15% incremental-GMV-contribution achieved + TikTok-Shop Year-1 ROI validated** — research/11 §Cost & ROI steady-state benchmarks; 5-15% incremental-GMV-contribution at $500k-$5M US DTC base per eMarketer-2024 + TikTok-for-Business-2024 + Jungle-Scout-2024 + Insider-Intelligence-2024 + NRF-2024 + Modern-Retail-2024 benchmarks; 4.8+ Shop-Score validated (positive-review-rate + ship-on-time-rate + return-rate + chat-response-rate + chat-response-time all within canonical bands); TikTok-Shop Year-1 ROI validated (Path A ≥4.5:1 / Path B ≥8.5:1 / Path C ≥6:1 by Year-1 close per research/11 §Cost & ROI).

**Operator time commitment:** Path A ~25 hours one-time + 2 hr/wk ongoing = **~130 hr Year-1**. Path B ~70 hours one-time + 4-8 hr/wk ongoing + 0.25-0.5 FTE dedicated-creator-affiliate-manager in Year-2+ = **~330 hr Year-1 + $20k-$40k FTE amortized**. Path C ~150 hours one-time + 15-25 hr/wk steady-state + dedicated full-FTE creator-affiliate-manager = **~950 hr Year-1 + $70k-$100k FTE**.

**Default path: Path B mid-market creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week $500k-$5M GMV / 10-50 SKUs / 25%+ TikTok-Shop-margin-headroom / 20-50 active creator-affiliates / 4.8+ Shop-Score target** — the canonical 8.5:1 default Year-1 ROI per research/11 §Cost & ROI ($500k-$1M Path B Year-1 incremental TikTok-Shop-GMV / $24k-$58k annual cost stack). Path A is the lean starter (creator-affiliate-only + shoppable-video-ads; <$500k GMV; <10 SKUs; 4.5:1 conservative nominal Year-1 ROI). Path C is the enterprise scale (full TikTok-Shop-orchestration including daily-LIVE-cadence + TikTok-Shop-affiliate-program + Klaviyo-TikTok-channel + Triple-Whale-TikTok-cohort-overlay; $5M+ GMV; 50+ SKUs; 6:1 default Year-1 ROI muted by 6-12-month LIVE-cadence-build-cycle + creator-affiliate-churn-rate + dedicated-team-cost; compounds to 12-14:1 by Year-3 once LIVE-cadence-portfolio is mature).

---

## Which TikTok-Shop-launch-mode fits your GMV tier + ops capacity

The canonical 5-path TikTok-Shop-launch-mode decision matrix from research/11 Pillar 1 + the canonical creator-affiliate-pool-build from Move #15:

| Path | Best for | Setup cost | Per-month cost | Annual revenue | Migration-from | When to use |
|---|---|---|---|---|---|---|
| **Path A — creator-affiliate-only + shoppable-video-ads** | Brands <$500k GMV; <10 SKUs; <2 hr/wk operator capacity; cash-constrained | $0 (organic-creator-content) + $50-$200/day Spark-Ads | $1.5k-$6k/mo | $25k-$250k incremental TikTok-Shop-GMV Year-1 | n/a | First-time TikTok-Shop test; brand has Gen-Z-audience-skew ≥40% + 1-share-worthy-SKU + 5-creator-affiliates |
| **Path B — creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week (DEFAULT)** | Brands $500k-$5M GMV; 10-50 SKUs; 4-8 hr/wk operator capacity; profitable-DTC | $500-$2k one-time studio-build + $50-$500/day Spark-Ads + $0-$500/session LIVE-show | $2k-$5k/mo | $500k-$1M incremental TikTok-Shop-GMV Year-1 | Path A: add LIVE-shopping-studio + 4-hr/wk-cadence | Default mid-market TikTok-Shop-launch with LIVE-shopping |
| **Path C — full TikTok-Shop-orchestration** | Brands $5M+ GMV; 50+ SKUs; 15-25 hr/wk operator capacity + dedicated-creator-affiliate-manager; profitable-DTC | $2k-$5k studio-build + 0.25-1.0 FTE dedicated-team | $5k-$15k/mo + $20k-$40k FTE amortized | $1M-$5M incremental TikTok-Shop-GMV Year-1 | Path B: add daily-LIVE-cadence + TikTok-Shop-affiliate-program + Klaviyo-TikTok-channel + Triple-Whale-TikTok-cohort-overlay | Enterprise scale with dedicated creator-affiliate-team + LIVE-cadence-portfolio |
| **Path D — TikTok-Shop-affiliate-program-only** | Brands with Refersion-or-Levanta-already-live + want TikTok-Shop-channel-on-top | $0 (TikTok-Shop-affiliate-program-self-serve) | $0 + 20-30%-of-GMV commission | $50k-$250k incremental TikTok-Shop-GMV Year-1 | Move #15-affiliate-program playbook-16 | Brands already running Move #15 + want TikTok-Shop-channel-on-top without creator-content |
| **Path E — pre-revenue / pre-launch / defer** | Brands <10 SKUs + <25% gross-margin + no-creator-affiliate-pool + no-LIVE-capacity + <40% Gen-Z-audience-skew | $0 | $0 | $0 (defer) | n/a | Defer TikTok-Shop until SKU-broadness + margin + creator-pool + LIVE-capacity + Gen-Z-audience-skew all improve |

**The 4-channel default creator-affiliate-pool-build (TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape)** covers **~85% of typical Shopify-DTC creator-affiliate-pool-build needs** at **$0 + creator-product-seeding-cost** Path A-B cost stack per Move #15-affiliate-program playbook-16 benchmarks.

---

## Prerequisites

The canonical 8-prereq gate that ALL paths MUST satisfy before Phase 1 TikTok-Shop-launch (mirrors research/11 Gate A prerequisite 7):

1. **DTC baseline steady-state 90+ days.** Move #1 + Move #4 + Move #6 + Move #8 + Move #11 actively live for ≥90 days before Phase 1 TikTok-Shop-launch per research/11 §Verification gates Gate A prerequisite 1.
2. **Move #1 cart-abandon-flow performance.** CTR ≥5% per Klaviyo 2024 cart-abandon benchmarks.
3. **Move #4 welcome-series performance.** Open-rate ≥35% + click-rate ≥4% + CVR ≥0.8% per Klaviyo 2024 welcome-series benchmarks.
4. **Move #6 Triple Whale attribution live with ≥95% match-rate.** Triple Whale attribution has all 7 gates passing per `scripts/triple_whale_attribution_check.py` (Move #6 Gate A-G).
5. **Move #8 loyalty actively rewarding repeat-purchases.** ≥30% member-share of total-revenue per Smile.io benchmarks.
6. **Move #11 subscription-program OR Move #15 affiliate-program live.** ≥1 of the canonical creator-cohort-LTV substrate ships before TikTok-Shop-launch.
7. **≥10 SKUs with ≥25% TikTok-Shop-margin-headroom.** 5 hero-SKUs at $15-$45 impulse-price + 5 secondary-SKUs at $50-$200 considered-price per TikTok-Shop-product-feed baseline.
8. **8-prereq TikTok-Shop-onboarding-pack documented + on-file.** TikTok-Business-Account + category-approval-application + Shop-Score-baseline-audit + creator-affiliate-pool-baseline + LIVE-shopping-studio-build + TikTok-Shop-product-feed-optimization + Klaviyo-TikTok-channel-integration + Triple-Whale-TikTok-attribution-setup.

---

## Step-by-step — Phase 1 (Weeks 1–2, ~12 hours, Path B TikTok-Shop-onboarding + category-approval + first-50-creator-affiliate-onboarding)

### 1.1 TikTok-Business-Account created + category-approval-application submitted

Per research/11 Pillar 1 + Pitfall #1 platform-selection.

```
TIKTOK-BUSINESS-ACCOUNT-SETUP

[ ] 1. Create TikTok-Business-Account at business.tiktok.com (free; requires business-email + business-registration-document)
[ ] 2. Brand-info: legal-entity-name + DBA + EIN + brand-website + brand-registration-certificate + product-insurance $1M+ general-liability + $1M product-liability
[ ] 3. Apply for TikTok-Shop-Seller-Center at seller-center.tiktok.com (free for Path A; $0-$99/mo for Path B Path C)
[ ] 4. Submit category-approval-application for top SKU category (Beauty / Fashion-Accessories / Home / Electronics / Food-and-Beverage / Pet / Baby / Health / Outdoor / Toys-and-Collectibles — restricted categories include Firearms / Alcohol / Tobacco / Cannabis / Pharmaceuticals / Adult-Content / Gambling / Financial-Products)
[ ] 5. Upload category-specific-documentation:
    - Brand-registration-certificate
    - Product-safety-certification (CPSIA for baby OR FDA-registration for beauty/food/supplements OR FCC-certification for electronics OR CPSC-registration for general-merchandise)
    - Product-insurance $1M+ general-liability + $1M product-liability
    - Warehouse-safety-cert (FDA-registered for food/cosmetic OR CPSC-registered for general-merchandise)
    - Brand-authorization-letter for distribution
[ ] 6. Approval-timeline 1-4 weeks per TikTok-for-Business-2024
[ ] 7. Rejection-rate 30-50% for first-time-applicants per Jungle-Scout-2024-benchmarks — prepare 2-3 backup-category-applications
```

**Decision criterion:** All 10 permitted TikTok-Shop-categories have specific documentation requirements. Brands with missing documentation should defer Phase 1 by 4-8 weeks while assembling.

### 1.2 Shop-Score-baseline-audit run

Per research/11 Pillar 5 + Pitfall #12 attribution-measurement.

```
SHOP-SCORE-BASELINE-AUDIT (paste-ready checklist)

Run on existing-DTC-store 30 days before Phase 1:

[ ] 1. Positive-review-rate ≥95% (count positive-reviews / total-reviews for last-30-days)
[ ] 2. Ship-on-time-rate ≥95% (count orders-shipped-within-promised-window / total-orders for last-30-days)
[ ] 3. Return-rate ≤5% (count returns / total-orders for last-30-days)
[ ] 4. Chat-response-rate ≥90% (count chats-responded / total-chats for last-30-days)
[ ] 5. Chat-response-time ≤5-min (median chat-response-time for last-30-days)

Computed-baseline Shop-Score projection:
- All 5 metrics in band → projected Shop-Score 4.5-5.0 → proceed to Phase 1
- 4 of 5 metrics in band → projected Shop-Score 4.0-4.5 → fix the failing metric first
- 3 or fewer metrics in band → projected Shop-Score <4.0 → defer Phase 1 by 30-60 days

Brands with <4.0 baseline Shop-Score need to fix DTC-operations before TikTok-Shop-launch.
```

### 1.3 8-prereq TikTok-Shop-onboarding-pack compiled

Per research/11 §Verification gates Gate A prerequisite 7; canonical 8-prereq onboarding-pack.

```
8-PREREQ TIKTOK-SHOP-ONBOARDING-PACK (paste-ready checklist)

[ ] 1. TikTok-Business-Account + TikTok-Shop-Seller-Center-account (free)
[ ] 2. Category-approval-application approved for top SKU category
[ ] 3. Shop-Score-baseline-audit passing (≥4.0 baseline)
[ ] 4. Creator-affiliate-pool-baseline ≥20 ready-to-onboard creators (TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape)
[ ] 5. LIVE-shopping-studio-build planned ($500-$2k one-time [Ring-light + iPhone-15-Pro + tripod + lavalier-mic + 1080p-webcam + backdrop + teleprompter-app + LIVE-streaming-software Streamlabs-OBS-or-TikTok-LIVE-Studio $0/mo])
[ ] 6. TikTok-Shop-product-feed-optimization plan (per-SKU: TikTok-Shop-product-title ≤100-chars + product-image 1:1-square-≥800px + product-description-with-keywords + price-tier-fits-TikTok-Shop-impulse-pattern $15-$45 hero-SKU + 5%-15%-shipping-subsidy)
[ ] 7. Klaviyo-TikTok-channel-integration planned ($0 with Klaviyo-Standard; $45/mo with Klaviyo-Email-and-SMS for TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow)
[ ] 8. Triple-Whale-TikTok-attribution-setup planned (Triple-Whale-app-install $179/mo Starter-or-$1,290/mo-Pro + TikTok-cohort-overlay-wire + post-purchase-survey with TikTok-source-tracking)

Compiled PDFs / certs in /shared-drive/TikTok-Shop-onboarding-pack/ with 14-day-onboarding-lead-time before first-TikTok-Shop-launch.
```

### 1.4 First 20-50 creator-affiliates onboarded via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape

Per Move #15-affiliate-program playbook-16 §Phase 1 Step 1.4 first-100-affiliates-build + research/11 Pillar 2 creator-affiliate-onboarding.

**TikTok-Shop-Creator-Marketplace setup (~2 hours):**
1. TikTok-Shop-Seller-Center → Affiliate → Creator-Marketplace → set brand-info + 5-payout-structures [CPM $10-$30/1000-views / CPS 10-25%-of-GMV / flat-fee $200-$2k/creator/post / hybrid 5%-of-GMV + $200-base-fee / product-seeding-only $0 + free-product]
2. Apply to 50-100 creators in top-10 categories matching brand-SKU-archetype
3. Per-creator-onboarding message: 1-line brand-pitch + creator-brief-template (asset 19) + 1-hero-SKU product-seeding offer + 4-week-trial-payout-structure

**Aspire setup (~1.5 hours):**
1. Apply at aspire.io → brand-onboarding (~3-day review)
2. Use Aspire's creator-discovery-database for 20-50 mid-tier creators (10k-500k followers) in brand-vertical
3. Same onboarding-message shape as TikTok-Shop-Creator-Marketplace

**Collabstr setup (~1 hour):**
1. Apply at collabstr.com → brand-onboarding (~2-day review)
2. Use Collabstr's creator-discovery-database for 10-30 micro-creators (1k-50k followers) for paid-flat-fee-trial
3. $50-$500/creator/post trial-payout-structure

**Instagram-hashtag-scrape (~2 hours):**
1. Scrape top-50 Instagram-creators in brand-vertical via Apify or similar (free-$50/mo)
2. Manual-DM outreach with creator-brief + product-seeding offer
3. Convert 5-10 Instagram-creators to TikTok-Shop-creator-affiliates

**First 20-50 creator-affiliate targets:**
- 10-15 from TikTok-Shop-Creator-Marketplace (auto-acquired)
- 5-10 from Aspire (auto-acquired)
- 5-10 from Collabstr (auto-acquired)
- 5-15 from Instagram-hashtag-scrape (manual outreach)

**Per-creator-onboarding deliverables:** creator-brief (asset 19) + product-seeding-pack (1-hero-SKU + 1-secondary-SKU) + payout-structure + 4-week-trial-period + FTC-disclosure-language per 16-CFR-Part-255.

### 1.5 TikTok-Shop-product-feed live with 10-50 SKUs + per-SKU-optimization

Per research/11 Pillar 1 product-feed-optimization + Pitfall #4 creator-affiliate-cohort-LTV.

```
TIKTOK-SHOP-PRODUCT-FEED-OPTIMIZATION (per-SKU)

| Field | Optimization | Reason |
|-------|--------------|--------|
| TikTok-Shop-product-title | ≤100-chars + benefit-led + ingredient-led + use-case-led | SEO + algorithm-distribution |
| Product-image-1 | 1:1-square-≥800px + product-on-white-background + hero-shot | First-impression CVR |
| Product-image-2-5 | Lifestyle-in-use + creator-style-demo + case-pack-shot + label-shot | Trust + transparency |
| Product-description | Keywords + benefit-led + ingredient-led + use-case-led + 200-500-words | SEO + algorithm-distribution |
| Price-tier | $15-$45 impulse-price for hero-SKU; $50-$200 considered-price for secondary-SKU | TikTok-Shop-impulse-pattern |
| Shipping-subsidy | 5%-15%-of-AOV | Competitive-with-Amazon |
| TikTok-Shop-product-card-preview | Embedded-video-or-GIF | Algorithm-reward |
| Inventory-level | ≥30-days-of-stock at expected-GMV | Avoid-stock-out-penalty |

Optimized-product-feeds achieve 2-4× higher conversion-rate vs unoptimized-feeds (Shop-Score's algorithmic-distribution-bonus rewards quality-listings per eMarketer-2024 + Jungle-Scout-2024).
```

### 1.6 Klaviyo-TikTok-channel-integration wired

Per research/11 Pillar 5 attribution + Move #1 + Move #4 cross-pollination.

**Klaviyo-TikTok-channel-integration setup (~1 hour):**
1. Klaviyo admin → Integrations → TikTok → connect (free with Klaviyo-Standard; $45/mo with Klaviyo-Email-and-SMS for SMS)
2. Wire 4 canonical TikTok-Shop-flows:
   - **TikTok-Shop-cart-abandon** (15-min + 24-hour + 72-hour cadence; trigger: TikTok-Shop-cart-event)
   - **TikTok-Shop-welcome-flow** (Day 0 + Day 7 + Day 30 cadence; trigger: TikTok-Shop-first-purchase)
   - **TikTok-Shop-post-purchase** (Day 1 + Day 14 + Day 30 cadence; trigger: TikTok-Shop-order-shipped)
   - **TikTok-Shop-subscriber-cohort-LTV-overlay** (weekly cohort-LTV email to operator; trigger: TikTok-Shop-cohort-LTV-computed)

### 1.7 Triple-Whale-TikTok-attribution-setup wired

Per research/11 Pillar 5 attribution-measurement + Move #6 Triple-Whale.

**Triple-Whale-TikTok-attribution setup (~1 hour):**
1. Triple-Whale-app install ($179/mo Starter OR $1,290/mo Pro)
2. Triple-Whale admin → Integrations → TikTok-Ads + TikTok-Shop → connect
3. Wire TikTok-cohort-overlay [TikTok-Shop-driven-cohort vs organic-DTC-cohort vs paid-Meta-cohort at 30/60/90-day windows per Triple-Whale-TikTok-attribution-2024]
4. Configure post-purchase-survey with TikTok-source-tracking ("How did you hear about us?" + TikTok-Shop-specific-options)

### 1.8 Verification — Gate A (Phase 1 readiness, end of Week 2)

Per research/11 §Verification gates Gate A; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** DTC baseline steady-state 90+ days (Move #1 + Move #4 + Move #6 + Move #8 + Move #11 actively live for ≥90 days).
- [ ] **Prereq 2:** Move #1 cart-abandon CTR ≥5% per Klaviyo 2024 benchmarks.
- [ ] **Prereq 3:** Move #4 welcome-series open-rate ≥35% + click-rate ≥4% + CVR ≥0.8%.
- [ ] **Prereq 4:** Move #6 Triple Whale attribution ≥95% match-rate (all 7 gates passing per `scripts/triple_whale_attribution_check.py`).
- [ ] **Prereq 5:** Move #8 loyalty ≥30% member-share of total-revenue per Smile.io benchmarks.
- [ ] **Prereq 6:** Move #11 subscription OR Move #15 affiliate-program live (creator-cohort-LTV substrate).
- [ ] **Prereq 7:** ≥10 SKUs with ≥25% TikTok-Shop-margin-headroom (5 hero at $15-$45 + 5 secondary at $50-$200).
- [ ] **Prereq 8:** 8-prereq TikTok-Shop-onboarding-pack compiled (TikTok-Business-Account + category-approval + Shop-Score-baseline-audit + creator-affiliate-pool-baseline + LIVE-shopping-studio-build + TikTok-Shop-product-feed-optimization + Klaviyo-TikTok-channel-integration + Triple-Whale-TikTok-attribution-setup).
- [ ] **Prereq 9:** TikTok-Shop-Seller-Center-onboarded + category-approval-approved.
- [ ] **Prereq 10:** First 20-50 creator-affiliates onboarded + Klaviyo-TikTok-channel-integration live + Triple-Whale-TikTok-attribution wired.

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 2.

---

## Step-by-step — Phase 2 (Weeks 3–6, ~16 hours, Path B shoppable-video-ads-launch + creator-affiliate-cohort-LTV-measurement)

### 2.1 TikTok-Ads-Manager account setup + Spark-Ads-boost configured

Per research/11 Pillar 3 shoppable-video-ads + Pitfall #8 attribution-measurement.

**TikTok-Ads-Manager setup (~1 hour):**
1. Apply at ads.tiktok.com → brand-onboarding (~3-day review)
2. Brand-info + billing + payment-method
3. Connect TikTok-Pixel to Shopify via Shopify-TikTok-Channel
4. Set $50-$500/day Spark-Ads-budget per audience-segment

**Spark-Ads-boost setup (~2 hours):**
1. TikTok-Ads-Manager → Smart-Ads → Spark-Ads → connect-creator-content
2. Boost top-5-performing organic-creator-content from Phase 1 (highest view-count + highest engagement-rate)
3. Set $50-$500/day Spark-Ads-budget per audience-segment
4. Allocate 50-70% of total TikTok-Ads-budget to Spark-Ads per TikTok-Ads-Manager-2024-benchmarks
5. Set audience-targeting: age 18-34 + US + interest-categories-matching-brand-vertical
6. Set bid-strategy: highest-value OR conversions

### 2.2 In-Feed-Ads with Product-Module + Top-View-Ads configured

Per research/11 Pillar 3.

**In-Feed-Ads with Product-Module (~2 hours):**
1. TikTok-Ads-Manager → In-Feed-Ads → create-campaign
2. Choose 3-5 hero-SKUs as Product-Module-targets (TikTok-Shop-product-card-in-feed)
3. Set $50-$300/day budget per SKU
4. Set audience-targeting: age 18-34 + US + interest-categories-matching-brand-vertical
5. Set creative-format: 9-15-second vertical-video + Product-Module-overlay
6. CVR 2-4× vs ads-without-Product-Module per eMarketer-2024-benchmarks

**Top-View-Ads (~1 hour):**
1. TikTok-Ads-Manager → Top-View-Ads → create-campaign
2. Set $20,000-$50,000/day budget per TopView-campaign (Top-View is premium-pricing)
3. Set full-screen-takeover with TikTok-Shop-product-module
4. Run 1-2 TopView-campaigns per month for hero-SKU-awareness

### 2.3 Triple-Whale-cohort-LTV-overlay-iteration weekly-cadence

Per research/11 Pillar 5 cohort-LTV-iteration + Pitfall #13 attribution-measurement.

**Triple-Whale-cohort-LTV-iteration cadence (~2 hours/week):**
1. Weekly-review of TikTok-Shop-driven-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV
2. Bin cohort-LTV by 30/60/90-day windows per Triple-Whale-TikTok-attribution-2024
3. Compare TikTok-Shop-cohort-LTV-multiplier vs organic-DTC-cohort-LTV-multiplier
4. Adjust Spark-Ads-budget-allocation by cohort-LTV-multiplier (boost top-decile-cohort-creators)
5. Iterate creator-affiliate-payout-structure per the canonical 5-payout-structures based on cohort-LTV-multiplier

### 2.4 First creator-content-pieces live + Shop-Score-baseline-monitored

Per research/11 Pillar 1 + Pillar 2.

**First creator-content-pieces (~4 hours):**
1. 20-50 creator-affiliates ship first 1-3 content-pieces each (Reels / TikToks / LIVE-clips)
2. Per-piece deliverables: 15-60-second video + Product-Module-link + FTC-disclosure (#ad / #sponsored / #partner per 16-CFR-Part-255)
3. Monitor first-piece performance: views + engagement-rate + click-rate + CVR + TikTok-Shop-driven-GMV
4. Identify top-10-performing pieces by TikTok-Shop-driven-GMV per piece
5. Boost top-10 pieces with Spark-Ads ($50-$500/day per piece)

**Shop-Score-baseline-monitored daily:**
1. Daily-check: positive-review-rate + ship-on-time-rate + return-rate + chat-response-rate + chat-response-time
2. Daily-TikTok-Shop-Seller-Center-dashboard-check
3. Weekly-Shop-Score-update (target 4.5+ by end of Phase 2)

### 2.5 First TikTok-Shop-driven-GMV realized + Spark-Ads-iteration

Per research/11 Pillar 3 + §Cost & ROI steady-state-benchmarks.

**First TikTok-Shop-driven-GMV realized:**
- Target: $25k-$100k TikTok-Shop-driven-GMV by end of Phase 2 (Weeks 3-6)
- Path B default: $50k-$250k TikTok-Shop-driven-GMV by end of Phase 2

**Spark-Ads-iteration:**
1. Weekly-Spark-Ads-performance-review: ROAS + click-rate + CVR + GMV
2. Identify top-decile-Spark-Ads-creators by ROAS
3. Boost top-decile-creators with $100-$500/day Spark-Ads-budget
4. Pause bottom-decile-creators (ROAS <1.5×)

### 2.6 Verification — Gate B (Phase 2 readiness, end of Week 6)

Per research/11 §Verification gates Gate B; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** Gate A passed (Phase 1 verified).
- [ ] **Prereq 2:** TikTok-Ads-Manager-account live + Spark-Ads-boost-configured + $50-$500/day-budget-set.
- [ ] **Prereq 3:** In-Feed-Ads with Product-Module live + Top-View-Ads-configured.
- [ ] **Prereq 4:** Triple-Whale-cohort-LTV-overlay-iteration weekly-cadence-running.
- [ ] **Prereq 5:** 20-50 creator-affiliates ship first 1-3 content-pieces each.
- [ ] **Prereq 6:** First TikTok-Shop-driven-GMV realized ≥$25k (Path A target) OR ≥$50k (Path B target).
- [ ] **Prereq 7:** Spark-Ads-iteration weekly-cadence-running + top-decile-creators-boosted + bottom-decile-paused.
- [ ] **Prereq 8:** Shop-Score-baseline ≥4.0 (post-Phase-2-target ≥4.5).
- [ ] **Prereq 9:** LIVE-shopping-studio-build-in-progress (Ring-light + iPhone-15-Pro + tripod + lavalier-mic + 1080p-webcam + backdrop + teleprompter-app ordered).
- [ ] **Prereq 10:** TikTok-Shop-affiliate-program-commission-structure-documented (20-30%-of-GMV commission + 30-day-cookie-window).

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 3.

---

## Step-by-step — Phase 3 (Weeks 7–12, ~24 hours, Path B LIVE-shopping-launch + TikTok-Shop-affiliate-program-launch)

### 3.1 LIVE-shopping-studio-built + tested

Per research/11 Pillar 4 LIVE-shopping-launch + Pitfall #10 LIVE-shopping.

```
LIVE-SHOPPING-STUDIO-BUILD (paste-ready checklist)

[ ] 1. Ring-light ($30-$100; Neewer or Aputure)
[ ] 2. iPhone-15-Pro OR equivalent ($800-$1,200)
[ ] 3. Tripod ($20-$50)
[ ] 4. Lavalier-mic ($30-$80; Rode Wireless GO or Hollyland)
[ ] 5. 1080p-webcam for desktop-backup ($50-$150; Logitech C920 or C922)
[ ] 6. Backdrop ($50-$200; collapsible-fabric OR printed-brand-backdrop)
[ ] 7. Teleprompter-app ($0-$30/mo; PromptSmart or Teleprompter Premium)
[ ] 8. LIVE-streaming-software ($0; Streamlabs OBS OR TikTok LIVE Studio)
[ ] 9. Product-display-table ($50-$150; white-or-wood)
[ ] 10. Backup-internet (5G-mobile-hotspot $30-$50/mo)

Total cost: $1,060-$2,010 one-time + $30-$80/mo backup-internet
Tested: 2 test-LIVE-sessions-with-internal-team before public-launch
```

### 3.2 4-hour-week-LIVE-cadence-schedule

Per research/11 Pillar 4 + Pitfall #10 LIVE-shopping.

**4-hour-week-LIVE-cadence-schedule:**
- **1 LIVE-session per week** (60-90 minutes per session per TikTok-LIVE-2024-benchmarks)
- **Optimal time-slot:** 7-9 PM ET (Tue / Wed / Thu) per TikTok-LIVE-2024-benchmarks
- **Operator time-commitment:** 4-6 hr/wk (1 hr prep + 1-1.5 hr LIVE + 1-2 hr post-production + 1 hr analytics)
- **First 4-week-cadence:** 4 LIVE-sessions in Weeks 7-10 (1 per week)
- **Steady-state-cadence:** 4-8 LIVE-sessions per month in Week 11+

### 3.3 5-segment-LIVE-show-runner-script-template tested

Per research/11 Pillar 4 + Pitfall #11 LIVE-shopping.

```
5-SEGMENT-LIVE-SHOW-RUNNER-SCRIPT-TEMPLATE (paste-ready, 60-90 min total)

Segment 1 (0-10 min): Product-intro with hero-SKU
- Hook: "Hey everyone, I'm [BRAND_NAME] and tonight we're LIVE with [HERO_SKU_NAME]..."
- Show product-on-table + zoom-into-label + read 3-key-benefits
- Mention TikTok-Shop-flash-sale (15%-off for LIVE-viewers-only, valid 60-min)

Segment 2 (10-25 min): Demo
- Apply / use / cook / wear / assemble / display hero-SKU
- Show real-world-use-case with lifestyle-context
- Mention creator-endorsement: "Our creator [CREATOR_NAME] did this exact demo..."

Segment 3 (25-40 min): Q&A with chat-responder
- Read 5-10 live-chat questions
- Answer each in 1-2 sentences with product-positioning
- Chat-responder (separate operator) handles order-questions + product-specs + shipping-questions

Segment 4 (40-55 min): Creator-guest-takeover
- Pre-recorded-video OR live-call-in from 1-creator-guest
- Creator-guest does 5-10-min product-endorsement + 5-10-min LIVE-product-demo
- Operator facilitates handoff: "Thanks [CREATOR_NAME]! Now let's hear from you..."

Segment 5 (55-65 min): Closing-limited-time-offer with TikTok-Shop-flash-sale
- Re-state TikTok-Shop-flash-sale: 15%-off for LIVE-viewers-only, valid 60-min
- Mention bonus-bundle: "Order in the next 10 min and get [BONUS_SKU] free..."
- End-LIVE: "Thanks for watching! We'll be back next [DAY] at [TIME]..."
```

### 3.4 First LIVE-session-launched + Shop-Score-monitored

Per research/11 Pillar 4 + Pitfall #12 LIVE-shopping.

**First LIVE-session-launched (Week 7):**
1. Run first LIVE-session per 3.3 5-segment-script
2. Track LIVE-session-metrics: viewers + chat-messages + click-throughs + TikTok-Shop-GMV-during-LIVE
3. Path B target for first LIVE-session: 500-2,000 viewers + 100-500 chat-messages + 50-200 click-throughs + $5k-$25k TikTok-Shop-GMV-during-LIVE

**Shop-Score-monitored daily:**
1. Daily-check: positive-review-rate + ship-on-time-rate + return-rate + chat-response-rate + chat-response-time
2. Daily-TikTok-Shop-Seller-Center-dashboard-check
3. Target: Shop-Score 4.5+ by end of Phase 3

### 3.5 TikTok-Shop-affiliate-program-launched + commission-structure-set

Per Move #15-affiliate-program playbook-16 + research/11 Pillar 2.

**TikTok-Shop-affiliate-program-launch (~2 hours):**
1. TikTok-Shop-Seller-Center → Affiliate → Program → create-program
2. Set commission-structure: 20-30%-of-GMV per Move #15-benchmarks
3. Set cookie-window: 30-day per Move #15-benchmarks
4. Set payout-schedule: NET-30 per Move #15-benchmarks
5. Set FTC-disclosure-language per 16-CFR-Part-255 (#ad / #sponsored / #partner disclosure)
6. Apply to be on TikTok-Shop-Affiliate-Marketplace (auto-list to 1000+ creators)

### 3.6 Triple-Whale-LIVE-cohort-LTV-overlay running

Per research/11 Pillar 5 cohort-LTV-iteration.

**Triple-Whale-LIVE-cohort-LTV-overlay (~1 hour setup + 2 hours/week iteration):**
1. Triple-Whale admin → Cohorts → LIVE-driven-cohort (visitors-during-LIVE-window)
2. Wire LIVE-cohort-LTV-overlay vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV at 30/60/90-day windows
3. Weekly-iteration: identify top-decile-LIVE-cohorts + boost them with Spark-Ads + creator-affiliate-reinvestment
4. Path B target: LIVE-cohort-LTV 1.2-1.5× organic-DTC-cohort-LTV per TikTok-LIVE-2024-benchmarks

### 3.7 Verification — Gate C (Phase 3 readiness, end of Week 12)

Per research/11 §Verification gates Gate C; the brand MUST satisfy ALL 10 prereqs:

- [ ] **Prereq 1:** Gate B passed (Phase 2 verified).
- [ ] **Prereq 2:** LIVE-shopping-studio-built + tested (Ring-light + iPhone-15-Pro + tripod + lavalier-mic + 1080p-webcam + backdrop + teleprompter-app + LIVE-streaming-software).
- [ ] **Prereq 3:** 4-hour-week-LIVE-cadence-schedule-running.
- [ ] **Prereq 4:** 5-segment-LIVE-show-runner-script-template-tested (2 test-sessions-with-internal-team).
- [ ] **Prereq 5:** First 4 LIVE-sessions-shipped (1 per week in Weeks 7-10).
- [ ] **Prereq 6:** Path B target: 500-2,000 viewers + 100-500 chat-messages + $5k-$25k TikTok-Shop-GMV-per-LIVE.
- [ ] **Prereq 7:** TikTok-Shop-affiliate-program-launched + commission-structure-set (20-30%-of-GMV + 30-day-cookie + NET-30).
- [ ] **Prereq 8:** Triple-Whale-LIVE-cohort-LTV-overlay-running + LIVE-cohort-LTV-multiplier ≥1.2× organic-DTC-cohort-LTV.
- [ ] **Prereq 9:** Shop-Score-baseline ≥4.5 (post-Phase-3-target).
- [ ] **Prereq 10:** Triple-Whale-cohort-LTV-iteration weekly-cadence-running + LIVE-cohort-iteration weekly-cadence-running.

**Gate-pass criterion:** All 10 prereqs pass → proceed to Phase 4.

---

## Step-by-step — Phase 4 (Weeks 13–16, ~16 hours + 4-8 hr/wk ongoing, Path B steady-state + Shop-Score-4.8+ + LIVE-cadence-optimization + Triple-Whale-cohort-LTV-iteration)

### 4.1 Shop-Score-4.8+-audit-process running

Per research/11 Pillar 5 Shop-Score-steady-state + Pitfall #14 attribution-measurement.

```
SHOP-SCORE-4.8+-AUDIT-PROCESS (paste-ready checklist, weekly)

[ ] 1. Positive-review-rate ≥95% (count positive-reviews / total-reviews for last-30-days; target 4.8+ Shop-Score = ≥95% positive-review-rate)
[ ] 2. Ship-on-time-rate ≥95% (count orders-shipped-within-promised-window / total-orders for last-30-days; target 4.8+ Shop-Score = ≥95% ship-on-time-rate)
[ ] 3. Return-rate ≤5% (count returns / total-orders for last-30-days; target 4.8+ Shop-Score = ≤5% return-rate)
[ ] 4. Chat-response-rate ≥90% (count chats-responded / total-chats for last-30-days; target 4.8+ Shop-Score = ≥90% chat-response-rate)
[ ] 5. Chat-response-time ≤5-min (median chat-response-time for last-30-days; target 4.8+ Shop-Score = ≤5-min chat-response-time)

Brands with Shop-Score 4.8+ achieve 30-50% higher organic-TikTok-Shop-distribution vs Shop-Score <4.5 per TikTok-for-Business-2024 + Jungle-Scout-2024-benchmarks (algorithmic-distribution-bonus).
```

### 4.2 LIVE-cadence-optimization-flow running

Per research/11 Pillar 4 LIVE-cadence-optimization + Pitfall #11 LIVE-shopping.

**LIVE-cadence-optimization-flow (~2 hours/week):**
1. A/B-test 1-vs-2-vs-3-LIVE-sessions/week with same-creator + same-product + same-time-slot
2. Measure GMV-per-hour-LIVE per cadence
3. Path B target: 2-LIVE-sessions/week as steady-state (60-90-minutes per session + 4-6 hr/wk operator-time)
4. Path C target: 4-6-LIVE-sessions/week as steady-state (60-90-minutes per session + 15-25 hr/wk operator-time + dedicated-FTE)

### 4.3 Triple-Whale-cohort-LTV-iteration-cycle weekly

Per research/11 Pillar 5 cohort-LTV-iteration.

**Triple-Whale-cohort-LTV-iteration-cycle (~2 hours/week):**
1. Weekly-review of TikTok-Shop-driven-cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV
2. Bin cohort-LTV by 30/60/90-day windows
3. Compare TikTok-Shop-cohort-LTV-multiplier vs organic-DTC-cohort-LTV-multiplier (Path B target: 1.2-1.5× organic-DTC-cohort-LTV-multiplier)
4. Iterate creator-affiliate-payout-structure per the canonical 5-payout-structures based on cohort-LTV-multiplier (top-decile-creators → boost-payout + Spark-Ads; bottom-decile-creators → pause-or-downgrade)

### 4.4 Creator-affiliate-tier-promotion-SOP running

Per Move #15-affiliate-program playbook-16 §Phase 4 + research/11 Pillar 2.

**Creator-affiliate-tier-promotion-SOP (~1 hour/week):**
1. **Tier-1 (default)**: 20%-of-GMV commission + 30-day-cookie + NET-30
2. **Tier-2 (volume trigger)**: 25%-of-GMV commission + 30-day-cookie + NET-30 (trigger: $5k+/90d GMV)
3. **Tier-3 (cohort-LTV trigger)**: 30%-of-GMV commission + 60-day-cookie + NET-30 (trigger: cohort-LTV $300+)
4. **Tier-3-eligible (content-quality trigger)**: 30%-of-GMV commission + 60-day-cookie + NET-30 (trigger: 10+ posts/90d + 70%+ FTC-compliance)
5. **Tier-3-locked (tenure trigger)**: 30%-of-GMV commission + 60-day-cookie + NET-30 (trigger: 180d tenure + Triggers 2 or 3)

**Sustainable-mission-alignment-verifier** (per assets/12-impact-data-pipeline.md): brands claiming Sustainable voice without carbon/materials/labor/community keyword mentions get downgraded to Default tier or declined.

### 4.5 Quarterly LIVE-cadence-portfolio-review

Per research/11 Pillar 4 quarterly-review + Pitfall #15 LIVE-shopping.

**Quarterly LIVE-cadence-portfolio-review (~4 hours/quarter):**
1. Review quarterly-LIVE-cadence-performance: viewers + chat-messages + TikTok-Shop-GMV + LIVE-cohort-LTV-multiplier + Shop-Score-baseline
2. Identify top-decile-LIVE-sessions by GMV-per-hour
3. Identify bottom-decile-LIVE-sessions (pause-or-replace)
4. Adjust LIVE-cadence: 1-vs-2-vs-3-vs-4-LIVE-sessions/week
5. Adjust LIVE-time-slot: 7-9 PM ET (Tue/Wed/Thu) is canonical; alternative-slots include 12-2 PM ET (Sat/Sun) + 8-10 PM ET (Fri/Sat)

### 4.6 Verification — Gate D (Phase 4 readiness, end of Week 16)

Per research/11 §Verification gates Gate D; the brand MUST satisfy ALL 9 prereqs:

- [ ] **Prereq 1:** Gate C passed (Phase 3 verified).
- [ ] **Prereq 2:** Shop-Score-4.8+-audit-process running + Shop-Score-baseline ≥4.5 (target 4.8+ by end of Phase 4).
- [ ] **Prereq 3:** LIVE-cadence-optimization-flow running + 4-8-LIVE-sessions-per-month-shipped (Path B target).
- [ ] **Prereq 4:** Triple-Whale-cohort-LTV-iteration-cycle weekly + LIVE-cohort-LTV-multiplier ≥1.2× organic-DTC-cohort-LTV.
- [ ] **Prereq 5:** Creator-affiliate-tier-promotion-SOP running + top-decile-creators-on-Tier-3 + bottom-decile-creators-paused.
- [ ] **Prereq 6:** Path B target: 5-15% incremental-GMV-contribution-from-TikTok-Shop achieved.
- [ ] **Prereq 7:** FTC-disclosure-language-compliance-audit passing (per 16-CFR-Part-255 + quarterly-compliance-audit-every-90-days).
- [ ] **Prereq 8:** Klaviyo-TikTok-channel-4-flows-running (TikTok-Shop-cart-abandon + TikTok-Shop-welcome + TikTok-Shop-post-purchase + TikTok-Shop-subscriber-cohort-LTV-overlay).
- [ ] **Prereq 9:** Triple-Whale-TikTok-attribution-baseline-validated + Triple-Whale-LIVE-cohort-LTV-overlay-running.

**Gate-pass criterion:** All 9 prereqs pass → steady-state; quarterly-iteration-cycle begins.

---

## Step-by-step — Phase 5+ (Quarter 2+, ~4-8 hr/wk ongoing, Path B steady-state + Path C international / cross-channel for $5M+ brands)

### 5.1 Path B steady-state operations

Per research/11 Pillar 4-5 steady-state framework.

- **Weekly cadence:** Triple-Whale-cohort-LTV-iteration (2 hr) + Spark-Ads-iteration (2 hr) + LIVE-session-prep + LIVE-session (4 hr) + LIVE-session-post-production (1 hr) = ~9 hr/wk
- **Monthly cadence:** Quarterly-LIVE-cadence-portfolio-review (4 hr/month amortized) + creator-affiliate-tier-promotion-audit (2 hr/month amortized) + Shop-Score-audit (1 hr/month amortized) = ~7 hr/month
- **Quarterly cadence:** LIVE-cadence-portfolio-review (4 hr/quarter) + Triple-Whale-cohort-LTV-deep-dive (4 hr/quarter) + FTC-compliance-audit (2 hr/quarter per 16-CFR-Part-255)
- **Annual cadence:** Category-approval-renewal + creator-affiliate-pool-rebuild + TikTok-Shop-product-feed-optimization-pass + LIVE-shopping-studio-upgrade

### 5.2 Path C international-TikTok-Shop-orchestration for $5M+ brands

Per research/11 Pillar 4 international-expansion callout + research/04 international-expansion Pillar 4 cross-pollination.

For brands with $5M+ GMV and existing-international-DTC-substrate (per research/04 + playbook 11 international-rollout):

- **UK TikTok-Shop** (live since 2021 per TikTok for Business 2024) — primary cross-border-TikTok-Shop-market for English-speaking brands
- **EU TikTok-Shop** (DE+FR+IT+ES+IE live since 2023 per TikTok for Business 2024) — primary European-market for established-DTC-brands
- **SE-Asia TikTok-Shop** (Indonesia + Malaysia + Philippines + Singapore + Thailand + Vietnam + Japan live since 2022 per TikTok for Business 2024) — primary cross-border-TikTok-Shop-market for brands with SE-Asia-skew

Canonical 5-step international-TikTok-Shop-orchestration recipe:
1. **Apply for international-TikTok-Shop-Seller-Center** (separate-application per region per TikTok-for-Business-2024)
2. **Wire international-product-feed** (per-region pricing + per-region shipping + per-region currency)
3. **Build international-creator-affiliate-pool** (per-region creators via TikTok-Shop-Creator-Marketplace + Aspire + Collabstr regional-presence)
4. **Wire international-TikTok-Ads-Manager** (per-region currency + per-region audience-targeting + per-region budget)
5. **Wire international-Triple-Whale-TikTok-cohort-overlay** (per-region cohort-LTV vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV)

---

## Metrics to track

Track these monthly + quarterly to validate steady-state:

- **TikTok-Shop-driven-GMV** (Path B target: 5-15% of total-GMV; target: $500k-$1M Path B Year-1 incremental TikTok-Shop-GMV at $2M US DTC base)
- **TikTok-Shop-driven-AOV** (target: $35-$55 Path B; $25-$45 Path A; $50-$80 Path C)
- **TikTok-Shop-CVR** (target: 3-7% Path B; 5-15% during-LIVE-sessions)
- **TikTok-Shop-cohort-LTV-multiplier** (target: 1.2-1.5× organic-DTC-cohort-LTV Path B; 1.5-2.0× Path C)
- **TikTok-Shop-driven-merchant-margin** (after 30-50% cost-stack: 8%-TikTok-Shop-commission + 10-25%-creator-affiliate + 5-15%-shipping-subsidy + $50-$200-LIVE-show-production)
- **Spark-Ads-ROAS** (target: 2-4× Path B)
- **Creator-affiliate-cohort-LTV-multiplier** (target: 1.5-2.5× organic-DTC-cohort-LTV Path B; 2.0-3.0× Path C)
- **LIVE-cadence-GMV-per-hour-LIVE** (target: $5k-$25k Path B; $10k-$50k Path C)
- **LIVE-cohort-LTV-multiplier** (target: 1.2-1.5× organic-DTC-cohort-LTV Path B)
- **Shop-Score-baseline** (target: 4.5+ post-Phase-2; 4.8+ post-Phase-3; 4.8+ steady-state)
- **Creator-affiliate-tier-distribution** (target: 60% Tier-1, 30% Tier-2, 10% Tier-3)
- **FTC-disclosure-language-compliance-rate** (target: ≥95% per 16-CFR-Part-255)
- **TikTok-Shop-organic-distribution-bonus** (target: 30-50% higher for Shop-Score 4.8+ vs Shop-Score <4.5)
- **Creator-affiliate-churn-rate** (target: <20%/90-days top-decile-creators; <40%/90-days bottom-decile-creators)

---

## Common pitfalls (15 with corrective `Fix:` lines clustered into 6 failure modes)

### A — platform-selection

1. **Pitfall #1 — Applying for wrong TikTok-Shop-category.** Brands apply for Beauty without FDA-registration documentation, get rejected, then have to wait 4-8 weeks for re-application. **Fix:** Audit brand's actual product category against TikTok-Shop's 10 permitted-categories list + category-specific-documentation-requirements BEFORE applying; prepare 2-3 backup-category-applications for first-time-rejection-resilience per Jungle-Scout-2024-benchmarks.

2. **Pitfall #2 — Skipping Shop-Score-baseline-audit.** Brands with <4.0 baseline Shop-Score launch TikTok-Shop and immediately get downranked by the algorithm, capping organic-distribution at 10-30% of expected. **Fix:** Run Shop-Score-baseline-audit 30 days before Phase 1 per 1.2 Shop-Score-baseline-audit; defer Phase 1 by 30-60 days if baseline Shop-Score <4.0.

3. **Pitfall #3 — Choosing wrong Path for brand's GMV-tier + ops-capacity.** Brands with <$500k GMV and 2-hr/wk ops-capacity choose Path C full-TikTok-Shop-orchestration, get overwhelmed by 15-25-hr/wk steady-state-demand, and abandon the channel after 4-8 weeks. **Fix:** Use the canonical 5-path TikTok-Shop-launch-mode decision matrix from research/11 Pillar 1 to choose Path A / B / C / D / E per brand's actual GMV-tier + ops-capacity + creator-affiliate-pool + LIVE-capacity.

### B — creator-affiliate

4. **Pitfall #4 — Onboarding <10 creator-affiliates in Phase 1.** Brands with <10-creator-affiliate-pool-baseline launch TikTok-Shop and cap at $5k-$25k Year-1 incremental-GMV (vs $500k-$1M Path B target). **Fix:** Use the canonical 4-channel creator-affiliate-pool-build (TikTok-Shop-Creator-Marketplace + Aspire + Collabstr + Instagram-hashtag-scrape) per 1.4 first-20-50-creator-affiliates-build; target ≥20 creator-affiliates by end of Phase 1.

5. **Pitfall #5 — Using single creator-affiliate-payout-structure across all creators.** Brands offer every creator 20%-of-GMV CPS, then top-decile-creators churn within 90 days because they can earn more on competing-platforms. **Fix:** Use the canonical 4-trigger tier-promotion SOP from Move #15-affiliate-program playbook-16 (volume + cohort-LTV + content-quality + tenure); top-decile-creators → Tier-3 30%-of-GMV; bottom-decile-creators → Tier-1 20%-of-GMV.

6. **Pitfall #6 — Missing FTC-disclosure-language-compliance.** Brands omit `#ad` / `#sponsored` / `#partner` disclosure on creator-content, get hit with $10k+/violation fine per FTC-2023-2024-enforcement, and face TikTok-Shop-Seller-Center-termination. **Fix:** Wire FTC-disclosure-language-compliance-audit per 16-CFR-Part-255 in Phase 1; quarterly-compliance-audit-every-90-days per Move #15-affiliate-program playbook-16.

### C — shoppable-video-ads

7. **Pitfall #7 — Allocating <50% of TikTok-Ads-budget to Spark-Ads.** Brands with <50% Spark-Ads-allocation underperform on ROAS by 2-4× per eMarketer-2024 + TikTok-for-Business-2024-benchmarks. **Fix:** Allocate 50-70% of total TikTok-Ads-budget to Spark-Ads per Phase 2 Step 2.1 Spark-Ads-boost-setup; bottom-decile-creators-pause-with-ROAS-<1.5×.

8. **Pitfall #8 — In-Feed-Ads without Product-Module.** Brands run In-Feed-Ads without TikTok-Shop-product-card-in-feed, capping CVR at 1-3% vs 2-4× CVR for ads-with-Product-Module. **Fix:** Configure In-Feed-Ads with Product-Module per Phase 2 Step 2.2; per-SKU Product-Module-overlay on every In-Feed-Ads-campaign.

### D — LIVE-shopping

9. **Pitfall #9 — No LIVE-shopping-studio-build.** Brands launch LIVE-sessions with iPhone-handheld + bad-lighting + poor-audio, cap viewers at 100-500 per LIVE-session, and abandon LIVE-shopping after 2-4 weeks. **Fix:** Build the canonical LIVE-shopping-studio per Phase 3 Step 3.1 ($500-$2k one-time); tested-with-2-internal-test-sessions before public-launch.

10. **Pitfall #10 — Inconsistent LIVE-cadence.** Brands launch LIVE-sessions with inconsistent cadence (1-session-per-week for 4 weeks then 0-sessions-for-8-weeks), losing audience-engagement and capping LIVE-cohort-LTV-multiplier at 0.8-1.0×. **Fix:** Use the canonical 4-hour-week-LIVE-cadence-schedule per Phase 3 Step 3.2; consistent-1-session-per-week-for-minimum-12-weeks-before-cadence-iteration.

11. **Pitfall #11 — Skipping the 5-segment-LIVE-show-runner-script.** Brands launch ad-hoc LIVE-sessions with no structure, capping conversion-rate at 1-3% vs 5-15% CVR for structured-LIVE-sessions. **Fix:** Use the canonical 5-segment-LIVE-show-runner-script-template per Phase 3 Step 3.3 (Segment 1 product-intro + Segment 2 demo + Segment 3 Q&A + Segment 4 creator-guest-takeover + Segment 5 closing-limited-time-offer); tested-with-2-internal-test-sessions.

12. **Pitfall #12 — LIVE-shopping with <4-hr/wk operator-capacity.** Brands with 1-2-hr/wk ops-capacity try to maintain 4-hr/wk LIVE-cadence, burn out within 4-8 weeks, and abandon LIVE-shopping. **Fix:** Use the canonical 5-path TikTok-Shop-launch-mode decision matrix; Path A creator-affiliate-only + shoppable-video-ads for brands with <2-hr/wk operator-capacity (no LIVE-shopping).

### E — attribution-measurement

13. **Pitfall #13 — Skipping Triple-Whale-TikTok-cohort-overlay-wire.** Brands run TikTok-Shop without Triple-Whale-TikTok-attribution, can't measure TikTok-Shop-driven-cohort-LTV, and undercount TikTok-driven-DTC-attribution by 30-50% per Triple-Whale-TikTok-attribution-2024. **Fix:** Wire Triple-Whale-TikTok-attribution per Phase 1 Step 1.7 + LIVE-cohort-LTV-overlay per Phase 3 Step 3.6; weekly-cohort-LTV-iteration-cycle per Phase 4 Step 4.3.

14. **Pitfall #14 — Skipping Triple-Whale-cohort-LTV-iteration-cycle.** Brands run TikTok-Shop without weekly-cohort-LTV-iteration, miss opportunities to boost top-decile-creators and pause bottom-decile-creators, and cap incremental-GMV-contribution at 30-50% of expected. **Fix:** Use the canonical weekly-cohort-LTV-iteration-cycle per Phase 4 Step 4.3 (Triple-Whale-cohort-LTV-iteration-cycle weekly + LIVE-cohort-LTV-iteration-cycle weekly).

### F — operational cross-cutting

15. **Pitfall #15 — Skipping quarterly-LIVE-cadence-portfolio-review.** Brands run LIVE-shopping for 12+ months without quarterly-portfolio-review, accumulate underperforming-LIVE-sessions, and cap LIVE-cohort-LTV-multiplier at 1.0-1.2×. **Fix:** Run quarterly-LIVE-cadence-portfolio-review per Phase 4 Step 4.5; iterate LIVE-cadence (1-vs-2-vs-3-vs-4-sessions/week) + LIVE-time-slot (7-9-PM-ET-Tue/Wed/Thu vs 12-2-PM-ET-Sat/Sun vs 8-10-PM-ET-Fri/Sat).

---

## Verification

End-to-end verification of this playbook lands when:

1. **Phase 1 Gate A passed** — 8-prereq TikTok-Shop-onboarding-pack compiled + first 20-50 creator-affiliates onboarded + Klaviyo-TikTok-channel-integration live + Triple-Whale-TikTok-attribution wired.
2. **Phase 2 Gate B passed** — TikTok-Ads-Manager + Spark-Ads-boost-configured + first TikTok-Shop-driven-GMV-realized.
3. **Phase 3 Gate C passed** — LIVE-shopping-studio-built + 4-hour-week-LIVE-cadence-running + first LIVE-sessions-shipped + TikTok-Shop-affiliate-program-launched.
4. **Phase 4 Gate D passed** — Shop-Score-4.8+-audit-process running + LIVE-cadence-optimization-flow running + Triple-Whale-cohort-LTV-iteration-cycle weekly + creator-affiliate-tier-promotion-SOP running.
5. **Steady-state confirmed** — Path B target: 5-15% incremental-GMV-contribution-from-TikTok-Shop achieved + Shop-Score 4.8+ validated + LIVE-cohort-LTV-multiplier ≥1.2× organic-DTC-cohort-LTV + creator-affiliate-tier-distribution-60-30-10 + FTC-disclosure-language-compliance-rate ≥95%.

---

## Cost & ROI estimate

**Path A (creator-affiliate-only + shoppable-video-ads) — Brand <$500k GMV / 2 hr/wk operator-capacity:**
- Setup cost: $0 (organic-creator-content + free-tools)
- Per-month cost: $1.5k-$6k/mo ($50-$200/day Spark-Ads × 30 days + creator-product-seeding-cost)
- Year-1 incremental TikTok-Shop-GMV: $25k-$250k
- Year-1 ROI: 4.5:1 conservative nominal / 2.5-3.5× cost-stack

**Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week) — Brand $500k-$5M GMV / 4-8 hr/wk operator-capacity [DEFAULT]:**
- Setup cost: $500-$2k one-time LIVE-shopping-studio-build + $0 Klaviyo-TikTok-channel-integration + $179/mo Triple-Whale-Starter
- Per-month cost: $2k-$5k/mo ($50-$500/day Spark-Ads × 30 days + creator-product-seeding + LIVE-show-production $0-$500/session × 4-sessions/month)
- Year-1 incremental TikTok-Shop-GMV: $500k-$1M at $2M US DTC base (5-15% incremental-GMV-contribution)
- Year-1 ROI: 8.5:1 default / 12-14:1 Year-2+ ramp
- Cost-stack breakdown: $24k-$58k annual ($2k-$5k/mo × 12 months)

**Path C (full TikTok-Shop-orchestration) — Brand $5M+ GMV / 15-25 hr/wk operator-capacity + dedicated-creator-affiliate-manager:**
- Setup cost: $2k-$5k one-time LIVE-shopping-studio-build + $0 Klaviyo-TikTok-channel-integration + $1,290/mo Triple-Whale-Pro
- Per-month cost: $5k-$15k/mo + $20k-$40k FTE-amortized
- Year-1 incremental TikTok-Shop-GMV: $1M-$5M at $10M US DTC base (5-15% incremental-GMV-contribution muted by 6-12-month LIVE-cadence-build-cycle)
- Year-1 ROI: 6:1 default / 12-14:1 Year-3 ramp (after LIVE-cadence-portfolio-mature)
- Cost-stack breakdown: $80k-$220k annual ($5k-$15k/mo × 12 months + $20k-$40k FTE-amortized)

**Path D (TikTok-Shop-affiliate-program-only) — Brand with Refersion-or-Levanta-already-live + want TikTok-Shop-channel-on-top:**
- Setup cost: $0 (TikTok-Shop-affiliate-program-self-serve)
- Per-month cost: $0 + 20-30%-of-GMV commission
- Year-1 incremental TikTok-Shop-GMV: $50k-$250k
- Year-1 ROI: 4-8:1 conservative / 8-12:1 with full TikTok-Shop-cohort-overlay

**Path E (pre-revenue / pre-launch / defer) — Brand <10 SKUs + <25% gross-margin + no-creator-affiliate-pool + no-LIVE-capacity + <40% Gen-Z-audience-skew:**
- Setup cost: $0
- Per-month cost: $0
- Year-1 incremental TikTok-Shop-GMV: $0 (defer)
- Year-1 ROI: N/A (defer)

---

## Companion tool / Future-tick companions

This playbook is the canonical 2nd-layer operator-build companion for the TikTok-Shop / live-commerce track (Move #15.x). The canonical 5 future-tick companions per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order are:

1. **`assets/19-tiktok-shop-creator-briefs.md`** *(planned — does not yet exist)* — the canonical 3rd-layer operator-copy companion. Paste-ready per-voice per-SKU-archetype creator-brief template with 5 voice profiles × 6 SKU archetypes = 30 voice-variant creator-briefs; canonical LIVE-shopping-show-runner-script-template (5-segment-script); canonical TikTok-Shop-product-listing-optimization-checklist; canonical creator-payout-contract-template with 5-payout-structures (CPM / CPS / flat-fee / hybrid / product-seeding-only); canonical Shop-Score-4.8+-audit-template; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15. **Gated on this playbook shipping first per canonical layer order.**
2. **`dashboard/app/tiktok/page.tsx`** *(shipped 2026-07-02 per the operator-surface-route-tick follow-up)* — the canonical 4th-layer Next.js operator-surface route. Renders research/11 + this playbook + assets/19 as unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 4.8+ Shop-Score target / 4-phase LIVE cadence / 30 voice-cells] + TL;DR from research/11 + 3 layer cards [RD-11 + PB-18 + AS-19 with 5-voice density pills all ≥15] + future-tick companions [scripts/tiktok_shop_unit_economics.py + dashboards/tiktok-shop-live-commerce-health.html]. **Gated on this playbook + assets/19 shipping first per canonical layer order.**
3. **`scripts/tiktok_shop_unit_economics.py`** *(planned — does not yet exist)* + **`scripts/tests/test_tiktok_shop_unit_economics.py`** *(planned — does not yet exist)* — the canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script. 80-100 TDD tests across 13 test classes; takes 12 operator-supplied inputs [us_dtc_gmv + sku_count + sku_archetype_distribution + gross_margin_pct + has_tiktok_business_account + has_tiktok_shop_seller_center + has_shopify_tiktok_channel + has_klaviyo_tiktok_channel + has_triple_whale_tiktok_attribution + creator_affiliate_pool_size + voice_profile + has_live_shopping_studio_capacity_hours_per_week] → outputs Path A (creator-affiliate-only + shoppable-video-ads only $0/mo <$500k GMV 4.5:1 ROI) / Path B (creator-affiliate + shoppable-video-ads + LIVE-shopping 4-hour-week $0-$2k/mo $500k-$5M GMV 8.5:1 ROI with 5-15% incremental-GMV-contribution at $2M US DTC base) / Path C (full TikTok-Shop-orchestration $2k-$10k/mo $5M+ GMV 6:1 ROI muted by 6-12-month LIVE-cadence-build-cycle) recommendation with cost stack + Year-1 incremental TikTok-Shop-GMV + 6 deferral gates [sku_count <10 / gross_margin_pct <25% / no-TikTok-business-account / no-Shopify-TikTok-channel / no-creator-affiliate-pool / LIVE-cadence-capacity <4 hr/wk] + 3 downgrade gates [luxury-voice-without-creator-brief-guardrails / B2B-voice-without-wholesale-channel / Gen-Z-voice-without-TikTok-content-cadence]). Hermetic local-config scorer with no TikTok-Shop-Seller-Center / Shopify-TikTok-Channel / Klaviyo-TikTok-channel / Triple-Whale-TikTok-attribution / Aspire / Collabstr / TikTok-Ads-Manager API access required. **Gated on this playbook + assets/19 + dashboard/app/tiktok/page.tsx shipping first per canonical layer order.**
4. **`dashboards/tiktok-shop-live-commerce-health.html`** + **`dashboards/tests/test_tiktok_shop_live_commerce_health.js`** *(shipped 2026-07-02 per the static-dashboard-tick follow-up — closes the TikTok-Shop / live-commerce track at 6/6 layers per the v0.11.0 track-fully-closed pivot pattern)* — the canonical 6th-and-final static-dashboard layer. Self-contained static HTML ~44KB / 6 sections + 4 canonical data structures [FLOWS 6 flows + PATH_TABLE 3 path tiers A/B/C + PHASE_GATES 4 phases with 10/10/10/9 prereqs each + CREATOR_AFFILIATE_PAYOUT_MATRIX 5 voices × 3 tiers + SAMPLE_INPUTS Path B default $2M US DTC base / 35 SKUs / 50% gross margin / 4 hr/wk LIVE capacity / creator-affiliate-pool ≥20 / 4.5+ Shop-Score baseline] + 8 helper functions [tierForGmv + year1IncrementalGmvLow/High + year1CostLow/High + liveLtvMid + sparkRoasMid + creatorAffiliatePoolMid + shopScoreAlgorithmicBonusMid] + 6 render functions + URL param parsing [?path= ?us_dtc_gmv= ?demo=1] + 6 canonical TikTok-Shop-flows × {live/draft/staging} readiness + 3-path GMV-tier decision matrix + 4 phase-by-phase verification gates with 10/10/10/9 prereqs each mirroring this playbook §Phase 1+2+3+4 verification gates + 106 Node smoke tests across 26 categories per the canonical v0.11.0 static-dashboard-tick recipe. **Gated on this playbook + assets/19 + dashboard/app/tiktok/page.tsx + scripts/tiktok_shop_unit_economics.py shipping first per canonical layer order (all 4 are shipped).**

---

## Next moves

This playbook ships the canonical 2nd-layer operator-build companion for the TikTok-Shop / live-commerce track (Move #15.x). The 4 remaining layers per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order:

- **`assets/19-tiktok-shop-creator-briefs.md`** *(planned — does not yet exist)* — canonical 3rd-layer operator-copy companion. 30 voice-variant creator-briefs + LIVE-shopping-show-runner-script-template + TikTok-Shop-product-listing-optimization-checklist + creator-payout-contract-template + Shop-Score-4.8+-audit-template. **Recommended next tick** per canonical layer order. Compounds this playbook's 5-pillar framework by mapping each pillar into paste-ready-per-voice-templates + per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15.
- **`dashboard/app/tiktok/page.tsx`** *(shipped 2026-07-02 per the operator-surface-route-tick follow-up)* — canonical 4th-layer Next.js operator-surface route. Renders research/11 + this playbook + assets/19 as unified operator surface.
- **`scripts/tiktok_shop_unit_economics.py`** *(planned — does not yet exist)* + **`scripts/tests/test_tiktok_shop_unit_economics.py`** *(planned — does not yet exist)* — canonical 5th-layer Archetype A/B hybrid Path A/B/C scoring script.
- **`dashboards/tiktok-shop-live-commerce-health.html`** + **`dashboards/tests/test_tiktok_shop_live_commerce_health.js`** *(shipped 2026-07-02 per the static-dashboard-tick follow-up — closes the TikTok-Shop / live-commerce track at 6/6 layers per the v0.11.0 track-fully-closed pivot pattern)* — canonical 6th-and-final static-dashboard layer.

**Once all 6 layers ship (this playbook + assets/19 + dashboard/app/tiktok + scripts/tiktok_shop_unit_economics.py + dashboards/tiktok-shop-live-commerce-health.html), the TikTok-Shop / live-commerce track fully closes at 6/6 layers per the v0.11.0 track-fully-closed pivot pattern.** The next-tick agent should then pivot to a NEW track via the v0.7.0 track-exhaustion-revival diagnostic.

---

## Related

- **`research/11-tiktok-shop-live-commerce.md`** — canonical 11-section research synthesis for the TikTok-Shop / live-commerce track. Read FIRST for the 5-pillar framework + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 39 prereqs.
- **`research/03-30-day-rollout-plan.md`** — Move #15.x entry on line 184. Canonical Move-status SEED for the TikTok-Shop / live-commerce track.
- **`playbooks/16-affiliate-program-launch.md`** — canonical 2nd-layer operator-build playbook for the affiliate-program track. The Move #15 TikTok-Shop-affiliate-program-launch in Phase 3 Step 3.5 is structurally similar to the Move #15 Playbook 16 §Phase 2 Recruit → Onboard → Cookie-mitigate → Tier-promote operator-build. Compounds TikTok-Shop-affiliate-program-launch with Refersion-or-Levanta-creator-affiliate-program for cross-platform-coverage.
- **`assets/03-ugc-brief.md`** — canonical creator outreach emails U1-U5 + contract templates C1-C2-C3 + Klaviyo UGC segment + cohort-LTV measurement. Compounds this playbook's 1.4 first-20-50-creator-affiliates-build step by providing the canonical creator-outreach-templates.
- **`assets/10-affiliate-program-playbook.md`** — canonical 35 voice-driven override cells for the 6-path affiliate-platform tool decision matrix. Compounds this playbook's Phase 1 Step 1.4 by providing per-voice-creator-brief-templates for the 5-voice profile structure (Default / Luxury / Sustainable / Gen-Z / B2B).
- **`assets/12-impact-data-pipeline.md`** — canonical Sustainable-affiliate-mission-alignment-verifier. Compounds this playbook's Phase 4 Step 4.4 creator-affiliate-tier-promotion-SOP by mapping Sustainable-mission-alignment-verifier-20/25/30%-Sustainable-tier-eligibility-criteria.
- **`research/04-international-expansion.md`** + **`playbooks/11-international-rollout.md`** — canonical international-expansion synthesis + operator-build companion. Compounds this playbook's Phase 5 Step 5.2 Path C international-TikTok-Shop-orchestration by providing the canonical international-rollout-framework for cross-border-TikTok-Shop-launch.
- **`scripts/triple_whale_attribution_check.py`** — canonical Move #6 Triple-Whale-attribution-check script. Compounds this playbook's Phase 1 Step 1.7 + Phase 3 Step 3.6 Triple-Whale-TikTok-attribution-setup by validating the canonical 7 gates for Triple-Whale-attribution-baseline-≥95%-match-rate.
- **Move #1 cart-abandon** — TikTok-Shop-cart-abandon-aware variant in Klaviyo.
- **Move #4 welcome-series** — TikTok-Shop-welcome-flow + creator-endorsed-welcome variant in Klaviyo.
- **Move #6 Triple Whale attribution** — TikTok-Shop-cohort-LTV-overlay + creator-cohort-attribution via Triple-Whale-TikTok-attribution.
- **Move #7 SMS** — TikTok-Shop-flash-sale-SMS + creator-led-SMS variant in Postscript.
- **Move #8 loyalty** — TikTok-Shop-tier-promotion + Smile.io-creator-tier + 2× points for TikTok-Shop-driven-customers.
- **Move #11 subscription-program** — TikTok-Shop-led-subscription-box + creator-cohort-subscription-tier via Recharge or Skio.
- **Move #15 affiliate-program** — TikTok-Shop-affiliate-program-on-top-of-Refersion-affiliate-program for cross-platform-coverage.

---

## Sources — 30 cited benchmarks across 5 categories

### A — TikTok-Shop platform benchmarks (7)

1. **TikTok for Business 2024–2025 shop-integration-platform data** — TikTok-Shop-Seller-Center-onboarding + category-approval-application + product-feed-optimization + 10 permitted-categories + rejection-rate 30-50% for first-time-applicants.
2. **Jungle Scout 2024–2025 TikTok-Shop-consumer-survey** — TikTok-Shop-GMV growth + creator-affiliate-payout-structures + LIVE-shopping conversion-rate 5-15% vs 1-3% in-feed-ads (3-5× higher CVR).
3. **eMarketer 2024–2025 social-commerce-forecast** — 5-20% of US social-commerce GMV by 2026 + $70B+ US TikTok-Shop-GMV 2026 vs $25B 2024 + 70%+ TikTok users 18-34.
4. **Insider Intelligence 2024–2025 US social-commerce-GMV-by-platform** — TikTok-Shop-orchestration benchmarks + LIVE-shopping-attribution-patterns + Shop-Score-4.8+-organic-distribution-bonus 30-50%.
5. **Modern Retail 2024–2025 livestream-shopping-attribution-benchmarks** — LIVE-shopping-studio-build-cost $500-$2k + 4-hour-week-cadence + 1-LIVE-session-per-week 60-90-minutes per session.
6. **NRF 2024 holiday-livestream-shopping-data** — LIVE-shopping holiday-peak + Q4-LIVE-cohort-LTV-multiplier + LIVE-cadence-optimization-iterations.
7. **Shopify 2024–2025 TikTok-Shop-integration-pricing** — Shopify-TikTok-Channel install $0 + product-feed-sync $0 + Triple-Whale-TikTok-cohort-overlay-wire.

### B — Creator-economics benchmarks (7)

8. **Aspire 2024 creator-economy-platform** — creator-affiliate-discovery-database + mid-tier-creator-onboarding + creator-tier-promotion-SOP benchmarks.
9. **Collabstr 2024 creator-economy-platform** — micro-creator-discovery-database + paid-flat-fee-trial-payout-structure $50-$500/creator/post.
10. **Impact 2024 affiliate-program-platform** — creator-affiliate-cohort-LTV + iOS-14.5+-cookie-deprecation-mitigation + creator-tier-promotion-4-trigger-SOP.
11. **Refersion 2024 affiliate-program-platform** — creator-affiliate-payout-structures + 5-voice-commission-tier-matrix + per-voice-cookie-windows + per-voice-payout-schedules.
12. **Levanta 2024 affiliate-program-platform** — server-side-fingerprinting + cross-channel-affiliate-bridge + creator-led-affiliate-program benchmarks.
13. **Awin 2024 affiliate-program-platform** — per-voice-cookie-windows-importance + Gen-Z-7-day-impulse-window vs B2B-90-day-sales-cycle + creator-acquisition-failure-rate 40-60% without per-voice-cookie-windows.
14. **FTC 2023-2024 affiliate-program-disclosure-enforcement** — 16-CFR-Part-255-disclosure-language + $10k+/violation-penalties + #ad/#sponsored/#partner disclosure-requirements.

### C — TikTok-Ads benchmarks (5)

15. **TikTok-Ads-Manager 2024 Spark-Ads-boost benchmarks** — 50-70% of total TikTok-Ads-budget-to-Spark-Ads + ROAS 2-4× Path B + top-decile-creators-boost.
16. **TikTok-Ads-Manager 2024 In-Feed-Ads-with-Product-Module benchmarks** — CVR 2-4× vs ads-without-Product-Module + per-SKU Product-Module-overlay.
17. **TikTok-Ads-Manager 2024 Top-View-Ads benchmarks** — full-screen-takeover + premium-pricing $20,000-$50,000/day + hero-SKU-awareness + 1-2-TopView-campaigns-per-month.
18. **Triple-Whale-TikTok-attribution-2024** — TikTok-Shop-driven-cohort-LTV-overlay vs organic-DTC-cohort-LTV vs paid-Meta-cohort-LTV at 30/60/90-day windows.
19. **TikTok-Shop-Shop-Score-2024-metrics** — 5-metric Shop-Score-audit (positive-review-rate + ship-on-time-rate + return-rate + chat-response-rate + chat-response-time) + 4.8+ Shop-Score-organic-distribution-bonus 30-50%.

### D — LIVE-shopping benchmarks (6)

20. **TikTok-LIVE-2024-benchmarks** — 1-LIVE-session-per-week 60-90-minutes-per-session + 4-hour-week-cadence + 7-9-PM-ET-Tue/Wed/Thu optimal time-slot.
21. **Streamlabs-OBS-or-TikTok-LIVE-Studio benchmarks** — LIVE-streaming-software $0 + teleprompter-app $0-$30/mo + LIVE-show-production-cost $50-$200/session.
22. **Ring-light + iPhone-15-Pro + tripod + lavalier-mic benchmarks** — LIVE-shopping-studio-build-cost $500-$2k one-time + tested-with-2-internal-test-sessions-before-public-launch.
23. **5-segment-LIVE-show-runner-script-template** — Segment-1 product-intro + Segment-2 demo + Segment-3 Q&A + Segment-4 creator-guest-takeover + Segment-5 closing-limited-time-offer.
24. **LIVE-cohort-LTV-multiplier benchmarks** — LIVE-cohort-LTV 1.2-1.5× organic-DTC-cohort-LTV Path B + LIVE-cohort-LTV-iteration weekly-cadence.
25. **Quarterly-LIVE-cadence-portfolio-review benchmarks** — review quarterly-LIVE-cadence-performance + iterate LIVE-cadence + iterate LIVE-time-slot.

### E — Compound-substrate benchmarks (5)

26. **Move #6 Triple-Whale-attribution benchmarks** — Triple-Whale-app-install $179/mo Starter-or-$1,290/mo Pro + Triple-Whale-TikTok-cohort-overlay-wire + post-purchase-survey-with-TikTok-source-tracking.
27. **Move #8 Smile.io-loyalty benchmarks** — 2× points-for-TikTok-Shop-driven-customers + creator-tier-promotion-cross-reference + Smile.io-loyalty-≥30%-member-share-of-total-revenue.
28. **Move #11 subscription-program benchmarks** — TikTok-Shop-led-subscription-box + creator-cohort-subscription-tier via Recharge or Skio.
29. **Move #15 affiliate-program benchmarks** — TikTok-Shop-affiliate-program-on-top-of-Refersion-affiliate-program + cross-platform-coverage + creator-tier-promotion-4-trigger-SOP.
30. **Move #4 + #7 + #15 + #11 cross-pollination benchmarks** — TikTok-Shop-cart-abandon + TikTok-Shop-welcome-flow + TikTok-Shop-flash-sale-SMS + TikTok-Shop-subscriber-cohort-LTV-overlay-via-Klaviyo-TikTok-channel.

---

*This playbook is the canonical 2nd-layer operator-build companion for the TikTok-Shop / live-commerce track (Move #15.x). Read `research/11-tiktok-shop-live-commerce.md` FIRST for the canonical 11-section research synthesis + 5-pillar framework + 3 GMV-tier paths + 4 phase-by-phase verification gates + 15 pitfalls + 39 prereqs. Pair with `assets/19-tiktok-shop-creator-briefs.md` (canonical 3rd-layer operator-copy companion — paste-ready per-voice per-SKU-archetype creator-brief template with 5 voice profiles × 6 SKU archetypes = 30 voice-variant creator-briefs + LIVE-shopping-show-runner-script-template + TikTok-Shop-product-listing-optimization-checklist + creator-payout-contract-template + Shop-Score-4.8+-audit-template; per-voice-density Default / Luxury / Sustainable / Gen-Z / B2B each ≥15; gated on this playbook shipping first per canonical layer order) + `dashboard/app/tiktok/page.tsx` (canonical 4th-layer Next.js operator-surface route — 20th route in the operator dashboard; renders research/11 + this playbook + assets/19 as unified operator surface with 4 hero metrics [Path B 8.5:1 default Year-1 ROI / 4.8+ Shop-Score target / 4-phase LIVE cadence / 30 voice-cells] + TL;DR from research/11 + 3 layer cards [RD-11 + PB-18 + AS-19] + future-tick companions [scripts/tiktok_shop_unit_economics.py + dashboards/tiktok-shop-live-commerce-health.html]; gated on this playbook + assets/19 shipping first per canonical layer order) + Move #1 cart-abandon + Move #4 welcome-series + Move #6 Triple Whale attribution + Move #7 SMS + Move #8 loyalty + Move #11 subscription-program + Move #15 affiliate-program as the canonical DTC-retention-substrate that compounds the TikTok-Shop channel layer.*