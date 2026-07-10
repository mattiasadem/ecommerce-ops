---
name: lifecycle-flow-library
title: Lifecycle flow library (Klaviyo + Postscript + Smile 20-flow build, Move #14)
category: retention
tier: 1
priority: P1
default_move: 14
year_1_roi_band: "54:1–153:1"
sms_friendly: true
last_updated: 2026-07-10
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, omnisend 2024, litmus 2024, baymard 2024, gorgias 2024, gsp-rcs 2024, return-path 2024, twilio 2024]
---

# Lifecycle flow library (Klaviyo + Postscript + Smile 20-flow build, Move #14)

> Move #1 (cart-abandon) + Move #4 (welcome) + Move #7 (SMS welcome + cart-abandon) recover 5–15% of lost carts and lift 90-day LTV 10–20% — but the canonical 30-day-rollout MVP captures only **15–20% of the total lifecycle-marketing revenue lift** from the email + SMS + loyalty channel pair. Move #14 ships the remaining **80–85%** as a 20-flow library organized into 4 tiers across 90 days (Tier 1 same-week 5 flows / Tier 2 next-30-days 5 flows / Tier 3 next-90-days 4 flows / Tier 4 quarterly-and-beyond 3 flows + the 3 already-shipped MVP flows), wired through 5 pillars (pre-cart consideration / lifecycle re-engagement / retention / consumables replenishment / brand-equity celebratory). Year-1 ROI band 54:1–153:1 with the canonical Path B default Year-1 incremental revenue of **$1.35M–$2.75M** for a $5M GMV brand (35–55% lift) — the single highest-ROI move in the entire top-10 leverage list when stacked atop Move #1 + #4 + #7. Ship AFTER Move #1 + #4 + #7 are at 6+ week maturity baseline AND Move #6 (Triple Whale cohort LTV) is wired AND Move #8 (loyalty) is wired, in a 4-tier rollout over 90 days.

## When to use this skill

You have:

- A Shopify (or Ikas / BigCommerce / WooCommerce) DTC store
- Klaviyo (or equivalent ESP) + Postscript (or equivalent SMS) + Smile.io (or equivalent loyalty) already wired
- **Move #1 (cart-abandon email) shipped with ≥6-week revenue baseline**
- **Move #4 (welcome series) shipped with ≥6-week revenue baseline**
- **Move #7 (SMS welcome + cart-abandon) shipped with ≥4-week revenue baseline**
- Move #6 (Triple Whale attribution) shipped with cohort LTV dashboard producing daily numbers
- Move #8 (loyalty program) shipped with ≥3 loyalty tiers configured (for Tier 2 flows)
- Move #11 (subscriptions) shipped if consumables (for replenishment + dunning)
- ≥1,000 active customers segmented into ≥3 baseline segments (active_customer / lapsed_customer / subscriber_not_buyer)
- Klaviyo onsite JS installed with `Viewed Product` + `Added to Cart` + `Started Checkout` + `Placed Order` events flowing
- 4-hour kickoff block + 2-hour weekly maintenance block committed

You do NOT have:

