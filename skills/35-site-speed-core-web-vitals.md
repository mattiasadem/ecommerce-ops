---
name: site-speed-core-web-vitals
title: Site speed + Core Web Vitals (Move #2.5, LCP/INP/CLS + CrUX field-data + Shopify theme + image-pipeline + third-party-budget, 5-pillar Path A/B/C, 12:1 default Year-1 ROI)
category: conversion
tier: 1
priority: P0
default_move: 2.5
year_1_roi_band: "8:1–22:1"
sms_friendly: false
last_updated: 2026-07-12
sources: [google-core-web-vitals 2024, google-crux 2024, google-pagespeed-insights 2024, lighthouse 2024, web-vitals-js 2024, shopify-online-store-speed 2024, shopify-theme-performance 2024, shopify-hydrogen 2024, cloudflare-cdn 2024, cloudflare-images 2024, fastly 2024, tinyimg 2024, shortpixel 2024, imagekit 2024, cloudinary 2024, avif-browser-support 2024, webp-browser-support 2024, deloitte-milliseconds 2020, google-vodafone 2020, akamai-mobile-commerce 2024, doubleclick-ad-experience 2024, ga4-web-vitals 2024, shopify-analytics-web-vitals 2024, triple-whale-speed-overlay 2024, datadog-rum 2024, sematext-rum 2024, treo-site-speed-2024 2024]
---

# Site speed + Core Web Vitals

> Move #2.5 is the canonical **highest-EV, lowest-cost conversion-rate-optimization lever** in the Shopify-DTC stack — the **LCP / INP / CLS** audit-and-fix loop that lifts site-wide conversion **8–25%** (median DTC, +10–20% per Deloitte/Vodafone + Google Core Web Vitals 2024 + Triple Whale 2024) by shipping **Google's 3 Core Web Vitals** (LCP < 2.5s / INP < 200ms / CLS < 0.1) as concrete Shopify theme + image-pipeline + third-party-budget fixes. Built on **5 pillars**: (Pillar 1) **lab-measurement-baseline** — PageSpeed Insights + Lighthouse + WebPageTest + Chrome DevTools Performance tab + the **lab-data-vs-field-data** distinction (lab is repeatable synthetic test on a fixed network/device profile, field is real-user-monitored from CrUX + GA4 Web Vitals); (Pillar 2) **field-data-monitoring** — Chrome User Experience Report (CrUX) + GA4 Web Vitals event + Shopify Analytics Web Vitals integration + the **75th-percentile** rollup that Google uses for the SEO ranking signal (per Google Search Central 2024 + Google CrUX 2024 docs); (Pillar 3) **LCP-image-pipeline + critical-CSS-inlining + render-blocking-resource-elimination** — the canonical "speed-easy-mode" stack (AVIF/WebP + `<img width/height>` + `fetchpriority="high"` + responsive `srcset` + CDN + critical-CSS extraction + preload LCP font + lazy-load below-fold + defer all third-party JS); (Pillar 4) **INP-jank-elimination** — long-task-breakdown + event-handler-debouncing + main-thread-yielding + third-party-script-budget-enforcement (the canonical **third-party-budget** is ≤5 third-party scripts × ≤200KB each × ≤200ms main-thread-block per page-load per Lighthouse 2024 + web.dev 2024); (Pillar 5) **CLS-shift-prevention + CrUX-28-day-rolling-monitoring + SEO-ranking-protection** — explicit `width`/`height`/`aspect-ratio` on all images + `font-display: swap` + reserving space for late-loading ads/embeds + the canonical **28-day-rolling-field-data** check (Google re-evaluates ranking eligibility on a 28-day CrUX window). The 5-pillar audit scores 0–100 against **Google's 3 CWV thresholds** (LCP ≤2.5s good / ≤4.0s needs-improvement / >4.0s poor; INP ≤200ms good / ≤500ms needs-improvement / >500ms poor; CLS ≤0.1 good / ≤0.25 needs-improvement / >0.25 poor) and ships in **3–5 days for a competent operator** to reach the **good band (all 3 CWV green at 75th percentile)** at **8:1–22:1 Year-1 ROI** with **12:1 default Path B** at $1M–$10M US DTC base ($60k–$250k Year-1 incremental net vs $5k–$20k operator cost). Gated on Move #1 cart-abandon + Move #4 welcome + Move #6 Triple Whale attribution shipped ≥30 days + GA4 or Shopify Analytics live + staging theme available + CrUX-eligible (≥10k sessions/mo for 75th percentile per Google CrUX origin-suffix-eligibility 2024) + 3–5 day shipping window with willingness to defer third-party scripts. Companion `scripts/site_speed_cwv_score.py` (Archetype B numeric-quality scorer + 3-CWV-threshold matrix + per-fix-lift-band table + CrUX-28-day-rolling-monitor + JSON output for CI/cron consumers) + `scripts/tests/test_site_speed_cwv_score.py` (≥18 TDD tests covering CWV-threshold math / per-metric-pass-partial-fail point values / missing-metric graceful-skip / JSON schema stability / 3-band health-band thresholds / per-fix-lift-band cap / 5-pillar-prioritized fix-list ordering + 5 NEGATIVE validation tests).

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce / custom-React) store
- GA4 or Shopify Analytics Web Vitals enabled
- ≥10k sessions/mo (the CrUX 75th-percentile eligibility floor per Google CrUX 2024)
- Lighthouse / PageSpeed Insights lab-data baseline available
- A staging theme to deploy fixes against
- 3–5 days of operator time during a 1-week shipping window

This skill is **Move #2.5** — it sits between Move #2 (post-purchase-upsell, AOV lever) and Move #3 (checkout-audit, completion-rate lever) on the canonical 30-day-rollout sequence. It pairs naturally with Move #9 (mobile-PDP-redesign) and Move #9.5 (PDP-A/B-testing-program) — speed fixes are 80% of the mobile-CVR gap that Move #9 + #9.5 try to close.

## What "best in class" looks like

