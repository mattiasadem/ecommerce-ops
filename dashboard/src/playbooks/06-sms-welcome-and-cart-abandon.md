# Playbook 06 — SMS Welcome + Cart-Abandon Flows (Postscript)

> **Move #7 from `research/02-top-10-leverage-moves.md`.** Build the four core SMS flows in Postscript (integrated with Klaviyo) — Welcome SMS, Cart-Abandon SMS-1, Cart-Abandon SMS-2 (escalation), and Post-Purchase Review Request SMS. SMS lifts opt-in→purchase CVR 20–40% on top of email, recovers 5–15% of carts email alone misses, and pulls review-request CVR from 2–5% (email) to 15–25% (SMS). Reuses the Klaviyo + Postscript infrastructure documented in `playbooks/05-migrate-to-klaviyo-postscript.md`; if you have NOT migrated yet, complete Move #5 first.
>
> **Source data:** `research/00-ecommerce-ops-landscape.md` §3 (retention stack), `research/01-tools-stack-comparison.md` §2 (Postscript pricing + 10DLC), `research/02-top-10-leverage-moves.md` #7.
>
> **Companion playbooks:** `playbooks/01-abandoned-cart-flow-klaviyo.md` (the email-side cart-abandon — this playbook is the SMS-side reinforcement), `playbooks/04-welcome-series-klaviyo.md` (the email-side welcome — this playbook's SMS-1 is the SMS counterpart), `playbooks/05-migrate-to-klaviyo-postscript.md` (the prerequisite for the Postscript + 10DLC stack assumed here).

## Goal

Build 4 production-grade Postscript SMS flows integrated with Klaviyo that:

- **SMS-1: Welcome SMS** — sent 5 minutes after explicit SMS opt-in. Single message, ≤160 chars, includes a unique 10% off code with 48h expiry. Lifts opt-in→purchase CVR by 20–40% on top of email-only welcome.
- **SMS-2: Cart-Abandon Reminder 1** — sent 1 hour after `Cart Started` if no `Placed Order`. Soft reminder (no discount, no link in the first 30 chars). Recovers 3–7% of carts the email reminder misses.
- **SMS-3: Cart-Abandon Reminder 2 (Escalation)** — sent 24 hours after `Cart Started`, after the email-side escalation has fired. Adds a unique 10% off code with 48h expiry. Recovers 2–5% of the carts the soft reminder didn't convert.
- **SMS-4: Post-Purchase Review Request** — sent 7 days after `Order Fulfilled`, only if `Fulfilled Order = 1` and no review submitted. Pulls review-request CVR from 2–5% (email) to 15–25% (SMS).

Each flow respects TCPA + 10DLC + CTIA guidelines, skips when `Profile.SMS Consent = FALSE`, and uses Postscript's auto-handled `STOP`/`HELP` keyword processing (don't try to manage opt-outs yourself).

## Prerequisites

Before you build any of the 4 flows, complete these in order. Missing any one of them produces silent failures (TCPA fines start at $500 per unsolicited message; 10DLC registration rejection drops every SMS at the carrier).

