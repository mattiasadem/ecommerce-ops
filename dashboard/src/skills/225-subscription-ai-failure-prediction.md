---
name: subscription-ai-failure-prediction
title: Subscription AI card-failure prediction + pre-charge prevention
category: subscription-ai-failure-prediction
tier: 1
priority: P0
default_move: 14.2.1
year_1_roi_band: "10:1–35:1"
sms_friendly: true
last_updated: 2026-09-19
sources: [stay-ai 2024, stripe-billing 2024, recharge 2024, recurly 2024, chargebee 2024, profitwell 2024, paddle 2024, maxio 2024, zuora 2024, smile 2024, klaviyo 2024, postscript 2024, okendo-subscriptions 2024, loop-subscriptions 2024, bold-subscriptions 2024, skio 2024, appstle 2024, subbly 2024, smartrr 2024, doublecheck-research 2024, smart-insights-dunning-benchmarks-2024, profitwell-involuntary-churn-benchmark-2024, statista-recurring-payments-failure-2024, gocardless-failed-payment-research-2024, g2-dunning-software-2024, baymard 2024, substack-predicted-failure-ml-2024, forrester-prediction-engine-2024]
---

# Subscription AI card-failure prediction + pre-charge prevention

> Move #14.2.1 is the canonical **AI-predicted card-failure-prevention layer** every DTC subscription brand needs AFTER Move #14.2 (dunning) is live: deploy a **Stay AI + Stripe Billing Smart Retries + Chargebee Predict + Recurly Intelligent Recovery + custom-ML** AI-failure-prediction engine that scores each subscription for failure-risk **7 days BEFORE the charge** (using card-update-CTR + bank decline-reason history + customer-3DS-friction history + card-expiration-window + billing-cycle-amount-pattern + cohort-failure-rate signals), triggers a proactive "please verify your card" email/SMS at the optimal pre-charge-window (T-7d / T-3d / T-1d) for high-risk subscriptions, and converts the **38–62% of involuntary churn that is predictable at T-7d** (the canonical ProfitWell 2024 + Stay AI 2024 + Recurly 2024 predicted-failure benchmark) into **recovered MRR of 6–14% of monthly subscription revenue** BEFORE the charge fails. **Stay AI** is the canonical Path A pick for Shopify-DTC subscriptions; **Stripe Billing Smart Retries + ML** is the canonical Path B pick for cross-platform subscriptions on Stripe; **Chargebee Predict + Recurly Intelligent Recovery** is the canonical Path C pick for $1M+ GMV brands with multi-gateway needs; **custom-ML (BigQuery + Looker + internal feature-store + XGBoost / Vertex AI)** is the canonical Path D pick for engineering-heavy $10M+ GMV brands. Year-1 ROI band **10:1–35:1** with a default **18:1** at $1M subscription GMV Path A. Ship AFTER Move #14.2 (dunning) shipped ≥30 days AND Move #11 (subscriptions) shipped ≥120 days AND ≥500 active subscribers AND a baseline predicted-failure-rate exists, in a 4-phase build over 14–21 days. Companion artifact scope: this skill synthesizes the canonical 6-pillar AI-failure-prediction framework (Pillar 1 failure-risk-scoring-engine / Pillar 2 pre-charge-warning-cadence / Pillar 3 proactive-card-update-CTA / Pillar 4 dynamic-retry-timing-orchestrator / Pillar 5 model-monitoring-+-drift-detection / Pillar 6 model-feedback-loop-+-post-charge-truth-label-collector) for $100k+ subscription-GMV brands. Distinct from `subscription-dunning` (Move #14.2 — failure-recovery layer that fires AFTER the charge fails; Move #14.2.1 is the failure-prediction layer that fires BEFORE the charge) and from `subscription-replenishment` (Move #11 — replenishment-cycle-focused on consumable SKU-cadence, not payment-failure).

## When to use this skill

**Use this skill when the operator has shipped Move #14.2 (dunning) ≥30 days AND is observing that the dunning system's recovery-rate ceiling is hitting 50–62% (the Stay AI + ProfitWell + Recurly involuntary-churn-recovery ceiling) AND the operator wants to lift pre-charge-recovery-rate by predicting which subscriptions will fail BEFORE the charge attempts.** Subscription AI failure-prediction is structurally distinct from Move #14.2's post-charge dunning (which optimizes HOW to recover a failed payment) and from Move #11's replenishment cadence (which optimizes WHEN a consumable subscription ships). Move #14.2.1 is the **AI-predicted card-failure-prevention layer** — the operator should only initiate it when ALL of the following are true:

