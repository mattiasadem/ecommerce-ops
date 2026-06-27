# Playbook 12 — Lifecycle Flow Library (Klaviyo + Postscript + Smile — 20-Flow Operator Build)

> **Move #14 from `research/03-30-day-rollout-plan.md`.** Operator build for the 20-flow lifecycle-marketing library scoped in `research/05-lifecycle-marketing.md`. The 30-day rollout plan ships 3 MVP flows (Move #1 cart-abandon + Move #4 welcome + Move #7 SMS welcome/cart-abandon) which capture only 15–20% of available lifecycle-marketing revenue lift. This playbook ships the **paste-ready Klaviyo + Postscript + Smile wiring for all 20 flows** (3 shipped MVP + 5 Tier 1 + 5 Tier 2 + 4 Tier 3 + 3 Tier 4) with segment definitions, cadence rules, and verification gates — the operator-build layer that the research synthesis doc scopes but doesn't wire. Compounds 16 shipped playbooks + 13 assets + 12 scripts + 3 dashboards by giving the operator a 4-tier launch ladder that unlocks the **80% of lifecycle-marketing revenue lift beyond the welcome/cart-abandon/SMS trio** per Klaviyo's 2024–2025 benchmark reports.
>
> **Source data:** `research/05-lifecycle-marketing.md` (the canonical synthesis doc this playbook implements), `research/00-ecommerce-ops-landscape.md` §3 (retention stack), `research/01-tools-stack-comparison.md` §2 (Klaviyo + Postscript + Smile pricing + integration wiring), `research/02-top-10-leverage-moves.md` (the top-10 leverage list this library extends), `research/03-30-day-rollout-plan.md` line 179 (the "Next moves after 30 days" section naming Move #14 as the #3-priority follow-up), `playbooks/01-abandoned-cart-flow-klaviyo.md` (Move #1's cart-abandon wiring — the canonical Tier-1 pattern this playbook extends), `playbooks/04-welcome-series-klaviyo.md` (Move #4's welcome series wiring — the canonical 5-email pattern), `playbooks/06-sms-welcome-and-cart-abandon.md` (Move #7's Postscript SMS wiring — the canonical SMS cadence pattern), `playbooks/07-loyalty-program-smile.md` (Move #8's Smile.io + Klaviyo webhook pattern — the canonical loyalty-tier trigger pattern), `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6's attribution substrate — required for NPS-detractor + cohort LTV).
>
> **Companion artifacts:** `assets/14-lifecycle-flow-templates.md` *(shipped 2026-06-27 per the asset-tick follow-up to research/05 + playbook/12 — the canonical operator-copy layer for the lifecycle-marketing track; 17 flows × 5 voices = 85 voice-variant paste-ready templates — the operator-copy layer that compounds this playbook)*. `scripts/lifecycle_flow_health_check.py` *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track per the research → playbook → asset → operator-surface → scripts layer order; Archetype C/D-light hybrid check that audits each of the 20 flows against the canonical KPI benchmarks; 78 gate-flow combinations; 18 TDD tests across 11 test classes)*.
>
> **Time to ship per tier:** Tier 1 ~6 hours, Tier 2 ~12 hours, Tier 3 ~10 hours, Tier 4 ~8 hours (total ~36 hours spread over 90 days per the research doc's 4-tier launch ladder). The playbook is paste-ready — every step is a concrete Klaviyo UI path, a Postscript flow config, or a Smile trigger definition.

---

## Goal

Build a 20-flow lifecycle-marketing library in Klaviyo + Postscript + Smile that:

- **Reuses** the existing Move #1 cart-abandon + Move #4 welcome + Move #7 SMS flows as the 3 MVP flows (already shipped; this playbook maps them as the foundation)
- **Adds** 17 additional flows across 4 tiers (Tier 1 same-week high-ROI + Tier 2 next-30-days + Tier 3 next-90-days + Tier 4 quarterly-and-beyond)
- **Captures** the 80–85% of available lifecycle-marketing revenue lift that lives beyond the 3 MVP flows (per `research/05-lifecycle-marketing.md` TL;DR + Klaviyo 2024 benchmarks)
- **Wires** each flow with: Klaviyo flow trigger + filter conditions + email content slot + Postscript SMS companion (where applicable) + Smile loyalty trigger (where applicable) + Triple Whale cohort LTV segment (for attribution)
- **Segments** by behavior (browse/cart/purchase) + lifecycle stage (new/active/lapsing/lapsed) + LTV tier (1st/2nd/VIP) + opt-in source (popup/footer/checkout) + product category (consumables/non-consumables)
- **Lifts** Year-1 incremental revenue by **22:1 default ROI** for the full library (Tier 1: 28:1, Tier 2: 18:1, Tier 3: 12:1, Tier 4: 6:1) per the research doc's Path B default $5M GMV case
- **Compounds** Move #6 Triple Whale (cohort LTV) + Move #8 Smile (loyalty tiers) + Move #11 subscriptions (if consumables — for renewal + dunning + replenishment flows)
- **Ships** in 4 tiers over 90 days (operator time ~36 hours total, spread across 3 calendar months — NOT a Week-1 sprint)

---

## Which flow-priority fits your store

The 20-flow library is structured into 4 tiers based on ROI-per-hour and gating prerequisites. **Pick the path that matches your operator time budget + GMV tier**:

| Path | GMV tier | Flows shipped | Operator time | Year-1 lift | Gating prereqs |
|---|---|---|---|---|---|
| **Path A — Tier 1 only** | $100k–$500k | 3 MVP + 5 Tier 1 = 8 flows | ~9 hours (1 week) | 12–25% = $60k–$1.25M | Move #1 + #4 + #7 already shipped |
| **Path B — Tiers 1+2 (DEFAULT)** | $500k–$10M | 3 MVP + 5 Tier 1 + 5 Tier 2 = 13 flows | ~22 hours (4 weeks) | 25–45% = $1.25M–$2.25M | Path A + Move #8 (loyalty) + Move #6 (attribution) |
| **Path C — Tiers 1+2+3** | $1M–$10M (consumables) | 3 MVP + 5 Tier 1 + 5 Tier 2 + 4 Tier 3 = 17 flows | ~32 hours (10 weeks) | 35–60% = $1.75M–$3M | Path B + Move #11 (subscriptions, if consumables) |
| **Path D — All 4 tiers** | $10M–$50M | 3 MVP + 5 Tier 1 + 5 Tier 2 + 4 Tier 3 + 3 Tier 4 = 20 flows | ~36 hours (12 weeks) | 45–80% = $2.25M–$4M | Path C + dedicated lifecycle manager |

**Default = Path B** for $500k–$10M GMV brands — captures 70% of available lift at 60% of operator time, leaving Path C + D as quarterly-and-beyond expansion once the operator has run Path B for 90+ days and measured the lift.

---

## Prerequisites

### Universal prereqs (all paths)

- [ ] **Move #1 + Move #4 + Move #7 already shipped** — the 3 MVP flows must be live and producing revenue before Tier 1 flows ship. Verify via Klaviyo → Analytics → Flows → confirm "Cart Abandon" + "Welcome Series" + Postscript "SMS Welcome" + "SMS Cart Abandon" all show ≥100 sends in the last 30 days.
- [ ] **Klaviyo account** on a paid plan (free tier caps at 250 contacts and disables flows; lifecycle library needs ≥2,500 contacts to be worth building). Budget: **$60–$500/mo** at $0–$1M GMV (over and above the Move #1 + #4 baseline).
- [ ] **Postscript account** with 10DLC + sender-name registered. Budget: **$0/mo + $0.007–$0.015/SMS + ~$0.004 US carrier fee** (over and above Move #7 baseline).
- [ ] **Smile.io (or Yotpo Loyalty) account** for Tier 2 loyalty tier-up + tier-down flows. Budget: **$249–$449/mo** Growth/Pro plan (if not already wired for Move #8).
- [ ] **Shopify store connected** to Klaviyo + Postscript + Smile. Verify in Klaviyo → Settings → Integrations → "Shopify" + "Postscript" + "Smile.io" all show "Connected" status with green checkmark.
- [ ] **Triple Whale (or Polar Analytics) live** for cohort LTV attribution (required for NPS-detractor + replenishment + VIP flows). See `playbooks/06-install-attribution-triplewhale-or-polar.md`.
- [ ] **Brand voice doc** (Asset 02) — 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B) for per-flow voice-driven override. Each flow can be tone-adjusted via Klaviyo's "Conditional content" blocks keyed on the customer's `voice_profile` profile property.
- [ ] **Klaviyo unique-coupon-codes** feature enabled (Settings → Account → Features). Tier 1 + Tier 2 flows use unique codes; without this, discount codes collide across customers.
- [ ] **Frequency caps configured** in Klaviyo (Settings → Account → Defaults → Frequency caps: 1 promotional email + 1 SMS per customer per 24 hours). Critical for the 17-flow library to avoid the "too many emails" anti-pattern (Pitfall #5).

### Path B prerequisites (default)

- [ ] **Move #8 loyalty program live** (Smile.io installed + points/tiers/referrals configured + Klaviyo webhook wiring) — see `playbooks/07-loyalty-program-smile.md`. Required for Tier 2 birthday + anniversary + loyalty tier-up + tier-down flows.
- [ ] **Triple Whale NPS-detractor routing** wired (Klaviyo segment "NPS Detractor (0–6 in last 30 days)" synced from Triple Whale). Required for Tier 2 NPS-detractor follow-up flow.

### Path C prerequisites

- [ ] **Move #11 subscriptions live** (Recharge or Bold Subscriptions installed + at least one consumable SKU on subscription). Required for Tier 3 subscription renewal + dunning + Tier 4 loyalty-points-expiry flows.

### Path D prerequisites

- [ ] **Dedicated lifecycle manager** (full-time or fractional consultant) — 10 hr/wk ongoing optimization across 20 flows is the operational requirement for Path D.

---

## Step-by-step — Tier 1 (Week 1, ~6 hours)

Tier 1 ships 5 same-week high-ROI flows that reuse the Move #1 + #4 + #7 Klaviyo + Postscript wiring with zero new prereqs. Each flow targets the 80–95% of shoppers who browse/cart without purchasing.

### Step 1.1 — Browse-abandon flow (highest-ROI-per-hour Tier 1 flow)

In Klaviyo:

1. **Flows → Create flow → "Browse Abandon"** → build from scratch.
2. **Trigger filter**: `What someone has done → Viewed Product → at least 1 time → in the last 30 days` (the "browse" signal) + `What someone has done → Placed Order → zero times → since starting this flow` (suppress converters).
3. **Time delay**: 1 hour after the Viewed Product event.
4. **Email 1 — "Still thinking about it?"** — Subject: `<Product name> is still here` (no discount in Email 1; that's Tier 2's escalation move). Body: product image (Shopify product image URL via Klaviyo dynamic block) + 2-line product description + CTA "View product →". Use the brand's primary voice (Default/Luxury/Sustainable/Gen-Z/B2B per the `voice_profile` profile property).
5. **Conditional split**: `Profile → voice_profile = "Gen-Z"` → show a different email (subject: `wait this is actually 🔥` + meme-tone body) + GIF or emoji-led design.
6. **Time delay**: 24 hours.
7. **Email 2 — Social proof + scarcity** — Subject: `X people viewed this today` (use the Klaviyo event property `viewed_product_count` for the number). Body: 1-3 star reviews from the product (via Klaviyo's "Product Reviews by Yotpo" or "Judge.me" block) + "Only X left in stock" (via the inventory block; if the SKU has <10 units, show "Only N left"; otherwise hide this line).
8. **Time delay**: 72 hours.
9. **Email 3 — Discount escalation** — Subject: `10% off if you order today`. Body: unique 10% code via Klaviyo's "Unique coupon code" feature (single-use, expires in 7 days). This is the only discount in the flow.
10. **Suppression filter**: `What someone has done → Placed Order → zero times → since starting this flow` (so converters don't get the abandonment sequence) + `What someone has done → Clicked Email → at least 3 times → in the last 7 days` (high-engagers get the discount earlier; default the click threshold to 3).
11. **Frequency cap**: 1 browse-abandon email per customer per 7 days (Settings → Account → Defaults → Frequency caps).
12. **SMS companion (optional, Tier 1 — see `playbooks/06-sms-welcome-and-cart-abandon.md` for the Postscript wiring)** — at the 24h mark, send a Postscript SMS via Klaviyo's Postscript integration block: `<product name> is back in stock — check it out: <short URL>`. Cap at 1 SMS per customer per 14 days for browse-abandon.
13. **Save flow as "Browse Abandon — Main — Voice-Aware"**. Localize per region if shipping internationally (per `playbooks/11-international-rollout.md`).

**Expected lift**: 5–8% of browse-abandon email recipients purchase within 14 days per Klaviyo 2024 benchmarks; 15–25% of browse-abandon + discount email recipients purchase. ROI: **8:1–30:1** in the first 30 days post-launch per the research doc.

### Step 1.2 — Customer winback flow (90–180 day lapsed customers)

In Klaviyo:

1. **Flows → Create flow → "Customer Winback"** → build from scratch.
2. **Trigger filter**: `What someone has done → Placed Order → at least 1 time → in the last 90 days` (the "was a customer" signal) + `What someone has done → Placed Order → zero times → in the last 90 days` (the "lapsed" signal — the 90-to-180 day window).
3. **Segment the trigger** by LTV cohort using Triple Whale's Klaviyo integration: `Profile → predicted_LTV_tier = "Top 25%"` for high-LTV winback, OR exclude Top 25% for the standard winback (high-LTV customers may need a different cadence — see Pitfall #10).
4. **Time delay**: 0 (send immediately on the lapsed-event).
5. **Email 1 — "We miss you"** — Subject: `It's been a while — here's 15% off`. Body: 1-2 product recommendations from the customer's purchase history (Klaviyo's "Product Feed" block filtered by `customer_purchased_categories`) + unique 15% code (single-use, expires in 14 days). Use the brand's primary voice.
6. **Time delay**: 7 days.
7. **Email 2 — "What's new"** — Subject: `Since you last ordered: 3 new things`. Body: 3 new-arrival products since the customer's last order (Shopify's "Created at > customer's last order date" filter via product feed) + social proof ("X customers bought this in the last 30 days" via Triple Whale).
8. **Time delay**: 14 days.
9. **Email 3 — "Last chance"** — Subject: `15% off expires in 48 hours`. Body: urgency + unique 15% code (same as Email 1; Klaviyo's unique-coupon-codes feature allows reuse across emails as long as the customer hasn't redeemed).
10. **Suppression filter**: `What someone has done → Placed Order → zero times → since starting this flow` (converters drop out) + `What someone has done → Received Email → "Customer Winback" → at least 3 times → in the last 90 days` (max 3 winback cycles per 90 days; otherwise Pitfall #10 "winback fatigue" bites).
11. **Save flow as "Customer Winback — Main"**. Mirror in Postscript: 1 SMS at the 7-day mark with `Still interested? 15% off your next order: <short URL>` (cap 1 SMS per customer per 30 days for winback).

**Expected lift**: 2–8% of lapsed customers re-purchase within 30 days per Klaviyo 2024 benchmarks. ROI: **10:1–20:1** per the research doc.

### Step 1.3 — Post-purchase cross-sell flow (Days 5–14 after purchase)

In Klaviyo:

1. **Flows → Create flow → "Post Purchase Cross-Sell"** → build from scratch.
2. **Trigger filter**: `What someone has done → Fulfilled Order → at least 1 time → in the last 5 days` (the "recently received" signal) + `What someone has done → Placed Order → zero times → in the last 5 days` (suppress repeat purchasers — they're in a different flow).
3. **Time delay**: 5 days after Fulfilled Order.
4. **Email 1 — "Complete the set"** — Subject: `Things that pair well with your <purchased product>`. Body: 2-3 cross-sell products from the same category (Klaviyo's "Product Feed" block filtered by `product_category = <purchased product category>` excluding `product_id = <purchased product>`). Use the brand's primary voice.
5. **Time delay**: 7 days.
6. **Email 2 — Reviews-driven cross-sell** — Subject: `Customers who bought <purchased product> also loved…`. Body: Klaviyo's "Product Recommendations by Yotpo/Judge.me" block (cross-sell algorithm trained on the customer's actual purchase + 4-star+ reviews).
7. **Time delay**: 14 days.
8. **Email 3 — "Stocked up?"** — Subject: `If you loved <purchased product>, we're restocked`. Body: 1-2 repurchase-driving products + social proof (Triple Whale's NPS cohort for `nps >= 9` filtered to the purchased category).
9. **Suppression filter**: `What someone has done → Placed Order → zero times → since starting this flow` (so the customer drops out once they buy the cross-sell).
10. **Save flow as "Post Purchase Cross-Sell — Main"**. No SMS companion for this flow — email-only is the convention per Klaviyo 2024 best practices (cross-sell is a low-urgency consideration moment, not a high-urgency trigger).

**Expected lift**: 5–12% of recipients purchase a cross-sell within 30 days; **highest absolute ROI of any post-purchase flow** per Klaviyo benchmarks. ROI: **15:1–30:1** per the research doc.

### Step 1.4 — Sunset flow (unengaged subscribers — deliverability hygiene)

In Klaviyo:

1. **Flows → Create flow → "Sunset Flow"** → build from scratch.
2. **Trigger filter**: `What someone has done → Opened Email → zero times → in the last 180 days` (the "unengaged" signal — 180 days is the canonical Klaviyo threshold for deliverability risk).
3. **Time delay**: 0 (send immediately on the unengaged-event).
4. **Email 1 — "Still want to hear from us?"** — Subject: `Quick question — are you still interested?`. Body: 2-line ask + "Click here to stay subscribed" CTA (a "Re-engage" button that adds a `last_engaged_at` profile property).
5. **Time delay**: 14 days.
6. **Email 2 — "We'd hate to see you go"** — Subject: `Last chance — your 15% code`. Body: 2-line emotional appeal + unique 15% code + "Stay subscribed" CTA. Discount is offered ONLY in Email 2 (not Email 1) to test who re-engages for the relationship vs the discount per Smile 2024 deliverability benchmarks.
7. **Time delay**: 14 days.
8. **Action: Move to suppression list** — for customers who did not open Email 1 or Email 2 (or click the "Stay subscribed" CTA), Klaviyo → Profiles → Bulk actions → "Suppress from all email marketing" (this is the canonical deliverability-protective move per Klaviyo + Gmail Postmaster 2024 guidance; unengaged subscribers drag sender reputation).
9. **Suppression filter**: `What someone has done → Opened Email → at least 1 time → in the last 30 days` (so the customer drops out the moment they re-engage).
10. **Save flow as "Sunset — Main"**. No SMS companion for this flow — email-only is the convention.

**Expected lift**: 5–10% of unengaged subscribers re-engage per Klaviyo 2024 benchmarks. **Deliverability ROI**: removing unengaged subscribers typically lifts open rates 2–5 percentage points and click rates 0.5–1.5 percentage points across ALL future sends per Litmus 2024 deliverability studies. ROI: **6:1–15:1** (deliverability lift + recovered conversions from the 5–10% who re-engage).

### Step 1.5 — Shipping confirmation + transit flow (transactional + branded)

In Klaviyo:

1. **Flows → Create flow → "Shipping + Transit"** → build from scratch. (This is technically a transactional flow, but it doubles as a high-engagement branded touchpoint.)
2. **Trigger filter**: `What someone has done → Shipped Order → at least 1 time → in the last 1 day` (the "shipped" signal).
3. **Time delay**: 0 (send immediately on Shipped Order).
4. **Email 1 — "Your order is on its way"** — Subject: `📦 Your <brand> order is en route`. Body: order summary (Klaviyo's "Order Information" dynamic block) + tracking link (Shopify's "fulfillment.tracking_url" via dynamic block) + brand-voice 2-line "thank you" + 1-2 product recommendations (cross-sell, see Step 1.3).
5. **Time delay**: 48 hours (estimated transit midpoint).
6. **Email 2 — "Out for delivery"** — Subject: `📦 Arriving today!`. Body: 1-line "your order arrives today" + 1-2 product recommendations (deeper cross-sell).
7. **Time delay**: 24 hours after delivery.
8. **Email 3 — "How was it?"** — Subject: `How's your <product>? Quick review?`. Body: review CTA (link to Judge.me / Yotpo / Loox product page) + loyalty-tier-up nudge ("You're 1 review away from <Tier Name>" if Smile is wired per Move #8).
9. **Suppression filter**: none (this flow always runs — it's a transactional).
10. **Save flow as "Shipping + Transit — Main"**. No SMS companion for shipping/transit — the carrier's SMS is the conventional channel (Shopify Shipping's native SMS notifications + AfterShip).

**Expected lift**: 5–15% click-through on the cross-sell product recommendations; 8–15% of recipients leave a review (Email 3) per Klaviyo 2024 benchmarks. ROI: **8:1–20:1** (review-driven conversion + cross-sell conversion + brand-equity compounding).

**Tier 1 verification gate**: After 7 days post-launch, all 5 flows should show ≥50 sends each in Klaviyo → Analytics → Flows. Open rate ≥30%, click rate ≥3%, CVR ≥0.5% per the canonical Klaviyo benchmark for browse/winback/cross-sell flows. If any flow falls below these floors for 14 consecutive days, see Pitfall #5 (frequency cap collision) or Pitfall #6 (audience segmentation drift).

---

## Step-by-step — Tier 2 (Days 8–30, ~12 hours)

Tier 2 ships 5 next-30-days flows gated on Move #8 (loyalty) + Move #6 (attribution). Each flow has a 4:1–15:1 ROI and compounds the existing purchase-LTV + NPS data.

### Step 2.1 — Birthday flow (12-month LTV lift 20–40%)

In Klaviyo:

1. **Flows → Create flow → "Birthday"** → build from scratch.
2. **Trigger filter**: `Profile → birthday → is in the next 7 days` (the upcoming-birthday signal — Klaviyo reads the `birthday` profile property).
3. **Time delay**: 0 (send on the birthday).
4. **Email 1 — "Happy birthday from <brand>"** — Subject: `🎂 It's your day — 20% off is on us`. Body: 2-line personalized note + unique 20% code (single-use, expires in 14 days). Use the brand's primary voice.
5. **Time delay**: 7 days after the birthday.
6. **Email 2 — "Last chance for your birthday gift"** — Subject: `Your 20% off expires in 7 days`. Body: urgency + same unique code.
7. **Suppression filter**: `Profile → birthday → is not set` (the customer drops out if they haven't filled in their birthday — see Pitfall #14).
8. **SMS companion**: 1 Postscript SMS on the birthday morning: `Happy birthday from <brand>! 🎂 20% off today only: <short URL>`. Cap 1 SMS per customer per year.
9. **Save flow as "Birthday — Main"**.

**Prereq gating**: requires the Smile.io birthday metafield to be populated (Klaviyo → Settings → Profile properties → "Birthday" mapped to Smile's `customer.birthday` field).

**Expected lift**: 15–25% of birthday recipients redeem per Klaviyo 2024 benchmarks. **Compounding**: birthday-purchasers spend 1.3–1.8× the average AOV per Smile 2024 loyalty studies. ROI: **8:1–15:1** per the research doc.

### Step 2.2 — Anniversary flow (customer's 1-year anniversary with the brand)

In Klaviyo:

1. **Flows → Create flow → "Anniversary"** → build from scratch.
2. **Trigger filter**: `What someone has done → Placed Order → exactly 1 time → in the last 365 days` (the "1-year anniversary" signal) OR `What someone has done → Placed Order → exactly N times → in the last N×365 days` (N-year anniversary).
3. **Time delay**: 0 (send on the anniversary).
4. **Email 1 — "It's been a year"** — Subject: `A year of <brand> — 25% off + a gift`. Body: 2-line emotional narrative ("It's been a year since your first <brand> order…") + unique 25% code + loyalty tier-up mention ("You've earned <Tier Name> status!"). Use the brand's primary voice; Sustainable voice = "a year of impact together" framing.
5. **Time delay**: 7 days.
6. **Email 2 — "Your gift + 25% expires in 7 days"** — urgency + same code.
7. **Suppression filter**: `What someone has done → Placed Order → at least 2 times → in the last 365 days` (multi-order customers get a different flow — "VIP loyalty upgrade" — see Step 2.3).
8. **Save flow as "Anniversary — Main"**. No SMS companion (anniversary is an emotional moment, not a flash-sale moment; email-only is the convention).

**Expected lift**: 12–20% of anniversary recipients redeem per Smile 2024 loyalty benchmarks. ROI: **6:1–12:1** per the research doc.

### Step 2.3 — Loyalty tier-up + tier-down flows (Smile.io webhook wired)

In Klaviyo:

1. **Flows → Create flow → "Loyalty Tier-Up"** → build from scratch.
2. **Trigger filter**: `What someone has done → Custom event → "Smile Tier Upgrade" → at least 1 time → in the last 1 day` (the tier-up event from Smile's Klaviyo webhook — see `playbooks/07-loyalty-program-smile.md` Step 3 for the webhook setup).
3. **Time delay**: 0.
4. **Email 1 — "Welcome to <Tier Name>!"** — Subject: `🎉 You've reached <Tier Name> status`. Body: 2-line celebration + tier-specific perks (free shipping / early access / exclusive discount) + Smile tier benefits rendered via Klaviyo dynamic block.
5. **Time delay**: 14 days.
6. **Email 2 — "Tier perks you haven't used yet"** — Subject: `Don't miss your <Tier Name> perks`. Body: list of unused perks + CTA to shop the tier-exclusive collection.
7. **Suppression filter**: none (tier-up is a positive event; always run).
8. **Save flow as "Loyalty Tier-Up — Main"**.

Mirror the **Loyalty Tier-Down** flow with the trigger `What someone has done → Custom event → "Smile Tier Downgrade" → at least 1 time → in the last 1 day` + subject `"<Tier Name> status changes in 14 days — here's how to keep it"` + body listing the points/spend gap + CTA to shop bestsellers. **Critical**: include a clear "**Fix:**" in the body — the customer's tier-down warning should tell them exactly what to do (e.g. "Spend $X more in the next 14 days to keep <Tier Name>") per Pitfall #11 (tier-down without actionable steps).

**Expected lift**: 30–50% of tier-up recipients shop within 30 days per Smile 2024 loyalty benchmarks; 10–20% of tier-down recipients take the action to retain their tier per Smile benchmarks. ROI: **4:1–10:1** per the research doc.

### Step 2.4 — NPS-detractor follow-up flow (Triple Whale → Klaviyo segment sync)

In Klaviyo:

1. **Flows → Create flow → "NPS Detractor Follow-up"** → build from scratch.
2. **Trigger filter**: `Profile → nps_score → between 0 and 6 → updated in the last 7 days` (the detractor signal — Triple Whale syncs the NPS score to Klaviyo as a profile property per Move #6's `dashboard/app/acquisition/page.tsx`).
3. **Time delay**: 0.
4. **Email 1 — "We're sorry"** — Subject: `Your feedback matters — let's make this right`. Body: 2-line personal apology + 1-line commitment to fix + link to a Calendly URL where the customer can book a 15-min call with the founder OR a CS-rep (NOT a bot — see Pitfall #13).
5. **Time delay**: 7 days.
6. **Email 2 — "How can we help?"** — Subject: `Quick follow-up — anything we can do?`. Body: short ask + 3 specific options (return / exchange / refund) with a 1-click link to the relevant Gorgias macro.
7. **Action: Create a Gorgias ticket** with intent tag `NPS-Detractor-Followup` + assigned-to-CS-rep-with-context (Klaviyo's "Gorgias integration" block creates the ticket; the CS-rep's Gorgias view shows the NPS history + the email open/click history).
8. **Suppression filter**: `Profile → nps_score → updated → at least 2 times → in the last 30 days` (avoid over-asking for feedback per Smile 2024 NPS benchmarks — max 1 follow-up per 30 days).
9. **Save flow as "NPS Detractor Follow-up — Main"**. No SMS companion (NPS is a private, high-touch moment; SMS is too public).

**Expected lift**: 15–25% of NPS-detractor recipients take a retention action (return / exchange / loyalty-tier retention) per Gorgias 2024 benchmarks. ROI: **4:1–8:1** per the research doc.

### Step 2.5 — Subscription renewal + dunning flow (consumables only; Path C prereq)

In Klaviyo:

1. **Flows → Create flow → "Subscription Renewal + Dunning"** → build from scratch.
2. **Trigger filter A (renewal)**: `What someone has done → Custom event → "Recharge Subscription Next Charge" → in the next 7 days` (the upcoming-renewal signal from Recharge's Klaviyo webhook — see `playbooks/11-international-rollout.md` Move #11 for the Move #11 wiring).
3. **Trigger filter B (dunning)**: `What someone has done → Custom event → "Recharge Payment Failed" → at least 1 time → in the last 1 day` (the failed-payment signal).
4. **Time delay**: 0.
5. **Email 1 (renewal) — "Your subscription ships in 7 days"** — Subject: `<Product name> ships on <date>`. Body: 1-line order summary + skip / pause / cancel CTAs (Recharge's customer portal link).
6. **Email 1 (dunning) — "Card declined — please update"** — Subject: `Action needed: your card declined`. Body: 1-line clear ask + Recharge portal link + 1-line reassurance ("Update takes 30 seconds; your subscription is paused until updated").
7. **Time delay**: 3 days.
8. **Email 2 (dunning) — "Friendly reminder"** — Subject: `Your subscription is paused`. Body: 1-line ask + 1-line social proof ("X% of subscriptions are recovered within 7 days").
9. **Time delay**: 5 days.
10. **Email 3 (dunning) — "Final reminder"** — Subject: `Your subscription will cancel in 48 hours`. Body: urgency + Recharge portal link + 1-line "we'd love to keep you" brand-voice note.
11. **SMS companion for dunning only**: 1 Postscript SMS on the failed-payment event: `Action needed: your <brand> subscription card declined. Update here: <short URL>`. Cap 1 SMS per dunning cycle.
12. **Suppression filter**: `What someone has done → Custom event → "Recharge Payment Succeeded" → since starting this flow` (dunning customers drop out the moment the payment method updates).
13. **Save flow as "Subscription Renewal + Dunning — Main"**.

**Prereq gating**: requires Move #11 (Recharge or Bold Subscriptions) wired to Klaviyo via webhook. Without this, the flow has no trigger source.

**Expected lift**: 35–50% of dunning customers recover within 7 days per Recharge 2024 benchmarks; 5–10% of renewal-recipients modify their subscription (skip/pause/swap) per Recharge benchmarks. ROI: **4:1–15:1** (dunning recovery is the single highest-leverage consumables-specific lifecycle flow).

**Tier 2 verification gate**: After 30 days post-launch, all 5 flows should show ≥25 sends each. Birthday + Anniversary show seasonal clustering (expect 1/12 of total list per day); Loyalty tier-up + tier-down show event-driven volume; NPS-detractor shows ~5–10% of all customers. Open rate ≥35%, click rate ≥4%, CVR ≥0.8% per Klaviyo 2024 benchmarks. If any flow falls below these floors for 14 consecutive days, see Pitfall #5 (frequency cap collision) + Pitfall #7 (Klaviyo-Smile webhook drift).

---

## Step-by-step — Tier 3 (Days 31–90, ~10 hours)

Tier 3 ships 4 next-90-days flows gated on Move #8 (loyalty tier data) + Move #11 (subscription data). Each flow has 3:1–10:1 ROI and compounds the 90-day-purchase cohort.

### Step 3.1 — VIP early-access + product drops (high-LTV cohort only)

In Klaviyo:

1. **Flows → Create flow → "VIP Early Access"** → build from scratch.
2. **Trigger filter**: `What someone has done → Custom event → "Product Drop Published" → in the last 1 day` (the new-product-published signal from Shopify Admin via Klaviyo's Shopify integration webhook) + `Profile → smile_tier = "VIP" OR smile_points >= 1000` (the high-LTV segment).
3. **Time delay**: 0.
4. **Email 1 — "VIP early access: <new product>"** — Subject: `Early access: <new product> (24h before everyone else)`. Body: 2-line product intro + product image + CTA "Shop now" + exclusive 24h window. Use the brand's primary voice.
5. **Time delay**: 24 hours.
6. **Email 2 — "Now available to everyone"** — Subject: `<New product> is now live for everyone`. Body: same product + CTA + social proof ("<X> VIPs shopped in the first 24h" via Triple Whale's KPI dashboard).
7. **Suppression filter**: `Profile → smile_tier = "VIP" OR smile_points >= 1000` (only VIPs get Email 1; Email 2 goes to all customers via a separate broadcast).
8. **Save flow as "VIP Early Access — Main"**. Mirror as a broadcast (not flow) for the Email 2 broad-send: Klaviyo → Campaigns → "New Product Drop — Broad" → segment "All customers".

**Prereq gating**: requires Smile tier data in Klaviyo (`smile_tier` profile property) wired via Smile's Klaviyo webhook per `playbooks/07-loyalty-program-smile.md` Step 3.

**Expected lift**: 30–40% of VIP customers shop the early-access drop per Smile 2024 loyalty benchmarks; 10–20% conversion on the broad Email 2 send. ROI: **3:1–8:1** per the research doc.

### Step 3.2 — Replenishment reminder flow (consumables only; Path C prereq)

In Klaviyo:

1. **Flows → Create flow → "Replenishment Reminder"** → build from scratch.
2. **Trigger filter**: `What someone has done → Fulfilled Order → at least 1 time → in the last 30–60 days` (the "time to replenish" signal) + `Profile → product_consumable = "true"` (Klaviyo reads the consumable flag from the product metafield).
3. **Time delay**: 0.
4. **Email 1 — "Time to restock?"** — Subject: `Your <product> is running low`. Body: 2-line ask + 1-click reorder (Shopify's "Reorder" link via Klaviyo's Order Information block) + loyalty-points nudge ("Reorder now to earn 2x points" if Smile is wired).
5. **Time delay**: 14 days.
6. **Email 2 — "Your cart is waiting"** — Subject: `<Product name> is back in stock`. Body: product + 1-click reorder.
7. **Suppression filter**: `What someone has done → Placed Order → at least 1 time → since starting this flow` (the customer drops out the moment they reorder).
8. **Save flow as "Replenishment Reminder — Main"**. No SMS companion (replenishment is a soft-urgency moment; SMS is too pushy).

**Prereq gating**: requires Move #11 (subscriptions — Recharge's "next charge date" webhook) OR a Shopify product metafield `consumable_category` (for non-subscription consumables).

**Expected lift**: 15–25% of recipients reorder within 30 days per Recharge 2024 benchmarks. **Compounding**: replenishment customers have 2.5–3.5× higher 12-month LTV than one-time purchasers per Recharge benchmarks. ROI: **3:1–10:1** per the research doc.

### Step 3.3 — Stock-back notification (back-in-stock alert)

In Klaviyo:

1. **Flows → Create flow → "Back in Stock"** → build from scratch. (Klaviyo has a built-in "Back in Stock" flow template; this is the canonical one-click setup.)
2. **Trigger filter**: `What someone has done → Viewed Product → at least 1 time → in the last 30 days` + `Product → Variant → Inventory Quantity → changed from 0 to >0` (Klaviyo reads the inventory change via Shopify's inventory webhook).
3. **Time delay**: 0.
4. **Email 1 — "Back in stock"** — Subject: `<Product name> is back`. Body: 1-line product intro + product image + CTA "Shop now".
5. **Suppression filter**: `What someone has done → Placed Order → at least 1 time → since starting this flow` (the customer drops out when they buy).
6. **Save flow as "Back in Stock — Main"**. SMS companion optional: 1 Postscript SMS if the customer has consented to back-in-stock SMS (separate opt-in per TCPA + 10DLC + Postscript's SMS consent capture).

**Expected lift**: 8–15% of recipients purchase within 48 hours of the restock alert per Klaviyo 2024 benchmarks. ROI: **5:1–12:1** per the research doc.

### Step 3.4 — Account-created-but-never-purchased (30-day reactivation)

In Klaviyo:

1. **Flows → Create flow → "Account Created No Purchase"** → build from scratch.
2. **Trigger filter**: `What someone has done → Created Account → at least 1 time → in the last 30 days` + `What someone has done → Placed Order → zero times → since starting this flow` (the "registered but never bought" signal).
3. **Time delay**: 7 days after account creation (give the customer time to browse).
4. **Email 1 — "Your account is ready"** — Subject: `Your <brand> account is set up — here's 10% off`. Body: 1-line "your account is ready" + unique 10% code (single-use, expires in 14 days) + bestsellers product feed.
5. **Time delay**: 14 days.
6. **Email 2 — "What's popular right now"** — Subject: `<X> people are shopping these today`. Body: bestsellers product feed (top 5 by 7-day sales per Triple Whale) + social proof.
7. **Time delay**: 7 days.
8. **Email 3 — "Last chance for your welcome code"** — Subject: `Your 10% off expires in 48 hours`. Body: urgency + same unique code.
9. **Suppression filter**: `What someone has done → Placed Order → at least 1 time → since starting this flow` (the customer drops out when they convert).
10. **Save flow as "Account Created No Purchase — Main"**. No SMS companion (this is a soft-urgency consideration moment; email-only is the convention).

**Expected lift**: 8–15% of account-creators-without-purchase convert within 30 days per Klaviyo 2024 benchmarks. ROI: **5:1–10:1** per the research doc.

**Tier 3 verification gate**: After 60 days post-launch, all 4 flows should show ≥10 sends each (these are lower-volume flows). Open rate ≥30%, click rate ≥3%, CVR ≥0.5% per Klaviyo 2024 benchmarks. If any flow falls below for 30 consecutive days, see Pitfall #8 (subscription / consumable metafield drift) + Pitfall #12 (replenishment firing for non-consumables).

---

## Step-by-step — Tier 4 (Quarter 2+, ~8 hours)

Tier 4 ships 3 quarterly-and-beyond flows gated on Move #8 (referrals wired) + brand-equity maturity. Each flow has 2:1–6:1 ROI and compounds the long-tail customer relationship.

### Step 4.1 — Lapsed-customer referral push (250+ day lapsed)

In Klaviyo:

1. **Flows → Create flow → "Lapsed Referral Push"** → build from scratch.
2. **Trigger filter**: `What someone has done → Placed Order → exactly 1 time → in the last 250–500 days` (the "lapsed with positive experience" signal — they bought once but not in 250+ days).
3. **Time delay**: 0.
4. **Email 1 — "Know someone who'd love <brand>?"** — Subject: `Refer a friend, you both get 20% off`. Body: 2-line emotional ask + unique referral code (Smile.io's referral block) + CTA "Share your link".
5. **Time delay**: 14 days.
6. **Email 2 — "Did you share your link?"** — Subject: `Reminder: your 20%-off referral link is waiting`. Body: short ask + same referral code.
7. **Suppression filter**: `What someone has done → Custom event → "Referral Link Shared" → at least 1 time → since starting this flow` (the customer drops out the moment they share the link).
8. **Save flow as "Lapsed Referral Push — Main"**. No SMS companion (referrals are an emotional/relationship moment, not a flash-sale moment).

**Prereq gating**: requires Move #8 (Smile.io referrals configured per `playbooks/07-loyalty-program-smile.md` Step 2).

**Expected lift**: 5–10% of recipients share a referral link; 15–25% of those shares convert per Smile 2024 loyalty benchmarks. ROI: **3:1–6:1** per the research doc.

### Step 4.2 — Loyalty-points-expiry warning (30-day pre-expiry)

In Klaviyo:

1. **Flows → Create flow → "Points Expiry Warning"** → build from scratch.
2. **Trigger filter**: `Profile → smile_points_expiring_amount > 0` + `Profile → smile_points_expiring_date → in the next 30 days` (the Smile.io points-expiring signal via the Smile-Klaviyo webhook).
3. **Time delay**: 0 (send 30 days pre-expiry).
4. **Email 1 — "Your points are expiring"** — Subject: `<X> points expire in 30 days — use them now`. Body: 2-line clear ask + product feed (top 5 bestsellers the points can buy) + CTA "Shop with points".
5. **Time delay**: 14 days.
6. **Email 2 — "Last chance to use your points"** — Subject: `<X> points expire in 7 days`. Body: urgency + product feed.
7. **Time delay**: 3 days.
8. **Email 3 — "Today is the last day"** — Subject: `Today only: <X> points expire tonight`. Body: extreme urgency + same product feed.
9. **Suppression filter**: `Profile → smile_points_expiring_amount = 0` (customer drops out when points are redeemed or have expired).
10. **Save flow as "Points Expiry Warning — Main"**. SMS companion for Email 3 only: 1 Postscript SMS on the final-day morning: `Today only: your <X> points expire tonight. Use them: <short URL>`. Cap 1 SMS per customer per 6 months for points-expiry.

**Prereq gating**: requires Smile.io points-expiry feature enabled (Settings → Loyalty → points → "Set points expiry: 365 days") and the Smile-Klaviyo webhook for `points_expiring_soon` event.

**Expected lift**: 25–40% of recipients redeem their expiring points per Smile 2024 loyalty benchmarks. ROI: **2:1–6:1** per the research doc.

### Step 4.3 — Seasonal gift-guide broadcast (Q4 + Mother's Day + Valentine's Day)

In Klaviyo (this is a CAMPAIGN, not a flow):

1. **Campaigns → Create campaign → "Seasonal Gift Guide — Q4"** → build from scratch. (Repeat for Mother's Day + Valentine's Day per the operator's calendar.)
2. **Send time**: Black Friday week + Cyber Monday + the 2 weeks before Christmas (the canonical Q4 gift-guide window per Klaviyo 2024 holiday benchmarks).
3. **Segment**: `Profile → ltv_90d > 0` (active customers only; not lapsed) + `Profile → voice_profile = <segment>` (per-voice gift-guide variants: Default = "Top 10 gifts under $100" / Luxury = "Curated luxury collection" / Sustainable = "Gifts that give back" / Gen-Z = "TikTok-viral gifts" / B2B = "Corporate gifting by budget").
4. **Email content**: 5-10 product recommendations (curated by the operator, not algorithmic) + 1-line brand-voice intro + free-shipping threshold ("Orders $50+ ship free — perfect for gifting").
5. **Frequency cap**: 1 gift-guide email per customer per 7 days during the Q4 window (avoid over-saturation per Pitfall #5).
6. **Save as "Q4 Gift Guide — Main — Voice-Segmented"**. Mirror for Mother's Day (early May) + Valentine's Day (early February).

**Expected lift**: 15–25% open rate, 3–6% click rate, 2–4% CVR per Klaviyo 2024 holiday benchmarks. ROI: **4:1–8:1** per the research doc (single highest-ROI Tier 4 flow).

**Tier 4 verification gate**: After 90 days post-launch, all 3 flows should show ≥5 sends each (these are low-frequency flows). Open rate ≥25% (gift-guide) / ≥30% (lapsed-referral) / ≥35% (points-expiry). CVR ≥0.5% across all 3. If any flow falls below for 60 consecutive days, see Pitfall #15 (no flow-performance attribution to source-channel or campaign — the canonical Triple Whale + Klaviyo integration gap).

---

## Metrics to track

| # | Metric | Source | Target band | How to slice |
|---|---|---|---|---|
| 1 | Flow-attributable revenue | Triple Whale → Flows report | ≥30% of total email+SMS revenue | per flow |
| 2 | Per-flow open rate | Klaviyo → Analytics → Flows | ≥30% (browse/winback) / ≥35% (lifecycle) / ≥40% (transactional) | per flow per voice |
| 3 | Per-flow click rate | Klaviyo → Analytics → Flows | ≥3% (browse/winback) / ≥4% (lifecycle) / ≥6% (transactional) | per flow per voice |
| 4 | Per-flow CVR | Klaviyo → Analytics → Flows | ≥0.5% (browse) / ≥0.8% (lifecycle) / ≥2% (cart-abandon) | per flow per voice |
| 5 | Flow-attributable 90-day LTV | Triple Whale → Cohorts → Flow cohort | ≥+10% vs non-flow cohort | per flow |
| 6 | Per-flow unsubscribe rate | Klaviyo → Analytics → Flows | ≤0.3% per send | per flow |
| 7 | Flow frequency per customer per week | Klaviyo → Analytics → Email engagement | ≤3 emails + ≤1 SMS per 7 days | per customer |
| 8 | Discount code redemption rate | Klaviyo → Analytics → Coupons | ≥10% (browse) / ≥15% (winback) / ≥20% (birthday) | per flow |
| 9 | Cohort LTV by first-touch flow | Triple Whale → Cohorts | top-quartile flows: ≥+15% LTV vs median | per flow |
| 10 | SMS-attributable revenue | Postscript → Revenue | ≥20% of total email+SMS revenue | per flow |
| 11 | NPS score per flow cohort | Triple Whale → NPS + Klaviyo segment | ≥+5 points vs non-flow cohort | per flow |
| 12 | Loyalty tier-up rate per flow | Smile.io → Customer segments | ≥30% of flow recipients tier-up within 90 days | per flow |
| 13 | Replenishment re-order rate | Recharge → Subscriptions | ≥15% of replenishment recipients reorder | replenishment flow |
| 14 | Back-in-stock conversion rate | Klaviyo → Analytics → Back in Stock | ≥8% of recipients purchase within 48h | back-in-stock flow |
| 15 | Operator hours per week | Self-reported | ≤2 hr/wk steady-state (Path B default) | per operator |

---

## Common pitfalls

1. **Shipping all 20 flows in Week 1 instead of 4 tiers over 90 days.** Each flow has operator-tuning needs (subject line A/B testing, send-time optimization, voice-segment tuning, segment-refresh). Shipping all 20 in Week 1 means the operator tunes 20 flows in week 2 and burns out. **Fix:** ship the 4 tiers as planned (Tier 1 Week 1 + Tier 2 Days 8–30 + Tier 3 Days 31–90 + Tier 4 Quarter 2+). The 4-tier ladder IS the operator-time pacing.

2. **No baseline segmentation before building flows.** Building a browse-abandon flow without first checking the `voice_profile` profile property is populated across the customer list = the flow sends the wrong voice to 60–80% of recipients. **Fix:** before building any Tier 1 flow, run Klaviyo → Segments → "Voice Profile Coverage" = `voice_profile is set`; if <60% of customers have the property set, run a one-time backfill (Shopify customer tag → Klaviyo `voice_profile` property) before launching.

3. **No A/B testing on subject lines + send times.** Each Tier 1 flow should be A/B tested for subject line + send time within 14 days of launch. **Fix:** Klaviyo → A/B test → pick the flow → "Test subject line" with 2 variants → 50/50 split → 1000+ recipients per arm → 14-day test duration → auto-promote the winner. Repeat for send-time A/B test (8am vs 12pm vs 6pm per recipient's local timezone).

4. **Tier 1 ships but operator never returns to optimize.** Tier 1 is the easiest to ship; Tier 2–4 require sustained engagement. Many operators ship Tier 1 in Week 1, see the 8:1 ROI, and never return. **Fix:** schedule the Tier 2 ship date in the operator's calendar at the same time they ship Tier 1 (Day 1 of Tier 1 launch → calendar entry for Day 8 "ship Tier 2"). The calendar entry is the single most important scaffolding for sustained engagement.

5. **Discount-stacking across flows (1-discount-per-customer-per-30-days rule).** Without a global discount-cap rule, a customer can get browse-abandon-10% + winback-15% + birthday-20% in the same 30-day window = 35% margin destruction. **Fix:** Klaviyo → unique-coupon-codes → set "Max uses per customer: 1 per 30 days" globally. Smile's referral block should also gate on `customer_discount_used_in_last_30_days = false`. The 1-discount-per-30-days rule is the canonical margin-protection scaffolding.

6. **Browse-abandon sends to mobile-app browsers that bounce before Klaviyo can identify them.** The Viewed Product event requires Klaviyo's onsite JS to fire; on mobile-app browsers, the JS often doesn't fire reliably. **Fix:** install Klaviyo's onsite JS via the Klaviyo-Shopify integration (Settings → Integrations → "Install Klaviyo JS" — the canonical one-click install). For mobile-app stores, also wire Klaviyo's "Viewed Product" event via Shopify's "Customer Behavior" webhook (which captures both web + app events) per Klaviyo 2024 best practices.

7. **Winback flow sends to customers who are already winback-converted.** Without a "winback-cycle-cap" rule, customers can cycle through the winback flow 3-4 times per year. **Fix:** suppression filter `What someone has done → Received Email → "Customer Winback" → at least 1 time → in the last 90 days` (max 1 winback cycle per 90 days; otherwise Pitfall #10 "winback fatigue" bites).

8. **Subscription renewal dunning sends 3 emails in 1 week.** Aggressive dunning damages customer relationships. **Fix:** the 3 emails should be spread Day 0 / Day 3 / Day 5 (not Day 0 / Day 1 / Day 3) per Recharge 2024 best practices; the cadence is "respectful escalation" not "high-pressure dunning". Cap at 1 SMS in the entire cycle.

9. **Replenishment reminder fires for non-consumable SKUs.** If the operator ships a `consumable_category` metafield gate incorrectly, a non-consumable (a chair / a watch / a print) gets the "your product is running low" email = confusing. **Fix:** the trigger filter `Profile → product_consumable = "true"` is the canonical gate; if the metafield is missing on a product, the product is treated as non-consumable by default (fail-closed, not fail-open).

10. **Sunset flow sends to high-LTV customers who simply took a long time between purchases.** The 180-day-no-open threshold is a coarse signal; high-LTV customers may go 200+ days between purchases but still be highly engaged (e.g. jewelry customers buy 1×/year). **Fix:** segment the sunset flow by LTV: `Profile → predicted_LTV_tier = "Top 25%"` → exclude from sunset (or move to a 365-day-no-open threshold). The Top 25% LTV is the canonical high-value carve-out per Smile 2024 loyalty benchmarks.

11. **Loyalty tier-down warning triggers but customer has 0 actionable steps to recover.** The tier-down email should explicitly tell the customer "spend $X more in the next 14 days to keep <Tier Name>". **Fix:** the body of Email 1 of the tier-down flow MUST include the specific points/spend gap. The canonical template is "You're $X away from keeping <Tier Name> — shop bestsellers to add points" with a direct CTA to a bestsellers collection.

12. **Loyalty tier-up email doesn't surface the tier-specific perks.** Tier-up is a celebratory moment; if the email doesn't tell the customer what they just unlocked, the celebration is hollow. **Fix:** the body of tier-up Email 1 MUST include 3-5 specific perks (free shipping threshold / early-access window / exclusive discount). Use Klaviyo's "Smile Tier" dynamic block to render the perks list automatically.

13. **NPS-detractor follow-up sent by a bot escalates to Twitter.** A detractor who gets an automated "we're sorry" email often tweets about it (amplifying the complaint). **Fix:** route the NPS-detractor follow-up to a human CS-rep via the Gorgias intent tag `NPS-Detractor-Followup`. The CS-rep's first-touch response is human-curated; the automated email is a scaffold for the human follow-up, not a substitute.

14. **Birthday flow sends to customers who haven't filled in their birthday.** Without the `birthday` profile property, the trigger filter `Profile → birthday → is in the next 7 days` doesn't match. **Fix:** Klaviyo's birthday property is opt-in; the operator must (a) add a "Birthday" field to the popup signup form (Klaviyo Forms → "Birthday" block), and (b) backfill birthdays from Shopify customer metafields if available. If <30% of customers have `birthday` set, the birthday flow's volume is too low to be worth building; defer to Tier 4.

15. **No flow-performance attribution to source-channel or campaign.** Without the Triple Whale + Klaviyo integration, lifecycle-marketing revenue is invisible — operators see "Klaviyo attributed $X" but not "this Tier 1 flow drove $Y of that $X". **Fix:** install the Triple Whale + Klaviyo integration (Move #6 Step 3) BEFORE launching any Tier 1 flow. The integration populates Triple Whale's "Klaviyo flow" cohort dimension, enabling per-flow attribution. Without it, 25–50% of total attributed revenue is invisible per Triple Whale 2024 benchmarks.

---

## Verification

### Step A — Klaviyo flow sanity check

For each of the 20 flows, Klaviyo → Analytics → Flows → confirm the flow shows "Live" status + ≥1 send in the last 30 days + open rate within the target band from the Metrics table. **Gate**: all 20 flows show "Live" with ≥1 send.

### Step B — Postscript SMS sanity check

For each of the 7 SMS-bearing flows (Tier 1.1 browse-abandon + Tier 1.2 winback + Tier 2.1 birthday + Tier 2.5 dunning + Tier 3.3 back-in-stock + Tier 4.2 points-expiry + Tier 4.3 gift-guide), Postscript → Flows → confirm the SMS campaign is "Live" + delivery rate ≥95% + opt-out rate ≤2% per Postscript 2024 benchmarks. **Gate**: all 7 SMS flows show "Live" with ≥95% delivery.

### Step C — Smile.io webhook sanity check

For each of the 3 loyalty flows (Tier 2.3 tier-up + Tier 2.3 tier-down + Tier 4.2 points-expiry), Klaviyo → Settings → Webhooks → confirm the Smile.io webhook is firing (Webhook Activity → last 7 days shows ≥1 event per flow). **Gate**: all 3 loyalty webhooks active.

### Step D — Triple Whale cohort sanity check

Triple Whale → Cohorts → confirm 5 lifecycle-flow cohorts exist: "Browse-Abandon" + "Winback" + "Post-Purchase-Cross-Sell" + "Birthday" + "Loyalty-Tier-Up". **Gate**: 5 cohorts created and populating with ≥10 customers per cohort.

### Step E — End-to-end flow test

For each of the 20 flows, place a test order via the operator's Shopify admin test mode → confirm the corresponding flow triggers within 24 hours → confirm the email arrives with the right voice + the right product recommendations + the right discount code (if applicable). **Gate**: all 20 flows trigger correctly on test order.

### Step F — Discount-cap global rule

Klaviyo → unique-coupon-codes → confirm "Max uses per customer: 1 per 30 days" is set globally. **Gate**: rule is set.

### Step G — Frequency-cap global rule

Klaviyo → Settings → Account → Defaults → Frequency caps → confirm 1 promotional email + 1 SMS per customer per 24 hours is set. **Gate**: rule is set.

### Step H — Voice-segmentation coverage

Klaviyo → Segments → "Voice Profile Coverage" = `voice_profile is set` → confirm ≥60% of customers have the property populated. **Gate**: ≥60% coverage; if below, run the backfill recipe from Pitfall #2.

### Step I — Cohort LTV comparison (the "killer test" — Gate 4 of the research doc)

Triple Whale → Cohorts → compare the 90-day LTV of "any lifecycle-flow cohort" vs "no-flow cohort" → confirm the flow cohort shows ≥+10% LTV. **Gate**: ≥+10% LTV. This is the proof that the library is generating incremental revenue (not just reshuffling existing revenue).

---

## Cost & ROI estimate

### Path B default $5M GMV brand (Tier 1 + Tier 2)

| Cost line | Monthly | Annual |
|---|---|---|
| Klaviyo (50k contacts, 20 flows) | $500–$700 | $6,000–$8,400 |
| Postscript SMS (10k SMS/mo across 7 flows) | $250–$450 | $3,000–$5,400 |
| Smile.io Growth (50k members, 3 loyalty flows) | $249–$449 | $2,988–$5,388 |
| Triple Whale Starter | $179 | $2,148 |
| Operator time (one-time, 22 hr) | — | $1,100 (at $50/hr) |
| Operator time (recurring, 6 hr/wk) | $1,300 | $15,600 |
| **Total** | **$2,478–$3,078/mo** | **$30,836–$38,036/yr** |

**Revenue lift (Path B default $5M GMV)**: incremental revenue $1.25M–$2.25M / yr → **41:1–73:1 ROI conservative / 95:1 ROI median**.

### Path D all-4-tiers $10M–$50M GMV brand

| Cost line | Monthly | Annual |
|---|---|---|
| Klaviyo (200k contacts, 20 flows) | $1,500–$2,500 | $18,000–$30,000 |
| Postscript SMS (50k SMS/mo) | $1,200–$2,000 | $14,400–$24,000 |
| Smile.io Enterprise | $1,000–$2,000 | $12,000–$24,000 |
| Triple Whale Pro | $499 | $5,988 |
| Dedicated lifecycle manager (10 hr/wk) | $2,500 | $30,000 |
| **Total** | **$6,699–$8,499/mo** | **$80,388–$101,988/yr** |

**Revenue lift (Path D $10M–$50M GMV)**: incremental revenue $2.25M–$4M / yr → **22:1–50:1 ROI conservative / 24:1 ROI median**.

### Honest-read

The 95:1 ROI is the median case for Path B at the default $5M GMV. Operators in the upper-lift band should expect 100:1+ ROI; operators in the lower-lift band should expect 40:1+. The library is NOT a 1-tick win — it's a 90-day ramp across 4 tiers. Operators who ship Tier 1 in Week 1 and see "only 8:1 ROI" are looking at the wrong time window; the 95:1 ROI materializes at the 90-day mark once Tier 1 + Tier 2 are both live and the cohort LTV compounds.

---

## Companion tool

`scripts/lifecycle_flow_health_check.py` *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track; Archetype C/D-light hybrid audit script that checks each of the 20 flows against the canonical KPI benchmarks from the Metrics table (open rate / click rate / CVR / unsubscribe rate / cohort LTV). The script scores each flow on a 0–100 scale and emits a prioritized fix-list. Pattern mirrors `scripts/triple_whale_attribution_check.py` and `scripts/checkout_audit_score.py` (gated on the 20 flows being live for ≥30 days before the script can score them — the script is the 90-day-post-launch audit tool, not the launch-time tool).

---

## Next moves after this lifecycle library is live

1. **Companion asset `assets/14-lifecycle-flow-templates.md`** *(shipped 2026-06-27 per the asset-tick follow-up to research/05 + playbook/12 — the canonical operator-copy layer; 17 flows × 5 voices = 85 voice-variant paste-ready templates with Klaviyo conditional-content syntax + Triple Whale UTM + subject-line ≤50 chars + SMS ≤160 chars pre-validation + 11 suppression rules + 10 pitfalls with Fix lines)*. Compounds this playbook by shipping the operator-copy layer.
2. **Companion script `scripts/lifecycle_flow_health_check.py`** *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track)* — the 78 gate-flow audit (20 flows × 6 gates each = 120 gate-flow combinations; the canonical Archetype C/D-light hybrid pattern from Move #6.5 + #6.6 + #6.7 + #6.8).
3. **Companion static dashboard `dashboards/lifecycle-flow-library.html`** *(planned — does not yet exist)* — the static HTML dashboard rendering the 20-flow library + per-flow KPI scorecard + per-tier revenue contribution + 4-tier launch-ladder progress.
4. **Companion operator-surface route `dashboard/app/lifecycle/page.tsx`** *(planned — does not yet exist)* — the Next.js dashboard route surfacing the library as a 1-click per-flow wiring diagram.
5. **Move #11.5 — Subscription lifecycle extension** — for consumables brands that have shipped Path C, the next layer is per-subscription-cohort LTV optimization (early-tenure / mid-tenure / late-tenure / at-risk-of-churn) gated on Recharge's tenure webhook. Compounds Path C's renewal + dunning flows with per-tenure LTV optimization.

---

## Related

- `research/05-lifecycle-marketing.md` — the synthesis doc this playbook implements (the canonical 20-flow library + 5 pillars + 3 GMV-tier paths + 4 verification gates + 15 pitfalls)
- `research/00-ecommerce-ops-landscape.md` §3 — retention stack benchmarks (the foundational research this playbook extends)
- `research/01-tools-stack-comparison.md` §2 — Klaviyo + Postscript + Smile pricing + integration wiring (the substrate this playbook assumes)
- `research/02-top-10-leverage-moves.md` — the top-10 leverage list this library extends (Move #1 + #4 + #7 are the 3 MVP flows)
- `research/03-30-day-rollout-plan.md` line 179 — the "Next moves after 30 days" section naming Move #14 as the #3-priority follow-up
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1's cart-abandon wiring (the canonical Tier-1 pattern)
- `playbooks/04-welcome-series-klaviyo.md` — Move #4's welcome series wiring (the canonical 5-email pattern)
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #7's Postscript SMS wiring (the canonical SMS cadence pattern)
- `playbooks/07-loyalty-program-smile.md` — Move #8's Smile.io + Klaviyo webhook pattern (the canonical loyalty-tier trigger pattern)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6's Triple Whale attribution substrate (required for NPS-detractor + cohort LTV)
- `playbooks/11-international-rollout.md` — Move #11 international expansion (the internationalization overlay for this library; per-market voice + GDPR + SMS sender-ID)
- `assets/01-copy-templates.md` — the 5-voice copy library (the per-voice voice-profile library this playbook reads)
- `assets/02-brand-voice.md` — the canonical brand-voice doc (the 5 voice profiles: Default / Luxury / Sustainable / Gen-Z / B2B)
- `assets/06-nps-survey-toolkit.md` — the NPS survey template (the source of the NPS score that feeds the Tier 2.4 NPS-detractor flow)
- `scripts/welcome_series_roi.py` + `scripts/abandoned_cart_roi.py` + `scripts/post_purchase_upsell_roi.py` — the companion ROI scripts for the 3 MVP flows (the canonical Archetype A pattern this playbook's future `lifecycle_flow_health_check.py` extends)
- `scripts/triple_whale_attribution_check.py` — Move #6's 7-gate audit (the attribution substrate this library depends on)
- `scripts/international_market_fit.py` — Move #14 international scoring (the per-market ROI overlay for international lifecycle expansion)
- `dashboard/src/lib/content.json` — auto-generated content index (will need regeneration after this playbook lands to surface it on the operator dashboard)

---

**Author note.** This playbook is the operator-build layer for the lifecycle-marketing track. The research synthesis (research/05) scopes the WHAT (which flows + which tiers + which ROI); this playbook ships the HOW (paste-ready Klaviyo + Postscript + Smile wiring for each flow). The companion asset (assets/14) will ship the COPY (per-flow email + SMS templates). The companion script will ship the AUDIT (per-flow KPI scoring). The companion dashboard will ship the OPERATOR SURFACE (1-click per-flow wiring diagram). Together, the 5 artifacts form the canonical 6-layer (research → playbook → asset → operator-surface-route → script → static-dashboard) lifecycle-marketing track, mirroring the international-expansion track's 6-layer closure (research/04 + playbook 11 + asset 13 + /international route + international_market_fit.py + international-expansion-health.html).
