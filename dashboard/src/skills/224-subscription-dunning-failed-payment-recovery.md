---
name: subscription-dunning-failed-payment-recovery
title: Subscription dunning + failed-payment recovery
category: subscription-dunning
tier: 1
priority: P0
default_move: 14.2
year_1_roi_band: "8:1–28:1"
sms_friendly: true
last_updated: 2026-09-19
sources: [recharge 2024, smile 2024, klaviyo 2024, postscript 2024, stripe-billing 2024, recurly 2024, chargebee 2024, profitwell 2024, paddle 2024, maxio 2024, zuora 2024, okendo-subscriptions 2024, stay-ai 2024, loop-subscriptions 2024, bold-subscriptions 2024, skio 2024, appstle 2024, subbly 2024, smartrr 2024, doublecheck-research 2024, baymard 2024, smart-insights-dunning-benchmarks-2024, profitwell-involuntary-churn-benchmark-2024, statista-recurring-payments-failure-2024, gocardless-failed-payment-research-2024, g2-dunning-software-2024]
---

# Subscription dunning + failed-payment recovery

> Move #14.2 is the canonical **involuntary-churn-recovery layer** every DTC subscription brand needs after Move #1 (cart recovery) + Move #4 (welcome) + Move #5 (Klaviyo+Postscript) + Move #11 (subscriptions) + Move #14.1 (lifecycle-flow-library): deploy a **Recharge + Stay AI + Skio + Stripe Billing + Chargebee + Recurly + ProfitWell** dunning engine that recovers **38–62% of failed recurring payments** (the canonical Stripe 2024 + ProfitWell 2024 + Recurly 2024 involuntary-churn benchmark), captures the **9–15% of subscription transactions that fail on first charge** (the canonical Baymard 2024 + Statista 2024 recurring-payments-failure benchmark — driven primarily by expired cards, insufficient funds, and 3DS / SCA friction), and converts involuntary churn into **recovered MRR of 4–10% of monthly subscription revenue**. **Recharge native dunning** is the canonical Path A pick for Shopify-DTC; **Stay AI** is the canonical Path B pick for smart-card-update + AI-predicted-failure; **Stripe Billing Smart Retries** is the canonical Path C pick for cross-platform subscriptions; **Chargebee / Recurly** is the canonical Path D pick for $10M+ GMV brands with multi-gateway needs. Year-1 ROI band **8:1–28:1** with a default **15:1** at $1M subscription GMV Path B. Ship AFTER Move #11 (subscriptions) shipped ≥90 days AND ≥100 active subscribers AND Move #5 (Klaviyo+Postscript) wired AND a baseline MRR-dashboard exists, in a 5-phase build over 14–28 days. Companion artifact scope: this skill synthesizes the canonical 6-pillar dunning framework (Pillar 1 payment-method-update-CTA-engine / Pillar 2 smart-retry-engine / Pillar 3 dunning-email-cadence / Pillar 4 dunning-SMS-cadence / Pillar 5 voluntary-vs-involuntary-churn-segmentation / Pillar 6 winback-after-cancellation) for $100k+ subscription-GMV brands. Distinct from `retention/subscription-replenishment` (Move #11 — replenishment-cycle-focused on consumable SKU-cadence) and from `retention/lifecycle-flow-library` (Move #14 — 20-flow email/SMS library across all stages).

## When to use this skill

**Use this skill when the operator has shipped Move #11 (subscriptions) ≥90 days AND is observing recurring failed-payment notifications from Recharge / Stay AI / Stripe / Chargebee that are silently converting active subscribers into cancelled ones.** Subscription dunning is structurally distinct from Move #11's replenishment cadence (which optimizes WHEN a consumable subscription ships) and from Move #14's lifecycle-flow-library (which orchestrates email/SMS across all customer-lifecycle stages). Move #14.2 is the **involuntary-churn-recovery layer** — the operator should only initiate it when ALL of the following are true:

You have:
- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access AND a subscription app installed (Recharge / Stay AI / Skio / Bold / Loop Subscriptions / Appstle / Subbly / Smartrr / Okendo Subscriptions).
- **≥100 active subscribers** with at least 30+ days of recurring-billing history — below this threshold, deferred dunning + manual card-update reminders suffice; the platform-fee overhead is not amortized.
- **Move #11 (subscriptions) shipped ≥90 days** AND a baseline MRR-dashboard exists (Recharge Analytics / ProfitWell / Baremetrics / Stripe Sigma) — without a baseline, the operator cannot measure dunning-recovery-rate or attribute recovered MRR to specific flows.
- **Move #5 (Klaviyo + Postscript) wired** AND ≥3 baseline Klaviyo segments defined (active_subscriber / past_due_subscriber / cancelled_subscriber / at_risk_subscriber) — the dunning cadence depends on Klaviyo + Postscript as the cross-channel reminder substrate.
- **≥$10k MRR / ≥$120k ARR** AND ≥$30 AOV — below these thresholds, the subscription base is too thin to justify a dedicated dunning-platform; Recharge-native dunning + manual card-update reminders are sufficient.
- **Documented dunning decision** — retry-engine choice (Recharge-native vs Stay AI vs Stripe Billing Smart Retries vs Chargebee) + email cadence + SMS cadence + suppression rules. Without this, the operator is reacting to failed payments one at a time.

