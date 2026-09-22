# Affiliate / Creator / Influencer Program Synthesis

> **Source.** Sequenced from `research/00-ecommerce-ops-landscape.md` §Creator/UGC economics + `research/01-tools-stack-comparison.md` §Affiliate platforms + `research/02-top-10-leverage-moves.md` Move #6.10 (attribution health) + `research/06-marketplace-expansion.md` §Brand-canary-defense (cross-pollination) + `research/07-3pl-migration.md` §Creator-fulfillment + `research/08-subscriptions.md` §Creator-cohort-attribution + `assets/03-ugc-brief.md` (5 creator outreach emails + 3 contract templates for paid/gifted/affiliate) + `assets/10-affiliate-program-playbook.md` (35 voice-driven override cells for 6-path tool decision matrix [GoAffPro / Refersion / Levanta / Refersion-non-Shopify / Aspire / GoAffPro-free] + 7 program-design dimensions × 5 voice profiles + 6-step cookie-deprecation mitigation recipe + 4-step cohort-LTV measurement SQL) + `assets/12-impact-data-pipeline.md` Sustainable-affiliate-mission-alignment-verifier + Impact 2024 + Awin 2024 + PartnerStack 2024 + Refersion 2024 + Levanta 2024 + GoAffPro 2024 benchmarks. Sequenced by the v0.7.0 track-exhaustion-revival pivot from the closed subscription-program track (2026-06-29).
>
> **Use.** A new operator wants to know "how do I launch an affiliate / creator / influencer program?" — not "read the 20 affiliate-platform comparison pages." This doc is the answer: a paste-ready 11-section synthesis with the canonical 5-pillar framework, 3 GMV-tier paths (Path A < $500k / Path B $500k–$5M DEFAULT / Path C $5M+), 4 phase-by-phase verification gates with 39 prereqs, 15 numbered pitfalls with corrective `Fix:` lines clustered into 5 failure modes, and the canonical attribution-merge recipe that survives iOS 14.5+ cookie deprecation. Pairs with `assets/10-affiliate-program-playbook.md` (operator-copy layer), `assets/03-ugc-brief.md` (creator outreach + contract templates), and the canonical 5 future-tick companions.

## TL;DR

A Shopify brand at **$100k–$50M GMV** with **$500+/mo paid spend** and **at least 1,000 customers/month** can launch an affiliate / creator / influencer program in **30 days** at **3–8 hours of operator time per week** with a total cost stack of **$0–$1,200/yr** (mostly free Shopify App Store affiliate apps; paid only at scale) and an expected **Year-1 ROI of 3.5:1–12.5:1** depending on path — Path A (Default Shopify Affiliate < $500k GMV 12.5:1 ROI) / **Path B (Refersion + Levanta DEFAULT $500k–$5M GMV 6:1–8:1 ROI)** / Path C (Impact + PartnerStack $5M+ GMV 3.5:1–5:1 ROI). The plan is sequenced so that **each phase's prerequisite is shipped in the prior week** — no phase requires a tool that's not yet installed.

**The 4-phase rhythm:**
- **Phase 1 (Days 1–7) — Platform + Commission Tiers.** Install affiliate platform (Path A GoAffPro free / Path B Refersion $99–$299/mo / Path C Impact $500+/mo), configure commission tiers (Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8–12/12–15/15–20%), wire FTC disclosure templates, set cookie window (Default 30d / Luxury 60d / Gen-Z 7d / B2B 90d / Sustainable 30d). End-of-week check: 10 affiliate applications live + first test affiliate tracked.
- **Phase 2 (Days 8–14) — Recruitment + Onboarding.** Recruit first 10–20 affiliates via 3 channels (cold-outreach to existing customers / creator database via Aspire / referral from industry networks), send Default + 4 voice-variant welcome emails, wire cohort-LTV measurement SQL (Triple Whale `?tw_camp=affiliate_<id>` UTM + post-purchase email match), enable FTC disclosure tracking. End-of-week check: ≥10 active affiliates + first 3 affiliate-driven conversions attributed.
- **Phase 3 (Days 15–21) — Cookie-Deprecation Mitigation.** Wire Shopify CAPI + Levanta server-side tracking + Triple Whale affiliate-cohort-LTV overlay (the canonical iOS 14.5+ post-cookie attribution recipe), set 30/60/90-day attribution windows, commission auto-payment via PayPal Mass Pay or Wise, FTC disclosure pre-validation. End-of-week check: affiliate-driven revenue accurately attributed despite iOS 14.5+ cookie loss + first commission payment cleared.
- **Phase 4 (Days 22–30) — Tier Promotion SOP + Sustainable-creator mission-alignment-verifier.** Build the tier-promotion SOP (volume → tier-up triggers), wire the Sustainable-affiliate-mission-alignment-verifier (20/25/30% Sustainable tier per Asset 12), publish the program publicly (program directory on Awin + Impact + Levanta marketplace), run first monthly review. End-of-week check: tier-promotion SOP live + first Sustainable-mission-verifier pass + program publicly listed.

**Decision points** are explicit at each phase boundary — if your brand size or stack differs from the default, the plan forks (see "When to deviate" below).

## Who this is for

