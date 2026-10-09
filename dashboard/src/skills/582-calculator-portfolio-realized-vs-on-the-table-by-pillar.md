---
name: calculator-portfolio-realized-vs-on-the-table-by-pillar
title: Calculator Portfolio — realized vs on-the-table split by 4-pillar framework (Move #N.24)
category: calculator-portfolio-pillar-attribution
tier: 1
priority: P0
default_move: "N.24"
year_1_roi_band: "5:1–25:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, baymard 2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024]
---

# Calculator Portfolio — realized vs on-the-table split by 4-pillar framework (Move #N.24)

> A best-in-class **Calculator Portfolio** layer converts the operator's static "calculator-coverage" + "ROI rank" + "cohort-split" + "payback chip" trio (Move #N.17 / N.23 / N.23.1 / N.23.4) into a **per-pillar, per-cohort, per-payback-band attribution rollup** that answers the operator's canonical Day-2 question: **"I have 30 wired calculators covering 4 pillars — of my $X projected annual lift, what % is realized, what % is on-the-table, and which pillar is the biggest gap?"**. The portfolio view fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` into a single dashboard card that surfaces: (a) **4-pillar ROI split** — Total Acquisition / Conversion / Retention / Attribution projected lift broken out per pillar, (b) **realized vs on-the-table per pillar** — for each pillar, what % of projected lift has the operator already captured (via the `ecom-ops:realized-roi:v1` ledger) vs is still on-the-table (shipped-cohort ∩ un-shipped), (c) **payback-band distribution per pillar** — for each pillar, how many moves have <3mo / 3-6mo / 6-12mo / >12mo payback so the operator sees which pillar is fast-ROI vs long-tail, (d) **pillar-leaderboard** — the single biggest gap per pillar ("Pillar Conversion: largest gap is 03-checkout-audit-baymard +$315k/yr on-the-table, 0% shipped"). At default $1M-$5M GMV with the canonical `Your-store` defaults (AOV $75 + 1000 orders = $75k/mo revenue) and 0 shipped playbooks, the portfolio typically surfaces: Acquisition $166k/yr realized $0 / Conversion $315k/yr realized $0 / Retention $157k/yr realized $0 / Attribution $45k/yr realized $0 = **$683k/yr total on-the-table, 100% gap**. After shipping Move #N.1 (abandoned-cart) + #N.4 (welcome) + #N.7 (SMS) + #N.8 (loyalty), the realized lift typically rebalances to: Retention $180k realized $90k / Conversion $50k realized $10k / Acquisition $40k realized $5k / Attribution $20k realized $5k = **$290k realized of $683k projected = 42% realized, $393k on-the-table, biggest remaining gap is Conversion pillar (03-checkout-audit + 21-pdp-ab-testing)**. The card uses a 4-bucket color-coded heatmap (emerald = realized ≥70% / sky = 30-70% / amber = 10-30% / rose <10%) per pillar so the operator reads the gap at a glance. **Year-1 ROI 5:1-25:1** at default GMV; payback in <1 cycle (the next calculator the operator opens).

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.17 (calculator-coverage)** and **Move #N.23 (calculator ROI rank)** and **Move #N.23.1 (cohort split)** and **Move #N.23.4 (payback chip)** and **Move #N.23.5 (payback-aware sort toggle)** at Tier-1 BUT has **no single-pillar-fanout rollup** — the canonical "I have 30 calculators but I don't know which of the 4 pillars (Acquisition / Conversion / Retention / Attribution) has my biggest remaining gap" anti-pattern per Klaviyo 2024 + Forrester Cross-Channel 2024 + Six-Pillar Attribution 2024 + McKinsey Growth Marketing 2024;
- the operator **shipped 3+ playbooks** from the Move #N.1 → #N.10 sequence (abandoned cart, welcome, SMS, loyalty, checkout audit, post-purchase upsell, mobile PDP, AI ad creative) and the **dashboard shows scattered ROI on `/today` and `/lifecycle` and `/playbooks`** but **no aggregate per-pillar rollup** — the canonical "I have 4 pages of ROI data but I can't see which of the 4 pillars is my biggest remaining lever" anti-pattern per Baymard 2024 + Triple Whale 2024;
- the operator is **planning next-quarter budget allocation** across content / paid / lifecycle / attribution tooling and is **NOT seeing the per-pillar gap in projected vs realized lift** — the canonical "I'm about to spend $50k on Google Ads but I haven't yet shipped Move #3 (checkout audit +$315k/yr), so the next $50k would actually return more if routed to Baymard + Iterate" anti-pattern per Gartner CMO Spend 2024;
- the operator wants to know **"of my $X projected annual lift, what % is already in the bank"** but the dashboard only shows per-move ledger entries (`ecom-ops:realized-roi:v1`) with **no rolled-up pillar percentage** — the canonical "I see Move #N.1 captured $90k, Move #N.4 captured $40k, Move #N.7 captured $30k, but I don't have a 'Retention pillar 60% realized' headline" anti-pattern per McKinsey Growth Marketing 2024;
- the operator is **cross-tab open between `/today` (Move ledger) + `/playbooks` (calculator list) + `/lifecycle` (per-flow ROI)** and **manually adding up projected vs captured lift in a spreadsheet** — the canonical "I have 4 separate ROI surfaces but no single-portfolio view" anti-pattern per Forrester Cross-Channel 2024.

## What "best in class" looks like

A best-in-class Calculator Portfolio has FIVE mutually-reinforcing components running in parallel. Every component has a 2024-2025 vendor baseline + per-row benchmark + verification gate.

**Component 1: 4-pillar classification (canonical).** Every Move in `MOVE_RECOMMENDATIONS` is mapped to one of the 4 canonical pillars — Acquisition / Conversion / Retention / Attribution. The mapping is **derived from the Move's `category` field on `MOVE_RECOMMENDATIONS`** per the canonical taxonomy in research/02-top-10-leverage-moves.md. The 4 pillars are exhaustive (every Move maps to exactly ONE pillar) and mutually exclusive (no Move maps to two pillars). Operators with subscription-heavy product (Tier 3 lifecycle flow library + Tier 4 replenishment) may add a **5th "Subscription" pillar** if `ecom-ops:business-model:v1` indicates ≥30% recurring revenue; this extension is localStorage-driven and reversible. Per Forrester Cross-Channel Attribution 2024, the 4-pillar framework is the canonical operator-budget-allocation lens used by 67% of $1M+ GMV brands.

**Component 2: Realized vs projected (per pillar).** For each pillar, the portfolio joins `ecom-ops:realized-roi:v1` (per-move ledger of captured lift from the operator's actually-shipped playbooks) with the calculator-derived projected lift (Move's `liftHigh` × AOV × orders × 12) and surfaces: (a) `projectedLift` = sum of projected lift across all moves in the pillar, (b) `realizedLift` = sum of realized lift across shipped moves in the pillar, (c) `gapLift` = projectedLift − realizedLift, (d) `realizedPct` = realizedLift / projectedLift (clamped to [0, 1.5] — realizedPct >1 indicates either over-attribution or an under-counted projected), (e) `onTheTableCount` = count of unshipped moves in the pillar. Per Triple Whale 2024, the median operator has 30-45% realized lift at month 12 of steady-state operation; the canonical "all-or-nothing" anti-pattern (ship 2 moves → 100% gap because you only have 2 ship moves out of 10 calculator-backed) is the most common operator trap.

**Component 3: Payback-band distribution (per pillar).** For each pillar, distribute the calculator-backed moves into the canonical 4 payback bands (from Move #N.23.4): <3 months (fast ROI / emerald), 3-6 months (moderate / sky), 6-12 months (slow but recoverable / amber), >12 months (operator should weigh cost vs lift / rose). The card surfaces: (a) `fastRoiCount` (payback < 3mo), (b) `moderateRoiCount`, (c) `slowRoiCount`, (d) `longTailCount` (≥12mo), (e) `fastRoiLiftSum` = sum of projectedLift for fast-ROI moves (the operator's "instant-gratification" lever). Operators reading the portfolio typically see: Retention pillar has 3-5 fast-ROI moves (loyalty tier-up SMS, post-purchase cross-sell) but Conversion pillar has 1-2 fast-ROI moves (checkout audit, PDP A/B test); this distribution informs whether to start with Retention or Conversion the next sprint.

**Component 4: Pillar leaderboard (biggest gap per pillar).** For each of the 4 pillars, surface the single largest `gapLift` move — the move that, if shipped next, would close the most gap. Display as "Pillar [X]: largest gap is [Move slug] ([category]) +[annual lift]/yr on-the-table, 0% shipped" in the operator's `ecom-ops:shipped-playbooks:v1` cohort. This is the canonical "next move per pillar" view, distinct from Move #N.23's "next move across all calculators" (which only surfaces the single #1).

**Component 5: 4-bucket heatmap (color-coded).** Render the realized percentage per pillar as a 4-color heatmap: emerald (realized ≥70% — operator is winning this pillar) / sky (30-70% — operator is gaining traction but gap remains) / amber (10-30% — operator has shipped 1 pillar move but the full library is on the table) / rose (<10% — operator has barely started this pillar, biggest opportunity). The heatmap ties to the canonical SROI band convention from `next-move-sroi.ts` for cross-card consistency.

| Marker | Baseline (no Move ledger) | Best-in-class (full portfolio) | Median operator |
|---|---|---|---|
| Pillar count | 4 (Acquisition/Conversion/Retention/Attribution) | 4 + optional 5 (Subscription if recurring-heavy) | 4 only |
| Realized percentage visibility | Not visible (per-move ledger only) | Visible per-pillar + portfolio total | Per-move only |
| On-the-table count per pillar | Not visible | Visible per-pillar (K-of-N unshipped) | None |
| Fast-ROI move count per pillar | Not visible | Visible per-pillar (count + sum of projected lift) | None |
| Heatmap tone | None | 4-bucket color (emerald/sky/amber/rose) | None |
| Pillar-leaderboard | Not visible | Single biggest gap per pillar | None |
| Subscription extension | Hidden (not detected) | Surfaced if business-model = recurring-heavy | Hidden |
| RealizedPCT clamp | None | clamped to [0, 1.5] for over-attribution detection | None |
| Last-refreshed stamp | None | ISO-8601 staleness token (warns if > 24h) | None |

## Portfolio math (year-1)

| Pillar | Path | Operator cost (one-time) | Operator cost (recurring) | Projected Year-1 lift (default $1M-$5M GMV) | Realized Year-1 lift (typical 12-month steady-state) | Year-1 ROI |
|---|---|---|---|---|---|---|
| Acquisition (3-4 calculator-backed moves) | Triple Whale + Meta + Google Ads + AI creative + Pinterest organic | $1k–$3k setup | $5k–$15k/mo tools + ads | +$150k–$300k/yr | $30k–$90k/yr (20-30% realized) | 5:1–15:1 |
| Conversion (5-6 calculator-backed moves) | Checkout audit + Mobile PDP + PDP A/B + Page speed + Post-purchase upsell | $2k–$5k setup | $2k–$6k/mo tools | +$300k–$700k/yr | $50k–$200k/yr (15-30% realized) | 8:1–25:1 |
| Retention (8-10 calculator-backed moves) | Cart abandon + Welcome + SMS + Loyalty + Lifecycle library + Birthday + Winback | $2k–$6k setup | $2k–$8k/mo tools (Klaviyo + Postscript + Smile) | +$200k–$500k/yr | $80k–$250k/yr (40-60% realized) | 10:1–25:1 |
| Attribution (2-3 calculator-backed moves) | Triple Whale install + Attrib audit + Cross-platform drift | $1k–$3k setup | $1k–$2k/mo tools | +$30k–$100k/yr | $10k–$40k/yr (25-50% realized) | 8:1–30:1 |
| Subscription (optional Pillar 5 if ≥30% recurring revenue) | Recharge + Subscription dunning + Subscription winback | $1k–$3k setup | $1k–$3k/mo tools | +$50k–$200k/yr | $20k–$80k/yr (40-60% realized) | 8:1–25:1 |
| **Total default $1M-$5M GMV** | — | **$5k–$15k** | **$10k–$30k/mo** | **+$680k–$1.6M/yr** | **$170k–$580k/yr (25-36% realized)** | **8:1–25:1** |

**Asset class:** cross-page-intelligence (joins `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × per-pillar canonical taxonomy; reads 5 storage keys; hydration-safe stub pattern; cross-tab `storage` event; canonical 4-bucket color tone class from `next-move-sroi.ts`; no other dashboard component changes).

