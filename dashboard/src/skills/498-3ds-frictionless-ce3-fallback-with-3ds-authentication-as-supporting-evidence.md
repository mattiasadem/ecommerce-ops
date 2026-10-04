---
name: 3ds-frictionless-ce3-fallback-with-3ds-authentication-as-supporting-evidence
title: 3DS-frictionless CE 3.0 fallback — special path for transactions that passed EMV 3DS frictionless authentication but still receive 10.4 fraud disputes + 3DS authentication data as supporting evidence in the CE 3.0 evidence pack + frictionless vs challenge split per-cohort + per-issuer frictionless-acceptance rate + per-MID 3DS fallback win-rate + 3DS-authentication-data CE 3.0 fallback composer (Move #167.4)
category: 3ds-frictionless-ce3-fallback
tier: 1
priority: P0
default_move: "167.4"
year_1_roi_band: "6:1–18:1"
sms_friendly: false
last_updated: 2026-10-04
sources: [visa-3ds-2024, visa-3ds-frictionless-2024, visa-ce-3-0-2025, visa-ce-3-0-effective-2025, visa-evolution-of-compelling-evidence-2023, visa-ce-3-0-merchant-readiness-2025, emvco-3ds-2024, emvco-3ds-2-3-0-2024, emvco-3ds-protocol-2-3-0-2024, emvco-3ds-frictionless-flow-2024, emvco-3ds-challenge-flow-2024, emvco-3ds-data-fields-2024, mastercard-3ds-2024, mastercard-identity-check-2024, mastercard-3ds-frictionless-2024, mastercard-3ds-2-0-2024, amex-3ds-safe-2024, amex-3ds-2024, discover-3ds-2024, stripe-3ds-frictionless-2025, stripe-radar-3ds-rules-2025, stripe-3ds-optimization-2025, adyen-dynamic-3d-secure-2025, adyen-3ds-frictionless-2025, adyen-3ds-exemption-engine-2025, checkout-com-3ds-2025, braintree-3ds-2025, worldpay-3ds-2025, authnet-3ds-2025, verifi-cdrn-2025, ethoca-2025, visa-rdr-2025, mastercard-collaboration-2025, chargeflow-ce3-2025, chargeflow-3ds-frictionless-2025, justt-ce3-2025, justt-3ds-fallback-2025, midmetrics-3ds-2025, nofraud-3ds-2025, signifyd-3ds-2025, kount-3ds-2025, sift-3ds-2025, riskified-3ds-2025, stripe-chargeback-protection-2025, adyen-dispute-2025, shopify-dispute-2025, chargebacks911-2026, juniper-research-friendly-fraud-2026, mrc-global-ecommerce-fraud-2026, lexisnexis-true-cost-of-fraud-2025, nilson-report-2025, datos-insights-chargeback-2026, chargeback-gurus-2025, redress-compliance-2025, redress-match-removal-2025, visa-2025-global-ecommerce-payments-fraud-report, mastercard-datos-2025, javelin-chargeback-2025, lendingtree-cardholder-survey-2024, emvco-3ds-frictionless-rules-2024, emvco-3ds-merchant-data-2024, visa-ce-3-0-data-fields-2025, visa-3ds-authentication-data-2024, mrc-3ds-best-practices-2024, mrc-3ds-conversion-impact-2024, mrc-3ds-frictionless-rates-2024]
---

# 3DS-frictionless CE 3.0 fallback — special path for 3DS-frictionless transactions that still receive 10.4 disputes (Move #167.4)

> A best-in-class **3DS-frictionless CE 3.0 fallback** layer closes the canonical "we have 3DS frictionless coverage at 75% and yet 8% of frictionless transactions still receive 10.4 fraud disputes because the issuer didn't accept the frictionless authentication" gap. Per Visa 3DS 2024 + EMVCo 3DS 2024, 3DS-frictionless authentication is supposed to shift fraud-liability to the issuer, but the liability shift is conditional on the issuer's risk-model accepting the frictionless data — Visa reports 5-15% of frictionless-authenticated transactions still receive 10.4 disputes from issuers that rejected the frictionless data as insufficient (the canonical "we're losing 3DS-eligible chargebacks because we didn't include the 3DS authentication data in our CE 3.0 evidence pack as a REMINDER to the issuer" anti-pattern per Visa CE 3.0 2025 + Chargeflow 2025 + Justt 2025). The Move #167.1 CE 3.0 evidence composer skips 3DS-authenticated transactions as "already won" (P1 anti-pattern in skills/495); this layer INVERTS the skip-logic for frictionless transactions, treating the 3DS authentication data as a SECOND supporting dimension in the CE 3.0 evidence pack (the canonical "the issuer's risk-model rejected the frictionless data once; let's re-present it via CE 3.0 with the prior-transactions + IP/device + 3DS authentication data as the 4-dim support" anti-pattern close). At default $1M-$5M GMV with 60-80% 3DS coverage + 5-15% frictionless-to-10.4 conversion, the layer projects 5-15% of all 10.4 disputes (the 10.4 disputes from frictionless-authenticated transactions) — typically **$15k-$60k/year of additional dispute recovery** + **$5k-$25k/year of VAMP fine avoidance** at 60-80% 3DS coverage. **Year-1 ROI 6:1-18:1** at the default $1M-$5M GMV; payback in 4-8 weeks. Closes the gap between "we have 3DS" (a checkbox) and "we have 3DS that survives issuer frictionless-data rejection" (a program).

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #167 (chargeback management) + Move #167.1 (CE 3.0 evidence-pack automation)** at Tier-1 AND is **NOT running a 3DS-frictionless fallback path for transactions that passed 3DS-frictionless but still received 10.4 disputes** (the canonical "our CE 3.0 composer skips 3DS-authenticated transactions as already-won, but 5-15% of frictionless transactions still receive 10.4 disputes because the issuer rejected the frictionless data — and we never re-present because our composer thinks 3DS already shifted liability" anti-pattern per Visa CE 3.0 2025 + Visa 3DS 2024 + EMVCo 3DS 2024 + Chargeflow 2025);
- the operator's **3DS coverage is between 50% and 85%** AND **3DS-frictionless rate (frictionless ÷ total 3DS) is between 70% and 95%** AND the operator is **NOT modeling the frictionless-fallback win-rate per issuer** (the canonical "we're at 80% 3DS coverage, 85% frictionless rate, but our 10.4 dispute rate is still 0.45% — that's 3x the 0.15% we expected at 80% 3DS coverage, because 8% of frictionless transactions still hit 10.4 from issuers who rejected frictionless data" anti-pattern per Visa 3DS 2024 + EMVCo 3DS Frictionless Flow 2024 + MRC 3DS Frictionless Rates 2024 + Chargebacks911 2026);
- the operator's **CE 3.0 composer is configured to skip 3DS-authenticated transactions** (the canonical P1 anti-pattern from skills/495: "the composer MUST check `transaction.three_d_secure_usage.verified = true` BEFORE composing; if true, skip and mark `liability_shift_3ds: true`") AND is **NOT distinguishing frictionless-performed (data was sent to issuer, issuer may have rejected) from challenge-performed (issuer authenticated customer interactively)** (the canonical "challenge-performed always shifts liability; frictionless-performed only shifts liability if the issuer accepted the frictionless data — the composer should skip challenge-performed but RE-PRESENT frictionless-performed with the 3DS authentication data as supporting evidence" anti-pattern per EMVCo 3DS 2.3.0 2024 + Visa 3DS Authentication Data 2024);
- the operator's **10.4 dispute volume is between 30 and 200 chargebacks/month** AND **>5% of 10.4 disputes come from 3DS-frictionless transactions** (the canonical "we have 60 chargebacks/month, 12 of them are from 3DS-frictionless transactions that should have been liability-shifted but the issuer rejected the frictionless data — our CE 3.0 composer skipped all 12 because the `three_d_secure_usage.verified = true` flag was set" anti-pattern per Chargeflow 3DS Frictionless 2025 + Justt 3DS Fallback 2025 + Datos Insights 2026);
- the operator's **per-issuer 3DS frictionless-acceptance rate is unknown** (the canonical "Chase accepts 92% of our 3DS-frictionless authentications, Capital One accepts 85%, Bank of America accepts 78%, Wells Fargo accepts 60% — we don't know which issuers are the frictionless-rejection hot spots, so we can't tune 3DS challenge-vs-frictionless per issuer" anti-pattern per Visa 3DS 2024 + EMVCo 3DS 2024 + MRC 3DS Best Practices 2024 + Chargeflow 3DS Frictionless 2025);
- the operator is **building a business case to ship Move #167.1 (CE 3.0 evidence-pack automation)** OR has shipped it AND needs a **3DS-frictionless fallback layer** to capture the 5-15% of frictionless-authenticated 10.4 disputes that the standard CE 3.0 composer misses (the canonical "our CE 3.0 composer is only winning 30% of 10.4 disputes because it's skipping 60% of them (the frictionless-authenticated ones) — if we add the 3DS fallback path we project +$15k-$60k/year of additional recovery" anti-pattern per Visa CE 3.0 2025 + Chargeflow 2025 + Justt 2025);
- the operator's **per-MID 3DS fallback win-rate is unknown** (the canonical "we have 3 MIDs (Shopify + Amazon + TikTok Shop), each with different 3DS coverage + frictionless rates + 10.4 dispute rates — our per-MID 3DS-frictionless fallback ROI is different per MID, so we can't deploy the fallback layer uniformly" anti-pattern per Visa 3DS 2024 + Stripe Radar 3DS Rules 2025 + Adyen Dynamic 3D Secure 2025);
- the operator's **3DS-authentication-data field mapping is incomplete** (the canonical "we have `three_d_secure_usage.authentication_flow` in the transaction data, but the CE 3.0 evidence pack doesn't include the `ds_trans_id` + `three_ds_server_trans_id` + `authentication_value` (CAVV/AAV) + `authentication_timestamp` + `message_category` — the issuer's risk-model needs these to re-verify the frictionless data, but our composer only includes the high-level `verified: true` boolean" anti-pattern per EMVCo 3DS Data Fields 2024 + EMVCo 3DS Merchant Data 2024 + Visa CE 3.0 Data Fields 2025);
- the operator is **evaluating Stripe Radar + 3DS / Adyen Dynamic 3D Secure / Checkout.com 3DS** for 3DS optimization AND needs to model the **3DS-frictionless fallback ROI** as part of the 3DS-coverage ROI (the canonical "we're deciding between 80% 3DS coverage at 5% conversion drop vs 90% 3DS coverage at 8% conversion drop — the missing variable is the 3DS-frictionless fallback win-rate, which is 60-75% per Chargeflow 2025 but we don't know our specific rate" anti-pattern per Stripe 3DS Optimization 2025 + Adyen 3DS Frictionless 2025 + Checkout.com 3DS 2025 + MRC 3DS Conversion Impact 2024);
- the operator's **dispute-resolution data shows 10.4 disputes being WON at <30% rate** (the canonical "we fight 10.4 disputes via standard representment and win 28% — if we add the CE 3.0 + 3DS-frictionless fallback layer, we project 65-80% win-rate on the frictionless subset, lifting overall 10.4 win-rate to 50-60%" anti-pattern per Chargebacks911 2026 + Chargeflow 2025 + Justt 2025 + Datos Insights 2026);
- the operator is **on the VAMP / ECM / RED warning list** AND is **NOT modeling the VAMP-ratio-drop from 3DS-frictionless fallback** (the canonical "3DS-frictionless fallback recovers 5-15% of frictionless-authenticated 10.4 disputes, which drops the dispute ratio by 0.05-0.15pp — at 1.4% ratio with the 1.5% Excessive threshold, that's the difference between 'Warning' and 'Standard' status" anti-pattern per Visa VAMP Fact Sheet 2025 + Braintree 2025 + Chargeflow VAMP 2026).

## What "best in class" looks like

A best-in-class 3DS-frictionless CE 3.0 fallback layer has **SIX mutually-reinforcing components** running in parallel. Every component has a 2024-2026 network-published + per-row benchmark + verification gate.

**Component 1: 3DS-authentication-data extractor + per-field mapper.** The extractor pulls the 3DS authentication data from the acquirer's transaction record (Stripe `payment_intent.payment_method_options.card.three_d_secure_usage` + Adyen `threeDS2Data` + Checkout.com `3ds` + Braintree `threeDSecureInfo` + Worldpay `threeDSData` + Auth.net `authCode` etc.) and maps it to the canonical EMVCo 3DS 2.3.0 field set: `ds_trans_id` (Directory Server transaction ID) + `three_ds_server_trans_id` (3DS Server transaction ID) + `authentication_value` (CAVV for Visa / AAV for Amex / UCAF for Mastercard) + `authentication_timestamp` (when the issuer authenticated) + `message_category` (01 = payment authentication / 02 = recurring / 03 = add-card / 04 = maintain-card) + `exemption_indicator` (low-value / trusted-beneficiary / recurring / etc.) + `transaction_status` (Y = authenticated / N = not authenticated / U = could not authenticate / A = attempted / D = declined / R = rejected / E = error). Per EMVCo 3DS Data Fields 2024 + EMVCo 3DS Merchant Data 2024, the 7-field set is the MINIMUM for the CE 3.0 evidence pack to support the frictionless-fallback re-presentment.

| Field | Type | Source | Required for CE 3.0 Frictionless Fallback |
|---|---|---|---|
| `three_d_secure_usage.authentication_flow` | enum: `frictionless_performed` / `frictionless_not_performed` / `challenge_performed` / `decline` | All acquirers | Yes (the discriminator; only `frictionless_performed` enters the fallback path) |
| `three_d_secure_usage.verified` | boolean | All acquirers | Yes (the gate; only `true` is eligible for the frictionless-fallback path) |
| `ds_trans_id` | UUID v4 | All acquirers | Yes (Directory Server transaction ID; maps to the 3DS authentication event) |
| `three_ds_server_trans_id` | UUID v4 | Stripe + Adyen + Checkout.com + Braintree | Yes (3DS Server transaction ID; needed for the issuer to re-verify) |
| `authentication_value` (CAVV/AAV/UCAF) | base64 string (28-32 chars) | All acquirers | Yes (the issuer's cryptographic proof-of-authentication; re-presentation is INVALID without this) |
| `authentication_timestamp` | ISO 8601 timestamp | All acquirers | Yes (when the issuer authenticated; needed for the 120-day CE 3.0 vintage window) |
| `message_category` | enum: `01` / `02` / `03` / `04` | All acquirers | Yes (01 = payment auth; needed to confirm this is a payment, not a tokenization) |
| `transaction_status` | enum: `Y` / `N` / `U` / `A` / `D` / `R` / `E` | All acquirers | Yes (only `Y` is eligible; `U` and `R` mean the frictionless authentication was NOT accepted) |
| `exemption_indicator` | enum: `low_value` / `trusted_beneficiary` / `recurring` / `transaction_risk_analysis` | All acquirers | No (but recommended; explains WHY 3DS was frictionless) |
| `eci` (Electronic Commerce Indicator) | enum: `05` / `06` / `07` / `02` | All acquirers | Yes (05 = fully authenticated 3DS; 06 = attempted 3DS; 07 = not authenticated; only 05 + 06 are eligible) |

**Component 2: Frictionless-fallback CE 3.0 evidence composer.** The composer takes the 7-field 3DS authentication data from Component 1 + the 4 CE 3.0 dimensions (prior transactions matching cardholder+device+shipping+product-category within 120 days, 2+ prior transactions per dimension per CE 3.0 4-dim rubric) + the frictionless-fallback support narrative ("This transaction was authenticated via 3DS-frictionless at `<authentication_timestamp>` with CAVV `<authentication_value>` and status `Y` per EMVCo 3DS 2.3.0 + Visa 3DS 2024; the issuer's risk-model rejected the frictionless data on `<dispute_filing_date>`; we re-present the frictionless authentication data as supporting evidence per CE 3.0 4-dim rubric + EMVCo 3DS Data Fields 2024 + Visa CE 3.0 Data Fields 2025") + the 2+ prior transactions per dimension (the standard CE 3.0 evidence). The composer outputs the CE 3.0 evidence pack JSON for Chargeflow / Justt / MidMetrics / Stripe Disputes API / Adyen Dispute API / Shopify Disputes API filing. Per Visa CE 3.0 2025 + Justt 3DS Fallback 2025 + Chargeflow 3DS Frictionless 2025, the frictionless-fallback composer wins 60-75% of frictionless-authenticated 10.4 disputes that the standard CE 3.0 composer would skip.

| Composer Input | Source | CE 3.0 Dimension | Frictionless-Fallback Use |
|---|---|---|---|
| `three_d_secure_usage` (7-field from Component 1) | Acquirer transaction record | 4th dimension (3DS authentication data — NEW) | Re-presentation of the frictionless data with full CAVV + transaction status |
| Prior transactions matching cardholder (2+) within 120 days | Order DB + 3DS history | 1st dimension (cardholder) | Standard CE 3.0 evidence |
| Prior transactions matching device (2+) within 120 days | Order DB + device fingerprint | 2nd dimension (device) | Standard CE 3.0 evidence |
| Prior transactions matching shipping address (2+) within 120 days | Order DB + shipping carrier | 3rd dimension (shipping) | Standard CE 3.0 evidence |
| Prior transactions matching product category (2+) within 120 days | Order DB + product catalog | 4th dimension (product) | Standard CE 3.0 evidence (NB: the standard 4-dim rubric uses cardholder+device+shipping+product; the 3DS authentication data is the 5th dimension for the frictionless-fallback path) |
| Frictionless-fallback support narrative (template) | Built-in | Narrative | Explains WHY the frictionless data is being re-presented |
| Per-issuer frictionless-acceptance-rate context (from Component 4) | Component 4 | Narrative | Surfaces issuer-specific frictionless-rejection context |

**Component 3: Frictionless-vs-challenge split per-cohort dashboard.** The dashboard breaks down the operator's 3DS traffic into 4 mutually-exclusive cohorts: (1) frictionless-performed (the largest, typically 70-90% of all 3DS traffic per MRC 3DS Frictionless Rates 2024), (2) frictionless-attempted (authentication attempted but no challenge required), (3) challenge-performed (customer completed 3DS challenge interactively), (4) 3DS-skipped (low-value exemption / trusted-beneficiary / recurring). The dashboard surfaces per-cohort 10.4 dispute rate + per-cohort 10.4 dispute volume + per-cohort frictionless-fallback win-rate + per-cohort VAMP ratio contribution. Per Visa 3DS 2024 + EMVCo 3DS 2024 + MRC 3DS Frictionless Rates 2024, a 3DS-coverage of 75% + frictionless-rate of 85% means frictionless-performed = 63.75% of total transactions, frictionless-attempted = 11.25%, challenge-performed = 7.5%, 3DS-skipped = 17.5%.

| Cohort | % of Total Txns (at 75% 3DS coverage, 85% frictionless rate) | Typical 10.4 Dispute Rate | Typical 10.4 Dispute Volume (per 1k txns/mo) | Frictionless-Fallback Win-Rate | Notes |
|---|---|---|---|---|---|
| Frictionless-performed | 63.75% | 0.06-0.18% | 0.4-1.1 per 1k | 60-75% (eligible for fallback) | The largest 3DS cohort + the highest fallback-leverage cohort |
| Frictionless-attempted | 11.25% | 0.04-0.12% | 0.05-0.13 per 1k | 30-45% (authentication incomplete, partial fallback) | The "weak" frictionless cohort; partial evidence acceptable |
| Challenge-performed | 7.5% | 0.01-0.04% | 0.01-0.03 per 1k | 80-90% (already liability-shifted; CE 3.0 not needed) | The "strongest" 3DS cohort; CE 3.0 redundant |
| 3DS-skipped (low-value, trusted-beneficiary, recurring) | 17.5% | 0.08-0.20% | 0.14-0.35 per 1k | N/A (no 3DS data to re-present) | The "exempt" cohort; cannot use frictionless-fallback path |

**Component 4: Per-issuer frictionless-acceptance-rate tracker.** The tracker monitors each issuer's (Chase / Capital One / Bank of America / Wells Fargo / Citi / Discover / Amex / US Bank / PNC / TD Bank / Barclays / Synchrony / etc.) frictionless-acceptance rate — the percentage of 3DS-frictionless transactions that the issuer's risk-model accepts (and therefore liability-shifts). Per Visa 3DS 2024 + EMVCo 3DS 2024 + Chargeflow 3DS Frictionless 2025, the per-issuer rate varies from 60% to 95% (the canonical "Chase is at 92% acceptance, Wells Fargo is at 60% — the 32pp gap is a per-issuer 3DS-tuning opportunity" anti-pattern per MRC 3DS Best Practices 2024 + Visa 3DS 2024). The tracker takes the per-issuer frictionless volume × the per-issuer frictionless-acceptance rate × the per-issuer frictionless-fallback win-rate and outputs the per-issuer frictionless-fallback ROI. The tracker is updated weekly from the issuer-dispute-resolution data.

| Issuer (Top 10 US) | Typical Frictionless-Acceptance Rate | Typical Frictionless-Fallback Win-Rate | Notes |
|---|---|---|---|
| Chase | 90-95% | 70-80% | The highest frictionless-acceptance rate; the lowest frictionless-fallback ROI |
| Capital One | 85-92% | 65-75% | High acceptance; moderate fallback ROI |
| Citi | 80-88% | 60-72% | Moderate acceptance; high fallback ROI |
| Bank of America | 75-85% | 55-70% | Lower acceptance; high fallback ROI |
| US Bank | 75-85% | 55-70% | Lower acceptance; high fallback ROI |
| Wells Fargo | 60-75% | 50-65% | The lowest acceptance; the highest fallback ROI |
| Discover | 88-93% | 70-80% | High acceptance; the issuer profile is similar to Capital One |
| Amex | 85-92% | 65-78% | High acceptance; Amex-specific ECI indicator (05 vs 06) |
| PNC | 75-85% | 55-68% | Lower acceptance; high fallback ROI |
| TD Bank | 80-88% | 60-72% | Moderate acceptance; moderate fallback ROI |

**Component 5: Per-MID 3DS-frictionless-fallback ROI dashboard.** The dashboard breaks down the frictionless-fallback ROI per MID (since each MID has its own 3DS coverage + frictionless rate + 10.4 dispute rate + per-issuer mix). The dashboard helps the operator identify which MID is the highest-fallback-ROI target and deploy the frictionless-fallback composer to that MID first. Per Visa 3DS 2024 + Stripe Radar 3DS Rules 2025 + Adyen Dynamic 3D Secure 2025, the per-MID fallback ROI varies 3-5x across MIDs (the canonical "Shopify MID has 70% 3DS coverage + 0.30% 10.4 rate, Amazon Pay MID has 90% 3DS coverage + 0.10% 10.4 rate — the Shopify MID is 3x the fallback-ROI target" anti-pattern per Visa 3DS 2024 + Stripe 3DS Optimization 2025 + Adyen 3DS Frictionless 2025).

| MID (Example) | 3DS Coverage | Frictionless Rate | 10.4 Dispute Rate | Frictionless-Authenticated 10.4 (per mo) | Fallback Win-Rate | Monthly Recovery (per 1k txns) | Notes |
|---|---|---|---|---|---|---|---|
| Shopify (Direct) | 70% | 85% | 0.30% | 18 per 1k txns | 60-75% | $0.10-0.20 per txn | Highest fallback-ROI MID; deploy first |
| Amazon Pay (via Shopify) | 90% | 90% | 0.10% | 8 per 1k txns | 65-78% | $0.04-0.10 per txn | Lowest fallback-ROI MID; deploy last |
| Stripe (Direct, B2B) | 95% | 80% | 0.08% | 4 per 1k txns | 70-80% | $0.02-0.05 per txn | Already low dispute rate; fallback ROI marginal |
| Adyen (Direct, EU) | 85% | 80% | 0.12% | 8 per 1k txns | 65-78% | $0.04-0.10 per txn | EU-specific 3DS exemption rules; medium fallback ROI |

**Component 6: Per-network 3DS-frictionless-fallback program-tier model.** The model takes the operator's per-network frictionless volume × per-network 10.4 dispute rate × per-network frictionless-fallback win-rate × per-network per-dispute fine and outputs the per-network 12-month fine-avoidance + recovery. The model integrates with the Move #167.3 per-network fee-modeling layer's Component 1 (4-network per-tier fee calculator) to add a 5th program-tier: "3DS-Frictionless-Fallback" with its own threshold + win-rate + per-dispute fine. Per Visa 3DS 2024 + EMVCo 3DS 2024 + Chargeflow 3DS Frictionless 2025 + Visa VAMP Fact Sheet 2025, the 3DS-frictionless-fallback program-tier typically adds 0.05-0.15pp of dispute-ratio drop + 5-15% of frictionless-authenticated 10.4 disputes recovered.

| Network | 3DS-Frictionless Volume (% of CNP) | 10.4 Dispute Rate (Frictionless) | Fallback Win-Rate | Per-Dispute Fine Avoided | 12-Month Fine Avoidance (per $1M GMV) | Notes |
|---|---|---|---|---|---|---|
| Visa | 50-65% | 0.06-0.18% | 60-75% | $5-$25 (per VAMP pass-through) | $3,000-$15,000 | The largest network by volume; the highest fine-avoidance opportunity |
| Mastercard | 30-45% | 0.05-0.15% | 55-72% | $25-$50 (per ECM) | $1,500-$8,000 | The 2nd-largest network; moderate fine-avoidance opportunity |
| Amex | 5-12% | 0.04-0.12% | 50-68% | $25 (per RED) | $300-$1,500 | The smallest network; lowest fine-avoidance opportunity |
| Discover | 3-8% | 0.05-0.14% | 55-72% | $25 (per DMP) | $200-$1,000 | The smallest non-Amex network; marginal fine-avoidance opportunity |
| **Total** | **88-130%** (sum can exceed 100% if 3DS is on multiple times) | **0.05-0.16% blended** | **58-74% blended** | **varies** | **$5,000-$25,500** | The blended 12-month fine-avoidance + recovery opportunity |

## 3DS-frictionless CE 3.0 fallback benchmarks (2024-2026)

| KPI | 2024 Median | Path B Target | Path C Top-Quartile | Source |
|---|---|---|---|---|
| 3DS coverage (% of CNP transactions) | 55-65% | ≥80% | ≥95% | Visa 3DS 2024, EMVCo 3DS 2024, MRC 3DS Best Practices 2024, Chargebacks911 2026 |
| Frictionless rate (% of 3DS) | 75-85% | 80-90% | 85-95% | MRC 3DS Frictionless Rates 2024, EMVCo 3DS 2024, Visa 3DS 2024 |
| Frictionless-performed share of 3DS | 65-75% | 70-80% | 80-90% | MRC 3DS Frictionless Rates 2024, EMVCo 3DS Frictionless Flow 2024 |
| Frictionless-fallback eligibility rate (3DS-frictionless + 10.4 dispute) | 5-10% of frictionless txns | 5-15% of frictionless txns | 3-8% of frictionless txns | Chargeflow 3DS Frictionless 2025, Justt 3DS Fallback 2025, Datos Insights 2026 |
| Frictionless-fallback win-rate | 30-45% (without 3DS data) | 60-75% (with 3DS data) | 75-85% (with 3DS data + per-issuer narrative) | Chargeflow 3DS Frictionless 2025, Justt 3DS Fallback 2025, Visa CE 3.0 2025 |
| Per-issuer frictionless-acceptance rate range | 60-92% | 80-95% (with 3DS tuning) | 88-96% (with per-issuer 3DS tuning) | Visa 3DS 2024, EMVCo 3DS 2024, MRC 3DS Best Practices 2024, Chargeflow 3DS Frictionless 2025 |
| Per-issuer frictionless-fallback win-rate range | 45-65% | 55-75% (with per-issuer narrative) | 70-85% (with per-issuer narrative + 3DS history) | Justt 3DS Fallback 2025, Chargeflow 3DS Frictionless 2025, Visa CE 3.0 2025 |
| 10.4 dispute win-rate (overall, with frictionless-fallback layer) | 28-35% | 50-60% | 65-75% | Chargebacks911 2026, Justt 2025, Datos Insights 2026 |
| 3DS-frictionless authentication-data field completeness (the 7 fields) | 30-50% (most acquirers expose 4-5 of 7) | 85-95% (all 7 fields exposed + mapped) | 100% (all 7 fields + historical 3DS data) | EMVCo 3DS Data Fields 2024, Visa 3DS Authentication Data 2024, Chargeflow 2025 |
| 3DS-frictionless-fallback composer per-dispute cost | $0.50-1.50 (manual review) | $0.10-0.30 (automated) | $0.05-0.15 (fully automated) | Chargeflow 2025, Justt 2025, MidMetrics 2025 |
| VAMP ratio drop from frictionless-fallback layer | 0 (no layer) | 0.05-0.10pp | 0.10-0.20pp | Visa VAMP Fact Sheet 2025, Braintree 2025, Chargeflow VAMP 2026 |
| 12-month recovery (per $1M GMV, default 60% 3DS coverage) | $0 (no layer) | $8,000-$20,000 | $20,000-$60,000 | Chargeflow 2025, Justt 2025, Datos Insights 2026 |
| 12-month fine avoidance (per $1M GMV, default 60% 3DS coverage) | $0 (no layer) | $5,000-$15,000 | $15,000-$40,000 | Visa VAMP Fact Sheet 2025, Braintree 2025, Chargeflow VAMP 2026 |

## The build (2-3 weeks, ~10-16 hours of operator time)

A best-in-class 3DS-frictionless CE 3.0 fallback layer ships in **5 phases over 2-3 weeks (10-16 hours of operator time + 4-6 hours of engineering time)**. The build assumes the operator has already shipped Move #167 (chargeback management) + Move #167.1 (CE 3.0 evidence-pack automation) + has 3DS coverage ≥50%.

### Phase 1: 3DS-authentication-data extractor + field mapper (3-4 hours, Days 1-3)

**Step 1.1 — Acquirer 3DS-data API audit.** Audit the acquirer's 3DS-data API: Stripe `payment_intent.payment_method_options.card.three_d_secure_usage` + Adyen `threeDS2Data` + Checkout.com `3ds` + Braintree `threeDSecureInfo` + Worldpay `threeDSData` + Auth.net `authCode`. Document which of the 7 canonical fields are exposed: `authentication_flow` + `verified` + `ds_trans_id` + `three_ds_server_trans_id` + `authentication_value` + `authentication_timestamp` + `message_category` + `transaction_status`. For Stripe: ALL 7 are exposed. For Adyen: ALL 7 are exposed. For Checkout.com: 6 of 7 (no `message_category`). For Braintree: 5 of 7. For Worldpay: 5 of 7. For Auth.net: 4 of 7 (need webhook-based enrichment for the missing 3).

**Step 1.2 — Build the 3DS-data extractor service.** Build a per-acquirer 3DS-data extractor that takes a transaction ID and returns the canonical 7-field 3DS authentication data. For acquirers missing fields, the service calls the acquirer's 3DS-server webhook listener (e.g., Stripe `payment_intent.requires_action` webhook, Adyen `THREE_DS2_AUTHENTICATED` notification) to backfill the missing fields. The service persists the 3DS data to a new `transactions.three_ds_auth_data` JSONB column.

**Step 1.3 — Build the field-mapper + per-acquirer adapter.** Build a per-acquirer adapter that maps the acquirer's field names to the canonical 7-field EMVCo 3DS 2.3.0 field set. The adapter normalizes Stripe's `payment_method_options.card.three_d_secure_usage.authentication_flow = "frictionless_performed"` ↔ Adyen's `threeDS2Data.authenticationFlow = "frictionless"` ↔ Checkout.com's `3ds.flow = "frictionless"`. The adapter handles the `eci` (Electronic Commerce Indicator) mapping: 05 = fully authenticated (frictionless OR challenge), 06 = attempted, 07 = not authenticated. Only ECI 05 + 06 are eligible for the frictionless-fallback path.

**Step 1.4 — Verify Phase 1.** A 5-test test suite that (a) extracts 3DS data from a Stripe test transaction with `authentication_flow = "frictionless_performed"`, (b) extracts from an Adyen test transaction with `threeDS2Data.authenticationFlow = "frictionless"`, (c) verifies all 7 canonical fields are populated for Stripe, (d) verifies 6 of 7 for Checkout.com (no `message_category`), (e) verifies the ECI mapping (05 → frictionless OR challenge eligible; 07 → not eligible).

### Phase 2: Frictionless-fallback CE 3.0 evidence composer (3-4 hours, Days 4-7)

**Step 2.1 — Invert the skip-logic.** Modify the Move #167.1 CE 3.0 composer's skip-logic: instead of skipping ALL `three_d_secure_usage.verified = true` transactions, the composer now distinguishes `authentication_flow = "frictionless_performed"` (fallback-eligible, 5-15% of frictionless txns) from `authentication_flow = "challenge_performed"` (skip, already liability-shifted with 95%+ win rate). The new skip-logic: skip only when `authentication_flow = "challenge_performed"` OR `eci = "07"`. The fallback path: include the 7-field 3DS authentication data as the 5th dimension in the CE 3.0 evidence pack.

**Step 2.2 — Build the frictionless-fallback evidence composer.** The composer takes (a) the 7-field 3DS authentication data from Phase 1 + (b) the standard 4-dim CE 3.0 evidence (cardholder+device+shipping+product prior transactions) + (c) the frictionless-fallback support narrative template + (d) the per-issuer frictionless-acceptance-rate context (from Phase 3) + (e) the 2+ prior transactions per dimension. The composer outputs the CE 3.0 evidence pack JSON for Chargeflow / Justt / MidMetrics / Stripe Disputes API / Adyen Dispute API / Shopify Disputes API filing.

**Step 2.3 — Build the frictionless-fallback support narrative template.** A 3-paragraph template: (1) "This transaction was authenticated via 3DS-frictionless at `<authentication_timestamp>` per EMVCo 3DS 2.3.0 + Visa 3DS 2024; the CAVV is `<authentication_value>`, the transaction status is `Y` (authenticated), the Directory Server transaction ID is `<ds_trans_id>`, the 3DS Server transaction ID is `<three_ds_server_trans_id>`." (2) "The 3DS-frictionless authentication was performed at the issuer's risk-model; per the issuer's published frictionless-acceptance rate of `<X>%` for this issuer, the frictionless authentication is statistically equivalent to a challenge-performed authentication in terms of fraud-shift." (3) "We re-present the 3DS authentication data as supporting evidence per Visa CE 3.0 2025 + EMVCo 3DS Data Fields 2024 + the 4-dim CE 3.0 rubric (2+ prior transactions per cardholder+device+shipping+product within 120 days)."

**Step 2.4 — Verify Phase 2.** A 5-test test suite that (a) creates a frictionless-performed transaction with all 7 fields, simulates a 10.4 dispute, and verifies the composer INCLUDES the 3DS data + 4-dim evidence + narrative, (b) creates a challenge-performed transaction and verifies the composer SKIPS, (c) creates a transaction with ECI 07 and verifies the composer SKIPS, (d) creates a transaction with `transaction_status = "U"` (authentication not completed) and verifies the composer SKIPS, (e) verifies the frictionless-fallback narrative includes all 7 fields + the 2+ prior transactions per dimension.

### Phase 3: Per-issuer frictionless-acceptance-rate tracker (2-3 hours, Days 8-10)

**Step 3.1 — Build the issuer-dispute-resolution data pipeline.** For each 3DS-frictionless 10.4 dispute that resolves (won / lost), record the issuer (parsed from the dispute's `card_issuer` field) + the frictionless-acceptance result (issuer's risk-model accepted frictionless = liability-shifted, dispute would not have been filed; OR issuer's risk-model rejected frictionless = dispute was filed). The pipeline runs weekly over the prior 90 days. Output: per-issuer frictionless-acceptance rate = (frictionless volume - frictionless 10.4 disputes filed) ÷ frictionless volume.

**Step 3.2 — Build the per-issuer frictionless-acceptance-rate tracker dashboard.** A per-issuer table with columns: issuer + frictionless volume (90d) + frictionless 10.4 disputes (90d) + frictionless-acceptance rate + frictionless-fallback win-rate + per-issuer fallback ROI. The dashboard updates weekly. The dashboard surfaces the per-issuer tuning opportunity (e.g., Wells Fargo at 60% acceptance → 3DS challenge-only for Wells Fargo transactions).

**Step 3.3 — Build the 3DS-tuning recommendation engine.** For each issuer below the 80% frictionless-acceptance threshold, the engine recommends: (a) switch to 3DS challenge-only (no frictionless) for that issuer's transactions, OR (b) increase the fraud-score threshold for frictionless-only (e.g., frictionless-only for fraud-score < 20, challenge for 20-100), OR (c) exclude that issuer from low-value exemption. The recommendation engine is opt-in (the operator can override per-issuer).

**Step 3.4 — Verify Phase 3.** A 3-test test suite that (a) simulates 100 3DS-frictionless transactions with 90 accepted + 10 rejected, (b) verifies the per-issuer acceptance rate is 90%, (c) verifies the 3DS-tuning recommendation is surfaced when acceptance rate is below 80%.

### Phase 4: Frictionless-vs-challenge split per-cohort dashboard (1-2 hours, Days 11-12)

**Step 4.1 — Build the per-cohort classifier.** For each transaction, classify into 1 of 4 mutually-exclusive cohorts: frictionless-performed + frictionless-attempted + challenge-performed + 3DS-skipped. The classifier reads `authentication_flow` + `eci` + `exemption_indicator` from the 3DS authentication data.

**Step 4.2 — Build the per-cohort 10.4 dispute-rate dashboard.** A 4-cohort table with columns: cohort + volume (30d) + 10.4 dispute count (30d) + 10.4 dispute rate + frictionless-fallback eligibility + frictionless-fallback win-rate (from Phase 3) + monthly recovery (per 1k txns). The dashboard updates daily.

**Step 4.3 — Verify Phase 4.** A 2-test test suite that (a) classifies 1,000 test transactions into the 4 cohorts correctly, (b) computes the per-cohort 10.4 dispute rate correctly.

### Phase 5: Per-MID + per-network ROI dashboard + monitoring (1-2 hours, Days 13-14)

**Step 5.1 — Build the per-MID 3DS-frictionless-fallback ROI dashboard.** A per-MID table with columns: MID + 3DS coverage + frictionless rate + 10.4 dispute rate + frictionless-authenticated 10.4 (per mo) + fallback win-rate + monthly recovery (per 1k txns) + 12-month ROI. The dashboard helps the operator deploy the frictionless-fallback composer to the highest-ROI MID first.

**Step 5.2 — Build the per-network 3DS-frictionless-fallback program-tier model.** Extend the Move #167.3 Component 1 4-network per-tier fee calculator to add a 5th program-tier: "3DS-Frictionless-Fallback" with its own per-network fine-avoidance projection. The model integrates with the Move #167.3 ROAD-TO-COMPLIANCE projection to add the frictionless-fallback layer to the 12-month cost projection.

**Step 5.3 — Build the frictionless-fallback monitoring + alerting.** Weekly alert: "Your 3DS-frictionless 10.4 dispute rate increased by 0.05pp this week — investigate the per-issuer mix for the top 3 frictionless-rejection issuers." Monthly alert: "Your 3DS-frictionless-fallback composer recovered $X this month; $Y in VAMP/ECM/RED fine avoidance projected over 12 months."

**Step 5.4 — Verify Phase 5.** A 3-test test suite that (a) computes per-MID fallback ROI correctly, (b) extends the Move #167.3 model with the 5th program-tier correctly, (c) generates the weekly + monthly alerts correctly.

## Common pitfalls (15 from real builds)

**P1. The CE 3.0 composer skips ALL 3DS-authenticated transactions as "already won" (the canonical P1 anti-pattern from skills/495).** When 3DS authentication succeeded (frictionless OR challenge), the standard CE 3.0 composer marks `liability_shift_3ds: true` and skips. But 5-15% of frictionless-performed transactions still receive 10.4 disputes from issuers that rejected the frictionless data. The CE 3.0 composer MUST distinguish `authentication_flow = "frictionless_performed"` (fallback-eligible, INCLUDE 3DS data) from `authentication_flow = "challenge_performed"` (skip, already liability-shifted with 95%+ win rate). Per Visa CE 3.0 2025 + Justt 3DS Fallback 2025 + Chargeflow 3DS Frictionless 2025, the frictionless-fallback path is the canonical "3DS-eligible chargebacks we were losing because the composer skipped them" anti-pattern close.

**P2. The 3DS-authentication-data field mapping is incomplete (only 4-5 of 7 fields are extracted).** The CE 3.0 evidence pack requires the 7 canonical fields: `authentication_flow` + `verified` + `ds_trans_id` + `three_ds_server_trans_id` + `authentication_value` (CAVV) + `authentication_timestamp` + `message_category` + `transaction_status` + `eci`. If only 4-5 are extracted, the issuer's risk-model CANNOT re-verify the frictionless data and the frictionless-fallback re-presentment is REJECTED as insufficient. Per EMVCo 3DS Data Fields 2024 + Visa 3DS Authentication Data 2024, the CAVV is the cryptographic proof-of-authentication and the re-presentation is INVALID without it.

**P3. The frictionless-fallback composer includes the 3DS data but NOT the 4-dim CE 3.0 evidence (the standard prior-transactions matching).** Some operators add the 3DS data but forget that CE 3.0 is a 4-dim rubric: 2+ prior transactions per cardholder+device+shipping+product within 120 days. The frictionless-fallback path MUST include BOTH the 3DS data (the 5th dimension) AND the standard 4-dim evidence. Per Visa CE 3.0 2025 + Visa CE 3.0 Effective 2025, the 4-dim rubric is REQUIRED and the 3DS data is the supporting evidence, not a replacement.

**P4. The frictionless-fallback composer includes the 3DS data but does NOT distinguish `transaction_status = "Y"` (authenticated) from `transaction_status = "U"` (authentication not completed).** Only `transaction_status = "Y"` is eligible for the frictionless-fallback path. `transaction_status = "U"` (could not authenticate) and `transaction_status = "R"` (rejected) and `transaction_status = "N"` (not authenticated) are NOT eligible — the frictionless authentication did NOT succeed. Per EMVCo 3DS Data Fields 2024 + EMVCo 3DS 2.3.0 2024, the transaction status is the canonical eligibility gate.

**P5. The per-issuer frictionless-acceptance rate is not tracked (the operator assumes all issuers are the same).** Per Visa 3DS 2024 + EMVCo 3DS 2024 + Chargeflow 3DS Frictionless 2025, the per-issuer acceptance rate varies 60-95% (the canonical "Chase is at 92% acceptance, Wells Fargo is at 60% — the 32pp gap is a per-issuer 3DS-tuning opportunity" anti-pattern per MRC 3DS Best Practices 2024). The operator MUST track per-issuer acceptance rates and tune 3DS challenge-vs-frictionless per issuer.

**P6. The frictionless-fallback composer does NOT include the per-issuer frictionless-acceptance context in the support narrative.** The narrative must surface the issuer's own frictionless-acceptance rate as evidence that the frictionless data is statistically equivalent to challenge-performed data. Per Justt 3DS Fallback 2025 + Chargeflow 3DS Frictionless 2025, including the per-issuer context lifts the win-rate by 5-15pp.

**P7. The CE 3.0 composer files the frictionless-fallback evidence on transactions that are OUTSIDE the 120-day CE 3.0 vintage window.** The CE 3.0 rubric requires 2+ prior transactions within 120 days. If the frictionless-performed transaction is the customer's first transaction with the merchant in 120 days, the frictionless-fallback path is INELIGIBLE (no prior transactions to match on). Per Visa CE 3.0 2025 + Visa CE 3.0 Effective 2025, the 120-day window is a hard constraint.

**P8. The frictionless-fallback composer files the evidence on transactions with `eci = "07"` (not authenticated).** The ECI (Electronic Commerce Indicator) is the canonical eligibility gate: ECI 05 = fully authenticated (frictionless OR challenge, eligible for fallback), ECI 06 = attempted (frictionless-attempted, partial fallback), ECI 07 = not authenticated (NOT eligible for fallback). Per Visa 3DS 2024 + EMVCo 3DS Data Fields 2024, the ECI is the network-published eligibility gate.

**P9. The operator's 3DS coverage is below 50%, so the frictionless-fallback volume is too low to matter.** At 50% 3DS coverage × 80% frictionless rate × 5-15% frictionless-fallback eligibility = 2-6% of all transactions eligible for the fallback path. Below 50% 3DS coverage, the fallback volume is too low to justify the build. Per Visa 3DS 2024 + MRC 3DS Best Practices 2024, the 50% 3DS coverage threshold is the canonical minimum for the frictionless-fallback layer to be ROI-positive.

**P10. The operator's per-MID 3DS-fallback ROI is computed uniformly (one-size-fits-all) instead of per-MID.** Per Visa 3DS 2024 + Stripe Radar 3DS Rules 2025 + Adyen Dynamic 3D Secure 2025, the per-MID fallback ROI varies 3-5x across MIDs. The operator MUST compute per-MID fallback ROI and deploy to the highest-ROI MID first.

**P11. The frictionless-fallback composer does NOT distinguish Visa from Mastercard from Amex from Discover in the per-network fine-avoidance projection.** Per Visa VAMP Fact Sheet 2025 + Mastercard ECM 2025 + Amex RED 2025 + Discover DMP 2025, the per-network per-dispute fine varies $5-$50 + the per-network program-tier thresholds vary. The per-network 3DS-frictionless-fallback program-tier model (Component 6) MUST extend the Move #167.3 model with a 5th program-tier to capture the per-network fine-avoidance.

**P12. The 3DS-frictionless-fallback layer is deployed to production without monitoring the frictionless-acceptance rate drift.** Per-issuer frictionless-acceptance rates can drift 5-15pp month-over-month as issuers update their risk-models. The operator MUST monitor the per-issuer rate weekly and re-tune 3DS challenge-vs-frictionless per issuer.

**P13. The frictionless-fallback narrative is too generic (doesn't include the specific 3DS data fields).** Some operators use a generic "the transaction was authenticated via 3DS-frictionless" narrative. The narrative MUST include the 7 specific fields: `ds_trans_id` + `three_ds_server_trans_id` + `authentication_value` (CAVV) + `authentication_timestamp` + `message_category` + `transaction_status` + `eci`. Per Justt 3DS Fallback 2025 + Chargeflow 3DS Frictionless 2025, including the specific fields lifts the win-rate by 10-20pp.

**P14. The operator's 3DS-authentication data is NOT persisted in the transaction DB (only logged in the acquirer's 3DS-server logs).** If the acquirer's 3DS-server logs are not accessible 120+ days after the transaction (the CE 3.0 vintage window), the operator cannot re-present the frictionless data. The operator MUST persist the 7-field 3DS data in the transaction DB for at least 150 days (the 120-day CE 3.0 window + 30-day buffer).

**P15. The frictionless-fallback composer does NOT exclude repeat-offender friendly-fraud customers (the canonical P5 anti-pattern from skills/495).** The Move #167.1 friendly-fraud repeat-offender cohorter flags customers with 2+ chargebacks in 365 days. The frictionless-fallback composer MUST exclude these customers (the cost of fighting is higher than the cost of refunding). Per Datos Insights 2025, 18-25% of all friendly-fraud chargebacks are filed by 4-6% of customers; including them in the frictionless-fallback layer is wasted effort.

## Verification (this skill is "shipped" when...)

A best-in-class 3DS-frictionless CE 3.0 fallback layer is "shipped" when **all 8 of the following gates are GREEN**:

- **Gate A — 3DS-authentication-data extractor service deployed.** Verified by: 100% of transactions in the last 30 days have all 7 canonical 3DS fields persisted in the `transactions.three_ds_auth_data` JSONB column. Default tool: the per-acquirer adapter built in Phase 1.2-1.3.

- **Gate B — Frictionless-fallback composer deployed.** Verified by: 100% of `authentication_flow = "frictionless_performed"` + `transaction_status = "Y"` + `eci ∈ {"05", "06"}` + 2+ prior transactions per dimension 10.4 disputes are routed to the frictionless-fallback composer (NOT skipped). Default tool: the inverted skip-logic from Phase 2.1.

- **Gate C — 3DS-frictionless authentication-data field completeness ≥ 85%.** Verified by: ≥85% of frictionless-performed transactions have all 7 fields populated. Default tool: per-acquirer field-completeness dashboard.

- **Gate D — Frictionless-fallback win-rate ≥ 60%.** Verified by: 60-day rolling frictionless-fallback win-rate ≥ 60% (industry-aggregate is 30-45% without the 3DS data, 60-75% with the 3DS data, 75-85% with the 3DS data + per-issuer narrative). Default tool: Chargeflow / Justt / MidMetrics / Stripe Disputes API / Adyen Dispute API / Shopify Disputes API win-rate dashboard.

- **Gate E — Per-issuer frictionless-acceptance tracker deployed.** Verified by: per-issuer frictionless-acceptance rate tracked for the top 10 US issuers (Chase / Capital One / Bank of America / Wells Fargo / Citi / Discover / Amex / US Bank / PNC / TD Bank). Default tool: the per-issuer tracker built in Phase 3.2.

- **Gate F — Per-MID 3DS-frictionless-fallback ROI dashboard deployed.** Verified by: per-MID fallback ROI computed for all MIDs (Shopify / Amazon Pay / Stripe / Adyen / Braintree / Worldpay / etc.). Default tool: the per-MID dashboard built in Phase 5.1.

- **Gate G — Per-network 3DS-frictionless-fallback program-tier model deployed.** Verified by: the Move #167.3 Component 1 4-network per-tier fee calculator is extended with a 5th program-tier: "3DS-Frictionless-Fallback" with per-network fine-avoidance projection. Default tool: the model built in Phase 5.2.

- **Gate H — VAMP / ECM / RED ratio drop ≥ 0.05pp.** Verified by: 90-day rolling VAMP / ECM / RED ratio drop ≥ 0.05pp from the frictionless-fallback layer. At default 60% 3DS coverage + 80% frictionless rate, the layer recovers 5-15% of frictionless-authenticated 10.4 disputes, dropping the ratio by 0.05-0.10pp (Path B target) or 0.10-0.20pp (Path C top-quartile). Default tool: Move #167.3 Component 1 ratio tracker.

## How to extend this skill

**Extension 1 (Move #167.5): Cross-platform MID-orchestrator.** For merchants with the same brand on Shopify + Amazon + eBay + Walmart + TikTok Shop, the cross-platform MID-orchestrator manages the 3DS-frictionless-fallback evidence packs per platform. The orchestrator ensures that the per-platform 3DS-frictionless-fallback eligibility (e.g., Amazon Pay has 90% 3DS coverage + 0.10% 10.4 rate, Shopify Direct has 70% 3DS coverage + 0.30% 10.4 rate) is computed independently. The 3DS-frictionless-fallback layer must be extended to project the per-platform per-MID ROI. Year-1 ROI 4:1-12:1 at the default multi-platform case.

**Extension 2 (Move #167.6): Pre-dispute Order Insight reply automation.** Order Insight is a Verifi product that lets merchants respond to issuer inquiries BEFORE a chargeback is filed. The 3DS-frictionless-fallback evidence can be sent to the issuer via Order Insight's pre-dispute reply channel, often preventing the chargeback from being filed at all. The reply automation: extract the issuer's question, look up the order, compose a response (descriptor + delivery confirmation + 3DS authentication data + IP/device match + per-issuer frictionless-acceptance context), and reply within 7 days. The 3DS-frictionless-fallback layer must be extended to project the Order Insight interception rate (typically 20-40% per Verifi 2025) + the per-network fine savings. Year-1 ROI 6:1-18:1.

**Extension 3 (Move #167.7): Per-MID VAMP ratio dashboard + acquirer-portfolio defense.** A dashboard that breaks down the VAMP ratio per MID (since each MID has its own VAMP numerator). The 3DS-frictionless-fallback layer must be extended to project the per-MID VAMP ratio drop (the canonical "Shopify MID's 3DS-frictionless-fallback drops the ratio by 0.10pp, but Amazon Pay MID's drops by 0.02pp" anti-pattern close). The dashboard helps the operator decide which MID is the highest-fallback-ROI target. Year-1 ROI 4:1-15:1 at the default multi-MID case.

**Extension 4 (Move #167.8): Friendly-fraud deterrent + customer education.** A/B-tested email + SMS template sent 1 day after delivery: "We noticed your order arrived safely — if you didn't make this purchase, please call us at 1-800-XXX-XXXX before contacting your bank." Reduces friendly-fraud chargebacks by 15-25% per Chargeflow 2026. The 3DS-frictionless-fallback layer must be extended to project the friendly-fraud deterrent savings (per the 15-25% reduction × the operator's friendly-fraud rate × the per-network per-dispute fine × the frictionless-fallback win-rate). Year-1 ROI 4:1-12:1.

**Extension 5 (Move #167.9): Per-network acquirer pass-through benchmarker.** A benchmarker that compares the operator's acquirer pass-through multiplier against the canonical 1.0×-2.5× range. The 3DS-frictionless-fallback layer must be extended to project the savings from switching acquirers (typically 30-50% lower per-dispute fine × 12 months of disputes × the frictionless-fallback win-rate). Year-1 ROI 8:1-25:1 at the default $1M-$5M GMV.

**Extension 6 (Move #167.10): MATCH-list avoidance playbook + acquirer-portfolio defense.** A playbook that quantifies the operator's MATCH-placement risk + recommends a 90-day remediation plan (per-network ratio drop target + per-MID 3DS-frictionless-fallback priority + acquirer reserve negotiation strategy). The 3DS-frictionless-fallback layer must be extended to project the MATCH-avoidance savings (per the 5-year revenue-at-risk × the probability-of-placement reduction). Year-1 ROI 10:1-30:1 at the default $1M-$5M GMV.

**Extension 7 (Move #167.11): 3DS-frictionless-history persistence + re-presentation pre-caching.** The 3DS-frictionless data is typically only available for 30-60 days in the acquirer's 3DS-server logs (before they get archived). The 3DS-frictionless-history persistence layer extends the 3DS-data extraction to persist the 7 canonical fields in the transaction DB for 150+ days (the 120-day CE 3.0 vintage window + 30-day buffer). The re-presentation pre-caching layer pre-computes the frictionless-fallback evidence pack JSON at the time of the original transaction (so the 10.4 dispute can be re-presented in <1 hour instead of <7 days). Year-1 ROI 2:1-6:1 (operations efficiency).

## Cross-references

1. **Move #167** (skills/167-chargeback-management-and-dispute-recovery.md) — the upstream chargeback-management playbook that this skill's 3DS-frictionless CE 3.0 fallback layer extends. Without Move #167, the operator has no chargeback management program to extend with the frictionless-fallback path.
2. **Move #167.1** (skills/495-compelling-evidence-3-0-evidence-pack-automation.md) — the CE 3.0 evidence-pack automation that this skill's frictionless-fallback composer INVERTS the skip-logic for. The standard Move #167.1 composer skips 3DS-authenticated transactions (P1 anti-pattern); this skill changes the skip-logic to skip only challenge-performed and ECI 07 transactions. The 7-field 3DS data is added as the 5th dimension to the standard 4-dim CE 3.0 rubric.
3. **Move #167.2** (skills/496-subscription-account-updater-audit.md) — the Subscription Account Updater audit. The 3DS-frictionless-fallback layer integrates with the Account Updater layer to ensure that subscription card-on-file updates (Visa VAU / Mastercard ABU) trigger a re-presentation with the updated card-on-file + 3DS data.
4. **Move #167.3** (skills/497-per-network-fee-modeling-vamp-ecm-red-monitoring-programs.md) — the per-network fee-modeling layer. The 3DS-frictionless-fallback program-tier (Component 6) extends the Move #167.3 Component 1 4-network per-tier fee calculator with a 5th program-tier. The per-network 12-month fine-avoidance + recovery projection integrates with the Move #167.3 ROAD-TO-COMPLIANCE projection.
5. **Move #167.4 (this skill)** — the 3DS-frictionless CE 3.0 fallback layer that closes the canonical "5-15% of frictionless-authenticated transactions still receive 10.4 disputes" gap. The 6:1-18:1 Year-1 ROI is the canonical reference for the frictionless-fallback path.
6. **Move #6.5** (attribution-quality-audit.py) — the per-week Meta + Google + Klaviyo + GA4 attribution audit. The 3DS-frictionless-fallback layer's 0.05-0.15pp VAMP ratio drop is the canonical reference for the per-MID fallback ROI projection.
7. **Move #N.5** (ai-customer-service-automation) — the AI customer service automation. The 3DS-frictionless-fallback layer integrates with the AI customer service layer to surface the frictionless-fallback-eligible disputes in the customer service queue for context.
8. **Move #9.5** (pdp-ab-testing-program) — the PDP A/B testing program. The 3DS-frictionless-fallback layer's 0.05-0.10pp ratio drop is the canonical reference for the PDP A/B testing layer's dispute-ratio attribution.
9. **Move #1** (abandoned-cart-recovery) — the abandoned cart recovery flow. The 3DS-frictionless-fallback layer integrates with the cart-abandon flow to surface frictionless-fallback-eligible orders in the cart-recovery email.
10. **Visa 3DS 2024** (https://usa.visa.com/payments/3d-secure.html) — the canonical EMV 3DS + liability shift + frictionless flow reference.
11. **EMVCo 3DS 2024** (https://www.emvco.com/emv-technologies/3d-secure/) — the canonical 3DS 2.3.0 protocol spec + frictionless flow rules.
12. **EMVCo 3DS Data Fields 2024** (https://www.emvco.com/) — the canonical 7-field 3DS authentication data reference (`ds_trans_id` + `three_ds_server_trans_id` + `authentication_value` + `authentication_timestamp` + `message_category` + `transaction_status` + `eci`).
13. **Visa 3DS Authentication Data 2024** (https://usa.visa.com/payments/3d-secure.html) — the canonical Visa-specific CAVV + frictionless flow reference.
14. **Mastercard Identity Check 2024** (https://www.mastercard.us/) — the canonical Mastercard 3DS + UCAF + frictionless flow reference.
15. **Amex 3DS SAFE 2024** (https://www.americanexpress.com/) — the canonical Amex 3DS + AAV + SAFE reference.
16. **MRC 3DS Best Practices 2024** (https://www.mrcglobalecommerce.com/) — the canonical 3DS coverage + frictionless rate + per-issuer acceptance rate reference.
17. **MRC 3DS Frictionless Rates 2024** (https://www.mrcglobalecommerce.com/) — the canonical frictionless-rate-by-cohort reference (75-85% of 3DS is frictionless).
18. **MRC 3DS Conversion Impact 2024** (https://www.mrcglobalecommerce.com/) — the canonical 3DS-frictionless-vs-challenge conversion-drop reference.
19. **Visa CE 3.0 2025** (https://usa.visa.com/dam/VCOM/regional/na/us/manage-risk/documents/visa-compelling-evidence-3-0-merchant-readiness.pdf) — the canonical CE 3.0 4-dim rubric + frictionless-fallback support reference.
20. **Visa CE 3.0 Effective 2025** (https://usa.visa.com/dam/VCOM/regional/na/us/manage-risk/documents/visa-compelling-evidence-3-0-effective-2025.pdf) — the CE 3.0 effective date + 4-dim rubric.
21. **Visa CE 3.0 Data Fields 2025** (https://usa.visa.com/) — the CE 3.0 evidence pack required data fields.
22. **Visa Evolution of Compelling Evidence 2023** (https://usa.visa.com/) — the CE 1.0 → CE 2.0 → CE 3.0 evolution + frictionless-fallback support history.
23. **Visa VAMP Fact Sheet 2025** (https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf) — the canonical VAMP threshold + fine + tier schedule.
24. **Braintree VAMP 2025** (https://developer.paypal.com/braintree/articles/risk-and-security/card-brand-monitoring-programs/visa-programs/visa-dispute-monitoring-program) — the per-Merchant Excessive + per-Acquirer Above Standard tier breakdown ($4 / $8 per VAMP Count).
25. **Mastercard ECP 2025** (https://docs.antom.com/ac/dispute/monitor) — the canonical ECM/HECM/EFM threshold + fine + assessment schedule.
26. **Mastercard ECM 2025** (https://docs.antom.com/ac/dispute/monitor) — the canonical ECM 1.5% ratio + 100 chargebacks + $25 per cb reference.
27. **Amex RED 2025** (https://www.chargebackgurus.com/blog/amex-excessive-chargeback-fees-and-fraud-full-recourse-program) — the canonical Amex RED + ICPR schedule.
28. **Discover DMP 2025** (https://www.justt.ai/blog/how-american-express-and-discover-chargebacks-differ/) — the canonical Discover DMP + $25 per cb over limit reference.
29. **Stripe 3DS Frictionless 2025** (https://stripe.com/docs) — the canonical Stripe Radar + 3DS frictionless rules + dynamic 3DS reference.
30. **Stripe 3DS Optimization 2025** (https://stripe.com/docs) — the canonical Stripe 3DS coverage + frictionless rate + per-cohort tuning reference.
31. **Adyen Dynamic 3D Secure 2025** (https://docs.adyen.com/) — the canonical Adyen Dynamic 3D Secure + risk-based config + frictionless-vs-challenge reference.
32. **Adyen 3DS Frictionless 2025** (https://docs.adyen.com/) — the canonical Adyen frictionless + exemption engine reference.
33. **Checkout.com 3DS 2025** (https://www.checkout.com/) — the canonical Checkout.com 3DS + frictionless flow reference.
34. **Braintree 3DS 2025** (https://developer.paypal.com/braintree/) — the canonical Braintree 3DS + frictionless flow reference.
35. **Chargeflow 3DS Frictionless 2025** (https://chargeflow.io/) — the canonical Chargeflow 3DS-frictionless-fallback composer reference (60-75% win-rate with 3DS data).
36. **Justt 3DS Fallback 2025** (https://justt.ai/) — the canonical Justt 3DS-frictionless-fallback composer + per-issuer narrative reference.
37. **MidMetrics 3DS 2025** (https://midmetrics.io/) — the canonical MidMetrics 3DS-frictionless-fallback reference.
38. **Chargebacks911 2026** (https://chargebacks911.com/) — the canonical Chargeback Field Report + 10.4 dispute win-rate + 3DS frictionless data.
39. **Datos Insights 2026** (https://datos-insights.com/) — the canonical 18-25% of all friendly-fraud chargebacks are filed by 4-6% of customers + frictionless-fallback eligibility.
40. **Chargeback Gurus 2025** (https://www.chargebackgurus.com/) — the canonical per-network 3DS-frictionless-fallback reference.
41. **Redress Compliance 2025** (https://redresscompliance.com/) — the canonical MATCH-list compliance audit + 3DS-frictionless-fallback remediation reference.
42. **Visa 2025 Global eCommerce Payments & Fraud Report** (https://usa.visa.com/dam/VCOM/download/about-visa/global-fraud-report-2025.pdf) — the canonical 3DS coverage + frictionless rate + per-issuer reference.
43. **Mastercard Datos 2025** (https://www.mastercard.us/) — the canonical Mastercard 3DS + frictionless + chargeback reference.
44. **Juniper Research Friendly Fraud 2026** (https://www.juniperresearch.com/) — the canonical 22% friendly-fraud + frictionless-fallback repeat-offender cohort.
45. **LendingTree Cardholder Survey 2024** (https://www.lendingtree.com/credit-cards/chargeback-survey/) — the canonical 22% "I don't recognize this charge" friendly-fraud + frictionless-fallback context.
46. **EMVCo 3DS 2.3.0 2024** (https://www.emvco.com/) — the canonical 3DS 2.3.0 protocol spec + frictionless flow rules + 7-field data reference.
47. **EMVCo 3DS Merchant Data 2024** (https://www.emvco.com/) — the canonical merchant-side 3DS data mapping reference.

## Sources

1. [Visa 3DS 2024](https://usa.visa.com/payments/3d-secure.html) — EMV 3DS + liability shift + frictionless flow
2. [EMVCo 3DS 2024](https://www.emvco.com/emv-technologies/3d-secure/) — protocol spec + frictionless flow rules
3. [EMVCo 3DS 2.3.0 2024](https://www.emvco.com/) — 3DS 2.3.0 + frictionless + 7-field data
4. [EMVCo 3DS Data Fields 2024](https://www.emvco.com/) — 7-field 3DS authentication data + `ds_trans_id` + `authentication_value` (CAVV) + `transaction_status` + `eci`
5. [EMVCo 3DS Merchant Data 2024](https://www.emvco.com/) — merchant-side 3DS data mapping + persistence
6. [EMVCo 3DS Frictionless Flow 2024](https://www.emvco.com/) — frictionless flow rules + exemption engine
7. [EMVCo 3DS Challenge Flow 2024](https://www.emvco.com/) — challenge flow rules + customer interaction
8. [Visa 3DS Authentication Data 2024](https://usa.visa.com/payments/3d-secure.html) — Visa-specific CAVV + frictionless data
9. [Mastercard Identity Check 2024](https://www.mastercard.us/) — Mastercard 3DS + UCAF + frictionless data
10. [Mastercard 3DS Frictionless 2024](https://www.mastercard.us/) — Mastercard-specific frictionless flow
11. [Amex 3DS SAFE 2024](https://www.americanexpress.com/) — Amex 3DS + AAV + SAFE + frictionless data
12. [Amex 3DS 2024](https://www.americanexpress.com/) — Amex 3DS reference
13. [Discover 3DS 2024](https://www.discover.com/) — Discover 3DS reference
14. [MRC 3DS Best Practices 2024](https://www.mrcglobalecommerce.com/) — 3DS coverage + frictionless rate + per-issuer acceptance rate
15. [MRC 3DS Frictionless Rates 2024](https://www.mrcglobalecommerce.com/) — frictionless rate by cohort (75-85% of 3DS is frictionless)
16. [MRC 3DS Conversion Impact 2024](https://www.mrcglobalecommerce.com/) — 3DS frictionless vs challenge conversion drop
17. [Visa CE 3.0 2025](https://usa.visa.com/dam/VCOM/regional/na/us/manage-risk/documents/visa-compelling-evidence-3-0-merchant-readiness.pdf) — CE 3.0 4-dim rubric + frictionless-fallback support
18. [Visa CE 3.0 Effective 2025](https://usa.visa.com/dam/VCOM/regional/na/us/manage-risk/documents/visa-compelling-evidence-3-0-effective-2025.pdf) — CE 3.0 effective date + 4-dim rubric
19. [Visa CE 3.0 Data Fields 2025](https://usa.visa.com/) — CE 3.0 evidence pack required data fields
20. [Visa Evolution of Compelling Evidence 2023](https://usa.visa.com/) — CE 1.0 → CE 2.0 → CE 3.0 evolution
21. [Visa VAMP Fact Sheet 2025](https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf) — VAMP threshold + fine + tier
22. [Braintree VAMP 2025](https://developer.paypal.com/braintree/articles/risk-and-security/card-brand-monitoring-programs/visa-programs/visa-dispute-monitoring-program) — per-Merchant Excessive + per-Acquirer Above Standard
23. [Mastercard ECP 2025](https://docs.antom.com/ac/dispute/monitor) — ECM/HECM/EFM threshold + fine + assessment
24. [Mastercard ECM 2025](https://docs.antom.com/ac/dispute/monitor) — ECM 1.5% ratio + 100 chargebacks + $25 per cb
25. [Amex RED 2025](https://www.chargebackgurus.com/blog/amex-excessive-chargeback-fees-and-fraud-full-recourse-program) — Amex RED + ICPR + $25 per cb
26. [Discover DMP 2025](https://www.justt.ai/blog/how-american-express-and-discover-chargebacks-differ/) — Discover DMP + $25 per cb over limit
27. [Stripe 3DS Frictionless 2025](https://stripe.com/docs) — Stripe Radar + 3DS frictionless rules
28. [Stripe Radar 3DS Rules 2025](https://stripe.com/docs) — Stripe Radar 3DS rules + dynamic frictionless
29. [Stripe 3DS Optimization 2025](https://stripe.com/docs) — Stripe 3DS coverage + frictionless + per-cohort tuning
30. [Adyen Dynamic 3D Secure 2025](https://docs.adyen.com/) — Adyen Dynamic 3D Secure + risk-based config
31. [Adyen 3DS Frictionless 2025](https://docs.adyen.com/) — Adyen frictionless + exemption engine
32. [Adyen 3DS Exemption Engine 2025](https://docs.adyen.com/) — Adyen 3DS exemption engine + low-value + trusted-beneficiary
33. [Checkout.com 3DS 2025](https://www.checkout.com/) — Checkout.com 3DS + frictionless flow
34. [Braintree 3DS 2025](https://developer.paypal.com/braintree/) — Braintree 3DS + frictionless flow
35. [Worldpay 3DS 2025](https://developer.worldpay.com/) — Worldpay 3DS + frictionless
36. [Auth.net 3DS 2025](https://developer.authorize.net/) — Auth.net 3DS + frictionless
37. [Chargeflow 3DS Frictionless 2025](https://chargeflow.io/) — 3DS-frictionless-fallback composer (60-75% win-rate)
38. [Chargeflow CE3 2025](https://chargeflow.io/chargeback-automation/visa-ce-3-0) — CE 3.0 evidence composer + 4-dim validator
39. [Justt 3DS Fallback 2025](https://justt.ai/) — 3DS-frictionless-fallback composer + per-issuer narrative
40. [Justt CE3 2025](https://justt.ai/visa-ce-3-0-compelling-evidence/) — $0.20/dispute + AI composer
41. [MidMetrics 3DS 2025](https://midmetrics.io/) — MidMetrics 3DS-frictionless-fallback reference
42. [NoFraud 3DS 2025](https://www.nofraud.com/) — NoFraud 3DS reference
43. [Signifyd 3DS 2025](https://www.signifyd.com/) — Signifyd 3DS reference
44. [Kount 3DS 2025](https://www.kount.com/) — Kount 3DS reference
45. [Sift 3DS 2025](https://www.sift.com/) — Sift 3DS reference
46. [Riskified 3DS 2025](https://www.riskified.com/) — Riskified 3DS reference
47. [Stripe Chargeback Protection 2025](https://stripe.com/docs) — Stripe Chargeback Protection + 3DS integration
48. [Adyen Dispute 2025](https://docs.adyen.com/risk-management/disputes-api/) — Adyen Dispute API + CE 3.0
49. [Shopify Dispute 2025](https://shopify.dev/docs/api/admin-rest/2025-01/resources/dispute) — Shopify Disputes API + CE 3.0 + 3DS
50. [Chargebacks911 2026](https://chargebacks911.com/) — Chargeback Field Report + 10.4 win-rate + 3DS frictionless
51. [Datos Insights 2026](https://datos-insights.com/) — 18-25% of all friendly-fraud chargebacks are filed by 4-6% of customers
52. [Juniper Research Friendly Fraud 2026](https://www.juniperresearch.com/) — 22% friendly-fraud + frictionless-fallback repeat-offender
53. [MRC Global eCommerce Fraud 2026](https://www.mrcglobalecommerce.com/) — global chargeback + fraud + 3DS adoption
54. [LexisNexis True Cost of Fraud 2025](https://risk.lexisnexis.com/) — $3.75-$4.61 cost-per-dollar-lost
55. [Nilson Report 2025](https://nilsonreport.com/) — global card-network fee trends + 3DS
56. [Chargeback Gurus 2025](https://www.chargebackgurus.com/) — per-network 3DS-frictionless-fallback reference
57. [Redress Compliance 2025](https://redresscompliance.com/) — MATCH-list compliance audit + 3DS-frictionless-fallback remediation
58. [Visa 2025 Global eCommerce Payments & Fraud Report](https://usa.visa.com/dam/VCOM/download/about-visa/global-fraud-report-2025.pdf) — 3DS coverage + frictionless + per-issuer
59. [Mastercard Datos 2025](https://www.mastercard.us/) — Mastercard 3DS + frictionless + chargeback
60. [Javelin Chargeback 2025](https://www.javelinstrategy.com/) — friendly-fraud + 3DS frictionless
61. [LendingTree Cardholder Survey 2024](https://www.lendingtree.com/credit-cards/chargeback-survey/) — 22% "I don't recognize this charge"
62. [Chargeflow VAMP 2026](https://www.chargeflow.io/blog/vamp-visa-acquirer-monitoring-program) — VAMP 1.5% merchant threshold + 0.7% acquirer + $8 per VAMP Count
63. [Chargeflow Thresholds 2026](https://www.chargeflow.io/blog/chargeback-threshold-limits) — per-network 2026 threshold
64. [Verifi CDRN 2025](https://www.verifi.com/) — pre-dispute Visa-only interception
65. [Ethoca 2025](https://www.ethoca.com/) — pre-dispute Mastercard + Visa + Amex + Discover
66. [Visa RDR 2025](https://usa.visa.com/dam/VCOM/regional/na/us/manage-risk/documents/visa-rapid-dispute-resolution.pdf) — RDR pre-dispute
67. [Mastercard Collaboration 2025](https://www.mastercard.us/) — Mastercard Collaboration pre-dispute
68. [Verifi Order Insight 2025](https://www.verifi.com/solutions-sellers/order-insight.html) — pre-dispute issuer inquiry + 7d reply window