- [ ] **Postscript account** on Starter ($0/mo + $49/mo minimum spend, 1k+ SMS subscribers) OR Growth ($100/mo + usage, scale brands). Budget: **$100–$400/mo** at 1k–20k SMS subscribers. Free trial is NOT enough — you need paid tier to send to opted-in US subscribers.
- [ ] **Klaviyo account on a paid plan** (free tier caps at 250 contacts and disables SMS integration). The flows below use Klaviyo's "Postscript Send" action blocks inside the flow editor so the SMS fires as a Klaviyo-orchestrated step. Budget: **$45–$300/mo** at $0–$1M GMV.
- [ ] **Shopify store connected to Postscript** (Postscript → Integrations → Shopify). Confirm customer + order data is flowing (Postscript → Customers → search for your own test order, confirm it appears with order value + line items).
- [ ] **Shopify store connected to Klaviyo** (Klaviyo → Integrations → Shopify). Same metrics must show. Klaviyo needs Shopify customer + order data for trigger segmentation (`Placed Order`, `Checkout Started`, `Fulfilled Order`).
- [ ] **TCPA-compliant SMS opt-in checkbox** on EVERY signup form, popup, exit-intent, and checkout. Language: *"By subscribing, you agree to receive marketing texts from [Brand] at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply HELP for help, STOP to cancel."* Wire the form to set `sms_consent = true` AND `sms_consent_at = <ISO timestamp>`. Klaviyo's form editor supports this field directly; check the box `Update profile property → SMS Consent → True` in the form's submission settings.
- [ ] **10DLC registration complete** for your sender number. US carriers require A2P 10DLC registration for any application-to-person SMS; Postscript handles registration but it takes **1–3 weeks** — start NOW if you plan to scale. Without registration, US carriers drop your messages and you see 0% delivery with no error in Postscript's UI. Verify in Postscript → Settings → Numbers → Registration Status = "Approved."
- [ ] **Brand voice doc** (one-pager is fine). SMS copy below assumes confident + plain + lightly irreverent default voice. If your brand is luxury/formal, rewrite the templates — don't ship default voice on a premium catalog.
- [ ] **Discount code strategy decided** for SMS-1 and SMS-3. Use **Klaviyo unique codes** (single-use, expires 48h after SMS send, suppressed for repeat use). Never use a sitewide code — that destroys margin. **Setup**: Klaviyo → Content → Coupons → Create Coupon → type = "Unique" → prefix = `WELCOME10` (for SMS-1) and `CART10` (for SMS-3) → expiration = 48h after send → single use per recipient.
- [ ] **Suppression list seeded** in Klaviyo. Exclude: existing customers (anyone with `Placed Order ≥ 1`), unsubscribed (`Profile.Email Marketing Consent = FALSE`), and email-only subscribers (`Profile.SMS Consent = FALSE`). Suppression MUST be a flow filter, not a segment — segments add latency and miss the 5-minute SMS-1 send window.
- [ ] **Test phone + email ready** — a phone number you've never used with Postscript, an email you've never used with Klaviyo, and a Shopify test-mode order. You'll use these to verify each flow end-to-end in Step 7.

## Step-by-step

The 4 flows below share the same Klaviyo flow editor. Build them in this order (welcome → cart-abandon → escalation → review-request) — each subsequent flow reuses the suppression rules + sender config from the previous one.

### Step 1 — Connect Postscript to Klaviyo

Skip this step if Move #5's playbook is already done. Otherwise:

1. Postscript → Integrations → Klaviyo → "Connect" → paste your Klaviyo API key (Klaviyo → Settings → API Keys → Create API Key → scope = "Full").
2. Confirm the integration by checking Klaviyo → Integrations → Postscript → status = "Connected." The integration syncs `Profile.SMS Consent`, sender-name, and opt-out keywords.
3. Confirm the Klaviyo flow editor shows "Postscript Send" as an action block (Klaviyo → Flows → Create Flow → drag "Postscript" action). If the block is missing, the integration didn't complete — re-do step 1.

### Step 2 — Build SMS-1 (Welcome)

1. Klaviyo → Flows → Create Flow → "Create from scratch" → name = "SMS Welcome."
2. **Trigger:** `Subscribed to SMS Marketing` (NOT `Subscribed to Email Marketing` — these are different properties). Set `What someone has done → Subscribed to SMS Marketing → zero times` to keep the flow from re-firing on each re-opt-in.
3. **Filter:** `Profile.SMS Consent = TRUE` (auto-set by the trigger, but add explicit filter for safety).
4. **Time delay:** 5 minutes. SMS-1 lands while the welcome email is still in the inbox (Email 1 typically fires at 0–30 min, so SMS-1 lands right behind it).
5. **Action block:** drag "Postscript" → "Send SMS" → paste the SMS-1 copy (≤160 chars, NO link):

   ```
   Welcome to {{ company.name }}! Here's 10% off your first order: {{ coupon_code }}. Reply STOP to opt out.
   ```

   `{{ coupon_code }}` is a Klaviyo dynamic variable populated by a preceding "Coupon" action block — drag "Coupon" before the "Send SMS" block, choose your `WELCOME10` unique-code coupon, set `Unique coupon code` variable name to `coupon_code`. The coupon block auto-generates a unique code per recipient.