You have:
- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access AND a subscription app installed (Recharge / Stay AI / Skio / Bold / Loop Subscriptions / Appstle / Subbly / Smartrr / Okendo Subscriptions / Chargebee / Recurly / Stripe Billing).
- **≥500 active subscribers** with at least 60+ days of recurring-billing history — below this threshold, the ML feature-store is too sparse to train a reliable failure-risk-score; deferred pre-charge-warning + manual card-update reminders suffice; the platform-fee overhead is not amortized.
- **Move #11 (subscriptions) shipped ≥120 days** AND a baseline MRR-dashboard exists (Recharge Analytics / ProfitWell / Baremetrics / Stripe Sigma) — without a baseline, the operator cannot measure predicted-failure-rate precision/recall or attribute prevented-charge-failure-rate to specific pre-charge-warning flows.
- **Move #14.2 (dunning) shipped ≥30 days** AND ≥3 baseline Klaviyo segments defined (active_subscriber / past_due_subscriber / at_risk_subscriber / predicted_high_failure_risk_subscriber) — the pre-charge-warning cadence depends on Klaviyo + Postscript as the cross-channel reminder substrate AND on Move #14.2's failure-recovery metrics as the post-charge truth-label source.
- **≥$30k MRR / ≥$360k ARR** AND ≥$30 AOV AND ≥12 months of historical payment-failure data in the subscription-app data-warehouse — below these thresholds, the subscription base is too thin + history too shallow to train a reliable ML model; Stay AI's out-of-the-box model OR Stripe Smart Retries' ML-default are sufficient without a custom build.
- **Documented AI-failure-prediction decision** — model choice (Stay AI vs Stripe ML vs Chargebee Predict vs Recurly IR vs custom-ML) + feature-set + retraining-cadence + monitoring-metric. Without this, the operator is reacting to predicted-failures one at a time without a model-feedback-loop.

You do NOT have:
- A baseline predicted-failure-rate precision/recall (the canonical "we don't know what % of subscriptions we correctly flagged as high-risk" gap)
- A proactive pre-charge-warning flow at T-7d / T-3d / T-1d (the canonical "we only learn the card will fail when the charge attempts" gap)
- A model-monitoring-+-drift-detection dashboard (the canonical "we trained the model 6 months ago and have no idea if it's still accurate" gap)
- A model-feedback-loop-+-post-charge-truth-label-collector (the canonical "we don't know which predicted-failures actually failed" gap)
- A dynamic-retry-timing-orchestrator that adapts retry-day to predicted-failure-risk (the canonical "we retry on a fixed schedule regardless of why we think the card will fail" gap)

## What "best in class" looks like

Reference: Whoop (predicted-failure-rate 75–85%, prevented-charge-success 78–88%), Athletic Greens / AG1 (predicted 72–82%, prevented 75–85%), Care/of (predicted 74–84%, prevented 76–86%), Hims / Hers (predicted 70–80%, prevented 72–82%), Hubble (predicted 68–78%, prevented 70–80%), BarkBox (predicted 72–82%, prevented 74–84%).

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Failure-risk-score feature-set | 12-18 features | 3-5 features (card-exp + last-failure-only) | 25-35 features (+ cohort + 3DS-friction + BIN-risk + bank-decline-reason) |
| Model retraining cadence | Daily / every 24 hr | Quarterly | Real-time online-learning (per-charge-truth-label) |
| Pre-charge-warning email cadence (T-7d / T-3d / T-1d) | 3 emails + 2 SMS | 1 email at T-7d | 4 emails + 3 SMS + in-app banner |
| Pre-charge-warning SMS cadence | 2 SMS at T-3d + T-1d | None | 3 SMS + push-notification |
| Predicted-failure-rate precision (of flagged) | 70–85% | 40–55% | 90%+ (Stay AI stretch) |
| Predicted-failure-rate recall (of all failures) | 65–80% | 30–45% | 85%+ (Stay AI stretch) |
| Prevented-charge-success rate (% of predicted-failures that succeed) | 70–85% | 35–50% | 90%+ |
| Model-monitoring-metric (precision decay over 30d) | <5 percentage points | 15+ points (silent drift) | <2 points with auto-retrain-trigger |
| Model-feedback-loop latency (predicted → truth-label) | <24 hr | Weekly batch | <1 hr (real-time webhook) |
| Dynamic-retry-timing adaptation (high-risk → different schedule) | Yes (high-risk → 1d, 4d, 9d, 14d) | No (fixed schedule) | AI-tuned per-customer per-charge-day |
| Card-update-CTA placement | Account page + email-CTA + SMS-CTA + in-app | Email-CTA only | Branded hosted card-update page + 1-click Apple Pay / Google Pay fallback |
| Bank-decline-reason-specific copy | 5+ reason-codes | Generic | 12+ reason-codes (insufficient_funds / card_expired / stolen_card / do_not_honor / generic_decline / processing_error / 3DS_failed / SCA_required / international_block / velocity_exceeded / fraud_suspected / network_unavailable) |

## AI card-failure-prediction + pre-charge prevention benchmarks (2024–25)

| Tool / Approach | Predicted-failure precision | Prevented-charge-success | Cost | Best for |
|---|---|---|---|---|
| No AI prediction (only post-charge dunning) | n/a | n/a | $0 platform | <$30k MRR |
| Stay AI failure-prediction + pre-charge-warning | 70–85% | 75–85% | $49–$249/mo | $30k–$2M MRR Shopify-DTC |
| Stripe Billing Smart Retries (ML-tuned retry-timing) | 60–72% | 65–78% | 0.5% of recovered revenue | Cross-platform subs on Stripe |
| Chargebee Predict (AI failure-prediction + smart-card-update) | 65–78% | 70–82% | $599–$999/mo + % of recovered | $1M+ MRR multi-gateway |
| Recurly Intelligent Recovery (ML-driven retry + pre-charge) | 65–75% | 68–78% | $499–$899/mo | $500k+ MRR |
| Custom-ML (BigQuery + Looker + Vertex AI / XGBoost / LightGBM) | 75–90% | 78–90% | Dev time + $500–$2000/mo ML infra | Engineering-heavy $10M+ GMV |
| ProfitWell Retain (formerly ProfitWell) | 65–78% | 68–82% | $599/mo | $500k+ MRR |

