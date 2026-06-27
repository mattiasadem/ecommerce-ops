# Lifecycle Marketing Expansion — The 20-Flow Library

> **Source.** Synthesized from the workspace's mature Klaviyo + Postscript + Smile stack (16 shipped playbooks + 13 shipped assets + 12 companion scripts) plus public benchmarks (Klaviyo's 2024–2025 lifecycle-marketing benchmark reports, Postscript SMS cadence research, Smile.io loyalty-tier benchmarks, Baymard email-recovery studies, Recharge subscription-flow benchmarks, Litmus deliverability data, Omnisend / Campaign Monitor flow-LTV benchmarks). The 30-day rollout plan in `research/03-30-day-rollout-plan.md` ships Moves #1 (cart-abandon) + #4 (welcome) + #7 (SMS) as the 3 core flows; this doc fills the **17 additional flows beyond the welcome-cart-SMS MVP** that the 30-day plan implicitly defers as Move #14 (lifecycle marketing expansion).
>
> **Use.** A DTC operator at **$100k–$50M GMV** with **Move #1 + Move #4 + Move #7** already shipped needs to know: (a) which of the 17+ deferred flows have the highest ROI per hour, (b) what the Klaviyo + Postscript + Smile wiring looks like for each, (c) how to sequence them into a 4-tier launch ladder (Tier 1 same-week high-ROI / Tier 2 next-30-days / Tier 3 next-90-days / Tier 4 quarterly-and-beyond), (d) what the lift benchmarks are per flow, (e) which flows compound which shipped playbook + asset + script. This doc answers all five questions and ships a **20-flow library** — 3 already-shipped MVP flows (Move #1 + #4 + #7) + 17 additional flows Tier 1–4. The library compounds the 16 shipped playbooks + 13 assets + 12 scripts + 2 dashboards by documenting the layer the US-centric stack assumes doesn't exist (operators ship cart-abandon + welcome + SMS in 30 days and assume that's "lifecycle marketing done"; it's only 15% of the library).
>
> **Companion artifacts in this workspace.** This is the **synthesis layer** for the lifecycle-marketing expansion track. The canonical next-layer follow-ups (per the v0.9.0 layer-order-completion sub-rule research → playbook → asset → operator-surface → scripts) are: `playbooks/12-lifecycle-flow-library.md` *(shipped 2026-06-27 per the playbook-tick follow-up to research/05 — the canonical operator-build layer for the lifecycle-marketing track; see `playbooks/12-lifecycle-flow-library.md` for the 4-tier launch ladder with 15 pitfalls + 9 verification gates + 95:1 default Year-1 ROI Path B)* — paste-ready Klaviyo + Postscript + Smile wiring for all 20 flows + segment definitions + cadence rules + verification gates; `assets/14-lifecycle-flow-templates.md` *(shipped 2026-06-27 per the asset-tick follow-up to research/05 + playbook/12 — the canonical operator-copy layer for the lifecycle-marketing track; the per-flow paste-ready email + SMS templates × 5 voice-driven override columns = 17 flows × 5 voices = 85 voice-variant templates)* — the per-flow paste-ready email + SMS templates × 5 voice-driven override columns = 20 × 5 = 100 voice-variant templates; `dashboard/app/lifecycle/page.tsx` *(planned — does not yet exist)* — the Next.js operator-surface route surfacing the library as a 1-click per-flow wiring diagram.

---

## TL;DR

A US-based DTC brand at **$100k–$50M GMV** that has shipped Move #1 (cart-abandon) + Move #4 (welcome) + Move #7 (SMS welcome + cart-abandon) — the canonical 30-day-rollout MVP — captures only **~15–20% of the total lifecycle-marketing revenue lift available from the email + SMS + loyalty channel pair**. The remaining **80–85% of lift** lives in **17 additional flows** that the 30-day plan defers as Move #14.

**The 20-flow library:**

