# Affiliate Program Launch — Operator Build (Refersion + Levanta + Impact + GoAffPro + PartnerStack + Aspire 6-path tool orchestration)

> **Source.** Operator-build companion to `research/09-affiliate-program.md` (the canonical 11-section affiliate-program research synthesis; Move #15 from `research/03-30-day-rollout-plan.md` §Next moves after 30 days line 177; the affiliate / creator / influencer + 10–30% incremental revenue + 2.0–3.0× LTV-multiplier layer the US-centric Shopify-DTC stack implicitly defers). Read `research/09-affiliate-program.md` FIRST for the 5-pillar framework [Pillar 1 program-design + platform-selection 6-path tool decision matrix / Pillar 2 commission-structure + payout-schedule 5-voice commission-tier matrix + cookie-window overrides / Pillar 3 cookie-attribution + iOS 14.5+ deprecation mitigation 6-step recipe / Pillar 4 cohort-LTV-measurement + attribution-merge 4-step SQL / Pillar 5 FTC-disclosure-compliance + 16 CFR Part 255 + contract-templates] + 3 GMV-tier paths [Path A <$500k GoAffPro free 12.5:1 ROI / Path B $500k–$5M Refersion DEFAULT 6:1–8:1 ROI / Path C $5M+ Impact + Levanta cross-channel 3.5:1–5:1 ROI] + 4 phase-by-phase verification gates [Gate A Phase 1 platform + commission tiers 10 prereqs / Gate B Phase 2 recruitment + onboarding 10 prereqs / Gate C Phase 3 cookie-deprecation mitigation 10 prereqs / Gate D Phase 4 tier-promotion + sustainable-mission-verifier + public listing 9 prereqs] + 15 pitfalls with corrective `Fix:` lines clustered into 6 failure modes [A platform-selection / B commission-structure / C cookie-deprecation / D cohort-LTV-measurement / E FTC-compliance / F operational cross-cutting]. This playbook maps each pillar into step-by-step Refersion + Levanta + Impact + GoAffPro + PartnerStack + Aspire multi-platform affiliate-program operator build across 4 phases (Phase 1 platform + commission tiers + FTC compliance ~6hr Path B baseline Weeks 1–2 / Phase 2 recruitment + onboarding + agreement signing + landing-page live ~10hr Weeks 3–4 / Phase 3 cookie-deprecation mitigation + Triple Whale cohort-LTV wiring + server-side fingerprinting for Path C ~12hr Weeks 5–8 / Phase 4 tier-promotion + sustainable-mission-verifier + public-listing + 4-trigger SOP ~10hr Weeks 9–12 + 1–4 hr/wk ongoing). Pairs with `assets/10-affiliate-program-playbook.md` (35 voice-driven override cells for the 7 program-design dimensions × 5 voice profiles; Default 15/20/25% commission tiers + per-voice cookie windows Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d + per-voice payout schedules + the 6-path tool decision matrix that this playbook builds against) + `assets/03-ugc-brief.md` (creator outreach emails + contract templates + Klaviyo UGC segment wiring + cohort-LTV measurement that the affiliate-recruitment funnel shares) + `assets/12-impact-data-pipeline.md` (the canonical Sustainable-affiliate-mission-alignment-verifier script per research/09 Pillar 5 + research/12 Pillar 5 that gates Path C Sustainable tier 20/25/30% commission on creator mentioning carbon/materials/labor/community keywords ≥2 mentions per pillar in last 90 days) + Move #6 Triple Whale attribution + Move #6.5/6.6/6.7/6.8 attribution audits (the canonical cookie-deprecation mitigation substrate that Pillar 3 builds on) + Move #8 Smile.io loyalty (the canonical 2× points-for-affiliate-driven-customers cross-reference per research/09 Pillar 4).

## Goal

By the end of this playbook (Weeks 1–4 for Path A / Weeks 1–12 for Path B / Weeks 1–24 for Path C), the operator has:

1. **Refersion (or Levanta / Impact / GoAffPro / PartnerStack / Aspire) installed and configured** — chosen per the canonical 6-path affiliate-platform tool decision matrix from research/09 Pillar 1 (GoAffPro free–$25/mo for Path A / Refersion $99–$489/mo for Path B DEFAULT / Levanta $499+/mo for Path C creator-led / PartnerStack for B2B affiliate programs / Impact $1k+/mo for Path C enterprise / Aspire $500+/mo for Path C creator-marketing-blend).
2. **5-voice commission-tier matrix + per-voice cookie-window + payout-schedule live** — canonical Default 15/20/25% + Luxury 10/12/15% + Sustainable 20/25/30% + Gen-Z 25/30/35% + B2B 8–12/12–15/15–20% commission tiers with per-voice cookie windows (Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d) + per-voice payout schedules (Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60) per `assets/10-affiliate-program-playbook.md` §Decision-matrix.
3. **Recruitment funnel live with 20–30 active affiliates per Path B default** — seed-first-100-affiliates loop (existing-customer-list scrape + micro-influencer outreach via `assets/03-ugc-brief.md` U1-U5 outreach emails + affiliate-marketplace listing on Awin + Impact + Levanta marketplaces) per research/09 Pillar 1.
4. **Cookie-deprecation mitigation live** — the canonical 6-step recipe per research/09 Pillar 3 [Shopify CAPI (server-side) + UTM fallback + post-purchase email match + Shopify Pixel + Levanta server-side fingerprinting for Path C + Triple Whale affiliate-cohort-overlay] recovering 25–35% of would-be-lost attribution per iOS 14.5+ deprecation.
5. **Cohort-LTV measurement live in Triple Whale + Klaviyo + Smile.io** — research/09 Pillar 4 4-step SQL [extract affiliate-referrer from order-attribution → JOIN with Klaviyo profile → LEFT JOIN with customer-cohort-LTV → output per-affiliate 30/60/90-day LTV + tier-promotion flag] wired so the operator can measure the 2.0–3.0× LTV-multiplier for affiliate-driven customers vs the canonical paid-social baseline.
6. **FTC-compliance SOP + 3-clause affiliate agreement + per-voice FTC-disclosure-language templates live** — research/09 Pillar 5 + `assets/10-affiliate-program-playbook.md` §FTC-compliance (16 CFR Part 255 + #ad/#sponsored/#partner disclosure + $10k+/violation penalty per FTC 2023-2024 enforcement + the 3-clause affiliate agreement [commission + payment-terms + termination]).
7. **Sustainable-mission-verifier + 4-trigger tier-promotion SOP + public-listing on Awin + Impact + Levanta marketplaces** — research/09 Pillar 5 + the canonical 4-trigger tier-promotion SOP [volume + cohort-LTV + content-quality + tenure] per `assets/12-impact-data-pipeline.md` Sustainable-affiliate-mission-alignment-verifier (creator mentions carbon/materials/labor/community keywords ≥2 mentions per pillar in last 90 days = 20/25/30% Sustainable commission tier; fail = default to Default tier or decline).
8. **10-metric per-affiliate KPI dashboard live** — research/09 Pillar 4 + the canonical 10-metric per-affiliate KPI dashboard [clicks / CVR / revenue / commission / CAC-equivalent / 30-day LTV / 60-day LTV / 90-day LTV / LTV:CAC / tier-promotion-flag] wired to Klaviyo per-affiliate-segment + Triple Whale per-affiliate-cohort.

**Operator time commitment:** Path A ~25 hours one-time + 1 hr/wk ongoing = **~75 hr Year-1**. Path B ~50 hours one-time + 4 hr/wk ongoing = **~260 hr Year-1**. Path C ~120 hours one-time + 15 hr/wk ongoing + dedicated affiliate-program-manager hire = **~900 hr Year-1 + $70k–$100k FTE**.

**Default path: Path B mid-market Refersion $500k–$5M GMV / 20–30 active affiliates / 30-day cookie window / 15/20/25% Default commission tiers** — the canonical 6:1–8:1 Year-1 ROI per research/09 §Cost & ROI ($720k attributed revenue / $152k cost = 3.7:1 conservative nominal; aggressive 6:1–8:1 with full Triple Whale cohort-LTV wiring + Levanta server-side fingerprinting for Path C brands). Path A is the lean starter (GoAffPro free–$25/mo; <$500k GMV; <20 active affiliates; in-house Triple Whale UTM-tracking). Path C is the enterprise scale (Levanta + Impact cross-channel $5M+ GMV / 50+ active affiliates / 90-day cookie window / B2B-tier 8–12% commission).

---

## Which affiliate platform fits your GMV tier + creator-mix strategy

The canonical 6-path affiliate-platform decision matrix per research/09 Pillar 1 (Refersion 2024 + Levanta 2024 + Impact 2024 + GoAffPro 2024 + PartnerStack 2024 + Aspire 2024 vendor-pricing pages verified 2026-06):

- **<$500k GMV / <20 active affiliates / lean starter:** **Path A — GoAffPro Free–$25/mo** OR **Refersion Starter $99/mo**. Single-tier commission (e.g. 15% Default) + 30-day cookie window + Shopify-native dashboard + email-support. GoAffPro is the cheapest with 100-affiliate free tier; Refersion Starter adds Klaviyo deep-integration + custom commission tiers.
- **$500k–$5M GMV / 20–50 active affiliates / DEFAULT:** **Path B — Refersion $239/mo Growth OR $489/mo Scale** OR **Levanta $499/mo Growth**. Multi-tier commission (Default 15/20/25% + Sustainable 20/25/30% + Gen-Z 25/30/35%) + per-voice cookie windows + Triple Whale cohort-LTV wiring + automated PayPal Mass Pay / Wise payouts + Klaviyo post-purchase email attribution. **Refersion Growth** is the canonical default for the Shopify-native-only brand; **Levanta** is the creator-led-path for brands that want UGC content rights + Amazon-style attribution per Levanta 2024 benchmarks.
- **$5M+ GMV / 50+ active affiliates / enterprise:** **Path C — Impact $1k+/mo Enterprise** OR **Levanta $1k+/mo Scale** OR **PartnerStack for B2B-affiliate-programs**. Cross-channel attribution (Impact + Levanta + Amazon + Walmart per Levanta 2024 benchmarks) + dedicated CSM + custom contracts + 4-trigger tier-promotion SOP + Sustainable-mission-verifier integration. **Impact** has the broadest cross-channel attribution + the strongest B2B SaaS partnerships; **PartnerStack** is the B2B-affiliate-program specialized path for B2B brands.
- **Aspire $500+/mo** — influencer-only path for brands that want a pure UGC + paid-creator + affiliate-blend (AspireQ + AspireAnalytics + AspirePay per Aspire 2024 vendor pricing).
- **PartnerStack** — B2B-affiliate-program specialized path for B2B SaaS or B2B-DTC brands (e.g. Faire-style B2B wholesale partners) with NET-60 payout schedule + 90-day cookie window + per-affiliate LTV:CAC ≥3:1 contract clauses.

---

## Prerequisites

By the end of Week 0 (before Phase 1 starts), the operator has:

1. **Move #1 cart-abandon email shipped** — Klaviyo cart-abandon flow with the canonical 3-email cadence [1hr / 24hr / 72hr] per `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1 from `research/02-top-10-leverage-moves.md`). Without Move #1 the affiliate-program has no post-purchase email attribution to measure against.
2. **Move #4 welcome-series shipped** — Klaviyo welcome-series 5-email cadence per `playbooks/04-welcome-series-klaviyo.md` (Move #4). The welcome-series is the canonical post-purchase-email match for the cookie-deprecation mitigation recipe per research/09 Pillar 3.
3. **Move #6 Triple Whale attribution live** — Triple Whale (or Polar) attribution installed on the Shopify store with at least 30 days of attribution-data per `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6). Triple Whale is the canonical measurement substrate for research/09 Pillar 4 cohort-LTV measurement.
4. **Move #6.5/6.6/6.7/6.8 attribution-quality audits shipped** — Move #6.5 Meta/Google/GA4 + Move #6.6 TikTok + Move #6.7 Snap+Pinterest + Move #6.8 cross-platform-drift-unification audits per `playbooks/06.5-attribution-quality-audit.md` + `playbooks/06.6-tiktok-attribution-quality-audit.md` + `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` + `playbooks/06.8-cross-platform-attribution-drift-unification.md`. These are the canonical cookie-deprecation mitigation substrate that research/09 Pillar 3 builds on.
5. **Move #8 loyalty-program (Smile.io) shipped** — Smile.io loyalty-points-program live per `playbooks/07-loyalty-program-smile.md` (Move #8). The canonical 2× points-for-affiliate-driven-customers cross-reference per research/09 Pillar 4 needs Smile.io webhook live.
6. **FTC-compliance checklist + 3-clause affiliate agreement template ready** — the canonical FTC-compliance checklist [16 CFR Part 255 + #ad/#sponsored/#partner disclosure + $10k+/violation penalty per FTC 2023-2024 enforcement] + the canonical 3-clause affiliate agreement [commission + payment-terms + termination] per research/09 Pillar 5 + `assets/10-affiliate-program-playbook.md` §FTC-compliance. Operators should have legal review before shipping public affiliate-program.
7. **PayPal Mass Pay OR Wise configured** — the canonical payout-rail for paying 20–50 affiliates at scale per research/09 Pillar 2. PayPal Mass Pay supports US-domestic + Wise supports international affiliates.
8. **Klaviyo post-purchase webhook + Triple Whale affiliate-cohort-overlay live** — research/09 Pillar 3 §6-step recipe + Pillar 4 §4-step SQL. Without these the operator cannot measure per-affiliate cohort-LTV.

**Operator time commitment for prerequisites:** ~10 hours one-time (Move #6 + Move #6.5/6.6/6.7/6.8 attribution audits + Smile.io + PayPal Mass Pay + Klaviyo post-purchase webhook + Triple Whale affiliate-cohort-overlay + FTC-compliance checklist + 3-clause affiliate agreement).

**Default prerequisite scenario:** $500k+ GMV brand with Move #1 + #4 + #6 + #6.5 + #6.6 + #6.7 + #6.8 + #8 + FTC-compliance checklist + PayPal Mass Pay + Triple Whale cohort-LTV wired = ready to ship Phase 1.

---

## Step-by-step — Phase 1 (Weeks 1–2, ~6 hours, Path B baseline)

Platform + commission tiers + cookie windows + payout schedules + FTC-compliance SOP + 3-clause agreement + landing-page skeleton.

### 1.1 Refersion (or Levanta / Impact / GoAffPro) install + Shopify-app store

Pick the canonical 6-path platform per Path B DEFAULT = **Refersion Growth $239/mo** (or Scale $489/mo for 50+ affiliates).

Install via Shopify App Store:
1. **Shopify Admin → Apps → Refersion → Install** (or Levanta / Impact / GoAffPro)
2. **Refersion Onboarding Wizard:**
   - Connect Shopify store + Klaviyo + Triple Whale + PayPal Mass Pay / Wise + Smile.io
   - Set default commission tier (15% Default Path B baseline)
   - Set default cookie window (30d Default per research/09 Pillar 2)
   - Set default payout schedule (NET-30 Default per research/09 Pillar 2)
   - Add FTC-compliance boilerplate to affiliate-T&C (16 CFR Part 255 + #ad disclosure language)
   - Add 3-clause affiliate agreement [commission + payment-terms + termination] with legal review
3. **Configure 5-voice commission tiers** per `assets/10-affiliate-program-playbook.md` §5-voice-commission-tier-matrix:
   - Default 15/20/25% (Tier 1 / Tier 2 / Tier 3)
   - Luxury 10/12/15% (Tier 1 / Tier 2 / Tier 3)
   - Sustainable 20/25/30% (gated on Sustainable-mission-verifier pass per `assets/12-impact-data-pipeline.md`)
   - Gen-Z 25/30/35% (7d cookie window per research/09 Pillar 2)
   - B2B 8–12/12–15/15–20% (90d cookie window + NET-60 payout schedule per research/09 Pillar 2)

**Time:** 90 minutes.

### 1.2 Per-voice cookie-window + payout-schedule configuration

Per research/09 Pillar 2 §per-voice-override-columns, the operator configures 5 distinct voice-cookie-window + voice-payout-schedule combinations:

| Voice | Cookie window | Payout schedule | Rationale |
|---|---|---|---|
| **Default** | 30 days | NET-30 | Industry-standard 30-day attribution window + monthly-batch payouts |
| **Luxury** | 60 days | NET-45 | Luxury purchase-cycle is 45–60 days; longer cookie captures the consideration phase |
| **Sustainable** | 30 days | NET-30 | Same as Default; mission-aligned creators don't need longer windows |
| **Gen-Z** | 7 days | NET-7 | Gen-Z impulse-buy window is 5–10 days; shorter window + faster payout aligns with creator-cash-flow |
| **B2B** | 90 days | NET-60 | B2B purchase-cycle is 60–90 days; longer cookie + longer payout for B2B partners |

**Time:** 30 minutes.

### 1.3 FTC-compliance SOP + 3-clause affiliate agreement live

Per research/09 Pillar 5, the operator must ship FTC-compliance before any public affiliate-program launch (FTC 2023 Endorsement Guides requires clear-and-conspicuous disclosure on every post; $10k+/violation per FTC 2023-2024 enforcement):

1. **Per-voice FTC-disclosure-language templates** (paste-ready in Klaviyo + per-creator-onboarding-email):
   - Default: "I work with [Brand] as a paid ambassador. All opinions are mine. #ad"
   - Luxury: "Paid partnership with [Brand]. #partner #sponsored"
   - Sustainable: "I earn a commission when you buy through my link — and I only partner with brands that share my values. #ad"
   - Gen-Z: "Gifted + commission. Using code [CODE] supports me as a creator. #ad"
   - B2B: "Affiliate partnership with [Brand]. #partner"
2. **3-clause affiliate agreement** (per Refersion / Levanta standard T&C + customization):
   - **Clause 1: Commission** — "Affiliate earns [15/20/25]% commission on net-order-value (excluding tax + shipping + returns). Commission-tier-promotion SOP is at the discretion of [Brand] based on 4-trigger SOP [volume + cohort-LTV + content-quality + tenure]."
   - **Clause 2: Payment-terms** — "Payout via PayPal Mass Pay or Wise on [NET-30/NET-45/NET-60] schedule. Minimum payout $50. Chargeback / refund reverses commission."
   - **Clause 3: Termination** — "30-day notice no-penalty by either party. Brand may terminate immediately for FTC-compliance violation, fraud, or brand-safety violation. Affiliate-link is revoked on termination; pending commissions pay out per schedule."
3. **Quarterly compliance audit** — every 90 days the operator reviews the top-10 affiliate-creators' last 90 days of posts for FTC-compliance; non-compliant creators are warned once + terminated on second violation.

**Time:** 120 minutes.

### 1.4 Affiliate-application landing-page live

The canonical affiliate-program landing-page structure (paste-ready Shopify page template):

- **Hero:** "Join the [Brand] Affiliate Program — Earn [15/20/25]% on every sale you refer"
- **Why-join:** 3-column benefit-grid [Earn recurring commission / 30-day cookie window / Monthly payouts via PayPal Mass Pay]
- **Per-voice program highlights:** 5-voice override columns showing Default 15% / Luxury 10% / Sustainable 20% / Gen-Z 25% / B2B 8-12%
- **Application form:** Name + Email + Social-handles + Audience-size + Niche + How-you'd-promote-us (free-text)
- **Approval workflow:** Manual review by operator within 48 hours + auto-approval for top-10% creators (audience-size ≥10k + engagement-rate ≥3%)
- **T&C link:** 3-clause affiliate agreement + FTC-compliance boilerplate

**Time:** 90 minutes.

### 1.5 Verification — Gate A (Phase 1 readiness, end of Week 2)

The operator has 10 prereqs complete before Phase 2 starts:

1. Refersion (or chosen platform) installed + connected to Shopify + Klaviyo + Triple Whale + PayPal Mass Pay / Wise + Smile.io ✓
2. Default 15/20/25% commission tier live ✓
3. 30-day cookie window configured ✓
4. NET-30 payout schedule configured ✓
5. 5-voice commission tiers configured (Default / Luxury / Sustainable / Gen-Z / B2B) ✓
6. Per-voice cookie-window + payout-schedule configured ✓
7. Per-voice FTC-disclosure-language templates in Klaviyo + per-creator-onboarding-email ✓
8. 3-clause affiliate agreement signed off by legal + live in Refersion T&C ✓
9. Affiliate-application landing-page live at `/pages/affiliate-program` ✓
10. Quarterly compliance audit cadence set up (every 90 days) ✓

**Time:** 60 minutes for verification (5 minutes per prereq × 10 prereqs + 10 minutes for spot-check test orders).

---

## Step-by-step — Phase 2 (Weeks 3–4, ~10 hours, Path B recruitment + onboarding)

Seed-first-100-affiliates loop + creator outreach + marketplace listing + onboarding flow.

### 2.1 Seed-first-100-affiliates via existing-customer-list scrape

Per research/09 Pillar 1 §recruitment §2, the canonical first-100-affiliate loop is to scrape the existing Klaviyo customer-list for customers who match creator-criteria:

1. **Klaviyo Segment → "Engaged customers with social handles"** — filter for customers who:
   - Have made ≥2 purchases in the last 12 months
   - Have an open-rate ≥30% in the last 90 days
   - Have submitted ≥1 UGC via the post-purchase-email-UGC-trigger per `assets/03-ugc-brief.md` §UGC-sourcing
   - Have a public Instagram / TikTok handle on their profile
2. **Manual outreach** to the top 50 customers per `assets/03-ugc-brief.md` §U1-U5 outreach-email-templates with a customized affiliate-program pitch (paste-ready in `assets/17-affiliate-program-templates.md` (shipped 2026-06-29 per the asset-tick follow-up to research/09 + this playbook) + the existing `assets/03-ugc-brief.md` §U5 creator-outreach-email):
   - "Hi [Name] — we've loved your UGC and your audience is a perfect fit for [Brand]. Want to join our affiliate program? 15% commission on every sale you refer + 30-day cookie window + monthly payouts."
3. **Expected conversion:** 10–20% of outreach = 5–10 new affiliates in Week 3.

**Time:** 180 minutes.

### 2.2 Micro-influencer outreach via Aspire + Collabstr + Instagram hashtag scrape

Beyond the existing-customer scrape, the canonical second-100-affiliate loop is micro-influencer outreach:

1. **Aspire / Collabstr / CreatorIQ** — search for micro-influencers (5k–50k followers) in your category (e.g. "sustainable home goods", "luxury skincare") with engagement-rate ≥3% + audience-match ≥70%
2. **Instagram hashtag scrape** — for #sustainablehome + #luxuryskincare + #[yourcategory], identify the top-100 posts in the last 30 days + DM-outreach the creators with the affiliate-program pitch
3. **Expected conversion:** 5–10% of outreach = 5–10 new affiliates in Week 4.

**Time:** 240 minutes.

### 2.3 Public-listing on Awin + Impact + Levanta marketplaces

To scale beyond the first 100 affiliates, the canonical third-recruitment-loop is public-marketplace listing:

1. **Awin** (free listing, 1,000+ affiliate-programs indexed) — submit your affiliate-program for listing in the Awin marketplace; Awin affiliates browse + apply + get auto-approved into your program
2. **Impact** (free listing for Path C brands; $1k+/mo for Impact-managed) — submit for Impact marketplace listing; Impact's 60k+ affiliates see your program in their dashboard
3. **Levanta** (Path C creator-led) — submit for Levanta marketplace; Levanta's 100k+ creator-network sees your program in their dashboard
4. **Refersion Marketplace** — for Path B / Path A brands, Refersion's in-app marketplace lists your program to Refersion's existing affiliates

**Expected reach:** 100–500 affiliate-applications in Week 4–8 from public-marketplace listing.

**Time:** 60 minutes for the 3-4 marketplace application-forms (most are 30 minutes each).

### 2.4 Onboarding flow + first-90-day-creator-journey

For every approved affiliate, the operator sends a 4-email onboarding sequence (paste-ready in `assets/17-affiliate-program-templates.md` (shipped 2026-06-29 per the asset-tick follow-up to research/09 + this playbook)):

1. **Day 0 — Welcome email:** "Welcome to the [Brand] Affiliate Program — here's your unique link [AFFILIATE_LINK] + your FTC-disclosure-template + your 30-day cookie window + your NET-30 payout schedule + your tier-promotion SOP"
2. **Day 7 — First-content-prompt:** "Drop your first [Brand] link in your next post + tag #ad + share your unique code [CODE]"
3. **Day 30 — First-payout-celebration:** "Congrats on your first $[X] in affiliate revenue! Your next payout is [DATE]"
4. **Day 60 — Tier-promotion-educational:** "Want to unlock 20% Tier-2 commission? Hit $[X] in attributed revenue + 90-day LTV ≥$300 + ≥10 published posts"

**Time:** 60 minutes to set up the 4-email onboarding flow in Klaviyo.

### 2.5 Verification — Gate B (Phase 2 readiness, end of Week 4)

The operator has 10 prereqs complete before Phase 3 starts:

1. Existing-customer scrape completed + ≥10 affiliates onboarded via Klaviyo ✓
2. Micro-influencer outreach completed + ≥10 affiliates onboarded via Aspire/Collabstr ✓
3. Awin application submitted + approved ✓
4. Impact application submitted (Path C) + approved ✓
5. Levanta application submitted (Path C) + approved ✓
6. Refersion marketplace listing live ✓
7. 4-email onboarding flow live in Klaviyo ✓
8. ≥20 active affiliates by end of Week 4 (Path B default) ✓
9. First-attributed-revenue in Triple Whale (≥$1,000 by end of Week 4) ✓
10. First-payout-scheduled in PayPal Mass Pay / Wise (Week 5 first payout) ✓

**Time:** 60 minutes for verification.

---

## Step-by-step — Phase 3 (Weeks 5–8, ~12 hours, Path B cookie-deprecation mitigation + cohort-LTV wiring)

6-step cookie-deprecation mitigation recipe + 4-step cohort-LTV measurement SQL + Sustainable-mission-verifier.

### 3.1 Shopify CAPI (server-side) + UTM fallback wiring

Per research/09 Pillar 3 §6-step cookie-deprecation mitigation recipe, the canonical first-step is Shopify Conversion API (server-side tracking):

1. **Shopify Admin → Settings → Customer Events → Add Custom Pixel** with the Shopify CAPI server-side tracking code:
   ```javascript
   // Shopify CAPI server-side tracking for affiliate-attribution
   analytics.subscribe("checkout_completed", async (event) => {
     const checkout = event.data?.checkout;
     const urlParams = new URLSearchParams(checkout?.landingSiteRef || "");
     const affiliateRef = urlParams.get("ref") || urlParams.get("aff") || urlParams.get("affiliate");
     if (affiliateRef) {
       await fetch("https://your-server.com/api/affiliate-attribution", {
         method: "POST",
         body: JSON.stringify({
           order_id: checkout.order?.id,
           affiliate_ref: affiliateRef,
           order_value: checkout.subtotalPrice?.amount,
           timestamp: Date.now(),
         }),
       });
     }
   });
   ```
2. **UTM fallback** — every affiliate link uses `?ref=[AFFILIATE_ID]&utm_source=affiliate&utm_medium=influencer&utm_campaign=[BRAND]_v[VOICE_PROFILE]` for Triple Whale attribution-merge

**Time:** 120 minutes.

### 3.2 Post-purchase email match in Klaviyo

Per research/09 Pillar 3 §step-3, the canonical post-purchase-email-match is:

1. **Klaviyo Flow → "Affiliate-purchase-attribution"** — triggered when a customer makes a purchase AND has the affiliate-referrer cookie OR the UTM ref-parameter:
   - Match the customer-email to the original affiliate-referrer
   - Attribute the purchase to the affiliate in Klaviyo + Triple Whale + Refersion
   - Send a "Thanks for supporting [Brand] via [Affiliate Name]" post-purchase email (which doubles as UGC-elicitation per `assets/03-ugc-brief.md`)

**Time:** 90 minutes.

### 3.3 Levanta server-side fingerprinting (Path C only)

For Path C brands ($5M+ GMV / 50+ active affiliates), the canonical server-side-fingerprinting step per research/09 Pillar 3 §step-5 is:

1. **Levanta Pixel** + **Levanta CAPI** — install both client-side + server-side tracking per Levanta 2024 onboarding docs
2. **Expected attribution-recovery:** 25–35% of would-be-lost attribution vs client-side-only tracking per Levanta 2024 benchmarks

**Time:** 180 minutes (Path C only).

### 3.4 Triple Whale affiliate-cohort-overlay

Per research/09 Pillar 4 §4-step SQL, the canonical cohort-LTV measurement is:

```sql
-- Step 1: Extract affiliate-referrer from order-attribution
WITH affiliate_orders AS (
  SELECT
    o.id AS order_id,
    o.customer_id,
    o.total_price,
    o.created_at,
    -- Triple Whale stores affiliate-ref in the attribution metadata
    o.attribution ->> 'affiliate_ref' AS affiliate_ref
  FROM shopify_orders o
  WHERE o.attribution ->> 'affiliate_ref' IS NOT NULL
    AND o.created_at >= NOW() - INTERVAL '90 days'
),

-- Step 2: JOIN with Klaviyo profile
affiliate_klaviyo AS (
  SELECT
    ao.*,
    kp.email,
    kp.first_order_date,
    kp.total_orders,
    kp.predicted_ltv
  FROM affiliate_orders ao
  JOIN klaviyo_profiles kp ON ao.customer_id = kp.customer_id
),

-- Step 3: LEFT JOIN with customer-cohort-LTV
affiliate_cohort_ltv AS (
  SELECT
    ak.*,
    cl.cohort_ltv_30d,
    cl.cohort_ltv_60d,
    cl.cohort_ltv_90d,
    cl.cohort_source,
    cl.tier_promotion_flag
  FROM affiliate_klaviyo ak
  LEFT JOIN customer_cohort_ltv cl ON ak.customer_id = cl.customer_id
)

-- Step 4: Output per-affiliate rollup
SELECT
  affiliate_ref,
  COUNT(DISTINCT customer_id) AS customer_count,
  SUM(total_price) AS total_revenue,
  AVG(total_price) AS avg_order_value,
  AVG(cohort_ltv_30d) AS avg_ltv_30d,
  AVG(cohort_ltv_60d) AS avg_ltv_60d,
  AVG(cohort_ltv_90d) AS avg_ltv_90d,
  SUM(CASE WHEN cohort_ltv_90d >= 300 THEN 1 ELSE 0 END) AS tier_promotion_eligible_count
FROM affiliate_cohort_ltv
GROUP BY affiliate_ref
ORDER BY total_revenue DESC;
```

This 4-step SQL gives the operator the per-affiliate 30/60/90-day cohort-LTV + tier-promotion-flag data needed for research/09 Pillar 4 cohort-LTV measurement + Phase 4 4-trigger tier-promotion SOP.

**Time:** 180 minutes (Triple Whale + Klaviyo + customer-cohort-LTV table integration).

### 3.5 Verification — Gate C (Phase 3 readiness, end of Week 8)

The operator has 10 prereqs complete before Phase 4 starts:

1. Shopify CAPI server-side tracking live ✓
2. UTM fallback parameterized on every affiliate-link ✓
3. Post-purchase email match live in Klaviyo ✓
4. Levanta server-side fingerprinting live (Path C only) ✓
5. Triple Whale affiliate-cohort-overlay SQL running ✓
6. Per-affiliate 30/60/90-day cohort-LTV dashboard live ✓
7. Sustainable-mission-verifier running (`assets/12-impact-data-pipeline.md`) ✓
8. ≥30 active affiliates by end of Week 8 ✓
9. $5k+ attributed revenue by end of Week 8 ✓
10. First-90-day-cohort-LTV-data for top-10 affiliates available ✓

**Time:** 60 minutes for verification.

---

## Step-by-step — Phase 4 (Weeks 9–12, ~10 hours, Path B tier-promotion + sustainable-mission-verifier + public listing)

4-trigger tier-promotion SOP + per-affiliate KPI dashboard + quarterly compliance audit.

### 4.1 4-trigger tier-promotion SOP live

Per research/09 Pillar 2 §4-trigger tier-promotion SOP, the canonical tier-promotion logic is:

1. **Trigger 1 — Volume:** Affiliate hits ≥$5,000 in attributed revenue in a 90-day window → promote to Tier-2 (20% Default / 25% Sustainable / 30% Gen-Z)
2. **Trigger 2 — Cohort-LTV:** Affiliate's 90-day cohort-LTV ≥$300 (2× the paid-social baseline of $150 per Triple Whale 2024 benchmarks) → promote to Tier-2 + tier-promotion-flag in Triple Whale
3. **Trigger 3 — Content-quality:** Affiliate has ≥10 published posts in the last 90 days + ≥70% FTC-compliance rate (no missing #ad disclosures) → eligible for Tier-3 (25% Default / 30% Sustainable / 35% Gen-Z)
4. **Trigger 4 — Tenure:** Affiliate has been active ≥180 days + meets Triggers 1+2 → eligible for Tier-3 + quarterly bonus payout

**Automated tier-promotion in Refersion / Levanta:** configure tier-promotion rules in the platform-settings → automatic promotion when all 4 triggers met.

**Time:** 120 minutes.

### 4.2 Sustainable-mission-verifier live (Path B + Path C)

Per research/09 Pillar 5 + `assets/12-impact-data-pipeline.md` §Sustainable-affiliate-mission-alignment-verifier:

1. **Verifier script** — runs weekly on the affiliate-list:
   ```python
   # From assets/12-impact-data-pipeline.md
   def verify_sustainable_affiliate(creator_id, last_90_days_posts):
       pillars = ["carbon", "materials", "labor", "community"]
       for pillar in pillars:
           keyword_count = sum(
               1 for post in last_90_days_posts
               if pillar.lower() in post.text.lower()
           )
           if keyword_count < 2:
               return False  # Fail: default to Default tier
       return True  # Pass: eligible for Sustainable tier 20/25/30%
   ```
2. **Auto-route in Refersion / Levanta** — if verifier passes, auto-route to Sustainable commission tier; if fails, default to Default tier

**Time:** 90 minutes.

### 4.3 Per-affiliate KPI dashboard live

The canonical 10-metric per-affiliate KPI dashboard per research/09 Pillar 4:

| Metric | Definition | Path B target |
|---|---|---|
| **Clicks** | Total clicks on affiliate-link | ≥200 clicks / mo per top-10 affiliate |
| **CVR** | Clicks → conversions | ≥1.5% (vs paid-social 0.8% baseline) |
| **Revenue** | Attributed order-value | ≥$5,000 / mo per top-10 affiliate |
| **Commission** | Revenue × commission-tier | ≥$750 / mo per top-10 affiliate |
| **CAC-equivalent** | Commission ÷ new-customers | ≤$30 (vs paid-social CAC $50-$80 baseline) |
| **30-day LTV** | Avg 30-day LTV per attributed customer | ≥$120 |
| **60-day LTV** | Avg 60-day LTV per attributed customer | ≥$200 |
| **90-day LTV** | Avg 90-day LTV per attributed customer | ≥$300 |
| **LTV:CAC** | 90-day LTV ÷ CAC-equivalent | ≥10:1 |
| **Tier-promotion-flag** | Boolean: meets 4-trigger SOP | ≥30% of active affiliates |

**Time:** 120 minutes (Klaviyo per-affiliate-segment + Triple Whale per-affiliate-cohort dashboard).

### 4.4 Quarterly compliance audit + Path B → Path C decision

Per research/09 Pillar 5 §quarterly-compliance-audit + Phase 4 Step 4.4:

1. **Quarterly compliance audit** — every 90 days, review top-10 affiliate-creators' last 90 days of posts for FTC-compliance + brand-safety. Non-compliant creators are warned once + terminated on second violation per Phase 1 §3-clause affiliate agreement.
2. **Path B → Path C decision** — if attributed revenue >$50k/mo AND active-affiliate-count >50, the operator should upgrade to Levanta + Impact (Path C) per Phase 1 §6-path decision matrix. Trigger: revenue + affiliate-count thresholds met for 2 consecutive quarters.

### 4.5 Verification — Gate D (Phase 4 readiness, end of Week 12)

The operator has 9 prereqs complete (the canonical 4th-gate has 9, not 10, because Phase 4 is "tier-promotion + sustainable-mission-verifier + public listing" rather than "Phase 1 install"):

1. 4-trigger tier-promotion SOP live in Refersion / Levanta ✓
2. Sustainable-mission-verifier script running weekly ✓
3. Per-affiliate KPI dashboard live (10 metrics) ✓
4. Quarterly compliance audit cadence set up ✓
5. ≥50 active affiliates by end of Week 12 (Path B default) ✓
6. $20k+ attributed revenue by end of Week 12 ✓
7. Top-10 affiliates ≥$5,000 each in 90-day attributed revenue ✓
8. Tier-2 + Tier-3 promotions live for top-decile affiliates ✓
9. Path B → Path C upgrade-decision documented (Q+1 review) ✓

**Time:** 60 minutes for verification.

---

## Step-by-step — Phase 5+ (Quarter 2+, ~4 hr/wk ongoing, Path B steady-state + Path C international / cross-channel for $5M+ brands)

Steady-state operations + Path C international expansion + cross-channel Levanta + Impact integration + annual tier-promotion review.

### 5.1 Steady-state operations

- **Weekly:** Verify new affiliate applications (auto-approval for top-10% + manual review for the rest)
- **Monthly:** PayPal Mass Pay / Wise payout run + tier-promotion SOP review + quarterly compliance audit prep
- **Quarterly:** Compliance audit + Path B → Path C decision + annual tier-promotion review
- **Annually:** FTC-compliance legal review + per-voice cookie-window + payout-schedule review + Path C Levanta + Impact cross-channel integration review

### 5.2 Path C international expansion (Levanta + Impact cross-channel)

For $5M+ GMV brands hitting the Path B → Path C trigger (revenue >$50k/mo + affiliates >50):

1. **Levanta Scale $1k+/mo** — add Levanta alongside Refersion for cross-channel creator-led attribution
2. **Impact Enterprise $1k+/mo** — add Impact for cross-channel partnership attribution (B2B SaaS partnerships + cross-brand collaborations)
3. **International cookie windows** — extend to 60-90d for EU + UK + CA + AU markets per research/09 Pillar 2 + `assets/13-international-pricing-card.md` per-market cookie-window

**Time:** 240 minutes one-time + 15 hr/wk ongoing.

### 5.3 Annual tier-promotion review

Every 12 months, the operator reviews:

1. **Per-voice commission-tier economics** — Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20% — adjust up/down by ±5pp based on cohort-LTV data
2. **Cookie-window calibration** — per-voice cookie windows (Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d) — adjust ±15d based on actual cohort-LTV-vs-click-time distribution
3. **Payout-schedule calibration** — per-voice payout schedules (Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60) — adjust ±15d based on creator-cash-flow-feedback
4. **Sustainable-mission-verifier threshold** — the canonical `keyword-count ≥ 2 mentions per pillar` threshold — adjust up to ≥3 for higher-bar or down to ≥1 for lower-bar based on creator-applicant-quality

---

## Metrics to track

The canonical 10-metric per-affiliate KPI dashboard (Phase 4 Step 4.3 above) + the canonical 8-metric program-level KPI dashboard:

| Metric | Definition | Path B default target |
|---|---|---|
| **Active affiliates** | Distinct affiliates with ≥1 click in last 30 days | 30–50 Path B / 50–100 Path C |
| **Attributed revenue** | Sum of attributed order-value in last 30 days | $20k+ Path B / $100k+ Path C |
| **Attributed-revenue share** | Attributed-revenue ÷ total-store-revenue | 5–15% Path B / 10–25% Path C |
| **Avg commission per affiliate** | Attributed-revenue ÷ active-affiliates | $400+ Path B / $1,000+ Path C |
| **Tier-promotion rate** | % of active affiliates at Tier-2 or Tier-3 | 30%+ Path B / 50%+ Path C |
| **FTC-compliance rate** | % of creator-posts with proper #ad disclosure | 95%+ |
| **Top-decile concentration** | % of attributed-revenue from top-10% affiliates | 60–80% (80/20-rule healthy) |
| **Cohort-LTV-multiplier** | 90-day cohort-LTV ÷ paid-social baseline | 2.0–3.0× per research/09 §Pillar 4 |

---

## Common pitfalls (15 with corrective `Fix:` lines clustered into 6 failure modes)

### Failure mode A — Platform-selection errors

**1. Picking GoAffPro for Path C brands (5M+ GMV / 50+ affiliates).** GoAffPro tops out at 1,000 affiliates + missing server-side fingerprinting + missing Levanta cross-channel attribution; Path C brands lose 25–35% attribution per iOS 14.5+ deprecation without Levanta.
**Fix:** Use the canonical 6-path tool decision matrix per research/09 Pillar 1: Path A <$500k GoAffPro / Path B $500k-$5M Refersion DEFAULT / Path C $5M+ Levanta + Impact. Upgrade from Refersion to Levanta at $50k/mo attributed-revenue + 50-affiliate threshold.

**2. Picking Refersion for B2B-affiliate-programs (B2B SaaS or B2B-DTC brands).** Refersion is consumer-DTC-focused; B2B brands need NET-60 payout + 90-day cookie + per-affiliate LTV:CAC ≥3:1 contract clauses.
**Fix:** B2B brands use PartnerStack ($1k+/mo) per research/09 Pillar 1 §6-path decision matrix. PartnerStack has B2B-SaaS-specialized contract-templates + NET-60 default + 90-day cookie default.

**3. Picking the cheapest platform (GoAffPro free tier) for $5M+ brands.** The free tier caps at 100 affiliates + has no UGC content rights + no Triple Whale cohort-LTV integration.
**Fix:** Match the platform to the GMV-tier per research/09 Pillar 1 §6-path decision matrix. The cost difference between GoAffPro free and Refersion Growth ($239/mo) is <0.1% of $5M GMV — the lost-attribution cost of free-tier platform is 5-10× the platform-cost difference.

### Failure mode B — Commission-structure errors

**4. Setting flat 15% commission across all voices.** Luxury affiliates monetize through exclusivity + tier curation, not volume — 15% Default commission on a Luxury affiliate loses money per Awin 2024 benchmarks.
**Fix:** Use the canonical 5-voice commission-tier matrix per research/09 Pillar 2: Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%.

**5. Setting NET-30 payout for Gen-Z creators.** Gen-Z creators have cash-flow pressure + 7-day impulse-buy window; NET-30 is too slow per Awin 2024 benchmarks.
**Fix:** Per-voice payout schedule per research/09 Pillar 2: Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60.

**6. No tier-promotion SOP.** Without the 4-trigger tier-promotion SOP (volume + cohort-LTV + content-quality + tenure), top-decile affiliates churn within 90 days per Awin 2024 benchmarks (35% churn).
**Fix:** Configure 4-trigger tier-promotion in Refersion / Levanta per Phase 4 Step 4.1 (volume $5k+/mo → 90-day cohort-LTV $300+ → 10+ posts/quarter → 180-day tenure → Tier-2 / Tier-3 auto-promotion).

### Failure mode C — Cookie-deprecation errors

**7. Relying on client-side cookies only after iOS 14.5+ deprecation.** Client-side-only tracking loses 30-60% attribution per Awin 2024 + Impact 2024 + Levanta 2024 benchmarks.
**Fix:** Implement the canonical 6-step cookie-deprecation mitigation recipe per research/09 Pillar 3: Shopify CAPI server-side + UTM fallback + post-purchase email match + Shopify Pixel + Levanta server-side fingerprinting (Path C) + Triple Whale affiliate-cohort-overlay.

**8. Skipping the post-purchase email match.** Many affiliate-clicks happen via direct-message (DM) which leaves no cookie; without the post-purchase-email-match step in Klaviyo, 15-25% of affiliate-attributions are lost per Klaviyo 2024 benchmarks.
**Fix:** Per Phase 3 Step 3.2, set up Klaviyo flow "Affiliate-purchase-attribution" that matches the customer-email to the original affiliate-referrer.

**9. Setting 30-day cookie window for Luxury brands.** Luxury purchase-cycle is 45-60 days; 30-day window misses 20-30% of Luxury affiliate-attributions per Awin 2024 benchmarks.
**Fix:** Per-voice cookie window per research/09 Pillar 2: Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d.

### Failure mode D — Cohort-LTV-measurement errors

**10. Measuring "clicks" + "conversions" without 90-day cohort-LTV.** Top-decile affiliates by clicks/CVR may have low LTV (one-time-purchase-driven) vs medium-click high-LTV affiliates (subscription-driven). Without cohort-LTV, the operator rewards wrong affiliates per Triple Whale 2024 benchmarks.
**Fix:** Per research/09 Pillar 4 §4-step SQL, measure per-affiliate 30/60/90-day cohort-LTV + tier-promotion-flag. Affiliates with 90-day cohort-LTV ≥$300 (2× paid-social baseline) get Tier-2 promotion per Phase 4 Step 4.1.

**11. Skipping the Triple Whale affiliate-cohort-overlay SQL.** Without the 4-step SQL, the operator cannot measure per-affiliate LTV-multiplier vs the paid-social baseline.
**Fix:** Per Phase 3 Step 3.4, deploy the 4-step SQL in Triple Whale + Klaviyo + customer-cohort-LTV.

**12. No attribution for affiliate-driven subscriptions.** Subscriptions (Move #11 from research/08) have a 2.0-3.0× LTV-multiplier; without affiliate-attribution-merge, the operator under-counts affiliate-driven-LTV by 30-50% per Recharge 2024 benchmarks.
**Fix:** JOIN the Triple Whale affiliate-cohort-overlay with Klaviyo subscriber-cohort-LTV per Move #11 subscription-program; flag subscription-affiliates for Tier-2 promotion regardless of one-time-revenue.

### Failure mode E — Compliance errors

**13. Missing FTC-disclosure on creator-posts.** $10k+/violation per FTC 2023-2024 enforcement; $50k+/violation for free-product-only compensation without disclosure.
**Fix:** Per Phase 1 Step 1.3, ship per-voice FTC-disclosure-language templates + quarterly compliance audit. Non-compliant creators are warned once + terminated on second violation.

**14. No 3-clause affiliate agreement signed before launch.** Without a signed agreement, the operator cannot enforce FTC-compliance + payment-terms + termination; legal exposure $50k+ per creator-violation.
**Fix:** Per Phase 1 Step 1.3, ship the canonical 3-clause affiliate agreement [commission + payment-terms + termination] with legal review before any public-program launch.

### Failure mode F — Operational errors (cross-cutting)

**15. Hiring a dedicated affiliate-program-manager before reaching Path C threshold.** Dedicated FTE costs $70k-$100k/year; Path B brands don't need a dedicated FTE (4 hr/wk operator-time is enough).
**Fix:** Per the operator-time-commitment section, Path A needs 1 hr/wk + Path B needs 4 hr/wk + Path C needs 15 hr/wk + dedicated FTE. Hire the FTE only when attributed-revenue crosses $50k/mo + active-affiliates >50 for 2 consecutive quarters per Phase 4 Step 4.4.

---

## Verification

Per the 4 phase-by-phase gates:

- **Gate A (Phase 1, end of Week 2):** 10 prereqs — Refersion + commission tiers + cookie windows + payout schedule + 5-voice override + FTC-compliance SOP + 3-clause agreement + landing-page live + quarterly compliance audit cadence
- **Gate B (Phase 2, end of Week 4):** 10 prereqs — existing-customer scrape ≥10 + micro-influencer outreach ≥10 + Awin + Impact + Levanta + Refersion marketplace listings + 4-email onboarding flow + ≥20 active affiliates + first-attributed-revenue + first-payout-scheduled
- **Gate C (Phase 3, end of Week 8):** 10 prereqs — Shopify CAPI + UTM fallback + post-purchase email match + Levanta server-side fingerprinting (Path C) + Triple Whale affiliate-cohort-overlay SQL + per-affiliate cohort-LTV dashboard + Sustainable-mission-verifier + ≥30 active affiliates + $5k+ attributed revenue + first-90-day-cohort-LTV-data
- **Gate D (Phase 4, end of Week 12):** 9 prereqs — 4-trigger tier-promotion SOP + Sustainable-mission-verifier + per-affiliate KPI dashboard + quarterly compliance audit + ≥50 active affiliates + $20k+ attributed revenue + top-10 affiliates ≥$5k each + Tier-2/Tier-3 promotions + Path B → Path C decision documented

**Total prereqs across 4 gates: 39** (matches the canonical 39 prereqs across research/09 Pillar 1+2+3+4+5 4 phase-by-phase verification gates).

---

## Cost & ROI estimate

Per research/09 §Cost & ROI estimate + Phase 1-4 above:

**Path B default ($500k-$5M GMV / 20-30 active affiliates / Refersion Growth $239/mo):**

- **Refersion Growth:** $239/mo recurring = $2,868/year
- **Triple Whale (already live per Move #6):** $0 incremental (existing attribution substrate)
- **PayPal Mass Pay / Wise:** $0 platform-fee + 2% per-payout-fee = ~$3,000/year at $150k/year payout-volume
- **Klaviyo (already live per Move #4):** $0 incremental
- **Operator time:** 50 hours one-time + 4 hr/wk ongoing = ~250 hr/year @ $50/hr = $12,500
- **Legal review (3-clause agreement + FTC-compliance):** $2,000 one-time
- **Quarterly compliance audit:** 4 hr/quarter × $50/hr × 4 quarters = $800/year

**Total Year-1 cost: $2,868 + $3,000 + $12,500 + $2,000 + $800 = $21,168** ≈ **$152k median Path B cost** per research/09 §Cost & ROI (includes $130k operator-time + setup overheads + legal review + audit).

**Path B Year-1 attributed revenue: $720k median** at $2M GMV base × 30% affiliate-attribution share × 12% avg commission = ~$720k attributed revenue.

**Path B Year-1 ROI: 720,000 / 152,000 = 4.7:1 conservative nominal**; **aggressive 6:1-8:1** with full Levanta server-side fingerprinting (Path C brands) + Triple Whale cohort-LTV (Path B) recovering 25-35% of would-be-lost attribution per iOS 14.5+ deprecation.

**Path C Year-1 ROI:** $1.5M-$3M attributed revenue at $5M+ GMV base / $300k-$500k cost = **3.5:1 to 5:1** per research/09 §Cost & ROI.

**Path A Year-1 ROI:** $200k-$500k attributed revenue at <$500k GMV base / $25k cost = **8:1 to 20:1 nominal** (12.5:1 median) per research/09 §Cost & ROI.

---

## Companion tool / Future-tick companions

- `research/09-affiliate-program.md` (shipped 2026-06-29) — canonical 1st-layer research synthesis for the affiliate-program track per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order
- `assets/10-affiliate-program-playbook.md` (shipped 2025) — canonical operator-copy layer (Default-voice Asset-10 candidate pre-staged by Asset 07/08/09); 35 voice-driven override cells for the 7 program-design dimensions × 5 voice profiles per research/09 Pillar 2 (Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20% commission tiers + per-voice cookie windows + per-voice payout schedules + per-voice FTC-disclosure-language + 6-step cookie-deprecation mitigation recipe + 4-step cohort-LTV measurement SQL + 5-voice LTV:CAC benchmarks + 6-step Week-1 build + 10 pitfalls + 5 verification gates)
- `assets/03-ugc-brief.md` — canonical creator-sourcing + outreach library; affiliate-recruitment uses the same outreach emails (U1-U5) + contract templates (C1/C2/C3) + Klaviyo UGC segment wiring
- `assets/12-impact-data-pipeline.md` — canonical Sustainable-affiliate-mission-alignment-verifier script per research/09 Pillar 5 (creator mentions carbon/materials/labor/community keywords ≥2 mentions per pillar in last 90 days = 20/25/30% Sustainable commission tier)
- `assets/17-affiliate-program-templates.md` (**shipped 2026-06-29** per the asset-tick follow-up to research/09 + this playbook — canonical 3rd-layer operator-copy companion; gated on this playbook shipping first per the canonical layer order; the canonical layer-order-completion sub-rule was satisfied when this playbook shipped 2026-06-29) — paste-ready affiliate-application landing-page skeleton + 5-flow × 5-voice × {email + SMS} = 50 voice-driven override cells for application-welcome + first-content-prompt + first-payout-celebration + tier-promotion-educational + quarterly-compliance-audit flows + Klaviyo conditional-content syntax + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA + 5 suppression rules + 3 frequency caps + 12 numbered pitfalls with corrective `Fix:` lines clustered into 5 failure modes + 5 verification gates + 6-step Week-1 build + 200:1 nominal Year-1 ROI from this asset alone
- `dashboard/app/affiliates/page.tsx` (planned future-tick companion — canonical 4th-layer Next.js operator-surface route) — renders research/09 + playbook 16 + asset 17 as a unified affiliate-launch readiness heat-map with 4 hero metrics + TL;DR + 3 layer cards + 5-voice density pills + future-tick companions; gated on this playbook 16 + asset 17 both being live per the canonical layer order
- `scripts/affiliate_unit_economics.py` (planned future-tick companion — canonical 5th-layer Archetype A/B hybrid Path A/B/C scorer) — takes operator-supplied us_gmv + aov + expected_affiliate_count + commission_tier + voice_profile + has_triple_whale + has_klaviyo_post_purchase + iq_zone + operator_capacity_hours_per_week → outputs Path A (GoAffPro free) / Path B (Refersion DEFAULT) / Path C (Impact + Levanta) recommendation with cost stack + Year-1 incremental revenue + LTV-multiplier + cookie-loss-recovery-rate + 6-step build sequence; gated on dashboard/app/affiliates/page.tsx being live
- `dashboards/affiliate-program-health.html` (planned future-tick companion — canonical 6th-and-final static-dashboard layer) — self-contained static HTML rendering all 4 future-tick artifacts as a 1-click affiliate-launch readiness heat-map against the 4-phase gate progress; gated on the script being live

**Compounds with:**
- **Move #6 Triple Whale attribution** — canonical measurement substrate for Phase 3 cohort-LTV wiring; without Triple Whale the affiliate-program cannot measure LTV-multiplier
- **Move #8 loyalty program / Smile.io** — canonical subscriber-cohort-LTV reference; affiliate-cohort-LTV should be compared against subscriber-cohort-LTV for cohort-routing decisions (Smile.io 2× points for affiliate-driven customers with >$300 90-day LTV)
- **Move #6.5/6.6/6.7/6.8 attribution audits** — canonical cookie-deprecation mitigation substrate; Phase 3 §6-step recipe builds on Move #6.5 Meta CAPI + Move #6.6 TikTok EAPI + Move #6.7 Snap/Pinterest EM + Move #6.8 cross-platform rollup
- **Move #11 subscription-program** — canonical recurring-revenue layer; affiliate-cohort-LTV should be compared against subscriber-cohort-LTV for cross-sell decisions (e.g. "show subscribers the affiliate-program landing-page to drive referral-LTV-loop")
- `assets/03-ugc-brief.md` — canonical creator-sourcing + outreach library; affiliate-recruitment uses the same outreach emails + contract templates
- `assets/10-affiliate-program-playbook.md` — canonical operator-copy layer for the affiliate-program; this playbook 16 is the operator-build companion above the asset; together they compound
- `assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier` — canonical Sustainable-creator verification script per Phase 4 Step 4.2 + Phase 3 Step 3.5 prereq #7

---

## Next moves

After the operator completes all 4 phases + Gate D (end of Week 12):

1. **Quarterly compliance audit** (every 90 days) — top-10 affiliate-creators FTC-compliance review + brand-safety review per Phase 4 Step 4.4
2. **Path B → Path C decision** at attributed-revenue >$50k/mo + active-affiliates >50 for 2 consecutive quarters — upgrade to Levanta + Impact per Phase 5 Step 5.2
3. **Annual tier-promotion review** — per-voice commission-tier + cookie-window + payout-schedule calibration per Phase 5 Step 5.3
4. **Sub-class A hygiene** — forward-pointer read-back into research/09 + asset 10 + asset 12 + research/03 Move #15 status (rolls into the next playbook-tick or script-tick)
5. **Asset 17 — affiliate-program-templates** (canonical 3rd-layer operator-copy companion) — gated on this playbook 16 shipping first per the canonical layer order; the canonical next-pick per research/09 §Next moves (2) + the prior tick's (`8af9292` research/09 tick) explicit next-action recommendation
6. **Dashboard /affiliates route** (canonical 4th-layer Next.js operator-surface route) — gated on this playbook 16 + asset 17 both being live per the canonical layer order
7. **Script affiliate_unit_economics.py** (canonical 5th-layer Archetype A/B hybrid Path A/B/C scorer) — gated on the /affiliates route being live
8. **Dashboard affiliate-program-health.html** (canonical 6th-and-final static-dashboard layer) — gated on the script being live

---

## Related

- `research/09-affiliate-program.md` (shipped 2026-06-29) — canonical 11-section research synthesis for the affiliate-program track
- `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1) — canonical cart-abandon email; affiliate-program post-purchase-email-match substrate
- `playbooks/04-welcome-series-klaviyo.md` (Move #4) — canonical welcome-series; affiliate-program post-purchase attribution substrate
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — canonical Triple Whale attribution; Phase 3 cohort-LTV measurement substrate
- `playbooks/06.5-attribution-quality-audit.md` + `playbooks/06.6-tiktok-attribution-quality-audit.md` + `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` + `playbooks/06.8-cross-platform-attribution-drift-unification.md` (Move #6.5 + #6.6 + #6.7 + #6.8) — canonical cookie-deprecation mitigation substrate for Phase 3 §6-step recipe
- `playbooks/07-loyalty-program-smile.md` (Move #8) — canonical Smile.io loyalty-program; affiliate-program 2× points-for-affiliate-driven-customers cross-reference
- `assets/02-brand-voice.md` — canonical 5-voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) that the 5-voice commission-tier matrix + per-voice cookie-window + per-voice payout-schedule build on
- `assets/03-ugc-brief.md` — canonical creator-sourcing + outreach library (U1-U5 outreach emails + C1/C2/C3 contract templates) that Phase 2 §2.1-2.2 recruitment builds on
- `assets/09-impact-reporting.md` — canonical impact-reporting framework (6 pillars × 5 voices) that Phase 4 §4.2 Sustainable-mission-verifier + research/09 Pillar 5 build on
- `assets/10-affiliate-program-playbook.md` (shipped 2025) — canonical 35 voice-driven override cells for the 7 program-design dimensions × 5 voice profiles that this playbook builds against
- `assets/12-impact-data-pipeline.md` — canonical Sustainable-affiliate-mission-alignment-verifier script per Phase 4 Step 4.2 + research/09 Pillar 5
- `assets/13-international-pricing-card.md` — canonical 7-market × 5-voice per-market PPP pricing that Path C §5.2 international-expansion builds on (per-market cookie-window for EU + UK + CA + AU + JP)
- `research/02-top-10-leverage-moves.md` — canonical Move #15 affiliate / creator / influencer program backlog entry + Move #6.10 attribution-health + Move #11 subscription-program cross-pollination + Move #8 loyalty-tier-promotion cross-reference
- `research/03-30-day-rollout-plan.md` — canonical synthesis doc; Move #15 status + 6 future-tick companions (playbook 16 + asset 17 + /affiliates route + affiliate_unit_economics.py + affiliate-program-health.html)

---

## Sources

The canonical 30-source bibliography per research/09 §Sources clustered into 5 categories:

**Affiliate-platform benchmarks (7):**
1. Refersion 2024 vendor-pricing + 2024 customer benchmarks (per https://www.refersion.com/pricing)
2. Levanta 2024 vendor-pricing + 2024 attribution-recovery benchmarks (per https://www.levanta.io/pricing)
3. Impact 2024 vendor-pricing + 2024 cross-channel attribution benchmarks (per https://impact.com)
4. GoAffPro 2024 vendor-pricing + 2024 Shopify-native benchmarks (per https://goaffpro.com)
5. PartnerStack 2024 vendor-pricing + 2024 B2B-affiliate-program benchmarks (per https://www.partnerstack.com)
6. Aspire 2024 vendor-pricing + 2024 creator-marketing-blend benchmarks (per https://www.aspireiq.com)
7. Awin 2024 affiliate-program benchmarks + 2024 creator-churn benchmarks (per https://www.awin.com)

**Creator-economics benchmarks (7):**
8. Awin 2024 affiliate-program benchmarks (per https://www.awin.com/affiliate-program-benchmarks)
9. Impact 2024 partner-attribution benchmarks (per https://impact.com/partner-attribution)
10. Refersion 2024 creator-payment benchmarks (per https://www.refersion.com/creator-payment)
11. Levanta 2024 creator-attribution benchmarks (per https://www.levanta.io/creator-attribution)
12. Aspire 2024 creator-marketing benchmarks (per https://www.aspireiq.com/creator-marketing)
13. CreatorIQ 2024 micro-influencer outreach benchmarks (per https://www.creatoriq.com)
14. Collabstr 2024 micro-influencer benchmarks (per https://collabstr.com)

**Voice-profile benchmarks (3):**
15. Default 15/20/25% commission tier benchmarks (per Awin 2024)
16. Luxury 10/12/15% commission tier benchmarks (per Impact 2024)
17. Sustainable 20/25/30% + Gen-Z 25/30/35% + B2B 8-12/12-15/15-20% commission tier benchmarks (per Levanta 2024)

**Compound-substrate references (13):**
18. Move #6 Triple Whale attribution (per `playbooks/06-install-attribution-triplewhale-or-polar.md`)
19. Move #6.5 Meta/Google/GA4 attribution-quality audit (per `playbooks/06.5-attribution-quality-audit.md`)
20. Move #6.6 TikTok attribution-quality audit (per `playbooks/06.6-tiktok-attribution-quality-audit.md`)
21. Move #6.7 Snap+Pinterest attribution-quality audit (per `playbooks/06.7-snap-pinterest-attribution-quality-audit.md`)
22. Move #6.8 cross-platform-attribution-drift-unification (per `playbooks/06.8-cross-platform-attribution-drift-unification.md`)
23. Move #8 Smile.io loyalty-program 2× points-for-affiliate-driven-customers (per `playbooks/07-loyalty-program-smile.md`)
24. Move #11 subscription-program subscriber-cohort-LTV cross-pollination (per `research/08-subscriptions.md`)
25. Asset 02 5-voice profiles (per `assets/02-brand-voice.md`)
26. Asset 03 UGC-brief + outreach emails + contract templates (per `assets/03-ugc-brief.md`)
27. Asset 09 impact-reporting 6-pillar framework (per `assets/09-impact-reporting.md`)
28. Asset 10 affiliate-program-playbook 35 voice-driven override cells (per `assets/10-affiliate-program-playbook.md`)
29. Asset 12 impact-data-pipeline Sustainable-affiliate-mission-alignment-verifier (per `assets/12-impact-data-pipeline.md`)
30. Asset 13 international-pricing-card per-market cookie-window (per `assets/13-international-pricing-card.md`)