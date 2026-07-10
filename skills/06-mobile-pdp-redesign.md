---
name: mobile-pdp-redesign
title: Mobile-first PDP redesign (speed + above-the-fold + sticky ATC)
category: acquisition
tier: 1
priority: P1
default_move: 9
year_1_roi_band: "10:1–25:1"
sms_friendly: false
last_updated: 2026-07-10
sources: [triple-whale 2024, pagespeed-insights 2024, crux 2024, yotpo 2024, loox 2024, junip 2024, rebuy 2024, aftersell 2024, shortpixel 2024, shopify 2024, cloudflare 2024, klaviyo 2024, gorgias 2024, hotjar 2024]
---

# Mobile-first PDP redesign (speed + above-the-fold + sticky ATC)

> The highest-leverage CRO move outside the checkout overhaul. Mobile is 70%+ of ecommerce traffic but converts at ~1.8% vs 3.9% desktop — closing half that gap lifts total store revenue 10–15% in 14 days. The build surface is theme.liquid + an image-optimization pipeline + a sticky-ATC snippet, shippable in 1–2 weeks of focused dev work. Move #9 — the natural follow-up once cart-recovery + welcome + SMS + loyalty + subscriptions are live and the conversion-rate floor is the next bottleneck.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce / Headless) store with at least 12 months of order history
- At least 500 mobile sessions/day on the top 10 PDPs (Triple Whale → Pages → filter by Mobile)
- A baseline snapshot of mobile CVR from the last 14 days (pre-redesign) for the lift comparison
- Triple Whale (Move #6) or Polar Analytics installed and producing daily Mobile vs Desktop CVR
- PageSpeed Insights mobile score baseline captured for the top 10 PDPs
- A 14-day launch window with no major sale, no new product drop, no ad-creative refresh
- Source product photography in high-quality format (≥5 images per top-10 SKU at ≥2000×2000px)
- Admin access to theme.liquid OR developer access via Shopify CLI / a staging theme
- Budget $0–$500 approved (theme purchase + image-optimization tool + Pagespeed-Audit tool)

You do NOT have:
- A mobile CVR ≥3.0% (the median Shopify brand is at 1.5–2.0%)
- Core Web Vitals green (LCP <2.5s, INP <200ms, CLS <0.1 on real-user CrUX data)
- Above-the-fold ATC visible without scrolling on iPhone SE + Pro Max emulation
- A sticky ATC bar that triggers on scroll-past-original-ATC
- Hero images served as AVIF/WebP at ≤200 KB (most stores serve 1–4 MB JPEGs)
- `font-display: swap` on `@font-face` declarations (most themes still default to FOIT)
- A `fetchpriority="high"` tag on the LCP hero image (browsers load in DOM order by default)
- An always-on PDP A/B testing program (Move #9.5 — next-must-ship follow-up)

## What "best in class" looks like

References: Allbirds, Glossier, Gymshark, Ruggable, Bombas, Athletic Greens, Olipop, Dr. Squatch, Cuts Clothing, Buck Mason, Princess Polly, MVMT watches. Mid-tier proof points: Shopify Plus brands at $5M+ GMV running Dawn / Sense / Turbo themes.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| PageSpeed Insights mobile score | ≥ 95 (top 10 PDPs) | 70 | 100 with custom Hydrogen / headless build |
| LCP (75th pctl, mobile, field) | < 2.0s | < 3.0s | < 1.5s (Hydrogen SSR + image CDN) |
| INP (75th pctl, mobile, field) | < 150ms | < 250ms | < 100ms (Vercel Edge / Fly.io edge-rendered) |
| CLS (75th pctl, mobile, field) | < 0.05 | < 0.15 | 0.0 (font size-adjust + aspect-ratio reserved) |
| Mobile CVR | ≥ 3.5% | 1.5% | ≥ 5% (top 5% of DTC brands) |
| Mobile/desktop CVR ratio | ≥ 0.75 | 0.45 | ≥ 0.90 (effectively parity) |
| Above-the-fold ATC visible without scroll | Yes (iPhone SE + Pro Max + Android mid-tier) | Hidden behind dropdown | Sticky ATC always visible after scroll |
| Hero image size (served, mobile) | ≤ 100 KB AVIF | 1–4 MB JPEG | ≤ 50 KB AVIF + responsive image-set |
| Hero image priority | `fetchpriority="high"` | Default DOM order | `<link rel="preload" as="image">` + priority hint |
| Sticky ATC scroll behavior | Show on scroll-up, hide on scroll-down | Always visible | Direction-aware + price + variant dropdown |
| Reviews widget | Inline first 2 reviews + modal for rest | Modal-only | Yotpo/Loox with photos + verified-buyer badge |
| Cross-sell block | 2–3 items max, 1-tap add | 4+ items, multi-step | AI-driven (Rebuy / AfterSell / Nosto personalization) |
| Variant selector | Color swatch + size pills | Dropdown | Color swatch + visual variant + live-inventory chip |
| Font loading | `font-display: swap` + self-hosted | `font-display: block` (FOIT) | `font-display: optional` + size-adjust |
| Mobile bounce rate (PDP) | ≤ 30% | 50%+ | ≤ 20% (mid-funnel-engaged cohort) |
| Mobile add-to-cart rate | ≥ 12% | 5% | ≥ 18% (top-decile brand benchmark) |
| Mobile revenue per visitor (RPV) | ≥ $1.50 | $0.50 | ≥ $3.00 (high-AOV consumables / apparel) |

## Mobile PDP benchmarks (2024–25)

| Setup | Mobile CVR | Mobile → Desktop CVR ratio | PageSpeed mobile | Year-1 incremental revenue ($1M–$5M GMV) | $/platform-cost |
|---|---|---|---|---|---|
| Custom theme, no PDP work, 4 MB images | 1.5–2.0% | 0.40–0.50 | 50–70 | $0 baseline | n/a |
| Theme switch (Dawn / Sense) + image pipeline + sticky ATC | 2.5–3.0% | 0.60–0.70 | 85–95 | $400k–$700k / yr | 12:1–25:1 |
| Theme + image + above-the-fold + sticky ATC + accordion + reviews + speed | 3.0–3.8% | 0.70–0.85 | 90–98 | $700k–$1.2M / yr | 15:1–35:1 |
| Best in class (Hydrogen + AVIF + edge-rendered + AI-personalization) | 4.0%+ | 0.85–0.95 | 95–100 | $1.2M–$2.5M+ / yr | 25:1–60:1 |

**Median Shopify brand gets +30–60% mobile CVR lift (+1pp absolute, +50% relative) at 15:1 ROI. Best in class gets +100%+ relative mobile CVR lift at 30:1+.** Per Triple Whale 2024 + CrUX 2024 + Yotpo 2024 + Pagespeed-Insights 2024 + Shopify 2024.

## The build (40–80 hr / 1–2 weeks across 7 steps for a competent dev)

### Step 1 — Baseline + theme decision (Day 1)

Run PageSpeed Insights (`https://pagespeed.web.dev/`) on your top 10 PDPs and record mobile score, LCP, INP, CLS in a spreadsheet. Also pull Triple Whale `Devices` mobile CVR for last 14d.

**Theme decision (5 ranked options):**

| Theme | Price | Speed vs Dawn | Design fidelity | When to use |
|---|---|---|---|---|
| **Dawn** (Shopify default) | Free | Baseline | Functional | Default pick; <$500k GMV; theme >3yr old |
| **Sense** (Outbound) | $350 one-time | +15–25% LCP | High (closest to custom) | $1M+ GMV; worth the $350 |
| **Turbo** (Outbound) | $350 one-time | +15–20% LCP | Highest (Porto-style sections) | $1M+ GMV; want flexibility |
| **Prestige** (Maestrooo) | $350 one-time | -10% LCP | Highest design quality | Brand priority over speed |
| **Symmetry** (We are Underground) | $180 one-time | -5% LCP | Mid-tier | Budget-constrained $1M+ |

**Decision rule:** theme switch if PageSpeed mobile <50 OR theme is >3 years old. Otherwise keep the theme and ship Steps 2–7.

### Step 2 — Image optimization pipeline (Days 2–4)

The single biggest LCP win. Most stores serve 2–5 MB hero images that compress to 100–300 KB without visible quality loss.

**Pipeline rules:**

1. Format: AVIF first → WebP fallback → JPEG final fallback (Shopify's `image_url` filter handles this).
2. Max dimension: 2000×2000px (390px-wide phone × 2× retina = 780px needed; 1200px is safer).
3. Compression target: ≤200 KB hero/gallery, ≤100 KB thumbnails.
4. Lazy-load below-fold (`loading="lazy"` + `decoding="async"`).
5. `fetchpriority="high"` on the first product image `<img>` tag (the LCP element).
6. `<link rel="preload" as="image" href="hero.jpg">` in `theme.liquid` `<head>` for the LCP image.
7. CDN: Shopify's `cdn.shopify.com` (Cloudflare) is automatic.

### Step 3 — Above-the-fold redesign (Days 5–7)

390×600px viewport (iPhone 14 Pro class). Every pixel counts.

**Above-the-fold layout (top-to-bottom, mobile only):**

```
┌─────────────────────────────────┐
│  [☰ Menu]   [Logo]    [🛒 Cart] │  ← sticky topbar (56px)
├─────────────────────────────────┤
│  [Product Gallery: 1/5]        │  ← 1 image visible, 16:9, swipeable
│  ┌─────────────────────────┐    │
│  │    Hero Product Image   │    │
│  │      (LCP element)      │    │
│  └─────────────────────────┘    │
│  • ○ ○ ○ ○                      │  ← gallery dots
├─────────────────────────────────┤
│  Brand Name · Product Title    │  ← 18px
│  ★★★★☆ (234 reviews) · $75    │  ← 14px + 20px price
├─────────────────────────────────┤
│  Color: Black ▾ · Size: [M][L] │  ← swatch + pills (NOT dropdown)
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │     ADD TO CART             ││  ← 48px full-width brand color
│  └─────────────────────────────┘│
│  🔒 Secure checkout · Free ship │
└─────────────────────────────────┘
```

**Five rules:** gallery = 1 image swipe (not 3-up carousel) · ATC always visible · variant = swatch + pills (not dropdown) · trust signals BELOW ATC · NO popup modals on PDP load.

### Step 4 — Sticky ATC bar (Day 8)

Single highest-leverage PDP element (+5–12% mobile CVR in most A/B tests).

```
┌─────────────────────────────────┐
│ $75.00   [   ADD TO CART   ]   │  ← 56px, white bg, top shadow
└─────────────────────────────────┘
```

**Five implementation rules:** triggers on scroll past original ATC (IntersectionObserver, intersection=0) · hides on scroll-down, shows on scroll-up · hides when original ATC is back in view · hides at footer · disappears on "Added to cart" success state.

**Critical CSS:** `padding-bottom: 56px` on `<body>` when sticky bar is visible (so the last 56px of content remains reachable).

### Step 5 — Below-the-fold redesign (Days 9–11)

Where the user reads, compares, decides.

1. **Description as accordion** — default closed except first paragraph; 4 accordions (Description / Ingredients / Shipping / How-to-use).
2. **Reviews block** (Yotpo / Loox / Junip) — 12px rating summary + first 2 reviews inline + "See all N" modal. Inline reviews lift mobile CVR 10–20% [Yotpo 2024].
3. **Cross-sell** (Rebuy / AfterSell / Bold Upsell) — 2–3 items max, 1-tap add.
4. **Size guide** (apparel only) — collapsible between Description and Reviews.
5. **Trust badges** — inline icons below reviews (NOT a separate hero section).

### Step 6 — Speed optimization: CSS + JS + fonts (Days 11–13)

**CSS:**
- Inline critical CSS for above-the-fold (gallery + ATC + price).
- Defer non-critical CSS (`media="print" onload="this.media='all'"`).
- Remove unused CSS (PurgeCSS / UnusedCSS).

**JS:**
- Defer all third-party scripts (Klaviyo onsite, Yotpo, Gorgias, Hotjar, Meta Pixel, GTM) below fold.
- Lazy-mount Yotpo / Rebuy / Gorgias via `IntersectionObserver` (only when user scrolls near the block).
- Self-host Meta Pixel + Google Tag (third-party CDN adds 100–300 KB).

**Fonts:**
- `font-display: swap` on every `@font-face` (NOT `block`, NOT `auto`).
- Self-host fonts (don't use Google Fonts CDN).
- Subset fonts to Latin only (drop Cyrillic, Vietnamese, Latin-Extended).
- `font-display: optional` for non-critical fonts (with `size-adjust` + `ascent-override` to prevent CLS).

### Step 7 — Verification + measurement (Day 14)

Run the 7-gate verification below. ALL must be GREEN before declaring shipped.

## Common pitfalls (15 from real builds)

1. **Hero image is 4 MB.** A 4000×4000px JPEG at quality 100, served without resizing, kills LCP. **Fix:** Step 2 pipeline — ≤200 KB, AVIF/WebP, max 2000×2000px, lazy-load.
2. **Web font FOIT (Flash of Invisible Text).** `@font-face` with default `font-display: block` makes text invisible 1–3s. **Fix:** `font-display: swap` on every `@font-face`.
3. **Third-party scripts block main thread.** Klaviyo + Yotpo + Gorgias + Meta Pixel + GTM = 5 scripts racing. **Fix:** all `defer` OR `IntersectionObserver` lazy-mount.
4. **Sticky ATC blocks the bottom 56px permanently.** User scrolls to read the last paragraph — covered by sticky bar. **Fix:** `padding-bottom: 56px` on `<body>` when sticky bar visible.
5. **Sticky ATC shows on scroll-up but never hides on scroll-down.** User reads → bar slides up → covers content → wait → reads → bar slides up again. **Fix:** scroll-direction tracking (show on up, hide on down).
6. **Description accordion too aggressive (everything default-closed).** User wants specs → taps 4 accordions → friction → leaves. **Fix:** first paragraph of "Description" always visible inline; rest in accordion.
7. **Variant selector is a dropdown.** Mobile = 2 taps (open + select) vs 1 tap for pill. **Fix:** color swatch + size pills; no dropdowns for ≤8 options.
8. **Reviews widget loads 800 KB of JS (Yotpo / Loox / Junip default).** **Fix:** lazy-mount via `IntersectionObserver` (load only when user is within 200px).
9. **No `fetchpriority="high"` on the LCP image.** Browser loads in DOM order; hero is image #5; user sees blank rectangle 2s. **Fix:** `fetchpriority="high"` on first product image.
10. **Theme switch loses brand styling.** Brand colors, typography, custom sections gone. **Fix:** before switching, audit brand-critical customizations; rebuild in Dawn OR pick Sense/Turbo.
11. **Measuring CVR delta in the wrong window.** Ship day 7, measure day 8, declare +25% victory — but day 8 is Sunday, day 7 was Saturday. **Fix:** 14-day window post-launch vs 14-day window pre-launch (same DOW mix).
12. **Theme switch reorders product images.** Migration scrambles `product.images[]` order. **Fix:** export product image order as CSV before switching; re-verify top-20 PDPs visually after.
13. **CLS from late-loading fonts.** Web font swaps in mid-render → text shifts 2–4px → CLS spike → PageSpeed drops. **Fix:** `font-display: optional` for non-critical fonts + `size-adjust` + `ascent-override`.
14. **Sticky ATC color clashes with brand color.** Sticky bar `#FF6B35` (orange) vs brand `#1A1A2E` (navy); looks like an ad. **Fix:** match sticky bar CTA color to original ATC exactly.
15. **No backup plan if mobile CVR drops.** Redesign ships → CVR drops 10% → revert in 24h stress. **Fix:** always keep old theme + PDP layout; use Shopify's "Duplicate theme" feature to re-publish in 60s.

## Verification (this skill is "shipped" when...)

The 7-gate sequence. ALL must pass.

- [ ] **Gate A — PageSpeed Insights mobile score ≥ 90** on all top-10 PDPs (was typical 50–70 baseline)
- [ ] **Gate B — Search Console CrUX 28-day field data green** — LCP < 2.5s, INP < 200ms, CLS < 0.1 on the 75th percentile of mobile users
- [ ] **Gate C — Sticky ATC functional test** — scroll past original ATC → sticky appears → scroll-up → bar appears → scroll to footer → bar disappears → tap ATC → cart opens → bar disappears
- [ ] **Gate D — Above-the-fold ATC visibility** — iPhone SE (375×667) + iPhone 14 Pro Max (430×932) + Android mid-tier (412×915) emulations; ATC visible without scroll on all 3
- [ ] **Gate E — Mobile CVR delta ≥ +20% relative** at the 14-day post-launch window vs 14-day pre-launch baseline (Triple Whale Devices → Mobile CVR)
- [ ] **Gate F — Desktop CVR NOT regressed** within ±5% (the redesign is mobile-first, NOT mobile-only)
- [ ] **Gate G — Gallery swipe + reviews block render** — swipe hero image to image 5 → tap "See all 234 reviews" → modal opens → cross-sell block renders 2–3 items → tap cross-sell "Add" → cart updates

**15-metric monitoring table** (Triple Whale + PageSpeed + CrUX + Yotpo + Hotjar — record "Pre" baseline column):

| Metric | Source | Pre baseline | Target band post-redesign | How to slice |
|---|---|---|---|---|
| PageSpeed mobile score | PageSpeed Insights | 50–70 | ≥ 90 | Per-PDP URL |
| LCP (75th pctl, mobile) | CrUX | 3.5–5.0s | < 2.5s | All PDPs aggregated |
| INP (75th pctl, mobile) | CrUX | 300–500ms | < 200ms | All PDPs aggregated |
| CLS (75th pctl, mobile) | CrUX | 0.15–0.30 | < 0.1 | All PDPs aggregated |
| Mobile CVR | Triple Whale Devices | 1.5–2.0% | 2.5–3.0% (+30–60% rel) | Last 14d mobile |
| Desktop CVR | Triple Whale Devices | 3.5–4.0% | Neutral to +5% | Last 14d desktop |
| Mobile add-to-cart rate | Triple Whale Funnel | 8% | 10–12% (+15–30% rel) | Mobile PDP sessions |
| Mobile RPV | Triple Whale Devices | $0.50 | $0.60–0.80 (+10–25%) | Mobile sessions |
| Mobile bounce rate (PDP) | Triple Whale Pages | 40–50% | 32–36% (-10–20% rel) | Mobile PDP sessions |
| Mobile avg session dur (PDP) | Triple Whale Pages | 60s | 70–80s (+10–20%) | Mobile PDP sessions |
| Gallery swipe rate | Hotjar / Clarity | 50–60% | ≥ 60% swipe past image 1 | Sample 20 recordings |
| Sticky ATC tap rate | TW event tag `sticky_atc_tap` | n/a | ≥ 10% of mobile sessions tap | Mobile PDP sessions |
| ATC visibility time | PageSpeed LCP-element field | n/a | LCP = gallery image OR ATC | Per PDP |
| PDP load time (75th pctl) | PageSpeed field | 4.5–7.0s | < 3.0s | All PDPs aggregated |
| % mobile on fast 4G+ | Triple Whale Devices | Operator baseline | Should NOT change | All mobile sessions |

## How to extend this skill

Once Phase 1–3 are live + the 7-gate verification is GREEN:

- **Add an always-on PDP A/B testing program (Move #9.5)** — Convert.com Growth $349/mo for $500k–$5M GMV; Shoplift $29–99/mo for <$500k GMV; VWO Standard $314/mo for $5M+. Run 1–2 tests/month from an 8-element backlog (hero image / ATC copy / sticky bar color / reviews placement / price display / accordion default / free-shipping threshold / variant pills). Cumulative 5–15% YoY CVR improvement compounds on top of Move #9.
- **Add AI-driven PDP personalization** — Rebuy / Nosto / Dynamic Yield. Show personalized cross-sells, "frequently bought together" by customer cohort (loyalty tier / repeat-buyer / first-time-visitor). 5–15% incremental mobile CVR beyond the baseline redesign.
- **Add sticky variant selector** — if multi-variant (size + color) is core to the catalog, add a sticky variant picker above the sticky ATC bar so users can change size without leaving the page.
- **Add AR/3D product viewer** — for premium SKUs ($75+ AOV, 5+ variants, high-return-rate categories like furniture/footwear/jewelry). Tools: Shopify AR (`/admin/api/2024-04/themes/assets.json`), Threekit, ARitize. Typically lifts mobile CVR another 5–10% on AR-enabled SKUs.
- **Add PageSpeed regression monitoring** — set up PageSpeed Insights API + a weekly cron to score all top-10 PDPs; alert if any PDP drops >10 points. Pair with CrUX 28-day rolling average for trend signal.
- **Add heatmap + recording audit** — Hotjar / Clarity / FullSession; review 20 mobile recordings/wk to find new friction as it's introduced (theme updates, app installs).

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1 — both Moved #1 + #9 compound on the same mobile traffic)
- Companion skill: `welcome-series` (Move #4 — welcome subscribers post-atc; mobile-first welcome on the same Klaviyo infrastructure)
- Companion skill: `loyalty-program` (Move #8 — VIP-tier exclusive SKUs on PDP; loyalty-redeem block in PDP description for loyalty members)
- Companion skill: `subscription-replenishment` (Move #11 — subscribe-and-save widget on the redrawn PDP gallery; reusable across all hero SKUs after the redesign lands)
- Companion playbook: `playbooks/09-mobile-pdp-redesign.md` (canonical Move #9 source; 5-path decision matrix [A: theme switch / B: PDP edits on existing theme / C: CRO agency / D: non-Shopify / E: defer], 12-prereq gate, 7-step build, 15-pitfall list, 7-gate verification, 15-metric monitoring table, cost-ROI table for $1M–$5M default case)
- Companion playbook: `playbooks/09.5-pdp-ab-testing-program.md` (the canonical Move #9.5 follow-up — always-on PDP A/B testing program; gated on Move #9 shipping first)
- Companion research: `/research/00-ecommerce-ops-landscape.md` §"What 'best in class' looks like" (mobile PDP examples: Allbirds, Glossier, Gymshark, Bombas)
- Companion research: `/research/03-30-day-rollout-plan.md` §Move #9 (the canonical 14-day build window; prerequisites are Triple Whale + ≥500 mobile sessions/day + 14-day launch window)
- Companion research: `/research/02-top-10-leverage-moves.md` (Move #9 is ranked #6 by ROI/hour per mobile traffic dominance)

## Sources

- Triple Whale, "Devices report: Mobile vs Desktop CVR benchmarks 2024"
- Triple Whale, "Mobile RPV + bounce rate + session duration benchmarks 2024"
- Triple Whale, "Funnel report: mobile add-to-cart rate + sticky ATC event-tagging 2024"
- Google PageSpeed Insights 2024 + Core Web Vitals thresholds documentation
- Chrome User Experience (CrUX) Report, "Real-user mobile LCP / INP / CLS 28-day field data 2024"
- Yotpo, "Inline-reviews lift on mobile PDP CVR 2024"
- Loox, "Photo-reviews widget performance benchmarks 2024"
- Junip, "Reviews widget JS bundle size + lazy-mount benchmarks 2024"
- Rebuy, "Post-purchase cross-sell CVR benchmarks 2024"
- AfterSell, "Frequently-bought-together CVR benchmarks 2024"
- ShortPixel, "Image CDN compression benchmarks 2024"
- Shopify, "Theme.liquid + image_url + fetchpriority high 2024"
- Cloudflare, "Mobile CDN LCP benchmarks 2024"
- Klaviyo, "Onsite messaging + defer-3rd-party performance 2024"
- Gorgias, "Chat widget lazy-mount performance 2024"
- Hotjar / Microsoft Clarity, "Mobile session recording gallery-swipe-rate analysis 2024"
