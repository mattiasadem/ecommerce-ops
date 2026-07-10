---
name: triple-whale-attribution
title: Triple Whale / Polar attribution (Move #6 foundation, MTA + cohort LTV)
category: attribution
tier: 1
priority: P0
default_move: 6
year_1_roi_band: "19:1–96:1"
sms_friendly: false
last_updated: 2026-07-10
sources: [triple-whale 2024, polar 2024, northbeam 2024, lifetimely 2024, peel 2024, ga4 2024, meta-capi 2024, google-ads-enhanced-conversions 2024, klaviyo 2024, shopify 2024, moby-ai 2024, moz 2024]
---

# Triple Whale / Polar attribution (Move #6 foundation, MTA + cohort LTV)

> Move #6 is the FOUNDATION underneath every other lever in the top-10 list — without Multi-Touch Attribution (MTA) you cannot distinguish a 12% lift from the welcome series (Move #4) from a cannibalised abandoned-cart flow (Move #1) net-zeroing the revenue. Every DTC brand that has shipped Moves #1–#5 without Move #6 is making $1k+/mo in misallocated ad-spend + misjudged retention-flow decisions. Triple Whale Starter ($179/mo) is the canonical Path B default at $500k–$5M GMV; Polar Analytics ($49/mo) is the Path A budget option under $500k; Triple Whale Pro ($1,290/mo) is Path C above $50k/mo paid spend. Year-1 ROI band **19:1–96:1** (median ~19:1 conservative) — every $1 of ad spend the operator would otherwise waste goes straight to the bottom line. Ship AFTER Move #1 (cart abandon email) + Move #4 (welcome series) are at ≥4-week revenue baseline AND the store is doing ≥100 orders/month — install in a single afternoon, run the 6-step build over 2 hours, verify across the 7-gate end-to-end checklist, and run the 6-metric monitoring loop weekly to catch attribution drift before it costs a quarter of bad decisions.

## When to use this skill

You have:

- A Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store
- **≥100 orders/month processed in the last 30 days** (attribution needs volume to distinguish signal from noise — below this threshold, install GA4 + Shopify Analytics only, defer Paid MTA)
- **≥$2k/mo paid-media spend** on Meta + Google (combined) — at lower spend the $49–$179/mo platform fee isn't recoverable from avoided spend alone
- Klaviyo (or equivalent ESP) on a paid plan with flows live
- Admin access to Shopify theme.liquid (pixel paste path) OR app-install permissions
- Admin access to Meta Ads Manager + Google Ads (Conversions API events need write access)
- A working post-purchase page (default Shopify "Thank you" OR ReConvert upsell page OR Order Status page) — the highest-value attribution signal is the post-purchase survey
- 4-hour kickoff block + 1-hour weekly maintenance committed
- 2FA on the Meta + Google + Klaviyo + store admin accounts (every attribution integration requires an OAuth round-trip)
- A documented baseline MER (Marketing Efficiency Ratio) = Net revenue last 30d / Ad spend last 30d (from GA4 or Shopify Analytics)

You do NOT have:

- Any MTA tool installed (Triple Whale, Polar, Northbeam, Rockerbox, Beeyond)
- Post-purchase survey attribution wired (the single most reliable signal post-iOS14.5 + cookie deprecation — your pixel is recovering maybe 60–70% of attribution, the survey recovers the missing 30–40%)
- Cohort LTV dashboards that distinguish Move #1 / Move #4 / Move #7 / Move #8 cohorts (so each flow's revenue can be properly attributed against the others)
- Pixel + Conversions API firing on both sides (pixel-only is broken on Safari/iOS; CAPI-only misses browser-side intent signals — you need both)
- An attribution-health audit cadence (Move #6.5 / #6.6 / #6.7 / #6.8) — the install is the start of attribution hygiene, not a one-time deploy
- Confidence that Meta Enhanced Conversions / Google Customer Match are receiving hashed emails (otherwise ad-platform optimization is flying blind)

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Loom, Bombas, Hexclad, Olipop, Dr. Squatch.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Meta CAPI event_id match rate | ≥98% | ≥85% | 99%+ |
| Meta CAPI dedup ratio vs pixel | 0.95–1.10 (target 1.00) | 0.80–1.20 | exactly 1.00 |
| Pixel coverage (% of expected pageviews) | ≥98% | ≥90% | 99%+ |
| Google Enhanced Conversions quality tier | Excellent | Good | Excellent |
| GA4 ↔ Triple Whale revenue delta | ≤2% | ≤8% | ≤1% |
| Klaviyo ↔ Triple Whale cohort roundtrip | ≥99% match | ≥95% match | 100% match |
| Post-purchase survey response rate | ≥30% | ≥15% | ≥45% |
| Post-purchase survey attribution recovery | ≥40% of orders | ≥25% | ≥55% |
| Cohort LTV (Move #1 + Move #4 + Move #7 + Move #8 cohorts identified) | 4 cohorts | 2 cohorts (Move #1 + Move #4) | All 4+ explicit |
| Cohort LTV delta (ON vs OFF) at ≥30-day window | +10–30% | +5% | +40%+ |
| Northbeam / Triple Whale Pro MMM lift over MTA | +5–15% incremental ROAS | +0% (no MMM) | +20% |
| Operator time per week on attribution hygiene | ≤30 min | 1–2 hr | ≤15 min |
| Attribution drift detection (Move #6.5 weekly) | 100% automated | Quarterly manual | 100% automated + Slack-alerted |
| Avoided misallocation $/month (typical $1M–$5M brand) | $5k–$15k/mo | $1k–$3k/mo | $20k+/mo |

## Attribution benchmarks (2024–25)

| Tool tier | Store profile | Platform | Plan | Cost | Year-1 ROI |
|---|---|---|---|---|---|
| Path E (defer) | Pre-revenue / <$10k/mo | GA4 + Shopify Analytics | Free | $0 | n/a — defer |
| Path A (budget) | Shopify <$500k GMV, <$5k/mo paid | Polar Analytics | Starter | $49/mo | $5k–$25k Year-1 incremental = **8:1–42:1** |
| Path B DEFAULT | Shopify $500k–$5M GMV, $5k–$50k/mo paid | Triple Whale | Starter | $179/mo | $22k–$112k Year-1 incremental = **10:1–52:1** |
| Path C (scale) | Shopify $5M–$50M GMV, $50k+/mo paid | Triple Whale | Pro | $1,290/mo | $150k–$1.5M Year-1 incremental = **9:1–96:1** |
| Path D (non-Shopify) | WooCommerce / BigCommerce / headless | Polar Analytics | Pro | $299/mo | $15k–$80k Year-1 incremental = **4:1–22:1** |
| Path F (premium, out-of-scope) | $10M+ paid spend | Northbeam | Starter | $1,500+/mo | covered in research/01; out-of-scope for this skill |

**Best-in-class recovers $5k–$15k/mo from avoided misallocation; median saves $2k–$5k/mo; floor recovers $500/mo just from killing one underperforming ad set.**

## The build (6 steps over ~4 hours)

### Step 1 — Install the platform (30 min)
- **Path B (default):** Shopify App Store → "Triple Whale" → Install → on permissions page click Install app → onboarding wizard: enter domain + revenue range → skip auto-connect for now (Step 4 does it explicitly).
- **Path A (Polar):** Shopify App Store → "Polar Analytics" → Install → onboarding is faster (~10 min).
- **Path D (non-Shopify):** Polar plugin for your cart platform → paste GA4 Measurement ID into Polar → Settings → Integrations → GA4.
- **Verification:** Triple Whale dashboard at `app.triplewhale.com` loads with "Connected" green badge.

### Step 2 — Install pixel + Conversions API on every page (30 min)
The pixel captures browser-side signals (pageview, ATC, begin-checkout, add-payment-info); CAPI captures server-side signals (order placed, refund, subscription renewal). You NEED BOTH — pixel-only breaks on Safari/iOS; CAPI-only misses funnel data.

- Triple Whale: Settings → Install → "Auto-install" pixel (auto-adds to theme.liquid) → "Verify Conversions API" (fires test event from backend).
- If Auto-install fails (rare, usually theme.liquid conflict), fallback to manual: copy pixel code → Shopify → Online Store → Themes → … → Edit code → theme.liquid → paste just before `</head>` → Save.
- For non-Shopify Path D: server-side pixel via Polar's plugin docs.
- **Verification:** Triple Whale → Settings → Install → "Pixel: Active" + "CAPI: Active" both green; place test order (Bogus Gateway) → confirm order appears in Triple Whale's "Live" tab within 10 minutes.

### Step 3 — Enable the post-purchase survey (20 min)
**This is the single highest-value attribution signal.** The pixel tells you "someone clicked a Meta ad"; the survey tells you "they clicked the Meta ad AFTER hearing about us from a TikTok creator." Triple Whale 2025 data shows the survey recovers ~30% of attribution that pixel-only misses (TikTok dark social, podcast mentions, word-of-mouth, UGC).

- Triple Whale → Settings → Post-purchase survey → toggle ON.
- Question text: "How did you hear about us?" (default — don't customize; operators who customize get lower response rates).
- Multiple-choice options: TikTok / Instagram / Google / Friend / Podcast / Blog / Other (the "Other" free-text field captures UGC sources no paid tool can see — Reddit threads, Substack, Discord).
- Placement: "Thank you" page right after order confirmation (NOT popup, NOT email, NOT checkout).
- Skip logic: orders ≥$20 only (below $20 response rate is <5% and the data is noisy).
- **Verification:** Place test order ($50 Bogus Gateway) → wait 60s → survey appears on "Thank you" page → submit "TikTok" → wait 5 min → Triple Whale Live → find test order → "Attribution source: TikTok (survey)" shown in order detail.

### Step 4 — Connect integrations (Klaviyo first, then Meta + Google + TikTok) (45 min)
**Integration order matters.** Klaviyo first (so engagement events get attributed against flows), then ad platforms (so their conversion events match Triple Whale).

1. **Klaviyo:** Triple Whale → Settings → Integrations → Klaviyo → OAuth → toggle ON:
   - "Sync Klaviyo flows to Triple Whale cohort view" (so Move #1 + Move #4 + Move #7 flows appear as cohorts)
   - "Sync Triple Whale attribution to Klaviyo segments" (so you can build segments like "Customers acquired via TikTok survey attribution" — the foundation for Move #8 loyalty cohort targeting)
2. **Meta Ads:** Triple Whale → Integrations → Meta → OAuth → toggle "Conversions API server events" ON → verify the same `event_id` is being shared between pixel (browser) and CAPI (server) for dedup.
3. **Google Ads:** Triple Whale → Integrations → Google → OAuth → toggle "Enhanced Conversions" ON → verify hashed-email coverage.
4. **TikTok Ads:** Triple Whale → Integrations → TikTok → OAuth → toggle "Events API" + "Advanced Matching" ON (Advanced Matching is the email+phone+external_id toggle in TikTok Events Manager → pixel → Advanced Matching subtab).

**Verification:** Triple Whale → Integrations → all 4 show "Connected + Receiving events" green; Meta Events Manager → Test Events shows your test order with `event_id` matching the CAPI event.

### Step 5 — Build the attribution dashboard (60 min)
Triple Whale's default dashboard adapts to your scale — but you need to add 4 widgets and remove 2 default widgets to make it useful for Move #1 + Move #4 + Move #7 + Move #8 cohort analysis.

Add:
1. **Channel MER table** (paid + organic blended) — sorted by revenue contribution descending. This is the canonical "what is working" view.
2. **Cohort LTV by Move** — 30 / 60 / 90 / 180 / 365-day LTV bars segmented by cohort (Move #1 cart-abandon email engaged / Move #4 welcome series engaged / Move #7 SMS cart-abandon engaged / Move #8 loyalty enrolled). The cohort with the highest 90-day LTV is the highest-leverage flow to scale.
3. **Post-purchase survey response funnel** — survey impressions, responses, attribution-source distribution. The "Other" free-text responses should be exported monthly and manually categorized for UGC-source visibility (Reddit threads, Discord servers, Substack mentions).
4. **MER over time** — 30-day rolling MER line, overlaid with the day you installed Triple Whale (install should cause an attribution-clarity bump that "lifts" MER by 5–15% purely from previously-misallocated spend shifting to the correct channels).

Remove / hide:
- "Revenue by UTM" — Triple Whale post-purchase survey is a better signal than UTM in the cookie-deprecated world.
- "Last-click attribution" — Triple Whale Starter defaults to last-click which is misleading; switch to data-driven attribution in Settings.

**Verification:** Dashboard renders all 4 widgets with data from the last 7 days. Cohort LTV widget shows ≥3 distinct cohorts (Move #1 + Move #4 + Move #7 — Move #8 loyalty is conditional on having loyalty enrolled).

### Step 6 — Set up the attribution-health cadence (30 min)
The install is the start of attribution hygiene, not a one-time deploy. Without a weekly cadence, drift creeps in over 30–90 days (iOS consent banner change, CAPI token rotation, GA4 schema migration, Meta pixel update) and the operator doesn't notice until their MER tanks 3 months later.

- Install **Move #6.5** (attribution quality audit, weekly): script at `scripts/attribution_quality_audit.py` — runs 6 gates (Meta CAPI, Meta Pixel, Google EC, GA4↔TW delta, Klaviyo↔TW cohort roundtrip, week-over-week drift). Slack alert on any gate failure.
- Install **Move #6.6** (TikTok attribution audit, weekly): `scripts/tiktok_attribution_audit.py` — 3 TikTok gates.
- Install **Move #6.7** (Snap + Pinterest attribution audit, weekly): `scripts/snap_pinterest_attribution_audit.py` — 6 gates across Snap + Pinterest.
- Install **Move #6.8** (cross-platform drift rollup, weekly): `scripts/attribution_cross_platform_rollup.py` — 3 drift thresholds (D1 match-rate 3.0pp / D2 coverage 2.0pp / D3 multi-platform).
- **Canonical thresholds (do NOT loosen without documented reason):** Meta CAPI match ≥90%, Meta pixel coverage ≥95%, Google EC quality in {Good, Excellent} + email coverage ≥80%, GA4↔TW revenue delta ≤5%, Klaviyo↔TW cohort roundtrip ≥95%, week-over-week drift ≤5pp.
- Set up the unified attribution dashboard: `dashboards/unified-attribution-health.html` (Move #6.9) — single "what is my attribution health this week" view that loads all 4 JSON outputs.
- Document the cadence in your runbook: weekly Monday-morning 30-min slot.

**Verification:** All 4 audit scripts return `overall_passed: true` against the current week's JSON fixtures; Slack alerts are formatted per the canonical template; Linear ticket (if used) has the canonical shape.

## Common pitfalls (15 from real installs)

1. **Installing Triple Whale on a store doing <100 orders/mo** — gives low-confidence numbers the operator mistrusts → 30-day tool abandonment. **Fix:** below 100 orders/mo, use GA4 + Shopify Analytics only (Path E); below 500 orders/mo, use Polar at $49/mo (Path A).
2. **Pixel-only install (skipping CAPI)** — pixel is broken on Safari/iOS due to cookie blocking → 30–40% of attribution silently lost. **Fix:** Step 2 requires BOTH pixel AND CAPI green before you move on. If CAPI is broken, do not start campaigns on that ad account until it's fixed.
3. **CAPI dedup ratio >1.5** — pixel and CAPI are double-firing the same event → Meta's attribution overcounts → ad-platform optimization flies blind. **Fix:** share the same `event_id` between pixel (browser) and CAPI (server); verify via Meta Events Manager → Test Events that dedup ratio is in [0.85, 1.15].
4. **Post-purchase survey disabled** (the highest-value attribution signal is missing) → operator runs reports on 60–70% of attribution only. **Fix:** Step 3 is non-negotiable; verify the survey appears on a test order's "Thank you" page BEFORE moving to Step 4.
5. **Survey placed on a popup instead of "Thank you" page** — popup response rate is <5%; "Thank you" page is 30%+. **Fix:** place the survey on the post-purchase page only. If a custom post-purchase page (ReConvert, AfterSell) is in use, inject the survey via that app's settings, not the default Shopify page.
6. **Survey question customized to "Where did you FIRST hear about us?"** — the FIRST-hear framing halves response rate. **Fix:** use the default "How did you hear about us?" — operators who customize get lower response rates per Triple Whale 2025 benchmark data.
7. **Skipping Klaviyo integration** (Step 4 first bullet) → Move #1 / Move #4 / Move #7 flows don't appear as Triple Whale cohorts → cannot measure Move #14 lifecycle library ROI. **Fix:** Klaviyo integration is the foundation for Move #14 cohort analysis; ship it on Day 1.
8. **No cohort overlays on the dashboard** (Step 5 custom widgets skipped) → operator runs Triple Whale as a single channel-blended view → cannot tell which Move is doing the work. **Fix:** the 4 add-widgets in Step 5 are non-optional; Cohort LTV by Move is the canonical decision tool for Move #14 sequencing.
9. **Defaulting to last-click attribution** (Triple Whale Starter's default) — last-click is misleading in 2026 because the average DTC customer touches 7+ paid + organic channels before purchase per Triple Whale 2024 data. **Fix:** Settings → Attribution Model → Data-driven or Position-based (not Last-click).
10. **No attribution-health cadence (Step 6 skipped)** — drift creeps in over 30–90 days → operator doesn't notice until MER tanks → blames the ad platform instead of their own attribution. **Fix:** Step 6 + Move #6.5/6.6/6.7/6.8 weekly cadence is load-bearing; ship them in the same week as the install, not as a follow-up.
11. **Triple Whale Pro chosen under $50k/mo paid spend** — Pro is 7× Starter's price ($1,290 vs $179); the MMM and incrementality features only earn their premium above $50k/mo. **Fix:** Path C (Triple Whale Pro) only at $50k+/mo paid; Path B (Starter) is the default.
12. **GA4↔Triple Whale delta >5%** (revenue or order count) → indicates a measurement gap between the two sources → ad-platform optimization conflicts with Triple Whale's recommendations. **Fix:** investigate within 48 hours; common root causes are timezone mismatch, refund accounting, GA4 order-creation vs Triple Whale order-fulfillment divergence.
13. **Moby AI co-pilot used as a replacement for operator judgment** — Moby is a starting point for "what creative is working" but its recommendations are biased toward high-spend high-frequency ad sets. **Fix:** use Moby as one input among 4 (Triple Whale cohort LTV + GA4 channel blended + Klaviyo flow LTV + operator weekly review).
14. **Moving Shopify theme without re-installing the pixel** — many themes (Dawn, Sense, Prestige) ship without pixel hooks; if the operator upgrades the theme after install, Triple Whale's auto-installer doesn't always re-fire. **Fix:** add a quarterly theme-change check to Move #6.5 cadence — Step 1 verifies pixel + CAPI both green.
15. **Not reconciling Move #6 cohort LTV with Klaviyo cohort LTV** — Triple Whale and Klaviyo compute LTV with different windows (Triple Whale: order-date-anchored; Klaviyo: profile-creation-anchored). Operators compare across the two and conclude "Klaviyo says LTV is $50, Triple Whale says LTV is $80" → loss of trust in both. **Fix:** pick ONE source for canonical LTV (Triple Whale's order-anchored is the standard for paid-media decisions; Klaviyo's profile-anchored is the standard for retention-flow decisions) — document the choice in your runbook.

## Verification (this skill is "shipped" when...)

- [ ] Triple Whale (or Polar) dashboard loads with "Connected" green badge
- [ ] Pixel status = Active AND CAPI status = Active (both green)
- [ ] Test order placed via Bogus Gateway appears in Triple Whale "Live" tab within 10 minutes
- [ ] Post-purchase survey appears on the test order's "Thank you" page
- [ ] Survey response ("TikTok" or similar) is visible in the Triple Whale order detail within 5 minutes
- [ ] Meta CAPI event_id match rate ≥ 90% AND dedup ratio in [0.85, 1.15]
- [ ] Meta Pixel coverage ≥ 95% of expected pageviews
- [ ] Google Enhanced Conversions quality tier = Good or Excellent AND hashed-email coverage ≥ 80%
- [ ] GA4 ↔ Triple Whale revenue delta ≤ 5% in a 7-day window
- [ ] Klaviyo ↔ Triple Whale cohort roundtrip ≥ 95% match on ≥ 5 sample orders (case-insensitive)
- [ ] Klaviyo flows (Move #1 + Move #4 + Move #7) appear as distinct cohorts in Triple Whale cohort LTV widget
- [ ] Move #8 loyalty cohort appears in Triple Whale cohort LTV (conditional: loyalty program shipped)
- [ ] At least 3 of the 4 Step-5 dashboard widgets render with last-7-day data
- [ ] Move #6.5 attribution-quality-audit script runs end-to-end with `overall_passed: true`
- [ ] Move #6.6 TikTok-audit script runs end-to-end with `overall_passed: true` (conditional: TikTok spend >$1k/mo)
- [ ] Move #6.7 Snap+Pinterest-audit script runs end-to-end with `overall_passed: true` (conditional: Snap or Pinterest spend >$500/mo)
- [ ] Move #6.8 cross-platform-rollup script runs end-to-end with all 3 per-platform audits green
- [ ] Unified-attribution-health.html dashboard renders 5 sections in demo mode
- [ ] 7-day MER post-install is within ±5% of pre-install MER baseline (no measurement-system regression)
- [ ] Cohort LTV delta (Move #1 ON vs Move #1 OFF) is in expected range — for a Move #1 ship at 6+ weeks, the ON cohort should be ≥10% higher than the OFF cohort
- [ ] `/scripts/triple_whale_attribution_check.py` returns overall_passed: true (the canonical Move #6 verification script — single source of truth)
- [ ] Slack alert format matches the canonical template (Move #6.5 audit output → Slack message structure)
- [ ] Weekly cadence is documented in the runbook with a Slack/Linear reminder

## How to extend this skill

Once the basic install + 7-gate verification is live:
- Add **Move #6.5 attribution quality audit** (weekly cadence, 6 gates: Meta CAPI + Pixel, Google EC, GA4↔TW delta, Klaviyo↔TW roundtrip, week-over-week drift) — script at `scripts/attribution_quality_audit.py` + dashboard widget at `dashboards/unified-attribution-health.html`.
- Add **Move #6.6 TikTok attribution audit** (weekly cadence, 3 gates: EAPI match, Pixel coverage, Advanced Matching).
- Add **Move #6.7 Snap + Pinterest attribution audit** (weekly cadence, 6 gates across both platforms).
- Add **Move #6.8 cross-platform drift rollup** (weekly cadence, 3 drift thresholds across all 4 ad platforms).
- Add **Move #6.9 unified attribution dashboard** (`dashboards/unified-attribution-health.html` — single "what is my attribution health this week" view).
- Upgrade to **Triple Whale Pro** (Path C) above $50k/mo paid spend — unlocks MMM (media mix modeling) + incrementality testing + custom attribution windows.
- Add **Northbeam** (Path F, $1,500+/mo) above $10M+ paid spend — premium MTA with cross-platform view-through attribution for the largest brands.
- Add **Lifetimely** ($29–$99/mo) as a subscription-LTV overlay if Move #11 subscriptions is shipped — pair with Triple Whale, don't replace.
- Add **Peel** ($99–$499/mo) as a retention + LTV dashboard — solid mid-market alternative to Lifetimely.
- Wire Triple Whale cohort overlays into all downstream Moves: Move #14 (lifecycle flow library) cohort LTV comparison + Move #19 (SMS orchestration) SMS-cohort-LTV overlay + Move #20 (AI engine) rec-engaged cohort LTV overlay.

## Cross-references

- Companion skill: `welcome-series` (Move #4) — flows appear as Triple Whale cohorts once integration is live
- Companion skill: `abandoned-cart-recovery` (Move #1) — same flow → cohort relationship
- Companion skill: `sms-orchestration` (Move #19) — SMS-cohort-LTV overlay depends on Triple Whale SMS-source-merge
- Companion skill: `ai-product-recommendation-feed` (Move #20.2) — rec-engaged-cohort-LTV overlay is the Move #20.2 killer metric
- Companion skill: `ai-customer-service-automation` (Move #20.1) — AI-deflection-cohort-LTV vs human-resolved depends on Triple Whale cohort segmentation
- Companion skill: `ai-ad-creative-iteration` (Move #10) — Triple Whale is the prerequisite for AI creative testing (Pitfall #1 in Move #10)
- Companion skill: `pdp-ab-testing-program` (Move #9.5) — cohort-LTV overlay check (Pitfall #5 in Move #9.5) requires Triple Whale
- Companion skill: `loyalty-program` (Move #8) — loyalty cohort LTV depends on Triple Whale Klaviyo integration
- Companion skill: `subscription-replenishment` (Move #11) — subscription LTV overlay depends on Triple Whale subscription tracking
- Companion skill: `mobile-pdp-redesign` (Move #9) — pre/post CVR delta measured via Triple Whale cohort overlay
- Companion skill: `lifecycle-flow-library` (Move #14) — 20-flow library ROI depends on Triple Whale cohort-level LTV comparison
- Research doc: `/research/01-tools-stack-comparison.md` (Triple Whale / Polar / Northbeam / Lifetimely / Peel comparison)
- Research doc: `/research/00-ecommerce-ops-landscape.md` (post-iOS14.5 + cookie deprecation attribution context)
- Playbook: `/playbooks/06-install-attribution-triplewhale-or-polar.md` (the canonical operator-build playbook this skill summarizes)
- Playbook: `/playbooks/06.5-attribution-quality-audit.md` (Move #6.5 weekly cadence)
- Playbook: `/playbooks/06.6-tiktok-attribution-quality-audit.md` (Move #6.6)
- Playbook: `/playbooks/06.7-snap-pinterest-attribution-quality-audit.md` (Move #6.7)
- Playbook: `/playbooks/06.8-cross-platform-attribution-drift-unification.md` (Move #6.8)
- Playbook: `/playbooks/06.10-attribution-health-alert-webhook-launch.md` (Move #6.10)
- Script: `/scripts/triple_whale_attribution_check.py` (canonical Move #6 verification — single source of truth)
- Script: `/scripts/attribution_quality_audit.py` (Move #6.5 weekly cadence)
- Script: `/scripts/tiktok_attribution_audit.py` (Move #6.6)
- Script: `/scripts/snap_pinterest_attribution_audit.py` (Move #6.7)
- Script: `/scripts/attribution_cross_platform_rollup.py` (Move #6.8)
- Script: `/scripts/attribution_health_alert_webhook.py` (Move #6.10)
- Dashboard: `/dashboards/unified-attribution-health.html` (Move #6.9 unified view)
- Test file: `/scripts/tests/test_triple_whale_attribution_check.py` (49 TDD tests for the canonical Move #6 verification script)

## Sources

- Triple Whale, "State of attribution 2024" (post-iOS14.5 + cookie deprecation benchmark data — 30–40% attribution recovery from post-purchase survey vs pixel-only)
- Triple Whale, "Pricing & tiers 2026" (Starter $179/mo / Pro $1,290/mo list rates; verify on vendor site before budgeting)
- Polar Analytics, "Pricing & integrations 2026" (Starter $49/mo / Pro $299/mo; WooCommerce + BigCommerce + headless support)
- Northbeam, "Cross-channel attribution 2026" ($1,500+/mo; view-through attribution; worth the premium above $3M/yr paid spend)
- Lifetimely, "Subscription LTV forecasting 2024" ($29–$99/mo; cohort LTV for subscription brands)
- Peel, "Retention + LTV dashboards 2024" ($99–$499/mo; mid-market retention + LTV)
- GA4, "Measurement protocol 2024" (cookie-based attribution is incomplete post-Safari ITP / Firefox ETP; GA4 alone misses ~30–40% of paid attribution per Triple Whale 2025 benchmark)
- Meta Conversions API, "Server-side event dedup 2024" (`event_id` dedup contract — pixel + CAPI share the same id to count as one event)
- Google Ads Enhanced Conversions, "Hashed-email match quality 2024" (Good/Excellent quality tiers; ≥80% hashed-email coverage for canonical Move #6.5 Gate D)
- Klaviyo, "Flow performance attribution 2024" (Triple Whale ↔ Klaviyo cohort roundtrip integration; segments built on Triple Whale attribution for Move #8 loyalty cohort targeting)
- Shopify, "Pixel + CAPI install guide 2026" (theme.liquid paste path; app-store auto-install path)
- Moby AI (Triple Whale's co-pilot), "AI creative recommendations 2024" (starting-point bias toward high-spend high-frequency ad sets — use as 1 of 4 inputs)
- Moz, "Local + organic attribution 2024" (post-iOS14.5 attribution context; dark social + UGC attribution recovery via post-purchase survey)