You do NOT have:
- A documented payment-failure-recovery rate (the canonical "we don't know what % of failed payments we're recovering" gap)
- A proactive card-expiration-warning flow (the canonical "we only learn the card is expired when the charge fails" gap)
- A voluntary-vs-involuntary-churn segmentation (the canonical "all churn looks the same to us" gap)
- A winback-after-cancellation flow (the canonical "customers cancel and never hear from us again" gap)
- A double-failure escalation rule (the canonical "we retry 4× in 24 hours and then silently cancel" gap)

## What "best in class" looks like

Reference: Whoop (recovery 50–62%), Athletic Greens / AG1 (recovery 45–55%), Care/of (recovery 48–58%), Hims / Hers (recovery 42–52%), Hubble (recovery 38–50%), BarkBox (recovery 45–55%).

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Pre-charge card-expiration warning (30d before) | Email + SMS at 30d, 14d, 7d | Email at 7d | + in-app banner |
| Pre-charge card-expiration warning (7d before) | Email + SMS + in-app | Email only | SMS at 7d |
| Smart retry timing | 1d, 3d, 5d, 7d after failure (Recharge default) | Same-day retry | AI-predicted optimal day (Stay AI / Stripe Smart Retries) |
| Smart retry attempts | 4 retries over 14 days | 1 retry | 6 retries over 21 days |
| Retry success lift vs naive retry | +20–35% recovery (Stay AI 2024) | 0% (naive single-retry) | +40% (Stripe Smart Retries) |
| Dunning email cadence | 4 emails over 21 days (failure / +3d / +7d / +14d) | 1 email at failure | 6 emails + SMS |
| Dunning SMS cadence | 2 SMS over 14 days (+1d / +7d) | None | 3 SMS + email |
| Card-update CTA placement | Account page + dedicated email-CTA + SMS-CTA | In-app email only | Branded hosted card-update page |
| Voluntary vs involuntary churn segmentation | Separate segments + separate winback flows | All churn treated the same | Cancel-flow survey + segmentation-by-cancel-reason |
| Winback-after-cancellation | 3 emails over 60 days | None | 5 emails + discount ladder |
| Involuntary churn rate target | <4% of MRR (Hims benchmark) | <7% | <2.5% |
| Dunning recovery rate (of failed payments) | 50–62% (Whoop benchmark) | 25–35% | 65%+ (Stay AI stretch) |
| Dunning time-to-recovery (median) | 5 days from failure | 14 days | 3 days |

## Dunning + recovery benchmarks (2024–25)

| Tool / Approach | Recovery rate | Cost | Best for |
|---|---|---|---|
| No dunning (single retry, then cancel) | 15–25% of failed | $0 platform | <$10k MRR |
| Recharge native dunning (4 retries over 14d) | 30–42% of failed | $0 (included with Recharge) | $10k–$500k MRR |
| Stay AI smart retries (AI-predicted timing) | 38–50% of failed | $49–$249/mo | $100k–$2M MRR |
| Stripe Billing Smart Retries | 45–58% of failed | 0.5% of recovered revenue | Cross-platform subs |
| Chargebee / Recurly dunning engine | 40–55% of failed | $249–$999/mo + % of recovered | $1M+ MRR multi-gateway |
| ProfitWell Retain (formerly ProfitWell) | 42–55% of failed | $599/mo | $500k+ MRR |
| Custom-built dunning (Recharge + Klaviyo + custom retry logic) | 35–48% of failed | Dev time | Engineering-heavy orgs |

**Median DTC subscription recovers ~32% of failed payments. Best in class recovers 50–62%.** The gap between median and best-in-class is 18–30 percentage points, which at $1M MRV (monthly recurring revenue) translates to **$15k–$25k/mo in recovered MRR** that the median brand is silently losing.

