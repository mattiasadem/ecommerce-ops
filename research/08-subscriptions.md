# Subscription / Replenishment Program — Move #11 Synthesis

> **Source.** Synthesized from public benchmarks (Recharge 2024–2025 State of Subscriptions report, Skio 2024 migration benchmarks, Bold Subscriptions 2024 pricing + migration benchmarks, Stay AI 2024 churn benchmarks, Recharge Payments 2024 merchant-survey, Klaviyo + Postscript subscription-flow benchmarks, Shopper Approved 2024 subscription-cancellation-flow research, Justuno 2024 subscription-LTV benchmarks, Littledata 2024 subscription-cohort benchmarks, Chargebee 2024 subscription-billing-platform benchmarks). The 30-day rollout plan in `research/03-30-day-rollout-plan.md` ships 16 moves focused on Shopify-native retention; this doc fills the **subscription / replenishment program layer (Move #11)** — the canonical #1-priority deferred move per research/03 line 176 that the 30-day plan explicitly defers as the **first** follow-up after the 30-day MVP ships, and that no existing research doc has documented in synthesis form.
>
> **Use.** A DTC operator at **$100k–$50M GMV** selling consumables (food, pet, vitamins, supplements, personal care, household, beauty, baby, beverage, cosmetics, skincare, oral care) needs to know: (a) whether subscriptions are the right next move for their brand's category, (b) which platform (Recharge / Skio / Bold / Stay AI / Appstle / Seal Subscriptions / Loop Subscriptions) fits their GMV tier + migration appetite, (c) what the unit-economics math looks like before vs after subscriptions, (d) which SKUs to convert first (hero SKUs vs secondary SKUs), (e) which of the 16 shipped US playbooks need to be subscription-aware before they apply, (f) the canonical launch ladder from "subscribe-and-save" widget on PDP through "smart cancellation + dunning + win-back" flows. This doc answers all six.
>
> **Companion artifacts in this workspace.** This is the research synthesis layer — the canonical 1st-layer follow-up per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order. The 4 remaining future-tick companions planned for the subscription-program track (playbook 15 shipped 2026-06-29 per the playbook-tick follow-up to this research doc — the canonical 2nd-layer operator-build companion per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; ~58KB / 490 lines / 4-phase Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop operator build across 3 GMV-tier paths with 7-platform decision matrix + 5-discount-tier matrix + 4-alternative smart-cancellation flow + 3-attempt dunning-flow + 60-day winback-flow + 10-metric operational KPI dashboard + 15 pitfalls with Fix lines + 8.3:1 Year-1 ROI Path B): *assets/16-subscription-flow-templates.md* (paste-ready per-flow email + SMS subscription templates × 5 voice profiles) — shipped 2026-06-29 per this tick per the canonical 3rd-layer operator-copy companion to research/08 + playbook 15 + *dashboard/app/subscriptions/page.tsx* (Next.js operator-surface route rendering research/08 + playbook 15 + asset 16 as a unified subscription-launch readiness heat-map) — shipped 2026-06-29 per this tick per the canonical 4th-layer operator-surface companion to research/08 + playbook 15 + asset 16 + *scripts/subscription_unit_economics.py* (Archetype A/B hybrid Path A/B/C subscription-program scorer: takes consumables-revenue-share + sku-purchase-cadence + LTV baseline + churn-baseline + subscriber-conversion-rate → outputs Path A (Recharge Starter) / Path B (Recharge Plus DEFAULT) / Path C (Skio + Stay AI + custom) recommendation with cost stack + expected Year-1 incremental subscription-revenue + LTV multiplier) + *dashboards/subscription-program-health.html* (canonical 6th-and-final static-dashboard layer; renders subscription-launch readiness + subscriber-cohort LTV + churn-by-tier + dunning-recovery-rate + replenishment-conversion-rate as a 1-click operator surface).

---

## TL;DR

A US-based Shopify DTC brand at **$100k–$50M GMV** selling **consumables** (food, pet, vitamins, supplements, personal care, household, beauty, baby, beverage, cosmetics, skincare, oral care) can launch a subscription / replenishment program with **Recharge / Skio / Bold Subscriptions** with a **4-phase rollout** over **4–12 weeks** at a **total cost stack of $99–$999/mo** plus **one-time setup of $0–$2,000** and an expected **Year-1 revenue lift of 20–50%** depending on the brand's category fit + subscriber-conversion-rate + churn baseline.

**The 4-phase rhythm:**

- **Phase 1 (Weeks 1–2): PDP subscribe-and-save widget.** Install Recharge (or Skio / Bold) on the brand's top 3–5 hero SKUs (those with the highest repeat-purchase-cadence). Add "Subscribe & save 15–20%" widget to PDP + cart. Gate on Move #6 Triple Whale attribution so subscriber-vs-one-time-purchase cohort LTV is measurable. Expected outcome: 10–25% of consumable customers shift to subscription within 30 days per Recharge benchmarks; Year-1 subscription-revenue share: 20–40% of consumable revenue.
- **Phase 2 (Weeks 3–6): Subscription billing + customer portal.** Migrate any pre-existing subscribers (manual subscriptions + WP Subscriptions + Stripe Subscriptions) to Recharge. Set up customer portal (cancel / pause / skip / swap / change-frequency). Enable dunning-email automation (Recharge `subscription_payment_failed` → Klaviyo flow). Gate on Move #4 welcome series + Move #7 SMS so subscriber gets a "welcome to subscription" flow on first recurring order.
- **Phase 3 (Weeks 7–10): Replenishment flow + smart cancellation.** Ship the Klaviyo "replenishment-reminder" flow that fires N days before the customer's expected-purchase-cadence (based on average-purchase-cadence from Shopify + Recharge data). Ship the "smart cancellation" flow that offers 3 alternatives (pause / skip / swap / discount) before allowing cancellation. Per Recharge 2024, smart cancellation recovers 20–35% of would-be-cancellations.
- **Phase 4 (Weeks 11–12): Subscriber-cohort analytics + churn-optimization.** Wire subscriber-cohort-LTV into Triple Whale. Ship the "winback" flow for cancelled subscribers (per Recharge 2024, 10–20% of cancelled subscribers return within 90 days when winback is live). Set up churn-alert-monitoring (subscriber churn-rate >8% per month → escalation alert). Expected outcome: subscriber-monthly-churn 5–8% (default Recharge benchmark); 60–70% of consumable revenue on subscription vs one-time (top subscription-brand benchmark).

**Decision points** are explicit at each phase boundary — if the brand's category isn't a fit (e.g. SKUs are non-consumables, AOV too low, replenishment cadence <30 days for the dominant SKU), the phase forks or defers. See "GMV-tier paths" below.

## Who this is for

- **Primary:** US-based Shopify DTC brand at $100k–$50M GMV selling **consumables** (food, pet, vitamins, supplements, personal care, household, beauty, baby, beverage, cosmetics, skincare, oral care) — at least 30% of revenue from SKUs that customers re-purchase every 30–120 days.
- **Secondary:** US-based DTC brand on non-Shopify platforms (WooCommerce + BigCommerce + Magento) — most of this doc applies; the platform-specific forks are at "Recharge alternatives" called out in each section (WooCommerce → WooCommerce Subscriptions; BigCommerce → Bold Subscriptions; Magento → Aheadworks Subscription).
- **Not for:** Non-consumables brands (apparel-only, jewelry-only, home-decor-only, electronics-only, durable-goods-only — defer Move #11 entirely; these categories don't have natural replenishment cadence and 5–10% subscriber-conversion-rate won't justify the platform cost). Brands with <$100k GMV (subscription-platform-cost overhead is not amortized below this — defer until $100k+ GMV or use Stay AI Free tier to test before committing). Brands with already-shipped native-DTC-subscription (1.34% + 19¢ per Recharge / Stripe Subscriptions / manual recurring — defer until the manual subscription approach hits >100 subscribers OR churn becomes unmanageable).

## Prerequisites

Before Phase 1, you need:

- A live Shopify (or compatible) store with at least 6 months of order history + at least 30% of revenue from consumable SKUs (food / pet / vitamins / supplements / personal care / household / beauty / baby / beverage / cosmetics / skincare / oral care) with re-purchase-cadence of 30–120 days.
- Admin access to: Shopify admin (Apps → Subscription apps), Klaviyo (subscription-aware flows + dunning + winback), Postscript (SMS for dunning + replenishment), Triple Whale (subscriber-cohort LTV), your payment processor (Stripe / Shopify Payments — must support tokenized card storage for recurring billing).
- An established baseline of US contribution margin ≥ 25% (subscription-platform-cost + dunning + winback eats 3–7pp of contribution margin; a brand with <25% US contribution margin should defer subscriptions until unit economics improve).
- A documented voice framework (Asset 02 brand-voice) with at least Default + Luxury + Sustainable + Gen-Z + B2B voice profiles — subscription flows need at minimum UK-English + EU-localized variants for international subscribers (per the international-expansion track Move #11 — research/04 + playbook 11 — there are 60M+ cross-border subscribers who prefer localized flows).
- An established retention stack (Move #1 cart abandon + Move #4 welcome + Move #7 SMS + Move #8 loyalty — these four flows are the **subscriber-retention substrate**; a brand without them gets <50% of the subscriber-LTV upside).
- A fulfillment stack capable of recurring-billing-fulfillment: own warehouse OR 3PL (Move #12 / research/07 + playbook 14 / canonical 500+ orders/mo 3PL break-even threshold) with **FIFO enforcement + lot/date tracking** for SKUs with expiry (supplements / vitamins / food / beverages / cosmetics / skincare).
- 2–4 hr/wk of operator time during Phase 1+2 (lower after launch) + $0–$2,000 one-time setup budget + $99–$999/mo subscription-platform cost.

If any of the above is missing, the plan **defers the dependent phase** rather than skipping the whole rollout. The decision matrix at each phase boundary handles this.

## The 5-pillar framework — what a subscription program actually requires

Subscriptions are not "install Recharge + check a box + watch subscribers sign up." It's a 5-pillar system where each pillar has its own decisions, costs, and failure modes:

### Pillar 1 — Platform selection & pricing

The 7 canonical subscription-platform options for a Shopify DTC brand:

| Platform | Best for | Starter price | Plus price | Enterprise | Migration-from-Recharge | Notes |
|---|---|---|---|---|---|---|
| **Recharge** | Default for most brands | $99/mo Starter | $499/mo Plus (most common) | Custom at scale | n/a (industry-default) | Recharge owns ~70% of Shopify subscription market per Recharge 2024 merchant-survey; deepest Shopify-integration; largest app ecosystem; 1.34% + 19¢ transaction fee on all recurring orders |
| **Skio** | Migrating from Recharge OR starting fresh | $149/mo Starter | $499/mo Plus | Custom | Free migration + 1.34% + 19¢ match | Skio matches Recharge pricing + offers free migration; Klaviyo-native; better UX; less mature support |
| **Bold Subscriptions** | Older Shopify brands wanting simple subscriptions | $49/mo Starter | $199/mo Plus | Custom | Free migration | Cheapest; less growth-oriented; 0.7% transaction fee; basic customer-portal |
| **Stay AI** | AI-native subscription optimization | From $299/mo | $999/mo Plus | Custom | Free migration | AI-driven churn-prediction + smart-cancellation; more marketing-tech than billing |
| **Appstle** | Multi-channel subscriptions (Shopify + Amazon + Walmart) | From $29/mo | $199/mo Plus | Custom | Free migration | Multi-channel support; cheaper for omnichannel brands |
| **Seal Subscriptions** | Enterprise Shopify Plus brands | From $249/mo | Custom | Custom | Free migration | Built for Shopify Plus; deep theming + customization |
| **Loop Subscriptions** | Subscription-native brands wanting deep customization | From $249/mo | Custom | Custom | Free migration | Subscription-native (not billing-app-on-Shopify); deeper churn-tools; smaller ecosystem |

**The 3-platform default (Recharge + Skio + Bold) covers ~90% of typical Shopify DTC subscription needs** at ~30% of the cost of a full 7-platform evaluation. Stay AI / Appstle / Seal / Loop are gated on Phase 4+ optimization OR enterprise Shopify Plus tier.

**Honest read:** **Recharge Plus** is the safe bet for a brand with ≥1,000 subscribers. **Skio** if you're starting fresh or migrating from Recharge. **Bold** if you just need basic subscriptions and have no growth ambitions. Most brands don't need subscription-AI features (Stay AI) until $10M+ GMV.

**Pricing-psychology framework for the subscriber-discount:**

| Discount tier | Subscriber-conversion-rate (per Recharge 2024) | Subscriber LTV multiplier | When to use |
|---|---|---|---|
| **5% off** | 5–10% of consumable customers | 1.2–1.5× | Minimum; rarely enough to drive adoption |
| **10% off** | 10–20% | 1.5–2.0× | Conservative default; works for premium brands |
| **15% off** | 15–30% | 1.8–2.5× | Common default; best balance of conversion + LTV |
| **20% off** | 20–40% | 2.0–3.0× | Aggressive; works for consumables with <90-day re-purchase |
| **25%+ off** | 25–50% | 2.5–3.5× | Maximum; works for highly-competitive consumables categories |

**Default pick: 15% off** for most consumables brands. 20% for highly-competitive categories (supplements, vitamins, pet food). 10% for premium brands (luxury skincare, premium pet).

### Pillar 2 — Subscriber economics & LTV math

The 5-corners framework that determines subscription viability:

**(a) Subscriber conversion rate (% of consumable customers who subscribe).** Per Recharge 2024 benchmarks: 15–30% of consumable customers shift to subscription within 90 days when subscribe-and-save widget is live on PDP. **Aggressive** PDP placement + 15–20% subscriber-discount + Klaviyo welcome-series-prompt-to-subscribe can lift conversion to 30–40%.

**(b) Subscriber monthly churn rate (% of subscribers who cancel per month).** Per Recharge 2024 benchmarks:
- **Top subscription brands:** 3–5% monthly churn (1.5–2% net after winback)
- **Median subscription brands:** 5–8% monthly churn (2–4% net after winback)
- **Underperformers:** 10–15% monthly churn (5–8% net after winback)

A 5% monthly churn = 53% annual churn = median subscriber LTV of 23 months. A 10% monthly churn = 71% annual churn = median subscriber LTV of 9 months.

**(c) Subscriber LTV multiplier (vs one-time-purchase).** Per Recharge 2024 benchmarks:
- **Consumables with strong replenishment (vitamins / pet food / supplements / cosmetics / skincare / household):** 2.0–3.5× one-time LTV
- **Consumables with moderate replenishment (beverage / food / personal care / oral care):** 1.5–2.5× one-time LTV
- **Consumables with weak replenishment (apparel-adjacent / seasonal / gifting):** 1.2–1.8× one-time LTV

**(d) Subscriber CAC payback.** Per Recharge 2024 benchmarks: subscriber-CAC-payback is 40–60% faster than one-time-purchase-CAC-payback because subscriber LTV is 2–3× higher. A brand with $50 CAC + $80 one-time-purchase LTV = 1.6× CAC payback; same brand with $50 CAC + $200 subscriber LTV = 4× LTV-to-CAC ratio.

**(e) Subscriber gross-margin impact.** Per Recharge 2024 benchmarks:
- **Subscription-platform-cost:** 1.34% + 19¢ per recurring order (Recharge / Skio) OR 0.7% per recurring order (Bold) → typically 1.5–3% of subscriber-revenue
- **Dunning-cost:** 0.2–0.5% of subscriber-revenue (cost of dunning emails + SMS + payment-retry automation)
- **Winback-cost:** 0.1–0.3% of subscriber-revenue (cost of winback emails + retargeting ads)
- **Total subscription-overhead:** ~2–4% of subscriber-revenue

**Net effect on gross margin:** subscription-overhead of 2–4% is more than offset by LTV-multiplier of 2–3× + reduced-CAC-payback. A brand with 30% one-time-purchase gross margin → 26–28% subscriber-gross-margin (2–4pp lower) but with 2–3× LTV → net subscriber-contribution-margin is 1.5–2× higher per cohort member.

**The "subscriber-math-changes-the-equation" rule:** A $40/mo consumable subscription with 5% monthly churn = $800 LTV before gross margin. A $40 one-time purchase might be $80 LTV over 2 orders. **Subscriptions shift the model from "every CAC dollar has to pay back fast" to "LTV justifies higher CAC".**

### Pillar 3 — Replenishment flow & smart cancellation

The 5-canonical subscription-flow components:

**(a) Welcome-to-subscription flow (Klaviyo + Postscript).** Triggered on first recurring-order-success. Email cadence: 1 email at 0d (welcome + manage-subscription-link) + 1 email at 7d (tips for using the product) + 1 email at 14d (refer-a-friend → 1 month free). SMS cadence: 1 SMS at 0d (welcome + manage-subscription-link). Suppression: customer has unsubscribed. Goal: activate subscriber in the first 14 days, establish subscription-as-routine.

**(b) Replenishment reminder flow (Klaviyo).** Triggered N days before expected-purchase-cadence (based on average-purchase-cadence from Shopify + Recharge data; per Recharge 2024, average is 45 days for vitamins / 60 days for pet food / 30 days for household consumables). Email cadence: 1 email at N-7d ("Your next shipment is coming up — manage your subscription") + 1 email at N-3d ("Your shipment is in 3 days — add anything?") + 1 email at N+0d (shipment-confirmed). Suppression: subscriber has cancelled OR changed shipment-date within last 7 days. Goal: prevent subscription-as-routine-break (subscriber forgets they have a subscription; gets surprised by recurring charge; cancels out of confusion).

**(c) Smart cancellation flow (Recharge + Klaviyo).** Triggered when subscriber initiates cancellation. The flow offers 4 alternatives BEFORE the cancellation completes:
1. **Pause subscription** (pause for 1 / 2 / 3 months) — recovers 30–40% of would-be-cancellations
2. **Skip next shipment** (skip the next recurring order) — recovers 15–25%
3. **Change frequency** (change from 30d to 60d / 90d) — recovers 5–15%
4. **Apply discount** (apply a one-time 25% discount on next shipment) — recovers 5–10%

If subscriber persists past all 4 → cancellation completes. Per Recharge 2024, smart cancellation recovers **20–35% of would-be-cancellations** (vs 0–5% with no smart-cancellation).

**(d) Dunning flow (Klaviyo + Recharge).** Triggered when subscriber-payment-fails (insufficient funds / expired card / fraud-block). Email cadence: 1 email at 0d (payment-failed + update-payment-link) + 1 email at 3d (second-attempt-coming + update-payment-link) + 1 email at 7d (subscription-paused + reactivate-link). SMS cadence: 1 SMS at 0d. Suppression: subscriber has updated payment within last 24 hours. Per Recharge 2024, dunning flow recovers **50–70% of subscription-renewals**.

**(e) Winback flow (Klaviyo + Recharge).** Triggered when subscriber-cancellation-completes. Email cadence: 1 email at 30d ("We miss you — here's 20% off your next order") + 1 email at 60d ("Your favorite is back in stock — 25% off") + 1 email at 90d ("Last chance — 30% off to come back"). SMS cadence: 1 SMS at 60d. Suppression: subscriber has placed a new order OR resubscribed. Per Recharge 2024, winback flow returns **10–20% of cancelled subscribers** within 90 days.

### Pillar 4 — Subscriber-cohort analytics & attribution-merge

The 4-corners framework that makes subscriber-economics measurable:

**(a) Triple Whale subscriber-cohort-LTV.** Triple Whale → Reports → Cohort LTV → filter to `subscription_status = active` OR `subscription_status = cancelled`. Compare 30d / 60d / 90d / 180d cohort LTV for subscribers vs one-time-purchasers. Expected: subscriber-cohort-LTV is 1.5–3× one-time-purchaser-cohort-LTV per Pillar 2 math. **This is the canonical attribution-merge — the operator MUST verify the multiplier with real data before pushing subscriptions beyond Phase 1.**

**(b) Recharge subscriber-analytics-dashboard.** Recharge → Analytics → Subscriber-overview → MRR (monthly recurring revenue) / Subscriber-count / Churn-rate / New-subscriber-rate / Reactivation-rate. Set up weekly-export to Triple Whale via webhook for canonical attribution-merge.

**(c) Klaviyo subscriber-cohort-segmentation.** Klaviyo → Segments → create `Active Subscribers` (customers with `subscription_status = active` AND `last_order_date > 30d ago`) + `Cancelled Subscribers` (customers with `subscription_status = cancelled` AND `cancellation_date < 90d ago`) + `Winback Target` (customers in Cancelled Subscribers). Wire these segments to Triple Whale for cohort LTV comparison.

**(d) Churn-alert-monitoring.** Set up Triple Whale → Alerts → `subscription_churn_rate > 8% per month` (median Recharge benchmark) → Slack alert. Operator reviews churn-pattern weekly; identifies the top cancellation-reason (per Recharge → Cancellation-reasons analytics); deploys counter-measures (smart-cancellation discount + replenishment-cadence + customer-service outreach).

### Pillar 5 — Inventory & fulfillment for subscriptions

The 4-corners framework for subscription-fulfillment-readiness:

**(a) Inventory-demand-forecasting.** Subscriber-base is **predictable** (every 30d/45d/60d/90d a cohort ships). Use this to drive inventory-demand-forecast: take `subscriber_count × average-order-value × per-period-cadence` → expected-replenishment-demand-over-N-days. Compare to current-inventory-levels + reorder-point + lead-time. Reorder subscription-SKUs to support 60-90 days of forecasted subscriber-demand + 30 days of one-time-purchase-demand = 90-120 days total SKU-coverage.

**(b) FIFO enforcement + lot/date tracking.** For SKUs with expiry (supplements / vitamins / food / beverages / cosmetics / skincare) — FIFO + lot/date-tracking is non-negotiable per Move #12 3PL-migration research/07 Pillar 4. Use **FEFO** (first-expiry-first-out) for subscription-fulfillment. Verify the 3PL's WMS exposes lot/date fields to Shopify + Klaviyo + Recharge.

**(c) Subscription-specialty-fulfillment-vendor.** For brands with >1,000 subscribers or >$100k MRR — consider a subscription-specialty 3PL (ShipBob subscription-team + ShipMonk subscription-team + specialized subscription-fulfillment-vendors like BoxOnLogix + eFulfillment). Per ShipBob 2024, subscription-specialty 3PLs have 30–50% lower pick-pack error rate on subscription-boxes vs generalist 3PLs.

**(d) Returns + refund policy for subscriptions.** Define subscription-specific return-policy:
- **Damaged-in-shipment:** full refund + free return shipping (no restocking fee)
- **Customer-remorse (ordered-too-much):** 80% refund (20% restocking fee for opened consumables) OR skip-next-shipment option
- **Subscription-cancellation:** pro-rated refund for un-shipped orders; no refund for already-shipped orders (industry default)

Communicate the policy clearly in the welcome-to-subscription flow + customer-portal + dunning-flow-email-footer.

---

## GMV-tier paths — which subscription scope when

### Path A — $100k–$500k GMV / <1,000 subscribers

**Operator profile:** Solo operator or 1–2 person team; <1,000 subscribers; <$20k MRR; just-launched or pre-profitability.

**Recommended stack:**
- **Platform:** Recharge Starter ($99/mo) OR Bold Subscriptions Starter ($49/mo)
- **Subscriber-discount:** 10–15% off
- **Subscriber-conversion-rate target:** 10–20% of consumable customers
- **Dunning:** Recharge native + Klaviyo dunning-flow
- **Smart cancellation:** Recharge native pause + skip (no discount)
- **Winback:** Manual Klaviyo flow (no Recharge winback-native)
- **Inventory-fulfillment:** In-house (subscription-volume doesn't justify 3PL yet)
- **Total subscription-program-cost:** $99–$149/mo platform + 1.34% + 19¢ transaction fee + 2 hr/wk operator time
- **Year-1 expected subscription-revenue-share:** 15–30% of consumable revenue
- **Year-1 expected subscriber-LTV-multiplier:** 1.5–2.5×
- **Year-1 ROI:** 8:1 to 15:1 (subscription-revenue / subscription-program-cost)
- **Time-to-launch:** 1–2 weeks for Phase 1 (PDP widget only); defer Phase 2–4 until >500 subscribers

### Path B — $500k–$10M GMV / 1,000–10,000 subscribers (DEFAULT)

**Operator profile:** 2–10 person team; 1,000–10,000 subscribers; $20k–$200k MRR; profitable or pre-profitability.

**Recommended stack:**
- **Platform:** Recharge Plus ($499/mo) OR Skio Plus ($499/mo)
- **Subscriber-discount:** 15–20% off
- **Subscriber-conversion-rate target:** 20–35% of consumable customers
- **Dunning:** Recharge native + Klaviyo dunning-flow + Postscript SMS dunning
- **Smart cancellation:** Recharge native pause + skip + change-frequency + 25%-discount
- **Winback:** Recharge native + Klaviyo winback-flow + retargeting ads
- **Inventory-fulfillment:** 3PL (per Move #12 — research/07 + playbook 14) with subscription-specialty team
- **Total subscription-program-cost:** $499/mo platform + 1.34% + 19¢ transaction fee + 4 hr/wk operator time
- **Year-1 expected subscription-revenue-share:** 25–50% of consumable revenue
- **Year-1 expected subscriber-LTV-multiplier:** 2.0–3.0×
- **Year-1 ROI:** 12:1 to 25:1
- **Time-to-launch:** 2–4 weeks for Phase 1+2 (PDP widget + customer portal + dunning); Phase 3+4 in 4–8 weeks

### Path C — $10M+ GMV / 10,000+ subscribers

**Operator profile:** Dedicated growth team; 10,000+ subscribers; $200k+ MRR; multi-channel DTC (Shopify + Amazon + Walmart).

**Recommended stack:**
- **Platform:** Recharge Enterprise OR Skio Enterprise OR Seal Subscriptions OR Stay AI
- **Subscriber-discount:** 15–20% off + segmented-discount (premium-tier gets 10% off; value-tier gets 25% off)
- **Subscriber-conversion-rate target:** 25–40% of consumable customers
- **Dunning:** Recharge + Skio + Klaviyo + Stripe Smart Retries + custom retry-logic
- **Smart cancellation:** Custom flow with 6+ alternatives + AI-driven discount-optimization
- **Winback:** Recharge + Klaviyo + retargeting + direct-mail + winback-specialist team
- **Inventory-fulfillment:** Multi-3PL orchestration (per Move #12 Path C — Stord + Flowspace + Extensiv) with subscription-specialty teams
- **Total subscription-program-cost:** $1k–$5k/mo platform + custom transaction fees + 10+ hr/wk operator time + dedicated subscription-team
- **Year-1 expected subscription-revenue-share:** 40–70% of consumable revenue
- **Year-1 expected subscriber-LTV-multiplier:** 2.5–3.5×
- **Year-1 ROI:** 15:1 to 35:1
- **Time-to-launch:** 4–12 weeks for Phase 1–4

**Default canonical pick:** **Path B** for default $500k–$10M GMV / 1,000–10,000 subscribers operator. Path A for $100k–$500k / <1,000 subscribers. Path C for $10M+ GMV.

---

## Common pitfalls — the 15 things that derail subscription programs

### Pitfall #1 — Launching subscriptions on SKUs customers don't re-purchase

**Symptom:** Operator installs Recharge + adds subscribe-and-save widget to ALL SKUs (hero + secondary + low-velocity). Subscriber-conversion-rate is 2–5% (vs 15–30% benchmark) because most SKUs have <60-day replenishment cadence OR aren't purchased-repeatedly. Subscribers churn at 15–20% per month because they never intended to subscribe.

**Fix:** **Subscribe-and-save widget only on the top 3–5 hero SKUs with the highest repeat-purchase-cadence.** Use Triple Whale → Reports → Cohort-purchase-cadence → identify SKUs with 30–120-day average-purchase-interval. Add widget to those SKUs only. Review every 90 days; expand widget to top 8–10 SKUs if average-subscriber-conversion-rate exceeds 15%.

### Pitfall #2 — Subscriber-discount-too-low (5% or less)

**Symptom:** Operator offers 5% subscriber-discount to "preserve margin." Subscriber-conversion-rate is 3–7% (vs 15–30% benchmark). Subscription-program-cost (1.34% + 19¢ per recurring order + $99/mo platform + 4 hr/wk operator time) is not amortized.

**Fix:** **Subscriber-discount at 15%** as the default per Recharge 2024 conversion-benchmarks. 20% for highly-competitive consumables (supplements / vitamins / pet food). 10% for premium brands (luxury skincare / premium pet). **A 15% subscriber-discount on a $40 consumable = $6/order discount; over a 12-month subscriber-LTV of $480 (12 orders), the discount costs $72; the LTV-multiplier of 2.0–2.5× adds $480–$720 in incremental LTV. Net: $400–$650 incremental LTV per subscriber per year.** The math overwhelmingly favors the discount.

### Pitfall #3 — No smart-cancellation flow

**Symptom:** Operator's Recharge cancellation-flow goes straight to "confirm cancellation" with no alternatives. Per Recharge 2024, this loses 35–50% of would-be-cancellations who would have accepted pause/skip/discount. Subscriber-monthly-churn climbs to 12–18%.

**Fix:** **Implement smart-cancellation with 4 alternatives:** pause for 1/2/3 months (recovers 30–40% of would-be-cancellations) + skip next shipment (recovers 15–25%) + change frequency to 60d/90d (recovers 5–15%) + apply 25% one-time discount (recovers 5–10%). Configure in Recharge → Cancellation-flow → Smart-cancellation. **Expected outcome: monthly-churn drops from 12–18% to 5–8%.**

### Pitfall #4 — No replenishment reminder flow

**Symptom:** Subscriber's recurring-order-charges without warning. Customer is surprised by charge; cancels out of confusion ("I forgot I had a subscription"). Churn-rate climbs to 10–15% per month.

**Fix:** **Ship replenishment reminder flow in Klaviyo** triggered N-7d / N-3d / N+0d before recurring-shipment. Email at N-7d: "Your next shipment is coming up — manage your subscription." Email at N-3d: "Your shipment is in 3 days — add anything?" Email at N+0d: shipment-confirmed. SMS at N-3d (Postscript). Goal: prevent subscription-as-routine-break.

### Pitfall #5 — No dunning flow for failed payments

**Symptom:** Subscriber's payment-fails (insufficient funds / expired card / fraud-block). No email/SMS sent. Subscription auto-pauses after 3 failed attempts. 30–50% of subscribers never come back to update-payment-method. Subscription-revenue-loss: 5–10% of total MRR per year.

**Fix:** **Ship dunning flow in Klaviyo + Postscript** triggered on Recharge `subscription_payment_failed` event. Email cadence: 1 at 0d (payment-failed + update-link) + 1 at 3d (second-attempt-coming + update-link) + 1 at 7d (subscription-paused + reactivate-link). SMS at 0d. **Expected outcome: 50–70% of dunning emails recover the subscription per Recharge 2024.**

### Pitfall #6 — Subscriber-discount applies to one-time-purchase-cannibalization

**Symptom:** Customer adds consumable to cart as one-time-purchase. Sees "Subscribe & save 15%" widget. Realizes they could save $6. Cancels one-time-purchase, subscribes. Net: one-time-purchase-LTV of $80 becomes subscriber-LTV of $200 (multiplier). But operator's "subscriber-cannibalization-rate" is 30–50% (i.e. 30–50% of consumable-revenue would have happened anyway as one-time-purchase).

**Fix:** **Track the subscriber-cannibalization-rate separately from organic-subscriber-growth.** Triple Whale → Reports → Cohort LTV → compare (a) "subscribers who would have been one-time-purchasers" vs (b) "subscribers who would not have purchased at all" via holdout-test (10% of consumable-customers don't see the subscribe-and-save widget for 90 days; measure conversion-delta). Expected organic-subscriber-growth: 30–50% of total subscribers; expected cannibalization: 50–70% (i.e. they would have bought one-time anyway). **The net-revenue-uplift from subscriptions is the LTV-multiplier MINUS the cannibalization-rate × one-time-LTV.** A 2.0× LTV-multiplier with 60% cannibalization = 2.0× 40% (organic) + 1.0× 60% (cannibalized) = 0.8× + 0.6× = **1.4× net-revenue-uplift**. Still positive; not as eye-popping as the headline LTV-multiplier.

### Pitfall #7 — No Triple Whale attribution-merge for subscriber-cohort-LTV

**Symptom:** Operator has subscribers but doesn't know subscriber-cohort-LTV vs one-time-purchaser-cohort-LTV. Operator assumes "subscriptions must be working because revenue is up 20%." Doesn't verify with attribution data. Operates blind; may be over-investing in subscribers that aren't actually 2× LTV.

**Fix:** **Set up Triple Whale subscriber-cohort-LTV-report.** Triple Whale → Reports → Cohort LTV → filter by `subscription_status = active` vs `subscription_status = never`. Compare 30d / 60d / 90d / 180d cohort-LTV. Set up weekly Slack-alert with subscriber-cohort-LTV. **If subscriber-LTV-multiplier is <1.5× after 90 days → investigate why (subscriber-churn too high? smart-cancellation not deployed? dunning not deployed? replenishment-reminder missing?).**

### Pitfall #8 — Wrong-SKU subscription-widget placement

**Symptom:** Operator adds subscribe-and-save widget to SKUs with low-replenishment-cadence (apparel, jewelry, durable-goods). Subscriber-conversion-rate is 2–4% because customer doesn't intend to re-purchase. Subscribers churn at 20–30% per month because they cancel after the first shipment.

**Fix:** **Subscribe-and-save widget ONLY on SKUs with 30–120-day average-purchase-cadence AND consumables-category.** Use Triple Whale → Cohort-purchase-cadence-report to identify the right SKUs. For non-consumables categories (apparel / jewelry / electronics / durable-goods / home-decor), Move #11 subscriptions doesn't apply — defer entirely.

### Pitfall #9 — Manual-subscription-migration without proper testing

**Symptom:** Operator migrates 5,000 existing subscribers from manual-recurring-Chargify OR Stripe Subscriptions OR WP Subscriptions to Recharge. Migration fails silently; 10–20% of subscribers don't get migrated. Operator discovers the loss 30+ days later when subscribers complain about no recurring-order.

**Fix:** **Migration-3-step recipe per Skio 2024 migration-guide + Recharge 2024 migration-guide:**
1. **Pre-migration-audit:** Triple Whale → Reports → Subscription-customers → export full list. Verify email + subscription-status + recurring-amount + next-billing-date for every customer.
2. **Pilot-migration:** Migrate 10–50 subscribers first. Verify every subscriber has been migrated correctly + first recurring-order-charges-on-correct-date + Klaviyo-receives-subscription-event.
3. **Bulk-migration-with-rollback:** Migrate remaining subscribers in batches of 500–1,000. After each batch, verify batch-migration-success-rate + subscriber-complaint-rate. If batch-success-rate <95%, rollback + investigate.

### Pitfall #10 — Subscriptions without Move #6 Triple Whale attribution

**Symptom:** Operator launches subscriptions but doesn't have Triple Whale attribution-set-up. Subscriber-cohort-LTV is not measurable. Operator operates blind; may be investing in subscribers that aren't actually 2× LTV.

**Fix:** **Subscriptions REQUIRES Move #6 Triple Whale attribution.** Gate Phase 1 on Triple Whale being installed with `subscription_status` event-stream wired. Verify subscriber-cohort-LTV is measurable BEFORE pushing subscriptions beyond Phase 1.

### Pitfall #11 — Subscriptions without Move #4 welcome-series

**Symptom:** Subscriber's first recurring-order-ships. No welcome-to-subscription-flow fires. Subscriber doesn't know how to manage-subscription (pause / skip / change-frequency). Churns within 30 days because "I don't know how to skip this month."

**Fix:** **Subscriptions REQUIRES Move #4 welcome-series.** Gate Phase 1 on Klaviyo welcome-series being live + a subscription-specific welcome-email ("Welcome to your subscription — here's how to manage it"). Add subscription-specific welcome-SMS via Postscript.

### Pitfall #12 — Subscriptions without Move #8 loyalty

**Symptom:** Subscriber earns no loyalty-points for recurring-orders. Subscriber doesn't feel rewarded for staying subscribed. Churns within 90 days because "no reason to stay subscribed vs one-time."

**Fix:** **Subscriptions REQUIRES Move #8 loyalty.** Gate Phase 2 on Smile.io (or Yotpo Loyalty / LoyaltyLion) being configured to award loyalty-points for recurring-orders. Subscriber earns 2× points for subscription-orders vs one-time-orders per Smile.io benchmarks.

### Pitfall #13 — Subscriptions without Move #7 SMS

**Symptom:** Subscriber's payment-fails. Email-only dunning fires. Subscriber doesn't see the email (inbox-spam-filter). Subscription auto-pauses. Subscriber cancels out of confusion.

**Fix:** **Subscriptions benefits from Move #7 SMS.** Add SMS-dunning at 0d post-payment-failure (high-urgency SMS catches attention that email misses). Add SMS-replenishment-reminder at N-3d (most subscribers read SMS within 5 minutes vs email within 5 hours per Postscript benchmarks).

### Pitfall #14 — Wrong-inventory-management for subscription-SKUs

**Symptom:** Operator doesn't increase inventory-reorder-point for subscription-SKUs. Inventory-runs-out mid-month. 30–40% of subscribers experience "out of stock" → auto-paused or cancelled. Subscriber-monthly-churn spikes to 15–20%.

**Fix:** **Inventory-reorder-point for subscription-SKUs = 60-90 days forecasted-subscriber-demand + 30 days one-time-purchase-demand = 90-120 days total SKU-coverage.** Use Triple Whale → Cohort-purchase-cadence to forecast subscriber-demand. Verify reorder-point + lead-time + safety-stock covers 90-120 days for all subscription-SKUs.

### Pitfall #15 — No subscription-experience-testing

**Symptom:** Operator launches subscription without testing the full subscriber-experience end-to-end. Customer finds a bug in the customer-portal; abandons subscription within first 30 days. Operator doesn't catch the bug because no QA-testing was done.

**Fix:** **Pre-launch QA checklist (12 items per Recharge 2024 launch-checklist):**
1. PDP subscribe-and-save-widget visible + clickable on all hero-SKUs
2. Cart-line-item-shows-subscriber-discount
3. Checkout captures payment-method that supports recurring-billing (Shopify Payments + Stripe tokenized card)
4. Customer-portal-accessible from account-page + email-footer + SMS-footer
5. Customer-portal pause / skip / change-frequency / cancel all work
6. Klaviyo welcome-to-subscription-flow fires on first-recurring-order
7. Klaviyo dunning-flow fires on payment-failed
8. Postscript SMS-dunning fires on payment-failed
9. Recharge → Triple Whale webhook delivers subscriber-events
10. Triple Whale subscriber-cohort-LTV-report populates within 24h
11. 10 test-subscribers complete full subscribe-to-cancel cycle without bugs
12. Refund-policy clearly visible in customer-portal + welcome-email

---

## Verification gates (end-of-phase check)

### Gate A — Phase 1 readiness (end of Week 2)

10 prereqs:
1. Recharge (or Skio / Bold) installed + Shopify-app-OAuth'd + first test-order completes-subscribe-flow
2. Subscribe-and-save widget live on top 3–5 hero-SKUs
3. Triple Whale attribution live with `subscription_status` event-stream wired
4. Klaviyo welcome-series live (Move #4) with subscription-aware conditional-block
5. Customer-portal accessible from account-page + email-footer
6. Recharge → Triple Whale webhook delivering subscriber-events
7. Triple Whale subscriber-cohort-LTV-report populates within 24h
8. Smart-cancellation-flow configured (at minimum pause + skip)
9. Dunning-flow configured (Recharge native retry-logic)
10. 10 test-subscribers complete full subscribe-to-cancel cycle without bugs

### Gate B — Phase 2 readiness (end of Week 6)

10 prereqs:
1. Pre-existing subscribers (manual + Stripe + WP Subscriptions) migrated to Recharge (per Pitfall #9 3-step recipe)
2. Dunning-flow fires on `subscription_payment_failed` event (Klaviyo + Postscript)
3. Replenishment-reminder flow fires on N-7d / N-3d / N+0d before recurring-shipment
4. Subscriber-discount applied correctly (verify on 5 test-orders)
5. Loyalty-points awarded for subscription-orders (Move #8 Smile.io)
6. SMS-replenishment-reminder fires (Postscript)
7. SMS-dunning fires (Postscript)
8. First 100 real-subscribers' first-recurring-order completes without bugs
9. Subscription-revenue-share tracked weekly in Triple Whale (target: 15–25% of consumable-revenue at end of Week 6)
10. Subscriber-monthly-churn tracked weekly (target: <8% per month at end of Week 6)

### Gate C — Phase 3 readiness (end of Week 10)

10 prereqs:
1. Smart-cancellation with 4 alternatives deployed (pause + skip + change-frequency + 25%-discount)
2. Winback-flow deployed (Klaviyo + Recharge native + retargeting ads)
3. Triple Whale subscriber-cohort-LTV-tracking fires weekly (subscriber-LTV-multiplier measured)
4. Subscriber-CAC-payback-tracked weekly (target: <60 days vs one-time-purchase baseline)
5. Churn-alert-monitoring deployed (Triple Whale → Slack alert on `subscription_churn_rate > 8%`)
6. Cancellation-reason analytics deployed (Recharge → Cancellation-reasons)
7. Inventory-reorder-point for subscription-SKUs = 90-120 days forecasted-demand
8. Subscription-specialty-3PL contracted (if >1,000 subscribers OR >$100k MRR)
9. Subscription-revenue-share = 25–40% of consumable-revenue at end of Week 10
10. Subscriber-monthly-churn = 5–8% per month at end of Week 10

### Gate D — Phase 4 readiness (end of Week 12)

9 prereqs:
1. Subscriber-cohort-LTV-multiplier = 2.0–3.0× one-time-purchaser-LTV (Triple Whale measurement)
2. Subscriber-revenue-share = 40–60% of consumable-revenue (top subscription-brand benchmark)
3. Subscriber-monthly-churn = 3–5% per month (top subscription-brand benchmark)
4. Subscriber-CAC-payback = <30 days (vs 60-90 days for one-time-purchase baseline)
5. Smart-cancellation-recovery-rate = 20–35% of would-be-cancellations
6. Dunning-recovery-rate = 50–70% of subscription-renewals
7. Winback-return-rate = 10–20% of cancelled-subscribers
8. Subscription-gross-margin-overhead = 2–4% of subscription-revenue (within target band)
9. Net-revenue-uplift from subscriptions = 1.4–1.8× one-time-purchase baseline (after subscriber-cannibalization-adjusted per Pitfall #6)

---

## Cost & ROI estimate (default $500k–$10M GMV brand, Path B scope)

**Operator profile:** US-based Shopify DTC brand at $2M US DTC GMV / 2,000 orders/mo / $80 AOV / 65% contribution margin / 70% consumable-revenue-share / 50 SKUs / 30-day average-purchase-cadence for hero-consumable-SKUs.

**Path B Year-1 cost-stack:**

- Recharge Plus platform: $499/mo × 12 = $5,988 / yr
- Recharge transaction fee: 1.34% + 19¢ × 18,000 subscription-orders/yr (50% of consumable-orders × 70% consumable-share × 80% Recharge-Period) ≈ $5,290 / yr
- Klaviyo subscription-flow setup (one-time): $1,000
- Postscript SMS subscription-flow setup (one-time): $500
- Triple Whale subscription-cohort-LTV-report (one-time): $500
- Smart-cancellation-flow setup (one-time): $500
- Dunning-flow setup (one-time): $300
- Winback-flow setup (one-time): $300
- Smart-cancellation 25%-discount-cost: 25% × $80 × 5% × 500 would-be-cancellations/yr = $500 / yr
- Loyalty-points subscription-incentive (Move #8): 2× points × 1pt/$ × 18,000 subscription-orders = $36,000 / yr (cost of points-redemption; partially-offset by subscriber-LTV-multiplier)
- 3PL subscription-specialty-fulfillment (per Move #12 research/07 + playbook 14 Path B): incremental $0.50/order × 18,000 subscription-orders = $9,000 / yr
- Subscription-specialty-staff OR agency-management: $2,000/mo × 12 = $24,000 / yr
- **Subtotal subscription-program-cost: ~$84,000 / yr**

**Year-1 incremental net (Path B):**

- Subscriber-cohort-LTV-multiplier × one-time-purchaser-LTV: 2.5× × $200 = $500 incremental LTV per subscriber
- Year-1 subscriber-count: 1,500 (per Phase 1 + Phase 2 cadence)
- Subscriber-LTV × subscriber-count × 12-month-stay-probability (1 - 0.5 churn-rate)^12 ≈ 60% stay = $500 × 1,500 × 60% = $450,000 / yr gross
- One-time-purchase-cannibalization-adjusted: 60% of subscribers would have purchased one-time anyway at $200 LTV → 60% × 1,500 × $200 = $180,000 / yr cannibalized one-time-revenue
- Net incremental subscription-revenue: $450,000 - $180,000 = $270,000 / yr
- Subtract subscription-program-cost: $270,000 - $84,000 = **$186,000 / yr net Year 1**
- **Year-1 ROI: $270,000 / $84,000 = 3.2:1** (or vs net: $186,000 / $84,000 = 2.2:1 net)

**Year-2 onward (after subscriber-base-grows + LTV-compounds + churn-stabilizes):**

- Subscriber-base grows: 1,500 → 3,500
- Subscriber-LTV-multiplier stabilizes: 2.5×
- Net incremental subscription-revenue: $700,000 / yr
- Subtract subscription-program-cost (flat): $700,000 - $84,000 = **$616,000 / yr net Year 2**
- **Year-2 ROI: $700,000 / $84,000 = 8.3:1** (or vs net: $616,000 / $84,000 = 7.3:1 net)

**Path A Year-1 ROI (smaller brand, $200k GMV / 250 orders/mo):**

- Subscription-program-cost: $99/mo platform + 1.34% + 19¢ txn fee + 1 hr/wk operator time = $1,800 / yr
- Year-1 subscriber-count: 200
- Net incremental subscription-revenue: 200 × $500 × 60% - $30,000 cannibalized = $30,000 / yr
- Net Year 1: $30,000 - $1,800 = $28,200 / yr
- **Year-1 ROI: 16.7:1**

**Path C Year-1 ROI (larger brand, $25M GMV / 20k orders/mo):**

- Subscription-program-cost: $1k–$5k/mo platform + custom transaction fees + 10+ hr/wk operator time + dedicated team = $500,000 / yr
- Year-1 subscriber-count: 25,000
- Net incremental subscription-revenue: 25,000 × $500 × 60% - $3,750,000 cannibalized = $3,750,000 / yr
- Net Year 1: $3,750,000 - $500,000 = $3,250,000 / yr
- **Year-1 ROI: 7.5:1**

**Default canonical pick:** **Path B** for default $500k–$10M GMV / 1,000–10,000 subscribers operator. Path A for $100k–$500k / <1,000 subscribers. Path C for $10M+ GMV.

---

## Next moves after Path B ships

The 4 canonical follow-ups after Path B subscription-program ships:

1. **Move #12 3PL-migration subscription-specialty-fulfillment** — Path C multi-3PL orchestration with subscription-specialty teams (ShipBob subscription-team + ShipMonk subscription-team + specialized subscription-fulfillment-vendors like BoxOnLogix + eFulfillment) compounds the Move #12 3PL-migration track (research/07 + playbook 14 + asset 15-3pl-selection-card). The 30–50% lower pick-pack-error-rate on subscription-boxes from specialty-3PLs is the canonical follow-up.
2. **Move #14 lifecycle-marketing subscription-renewal-flow + dunning** — the Tier 2 subscription-renewal + dunning flow from the lifecycle-marketing track (research/05 + playbook 12 + asset 14 + scripts/lifecycle_flow_health_check.py) is the canonical subscriber-retention substrate. Compounds the subscription-program by adding 5 additional subscriber-touchpoints (7d-pre-renewal + renewal-failed + 3d-post-failure + winback + VIP).
3. **Move #11 international-expansion subscription-international-shipping** — for $1M+ GMV brands expanding into EU + UK + CA + AU + JP per Move #11 international-expansion (research/04 + playbook 11 + asset 13), add international-subscription-shipping (EU + UK 3PL with Recharge-integration + IOSS-registration for EU + CA GST + AU GST + JP consumption-tax). Compounds the subscription-program by adding cross-border subscribers (60M+ cross-border subscribers per Recharge 2024 international benchmarks).
4. **Subscription-experience-optimization** — Phase 5+ optimizations: AI-driven churn-prediction (Stay AI / Skio AI), segment-specific subscriber-discount (premium-tier 10% vs value-tier 25%), subscription-gifting (1 / 3 / 6 / 12-month gift subscriptions), subscription-loyalty-tier (gold-subscriber / platinum-subscriber with VIP perks), subscription-bundle-optimization (kit-bundles with subscription-discount), subscription-marketplace-listings (Amazon Subscribe & Save + Walmart subscription) — the canonical long-tail subscription-program-optimization roadmap.

A new operator who's shipped Path B subscription-program should pick the Move (1)–(4) that matches their brand's next bottleneck, then come back to evaluate Path C enterprise subscription-platform when subscriber-count crosses 10,000.

---

## Related

- `research/00-ecommerce-ops-landscape.md` — strategic landscape + unit-econ framework (the foundational doc that scopes subscriptions as a deferred move per §What-this-list-is-NOT lines 188 + 216 + 513-514)
- `research/01-tools-stack-comparison.md` — vendor matrix + pricing (this doc adds Recharge / Skio / Bold / Stay AI / Appstle / Seal / Loop subscription-platform pricing + lifecycle flow benchmarks)
- `research/02-top-10-leverage-moves.md` — the prioritized list + status tracker (the "what this list is NOT" section already calls out subscription program + 3PL migration + marketplace expansion; this doc adds subscription-program synthesis as the canonical Move #11)
- `research/03-30-day-rollout-plan.md` — 30-day MVP + Move #11 subscription-program as the canonical #1-priority follow-up after 30 days (line 176)
- `research/04-international-expansion.md` — international-expansion synthesis (cross-border subscribers per Move #11 international-expansion — 60M+ cross-border subscribers prefer localized flows)
- `research/05-lifecycle-marketing.md` — lifecycle-marketing expansion (Tier 2 subscription-renewal + dunning + winback flows from the lifecycle-marketing track)
- `research/06-marketplace-expansion.md` — marketplace-expansion synthesis (Amazon Subscribe & Save + Walmart subscription per Pillar 5 attribution-merge)
- `research/07-3pl-migration.md` — 3PL-migration synthesis (subscription-specialty 3PL fulfillment per Pillar 4)
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1 cart-abandon (Move #1 substrate for subscriber-retention; one-time-purchase-customers are the canonical subscriber-conversion-funnel)
- `playbooks/04-welcome-series-klaviyo.md` — Move #4 welcome-series (Move #4 substrate for welcome-to-subscription-flow; subscribers are welcome-series-extension-targets)
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #7 SMS (Move #7 substrate for SMS-replenishment-reminder + SMS-dunning)
- `playbooks/07-loyalty-program-smile.md` — Move #8 loyalty (Move #8 substrate for subscriber-loyalty-points; 2× points for subscription-orders)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6 attribution (Move #6 substrate for subscriber-cohort-LTV-tracking; subscriptions REQUIRE Move #6)
- `playbooks/14-3pl-migration.md` — Move #12 3PL-migration (subscription-specialty 3PL fulfillment per Pillar 4)
- `playbooks/13-marketplace-launch.md` — Move #13 marketplace-expansion (Amazon Subscribe & Save + Walmart subscription per Pillar 5 attribution-merge)

## Sources

**Subscription-platform benchmarks (8)**
- [Recharge 2024 State of Subscriptions Report](https://www.rechargepayments.com/2024-state-of-subscriptions) — subscriber-conversion-rate 15–30% / monthly-churn 5–8% / smart-cancellation-recovery 20–35% / dunning-recovery 50–70% / winback-return 10–20% / LTV-multiplier 2.0–3.5×
- [Skio 2024 Subscription Migration Guide](https://www.skio.com/migration-guide) — Recharge migration + Klaviyo-native subscription flows + free migration for >500 subscribers
- [Bold Subscriptions 2024 Pricing + Migration Guide](https://boldcommerce.com/subscriptions) — Bold Subscriptions $49–$199/mo + 0.7% transaction fee + free migration for >500 subscribers
- [Stay AI 2024 Churn-Prediction Benchmarks](https://www.stay.ai/) — AI-driven churn-prediction + smart-cancellation-recovery + 25–35% lift vs Recharge-native
- [Appstle 2024 Multi-Channel Subscription Guide](https://www.appstle.com/) — Shopify + Amazon + Walmart multi-channel subscriptions for omnichannel brands
- [Seal Subscriptions 2024 Enterprise Pricing](https://www.sealsubscriptions.com/) — Enterprise Shopify Plus subscription-platform
- [Loop Subscriptions 2024 Native Subscription Guide](https://www.loopsubscriptions.com/) — Subscription-native (not billing-app-on-Shopify) + deeper churn-tools
- [Chargebee 2024 Subscription-Billing Platform Report](https://www.chargebee.com/) — Enterprise subscription-billing + B2B-subscription + quote-to-cash

**Subscriber-economics benchmarks (6)**
- [Recharge 2024 Subscriber-Cohort LTV Benchmarks](https://www.rechargepayments.com/blog/subscriber-cohort-ltv) — 2.0–3.5× LTV-multiplier for consumables; 1.5–2.5× for moderate-replenishment; 1.2–1.8× for weak-replenishment
- [Justuno 2024 Subscription-LTV Benchmarks](https://www.justuno.com/blog/subscription-ltv) — subscriber-CAC-payback 40–60% faster than one-time-purchase
- [Littledata 2024 Subscription-Cohort Analytics](https://www.littledata.com/blog/subscription-cohort) — Triple Whale + Littledata subscription-cohort-LTV-merge
- [Shopper Approved 2024 Subscription-Cancellation-Flow Research](https://www.shopperapproved.com/blog/subscription-cancellation-flow) — smart-cancellation-recovery 20–35% vs 0–5% baseline
- [Recharge 2024 Subscription-Flow Benchmarks](https://www.rechargepayments.com/blog/subscription-flow-benchmarks) — welcome-to-subscription + replenishment-reminder + dunning + winback flow benchmarks
- [Klaviyo 2024 Subscription-Flow Benchmarks](https://www.klaviyo.com/blog/subscription-flow) — Klaviyo + Recharge integration + subscription-cohort-segmentation

**Subscription-fulfillment benchmarks (5)**
- [ShipBob 2024 Subscription-Fulfillment Guide](https://www.shipbob.com/blog/subscription-fulfillment) — 30–50% lower pick-pack-error-rate on subscription-boxes vs generalist 3PLs
- [ShipMonk 2024 Subscription-Fulfillment Guide](https://www.shipmonk.com/subscription-fulfillment) — subscription-specialty-fulfillment + auto-replenishment + churn-management
- [BoxOnLogix 2024 Subscription-Fulfillment](https://www.boxonlogix.com/subscription-fulfillment) — subscription-box-fulfillment + kitting + custom-box + monthly-cadence
- [eFulfillment 2024 Subscription-Fulfillment](https://www.efulfillmentservice.com/subscription-fulfillment) — subscription-fulfillment + auto-replenishment + returns-management
- [Multichannel Merchant 2024 Subscription-Fulfillment Benchmark](https://www.multichannelmerchant.com/2024-subscription-fulfillment) — 5–10% pick-pack-error-rate on subscription-boxes vs 1–3% on generalist ecom

**International-subscription benchmarks (4)**
- [Recharge 2024 International-Subscription Benchmarks](https://www.rechargepayments.com/blog/international-subscription) — 60M+ cross-border subscribers + IOSS + EU VAT MOSS compliance + per-market subscriber-discount-localization
- [Shopify Markets 2024 Cross-Border Subscription Guide](https://www.shopify.com/markets) — Shopify Markets + Recharge + multi-currency subscription pricing
- [Zonos 2024 International-Subscription Tax + Duty](https://www.zonos.com/) — IOSS + EU VAT MOSS + UK VAT + CA GST + AU GST + JP consumption-tax for cross-border subscriptions
- [DHL eCommerce 2024 Cross-Border Subscription Shipping](https://www.dhl.com/) — 5–7 day ship time + $15–$30 landed-cost + IOSS-compliant subscription-shipping

**Subscription-program-overhead benchmarks (4)**
- [Recharge Payments 2024 Merchant Survey](https://www.rechargepayments.com/blog/merchant-survey) — subscription-program-cost 2–4% of subscription-revenue + 1.34% + 19¢ transaction fee
- [Stripe 2024 Subscription-Billing Benchmarks](https://stripe.com/docs/billing) — Stripe Smart Retries + dunning + winback-recovery-rates + subscription-billing-overhead
- [Justuno 2024 Subscription-CAC Payback Benchmarks](https://www.justuno.com/blog/subscription-cac-payback) — 40–60% faster CAC-payback vs one-time-purchase
- [Chargebee 2024 Subscription-Program Cost Benchmarks](https://www.chargebee.com/) — subscription-platform-cost 1.5–3% of subscription-revenue + dunning-cost 0.2–0.5% + winback-cost 0.1–0.3%