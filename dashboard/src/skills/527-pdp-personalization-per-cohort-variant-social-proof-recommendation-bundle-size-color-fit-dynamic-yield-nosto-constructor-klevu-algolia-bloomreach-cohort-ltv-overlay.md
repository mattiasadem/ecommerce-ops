---
name: pdp-personalization-per-cohort-variant-social-proof-recommendation-bundle-size-color-fit-dynamic-yield-nosto-constructor-klevu-algolia-bloomreach-cohort-ltv-overlay
title: PDP personalization — per-cohort variant + social-proof + recommendation + bundle + size/color/fit on the product detail page (Dynamic Yield / Nosto / Constructor / Klevu / Algolia Recommend / Bloomreach / Shopify Search & Discovery Personalization / Rebuy / LimeSpot / Octane AI / Fit Finder)
category: pdp-personalization
tier: 1
priority: P0
default_move: 47.5.1
year_1_roi_band: "5:1–18:1"
sms_friendly: false
last_updated: 2026-10-06
sources: [dynamic-yield-2024, nosto-2024, constructor-2024, klevu-2024, algolia-2024, bloomreach-2024, rebuy-2024, limespot-2024, octane-ai-2024, shopify-search-discovery-2024, shopify-plus-2024, bigcommerce-2024, woocommerce-2024, salesforce-commerce-cloud-2024, commercetools-2024, klaviyo-segment-2024, triple-whale-cohort-2024, polar-2024, northbeam-2024, optimizely-2024, monetate-2024, baymard-pdp-2024, nielsen-normann-group-pdp-2024, forrester-personalization-engine-2024, gartner-personalization-engine-2024, mckinsey-personalization-2024, bcg-personalization-2024, accenture-personalization-2024, yotpo-2024, loox-2024, judge-me-2024, stamped-2024, fit-finder-2024, true-fit-2024, fit-analytics-2024]
---

# PDP personalization — per-cohort variant + social-proof + recommendation + bundle + size/color/fit on the product detail page

> The cohort-LTV overlay on top of Move #47.5 (PLP personalization) AND the canonical Move #8 (PDP A/B testing) extension. Without PDP personalization, the same PDP shows the same default variant, the same generic social proof ("1,234 reviews"), the same generic "You may also like" carousel, the same generic size chart, and the same generic "Complete the look" bundle to a $2,000-LTV VIP and a first-session anonymous visitor. With it, the VIP sees the premium variant first, the new visitor sees the entry-level variant + "Best seller" social proof, a returning browse-abandoner sees the variant she last viewed, a high-AOV buyer sees the bundle with the highest cross-sell affinity, a discount-driven cohort sees value-prop social proof (no discount badge), and a locale-cohort visitor sees the regional size chart + regional fit-prediction. **PDP→ATC CVR lifts 18–35%, AOV lifts 10–22%, bundle attach-rate lifts 30–60%, returns rate drops 8–18%, and 90-day cohort LTV lifts 14–28%** vs the cohort-agnostic Move #8 baseline (canonical Dynamic Yield 2024 + Nosto 2024 + Constructor 2024 + Rebuy 2024 + Octane AI 2024 + Baymard 2024 + Nielsen Norman Group 2024 + McKinsey 2024 + True Fit 2024 + Yotpo 2024 benchmarks). The skill is the PDP-side cohort-LTV layer that compounds Move #47.5 (PLP personalization) + Move #8 (PDP A/B testing) + Move #13 (AI product recommendation feed) + Move #17 (AI customer service) + Move #61 (personalization) + Move #6 (Triple Whale).

## When to use this skill

You have:
- A Shopify / Ikas / BigCommerce / WooCommerce / Magento / Salesforce Commerce Cloud / commercetools store
- ≥200 SKUs (below this, manual PDP merchandising is fine)
- ≥10,000 sessions/week (below this, the cohort definitions are too thin to learn from)
- Move #47.5 (PLP personalization) shipped — cohorts, Klaviyo segment export, personalization engine live
- Move #8 (PDP A/B testing) shipped — variant testing framework, statistical significance engine
- Move #5 / Move #6 — Klaviyo + Triple Whale / Polar / Northbeam — so you can define cohorts by LTV
- A product variants engine with at least 2 variants per SKU (size, color, bundle, scent, capacity, etc.)
- Social proof layer (Yotpo / Loox / Judge.me / Stamped) so per-cohort review highlighting is possible
- A bundle / upsell engine (Rebuy / LimeSpot / Octane AI / Shopify Bundles) for cohort-aware bundling

