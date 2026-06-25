# Top 10 Highest-Leverage Moves (DTC Ecommerce, 2026)

> **Source:** synthesized from `/research/00-ecommerce-ops-landscape.md` and `/research/01-tools-stack-comparison.md`.
> **Use:** ranked list the cron job can pick from when it wants to do ONE bounded improvement per tick.

Ranked by **expected revenue impact per hour of operator time**. Not ranked by effort or "good practice."

| # | Move | Why it ranks | Estimated effort | Expected ROI |
|---|---|---|---|---|
| 1 | **Build the abandoned-cart email + SMS flow in Klaviyo** | Single highest-ROI flow in DTC. Recovers 5–15% of lost carts. Every $1 sent returns ~$36–$40. | 4–8 hours | Pays for itself within 1 week of traffic |
| 2 | **Add a post-purchase upsell (zipper/cross-sell page)** | Lowest-friction AOV lift. Tools: ReConvert, AfterSell, Bold Upsell. 10–20% AOV lift common. | 1 day | 5–15% revenue lift |
| 3 | **Run a checkout audit + Baymard fix-list** | +35% CVR available from typical checkout overhaul. Address fields, guest checkout, payment options. | 2–5 days | 15–35% conversion lift |
| 4 | **Set up welcome series (3–5 emails over 7–14 days)** | Onboards subscribers, conditions them to buy, $0–$5 cost per recipient, lifts 90-day LTV 10–20%. | 1–2 days | LTV 10–20% |
| 5 | **Switch to Klaviyo + Postscript from any other ESP/SMS** | Best-in-class for Shopify; consolidates spend; better deliverability. Migration cost is real but ROI dominates. | 1 week | Better deliverability + better automation = 10–30% retention revenue |
| 6 | **Install Triple Whale Starter (or Polar if cheaper)** | Knows what is working. Without attribution you are guessing on $5k+/mo ad spend. | 1 day | Prevents $1k+/mo wasted spend |
| 7 | **Add SMS welcome + cart-abandon flows** | SMS open rate 95%+ vs email 20%. Same flows as email but SMS-first. Attentive/Postscript. | 1 week | 5–15% revenue lift on the same traffic |
| 8 | **Implement a loyalty program (points, VIP tier)** | Repeat purchase rate lifts 20–30%. Smile.io or Yotpo Loyalty. Cheap to launch. | 1 week | 20–30% repeat purchase rate lift |
| 9 | **Mobile-first PDP redesign (above-the-fold + speed)** | Mobile = 70% of traffic, ~50% of CVR. A 1-second speed improvement = +7% conversion. | 2–4 weeks | 10–25% conversion lift on mobile |
| 10 | **Set up AI ad creative iteration (AdCreative.ai or Moby)** | Cuts ad creative production 10×. Same human, more variations, faster learnings. | 1 week | 10–30% ROAS lift from creative testing |

## What this list is NOT

- It's not exhaustive. There are dozens of other moves (3PL migration, subscription program, marketplace expansion, etc.) — these are the **top 10 by ROI per hour**.
- It's not universal. Premium/luxury brands weight #2, #9, #10 higher. Consumables weight #4, #7, #8 higher. Single-product brands weight #1, #3 higher.

## Cron selection logic

When the cron picks an improvement, it should:
1. **Prefer unfinished items** from `/playbooks/` over starting new ones.
2. **Prefer items #1–#5** in the list above if no playbook is in progress.
3. **Never start a new move if there's an in-progress one** — finish first.
4. **Cap each move at ~1 day of work.** If it balloons, split into a new playbook.

## Status tracker

| Move | Status | Owner | Last touched |
|---|---|---|---|
| 1. Abandoned cart flow | shipped (playbook + ROI script + tests, 2026-06-23) | cron | 2026-06-23 |
| 2. Post-purchase upsell | shipped (playbook + ROI script + 26 tests, 2026-06-24) | cron | 2026-06-24 |
| 3. Checkout audit | shipped (playbook + scoring script + 46 tests, 2026-06-24) | cron | 2026-06-24 |
| 4. Welcome series | shipped (playbook + ROI script + 44 tests, 2026-06-24) | cron | 2026-06-24 |
| 5. Migrate to Klaviyo+Postscript | shipped (playbook — 4-path decision matrix + 6 phases + 7-gate verification + cost table, 2026-06-24) | cron | 2026-06-24 |
| 6. Install Triple Whale | shipped (playbook — 5-path decision matrix [A: Shopify <$500k → Polar Starter $49/mo / B: Shopify $500k–$5M → Triple Whale Starter $179/mo (default) / C: Shopify $5M+ → Triple Whale Pro $1,290/mo / D: non-Shopify → Polar Pro $299/mo / E: pre-revenue → free GA4 only], 10-prereq gate, 6-step build [install app → pixel+CAPI → post-purchase survey → Klaviyo+Meta+Google+TikTok integrations → baseline dashboard with 5 widgets → 7-gate verification], 15-pitfall list with corrective "Fix:" lines [including the "Triple Whale vs GA4 mismatch" trap #15 — operator abandons tool after 30 days when the numbers don't agree], 7-gate end-to-end verification [A: pixel+CAPI green / B: survey ≥80% firing on test orders / C: Klaviyo cohort sync / D: Meta CAPI events with matching event_id / E: Google Enhanced Conversions quality Good or Excellent / F: survey response rate ≥15% / G: cohort LTV ON>OFF by ≥10% — the "killer test" that proves attribution is producing actionable signal], 15-metric monitoring table, cost-ROI table for default $1M–$5M GMV case [$2,348/yr platform+setup cost vs $45,600/yr benefit = **19.4× net Year 1 ROI, 3-week payback**], companion `scripts/triple_whale_attribution_check.py` hermetic local-config checklist runner + 49 TDD tests, 2026-06-25) | cron | 2026-06-25 |
| 7. SMS welcome + cart | shipped (playbook — 4 flows [SMS-1 Welcome, SMS-2 Cart-Abandon 1, SMS-3 Cart-Abandon 2 escalation, SMS-4 Review Request], 10-prereq gate, 7-step verification [A-G], 13-metric monitoring, 13-pitfall list, 5.7:1 ROI table, 2026-06-25) | cron | 2026-06-25 |
| 8. Loyalty program | shipped (playbook — 5-path decision matrix [A: Shopify ≤$1M → Smile.io / B: Shopify $1M–$10M on Yotpo → Yotpo Loyalty / C: Shopify $10M+ → Smile Enterprise or LoyaltyLion Pro / D: non-Shopify → LoyaltyLion / E: custom → skip], 10-prereq gate, 6-step build [app install → points+tiers+referrals config → Klaviyo webhooks → 6-touch launch sequence → on-site widgets → verify], 15-pitfall list, 7-gate verification [A–G: app connected / Klaviyo webhook fires / tier-up event / launch sequence trigger / referral end-to-end / birthday reward / Triple Whale attribution], 15-metric monitoring table, 7.9:1–10.0:1 ROI for default 5k-customer case [Smile $249/mo cost vs $1,968–$2,494/mo incremental margin], 2026-06-25) | cron | 2026-06-25 |
| 9. Mobile PDP redesign | pending | cron | – |
| 10. AI ad creative | pending | cron | – |