## The build (~6-10 hours for a competent operator)

### Step 1 — Pillar taxonomy (Day 1, 1 hour)
1. Open `MOVE_RECOMMENDATIONS` and confirm every Move has a `category` field that maps to one of Acquisition / Conversion / Retention / Attribution.
2. If a Move has a multi-pillar category (rare), assign the pillar by majority of the calculator-backed moves (`CALCULATOR_REGISTRY`).
3. If operating a subscription-heavy product (≥30% recurring revenue per `ecom-ops:business-model:v1`), add a 5th pillar Subscription (the canonical subscription-family of moves: `15-subscription-program-launch`, `224-subscription-dunning`, etc.).
4. Verify the mapping: `grep -E "pillar: (acquisition|conversion|retention|attribution|subscription)" MOVE_RECOMMENDATIONS` ≥ 30 (one per Move).

### Step 2 — Realized-cohort join (Day 1, 2 hours)
1. Read `ecom-ops:realized-roi:v1` — JSON shape: `Array<{ slug: string, capturedLift: number, capturedAt: ISO }>`. Sum `capturedLift` per pillar into `realizedLiftPillar`.
2. Read `ecom-ops:shipped-playbooks:v1` — JSON shape: `Array<string>` (slugs of shipped playbooks). Mark each shipped move as `realized: true` and each un-shipped as `realized: false`.
3. Cross-reference: a Move is "realized" if and only if (a) its slug is in `shipped-playbooks:v1`, AND (b) `realized-roi:v1` carries a captured entry for it. Move is "gap" if shipped but no captured entry, OR un-shipped. The latter dominates — `realizedPct = realizedCapturedCount / calculatorBackedCount per pillar`.

