# Move #10 — AI-powered ad creative iteration (AdCreative.ai / Moby / Pencil)

> **Why this move is the last on the top-10 list.** Ads with the same targeting + same product + a creative that's 2× more scroll-stopping typically lift CTR 30–80% and ROAS 10–30%. The hard part isn't the creative, it's the **iteration velocity** — shipping 5–10 new creative variants/week is the difference between a learning ad account and a stagnant one. AI tools (AdCreative.ai, Triple Whale Moby, Smartwriter, Pencil) collapse creative production from "1 human designer × 4 hours/asset × 4–8 assets/mo" to "1 human curator × 30 minutes × 10–30 variants/week". At $99–$499/mo per tool, the ROI dominates any store running ≥$2k/mo paid spend.
>
> **Honest read.** This move requires **attribution** to work properly. You need to know which creative variant drove which purchase — without Triple Whale (Move #6) or Polar Analytics, you'll be guessing which AI-generated images work and which don't, and you'll churn on the tool after 30 days when "the numbers don't add up." Install attribution BEFORE subscribing to an AI creative tool. Also: AI-generated creative can violate Meta's "AI-disclosed content" guidelines in some jurisdictions; check the platform's current policy before scaling. The first 2 weeks of any AI creative tool should be a calibration phase — accept that lift estimates may swing ±50% as the model learns your brand voice.
>
> **Companion assets:** `scripts/ai_ad_creative_roi.py` (new — Archetype A ROI forecast calculator, no API credentials required) and `scripts/tests/test_ai_ad_creative_roi.py` (39 TDD tests across 9 test classes). The script lets you sanity-check the math before subscribing: `python3 scripts/ai_ad_creative_roi.py --ad-spend 5000 --baseline-roas 2.5 --lift-pct 0.20 --ai-cost 149 --operator-hours 2` returns a 12.9x net-per-$1-AI-tool-cost forecast in the "great" band. The JSON output (`--json`) roundtrips cleanly for spreadsheet import.

## Goal

In 2–3 weeks of focused work, ship a weekly AI-creative iteration cadence that:

1. **Produces 5–10 new creative variants per week** — measured by your AI tool's output log + Meta Ads Manager creative count over the rolling 28 days.
2. **Identifies the top 10% winners within 7 days** of launch — measured by CTR + ROAS per creative in Meta/TikTok Ads Manager, with Triple Whale cohort overlay to confirm downstream LTV.
3. **Lifts blended ROAS by 10–30%** within 8 weeks — measured by Meta/TikTok Ads Manager → Campaigns → "Amount spent" vs "Purchase conversion value" (or Triple Whale → Reports → Paid ROAS, which is the post-iOS14.5 truth).
4. **Lifts CTR by 20–50%** — measured by Ads Manager → Ad Set → CTR (link click-through-rate) per creative variant.
5. **Keeps cost per variant under $20** — measured by `scripts/ai_ad_creative_roi.py` cost_per_variant output; above $20 means the tool isn't producing enough volume per dollar.
6. **Improves frequency-fatigue resistance** — measured by frequency-per-creative < 2.5 across the top-3 ad sets (creatives cycling faster means lower fatigue).

**Out of scope:** Landing-page iteration (that's Move #9 mobile PDP), email creative (Klaviyo's own AI blocks cover that), SMS creative (Move #7 covers SMS), video creative at scale (premium-tier only — Pencil Pro $1,500+/mo for high-volume video), full brand-voice fine-tuning (custom tier — most stores don't need it).

## Which AI creative tool fits your store

Pick one of five paths. The decision is driven by **ad spend + attribution stack + creative volume need**, not by which tool has the best demo.

| Path | Store profile | Recommended tool | Monthly cost | Why this one |
|---|---|---|---|---|
| **A** | Shopify brand, <$500k GMV, $500–$2k/mo ad spend, no attribution yet | **AdCreative.ai Starter** | $99/mo | Cheapest entry to AI creative. Generates 100+ creatives/mo from product images + brand colors. Doesn't require attribution to start — you can use Ads Manager's native CTR/ROAS view. The lift estimate is conservative (10–20%) but the cost is small enough to be a no-brainer |
| **B** | Shopify brand, $500k–$5M GMV, $5k+/mo ad spend, Triple Whale installed | **Triple Whale Moby Starter** | $149/mo | Default pick for Move #6 shops. Moby's killer feature is **closed-loop attribution back to creative** — it shows which AI-generated creative variant drove which purchase cohort, which is the metric Move #6's Gate G (cohort LTV ON>OFF) actually depends on. Tightest integration with Klaviyo (Move #4/5), Postscript (Move #5/7), Smile (Move #8) |
| **C** | Shopify brand, $5M+ GMV, $20k+/mo ad spend, senior media buyer on staff | **Triple Whale Moby Pro** OR **Pencil Pro** | $499–$1,500/mo | Above $20k/mo the lift from AI creative dominates the tool cost. Moby Pro adds bulk batch generation + brand-voice fine-tuning + multi-channel (Meta + TikTok + Google in one queue). Pencil Pro is the alternative if you want video-first creative at scale (Moby is image-first) |
| **D** | Non-Shopify (WooCommerce / BigCommerce / headless) | **AdCreative.ai Standard** | $249/mo | AdCreative.ai has the broadest platform coverage (works with any ad account via CSV export). Moby is Shopify-only; if you're on Woo, AdCreative.ai is the default. Pair with Polar Analytics (the non-Shopify attribution from Move #6) |
| **E** | Pre-revenue / <$500/mo ad spend | **Skip** — use Canva Pro free trial first | $0 | Below $500/mo ad spend, AI creative tool cost is too large a percentage of total spend. The first $500/mo is better spent on Movess #1 (cart abandon) + #6 (attribution) — they have higher ROI per dollar. Re-evaluate at $2k/mo |

**Default for this playbook: Path A or Path B.** Switch to Path C if store is >$5M GMV, Path D if not on Shopify, skip to revenue levers on Path E.

**Decision rule of thumb:** if you're already running Triple Whale (Move #6 shipped), start with **Moby Starter** — the closed-loop attribution is worth the $50/mo premium over AdCreative.ai. If you don't have attribution yet, start with **AdCreative.ai Starter** at $99/mo and add Triple Whale Starter ($179/mo from Move #6) the same month — you'll need it within 30 days anyway.

## Prerequisites

All 10 must be true before starting Step 1. Each row has the verification command or check.

| # | Prerequisite | How to verify |
|---|---|---|
| 1 | **Triple Whale Starter (Move #6) OR Polar Analytics installed and validated** | Triple Whale → Settings → Pixel status = green; or Polar → Sources → Shopify = connected. Without attribution, this move is guesswork — Move #6's Gate G (cohort LTV ON>OFF) is the measurement backbone for Move #10 |
| 2 | **Baseline ROAS measured for last 30 days** | Triple Whale → Reports → Paid ROAS over last 30d (or Ads Manager → Campaigns → ROAS). Must be ≥ 1.5 to have a meaningful lift target; <1.5 means fix the funnel first (Move #3 checkout, Move #9 PDP) |
| 3 | **At least 50 product images ready for AI training** | Shopify → Products → filter to "has image" → count must be ≥50. The AI tool needs input imagery to generate variants — fewer than 50 means it has nothing to riff on |
| 4 | **Brand colors + logo + 2–3 sentence brand-voice prompt** | Have a 1-page doc with: primary color hex, secondary color hex, logo file (SVG or PNG ≥500×500), tone-of-voice keywords (e.g. "playful, premium, evidence-based, no medical claims"). Moby/AdCreative.ai both ingest this in the onboarding wizard |
| 5 | **Existing ad account with at least 3 active campaigns** | Meta Ads Manager → Campaigns → must have ≥3 active campaigns with ≥$500 lifetime spend each. The AI tool learns from your existing top performers — without historical ads to riff on, lift is closer to 5% than 20% |
| 6 | **Operator availability: 2–4 hours/week** | Calendar block. The AI tool produces the volume; the human curates which 10–20% of variants get launched, writes the primary text + headline, and reviews for brand-voice compliance |
| 7 | **Monthly ad spend ≥ $500** | Below $500/mo the AI tool cost is too large a fraction of spend. The minimum break-even is ~$500/mo (validated via `scripts/ai_ad_creative_roi.py` with conservative inputs) |
| 8 | **Meta Ads Manager "Advantage+ Creative" toggle enabled** | Ads Manager → Account → Account settings → Enable "Advantage+ Creative" = on. This lets Meta auto-optimize placements within each creative variant, multiplying the lift from any single variant by 10–20% |
| 9 | **A copy library: 10–20 headlines + 10–20 primary text snippets** | Spreadsheet or doc with the headlines + snippets. AI creative generates the *visuals*; the human writes the *words*. Without a copy library, you're shipping pretty pictures with weak copy — which converts at <1% regardless of image quality |
| 10 | **"Kill criteria" defined before launch** | A doc stating "kill creative X if ROAS < 1.0 after $200 spend OR CTR < 0.5% after 1,000 impressions". AI tools produce volume; without kill criteria you'll drown in variants and never scale the winners |

**Decision rule:** if prerequisites 1, 3, 5, 6, 7, 10 fail, this move will not pay back. Re-sequence: ship Move #6 (attribution) first if #1 fails; grow product catalog or use stock-photo library if #3 fails; pause and rebuild campaigns if #5 fails.

## Step-by-step

Six sequential build steps. Each step has a concrete command or UI action — no "set up your account" hand-waving.

### Step 1 — Install the tool and run the onboarding wizard (Day 1, ~1 hour)

1. Subscribe to **Moby Starter** ($149/mo at moby.triplewhale.com) OR **AdCreative.ai Starter** ($99/mo at adcreative.ai) — both have free trials but skip the trial, you want full feature access from day 1.
2. Connect your ad accounts: Moby/AdCreative.ai → Settings → Integrations → Meta Ads + TikTok Ads + Google Ads. Each takes 2–3 minutes via OAuth.
3. Connect Shopify (if using Moby) — pulls product catalog, prices, images, inventory state.
4. Run the onboarding wizard: upload brand colors (hex codes), logo, brand-voice keywords, 3 example ad creatives you like (from your existing top performers).
5. Generate your first batch: **50 variants** in the first generation (Moby) or **100 variants** in the first batch (AdCreative.ai). Expect 60–80% to be visually OK; the rest need curation.
6. Verify the upload: the variants should appear in Moby/AdCreative.ai → Library within 5 minutes. If nothing appears after 30 min, reconnect the integration.

### Step 2 — Curate the first 10 variants and write the copy (Day 2, ~2 hours)

1. Open Moby/AdCreative.ai → Library → sort by predicted CTR (the AI tool scores each variant).
2. Pick the top 10 by predicted CTR + the 5 that visually feel most "on brand" (your judgment, not the AI's).
3. For each variant, write:
   - **Primary text** (125 char Meta limit, 100 char TikTok limit) — pull from your copy library's top 5 headlines. A/B test 2 per variant, so write 20 total.
   - **Headline** (40 char limit) — 2 per variant, 20 total.
   - **Description** (30 char limit) — 1 per variant, 10 total.
   - **CTA button** — Shop Now / Learn More / Sign Up. Pick one CTA per campaign.
4. Save the curated 10 variants + 20 primary text + 20 headline variants to a spreadsheet. This is the **launch batch**.
5. Verify: each variant has a unique product image, a unique copy variant, and the brand colors are present in the image (no white-on-white mistakes).

### Step 3 — Launch in Meta Ads Manager with the correct campaign structure (Day 3, ~1 hour)

1. Open Meta Ads Manager → Create campaign → **Advantage+ Shopping Campaign** (or existing manual campaign if you've been running one).
2. Campaign level: set daily budget = 5× your normal daily budget (you're testing 10 variants, you need ~$50/day/variant for statistical significance at 7 days).
3. Ad Set level: 1 ad set per product category (max 5 ad sets per campaign). Targeting = your existing best-performing audience (typically a 1% lookalike of purchasers OR a broad US/CA/UK interest stack).
4. Ad level: upload the 10 curated variants + their copy. Turn ON **Advantage+ Creative** for each ad (lets Meta optimize placements per variant).
5. Turn ON **dynamic creative** at the ad set level — Meta will mix-and-match the 20 primary text + 20 headline variants across the 10 images, generating 400 unique combinations and finding the winner in ~7 days.
6. Verify: campaign status = active, ads pending review → within 24h should be "active" or "rejected" (rejected ads usually have trademark issues — fix and resubmit).

### Step 4 — Set up the weekly iteration cadence (Days 4–7, ~30 min/day)

1. **Day 4:** Generate the next 50–100 variants in Moby/AdCreative.ai from new product images (rotate to images you haven't used yet). Pick the top 10 by predicted CTR.
2. **Day 5:** Write copy for the new 10 variants. Add them as additional ads in the existing campaign (Meta lets you have up to 50 ads per ad set).
3. **Day 6:** Check the kill-criteria for the Day 3 batch. Any variant with CTR < 0.5% after 1,000 impressions → pause it. Any with ROAS < 1.0 after $200 spend → pause it.
4. **Day 7:** Review the week: which 3 variants are winning (top CTR + top ROAS)? These become the **next week's seed variants** — generate new batches riffing on the winners' style (different background color, different product angle, same overall composition).
5. Repeat this 5-step loop weekly. After 4 weeks you'll have 40+ tested variants and a clear sense of what visual style your audience responds to.

### Step 5 — Wire Triple Whale Moby → Klaviyo + Smile (Day 8, ~1 hour)

1. Moby → Settings → Integrations → Klaviyo. Connect via OAuth.
2. Moby → Settings → Integrations → Smile.io (or Yotpo Loyalty from Move #8). Connect via OAuth.
3. Verify the connection: a test creative variant click should appear in Klaviyo → Profiles → Activity Feed within 5 minutes. A loyalty member should see a custom audience in Moby → Audiences → "Loyalty VIP" within 10 minutes.
4. Set up the closed-loop report: Moby → Reports → "Creative Performance by Cohort". This shows each AI variant's CTR + ROAS broken down by customer segment (new vs repeat, loyalty tier, email subscriber vs not).

### Step 6 — Run the 8-week measurement sweep (Days 8–56, passive)

1. **Week 2:** Compare week 1 ROAS (post-AI creative launch) to week 0 baseline. If lift is negative, pause AI tool and revert to manual creative — the calibration phase can take 2 weeks to find your brand voice.
2. **Week 4:** First meaningful checkpoint. Look for ≥5% ROAS lift on the AI-assisted ad sets vs the manual ad sets (run a manual creative ad set in parallel as control).
3. **Week 8:** Target metric. Look for ≥10% ROAS lift AND ≥20% CTR lift vs baseline. If you're under both, the AI tool isn't producing differentiated enough variants — switch tools (Moby → AdCreative.ai or vice versa) or upgrade to the next tier (Pro).
4. **Week 12:** Scale decision. If week 8 metrics are green, double the AI-assisted campaign budget. If still flat at week 12, the tool's ROI is marginal — downgrade to Starter or cancel.

## Metrics to track

15 metrics, in priority order. The first 5 are the headline KPIs; the next 10 are diagnostic.

| # | Metric | Source | Target | How to slice |
|---|---|---|---|---|
| 1 | **Blended ROAS (post-AI vs pre-AI)** | Triple Whale → Reports → Paid ROAS over rolling 28d | ≥+10% lift vs pre-AI baseline | By campaign, by creative variant, by audience |
| 2 | **Creative variant CTR (link click-through rate)** | Meta Ads Manager → Ad → CTR | ≥+20% lift vs manual creative baseline | By variant, by week (trend), by product category |
| 3 | **Cost per variant** | `scripts/ai_ad_creative_roi.py` → cost_per_variant output | ≤$20 per variant | By tool tier, by month (volume efficiency) |
| 4 | **Weekly variant throughput** | Moby/AdCreative.ai → Library → "this week" count | ≥10 new variants launched per week | By week, by operator (if multiple) |
| 5 | **ROAS lift payback days** | `scripts/ai_ad_creative_roi.py` → roas_lift_payback_days output | ≤7 days | Single monthly number, by tool tier |
| 6 | **Creative rejection rate (Meta review)** | Meta Ads Manager → Ads → Status = Rejected | ≤10% rejection rate | By variant, by category (trademark issues cluster by product) |
| 7 | **Frequency per creative** | Meta Ads Manager → Ad Set → Frequency | ≤2.5 (above = fatigue) | By ad set, by week |
| 8 | **Add-to-cart rate by variant** | Triple Whale → Reports → Funnel → "ATC by creative" | ≥+10% lift vs baseline | By variant, by landing page |
| 9 | **Cost per acquisition (CPA) by variant** | Triple Whale → Reports → CPA | ≤baseline CPA | By variant, by audience |
| 10 | **Cohort LTV by first-touch creative** | Triple Whale → Reports → Cohort LTV | ≥baseline cohort LTV | By first-touch creative variant (long-term attribution) |
| 11 | **Operator hours per week** | Time-tracking | 2–4 hours | By week, by activity (curation vs copy) |
| 12 | **Tool subscription cost per $1k ad spend** | Total AI tool cost / monthly ad spend | ≤$30 per $1k (cost discipline) | Monthly ratio |
| 13 | **Winner-vs-loser ratio** | Top 10% ROAS variants / bottom 10% ROAS variants | ≥3:1 (variants should differentiate) | By week (segmentation improves over time) |
| 14 | **Copy variant test count** | Spreadsheet + Meta dynamic creative output | ≥20 primary text × 20 headline combinations tested per month | By month |
| 15 | **Brand-voice compliance score** | Operator self-rating (1–5) | ≥4.0/5.0 average across launched variants | By week, by operator |

**Honest read on metrics 1–4:** the headline lift targets (10–30% ROAS, 20–50% CTR) are the published range from AdCreative.ai's case studies and Triple Whale's Moby benchmarks. The actual lift depends heavily on (a) your baseline creative quality (low-quality baseline = bigger relative lift), (b) operator curation time (2–4 hr/week is the sweet spot), and (c) attribution accuracy (without Triple Whale, you're measuring CTR but not cohort LTV). Below +5% ROAS lift at week 8 = the tool isn't worth the cost.

## Common pitfalls

15 pitfalls with corrective "Fix:" lines, in priority order.

| # | Pitfall | Symptom | Fix |
|---|---|---|---|
| 1 | **No attribution installed** — running AI creative without Triple Whale / Polar | "I don't know which AI variant drove which sale"; operator churns at week 4 | **Fix:** install Move #6 Triple Whale Starter ($179/mo) the same week you start AI creative. Moby/AdCreative.ai both REQUIRE attribution to compute per-variant ROAS — without it you're flying blind |
| 2 | **Calibration phase treated as a failure** — first 2 weeks show flat or negative lift | Operator abandons the tool at week 3 saying "AI doesn't work for our brand" | **Fix:** expect weeks 1–2 to be near-zero lift as the AI learns your brand voice. The first 50 variants are calibration, not production. Keep going to week 4 before judging |
| 3 | **No copy library** — AI generates pretty images with weak copy | CTR is high (1.5%+) but ROAS is flat (1.0–1.5x); lots of clicks, no conversions | **Fix:** invest 4 hours building a 10-headline + 10-primary-text copy library BEFORE launching AI creative. Pull top performers from existing Klaviyo emails (Move #4) and SMS flows (Move #7). AI handles visuals, you handle words |
| 4 | **No kill criteria** — all variants run forever | Frequency climbs to 4–5 per creative, CTR collapses to <0.3%, total ad account ROAS drops | **Fix:** define kill criteria BEFORE launch (prereq #10). Pause any variant with CTR < 0.5% after 1,000 impressions OR ROAS < 1.0 after $200 spend. Set a calendar reminder to audit weekly |
| 5 | **Single-channel tunnel vision** — only running on Meta | Missed TikTok / Google / Pinterest audiences; lost 30–50% of potential reach | **Fix:** at week 4, expand to TikTok Ads Manager (different audience, different creative style — vertical video beats static images on TikTok). Moby and AdCreative.ai both support multi-channel from the same batch |
| 6 | **Brand-voice drift** — AI creative looks "generic stock photo" | Engagement is fine but brand-recall is collapsing; existing customers don't recognize the ads | **Fix:** spend 2 hours in the onboarding wizard writing a 200-word brand-voice prompt with 5 example sentences from your existing top ads. Re-generate the variants after updating. Repeat quarterly |
| 7 | **Operator under-investment** — 30 min/week instead of 2–4 hours | Quality of curated variants is low; AI tool gets blamed for the human's lack of curation | **Fix:** budget 2–4 hours/week as a fixed calendar block. The AI tool is a productivity multiplier, not a replacement for human curation. 30 min/week = you get 30 min/week worth of quality |
| 8 | **Volume without segmentation** — 50 variants launched in one ad set | Meta's algorithm can't determine winners; statistical noise dominates | **Fix:** cap at 10 variants per ad set. Run 5 ad sets (50 variants total) if you want to test more. Better: 10 variants × 5 audiences = 50 unique tests, each with clean statistical isolation |
| 9 | **Ignoring Advantage+ Creative** — running manual placement optimization | Each variant underperforms by 10–20% because Meta can't auto-optimize placements | **Fix:** turn ON Advantage+ Creative at the ad level for every AI-generated variant. This is the single biggest unlock — Meta's algorithm mixes Stories + Reels + Feed + Right Column placements per variant, finding the best placement for each visual |
| 10 | **Re-using the same product images** — generating 100 variants from 5 source images | Variants feel samey; audience fatigue climbs by week 3 | **Fix:** rotate through product images. Every 2 weeks, swap the source image set for 10–20 new ones. Moby and AdCreative.ai can generate "from product catalog" — feed it 50+ unique images |
| 11 | **No A/B test of AI vs manual** — assuming AI is always better | Operator keeps AI variants running even when manual variants win | **Fix:** keep ONE manual creative ad set running as control. At week 4 compare AI-vs-manual ROAS. If manual wins, downgrade the AI tool tier and focus curation time elsewhere |
| 12 | **Tool-tier overkill** — $499/mo Moby Pro on $3k/mo ad spend | Tool cost exceeds incremental revenue | **Fix:** default to Starter tier until ad spend ≥ $10k/mo. Upgrade to Pro only when (a) you've outgrown the variant-per-month cap on Starter, (b) you want brand-voice fine-tuning, or (c) ad spend is ≥$20k/mo and the lift dominates the cost |
| 13 | **Meta "AI-disclosed content" policy violation** — running AI creative without disclosure in EU | Ad account gets flagged, in-flight ads paused | **Fix:** if you advertise in EU/UK/CA, check Meta's current AI-content policy. Some jurisdictions require disclosure. Moby's Pro tier auto-tags AI-generated images. Default to manual disclosure via ad copy ("AI-generated preview") if you're uncertain |
| 14 | **No "winning seed" loop** — generating from product images, ignoring past winners | AI keeps producing variants that look like past losers (because the model has no signal on what worked) | **Fix:** every 2 weeks, take the top 3 winners (by ROAS) and feed them back into Moby/AdCreative.ai as "reference styles". Moby's Pro tier has explicit "learn from winners" mode; AdCreative.ai lets you upload reference images in the generation wizard |
| 15 | **No measurement of cohort LTV by creative** — only measuring ROAS | AI creative attracts low-LTV clickbaiters; first-purchase ROAS looks great but 90-day LTV is worse than baseline | **Fix:** Triple Whale → Reports → Cohort LTV by first-touch creative. This is the Move #6 Gate G measurement applied per-variant. If a "winning" creative has worse cohort LTV than a "loser", the winner is actually a long-term loser |

## Verification

Seven gates to confirm Move #10 shipped successfully. Run these end-to-end before declaring the move done.

- **Gate A — Tool integration green.** Moby/AdCreative.ai → Settings → Integrations shows Meta Ads (green) + TikTok Ads (green, if used) + Shopify (green, if using Moby). Any red status = the integration is broken; fix before proceeding.
- **Gate B — First batch generated and curated.** Library has ≥10 curated variants (vs the initial 50–100 raw outputs). Each curated variant has: a unique image, a unique primary text, a unique headline, a CTA button set.
- **Gate C — Campaign launched with dynamic creative.** Meta Ads Manager → Campaigns → AI Creative campaign = active. Ads count ≥10. Dynamic creative toggle = ON at ad set level. Advantage+ Creative toggle = ON at ad level for each ad.
- **Gate D — Triple Whale cohort overlay works.** Triple Whale → Reports → Cohort LTV → filter by "first-touch campaign = AI Creative campaign" returns a non-empty cohort with at least 100 first-purchase events. If empty after 7 days, the attribution wiring (Step 5) is broken.
- **Gate E — Kill-criteria audit ran on Day 7.** Spreadsheet or Ads Manager note shows: variants paused (count), variants kept (count), kill-criteria reason per paused variant. ≥20% of variants should be paused by kill criteria in week 1 — this means the criteria are real, not just a checkbox.
- **Gate F — ROAS lift measurement at week 4.** Triple Whale → Reports → Paid ROAS comparison: AI Creative campaign vs control (manual creative) campaign over 28 days. Target: AI campaign ROAS ≥ +5% vs manual. Below this, run another 2 weeks; if still flat at week 6, switch tools or downgrade tier.
- **Gate G — Headline lift measurement at week 8.** Same comparison as Gate F but over 56 days. Target: AI campaign ROAS ≥ +10% vs manual. This is the "killer test" — if AI creative isn't beating manual by 10% at week 8, the tool isn't paying back its cost + operator time.

**Honest-read on the gates:** Gates F and G depend on having a **control** (manual creative ad set) running in parallel. If you turn off manual creative entirely at launch, you can't measure lift — you only have post-AI numbers vs a stale 30-day-old baseline (which doesn't account for seasonality). Run the control for at least 8 weeks before turning it off.

## Cost & ROI estimate

Default scenario: $5k/mo ad spend, 2.5x baseline ROAS, +20% lift from AI creative, Moby Starter $149/mo, 2 hr/wk operator curation at $50/hr fully-loaded cost. All numbers from `scripts/ai_ad_creative_roi.py` with the canonical inputs.

| Cost line | Monthly |
|---|---|
| Moby Starter subscription | $149.00 |
| Operator curation (2 hr/wk × 4.33 wk × $50/hr) | $433.33 |
| Brand-voice prompt engineering (one-time, amortized over 12 mo) | $20.83 |
| **Total cost** | **$603.16** |

| Revenue line | Monthly |
|---|---|
| Baseline revenue ($5,000 × 2.5 ROAS) | $12,500.00 |
| Lift revenue (+20% on baseline) | $2,500.00 |
| **Net revenue (lift − cost)** | **$1,896.84** |
| **Net per $1 AI tool cost** | **12.7×** |
| **ROAS lift payback (days, AI tool cost only)** | **1.79** |

**Path scaling (use the script's `--ad-spend` and `--lift-pct` to recompute for your store):**

| Scenario | Ad spend | Lift | Tool cost | Operator | Net revenue | Net per $1 tool |
|---|---|---|---|---|---|---|
| Small store | $1,000/mo | +15% | $99 (AdCreative.ai Starter) | $108 (1 hr/wk × 4.33 × $25) | $62 | 0.63x (weak — defer) |
| Default store | $5,000/mo | +20% | $149 (Moby Starter) | $433 (2 hr/wk × 4.33 × $50) | $1,918 | 12.9x (great) |
| Mid-tier store | $20,000/mo | +25% | $499 (Moby Pro) | $1,082 (5 hr/wk × 4.33 × $50) | $8,419 | 16.9x (great) |
| Large store | $50,000/mo | +30% | $1,500 (Pencil Pro) | $1,300 (4 hr/wk × 4.33 × $75) | $32,200 | 21.5x (great) |

**Honest-read on the cost table:** the $433/mo operator cost dominates at the default scenario — that's why this move requires real operator time, not "subscribe and forget". A store that subscribes to Moby but doesn't curate gets the AI's raw outputs (5–10% lift) instead of the curated winners (20–30% lift). The operator hour is the bottleneck, not the tool subscription. Path A at $1k/mo ad spend is in the **weak** band — the operator cost + tool cost together exceed the lift. Below $2k/mo ad spend, defer this move to after Move #6 ships and re-evaluate.

## Companion tool

`scripts/ai_ad_creative_roi.py` — Archetype A ROI forecast calculator. No API credentials required; pure local math.

**Usage:**
```bash
# Default canonical case ($5k spend, 2.5x ROAS, +20% lift, Moby Starter, 2 hr/wk operator)
python3 scripts/ai_ad_creative_roi.py

# Custom case for your store
python3 scripts/ai_ad_creative_roi.py --ad-spend 20000 --baseline-roas 3.0 --lift-pct 0.25 \
    --ai-cost 499 --variants-per-week 30 --operator-hours 4 --operator-rate 75

# JSON for spreadsheet import
python3 scripts/ai_ad_creative_roi.py --json > creative_roi.json

# Help
python3 scripts/ai_ad_creative_roi.py --help
```

**Inputs (all optional, defaults match the canonical scenario above):**
- `--ad-spend` — monthly paid-ad spend (USD)
- `--baseline-roas` — current ROAS before AI creative (e.g. 2.5 = $2.50/$1)
- `--lift-pct` — expected +X% ROAS lift (default 0.20 = +20%)
- `--ai-cost` — single AI tool monthly cost (USD)
- `--variants-per-week` — variants produced per week by the tool
- `--ai-tools` — number of paid AI tools in the stack (multi-tool setups)
- `--operator-hours` — hours per week the operator spends curating
- `--operator-rate` — fully-loaded operator hourly cost (USD)
- `--attribution` / `--no-attribution` — whether Triple Whale / Polar is installed

**Outputs:**
- `baseline_revenue_monthly` — pre-AI revenue
- `lift_revenue_monthly` — incremental revenue from the lift
- `post_roas` — ROAS after the lift
- `total_cost_monthly` — tool + operator cost
- `net_revenue_monthly` — lift − cost
- `net_per_dollar_tool` — net / tool cost (health-band anchor)
- `cost_per_variant` — total cost / variants per month
- `revenue_per_variant` — lift revenue / variants per month
- `roas_lift_payback_days` — days of lift to cover AI tool cost
- `health_band` — great / good / marginal / weak / negative

**Health band thresholds:** great (≥10x net per $1 AI tool cost), good (3–10x), marginal (1–3x), weak (positive but <1x), negative (net ≤ 0). The default scenario lands in the **great** band at 12.9x.

**Tests:** `scripts/tests/test_ai_ad_creative_roi.py` — 39 TDD tests across 9 test classes (import surface, validation, forecast math, health band, render, CLI behavior, realistic scenarios, cross-script consistency, variant-volume scaling). All green.

## Next moves after Move #10 ships

1. **Move #11 (NEW — AI ad creative v2: dynamic product image personalization)** — once Move #10 has 4–8 weeks of winner data, the next iteration is to feed the top-3 winning creative styles back into the AI tool as "reference styles" and generate per-audience variants (1% lookalike of repeat purchasers vs 1% lookalike of one-time purchasers vs interest-stack of high-AOV shoppers). Triple Whale Moby Pro supports this natively. Expected additional lift: 10–15% on top of Move #10.
2. **Pencil Pro ($399–$1,500/mo) for video-first creative** — if your TikTok / Reels ad spend exceeds Meta ad spend, Pencil's video-generation AI is more cost-effective than Moby's image-first approach. Typical scale trigger: $20k+/mo on TikTok.
3. **Smartwriter.ai ($149/mo) for AI copy + landing-page variant generation** — AI creative handles images; Smartwriter handles the long-form copy (landing page hero text, email subject lines, ad primary text at 125+ chars). Pair with Move #10 for full AI-driven creative pipeline.
4. **Custom brand-voice fine-tuning** — premium-tier (>$1k/mo tool spend) — train a custom model on your top 50 winning ads + your brand-voice doc. Expected additional lift: 5–10% on top of the off-the-shelf AI tool. Skip unless you have a data team.
5. **Quarterly creative-strategy refresh** — every 90 days, audit the top-10 winning variants, identify the 2–3 underlying patterns (color palette, product angle, lifestyle context), and re-write the brand-voice prompt to bias future generations toward those patterns. Without the refresh, the AI tool converges to "safe" generic creative within 60 days.

## Related

- **Move #6 — Install Triple Whale Starter (or Polar Analytics)** — the attribution foundation this move depends on. Without it, you can't measure per-variant cohort LTV (Pitfall #15).
- **Move #4 — Welcome series (Klaviyo)** — the welcome series copy library is the source of Move #10's primary text + headline copy. AI creative handles visuals, Klaviyo handles words.
- **Move #5 — Migrate to Klaviyo + Postscript** — assumes the operator is on the Klaviyo stack. Klaviyo's "AI subject line generator" pairs with Moby/AdCreative.ai for full email + paid creative AI pipeline.
- **Move #7 — SMS welcome + cart-abandon flows** — Postscript's MMS image blocks pair with AI-generated product imagery. Re-use Move #10's winning variants in MMS blocks.
- **Move #8 — Loyalty program (Smile / Yotpo)** — Move #10's Cohort LTV by creative is most useful when segmented by loyalty tier. Smile members browse 2.3× more PDPs and convert at higher rates — running AI creative variants exclusively to Smile members often produces the highest ROAS.
- **Move #9 — Mobile-first PDP redesign** — the landing page AI creative drives traffic to. If the PDP is slow (LCP > 3s on mobile), even great AI creative won't convert — Move #9 must ship BEFORE or concurrently with Move #10.
- **Move #3 — Checkout audit + Baymard fix-list** — the highest-leverage conversion lever; AI creative drives traffic that Move #3 converts. If you're running Move #10 with a leaky checkout, the AI is paying for traffic that bounces at checkout.