You do NOT have:
- Per-cohort variant prioritization (every visitor sees the same default variant first)
- Per-cohort social proof (the same "1,234 reviews" badge for everyone; no review-highlight by cohort)
- Per-cohort recommendations on PDP (the "You may also like" carousel is the same for everyone)
- Per-cohort bundling (the "Complete the look" / "Frequently bought together" bundle is the same for everyone)
- Per-cohort size / color / fit guidance (every visitor sees the same size chart + same "true to size" copy)
- Per-cohort pricing display (discount-driven cohort sees the same discount badge as the full-price cohort)
- A cohort-LTV overlay on PDP (you can see PDP→ATC CVR but not PDP cohort LTV)

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Bombas, Dr. Squatch, MUD\WTR, Graza, Sephora, Nordstrom, Best Buy, REI, Patagonia, Thirdlove, Cuup, Knix, Lululemon, Adidas, Nike, Vuori, Rhone, Buck Mason, Olipop, Magic Spoon, Liquid Death, Haus Labs, Made In.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Per-cohort variant prioritization | Default-variant picks based on cohort (VIP → premium tier; new visitor → entry-level + "Best seller" badge) | Same default variant for everyone | Per-cohort variant picker that learns per-cohort preference from prior cohort purchase pattern |
| Per-cohort social proof | Review-highlight by cohort ("Other [size] buyers with similar skin type loved this shade" / "Verified buyers in your region rate this 4.8/5") | Static "★★★★★ 1,234 reviews" badge | Cohort-LTV-weighted review snippets + cohort-region-rated fit |
| Per-cohort recommendations | "Customers like you also bought" (collaborative filtering × cohort) + per-cohort cross-sell ladder | "You may also like" (random / SKU view history only) | Per-cohort × in-stock × margin × cohort-LTV-aware recs |
| Per-cohort bundling | "Complete the look" / "Frequently bought together" with cohort-aware attach-rate ranking | Static "Add [X] to your cart" | Per-cohort dynamic bundle with cohort-LTV-weighted add-on (VIP → premium add-on; new visitor → starter bundle) |
| Per-cohort size / color / fit | True Fit / Fit Finder / Fit Analytics — size recommendation per cohort (region, return history, fit preference) | Static size chart with no personalization | Cohort-fit-prediction (high-return cohort → 1 size up nudge; VIP → no nudge) |
| Per-cohort pricing display | Discount-driven cohort sees value-prop; full-price cohort sees MSRP; VIP sees "Member price" | Same price for everyone | Per-cohort price ladder with margin protection guardrails |
| Per-cohort urgency / scarcity | "5 left in your size" for cohort (only the cohort that is likely to buy sees the urgency signal) | "Only 3 left!" for everyone | Cohort-aware scarcity (discount-driven cohort suppressed; browse-abandoner cohort shown; VIP never shown) |
| Per-cohort social-share preview | OG image personalized to cohort (new visitor → "Best seller" badge; VIP → "VIP early access" badge) | Static OG image for everyone | Cohort-aware OG image + per-cohort landing-page-from-Social |
| Cold-start handling | Anonymous visitors get cohort-proxy (geo + device + referrer + landing-page category) PDP | Same PDP for all anonymous | Klaviyo browse-history + Triple Whale cohort-LTV proxy |
| Latency | <100ms added TTFB (Dynamic Yield / Nosto edge cache) | <300ms added TTFB | Server-side render PDP personalization, defer JS widget |
| Privacy / consent | Personalization gated on consent (GDPR / CCPA), fallback to cohort-proxy without ID | Personalization ignores consent (GDPR risk + ad-pixel dead-letter) | Per-cohort decisioning (no PII in decision, only cohort ID) |
| Per-cohort A/B test | New cohort variant A vs B shipped, 14-day test, guardrail (margin, AOV) | A/B test on variant but not on cohort | Multi-arm bandit (Thompson sampling) per cohort |
| Cohort-LTV overlay | Triple Whale / Polar / Northbeam shows PDP-visitor cohort 90d LTV ≥+14% vs non-PDP-visitor | No LTV readback | Per-cohort LTV + per-cohort margin + per-cohort repeat-purchase |
| PDP→ATC CVR | ≥10% (with personalization) | 2–3% (no personalization) | ≥15% (best in class: Sephora, Allbirds, Glossier, Thirdlove, Lululemon) |
| Returns rate | <8% (with fit personalization) | 15–25% (no fit personalization) | <5% (best in class: Thirdlove, Cuup, Adidas with True Fit) |

## PDP personalization benchmarks (2024–25)

| Component | Floor | Default | Best in class |
|---|---|---|---|
| PDP→ATC CVR (with personalization) | +6% lift vs cohort-agnostic Move #8 baseline | +18% lift | +35% lift |
| AOV (with personalization) | +5% lift | +10% lift | +22% lift |
| 90-day cohort LTV (with personalization) | +6% lift | +14% lift | +28% lift |
| Bundle attach-rate (with personalization) | +15% lift | +30% lift | +60% lift |
| Returns rate (with fit personalization) | -5% drop | -10% drop | -18% drop |
| Per-cohort variant default-pick acceptance | 50% (cohort picks the default) | 70% | 88% |
| Per-cohort social-proof "verified-buyer" CTR | 3% | 7% | 14% |
| Per-cohort recommendations CTR | 6% | 13% | 22% |
| Per-cohort size-guide acceptance (low return-rate nudge) | 30% | 55% | 75% |
| Personalization-engine coverage (visitors with a cohort assignment) | 40% (logged-in only) | 70% (logged-in + Klaviyo identified) | 90%+ (logged-in + Klaviyo + Triple Whale + browse-history) |
| Cold-start personalization accuracy (proxy cohort) | 50% of personalized CVR | 75% | 90% |
| Per-cohort variant test lift | +5% | +12% | +22% |
| Personalization engine cost per 1k sessions | $0.50 | $1.80 | $4.50 (premium tier with fit-prediction) |

**Median DTC lifts PDP→ATC CVR ~10% and 90-day cohort LTV ~12% with PDP personalization. Best in class lifts CVR ~30% and LTV ~25% with full cohort-LTV overlay + fit-personalization.**

## The build (8–18 hours for a competent operator)

### Step 1 — Pick the PDP personalization engine

| Path | Tool | Cost | When |
|---|---|---|---|
| Path A (Shopify, <10k sessions/wk, budget-conscious) | Shopify Search & Discovery Personalization (native) + Rebuy Lite | Free w/ Shopify + $29/mo Rebuy | <10k sessions/wk, simple cohort definitions, 2-3 PDP widgets |
| Path B (Shopify, 10k–100k sessions/wk, default) | Nosto Starter $250/mo OR Klevu Smart PDP $449/mo + Rebuy $249/mo | $500–$700/mo | 10k–100k sessions/wk, 500–5k SKUs, full PDP widget stack |
| Path C (Shopify Plus, 100k+ sessions/wk) | Dynamic Yield Standard $1,200+/mo + Rebuy Pro $499/mo + True Fit $1k+/mo | $2.7k–$5k+/mo | 100k+ sessions/wk, multi-locale, multi-brand, fit-prediction needed |
| Path D (composable / headless / enterprise) | Algolia Recommend + Dynamic Yield OR Constructor + Rebuy + True Fit | $3k–$12k+/mo | $10M+ GMV, custom cohort definitions, multi-region, fit-prediction at scale |
| Path E (Salesforce Commerce Cloud) | Salesforce Einstein Personalization (bundled) + True Fit | Bundled + True Fit $1k+/mo | $10M+ GMV on SFCC |
| Path F (commercetools) | Constructor OR Bloomreach + Rebuy + True Fit | $3k–$12k+/mo | $10M+ GMV on commercetools |
| Path G (apparel / fit-heavy categories) | True Fit OR Fit Analytics OR Fit Finder (standalone fit-prediction) | $1k–$3k+/mo | Apparel / footwear / intimates where returns-rate >12% is a major margin drag |
| Path H (beauty / shade-heavy categories) | Octane AI + shade-matching quiz + Dynamic Yield | $500–$2k+/mo | Beauty where shade-matching drives >15% of returns |

