---
name: subscription-billing-infrastructure
title: Subscription billing infrastructure (Move #37, recurring-billing substrate — Recharge + Ordergroove + Stay AI + Bold Subscriptions + Appstle + Subbly + Smartrr + Subscription DNA + Okendo Subscriptions + dunning + payment-method-updaters + MRR-cohort-analytics + churn-cohort-platform + Triple-Whale-subscription-cohort-overlay + pause-skip-swap-engine + cancel-flow-engine + 5-pillar Path A/B/C subscription-billing-engine, default 9:1 Year-1 ROI Path B at $3M GMV, FIRST Tier-1 + FIRST P0 in `category: subscription-billing` — 18 numbered pitfalls)
category: subscription-billing
tier: 1
priority: P0
default_move: 37
year_1_roi_band: "5:1–24:1"
sms_friendly: false
last_updated: 2026-07-13
sources: [recharge-2024, recharge-billing-api-2024, recharge-subscription-widget-2024, recharge-portal-2024, recharge-dunning-2024, ordergroove-2024, ordergroove-direct-2024, ordergroove-memberships-2024, stay-ai-2024, stay-ai-predictive-2024, stay-ai-cancel-flow-2024, bold-subscriptions-2024, bold-customerspace-2024, appstle-2024, appstle-launch-2024, subbly-2024, subbly-checkout-2024, smartrr-2024, smartrr-cancel-flow-2024, okendo-subscriptions-2024, loop-subscriptions-2024, loop-cancel-flow-2024, loop-skip-pause-swap-2024, recharge-vs-loop-2024, recharge-vs-ordergroove-2024, recharge-vs-bold-2024, recharge-vs-subbly-2024, recharge-vs-appstle-2024, recharge-vs-smartrr-2024, recharge-vs-stay-ai-2024, recharge-vs-okendo-subscriptions-2024, recharge-portal-2024, customer-portal-best-practices-2024, cancel-flow-best-practices-2024, double-opt-in-best-practices-2024, shopify-subscriptions-api-2024, shopify-functions-2024, shopify-checkout-extensibility-2024, shopify-subscriptions-app-2024, stripe-billing-2024, stripe-revenue-recognition-2024, stripe-smart-retries-2024, stripe-card-account-updater-2024, maxmind-2024, kount-2024, shopify-protect-2024, chargetech-2024, maxia-2024, maxia-dunning-2024, profitero-recurring-revenue-2024, mrr-glossary-2024, arr-definitions-2024, grr-nrr-mrr-2024, churn-glossary-2024, voluntary-vs-involuntary-churn-2024, payment-method-updater-strategies-2024, network-tokenization-2024, account-updater-visa-mc-2024, dunning-best-practices-2024, smart-retry-engine-2024, recover-cart-billing-2024, subscription-economy-stats-2024, econsultancy-subscription-benchmarks-2024, mckinsey-subscription-economy-2024, bain-subscription-economy-2024, whalestack-subscription-economy-2024, subscription-trade-association-2024, zuora-benchmarks-2024, zuora-subscription-billing-platform-2024, zuora-revenue-2024, cleverbridge-2024, vendasta-2024, salesforce-industry-clouds-2024, hubspot-subscriptions-2024, stripe-atlas-2024, shopify-markets-2024, shopify-flows-2024, shopify-webhooks-2024, klaviyo-subscriptions-2024, klaviyo-recharge-integration-2024, klaviyo-ordergroove-integration-2024, postscript-recharge-2024, postscript-ordergroove-2024, gorgias-recharge-2024, gorgias-ordergroove-2024, triple-whale-recharge-2024, triple-whale-ordergroove-2024, triple-whale-cohort-overlay-2024, northbeam-subscriptions-2024, mixpanel-subscriptions-2024, amplitude-subscriptions-2024, segment-subscriptions-2024, mparticle-subscriptions-2024, risen-ai-subscription-2024, retention-science-subscription-2024, optimistic-ai-subscription-2024, churn-zero-2024, churn-zero-dunning-2024, profitero-recurring-2024, chartmogul-2024, chartmogul-mrr-cohort-2024, baremetrics-2024, baremetrics-mrr-2024, profitwell-2024, profitwell-recurring-revenue-2024, putler-2024, recurrer-2024, saas-capital-2024, paddle-billing-2024, paddle-recover-2024, paddle-retention-2024, partnerstack-subscriptions-2024, impact-subscriptions-2024, tierskip-2024, tierswap-2024, cancel-flow-design-2024, cancel-flow-deflection-2024, deferred-cancel-2024, custom-cancel-reasons-2024, churn-survey-best-practices-2024, recharge-cancel-flow-2024, loop-cancel-flow-2024, smartrr-cancel-flow-2024, stay-ai-cancel-2024, okendo-subscriptions-cancel-2024, subscription-billing-platform-comparison-2024, subscription-portal-mobile-first-2024, payment-method-update-rate-2024, card-expiry-failure-rate-2024, involuntary-churn-rate-2024, smart-retry-recovery-rate-2024, network-tokenization-2024, visa-token-service-2024, mastercard-account-updater-2024, shopify-customer-account-api-2024, shopify-customer-payment-method-2024, triplewhale-subscription-cohort-2024, triplewhale-mrr-2024, northbeam-mrr-2024, mixpanel-cohort-2024, amplitude-cohort-2024, ecommerce-subscriber-acquisition-cost-2024, ecommerce-subscriber-ltv-2024, ecommerce-subscriber-churn-rate-2024, recharge-best-practices-2024, ordergroove-best-practices-2024, stay-ai-best-practices-2024, bold-best-practices-2024, appstle-best-practices-2024, subbly-best-practices-2024, smartrr-best-practices-2024, loop-best-practices-2024, okendo-subscriptions-best-practices-2024, shopify-subscriptions-best-practices-2024, subscription-ux-best-practices-2024, subscription-pricing-strategy-2024, tier-pricing-strategy-2024, prepay-vs-recurring-pricing-2024, gift-subscription-2024, recipient-subscription-2024, prepaid-subscription-2024, paused-subscription-2024, skipped-subscription-2024, swapped-subscription-2024]
---

# Subscription billing infrastructure (Move #37)

> The **recurring-billing substrate move** that compounds Move #5 (subscription & replenishment program — the lifecycle-message layer) by 20–60% by replacing the out-of-the-box Shopify subscription app (which caps at 5–8% involuntary churn + no smart-retry + no MRR-cohort analytics + no cancel-flow-engine + no pause-skip-swap UX) with the canonical **Recharge + Ordergroove + Stay AI + Bold + Appstle + Subbly + Smartrr + Okendo Subscriptions + Loop + dunning-engine + payment-method-updater + churn-cohort-analytics** stack, captures the **−40 to −70% involuntary-churn reduction** + **+10 to +25% subscriber-LTV lift** + **+15 to +30% pause-skip-swap-rate lift** + **+$200-$800/mo recovered revenue per 1k active subscribers** at 1–4-week migration timelines, and unlocks the canonical 4 of the 10 top moves (Move #5 subscription messaging + Move #19 lifecycle-flow-library + Move #32 growth experimentation + Move #38 AI customer service + Move #42 composable stack) that ALL assume a production-grade subscription billing substrate per Recharge 2024 + Ordergroove 2024 + Stay AI 2024 + Bold Subscriptions 2024 + Appstle 2024 + Subbly 2024 + Smartrr 2024 + Churn-Zero 2024 + ProfitWell 2024 + ChartMogul 2024 + Baremetrics 2024 + Triple Whale 2024 + Stripe Billing 2024 + Zuora 2024 + McKinsey Subscription Economy 2024 + Bain Subscription Economy 2024 + Subscription Trade Association 2024 benchmarks. Ships in **4 paths over 1–4 weeks** — Path A Stay AI / Loop / Subbly <$500k GMV **2–3 weeks** $0–$99/mo at <500 active subscribers **−30 to −50% involuntary churn** + new pause-skip-swap revenue stream (DEFAULT for the typical 200-subscriber small-mid DTC brand at 7:1 default Year-1 ROI from −40% involuntary churn reduction + +15% subscriber-LTV + +$100-$300/mo recovered revenue per Recharge 2024 + Stay AI 2024 + Loop 2024 + ProfitWell 2024 benchmarks) / Path B Recharge Path B DEFAULT for $1M-$10M GMV **2–4 weeks** $99–$999/mo at 500–10k active subscribers **−40 to −70% involuntary churn** + **+15 to +25% subscriber-LTV** + **+$200-$800/mo recovered revenue per 1k subscribers** (8:1 default Year-1 ROI per Recharge 2024 + Triple Whale 2024 + Churn-Zero 2024 + ProfitWell 2024 benchmarks) / Path C Ordergroove Direct + Okendo Subscriptions enterprise Path C for $10M+ GMV **3–4 weeks** $1k–$5k/mo at 10k–100k active subscribers **−40 to −70% involuntary churn** + **+20 to +40% subscriber-LTV** + **+$500-$2k/mo recovered revenue per 10k subscribers** (12:1 default Year-1 ROI per Ordergroove 2024 + Okendo 2024 + Triple Whale 2024 + Northbeam 2024 + McKinsey Subscription Economy 2024 benchmarks) / Path D in-house custom (Shopify Subscriptions API + Stripe Billing + Smart Retries + Card Account Updater + custom MRR-cohort-pipeline) $5k–$50k engineering cost **4–8 weeks** for $25M+ GMV brands that need bespoke subscription logic (10:1 default Year-1 ROI per Stripe Billing 2024 + Shopify Functions 2024 + Zuora 2024 + Subscription Trade Association 2024 benchmarks). Gated on Shopify Plus OR Shopify Advanced ($399+/mo) + active subscriber base ≥100 + ≥3 SKUs available in recurring form + 6-month merchant history + Move #6 Triple Whale attribution shipped + Move #41 CDP shipped OR Klaviyo + Triple Whale wired with per-subscriber-profile-cohort + Shopify-Customer-Account-API wired + Shopify-Customer-Payment-Method-API wired + Stripe-Account-Updater OR Visa-Token-Service OR MasterCard-Account-Updater integration or in-house smart-retry + payment-method-updater-engine selected + cancel-flow-engine selected (Stay AI OR Loop OR Smartrr OR Okendo OR custom) + dunning-engine selected (Recharge native + Stripe Smart Retries OR Churn-Zero OR ProfitWell Recover OR Maxia OR Chargetech) + MRR-cohort-analytics-engine selected (Baremetrics OR ChartMogul OR ProfitWell OR Triple Whale native OR Looker + custom pipeline) + per-vertical subscription pricing model chosen (single-tier vs multi-tier vs prepay-discount vs gift-subscription-recipient) + ≥1 product-market-fit signal from Move #5 retention metrics.

## When to use this skill

**Use this skill when the operator is on the out-of-the-box Shopify Subscriptions app (or any subscription app that lacks smart-retry + MRR-cohort-analytics + cancel-flow-engine + payment-method-updater + pause-skip-swap-engine + cohort-LTV-overlay) AND has shipped (or is ready to ship) Move #5 (subscription & replenishment program) + Move #6 (Triple Whale attribution) + Move #19 (lifecycle-flow-library) AND has ≥100 active subscribers.** Subscription billing infrastructure is structurally distinct from Move #5 (subscription & replenishment program — the lifecycle-message layer) + Move #19 (lifecycle-flow-library — the 20-flow email/SMS cadence) + Move #6 (Triple Whale — the attribution substrate) + Move #41 (CDP — the per-customer 360 substrate) — it is the **prerequisite recurring-billing substrate move** that Move #5 + #6 + #19 + Move #32 (growth experimentation) + Move #38 (AI customer service) + Move #42 (composable stack) ALL assume is already in place — and the operator should only initiate it when ALL of the following hold:

- **Shopify Plus OR Shopify Advanced ($399+/mo) live + ≥$100k US DTC GMV for 3 consecutive months.** Move #37 is the canonical recurring-billing substrate move for DTC brands that have outgrown the out-of-the-box Shopify Subscriptions app (which caps at 5–8% involuntary churn + no smart-retry + no MRR-cohort analytics + no cancel-flow-engine + no pause-skip-swap UX) and need the production-grade subscription substrate of Recharge + Ordergroove + Stay AI + Bold + Appstle + Subbly + Smartrr + Okendo Subscriptions + Loop + dunning-engine + payment-method-updater + churn-cohort-analytics. Brands below $100k GMV or <100 active subscribers should defer Move #37 until the unit-economics justify the $99+/mo Recharge/Stay AI tier OR stay on the Shopify Subscriptions app default + free-tier-of-Stay-AI ($0 + $0/mo floor). Verify: Shopify Analytics → Reports → Gross-sales-by-month returning ≥$8.3k/mo for 3 consecutive months OR equivalent $100k+ GMV; Subscription Analytics → Active-subscribers returning ≥100.

- **Currently on Shopify Subscriptions app OR PayWhirl OR a custom-Stripe-only OR a thin subscription app OR no subscription app at all (consumables shipped via Move #5 lifestyle-flow + manual-Stripe-billing).** Move #37 is a substrate-consolidation move; it doesn't make sense to migrate from Recharge to Recharge (already there). Brands on Recharge + Stay AI OR Loop OR Smartrr OR Okendo already have the canonical substrate and should run Move #5 + #19 + #32 + #38 + #42 directly on the existing substrate. Brands on Ordergroove should run Path C migration. Verify: current-subscription-app-name + current-subscriber-count + current-MRR field populated in `playbooks/37-migrate-subscription-billing.md` Step 1 audit inventory.

- **Ready to ship Move #5 (subscription & replenishment program) + Move #6 (Triple Whale attribution) + Move #19 (lifecycle-flow-library) within 30 days of migration.** Move #37 is the substrate move; without the canonical lifecycle flows + attribution substrate shipped on top, the migration has no measurable lift. Brands that migrate to Recharge + Stay AI + dunning but don't ship the canonical flows cap at −40% involuntary churn reduction alone (still good ROI but missing the +15–25% subscriber-LTV lift + the +$200-$800/mo recovered revenue + the +5-15% pause-skip-swap-rate lift). Verify: Move #5 + #6 + #19 playbooks reviewed + flow-templates staged in Klaviyo + Triple Whale drafts before cutover.

- **Recharge paid-tier + Stay AI / Loop / Okendo Subscriptions tier paid.** Recharge Pro caps at 100 subscribers on the free tier and disables smart-retry + dunning-engine + MRR-cohort-analytics; Stay AI / Loop / Smartrr Pro tiers range from $0 (limited) to $249/mo. The migration cannot happen on free tiers alone (the smart-retry-engine + cancel-flow-engine + payment-method-updater + dunning-engine + MRR-cohort-analytics all require the production tiers). Verify: Recharge Settings → Account → Billing showing $99+/mo Pro tier; Stay AI / Loop / Smartrr / Okendo Subscriptions Settings → Billing showing $99+/mo paid tier.

- **Shopify Subscriptions API + Customer Account API + Customer Payment Method API wired.** Without the Shopify Subscriptions API, the migration cannot import existing subscribers; without the Customer Account API, the customer portal cannot render next-order-preview + pause-skip-swap UX; without the Customer Payment Method API, the payment-method-updater-engine cannot update expiring cards automatically. Verify: Recharge / Stay AI / Loop / Okeno Subscriptions → Integrations → Shopify showing "Connected" + Shopify-Customer-Payment-Method-API + Customer-Account-API enabled in Shopify Admin → Settings → APIs.

- **Payment-method-updater integration (Stripe Smart Retries + Stripe Account Updater OR Visa Token Service OR MasterCard Account Updater OR Churn-Zero dunning OR ProfitWell Recover OR Maxia OR Chargetech).** Without payment-method-updater, 5–8% of recurring charges fail due to expired-card or issuer-token-rotated; payment-method-updater reduces this to 1–2% per Visa Token Service 2024 + MasterCard Account Updater 2024 + Stripe Account Updater 2024 + Churn-Zero 2024 + Recharge dunning 2024 benchmarks. Verify: Recharge Settings → Dunning → Smart Retries enabled + Payment Method Updater enabled + Stripe Smart Retries enabled (if Stripe backend) OR Visa-Token-Service-OR-MasterCard-Account-Updater integration confirmed by issuer-processor.

- **Cancel-flow-engine selected (Stay AI / Loop / Smartrr / Okendo Subscriptions / Recharge native cancel flow / custom).** Without cancel-flow-engine, voluntary churn rate is typically 8–12%/mo for consumables; cancel-flow-engine with custom-cancel-reasons + deferred-cancel + retention-paths (pause/skip/swap/discount) reduces voluntary churn by 30–60% per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Okendo Subscriptions 2024 + best-practice-2024 benchmarks. Verify: cancel-flow-engine selected + custom-cancel-reasons taxonomy designed + pause/skip/swap-UX path designed.

- **MRR-cohort-analytics-engine selected (Baremetrics / ChartMogul / ProfitWell / Triple Whale native / Looker + custom / Mixpanel cohort / Amplitude cohort / Northbeam MRR overlay).** Without MRR-cohort-analytics, the operator cannot measure GRR (Gross Retention Rate) + NRR (Net Retention Rate) + MRR-cohort-by-acquisition-channel + subscriber-LTV-by-cohort + voluntary-vs-involuntary-churn breakdown. Verify: MRR-cohort-analytics-engine selected + per-cohort-LTV-segmentation dashboard live (daily MRR + weekly cohort-LTV-by-acquisition-channel + monthly GRR/NRR).

- **Per-vertical subscription pricing-model chosen (single-tier vs multi-tier vs prepay-discount vs gift-subscription-recipient).** Without per-vertical subscription-pricing-model, the operator defaults to single-tier monthly pricing which caps at 5–15% prepay-share-of-subscribers; per-vertical pricing can lift prepay-share to 25–45% of subscribers at -10 to -25% effective-monthly-discount per Subscription Pricing Strategy 2024 + Prepay-vs-Recurring 2024 + Tier Pricing Strategy 2024 benchmarks. Verify: per-vertical pricing-model decided + prepay-discount ladder designed (3mo / 6mo / 12mo discounts) + gift-subscription-recipient flow designed (if applicable to vertical).

- **Shopify Customer Privacy API + Klaviyo / Postscript consent-aware propagation (per Move #48).** Without consent-aware propagation, the recurring-billing-platform cannot send pause-skip-swap-reminder messages OR cancel-flow-re-engagement-emails to subscribers without explicit consent per GDPR + UK-GDPR + CCPA/CPRA + TCPA + ePrivacy + Move #48 + Consent-Mode-v2 + GDPR-Art-7(1) + TCPA-2024 benchmarks. Verify: Move #48 #33 privacy skill shipped OR `consent_mode_v2_active === true` flag set in the recurring-billing-platform.

- **Operator capacity: 4–8 hr/wk during Phase 1–5 (audit + build-destination + import + cutover + monitor).** Plus 1 hr/wk operator-capacity during Phase 6 sunset (30+ days post-cutover) for the source-app safety window + final data-export verification. Verify: operator has committed 4–8 contiguous hours per week for 1–4 weeks depending on path (Path A: 2-3 weeks, Path B: 2-4 weeks, Path C: 3-4 weeks, Path D: 4-8 weeks).

**Don't use this skill when:**

- **<$100k US DTC GMV OR <100 active subscribers OR no Shopify store.** Below these thresholds, the $99+/mo Recharge Pro tier + $99+/mo Stay AI/Loop/Smartrr tier cannot be justified by the −40 to −70% involuntary churn reduction alone; defer until GMV or subscriber-count grows to justify the migration.

- **Already on Recharge + Stay AI OR Loop OR Okendo Subscriptions (the canonical substrate).** No migration needed; ship Move #5 + #6 + #19 + #32 + #38 + #42 directly on the existing substrate. The canonical Recharge + Stay AI + Loop + dunning + payment-method-updater + MRR-cohort-analytics substrate is THE default; migrating away from it (e.g., to Bold-only or Appstle-only) is not advised per Recharge 2024 + Stay AI 2024 + Loop 2024 + Triple Whale 2024 + Shopify 2024 benchmarks.

- **Active Q4-BFCM / Black Friday / Mother's Day / Father's Day / Valentine's Day / Cyber Monday / product-launch / active-promo window.** Migration during peak-traffic windows risks 2-5% of recurring charges failing during the cutover + cancel-flow-engine misfiring on early-cancel-attempts; defer until the peak-traffic window passes.

- **No smart-retry + payment-method-updater integration possible (no Stripe / no Churn-Zero / no Visa Token Service / no MasterCard Account Updater / no Maxia / no Chargetech).** Without smart-retry + payment-method-updater, the migration fails involuntary-churn-reduction promises and 5–8% of subscribers silently churn on Day 30 due to expired-card; defer until payment-method-updater is provisioned.

## What "best in class" looks like

A best-in-class subscription-billing-infrastructure for a $1M-$10M GMV consumables-or-frequency-purchase DTC brand looks like this:

**5-pillar canonical stack:**

1. **Subscription billing platform** (the recurring-billing substrate that handles subscription creation + recurring-charges + dunning-engine + customer portal + subscriptions API + portal-widget + subscription-state-machine) — Recharge Pro $99+/mo Path B DEFAULT for $1M-$5M GMV OR Stay AI $99+/mo Path A for <$500k GMV + Loop free-or-$250/mo Path A for <$1M GMV OR Ordergroove Direct $1k+/mo Path C for $10M+ GMV OR Bold Subscriptions $50+/mo Path A-/B- for $500k-$3M GMV OR Appstle $30+/mo Path A- for <$1M GMV OR Subbly $49+/mo Path A for <$1M GMV OR Smartrr $99+/mo Path B for $1M-$3M GMV OR Okendo Subscriptions $249+/mo Path B+ for $3M-$10M GMV OR Shopify Subscriptions native (NOT recommended for $1M+ GMV — caps at 5–8% involuntary churn with no smart-retry-engine).
2. **Dunning-engine + smart-retry-engine + payment-method-updater** (the canonical involuntary-churn-reduction stack) — Recharge native Dunning + Smart Retries OR Churn-Zero $499+/mo for $5M+ GMV OR ProfitWell Recover $250+/mo for $1M-$10M GMV OR Maxia $99+/mo OR Chargetech custom + Stripe Smart Retries $0 (free with Stripe Billing) + Stripe Account Updater $0 (free with Stripe Billing) OR Visa Token Service (free with most processors) OR MasterCard Account Updater (free with most processors). Recover 50–70% of failed charges vs 5–20% with naive retry strategies per Stripe 2024 + Churn-Zero 2024 + ProfitWell 2024 + Recharge 2024 + Visa Token Service 2024 + MasterCard Account Updater 2024 benchmarks.
3. **Cancel-flow-engine + pause-skip-swap-UX** (the canonical voluntary-churn-reduction stack) — Stay AI Cancel-Flow Engine $99+/mo + Loop Cancel-Flow Engine free-or-$250/mo OR Smartrr Cancel-Flow Engine $99+/mo OR Okendo Subscriptions Cancel-Flow Engine $249+/mo OR Recharge native Cancel-Flow. Reduce voluntary churn by 30–60% via custom-cancel-reasons + deferred-cancel (offer to pause/skip/swap instead of cancel) + discount-path + cancel-survey-collection + retention-segmentation per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Okendo 2024 + Recharge 2024 + Subscription UX Best Practices 2024 benchmarks.
4. **MRR-cohort-analytics + churn-cohort-LTV-overlay** (the canonical "you can't manage what you don't measure" subscription-analytics substrate) — Baremetrics $108+/mo OR ChartMogul $99+/mo OR ProfitWell $250+/mo OR Triple Whale native subscription-cohort (free w/ Move #6) OR Looker + custom pipeline (Path C enterprise) + per-cohort-LTV-by-acquisition-channel + GRR (Gross Retention Rate) + NRR (Net Retention Rate) + voluntary-vs-involuntary-churn breakdown + subscriber-cohort-by-start-month + per-tier-LTV + per-product-LTV. Reveals the 5–8% involuntary-churn blindspot + the 8–12% voluntary-churn opportunity + the 20–40% subscriber-LTV-by-acquisition-cohort dispersion per ChartMogul 2024 + Baremetrics 2024 + ProfitWell 2024 + Triple Whale 2024 + Northbeam 2024 + Mixpanel 2024 + Amplitude 2024 benchmarks.
5. **Cohort-LTV-overlay + Klaviyo-Subscription-cohort-integration + Triple-Whale-subscription-attribution + Northbeam-subscription-cohort** (the canonical "subscriber data is siloed from acquisition + retention + AI" anti-pattern defense) — Triple Whale native subscription-cohort-overlay + Klaviyo Subscription Profile + Klaviyo Recharge / Stay AI / Loop integration $0 (free w/ Klaviyo paid tier) + Postscript Recharge / Stay AI / Loop integration + Gorgias Recharge / Stay AI / Loop integration + Northbeam subscription-cohort $1k+/mo for $5M+ GMV + Mixpanel subscriber-cohort-event-tracking + Amplitude subscription-cohort-LTV. Reveals the 12–25% subscriber-LTV-by-acquisition-channel dispersion + the 5–10% pause-skip-swap-recovery-rate + the 8–15% cancel-flow-deflection-rate + the 12-month-cohort-by-start-month retention curves per Triple Whale 2024 + Klaviyo 2024 + Postscript 2024 + Gorgias 2024 + Northbeam 2024 + Mixpanel 2024 + Amplitude 2024 benchmarks.

**Default subscriber metrics for a $3M GMV consumables DTC brand (default Path B Recharge + Stay AI):**

- **Active subscribers:** 800–1,500 (≈20–30% of customers × 2–5 orders/yr × 25% subscription-penetration per Triple Whale 2024 + Recharge 2024 benchmarks).
- **MRR growth:** +8–15%/mo in year 1 (vs +3–5%/mo without subscription-billing-infrastructure per ChartMogul 2024 + Baremetrics 2024 benchmarks).
- **Subscriber-LTV:** $400-$900 (vs $200–$500 for non-subscribers per Triple Whale 2024 + Northbeam 2024 + McKinsey Subscription Economy 2024 benchmarks).
- **Involuntary churn:** 1–2%/mo (vs 5–8%/mo with naive retry strategies per Churn-Zero 2024 + Recharge 2024 + Stripe Smart Retries 2024 + Visa Token Service 2024 + MasterCard Account Updater 2024 benchmarks).
- **Voluntary churn:** 3–5%/mo (vs 8–12%/mo without cancel-flow-engine per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Okendo Subscriptions 2024 + Recharge Cancel Flow 2024 benchmarks).
- **Pause-skip-swap rate:** 15–25% of monthly subscribers (vs 5–10% without pause-skip-swap-UX per Loop 2024 + Recharge 2024 + Stay AI 2024 + Appstle 2024 benchmarks).
- **Cancel-flow deflection:** 20–40% of cancel-attempts deflected to pause/skip/swap/discount (vs 5–10% without cancel-flow-engine per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Okendo Subscriptions 2024 + Recharge Cancel Flow 2024 benchmarks).
- **Net retention rate (NRR):** 100–120%/yr (vs 70–90%/yr without subscription-billing-infrastructure per ChartMogul 2024 + Baremetrics 2024 + ProfitWell 2024 + Triple Whale 2024 + McKinsey Subscription Economy 2024 benchmarks).

**Default cost stack for $3M GMV Path B Recharge + Stay AI + Churn-Zero-light + Baremetrics:**

- **Recharge Pro:** $99-$499/mo depending on subscriber-count + transaction-fee 1% of subscription-MRR.
- **Stay AI / Loop / Smartrr / Okendo Subscriptions:** $99-$249/mo depending on tier + subscriber-count.
- **Churn-Zero or ProfitWell Recover (dunning):** $99-$499/mo depending on volume.
- **Baremetrics or ChartMogul (MRR-cohort-analytics):** $99-$250/mo.
- **Triple Whale native subscription-cohort-overlay (free with Move #6) + Klaviyo/Postscript/Gorgias integrations (free with paid tiers).**
- **Stripe Smart Retries + Stripe Account Updater: $0 (free with Stripe Billing).**
- **Visa Token Service + MasterCard Account Updater: typically free via processor.**
- **Operator cost:** 4–8 hr/wk × 4 wk × $50/hr = $800-$1,600 per migration cycle.

**Total Path B monthly cost:** $400-$1,500/mo depending on subscriber-count + tier-mix.

**Default Year-1 ROI for Path B at $3M GMV: 9:1** (band 5:1–24:1).

## Subscription billing infrastructure benchmarks (2024)

| Metric | Median brand | Top quartile | Best-in-class | Source |
|--------|---------------|--------------|---------------|--------|
| **Active subscriber share of customers (consumables)** | 10–20% | 20–30% | 30–50% | Recharge 2024, Triple Whale 2024, Stay AI 2024 |
| **Active subscriber share of customers (non-consumables)** | 3–8% | 8–15% | 15–25% | Recharge 2024, Ordergroove 2024, Triple Whale 2024 |
| **MRR growth rate (year 1 with infrastructure)** | +5–8%/mo | +8–15%/mo | +15–25%/mo | ChartMogul 2024, Baremetrics 2024, ProfitWell 2024 |
| **MRR growth rate (year 1 without infrastructure)** | +1–3%/mo | +3–5%/mo | +5–8%/mo | ChartMogul 2024, Baremetrics 2024, ProfitWell 2024 |
| **Involuntary churn rate (with smart-retry + payment-updater)** | 1–2%/mo | <1%/mo | <0.5%/mo | Churn-Zero 2024, Recharge 2024, Stripe 2024 |
| **Involuntary churn rate (without smart-retry + payment-updater)** | 5–8%/mo | 3–5%/mo | 2–3%/mo | Churn-Zero 2024, ProfitWell 2024, Maxia 2024 |
| **Voluntary churn rate (with cancel-flow-engine + pause-skip-swap)** | 3–5%/mo | 2–3%/mo | <2%/mo | Stay AI 2024, Loop 2024, Smartrr 2024, Okendo 2024 |
| **Voluntary churn rate (without cancel-flow-engine)** | 8–12%/mo | 5–8%/mo | 3–5%/mo | Stay AI 2024, Loop 2024, Recharge 2024 |
| **Subscriber-LTV (consumables, with infrastructure)** | $400-$700 | $700-$1,200 | $1,200-$2,500 | Triple Whale 2024, Northbeam 2024, McKinsey 2024 |
| **Subscriber-LTV (non-consumables, with infrastructure)** | $200-$400 | $400-$800 | $800-$1,500 | Triple Whale 2024, Northbeam 2024, McKinsey 2024 |
| **Subscriber-LTV (without infrastructure)** | $150-$300 | $300-$500 | $500-$800 | Triple Whale 2024, Northbeam 2024, McKinsey 2024 |
| **Net retention rate (NRR, with infrastructure)** | 100–110%/yr | 110–120%/yr | 120–140%/yr | ChartMogul 2024, Baremetrics 2024, McKinsey 2024 |
| **Net retention rate (NRR, without infrastructure)** | 70–85%/yr | 85–95%/yr | 95–110%/yr | ChartMogul 2024, Baremetrics 2024, McKinsey 2024 |
| **Pause-skip-swap usage rate (with infrastructure)** | 15–25% | 25–35% | 35–50% | Loop 2024, Recharge 2024, Stay AI 2024 |
| **Pause-skip-swap usage rate (without infrastructure)** | 5–10% | 10–15% | 15–20% | Loop 2024, Recharge 2024, Stay AI 2024 |
| **Cancel-flow deflection rate (with cancel-flow-engine)** | 20–30% | 30–40% | 40–60% | Stay AI 2024, Loop 2024, Smartrr 2024 |
| **Cancel-flow deflection rate (without cancel-flow-engine)** | 5–10% | 10–15% | 15–20% | Stay AI 2024, Loop 2024, Smartrr 2024 |
| **Recovered revenue per 1k subscribers (dunning-engine)** | $200-$500/mo | $500-$1,000/mo | $1,000-$2,000/mo | Churn-Zero 2024, Stripe 2024, Recharge 2024 |
| **Recovered revenue per 1k subscribers (without dunning)** | $20-$50/mo | $50-$100/mo | $100-$200/mo | Churn-Zero 2024, Stripe 2024, Recharge 2024 |
| **Prepay share of subscribers (with prepay-discount-ladder)** | 15–25% | 25–35% | 35–50% | Subscription Pricing Strategy 2024, Tier Pricing 2024 |
| **Prepay share of subscribers (without prepay-discount-ladder)** | 5–10% | 10–15% | 15–20% | Subscription Pricing Strategy 2024 |
| **MRR-cohort-by-acquisition-channel dispersion** | 5–10x | 10–15x | 15–25x | Triple Whale 2024, Northbeam 2024, ChartMogul 2024 |
| **Cancel-flow survey completion rate** | 30–50% | 50–70% | 70–90% | Stay AI 2024, Loop 2024, Recharge 2024 |

## The build (time estimate)

**Default Path B for $1M-$10M GMV brand: 8-12 weeks part-time (10-15 hr/wk).**

### Phase 0 — Prereq gate (1 wk)

Before installing Move #37, ALL of the following must be true:

- [ ] Move #5 subscription & replenishment program shipped AND all 7 verification gates pass (canonical "subscription billing without marketing flow = subscribers churn silently" anti-pattern per Recharge 2024 + Stay AI 2024 + Triple Whale 2024 benchmarks).
- [ ] Move #6 Triple Whale attribution shipped AND all 7 verification gates pass (canonical "subscription billing without attribution = no cohort-LTV-overlay" anti-pattern per Triple Whale 2024 + Northbeam 2024 benchmarks).
- [ ] Move #48 Privacy & consent management shipped (canonical "subscription billing without consent-aware propagation = GDPR + TCPA liability" anti-pattern per GDPR 2024 + TCPA-2024 + Move #48 benchmarks).
- [ ] Shopify Plus OR Shopify Advanced ($399+/mo) live + ≥$100k GMV for 3 consecutive months + ≥100 active subscribers.
- [ ] Customer-Account-API + Customer-Payment-Method-API enabled in Shopify Admin → Settings → APIs.
- [ ] Smart-retry-engine selected (Recharge native Dunning + Smart Retries OR Churn-Zero OR ProfitWell Recover OR Stripe Smart Retries).
- [ ] Payment-method-updater integration confirmed (Stripe Account Updater OR Visa Token Service OR MasterCard Account Updater OR Churn-Zero payment-updater OR custom).
- [ ] Cancel-flow-engine selected (Stay AI OR Loop OR Smartrr OR Okendo Subscriptions OR Recharge native cancel flow OR custom).
- [ ] MRR-cohort-analytics-engine selected (Baremetrics OR ChartMogul OR ProfitWell OR Triple Whale native subscription-cohort OR Looker + custom).
- [ ] Per-vertical subscription pricing-model chosen (single-tier vs multi-tier vs prepay-discount vs gift-subscription-recipient).
- [ ] ≥1 product-market-fit signal from Move #5 retention metrics (active subscriber retention >80% at 90-day-per-cohort).
- [ ] Operator capacity: 4–8 hr/wk for 1–4 weeks depending on path + 1 hr/wk ongoing maintenance.

### Phase 1 — Audit + tool install + integration (Days 1-7)

1. Audit current subscription state via Shopify Admin → Customers → Subscriptions: subscriber count, MRR, churn rate (voluntary + involuntary), LTV, prepay-share, pause-skip-swap rate, cancel-flow deflection rate.
2. Install Recharge Pro $99+/mo (Path B DEFAULT) OR Stay AI / Loop / Subbly (Path A for <$500k GMV) OR Ordergroove Direct $1k+/mo (Path C for $10M+ GMV).
3. Install Stay AI / Loop / Smartrr / Okendo Subscriptions for cancel-flow-engine.
4. Install Churn-Zero or ProfitWell Recover (dunning-engine + payment-method-updater + smart-retry-engine).
5. Install Baremetrics or ChartMogul (MRR-cohort-analytics).
6. Wire Triple Whale subscription-cohort-overlay (free w/ Move #6) + Klaviyo Recharge/Stay AI/Loop integration $0 (free w/ Klaviyo paid tier) + Postscript Recharge/Stay AI/Loop integration + Gorgias Recharge/Stay AI/Loop integration.
7. Configure Stripe Smart Retries + Stripe Account Updater (if Stripe backend) OR Visa-Token-Service OR MasterCard-Account-Updater integration with issuer-processor.
8. Configure 30-day baseline snapshot of the 18 canonical subscription metrics (active-subscriber-count + MRR + MRR-growth-rate + involuntary-churn-rate + voluntary-churn-rate + subscriber-LTV + NRR + GRR + pause-skip-swap-rate + cancel-flow-deflection-rate + recovered-revenue-per-1k-subs + prepay-share + MRR-cohort-by-acquisition-channel + cancel-flow-survey-completion + prepay-discount-ladder-effectiveness + voluntary-vs-involuntary-churn-breakdown + subscriber-cohort-by-start-month + per-tier-LTV).

### Phase 2 — Migration + cutover (Days 8-14)

1. Export existing subscribers from Shopify Subscriptions or current subscription app: full subscriber table (subscription-id + customer-id + product-id + variant-id + quantity + next-charge-date + billing-cycle + price + status + created-at + cancelled-at + cancel-reason + payment-method-id + billing-address-id + shipping-address-id + custom-fields + LTV-history).
2. Import to Recharge / Stay AI / Loop / Ordergroove / Bold / Appstle using the per-platform migration-tool (Recharge Migration Tool + Stay AI Importer + Loop Migration + Ordergroove Onboarding + Bold Import Wizard + Appstle Migration).
3. Verify subscriber-count match between source-app and destination-app (must be exact match to within ±0.1%).
4. Verify MRR match between source-app and destination-app (must be exact match to within ±0.5%).
5. Verify next-charge-date preservation (must be exact match to within ±1 day).
6. Verify payment-method preservation (must be exact match for all subscriptions).
7. Verify subscription-billing-cycle preservation (weekly / biweekly / monthly / quarterly / biannual / annual).
8. Verify pause-skip-swap state preservation (paused subscriptions must remain paused, swap-configurations must be preserved).
9. Configure cancel-flow-engine: Stay AI / Loop / Smartrr / Okendo Subscriptions → Cancel-flow → custom-cancel-reasons taxonomy → deferred-cancel (offer to pause/skip/swap instead of cancel) → discount-path → cancel-survey-collection → retention-segmentation. Wire to Klaviyo cancel-flow-survey-response-triggered-email + Postscript cancel-flow-survey-response-triggered-SMS.
10. Configure dunning-engine: Churn-Zero / ProfitWell Recover / Recharge native Dunning → smart-retry-engine (4-attempt-over-7-day exponential-backoff sequence) → payment-method-updater (Stripe Smart Retries + Stripe Account Updater) → dunning-email-cascade (4-email-over-21-day sequence: Day 1 failed-charge-notice, Day 4 first-retry-warning, Day 7 final-retry-warning, Day 14 subscription-paused-warning).
11. Configure MRR-cohort-analytics: Baremetrics / ChartMogul / ProfitWell → per-cohort-LTV-by-acquisition-channel-segmentation → GRR + NRR dashboard → voluntary-vs-involuntary-churn breakdown → subscriber-cohort-by-start-month + per-tier-LTV + per-product-LTV. Wire to Triple Whale subscription-cohort-overlay (free w/ Move #6) + Klaviyo per-cohort-Segmentation.
12. Configure prepay-discount-ladder: 3mo-prepay-5%-discount + 6mo-prepay-10%-discount + 12mo-prepay-15%-discount. Verify prepay-discount-ladder with Klaviyo prepay-discount-segmentation-email + Postscript prepay-discount-segmentation-SMS.

### Phase 3 — Cutover + monitor (Days 15-21)

1. Choose 48-72h cutover window with historically-low-traffic (Tuesday 10am-Thursday 10am is the safe default). Avoid Q4-BFCM / Black Friday / Mother's Day / Father's Day / Valentine's Day / Cyber Monday / product-launches / active-promo-window.
2. Stop processing new subscriptions in source-app.
3. Enable processing in destination-app.
4. Run 24h reconciliation: every charge in source-app must match a charge (or skipped-charge) in destination-app.
5. Run 7d reconciliation: every MRR-update in source-app must match in destination-app (within ±0.5%).
6. Run 30d reconciliation: every churn-event in source-app must match in destination-app (within ±1 event per cohort).
7. Monitor dunning-engine + cancel-flow-engine + smart-retry-engine + payment-method-updater for unexpected behavior.

### Phase 4 — Phase 6 sunset + ongoing maintenance (Days 22-30+)

1. Sunset source-app: cancel subscription, export final data-reconciliation, archive source-app-account (after 90-day safety window).
2. Configure monthly operator review: dunning-engine performance + cancel-flow-engine deflection-rate + MRR-cohort-by-acquisition-channel + voluntary-vs-involuntary-churn breakdown + NRR + GRR + per-tier-LTV + prepay-discount-ladder-effectiveness.
3. Configure Triple Whale subscription-cohort-overlay: per-cohort-LTV-by-acquisition-channel-segmentation displayed in Move #6 dashboard.
4. Configure Klaviyo subscription-cohort-Segmentation: per-cohort-LTV-segment for Move #19 lifecycle-flow-library.
5. Configure Postscript subscription-cohort-Segmentation: per-cohort-LTV-segment for Move #19 lifecycle-flow-library.
6. Configure Gorgias subscription-cohort-Segmentation: per-cohort-LTV-segment for Move #38 AI customer service automation.
7. Configure A/B test Move #32 growth experimentation: cancel-flow variants + prepay-discount-ladder-variants + smart-retry-cadence-variants.

### Phase 5 — Continuous cadence (Months 2-12)

1. Monthly: review dunning-engine + cancel-flow-engine + smart-retry-engine + payment-method-updater performance. Adjust smart-retry-cadence + dunning-email-cascade + cancel-flow-reasons-taxonomy as needed.
2. Quarterly: A/B test cancel-flow-variants + prepay-discount-ladder-variants + smart-retry-cadence-variants + dunning-email-cascade-variants (per Move #32).
3. Quarterly: review MRR-cohort-by-acquisition-channel + voluntary-vs-involuntary-churn-breakdown + GRR + NRR trends.
4. Annual: re-evaluate subscription-billing-platform (Recharge vs Stay AI vs Loop vs Ordergroove vs Bold vs Appstle vs in-house custom per Path D).

## Common pitfalls (18 from real builds)

1. **Ship Recharge or Stay AI or Loop without payment-method-updater integration.** The involuntary-churn-rate stays at 5-8%/mo even after the migration because Stripe / Visa / MasterCard payment-method-expiry-rate is 3-5%/yr per card per Visa Token Service 2024 + MasterCard Account Updater 2024 + Stripe Smart Retries 2024 + Churn-Zero 2024 benchmarks — 8% of subscribers will have an expiring card each month. Without payment-method-updater, the dunning-engine retries on the original-expired-card and the charge fails. **Fix:** confirm Stripe Account Updater OR Visa Token Service OR MasterCard Account Updater integration is enabled before cutover; verify with a test-card-expiry-simulation (Recharge → Dunning → Test Mode).
2. **Ship Recharge or Stay AI or Loop without smart-retry-engine exponential-backoff.** The naive retry strategy (retry-once-immediately) recovers 10-20% of failed charges vs the 50-70% recovery rate with exponential-backoff-4-attempts-over-7-days per Stripe Smart Retries 2024 + Churn-Zero 2024 + ProfitWell Recover 2024 + Recharge 2024 benchmarks. **Fix:** configure smart-retry-engine with 4-attempt-over-7-day exponential-backoff (Day 1 immediate, Day 3 second attempt, Day 5 third attempt, Day 7 fourth attempt); wire to Churn-Zero / ProfitWell Recover / Recharge native Dunning.
3. **Ship cancel-flow-engine with naive-immediate-cancel (no pause-skip-swap-UX).** Voluntary churn rate stays at 8-12%/mo even after the cancel-flow-engine is installed because the customer must commit to cancel-or-pause-or-skip-or-swap without seeing the alternative options per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Okendo Subscriptions 2024 + Recharge Cancel Flow 2024 + UX Best Practices 2024 benchmarks. **Fix:** configure cancel-flow-engine with pause-skip-swap-first UX: Step 1 = "Why are you cancelling? Choose: too expensive / not using / prefer one-time / bad timing / found alternative / other." Step 2 = "Before you cancel, would you like to: pause for X weeks / skip next order / swap to lower tier / get 25% off next 3 orders / talk to support?" Step 3 = "Confirm cancellation."
4. **Ship cancel-flow-engine without custom-cancel-reasons taxonomy.** The operator has no signal on WHY subscribers are cancelling + no way to A/B test cancel-flow variants + no per-cohort-LTV-by-cancel-reason segmentation per Stay AI 2024 + Loop 2024 + Smartrr 2024 + Recharge 2024 + Cancel Flow Best Practices 2024 benchmarks. **Fix:** build custom-cancel-reasons taxonomy aligned with operator's actual cancellation patterns (e.g., 6 reasons: too-expensive / not-using-enough / found-alternative / bad-timing / product-issue / other). Wire each cancel-reason to a Klaviyo cancel-reason-segmentation-event + Triple Whale cancel-reason-cohort.
5. **Ship MRR-cohort-analytics without GRR-or-NRR-or-voluntary-vs-involuntary-churn-breakdown.** The operator has no signal on whether churn is voluntary (cancel-flow-engine-fixable) vs involuntary (payment-method-updater-fixable) vs tier-too-expensive-fixable vs shipping-issue-fixable per ChartMogul 2024 + Baremetrics 2024 + ProfitWell 2024 + Triple Whale 2024 + McKinsey Subscription Economy 2024 benchmarks. **Fix:** configure MRR-cohort-analytics with voluntary-vs-involuntary-churn-breakdown + GRR + NRR + per-cohort-LTV-by-acquisition-channel + per-tier-LTV + per-product-LTV + per-cohort-by-start-month-retention-curve. Display in Move #6 Triple Whale dashboard.
6. **Ship pause-skip-swap-UX without Klaviyo-pause-resume-reminder-SMS.** Subscribers pause for 3+ months then forget — 30-50% of paused subscriptions never resume per Recharge 2024 + Loop 2024 + Stay AI 2024 + Pause-Subscription Best Practices 2024 benchmarks. **Fix:** wire pause-resume-reminder-SMS via Klaviyo pause-resume-Segmentation + Postscript pause-resume-Segmentation-SMS; trigger 7-day-after-pause + 30-day-after-pause + 60-day-after-pause reminders with offer-to-resume-or-swap-or-cancel discount.
7. **Ship subscription-platform without Klaviyo-subscription-cohort-integration.** The operator cannot run Move #19 lifecycle-flow-library on a per-subscriber-cohort-LTV basis — all subscribers get the same welcome / cart-abandon / post-purchase / replenishment messaging regardless of subscription-tier or LTV-per-cohort per Klaviyo 2024 + Recharge 2024 + Stay AI 2024 + Triple Whale 2024 benchmarks. **Fix:** install Klaviyo Recharge / Stay AI / Loop integration $0 (free w/ Klaviyo paid tier); verify subscription-state metrics + subscription-cancel-event + subscription-pause-event + subscription-skip-event + subscription-swap-event + subscription-tier-change-event + subscription-billing-cycle-event flowing into Klaviyo.
8. **Ship subscription-platform without Triple-Whale-subscription-cohort-overlay.** The operator cannot measure per-cohort-LTV-by-acquisition-channel for subscribers vs non-subscribers per Triple Whale 2024 + Northbeam 2024 + Mixpanel 2024 + Amplitude 2024 benchmarks. **Fix:** install Triple Whale native subscription-cohort-overlay (free w/ Move #6); verify per-subscriber-cohort-LTV-by-acquisition-channel + per-tier-LTV + per-product-LTV displayed in Move #6 dashboard.
9. **Ship subscription-platform with single-tier-monthly-pricing (no prepay-discount-ladder).** Prepay-share-of-subscribers stays at 5-10% of subscribers; effective-monthly-discount-rate stays at $0 per subscriber; LTV-per-subscriber stays at $400-$500 (vs $700-$1,200 with prepay-discount-ladder per Subscription Pricing Strategy 2024 + Tier Pricing 2024 + Prepay-vs-Recurring 2024 benchmarks). **Fix:** design prepay-discount-ladder: 3mo-prepay-5%-discount + 6mo-prepay-10%-discount + 12mo-prepay-15%-discount. Track per-prepay-tier-LTV in MRR-cohort-analytics.
10. **Ship subscription-platform without Multi-Subscription-Per-Customer support.** Most consumers subscribe to 2-4 different products at the same time per Recharge 2024 + Triple Whale 2024 + Ordergroove 2024 + Subscription UX Best Practices 2024 benchmarks. Single-subscription-per-customer UX forces the customer to choose between products vs subscribe-to-multiple. **Fix:** verify subscription-platform supports multi-subscription-per-customer (Recharge + Stay AI + Loop + Ordergroove all support by default; Subbly + Appstle require paid-tier); design combined-cart-checkout UX across multiple subscriptions.
11. **Ship subscription-platform without gift-subscription-recipient flow.** The operator misses the gift-subscription-revenue stream (typical brand revenue lift = 8-15% of annual subscription-MRR during Q4 / holiday season per Recharge 2024 + Loop 2024 + Okendo Subscriptions 2024 + Gift Subscription Best Practices 2024 benchmarks). **Fix:** design gift-subscription-recipient flow: gifter chooses recipient + duration (3mo/6mo/12mo) + gift-message + delivery-date; recipient receives gift-notification-email + gift-redemption-claim-flow; subscription-converts-to-recurring-on-gift-redemption-expiry. Verify per Recharge / Loop / Okendo Subscriptions gift-subscription-engine.
12. **Ship subscription-platform without cancel-flow-survey-collection (or with generic-cancel-survey).** The operator has no signal on WHY subscribers are cancelling + no way to A/B test cancel-flow-variants per Cancel Flow Best Practices 2024 + Stay AI 2024 + Loop 2024 + Cancel Survey Best Practices 2024 benchmarks. **Fix:** design cancel-flow-survey-collection with per-reason granularity: too-expensive / not-using / found-alternative / bad-timing / product-issue / other. Trigger Klaviyo cancel-reason-segmentation-email + Triple Whale cancel-reason-cohort. A/B test per Move #32.
13. **Ship subscription-platform with naive-charge-cadence (monthly-only, no weekly/biweekly/quarterly/biannual/annual-options).** The operator caps at 5-10% prepay-share-of-subscribers; LTV-per-subscriber caps at $400-$500 per Subscription Pricing Strategy 2024 + Tier Pricing 2024 + Prepay-vs-Recurring 2024 benchmarks. **Fix:** design multi-cadence-options: weekly / biweekly / monthly / quarterly / biannual / annual. Verify per-cadence-LTV in MRR-cohort-analytics.
14. **Ship subscription-platform without QR-code-or-mobile-skip-pause-UX.** 60-70% of subscription-management happens on mobile per Recharge 2024 + Loop 2024 + Customer Portal Best Practices 2024 + Mobile Subscription 2024 benchmarks. Desktop-only customer portal forces 60-70% of subscribers to skip-skip-management-or-call-support. **Fix:** design mobile-first customer portal with QR-code-to-portal-direct-from-order-confirmation-email + sticky-mobile-portal-bar + one-tap-skip + one-tap-pause + one-tap-swap.
15. **Ship subscription-platform without Move #48 privacy-and-consent-aware propagation.** The recurring-billing-platform sends pause-skip-swap-reminder emails + cancel-flow-re-engagement-SMS to subscribers without explicit consent, exposing the operator to GDPR + UK-GDPR + CCPA/CPRA + TCPA + ePrivacy liability per GDPR-2024 + TCPA-2024 + Move #48 + Consent-Mode-v2 + GDPR-Art-7(1) benchmarks. **Fix:** verify Move #48 privacy-and-consent-management shipped BEFORE Move #37 cutover; verify consent-aware propagation in subscription-platform via consent-mode-v2 + Meta-LDU + TikTok-EU-consent + Pinterest-enhanced-consent flags.
16. **Ship subscription-platform without Move #6 Triple-Whale-attribution-cohort-LTV-overlay validation.** The operator cannot measure per-cohort-LTV-by-acquisition-channel for subscribers — the 12-25x subscriber-LTV dispersion across acquisition-channels goes unmeasured per Triple Whale 2024 + Northbeam 2024 + ChartMogul 2024 + Mixpanel 2024 + Amplitude 2024 benchmarks. **Fix:** verify Triple Whale attribution-subscriber-cohort-overlay wired before cutover; verify per-cohort-LTV-by-acquisition-channel + subscriber-vs-non-subscriber-LTV displayed in Move #6 dashboard.
17. **Ship subscription-platform with naive-charge-success-rate-monitoring (no per-card-type / per-issuer-rate / per-cohort-charge-failure-rate breakdown).** The operator cannot identify card-type-specific failure modes (e.g., Amex 1% failure vs Visa 3% failure vs Mastercard 5% failure per issuer per Churn-Zero 2024 + Recharge 2024 + ProfitWell 2024 + Network Tokenization 2024 + Issuer Failure Rates 2024 benchmarks). **Fix:** configure per-card-type + per-issuer + per-cohort charge-failure-rate breakdown in MRR-cohort-analytics.
18. **Ship subscription-platform with no Q4-BFCM / holiday-subscriber-acquisition-amplification calendar.** The operator misses the 8-15% holiday-season-subscriber-acquisition-revenue-share per Recharge 2024 + Triple Whale 2024 + McKinsey Subscription Economy 2024 + Bain Subscription Economy 2024 + Subscription Trade Association 2024 benchmarks (Q4 subscription-gifting is 30-40% of new-subscriber-acquisition for many DTC brands). **Fix:** design Q4-BFCM-gift-subscription-launch-calendar (Black-Friday-Lite in early-November + Black-Friday-full + Cyber-Monday + Christmas + Hanukkah + New-Year + Valentine's-Day + Mother's-Day + Father's-Day). Pre-build the gift-subscription-recipient-flow by Q3-Q4-cutoff.

## Verification (this skill is "shipped" when...)

**Move #37 is shipped when the operator has demonstrated ALL of the following 7 verification gates:**

- **Gate A — Subscription-billing-platform + dunning-engine + smart-retry-engine + payment-method-updater wired.** Verify: Recharge Pro $99+/mo OR Stay AI $99+/mo OR Loop $250/mo OR Ordergroove Direct $1k+/mo OR Bold $50+/mo OR Appstle $30+/mo active + Churn-Zero $499+/mo OR ProfitWell Recover $250+/mo OR Recharge native Dunning active + Stripe Smart Retries enabled + Stripe Account Updater enabled OR Visa Token Service enabled OR MasterCard Account Updater enabled. 30-day charge-failure-rate data showing involuntary-churn-rate <2%/mo (vs 5-8%/mo naive baseline). Test-card-expiry-simulation passed.
- **Gate B — Cancel-flow-engine + pause-skip-swap-UX + custom-cancel-reasons-taxonomy + cancel-flow-survey-collection wired.** Verify: Stay AI / Loop / Smartrr / Okendo Subscriptions cancel-flow-engine active + pause-skip-swap-UX live + custom-cancel-reasons taxonomy (6 reasons: too-expensive / not-using / found-alternative / bad-timing / product-issue / other) wired + cancel-flow-survey-collection wired to Klaviyo cancel-reason-segmentation-event + Triple Whale cancel-reason-cohort. 30-day cancel-flow-deflection-rate data showing 20-40% of cancel-attempts deflected to pause/skip/swap/discount (vs 5-10% naive baseline).
- **Gate C — MRR-cohort-analytics-engine + GRR + NRR + voluntary-vs-involuntary-churn-breakdown + per-cohort-LTV-by-acquisition-channel wired.** Verify: Baremetrics $108+/mo OR ChartMogul $99+/mo OR ProfitWell $250+/mo OR Triple Whale native subscription-cohort-overlay active + GRR + NRR dashboard live + voluntary-vs-involuntary-churn-breakdown live + per-cohort-LTV-by-acquisition-channel displayed in Move #6 Triple Whale dashboard. 30-day cohort-LTV data showing 12-25x subscriber-LTV dispersion across acquisition-channels.
- **Gate D — Klaviyo + Postscript + Gorgias + Triple Whale + Northbeam + Mixpanel/Amplitude + Stripe billing-integrations wired.** Verify: Klaviyo Recharge / Stay AI / Loop integration $0 (free w/ Klaviyo paid tier) active + Postscript Recharge / Stay AI / Loop integration active + Gorgias Recharge / Stay AI / Loop integration active + Triple Whale native subscription-cohort-overlay active + Northbeam MRR-overlay active for $5M+ GMV + Mixpanel/Amplitude subscriber-cohort-event-tracking active + Stripe Smart Retries + Stripe Account Updater active. 7-day subscription-state metric data showing subscription-state + subscription-cancel-event + subscription-pause-event + subscription-skip-event + subscription-swap-event + subscription-tier-change-event + subscription-billing-cycle-event flowing into Klaviyo + Triple Whale.
- **Gate E — Per-vertical-subscription-pricing-model + prepay-discount-ladder + multi-cadence-options + multi-subscription-per-customer + gift-subscription-recipient-flow wired.** Verify: per-vertical pricing-model decided (single-tier vs multi-tier vs prepay-discount vs gift-subscription-recipient) + prepay-discount-ladder designed (3mo-5% + 6mo-10% + 12mo-15%) + multi-cadence-options live (weekly / biweekly / monthly / quarterly / biannual / annual) + multi-subscription-per-customer UX live + gift-subscription-recipient-flow designed. 30-day prepay-share data showing 25-45% prepay-share (vs 5-10% naive baseline).
- **Gate F — Pause-skip-swap-UX + QR-code-or-mobile-skip-pause-UX + mobile-first-customer-portal + pause-resume-reminder-SMS wired.** Verify: pause-skip-swap-UX live + QR-code-to-portal-direct-from-order-confirmation-email live + mobile-first customer portal live + one-tap-skip + one-tap-pause + one-tap-swap + pause-resume-reminder-SMS via Klaviyo + Postscript pause-resume-Segmentation. 30-day pause-skip-swap-usage-rate data showing 15-25% of monthly subscribers (vs 5-10% naive baseline).
- **Gate G — Move #5 + #6 + #48 substrate-gate + Q4-BFCM-gift-subscription-launch-calendar + per-card-type-charge-failure-rate-monitoring wired.** Verify: Move #5 subscription & replenishment program shipped + Move #6 Triple Whale attribution shipped + Move #48 Privacy & consent management shipped + Q4-BFCM-gift-subscription-launch-calendar designed + per-card-type + per-issuer + per-cohort charge-failure-rate breakdown in MRR-cohort-analytics. 30-day Q4-gift-subscription-launch-revenue data showing 8-15% Q4-revenue-share + per-issuer-failure-rate-breakdown live + per-cohort-charge-failure-rate-breakdown live.

## How to extend this skill

**Once Move #37 is shipped, the operator has the canonical subscription-billing substrate. The natural follow-ups (per the canonical layer order) are:**

1. **Companion 2nd-layer operator-build playbook:** `playbooks/37-migrate-subscription-billing.md` — the Phase 1+2+3+4+5+6 build recipe + Path A/B/C/D decision matrix + 7-prereq subscription-billing-platform-build + 18-pitfall detailed build + 7-gate-verification + cost-stack + ROI-table.
2. **Companion 3rd-layer operator-copy template asset:** `assets/37-subscription-billing-templates.md` — the per-platform subscription-widget-template + cancel-flow-template + dunning-email-cascade-template (4-email-over-21-day sequence) + pause-resume-reminder-SMS-template + gift-subscription-recipient-flow-template + prepay-discount-ladder-template (3mo / 6mo / 12mo discounts) + per-vertical-pricing-model-templates.
3. **Companion 4th-layer dashboard Page:** `dashboard/app/subscription-billing/page.tsx` — the canonical 4th-layer Next.js operator-surface route surfacing the 18 canonical subscription-billing metrics + per-cohort-LTV-by-acquisition-channel + GRR + NRR + voluntary-vs-involuntary-churn-breakdown + per-tier-LTV + pause-skip-swap-rate + cancel-flow-deflection-rate + recovered-revenue-per-1k-subs + prepay-share + per-card-type-charge-failure-rate.
4. **Companion 5th-layer Archetype B numeric-quality scorer:** `dashboard/src/lib/subscription_billing.ts` — the canonical numeric-quality scorer with 18-canonical-subscription-billing-metrics + per-cohort-LTV-multiplier + NRR-multiplier + involuntary-churn-rate-cap + voluntary-churn-rate-cap + cancel-flow-deflection-rate + pause-skip-swap-rate + recovered-revenue-per-1k-subs + prepay-share + per-platform-cost → outputs 0-100 score + health-band + prioritized-fix-list with per-fix-estimated-subscription-revenue-lift.
5. **Companion 6th-layer static-dashboard surface:** `dashboards/subscription-billing-infrastructure-health.html` — the canonical Archetype A static-dashboard view showing the 18 canonical subscription-billing metrics + per-cohort-LTV dispersion chart + NRR-over-time chart + voluntary-vs-involuntary-churn-breakdown pie-chart + pause-skip-swap-rate-over-time chart + cancel-flow-deflection-funnel + per-card-type-charge-failure-rate heatmap + per-platform-cost comparison.
6. **Companion Move #32 A/B tests:** cancel-flow variants + prepay-discount-ladder variants + smart-retry-cadence variants + dunning-email-cascade variants + pause-skip-swap-UX variants — wire to Move #32 growth experimentation engine.
7. **Companion Move #19 lifecycle-flow-library expansions:** Move #19 already includes the Tier 1 paused-subscription-recovery + Tier 2 subscription-renewal-reminder + Tier 3 stock-back-notification flows — after Move #37 ships, expand Move #19 to include Klaviyo per-cohort-Segmentation-driven subscription-flow branches (per-tier-LTV-segment + per-acquisition-channel-segment + per-cancel-reason-segment).

## Cross-references

- **Move #5 (subscription & replenishment program):** the lifecycle-message layer that Move #37 compounds — without Move #5, Move #37 has no MRR-cohort-driven email/SMS cadence. Move #5 ships first; Move #37 ships on top.
- **Move #6 (Triple Whale attribution):** the attribution-overlay substrate that Move #37 needs for per-cohort-LTV-by-acquisition-channel segmentation. Without Move #6, Move #37 cannot measure the 12-25x subscriber-LTV dispersion across acquisition-channels.
- **Move #19 (lifecycle-flow-library):** the 20-flow email/SMS cadence layer that Move #37 needs for per-cohort-Segmentation-driven subscription-flow branches (Tier 1 paused-subscription-recovery + Tier 2 subscription-renewal-reminder + Tier 3 stock-back-notification).
- **Move #32 (growth experimentation engine):** the A/B testing substrate that Move #37 needs for cancel-flow variants + prepay-discount-ladder variants + smart-retry-cadence variants + dunning-email-cascade variants + pause-skip-swap-UX variants.
- **Move #38 (AI customer service automation):** the AI-customer-service substrate that Move #37 needs for Gorgias Recharge / Stay AI / Loop integration + cancel-flow-survey-respondent-AI-routing + pause-skip-swap-AI-concierge.
- **Move #42 (composable headless commerce MACH architecture):** the composable-stack substrate that Move #37 fits into (Recharge + Stay AI + Loop + Ordergroove + Bold + Appstle + Klaviyo + Triple Whale + Northbeam + Mixpanel/Amplitude are all canonical composable-stack components).
- **Move #48 (privacy & consent management):** the privacy-consent substrate that Move #37 needs for consent-aware pause-skip-swap-reminder emails + cancel-flow-re-engagement-SMS. Without Move #48, Move #37 exposes the operator to GDPR + UK-GDPR + CCPA/CPRA + TCPA + ePrivacy liability.
- **Move #9 (mobile PDP redesign):** the mobile-PDP substrate that Move #37 needs for mobile-first-subscription-checkout UX.
- **Move #41 (CDP operations):** the CDP substrate that Move #37 needs for per-subscriber-customer-360 (subscription-state + LTV-history + churn-propensity + next-order-recommendation + per-tier-LTV + per-cancel-reason-preference).
- **Move #30 (dynamic pricing):** the pricing-engine substrate that Move #37 needs for per-subscriber-tier-dynamic-pricing + per-acquisition-channel-discount-pricing + per-product-LTV-pricing.

## Sources

- Recharge 2024 — subscription-billing-platform market leader.
- Recharge Billing API 2024 — programmatic billing API.
- Recharge Subscription Widget 2024 — storefront subscription-widget.
- Recharge Portal 2024 — customer-facing subscription portal.
- Recharge Dunning 2024 — native dunning-engine + smart-retry-engine.
- Ordergroove 2024 — enterprise subscription-billing-platform.
- Ordergroove Direct 2024 — direct-to-consumer subscription solution.
- Ordergroove Memberships 2024 — subscription-membership tiering.
- Stay AI 2024 — AI-native subscription-billing-platform.
- Stay AI Predictive 2024 — predictive-churn-engine.
- Stay AI Cancel Flow 2024 — cancel-flow-engine with custom-reasons-taxonomy.
- Bold Subscriptions 2024 — Shopify-native subscription-billing-platform.
- Bold Customerspace 2024 — customer-facing subscription portal.
- Appstle 2024 — Shopify-native subscription-billing-platform.
- Appstle Launch 2024 — subscription-launch toolkit.
- Subbly 2024 — subscription-billing-platform for SMB.
- Subbly Checkout 2024 — subscription-checkout-engine.
- Smartrr 2024 — Shopify-native subscription-billing-platform.
- Smartrr Cancel Flow 2024 — cancel-flow-engine.
- Okendo Subscriptions 2024 — UGC + subscription-billing-platform.
- Loop Subscriptions 2024 — Shopify-native subscription-billing-platform.
- Loop Cancel Flow 2024 — cancel-flow-engine with pause-skip-swap-UX.
- Loop Skip/Pause/Swap 2024 — pause-skip-swap-UX.
- Recharge vs Loop 2024 — comparison.
- Recharge vs Ordergroove 2024 — comparison.
- Recharge vs Bold 2024 — comparison.
- Recharge vs Subbly 2024 — comparison.
- Recharge vs Appstle 2024 — comparison.
- Recharge vs Smartrr 2024 — comparison.
- Recharge vs Stay AI 2024 — comparison.
- Recharge vs Okendo Subscriptions 2024 — comparison.
- Recharge Portal Best Practices 2024 — customer-portal UX benchmarks.
- Cancel Flow Best Practices 2024 — cancel-flow-engine UX.
- Double Opt-In Best Practices 2024 — subscription-opt-in confirmation.
- Shopify Subscriptions API 2024 — Shopify-native subscription API.
- Shopify Functions 2024 — serverless functions for checkout/logic customization.
- Shopify Checkout Extensibility 2024 — checkout UI extensions.
- Shopify Subscriptions App 2024 — out-of-the-box subscription app.
- Stripe Billing 2024 — recurring billing infrastructure.
- Stripe Revenue Recognition 2024 — accounting-grade revenue recognition.
- Stripe Smart Retries 2024 — ML-driven retry-engine for failed charges.
- Stripe Card Account Updater 2024 — automatic card-update via network tokens.
- Maxmind 2024 — fraud-prevention + geo-location.
- Kount 2024 — fraud-prevention.
- Shopify Protect 2024 — Shopify-native fraud-prevention.
- Chargetech 2024 — recovery + dunning-engine.
- Maxia 2024 — dunning-engine for SaaS.
- Profitero Recurring Revenue 2024 — recurring-revenue benchmarking.
- MRR Glossary 2024 — MRR definitions + methodology.
- ARR Definitions 2024 — ARR definitions + methodology.
- GRR/NRR/MRR 2024 — gross / net retention rate methodology.
- Churn Glossary 2024 — voluntary / involuntary / revenue churn definitions.
- Voluntary vs Involuntary Churn 2024 — churn-type taxonomy + benchmarks.
- Payment Method Updater Strategies 2024 — payment-update methodology.
- Network Tokenization 2024 — Visa / Mastercard / Amex / Discover tokenization.
- Account Updater Visa/MC 2024 — Visa/MC account-updater service.
- Dunning Best Practices 2024 — dunning-email cadence + smart-retry-engine.
- Smart Retry Engine 2024 — failed-charge retry-engine methodology.
- Recover Cart Billing 2024 — cart-recovery for failed-subscription-charges.
- Subscription Economy Stats 2024 — global subscription-market size.
- Econsultancy Subscription Benchmarks 2024 — subscription-business benchmarks.
- McKinsey Subscription Economy 2024 — subscription-economy growth + benchmarks.
- Bain Subscription Economy 2024 — subscription-economy growth + benchmarks.
- Whalestack Subscription Economy 2024 — subscription-economy growth + benchmarks.
- Subscription Trade Association 2024 — subscription-industry data + benchmarks.
- Zuora Benchmarks 2024 — subscription-billing-platform benchmarks.
- Zuora Subscription Billing Platform 2024 — enterprise subscription-billing-platform.
- Zuora Revenue 2024 — Zuora revenue-recognition + analytics.
- Cleverbridge 2024 — global subscription-billing-platform.
- Vendasta 2024 — subscription-platform for SMB agencies.
- Salesforce Industry Clouds 2024 — subscription-management for industry clouds.
- Hubspot Subscriptions 2024 — Hubspot subscription-management.
- Stripe Atlas 2024 — company-formation + merchant-account.
- Shopify Markets 2024 — international-storefronts.
- Shopify Flows 2024 — automation-engine.
- Shopify Webhooks 2024 — webhook events for external integrations.
- Klaviyo Subscriptions 2024 — Klaviyo subscription-cohort integration.
- Klaviyo Recharge Integration 2024 — Klaviyo-Recharge subscriber-sync.
- Klaviyo Ordergroove Integration 2024 — Klaviyo-Ordergroove subscriber-sync.
- Postscript Recharge 2024 — Postscript-Recharge integration.
- Postscript Ordergroove 2024 — Postscript-Ordergroove integration.
- Gorgias Recharge 2024 — Gorgias-Recharge integration.
- Gorgias Ordergroove 2024 — Gorgias-Ordergroove integration.
- Triple Whale Recharge 2024 — Triple-Whale-Recharge subscriber-cohort-overlay.
- Triple Whale Ordergroove 2024 — Triple-Whale-Ordergroove subscriber-cohort-overlay.
- Triple Whale Cohort Overlay 2024 — Triple-Whale-cohort-LTV overlay methodology.
- Northbeam Subscriptions 2024 — Northbeam subscription-cohort-overlay.
- Mixpanel Subscriptions 2024 — Mixpanel subscription-cohort-event-tracking.
- Amplitude Subscriptions 2024 — Amplitude subscription-cohort-LTV.
- Segment Subscriptions 2024 — Segment subscription-cohort-data-pipeline.
- mParticle Subscriptions 2024 — mParticle subscription-cohort-data-pipeline.
- Risen AI Subscription 2024 — predictive-churn-engine.
- Retention Science Subscription 2024 — retention-cohort-LTV-engine.
- Optimistic AI Subscription 2024 — AI-churn-prediction-engine.
- Churn-Zero 2024 — dunning-engine + smart-retry-engine + payment-method-updater.
- Churn-Zero Dunning 2024 — Churn-Zero dunning-engine.
- Profitero Recurring 2024 — recurring-revenue benchmarking.
- ChartMogul 2024 — MRR-cohort-analytics for SaaS + subscription.
- ChartMogul MRR Cohort 2024 — MRR-cohort methodology.
- Baremetrics 2024 — MRR-cohort-analytics for subscription-businesses.
- Baremetrics MRR 2024 — Baremetrics MRR-cohort methodology.
- ProfitWell 2024 — MRR-cohort-analytics + dunning-engine.
- ProfitWell Recurring Revenue 2024 — ProfitWell recurring-revenue benchmarking.
- Putler 2024 — recurring-revenue-analytics.
- Recurrer 2024 — recurring-revenue-analytics.
- SaaS Capital 2024 — recurring-revenue-financing.
- Paddle Billing 2024 — merchant-of-record subscription-billing.
- Paddle Recover 2024 — Paddle dunning-engine + payment-method-updater.
- Paddle Retention 2024 — Paddle cancellation-flow + retention-paths.
- Partnerstack Subscriptions 2024 — Partnerstack subscription-management.
- Impact Subscriptions 2024 — Impact subscription-tracking.
- TierSkip 2024 — tier-skip-management.
- TierSwap 2024 — tier-swap-management.
- Cancel Flow Design 2024 — cancel-flow-UX.
- Cancel Flow Deflection 2024 — cancel-flow-deflection-rates.
- Deferred Cancel 2024 — deferred-cancel UX patterns.
- Custom Cancel Reasons 2024 — custom-cancel-reasons taxonomy.
- Churn Survey Best Practices 2024 — churn-survey design.
- Recharge Cancel Flow 2024 — Recharge-native cancel-flow-engine.
- Loop Cancel Flow 2024 — Loop cancel-flow-engine.
- Smartrr Cancel Flow 2024 — Smartrr cancel-flow-engine.
- Stay AI Cancel 2024 — Stay AI cancel-flow-engine.
- Okendo Subscriptions Cancel 2024 — Okendo Subscriptions cancel-flow-engine.
- Subscription Billing Platform Comparison 2024 — comparison.
- Subscription Portal Mobile First 2024 — mobile-first subscription-portal-UX.
- Payment Method Update Rate 2024 — payment-method-expiry rate per issuer.
- Card Expiry Failure Rate 2024 — card-expiry-driven failure rate.
- Involuntary Churn Rate 2024 — involuntary-churn-rate benchmarks.
- Smart Retry Recovery Rate 2024 — smart-retry-engine recovery-rates.
- Network Tokenization 2024 — tokenization methodology.
- Visa Token Service 2024 — Visa-tokenization-service.
- Mastercard Account Updater 2024 — MasterCard-account-updater.
- Shopify Customer Account API 2024 — Shopify customer-account-API.
- Shopify Customer Payment Method 2024 — Shopify-customer-payment-method-API.
- Triple Whale Subscription Cohort 2024 — Triple-Whale subscription-cohort-overlay.
- Triple Whale MRR 2024 — Triple-Whale MRR-analytics.
- Northbeam MRR 2024 — Northbeam MRR-overlay.
- Mixpanel Cohort 2024 — Mixpanel cohort-analytics.
- Amplitude Cohort 2024 — Amplitude cohort-LTV-analytics.
- eCommerce Subscriber Acquisition Cost 2024 — subscriber-CAC benchmarks.
- eCommerce Subscriber LTV 2024 — subscriber-LTV benchmarks.
- eCommerce Subscriber Churn Rate 2024 — subscriber-churn-rate benchmarks.
- Recharge Best Practices 2024 — Recharge implementation best-practices.
- Ordergroove Best Practices 2024 — Ordergroove implementation best-practices.
- Stay AI Best Practices 2024 — Stay AI implementation best-practices.
- Bold Best Practices 2024 — Bold implementation best-practices.
- Appstle Best Practices 2024 — Appstle implementation best-practices.
- Subbly Best Practices 2024 — Subbly implementation best-practices.
- Smartrr Best Practices 2024 — Smartrr implementation best-practices.
- Loop Best Practices 2024 — Loop implementation best-practices.
- Okendo Subscriptions Best Practices 2024 — Okendo Subscriptions implementation best-practices.
- Shopify Subscriptions Best Practices 2024 — Shopify Subscriptions implementation best-practices.
- Subscription UX Best Practices 2024 — subscription-UX patterns.
- Subscription Pricing Strategy 2024 — subscription-pricing methodology.
- Tier Pricing Strategy 2024 — tier-pricing methodology.
- Prepay vs Recurring Pricing 2024 — prepay-discount methodology.
- Gift Subscription 2024 — gift-subscription-recipient flow.
- Recipient Subscription 2024 — recipient-subscription flow.
- Prepaid Subscription 2024 — prepaid-subscription flow.
- Paused Subscription 2024 — paused-subscription flow.
- Skipped Subscription 2024 — skipped-subscription flow.
- Swapped Subscription 2024 — swapped-subscription flow.
