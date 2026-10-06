---
name: plp-personalization-per-cohort-dynamic-yield-nosto-constructor-klevu
title: PLP personalization — per-cohort dynamic sort + facets + featured + recommendations on the product listing page (Dynamic Yield / Nosto / Constructor / Klevu / Algolia Recommend / Bloomreach / Shopify Search & Discovery Personalization)
category: plp-personalization
tier: 1
priority: P0
default_move: 47.5
year_1_roi_band: "4:1–12:1"
sms_friendly: false
last_updated: 2026-10-06
sources: [dynamic-yield-2024, nosto-2024, constructor-2024, klevu-2024, algolia-2024, bloomreach-2024, shopify-search-discovery-2024, shopify-plus-2024, bigcommerce-2024, woocommerce-2024, salesforce-commerce-cloud-2024, commercetools-2024, klaviyo-segment-2024, triple-whale-cohort-2024, polar-2024, northbeam-2024, optimizely-2024, monetate-2024, baymard-plp-2024, nielsen-normann-group-plp-personalization-2024, forrester-personalization-engine-2024, gartner-personalization-engine-2024, mckinsey-personalization-2024, bcg-personalization-2024, accenture-personalization-2024]
---

# PLP personalization — per-cohort dynamic sort + facets + featured + recommendations on the product listing page

> The cohort-LTV overlay on top of Move #47 (search + filter + sort + PLP). Without personalization, the same PLP shows the same products in the same order to a $2,000-LTV VIP and a first-session anonymous visitor. With it, the VIP sees her preferred brand in the first slot, the new visitor sees a "Best seller" badge, and a returning browse-abandoner sees the category she was in last week. **PLP→ATC CVR lifts 15–30%, AOV lifts 8–15%, and 90-day cohort LTV lifts 12–25%** vs the cohort-agnostic Move #47 baseline (canonical Dynamic Yield 2024 + Nosto 2024 + Constructor 2024 + Baymard 2024 + Nielsen Norman Group 2024 + McKinsey 2024 benchmarks). The skill is the per-cohort layer Move #47.2 (merchandising-rule engine) and Move #47.4 (merchandising A/B testing) compound.

## When to use this skill

You have:
- A Shopify / Ikas / BigCommerce / WooCommerce / Magento / Salesforce Commerce Cloud / commercetools store
- ≥500 SKUs (below this, manual merchandising is fine)
- ≥10,000 sessions/week (below this, the cohort definitions are too thin to learn from)
- Move #47 (search + filter + sort + PLP) shipped — facets, sort, zero-results rescue, badging, recommendations
- Move #5 / Move #6 — Klaviyo + Triple Whale / Polar / Northbeam — so you can define cohorts by LTV
- A CDP or Klaviyo segment export pipeline (so personalization engines can read cohort ID at request time)

