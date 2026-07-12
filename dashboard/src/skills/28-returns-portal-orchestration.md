---
name: returns-portal-orchestration
title: Returns portal orchestration (Loop Returns + ReturnGO + Happy Returns + AfterShip Returns, Move #12.4)
category: returns
tier: 2
priority: P1
default_move: 12.4
year_1_roi_band: "6:1–28:1"
sms_friendly: false
last_updated: 2026-07-12
sources: [loop-returns 2024, returngo 2024, happy-returns 2024, aftership-returns 2024, shopify-returns 2024, narvar-returns 2024, returnlogic 2024, reversal-2024, multibanco 2024, sendcloud-returns 2024, parcel2go 2024, shipbob-returns 2024, shipmonk-returns 2024, stord-returns 2024, shopify-markets 2024, klaviyo 2024, postscript 2024, gorgias 2024, triple-whale 2024, paypal 2024, shopify-flow 2024, shopify-functions 2024, optimizely 2024, reorder 2024, rich-relevance 2024]
---

# Returns portal orchestration (Move #12.4)

> Move #12.4 is the post-3PL-migration returns layer every $1M+ GMV DTC brand needs: replace the unmanaged "customer emails support for an RMA" workflow with **Loop Returns / ReturnGO / Happy Returns / AfterShip Returns / Shopify Returns** so 15–30% return rates cost 30–50% less to process, 20–40% more returns convert to **exchanges** instead of refunds (the canonical revenue-recovery lever), and the support team stops absorbing 8–15% of total ticket volume. Loop Returns ($350/mo Path B default at $1M–$5M GMV) is the canonical pick for Shopify-DTC apparel/beauty/home; ReturnGO ($249/mo) is the AI-first alternative with the strongest exchange-recovery benchmark; Happy Returns ($0 + per-label fee) is the canonical pick for in-person Return Bars at 50+ US locations. Year-1 ROI band **6:1–28:1** with a default 11:1 at $5M GMV Path B. Ship AFTER Move #22.3 (3PL migration) is live OR the operator is doing 500+ orders/mo in-house. Companion artifact scope: this skill synthesizes the canonical 5-pillar framework (Pillar 1 platform selection / Pillar 2 return-reason taxonomy + exchange catalog / Pillar 3 portal UX + branded return label / Pillar 4 3PL/WMS reverse-logistics wiring / Pillar 5 analytics + Klaviyo win-back + Triple Whale cohort tracking) for $1M+ GMV brands — the same layer order the operator applies to checkout, fulfillment, attribution, and lifecycle.

## When to use this skill

Use this skill when the operator is doing **≥500 orders/month** and the return-friction curve has started to compound: support tickets referencing "return" / "refund" / "exchange" / "RMA" exceed 8% of total ticket volume, refund-to-exchange ratio is below 25%, return processing time exceeds 5–7 business days, the 3PL is doing returns processing manually via email (not via a returns-portal API), or the operator cannot tell which SKU / category / voice / cohort is generating the most returns. Move #12.4 is the **canonical next step** in the returns track after Move #22.3 (in-region 3PL) — the two are tightly coupled: returns-portal integration with the 3PL's WMS is what makes "return to local node, grade A/B/C, restock locally" actually work.

You have:

- **Shopify (or Ikas / BigCommerce / WooCommerce / headless) DTC store** with admin API access and the Returns API enabled (Shopify Plus OR Shopify Advanced with Shopify Returns enabled).
- **≥500 orders/month processed in the last 30 days** — below this threshold, defer and use Shopify-native Returns + Gorgias macros until volume justifies the platform fee.
- **A 3PL or in-house warehouse that can receive returns, grade A/B/C, and restock** — the returns portal is the customer-facing layer; the WMS / warehouse is the back-end layer; both must work.
- **A baseline for: return rate %, refund-to-exchange ratio, return reason distribution, average return processing time, return shipping cost per order, NPS-by-return-experience, and CS tickets tagged `return` / `refund` / `exchange`** — you cannot measure the lift without the baseline.
- **Klaviyo (or equivalent ESP) on a paid plan** for the post-return win-back flow (the canonical #1 second-purchase driver for returners — a returner is 2–3× more likely to buy again if the post-return experience is good than if they got a refund and a goodbye email).
- **Triple Whale (or Polar) attribution wired** so the operator can measure whether returners become 30/60/90-day repeat purchasers at a higher LTV than non-returners (this is the canonical LTV-over-recovery argument the operator needs to defend Move #12.4 to a CFO).
- **Customer-support macros in Gorgias (or equivalent helpdesk)** for the 5–7 edge cases the returns portal cannot handle (damaged-in-transit, wrong-item-shipped, fraud-flagged returns, B2B wholesale returns, gift returns).
- **A returns policy: return window (14/30/60/90 days), final-sale rules, return-shipping cost (free / flat-fee / deducted-from-refund), exchange price-difference rules, store-credit bonus (typically +5–10% bonus to push toward exchange), and a damaged-defective escalation path**.
- **Budget for: $0–$650/month in platform fees** (Shopify Returns is free for Advanced+, Loop $350/mo Path B default, ReturnGO $249/mo, Happy Returns $0 + per-label, AfterShip Returns $119/mo, Narvar / ReturnLogic enterprise custom) **+ $0.50–$5/return in label costs** (carrier rate + portal markup) + **2–4 hours/week in operator time for the first 4 weeks** (portal setup, return-reason taxonomy, exchange catalog curation, Klaviyo flow wiring, attribution wiring).
- **Move #1 (abandoned-cart Klaviyo) + Move #4 (welcome series) + Move #6 (attribution) + Move #8 (loyalty program) live** — without these, the post-return win-back flow has no email/SMS substrate to fire on, the operator cannot measure cohort LTV, and the repeat-purchase revenue is invisible.

Do **not** use it when:

- The store is doing **<500 orders/month**. Defer Move #12.4, ship Move #1 + #4 + #7 first, and revisit when volume justifies the platform fee.
- The store is **not on Shopify** (or the platform does not have a returns API the portal can integrate with). Loop / ReturnGO / AfterShip all require Shopify, BigCommerce, Magento, or a headless storefront with API-level order + return access.
- The brand has **no defined return policy**. The portal is the customer-facing layer; a missing or ambiguous policy creates a flood of "can I return this?" tickets.
- The brand cannot commit to a **graded-restock workflow at the warehouse** (or the 3PL doesn't support it). The portal without back-end grading leaves the operator with "returns arrived but nothing got restocked" — the worst of both worlds.
- The brand is **in a regulated vertical** (supplements, CBD, beauty with opened-seal, food) where return acceptance is restricted. Most portals support this via SKU-level return-allowance rules, but the operator must configure them BEFORE the portal goes live.
- The brand is **not yet in a 3PL or in-region 3PL** and the operator is doing in-house fulfillment. A returns portal still helps (in-house grading is faster), but the 3PL WMS integration layer is the higher-leverage gap; ship 3PL first.

## What "best in class" looks like

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Platform | Loop Returns (Shopify-DTC apparel/beauty) / ReturnGO (AI-first, exchange-recovery) / Happy Returns (US Return Bars) / AfterShip Returns (multi-carrier international) | Shopify-native Returns free | Multi-portal routing by market / vertical / SKU |
| Return portal setup time | 2–4 hours | 1–2 days | Same-day with template catalog |
| Return label generation | Instant, branded, on the portal | Email-only after CS ticket | Carrier-rate-shopped (USPS / UPS / FedEx cheapest path) |
| Branded return page | Full brand-voice + logo + product imagery | Generic "submit a return" form | Branded microsite with order history + loyalty-point balance + size-exchange quiz |
| Exchange catalog | Live, in-stock, with size/color recommendations + price-difference logic | Manual CS-curated exchanges | AI size-fit recommender + cross-sell from same-category SKUs |
| Refund-to-exchange ratio | 60–80% of returns convert to exchange | 20–30% | 80%+ with bonus-store-credit incentive |
| Return reason capture | Structured taxonomy 8–12 reasons + free-text | "Other" only | NLP-clustered reasons feeding PDP/QC feedback loop |
| Bonus store-credit for exchange | +5–10% bonus on exchange vs refund | No bonus | Tiered bonus (5% <$50 / 10% $50–$150 / 15% $150+) |
| Return shipping cost | Free for VIP / loyalty-tier members; flat-fee for others; customer-pays for "changed mind" | Always free | Dynamic by reason: free for defective, paid for "changed mind" |
| Return processing time | 24–48 hours from label-scan to grade-A-restock | 7–10 business days | Same-day for VIP / local Return Bar |
| 3PL/WMS integration | API-grade: Loop ↔ ShipBob / ReturnGO ↔ ShipMonk / Happy Returns ↔ Stord | Email-only RMA to 3PL | Real-time inventory adjustment + auto-grade + auto-restock |
| Local returns nodes | Return Bars (Happy Returns 50+ US) / in-region 3PL | US-only ship-back | Market-local return addresses with prepaid label |
| Post-return win-back flow | Klaviyo 3-email + 1-SMS, 7–14 day delay, dynamic by return reason | Single "we refunded you" email | Personalized by returned-SKU ("here's a fix for the issue with your X") |
| Returns-attribution merge | Triple Whale cohort LTV tracks returners vs non-returners | No tracking | 30/60/90-day returner-LTV vs non-returner-LTV with payback calculation |
| Support-ticket deflection | 60–80% of "return" tickets auto-resolved by portal | 30–40% | 90%+ with proactive email at order + 3-day post-delivery |
| Return rate reduction | 15–25% YoY via PDP/QC feedback loop | 0% (no feedback loop) | 25%+ via "sizing was off" → PDP size-guide update |
| NPS-by-return-experience | 60+ (vs 30–40 industry) | <30 | 75+ (Apple / Allbirds tier) |
| Year-1 ROI | 11:1 default at $5M Path B | 4:1 at $1M Path A | 28:1 at $10M+ Path C |

Reference brands: Allbirds, Glossier, Rothy's, Casper, Warby Parker, Lululemon, Patagonia, Reformation, Adore Me, ThirdLove, Stitch Fix, Dollar Shave Club, Hims, Hers, Mejuri, Quip, Bombas. **Note the pattern**: every brand that has made returns a competitive advantage (Patagonia, Lululemon, Allbirds) has a dedicated returns portal + branded return experience + a return-reason feedback loop into the PDP/QC. Returns-as-a-feature is a brand differentiator, not a cost center.

## Returns portal benchmarks (2024–25)

| Path | Brand profile | Platform | Cost | Expected lift | Year-1 ROI |
|---|---|---|---|---|---|
| **A — Shopify native** | $500k–$1M GMV; <2k orders/mo | Shopify Returns (free w/ Advanced+) | $0 + $0.50–$3/return label | 10–20% exchange lift + 20–30% support-ticket deflection | **3:1–8:1** |
| **B — DEFAULT Loop Returns** | $1M–$5M GMV; 2k–10k orders/mo | Loop Returns | $350/mo + $0.50–$5/return | 25–40% exchange lift + 30–50% support-ticket deflection + 15–25% return-rate reduction | **8:1–18:1 default 11:1** |
| **C — ReturnGO (AI-first)** | $5M–$20M GMV; 10k+ orders/mo, apparel-heavy | ReturnGO | $249–$650/mo + per-return fee | 30–50% exchange lift (AI-powered) + 40–60% support-ticket deflection | **10:1–22:1** |
| **D — Happy Returns (Return Bars)** | $5M+ GMV; 5k+ orders/mo US; wants in-person returns | Happy Returns | $0 platform + $5–$10/return-bar label | 40–60% return-to-purchase at Return Bar + 50%+ support-ticket deflection | **12:1–28:1** |
| **E — AfterShip Returns (intl)** | $1M+ GMV; ≥10% international GMV; multi-carrier | AfterShip Returns | $119–$499/mo + per-return | 30–50% international return-cost reduction + multi-carrier automation | **8:1–18:1** |
| **F — Narvar / ReturnLogic (enterprise)** | $20M+ GMV; multi-brand; complex policy | Narvar / ReturnLogic | $1k+/mo custom | Multi-brand orchestration + branded white-label | **6:1–14:1** |

**Default math for a $5M US DTC apparel brand (Path B Loop Returns):** 10,000 orders/mo × 20% return rate = 2,000 returns/mo. Without portal: 70% refund (1,400 × $75 AOV = $105k/mo refund liability) + 30% exchange ($45k/mo captured). With Loop + +5% bonus store-credit incentive: 50% refund ($75k/mo) + 50% exchange ($75k/mo captured) — that's a $30k/mo revenue-recovery swing, $360k/yr. Plus 40% support-ticket deflection × 600 return tickets/mo × $5/ticket handling cost = $36k/yr savings. Plus 15% return-rate reduction (better PDP sizing/imagery) = $112k/yr retained revenue. Total Year-1 lift ~$508k vs $46k platform+label cost = **11:1 revenue ROI** (default). **Path C ReturnGO** at higher exchange rate (60–70%) can hit $30–$50k/mo revenue-recovery swing.

**Cost lines to model:** platform subscription ($0–$1k+/mo by tier), per-return label fee ($0.50–$10/return by carrier + 3PL markup), 3PL return-processing fee ($2–$5/return for grading + restock), bonus store-credit (5–10% × exchanged-order value), Klaviyo/SMS post-return win-back flow ($0.05–$0.50 per send), CS-ticket deflection labor savings ($3–$8/ticket), and the 3PL reverse-logistics leg (US-ship-back $5–$15, in-region-3PL-return $2–$8, Return-Bar $0–$5).

**Why 6:1–28:1 is the band, not 50:1+:** returns portals recover real revenue (the exchange-vs-refund swing is the largest line), but the lift is constrained by (a) the 5–15% of returns that genuinely need a refund (damaged, defective, buyer's-remorse past the win-back window), (b) the 3PL's grading accuracy (a poorly-graded A/B/C restock cycle undoes 10–20% of the exchange-recovery benefit), and (c) the brand-voice consistency of the portal (a generic "submit a return" form doesn't move exchange-vs-refund the way a branded "want to try a different size?" microsite does). Real-world ceiling: even the best-in-class brands (Allbirds, Glossier) cap at 70–80% exchange ratio, and the 20–30% who refund are still a real cost.

## The build (4–8 weeks)

1. **Score whether the portal is justified.** Run the existing scripts to validate volume + return-rate + refund-to-exchange baseline:
   - `python3 scripts/subscription_unit_economics.py --orders-per-month 2000 --aov 75 --return-rate-pct 20 --current-refund-pct 70 --current-exchange-pct 30 --json`
   - `python3 scripts/threepl_unit_economics.py --orders-per-month 2000 --aov 75 --current-ship-cost-per-order 12 --current-ship-time-days 5 --international-volume-pct 5 --json`
   - Green-light Move #12.4 only if return rate is ≥10% (any vertical) AND volume is ≥500 orders/mo AND a 3PL or in-house warehouse can grade A/B/C.

2. **Pick the platform using a 6-factor scorecard.** Score Loop Returns / ReturnGO / Happy Returns / AfterShip Returns / Shopify Returns / Narvar on: monthly orders, return rate %, return vertical (apparel/beauty/home), international GMV share, exchange-recovery benchmark, and 3PL integration depth. **Rule of thumb**: apparel-heavy US DTC → Loop; AI-first exchange → ReturnGO; US omnichannel with in-person return → Happy Returns; international-heavy → AfterShip; sub-$1M GMV → Shopify native.

3. **Define the return policy and the return-reason taxonomy.** Document: return window (14/30/60/90 days), final-sale SKU list, return-shipping cost by reason (free for defective, paid for changed-mind), bonus store-credit (5–10% on exchange), and a return-reason taxonomy of 8–12 structured reasons (sizing-too-small / sizing-too-large / quality-issue / not-as-described / damaged-in-transit / wrong-item / changed-mind / late-delivery / better-price-found / gift-return / other) plus a free-text field. The taxonomy is the data structure that feeds the PDP/QC feedback loop in Step 9.

4. **Curate the exchange catalog.** For every SKU in the returns-allowed list, confirm: live in-stock status, price-difference logic, available sizes/colors, and a one-line product description. The exchange catalog is the operator's #1 lever for the refund-to-exchange ratio — a curated catalog with size/color recs and bonus-store-credit incentive moves the ratio 30% → 50–60% in 4–6 weeks.

5. **Build the branded return page.** Use the portal's branding tools (Loop's Design Studio, ReturnGO's white-label, AfterShip's customization) to render the operator's logo, brand voice, color palette, product imagery, and copy. The page must: (a) auto-detect the order from email + order number, (b) display the order with thumbnail images, (c) let the customer pick items to return + reason + resolution (refund / exchange / store-credit), (d) show the bonus-store-credit incentive ("Exchange now and get $7.50 bonus credit"), (e) generate the return label instantly, (f) confirm with a thank-you screen that links to the Klaviyo post-return win-back flow.

6. **Wire the 3PL/WMS reverse-logistics leg.** If the operator is on a 3PL, configure the portal's 3PL integration to: (a) send the RMA to the 3PL WMS in real-time, (b) auto-grade A/B/C based on the 3PL's receiving scan, (c) trigger a return-to-stock event in Shopify when grade-A is confirmed, (d) trigger a disposal/liquidation event when grade-C is confirmed, (e) sync inventory adjustment back to Shopify within 4 hours. For US-only operators with Happy Returns: enable the Return Bar routing so the customer can walk into a Return Bar near them and skip shipping entirely.

7. **Configure bonus store-credit + Klaviyo win-back flow.** The Klaviyo flow must fire on the post-return event: (a) Day 0: "Your return is on its way" with a 5–10% bonus store-credit code if the customer chose exchange, (b) Day 3: "Your refund was processed / Your exchange shipped" with the original SKU's category cross-sell, (c) Day 14: "We'd love to make it right" with a personalized recommendation based on the returned-SKU's category, (d) Day 30: "Here's what's new in [category]" — the canonical second-purchase driver for returners. The flow must be **dynamic by return reason**: a "sizing-too-small" returner gets a size-up recommendation; a "quality-issue" returner gets a customer-service follow-up + a credit.

8. **Wire the attribution merge.** Loop / ReturnGO / Happy Returns all emit webhooks on return events. Wire the webhook to: (a) Triple Whale's custom-event API to track returners as a separate cohort, (b) Klaviyo's profile-property API to tag the customer with `last_return_date` / `return_reason` / `return_resolution`, (c) Shopify's order-edit API to record the exchange as a new order so attribution sees the recovered revenue. The operator must be able to answer: "What is the 30/60/90-day LTV of a returner vs a non-returner?" — without that, the CFO will not fund Move #12.4.

9. **Run the 30-day pilot on the highest-return SKUs.** Pick the top 5–10 SKUs by return rate (typically the top 3–5 hero SKUs in apparel), enable the portal for those SKUs only, and run a 30-day pilot. Compare against the baseline: return rate, refund-to-exchange ratio, return processing time, support tickets tagged `return`, NPS-by-return-experience, returner-LTV vs non-returner-LTV. If the exchange ratio rises by ≥10pp and the support tickets fall by ≥30%, expand to the full catalog in Week 5.

10. **Wire the PDP/QC feedback loop.** Monthly, export the return-reason distribution by SKU. For SKUs where "sizing-too-small" exceeds 30% of returns: update the PDP size guide + add a model-photo with measurements. For SKUs where "quality-issue" exceeds 20%: route to QC for batch inspection. For SKUs where "not-as-described" exceeds 15%: update the PDP imagery + copy. The feedback loop is the canonical 15–25% YoY return-rate-reduction lever — without it, Move #12.4 is a one-time exchange-recovery lift, not a compounding one.

## Common pitfalls (15 from real builds)

1. **Picking the wrong platform for the vertical** — Loop is canonical for Shopify-DTC apparel/beauty, but for international-heavy brands AfterShip is the better pick, for in-person returns Happy Returns is the better pick, and for AI-powered exchange ReturnGO is the better pick. **Fix:** score by 6 factors (orders/mo, return rate %, vertical, international %, exchange benchmark, 3PL integration) before committing.

2. **Picking the wrong platform for the GMV tier** — sub-$1M GMV stores get crushed by $249–$650/mo platform fees they don't need; they should use Shopify Returns free + Gorgias macros. **Fix:** Path A (Shopify native) at <$1M GMV; Path B–D at ≥$1M GMV; Path F Narvar at ≥$20M GMV.

3. **No return-reason taxonomy at launch** — the operator ships the portal with only "Other" as the reason, and the return-reason data is unclusterable. **Fix:** define 8–12 structured reasons BEFORE the portal goes live, and tag every return with one.

4. **No graded-restock workflow at the 3PL** — the portal generates the label and the RMA but the 3PL grades A/B/C manually, processing 30–50% slower than promised. **Fix:** require the 3PL to support barcode-receiving + A/B/C grading within 24–48 hours of label-scan; verify in the 3PL RFQ.

5. **Refund-to-exchange ratio stays at 30%** — the operator launched the portal but didn't enable the bonus-store-credit incentive, and the customer just defaults to refund. **Fix:** enable 5–10% bonus store-credit on exchange (Loop's Incentive Engine, ReturnGO's Smart Exchange); A/B test the bonus band (5% / 10% / 15%) in the first 30 days.

6. **Branded return page is generic** — the portal renders "Submit a return" instead of the operator's brand voice, and the customer treats the return as a transaction not a relationship. **Fix:** spend 2–4 hours in the portal's Design Studio / branding tools to add logo + brand colors + product imagery + voice-driven copy; this is the single highest-leverage UX move.

7. **No 3PL integration on the back end** — the portal is the customer-facing layer but returns still sit at the 3PL for 7–14 days unprocessed because the RMA is an email, not an API call. **Fix:** require the portal's 3PL integration to fire on return-label generation (Loop ↔ ShipBob, ReturnGO ↔ ShipMonk, AfterShip ↔ Stord / Flowspace); verify in the RFQ + a 10-order sandbox test.

8. **No Klaviyo win-back flow on the post-return event** — the operator shipped the portal but didn't wire the Klaviyo flow, so the returner gets the default "we refunded you" email and never hears from the brand again. **Fix:** build a 3–4 email + 1-SMS Klaviyo flow on the post-return event, dynamic by return reason, with a 7–14 day delay before the win-back ask.

9. **No attribution merge on the return event** — the operator ships the portal but the returners are invisible in Triple Whale, so the CFO sees only the refund cost and not the recovered exchange revenue or the returner-LTV. **Fix:** wire the portal's return-webhook to Triple Whale's custom-event API + Klaviyo's profile-property API + Shopify's order-edit API for the exchange-as-new-order.

10. **The operator treats returns as a cost center** — the team optimizes for "minimize return rate" instead of "maximize exchange recovery + returner LTV". The result: defensive copy ("no returns on sale items"), high friction (restocking fees, manual approval), and lost repeat-purchase revenue. **Fix:** reframe returns as a brand-differentiator + a revenue-recovery lever; Patagonia and Lululemon compete on returns-as-a-feature.

11. **The return policy is ambiguous** — the brand has "returns accepted within 30 days" but no documentation on final-sale SKUs, return-shipping cost, exchange price-difference rules, or damaged-defective escalation. The support team absorbs the ambiguity. **Fix:** publish a 1-page returns policy covering all 6 questions (window, final-sale, shipping cost, price difference, store-credit bonus, damaged escalation); link from PDP footer + cart + order-confirmation email.

12. **The portal goes live across the whole catalog at once** — the operator enables every SKU on day one and gets a flood of returns, edge cases, and CS escalations they haven't prepared for. **Fix:** pilot on the top 5–10 highest-return SKUs for 30 days; expand to the full catalog only after the pilot scorecard passes (exchange ratio +10pp, support tickets -30%).

13. **No international return addresses for markets >5% of GMV** — the US-only portal forces international customers to ship a return across an ocean at $20–$50, generating a 1-star review and a chargeback. **Fix:** for each market with ≥5% GMV, configure a market-local return address (in-region 3PL per Move #22.3) OR a Happy Returns Return Bar in that market (where available).

14. **Bonus store-credit is too low to move the needle** — the operator offers 2% bonus and sees zero exchange-ratio movement. **Fix:** A/B test 5% / 10% / 15% bonus bands; the canonical "great" band is +5pp to the exchange ratio for every 5% bonus, capped at ~15% where the math stops working.

15. **No PDP/QC feedback loop on return reasons** — the operator ships the portal, sees the return-reason data, but never wires it back to the PDP size guide or QC team. The same SKU returns 25% of the time for "sizing-too-small" for 6 months straight. **Fix:** monthly return-reason report by SKU; route "sizing-too-small" SKUs to PDP size-guide update + "quality-issue" SKUs to QC batch inspection + "not-as-described" SKUs to PDP imagery + copy update. The feedback loop is the canonical 15–25% YoY return-rate-reduction lever.

## Verification (this skill is "shipped" when...)

- [ ] Return-reason taxonomy of 8–12 structured reasons is documented and tagged in the portal config.
- [ ] Returns policy (window, final-sale, shipping cost, price-difference, store-credit bonus, damaged escalation) is published on PDP footer + cart + order-confirmation email + help center.
- [ ] Branded return page is live with operator logo, brand colors, product imagery, and voice-driven copy (not the portal's default "Submit a return" form).
- [ ] Exchange catalog is curated for every returns-allowed SKU with live in-stock status + price-difference logic + bonus-store-credit incentive enabled.
- [ ] 3PL/WMS integration is live: return-label-generation triggers a real-time RMA to the 3PL WMS, A/B/C grading fires within 24–48 hours, return-to-stock event syncs to Shopify within 4 hours.
- [ ] Klaviyo post-return win-back flow is live with 3–4 emails + 1-SMS, dynamic by return reason, with a 7–14 day delay before the second-purchase ask.
- [ ] Triple Whale custom-event tracks returners as a separate cohort, with 30/60/90-day LTV vs non-returner-LTV visible in the operator's dashboard.
- [ ] 30-day pilot on top 5–10 highest-return SKUs shows ≥10pp exchange-ratio lift and ≥30% support-ticket deflection.
- [ ] Full-catalog expansion approved after the pilot scorecard passes.
- [ ] Monthly return-reason-by-SKU report is generated and routed to PDP/QC teams.
- [ ] NPS-by-return-experience is ≥50 (vs the brand's pre-portal baseline of typically 20–35).
- [ ] Year-1 ROI in the **6:1–28:1 band** with default 11:1 at $5M GMV Path B; the operator can defend the math to a CFO with the attribution merge.

## How to extend this skill

- **Move #12.5 returns-driven product development:** the return-reason data is the operator's most underused signal — "sizing-too-small" → spec the next SKU in the size up; "quality-issue" → spec the next SKU with a different supplier; "not-as-described" → update the PDP. Wire the return-reason data into the product team's spec process.
- **Move #12.6 returns-driven dynamic pricing:** returners are 2–3× more likely to buy again if the post-return experience is good; use the 30/60/90-day returner-LTV cohort to offer a personalized 5–10% off second-purchase code in the Klaviyo win-back flow.
- **Move #6.x per-portal attribution merge:** split Triple Whale's returner-LTV cohort by portal (Loop vs ReturnGO vs Happy Returns) so the operator can see which portal drives the highest LTV, not just the highest exchange ratio.
- **Move #22.3.x in-region returns nodes:** for each market with ≥5% GMV, add a market-local return address (in-region 3PL per Move #22.3) so the customer doesn't have to ship a return across an ocean.
- **Move #12.7 returns-experience NPS tracking:** wire the post-return NPS survey to Gorgias + Triple Whale so the operator can see whether the return experience is a brand differentiator or a cost driver.

## Cross-references

- Companion skill: `3pl-migration` (`skills/21-3pl-migration.md`) — the WMS / reverse-logistics layer Move #12.4 integrates with on the back end.
- Companion skill: `in-region-3pl-distribution-upgrade` (`skills/27-in-region-3pl-distribution-upgrade.md`) — the international returns-address layer for markets with ≥5% GMV.
- Companion skill: `triple-whale-attribution` (`skills/13-triple-whale-attribution.md`) — the attribution merge Move #12.4 needs to defend the math to a CFO.
- Companion skill: `klaviyo-postscript-migration` (`skills/24-klaviyo-postscript-migration.md`) — the ESP + SMS substrate the post-return win-back flow fires on.
- Companion skill: `loyalty-program` (`skills/04-loyalty-program.md`) — the loyalty-tier benefit structure that lets Move #12.4 offer free return-shipping for VIP customers.
- Companion skill: `lifecycle-flow-library` (`skills/10-lifecycle-flow-library.md`) — the 20-flow Klaviyo + Postscript library that includes the post-return win-back flow.
- Research doc: `/research/00-ecommerce-ops-landscape.md` — returns at 15–25% of orders for apparel, 5–10% for most verticals, 2–5% revenue cost unmanaged.
- Research doc: `/research/05-lifecycle-marketing.md` — the lifecycle flow library including the post-return win-back flow.
- Research doc: `/research/07-3pl-migration.md` — the 3PL reverse-logistics leg Move #12.4 integrates with.
- Script: `/scripts/subscription_unit_economics.py` and `/scripts/threepl_unit_economics.py` — first-pass returns-portal viability scoring (use with `--return-rate-pct`, `--current-refund-pct`, `--current-exchange-pct` flags).

## Sources

- Loop Returns 2024 — Shopify-DTC returns portal, exchange engine, 3PL integration, branded returns experience benchmarks.
- ReturnGO 2024 — AI-first returns portal, Smart Exchange engine, dynamic return-reason capture, 60–80% exchange-recovery benchmark.
- Happy Returns 2024 — US Return Bar network (50+ locations), in-person returns, return-to-purchase rate benchmark, USPS-first label strategy.
- AfterShip Returns 2024 — multi-carrier international returns, branded tracking pages, Returns API for headless commerce.
- Shopify Returns 2024 — native Shopify Advanced+ returns portal, order-edits API, return-reason capture, free tier at Advanced+.
- Narvar 2024 + ReturnLogic 2024 + Reversal 2024 — enterprise returns orchestration for $20M+ GMV multi-brand retailers.
- ShipBob Returns 2024, ShipMonk Returns 2024, Stord Returns 2024 — 3PL reverse-logistics, A/B/C grading, return-to-stock API integrations.
- Klaviyo 2024, Postscript 2024 — post-return win-back flow templates, dynamic-by-return-reason flow logic, profile-property API.
- Gorgias 2024 — return-ticket macros, damaged-in-transit escalation, B2B wholesale returns handling.
- Triple Whale 2024, Polar 2024 — custom-event API for return-tracking, returner-cohort LTV vs non-returner-LTV dashboard.
- PayPal 2024 + Shop Pay 2024 — return-refund processing, exchange-as-new-order payment flow, partial-refund handling.
- Reorder 2024, Rich Relevance 2024 — exchange-catalog cross-sell engine, AI size-fit recommendation for exchange SKUs.
- Multichannel Merchant 2024 + Shopify Markets 2024 — international returns, market-local return addresses, customs-form generation.