**Year-1 ROI at $1M subscription GMV:** Path A (Recharge native) costs $0 platform + ~6 hours operator time = $0 + $300 = **$300/mo cost vs $15k–$25k/mo recovered MRR = 50:1 to 83:1 net** ($180k–$300k/yr). Path B (Stay AI) costs $249/mo + ~10 hours operator time = $249 + $500 = **$749/mo cost vs $20k–$35k/mo recovered MRR = 26:1 to 46:1 net** ($240k–$420k/yr). Path C (Stripe Smart Retries) costs 0.5% of recovered revenue (~$100–$175/mo at $20k–$35k recovered) + ~10 hours operator time = **$675/mo cost vs $20k–$35k/mo recovered MRR = 28:1 to 50:1 net**.

## The build (14–28 days for a competent operator, in 5 phases)

### Phase 1 — Diagnose (Days 1–3)
**Goal:** Quantify the involuntary-churn problem before fixing it.

1. **Export 90-day failed-payment history from Recharge / Stripe / Chargebee.**
   - Recharge: Analytics → Failed Charges → export CSV
   - Stripe: Payments → Failed → export CSV (filter by `payment_intent.status = 'requires_payment_method'`)
   - Chargebee: Reports → Dunning → export CSV
   - Output: total failed payments, total failed $ amount, # of distinct subscribers, % of active subscriber base
3. **Calculate baseline involuntary-churn rate.**
   - Formula: `involuntary_churn_rate = cancelled_due_to_failed_payment / active_subscribers_90d_ago`
   - Median DTC: 5–8% (per ProfitWell 2024 involuntary-churn-benchmark)
   - Best in class: <4% (Hims / Athletic Greens)
   - Red flag: >10% (the canonical "we're losing 1 in 10 subscribers to expired cards without warning" gap)
5. **Identify the top-3 failure reasons.**
   - Recharge: Analytics → Failed Charges → Failure Reason breakdown
   - Stripe: Payments → Failed → `failure_code` breakdown
   - Canonical failure reasons (in order of frequency): card_expired (35–45% of failures), insufficient_funds (20–30%), 3DS/SCA-friction (10–15%), generic_decline (10–15%), fraudulent_transaction (3–8%), incorrect_card_details (3–5%)
7. **Calculate the recovery-rate gap.**
   - Formula: `recovery_rate = (recovered_payments_after_retry / total_failed_payments) * 100`
   - Median DTC: 32%
   - Best in class: 50–62%
   - Red flag: <25% (the canonical "we retry once and silently cancel" gap)
9. **Baseline snapshot for Move #14.2 verification.** Save the 90-day snapshot to `dashboard/scripts/baselines/dunning_baseline_<date>.json` with: total_failed, recovered_payments, recovery_rate, involuntary_churn_rate, top_failure_reasons.

### Phase 2 — Pre-charge card-expiration-warning (Days 4–7)
**Goal:** Catch the #1 failure reason (card_expired, 35–45% of failures) BEFORE the charge fails.

1. **Create the Klaviyo segment `card_expiring_30d`.**
   - Klaviyo → Segments → Create Segment
   - Definition: `Properties about someone → Subscription → next_charge_date` is within the next 30 days AND `Payment method → card_exp_month` is within the next 30 days
   - Verify: ~5–10% of active subscribers per typical month (per Recharge 2024 card-expiration-benchmark)
3. **Build the 3-email card-expiration-warning cadence in Klaviyo.**
   - **Email 1** (T-30d): "Your card on file expires in 30 days — update it to avoid subscription interruption"
     - Single CTA → branded hosted card-update page (Recharge Customer Portal / Stay AI Smart-Cart / Stripe Customer Portal)
     - Subject: "Your [BRAND] subscription card expires soon"
   - **Email 2** (T-14d): "Reminder: update your card in the next 2 weeks"
     - CTA → card-update page
     - Subject: "Don't lose your [BRAND] subscription"
   - **Email 3** (T-7d): "Last call: update your card this week"
     - CTA → card-update page
     - Subject: "Your [BRAND] subscription is at risk"
5. **Add SMS reminders via Postscript.**
   - **SMS 1** (T-14d): "[BRAND]: Your card expires in 2 weeks. Update it now → [SHORT-LINK]"
   - **SMS 2** (T-7d): "[BRAND]: Card expires in 1 week. Avoid subscription interruption → [SHORT-LINK]"
   - 160 chars max
   - Suppress if customer already updated their card (via Klaviyo segment `card_updated_recently`)
7. **Verify the pre-charge warning flow fires.**
   - Test card: create a test subscription with a card expiring in 30 days
   - Confirm Email 1 lands at T-30d, Email 2 at T-14d, Email 3 at T-7d
   - Click CTA → confirm it lands on the branded card-update page
   - Update the card → confirm the segment excludes them

### Phase 3 — Smart retry + dunning cadence (Days 8–14)
**Goal:** Recover the failures that DO happen, with smart-retry timing and a multi-touch email/SMS cadence.