You do NOT have:
- A personalization engine (the same PLP shows the same products to every visitor)
- Per-cohort sort (every visitor sees the same "Featured" order)
- Per-cohort facets (returning visitors see the same filters as first-timers)
- Per-cohort featured products (every visitor sees the same hero / row 1)
- Per-cohort recommendations (Algolia / Klevu / Constructor recommend to the cohort, not to the SKU view history alone)
- A cohort-LTV-overlay attribution readback (you can see PLP→ATC CVR but not PLP cohort LTV)

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Bombas, Dr. Squatch, MUD\WTR, Graza, Sephora, Nordstrom, Best Buy, REI, Patagonia.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Per-cohort sort | Sort by "Match score" personalized to visitor (price sensitivity × brand affinity × category affinity × LTV) | Sort by "Featured" with no logic | Sort by LTV-rank for the cohort, with guardrails (margin, inventory) |
| Per-cohort facets | Reorder facets by per-cohort CTR; pin top 3 above the fold; show "Popular in [your size]" | Static facet order for all visitors | Hide facets with 0 results for the cohort (e.g. XL size for a small-cohort visitor) |
| Per-cohort featured products | Top-row personalized to cohort ("Trending in your size" / "Picks for returning VIPs" / "Best for first-time buyers") | Same 3 featured products for everyone | Personalized row + cohort explanation ("Why these? because you bought [X]") |
| Per-cohort recommendations | "Complete the look" / "Customers like you also bought" / "Picks for your skin type" | "You may also like" (random / SKU view history only) | Per-cohort collaborative filtering × in-stock × margin × inventory |
| Cold-start handling | Anonymous visitors get cohort-proxy (geo + device + referrer + landing-page category) personalization | Same PLP for all anonymous | Klaviyo browse-history + Triple Whale cohort-LTV proxy |
| Latency | <100ms added TTFB (Dynamic Yield / Nosto edge cache) | <300ms added TTFB | Server-side render personalization, defer JS widget |
| Privacy / consent | Personalization gated on consent (GDPR / CCPA), fallback to cohort-proxy without ID | Personalization ignores consent (GDPR risk + ad-pixel dead-letter) | Per-cohort decisioning (no PII in decision, only cohort ID) |
| Per-cohort A/B test | New cohort variant A vs B shipped, 14-day test, guardrail (margin, AOV) | A/B test on sort but not on cohort | Multi-arm bandit (Thompson sampling) per cohort |
| Cohort-LTV overlay | Triple Whale / Polar / Northbeam shows PLP-visitor cohort LTV ≥+12% vs non-PLP-visitor | No LTV readback | Per-cohort LTV + per-cohort margin + per-cohort repeat-purchase |
| PLP→ATC CVR | ≥8% (with personalization) | 2–3% (no personalization) | ≥12% (best in class: Sephora, Allbirds, Glossier) |

## PLP personalization benchmarks (2024–25)

| Component | Floor | Default | Best in class |
|---|---|---|---|
| PLP→ATC CVR (with personalization) | +5% lift vs cohort-agnostic | +15% lift | +30% lift |
| AOV (with personalization) | +3% lift | +8% lift | +15% lift |
| 90-day cohort LTV (with personalization) | +5% lift | +12% lift | +25% lift |
| Filter usage rate (cohort-reordered facets) | 30% | 45% | 60%+ |
| Personalization-engine coverage (visitors with a cohort assignment) | 40% (logged-in only) | 70% (logged-in + Klaviyo identified) | 90%+ (logged-in + Klaviyo + Triple Whale + browse-history) |
| Cold-start personalization accuracy (proxy cohort) | 50% of personalized CVR | 75% | 90% |
| Per-cohort sort variant test lift | +5% | +12% | +20% |
| Per-cohort featured-row CTR | 4% | 9% | 15% |
| Per-cohort recommendations CTR | 6% | 12% | 20% |
| Personalization engine cost per 1k sessions | $0.50 | $1.50 | $4.00 (premium tier) |

**Median DTC lifts PLP→ATC CVR ~7% and 90-day cohort LTV ~10% with personalization. Best in class lifts CVR ~25% and LTV ~22% with full cohort-LTV overlay.**

## The build (6–14 hours for a competent operator)

### Step 1 — Pick the personalization engine

| Path | Tool | Cost | When |
|---|---|---|---|
| Path A (Shopify, <10k sessions/wk, budget-conscious) | Shopify Search & Discovery Personalization (native) | Free w/ Shopify | <10k sessions/wk, simple cohort definitions |
| Path B (Shopify, 10k–100k sessions/wk, default) | Nosto Starter $250/mo OR Klevu Smart Categories $449/mo | $250–$449/mo | 10k–100k sessions/wk, 500–5k SKUs |
| Path C (Shopify Plus, 100k+ sessions/wk) | Dynamic Yield Standard $1,200+/mo OR Constructor Pro $1,500+/mo OR Bloomreach Engagement $2,000+/mo | $1.2k–$3k+/mo | 100k+ sessions/wk, multi-locale, multi-brand |
| Path D (composable / headless / enterprise) | Algolia Recommend + Dynamic Yield OR Constructor + custom decisioning | $2k–$10k+/mo | $10M+ GMV, custom cohort definitions, multi-region |
| Path E (Salesforce Commerce Cloud) | Salesforce Einstein Personalization (bundled) | Bundled | $10M+ GMV on SFCC |
| Path F (commercetools) | Constructor OR Bloomreach OR Dynamic Yield integration | $2k–$10k+/mo | $10M+ GMV on commercetools |

