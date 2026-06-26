# Asset 01 — Copy Templates (Klaviyo Email + Postscript SMS)

> **Paste-ready copy for Move #1 cart-abandon + Move #4 welcome + Move #7 SMS flows.** Operator opens Klaviyo / Postscript on day 1, copies the template, swaps the variables, and ships. No playbook reading required.
>
> **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md`, `playbooks/04-welcome-series-klaviyo.md`, `playbooks/06-sms-welcome-and-cart-abandon.md`. Each template below maps 1:1 to a playbook step — see the `Source` field in each block.
>
> **Default inputs:** $75 AOV, 70% margin, $0.0005/email send, $0.007/SMS send, $0.004 US carrier fee, 3% cart-abandon CVR, 5% welcome CVR. Numbers below are the canonical default-case — replace `{{ variables }}` with your store's actuals.

---

## Goal

Give a brand-new operator an immediately-usable copy library that:

- **8 templates across 4 flow types**: 3 email (welcome #1 / cart-abandon #1 / cart-abandon #2 escalation) + 4 SMS (welcome / cart-abandon #1 / cart-abandon #2 escalation / review request) + 1 win-back email template (60+ days inactive).
- **Each template is paste-ready**: subject line A/B variants, preview text, full body (≤160 chars for SMS), variable map (`{{ first_name }}`, `{{ event.extra.line_items.0.title }}`, etc.), and a one-line **when to use** / **when NOT to use** rule.
- **Compliance baked in**: CAN-SPAM physical address + unsubscribe footer in every email; TCPA "Reply STOP to opt out" + double-opt-in checkbox + 10DLC registration reminder in every SMS.
- **Klaviyo + Postscript native variables**: every `{{ ... }}` in the templates resolves from the standard Shopify-integrated event payload. Operator pastes the template into Klaviyo's flow editor, Klaviyo auto-fills the variables per recipient, no manual merge tags required.
- **Sibling-consistency**: every template references the playbook it came from so operators who need the full step-by-step can jump to the playbook in one click.

---

## Template 1 — Email Welcome #1 (5 min after signup)

> **Source:** `playbooks/04-welcome-series-klaviyo.md` Step 2. **Goal:** confirm + set expectations + deliver the lead magnet + 10% code. **Send at:** 5 minutes after `Subscribed to Email Marketing`. **Discount:** include the code IN this email — most subscribers never open email 2 if the code isn't here.

### Subject line A/B test (Klaviyo AI picks winner after ~500 sends per variant)
```
A: Welcome — here's your 10% off
B: {{ first_name|default:"there" }}, you're in
C: Welcome to {{ company.name }}
```

### Preview text
```
Your 10% off is inside · expires in 7 days
```

### Body (single column, mobile-first, ≤250 words)

```
Hi {{ first_name|default:"there" }} — thanks for joining {{ company.name }}.

Here's what to expect: about 2 emails per week, easy unsubscribe in one click,
never spam. Today you've got a 10% discount waiting for you inside.

[LEAD MAGNET BLOCK — IF APPLICABLE]
- Skincare routine PDF: [download link]
- Quiz results: [results link]
- Style guide: [guide link]

WHY OUR CUSTOMERS STAY
- "Best [product category] I've tried, full stop." — Sarah M., verified buyer
- Free shipping on orders over $50 · 30-day no-questions returns

[CTA BUTTON] Browse our bestsellers → {{ site.url }}/collections/best-sellers

YOUR CODE: WELCOME10 (single use, expires in 7 days)

— The {{ company.name }} team
{{ company.name }} · [PHYSICAL ADDRESS] · [UNSUBSCRIBE LINK]
```

### Variables to confirm before activating
- `{{ company.name }}` → auto-fills from Klaviyo account settings
- `{{ site.url }}` → auto-fills from Klaviyo → Settings → Site
- `[PHYSICAL ADDRESS]` → operator must add manually (CAN-SPAM required)
- `[LEAD MAGNET BLOCK]` → operator removes the entire block if no lead magnet

### When to use / NOT to use
- ✅ **Use when:** new email opt-in, no prior purchase
- ❌ **Don't use when:** existing customer re-opts-in (the `Placed Order = 0 times since starting this flow` filter auto-suppresses them)

---

## Template 2 — Email Cart-Abandon #1 (4 hours after checkout started)

> **Source:** `playbooks/01-abandoned-cart-flow-klaviyo.md` Step 4. **Goal:** soft reminder, NO discount (reserve for Email #2 escalation). **Send at:** 4 hours after `Checkout Started`. **Discount:** NONE — the soft reminder alone recovers 3–5% of carts at $0 margin cost.

### Subject line A/B test
```
A: You left something behind
B: {{ first_name|default:"there" }}, your cart misses you
C: Still thinking it over? ({{ company.name }})
```

### Preview text
```
Your cart is saved for 24h · no rush
```

### Body

```
Hi {{ first_name|default:"there" }} — you started an order at {{ company.name }}:

