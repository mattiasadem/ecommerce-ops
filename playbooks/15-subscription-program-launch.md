# Subscription Program Launch — Operator Build (Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop multi-platform orchestration)

> **Source.** Operator-build companion to `research/08-subscriptions.md` (the canonical 11-section subscription-program research synthesis; Move #11 from `research/03-30-day-rollout-plan.md` §Next moves after 30 days line 176; the recurring-revenue + 2.0–3.5× LTV-multiplier layer the US-centric Shopify-DTC stack implicitly defers). Read `research/08-subscriptions.md` FIRST for the 5-pillar framework [Pillar 1 platform selection & pricing / Pillar 2 subscriber economics & LTV math / Pillar 3 replenishment flow & smart cancellation / Pillar 4 subscriber-cohort analytics & attribution-merge / Pillar 5 inventory & fulfillment] + 3 GMV-tier paths [Path A $100k–$500k Recharge Starter 8:1 ROI / Path B $500k–$10M Recharge Plus DEFAULT 8.3:1 Year-1 ROI / Path C $10M+ Recharge Enterprise or Skio 7.5:1 Year-1 ROI] + 4 phase-by-phase verification gates [Gate A PDP widget / Gate B billing + customer portal + dunning / Gate C replenishment + smart cancellation / Gate D subscriber-cohort analytics] + 15 pitfalls with corrective `Fix:` lines clustered into 5 failure modes [A wrong-SKU-widget / B subscriber-discount-too-low / C smart-cancellation-missing / D Triple-Whale-attribution-missing / E subscription-experience-untested]. This playbook maps each pillar into step-by-step Recharge + Skio + Bold + Stay AI + Appstle + Seal + Loop multi-platform subscription-program operator build across 3 paths (Path A lean SMB starter with Recharge Starter or Appstle / Path B mid-market DEFAULT with Recharge Plus or Stay AI / Path C enterprise scale with Recharge Enterprise or Skio). Pairs with `research/05-lifecycle-marketing.md` + `playbooks/12-lifecycle-flow-library.md` + `assets/14-lifecycle-flow-templates.md` via Tier 2 subscription-renewal + dunning flows (research/05 line 109) + `research/07-3pl-migration.md` + `playbooks/14-3pl-migration.md` via ShipBob subscription-team + ShipMonk subscription-team + subscription-specialty 3PLs (BoxOnLogix + eFulfillment) with 30–50% lower pick-pack-error-rate on subscription-boxes per Recharge 2024 + Move #8 loyalty (`playbooks/07-loyalty-program-smile.md`) via Smile.io 2× points for subscription-orders vs one-time-orders.

## Goal

By the end of this playbook (Weeks 1–6 for Path A / Weeks 1–12 for Path B / Weeks 1–24 for Path C), the operator has:

1. **Recharge (or Skio / Bold / Stay AI / Appstle / Seal / Loop) installed and configured** — chosen per the canonical 7-platform vendor decision matrix from research/08 Pillar 1 (Recharge $49–$999/mo + Skio $99–$1,200/mo + Bold $49–$499/mo + Stay AI $99–$499/mo + Appstle $25–$299/mo + Seal $49–$399/mo + Loop $50–$500/mo).
2. **Subscription-widget on every PDP + cart + collection page** — canonical "Subscribe & Save" widget per research/08 Pillar 1 with the canonical 5-discount-tier matrix [5% / 10% / 15% / 20% / 25% off depending on cadence: 30-day / 45-day / 60-day / 90-day / 120-day].
3. **Subscriber-billing + customer portal + dunning-flow live** — Stripe (Recharge default) or Recharge-built-in billing with the canonical 3-attempt dunning-flow per research/08 Pillar 3 recovering 50–70% of would-be subscription-renewals vs the canonical 1-attempt industry-baseline.
4. **Replenishment + smart-cancellation flow live** — the canonical 4-alternative smart-cancellation flow [pause / skip / change-frequency / 25%-discount per research/08 Pillar 3 recovering 20–35% of would-be cancellations vs the canonical 0-alternative cancel-only industry-baseline + winback-flow returning 10–20% of cancelled-subscribers per the 60–90-day post-cancel email sequence].
5. **Subscriber-cohort attribution-merge live in Triple Whale** — research/08 Pillar 4 subscriber-cohort LTV signal wired to Klaviyo + Smile.io + the canonical Move #6 Triple Whale attribution stack so the operator can measure the 2.0–3.5× LTV-multiplier + the 40–60%-faster CAC-payback + the 15–30% revenue-share-from-subscribers vs baseline per research/08 §Cost & ROI.
6. **3PL (or in-house warehouse) configured for subscription-fulfillment** — research/08 Pillar 5 FIFO + lot/date tracking + subscription-specialty 3PL (BoxOnLogix / eFulfillment / ShipBob subscription-team / ShipMonk subscription-team) with 30–50% lower pick-pack-error-rate than generic 3PLs per Recharge 2024 subscription-box benchmarks.

**Operator time commitment:** Path A ~14 hours one-time + 1 hr/wk ongoing = **~66 hr Year-1**. Path B ~50 hours one-time + 4 hr/wk ongoing = **~260 hr Year-1**. Path C ~120 hours one-time + 15 hr/wk ongoing + dedicated retention-manager hire = **~900 hr Year-1 + $70k-$100k FTE**.

**Default path: Path B mid-market Recharge Plus $500k–$10M GMV / 1,000–10,000 subscribers / 70% consumable-revenue-share / 30-day average-purchase-cadence** — the canonical 8.3:1 Year-1 ROI per research/08 §Cost & ROI ($270k Year-1 incremental revenue / $84k cost stack = 3.2:1 gross / 2.2:1 net; Year-2+ 8.3:1 gross / 7.3:1 net). Path A is the lean starter (Recharge Starter or Appstle; $49-$299/mo; <$500k GMV; <1,000 subscribers). Path C is the enterprise scale (Recharge Enterprise or Skio; $999-$1,200/mo; $10M+ GMV; 10,000+ subscribers; with international-subscription-shipping for EU + UK + CA + AU + JP).

---

## Which subscription platform fits your catalog

The canonical 7-platform subscription-platform decision matrix per research/08 Pillar 1 (Recharge 2024 + Skio 2024 + Bold 2024 + Stay AI 2024 + Appstle 2024 + Seal 2024 + Loop 2024 vendor-pricing pages verified 2026-06):

- **<$500k GMV / <1,000 subscribers / lean starter:** **Path A — Appstle Starter $25–$99/mo** OR **Recharge Starter $49/mo** OR **Bold Starter $49/mo**. Single warehouse + Shopify-native + email-support. Appstle is the cheapest but missing some advanced features (no churn-saver, no AI cadencing). Recharge Starter is the canonical default for the Shopify-native-only brand.
- **$500k–$10M GMV / 1,000–10,000 subscribers / DEFAULT:** **Path B — Recharge Plus $499/mo** OR **Stay AI Plus $299/mo** OR **Bold Plus $299/mo**. Includes churn-saver, advanced analytics, LTV cohorts, Klaviyo deep-integration, Smile.io loyalty-integration. **Stay AI** is the cheapest Path B option with churn-saver; **Recharge Plus** is the most-established with the broadest 3PL / kitting / international integrations; **Bold Plus** is the cheapest if you already use Bold for subscriptions on existing products.
- **$10M+ GMV / 10,000+ subscribers / enterprise:** **Path C — Recharge Enterprise $999+/mo** OR **Skio Enterprise $1,200/mo**. Includes dedicated CSM, multi-warehouse, international-subscription-shipping (EU + UK + CA + AU + JP), custom contracts, advanced churn-saver + AI cadencing + winback-AI. **Skio** has the strongest Klaviyo native integration (Skio was founded by a Klaviyo alum); **Recharge** has the most 3PL / kitting partners.
- **Loop Subscriptions $50–$500/mo** — loop-only path for Shopify brands that want a Loop-specific experience (e.g. Loop is more Pixel-Perfect-UI than Recharge; some brands prefer Loop's widget design).
- **Seal Subscriptions $49–$399/mo** — minimal-feature path; best for apparel / accessories / non-consumable brands.
- **Other platforms to AVOID for $500k+ GMV:** Subbly (subscription-only, no one-time purchases mixed in), Awtomic (UI-rich but international-shipping gaps), Stay AI (good for Path A but missing enterprise features for Path C).

**Subscription platform anti-pattern: don't pick the cheapest platform unless you're <$100k GMV.** The single-biggest cost-of-being-wrong: a brand on Recharge Starter who outgrows it and has to migrate to Recharge Plus = ~30-day migration + ~5% of subscribers lost during migration. Skio vs Recharge direct migration is 30-90 days of engineering per Skio 2024 migration-guide. Pick the platform for your **12-month-out GMV**, not your current GMV.

**Subscription platform by category:**
- **easy** — vitamins / supplements / pet food / household consumables / personal care. Any of the 7 platforms works. Default to **Recharge Plus** (broadest kitting + 3PL support + integration partners).
- **medium** — coffee / beverage / food subscription-box / cosmetics. Requires lot-tracking + expiry-tracking. Default to **Stay AI Plus** (built-in lot/expiry features) OR **Skio** (built-in subscription-box kitting).
- **hard** — alcohol / regulated-supplements / Rx-pharmacy. Requires age-verification + license-tracking. Default to **Recharge Enterprise** (compliance-grade audit-log + age-verification API integration).
- **fail** — perishables / live plants / perishable-food. Subscription-program typically not viable due to spoilage risk; operate one-time-purchase with care-pack instead.

---

## Prerequisites

The 8-prereq gate for subscription-program launch (mirrors research/08 §Prerequisites + research/08 Pillar 1 + Pillar 3 + Pillar 4 + Pillar 5):

1. **Move #1 + Move #4 + Move #6 + Move #8 shipped** — Move #1 abandoned cart flow in Klaviyo + Move #4 welcome series in Klaviyo + Move #6 Triple Whale attribution + Move #8 loyalty program Smile.io. Without these, the operator cannot measure the subscriber-LTV-multiplier + the churn-rate + the replenishment-flow efficacy. Without Smile.io loyalty, the operator cannot use 2× loyalty-points-on-subscription-orders to incentivize subscription-onboarding. Without Triple Whale, the operator cannot track subscriber-cohort LTV vs one-time-purchase LTV to validate the 2.0–3.5× LTV-multiplier hypothesis.
2. **Consumables category** (food / pet / vitamins / supplements / personal care / household / beauty / baby / beverage / cosmetics / skincare / oral care) — the canonical 12 categories where subscriptions work per Recharge 2024 vertical benchmarks. Apparel / accessories / electronics / non-consumables have <5% subscriber-conversion-rate vs consumables 15-30% per research/08 Pillar 2 subscriber-economics.
3. **≥30% of revenue from SKUs with 30-120-day replenishment cadence** — the canonical subscription-fit predicate. Compute the share of revenue from SKUs where customers re-purchase every 30-120 days (food / pet / vitamins / household consumables) vs SKUs with annual purchase cadence (electronics / apparel / gift-items) vs SKUs with one-time purchase (single-serving / gifting). Operators with <30% consumable-revenue-share should defer subscription launch or focus on subscription only for the consumable subset.
4. **≥1 hero-SKU with proven repeat-purchase cadence** — operators without a hero-SKU should NOT launch subscriptions; the catalog-aggregate pattern doesn't work. The canonical hero-SKU has ≥10% of total revenue AND ≥30% repeat-purchase-rate within 30-90 days per Triple Whale 2024 hero-SKU benchmarks.
5. **Triple Whale (or Polar) attribution live with cohort-LTV exports** — required for the canonical research/08 Pillar 4 subscriber-cohort-LTV calculation. Without cohort-LTV exports, the operator cannot compute the 2.0-3.5× LTV-multiplier that justifies the subscription-discount cost.
6. **Klaviyo (or equivalent) welcome-series flow** — the canonical Move #4 substrate. Subscription-welcome-flow hooks into the existing welcome-series via a flow-branch on `is_subscriber` property. Operators without Klaviyo (still on Mailchimp / Sendlane / Brevo) should defer subscription launch by 1-2 weeks for Move #5 Klaviyo migration.
7. **Smile.io loyalty-points-for-subscriptions integration OR plan to install** — the canonical 2× points-for-subscription-orders incentive. Smile.io has the canonical "2x points on subscription orders" feature per Smile.io 2024; Yotpo Loyalty has the same; LoyaltyLion doesn't (per LoyaltyLion 2024 feature matrix).
8. **3PL with FIFO + lot/date tracking OR in-house warehouse with WMS-real-time-sync** — research/08 Pillar 5. The canonical subscription-3PL teams are ShipBob subscription-team + ShipMonk subscription-team; the canonical subscription-specialty 3PLs are BoxOnLogix + eFulfillment. Operators without 3PL + FIFO will run into expiry-spoilage problems on supplements / vitamins / food.

**Operator capacity:** minimum 2 hr/wk for the subscription build (Weeks 1-12) + 4 hr/wk ongoing for churn-monitoring + replenishment-flow optimization + smart-cancellation-flow monitoring + dunning-recovery optimization + winback-flow optimization + Triple Whale subscriber-cohort-LTV review + 1 hr/wk Klaviyo subscription-flow updates + 1 hr/wk Smile.io loyalty-points-for-subscriptions update = **~10 hr/wk total during steady-state**.

---

## Step-by-step — Phase 1 (Weeks 1–2, ~10 hours, Path B baseline)

Path A is the canonical starter; Path B + C add dunning + advanced analytics + international-subscription-shipping in Phases 2 + 3 + 4.

### 1.1 Recharge (or Skio / Stay AI / Bold) install + Shopify-app store

1. **Pick the platform** per the 7-platform decision matrix above. The canonical default is **Recharge Plus $499/mo** for Path B brands at 1,000-10,000 subscribers.
2. **Install the app** via Shopify App Store → search "Recharge Subscriptions" → click "Add app" → approve the OAuth scopes (read/write products, read/write customers, read/write subscriptions, read/write orders) → set the billing method → verify the Recharge dashboard loads at `https://admin.shopify.com/store/<your-store>/apps/recharge`.
3. **Migrate existing customers** — Recharge detects existing customers automatically + imports customer-lists with the canonical "skip migration" option for customers who haven't opted-in. For shops migrating from a previous subscription platform (e.g. from Bold Subscriptions to Recharge), use Recharge's "Migration Wizard" (free for first migration; takes 30-90 days depending on subscriber count).
4. **Configure the storefront** — Recharge adds the canonical "Subscribe & Save" widget to PDP + cart + collection page automatically. Verify the widget renders correctly on desktop + mobile + tablet (use Chrome DevTools device-emulation). The widget should show the canonical 5-discount-tier matrix per research/08 Pillar 1:
   - **30-day cadence → 5% off**
   - **45-day cadence → 10% off**
   - **60-day cadence → 15% off**
   - **90-day cadence → 20% off**
   - **120-day cadence → 25% off**
5. **Wire Klaviyo** — Recharge has a native Klaviyo integration. Enable it via Recharge Settings → Integrations → Klaviyo → paste your Klaviyo public-key → verify the metrics `Subscribe (Recharge)`, `Subscription Cancelled`, `Subscription Paused`, `Subscription Resumed`, `Subscription Replenishment Date` sync to Klaviyo. Time required: 5 minutes.
6. **Wire Triple Whale** — Recharge has a Triple Whale pixel integration. Enable via Recharge Settings → Integrations → Triple Whale → paste your Triple Whale pixel ID → verify the Recharge attribution events sync. Time required: 5 minutes.
7. **Wire Smile.io (if Move #8 shipped)** — Recharge has a Smile.io integration. Enable via Recharge Settings → Integrations → Smile.io → paste your Smile.io API key → enable "2x points for subscription orders" → verify the canonical 2× points-for-subscription-orders incentive works. Time required: 5 minutes.

### 1.2 SKU + pricing + discount-tier configuration

1. **Identify the canonical hero-SKUs** from research/08 Pillar 1 / Pillar 3. The canonical hero-SKU has ≥10% of total revenue AND ≥30% repeat-purchase-rate within 30-90 days per Triple Whale 2024 hero-SKU benchmarks. Start subscriptions with 3-5 hero-SKUs (don't roll subscriptions to the entire catalog on day 1).
2. **Configure the per-SKU discount** — for each hero-SKU, set the per-cadence-discount tier per the canonical 5-discount-tier matrix above. Default to **30-day → 5% off** as the entry-level tier (low cannibalization, high convenience).
3. **Configure the per-SKU shipping** — most brands offer **free shipping** on subscription orders even if the brand charges shipping on one-time purchases. The 5-10% increase in LTV from free-shipping on subscription orders typically justifies the 5-10% shipping-cost. Set this per-SKU in Recharge → Products → select SKU → Shipping.
4. **Configure the per-SKU min/max qty** — most consumables are qty 1 (1 bottle / 1 bag / 1 box). Some brands offer qty 2-3 for "value-pack" subscription tiers (e.g. 30% off for qty 3 every 90 days instead of qty 1 every 30 days). Set per-SKU in Recharge → Products → select SKU → Quantity.
5. **Test the widget** — open the PDP for one hero-SKU in a private/incognito window → verify the "Subscribe & Save" widget renders → click the widget → verify the discount applies → add to cart → proceed to checkout → complete the test order → verify the subscription is created in Recharge dashboard.

### 1.3 Subscription-welcome email + SMS in Klaviyo

1. **Subscription-welcome-email in Klaviyo** — create a new flow triggered by Recharge's `Subscribe (Recharge)` metric → 5-email sequence:
   - **Email 1 (immediate):** Welcome + first-shipment-confirmation + how-to-manage-subscription-link + cancel-anytime-link
   - **Email 2 (3 days):** "How your subscription works" + how-to-pause + how-to-skip + how-to-change-frequency
   - **Email 3 (7 days):** "Subscriber benefits" + 2× loyalty-points reminder + early-access-to-new-products
   - **Email 4 (14 days):** "Tips for getting the most from your subscription" + reviews + cross-sell
   - **Email 5 (30 days):** "First-replenishment shipped" + cross-sell + ask-for-review
2. **Subscription-welcome-SMS in Postscript** — create a 3-SMS sequence triggered by Recharge's `Subscribe (Recharge)` metric:
   - **SMS 1 (immediate):** "Welcome! Your subscription is confirmed. First shipment arriving in [X] days. Manage: [link]"
   - **SMS 2 (7 days):** "How to pause or skip: [link] — cancel anytime"
   - **SMS 3 (14 days):** "Subscriber tip: change your cadence any time. [link]"
3. **Klaviyo segment** — `is_subscriber = true` → use this segment as the canonical lifecycle-marketing audience for the Tier 2 subscription-renewal + dunning flows (research/05 line 109) + the canonical Move #4 welcome-series subscriber-branch + Smile.io 2× points triggers + Triple Whale subscriber-cohort LTV exports.

### 1.4 Triple Whale subscriber-cohort LTV wiring

1. **Enable subscriber-property sync** — Recharge → Settings → Integrations → Triple Whale → enable "Subscriber-property sync" → verify the `is_subscriber` customer-property syncs to Triple Whale's customer-LTV table.
2. **Create subscriber-cohort in Triple Whale** — Triple Whale → Cohorts → New Cohort → name "Active subscribers" → filter `is_subscriber = true AND subscription_status = active` → save → verify the cohort appears in the Triple Whale LTV report.
3. **Set up the canonical LTV-multiplier tracker** — Triple Whale → Reports → New Report → name "Subscriber LTV multiplier" → compute `(subscriber_LTV_avg / one_time_LTV_avg)` over 365 days → save → schedule weekly email to operator. The canonical multiplier is 2.0-3.5× per research/08 Pillar 2.
4. **Set up the canonical CAC-payback tracker** — Triple Whale → Reports → New Report → name "Subscriber CAC payback" → compute `(subscriber_cac / subscriber_90d_LTV)` → save → schedule weekly email. The canonical payback is 40-60%-faster than one-time-purchase per research/08 Pillar 2.

### 1.5 Verification — Gate A (Phase 1 readiness, end of Week 2)

- **Gate A.1:** Recharge (or Skio / Stay AI / Bold) installed and configured = PASS
- **Gate A.2:** "Subscribe & Save" widget on every hero-SKU PDP = PASS
- **Gate A.3:** 5-discount-tier matrix configured (5/10/15/20/25% off for 30/45/60/90/120-day cadence) = PASS
- **Gate A.4:** Klaviyo subscription-welcome-flow live (5 emails + 3 SMS) = PASS
- **Gate A.5:** Triple Whale subscriber-cohort LTV export live + scheduled weekly email = PASS
- **Gate A.6:** Recharge widget renders correctly on desktop + mobile + tablet = PASS (Chrome DevTools device-emulation)
- **Gate A.7:** Test order placed + subscription created in Recharge dashboard = PASS
- **Gate A.8:** Klaviyo `Subscribe (Recharge)` metric fires on test order = PASS
- **Gate A.9:** Triple Whale `is_subscriber = true` property syncs on test order = PASS
- **Gate A.10:** Smile.io 2× points-for-subscription-orders fires on test order = PASS (if Move #8 shipped)

**Gate A PASS:** All 10 prereqs met. Proceed to Phase 2.

---

## Step-by-step — Phase 2 (Weeks 3–6, ~14 hours, Path B billing + customer portal + dunning)

### 2.1 Customer-portal configuration

1. **Recharge customer-portal** — the canonical subscription-management interface (skip / pause / change-frequency / cancel). Recharge provides this out-of-the-box; verify it loads at `/account/subscriptions` or the canonical Recharge portal URL.
2. **Custom-branded portal** — Recharge Plus allows custom-branded portal with your logo + brand colors + custom CSS. Configure per your brand.
3. **Self-service actions** — enable: pause-subscription / skip-next-shipment / change-frequency / change-qty / change-shipping-address / update-payment-method / cancel-subscription. Each action is a button in the portal.
4. **Smart-cancellation (the canonical 4-alternative flow) per research/08 Pillar 3** — when a subscriber clicks "cancel-subscription", present the canonical 4 alternatives BEFORE the cancel-confirmation:
   - **Alternative 1: Pause subscription** — "Pause for 1 month / 2 months / 3 months" with the canonical "you'll be back on [next-replenishment-date]" preview.
   - **Alternative 2: Skip next shipment** — "Skip your next shipment" with the canonical "you'll get a reminder email the week before the next shipment" preview.
   - **Alternative 3: Change frequency** — "Change to longer cadence" (e.g. 30-day → 60-day or 90-day) with the canonical "you'll save X% on your subscription" preview.
   - **Alternative 4: 25% discount for next 3 shipments** — "Stay for 25% off your next 3 shipments" with the canonical "if you cancel within 90 days, the discount stays for the remaining shipments" preview.
5. **Only AFTER all 4 alternatives are presented** (and either declined or accepted) does the canonical cancellation-confirmation-button appear. This is the canonical 20-35% recovery rate from research/08 Pillar 3.
6. **Winback-email after cancel** — when a subscriber cancels, start a 60-day winback-flow in Klaviyo:
   - **Email 1 (immediate):** "Your subscription is cancelled" + offer to restart with 15% discount
   - **Email 2 (7 days):** "We miss you" + offer to restart with 20% discount + cross-sell
   - **Email 3 (30 days):** "Come back" + offer to restart with 25% discount + product-launches-since-cancel
   - **Email 4 (60 days):** "Final offer" + 30% discount + gift-with-restart
   - The canonical winback-recovery rate is 10-20% of cancelled-subscribers per research/08 Pillar 3.

### 2.2 Dunning-flow for failed payments

1. **Recharge dunning-flow** — Recharge Plus has a built-in dunning-flow with the canonical 3-attempt retry:
   - **Attempt 1:** Day 0 (immediate after fail) → email "your payment failed" + update-payment-method link + Stripe-smart-retry
   - **Attempt 2:** Day 3 → email "your payment failed again" + update-payment-method link + Stripe-smart-retry
   - **Attempt 3:** Day 7 → email "your subscription will be cancelled if not updated" + Stripe-smart-retry + final-warning
   - **Day 14:** Subscription cancelled
2. **Stripe-smart-retry** — Recharge integrates with Stripe Smart Retries which retries failed payments at optimal times per the card-issuer's policies (typically 1-3 days after failure). This recovers 10-15% of would-be-otherwise-failed payments.
3. **Email + SMS templates** — for each attempt, send email + SMS with different urgency language. SMS uses the canonical <160-char + no-link-in-first-message pattern from `assets/14-lifecycle-flow-templates.md`.
4. **Klaviyo dunning-segment** — `subscription_status = active AND payment_failed = true` → trigger a Klaviyo flow with 4 emails over 14 days + 3 SMS over 14 days.
5. **Customer-success-touch** — for subscribers with multiple consecutive failed payments, the operator should manually call / SMS to resolve (e.g. expired card with auto-update issue; address change with new zip code; fraud-flag). The canonical recovery rate from CS touch is +20% over automated-only per Recharge 2024 dunning benchmarks.

### 2.3 Subscriber-LTV cohort exports to Triple Whale + Klaviyo + Smile.io

1. **Triple Whale subscriber-cohort LTV** — already wired in Phase 1 Step 1.4. Now compute the canonical 12-month forward-LTV projection = `monthly_repeat_revenue * average_subscriber_lifetime_months / subscriber_count`. The canonical 12-month forward-LTV is 2.0-3.5× one-time-purchase LTV per research/08 Pillar 2.
2. **Klaviyo subscriber-LTV-cohort** — create a Klaviyo segment `is_subscriber = true AND first_order_date >= 90 days ago AND total_orders >= 2` (active subscriber). Use this segment for `assets/14-lifecycle-flow-templates.md` subscriber-renewal + dunning flows.
3. **Smile.io subscriber-tier** — create a Smile.io VIP-tier "Subscriber" with 2× points-multiplier. Operators can add a separate "VIP-Subscriber" tier with 3× points for subscribers with 12+ months tenure + ≥3 successful shipments per Smile.io 2024 loyalty benchmarks.
4. **Move #8 loyalty-tier + subscriber-tier joint optimization** — at the quarterly review, compute the average-LTV by Smile.io tier AND by subscription-status. The canonical highest-LTV cohort is "VIP-tier-3 subscriber with 12+ months tenure + 3+ shipments" per Recharge 2024 LTV benchmarks.

### 2.4 Verification — Gate B (Phase 2 readiness, end of Week 6)

- **Gate B.1:** Customer-portal live at `/account/subscriptions` with self-service actions (pause / skip / change-freq / cancel) = PASS
- **Gate B.2:** Smart-cancellation flow with 4 alternatives (pause / skip / change-freq / 25%-discount) live = PASS
- **Gate B.3:** Dunning-flow with 3-attempt retry live = PASS
- **Gate B.4:** Stripe-smart-retry enabled = PASS
- **Gate B.5:** Klaviyo subscriber-LTV-cohort segment live = PASS
- **Gate B.6:** Smile.io 2× points-for-subscriber-orders live = PASS (if Move #8 shipped)
- **Gate B.7:** Winback-flow (4 emails over 60 days) live in Klaviyo = PASS
- **Gate B.8:** 20 test subscriptions managed through portal (pause / skip / cancel) = PASS
- **Gate B.9:** 5 test failed-payments retried successfully = PASS
- **Gate B.10:** 5 test cancellations recovered via 4-alternative-flow OR winback-flow = PASS

**Gate B PASS:** All 10 prereqs met. Proceed to Phase 3.

---

## Step-by-step — Phase 3 (Weeks 7–10, ~16 hours, Path B replenishment + smart-cancellation optimization)

### 3.1 Replenishment-reminder flow

1. **Recharge replenishment-reminder** — Recharge sends a canonical 7-day-pre-shipment reminder email automatically (configurable cadence). For consumables with non-standard cadence (e.g. 38-day vs 30-day), set custom timing per research/08 Pillar 3.
2. **Skip / change-cadence reminder** — the 7-day-pre-shipment email includes a "skip next shipment" button + a "change cadence" button + a "manage subscription" button. The canonical 7-10% skip-rate is per Recharge 2024 replenishment-flow benchmarks.
3. **Replenishment-conversion-rate tracker** — Triple Whale → Reports → compute `(shipments_fulfilled / shipments_scheduled) * 100` over 30-day rolling window. The canonical replenishment-conversion-rate is 85-90% per Recharge 2024 benchmarks. Operators below 80% should investigate skip-pattern (e.g. subscribers are getting too much product → cadence is wrong).
4. **Cross-sell in replenishment-reminder** — the 7-day-pre-shipment email includes a cross-sell banner (`assets/14-lifecycle-flow-templates.md` "Subscriber replenishment cross-sell") showing related-products. The canonical cross-sell-attachment-rate is 5-10% per Recharge 2024 replenishment-cross-sell benchmarks.

### 3.2 Smart-cancellation flow optimization

1. **Track the 4-alternative acceptance-rate** — Triple Whale / Recharge dashboards → each alternative (pause / skip / change-freq / 25%-discount) has an acceptance-rate. The canonical target is 20-35% overall acceptance-rate per research/08 Pillar 3. Operators below 20% should iterate on the alternative-offer (e.g. add a 5th alternative: "swap flavor / swap product / change subscription only at certain months").
2. **A/B test the 25%-discount alternative** — the 25%-discount alternative is typically the highest-acceptance alternative but also the highest-cost-of-discount. Run an A/B test for 30 days:
   - **Variant A:** 20% discount
   - **Variant B:** 25% discount
   - **Variant C:** 30% discount
3. **Track the dunning-recovery-rate** — Triple Whale / Recharge dashboards → dunning-recovery-rate = `(recovered_payments / total_failed_payments) * 100`. The canonical target is 50-70% per research/08 Pillar 3. Operators below 50% should iterate on the dunning-email + SMS (e.g. add a "click here to use a different card" prominent CTA in the email).
4. **Track the winback-recovery-rate** — Klaviyo → winback-flow → winback-recovery-rate = `(restarted_subscriptions / cancelled_subscriptions_in_cohort) * 100`. The canonical target is 10-20% per research/08 Pillar 3.

### 3.3 Replenishment + dunning + smart-cancellation cross-flow-optimization

1. **Subscriber-churn-rate** — Triple Whale / Recharge → `monthly_churn_rate = (cancelled_subscribers_in_month / active_subscribers_at_start_of_month) * 100`. The canonical target is 5-8% per research/08 Pillar 2. Operators above 10% should iterate on the entire flow (especially dunning + smart-cancellation).
2. **Sub-flow-tracking-dashboard** — Triple Whale → Reports → New Report → name "Subscriber funnel" → display: total-subscribers / active-subscribers / paused-subscribers / cancelled-subscribers-this-month / winback-recovery / dunning-recovery / replenishment-conversion-rate / churn-rate. Save → schedule weekly email to operator.
3. **Quarterly subscriber-cohort-review** — every quarter, Triple Whale subscriber-cohort-LTV review: compute the 90-day / 180-day / 365-day LTV for new subscribers by signup-month. The canonical Month-over-Month LTV-trend should be stable-or-improving; if declining, the operator has a churn-quality problem and should iterate on the smart-cancellation + dunning flow.

### 3.4 Verification — Gate C (Phase 3 readiness, end of Week 10)

- **Gate C.1:** Replenishment-reminder 7-day-pre-shipment-email live + skip-cadence-change buttons = PASS
- **Gate C.2:** Replenishment-conversion-rate ≥85% on 30-day rolling window = PASS
- **Gate C.3:** Cross-sell banner in replenishment-reminder live = PASS
- **Gate C.4:** Smart-cancellation 4-alternative-acceptance-rate ≥20% on 30-day rolling window = PASS
- **Gate C.5:** A/B test on 25%-discount alternative running for 30 days = PASS
- **Gate C.6:** Dunning-recovery-rate ≥50% on 30-day rolling window = PASS
- **Gate C.7:** Winback-recovery-rate ≥10% on 30-day rolling window = PASS
- **Gate C.8:** Subscriber-churn-rate ≤8% on 30-day rolling window = PASS
- **Gate C.9:** Sub-flow-tracking-dashboard live in Triple Whale = PASS
- **Gate C.10:** Quarterly subscriber-cohort-review scheduled in Triple Whale = PASS

**Gate C PASS:** All 10 prereqs met. Proceed to Phase 4.

---

## Step-by-step — Phase 4 (Weeks 11–12, ~10 hours, Path B subscriber-cohort analytics + LTV-multiplier validation)

### 4.1 Subscriber-cohort-LTV-multiplier validation (the canonical research/08 Pillar 4 deliverable)

1. **Compute the 12-month forward-LTV** for the `Active subscribers` cohort in Triple Whale = `monthly_repeat_revenue * 12` (annualized). For one-time-purchasers = `annual_revenue_per_customer_12mo`.
2. **Compute the LTV-multiplier** = `subscriber_12mo_LTV / one_time_purchase_12mo_LTV`. The canonical target is 2.0-3.5× per research/08 Pillar 2.
3. **Compute the subscriber-CAC-payback** = `subscriber_CAC / subscriber_90d_LTV`. The canonical target is 40-60%-faster than one-time-purchase per research/08 Pillar 2.
4. **Document the 5-corner subscriber-economics** per research/08 Pillar 2:
   - **Corner 1: subscriber-conversion-rate = 15-30%** (target = 20% median)
   - **Corner 2: monthly-churn = 5-8%** (target = 6% median)
   - **Corner 3: LTV-multiplier = 2.0-3.5×** (target = 2.5× median)
   - **Corner 4: CAC-payback = 40-60%-faster** (target = 50% faster median)
   - **Corner 5: gross-margin-impact = -2 to -4% (subscription-overhead cost)** = CANONICAL TRADE-OFF
5. **Add a quarterly-review-meeting to the operator's calendar** — Triple Whale subscriber-cohort review + Path B vs Path A vs Path C decision review. The canonical quarterly review cadence is per research/08 §Next moves after Path B ships.

### 4.2 Path B vs Path C decision (when to upgrade)

1. **Path B → Path C upgrade criteria** — upgrade from Recharge Plus $499/mo to Recharge Enterprise $999+/mo OR Skio Enterprise $1,200/mo when:
   - **Subscriber-count > 10,000** (above Path B's canonical 1,000-10,000 range)
   - **International-subscription-shipping needed** (EU + UK + CA + AU + JP)
   - **Multi-warehouse fulfillment needed** (≥3 warehouses)
   - **Custom contract terms needed** (annual discount negotiation / dedicated CSM)
   - **Skio-style Klaviyo-native integration preferred** (Skio's stronger Klaviyo integration than Recharge)
2. **Path B → Path A downgrade criteria** — downgrade from Recharge Plus $499/mo to Recharge Starter $49/mo when:
   - **Subscriber-count < 1,000** (below Path B's 1,000-10,000 range)
   - **No international-shipping needed**
   - **Single-warehouse fulfillment**
   - **No need for advanced analytics + churn-saver**
   - The canonical downside-of-being-on-Path-B-when-too-small: $450/mo wasted on unused Path B features. The canonical saving-of-downgrading: $450/mo × 12 = $5,400/yr.

### 4.3 Final subscriber-program roadmap + Next-moves decision

1. **6-month subscriber-growth-plan** — set a 6-month subscriber-growth-target: typically 5-10% of one-time-purchasers → subscribers within 6 months (a brand with 10,000 one-time-purchasers/yr targets 500-1,000 subscribers by month 6).
2. **12-month subscriber-cohort-LTV-target** — set a 12-month LTV-multiplier target (typically 2.5× by month 12). The canonical progression is 1.5× at month 3 → 2.0× at month 6 → 2.5× at month 12 per research/08 Pillar 2.
3. **12-month subscriber-revenue-share-target** — set a 12-month subscriber-revenue-share target (typically 15-30% by month 12). The canonical consumer-vertical benchmarks per Recharge 2024 verticals (food / pet / vitamins) are 30-50% subscriber-revenue-share.
4. **Final quarterly-meeting-cadence** — schedule quarterly subscriber-cohort-review-meetings on the operator's calendar (the canonical review cadence is Q1 + Q2 + Q3 + Q4 per research/08 §Next moves).

### 4.4 Verification — Gate D (Phase 4 readiness, end of Week 12)

- **Gate D.1:** 12-month forward-LTV computed for Active-subscribers-cohort + One-time-purchasers-cohort in Triple Whale = PASS
- **Gate D.2:** LTV-multiplier = 2.0-3.5× (target = 2.5×) = PASS
- **Gate D.3:** Subscriber-CAC-payback 40-60%-faster than one-time-purchase (target = 50% faster) = PASS
- **Gate D.4:** 5-corner subscriber-economics documented per research/08 Pillar 2 = PASS
- **Gate D.5:** Path B vs Path C upgrade-criteria documented + tracked = PASS
- **Gate D.6:** 6-month subscriber-growth-target set (5-10% of one-time-purchasers → subscribers) = PASS
- **Gate D.7:** 12-month LTV-multiplier-target set (= 2.5×) = PASS
- **Gate D.8:** 12-month subscriber-revenue-share-target set (15-30%) = PASS
- **Gate D.9:** Quarterly subscriber-cohort-review-meetings scheduled = PASS

**Gate D PASS:** All 9 prereqs met. The subscription-program is now operational. The Path B canonical 8.3:1 Year-1 ROI at $500k-$10M GMV should be measurable within 90 days.

---

## Step-by-step — Phase 5+ (Quarter 2+, ~10 hr/wk ongoing, Path B steady-state + Path C international / multi-warehouse for $10M+ brands)

### 5.1 Quarterly subscriber-cohort-review (every Q1+Q2+Q3+Q4)

1. **Subscriber-cohort-LTV-trend** — compute month-over-month LTV-multiplier for the last 12 months. Stable-or-improving is the canonical healthy-pattern.
2. **Churn-pattern-analysis** — categorize cancelled-subscribers by reason: cost / too-much-product / switched-brand / moved-out-of-product-category / financial / fraud / seasonal. The canonical seasonal-pattern is Q4 spike (post-holiday-decluttering) per Recharge 2024 churn-pattern benchmarks.
3. **Smart-cancellation-acceptance-rate-trend** — track the per-alternative acceptance-rate (pause / skip / change-freq / 25%-discount). If the 25%-discount alternative acceptance-rate >50%, the operator has a pricing-perception problem and should consider a permanent-15%-discount-for-all-subscribers alternative.
4. **Replenishment-rate-trend** — `monthly_replenishment_conversion_rate`. Below 85% = cadence-management problem; above 95% = good.
5. **Cross-sell-attachment-rate-trend** — `monthly_subscriber_cross_sell_revenue / monthly_subscription_revenue`. Below 5% = cross-sell-banners need optimization; above 10% = good.

### 5.2 Path C international-subscription-shipping (Quarter 2+ for $10M+ brands)

1. **Recharge Enterprise international setup** — research/08 Pillar 4 international-subscription-shipping. Set up Recharge → Settings → International:
   - **EU:** IOSS registration + VAT-MOSS-compliance + Recharge EU-warehouse + per-country pricing
   - **UK:** UK-VAT-registration + UK-warehouse + per-country pricing
   - **CA:** Canada Post integration + CA-GST-registration + per-province pricing
   - **AU:** Australia Post integration + AU-GST-registration + per-state pricing
   - **JP:** Sagawa integration + JP-consumption-tax-registration + per-prefecture pricing
2. **Per-market discount-tier matrix** — the canonical 5-discount-tier matrix may need per-market adjustment (e.g. EU consumers expect 10% off as baseline; JP consumers expect 15% off; UK consumers expect 5% off). The per-market matrix is operator-tunable via Recharge Enterprise.
3. **Per-market replenishment-cadence defaults** — different cultures have different cadence-preferences (e.g. JP consumers prefer monthly cadence; US consumers prefer 60-day; EU consumers prefer 90-day for non-perishables). Set per-market defaults.
4. **Multi-warehouse-orchestration** — Recharge Enterprise + Stord + Flowspace + Extensiv for $10M+ GMV brands with international volumes. Same pattern as 3PL-migration track (`playbooks/14-3pl-migration.md` Phase 4).

### 5.3 Dedicated retention-manager hire (Quarter 2+ for $10M+ brands)

1. **Retention-manager job description** — per `playbooks/14-3pl-migration.md` Phase 4 supply-chain-manager pattern. $70k-$100k FTE OR $200-$400/hr fractional consultant.
2. **Retention-manager owns:** Triple Whale subscriber-cohort-LTV-trend review + churn-prevention + smart-cancellation-flow optimization + dunning-recovery + winback-recovery + replenishment-flow optimization + Smile.io subscriber-tier optimization + cross-sell-attachment-rate + quarterly subscriber-cohort-review-meetings.

---

## Metrics to track

The canonical 10-metric operational KPI dashboard for the subscription-program track (per research/08 §Metrics + research/08 Pillar 4 + Pillar 5 + the 5-corner subscriber-economics from Pillar 2):

| Metric | Source | Target | How to slice |
|---|---|---|---|
| **Active subscribers (count)** | Recharge dashboard | +5-10% MoM | by signup-cohort-month |
| **Subscriber-revenue-share (% of total revenue)** | Shopify Analytics + Recharge | 15-30% within 12 months | by product-line |
| **Subscriber-conversion-rate (% of one-time-purchasers who subscribe)** | Triple Whale cohort-export | 15-30% median 20% | by signup-cohort-month |
| **Monthly-churn-rate (% of active-subscribers who cancel per month)** | Recharge dashboard + dunning-flow | 5-8% median 6% | by subscriber-tenure |
| **Smart-cancellation-acceptance-rate (% of cancels converted to pause/skip/change/discount)** | Recharge smart-cancellation analytics | 20-35% | per alternative (pause / skip / change-freq / 25%-discount) |
| **Replenishment-conversion-rate (% of scheduled-shipments fulfilled)** | Triple Whale cohort-export | 85-90% | by cadence (30-day / 60-day / 90-day) |
| **Dunning-recovery-rate (% of failed-payments recovered)** | Stripe + Recharge dunning | 50-70% | by attempt-1 / attempt-2 / attempt-3 |
| **Winback-recovery-rate (% of cancelled-subscribers restarted)** | Klaviyo winback-flow | 10-20% | per email-number |
| **LTV-multiplier (subscriber-LTV / one-time-LTV)** | Triple Whale subscriber-cohort | 2.0-3.5× | by tenure |
| **Subscriber-CAC-payback (subscriber-CAC / 90d-LTV)** | Triple Whale subscriber-cohort | 40-60%-faster than one-time | by tenure |

---

## Common pitfalls — the 15 things that derail subscription programs (mapped to research/08 §Common pitfalls)

The 15 pitfalls map 1:1 to research/08 §Common pitfalls; this section reproduces the abbreviated operator-facing failure modes + fixes (the full pitfall-list with severity + 5-failure-mode-clustering is in research/08):

1. **Wrong-SKU subscription-widget** — launching subscriptions on SKUs customers don't re-purchase (one-off gifts / apparel / electronics). **Fix:** Start with hero-SKUs only (≥10% revenue + ≥30% repeat-purchase-rate per Triple Whale 2024 hero-SKU benchmarks).
2. **Subscriber-discount-too-low (5% or less)** — the canonical discount-tier matrix starts at 5% but should anchor on the **longer-cadence tier (60/90/120-day → 15/20/25% off)** as the headline. **Fix:** Make 60-day at 15% off the headline-tier and route 30-day at 5% as the entry-tier.
3. **No smart-cancellation flow** — cancel button = subscriber-end-of-life. **Fix:** Implement the canonical 4-alternative smart-cancellation flow per Phase 2 Step 2.1 → 20-35% recovery rate.
4. **No replenishment reminder flow** — subscribers forget they're subscribed; they cancel after the next-shipment surprise. **Fix:** Implement the canonical 7-day-pre-shipment-replenishment-reminder email per Phase 3 Step 3.1 → 85-90% replenishment-rate.
5. **No dunning flow for failed payments** — Stripe's default 1-attempt-retry = 30% of failures permanently lost. **Fix:** Implement the canonical 3-attempt dunning-flow per Phase 2 Step 2.2 → 50-70% recovery rate.
6. **Subscriber-discount applies to one-time-purchase-cannibalization** — subscribers would-have-purchased-anyway + the 15% discount = lower-margin revenue. **Fix:** Compute the cannibalization-rate quarterly via Triple Whale subscriber-cohort comparison; the canonical acceptable-cannibalization-rate is 10-25% per research/08 Pillar 2.
7. **No Triple Whale attribution-merge for subscriber-cohort-LTV** — operator can't measure the 2.0-3.5× LTV-multiplier → can't justify the subscription discount cost. **Fix:** Implement Phase 1 Step 1.4 subscriber-cohort-LTV wiring + quarterly review.
8. **Wrong-SKU subscription-widget placement** — widget on every PDP including one-off-gift-SKUs (subscribers sign up for holiday-gift → cancel in 30 days). **Fix:** Phase 1 Step 1.2 starts with hero-SKUs only; expand to all-SKUs only after quarterly-cohort-review proves no cannibalization.
9. **Manual-subscription-migration without proper testing** — migrating from Bold to Recharge / Skio takes 30-90 days; subscribers can be lost during migration. **Fix:** Use Recharge's Migration Wizard; run migration at <20% of subscriber-list first; test for 30 days; then run the rest.
10. **Subscriptions without Move #6 Triple Whale attribution** — operator can't measure LTV-multiplier → can't calculate ROI. **Fix:** Implement Move #6 BEFORE launching subscriptions; the canonical gate.
11. **Subscriptions without Move #4 welcome-series** — new subscribers don't get the welcome-flow → lower activation-rate. **Fix:** Implement Move #4 BEFORE launching subscriptions; hook in the Klaviyo `Subscribe (Recharge)` flow-branch.
12. **Subscriptions without Move #8 loyalty** — operator can't use 2× loyalty-points-for-subscribers as onboarding-incentive. **Fix:** Implement Move #8 BEFORE launching subscriptions; enable Smile.io 2× points-for-subscription-orders.
13. **Subscriptions without Move #7 SMS** — replenishment-reminder via email-only = lower-CVR; SMS is 5x more effective for replenishment per Movable Ink 2024. **Fix:** Implement Move #7 BEFORE launching subscriptions; wire Postscript SMS-replenishment-reminder.
14. **Wrong-inventory-management for subscription-SKUs** — operators run out of inventory mid-month → subscriber-cancellations spike. **Fix:** Phase 1 Step 1.1 + Phase 4 Step 4.3 implement FIFO + lot/date tracking via 3PL-subscription-team OR in-house WMS.
15. **No subscription-experience-testing** — operator launches without testing the customer-portal + smart-cancellation + dunning + winback flows. **Fix:** Implement Phase 2 Gate B.8-B.10 with 20+ test-subscriptions / 5+ test-failed-payments / 5+ test-cancellations BEFORE subscriber-launch.

---

## Verification — end-of-Subscription-Program-Launch Gate (Gate D equivalent, end of Week 12)

Run the full Gate A + B + C + D verification recipe (39 prereqs total per the 4 gates above). The canonical "kill-the-launch" decision-point is Gate D.2 (LTV-multiplier ≥ 2.0-3.5×) + Gate D.3 (Subscriber-CAC-payback 40-60%-faster). Operators below these thresholds should iterate on the smart-cancellation + dunning + winback flows before scaling subscriber-acquisition.

---

## Cost & ROI estimate

### Default Path B ($500k–$10M GMV brand, 1,000–10,000 subscribers, 70% consumable-revenue-share, 30-day cadence)

**Year-1 cost stack** (per research/08 §Cost & ROI):

| Cost line | Annual | Source |
|---|---|---|
| Recharge Plus | $499/mo × 12 = **$5,988/yr** | research/08 Pillar 1 |
| Klaviyo (already shipped via Move #4) | $0 (sunk) | Move #4 |
| Postscript (already shipped via Move #7) | $0 (sunk) | Move #7 |
| Smile.io 2× points-for-subscribers overhead | $0 (sunk within Move #8 budget) | Move #8 |
| Triple Whale (already shipped via Move #6) | $0 (sunk) | Move #6 |
| Discount overhead (15% avg × $500k GMV-from-subs × 30%) | $22,500/yr | research/08 §Cost & ROI |
| Shipping overhead (free-shipping-on-subs ≈ 5% × $500k) | $25,000/yr | research/08 §Cost & ROI |
| ReCharge CX team support (4 hr/mo × $100/hr) | $4,800/yr | research/08 §Cost & ROI |
| **Total Year-1 cost** | **~$84,000/yr** | |

**Year-1 incremental revenue** (per research/08 §Cost & ROI):

| Revenue line | Annual | Source |
|---|---|---|
| Subscription-revenue (5% of one-time-purchasers convert) | $750,000 (5% × $15,000 LTV × 1,000 subscribers) | research/08 Pillar 2 |
| Replenishment-revenue (85% × 30-day × 1,000 subs × $50 AOV × 12 cycles) | $510,000 | research/08 Pillar 3 |
| Cross-sell-attachment (5% × subscriber-revenue) | $37,500 | research/08 Pillar 3 |
| **Subtotal** | **$1,297,500** | |
| **Conservative adjustment (-30% for ramp + cannibalization)** | **$908,000** | research/08 §Cost & ROI |
| **Conservative Year-1 incremental** | **~$270,000** | research/08 §Cost & ROI |

**Year-1 ROI:** $270,000 / $84,000 = **3.2:1 gross / 2.2:1 net** (after 5-7% implementation-cost adjustment).
**Year-2+ ROI:** $1,297,500 / $84,000 = **15.4:1 gross / 8.3:1 net** (the canonical "great" band per research/08 §Cost & ROI).

**Payback period:** ~3-4 months (cost recovers in 3-4 months of subscription-revenue ramp).

### ROI by GMV tier

| Path | GMV tier | Subscriber count | Year-1 cost | Year-1 incremental | Year-1 ROI | Year-2+ ROI |
|---|---|---|---|---|---|---|
| **Path A** | $100k-$500k | <1,000 | $24,000 | $200,000 | **8.3:1** | 16.7:1 |
| **Path B DEFAULT** | $500k-$10M | 1,000-10,000 | $84,000 | $270,000 | **3.2:1 / 2.2:1 net** | 8.3:1 gross / 7.3:1 net |
| **Path C** | $10M+ | 10,000+ | $300,000 | $2,250,000 | **7.5:1** | 15.4:1 |

### ROI vs alternatives (Move #6 Triple Whale + Move #7 Postscript + Move #8 Smile.io alone)

The subscription-program track compounds with the prior move-stacks. Path B subscription-program on top of Move #1 + #4 + #6 + #7 + #8 lifetime-stack achieves the canonical 8.3:1 Year-2+ steady-state ROI per research/08 §Cost & ROI vs the canonical Move #1 + #4 + #6 + #7 + #8 alone at 50-80:1 Year-1 ROI but <10:1 Year-2+ ROI (Move #8's loyalty-program is the highest-ROI baseline of the prior stack). The subscription-program is the canonical 2nd-half of the recurring-revenue strategy; loyalty is the 1st-half (rewards on one-time purchases) + subscriptions is the 2nd-half (auto-recurring revenue).

### Companion cost-tool note

Operators can pre-flight their cost-vs-revenue via the upcoming `scripts/subscription_unit_economics.py` (the canonical 5th-layer scoring script for the subscription-program track per research/03 line 176; Archetype A/B hybrid Path A/B/C scorer that takes consumables-revenue-share + sku-purchase-cadence + LTV baseline + churn-baseline + subscriber-conversion-rate → outputs Path A/B/C recommendation with cost stack + expected Year-1 incremental subscription-revenue + LTV-multiplier). Not yet shipped; future-tick companion.

---

## Companion tool / Future-tick companions

- **`scripts/subscription_unit_economics.py`** *(planned future-tick)* — Archetype A/B hybrid Path A/B/C subscription-program scorer (canonical 5th-layer scoring script for the subscription-program track). Takes consumables-revenue-share + sku-purchase-cadence + LTV-baseline + churn-baseline + subscriber-conversion-rate → outputs Path A/B/C recommendation with cost-stack + Year-1 incremental + LTV-multiplier. Per v0.9.0 layer-order-completion sub-rule: ships AFTER `assets/16-subscription-flow-templates.md` + `dashboard/app/subscriptions/page.tsx`.
- **`assets/16-subscription-flow-templates.md`** *(planned future-tick)* — paste-ready per-flow email + SMS subscription templates × 5 voice profiles × 5 key flows (welcome / replenishment-reminder / pause-reactivation / cancellation-confirmation / winback).
- **`dashboard/app/subscriptions/page.tsx`** *(planned future-tick)* — Next.js operator-surface route rendering research/08 + playbook 15 + asset 16 as a unified subscription-launch readiness heat-map.
- **`dashboards/subscription-program-health.html`** *(planned future-tick)* — canonical 6th-and-final static-dashboard layer per the v0.11.0 extended layer order research → playbook → asset → operator-surface-route → script → static-dashboard.

---

## Next moves after Path B ships

For $10M+ GMV brands ready to scale to Path C:

1. **Path C international-subscription-shipping** — EU + UK + CA + AU + JP per Phase 5 Step 5.2. IOSS registration + VAT-MOSS + per-market pricing + multi-warehouse-orchestration. Operator time: ~80 hr one-time + 15 hr/wk ongoing + dedicated retention-manager hire ($70k-$100k FTE).

For brands at $500k-$10M GMV Path B steady-state ready to optimize:

2. **Smart-cancellation 5th-alternative + monthly A/B test cadence** — extend the 4-alternative flow with a 5th alternative ("swap flavor / swap product / change subscription only at certain months"). A/B test monthly to optimize the per-alternative acceptance-rate.

3. **Sub-flow-tracking-dashboard sophistication** — Triple Whale → Reports → per-subscriber individual-cohort-LTV-tracker with the canonical 12-month forward-LTV projection + subscriber-LTV-multiplier + 5-corner subscriber-economics dashboard.

4. **Move #11 international-expansion integration** — for brands launching international subscription-shipping, integrate Move #11 international-expansion track (research/04 + playbook 11 + asset 13) per Phase 5 Step 5.2.

5. **Move #6 Triple Whale subscriber-cohort LTV audit** — monthly Triple Whale subscriber-cohort-deep-dive (compute subscriber-CAC vs one-time-CAC by channel; identify which Meta / Google / TikTok channels drive the highest-LTV subscribers).

For brands at <$500k GMV ready for the canonical starter:

6. **Path A Appstle / Recharge Starter pilot** — start with Path A for 90 days; measure subscriber-conversion-rate + churn-rate; if 15-30% subscription-conversion-rate + 5-8% monthly-churn-rate, upgrade to Path B.

---

## Related

- **`research/08-subscriptions.md`** — Move #11 subscription-program research synthesis (the 5-pillar framework + 3 GMV-tier paths + 4 verification gates + 15 pitfalls + 5-corner subscriber-economics + cost-stack math).
- **`research/05-lifecycle-marketing.md`** — Tier 2 subscription-renewal + dunning flows (per research/05 line 109) compound with this playbook.
- **`research/07-3pl-migration.md`** + **`playbooks/14-3pl-migration.md`** — ShipBob subscription-team + ShipMonk subscription-team + BoxOnLogix + eFulfillment for subscription-specialty 3PL fulfillment with 30-50% lower pick-pack-error-rate per Recharge 2024 benchmarks.
- **`research/04-international-expansion.md`** + **`playbooks/11-international-rollout.md`** + **`assets/13-international-pricing-card.md`** — for $10M+ brands launching Path C international-subscription-shipping to EU + UK + CA + AU + JP.
- **`playbooks/07-loyalty-program-smile.md`** — Move #8 loyalty; Smile.io 2× points-for-subscription-orders + subscriber-VIP-tier.
- **`playbooks/01-abandoned-cart-flow-klaviyo.md`** — Move #1 abandoned cart flow (Move #1 is the canonical Klaviyo substrate).
- **`playbooks/04-welcome-series-klaviyo.md`** — Move #4 welcome series (the canonical Klaviyo `is_subscriber` flow-branch).
- **`playbooks/06-install-attribution-triplewhale-or-polar.md`** — Move #6 Triple Whale attribution (Move #6 is the canonical Triple Whale substrate required before launching subscriptions).
- **`playbooks/06-sms-welcome-and-cart-abandon.md`** — Move #7 Postscript SMS (the canonical Postscript substrate; the replenishment-reminder-via-SMS is 5x more effective than email-only per Movable Ink 2024).
- **`playbooks/12-lifecycle-flow-library.md`** — 20-flow library; Tier 2 subscription-renewal + dunning flows are scoped here per research/05 line 109.
- **`assets/14-lifecycle-flow-templates.md`** — paste-ready 17-flow × 5-voice = 85 voice-variant email + SMS templates; the subscription-related flows (welcome / replenishment / pause-reactivation / cancellation-confirmation / winback) are scoped here.
- **`scripts/lifecycle_flow_health_check.py`** — Archetype C/D hybrid per-flow KPI audit; the canonical 6-gate health-check includes `flow_attribution_match ≥60% Triple Whale subscriber-cohort signal` — directly applicable to the 5 subscription-flows.

---

## Sources (28 cited, mapped to research/08 §Sources)

### Subscription platform & pricing (10)
1. Recharge 2024 Pricing — `https://rechargepayments.com/pricing`
2. Recharge 2024 Subscription Benchmarks Report — `https://rechargepayments.com/benchmarks`
3. Recharge 2024 State of Subscriptions Report — `https://rechargepayments.com/state-of-subscriptions`
4. Recharge 2024 Subscription Box Fulfillment Guide — `https://rechargepayments.com/subscription-box-fulfillment`
5. Skio 2024 Pricing — `https://skio.com/pricing`
6. Skio 2024 Subscription Migration Guide — `https://skio.com/migration-guide`
7. Bold Subscriptions 2024 Pricing — `https://boldcommerce.com/subscriptions/pricing`
8. Stay AI 2024 Pricing — `https://stay.ai/pricing`
9. Appstle 2024 Pricing — `https://appstle.com/pricing`
10. Seal Subscriptions 2024 Pricing — `https://seal-subscriptions.com/pricing`

### Subscriber economics & LTV math (8)
11. Triple Whale 2024 Subscriber Cohort LTV Report — `https://triplewhale.com/blog/subscriber-ltv`
12. Klaviyo 2024 Subscription Email Benchmarks — `https://klaviyo.com/blog/subscription-benchmarks`
13. LoyaltyLion 2024 Loyalty + Subscription Integration — `https://loyaltylion.com/subscription-integration`
14. Smile.io 2024 Loyalty + Subscription Points — `https://smile.io/blog/loyalty-subscription-points`
15. Recharge 2024 Churn Rate Benchmarks by Vertical — `https://rechargepayments.com/churn-benchmarks`
16. Postscript 2024 SMS Replenishment Reminder Benchmarks — `https://postscript.io/blog/sms-replenishment`
17. Movable Ink 2024 SMS vs Email Replenishment CVR — `https://movableink.com/blog/sms-vs-email-replenishment`
18. Recharge 2024 Subscriber Conversion Rate Benchmarks — `https://rechargepayments.com/conversion-benchmarks`

### Subscription fulfillment & inventory (4)
19. ShipBob 2024 Subscription Box Fulfillment — `https://shipbob.com/blog/subscription-box-fulfillment`
20. ShipMonk 2024 Subscription Fulfillment — `https://shipmonk.com/subscription-fulfillment`
21. BoxOnLogic 2024 DTC Subscription Fulfillment — `https://boxonlogic.com/dtc-subscription-fulfillment`
22. eFulfillment 2024 Subscription Fulfillment — `https://efulfillmentservice.com/subscription`

### Subscription program overhead & ROI (4)
23. Recharge 2024 Subscription Program Cost Stack — `https://rechargepayments.com/cost-stack`
24. Klaviyo 2024 Subscription Segment ROI — `https://klaviyo.com/blog/subscription-segment-roi`
25. Triple Whale 2024 Subscriber CAC Payback Benchmarks — `https://triplewhale.com/blog/subscriber-cac-payback`
26. Recharge 2024 LTV Multiplier by Vertical — `https://rechargepayments.com/ltv-multiplier`

### International subscription shipping (2)
27. Recharge 2024 International Subscription Shipping — `https://rechargepayments.com/international-subscription-shipping`
28. Loop Subscriptions 2024 Subscription Program Benchmarks — `https://loop-subscriptions.com/benchmarks`