**Default:** Path B (Nosto or Klevu) for the typical $500k–$5M GMV Shopify brand. Path C (Dynamic Yield or Constructor) once you cross $5M GMV or have multi-locale / multi-brand.

### Step 2 — Define the cohorts

Cohort taxonomy — start with 6, expand to 12 as data matures:

| Cohort | Definition | Size (typical $5M GMV) | Primary PLP personalization |
|---|---|---|---|
| Anonymous cold-start | No Klaviyo ID, no customer ID, no Triple Whale match | 40–60% of traffic | Use proxy: geo + device + landing-page category + referrer |
| New visitor (1 session) | Klaviyo identified, no purchase, <2 sessions | 15–25% | "Best seller" row + "New" badges + entry-level price band |
| Returning visitor (2–5 sessions, no purchase) | Klaviyo identified, no purchase, browse-history present | 10–20% | Browse-history category + "Picks for your style" + browse-abandon hook |
| First-time buyer (1 order) | 1 order, 0 returns | 5–10% | Cross-sell to category 2 + replenishment (if consumable) + "Complete the look" |
| Repeat buyer (2+ orders) | 2+ orders, last order <90d | 3–8% | "Picks for your style" + new-arrivals in past-purchase category + loyalty tier-up messaging |
| VIP / Top-10% LTV | Top decile by 365d LTV | 2–5% | Premium SKUs first + early-access badges + high-AOV bundles + concierge CTA |
| Lapsed (no order >180d) | Last order >180d, no recent session | 3–8% | Win-back row + 10–15% incentive + restocked-back-in-stock SKUs + new-arrivals |
| Subscription customer (Recharge / Skio / Stay AI) | Active subscription | 1–5% | Replenishment date reminder + subscription variants + bundle-upsell |
| High-AOV buyer (AOV >$200) | Median AOV in last 90d >$200 | 2–5% | Premium SKUs + bundle SKUs + gift-with-purchase |
| Discount-driven (redeemed ≥2 codes in 90d) | Discount-affinity buyer | 5–10% | Suppress discount in row 1 (margin protection) + value-prop messaging |
| Browse-abandoner (cart or category view in last 7d, no purchase) | Browse-history present, no purchase | 5–10% | "Still interested in [category]?" + that category's best sellers + "Your size is back" |
| Locale / regional cohort | Geo-IP country + region | varies | Currency, language, local best sellers, regional inventory |

**Sync cohorts to the personalization engine** — either via Klaviyo Segment export (daily) or via real-time API (preferred, +5–10% personalization accuracy). For Triple Whale, the cohort ID is the canonical ID; the personalization engine reads it server-side at request time via a sub-100ms edge function.

### Step 3 — Configure per-cohort sort

Default sort for an unpersonalized visitor: "Featured" (best-selling × in-stock × margin × recency).

For each cohort, define a sort:

| Cohort | Primary sort | Secondary sort (tiebreak) | Tertiary (final tiebreak) |
|---|---|---|---|
| Anonymous cold-start | "Featured" (popularity) | Newest | In-stock |
| New visitor | "Featured" (popularity) | Margin (margin-protect) | In-stock |
| Returning visitor (browse-history) | "Match score" personalized | Last-viewed category first | Recency |
| First-time buyer | "Cross-sell affinity" (collaborative filtering from purchase) | "Featured" | In-stock |
| Repeat buyer | "Picks for your style" (LTV-weighted) | New-arrivals in past-purchase category | In-stock |
| VIP | "Premium + new-arrivals" (margin-weighted) | "Loyalty early-access" | In-stock |
| Lapsed | "Win-back" (highest-margin new-arrivals + restocked) | "Featured" | In-stock |
| Discount-driven | "Value-prop" (perceived value, no discount badge) | "Featured" | In-stock |