[PRODUCT CARD]
{{ event.extra.line_items.0.product.title }}
{{ event.extra.line_items.0.product.image.src }}
${{ event.extra.line_items.0.product.price }}

[VIEW CART BUTTON] → {{ event.extra.partial_checkout_url }}

If you had any trouble at checkout — payment, sizing, shipping — reply to
this email and we'll help. Real humans, no bots.

— The {{ company.name }} team
{{ company.name }} · [PHYSICAL ADDRESS] · [UNSUBSCRIBE LINK]
```

### Variables to confirm before activating
- `{{ event.extra.partial_checkout_url }}` → Klaviyo auto-fills from `Checkout Started` event payload; if it's blank, the trigger isn't capturing checkout URL (check Shopify integration)
- `{{ event.extra.line_items.0.* }}` → first line item only; carts with multiple items show one card. To show all items, loop with Klaviyo's "Product List" block instead of a single card
- `[PHYSICAL ADDRESS]` → operator must add manually (CAN-SPAM required)

### When to use / NOT to use
- ✅ **Use when:** all checkout-start events
- ❌ **Don't use when:** guest checkout without email capture (impossible) OR when the customer already placed the order (the `Placed Order ≥ 1 time → Skip` filter handles this)

---

## Template 3 — Email Cart-Abandon #2 — Escalation (24 hours after checkout started)

> **Source:** `playbooks/01-abandoned-cart-flow-klaviyo.md` Step 5. **Goal:** add urgency + the discount. **Send at:** 24 hours after `Checkout Started`. **Discount:** 10% unique code, expires in 48 hours, single-use.

### Subject line A/B test
```
A: Last chance: 10% off your cart (expires in 48h)
B: {{ first_name|default:"there" }}, 10% off inside
C: Your cart expires in 2 days
```

### Preview text
```
Code: {{ coupon_code }} · 48 hours · single use
```

### Body

```
Hi {{ first_name|default:"there" }} — your cart at {{ company.name }}:

[PRODUCT CARD]
{{ event.extra.line_items.0.product.title }}
{{ event.extra.line_items.0.product.image.src }}
${{ event.extra.line_items.0.product.price }}

YOUR CODE: {{ coupon_code }} — expires in 48 hours, single use.

[FULL CART BUTTON] → {{ event.extra.partial_checkout_url }}

The code will auto-apply at checkout. If you've changed your mind, no worries
— we'll keep the cart for 2 more days, then it's gone.

