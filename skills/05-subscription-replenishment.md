---
name: subscription-replenishment
title: Subscription & replenishment program
category: retention
tier: 1
priority: P1
default_move: 11
year_1_roi_band: "12:1–25:1"
sms_friendly: true
last_updated: 2026-07-10
sources: [recharge 2024, skio 2024, bold 2024, stay-ai 2024, appstle 2024, klaviyo 2024, postscript 2024, triple-whale 2024, littledata 2024, chargebee 2024, shopper-approved 2024]
---

# Subscription & replenishment program

> The single largest LTV lever in DTC consumables. A subscribe-and-save widget on the top 3–5 hero SKUs lifts 12-month subscriber LTV 2.0–3.0×, recovers 20–35% of would-be cancellations via smart-cancel flows, and recaptures 50–70% of failed payments via dunning. Ship on Recharge Plus (or Skio) with a 4-phase rollout at 12:1–25:1 year-1 ROI. Move #11 — and the canonical #1-priority follow-up after the cart/welcome/SMS MVP.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce) store with 6+ months of order history
- A consumables catalog where ≥30% of revenue comes from SKUs customers re-purchase every 30–120 days (food, pet, vitamins, supplements, personal care, household, beauty, baby, beverage, cosmetics, skincare, oral care)
- A baseline retention stack: cart-abandon (Move #1) + welcome (Move #4) + SMS (Move #7) + loyalty (Move #8) all live
- A live Triple Whale (or Polar) attribution install so subscriber-vs-one-time cohort LTV is measurable
- US contribution margin ≥ 25% (platform + dunning cost eats 3–7pp)
- 2–4 hr/wk of operator time during Phase 1+2

You do NOT have:
- A "Subscribe & save" widget on any PDP (the most common consumables-DTC gap)
- A customer portal (cancel / pause / skip / swap / change-frequency)
- A smart-cancellation flow (most cancellations are preventable if you offer alternatives before the cancel button)
- A dunning flow for failed recurring payments (5–10% of recurring charges fail; without dunning you lose the LTV silently)
- A replenishment-reminder flow for one-time buyers (the cheapest way to convert one-time → subscriber)

## What "best in class" looks like

Reference: Athletic Greens, Ritual, Care/of, Hims, Hers, Olipop, Liquid Death, Pet Honesty, Bombas, Sephora Beauty Insider Subscriptions, Dollar Shave Club.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| PDP widget visibility | Hero SKU + cart drawer + checkout upsell | Hero SKU only | Sticky ATC + exit-intent + post-purchase |
| Subscriber discount | 15% off + free shipping | 10% off | 20% off + free shipping + skip-anytime |
| Subscriber conversion | 20–30% of consumable buyers | 5–10% | 40%+ (aggressive consumables) |
| Cancellation flow | 4-alternative smart-cancel before button | Cancel button only | AI-driven personalized offer per cohort |
| Smart-cancel recovery | 25–35% of would-be cancellations | 0% | 40%+ |
| Dunning recovery | 60–70% of failed payments | 0% | 80%+ (with pre-dunning email) |
| Replenishment flow | Per-SKU cadence + per-customer dynamic | Static 30-day | ML-predicted per-customer cadence |
| Subscription share of revenue | 50–70% of consumable revenue | 10% | 75%+ |
| Customer portal | Pause / skip / swap / change-frequency / cancel | Cancel only | Pause + bonus credit + winback offer |
| Subscriber LTV multiplier | 2.5–3.5× one-time buyer | 1.2× | 4×+ (top subscription brands) |
| Monthly churn | 5–7% | 10%+ | 3–5% (Hims / Care/of tier) |
| Inventory | FIFO + lot/date tracking for expiry SKUs | Single-batch | Lot-level traceability + auto-block expired |

## Subscription benchmarks (2024–25)

| Setup | Subscriber LTV multiplier | Subscription % of consumable revenue | Net revenue / $1 platform cost |
|---|---|---|---|
| Recharge Starter, hero SKUs only, no smart-cancel | 1.5–2.0× | 15–25% | 5:1–10:1 |
| Recharge Plus, top 5 SKUs + smart-cancel + dunning | 2.0–3.0× | 25–50% | 12:1–25:1 |
| Skio + Stay AI + custom dunning + replenishment | 2.5–3.5× | 40–70% | 15:1–35:1 |
| Best in class (AG / Ritual / Care/of) | 3.0–4.5× | 60–80% | 25:1–60:1 |

**Median DTC consumables brand gets 2.0× subscriber LTV at 15:1. Best in class gets 3.5× at 30:1+.**

## The build (8–16 hours / 4–12 weeks across 4 phases for a competent operator)

### Step 1 — Tool choice (the 3-platform default covers 90% of brands)

| Tool | Price | Pros | Cons |
|---|---|---|---|
| **Recharge Plus** | $499/mo | Default. ~70% of Shopify subscription market per Recharge 2024. Deepest integration. 1.34% + 19¢ per transaction. | Most expensive at scale |
| **Skio** | $149–$499/mo | Klaviyo-native. Free migration from Recharge. Better UX. | Smaller ecosystem, less mature support |
| **Bold Subscriptions** | $49–$199/mo | Cheapest. 0.7% transaction fee. Simple. | Less growth-oriented; weaker customer portal |
| Stay AI | $299–$999/mo | AI churn-prediction + smart-cancel | Marketing-tech not billing; gated on $10M+ GMV |
| Appstle | $29–$199/mo | Multi-channel (Shopify + Amazon + Walmart) | Smaller ecosystem |
| Seal Subscriptions | $249+ | Shopify Plus; deep theming | Overkill for <$5M GMV |
| Loop Subscriptions | $249+ | Subscription-native; deep churn-tools | Smaller ecosystem |

**Default: Recharge Plus ($499/mo) for ≥$500k GMV; Skio ($149/mo) for fresh-launch OR migrating from Recharge; Bold ($49/mo) for <$500k GMV with simple needs.**

### Step 2 — Define the subscriber discount (5-tier matrix)

| Discount tier | Subscriber conversion | LTV multiplier | When to use |
|---|---|---|---|
| **5% off** | 5–10% | 1.2–1.5× | Minimum; rarely enough |
| **10% off** | 10–20% | 1.5–2.0× | Conservative default; premium brands |
| **15% off** | 15–30% | 1.8–2.5× | **Common default; best balance** |
| **20% off** | 20–40% | 2.0–3.0× | Aggressive; competitive consumables |
| **25%+ off** | 25–50% | 2.5–3.5× | Maximum; supplements / vitamins / pet food |

**Default: 15% off** for most consumables. **20%** for highly-competitive (supplements, vitamins, pet). **10%** for premium (luxury skincare, premium pet).

### Step 3 — Pick the hero SKUs (the SKUs you put subscription on first)

The rule: **30–120 day re-purchase cadence + 30%+ of revenue + already-shipping reliably**.

Diagnostic — pull from Shopify:
1. Filter SKUs by reorder rate (≥20% of buyers re-order within 90 days)
2. Filter by revenue contribution (top 20% of SKUs)
3. Filter by fulfillment reliability (≤1% fulfillment failure rate over 90 days)
4. Top 3–5 SKUs that hit all three = the launch set

**DO NOT put subscription on SKUs that:**
- Have <30-day natural cadence (creates subscription fatigue)
- Have >120-day cadence (subscriber-discount isn't justified by the gap)
- Are seasonal (holiday SKUs churn 30%+ at season end)
- Are bundles / one-off gift SKUs (no replenishment intent)

### Step 4 — Build Phase 1: PDP subscribe-and-save widget (Weeks 1–2)

1. Install Recharge (or Skio / Bold) on Shopify
2. Configure subscription widget on the top 3–5 hero SKUs (PDP variant + cart drawer + checkout upsell)
3. Set discount tier (15% default) + free shipping on subscription
4. Set default delivery cadence (30-day default; per-SKU override for 45-day / 60-day / 90-day)
5. Test on mobile (70%+ of PDP views are mobile)
6. Verify: test order → subscription created → second order auto-charges 30 days later

### Step 5 — Build Phase 2: Customer portal (Weeks 3–6)

1. Enable customer portal (cancel / pause / skip / swap / change-frequency)
2. **Migrate any pre-existing subscribers** (manual subscriptions + WP Subscriptions + Stripe Subscriptions) → Recharge
3. Set up dunning-email automation: Recharge `subscription_payment_failed` → Klaviyo flow
4. Enable pause (max 90 days) before forced cancellation
5. Set up swap (swap variant) so subscribers can change flavor / size without canceling

### Step 6 — Build Phase 3: Replenishment + smart cancellation (Weeks 7–10)

1. **Replenishment flow** (Klaviyo) — fires N days before expected-purchase-cadence (based on average-purchase-cadence from Shopify + Recharge data). 1 email + 1 SMS at day -7, day -3, day 0.
2. **Smart cancellation flow** — Recharge's native 4-alternative flow OR custom build:
   - Alternative 1: "Pause for 30/60/90 days"
   - Alternative 2: "Skip next delivery"
   - Alternative 3: "Reduce frequency to every 60/90 days"
   - Alternative 4: "Get 20% off this order + stay subscribed"
   - THEN the cancel button (after the 4 alternatives are declined)
3. **Dunning flow** — 3 attempts at day 0 / day 3 / day 7, with escalating subject lines + SMS at attempt 3

### Step 7 — Build Phase 4: Subscriber-cohort analytics (Weeks 11–12)

1. **Triple Whale merge** — tag every subscription order with `subscription: true` + `subscription_status: active|paused|cancelled`
2. Build a "Subscriber LTV cohort" dashboard: 30/60/90/180/365-day LTV for subscribers vs one-time buyers
3. Set up churn-alert monitoring (monthly churn > 8% → escalation alert)
4. **Winback flow** (Klaviyo) — 30-day post-cancel email + 60-day + 90-day. 10–20% of cancelled subscribers return within 90 days when winback is live.
5. Set up NPS for active subscribers (target ≥50 NPS; <30 = churn warning)

### Step 8 — Verification

- Test subscription order → 2nd order auto-charges at cadence (within 1 day tolerance)
- Cancel flow → 4 alternatives offered → cancel only after all declined
- Failed payment → 3 dunning attempts → recovered OR cancelled
- Winback flow → cancelled subscriber gets email at 30/60/90 days
- Triple Whale shows `subscription` tag on every subscription order
- 60 days post-launch: subscription revenue ≥ 15% of consumable revenue

## Common pitfalls (15 from real builds)

1. **Launching on SKUs customers don't re-purchase** — apparel/jewelry/electronics never hit 30+ day cadence; subscription conversion <2%; skip entirely
2. **Subscriber-discount too low (5% or less)** — 5% doesn't drive adoption; use 15% as the floor for consumables
3. **No smart-cancellation flow** — 25–35% of would-be cancellations are recoverable; without smart-cancel, churn doubles
4. **No replenishment reminder flow** — one-time buyers forget; replenishment converts one-time → subscriber at 5–10%
5. **No dunning flow** — 5–10% of recurring charges fail; without dunning, you lose LTV silently
6. **Subscriber-discount applies to one-time-cannibalization** — non-subscribers use the discount code once and never subscribe; gate the code to "subscribe & save" flow only
7. **No Triple Whale attribution merge** — can't prove subscriber LTV without cohort tagging; missing 60–80% of subscription ROI story
8. **Wrong-SKU subscription-widget placement** — putting the widget on seasonal SKUs or bundles (no replenishment intent) tanks conversion
9. **Manual-subscription migration without testing** — migrating 500 manual subs to Recharge without parallel-run = lost subscribers + revenue
10. **Subscriptions without Triple Whale** — Move #6 attribution is the prereq; without it you can't measure the 2.0–3.0× LTV multiplier
11. **Subscriptions without welcome series** — Move #4 welcome is the prereq; subscriber's first order needs an onboarding flow
12. **Subscriptions without loyalty** — Move #8 loyalty is the prereq; subscribers should earn 2× points on recurring orders
13. **Subscriptions without SMS** — Move #7 SMS is the prereq; dunning + replenishment need SMS for >70% recovery
14. **Wrong inventory management for subscription SKUs** — running out of hero SKU = subscriber churn spike; FIFO + safety stock for top 5 subscription SKUs is mandatory
15. **No subscription-experience testing** — A/B test the discount tier (15% vs 20%) + cadence default (30d vs 45d) + smart-cancel alternatives; every 5% conversion lift is material

## Verification (this skill is "shipped" when...)

- [ ] Recharge (or Skio / Bold) installed on top 3–5 hero SKUs
- [ ] Test subscription order → 2nd order auto-charges at cadence within 1 day tolerance
- [ ] Customer portal: cancel / pause / skip / swap / change-frequency all functional
- [ ] Smart-cancel flow: 4 alternatives offered before cancel button
- [ ] Dunning flow: 3 attempts at day 0/3/7 with SMS on attempt 3
- [ ] Replenishment flow: one-time buyer gets reminder 7 days before expected cadence
- [ ] Winback flow: cancelled subscriber gets email at 30/60/90 days
- [ ] Triple Whale shows `subscription: true` tag on every subscription order
- [ ] 60 days post-launch: subscription revenue ≥ 15% of consumable revenue
- [ ] Monthly subscriber churn ≤ 8%
- [ ] Subscriber LTV multiplier ≥ 1.5× one-time buyer (Triple Whale cohort view)
- [ ] $/platform-cost ratio ≥ 10:1 in the first 90 days

## How to extend this skill

Once Phase 1–4 are live:
- Add per-SKU replenishment cadence (45-day for vitamins, 60-day for pet food, 90-day for household)
- Add bundle subscriptions (subscribe to a 3-pack at 20% off)
- Add gift subscriptions (gift-giver pays 3 / 6 / 12 months upfront)
- Add pause-and-credit (pause for 30 days, get $5 store credit)
- Add winback-to-loyalty (cancelled subscribers get 2× points if they resubscribe within 60 days)
- Add AI-driven churn-prediction (Stay AI integration) for $10M+ GMV
- Add cross-sell on subscription deliveries (include sample of new SKU in box)
- Add multi-channel subscriptions (Amazon Subscribe & Save + Walmart) via Appstle

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1 — cart-abandon flow is the prereq for replenishment reminders)
- Companion skill: `welcome-series` (Move #4 — welcome flow is the prereq for subscription onboarding)
- Companion skill: `loyalty-program` (Move #8 — subscribers earn 2× points, compounds loyalty ROI)
- Companion research: `/research/08-subscriptions.md` (Move #11 full synthesis, 4-phase rollout, 7-platform decision matrix)
- Companion research: `/research/05-lifecycle-marketing.md` (Move #14 replenishment is also a Tier 3 lifecycle flow)
- Companion research: `/research/07-3pl-migration.md` (Move #12 3PL is the prereq for subscription fulfillment at scale)

## Sources

- Recharge, "State of Subscriptions 2024" (industry benchmark report)
- Recharge, "Subscriber LTV benchmarks 2024"
- Recharge, "Smart cancellation recovery rates 2024"
- Skio, "Subscription migration benchmarks 2024"
- Bold Subscriptions, "Subscription pricing + migration benchmarks 2024"
- Stay AI, "AI-driven churn prediction benchmarks 2024"
- Appstle, "Multi-channel subscription benchmarks 2024"
- Klaviyo, "Subscription-aware flow benchmarks 2024"
- Postscript, "SMS dunning + replenishment benchmarks 2024"
- Triple Whale, "Subscriber vs one-time cohort LTV 2024"
- Littledata, "Subscription cohort retention benchmarks 2024"
- Chargebee, "Subscription billing platform benchmarks 2024"
- Shopper Approved, "Subscription cancellation flow research 2024"
- Justuno, "Subscription LTV benchmarks 2024"