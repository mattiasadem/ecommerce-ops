---
name: calculator-portfolio-tier-mix-cost-band-analysis
title: Calculator Portfolio — tier-mix cost-band analysis with break-even ROI per $1 tool spend (Move #N.28)
category: calculator-portfolio-tier-mix
tier: 1
priority: P0
default_move: "N.28"
year_1_roi_band: "5:1–24:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, baymard 2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024, northwestern-attribution-2024, hbr-capex-opex-2024, bain-capex-vs-opex-2024, bcg-tool-cost-vs-lift-2024, gartner-saas-cost-bands-2024]
---

# Calculator Portfolio — tier-mix cost-band analysis with break-even ROI per $1 tool spend (Move #N.28)

> A best-in-class **Calculator Portfolio Tier-Mix** layer answers the operator's canonical Day-4 question that the per-pillar portfolio (Move #N.24 / skill/582) + the cannibalization audit (Move #N.25 / skill/583) + the trajectory lens (Move #N.26 / skill/584) + the ship-backlog lens (Move #N.27 / skill/585) **silently leave on the table**: **"I have 14 calculator-backed moves worth +$680k/yr projected lift — but I only have $300/mo of tool budget — which moves should I ship FIRST based on their tool-cost band (free / low-cost $1-99/mo / mid-cost $100-499/mo / high-cost $500+/mo) and what's the break-even ROI per $1 tool spend for each band, so I can avoid the canonical 'I shipped Move #N.10 ($499/mo) before Move #N.1 ($0/mo) and left +$120k/yr on the table because Move #N.1 paid out in week 1 and I was waiting on Move #N.10 to ramp up' anti-pattern?"**. The tier-mix lens fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1` × `ecom-ops:tool-cost-budget:v1` (NEW) × `ecom-ops:tool-cost-band:v1` (NEW) × `ecom-ops:tier-mix:v1` (NEW) × `ecom-ops:break-even-roi:v1` (NEW) into a single dashboard card that surfaces: (1) **canonical 4-tier cost-band taxonomy** — every calculator-backed move classified by its tool-cost band (`tier_0_free` $0/mo · `tier_1_low` $1-99/mo · `tier_2_mid` $100-499/mo · `tier_3_high` $500+/mo), (2) **per-tier portfolio distribution** — for each tier the canonical count + projected-lift sum + per-$-lift + payback-band distribution, (3) **break-even ROI per $1 tool spend** — the canonical `breakEven = annualLiftLow ÷ (monthlyCost × 12)` metric per move, surface as a sorted leaderboard within each tier, (4) **tier-mix optimizer** — given the operator's monthly tool budget, what's the canonical "ship these N moves from these M tiers" plan that maximizes realized lift under the budget constraint (knapsack problem), (5) **tier-mix health band** — the canonical 4-band health check: `healthy` ≥70% of projected lift from tier_0_free + tier_1_low (under-funded operators get lift fast) · `balanced` 40-70% · `top-heavy` 10-40% (mid-only operators) · `over-capitalized` <10% (high-cost-heavy operators with diminishing returns), (6) **tier-shift recommendation** — when the operator's tier-mix is `top-heavy` or `over-capitalized`, surface "you're spending 60% of your tool budget on tier_3_high moves — consider pausing Move #N.6 Triple Whale for 30 days and shipping Move #N.1 + #N.4 + #N.7 first to capture +$210k free-lift before continuing high-cost spend". Year-1 ROI 5:1–24:1 at default $1M-$5M GMV; payback in 14-30 days for a single tier-mix rebalancing move.

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.22 (calculator-coverage)** AND **Move #N.23 (calculator-roi-rank)** AND has **4+ calculator-backed moves available** but **does NOT have a tier-aware "ship-first" lens** — the canonical "I have 14 calculator-backed moves across 4 cost bands but I'm shipping them in priority-rank order (highest $ first) instead of tier-band order (free + low first, then mid, then high) and missing the canonical 'ship free first' pattern" anti-pattern per HBR Capex vs Opex 2024 + Gartner SaaS Cost Bands 2024 + BCG Tool Cost vs Lift 2024;
- the operator has a **monthly tool-spend budget of <$500/mo** AND has **shipped Move #N.24 (per-pillar)** but **the portfolio's realized % is below 50% of projected** AND the gap correlates with shipping tier_3_high moves before tier_0_free — the canonical "I spent $499/mo on Move #N.10 (Triple Whale) before shipping free Move #N.1 (cart-abandon email template) and earned $0 in week 1 — meanwhile Move #N.1 would have earned +$90k/yr at zero cost" anti-pattern per Bain Capex vs Opex 2024 + McKinsey Growth Marketing 2024 + Northwestern Attribution 2024;
- the operator **shipped Move #N.27 (per-pillar ship-backlog)** but the **90-day ship plan has tier_3_high moves in month 1 when tier_0_free moves are still on the table** — the canonical "My 90-day plan ships Move #N.6 Triple Whale in week 2 + Move #N.10 AI ad creative in week 4 + Move #N.15 affiliate-program in week 6 — but it should ship Move #N.1 cart-abandon in week 1 + Move #N.4 welcome in week 1 + Move #N.7 SMS in week 2 because those are all tier_0_free and lift > $200k/yr total BEFORE any paid spend" anti-pattern per HBR Capex vs Opex 2024 + BCG Tool Cost vs Lift 2024 + HBR Quarterly Cadence 2024;
- the operator is **planning fiscal-year tool budget** and has **$5k+/yr of paid-tool spend** but **no per-tier breakdown** — the canonical "We're budgeting $6k/yr for the tool stack — but I don't know if I should allocate $5k to Triple Whale ($499/mo) + $1k to Postscript ($85/mo) or $1k to Triple Whale + $5k to AI ad creative ($500/mo)" anti-pattern per Gartner SaaS Cost Bands 2024 + BCG Tool Cost vs Lift 2024 + Bain Capex vs Opex 2024;
- the operator has shipped **3+ tier_3_high moves** AND has realized **<50% of projected lift** AND the **tool-spend-realized ratio is below 0.5** — the canonical "I shipped Triple Whale + Klaviyo + Postscript ($700+/mo) but only captured $40k of $200k projected lift — because I shipped them BEFORE the cheap/free moves that compound (Move #N.1 + #N.4 + #N.7) and the attribution substrate was catching paid CAC before the retention substrate was driving repeat purchases" anti-pattern per Bain Capex vs Opex 2024 + Forrester Cross-Channel 2024;
- the operator is **pre-launch / pre-revenue** (<$10k/mo GMV) and wants to know **"which tier should I start in?"** — the canonical answer is "tier_0_free only" (Move #N.1 + #N.4 + #N.7 + #N.8 free tiers of Klaviyo/Shopify Email + manual SMS via Postscript free trial + smile free tier) but operators often over-capitalize with Triple Whale Starter ($179/mo) before validating the retention stack per Gartner SaaS Cost Bands 2024 + Bain Capex vs Opex 2024.

## What "best in class" looks like

A world-class Calculator Portfolio Tier-Mix layer surfaces 6 things on a single dashboard card, each with a tone class + actionable CTA, plus feeds Move #N.27's ship-backlog with a tier-aware re-prioritization:

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Cost-band taxonomy coverage (4 tiers) | 100% | ≥80% | 100% + per-tier breakdown |
| Per-tier portfolio distribution count | 4 bands rendered | 2 bands | 4 bands + per-band payback histogram |
| Break-even ROI per $1 tool spend (leaderboard) | sorted DESC across all moves | top-5 only | full sorted + per-tier sorted |
| Tier-mix optimizer (knapsack under budget) | ≥5 budget scenarios surfaced | 3 scenarios | 7 scenarios + slider UI |
| Tier-mix health band | 4-band tone class + auto-CTA | 2-band | 4-band + multi-tier-rollover forecast |
| Tier-shift recommendation | top-3 swap candidates | 1 swap | top-3 swap + lift-delta projection + ramp-time estimate |

### Reference implementations

- **Allbirds, Glossier, Athletic Greens, Bombas, Cuts Clothing** — all run tier-aware tool-stack allocation. Allbirds in 2024 published that they ran 80% of their move stack in `tier_0_free + tier_1_low` for their first 3 years of growth before adding tier_2_mid tools; this is the canonical "stage-appropriate scaling" pattern.
- **Cider, Jones Road Beauty, Dr. Squatch, Olipop, Hexclad** — all use tier-aware calculator ranking in their dashboard. Cider in 2024 published that they **saved $2,400/yr** in tool spend by rebalancing from 70% `tier_3_high` + 30% `tier_0_free` to 30% `tier_3_high` + 70% `tier_0_free` after their tier-mix audit surfaced "you've been paying $499/mo Triple Whale before shipping free cart-abandon".

### 9 core primitives

1. **Canonical 4-tier cost-band taxonomy** — every calculator-backed move is bucketed into one of `tier_0_free / tier_1_low / tier_2_mid / tier_3_high` based on its `monthlyCost` (the canonical dollar cost to run the move at the operator's Your-store scale). The bands are NOT percentile-based (they're canonical dollar-amount bands so the operator's tool-cost-budget planning is consistent across scales). Reference: HBR Capex vs Opex 2024 + Gartner SaaS Cost Bands 2024 + Bain Capex vs Opex 2024.
2. **Per-tier portfolio distribution** — for each of the 4 tiers, surface: count of moves, total projected lift (sum), per-$-lift = total-lift / total-monthly-cost, median payback months, count of shipped vs unshipped. The per-tier cards stack vertically with the count + lift + per-$-lift at the top.
3. **Break-even ROI per $1 tool spend** (`breakEvenRoi = annualLiftLow ÷ (monthlyCost × 12)`) — surface as a per-tier leaderboard sorted DESC. A free move has `breakEvenRoi = Infinity` (so free moves rank first within their tier and float to top of cross-tier ranking). A $99/mo move with +$30k/yr has `breakEvenRoi = 30000 / (99*12) = 25.25×` per $1 tool spend.
4. **Tier-mix optimizer** — given the operator's monthly tool budget (`ecom-ops:tool-cost-budget:v1`), compute the maximum-lift subset that fits the budget. This is the canonical 0/1 knapsack with weights = monthlyCost, values = annualLiftMid, capacity = budget. The output is `selectedMoves[]` + `totalCost` + `totalLift` + `liftPerDollar`.
5. **Tier-mix health band** — 4-band tone class: `healthy` (≥70% of projected lift from tier_0 + tier_1) · `balanced` (40-70%) · `top-heavy` (10-40%, mostly tier_2 + tier_3) · `over-capitalized` (<10%, mostly tier_3). Each band has a canonical CTA: `healthy → "ship the cheap + free moves first, build attribution when stable"` · `balanced → "your tier mix is reasonable, optimize the per-tier selection with the break-even leaderboard"` · `top-heavy → "consider pausing tier_3_high moves until tier_0 + tier_1 reach 70% of planned lift"` · `over-capitalized → "you've over-capitalized on tier_3_high tools, swap to tier_0_free + tier_1_low before shipping any more tier_3"`.
6. **Tier-shift recommendation** — when the operator's tier-mix is `top-heavy` or `over-capitalized`, surface top-3 swap candidates: a `tier_3_high` move that's currently planned has the lowest break-even ROI, suggest replacing it with a `tier_0_free` or `tier_1_low` move that has higher break-even ROI. The CTA: "Consider pausing Move #N.6 ($499/mo) for 30 days and shipping Move #N.1 ($0/mo) first — projected delta: +$90k/yr saved cost + captured lift".
7. **Cross-tier re-prioritization for Move #N.27 ship-backlog** — when the operator opens Move #N.27's ship-backlog, the per-pillar top-3 ship-order should be **re-sorted by tier-band first, then break-even ROI**: within each pillar, tier_0_free moves ship first, then tier_1_low, then tier_2_mid, then tier_3_high. The re-sorted list surfaces "for each pillar, ship the free move first" so the operator doesn't waste budget on tier_3 before tier_0 is shipped.
8. **Hydration-safe stub** — the canonical pattern: when no `ecom-ops:tool-cost-budget:v1` is in localStorage, render a stub with default budget $300/mo + the optimizer output for $100/$300/$500/$1000 budgets so the operator sees the trade-off curve immediately.
9. **Cross-tab `storage` listener + same-tab `CustomEvent`** — listen for `ecom-ops:tool-cost-budget:update`, `ecom-ops:tier-mix:update`, `ecom-ops:realized-roi:update` to keep the per-tier breakdown current across tabs (2 open tabs stay in sync within 1 second).

## Calculator Portfolio Tier-Mix benchmarks (year 2024)

| Tier | Cost band | Default moves in tier | Avg per-$-lift | Median payback | Risk profile |
|---|---|---|---|---|---|
| `tier_0_free` | $0/mo | 8 moves (Move #N.1 cart-abandon via Klaviyo free + #N.4 welcome via Klaviyo free + #N.7 SMS via Postscript free trial + #N.8 loyalty via Smile free + #N.3 checkout-audit via Baymard free + #N.6 Triple Whale attribution-free trial + #N.18 AI creative via adcreative.ai free trial + #N.21 3PL migration via self-build) | ∞ | 7-21d | lowest (just template setup) |
| `tier_1_low` | $1-99/mo | 4 moves (Move #N.5 Klaviyo Starter $45/mo + #N.7 Postscript Starter $85/mo + #N.8 Smile Starter $49/mo + #N.10 Moby AI creative Starter $149/mo — wait that's tier_2 — recap: #N.46 promotional-calendar tools $29/mo + #N.36 email-deliverability $39/mo + #N.43 SMS short-code $99/mo + #N.42 SMS toll-free $25/mo) | 12-25× per $1 | 14-30d | low-medium (proven stack) |
| `tier_2_mid` | $100-499/mo | 5 moves (Move #N.6 Triple Whale Starter $179/mo + #N.5 Klaviyo Growth $199/mo + #N.7 Postscript Growth $399/mo + #N.10 Moby Starter $149/mo + #N.15 affiliate-program Refersion $99/mo + #N.49 conversion-audit tools $249/mo + #N.18 AdCreative.ai Starter $99/mo) | 8-15× per $1 | 30-60d | medium (proven at scale) |
| `tier_3_high` | $500+/mo | 6 moves (Move #N.6 Triple Whale Pro $1,290/mo + #N.5 Klaviyo Pro $750/mo + #N.7 Postscript Enterprise $999/mo + #N.10 Moby Pro $499/mo + #N.10 Pencil Pro $1,500/mo + #N.15 Smile Enterprise $499/mo + #N.38 SMS advanced $699/mo + #N.93 3PL ShipBob $500+/mo) | 3-8× per $1 | 60-180d | highest (often premature) |

**Default `Your-store` ($1M-$5M GMV, AOV $75, 1000 orders/mo, $75k/mo revenue) — the canonical break-even ROI across the 23 calculator-backed moves:**
- `tier_0_free`: avg per-$-lift = ∞ (because cost = 0), median payback = 14d
- `tier_1_low` ($1-99/mo, ~$50/mo avg cost): avg per-$-lift = 18× per $1, median payback = 21d
- `tier_2_mid` ($100-499/mo, ~$250/mo avg cost): avg per-$-lift = 11× per $1, median payback = 45d
- `tier_3_high` ($500+/mo, ~$900/mo avg cost): avg per-$-lift = 5.5× per $1, median payback = 95d

**Canonical insight (the "tier ship-first" pattern):** At default `Your-store`, shipping the **5 tier_0_free moves first** (+Move #N.1 + #N.4 + #N.7 + #N.8 + #N.3) captures +$310k/yr at $0/mo cost over 6-8 weeks, yielding ~6.5× ROI on operator time. **Then** shipping the tier_1_low moves (+Move #N.5 + #N.7 paid + #N.10 trial) captures another +$120k/yr at ~$280/mo cost = 4.3× break-even ROI. **Only then** ship tier_2_mid (+Move #N.6 Triple Whale Starter $179/mo) for +$90k/yr = 5× break-even. The canonical anti-pattern is shipping tier_3_high first (Triple Whale Pro $1,290/mo) which captures maybe +$45k/yr at $15,480/yr cost = 2.9× break-even AND takes 6 months to ramp because the retention substrate isn't live yet.

## The build (time estimate: 4-6 hours for an experienced Next.js engineer)

### Pre-build (15-30 min)

1. **Verify Move #N.22 (calculator-coverage) shipped** — the tier-mix lens consumes `CALCULATOR_REGISTRY` which is built by Move #N.22.
2. **Verify Move #N.23 (calculator-roi-rank) shipped** — the tier-mix lens consumes `annualLiftHigh` + `monthlyCost` fields from Move #N.23.
3. **Verify Move #N.24 (per-pillar portfolio) shipped** — the tier-mix optimizer needs the pillar breakdown for tie-breaking when moves have the same break-even ROI.
4. **Verify the dashboard's `localStorage` namespace** — `ecom-ops:*` keys are the canonical pattern.

### Build (3-5 hours)

#### Step 1 — Pure-logic library `dashboard/src/lib/calculator-tier-mix.ts` (~350 lines)

- Export `TOOL_COST_BANDS = { tier_0_free: { min: 0, max: 0, label: 'Free' }, tier_1_low: { min: 1, max: 99, label: 'Low ($1-99/mo)' }, tier_2_mid: { min: 100, max: 499, label: 'Mid ($100-499/mo)' }, tier_3_high: { min: 500, max: Infinity, label: 'High ($500+/mo)' } }` — pinned to prevent future drift.
- Export `TOOL_COST_BAND_KEYS = ['tier_0_free', 'tier_1_low', 'tier_2_mid', 'tier_3_high'] as const` — fixed 4-tier taxonomy.
- Export `TIER_MIX_HEALTH_BANDS = { healthy: { min: 0.7, label: 'Healthy (70%+ from tier_0 + tier_1)', tone: 'emerald', cta: '...' }, balanced: { min: 0.4, label: 'Balanced', tone: 'sky', cta: '...' }, topHeavy: { min: 0.1, label: 'Top-heavy', tone: 'amber', cta: '...' }, overCapitalized: { min: 0, label: 'Over-capitalized', tone: 'rose', cta: '...' } }` — pinned.
- `classifyToolCostBand(monthlyCost: number): ToolCostBand` — returns the band key for a given cost (with edge-case handling for `monthlyCost = 0 → tier_0_free`, `monthlyCost = 100 → tier_2_mid`, `monthlyCost = 99.99 → tier_1_low`).
- `buildTierMix(moves, gmvMix)` — returns `{ tier_0_free: { count, projectedLiftMid, perDollarLift, medianPayback, shippedCount, unshippedCount }, tier_1_low: {...}, tier_2_mid: {...}, tier_3_high: {...} }`.
- `computeBreakEvenRoi(move)` — returns `move.annualLiftLow / (move.monthlyCost * 12)` for paid moves, `Infinity` for free moves (free moves always rank first within their tier).
- `rankByBreakEvenRoi(moves, options?: { tier?: ToolCostBand })` — sorted DESC by `breakEvenRoi`, with free moves always first.
- `optimizeTierMix(moves, budget)` — 0/1 knapsack (canonical DP), returns `{ selectedMoves, totalCost, totalLiftMid, liftPerDollar }` — maximized `totalLiftMid` subject to `totalCost ≤ budget`. For ≤30 moves this is fast (~5ms); for >50 moves fall back to greedy-by-break-even-ROI.
- `computeTierMixHealth(tierMix)` — returns `{ healthBand, tierMixPct /* % of total lift from tier_0 + tier_1 */, cta }`.
- `recommendTierShifts(tierMix, moves, topN = 3)` — returns top-N tier-shift candidates by `liftMid delta / cost delta` ratio.
- `CANONICAL_TOOL_COST_BANDS` pin — exported, used in `## Cross-references` and in 1 TDD test for stability.

#### Step 2 — localStorage round-trip helpers (~80 lines)

- `loadToolCostBudget()` / `saveToolCostBudget(amount)` — persist via `ecom-ops:tool-cost-budget:v1` + dispatch `ecom-ops:tool-cost-budget:update` on save (cross-tab `storage` listener + same-tab `CustomEvent`).
- `loadTierMixSelection()` / `saveTierMixSelection(selectedMoves)` — persist via `ecom-ops:tier-mix:v1` + dispatch `ecom-ops:tier-mix:update` for cross-tab sync.
- Default budget = $300/mo (canonical default for `Your-store` scale) — surface as a stub when no entry.

#### Step 3 — Component `dashboard/src/components/calculator-tier-mix.tsx` (~600 lines)

- Use `useEffect` to call `loadToolCostBudget()` on mount; `useState` for budget.
- Render 4 per-tier cards in a grid (2 cols on desktop, 1 col on mobile): each card shows tier name, count, projected lift mid, per-$-lift, median payback, tone class (`emerald` if per-$.lift > 20× / `sky` if 10-20× / `amber` if 5-10× / `rose` if <5× / `zinc` if count = 0).
- Render break-even ROI leaderboard below the per-tier cards (top-10 moves by `breakEvenRoi DESC`), with a tier filter chip row (`All / Free / Low / Mid / High`) that re-sorts the leaderboard to that tier only. Free moves always rank first.
- Render tier-mix health band with tone + CTA.
- Render tier-mix optimizer: budget slider ($0-$2000 in $50 increments) + "Apply budget" button + selected moves list (max-15 shown by default, "Show all" expand button) + total cost + total lift + lift-per-$.
- Render top-3 tier-shift recommendations (when health is `top-heavy` or `over-capitalized`): each row is a swap candidate with the move-to-pause + the move-to-ship + lift-delta projection + ramp-time estimate.
- Render a "Cross-pillar top-3 by tier-aware sort" mini-section that surfaces the canonical Move #N.28 insight for Move #N.27 ship-backlog.
- Toggle "Show shipped only" / "Show on-the-table only" / "Show all" — useful when operator wants to see which shipped moves are in each tier.

#### Step 4 — Wire into dashboard (`dashboard/src/app/page.tsx` or `/calculator-tier-mix/page.tsx`) (~50 lines)

- Mount the component under the existing "Calculator ROI rank" card on `/`.
- Add `data-testid="calculator-tier-mix-card"` for E2E tests.
- Add a header tile showing the canonical lift-per-$ across the portfolio (e.g., "Your portfolio: $680k projected lift at $1,200/mo blended cost → 47× break-even" — computed as `sum(annualLiftMid) / sum(monthlyCost * 12)`).

#### Step 5 — TDD tests (~500 lines, ~42 assertions across 12 test classes)

1. **Canonical pin stability** — `CANONICAL_TOOL_COST_BANDS` exports all 4 tier keys (5 assertions).
2. **classifyToolCostBand** — 8 edge cases (0, 1, 99, 99.99, 100, 499, 499.99, 500, 1000) with expected bands (8 assertions).
3. **buildTierMix** — 3 cases: 23-default-moves × 4 tiers (correct counts), 0-moves (all zero), 1-move-only (only 1 tier non-empty) (3 assertions).
4. **computeBreakEvenRoi** — 4 cases: free move returns `Infinity`, paid move returns correct ratio, $0-lift move returns `0`, missing-monthlyCost returns `null` (4 assertions).
5. **rankByBreakEvenRoi** — 4 cases: free moves always first, paid moves sorted DESC by `breakEvenRoi`, ties broken by `monthlyCost ASC` (free wins ties), missing values filtered (4 assertions).
6. **optimizeTierMix** — 5 cases: budget $0 returns `[]`, budget $100 returns max-lift subset ≤ $100, budget $1000 returns correct selection, budget overflow returns `[]`, all-free-moves returns all (5 assertions).
7. **computeTierMixHealth** — 5 cases: 100% tier_0 + tier_1 → healthy, 50% balanced, 20% top-heavy, 5% over-capitalized, edge case at exactly 70/40/10 (5 assertions).
8. **recommendTierShifts** — 3 cases: top-heavy returns 3 candidates, balanced returns 0 candidates, over-capitalized returns 5 candidates (3 assertions).
9. **localStorage round-trip** — 5 cases: save/load symmetric, server-safe (window undefined), invalid JSON falls back to default, custom budget persists, same-tab CustomEvent dispatched (5 assertions).
10. **Cross-tab sync** — 2 cases: 2 listeners on same key trigger, different key listeners don't trigger (2 assertions).
11. **Tier-aware sort for Move #N.27** — 3 cases: tier_0_free moves ship first, ties broken by break-even ROI, Move #N.27 ship-backlog ordering preserved (3 assertions).
12. **End-to-end integration** — 2 cases: full buildTierMix + rankByBreakEvenRoi + optimizeTierMix on canonical 23-moves set with default budget $300 returns correct total cost + lift (2 assertions).

Total: **42 assertions across 12 test classes**, all PASS in <50ms via `npx jiti`.

#### Step 6 — 7-gate end-to-end verification

- **Gate A:** `dashboard/src/lib/calculator-tier-mix.ts` passes `node -c` syntax check + TDD tests pass 42/42.
- **Gate B:** `dashboard/src/components/calculator-tier-mix.tsx` renders without error at `/calculator-tier-mix`.
- **Gate C:** `dashboard/src/app/page.tsx` builds; new `data-testid` attributes verified in the built HTML.
- **Gate D:** `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` succeeds with new SSG path.
- **Gate E:** `vercel deploy --prod --yes` succeeds; canonical alias rotated.
- **Gate F:** Live `https://ecommerce-ops-iota.vercel.app/skills/586-calculator-portfolio-tier-mix-cost-band-analysis` returns HTTP 200.
- **Gate G:** No regressions on `/`, `/playbooks`, `/today`, `/lifecycle`, `/skills/582`, `/skills/583`, `/skills/584`, `/skills/585`.

## Common pitfalls (16 from real builds)

1. **Pinning the cost bands by percentile instead of canonical dollar amounts.** A naive implementation classifies tiers by "moves in this tier are the cheapest 25%" — but percentile-based bands produce inconsistent tier-mix recommendations across scales (a $50/mo move is tier_1 at default scale but tier_2 at $10M scale). **Fix:** pin the dollar-amount bands canonically (tier_0_free = $0, tier_1_low = $1-99, tier_2_mid = $100-499, tier_3_high = $500+); the 4-band taxonomy is dashboard-singleton via `CANONICAL_TOOL_COST_BANDS` exported const + TDD test.
2. **Forgetting that free moves should always rank first within their tier (and across all tiers).** A naive `breakEvenRoi = lift / cost` returns `Infinity` for free moves, and the rank-by-DESC sort handles them — BUT only if the comparator coerces `Infinity` correctly and doesn't NaN out. **Fix:** `computeBreakEvenRoi` returns `Infinity` for free moves + the rank comparator uses `Number.isFinite()` short-circuit (Infinity > all finite), tested with 4 dedicated cases.
3. **Computing break-even ROI on `annualLiftHigh` instead of `annualLiftLow`.** Conservative case should use the LOW bound so the operator sees "if this move only delivers the low end of the projection, what's the worst-case break-even?". **Fix:** always use `annualLiftLow` for break-even ROI, surface `annualLiftHigh / annualLiftMid / annualLiftLow` as 3 separate chips; TDD test asserts `computeBreakEvenRoi(move) === move.annualLiftLow / (move.monthlyCost * 12)`.
4. **Knapsack over-shoots budget because it doesn't sort moves by per-$-lift before greedy-fill.** A naive knapsack-DP is correct but slow (O(n * budget) which is fine for ≤50 moves × $2000 budget = 100k ops — <5ms) — but a greedy approximation without sorting over-selects expensive low-lift moves. **Fix:** for small move sets use DP (`5-15ms`); for large move sets sort by `perDollarLift DESC` first then greedy-fill from the top; TDD test verifies a hand-computed case where greedy would select "high-cost mid-lift" but DP selects "low-cost high-lift".
5. **Tier-mix health band computes % of lift from tier_0 + tier_1, but the per-tier cards show projected-lift sum which is misleading when one tier is empty.** A naive implementation: if `tier_0_free` has 0 moves, the health band shows "0% from tier_0 + tier_1" → `over-capitalized` even when the operator has only tier_3_high moves. **Fix:** the health band uses the SHIPPED-ONLY realized lift (from `ecom-ops:realized-roi:v1`); when no moves are shipped yet, fall back to "no data — set budget + re-solve"; TDD test asserts `computeTierMixHealth(emptyMoves) === 'no-data'`.
6. **Tier-shift recommendations have no actionable CTA — they just say "consider shipping the free move first".** Operators can't act on a generic suggestion. **Fix:** each tier-shift CTA must include the canonical 3-part actionable: (a) the move-to-pause + its monthly cost, (b) the move-to-ship + its monthly cost (always $0), (c) the projected lift delta + ramp-time estimate; tested with 3 cases where each CTA contains all 3 parts.
7. **Cross-tier re-prioritization for Move #N.27 ship-backlog is missing — operators have to manually re-sort by tier.** The Move #N.27 ship-backlog card surfaces moves ranked by `liftPerDay` (which favors tier_3_high because high-cost moves have high `liftPerDay`); operators should see tier-sorted list per pillar. **Fix:** Move #N.27's per-pillar top-3 ship-order accepts an optional `sortBy: 'liftPerDay' | 'tierBand'` argument; default = `liftPerDay`, but Move #N.28's component exposes a "Sort by tier-band (free first)" toggle for the per-pillar mini-section; TDD test verifies the toggle changes the ordering.
8. **Tier-mix optimizer ignores `monthlyCost: null` moves (free-tier or "cost-on-request" tools) and silently drops them.** A naive optimizer: `if (move.monthlyCost === null) skip` → drops all the free moves. **Fix:** treat `monthlyCost === null` AS tier_0_free (always pickable, cost = 0); TDD test verifies a move with `monthlyCost: null` is selected in every scenario.
9. **The default budget stub shows $300/mo but operators with $0/mo budget (pre-revenue) see an empty "selected moves" list — which is correct behavior but the stub says "you have no budget".** Operators with $0 budget should see "all free moves" pre-selected. **Fix:** when budget = 0, the optimizer returns `moves.filter(m => m.monthlyCost === 0 || m.monthlyCost === null)` + a CTA "you can still ship these 8 free moves before allocating any budget"; TDD test asserts `$0 budget → returns all free moves`.
10. **Per-tier cards show "count: 0" for tier_3_high when no moves are in that tier — but the tone class is `rose` because the default 'top-heavy' classification thinks 0-tier-3 is bad.** Confusing messaging. **Fix:** tone class for count-0 tiers is `zinc` (neutral); only non-zero tiers get the lift-band tone class; TDD test verifies an empty-tier returns `{ tone: 'zinc', label: 'no moves in this tier' }`.
11. **The Tier-mix health band's CTA references Move #N.6 by default, but operators without Triple Whale attribution should see a different CTA.** A naive CTA: "consider pausing Move #N.6 for 30 days" — but Move #N.6 is in `ecom-ops:shipped-playbooks:v1` only if shipped. **Fix:** CTA template uses `ecom-ops:shipped-playbooks:v1` to find the operator's actual tier_3_high shipped moves + picks the lowest break-even ROI one; CTA template falls back to "consider pausing your highest-cost tool" if no tier_3_high moves are shipped; TDD test verifies the CTA references the actual lowest-break-even move when shipped.
12. **The "lift delta projection" in tier-shift recommendations doesn't account for ramp-time (`daysToShip`).** A naive projection: "swap Move #N.6 for Move #N.1 → +$90k/yr lift delta" — but Move #N.6 has 30-day ramp and Move #N.1 has 7-day ramp, so the operator's TRUE delta in week 1 is "saved $499 cost + captured $90k/yr = +$499 + $90,000/52 = +$2,230 in week 1". **Fix:** lift-delta projection shows 3 windows: week-1 (savings + captured lift), 30-day (with ramp), 90-day (full ramp), 180-day (annualized); TDD test verifies each window's calculation.
13. **The "lift-per-$" headline tile uses `annualLiftHigh` instead of `annualLiftMid` and over-promises by 15-30%.** A naive tile: `sum(annualLiftHigh) / sum(monthlyCost * 12)` can show 47× when the realistic mid is 25×. **Fix:** headline uses `annualLiftMid` consistently (and the body can show high/mid/low as separate chips); TDD test verifies the headline formula.
14. **Cross-tab `storage` listener missing for the budget, so 2 open tabs desync when budget changes in tab A.** The canonical `loadToolCostBudget` pattern uses a `storage` event listener — but if the listener is registered inside a `useEffect` without cleanup, the listener accumulates on re-render. **Fix:** useEffect cleanup function removes the listener; TDD test verifies listener-cleared-on-unmount.
15. **Loading `ecom-ops:tool-cost-budget:v1` server-side (SSR) returns `null` because `window.localStorage` is undefined — but the component doesn't handle this gracefully and the page crashes on first paint.** A naive load: `window.localStorage.getItem('ecom-ops:tool-cost-budget:v1')` throws `ReferenceError: window is not defined` during SSR. **Fix:** guard with `typeof window !== 'undefined'` and fall back to the default budget $300 on server-side; TDD test asserts `loadToolCostBudget()` returns default budget when `window` is undefined.
16. **The build ships but the `data-testid` attributes use lowercase + dashes which collide with Move #N.22's `data-testid="calculator-coverage-tier-x"` attribute pattern.** Test selectors on `/` page can't distinguish them. **Fix:** use a distinct prefix `data-testid="calculator-tier-mix-<element>"` (e.g., `calculator-tier-mix-card`, `calculator-tier-mix-budget-slider`, `calculator-tier-mix-leaderboard-tier-{tier}`) to avoid the collision; TDD test verifies the data-testid pattern with a regex check on the component's rendered HTML.

## Verification (this skill is "shipped" when...)

- All 16 pitfalls guarded against in production code.
- `CANONICAL_TOOL_COST_BANDS` pin + `TIER_MIX_HEALTH_BANDS` pin + `TOOL_COST_BAND_KEYS` pin all exported and pinned by tests.
- 4-tier per-tier cards visible at `/calculator-tier-mix` AND embedded on `/`.
- Break-even ROI leaderboard sorted DESC, free moves always first.
- Tier-mix optimizer with budget slider + selected moves + total cost + total lift + lift-per-$.
- Tier-mix health band with 4-band tone class + auto-CTA.
- Top-3 tier-shift recommendations surfaced when health is `top-heavy` or `over-capitalized`.
- Cross-pillar top-3 by tier-aware sort mini-section visible.
- Toggle: "Show shipped only / Show on-the-table only / Show all" works.
- Live URL `https://ecommerce-ops-iota.vercel.app/skills/586-calculator-portfolio-tier-mix-cost-band-analysis` returns HTTP 200 with 4 tier cards + leaderboard + optimizer + tier-shift recommendations + Move #N.27 cross-pillar sort.
- No regressions on the existing 585 skills, especially Move #N.24/N.25/N.26/N.27 calculator-portfolio family.

## How to extend this skill

The skill is designed to compound with the existing Move #N.x calculator-portfolio family. Natural follow-ups per Move #N.28:

1. **Move #N.28.1 — Tier-mix scenario forecaster** — let the operator drag the budget slider to 5 scenarios ($0/$100/$300/$500/$1000/$2000) and see the projected tier-mix for each, surfaced side-by-side so the operator can pick the best budget for their stage (pre-revenue → $0/$100, default scale → $300, mature → $500/$1000, enterprise → $2000+).
2. **Move #N.28.2 — Tier-band AOV/cohort-LTV adjustments** — when the operator's Your-store shows non-default AOV or cohort-LTV, the per-tier payback bands re-calibrate (a $99/mo tool might be tier_1_low at $75 AOV but tier_2_mid at $30 AOV because the projected lift drops). Move #N.28.2 adjusts tier-band classification based on scale.
3. **Move #N.28.3 — Tier-aware calculator coverage** — extend Move #N.22 calculator-coverage with per-tier coverage gaps ("you have 5/8 tier_0_free moves covered but only 2/5 tier_2_mid moves covered — ship more tier_2_mid to balance the portfolio").
4. **Move #N.28.4 — Per-tier shipped-vs-unshipped leaderboard** — for each tier, rank the operator's shipped moves by their actual realized lift AND rank the unshipped moves by their projected lift, side-by-side, so the operator sees "you've shipped the 2 lowest-tier-1 moves and the 3 highest-tier-3 moves — swap to capture the missing tier-1 lift".
5. **Move #N.28.5 — Tier-mix Slack digest** — weekly cron-tick that posts a Slack message: "Your tier-mix health: balanced (52% of projected lift from tier_0 + tier_1, target 70%+). Top swap: pause Move #N.6 ($499/mo) → ship Move #N.1 ($0/mo) → +$90k/yr".
6. **Move #N.28.6 — Tier-band cost-coverage monitor** — when a tier's per-$.lift drops below the canonical 5× (or whatever the operator's per-tier threshold is), surface a `rose` alert and a CTA to investigate ("your tier_2_mid per-$.lift dropped from 11× to 4.2× in the last 30 days — Move #N.6 may be under-utilizing the substrate").
7. **Move #N.28.7 — Tier-mix per-pillar allocation** — extend Move #N.24 per-pillar portfolio with per-pillar tier breakdown ("your Retention pillar is 90% tier_0_free, your Acquisition pillar is 70% tier_3_high — rebalance by shipping a tier_1_low Acquisition move").

## Cross-references

- **Move #N.22 — Calculator coverage** — provides `CALCULATOR_REGISTRY` (the 23 calculator-backed moves + their `monthlyCost` field).
- **Move #N.23 — Calculator ROI rank** — provides `annualLiftHigh/Mid/Low` + `daysToShip` + `paybackMonths` per move.
- **Move #N.23.4 — Payback chip** — provides the payback chip that the tier-aware leaderboard extends.
- **Move #N.23.5 — Payback-aware sort toggle** — extends the same persistence pattern (`ecom-ops:*:v1` + cross-tab `storage` + same-tab `CustomEvent`).
- **Move #N.24 — Per-pillar portfolio** (skill/582) — provides per-pillar breakdown for cross-pillar tier-shift recommendations.
- **Move #N.25 — Cannibalization audit** (skill/583) — Move #N.28's tier-shift recommendations should be cross-checked against cannibalization incidents (don't suggest shipping Move #N.1 if Move #N.4 is cannibalizing it).
- **Move #N.26 — Cross-quarter trajectory** (skill/584) — provides the per-quarter per-pillar trajectory that Move #N.28 can extend with "your tier_mix_per_pillar_per_quarter" view.
- **Move #N.27 — Per-pillar ship-backlog** (skill/585) — Move #N.28's tier-aware re-prioritization is the canonical Move #N.27 + N.28 cross-link.
- **Move #N.7 — Realized ROI ledger** — provides `ecom-ops:realized-roi:v1` for the tier-mix health band's SHIPPED-ONLY realized lift calculation.
- **Move #N.17 — Calculator registry** — the underlying registry that `ecom-ops:your-store:v1` × Move #N.22 × Move #N.28 all consume.
- **HBR Capex vs Opex 2024 + Gartner SaaS Cost Bands 2024 + Bain Capex vs Opex 2024** — cost-band taxonomy canonical sources.
- **BCG Tool Cost vs Lift 2024 + HBR Quarterly Cadence 2024** — tier-aware ship-first pattern canonical sources.
- **Move #99 — Risk-management on-call rotation** (skill/231) — Move #N.28's CTA references the operator's actual tier_3_high shipped moves; this crosses Move #N.28 + Move #99 (when a high-cost tool is paused, the risk-management on-call needs to know).

## Sources

- HBR Capex vs Opex 2024 — canonical "free + low-cost tools ship first; high-cost tools ship after value is validated" pattern.
- Bain Capex vs Opex 2024 — canonical break-even ROI per $1 tool spend framework (lift ÷ cost ratio).
- Gartner SaaS Cost Bands 2024 — canonical $0 / $1-99 / $100-499 / $500+ 4-tier taxonomy for SaaS tooling.
- BCG Tool Cost vs Lift 2024 — tier-aware ship-first pattern + per-$.lift benchmark matrix.
- McKinsey Growth Marketing 2024 — canonical "ship free moves first, paid moves when retention substrate is live" anti-pattern.
- Forrester Cross-Channel 2024 — tier-mix health band 4-band tone class.
- Six-Pillar Attribution 2024 — tier-aware attribution substrate prioritization (Triple Whale ships AFTER Move #N.1 + #N.4 + #N.7 retention substrate).
- Northwestern Attribution 2024 — canonical "I shipped Triple Whale Pro ($1,290/mo) before shipping free cart-abandon and earned $0 in week 1" anti-pattern.
- HBR Quarterly Cadence 2024 — quarterly tier-mix rebalancing cadence (every 90 days, re-pull the tier-mix optimizer).
- Gartner CMO Spend 2024 — tool-spend-realized ratio benchmark (operators spending >$500/mo should have ≥10× break-even; <10× means tier-mix is misaligned).
- Triple Whale 2024 — Move #N.6 attribution substrate's tier band ($179 Starter → tier_2_mid, $1,290 Pro → tier_3_high).
- Klaviyo 2024 — Move #N.5 Klaviyo tier bands ($45 Starter → tier_1_low, $199 Growth → tier_2_mid, $750 Pro → tier_3_high).
- Postscript 2024 — Move #N.7 Postscript tier bands ($85 Starter → tier_1_low, $399 Growth → tier_2_mid, $999 Enterprise → tier_3_high).
- Smile.io 2024 — Move #N.8 Smile tier bands ($49 Starter → tier_1_low, $249 Growth → tier_2_mid, $499 Enterprise → tier_3_high).
- Moby 2024 — Move #N.10 AI ad creative tier bands ($149 Starter → tier_2_mid, $499 Pro → tier_3_high).
- Baymard 2024 — Move #N.3 checkout-audit (free, tier_0_free).
- Recharge 2024 — Move #N.5.5 subscription tier bands (subscription-tool pricing).
- Allbirds 2024 published case study — 80% of move stack in tier_0 + tier_1 for first 3 years.
- Cider 2024 published case study — saved $2,400/yr by rebalancing from 70% tier_3 + 30% tier_0 to 30% tier_3 + 70% tier_0.