- The 17 deferred lifecycle flows beyond Move #1 + #4 + #7 (the most common DTC gap — operators ship the 30-day MVP and stop)
- Browse-abandon flow (typically the largest absolute revenue after cart-abandon per Klaviyo)
- Winback flow for lapsed customers (highest single-email ROI in the entire library at 2–8% conversion)
- Sunset flow to clean unengaged subscribers (deliverability drops 10–30% without it)
- NPS-detractor follow-up (the #1 CSAT-rescue lever — converts 20–40% of detractors back to passive)

## What "best in class" looks like

Reference: Allbirds, Glossier, Cuts Clothing, Athletic Greens, Loom, Bombas, Dr. Squatch, Olipop.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Browse-abandon flow revenue / 1k Viewed Product events | $800 | $300 | $1,200 |
| Winback flow revenue / 1k lapsed customers | $1,200 | $400 | $1,800 |
| Post-purchase cross-sell revenue / 1k fulfilled orders | $1,500 | $500 | $2,500 |
| Sunset flow unsub-rate reduction | 60% | 30% | 80% |
| NPS-detractor CSAT rescue rate (0–6 → 7–8 in 30d) | 40% | 20% | 60% |
| Birthday flow redemption rate | 55% | 35% | 70% |
| Loyalty tier-up flow engagement (new-tier click-rate) | 45% | 25% | 60% |
| Replenishment flow revenue / 1k consumable customers | $2,500 | $800 | $4,000 |
| VIP early-access conversion rate | 45% | 25% | 60% |
| Seasonal-gift-guide Q4 lift vs Q4 baseline | 25% | 8% | 40% |
| Discount-stacking rate (cross-flow overlap) | <5% | <15% | 0% |
| Subject-line A/B test coverage (≥1 test per first email) | 100% | 50% | 100% over 30d |

## Lifecycle-flow-library benchmarks (2024–25)

| Tier | Flow | Trigger | Cadence (email) | Cadence (SMS) | Per-flow CVR | Per-flow revenue / 1k events |
|---|---|---|---|---|---|---|
| Tier 1 | Browse-abandon | `Viewed Product` + no `Added to Cart` in 4h | 3 (4h, 24h, 72h) | 2 (24h, 72h) | 0.6–1.5% | $300–$800 |
| Tier 1 | Customer winback | `Placed Order` ≥90d ago | 3 (90d, 120d, 180d) | 2 (90d, 180d) | 2–8% | $400–$1,200 |
| Tier 1 | Post-purchase cross-sell | `Placed Order` + `Fulfilled` | 3 (4h, +7d, +21d) | 0 | 1.5–4% | $500–$1,500 |
| Tier 1 | Subscriber-not-buyer sunset | `Subscribed` ≥120d + no order | 2 (120d, 150d) | 0 | 30–60% self-unsub | — (deliverability) |
| Tier 1 | Shipping confirmation | `Fulfilled` event | 1 (real-time) | 1 (real-time) | repeat-purchase 8–14% | $400–$1,200 |
| Tier 2 | Birthday | customer-profile-birthday | 2 (-7d, 0d) | 1 (0d) | redemption 35–55% | $400–$1,000 |
| Tier 2 | Anniversary | first-`Placed Order` + N years | 1 (anniversary) | 0 | repeat-purchase 18–30% | $600–$2,000 |
| Tier 2 | Loyalty tier-up | Smile.io tier-threshold cross | 1 (tier-up) | 1 (tier-up) | engagement 25–45% | $300–$900 |
| Tier 2 | Loyalty tier-down warning | Smile.io tier-eligibility projection | 1 (-30d) | 0 | rescue 30–50% | $200–$600 |
| Tier 2 | NPS-detractor follow-up | NPS 0–6 + `Placed Order` ≤60d | 1 (+24h, CS-rep-routed) | 0 | rescue 20–40% | $200–$500 |
| Tier 2 | Subscription renewal + dunning | Recharge renewal + dunning events | 3 (-7d, fail, +3d) | 1 (fail) | recovery 50–70% | $800–$2,500 per recovery cycle |
| Tier 3 | Replenishment | consumable `Placed Order` + life-cycle | 2 (-7d, -1d) | 1 (-3d) | CVR 8–15% | $800–$2,500 |
| Tier 3 | Stock-back notification | restock event for prior `Viewed Product` | 1 (restock) | 1 (restock) | CVR 5–10% | $50–$150 / restock |
| Tier 3 | Account-never-purchased | `Subscribed` ≥30d + no order | 2 (30d, 45d) | 0 | CVR 1.5–4% | $200–$600 |
| Tier 3 | VIP early-access | Smile.io top-tier + product launch | 1 (launch-day) | 1 (launch-day) | CVR 25–45% | $1,000–$4,000 / launch |
| Tier 4 | Lapsed-customer referral push | `Placed Order` ≥365d ago | 1 (365d) | 0 | CVR 1–3% | $100–$300 |
| Tier 4 | Loyalty-points-expiry warning | Smile.io points-expiry-within-30d | 1 (-30d) | 0 | rescue 30–50% | $200–$600 |
| Tier 4 | Seasonal-gift-guide | Q4 season + customer-profile | 4 (Nov, Dec) | 0 | Q4 lift 8–25% | $500–$1,500 / customer |

### Year-1 incremental revenue benchmarks (default $5M GMV brand, Path B scope)

| Tier coverage | Incremental revenue / yr | Lift vs $5M baseline |
|---|---|---|
| Tier 1 only | $600k–$1.25M | 12–25% |
| Tier 1 + 2 | $1.25M–$2.25M | 25–45% |
| Tier 1 + 2 + 3 subset | $1.35M–$2.75M | 35–55% (Path B DEFAULT) |
| All 4 tiers | $2.25M–$4M | 45–80% |

**Default Year-1 ROI: 95:1** (median Path B). Even the conservative case (54:1) is the single highest-ROI move in the entire top-10 leverage list when stacked on the existing Move #1 + #4 + #7 substrate.

## The build (4 tiers over 90 days)

### Week 1 — Tier 1 ship (5 flows, ~6 hours operator time)

Reuses the Move #1 + #4 + #7 Klaviyo + Postscript wiring already live. The 5 flows share trigger patterns with the existing cart-abandon + welcome flows; build time per flow averages ~70 minutes.

1. **Browse-abandon (email + SMS)** — Trigger: `Viewed Product` without `Added to Cart` in 4h. Email #1 at 4h ("Saw this?"), email #2 at 24h ("Still thinking?"), email #3 at 72h ("Last chance — 10% off"); SMS #1 at 24h, SMS #2 at 72h. Voice overrides per `assets/02-brand-voice.md`: Default 10% / Luxury 0% + personalized note / Sustainable 10% + carbon-neutral-shipping / Gen-Z platform-native tone / B2B quote-framed.
2. **Customer winback (email + SMS)** — Trigger: `Placed Order` ≥90d ago + no order since. Email #1 at 90d ("We miss you — 15% off"), email #2 at 120d ("Still thinking?"), email #3 at 180d ("Final offer — 20% + free shipping"); SMS at 90d + 180d. Suppress if customer has placed order in last 30d.
3. **Post-purchase cross-sell (email)** — Trigger: `Fulfilled` event (NOT `Placed Order` — fire when warehouse confirms shipment). Email at 4h post-fulfillment ("Your order shipped — you might also like"), +7d ("Customers who bought X also bought"), +21d ("You might need [related consumable]").
4. **Subscriber-not-buyer sunset (email)** — Trigger: `Subscribed to List` ≥120d ago + no `Placed Order` ever. Email at 120d ("Still want to hear from us?"), +150d ("Last email — unsubscribe if not interested"). Routes unengaged subscribers to a "to be sunset" Klaviyo suppression segment.
5. **Shipping confirmation + transit (email + SMS)** — Trigger: `Fulfilled` + `Shipment In Transit` events. Real-time email + SMS with tracking link; +3d "your delivery is arriving" reminder; +7d "how was it?" review-prompt hand-off to the SMS review-request flow (already shipped via Playbook 06-sms).

### Days 8–30 — Tier 2 ship (5 flows, ~12 hours operator time)

Gated on Move #8 (loyalty) + Move #6 (Triple Whale for NPS-detractor segmentation) + Move #11 (subscriptions if consumables).

6. **Loyalty tier-up (email + SMS)** — Trigger: Smile.io `points_earned` event crossing tier threshold. Email at tier-up ("Welcome to [Tier]!"), SMS at tier-up. Use Smile.io's `tier_name` dynamic block in the email template.
7. **Loyalty tier-down warning (email)** — Trigger: Smile.io tier-eligibility-window projection (30d before downgrade). Email at -30d ("Your tier is at risk — earn [N] points to keep it"). Include the SPECIFIC actions + dollar amounts using Smile.io's `points_to_next_tier` dynamic block.
8. **Birthday (email + SMS)** — Trigger: customer-profile-birthday-field + today's date. Email at -7d ("Your birthday gift is coming"), email at +0d ("Happy birthday — $20 off"); SMS at +0d. Filter: profile.birthday must be valid month-day (else skip).
9. **Anniversary (email)** — Trigger: first-`Placed Order`-event anniversary (1y + 2y + 5y). Email at anniversary ("It's been [N] years — thanks for being a customer").
10. **NPS-detractor follow-up (email)** — Trigger: NPS score 0–6 + `Placed Order` in last 60d. Email at +24h ("Thanks for your feedback — here's how to make it right"). Routes to CS-rep per Asset 06 Q7 + Asset 11 Module 6 via Gorgias `intent = NPS-detractor` tag + auto-routing rule. Email from human's name + title (NOT `no-reply@`).
11. **Subscription renewal + dunning (email + SMS)** — Trigger: Recharge `subscription_renewal_attempt_failed` + `subscription_renewing`. Email at -7d-before-renewal, email at renewal-failed, email at +3d-after-failure; SMS at renewal-failed only. Suppress all dunning if customer has responded to any of them.

### Days 31–90 — Tier 3 ship (4 flows, ~10 hours operator time)

Gated on Move #8 (loyalty tier data) + Move #11 (subscription data) + customer-purchase-cadence data for ≥80% of customers.

12. **Replenishment reminder (email + SMS) — consumables only** — Trigger: `Placed Order` for consumable SKU + product-life-cycle projection (30d vitamins / 60d skincare / 90d pet-food). Email at -7d ("Time to restock"), -1d ("Your supply is running low"); SMS at -3d. Tag every consumable SKU with `consumable_category` + `replenishment_days` metafields.
13. **Stock-back notification (email + SMS)** — Trigger: `Viewed Product` for out-of-stock SKU + inventory-restock event for same SKU within 30 days. Email at restock ("It's back — [Product]"), SMS at restock.
14. **Account-never-purchased (email)** — Trigger: `Subscribed to List` ≥30d + no `Placed Order`. Email at 30d ("You signed up — $10 off"), +45d ("Last chance for $10 off").
15. **VIP early-access (email + SMS)** — Trigger: Smile.io top-tier membership + product-launch event. Email at launch-day ("VIPs see it first"), SMS at launch-day.

### Quarter 2+ — Tier 4 ship (3 flows, ~8 hours operator time)

Gated on Move #8 referrals wired + loyalty-points-expiry configured + Q4 creative ready.

16. **Lapsed-customer referral push (email)** — Trigger: `Placed Order` ≥365d ago + no order since. Email at 365d ("Give $20, get $20 — refer a friend"). Voice overrides: Default $20/$20 / Luxury $50/$50 / Sustainable "donate $20 to [partner]" / Gen-Z $10/$10 / B2B "refer a colleague".
17. **Loyalty-points-expiry warning (email)** — Trigger: Smile.io points-expiry-within-30d. Email at -30d ("Your [N] points expire soon").
18. **Seasonal-gift-guide (email)** — Trigger: Q4 season (Nov 1–Dec 24) + customer-profile. 4 emails: "Gift guide" / "Last shipping dates" / "Stocking stuffers" / "Final week".

### Voice-driven overrides (cross-cutting)

Every flow ships with 5 voice variants per `assets/02-brand-voice.md`:

| Voice | Subject tone | Discount cadence | SMS style | CTA framing |
|---|---|---|---|---|
| Default | Professional + benefit-led | 10% at first escalation | 1 CTA per SMS | Cart URL |
| Luxury | Personal-stylist-tone | 0% first round, free-shipping or complimentary gift | VIP-private-link | Consultation-book |
| Sustainable | Impact-narrative + carbon-neutral | 10% + climate pledge | "Your impact update" | Direct shop URL |
| Gen-Z | Meme-tone + emoji | 20% / $10-off / flash-deal | Platform-native-tone (TikTok / IG) | "Tap to claim" |
| B2B | Account-manager-tone | Quote-framed, no discount | AM-outreach-channel | Book-AM-call |

## Common pitfalls (15 from real builds)

1. **Shipping all 20 flows in Week 1 instead of 4 tiers over 90 days.** Operators try to build 20 simultaneously, get overwhelmed, ship 5 flows with broken configurations + 15 unfinished drafts. **Fix: ship Tier 1 in Week 1, Tier 2 in Days 8–30, Tier 3 in Days 31–90, Tier 4 in Quarter 2+. Use Klaviyo "draft" status to keep Tier 2+ as drafts until the prior tier is live + producing revenue.**
2. **No baseline segmentation before building flows.** Flows target the wrong audience (browse-abandon sends to customers who already purchased), conversion drops to <0.1%, operator declares "browse-abandon doesn't work". **Fix: ship segmentation hygiene FIRST — at minimum 3 baseline segments (active_customer / lapsed_customer / subscriber_not_buyer). Use as the foundation for every flow's audience filter.**
3. **Discount-stacking across flows (browse-abandon 10% + winback 15% + sunset 20% + customer winback 20% all firing on the same customer).** Customer receives 4 discounts in 1 week, redeems all 4 (margin destruction) or learns to wait for the next discount. **Fix: enforce a "1-discount-per-customer-per-30-days" rule via Klaviyo's "suppress if customer is in discount-redeemed-segment in last 30d" filter. Use Smile.io points as the non-monetary re-engagement for cross-channel overlap.**
4. **No A/B testing on subject lines + send times.** Ships with default-subject + default-send-time, conversion is at the 25th-percentile benchmark. **Fix: run 2-variant A/B tests on every flow's first email (subject) + second email (send-time) for the first 4 weeks post-launch. Klaviyo A/B framework is purpose-built; Lift = 15–35% just from subject + send-time optimization.**
5. **Tier-1 ships but operator never returns to optimize.** First-month revenue $2k, second-month $2k, operator assumes flows are at their ceiling. **Fix: schedule a 30-day post-launch flow-performance review (Klaviyo flow-analytics + per-flow revenue + open-rate + CTR). Typical first-30-day lift: 30–50% from subject + send-time + segment-refinement iterations.**
6. **Browse-abandon sends to mobile-app browsers that bounce before Klaviyo identifies them.** `Viewed Product` fires but customer.email is empty (mobile-web sign-in not required), emails never send. **Fix: install Klaviyo onsite JS with `identify_on_viewed_product = TRUE`; for mobile-app, use Klaviyo mobile SDK + segment on `client_platform` for separate mobile-app browse-abandon flow (SMS-first instead of email-first).**
7. **Winback flow sends to customers who are already winback-converted.** Winback-converted customers receive a second winback email 30 days later, unsubscribe-rate spikes. **Fix: add a "suppress if customer has placed order in last 30d" filter to the winback flow's audience. Use Klaviyo's "suppression segment" feature; this is the canonical winback-flow hygiene.**
8. **Post-purchase cross-sell sends BEFORE the customer has received the product.** Customer receives "you might also like [accessory]" while original is in transit, the cross-sell confuses. **Fix: trigger post-purchase cross-sell on `Fulfilled` event (NOT `Placed Order`); fires when warehouse confirms shipment, the canonical trigger for the cadence (4h post-fulfillment + 7d + 21d).**
9. **Sunset flow sends to high-LTV customers who took a long time between purchases.** Customer is annual-purchase-cycle (holiday-only), receives "last email — unsubscribe" in March, unsubscribes, misses the holiday re-engagement in November. **Fix: use Smile.io purchase-recency + tier-history to flag VIP-or-irregular-cycle customers as "do not sunset"; suppress for >5 historical orders OR active loyalty-tier status OR seasonal-buyer tag.**
10. **Loyalty tier-down warning triggers but customer has 0 actionable steps to recover.** Customer gets "your tier is at risk — earn 200 points to keep it" with no idea how, churns to a lower tier. **Fix: include the SPECIFIC actions + dollar amounts ("Spend $50 more by Dec 31 to keep your [Tier]"). Use Smile.io's `points_to_next_tier` dynamic block in the email template.**
11. **NPS-detractor follow-up is sent by a bot, customer escalates to Twitter.** Detractor receives "we'd love to make it right" email from `no-reply@brand.com`, takes to Twitter, gets 100× worse PR than if the flow never sent. **Fix: NPS-detractor follow-up MUST route to a CS-rep (per Asset 06 Q7 + Asset 11 Module 6); use Gorgias's `intent = NPS-detractor` tag + auto-route to human CS-rep within 4 hours; email is from a human's name + title, NOT `no-reply`.**
12. **Subscription renewal dunning sends 3 emails in 1 week, customer feels harassed.** Payment failed (insufficient funds), customer gets 3 emails + 2 SMS in 7 days, cancels the subscription. **Fix: enforce the canonical Recharge dunning cadence — email at -7d-before-renewal + email at renewal-failed + email at +3d-after-failure; SMS only at renewal-failed; total = 3 emails + 1 SMS over 10 days. Suppress all dunning if customer has responded to any of them.**
13. **Replenishment reminder fires for non-consumable SKUs.** Customer buys a sweater, receives "time to restock your sweater" 60 days later, marks as spam. **Fix: tag every consumable SKU with `consumable_category` metafield + `replenishment_days`; replenishment flow only fires for SKUs with both metafields populated. For non-consumables, route to post-purchase cross-sell instead.**
14. **Birthday flow sends to customers who haven't filled in their birthday.** Customer receives "happy birthday — $20 off" in a random month because birthday defaulted to account-creation date. **Fix: enforce "birthday field must be valid month-day" filter; use Klaviyo's "if profile.birthday is empty, skip" rule; offer the customer a "fill in your birthday for $5 off" prompt at account creation + first-order + loyalty-program-enrollment.**
15. **No flow-performance attribution to source-channel or campaign.** Operator runs paid Meta ads, sees Meta-sourced revenue grows, but doesn't know that 30% of Meta-sourced customers are also receiving post-purchase + winback + tier-down flows (Triple Whale shows last-click attribution, lifecycle revenue is invisible). **Fix: enable Klaviyo + Triple Whale integration with `klaviyo.attribution_enabled = TRUE`; the integration attributes flow-revenue back to the original source. Per Triple Whale benchmarks, brands that enable discover lifecycle-marketing revenue is 25–50% of total attributed revenue (vs ~10% visible without the integration).**

## Verification (this skill is "shipped" when...)

### Gate A — Tier 1 ready to launch

- [ ] Move #1 + Move #4 are published, live ≥6 weeks, produced ≥$2k revenue in last 30d combined
- [ ] Move #7 is published, live ≥4 weeks, produced ≥$500 SMS revenue in last 30d combined
- [ ] ≥3 baseline segments have ≥1,000 members each (active_customer / lapsed_customer / subscriber_not_buyer)
- [ ] Klaviyo onsite JS installed + `Viewed Product` events flowing (verified in Klaviyo Activity Feed)
- [ ] Triple Whale (or Polar) installed + producing daily cohort LTV (Move #6)
- [ ] Customer-list-cleanup SOP run in last 90 days (unsubscribes + bounces + spam-complaints processed)
- [ ] Operator committed 4-hour kickoff block + 2-hour weekly maintenance block
- [ ] 5 Tier-1 flows built as Klaviyo DRAFTS with subject-line A/B + send-time A/B variants + 5 voice overrides each
- [ ] Each Tier-1 flow has a defined KPI dashboard (Klaviyo flow-analytics + Triple Whale flow-attribution)
- [ ] 5 Tier-1 flows LIVE in Klaviyo (status = published), 7-day post-launch monitoring window scheduled

### Gate B — Tier 2 ready to launch

- [ ] All 5 Tier-1 flows live ≥30 days + produced ≥$3k revenue combined in last 30d
- [ ] Tier-1 flow performance review completed (subject + send-time + segment-refinement iterations applied)
- [ ] Smile.io installed with ≥3 loyalty tiers configured (Move #8)
- [ ] NPS survey live (per Asset 06) with ≥50 responses in last 30d
- [ ] Customer-birthday-field populated for ≥30% of customers
- [ ] Customer-first-order-date captured in Klaviyo
- [ ] Subscription-app (Recharge / Skio / Bold — Move #11) installed IF brand has consumables; else subscription-renewal deferred
- [ ] 5 Tier-2 flows built as DRAFTS
- [ ] NPS-detractor follow-up routes to CS-rep via Gorgias `intent = NPS-detractor` tag + auto-routing rule
- [ ] 5 Tier-2 flows LIVE in Klaviyo, 30-day post-launch monitoring window scheduled

### Gate C — Tier 3 ready to launch

- [ ] All 5 Tier-2 flows live ≥30 days + produced ≥$5k revenue combined in last 30d
- [ ] Tier-1 + Tier-2 flow performance review completed (4-week + 8-week + 12-week iterations applied)
- [ ] Customer-purchase-cadence data available for ≥80% of customers
- [ ] Stock-back notification triggers wired (`Viewed Product out-of-stock` + inventory-restock event)
- [ ] Account-never-purchased 30-day filter defined (subscribed ≥30d + no `Placed Order` ever)
- [ ] VIP tier (top-tier of Smile.io loyalty) has ≥100 members
- [ ] 4 Tier-3 flows (or 3 if non-consumables) built as DRAFTS + LIVE in Klaviyo, 60-day post-launch monitoring window scheduled

### Gate D — Tier 4 ready to launch

- [ ] All Tier-2 + Tier-3 flows live ≥60 days + produced ≥$10k revenue combined in last 60d
- [ ] Tiers 1+2+3 performance review completed (90-day full-cycle review)
- [ ] Loyalty-program referral feature enabled in Smile.io (Move #8 referrals)
- [ ] Loyalty-points-expiry configured in Smile.io
- [ ] Q4 seasonal-gift-guide creative drafted (Sep–Oct for Nov–Dec send)
- [ ] 3 Tier-4 flows built as DRAFTS + LIVE in Klaviyo, 90-day post-launch monitoring window scheduled

### Library-wide success metrics

- [ ] Per-flow revenue / 1k events meets or exceeds Tier-floor benchmarks (Tier 1 ≥$300, Tier 2 ≥$200, Tier 3 ≥$200, Tier 4 ≥$100)
- [ ] Subject-line A/B test coverage ≥50% of flows in first 30 days, 100% by Day 90
- [ ] Discount-stacking rate <15% (Klaviyo discount-redeemed-segment filter effectiveness)
- [ ] Flow-attribution match rate ≥60% Triple Whale signal (Pitfall #15 fix)
- [ ] Total library revenue ≥30% of total attributed revenue per Triple Whale + Klaviyo integration

## How to extend this skill

Once Tier 1–4 are live + producing revenue:

- **Subject-line + send-time A/B cadence** — run 2-variant A/B tests on every flow's first email + second email for the first 4 weeks post-launch (Pitfall #4)
- **Predictive LTV flows** — once the library is at 6+ months maturity, ship predictive-LTV flows powered by Triple Whale's LTV projections (e.g., "high-LTV-prospect" custom segment + welcome-series for them)
- **RFM segmentation** — overlay RFM (Recency / Frequency / Monetary) segmentation on top of the baseline segments (Move #14.1)
- **Customer-data-platform** — Segment / Rudderstack / Klaviyo CDP for cross-channel orchestration beyond email + SMS + loyalty (push notifications + in-app messaging + direct mail) — gated on Path C scale ($10M+ GMV)
- **International locale variants** — per-market Klaviyo segments + per-market browse-abandon triggers + per-market Postscript SMS sender registration (compounds with Move #11.5 international-expansion)

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1 — the foundation)
- Companion skill: `welcome-series` (Move #4 — feeds the sunset + anniversary flows)
- Companion skill: `sms-orchestration` (Move #19 — pairs with Move #14 lifecycle-flow-library for SMS-orchestration of the 17 flows)
- Companion skill: `loyalty-program` (Move #8 — Tier 2 + Tier 3 + Tier 4 flows all require loyalty data)
- Companion skill: `subscription-replenishment` (Move #11 — Tier 2 dunning + Tier 3 replenishment gated on this)
- Companion skill: `mobile-pdp-redesign` (Move #9 — improves the post-browse PDP experience for browse-abandon flow)
- Companion skill: `ai-ad-creative-iteration` (Move #10 — feeds per-product creative variants for the cross-sell + replenishment flows)
- Companion skill: `pdp-ab-testing-program` (Move #9.5 — A/B testing the flow's first-email subject)
- Companion skill: `post-purchase-upsell` (Move #2 — compounds with Pillar 3 cross-sell)
- Research doc: `/research/05-lifecycle-marketing.md`
- Playbook: `/playbooks/12-lifecycle-flow-library.md`
- Asset: `/assets/14-lifecycle-flow-templates.md`
- Script: `/scripts/lifecycle_flow_health_check.py` (78 gate-flow audit)
- Static dashboard: `/dashboards/lifecycle-flow-library.html`

## Sources

- Klaviyo, "2024 Ecommerce Lifecycle Marketing Benchmark Report"
- Klaviyo, "Lifecycle Marketing Strategy Guide"
- Klaviyo, "Flow Library — Browse Abandonment / Winback / Post-Purchase Cross-Sell / Sunset"
- Klaviyo, "A/B Testing Subject Lines + Send Times 2024"
- Klaviyo, "Behaviorally-Triggered Email Benchmarks 2024"
- Postscript, "SMS Marketing Benchmarks 2024"
- Postscript, "Lifecycle SMS Playbook 2024"
- Postscript, "Dunning + Subscription Recovery SMS 2024"
- Smile.io, "Loyalty Program Benchmarks 2024"
- Smile.io, "Loyalty Tier Best Practices 2024"
- Smile.io, "Points Expiry Configuration 2024"
- Recharge, "Subscription Lifecycle Marketing Benchmarks 2024"
- Recharge, "Dunning Email Best Practices 2024"
- Recharge, "Subscription Renewal Flow Templates 2024"
- Triple Whale, "Klaviyo Integration — Flow Attribution 2024"
- Triple Whale, "Lifecycle Marketing Revenue Attribution 2024"
- Klaviyo + Triple Whale, "Integration Setup + Attribution Method 2024"
- Omnisend, "2024 Ecommerce SMS + Email Benchmark Report"
- Campaign Monitor, "2024 Email Marketing Benchmarks"
- Litmus, "2024 Email Engagement Benchmarks"
- Baymard, "2024 Email Cart-Abandon Recovery Benchmarks"
- Shopify, "2024 DTC Marketing Benchmarks"
- Statista, "Email Marketing Benchmarks 2024"
- Gorgias, "NPS-detractor Recovery Benchmarks 2024"
- Smile.io, "Loyalty Program ROI Studies 2024"
- Return Path, "Sender Reputation Best Practices 2024"
- Sender Score, "Email Deliverability Benchmarks 2024"
- Gmail Postmaster Tools, "Sender Reputation 2024"
- Twilio, "SMS Deliverability Best Practices 2024"
- Postscript, "TCPA + GDPR SMS Compliance 2024"
- Asset 02 — `assets/02-brand-voice.md` (5-voice profile source for per-flow voice-driven overrides)
- Asset 01 — `assets/01-copy-templates.md` (email + SMS body shape source)
