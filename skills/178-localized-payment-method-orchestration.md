---
name: localized-payment-method-orchestration
title: Localized payment-method orchestration (Move #22.3, Klarna/AfterPay/iDEAL/Bancontact/SEPA/Konbini/Alipay/WeChat Pay + per-market copy + trust + UX, 5-pillar per-market payment-surface, 12:1 default Year-1 ROI Path B at $5M US GMV)
category: localization
tier: 1
priority: P0
default_move: 22.3
year_1_roi_band: "8:1–18:1"
sms_friendly: true
last_updated: 2026-09-16
sources: [klarna-2024, afterpay-2024, affirm-2024, sezzle-2024, zip-2024, ideal-2024, sepa-2024, sofort-2024, bancontact-2024, konbini-2024, alipay-2024, wechat-pay-2024, gcash-2024, pix-2024, oxxo-2024, paytm-2024, upi-2024, razorpay-2024, worldpay-global-payments-2024, jpm-payments-2024, adyen-2024, stripe-2024, checkout-com-2024, baymard-checkout-2024, baymard-payments-2024, worldpay-fraud-2024, mckinsey-bnpl-2024, cbi-insights-bnpl-2024, insider-intelligence-bnpl-2024, accenture-payments-2024, klaviyo-payment-failed-2024, gorgias-payment-failed-2024, rechargedecline-recovery-2024, smsbump-postscript-payment-failed-2024, eu-psd2-sca-2024, uk-fca-bnpl-2024, jp-metaps-konbini-2024, shopify-markets-2024, shopify-shop-pay-2024, shoppay-installments-2024, triple-whale-payments-2024]
---

# Localized payment-method orchestration (Move #22.3)

> Move #22.3 is the post-expansion **per-market payment-surface** layer that turns Move #25's "which processors + which BNPL + which express-checkout" decision matrix into **market-tuned payment-method visibility, ordering, copy, trust-signals, and decline-recovery** for each active locale — protecting the 20–40% cross-border checkout-completion lift Move #22 expects from currency + duties + language, because in every market the payment-method **mix** differs (NL shoppers expect iDEAL first, DE shoppers expect Klarna + SEPA + PayPal, JP shoppers expect Konbini + PayPay, BR shoppers expect PIX, AU shoppers expect AfterPay, MX shoppers expect OXXO + Mercado Pago, IN shoppers expect UPI) and the **wrong mix or wrong order** silently leaks 8–25% of cross-border checkout completions per market. Move #22.3 is the layer between Move #25 (the engine) and Move #26 (the language) — without it, every other international investment underperforms because the buyer's most-trusted payment method is below the fold or absent.

## When to use this skill

Use this skill **after Move #22 international expansion has selected markets**, **after Move #25 checkout payments + BNPL optimization has shipped** (the processor + BNPL engine is live in Shopify Markets / Stripe / Adyen), **after Move #26 native-language voice profiles has shipped** (the language layer is in place), and **before Phase 2 traffic is scaled** to 30%+ of total paid acquisition. It is the right move when the operator already has Shopify Markets + multi-currency + duties turned on, but the **payment-method mix, ordering, copy, and trust-signals** are still US-default and an EU/JP/AU shopper scrolling the checkout sees "Card + Shop Pay + PayPal" with no Klarna, no iDEAL, no Konbini, no PIX — and bounces.

You have:

- Shopify Markets active for at least **UK + one EU/non-US market** with multi-currency + duties configured (Move #22 Path A or Path B).
- A live processor with regional payment methods enabled (Stripe + Adyen both support 40+ regional methods; Shopify Markets supports ~10; Braintree/Checkout.com support 30+; PayPal + Klarna + AfterPay are toggle-on per market).
- 12+ months of US order history + baseline CVR per payment method (so you can measure the localized-mix lift against the US baseline).
- Localized language in place (Move #26) — payment-method copy without localized checkout copy produces a fragmented experience.
- 20+ cross-border orders/week per active market (below this, the signal-to-noise of payment-method-mix experiments is too low to learn from).
- Budget for at least one payment-method per market (Stripe charges 0.25–1.5% + €0.10–0.35 per regional method; Adyen charges 0.6% + €0.12; Klarna 5.99% + €0.35 in DE/NL/SE; AfterPay 6% + $0.30 in AU/UK/US; iDEAL is €0.29 fixed; Konbini is ¥250 + 5.5%).

Do **not** use this skill when:

- The brand has not shipped Move #22 or Move #25. Localizing payment methods before the processor stack is multi-currency-ready creates a half-built checkout that confuses shoppers.
- Total cross-border volume is **<5% of total orders**. The lift from payment-method localization is concentrated in cross-border orders; a 1% volume brand wastes time on this.
- The brand is in a regulated category where regional payment methods must include category-specific KYC (CBD, supplements, alcohol) — defer until Move #174 ecommerce compliance program is shipped.
- The brand uses a single checkout that cannot dynamically render payment methods per market (legacy Magento 1.x, WooCommerce without multi-market plugins). Migrate to a market-aware checkout first.

## What "best in class" looks like

Best-in-class localized payment-method orchestration is a **per-market checkout optimizer**, not a "turn on Klarna" toggle. The operator owns one canonical per-market **payment-method surface spec** and every processor + storefront + theme renders from it.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Market scope | UK + DE + FR + NL + JP + AU + BR + MX + IN payment-surface specs | UK + DE only | Add IT/ES/SE/DK/CA/PL/NO/FI/AE/SA |
| Payment-method discovery | Per-market method list pulled from processor API + ranked by historical CVR per market | One global method list | Per-segment (new vs returning, mobile vs desktop) ranking per market |
| Method placement | First 3 methods above the fold, ordered by market CVR rank; express-checkout (Apple/Google/Shop Pay/PayPal) above card | Card first, methods below | Method placement animated per market + per-segment on first paint |
| Method copy | Native-language method name + 1-line native benefit ("Pay in 3 interest-free instalments" / "Bezahlen in 3 Raten" / "3回までの分割払い") | English-only method name | Per-market value-prop microcopy + market-specific promo ("Flessibile Raten ohne Zinsen" / "0% APR available for orders over €99") |
| Trust signals | Method-specific badge + per-market regulatory footer (FCA for UK BNPL, AFM for NL, BaFin for DE) | Generic "Secure checkout" | Per-method social proof ("Used by 4.2M Dutch shoppers" / "Used by 38% of German online orders") |
| Decline recovery | Per-method decline recovery flow with native retry copy ("Try iDEAL again" / "Choose another payment method" / "Pay at konbini within 3 days") | Generic "Payment failed, try again" | Per-method retry routing (card → Klarna → iDEAL fallback chain per market) |
| Decline analytics | Per-method decline rate per market + reason-code dashboard + weekly cadence | Per-method global decline rate | Per-cohort decline rate (new vs returning, device, AOV bucket) with auto-remediation playbooks |
| Currency + fees | Local currency display + per-market fee transparency (DDV/VAT line + duties line + FX fee disclosure) | USD-only with FX markup | Per-market price breakdown + BNPL-instalment-cost pre-calculated |
| Checkout length | 1-page per market with collapsible order summary; mobile-first | Multi-page universal | Market-specific progressive disclosure (EU sees DPD/PostNL pickup points, JP sees Konbini store picker) |

The reference brands to study are the ones where the payment surface feels native: **Zalando EU** (iDEAL first in NL, Klarna first in DE, Carte Bancaire first in FR, Sofort/SEPA as fallback), **Sephora JP** (Konbini + PayPay + card with JP-specific store picker), **ASOS AU/NZ** (AfterPay + POLi + PayPal in that order, AUD default), **Mercado Libre BR/MX** (PIX + Boleto + Mercado Pago above card), **Nordstrom US** (Klarna + Affirm + Afterpay as equals above card), **Allbirds EU** (Klarna first, SEPA second, PayPal third, card last), **Gymshark EU** (Klarna + iDEAL + SEPA per market + cart currency), **On Running JP** (Konbini + PayPay + card with JPY pricing + JP-specific delivery slots), **Tumi EU** (Klarna + SEPA + iDEAL per market with native trust signals), **Patagonia EU** (Klarna + SOFORT + PayPal + SEPA + native trust badges per market). The pattern: payment-method mix per market matches what shoppers in that market already trust; method ordering matches historical CVR; copy and trust signals are localized; decline recovery is native.

## Per-market payment-method benchmarks (2024–25)

The ROI comes from recovering cross-border checkout completions that the US-default payment surface leaks, not from the payment-method processor fees.

| Path | Brand profile | Markets | Cost stack | Expected Year-1 lift protected | Year-1 ROI |
|---|---|---|---|---|---|
| **A — UK + DE payment-surface basics** | $500k–$2M US GMV; Path A Move #22 | UK (GBP + Klarna + Apple Pay + Google Pay) + DE (EUR + Klarna + SEPA + Sofort + PayPal) | $500–$2k one-time + $0–$300/mo per-market processor fee delta | 5–12% EU/UK CVR lift on cross-border orders | **6:1–9:1** |
| **B — DEFAULT full EU + AU payment-surface** | $1M–$10M GMV; Move #22 Path B | UK + DE + FR + NL + AU (AfterPay) + CA (Interac) | $2k–$8k one-time + $300–$1,500/mo per-market processor fee delta + 3–8 hr/wk operator | 8–18% EU/UK/AU CVR lift on cross-border orders + 15–30% decline-rate reduction | **10:1–14:1 default 12:1** |
| **C — full international payment-surface including emerging markets** | $10M–$50M GMV; Move #22 Path C | UK + DE + FR + NL + JP (Konbini + PayPay) + AU + BR (PIX + Boleto) + MX (OXXO + Mercado Pago) + IN (UPI + Paytm) | $5k–$20k one-time + $1k–$4k/mo per-market processor fee delta + 6–15 hr/wk operator | 12–25% cross-border CVR lift + 25–40% decline-rate reduction + market-specific compliance posture | **12:1–18:1** |

**Benchmarks to use in the model:** Klarna's 2024 merchant data shows **+30% AOV lift** and **+20% conversion lift** in DE/SE/NL/FI markets when Klarna is the first BNPL option displayed; AfterPay's 2024 AU/NZ/US data shows **+15–25% conversion lift** in AU when AfterPay is the first BNPL option; Stripe's 2024 regional-payment-methods report shows **+8–35% conversion lift** per market when the top 2 local methods are above the fold; Worldpay's 2024 Global Payments Report shows iDEAL accounts for **60%+ of NL ecommerce volume** (a US-default checkout without iDEAL first loses 50%+ of NL shoppers); Konbini accounts for **~30% of JP ecommerce** (PayPay + Konbini together are 50%+); PIX accounts for **~40% of BR ecommerce** within 3 years of launch; OXXO accounts for **~25% of MX cash-preferred ecommerce**. Adyen's 2024 benchmark shows **decline-rate reduction of 15–25%** when the per-method retry chain (card → Klarna → iDEAL fallback) is market-aware. McKinsey BNPL 2024 + CBI Insights 2024 + Insider Intelligence 2024 all converge on BNPL-incremental-CVR ranging from **+5% to +30%** per market depending on AOV, customer age, and category fit.

**Default math for a $5M US GMV Path B brand:** Move #22 expects $1.5M–$4M Year-1 international revenue potential. If the wrong payment-method mix or wrong order leaks even 15% of that opportunity, the brand loses $225k–$600k. A $8k–$15k localized-payment-surface build that recovers $400k of Year-1 revenue is a 12:1 ROI and also lowers support cost and refund rate.

## The build (10–14 days for Path B)

1. **Confirm Move #22 + Move #25 + Move #26 are shipped.** Run the existing scorers and verifications:
   `python3 scripts/international_market_fit.py --us-gmv 5000000 --category apparel --us-aov 75 --us-contribution-margin-pct 55 --supply-chain-complexity 1 --operator-capacity-hours-per-week 8 --json` (Path B = UK + DE + FR + AU).
   `python3 scripts/checkout_payments_bnpl_optimizer.py --processor stripe --bnpl-on --aov 75 --monthly-orders 4000 --json` (Move #25 baseline).
   `python3 scripts/native_language_voice_profiles.py --market de-DE --locale-codes de-DE.json --json` (Move #26 baseline).
   Path A ships UK + DE payment-surface. Path B ships UK + DE + FR + NL + AU. Path C adds JP + BR + MX + IN.
2. **Audit the per-market processor coverage.** Open Stripe / Adyen / Shopify Markets → Payment methods → per-market toggle matrix. Confirm: Klarna (DE/NL/SE/FI/AT/CH), iDEAL (NL), SEPA (DE/FR/IT/ES/NL/AT), Sofort (DE/AT/CH), Bancontact (BE), AfterPay (AU/UK/US/NZ/CN), POLi (AU/NZ), Interac (CA), PayPay + Konbini (JP), PIX + Boleto (BR), OXXO + Mercado Pago (MX), UPI + Paytm + Razorpay (IN), Alipay + WeChat Pay (CN). Methods must be **enabled per market**, not globally.
3. **Pull the per-market payment-method mix benchmark.** Use Worldpay 2024 Global Payments Report + Adyen 2024 Regional Benchmarks + J.P. Morgan Payments 2024 Local Payment Methods. For each active market, capture: top 3 payment methods by volume share, top 3 by conversion rate, top 3 by AOV. Build a per-market table with native-language method names + method rank.
4. **Build the per-market payment-surface spec.** For each market, document: method order (rank 1–10), native-language method label, native-language value-prop microcopy (per method, ≤80 chars), trust-signal badge, regulatory footer (FCA/AFM/BaFin/etc.), decline-retry flow fallback chain (rank 1 → rank 2 → rank 3), per-method AOV fit threshold (BNPL ≥ $50 AOV; Konbini ≤ ¥300,000 cap; iDEAL no min), per-method fee disclosure (BNPL fee + VAT + duties line). Save as `assets/19-localized-payment-surface.md` with one section per market.
5. **Configure per-market method ordering in the storefront.** Shopify Markets → Markets → [Market] → Payment methods → reorder; Stripe + Adyen → Payment methods → per-market default ordering + dynamic_methods API. Per-market ordering must reflect step-3 benchmark rank — not the global default. Confirm per-market checkout render via the [Market]-specific preview URL.
6. **Localize the method copy + trust signals.** Sequence: method labels (Klarna → "Klarna – Bezahlen in 3 Raten" / AfterPay → "AfterPay – 4 interest-free payments" / iDEAL → "iDEAL – Direct betalen via je bank" / Konbini → "コンビニ払い – 全国のコンビニでお支払い" / PIX → "PIX – Pague em segundos com sua chave") → value-prop microcopy (2nd line, ≤80 chars, native language) → trust-signal badges (under method: "Used by X% of [market] online shoppers" / "[N] transactions secured" / "Regulated by [Authority]") → regulatory footer (per market: "Klarna is regulated by the Financial Conduct Authority (UK)" / "iDEAL is operated by Currence under AFM supervision (NL)" / "Konbini payments are processed via [JP processor] under JFSA registration (JP)").
7. **Wire decline-recovery + retry routing.** Set up per-market retry chain in Stripe / Adyen: DE market = card → Klarna → SEPA → PayPal; NL market = iDEAL → card → Klarna → SEPA → PayPal; JP market = card → Konbini → PayPay → PayPal; BR market = PIX → Boleto → card; AU market = AfterPay → POLi → card → PayPal. Klaviyo payment-failed flow (per market, native language, ≤90 chars SMS, ≤48 hr email wait) + Gorgias payment-failed macro (per market, native language, 2-step). Wire Recharge decline recovery for subscription orders.
8. **Run 3-pass QA.** Pass 1 = method coverage (all per-market methods are enabled + ordered correctly in checkout preview). Pass 2 = copy + trust signals (native speaker reviews each market's payment-surface text, regulatory footer correct, market-specific trust claim verifiable). Pass 3 = commerce smoke (live checkout in test mode per market, decline scenarios, currency + duties line, FX fee transparency, BNPL instalment calculation).
9. **Wire analytics.** Add per-market payment-method tags to Klaviyo + Gorgias (`payment_method:klarna` + `market:de`, `payment_method:ideal` + `market:nl`), Triple Whale per-market payment-method cohort, GA4 country + payment_method custom dimension. Monitor per-market: CVR per payment method, decline rate per payment method, AOV per payment method, refund rate per payment method, support-ticket volume per payment method, BNPL-incremental-CVR (orders WITH BNPL method vs orders without — the killer test).
10. **Set the weekly payment-surface drift review.** Every week sample 5% of cross-border orders per market; verify the actual checkout method list + ordering + copy matches the asset spec; sample 5% of decline events per market; verify retry routing went to the correct fallback method; sample 5% of payment-failed support tickets; verify Klaviyo+Gorgias flowed with native-language copy. Update the asset spec + processor rules before next week.

## Common pitfalls (15 from real builds)

1. **Treating payment-method localization as a processor toggle, not a per-market strategy** — Stripe and Adyen both enable 40+ methods, but turning all of them on globally produces a cluttered, low-trust checkout where shoppers cannot find their preferred method. **Fix:** use per-market method ordering + per-market method count ceiling (typically 4–7 methods per market).
2. **Showing payment methods in US-default order globally** — card + Shop Pay + PayPal + Apple Pay in that order leaks 20–40% of NL shoppers (no iDEAL first), 30%+ of DE shoppers (no Klarna first), 30%+ of JP shoppers (no Konbini + PayPay), 40%+ of BR shoppers (no PIX). **Fix:** per-market method ordering sourced from Worldpay 2024 + Adyen 2024 + J.P. Morgan 2024 benchmark, validated against the operator's own per-market CVR data.
3. **English-only method labels** — "Klarna", "iDEAL", "Sofort", "Bancontact", "Konbini", "AfterPay" are all English-friendly brand names, but secondary value-prop copy ("Pay later in 3 instalments", "Direct bank payment", "Cash at convenience store") MUST be native. **Fix:** native-language value-prop copy for every active market, native reviewer reviews each surface.
4. **Missing regulatory footer** — UK FCA-regulated BNPL products (Klarna, AfterPay) require FCA disclosure on the checkout; NL AFM-regulated iDEAL requires AFM disclosure; JP Konbini/PayPay requires JFSA registration disclosure; BR PIX requires BCB disclosure; missing the footer is a compliance gap AND a trust-signal loss. **Fix:** regulatory footer per market, verified by native legal reviewer.
5. **Decline recovery is global copy, not per-market** — "Payment failed, please try again" is the most damaging localization failure because it appears at the moment of maximum purchase intent. **Fix:** native-language decline copy per market ("Erneuter Versuch mit Klarna" / "Probeer opnieuw met iDEAL" / "もう一度お試しください" / "Tente novamente com PIX") with the correct fallback method.
6. **BNPL shown for orders below the AOV threshold** — Klarna/Affirm/AfterPay all have per-market AOV minimums (~$50) and per-market maximum instalment amounts (Klarna DE max €5,000; AfterPay AU max A$3,000); showing BNPL for $20 orders produces friction + declines. **Fix:** AOV-conditional BNPL display per market + per-method.
7. **Missing per-market decline-retry routing** — card declined in DE → fall back to Klarna automatically. iDEAL failed in NL → fall back to SEPA. PIX failed in BR → fall back to Boleto. Without per-market retry routing, a single decline becomes a lost sale. **Fix:** per-market retry chain in Stripe/Adyen + native-language Klaviyo decline flow per fallback method.
8. **Cumulative BNPL fees hidden at checkout** — Klarna 5.99% + €0.35 in DE, Affirm 6–30% APR + $0 in US, AfterPay 6% + $0.30 in AU; shoppers seeing "Pay in 4 instalments" without the cost disclosure have lower trust + higher refund rate. **Fix:** explicit fee disclosure in the per-market value-prop microcopy ("Pay in 4 interest-free payments of €X each. €0 fees." / "€0,00 frais – 4x sans intérêts").
9. **No Konbini store picker for JP** — JP shoppers using Konbini payment expect to pick the store (7-Eleven / Lawson / FamilyMart / Ministop / Daily Yamazaki / Seicomart) at checkout, not after. **Fix:** native Konbini store picker integrated into checkout, JP-specific delivery slot picker, JP-language receipt.
10. **PIX QR-code generation happens at confirmation, not checkout** — BR shoppers expect to scan the PIX QR code immediately to authorize; generating it post-confirmation creates 20–30% drop-off. **Fix:** PIX QR code generated at checkout, native-language instructions for scanning via banking app, ≤2 hr expiry window.
11. **Missing OXXO voucher generation** — MX shoppers using OXXO receive a printable voucher to pay at any OXXO convenience store within 3 days; missing the voucher generation = lost sale. **Fix:** OXXO voucher generation at confirmation, native-language instructions + 3-day expiry warning + reminder email/SMS at 24 hr mark.
12. **UPI app picker missing** — IN shoppers using UPI expect to pick from their bank app (PhonePe / Google Pay / Paytm / BHIM / WhatsApp Pay); missing the app picker creates 15–25% drop-off. **Fix:** native UPI app picker at checkout, native-language instructions per app, deep-link to bank app for authorization.
13. **No market-level payment-method analytics** — without per-market per-method CVR + decline rate + AOV tracking, the operator cannot tell which methods are working. **Fix:** ship per-market per-method dashboard before launch, wire Klaviyo + Gorgias + Triple Whale + GA4 tags, weekly cadence.
14. **Per-market processor fee cascade** — Klarna 5.99% + €0.35 DE, AfterPay 6% + $0.30 AU, Konbini 5.5% + ¥250 JP, PIX ~0.5% BR, UPI ~0.4% IN — a brand with thin contribution margin can be flipped negative by misconfigured regional methods. **Fix:** per-market processor fee table in `assets/19-localized-payment-surface.md`, per-method ROI floor threshold, monthly reconciliation against actual orders.
15. **Missing BNPL regulatory compliance per market** — UK FCA's 2024 BNPL rules (FCA Handbook BCOBS), NL AFM's BNPL guidance 2024, MAS Singapore's BNPL framework 2024, AU ASIC's BNPL guidance 2024, IN RBI's BNPL guidance 2024 — each market has its own disclosure + credit-assessment + dispute-resolution requirements. **Fix:** legal review per market before BNPL toggle-on, regulatory footer per market, dispute-resolution flow per market.

## Verification (this skill is "shipped" when...)

- **Gate A — Per-market processor coverage.** Every active market has ≥3 native payment methods enabled + per-market ordering configured in Shopify Markets + Stripe/Adyen. Lighthouse-style: `python3 scripts/localized_payment_method_check.py --us-gmv 5000000 --active-markets uk,de,fr,nl,au,ca,jp --json` returns `per_market_methods_configured: true` for all 7 markets.
- **Gate B — Native-language method labels + value-prop copy.** Every active market has native-language value-prop microcopy (≤80 chars) approved by a native reviewer. Per-market regex: `Klarna – (Bezahlen in [0-9]+ Raten|Rate in [0-9]+|3 Raten ohne Zinsen)` for DE; `(Probeer|Betaal) (met|via) iDEAL` for NL; `コンビニ払い` for JP; `(Pagar|Pague) com PIX` for BR; `(Pay with|AfterPay – 4) (4 )?(interest-free|equal) (payments|installments)` for AU.
- **Gate C — Regulatory footer per market.** Every active market has the per-market regulatory footer rendered in checkout (FCA for UK BNPL; AFM for NL iDEAL + BNPL; BaFin for DE Klarna + Sofort; MAS for SG BNPL; ASIC for AU BNPL; JFSA for JP Konbini + PayPay; BCB for BR PIX). Sentinel regex per market + manually verified in checkout preview.
- **Gate D — Per-market decline-retry chain.** Every active market has a per-method retry chain configured in Stripe/Adyen with native-language decline copy in Klaviyo + Gorgias. Test: simulate a card decline in DE → confirm retry chain DE-1 (Klarna) fires, native-language Klaviyo email/SMS fires, Gorgias macro ready.
- **Gate E — Commerce smoke per market.** Live checkout smoke test in test mode per market: card + at least one regional method per market + decline scenario + BNPL instalment calculation + currency + duties + FX fee disclosure + regulatory footer all render correctly. Test scripts: `bash scripts/smoke_test_localized_payment.sh --market de-DE --methods klarna,sepa,sofort,paypal,card --expected-currency EUR --expected-locale de-DE`.
- **Gate F — Per-market analytics wiring.** Klaviyo + Gorgias + Triple Whale + GA4 all carry `market:[code]` + `payment_method:[code]` custom dimensions. Sentinel: `grep -c 'payment_method:' dashboard/src/lib/analytics.ts ≥ 9` (card + shop_pay + apple_pay + google_pay + paypal + klarna + afterpay + ideal + konbini).
- **Gate G — Per-market payment-method drift review cadence set.** Weekly payment-surface drift review is scheduled (calendar event + Linear ticket template) with the 3-pass sample (5% orders / 5% declines / 5% support tickets). Drift review rubric documented in `assets/19-localized-payment-surface.md` Section 10.

## How to extend this skill

1. **Add a new market.** Add a new section to `assets/19-localized-payment-surface.md` with the per-market method list (sourced from Worldpay 2024 + Adyen 2024 + J.P. Morgan 2024), the native-language labels + value-prop copy, the regulatory footer, the decline-retry chain, and the per-method fee table. Update the active-markets list in Gate A + Gate E.
2. **Add a new payment method within a market.** Add a row to the per-market section with: method name (native + English), native-language value-prop copy, AOV fit threshold, fee disclosure, decline-retry chain position, regulatory disclosure (if any). Update the per-market method ordering + Klaviyo decline flow + Gorgias macro.
3. **Add a new BNPL provider within a market.** Same as above + add the provider's regulatory compliance section (FCA / AFM / BaFin / ASIC / MAS / RBI / JFSA) + the dispute-resolution flow + the credit-assessment flow (required by UK FCA 2024 + NL AFM 2024 + AU ASIC 2024).
4. **Add a new processor.** Map the per-market method list + ordering + retry chain to the new processor (Stripe → Adyen → Shopify Markets → Braintree → Checkout.com). Update `scripts/localized_payment_method_check.py` to support the new processor's API.
5. **Wire post-payment localized data.** Move #22.3 covers checkout-localized payment surfaces. Add post-payment localized data: receipt language, payment-confirmation SMS/email language, refund flow language, chargeback dispute language, subscription renewal language, BNPL-instalment-reminder language. Each must be native-language and per-market.

## Cross-references

- **Move #22 international expansion** (`skills/25-international-expansion.md`) — selects markets + defines the cross-border framework.
- **Move #22.2 native-language voice profiles** (`skills/26-native-language-voice-profiles.md`) — language + cultural + payment copy layer that this skill builds on.
- **Move #25 checkout payments + BNPL optimization** (`skills/38-checkout-payments-bnpl-optimization.md`) — the processor + BNPL engine this skill localizes per market.
- **Move #26 international payments + cross-border checkout** (skill placeholder TBD) — the merchant-of-record + cross-border-tax layer this skill does NOT cover.
- **Move #30 dynamic pricing repricing engine** (`skills/30-dynamic-pricing-repricing-engine.md`) — the PPP-pricing layer this skill relies on (per-market price + per-market BNPL instalment calculation).
- **Move #38 checkout payments + BNPL optimization** (`skills/38-checkout-payments-bnpl-optimization.md`) — the payments engine this skill extends with per-market localization.
- **Move #84 multi-currency FX fee optimization** (skill placeholder TBD) — the FX-hedging + FX-fee-disclosure layer.
- **Move #174 ecommerce compliance program** (`skills/174-ecommerce-compliance-program.md`) — the PCI-DSS + GDPR + CCPA + regulatory framework this skill inherits from.
- **Move #66 international ecommerce tax filing operations** (`skills/66-international-ecommerce-tax-filing-operations.md`) — the VAT/IOSS/GST filing layer that operates downstream of this skill's per-market price breakdown.
- **Research doc `research/04-international-expansion.md` Pillar 2 (Currency, pricing & FX), Pillar 5 (Localization)** — the research synthesis that defines the per-market payment-method context this skill operationalizes.
- **Asset `assets/19-localized-payment-surface.md`** (planned) — the per-market payment-surface spec this skill maintains.
- **Script `scripts/localized_payment_method_check.py`** (planned) — the per-market payment-method coverage checker (Gate A).
- **Script `scripts/smoke_test_localized_payment.sh`** (planned) — the per-market commerce smoke tester (Gate E).

## Sources

- Klarna 2024 — regional BNPL volume, AOV lift, conversion lift benchmarks for DE/NL/SE/FI/AT/CH markets.
- AfterPay 2024 — AU/NZ/UK/US BNPL merchant data, instalment cap, AOV fit benchmarks.
- Affirm 2024 — US/CA/UK BNPL merchant data, APR disclosure, credit-assessment flow.
- Sezzle 2024 + Zip 2024 — secondary US/AU BNPL benchmark data.
- iDEAL 2024 (Currence) — NL payment method volume share + UX benchmark + AFM regulatory framework.
- SEPA 2024 (EBA) — pan-EU credit transfer + direct debit volume + fee benchmark.
- Sofort 2024 (Klarna Group) — DE/AT/CH bank-transfer payment benchmark.
- Bancontact 2024 — BE payment method volume + NBB regulatory framework.
- Konbini 2024 (Metaps + PayPay) — JP convenience-store payment + PayPay volume + JFSA registration.
- Alipay 2024 + WeChat Pay 2024 — CN payment method volume + PBOC regulatory framework.
- GCash 2024 + PayMaya 2024 — PH mobile-wallet payment volume + BSP regulatory framework.
- PIX 2024 (BCB) — BR instant-payment volume + UX benchmark + regulatory framework.
- OXXO 2024 + Mercado Pago 2024 — MX cash-voucher + wallet payment benchmark + CNBV regulatory framework.
- Paytm 2024 + UPI 2024 + Razorpay 2024 — IN mobile-wallet + UPI payment volume + RBI regulatory framework.
- Worldpay Global Payments Report 2024 — per-market payment-method volume share + growth forecast.
- J.P. Morgan Payments 2024 Local Payment Methods — per-market coverage + per-method fee benchmark.
- Adyen 2024 Regional Benchmarks — per-market CVR + AOV + decline-rate benchmarks.
- Stripe 2024 Regional Payment Methods — per-market method coverage + decline-recovery benchmark.
- Checkout.com 2024 + Braintree 2024 — secondary processor benchmark data.
- Baymard checkout usability 2024 + Baymard payments 2024 — payment-method placement + copy + trust-signal benchmarks.
- Worldpay fraud 2024 + Adyen RevenueProtect 2024 — per-market fraud + 3DS2 benchmark.
- McKinsey BNPL 2024 + CBI Insights BNPL 2024 + Insider Intelligence BNPL 2024 — BNPL incremental-CVR benchmark + regulatory landscape.
- Accenture Payments 2024 — emerging-market payment-method landscape (BR PIX, IN UPI, MX OXXO).
- Klaviyo payment-failed flow 2024 — payment-failed email/SMS benchmarks per market.
- Gorgias payment-failed macro 2024 — payment-failed support macros per market.
- Recharge decline-recovery 2024 — subscription decline-recovery benchmark per BNPL provider.
- Postscript payment-failed SMS 2024 — payment-failed SMS benchmarks per market.
- EU PSD2 SCA 2024 + UK FCA BNPL Handbook BCOBS 2024 + NL AFM BNPL guidance 2024 — per-market regulatory framework for BNPL.
- AU ASIC BNPL guidance 2024 + SG MAS BNPL framework 2024 + IN RBI BNPL guidance 2024 — non-EU BNPL regulatory framework.
- Japan FSA / JFSA 2024 — Konbini + PayPay + JP-issued card regulatory framework.
- Shopify Markets 2024 + Shopify Shop Pay 2024 + Shop Pay Installments 2024 — multi-currency + per-market method toggle + BNPL.
- Triple Whale payments 2024 — per-market per-method attribution benchmark.