A site that ships Move #2.5 to "great" band hits all three Core Web Vitals at the 75th percentile of real-user field data on a 28-day rolling window:

| CWV metric | Good (75th pctl) | Needs improvement | Poor | What it measures |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s–4.0s | > 4.0s | How fast the main content renders |
| **INP** (Interaction to Next Paint, replaced FID March 2024) | ≤ 200ms | 200ms–500ms | > 500ms | How fast the page responds to clicks/taps |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 | How much the layout shifts during load |

The canonical "all-green at 75th percentile for 28 days" badge is what Google uses for **Search ranking eligibility** (the CrUX-originated Core Web Vitals ranking signal — Google Search Central 2024) and what the Top-20% of Shopify-DTC stores per **Treo Site Speed 2024** benchmark consistently achieve.

A great-band store has these 5 architectural properties:
1. **LCP image is preloaded** — `<link rel="preload" as="image" href="hero.avif" fetchpriority="high">` in `<head>`
2. **All images use modern formats** — AVIF primary + WebP fallback + JPEG ultimate fallback, served via `<picture>` element or Shopify's `image_picker` URL params (`?width=600&format=webp`)
3. **Critical CSS is inlined** — only above-the-fold CSS in the `<head>`, rest deferred with `<link rel="preload" as="style" onload="this.rel='stylesheet'">`
4. **Third-party budget is enforced** — ≤5 third-party scripts × ≤200KB each × ≤200ms main-thread block per page-load (the canonical Lighthouse 2024 + web.dev 2024 budget)
5. **All images have explicit dimensions** — every `<img>` has `width`/`height` attributes (or CSS `aspect-ratio`) so CLS = 0 for images

## Site speed + Core Web Vitals benchmarks (2024–25)

### Core Web Vitals distribution (CrUX field data, 28-day rolling)

| Metric | Median Shopify-DTC | Top 20% Shopify-DTC | Top 5% Shopify-DTC | Source |
|---|---|---|---|---|
| LCP good (% of origins) | 47% | 78% | 92% | Google CrUX 2024 |
| INP good (% of origins) | 58% | 82% | 94% | Google CrUX 2024 |
| CLS good (% of origins) | 71% | 88% | 96% | Google CrUX 2024 |
| All 3 green (% of origins) | 32% | 65% | 84% | Google CrUX 2024 |
| 75th pctl LCP (mobile) | 3.2s | 2.1s | 1.5s | Google CrUX 2024 |
| 75th pctl INP (mobile) | 245ms | 165ms | 95ms | Google CrUX 2024 |
| 75th pctl CLS (mobile) | 0.14 | 0.06 | 0.02 | Google CrUX 2024 |

### Per-CWV-metric fix lift bands (the canonical 2024–25 evidence)

| Fix | LCP lift | INP lift | CLS lift | Source |
|---|---|---|---|---|
| AVIF/WebP image format conversion | −800ms to −1.5s | minimal | 0 | Cloudflare Images 2024 |
| Image responsive `srcset` + `sizes` | −300ms to −800ms | minimal | 0 | web.dev 2024 |
| Critical CSS inlining | −500ms to −1.2s | +30ms (worse, small) | 0 | web.dev 2024 |
| Defer non-critical third-party JS | −200ms to −600ms | −100ms to −300ms | 0 | web.dev 2024 |
| Preload LCP image | −200ms to −500ms | minimal | 0 | web.dev 2024 |
| `font-display: swap` + preload font | −100ms to −300ms | minimal | +0.02 to +0.05 (worse) | web.dev 2024 |
| Image explicit `width`/`height` | 0 | 0 | −0.05 to −0.15 | web.dev 2024 |
| Long-task debounce (search input, add-to-cart) | 0 | −50ms to −200ms | 0 | web.dev 2024 |
| Total **Path B DEFAULT** | −1.5s to −3.0s LCP | −150ms to −400ms INP | −0.10 to −0.20 CLS | composite per Lighthouse 2024 |

### Conversion-rate lift per 100ms LCP improvement

| Source | 100ms LCP improvement → CR lift | Notes |
|---|---|---|
| Deloitte / Google Vodafone 2020 | +1–2% CR | The canonical cited case study |
| Akamai Mobile Commerce 2024 | +0.7–1.5% CR | Larger mobile dataset |
| Walmart 2024 (industry-cited) | +2% CR per 100ms | Internal benchmark, well-publicized |
| DoubleClick Ad Experience 2024 | +1.5% CR per 100ms (display) | Display ads, lower bound |
| Operator consensus (Treo Site Speed 2024) | +0.5–2% CR | Wide band, but directionally consistent |

## The build (3–5 days for a competent operator)

### Step 1 — Capture lab-data baseline (30 min)

Run PageSpeed Insights on the 5 canonical page templates:

1. **Homepage** (`/`)
2. **Collection page** (`/collections/all`)
3. **Product page** (a hero SKU, e.g. `/products/bestseller`)
4. **Cart page** (`/cart`)
5. **Checkout step 1** (Shopify-only, the `/checkouts/` step)

For each, capture: LCP / INP / CLS at the **mobile profile** (the canonical Google-mobile config: 4G network + Moto G Power device profile per Lighthouse 2024). Store in `scripts/site_speed_cwv_score.py --input-file` for the baseline score.

### Step 2 — Capture field-data baseline (5 min)

Three sources:
1. **CrUX origin-suffix dashboard** — `https://cruxdashboard.google.com/?url=<your-shopify-domain>` (free, no install)
2. **GA4 Web Vitals event** — requires `web-vitals` JS library injected + event sent to `web_vitals` event in GA4. Operator installs via `theme.liquid` snippet.
3. **Shopify Analytics → Reports → Sessions by device speed** — Shopify's built-in web vitals (since 2024) — shows LCP / INP / CLS at 75th percentile for past 28 days.

Capture the **75th percentile** numbers (not the median) — that's what Google uses for ranking eligibility.

### Step 3 — Score + prioritize (10 min)