**Default:** Path B (Nosto or Klevu + Rebuy) for the typical $500k–$5M GMV Shopify brand. Path C (Dynamic Yield + Rebuy + True Fit) once you cross $5M GMV, have a returns rate >12%, or have a multi-locale / multi-brand footprint.

### Step 2 — Define the cohorts (extends Move #47.5 cohort taxonomy)

Reuse the 12-cohort taxonomy from Move #47.5. Add 2 PDP-specific cohorts for the highest-intent page:

| Cohort | Definition | Size (typical $5M GMV) | Primary PDP personalization |
|---|---|---|---|
| Anonymous cold-start | No Klaviyo ID, no customer ID, no Triple Whale match | 40–60% of traffic | Use proxy: geo + device + landing-page category + referrer; entry-level variant + "Best seller" social proof + generic size chart |
| New visitor (1 session) | Klaviyo identified, no purchase, <2 sessions | 15–25% | Entry-level variant first + "Best seller" badge + verified-buyer social proof + generic "What others bought" recs |
| Returning visitor (2–5 sessions, no purchase) | Klaviyo identified, no purchase, browse-history present | 10–20% | Last-viewed variant first + "You viewed this" hook + browse-history category recs |
| First-time buyer (1 order) | 1 order, 0 returns | 5–10% | Cross-sell to category 2 + verified-buyer social proof + "Complete the look" bundle |
| Repeat buyer (2+ orders) | 2+ orders, last order <90d | 3–8% | "Picks for your style" (LTV-weighted) + new-arrivals in past-purchase category + replenishment (if consumable) + loyalty tier-up messaging |
| VIP / Top-10% LTV | Top decile by 365d LTV | 2–5% | Premium variant first + "VIP early access" badge + premium bundle + concierge CTA + no discount badge |
| Lapsed (no order >180d) | Last order >180d, no recent session | 3–8% | Win-back variant + 10–15% incentive (separate from MSRP) + restocked-back-in-stock SKUs + new-arrivals + "Welcome back" copy |
| Subscription customer (Recharge / Skio / Stay AI) | Active subscription | 1–5% | Subscription variant first + replenishment date reminder + subscription-bundle upsell |
| High-AOV buyer (AOV >$200) | Median AOV in last 90d >$200 | 2–5% | Premium variant + bundle + gift-with-purchase + "Member price" |
| Discount-driven (redeemed ≥2 codes in 90d) | Discount-affinity buyer | 5–10% | Suppress discount badge in PDP (margin protection) + value-prop social proof + entry-level variant |
| Browse-abandoner (PDP view in last 7d, no purchase) | PDP-view-history present, no purchase | 5–10% | "Still interested?" hook + that variant + "Your size is back" (if applicable) + cross-sell to category |
| Locale / regional cohort | Geo-IP country + region | varies | Currency, language, regional size chart (US/EU/UK/JP differ), regional inventory, regional fit-prediction |
| **High-return-rate cohort (NEW)** | ≥1 return in last 12mo | 5–15% (apparel-heavy) | 1-size-up nudge on apparel / shade-match nudge on beauty / fit-prediction explicit recommendation |
| **Cohort-LTV high (NEW)** | Top 25% by 365d LTV (broader than VIP) | 25% | "New arrival in your size" + premium add-on + loyalty early-access + concierge CTA |

**Sync cohorts to the PDP personalization engine** — either via Klaviyo Segment export (daily) or via real-time API (preferred, +5–10% personalization accuracy). For Triple Whale, the cohort ID is the canonical ID; the personalization engine reads it server-side at request time via a sub-100ms edge function.

### Step 3 — Configure per-cohort variant prioritization

Default variant for an unpersonalized visitor: typically the cheapest variant (margin) or the best-seller (popularity).

For each cohort, define a default-variant rule:

| Cohort | Default variant logic | Tiebreak 1 | Tiebreak 2 | Tiebreak 3 |
|---|---|---|---|---|
| Anonymous cold-start | Best-seller (popularity) | Newest | In-stock | Margin |
| New visitor | Best-seller (popularity) | Margin (margin-protect) | In-stock | Newest |
| Returning visitor (browse-history) | Last-viewed variant (if in stock) | "Match score" personalized to cohort | Recency | In-stock |
| First-time buyer | Cross-sell affinity (collaborative filtering from past purchase) | Best-seller | Margin | In-stock |
| Repeat buyer | "Picks for your style" (LTV-weighted from past purchase) | New-arrivals in past-purchase category | In-stock | Margin |
| VIP | Premium tier + new-arrivals (margin-weighted) | "Loyalty early-access" | In-stock | Margin |
| Lapsed | "Win-back" (highest-margin new-arrivals + restocked) | Best-seller | In-stock | Margin |
| Discount-driven | Value-prop variant (perceived value, no discount badge) | Best-seller | In-stock | Margin |
| High-AOV | Premium tier | "Complete the look" bundle | In-stock | Margin |
| High-return-rate | 1-size-up (apparel) / shade-match (beauty) | Generic best-seller | In-stock | Margin |
| Browse-abandoner | Last-viewed variant (if in stock) | Browse-history category | In-stock | Margin |

**Guardrail:** every per-cohort variant default must be A/B tested against "best-seller default" for ≥14 days. Only ship the cohort default if it lifts PDP→ATC CVR OR 90-day cohort LTV without breaking margin floor OR returns rate floor.

### Step 4 — Configure per-cohort social proof

Default social proof: aggregate "★★★★★ 1,234 reviews" badge.