1. **Configure the smart retry schedule.**
   - Recharge: Settings → Dunning → Retry Schedule → "4 retries over 14 days" (default) or customize
     - Canonical smart retry: 1d, 3d, 5d, 7d after failure (Recharge default)
     - Stretch: 1d, 3d, 5d, 7d, 10d, 14d after failure (Stay AI +20–35% recovery lift)
   - Stripe Billing: Retry schedule → enable Smart Retries (AI-predicted optimal day per `payment_method.card.brand`)
     - Per Stripe 2024 benchmark: Smart Retries lift recovery rate 20–40% vs naive retry
   - Chargebee: Dunning → Retry Schedule → customize
3. **Build the 4-email dunning cadence in Klaviyo (Recharge `failed_charge` / Stripe `invoice.payment_failed` webhook).**
   - **Email 1** (failure +0d): "Your [BRAND] subscription couldn't be processed"
     - Failure-reason-specific copy (card_expired → "Your card has expired, please update it"; insufficient_funds → "We couldn't process your payment; please check your bank account")
     - Single CTA → branded card-update page
     - Subject: "Action needed: update your [BRAND] payment"
   - **Email 2** (failure +3d): "Reminder: update your card to keep your subscription"
     - CTA → card-update page
     - Subject: "Your [BRAND] subscription is paused"
   - **Email 3** (failure +7d): "We miss you — update your card to resume"
     - CTA → card-update page
     - Subject: "Last chance: keep your [BRAND] subscription"
   - **Email 4** (failure +14d): "Final notice: your subscription will be cancelled in 7 days"
     - Urgency line + CTA → card-update page
     - Subject: "Final notice from [BRAND]"
5. **Add SMS reminders via Postscript.**
   - **SMS 1** (failure +1d): "[BRAND]: We couldn't process your subscription payment. Update your card → [SHORT-LINK]"
   - **SMS 2** (failure +7d): "[BRAND]: Subscription paused — update your card to resume → [SHORT-LINK]"
   - 160 chars max
   - Suppress if customer already updated card
7. **Suppress completed-update customers.**
   - Recharge webhook `subscription.card_updated` → Klaviyo event `Updated Payment Method`
   - Klaviyo flow filter: exclude anyone who fired `Updated Payment Method` in the last 30 days
   - This prevents dunning emails from continuing after the customer already fixed the issue
9. **Set the double-failure escalation rule.**
   - Default: after 4 retries over 14 days, cancel the subscription
   - Stretch: after 6 retries over 21 days, send to winback-after-cancellation flow (Pillar 6)
   - Recharge: Settings → Dunning → "Cancel after" → 14 days OR 21 days (stretch)
   - Document the choice in `dashboard/scripts/baselines/dunning_policy_<date>.json`

### Phase 4 — Voluntary vs involuntary churn segmentation (Days 15–21)
**Goal:** Distinguish involuntary churn (recoverable) from voluntary churn (winback-able) to avoid wasting dunning effort on intentional cancellations.

1. **Set up the Recharge cancel-flow survey (or Stay AI / Skio equivalent).**
   - Recharge: Customer Portal → Cancellation Settings → enable "Cancellation Reason Survey"
   - Canonical cancel reasons: too_expensive / not_using_enough / product_didnt_work / switched_to_competitor / financial_hardship / other
   - Survey is OPTIONAL but provides critical voluntary-vs-involuntary distinction
3. **Create the Klaviyo segments.**
   - Segment `involuntary_churn`: cancelled via failed-payment-dunning (Recharge `subscription.cancelled` reason = `payment_failed`)
   - Segment `voluntary_churn`: cancelled via customer-initiated cancel (Recharge `subscription.cancelled` reason = `customer_initiated`)
   - Segment `high_intent_voluntary_churn`: voluntary cancel + cancel-reason = `too_expensive` OR `financial_hardship` (these are recoverable via discount ladder)
   - Segment `low_intent_voluntary_churn`: voluntary cancel + cancel-reason = `not_using_enough` OR `product_didnt_work` OR `switched_to_competitor` (these are NOT recoverable via discount)
5. **Route the segments to different flows.**
   - `involuntary_churn` → winback-after-cancellation with strong CTA + 30-day subscription pause option (Pillar 6)
   - `high_intent_voluntary_churn` → winback-with-discount-ladder (10% off / 20% off / 30% off over 60 days)
   - `low_intent_voluntary_churn` → soft winback (1 email at +30d with new-product-launch update)
7. **Verify segmentation accuracy.**
   - Pull 30-day cancellation cohort
   - Confirm `involuntary_churn` segment captures ≥30% of cancellations (the canonical "1 in 3 cancels is involuntary" ProfitWell 2024 benchmark)
   - Confirm `voluntary_churn` segment captures ≤70% of cancellations

