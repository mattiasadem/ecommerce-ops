---
name: checkout-audit-baymard
title: Checkout audit + Baymard fix-list (Move #3, 24-guideline Baymard score + Shopify theme fixes + mobile-device verification, 5-pillar Path A/B/C, 15:1 default Year-1 ROI)
category: conversion
tier: 1
priority: P0
default_move: 3
year_1_roi_band: "8:1–35:1"
sms_friendly: false
last_updated: 2026-07-11
sources: [baymard 2024, baymard-checkout-usability 2024, baymard-cart-usability 2024, shopify-checkout-extensibility 2024, shopify-payments 2024, shop-pay 2024, apple-pay 2024, google-pay 2024, klarna 2024, affirm 2024, afterpay 2024, triple-whale 2024, google-analytics-4 2024, shopify-analytics 2024, bigcommerce-checkout 2024, woocommerce-checkout 2024, shopify-checkout-conversion-benchmarks 2024, baymard-mobile-checkout 2024, akamai-mobile-commerce 2024, google-mobile-site-speed 2024, stripe-checkout 2024, adyen-checkout 2024, forter-fraud 2024, signifyd-fraud 2024]
---

# Checkout audit + Baymard fix-list

> Move #3 is the canonical **single-biggest-available-lever** in the Shopify-DTC stack — the audit-and-fix loop that lifts checkout-completion-rate 35–80% (and site-wide revenue 6–25%) by shipping the **Baymard Institute's 24 top checkout-usability findings** as concrete Shopify theme fixes. Built on **5 pillars**: (Pillar 1) **account + friction removal** — guest checkout, optional phone, minimum fields, inline validation, no password-strength-meter (5 L/M fixes for +10–20% CVR); (Pillar 2) **layout + form design** — one-page checkout, persistent order summary, address autocomplete, clear field labels, inline error messages (5 L/M/S fixes for +10–30% CVR); (Pillar 3) **payment options** — Shop Pay default, Apple Pay + Google Pay, BNPL for AOV >$150, payment icons visible, no 3rd-party redirect (5 L/M fixes for +15–60% mobile CVR); (Pillar 4) **trust + confidence** — trust badges, secure-checkout label, returns-policy link, real shipping costs upfront (4 M/S/L fixes for +5–12% CVR); (Pillar 5) **mobile-specific** — sticky place-order, 44×44px touch targets, 16px+ font to prevent iOS zoom, digital wallets above form, real-device test (5 L/M fixes for +10–30% mobile CVR). The 24 fixes score against Baymard's weighted rubric (Severity L=5pt / M=3pt / S=1pt; pass=1.0 / partial=0.5 / fail=0.0; health bands weak<40 / fair 40–55 / good 55–75 / great 75–90 / top-tier ≥90) and ship in **one Severity L fix per day for 1–2 weeks** to reach the **great band (≥75 score, top 35% of stores per Baymard)** at **8:1–35:1 Year-1 ROI** with **15:1 default Path B** at $1M–$10M US DTC base ($60k–$300k Year-1 incremental net vs $4k–$8k operator cost). Gated on Move #1 cart-abandon + Move #4 welcome + Move #6 Triple Whale attribution shipped ≥30 days + GA4 or Shopify Analytics Enhanced Ecommerce enabled with checkout-funnel data + staging theme available + 2–4 hr/day operator time during 1–2 week shipping window + willingness to ship on the lowest-traffic window (02:00–06:00 local) per published-publish SOP. Companion `scripts/checkout_audit_score.py` (Archetype B numeric-quality scorer + 24-guideline severity-weight table + cumulative-CVR-lift estimator capped at 0.80 + JSON output for CI/cron consumers) + `scripts/tests/test_checkout_audit_score.py` (≥18 TDD tests covering score math / pass-partial-fail point values / missing-guideline graceful-skip / JSON schema stability / 5-band health-band thresholds / cumulative-lift cap / Severity-L-first prioritized fix-list ordering).

## When to use this skill

**Use this skill when the operator has a live Shopify (or Ikas / BigCommerce / WooCommerce) checkout that has not been audited against Baymard's 24 top guidelines in the last 90 days.** This is the canonical Day-1 bounded improvement for any Shopify brand at $100k+ GMV because the median DTC checkout scores 35/100 (Baymard's "mediocre or worse") and the lift from a complete audit-fix loop is the single largest per-hour-available-revenue move in the stack. Per `research/02-top-10-leverage-moves.md` Move #3 ranking rationale: **"65% of DTC checkouts are 'mediocre or worse'; Baymard's 35 guidelines document +20–40% conversion lift available; 73% of traffic is mobile but converts at 1.8% vs 3.9% desktop (Triple Whale 2025). The single biggest available lever for most stores."** The operator should only initiate a Move #3 audit-fix cycle when ALL of the following are true:

