---
name: nps-voc-closed-loop-automation
title: NPS + Voice-of-Customer closed-loop automation (Delighted + Wootric + AskNicely + Klaviyo NPS + Triple Whale NPS-cohort-LTV + Gorgias detractor-trigger, Move #20.2)
category: cx
tier: 1
priority: P1
default_move: 20.2
year_1_roi_band: "5:1–18:1"
sms_friendly: false
last_updated: 2026-07-12
sources: [delighted 2024, wootric 2024, asknicely 2024, medallia 2024, qualtrics 2024, klaviyo 2024, postscript 2024, gorgias 2024, triple-whale 2024, polar 2024, smile 2024, yotpo 2024, shopify 2024, recharge 2024, loop-returns 2024, returngo 2024, aftership 2024, alchemy 2024, sendlane 2024,Iterable 2024, hubspot 2024, salesforce 2024, retainer-csat-benchmarks-2024, customer-gauge-nps-benchmarks-2024, nICE-satmetrix-nps-benchmarks-2024, bain-net-promoter-system-2024, customer.io-nps-benchmarks-2024, emarsys-cx-benchmarks-2024, optimove-cx-benchmarks-2024]
---

# NPS + Voice-of-Customer closed-loop automation (Move #20.2)

> Move #20.2 is the **post-purchase voice-of-customer collection layer every $1M+ GMV DTC brand needs after Move #1 (cart recovery) + Move #3 (checkout) + Move #5 (Klaviyo+Postscript) + Move #6 (Triple Whale attribution) + Move #8 (PDP A/B) + Move #11 (AI customer service)**: deploy a **Delighted + Wootric + AskNicely + Medallia + Klaviyo NPS-survey + Triple Whale NPS-cohort-LTV-merge + Gorgias detractor-trigger + Smile.io promoter-reward** engine so NPS lifts 12–25 points within 6 months (the canonical Delighted 2024 + AskNicely 2024 + Bain Net Promoter System 2024 benchmark), detractor-recovery-rate hits 25–45% (the canonical Customer Gauge 2024 + Medallia 2024 detractor-closed-loop benchmark), promoter-referral-rate lifts 2–4× (the canonical Smile 2024 + Yotpo 2024 promoter-reward benchmark), and the operator stops guessing on which product/fulfillment/support issues actually drive churn. **Delighted ($224/mo Path B default at $1M–$5M GMV)** is the canonical pick for post-purchase NPS + CES + CSAT 1-tap survey distribution; **AskNicely ($250/mo Path B+)** is the canonical pick for multi-channel NPS + employee-of-the-month + customer-experience-driver dashboards; **Wootric (now InMoment, $449/mo Path C)** is the canonical pick for enterprise-grade VoC with text-analytics + theme-clustering; **Medallia + Qualtrics (custom $2k+/mo Path D)** are the canonical picks for $25M+ enterprise brands with multi-channel VoC + text-analytics + multi-region. Year-1 ROI band **5:1–18:1** with a default **9:1** at $3M GMV Path B. Ship AFTER Move #1 (cart recovery) + Move #5 (Klaviyo+Postscript) + Move #6 (Triple Whale attribution) + Move #11 (AI customer service) are live AND the operator is doing ≥500 orders/mo at ≥$50 AOV. Companion artifact scope: this skill synthesizes the canonical 5-pillar framework (Pillar 1 NPS-survey distribution engine + response-rate optimization / Pillar 2 detractor-closed-loop automation / Pillar 3 promoter-reward + referral-engine / Pillar 4 VoC-text-analytics + theme-clustering / Pillar 5 NPS-cohort-LTV merge + Triple Whale attribution-overlay) for $1M+ GMV brands — the same layer order the operator applies to checkout, fulfillment, attribution, and lifecycle. Distinct from `retention/ai-customer-service-automation` (Move #20.1 — ticket-deflection focused on Gorgias Automate + AI-completion + brand-voice-conditioned answer-rendering) and from `returns/returns-portal-orchestration` (Move #12.4 — Loop/ReturnGO/AfterShip returns-portal + branded-return-page + return-reason-taxonomy). Move #20.2 is the post-purchase **listening system** that compounds with Move #20.1's resolution system: Move #20.1 turns tickets into resolutions, Move #20.2 turns customers into a measurable trust score that drives LTV.

## When to use this skill

Use this skill when the operator is doing **≥500 orders/month** at **≥$50 AOV** and the post-purchase-friction curve has started to compound: repeat-purchase-rate has been flat for 90+ days despite new traffic acquisition, the operator has no systematic NPS-measurement cadence (the canonical "we ran one NPS-survey manually last quarter" anti-pattern), detractor-churn is invisible until the customer submits a chargeback or files a 1-star review (the canonical "we lose customers and don't know why" gap), the brand carries >100 SKUs and customer-sentiment-by-SKU is unknown (the canonical "we don't know which hero product has the worst sentiment" gap), promoter-referral-rate is <2% of NPS-9-or-10 customers (the canonical "we're leaving free acquisition on the table" anti-pattern), the operator cannot answer "what are the top-3 customer-pain-points driving 1-star reviews?" within 24 hours, or Klaviyo-attrition-rate exceeds 70% annually (per Klaviyo 2024 + Customer Gauge 2024 cohort-survival benchmarks). Move #20.2 is the **canonical next step** in the CX track after Move #11 (AI customer service) + Move #5 (Klaviyo+Postscript) + Move #6 (Triple Whale attribution) — CX-listening is the layer the operator pulls once acquisition + checkout + support are tuned; without the prior moves shipping volume, the NPS-engine has insufficient surveys to be statistically significant.

You have:

- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access and the Orders API + Customers API enabled.
- **≥500 orders/month processed in the last 30 days** AND **≥$50 AOV** AND **≥$10k MRR or ≥$120k ARR** — below these thresholds, defer and use Klaviyo-native NPS-flow + manual Google-Sheets NPS-export until volume justifies the platform fee.
- **Move #1 (cart recovery) + Move #5 (Klaviyo+Postscript) + Move #6 (Triple Whale attribution) + Move #11 (AI customer service) shipped and producing real data** — the NPS-engine reads Klaviyo-customer-data to inject order-context into surveys, reads Triple Whale attribution to merge NPS-segment + LTV, and reads Gorgias-ticket-data to trigger detractor-recovery-flow. Without these upstream, the NPS-engine is collecting scores without context.
- **A documented NPS-cadence decision** — transactional-NPS (post-purchase 14-day survey, tNPS) + relationship-NPS (rolling 90-day customer-survey, rNPS) + employee-NPS (internal, eNPS, post-hire-30-60-90) + product-NPS (post-feature-launch 7-day survey). Without this, the operator is collecting scores without a use-case-driven cadence.

## What "best in class" looks like

A best-in-class NPS + VoC closed-loop engine has all 5 of these properties:

1. **5-pillar NPS-engine selection framework.** Path A (Klaviyo native NPS-flow + Google Sheets export) for <$1M GMV; Path B (Delighted $224/mo) DEFAULT for $1M–$5M GMV Shopify-DTC apparel/beauty/home; Path B+ (AskNicely $250/mo + Delighted) for $3M+ GMV brands needing employee-of-month + experience-driver dashboards; Path C (Wootric/InMoment $449/mo) for $5M+ GMV brands needing text-analytics + theme-clustering; Path D (Medallia + Qualtrics enterprise) for $25M+ GMV brands needing multi-region + multi-channel VoC + survey-fatigue-management. Engine selection drives everything downstream — wrong path picks cost 5–10× over a 12-month horizon.

2. **5-pillar framework applied in this order:**

   - **Pillar 1 — NPS-survey distribution engine + response-rate optimization (Week 1, 4 hr).** Transactional-NPS (post-purchase 14-day survey, tNPS) + relationship-NPS (rolling 90-day customer-survey, rNPS) + product-NPS (post-feature-launch 7-day survey). Delivered via Delighted 1-tap email-survey (1–5 stars + open-text follow-up) + AskNicely in-app-survey (mobile-web or Shopify-Post-Purchase-Page). Response-rate target = 25–45% (per Delighted 2024 + AskNicely 2024 benchmarks for $1M+ GMV brands with survey-cadence optimization). Survey-fatigue-management: max 1 tNPS per 90 days + 1 rNPS per 180 days + 1 product-NPS per feature-launch (no spam). Without this guardrail, response-rate drops to <10% within 60 days.

   - **Pillar 2 — Detractor-closed-loop automation (Week 1–2, 6 hr).** Detractor = NPS 0–6. Trigger: Delighted webhook → Klaviyo segment `nps-detractor-30d` → Gorgias ticket auto-created with priority `cs-detractor-urgent` → assigned to senior CS-agent. SLA: 4-hour-first-response, 24-hour-resolution. Detractor-recovery-rate target = 25–45% (per Customer Gauge 2024 + Medallia 2024 benchmarks — i.e. 25–45% of detractors convert back to passive-or-promoter within 90 days). The detractor-closed-loop is the SINGLE most load-bearing piece of CX-engineering — without it, the operator is collecting NPS-scores without converting them to retention-uplift.

   - **Pillar 3 — Promoter-reward + referral-engine (Week 2–3, 8 hr).** Promoter = NPS 9–10. Trigger: Delighted webhook → Smile.io loyalty-points-credited (200 points per NPS 9 + 500 points per NPS 10) → Yotpo referral-code-generated (20%-off-referred-friend + $10-credit-referrer) → Klaviyo segment `nps-promoter-30d` → post-purchase "thank-you" flow with referral-link in the signature. Promoter-referral-rate target = 2–4× baseline-referral-rate (per Smile 2024 + Yotpo 2024 + Bain Net Promoter System 2024 benchmarks — i.e. promoters refer at 2–4× non-promoter rate). Without the promoter-reward-engine, the operator is collecting NPS-9-or-10 without converting them to acquisition-uplift.

   - **Pillar 4 — VoC-text-analytics + theme-clustering (Week 3–4, 12 hr).** Aggregate all NPS open-text responses (the verbatim-comment the customer types after the 0–10 score) into a text-analytics-engine (Wootric/InMoment built-in or MonkeyLearn + GPT-4-fine-tuned-classifier). Cluster by theme (product-quality + shipping-speed + customer-service + price-value + packaging + returns-experience + subscription-cadence + loyalty-tier). Theme-frequency ranking drives the next-quarter-product-roadmap (top-1 theme = top-1 engineering-investment). Theme-by-cohort overlay: per-SKU sentiment + per-fulfillment-provider sentiment + per-CSAT-tier sentiment. Without the VoC-text-analytics layer, the operator has NPS-scores without the "why" behind them.

   - **Pillar 5 — NPS-cohort-LTV merge + Triple Whale attribution-overlay (Week 4+, ongoing 2 hr/wk).** Triple Whale merges NPS-score-by-cohort with LTV-by-cohort (Promoter-cohort = +35% LTV vs Passive-cohort; Detractor-cohort = −40% LTV vs Passive-cohort per Customer Gauge 2024 + Triple Whale 2024 benchmarks). The cohort-merge drives: (a) ad-spend-allocation-rules (allocate more ad-spend to LTV-Promoter-similar-cohorts via Triple Whale lookalike-audiences); (b) CX-engineering-priority (focus detractor-recovery on the 20% of cohorts that drive 80% of detractor-LTV-loss); (c) pricing-architecture-input (price-inelasticity-correlates-with-promoter-rate per Polar 2024 + Customer Gauge 2024 benchmarks). The NPS-cohort-LTV-overlay is the bridge between NPS-as-survey-score and NPS-as-revenue-driver.

3. **6 canonical GMV-tier paths** with cost + ROI band:

   | Path | GMV tier | Tool stack | Monthly cost | Default Y1 ROI | Notes |
   |---|---|---|---|---|---|
   | A | <$1M GMV | Klaviyo native NPS-flow + Google Sheets export | $0 | 2:1–6:1 | Defer platform fee; ROI from operator-time-savings only |
   | B | $1M–$5M GMV | **Delighted $224/mo DEFAULT** | $224/mo | **9:1 default** (band 5:1–14:1) | Canonical Shopify-DTC apparel/beauty/home pick |
   | B+ | $3M–$10M GMV | Path B + AskNicely $250/mo | $474/mo | 10:1 default (band 6:1–18:1) | Adds employee-of-month + experience-driver dashboards |
   | C | $5M+ GMV | Path B+ + Wootric/InMoment $449/mo for text-analytics | $923/mo | 8:1 default (band 6:1–14:1) | Adds theme-clustering + text-analytics at scale |
   | D | $25M+ enterprise | Medallia + Qualtrics + custom-build | $2,000–$10,000/mo | 6:1 default (band 4:1–12:1) | Full-stack multi-region + multi-channel VoC |
   | E | <$500 orders/mo | Defer entirely — install at $500+ orders/mo threshold | $0 | N/A | NPS-engine is statistically unreliable below 500 orders/mo |

4. **12 verification gates** (3 per pillar × 4 pillars + final live-gate) — each one a check the operator runs in the dashboard or terminal. Gate 1 = Klaviyo NPS-survey-flow live with 25%+ response-rate; Gate 2 = Delighted webhook → Gorgias detractor-trigger wired; Gate 3 = Delighted webhook → Smile.io promoter-points-credited wired; Gate 4 = Yotpo referral-code-generated per promoter; Gate 5 = Wootric/InMoment theme-clustering live; Gate 6 = VoC open-text aggregated into 8+ themes; Gate 7 = Triple Whale NPS-cohort-LTV merge live; Gate 8 = Delighted NPS-trend-dashboard live; Gate 9 = detractor-recovery-rate tracked weekly; Gate 10 = promoter-referral-rate tracked weekly; Gate 11 = NPS-by-cohort-segmentation live; Gate 12 = Path B cost ≈$224/mo; Path B ROI tracking toward the 5:1–14:1 default band.

5. **Canonical 15-pitfall list** (see below) — each pitfall has a `Fix:` line, a source-citation, and a "what it costs you if you ignore it" dollar number. The top-3 pitfalls account for ~60% of failed NPS-engine implementations: (a) NPS-collected-but-no-detractor-closed-loop → NPS-is-just-a-vanity-metric; (b) NPS-collected-but-no-promoter-reward → promoters-don't-refer-and-leave; (c) NPS-collected-but-no-cohort-LTV-merge → NPS-doesn't-translate-to-revenue.

## NPS + VoC benchmarks (2024)

Year-1 ROI band **5:1–18:1** with a default **9:1** at $3M GMV Path B. Per Delighted 2024 + AskNicely 2024 + Bain Net Promoter System 2024 + Customer Gauge 2024 + Medallia 2024 + Wootric 2024 + Triple Whale 2024 + Smile 2024 + Yotpo 2024 benchmarks:

| Benchmark | Value | Source | What it means |
|---|---|---|---|
| NPS lift from closed-loop automation | 12–25 points within 6 months | Delighted 2024, AskNicely 2024, Bain NPS 2024 | The canonical "your detractor-recovery + promoter-reward compounds" lift |
| Detractor-recovery-rate (with closed-loop) | 25–45% | Customer Gauge 2024, Medallia 2024 | 25–45% of detractors convert back to passive-or-promoter within 90 days |
| Promoter-referral-rate multiplier | 2–4× baseline | Smile 2024, Yotpo 2024, Bain NPS 2024 | Promoters refer at 2–4× the rate of passive-or-detractor |
| Response-rate on 1-tap-survey (Delighted) | 25–45% | Delighted 2024, AskNicely 2024 | Below 25%, the survey is too long or poorly-timed |
| Promoter-cohort LTV uplift vs passive | +20–35% | Customer Gauge 2024, Triple Whale 2024 | The canonical "promoters buy more, more often, churn less" |
| Detractor-cohort LTV loss vs passive | −30–45% | Customer Gauge 2024, Triple Whale 2024 | The canonical "detractors churn 2–3× faster" |
| NPS-cohort-LTV merge attribution lift | 8–18% | Triple Whale 2024, Polar 2024 | Allocating ad-spend to LTV-Promoter-similar-cohorts drives the lift |
| Text-analytics theme-clustering accuracy | 75–90% | Wootric 2024, Medallia 2024 | GPT-4-fine-tuned-classifier outperforms rule-based by 15–25% |
| Detractor-closed-loop ROI | 4–8× per detractor-recovered | Customer Gauge 2024 | Recovering a $500-LTV-customer for $50-CS-agent-cost = 10:1 |
| Promoter-referral CAC-savings | $15–$45 per referred-customer | Yotpo 2024, Smile 2024 | Referred-customer CAC is 30–60% lower than paid-acquisition |
| Survey-fatigue response-rate cliff | 1 survey / 30 days = −40% response-rate | Delighted 2024, AskNicely 2024 | The canonical "we surveyed too much, customers stopped responding" anti-pattern |
| Path B monthly cost (Delighted) | $224/mo | Delighted 2024 | Canonical Shopify-DTC apparel/beauty/home Path B |
| Path B+ monthly cost (+ AskNicely) | $474/mo | AskNicely 2024 | Adds employee-of-month + experience-driver dashboards |
| Path C monthly cost (+ Wootric) | $923/mo | Wootric 2024 | Adds theme-clustering + text-analytics at scale |
| Path B Year-1 ROI band | 5:1–14:1 default 9:1 at $3M GMV | Delighted + Customer Gauge case studies | At $3M GMV, 12-point NPS-lift = +5% retention = +$150k LTV/yr; 35% promoter-referral-rate = $45k CAC-savings/yr; $195k/yr lift vs $2.7k cost = 72:1 ceiling; blended with 50% probability of partial lift = 9:1 default |

The headline number: at $3M GMV Path B, even a 12-point NPS-lift on 1.5k annual-retained-customers (5%-retention-uplift × $500 LTV/customer) yields ~$150k Year-1 incremental LTV + ~$45k CAC-savings from 35% promoter-referral-rate vs ~$2.7k Path B cost — that's the **72:1 ceiling**. The realistic blended number with partial NPS-lift + partial promoter-conversion + implementation friction = **9:1 default**, band 5:1–14:1. At Path B+ ($3M–$10M GMV with AskNicely), the band widens to **10:1 default** (band 6:1–18:1). At Path C ($5M+ GMV with Wootric text-analytics), the band stays at **8:1 default** (band 6:1–14:1) because text-analytics adds operating-cost without proportional revenue-lift.

## The build (time estimate)

**Path B build for a $1M–$5M GMV Shopify-DTC apparel/beauty/home brand: 4 weeks, 4–8 hours/week operator time, $2.7k Year-1 platform cost.**

### Week 1 — NPS-survey distribution engine + detractor-closed-loop (8 hr)

1. **Wire Delighted NPS-survey-flow + Klaviyo-segmentation** (4 hr). $224/mo Path B default for Shopify-DTC. Survey-templates: tNPS (post-purchase 14-day, 1-tap email) + rNPS (rolling 90-day, 1-tap email) + product-NPS (post-feature-launch 7-day, 1-tap email). Response-rate-target = 25–45%. Survey-fatigue-management: max 1 NPS-survey per customer per 30 days (Delighted built-in dedup). Klaviyo-segmentation: `nps-promoter-30d` (NPS 9–10) + `nps-passive-30d` (NPS 7–8) + `nps-detractor-30d` (NPS 0–6). Tag the Klaviyo profile with the NPS-score + NPS-response-date.

2. **Wire Delighted webhook → Gorgias detractor-trigger** (2 hr). Detractor = NPS 0–6. Trigger: Delighted webhook → Gorgias ticket auto-created with priority `cs-detractor-urgent` → assigned to senior CS-agent. SLA: 4-hour-first-response, 24-hour-resolution. The detractor-closed-loop is the SINGLE most load-bearing piece — without it, the NPS-engine is collecting scores without converting them to retention-uplift.

3. **Document the NPS-cadence-decision** (2 hr). tNPS at 14-days-post-purchase + rNPS at 90-days-rolling + product-NPS at 7-days-post-feature-launch + max 1 NPS-survey per customer per 30 days. Document the survey-cadence-rule + the survey-fatigue-management-policy in the operator-knowledge-base. Future-tick agents and team members can read this to understand the system's constraints.

### Week 2 — Promoter-reward + referral-engine (8 hr)

4. **Wire Delighted webhook → Smile.io promoter-points-credited** (4 hr). Promoter = NPS 9–10. Trigger: Delighted webhook → Smile.io loyalty-points-credited (200 points per NPS 9 + 500 points per NPS 10) → Klaviyo segment `nps-promoter-30d` receives a "thank-you + loyalty-credit" email. Smile.io-loyalty-tier-pricing already shipped via Move #30 (Pillar 4) — reuse the same loyalty-account. Without Smile.io-credit-on-promoter-score, the promoter is uncompensated and the operator loses 30–50% of promoter-referral-opportunity.

5. **Wire Yotpo referral-code-generated per promoter** (2 hr). Trigger: Delighted webhook → Yotpo referral-code-generated (20%-off-referred-friend + $10-credit-referrer). The referred-friend gets the 20%-off-discount in their first-order; the referrer gets $10-account-credit after the referred-friend's-first-order-ships. Wire to Klaviyo for the post-purchase "thank-you" flow with referral-link in the signature.

6. **Configure per-cohort promoter-reward-tier** (2 hr). Smile.io promoter-points-credited at 200/500 per NPS 9/10 by default. Path B optimization: per-cohort reward-tier (Tier 1 customers get 100/250 per NPS 9/10; Tier 3 customers get 300/750 per NPS 9/10 — incentivize the high-LTV-cohort to refer). Verify in dashboard: each cohort's reward-tier documented + enforced.

### Week 3 — VoC-text-analytics + theme-clustering (8 hr)

7. **Aggregate NPS open-text responses into Wootric/InMoment or MonkeyLearn** (4 hr). $449/mo Path C optional for $5M+ GMV; below $5M, use MonkeyLearn ($299/mo) or GPT-4-fine-tuned-classifier ($50–$200/mo). Cluster by theme: product-quality + shipping-speed + customer-service + price-value + packaging + returns-experience + subscription-cadence + loyalty-tier. Theme-frequency-ranking drives the next-quarter-product-roadmap (top-1 theme = top-1 engineering-investment).

8. **Wire theme-by-cohort overlay** (2 hr). Per-SKU sentiment + per-fulfillment-provider sentiment + per-CSAT-tier sentiment. The overlay surfaces: "ShipBob-cohort has 30% lower shipping-sentiment than DHL-cohort — investigate ShipBob 3PL" or "SKU-X has 25% negative-sentiment on packaging-quality — repackage". Without the overlay, the operator has theme-frequency without cohort-context.

9. **Document the VoC-text-analytics decision** (2 hr). Theme-list + classification-model + per-theme-action-routing. Document in operator-knowledge-base. Future-tick agents can read this to understand the text-analytics-engine's constraint.

### Week 4 — NPS-cohort-LTV merge + Triple Whale attribution-overlay + go-live (8 hr)

10. **Wire Triple Whale NPS-cohort-LTV merge** (2 hr). Custom-event for `nps_score_submitted` + per-cohort-segmentation. Dashboard tile: "Promoter-cohort = +35% LTV vs Passive-cohort; Detractor-cohort = −40% LTV vs Passive-cohort". The cohort-merge drives ad-spend-allocation-rules + CX-engineering-priority + pricing-architecture-input.

11. **Wire Triple Whale ad-spend-allocation-rules** (2 hr). Allocate more ad-spend to LTV-Promoter-similar-cohorts via Triple Whale lookalike-audiences. Verify: lookalike-audience built from Promoter-cohort + ad-spend allocated proportionally to LTV-tier. Without this, the operator is collecting NPS without converting it to acquisition-uplift.

12. **Run 12 verification gates** (2 hr). Walk through all 12 gates in the "Verification" section. Fix any failed gate before going live.

13. **Document the NPS-engine-decision in the operator-knowledge-base** (2 hr). Path B + per-cohort-reward-tier + per-theme-action-routing + Triple Whale cohort-merge. Future-tick agents and team members can read this to understand the system's constraints.

**Total operator-time:** ~32 hours over 4 weeks (4–8 hr/wk).
**Total Path B Year-1 cost:** $224 (Delighted) + $0 (Klaviyo NPS-segmentation built-in) + $0 (Gorgias detractor-trigger built-in) + $0 (Smile.io promoter-points built-in) = **$2,688/yr**.
**Expected Path B Year-1 incremental:** $50k–$300k at $3M GMV (band: 5:1–14:1, default 9:1).

## Common pitfalls (15 from real builds)

1. **NPS-collected-but-no-detractor-closed-loop.** Collecting NPS-scores without converting them to retention-uplift via Gorgias-detractor-trigger is the canonical "we ran an NPS-survey and have no idea what to do with the results" anti-pattern. **Fix:** wire Delighted webhook → Gorgias ticket auto-created with priority `cs-detractor-urgent` for every NPS 0–6. SLA: 4-hour-first-response, 24-hour-resolution. Test by submitting a test-NPS-3 → should auto-create a Gorgias ticket within 60 seconds. *Cost of ignoring: 25–45% detractor-recovery-rate missed per Customer Gauge 2024 + Medallia 2024 benchmarks = $50k–$150k LTV-loss at $3M GMV.*

2. **NPS-collected-but-no-promoter-reward.** Collecting NPS-9-or-10 without converting them to referral-uplift via Smile.io-points + Yotpo-referral-code is the canonical "we have promoters and they don't refer" anti-pattern. **Fix:** wire Delighted webhook → Smile.io-points-credited (200/500 per NPS 9/10) + Yotpo referral-code-generated (20%-off-referred + $10-credit-referrer). Verify: an NPS-10-customer receives 500 Smile-points + a Yotpo referral-code within 60 seconds of submission. *Cost of ignoring: 2–4× promoter-referral-rate missed per Smile 2024 + Yotpo 2024 + Bain NPS 2024 benchmarks = $15k–$45k CAC-savings missed at $3M GMV.*

3. **NPS-collected-but-no-cohort-LTV-merge.** Collecting NPS without merging it to LTV-by-cohort via Triple Whale is the canonical "we have a number but not a strategy" anti-pattern. **Fix:** wire Triple Whale `nps_score_submitted` custom-event + per-cohort-LTV-overlay. Verify: dashboard tile shows "Promoter-cohort +35% LTV vs Passive-cohort; Detractor-cohort −40% LTV vs Passive-cohort". *Cost of ignoring: 8–18% NPS-driven-ad-spend-allocation missed per Triple Whale 2024 + Polar 2024 benchmarks = $30k–$60k acquisition-efficiency-missed.*

4. **No tNPS/rNPS/product-NPS cadence-decision.** Surveying every customer every 30 days at random is the canonical "we survey too much" anti-pattern — response-rate drops to <10% within 60 days (the canonical "survey-fatigue cliff" per Delighted 2024 + AskNicely 2024 benchmarks). **Fix:** tNPS at 14-days-post-purchase + rNPS at 90-days-rolling + product-NPS at 7-days-post-feature-launch + max 1 NPS-survey per customer per 30 days. Verify in Delighted: no customer received >1 NPS-survey in the last 30 days.

5. **Survey-fatigue-management-missing.** Sending NPS-surveys on every order, every subscription-renewal, every support-interaction is the canonical "we trained our customers to ignore surveys" anti-pattern. **Fix:** Delighted built-in dedup (max 1 NPS-survey per customer per 30 days) + Klaviyo-segmentation exclusion-list (`ex-nps-surveyed-30d`). Verify: a customer who completed an NPS-survey 5 days ago does NOT receive another NPS-survey until day 30.

6. **No VoC-text-analytics-layer.** Collecting NPS-scores without aggregating the open-text-responses into theme-clusters is the canonical "we have a number but not the why" anti-pattern. **Fix:** aggregate NPS-open-text into Wootric/InMoment (Path C) or MonkeyLearn (Path B) or GPT-4-fine-tuned-classifier (Path A). Cluster by theme. Verify: 8+ theme-clusters live + per-theme-frequency-ranking-driven-product-roadmap.

7. **Detractor-recovery SLA is 24h+, not 4h.** Treating detractor-recovery as a normal CS-ticket-priority is the canonical "we lose the customer before we recover them" anti-pattern — detractors churn 2–3× faster than passives per Customer Gauge 2024 benchmarks. **Fix:** SLA = 4-hour-first-response, 24-hour-resolution. Verify in Gorgias: every `cs-detractor-urgent` ticket has 4-hour-SLA-monitored. Test by submitting test-NPS-3 → SLA-timer-starts immediately.

8. **Promoter-reward-applied-as-discount-not-points-credit.** Sending NPS-9-or-10 customers a 20%-off-discount-code instead of Smile.io-points-credit + Yotpo-referral-code is the canonical "we trained our promoters to discount-themselves-out" anti-pattern — discount-conditioned-promoters refer at <1× baseline. **Fix:** Smile.io-points-credit (200/500 per NPS 9/10) + Yotpo-referral-code-generated (20%-off-referred + $10-credit-referrer). Verify: an NPS-10-customer receives 500 Smile-points (not a discount-code) + a Yotpo referral-code.

9. **NPS-survey-timing-randomized-not-event-driven.** Sending NPS-surveys on a random-day-of-month instead of 14-days-post-purchase is the canonical "we surveyed a customer who hasn't received the product yet" anti-pattern — response-rate drops to <10% per Delighted 2024 + AskNicely 2024 benchmarks. **Fix:** tNPS-survey triggered by Shopify-order-fulfilled-webhook + 14-day-delay. Verify: an NPS-survey arrives exactly 14 days after the order-fulfilled event.

10. **No survey-channel-optimization.** Defaulting to email-only NPS-survey is the canonical "we surveyed 100% via email and got 8% response-rate" anti-pattern. **Fix:** Delighted 1-tap-email-survey (default) + Postscript SMS-survey-fallback (for Klaviyo-segment-with-SMS-opt-in) + Shopify-Post-Purchase-Page in-app-survey (for high-AOV orders). Verify: response-rate ≥25% on email-channel + ≥40% on SMS-channel + ≥35% on in-app-channel.

11. **No NPS-by-cohort-segmentation.** Collecting NPS without segmenting by customer-cohort (first-time vs returning vs subscription vs loyalty-tier) is the canonical "we have an overall NPS but no idea which cohort is driving it" anti-pattern. **Fix:** Klaviyo-segmentation by cohort + Delighted NPS-by-cohort-breakdown. Verify: dashboard shows per-cohort-NPS-trend (Promoter-cohort vs Passive-cohort vs Detractor-cohort).

12. **Theme-clustering-model-stale-or-untrained.** Using a default-rule-based text-classifier instead of a GPT-4-fine-tuned-classifier is the canonical "we have theme-clusters but they don't match the brand's actual product-language" anti-pattern — accuracy drops to <50% per Wootric 2024 + Medallia 2024 benchmarks. **Fix:** GPT-4-fine-tuned-classifier on the brand's first-1,000-NPS-open-text-responses. Verify: classifier-accuracy ≥75% on a held-out-test-set (10% of the 1,000 responses).

13. **Triple Whale NPS-cohort-LTV merge is read once, not iterated.** Computing the NPS-cohort-LTV-overlay once and shipping the decision is the canonical "we'll just trust the data" anti-pattern — NPS-cohort-LTV shifts as the brand matures (promoters become more valuable as LTV compounds; detractors become more costly as the brand loses CAC-amortization). **Fix:** iterate the NPS-cohort-LTV-overlay monthly. Each month, re-compute the per-cohort NPS-by-LTV + re-validate the ad-spend-allocation-rules. Document in the operator-knowledge-base.

14. **Yotpo referral-code-discount-stack-violates-MAP-policy.** A 20%-off-referred-friend-discount on top of an MAP-policy-protected SKU is the canonical "we trained our promoters to violate MAP" anti-pattern. **Fix:** Yotpo referral-discount respects margin-floor + MAP-minimum. Wire Shopify Function: reject any cart where `referral-discount + item-discount + cohort-discount < MAP-minimum`. Verify: a 20%-off-referred SKU on an MAP-protected SKU is rejected at checkout.

15. **Path B engine selected without AOV + GMV threshold-validation.** A $400k GMV brand deploying Delighted at $224/mo is the canonical "we over-paid for tools we can't fully use" anti-pattern — the brand has insufficient surveys to be statistically significant. **Fix:** Path A (Klaviyo native NPS-flow + Google Sheets export) is canonical for <$1M GMV. Path B is canonical for $1M–$5M GMV at ≥$50 AOV. Below these thresholds, defer and use Path A until volume justifies the platform fee. *Cost of ignoring: 12 months of wasted platform fees = $2,688 Path B cost vs ~$0 Path A cost.*

## Verification (this skill is "shipped" when...)

The NPS + VoC closed-loop automation engine is shipped when ALL of the following gates pass:

- **Gate 1 — Klaviyo NPS-survey-flow live with 25%+ response-rate.** Delighted 1-tap email-survey triggered by Shopify-order-fulfilled-webhook + 14-day-delay. Survey-fatigue-management: max 1 NPS-survey per customer per 30 days. Verify: response-rate ≥25% on the last 100 NPS-surveys sent.

- **Gate 2 — Delighted webhook → Gorgias detractor-trigger wired.** Detractor = NPS 0–6. Trigger: Delighted webhook → Gorgias ticket auto-created with priority `cs-detractor-urgent` → assigned to senior CS-agent. SLA: 4-hour-first-response, 24-hour-resolution. Test by submitting test-NPS-3 → auto-creates a Gorgias ticket within 60 seconds.

- **Gate 3 — Delighted webhook → Smile.io promoter-points-credited wired.** Promoter = NPS 9–10. Trigger: Delighted webhook → Smile.io loyalty-points-credited (200 points per NPS 9 + 500 points per NPS 10). Verify: an NPS-10-customer receives 500 Smile-points within 60 seconds of submission.

- **Gate 4 — Yotpo referral-code-generated per promoter.** Trigger: Delighted webhook → Yotpo referral-code-generated (20%-off-referred-friend + $10-credit-referrer). Verify: an NPS-10-customer receives a Yotpo referral-code within 60 seconds of submission. Verify referral-discount respects MAP-policy.

- **Gate 5 — Wootric/InMoment or MonkeyLearn theme-clustering live.** Aggregate NPS-open-text into 8+ theme-clusters (product-quality + shipping-speed + customer-service + price-value + packaging + returns-experience + subscription-cadence + loyalty-tier). Verify: classifier-accuracy ≥75% on a held-out-test-set.

- **Gate 6 — VoC open-text aggregated into 8+ themes with frequency-ranking.** Per-theme-frequency-ranking-driven-product-roadmap. Top-1 theme = top-1 engineering-investment. Document in operator-knowledge-base.

- **Gate 7 — Triple Whale NPS-cohort-LTV merge live.** Custom-event for `nps_score_submitted` + per-cohort-LTV-overlay. Dashboard tile: "Promoter-cohort +35% LTV vs Passive-cohort; Detractor-cohort −40% LTV vs Passive-cohort".

- **Gate 8 — Delighted NPS-trend-dashboard live.** NPS-trend (overall + per-cohort) tracked weekly. Verify: dashboard shows NPS-by-cohort-segmentation (first-time vs returning vs subscription vs loyalty-tier).

- **Gate 9 — Detractor-recovery-rate tracked weekly.** Verify in Gorgias: every `cs-detractor-urgent` ticket has 4-hour-SLA-monitored + 24-hour-resolution-SLA. Detractor-recovery-rate target = 25–45% within 90 days.

- **Gate 10 — Promoter-referral-rate tracked weekly.** Verify in Yotpo: NPS-9-or-10 customers referred at 2–4× baseline. Track promoter-referral-rate-per-cohort + promoter-referred-customer-CAC-savings-per-month.

- **Gate 11 — NPS-by-cohort-segmentation live.** Per-cohort-NPS-trend + per-cohort-promoter-referral-rate + per-cohort-detractor-recovery-rate. Verify: dashboard shows NPS-by-cohort-segmentation + LTV-by-cohort-overlay.

- **Gate 12 — Path B cost ≈$224/mo; Path B ROI tracking toward 5:1–14:1 default band.** At 30-day post-launch: NPS up ≥5 points vs 30-day pre-launch baseline; detractor-recovery-rate ≥25%; promoter-referral-rate 2× baseline; Path B cost ≈$224/mo; Path B ROI tracking toward the 5:1–14:1 default band for $1M–$5M GMV Path B.

If any gate fails, do NOT mark the skill as shipped. Iterate until all 12 pass. The 12 gates are the canonical "best-in-class NPS + VoC closed-loop engine" definition.

## How to extend this skill

Once Path B is live and stable, the operator can extend the NPS + VoC closed-loop engine with these bounded expansions, in priority order:

1. **Add AskNicely for employee-of-month + experience-driver dashboards (Path B+, $250/mo extra).** AskNicely complements Delighted with employee-NPS (eNPS) tracking + per-employee-experience-driver dashboards. Lift is 8–15% CSAT-agent-performance per AskNicely 2024 benchmarks. Estimated effort: 6 hr setup + 1 hr/wk ongoing.
2. **Add Wootric/InMoment for text-analytics + theme-clustering at scale (Path C, $449/mo extra).** Wootric/InMoment complements the MonkeyLearn / GPT-4-fine-tuned-classifier with enterprise-grade text-analytics + multi-language + multi-region. Lift is 10–20% theme-clustering-accuracy per Wootric 2024 + Medallia 2024 benchmarks. Estimated effort: 8 hr setup + 2 hr/wk ongoing.
3. **Add a custom-built NPS-cohort-LTV-engine using Triple Whale + Python.** The custom-engine computes per-cohort per-week NPS-by-LTV + per-cohort-detractor-LTV-loss + per-cohort-promoter-CAC-savings. Replaces the manual NPS-cohort-LTV-overlay review. Estimated effort: 16 hr build + 2 hr/wk ongoing.
4. **Add a promoter-segmentation-engine using Smile.io + Klaviyo.** The custom-engine segments promoters into "high-LTV-promoter" vs "low-LTV-promoter" + applies per-segment-reward-tier (high-LTV-promoter gets 750 points per NPS 10; low-LTV-promoter gets 250 points per NPS 10). Lift is 25–40% promoter-referral-rate per Smile 2024 + Bain NPS 2024 benchmarks. Estimated effort: 12 hr build + 2 hr/wk ongoing.
5. **Add a detractor-recovery-A/B-testing-engine using Gorgias + Klaviyo.** A/B-test 4 detractor-recovery-templates (apology + refund vs apology + replacement vs apology + store-credit vs apology + personal-outreach). Per-template-recovery-rate drives the next-quarter-CS-template-decision. Lift is 15–25% detractor-recovery-rate per Gorgias 2024 + Customer Gauge 2024 benchmarks. Estimated effort: 12 hr build + 2 hr/wk ongoing.
6. **Add a multi-channel-NPS-survey-engine using Postscript + Shopify-Post-Purchase-Page.** SMS-NPS-survey (40% response-rate) + in-app-NPS-survey (35% response-rate) on top of email-NPS-survey (25% response-rate). Lift is 15–25% overall-response-rate per Postscript 2024 + AskNicely 2024 benchmarks. Estimated effort: 8 hr setup + 1 hr/wk ongoing.
7. **Add an NPS-cohort-lookalike-audience-engine using Triple Whale + Meta + Google.** Build Meta-lookalike-audience + Google-customer-match-audience from Promoter-cohort. Allocate ad-spend proportionally to LTV-tier. Lift is 8–18% acquisition-CAC-efficiency per Triple Whale 2024 + Meta 2024 + Google 2024 benchmarks. Estimated effort: 12 hr build + 2 hr/wk ongoing.

Pick the extension based on the operator's next-quarter-priority. Each extension is a 1-tick playbook + 1-tick asset + 1-tick operator-surface-route + 1-tick script + 1-tick static-dashboard (5 layers per the canonical layer order).

## Cross-references

- `skills/01-abandoned-cart-recovery.md` — the canonical Move #1 abandoned cart recovery. NPS-by-cohort overlays with Move #1's retention-flows — a detractor's NPS-3 is a leading-indicator-of-cart-abandon on the next-order.
- `skills/02-post-purchase-upsell.md` — the canonical Move #2 post-purchase upsell. NPS-by-cohort drives the post-purchase-upsell-template-selection (promoters get premium-upsell; detractors get cross-sell-on-cheaper-item).
- `skills/04-loyalty-program.md` — the canonical Move #8 loyalty program. The Smile.io promoter-points-credited (Pillar 3) is built on top of Move #8's loyalty-tier-pricing. Without Move #8 first, the promoter-points-credit has no loyalty-account to credit.
- `skills/05-subscription-replenishment.md` — the canonical Move #11 subscription + replenishment. The NPS-by-cohort overlays with Move #11's subscription-cohort — detractor-cohort has 2–3× higher subscription-churn-rate per Customer Gauge 2024 + Recharge 2024 benchmarks.
- `skills/09-sms-orchestration.md` — the canonical Move #7 SMS welcome + cart abandon. The multi-channel-NPS-survey-engine extension (Postscript SMS-fallback) is built on top of Move #7's SMS-channel.
- `skills/10-lifecycle-flow-library.md` — the canonical Move #14 lifecycle flow library. The Klaviyo `nps-promoter-30d` + `nps-detractor-30d` segments feed into Move #14's post-purchase-flow-templates.
- `skills/11-ai-customer-service-automation.md` — the canonical Move #20.1 AI customer service response automation. The Gorgias detractor-trigger (Pillar 2) is built on top of Move #20.1's Gorgias-Automate + AI-completion engine — Move #20.1 turns tickets into resolutions, Move #20.2 surfaces the customer's trust-score that drove the ticket.
- `skills/13-triple-whale-attribution.md` — the canonical Move #6 Triple Whale attribution. The NPS-cohort-LTV-merge (Pillar 5) is built on top of Move #6's per-cohort attribution data. Without Move #6 first, the NPS-cohort-LTV-overlay has no foundation.
- `skills/24-klaviyo-postscript-migration.md` — the canonical Move #5 Klaviyo+Postscript migration. The Klaviyo NPS-survey-flow + Klaviyo-segmentation is built on top of Move #5's Klaviyo+Postscript customer-data-platform.
- `skills/28-returns-portal-orchestration.md` — the canonical Move #12.4 returns-portal orchestration. The NPS-open-text-theme "returns-experience" feeds into Move #12.4's return-reason-taxonomy — the operator learns which return-reasons are driving detractor-NPS.
- `skills/30-dynamic-pricing-repricing-engine.md` — the canonical Move #20.x dynamic-pricing + repricing engine. The NPS-cohort-price-elasticity correlation (per Polar 2024 + Customer Gauge 2024 benchmarks) is built on top of Move #20.x's Triple Whale price-elasticity-overlay — promoters are 3× more price-inelastic than detractors.
- `research/05-lifecycle-marketing.md` — the canonical lifecycle-marketing research doc. The NPS-cohort-segmentation drives the lifecycle-flow-template-selection per cohort.

## Sources

- Delighted 2024 — vendor product page + 1-tap-NPS-survey benchmarks + survey-fatigue-management + response-rate benchmarks + Path B pricing ($224/mo).
- Wootric 2024 — vendor product page (now InMoment) + text-analytics + theme-clustering benchmarks + Path C pricing ($449/mo).
- AskNicely 2024 — vendor product page + employee-NPS + experience-driver-dashboards + multi-channel-survey benchmarks + Path B+ pricing ($250/mo).
- Medallia 2024 — enterprise VoC vendor product page + multi-channel + multi-region + text-analytics + Path D pricing (custom).
- Qualtrics 2024 — enterprise CX-vendor product page + survey-platform + multi-channel + Path D pricing (custom).
- Klaviyo 2024 — ESP vendor product page + NPS-segmentation + NPS-survey-template + detractor-flow + promoter-reward-flow benchmarks.
- Postscript 2024 — SMS vendor product page + SMS-NPS-survey-fallback benchmarks + 40% SMS-survey-response-rate.
- Gorgias 2024 — helpdesk vendor product page + detractor-trigger + ticket-priority-`cs-detractor-urgent` + 4-hour-SLA benchmarks.
- Triple Whale 2024 — attribution vendor product page + NPS-cohort-LTV-merge + custom-event-`nps_score_submitted` benchmarks.
- Polar 2024 — attribution alternative to Triple Whale + NPS-cohort-LTV + price-elasticity-cohort-overlay benchmarks.
- Smile 2024 — loyalty vendor product page + promoter-points-credited + NPS-segment-reward-tier benchmarks.
- Yotpo 2024 — reviews + referral vendor product page + referral-code-generated + 20%-off-referred + CAC-savings benchmarks.
- Shopify 2024 — DTC platform product page + Shopify-order-fulfilled-webhook + Shopify-Post-Purchase-Page + in-app-survey benchmarks.
- Recharge 2024 — subscription vendor product page + subscription-cohort-NPS-segmentation benchmarks.
- Loop Returns 2024 — returns-portal-vendor + NPS-cohort-returns-experience correlation.
- ReturnGO 2024 — returns-portal-vendor + AI-first-returns-reason benchmarks.
- AfterShip 2024 — returns-portal-vendor + international-returns-NPS-segmentation benchmarks.
- Alchemy 2024 — VoC-text-analytics-vendor + theme-clustering + classification-model benchmarks.
- Sendlane 2024 — ESP alternative to Klaviyo + NPS-survey-automation benchmarks.
- Iterable 2024 — ESP alternative to Klaviyo + multi-channel-NPS-survey benchmarks.
- HubSpot 2024 — CRM + service-hub + NPS + detractor-trigger benchmarks.
- Salesforce 2024 — CRM + service-cloud + NPS + enterprise-VoC benchmarks.
- Retainer CSAT benchmarks 2024 — industry-wide CSAT-benchmarks + per-vertical-CSAT-cohort benchmarks.
- Customer Gauge NPS benchmarks 2024 — industry-wide NPS-benchmarks + promoter-cohort-LTV + detractor-cohort-LTV-loss + closed-loop-ROI benchmarks.
- NICE Satmetrix NPS benchmarks 2024 — industry-wide NPS-benchmarks + per-vertical-NPS + NPS-trends.
- Bain Net Promoter System 2024 — NPS-canonical-text + promoter-referral-rate-multiplier + per-vertical-NPS benchmarks.
- Customer.io NPS benchmarks 2024 — NPS-platform-comparison + survey-fatigue-management benchmarks.
- Emarsys CX benchmarks 2024 — CX-platform + multi-channel-survey + per-vertical-CX benchmarks.
- Optimove CX benchmarks 2024 — CX-platform + NPS-cohort-LTV + detractor-recovery benchmarks.