### Phase 5 — Winback-after-cancellation + verification (Days 22–28)
**Goal:** Recover the involuntary-churn cancellations and verify the full dunning system.

1. **Build the 3-email winback-after-cancellation flow in Klaviyo (Recharge `subscription.cancelled` reason = `payment_failed` webhook).**
   - **Email 1** (cancellation +3d): "Your [BRAND] subscription was cancelled due to a payment issue. Want to resume?"
     - Single CTA → branded card-update page (Resume Subscription flow)
     - Subject: "Resume your [BRAND] subscription in 1 click"
   - **Email 2** (cancellation +14d): "We saved your subscription preferences — reactivate any time"
     - CTA → card-update page
     - Subject: "Your [BRAND] subscription is ready when you are"
   - **Email 3** (cancellation +30d): "Final reminder: reactivate your subscription before [DATE]"
     - CTA → card-update page
     - Subject: "Last call: your [BRAND] subscription"
3. **Add the 30-day pause option.**
   - Recharge: Customer Portal → enable "Pause Subscription" with a 30-day max pause
   - Dunning emails include the "Pause instead of cancel" CTA as a recovery option
   - Per Recharge 2024 benchmark: pause-then-resume recovery rate is 45–60% vs cancelled-then-winback 25–35%
5. **Run the verification suite.**
   - See "Verification" section below for the 7-gate end-to-end verification
7. **Document the dunning-policy snapshot.**
   - Save the final policy to `dashboard/scripts/baselines/dunning_policy_<date>.json`
   - Include: retry_schedule, email_cadence, sms_cadence, suppression_rules, voluntary_vs_involuntary_segmentation, pause_option_enabled

## Common pitfalls (15 from real builds)

1. **Only retrying once before cancelling.** Most platforms' default is to retry once and silently cancel. This recovers only 15–25% of failed payments. **Fix: configure 4–6 retries over 14–21 days (Phase 3 Step 1). The retry schedule is the single highest-leverage lever in the entire dunning system — naive single-retry vs 4-retry smart-cadence is a 20–35 percentage-point recovery-rate lift.**
2. **Sending dunning emails to customers who already updated their card.** Without the suppression webhook (`subscription.card_updated` → exclude from dunning), customers receive 4 emails even after fixing the issue, generating complaint tickets and unsubscribe spikes. **Fix: wire the suppression webhook in Phase 3 Step 4 + verify with a test subscription.**
3. **No pre-charge card-expiration-warning flow.** Card_expired is the #1 failure reason (35–45% of failures). Without a pre-charge warning, the operator learns the card is expired only when the charge fails — by then, the customer is already in the dunning flow and 30–40% never recover. **Fix: ship the 3-email + 2-SMS card-expiration-warning cadence in Phase 2 (catches 60–80% of card_expired failures before they fail).**
4. **Treating all churn as the same.** Voluntary churn (customer-initiated cancel, ~65–70% of churn) requires a different winback than involuntary churn (failed-payment cancel, ~30–35% of churn). Sending discount-ladders to low-intent voluntary churn destroys margin; sending soft-winback to high-intent involuntary churn leaves money on the table. **Fix: set up the cancel-flow survey + voluntary-vs-involuntary segmentation in Phase 4 before building any winback flow.**
5. **Dunning email copy is generic ("Your payment failed").** Customers ignore generic copy. Failure-reason-specific copy ("Your card has expired" vs "We couldn't process your payment; please check your bank account") lifts card-update-CTR 25–45%. **Fix: use failure-reason-specific copy in Email 1 (Phase 3 Step 2). Map each Recharge failure reason to a specific subject line + opening sentence.**
6. **No SMS in the dunning cadence.** Email open rate is 20–40%; SMS open rate is 95%+. For high-AOV subscriptions (>$50/mo), SMS in the dunning cadence lifts card-update-rate 15–25%. **Fix: add 2 SMS in Phase 3 Step 4 (failure +1d / failure +7d). Suppress if customer already updated.**
7. **Cancel-after-retry window too short.** Defaulting to "cancel after 3 days" loses recoverable customers who would have updated on day 5 or day 7. **Fix: stretch the cancel-after window to 14 days (default) or 21 days (stretch). The extra 7–14 days recovers 10–18% of otherwise-lost subscriptions.**
8. **No hosted card-update page.** The card-update CTA must go to a BRANDED, TRUSTED hosted page (Recharge Customer Portal / Stay AI Smart-Cart / Stripe Customer Portal) — NOT a generic Stripe checkout link. Customers abandon generic links at 50%+ rates. **Fix: use the Recharge Customer Portal (free with Recharge) or Stay AI Smart-Cart ($49/mo) as the card-update destination.**
9. **Cancelling the subscription after retries without winback.** Cancelled-due-to-failed-payment customers have a 25–35% winback rate if contacted within 30 days. Cancelling without winback loses these. **Fix: build the 3-email winback-after-cancellation flow in Phase 5 Step 1.**
10. **No 30-day pause option.** Customers who can't afford a subscription right now would prefer to pause vs cancel. Pause-then-resume recovery is 45–60% vs cancelled-then-winback 25–35%. **Fix: enable the 30-day pause option in Recharge Customer Portal (Phase 5 Step 2).**
11. **Inconsistent retry timing across failure reasons.** A single retry schedule (e.g., 1d / 3d / 5d / 7d) applies to all failure reasons. But insufficient_funds retries should be timed around paydays (1st and 15th), while card_expired retries should fire after the customer has had time to receive + act on the expiration email. **Fix: configure failure-reason-specific retry schedules in Recharge / Stripe / Chargebee (Phase 3 Step 1). For insufficient_funds, retry on the 1st and 15th; for card_expired, retry 3d / 7d / 14d after the warning email.**
12. **Not tracking the recovery-rate metric.** Operators who don't track recovery rate per week can't tell if their dunning system is improving. **Fix: add `recovery_rate` to the weekly MRR-dashboard (Recharge Analytics / ProfitWell / Baremetrics). Track the weekly recovery-rate trend.**
13. **Using the dunning system as the cancellation flow.** Recharge's native dunning can be configured to either retry-and-keep or retry-and-cancel. Defaulting to "retry-and-cancel" loses 15–25% of customers who would have updated on the 2nd or 3rd retry. **Fix: configure "retry-and-keep-active" for the first 7 days (subscription stays active through retries), then transition to "retry-and-pause" for days 7–14, then transition to "retry-and-cancel" after day 14.**
14. **No fallback for 3DS / SCA friction (EU + UK customers).** 10–15% of failures are due to 3D-Secure / Strong Customer Authentication friction. The customer may have the funds but couldn't complete the 3DS challenge. **Fix: enable 3DS exemptions for low-risk transactions (Recharge / Stripe both support this) + send a specific dunning email variant for 3DS failures ("Your bank requires additional verification — please complete the 3D Secure step").**
15. **Cancelling too aggressively on retry 4 without testing.** Some platforms' default retry schedule is "4 retries over 7 days" — this is too aggressive; recoverable customers haven't had time to act. **Fix: stretch to 4 retries over 14 days (canonical) or 6 retries over 21 days (stretch). Document the choice in the dunning policy snapshot.**