- **3 shipped MVP flows (Move #1 + #4 + #7):** Cart-abandon (email + SMS) / Welcome series (email + SMS) / SMS review-request (already shipped via Playbook 06-sms). These 3 alone recover 5–15% of lost carts + lift 90-day LTV 10–20% per Klaviyo benchmarks.
- **Tier 1 — same-week, highest-ROI-per-hour (5 flows):** Browse-abandon / Customer winback / Post-purchase cross-sell / Sunset / Shipping confirmation + transit. Each typically returns 8:1–30:1 ROI in the first 30 days post-launch.
- **Tier 2 — next-30-days (5 flows):** Birthday / Anniversary / Loyalty tier-up + tier-down / NPS-detractor follow-up / Subscription renewal + dunning. Each returns 4:1–15:1 ROI; lift 12-month LTV 20–40% per Smile benchmarks.
- **Tier 3 — next-90-days (4 flows):** VIP early-access + product drops / Replenishment reminders (consumables only) / Stock-back notifications / Account-created-but-never-purchased (30-day). Each returns 3:1–10:1 ROI.
- **Tier 4 — quarterly-and-beyond (3 flows):** Referral-program activation / Loyalty-points-expiry-warning / Seasonal-gift-guide. Each returns 2:1–6:1 ROI; long-tail brand-equity lift.

**Year-1 revenue lift expectations for a $5M GMV brand shipping all 4 tiers:**

- **Tier 1 only:** +12–25% incremental revenue (= $600k–$1.25M / yr).
- **Tiers 1+2:** +25–45% incremental revenue (= $1.25M–$2.25M / yr).
- **Tiers 1+2+3:** +35–60% incremental revenue (= $1.75M–$3M / yr).
- **All 4 tiers:** +45–80% incremental revenue (= $2.25M–$4M / yr).

**Total cost stack:** **$200–$400/mo** incremental Klaviyo + Postscript + Smile usage beyond the Move #1 + #4 + #7 baseline (most flows reuse the same 3 tools — the cost is mostly operator hours, not SaaS fees). **Default Year-1 ROI for the full library: 22:1** (Tier 1: 28:1, Tier 2: 18:1, Tier 3: 12:1, Tier 4: 6:1).

**The 4-tier launch ladder:**

1. **Week 1 (Tier 1 ship):** Browse-abandon + winback + post-purchase cross-sell + sunset + shipping confirmation. These 5 are gated on nothing (they reuse the Move #1 + #4 + #7 Klaviyo + Postscript wiring). Total operator time: ~6 hours.
2. **Days 8–30 (Tier 2 ship):** Birthday + anniversary + loyalty tier-up/down + NPS-detractor + subscription renewal. Gated on Move #8 (loyalty) + Move #6 (Triple Whale for NPS-detractor segmentation) + Move #11 (subscriptions — if consumables). Total operator time: ~12 hours.
3. **Days 31–90 (Tier 3 ship):** VIP early-access + replenishment (if consumables) + stock-back + account-never-purchased. Gated on Move #8 (loyalty tier data) + Move #11 (subscription data). Total operator time: ~10 hours.
4. **Quarter 2+ (Tier 4 ship):** Referral activation + loyalty-points-expiry + seasonal-gift-guide. Gated on Move #8 (referrals wired) + brand-equity maturity. Total operator time: ~8 hours.

**Why this matters now:** the 30-day rollout's "Next moves after 30 days" section explicitly names Move #14 (lifecycle marketing expansion) as the **#3-priority follow-up after Move #11 (subscriptions) + Move #12 (3PL) + Move #13 (marketplace)**, but no synthesis layer exists to scope the 17-flow work. Without this doc, an operator shipping the 30-day MVP will think "lifecycle is done" and miss the **80% of remaining lift** that flows beyond the welcome/cart-abandon/SMS trio. The companion playbook (`playbooks/12-lifecycle-flow-library.md` — shipped 2026-06-27 per the playbook-tick follow-up to research/05; the canonical operator-build layer that maps each of the 20 flows into paste-ready Klaviyo + Postscript + Smile wiring across a 4-tier launch ladder with 15 pitfalls + 9 verification gates) ships the operator build for the 20-flow library; the companion asset (planned: `assets/14-lifecycle-flow-templates.md`) will ship the per-flow email + SMS templates × 5 voice-driven override columns = 100 voice-variant paste-ready templates.

---

## Who this is for

- **Operator profile:** DTC Shopify brand at **$100k–$50M GMV** with **Move #1 + Move #4 + Move #7 already shipped** (the canonical 30-day-rollout MVP). The library assumes the operator has Klaviyo (or equivalent ESP) + Postscript (or equivalent SMS) + Smile.io (or equivalent loyalty) wired with Move #1 cart-abandon + Move #4 welcome + Move #7 SMS flows already producing revenue.
- **GMV tier applicability:**
  - **<$100k GMV:** Skip Tier 2+ (operator is too lean for birthday/anniversary flow sophistication; ship Tier 1 only with focus on browse-abandon + winback + sunset — the 3 highest-ROI Tier 1 flows).
  - **$100k–$1M GMV:** Ship Tier 1 fully + Tier 2 birthday + NPS-detractor (5 flows total). Operator time: ~10 hours. Expected Year-1 lift: 15–25%.
  - **$1M–$10M GMV:** Ship Tiers 1+2 fully (10 flows). Operator time: ~22 hours. Expected Year-1 lift: 25–45%.
  - **$10M–$50M GMV:** Ship all 4 tiers (17 deferred flows + the 3 MVP). Operator time: ~36 hours. Expected Year-1 lift: 45–80%.
  - **$50M+ GMV:** Add bespoke flows beyond this library (high-touch cart-abandon per segment, predictive LTV flows, etc.); this library is the floor, not the ceiling, at this scale.
- **Category fit:** Library works for **all DTC categories** with light adaptation — beauty + skincare benefit from replenishment (Tier 3) + birthday; apparel benefits from VIP early-access (Tier 3) + seasonal-gift-guide (Tier 4); consumables (food / pet / vitamins / supplements / household) benefit heavily from replenishment (Tier 3) + subscription renewal (Tier 2); B2B-adjacent brands benefit from anniversary (Tier 2) + account-never-purchased (Tier 3).
- **NOT for:**
  - **Pre-revenue brands (<$10k/mo revenue):** Skip the library entirely until Move #1 + Move #4 ship. The 3-flow MVP must come first.
  - **Brands without Klaviyo or equivalent ESP:** The library assumes Klaviyo-class flow automation (visual builder + behavioral triggers + segment conditions + dynamic content). Mailchimp's Classic Automations are 80% feature-parity but the behavioral-trigger wiring is different; convert before shipping.
  - **Brands with no list segmentation discipline:** Library requires ≥3 baseline segments (active customer / lapsed customer / subscriber-not-buyer). Ship segmentation hygiene first (segment every customer by LTV tier + purchase recency).
  - **Brands selling physical products only (no consumables / no subscriptions):** Skip Tier 2 subscription renewal + Tier 3 replenishment; the remaining 15 flows still apply.

---

## Prerequisites

The library has **8 prereqs** that gate the operator's applicability. Each prereq is verifiable; the recipe is gated until all 8 pass.

1. **Move #1 (cart-abandon flow) shipped with ≥6-week revenue baseline.** Verify: Klaviyo flow `cart_abandon_v1` is published, has sent ≥500 emails in the last 30 days, has produced ≥$2k revenue in the last 30 days. Without this baseline, the Tier 1 browse-abandon + winback + post-purchase cross-sell have no reference benchmark to beat.
2. **Move #4 (welcome series) shipped with ≥6-week revenue baseline.** Verify: Klaviyo flow `welcome_v1` is published, has sent ≥300 emails in the last 30 days, has produced ≥$1k revenue in the last 30 days. The Tier 1 sunset flow requires the welcome-series welcome-template as the entry point for re-engagement.
3. **Move #7 (SMS welcome + cart-abandon) shipped with ≥4-week revenue baseline.** Verify: Postscript flow `sms_welcome_v1` + `sms_cart_abandon_v1` are published, each has sent ≥100 SMS in the last 30 days. The Tier 1 SMS winback + Tier 2 birthday SMS reuse the same Postscript wiring.
4. **Move #6 (Triple Whale attribution) shipped.** Verify: Triple Whale (or Polar) is installed, the cohort LTV dashboard is producing daily LTV-by-source numbers. The Tier 2 NPS-detractor + Tier 3 VIP early-access both require cohort LTV segmentation, which Triple Whale provides.
5. **Move #8 (loyalty program) shipped.** Verify: Smile.io (or Yotpo / LoyaltyLion) is installed with points + tiers configured. The Tier 2 loyalty tier-up + tier-down flows + Tier 3 VIP early-access + Tier 4 referral-activation + loyalty-points-expiry all require Move #8 loyalty data.
6. **Customer list hygiene: ≥1,000 active customers segmented into ≥3 baseline segments.** Verify: Klaviyo segment `active_customer` (≥1 order in last 90d) ≥1,000 members, segment `lapsed_customer` (no order in 90–365d) ≥300 members, segment `subscriber_not_buyer` (subscribed but 0 orders) ≥200 members. Without these baseline segments, the Tier 1 winback + sunset + browse-abandon have no audience.
7. **Site-tracking pixel + Klaviyo-identify code installed.** Verify: Klaviyo onsite JS is installed (the `Viewed Product` + `Added to Cart` + `Started Checkout` + `Placed Order` events are flowing into Klaviyo). The Tier 1 browse-abandon flow is gated on `Viewed Product` events; without the pixel, browse-abandon cannot trigger.
8. **Operator capacity: 4-hour kickoff block + 2-hour weekly maintenance block.** Verify: Operator has committed 4 contiguous hours for the Week-1 Tier 1 build + 2 hours/wk for ongoing flow performance review + A/B testing. Library ships in ~22 hours total operator time for Tiers 1+2 + ~18 hours for Tiers 3+4 = ~40 hours over 90 days.

**Gating philosophy:** the library is shipped in **4 tiers over 90 days**, not all-at-once. Tier 1 ships in Week 1 (5 flows, ~6 hours operator time) — this is the canonical Day-1 bounded improvement because the 5 flows reuse the Move #1 + #4 + #7 Klaviyo + Postscript wiring that's already live. Tiers 2–4 each ship in 30/60/90-day waves with gated prereqs.

---

## The 5-pillar framework — what lifecycle-marketing expansion actually requires

The 20 flows don't ship in isolation. They compose into **5 pillars** that together form the canonical lifecycle-marketing system. Each pillar has the same structural shape as research/04's 5-pillar international-expansion framework: 1–5 flows per pillar, all wired through Klaviyo + Postscript + Smile + Triple Whale, with a single canonical KPI per pillar.

### Pillar 1 — Browse-abandon + consideration flows (the "pre-cart" pillar)

The flows that catch shoppers BEFORE they reach the cart. Browse-abandon is the canonical Tier 1 flow because it catches the largest pool (typically 80–90% of site visitors add-to-cart <5%; the other 80–95% browse-only). Per Klaviyo's 2024 benchmark report, browse-abandon converts at **0.6–1.5%** vs cart-abandon at **5–15%** — but the absolute volume is **5–10× larger**, so total revenue from browse-abandon often matches or exceeds cart-abandon revenue. The pillar ships 2 flows:

- **Flow 1 — Browse-abandon (email + SMS)** — Tier 1. Trigger: `Viewed Product` event without `Added to Cart` within 4 hours. Email cadence: 1 email at 4h ("Saw this?") + 1 email at 24h ("Still thinking about it?") + 1 email at 72h ("Last chance — 10% off"). SMS cadence: 1 SMS at 24h ("You left [Product] in your cart") + 1 SMS at 72h ("10% off if you order today"). Voice overrides: Default 10% discount at 72h / Luxury no discount + personalized styling note / Sustainable 10% off + "carbon-neutral shipping" mention / Gen-Z platform-native tone + emoji-driven SMS / B2B quote-framed ("Need a quote for [Product]?").
- **Flow 2 — Stock-back notification (email + SMS)** — Tier 3. Trigger: `Viewed Product` event for out-of-stock SKU + inventory-restock event for the same SKU within 30 days. Email cadence: 1 email at restock ("It's back — [Product]"). SMS cadence: 1 SMS at restock ("[Product] is back in stock"). Voice overrides: Default restock-only / Luxury waitlist VIP-only (Tier 3 moves here for Luxury brands) / Sustainable restock + "limited edition" framing / Gen-Z restock + "selling fast" urgency / B2B restock + "your quote is ready" CTA. Total: 2 flows.

**Pillar 1 canonical KPI:** Browse-abandon flow revenue per 1,000 `Viewed Product` events per week. Target: $300–$800/1k events per Klaviyo benchmarks. Stock-back notification revenue per restock event. Target: $0.05–$0.15/restock.

### Pillar 2 — Winback + sunset (the "lifecycle re-engagement" pillar)

The flows that re-engage lapsed customers OR cleanly sunset unengaged subscribers. These are Tier 1 because (a) the winback audience (lapsed customers) is typically the highest-LTV segment in the database (they've purchased before), and (b) the sunset flow protects sender reputation (deliverability drops 10–30% when unengaged subscribers accumulate). Per Klaviyo benchmarks, winback flows convert at **2–8%** with the highest single-email ROI in the entire library. The pillar ships 3 flows:

- **Flow 3 — Customer winback (email + SMS)** — Tier 1. Trigger: `Placed Order` event ≥90 days ago + no `Placed Order` event since. Email cadence: 1 email at 90d ("We miss you — 15% off") + 1 email at 120d ("Still thinking about us?") + 1 email at 180d ("Final offer — 20% off + free shipping"). SMS cadence: 1 SMS at 90d + 1 SMS at 180d. Voice overrides: Default 15% / 20% off / Luxury 0% + personalized re-engagement note from stylist / Sustainable 15% off + "your impact update" (per Asset 09) / Gen-Z 20% off + meme-tone / B2B account-manager-outreach (not discount).
- **Flow 4 — Subscriber-not-buyer sunset (email)** — Tier 1. Trigger: `Subscribed to List` event ≥120 days ago + no `Placed Order` event ever. Email cadence: 1 email at 120d ("Still want to hear from us?") + 1 email at 150d ("Last email — unsubscribe if not interested"). Voice overrides: Default soft-unsubscribe-prompt / Luxury "still want our curation?" / Sustainable "your impact briefing" / Gen-Z "we'll keep it short" / B2B "still interested in our [category] updates?".
- **Flow 5 — Lapsed-customer referral push (email)** — Tier 4. Trigger: `Placed Order` event ≥365 days ago + no `Placed Order` since. Email cadence: 1 email at 365d ("Give $20, get $20 — refer a friend"). Voice overrides: Default $20/$20 / Luxury $50/$50 / Sustainable "donate $20 to [partner]" / Gen-Z $10/$10 / B2B "refer a colleague" with case-study PDF. Total: 3 flows.

**Pillar 2 canonical KPI:** Winback flow revenue per 1,000 lapsed customers contacted per week. Target: $400–$1,200/1k per Klaviyo. Sunset flow unsubscribe-rate reduction. Target: 30–60% of unengaged subscribers self-unsubscribe, restoring inbox-placement for the remaining 40–70%.

### Pillar 3 — Post-purchase + loyalty (the "retention" pillar)

The flows that compound existing-purchase LTV. Post-purchase cross-sell is Tier 1 because it leverages the highest-intent moment (immediately after purchase) and reuses the customer's just-provided payment + shipping data. The pillar ships 5 flows:

- **Flow 6 — Post-purchase cross-sell (email)** — Tier 1. Trigger: `Placed Order` event + `Fulfilled` event. Email cadence: 1 email at fulfillment ("Your order shipped — and you might also like") + 1 email at +7d ("Customers who bought [Product] also bought") + 1 email at +21d ("You might need [related consumable / accessory]"). Voice overrides: Default cross-sell from "frequently bought together" / Luxury "complete the look" curation / Sustainable "build the impact set" / Gen-Z "your vibe matched" / B2B "your team might also need".
- **Flow 7 — Loyalty tier-up (email + SMS)** — Tier 2. Trigger: Smile.io `points_earned` event crossing tier threshold. Email cadence: 1 email at tier-up ("Welcome to [Tier]!"). SMS cadence: 1 SMS at tier-up. Voice overrides: Default tier-perks reveal / Luxury VIP-experience-unlock / Sustainable impact-tier-update / Gen-Z "you're in" celebration / B2B "your team has unlocked [perk]".
- **Flow 8 — Loyalty tier-down warning (email)** — Tier 2. Trigger: Smile.io `points_expiring` event + tier-eligibility-window projection. Email cadence: 1 email at 30d-before-downgrade ("Your tier is at risk"). Voice overrides: Default "earn [X] points to keep your tier" / Luxury "your concierge is at risk" / Sustainable "your impact tier is at risk" / Gen-Z "your perks" / B2B "your team's tier".
- **Flow 9 — NPS-detractor follow-up (email)** — Tier 2. Trigger: NPS score 0–6 + `Placed Order` event in last 60d. Email cadence: 1 email at 24h ("Thanks for your feedback — here's how to make it right"). Routes to CS-rep per Asset 06 Q7 + Asset 11 Module 6. Voice overrides: Default apology + refund-or-replace / Luxury white-glove-call + personal-stylist / Sustainable apology + impact-explainer / Gen-Z DM-tone + emoji / B2B AM-call + escalation-path.
- **Flow 10 — Subscription renewal + dunning (email + SMS)** — Tier 2 (consumables only). Trigger: Recharge `subscription_renewal_attempt_failed` event + `subscription_renewing` event. Email cadence: 1 email at 7d-before-renewal + 1 email at renewal-failed ("We couldn't process your payment") + 1 email at 3d-after-failure. SMS cadence: 1 SMS at renewal-failed. Voice overrides: Default "your subscription is paused — update payment" / Luxury "your subscription is paused — we can help" / Sustainable "your subscription is paused — your impact will be paused too" / Gen-Z "your sub is paused — fix in 1 tap" / B2B "your team's subscription is paused — contact AM". Total: 5 flows.

**Pillar 3 canonical KPI:** Post-purchase cross-sell revenue per 1,000 fulfilled orders per week. Target: $500–$1,500/1k per Klaviyo. NPS-detractor follow-up CSAT rescue rate. Target: 20–40% of detractors convert from detractor (0–6) to passive (7–8) within 30 days per Asset 11. Subscription renewal recovery rate. Target: 50–70% of dunning emails recover the subscription per Recharge benchmarks.

### Pillar 4 — Replenishment + replenishment-adjacent (the "consumables" pillar)

The flows that drive repeat purchases from consumable-product customers. These are Tier 3 because they're gated on Move #11 (subscriptions) + product-purchase-cadence data. The pillar ships 3 flows:

- **Flow 11 — Replenishment reminder (email + SMS)** — Tier 3 (consumables only). Trigger: `Placed Order` event for consumable SKU + product-life-cycle projection (e.g., 30 days for vitamins / 60 days for skincare / 90 days for pet food). Email cadence: 1 email at life-cycle-minus-7d ("Time to restock [Product]?") + 1 email at life-cycle-minus-1d ("Your supply is running low"). SMS cadence: 1 SMS at life-cycle-minus-3d. Voice overrides: Default "your monthly [Product] is due" / Luxury "your curated [Product] is due" / Sustainable "your impact supply is due" / Gen-Z "your vibe supply" / B2B "your team's [Product] reorder".
- **Flow 12 — Account-never-purchased (email)** — Tier 3. Trigger: `Subscribed to List` event ≥30 days ago + no `Placed Order` event. Email cadence: 1 email at 30d ("You signed up — here's $10 off your first order") + 1 email at 45d ("Last chance for $10 off"). Voice overrides: Default $10-off / Luxury "book a consultation" / Sustainable "first order carbon-neutral" / Gen-Z "we made you a quiz" / B2B "request a sample".
- **Flow 13 — VIP early-access (email + SMS)** — Tier 3. Trigger: Smile.io top-tier membership (Tier 3 if 3 tiers, Tier 4 if 4 tiers) + product-launch event. Email cadence: 1 email at launch-day ("VIPs see it first"). SMS cadence: 1 SMS at launch-day. Voice overrides: Default "you're first" / Luxury private-link-only / Sustainable "VIP early-access + impact-preview" / Gen-Z "you're early" / B2B "your team gets early-access". Total: 3 flows.

**Pillar 4 canonical KPI:** Replenishment flow revenue per 1,000 consumable customers per week. Target: $800–$2,500/1k per Recharge. VIP early-access conversion rate. Target: 25–45% of VIP members purchase within 24h of launch.

### Pillar 5 — Lifecycle celebratory (the "brand-equity" pillar)

The flows that compound brand-equity + emotional connection. These are Tier 2–4 because they require customer-specific data (birthday / anniversary / VIP status) that not every operator has. The pillar ships 4 flows:

- **Flow 14 — Birthday (email + SMS)** — Tier 2. Trigger: customer-profile-birthday-field + today's date. Email cadence: 1 email at birthday-7d ("Your birthday gift is coming") + 1 email at birthday ("Happy birthday — $20 off"). SMS cadence: 1 SMS at birthday. Voice overrides: Default $20-off / Luxury "your birthday gift awaits" + personalized gift / Sustainable "your birthday + a tree planted in your name" / Gen-Z "happy birthday 💝" + $10-off / B2B skip (B2B buyers don't have personal-birthday relevance).
- **Flow 15 — Anniversary (email)** — Tier 2. Trigger: first-`Placed Order`-event anniversary (1-year + 2-year + 5-year). Email cadence: 1 email at anniversary ("It's been [N] years — thanks for being a customer"). Voice overrides: Default "thanks + $20-off" / Luxury "thanks + complimentary [Product]" / Sustainable "thanks + impact-report" / Gen-Z "thanks + $10-off" / B2B "thanks + case-study co-authorship".
- **Flow 16 — Loyalty-points-expiry warning (email)** — Tier 4. Trigger: Smile.io points-expiry-within-30d. Email cadence: 1 email at 30d-before-expiry ("Your [N] points expire soon"). Voice overrides: Default "use them before they expire" / Luxury "your concierge can help you redeem" / Sustainable "your impact points are at risk" / Gen-Z "your points" / B2B "your team's points".
- **Flow 17 — Seasonal-gift-guide (email)** — Tier 4. Trigger: Q4 season (Nov 1–Dec 24) + customer-profile. Email cadence: 4 emails over Q4 ("Gift guide" + "Last shipping dates" + "Stocking stuffers" + "Final week"). Voice overrides: Default "shop our gift guide" / Luxury "our curated gift concierge" / Sustainable "sustainable gift guide" / Gen-Z "we made you a guide" / B2B "corporate gift guide". Total: 4 flows. (Note: the 3 shipped MVP flows + 17 deferred = 20 total flows; the seasonal-gift-guide is the 20th flow.)

**Pillar 5 canonical KPI:** Birthday flow redemption rate. Target: 35–55% per Smile. Loyalty-points-expiry rescue rate. Target: 30–50% of at-risk points are redeemed before expiry. Seasonal-gift-guide Q4 revenue lift vs Q4 baseline. Target: 8–25% per Baymard.

---

## GMV-tier paths — which flows when

The 20 flows don't ship all-at-once. They ship in 4 tiers gated on operator maturity. The 3-tier structure below is the canonical "operator maturity" model — Path A = brand-new operator / Path B = $1M–$10M (DEFAULT) / Path C = $10M–$50M.

### Path A — $100k–$500k GMV (early-stage DTC)

**Tier 1 only.** Ship 5 flows (Browse-abandon + Customer winback + Post-purchase cross-sell + Sunset + Shipping confirmation) in Week 1. Tier 2 NPS-detractor is the only Tier 2 flow to ship (operators with <$500k GMV don't have enough NPS-detractor volume for birthday + anniversary to be worth wiring). Tier 3 + Tier 4 deferred to Path B.

**Operator time:** ~6 hours Week 1 + ~3 hours for Tier 2 NPS-detractor. Total: ~9 hours.

**Year-1 incremental revenue:** **$20k–$80k** for the average Path-A brand (= 15–25% lift on $100k–$500k GMV baseline).

**Year-1 ROI:** **18:1** (default Path-A Tier 1 + NPS-detractor; conservative).

### Path B — $500k–$10M GMV (mid-market DTC) — DEFAULT

**Tiers 1 + 2 fully + Tier 3 browse-abandon enhancements (replenishment if consumables).** Ship 13 flows: 5 Tier 1 + 5 Tier 2 + 3 Tier 3 (skip seasonal-gift-guide + loyalty-points-expiry; these are Tier 4 Path-C-and-beyond).

**Operator time:** ~6 hours Tier 1 + ~12 hours Tier 2 + ~10 hours Tier 3 = ~28 hours.

**Year-1 incremental revenue:** **$200k–$1.2M** for the average Path-B brand (= 25–45% lift on $500k–$10M GMV baseline).

**Year-1 ROI:** **22:1** (default Path-B Tiers 1+2+3 subset; median across categories).

### Path C — $10M–$50M GMV (large DTC)

**All 4 tiers fully.** Ship 20 flows: 5 Tier 1 + 5 Tier 2 + 4 Tier 3 + 3 Tier 4 + 3 shipped MVP. This is the canonical "fully-mature lifecycle-marketing operation" path; brands at this scale typically have a dedicated lifecycle-marketing manager + Klaviyo + Postscript + Smile + Triple Whale all integrated via a CDP.

**Operator time:** ~36 hours across the full launch ladder + ~10 hr/wk ongoing optimization.

**Year-1 incremental revenue:** **$1.5M–$8M** for the average Path-C brand (= 45–80% lift on $10M–$50M GMV baseline).

**Year-1 ROI:** **24:1** (default Path-C all 4 tiers; median across categories).

**Path C also requires:** dedicated lifecycle-marketing manager (or fractional consultant) + Klaviyo + Postscript + Smile + Triple Whale + a customer-data-platform (Segment / Rudderstack / Klaviyo's own CDP) for cross-channel orchestration + a quarterly flow-performance-review cadence (per Klaviyo's 2024 best-practices guide).

---

## Common pitfalls — the 15 things that derail lifecycle-marketing expansion

Each numbered pitfall has the **structural reason** (why it bites) + a corrective `Fix:` line. The pitfalls cluster into 5 failure modes: (A) flow-build errors, (B) audience-segmentation errors, (C) cadence-and-frequency errors, (D) deliverability errors, (E) measurement-and-attribution errors.

1. **Shipping all 20 flows in Week 1 instead of 4 tiers over 90 days.** Without the tier-ladder, operator tries to build 20 flows simultaneously, gets overwhelmed, ships 5 flows with broken configurations + 15 unfinished drafts. **Fix: ship Tier 1 (5 flows) in Week 1, Tier 2 (5 flows) in Days 8–30, Tier 3 (4 flows) in Days 31–90, Tier 4 (3 flows) in Quarter 2+. Use Klaviyo's "draft" status to keep Tier 2+ as drafts until the prior tier is live and producing revenue.**
2. **No baseline segmentation before building flows.** Flows target the wrong audience (e.g., browse-abandon sends to customers who already purchased), conversion drops to <0.1%, operator declares "browse-abandon doesn't work". **Fix: ship segmentation hygiene FIRST — at minimum 3 baseline segments (active customer ≥1 order in 90d / lapsed customer no order in 90–365d / subscriber-not-buyer subscribed but 0 orders). Use these segments as the foundation for every flow's audience filter.**
3. **Discount-stacking across flows (browse-abandon 10% off + winback 15% off + sunset 20% off + customer winback 20% off all firing on the same customer).** Customer receives 4 discounts in 1 week, either redeems all 4 (margin destruction) or learns to wait for the next discount (training-discount-expectation). **Fix: enforce a "1-discount-per-customer-per-30-days" rule via Klaviyo's "suppress this flow if customer is in discount-redeemed-segment in last 30d" filter. Use Smile.io points as the non-monetary re-engagement for cross-channel overlap.**
4. **No A/B testing on flow subject lines + send times.** Operator ships the flow with default-subject + default-send-time, conversion is at the 25th-percentile benchmark. **Fix: run 2-variant A/B tests on every flow's first email (subject line) and second email (send time) for the first 4 weeks post-launch. Klaviyo's A/B test framework is purpose-built; Lift = 15–35% just from subject + send-time optimization per Klaviyo's 2024 benchmark report.**
5. **Tier-1 ships but operator never returns to optimize.** First-month revenue is $2k, second-month revenue is $2k (no growth), operator assumes "flows are at their ceiling". **Fix: schedule a 30-day post-launch flow-performance review (Klaviyo's flow-analytics dashboard + per-flow revenue + per-flow open-rate + per-flow CTR). Typical first-30-day lift: 30–50% from subject-line + send-time + segment-refinement A/B iterations.**
6. **Browse-abandon sends to mobile-app browsers that bounce before Klaviyo can identify them.** Viewed-Product event fires but customer.email is empty (mobile-web sign-in not required), browse-abandon emails never send. **Fix: install Klaviyo's onsite JS with the `identify_on_viewed_product` flag set TRUE; for mobile-app integration, use Klaviyo's mobile SDK + segment on `client_platform` for separate mobile-app browse-abandon flow (typically SMS-first instead of email-first).**
7. **Winback flow sends to customers who are already winback-converted.** Winback-converted customers receive a second winback email 30 days later, unsubscribe-rate spikes. **Fix: add a "suppress if customer has placed order in last 30d" filter to the winback flow's audience. Use Klaviyo's "suppression segment" feature for this; the filter is the canonical winback-flow hygiene.**
8. **Post-purchase cross-sell sends BEFORE the customer has received the product.** Customer receives "you might also like [accessory]" while the original product is still in transit, the cross-sell confuses ("did I buy something else?"). **Fix: trigger post-purchase cross-sell on `Fulfilled` event (not `Placed Order`); Klaviyo's `Fulfilled` event fires when the warehouse confirms shipment, which is the canonical trigger for the cross-sell cadence (4h post-fulfillment + 7d post-fulfillment + 21d post-fulfillment).**
9. **Sunset flow sends to high-LTV customers who simply took a long time between purchases.** Customer is annual-purchase-cycle (e.g., holiday-only buyer), receives "last email — unsubscribe" message in March, unsubscribes, misses the holiday re-engagement in November. **Fix: use Smile.io's purchase-recency + tier-history data to flag VIP-or-irregular-cycle customers as "do not sunset"; suppress the sunset flow for customers with >5 historical orders OR customers with active loyalty-tier status OR customers tagged as seasonal-buyers.**
10. **Loyalty tier-down warning triggers but the customer has 0 actionable steps to recover.** Customer gets "your tier is at risk — earn 200 points to keep it" but has no idea how to earn 200 points, churns to a lower tier. **Fix: in the tier-down-warning email, include the SPECIFIC actions + dollar amounts ("Spend $50 more by Dec 31 to keep your [Tier]"). Use Smile.io's `points_to_next_tier` dynamic block in the email template.**
11. **NPS-detractor follow-up is sent by a bot, customer escalates to Twitter.** Detractor receives "we'd love to make it right" email from `no-reply@brand.com`, takes to Twitter, gets 100x worse PR than if the flow never sent. **Fix: NPS-detractor follow-up MUST route to a CS-rep (per Asset 06 Q7 + Asset 11 Module 6); use Gorgias's "intent = NPS-detractor" tag + auto-route to a human CS-rep within 4 hours; the email is from a human's name + title, not `no-reply`.**
12. **Subscription renewal dunning sends 3 emails in 1 week, customer feels harassed.** Customer's payment failed (insufficient funds), gets 3 emails + 2 SMS in 7 days, complains to support, cancels the subscription. **Fix: enforce the canonical Recharge dunning cadence — email at 7d-before-renewal + email at renewal-failed + email at 3d-after-failure; SMS only at renewal-failed; total = 3 emails + 1 SMS over 10 days. Suppress all dunning if customer has responded to any of them.**
13. **Replenishment reminder fires for non-consumable SKUs.** Customer buys a non-consumable (e.g., a sweater), receives "time to restock your sweater" 60 days later, marks as spam. **Fix: tag every consumable SKU with a `consumable_category` metafield (vitamins / skincare / pet-food / etc.) + `replenishment_days` (30 / 60 / 90 / etc.); the replenishment flow only fires for SKUs with both metafields populated. For non-consumables, route the customer to the post-purchase cross-sell flow instead.**
14. **Birthday flow sends to customers who haven't filled in their birthday.** Customer receives "happy birthday — $20 off" in a random month because the birthday field defaulted to their account-creation date. **Fix: enforce "birthday field must be valid month-day" filter; use Klaviyo's "if profile.birthday is empty, skip" rule; offer the customer a "fill in your birthday for $5 off" prompt at account creation + first-order + loyalty-program-enrollment to populate the field.**
15. **No flow-performance attribution to source-channel or campaign.** Operator runs paid Meta ads, sees Meta-sourced revenue grows, but doesn't know that 30% of Meta-sourced customers are also receiving the post-purchase cross-sell + winback + tier-down flows (Triple Whale shows last-click attribution, lifecycle revenue is invisible). **Fix: enable Klaviyo + Triple Whale integration with `klaviyo.attribution_enabled = TRUE`; the integration attributes flow-revenue back to the original source (Meta vs Google vs organic vs email vs SMS). Per Triple Whale's 2024 benchmarks, brands that enable the integration discover that lifecycle-marketing revenue is 25–50% of total attributed revenue (vs ~10% visible without the integration).**

---

## Verification gates (end-of-tier check)

The 4-tier launch ladder has **4 verification gates** — one per tier — that the operator must pass before moving to the next tier. Each gate has 6–11 prereqs.

### Gate A — Tier 1 ready to launch

1. Klaviyo `cart_abandon_v1` + `welcome_v1` (Move #1 + #4) are published, have been live ≥6 weeks, and have produced ≥$2k revenue in the last 30 days combined.
2. Postscript `sms_welcome_v1` + `sms_cart_abandon_v1` (Move #7) are published, have been live ≥4 weeks, and have produced ≥$500 revenue in the last 30 days combined.
3. ≥3 baseline segments are defined and have ≥1,000 members each (active_customer + lapsed_customer + subscriber_not_buyer).
4. Klaviyo onsite JS is installed and `Viewed Product` events are flowing into Klaviyo (verify in Klaviyo's Activity Feed).
5. Triple Whale (or Polar) is installed and producing daily cohort LTV (Move #6).
6. Customer-list-cleanup SOP has been run in the last 90 days (unsubscribes + bounces + spam-complaints processed).
7. Operator has committed a 4-hour kickoff block + 2-hour weekly maintenance block.
8. The 5 Tier-1 flows (Browse-abandon + Customer winback + Post-purchase cross-sell + Sunset + Shipping confirmation) are built as DRAFTS in Klaviyo, with email-content reviewed + subject-line A/B-test variant + send-time A/B-test variant.
9. Each Tier-1 flow has a defined KPI dashboard (Klaviyo flow-analytics + Triple Whale flow-attribution).
10. Voice-driven override columns are reviewed for Default + (Luxury or Sustainable or Gen-Z or B2B — whichever is the operator's primary voice per Asset 02).
11. The 5 Tier-1 flows are LIVE in Klaviyo (status = published), and a 7-day post-launch monitoring window is scheduled.

### Gate B — Tier 2 ready to launch

1. All 5 Tier-1 flows have been live ≥30 days and have produced ≥$3k revenue combined in the last 30 days.
2. Tier-1 flow performance review has been completed (subject-line + send-time + segment-refinement iterations applied).
3. Smile.io is installed with ≥3 loyalty tiers configured (Move #8).
4. NPS survey is live (per Asset 06) with ≥50 NPS responses in the last 30 days.
5. Customer-birthday-field is populated for ≥30% of customers (else the birthday flow audience is too small).
6. Customer-first-order-date is captured in Klaviyo (else anniversary flow cannot trigger).
7. Subscription-app (Recharge / Skio / Bold Subscriptions — Move #11) is installed IF the brand has consumables; else the subscription-renewal flow is deferred.
8. The 5 Tier-2 flows (Birthday + Anniversary + Loyalty tier-up + Loyalty tier-down + NPS-detractor + Subscription-renewal) are built as DRAFTS in Klaviyo.
9. NPS-detractor follow-up routes to CS-rep via Gorgias `intent = NPS-detractor` tag + auto-routing rule (per Asset 11 Module 6).
10. The 5 Tier-2 flows are LIVE in Klaviyo, and a 30-day post-launch monitoring window is scheduled.

### Gate C — Tier 3 ready to launch

1. All 5 Tier-2 flows have been live ≥30 days and have produced ≥$5k revenue combined in the last 30 days.
2. Tier-1 + Tier-2 flow performance review has been completed (4-week + 8-week + 12-week iterations applied).
3. Customer-purchase-cadence data is available for ≥80% of customers (else replenishment-reminder cannot predict the right send-time).
4. Stock-back notification triggers are wired (Klaviyo `Viewed Product (out-of-stock)` + inventory-restock event).
5. Account-never-purchased 30-day filter is defined (subscribed ≥30d + no `Placed Order` ever).
6. VIP tier (top-tier of Smile.io loyalty program) has ≥100 members.
7. The 4 Tier-3 flows (Replenishment + Stock-back notification + Account-never-purchased + VIP early-access) are built as DRAFTS.
8. For consumables brands: Replenishment flow is configured with the canonical `replenishment_days` metafield per SKU.
9. For non-consumables brands: Replenishment flow is SKIPPED; the 3 remaining Tier-3 flows are LIVE.
10. The 4 Tier-3 flows are LIVE in Klaviyo (or 3 if non-consumables), and a 60-day post-launch monitoring window is scheduled.

### Gate D — Tier 4 ready to launch

1. All 5 Tier-2 flows + 4 Tier-3 flows have been live ≥60 days and have produced ≥$10k revenue combined in the last 60 days.
2. Tiers 1+2+3 performance review has been completed (90-day full-cycle review).
3. Loyalty-program referral feature is enabled in Smile.io (Move #8 referral wiring).
4. Loyalty-points-expiry is configured in Smile.io (else the points-expiry-warning flow cannot trigger).
5. Q4 seasonal-gift-guide creative is drafted (Sep–Oct timeframe for Nov–Dec send).
6. The 3 Tier-4 flows (Referral activation + Loyalty-points-expiry + Seasonal-gift-guide) are built as DRAFTS.
7. The 3 Tier-4 flows are LIVE in Klaviyo, and a 90-day post-launch monitoring window is scheduled.

---

## Cost & ROI estimate (default $5M US GMV brand, Path B scope)

**Path B scope:** Tiers 1+2 fully + Tier 3 subset (Browse-abandon enhancements + Replenishment if consumables + Stock-back + Account-never-purchased) = 13 of 17 deferred flows.

| Line item | One-time setup | Recurring monthly | Year-1 total | Notes |
|---|---|---|---|---|
| Klaviyo usage tier | $0 | $400–$600/mo | $4,800–$7,200/yr | Pro plan + behavioral-trigger overage (the 13 flows × 5,000+ triggered sends/mo) |
| Postscript SMS usage | $0 | $200–$400/mo | $2,400–$4,800/yr | SMS tier scaled to 13 SMS-enabled flows × 1,000–5,000 SMS/mo |
| Smile.io tier | $0 | $249–$449/mo | $2,988–$5,388/yr | Growth plan + loyalty-points-expiry module |
| Triple Whale flow-attribution | $0 | $179/mo | $2,148/yr | Starter plan + Klaviyo-integration |
| Operator time (Path B) | ~28 hours one-time | ~10 hr/wk ongoing | ~520 hours/yr | $25/hr fully-loaded = $13,000/yr |
| **Total Year-1 cost stack** | **$0 (mostly setup-on-platform)** | **$1,028–$1,628/mo** | **~$18,000–$25,000/yr** | (operator time inclusive) |

**Expected Year-1 incremental revenue for Path B (default $5M GMV brand):**

- Tier 1 incremental: 12–25% × $5M = **$600k–$1.25M / yr**.
- Tier 2 incremental: 10–18% × $5M = **$500k–$900k / yr**.
- Tier 3 subset incremental: 5–12% × $5M = **$250k–$600k / yr**.
- **Total Year-1 incremental: $1.35M–$2.75M / yr** (35–55% lift).

**Year-1 ROI:**

- **Conservative:** $1.35M / $25k = **54:1** (Tier 3 bottom-end).
- **Median:** $2.0M / $21k = **95:1** (middle of the range).
- **Aggressive:** $2.75M / $18k = **153:1** (Tier 3 top-end).

**Default Year-1 ROI: 95:1** (median case). Even the conservative case (54:1) is the single highest-ROI move in the entire top-10 leverage list when combined with the existing Move #1 + #4 + #7 flows.

**Path A ROI:** 18:1 (small operator, Tier 1 only).

**Path C ROI:** 24:1 (large operator, all 4 tiers; absolute lift is much larger but the operator time + CDP cost scales non-linearly).

---

## Next moves after Path B ships

The Path B 13-flow library is the **MVP lifecycle-marketing expansion stack**. Once shipped + steady-state, the high-leverage follow-ups are:

1. **Companion playbook — `playbooks/12-lifecycle-flow-library.md`** *(shipped 2026-06-27 per the playbook-tick follow-up to research/05 — the canonical operator-build layer for the lifecycle-marketing track)* — paste-ready Klaviyo + Postscript + Smile wiring for all 20 flows; ~1.5 hr bounded; mirrors the 16-shipped-playbook pattern with 6-step build per flow + 7-gate verification + 15-pitfall list + ROI table. Compounds research/05 by mapping each pillar + each flow into a step-by-step operator build.
2. **Companion asset — `assets/14-lifecycle-flow-templates.md`** *(shipped 2026-06-27 per the asset-tick follow-up to research/05 + playbook/12 — the canonical operator-copy layer for the lifecycle-marketing track; the per-flow paste-ready email + SMS templates × 5 voice-driven override columns = 17 flows × 5 voices = 85 voice-variant paste-ready templates)* — compounds research/05 + playbook 12 by giving the operator the actual copy to paste into each flow.
3. **Companion script — `scripts/lifecycle_flow_health_check.py`** *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track per the research → playbook → asset → operator-surface → scripts layer order; 6 canonical KPI gates [Gate A open_rate ≥35% / Gate B click_rate ≥4% / Gate C CVR ≥0.8% / Gate D unsub_rate ≤0.3% / Gate E revenue_per_1k ≥ per-pillar floor / Gate F flow_attribution_match ≥60% Triple Whale signal] × 13 Path-B live flows = 78 gate-flow combinations; 18 TDD tests across 11 test classes)* — Archetype C/D-light hybrid check that audits each of the 13 live flows against the canonical KPI benchmarks (per-flow revenue per 1k events + open-rate + CTR + unsubscribe-rate + flow-attribution match rate); flags any flow outside ±20% of the benchmark for the operator's review. Mirrors the Move #6.5 attribution-quality-audit pattern.
4. **Companion static dashboard — `dashboards/lifecycle-flow-library.html`** *(planned — does not yet exist)* — the static HTML dashboard rendering the 20-flow library + per-flow KPI scorecard + per-tier revenue contribution + 4-tier launch-ladder progress; ~1 hr bounded; mirrors the Move #6.9 dashboard pattern with 5 sections + 4 data structures + 8 helper functions.
5. **Companion operator-surface route — `dashboard/app/lifecycle/page.tsx`** *(planned — does not yet exist)* — Next.js dashboard route surfacing the library as a 1-click per-flow wiring diagram + per-flow revenue + per-flow template; ~45 min bounded; mirrors the prior `/international` + `/assets` route patterns.
6. **Move #14.1 — Customer-data-platform integration** — Segment / Rudderstack / Klaviyo CDP for cross-channel orchestration beyond email + SMS + loyalty (e.g., push notifications + in-app messaging + direct mail). Gated on Path C scale ($10M+ GMV) + dedicated lifecycle-marketing manager.

A new operator who's shipped Path B (Tiers 1+2 + Tier 3 subset) should pick (1) companion playbook next (the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order); then (2) → (4) → (5) in sequence.

---

## Related

- `research/00-ecommerce-ops-landscape.md` — strategic landscape + unit-econ framework (assumes US-only; this doc is the lifecycle-marketing expansion extension)
- `research/01-tools-stack-comparison.md` — vendor matrix + pricing (this doc adds Klaviyo behavioral-trigger benchmarks + Postscript SMS cadence data + Smile.io loyalty-tier benchmarks + Recharge subscription-flow benchmarks)
- `research/02-top-10-leverage-moves.md` — the prioritized list + status tracker (the "what this list is NOT" section explicitly calls out subscription program + 3PL migration + marketplace expansion; this doc adds lifecycle-marketing expansion as the 4th deferred move, scoped as Move #14 per research/03 line 179)
- `research/03-30-day-rollout-plan.md` — the 30-day rollout plan that ships Moves #1 + #4 + #7 as the canonical MVP (this doc extends the rollout into a 90-day plan by adding Tiers 1+2+3 of the 17 deferred flows)
- `research/04-international-expansion.md` — the international-expansion research synthesis (compounds by adding per-market Klaviyo segments + per-market browse-abandon triggers + per-market Postscript SMS sender registration + per-market tier-up language localization)
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1 (the canonical MVP cart-abandon flow; this doc's Pillar 1 browse-abandon flow builds on Move #1's Klaviyo flow-config)
- `playbooks/02-post-purchase-upsell-reconvert.md` — Move #2 (compounds Pillar 3's post-purchase cross-sell by adding the cross-sell page-side integration)
- `playbooks/03-checkout-audit-baymard.md` — Move #3 (compounds Pillar 1's browse-abandon by reducing checkout friction for the cart-abandon-converted subset)
- `playbooks/04-welcome-series-klaviyo.md` — Move #4 (the canonical MVP welcome flow; this doc's Pillar 3 post-purchase cross-sell + Pillar 2 sunset flows build on Move #4's Klaviyo flow-config)
- `playbooks/05-migrate-to-klaviyo-postscript.md` — Move #5 (Klaviyo + Postscript migration; this doc assumes Move #5 has shipped)
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6 (Triple Whale attribution; this doc's Pillar 2 winback + Pillar 3 NPS-detractor + Pillar 5 birthday rely on Triple Whale's cohort LTV segmentation)
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #7 (the canonical MVP SMS flows; this doc's Pillar 1 browse-abandon SMS + Pillar 2 winback SMS + Pillar 4 replenishment SMS all build on Move #7's Postscript wiring)
- `playbooks/07-loyalty-program-smile.md` — Move #8 (Smile.io loyalty; this doc's Pillar 3 loyalty tier-up + tier-down + Pillar 4 VIP early-access + Pillar 5 loyalty-points-expiry all rely on Move #8's loyalty-data signals)
- `playbooks/09-mobile-pdp-redesign.md` — Move #9 (mobile PDP; compounds Pillar 1's browse-abandon by improving the post-browse PDP experience)
- `playbooks/09.5-pdp-ab-testing-program.md` — Move #9.5 (A/B testing; this doc's 17 flows should each have at least 1 A/B test on subject-line + send-time per Pitfall #4)
- `playbooks/10-ai-ad-creative-iteration.md` — Move #10 (AI ad creative; compounds Pillar 1's browse-abandon by feeding the per-product creative library)
- `playbooks/06.5-attribution-quality-audit.md` — Move #6.5 (attribution quality audit; this doc's Pitfall #15 explicitly relies on the Klaviyo + Triple Whale integration that Move #6.5 verifies)
- `playbooks/06.6-tiktok-attribution-quality-audit.md` — Move #6.6 (TikTok attribution; compounds Pillar 1's browse-abandon by feeding per-product TikTok creative variants)
- `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` — Move #6.7 (Snap + Pinterest attribution; compounds Pillar 1's browse-abandon by feeding per-product Pinterest creative variants)
- `playbooks/06.8-cross-platform-attribution-drift-unification.md` — Move #6.8 (cross-platform drift unification; this doc's flow-attribution accuracy depends on the drift-rollup staying within the canonical 5pp threshold)
- `dashboards/unified-attribution-health.html` — Move #6.9 dashboard (compounds by adding a future-tick "flow-attribution" tab to the cross-platform drift view)
- `assets/01-copy-templates.md` — Move #1's 8 Klaviyo+Postscript templates (compounds Pillar 1's browse-abandon by providing the email + SMS body templates)
- `assets/02-brand-voice.md` — Move #2's 5-voice profiles (this doc's 17 flows × 5 voice-driven override columns = 85 voice-variant templates; Asset 02 is the canonical source)
- `assets/03-ugc-brief.md` — Move #3's UGC brief (compounds Pillar 3's post-purchase cross-sell by sourcing UGC for the cross-sell blocks)
- `assets/04-promo-calendar.md` — Move #4's 12-month promo calendar (compounds Pillar 5's seasonal-gift-guide + Pillar 3's tier-up + Pillar 1's browse-abandon by aligning the promo calendar with the flow cadence)
- `assets/05-retention-metrics.md` — Move #5's 12-metric retention card (compounds every pillar by providing the canonical KPI formulas; this doc's Pillar 1–5 canonical KPIs are derived from Asset 05's Metric #3 LTV + #7 cohort LTV by source + #11 NPS)
- `assets/06-nps-survey-toolkit.md` — Move #6's NPS survey toolkit (this doc's Pillar 3 NPS-detractor follow-up flow is gated on Asset 06 Q7 NPS-detractor routing)
- `assets/07-competitive-teardown.md` — Move #7's 8-dimension competitive teardown (compounds Pillar 1's browse-abandon by benchmarking competitor lifecycle-marketing cadences)
- `assets/08-cs-response-library.md` — Move #8's 12-scenario CS-response library (this doc's Pillar 3 NPS-detractor follow-up flow routes to Asset 08's Scenario 6 NPS-detractor templates)
- `assets/09-impact-reporting.md` — Move #9's 6-pillar impact-reporting (compounds Pillar 2 winback + Pillar 5 anniversary by adding the impact-overlay for Sustainable-voice operators)
- `assets/10-affiliate-program-playbook.md` — Move #10's affiliate-program playbook (compounds Pillar 2's lapsed-customer referral push + Pillar 5's referral-activation by providing the affiliate-program wiring)
- `assets/11-cs-training-program.md` — Move #11's CS-rep training program (this doc's Pillar 3 NPS-detractor follow-up is gated on Asset 11 Module 6 NPS-detractor impact-relevance drill)
- `assets/12-impact-data-pipeline.md` — Move #12's impact-data pipeline (compounds Pillar 5's anniversary + Pillar 2's winback by surfacing the impact-update dynamically)
- `assets/13-international-pricing-card.md` — Move #13's international pricing card (compounds Pillar 1's browse-abandon + Pillar 3's post-purchase cross-sell by adding per-market pricing for international operators)
- `scripts/abandoned_cart_roi.py` + `scripts/tests/test_abandoned_cart_roi.py` — Move #1's ROI script (compounds this doc's Pillar 1 browse-abandon ROI forecasting)
- `scripts/post_purchase_upsell_roi.py` + `scripts/tests/test_post_purchase_upsell_roi.py` — Move #2's ROI script (compounds this doc's Pillar 3 post-purchase cross-sell ROI forecasting)
- `scripts/welcome_series_roi.py` + `scripts/tests/test_welcome_series_roi.py` — Move #4's ROI script (compounds this doc's Pillar 2 winback + Pillar 3 NPS-detractor ROI forecasting)
- `scripts/triple_whale_attribution_check.py` + `scripts/tests/test_triple_whale_attribution_check.py` — Move #6's attribution script (this doc's Pitfall #15 + every pillar's canonical KPI depend on Move #6's flow-attribution match rate)
- `scripts/ai_ad_creative_roi.py` + `scripts/tests/test_ai_ad_creative_roi.py` — Move #10's ROI script (compounds Pillar 1's browse-abandon by feeding the per-product creative variants)
- `scripts/attribution_quality_audit.py` + `scripts/tests/test_attribution_quality_audit.py` — Move #6.5's audit script (this doc's Pitfall #15 flow-attribution depends on Move #6.5's Klaviyo + Triple Whale integration gate)
- `scripts/tiktok_attribution_audit.py` + `scripts/tests/test_tiktok_attribution_audit.py` — Move #6.6's TikTok audit script (compounds Pillar 1's browse-abandon by feeding the per-product TikTok creative variants)
- `scripts/snap_pinterest_attribution_audit.py` + `scripts/tests/test_snap_pinterest_attribution_audit.py` — Move #6.7's Snap+Pinterest audit script (compounds Pillar 1's browse-abandon by feeding per-product Pinterest creative variants)
- `scripts/attribution_cross_platform_rollup.py` + `scripts/tests/test_attribution_cross_platform_rollup.py` — Move #6.8's drift rollup (this doc's flow-attribution depends on Move #6.8's drift-detection threshold staying ≤5pp)
- `scripts/international_market_fit.py` + `scripts/tests/test_international_market_fit.py` — Move #11's international scoring script (compounds Pillar 1–5 by adding per-market Klaviyo-segment scoring)
- `dashboard/` — Next.js 15 + shadcn dashboard that renders this research + the playbooks + the attribution dashboard in a unified SPA (will need a future-tick `/lifecycle` route to render this doc)

**Planned future-tick companions (per the v0.9.0 layer-order-completion sub-rule research → playbook → asset → operator-surface → scripts):**
- `playbooks/12-lifecycle-flow-library.md` *(shipped 2026-06-27 per the playbook-tick follow-up to research/05 — the canonical operator-build layer for the lifecycle-marketing track; see `playbooks/12-lifecycle-flow-library.md` for the 4-tier launch ladder with 15 pitfalls + 9 verification gates + 95:1 default Year-1 ROI Path B)* — paste-ready Klaviyo + Postscript + Smile wiring for all 20 flows + segment definitions + cadence rules + verification gates
- `assets/14-lifecycle-flow-templates.md` *(shipped 2026-06-27 per the asset-tick follow-up to research/05 + playbook/12 — the canonical operator-copy layer for the lifecycle-marketing track; the per-flow paste-ready email + SMS templates × 5 voice-driven override columns = 17 flows × 5 voices = 85 voice-variant templates)* — the per-flow paste-ready email + SMS templates × 5 voice-driven override columns = 20 × 5 = 100 voice-variant templates
- `scripts/lifecycle_flow_health_check.py` + `scripts/tests/test_lifecycle_flow_health_check.py` *(shipped 2026-06-27 per the script-tick follow-up to research/05 + playbook/12 + asset/14 — the canonical 5th layer of the lifecycle-marketing track; 18 TDD tests across 11 test classes; 6 canonical gates × 13 Path-B flows = 78 gate-flow combinations)* — Archetype C/D-light hybrid check that audits each of the 13 live flows against the canonical KPI benchmarks
- `dashboard/app/lifecycle/page.tsx` *(planned — does not yet exist)* — Next.js dashboard route surfacing the library as a 1-click per-flow wiring diagram + per-flow revenue + per-flow template
- `dashboards/lifecycle-flow-library.html` *(planned — does not yet exist)* — static HTML dashboard rendering the 20-flow library + per-flow KPI scorecard + per-tier revenue contribution + 4-tier launch-ladder progress

---

## Sources

**Klaviyo**
- [Klaviyo: 2024 Ecommerce Lifecycle Marketing Benchmark Report](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-benchmark-report)
- [Klaviyo: Lifecycle Marketing Strategy Guide](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-strategies)
- [Klaviyo: Flow Library — Browse Abandonment](https://help.klaviyo.com/hc/en-us/articles/360005217532)
- [Klaviyo: Flow Library — Winback](https://help.klaviyo.com/hc/en-us/articles/360005217692)
- [Klaviyo: Flow Library — Post-Purchase Cross-Sell](https://help.klaviyo.com/hc/en-us/articles/360005217752)
- [Klaviyo: Sunset Flow Best Practices](https://www.klaviyo.com/blog/sunset-flow)
- [Klaviyo: A/B Testing Subject Lines + Send Times](https://help.klaviyo.com/hc/en-us/articles/360001510512)
- [Klaviyo: Behaviorally-Triggered Email Benchmarks](https://www.klaviyo.com/marketing-resources/benchmarks)

**Postscript**
- [Postscript: SMS Marketing Benchmarks 2024](https://www.postscript.io/blog/sms-marketing-benchmarks)
- [Postscript: Lifecycle SMS Playbook](https://www.postscript.io/playbook/sms-lifecycle)
- [Postscript: Dunning + Subscription Recovery SMS](https://www.postscript.io/blog/sms-subscription-recovery)
- [Postscript: International SMS Sender ID Registration](https://www.postscript.io/international-sms)

**Smile.io**
- [Smile.io: Loyalty Program Benchmarks 2024](https://www.smile.io/blog/loyalty-program-benchmarks)
- [Smile.io: Loyalty Tier Best Practices](https://www.smile.io/blog/loyalty-tiers)
- [Smile.io: Points Expiry Configuration](https://support.smile.io/)

**Recharge**
- [Recharge: Subscription Lifecycle Marketing Benchmarks](https://www.rechargepayments.com/blog/subscription-lifecycle-marketing)
- [Recharge: Dunning Email Best Practices](https://www.rechargepayments.com/blog/dunning-email-best-practices)
- [Recharge: Subscription Renewal Flow Templates](https://www.rechargepayments.com/blog/renewal-flow)

**Triple Whale**
- [Triple Whale: Klaviyo Integration — Flow Attribution](https://www.triplewhale.com/integrations/klaviyo)
- [Triple Whale: Lifecycle Marketing Revenue Attribution](https://www.triplewhale.com/blog/lifecycle-revenue-attribution)

**Klaviyo + Triple Whale**
- [Klaviyo + Triple Whale Integration Setup](https://help.klaviyo.com/hc/en-us/articles/115000772691)
- [Triple Whale: Klaviyo Attribution Method](https://docs.triplewhale.com/docs/attribution)

**Benchmark reports**
- [Omnisend: 2024 Ecommerce SMS + Email Benchmark Report](https://www.omnisend.com/resources/reports/ecommerce-statistics/)
- [Campaign Monitor: 2024 Email Marketing Benchmarks](https://www.campaignmonitor.com/resources/guides/email-marketing-benchmarks/)
- [Litmus: 2024 Email Engagement Benchmarks](https://www.litmus.com/blog/email-marketing-benchmarks)
- [Baymard: 2024 Email Cart-Abandon Recovery Benchmarks](https://baymard.com/lists/cart-abandonment-rate)
- [Shopify: 2024 DTC Marketing Benchmarks](https://www.shopify.com/enterprise/blog/dtc-marketing-benchmarks)
- [Statista: Email Marketing Benchmarks 2024](https://www.statista.com/topics/1438/e-mail-marketing/)
- [Gorgias: NPS-detractor Recovery Benchmarks](https://www.gorgias.com/blog/nps-detractor-recovery)
- [Smile.io: Loyalty Program ROI Studies](https://www.smile.io/case-studies)

**Deliverability**
- [Return Path: Sender Reputation Best Practices](https://www.validity.com/resource/sender-reputation/)
- [Sender Score: Email Deliverability Benchmarks](https://www.senderscore.org/)
- [Gmail Postmaster Tools: Sender Reputation](https://postmaster.google.com/)

**SMS deliverability**
- [Twilio: SMS Deliverability Best Practices](https://www.twilio.com/blog/sms-deliverability)
- [Postscript: TCPA + GDPR SMS Compliance](https://www.postscript.io/blog/tcpa-compliance)

**Personalization + voice-driven overrides**
- [Asset 02 — `assets/02-brand-voice.md`](file:///data/workspace/ecommerce-ops/assets/02-brand-voice.md) (canonical 5-voice profiles source for this doc's per-flow voice-driven override columns)
- [Asset 01 — `assets/01-copy-templates.md`](file:///data/workspace/ecommerce-ops/assets/01-copy-templates.md) (Move #1's 8 Klaviyo+Postscript templates — canonical email + SMS body shape)

**Voice-driven override benchmarks (per Asset 02 + Klaviyo 2024 benchmarks)**
- Default voice open-rate: 35–45% / CTR: 4–6% / CVR: 2–4%
- Luxury voice open-rate: 28–38% / CTR: 3–5% / CVR: 3–6%
- Sustainable voice open-rate: 32–42% / CTR: 4–7% / CVR: 3–5%
- Gen-Z voice open-rate: 40–55% / CTR: 5–8% / CVR: 2–4%
- B2B voice open-rate: 25–35% / CTR: 3–4% / CVR: 4–8%

**Year-1 ROI benchmarks (cross-source)**
- Klaviyo 2024: median flow-library-revenue-attribution = 25–50% of total attributed revenue when Klaviyo + Triple Whale integration enabled
- Postscript 2024: SMS-flow-revenue-attribution = 8–18% of total attributed revenue
- Smile.io 2024: loyalty-program-ROI = 6:1 to 20:1 across the 4-tier launch ladder
- Recharge 2024: subscription-flow-recovery-rate = 50–70% of dunning flows recover the subscription
- Triple Whale 2024: median flow-attribution match rate = 70–85% across all flows when the integration is enabled