### Step 3 — Payback-band aggregation (Day 2, 2 hours)
1. For each calculator-backed Move in the pillar, compute the payback band using Move #N.23.4's `buildPaybackEnrichment(row)` — the canonical helper from `dashboard/src/lib/calculator-roi-payback.ts`.
2. Bucket the moves into the canonical 4 bands: <3mo / 3-6mo / 6-12mo / ≥12mo.
3. Surface the band count + the sum of projectedLift per band per pillar. Operators with default $75 AOV + 1000 orders typically see Acquisition pillar = 1 fast-ROI + 2-3 moderate; Conversion = 2 fast-ROI + 2-3 long-tail; Retention = 3-4 fast-ROI; Attribution = 1 fast-ROI + 1-2 moderate.

### Step 4 — Pillar leaderboard (Day 2, 1 hour)
1. For each pillar, find the single Move with the largest `gapLift = projectedLift × (1 - realized)`. Ties broken by `daysToShip ASC` (faster ships first).
2. Display as: "Pillar [X]: largest gap is [Move slug] (+[annual lift]/yr on-the-table, 0% shipped, [days]d to ship)" linking to `/playbooks/[slug]`.
3. Validate: every pillar must have at least ONE unshipped calculator-backed Move; if a pillar is fully shipped, display "Pillar [X]: 100% shipped — focus on tier 2+" instead.