## Verification (this skill is "shipped" when...)

This skill is shipped when ALL 7 verification gates pass:

### Gate A — Pre-charge card-expiration-warning flow live
- [ ] Klaviyo segment `card_expiring_30d` is created and has ≥5% of active subscribers per typical month
- [ ] 3-email cadence (T-30d / T-14d / T-7d) is live in Klaviyo with status = published
- [ ] 2-SMS cadence (T-14d / T-7d) is live in Postscript with status = published
- [ ] Test card expiring in 30 days triggers all 3 emails + 2 SMS in correct cadence
- [ ] CTA links resolve to the branded hosted card-update page

### Gate B — Smart retry schedule configured
- [ ] Recharge / Stripe / Chargebee retry schedule is set to 4 retries over 14 days (default) OR 6 retries over 21 days (stretch)
- [ ] Failure-reason-specific retry schedule is configured (insufficient_funds retries align with paydays; card_expired retries align with warning-email cadence)
- [ ] Cancel-after window is set to 14 days (default) OR 21 days (stretch)
- [ ] Retry schedule is documented in `dashboard/scripts/baselines/dunning_policy_<date>.json`

### Gate C — Dunning email cadence live
- [ ] 4-email dunning cadence (failure +0d / +3d / +7d / +14d) is live in Klaviyo with status = published
- [ ] Failure-reason-specific copy is used in Email 1 (card_expired / insufficient_funds / 3DS-friction / generic_decline)
- [ ] Card-update CTA links resolve to the branded hosted card-update page
- [ ] Suppression filter excludes customers who fired `Updated Payment Method` in last 30 days
- [ ] Test failed payment triggers all 4 emails in correct cadence

### Gate D — Dunning SMS cadence live
- [ ] 2-SMS dunning cadence (failure +1d / +7d) is live in Postscript with status = published
- [ ] SMS suppression filter excludes customers who updated card or unsubscribed from SMS
- [ ] Test failed payment triggers both SMS in correct cadence