**Guardrail:** every per-cohort sort must be A/B tested against "Featured" for ≥14 days. Only ship the cohort sort if it lifts PLP→ATC CVR OR 90-day cohort LTV without breaking margin floor.

### Step 4 — Configure per-cohort facets

Default facet order: Price / Color / Size / Material / Brand / Rating / Availability / Discount / Collection.

For each cohort, reorder:

| Cohort | Top 3 facets (above the fold) | Hidden facets | Per-cohort facet count |
|---|---|---|---|
| Anonymous cold-start | Price / Color / Size | Discount (don't show discount to non-subscribers) | Show all facet counts |
| New visitor | Price / Color / "Trending in your size" | Loyalty (irrelevant) | Show all |
| Returning visitor | Last-viewed category's most-clicked facets | None | Show all |
| First-time buyer | Color / Size / Material (no Price — AOV-protect) | None | Show all |
| Repeat buyer | Size / Brand / Material | Price (let them filter down) | Show all |
| VIP | Brand / Material / "Limited edition" | Discount (irrelevant) | Show all |
| Lapsed | Price (with discount-eligible filter) / "New" / "Back in stock" | None | Show all |
| Discount-driven | Price / Rating / Availability | None | Hide discount badge to margin-protect |

**Per-cohort facet CTR measurement:** Triple Whale / Klaviyo segment export feeds the personalization engine. The engine reads facet-CTR per cohort from the last 30d and reorders weekly.

### Step 5 — Configure per-cohort featured row (row 1)

Default row 1 for an unpersonalized visitor: 3 "Best seller" SKUs from the category.

For each cohort:

| Cohort | Row 1 theme | Row 1 SKUs (3) | Update cadence |
|---|---|---|---|
| Anonymous cold-start | "Best sellers" | Top 3 by 30d revenue | Daily |
| New visitor | "Best sellers" + "New" mix | 2 best sellers + 1 new arrival | Daily |
| Returning visitor | "Picks for your style" | 3 SKUs from last-viewed category, top by cohort CTR | Per session |
| First-time buyer | "Complete the look" | 3 SKUs from cross-sell affinity of past purchase | Per session |
| Repeat buyer | "New in your size" | 3 SKUs from past-purchase category, recently launched | Per session |
| VIP | "VIP early access" | 3 new arrivals not yet on public PLP | Per session |
| Lapsed | "Welcome back" | 3 high-margin SKUs not in their last order + 1 incentive CTA | Per session |
| Discount-driven | "Value picks" (no discount badge) | 3 SKUs by perceived value, margin-protected | Daily |

**Per-cohort row-1 CTR measurement:** the personalization engine measures row-1 click-through-rate per cohort per day. Re-rank weekly to maximize per-cohort CTR.

### Step 6 — Configure per-cohort recommendations

Beyond row 1, the PLP also has:
- "Customers like you also bought" (collaborative filtering × cohort)
- "Complete the look" (bundle, per cohort)
- "Recently viewed" (session)
- "Trending now" (last 7d, per cohort if possible)

**Cohort-aware recommendations** use a hybrid:
- 60% collaborative filtering (similar cohorts bought)
- 25% content-based (similar SKUs to view history)
- 15% business rules (margin × inventory × editorial picks)

The personalization engine handles the hybrid; the operator's job is to feed it the cohort definitions and let the ML learn. Re-train weekly or on-demand when cohort definitions change.

### Step 7 — Cold-start handling

40–60% of traffic is anonymous. Without a cohort ID, the engine uses a proxy:
- Geo (country / region) — most important proxy; a German visitor's cohort behavior matches other German visitors
- Device (mobile / desktop) — different cohort behavior (mobile skews new-visitor, desktop skews repeat-buyer)
- Referrer (paid social / organic / direct / email) — paid social skews new-visitor, email skews repeat-buyer
- Landing-page category — first-page category is a strong cohort proxy (skincare visitor ≠ apparel visitor)
- Time of day / day of week — minor proxy; weekday morning skews B2B, evening skews DTC

**Klaviyo browse-history signal:** if a visitor has clicked a Klaviyo email in the last 30d, the email-click category is a strong cohort proxy. Sync this signal to the personalization engine.

**Triple Whale cohort-LTV proxy:** if the visitor's IP matches a known customer (household matching), use that customer's cohort.

Cold-start accuracy should be 50–75% of personalized CVR (Baymard 2024 + Nosto 2024 + Dynamic Yield 2024 benchmarks).

### Step 8 — Privacy / consent

GDPR / CCPA compliance:
- Personalization is gated on consent — if the visitor has not opted in to marketing cookies, the engine falls back to cohort-proxy (no PII)
- The personalization decision stores only the cohort ID, never the PII
- Klaviyo segment export is hashed cohort ID, not email
- Triple Whale cohort LTV is aggregated, not per-visitor
- Server-side decisioning (no client-side cookie sync)

**GDPR risk if missed:** EU regulators have issued €100M+ fines for personalization engines that stored PII without consent (canonical CNIL 2024 fine against a personalization vendor). Get consent right.

### Step 9 — Connect to attribution

Tag every PLP / personalization-decision render with:
- `cohort_id` (from Klaviyo or Triple Whale)
- `personalization_variant_id` (the rule ID in the engine)
- `decision_latency_ms` (engine response time)
- `outcome` (ATC / no-ATC, captured 7d later)

Send to Triple Whale / Polar / Northbeam for cohort-LTV-overlay:
- "PLP visitor cohort 90d LTV vs non-PLP visitor cohort 90d LTV" (target: PLP cohort ≥+12% LTV)
- "Per-cohort sort variant A vs B 90d LTV" (target: variant B ≥+8% LTV without breaking margin)
- "Per-cohort featured row CTR vs default row CTR" (target: per-cohort row ≥+30% CTR)
- "Per-cohort recommendations CTR vs default rec CTR" (target: per-cohort rec ≥+25% CTR)

Set up Klaviyo segment: "Viewed PLP + cohort=VIP + didn't purchase" → targeted VIP browse-abandon flow with early-access CTA.

### Step 10 — Measure

Track daily:
- PLP→ATC CVR per cohort (target: ≥+15% lift vs cohort-agnostic Move #47 baseline)
- AOV per cohort (target: ≥+8% lift)
- 90-day cohort LTV per cohort (target: ≥+12% lift)
- Filter usage rate per cohort (target: ≥45%)
- Row-1 CTR per cohort (target: ≥9%)
- Per-cohort recommendations CTR (target: ≥12%)
- Personalization-engine coverage (% of visitors with a cohort assignment; target: ≥70%)
- Cold-start personalization accuracy (target: ≥50% of personalized CVR)
- Per-cohort sort variant test lift (target: ≥+12% PLP→ATC CVR)
- Per-cohort featured-row CTR (target: ≥+30% vs default row)

Baymard 2024 PLP personalization benchmarks:
- PLP bounce <25%
- PLP→ATC CVR ≥8% (with personalization)
- Filter usage >45%
- 90-day cohort LTV ≥+12% lift

Triple Whale cohort overlay: PLP-visitor 90d LTV vs non-PLP-visitor 90d LTV (target: PLP cohort ≥+12% LTV).

## Common pitfalls (15 from real builds)

1. **No cohort definitions at all** — the biggest gap. Operator installs the engine and personalizes to "everyone" with no cohort logic. Canonical fix: 6-cohort minimum taxonomy (anonymous, new, returning, first-time buyer, repeat, VIP) at launch.
2. **Cohort defined by login status only** — only logged-in visitors get a cohort; 40–60% of traffic is anonymous. Canonical fix: Klaviyo Segment ID + Triple Whale cohort-LTV proxy + browse-history + geo/device/referrer fallback.
3. **Sort personalization without guardrails** — engine sorts by cohort-relevance but ignores margin / inventory. A low-margin SKU wins position 1 and revenue drops. Canonical fix: every per-cohort sort has a margin floor + in-stock filter.
4. **Featured row personalized but not updated** — row 1 is personalized once and never refreshed; returning visitors see the same row all week. Canonical fix: per-session refresh + weekly re-rank by per-cohort CTR.
5. **No A/B test on per-cohort sort** — operator ships the cohort sort without testing it. The default "Featured" sometimes wins. Canonical fix: A/B test every per-cohort sort for ≥14 days with margin + LTV guardrails.
6. **Cold-start accuracy below 50%** — anonymous visitors get random or "Featured" PLP. Canonical fix: cohort-proxy stack (geo + device + referrer + landing-page category) + Klaviyo browse-history signal.
7. **GDPR consent ignored** — personalization renders before consent; CNIL 2024 issued €100M+ fines for vendors that stored PII without consent. Canonical fix: gate personalization on consent, fall back to cohort-proxy without PII.
8. **Personalization slows the page** — engine adds 800ms TTFB, kills mobile LCP. Canonical fix: server-side render personalization, defer JS widget, edge-cache the decision for 5–15 min.
9. **No cohort-LTV overlay** — operator measures PLP→ATC CVR but not 90-day cohort LTV. Personalization that lifts CVR but breaks LTV is a net negative. Canonical fix: Triple Whale / Polar / Northbeam readback per cohort, every week.
10. **Per-cohort facet reordering with no measurement** — operator reorders facets by intuition, not by per-cohort CTR. Canonical fix: feed per-cohort facet-CTR into the engine weekly, let the engine re-rank.
11. **Discount-driven cohort shows discount badge** — discount-driven cohort sees the same discount badge as everyone, trains them to wait for discount. Canonical fix: suppress discount badge in row 1 for the discount-driven cohort; show value-prop instead.
12. **VIP cohort shows entry-level SKUs first** — operator personalizes to "best sellers" not "premium". Canonical fix: VIP cohort sort = premium + new-arrivals + early-access.
13. **Lapsed cohort shows same row 1 as new visitor** — no win-back signal. Canonical fix: lapsed cohort row 1 = "Welcome back" with new-arrivals + incentive CTA.
14. **Subscription cohort shows one-time-purchase SKUs** — operator doesn't differentiate subscription variants. Canonical fix: subscription cohort row 1 = subscription-eligible SKUs with replenishment CTA.
15. **No multi-arm bandit** — operator ships one variant per cohort and stops. The next variant could lift another +10%. Canonical fix: multi-arm bandit (Thompson sampling) per cohort, ship 2–3 variants per cohort, let the engine pick the winner weekly.

## Verification (this skill is "shipped" when...)

| Gate | Pass criteria |
|---|---|
| Gate A — Personalization engine live | ≥6 cohort definitions configured + active in engine |
| Gate B — Per-cohort sort live | ≥6 cohort sort variants A/B tested, winning variant live per cohort |
| Gate C — Per-cohort facets live | Top 3 facets per cohort reordered by per-cohort CTR, refreshed weekly |
| Gate D — Per-cohort featured row live | Row 1 personalized per cohort, refresh-per-session, weekly re-rank by per-cohort CTR |
| Gate E — Per-cohort recommendations live | "Customers like you also bought" + "Complete the look" + "Picks for your style" per cohort |
| Gate F — Cold-start handling | ≥70% of visitors have a cohort assignment (logged-in + Klaviyo + Triple Whale + proxy) |
| Gate G — GDPR / CCPA consent | Personalization gated on consent, cohort-proxy fallback without PII, server-side decisioning |
| Gate H — PLP→ATC CVR per cohort | ≥+15% relative lift vs Move #47 cohort-agnostic baseline (14-day window minimum) |
| Gate I — AOV per cohort | ≥+8% relative lift vs Move #47 baseline (14-day window minimum) |
| Gate J — 90-day cohort LTV | Triple Whale / Polar / Northbeam shows PLP-visitor cohort 90d LTV ≥+12% vs non-PLP-visitor |
| Gate K — Per-cohort recommendations CTR | ≥+25% lift vs default rec CTR (14-day window) |
| Gate L — Mobile LCP | Mobile LCP <2.5s with personalization live (server-side render + edge cache) |

## How to extend this skill

- **Move #47.5.1 — Per-cohort PDP personalization** — extend the cohort-LTV overlay to PDP (variant-by-cohort, recommendation-by-cohort, social-proof-by-cohort)
- **Move #47.5.2 — Per-cohort checkout personalization** — payment-method-by-cohort, gift-wrap-by-cohort, BNPL-by-cohort
- **Move #47.5.3 — Per-cohort search-result personalization** — per-cohort sort + featured snippets + zero-results fallback by cohort
- **Move #47.5.4 — Per-cohort email/SMS recommendation export** — feed Klaviyo + Postscript the per-cohort recommendation payload (lifts email CTR 25–50%)
- **Move #47.5.5 — Per-cohort homepage personalization** — homepage hero + row 1 + featured categories by cohort
- **Move #47.5.6 — Per-cohort cart personalization** — cart-page cross-sell + bundle by cohort
- **Move #47.5.7 — Per-cohort post-purchase personalization** — order confirmation page + shipping confirmation + replenishment by cohort
- **Move #47.5.8 — Multi-arm bandit per cohort** — Thompson sampling per cohort, ship 2–3 variants per cohort, engine picks the winner weekly
- **Move #47.5.9 — Server-side personalization render** — move decisioning to server, drop the JS widget, lift mobile LCP
- **Move #47.5.10 — Per-cohort merchandising-A/B-test framework** — Constructor / Klevu built-in A/B testing for per-cohort merchandising rules, with cohort LTV overlay

## Cross-references

- **Move #47** (skill/520) — On-site merchandising: search + filter + sort + PLP + collection pages + badges + facets (the cohort-agnostic substrate this skill personalizes)
- **Move #47.1** (skill/521) — On-site visual + voice + image search (extends Move #47 with multi-modal discovery)
- **Move #47.2** (skill/522) — Per-cohort merchandising-rule engine (extends this skill with cohort-defined rule editor)
- **Move #47.3** (skill/523) — Predictive search zero-results prevention (extends this skill with ML-driven fallback)
- **Move #47.4** (skill/524) — Merchandising A/B testing (extends this skill with built-in experimentation)
- **Move #47.4.1** (skill/525) — Merchandising email-channel A/B testing (extends Move #47.4 to email + SMS channels)
- **Move #5** (skill/03) — Klaviyo (cohort definitions + Klaviyo segment export to the engine)
- **Move #6** (skill/13) — Triple Whale attribution (cohort-LTV overlay for readback)
- **Move #13** (skill/12) — AI product recommendation feed (extends this skill with the AI feed layer)
- **Move #61** — AI personalization engine (the AI layer on top of this skill)
- **Move #6.21** — Per-cohort attribution decision engine (the attribution readback this skill depends on)
- **Move #14.5** — B2B wholesale channel launch (extends this skill with B2B cohort definitions)

## Sources

- Dynamic Yield 2024 personalization benchmark report (per-cohort CVR + LTV lift)
- Nosto 2024 ecommerce personalization benchmark
- Constructor 2024 personalization benchmark + Construct* AI per-cohort
- Klevu 2024 Smart Categories + personalization documentation
- Algolia 2024 Recommend + Personalization documentation
- Bloomreach 2024 Engagement personalization documentation
- Shopify Search & Discovery Personalization documentation (2024)
- Baymard 2024 PLP + personalization UX benchmark
- Nielsen Norman Group 2024 PLP personalization patterns
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
- CNIL 2024 GDPR fine against a personalization vendor (€100M+) — privacy compliance reference
