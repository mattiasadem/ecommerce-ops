---
name: post-purchase-upsell
title: Post-purchase upsell
category: retention
tier: 1
priority: P0
default_move: 2
year_1_roi_band: "15:1–40:1"
sms_friendly: false
last_updated: 2026-07-06
sources: [reconvert 2024, aftersell 2024, zipify 2024, bold 2024, tripleshakable 2024, klaviyo 2024, salesforce 2024]
---

# Post-purchase upsell

> Cheapest AOV lift in DTC. One good offer on the thank-you page lifts AOV 10–20% at 15:1–40:1 year-1 ROI. Ships in 1 day.

## When to use this skill

You have:
- A working checkout (Shopify, Ikas, etc.)
- A thank-you page (almost every platform has one)
- At least 100 orders/month

You do NOT have:
- A post-purchase upsell page (most DTC stops at the confirmation)
- A one-click upsell (no re-entry of payment details)
- A/B testing on upsell offer, copy, price

## What "best in class" looks like

Reference: Athletic Greens, Ridge, Bombas, Cuts, Misen, Dr. Squatch.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Timing | 1-click after Place Order | Pre-shipment | After shipment |
| Offer type | 1–3 stacked offers (low / mid / high) | 1 offer | 3-segment by cart value |
| Discount | Free shipping or 10% off | None | Bundle |
| Acceptance rate | 15–25% | 5% | 30%+ (with strong offer) |
| Revenue / order | +$15–$35 | +$5 | +$50+ |
| Decline flow | "No thanks" link, no friction | Modal popup | "Skip" with reason |
| Inventory guard | Hide if SKU out of stock | None | Low-stock badge |
| Post-purchase email | Follow-up email for declined offers | None | 7-day winback |
| Tracking | UTM per upsell + Triple Whale merge | None | Cohort LTV overlay |

## Revenue impact benchmarks (2024–25)

| Setup | AOV lift | Net revenue / $1 platform cost |
|---|---|---|
| 1 upsell, no discount, low acceptance | +5–10% AOV | 8:1–15:1 |
| 3 stacked upsells, free shipping | +10–20% AOV | 20:1–35:1 |
| 3 stacked + cohort-LTV tracking | +15–25% AOV | 25:1–50:1 |
| Full orchestration + decline winback | +20–35% AOV | 30:1–60:1 |

**Median DTC gets +8% AOV at 12:1. Best in class gets +20% AOV at 30:1+.**

## The build (1 day for a competent operator)

### Step 1 — Tool choice

| Tool | Price | Pros | Cons |
|---|---|---|---|
| **ReConvert** | $30–$129/mo | Default choice, Shopify-native, 1-click | $129/mo at scale |
| **AfterSell** | $29–$99/mo | Cheaper, similar feature set | Less polished UI |
| **Zipify OCU** | $49–$149/mo | Strong on copy / pre-built templates | Older, less maintained |
| **Bold Upsell** | $49.99–$99/mo | Bundled with Bold Subscriptions | Less standalone |
| **Native (Shopify Functions)** | $0 + dev | Free, fully custom | Dev cost $2k–$5k |

**Default: ReConvert Starter ($30/mo) for <$1M GMV, ReConvert Pro ($129/mo) above.**

### Step 2 — Choose 3 offers
- **Low ($10–$25)**: consumable add-on, low-friction. e.g. for a $50 cream, offer a $15 sample pack
- **Mid ($25–$60)**: complementary product. e.g. cleanser to pair with moisturizer
- **High ($60–$150)**: bundle, premium tier. e.g. "buy 3 months, get 1 free"

### Step 3 — Build the 1-click flow
- Customer places order
- Redirect to thank-you page
- Show 3 offers in sequence (low → mid → high)
- One-click accept: payment already on file, no re-entry
- One-click decline: small "no thanks" link, no modal

### Step 4 — Write the copy
- Headline: "Add [PRODUCT] for $X" (not "Upgrade your order")
- Subhead: 1-line benefit (not feature list)
- Single image, single price
- Decline copy: "No thanks, complete my order" (not "Skip")

### Step 5 — Wire tracking
- Each upsell = its own UTM
- ReConvert + Triple Whale auto-merges
- Set up cohort: `placed_order + upsell_accepted` vs `placed_order only`
- Track 30/60/90 day LTV per cohort

### Step 6 — Decline winback
- 7 days after declined upsell, send a follow-up email: "Still interested in [PRODUCT]?"
- 5% re-conversion rate on the winback
- Total incremental revenue: +2–4% on top of accepted offers

## Common pitfalls (15 from real builds)

1. **Upsell price > 50% of original order** — acceptance drops below 5%
2. **3+ offers on a single page** — choice paralysis, total acceptance drops
3. **Required discount on every upsell** — trains discount addiction
4. **Discount stacked with the original** — double-discounting, margin kill
5. **No inventory check** — selling out-of-stock SKUs creates CS nightmares
6. **No "no thanks" link** — modal popup → angry customer + support ticket
7. **Pre-built templates with no copy** — looks generic, low acceptance
8. **Same upsell shown to all customers** — high-cart customers get pitched $10 sample
9. **ReConvert checkout not styled** — looks off-brand, breaks trust
10. **No decline email** — missing 2–4% easy incremental revenue
11. **Upsell on subscription orders** — double-charges, support nightmare
12. **Upsell of variants (size, color)** — not what post-purchase is for
13. **No mobile testing** — 70% of orders on mobile; must work
14. **Inventory sync delay** — sells out-of-stock before Shopify catches up
15. **No cohort tracking** — can't prove ROI, can't iterate

## Verification (this skill is "shipped" when...)

- [ ] Test order → upsell page renders after Place Order
- [ ] 1-click accept works (no re-entry of payment)
- [ ] Decline works without friction
- [ ] 3 offers visible (low / mid / high)
- [ ] Each offer has unique UTM
- [ ] Triple Whale shows the cohort LTV difference
- [ ] 7-day acceptance rate ≥ 10% on first 100 orders
- [ ] $/platform-cost ratio ≥ 15:1 in the first month

## How to extend this skill

- Add decline winback email
- Add post-purchase subscription upsell (move #11)
- Add upsell on subscription renewal (move #11 follow-up)
- Add upsell for first-time buyers vs. repeat (different offers)

## Cross-references

- Companion skill: `abandoned-cart-recovery` (Move #1)
- Companion skill: `welcome-series` (Move #4)
- Companion skill: `loyalty-program` (Move #8)
- Research doc: `/research/05-lifecycle-marketing.md`

## Sources

- ReConvert, "Post-purchase benchmarks 2024"
- AfterSell, "Upsell conversion data 2024"
- Zipify, "One-click upsell report 2024"
- Bold Commerce, "Upsell benchmarks 2024"
- Triple Whale, "AOV benchmarks 2024"
- Klaviyo, "Post-purchase flow benchmarks 2024"
- Salesforce, "State of commerce 2024"