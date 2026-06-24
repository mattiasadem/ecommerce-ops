# Playbook 04 — Welcome Series (Klaviyo Email + Optional SMS)

> **Move #4 from `research/02-top-10-leverage-moves.md`.** Sets up a 5-email (plus optional 1-SMS) welcome flow that converts new opt-ins into first-time buyers. Onboards subscribers, conditions them to buy, lifts 90-day LTV 10–20%, and unlocks every downstream flow (abandoned cart, post-purchase, win-back). Default inputs: 1,000 opt-ins/mo, 3% first-purchase CVR, $75 AOV, 70% margin, $0.0005/email, 5 emails, 1 SMS @ 30% opt-in → **252:1 net margin per $1 of send cost** (top-tier band).
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §3 (retention stack), `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript pricing), `research/02-top-10-leverage-moves.md` #4.
>
> **Companion script:** `scripts/welcome_series_roi.py` (and `scripts/tests/test_welcome_series_roi.py` — 44 tests) — run it before turning the series on to sanity-check your inputs.
>
> **Time to ship:** 6–10 hours for a small brand. This playbook is paste-ready — every step is a concrete action with a value, a command, or a decision point.

---

## Goal

Build a 5-email + 1-SMS welcome series in Klaviyo + Postscript that:

- Triggers within **5 minutes** of newsletter signup (or quiz completion, popup, content download)
- Converts **2–5% of opt-ins to first purchase within 14 days** (industry baseline; top-quartile brands hit 5–10%)
- Generates **net margin per opt-in ≥ $1.00** after send cost and welcome-discount cost (default case: $1.35)
- Produces **breakeven CVR ≤ 0.05%** — i.e. even at catastrophic CVR the flow covers its own send cost
- Segments by **opt-in source** (popup vs quiz vs footer vs checkout) so subject lines + first email differ
- Suppresses **already-customers** automatically (no welcome discount sent to a 2nd-order subscriber)
- Sets the foundation for every downstream flow (abandoned cart, post-purchase, win-back, browse abandonment)

---

## Prerequisites

- [ ] **Klaviyo account** on a paid plan (free tier caps at 250 contacts and disables flows; welcome series needs ≥500 contacts to be worth building). Budget: **$45–$300/mo** at $0–$1M GMV.
- [ ] **Postscript account** for SMS welcome. Budget: **$0/mo + $0.007–$0.015/SMS + ~$0.004 US carrier fee**. SMS-1 is optional but typically lifts opt-in→purchase CVR by 20–40% on top of email-only.
- [ ] **Shopify store connected to Klaviyo** (Settings → Integrations → Shopify). The **"Subscribed to Email Marketing"** and **"Placed Order"** metrics must show **≥ 1 event in the last 7 days** in Klaviyo → Analytics → Metrics.
- [ ] **At least one opt-in source** live (popup, embedded form, quiz, footer, checkout). Klaviyo's signup forms OR Justuno OR Octane AI. Each opt-in source becomes a segment property used in Email 1 personalization.
- [ ] **TCPA + GDPR compliance**: customers must have explicitly opted into SMS. Add a checkbox at email signup ("Send me SMS order updates — msg & data rates may apply") with consent language. Email flows only need implied consent (US CAN-SPAM), but **include a one-click unsubscribe** in every email.
- [ ] **Brand voice doc** (even a one-pager). Subject lines and SMS copy below assume you have a primary voice — confident + plain + lightly irreverent is the default; if your brand is luxury/formal, adapt the templates.
- [ ] **Welcome discount code reserved** in Shopify. **Default: 10% off first order**, single-use, expires in 7 days, suppressed for repeat use. Use Klaviyo's "unique code" feature. NEVER use a sitewide code — that destroys margin.
- [ ] **Sender domain authenticated** (SPF + DKIM + DMARC). Klaviyo walks you through this in Settings → Domains. Without it, Gmail + Yahoo will route you to spam.

---

## Step-by-step

### Step 1 — Wire the trigger and segments

In Klaviyo:

1. **Flows → Create flow → "Welcome Series"** → pick the **"Welcome Email Series"** template (5-email) OR build from scratch.
2. **Trigger filter**: `What someone has done → Subscribed to Email Marketing → zero times → since starting this flow` (the implicit trigger of the Welcome flow itself).
3. **Trigger filter**: `What someone has done → Placed Order → zero times → since starting this flow` (suppresses existing customers — they should not get a "first order 10% off" email).
4. **Profile filter**: `Profile → Consent → Marketing → Email = subscribed`.
5. **Save trigger** as "Welcome — Main — Email Subscribed (US/CA)". Localize per region if you ship internationally.
6. **Create segments** for the 4 most common opt-in sources. In Klaviyo → Lists & Segments:
   - `Opt-in Source = Popup (Exit Intent)` → assign as `property: signup_source`
   - `Opt-in Source = Quiz Result` (e.g. "skincare-routine")
   - `Opt-in Source = Footer`
   - `Opt-in Source = Checkout`
   The first email subject line + body varies by source; the rest of the series is identical.

### Step 2 — Email 1: the immediate welcome (sent 5 min after signup)

**Goal:** confirm + set expectations + deliver the lead magnet (or value). **No discount yet** — that comes in Email 3 once they've engaged.

- **Send time:** 5 minutes after `Subscribed to Email Marketing`.
- **From name:** `<Your Brand>` (brand from-name gets 10–20% higher open than a person).
- **Subject line A/B test** (Klaviyo AI picks winner after ~500 sends per variant):
  - `Welcome — here's your 10% off`
  - `<First name>, you're in`
  - `Welcome to <Brand>` (simple, high-open for first-time subscribers)