Run `scripts/site_speed_cwv_score.py` — returns 0–100 score + prioritized fix-list (LCP > INP > CLS priority because LCP has the largest CVR-lift correlation per the per-100ms table). The script outputs a JSON with `score`, `health_band` (weak / fair / good / great), and a `prioritized_fix_list` ordered by per-fix-CVR-lift descending.

### Step 4 — Ship LCP fixes first (Day 1–2)

**Fix L1: Convert hero images to AVIF/WebP** — Shopify Settings → Files → enable AVIF/WebP via Cloudflare Images integration OR use a CDN like ImageKit / Cloudinary / ShortPixel. For each LCP image on the 5 templates, replace JPEG with `<picture>` element or Shopify URL params. Expected LCP lift: −800ms to −1.5s.

**Fix L2: Add explicit width/height + fetchpriority="high"** — theme.liquid → hero-image snippet → add `width="600" height="600" fetchpriority="high"` to the LCP `<img>`. Expected LCP lift: −100ms to −300ms.

**Fix L3: Preload LCP image** — theme.liquid → `<head>` → `<link rel="preload" as="image" href="{{ hero_image | image_url: width: 1200, format: 'avif' }}" fetchpriority="high">`. Expected LCP lift: −200ms to −500ms.

**Fix L4: Inline critical CSS + defer non-critical** — Use a critical-CSS extractor (Penthouse, Critical, or Shopify's native theme-editor CSS extraction). Move non-critical CSS to a `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern. Expected LCP lift: −500ms to −1.2s.

**Fix L5: Switch to a lighter theme** — if LCP is still > 4.0s after L1–L4, switch from a heavy theme (Turbo/Prestige) to a lightweight theme (Dawn or Sense per Shopify Theme Store speed benchmarks). Expected LCP lift: −500ms to −2.0s.

### Step 5 — Ship INP fixes (Day 2–3)

**Fix I1: Audit + remove unnecessary third-party scripts** — Google Tag Manager, Klaviyo onsite JS, Rebuy smart-cart, Gorgias chat widget, Yotpo reviews widget, Nosto personalization, Hotjar — each can add 50–200ms to INP. The canonical third-party budget is ≤5 scripts × ≤200KB each × ≤200ms main-thread-block per page-load. Remove or defer (load on idle / on-scroll / on-user-interaction) anything beyond that budget.

**Fix I2: Debounce search input + add-to-cart handler** — theme.liquid → main-search.liquid → wrap the input handler in `requestIdleCallback` or a 200ms debounce. Same for the add-to-cart button (often a `<button>` whose `onclick` runs a 50ms JSON parse + 80ms Shopify Cart API POST + 50ms DOM update — total 180ms blocking). Debounce by `requestAnimationFrame` or yielding with `setTimeout(0)`.

**Fix I3: Defer non-critical JS** — Move all third-party widget JS to load on `requestIdleCallback` OR on first user interaction OR on scroll-past-50%. Use the `defer` attribute on all non-render-blocking `<script>` tags.

**Fix I4: Avoid long tasks > 50ms** — Chrome DevTools → Performance tab → record a page load + interaction → look for the red-triangle long tasks (>50ms). Each one is an INP-eligible event. Break them up with `setTimeout(0)` or `scheduler.yield()` (Chrome 130+).

### Step 6 — Ship CLS fixes (Day 3–4)

**Fix C1: Add explicit dimensions to every `<img>`** — Every image, every product card, every hero banner, every logo. Either `<img width="X" height="Y">` OR CSS `aspect-ratio: X/Y`. This alone drops CLS by 0.05–0.15 on most stores.

**Fix C2: `font-display: swap` + preload critical fonts** — theme.liquid → `<link rel="preload" as="font" href="..." crossorigin>` + `@font-face { font-display: swap; }`. Prevents FOUT (Flash of Unstyled Text) shifts.

**Fix C3: Reserve space for late-loading widgets** — Klaviyo form, Gorgias chat bubble, Hotjar survey, Yotpo reviews stars, Rebuy smart-cart drawer — each can shift the layout when they load. Reserve the space with a fixed-height container (`<div style="height: 80px">` for the chat widget) so the page doesn't reflow when the widget appears.

**Fix C4: Avoid injecting content above existing content** — Klaviyo popups, announcement bars, age-gates — if they appear above the fold, they shift the entire page down. Either place them at the bottom OR reserve space for them upfront.

### Step 7 — Measure + iterate (Day 5)

Run `scripts/site_speed_cwv_score.py` again to compute the new score. Compare CrUX 75th-percentile at day 14 + day 28 (the canonical 28-day-rolling-window). Target: all 3 CWV green at 75th percentile for 28 consecutive days = Search ranking eligibility + Shopify-DTC top-20% speed tier per Treo Site Speed 2024.

### Step 8 — Monitor + maintain (ongoing)

- **Weekly:** Lighthouse CI run on the 5 templates (auto-fail if LCP > 2.5s or any CWV goes poor)
- **Monthly:** CrUX origin-suffix check
- **Per theme update:** Re-run Steps 1–3 (theme updates frequently regress CWV — the canonical Pitfall #10)
- **Quarterly:** Audit third-party-script list (a new vendor can silently add 100ms to INP)

## GMV-tier paths

### Path A — DIY + free tools (<$1M GMV, 1-day build + 1-week shipping)

Use Lighthouse + PageSpeed Insights + Cloudflare free CDN + Shopify's built-in AVIF. No paid tools. Apply L1–L5 + I1 + C1 + C2 only. Expected LCP lift: 1.5–2.5s. Expected CR lift: 8–15%. Cost: $0 + 4–8 hr operator time. Year-1 ROI: 5:1–15:1.

### Path B DEFAULT — Mid-market operator ($1M–$10M GMV, 3-day build + 1-week shipping)

All Path A fixes + add I2/I3/I4 (third-party budget enforcement + INP optimization) + C3/C4 (layout-shift prevention) + Cloudflare Pro $20/mo + ShortPixel/ImageKit $10–$50/mo. Expected LCP lift: 2.0–3.0s. Expected INP lift: 150–400ms. Expected CLS lift: 0.10–0.20. Expected CR lift: 12–22%. Cost: $30–$70/mo + 20–30 hr operator time. **Year-1 ROI: 12:1 default** (Path B's 8:1–22:1 band).

### Path B+ — Theme switch + heavy-stack optimization ($3M–$10M GMV, 5-day build + 2-week shipping)

All Path B fixes + switch to a lightweight theme (Dawn, Sense, or custom) + Cloudflare APO $5/mo + full third-party-script audit + GA4 Web Vitals + Datadog RUM integration. Expected LCP lift: 2.5–4.0s. Expected CR lift: 18–30%. Cost: $50–$200/mo + 40–60 hr operator time. Year-1 ROI: 10:1–22:1.

### Path C — Enterprise + headless ($10M+ GMV, 2-week build + 1-month shipping)

Shopify Hydrogen (headless React) OR custom Next.js storefront with Vercel/Cloudflare edge + ImageKit/Cloudinary AVIF pipeline + full CrUX monitoring + Datadog/Sematext RUM + dedicated web-vitals team. Expected LCP lift: 3.0–5.0s. Expected CR lift: 25–40%. Cost: $500–$5,000/mo + 80–160 hr operator time. Year-1 ROI: 6:1–18:1.

### Path D — Deferred (<$500 orders/mo OR pre-CrUX-eligibility)

Below 10k sessions/mo, CrUX 75th-percentile data is too sparse to measure lift reliably. Defer Move #2.5 to after Move #1 + Move #6 + Move #9 + Move #9.5 ship and traffic grows.

### Path E — Audit-only (defer fixes, only instrument)

For brands where the operator has 0 bandwidth but a marketing team: install `web-vitals` JS + GA4 Web Vitals event + Datadog RUM (free tier) — measure-only. Defer all fixes until next quarter.

## Common pitfalls (18 from real builds)

**Pitfall #1 — Measuring only lab-data, not field-data.** Operator runs Lighthouse, gets a 95/100 score, ships the fixes, and 28 days later checks CrUX and sees LCP is still 3.5s. Lab-data is from a synthetic test on a fixed Moto G Power + 4G profile — it does NOT represent the median real-user device (which is often a 3-year-old mid-range Android on slow 4G). **Fix:** Always measure BOTH. The CrUX 75th percentile is the canonical source-of-truth for ranking eligibility AND for CR-lift correlation. Lighthouse is for finding the bottleneck (which element is the LCP candidate, which JS is the long task); CrUX is for proving the fix worked.

**Pitfall #2 — Optimizing the wrong metric (FID instead of INP).** Operator reads a 2023 blog post, optimizes for FID (First Input Delay, deprecated March 2024), sees "good FID" and declares victory. INP replaced FID in March 2024 (per Google web.dev 2024). FID only measured the first input delay; INP measures ALL interactions throughout the page lifetime and uses the worst (or near-worst) at the 98th percentile (with a small set of exceptions). **Fix:** Always measure INP going forward. The `web-vitals` JS library (v3+ since 2024) sends both for backward compat but INP is the canonical signal. Lighthouse v11+ reports INP; v10 still reports FID.

**Pitfall #3 — Converting all images to AVIF without checking browser support.** Operator runs a batch "convert all to AVIF" tool, ships it, sees traffic from older iOS devices (Safari < 16) showing broken images. AVIF is supported in Safari 16+ (Sep 2022), Chrome 85+ (Aug 2020), Firefox 93+ (Oct 2021) — but operators with significant Safari < 16 traffic (typically <5% but can be 10–20% for B2B or older audiences) need a WebP or JPEG fallback. **Fix:** Use `<picture>` element with AVIF + WebP + JPEG fallback, OR use Shopify's `image_picker` URL params (`?format=webp` + `&format=avif` if browser supports it via Cloudflare Images `Accept` header negotiation). Verify with real-device test on iOS 15 / iOS 14.

**Pitfall #4 — Preloading the wrong image.** Operator adds `<link rel="preload" as="image" href="/cdn-cgi/.../hero.avif">` to `<head>`, but the LCP element on the actual rendered page is a different image (e.g. a hero carousel image that swaps after JS load). Preloading the wrong image wastes bandwidth + adds a network request for an image that's not the LCP candidate. **Fix:** Run Lighthouse → "Largest Contentful Paint element" diagnosis in the Performance tab → confirm the preloaded URL matches the LCP element. For carousels: preload the FIRST slide, not the carousel JS. For above-the-fold product cards: preload the hero image of the first visible card.

**Pitfall #5 — Deferring all third-party scripts (breaks Klaviyo onsite + Gorgias chat).** Operator adds `defer` to every `<script>` tag including the Klaviyo onsite JS and Gorgias chat widget. Now Klaviyo's signup form doesn't render until after the LCP event, and the chat widget doesn't open on click. **Fix:** Only `defer` non-render-blocking scripts. For scripts that render above-the-fold content (Klaviyo onsite form, Gorgias chat bubble), use `async` + load on `requestIdleCallback` OR keep them synchronous but ensure they're ≤50KB. For scripts that must run on user interaction (analytics, retargeting pixels), load on `scroll` / `mousemove` / `touchstart` (one-time trigger).

**Pitfall #6 — Adding `fetchpriority="high"` to all images.** Operator reads Google's docs, adds `fetchpriority="high"` to every `<img>` on the homepage. Now the browser tries to download 12 hero images at maximum priority, the network queue fills up, and the LCP actually gets slower because the LCP image is competing with 11 other high-priority images for bandwidth. **Fix:** `fetchpriority="high"` should ONLY go on the LCP candidate image (typically the first above-the-fold hero image on the page). For all other images, use `fetchpriority="auto"` (the default) or `fetchpriority="low"` for below-fold images that you want to deprioritize.

**Pitfall #7 — Switching to a "fast theme" without testing the actual theme impact.** Operator sees "Dawn is the fastest free theme" on a Shopify blog, switches from their customized Prestige theme to Dawn, and discovers Dawn is missing 7 critical features (mega-menu, color swatches, sticky ATC, etc.) they spent 3 months building. The "speed win" of 500ms LCP is wiped out by the conversion regression from missing features. **Fix:** Before any theme switch, run Lighthouse on BOTH the current theme AND the candidate theme. Then A/B test (50/50 split via Shopify Audiences or Convert.com) for 14 days before committing. Most "speed wins" from theme switches are <500ms — which is +0.5–1% CR per the per-100ms table — usually dwarfed by the cost of rebuilding missing features.

**Pitfall #8 — Confusing CrUX origin-suffix with CrUX origin.** Operator checks `cruxdashboard.google.com?url=shop.mystore.com` and sees the median LCP for the WHOLE origin (mystore.com), but their checkout is on `checkout.shopify.com` (a different origin entirely). The CrUX origin-suffix dashboard shows aggregate data for the suffix `mystore.com` across all subdomains + page templates — which is what you want for site-wide measurement. **Fix:** Always use the origin-suffix dashboard (`?url=shop.mystore.com` not `?url=https://shop.mystore.com/products/x`). For per-template data (homepage vs PDP vs checkout), use the CrUX API + filter by `form_factor` + `effective_connection_type`. For per-page-data below 10k sessions/mo, fall back to lab-data (Lighthouse) + RUM (Datadog/Sematext).

**Pitfall #9 — Optimizing desktop CWV and ignoring mobile.** Operator sees LCP 1.8s on desktop Lighthouse, declares victory, ignores the mobile profile (4G + Moto G Power) where LCP is 4.2s. 73% of traffic is mobile per Triple Whale 2025; mobile CWV is the canonical source-of-truth for both ranking eligibility AND CR-lift. **Fix:** Always measure the mobile profile first. Desktop CWV is a secondary signal (and historically easier to get green). The Lighthouse "mobile" preset is the default; do not switch to "desktop" preset unless you're explicitly optimizing a desktop-only page template (e.g. a B2B wholesale login).

**Pitfall #10 — Shipping a theme update that regresses CWV silently.** Operator ships the site, hits "great" CWV, then 6 months later a designer pushes a theme update that adds a heavy hero video + 3 new sections + a custom cursor JS effect. LCP regresses from 1.8s to 4.1s. Without Lighthouse CI in the deploy pipeline, nobody notices until CrUX 28-day-rolling updates the SEO ranking. **Fix:** Add Lighthouse CI to the deploy pipeline. Lighthouse CI is a free GitHub Action that runs on every PR + push to main and fails the build if any of the 3 CWV thresholds is exceeded on the 5 canonical templates. Wire to `theme.liquid` deploy webhook. Per Move #3 Pitfall #10 (the canonical theme-regression-check pattern), the same CI check applies here.

**Pitfall #11 — Believing "Cloudflare CDN solves everything."** Operator signs up for Cloudflare, sees "your site is now 30% faster" in the dashboard, declares victory. Cloudflare CDN solves the network-distance problem (origin ↔ user latency), but it does NOT solve: (a) hero image is 4MB JPEG (the LCP problem is image size, not network), (b) 12 third-party scripts blocking the main thread (the INP problem is JS, not network), (c) fonts loading with FOIT and shifting layout (the CLS problem is font-display, not network). **Fix:** CDN is Pillar 3 step 1 of 5 — not a silver bullet. Apply CDN + image optimization + third-party budget + critical CSS + CLS-prevention in that order. Each pillar addresses a different bottleneck.

**Pitfall #12 — INP optimization breaks user-facing functionality.** Operator adds `requestIdleCallback` to the add-to-cart button's onclick handler, ships it, and discovers that 5% of clicks now appear to do nothing (because the click handler queues into idle-callback but the user's perception is "I clicked, nothing happened"). INP optimization is about reducing MAIN-THREAD work, not delaying it. **Fix:** The canonical pattern is `yielding with scheduler.yield()` (Chrome 130+) OR `await new Promise(r => setTimeout(r, 0))` to break up long tasks WHILE keeping the user-visible response instant. The user-visible response (button click → button shows "Adding...") must happen synchronously; the background work (cart POST + render) can be deferred.

**Pitfall #13 — Not reserving space for Klaviyo popup / Gorgias chat bubble / Hotjar survey.** Operator's CLS is 0.18 (poor). They add `font-display: swap`, fix all image dimensions, and CLS drops to 0.12 (still needs improvement). The remaining 0.08 is from the Klaviyo popup that loads after 2 seconds and pushes the entire page down 200px when it appears. **Fix:** Audit every late-loading widget that appears above-the-fold. Reserve space for each: `<div id="klaviyo-popup-slot" style="min-height: 200px; display: none;">` for Klaviyo, `<div id="gorgias-chat-slot" style="height: 60px; position: fixed; bottom: 0; right: 0;">` for Gorgias. Either reserve space upfront OR load the widget below-the-fold (e.g. announcement bar at the bottom of the page).

**Pitfall #14 — Using `<img>` without explicit dimensions.** Operator's theme renders `<img src="...">` without width/height for every product card. Browser doesn't know the image's aspect ratio until the image loads, so the layout reserves 0×0 space, then reflows when the image loads → CLS contribution of 0.05–0.15. **Fix:** Every `<img>` needs EITHER `width`/`height` attributes (e.g. `<img width="300" height="300">`) OR CSS `aspect-ratio` (e.g. `<img style="aspect-ratio: 1/1">`). The 1-line fix is the single highest-CLS-leverage change on most stores.

**Pitfall #15 — Long tasks from a single JS dependency (e.g. a 500KB bundle).** Operator's web-vitals shows INP 380ms (poor). Lighthouse "Avoid long main-thread tasks" warning flags 4 long tasks, each 120–180ms. All 4 are from a single JS bundle (e.g. a slider library + a sticky-ATC library + a Klaviyo onsite form). **Fix:** Audit the JS bundle composition. Tools: `webpack-bundle-analyzer` for custom builds, Chrome DevTools Coverage tab for Shopify theme JS. Identify the largest 2–3 dependencies, replace or defer. The canonical third-party budget (≤5 scripts × ≤200KB each × ≤200ms main-thread-block per page-load) is the rule of thumb.

**Pitfall #16 — Only measuring the homepage.** Operator runs Lighthouse on the homepage, sees LCP 1.8s, declares victory. The collection page has LCP 4.5s (because the collection-page LCP element is the second product card image, which loads after 4.5s due to lazy-loading the first 2 images and loading the rest on scroll). PDP has LCP 3.2s (because the PDP hero image is 2MB JPEG). **Fix:** Measure all 5 canonical templates (homepage, collection, PDP, cart, checkout). For Shopify specifically, the PDP LCP image is the highest-impact target — it's the canonical "above-the-fold" for the highest-converting page template.

**Pitfall #17 — Confusing Lighthouse score with CWV.** Operator sees Lighthouse score 95/100, declares "great CWV." Lighthouse score is a composite of many signals (SEO, accessibility, best practices, performance). The Performance score is calculated from lab CWV + other signals, but a 95 Performance score can still have an LCP of 2.7s (needs improvement) — the score includes FCP, TBT, Speed Index, TTI in addition to CWV. **Fix:** Read the actual CWV numbers (LCP / INP / CLS at the top of the Lighthouse report) — not just the composite score. A score of 95 with LCP 2.7s is NOT all-green; it's the canonical "needs improvement" state for LCP.

**Pitfall #18 — Optimizing for the wrong percentile.** Operator sees median LCP 2.1s (good), declares victory. Google uses the **75th percentile** for ranking eligibility (per Google Search Central 2024). If median is 2.1s but 75th percentile is 3.2s, the site is in the "needs improvement" band for SEO purposes. **Fix:** Always report 75th percentile (or p75 in Lighthouse, p75 in CrUX). CrUX origin-suffix dashboard defaults to p75 — use that as the canonical metric. If GA4 Web Vitals is wired, compute the 75th percentile in BigQuery: `APPROX_QUANTILES(lcp_value, 100)[OFFSET(75)]`. The 50th percentile (median) is misleading because it ignores the worst experiences (which is what Google penalizes).

## Verification (this skill is "shipped" when...)

A Move #2.5 site speed + Core Web Vitals audit is "shipped" when **all 4 verification gates pass**.

### Gate A — Measurement infrastructure (8 prereqs)

The measurement substrate is in place:

1. **Lighthouse baseline captured** — Lighthouse run on the 5 canonical templates (homepage, collection, PDP, cart, checkout) at the mobile profile, saved to `/tmp/site-speed-baseline-<store>.json`
2. **`scripts/site_speed_cwv_score.py` runs** — script accepts the baseline JSON, returns 0–100 score + JSON output roundtrips through `json.loads`
3. **All-pass smoke test green** — `python3 scripts/site_speed_cwv_score.py --all-pass --json | python3 -m json.tool` returns `score = 100, health_band = "great", cwv_metrics_passed = 3, cwv_metrics_total = 3`
4. **Test suite green** — `python3 -m unittest scripts.tests.test_site_speed_cwv_score -v` returns ≥18 tests, all OK
5. **No regression in cross-suite tests** — all prior cross-suite tests still pass
6. **CrUX origin-suffix dashboard bookmarked** — `https://cruxdashboard.google.com/?url=<store-domain>` saved to operator's bookmarks
7. **GA4 Web Vitals event firing** — `web-vitals` JS library installed in `theme.liquid` → `web_vitals` event visible in GA4 Realtime
8. **Lighthouse CI deployed** — GitHub Action runs Lighthouse on every PR + push to main with CWV-threshold-gate

### Gate B — Audit + fix loop (10 prereqs)

The audit-and-fix cycle has executed at least once with measurable lift:

9. **Initial 3-CWV scores recorded** — CrUX 75th percentile LCP / INP / CLS at baseline (typically LCP 3.5s / INP 280ms / CLS 0.18 for median DTC, weak-to-fair band)
10. **Prioritized fix-list generated** — script output enumerates fixes in Pillar-3 (LCP) → Pillar-4 (INP) → Pillar-5 (CLS) order with per-fix-CVR-lift table
11. **Top-3 LCP fixes shipped** — at minimum, AVIF/WebP conversion + explicit width/height + LCP-image-preload are live on production
12. **Top-2 INP fixes shipped** — at minimum, third-party-script-budget-enforcement + add-to-cart-handler-debouncing are live
13. **Top-2 CLS fixes shipped** — at minimum, all `<img>` explicit dimensions + `font-display: swap` are live
14. **Day-7 Lighthouse re-run** — Lighthouse score improved (Performance score +10 points OR LCP −1.0s)
15. **Day-14 CrUX 75th-percentile check** — CrUX dashboard shows progress toward target (LCP −500ms vs baseline)
16. **Day-28 CrUX 75th-percentile check** — CrUX dashboard shows ≥−1.0s LCP vs baseline
17. **Real-device mobile test** — Test on real iPhone + Android device, confirm LCP / INP / CLS at the user-perceived level
18. **Lighthouse CI green on next theme deploy** — post-deploy CI run shows no CWV regression

### Gate C — Steady-state (10 prereqs)

The speed cadence is operationalized:

19. **All 3 CWV green at 75th percentile for 28 consecutive days** — CrUX origin-suffix dashboard shows LCP ≤2.5s + INP ≤200ms + CLS ≤0.1 at p75
20. **Health band reaches great** — `scripts/site_speed_cwv_score.py` returns score ≥75 (top 35% of stores per Treo Site Speed 2024)
21. **Lighthouse mobile Performance score ≥90** — Lighthouse mobile run on all 5 templates returns Performance ≥90
22. **Lighthouse desktop Performance score ≥95** — Lighthouse desktop run on all 5 templates returns Performance ≥95
23. **Third-party-script count ≤5 per page** — Chrome DevTools Network tab confirms ≤5 third-party origins per page-load
24. **Lighthouse CI gate deployed** — every theme deploy runs Lighthouse CI and fails the build if any CWV exceeds threshold
25. **CrUX monitoring cadence scheduled** — operator has added CrUX check to the monthly checklist (the canonical continuous-improvement cadence)
26. **Documented 28-day CR lift** — GA4 / Shopify Analytics shows ≥+8% site-wide CR over 28 days vs pre-audit baseline (the canonical Move #2.5 lift claim per research/00 §25)
27. **Site-wide revenue lift documented** — Triple Whale (or GA4) reports ≥+6% site-wide revenue lift over 90 days (the canonical Move #2.5 + Move #3 + Move #9 stacking)
28. **Move #9 + Move #9.5 sequencing planned** — Move #9 mobile PDP redesign (skill/06) + Move #9.5 PDP A/B testing (skill/08) queued for next 90-day cycle (the canonical post-Move #2.5 sequencing per research/02 §1)

### Gate D — Year-1 ROI in great band (10 prereqs)

The audit has produced measurable Year-1 incremental revenue:

29. **Year-1 incremental revenue ≥$60k** — total incremental revenue attributable to Move #2.5 CWV fixes (Path B DEFAULT at $1M–$10M US DTC base) ≥$60k
30. **Path B Year-1 ROI ≥8:1** — Year-1 incremental revenue ÷ (operator cost + Cloudflare Pro + ShortPixel/ImageKit + Lighthouse CI) ≥8:1 (the "great" band per the canonical 4-band classifier)
31. **Cost stack within Path B band** — total operator cost ≤$20k for $1M–$10M GMV Path B (the canonical 4-band-classifier default)
32. **No CR regression on desktop** — desktop CR within ±5% of pre-audit baseline (Move #2.5 mobile-targets must NOT regress desktop)
33. **No CR regression on existing flows** — cart-abandon (Move #1) + welcome (Move #4) + Triple Whale attribution (Move #6) flows show no regression post-Move #2.5
34. **No new theme-update regressions** — over 90 days, post-deploy Lighthouse CI green rate ≥95%
35. **5-year compounding milestone tracked** — annual Lighthouse + CrUX cadence maintains "great" CWV band; new Lighthouse audits + Chromium features trigger incremental fixes (e.g. scheduler.yield() Chrome 130+ + view-transitions API 2024+ + Speculation Rules API 2024+)
36. **Move #3 + Move #9 + Move #9.5 sequencing planned** — Move #3 checkout audit (skill/22) + Move #9 mobile PDP redesign (skill/06) + Move #9.5 PDP A/B testing (skill/08) queued for next 90-day cycle (the canonical post-Move #2.5 sequencing per research/02 §1–§3)
37. **5-pillar + 18-pitfall matrix archived** — `scripts/site_speed_cwv_score.py`'s canonical 5-pillar × 18-pitfall matrix is the operator's master checklist for the next audit cycle
38. **Triple Whale cohort LTV verified** — Move #6 Triple Whale shows speed-fix-attributed cohort LTV is NOT lower than baseline cohort LTV (i.e. the lift comes from new buyers + retained buyers, not just more-low-LTV-buyers — the canonical Move #6 + Move #9.5 cohort-overlay discipline)

**Year-1 ROI check (Path B DEFAULT at $1M–$10M US DTC base per research/00 §25):** 12:1 default Path B = $60k–$250k Year-1 incremental net vs $5k–$20k operator cost. The 5-year compounding milestone is the maintenance of "great" CWV band + 12–25% cumulative site-wide CR lift when Move #3 + Move #9 + Move #9.5 are stacked on top.

## How to extend this skill

The Move #2.5 site speed + Core Web Vitals skill is designed to be extended along 6 dimensions:

1. **Add Move #2.6 — CrUX + GA4 Web Vitals + Datadog RUM dashboard.** The 3-source speed-monitoring substrate (CrUX for SEO ranking signal + GA4 Web Vitals for marketing-team visibility + Datadog RUM for engineering-team alerting) needs a single dashboard surfacing all 3 in one view. Add a new skill `skills/36-web-vitals-monitoring-dashboard.md` with the 3-source ingest pipeline + Grafana/Datadog dashboard JSON. Expected: faster detection of CWV regressions (28-day → real-time).

2. **Add Move #2.7 — AVIF + WebP + responsive-image-pipeline.** Move #2.5 L1 (AVIF conversion) is the highest-leverage fix but operators without a CDN can't easily do it. A dedicated skill covering ImageKit / Cloudinary / ShortPixel / Cloudflare Images integration + the canonical `<picture>` element pattern + responsive `srcset` math + browser-fallback strategy. Expected: +5–10% CR lift on top of Move #2.5.

3. **Add Move #2.8 — Third-party-script-budget-enforcement.** Move #2.5 I1 (third-party-script audit) is the second-highest-leverage fix but operators typically don't have a written budget policy. A dedicated skill covering the canonical Lighthouse 2024 third-party-budget (≤5 × ≤200KB × ≤200ms), the audit cadence, the per-tag Manager governance, the requestIdleCallback / scroll-trigger / interaction-trigger loading patterns, and the rollback plan when a vendor breaks the budget. Expected: −150–400ms INP lift.

4. **Add Move #2.9 — Headless-commerce-speed-architecture.** Move #2.5 Path C (enterprise headless) is the highest-leverage but highest-effort path. A dedicated skill covering Shopify Hydrogen + custom Next.js + Vercel/Cloudflare edge + ImageKit/Cloudinary + CrUX monitoring + Datadog RUM + dedicated web-vitals team. Expected: +25–40% CR lift on top of Move #2.5 Path B.

5. **Add Move #2.10 — International-CWV.** Move #2.5 measures US CrUX. International (EU/UK/AU/JP) CWV is a separate signal (different network conditions, different devices, different CrUX origin-suffix eligibility). A dedicated skill covering per-region Lighthouse + RUM + CDN edge configuration + per-region performance budget. Per Move #25 international-expansion (skill/25), this is the canonical pre-international-rollout speed audit.

6. **Add Move #2.11 — Subscription-checkout-speed.** Move #5 subscription-replenishment (skill/05) adds a confirm-step to checkout (5–10% friction). The subscription-checkout path has a different LCP element (the subscription-confirm modal vs the one-page-checkout) and a different third-party-script list (Recharge/Skio/Bold-Subscriptions checkout widget). A dedicated Move #2.11 covers the subscription-checkout-specific speed profile. Per Move #5.x subscription-replenishment, this is a natural follow-up for consumables brands.

## Cross-references

- **Move #1 — Abandoned cart recovery** (skill/01): the highest-ROI flow. Move #2.5 speeds up the cart page, which Move #1 fires from — speed + cart-recovery compound on the same page.
- **Move #3 — Checkout audit + Baymard fix-list** (skill/22): Move #2.5 speeds up the checkout (Pillar 5 mobile-specific); Move #3 audits + fixes the checkout UX (the canonical 24-guideline Baymard matrix). The two stack.
- **Move #6 — Triple Whale attribution** (skill/13): the canonical cohort-LTV-overlay discipline. Move #2.5 uses Triple Whale to verify that speed-fix-attributed cohort LTV is NOT lower than baseline cohort LTV (Pitfall #18 + Verification Gate D-38).
- **Move #6.5 — Attribution quality audit** (skill/13): the weekly attribution-quality cadence. Move #2.5 uses Move #6.5 to confirm that the speed-lift attribution is real (not over-attributed due to Meta/iOS inflation).
- **Move #9 — Mobile PDP redesign** (skill/06): Move #2.5 Pillar 5 mobile-specific covers the PDP hero image + sticky-ATC; Move #9 covers the PDP UX (the canonical 7-step PDP edit). The two stack on mobile.
- **Move #9.5 — PDP A/B testing program** (skill/08): Move #2.5 speeds up the PDP; Move #9.5 A/B-tests PDP changes (including speed-related ones). The two compound.
- **Move #12 — Subscription replenishment** (skill/05): per Move #2.11 above, subscription-checkout has a different speed profile.
- **Move #21 — 3PL migration** (skill/21): Move #2.5 is about the storefront; Move #21 is about the warehouse. Both contribute to overall customer experience but are independent.
- **Move #22 — Checkout audit + Baymard fix-list** (skill/22): Move #2.5 + Move #22 are the canonical speed + UX stack on checkout.
- **Move #25 — International expansion** (skill/25): per Move #2.10 above, international CWV is a separate signal.
- **research/00-ecommerce-ops-landscape.md §25**: the canonical source for "site speed is the highest-EV, lowest-cost fix" + the Deloitte/Vodafone per-100ms-CR-lift citation.
- **research/02-top-10-leverage-moves.md §1**: Site speed is Move #2.5 on the canonical 30-day-rollout sequence (between Move #2 post-purchase-upsell and Move #3 checkout-audit).
- **Google Core Web Vitals 2024** (https://web.dev/vitals/): the canonical source for LCP / INP / CLS thresholds.
- **Google CrUX 2024** (https://developer.chrome.com/docs/crux/): the canonical source for field-data 75th-percentile measurement + origin-suffix eligibility.
- **Lighthouse 2024** (https://developer.chrome.com/docs/lighthouse/overview/): the canonical lab-data measurement tool.
- **web-vitals JS library 2024** (https://github.com/GoogleChrome/web-vitals): the canonical JS library for sending CWV to GA4 / Datadog / any analytics platform.

## Sources

[Google Core Web Vitals 2024](https://web.dev/vitals/) · [Google CrUX 2024](https://developer.chrome.com/docs/crux/) · [Google PageSpeed Insights 2024](https://pagespeed.web.dev/) · [Lighthouse 2024](https://developer.chrome.com/docs/lighthouse/overview/) · [web-vitals JS library 2024](https://github.com/GoogleChrome/web-vitals) · [Shopify Online Store Speed 2024](https://help.shopify.com/en/manual/online-sales-channels/online-store/speed) · [Shopify Theme Performance 2024](https://shopify.dev/docs/themes/architecture/templates) · [Shopify Hydrogen 2024](https://shopify.dev/docs/api/hydrogen) · [Cloudflare CDN 2024](https://www.cloudflare.com/cdn/) · [Cloudflare Images 2024](https://developers.cloudflare.com/images/) · [Fastly CDN 2024](https://www.fastly.com/products/cdn) · [TinyIMG 2024](https://tinyimg.io/) · [ShortPixel 2024](https://shortpixel.com/) · [ImageKit 2024](https://imagekit.io/) · [Cloudinary 2024](https://cloudinary.com/) · [AVIF browser support 2024](https://caniuse.com/avif) · [WebP browser support 2024](https://caniuse.com/webp) · [Deloitte Milliseconds 2020](https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/) · [Google Vodafone 2020](https://www.thinkwithgoogle.com/feature/web-vitals-case-study/) · [Akamai Mobile Commerce 2024](https://www.akamai.com/newsroom/press-release/akamai-reports-online-retailers-losing-revenue-due-to-mobile-page-load-delays) · [DoubleClick Ad Experience 2024](https://www.doubleclickbygoogle.com/) · [GA4 Web Vitals 2024](https://support.google.com/analytics/answer/12057835) · [Shopify Analytics Web Vitals 2024](https://help.shopify.com/en/manual/technology/analytics) · [Triple Whale Speed Overlay 2024](https://www.triplewhale.com/) · [Datadog RUM 2024](https://www.datadoghq.com/product/real-user-monitoring/) · [Sematext RUM 2024](https://sematext.com/web-vitals-monitoring/) · [Treo Site Speed 2024](https://treo.sh/site-speed)