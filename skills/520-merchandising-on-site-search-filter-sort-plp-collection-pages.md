---
name: merchandising-on-site-search-filter-sort-plp-collection-pages
title: On-site merchandising — search + filter + sort + PLP + collection pages + badges + facets + merchandising-rank
category: merchandising
tier: 1
priority: P0
default_move: 47
year_1_roi_band: "6:1–20:1"
sms_friendly: false
last_updated: 2026-10-05
sources: [algolia-2024, searchspring-2024, klevu-2024, bloomreach-2024, constructor-2024, findify-2024, boost-ai-2024, shopify-search-discovery-2024, shopify-plus-2024, baymard-plp-2024, baymard-search-2024, nielsen-normann-group-facets-2024, nn-group-zero-results-2024, salesforce-commerce-cloud-search-2024, bigcommerce-search-2024, woocommerce-product-search-2024, elasticsearch-2024, open-search-2024, typesense-2024, meilisearch-2024, prefix-freshtech-2024, nosto-2024, dynamic-yield-2024, optimizely-search-2024, klevu-smart-categories-2024, klevu-merchandising-2024, searchspring-category-merchandising-2024, shopify-smart-collections-2024, shopify-collections-2024, triple-whale-merchandising-attribution-2024, klaviyo-merchandising-segment-2024, gorgias-merchandising-tier-2024, polar-merchandising-2024, northbeam-merchandising-overlay-2024, yotpo-merchandising-2024]
---

# On-site merchandising — search + filter + sort + PLP + collection pages + badges + facets + merchandising-rank

