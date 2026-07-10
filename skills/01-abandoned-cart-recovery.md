---
name: abandoned-cart-recovery
title: Abandoned cart recovery
category: retention
tier: 1
priority: P0
default_move: 1
year_1_roi_band: "25:1–60:1"
sms_friendly: true
last_updated: 2026-07-06
sources: [baymard 2024, klaviyo 2024, postscript 2024, omnisend 2024, salesforce 2024, statista 2024, triple-whale 2024]
---

# Abandoned cart recovery

> The single highest-ROI email + SMS flow in DTC. Recovers 5–15% of lost carts at 25:1–60:1 year-1 ROI. Every operator should ship this before anything else.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce) store
- An email tool (Klaviyo, Brevo, Mailchimp, Omnisend)
- An SMS tool (Postscript, Attentive, Klaviyo SMS)
- At least 50 carts/month

You do NOT have:
- A live abandoned cart flow (the most common DTC gap)
- A multi-channel cart recovery (email-only is leaving 30–50% on the table)
- A cart-value-segmented offer (low / mid / high cart ladders)

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Loom.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Email #1 timing | 1 hour after cart | 4 hours | 30 min |
| Email #1 subject | Personalized: "you left [PRODUCT]" | "We saved your cart" | first-name + product |
| Email #2 timing | 12 hours | 24 hours | 6 hours |
| Email #2 subject | Social proof: "[N] people bought this" | Reminder with discount | UGC of product |
| Email #3 timing | 24 hours | 48 hours | 18 hours |
| Email #3 subject | 10% off, last chance | 15% off | free shipping |
| SMS #1 timing | 30 min | 2 hours | — |
| SMS #1 copy | <160 chars, no link in body | Generic reminder | Direct checkout link |
| Sunset branch | 3+ carts in 14d → exit flow | None | Tiered suppression |
| Discount strategy | Cart-value-aware (high cart = no discount) | Always 10% | Dynamic offer |
| Suppression | "Placed Order" + already-converted | None | + SMS consent flag |

## Recovery rate benchmarks (2024–25)

| Channel mix | Recovery rate | Net revenue / $1 sent |
|---|---|---|
| Email only, 3 emails, no discount | 5–8% | 25:1–40:1 |
| Email only, 3 emails, 10% off in #3 | 8–12% | 30:1–50:1 |
| Email + SMS, 3 emails + 1 SMS, no discount | 10–15% | 35:1–60:1 |
| Email + SMS + push, full orchestration | 12–18% | 40:1–80:1 |

**Median DTC recovers ~7% of carts at 30:1. Best in class recovers 15%+ at 50:1+.**

## The build (4–8 hours for a competent operator)

### Step 1 — Trigger setup
- Klaviyo: `Checkout Started` metric
- Postscript: `Cart Abandoned` event (auto-tracks Shopify)
- Verify the trigger fires: test cart, wait 5 min, confirm email lands

### Step 2 — Build the 3-email flow
1. **Email 1** (1h): "You left [PRODUCT] in your cart"
   - Product image (from cart event)
   - 1-line benefit (from product description)
   - Single CTA → cart URL
2. **Email 2** (12h): "Still thinking about it?"
   - Customer review snippet (1–2 lines)
   - CTA → cart URL
3. **Email 3** (24h): "Last chance — 10% off [PRODUCT]"
   - Discount code
   - Urgency line ("expires in 24h")
   - CTA → cart URL with discount auto-applied

### Step 3 — Add SMS
- **SMS 1** (30 min after cart): "[BRAND]: Your cart is waiting → [URL]"
- 160 chars max
- Only send to high-cart-value (>$80) profiles for cost control
- Frequency cap: 1 SMS / cart / 30 days

### Step 4 — Suppress + sunset
- Filter: `Placed Order` zero value (already converted)
- Filter: SMS consent = false (don't SMS them)
- Sunset branch: 3+ carts in 14d → exit flow, send to winback instead

### Step 5 — Measure
- Track: carts, recovered carts, recovery rate, $/send, $/recovered
- Set up Klaviyo flow performance email (weekly)
- Cross-reference with Triple Whale for true incremental revenue

## Common pitfalls (15 from real builds)

1. **Sending the discount too early** — if you offer 10% on email #1, you train customers to abandon
2. **Generic subject lines** — "Your cart is waiting" is invisible; "Your [PRODUCT] is waiting" lifts open rate 30%
3. **Same offer for high-value carts** — a $500 cart doesn't need 10% off; 5% or free shipping is enough
4. **SMS to non-consented profiles** — TCPA + GDPR violation, $500+ per message fines
5. **No suppression on placed orders** — sends abandonment email to people who bought
6. **Discount code never expires** — cannibalizes full-price revenue forever
7. **Cart image broken** — Klaviyo can't always pull product image; test the email
8. **Plain-text fallback missing** — Gmail strips HTML; need a plain-text variant
9. **Flow triggered twice** — `Checkout Started` fires twice if customer adds another item; add dedupe
10. **No frequency cap on SMS** — same customer gets 4 SMS / week → unsubscribes
11. **Time-zone naive send times** — 1pm UTC = 8am EST = 5am PST. Segment by timezone.
12. **No A/B test on subject** — even one variant per email lifts open rate 5–10%
13. **Discount stacks with welcome series** — double-discounting trains discount addiction
14. **Send rate too high** — Gmail throttles 1k+ emails / minute; stagger
15. **Ignoring mobile rendering** — 70%+ of cart emails open on mobile; preview in Gmail iOS first

## Verification (this skill is "shipped" when...)

- [ ] Trigger fires on test cart within 5 min
- [ ] 3 emails land in inbox within 24h of test cart
- [ ] SMS lands within 30 min (if SMS enabled)
- [ ] Placed-order profile does NOT receive the flow
- [ ] Cart with discount code applies the discount at checkout
- [ ] 7-day recovery rate ≥ 5% on the first 100 carts
- [ ] $/send ratio ≥ 20:1 in the first month

## How to extend this skill

Once the basic flow is live:
- Add browse-abandon (1.5x the volume of cart-abandon, lower per-recipient revenue)
- Add winback flow for 90+ day lapsed buyers
- Add post-purchase upsell page (companion skill)
- Add sunset segment for 3+ cart abandons in 14d

## Cross-references

- Companion skill: `post-purchase-upsell`
- Companion skill: `welcome-series`
- Companion skill: `sms-orchestration`
- Research doc: `/research/05-lifecycle-marketing.md`

## Sources

- Baymard Institute, "Cart abandonment reasons 2024" (n=4,000+ shoppers)
- Klaviyo, "Email + SMS Benchmarks 2024"
- Postscript, "SMS cart abandonment data 2024"
- Omnisend, "Ecommerce email + SMS report 2024"
- Salesforce, "State of commerce 2024"
- Statista, "Global cart abandonment rate 2024" (70.19% global avg)
- Triple Whale, "Customer benchmarks 2024"
- Litmus, "Email engagement benchmarks 2024"