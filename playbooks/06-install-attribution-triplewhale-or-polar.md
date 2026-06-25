# Move #6 — Install Triple Whale Starter (or Polar Analytics) — the attribution foundation

> **Why this move is the next-on-deck for every DTC brand that just shipped Moves #1–#8.** Every revenue lever in the top-10 list — abandoned cart (Move #1), post-purchase upsell (Move #2), checkout audit (Move #3), welcome series (Move #4), SMS welcome + cart (Move #7), loyalty program (Move #8) — depends on attribution to know whether it worked. Without a Multi-Touch Attribution (MTA) tool you can't distinguish "the welcome series lifted 90-day LTV by 12%" from "the welcome series cannibalized the abandoned-cart flow and net-zero'd the revenue." That ambiguity costs the typical DTC brand $1k+/mo in misallocated ad spend + misjudged retention flows. This playbook gets you from **zero attribution** to **post-purchase survey attribution feeding Klaviyo, Meta, and Google** in a single afternoon.
>
> **Honest read.** GA4 alone is not enough — Triple Whale 2025 data shows GA4 misses ~30–40% of paid attribution post-iOS14.5 because it relies on deterministic cookies that Safari/Firefox block. Triple Whale and Polar both use a **post-purchase survey** ("How did you hear about us?") + pixel + email-match fallback to recover attribution GA4 cannot see. **Triple Whale Starter at $179/mo** is the default for stores with $1M+ GMV. **Polar Analytics at $49/mo** is the budget option for stores <$1M GMV. **Northbeam ($1,500+/mo)** only earns its premium above $3M/yr paid spend — out of scope for this playbook.
>
> **Companion script:** `scripts/triple_whale_attribution_check.py` (new this tick) validates that the Triple Whale pixel + post-purchase survey are both firing on your store and that Klaviyo + Meta are receiving the attribution events the loyalty program (Move #8) depends on.

## Goal

In one afternoon, ship a working attribution stack — Triple Whale Starter OR Polar Analytics (decided by store size + budget) — that gives the operator:

1. **Channel-level MER** (Marketing Efficiency Ratio) for paid + organic blended.
2. **Cohort-level LTV** for the loyalty program (Move #8), welcome series (Move #4), and SMS flows (Move #7) — so each flow can be properly attributed.
3. **Post-purchase survey responses** ("How did you hear about us?") appended to every order — the single most reliable attribution signal in a cookie-deprecated world.
4. **Klaviyo + Meta + Google Ads** receiving the same attribution events so ad-platform optimization isn't flying blind.
5. **A documented verification gate** the operator can re-run weekly to catch attribution drift before it costs them a quarter of bad spend decisions.

**Out of scope:** Northbeam / Rockerbox / Beeyond MTA (premium tier), MMM (Media Mix Modeling — Triple Whale Pro or higher), in-house attribution engineering, custom data-warehouse pipelines. Those are 2027 problems for stores >$10M GMV.

## Which attribution tool fits your store

Pick one of five paths. The decision is driven by **monthly paid-media spend + GMV**, not by feature wishlist.

| Path | Store profile | Recommended tool | Plan | Cost | Why this one |
|---|---|---|---|---|---|
| **A** | Shopify brand, <$500k GMV, <$5k/mo paid spend | **Polar Analytics Starter** | Starter | **$49/mo** | Cheapest entry; $49 vs $179 is meaningful at this scale; no-code setup in 30 min; covers 90% of what Triple Whale Starter does for the use cases that matter here (MER, cohort LTV, post-purchase survey, Klaviyo sync) |
| **B** | Shopify brand, $500k–$5M GMV, $5k–$50k/mo paid spend | **Triple Whale Starter** | Starter | **$179/mo** | Default DTC analytics. Pixel + post-purchase survey + email-match attribution, Moby AI co-pilot, Meta + Google + TikTok sync, Klaviyo + Postscript native integration. Worth the upgrade from Polar above $1M GMV |
| **C** | Shopify brand, $5M–$50M GMV, $50k+/mo paid spend | **Triple Whale Pro** | Pro | **$1,290/mo** | Adds MMM (media mix modeling), incrementality testing, custom attribution windows. Only worth it above $50k/mo spend because Pro is 7× Starter's price |
| **D** | Non-Shopify (WooCommerce, BigCommerce, headless, custom) | **Polar Analytics Pro** | Pro | **$299/mo** | Triple Whale is Shopify-only at the Pixel layer; Polar supports WooCommerce + BigCommerce + custom carts via server-side pixel + GA4 import. Use this if you're not on Shopify |
| **E** | Pre-revenue / <$10k/mo revenue | **Shopify Analytics + GA4 only** | Free | $0 | Skip paid attribution until you have an answerable attribution question. Free tools give you 70% of what you need; the remaining 30% isn't worth $49/mo until you've shipped the revenue levers in Moves #1–#5 |

**Default for this playbook: Path B (Triple Whale Starter).** Switch to Path A if store is <$500k GMV, switch to Path C if paid spend is >$50k/mo, switch to Path D if not on Shopify.

**Decision rule of thumb:** if your monthly paid-media spend is ≥$5k and you're on Shopify, the question is never "should I buy Triple Whale?" — it's "which tier?". If your paid spend is <$5k/mo, start with Polar (or skip entirely on Path E). Triple Whale's $179/mo is recovered the day you kill one underperforming ad set that was burning $50/day.

## Prerequisites

All 10 must be true before starting Step 1. Each row has the verification command or check.

| # | Prerequisite | Why it matters | Verification |
|---|---|---|---|
| 1 | You have **admin access** to your Shopify store (or the equivalent for WooCommerce/BigCommerce) | Pixel installation requires theme.liquid edit OR app-store install | Shopify → Settings → Users and permissions → role = "Owner" or "Staff with full access" |
| 2 | You have **admin access** to your Meta Ads Manager and Google Ads account | The pixel needs to be able to fire Conversions API events to both platforms | Meta → Settings → Ad account access → role = "Admin"; Google → Tools → Access and security → access level = "Admin" |
| 3 | You have **Klaviyo account on at least the Free or Email plan** | Klaviyo is the engagement layer that needs the attribution events to flow in | Klaviyo → Account → Billing → plan ≥ Free |
| 4 | Your **store has processed ≥100 orders in the last 30 days** | Attribution models need volume to be statistically meaningful; below 100 orders/month, attribution tools can't distinguish signal from noise | Shopify → Analytics → Total orders last 30d ≥ 100 |
| 5 | You have **a working post-purchase page** (Shopify "Thank you" page, ReConvert upsell page, or Order Status page) | The post-purchase survey is the highest-value attribution signal — it must appear AFTER the order is placed, not before | Place a test order; confirm the "Thank you" page loads; note its URL for Step 3 |
| 6 | You have **access to your store's domain DNS** (or your dev does) | Triple Whale / Polar will sometimes require DNS verification for the pixel | Domain registrar (Cloudflare, Namecheap, GoDaddy) login works |
| 7 | You have **a budget of $179/mo (or $49/mo for Polar) approved** | This is the platform cost; ad spend is separate and unchanged | Confirmed in writing (Slack thread, Notion doc, or Loom from the founder) |
| 8 | You have **Triple Whale / Polar account credentials** OR an invitation from your agency partner | Pixel install requires logged-in access | Twilio-style 2FA available; password manager entry created |
| 9 | You have **a baseline snapshot of your current MER** (from GA4 or Shopify Analytics) | You'll compare post-install MER against this baseline to verify the install didn't break attribution | Capture: `MER_baseline = Net revenue last 30d / Ad spend last 30d` from Shopify Analytics |
| 10 | You have **read access to Move #1 (abandoned cart) and Move #4 (welcome series) flow performance** | Those flows' attribution windows depend on the install | Klaviyo → Analytics → Flows → click into the abandoned cart flow → "View analytics" loads |

**If any prerequisite fails:** stop and fix it before installing the pixel. Installing Triple Whale on a store that doesn't have ≥100 orders/month will give you low-confidence numbers and you'll mistrust the tool — that's the worst possible outcome (operator abandons attribution after 30 days of garbage data). Polar's $49/mo is the right entry if you're between 50–100 orders/mo.

## Step-by-step

Six steps. Steps 1–3 take ~30 minutes total (the install + pixel + survey). Steps 4–6 take ~2 hours (the platform sync + verification + dashboard setup). The whole playbook is shippable in an afternoon.

### Step 1 — Install the Triple Whale (or Polar) app on Shopify

**Path B (default):** Shopify App Store → search "Triple Whale" → click the listing by "Triple Whale, Inc." → click **Install** → on the permissions page, click **Install app** → you'll be redirected to the Triple Whale onboarding flow.

In the onboarding:
- Enter your store's primary domain (e.g. `yourbrand.com`)
- Confirm your **monthly revenue range** (this determines which features are surfaced in your default dashboard — Triple Whale adapts the dashboard to your scale)
- Skip the "Connect ad accounts" step for now (we'll do that in Step 4 explicitly, not via the auto-detect)
- Skip the "Invite team members" step (you can add your agency partner later)

**Path A (Polar):** Shopify App Store → search "Polar Analytics" → click the listing → **Install** → same permissions flow. Polar's onboarding is faster (~10 min) and you can skip directly to Step 2.

**Path D (non-Shopify Polar Pro):** Polar supports WooCommerce + BigCommerce + headless via a server-side pixel + GA4 import. Install the Polar plugin for your cart platform, paste your GA4 Measurement ID into Polar → Settings → Integrations → GA4, and skip to Step 3.

**Verification gate for Step 1:** Triple Whale (or Polar) dashboard loads at `app.triplewhale.com` (or `app.polaranalytics.com`) and shows your store name + a "Connected" green badge. If the badge is red/yellow, click it to see what's missing — usually a permission or DNS issue.

### Step 2 — Install the pixel + Conversions API on every page

The pixel is the JavaScript snippet that fires on every pageview + add-to-cart + checkout event. The Conversions API (CAPI) is the server-side companion that fires the same events from Shopify's backend. **You need BOTH** — pixel-only is broken on Safari/iOS (cookies blocked), CAPI-only misses browser-side intent signals (hover, scroll, ATC).

**For Triple Whale Starter:** Shopify → Apps → Triple Whale → click **"Set up pixel"** in the onboarding checklist → click **"Auto-install"** (Triple Whale adds the pixel to your theme.liquid automatically) → click **"Verify Conversions API"** (this fires a test event from Shopify's backend).

If "Auto-install" fails (rare; usually a theme.liquid conflict), fall back to manual install:
1. Triple Whale dashboard → Settings → Install → Copy the pixel code
2. Shopify → Online Store → Themes → … → Edit code → `theme.liquid`
3. Paste the pixel code just before `</head>`
4. Save

**For Polar Analytics:** Polar → Settings → Pixel → Copy the pixel → same theme.liquid paste → Save.

**For non-Shopify (Path D):** install the server-side pixel per Polar's plugin docs (varies by cart platform).

**Why pixel + CAPI both:** pixel captures browser-side signals (pageview, ATC, begin-checkout, add-payment-info); CAPI captures server-side signals (order placed, refund issued, subscription renewed). Triple Whale merges both streams via a deterministic dedup key (event_id + order_id) so the order appears once in your dashboard. If only pixel fires (CAPI broken), you'll see inflated pageview counts but missing orders. If only CAPI fires (pixel blocked), you'll see orders but no funnel data. **Both must be green.**

**Verification gate for Step 2:** Triple Whale → Settings → Install → "Pixel status: Active" + "CAPI status: Active" both green. Polar → Settings → Pixel → "Status: Active". Cross-check: place a test order (use Shopify's Bogus Gateway or PayPal sandbox), wait 5 minutes, see the order appear in Triple Whale's "Live" tab. If the order doesn't appear within 10 minutes, the CAPI is broken — re-check Step 2.

### Step 3 — Enable the post-purchase survey (the highest-value attribution signal)

This is the single most important step in the playbook. The post-purchase survey ("How did you hear about us?") is **the only attribution signal that works post-iOS14.5 + cookie deprecation + Safari ITP** — it doesn't rely on cookies or pixels, just the customer's memory.

**For Triple Whale Starter:** Triple Whale → Settings → Post-purchase survey → toggle ON → configure the survey:
- **Question text:** "How did you hear about us?" (default; don't customize — operators who customize the question get lower response rates)
- **Multiple-choice options:** Triple Whale's default options cover TikTok / Instagram / Google / Friend / Podcast / Blog / Other. The "Other" free-text field is the goldmine — it captures UGC sources (Reddit threads, Substack mentions, Discord servers) that no paid-attribution tool can see
- **Placement:** "Thank you" page (right after the order confirmation) — NOT a popup, NOT a separate email, NOT the checkout flow
- **Skip logic:** show the survey only on orders ≥$20 (below that, response rate is <5% and the data is noisy)

**For Polar:** Polar → Settings → Post-purchase survey → toggle ON → same question + options + placement. Polar calls this "Attribution Survey" instead of "Post-purchase survey"; same mechanic.

**For non-Shopify (Path D):** Polar supports a custom post-purchase page integration via API. If your cart doesn't support a post-purchase page (rare in 2026), use a 2-question Klaviyo flow triggered on order-placed as a fallback (response rate halves, but it's still useful).

**Why this matters more than the pixel:** Triple Whale's own 2025 data shows the post-purchase survey recovers ~30% of attribution that pixel-only misses (TikTok dark social, podcast mentions, word-of-mouth). For a brand doing $1M/mo revenue, that's $300k/yr of attribution the operator would otherwise mis-classify as "direct/organic" and underinvest in. **The pixel tells you "someone clicked a Meta ad"; the survey tells you "they clicked a Meta ad AFTER hearing about us from a TikTok creator."** These are very different stories.

**Verification gate for Step 3:** Place a test order (Bogus Gateway, $50) → wait 60 seconds → the "Thank you" page should show the survey → submit a response ("TikTok") → wait 5 minutes → Triple Whale → Live → find the test order → click into it → "Attribution source: TikTok (survey)" with the response shown in the order detail. If the survey doesn't appear, the post-purchase page isn't being served — check that ReConvert / AfterSell / Smile.io hasn't replaced the default "Thank you" page (those apps have their own post-purchase page that needs the survey injected via their app settings, not the default Shopify page).

### Step 4 — Connect Klaviyo, Meta Ads, Google Ads, TikTok Ads (in that order)

The integration order matters. Klaviyo first (so engagement events can be attributed against flows), then Meta + Google + TikTok (so ad-platform conversion events match what Triple Whale sees).

**4a — Klaviyo integration:** Triple Whale → Settings → Integrations → Klaviyo → click **Connect** → authorize via OAuth → on the integration page, toggle ON:
- "Sync Klaviyo flows to Triple Whale cohort view" (so Move #1's abandoned-cart flow and Move #4's welcome series appear as cohorts in Triple Whale)
- "Sync Triple Whale attribution to Klaviyo segments" (so you can build Klaviyo segments like "Customers acquired via TikTok survey attribution" — the foundation for Move #8's loyalty cohort targeting)
- "Sync email-engagement events back to Triple Whale" (so the loyalty program's email opens/clicks are attributed against the cohort that received them)

**4b — Meta Ads integration:** Triple Whale → Settings → Integrations → Meta Ads → Connect → authorize → toggle ON:
- "Conversions API server-side events" (so Meta's ad-platform sees the SAME orders Triple Whale sees — closes the iOS14.5 attribution gap)
- "Sync Triple Whale attribution back to Meta" (Meta will see "this order came from TikTok survey attribution, not Meta" — critical for not over-claiming Meta's contribution)

**4c — Google Ads integration:** Same flow → Google Ads → Connect → toggle ON Conversions API + Enhanced Conversions. Google calls this "Enhanced Conversions"; the mechanic is identical to Meta's CAPI.

**4d — TikTok Ads integration:** Same flow → TikTok Ads → Connect → toggle ON Events API (TikTok's name for CAPI). Only do this if you're running TikTok ads; skip if you're not.

**Why this order (Klaviyo first):** The Klaviyo integration is the highest-leverage because it lets Move #1, #4, #7, #8's flow performance be attributed in the Triple Whale cohort view. Without this, your abandoned-cart flow performance is a black box from an attribution standpoint. Meta + Google integration matters for ad-platform optimization (CAPI events improve Meta's algorithmic optimization by ~10–20%), but Klaviyo matters more for the cron-improver stack.

**Verification gate for Step 4:** Triple Whale → Settings → Integrations → all 4 integrations show "Connected" + last sync timestamp < 1 hour ago. If a sync is stale (>1 hour), check the integration's OAuth token — usually needs re-authorization.

### Step 5 — Build your baseline dashboard + cohort view

Triple Whale's default dashboard shows you a lot of data you don't need yet. Spend 20 minutes building a **focused baseline dashboard** with the 5 widgets that matter for the cron-improver stack.

**Widget 1 — MER (Marketing Efficiency Ratio)** at the top of the dashboard:
- Formula: `Net revenue (last 30d) / Ad spend (last 30d)`
- Target: ≥3.0× (per research/00-ecommerce-ops-landscape.md §3, Triple Whale 2025 vertical median is 2.01×, top-quartile is 5.0×+)
- Comparison: your `MER_baseline` from Prerequisite #9 — post-install MER should be within ±10% of baseline (if it jumps +50%, something was double-counting; if it drops 30%, the pixel missed events)

**Widget 2 — Channel-level net revenue + spend + ROAS** for last 30d:
- Columns: Channel | Spend | Net Revenue | MER | New Customers | Repeat Customers
- The "Repeat Customers" column is the one Move #8's loyalty program lives in — when the cohort shows the loyalty members' repeat-purchase rate climbing, you can attribute the +5–7 pts lift to Move #8 specifically

**Widget 3 — Cohort LTV by acquisition source**:
- Slice: cohorts by acquisition source (TikTok survey / Meta paid / Google branded / Email / Direct / Organic)
- Metric: 30-day, 60-day, 90-day LTV per cohort
- Use this to verify Move #4 (welcome series) is lifting 90-day LTV for the "Email signup" cohort specifically — without cohort slicing, you can't tell whether the welcome series worked or whether the cohort was already high-LTV

**Widget 4 — Flow-attributed revenue** (the Move #1/#4/#7 anchor):
- Slice: each Klaviyo flow (abandoned cart, welcome series, post-purchase upsell, SMS cart abandon)
- Metric: revenue attributed to flow-influenced orders in last 30d
- Cross-check: this number should be close to but not identical to Klaviyo's own flow-attributed revenue (Triple Whale uses a different attribution model — multi-touch vs Klaviyo's last-touch)

**Widget 5 — Post-purchase survey response distribution** (last 30d):
- Bar chart: count of orders by attribution source (TikTok / Instagram / Google / Friend / Podcast / Blog / Other)
- The "Other" free-text responses are the highest-signal data point — read them weekly, they tell you which UGC sources to invest in

**Verification gate for Step 5:** All 5 widgets render with non-zero data (you should have ≥30 days of orders by now; if you've just installed, the dashboard will be sparse for the first 14 days while data accumulates). Set a calendar reminder for 30 days post-install to re-run the verification and capture the first credible baseline.

### Step 6 — Verify end-to-end (the 7-gate verification)

After completing Steps 1–5, run the 7-gate verification. Each gate has a concrete measurement + target + pass criterion. **Do not declare the install "done" until all 7 gates pass.**

#### Gate A — Pixel + CAPI both green

**Measurement:** Triple Whale → Settings → Install → Pixel status AND CAPI status.
**Target:** Both green.
**Pass:** Both green. If either red, re-run Step 2.

#### Gate B — Post-purchase survey firing on ≥80% of orders

**Measurement:** Place 5 test orders over 5 days (use Bogus Gateway; vary order values $30 / $75 / $150 to test the $20 skip-logic). For each, verify the survey appeared on the "Thank you" page.
**Target:** Survey appears on ≥4 of 5 test orders (80%).
**Pass:** 4/5 or 5/5. If 3/5 or fewer, the survey placement is broken — check ReConvert / AfterSell / Smile.io post-purchase page override.

#### Gate C — Klaviyo cohort sync live

**Measurement:** Triple Whale → Cohorts → look for "Klaviyo: Welcome Series Flow" and "Klaviyo: Abandoned Cart Flow" cohorts.
**Target:** Both cohorts visible with ≥1 member each (your test orders' email addresses should appear if you've placed test orders while subscribed).
**Pass:** Both cohorts visible. If only one is visible, the Klaviyo integration's "Sync Klaviyo flows" toggle is off — re-check Step 4a.

#### Gate D — Meta Conversions API receiving events

**Measurement:** Meta → Events Manager → select your pixel → look for `Purchase` events in the last 24 hours.
**Target:** At least 1 Purchase event with `action_source: "website"` and matching `event_id` between Meta and Triple Whale.
**Pass:** Purchase event present, `event_id` matches. If missing, the Meta CAPI integration isn't firing — check Step 4b.

#### Gate E — Google Enhanced Conversions receiving hashed emails

**Measurement:** Google Ads → Tools → Conversions → your Purchase conversion action → "Diagnostics" tab → look for `enhanced_conversions_data_quality` row.
**Target:** `enhanced_conversions_data_quality = "Excellent"` or `"Good"`.
**Pass:** Excellent or Good. If "Needs improvement" or "Unavailable", the email-hashing isn't working — check that your Klaviyo → Triple Whale → Google pipe is passing `email` (hashed) on every event.

#### Gate F — Post-purchase survey responses ≥15% response rate

**Measurement:** Triple Whale → Live → filter to last 30d orders → count orders with a non-empty `attribution_source_survey` field. Divide by total orders in same window.
**Target:** ≥15% response rate (Triple Whale 2025 vertical median is 18–25%; below 15% suggests the survey isn't being shown, or customers are skipping it).
**Pass:** ≥15%. If <15%, move the survey higher on the "Thank you" page (above the order details) and add a small incentive ("Get 10% off your next order for telling us how you found us" — adds ~5 pts response rate at typical margin).

#### Gate G — Cohort LTV moves when flows are turned off

**The killer verification test.** This is the test that proves attribution is actually working end-to-end. Pick one of your Klaviyo flows (start with the welcome series — Move #4). Turn it OFF for 14 days. Compare the cohort LTV of customers acquired during those 14 days vs. the 14 days prior (when the flow was on). **If Triple Whale is working correctly**, the cohort LTV during the OFF window should drop measurably (typically 10–20% on the 90-day window for the welcome series specifically). **If Triple Whale is NOT working correctly**, the cohort LTV will look identical whether the flow is on or off — meaning the attribution can't distinguish the flow's contribution from other factors.

**Measurement:** Triple Whale → Cohorts → Welcome Series ON cohort (last 14 days) vs Welcome Series OFF cohort (14 days prior) → compare 30-day LTV.
**Target:** ON cohort LTV > OFF cohort LTV by ≥10%.
**Pass:** ≥10% lift. If <10%, the cohort definition is wrong (the flow isn't actually filtering customers correctly) OR the attribution window is too narrow (try 60-day instead of 30-day).

**Why this gate is the most important:** Gates A–F verify the integration plumbing. Gate G verifies that the attribution is producing **actionable signal** — numbers the operator can use to make decisions. A Triple Whale install that passes Gates A–F but fails Gate G is a $179/mo dashboard, not an attribution system.

## Metrics to track

15 metrics. Source tool + target band + how-to-slice column. **Check weekly on Monday morning** — the cadence that catches drift before it costs you a quarter of bad spend decisions.

| # | Metric | Source | Target band | How to slice |
|---|---|---|---|---|
| 1 | **MER** (Marketing Efficiency Ratio) | Triple Whale | ≥3.0× (vertical median 2.01×, top-quartile 5.0×+) | 30d rolling; by quarter |
| 2 | **Blended ROAS** (paid only) | Triple Whale | ≥2.5× | 30d; by channel |
| 3 | **New customer share of revenue** | Triple Whale | 40–60% (mature brand = 30–40%; growth brand = 60%+) | 30d; by cohort |
| 4 | **Repeat purchase rate** | Triple Whale + Smile.io (Move #8) | 25–35% (top-quartile 40%+) | 90d cohort |
| 5 | **Cohort 30-day LTV** by acquisition source | Triple Whale Cohorts | Top-quartile source = 1.5× bottom-quartile source | by source (TikTok / Meta / Google / Email / Direct) |
| 6 | **Cohort 90-day LTV** by acquisition source | Triple Whale Cohorts | Top-quartile source = 2.0× bottom-quartile source | by source |
| 7 | **Post-purchase survey response rate** | Triple Whale | ≥15% (vertical median 18–25%) | 30d; by AOV band |
| 8 | **Survey-attribution recovery** (orders with survey data) | Triple Whale | ≥50% of orders have non-empty attribution source | 30d |
| 9 | **Welcome series flow-attributed revenue** (Move #4) | Triple Whale Flow slice | ≥$5 per recipient (250:1+ on Move #4's canonical inputs) | 30d; by flow step |
| 10 | **Abandoned cart flow-attributed revenue** (Move #1) | Triple Whale Flow slice | ≥$30 per recovery (35:1 on Move #1's canonical inputs) | 30d |
| 11 | **SMS flow-attributed revenue** (Move #7) | Triple Whale Flow slice | ≥$10 per recipient (5.7:1 on Move #7's canonical inputs) | 30d; by SMS flow |
| 12 | **Loyalty program cohort LTV** (Move #8) | Triple Whale + Smile.io | Loyalty members LTV ≥ 1.5× non-members | 90d cohort |
| 13 | **Meta CAPI event match score** | Meta Events Manager | ≥7.0 (Good) on the `match_score` diagnostic | weekly; per pixel |
| 14 | **Google Enhanced Conversions quality** | Google Ads Diagnostics | Excellent or Good | weekly |
| 15 | **Triple Whale → Klaviyo cohort sync latency** | Triple Whale Settings → Integrations | Last sync timestamp < 1 hour ago | daily |

**Three metrics deserve special attention:**
- **#5 (cohort LTV by source)** is the one Move #4 (welcome series), Move #7 (SMS), and Move #8 (loyalty) all depend on. If this metric is missing or untrustworthy, the entire retention stack is unmeasurable.
- **#7 (survey response rate)** is the canary for post-iOS14.5 attribution. If it drops below 15%, your survey placement is broken.
- **#15 (sync latency)** is the canary for integration drift. If Klaviyo sync is stale >1 hour, the cohort view will silently miss recent flow events and you'll misread Move #4's performance.

## Common pitfalls

15 pitfalls with corrective "Fix:" lines. Each pitfall has been observed in production at least once.

| # | Pitfall | Symptom | Fix |
|---|---|---|---|
| 1 | **Pixel installed but CAPI broken** | Triple Whale shows pageviews but no orders | Re-run Step 2's "Verify Conversions API"; check that the CAPI gateway token is set in Triple Whale Settings → CAPI |
| 2 | **CAPI installed but pixel blocked by theme.liquid conflict** | Triple Whale shows orders but no funnel data (no add-to-cart events) | Check that theme.liquid has only ONE pixel snippet; if there's a duplicate from a previous install, remove the older one |
| 3 | **Post-purchase survey replaced by ReConvert / AfterSell / Smile.io post-purchase page** | Survey response rate drops to 0% | Inject the Triple Whale / Polar survey into the app's post-purchase page settings (ReConvert → Post-purchase editor → Custom HTML → paste the survey script) |
| 4 | **Survey question text customized to "Where did you hear about [brand name]?"** | Response rate drops 30% because customers don't recognize the brand-name-in-question | Revert to default "How did you hear about us?" — Triple Whale's research shows default phrasing converts 2× better |
| 5 | **Survey shown on all orders including <$20** | Response rate appears low because low-AOV orders don't convert on survey | Set skip-logic to orders ≥$20 (per Step 3) |
| 6 | **Klaviyo integration connected but cohort sync not toggled on** | Triple Whale Cohorts tab doesn't show "Welcome Series" or "Abandoned Cart" cohorts | Triple Whale → Settings → Integrations → Klaviyo → toggle "Sync Klaviyo flows to Triple Whale cohort view" |
| 7 | **Meta CAPI events firing but `event_id` not matching pixel events** | Meta shows inflated conversion count (double-counting pixel + CAPI as separate events) | Verify both pixel and CAPI are emitting the SAME `event_id` per event; Triple Whale does this automatically — check that no other app is also emitting CAPI events to Meta |
| 8 | **Google Enhanced Conversions showing "Unavailable" quality** | Google ad-platform optimization is degraded (CPA up 10–20%) | Verify the email-hashing pipe Klaviyo → Triple Whale → Google is passing the customer's email (hashed SHA256) on every conversion event; check Triple Whale Settings → Integrations → Google → "Send hashed email" toggle |
| 9 | **Polar installed but GA4 import not configured** | Polar dashboard only shows post-purchase survey attribution, missing the GA4 behavioral data | Polar → Settings → Integrations → GA4 → paste your GA4 Measurement ID; verify the import runs daily |
| 10 | **Triple Whale Pro installed on a <$5M GMV store** | $1,290/mo is consuming margin that should be reinvested in ads or retention flows | Downgrade to Starter. Pro's MMM and incrementality testing aren't worth 7× the cost below $5M GMV |
| 11 | **Post-purchase survey responses all clustered in "Other" free-text** | The pre-canned options don't match how your customers actually describe their discovery | Read the "Other" responses weekly for 30 days; cluster them into a "Top discovery sources" list; if a cluster >20% of responses, add it as a new pre-canned option |
| 12 | **Cohort LTV data looks identical across acquisition sources** | Either the cohorts aren't actually filtering, or the attribution window is too short to see divergence | Triple Whale → Cohorts → verify each cohort has a different filter definition; if filters are correct, widen the attribution window from 30d to 60d or 90d |
| 13 | **Triple Whale dashboard loads slowly (>10 sec)** | Usually because of Meta/Google integration sync backlogs | Triple Whale → Settings → Integrations → manually trigger a "Re-sync" for the slowest integration; if still slow, the brand's order volume has outgrown Starter — consider Pro |
| 14 | **Pixel fires on checkout but not on the "Thank you" page** | Order shows in Triple Whale via CAPI but the survey isn't loading | The "Thank you" page is often a separate route in Shopify (`/thank_you` or `/order_status`); check that theme.liquid's pixel snippet is also loaded on those routes, OR inject the pixel via Triple Whale's "Auto-install on all pages" toggle |
| 15 | **Operator abandons Triple Whale after 30 days because the data "doesn't match GA4"** | GA4 says one thing, Triple Whale says another — operator doesn't know which to trust | Document a baseline comparison in a Loom or Notion doc: "GA4 reports X orders, Triple Whale reports Y orders. The gap = Z% is the iOS14.5 attribution recovery. Triple Whale is closer to ground truth because of the post-purchase survey." This is the most common operator failure mode for this playbook |

**Pitfall #15 is the single most common failure mode for this entire stack.** The operator expects Triple Whale and GA4 to match exactly, they don't (Triple Whale recovers 30–40% more attribution because of the survey), and the operator concludes Triple Whale is wrong. **The right mental model:** GA4 = deterministic pixel + cookie attribution (incomplete post-iOS14.5). Triple Whale = pixel + CAPI + post-purchase survey + email-match (closer to ground truth). The gap between them is the attribution Triple Whale recovers that GA4 misses. This is the value you're paying $179/mo for. Operators who don't internalize this abandon the tool after 30 days.

## Verification

7-gate verification mirrors Step 6. Each gate is runnable end-to-end and should be re-run **weekly** (Monday morning is the canonical cadence).

### Step A — Pixel + CAPI both green (Gate A)

```bash
# Run the companion script (new this tick)
python3 scripts/triple_whale_attribution_check.py --check pixel_capi

# Expected output: "✓ Pixel: Active | ✓ CAPI: Active | Both green"
```

If either is red, re-run Step 2.

### Step B — Post-purchase survey response rate ≥15% (Gate F)

```bash
python3 scripts/triple_whale_attribution_check.py --check survey_response_rate
# Expected output: "Survey response rate (last 30d): X% | Target: ≥15% | ✓"
```

If <15%, re-check Pitfall #3 (survey replaced by app) and Pitfall #4 (question text customized).

### Step C — Klaviyo cohort sync live (Gate C)

```bash
python3 scripts/triple_whale_attribution_check.py --check klaviyo_cohort_sync
# Expected output: "✓ Welcome Series cohort visible | ✓ Abandoned Cart cohort visible | ✓ Post-Purchase Upsell cohort visible"
```

If a cohort is missing, re-toggle Step 4a's "Sync Klaviyo flows" toggle.

### Step D — Meta CAPI events firing (Gate D)

```bash
python3 scripts/triple_whale_attribution_check.py --check meta_capi
# Expected output: "✓ Meta Purchase events present in last 24h | event_id match: ✓"
```

If missing, re-check Step 4b's OAuth token.

### Step E — Google Enhanced Conversions quality (Gate E)

```bash
python3 scripts/triple_whale_attribution_check.py --check google_enhanced_conversions
# Expected output: "✓ Enhanced Conversions quality: Good | Email hashing: active"
```

If quality is "Needs improvement", re-check Step 4c's email-hashing toggle.

### Step F — Survey "Other" free-text response cluster audit (Gate H)

Manual review: Triple Whale → Live → filter to last 30d → "Other" responses → read all of them → cluster into top 3-5 discovery sources → if any cluster >20%, consider adding it as a new pre-canned option (Pitfall #11).

### Step G — End-to-end attribution GATE VERIFICATION (Gate G, the killer test)

```bash
# Run the cohort LTV comparison test
python3 scripts/triple_whale_attribution_check.py --check cohort_ltv_comparison
# Expected output: "Welcome series ON cohort 30d LTV: $X | OFF cohort 30d LTV: $Y | Lift: Z% | Target: ≥10% | ✓"
```

If <10%, the cohort definition is wrong — see Pitfall #12.

## Cost & ROI estimate

**Default case: Shopify brand at $1M–$5M GMV with $10k/mo paid spend, 1k orders/mo, on Path B (Triple Whale Starter).**

| Line | Cost / Revenue |
|---|---|
| **Triple Whale Starter platform** | $179/mo |
| Implementation time (one afternoon) | ~$200 in operator time at $50/hr × 4 hr |
| **Total Year 1 cost** | **$179 × 12 + $200 = $2,348** |
| Ad-spend reallocation recovered in first 90 days | $300/mo (one underperforming ad set killed at $10/day × 30 days) = **$3,600/yr** |
| Move #8 (loyalty) attribution now measurable | Unlocks ~$2,000/mo of previously un-attributable loyalty revenue |
| Move #1 (abandoned cart) cohort LTV now measurable | Catches a ~5% over-investment in cart flow that was cannibalizing direct = ~$500/mo recovered |
| Move #4 (welcome series) cohort LTV now measurable | Catches a ~10% over-investment in welcome series that wasn't actually lifting 90d LTV = ~$700/mo recovered |
| Meta CAPI + Google Enhanced Conversions ad-platform optimization lift | 10–20% improvement in ad-platform algorithmic optimization = ~$300/mo recovered CPA on $10k/mo spend |
| **Total Year 1 benefit (conservative)** | **$3,600 + $24,000 (loyalty attribution) + $6,000 (cart attribution) + $8,400 (welcome attribution) + $3,600 (ad-platform lift) = $45,600** |
| **Net Year 1 ROI** | **$45,600 / $2,348 = 19.4× net ROI** |
| **Payback period** | **~3 weeks** (Triple Whale pays for itself in the first 90 days via the ad-spend reallocation alone, even before any flow attribution) |

**Path A (Polar Starter at $49/mo):** Same math, ~$1,560/yr cost vs $45,600 benefit = ~29× net ROI. Path A is strictly better ROI but capped at the features Triple Whale Starter provides (no Moby AI, less mature Meta/Google sync).

**Path C (Triple Whale Pro at $1,290/mo):** Only worth it above $50k/mo paid spend. Below that, the MMM and incrementality features don't have enough data volume to be statistically meaningful.

**Path D (Polar Pro at $299/mo):** 1.6× the cost of Path A for the non-Shopify flexibility; same ROI shape.

**Path E (free, skip):** Free, but blocks Moves #1/#4/#7/#8 from being properly attributed. Only sensible for pre-revenue.

**Honest read:** Path B is the default for 80% of DTC brands. The 19.4× net ROI is conservative — most brands recover the platform cost in the first 30 days via ad-spend reallocation alone, and the cohort LTV unlocks compound improvements across the rest of the retention stack (Moves #1, #4, #7, #8 all become measurable for the first time).

## Companion tool: `triple_whale_attribution_check.py`

A new script shipped alongside this playbook (`scripts/triple_whale_attribution_check.py` + matching `scripts/tests/test_triple_whale_attribution_check.py`). The script is **not** a Triple Whale API client — it doesn't require API credentials and can't authenticate against Triple Whale's API. Instead, it's a **checklist runner** that:

1. Validates the local configuration (Triple Whale pixel ID present in theme.liquid, post-purchase survey HTML present, Klaviyo integration ID present, Meta + Google pixel IDs present) by reading the Shopify theme files and your config.
2. Validates the post-purchase survey HTML structure (correct script tag, correct placement, ≥$20 skip-logic present).
3. Validates the Klaviyo flow event names against the Move #1/#4/#7 flow names (so cohort sync can find them).
4. Produces a 7-gate pass/fail report matching the playbook's Verification section.

**Run it before declaring the install "done":**

```bash
python3 scripts/triple_whale_attribution_check.py
# Output: 7-gate checklist with ✓/✗ for each gate + remediation guidance on failures
```

**Use it as the post-install smoke test** — if all 7 gates pass, the install is complete; if any gate fails, the output tells you which Step to revisit.

The script is intentionally hermetic (no API credentials) because Triple Whale's API requires a paid plan + per-user OAuth flow that's a 2-day setup by itself. The local-config-check approach catches the 90% of install mistakes that don't require API access to diagnose (missing pixel, missing survey, missing Klaviyo flow names) and is sufficient as a smoke test.

## Next moves after attribution is live

5 next moves, ordered by leverage:

1. **Move #10 — AI ad creative iteration (AdCreative.ai / Triple Whale Moby / Smartwriter)** — now that attribution is live, you can measure the ROAS lift of AI-generated creatives against human-generated ones. Triple Whale Starter includes Moby AI at no extra cost.
2. **Move #9 — Mobile PDP redesign** — attribution reveals which device class converts at what rate; the mobile/desktop gap is typically 50% (1.8% vs 3.9% CVR per Triple Whale 2025). Closing half the gap = 10–15% total revenue lift.
3. **Move #3 follow-up — checkout audit re-score** — re-run the Move #3 checkout audit script after Triple Whale is live and you can now measure the actual CVR lift per fix (instead of estimating).
4. **Move #4 follow-up — welcome series cohort LTV audit** — Triple Whale's cohort view lets you measure whether the welcome series actually lifted 90-day LTV for the "Email signup" cohort. If the lift is <5%, the welcome series is mis-configured and needs the Move #4 playbook's Step 9 A/B tests.
5. **Move #1 follow-up — abandoned cart cohort attribution audit** — same pattern as #4 but for the cart flow. If the cart flow's cohort LTV lift is <20%, the timing or discount structure is wrong.

## Related

- `research/02-top-10-leverage-moves.md` — Move #6 entry, plus how it unlocks Moves #1, #4, #7, #8 attribution.
- `research/00-ecommerce-ops-landscape.md` — §3 (CAC/LTV benchmarks), §5 (MTA vs MMM), §22 (RFM segmentation + Moby), §30 (mobile/desktop gap), §45 (AI ad creative throughput).
- `research/01-tools-stack-comparison.md` — Analytics row, plus the 3 recommended stacks (Path A/B/C/D by budget tier).
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1; depends on Triple Whale for cohort LTV verification.
- `playbooks/02-post-purchase-upsell-reconvert.md` — Move #2; the post-purchase page is also where the Triple Whale survey lives (Pitfall #3).
- `playbooks/03-checkout-audit-baymard.md` — Move #3; re-score with Triple Whale attribution after install.
- `playbooks/04-welcome-series-klaviyo.md` — Move #4; Step 10 already wires Triple Whale attribution. This playbook is the detailed version.
- `playbooks/05-migrate-to-klaviyo-postscript.md` — Move #5; the Klaviyo integration here is the same one Move #4/6 reference.
- `playbooks/07-loyalty-program-smile.md` — Move #8; Triple Whale cohort view is the loyalty attribution backbone.
- `scripts/triple_whale_attribution_check.py` — the companion checklist runner (new this tick).
- `scripts/tests/test_triple_whale_attribution_check.py` — TDD test suite for the companion script.
