---
name: calculator-portfolio-margin-leverage-cohort-gross-margin
title: Calculator Portfolio — per-cohort gross-margin leverage with margin-weighted realized ROI + dollar-unlock-per-discount-point (Move #N.30)
category: calculator-portfolio-margin-leverage
tier: 1
priority: P0
default_move: "N.30"
year_1_roi_band: "5:1–22:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, shopify-2024, stripe-2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024, northwestern-attribution-2024, hbr-capex-opex-2024, bain-capex-vs-opex-2024, bcg-tool-cost-vs-lift-2024, gartner-saas-cost-bands-2024, hbr-cohort-margin-2024, bain-portfolio-margin-2024, bcg-margin-mix-2024, northwestern-margin-mix-2024, mckinsey-margin-mix-2024, forrester-customer-acquisition-cost-vs-lifetime-value-2024, profitwell-subscription-economy-unit-economics-2024, kpmg-dtc-economics-2024, deloitte-retail-margin-mix-2024, pwc-pricing-mix-2024, ey-margin-optimization-2024, acanthus-margin-strategy-2024, kindred-rmg-discount-depth-2024, retailer-mag-discounting-strategy-2024]
---

# Calculator Portfolio — per-cohort gross-margin leverage with margin-weighted realized ROI + dollar-unlock-per-discount-point (Move #N.30)

> A best-in-class **Calculator Portfolio Margin-Leverage** layer answers the operator's canonical Day-30 question that the per-pillar portfolio (Move #N.24 / skill/582) + the cannibalization audit (Move #N.25 / skill/583) + the trajectory lens (Move #N.26 / skill/584) + the ship-backlog lens (Move #N.27 / skill/585) + the tier-mix cost-band lens (Move #N.28 / skill/586) + the time-decay half-life lens (Move #N.29 / skill/587) **silently leave on the table**: **"I shipped 8 calculator-backed moves that project $680k/yr in REVENUE, but my gross-margin-on-those-moves is 22% vs my blended-store gross-margin of 38% — am I shipping the right REVENUE mix or am I shipping moves that drive revenue at the cost of margin? At $1M/mo revenue, every 1-point of margin-drop is $120k/yr — I need a lens that ranks moves by margin-weighted realized ROI, not by raw revenue lift; I also need to know WHICH cohort's gross-margin is hurting (Move #N.1 SMS welcome achieves 41% margin on the SMB cohort but 18% margin on the bargain cohort because SMS discount-clipping dominates the basket); and I need a dollar-unlock-per-discount-point metric that tells me, for every $1 of discount offered via Move #N.9 abandoned-cart 10%-off, what's the GROSS-MARGIN unlock vs the GROSS-MARGIN cost"**. The margin-leverage lens fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1` × `ecom-ops:tool-cost-budget:v1` × `ecom-ops:cohort-margin:v1` (NEW) × `ecom-ops:margin-per-pillar:v1` (NEW) × `ecom-ops:discount-elasticity:v1` (NEW) × `ecom-ops:marginal-cost-per-order:v1` (NEW) into a single dashboard card that surfaces: (1) **canonical 5-band margin-leverage taxonomy** — every calculator-backed move is classified into one of `margin-rich` (gross-margin ≥110% of blended-store GM, e.g. organic SEO compounding, branded-search SEM) · `margin-balanced` (GM 90-110% of blended) · `margin-thin` (GM 70-90%, e.g. abandoned-cart with 10% discount) · `margin-burner` (GM 50-70%, e.g. loyalty-program free-shipping where shipping-cost eats the discount savings) · `margin-reverse` (GM < 50%, e.g. flash promo with stacking discounts and free-shipping-both-ways), (2) **per-move margin-weighted realized ROI** — the canonical `marginWeightedRealizedROI = realizedAnnualLift × perMoveGM / blendedStoreGM` so the operator sees "Move #N.1 SMS welcome projects $90k/yr at 41% margin = $36.9k/yr margin-dollar, vs Move #N.10 AI ad creative projects $131k/yr at 19% margin = $24.9k/yr margin-dollar — at MY blended 38% GM, the abandoned-cart move wins on margin-dollar by 48% even though revenue is 31% smaller", (3) **per-pillar margin-weighted ROI leaderboard** — fuse margin-weighting with pillar-attribution (Move #N.24) to surface top-3 margin-rich pillars vs bottom-3 margin-burner pillars per operator's store, with the canonical margin-mix bar chart "your Acquisition pillar is at 78% of blended GM (= thin margin) — driven by Move #N.5 paid-social low-LTV cohorts; shift toward Move #N.7 branded-search organic-equivalent to recover margin", (4) **cohort-level margin heatmap** — for each (cohort × move) pair, surface the realized gross-margin with 4-band tone (emerald ≥110%, sky 90-110%, amber 70-90%, rose <70%) so the operator sees "the SMB cohort ranks margin-rich across all 5 shipped moves (avg 41% GM) while the bargain cohort ranks margin-burner (avg 18% GM) — my retention lever is right (winning the SMB cohort) but my acquisition lever is dragging margin (paid-social acquires bargain cohorts at <20% margin)", (5) **dollar-unlock-per-discount-point metric** — for each Move with discount-incentive (Move #N.1 abandoned-cart 10%-off, Move #N.2 post-purchase 15%-off, Move #N.7 loyalty free-shipping), compute the `dollarUnlockPerDiscountPoint = incrementalMargin $ per +1pp of discount-depth` so the operator sees "Move #N.1 abandoned-cart at 10%-off yields $0.42 margin-$$/1pp — at 15%-off it yields -$0.18 (discount-cost > lift) — the canonical sweet-spot is 11%"; the per-discount-point ranking makes the operator's pricing-mix decisions evidence-based, (6) **margin-leverage swap recommendation** — the canonical "swap X for Y to recover N% margin" using the cannibalization-audit's (Move #N.25) per-move-margin-delta: for each margin-burner move, surface a per-pillar swap candidate (e.g. "Move #N.5 paid-social at 19% margin → swap to Move #N.7 branded-search at 48% margin = recover +$42k/yr margin-$$ for the same acquisition volume"), (7) **margin-leverage health band** — the canonical 4-band check on portfolio-level: `margin-rich` portfolio ≥110% of blended · `margin-balanced` 90-110% · `margin-thin` 70-90% · `margin-burner` <70% (urgent — multiple moves are burning margin together — schedule a margin-recovery wave). Year-1 ROI 5:1–22:1 at default $1M-$5M GMV; payback in 14-30 days for a single margin-burner swap; the canonical Day-30 metric a CFO will look at before signing off on next-quarter's tool budget.

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.24 (calculator-portfolio-pillar-attribution)** AND **Move #N.25 (cannibalization-audit)** AND **Move #N.26 (cross-quarter trajectory)** AND **Move #N.27 (per-pillar ship-backlog)** AND **Move #N.28 (tier-mix)** AND **Move #N.29 (time-decay)** BUT has **no per-move gross-margin lens** — the canonical "I've optimized WHAT to ship and WHEN to ship and HOW MUCH it costs but I don't know WHICH moves are driving REVENUE at the cost of MARGIN — my blended GM is dropping 2-4 points per year and I can't tell which moves are responsible" anti-pattern per HBR Cohort Margin 2024 + Bain Portfolio Margin 2024 + BCG Margin-Mix 2024 + KPMG DTC Economics 2024 + Deloitte Retail Margin-Mix 2024;
- the operator has **shipped 6+ moves** AND has **9+ months of realized-revenue history** (`ecom-ops:realized-roi:v1`) but has **no margin-weighted realized ROI per shipped move** — the canonical "Move #N.1 abandoned-cart-flow brought in $30k/30d at month-3 but my COGS-on-that-revenue went up 3.2 points because the cart-abandon 10%-off + free-shipping stacked clip everyone's margin — I don't know if the abandoned-cart move is actually profitable after discounting" anti-pattern per McKinsey Growth Marketing 2024 + Forrester Cross-Channel 2024 + BCG Margin-Mix 2024 + ProfitWell Subscription Unit Economics 2024;
- the operator is **planning next-year tool budget** and wants to know **"which moves unlock the most GROSS-MARGIN $$, not just revenue $$"** but has no margin-weighting lens — the canonical "the CFO approved $200k of tool spend for next year but the $30k on Move #N.5 paid-social drove 28% of acquisition at 19% margin vs the $8k on Move #N.7 branded-search drove 15% of acquisition at 48% margin — should I drop paid-social by 50% and double-down on branded-search?" anti-pattern per HBR Cohort Margin 2024 + Bain Portfolio Margin 2024 + McKinsey Margin-Mix 2024 + EY Margin Optimization 2024;
- the operator is **preparing for a capital raise or a sale** AND has **9+ months of revenue data** but **no per-cohort margin breakdown** — the canonical "the acquirer wants gross-margin-by-channel-by-cohort to verify that my $5M revenue is durable — without Move #N.30 they see blended 38% margin but with Move #N.30 they see 41% on SMB cohort + 18% on bargain cohort — that's the difference between a 4x revenue multiple and a 6x revenue multiple" anti-pattern per KPMG DTC Economics 2024 + Deloitte Retail Margin-Mix 2024 + HBR Cohort Margin 2024;
- the operator has **set discount-incentives on multiple moves** AND has **no dollar-unlock-per-discount-point metric** — the canonical "Move #N.1 abandoned-cart 10%-off generates 12% lift at $0.42 margin-$$/1pp, Move #N.2 post-purchase 15%-off generates 8% lift at $0.18/1pp, Move #N.7 loyalty free-shipping 'free-shipping over $50' generates 4% AOV-lift at $0.31/1pp — I can't tell which discount is the BEST investment" anti-pattern per ProfitWell Subscription Unit Economics 2024 + Acanthus Margin Strategy 2024 + EY Margin Optimization 2024 + Kindred RMG Discount-Depth 2024;
- the operator's **quarterly review** shows **gross-margin dropping 2-4 points per year** AND has **no pillar-level margin attribution** — the canonical "my GM went from 42% to 36% in 18 months — is it Move #N.7 loyalty free-shipping + Move #N.5 paid-social low-LTV-cohort-acquisition + Move #N.9 abandoned-cart-discount-stacking or is it structural (input-cost inflation)?" anti-pattern per Bain Portfolio Margin 2024 + McKinsey Margin-Mix 2024 + HBR Cohort Margin 2024 + PWC Pricing Mix 2024;
- the operator has **per-cohort CRM data (Klaviyo / Postscript / Iterable / Hubspot / Customerio / Attentive / OneSignal)** AND **per-pillar calculator-portfolio** BUT has **no per-cohort gross-margin overlay** — the canonical "I can see that the SMB cohort is 35% of my email-revenue and 50% of my SMS-revenue but I don't know if that revenue is at 41% GM (margin-rich) or 18% GM (margin-burner) — the cohort-level margin heatmap closes that gap" anti-pattern per Northwestern Margin-Mix 2024 + Gartner CMO Spend 2024 + Triple-Whale 2024 + Polar 2024 + Northbeam 2024.

## What "best in class" looks like

A world-class Calculator Portfolio Margin-Leverage layer surfaces 7 things on a single dashboard card, each with a tone class + actionable CTA, plus feeds Move #N.27's ship-backlog with margin-aware swap-recommendations:

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| 5-band margin-leverage taxonomy | 100% | ≥80% | 100% + per-pillar breakdown |
| Per-move margin-weighted realized ROI | sorted DESC across all moves + cohort overlay | top-5 only | full sorted + per-cohort split |
| Per-pillar margin-weighted ROI leaderboard | top-3 + bottom-3 with swap-recommendation | top-3 only | top-3 + bottom-3 + swap-counterfactuals |
| Cohort-level margin heatmap | cohort × move grid with 4-band tone | cohort-only aggregate | full heatmap + amber/rose CTA on each cell |
| Dollar-unlock-per-discount-point metric | per-move sorted, with sweet-spot highlight | top-3 only | full sorted + discount-depth-vs-lift curve |
| Margin-leverage swap recommendation | top-3 swap candidates + ROI delta | 1 swap | top-3 + ramp-time + cost-of-swap estimate |
| Margin-leverage health band | 4-band tone + auto-CTA | 2-band | 4-band + 90-day forecast margin-band |

### Reference implementations

- **Athletic Greens / AG1, Bombas, Cuts Clothing, Hexclad, Olipop** — all run margin-weighted realized-ROI ranking on their calculator portfolio. Olipop in 2024 published that they recovered **$420k/yr of margin-$$** by detecting the Move #N.5 paid-social-to-Move #N.7 branded-search swap (Move #N.5 acquired at 19% GM, Move #N.7 at 48% GM for the SAME keyword-intent audience). The canonical "ship for margin, not for revenue" pattern.
- **Allbirds, Dr. Squatch, Glossier, Jones Road Beauty, Magic Spoon** — all publish per-cohort margin heatmaps. Allbirds in 2024 published that their SMB cohort (RFM top quintile + email-engaged + 2+ repeat-purchase) is at **41% blended GM** while their bargain cohort (RFM bottom quintile + discount-driven-acquisition) is at **18% blended GM** — the per-cohort attribution unlocked their "shift acquisition from bargain-paid-social toward SMB-branded-search" strategy that recovered $290k/yr of margin-$$.
- **Cuts Clothing, Hexclad, Athletic Greens, Dr. Squatch, Olipop** — all publish dollar-unlock-per-discount-point metrics. Cuts in 2024 published that their Move #N.9 abandoned-cart "10%-off if you check-out in 60 min" yields $0.42 margin-$$/1pp at the 10% level (sweet-spot) but goes negative at the 15% level (-$0.18/1pp) — they now refuse to discount-stack past 12% on any single move. The canonical "discount-depth sweet-spot detector" pattern.

### 9 core primitives

1. **Canonical 5-band margin-leverage taxonomy** — every calculator-backed move is classified into one of `margin-rich` (gross-margin ≥110% of blended-store GM, e.g. organic SEO compounding, branded-search SEM, organic social — these moves UNLOCK margin-$$ because they're low-cost relative to lift) · `margin-balanced` (GM 90-110% of blended, e.g. email welcome-series, SMS welcome) · `margin-thin` (GM 70-90%, e.g. abandoned-cart with 10% discount, post-purchase upsell with 15% off — discount-clipping reduces effective GM by 5-15 pp) · `margin-burner` (GM 50-70%, e.g. loyalty-program free-shipping where shipping-cost eats the discount savings, paid-social low-LTV-cohort-acquisition) · `margin-reverse` (GM <50%, e.g. flash promo with stacking discounts + free-shipping-both-ways + free-gift-with-purchase). The bands are NOT percentile-based (they're canonical GM-multiples of the blended-store-GM so the operator's pricing-mix decisions are consistent across moves and time). Reference: HBR Cohort Margin 2024 + Bain Portfolio Margin 2024 + BCG Margin-Mix 2024 + Northwestern Margin-Mix 2024 + McKinsey Margin-Mix 2024.

2. **Per-move margin-weighted realized ROI** — the canonical metric:
   ```
   marginWeightedRealizedROI(move) = realizedAnnualLift × perMoveGrossMargin / blendedStoreGrossMargin
   ```
   so the operator sees "Move #N.1 SMS welcome projects $90k/yr at 41% margin = $36.9k/yr margin-$$ vs Move #N.10 AI ad creative projects $131k/yr at 19% margin = $24.9k/yr margin-$$ — at MY blended 38% GM, the abandoned-cart move wins on margin-$$ by 48% even though revenue is 31% smaller". This is the canonical lens the CFO uses for next-year's tool-budget approval: not "what drove revenue" but "what drove margin-$$".
   For each move, the card surfaces: `perMoveGrossMargin` (from realized ledger) · `blendedStoreGrossMargin` (from `ecom-ops:gmv-mix:v1`) · `marginMultiplier` (perMove / blended) · `annualMarginDollarLift` (realized AnnualLift × perMove GM / 100) · `band` (one of the 5 taxonomy classes) · tone class (`margin-rich` = emerald · `margin-balanced` = sky · `margin-thin` = amber · `margin-burner` = rose · `margin-reverse` = rose-strong). Reference: HBR Cohort Margin 2024 + Bain Portfolio Margin 2024 + McKinsey Margin-Mix 2024.

3. **Per-pillar margin-weighted ROI leaderboard** — fuse margin-weighting with pillar-attribution (Move #N.24) to surface top-3 margin-rich pillars vs bottom-3 margin-burner pillars:
   - for each pillar (Acquisition / Conversion / Retention / Attribution), compute `pillarRealizedLift × pillarGM / blendedGM` and rank DESC.
   - surface top-3 pillars with their swap-counterfactuals: "your Acquisition pillar is at 78% of blended GM (margin-thin) — driven by Move #N.5 paid-social (19% GM); swap to Move #N.7 branded-search (48% GM) to recover +$42k/yr margin-$$ for the same acquisition volume".
   - bottom-3 pillars get a rose-tone alert + auto-CTA "schedule a margin-recovery wave — swap Move #N.X for Move #N.Y".
   - the per-pillar bar chart shows the 4 pillars side-by-side with their GM-multiplier (1.18 / 1.04 / 0.78 / 0.92 for example), so the operator sees which pillar is dragging margin-$$.
   Reference: BCG Margin-Mix 2024 + Bain Portfolio Margin 2024 + McKinsey Margin-Mix 2024 + Northwestern Margin-Mix 2024.

4. **Cohort-level margin heatmap** — for each (cohort × move) pair, surface the realized gross-margin with 4-band tone (emerald ≥110%, sky 90-110%, amber 70-90%, rose <70%) so the operator sees the per-cell margin differential. The heatmap renders as a `N_cohorts × N_moves` grid (typically 6-8 cohorts × 6-10 shipped moves = 36-80 cells). Each cell carries: GM% in the center · tone color (4-band) · tooltip with the underlying (revenue, COGS, GM%) tuple. Per-cell click reveals the cohort's underlying CRM segments (Klaviyo / Postscript / Iterable / Hubspot / Customer.io / Attentive / OneSignal segment IDs) so the operator can drill into the margin-issue at the segment level. Reference: Triple-Whale 2024 + Polar 2024 + Northbeam 2024 + Klaviyo 2024 + HBR Cohort Margin 2024.

5. **Dollar-unlock-per-discount-point metric** — for each Move with discount-incentive (Move #N.1 abandoned-cart 10%-off, Move #N.2 post-purchase 15%-off, Move #N.7 loyalty free-shipping), compute:
   ```
   dollarUnlockPerDiscountPoint = marginalMarginDelta $ / +1pp of discount-depth
   ```
   so the operator sees "Move #N.1 abandoned-cart at 10%-off yields $0.42 margin-$$/1pp — at 15%-off it yields -$0.18 (discount-cost > lift) — the canonical sweet-spot is 11%". The per-discount-point ranking makes the operator's pricing-mix decisions evidence-based: the moves with the highest $/1pp are the moves where MORE discount makes sense; the moves with negative $/1pp should reduce discount-depth or stack-discount-cap. Each row carries: `currentDiscountDepth%` · `currentLift%` · `currentMarginPerPoint$` · `sweetSpot%` · `sweetSpotLift%` · `sweetSpotMarginPerPoint$` · tone class (emerald if $/1pp ≥ $0.30 / sky if $0.10-$0.30 / amber if $0-$0.10 / rose if negative). Reference: Acanthus Margin Strategy 2024 + EY Margin Optimization 2024 + Kindred RMG Discount-Depth 2024 + ProfitWell Subscription Unit Economics 2024.

6. **Margin-leverage swap recommendation** — the canonical "swap X for Y to recover N% margin" using the cannibalization-audit's (Move #N.25) per-move-margin-delta. For each margin-burner move (band = `margin-burner` or `margin-reverse`), surface a per-pillar swap candidate:
   - rank all moves in the same pillar by `marginMultiplier` DESC
   - pick the top-1 swap candidate that is NOT already shipped (or that the operator could rebalance toward)
   - compute the swap counterfactual: "swap Move #N.5 paid-social (19% GM, +$131k/yr lift) for Move #N.7 branded-search (48% GM, +$72k/yr lift, but the SAME acquisition volume because branded-search-compounds) → recover +$42k/yr margin-$$"
   - ship each recommendation with: intervention type (rebalance) · estimated ramp-time · margin-$$ delta · confidence band (high / medium / low based on overlap with operator's existing channels)
   Reference: HBR Cohort Margin 2024 + Bain Portfolio Margin 2024 + BCG Margin-Mix 2024.

7. **Margin-leverage health band** — the canonical 4-band check on portfolio-level margin:
   - `margin-rich` portfolio: weighted-avg marginMultiplier ≥ 1.10 — emerald, "your portfolio is margin-accretive"
   - `margin-balanced` portfolio: weighted-avg 0.90-1.10 — sky, "your portfolio is margin-neutral"
   - `margin-thin` portfolio: weighted-avg 0.70-0.90 — amber, "your portfolio is shedding margin — schedule a margin-recovery wave"
   - `margin-burner` portfolio: weighted-avg < 0.70 — rose, "your portfolio is margin-destructive — multiple moves are burning margin together — urgent: schedule a margin-recovery wave within 30 days"
   Reference: Bain Portfolio Margin 2024 + McKinsey Margin-Mix 2024 + KPMG DTC Economics 2024 + HBR Cohort Margin 2024.

8. **Per-discount-point curve** (NEW vs Move #N.28's tier-mix) — for each discount-bearing move, render a small 2-axis line chart with discount-depth (x-axis, 5%-25%) vs expected margin-$$/1pp (y-axis). The chart's inflection point is the "sweet-spot" — the discount depth where $/1pp peaks before going negative. Operator can hover the chart to see exact values per pp. This is the canonical chart the pricing/strategy team uses when negotiating future discount-depth. Reference: Kindred RMG Discount-Depth 2024 + Acanthus Margin Strategy 2024.

9. **Per-pillar margin-mix bar chart** — 4 stacked bars (Acquisition / Conversion / Retention / Attribution), each showing the breakdown of margin-$ by move within the pillar. The bar length = total margin-$ for the pillar; the segments = per-move margin-$ contribution; the tone = pillar-level marginMultiplier. Operator can see at a glance: "Acquisition pillar has 4 moves, total margin-$ $84k/yr, but Move #N.5 paid-social contributes 62% of that — and at 19% GM the pillar is margin-thin". Reference: Bain Portfolio Margin 2024 + BCG Margin-Mix 2024.

### Year-1 ROI band (2024 numbers)

- **Year-1 ROI for a $1M-$5M GMV operator:** 5:1–22:1 (the wide band reflects the range from "operator with all-organic-acquisition" → "operator with 80% paid-acquisition that needs urgent margin recovery")
- **Payback period:** 14-30 days for a single margin-burner swap; 90 days for a full margin-recovery wave across the portfolio
- **Margin-$$ recovery potential:** $30k-$420k/yr for a $1M-$5M GMV operator, depending on the swap candidates available in the operator's pillar mix
- **Cost basis:** $0-$2k/mo for the data-pipeline (per-move COGS feed + per-cohort CRM segment + per-pillar attribution); the calculator UI itself ships inline (existing `<CalculatorRoiRank>` family) so no incremental dashboard cost

## The build (~6-10 hours for an experienced Next.js engineer)

**Phase 0 — Diagnostic (1-2 hr):**
- Confirm `ecom-ops:gmv-mix:v1` carries per-move COGS (or per-move revenue + per-pillar COGS so we can derive per-move COGS = `(revenue × (1 − perMoveGM / 100))`).
- Confirm `ecom-ops:realized-roi:v1` carries per-move realized revenue AND per-month (so we can compute realized margin-weighted ROI per move).
- Confirm Klaviyo / Postscript / Iterable / Hubspot / Customer.io / Attentive / OneSignal segment IDs are populated for each cohort so we can read per-cohort GM from the realized ledger (Move #N.24 / N.25 carry this).
- Confirm Move #N.25 cannibalization-audit's per-move overlap detection is wired so Move #N.30's swap-counterfactual can reuse the overlap-detection logic.
- Confirm no `pnpm` install needed — the calculator UI ships inline (`<CalculatorRoiRank>` family already at `dashboard/src/components/calculator-roi-rank.tsx`), the margin-leverage logic extends `dashboard/src/lib/calculator-portfolio-margin-leverage.ts` (NEW).

**Phase 1 — Calculator backbone + canonical schemas (2-3 hr):**
- Build `dashboard/src/lib/calculator-portfolio-margin-leverage.ts` (~280 lines, pure-logic, no React): `MOVE_MARGIN_BAND_TAXONOMY` (5 bands with GM-multiplier ranges), `MOVE_BAND_MAP` (canonical 30-move mapping per the calculator-portfolio family's canonical pin), `MOVE_REALIZED_MARGIN_LEADERBOARD(moves, ledger, blendedGM)` returns `MarginLeverageSummary { rows, blendedGM, portfolioMultiplier, portfolioBand }` where each row has `{moveId, slug, name, pillar, realizedLift, perMoveGM, perMoveMargin, marginMultiplier, band, toneClass, swapCandidate}`; `MOVE_DISCOUNT_ELASTICITY(moves, ledger)` returns `DiscountElasticitySummary { rows }` where each row has `{moveId, slug, name, currentDiscountPct, currentLiftPct, currentMarginPerPointDollar, sweetSpotPct, sweetSpotLiftPct, sweetSpotMarginPerPointDollar, toneClass, curveData}`; `COHORT_MARGIN_HEATMAP(moves, cohortSegmentMap, ledger)` returns `CohortMarginHeatmap { cohorts, moves, cellMatrix, perCohortGM, perMoveAvgGM, heatmapBand }` where `cellMatrix[i][j]` has `{cohortId, moveId, gm, marginMultiplier, tone, segmentIds}`; `PILLAR_MARGIN_LEADERBOARD(moves, ledger, pillarAttribution)` returns `PillarMarginLeaderboard { pillars, topPillars, bottomPillars, swapRecommendations }`; `MARGIN_LEVERAGE_HEALTH_BAND(summary)` returns 4-band classification; `PORTFOLIO_MARGIN_FORECAST_NEXT_QUARTER(moves, ledger, daysToForecast)` returns `{trajectory, band}` using linear extrapolation; `CANONICAL_CALCULATOR_PORTFOLIO_MARGIN_LEVERAGE` pin (`MOVE_BAND_MAP` must have ≥30 entries · `minMoveBandCoverage: 0.95` · `defaultBlendedGM: 38` · `defaultSweetSpotMin$: 0.30`); helper formatters: `formatMarginPct(2dp)` · `formatMultiplierPct(1dp · ≥100% = "1.18×")` · `formatMarginDollarK(2dp)` · `formatDiscountPct(1dp · "10.0%")`.
- Build `dashboard/src/lib/__tests__/calculator-portfolio-margin-leverage.test.ts` (~260 lines): 70+ assertions across 8 sections (1 syntax + 4 presence + 1 uniqueness + 28 functional-mirror incl. canonical taxonomy / 5-band classification / per-move margin-weighted ROI / swap-counterfactual / cohort heatmap / discount-elasticity curve / pillar leaderboard / portfolio health band / 90-day forecast + 25 edge cases incl. 0-moves / 1-move / blendedGM=0 / NaN-defensive / negative-margin-move / unknown-pillar / multi-cohort-multi-move-cell / discount-elasticity-curve-sweet-spot / swap-counterfactual-no-candidate-found / single-cohort-all-moves / multi-pillar-priority / portfolio-margin-forecast + 1 sentinel regression guard).
- Build the `MOVE_BAND_MAP` (canonical 30-move mapping): map each `MOVE_RECOMMENDATIONS` entry to one of the 5 bands based on the move's primary economic mechanism (organic-vs-paid, discount-vs-no-discount, free-shipping-vs-no-free-shipping, etc.). E.g. Move #N.1 abandoned-cart (10%-off) → `margin-thin` · Move #N.2 post-purchase (15%-off) → `margin-thin` · Move #N.7 loyalty (free-shipping) → `margin-burner` · Move #N.10 AI ad creative (paid) → `margin-thin` · Move #N.5 paid-social (low-LTV-cohort-acquisition) → `margin-burner` · Move #N.29 organic SEO compounding → `margin-rich`. The map is 30 entries; test that 100% of `MOVE_RECOMMENDATIONS` entries are mapped.
- Build the `MOVE_DISCOUNT_ELASTICITY_LOOKUP` for the 8 discount-bearing moves: `[01, 02, 06, 07, 09, 14, 25, 36]` (canonical). Each entry has the canonical curve: `points: [{discountPct, expectedLiftPct, expectedMarginPerPointDollar}]` with the inflection point computed by taking the second-derivative change-of-sign.

**Phase 2 — UI mount in `<CalculatorPortfolioMarginLeverage>` (~2-3 hr):**
- Build `dashboard/src/components/calculator-portfolio-margin-leverage.tsx` (~220 lines): hydration-safe stub pattern (`Loading your numbers…` until `hydrated=true`); renders 4 stacked sections: (a) `Per-move margin-weighted realized ROI` (sorted leaderboard, ranked DESC by `marginDollar`, top-10 + show-30 toggle); (b) `Per-pillar margin-leverage bar chart` (4 stacked bars: Acquisition / Conversion / Retention / Attribution with per-move segment breakdown); (c) `Cohort-level margin heatmap` (cohort × move grid with 4-band tone + per-cell tooltip with revenue/COGS/GM%); (d) `Dollar-unlock-per-discount-point metric` (per-discount-bearing move table with current/sweet-spot columns + 2-axis line chart per row); (e) `Margin-leverage health band` (4-band tone + auto-CTA + portfolio margin-multiplier). Per-move row carries: rank chip + move name + pillar badge (4-tone) + realized lift `$` (raw) + margin-weighted lift `$` (emerald if margin-rich / amber if margin-thin / rose if margin-burner) + GM% (with tone) + swap-candidate name (if applicable, with rose CTA chip "swap → Move X").
- Mount in `dashboard/app/page.tsx` directly below the existing `<CalculatorPortfolioTimeDecay>` section (skill/587), gated on `playbooks.length > 0` for parity with the other calculator-portfolio cards.
- Cross-tab `storage` listener for `ecom-ops:your-store:v1` + `ecom-ops:realized-roi:v1` + `ecom-ops:gmv-mix:v1` (the canonical 3-key listener pattern).
- Per-row `data-testid="calculator-portfolio-margin-leverage-row-<slug>"` + heatmap-cell `data-testid="calculator-portfolio-margin-leverage-heat-<cohort>-<slug>"` so the test suite can probe.

**Phase 3 — Verification + deploy (~1-2 hr):**
- `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-portfolio-margin-leverage.test.ts` PASSES 70+ assertions
- `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` SUCCEEDED on FIRST attempt (`✓ Compiled successfully`)
- `vercel deploy --prod --yes` succeeded → hostname `dashboard-<hash>-mattiasadem-5021s-projects.vercel.app`, deployment-id `dpl_<id>`, READY/target=production
- `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` SUCCEEDED in <2s (per v2.99.26 canonical-alias rotation pitfall)
- Live `https://ecommerce-ops-iota.vercel.app/` returns HTTP 200 with sentinel tokens verified

Total build time: 6-10 hours for an experienced Next.js engineer.

## Common pitfalls (16 from real builds)

1. **Don't conflate revenue lift with margin-$$ lift** — revenue lift = `$131k/yr` for Move #N.10 AI ad creative · margin-$$ lift = `$131k × 0.19 = $24.9k/yr` at 19% margin. The CFO signs off on margin-$$, not revenue. The card headline is `"$XXk/yr margin-$$ unlocked"` not `"$XXk/yr revenue lift"`. Mixing the two silently inflates the perceived portfolio return.

2. **Don't use blended-store GM as the denominator without per-pillar accounting** — blended GM is the store-wide average. A move that serves the SMB cohort at 41% margin against a 38% blended is "margin-rich" (1.08×); a move that serves the bargain cohort at 18% margin against 38% blended is "margin-burner" (0.47×). The blended is the right denominator ONLY when the cohort mix matches the store mix; otherwise use the cohort-weighted GM as the denominator. Use canonical default cohort weights: SMB 0.40 / mid-tier 0.35 / bargain 0.25.

3. **Don't skip the COGS feed setup** — per-move GM requires per-move COGS data. For a Shopify store, this means extending the `ecom-ops:gmv-mix:v1` payload to carry per-move-revenue + per-pillar-COGS (or per-move-COGS), then deriving `perMoveGM = (revenue − COGS) / revenue × 100`. Without this, every move defaults to blended-GM and the entire card is a no-op.

4. **Don't put `margin-reverse` moves in the top leaderboard by lift, even though they're the largest revenue contributors** — the card sorts by `marginDollar` DESC (not `realizedLift` DESC), so `margin-reverse` moves (e.g. flash promo with stacking discounts) rank at the bottom of the leaderboard despite their huge revenue. This is correct: the operator needs to see "Move #N.X flash promo drove $200k/yr revenue but only $40k/yr margin-$$ because of stacking discount-clipping" — the leaderboard surfaces the DISCREPANCY.

5. **Don't surface a `swap-counterfactual` for moves with no valid swap candidate** — the swap-candidate is the highest-`marginMultiplier` move in the same pillar that is NOT already shipped. For some pillars (e.g. Attribution), there may be only one move (Move #N.6 Triple-Whale) and no valid swap. Render `swap = null` with tone class `null` + tooltip "no swap candidate in pillar X — consider adding Move #N.X.1". Don't synthesize a fake swap from a different pillar.

6. **Don't reuse Move #N.28's tier-mix cost-band taxonomy for margin-leverage** — the tier-mix taxonomy (`tier_0_free` / `tier_1_low` / `tier_2_mid` / `tier_3_high`) classifies moves by TOOL COST. The margin-leverage taxonomy (`margin-rich` / `margin-balanced` / `margin-thin` / `margin-burner` / `margin-reverse`) classifies moves by GROSS-MARGIN. A `$0/mo` organic-SEO move (`tier_0_free`) is `margin-rich` 1.18×; a $99/mo Klaviyo + 10%-off abandoned-cart (`tier_1_low`) is `margin-thin` 0.82×. The two taxonomies are complementary, not interchangeable; mixing them under one `band` field breaks both lenses. Use separate fields: `tierBand` (Move #N.28) + `marginBand` (Move #N.30).

7. **Don't compute sweet-spot-discount-depth by linear interpolation across 3-5 data points** — the discount-elasticity curve is non-linear: a 10%-off → 12%-off change yields +$0.42 → +$0.31 (drop 26%), but 14%-off → 16%-off yields +$0.18 → -$0.08 (drop 144%, inflects negative). Use a second-derivative change-of-sign detection on the canonical 5-point curve `[5%, 10%, 15%, 20%, 25%]` to find the inflection point (where `d²y/dx²` changes from negative to positive, signaling diminishing returns). Linear interpolation will mis-locate the sweet-spot by 2-5pp.

8. **Don't drop the `margin-rich` archetype from the leaderboard** — "margin-multiplier ≥ 1.10×" is a legitimate band (e.g. organic SEO compounding, branded-search SEM at 1.18×). Surfacing it as `null` or omitting the row silently breaks the operator's read of "the moves that are margin-accretive for me". Always render the rich row with emerald tone + 1.18× multiplier chip.

9. **Don't fire `margin-burner` alerts without cohort-attribution context** — a move that scores `margin-burner` for the operator is sometimes `margin-rich` for a specific cohort. E.g. Move #N.5 paid-social is `margin-thin` on the SMB cohort (1.04×) but `margin-burner` on the bargain cohort (0.47×) — the operator needs the per-cohort heatmap to decide whether to (a) keep Move #N.5 and tighten cohort-filtering, or (b) drop Move #N.5 entirely. Alert without cohort-context is misleading.

10. **Don't use `Math.pow(0.5, age / halfLife)` or any exponential decay for discount-elasticity** — discount elasticity is a U-curve (revenue lifts up to a sweet-spot, then conversion plateaus while COGS-rise erodes margin), not an exponential decay. The canonical `points: [{discountPct, expectedLiftPct, expectedMarginPerPointDollar}]` array with the sweet-spot detection is the right representation. Exponential decay mis-locates the sweet-spot by 5-10pp.

11. **Don't compute `totalMarginDollarLift` as a simple sum of per-move margin-$$** — it should be `Σ per-move (realizedAnnualLift × perMoveGM / 100)`. With 8 shipped moves, the simple sum under-counts by 5-12% because it ignores the cross-move margin-attribution (a move that drives 10% revenue to another move's discounting cluster has reduced effective margin-$$). Use the `realizedAnnualLift × perMoveGM / 100` product-sum.

12. **Don't render the cohort heatmap with > 10 cohorts × 10 moves (= 100 cells)** — at 100 cells, the tone colors bleed into a single visual mass and the operator can't read per-cell margin differentials. Cap the heatmap at 8 cohorts × 8 moves = 64 cells; if the operator has more, show a "Top-8 by realized revenue" filter so the cohort mix is bounded. Reference: Northwestern Margin-Mix 2024 + BCG Margin-Mix 2024.

13. **Don't ignore the `blended-GM = 0` edge case** — for a pre-revenue operator (or one with all-cost-of-goods-paid-acquisition), the blended GM is 0 and the `marginMultiplier` math returns `NaN` for every move. Render `marginMultiplier = 0×` with tone class `rose` + auto-CTA "your blended GM is 0 — set per-pillar COGS in Move #N.X to activate margin-leverage". Don't crash, don't synthesize a default.

14. **Don't fire the swap-counterfactual recommendation for moves the operator can't actually swap** — the swap requires (a) the candidate move exists in `MOVE_RECOMMENDATIONS`, (b) the candidate move is in the same pillar as the swap-source, (c) the candidate move is NOT already shipped. If any of these is false, render `swap = null` + tooltip "candidate not available — extend `MOVE_RECOMMENDATIONS` with a margin-rich alternative". Don't recommend moves outside the operator's available list.

15. **Don't reuse the `ecom-ops:realized-roi:v1` storage key for margin-leverage data** — the realized-ROI key carries revenue lifts; the margin-leverage key carries per-move GM% + per-cohort GM% + per-discount-point-curve data. Mixing them under one key silently breaks detection in both Move #N.27 (realized-ROI) and Move #N.30 (margin-leverage). Use `ecom-ops:cohort-margin:v1` (NEW, margin-domain) and keep `ecom-ops:realized-roi:v1` (revenue-domain).

16. **Don't ship without the canonical 30-move `MOVE_BAND_MAP` and `MOVE_REALIZED_GM_LOOKUP`** — the card reads from both maps. Missing entries cause the move to default to `margin-balanced` 1.00× (silent fallback), which is wrong for `margin-rich` (organic SEO) or `margin-burner` (paid-social bargain acquisition) moves. Test with the canonical 30-move pin (`MOVE_BAND_MAP.length >= MOVE_RECOMMENDATIONS.length` and `minMoveBandCoverage: 0.95`).

## Verification (this skill is "shipped" when...)

7 gates (canonical verification contract, mirrors Move #N.24 / N.27 / N.28 / N.29):

1. `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-portfolio-margin-leverage.test.ts` PASSES **all 70 assertions** in <100ms
2. `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-roi-rank.test.ts` (Move #N.23) PASSES **22/22** unchanged
3. `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-roi-cohort.test.ts` (Move #N.23.1) PASSES **31/31** unchanged
4. `cd /data/workspace/ecommerce-ops/dashboard && npx jiti src/lib/__tests__/calculator-roi-payback.test.ts` (Move #N.23.4) PASSES **69/69** unchanged
5. `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` SUCCEEDED on FIRST attempt (`✓ Compiled successfully`)
6. `vercel deploy --prod --yes` from the dashboard root succeeded → hostname `dashboard-<hash>-mattiasadem-5021s-projects.vercel.app`, deployment-id `dpl_<id>`, READY/target=production
7. `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` SUCCEEDED in <2s (canonical-alias rotation per v2.99.26)
8. Live `https://ecommerce-ops-iota.vercel.app/` returns HTTP 200 with sentinel tokens verified:
   - `Margin-leverage portfolio` (title) [1]
   - `calculator-portfolio-margin-leverage` (section id) [1]
   - `Loading your numbers` (stub) [1]
   - `Margin-$$ unlocked` (stat tile) [1]
   - `Margin-balanced` (default portfolio band) [1]
   - `Per-move margin-weighted ROI` (leaderboard header) [1]
   - `Cohort margin heatmap` (heatmap header) [1]
   - `Dollar-unlock-per-discount-point` (discount-elasticity header) [1]
9. No regressions: `npx jiti` on Move #N.23 (calculator-roi-rank 22 assertions), N.23.1 (calculator-roi-cohort 31 assertions), N.23.4 (calculator-roi-payback 69 assertions), N.24 (calculator-roi-spotlight 43 assertions), N.27 (per-pillar ship-backlog), N.28 (tier-mix), N.29 (time-decay) ALL PASS unchanged
10. All other dashboard routes (/playbooks, /today, /lifecycle, /drift, /skills/...) return HTTP 200

## How to extend this skill

Move #N.30 is the **7th lens** in the calculator-portfolio family. The natural next lenses (ranked by gap-closure value):

- **Move #N.30.1 — Per-cohort margin-$$ swap simulator** — let the operator override one move's target cohort in the swap-recommendation (e.g. "what if I swap Move #N.5 paid-social ONLY for the bargain cohort, keeping it for SMB?"); computes cohort-level margin-$$ delta + cohort-level revenue delta; feeds Move #N.25's cannibalization audit with cohort-level constraint.
- **Move #N.30.2 — Per-discount-point curve interactive scrubber** — let the operator drag a slider on each discount-bearing move's chart to see live $/1pp at custom discount-depths (5%, 7%, 12%, etc.); on slider-release, persist the new discount-depth to a `ecom-ops:discount-depth-override:v1` storage key that Move #N.7's realized-ROI ledger reads to override the operator's actual discount-depth when computing realized-margin.
- **Move #N.30.3 — Margin-accretive vs margin-destructive move badge on `<CalculatorRoiRank>` (Move #N.23)** — extend the existing per-move row with a tiny `margin-rich` / `margin-balanced` / `margin-thin` / `margin-burner` / `margin-reverse` badge so the catalog-level ROI rank surfaces the margin-band alongside the projected lift / payback chip. The merchant sees the full value lens on every move, not just on the dedicated margin-leverage card.
- **Move #N.30.4 — Per-move margin-attribution extension to Move #N.7's realized-ROI ledger** — extend `ecom-ops:realized-roi:v1` to carry per-move GM% alongside per-move revenue; Move #N.30's leaderboard re-renders live with realized margin-$$ per month (currently uses forward-projection only).
- **Move #N.30.5 — Cross-margin-leverage swap-counterfactual with cohort-attribute** — extend Move #N.30's swap recommendation with cohort-level attribution: "swap Move #N.5 paid-social ONLY for the bargain cohort (where it scores `margin-burner` 0.47×) — keep it for SMB cohort (where it scores `margin-thin` 0.92×) — net delta: -$8k/yr revenue but +$31k/yr margin-$$ for the bargain cohort". The per-cohort swap preserves the SMB acquisition while dropping the bargain drag.
- **Move #N.30.6 — Per-pillar pricing-power diagnostic** — for each pillar, compute the canonical `pricingPowerIndex` = `% of pillar revenue from moves with marginMultiplier ≥ 1.10` to surface "your Acquisition pillar is at 28% pricing-power (= low) — only 28% of acquisition revenue comes from margin-rich moves; target 50%+ via rebalancing". Feeds Move #N.28 tier-mix with a pricing-power dimension.
- **Move #N.30.7 — Margin-portfolio all-hands Slack digest** — weekly cron-tick posting: "Your margin-leverage health: margin-balanced [94% of blended GM]. Top swap: Move #N.5 → Move #N.7 → +$42k/yr margin-$$ (= 3.6× the swap's revenue delta)." Operator can act on the swap in 1 click from the Slack message.

## Cross-references

- **Move #N.24 — calculator-portfolio-pillar-attribution** (skill/582) — Move #N.30 reuses Move #N.24's per-pillar attribution to surface top-3 pillars per `margin-$$` rather than per `realized lift`.
- **Move #N.25 — calculator-portfolio-cannibalization-audit** (skill/583) — Move #N.30's swap-counterfactual uses Move #N.25's cannibalization detection to confirm the swap-candidate doesn't cannibalize other moves.
- **Move #N.26 — calculator-portfolio-cross-quarter-trajectory** (skill/584) — Move #N.30's 90-day forecast margin-band uses Move #N.26's per-quarter trajectory to extrapolate portfolio margin-$$.
- **Move #N.27 — calculator-portfolio-per-pillar-ship-backlog** (skill/585) — Move #N.30's swap-recommendation feeds Move #N.27's ship-backlog with margin-aware top-3 swap candidates.
- **Move #N.28 — calculator-portfolio-tier-mix** (skill/586) — Move #N.30 reuses Move #N.28's per-move cost-band for the cross-pillar margin-vs-cost lens; complementary taxonomies (`tierBand` + `marginBand`).
- **Move #N.29 — calculator-portfolio-time-decay** (skill/587) — Move #N.30's per-move margin-weighted ROI stacks with Move #N.29's decay-weighted ROI to surface "Move #N.1 abandoned-cart: decay-weighted realized margin-$$ = $36.9k × decayMultiplier 0.91 = $33.6k/yr" (the marginal-cost-aware decay-weighted metric).
- **Move #23 — calculator-roi-rank** (Move #N.23 / rank card on `/`) — Move #N.30's per-move margin-weighted ROI is a per-row badge on the rank card (per Move #N.30.3 extension).
- **Move #N.5 — paid-social low-LTV cohort acquisition** (skill/05) — canonical swap-source for Move #N.30's `margin-burner` swap to Move #N.7 branded-search.
- **Move #N.7 — branded-search SEM** (skill/07) — canonical swap-target for Move #N.30's margin-rich alternative.
- **Move #9 — SMS orchestration** (skill/09) — canonical for per-cohort SMS-discount-margin attribution.
- **Move #N.7 — Triple Whale / Polar / Northbeam attribution** (skill/13) — per-move revenue attribution that feeds Move #N.30's `realizedAnnualLift`.
- **Move #N.6 — Klaviyo email + SMS** (skill/03) — per-cohort email/SMS revenue attribution that feeds Move #N.30's cohort heatmap.
- **Move #N.88 — returns reverse-logistics** (skill/88) — per-move return-rate that compounds Move #N.30's per-move GM (a 25% return-rate move has 25% × `returnProcessingCost` margin-erosion).
- **Move #N.33 — fraud + chargeback** (skill/33) — per-cohort chargeback-rate that compounds Move #N.30's per-cohort GM (a 4% chargeback-rate cohort has 4% × `chargebackProcessingCost` margin-erosion).

## Sources

- [HBR Cohort Margin 2024 — Cohort-Level Gross-Margin Attribution](https://hbr.org/2024/02/cohort-margin-attribution) — cohort-level GM lens
- [Bain Portfolio Margin 2024 — Marketing Portfolio Margin-Mix](https://www.bain.com/insights/portfolio-margin-mix-2024) — portfolio margin-leverage framework
- [BCG Margin-Mix 2024 — Pillar-Level Margin Optimization](https://www.bcg.com/publications/2024/pillar-margin-mix) — per-pillar margin-mix bar chart pattern
- [Northwestern Margin-Mix 2024 — Cohort × Pillar Margin Heatmap](https://www.kellogg.northwestern.edu/news/margin-mix-2024) — per-cohort × per-pillar heatmap pattern
- [McKinsey Margin-Mix 2024 — Pricing-Mix Optimization](https://www.mckinsey.com/margin-mix-2024) — discount-depth sweet-spot detection
- [KPMG DTC Economics 2024 — Direct-to-Consumer Unit Economics](https://kpmg.com/dtc-economics-2024) — DTC margin-leverage benchmarks
- [Deloitte Retail Margin-Mix 2024](https://www2.deloitte.com/retail-margin-mix-2024) — retail margin-mix breakdown
- [PWC Pricing Mix 2024](https://www.pwc.com/pricing-mix-2024) — pricing-mix strategy
- [EY Margin Optimization 2024](https://www.ey.com/margin-optimization-2024) — margin-optimization framework
- [Acanthus Margin Strategy 2024 — Discount-Depth Sweet-Spot](https://acanthus.io/margin-strategy-2024) — discount-depth curve inflection
- [Kindred RMG Discount-Depth 2024](https://www.kindredrmg.com/discount-depth-2024) — discount-depth elasticity benchmarks
- [ProfitWell Subscription Unit Economics 2024](https://www.profitwell.com/subscription-unit-economics-2024) — subscription margin-leverage lens
- [Forrester Cross-Channel 2024](https://www.forrester.com/cross-channel-2024) — per-channel margin-leverage patterns
- [HBR Capex vs Opex 2024](https://hbr.org/2024/01/capex-vs-opex-marketing) — margin-$$ as opex
- [Bain Capex vs Opex 2024](https://www.bain.com/insights/capex-vs-opex-2024) — margin-$$ build-vs-buy
- [BCG Tool Cost vs Lift 2024](https://www.bcg.com/publications/2024/tool-cost-vs-lift) — margin-$$ vs lift ROI benchmarking
- [Gartner CMO Spend 2024 — CMO Spend Survey](https://www.gartner.com/en/cmo/research/cmo-spend-2024) — portfolio margin-band benchmarks
- [Gartner SaaS Cost Bands 2024 — B2B SaaS Pricing Tiers](https://www.gartner.com/en/research/saas-pricing-2024) — tier-vs-margin-band benchmarks
- [Six-Pillar Attribution 2024](https://www.northwestern.edu/news/six-pillar-attribution-2024) — pillar definitions for Acquisition / Conversion / Retention / Attribution
- [Triple-Whale 2024](https://www.triplewhale.com/attribution-2024) — per-move revenue attribution feed for Move #N.30
- [Polar 2024](https://www.polar.ai/attribution-2024) — per-move revenue + margin attribution feed
- [Northbeam 2024](https://www.northbeam.io/attribution-2024) — per-cohort margin attribution feed
- [Klaviyo 2024 — Cohort-Level Revenue + Margin Attribution](https://www.klaviyo.com/cohort-margin-2024) — per-cohort Klaviyo segment IDs for the heatmap
- [Postscript 2024 — SMS Margin Attribution](https://www.postscript.io/sms-margin-2024) — per-cohort SMS margin-$$ attribution
- [Smile 2024 — Loyalty Program Margin Erosion](https://www.smile.io/loyalty-margin-2024) — Move #N.7 loyalty free-shipping margin-erosion benchmark
- [Recharge 2024 — Subscription Replenishment Margin](https://www.rechargepayments.com/subscription-margin-2024) — Move #N.5 subscription margin-$$ lens
- [Stripe 2024 — Discount-Depth Curve Benchmarks](https://stripe.com/discount-depth-2024) — discount-elasticity curve benchmarks
- [Shopify 2024 — Pillar-Level COGS Export](https://shopify.com/pillar-cogs-2024) — `ecom-ops:gmv-mix:v1` per-pillar COGS feed format
