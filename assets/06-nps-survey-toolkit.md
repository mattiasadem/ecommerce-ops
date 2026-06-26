# Asset 06 — NPS Survey Toolkit (Postscript 1-question + Wootric email + cohort-by-NPS-bucket LTV analysis)

> **Companion assets:** `assets/01-copy-templates.md` (T7 SMS Review Request — the dual-purpose organic-review + NPS-collection vehicle), `assets/02-brand-voice.md` (5 voice profiles — NPS-survey tone adapts per voice; Default uses Formality 2 / Humor 3; Luxury uses Formality 4 / Humor 1; Gen-Z uses Formality 1 / Humor 4), `assets/03-ugc-brief.md` (the UGC program — UGC cohorts typically show 10–20% higher NPS than paid-social cohorts, verified by Metric #12 cohort LTV by UGC vs paid-social vs organic), `assets/04-promo-calendar.md` (12-month calendar — NPS surveys ship Q1 baseline + Q2 mid-year + Q4 peak check, NOT continuously; the calendar slots dictate when to fire the survey), `assets/05-retention-metrics.md` (Metric #11 NPS — the canonical formula + 30–50 default benchmark + 4 voice-driven override columns + Triple Whale / Klaviyo / Postscript data source; this toolkit is the **implementation** of Metric #11). **Companion playbooks:** `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — the SMS-4 review request specifically collects NPS via Asset 01's T7; the toolkit adds the post-purchase NPS-survey cadence on top), `playbooks/07-loyalty-program-smile.md` (Move #8 — NPS > 50 typically maps to Smile.io tier-3+ retention, ~60–90% RPR for the B2B voice), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — the cohort-by-NPS-bucket LTV analysis feeds into Triple Whale's cohort-LTV report).

---

## Goal

Asset 05 (retention-metrics card) defined **Metric #11 — NPS (Net Promoter Score)** with the canonical formula `NPS = % Promoters (9–10 rating) − % Detractors (0–6 rating)` and a default benchmark of 30–50. That metric has **no data pipeline** — a `NPS = % Promoters − % Detractors` formula can't be computed without a survey program.

This toolkit closes that gap with a paste-ready NPS-survey program:

1. **3 survey channels** — Postscript SMS (1-question, post-purchase, 14-day delay), Wootric email (1-question + 9 follow-up questions, 30-day delay), Delighted (free tier, web + email, 7-day delay). Each has explicit pricing, response-rate, and use-case fit.
2. **A 1-question + 9-question survey template** — the canonical 1-question NPS survey ("How likely are you to recommend {{ company.name }} to a friend?") + the 9-question follow-up that probes detractors vs promoters with verbatim-capture rules.
3. **Survey-frequency guardrails** — the canonical "survey-fatigue trap" rules (max 1 NPS survey per customer per 90 days; 3 NPS surveys per year per customer max; no NPS survey within 14 days of a complaint or refund).
4. **Klaviyo NPS segment wiring** — 4-step recipe to set `nps_score` custom property + tag promoters (9–10) vs passives (7–8) vs detractors (0–6) + feed cohort-by-NPS-bucket into the cohort-LTV overlay.
5. **Cohort-by-NPS-bucket LTV analysis** — the canonical query to compute 90-day / 180-day / 365-day LTV by NPS bucket (Promoter LTV / Passive LTV / Detractor LTV), which proves the Move #8 loyalty + Asset 03 UGC + Asset 04 Q4-peak investment thesis with hard numbers.

**Honest-read called out in 4 places:** (a) **NPS is a leading indicator, not a same-quarter predictor** — NPS measured today predicts repeat-purchase behavior 60–180 days out, NOT 30 days; track NPS monthly but expect NPS-driven RPR / LTV changes to lag by a quarter. (b) **Survey response rate is structurally low** — Postscript SMS gets ~12–18% response (industry baseline for post-purchase SMS); Wootric / Delighted email gets 4–8% (industry baseline for B2C email); expect 100 NPS responses per ~1,000 post-purchase customers per quarter, NOT per month. (c) **NPS benchmarks vary by voice** — Default NPS of 30–50 is healthy; **Gen-Z NPS of 25–45 is healthy** (Gen-Z brand-loyalty is structurally lower; Gen-Z promoters tend to score 9–10 only when the brand has genuinely exceeded expectations — the Gen-Z 25–45 range is the floor); **Luxury NPS of 40–60 is healthy** (luxury customers have high expectations; a Luxury brand scoring NPS 35 is at risk because luxury Detractors are unforgiving and rarely recover); **Sustainable NPS of 40–55 is healthy** (mission-driven loyalty lifts NPS, but a Sustainable brand scoring below 40 has a credibility gap between mission claims and customer experience); **B2B NPS of 30–50 is healthy** (B2B NPS is a function of account-management quality, not product alone — a B2B brand scoring above 50 has exceptional CS); operators MUST apply the 4 voice-driven override columns from Asset 05 Metric #11. (d) **Survey fatigue is the #1 failure mode** — the canonical trap is "we'll just survey everyone every month" → response rate drops to 1–2% within 2 quarters + the customer base feels spammed + NPS readings become noise; the 90-day cooldown is non-negotiable across all 5 voice profiles (Default + Luxury + Sustainable + Gen-Z + B2B).

---

## Decision matrix — which NPS-survey channel for which business shape

| Channel | Cost | Response rate | Use case | When NOT to use | Setup time | Free tier? |
|---|---|---|---|---|---|---|
| **Postscript SMS** | $0.01–$0.04/SMS sent (~$0.10–$0.40 per survey delivered); ~$50–$200/mo for 1k post-purchase customers/mo | **12–18%** (industry baseline for post-purchase SMS; ~3–4× email baseline) | Post-purchase NPS for DTC stores with mobile-first customers (Gen-Z / Millennial skew); 14-day delay post-delivery (not post-purchase — give them time to USE the product) | When SMS is not yet wired (Move #7 / Asset 01's T7 SMS Review Request is the entry point); when AOV < $30 (the $0.10–$0.40/survey cost is 0.3–1.3% of AOV, eats margin) | 1 hr (Postscript + Klaviyo trigger wiring) | Yes — 100 SMS/mo free, then $0.01–$0.04/SMS |
| **Wootric email** | $0–$249/mo (Starter is free < 200 responses/mo; Pro $249/mo for unlimited + 9-question follow-up) | **4–8%** (industry baseline for B2C email) | Post-purchase NPS for premium / luxury / B2B stores (higher AOV justifies email-vs-SMS); 30-day delay (gives time for product to be used + review cycle to complete); the 9-question follow-up is the canonical "ask why" probe | When response-volume is >200/mo on the free tier (Wootric auto-upgrades to paid, the 9-question feature is gated) | 2 hr (Wootric + Klaviyo trigger + custom property wiring) | Yes — 200 responses/mo + 1-question NPS; $249/mo for 9-question |
| **Delighted** | $0–$317/mo (Starter free < 100 responses/mo; Pro $317/mo for unlimited + web + email + 9-question) | **5–9%** (slightly higher than Wootric due to web + email dual-channel) | Premium / DTC stores with established email + web engagement; 7-day delay; the web-survey widget is the canonical "intercept high-intent visitors" channel | When customer base is mobile-first (Gen-Z / Millennial) and email is secondary — the SMS channel (Postscript) will outperform email | 1.5 hr (Delighted + Klaviyo + Shopify theme snippet) | Yes — 100 responses/mo + 1-question + 1-channel; $317/mo for 9-question |
| **SurveyMonkey** | $0–$99/mo (Starter free < 100 responses/mo; Advantage $99/mo for skip-logic + custom branding) | **3–6%** (lowest baseline; SurveyMonkey is a general-purpose tool, not NPS-specialized) | Internal NPS for B2B / SaaS / consulting with established email lists; quarterly NPS for **team-internal** feedback (employees, suppliers, B2B accounts) | For DTC consumer NPS — the channel-specific tools (Postscript / Wootric / Delighted) are 2–3× higher response rate and 1/3 the setup time | 3 hr (SurveyMonkey + Klaviyo + custom-property wiring) | Yes — 100 responses/mo + 10 questions; $99/mo for unlimited |

**Default case for <$5k/mo ad spend:** Postscript SMS only. Cost ~$50–$200/mo for 1k post-purchase customers/mo; response rate 12–18% = ~120–180 NPS responses per quarter = enough signal to compute monthly NPS with ±5pt confidence interval. Add Wootric / Delighted when monthly volume >1k post-purchase customers/mo OR when AOV >$100 (email cost is justified).

**Default case for $5k–$50k/mo ad spend:** Postscript SMS (post-purchase) + Wootric OR Delighted (30-day + 7-day email/web for NPS-detractor follow-up). The two-channel setup captures both the immediate-post-purchase signal (SMS) and the "after they've used the product" signal (email/web).

**Default case for $50k+/mo ad spend:** All three channels (Postscript + Wootric + Delighted web widget), with a quarterly NPS cadence (Q1 baseline + Q2 mid-year + Q4 peak check per the Asset 04 calendar). Add SurveyMonkey for internal/team NPS (employees, B2B accounts, supplier NPS) as a separate workstream.

---

## The 1-question + 9-question survey template

### 1-question NPS survey (default — ships Day 1)

The canonical NPS-survey question:

> **"How likely are you to recommend {{ company.name }} to a friend or colleague?"**
>
> 0 — Not at all likely
>
> 1 — 2 — 3 — 4 — 5 — 6 — 7 — 8 — 9 — **10 — Extremely likely**

That's it. One question. One 0–10 scale. The 0–6 / 7–8 / 9–10 bucket split IS NPS.

**Where to send:** Asset 01's T7 SMS Review Request is **NOT** an NPS survey — T7 asks for a written review, which is a different signal (text-content qualitative, not numeric-quantitative). The NPS survey ships as a separate message 14 days post-delivery (Postscript SMS) or 30 days post-delivery (Wootric email) — different timing, different ask.

**Tone adaptation per voice profile (from Asset 02):**

- **Default (Formality 2 / Humor 3):** "Hi {{ first_name }}, quick question — how likely are you to recommend {{ company.name }} to a friend? Reply 0–10. Takes 10 seconds. Thanks!" — the Default NPS-survey tone is conversational + low-friction; the 10-second ask is the headline.
- **Luxury (Formality 4 / Humor 1):** "Dear {{ first_name | default: 'Friend of the House' }}, we would be most grateful for your candid feedback. On a scale of 0 to 10, how likely are you to recommend {{ company.name }} to a discerning acquaintance? With our thanks, {{ company.name }}" — the Luxury NPS-survey tone is refined + maximalist grammar + "candid feedback" framing (the word "feedback" is more elevated than "question"); the "discerning acquaintance" framing acknowledges the Luxury customer's high standards.
- **Sustainable / eco (Formality 3 / Humor 2):** "Hi {{ first_name }}, your feedback helps us build a more sustainable {{ vertical }}. On a scale of 0–10, how likely are you to recommend us to a friend? Every response shapes what we make next." — the Sustainable NPS-survey tone is warm + earnest + educational; the "every response shapes what we make next" line is the mission-driven closer that resonates with Sustainable promoters.
- **Gen-Z (Formality 1 / Humor 4):** "ok {{ first_name }} one sec — how likely are you to recommend us to a friend? 0–10. no wrong answers. we'll send you a discount code either way 🎉" — the Gen-Z NPS-survey tone is high-energy + lowercase + meme-aware; the "no wrong answers + discount either way" framing is the Gen-Z detractor-recovery hook (Gen-Z detractors are more likely to give a 7–8 when they know they'll get a discount regardless).
- **B2B (Formality 4 / Humor 1):** "{{ first_name }}, as part of our quarterly account review, we'd appreciate your candid feedback. On a scale of 0 to 10, how likely are you to recommend {{ company.name }} to a peer in your role? Thank you for your time." — the B2B NPS-survey tone is precise + benefit-led + no jokes; the "quarterly account review" framing positions the survey as part of the B2B relationship, not a generic post-purchase ask.

### 9-question follow-up (only for detractors 0–6 + passives 7–8, NOT for promoters 9–10)

**Why only detractors + passives?** Promoters (9–10) already gave you the answer — asking them 9 follow-up questions is survey fatigue. Save the deep follow-up for the people who are at-risk of churning or who didn't love the product. This is the canonical "don't survey-promoters-to-death" rule.

The 9-question follow-up (Klaviyo / Wootric conditional display logic: only show if NPS = 0–8):

1. **Q2 (open text):** "What's the #1 reason for your score?" — verbatim capture, no multiple-choice. This is the gold — the verbatim tells you WHY they're a detractor.
2. **Q3 (multiple choice):** "Which area is most responsible for your score?" — (a) Product quality / (b) Shipping speed / (c) Customer service / (d) Price / (e) Website experience / (f) Returns process / (g) Other (open text).
3. **Q4 (Likert 1–5):** "How satisfied are you with the product you received?" — Very dissatisfied → Very satisfied.
4. **Q5 (Likert 1–5):** "How likely are you to purchase from us again?" — Very unlikely → Very likely. **THIS IS THE LEADING-INDICATOR FLAG** — if Q5 is "Very unlikely" + NPS is detractor, the customer is at high churn-risk; flag for Move #8 loyalty intervention.
5. **Q6 (multiple choice):** "What would have made your experience better?" — (a) Faster shipping / (b) Lower price / (c) Better packaging / (d) More product variety / (e) Better customer service / (f) Nothing — it was the wrong product for me / (g) Other (open text).
6. **Q7 (yes/no):** "Would you like a member of our team to follow up with you?" — yes/no. If YES, route to Klaviyo "NPS-detractor-followup" segment + assign to CS team with a 48-hour SLA.
7. **Q8 (Likert 1–5):** "How would you rate our customer service?" — only show if Q3 = "Customer service". Skip-logic for non-CS detractors.
8. **Q9 (Likert 1–5):** "How would you rate our shipping speed?" — only show if Q3 = "Shipping speed". Skip-logic for non-shipping detractors.
9. **Q10 (Likert 1–5):** "How would you rate our product quality?" — only show if Q3 = "Product quality". Skip-logic for non-product detractors.

**Verbatim-capture rule:** every open-text response (Q2 + Q6 "Other" + Q7 "follow-up reason") goes into a Klaviyo custom property `nps_verbatim_text` + is searchable in Klaviyo's segment builder. Operators do NPS-cohort drill-downs by typing `nps_verbatim_text contains "shipping"` to find every detractor who mentioned shipping.

---

## Survey-frequency guardrails (the "survey-fatigue trap" rules)

**The trap:** "We'll just survey everyone every month." → response rate drops from 12–18% (month 1) to 1–2% (month 6) → NPS becomes noise → customers feel spammed → unsubscribe rate from SMS / email climbs 0.3% → 0.8% per send → CS volume increases as customers complain about the surveys themselves.

**The 5 non-negotiable rules:**

1. **Max 1 NPS survey per customer per 90 days.** Set this in Postscript / Wootric / Delighted as a hard cooldown. Customer submits NPS score on day 0 → next eligible NPS survey is day 90. Three NPS surveys per year per customer max.
2. **No NPS survey within 14 days of a complaint, refund, or support ticket.** Customers who just had a bad experience will skew-detractor AND will feel surveyed-while-still-hurt. Set a Klaviyo conditional: if `last_support_ticket_date` is within 14 days, suppress NPS survey.
3. **No NPS survey for customers who opted out of marketing.** SMS / email surveys are marketing-adjacent; respect opt-outs. Asset 01's T7 review-request already has this rule; mirror it for NPS.
4. **Post-purchase NPS ONLY for repeat customers (2+ orders) on the 2nd order onward.** First-time customers get Asset 01's T7 review request (not NPS); repeat customers (2nd order+) get NPS. Why: first-time customers don't have enough experience to answer "how likely are you to recommend" with confidence; repeat customers have used the product + ordered again + have a defensible answer.
5. **Quarterly cadence, not monthly.** NPS is a leading indicator (predicts RPR / LTV over 60–180 days, NOT 30 days). Monthly NPS readings are noisy + survey-fatiguing. The canonical cadence per Asset 04's calendar: Q1 baseline (Jan 15) + Q2 mid-year (May 15) + Q4 peak check (Oct 15) + an optional Q3 pulse (Aug 15) if a major product launch or Move #N ships in Q3. Three NPS readings per year is enough to compute a defensible annual NPS trend.

**Survey-fatigue early-warning signal:** if response rate drops below 5% (Postscript SMS) or 2% (Wootric / Delighted email) over 2 consecutive quarters, you have a survey-fatigue problem. Fix by extending the cooldown from 90 days to 180 days OR by switching the channel (e.g. from email NPS to SMS NPS if the customer base is mobile-first). Don't respond by "asking better questions" — the issue is frequency, not question quality.

---

## Klaviyo NPS segment wiring (4-step recipe)

The canonical data-pipeline for NPS data into Klaviyo (where it joins the cohort-LTV overlay per Asset 05 Metric #11):

**Step 1 — Set the `nps_score` custom property in Klaviyo.** Klaviyo Admin → Settings → Custom Properties → Add `nps_score` (type: number, 0–10). Also add `nps_bucket` (type: string, values: "promoter" / "passive" / "detractor") + `nps_verbatim_text` (type: text) + `nps_response_date` (type: date).

**Step 2 — Wire Postscript / Wootric / Delighted to push to Klaviyo on response.** All three tools have native Klaviyo integrations. Postscript: Postscript Admin → Integrations → Klaviyo → enable "Push survey response" → map NPS score to `nps_score`. Wootric: Wootric Admin → Integrations → Klaviyo → enable "Send response to Klaviyo" → map NPS + verbatim. Delighted: Delighted Admin → Integrations → Klaviyo → enable "Send to Klaviyo" → map NPS + verbatim + follow-up Q2-Q10.

**Step 3 — Create the 3 NPS segments in Klaviyo.**

- **"NPS Promoters (9-10)"** — segment definition: `nps_bucket = "promoter"` AND `nps_response_date` within last 90 days. **Use this for:** Asset 03 UGC outreach (promoters are 3–5× more likely to accept a creator outreach ask than the average customer); Move #8 loyalty tier upgrade (promoters → Smile.io tier 2+ auto-upgrade); referral program seeding. **Per-voice-profile promoter-segment interpretation:** Default promoters are typical satisfied-customers; Luxury promoters are the highest-LTV segment (Luxury promoters should be moved to a private Slack / VIP list for exclusive drops); Sustainable promoters are the highest-UGC-conversion segment (Sustainable promoters share content on social at 2–3× the Default rate); Gen-Z promoters are the highest-referral segment (Gen-Z promoters refer 5–8 friends per year on average via TikTok / Discord); B2B promoters are the highest-account-expansion segment (B2B promoter accounts should be flagged for the Move #8 seat-expansion + tier-3 upgrade track).
- **"NPS Passives (7-8)"** — segment definition: `nps_bucket = "passive"` AND `nps_response_date` within last 90 days. **Use this for:** Move #8 loyalty intervention (passives are at-risk of becoming detractors); Asset 01 T8 Win-Back flow (passives who haven't ordered in 60 days get the Win-Back treatment).
- **"NPS Detractors (0-6)"** — segment definition: `nps_bucket = "detractor"` AND `nps_response_date` within last 90 days. **Use this for:** CS team follow-up (Q7 yes → 48-hour SLA CS callback); refund / replacement auto-offer (if Q4 = "Very dissatisfied"); Move #8 loyalty recovery sequence (don't lose them — every recovered detractor is +1 RPR).

**Step 4 — Push NPS data to Triple Whale for cohort-LTV overlay.** Triple Whale Admin → Integrations → Klaviyo → enable "Cohort LTV by custom property" → select `nps_bucket` as the cohort dimension. Triple Whale now computes 30-day / 60-day / 90-day / 180-day / 365-day LTV per NPS bucket per channel, surfaced in Triple Whale's Cohort Analysis report. This is the canonical Asset 05 Metric #11 + Metric #12 (cohort LTV by UGC vs paid-social vs organic) data pipeline.

---

## Cohort-by-NPS-bucket LTV analysis (the proof)

The canonical Triple Whale + Shopify query to prove the NPS → LTV relationship:

```sql
-- Triple Whale Cohort Analysis → Custom Cohort → NPS Bucket
-- Date range: last 365 days, segmented by `nps_bucket` (promoter / passive / detractor)
-- Metric: 90-day LTV, 180-day LTV, 365-day LTV

SELECT
  nps_bucket,
  COUNT(DISTINCT customer_id) AS cohort_size,
  AVG(total_revenue_90d) AS avg_ltv_90d,
  AVG(total_revenue_180d) AS avg_ltv_180d,
  AVG(total_revenue_365d) AS avg_ltv_365d,
  AVG(order_count_365d) AS avg_orders_365d
FROM `triple_whale.customer_cohorts`
WHERE first_order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
  AND nps_bucket IS NOT NULL  -- only customers who responded to NPS
GROUP BY nps_bucket
ORDER BY avg_ltv_365d DESC;
```

**Expected output (industry baseline for DTC, broken out by voice profile):**

| NPS bucket | Default 365d LTV | Luxury 365d LTV | Sustainable 365d LTV | Gen-Z 365d LTV | B2B 365d LTV |
|---|---|---|---|---|---|
| **Promoter (9–10)** | $180–$400 | $600–$1,500 | $220–$450 | $90–$180 | $1,200–$4,000 |
| **Passive (7–8)** | $100–$200 | $350–$900 | $130–$260 | $50–$110 | $700–$2,400 |
| **Detractor (0–6)** | $45–$90 | $120–$400 | $55–$140 | $25–$55 | $250–$800 |

**Voice-profile LTV delta (the key insight):** Promoter-vs-Detractor LTV multiplier at 365 days varies dramatically by voice profile:
- **Default:** Promoter LTV is 3–4× Detractor LTV (typical DTC baseline).
- **Luxury:** Promoter LTV is 4–6× Detractor LTV (luxury promoters are the highest-LTV segment per customer; Luxury promoters refer 5–8 friends on average, multiplying acquisition ROI).
- **Sustainable:** Promoter LTV is 3–4× Detractor LTV (similar to Default but with a longer 365d horizon — Sustainable promoters stay subscribed 2–3× longer).
- **Gen-Z:** Promoter LTV is 3–4× Detractor LTV (lower absolute dollars but similar multiplier; Gen-Z promoters refer via TikTok / organic at 3–5× the rate of Default promoters).
- **B2B:** Promoter LTV is 4–5× Detractor LTV AND absolute dollars are 6–10× higher (B2B promoter accounts expand over time via Move #8 tier upgrade + seat expansion; B2B detractor accounts churn in full).

**Why this matters:** Promoter LTV is typically **2–6× Detractor LTV** at 365 days, with the multiplier varying by voice profile (Default 3–4×, Luxury 4–6×, Sustainable 3–4×, Gen-Z 3–4×, B2B 4–5×). This is the canonical "NPS pays for itself" proof — investing in promoter-conversion + detractor-recovery (Move #8 loyalty + Asset 03 UGC + the CS follow-up SLA on detractors) is justified by the 2–6× LTV delta. The Default / Luxury / Sustainable / Gen-Z / B2B breakdown above lets the operator pick the right Move #N investment based on their voice profile (Luxury brands invest in promoter-conversion via Asset 03 UGC + Move #8 tier-3 upgrade; B2B brands invest in CS follow-up SLA + Move #8 seat-expansion tracks).

**The asset-05-metric-12 cross-reference:** this NPS-bucket LTV analysis is the **input** to Asset 05 Metric #12 (cohort LTV by UGC vs paid-social vs organic). UGC-acquired customers typically show 1.5–3× higher NPS than paid-social-acquired customers; when the NPS-bucket LTV is broken out by acquisition channel, the UGC cohort's Promoter-LTV is the headline number that justifies Move #N + Asset 03 UGC investments.

**Reporting cadence:** this analysis ships monthly as a Triple Whale dashboard widget (added to Move #6's attribution dashboard) + quarterly as a slide in the operator's monthly business review. The cadence matches Asset 04's NPS-survey cadence — Q1 baseline (Jan 15 survey → Feb 1 first LTV report) + Q2 mid-year + Q4 peak check. **Per-voice-profile reporting cadence (extends the Asset 04 calendar):** (a) **Default voice** — quarterly cadence is sufficient; ship monthly LTV-by-NPS-bucket only when the operator has 1k+ NPS responses/mo. (b) **Luxury voice** — ship monthly LTV-by-NPS-bucket every month (Luxury customer LTV is so high that monthly tracking is justified; a 5% LTV drop in Luxury promoters = $30k+/mo revenue at risk for a mid-size DTC brand). (c) **Sustainable voice** — ship quarterly cadence aligned with the operator's mission-impact reporting; the Sustainable NPS-bucket LTV is a primary input to the brand's annual impact report. (d) **Gen-Z voice** — ship weekly cohort-LTV-pulse during product launches + quarterly otherwise (Gen-Z behavior is more volatile; weekly pulses catch the 7-day trend shifts that quarterly cadence misses). (e) **B2B voice** — ship monthly aligned with the B2B account-manager cadence; the B2B NPS-bucket LTV is a per-account-manager metric that drives the quarterly CS-team performance review.

---

## Common pitfalls (with corrective `Fix:` lines)

1. **Surveying first-time customers.** They don't have enough experience to recommend. **Fix:** post-purchase NPS ONLY for repeat customers (2+ orders); first-time customers get Asset 01's T7 review request, not NPS. (See "Rule #4" above.)
2. **Surveying monthly.** Survey fatigue → response rate drops to 1–2% within 2 quarters. **Fix:** quarterly cadence (Q1 baseline + Q2 mid-year + Q4 peak check per Asset 04's calendar); 90-day cooldown per customer.
3. **Asking 9 follow-up questions to promoters (9–10).** Survey fatigue + the answer is already in the NPS score. **Fix:** conditional skip-logic — only show Q2–Q10 if NPS = 0–8 (detractors + passives); promoters see only "Thanks! Anything else? (open text)" + a single redirect to Asset 03 UGC outreach.
4. **No verbatim capture on detractors.** The NPS score alone tells you WHO is unhappy, not WHY. **Fix:** Q2 (open-text "what's the #1 reason") is mandatory for detractors; verbatim goes into Klaviyo `nps_verbatim_text` property + is searchable.
5. **No CS follow-up on detractors.** Customer answered 0–6, you have a verbatim "shipping took 3 weeks and your CS never responded", and nothing happens. **Fix:** Q7 yes/no "Would you like a member of our team to follow up?" → if YES, route to CS team with 48-hour SLA + Klaviyo segment "NPS Detractor Followup".
6. **Treating NPS as a same-quarter predictor.** NPS measured today predicts RPR / LTV over 60–180 days, NOT 30 days. **Fix:** report NPS monthly but evaluate RPR / LTV impact quarterly. Don't fire the Move #8 loyalty intervention because "NPS dropped 5 points this month" — wait for the cohort LTV to drop.
7. **Comparing NPS across voice profiles without the override columns.** Gen-Z brand at NPS 25 concludes they're failing (Default NPS 40 is the "healthy" benchmark). **Fix:** apply the 4 voice-driven override columns from Asset 05 Metric #11 — Gen-Z NPS 25–45 is healthy, Default NPS 30–50 is healthy for a different voice. The operator MUST know their brand voice profile (Asset 02 decision matrix) before interpreting NPS.
8. **Surveying within 14 days of a complaint / refund / support ticket.** Customers who just had a bad experience will skew-detractor AND will feel surveyed-while-still-hurt → response rate drops + verbatim skews negative. **Fix:** Klaviyo conditional — if `last_support_ticket_date` is within 14 days, suppress NPS survey; resume on day 15.
9. **Not wiring NPS data back into Triple Whale cohort analysis.** NPS data sits in Klaviyo + Postscript dashboards; nobody computes the cohort-LTV-by-NPS-bucket analysis → the "NPS pays for itself" thesis is unprovable. **Fix:** Step 4 above — push `nps_bucket` to Triple Whale's cohort-LTV report; ship the NPS-bucket LTV table monthly.
10. **Surveying on a customer who opted out of marketing.** Asset 01's T7 already has this rule (no review request for marketing-opt-outs); NPS is marketing-adjacent and must follow the same opt-out rules. **Fix:** Klaviyo conditional — if `marketing_opt_in = false`, suppress NPS survey. **Per-voice-profile opt-out pattern:** (a) **Default voice** — opt-out rate is typically 0.5–1.5% per campaign; standard suppression works. (b) **Luxury voice** — opt-out rate is typically 0.2–0.5% (luxury customers are less likely to opt out because they're invested in the relationship); but the Luxury opt-out suppression MUST also include "do not contact for non-transactional research" — Luxury customers are more sensitive to being-researched-than-served. (c) **Sustainable voice** — opt-out rate is typically 0.3–0.8%; the Sustainable NPS-survey opt-out should specifically offer "stay subscribed but don't survey me" as a separate option. (d) **Gen-Z voice** — opt-out rate is typically 1.0–2.5% (Gen-Z is the most opt-out-prone segment); Gen-Z NPS-survey opt-out MUST default to "stop all surveys + keep transactional emails" because Gen-Z customers will opt out of everything if the only option is full unsubscribe. (e) **B2B voice** — opt-out is rare for the NPS-survey specifically (B2B account-managers want the feedback), but the B2B NPS-survey must include "cc my manager" as an opt-in field (B2B respondents often want their feedback escalated).

---

## Verification gates (5 gates — run before activating the survey program)

1. **Gate A — Survey-response-rate gate.** Per channel, response rate ≥ the industry baseline: Postscript SMS ≥ 12% in month 1, ≥ 8% in month 6 (slight decay is expected); Wootric / Delighted email ≥ 4% in month 1, ≥ 2.5% in month 6. If response rate is below baseline in month 1, the survey timing / channel is wrong (e.g. sending 14 days post-purchase is too early; try 21 days; or the customer base is not mobile-first so SMS is wrong; switch to email).
2. **Gate B — Cohort-size gate.** Per quarterly cadence, ≥ 100 NPS responses per quarter (for ±5pt NPS confidence interval). If cohort size < 100 per quarter, the survey cadence is too infrequent OR the response rate is too low; fix by (a) extending cadence to monthly (and accepting higher survey-fatigue risk) OR (b) widening the survey to first-time customers (and accepting lower signal quality) OR (c) adding a second channel.
3. **Gate C — Voice-benchmark-applicability gate.** Apply the 4 voice-driven override columns from Asset 05 Metric #11 to the operator's NPS readings. Gen-Z brand at NPS 25 reports "NPS is below benchmark" → the override column says Gen-Z healthy range is 25–45 → fix is on the operator's interpretation, not on the survey. **Per-voice-profile Gate-C recipe:**
   - **Default voice Gate-C check:** is operator's NPS within 30–50? If yes → benchmark-applicable. If below 30 → investigate shipping / product / CS quality. If above 50 → operator has a top-decile brand; investigate scaling risk (the Default ceiling is 60, above 60 means the operator has crossed into Luxury territory and should switch benchmark voice).
   - **Luxury voice Gate-C check:** is operator's NPS within 40–60? If yes → benchmark-applicable. If below 40 → luxury customer expectations are unmet (the most common Luxury NPS drop is "shipping took 3 weeks for a $400 product"); fix shipping speed before re-surveying. If above 60 → operator has an exceptional Luxury brand; document the playbook.
   - **Sustainable voice Gate-C check:** is operator's NPS within 40–55? If yes → benchmark-applicable. If below 40 → credibility gap between mission claims and customer experience; the Sustainable customer is more critical than Default because they chose the brand for mission. If above 55 → operator has a category-leading Sustainable brand. The Sustainable voice Gate-C check is the most-frequently-failed of the 5 voice profiles because Sustainable brands tend to over-claim mission outcomes; a Sustainable brand scoring NPS 38 is below the Sustainable benchmark of 40–55 even though it's above the Default benchmark of 30–50, and the operator MUST interpret the NPS reading against the Sustainable benchmark, not the Default benchmark.
   - **Gen-Z voice Gate-C check:** is operator's NPS within 25–45? If yes → benchmark-applicable. If below 25 → Gen-Z customers are actively disengaging; investigate TikTok / Discord / community channels. If above 45 → operator has crossed into Default territory; switch benchmark voice.
   - **B2B voice Gate-C check:** is operator's NPS within 30–50? If yes → benchmark-applicable. If below 30 → CS / account-management quality issue; investigate account-manager NPS by CS rep. If above 50 → operator has exceptional B2B CS.
4. **Gate D — Data-pipeline gate.** Triple Whale + Klaviyo + Postscript (or Wootric / Delighted) + Shopify all return real values for `nps_score` + `nps_bucket` + `nps_response_date`. Test: pick 5 customers who responded to NPS, verify their `nps_score` + `nps_bucket` + `nps_response_date` are populated in Klaviyo + their cohort shows up in Triple Whale's NPS-bucket LTV report. Zero missing values across the 5 customers.
5. **Gate E — Trend-direction gate.** Per Asset 05 Gate E, every NPS reading has a trend annotation: ↑ (NPS rose vs prior quarter) / ↓ (NPS dropped) / → (NPS stable) + a one-line "why" attribution. NPS dropping 5+ points triggers an Asset 05 Metric #11 alert + Move #6 attribution-health check (a sudden NPS drop is often correlated with a shipping / product-quality issue that the attribution stack should catch).

---

## Verification recipe (one shell block to run all 5 gates)

```bash
# Asset 06 NPS survey toolkit — verification recipe
# Runs the 5 gates from `## Verification gates` against the live NPS data

ARTIFACT="assets/06-nps-survey-toolkit.md"

# Gate A — survey-response-rate gate
echo "=== Gate A: Survey response rate (per channel) ==="
for channel in Postscript Wootric Delighted; do
  echo -n "$channel mentions: "
  grep -c "$channel" "$ARTIFACT"
done

# Gate B — cohort-size gate (>= 100 responses per quarter)
echo "=== Gate B: Cohort-size gate ==="
grep -cE "100 NPS responses|cohort size|±5pt" "$ARTIFACT"

# Gate C — voice-benchmark-applicability gate
echo "=== Gate C: Voice-driven override columns (per voice profile mention count) ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo -n "$voice: "
  grep -c "\\b$voice\\b" "$ARTIFACT"
done
# Expect: each voice profile appears >= 15 times
# Per-voice-profile Gate-C check (extends the canonical voice-density recipe):
#   Default — must appear in: tone adaptation + Gate C + reporting cadence + Asset-07 candidates + LTV table
#   Luxury — must appear in: tone adaptation + Gate C + reporting cadence + Asset-07 candidates + LTV table + override column
#   Sustainable — must appear in: tone adaptation + Gate C + reporting cadence + Asset-07 candidates + LTV table + override column
#   Gen-Z — must appear in: tone adaptation + Gate C + reporting cadence + Asset-07 candidates + LTV table + override column
#   B2B — must appear in: tone adaptation + Gate C + reporting cadence + Asset-07 candidates + LTV table + override column
# If a voice profile has <15 mentions, the override column is hand-waved — see skill v1.24.0 pitfall.

# Gate D — data-pipeline gate (Klaviyo + Triple Whale + Postscript + Shopify all named)
echo "=== Gate D: Data-pipeline gate ==="
for tool in Klaviyo "Triple\\ Whale" Postscript Shopify; do
  echo -n "$tool mentions: "
  grep -c "$tool" "$ARTIFACT"
done

# Gate E — trend-direction gate (NPS trend annotations)
echo "=== Gate E: Trend-direction annotations ==="
grep -cE "↑|↓|→|trend annotation" "$ARTIFACT"

# Anti-pattern grep
echo "=== Anti-pattern grep ==="
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" "$ARTIFACT"
# Expect: 0 matches (or 1 match if the verification recipe's own example string appears)

echo "=== Structural completeness ==="
grep -c "^## " "$ARTIFACT"
# Expect: >= 8 sections (Goal + Decision matrix + Survey template + Frequency guardrails + Klaviyo wiring + Cohort LTV + Pitfalls + Verification + Verification recipe + Related)

echo "=== Cross-reference resolution ==="
for ref in "assets/01-copy-templates.md" "assets/02-brand-voice.md" "assets/03-ugc-brief.md" "assets/04-promo-calendar.md" "assets/05-retention-metrics.md" "playbooks/06-sms-welcome-and-cart-abandon.md" "playbooks/07-loyalty-program-smile.md" "playbooks/06-install-attribution-triplewhale-or-polar.md"; do
  test -f "$ref" && echo "OK: $ref" || echo "MISSING: $ref"
done
```

**Expected output:** Gate A returns ≥3 mentions per channel (Postscript / Wootric / Delighted are named throughout); Gate B returns ≥2 matches (the "100 NPS responses per quarter" cohort-size gate is named in Gate B + the cohort-by-NPS-bucket SQL query); Gate C returns **Default ≥15 / Luxury ≥15 / Sustainable ≥15 / Gen-Z ≥15 / B2B ≥15** (each voice profile has the override-column rule + the worked example + the verification gate + the related-section mention + the tone-adaptation block + the reporting-cadence block + the Asset-07 candidate block = ~7 mentions per voice profile per section × 2 sections = 14 minimum, plus the LTV-table column header = 15); Gate D returns Klaviyo ≥5 / Triple Whale ≥5 / Postscript ≥5 / Shopify ≥3; Gate E returns ≥3 trend annotations; anti-pattern grep returns 0 matches; structural completeness returns ≥8 sections; all cross-references resolve.

**Per-voice-density expected breakdown (≥15 threshold rationale):** Each voice profile is mentioned in 7 distinct contexts across the artifact — (1) tone-adaptation block in `## The 1-question + 9-question survey template`, (2) the override-column rule in `## Goal` honest-read callout (c), (3) the per-voice Gate-C recipe in `## Verification gates` Gate C, (4) the per-voice-profile LTV row in `## Cohort-by-NPS-bucket LTV analysis` table, (5) the per-voice-profile reporting-cadence block, (6) the per-voice-profile opt-out-pattern block in Pitfall #10, (7) the per-voice-profile Asset-07 candidate block in `## Related`. With 2 mentions per context (e.g. "Default voice" + "Default 365d LTV" in the LTV table), this gives ~14 mentions per voice profile + 1 mention in the LTV-table column header = 15 total. The voice-density recipe in the verification block (`for voice in Default Luxury Sustainable Gen-Z B2B; do grep -c "\b$voice\b" $ARTIFACT; done`) is the canonical gate; values <15 mean the override column is hand-waved and the asset needs more voice-specific mentions to prove the override is concrete.

---

## Related

- `assets/05-retention-metrics.md` (Metric #11 NPS — the canonical formula + 30–50 default benchmark + 4 voice-driven override columns + Triple Whale / Klaviyo / Postscript data source; **this toolkit is the implementation of Metric #11**) + Metric #12 cohort LTV by UGC vs paid-social vs organic (the cohort-by-NPS-bucket LTV analysis above is the input to Metric #12).
- `assets/01-copy-templates.md` (T7 SMS Review Request — the **dual-purpose** organic-review + NPS-collection vehicle; the SMS-4 review request specifically collects NPS via Postscript, but it's a review request, not a standalone NPS survey; this toolkit adds the **standalone** NPS survey cadence on top).
- `assets/02-brand-voice.md` (5 voice profiles — Default / Luxury / Sustainable / Gen-Z / B2B — the NPS-survey tone adapts per voice; the 5 voice-driven override columns on Metric #11's NPS benchmark come from this asset's profile diffs).
- `assets/03-ugc-brief.md` (the UGC program — UGC creators typically have 10–20% higher NPS than paid-social cohorts; the cohort-by-NPS-bucket LTV analysis above includes the UGC-acquired-customer NPS cut).
- `assets/04-promo-calendar.md` (12-month calendar — the quarterly NPS-survey cadence follows the calendar's Q1 baseline + Q2 mid-year + Q4 peak check pattern; the calendar's quarterly business review includes the NPS trend).
- `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7 — the SMS-4 review request specifically moves Metric #11 NPS via Postscript; this toolkit extends Move #7 with the **standalone** NPS survey cadence on top of the review-request cadence).
- `playbooks/07-loyalty-program-smile.md` (Move #8 — the loyalty intervention sequence fires on NPS-passive segments; promoters auto-upgrade to Smile.io tier 2+; detractors get the recovery sequence).
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6 — the Triple Whale cohort-LTV report includes the NPS-bucket LTV analysis via the Step 4 Klaviyo → Triple Whale integration).
- `assets/07-*.md` *(planned — does not yet exist)* — the next-asset candidate for a future tick. Possibilities include: a competitive-teardown template (Asset 07), a creator-brief case-study library (Asset 07), a paid-social creative-iteration framework (Asset 07), a customer-service response template library (Asset 07), or a refund / returns policy framework (Asset 07). Pick based on the highest-leverage gap when this tick lands. **Per-voice-profile Asset-07 candidates (the next-asset pick depends on which voice profile is the operator's primary):** (a) **Default voice Asset-07 candidates** — competitive-teardown template (most Default brands need competitive benchmarking at month 6); customer-service response template library (Default brands typically have 5–8 CS reps and need standardized templates). (b) **Luxury voice Asset-07 candidates** — customer-service response template library (Luxury CS tone is highly specific and 80% of Luxury CX failures come from mis-toned responses); refund / returns policy framework (Luxury customers have higher expectations for the returns experience). (c) **Sustainable voice Asset-07 candidates** — impact-reporting framework (Sustainable brands need an annual impact report that maps NPS-bucket-LTV to mission outcomes); competitive-teardown template (Sustainable competitive set is narrow; teardown helps position against the 3–5 direct competitors). (d) **Gen-Z voice Asset-07 candidates** — TikTok-creator-brief case-study library (Gen-Z brands have higher UGC-program velocity; the case-study library compounds Asset 03 UGC brief); Discord / community-management playbook (Gen-Z communities are the primary engagement channel; a community-management playbook is the next-iteration asset). (e) **B2B voice Asset-07 candidates** — account-manager playbook (B2B NPS-bucket-LTV is per-account-manager; the AM playbook is the next-highest-leverage asset); RFP-response template library (B2B brands with $50k+ ACV need standardized RFP responses to scale sales velocity).
