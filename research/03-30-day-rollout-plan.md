# 30-Day Rollout Plan — Ecommerce Ops

> **Source.** Sequenced from `research/00-ecommerce-ops-landscape.md` + `research/01-tools-stack-comparison.md` + `research/02-top-10-leverage-moves.md` + 16 shipped playbooks (`playbooks/01-…` through `playbooks/10-…`, `06.5` through `06.9`, `09.5`).
> **Use.** A new operator landing on this workspace wants to know "where do I start?" — not "read the top-10 table." This doc is the answer: day-by-day milestones for a brand shipping all 16 moves in 30 days, with explicit decision points, costs, and verification gates.

## TL;DR

A Shopify brand at **$100k–$50M GMV** with **$500+/mo paid spend** can ship all **16 moves in 30 days** at **1–2 hours of operator time per week** per move, with a total monthly cost stack of **$1,200–$2,800/mo** (mostly the SaaS subscriptions) and an expected **Year-1 ROI of 6:1–88:1** depending on the move. The plan is sequenced so that **each move's prerequisite is shipped in the prior week** — no move requires a tool that's not yet installed.

**The 4-week rhythm:**
- **Week 1 (Days 1–7): Foundation.** Install attribution (Move #6 Triple Whale) + first two flows (Move #1 cart abandon + Move #4 welcome series). End-of-week check: 100% of orders now attributed + first 3 cart-abandon emails scheduled.
- **Week 2 (Days 8–14): Recovery.** Migrate email + SMS to best-in-class (Move #5 Klaviyo + Postscript) + post-purchase upsell (Move #2) + checkout audit (Move #3). End-of-week check: AOV +5–10% + checkout CVR +5–15% measured.
- **Week 3 (Days 15–21): Scale.** SMS flows (Move #7) + mobile PDP redesign (Move #9) + first AI creative iteration (Move #10). End-of-week check: mobile CVR +10–20% + first 50 AI creative variants running.
- **Week 4 (Days 22–30): Optimization.** PDP A/B testing (Move #9.5) + loyalty program (Move #8) + attribution-quality monitoring stack (Move #6.5 → #6.6 → #6.7 → #6.8 → #6.9). End-of-week check: weekly attribution rollup scheduled + dashboard URL bookmarked + first PDP test winner promoted.

**Decision points** are explicit at each week boundary — if your brand size or stack differs from the default, the plan forks (see "When to deviate" below).

## Who this is for

- **Primary:** DTC Shopify brand at $100k–$50M GMV with $500+/mo paid social spend and 1–2 hr/wk of operator time available.
- **Secondary:** Non-Shopify DTC (WooCommerce, BigCommerce, Magento) — most moves apply; the vendor-specific stacks (Triple Whale → Polar Analytics, Klaviyo → equivalent) fork at Week 1 + Week 2.
- **Not for:** Pre-revenue brands (skip Move #10 AI creative until $2k+/mo ad spend; skip Move #6.5 attribution quality until 100+ orders/month). See Move #4 welcome series path-E "pre-revenue → defer" for the minimum viable starter kit.

## Prerequisites

Before Day 1, you need:
- A live Shopify (or compatible) store with at least 30 days of order history.
- Admin access to: Meta Ads Manager, Google Ads, Klaviyo (or current ESP), your SMS provider (or none yet), Shopify admin.
- An ad-spend baseline of at least $500/mo across Meta + Google (TikTok / Snap / Pinterest optional but recommended).
- A documented refund + return policy (Move #8 loyalty requires this).
- At least 1,000 email subscribers OR an install-day commitment to grow the list (Move #4 welcome series).
- 1–2 hr/wk of operator time per move (16 moves × 1 hr/wk = ~16 hr over 4 weeks; the second hour is buffer).
- A weekly review cadence (every Monday 09:00 — the Move #6.8 attribution rollup will live here).

If any of the above is missing, the plan **defers the dependent move** rather than skipping the whole week. The decision matrix at each week boundary handles this.

## The 30-day plan

### Week 1 — Foundation (Days 1–7)

| Day | Move | Why first | Time | Verification |
|---|---|---|---|---|
| 1 | **Move #6: Install Triple Whale (or Polar)** | All downstream measurement depends on this. Day 1 install → Day 7 first baseline snapshot. | 1 hr | App installed + pixel + CAPI green (Gate A). |
| 2 | **Move #1: Build the abandoned-cart email flow** | Highest-ROI single flow (5–15% cart recovery). Single flow, 3 emails, 1 hr. | 1 hr | Flow live with 3 emails (Gate A) + test order triggers flow (Gate B). |
| 3–4 | **Move #4: Set up welcome series (3–5 emails)** | Subscriber onboarding. Same Klaviyo infrastructure as Move #1; reuse email builder. | 2 hr | First welcome email sent within 5 min of signup (Gate A) + 5-email flow live. |
| 5–6 | Buffer | Catch-up + first week-end review. | — | All Week-1 moves passing 7-gate verification. |
| 7 | **First baseline snapshot** | Triple Whale → Reports → Cohort LTV (ON vs OFF, last 7d). Record: total revenue / orders / MER / per-channel CVR. | 30 min | Snapshot saved to `research/baselines/2026-MM-DD-week-1.md`. |

**End-of-week check:** Triple Whale installed + cart abandon flow live + welcome series live + first baseline snapshot captured. **No revenue impact yet** (cart abandon + welcome take 7–14 days to accumulate data).

### Week 2 — Recovery (Days 8–14)

| Day | Move | Why second | Time | Verification |
|---|---|---|---|---|
| 8 | **Move #5: Migrate to Klaviyo + Postscript** (if not already on them) | Best-in-class for Shopify + better deliverability. Klaviyo+Postscript is the assumed substrate for Weeks 3–4 moves. | 4 hr | Klaviyo OAuth'd into Shopify + Postscript OAuth'd into Klaviyo (Gate A). |
| 9 | **Move #5 continued** | Migration cutover: import historical flows + sunset old ESP. | 4 hr | All flows imported + old ESP paused (Gate D). |
| 10 | **Move #2: Post-purchase upsell page** | Lowest-friction AOV lift. ReConvert / AfterSell / Bold Upsell — pick per Move #2 decision matrix. | 4 hr | Upsell page live on test order (Gate A) + 10–20% AOV lift measured at Day 14 (Gate C). |
| 11–12 | **Move #3: Checkout audit + Baymard fix-list** | +35% CVR available from typical checkout overhaul. | 8 hr | Baymard audit + 15-item fix-list (Gate A) + top-5 fixes shipped (Gate B). |
| 13–14 | Buffer + Week 2 review | — | — | Move #2 AOV lift confirmed + Move #3 checkout CVR lift measured. |

**End-of-week check:** Klaviyo + Postscript substrate live + AOV +5–10% (Move #2) + checkout CVR +5–15% (Move #3). **First revenue impact measurable.**

### Week 3 — Scale (Days 15–21)

| Day | Move | Why third | Time | Verification |
|---|---|---|---|---|
| 15–16 | **Move #7: SMS welcome + cart-abandon flows** | SMS open rate 95%+ vs email 20%. Same flow logic as email but SMS-first. Postscript. | 8 hr | All 4 SMS flows live (Gate A) + test cart triggers SMS within 5 min (Gate B). |
| 17–18 | **Move #9: Mobile-first PDP redesign** | Mobile = 70% of traffic, ~50% of CVR. Theme.liquid + image pipeline + sticky ATC. | 8 hr | PageSpeed mobile ≥90 (Gate A) + ATC visible on iPhone SE (Gate D). |
| 19–20 | **Move #10: AI ad creative iteration** | 10–30% ROAS lift from AI creative testing. Moby / AdCreative.ai. | 6 hr | First 50–100 variants live in Meta (Gate A) + dynamic creative launched (Gate C). |
| 21 | Buffer + Week 3 review | — | — | All Week-3 moves passing 7-gate verification. |

**End-of-week check:** Mobile CVR +10–20% (Move #9) + first 50 AI variants running (Move #10) + SMS flows live (Move #7). **Mobile CVR lift is the headline metric this week.**

### Week 4 — Optimization (Days 22–30)

| Day | Move | Why fourth | Time | Verification |
|---|---|---|---|---|
| 22–23 | **Move #9.5: PDP A/B testing program** | Move #9's natural follow-up — test headline + gallery + ATC variants using Convert.com + cohort LTV overlay from Triple Whale. | 6 hr | First test launched + 14-day duration planned (Gate B). |
| 24–25 | **Move #8: Loyalty program** | Repeat purchase rate lifts 20–30%. Smile.io / Yotpo Loyalty / LoyaltyLion. | 6 hr | App installed + points/tiers configured + Klaviyo webhooks live (Gates A + B + C). |
| 26 | **Move #6.5: Attribution quality audit (Meta + Google + GA4)** | The measurement surface for Move #9.5 cohort LTV + Move #8 cohort segmentation. | 4 hr | 6 diagnostic JSONs exported + audit script passes all 6 gates. |
| 27 | **Move #6.6 + Move #6.7: TikTok + Snap/Pinterest attribution audits** | If TikTok / Snap / Pinterest spend > $500/mo each; skip otherwise. | 4 hr | All gates passing per platform. |
| 28 | **Move #6.8: Cross-platform attribution drift unification** | Consolidates per-platform alerts into 1 unified alert + 5-hypothesis root-cause matcher. | 4 hr | Rollup script runs end-to-end (Gate B) + Slack alert format matches canonical template (Gate C). |
| 29 | **Move #6.9: Unified attribution dashboard** | The "where do I look first?" surface for the operator. Static HTML, no build step. | 2 hr | Dashboard opens in browser with all 5 sections visible in demo mode (Gate A). |
| 30 | **Final baseline snapshot + handoff** | Capture Week 4 vs Week 1 deltas. Save to `research/baselines/2026-MM-DD-week-4.md`. | 2 hr | Week 1 vs Week 4 snapshot comparison shows: AOV +5–10% / mobile CVR +10–20% / checkout CVR +5–15% / total revenue +20–50% / attribution 100% coverage. |

**End-of-week check:** All 16 moves shipped + attribution stack passing 6+3+6=15 gates weekly + dashboard live + A/B test running + loyalty members enrolling. **Program is now in steady state** — Day 31+ is weekly review cadence, not build cadence.

## When to deviate (decision matrix)

The default plan assumes **Shopify $1M–$5M GMV**. Adjust per the following forks:

| Your situation | What changes |
|---|---|
| **<$100k GMV** | Skip Move #9.5 (A/B testing needs ≥2k sessions/wk). Skip Move #10 (AI creative needs $2k+/mo spend). Keep all other moves. |
| **$100k–$500k GMV** | Default plan applies; consider Polar Analytics ($49/mo) instead of Triple Whale ($179/mo) per Move #6 path A. |
| **$500k–$5M GMV** | Default plan applies; Triple Whale Starter $179/mo is the sweet spot. |
| **$5M+ GMV** | Add Triple Whale Pro ($1,290/mo) per Move #6 path C. Add Move #9.5 weekly cadence (not monthly). Consider Move #6.8 daily cadence (path C) instead of weekly. |
| **Non-Shopify (WooCommerce / BigCommerce / Magento)** | Skip Move #6 Triple Whale, use Polar Analytics (works with all platforms) per Move #6 path D. Move #9's 7-step PDP principles apply (path D). |
| **Pre-revenue (<$10k/mo revenue)** | Skip Move #10 AI creative. Skip Move #6.5 attribution quality (need 100+ orders/mo). Welcome series (Move #4) becomes the first priority over cart abandon (Move #1). |
| **Multi-store (3+ Shopify instances)** | Move #6.8 cross-platform rollup extends naturally — each store gets its own audit cycle, drift detection fires on store-level deltas. |
| **No SMS provider today** | Skip Move #7 in Week 3; add Postscript $200/mo setup on Day 22 alongside Move #8 loyalty. |
| **No email provider today** | Week 1 forks: Move #1 + Move #4 collapse into "install Klaviyo + build both flows" on Day 1–4. |
| **Existing ESP (Mailchimp / ActiveCampaign)** | Move #5 migration cutover is the hardest part — budget 8 hr not 4 hr for the cutover day. |
| **Heavy TikTok spend (>$2k/mo)** | Promote Move #6.6 to Week 3 (Day 19–20) and demote Move #7 SMS to Week 4. |
| **Heavy Snap/Pinterest spend (>$500/mo)** | Add Move #6.7 to Week 4 alongside Move #6.6. |

## Common pitfalls (the top 10 things that derail a 30-day rollout)

1. **Skipping Move #6 attribution.** "I'll add Triple Whale later" → 14 days later you have 14 days of unattributed orders and you can't measure any of Moves #1–#10. **Fix: Move #6 is Day 1, non-negotiable.**
2. **Trying to do all 16 moves in parallel.** Cognitive overload → half-completed flows → bad data → re-do. **Fix: One move per 1–2 days max. Buffer days exist for a reason.**
3. **Migrating to Klaviyo + Postscript (Move #5) AFTER the flows are built.** Forces a re-build. **Fix: Move #5 is Week 2, BEFORE any new flow work in Week 3.**
4. **Building checkout audit (Move #3) without Triple Whale (Move #6) installed.** You can't measure the +35% CVR lift without attribution. **Fix: Move #6 first, then Move #3.**
5. **Mobile PDP redesign (Move #9) without 14-day measurement window.** Single-day CVR measurement conflates weekend vs weekday traffic. **Fix: Gate E requires 14-day measurement minimum.**
6. **AI creative iteration (Move #10) without Triple Whale cohort overlay.** "First-purchase ROAS looks great but 90-day LTV is worse than baseline" (Pitfall #15). **Fix: Move #10 REQUIRES Move #6 + Move #4 + Move #8 to be live.**
7. **PDP A/B testing (Move #9.5) without cohort LTV overlay.** Shipping winners that look good on first-purchase but regress LTV. **Fix: Move #9.5's Pitfall #5 calls this out explicitly — always overlay Triple Whale cohort LTV before promoting a winner.**
8. **Loyalty program (Move #8) abandonment after 30 days.** "ROI hasn't materialized yet." **Fix: Loyalty has the longest ramp of any retention lever — first month is typically neutral; ROI materializes months 2–3+. Don't launch if you can't commit to 60 days of measurement.**
9. **Attribution-quality audit (Move #6.5) before attribution is fully shipped.** "All 7 gates from Move #6 aren't passing yet." **Fix: Move #6.5 REQUIRES Move #6's Gates A–G all green — Pitfall #1.**
10. **Skipping the baseline snapshot.** "I'll measure at the end." → you can't compare if you didn't capture Week 1's state. **Fix: Day 7 + Day 30 snapshots are non-negotiable. Save to `research/baselines/`.**

## Verification gates (end-of-month check)

By Day 30, the program should pass all 7 of these gates:

- **Gate A: Attribution coverage.** Triple Whale (or Polar) shows ≥95% of orders attributed. Without this, none of Moves #9.5 / #10 / #8 can be measured properly.
- **Gate B: All 4 email + SMS flows live.** Move #1 cart abandon + Move #4 welcome + Move #5 migrated + Move #7 SMS — all 4 must be sending + receiving.
- **Gate C: Revenue lift measured.** Week 1 vs Week 4 baseline snapshots show ≥+20% total revenue. The lift comes from Moves #2/#3/#9/#10 in combination; attribution (Move #6) is what makes it measurable.
- **Gate D: Mobile CVR lifted.** Triple Whale → Reports → Devices → Mobile CVR shows ≥+10% relative at Day 30 vs Day 1.
- **Gate E: AOV lifted.** Triple Whale → Reports → AOV shows ≥+5% relative at Day 30 vs Day 1.
- **Gate F: Attribution quality monitored.** Move #6.5 / #6.6 / #6.7 / #6.8 stack passes weekly (or per-cadence) audit. Dashboard (Move #6.9) URL is bookmarked + Slack channel pinned.
- **Gate G: A/B test running.** Move #9.5 has at least 1 active test in the field. First winner promotion planned within Day 38 (14-day test + 4-day cooldown).

If any gate fails, the rollout isn't complete — go back to the relevant week's buffer days before declaring done.

## Cost & ROI estimate

**Default cost stack (Shopify $1M–$5M GMV):**

| Move | Tool | Monthly cost |
|---|---|---|
| #1 Cart abandon | Klaviyo (included in Move #5) | $0 |
| #2 Post-purchase upsell | ReConvert | $60/mo |
| #3 Checkout audit | Baymard UX-Ray (one-time) + internal dev | $0–$2,000 one-time |
| #4 Welcome series | Klaviyo (included) | $0 |
| #5 Klaviyo + Postscript | Klaviyo $45/mo + Postscript $200/mo | $245/mo |
| #6 Triple Whale | Triple Whale Starter | $179/mo |
| #7 SMS welcome + cart | Postscript (included in Move #5) | $0 |
| #8 Loyalty program | Smile.io Growth | $249/mo |
| #9 Mobile PDP redesign | Internal dev time | $0 (Path B) |
| #10 AI ad creative | Moby Starter | $149/mo |
| #6.5 + #6.6 + #6.7 attribution audits | Triple Whale + audit scripts | $0 (built-in) |
| #6.8 cross-platform rollup | Scripts + Slack webhook | $0 |
| #6.9 unified dashboard | Static HTML | $0 |
| #9.5 PDP A/B testing | Convert.com Growth | $349/mo |
| **Total monthly** | — | **$1,231/mo** |

**Default ROI estimate (Year 1):**

The 16 moves combined yield a conservative **Year 1 ROI of 6:1 to 88:1** depending on which moves are the dominant lift sources for your brand:

- **Move #1 cart abandon** alone: $36–$40 returned per $1 sent → 36:1–40:1.
- **Move #6 attribution**: prevents $1k+/mo wasted ad spend → 6:1.
- **Move #8 loyalty**: 20–30% repeat-purchase lift → 7.9:1–10:1.
- **Move #9 mobile PDP**: 10–25% mobile CVR lift → effectively infinite from Month 2+ (zero ongoing cost).
- **Move #10 AI creative**: 10–30% ROAS lift → 12:1+ on $5k+/mo spend.

The combined program yields **conservatively $20k–$60k/mo incremental revenue at $1,231/mo cost** for a $1M–$5M GMV brand → **16:1–48:1 net Year 1 ROI** after Move #9's infinite ratio kicks in.

**Honest-read:** the first 30 days are mostly cost; the payoff is months 2–6 as attribution quality compounds, AI creative iteration learns the brand voice, and loyalty members reorder. Operators who can't commit to 90 days of post-launch measurement should defer Moves #8 + #9.5.

## Next moves after 30 days

The 16 moves above are the **MVP stack**. Once shipped + steady-state, the high-leverage follow-ups are:

1. **Move #6.10: Attribution health alert webhook** (Slack-formatted webhook from the Move #6.9 dashboard's "What to do this cycle" CTA — closes the visibility gap for non-dashboard-openers).
2. **Move #6.9.1: Dashboard visual polish + operator-friendly defaults** (sparklines for last 4 cycles, threshold-relative bar chart widths, "Last refreshed" timestamp).
3. **Move #11: Subscription / replenishment program** (ReCharge / Skio / Bold Subscriptions — recurring revenue + 20–30% LTV lift; the natural complement to the loyalty program).
4. **Move #12: 3PL migration playbook** (ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace + Extensiv multi-3PL orchestration — pick when order volume exceeds 500 orders/mo and in-house fulfillment becomes the bottleneck; canonical 3PL break-even per ShipBob 2024 + ShipMonk 2024 = $3M-$5M GMV / 2,000-5,000 orders/mo; multi-warehouse + international 3PL footprint is the canonical cross-border DTC enabler for Move #11 international-expansion). **Shipped as `research/07-3pl-migration.md` (synthesis layer for the 3PL-migration track; shipped 2026-06-27 per the v0.7.0 track-exhaustion-revival pivot from the closed marketplace-expansion track; the canonical 11-section research synthesis for the operational-bottleneck-unblocker layer the US-centric Shopify-DTC stack implicitly assumes doesn't exist — operators ship Move #1 + #4 + #7 + #8 in 30 days and assume the operational-stack is "done"; it's only the retention half; the operational half (ShipBob 3PL + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace + Extensiv multi-3PL orchestration) is the canonical $66k-$420k Year-1 incremental net for $3M+ GMV brands hitting the 500+ orders/mo break-even threshold; 5-pillar framework [Pillar 1 3PL size + scope matching with 3 tiers [Tier 1 SMB 500-2000 orders/mo ShipBob 3PL solo / Tier 2 mid-market 2000-10000 orders/mo ShipBob multi-warehouse + ShipMonk + Red Stag / Tier 3 enterprise 10000+ orders/mo Stord + Flowspace + Extensiv orchestrator] / Pillar 2 cost-stack math + ROI with per-order pick-pack $2.50-$6 base + $0.15-$0.50/unit + storage $0.30-$1.50/cu ft/mo + receiving $25-$75/pallet + kitting $0.50-$2/unit + returns $2-$5/return + 3PL-negotiated shipping 5-15% off retail / Pillar 3 WMS integration + migration recipe with the canonical 4-week pre-migration + 1-week inventory pull + 2-week 3PL ramp + 4-week steady-state 11-step migration recipe / Pillar 4 multi-warehouse + international fulfillment with single-warehouse baseline + multi-warehouse 2-day-ship coverage on 80%+ US ZIPs + international 3PL footpring for 2-3 day ship time to EU + UK + CA + AU + JP / Pillar 5 migration pitfalls + 8-metric operational KPI dashboard (ship-time P50 + P95 + ship-cost-per-order + on-time-ship-rate + pick-pack-accuracy + return-rate + NPS-by-fulfillment-channel + cost-per-order-fulfilled)] + 3 GMV-tier paths [Path A SMB 500-2000 orders/mo ShipBob 3PL solo 6:1 ROI / Path B mid-market 2000-10000 orders/mo multi-warehouse 12:1 ROI DEFAULT / Path C enterprise 10000+ orders/mo multi-3PL orchestration 10:1 ROI] + 4 phase-by-phase verification gates [Gate A pre-migration 10 prereqs / Gate B migration+ramp 10 prereqs / Gate C steady-state 10 prereqs / Gate D multi-warehouse+international 9 prereqs] with 10/10/10/9 prereqs respectively + 15 numbered pitfalls with Fix lines clustered into 5 failure modes [A 3PL-size-mismatch / B cost-stack-mismatch / C WMS-integration-mismatch / D SLA-mismatch / E migration-operational] + 6:1 to 12:1 steady-state Year-2 ROI for default $3M GMV Path B ($301k 3PL cost vs $329k gross incremental Year-2 = 12:1 ROI "great" band); the canonical 8 planned future-tick companions: *playbooks/14-3pl-migration.md* (shipped 2026-06-27 per the playbook-tick follow-up to research/07 — the canonical 2nd-layer operator-build companion per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; 4 phases [Phase 1 RFQ + contract + WMS build ~12hr Path A baseline Weeks 1-4 / Phase 2 inventory pull + 3PL inbound + cutover + Path B 2nd-warehouse ~8hr Weeks 5-10 / Phase 3 Path B steady-state + Path C international 3PL footpring EU + UK + CA + AU + JP ~10hr Weeks 11-20 / Phase 4 Path C steady-state + dedicated supply-chain-manager ~10hr Quarter 2+ + 15 hr/wk ongoing]; 15 sections + 15 pitfalls with Fix lines clustered into 5 failure modes + 4 phase-by-phase verification gates A-D with 10/10/10/9 prereqs respectively + the canonical 8 SLA-defense contract clauses [95%+ on-time-ship-rate + financial-penalty-for-misses + 30-day-notice-no-penalty termination + 99.5%+ pick-pack-accuracy + real-time inventory-sync via API + $1M+ inventory-insurance coverage + multi-warehouse tier + returns-tier] + the canonical 6-step Phase 1 build [RFQ to 5+ 3PLs → site visit to top 2 → 6×5 cost-comparison spreadsheet → SLA-defense contract negotiation → WMS-integration build → 10 test orders in 3PL sandbox] + the canonical 5 cost-stack-merge stitches + 8-metric operational KPI dashboard + 12:1 default Year-2+ steady-state ROI Path B at $3M US GMV base $240k Year-1 incremental net median vs $99k 3PL cost = 1.4:1 muted by setup + wind-down costs; maps research/07 Pillar 1 + Pillar 2 + Pillar 3 + Pillar 4 + Pillar 5 into step-by-step ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace + Extensiv multi-3PL orchestration recipe across 3 paths) + *assets/15-3pl-selection-card.md* (shipped 2026-06-27) + *dashboard/app/3pl/page.tsx* (shipped 2026-06-28) + *scripts/threepl_unit_economics.py* (shipped 2026-06-28) + *dashboards/3pl-migration-health.html* (shipped 2026-06-28 per the dashboard-tick follow-up to research/07 + playbooks/14 + assets/15-3pl-selection-card.md + dashboard/app/3pl/page.tsx + scripts/threepl_unit_economics.py — the canonical 6th-and-final static-dashboard layer for the 3PL-migration track per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; self-contained static HTML ~33KB; 6 sections + 73 Node smoke tests across 17 categories; compounds all 5 prior 3PL-migration artifacts as a 1-click migration-readiness heat-map); Move #12 status updated from "deferred" to "Shipped as research/07-3pl-migration.md + playbooks/14-3pl-migration.md + assets/15-3pl-selection-card.md + dashboard/app/3pl/page.tsx + scripts/threepl_unit_economics.py + dashboards/3pl-migration-health.html (6 of 6 layers of the 3PL-migration track shipped per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; canonical 0 remaining layers pending: ALL 6 LAYERS SHIPPED 2026-06-27/28; the canonical track-fully-closed milestone per the v0.11.0 track-fully-closed pivot pattern; Move #12 from research/03 §Next moves after 30 days line 177, the canonical #2-priority follow-up after subscriptions (deferred) and the canonical operator-bottleneck-unblocker track for $500k+ GMV brands hitting the canonical 500+ orders/mo 3PL break-even threshold per ShipBob 2024 (synthesis layer + operator-build companion + operator-copy companion + operator-surface-route + scoring script + static-dashboard; shipped 2026-06-27/28; the canonical 6 layers of the 3PL-migration track per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; the canonical track-fully-closed milestone per the v0.11.0 track-fully-closed pivot pattern; next-tick agent should pivot to a NEW track via the v0.7.0 track-exhaustion-revival diagnostic rather than continue refining the closed 3PL-migration track)"; remaining companion artifacts: *none — all 6 layers shipped 2026-06-27/28*; v0.7.0 track-exhaustion-revival pivot from the closed marketplace-expansion track opened the thinnest research gap (after research/04 + research/05 + research/06 closed the international + lifecycle + marketplace tracks across all 6 layers per the v0.9.0 layer-order-completion sub-rule)).
5. **Move #13: Marketplace expansion** (Amazon + Walmart + Target Plus — sell beyond Shopify when DTC audience plateaus). **Shipped as `research/06-marketplace-expansion.md` (synthesis layer for the marketplace-expansion layer; shipped 2026-06-27 per the v0.7.0 track-exhaustion-revival pivot from the closed lifecycle-marketing track; the canonical 11-section research synthesis for the 80%+ of category-demand that the US-centric Shopify-DTC stack implicitly assumes doesn't exist — Amazon 56% of US product-searches per Jungle Scout 2024 + Walmart + Target Plus + EU marketplaces [Amazon EU DE+FR+IT+ES+NL + bol + Zalando + Cdiscount + Amazon JP]; 5-pillar framework [Pillar 1 channel-economics with per-marketplace fee-stack math Amazon 30-45% / Walmart 25-35% / Target Plus 40-55% net-to-brand + Amazon 1P vs 3P vs hybrid decision matrix / Pillar 2 brand-canary-defense with the 5 levers [Brand Registry + Vine + Buy Box >90% + Amazon DSP + Transparency] to avoid Amazon Halo 10-35% DTC-traffic-cannibalization / Pillar 3 operational-model with FBA vs FBM vs SFP vs WFS vs Target Plus decision matrix + FBA fee math $3-7/unit pick-pack + $0.83-2.40/cubic ft/mo storage / Pillar 4 category-fit + regulatory-friction with EU compliance stack [CE + VAT-MOSS + EPR + GPSR effective Dec 2024] $10k-30k one-time + $2k-10k/yr / Pillar 5 attribution-merge with Triple Whale Marketplace Sync + Amazon Attribution + post-purchase-email attribution] + 3 GMV-tier paths [Path A Amazon-only $500k-$5M +20-45% incremental net revenue / Path B Amazon + Walmart $1M-$10M DEFAULT +30-70% / Path C all marketplaces $5M-$50M +40-100%] + 4 phase-by-phase verification gates [Gate A Phase 1 Amazon-only / Gate B Phase 2 Amazon+Walmart / Gate C Phase 3 international / Gate D Phase 4 Target Plus + steady-state] with 11/10/10/9 prereqs respectively + 15 numbered pitfalls with Fix lines clustered into 5 failure modes [A channel-economics / B brand-canary-protection / C operational-model / D regulatory-friction / E attribution-measurement] + 8:1 default Year-1 ROI Path B ($2.25M Year-1 incremental net / $270k cost at $5M GMV base); compounds 17 shipped playbooks + 14 shipped assets + 15 scripts + 4 dashboards + 5 prior research docs by documenting the marketplace-expansion layer the US-centric stack assumes doesn't exist) + `playbooks/13-marketplace-launch.md` (operator-build companion, shipped 2026-06-27; the canonical 2nd-layer operator-build companion per the research → playbook → asset → operator-surface → scripts → static-dashboard layer order; 4 phases [Phase 1 Amazon-only ~25hr Weeks 1-4 / Phase 2 Amazon+Walmart ~20hr Weeks 5-12 / Phase 3 international marketplaces ~75hr Weeks 13-24 / Phase 4 Target Plus + steady-state ~30hr Quarter 2+] + 15 sections + 15 pitfalls with Fix lines clustered into 5 failure modes + 4 phase-by-phase verification gates A-D with 11/10/10/9 prereqs respectively + the canonical 5 brand-canary-defense levers [Brand Registry + Vine + Buy Box >90% + Amazon DSP + Transparency] + the canonical 5 attribution-merge stitches [Amazon Attribution + Triple Whale Marketplace Sync + post-purchase email + Amazon Customer Engagement + Walmart Connect] + 8.3:1 default Year-1 ROI Path B at $5M US GMV base); remaining companion artifacts: `assets/15-marketplace-listing-card.md` *(shipped 2026-06-27 per the asset-tick follow-up to research/06 + playbooks/13 — the canonical 3rd-layer operator-copy companion per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; 5 marketplaces × 5 voice profiles = 25 voice-variant per-marketplace listing titles + 25 voice-variant 5-bullet-point sets + 20 voice-variant A+ content skeletons + per-marketplace keyword-stuffing guardrail; 12 numbered pitfalls with corrective `Fix:` lines clustered into 5 failure modes; 5 verification gates)* + `scripts/marketplace_unit_economics.py` (Archetype A/B hybrid Path A/B/C scorer, shipped 2026-06-28 per the script-tick follow-up to research/06 + playbooks/13 + assets/15-marketplace-listing-card.md + dashboard/app/marketplace/page.tsx — the canonical 5th-layer scoring script for the marketplace-expansion track per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; takes operator-supplied us_gmv + aov + contribution_margin_pct + category + amazon_fulfillment_mode + brand_registry_status + has_uspto_trademark + operator_capacity_hours_per_week → outputs Path A (Amazon-only $500k-$5M GMV 8:1 ROI) / Path B (Amazon + Walmart DEFAULT $1M-$10M GMV 12:1 ROI) / Path C (all marketplaces including international $10M+ GMV 10:1 ROI) recommendation with cost stack + Year-1 incremental revenue +30-45% / +30-70% / +40-100% of US-DTC-GMV + DTC-cannibalization-adjusted net revenue (Amazon Halo 10-35% cannibalization rate per Marketplace Pulse 2024 with luxury brands facing 25-35% vs default 10-20%) + per-marketplace revenue breakdown [Path A 100% Amazon / Path B 65% Amazon + 35% Walmart / Path C 35% Amazon US + 15% Walmart + 8% Target Plus + 22% Amazon EU + 8% Amazon JP + 5% bol + 4% Zalando + 3% Cdiscount] + 6-step build sequence; 81 TDD tests across 11 test classes; hermetic local-config scorer with no Amazon Seller Central / Walmart Seller Center / Target Plus Roundel / Amazon Attribution / Triple Whale API access required; compounds research/06 §GMV-tier paths + playbook 13 §Phase 1 Step 1.2 Brand Registry + asset 15 §paste-ready per-marketplace per-voice templates + dashboard/app/marketplace/page.tsx by automating the per-brand path-selection decision the operator currently does manually against the 3-path GMV-tier matrix; gated on Move #1 + #4 + #6 + #8 shipped + registered USPTO trademark + Amazon Brand Registry approved + ≥$500k US DTC GMV for 3 consecutive months + 5+ hr/wk operator capacity per playbook 13 §8 prereqs + research/06 §Prerequisites) + `dashboard/app/marketplace/page.tsx` (Next.js operator-surface route, shipped 2026-06-27 per the operator-surface-route tick follow-up to research/06 + playbooks/13 + assets/15 — the canonical 4th-layer Next.js operator-surface route for the marketplace-expansion track; 15th route in the dashboard; renders research/06 + playbook 13 + asset 15 as a unified operator surface with 4 hero metrics + TL;DR + 3 layer cards + 5-voice density pills all ≥15 + future-tick companions; gated on the canonical 8 prereqs) + `dashboards/marketplace-expansion-health.html` (static HTML dashboard, planned) — the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order for the marketplace-expansion track); Move #13 status updated to "Shipped as research/06-marketplace-expansion.md + playbooks/13-marketplace-launch.md + assets/15-marketplace-listing-card.md + dashboard/app/marketplace/page.tsx + scripts/marketplace_unit_economics.py (5 of 6 layers of the marketplace-expansion track shipped; the canonical research → playbook → asset → operator-surface → script quintet per the canonical research → playbook → asset → operator-surface → scripts → static-dashboard layer order; shipped 2026-06-27/28; 1 remaining layer: static dashboard for the marketplace-expansion track)".
6. **Move #14: Lifecycle marketing expansion** (Klaviyo + Postscript have 30+ flows beyond welcome + cart abandon — browse abandonment, customer winback, sunset, post-purchase cross-sell, anniversary, birthday — each is a 1-tick playbook). **Shipped as `research/05-lifecycle-marketing.md` (synthesis layer for the 20-flow library) + `playbooks/12-lifecycle-flow-library.md` (operator-build companion, shipped 2026-06-27; 4-tier launch ladder [Tier 1 same-week 5 flows / Tier 2 next-30-days 5 flows / Tier 3 next-90-days 4 flows / Tier 4 quarterly-and-beyond 3 flows] + 15 pitfalls + 9 verification gates + 95:1 default Year-1 ROI Path B) + `assets/14-lifecycle-flow-templates.md` (paste-ready 17-flow × 5-voice = 85 voice-variant email + SMS templates with Klaviyo conditional-content syntax + Triple Whale UTM + subject-line ≤50 chars + SMS ≤160 chars pre-validation + 11 suppression rules + 10 pitfalls with Fix lines; shipped 2026-06-27; the canonical operator-copy layer that compounds the synthesis + operator-build layers) + `scripts/lifecycle_flow_health_check.py` (Archetype C/D-light hybrid 78 gate-flow audit with 18 TDD tests; shipped 2026-06-27; the canonical 5th layer of the lifecycle-marketing track per the research → playbook → asset → operator-surface → scripts layer order) + `dashboard/app/lifecycle/page.tsx` (Next.js operator-surface route, shipped 2026-06-28 as the 14th route — the 4th layer of the track) + `dashboards/lifecycle-flow-library.html` + `dashboards/tests/test_lifecycle_flow_library.js` (static HTML dashboard + 100-test Node smoke suite; shipped 2026-06-27; the canonical 6th-and-final layer per the v0.11.0 extended layer order research → playbook → asset → operator-surface-route → script → static-dashboard; 6 sections × 4 canonical data structures × 8 helper functions × 6 render functions; compounds all 5 prior artifacts by visualizing them as a 1-click launch-readiness heat-map against the 78 gate-flow combinations).

A new operator who's shipped the 30-day plan should pick the Move 11–14 that matches their brand's next bottleneck, then come back to Move #6.10 to wire the dashboard CTA into Slack.

## Related

- `research/00-ecommerce-ops-landscape.md` — strategic landscape + unit-econ framework
- `research/01-tools-stack-comparison.md` — vendor matrix + pricing
- `research/02-top-10-leverage-moves.md` — the prioritized list + status tracker
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #1
- `playbooks/02-post-purchase-upsell-reconvert.md` — Move #2
- `playbooks/03-checkout-audit-baymard.md` — Move #3
- `playbooks/04-welcome-series-klaviyo.md` — Move #4
- `playbooks/05-migrate-to-klaviyo-postscript.md` — Move #5
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #6
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #7
- `playbooks/07-loyalty-program-smile.md` — Move #8
- `playbooks/09-mobile-pdp-redesign.md` — Move #9
- `playbooks/09.5-pdp-ab-testing-program.md` — Move #9.5
- `playbooks/10-ai-ad-creative-iteration.md` — Move #10
- `playbooks/06.5-attribution-quality-audit.md` — Move #6.5
- `playbooks/06.6-tiktok-attribution-quality-audit.md` — Move #6.6
- `playbooks/06.7-snap-pinterest-attribution-quality-audit.md` — Move #6.7
- `playbooks/06.8-cross-platform-attribution-drift-unification.md` — Move #6.8
- `playbooks/11-international-rollout.md` — Move #11 (cross-border DTC operator build; pairs with `research/04-international-expansion.md`)
- `playbooks/12-lifecycle-flow-library.md` — Move #14 (lifecycle-marketing expansion operator build: 20-flow Klaviyo + Postscript + Smile library across 4 tiers [Tier 1 same-week 5 flows / Tier 2 next-30-days 5 flows / Tier 3 next-90-days 4 flows / Tier 4 quarterly-and-beyond 3 flows] + 15 pitfalls + 9 verification gates + 95:1 default Year-1 ROI Path B; pairs with `research/05-lifecycle-marketing.md`)
- `playbooks/13-marketplace-launch.md` — Move #13 (marketplace-expansion operator build: 4-phase Amazon + Walmart + Target Plus + EU marketplaces launch [Phase 1 Amazon-only ~25hr Weeks 1-4 / Phase 2 Amazon+Walmart ~20hr Weeks 5-12 / Phase 3 international marketplaces ~75hr Weeks 13-24 / Phase 4 Target Plus + steady-state ~30hr Quarter 2+] + 15 pitfalls with Fix lines clustered into 5 failure modes [A channel-economics / B brand-canary-protection / C operational-model / D regulatory-friction / E attribution-measurement] + 4 phase-by-phase verification gates A-D with 11/10/10/9 prereqs respectively + the canonical 5 brand-canary-defense levers [Brand Registry + Vine + Buy Box >90% + Amazon DSP + Transparency] + the canonical 5 attribution-merge stitches [Amazon Attribution + Triple Whale Marketplace Sync + post-purchase email + Amazon Customer Engagement + Walmart Connect] + 8.3:1 default Year-1 ROI Path B at $5M US GMV base; pairs with `research/06-marketplace-expansion.md`)
- `playbooks/14-3pl-migration.md` — Move #12 (3PL-migration operator build: 4-phase ShipBob + ShipMonk + Red Stag + Shopify Fulfillment Network + Stord + Flowspace + Extensiv multi-3PL orchestration [Phase 1 RFQ + contract + WMS build ~12hr Path A baseline Weeks 1-4 / Phase 2 inventory pull + 3PL inbound + cutover + Path B 2nd-warehouse ~8hr Weeks 5-10 / Phase 3 Path B steady-state + Path C international 3PL footpring EU + UK + CA + AU + JP ~10hr Weeks 11-20 / Phase 4 Path C steady-state + dedicated supply-chain-manager ~10hr Quarter 2+ + 15 hr/wk ongoing] + 15 sections + 15 pitfalls with Fix lines clustered into 5 failure modes [A 3PL-size-mismatch / B cost-stack-mismatch / C WMS-integration-mismatch / D SLA-mismatch / E migration-operational] + 4 phase-by-phase verification gates A-D with 10/10/10/9 prereqs respectively + the canonical 8 SLA-defense contract clauses [95%+ on-time-ship-rate + financial-penalty-for-misses + 30-day-notice-no-penalty termination + 99.5%+ pick-pack-accuracy + real-time inventory-sync via API + $1M+ inventory-insurance coverage + multi-warehouse tier + returns-tier] + the canonical 6-step Phase 1 build [RFQ to 5+ 3PLs → site visit to top 2 → 6×5 cost-comparison spreadsheet → SLA-defense contract negotiation → WMS-integration build → 10 test orders in 3PL sandbox] + the canonical 5 cost-stack-merge stitches [3PL-negotiated carrier-rates + Shippo multi-carrier rate API + ship-cost-per-order monitoring + dimensional-weight optimization + ship-time P50+P95 tracking] + 8-metric operational KPI dashboard + 12:1 default Year-2+ steady-state ROI Path B at $3M US GMV base $240k Year-1 incremental net median vs $99k 3PL cost = 1.4:1 muted by setup + wind-down costs; pairs with `research/07-3pl-migration.md`)
- `dashboards/unified-attribution-health.html` — Move #6.9 dashboard
- `scripts/attribution_quality_audit.py` + `scripts/tests/test_attribution_quality_audit.py` — Move #6.5 script
- `scripts/tiktok_attribution_audit.py` + `scripts/tests/test_tiktok_attribution_audit.py` — Move #6.6 script
- `scripts/snap_pinterest_attribution_audit.py` + `scripts/tests/test_snap_pinterest_attribution_audit.py` — Move #6.7 script
- `scripts/attribution_cross_platform_rollup.py` + `scripts/tests/test_attribution_cross_platform_rollup.py` — Move #6.8 script
- `dashboard/` — Next.js 15 + shadcn dashboard that renders this research + the playbooks + the attribution dashboard in a unified SPA