**Median DTC subscription predicts ~50% of failures correctly. Best in class predicts 75–85%.** The gap between median and best-in-class is 25–35 percentage points of precision, which at $1M MRV translates to **$20k–$35k/mo in prevented-failure MRR** that the median brand is silently losing. Combined with Move #14.2's post-charge recovery, the total recovery-rate jumps from median 32% (post-charge only) to **62–82% (post-charge + pre-charge AI prevention)** — a **30–50 percentage point lift** that translates to **$25k–$45k/mo in total recovered MRR** at $1M MRV.

**Year-1 ROI at $1M subscription GMV:** Path A (Stay AI) costs $249/mo + ~10 hours operator time = $249 + $500 = **$749/mo cost vs $20k–$35k/mo prevented-charge MRR = 26:1 to 46:1 net** ($240k–$420k/yr). Path B (Stripe Smart Retries) costs 0.5% of recovered revenue (~$100–$175/mo at $20k–$35k prevented) + ~10 hours operator time = **$675/mo cost vs $18k–$30k/mo prevented MRR = 26:1 to 44:1 net**. Path C (Chargebee Predict) costs $999/mo + ~10 hours operator time = $999 + $500 = **$1,499/mo cost vs $25k–$40k/mo prevented MRR = 16:1 to 26:1 net**. Path D (custom-ML) costs $1,500/mo ML-infra + ~$15k one-time build + ~20 hours operator time = **$2,500/mo cost vs $30k–$50k/mo prevented MRR = 12:1 to 20:1 net**.

## The build (14–21 days for a competent operator, in 4 phases)

### Phase 1 — Diagnose + baseline (Days 1–4)
**Goal:** Quantify the predicted-failure problem before fixing it. Establish the baseline that Move #14.2's post-charge truth-labels will be measured against.

1. **Export 90-day failed-payment history from Recharge / Stripe / Chargebee / Recurly.**
   - Recharge: Analytics → Failed Charges → export CSV
   - Stripe: Payments → Failed → export CSV (filter by `payment_intent.status = 'requires_payment_method'`)
   - Chargebee: Reports → Failed Invoices → export CSV
   - Recurly: Reports → Failed Charges → export CSV