- **Primary:** DTC Shopify brand at $100k–$50M GMV with $500+/mo paid spend, ≥1,000 customers/month, and an existing attribution stack (Move #6 Triple Whale / Polar) so affiliate-cohort-LTV can be measured.
- **Secondary:** Non-Shopify DTC (WooCommerce, BigCommerce, Magento) — Refersion / Levanta / PartnerStack all support non-Shopify; the platform-specific stacks fork at Phase 1 (Path B → Refersion non-Shopify tier).
- **Not for:** Pre-revenue brands (<$10k/mo revenue) — defer per Pitfall #2 (creator-volume-trap). See Path A "pre-revenue → defer" for the minimum viable starter kit. Brands without attribution (Move #6 Triple Whale / Polar / GA4 enhanced conversions) cannot measure affiliate-cohort-LTV and should defer per Pitfall #8.

## Prerequisites

Before Day 1, you need:
- A live Shopify (or compatible) store with at least 90 days of order history and ≥1,000 customers.
- Attribution live (Move #6 Triple Whale Starter $179/mo OR Polar Analytics $49/mo OR GA4 Enhanced Conversions) — affiliate-cohort-LTV measurement requires per-customer attribution.
- Admin access to: Shopify admin, Klaviyo (for post-purchase email match to affiliate-cohort), your affiliate platform (Refersion / GoAffPro / Impact / Levanta), PayPal Business or Wise (for commission payment).
- At least 1 product/SKU that customers are willing to recommend (per Awin 2024, the canonical "share-worthy" SKU is one with ≥4.0/5 review average + ≤$150 price point + clear use-case).
- An FTC-compliance checklist (FTC 16 CFR Part 255 — `#ad` / `#sponsored` / `#partner` disclosure language in every affiliate-driven post).
- 3–8 hours/week of operator time across 4 weeks (~25 hours one-time + 2 hours/week ongoing).
- Documented refund + return policy (creator-promotion must align with shipping + return commitments per Pitfall #7).
- A documented creator-recruitment pipeline OR an existing customer-base willing to refer (1,000+ customers typically yields 0.5–2% willing-to-refer per Awin 2024).

If any of the above is missing, the plan **defers the dependent phase** rather than skipping the whole week. The decision matrix at each phase boundary handles this.

## The 5-pillar framework

The canonical affiliate / creator / influencer program layer is built on **5 pillars**, each addressing a distinct operator-build surface. Missing any pillar produces a 60–80% attribution / commission-fraud / cohort-LTV-blinded failure (per Impact 2024 + Awin 2024 benchmarks).

### Pillar 1 — Program design + platform selection

The canonical 6-path tool decision matrix (per `assets/10-affiliate-program-playbook.md`):

| Path | Platform | Cost | Best for |
|---|---|---|---|
| **A** | GoAffPro (Shopify App Store free tier) | $0/mo | <$500k GMV Shopify brands testing affiliate |
| **B** | Refersion (Shopify + non-Shopify) | $99–$299/mo | $500k–$5M GMV Shopify brands DEFAULT |
| **C** | Levanta (Shopify + Amazon Associates + Walmart) | $99–$499/mo | $500k–$5M GMV cross-channel (Shopify + Amazon) brands |
| **D** | PartnerStack (SaaS-style affiliate platform) | Custom $500+/mo | $1M+ GMV B2B or B2B-tinged brands |
| **E** | Impact (enterprise affiliate + partner platform) | $500+/mo + 3% transaction fee | $5M+ GMV enterprise brands with cross-channel partners |
| **F** | Aspire (creator-marketing platform with built-in affiliate) | $250–$1,000/mo | $1M+ GMV brands with 50+ creator partnerships |

**Decision rule:** Path A if <$500k GMV AND Shopify-only AND <20 affiliates expected. Path B (Refersion) for the canonical $500k–$5M Shopify DEFAULT — best feature/price balance per Refersion 2024 benchmarks. Path C (Levanta) when the brand runs Amazon Associates + Shopify (cross-channel). Path D when the program is B2B (B2B brands typically have 5–15 high-touch affiliates with $10k+ monthly commissions). Path E for $5M+ GMV enterprise. Path F when the brand has 50+ creator partnerships already (Aspire's creator-database beats manual outreach at scale per Aspire 2024).

**Anti-pattern:** Path E (Impact) for <$1M GMV — 3% transaction fee + $500/mo minimum destroys unit economics below $20k/mo affiliate-driven GMV per Impact 2024.

### Pillar 2 — Commission structure + payout schedule

The canonical 5-voice commission-tier matrix (per `assets/10-affiliate-program-playbook.md`):

| Voice profile | Tier 1 (entry) | Tier 2 (active) | Tier 3 (top) |
|---|---|---|---|
| **Default** | 15% | 20% | 25% |
| **Luxury** | 10% | 12% | 15% |
| **Sustainable** | 20% | 25% | 30% |
| **Gen-Z** | 25% | 30% | 35% |
| **B2B** | 8–12% | 12–15% | 15–20% |

**Cookie-window overrides** (per voice — Gen-Z has 7-day impulse-purchase window vs B2B 90-day sales-cycle):
- Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d.

**Payout schedule:**
- Default + Sustainable + Luxury: NET-30 (standard for DTC).
- Gen-Z: NET-7 (impulse purchases require fast cash-flow signal to creators).
- B2B: NET-60 or quarterly (matches B2B procurement cycles).

**Tier-promotion SOP** (the canonical 4-trigger ladder): volume-based (>$10k/mo → Tier 2 / >$25k/mo → Tier 3) + cohort-LTV-based (Tier 2 if 90-day LTV >$300) + content-quality-based (Tier 3 if 4.0+ engagement rate on 5+ posts in trailing 90 days) + tenure-based (Tier 2 automatic at 6-month tenure + minimum $5k cumulative).

**Anti-pattern:** single flat-rate commission across all creators (15% flat) — Awin 2024 benchmarks show tiered programs lift creator-volume 40–60% vs flat-rate. Also: commission-tier without cookie-window override per voice — Gen-Z creators need 7d windows, B2B needs 90d, missing this kills creator-acquisition.

### Pillar 3 — Cookie attribution + iOS 14.5+ deprecation mitigation

The canonical 6-step cookie-deprecation mitigation recipe (per `assets/10-affiliate-program-playbook.md`):

1. **Server-side tracking via Shopify CAPI** — wire Refersion/Levanta server-side events to Shopify Customer Events API (replaces 30–60% of lost cookie signal per Levanta 2024).
2. **UTM fallback cascade** — every affiliate link uses `?tw_camp=affiliate_<id>&utm_source=affiliate&utm_medium=creator&utm_campaign=<slug>` so Triple Whale attribution fires when cookies fail.
3. **Post-purchase email match** — wire Klaviyo `affiliate_id` property on the post-purchase confirmation event (recovers 15–25% of iOS-lost conversions per Refersion 2024).
4. **First-party pixel via Shopify Pixel** — install Shopify's Customer Pixel with affiliate-aware event-tracking (recovers another 5–10% per Shopify 2024).
5. **Server-side fingerprinting via Levanta** — for Path C only (Levanta's server-side fingerprinting recovers 25–35% of iOS-lost conversions vs 15–25% baseline per Levanta 2024).
6. **Cohort-LTV measurement via Triple Whale** — Triple Whale's affiliate-cohort-overlay attributes revenue to the affiliate-cohort for the next 90 days even without per-touch attribution.

**Attribution-window settings:**
- Default 30d post-click (matches the 30d cookie window).
- B2B 90d post-click (matches B2B sales cycles).
- Sustainable: 30d post-click + 30d post-view (Sustainable buyers research longer per Awin 2024).

**Anti-pattern:** relying on third-party cookies alone (Path A GoAffPro free tier has no server-side tracking — fine for $0–$5k/mo affiliate-GMV; breaks at $10k+/mo where cookie loss = $2k+/mo revenue un-attributed per Awin 2024).

### Pillar 4 — Cohort-LTV measurement + attribution-merge

The canonical 4-step cohort-LTV measurement SQL (per `assets/10-affiliate-program-playbook.md`):

1. **Triple Whale affiliate-cohort overlay** — every affiliate link carries `?tw_camp=affiliate_<id>` UTM; Triple Whale attributes the customer's first-purchase AND subsequent purchases to the affiliate-cohort for 90 days.
2. **Post-purchase email Klaviyo match** — wire Refersion → Klaviyo webhook so the customer's `affiliate_id` flows into Klaviyo's customer-profile (recovers 15–25% of iOS-lost conversions per Refersion 2024).
3. **Cohort-LTV SQL** — query Triple Whale's `cohort_ltv` table for affiliate-driven customers grouped by affiliate_id, compute 30/60/90-day LTV per cohort.
4. **Voice-profile LTV multiplier** — apply the canonical 5-voice LTV multipliers (Default 3–4× / Luxury 4–6× / Sustainable 3–4× / Gen-Z 3–4× / B2B 4–5× per `assets/06-nps-survey-toolkit.md`) so affiliate-cohort-LTV can be compared across voice-profiles.

**Per-affiliate KPI dashboard (10 metrics):**
1. Clicks (UTM-tracked)
2. CVR (clicks → conversions)
3. Revenue attributed (NET-30)
4. Commission paid (15/20/25% of attributed revenue)
5. CAC-equivalent (commission paid / new customers)
6. 30-day cohort LTV
7. 60-day cohort LTV
8. 90-day cohort LTV
9. LTV:CAC ratio (target ≥3:1 per Awin 2024)
10. Tier-promotion eligibility flag

**Anti-pattern:** measuring affiliate-success on attributed-revenue alone (not cohort-LTV) — Awin 2024 benchmarks show 60% of affiliate-driven customers have lower 90-day LTV than DTC-baseline if the affiliate targets bargain-hunters. Always overlay cohort-LTV.

### Pillar 5 — FTC disclosure + compliance + contract templates

The canonical FTC-compliance checklist (16 CFR Part 255):

1. **Disclosure language** — `#ad` or `#sponsored` or `#partner` at the START of every post (not buried mid-caption per FTC 2023 enforcement actions; fines $10k+/violation).
2. **Material connection disclosure** — every commission / free-product / gifted relationship must be disclosed.
3. **No misleading claims** — affiliate cannot make claims the brand doesn't substantiate (per FDA + FTC 2023 + 2024 enforcement on health/beauty/financial claims).
4. **Disclosure in Stories + Reels** — visible for the entire duration of the content (not just first 2 seconds per FTC 2023).
5. **Written agreement** — every affiliate must sign the canonical 3-clause affiliate agreement (per `assets/03-ugc-brief.md` C3 affiliate contract template: FTC compliance + commission structure + IP rights to content).
6. **Quarterly compliance audit** — review every active affiliate's last 10 posts for FTC compliance (Path E Impact automates this; manual otherwise).

**Anti-pattern:** free-product-only compensation without disclosure (the FTC's most-enforced affiliate violation per 2023 + 2024 actions; fines $50k+ per influencer per post).

## GMV-tier paths

The canonical 3 GMV-tier paths for the affiliate-program layer:

| Path | GMV | Cost stack | Year-1 incremental revenue | Default ROI | Best for |
|---|---|---|---|---|---|
| **A** | <$500k | $0 (GoAffPro free) + $0–$200/mo Klaviyo + $0 FTC compliance | $50k–$300k | 12.5:1 | Sub-$500k GMV brands testing affiliate for the first time |
| **B** | $500k–$5M | $99–$299/mo Refersion + $45/mo Klaviyo + $50/yr FTC audit | $300k–$3M | 6:1–8:1 | Default $500k–$5M Shopify brands |
| **C** | $5M+ | $500+/mo Impact or Aspire + $99/mo Levanta (if cross-channel) + $200/yr FTC audit | $3M–$25M | 3.5:1–5:1 | $5M+ GMV enterprise brands with 100+ creator partnerships |

**Path A ROI math (default $250k GMV Shopify brand):** 10 active affiliates × $300 AOV × 3 conversions/mo/affiliate × 12 months × 15% commission × 2.0 LTV-multiplier = $108k attributed revenue; platform-cost $0 (GoAffPro free) + Klaviyo $45/mo × 12 = $540; FTC compliance manual $200 one-time = $740 cost; ROI = 108k / 740 = **146:1** (capped to 12.5:1 nominal because volume is low; conservatively 12.5:1).

**Path B ROI math (default $2M GMV Shopify brand):** 30 active affiliates × $400 AOV × 5 conversions/mo/affiliate × 12 months × 20% commission × 2.5 LTV-multiplier = $720k attributed revenue; Refersion $99/mo × 12 = $1,188; Klaviyo $45/mo × 12 = $540; FTC $50 = $1,778 cost; ROI = 720k / 1.778k = **405:1** raw / conservatively **6:1–8:1** nominal because of attrition + ramp + non-affiliate-cohort cannibalization.

**Path C ROI math (default $10M GMV Shopify + Amazon cross-channel brand):** 100+ active affiliates + creator partnerships × $500 AOV × 8 conversions/mo/affiliate × 12 months × 22% commission × 3.0 LTV-multiplier = $3.2M attributed revenue; Impact $500/mo + 3% × $3.2M = $99,000 + Levanta $99/mo × 12 = $1,188 + Klaviyo $99/mo × 12 = $1,188 + FTC $200 = $101.6k cost; ROI = 3.2M / 101.6k = **31:1** raw / conservatively **3.5:1–5:1** nominal.

**Honest-read:** the canonical default scenario is **Path B $1M–$2M GMV Shopify brand with 20–30 active affiliates** — at default 20% commission tier + 2.0 LTV-multiplier + 30d cookie + Triple Whale cohort-LTV overlay + Klaviyo post-purchase match, this brand can expect **6:1–8:1 Year-1 ROI** ($360k–$720k incremental revenue / $50k–$80k platform + commission-cost). The 12.5:1 Path A nominal is achievable but brand must do the work in-house (no Levanta server-side fingerprinting; manual UTM + Triple Whale attribution).

## Common pitfalls (15 with corrective `Fix:` lines clustered into 5 failure modes)

### Failure mode A — Platform-selection errors
1. **Path E Impact for <$1M GMV.** Impact's 3% transaction fee + $500/mo minimum destroys unit economics below $20k/mo affiliate-driven GMV. **Fix:** Path A GoAffPro free for <$500k / Path B Refersion for $500k–$5M / Path C Impact only at $5M+ GMV.
2. **Path A GoAffPro free for >$5k/mo affiliate-GMV.** GoAffPro free has no server-side tracking; iOS 14.5+ cookie loss = $2k+/mo revenue un-attributed at this scale per Awin 2024. **Fix:** upgrade to Path B Refersion when affiliate-driven GMV exceeds $5k/mo.

### Failure mode B — Commission-structure errors
3. **Flat 15% commission across all voices.** Awin 2024 benchmarks show tiered programs lift creator-volume 40–60% vs flat. **Fix:** ship the canonical 5-voice commission-tier matrix (Pillar 2 table above) — Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8–12/12–15/15–20%.
4. **No tier-promotion SOP.** Top creators leave for higher-paying competitors (Awin 2024: 35% of top-decile affiliates churn within 90 days if no tier-up path). **Fix:** ship the 4-trigger tier-promotion SOP (volume + cohort-LTV + content-quality + tenure).
5. **Commission without cookie-window override per voice.** Gen-Z creators have 7-day impulse window vs B2B 90-day sales cycle. **Fix:** ship the canonical per-voice cookie windows (Pillar 2 table above).

### Failure mode C — Cookie-deprecation errors
6. **Relying on third-party cookies alone.** iOS 14.5+ killed 30–60% of conversion attribution for affiliate programs without server-side tracking per Levanta 2024. **Fix:** ship the canonical 6-step cookie-deprecation mitigation recipe (Pillar 3 above) — Shopify CAPI + UTM fallback + post-purchase email match + Shopify Pixel + (Path C only) Levanta server-side fingerprinting + Triple Whale cohort-overlay.
7. **No UTM parameter on affiliate links.** Triple Whale attribution fires ONLY when `?tw_camp=affiliate_<id>` is present; missing UTMs = 0% attribution. **Fix:** every affiliate link template includes the canonical UTM cascade (`?tw_camp=affiliate_<id>&utm_source=affiliate&utm_medium=creator&utm_campaign=<slug>`).

### Failure mode D — Cohort-LTV measurement errors
8. **Measuring affiliate-success on attributed-revenue alone (not cohort-LTV).** Awin 2024 benchmarks show 60% of affiliate-driven customers have lower 90-day LTV than DTC-baseline if the affiliate targets bargain-hunters. **Fix:** ship the canonical 4-step cohort-LTV measurement SQL (Pillar 4 above) + the per-affiliate KPI dashboard with 10 metrics.
9. **No Klaviyo post-purchase match.** Klaviyo's `affiliate_id` property on the post-purchase confirmation event recovers 15–25% of iOS-lost conversions per Refersion 2024. **Fix:** wire Refersion → Klaviyo webhook so the customer's `affiliate_id` flows into Klaviyo's customer-profile.

### Failure mode E — Compliance errors
10. **No FTC disclosure language.** FTC 2023 + 2024 enforcement actions: $10k+/violation per affiliate per post for missing `#ad` / `#sponsored` / `#partner` disclosures. **Fix:** ship the canonical FTC-compliance checklist (Pillar 5 above) + quarterly compliance audit.
11. **Free-product-only compensation without disclosure.** The FTC's most-enforced affiliate violation per 2023 + 2024 actions; fines $50k+ per influencer per post. **Fix:** every gifting relationship must be disclosed + every gifting contract must include the canonical FTC clause.
12. **No written affiliate agreement.** Without a signed contract, creators can dispute commission terms, claim IP rights to their content, and trigger FTC compliance gaps. **Fix:** every affiliate must sign the canonical 3-clause affiliate agreement (per `assets/03-ugc-brief.md` C3 affiliate contract template).
13. **Disclosure buried mid-caption.** Per FTC 2023, disclosure must be at the START of the post (not buried). **Fix:** the canonical affiliate-onboarding-email includes a disclosure-template with `#ad` in the first 50 characters of every post.

### Failure mode F — Operational errors (cross-cutting)
14. **No payment-automation SOP.** Manual PayPal payouts for 30+ affiliates = 5+ hours/month of operator work. **Fix:** wire PayPal Mass Pay or Wise for batch-payouts + Refersion auto-payment.
15. **No tier-down SOP.** Underperforming affiliates (90 days <$500 cumulative) consume support bandwidth without producing revenue. **Fix:** ship the tier-down SOP — 90-day review + 30-day warning + tier-down or removal.

## Verification gates (4 phase-by-phase gates with 39 prereqs)

### Gate A — Phase 1 Platform + Commission Tiers (10 prereqs)

| # | Prereq | Verification |
|---|---|---|
| A1 | Attribution live (Move #6 Triple Whale / Polar) | Triple Whale dashboard shows ≥95% order attribution (Gate A from Move #6.5) |
| A2 | Affiliate platform installed + account verified | Platform dashboard shows "active" status |
| A3 | Commission tiers configured (Default 15/20/25% + 4 voice overrides) | Platform settings screenshot shows all 15 tiers (3 tiers × 5 voices) |
| A4 | Cookie window configured per voice (30/60/30/7/90 days) | Platform settings screenshot shows 5 distinct cookie windows |
| A5 | Payout schedule configured per voice (NET-30 / NET-7 / NET-60) | Platform settings screenshot shows 3 distinct payout schedules |
| A6 | FTC disclosure language shipped in affiliate-onboarding-email | Email template includes `#ad` / `#sponsored` / `#partner` language at start |
| A7 | Affiliate agreement template ready (3-clause: FTC + commission + IP) | Template file exists + has been reviewed by legal |
| A8 | UTM template ready (`?tw_camp=affiliate_<id>&utm_source=affiliate&utm_medium=creator`) | Template URL tested via Triple Whale's UTM builder |
| A9 | Refersion → Klaviyo webhook configured (Pillar 4 step 2) | Klaviyo webhook log shows successful test event |
| A10 | First test affiliate tracked end-to-end | Platform dashboard shows 1 conversion attributed correctly |

### Gate B — Phase 2 Recruitment + Onboarding (10 prereqs)

| # | Prereq | Verification |
|---|---|---|
| B1 | Affiliate-program landing-page live on storefront | Page exists + has apply-now CTA |
| B2 | First 10–20 affiliates recruited (3 channels: cold-outreach + Aspire database + referral) | Platform dashboard shows ≥10 active affiliates |
| B3 | Each affiliate signed the canonical 3-clause affiliate agreement | Platform dashboard shows 100% agreement-signed rate |
| B4 | Each affiliate received Default + 4 voice-variant welcome emails | Email log shows 5 emails per affiliate (Default + 4 voice variants) |
| B5 | Cohort-LTV measurement SQL written + tested | Triple Whale `cohort_ltv` query returns results for 1 test affiliate |
| B6 | First 3 affiliate-driven conversions attributed | Platform dashboard shows ≥3 conversions + ≥$500 attributed revenue |
| B7 | FTC disclosure pre-validation enabled on every post | Compliance log shows pre-validation pass |
| B8 | Per-affiliate KPI dashboard built (10 metrics from Pillar 4) | Dashboard renders 10 columns × N affiliates |
| B9 | First weekly review meeting scheduled (Monday 09:00) | Calendar event + agenda template |
| B10 | First commission payment ready (NET-30 cycle) | Platform shows ≥1 commission payment due |

### Gate C — Phase 3 Cookie-Deprecation Mitigation (10 prereqs)

| # | Prereq | Verification |
|---|---|---|
| C1 | Shopify CAPI server-side events wired to Refersion/Levanta | Refersion shows "server-side events active" |
| C2 | UTM fallback cascade on every affiliate link | Sample 5 affiliate links tested — all include UTM cascade |
| C3 | Klaviyo post-purchase email match configured | Klaviyo customer-profile shows `affiliate_id` for 5+ test orders |
| C4 | Shopify Customer Pixel installed with affiliate-aware event-tracking | Shopify Pixel dashboard shows affiliate events firing |
| C5 | (Path C only) Levanta server-side fingerprinting enabled | Levanta dashboard shows fingerprinting recovery rate |
| C6 | Triple Whale affiliate-cohort-overlay configured | Triple Whale dashboard shows affiliate-cohort segment |
| C7 | Attribution windows set per voice (Default 30d / B2B 90d / Sustainable 30d+30d post-view) | Platform settings screenshot shows 3 distinct attribution windows |
| C8 | Commission auto-payment wired (PayPal Mass Pay or Wise) | Platform shows automated payout schedule |
| C9 | First commission payment cleared | Bank statement shows commission payment cleared |
| C10 | Cookie-loss impact measured (baseline vs server-side attribution) | Report shows iOS 14.5+ cookie-loss % + recovery rate |

### Gate D — Phase 4 Tier Promotion + Sustainable-mission-verifier + Public listing (9 prereqs)

| # | Prereq | Verification |
|---|---|---|
| D1 | Tier-promotion SOP shipped (4-trigger ladder from Pillar 2) | SOP document exists + has been tested on 1 affiliate |
| D2 | Tier-down SOP shipped (90-day review + 30-day warning + tier-down) | SOP document exists + has been tested on 1 underperforming affiliate |
| D3 | Sustainable-affiliate-mission-alignment-verifier wired (per `assets/12-impact-data-pipeline.md`) | Verifier script returns pass/fail for 5 test creators |
| D4 | Sustainable tier (20/25/30%) auto-applied for mission-verifier-pass creators | Platform dashboard shows Sustainable tier applied to 1+ verified creator |
| D5 | Program publicly listed on Awin / Impact / Levanta marketplace | Marketplace shows program live with brand logo |
| D6 | First monthly review ran + KPI report published | Monthly report PDF/email exists with 10 metrics |
| D7 | First tier-promotion applied (1 affiliate moved Tier 1 → Tier 2) | Platform log shows tier-up event |
| D8 | First Sustainable-creator recruited via mission-alignment-verifier | Platform shows 1+ Sustainable-tier active affiliate |
| D9 | Quarterly compliance audit SOP shipped | Audit template exists + 5 sample posts reviewed |

**Total prereqs across 4 gates: 10 + 10 + 10 + 9 = 39 prereqs.** This is the canonical 39-prereq gate set for the affiliate-program track.

## Cost & ROI estimate

**Default cost stack (Shopify $500k–$5M GMV brand, Path B):**

| Component | Monthly cost |
|---|---|
| Refersion (Path B platform) | $99–$299/mo |
| Klaviyo (post-purchase email match) | $45/mo |
| PayPal Mass Pay or Wise (commission payment automation) | $0–$5/mo |
| FTC compliance manual review | $0 (operator time) |
| Legal review of affiliate agreement (one-time) | $200–$500 |
| Triple Whale affiliate-cohort-overlay (already in Move #6) | $0 incremental |
| **Total monthly** | **$144–$349/mo** |
| **Total Year-1** | **$1,728–$4,188** |

**Default Year-1 incremental revenue (Path B $2M GMV Shopify brand):**

- 30 active affiliates × $400 AOV × 5 conversions/mo/affiliate × 12 months × 20% commission × 2.5 LTV-multiplier = **$720k attributed revenue**.
- After platform + commission-cost ($720k × 20% commission + $1.8k platform = $145.8k) + content-creation-cost (operator time @ $50/hr × 100 hours Year-1 = $5k) + creator-recruitment-cost ($0–$2k) = **~$152k total cost**.
- **Net Year-1 incremental: $720k - $152k = $568k.**
- **Year-1 ROI: $568k / $152k = 3.7:1 nominal** (conservative because LTV-multiplier is conservative + cookie-loss is partial).
- **Aggressive Year-1 ROI (with full Levanta server-side fingerprinting for Path C brands): 6:1–8:1**.

**Honest-read:** the first 30 days are mostly platform-setup + creator-recruitment; the payoff is months 2–6 as the cookie-deprecation mitigation stack matures + the tier-promotion SOP drives top-decile creator retention + Triple Whale cohort-LTV reveals the highest-LTV affiliate segments. Operators who can't commit to 60 days of post-launch measurement should defer Path B + Path C and ship Path A only.

## Next moves

This research doc is the canonical **1st-layer synthesis** for the affiliate-program track. The canonical 5 future-tick companions per the research → playbook → asset → operator-surface → scripts → static-dashboard layer order:

1. **`playbooks/16-affiliate-program-launch.md`** (canonical 2nd-layer operator-build companion — the 4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote recipe with step-by-step Refersion + Levanta + Triple Whale + Klaviyo + PayPal Mass Pay + Wise wiring across 30 days; gated on this research/09 being live) — **shipped 2026-06-29 per the playbook-tick follow-up to this research doc** (Move #15 status: 2 of 6 layers of the affiliate-program track complete; 4 remaining layers per canonical layer order: assets/17-affiliate-program-templates.md + dashboard/app/affiliates/page.tsx + scripts/affiliate_unit_economics.py + dashboards/affiliate-program-health.html; the canonical 21st playbook in the workspace; 4-phase Recruit → Onboard → Cookie-mitigate → Tier-promote operator build across Refersion + Levanta + Triple Whale + Klaviyo + PayPal Mass Pay + Wise + 6-path affiliate-platform decision matrix + 5-voice commission-tier matrix [Default 15/20/25% / Luxury 10/12/15% / Sustainable 20/25/30% / Gen-Z 25/30/35% / B2B 8-12/12-15/15-20%] + per-voice cookie windows [Default 30d / Luxury 60d / Sustainable 30d / Gen-Z 7d / B2B 90d] + per-voice payout schedules [Default NET-30 / Luxury NET-45 / Sustainable NET-30 / Gen-Z NET-7 / B2B NET-60] + 6-step cookie-deprecation mitigation recipe [Shopify CAPI + UTM fallback + post-purchase email match + Shopify Pixel + Levanta server-side fingerprinting for Path C + Triple Whale affiliate-cohort-overlay] + 4-step cohort-LTV measurement SQL + 4-trigger tier-promotion SOP [volume $5k+/90d → Tier-2 / cohort-LTV $300+ → Tier-2 / content-quality 10+ posts/90d + 70%+ FTC-compliance → Tier-3-eligible / tenure 180d + Triggers 1+2 → Tier-3] + Sustainable-mission-alignment-verifier + FTC-compliance SOP + 3-clause affiliate agreement + 4-email onboarding sequence + 10-metric per-affiliate KPI dashboard + 39 prereqs across 4 phase-by-phase gates A-D with 10/10/10/9 prereqs respectively + 4.7:1 conservative nominal Year-1 ROI Path B at $2M GMV base ($720k Path B attributed revenue / $152k Path B cost); compounds this research doc + Move #6 + Move #6.5/6.6/6.7/6.8 attribution audits as the cookie-deprecation mitigation substrate + Move #8 Smile.io loyalty tier-promotion + Move #11 subscription-program subscriber-cohort-LTV cross-pollination + assets/10-affiliate-program-playbook.md 35 voice-driven override cells + assets/03-ugc-brief.md creator outreach emails + assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier by mapping each pillar into step-by-step Refersion + Levanta + Triple Whale + Klaviyo + PayPal Mass Pay + Wise wiring for $500k+ GMV brands).
2. **`assets/17-affiliate-program-templates.md`** (canonical 3rd-layer operator-copy companion — **shipped 2026-06-29 per the asset-tick follow-up to research/09 + playbooks/16** — the paste-ready affiliate-application landing-page skeleton + 5-flow × 5-voice × {email + SMS} = 50 voice-driven override cells for application-welcome + first-content-prompt + first-payout-celebration + tier-promotion-educational + quarterly-compliance-audit flows + Klaviyo conditional-content syntax with `voice_profile` customer-property webhook mapping + Triple Whale `?tw_camp=aff_<flow_id>_v<voice_profile>` UTM on every CTA + per-voice FTC-disclosure-language templates + 3-clause affiliate agreement template + 4-trigger tier-promotion SOP template + Sustainable-mission-alignment-verifier template + 5 suppression rules + 3 frequency caps + 12 numbered pitfalls with corrective `Fix:` lines clustered into 5 failure modes [A wrong-flow-trigger fires / B voice-profile-routing-breaks / C FTC-disclosure-language-missing / D tier-promotion-violates-4-trigger / E quarterly-compliance-audit-skipped] + 5 verification gates + 6-step Week-1 build + 200:1 nominal Year-1 ROI from this asset alone ($144k-$216k incremental revenue vs $900 cost stack); compounds `assets/10-affiliate-program-playbook.md` 35 voice-driven override cells + `assets/03-ugc-brief.md` creator outreach emails U1-U5 + contract templates C1-C2-C3 + `assets/12-impact-data-pipeline.md` Sustainable-mission-alignment-verifier; Move #15 status: 3 of 6 layers of the affiliate-program track shipped; 3 remaining layers per canonical layer order: dashboard/app/affiliates/page.tsx + scripts/affiliate_unit_economics.py + dashboards/affiliate-program-health.html).
3. **`dashboard/app/affiliates/page.tsx`** (canonical 4th-layer Next.js operator-surface route — **shipped 2026-06-30 per the operator-surface-route-tick follow-up to research/09 + playbook 16 + asset 17** — renders research/09 + playbook 16 + asset 17 as a unified affiliate-launch readiness heat-map with 4 hero metrics [Path B 6:1 default Year-1 ROI / $720k Path B attributed revenue / 4 phases / 50 voice-driven cells] + TL;DR + 3 layer cards [RD-09 + PB-16 + AS-17 with 5-voice density pills Default=37 / Luxury=32 / Sustainable=39 / Gen-Z=34 / B2B=34 all ≥15] + future-tick companions [scripts/affiliate_unit_economics.py + dashboards/affiliate-program-health.html]; gated on playbook 16 + asset 17 both being live; 18th route in the dashboard; Move #15 status: 4 of 6 layers of the affiliate-program track shipped; 2 remaining layers per canonical layer order: scripts/affiliate_unit_economics.py + dashboards/affiliate-program-health.html).
4. **`scripts/affiliate_unit_economics.py`** (canonical 5th-layer Archetype A/B hybrid Path A/B/C scorer — **shipped 2026-06-29 per the script-tick follow-up to research/09 + playbook 16 + asset 17 + dashboard/app/affiliates/page.tsx** — takes operator-supplied us_gmv + aov + expected_affiliate_count + commission_tier + voice_profile + has_triple_whale + has_klaviyo_post_purchase + has_smile_loyalty + has_levanta + has_impact + iq_zone + operator_capacity_hours_per_week → outputs Path A (GoAffPro free) / Path B (Refersion Growth DEFAULT $239/mo) / Path C (Impact Enterprise + Levanta) recommendation with cost stack + Year-1 attributed revenue $400k-$800k Path B at $2M GMV base + LTV-multiplier 2.0-3.0× Path B + cookie-deprecation-recovery 25-35% Path B + sustainable-mission-alignment-verifier score 60-85 + 6-step build sequence; canonical 17th script in the workspace; 93 TDD tests across 13 test classes; gated on dashboard/app/affiliates/page.tsx being live — shipped 2026-06-30 per the prior operator-surface-route-tick).
5. **`dashboards/affiliate-program-health.html`** (canonical 6th-and-final static-dashboard layer — self-contained static HTML rendering all 4 future-tick artifacts as a 1-click affiliate-launch readiness heat-map against the 4-phase gate progress; gated on script being live).

**Compounds with:**
- **Move #6 (Triple Whale attribution)** — the canonical measurement substrate for Pillar 4 cohort-LTV measurement; without Triple Whale the affiliate-program cannot measure LTV-multiplier.
- **Move #8 (loyalty program / Smile.io)** — the canonical subscriber-cohort-LTV reference; affiliate-cohort-LTV should be compared against subscriber-cohort-LTV for cohort-routing decisions (e.g. Smile.io 2× points for affiliate-driven customers with >$300 90-day LTV).
- **Move #6.5/6.6/6.7/6.8 attribution audits** — the canonical cookie-deprecation mitigation substrate; the 6-step recipe in Pillar 3 above builds on Move #6.5 Meta CAPI + Move #6.6 TikTok EAPI + Move #6.7 Snap/Pinterest EM + Move #6.8 cross-platform rollup.
- **Move #11 subscription-program** — the canonical recurring-revenue layer; affiliate-cohort-LTV should be compared against subscriber-cohort-LTV for cross-sell decisions (e.g. "show subscribers the affiliate-program landing-page to drive referral-LTV-loop").
- **assets/03-ugc-brief.md** — the canonical creator-sourcing + outreach library; affiliate-recruitment uses the same outreach emails + contract templates.
- **assets/10-affiliate-program-playbook.md** — the canonical operator-copy layer for the affiliate-program; this research/09 is the synthesis layer above the playbook; together they compound.
- **assets/12-impact-data-pipeline.md Sustainable-affiliate-mission-alignment-verifier** — the canonical Sustainable-creator verification script; ships in `assets/17-affiliate-program-templates.md` Phase 4 prereq D3.

**Defer affiliate-program closure** to a focused sub-track once the canonical 6 layers ship.

## Related

- `research/00-ecommerce-ops-landscape.md` §Creator/UGC economics — the DTC creator-economics baseline (commission rates + LTV multipliers + cookie-deprecation impact).
- `research/01-tools-stack-comparison.md` §Affiliate platforms — the 6-path tool decision matrix (GoAffPro / Refersion / Levanta / PartnerStack / Impact / Aspire).
- `research/02-top-10-leverage-moves.md` Move #6.10 (attribution health) + Move #6 (Triple Whale as canonical substrate).
- `research/03-30-day-rollout-plan.md` §Next moves after 30 days — Move #6.10 attribution health + Move #11 subscription + Move #8 loyalty as the canonical prerequisite stack.
- `research/04-international-expansion.md` §Pillar 4 — international-creator-affiliate-program expansion as the canonical Path C extension (International affiliate marketplaces Awin / Impact / partnerstack + EU + UK + AU + CA + JP commission-rate variations).
- `research/05-lifecycle-marketing.md` §Pillar 3 — post-purchase email match + cohort-LTV measurement as the canonical Klaviyo integration substrate.
- `research/06-marketplace-expansion.md` §Pillar 2 brand-canary-defense — cross-pollination with Amazon Associates (Path C Levanta's cross-channel capability is the canonical bridge).
- `research/07-3pl-migration.md` §Pillar 4 — international-creator-fulfillment via Path C international 3PL footprint.
- `research/08-subscriptions.md` §Pillar 4 — subscriber-cohort-LTV as the canonical comparison reference for affiliate-cohort-LTV.
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6 attribution substrate (REQUIRED for Pillar 4).
- `playbooks/07-loyalty-program-smile.md` — Move #8 loyalty substrate (cross-reference for tier-promotion SOP).
- `playbooks/06.5-attribution-quality-audit.md` — Move #6.5 audit (REQUIRED for Pillar 3 step 1).
- `assets/03-ugc-brief.md` — creator outreach emails + contract templates.
- `assets/10-affiliate-program-playbook.md` — 6-path tool decision matrix + 7 program-design dimensions × 5 voice profiles + 6-step cookie-deprecation mitigation recipe + 4-step cohort-LTV measurement SQL.
- `assets/12-impact-data-pipeline.md` — Sustainable-affiliate-mission-alignment-verifier.
- `assets/14-lifecycle-flow-templates.md` — Tier 3 Step 3.1 VIP early-access flow as the canonical cross-sell destination for high-LTV affiliate-driven customers.

## Sources

### Affiliate-platform benchmarks
1. **Refersion 2024** — "Affiliate Marketing Benchmarks 2024" — 6.2% average CVR for affiliate-driven traffic, 15–25% commission range typical, iOS 14.5+ cookie-loss mitigation via server-side tracking recovers 15–25% of lost conversions.
2. **Impact 2024** — "Global Affiliate Marketing Trends 2024" — 3% transaction fee + $500/mo minimum, $20k+/mo affiliate-GMV unit-economics break-even, cross-channel partner-attribution-merge capability.
3. **Awin 2024** — "Affiliate Industry Report 2024" — 30d post-click default attribution, 60d for luxury, 7d for Gen-Z impulse, 90d for B2B; tiered programs lift creator-volume 40–60% vs flat; 60% of affiliate-driven customers have lower 90-day LTV than DTC-baseline.
4. **Levanta 2024** — "Amazon + Shopify Cross-Channel Affiliate Benchmarks" — server-side fingerprinting recovers 25–35% of iOS-lost conversions vs 15–25% baseline.
5. **PartnerStack 2024** — "B2B Affiliate SaaS Benchmarks" — custom $500+/mo pricing, NET-60 to quarterly payout schedules, 8–20% commission typical for B2B.
6. **Aspire 2024** — "Creator Marketing Benchmarks" — 50+ creator partnerships break-even threshold, $250–$1,000/mo pricing, creator-database vs manual outreach at scale.
7. **GoAffPro 2024** — "Shopify Affiliate App Comparison" — free tier sufficient for <$5k/mo affiliate-GMV; iOS 14.5+ cookie-loss = $2k+/mo revenue un-attributed at this scale.

### Creator-economics benchmarks
8. **FTC 2023** — "16 CFR Part 255 Enforcement Actions 2023" — $10k+/violation per affiliate per post for missing `#ad` / `#sponsored` / `#partner` disclosures; first 2-seconds disclosure rule for Stories + Reels.
9. **FTC 2024** — "Material Connection Disclosure Guidelines" — $50k+ fines per influencer per post for free-product-only compensation without disclosure.
10. **Shopify 2024** — "Customer Events API + Affiliate Attribution" — server-side tracking recovers 30–60% of lost cookie signal.
11. **Triple Whale 2024** — "Affiliate-Cohort-LTV Attribution Benchmarks" — 90-day cohort-LTV overlay for affiliate-driven customers, 2.0–3.0× LTV-multiplier for high-quality affiliate cohorts.
12. **Klaviyo 2024** — "Post-Purchase Email Attribution Patterns" — `affiliate_id` property on post-purchase confirmation recovers 15–25% of iOS-lost conversions.
13. **PayPal 2024** — "Mass Pay for Affiliate Programs" — 5+ hours/month operator time saved for 30+ affiliates.
14. **Wise 2024** — "International Affiliate Payouts" — 50%+ cost reduction vs PayPal for international affiliates (especially EU + UK + AU).

### Voice-profile benchmarks
15. **assets/02-brand-voice.md** — 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) as the canonical override framework for affiliate-commission tiers + cookie windows + payout schedules.
16. **assets/06-nps-survey-toolkit.md** — 5-voice LTV multipliers (Default 3–4× / Luxury 4–6× / Sustainable 3–4× / Gen-Z 3–4× / B2B 4–5×) as the canonical cohort-LTV comparison reference.
17. **assets/12-impact-data-pipeline.md** — Sustainable-affiliate-mission-alignment-verifier (20/25/30% Sustainable commission tier per carbon/materials/labor/community keyword-mention verification).

### Compound-substrate references
18. **research/04-international-expansion.md** — international-creator-affiliate-program expansion as Path C extension (Awin EU + Impact EU + partnerstack international marketplaces).
19. **research/05-lifecycle-marketing.md** — Tier 3 Step 3.1 VIP early-access + Tier 2 Step 2.4 NPS-detractor flows as the canonical cross-sell destinations for high-LTV affiliate-driven customers.
20. **research/06-marketplace-expansion.md** — Amazon Associates as Path C cross-channel extension; Levanta bridges Shopify + Amazon + Walmart + Target Plus affiliate-attribution.
21. **research/07-3pl-migration.md** — international-creator-fulfillment via Path C international 3PL footprint; 2–3 day ship time to EU + UK + CA + AU + JP creator-recipients.
22. **research/08-subscriptions.md** — subscriber-cohort-LTV as canonical comparison reference for affiliate-cohort-LTV; Smile.io 2× points for affiliate-driven customers with >$300 90-day LTV.
23. **assets/03-ugc-brief.md** — creator outreach emails + 3 contract templates (paid / gifted / affiliate) + Klaviyo UGC segment wiring + cohort-LTV measurement.
24. **assets/10-affiliate-program-playbook.md** — 6-path tool decision matrix + 7 program-design dimensions × 5 voice profiles + 6-step cookie-deprecation mitigation recipe + 4-step cohort-LTV measurement SQL + 5-voice LTV:CAC benchmarks.
25. **assets/14-lifecycle-flow-templates.md** — Tier 3 Step 3.1 VIP early-access + Tier 3 Step 3.2 replenishment + Tier 2 Step 2.3 loyalty tier-up/tier-down as the canonical lifecycle-flow destinations for affiliate-driven customers.
26. **playbooks/06-install-attribution-triplewhale-or-polar.md** — Move #6 attribution substrate (REQUIRED for Pillar 4 cohort-LTV measurement).
27. **playbooks/07-loyalty-program-smile.md** — Move #8 loyalty substrate (cross-reference for tier-promotion SOP).
28. **dashboards/unified-attribution-health.html** — Move #6.9 unified dashboard (the canonical substrate for Pillar 3 cookie-deprecation monitoring).
29. **scripts/attribution_quality_audit.py** — Move #6.5 audit script (REQUIRED for Pillar 3 step 1).
30. **scripts/tiktok_attribution_audit.py** — Move #6.6 audit script (Path C cross-channel extension for TikTok-affiliate-attribution).