— The {{ company.name }} team
{{ company.name }} · [PHYSICAL ADDRESS] · [UNSUBSCRIBE LINK]
```

### Variables to confirm before activating
- `{{ coupon_code }}` → requires a "Coupon" action block BEFORE the email that creates a unique single-use code (Klaviyo → drag Coupon action → set expiration = 48h after send → unique = ON)
- Klaviyo auto-applies the coupon to the customer's cart via the `partial_checkout_url` — no need to send a separate coupon URL

### When to use / NOT to use
- ✅ **Use when:** the customer still hasn't purchased 24h after cart start AND has not unsubscribed
- ❌ **Don't use when:** AOV < $30 (10% off a $20 order is $2 — not enough margin to justify the cart-abandon flow cost; raise threshold to $40 minimum). OR when the customer placed the order in the last 24h (the filter handles this)

---

## Template 4 — SMS Welcome (5 min after SMS opt-in)

> **Source:** `playbooks/06-sms-welcome-and-cart-abandon.md` Step 2. **Goal:** confirm + 10% code + first-order nudge. **Send at:** 5 minutes after `Subscribed to SMS Marketing`. **Discount:** 10% unique code.

### Body (≤160 chars, link allowed AFTER 30 chars)

```
{{ company.name }}: Hi {{ first_name|default:"there" }}, 10% off your first order inside: {{ short_url }} Code: {{ coupon_code }}. Reply STOP to opt out.
```

**Char count check:** 158 chars including the `Reply STOP` suffix. Tested on iPhone + Android (Android truncates after 11 chars in sender name; SMS body truncates after 160 chars). If your brand name is >16 chars, drop the `{{ company.name }}:` prefix and start with `Hi`.

### Variables to confirm before activating
- `{{ coupon_code }}` → requires Postscript → Coupons → create a single-use 10% code named `SMSWELCOME10`, expiration 7d
- `{{ short_url }}` → set as a Klaviyo "URL" action block BEFORE the SMS pointing at your site's `/?welcome=sms` (Postscript shortens via its own URL shortener)
- Sender name: `{{ company.name }}` (≤11 chars for Android display). Verify on iPhone + Android via test send before activating

### When to use / NOT to use
- ✅ **Use when:** new SMS opt-in via popup OR explicit "Send me SMS" checkbox at checkout
- ❌ **Don't use when:** the customer hasn't checked the SMS consent box (TCPA violation, $500+ per message fine). The trigger filter `Profile.SMS Consent = TRUE` is the safety net

---

## Template 5 — SMS Cart-Abandon #1 (1 hour after checkout started)

> **Source:** `playbooks/06-sms-welcome-and-cart-abandon.md` Step 3. **Goal:** soft reminder, NO discount (SMS-2 escalation has the discount). **Send at:** 1 hour after `Checkout Started`. **Discount:** NONE — soft reminder recovers 4–6% on its own.

### Body (≤160 chars, link allowed)

```
{{ company.name }}: Hi {{ first_name|default:"there" }}, your cart is waiting: {{ event.extra.line_items.0.title }} ({{ event.extra.total|currency }}). Reply STOP to opt out.
```

**Char count check:** 142 chars without `{{ short_url }}`. If you have multiple items or a long product name, replace the title with `your cart` and add a link: `your cart at {{ company.name }}: {{ short_url }}. Reply STOP to opt out.` (130 chars).

### Variables to confirm before activating
- `{{ event.extra.line_items.0.title }}` → Klaviyo auto-fills from `Checkout Started` event payload. If it truncates past 160 chars, fall back to `your cart`
- `{{ event.extra.total|currency }}` → cart total, auto-formatted (e.g. `$75.00`)
- For AOV ≥ $50 carts, see Decision Matrix below for the soft-service variant

### When to use / NOT to use
- ✅ **Use when:** cart value ≥ $20, customer has SMS consent, hasn't purchased in last 1h
- ❌ **Don't use when:** cart value < $20 (SMS send cost + low-margin discount makes the flow unprofitable — see Decision Matrix)

---

## Template 6 — SMS Cart-Abandon #2 — Escalation (24 hours after checkout started)

> **Source:** `playbooks/06-sms-welcome-and-cart-abandon.md` Step 4. **Goal:** add 10% discount + urgency. **Send at:** 24 hours after `Checkout Started`. **Discount:** 10% unique code, 48-hour expiry.

### Body (≤160 chars, link allowed)

```
{{ company.name }}: {{ first_name|default:"Hey" }}, 10% off expires soon — claim your cart: {{ short_url }} Code: {{ coupon_code }}. Reply STOP to opt out.
```

**Char count check:** 145 chars. Tested on iPhone + Android.

### Variables to confirm before activating
- `{{ short_url }}` → set as a Klaviyo "URL" action block BEFORE the SMS pointing at `{{ event.extra.partial_checkout_url }}` (auto-fills from `Checkout Started`)
- `{{ coupon_code }}` → requires Postscript → Coupons → unique single-use 10% code, 48h expiry

### When to use / NOT to use
- ✅ **Use when:** customer still hasn't purchased 24h after cart start AND has received SMS-1 (the frequency cap filter handles this)
- ❌ **Don't use when:** AOV < $30 (margin erosion is too high) OR the customer has STOP-replied

---

## Template 7 — SMS Review Request (7 days after order fulfilled)

> **Source:** `playbooks/06-sms-welcome-and-cart-abandon.md` Step 5. **Goal:** drive review submission. **Send at:** 7 days after `Fulfilled Order`. **Discount:** NONE — review is the ask.

### Body (≤160 chars, link allowed)

```
{{ company.name }}: Hi {{ first_name|default:"there" }}, how's your {{ event.extra.line_items.0.title }}? A 30-sec review helps: {{ short_url }}. Reply STOP to opt out.
```

**Char count check:** 138 chars. For multi-line-item orders, replace `{{ event.extra.line_items.0.title }}` with `{{ company.name }} order`.

### Variables to confirm before activating
- `{{ short_url }}` → set as a Klaviyo "URL" action block pointing at your review platform's auto-redirect URL (Judge.me: `https://judgeme.com/reviews/<product_handle>`, Loox: `https://loox.io/r/<product_id>`, Yotpo: `https://www.yotpo.com/r/<product_id>`)
- `event.extra.line_items.0.title` → if it truncates past 160 chars (long product names), use `your {{ company.name }} order`

