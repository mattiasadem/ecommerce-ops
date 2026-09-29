---
name: virtual-try-on-and-fit-recommendation-engine
title: Virtual try-on & fit recommendation engine
category: virtual-try-on
tier: 1
priority: P1
default_move: 41
year_1_roi_band: "5:1–15:1"
sms_friendly: false
last_updated: 2026-09-29
sources: [vue.ai 2024, true-fit 2024, fit-analytics 2024, snap-ar-try-on 2024, wanna-by-snap 2024, revery.ai 2024, orbo 2024, sizebay 2024, bold-metrics 2024, 3dlook 2024, metail 2024, zmo.ai 2024, reactive-reality 2024, tripp 2024, sizing-engine 2024, fitiquette 2024, my-true-fit 2024, easy-size 2024, kiip-fit 2024, clotheshorse 2024, baymard-fit 2024, apparel-news-fit 2024, retail-dive-fit 2024, shopify-fit 2024, klaviyo-fit 2024, triple-whale-fit 2024, nosto-fit 2024, returnly-fit 2024, loop-fit 2024, narvar-fit 2024, happyreturns-fit 2024]
---

# Virtual try-on & fit recommendation engine

> Apparel DTC's #1 cost center is returns (30–40% of apparel orders return; 60–70% of those returns are fit-related). A virtual try-on widget + fit recommendation quiz cuts returns 20–35% and lifts CVR 5–15% at 5:1–15:1 year-1 ROI. Ship Vue.ai or True Fit + Shopify PDP widget in 1–2 weeks. Move #41.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce / headless) apparel / footwear / accessories store
- ≥50 SKUs in a size-dependent category (tops / bottoms / dresses / shoes / bras / jewelry)
- A returns rate ≥20% OR visible "size uncertainty" in cart-abandon survey data
- At least 500 PDP sessions / month (below this, you don't have enough signal to train a fit engine)

You do NOT have:
- A "What size am I?" quiz on the PDP (most apparel DTC ships just a static size chart)
- A virtual try-on widget (no camera-based AR / avatar overlay / size-prediction on the PDP)
- A returns-attribution loop (you don't know which returns are fit-related vs preference-related)
- A size-confidence indicator at the variant-pill level ("Most customers your height/weight pick M")

## What "best in class" looks like

Reference: Allbirds (True Fit + custom fit quiz), Warby Parker (AR try-on for glasses, 5:1 reduction in returns), Stitch Fix (proprietary fit model + Style Shuffle), ThirdLove (fit quiz + half-cup sizing), Nike (Nike Fit AR scanner), Adidas (Adidas Confirmed AR try-on), Burberry (AR try-on for select SKUs), Levi's (Levi's "Find Your Fit" + size predictor), ASOS (Style Match + Fit Assistant), Net-a-Porter (virtual fitting room).

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Fit recommendation quiz | 6-8 questions (height / weight / age / fit preference / brand-usually-worn / measurements / chest-waist-hip / shoulder / inseam) | 2-3 questions (height / weight / brand) | 6-8 questions + adaptive follow-up + brand fit history |
| Size-prediction model | ML model on 100k+ historical orders per category (chest-waist-hip → size-distribution → per-SKU size-pick) | Lookup-table (height/weight → size) | Per-SKU per-category ML model with 90%+ top-1 accuracy |
| Confidence indicator | "92% of customers your height/weight pick M" with explanation | None | Per-SKU fit confidence + "if between sizes, size up/down" hint |
| Virtual try-on | AR overlay on user's photo (camera-based, real-time rendering) | Static "see it on a model" gallery | AR + photo + body-shape-matched model rendering + sharing-to-Instagram |
| Returns attribution | Returns form captures "fit" reason with size-purchased vs size-recommended delta | No fit attribution | "Fit-bias-by-SKU" dashboard with auto-flag for SKUs where >30% of returns are fit-related |
| PDP integration | "Find my size" button + AR try-on button + size-pill with confidence indicator | Static size chart below ATC | Quiz button in variant selector + AR button in gallery + confidence badge on every variant |
| Cart abandonment prevention | If size-unselected, modal asks "Need help finding your size?" | None | Pre-ATC modal + cart-page quiz prompt + cart-abandon email with size-recap |
| Email follow-up | Post-purchase email at day 14: "How did the fit work out?" + collects fit-feedback | No follow-up | Klaviyo flow gated on size-recommended that asks for fit-feedback + loops into model retraining |
| Fit-feedback loop | Returns → fit-reason → per-SKU fit-bias-detection → auto-adjust quiz weights | None | Returns + reviews + post-purchase fit-feedback all in one model retraining pipeline |
| Tool choice | True Fit Path B DEFAULT ($1M-$10M GMV) / Vue.ai Path A DEFAULT (<$1M GMV) / Bold Metrics Path A+ (self-serve <$500k GMV) / Nike Fit / Wanna by Snap for AR-only (no fit model) | None | Custom-build per-SKU ML model + AR overlay on top |

## Virtual try-on & fit recommendation benchmarks (2024–25)

| Setup | Returns-rate reduction | CVR lift | Net revenue / $1 platform cost |
|---|---|---|---|
| Static size chart only | 0% | 0% | — |
| Lookup-table quiz (height/weight → size) | -5% to -10% returns | +2% to +5% CVR | 3:1–6:1 |
| ML fit model (per-SKU) | -15% to -25% returns | +5% to +10% CVR | 6:1–12:1 |
| ML fit model + AR try-on widget | -20% to -35% returns | +10% to +18% CVR | 8:1–15:1 |
| Full fit-feedback loop (returns → model retraining) | -25% to -40% returns | +12% to +22% CVR | 10:1–20:1 |

**Median apparel DTC pays $1.5k-$3k/mo in return-shipping + restocking per $1M GMV. A best-in-class fit engine recovers $300-$900/mo per $1M GMV in saved return costs alone, before the +5-15% CVR lift on the PDP.** Per True Fit's 2024 network report, fit-related returns dropped 23% in the first 90 days for brands that activated per-SKU fit recommendations, and Vue.ai's 2024 benchmarks show +14% add-to-cart rate + -19% return rate on PDPs with a fit-quiz + AR widget.

## The build (1-2 weeks for a competent operator)

### Step 1 — Tool choice

| Tool | Price | Pros | Cons |
|---|---|---|---|
| **Vue.ai** | $500-$2k/mo (Path A DEFAULT <$1M GMV) | Shopify-native, fit-quiz + size-prediction + AR overlay, dashboard with per-SKU fit-bias | $2k/mo at scale |
| **True Fit** | $1k-$5k/mo (Path B DEFAULT $1M-$10M GMV) | Largest fit-data network (50M+ consumers), per-SKU size-prediction, 90%+ top-1 accuracy at scale | Enterprise pricing |
| **Fit Analytics (Snap)** | Free-$500/mo (Path A+ <$500k GMV) | Powered by Snap data, snap-ar try-on bundled | Less accurate at niche categories |
| **Bold Metrics** | $300-$1.5k/mo (Path A+ DEFAULT self-serve) | Self-serve fit quiz + size recommendation, no AR | No AR overlay |
| **Wanna by Snap** | Free + Snap Ads integration | Best-in-class AR try-on for shoes/accessories | No fit quiz, no size-prediction |
| **Nike Fit (proprietary)** | Free (Nike only) | AR scanner, 13 data points per foot | Not available outside Nike |
| **3DLOOK / YourFit / Me-Ality** | $1k-$10k/mo (enterprise) | 3D body-scan + per-body-shape recommendation | High setup cost, requires in-store or mobile app |
| **Sizebay** | $300-$1k/mo (LATAM-focused) | Strong on Brazilian/Portuguese fit data | Limited US/EU brand recognition |
| **Revery.ai** | $500-$2k/mo | AI-generated model imagery + try-on photos | No size-prediction, just imagery |

**Default: Vue.ai Starter ($500/mo) for <$1M GMV, True Fit Network ($1k/mo) above $1M.** For pure AR try-on without fit-prediction: Wanna by Snap (free).

### Step 2 — Build the fit quiz

6-8 questions covering:
1. **Height** (4'10" to 6'6")
2. **Weight** (80-300 lbs, optional — only ask if needed for the model)
3. **Age range** (18-24 / 25-34 / 35-44 / 45-54 / 55+) — drives fit preference
4. **Brand you usually wear** (top-5 brands in the category) — enables cross-brand size lookup
5. **Fit preference** (Slim / Standard / Relaxed) — drives size-down / size-up recommendation
6. **For bottoms**: waist size + inseam
7. **For tops/bottoms**: chest/waist/hip measurements (optional, gives 95%+ accuracy)
8. **For shoes**: foot length + width (US 5-13)

Quiz appears as:
- **PDP**: "Find my size" button next to the size-pill selector (most common entry point)
- **Cart**: pre-ATC modal if size-unselected
- **Account onboarding**: first-login if first-purchase
- **Post-add-to-cart**: "Want to save your fit profile for next time?" (Klaviyo + customer-account)

### Step 3 — Wire the size-prediction model

Most tools (Vue.ai, True Fit, Bold Metrics, Fit Analytics) train a model on the brand's own historical orders:
- **Input**: customer height / weight / brand-usually-worn / fit-preference / measurements / chest-waist-hip
- **Output**: per-SKU size recommendation with confidence score (e.g. "M, 92% confidence; L, 7%; S, 1%")
- **Training data**: minimum 1,000 historical orders per SKU; minimum 100 customers with quiz responses

For SKUs without enough training data, the tool falls back to:
- Cross-brand lookup (if customer said "I wear M in Levi's", recommend M in similar-cut brand)
- Per-SKU size-chart lookup (height/weight → size)
- Manual override (operator can mark "this SKU runs small, size up")

### Step 4 — Add the AR try-on widget (optional)

For shoes / sunglasses / accessories, add a camera-based AR overlay:
- **Wanna by Snap**: free, integrates with Shopify, renders user's foot / face on the PDP
- **Snap AR Try-On**: free, requires Snap Kit SDK + product 3D model
- **Vue.ai AR**: bundled with Vue.ai subscription
- **Nike Fit**: only available to Nike

AR widget appears as "Try it on" button next to "Add to cart". User grants camera permission, sees the product rendered on their body / face / foot in real-time.

For tops/bottoms/dresses, AR is harder (full-body 3D scan required). Most operators skip AR for these categories and rely on the fit quiz alone.

### Step 5 — Add the returns attribution loop

Returns form captures:
- Order number
- Items being returned
- Reason (Too small / Too large / Poor fit / Changed mind / Defective / Other)
- If fit-related: what size was purchased vs what size should have been (free-text)

Wire to:
- **Klaviyo flow**: post-delivery day 14, ask "How did the fit work out?" — collect fit-feedback even for kept orders
- **Triple Whale cohort**: tag each order with `size_recommended: 'M' | 'L' | ...` and `size_purchased: 'M' | 'L' | ...`
- **Returns dashboard**: per-SKU fit-bias report — "this SKU has 38% fit-related returns, mostly 'too small' — recommend adjusting size quiz weights"

### Step 6 — Wire the cart-abandon prevention

When a customer adds a product to cart without selecting a size, show a modal: "Need help finding your size? Take our 60-second fit quiz." Quiz entry → size selection → cart update → ATC proceeds.

Cart-abandon email (Klaviyo flow from Move #1) includes:
- "Not sure about the size? Take our 60-second fit quiz" CTA
- Per-SKU size-recommendation if customer has prior quiz history
- "Returns are free within 30 days" trust signal

### Step 7 — Verify the build

- Take the quiz on the PDP → see a size-recommendation with confidence score within 5 seconds
- AR widget (if enabled) → camera permission prompt → product renders on user
- Cart without size → modal appears → quiz → size selected → ATC succeeds
- Place a test order with recommended size → mark as delivered → trigger fit-feedback email at day 14
- Return a test order with reason "Too small" → returns dashboard updates
- Per-SKU fit-bias report shows real data within 30 days of first 100 orders

## Common pitfalls (15 from real builds)

1. **Fit quiz too short (2-3 questions)** — model accuracy caps at 60-70% top-1 with insufficient input. Use 6-8 questions minimum; add measurements (chest/waist/hip) if the brand's audience is willing.
2. **Fit quiz too long (12+ questions)** — completion rate drops to <30%; abandoned quizzes = no size prediction. Cap at 8 questions; make measurements optional.
3. **No confidence indicator on size recommendation** — customer sees "M" but doesn't trust it. Show "92% of customers your height/weight pick M" + per-size breakdown.
4. **No "between sizes" hint** — for 50/50 size-distribution cases, customer doesn't know whether to size up or down. Add: "If you're between sizes, size up for a relaxed fit / size down for a slim fit."
5. **AR widget without proper lighting / camera permission UX** — customer denies camera, sees error, bounces. Add fallback: "Skip AR, see size chart" + "Try AR again" button. Also handle iOS Safari camera permission prompts.
6. **Returns form doesn't capture fit-bias data** — you get "Too small" but not "I'm usually M but your S fits like XS". Wire a free-text field for "what size should you have ordered?" — model retrains from this.
7. **No per-SKU fit-bias monitoring** — SKU-level return-rate doesn't surface in Triple Whale. Add a per-SKU dashboard showing `return_rate_pct`, `fit_related_return_rate_pct`, `size_bias_too_small_pct`.
8. **Fit model trained on too few orders** — 100 orders / SKU gives 50-60% accuracy; need 1,000+ orders / SKU for 85%+ accuracy. For new SKUs, fall back to cross-brand lookup.
9. **No Klaviyo post-purchase fit-feedback loop** — you only get returns data, which is biased (most returns = bad fit; non-returns = unknown). Add day-14 email asking "How did the fit work out?" — collects feedback from happy customers too.
10. **Cart-abandon email doesn't surface the fit quiz** — customer adds to cart but doesn't take the quiz → email doesn't help them find their size → they abandon. Add "Take the 60-sec fit quiz" CTA in the cart-abandon email.
11. **Quiz asks for weight but customer declines** — completion drops 20-30% when weight is asked. Make weight optional; fall back to brand-usually-worn + height.
12. **Returns shipping cost not addressed in returns policy** — customer sees free quiz + free returns; assumes "they'll pay if it doesn't fit". Make returns policy explicit: "Free returns within 30 days" + "Fit-related returns are free; preference returns deduct $X restocking fee".
13. **No size-confidence at variant pill level** — customer sees S/M/L pills but no indication "M is most popular for you". Add a confidence dot/badge on the recommended size.
14. **Cross-brand size assumption wrong** — customer says "I'm M in Levi's", brand recommends M in this brand, but this brand's M runs small. Cross-brand lookup is a fallback, not a primary signal. Use the brand's own historical data first.
15. **No A/B testing of quiz vs no-quiz** — operator doesn't know if the quiz is actually moving CVR. Run a 50/50 split: 50% of PDP visitors see "Find my size" button + quiz, 50% see static size chart. Measure CVR + return-rate per arm over 30 days.

## Verification (this skill is "shipped" when...)

- [ ] Vue.ai / True Fit / Bold Metrics installed with 6-8 question quiz + per-SKU size-prediction model trained on ≥1,000 historical orders per SKU
- [ ] "Find my size" button live on every PDP with size-pill selector
- [ ] Size-recommendation shows confidence score (e.g. "M, 92% confidence") + per-size breakdown
- [ ] AR widget live on shoes / sunglasses / accessories SKUs (if applicable)
- [ ] Cart modal triggers when size-unselected: "Need help finding your size?"
- [ ] Cart-abandon email (Move #1) includes "Take the 60-sec fit quiz" CTA
- [ ] Returns form captures "fit reason" + "what size should you have ordered?" free-text
- [ ] Klaviyo post-purchase day-14 fit-feedback email live + tags `fit_feedback_collected: true`
- [ ] Triple Whale cohort: every order tagged with `size_recommended` + `size_purchased` + delta
- [ ] Per-SKU fit-bias dashboard live (return_rate_pct, fit_related_return_rate_pct, size_bias)
- [ ] A/B test running: quiz vs no-quiz arm, 30-day measurement window
- [ ] 90 days post-launch: return-rate drops ≥10% (relative), PDP CVR lifts ≥5% (relative)

## How to extend this skill

- Add per-SKU fit-quiz weight overrides (operator adjusts quiz weights per SKU based on fit-bias data)
- Add 3D body-scan integration (3DLOOK / YourFit) for high-AOV categories (suits, dresses, formal wear)
- Add photo-based virtual try-on (customer uploads photo, AI renders product on body)
- Add AR try-on for full outfits (top + bottom + accessory bundle rendering)
- Add size-confidence API for Klaviyo product blocks (render "your size" badge in cart-abandon email)
- Add per-locale fit-data (Asian / European / US sizing differences; per-market fit-bias)
- Add subscription-box fit-recall (Move #11 subscriptions — store fit-profile so subscriber doesn't re-take quiz every order)
- Add plus-size / petite / tall-specific fit-models (separate training data per body-type cohort)

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1 — cart-abandon email surfaces the fit quiz CTA)
- Companion skill: `mobile-pdp-redesign` (Move #9 — fit-quiz button placement on mobile PDP, above-the-fold)
- Companion skill: `subscription-replenishment` (Move #11 — store customer fit-profile for auto-replenishment)
- Companion skill: `product-reviews-ugc-social-proof` (Move #30 — fit-reason mentioned in reviews feeds fit-bias model)
- Companion skill: `returns-portal-orchestration` (Move #28 — returns form captures fit-bias data; feeds into Triple Whale cohort)
- Companion research: `/research/00-ecommerce-ops-landscape.md` (returns-rate is the #1 cost driver in apparel DTC)
- Companion research: `/research/01-tools-stack-comparison.md` (Vue.ai vs True Fit vs Bold Metrics tool-decision matrix)

## Sources

- Vue.ai, "Fit recommendation benchmarks 2024"
- Vue.ai, "Returns reduction via fit AI 2024"
- True Fit, "Fashion fit network report 2024"
- True Fit, "Per-SKU size-prediction benchmarks 2024"
- Fit Analytics (Snap), "AR try-on conversion lift 2024"
- Bold Metrics, "Self-serve fit quiz benchmarks 2024"
- Wanna by Snap, "AR try-on for ecommerce 2024"
- 3DLOOK, "Body-scan fit recommendation 2024"
- Revery.ai, "AI-generated try-on imagery 2024"
- Baymard Institute, "Fit-related returns study 2024"
- Apparel News, "Returns rate in apparel DTC 2024"
- Retail Dive, "Virtual try-on adoption benchmarks 2024"
- Shopify, "Returns policy best practices 2024"
- Klaviyo, "Post-purchase fit-feedback flow 2024"
- Triple Whale, "Per-SKU returns-attribution 2024"
- Nosto, "Personalization + fit recommendation 2024"
- Returnly (Affirm), "Returns-data-for-merchandising 2024"
- Loop Returns, "Returns form fit-reason capture 2024"
- Narvar, "Returns attribution for fit 2024"
- Happy Returns, "Returns cost benchmarks 2024"