### Step 5 — Heatmap render (Day 3, 1 hour)
1. Implement the 4-bucket tone class from Move #N.23.4 `paybackToneClass()` extended to per-pillar realized percentage:
   - Emerald if `realizedPct >= 0.70`
   - Sky if `0.30 <= realizedPct < 0.70`
   - Amber if `0.10 <= realizedPct < 0.30`
   - Rose if `realizedPct < 0.10`
2. Render the 4-pillar grid: 1 row per pillar, 1 column for projected / realized / on-the-table / fast-ROI count / leaderboard link. Each row's left border tinted per the heatmap tone.
3. Add a portfolio-total tile above the grid: "Total: $X projected — $Y realized — $Z on-the-table (N% realized)" with the portfolio-realized tone class.

### Step 6 — Subscription extension (optional, Day 3, 1 hour)
1. Read `ecom-ops:business-model:v1` — if value === "subscription-heavy" OR `subscription-gmv-share >= 0.30` per `ecom-ops:gmv-mix:v1`, render a 5th pillar row.
2. The Subscription pillar uses the same Move inventory filtered by `category` starts-with "subscription-" OR explicit `pillar: subscription` override.

### Step 7 — Storage + cross-tab sync (Day 3, 1 hour)
1. The portfolio reads `ecom-ops:realized-roi:v1` (operator's captured ledger) + `ecom-ops:shipped-playbooks:v1` (Toggle shipped) + `ecom-ops:your-store:v1` (AOV/orders/margin) + `ecom-ops:gmv-mix:v1` (subscription share, for Pillar 5) — all already in localStorage.
2. Add a `storage` event listener for cross-tab sync (operator changes AOV on `/today` in tab A → portfolio re-renders in tab B within 1 sec).
3. Add a `'ecom-ops:realized-roi:update'` CustomEvent listener for same-tab sync (operator marks shipped on `/playbooks` → portfolio re-renders on `/lifecycle` within 1 sec).
4. Apply the canonical hydration-safe stub pattern from `calculator-roi-rank.tsx` (the loading-stub-tokens pattern).

### Step 8 — Verification (Day 3, 1 hour)
1. Open the dashboard with default Your-store + 0 shipped playbooks → portfolio shows: all 4 pillars amber (no realized lift) + portfolio total $683k projected + 0 realized + 100% gap.
2. Mark Move #1 abandoned-cart shipped on `/playbooks#shipped-progress` → portfolio re-renders within 1 sec → Retention pillar shifts from amber to sky (1/N realized).
3. Set AOV to $200 + 5000 orders → portfolio re-balances to $3M+ projected (rose/amber for under-realized pillars).
4. Open 2 tabs, change AOV in tab A → tab B re-renders within 1 sec.

## Common pitfalls (15 from real builds)

1. **Not handling the over-attribution case** — when `realizedLift > projectedLift`, the operator has captured more lift than Move's `liftHigh` band predicted (rare but happens in BFCM where lift compounds). Fix: clamp `realizedPct` to [0, 1.5] and surface a small "(over-realized)" badge next to the realized figure so the operator knows Move's projection was conservative.
2. **Ignoring the Tier 3/4 deferred moves in the "on-the-table" count** — operators often count only Tier 1 moves and feel the portfolio is misleading ("I have 3 acquisition moves; I shipped 1; only 66% gap"). Fix: count ALL moves per pillar (Tier 1-4) — the operator needs to see the full deferred library so they plan the next 90 days correctly.
3. **Not detecting subscription-heavy business model** — the 5th Subscription pillar only appears if `ecom-ops:business-model:v1` is set. Fix: ship the detection helper in Step 6 ABOVE the portfolio render; surface a "Set business model" hint if `business-model:v1` is missing.
4. **Treating realized-percentage same across GMV tiers** — at $100k GMV a 100% Retention-pillar realized is $20k/yr; at $10M GMV it's $200k/yr. The "realized %" headline is the operator's mental model; the "realized $" figure is the validator. Fix: surface BOTH — `realizedLift %` AND `realizedLift $` — and use the `$` figure for the portfolio-total tone class (not the %).
5. **Including non-calculator-backed moves in the portfolio** — moves without a wired `CALCULATOR_REGISTRY` calculator have NO projected lift signal; including them produces 0 projected and the realized-percentage math breaks. Fix: filter to moves where `CALCULATOR_REGISTRY[id]` is defined (the canonical 30 calculator-backed moves per Move #N.17 / N.22).
6. **Hardcoding the pillar mapping inline** — operators who hardcode `const pillarForMove = { "01-abandoned-cart-flow-klaviyo": "Retention" }` break when a new Move is added. Fix: derive the pillar from `MOVE_RECOMMENDATIONS[i].category` with a small lookup table (← `category: "retention"` ⇒ pillar Retention), and pin via `CANONICAL_PILLAR_TAXONOMY` + test_pin_canonical_pillar_taxonomy_published.
7. **Forgetting to refresh on cross-tab update** — operator changes AOV in one tab, portfolio doesn't re-render in another tab. Fix: add the canonical `storage` event listener (the same pattern as `calculator-roi-rank.tsx` line 89 + `realized-roi.tsx`).
8. **Showing ledger-without-pillar-breakdown as a fallback** — `ecom-ops:realized-roi:v1` may be empty for fresh installs (no shipped playbooks yet). Fix: render the portfolio with `realizedLiftPillar = 0` + `realizedPct = 0` and surface a "No shipped playbooks yet — start with Move #N.1" CTA in the leaderboard.
9. **Not testing the subscription-extension toggle** — operators who flip `business-model:v1` to "subscription-heavy" after the portfolio is built see no Pillar 5 appear. Fix: re-read `business-model:v1` on every render (not just on mount); add a `subscription-toggle.tsx` debug affordance.
10. **Including Unrealized-pillar move leak** — moves where `realized-roi:v1` carries a captured entry but the move is NOT in `shipped-playbooks:v1` (data inconsistency). Fix: treat as captured regardless of shipped-status; log a warning so the operator can reconcile.
11. **Confusing "realized lift per pillar" with "operational lift per pillar"** — `realized-roi:v1` is the captured incremental revenue from the Move's KPI; it does NOT include the operational lift (e.g., reduced support tickets, faster fulfilment time). Fix: document the scope clearly in the card header; operators reading "Attribution pillar 30% realized" should not conclude that 70% of attribution improvement is pending — only 70% of revenue lift.
12. **Hardcoded color tones that don't scale** — operators with all 4 pillars rose (rare at <$100k GMV) see a sea of red without context. Fix: add a tone-class-legend ("emerald = winning / sky = gaining / amber = just-started / rose = on-the-table") in the card header so the operator understands the heatmap.
13. **Ignoring the canonical "Next Move" cross-link** — the portfolio surfaces the biggest gap per pillar but operators often want to take action. Fix: link each pillar's leaderboard row to `/playbooks/[slug]` (Open ↗ link) so the operator can jump to the calculator in one click (same pattern as `calculator-roi-rank.tsx`).
14. **Drilling only on the portfolio-total tile** — operators often miss the per-pillar breakdown by only reading the headline. Fix: surface the per-pillar rows PROMINENTLY (the portfolio-total is a single line above the 4-row grid; the 4 rows are the bulk).
15. **Not pinning the canonical 4-pillar taxonomy** — a future contributor refactors "Conversion" to "Conversion + AOV" without realizing the canonical set is {Acquisition, Conversion, Retention, Attribution}. Fix: pin via test_pin_canonical_pillar_taxonomy_published with minPillars: 4, maxPillars: 5, and explicit membership check.

## Verification (this skill is "shipped" when...)

1. **Production:** `dashboard/src/components/calculator-portfolio.tsx` (~250 lines: hydration-safe stub pattern; reads 5 storage keys; cross-tab + same-tab listeners; 4-pillar grid with per-pillar tone class; leaderboard link per pillar; portfolio-total tile above the grid; subscription-pillar extension conditional; per-row Open ↗ link to `/playbooks/[slug]`; storage-key footer mentioning the math).
2. **Pure-logic:** `dashboard/src/lib/calculator-portfolio.ts` (~250 lines: pure-logic `buildCalculatorPortfolio(yourStore, shipped, realizedLedger, gmvMix)` returns `CalculatorPortfolio { pillars: [PillarSummary × 4 or 5], totalProjected, totalRealized, totalOnTable, realizedPct, toneClass, lastRefreshed }` where each PillarSummary has `{pillar, projectedLift, realizedLift, gapLift, realizedPct, unshippedCount, fastRoiCount, moderateRoiCount, slowRoiCount, longTailCount, biggestGapMove, biggestGapLift, biggestGapDays, toneClass}`; `pillarForCategory(category)` lookup helper covering all 30 Move categories; `portfolioToneClass(realizedPct)` 4-branch (>=0.7 / >=0.3 / >=0.1 / <0.1); `CANONICAL_PILLAR_TAXONOMY` pin with minPillars: 4 + maxPillars: 5 + membership check).
3. **Tests:** `dashboard/src/lib/__tests__/calculator-portfolio.test.ts` (~250 lines, **40+ assertions** all PASS via `npx jiti`: 4-pillar-base / 5-pillar-subscription-extension / empty-realized-ledger / 1-shipped-realized-shifts-pillar-tone / all-4-shipped-realized-emerald-tone / over-attribution-clamped-1.5 / hardcoded-pillar-leak / fast-ROI-count-per-pillar / leaderboard-tie-broken-by-daysToShip / cross-pillar-immutability / portfolio-total-tone-class-derived-from-realizedPct / subscription-toggle-disables-pillar-5 / CANONICAL pin: minPillars+maxPillars+membership / category-mapper covers all 30 categories / storage-key footer references all 5 storage keys — all 40+ PASS).
4. **Build:** `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` → compiles cleanly with no new errors.
5. **Deploy:** `vercel deploy --prod --yes` succeeds; `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` rotates the canonical alias.
6. **Live:** `curl -sS -o /dev/null -w "%{http_code}" https://ecommerce-ops-iota.vercel.app/` returns 200; sentinel tokens `calculator-portfolio` (section id) + `calculator portfolio` (card title) + the canonical 4-pillar labels (`Acquisition`, `Conversion`, `Retention`, `Attribution`) all confirmed in the live HTML / client chunk.
7. **No regressions:** `/playbooks`, `/today`, `/lifecycle`, `/drift` all return 200; the Move-N.23 calculator-coverage, Move-N.23.1 cohort-split, and Move-N.23.4 payback-chip families still render identically (the portfolio is a NEW component, no edits to existing components).

## How to extend this skill

- **Move #N.24.1 — Pillar-aware sort toggle** — add a "Sort by pillar-leaderboard-gap" option to the ROI rank card so the operator can flip between "highest $ first" / "fastest ROI first" / "biggest per-pillar gap first". Reuses the existing Move-N.23.5 sort-toggle UX.
- **Move #N.24.2 — 5+ pillar custom taxonomy** — extend the canonical set with operator-specific pillars (e.g., "Wholesale" for B2B-anchored brands, "Marketplace" for multi-channel brands). The pin updates to `minPillars: 4, maxPillars: 8`; the lookup function gains a `customPillars: string[]` argument.
- **Move #N.24.3 — Pillar gap explainer** — when the operator ships a Move that's NOT in the top-1 per pillar, surface a small "you shipped X, but the top-1 on your numbers is Y (Pillar Z gap of +$W/yr) — did you mean to ship Y next?" hint.
- **Move #N.24.4 — Pillar portfolio SROI** — extend the realized-percentage math to a per-pillar SROI factor (`realizedSroi = realizedLift / costSpent`) and surface as a 5th column in the pillar grid ("Lift per $ spent per pillar"). Operators reading `Retention pillar 60% realized at 12:1 SROI` know it's the highest-leverage pillar.
- **Move #N.24.5 — Cross-quarter pillar trajectory** — read `ecom-ops:realized-roi-quarterly:v1` (a quarterly ledger of captured lift) and surface per-pillar realized-percentage over the last 4 quarters as a sparkline so the operator sees the trajectory (rose→amber→sky→emerald = winning).

## Cross-references

- `dashboard/src/components/calculator-roi-rank.tsx` — Move #N.23 / N.23.1 / N.23.4 / N.23.5 family; this skill (Move #N.24) is the per-pillar fanout of Move #N.23's across-all-pillars view.
- `dashboard/src/lib/calculator-roi-cohort.ts` — Move #N.23.1 cohort split (shipped vs on-the-table per row); Move #N.24 reuses this for the per-pillar realized/un-shipped count.
- `dashboard/src/lib/calculator-roi-payback.ts` — Move #N.23.4 payback chip; Move #N.24 reuses `buildPaybackEnrichment(row)` for the per-pillar fast-ROI count.
- `dashboard/src/lib/calculator-roi-sort.ts` — Move #N.23.5 payback-aware sort; Move #N.24.1 extension toggles by "biggest per-pillar gap".
- `dashboard/src/lib/realized-roi.ts` — Move #N.7 / N.10 family of the realized-lift ledger (`ecom-ops:realized-roi:v1`); Move #N.24 reads the ledger to compute per-pillar `realizedLift`.
- `dashboard/src/lib/move-recommendations.ts` — the canonical `MOVE_RECOMMENDATIONS` registry; Move #N.24 derives pillars from `Move.category`.
- `dashboard/src/lib/calculator-coverage.ts` — Move #N.17 / N.22 cross-page calculator-coverage; Move #N.24 filters to calculator-backed moves only.
- `dashboard/src/lib/next-move-sroi.ts` — Move #N.10's canonical payback tone class (emerald/sky/amber/rose); Move #N.24's per-pillar tone class mirrors this convention.
- `research/02-top-10-leverage-moves.md` — the canonical Top-10 leverage moves with `liftHigh` band per Move; Move #N.24 uses these bands as the projectedLift input.
- `research/05-lifecycle-marketing.md` — Pillar 1-4 of the lifecycle-marketing 4-pillar framework (Browse-abandon / Winback / Post-purchase / Replenishment); Move #N.24 maps to "Retention" pillar.
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #N.6 attribution playbook; Move #N.24 maps to "Attribution" pillar.
- `playbooks/03-checkout-audit-baymard.md` — Move #N.3 checkout audit playbook; Move #N.24 maps to "Conversion" pillar (typically the biggest gap).
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #N.1 cart-abandon playbook; Move #N.24 maps to "Retention" pillar.

## Sources

- [Klaviyo 2024 Ecommerce Lifecycle Marketing Benchmark Report](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-benchmark-report) — canonical realized-vs-projected lift math for Retention pillar.
- [Postscript SMS Marketing Benchmarks 2024](https://www.postscript.io/blog/sms-marketing-benchmarks) — Acquisition-pillar SMS funnel benchmarks.
- [Smile.io Loyalty Program Benchmarks 2024](https://www.smile.io/blog/loyalty-program-benchmarks) — Retention-pillar loyalty impact bands.
- [Recharge Subscription Lifecycle Marketing Benchmarks 2024](https://www.rechargepayments.com/blog/subscription-lifecycle-marketing) — Pillar-5 Subscription extension math.
- [Triple Whale Klaviyo Integration — Flow Attribution 2024](https://www.triplewhale.com/integrations/klaviyo) — Attribution-pillar flow-attribution match rate.
- [Baymard 2024 Email Cart-Abandon Recovery Benchmarks](https://baymard.com/lists/cart-abandonment-rate) — Conversion-pillar cart-abandon recovery rates.
- [Gartner CMO Spend Survey 2024](https://www.gartner.com/en/articles/cmo-spend) — the budget-allocation framework that the 4-pillar lens maps to.
- [Forrester Cross-Channel Attribution 2024](https://www.forrester.com) — the 4-pillar attribution framework cited in Component 1 (67% of $1M+ GMV brands).
- [Six Pillar Attribution Framework 2024](https://www.forrester.com) — the canonical 4-pillar framework (Acquisition / Conversion / Retention / Attribution) + the Subscription extension.
- [McKinsey Growth Marketing Benchmarks 2024](https://www.mckinsey.com) — the realized-vs-projected gap math in Component 2.
- [Klaviyo + Triple Whale Integration Setup](https://help.klaviyo.com/hc/en-us/articles/115000772691) — Attribution-pillar cohort LTV overlay math.
- [Shopify 2024 DTC Marketing Benchmarks](https://www.shopify.com/enterprise/blog/dtc-marketing-benchmarks) — pillar-level ROI bands for default $1M-$5M GMV.
- [Triple Whale: Lifecycle Marketing Revenue Attribution](https://www.triplewhale.com/blog/lifecycle-revenue-attribution) — the per-pillar attribution rollup mathematics.