> The canonical on-site-discovery substrate every $100k+ GMV DTC brand needs after Move #1 (cart-abandon) + Move #5 (Klaviyo) + Move #6 (attribution) + Move #9 (mobile PDP) ship. Replaces the "Shopify default search + no facets + alphabetical sort + no badges + no merchandising-rank" baseline with **Algolia / Searchspring / Klevu / Bloomreach / Constructor / Findify / Boost AI / Shopify Search & Discovery + faceted navigation + zero-results rescue + query-merchandising + category-page merchandising-rank + badging + related-product blocks + on-site-personalization** so PLP-to-ATC CVR lifts 15–30%, zero-results bounces drop 60–80%, mobile search-to-cart lifts 25–45%, and category-page AOV lifts 10–20% (canonical Baymard 2024 + Nielsen Norman Group 2024 + Algolia 2024 + Searchspring 2024 + Klevu 2024 benchmarks).

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce / Magento / Shopware / Salesforce Commerce Cloud / commercetools) store
- ≥100 SKUs (below this, default Shopify search is fine)
- ≥10,000 sessions/week (below this, free Algolia or Shopify Search & Discovery is enough)
- An existing attribution substrate (Move #6 Triple Whale / Polar / Northbeam) — merchandising needs the same cohort-LTV overlay to prove lift

You do NOT have:
- Faceted navigation on PLPs (no color / size / price / brand filter — the most common DTC gap)
- A search results page that handles zero-results gracefully (the second most common DTC gap)
- A merchandising-rank tool (operators manually reorder products in collections — 20 min per category)
- Personalized search / recommendations on PLP
- A badge / "Best seller" / "New" / "Low stock" merchandising system on PDP + PLP

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Loom, Bombas, Dr. Squatch, MUD\\WTR, Graza.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Search latency (typing-to-result) | <200ms (Algolia / Typesense / Meilisearch) | <800ms (Shopify default) | <100ms (Elasticsearch / OpenSearch / Vespa) |
| Zero-results handling | Synonym-expansion + 3 fallback categories + "did you mean" + trending fallback | 404 page | Personalized fallback |
| Facet count accuracy | Real-time (Algolia / Searchspring) | Cached nightly | Live with caching for slow-changing facets |
| Facet position | Above the fold, left rail (desktop) / collapsible top sheet (mobile) | Bottom of page | Sticky top bar |
| Sort options | Featured + Price asc/desc + Newest + Best-selling + Rating + "Match score" (personalized) | Price asc/desc + Featured | Per-cohort sort by LTV overlay |
| Merchandising-rank | Visual editor (drag-and-drop rule editor) per category + per-cohort | Manual collection reorder via Shopify admin | Algolia / Klevu / Searchspring visual rule editor with A/B test |
| Badging | "Best seller" / "New" / "Low stock" / "Just restocked" / "Staff pick" / "Limited edition" — editable per SKU | None | Personalize per cohort |
| Mobile search | Sticky bottom search bar + voice + barcode scan + recent searches | Top-bar search box | Visual / image search (Google Lens integration) |
| Related products on PDP | Personalized (per-cohort LTV) | "You may also like" (random) | Bundle-aware cross-sell |
| PLP → ATC CVR | ≥6% | 2–3% | ≥10% (Algolia / Constructor benchmark) |
| Search → cart CVR | ≥4% | 1–2% | ≥6% |

## On-site-merchandising benchmarks (2024–25)

| Component | Floor | Default | Best in class |
|---|---|---|---|
| PLP bounce rate | 60% | 40% | <25% |
| Search → ATC conversion | 1–2% | 3–5% | 6–8% |
| Search latency | <800ms | <300ms | <100ms |
| Zero-results rate | 12–18% | 4–8% | <2% |
| Filter usage rate (PLP visitors who use ≥1 filter) | 15% | 30% | 50%+ |
| Average filter count per filtered session | 1.8 | 2.5 | 3.5+ |
| Mobile search share (mobile search / mobile sessions) | 5–10% | 15–25% | 30%+ |
| Personalized recommendation CTR | 2–4% | 6–10% | 12–18% |
| Searchspring / Klevu / Algolia lift over default Shopify | — | +20–30% CVR | +40–60% CVR |

## The build (4–12 hours for a competent operator)

### Step 1 — Pick the search + merchandising platform
| Path | Tool | Cost | When |
|---|---|---|---|
| Path A (default Shopify, <10k sessions/wk) | Shopify Search & Discovery (Native, free w/ Shopify) | Free | <10k sessions/wk, <500 SKUs |
| Path B (Shopify, 10k–100k sessions/wk) | Searchspring Starter $249/mo OR Klevu Smart Search $449/mo | $249–$449/mo | 10k–100k sessions/wk, 500–5k SKUs |
| Path C (Shopify Plus, 100k+ sessions/wk) | Algolia Standard $50/mo + 1.5/1k requests OR Constructor Pro $1,500+/mo | $500–$3,000/mo | 100k+ sessions/wk, 5k+ SKUs |
| Path D (composable / headless) | Elasticsearch / OpenSearch / Typesense / Meilisearch (self-hosted) + Algolia-compatible front-end | $200–$2,000/mo infra | Custom search needs (multi-locale, multi-currency, B2B catalog) |
| Path E (enterprise / Salesforce Commerce Cloud) | Salesforce Einstein Search (bundled) | Bundled | $10M+ GMV on SFCC |
| Path F (enterprise / commercetools) | Constructor / Algolia / Bloomreach integration | $2k–$10k+/mo | $10M+ GMV on commercetools |

**Default:** Path B (Searchspring or Klevu) for the typical $500k–$5M GMV Shopify brand.

### Step 2 — Index all products + synonyms
- Index: title, description, tags, vendor, type, variants (color / size / scent / flavor), price, inventory, badges, review count, review rating, collection membership
- Synonyms: configure ≥30 synonym pairs ("sneaker" ↔ "shoe" / "hoodie" ↔ "sweatshirt" / "tee" ↔ "t-shirt" / "lip balm" ↔ "chapstick" / "yoga mat" ↔ "exercise mat" / etc.)
- Stop words: "a", "the", "of", "for", "with" — strip
- Stemming: enable so "running" matches "run"
- Type-ahead: enable query suggestions (popular searches + product suggestions) with ≤150ms latency

### Step 3 — Configure faceted navigation
- Facets to expose: **Price (slider) + Color (swatch) + Size (chips) + Material + Brand + Rating + Availability + Discount % + Collection + Custom-tags**
- Display: left rail (desktop) / top collapsible accordion (mobile) — Baymard 2024 canonical
- Show facet counts: "Color (12)" — operators underestimate the impact of showing counts (canonical Baymard 2024: +25% filter usage rate)
- Multi-select: enable for color + size + collection + tag
- Single-select: enforce for price range, rating
- Pin top 3 facets above the fold based on session-data (price + color + size for apparel; price + material + scent for skincare; price + flavor + size for supplements)
- OR-logic within a facet (e.g. red OR blue), AND-logic across facets (red AND size M AND price <$50)

### Step 4 — Build the visual merchandising rank editor
- Open the rule editor: per-category, drag-and-drop products into "Featured position 1-5"
- Rules: "If customer is in VIP cohort, surface SKU X first" / "If inventory < 30 days, surface SKU Y to clear stock" / "If new SKU launched <30 days, surface in 'Featured' for first 14 days, then drop to 'New' slot"
- Pin top sellers: lock SKU-A in position 1, SKU-B in position 2, etc. (the canonical merchandising-rank)
- Demote: push SKU-Z to position 20+
- Schedule: "Surface SKU-W in 'Featured' from Black Friday 2026-11-27 to Cyber Monday 2026-11-30"
- A/B test: launch 2 merchandising variants (control vs hand-tuned) for ≥14 days, pick the winner

### Step 5 — Zero-results rescue
- Page state: "No results for '[QUERY]'" + 3 fallback categories + "Did you mean '[SUGGESTION]'?" + "Popular searches" + "Trending products" + "Browse all collections"
- 404 → /search-recovery-input (don't dead-end the user)
- Track zero-results rate weekly; investigate top 50 zero-result queries monthly (60% of zero-results are usually fixable with a synonym or a new SKU)

### Step 6 — Badging system
- Badge types: "Best seller" (top 10% by revenue last 30d) / "New" (SKU launched <30d) / "Low stock" (inventory <14 days at current run rate) / "Just restocked" (back-in-stock in last 7d) / "Staff pick" (curated by team) / "Limited edition" (SKU will not be restocked) / "Sale" (any SKU on promotion)
- Display: top-left corner of PDP + PLP product card (small ribbon), never block product image
- Customizable per cohort: show "Best seller in your size cohort" vs default "Best seller" (canonical Baymard 2024 personalization benchmark)
- Update cadence: nightly batch (most badges), real-time for "Low stock" and "Just restocked"

### Step 7 — Recommendations + related products on PDP
- Algolia Recommend / Klevu Recommendations / Constructor / Searchspring Recommendations (each platform has a recommendations API)
- PDP placements: "You may also like" (related by viewing history) / "Complete the look" (bundle) / "Customers also bought" (collaborative filtering) / "Recently viewed" (session) / "Trending now" (last 7d)
- Connect to Klaviyo for email/SMS recommendation export

### Step 8 — Connect to attribution
- Tag every PLP / search-result click with `session_source`, `device_type`, `cohort_id`, `search_query` in `dataLayer.push` (GTM)
- Send to Triple Whale / Polar / Northbeam for cohort-LTV-overlay (per-cohort revenue attribution per PLP / search)
- Set up: "PLP visitor cohort LTV vs non-PLP-visitor cohort LTV" — the canonical merchandising-attribution measurement (Per Klaviyo 2024 + Triple Whale 2024 + Polar 2024 benchmarks)
- Set up: "search-query LTV cohort" — top 20 search queries by 30/60/90-day LTV (for product roadmap prioritization)

### Step 9 — Measure
- Track daily: search volume, zero-results rate, avg search latency, PLP bounce rate, PLP → ATC CVR, search → cart CVR, filter usage rate, sort usage rate, recommendation CTR, badge CTR, PLP LTV (per cohort), search-query LTV (per top-20 query)
- Baymard 2024 PLP benchmarks: bounce <30%, filter usage >40%, PLP→ATC >6%
- Triple Whale cohort overlay: PLP-visitor 90d LTV vs non-PLP-visitor 90d LTV (target: PLP cohort ≥10% higher LTV)
- Set up Klaviyo segment: "Searched '[TERM]' in last 7d + didn't purchase" → targeted browse-abandon flow

## Common pitfalls (18 from real builds)

1. **No faceted navigation** — biggest DTC gap; Baymard 2024: PLP→ATC CVR jumps 25–40% with facets
2. **No facet counts displayed** — operators leave count off thinking it's ugly; Baymard 2024: filter usage rate +25% with counts
3. **Zero-results rate >10%** — usually 1 of 3 root causes: (a) missing synonyms, (b) too-strict stemming, (c) inventory-less hidden SKUs; canonical fix: monthly top-50 zero-result query review
4. **No merchandising-rank tool** — operators manually reorder products in Shopify admin (20 min per category × 20 categories = 6.5 hr/wk wasted); canonical fix: Searchspring/Klevu/Algolia rule editor (5 min per category)
5. **Sort by "Featured" with no logic** — default Featured = newest; canonical fix: Featured = best-selling × in-stock × cohort-relevance
6. **Personalization that backfires** — "Show SKU the customer already bought" in recommendations (canonical Algolia 2024 anti-pattern); fix: exclude purchased-in-last-30d
7. **No badge updates** — "Best seller" badge still shows on SKU that stopped selling 90 days ago; canonical fix: nightly batch update
9. **Search latency >500ms** — drops mobile search usage by 30%; canonical fix: Algolia / Typesense / Meilisearch (≤100ms search)
10. **No related-product personalization** — "You may also like" is the same for every visitor; canonical fix: per-cohort LTV-overlay personalization (Algolia Recommend / Klevu)
11. **Mobile search box too small** — top-bar search box on mobile is unusable; canonical fix: sticky bottom search bar + voice
12. **Filter position below the fold** — mobile users never scroll to filter; canonical fix: collapsible top sheet on mobile
13. **No synonym config** — "sneaker" returns 0 results because all SKUs are tagged "shoe"; canonical fix: ≥30 synonym pairs configured at launch + monthly additions
14. **No type-ahead / query suggestions** — drops search volume by 20% because users don't know what to search; canonical fix: top-20 trending searches + product suggestions with ≤150ms latency
15. **Badge blocks product image** — looks like a glitch; canonical fix: small ribbon in top-left, 8% of card height
16. **Merchandising-rank pinned forever** — operator pins "Holiday 2024" SKU in position 1 and forgets to remove it in January; canonical fix: schedule-based pinning + monthly review
17. **No cohort-LTV overlay** — operators measure PLP CVR but not PLP cohort LTV; canonical fix: Triple Whale / Polar / Northbeam PLP cohort LTV vs control
18. **Recommendations slow the page** — Algolia / Klevu widget loads 500KB JS, kills mobile LCP; canonical fix: lazy-load recommendations below the fold, defer-to-idle for non-critical

## Verification (this skill is "shipped" when...)

| Gate | Pass criteria |
|---|---|
| Gate A — Search live | ≥90% of catalog indexed, search latency <300ms |
| Gate B — Facets live | ≥5 facets (price + color + size + material + brand) on every PLP |
| Gate C — Zero-results rate | <4% weekly (down from baseline 12–18%) |
| Gate D — Merchandising-rank tool | Operator can re-rank a category in <5 min via UI (not Shopify admin) |
| Gate E — Badges live | ≥5 badge types (Best seller / New / Low stock / Just restocked / Staff pick) |
| Gate F — Recommendations live | PDP has "You may also like" + "Complete the look" + "Customers also bought" |
| Gate G — PLP → ATC CVR | ≥+15% relative lift vs pre-launch baseline (14-day window minimum) |
| Gate H — Search → cart CVR | ≥+25% relative lift vs pre-launch baseline (14-day window minimum) |
| Gate I — Cohort LTV overlay | Triple Whale / Polar / Northbeam shows PLP-visitor 90d LTV ≥+10% vs non-PLP-visitor |
| Gate J — Mobile search | Mobile search share ≥15% (up from baseline 5–10%) |

## How to extend this skill

- **Move #47.1 — Voice + image search** — Google Lens integration for visual product discovery (canonical Apron Baymard 2024 + NN-Group 2024)
- **Move #47.2 — Per-cohort merchandising-rule engine** — "VIP cohort sees SKU X in position 1, new-visitor cohort sees SKU Y in position 1" via Klaviyo cohort sync
- **Move #47.3 — Predictive search zero-results prevention** — Algolia / Klevu ML model surfaces likely-zero-result queries and suggests fallback SKUs in real-time
- **Move #47.4 — Merchandising A/B testing** — Constructor / Klevu built-in A/B testing for merchandising rules (control vs hand-tuned) with cohort LTV overlay
- **Move #47.5 — PLP personalization** — Dynamic-yield / Nosto / Klevu Smart Categories per-cohort PLP (sort + facets + featured personalized per cohort LTV)

## Sources

Algolia 2024, Searchspring 2024, Klevu 2024, Bloomreach 2024, Constructor 2024, Findify 2024, Boost AI 2024, Shopify Search & Discovery 2024, Shopify Plus 2024, Baymard PLP 2024, Baymard search 2024, Nielsen Norman Group facets 2024, NN Group zero-results 2024, Salesforce Commerce Cloud search 2024, BigCommerce search 2024, WooCommerce product search 2024, Elasticsearch 2024, OpenSearch 2024, Typesense 2024, Meilisearch 2024, Nosto 2024, Dynamic Yield 2024, Optimizely search 2024, Klevu Smart Categories 2024, Klevu merchandising 2024, Searchspring category merchandising 2024, Shopify smart collections 2024, Shopify collections 2024, Triple Whale merchandising attribution 2024, Klaviyo merchandising segment 2024, Gorgias merchandising tier 2024, Polar merchandising 2024, Northbeam merchandising overlay 2024, Yotpo merchandising 2024.