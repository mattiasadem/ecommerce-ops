---
name: welcome-series
title: Welcome series (email + SMS)
category: retention
tier: 1
priority: P0
default_move: 4
year_1_roi_band: "20:1–50:1"
sms_friendly: true
last_updated: 2026-07-10
sources: [klaviyo 2024, postscript 2024, omnisend 2024, campaign-monitor 2024, litmus 2024, salesforce 2024, smile 2024, triple-whale 2024]
---

# Welcome series (email + SMS)

> The first 7 days of a new subscriber determine their lifetime value. A 5-email + 2-SMS welcome flow lifts 90-day LTV 10–20% and turns a passive signup list into an active buyer list at 20:1–50:1 year-1 ROI. Ship this before any other lifecycle flow beyond cart-recovery.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce) store
- An email tool (Klaviyo, Brevo, Mailchimp, Omnisend)
- An SMS tool (Postscript, Attentive, Klaviyo SMS)
- A signup form / popup that captures email + (ideally) phone
- At least 100 new signups/month

You do NOT have:
- A welcome series at all (most common DTC gap — you have a list but no onboarding)
- A multi-touch welcome (1 generic "thanks for signing up" email is leaving 60–80% of LTV on the table)
- An SMS welcome (only 30% of DTC brands run one — that's the green-field)
- A discount-vs-storyline split (some products sell better with an incentive, others with a brand story)

## What "best in class" looks like

Reference: Athletic Greens, Glossier, Allbirds, Loom, Bombas, Dr. Squatch, Cuts Clothing.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Email count | 5 emails over 7 days | 1 generic "thanks" | 7 emails over 14 days |
| Email #1 timing | Immediate (1–5 min) | 1 hour | 0 min (real-time trigger) |
| Email #1 subject | "Welcome to [BRAND] — your [GIFT/DISCOUNT] inside" | "Thanks for signing up" | first-name + product teaser |
| Email #2 timing | Day 2 | Day 3 | Day 1 |
| Email #2 content | Brand story / founder note | Product catalog | Customer reviews |
| Email #3 timing | Day 4 | Day 5 | Day 3 |
| Email #3 content | Best-sellers + social proof | "Shop now" | UGC carousel |
| Email #4 timing | Day 6 | Day 7 | Day 5 |
| Email #4 content | Incentive (10–15% off first order) | None | Free shipping |
| Email #5 timing | Day 7 | Day 10 | Day 6 |
| Email #5 content | "Which one are you?" quiz / personalization | Generic catalog | 1:1 product match |
| SMS #1 timing | Immediate (with email #1) | 1 hour | 0 min |
| SMS #1 copy | <160 chars, value-prop + 1 CTA | Generic "thanks" | Welcome discount + URL |
| SMS #2 timing | Day 3 | Day 7 | Day 2 |
| SMS #2 content | Best-seller showcase OR incentive | None | Customer-story short |
| Discount | 10–15% off first order, 48h expiry | None | Tiered by signup source |
| Sunset | 7 days no-open → exit to newsletter | None | Per-engagement tier |
| Suppression | Already-converted, unsubscribed, SMS consent = false | None | Frequency cap from signup source |

## Welcome conversion benchmarks (2024–25)

| Setup | 7-day conversion | 30-day conversion | Net revenue / $1 sent |
|---|---|---|---|
| 1 generic "thanks" email, no SMS | 1–2% | 2–4% | 8:1–15:1 |
| 3 emails, 1 incentive, no SMS | 3–5% | 5–10% | 18:1–30:1 |
| 5 emails, 1 incentive, 1 SMS | 5–8% | 10–15% | 25:1–45:1 |
| 5 emails + 2 SMS + brand story + UGC | 8–12% | 15–22% | 30:1–60:1 |
| 7 emails + 3 SMS + personalization quiz | 10–15% | 18–25% | 40:1–80:1 |

**Median DTC gets 3% 7-day conversion at 18:1. Best in class gets 10%+ at 40:1+.**

The welcome series is the **#1 LTV-lifting flow in DTC** — Klaviyo's 2024 benchmark report shows welcome series revenue per recipient is **3–5× higher** than any other automated flow because you reach subscribers at peak intent (they just raised their hand).

## The build (6–10 hours for a competent operator)

### Step 1 — Trigger setup
- Klaviyo: `Subscribed to List` (default) or custom `Newsletter Signup` metric
- Postscript: `Subscribed to SMS` keyword trigger (e.g. text "JOIN" to shortcode)
- **Critical:** use double opt-in for SMS (TCPA + GDPR), single opt-in acceptable for email
- Verify the trigger fires: subscribe test profile, confirm email lands in 5 min

### Step 2 — Build the 5-email flow

1. **Email 1 — "Welcome" (immediate, 1–5 min)**
   - Subject: "Welcome to [BRAND] — your [10% off / gift / story] inside"
   - From: founder or named person, not "no-reply@"
   - 1 image (hero shot of best-seller)
   - 1-line brand promise
   - Single CTA → shop / claim offer
   - Plain-text variant required (Gmail strips HTML for some clients)

2. **Email 2 — "Our story" (Day 2)**
   - Subject: "Why we started [BRAND]" or "Meet the founder"
   - 200–300 word founder/brand story
   - 1 product image showing the origin
   - Single CTA → shop best-sellers

3. **Email 3 — "Why customers love us" (Day 4)**
   - Subject: "[N] reasons [BRAND] has [RATING] reviews"
   - 3 customer reviews / UGC snippets
   - Best-sellers row (3–4 products)
   - CTA → shop best-sellers

4. **Email 4 — "Here's 10% off" (Day 6)**
   - Subject: "Your first-order gift — 10% off, expires in 48h"
   - Discount code (auto-applied at checkout)
   - 1 product image
   - Strong CTA → shop with discount applied
   - **Critical:** the discount expires in 48h, not forever (cannibalization guard)

5. **Email 5 — "Which one is right for you?" (Day 7)**
   - Subject: "Help us find your [PERFECT PRODUCT]"
   - 3-question quiz OR a "browse by [concern/use-case]" grid
   - Personalized product recommendations (Klaviyo product feed)
   - Single CTA → personalized landing page

### Step 3 — Add SMS

- **SMS 1 (immediate, with email #1):** "[BRAND]: Welcome! Here's 10% off your first order → [URL]. Text STOP to opt out."
- 160 chars max
- **Critical:** include STOP instruction (TCPA legal requirement)
- **Frequency cap:** 2 SMS in the welcome series is the max; if user converts, suppress further SMS from the welcome flow

- **SMS 2 (Day 3):** "[BRAND]: Meet our #1 best-seller — [PRODUCT] loved by 10,000+ customers → [URL]"
- 160 chars max
- Skip if user already converted (Placed Order event)

### Step 4 — Discount strategy (the most-asked question)

| Product type | Discount | Expiry | Notes |
|---|---|---|---|
| Consumables (skincare, supplements, food) | 10–15% | 48h | High repeat rate, small first-order discount OK |
| Premium / luxury (jewelry, leather, design) | Free shipping OR 5% | 72h | Don't erode margin, lead with brand |
| Subscription products | 20–30% first box | 7 days | Higher barrier to start subscription |
| Apparel | 10% | 48h | Return-rate sensitive, don't over-discount |
| High-AOV ($200+) | Free shipping OR gift with purchase | 72h | Margin is tight, no straight % |
| New customer only (acquisition-heavy) | 15–20% | 24h | Aggressive for first-purchase conversion |

**Default rule:** 10% off, 48h expiry, single-use code, NOT stackable with other discounts. Anything more is a margin leak.

### Step 5 — Suppress + sunset
- Suppress: `Placed Order` (zero value) — they converted, drop out of welcome
- Suppress: SMS consent = false (don't SMS)
- Suppress: unsubscribed (mandatory)
- Sunset branch: 7 days in flow + no email open + no SMS click → exit to general newsletter
- Sunset branch: 14 days in flow + no purchase → move to winback / discount-absconder segment

### Step 6 — Measure
- Track: signups, email open rate, email click rate, SMS click rate, conversions, revenue per signup, $/send
- Set up Klaviyo flow performance email (weekly)
- Cross-reference with Triple Whale for true incremental revenue (welcome series often gets credited for organic conversions that would have happened anyway)
- Set up cohort: `signup + welcome_open` vs `signup + welcome_ignore` → 30/60/90 day LTV delta

## Common pitfalls (15 from real builds)

1. **Sending the discount in email #1** — trains subscribers to wait for the next discount; brand-story emails should go first
2. **Generic "thanks for signing up" copy** — invisible; "Welcome to [BRAND] — here's what's inside" lifts open rate 40%
3. **No from-name** — "noreply@brand.com" goes to spam; use "Sarah from [BRAND]"
4. **Single opt-in for SMS** — TCPA + GDPR violation, $500+ per message fines
5. **No STOP in SMS** — required by law; missing STOP = fine
6. **No suppression on placed orders** — sends welcome email to people who just bought
7. **Discount code never expires** — cannibalizes full-price revenue forever
8. **Same discount to all signups** — high-LTV-traffic signups get the same 10% as low-LTV popups; tier it
9. **SMS to non-consented profiles** — TCPA + GDPR; only send to explicit opt-in
10. **No frequency cap on SMS** — same customer gets 4 SMS / week → unsubscribes
11. **Time-zone naive send times** — 1pm UTC = 8am EST = 5am PST; segment by timezone
12. **No A/B test on subject** — even one variant per email lifts open rate 5–10%
13. **Discount stacks with welcome series** — double-discounting trains discount addiction
14. **Send rate too high on launch day** — Gmail throttles 1k+ emails / minute; stagger over 1–2 hours
15. **Ignoring mobile rendering** — 70%+ of welcome emails open on mobile; preview in Gmail iOS first
16. **Treating signup and post-purchase as one flow** — they have different intent; build a separate post-purchase welcome (Move #5b in research/05)
17. **Not measuring incremental LTV** — credit goes to last-click; Triple Whale cohort merge is required to prove real lift

## Verification (this skill is "shipped" when...)

- [ ] Trigger fires on test signup within 5 min
- [ ] Email #1 lands in inbox within 1 hour of signup
- [ ] All 5 emails land in inbox within 7 days
- [ ] SMS #1 lands within 5 min of signup (if SMS enabled)
- [ ] SMS contains STOP instruction (TCPA)
- [ ] Placed-order profile does NOT receive the flow after conversion
- [ ] Discount code expires in 48h and applies at checkout
- [ ] 7-day conversion rate ≥ 4% on first 100 signups
- [ ] $/send ratio ≥ 20:1 in the first month
- [ ] Welcome flow revenue per recipient ≥ $1.50 (DTC median per Klaviyo 2024)
- [ ] 90-day LTV of welcome-openers ≥ 1.3× non-openers (proves incremental value)

## How to extend this skill

Once the basic welcome is live:
- **Add browse-abandonment series** for subscribers who opened emails but never visited product pages
- **Add post-purchase welcome (Move #5b)** — a different 3-email flow triggered by `Placed Order` (welcoming buyers, not just signups)
- **Add a "winback" series for 30/60/90 day lapsed subscribers** — the second-highest LTV lift in the lifecycle library
- **Add a birthday / anniversary flow** — requires birthdate capture at signup (move the field to the top of the form)
- **Add a referral program kickoff email** — once loyalty is wired (Move #8)
- **Test a 7-email / 3-SMS variant** for high-AOV / luxury brands where story matters more than speed

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1)
- Companion skill: `post-purchase-upsell` (Move #2)
- Companion skill: `sms-orchestration` (Move #7)
- Companion skill: `loyalty-program` (Move #8)
- Research doc: `/research/05-lifecycle-marketing.md`
- Research doc: `/research/02-top-10-leverage-moves.md`

## Sources

- Klaviyo, "Welcome series benchmarks 2024" (revenue per recipient, 7-day conversion)
- Klaviyo, "Email + SMS Benchmarks 2024"
- Postscript, "SMS welcome flow data 2024"
- Omnisend, "Welcome email report 2024" (open + click + conversion rates by industry)
- Campaign Monitor, "Welcome email open rate benchmarks 2024" (50%+ open rate floor)
- Litmus, "Email engagement benchmarks 2024" (mobile vs desktop, deliverability)
- Salesforce, "State of commerce 2024"
- Smile.io, "Loyalty + welcome series 2024" (LTV delta between engaged vs unengaged subscribers)
- Triple Whale, "Welcome flow attribution 2024" (incremental LTV methodology)
- Baymard, "First-impression email design 2024" (UX, layout, CTA placement)
