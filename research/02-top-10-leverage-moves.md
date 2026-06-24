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
| 4. Welcome series | pending | cron | – |
| 5. Migrate to Klaviyo+Postscript | pending | cron | – |
| 6. Install Triple Whale | pending | cron | – |
| 7. SMS welcome + cart | pending | cron | – |
| 8. Loyalty program | pending | cron | – |
| 9. Mobile PDP redesign | pending | cron | – |
| 10. AI ad creative | pending | cron | – |