For each cohort, personalize the social proof:

| Cohort | Top social-proof signal | Secondary signal | Suppressed signal |
|---|---|---|---|
| Anonymous cold-start | "Best seller" + aggregate stars + recent review count | Verified-buyer count | None |
| New visitor | "Best seller" + "1,234 verified buyers" + 1 verified-buyer review snippet | Aggregate stars | Discount-driven reviews |
| Returning visitor | "Other visitors who viewed this also bought [X]" | Verified-buyer count | Generic "1,234 reviews" |
| First-time buyer | "Verified buyers with similar style preferences rate this 4.8/5" | "What others bought after this" | Discount-driven reviews |
| Repeat buyer | "Other [brand] customers rate this 4.8/5" + "Fit: true to size (78%)" | "What others bought after this" | Discount-driven reviews |
| VIP | "Top-rated by our VIP customers" + 1 detailed VIP review | Verified-buyer count | Discount-driven reviews |
| Lapsed | "Welcome back — 12 new reviews this week" | Verified-buyer count | Discount-driven reviews |
| Discount-driven | Value-prop social proof ("Made with [material]", "Saves [X] vs single-item") | Verified-buyer count | Discount-driven reviews (suppress!) |
| High-return-rate | "Fit recommendation: 78% of buyers in [size] recommend sizing up" | True Fit / Fit Finder widget | Discount-driven reviews |
| Locale / regional | "Rated 4.8/5 by verified buyers in [region]" + regional fit-prediction | Verified-buyer count | Other-region reviews |

**Yotpo / Loox / Judge.me / Stamped integration:** the social proof platform must support cohort-aware review highlighting. Yotpo and Stamped have native cohort-segment integration; Loox and Judge.me require a custom segment export pipeline.

