# Move #9 — Mobile-first PDP redesign (speed + above-the-fold + sticky ATC)

> **Why this move is the next-on-deck for stores that just shipped Moves #1–#8.** Mobile is 73% of ecommerce traffic [Triple Whale 2025] but converts at **1.8% vs 3.9% desktop** — a **2.16× gap**. Closing half that gap (mobile CVR from 1.8% → 2.85%) typically lifts total store revenue **10–15%** because mobile dominates the traffic mix. The build surface is your theme.liquid + a small image-optimization pipeline + a sticky-ATC snippet. The whole playbook ships in 1–2 weeks of focused dev work and is **the highest-leverage CRO move available** outside the checkout overhaul (Move #3).
>
> **Honest read.** This is a CRO-heavy move; you need a **measurement foundation** to know whether it worked. Install **Triple Whale Starter (Move #6)** or **Polar Analytics Starter** BEFORE shipping the redesign — without it, you'll be guessing whether the +12% revenue came from the redesign or from the new welcome series (Move #4) or SMS flow (Move #7) you launched the same week. Run a 14-day baseline pre-redesign, ship the redesign, run a 14-day post-redesign, compare mobile CVR delta. If the delta is <+5%, revert one of the higher-risk changes (typically the sticky ATC or the accordion description) and re-test.
>
> **Companion assets:** no script needed (Shopify theme.liquid is the build surface and the CVR-lift math is operator-readable from the cost table below). A `dashboards/pdp-speed-monitor.html` static dashboard is the natural follow-up if you want always-on LCP/INP/CLS monitoring — out of scope for this tick.

## Goal

In 1–2 weeks of focused work, ship a mobile-first PDP that:

1. **Achieves Core Web Vitals targets** — LCP < 2.5s, INP < 200ms, CLS < 0.1 on the 75th percentile of real-user (CrUX) data — measured via PageSpeed Insights + Search Console CrUX.
2. **Closes at least half the mobile/desktop CVR gap** — measured via Triple Whale `Devices` report (mobile CVR vs desktop CVR). Realistic target: mobile CVR from 1.8% baseline → 2.5–3.0% post-redesign.
3. **Lifts mobile add-to-cart rate by 15–30%** — measured via Triple Whale `Funnel` report (product view → add-to-cart step).
4. **Lifts mobile revenue per visitor (RPV) by 10–25%** — measured via Triple Whale `Revenue by device` or Shopify Analytics → Reports → "Sessions by device" filtered to mobile.
5. **Preserves desktop CVR** — the redesign is mobile-first, NOT mobile-only. Desktop should be neutral to +5%, never negative.

**Out of scope:** Full site redesign, navigation overhaul, new checkout (that's Move #3 — checkout audit), PDP A/B testing program (that's a follow-up Move #9.5 — see Next moves), PDP personalization via Rebuy/Nosto (a separate lever), AR/3D product viewers (premium-tier only).

## Which approach fits your store

Pick one of five paths. The decision is driven by **theme baseline + traffic volume + dev capacity**, not by wishlist.

| Path | Store profile | Recommended approach | Build surface | Why this one |
|---|---|---|---|---|
| **A** | Shopify brand, <$500k GMV, custom theme, no dev | **Switch to a fast theme (Dawn / Sense / Turbo)** + apply the 7 PDP redesign steps below | Theme migration (1–2 days) + 7-step PDP edits (3–5 days) | The theme is likely 60–70% of your LCP problem. A switch to Dawn (free) or Sense (Outbound, $350) typically halves LCP before any PDP edits. Cheapest path to a 10–15% mobile CVR lift |
| **B** | Shopify brand, $500k–$5M GMV, on a fast theme already, has dev capacity | **Apply the 7 PDP redesign steps on the existing theme** | theme.liquid + section snippets | Your theme is fast but the PDP layout is the bottleneck. The 7 steps below typically lift mobile CVR 10–25% without a theme switch |
| **C** | Shopify brand, $5M+ GMV, on a custom theme, has senior dev | **Hire a CRO agency for a 4-week audit + redesign** (Baymard UX-Ray, CXL Institute, Conversionomics) | Theme + custom PDP app + analytics | Above $5M GMV the ROI supports a $15k–$50k agency engagement; the in-house 7-step path is too slow at that scale |
| **D** | Non-Shopify (WooCommerce / BigCommerce / headless) | **Apply the 7-step principles to your platform's PDP template** | WooCommerce `single-product.php` / BigCommerce PDP template / Next.js / Hydrogen | The 7 principles transfer directly; the build surface is whatever your platform calls the PDP template. Speed gains require platform-specific work (object cache, image CDN, server-side rendering) |
| **E** | Pre-revenue / <$10k/mo traffic | **Defer this playbook; ship Moves #1 + #5 first** | n/a | Without ≥500 mobile visitors/day the CVR delta is too noisy to attribute. Ship the revenue levers first, then come back to the PDP |

**Default for this playbook: Path A or Path B.** Switch to Path C if store is >$5M GMV, switch to Path D if not on Shopify, skip to revenue levers on Path E.

**Decision rule of thumb:** if your theme is more than 3 years old or you've never run a PageSpeed Insights audit, you're on Path A (theme switch first). If your PageSpeed mobile score is already ≥ 70 but mobile CVR is still <2%, you're on Path B (PDP layout is the bottleneck).

## Prerequisites

All 12 must be true before starting Step 1. Each row has the verification command or check.

| # | Prerequisite | Why it matters | Verification |
|---|---|---|---|
| 1 | You have **Triple Whale Starter or Polar Analytics installed** (Move #6 shipped) | Mobile CVR measurement is the success criterion for this playbook | Triple Whale → Reports → Devices → "Mobile" row shows non-zero sessions |
| 2 | You have **admin access** to your Shopify store | theme.liquid edit + image upload + app install require admin | Shopify → Settings → Users and permissions → role = "Owner" or "Staff with full access" |
| 3 | You have **Shopify CLI installed** (for theme development) OR a staging theme in your admin | Theme edits must be tested in a duplicate theme before publishing live | Run `shopify theme dev --theme <theme-id>` in terminal; verify the dev server boots |
| 4 | You have a **baseline snapshot of mobile CVR** from the last 14 days (pre-redesign) | You'll compare post-redesign mobile CVR against this baseline to verify the lift | Triple Whale → Reports → Devices → Mobile CVR last 14d; record in a spreadsheet |
| 5 | You have a **baseline snapshot of PageSpeed Insights mobile score** for your top 10 PDPs | You'll compare post-redesign PageSpeed scores to verify the speed gains | Run PageSpeed Insights (`https://pagespeed.web.dev/`) on each top PDP; record scores in a spreadsheet |
| 6 | You have **Google Search Console CrUX data** for your domain (free) | Real-user Core Web Vitals data (75th percentile of Chrome users) is the gold standard for LCP/INP/CLS — PageSpeed Insights alone is a synthetic lab test | Search Console → Experience → Core Web Vitals → Mobile + Desktop rows show 28-day data |
| 7 | You have **read access to Move #1 (abandoned cart), Move #4 (welcome series), Move #7 (SMS) flow performance** | Mobile CVR is the variable; flow performance is the constant. If you change flows in the same 14-day window, attribution is impossible | Klaviyo → Analytics → Flows → verify all 6 flows have been live for ≥ 30 days with no recent changes |
| 8 | You have **a budget of $0–$500 approved** for theme purchase + image-optimization tool | Path A theme switch (Sense theme = $350 one-time) + image CDN ($0–$50/mo for Cloudflare Pro or ShortPixel) | Confirmed in writing (Slack thread, Notion doc, or Loom from the founder) |
| 9 | You have **access to product photography** in the highest-quality format available | The image-optimization pipeline needs source images; the redesign assumes ≥5 product images per SKU | Atrium / Canva / photographer handoff; each top-10 SKU has ≥5 images at 2000×2000px+ |
| 10 | You have **read access to the current theme's section files** (`main-product.liquid`, `product.liquid`, or section group JSON) | The 7 PDP edits below assume you can identify and edit the relevant section files | Shopify → Online Store → Themes → … → Edit code → search `main-product` |
| 11 | You have **≥500 mobile sessions/day on your top 10 PDPs** | Below 500 sessions/day the CVR delta is too noisy to attribute (a 0.2-pt swing could be noise) | Triple Whale → Pages → Top PDPs → filter by device = Mobile → sum last-30d sessions ÷ 30 ≥ 500 |
| 12 | You have a **launch window of 14 days** with no major sale, no new product drop, no ad-creative refresh | Mobile CVR is sensitive to traffic mix; a 14-day window with constant paid + organic traffic is the minimum for a clean A/B | Calendar check: no Black Friday / Memorial Day / Valentine's / Mother's Day / Father's Day / BFCM / product launch in the next 30 days |

**If any prerequisite fails:** stop and fix it before starting Step 1. Without Triple Whale (or Polar), you can't measure whether the redesign worked — and "we shipped the redesign but CVR didn't change" is the worst possible outcome (operator spends 2 weeks of dev time with no measurable result). Without 500 sessions/day, the CVR delta is noise.

## Step-by-step

Seven steps. Steps 1–2 take ~3–5 days (theme switch + image pipeline). Steps 3–7 take ~5–10 days (PDP layout + verification). The whole playbook is shippable in 1–2 weeks of focused dev time.

### Step 1 — Baseline + theme decision (Day 1)

**For Path A (theme switch):** If your current theme is from 2022 or earlier OR your PageSpeed mobile score is < 50, switch first. Recommended themes in priority order:

1. **Dawn** (Shopify's free default, 2024+) — free, fast, well-maintained, supports Online Store 2.0 sections. Default pick for most stores.
2. **Sense** (Outbound, $350 one-time) — fastest paid theme for Shopify in 2025/2026; LCP scores typically 15–25% better than Dawn. Worth the $350 if your GMV is >$1M.
3. **Turbo** (Outbound, $350 one-time) — alternative to Sense; emphasizes speed + Porto-style sections. Pick if you prefer more layout flexibility than Sense.
4. **Prestige** (Maestrooo, $350) — premium look but slower than Sense; only worth it if design is a brand priority over speed.
5. **Symmetry** (We are Underground, $180) — mid-tier; pick if Sense/Turbo layouts don't match your brand.

**For Path B (keep your theme):** skip the theme switch; go straight to Step 2 (image pipeline) and Step 3 (PDP layout). Your theme is fast enough; the PDP layout is the bottleneck.

**Verification gate for Step 1:** Run PageSpeed Insights on your top-10 PDPs (`https://pagespeed.web.dev/`) → record mobile scores in a spreadsheet → confirm baseline is captured (Date, URL, mobile score, LCP, INP, CLS, mobile CVR).

### Step 2 — Image optimization pipeline (Days 2–4)

The single biggest LCP win is **image size + format**. Most stores serve 2–5 MB hero images that compress to 100–300 KB with no visible quality loss.

**Image pipeline rules (apply to ALL product images, hero banners, lifestyle photos):**

1. **Format:** convert to **AVIF** first (best compression, 2026 browser support is universal except IE11), **WebP** fallback (covers older Safari/Chrome), original JPEG as final fallback. Shopify's built-in image pipeline handles this automatically via `image_url | image_url: width: 800, format: 'avif'` Liquid filter — use it.
2. **Max dimension:** never serve a product image larger than **2000×2000px** to a phone. Shopify's `image_url` filter with `width: 800` or `width: 1200` is sufficient for a 390px-wide phone screen (2× retina = 780 actual pixels needed). The full-size image is reserved for the desktop zoom modal.
3. **Compression target:** **≤ 200 KB per image** for hero/gallery, **≤ 100 KB** for thumbnails/secondary images. Tools: ShortPixel, TinyIMG, ImageOptim (Mac), Squoosh (web).
4. **Lazy-load everything below the fold:** all gallery images past the first 2 should have `loading="lazy"` + `decoding="async"`. Shopify's default `image_tag` adds `loading="lazy"` automatically — verify on your theme.
5. **Hero image priority:** the LCP element is typically the first product image. Add `fetchpriority="high"` to the first `<img>` tag in `main-product.liquid` (this is a Shopify 2.0–era feature; older themes need a manual `<link rel="preload" as="image" href="...">` in `theme.liquid` `<head>`).
6. **CDN:** Shopify serves images from `cdn.shopify.com` by default (Cloudflare-backed, global CDN). No additional CDN needed unless you're on a custom domain or BigCommerce.

**Verification gate for Step 2:** PageSpeed Insights → "Largest Contentful Paint element" should now be the first product image (or a small hero banner), and the image's actual served size should be ≤ 200 KB. Use the "Network" tab in Chrome DevTools to confirm.

### Step 3 — Above-the-fold redesign: gallery + ATC + price (Days 5–7)

Above the fold on mobile is the **390 × 600px viewport** (iPhone 14 Pro class). Every pixel above the fold counts.

**Above-the-fold layout (top-to-bottom, mobile only):**

```
┌─────────────────────────────────┐
│  [☰ Menu]   [Logo]    [🛒 Cart] │ ← sticky topbar (height: 56px)
├─────────────────────────────────┤
│                                 │
│   [Product Gallery: 1/5]       │ ← swipeable, 1 image visible, 16:9 ratio
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    Hero Product Image   │   │
│   │      (LCP element)      │   │
│   │                         │   │
│   └─────────────────────────┘   │
│   • ○ ○ ○ ○                    │ ← gallery dots (5 images)
├─────────────────────────────────┤
│  Brand Name                     │ ← 12px, gray
│  Product Title                  │ ← 18px, bold
│  ★★★★☆ (234 reviews)            │ ← 14px
│  $75.00  $90.00 (was)           │ ← 20px, red strikethrough if on sale
├─────────────────────────────────┤
│  Color: Black ▾                 │ ← variant selector, 14px
│  Size: [S] [M] [L] [XL]         │ ← pill buttons, 14px
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │     ADD TO CART             ││ ← 48px height, full-width, brand color
│  └─────────────────────────────┘│
│                                 │
│  🔒 Secure checkout · Free ship │ ← 12px, gray, trust signal
│  over $50                       │
└─────────────────────────────────┘
```

**Key above-the-fold rules:**

1. **Gallery is 1 image visible at a time** with swipe (not a carousel of 3 thumbnails) — saves vertical space, lets the hero image breathe, and 73% of mobile sessions swipe at least once.
2. **ATC button is ALWAYS visible** — not below the fold, not behind a "select options" tap. If the product has variants, the default variant is pre-selected; the ATC fires immediately.
3. **Variant selector is compact** (color swatch + size pills, NOT a dropdown) — dropdowns add a tap and a dropdown-render step; pills are 1-tap.
4. **Trust signals below the ATC** (secure checkout, free shipping threshold) — NOT above. The ATC is the conversion goal; everything else is supporting.
5. **NO popup modals on PDP load** — "Sign up for 10% off" email capture should appear at 30% scroll depth or on exit-intent, never on page load. Exit-intent popups kill mobile CVR by 5–15%.

**Verification gate for Step 3:** Use Chrome DevTools mobile emulation (iPhone 14 Pro, 390×844 viewport) → load the PDP → confirm the ATC button is visible without scrolling. Record a screen recording for the journal.

### Step 4 — Sticky ATC bar on scroll (Day 8)

The sticky ATC bar appears once the user scrolls **past the original ATC button** (typically ~500px down) and stays pinned to the bottom of the viewport. It's the single highest-leverage PDP element for mobile CVR (+5–12% in most A/B tests).

**Sticky ATC bar layout:**

```
┌─────────────────────────────────┐
│ $75.00   [   ADD TO CART   ]   │ ← 56px height, white bg, top shadow
└─────────────────────────────────┘
```

**Implementation rules:**

1. **Triggers on scroll past original ATC** — uses an `IntersectionObserver` to watch the original ATC button; when it leaves the viewport (intersection ratio = 0), the sticky bar slides up from the bottom (CSS `transform: translateY(100%)` → `translateY(0)` with a 200ms transition).
2. **Hides on scroll down, shows on scroll up** — saves screen real estate when the user is reading; reveals when they're ready to buy. Use `IntersectionObserver` on a sentinel element + scroll direction tracking.
3. **Hides when the original ATC is back in view** — never two ATC buttons visible at once.
4. **Hides when the user reaches the actual bottom of the page** (footer, sticky CTA blocks the "Buy" footer section).
5. **Disappears on the "Added to cart" success state** — once the cart drawer opens, the sticky bar's job is done.

**Verification gate for Step 4:** Load PDP on mobile emulation → scroll down → sticky bar appears at ~500px → scroll up → bar reappears after 100ms → scroll to footer → bar disappears → tap ATC → cart drawer opens → bar disappears.

### Step 5 — Below-the-fold redesign: description + reviews + cross-sell (Days 9–11)

Below the fold is where the user reads, compares, and decides. Layout rules:

1. **Description as accordion** (NOT a long inline block) — default closed except for the first paragraph (the hook). Saves vertical space; users tap to expand if interested. Industry standard is 4 accordions: "Description", "Ingredients / Materials", "Shipping & Returns", "How to use".
2. **Reviews block (Yotpo / Loox / Junip)** — 12px rating summary + first 2 reviews inline + "See all 234 reviews" button that opens a modal. **Inline reviews lift mobile CVR 10–20%** [Yotpo].
3. **Cross-sell / "Frequently bought together"** — ReBuy / AfterSell / Bold Upsell native widgets; show 2–3 items max (not 4+); 1-click add to cart from the cross-sell card.
4. **Size guide / fit guide** (apparel only) — collapsible; appears between "Description" and "Reviews" for apparel/footwear verticals.
5. **Trust badges** (free shipping, returns, money-back) — inline icons below the reviews block, NOT as a separate hero section.

**Verification gate for Step 5:** Load PDP → confirm accordions default-closed except first paragraph → reviews block renders → tap "See all 234 reviews" → modal opens → cross-sell block renders 2–3 items → tap cross-sell item's "Add" → cart updates.

### Step 6 — Speed optimization: CSS, JS, fonts (Days 11–13)

Beyond images (Step 2), the other LCP/INP/CLS culprits are CSS, JS, and font loading.

**CSS optimization:**

1. **Inline critical CSS** for above-the-fold (the gallery + ATC + price block). Use a tool like criticalCSS.com or PageSpeed's "Eliminate render-blocking resources" suggestion to identify the critical rules.
2. **Defer non-critical CSS** — `media="print" onload="this.media='all'"` pattern or `<link rel="preload" as="style">`.
3. **Remove unused CSS** — Shopify theme CSS files often have 50–70% unused rules. Tools: PurgeCSS, UnusedCSS.

**JS optimization:**

1. **Defer all third-party scripts** below the fold: Klaviyo onsite messaging, Yotpo reviews widget, Gorgias chat widget, Hotjar/Clarity, Meta Pixel, Google Tag Manager. Load them with `defer` or after the `DOMContentLoaded` event.
2. **Self-host Meta Pixel + Google Tag** — the third-party CDN scripts are 100–300 KB and slow. Self-host via `gtag.js` from your own CDN.
3. **Lazy-load Yotpo / ReBuy / Gorgias** via `IntersectionObserver` — only mount when the user scrolls near the reviews block.

**Font optimization:**

1. **Use `font-display: swap`** on all `@font-face` rules — never let text invisible while waiting for a webfont (FOIT).
2. **Self-host your fonts** (Shopify 2.0 themes support `theme.liquid` `<head>` font `@font-face` rules). Third-party font CDNs (Google Fonts) add 100–200ms of latency.
3. **Subset your fonts** to only the characters you use (Shopify's default fonts include Latin Extended, Cyrillic, Vietnamese — most stores only need Latin).

**Verification gate for Step 6:** PageSpeed Insights → LCP < 2.5s on all top-10 PDPs → CLS < 0.1 → INP < 200ms. The PageSpeed score should be 90+ mobile for all 10 PDPs.

### Step 7 — Verification + measurement (Day 14)

The 7-gate verification sequence below. ALL must be GREEN before declaring the redesign "shipped" in the journal.

See the **Verification** section below for the full 7-gate sequence (gates A–G).

## Metrics to track

The mobile PDP redesign touches every conversion metric you already track. Add a "Pre-redesign baseline" column so the delta is visible at a glance.

| Metric | Source | Target band (post-redesign) | How to slice |
|---|---|---|---|
| **PageSpeed mobile score (top 10 PDPs)** | PageSpeed Insights (`pagespeed.web.dev`) | ≥ 90 (was typical 50–70 baseline) | Per-PDP URL |
| **LCP (75th percentile, mobile)** | Search Console CrUX or PageSpeed field data | < 2.5s (was typical 3.5–5.0s baseline) | All PDPs aggregated |
| **INP (75th percentile, mobile)** | Search Console CrUX or PageSpeed field data | < 200ms (was typical 300–500ms baseline) | All PDPs aggregated |
| **CLS (75th percentile, mobile)** | Search Console CrUX or PageSpeed field data | < 0.1 (was typical 0.15–0.30 baseline) | All PDPs aggregated |
| **Mobile CVR** | Triple Whale → Reports → Devices → Mobile CVR | +30–60% relative (1.8% → 2.5–3.0%) | All mobile sessions, last 14 days |
| **Desktop CVR** | Triple Whale → Reports → Devices → Desktop CVR | Neutral to +5% relative (mobile-first design shouldn't regress desktop) | All desktop sessions, last 14 days |
| **Mobile add-to-cart rate** | Triple Whale → Funnel → product_view → add_to_cart (Mobile only) | +15–30% relative (8% → 10–12%) | Mobile sessions, last 14 days |
| **Mobile revenue per visitor (RPV)** | Triple Whale → Devices → Mobile RPV | +10–25% relative | Mobile sessions, last 14 days |
| **Mobile bounce rate (PDP)** | Triple Whale → Pages → PDP bounce rate, Mobile filter | -10–20% relative (40% → 32–36%) | Mobile sessions on PDPs |
| **Mobile avg session duration (PDP)** | Triple Whale → Pages → PDP avg time, Mobile filter | +10–20% relative | Mobile sessions on PDPs |
| **Gallery swipe rate** | Hotjar / Clarity recordings (manual review of 20 sessions) | ≥ 60% of mobile sessions swipe past image 1 | Sample of 20 mobile recordings |
| **Sticky ATC tap rate** | Triple Whale event tag `sticky_atc_tap` (custom) | ≥ 10% of mobile sessions tap sticky ATC | Mobile sessions on PDPs |
| **ATC button visibility time** | PageSpeed Insights `lcp-element` field | LCP element = gallery image OR ATC button (not text below) | Per-PDP |
| **PDP load time (75th percentile, mobile)** | PageSpeed Insights field data | < 3.0s (was typical 4.5–7.0s baseline) | All PDPs aggregated |
| **% traffic on fast 4G or better** | Triple Whale → Devices → Connection type | Operator baseline; should NOT change with redesign | All mobile sessions |

## Common pitfalls

Every mobile PDP redesign hits one of these. The fix is on the dev/operator side, not the customer side.

1. **Hero image is 4 MB.** A 4000×4000px JPEG at quality 100, served without resizing, kills LCP. **Fix:** Step 2's pipeline rules — ≤ 200 KB per image, AVIF/WebP, max 2000×2000px, lazy-load below fold.
2. **Web font FOIT (Flash of Invisible Text).** `@font-face` with default `font-display: block` makes text invisible for 1–3 seconds while the font loads. **Fix:** `font-display: swap` on every `@font-face` rule.
3. **Third-party scripts block the main thread.** Klaviyo onsite messaging + Yotpo + Gorgias + Meta Pixel + GTM = 5 scripts competing for the main thread on page load. **Fix:** Step 6's defer + lazy-mount rules. Move all third-party scripts to `defer` or `IntersectionObserver` mounts.
4. **Sticky ATC blocks the bottom 56px of content permanently.** User scrolls to read the description's last paragraph, can't see it because the sticky bar is covering it. **Fix:** `padding-bottom: 56px` on the body when the sticky bar is visible (so the last 56px of content is reachable by scrolling).
5. **Sticky ATC shows on scroll-up but never hides on scroll-down.** The user is reading → bar slides up → covers content → user has to wait 1 second for it to time out → reads → bar slides up again. **Fix:** the scroll-direction tracking in Step 4 (show on scroll-up, hide on scroll-down).
6. **Description accordion too aggressive (everything default-closed).** User wants to know the product specs, taps 4 accordions in sequence, feels the friction, leaves. **Fix:** first paragraph of "Description" is always visible inline; only the rest is in an accordion. Or: open "Description" by default, close the others.
7. **Variant selector is a dropdown.** On mobile, a dropdown requires 2 taps (open + select) vs 1 tap for a pill button. **Fix:** pill buttons for size, color swatches for color. No dropdowns for variants with ≤ 8 options.
8. **Reviews widget loads 800 KB of JS** (Yotpo / Loox / Junip default). **Fix:** lazy-mount the reviews widget via `IntersectionObserver` (load only when the user scrolls within 200px of the reviews block). Same for cross-sell widgets (ReBuy / AfterSell).
9. **No `fetchpriority="high"` on the LCP image.** Browser doesn't know which image to load first; loads them in DOM order; the hero is image #5 in DOM order, so the user sees a blank rectangle for 2 seconds while the smaller thumbnails load first. **Fix:** `fetchpriority="high"` on the first product image `<img>` tag.
10. **Theme switch from custom to Dawn loses brand styling.** Brand colors, typography, custom sections, all gone. **Fix:** before switching themes, audit the current theme for brand-critical customizations (custom sections, Klaviyo form embeds, loyalty widget placements). Rebuild them in Dawn or pick Sense/Turbo (which has more design fidelity to typical custom themes).
11. **Measuring CVR delta in the wrong window.** You ship the redesign on day 7, measure mobile CVR on day 8, see a +25% lift, declare victory. **Reality:** day 8 is Sunday, day 7 was Saturday — weekend traffic mix is different. **Fix:** measure over a 14-day window post-launch, comparing to a 14-day window pre-launch. Same day-of-week mix.
12. **Theme switch reorders product images.** Migrating from a custom theme to Dawn sometimes scrambles the image order in `product.images[]` (the "Additional media" alt-text gets duplicated, or the order changes). **Fix:** before switching themes, export your product image order as a CSV. After the switch, re-verify the top-20 PDPs visually.
13. **Cumulative Layout Shift (CLS) from late-loading fonts.** Web font swaps in mid-render and shifts all the text by 2–4px downward → CLS spike → PageSpeed score drops. **Fix:** `font-display: optional` instead of `swap` for non-critical fonts; reserve font width with `size-adjust` + ` ascent-override` in `@font-face` declarations.
14. **Sticky ATC color clashes with the brand color.** The sticky bar's CTA is `#FF6B35` (orange) but the brand color is `#1A1A2E` (deep navy). The bar looks like an ad, not a CTA. **Fix:** match the sticky bar's CTA color to the original ATC button's color exactly. Use the brand's primary CTA color, not a generic "buy now" red.
15. **No backup plan if mobile CVR drops.** The redesign ships, mobile CVR drops 10%, and the dev team has to revert in 24 hours to stop the bleeding. **Fix:** ALWAYS keep the old theme + PDP layout accessible via a `theme.liquid` Git branch. Use Shopify's theme duplicate feature (Settings → Themes → Duplicate) so you can re-publish the old theme in 60 seconds.

## Verification

End-to-end verification runs as a 7-gate sequence. All 7 should be GREEN before declaring the redesign "shipped" in the journal.

### Gate A — PageSpeed Insights mobile score ≥ 90

- Run PageSpeed Insights (`https://pagespeed.web.dev/`) on each of your top-10 PDPs.
- Record: URL, mobile score, LCP, INP, CLS, total blocking time.
- **Pass:** all 10 PDPs score ≥ 90 mobile AND LCP < 2.5s AND CLS < 0.1.
- **Fail mode:** one PDP at 78 — typically a single oversized image or an un-deferred script. Fix and re-run.

### Gate B — Search Console CrUX field data (28-day window)

- Search Console → Experience → Core Web Vitals → Mobile row.
- Wait 28 days post-launch for field data to refresh (CrUX data is a 28-day rolling window).
- **Pass:** 75th percentile of mobile users experience LCP < 2.5s, INP < 200ms, CLS < 0.1 on PDP URLs.
- **Note:** this gate cannot be checked in the first 14 days post-launch. It's the "true" success gate.

### Gate C — Sticky ATC functional test

- Load PDP on Chrome DevTools mobile emulation (iPhone 14 Pro).
- Scroll down past the original ATC → sticky bar appears.
- Scroll up → bar reappears (after scroll-up detection).
- Scroll all the way to footer → bar disappears.
- Tap sticky ATC → cart drawer opens.
- **Pass:** all 4 sub-checks pass.

### Gate D — Above-the-fold ATC visibility

- Load PDP on iPhone SE (smallest common viewport, 375×667) and iPhone 14 Pro Max (largest common viewport, 430×932).
- Without scrolling, can you see the ATC button + price + variant selector?
- **Pass:** ATC is visible on both viewport sizes without scrolling.

### Gate E — Mobile CVR delta ≥ +20% relative (14-day post-launch)

- Triple Whale → Reports → Devices → Mobile CVR last 14 days.
- Compare to baseline mobile CVR from the 14 days pre-redesign.
- **Pass:** mobile CVR has lifted by ≥ 20% relative (e.g. 1.8% → 2.16%+).
- **Fail mode:** mobile CVR is flat or down — re-read Pitfalls #4, #5, #6, #11. Most common cause is the sticky ATC covering too much content (Pitfall #4).

### Gate F — Desktop CVR NOT regressed

- Triple Whale → Reports → Devices → Desktop CVR last 14 days.
- Compare to baseline desktop CVR from the 14 days pre-redesign.
- **Pass:** desktop CVR is within ±5% of baseline (a slight lift is fine; >5% drop is a regression).
- **Fail mode:** desktop CVR drops 10% — typically the mobile-first design forced some compromise (e.g. smaller gallery thumbnails on desktop). Fix the desktop-specific layout via media queries.

### Gate G — Gallery swipe + reviews block render

- Load PDP on mobile emulation.
- Swipe gallery left → next image loads within 500ms.
- Swipe 3 more times → all 5 images load.
- Scroll to reviews block → first 2 reviews render inline + "See all" button.
- Tap "See all" → reviews modal opens.
- **Pass:** all 4 sub-checks pass.

## Cost & ROI estimate

Default case: Shopify brand at $1M–$5M GMV, 10k mobile sessions/month, 1.8% mobile CVR baseline, $75 AOV, 70% margin. Mobile PDP redesign closes half the mobile/desktop CVR gap.

| Cost line | One-time | Monthly | Notes |
|---|---|---|---|
| Theme switch (Path A — Sense theme) | $350 | $0 | Outbound Sense theme, $350 one-time; or $0 if using Dawn (free) |
| Image optimization tool (ShortPixel / TinyIMG) | $0 | $0–$50 | Free tier handles ≤100 images/mo; $4.99–$49.99/mo for unlimited |
| Dev time (in-house or contractor) | $0–$5,000 | $0 | 1–2 weeks of dev time; in-house is $0 incremental, contractor is $50–$100/hr × 60–80 hrs |
| Cloudflare Pro (image CDN + speed) | $0 | $0–$20 | Optional; Cloudflare free tier covers most needs; Pro adds image resizing + Polish |
| Triple Whale Starter (Move #6 — already in budget) | $0 | $0 incremental | Reuse for measurement |
| **Total one-time** | **$350–$5,000** | | Theme + image tool + dev time |
| **Total monthly** | | **$0–$70** | Image CDN + optional Cloudflare Pro |

| Revenue line | Monthly incremental | Notes |
|---|---|---|
| Mobile CVR lift (1.8% → 2.5%) | +0.7 pts × 10k mobile sessions × $75 AOV × 70% margin = **+$3,675/mo** | 38.9% relative lift in mobile CVR |
| Mobile RPV lift (cascade) | +10–25% on mobile revenue; for a $1M–$5M GMV store at ~50% mobile traffic share, this is ~$5k–$15k/mo incremental | Mobile RPV cascades: more ATCs → more checkouts → more revenue per visitor |
| Desktop CVR neutrality (preserved) | $0 incremental (preserved, not lifted) | Gate F ensures no regression |
| **Total monthly incremental (steady-state)** | **+$5,000–$15,000/mo** | After the 14-day post-launch measurement window |

| Net ROI | |
|---|---|
| **Net monthly ROI (Path B — keep theme, dev in-house)** | **+$5,000–$15,000/mo** against $0 incremental monthly cost = pure margin lift |
| **Net monthly ROI (Path A — Sense theme + dev in-house)** | **+$5,000–$15,000/mo** against $0 incremental monthly cost (Sense is one-time) |
| **Net annual ROI** | **$60,000–$180,000/yr** |
| **Ratio** | **$5k/mo revenue lift / $0 incremental monthly cost = effectively infinite ratio for Path B**; **Path A with $5k dev cost = 12–36:1 net lift per $1 spent in month 1, then infinite from month 2 onward** |
| **Payback period** | **2–6 weeks from launch** (the 14-day measurement window + a few days of optimization) |

> **Honest read.** Mobile PDP redesign is the second-largest CRO lever available (after checkout overhaul — Move #3) and is **risk-on-risk-off**: a well-executed redesign lifts mobile CVR 30–60%; a poorly-executed redesign (sticky bar covering content, accordion too aggressive, font shift CLS spike) drops mobile CVR 10–20%. The 7-gate verification gate is the safety net — if Gate E (mobile CVR delta) is <+10% at 14 days post-launch, do NOT keep the redesign live; revert per Pitfall #15. The 14-day measurement window is the minimum; some stores need 28 days for statistical significance (especially those with <500 sessions/day, per Prerequisite #11).

## Next moves after this PDP redesign is live

1. **Move #9.5 — Always-on PDP A/B testing program.** Run 1–2 PDP A/B tests per month (hero image variants, ATC copy, sticky bar color, accordion default state, reviews placement). Tools: Convert.com, VWO, Shoplift. Cumulative 5–15% YoY CVR improvement compounds on top of this tick's lift.
2. **Move #10 — AI ad creative iteration.** Mobile PDP conversion is now 30–60% better — the new traffic will convert at the new rate. Triple Whale's "creative → PDP view → ATC" funnel shows which ad creatives drive the highest ATC rate; feed those creatives to AdCreative.ai / Moby / Smartwriter for 10× creative output. Typical 10–30% ROAS lift from AI-generated ad variants.
3. **PDP personalization (Rebuy / Nosto / Searchspring).** Returning customers see "You might also like" + recently viewed; new customers see "Best sellers" + reviews. A 10–25% CVR lift on top of the redesign's lift is typical. Defer until the redesign's lift is fully measured (Gate E + Gate F complete) so the deltas don't conflate.
4. **PDP speed dashboard.** Build a `dashboards/pdp-speed-monitor.html` static dashboard that polls PageSpeed Insights + Search Console CrUX daily and plots LCP/INP/CLS over time. Companion to the existing `dashboards/` (currently empty) — single static HTML, Chart.js, inline JS, no build step. Shape: 4 line charts (LCP, INP, CLS, mobile CVR) with target-band lines. Ship after the redesign's measurement window has 30+ days of data.
5. **Mobile checkout alignment.** Now that the PDP is mobile-first, audit the checkout (Move #3) for mobile-specific friction. If checkout is the next leak in the funnel (likely — checkout completion on mobile is typically 30–40% vs cart, vs 50–65% on desktop), apply the same mobile-first treatment.
6. **VIP-tier exclusive products on PDP.** Once you have 200+ VIP members (from Move #8 loyalty), show a "VIP exclusive color/SKU" badge on the PDP for loyalty members. VIP-tier exclusive products typically convert at 30–50% of the VIP cohort in the first 48 hours.

## Related

- **Move #3 — Checkout audit + Baymard fix-list.** Checkout overhaul is the #1 CRO lever; mobile PDP is #2. Apply Move #3 first if your checkout completion rate is <50%.
- **Move #6 — Install Triple Whale Starter.** Measurement is the success criterion for this move. Without Move #6 you can't tell whether the redesign worked.
- **Move #8 — Loyalty program.** Loyalty members browse 2.3× more PDPs than non-members (Smile verified); mobile-first PDP is the highest-traffic surface for the loyalty cohort. Add a loyalty-points-on-PDP block (Step 5 follow-up).
- **Move #1 / Move #4 / Move #7 — Flows.** Welcome series, abandoned cart, SMS flows all link to PDPs. Mobile-first PDP lifts CVR for the traffic those flows drive.
- **`research/00-ecommerce-ops-landscape.md` §4 — Conversion Rate Optimization (CRO).** Findings 25–33 are the source data for this playbook (LCP impact, Baymard checkout research, mobile/desktop gap, reviews, free-shipping threshold, etc.).
- **`research/01-tools-stack-comparison.md`.** Tool picks for PageSpeed Insights (free), CrUX (Search Console free), Yotpo / Loox / Junip (reviews), Rebuy / AfterSell (cross-sell), ReConvert (post-purchase).