### Gate E — Voluntary vs involuntary churn segmentation
- [ ] Recharge cancel-flow survey is enabled (or Stay AI / Skio equivalent)
- [ ] Klaviyo segment `involuntary_churn` (cancelled via payment_failed) captures ≥30% of cancellations
- [ ] Klaviyo segment `voluntary_churn` (customer-initiated) captures ≤70% of cancellations
- [ ] Klaviyo segment `high_intent_voluntary_churn` (too_expensive / financial_hardship) is created
- [ ] Segment sizes verified against 30-day cancellation cohort

### Gate F — Winback-after-cancellation flow live
- [ ] 3-email winback-after-cancellation cadence (cancel +3d / +14d / +30d) is live in Klaviyo
- [ ] Trigger: Recharge `subscription.cancelled` reason = `payment_failed`
- [ ] CTA links resolve to the branded resume-subscription page
- [ ] 30-day pause option is enabled in Recharge Customer Portal
- [ ] Test cancellation triggers all 3 emails in correct cadence

### Gate G — Recovery-rate metric tracked weekly
- [ ] Recovery-rate metric is added to the weekly MRR-dashboard (Recharge Analytics / ProfitWell / Baremetrics)
- [ ] Baseline snapshot from Phase 1 is saved to `dashboard/scripts/baselines/dunning_baseline_<date>.json`
- [ ] 30-day post-launch snapshot is captured and compared to baseline:
  - Recovery rate lifted from baseline to ≥45% (Path A target) / ≥50% (Path B target) / ≥55% (Path C target)
  - Involuntary churn rate dropped from baseline by ≥1 percentage point
  - Pre-charge-warning flow captured ≥60% of card_expired failures before they failed
- [ ] No regression in voluntary-churn rate (within ±5% of pre-dunning-system baseline)

## How to extend this skill

1. **Move #14.2.1 — AI-predicted-failure-prevention (Stay AI / Stripe Smart Retries deep integration)**: extend the dunning system with AI-predicted card-failure-prevention. Stay AI scores each subscription for failure-risk 7 days BEFORE the charge; high-risk subscriptions trigger a proactive "please verify your card" email. Lifts pre-charge-recovery-rate 15–25%. Default at $1M+ MRV.
2. **Move #14.2.2 — Multi-currency + cross-border dunning (EU + UK + AU + CA)**: extend the dunning system for international subscriptions. 3DS / SCA exemptions + Europay / BACS / SEPA failure-reason-specific copy + multi-currency retry scheduling. Required for any brand with ≥10% non-US subscribers.
3. **Move #14.2.3 — Pause-as-a-recovery-strategy (Stay AI Pause + Recharge Pause variants)**: extend the 30-day pause option into a multi-tier pause system (30d / 60d / 90d) with a "pause-then-resume" automated nurture. Lifts pause-then-resume recovery from 45–60% to 65–75% per Stay AI benchmarks.
4. **Move #14.2.4 — Winback-discount-ladder for high-intent voluntary churn**: extend the winback-after-cancellation flow with a 3-step discount ladder (10% off / 20% off / 30% off over 60 days) targeted ONLY at the `high_intent_voluntary_churn` segment. Recovers 15–25% of high-intent voluntary cancellations without margin-destroying blanket discounts.

## Cross-references

- **Move #1 (cart-abandon-recovery, `retention/abandoned-cart-recovery`)** — the original "recover lost revenue" template. Move #14.2's dunning email copy is patterned after Move #1's "failure-reason-specific copy" framework.
- **Move #4 (welcome-series, `retention/welcome-series`)** — the cross-channel reminder substrate that Move #14.2's pre-charge-warning cadence depends on for Klaviyo segment + flow infrastructure.
- **Move #5 (klaviyo-postscript-migration, `retention/klaviyo-postscript-migration`)** — the cross-channel stack that Move #14.2's dunning-SMS cadence depends on. Ship Move #5 BEFORE Move #14.2.
- **Move #8 (loyalty-program, `retention/loyalty-program`)** — the customer-data substrate. Move #14.2's `card_updated` webhook and voluntary-vs-involuntary segmentation both feed back into Move #8's customer-LTV-cohort.
- **Move #11 (subscription-replenishment, `retention/subscription-replenishment`)** — Move #11 ships the subscription engine. Move #14.2 is the **involuntary-churn-recovery layer** for Move #11. Ship Move #11 BEFORE Move #14.2; without Move #11's recurring-billing engine, there's nothing to dun for.
- **Move #14.1 (lifecycle-flow-library, `retention/lifecycle-flow-library`)** — the 20-flow email/SMS library across all customer-lifecycle stages. Move #14.2's pre-charge-warning + dunning cadence are Tier-2 flows from the lifecycle-library's 4-tier framework.
- **Move #20.2 (nps-voc-closed-loop-automation, `cx/nps-voc-closed-loop-automation`)** — the post-purchase voice-of-customer layer. Move #14.2's voluntary-vs-involuntary-churn segmentation overlaps with Move #20.2's NPS-detractor segmentation; both feed into the same winback flow.

