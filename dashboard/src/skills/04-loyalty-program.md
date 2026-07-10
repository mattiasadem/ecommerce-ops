---
name: loyalty-program
title: Loyalty & rewards program
category: retention
tier: 1
priority: P1
default_move: 8
year_1_roi_band: "10:1–30:1"
sms_friendly: false
last_updated: 2026-07-10
sources: [smile 2024, yotpo 2024, loyalty-lion 2024, stamped 2024, birdeye 2024, klaviyo 2024, triple-whale 2024, salesforce 2024, yonder 2024, antavo 2024]
---

# Loyalty & rewards program

> A points-and-tiers loyalty program raises repeat-purchase rate 15–30%, lifts 12-month LTV 20–40%, and unlocks the entire Tier 2-4 lifecycle library (tier-up, tier-down, VIP early-access, referral-activation, points-expiry). Ship a 4-tier program with Smile.io + Klaviyo wiring at 10:1–30:1 year-1 ROI. Move #8 — and a hard prereq for the next 17 lifecycle flows.

## When to use this skill

You have:
- A Shopify (or Ikas / BigCommerce / WooCommerce) store with at least 1,000 customers
- An email tool (Klaviyo, Brevo, Mailchimp)
- At least 6 months of order history (so points redemption isn't trivially abused)
- A repeat-purchase product or consumables catalog (loyalty works best when LTV > 1.5× AOV)

You do NOT have:
- Any points / tiers / referral program (most DTC stops at "email us for a discount")
- Tiers — you have a flat 1:1 points-for-dollar setup with no Bronze/Silver/Gold structure
- A referral loop wired to the loyalty program
- VIP early-access for top-tier customers

## What "best in class" looks like

Reference: Sephora Beauty Insider, Starbucks Rewards, The North Face XPLR Pass, REI Co-op, Glossier Ultra Violette, Dr. Squatch Club, Bombas.

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Points earn rate | 1 pt / $1 spent + 2× on subscription / bundles | 1 pt / $1 flat | 1 pt / $1 + 5× on launch day |
| Signup bonus | 100–500 pts immediately | None | 500 pts + free ship |
| Tier structure | 3–4 tiers (Member / Insider / VIP / Elite) | 1 tier | 5 tiers (tier-aware perks per tier) |
| Tier thresholds | Real AOV-anchored (e.g. $0/$200/$500/$1,000 LTV) | Random $ amounts | Tier thresholds = customer-percentile buckets |
| Points expiry | 12 months rolling, or never | 90 days (churn signal) | Never (lifetime points) |
| Redemption | 100 pts = $5 off + free products + experiences | 100 pts = $1 off | Tier-gated SKUs + early access |
| Referral | 2-sided: referrer 500 pts, referee 200 pts | 1-sided | Multi-tier (refer 5 → unlock VIP tier) |
| VIP early-access | 24–48h before public launch | None | Tier-gated SKUs always |
| Birthday / Anniversary | $10–$25 reward + tier-specific perk | None | $25 + free gift + double-points day |
| Free shipping | Threshold-tied to tier (Insider free over $50, VIP free over $0) | None | Always free for VIP+ |
| Tier-down warning | 30 days before tier expiry with specific action steps | None | Pre-tier-down nudges monthly |
| Program visibility | Header bar with current points + tier, footer widget, PDP module, checkout upsell | Email-only | Hero banner + PDP module + dedicated `/loyalty` page |

## Loyalty benchmarks (2024–25)

| Setup | Repeat purchase rate lift | 12-mo LTV lift | Net revenue / $1 platform cost |
|---|---|---|---|
| No loyalty program | — | — | — |
| Flat 1:1 points, no tiers | +5–10% repeat | +5–10% LTV | 8:1–15:1 |
| 3 tiers + birthday + referral | +15–25% repeat | +15–25% LTV | 15:1–30:1 |
| 4 tiers + VIP early-access + paid-tier add-on ($) | +25–40% repeat | +25–40% LTV | 25:1–50:1 |
| 4 tiers + paid tier ($/yr) + VIP experiences + charity donation tier | +30–50% repeat | +35–60% LTV | 30:1–80:1 |

**Median DTC gets +15% repeat at 18:1. Best in class gets +30% repeat at 35:1+.** Per Smile.io's 2024 loyalty benchmark report, members generate **2.3× more revenue per visit** than non-members, and **VIPs (top 10%) generate 40–50% of total revenue** in mature loyalty programs.

## The build (8–14 hours for a competent operator)

### Step 1 — Tool choice

| Tool | Price | Pros | Cons |
|---|---|---|---|
| **Smile.io** | $0–$649/mo | Default choice, Shopify-native, deep Klaviyo + Triple Whale integration, 4-tier support | $649/mo at scale for Pro |
| **Yotpo Loyalty** | $99–$499/mo | Bundled with Yotpo reviews + SMS, VIP tiers built-in | More expensive at SMB tier |
| **LoyaltyLion** | $99–$349/mo | Strong on data export + segmentation | Less polished UX |
| **Stamped.io Loyalty** | $0–$119/mo | Cheapest, includes reviews + UGC | Tier logic is basic |
| **Yonder** | $199–$999/mo | Premium experience curation, paid tiers | Overkill for <$5M GMV |

**Default: Smile.io Starter ($0–$49/mo) for <$1M GMV, Smile.io Pro ($649/mo) above $1M.**

### Step 2 — Define the earn / burn rules

- **Earn:** 1 pt per $1 spent on full-price orders; 2 pts per $1 on subscriptions; 5 pts per $1 on launch-day SKUs; 200 pts for writing a review; 500 pts for a referral conversion
- **Burn:** 100 pts = $5 off, 250 pts = $15 off, 500 pts = $35 off + free shipping, 1,000 pts = free product + free shipping
- **Never expire** OR 12-month rolling (Smile default) — never go shorter (churn signal)

### Step 3 — Build the 3–4 tier structure

For a $75 AOV brand at $1M GMV:

| Tier | Threshold | Members target % | Perks |
|---|---|---|---|
| **Member** | $0+ (free signup) | 80% | 1 pt/$1, 100 pt signup bonus, $5 birthday reward |
| **Insider** | $200 12-mo spend OR 1,500 pts | 15% | All Member perks + 2× points on subscription + free shipping over $50 |
| **VIP** | $500 12-mo spend OR 4,000 pts | 4% | All Insider perks + 4× points + free shipping always + VIP early-access 48h + tier-gated SKUs |
| **Elite** | $1,000 12-mo spend OR 8,000 pts | 1% | All VIP perks + $25 birthday reward + free gift on launch day + concierge CS |

### Step 4 — Wire the referral loop

- Customer shares personal link (URL: `?ref=ABC123`)
- Referee places first order → both get 500 pts (referrer) + 200 pts (referee) + $10 off first order
- Auto-trigger Klaviyo flow: "Your friend [NAME] just joined"
- Track in Triple Whale as a separate source

### Step 5 — Add the customer-visible assets

- **Header bar** — "Earn 100 pts when you sign up" (with login dropdown showing current pts + tier)
- **PDP module** — "Earn 250 pts when you buy this" (below price)
- **Cart upsell** — "Spend $15 more to unlock free shipping + 500 pts"
- **Dedicated `/rewards` page** — full tier table + points tracker + redemption catalog
- **Footer widget** — current pts + tier progress bar
- **Email footer** — every Klaviyo email ends with current pts balance + tier progress

### Step 6 — Wire to Klaviyo

Smile.io native integration fires 6 events into Klaviyo:
- `Smile: Loyalty: Signup` → Welcome + signup bonus email
- `Smile: Loyalty: Tier Upgrade` → Tier-up celebration + perks reveal
- `Smile: Loyalty: Tier Downgrade Warning` → Tier-down warning + specific action steps
- `Smile: Loyalty: Points Earned` → Receipt + thank-you
- `Smile: Loyalty: Points Redeemed` → Receipt
- `Smile: Loyalty: Referral Converted` → Referrer reward + referee welcome

Then build 5 Klaviyo flows gated on these events:
1. **Tier-up celebration** (Tier 2) — email + SMS at tier-up moment
2. **Tier-down warning** (Tier 2) — email 30 days before downgrade
3. **Birthday** (Tier 2) — email + $10 reward at birthday
4. **Referral reward** (Tier 1) — email + 500 pts at referee conversion
5. **Points expiry warning** (Tier 4) — email 30 days before expiry

### Step 7 — Wire to Triple Whale

- Smile.io → Triple Whale merge on `email` key
- Tag every order with `tier: 'member' | 'insider' | 'vip' | 'elite'`
- Build a "Loyalty LTV cohort" dashboard: 30/60/90/180/365-day LTV by tier
- Compare member vs non-member LTV (proof of program ROI)
- Track referral-sourced revenue as a separate source

### Step 8 — Verification

- Test order → points credited within 5 min (Smile webhooks are real-time)
- Tier-up triggers Klaviyo flow → email lands in 5 min
- Birthday → 30-day pre-birthday test
- Referral → referee places order → both get pts within 1 hour
- Triple Whale shows `tier` tag on order
- 30 days post-launch: `active_loyalty_members` ≥ 30% of total customers

## Common pitfalls (15 from real builds)

1. **Tiers based on lifetime spend, not 12-mo rolling spend** — customers who spent $500 once 2 years ago are "VIP" forever; doesn't drive behavior. Use 12-month rolling window OR total-points (Smile default).
2. **Too many tiers (5+) for a small list** — splits thin membership, kills VIP prestige. Use 3 tiers at <$1M GMV, 4 tiers at $1M+, max 4.
3. **Points expiry too short (90 days)** — churn signal. Use 12-month rolling OR never (Smile supports both).
4. **Redemption value too low** — 100 pts = $1 off means 2,000 pts for a $20 reward; nobody redeems. Use 100 pts = $5 off as the floor.
5. **No signup bonus** — member has 0 pts after signup, no incentive to return. Give 100–500 pts immediately on signup.
6. **No header bar or PDP visibility** — program is invisible; members don't know points exist. Add header bar + PDP module + dedicated `/rewards` page.
7. **VIP tier threshold unreachable for typical customer** — $1,500 12-mo spend for a $50 AOV brand = 30 orders/yr; only whales hit it. Anchor to actual customer percentile (top 5% of 12-mo spenders).
8. **Tier-down warning with no action steps** — customer gets "you're losing your tier" but doesn't know how to save it. Include "$X more in 30 days = keep your tier" + dynamic `points_to_next_tier` block.
9. **Referral rewards land after the referee places 2nd order, not 1st** — referrer waits 90+ days for reward. Trigger immediately on 1st order.
10. **Referral reward too small** — 50 pts ($2.50) for referring a $100 customer = 2.5% reward; not worth the effort. Use 500 pts ($25) or 10% of referee's 1st order.
11. **No Klaviyo integration** — tier-up, tier-down, birthday events don't fire. Native Smile ↔ Klaviyo integration is the default; verify by checking Klaviyo's "Activity Feed" for Smile events.
12. **Birthday reward lands on the wrong day** — Klaviyo's default is "1 day before birthday" which often lands on Dec 31 → birthday email. Use Klaviyo's "Birthday - 7 days" trigger and accept the off-by-a-week; OR use a "Birthday month" trigger.
13. **No double-points campaigns** — points sit idle between major launches. Schedule 4×/yr double-points weeks tied to product drops + holiday weekends.
14. **Free shipping perk unlocks at $50 but AOV is $75** — everyone already qualifies, perk isn't differentiating. Anchor free-shipping tier to 1.5× AOV so it's an aspiration.
15. **No paid tier** — for mature programs ($5M+ GMV), add a paid VIP+ tier ($50–$100/yr) that unlocks exclusive products + events. Sephora Rouge ($50/yr) generates $50M+ in revenue on 100k members.

## Verification (this skill is "shipped" when...)

- [ ] Smile.io installed with 3+ tiers + earn/burn rules + birthday + referral configured
- [ ] Test order → points credited within 5 min, visible in customer account
- [ ] Tier-up triggers Klaviyo flow → email lands in 5 min
- [ ] Birthday test → 7-day pre-birthday email lands with reward code
- [ ] Referral test → referee places 1st order → both get pts within 1 hour
- [ ] Triple Whale shows `tier` tag on every order
- [ ] Header bar + PDP module + `/rewards` page all live with current pts + tier
- [ ] 30 days post-launch: `active_loyalty_members` ≥ 30% of total customers
- [ ] Member vs non-member LTV gap ≥ 15% in Triple Whale cohort view
- [ ] $/platform-cost ratio ≥ 15:1 in the first 90 days

## How to extend this skill

- Add tier-gated SKUs (VIP-only product drops)
- Add paid VIP+ tier (Sephora Rouge model — $50–$100/yr for exclusive perks)
- Add points-expiry flow (Tier 4) — drives 20–40% of inactive members back within 30 days of expiry warning
- Add loyalty-tier-downgrade-on-purchase (every purchase counts toward tier maintenance)
- Add charity donation as a redemption option (Sustainable-voice cohort fit)
- Add gamification (quests, streaks, badges) for Gen-Z-voice brands
- Add VIP-concierge CS route (Klaviyo + Gorgias tier-tag-based routing)
- Add points-with-subscription-acceleration (2× points on subscription orders; compounds Move #11)

## Cross-references

- Companion skill: `welcome-series` (Move #4 — onboarding sets up loyalty signup bonus)
- Companion skill: `post-purchase-upsell` (Move #2 — point-up on upsell purchase)
- Companion skill: `abandoned-cart-recovery` (Move #1 — refer to loyalty in cart-abandon email)
- Companion research: `/research/05-lifecycle-marketing.md` (Move #8 is a hard prereq for 17 Tier 2-4 flows)
- Companion research: `/research/08-subscriptions.md` (subscriptions compound with loyalty 2× points)
- Companion research: `/research/09-affiliate-program.md` (referral loop shares infrastructure)

## Sources

- Smile.io, "Loyalty program benchmarks 2024"
- Smile.io, "VIP tier performance report 2024"
- Yotpo, "Loyalty-driven LTV study 2024"
- LoyaltyLion, "Repeat purchase rate benchmarks 2024"
- Stamped.io, "Loyalty + reviews bundle impact 2024"
- Birdeye, "Customer loyalty trends 2024"
- Klaviyo, "Lifecycle + loyalty integration benchmarks 2024"
- Triple Whale, "Member vs non-member LTV report 2024"
- Salesforce, "Loyalty program ROI state of commerce 2024"
- Yonder, "Premium loyalty paid-tier benchmarks 2024"
- Antavo, "Global customer loyalty report 2024"