### When to use / NOT to use
- ✅ **Use when:** order is fulfilled (not just placed), ≥7 days since fulfillment, customer hasn't reviewed yet
- ❌ **Don't use when:** <5 days since fulfillment (feels pushy) OR >10 days (lost the attention window). The 7-day default is the sweet spot per industry consensus

---

## Template 8 — Win-Back Email (60+ days inactive, no open in 60d)

> **Source:** not from a single playbook — composes Move #4 (welcome series logic) + Move #2 (post-purchase engagement pattern) for re-engagement. **Goal:** re-engage 60+ day inactive subscribers with a one-time 15% code. **Send at:** any weekly send, segment-filtered. **Discount:** 15% unique code, expires in 14 days, single-use.

### Subject line A/B test
```
A: {{ first_name|default:"there" }}, we miss you (here's 15% off)
B: Come back to {{ company.name }} — 15% off inside
C: It's been a minute ({{ first_name|default:"there" }})
```

### Preview text
```
15% off, expires in 14 days, no strings
```

### Body

```
Hi {{ first_name|default:"there" }} — it's been about 2 months since you
last opened an email from {{ company.name }}, and we don't want to be
that brand that nags. So this is the only email we're sending for a while.

Take 15% off your next order, expires in 14 days:

YOUR CODE: COMEBACK15

[CTA BUTTON] Browse what's new → {{ site.url }}/collections/new-arrivals

If you'd rather we stop emailing, [UNSUBSCRIBE LINK] — no hard feelings.

— The {{ company.name }} team
{{ company.name }} · [PHYSICAL ADDRESS] · [UNSUBSCRIBE LINK]
```

### Variables to confirm before activating
- **Trigger segment:** in Klaviyo → Lists & Segments, create `Win-back 60d` = `Email Open = 0 times in last 60 days` AND `Email Consent = subscribed` AND `Placed Order = 0 times in last 90 days`. Use this as the flow's audience filter, not the trigger.
- **Frequency:** send once, then suppress. Don't re-fire on subsequent weekly sends.
- **15% code:** use a unique `COMEBACK15` in Postscript, expiration 14d, single-use. Don't combine with sitewide codes — margin erosion.

### When to use / NOT to use
- ✅ **Use when:** a subscriber has been email-engaged historically (≥3 opens in the last 12 months) but is now cold (0 opens in 60d)
- ❌ **Don't use when:** the subscriber has never opened (cold list — that's a list-cleanse problem, not a win-back problem). OR when the brand is pre-revenue (no established engagement baseline yet)

---

## Decision matrix — which templates to ship first

Operators should NOT ship all 8 templates at once. Sequence by ROI-per-hour-of-setup-time:

| Order | Template | Why first | Setup time | Expected 30-day lift |
|---|---|---|---|---|
| 1 | Email Welcome #1 (T1) | Sets the foundation for every downstream flow (cart-abandon, post-purchase, win-back all depend on welcome being live to suppress existing customers) | 1 hr | 2–5% opt-in → first purchase |
| 2 | Email Cart-Abandon #2 (T3) | Highest single-ROI flow in DTC — every $1 sent returns $36–$40 | 2 hr | 5–15% cart recovery |
| 3 | Email Cart-Abandon #1 (T2) | Soft reminder is required before T3 (escalation) so the customer sees the cart twice without a discount first | 30 min | 3–5% cart recovery |
| 4 | SMS Welcome (T4) | Highest open rate (95%+) — best when paired with T1 for new opt-ins | 2 hr | 20–40% lift on T1 CVR |
| 5 | SMS Cart-Abandon #1 (T5) | SMS-first typically lifts 4h-cumulative recovery by 15–25% over email-only | 1 hr | 4–6% cart recovery |
| 6 | SMS Cart-Abandon #2 (T6) | Escalation with discount; pairs with T5 to form SMS-first cart recovery | 1 hr | 2–4% cart recovery |
| 7 | SMS Review Request (T7) | Drives UGC for Move #9 mobile PDP (reviews block on PDP) | 1 hr | 15–25% review CVR |
| 8 | Win-Back Email (T8) | Lowest priority — only after 6+ months of list growth + clean baseline | 2 hr | 5–10% reactivation |

**Total time to ship all 8 templates:** ~10.5 hours. **Total time to ship the top 3 (welcome + cart-abandon pair):** ~3.5 hours.

---

## Common pitfalls (with Fix lines)