## Sources

- [Recharge 2024 Subscription Cancellation Benchmark](https://rechargepayments.com) — 38–50% dunning recovery rate, $1.2T subscription commerce market sizing
- [ProfitWell 2024 Involuntary Churn Benchmark](https://www.profitwell.com) — 5–8% median involuntary churn rate, 9–15% subscription transaction failure rate on first charge, 38–62% recovery rate range
- [Stripe Billing 2024 Smart Retries Research](https://stripe.com/docs/billing/subscriptions/retries) — 20–40% recovery-rate lift vs naive retry, AI-predicted optimal retry timing
- [Recurly 2024 Dunning Best Practices](https://recurly.com) — 40–55% recovery rate with smart dunning, multi-retry-schedule-by-failure-reason guidance
- [Chargebee 2024 Dunning Engine Guide](https://www.chargebee.com) — 40–55% recovery rate, retry-schedule customization, dunning-email-template-library
- [Stay AI 2024 Smart Retries Performance Report](https://www.stay.ai) — 38–50% recovery rate, +20–35% recovery lift vs naive retry, AI-predicted card-update-CTR
- [Smile.io 2024 Loyalty + Subscription Benchmarks](https://smile.io) — loyalty-tier-cohort-LTV benchmarks, subscription-vs-one-time-purchase LTV gap
- [Klaviyo 2024 Lifecycle Marketing Benchmark Report](https://www.klaviyo.com) — dunning-email-cadence open-rate benchmarks, suppression-segment best practices
- [Postscript 2024 SMS Cadence Research](https://www.postscript.io) — 95%+ SMS open rate, SMS-in-dunning cadence lift benchmarks
- [Baymard Institute 2024 Checkout + Recurring Payment Research](https://baymard.com) — 9–15% recurring-payment failure rate, 3DS / SCA friction benchmarks
- [Statista 2024 Recurring Payments Failure Statistics](https://www.statista.com) — global recurring-payment-failure-rate benchmarks by region
- [GoCardless 2024 Failed Payment Research](https://gocardless.com) — direct-debit failure rate vs card failure rate, failure-reason breakdown
- [Smart Insights 2024 Subscription Dunning Benchmarks](https://www.smartinsights.com) — dunning-cadence best practices, recovery-rate benchmarks by GMV tier
- [G2 2024 Dunning Software Comparison](https://www.g2.com) — feature-by-feature comparison of Recharge-native vs Stay AI vs Stripe Billing vs Chargebee vs Recurly
- [Skio 2024 Subscription Commerce Report](https://skio.com) — subscription-vs-one-time LTV gap, pause-then-resume benchmarks
- [Loop Subscriptions 2024 Dunning Best Practices](https://www.loopwork.co/loop-subscriptions) — Shopify-native subscription-dunning-engine guide
- [Bold Commerce 2024 Subscription Recovery Benchmarks](https://boldcommerce.com) — subscription-recovery-rate benchmarks by industry vertical
- [Okendo Subscriptions 2024 Dunning + Loyalty Integration](https://okendo.io) — dunning-cadence + loyalty-tier-up interaction
- [Subbly 2024 Subscription Dunning Guide](https://subbly.com) — small-DTC subscription-dunning-engine best practices
- [Smartrr 2024 Subscription Dunning Research](https://www.smartrr.com) — Shopify-native subscription-dunning-engine benchmarks
- [Paddle 2024 Subscription Billing Benchmark Report](https://paddle.com) — merchant-of-record subscription dunning benchmarks
- [Maxio 2024 Subscription Dunning + Revenue Recognition](https://maxio.com) — dunning-engine + revenue-recognition interaction
- [Zuora 2024 Subscription Dunning Benchmark](https://www.zuora.com) — enterprise subscription-dunning-engine benchmarks
- [Customer Gauge 2024 NPS + Churn Correlation Benchmark](https://customergauge.com) — voluntary-vs-involuntary-churn NPS correlation
- [DoubleCheck Research 2024 Recurring Payments Failure Study](https://doublecheckresearch.com) — card-failure-reason breakdown by region
- [HubSpot 2024 Subscription Marketing Benchmarks](https://www.hubspot.com) — dunning-cadence + customer-segmentation best practices
- [Baremetrics 2024 Subscription Metrics Benchmark Report](https://baremetrics.com) — MRR / churn-rate benchmarks for DTC subscriptions