6. **Conditional split (optional):** if you want to skip SMS-1 for customers who already placed an order, drag a "Conditional Split" between the trigger and the SMS, condition = `Placed Order ≥ 1 time → Skip`. This prevents existing customers from receiving welcome-style copy on re-opt-in.
7. **Review + Activate.** Klaviyo → Flows → "SMS Welcome" → top right → "Review and Turn On" → check the SMS preview, the 160-char count, and the sender name. Click "Turn On."

### Step 3 — Build SMS-2 (Cart-Abandon Reminder 1)

1. Klaviyo → Flows → Create Flow → name = "SMS Cart Abandon 1."
2. **Trigger:** `Checkout Started`. Set the flow's "Allow people to re-enter the flow after exiting" toggle = OFF (cart abandoners should re-enter only when they abandon a NEW cart, not re-fire on the same cart). Set the trigger's `What someone has done → Checkout Started` with `at least 1 time` and a `zero times since starting this flow` constraint.
3. **Time delay:** 1 hour. Fires BEFORE the email-side cart-abandon email 1 (typically sent at 4h) so SMS lands first — SMS-first typically lifts 4h-cumulative recovery by 15–25%.
4. **Filter:** `Profile.SMS Consent = TRUE` AND `Placed Order = 0 times since starting this flow` (auto-handled by the trigger's exit condition).
5. **Action block:** drag "Postscript" → "Send SMS" → paste the SMS-2 copy (≤160 chars, NO link in first 30 chars, NO discount on this message — soft reminder only):

   ```
   Hi {{ first_name|default:"there" }}, your cart at {{ company.name }} is waiting: {{ event.extra.line_items.0.title }} ({{ event.extra.total|default:event.extra.cart_total|currency }}). Reply STOP to opt out.
   ```

   Klaviyo auto-fills `{{ first_name }}`, `{{ event.extra.line_items.0.title }}`, and the cart total from the Checkout Started event payload. If a cart has multiple items, only the first is named — long cart names truncate past 160 chars.

6. **Dynamic content:** add a "Conditional Split" before the SMS to branch by cart value:
   - **Branch A — cart value < $50:** use the copy above (no discount).
   - **Branch B — cart value ≥ $50:** same copy but append ` Need a hand? Reply HELP.` (slight service-tone lift, no discount — reserve discount for SMS-3 escalation).
   - Cart-value branching reduces discount-margin erosion without changing the recovery curve for the long tail.

7. **Review + Activate** (same as Step 2.7).

### Step 4 — Build SMS-3 (Cart-Abandon Reminder 2 — Escalation)

1. Klaviyo → Flows → Create Flow → name = "SMS Cart Abandon 2 (Escalation)."
2. **Trigger:** same as SMS-2 — `Checkout Started`. This is a SEPARATE flow so you can tune copy + discount strategy independently.
3. **Time delay:** 24 hours. Fires AFTER the email-side cart-abandon email 2 (typically sent at 24h) — SMS lands 30–60 min after the email so the two messages don't stack in the same minute.
4. **Filter:** `Profile.SMS Consent = TRUE` AND `Placed Order = 0 times since starting this flow`.
5. **Action block:** drag "Coupon" (set `CART10` unique-code coupon, expiration 48h after send, single-use per recipient) → drag "Postscript" → "Send SMS" → paste the SMS-3 copy (≤160 chars, link allowed — Klaviyo auto-shortens via Postscript):

   ```
   {{ first_name|default:"Hey" }}, 10% off expires soon: {{ coupon_code }} — claim your cart at {{ company.name }}: {{ short_url }}. Reply STOP to opt out.
   ```

   `{{ short_url }}` is a Klaviyo dynamic variable — set the preceding "URL" action block to `{{ event.extra.partial_checkout_url }}` (auto-populated from Checkout Started payload) and Klaviyo routes it through Postscript's URL shortener.

6. **Frequency cap (critical):** add a "Conditional Split" BEFORE the SMS that checks `Has received SMS from this flow in last 24 hours → Skip`. This prevents stacking SMS-2 (1h) and SMS-3 (24h) on the same abandoner if a clock-skew or re-entry bug fires both in quick succession.
7. **Review + Activate** (same as Step 2.7).

### Step 5 — Build SMS-4 (Post-Purchase Review Request)

1. Klaviyo → Flows → Create Flow → name = "SMS Review Request."
2. **Trigger:** `Fulfilled Order`. NOT `Placed Order` — you want the timer to start at fulfillment (when the customer has the product in hand), not at purchase.
3. **Time delay:** 7 days. Industry consensus: <5 days feels pushy, >10 days loses the post-delivery attention window. 7 days is the sweet spot.
4. **Filter:** `Profile.SMS Consent = TRUE` AND `Fulfilled Order ≥ 1 time` AND `Review Submitted = 0 times` (the last filter requires the review platform — Judge.me, Loox, Yotpo — to write back to Klaviyo; configure the integration first per the review platform's docs).
5. **Action block:** drag "Postscript" → "Send SMS" → paste the SMS-4 copy (≤160 chars, link allowed):

   ```
   Hi {{ first_name|default:"there" }}, how's your {{ event.extra.line_items.0.title }} from {{ company.name }}? A 30-sec review helps others find us: {{ short_url }}. Reply STOP to opt out.
   ```

   `{{ short_url }}` should resolve to your review platform's auto-redirect URL (Judge.me: `https://judgeme.com/reviews/<product_handle>`, Loox: `https://loox.io/r/<product_id>`, Yotpo: `https://www.yotpo.com/r/<product_id>`) — set this as a "URL" action block before the SMS so the dynamic variable resolves.

6. **Conditional split (optional):** add a "Conditional Split" that sends a softer copy variant for first-time buyers (no loyalty hook) vs. a loyalty-hook variant for repeat buyers (e.g. *"your 5th order — would love your take"*). Repeat buyers have ~2× higher review-submission CVR, so the hook costs nothing.
7. **Review + Activate** (same as Step 2.7).

### Step 6 — Configure sender name + A/B test plan

1. **Sender name** (Postscript → Settings → Sending → Sender Name): use your brand name, not a generic "Notify" or "Marketing" — branded sender names lift SMS open rate by 30–50% over generic. Verify your brand name displays correctly on a test send (check on iPhone + Android — Android truncates after 11 chars; some Android versions after 13 chars).
2. **A/B test subject line (SMS doesn't have a subject, but the first 30 chars are the equivalent):** Klaviyo → Flows → click the SMS block → "Add A/B Test" → split 50/50 → Variant A uses the copy above, Variant B uses a question-led variant:

   ```
   A: Welcome to {{ company.name }}! Here's 10% off your first order: {{ coupon_code }}. Reply STOP to opt out.
   B: {{ first_name|default:"Hey" }}, first order? Take 10% off at {{ company.name }}: {{ coupon_code }}. Reply STOP to opt out.
   ```

   Run the A/B for 7 days (need 100+ sends per arm for statistical significance at 95% CI), then promote the winner as the canonical copy. Repeat the A/B every 60 days as voice + audience evolves.

3. **Sender-name A/B (less common but high-leverage):** split flows between your brand name and a personal name (e.g. *"Sarah at Brand"*). Personal-name senders often lift SMS reply rate by 20–40% but can confuse subscribers who don't recognize the sender. Run for 14 days, compare not just reply rate but also opt-out rate (personal senders sometimes spike opt-outs by 10–20%).

### Step 7 — Verify

This is the **runnable** verification gate. Each step has a measurement + target + pass criterion. Run the full gate before declaring the playbook shipped.

#### Gate A — Trigger fires
- **Measurement:** trigger a real signup with your test phone + email, a fresh abandoned cart with your test phone + email, and a test-mode order via Shopify Bogus Gateway.
- **Target:** each test event lands in Klaviyo's flow analytics within 60 seconds (Klaviyo → Flows → click the flow name → "Analytics" tab → "Recent Activity").
- **Pass:** SMS-1 lands in the test phone's inbox within 5 min; SMS-2 lands within 1h; SMS-3 lands within 24h; SMS-4 lands within 7d.

#### Gate B — Suppression works
- **Measurement:** with the SAME test phone + email, complete a real purchase (Shopify Bogus Gateway → confirm test order → mark as fulfilled). Trigger a new `Subscribed to SMS Marketing` event and a new `Checkout Started`.
- **Target:** SMS-1 should NOT fire on the second signup (the conditional split from Step 2.6 skips existing customers); SMS-3 should NOT fire on the second abandoned cart (Placed Order filter excludes).
- **Pass:** Postscript → Analytics → Recent Sends shows zero new SMS to the test phone in the second-cycle window.

#### Gate C — TCPA compliance
- **Measurement:** send a test SMS, then reply `STOP` from the test phone. Wait 5 min. Then send another test signup from the SAME phone.
- **Target:** the second signup-triggered SMS should NOT fire (Postscript auto-suppresses STOP replies). Check Klaviyo → Profile → test phone's profile → `Profile.SMS Consent = FALSE` after STOP reply.
- **Pass:** zero SMS lands in the test phone's inbox after the STOP reply; profile property updated to FALSE.

#### Gate D — 10DLC registration is live
- **Measurement:** Postscript → Settings → Numbers → Registration Status. Send a test SMS to a US mobile number (Verizon, AT&T, T-Mobile — test all three).
- **Target:** delivery rate ≥ 95% across all three carriers within 5 min.
- **Pass:** Postscript → Analytics → Recent Sends shows 100% delivery (delivery failures on registered numbers indicate 10DLC vetting issues — escalate to Postscript support).

#### Gate E — Discount codes resolve
- **Measurement:** in the SMS-1 and SMS-3 test messages, copy the `{{ coupon_code }}` text. Apply it at Shopify checkout with the test product in cart.
- **Target:** the code applies 10% off, the cart total drops by the expected amount, and the code is rejected on a second use (single-use per Move #1's Klaviyo unique-code config).
- **Pass:** first apply succeeds with correct discount; second apply returns "Coupon code is invalid or expired."

#### Gate F — End-to-end recovery curve
- **Measurement:** over a 14-day window, track the 4 flows' conversion rates (Klaviyo → Analytics → Flows → click each flow → "Conversion Rate" tab):
  - SMS-1: opt-in → first purchase CVR
  - SMS-2 + SMS-3: checkout-started → recovered order CVR (combined SMS-2 + SMS-3, since they're a sequence)
  - SMS-4: order-fulfilled → review-submitted CVR
- **Target:** SMS-1 CVR ≥ 8% (industry median: 6–10%), combined SMS-2 + SMS-3 CVR ≥ 6% (industry median: 4–8%), SMS-4 CVR ≥ 18% (industry median: 15–25%).
- **Pass:** all 3 CVRs meet or exceed the target. If any underperforms by >25%, run the A/B from Step 6 for that flow for 14 more days before tuning.

#### Gate G — Cost ceiling sanity check
- **Measurement:** Postscript → Settings → Billing → Current Month Usage. Divide by `Subscribers × Flows × Sends per Subscriber per Month`.
- **Target:** cost per opt-in (across all 4 flows combined) ≤ $0.08. If SMS-1 is the dominant cost (because of the welcome discount), confirm SMS-1 CVR × AOV × margin still nets a positive ROI (use `scripts/welcome_series_roi.py` from Move #4 with the SMS-1 line item).
- **Pass:** cost ceiling holds OR ROI justifies the higher cost (don't ship a flow that's bleeding margin even if the CVR looks fine).

## Metrics to track

Wire these 13 metrics to your dashboard (Triple Whale, Polar, or `dashboards/<custom>.html` once built). The first column is the source tool, the second is the target band for a healthy DTC store at $500k–$5M GMV.

| # | Metric | Source | Target band (mid-tier DTC) |
|---|---|---|---|
| 1 | SMS opt-in rate at signup | Klaviyo → Signup Forms → Conversion by Form | 25–35% / 40%+ (top decile) |
| 2 | SMS-1 click rate | Postscript → Analytics → Click rate (SMS-1 flow only) | 15–25% / 30%+ |
| 3 | SMS-1 conversion rate (opt-in → first purchase) | Klaviyo → Flows → SMS Welcome → Conversion | 6–10% / 12%+ |
| 4 | SMS-2 send volume per week | Postscript → Analytics → Sends by Flow | Track trend; spikes indicate checkout-funnel regression |
| 5 | SMS-2 click rate | Postscript → Analytics → Click rate (SMS-2 flow only) | 20–35% (SMS-2 has near-zero discount lift so click rate is the closest proxy to intent) |
| 6 | SMS-2 + SMS-3 combined recovery CVR | Klaviyo → Flows → SMS Cart Abandon 1 + 2 → Conversion (sum) | 4–8% / 10%+ |
| 7 | SMS-3 discount redemption rate | Klaviyo → Coupon Usage Report → CART10 coupon | 35–50% of SMS-3 sends → code applied at checkout |
| 8 | SMS-3 incremental revenue per send | (Klaviyo → Flow Revenue attributed to SMS-3) ÷ (SMS-3 sends) | ≥ $1.50 per SMS-3 send at $75 AOV |
| 9 | SMS-4 send volume per week | Postscript → Analytics → Sends by Flow | Track trend; should scale with fulfilled-order volume |
| 10 | SMS-4 review-submission CVR | Klaviyo → Flows → SMS Review Request → Conversion | 15–25% / 30%+ |
| 11 | Total SMS opt-out rate (per month) | Postscript → Analytics → Opt-outs | ≤ 1.5% per month; > 2.5% indicates over-sending or off-brand copy |
| 12 | Cost per SMS-1 acquired customer | (Postscript → Billing SMS-1 costs) ÷ (SMS-1 conversions) | ≤ $0.40 at $75 AOV; > $0.60 = unprofitable after margin |
| 13 | Overall SMS-attributed revenue share | Triple Whale → Channel Revenue → "Postscript/SMS" | 8–15% of total revenue at mature stores |

## Common pitfalls

The 13 pitfalls below are the failure modes that ship a "working" SMS flow that doesn't actually drive revenue. Each one has a corrective action.

1. **Skipping TCPA-compliant opt-in collection.** Symptom: Postscript refuses to send to non-consented numbers, or worse, you receive a TCPA complaint ($500+ per unsolicited message in statutory damages). **Fix:** verify every signup form, popup, and checkout has the SMS opt-in checkbox with the consent language from the Prerequisites section, wired to `sms_consent = true`. Run a 1-day audit using `SELECT COUNT(*) FROM contacts WHERE sms_consent = true;` in Klaviyo — count should match Postscript's subscriber count within 5%.
2. **Forgetting 10DLC registration.** Symptom: 0% delivery on US sends, no error in Postscript's UI, customers report "I never got the text." **Fix:** check Postscript → Settings → Numbers → Registration Status = "Approved" BEFORE turning on any flow. If unapproved, do NOT turn on the flow — start the 1–3 week registration process and revisit. Sending without 10DLC registration is also a CTIA violation.
3. **Sending SMS-1 with a sitewide discount code.** Symptom: 10% off applies to every order across the site, destroying margin; customers who would have bought at full price now wait for the next SMS. **Fix:** always use Klaviyo unique-code coupons (single-use, expires 48h after SMS send). Klaviyo → Content → Coupons → Create Coupon → type = "Unique" → expiration = 48h after send.
4. **Putting a link in SMS-1 or SMS-2.** Symptom: SMS provider flags the link as suspicious, deliverability drops 10–20%, AND the cost per SMS goes up ~$0.005 (most carriers charge more for link-containing SMS). **Fix:** SMS-1 and SMS-2 should have NO link. SMS-3 and SMS-4 are the only flows with links, and only because the discount/review conversion justifies the cost.
5. **Exceeding 160 characters.** Symptom: SMS splits into 3 messages (multi-part SMS), cost triples from $0.012 to $0.036 per send, AND the recipient sees an obviously broken concatenated message. **Fix:** keep every SMS copy in this playbook ≤ 160 chars (counted by Klaviyo's preview — check the "Character count" indicator in the SMS action block). If you must exceed, document the cost explicitly in the flow's analytics and budget for 3× the per-message cost.
6. **Not excluding existing customers from SMS-1.** Symptom: a customer buys once, unsubscribes from email, re-subscribes 6 months later, receives "Welcome to Brand! 10% off your first order" — confusing and brand-damaging. **Fix:** Step 2.6 conditional split (`Placed Order ≥ 1 time → Skip`). Test with Gate B.
7. **Forgetting the `Profile.SMS Consent = TRUE` filter.** Symptom: SMS fires to email-only subscribers who never opted into SMS — TCPA violation ($500+ per message). **Fix:** every flow's filter block must include `Profile.SMS Consent = TRUE`. The trigger condition handles most cases but the explicit filter is the safety net.
8. **Stacking SMS-2 and SMS-3 in the same minute.** Symptom: customer receives 2 SMS within 60 seconds, opt-out rate spikes 5–10× in that segment. **Fix:** Step 4.6 frequency cap (`Has received SMS from this flow in last 24h → Skip`). Also confirm the time delays (1h for SMS-2, 24h for SMS-3) don't drift into the same minute under clock skew.
9. **Sending SMS-4 before the customer has the product.** Symptom: customer receives "how's your order?" the same day it ships, has no answer, ignores the message or opts out. **Fix:** trigger = `Fulfilled Order`, NOT `Placed Order`. Fulfillment is when the product is in the customer's hands (or 24–48h away via tracking); at that point, a 7-day delay lands when they're using it.
10. **Skipping the A/B test.** Symptom: SMS-1 click rate plateaus at 12% because the copy was written once and never iterated. Top-decile stores A/B test copy every 60 days and routinely hit 25–30% click rate. **Fix:** Step 6 A/B test plan — first A/B at 7 days post-launch, then every 60 days.
11. **Ignoring opt-out rate signals.** Symptom: monthly opt-out rate creeps from 0.8% to 2.2% — you're over-sending or copy is off-brand. **Fix:** track metric #11 (opt-out rate per month). If > 2.5%, audit the last 30 days of copy + send cadence. Common causes: copy that doesn't match the brand voice, frequency stacking across flows, sending to unengaged subscribers (define "unengaged" = no SMS click + no purchase in 90 days, suppress them from promotional flows).
12. **Using a brand-name sender that doesn't render on Android.** Symptom:** brand name truncates on Android (11 char limit on some carriers, 13 on others), customers see "BRANDNAME" → "BRAN..." or similar. **Fix:** keep brand-name sender ≤ 11 chars; test on iPhone + Android + a T-Mobile / Verizon / AT&T phone each. If your brand name exceeds 11 chars, abbreviate (e.g. "Patagonia" → "PATA" — branded senders still lift open rate 20–30% over generic even abbreviated).
13. **Forgetting the `Reply STOP` footer in copy.** Symptom:** Postscript auto-handles STOP keywords but the visible footer in your copy is the legal floor for TCPA + CTIA compliance — without it, your copy fails the in-message disclosure requirement. **Fix:** every SMS in this playbook ends with `Reply STOP to opt out.` Even though Postscript adds its own STOP handling, the visible footer is non-negotiable.

## Verification

Re-run **Gates A–G from Step 7** end-to-end on a fresh test phone + email + Shopify Bogus Gateway order. All 7 gates must pass before declaring any of the 4 flows live. Cost check (Gate G) should be re-run monthly to catch cost drift from carrier rate changes or send-volume growth.

For monthly ongoing health checks, the 13-metric table above is the dashboard. If any metric drops out of band for 2 consecutive weeks, the metric's flow is the next tick's candidate for tuning.

## Cost & ROI estimate

Default case: $500k–$1M GMV DTC store, ~1k SMS subscribers, ~10k emails/mo, $75 AOV, 70% margin.

| Line item | Per-month | Per-quarter | Per-year |
|---|---|---|---|
| Postscript Starter ($49/mo minimum + usage) | $49 + ~$50 usage (5k SMS × $0.012) = ~$99 | $297 | $1,188 |
| 10DLC registration (one-time + carrier fees) | $4 one-time + ~$10/mo carrier | $34 (first quarter) | $124 (first year) |
| Klaviyo (already paid for Move #1 / #4 — SMS integration free on paid plan) | $0 incremental | $0 | $0 |
| Discount margin erosion (10% off, 35% redemption on SMS-3 only) | ~$300 (300 codes redeemed × $7.50 margin per code) | $900 | $3,600 |
| **Total SMS-1+2+3+4 cost** | **~$403/mo** | **$1,231** | **$4,912** |
| SMS-1 incremental revenue (8% CVR × 1k opt-ins × $75 AOV × 70% margin × 30% incremental) | $1,260 | $3,780 | $15,120 |
| SMS-2+3 incremental revenue (6% combined CVR × 800 cart abandoners × $75 AOV × 70% margin × 35% incremental) | $882 | $2,646 | $10,584 |
| SMS-4 review-attribution revenue (15% CVR × 800 fulfilled orders × 30-day $25 review-attributed AOV × 70% margin × 5% incremental) | $210 | $630 | $2,520 |
| **Total SMS-attributed incremental revenue** | **~$2,352/mo** | **$7,056** | **$28,224** |
| **Net ROI per month (revenue − cost)** | **+$1,949** | **+$5,825** | **+$23,312** |
| **ROI ratio (revenue ÷ cost)** | **5.8:1** | **5.7:1** | **5.7:1** |

For 100k+ contact stores, Postscript's per-message cost drops 30–50% via higher-tier plans AND the SMS-1 + SMS-3 redemption scales linearly — at $5M GMV with 20k SMS subscribers, the ROI ratio typically lands at 8–12:1.

## Next moves

The three highest-leverage follow-ups for a brand with this playbook already shipped:

1. **Build an SMS win-back flow** (referencing Move #7's SMS-1 pattern but targeting 60–90 day lapsed purchasers). SMS-5: sent 60 days after `Last Placed Order` if no new order. Single message: *"{{ first_name|default:'Hey' }}, we miss you at {{ company.name }}. 15% off your next order: {{ coupon_code }}. Reply STOP to opt out."* Expected recovery CVR: 3–5%. Pure playbook extension, ~2 hours of work.
2. **Wire MMS for product imagery.** Postscript supports MMS (image + text) on most US carriers at $0.020–$0.030 per send. SMS-2 with a product image lifts click rate 25–50% over text-only. Cost goes up ~$0.01 per send; ROI math justifies it for SMS-2 and SMS-4 (the discount-funded and review-funded flows).
3. **Two-way SMS for concierge support.** Postscript → Settings → Inbox lets customers reply to your sender name and land in a shared inbox. Wire 2–3 macro responses (FAQ, order status, human handoff) and you've got a $200/mo Gorgias replacement for a 5k-SMS-subscriber store.

## Related

- `playbooks/01-abandoned-cart-flow-klaviyo.md` — the email-side cart-abandon flow that this playbook's SMS-2 and SMS-3 reinforce. Build the email flow first; SMS adds 5–15% recovery on top.
- `playbooks/04-welcome-series-klaviyo.md` — the email-side welcome series; this playbook's SMS-1 is the SMS counterpart. SMS-1 typically lifts opt-in→purchase CVR by 20–40% on top of email-only.
- `playbooks/05-migrate-to-klaviyo-postscript.md` — the migration playbook. Complete Move #5 BEFORE Move #7; this playbook assumes Postscript + 10DLC + Klaviyo integration are already done.
- `research/00-ecommerce-ops-landscape.md` §3 (retention stack), §6 (compliance: TCPA, 10DLC, CTIA) — the source data this playbook synthesizes.
- `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript pricing), §8 (compliance tooling) — vendor comparison.
- `research/02-top-10-leverage-moves.md` #7 — the ranked move this playbook implements.

---

**Time to ship:** 4–6 hours for a small brand with Move #5 complete (Postscript + 10DLC already configured). 1–2 weeks if Move #5 hasn't shipped yet (registration takes 1–3 weeks). Reuses the Klaviyo flow editor + suppression patterns from Playbooks 01 and 04, so most of the work is SMS-specific copy + sender config.
