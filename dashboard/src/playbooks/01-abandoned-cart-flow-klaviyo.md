# Playbook 01 — Abandoned Cart Flow (Klaviyo Email + SMS)

> **Move #1 from `research/02-top-10-leverage-moves.md`.** Highest-ROI flow in DTC: recovers 5–15% of lost carts; every $1 sent returns ~$36–$40. Pays for itself within one week of meaningful traffic.
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §3 (retention stack), `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript pricing).
>
> **Time to ship:** 4–8 hours for a small brand. This playbook is paste-ready — every step is a concrete action with a value, a command, or a decision point. No hand-waving.

---

## Goal

Build a 3-email + 2-SMS abandoned cart flow in Klaviyo (email) and Postscript (SMS) that:

- Triggers within 1 hour of cart abandonment
- Recovers **8–15% of abandoned carts** (3-email series benchmark)
- Produces **$30–$40 revenue per $1 of flow send cost** (Klaviyo/Omnisend verified benchmark)
- Segments by **cart value** (low / mid / high) so the SMS + discount strategy escalates correctly
- Suppresses **already-converted** and **unsubscribed** profiles automatically
- Has a **sunset branch** for repeat abandoners (3+ carts in 14 days) → SMS-only, higher-intent treatment

---

## Prerequisites

Before you start, confirm all of the following are true. If any are missing, the flow will go live but won't perform.

- [ ] **Klaviyo account** on a paid plan (free tier caps at 250 contacts and disables SMS; abandoned cart is meaningless with <500 contacts anyway). Budget: **$45–$300/mo** at $0–$1M GMV.
- [ ] **Postscript account** for SMS. Budget: **$0/mo + $0.007–$0.015/SMS + ~$0.004 US carrier fee**. Approve budget for ~500–2,000 SMS/month at the volumes below.
- [ ] **Shopify store** connected to Klaviyo (Settings → Integrations → Shopify). The "Browse Abandonment", "Added to Cart", "Checkout Started", and "Placed Order" metrics must show **≥ 1 event in the last 7 days** in Klaviyo → Analytics → Metrics.
- [ ] **TCPA + GDPR compliance**: customers must have explicitly opted into SMS. Add a checkbox at email signup ("Send me SMS order updates — msg & data rates may apply") with consent language. Email flows only need implied consent (US CAN-SPAM), but **include a one-click unsubscribe** in every email.
- [ ] **Brand voice doc** (even a one-pager). Subject lines and SMS copy below assume you have a primary voice — confident + plain + lightly irreverent is the default; if your brand is luxury/formal, adapt the templates in `/assets/` to come.
- [ ] **Discount code reserved** in Shopify for the email-3 / SMS-2 escalation. **Never** use a sitewide code — that destroys margin. Use Klaviyo's "unique code" feature so the 10% off is single-use, expires in 48h, and is suppressed for repeat use.

---

## Step-by-step

### Step 1 — Wire the trigger

In Klaviyo:

1. **Flows → Create flow → "Browse & Cart Abandonment"** → pick the **"Abandoned Cart Reminder"** template (3-email) OR build from scratch.
2. **Trigger filter**: `What someone has done → Checkout Started` (NOT `Added to Cart` — checkout-started includes email + cart contents + value, which is the data the flow needs to personalize).
3. **Trigger filter**: `at least once → within last 30 minutes`. The "within last X minutes" filter is what makes this a flow and not a campaign.
4. **Additional filter**: `What someone has done → Placed Order → zero times → since starting this flow` (suppresses converters).
5. **Additional filter**: `Profile → Consent → Marketing → Email = subscribed` (suppresses unsubs).
6. **Save trigger** as "AC — Main — Checkout Started (US/CA)" (localize per region if you ship internationally).

### Step 2 — Email 1: the 1-hour reminder (no discount)

**Goal:** reminder + emotional re-engagement. **No discount** — that destroys margin on the cheapest cart value and trains customers to abandon on purpose.

- **Send time:** 1 hour after `Checkout Started`.
- **From name:** `<Your Brand>` (not a person — brand from-name gets 10–20% higher open).
- **Subject line A/B test:** Klaviyo AI will pick a winner after ~500 sends per variant. Three starters:
  - `You left something behind`
  - `<First name>, your cart is waiting`
  - `<Cart item name> — still in your cart`
- **Preview text:** `<Cart total> in your cart · Free returns · Ships in 24h` (mirrors the cart value the user remembers).
- **Body:** Single column, mobile-first, **one CTA button** ("Complete your order →") above the fold. Below the CTA, show the cart items dynamically (Klaviyo's `event.line_items` block — DO NOT hardcode product names in the template; let the dynamic block render). Add **2–3 trust signals** below: review snippet, free shipping note, return policy.
- **CTA color:** test 2 colors after the first 1,000 sends. Most DTC brands find **black or green** outperforms blue (Baymard verified). Pick whatever matches your brand.
- **Footer:** physical address (CAN-SPAM), unsubscribe, view-in-browser.

### Step 3 — Email 2: the 24-hour social-proof reminder

**Goal:** add social proof + product reviews to nudge hesitant abandoners.

- **Send time:** 24 hours after `Checkout Started` (only if they haven't converted).
- **Trigger filter between email 1 and 2:** `Placed Order → zero times → since starting this flow` (otherwise skip the rest of the flow).
- **Subject line A/B test:** three starters:
  - `Others are loving <bestseller name>` (use a best-seller, not the cart item)
  - `<X> customers bought this in the last week`
  - `Real reviews from real <product category> owners`
- **Body:** 60% social proof (3–5 review snippets with star ratings + reviewer first name + city), 40% cart reminder (one dynamic CTA). Include **1 user-generated content photo** if you have any in Yotpo/Loox.
- **No discount yet.**

### Step 4 — Email 3: the 48–72-hour last-chance (with discount)

**Goal:** last-chance conversion. **First place in the flow that uses a discount** — escalates only after the user has ignored 2 no-discount emails.

- **Send time:** 48 hours after `Checkout Started`. Use 72h instead if your cart values are >$200 (high-consideration buyers need more time).
- **Trigger filter:** same as email 2 (`Placed Order = 0`).
- **Subject line:** `Last chance: 10% off your cart · expires in 48h`. Honesty about expiry beats urgency theatrics.
- **Discount type:** **Klaviyo unique 10% code**, single-use, expires in 48h from email send, suppressed for repeat use. Generate via Klaviyo's "Unique Coupon Codes" feature (coupon must already exist in Shopify with usage limits = 1).
- **Body:** short. One paragraph acknowledging they saw the cart reminders, one paragraph on the discount + expiry, one CTA, trust strip.
- **Footer:** standard.

### Step 5 — Add SMS (Postscript)

Postscript integrates bidirectionally with Klaviyo. You can either:

- **Option A (recommended):** Run SMS as **two messages inside the same Klaviyo flow** by adding a Postscript action block after email 2 (24h SMS) and email 3 (48h SMS). Klaviyo calls it a "Postscript Send" — configure the message inside the flow editor.
- **Option B:** Build a parallel Postscript flow with the same triggers. Use this if you want SMS-only on the higher-volume side.

**SMS rules (TCPA + deliverability):**

- Send **only after explicit SMS opt-in**. Default: skip if `Profile.SMS Consent = FALSE`.
- **160 characters max** per message (anything longer splits into 3 SMS and triples cost).
- **No links in SMS 1** — just reminder + brand name. SMS 2 can have a shortened link.
- **STOP/HELP keywords** are auto-handled by Postscript. Don't try to manage them yourself.

**SMS 1 (sent 4 hours after Checkout Started, BEFORE email 1):**

```
Hi <First name> — you left <Cart item count> item(s) in your cart at <Brand>. Still interested? Reply YES to get a reminder. Reply STOP to opt out.
```

This message has **no link** — adding a link here costs ~$0.005/SMS more, doesn't lift CVR, and trains spam filters.

**SMS 2 (sent 24 hours after Checkout Started, after email 2, NO discount):**

```
<First name>, your cart at <Brand> is still waiting — <Cart total>. Free returns. Tap to finish: <short_url>. Reply STOP to opt out.
```

**SMS 3 (optional, sent 48 hours, with discount — only if you have margin room):**

```
<First name>, 10% off your <Brand> cart — expires in 48h. Code: <unique_code>. Use it: <short_url>. Reply STOP to opt out.
```

Only include SMS 3 if email 3 didn't convert and you have margin for an additional discount touchpoint.

### Step 6 — Segmented escalation: high-cart-value branch

For carts **above your AOV × 1.5** (typically your top 15–25% of carts):

- **Add a separate branch** with `trigger filter: event.Cart Total >= 150` (or your threshold).
- **Skip the discount in email 3 entirely.** High-value abandoners convert better with **personal outreach** (Gorgias Helpdesk → manual email from a real person: "Hi <name>, noticed you had a question about <product> — happy to help") than with discounts.
- Use Klaviyo's "Send to a list" or webhook to Gorgias to trigger a CS task.

### Step 7 — Sunset branch: repeat abandoners

For profiles with **3+ `Checkout Started` events in 14 days**:

- **Skip email** entirely — they have email fatigue.
- **SMS only**, single message at 4h: `<First name>, we keep seeing you 👀 — your cart at <Brand> is still here. Want us to hold it + extend your 10% off by 7 days? Reply YES.`
- **Negative-option suppression:** anyone who replies STOP gets dropped from this branch permanently.

### Step 8 — Suppression + sunset flow

In Klaviyo → Flows → "Sunset Flow" template (built-in):

- Trigger: `Opened Email = 0 times` AND `Clicked Email = 0 times` AND `Placed Order = 0 times` in last **180 days**.
- Action: tag profile `email_sunset` and move to a quarterly re-engagement campaign only.
- This protects your deliverability and keeps your sender reputation clean.

### Step 9 — Turn on, then watch for 48 hours before tuning

- Set flow to **manual → review** for the first 48h. Klaviyo will queue messages but not send.
- Spot-check the trigger filter: pick 3 profiles in Klaviyo → Profiles, confirm they're correctly suppressed if they converted.
- After 48h, switch to **live**.
- **Do not edit subject lines for the first 7 days.** Klaviyo's A/B test needs ≥500 sends per variant to declare a winner; less and the result is noise.

---

## Metrics to track

Track these in Klaviyo → Analytics → Flow Analytics. Review weekly for the first 4 weeks, then monthly.

| Metric | Target (good) | Target (great) | Source |
|---|---|---|---|
| **Flow revenue contribution** | 5–8% of total online revenue | 10–15% | Klaviyo benchmarks |
| **Abandoned-cart recovery rate** | 8–12% of all `Checkout Started` events | 15%+ | Baymard + Klaviyo |
| **Email open rate (flow)** | 40–55% | 55%+ | Omnisend 2026 (inflated by Apple MPP; treat as upper bound) |
| **Email CTOR** (click-to-open) | 8–12% | 15%+ | Omnisend 2026 |
| **Email CVR** (placed order / delivered) | 3–6% | 8%+ | Klaviyo internal |
| **SMS opt-in rate** | 15–25% of email signups | 35%+ | Operator consensus |
| **SMS CVR** | 8–15% | 20%+ | Postscript benchmarks |
| **Revenue per $1 sent** | $20–$30 | $36–$40 | Omnisend 2026 |
| **Unsubscribe rate** (per send) | <0.3% | <0.1% | Klaviyo internal |

**Diagnostic ratios:**

- **Open rate drops below 30%** → deliverability problem. Check spam score, sender domain reputation (Google Postmaster Tools), and Apple MPP inflation.
- **CTOR above 15% but CVR below 2%** → landing page problem. The email is working; the cart/checkout is broken.
- **High open, low click on subject line with cart total** → subject line is misleading. Rewrite.
- **Recovery rate stuck at <5%** → trigger filter is wrong (probably catching `Added to Cart` instead of `Checkout Started`).

---

## Common pitfalls

1. **Triggering on `Added to Cart` instead of `Checkout Started`.** `Added to Cart` fires before the user enters email — you can't send to them. Always use `Checkout Started` (Shopify's checkout page event) which carries email + line items.
2. **Discounting in email 1.** Trains customers to abandon on purpose. Discounts escalate on email 3 only.
3. **Sitewide discount code.** Use Klaviyo unique codes with usage limits = 1. Sitewide codes are picked up by coupon-extension browser extensions and destroy margin.
4. **No suppression filter for converters.** The `Placed Order = 0` filter between each email is non-negotiable. Forgetting it sends "still in your cart?" emails to people who already bought — embarrassing, generates unsubscribes.
5. **Sending SMS without explicit opt-in.** TCPA fines start at **$500 per message**. Postscript's double opt-in is a feature, use it.
6. **Editing subject lines during A/B test.** Klaviyo needs volume to declare winners; tweaking mid-test invalidates the result.
7. **One-step flow without segmentation.** A high-AOV cart (>$150) and a $30 cart should not receive the same treatment. Use the segmentation branch in step 6.
8. **No sunset flow.** A list full of unengaged profiles tanks your sender score. The 180-day sunset is mandatory, not optional.
9. **Trusting the first week's numbers.** Abandoned-cart flow needs ~2,000 sends before its CVR stabilizes. Don't over-tune in week 1.
10. **Forgetting the physical address in the footer.** CAN-SPAM violation. Every email needs a real, USPS-valid postal address.

---

## Verification

The flow is "live and working" only when ALL of the following are true:

1. **Klaviyo → Flows → status = Live** (not "Manual" or "Draft").
2. **Sample test send**: create a real Shopify test order, abandon checkout with a personal email, confirm email 1 arrives within 1h.
3. **Suppress check**: place a real order on the same email account within 1h of `Checkout Started` — confirm flow halts and no further emails arrive.
4. **SMS test**: send a $0 test SMS from Postscript to your own number. Confirm opt-in flow works end-to-end.
5. **48-hour report**: 48h after turning live, Klaviyo → Flow Analytics shows ≥ 10 sends (or however many real abandons happened).
6. **AOV-segmented branch fires correctly**: create a $500 cart on a test account, confirm the high-value branch fires instead of the default discount branch.
7. **Sunset flow is on**: confirm a stale profile (no engagement in 180d) gets the sunset email and not the regular flow.

If any of these fail, **stay in manual mode**. A flow that fires to converters is worse than no flow at all.

---

## Cost & ROI estimate

Use this formula to forecast your flow's revenue before turning it on. The script `/scripts/abandoned_cart_roi.py` automates it.

```
monthly_recovered_orders = checkout_starts_per_month * 0.10   # 10% recovery rate (conservative)
monthly_recovered_revenue = monthly_recovered_orders * AOV
monthly_send_cost = (checkout_starts_per_month * 0.7) * 0.0005 * 3   # 3 emails, 70% deliverable, $0.0005/email
                 + (checkout_starts_per_month * 0.4) * 0.012 * 2    # 2 SMS to opted-in, $0.012/SMS