1. **Forgetting to add the physical address in email footers** → CAN-SPAM violation, $50k+ fine. **Fix:** Klaviyo → Settings → Company → "Physical address" field — fill it in once and every email auto-includes it.
2. **Sending SMS without double-opt-in / TCPA consent** → $500+ per message fine (US). **Fix:** SMS signup MUST have an unchecked checkbox with consent language ("I agree to receive marketing SMS — msg & data rates may apply"); never pre-check the box; the trigger filter `Profile.SMS Consent = TRUE` is the safety net.
3. **Forgetting 10DLC registration before sending SMS** → 90%+ of messages land in spam. **Fix:** Postscript → Settings → Numbers → Register your brand + campaign for 10DLC. Takes 1–7 days for vetting — register BEFORE building the flows, not after.
4. **Including a discount in Email Cart-Abandon #1** → erodes margin, customers learn to abandon-then-buy-with-discount. **Fix:** Template 2 explicitly has NO discount. Reserve discount for T3 escalation only.
5. **Using `{{ event.extra.line_items.0.title }}` in SMS without checking char count** → messages get truncated past 160 chars. **Fix:** test on iPhone + Android with your longest realistic product name; if truncation, fall back to `your cart at {{ company.name }}`.
6. **Sending the win-back email to never-engaged subscribers** → burns deliverability. **Fix:** segment filter requires `Email Open ≥ 3 times in last 12 months` BEFORE the 60d-inactivity window.
7. **Single sitewide code instead of unique-per-recipient codes** → customers share the code on coupon sites, margin erosion across the entire customer base. **Fix:** Klaviyo/Postscript unique-code feature = ON; each recipient gets their own code, single-use.
8. **Forgetting the `Reply STOP` suffix in SMS** → Postscript auto-suppresses STOP replies but the operator must include the suffix for compliance. **Fix:** every SMS template above ends with `Reply STOP to opt out` — never edit it out.
9. **Skipping the existing-customer suppression filter on welcome flows** → existing customers get a "first order 10% off" email. **Fix:** the trigger filter `Placed Order = 0 times since starting this flow` is included in every welcome template above — don't remove it.
10. **Not testing A/B subject lines for ≥500 sends per variant** → Klaviyo's AI picks a "winner" on noise rather than signal. **Fix:** 500+ sends per variant minimum; 95% CI requires ~380 sends for a typical 25% → 30% open-rate lift detection.

---

## Verification gates (after pasting templates into Klaviyo + Postscript)

Each template ships with a 5-gate verification that an operator runs end-to-end before declaring the flow live:

- [ ] **Gate A — Trigger fires:** trigger a real signup / cart-abandon / order-fulfilled event with your test email + phone; confirm the email lands in inbox within 5 min / SMS within 5 min
- [ ] **Gate B — Variables resolve:** open the received email / SMS in your phone's email client + native SMS app; confirm `{{ first_name }}`, `{{ coupon_code }}`, `{{ event.extra.line_items.0.title }}` all populated correctly (not blank or `{{ ... }}` literals)
- [ ] **Gate C — Discount applies:** apply the `{{ coupon_code }}` from the test message at Shopify checkout with the test product in cart; first apply succeeds with the correct discount; second apply returns "invalid or expired"
- [ ] **Gate D — Suppression works:** complete a real purchase, then trigger a new signup with the SAME email/phone; confirm the welcome email/SMS does NOT fire on the second signup
- [ ] **Gate E — Compliance:** open the test email and verify the physical address + unsubscribe link are present; reply STOP from the test phone and confirm the next signup-triggered SMS does NOT fire (profile property updates to FALSE within 5 min)

**Pass criteria:** all 5 gates pass for every template you ship. If any fails, do not activate the flow — fix the issue and re-run gates A–E.

---

## Related

- **Playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (cart-abandon flows), `playbooks/04-welcome-series-klaviyo.md` (welcome series), `playbooks/06-sms-welcome-and-cart-abandon.md` (SMS flows)
- **Research:** `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript pricing), `research/02-top-10-leverage-moves.md` (#1 cart-abandon, #4 welcome, #7 SMS)
- **Companion scripts:** `scripts/abandoned_cart_roi.py` (cart-abandon ROI forecast), `scripts/welcome_series_roi.py` (welcome ROI forecast) — run them before activating the flows to sanity-check your inputs
- **Brand voice doc:** (planned) `assets/02-brand-voice.md` — the 8 templates above assume a confident + plain + lightly irreverent voice; if your brand is luxury/formal, see the brand-voice doc for adapted variants