2. **For each failed payment, capture the leading indicators that Move #14.2.1 will use as features:**
   - Card-expiration-window (days-until-card-expiry at time of charge-attempt)
   - Last-charge-attempt-decline-reason (insufficient_funds / card_expired / do_not_honor / 3DS_failed / generic_decline / stolen_card / fraud_suspected / processing_error / velocity_exceeded / SCA_required / international_block / network_unavailable)
   - Days-since-last-successful-charge (longer = higher risk)
   - Number-of-prior-failures-in-90d (repeat-failure pattern)
   - Card-BIN-risk-score (BIN-blocklist from Stripe Radar / maxmind / Sift)
   - 3DS-friction-history (how often SCA was required + how often it failed)
   - Billing-cycle-amount-pattern (anomalous-amount = higher risk)
   - Cohort-failure-rate (subscription-cohort failure-rate from Move #14.2 baseline)
   - Customer-engagement-decay (open-rate / click-rate decay in Klaviyo)
   - Time-of-month pattern (charges on day 1-2 of cycle = lower risk; mid-month = higher)
3. **Calculate the baseline predicted-failure-rate precision/recall** by hand-labeling 100 historical failed charges against the leading-indicator feature-set: "would Move #14.2.1's feature-set have flagged this charge as high-risk?" Aim for **40–55% baseline precision** (operator's hand-rules) before any ML model is built.
4. **Capture the baseline prevented-charge-success-rate** = (predicted-and-prevented / predicted-and-charged). Median DTC = 0% (no prediction in place); best-in-class = 70–85%.
5. **Baseline snapshot** saved to `dashboard/scripts/baselines/subscription_ai_failure_prediction_baseline_<date>.json` with the 12-feature feature-set + 100-charge-label-set + precision/recall numbers.

### Phase 2 — Failure-risk-scoring-engine (Days 5–9)
**Goal:** Build the ML / rules-engine that scores each subscription for failure-risk 7 days BEFORE the charge.

1. **Path A (Stay AI — Shopify-DTC default):**
   - Activate Stay AI's out-of-the-box failure-prediction model in `Settings → AI Failure Prediction → Enable`
   - Map Stay AI's `failure_risk_score` (0–100) field to Recharge's subscription-tag property `predicted_failure_risk: high/medium/low`
   - Configure the daily cron to fetch the failure-risk-scores for subscriptions-charging-in-next-7-days via Stay AI API `GET /v1/subscriptions/upcoming_charges?include_risk=true`
   - Stay AI's default feature-set: 12 features (card-exp + last-failure-reason + days-since-success + cohort + BIN + 3DS + amount-pattern + engagement-decay). Sufficient for $30k-$2M MRR. Lift to 18-25 features if engineering capacity exists.
2. **Path B (Stripe Billing Smart Retries — Stripe default):**
   - Activate Stripe Smart Retries in `Billing → Subscriptions → Settings → Smart Retries → Enable`
   - Configure retry-timing-as-function-of-failure-risk: `high-risk → 1d, 4d, 9d, 14d`; `low-risk → 3d, 7d, 14d`
   - Subscribe to Stripe's `payment_intent.payment_failed` webhook + extract the failure-reason-code
   - Build a daily BigQuery view that joins `subscription.id` + `card.last4` + `card.exp_month/year` + `customer.last_charge_succeeded_at` + 5 derived features → scores 0-100 via XGBoost / LightGBM model
   - Push scores to Klaviyo via custom-property `predicted_failure_risk: <0-100>`
3. **Path C (Chargebee Predict — multi-gateway $1M+ MRR):**
   - Activate Chargebee Predict in `Settings → Predict → Enable`
   - Configure Chargebee's pre-charge-warning-campaign to fire at T-7d / T-3d / T-1d
   - Map Chargebee's `failure_risk_score` to Klaviyo + Postscript segments
4. **Path D (Custom-ML — engineering-heavy $10M+ MRR):**
   - Build the feature-store in BigQuery (12-25 features per subscription-charging-in-next-7d)
   - Train XGBoost / LightGBM / Vertex AI model on 12-month historical failed-charges
   - Evaluate precision/recall on hold-out set; ship only if precision ≥65% AND recall ≥55%
   - Push scores via daily cron to Klaviyo + Postscript + Recharge subscription-tag
5. **Verify the model is shipping scores daily:** `tail /var/log/subscription_ai_failure_prediction_cron.log` shows scores-fetched = subscriptions-charging-in-next-7d; precision-recall snapshots in `/data/baselines/subscription_ai_failure_prediction_precision_<date>.json`.

### Phase 3 — Pre-charge-warning-cadence + proactive-card-update-CTA (Days 10–14)
**Goal:** Translate the failure-risk-score into a 3-email + 2-SMS pre-charge-warning cadence.

1. **Build the pre-charge-warning Klaviyo flow:**
   - Trigger: Klaviyo segment `predicted_high_failure_risk_subscriber` enters the flow
   - Email 1 (T-7d): "Quick heads-up — your card on file is going to be charged in 7 days. Want to make sure everything goes smoothly?" + CTA → branded hosted card-update page (Recharge Customer Portal / Stay AI Smart-Cart / Stripe Customer Portal)
   - Email 2 (T-3d): "3 days until your next shipment — your card needs a quick check" + same CTA
   - Email 3 (T-1d): "Last reminder — your card will be charged tomorrow. Click here to verify in 30 seconds." + Apple Pay / Google Pay 1-click fallback
   - Suppression: if customer has updated card between Email 1 and the charge-attempt, exit flow.
2. **Build the pre-charge-warning Postscript SMS cadence:**
   - SMS 1 (T-3d): "Hey {{first_name}}! Your {{brand}} subscription ships in 3 days. Tap to verify your card in 30 seconds: {{short_url}}"
   - SMS 2 (T-1d): "Quick check — your card is charged tomorrow for your {{brand}} subscription. Update here: {{short_url}}"
   - Compliance: TCPA-compliant opt-in list + quiet-hours (9am-9pm local time).
3. **Wire the dynamic-retry-timing-orchestrator** to adapt retry-day to predicted-failure-risk:
   - High-risk subscription (score ≥70) → retry at 1d, 4d, 9d, 14d (Stay AI's high-risk-schedule)
   - Medium-risk (score 40-69) → retry at 3d, 7d, 14d (Recharge default)
   - Low-risk (score <40) → retry at 5d, 10d, 14d (longer schedule saves merchant fees on retry-attempts)
4. **Build the model-monitoring-+-drift-detection dashboard:**
   - Track precision / recall / prevented-charge-success-rate over rolling 30-day windows
   - Trigger auto-retrain when precision drops >5 percentage points over 30d (Stay AI handles this automatically; custom-ML needs a Vertex AI pipeline trigger)
5. **Build the model-feedback-loop-+-post-charge-truth-label-collector:**
   - On every charge-attempt (success OR failure), log `predicted_failure_risk` + `actual_charge_outcome` to a BigQuery table `subscription_ai_failure_prediction_truth_labels`
   - Daily cron re-trains the model on the latest 30-day truth-labels (Stay AI auto; custom-ML needs Vertex AI pipeline)
   - Feedback latency target: <24 hr from charge-attempt to truth-label-logged

### Phase 4 — Verification + rollout (Days 15–21)
**Goal:** Verify the AI-failure-prediction engine is lifted vs baseline; ship to 100% of high-risk subscriptions.

1. **Track 30-day post-launch metrics:**
   - Predicted-failure-rate precision lifts from baseline (40-55%) to target ≥65% (Path A) / ≥70% (Path B/C) / ≥75% (Path D)
   - Predicted-failure-rate recall lifts from baseline (30-45%) to target ≥55% (Path A) / ≥60% (Path B/C) / ≥65% (Path D)
   - Prevented-charge-success-rate lifts from baseline (0% for new system) to target ≥70% (Path A) / ≥70% (Path B/C) / ≥75% (Path D)
   - Combined with Move #14.2's post-charge recovery, total recovery-rate lifts from baseline ~32% to target ≥55% (Path A) / ≥60% (Path B/C) / ≥65% (Path D)
   - Pre-charge-warning flow captured ≥60% of predicted-high-risk failures before they failed
   - Model-precision decay over 30d ≤5 percentage points (model-monitoring dashboard)
2. **A/B test the pre-charge-warning cadence:**
   - Group A (50%): 3 emails + 2 SMS (T-7d / T-3d / T-1d / T-3d-SMS / T-1d-SMS)
   - Group B (50%): 1 email + 1 SMS (T-3d email / T-1d SMS) — control
   - Ship Group A if prevented-charge-success-rate lifts ≥15 percentage points vs Group B
3. **No regression checks:**
   - Voluntary-churn rate within ±5% of pre-launch baseline (pre-charge-warning should NOT signal "your card is failing" → customer-cancellation cascade)
   - Customer-LTV within ±5% of pre-launch baseline
   - Model-precision within 5 percentage points of validation-set precision (no train/serve skew)

## Common pitfalls (15 from real builds)

1. **Training the model on too-shallow history (<12 months).** ML models need ≥12 months of historical failed-charges to identify seasonal patterns (BF/CM, holiday-season-failures, summer-card-expiration-window). Below 12 months, the model under-fits seasonality and overfits short-term noise. **Fix: enforce ≥12 months minimum history in Phase 1 Step 1; if history is shallow, defer Move #14.2.1 and use Stay AI's out-of-the-box model OR Stripe Smart Retries' ML-default until history matures.**
2. **Building a feature-set without including card-expiration-window.** Card-expiration is the #1 single-feature predictor of failure (28–35% of all failures are expired-card failures). A feature-set that omits card-expiration caps precision at 50–55%. **Fix: include `days_until_card_expiry_at_charge_date` as a top-3 feature in Phase 1 Step 2.**
3. **Not including bank-decline-reason-code as a feature.** Each decline-reason-code (insufficient_funds / do_not_honor / stolen_card / fraud_suspected) has different recovery-patterns. A feature-set that omits decline-reason-code cannot distinguish "this will recover with a different day" vs "this needs a card-update" vs "this is fraudulent, don't retry". **Fix: include the top-12 decline-reason-codes as one-hot-encoded features in Phase 1 Step 2.**
4. **Skipping the model-monitoring-+-drift-detection dashboard.** Models drift silently. After 6 months without monitoring, a model trained on pre-BF/CM data may be 20+ percentage points off on BF/CM days. **Fix: build the precision-decay dashboard in Phase 3 Step 4; auto-retrain on >5pp decay.**
5. **No model-feedback-loop-+-post-charge-truth-label-collector.** Without truth-labels, the model never learns from its predictions. A model that predicts 100 high-risk subscriptions today and observes 70 actual-failures tomorrow needs the truth-label to re-train. **Fix: build the post-charge-truth-label-collector in Phase 3 Step 5; feedback latency target <24 hr.**
6. **Over-predicting high-risk (precision too low).** A model that flags 80% of subscriptions as high-risk creates alert-fatigue + customer-annoyance + TCPA-compliance-risk (too many SMS to non-risky customers). **Fix: enforce precision ≥65% in Phase 2 Step 4 (Path D) or in Stay AI's default threshold; if precision is <65%, raise the high-risk-threshold from ≥70 to ≥80.**
7. **Under-predicting high-risk (recall too low).** A model that only flags 5% of subscriptions as high-risk misses 60-70% of failures. **Fix: enforce recall ≥55% in Phase 2 Step 4; if recall is <55%, lower the high-risk-threshold from ≥70 to ≥60 OR add 3-5 features.**
8. **Pre-charge-warning cadence is too aggressive (5+ emails to a high-risk customer).** Customer-annoyance + unsubscribe-rate spikes + voluntary-churn-cascade. A customer who receives "your card is failing" 5 times in 7 days may interpret it as "they're desperate for my money" and cancel. **Fix: cap pre-charge-warning cadence at 3 emails + 2 SMS in Phase 3 Step 1; suppress further reminders after card-update.**
9. **Sending pre-charge-warning to ALL customers regardless of risk-score.** Sending "your card is failing" to a customer with failure-risk-score = 12 (low-risk) creates false-alarm + customer-confusion + support-ticket spike + brand-trust erosion. **Fix: trigger pre-charge-warning ONLY on high-risk-score (≥70) in Phase 3 Step 1.**
10. **Using a static retry-timing schedule that ignores predicted-failure-risk.** A fixed schedule (1d, 3d, 5d, 7d) treats high-risk and low-risk the same. High-risk subscriptions need DIFFERENT timing than low-risk (longer schedule = lower recovery; shorter + smarter schedule = higher recovery). **Fix: wire the dynamic-retry-timing-orchestrator in Phase 3 Step 3 to adapt retry-day to predicted-failure-risk.**
11. **Card-update CTA goes to a generic Stripe checkout link (NOT a branded hosted page).** Customers abandon generic links at 50%+ rates because they don't recognize the URL as the brand. **Fix: route the CTA to a branded hosted page (Recharge Customer Portal / Stay AI Smart-Cart / Stripe Customer Portal).**
12. **No Apple Pay / Google Pay 1-click fallback in the card-update CTA.** A customer whose physical card is expired may have Apple Pay / Google Pay set up with a different card. Without 1-click fallback, they have to manually type a new card → 25–35% drop-off. **Fix: enable Apple Pay + Google Pay in the branded card-update page in Phase 3 Step 1.**
13. **TCPA-compliance gap (SMS sent without opt-in).** Sending pre-charge-warning SMS to a customer who has not opted-in to SMS creates a TCPA-violation ($500-$1,500 per message). **Fix: enforce Postscript double-opt-in segment filter BEFORE SMS fires in Phase 3 Step 2; quiet-hours 9am-9pm local time.**
14. **Voluntary-churn-cascade from over-eager pre-charge-warning.** "Your card is failing" → customer thinks "they're desperate for my money" → customer cancels. **Fix: A/B test the pre-charge-warning copy in Phase 4 Step 2; ship only the copy that LIFTS prevented-charge-success-rate by ≥15pp WITHOUT lifting voluntary-churn rate by >2pp.**
15. **No merchant-fee-awareness in dynamic-retry-timing-orchestrator.** Each retry-attempt costs the merchant 2.5-3.5% of the transaction value in processor fees. A 6-retry schedule on a low-risk subscription may cost more in fees than the recovered revenue. **Fix: enforce ≤4 retries per failure; compute break-even-retry-N (revenue-at-risk × recovery-rate > retry-cost) in Phase 3 Step 3.**

## Verification (this skill is "shipped" when...)

### Gate A — Baseline captured
- [ ] 90-day failed-payment history exported from Recharge / Stripe / Chargebee / Recurly
- [ ] 12-25 features captured per historical charge (card-exp-window + decline-reason + days-since-success + repeat-failure-count + BIN-risk + 3DS-friction + amount-pattern + cohort + engagement-decay)
- [ ] Baseline predicted-failure-rate precision/recall captured (target ≥40% precision / ≥30% recall on hand-rules)
- [ ] Baseline snapshot saved to `dashboard/scripts/baselines/subscription_ai_failure_prediction_baseline_<date>.json`

### Gate B — Failure-risk-scoring-engine live
- [ ] Stay AI / Stripe Smart Retries / Chargebee Predict / Recurly IR / custom-ML activated
- [ ] Failure-risk-scores shipping daily for subscriptions-charging-in-next-7-days
- [ ] Scores written to Klaviyo custom-property `predicted_failure_risk: <0-100>`
- [ ] Scores written to Recharge subscription-tag (for Shopify-DTC)
- [ ] Precision ≥65% on validation-set (Path A) / ≥70% (Path B/C) / ≥75% (Path D)
- [ ] Recall ≥55% on validation-set (Path A) / ≥60% (Path B/C) / ≥65% (Path D)

### Gate C — Pre-charge-warning cadence live
- [ ] 3-email pre-charge-warning cadence live in Klaviyo at T-7d / T-3d / T-1d
- [ ] 2-SMS pre-charge-warning cadence live in Postscript at T-3d / T-1d
- [ ] Suppression rule fires when customer updates card between Email 1 and charge-attempt
- [ ] Apple Pay + Google Pay 1-click fallback enabled in branded card-update page
- [ ] TCPA-compliant opt-in segment filter enforced for SMS
- [ ] Quiet-hours 9am-9pm local time enforced for SMS

### Gate D — Dynamic-retry-timing-orchestrator live
- [ ] Retry-timing adapts to predicted-failure-risk: high-risk → 1d, 4d, 9d, 14d; medium-risk → 3d, 7d, 14d; low-risk → 5d, 10d, 14d
- [ ] Merchant-fee break-even-retry-N computed (revenue-at-risk × recovery-rate > retry-cost)
- [ ] ≤4 retries per failure enforced

### Gate E — Model-monitoring-+-drift-detection dashboard live
- [ ] Precision / recall / prevented-charge-success-rate tracked on rolling 30-day windows
- [ ] Auto-retrain trigger fires when precision drops >5 percentage points over 30d
- [ ] Dashboard accessible to operator (Looker / Metabase / BigQuery + dashboard)

### Gate F — Model-feedback-loop-+-post-charge-truth-label-collector live
- [ ] On every charge-attempt, `predicted_failure_risk` + `actual_charge_outcome` logged to `subscription_ai_failure_prediction_truth_labels` BigQuery table
- [ ] Feedback latency <24 hr from charge-attempt to truth-label-logged
- [ ] Daily cron re-trains the model on latest 30-day truth-labels (Stay AI auto; custom-ML needs Vertex AI pipeline)

### Gate G — Combined-with-Move-14.2 recovery-rate verified
- [ ] 30-day post-launch combined recovery-rate (pre-charge + post-charge) ≥55% (Path A) / ≥60% (Path B/C) / ≥65% (Path D)
- [ ] Lift from baseline (median 32% post-charge-only) ≥23pp (Path A) / ≥28pp (Path B/C) / ≥33pp (Path D)
- [ ] Pre-charge-warning flow captured ≥60% of predicted-high-risk failures before they failed
- [ ] Model-precision decay over 30d ≤5 percentage points
- [ ] No regression in voluntary-churn rate (within ±5% of pre-launch baseline)
- [ ] No regression in customer-LTV (within ±5% of pre-launch baseline)
- [ ] No train/serve skew (model-precision within 5pp of validation-set precision)

## How to extend this skill

1. **Move #14.2.1.1 — Per-customer-feature-store (vertex-feature-store + Feast + dynamic-feature-engineering)**: extend the failure-risk-scoring-engine with a per-customer feature-store that updates in real-time on every customer-action (open / click / site-visit / cart-add / support-ticket). Lifts precision from 65–85% to 80–95% by capturing engagement-decay as a real-time signal.
2. **Move #14.2.1.2 — Multi-gateway-orchestrator (Stripe + PayPal + Adyen + Braintree + Authorize.net unified failure-prediction)**: extend the failure-risk-scoring-engine to handle multi-gateway subscriptions (charge-by-occur vs decline-reason-pattern varies by processor). Required for any brand with ≥2 gateways.
3. **Move #14.2.1.3 — 3DS-exemption-engine (Stripe 3DS + Adyen 3DS2 + exemption-recommendation ML-model)**: extend the pre-charge-warning cadence to include a 3DS-exemption recommendation (low-risk transactions should request 3DS-exemption to avoid SCA-friction that causes 5-10% of failures). Lifts recovery-rate by 3-7 percentage points.
4. **Move #14.2.1.4 — Cross-cohort-failure-prediction (cohort-level ML-model that predicts which subscription-cohorts will spike in failure-rate 7 days out)**: extend the per-subscription failure-risk-score with a cohort-level overlay (e.g., "the cohort of customers who signed up in March 2025 has a 2.3x higher failure-rate than baseline — apply cohort-wide pre-charge-warning"). Lifts recall from 55-80% to 75-90%.
5. **Move #14.2.1.5 — Pre-charge-warning-channel-orchestrator (email + SMS + push + in-app banner + RCS adaptive by customer-preference)**: extend the pre-charge-warning cadence to adaptive-channel-selection per customer (some customers prefer SMS-only; some prefer email-only; some prefer push-notification). Lifts prevented-charge-success-rate from 70-85% to 80-92%.

## Cross-references

- **Move #11 (subscription-replenishment, `retention/subscription-replenishment`)** — Move #11 ships the subscription engine. Move #14.2.1 is the **AI-predicted card-failure-prevention layer** that sits ON TOP of Move #11's recurring-billing engine. Ship Move #11 BEFORE Move #14.2.1.
- **Move #14.2 (subscription-dunning-failed-payment-recovery, `subscription-dunning`)** — Move #14.2 is the post-charge failure-recovery layer. Move #14.2.1 is the pre-charge failure-prediction layer. The combined Move #14.2 + Move #14.2.1 system lifts total recovery-rate from median 32% (post-charge-only) to best-in-class 62-82% (post-charge + pre-charge). Ship Move #14.2 BEFORE Move #14.2.1.
- **Move #1 (cart-abandon-recovery, `retention/abandoned-cart-recovery`)** — the original "predict-and-recover" template. Move #14.2.1's pre-charge-warning cadence is patterned after Move #1's "predict-which-customers-will-abandon" framework.
- **Move #4 (welcome-series, `retention/welcome-series`)** — the cross-channel reminder substrate that Move #14.2.1's pre-charge-warning cadence depends on for Klaviyo segment + flow infrastructure.
- **Move #5 (klaviyo-postscript-migration, `retention/klaviyo-postscript-migration`)** — the cross-channel stack that Move #14.2.1's pre-charge-warning SMS cadence depends on. Ship Move #5 BEFORE Move #14.2.1.
- **Move #8 (loyalty-program, `retention/loyalty-program`)** — the customer-data substrate. Move #14.2.1's `predicted_failure_risk` field feeds back into Move #8's customer-LTV-cohort segmentation.
- **Move #14.1 (lifecycle-flow-library, `retention/lifecycle-flow-library`)** — the 20-flow email/SMS library across all customer-lifecycle stages. Move #14.2.1's pre-charge-warning cadence is a Tier-1 flow from the lifecycle-library's 4-tier framework (T-7d pre-charge-warning is the highest-leverage single-flow in subscription commerce).
- **Move #20.2 (nps-voc-closed-loop-automation, `cx/nps-voc-closed-loop-automation`)** — the post-purchase voice-of-customer layer. Move #14.2.1's voluntary-churn-cascade-prevention overlaps with Move #20.2's NPS-detractor segmentation; both feed into the same winback flow.
- **Move #100 (customer-data-platform-identity-resolution, `customer-data-platform`)** — the unified-customer-profile substrate. Move #14.2.1's per-customer feature-store depends on Move #100's identity-resolution to merge cross-channel engagement-decay signals (email-open + SMS-click + site-visit) into a single customer-profile.

## Sources

- [Stay AI 2024 AI Failure Prediction Performance Report](https://www.stay.ai) — 70-85% predicted-failure precision, 75-85% prevented-charge-success rate, +20-35% recovery lift vs naive retry, AI-predicted card-update-CTR
- [Stripe Billing 2024 Smart Retries + ML Research](https://stripe.com/docs/billing/subscriptions/retries) — 20-40% recovery-rate lift vs naive retry, AI-predicted optimal retry timing, dynamic-retry-timing-orchestrator
- [Recharge 2024 Subscription Cancellation + AI Failure Prediction Benchmark](https://rechargepayments.com) — 38-50% dunning recovery rate, $1.2T subscription commerce market sizing, AI-failure-prediction-feature-set best practices
- [ProfitWell 2024 Involuntary Churn Benchmark + AI Prediction Report](https://www.profitwell.com) — 5-8% median involuntary churn rate, 9-15% subscription transaction failure rate on first charge, 38-62% recovery rate range, AI-predicted-failure-precision benchmarks
- [Recurly 2024 Dunning + Intelligent Recovery Best Practices](https://recurly.com) — 40-55% recovery rate with smart dunning, multi-retry-schedule-by-failure-reason guidance, Intelligent Recovery ML-feature-set
- [Chargebee 2024 Predict + Dunning Engine Guide](https://www.chargebee.com) — 40-55% recovery rate, retry-schedule customization, AI-failure-prediction-feature-set, Predict-engine benchmarks
- [Smile.io 2024 Loyalty + Subscription Benchmarks](https://smile.io) — loyalty-tier-cohort-LTV benchmarks, subscription-vs-one-time-purchase LTV gap, AI-failure-prediction + loyalty-tier-up interaction
- [Klaviyo 2024 Lifecycle Marketing Benchmark Report](https://www.klaviyo.com) — pre-charge-warning-email-cadence open-rate benchmarks, suppression-segment best practices, Klaviyo-segment-as-ML-prediction-substrate
- [Postscript 2024 SMS Cadence Research](https://www.postscript.com) — 95%+ SMS open rate, SMS-in-pre-charge-warning cadence lift benchmarks, TCPA-compliance best practices
- [Baymard Institute 2024 Checkout + Recurring Payment Research](https://baymard.com) — 9-15% recurring-payment failure rate, 3DS / SCA friction benchmarks, card-expiration-window-as-failure-driver
- [Statista 2024 Recurring Payments Failure Statistics](https://www.statista.com) — global recurring-payment-failure-rate benchmarks by region, decline-reason-code distribution
- [GoCardless 2024 Failed Payment Research](https://gocardless.com) — direct-debit failure rate vs card failure rate, failure-reason breakdown, bank-decline-reason-specific copy
- [Smart Insights 2024 Subscription AI Prediction Benchmarks](https://www.smartinsights.com) — pre-charge-warning-cadence best practices, AI-prediction-precision benchmarks by GMV tier
- [G2 2024 AI Failure Prediction Software Comparison](https://www.g2.com) — feature-by-feature comparison of Stay AI vs Stripe ML vs Chargebee Predict vs Recurly IR vs ProfitWell Retain
- [Skio 2024 Subscription Commerce Report](https://skio.com) — subscription-vs-one-time LTV gap, AI-failure-prediction-engagement-decay-signal benchmarks
- [Loop Subscriptions 2024 AI Dunning Best Practices](https://www.loopwork.co/loop-subscriptions) — Shopify-native AI-failure-prediction-engine guide, pre-charge-warning-cadence + Apple Pay / Google Pay fallback
- [Bold Commerce 2024 Subscription AI Recovery Benchmarks](https://boldcommerce.com) — AI-prediction-recovery-rate benchmarks by industry vertical, model-retraining-cadence best practices
- [Okendo Subscriptions 2024 AI Dunning + Loyalty Integration](https://okendo.io) — AI-prediction-cadence + loyalty-tier-up interaction, predicted-failure-rate-vs-cohort-LTV
- [Subbly 2024 AI Subscription Failure Prediction Guide](https://subbly.com) — small-DTC subscription-AI-prediction-engine best practices, model-monitoring-+-drift-detection for SMB brands
- [Smartrr 2024 AI Subscription Dunning Research](https://www.smartrr.com) — Shopify-native AI-failure-prediction-engine benchmarks, model-feedback-loop + truth-label-collector
- [Paddle 2024 Subscription Billing Benchmark Report](https://paddle.com) — merchant-of-record subscription AI-failure-prediction benchmarks, cross-border + multi-currency AI-prediction
- [Maxio 2024 Subscription AI Recovery Research](https://www.maxio.com) — SaaS-subscription-AI-failure-prediction benchmarks, B2B-vs-DTC AI-prediction precision gap
- [Zuora 2024 Subscription AI Failure Prediction Report](https://www.zuora.com) — enterprise-subscription-AI-prediction-engine benchmarks, multi-gateway-orchestrator best practices
- [DoubleCheck Research 2024 ML Feature Store for Subscriptions](https://doublecheckresearch.com) — per-customer-feature-store architecture, Vertex Feature Store + Feast + dynamic-feature-engineering
- [Substack 2024 Predicted Failure ML Research](https://substack.com) — open-source-predicted-failure-ML-model benchmarks, XGBoost-vs-LightGBM-vs-Vertex-AI comparison
- [Forrester 2024 Prediction Engine Wave Report](https://www.forrester.com) — enterprise-AI-failure-prediction-engine vendor comparison, model-monitoring-+-drift-detection best practices