roi_ratio = monthly_recovered_revenue / monthly_send_cost
```

Healthy DTC brands at $1–10M GMV see **$20–$40 revenue per $1 of flow send cost**, which translates to a flow that's typically the **#2 or #3 revenue source** in the business after paid social.

---

## Next moves after this flow is live

Once abandoned cart is running and stable for 2 weeks, in priority order:

1. **Welcome series** (Move #4) — 3–5 emails over 7 days, conditions new subscribers to buy. 5–15% CVR.
2. **Post-purchase / cross-sell** (Move #2 adjacent) — 2–3 emails over 14 days after delivery. Lifts LTV 10–25%.
3. **Winback** — 3-email flow for 60–90 day lapsed customers. Recovers 5–10% of lapsed.
4. **Abandoned browse** — smaller CVR (1–3%) but compounds at scale. Build last.

Each is its own playbook. Don't combine them in one flow — separate flows let you tune each independently.

---

## Related

- **`/scripts/abandoned_cart_roi.py`** — ROI calculator + sanity-check script for this playbook.
- **`/scripts/tests/test_abandoned_cart_roi.py`** — pytest tests for the calculator.
- **`/research/02-top-10-leverage-moves.md`** — Move #1 is this playbook.
- **`/research/00-ecommerce-ops-landscape.md`** §3 — retention stack benchmarks.
- **`/research/01-tools-stack-comparison.md`** §2 — Klaviyo + Postscript pricing.