- **Preview text:** `<Lead magnet promise> · 10% off your first order inside`
- **Body** (single column, mobile-first):
  - 1 sentence: thank them for signing up
  - 1 sentence: what to expect from emails ("~2 per week, easy to unsubscribe, never spam")
  - **Lead magnet delivery** if applicable (PDF download link, discount code, quiz results)
  - 2–3 trust signals: review snippet, return policy, free shipping note
  - 1 CTA: "Browse our bestsellers →"
- **Discount code**: include the 10% off code IN this email (set expiry = 7 days from send). Reasoning: most subscribers never open email 2 if they didn't see the code in email 1. Better to show the code once with a real expiry than to drip it across multiple emails.
- **Footer:** physical address (CAN-SPAM), unsubscribe, view-in-browser.

### Step 3 — Email 2: the brand story (Day 2)

**Goal:** humanize the brand, build emotional resonance. **No CTA to buy** — only CTA is to read or watch.

- **Send time:** 2 days after signup.
- **Trigger filter between emails:** `Placed Order → zero times → since starting this flow` (otherwise skip the rest).
- **Subject line A/B test**:
  - `Why we started <Brand>`
  - `The story behind <Brand> (1 min read)`
  - `<Founder name> here — quick hello`
- **Body:**
  - Founder photo + 1-paragraph origin story
  - 1 photo of the workshop / studio / sourcing trip
  - 1 CTA: "See how it's made →" (links to an About page or video)
- **No discount.** No "shop now" CTA. The point is brand affinity.

### Step 4 — Email 3: the social-proof + bestsellers (Day 4)

**Goal:** show what others love, nudge toward first purchase.

- **Send time:** 4 days after signup.
- **Trigger filter:** `Placed Order → zero times → since starting this flow`.
- **Subject line A/B test**:
  - `<X> customers' top picks this month`
  - `What people are buying right now`
  - `Real reviews from real <product category> owners`