**Pitfall guard:** suppress discount-driven review snippets for the discount-driven cohort (they're already predisposed to discount; surfacing "Got 20% off — worth every penny" reinforces the wrong behavior and trains them to wait for the next code).

### Step 5 — Configure per-cohort recommendations

Beyond variant + social proof, the PDP also has:
- "Customers like you also bought" (collaborative filtering × cohort)
- "Complete the look" (bundle, per cohort)
- "Recently viewed" (session)
- "Frequently bought together" (Rebuy / LimeSpot / Octane AI)
- "What others bought after this" (cross-sell ladder)
- "Trending now" (last 7d, per cohort if possible)

**Cohort-aware recommendations** use a hybrid:
- 60% collaborative filtering (similar cohorts bought)
- 25% content-based (similar SKUs to view history)
- 15% business rules (margin × inventory × editorial picks)

The personalization engine handles the hybrid; the operator's job is to feed it the cohort definitions and let the ML learn. Re-train weekly or on-demand when cohort definitions change.

| Cohort | Recommendation engine weights | Recommendation slot |
|---|---|---|
| Anonymous cold-start | 70% popularity × 30% content-based | "Best sellers in this category" |
| New visitor | 50% popularity × 30% content-based × 20% business-rules | "Best sellers" + "What others bought" |
| Returning visitor (browse-history) | 60% collaborative × 30% content-based × 10% business-rules | "Picks for your style" + "You viewed, you might like" |
| First-time buyer | 70% collaborative (cross-sell from past purchase) × 30% business-rules | "Complete the look" + "Customers like you also bought" |
| Repeat buyer | 50% collaborative × 30% LTV-weighted × 20% business-rules | "Picks for your style" + "New in your size" |
| VIP | 50% LTV-weighted × 30% business-rules × 20% content-based | "VIP early access" + "Premium add-ons" |
| Lapsed | 50% win-back (new-arrivals + restocked) × 30% business-rules × 20% collaborative | "Welcome back" + "What others bought after returning" |
| Discount-driven | 60% value-prop × 30% popularity × 10% business-rules | "Value picks" + "Frequently bought together" |
| High-AOV | 60% LTV-weighted × 30% premium tier × 10% content-based | "Premium add-ons" + "Complete the look" |
| Browse-abandoner | 80% last-viewed category × 20% content-based | "Still interested in [category]?" + "Your size is back" |

### Step 6 — Configure per-cohort bundling (Rebuy / LimeSpot / Octane AI)

Default "Complete the look" / "Frequently bought together" bundle: static editorial pick.

For each cohort:

| Cohort | Primary bundle | Secondary bundle | Suppressed bundle |
|---|---|---|---|
| Anonymous cold-start | Editorial "Best seller" bundle | Starter bundle (entry-level) | None |
| New visitor | Starter bundle (entry-level + 1 add-on) | Editorial bundle | Premium bundle |
| First-time buyer | Cross-sell bundle (1 main + 1 consumable) | Starter bundle | Premium bundle |
| Repeat buyer | "You bought [X], add [Y]" (cross-sell from past purchase) | Loyalty tier-up bundle | Starter bundle |
| VIP | Premium bundle (premium add-on + 1 main) | Concierge-curated bundle | Starter bundle |
| Lapsed | Win-back bundle (1 main + restocked add-on + 10-15% incentive) | Welcome-back bundle | Premium bundle |
| Discount-driven | Value-prop bundle (no discount badge, but perceived value) | Starter bundle | Premium bundle |
| High-AOV | Premium bundle (premium add-on + 1 main + gift) | Concierge-curated | Starter bundle |
| Subscription | Subscription bundle (1 main + subscription add-on + replenishment reminder) | Cross-sell bundle | One-time-purchase bundle |
| Browse-abandoner | "You viewed [X], add [Y]" | "Your size is back" bundle | Editorial bundle |
| High-return-rate | Bundle with size-matched add-on (reduces return risk on the add-on) | Editorial bundle | Cross-sell bundle (which may not fit) |

**Bundle attach-rate measurement:** the personalization engine measures bundle-attach-rate per cohort per day. Re-rank weekly to maximize per-cohort attach-rate × margin.

### Step 7 — Configure per-cohort size / color / fit guidance

This is the highest-leverage PDP personalization sub-step in apparel / footwear / intimates / beauty.

| Cohort | Size guide | Fit prediction | Color / shade recommendation |
|---|---|---|---|
| Anonymous cold-start | Static size chart | Generic "true to size" | Generic color carousel |
| New visitor | Static size chart | Generic "true to size" + 1 review snippet on fit | Generic color carousel |
| Returning visitor (browse-history) | Last-viewed size first | "You viewed [size], others in [size] report [fit]" | Last-viewed color first |
| First-time buyer | Static size chart | Verified-buyer fit ("78% say true to size") | Generic color carousel |
| Repeat buyer | Last-purchased size first | "Based on your last [X] purchase, we recommend [size]" | Last-purchased color family first |
| VIP | Last-purchased size first | Concierge-curated fit | Last-purchased color family first |
| Lapsed | Static size chart | "Welcome back" + verified-buyer fit | Generic color carousel |
| Locale / regional | Regional size chart (US/EU/UK/JP differ!) | True Fit / Fit Finder / Fit Analytics with locale calibration | Regional color preferences |
| **High-return-rate (NEW)** | Static size chart | **1-size-up nudge** (apparel) / **shade-match nudge** (beauty) / **width recommendation** (footwear) | Generic color carousel |

**True Fit / Fit Finder / Fit Analytics integration:** these are the canonical fit-prediction platforms. They use the customer's purchase history across the network to predict fit per cohort. The 3 platforms differ:
- **True Fit:** largest network (17,000+ brands), best for fashion / footwear, $1k–$3k+/mo
- **Fit Finder:** Vue.ai / Fit Analytics, best for fashion / intimates with ML fit-prediction, $1k–$2.5k+/mo
- **Fit Analytics:** Snap-owned, best for fashion, $1k–$3k+/mo
- **Octane AI (beauty):** best for beauty / shade-matching, $500–$2k+/mo

**Returns-rate ROI:** apparel / footwear / intimates / beauty brands with 15–25% returns rate see returns drop to 8–12% with fit personalization (True Fit 2024 + Fit Analytics 2024 benchmarks). At 10,000 orders/year with $80 AOV and 18% returns rate, dropping returns to 10% saves ~$115k/year in shipping + restocking + lost-margin.

### Step 8 — Configure per-cohort pricing display (margin protection)

**Default:** show MSRP for everyone. For discount-driven cohort, suppress the discount badge in row 1 of the PDP (margin protection) and show value-prop messaging instead.

| Cohort | Price display | Discount badge | "Member price" badge | Suppressed signal |
|---|---|---|---|---|
| Anonymous cold-start | MSRP | No | No | "Compare at" |
| New visitor | MSRP | No (don't train discount-affinity) | No | "Compare at" |
| Returning visitor | MSRP | Only if cohort has redeemed codes (Klaviyo segment) | No | "Compare at" |
| First-time buyer | MSRP | No | No | "Compare at" |
| Repeat buyer | MSRP | Yes (loyalty reward) | No | None |
| VIP | "Member price" badge | No (VIP doesn't need discount) | Yes (if applicable) | "Compare at" |
| Lapsed | "Welcome back — 10% off" (separate from MSRP) | Yes (win-back incentive) | No | None |
| Discount-driven | MSRP + value-prop | **No** (suppress to protect margin!) | No | None |
| High-AOV | MSRP | No (premium buyer doesn't need discount) | No | "Compare at" |
| Subscription | MSRP | No | No | None |
| Locale / regional | Regional price (currency-converted) | Per regional pricing strategy | Per regional pricing strategy | Per regional pricing strategy |

**Pitfall guard:** the discount-driven cohort's affinity for discount is a learned behavior, not an inherent trait. Suppressing the discount badge in PDP for this cohort and showing value-prop instead is the canonical "margin-protect" move (Yotpo 2024 + McKinsey 2024 benchmarks).

### Step 9 — Configure per-cohort urgency / scarcity signals

Default "Only 3 left!" for everyone.

| Cohort | Urgency signal | Scarcity signal | Suppressed signal |
|---|---|---|---|
| Anonymous cold-start | "5 left in [size]" | "Selling fast" | None |
| New visitor | "5 left in [size]" | "Best seller" | None |
| Returning visitor (browse-history) | "Your size is almost gone" | "You viewed this — others are too" | None |
| First-time buyer | None (don't pressure) | "Best seller" | None |
| Repeat buyer | None (loyalty trumps urgency) | "Back in stock" | None |
| VIP | "VIP early access — 24h before public" | None (VIP doesn't need scarcity) | "Only 3 left!" |
| Lapsed | None (win-back, not pressure) | "Welcome back" | "Only 3 left!" |
| Discount-driven | "Value pick" (no urgency) | None | "Only 3 left!" |
| High-AOV | None (premium buyer doesn't need urgency) | "Limited edition" | "Only 3 left!" |
| Browse-abandoner | "Your size is back" | "You viewed this — others are too" | None |
| High-return-rate | None (avoid pressure on uncertain buyer) | "True to size" | "Only 3 left!" |

**Pitfall guard:** the discount-driven cohort sees "Only 3 left!" as a signal to wait for the next code (scarcity + urgency = future-discount-signal). Suppress urgency for the discount-driven cohort, show value-prop instead.

### Step 10 — Configure per-cohort social-share / OG preview

Default OG image: the product hero image.

For each cohort:

| Cohort | OG image variant | OG title | OG description |
|---|---|---|---|
| Anonymous cold-start | "Best seller" badge overlay | "[Product] — Best seller" | "[Product] — rated 4.8/5 by 1,234 buyers" |
| New visitor | "Best seller" + "New" badge overlay | "[Product] — Best seller, new arrival" | "[Product] — rated 4.8/5 by 1,234 buyers" |
| VIP | "VIP early access" badge overlay | "[Product] — VIP early access" | "[Product] — available 24h before public to VIP" |
| Discount-driven | "Value pick" badge overlay (no discount badge) | "[Product] — value pick" | "[Product] — premium [material] at MSRP" |
| Lapsed | "Welcome back" badge overlay | "[Product] — welcome back" | "[Product] — new arrival + 10% off your next order" |
| High-AOV | "Premium" badge overlay | "[Product] — premium tier" | "[Product] — handmade in [region], lifetime warranty" |
| Subscription | "Subscribe & save" badge overlay | "[Product] — subscribe & save 15%" | "[Product] — delivered monthly, cancel anytime" |

**Klaviyo segment + social-share pipeline:** the personalization engine renders the OG image dynamically. The operator's job is to feed it the cohort definitions and the per-cohort OG image templates.

### Step 11 — Cold-start handling

40–60% of traffic is anonymous. Without a cohort ID, the engine uses a proxy:
- Geo (country / region) — most important proxy; a German visitor's cohort behavior matches other German visitors
- Device (mobile / desktop) — different cohort behavior (mobile skews new-visitor, desktop skews repeat-buyer)
- Referrer (paid social / organic / direct / email) — paid social skews new-visitor, email skews repeat-buyer
- Landing-page category — first-page category is a strong cohort proxy (skincare visitor ≠ apparel visitor)
- Time of day / day of week — minor proxy; weekday morning skews B2B, evening skews DTC

**Klaviyo browse-history signal:** if a visitor has clicked a Klaviyo email in the last 30d, the email-click category is a strong cohort proxy. Sync this signal to the personalization engine.

**Triple Whale cohort-LTV proxy:** if the visitor's IP matches a known customer (household matching), use that customer's cohort.

Cold-start accuracy should be 50–75% of personalized CVR (Baymard 2024 + Nosto 2024 + Dynamic Yield 2024 benchmarks).

### Step 12 — Privacy / consent

GDPR / CCPA compliance:
- Personalization is gated on consent — if the visitor has not opted in to marketing cookies, the engine falls back to cohort-proxy (no PII)
- The personalization decision stores only the cohort ID, never the PII
- Klaviyo segment export is hashed cohort ID, not email
- Triple Whale cohort LTV is aggregated, not per-visitor
- Server-side decisioning (no client-side cookie sync)

**GDPR risk if missed:** EU regulators have issued €100M+ fines for personalization engines that stored PII without consent (canonical CNIL 2024 fine against a personalization vendor). Get consent right.

### Step 13 — Connect to attribution

Tag every PDP / personalization-decision render with:
- `cohort_id` (from Klaviyo or Triple Whale)
- `personalization_variant_id` (the rule ID in the engine)
- `decision_latency_ms` (engine response time)
- `outcome` (ATC / no-ATC / add-to-cart-with-bundle / no-bundle, captured 7d later)
- `outcome_returns` (returned / kept, captured 60d later)

Send to Triple Whale / Polar / Northbeam for cohort-LTV-overlay:
- "PDP visitor cohort 90d LTV vs non-PDP visitor cohort 90d LTV" (target: PDP cohort ≥+14% LTV)
- "Per-cohort variant default A vs B 90d LTV" (target: variant B ≥+8% LTV without breaking margin)
- "Per-cohort bundle attach-rate vs default bundle attach-rate" (target: per-cohort bundle ≥+30% attach-rate)
- "Per-cohort fit-personalization returns-rate vs default returns-rate" (target: per-cohort returns ≤-10% drop)
- "Per-cohort recommendations CTR vs default rec CTR" (target: per-cohort rec ≥+25% CTR)

Set up Klaviyo segment: "Viewed PDP + cohort=VIP + didn't purchase" → targeted VIP browse-abandon flow with early-access CTA.

Set up Klaviyo segment: "Viewed PDP + cohort=high-return-rate + purchased" → post-purchase fit-survey email to reduce future returns.

### Step 14 — Measure

Track daily:
- PDP→ATC CVR per cohort (target: ≥+18% lift vs Move #8 cohort-agnostic baseline)
- AOV per cohort (target: ≥+10% lift)
- 90-day cohort LTV per cohort (target: ≥+14% lift)
- Bundle attach-rate per cohort (target: ≥+30% lift)
- Returns rate per cohort (target: ≤-10% drop, apparel/footwear/intimates)
- Per-cohort variant default-pick acceptance rate (target: ≥70%)
- Per-cohort social-proof CTR (target: ≥7%)
- Per-cohort recommendations CTR (target: ≥13%)
- Per-cohort size-guide acceptance rate (target: ≥55%)
- Personalization-engine coverage (% of visitors with a cohort assignment; target: ≥70%)
- Cold-start personalization accuracy (target: ≥50% of personalized CVR)
- Per-cohort variant test lift (target: ≥+12% PDP→ATC CVR)
- Per-cohort bundle attach-rate (target: ≥+30% vs default bundle)

Baymard 2024 PDP personalization benchmarks:
- PDP bounce <35%
- PDP→ATC CVR ≥10% (with personalization)
- Bundle attach-rate ≥18% (with personalization)
- 90-day cohort LTV ≥+14% lift
- Returns rate ≤10% (apparel/footwear/intimates with fit-personalization)

Triple Whale cohort overlay: PDP-visitor 90d LTV vs non-PDP-visitor 90d LTV (target: PDP cohort ≥+14% LTV).

## Common pitfalls (15 from real builds)

1. **No cohort definitions at all** — the biggest gap. Operator installs the engine and personalizes to "everyone" with no cohort logic. Canonical fix: 6-cohort minimum taxonomy (anonymous, new, returning, first-time buyer, repeat, VIP) at launch, extend to 12+ with high-return-rate + cohort-LTV-high as data matures.
2. **Cohort defined by login status only** — only logged-in visitors get a cohort; 40–60% of traffic is anonymous. Canonical fix: Klaviyo Segment ID + Triple Whale cohort-LTV proxy + browse-history + geo/device/referrer fallback.
3. **Variant personalization without guardrails** — engine picks the default variant for the cohort but ignores margin / inventory / returns rate. A high-return-rate variant wins position 1 and the return rate spikes. Canonical fix: every per-cohort variant default has a margin floor + in-stock filter + returns-rate floor.
4. **Social proof personalized but not measurement-driven** — operator personalizes social proof by intuition, not by per-cohort CTR. Canonical fix: feed per-cohort social-proof CTR into the engine weekly, let the engine re-rank the social-proof snippets by cohort.
5. **No fit-prediction on apparel / footwear / intimates / beauty** — operator ships the PDP without True Fit / Fit Analytics / Octane AI. Returns rate stays at 15–25% and is a major margin drag. Canonical fix: Path G (True Fit) for apparel/footwear/intimates with returns rate >12%; Path H (Octane AI) for beauty with shade-matching.
6. **Bundle personalization without margin guardrail** — engine picks the bundle with the highest attach-rate but ignores margin. A low-margin bundle wins and revenue drops. Canonical fix: every per-cohort bundle has a margin floor + in-stock filter.
7. **Discount-driven cohort sees discount badge in PDP** — discount-driven cohort sees the same discount badge as the full-price cohort, trains them to wait for discount. Canonical fix: suppress discount badge in PDP for the discount-driven cohort; show value-prop instead.
8. **GDPR consent ignored** — personalization renders before consent; CNIL 2024 issued €100M+ fines for vendors that stored PII without consent. Canonical fix: gate personalization on consent, fall back to cohort-proxy without PII.
9. **Personalization slows the page** — engine adds 800ms TTFB, kills mobile LCP. Canonical fix: server-side render PDP personalization, defer JS widget, edge-cache the decision for 5–15 min.
10. **No cohort-LTV overlay** — operator measures PDP→ATC CVR but not 90-day cohort LTV. Personalization that lifts CVR but breaks LTV is a net negative. Canonical fix: Triple Whale / Polar / Northbeam readback per cohort, every week.
11. **Per-cohort size-guide without returns-rate measurement** — operator personalizes the size guide but doesn't measure the returns rate per cohort. Canonical fix: feed per-cohort returns-rate into the engine weekly, suppress 1-size-up nudge for cohorts where it backfires (e.g. petite cohort).
12. **VIP cohort sees entry-level variant first** — operator personalizes to "best sellers" not "premium". Canonical fix: VIP cohort default = premium tier + new-arrivals + early-access.
13. **Lapsed cohort sees same PDP as new visitor** — no win-back signal. Canonical fix: lapsed cohort PDP = "Welcome back" with new-arrivals + 10-15% incentive + "Welcome back" copy.
14. **Subscription cohort sees one-time-purchase variants** — operator doesn't differentiate subscription variants. Canonical fix: subscription cohort default = subscription-eligible variant with replenishment CTA.
15. **No multi-arm bandit** — operator ships one variant per cohort and stops. The next variant could lift another +10%. Canonical fix: multi-arm bandit (Thompson sampling) per cohort, ship 2–3 variants per cohort, let the engine pick the winner weekly.

## Verification (this skill is "shipped" when...)

| Gate | Pass criteria |
|---|---|
| Gate A — Personalization engine live | ≥6 cohort definitions configured + active in engine (extends Move #47.5 cohorts with high-return-rate + cohort-LTV-high) |
| Gate B — Per-cohort variant default live | ≥6 cohort variant defaults A/B tested, winning variant live per cohort |
| Gate C — Per-cohort social proof live | Top social-proof signal per cohort configured + verified-buyer snippet per cohort + weekly re-rank by per-cohort CTR |
| Gate D — Per-cohort recommendations live | "Customers like you also bought" + "Complete the look" + "Picks for your style" per cohort, hybrid 60/25/15 weights |
| Gate E — Per-cohort bundling live | Rebuy / LimeSpot / Octane AI configured with per-cohort bundle rules, refresh-per-session, weekly re-rank by per-cohort attach-rate × margin |
| Gate F — Per-cohort size / fit live | True Fit / Fit Analytics / Octane AI integrated; high-return-rate cohort gets 1-size-up / shade-match / width nudge; weekly returns-rate measurement |
| Gate G — Cold-start handling | ≥70% of visitors have a cohort assignment (logged-in + Klaviyo + Triple Whale + proxy) |
| Gate H — GDPR / CCPA consent | Personalization gated on consent, cohort-proxy fallback without PII, server-side decisioning |
| Gate I — PDP→ATC CVR per cohort | ≥+18% relative lift vs Move #8 cohort-agnostic baseline (14-day window minimum) |
| Gate J — AOV per cohort | ≥+10% relative lift vs Move #8 baseline (14-day window minimum) |
| Gate K — 90-day cohort LTV | Triple Whale / Polar / Northbeam shows PDP-visitor cohort 90d LTV ≥+14% vs non-PDP-visitor |
| Gate L — Bundle attach-rate per cohort | ≥+30% lift vs default bundle attach-rate (14-day window) |
| Gate M — Returns rate per cohort (apparel / footwear / intimates / beauty) | ≤-10% drop vs Move #8 baseline returns rate (60-day window minimum) |
| Gate N — Mobile LCP | Mobile LCP <2.5s with personalization live (server-side render + edge cache) |
| Gate O — Per-cohort recommendations CTR | ≥+25% lift vs default rec CTR (14-day window) |

## How to extend this skill

- **Move #47.5.1.1 — Per-cohort PDP personalization — review-highlight engine** — extends Gate C with per-cohort review snippet picker (the "best review for this cohort" ML model that ranks reviews by cohort-fit)
- **Move #47.5.1.2 — Per-cohort PDP personalization — urgency-engine** — extends Gate I with per-cohort urgency decisioning (only the cohort that benefits from urgency sees urgency; cohort-LTV-aware urgency)
- **Move #47.5.1.3 — Per-cohort PDP personalization — bundle-engine v2** — extends Gate L with per-cohort dynamic-bundle ML (the engine picks the bundle for the cohort, not the operator)
- **Move #47.5.1.4 — Per-cohort PDP personalization — fit-prediction v2** — extends Gate F with per-cohort fit-prediction ML (the engine learns cohort-fit from returns data, not just True Fit's network-wide model)
- **Move #47.5.1.5 — Per-cohort PDP personalization — social-share-OG-image-engine** — extends Gate C with per-cohort OG image variants (the engine picks the OG image for the cohort, lifts social-share CTR 20-50%)
- **Move #47.5.1.6 — Per-cohort PDP personalization — server-side render** — extends Gate N with server-side rendering of the PDP personalization decision (no JS widget, mobile LCP <1.5s)
- **Move #47.5.1.7 — Per-cohort PDP personalization — multi-arm bandit** — extends Gate B with Thompson sampling per cohort (ship 2-3 variants per cohort, engine picks the winner weekly)
- **Move #47.5.2 — Per-cohort checkout personalization** — extends the cohort-LTV overlay to checkout (payment-method-by-cohort, gift-wrap-by-cohort, BNPL-by-cohort, trust-signal-by-cohort)
- **Move #47.5.3 — Per-cohort search-result personalization** — extends the cohort-LTV overlay to search results (per-cohort sort + featured snippets + zero-results fallback by cohort)
- **Move #47.5.4 — Per-cohort email/SMS recommendation export** — feed Klaviyo + Postscript the per-cohort PDP recommendation payload (lifts email CTR 25-50%)
- **Move #47.5.8 — Multi-arm bandit per cohort (Move #47.4 sub-class)** — Thompson sampling per cohort, ship 2-3 variants per cohort, engine picks the winner weekly

## Cross-references

- **Move #47** (skill/520) — On-site merchandising: search + filter + sort + PLP + collection pages (the cohort-agnostic substrate this skill personalizes)
- **Move #47.5** (skill/526) — PLP personalization (this skill's direct parent; reuses the cohort taxonomy and the Klaviyo + Triple Whale pipeline)
- **Move #47.1** (skill/521) — On-site visual + voice + image search (extends this skill with multi-modal discovery from PDP)
- **Move #47.2** (skill/522) — Per-cohort merchandising-rule engine (extends this skill with cohort-defined rule editor for PDP)
- **Move #47.3** (skill/523) — Predictive search zero-results prevention (extends this skill with ML-driven fallback for PDP recommendations)
- **Move #47.4** (skill/524) — Merchandising A/B testing (extends this skill with built-in experimentation for PDP variants)
- **Move #47.4.1** (skill/525) — Merchandising email-channel A/B testing (extends this skill with email-channel merchandising A/B for PDP recommendations)
- **Move #8** (skill/08) — PDP A/B testing program (the cohort-agnostic PDP A/B testing substrate this skill personalizes)
- **Move #6** (skill/13) — Triple Whale attribution (cohort-LTV overlay for readback)
- **Move #6.21** (skill/119) — Per-cohort attribution decision engine (the attribution readback this skill depends on)
- **Move #13** (skill/12) — AI product recommendation feed (extends this skill with the AI feed layer for PDP recommendations)
- **Move #61** — AI personalization engine (the AI layer on top of this skill)
- **Move #5** (skill/03) — Klaviyo (cohort definitions + Klaviyo segment export to the engine + per-cohort email flow)
- **Move #14.5** — B2B wholesale channel launch (extends this skill with B2B cohort definitions for PDP)
- **Move #17** (skill/11) — AI customer service automation (extends this skill with the post-purchase fit-survey automation)
- **Move #88** (skill/88) — Returns & reverse-logistics prevention engine (extends this skill with the returns-prevention overlay)
- **Move #104** (skill/104) — Subscription economy deep-dive (extends this skill with the subscription-cohort PDP variant)

## Sources

- Dynamic Yield 2024 personalization benchmark report (per-cohort CVR + LTV lift)
- Nosto 2024 ecommerce personalization benchmark (per-cohort PDP CVR + AOV)
- Constructor 2024 personalization benchmark + Construct* AI per-cohort (per-cohort variant + recommendation)
- Klevu 2024 Smart PDP + personalization documentation (per-cohort PDP widget stack)
- Algolia 2024 Recommend + Personalization documentation (per-cohort recommendations on PDP)
- Bloomreach 2024 Engagement personalization documentation (per-cohort PDP + email)
- Rebuy 2024 PDP personalization + bundle documentation (per-cohort bundle attach-rate)
- LimeSpot 2024 PDP personalization documentation (per-cohort recommendation + bundle)
- Octane AI 2024 beauty PDP + shade-matching documentation (per-cohort shade + bundle)
- True Fit 2024 fashion / footwear / intimates fit-prediction benchmark (per-cohort returns-rate drop)
- Fit Analytics 2024 fit-prediction benchmark (per-cohort returns-rate drop)
- Fit Finder 2024 Vue.ai fit-prediction benchmark (per-cohort returns-rate drop)
- Shopify Search & Discovery Personalization documentation (2024)
- Shopify Plus 2024 PDP personalization + checkout extensions documentation
- BigCommerce 2024 PDP personalization documentation
- WooCommerce 2024 PDP personalization documentation
- Baymard 2024 PDP + personalization UX benchmark (per-cohort PDP CVR + bounce rate)
- Nielsen Norman Group 2024 PDP personalization patterns
- Forrester 2024 personalization engine Wave (Dynamic Yield / Nosto / Constructor / Optimizely / Monetate)
- Gartner 2024 personalization engine Magic Quadrant
- McKinsey 2024 personalization ROI study (per-cohort LTV lift)
- BCG 2024 personalization-at-scale playbook
- Accenture 2024 personalization-engine selection guide
- Klaviyo 2024 segment export + cohort definitions
- Triple Whale 2024 cohort-LTV overlay
- Polar 2024 per-cohort attribution
- Northbeam 2024 per-cohort attribution
- Optimizely 2024 personalization + experimentation
- Monetate 2024 personalization engine
- Salesforce Commerce Cloud 2024 Einstein Personalization
- commercetools 2024 personalization integrations
- Yotpo 2024 cohort-aware social-proof benchmark (per-cohort review CTR)
- Loox 2024 cohort-aware social-proof documentation
- Judge.me 2024 cohort-aware social-proof documentation
- Stamped 2024 cohort-aware social-proof documentation
- CNIL 2024 GDPR fine against a personalization vendor (€100M+) — privacy compliance reference