- **Live checkout on Shopify (or Ikas / BigCommerce / WooCommerce) with at least 100 orders/mo.** Below 100 orders/mo, the conversion-lift signal is too noisy to measure reliably (Baymard's "before-after-test-minimum" per Baymard Conversion-Testing Research 2024). Above 10,000 orders/mo, the audit cycle may surface theme-architectural issues that warrant a CRO agency (Path C below). Verify: Shopify Orders dashboard returning ≥100 orders/mo for the last 30 days.
- **GA4 or Shopify Analytics Enhanced Ecommerce enabled with checkout-funnel data.** The lift-measurement requires the 5-step funnel (reached cart → checkout step 1 contact → step 2 shipping → step 3 payment → step 4 place order → completed order). Without this, the audit runs but the verification gate is unverifiable. Verify: GA4 Monetization → Checkout-funnel OR Shopify Analytics → Checkout-funnel returning step-by-step abandonment data.
- **Staging-theme workflow available.** DO NOT audit on live. Duplicate the live theme, rename it `checkout-audit-staging`, work there. Verify: Shopify admin → Themes → duplicate-current-theme available.
- **Move #1 (cart-abandon) + Move #4 (welcome series) + Move #6 (Triple Whale attribution) shipped ≥30 days.** The Move #3 audit's lift measurement depends on Move #1 cart-abandon being stable (otherwise abandoned-checkout noise drowns the signal), Move #4 welcome being stable (otherwise new-subscriber-segment noise), and Move #6 Triple Whale attribution being stable (otherwise channel-mix-attribution-noise drowns the signal). Verify: Klaviyo flow `cart_abandon_v1` published ≥30 days + Klaviyo flow `welcome_v1` published ≥30 days + Triple Whale (or Polar) installed ≥30 days.
- **2–4 hr/day operator time during 1–2 week shipping window.** The canonical cadence is 1 Severity-L fix per day (2–4 hours/fix) for the first 5–7 days, then Severity-M fixes for the next 5–7 days. Total: 15–35 hours over 1–2 weeks. Verify: operator has committed 2–4 contiguous hours/day for 5–10 business days.
- **Willingness to ship on the lowest-traffic window (02:00–06:00 local).** Per the canonical published-publish SOP, every staging-to-live promotion happens at 02:00–06:00 in the operator's lowest-traffic time-zone to minimize the blast radius if a fix introduces a regression. Verify: operator has documented a published-publish SOP that schedules staging-to-live at 02:00–06:00 + has a rollback plan (revert-to-prior-theme-version).

**Don't use this skill when:**

- **<100 orders/mo OR no GA4 / Shopify Analytics.** Below 100 orders/mo, the signal is too noisy. Without GA4, the lift measurement is unverifiable — defer until GA4 is set up. The Move #6 Triple Whale attribution audit (skill/13) + Move #6.5 attribution-quality-audit cover the attribution-substrate prerequisites.
- **Pre-launch or theme-development stage.** Move #3 audits a LIVE checkout; pre-launch brands should defer until 30 days post-launch with stable traffic.
- **Already at top-tier score (≥90).** If the brand has audited + shipped within the last 90 days and scored ≥90, the audit cycle is wasted. Wait 90 days for Baymard's quarterly-update cadence.
- **Custom-checkout-platform without extensibility APIs.** BigCommerce + WooCommerce + custom-PHP-checkouts may require additional dev work to ship some Severity-L fixes. Use Path C (CRO agency) for these stacks.
- **One-product brand with no checkout customization.** If the brand uses Shopify's default checkout (no theme customization at all), the audit will likely score 85+/100 already — Move #3 ROI is muted. Run the audit anyway; if score ≥85, Move #9 (mobile PDP redesign) or Move #9.5 (PDP A/B testing) likely yields higher ROI.

## What "best in class" looks like

A best-in-class Move #3 checkout audit is **NOT** "score the 24 guidelines and ship the report." It's a 5-pillar audit-and-fix loop where each pillar has its own decisions, fixes, and failure modes. The 24-component best-in-class matrix:

| # | Component | Baymard guideline | Severity | Default (Path B) | Good (Path A) | Great (Path C) | Why it matters |
|---|---|---|---|---|---|---|---|
| A1 | **Guest checkout offered** | Always offer guest checkout | L | Accounts optional | Accounts disabled | +5–10% CVR |
| A2 | **Phone number not required** | Phone is optional, not required | L | Optional | Removed entirely | +2–4% CVR |
| A3 | **Minimum fields visible** | Show minimum fields required | M | Below place-order | Inline form | +1–3% CVR |
| A4 | **Inline validation** | Inline error messages on submit | M | Default Shopify | Custom JS | +1–3% CVR |
| A5 | **No password strength meter** | Don't require password strength | S | Default Shopify | Custom-flow | +0.5–1% CVR |
| B1 | **One-page or accordion checkout** | One-page > multi-step | L | One-page Shopify | Custom accordion | +8–15% CVR |
| B2 | **Persistent order summary** | Order summary visible always | M | Sticky mobile / sidebar desktop | Floating widget | +2–5% CVR |
| B3 | **Address autocomplete** | Google Places or Shopify built-in | L | Shopify built-in | Google Places API | +3–7% CVR |
| B4 | **Clear field labels** | Visible labels, not placeholders | S | Default Shopify | Custom | +0.5–2% CVR |
| B5 | **Inline error messages** | Errors next to field, not banner | S | Default Shopify | Custom | +0.5–2% CVR |
| C1 | **Shop Pay default for returning** | Shop Pay is default payment | L | Enabled, accelerated | Custom-first | +10–20% mobile CVR |
| C2 | **Apple Pay + Google Pay** | Above credit-card form | L | Enabled both | One-tap toggle | +10–25% mobile CVR |
| C3 | **BNPL for AOV >$150** | Klarna/Affirm for high AOV | M | Klarna if AOV>$150 | Klarna + Affirm | +5–15% CVR (AOV-gated) |
| C4 | **Payment icons visible on PDP/cart** | Icons on product + cart, not just checkout | M | Theme-snippet | Custom block | +2–5% CVR |
| C5 | **No 3rd-party redirect for guest card** | Native checkout, no redirect | L | Shopify Payments | Native-only | +3–8% CVR |
| D1 | **Trust badges near place-order** | SSL + payment-provider + money-back | M | Default Shopify | Custom badges | +1–3% CVR |
| D2 | **Secure-checkout label** | Lock icon next to payment | S | Default Shopify | Custom lock + SSL | +0.5–1% CVR |
| D3 | **Returns-policy link visible** | Link to returns/refunds | S | Footer link | Sidebar link | +0.5–1% CVR |
| D4 | **Real shipping costs upfront on cart** | Show real shipping on cart page | L | Calculated rates | Live rate API | +3–7% CVR |
| E1 | **Sticky place-order button on mobile** | Always visible without scroll | L | Sticky bottom | Sticky above-fold | +5–10% mobile CVR |
| E2 | **Touch targets ≥44×44 px** | Apple HIG / WCAG 2.5.5 | M | CSS override | Touch-target audit | +1–3% mobile CVR |
| E3 | **No zoom required (16px+ inputs)** | iOS auto-zoom on <16px | M | Theme CSS fix | Custom font-size | +1–3% mobile CVR |
| E4 | **Digital wallets above email field** | Apple/Google/Shop Pay top-of-form | L | Top-of-checkout | Above email | +5–15% mobile CVR |
| E5 | **Mobile test on real device** | Test on iPhone + Android, not emulators | — | Operational gate | Real-device CI | (verification) |

**Total potential CVR lift if all 24 fixed: +35–80% checkout-completion uplift → +6–25% site-wide revenue** (varies by traffic and vertical). The 24-fix matrix is the canonical Baymard-Shopify-mapping per Baymard's Checkout Usability Research 2024 + Shopify Checkout Extensibility 2024 + Triple Whale 2024 checkout-funnel benchmarks.

## Checkout audit + Baymard benchmarks (2024–25)

### Health-band score distribution

| Health band | Score range | % of DTC stores (Baymard 2024) | CVR completion-rate band | What it means |
|---|---|---|---|---|
| **Top tier** | ≥90 | Top 5% | ≥70% completion-rate | Best-in-class; minor polish only |
| **Great** | 75–89 | Top 35% | 55–70% completion-rate | Top quartile; ship Severity-S fixes for marginal lift |
| **Good** | 55–74 | Median | 40–55% completion-rate | Ship remaining Severity-M + L fixes; expect 10–25% lift in 30d |
| **Fair** | 40–54 | 30% of stores | 25–40% completion-rate | Ship all Severity-L fixes; expect 15–35% lift in 30d |
| **Weak** | <40 | 35% of stores (median DTC) | <25% completion-rate | Ship all 24 fixes in priority order; expect 25–80% lift in 60d |
| **Missing** | 0 (no audit submitted) | — | — | Run the audit; start with Pillar 1 (account + friction) |

### Mobile-vs-desktop CVR gap (the canonical mobile gap)

| Source | Desktop CVR | Mobile CVR | Mobile gap | Year |
|---|---|---|---|---|
| Baymard Mobile Checkout Research 2024 | 3.9% | 1.8% | -54% relative | 2024 |
| Triple Whale State of DTC 2025 | 3.5% | 1.9% | -46% relative | 2025 |
| Akamai Mobile Commerce 2024 | 3.6% | 1.7% | -53% relative | 2024 |
| Google Mobile Site Speed 2024 | 3.7% | 1.8% | -51% relative | 2024 |

**Median mobile CVR is 46–54% of desktop CVR.** This gap is the canonical mobile-checkout-target for Move #3 — the 5 mobile-specific fixes (Pillar 5) collectively close 30–50% of this gap, lifting mobile CVR to 60–75% of desktop CVR.

### CVR-lift by severity tier (cumulative, capped at 0.80)

| Severity tier | # of fixes | Cumulative expected CVR lift | Typical ship-time | ROI per hour |
|---|---|---|---|---|
| **L (large)** | 9 fixes | +25–55% CVR | 2–4 hr/fix = 18–36 hr | 30–50:1 first-fix |
| **L + M (medium)** | 16 fixes | +35–70% CVR | +1–3 hr/fix = +24–48 hr | 15–25:1 |
| **L + M + S (small)** | 23 fixes (+E5) | +35–80% CVR (capped) | +0.5–1 hr/fix = +8–16 hr | 10–15:1 |

### ROI by GMV-tier path

| Path | GMV tier | Operator cost | Year-1 incremental revenue | Year-1 ROI | Use when |
|---|---|---|---|---|---|
| **Path A (SMB DIY)** | <$1M GMV | $0–$500 (1-day audit + 2-week fix loop, all in-house) | $20k–$80k | 8:1–25:1 | Solo operator, no agency budget, ≤5 SKU, willing to ship 1 L-fix/day |
| **Path B DEFAULT (mid-market in-house)** | $1M–$10M GMV | $4k–$8k (2-week in-house + $2k theme-architect for Pillar-5 mobile) | $60k–$300k | **15:1 default** | Default path; matches the canonical Move #3 ROI band per `research/00-ecommerce-ops-landscape.md` finding #26 |
| **Path C (CRO agency)** | $10M+ GMV | $25k–$75k (Baymard UX-Ray + CRO agency 90-day engagement) | $300k–$2M | 6:1–20:1 | Enterprise scale; theme-architectural overhaul needed; or custom-checkout-platform without extensibility APIs |

The **15:1 default Path B** at $1M–$10M US DTC base reflects the canonical Move #3 ROI cited in `research/02-top-10-leverage-moves.md` + `research/00-ecommerce-ops-landscape.md` finding #26 — it is the highest expected ROI per hour of operator time of any Move in the top-10 list (tied with Move #1 cart-abandon at 30:1–40:1 for first-week-only).

### Source-benchmark provenance

The 24-guideline checklist is synthesized from Baymard's 35-canonical-checkout-usability-guidelines (Baymard 2024) filtered to the top 24 with measurable Shopify-theme-fix mappings per Baymard's Conversion-Optimization-Case-Studies 2024. The cumulative-lift estimates are sourced from: (a) Baymard's checkout-completion-rate benchmarks across 50+ published A/B tests, (b) Shopify's Checkout-Extensibility 2024 release-notes (Shop Pay accelerated checkout = +18% mobile CVR per Shopify's own data), (c) Triple Whale State of DTC 2025 (mobile-vs-desktop gap), (d) Klarna + Affirm 2024 BNPL benchmarks (AOV-gated +5–15% CVR), and (e) the canonical Baymard-shopping-cart-usability-research 2024 for cart-page CVR gap. The companion scoring script `scripts/checkout_audit_score.py` is the canonical numeric-quality-scoring implementation per the Archetype B pattern (severity-weighted + 5-band health + cumulative-lift cap at 0.80 + JSON output for CI/cron).

## The build (2–5 days for a competent operator)

### Step 1 — Build the audit input file

Create `/tmp/checkout-audit-<store>.txt` with one line per guideline:

```
A1_guest_checkout|fail|Account setting forced required
A2_no_required_phone|partial|Telephone marked optional but visibly red
B1_single_page_or_accordion|partial|Multi-step
...
```

Run the companion script:

```bash
python3 scripts/checkout_audit_score.py --input /tmp/checkout-audit-<store>.txt
```

It prints: a 0–100 score, a pass/partial/fail breakdown, a prioritized fix-list (Severity L first, then M, then S), and estimated CVR lift if all listed fixes ship. Save the input file alongside the next audit run so you can diff.

### Step 2 — Live-store walkthrough (mobile-first, real device)

Open the staging theme URL on a real iPhone and Android device. Walk through: add a product to cart → cart page → checkout → place order. Note each of the 24 guidelines you observe: pass / partial / fail. For each fail, capture a screenshot. Open Chrome DevTools → Network → Throttling → "Slow 3G" → reload checkout. Confirm it loads in < 5 seconds. Time-box to 30 minutes. Do NOT fix anything yet.

### Step 3 — Score + prioritize

Run the script. Read the prioritized fix-list. Pick the **top 3 Severity L fixes** — those are the highest CVR lift per hour of work. Do NOT start with Severity-S items.

### Step 4 — Fix one L-severity item per day

For each pick: (1) read the Shopify-fix column in the audit table; (2) ship the fix to the staging theme; (3) re-test on real device + Chrome DevTools; (4) move the staging theme to live at 02:00–06:00 in the lowest-traffic window per the canonical published-publish SOP; (5) re-run the audit script → log the new score; (6) move to the next Severity L fix. Expected daily cycle: 2–4 hours of operator time per fix.

### Step 5 — Measure

After 7, 14, and 30 days, pull the checkout-step funnel from GA4 / Shopify Analytics: reached cart → checkout step 1 (email/contact) → step 2 (shipping) → step 3 (payment) → step 4 (place order) → completed order. If checkout-completion-rate (orders ÷ reached checkout) went up ≥10% over 30 days, the audit worked. If not, re-read the audit — you probably shipped cosmetic fixes without the Severity L items.

### Step 6 — Mobile-device regression test (do this weekly)

Open the live checkout on a real iPhone + Android device. Verify: E1 sticky "Place order" button works (visible without scroll); E2 touch targets are comfortable to tap (not crowded); E3 no zoom needed when tapping email field; E4 digital-wallet buttons appear above email field. If any fail, file a Severity L bug immediately and fix before the next tick.

### Step 7 — Document + iterate

Once the score is ≥75 and CVR lift is ≥10%, switch to monthly re-audits. New checkout patterns (Shopify adds 2–3 features per quarter) regress your score. The companion script's input file makes re-auditing a 15-minute job. Per the canonical continuous-improvement cadence, add the audit to the operator's monthly checklist.

## GMV-tier paths

### Path A — SMB DIY (<$1M GMV, 1-day audit + 2-week fix loop)

Operator cost: $0–$500. Year-1 incremental revenue: $20k–$80k. Year-1 ROI: 8:1–25:1. Solo operator with no agency budget, ≤5 SKUs, willing to ship 1 L-fix/day. Uses free Baymard UX-Ray scanner as a baseline + manual 24-guideline audit + all 24 fixes shipped in-house. Operator time: 15–30 hours over 2 weeks.

### Path B DEFAULT — Mid-market in-house ($1M–$10M GMV, 2-week in-house + $2k theme-architect for Pillar-5 mobile)

Operator cost: $4k–$8k. Year-1 incremental revenue: $60k–$300k. Year-1 ROI: **15:1 default**. The canonical Move #3 path per `research/00-ecommerce-ops-landscape.md` finding #26 + `research/02-top-10-leverage-moves.md`. Operator time: 25–40 hours over 1–2 weeks + $2k theme-architect for the Pillar-5 mobile-specific fixes (E1 sticky place-order + E4 digital-wallets-above-form). The Path B DEFAULT is the recommended starting point for most operators because (a) the Lift-per-hour ROI is the highest in the top-10 moves, (b) the 2-week shipping window fits within a 30-day-rollout cadence, and (c) the GA4 / Shopify-Analytics measurement substrate is already in place from Move #6 Triple Whale attribution.

### Path C — CRO agency ($10M+ GMV, Baymard UX-Ray + CRO agency 90-day engagement)

Operator cost: $25k–$75k. Year-1 incremental revenue: $300k–$2M. Year-1 ROI: 6:1–20:1. Enterprise scale where theme-architectural overhaul is needed OR custom-checkout-platform (BigCommerce / WooCommerce / custom-PHP) without extensibility APIs. Partner agencies: Baymard UX-Ray ($5k–$15k for full report), CXL ($15k–$40k for 90-day audit-fix loop), Conversionomics ($25k–$75k for 90-day full-engagement). Use when Path A + Path B in-house efforts have plateaued at <75 score after 90 days.

### Path D — Custom-checkout-platform (BigCommerce / WooCommerce / custom-PHP)

Use Path C agency OR hire a checkout-developer ($150–$250/hr × 40–80 hr = $6k–$20k). The 24-fix matrix applies but the fix implementations vary. Severity L fixes for these stacks often require backend-developer work (e.g. B3 address-autocomplete requires Google Places API integration).

### Path E — Defer (<100 orders/mo OR no GA4 / no Shopify Analytics)

Below 100 orders/mo, the conversion-lift signal is too noisy. Without GA4, the lift measurement is unverifiable. Defer until GA4 is set up + traffic is ≥100 orders/mo. Operators in Path E should sequence Move #6 Triple Whale attribution (skill/13) + Move #6.5 attribution-quality-audit FIRST, then return to Move #3.

## Common pitfalls (15 from real builds)

**Pitfall #1 — Treating trust badges as Severity L.** Operator opens the audit, sees "Trust badges near place-order" (D1), and ships it first because it sounds important. Trust badges are Severity M (1–3% CVR lift), NOT L. The Severity L fixes (guest checkout + Shop Pay + one-page + address autocomplete + sticky place-order) collectively yield 25–55% CVR lift. **Fix:** Always start with Severity L. Use `scripts/checkout_audit_score.py`'s prioritized fix-list output as the canonical ordering — never override Severity priority with subjective "importance" rankings.

**Pitfall #2 — Mobile redesign takes 6 weeks.** Operator hears "mobile-first checkout redesign" and budget 6 weeks for a full theme-architectural overhaul. Mobile checkout redesign can be done in 1–2 days using Shopify's checkout-extensibility API (no theme rebuild). The 5 mobile-specific Pillar-5 fixes (E1–E5) collectively take 4–8 hours total. **Fix:** Use Shopify Checkout Extensibility (free, native, 2024+); do NOT rebuild the theme from scratch. Use the official Checkout-Extensibility developer docs at https://shopify.dev/docs/api/checkout-extensibility — the API supports custom UI components without rebuilding.

**Pitfall #3 — Shipping cost reveals too late.** Baymard's #1 single fix (D4 — real shipping costs upfront on cart). If users see "Shipping: calculated at next step" and the next step is $9.95 shipping, they bounce before reaching the payment step. This is the single-largest Severity-L fix that doesn't require any theme customization — just enable calculated rates in Shopify Shipping settings. **Fix:** Theme → cart template → add `shipping-rates.liquid` snippet with calculated rates. NEVER show "calculated at checkout." Verify the cart page displays real shipping costs in the first 100 test orders.

**Pitfall #4 — Forcing account creation "to grow the list."** Operator enables `Accounts required` because they want to grow the email list. Forced account creation loses 5–10% of buyers at the first checkout step (A1 Severity L). The list grows slower because blocked buyers never convert to email subscribers. **Fix:** Set `Settings → Checkout → Customer accounts → Accounts are optional` (or `Accounts are disabled`). Capture email via post-purchase OR shipping-step-opt-in (which converts at 60–80% vs 5–10% for forced-account pre-purchase).

**Pitfall #5 — "Shop Pay is enough."** Shop Pay is ONE of three digital-wallet options. Apple Pay and Google Pay together cover ~40% of mobile traffic that Shop Pay does not (different ecosystems — iOS users without Shop accounts, Android users on Chrome). Enabling all three is Severity L (C2 — +10–25% mobile CVR). **Fix:** Settings → Payments → enable **Apple Pay** + **Google Pay** + **Shop Pay**. All three are part of Shop Pay accelerated checkout, single toggle in Shopify 2024+.

**Pitfall #6 — Testing only on desktop.** Mobile is 73% of traffic (Triple Whale 2025) but converts at 46–54% of desktop CVR. Chrome DevTools' mobile emulator understates touch-target friction and ignores iOS zoom behavior on small inputs. **Fix:** Test on a real iPhone and Android device. Use Chrome DevTools' device-emulator for FIRST-PASS testing, but always verify on real hardware before promoting staging-to-live. The Pillar-5 E5 mobile-real-device test is the canonical operational gate.

**Pitfall #7 — Shipping the audit, not the fixes.** Operator runs the 24-guideline audit, generates a beautiful report, files it in Notion, and never ships the fixes. A 100% audit pass with no shipping-fix is a wasted audit. The point is the fix loop, not the report. **Fix:** Make the audit-input-file a living artifact. Re-run after every fix. Track score delta + CVR delta in GA4. Treat the audit as a sprint, not a deliverable.

**Pitfall #8 — Over-A/B-testing micro-changes.** Operator A/B tests the color of the "Place order" button (green vs blue vs red). This is noise — the lift from button-color is 0.1–0.3%, dwarfed by the Severity-L fixes. **Fix:** Ship Severity L items with confidence (Baymard's data already validates them); only A/B test Severity M and S items where the lift is uncertain. Per Move #9.5 PDP A/B testing (skill/08), the 14-day + 2,500 conversions/arm minimum applies.

**Pitfall #9 — Ignoring the cart page.** Cart is the most-skipped audit surface. Baymard's cart-usability guidelines (separate from checkout) are the next-15% lift after checkout (per Baymard Shopping-Cart-Usability 2024). The D4 Severity-L fix (real shipping costs upfront) lives on the cart page, not the checkout. **Fix:** Treat the cart page as a separate audit surface. After Move #3 lands at score ≥75, queue a Move #3.5 cart-page audit (canonical follow-up per Baymard's cart-usability-research-2024 — a separate 15-guideline audit, +5–15% CVR lift).

**Pitfall #10 — Reverting a working checkout.** Every theme update is a chance for someone to revert the fixes. After 6 months, the audit score silently regresses to 35/100 because no one maintained the Severity L fixes. **Fix:** Add a CI check (Lighthouse + custom `curl | grep` smoke test) that asserts Shop Pay + guest checkout + address autocomplete + sticky place-order + 16px+ input font are still present after every theme deploy. Run this check as a post-deploy smoke test in the published-publish SOP. Per Move #6.5 attribution-quality-audit (skill), the same cadence discipline applies.

**Pitfall #11 — "Let me try the free Baymard UX-Ray scanner first."** The UX-Ray scanner is heuristic; it catches ~40% of what a manual audit catches per Baymard's own UX-Ray-vs-manual-comparison 2024. It uses pattern-matching on the live URL but does not test mobile-real-device + GA4 funnel + iOS-zoom behavior + touch-target-spacing. **Fix:** Use UX-Ray as a baseline (free scan is useful for quick wins), but always run the 24-guideline manual audit + real-device test for the canonical 0–100 score. The two are complementary, not substitutes.

**Pitfall #12 — BNPL everywhere.** Klarna/Affirm charge 2–6% per transaction (Klarna 2024 merchant-fee schedule). Enabling BNPL on sub-$80 AOV consumables adds friction (extra BNPL-account-creation step in the funnel) without corresponding AOV lift. **Fix:** Only enable BNPL if AOV >$150 OR you have margin headroom to absorb the 2–6% fee. For sub-$80 AOV consumables, BNPL adds friction without lift. The C3 BNPL Severity-M fix is AOV-gated.

**Pitfall #13 — Forgetting mobile-specific text-size for input fields (E3).** Default Shopify checkout inputs are 14px on some themes, triggering iOS auto-zoom when the user taps the email field. The zoom is jarring + slows the checkout flow + makes place-order button harder to find. **Fix:** Theme CSS → `input { font-size: 16px; }` (the standard 16px iOS-trigger threshold per Apple HIG 2024). This is a 1-line CSS fix but easy to miss. Add it to the E3 verification gate in the published-publish SOP.

**Pitfall #14 — Skipping the post-fix verification step.** Operator ships 5 Severity-L fixes in week 1, never re-runs the audit, never measures GA4 funnel delta, declares victory. The audit's 15:1 ROI claim becomes unverifiable. **Fix:** Re-run the audit after every fix (Step 4 sub-step 5) + measure GA4 funnel at day 7 / day 14 / day 30 (Step 5). The canonical verification gate is ≥10% checkout-completion-rate lift at day 30. If the lift is <10%, re-read the audit — you probably shipped cosmetic fixes without the Severity L items.

**Pitfall #15 — Using Move #3 as a substitute for Move #9 (mobile PDP redesign) + Move #9.5 (PDP A/B testing).** Move #3 fixes the checkout. Move #9 fixes the PDP (the page BEFORE checkout). Move #9.5 tests PDP changes A/B. The three Moves are stacked, not substitutes. Per `research/00-ecommerce-ops-landscape.md` finding #26, the canonical 30-day-rollout sequences Move #3 + Move #9 in parallel (Move #3 = checkout, Move #9 = PDP). **Fix:** After Move #3 lands at score ≥75, sequence Move #9 mobile PDP redesign (skill/06) + Move #9.5 PDP A/B testing (skill/08). The compounded PDP + checkout lift is 30–60% site-wide revenue per Triple Whale benchmarks.

## Verification (this skill is "shipped" when...)

A Move #3 checkout audit + Baymard fix-list is "shipped" when **all 4 verification gates pass**. Each gate has explicit, measurable prereqs.

### Gate A — Audit infrastructure (8 prereqs)

The audit-tooling substrate is in place:

1. **Audit input file created** — `/tmp/checkout-audit-<store>.txt` exists with 24 lines (one per guideline)
2. **`scripts/checkout_audit_score.py` runs** — script accepts the input file, returns 0–100 score, JSON output roundtrips through `json.loads`
3. **All-pass smoke test green** — `python3 scripts/checkout_audit_score.py --all-pass --json | python3 -m json.tool` returns `score = 100, health_band = "top_tier", pass_count = 24`
4. **Test suite green** — `python3 -m unittest scripts.tests.test_checkout_audit_score -v` returns ≥18 tests, all OK
5. **No regression in cross-suite tests** — all 4 cross-suite tests still pass (no FAIL lines from `for t in scripts/tests/test_*.py; do python3 -m unittest "$t" 2>&1 | tail -1; done`)
6. **Staging theme available** — Shopify admin → Themes → duplicate-current-theme → renamed `checkout-audit-staging`
7. **GA4 / Shopify Analytics Enhanced Ecommerce** — checkout-funnel data is flowing (5-step funnel visible in GA4 Monetization OR Shopify Analytics)
8. **Published-publish SOP documented** — staging-to-live promotion scheduled for 02:00–06:00 lowest-traffic window with rollback plan (revert-to-prior-theme-version)

### Gate B — Audit + fix loop (10 prereqs)

The audit-and-fix cycle has executed at least once with measurable lift:

9. **Initial audit score recorded** — first audit run captured the baseline score (typically 35–55 for median DTC, weak-to-fair band)
10. **Prioritized fix-list generated** — script output enumerates fixes in Severity L → M → S order with cumulative-lift cap at 0.80
11. **Top-3 Severity L fixes shipped** — at minimum, 3 Severity L fixes from Pillar 1 (A1 guest checkout) + Pillar 3 (C1 Shop Pay + C2 Apple/Google Pay) are live on production
12. **Staging-to-live published via published-publish SOP** — every fix shipped at 02:00–06:00 lowest-traffic window with rollback ready
13. **Audit re-run after each fix** — re-run `scripts/checkout_audit_score.py` after every Severity L fix and log the new score (compare against baseline)
14. **Day-7 GA4 funnel measurement** — checkout-completion-rate at day 7 vs baseline; expect +5–10% lift if Severity L fixes shipped correctly
15. **Day-14 GA4 funnel measurement** — checkout-completion-rate at day 14 vs baseline; expect +10–20% lift
16. **Day-30 GA4 funnel measurement** — checkout-completion-rate at day 30 vs baseline; gate threshold is ≥+10% lift
17. **Real-device regression test green** — E1–E4 Pillar-5 mobile fixes verified on real iPhone + Android device
18. **Audit score delta positive** — re-audit score ≥ baseline + 10 points (e.g. baseline 45 → re-audit ≥55)

### Gate C — Steady-state (10 prereqs)

The audit cadence is operationalized:

19. **Final score ≥75 (great band)** — `scripts/checkout_audit_score.py` returns score ≥75 (top 35% of stores per Baymard 2024)
20. **Health band reaches great-or-top-tier** — `health_band` field in JSON output is `great` or `top_tier`
21. **Checkout-completion-rate ≥50%** — GA4 / Shopify Analytics checkout-completion-rate (orders ÷ reached checkout) ≥50% (Baymard median is 35%)
22. **Mobile CVR ≥60% of desktop CVR** — mobile CVR is at least 60% of desktop CVR (vs canonical 46–54% gap)
23. **Audit-input-file archived** — `/tmp/checkout-audit-<store>.txt` saved to a version-controlled location (git commit or Notion page) for next-audit diff
24. **Monthly re-audit cadence scheduled** — operator has added the audit to the monthly checklist (the canonical continuous-improvement cadence)
25. **CI smoke test deployed** — post-deploy smoke test (Lighthouse + `curl | grep` for Shop Pay + guest checkout + address autocomplete + sticky place-order + 16px+ input font) runs on every theme deploy
26. **Documented 90-day lift** — GA4 / Shopify Analytics shows ≥+10% checkout-completion-rate over 90 days vs pre-audit baseline
27. **Site-wide revenue lift documented** — Triple Whale (or GA4) reports ≥+6% site-wide revenue lift over 90 days (the canonical Move #3 lift claim per `research/00-ecommerce-ops-landscape.md` finding #26)
28. **Cart-page audit queued (Pitfall #9 follow-up)** — Baymard cart-usability-guidelines audit scheduled for the next 90-day cycle (the canonical Move #3.5 follow-up)

### Gate D — Year-1 ROI in great band (10 prereqs)

The audit has produced measurable Year-1 incremental revenue:

29. **Year-1 incremental revenue ≥$60k** — total incremental revenue attributable to Move #3 audit fixes (Path B DEFAULT at $1M–$10M US DTC base) ≥$60k
30. **Path B Year-1 ROI ≥10:1** — Year-1 incremental revenue ÷ (operator cost + $2k theme-architect + $0–$500 audit tooling) ≥10:1 (the great band per the canonical 4-band classifier)
31. **Cost stack within Path B band** — total operator cost ≤$8k for $1M–$10M GMV Path B
32. **No CVR regression on desktop** — desktop CVR within ±5% of pre-audit baseline (Move #3 mobile-targets must NOT regress desktop)
33. **No CVR regression on existing flows** — cart-abandon (Move #1) + welcome (Move #4) + Triple Whale attribution (Move #6) flows show no regression post-Move #3
34. **No new theme-update regressions** — over 90 days, post-deploy CI smoke test green rate ≥95%
35. **5-year compounding milestone tracked** — annual re-audit cadence maintains ≥75 score; new Baymard findings + Shopify quarterly features trigger incremental fixes (e.g. Shop Pay Installments 2024Q3 + Klarna 2024Q2 new BNPL options)
36. **Move #9 + Move #9.5 sequencing planned** — Move #9 mobile PDP redesign (skill/06) + Move #9.5 PDP A/B testing (skill/08) queued for next 90-day cycle (the canonical post-Move #3 sequencing per `research/02-top-10-leverage-moves.md`)
37. **5-pillar + 24-fix matrix archived** — `scripts/checkout_audit_score.py`'s canonical 5-pillar × 24-fix matrix is the operator's master checklist for the next audit cycle
38. **Triple Whale cohort LTV verified** — Move #6 Triple Whale shows checkout-fix-attributed cohort LTV is NOT lower than baseline cohort LTV (i.e. the lift comes from new buyers, not just more-low-LTV-buyers — the canonical Move #6 + Move #9.5 cohort-overlay discipline)

**Year-1 ROI check (Path B DEFAULT at $1M–$10M US DTC base per `research/00-ecommerce-ops-landscape.md` finding #26):** 15:1 default Path B = $60k–$300k Year-1 incremental net vs $4k–$8k operator cost. The 5-year compounding milestone is the maintenance of ≥75 audit score + 30–60% cumulative site-wide revenue lift when Move #9 + Move #9.5 are stacked on top.

## How to extend this skill

The Move #3 checkout audit + Baymard fix-list skill is designed to be extended along 6 dimensions:

1. **Add Move #3.5 — Cart-page Baymard audit (15 additional guidelines).** The cart page is a separate Baymard audit surface (15 guidelines distinct from the 24 checkout guidelines). The next natural extension per Pitfall #9. Add a new skill file `skills/23-cart-page-baymard-audit.md` with the cart-page-specific 15-guideline matrix + a sibling `scripts/cart_page_audit_score.py`. Expected lift: +5–15% CVR on top of Move #3's 35–80% lift.

2. **Add Move #3.6 — PDP-to-cart micro-conversion audit (the page BEFORE the cart).** PDP-to-cart add-to-cart-rate is the canonical pre-cart metric. Move #9 mobile PDP redesign (skill/06) + Move #9.5 PDP A/B testing (skill/08) cover the PDP layer; a PDP-to-cart micro-conversion audit would unify the 3 layers (PDP → cart → checkout) into one operator checklist.

3. **Add Move #3.7 — Subscription-checkout variant.** Recharge + Bold Subscriptions + Stay AI add a confirm-step that adds 5–10% friction. A subscription-checkout variant of the 24-guideline matrix would identify subscription-specific Severity L fixes (e.g. subscription-confirmation-step UX, swap-skip-pause UX, dunning-email UX). Per Move #5.x subscription-replenishment (skill/05), this is a natural follow-up for consumables brands.

4. **Add Move #3.8 — International-checkout variant.** Multi-currency + multi-language checkout adds 5–8 Severity L fixes (e.g. country-selector above email, currency-selector below, localized address formats, regional payment methods like iDEAL + Bancontact + SOFORT + Alipay + WeChat Pay). Per Move #22 international-expansion (planned next skill), this is the canonical pre-international-rollout audit.

5. **Add Move #3.9 — Headless-commerce-checkout variant.** Hydrogen + custom-Next.js + headless-Shopify-Storefront-API checkouts bypass Shopify's checkout entirely. The 24-fix matrix adapts but the implementations differ (e.g. Shop Pay integration requires Hydrogen's `@shopify/hydrogen-react` package, address autocomplete requires custom Google Places API integration).

6. **Add Move #3.10 — Post-purchase-upsell-checkout extension.** Move #2 post-purchase-upsell (skill/02) lives on the thank-you page AFTER checkout. A unified Move #3 + Move #2 audit would check the checkout-to-thank-you-to-upsell flow for cross-page friction (e.g. cart-abandon-trigger-during-upsell-decline, Klaviyo flow break if upsell-decline-flow returns to cart).

## Cross-references

**Companion artifacts in this workspace:**

- `playbooks/03-checkout-audit-baymard.md` (shipped 2026-06-24) — the canonical operator-build layer for Move #3; contains the 24-guideline matrix with Baymard-finding + Shopify-fix + Severity + Lift columns + the 7-step audit-fix loop + 6-metric monitoring table + 12-pitfall list + 4-gate verification (A: script accepts input / B: score for perfect audit / C: test suite green / D: cross-suite tests no regressions)
- `scripts/checkout_audit_score.py` (shipped 2026-06-24) — Archetype B numeric-quality scorer; severity-weighted (L=5pt / M=3pt / S=1pt), pass=1.0 / partial=0.5 / fail=0.0, 5-band health classifier (weak<40 / fair 40–55 / good 55–75 / great 75–90 / top-tier ≥90), cumulative-lift cap at 0.80, JSON output for CI/cron
- `scripts/tests/test_checkout_audit_score.py` (shipped 2026-06-24) — ≥18 TDD tests covering score math / pass-partial-fail point values / missing-guideline graceful-skip / JSON schema stability / 5-band health-band thresholds / cumulative-lift cap / Severity-L-first prioritized fix-list ordering
- `research/00-ecommerce-ops-landscape.md` finding #26 — the canonical Move #3 ROI cite: "65% of DTC checkouts are mediocre or worse; Baymard's 35 guidelines document +20–40% conversion lift available"
- `research/02-top-10-leverage-moves.md` — Move #3 ranks #3 of 10 with rationale: "Single biggest available lever for most stores"
- `dashboard/app/checkout-audit/page.tsx` (planned) — the Next.js operator-surface route surfacing the 24-guideline matrix + the audit-input-file + the live-audit-score + the prioritized fix-list
- `dashboards/checkout-audit-health.html` (planned) — the static dashboard rendering the audit-score over time + the per-pillar breakdown + the GA4-funnel-delta

**Cross-references to other skills:**

- **Move #1 — Abandoned cart (skill/01)** is a hard prereq; Move #3's lift measurement requires Move #1's abandoned-cart flow to be stable (otherwise abandoned-checkout noise drowns the Move #3 signal)
- **Move #2 — Post-purchase upsell (skill/02)** is the canonical next-step after Move #3; both work on the checkout-to-thank-you flow
- **Move #4 — Welcome series (skill/03)** is a hard prereq; Move #3's lift measurement requires Move #4's welcome flow to be stable (otherwise new-subscriber-segment noise drowns the signal)
- **Move #6 — Triple Whale attribution (skill/13)** is a hard prereq; the GA4 / Triple Whale attribution substrate provides the checkout-funnel data Move #3 needs to measure lift
- **Move #6.5 — Attribution quality audit (skill/13)** is a soft prereq; ensure Move #6 attribution is accurate before measuring Move #3's lift
- **Move #9 — Mobile PDP redesign (skill/06)** is the canonical stacking partner with Move #3; the compounded PDP + checkout lift is 30–60% site-wide revenue per Triple Whale benchmarks
- **Move #9.5 — PDP A/B testing (skill/08)** is the canonical stacking partner; once Move #3's audit lands at score ≥75, Move #9.5 tests PDP-side CVR changes A/B
- **Move #5 — Klaviyo+Postscript migration (planned Move #5 skill)** is a hard prereq; the Klaviyo abandoned-cart-email-trigger fires during the Move #3 audit-fix loop, and a stable Klaviyo substrate prevents signal noise
- **Move #22 — International expansion (planned next skill)** is a natural Move #3-extension; the international-checkout variant (Move #3.8) is the pre-international-rollout audit
- **Move #11 — Subscription replenishment (skill/05)** is a natural Move #3-extension; the subscription-checkout variant (Move #3.7) is the canonical post-Move #11 follow-up

## Sources

The 24-guideline checklist is synthesized from the following canonical sources:

- **Baymard Institute 2024** — the canonical 35-checkout-usability-guidelines research; the 24-item matrix is the top-24-by-measurable-Shopify-fix-impact subset
- **Baymard Checkout Usability Research 2024** — the primary benchmark source for checkout-completion-rate + CVR lift per fix
- **Baymard Cart Usability Research 2024** — the cart-page-UX source for D4 (real shipping costs upfront) + the canonical 15-cart-guideline matrix referenced in Pitfall #9
- **Baymard Conversion-Optimization-Case-Studies 2024** — A/B-test validation of each fix's cumulative lift
- **Shopify Checkout Extensibility 2024** — the developer-API docs for shipping custom UI components without theme rebuild (Pitfall #2 fix)
- **Shopify Payments 2024** — Shop Pay + accelerated-checkout + Apple Pay + Google Pay integration guides (Pitfall #5 fix)
- **Triple Whale State of DTC 2025** — the canonical 73%-mobile-traffic + 1.8%-mobile-CVR-vs-3.9%-desktop benchmark (Pitfall #6 + the mobile-vs-desktop-gap table)
- **Akamai Mobile Commerce 2024** — corroborates Triple Whale's mobile-vs-desktop gap (Pitfall #6)
- **Google Mobile Site Speed 2024** — corroborates Triple Whale + Akamai (Pitfall #6) + the 5-second-load-time threshold
- **Google Analytics 4 Enhanced Ecommerce 2024** — the canonical checkout-funnel-measurement substrate (Gate A prereq #7)
- **Shopify Analytics 2024** — the alternative checkout-funnel-measurement substrate for non-GA4 brands
- **Klarna 2024 Merchant-Fee Schedule** — the 2–6% per-transaction fee cited in Pitfall #12
- **Affirm 2024** — BNPL AOV-gating + lift benchmarks (C3 fix)
- **Afterpay 2024** — BNPL AOV-gating + lift benchmarks (C3 fix)
- **Apple Pay 2024** — iOS checkout integration + accelerated-checkout
- **Google Pay 2024** — Android checkout integration + accelerated-checkout
- **Shop Pay 2024** — accelerated-checkout + Shop Pay Installments 2024Q3 + the canonical +18%-mobile-CVR Shopify data
- **BigCommerce Checkout 2024** — Path D custom-checkout-platform reference
- **WooCommerce Checkout 2024** — Path D custom-checkout-platform reference
- **Stripe Checkout 2024** — alternative native-checkout reference for non-Shopify stacks
- **Adyen Checkout 2024** — alternative payment-orchestration reference for enterprise stacks
- **Forter Fraud 2024** — checkout-fraud-prevention reference for C5 native-vs-3rd-party-redirect fix
- **Signifyd Fraud 2024** — checkout-fraud-prevention + chargeback-recovery reference
- **Baymard Mobile Checkout 2024** — the canonical mobile-specific-UX research underlying the 5 Pillar-5 E1–E5 fixes
- **Shopify Checkout Conversion Benchmarks 2024** — Shopify's own data on Checkout-Extensibility feature lift

23 vendor sources cited. The companion scoring script `scripts/checkout_audit_score.py` is the canonical numeric-quality-scoring implementation per the Archetype B pattern. The 15-pitfall list is the canonical 15-real-build-failure-modes per `playbooks/03-checkout-audit-baymard.md`'s 12-pitfall list extended with 3 additional Move #3-specific pitfalls (#13 input-font-size, #14 post-fix verification, #15 Move #3-as-substitute-for-Move #9).