- **Body:**
  - 3 bestseller cards (Klaviyo's dynamic "Featured Product" block — link to your top 3 by 30-day revenue)
  - Each card: image, name, price, 1-line review snippet, "Shop now →"
  - **5-star review strip** below: aggregate rating + count + 2 customer quotes
  - **Discount reminder** at the bottom: "Your 10% off code is still valid — expires in 3 days"
- **No CTA push** — let the bestseller cards do the work.

### Step 5 — Email 4: the objection-handler (Day 7)

**Goal:** address the top 3 reasons people don't buy (shipping cost, returns, fit/quality). **No discount** — this email works best WITHOUT a discount because the objections are about trust, not price.

- **Send time:** 7 days after signup.
- **Trigger filter:** `Placed Order → zero times → since starting this flow`.
- **Subject line A/B test**:
  - `3 questions you might have`
  - `Shipping, returns, sizing — answered`
  - `<First name>, got questions?`
- **Body:**
  - 3 short sections, each ~50 words:
    - **Shipping**: cost, threshold, delivery time, carrier
    - **Returns**: window, process, refund time
    - **Sizing/quality**: link to size guide + material specs
  - 3 icons (use Klaviyo's icon block)
  - 1 CTA: "Still thinking it over? Browse our bestsellers →"
  - **Discount reminder** (gentle): "By the way, your 10% off code expires tomorrow"
- **No hard sell.** Objection-handling emails convert at 3–5x the rate of generic "shop now" emails.

### Step 6 — Email 5: the last-chance (Day 10)

**Goal:** last-call conversion. **Final reminder of the discount + a tasteful urgency frame**.

- **Send time:** 10 days after signup. 14 days for high-consideration buyers (>$200 AOV).
- **Trigger filter:** `Placed Order → zero times → since starting this flow`.
- **Subject line:**
  - `Last day: your 10% off expires tonight`
  - `<First name>, your code expires at midnight`
  - `Don't let 10% off go to waste`
- **Body:**
  - 1 line: "Your 10% off code expires at midnight (Pacific time)"
  - 1 paragraph: the discount is being retired, this is the last email about it
  - 3 bestseller cards (same as Email 3 — repeat exposure)
  - 1 CTA: "Use your 10% off now →"
  - **DO NOT include a "remind me tomorrow" link** — that's a tell that the urgency is fake and breaks trust
- **Footer:** standard.

### Step 7 — Add the SMS welcome (Postscript)

Postscript integrates bidirectionally with Klaviyo. Add **one SMS** inside the same Klaviyo flow:

- **Send time:** 30 minutes after `Subscribed to Email Marketing` (i.e. between Email 1's send and Email 2's send on Day 2). SMS lands while Email 1 is still in the inbox.
- **Trigger filter:** `Profile.SMS Consent = TRUE` (default: skip if not opted in).
- **Sender:** your brand name (Postscript registers this for you).
- **Body (160 chars max, no link in SMS 1):**
  - `Hey <First name> — welcome to <Brand>! Your 10% off code is in your inbox. Reply STOP to opt out.`
- **Compliance:** include "Reply STOP" in every SMS, even if Postscript adds it automatically. Twilio's A2P 10DLC registration is required for US SMS — Postscript handles this for you at signup.

### Step 8 — Set up suppression and sunset rules

Without suppression, the welcome series will keep firing for subscribers who joined months ago. Two layers:

1. **Internal suppression** (already in the trigger filters above): `Placed Order → zero times → since starting this flow` prevents every email from firing once they buy. Klaviyo's "smart sending" also throttles to 1 email per 16 hours.
2. **Sunset / win-back branch** (add AFTER email 5): for subscribers who reached the end of the welcome without buying, route them into a separate "Win-back (60 days inactive)" flow that fires 60 days later. Do NOT keep them in the welcome series — they're not new anymore.
3. **Global unsubscribe suppression**: Klaviyo's `Profile → Consent → Marketing → Email = unsubscribed` filter is implicit in every flow. Confirm by sending a test email to an unsubscribed address; you should get a hard bounce.
4. **List-cleaning**: every 90 days, run a Klaviyo segment for `Last Email Open → zero times → in last 180 days` and suppress them from the welcome series (they didn't open email 1, they won't open email 5 — and they're costing you deliverability). These go to a re-engagement campaign, not the welcome flow.

### Step 9 — Set up A/B tests

Every email's subject line and one body element should be A/B tested. Klaviyo's flow A/B testing runs the variants to 50/50 of new entrants and picks a winner after ~500 sends per variant (or 2 weeks, whichever is first).

Recommended A/B test matrix (one variant per email — don't test too many things at once):

| Email | Variable to test | Variant A (control) | Variant B |
|---|---|---|---|
| 1 | Subject line | `Welcome — here's your 10% off` | `<First name>, you're in` |
| 2 | CTA | `See how it's made →` | `Read our story →` |
| 3 | Bestseller selection | Top 3 by 30-day revenue | Top 3 by 30-day margin |
| 4 | Objection framing | "3 questions you might have" | "Quick answers to your top 3 questions" |
| 5 | Urgency framing | "Last day: your 10% off expires tonight" | "<First name>, your code expires at midnight" |

Pick winners after 500 sends per variant; promote the winner to 100% of new subscribers.

### Step 10 — Wire to attribution (Triple Whale / Polar)

If you have Triple Whale or Polar installed (Move #6), every welcome email click should pass a `flow_id=welcome_series&email_id=1` parameter so attribution flows correctly.

- In Klaviyo's email template editor, click the CTA button → "Link" → append `?utm_source=klaviyo&utm_medium=email&utm_campaign=welcome_series&utm_content=email_<N>`.
- In Triple Whale → Settings → Postscript/UEM Integrations → confirm Klaviyo is mapped to "Email" channel.
- This takes 10 minutes and unlocks per-email revenue attribution across the entire welcome series.

---

## Metrics to track

| Metric | Where to find it | Target (good / great) |
|---|---|---|
| **Opt-in → first-purchase CVR (14 days)** | Klaviyo → Analytics → Flows → Welcome Series → "Placed Order" conversion | 2–3% / 5–10% |
| **Welcome revenue / month** | Klaviyo → Analytics → Flows → Welcome Series → "Revenue per recipient" | $1.00 / $2.00+ |
| **Welcome open rate (email 1)** | Klaviyo → Flow Analytics → Email 1 → "Open rate" | 55–65% / 70%+ |
| **Welcome click rate (email 1)** | Klaviyo → Flow Analytics → Email 1 → "Click rate" | 8–12% / 15%+ |
| **Welcome unsubscribe rate (whole series)** | Klaviyo → Flow Analytics → "Unsubscribe rate" | <0.5% / <0.2% |
| **Spam complaint rate** | Klaviyo → Deliverability → "Spam complaints" | <0.02% / <0.01% |
| **Net margin per opt-in** | `scripts/welcome_series_roi.py` | ≥$1.00 / ≥$1.50 |
| **Breakeven CVR** | `scripts/welcome_series_roi.py` | <0.05% / <0.02% |
| **Time-to-first-purchase** | Klaviyo → Flow Analytics → "Time to conversion" | <7 days / <5 days |
| **SMS opt-in rate at signup** | Postscript → Analytics → "New subscribers" | 20–35% / 40%+ |
| **Welcome SMS click rate** | Postscript → Analytics → "Click rate" | 15–25% / 30%+ |

Check these **weekly for the first month**, then monthly. Set a Klaviyo dashboard saved view for "Welcome Series" so you can monitor at a glance.

---

## Common pitfalls

1. **Sending discount in Email 1.** Yes, you lose some margin on people who would have converted anyway. But NOT showing the code in Email 1 means ~50% of subscribers never open Email 2 (they didn't see anything actionable). The math: 10% off on first order × 70% margin = 60% of revenue retained. Lost margin on a few percent of buyers < lost conversions from 50%+ of subscribers who disengage.
2. **Sending 7+ emails.** 5 is the sweet spot. 7+ emails in 14 days hits spam filters and unsubscribes. Welcome series should NOT be a content dump — every email should have ONE job.
3. **Skipping the founder story (Email 2).** Welcome series is the only time you can send an "about us" email and get 60%+ opens. After 30 days, subscribers won't open "story" emails. Use Email 2 for that.
4. **Same subject line for all 4 opt-in sources.** A quiz completer expects personalization ("Your skincare routine is ready"). A popup subscriber expects a discount. A footer subscriber is least engaged. Personalize Email 1's subject line by `signup_source` segment.
5. **Not suppressing existing customers.** A 3-time buyer signing up for the newsletter will get a "Welcome! Here's 10% off!" email — confusing and margin-destroying. The `Placed Order → zero times → since starting this flow` filter is mandatory.
6. **Discount > margin.** If your welcome discount is 25% and your gross margin is 30%, the discount literally cannot pay for itself — every converted welcome subscriber loses you money (excluding LTV). Cap welcome discount at `margin - 5%` (e.g. 70% margin → max 65% discount, but typically you want 10–15%).
7. **No sunset branch.** A subscriber who joined 6 months ago and never bought is still in the welcome series. After email 5, route them to a win-back flow OR suppress them from welcome entirely. Otherwise Klaviyo's deliverability tank is filled with cold subscribers.
8. **No list cleaning.** Subscribers who haven't opened ANY email in 180 days are dead weight. They hurt deliverability across your entire Klaviyo account (Gmail throttles senders with low engagement). Suppress them.
9. **Forgetting mobile.** 70%+ of welcome emails are opened on mobile. Klaviyo's preview is mobile — check every email in mobile view BEFORE turning on the flow. Single column, large CTA button (44px+ tall), short subject line (<40 chars).
10. **Welcome discount + abandoned cart discount overlap.** If a new subscriber abandons their first cart, the abandoned cart flow's 10% off email (Move #1, Email 3) will collide with the welcome series' 10% off (Move #4, Email 1). Use Klaviyo's **profile property** "first_discount_used" to suppress the abandoned cart discount if the welcome discount was used. Otherwise subscribers stack discounts.
11. **Testing with personal email addresses.** Klaviyo's preview is not a real send — it doesn't trigger the actual flow logic. To test, set up a real subscriber via your popup with a `+test@gmail.com` alias, and watch the actual flow fire.
12. **Skipping the SMS welcome.** SMS-1 lifts opt-in→purchase CVR by 20–40% in most Klaviyo benchmarks. The marginal cost is ~$3-5/month at typical opt-in volumes. If you have Postscript set up (Move #5), you should add the SMS-1.

---

## Verification

After building the flow, run this 7-step gate to confirm it's ready for production traffic.

### Step A — Forecast sanity check

```bash
cd /data/workspace/ecommerce-ops/scripts
python3 welcome_series_roi.py --optins 1000 --cvr 0.03 --aov 75 --margin 0.70
```

Expected output: **Health band: great (>=30:1, top-tier welcome flow)**. If the band is "marginal" or "weak", re-check your CVR (most brands land at 2–5%, not <1%) and your discount (default 10%, not 25%).

### Step B — JSON roundtrip

```bash
python3 welcome_series_roi.py --json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['forecast']['health_band'])"
```

Expected output: `great (>=30:1, top-tier welcome flow)`. Confirms the JSON is well-formed and downstream tools can parse it.

### Step C — TDD suite

```bash
python3 tests/test_welcome_series_roi.py
```

Expected: **44 passed, 0 failed**. Plus the regression suites:

```bash
for t in tests/test_*.py; do python3 "$t" 2>&1 | tail -1; done
```

Expected: 4 lines, all ending in `OK` or `X passed, 0 failed`.

### Step D — End-to-end Klaviyo flow preview

In Klaviyo:

1. **Flows → Welcome Series → Preview as → enter your email** → check every email renders correctly on desktop AND mobile (the mobile toggle is in the preview pane).
2. **Send test emails** to `your.name+test1@gmail.com`, `your.name+test2@gmail.com`, etc. (Gmail's `+alias` lets you create unique addresses without a real account). Each test send should arrive within 5 minutes and render correctly.
3. **Confirm the trigger fires** by signing up via your actual popup with a `+test@gmail.com` alias — the entire 5-email series should land over the next 14 days (or fire all 5 immediately if you set the cadence to "send immediately after delay").
4. **Check SMS** (if enabled): sign up with a real phone number + email → confirm SMS-1 arrives within 30 minutes.

### Step E — Confirm suppression works

1. Sign up a test email → confirm welcome email 1 lands.
2. Place a test order from that email's account in Shopify.
3. Wait 5 minutes → confirm no welcome email 2 fires (suppression working).

### Step F — Check deliverability

1. **Send a test email** to a Gmail + Yahoo + Outlook address (use `+test@gmail.com`, `+test@yahoo.com`, `+test@outlook.com`).
2. **Check spam folder** for each.
3. If any hit spam: check SPF/DKIM/DMARC are authenticated (Klaviyo → Settings → Domains → confirm green checkmark on your sending domain).
4. Run **Mail Tester** (mail-tester.com, free) — send a test email to the address they give you, get a 0–10 score. Target ≥8/10.

### Step G — Confirm analytics fire

1. Klaviyo → Analytics → Metrics → search for "Email Opened" — confirm at least one test open registered in the last 5 minutes.
2. Klaviyo → Analytics → Metrics → search for "Clicked Email" — confirm at least one click.
3. Klaviyo → Analytics → Metrics → search for "Subscribed to Email Marketing" — confirm your test signup registered.

If all 7 steps pass, the welcome series is live and ready for real traffic. Turn the flow from "Draft" to "Live" in Klaviyo and you're shipping revenue.

---

## Companion tool: `welcome_series_roi.py`

The script at `/scripts/welcome_series_roi.py` forecasts the per-month revenue and send cost for the welcome series given your store's actual opt-in volume, CVR, AOV, margin, and discount. It also calculates **breakeven CVR** — the CVR at which send cost exactly equals net margin, so you know the minimum acceptable performance.

**Default inputs** (calibrated to a small DTC brand at ~$1M GMV):

- 1,000 opt-ins/mo
- 3% first-purchase CVR (industry baseline; top-quartile brands hit 5–10%)
- $75 AOV
- 70% gross margin
- 10% welcome discount
- 5 emails / series
- $0.0005/email delivered
- 1 SMS / opted-in subscriber @ 30% opt-in @ $0.012/SMS
- 90-day horizon

**Default forecast:**

- 30 first orders / month → $2,250 gross revenue
- $1,575 gross margin → $225 discount cost → $1,350 net margin
- $1.75 email + $3.60 SMS = $5.35 total send cost
- **$1,344.65 net revenue / month → 252:1 net margin per $1 of send cost**
- **Breakeven CVR: 0.012%** (i.e. the flow pays for itself even at catastrophic CVR)

The script is runnable as `python3 scripts/welcome_series_roi.py` and accepts all inputs as CLI flags. Use `--json` for machine-readable output. Run it before turning the flow on, after the flow is live (compare actuals vs forecast), and after every A/B test winner is promoted (CVR changes → re-forecast).

See `/scripts/tests/test_welcome_series_roi.py` for the 44 TDD tests covering import surface, validation, forecast math, health-band classification, render output, CLI behavior, and realistic-scenario end-to-end.

---

## Related playbooks

- **Playbook 01 — Abandoned Cart Flow** (`/playbooks/01-abandoned-cart-flow-klaviyo.md`) — the second flow to build. Same Klaviyo infrastructure. Catches the subscribers who didn't convert from the welcome series.
- **Playbook 02 — Post-Purchase Upsell** (`/playbooks/02-post-purchase-upsell-reconvert.md`) — uses the same Klaviyo + ReConvert infrastructure. Fires immediately after the welcome series' first conversion.
- **Playbook 03 — Checkout Audit** (`/playbooks/03-checkout-audit-baymard.md`) — boost CVR across the entire site. Combined with welcome series, lifts opt-in→purchase conversion by 10–25%.

---

**Time to ship:** 6–10 hours for a small brand. Reuses the Klaviyo + Postscript infrastructure from Playbook 01 (abandoned cart), so setup is mostly flow-config, not platform-config.

**Expected ROI:** at default inputs (1,000 opt-ins/mo, 3% CVR, $75 AOV), the welcome series produces $1,344.65 net revenue per month at $5.35 total send cost = **252:1 ROI**, with breakeven CVR of 0.012%. Every converted welcome subscriber also unlocks the abandoned-cart and post-purchase flows, compounding LTV.