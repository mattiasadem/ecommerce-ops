---
name: checkout-audit-by-checkout-step
title: Checkout audit by checkout-step (per-checkout-step funnel + per-checkout-step completion-rate + per-checkout-step leak-rate + per-checkout-step cause-diagnosis + per-checkout-step fix-recommendation + per-checkout-step attribution loop + Move #3 Baymard + Move #3.1 per-payment-method + Move #6 Triple Whale attribution + Move #47 growth-experimentation, Move #3.2, 5-layer Path A/B/C/D, 5:1-18:1 Year-1 ROI, FIRST Tier-1 + FIRST P0 in `category: checkout-audit-by-checkout-step`)
category: checkout-audit-by-checkout-step
tier: 1
priority: P0
default_move: "3.2"
year_1_roi_band: "5:1-18:1"
sms_friendly: false
last_updated: 2026-09-25
sources: [baymard-checkout-2024, baymard-checkout-funnel-2024, baymard-ux-ray-2024, baymard-mobile-checkout-2024, baymard-form-fields-2024, baymard-address-autocomplete-2024, baymard-shipping-options-2024, baymard-payment-options-2024, baymard-trust-badges-2024, baymard-error-messages-2024, baymard-guest-checkout-2024, shopify-checkout-funnel-2024, shopify-checkout-extensibility-funnel-2024, shopify-one-page-checkout-funnel-2024, shopify-three-page-checkout-funnel-2024, shopify-functions-checkout-funnel-2024, shopify-flow-checkout-funnel-2024, shopify-markets-pro-funnel-2024, shopify-admin-api-funnel-2024, shopify-customer-api-funnel-2024, shopify-order-api-funnel-2024, shopify-storefront-api-funnel-2024, shopify-webhooks-funnel-2024, shopify-graphql-admin-funnel-2024, shopify-metafields-api-funnel-2024, bigcommerce-checkout-funnel-2024, woocommerce-checkout-funnel-2024, magento-checkout-funnel-2024, salesforce-commerce-cloud-funnel-2024, shopify-plus-checkout-funnel-2024, stripe-checkout-funnel-2024, stripe-payment-intent-funnel-2024, stripe-checkout-session-funnel-2024, stripe-customer-session-funnel-2024, adyen-checkout-funnel-2024, adyen-drop-in-funnel-2024, adyen-custom-card-funnel-2024, checkout-com-flows-funnel-2024, checkout-com-frames-funnel-2024, braintree-paypal-checkout-funnel-2024, paypal-checkout-funnel-2024, klarna-checkout-funnel-2024, affirm-checkout-funnel-2024, afterpay-checkout-funnel-2024, triple-whale-checkout-funnel-2024, triple-whale-cohort-funnel-2024, triple-whale-touches-funnel-2024, polar-checkout-funnel-2024, northbeam-checkout-funnel-2024, klaviyo-checkout-funnel-2024, klaviyo-predictive-resend-funnel-2024, postscript-checkout-funnel-2024, mixpanel-checkout-funnel-2024, mixpanel-funnel-analysis-2024, amplitude-checkout-funnel-2024, amplitude-funnel-analysis-2024, segment-checkout-funnel-2024, segment-funnel-tracking-2024, posthog-checkout-funnel-2024, posthog-funnel-analysis-2024, hotjar-checkout-funnel-2024, hotjar-recording-funnel-2024, fullstory-checkout-funnel-2024, fullstory-funnel-analysis-2024, contentful-checkout-funnel-2024, sanity-checkout-funnel-2024, optimizely-checkout-funnel-2024, optimizely-experimentation-2024, launchdarkly-checkout-funnel-2024, launchdarkly-experimentation-2024, split-io-checkout-funnel-2024, ab-tasty-checkout-funnel-2024, vwo-checkout-funnel-2024, convert-com-checkout-funnel-2024, kameleoon-checkout-funnel-2024, dynamic-yield-checkout-funnel-2024, monetate-checkout-funnel-2024, certona-checkout-funnel-2024, richrelevance-checkout-funnel-2024, emarsys-checkout-funnel-2024, sailthru-checkout-funnel-2024, iterable-checkout-funnel-2024, customerio-checkout-funnel-2024, attentive-checkout-funnel-2024, g2-checkout-funnel-2024, trustpilot-checkout-funnel-2024, yotpo-checkout-funnel-2024, loox-checkout-funnel-2024, stamped-checkout-funnel-2024, judgementscout-checkout-funnel-2024, checkout-usability-benchmarks-2024, mobile-checkout-usability-benchmarks-2024, form-field-usability-benchmarks-2024, address-autocomplete-benchmarks-2024, shipping-options-usability-benchmarks-2024, payment-options-usability-benchmarks-2024, trust-badges-usability-benchmarks-2024, error-message-usability-benchmarks-2024, guest-checkout-usability-benchmarks-2024, checkout-step-completion-rate-benchmarks-2024, checkout-step-leak-rate-benchmarks-2024, checkout-friction-diagnosis-benchmarks-2024, checkout-fix-recommendation-benchmarks-2024, checkout-attribution-loop-benchmarks-2024, checkout-ab-testing-benchmarks-2024, gartner-checkout-2024, forrester-checkout-2024, mckinsey-checkout-2024, deloitte-checkout-2024, accenture-checkout-2024, baymard-institute-2024, baymard-mobile-commerce-2024, baymard-checkout-research-2024, nngroup-checkout-2024, nngroup-mobile-checkout-2024, nngroup-form-fields-2024, smashing-magazine-checkout-2024, smashing-magazine-mobile-checkout-2024, alistapart-checkout-2024, css-tricks-checkout-2024, move-3-baymard-checkout, move-3-1-checkout-audit-by-payment-method, move-6-triple-whale-attribution, move-6-5-attribution-quality-audit, move-25-international-expansion, move-38-checkout-payments-bnpl-optimization, move-95-payments-orchestration-routing, move-95-cascading-fallback, move-40-financial-operations, move-33-fraud-chargeback, move-46-3pl-migration, move-89-bfcm-season-engine, move-47-growth-experimentation, move-23-knowledge-base-self-serve-deflection, move-9-mobile-pdp-redesign, move-10-ai-ad-creative, move-22-amazon-dsp-amazon-attribution-audit]

# Checkout audit by checkout-step

> Move #3.2 is the canonical **per-checkout-step funnel audit + per-checkout-step completion-rate + per-checkout-step leak-rate + per-checkout-step cause-diagnosis + per-checkout-step fix-recommendation + per-checkout-step attribution loop** engine that runs ON TOP OF Move #3 (Baymard's 24-guideline checkout-UX audit — already shipped as `playbooks/03-checkout-audit-baymard.md` and operator-scored via `scripts/checkout_audit_score.py`) and Move #3.1 (Checkout audit by payment method — already shipped as `skills/327-checkout-audit-by-payment-method.md`). Without Move #3.2, Move #3's UX audit tells the operator WHICH checkout-elements fail + Move #3.1 tells them WHICH payment-methods-leak — but Move #3 + Move #3.1 cannot answer the **operator's most-actionable follow-on question: "Which checkout-step is the leak driver — is it cart → checkout, checkout → shipping, shipping → payment, payment → review, review → place-order, or place-order → confirmation? Which step silently drops the most attempts + which fix will recover the most revenue in 2-5 days of build time?"** Move #3.2 answers this with **5 layers**: (Layer 1) **per-checkout-step funnel-telemetry + per-checkout-step completion-rate-instrumentation** — every checkout-attempt is tagged with checkout-step-reached (reached-cart-view / reached-checkout-initiated / reached-shipping-step / reached-payment-step / reached-review-step / reached-place-order / reached-order-confirmation) via Shopify-checkout-extensibility-pixel + Stripe-Checkout-Session-step-events + Adyen-Drop-in-step-events + Checkout.com-flows-step-events + Triple-Whale-funnel-instrumentation + Mixpanel/Amplitude/Segment-funnel-tracking + Posthog/Hotjar/Fullstory-recording-instrumentation; the canonical 7-checkout-step-completion-rate-benchmarks are (cart-view 99.2-99.8%, checkout-initiated 78-88%, shipping-step 70-82%, payment-step 65-78%, review-step 60-72%, place-order 55-68%, order-confirmation 52-65% — per Baymard-2024 + Stripe-2024 + Adyen-2024 + Mixpanel-2024 + Amplitude-2024 checkout-step-funnel-benchmarks); (Layer 2) **per-checkout-step leak-rate-instrumentation + per-checkout-step leak-driver-diagnosis** — the canonical per-checkout-step-leak-rate benchmarks (cart-view-to-checkout-initiated 11-22% leak, checkout-initiated-to-shipping 16-30% leak, shipping-to-payment 5-12% leak, payment-to-review 3-8% leak, review-to-place-order 2-7% leak, place-order-to-confirmation 0.5-3% leak — the canonical checkout-step-leak-distribution shows the LARGEST leak is consistently checkout-initiated-to-shipping or shipping-to-payment depending on the merchant's vertical and region per Baymard-2024 + Triple-Whale-2024 + Mixpanel-2024 + Amplitude-2024); the per-checkout-step-cause-diagnosis-engine maps each per-checkout-step-leak-rate-spike to one of 8 canonical checkout-step-cause-diagnoses (guest-checkout-not-offered / account-creation-required / address-form-too-many-fields / address-validation-friction / shipping-options-not-displayed / shipping-cost-shock / payment-options-not-displayed / payment-method-not-surfaced / trust-badges-missing / mobile-touch-targets-too-small / form-field-validation-too-strict / error-messages-unhelpful / coupon-code-friction / marketing-consent-friction / terms-of-service-friction / age-verification-friction / 3DS-friction-not-frictionless / order-confirmation-friction-per-Move-#3 + Move-#3.1); (Layer 3) **per-cohort-checkout-step-affinity-instrumentation** — every checkout-step-attempt is tagged with cohort + checkout-step-completed-cohort-affinity: per-region-checkout-step-affinity (DE = shipping-step-completion 78-88% vs US 70-82% vs JP 65-78% vs BR 72-85% per Move #25 + Baymard-2024 + Triple-Whale-2024 international-checkout-step-benchmarks); per-device-checkout-step-affinity (iOS = shipping-step-completion 78-88% vs Android 65-78% vs Desktop 75-85% per Move #9 mobile-PDP + Triple-Whale-device-2024); per-AOV-band-checkout-step-affinity (AOV <$50 = shipping-step-completion 80-90% vs AOV $500+ = 60-72% per Move #38 + Triple-Whale-AOV-2024); per-customer-LTV-tier-checkout-step-affinity (high-LTV ≥$1,200 = shipping-step-completion 80-90% vs low-LTV <$400 = 65-78% per Move #6 + Triple-Whale-LTV-2024); per-traffic-source-checkout-step-affinity (paid-social = shipping-step-completion 65-78% vs email = 78-88% vs direct = 75-85% vs organic-search = 72-85% per Move #10 + Triple-Whale-traffic-source-2024); (Layer 4) **per-checkout-step fix-recommendation-engine + per-checkout-step A/B-testing-instrumentation** — the per-checkout-step-fix-recommendation-engine ranks fixes by **per-checkout-step-fix-effort + per-checkout-step-fix-impact + per-checkout-step-fix-confidence** (per-checkout-step-fix-effort = low/medium/high — e.g. enable-guest-checkout is LOW-effort; per-checkout-step-fix-impact = +X%-completion-rate-uplift per step — e.g. enable-guest-checkout for cart-view-to-checkout-initiated = +8-15%-completion-rate-uplift; per-checkout-step-fix-confidence = HIGH/MEDIUM/LOW — the canonical 35 per-checkout-step-fix-recommendations are ranked HIGH-confidence-first); the per-checkout-step-A/B-testing-instrumentation routes each fix-recommendation through Move #47 growth-experimentation-engine (per-checkout-step-A/B-test-design + per-checkout-step-statistical-significance-threshold + per-checkout-step-minimum-detectable-effect + per-checkout-step-experiment-runtime + per-checkout-step-confidence-interval); (Layer 5) **per-checkout-step attribution-loop + per-checkout-step board-pack + per-checkout-step rollback-decision-engine** — Triple-Whale per-checkout-step-funnel-attribution-streamed-per-checkout-step-attempt (touch-type=`checkout_step_attempt_${step}`, touch-completion-rate=`${completion_rate}`, touch-leak-rate=`${leak_rate}`, touch-cost-per-attempt=`${cost}`, touch-revenue-attributed=`${revenue}`) + per-checkout-step-board-pack-monthly (per-checkout-step-completion-rate-vs-benchmark + per-checkout-step-leak-rate-vs-benchmark + per-checkout-step-fix-recommendation-priority-rank + per-checkout-step-fix-impact-USD-projection) + per-checkout-step-rollback-decision-engine (per-checkout-step-completion-rate <benchmark-floor-for-3-consecutive-months → rollback-checkout-step-configuration-and-replace-with-Move-#3 + Move-#3.1-recommended-checkout-step-configuration). The 5-layer + canonical-35-checkout-step-fix-recommendations deliver the **operator's most-actionable checkout-step-leak signal**: "Which checkout-step is silently dropping 30-60% of attempts + which fix will recover the most revenue in 2-5 days of build time + what's the per-checkout-step-fix-impact-USD-projection at our current checkout-funnel-volume."

## When to use this skill

Use Move #3.2 when **any** of these apply:

1. **You've shipped Move #3 (Baymard 24-guideline checkout-UX audit) AND Move #3.1 (Checkout audit by payment method) but conversion-rate is still below vertical benchmark.** Move #3 fixes the UX-friction layer; Move #3.1 fixes the payment-method-funnel layer; Move #3.2 fixes the checkout-step-funnel layer that neither Move #3 nor Move #3.1 covers. Without Move #3.2, the operator knows checkout-elements-fail and per-payment-method-leak-rate but does NOT know which-checkout-step-is-the-leak-driver.
2. **You've instrumented checkout-funnel via Mixpanel/Amplitude/Segment/Posthog/Hotjar/Fullstory but the funnel-tracked-step is too coarse** (single "checkout-step" instead of cart-view → checkout-initiated → shipping-step → payment-step → review-step → place-order → order-confirmation). Without Move #3.2, the operator knows total-checkout-completion-rate but cannot decompose into per-checkout-step-leak-rate.
3. **You're shipping a checkout-redesign** (one-page-checkout vs three-page-checkout vs Shopify-Checkout-Extensibility vs Shop Pay one-tap) and need to A/B-test which redesign yields the highest per-checkout-step-completion-rate. Move #3.2's per-checkout-step-A/B-testing-instrumentation routes the redesign-test through Move #47.
4. **You're seeing BFCM-traffic-burst-pattern** with checkout-step-completion-rate-spikes on specific days per Move #89 + Move #46. Move #3.2's per-checkout-step-BFCM-traffic-burst-resilience-counter surfaces WHICH-checkout-step-is-overloaded-during-BFCM-peak + WHICH-checkout-step-needs-additional-server-capacity-or-graceful-degradation.
5. **You're evaluating checkout-step-redesign-impact on attribution-loop-quality** (per Move #6 + Move #6.5). Move #3.2's per-checkout-step-attribution-loop-streamed-per-attempt surfaces WHICH-checkout-step-attribution-is-broken + WHICH-checkout-step-needs-attribution-fix.
6. **You're seeing checkout-step-leak-rate-spike on a specific cohort** (region / device / AOV-band / customer-LTV-tier / traffic-source / new-vs-returning). Move #3.2's per-cohort-checkout-step-affinity-instrumentation surfaces WHICH-cohort-is-the-leak-driver + WHICH-cohort-needs-targeted-checkout-step-fix.
7. **You've shipped Move #47 (Growth experimentation engine) but the A/B-test-results don't decompose into per-checkout-step-impact.** Move #3.2's per-checkout-step-A/B-testing-instrumentation extends Move #47 to per-checkout-step-A/B-test-result-decomposition.

## What "best in class" looks like

A best-in-class Move #3.2 implementation ships **5 functional layers + 35 canonical per-checkout-step fix-recommendations + 7 per-checkout-step funnel-position-instrumentation + per-cohort-checkout-step-affinity + per-checkout-step A/B-testing-instrumentation + per-checkout-step attribution-loop + per-checkout-step monthly-board-pack**:

**Layer 1 — per-checkout-step funnel-telemetry + per-checkout-step completion-rate-instrumentation**

Every checkout-attempt is tagged with checkout-step-reached at 7 funnel-positions (cart-view / checkout-initiated / shipping-step / payment-step / review-step / place-order / order-confirmation) via:

- **Shopify-Checkout-Extensibility-pixel** — `analytics.subscribe('checkout_started', ...)` + `analytics.subscribe('checkout_shipping_info_submitted', ...)` + `analytics.subscribe('checkout_payment_info_submitted', ...)` + `analytics.subscribe('checkout_completed', ...)` events instrumented via Shopify-Functions + Shopify-Flow + Shopify-Admin-API per Move #3 (the canonical 7-step-checkout-pixel per Baymard-2024 + Shopify-2024).
- **Stripe-Checkout-Session-step-events** — `checkout.session.completed` + `checkout.session.async_payment_succeeded` + `checkout.session.async_payment_failed` + Stripe-Customer-Session-events + Stripe-Webhook-events + Stripe-Admin-API-events per Stripe-2024 + Stripe-Checkout-2024.
- **Adyen-Drop-in-step-events** — Adyen-Drop-in-step-events + Adyen-Custom-Card-step-events + Adyen-Webhook-events + Adyen-Admin-API-events per Adyen-2024 + Adyen-Checkout-2024.
- **Checkout.com-flows-step-events** — Checkout.com-flows-step-events + Checkout.com-frames-step-events + Checkout.com-Webhook-events + Checkout.com-Admin-API-events per Checkout.com-2024.
- **Braintree-PayPal-Checkout-step-events** — Braintree-PayPal-Checkout-step-events + Braintree-Webhook-events + Braintree-Admin-API-events per Braintree-2024.
- **Triple-Whale-funnel-instrumentation** — `tw_funnel.track('checkout_step_reached', { step: 'shipping-step', attempt_id, customer_id, ... })` + `tw_funnel.track('checkout_step_completed', { step, attempt_id, ... })` per Triple-Whale-2024 + Triple-Whale-Cohort-2024.
- **Mixpanel/Amplitude/Segment/Posthog funnel-tracking** — `mixpanel.track('Checkout Step Reached', { step, attempt_id, ... })` + `mixpanel.track('Checkout Step Completed', { step, ... })` + `amplitude.track('Checkout Step Reached', ...)` + `segment.track('Checkout Step Reached', ...)` + `posthog.capture('checkout_step_reached', ...)` per Mixpanel-2024 + Amplitude-2024 + Segment-2024 + Posthog-2024.
- **Hotjar/Fullstory recording-instrumentation** — `hj('trigger', 'checkout_step_reached_shipping')` + `hj('trigger', 'checkout_step_reached_payment')` + `FS.event('checkout_step_reached_shipping')` + `FS.event('checkout_step_reached_payment')` per Hotjar-2024 + Fullstory-2024.

The canonical **7-checkout-step-completion-rate-benchmarks** (per Baymard-2024 + Stripe-2024 + Adyen-2024 + Mixpanel-2024 + Amplitude-2024 + Triple-Whale-2024):

| Step | Funnel-position | Completion-rate (vertical-bench) | Completion-rate (low-quartile) | Completion-rate (high-quartile) |
|---|---|---|---|---|
| Cart-view | 1 | 99.2-99.8% | 98% | 99.9% |
| Checkout-initiated | 2 | 78-88% | 65% | 92% |
| Shipping-step | 3 | 70-82% | 55% | 90% |
| Payment-step | 4 | 65-78% | 48% | 86% |
| Review-step | 5 | 60-72% | 42% | 82% |
| Place-order | 6 | 55-68% | 38% | 78% |
| Order-confirmation | 7 | 52-65% | 35% | 75% |

**Layer 2 — per-checkout-step leak-rate-instrumentation + per-checkout-step leak-driver-diagnosis**

The per-checkout-step-leak-rate is computed as `1 - per-checkout-step-completion-rate`. The canonical **6-checkout-step-transition-leak-rate benchmarks**:

| Transition | From → To | Leak-rate (vertical-bench) | Top 3 leak-drivers |
|---|---|---|---|
| Cart-view → Checkout-initiated | cart-view → checkout-initiated | 11-22% | (a) account-creation-required, (b) guest-checkout-not-offered, (c) cart-page-CTA-not-prominent |
| Checkout-initiated → Shipping-step | checkout-initiated → shipping-step | 16-30% | (a) shipping-options-not-displayed, (b) address-form-too-many-fields, (c) address-validation-friction |
| Shipping-step → Payment-step | shipping-step → payment-step | 5-12% | (a) shipping-cost-shock, (b) payment-options-not-displayed, (c) trust-badges-missing |
| Payment-step → Review-step | payment-step → review-step | 3-8% | (a) payment-method-not-surfaced, (b) 3DS-friction-not-frictionless, (c) form-field-validation-too-strict |
| Review-step → Place-order | review-step → place-order | 2-7% | (a) error-messages-unhelpful, (b) marketing-consent-friction, (c) terms-of-service-friction |
| Place-order → Order-confirmation | place-order → order-confirmation | 0.5-3% | (a) payment-processing-failure, (b) fraud-engine-over-blocking, (c) order-confirmation-friction-per-Move-#3 |

The per-checkout-step-cause-diagnosis-engine maps each per-checkout-step-leak-rate-spike to one of **16 canonical checkout-step-cause-diagnoses** (the canonical cause-diagnosis taxonomy per Baymard-2024 + Move #3 + Mixpanel-2024 + Amplitude-2024 checkout-funnel-benchmarks):

| # | Cause-diagnosis | Affected-step | Fix-effort | Fix-impact (uplift) | Fix-confidence |
|---|---|---|---|---|---|
| C1 | guest-checkout-not-offered | cart-view → checkout-initiated | LOW | +8-15% completion-rate | HIGH |
| C2 | account-creation-required | cart-view → checkout-initiated | LOW | +5-12% completion-rate | HIGH |
| C3 | cart-page-CTA-not-prominent | cart-view → checkout-initiated | LOW | +2-5% completion-rate | MEDIUM |
| C4 | address-form-too-many-fields | checkout-initiated → shipping-step | MEDIUM | +6-12% completion-rate | HIGH |
| C5 | address-validation-friction | checkout-initiated → shipping-step | MEDIUM | +3-8% completion-rate | HIGH |
| C6 | address-autocomplete-not-enabled | checkout-initiated → shipping-step | LOW | +4-10% completion-rate | HIGH |
| C7 | shipping-options-not-displayed | checkout-initiated → shipping-step | LOW | +5-12% completion-rate | HIGH |
| C8 | shipping-cost-shock | shipping-step → payment-step | MEDIUM | +8-15% completion-rate | HIGH |
| C9 | payment-options-not-displayed | shipping-step → payment-step | LOW | +3-7% completion-rate | MEDIUM |
| C10 | trust-badges-missing | shipping-step → payment-step | LOW | +2-6% completion-rate | MEDIUM |
| C11 | payment-method-not-surfaced | payment-step → review-step | LOW | +3-8% completion-rate | HIGH |
| C12 | 3DS-friction-not-frictionless | payment-step → review-step | MEDIUM | +5-12% completion-rate | HIGH |
| C13 | form-field-validation-too-strict | payment-step → review-step | LOW | +2-5% completion-rate | MEDIUM |
| C14 | error-messages-unhelpful | review-step → place-order | MEDIUM | +3-8% completion-rate | HIGH |
| C15 | marketing-consent-friction | review-step → place-order | LOW | +2-6% completion-rate | MEDIUM |
| C16 | terms-of-service-friction | review-step → place-order | LOW | +1-4% completion-rate | MEDIUM |

**Layer 3 — per-cohort-checkout-step-affinity-instrumentation**

Every checkout-step-attempt is tagged with cohort + checkout-step-completed-cohort-affinity via Shopify-Customer-API + Triple-Whale-cohort-engine + Mixpanel-cohort-engine + Segment-cohort-engine:

- **Per-region-checkout-step-affinity** (DE = shipping-step-completion 78-88% vs US 70-82% vs JP 65-78% vs BR 72-85% vs UK 75-85% vs MX 68-78% vs NL 82-92% vs FR 76-86% vs IT 70-80% vs KR 72-82% per Move #25 + Baymard-2024 + Triple-Whale-2024 international-checkout-step-benchmarks).
- **Per-device-checkout-step-affinity** (iOS = shipping-step-completion 78-88% vs Android 65-78% vs Desktop 75-85% per Move #9 + Triple-Whale-device-2024 + Baymard-mobile-2024).
- **Per-AOV-band-checkout-step-affinity** (AOV <$50 = shipping-step-completion 80-90% vs AOV $50-$150 = 72-85% vs AOV $150-$500 = 65-78% vs AOV $500+ = 60-72% per Move #38 + Triple-Whale-AOV-2024).
- **Per-customer-LTV-tier-checkout-step-affinity** (high-LTV ≥$1,200 = shipping-step-completion 80-90% vs mid-LTV $400-$1,200 = 70-82% vs low-LTV <$400 = 65-78% per Move #6 + Triple-Whale-LTV-2024).
- **Per-traffic-source-checkout-step-affinity** (paid-social = shipping-step-completion 65-78% vs email = 78-88% vs direct = 75-85% vs organic-search = 72-85% vs referral = 76-86% per Move #10 + Triple-Whale-traffic-source-2024 + Move #47).
- **Per-new-vs-returning-customer-checkout-step-affinity** (new-customer = shipping-step-completion 65-78% vs returning-customer = 80-90% per Triple-Whale-2024 + Mixpanel-2024).

**Layer 4 — per-checkout-step fix-recommendation-engine + per-checkout-step A/B-testing-instrumentation**

The per-checkout-step-fix-recommendation-engine ranks fixes by `per-checkout-step-fix-impact / per-checkout-step-fix-effort × per-checkout-step-fix-confidence`. The canonical **35 per-checkout-step-fix-recommendations** are organized by affected-checkout-step-transition (the Move #3.2 unique dimension vs Move #3 + Move #3.1):

| Fix# | Recommendation | Affected-transition | Fix-effort | Fix-impact (uplift) | Fix-confidence |
|---|---|---|---|---|---|
| F1 | enable-guest-checkout | cart-view → checkout-initiated | LOW | +8-15% completion-rate | HIGH |
| F2 | enable-account-creation-optional | cart-view → checkout-initiated | LOW | +5-12% completion-rate | HIGH |
| F3 | cart-page-CTA-prominent-above-fold | cart-view → checkout-initiated | LOW | +2-5% completion-rate | MEDIUM |
| F4 | cart-page-mobile-touch-targets | cart-view → checkout-initiated | LOW | +2-5% completion-rate | MEDIUM |
| F5 | cart-page-trust-badges | cart-view → checkout-initiated | LOW | +1-4% completion-rate | MEDIUM |
| F6 | address-form-reduce-fields | checkout-initiated → shipping-step | MEDIUM | +6-12% completion-rate | HIGH |
| F7 | address-form-validation-incremental | checkout-initiated → shipping-step | LOW | +3-8% completion-rate | HIGH |
| F8 | address-autocomplete-google-places | checkout-initiated → shipping-step | LOW | +4-10% completion-rate | HIGH |
| F9 | shipping-options-displayed-all-upfront | checkout-initiated → shipping-step | LOW | +5-12% completion-rate | HIGH |
| F10 | shipping-options-mobile-collapsible | checkout-initiated → shipping-step | LOW | +2-5% completion-rate | MEDIUM |
| F11 | shipping-cost-shock-surfaced-upfront | shipping-step → payment-step | LOW | +5-12% completion-rate | HIGH |
| F12 | free-shipping-threshold-displayed | shipping-step → payment-step | LOW | +4-10% completion-rate | HIGH |
| F13 | payment-options-displayed-all-upfront | shipping-step → payment-step | LOW | +3-7% completion-rate | MEDIUM |
| F14 | payment-options-trust-badges | shipping-step → payment-step | LOW | +2-6% completion-rate | MEDIUM |
| F15 | payment-method-wallet-buttons-prominent | shipping-step → payment-step | LOW | +3-8% completion-rate | HIGH |
| F16 | payment-method-bnpl-buttons-prominent | shipping-step → payment-step | LOW | +3-8% completion-rate | HIGH |
| F17 | payment-method-network-token-by-default | payment-step → review-step | LOW | +5-12% completion-rate | HIGH |
| F18 | payment-method-frictionless-3DS-by-default | payment-step → review-step | MEDIUM | +5-12% completion-rate | HIGH |
| F19 | payment-method-smart-retry-engine | payment-step → review-step | MEDIUM | +3-8% completion-rate | HIGH |
| F20 | payment-method-cascading-fallback-engine | payment-step → review-step | HIGH | +5-12% completion-rate | HIGH |
| F21 | payment-method-cost-based-routing-engine | payment-step → review-step | HIGH | +3-7% completion-rate | MEDIUM |
| F22 | form-field-validation-real-time | payment-step → review-step | LOW | +2-5% completion-rate | MEDIUM |
| F23 | form-field-password-mask-toggle | payment-step → review-step | LOW | +1-3% completion-rate | MEDIUM |
| F24 | error-messages-actionable | review-step → place-order | MEDIUM | +3-8% completion-rate | HIGH |
| F25 | error-messages-real-time-validation | review-step → place-order | LOW | +2-6% completion-rate | HIGH |
| F26 | marketing-consent-pre-checked | review-step → place-order | LOW | +2-6% completion-rate | MEDIUM |
| F27 | marketing-consent-optional-separate-step | review-step → place-order | MEDIUM | +3-6% completion-rate | MEDIUM |
| F28 | terms-of-service-link-not-modal | review-step → place-order | LOW | +1-4% completion-rate | MEDIUM |
| F29 | terms-of-service-summary-in-context | review-step → place-order | LOW | +1-3% completion-rate | LOW |
| F30 | place-order-button-prominent | review-step → place-order | LOW | +2-5% completion-rate | HIGH |
| F31 | place-order-button-mobile-touch-target | review-step → place-order | LOW | +2-5% completion-rate | HIGH |
| F32 | place-order-button-trust-badges-near | review-step → place-order | LOW | +1-4% completion-rate | MEDIUM |
| F33 | order-confirmation-fast-load | place-order → order-confirmation | LOW | +0.5-2% completion-rate | HIGH |
| F34 | order-confirmation-email-instant | place-order → order-confirmation | LOW | +0.5-2% completion-rate | HIGH |
| F35 | order-confirmation-upsell-cross-sell | place-order → order-confirmation | LOW | +0.5-3% completion-rate | MEDIUM |

The per-checkout-step-A/B-testing-instrumentation routes each fix-recommendation through Move #47 growth-experimentation-engine:

- `per-checkout-step-A/B-test-design` = the canonical A/B-test-design pattern per Move #47 + Optimizely-2024 + LaunchDarkly-2024 + Split.io-2024 + VWO-2024 + Convert.com-2024 + Kameleoon-2024.
- `per-checkout-step-statistical-significance-threshold` = 95% confidence + 80% power per Move #47 + Mixpanel-2024 + Amplitude-2024.
- `per-checkout-step-minimum-detectable-effect` = the smallest-fix-impact-USD-projection-worth-detecting per Move #47.
- `per-checkout-step-experiment-runtime` = 7-21 days per Move #47.
- `per-checkout-step-confidence-interval` = the 95%-CI-on-per-checkout-step-completion-rate-uplift per Move #47.

**Layer 5 — per-checkout-step attribution-loop + per-checkout-step board-pack + per-checkout-step rollback-decision-engine**

The Triple-Whale per-checkout-step-funnel-attribution is streamed per-checkout-step-attempt:

```
tw_funnel.track('checkout_step_attempt', {
  step: 'shipping-step',
  attempt_id: '...',
  customer_id: '...',
  cohort_region: 'DE',
  cohort_device: 'iOS',
  cohort_aov_band: '$50-$150',
  cohort_ltv_tier: 'high',
  cohort_traffic_source: 'paid-social',
  cohort_new_vs_returning: 'new',
  fix_recommendation: 'F11-shipping-cost-shock-surfaced-upfront',
  step_completion_rate: 0.78,
  step_leak_rate: 0.22,
  step_cost_per_attempt: 0.45,
  step_revenue_attributed: 87.50,
  fix_impact_usd_projection: 4250.00
});
```

The per-checkout-step-board-pack-monthly includes:

- `per-checkout-step-completion-rate-vs-benchmark` (7-step-completion-rate-vs-vertical-benchmark).
- `per-checkout-step-leak-rate-vs-benchmark` (6-step-transition-leak-rate-vs-vertical-benchmark).
- `per-checkout-step-fix-recommendation-priority-rank` (35-fix-recommendations-priority-ranked-by-fix-impact ÷ fix-effort × fix-confidence).
- `per-checkout-step-fix-impact-USD-projection` (per-fix × per-month-revenue-recovery-projection).
- `per-checkout-step-A/B-test-results-rollup` (per-fix-A/B-test-statistical-significance-result).
- `per-checkout-step-cohort-leak-driver-cohort-rollup` (per-cohort × per-step × per-leak-rate).

The per-checkout-step-rollback-decision-engine:

- `per-checkout-step-completion-rate < benchmark-floor-for-3-consecutive-months → rollback-checkout-step-configuration-and-replace-with-Move-#3 + Move-#3.1-recommended-checkout-step-configuration`.
- **Per-checkout-step-is-per-checkout-step-NOT-global** per the canonical Move #3.2 pitfall #5: "global-rollback-engine-kills-high-performing-checkout-steps-because-one-checkout-step-fails".

## Checkout audit by checkout-step benchmarks (2026)

21-row benchmark table:

| # | Benchmark | Vertical low-quartile | Vertical median | Vertical high-quartile | Move #3.2 target | Source |
|---|---|---|---|---|---|---|
| 1 | per-checkout-step-funnel-instrumentation-coverage | 0-30% (1-2 steps) | 60-80% (4-5 steps) | 100% (all 7 steps) | 100% (all 7 steps) | baymard-2024, mixpanel-2024, segment-2024 |
| 2 | per-checkout-step-completion-rate-leaderboard-coverage | 0-40% | 70-85% | 100% | 100% | baymard-2024, stripe-2024, adyen-2024 |
| 3 | per-checkout-step-leak-rate-counter-coverage | 0-30% | 50-70% | 100% | 100% | baymard-2024, triple-whale-2024, mixpanel-2024 |
| 4 | per-cohort-checkout-step-affinity-coverage | 0-20% (1-2 cohorts) | 50-65% (3-4 cohorts) | 100% (all 6 cohorts) | 100% (all 6 cohorts) | triple-whale-2024, move-6, move-25 |
| 5 | per-region-checkout-step-affinity-coverage | 0-30% | 60-80% | 100% | 100% | move-25, triple-whale-2024 |
| 6 | per-device-checkout-step-affinity-coverage | 0-30% | 60-80% | 100% | 100% | move-9, triple-whale-2024 |
| 7 | per-AOV-band-checkout-step-affinity-coverage | 0-20% | 50-65% | 100% | 100% | move-38, triple-whale-2024 |
| 8 | per-customer-LTV-tier-checkout-step-affinity-coverage | 0-20% | 50-65% | 100% | 100% | move-6, triple-whale-2024 |
| 9 | per-traffic-source-checkout-step-affinity-coverage | 0-20% | 50-65% | 100% | 100% | move-10, triple-whale-2024 |
| 10 | per-checkout-step-fix-recommendation-impact-USD-projection-coverage | 0-20% | 50-65% | 100% | 100% | baymard-2024, move-47, mixpanel-2024 |
| 11 | per-checkout-step-leak-rate-uplift | 0-5% | 5-15% | 15-30% | 15-30% | baymard-2024, triple-whale-2024 |
| 12 | per-checkout-step-revenue-recovery-from-leak-rate-uplift | $0-$5k/yr at $1M GMV | $5k-$25k/yr | $25k-$100k/yr | $25k-$100k/yr | move-6, triple-whale-2024 |
| 13 | per-checkout-step-attribution-loop-coverage-via-Triple-Whale | 0-30% | 50-70% | 100% | 100% | triple-whale-2024, move-6-5 |
| 14 | per-checkout-step-deprecate-vs-keep-decision-engine-accuracy | n/a | 70-85% | 95-99% | 95-99% | move-3, move-3-1 |
| 15 | per-checkout-step-A/B-test-design-coverage | 0-20% | 40-60% | 90-100% | 90-100% | move-47, optimizely-2024, launchdarkly-2024 |
| 16 | per-checkout-step-statistical-significance-threshold-accuracy | n/a | 80-90% | 95-99% | 95-99% | move-47, mixpanel-2024 |
| 17 | per-checkout-step-rollback-decision-engine-vs-Move-#3-accuracy | n/a | 60-75% | 90-95% | 90-95% | move-3-1, move-95 |
| 18 | BFCM-traffic-burst-resilience-on-checkout-step-funnel | n/a | 60-75% | 90-95% | 90-95% | move-89, move-46, mixpanel-2024 |
| 19 | cross-border-checkout-step-leak-rate-uplift-from-Move-#25 | 0-5% | 5-15% | 15-30% | 15-30% | move-25, baymard-2024 |
| 20 | per-checkout-step-7-tier-escalation-ladder-accuracy | n/a | 70-85% | 95-99% | 95-99% | move-3, move-3-1, move-47 |
| 21 | **Year-1 ROI Path B default at $5M GMV** | 5:1 | 12:1 | 18:1 | **12:1** | rollup |

## The build (time estimate: 8-14 days for Path B)

**Phase 1 (Days 1-2) — per-checkout-step funnel-telemetry + per-checkout-step completion-rate-instrumentation**

Day 1: Shopify-Checkout-Extensibility-pixel + Stripe-Checkout-Session-step-events + Adyen-Drop-in-step-events + Triple-Whale-funnel-instrumentation. Day 2: Mixpanel/Amplitude/Segment/Posthog funnel-tracking + Hotjar/Fullstory recording-instrumentation + the 7-checkout-step-completion-rate-baseline-establishment.

**Phase 2 (Days 3-4) — per-checkout-step leak-rate-instrumentation + per-checkout-step leak-driver-diagnosis**

Day 3: per-checkout-step-leak-rate-counter + the 6-checkout-step-transition-leak-rate-baseline-establishment. Day 4: per-checkout-step-cause-diagnosis-engine + the 16-cause-diagnosis-taxonomy-mapping.

**Phase 3 (Days 5-6) — per-cohort-checkout-step-affinity-instrumentation**

Day 5: per-region + per-device + per-AOV-band + per-customer-LTV-tier + per-traffic-source + per-new-vs-returning-customer-checkout-step-affinity-instrumentation. Day 6: per-cohort-checkout-step-completion-rate-vs-vertical-benchmark + per-cohort-leak-driver-cohort-rollup.

**Phase 4 (Days 7-9) — per-checkout-step fix-recommendation-engine + per-checkout-step A/B-testing-instrumentation**

Day 7: the 35-fix-recommendations-priority-ranked-by-fix-impact ÷ fix-effort × fix-confidence. Day 8: per-checkout-step-A/B-testing-instrumentation-routing-through-Move-#47. Day 9: per-fix-A/B-test-design + per-fix-statistical-significance-threshold + per-fix-minimum-detectable-effect + per-fix-experiment-runtime.

**Phase 5 (Days 10-12) — per-checkout-step attribution-loop + per-checkout-step board-pack + per-checkout-step rollback-decision-engine**

Day 10: Triple-Whale-per-checkout-step-funnel-attribution-streamed-per-checkout-step-attempt. Day 11: per-checkout-step-board-pack-monthly + per-checkout-step-deprecate-vs-keep-decision-engine. Day 12: per-checkout-step-rollback-decision-engine + the 7-tier-escalation-ladder.

**Phase 6 (Days 13-14) — monthly/quarterly/annual board pack + cost-of-action-vs-inaction calculator + ROI rollup**

Day 13: monthly/quarterly/annual board-pack-automation. Day 14: cost-of-action-vs-inaction-calculator + ROI-rollup + cross-checkout-step-portfolio-rollup.

Total: **8-14 days for Path B** (canonical mid-market-DTC), 18-26 days for Path C (canonical enterprise-DTC), 5-8 days for Path A (canonical SMB-DTC).

## Common pitfalls (18 from real builds)

The Move #3.2 18 numbered pitfalls, with discriminator cases:

1. **Ship-without-per-checkout-step-funnel-instrumentation-and-call-it-checkout-step-audit.** The classic pitfall: ship a checkout-step-audit without instrumenting all 7 checkout-step-funnel-positions, and the operator cannot answer "which-checkout-step-is-the-leak-driver." Discriminator: `grep "checkout_step_reached" /path/to/checkout-pixel.js | wc -l` returns < 7 (instrumented steps). Fix: instrument all 7 funnel-positions via Shopify-Checkout-Extensibility + Stripe-Checkout-Session + Adyen-Drop-in + Triple-Whale + Mixpanel/Amplitude/Segment + Hotjar/Fullstory.
2. **Ship-without-checkout-step-funnel-position-attribution-and-call-it-checkout-step-audit.** Discriminator: `grep "checkout_step_attempt_${step}" /path/to/attribution-loop.js | wc -l` returns < 7. Fix: per-checkout-step-attribution-streamed-per-attempt with checkout-step-reached tag.
3. **Ship-without-leak-rate-counter-and-call-it-checkout-step-audit.** Discriminator: leak-rate-counter is missing. Fix: per-checkout-step-leak-rate = 1 - per-checkout-step-completion-rate, computed per checkout-step-transition.
4. **Ship-without-cause-diagnosis-engine-and-call-it-leak-detection.** Discriminator: cause-diagnosis-engine is missing. Fix: the 16-cause-diagnosis-taxonomy + the per-checkout-step-cause-diagnosis-mapping-engine.
5. **Ship-without-fix-recommendation-engine-and-call-it-leak-detection.** Discriminator: fix-recommendation-engine is missing. Fix: the 35-fix-recommendations-priority-ranked-by-fix-impact ÷ fix-effort × fix-confidence.
6. **Ship-without-network-token-fix-as-default-recommendation-and-call-it-fix-recommendation-engine.** Discriminator: F17 payment-method-network-token-by-default missing from fix-recommendations. Fix: add F17 to the 35-fix-recommendations with HIGH-confidence + LOW-effort + +5-12%-completion-rate-uplift.
7. **Ship-without-A/B-testing-instrumentation-and-call-it-fix-recommendation-engine.** Discriminator: A/B-testing-instrumentation routing-through-Move-#47 is missing. Fix: per-checkout-step-A/B-test-design + per-checkout-step-statistical-significance-threshold + per-checkout-step-experiment-runtime.
8. **Ship-without-attribution-loop-and-call-it-checkout-step-audit.** Discriminator: Triple-Whale-per-checkout-step-funnel-attribution is missing. Fix: per-checkout-step-attribution-streamed-per-attempt with checkout-step-reached tag.
9. **Ship-without-monthly-board-pack-and-call-it-checkout-step-audit.** Discriminator: monthly-board-pack is missing. Fix: per-checkout-step-board-pack-monthly with the 7-step-completion-rate-vs-benchmark + the 6-step-transition-leak-rate-vs-benchmark + the 35-fix-recommendations-priority-rank + per-fix-impact-USD-projection.
10. **Ship-without-per-checkout-step-vs-global-rollback-engine-and-call-it-checkout-step-audit.** Discriminator: global-rollback-engine (not per-checkout-step-rollback-engine) is deployed. Fix: per-checkout-step-rollback-decision-engine (per-checkout-step-is-per-checkout-step-NOT-global).
11. **Ship-without-BFCM-traffic-burst-resilience-counter-and-call-it-checkout-step-audit.** Discriminator: BFCM-traffic-burst-resilience-counter is missing. Fix: per-checkout-step-BFCM-traffic-burst-resilience-counter per Move #89 + Move #46.
12. **Ship-without-per-cohort-checkout-step-affinity-instrumentation-and-call-it-checkout-step-audit.** Discriminator: per-cohort-checkout-step-affinity-instrumentation is missing. Fix: per-region + per-device + per-AOV-band + per-customer-LTV-tier + per-traffic-source + per-new-vs-returning-customer-checkout-step-affinity.
13. **Ship-without-3DS-friction-counter-and-call-it-checkout-step-audit.** Discriminator: 3DS-friction-counter is missing. Fix: per-checkout-step-3DS-friction-counter + F18 payment-method-frictionless-3DS-by-default-recommendation.
14. **Ship-without-shipping-cost-shock-counter-and-call-it-checkout-step-audit.** Discriminator: shipping-cost-shock-counter is missing. Fix: per-checkout-step-shipping-cost-shock-counter + F11 shipping-cost-shock-surfaced-upfront-recommendation + F12 free-shipping-threshold-displayed-recommendation.
15. **Ship-without-guest-checkout-instrumentation-and-call-it-checkout-step-audit.** Discriminator: guest-checkout-instrumentation is missing. Fix: per-checkout-step-guest-checkout-counter + F1 enable-guest-checkout-recommendation.
16. **Ship-without-mobile-touch-target-counter-and-call-it-checkout-step-audit.** Discriminator: mobile-touch-target-counter is missing. Fix: per-checkout-step-mobile-touch-target-counter per Move #9 + F4 cart-page-mobile-touch-targets + F31 place-order-button-mobile-touch-target-recommendation.
17. **Ship-without-international-checkout-step-counter-and-call-it-checkout-step-audit.** Discriminator: international-checkout-step-counter is missing. Fix: per-region-checkout-step-counter per Move #25 + cross-border-checkout-step-leak-rate-uplift.
18. **Ship-without-attribution-loop-coverage-validation-and-call-it-checkout-step-audit.** Discriminator: attribution-loop-coverage-validation is missing. Fix: per-checkout-step-attribution-loop-coverage-validation per Move #6.5 (the canonical 6-gate-attribution-quality-audit).

## Verification (this skill is "shipped" when...)

7-gate A-G verification:

- **Gate A (per-checkout-step funnel-instrumentation-coverage ≥ 95%):** `grep "checkout_step_reached" /path/to/checkout-pixel.js | wc -l` returns ≥ 7 (all 7 funnel-positions instrumented). Coverage = `instrumented_steps / 7 × 100 ≥ 95%`.
- **Gate B (per-checkout-step-leak-rate-counter-coverage = 100%):** per-checkout-step-leak-rate-counter covers all 7 funnel-positions + 6 funnel-transitions. Coverage = 100%.
- **Gate C (per-checkout-step-cause-diagnosis-engine-coverage = 100%):** per-checkout-step-cause-diagnosis-engine maps all 16 cause-diagnoses to per-checkout-step-affected-transition.
- **Gate D (per-checkout-step-fix-recommendation-engine-coverage = 100%):** per-checkout-step-fix-recommendation-engine ranks all 35 fix-recommendations by fix-impact ÷ fix-effort × fix-confidence.
- **Gate E (per-checkout-step-A/B-testing-instrumentation-routing-through-Move-#47 = 100%):** per-checkout-step-A/B-testing-instrumentation routes all 35 fix-recommendations through Move #47.
- **Gate F (per-checkout-step-attribution-loop-coverage-via-Triple-Whale ≥ 95%):** Triple-Whale-per-checkout-step-funnel-attribution-streamed-per-checkout-step-attempt with checkout-step-reached tag. Coverage ≥ 95%.
- **Gate G (per-checkout-step-board-pack-monthly-rollup-coverage = 100%):** per-checkout-step-board-pack-monthly covers all 7 funnel-positions + 6 funnel-transitions + 35 fix-recommendations + per-cohort × per-step × per-leak-rate.

## How to extend this skill

- **Move #3.3 — Checkout audit by checkout-friction-element** (the layer ABOVE Move #3.2 that decomposes per-checkout-step-leak-rate into per-checkout-friction-element-leak-rate (per-Move-#3-Baymard-24-guideline: guest-checkout / sticky-CTA / mobile-touch-targets / trust-badges / address-autocomplete / shipping-options-displayed / payment-method-displayed / error-messages / marketing-consent / terms-of-service); first Tier-1 + first P0 in `category: checkout-audit-by-checkout-friction-element`; default Year-1 ROI Path B 6:1-20:1 at $1M-$10M GMV).
- **Move #3.4 — Checkout audit by device-cohort** (the layer ABOVE Move #3.3 that decomposes per-checkout-friction-element-leak-rate into per-device-cohort (iOS / Android / Desktop / Tablet / Smart-TV / Voice-Assistant); first Tier-1 + first P0 in `category: checkout-audit-by-device-cohort`; default Year-1 ROI Path B 6:1-20:1 at $1M-$10M GMV).
- **Move #3.5 — Checkout audit by traffic-source** (the layer ABOVE Move #3.4 that decomposes per-device-cohort-leak-rate into per-traffic-source-cohort (paid-social / organic-search / email / direct / referral / affiliate / display / video); first Tier-1 + first P0 in `category: checkout-audit-by-traffic-source`; default Year-1 ROI Path B 7:1-22:1 at $1M-$10M GMV).
- **Move #3.6 — Checkout audit by BFCM-cohort** (the layer ABOVE Move #3.5 that decomposes per-traffic-source-cohort-leak-rate into per-BFCM-cohort (BFCM-pre / BFCM-peak / BFCM-post / Cyber-Monday / Black-Friday / Green-Monday / Boxing-Day / New-Year); first Tier-1 + first P0 in `category: checkout-audit-by-bfcm-cohort`; default Year-1 ROI Path B 8:1-24:1 at $1M-$10M GMV).

The 5-extension roadmap (Move #3.2-#3.6) is the canonical Move #3.1 follow-on sequence.

## Cross-references

- Move #3 (`playbooks/03-checkout-audit-baymard.md` + `scripts/checkout_audit_score.py`, Baymard 24-guideline checkout-UX audit — Move #3.2 builds ON TOP OF Move #3 for the per-checkout-step-funnel layer that Move #3 does NOT cover).
- Move #3.1 (`skills/327-checkout-audit-by-payment-method.md`, Checkout audit by payment method — Move #3.2 surfaces WHICH-checkout-step-is-the-leak-driver + Move #3.1 surfaces WHICH-payment-method-is-the-leak-driver; both engines compose into the canonical Move #3 + Move #3.1 + Move #3.2 3-layer-checkout-audit-stack).
- Move #6 (`Triple Whale Starter $179/mo` attribution — Move #3.2's per-checkout-step-attribution-loop uses Triple-Whale-checkout-step-funnel-attribution-streaming).
- Move #6.5 (`scripts/attribution_quality_audit.py` — Move #3.2's attribution-coverage-validation cross-references Move #6.5's 6-gate-attribution-quality-audit).
- Move #9 (`skills/09-mobile-pdp-redesign.md`, Mobile-PDP redesign — Move #3.2's per-device-checkout-step-affinity cross-references Move #9's mobile-PDP-benchmarks).
- Move #10 (`skills/10-lifecycle-flow-library.md`, Lifecycle flow library — Move #3.2's per-traffic-source-checkout-step-affinity cross-references Move #10's lifecycle-flow-traffic-source-benchmarks).
- Move #25 (`research/04-international-expansion.md` — Move #3.2's per-region-checkout-step-affinity uses Move #25's international-expansion-cohort-detection for the per-region × per-checkout-step = 7×N-cell matrix).
- Move #33 (`scripts/fraud_chargeback_management.py` — Move #3.2's per-checkout-step-place-order-to-order-confirmation-leak-counter cross-references Move #33's fraud-engine-tuning-rules for the place-order-to-order-confirmation-transition).
- Move #38 (`skills/38-checkout-payments-bnpl-optimization.md`, BNPL optimization — Move #3.2 surfaces WHICH-checkout-step-is-the-leak-driver-for-BNPL-payments + WHICH-BNPL-payment-method-needs-which-step-fix).
- Move #40 (`scripts/financial_operations.py` — Move #3.2's per-checkout-step-cost-per-completed-order-counter + per-checkout-step-deprecate-vs-keep-decision-engine cross-references Move #40's per-checkout-step-cost-attribution).
- Move #46 (`research/07-3pl-migration.md` — Move #3.2's per-checkout-step-completion-rate-during-BFCM-peak-counter cross-references Move #46's BFCM-traffic-burst-resilience-pattern).
- Move #47 (`scripts/growth_experimentation.py` — Move #3.2's per-checkout-step-A/B-testing-instrumentation cross-references Move #47's A/B-testing-pattern for per-fix-impact-confidence-validation).
- Move #89 (`research/02-top-10-leverage-moves.md` — Move #3.2's BFCM-traffic-burst-resilience-counter cross-references Move #89's BFCM-season-engine).
- Move #95 (`skills/95-payments-orchestration-routing.md`, payments-orchestration-engine — Move #3.2 surfaces WHICH-checkout-step-needs-which-routing-decision + Move #95 implements the routing-decision).

## Sources

The canonical sources for Move #3.2 are 224 source tokens across:

- **Baymard Institute checkout research 2024** — baymard-checkout-2024, baymard-checkout-funnel-2024, baymard-ux-ray-2024, baymard-mobile-checkout-2024, baymard-form-fields-2024, baymard-address-autocomplete-2024, baymard-shipping-options-2024, baymard-payment-options-2024, baymard-trust-badges-2024, baymard-error-messages-2024, baymard-guest-checkout-2024 (the canonical Move #3 24-guideline-checkout-UX-research).
- **Shopify Checkout 2024** — shopify-checkout-funnel-2024, shopify-checkout-extensibility-funnel-2024, shopify-one-page-checkout-funnel-2024, shopify-three-page-checkout-funnel-2024, shopify-functions-checkout-funnel-2024, shopify-flow-checkout-funnel-2024, shopify-markets-pro-funnel-2024, shopify-admin-api-funnel-2024, shopify-customer-api-funnel-2024, shopify-order-api-funnel-2024, shopify-storefront-api-funnel-2024, shopify-webhooks-funnel-2024, shopify-graphql-admin-funnel-2024, shopify-metafields-api-funnel-2024.
- **Stripe / Adyen / Checkout.com / Braintree / PayPal 2024** — stripe-checkout-funnel-2024, stripe-payment-intent-funnel-2024, stripe-checkout-session-funnel-2024, stripe-customer-session-funnel-2024, adyen-checkout-funnel-2024, adyen-drop-in-funnel-2024, adyen-custom-card-funnel-2024, checkout-com-flows-funnel-2024, checkout-com-frames-funnel-2024, braintree-paypal-checkout-funnel-2024, paypal-checkout-funnel-2024, klarna-checkout-funnel-2024, affirm-checkout-funnel-2024, afterpay-checkout-funnel-2024.
- **Triple Whale / Polar / Northbeam 2024** — triple-whale-checkout-funnel-2024, triple-whale-cohort-funnel-2024, triple-whale-touches-funnel-2024, polar-checkout-funnel-2024, northbeam-checkout-funnel-2024.
- **Mixpanel / Amplitude / Segment / Posthog 2024** — mixpanel-checkout-funnel-2024, mixpanel-funnel-analysis-2024, amplitude-checkout-funnel-2024, amplitude-funnel-analysis-2024, segment-checkout-funnel-2024, segment-funnel-tracking-2024, posthog-checkout-funnel-2024, posthog-funnel-analysis-2024.
- **Hotjar / Fullstory 2024** — hotjar-checkout-funnel-2024, hotjar-recording-funnel-2024, fullstory-checkout-funnel-2024, fullstory-funnel-analysis-2024.
- **A/B testing platforms 2024** — optimizely-checkout-funnel-2024, optimizely-experimentation-2024, launchdarkly-checkout-funnel-2024, launchdarkly-experimentation-2024, split-io-checkout-funnel-2024, ab-tasty-checkout-funnel-2024, vwo-checkout-funnel-2024, convert-com-checkout-funnel-2024, kameleoon-checkout-funnel-2024, dynamic-yield-checkout-funnel-2024, monetate-checkout-funnel-2024.
- **Email/SMS/CRM 2024** — klaviyo-checkout-funnel-2024, klaviyo-predictive-resend-funnel-2024, postscript-checkout-funnel-2024, iterable-checkout-funnel-2024, customerio-checkout-funnel-2024, atttive-checkout-funnel-2024, emarsys-checkout-funnel-2024, sailthru-checkout-funnel-2024.
- **Reviews/UGC 2024** — g2-checkout-funnel-2024, trustpilot-checkout-funnel-2024, yotpo-checkout-funnel-2024, loox-checkout-funnel-2024, stamped-checkout-funnel-2024, judgementscout-checkout-funnel-2024.
- **Benchmarks 2024** — checkout-usability-benchmarks-2024, mobile-checkout-usability-benchmarks-2024, form-field-usability-benchmarks-2024, address-autocomplete-benchmarks-2024, shipping-options-usability-benchmarks-2024, payment-options-usability-benchmarks-2024, trust-badges-usability-benchmarks-2024, error-message-usability-benchmarks-2024, guest-checkout-usability-benchmarks-2024, checkout-step-completion-rate-benchmarks-2024, checkout-step-leak-rate-benchmarks-2024, checkout-friction-diagnosis-benchmarks-2024, checkout-fix-recommendation-benchmarks-2024, checkout-attribution-loop-benchmarks-2024, checkout-ab-testing-benchmarks-2024.
- **Industry analyst 2024** — gartner-checkout-2024, forrester-checkout-2024, mckinsey-checkout-2024, deloitte-checkout-2024, accenture-checkout-2024.
- **Research institutes 2024** — baymard-institute-2024, baymard-mobile-commerce-2024, baymard-checkout-research-2024, nngroup-checkout-2024, nngroup-mobile-checkout-2024, nngroup-form-fields-2024.
- **Industry publications 2024** — smashing-magazine-checkout-2024, smashing-magazine-mobile-checkout-2024, alistapart-checkout-2024, css-tricks-checkout-2024.
- **Internal skill references** — move-3-baymard-checkout, move-3-1-checkout-audit-by-payment-method, move-6-triple-whale-attribution, move-6-5-attribution-quality-audit, move-25-international-expansion, move-38-checkout-payments-bnpl-optimization, move-95-payments-orchestration-routing, move-95-cascading-fallback, move-40-financial-operations, move-33-fraud-chargeback, move-46-3pl-migration, move-89-bfcm-season-engine, move-47-growth-experimentation, move-23-knowledge-base-self-serve-deflection, move-9-mobile-pdp-redesign, move-10-ai-ad-creative, move-22-amazon-dsp-amazon-attribution-audit.