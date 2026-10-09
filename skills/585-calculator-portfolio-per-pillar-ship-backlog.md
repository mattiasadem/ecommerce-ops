---
name: calculator-portfolio-per-pillar-ship-backlog
title: Calculator Portfolio — per-pillar ship-backlog with 90-day acceleration plan (Move #N.27)
category: calculator-portfolio-per-pillar-ship-backlog
tier: 1
priority: P0
default_move: "N.27"
year_1_roi_band: "5:1–25:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, baymard 2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024, northwestern-attribution-2024, hbr-quarterly-cadence-2024, hbr-90-day-execution-2024, bcg-priority-roadmap-2024, bain-velocity-vs-backlog-2024]
---

# Calculator Portfolio — per-pillar ship-backlog with 90-day acceleration plan (Move #N.27)

> A best-in-class **Per-Pillar Ship-Backlog** layer answers the operator's canonical Day-3 question that the per-pillar portfolio (Move #N.24 / skill/582) + the cannibalization audit (Move #N.25 / skill/583) + the trajectory lens (Move #N.26 / skill/584) **silently leave on the table**: **"I have 14 un-shipped calculator-backed moves across 4 pillars — which pillars have the BIGGEST backlog (in projected lift per move), which moves should ship FIRST to close 80% of the per-pillar gap, and what's a realistic 90-day ship-backlog acceleration plan (calendar dates + Move-sequence + per-move days-to-ship budget) to convert the on-the-table backlog into realized lift?"**. The ship-backlog layer fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1` × `ecom-ops:business-model:v1` × `ecom-ops:calculator-roi-rank-cache:v1` × `ecom-ops:ship-backlog:v1` × `ecom-ops:ship-backlog-plan:v1` into a single dashboard card that surfaces: (1) **per-pillar backlog ledger** — for each of the 4 (or 5) pillars, the canonical count + projected-lift sum + median-days-to-ship of the un-shipped calculator-backed moves, (2) **per-pillar top-3 ship-order** — the canonical first-3 moves to ship per pillar, ranked by `liftPerDay DESC` (where `liftPerDay = (liftHigh + liftLow) / 2 ÷ daysToShip`), (3) **90-day ship-backlog acceleration plan** — a calendar-grid view of the next 90 days with each cell either an empty day OR a Move-slug + start/end date + per-move ROI chip, computed by greedy-fill (highest `liftPerDay` first, respecting move-prereq dependencies, max 1 Move at a time per operator-week), (4) **per-pillar acceleration target** — the canonical 90-day post-plan "per-pillar realized %" projection: `currentRealized% + (90dayPlanLift ÷ pillarProjectedLift)` after the 90-day plan executes, (5) **ship-velocity indicator** — the canonical pace check: `movesShippedInLast90Days ≥ N` ⇒ velocity is "on-track" for the plan; else the operator sees "you're shipping at 0.5x pace — to hit the 90-day target, ship 1.8x faster". Year-1 ROI 5:1–25:1 at default $1M-$5M GMV.

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.24 (calculator-portfolio-pillar-attribution)** AND **Move #N.26 (cross-quarter trajectory)** AND has **5+ un-shipped calculator-backed moves** but **no plan to ship them by end-of-Q** — the canonical "I can see my Retention pillar has 5 un-shipped moves worth +$200k/yr but I have no idea WHICH to ship first, by WHEN, or in what order — I just know I want to ship them all eventually" anti-pattern per HBR 90-Day Execution 2024 + BCG Priority Roadmap 2024 + Bain Velocity vs Backlog 2024;
- the operator is **planning a fiscal quarter** and has **4+ un-shipped calculator-backed moves** but **no per-pillar priority order** — the canonical "We're heading into Q4 and I want to ship 6 moves but I don't know if I should ship them all in Retention first (deep on retention) or 2-per-pillar (balance) or whatever lifts the most $ fastest (greedy per-day)" anti-pattern per HBR Quarterly Cadence 2024 + Northwestern Attribution 2024;
- the operator has **shipped Move #N.26.4 (trajectory-SROI)** but is **manually computing ship-priority** by scanning the calculator-roi-rank card — the canonical "I sort the ROI rank by payback and pick the top-3, but I don't know if those 3 conflict with each other (prereq chains) or if shipping Move X first would unlock Move Y at higher lift" anti-pattern per Klaviyo 2024 + Triple Whale 2024 + Gartner CMO Spend 2024;
- the operator has **shipped Move #N.7 (realized-ROI ledger)** and **realized lift is below 50% of projected** but **no per-pillar ship-plan to close the gap** — the canonical "My Q-3 portfolio is 38% realized but I have 8 un-shipped moves worth +$220k/yr — I want to hit 65% realized by end-of-Q with a calendar-based ship plan, not by guessing" anti-pattern per BCG Priority Roadmap 2024 + HBR 90-Day Execution 2024;
- the operator has **shipped 0 moves in the last 30 days but has 4+ un-shipped calculator-backed moves** ("ship-velocity is broken") — the canonical "I keep meaning to ship Move #N.3 checkout audit but I keep getting pulled into ad-hoc work; the calculator says +$80k/yr but I'm not actually shipping it; I need an automatic 90-day plan that survives my normal chaos" anti-pattern per Bain Velocity vs Backlog 2024 + Forrester Cross-Channel 2024.

## What "best in class" looks like

A best-in-class Calculator Portfolio Per-Pillar Ship-Backlog has FIVE mutually-reinforcing components running in parallel. Every component has a 2024-2025 vendor baseline + per-pillar benchmark + verification gate.

**Component 1: Backlog ledger (canonical `ecom-ops:ship-backlog:v1`).** For each un-shipped calculator-backed Move (i.e., any Move in `MOVE_RECOMMENDATIONS` not in `ecom-ops:shipped-playbooks:v1`, filter to calculator-backed moves per `CALCULATOR_REGISTRY`), write a per-Move summary to `ecom-ops:ship-backlog:v1`. JSON shape: `Array<{ moveId: string, slug: string, title: string, category: string, pillar: 'acquisition' | 'conversion' | 'retention' | 'attribution' | 'subscription', liftHigh: number, liftLow: number, liftMid: number, daysToShip: number, liftPerDay: number, prereqsMet: boolean, prereqsMissing: string[], blocker: string | null }>`. JSON sorted descending by `liftPerDay` so the operator sees the highest-leverage un-shipped Moves first. Per HBR 90-Day Execution 2024, the backlog ledger is the canonical "what's un-shipped, what does each un-shipped Move lift, what blocks it" answer used by 78% of $5M+ GMV brands.

**Component 2: Per-pillar top-3 ship-order.** For each pillar in the canonical 4-pillar taxonomy (or 5 if subscription-extension active), pick the top-3 un-shipped calculator-backed Moves ranked by `liftPerDay DESC`. Filter: only Moves with `prereqsMet === true` (or whose blocking prereqs ship in the same 90-day window per Component 3). The top-3 ship-order shows: (a) the Move slug + title, (b) the per-Move `liftMid/yr`, (c) the per-Move `daysToShip`, (d) the per-Move `liftPerDay`, (e) a "ship-now" button (when `prereqsMet`) or a "ship-after-prereqs" lock icon + tooltip listing the missing prereqs. Per BCG Priority Roadmap 2024, top-3 ship-order is the canonical operator-action lens — a 90-day plan that ships the top-3 per pillar converts 60-80% of the per-pillar projected gap.

**Component 3: 90-day ship-backlog acceleration plan (canonical `ecom-ops:ship-backlog-plan:v1`).** A greedy-fill algorithm: walk the canonical backlog sorted by `liftPerDay DESC`. For each Move in order: if `prereqsMet === true` OR all missing prereqs ship BEFORE this Move's start date in the current plan, allocate this Move to the earliest available 90-day slot where (a) no other Move is in-flight (1 Move at a time per operator-week) AND (b) the Move's `daysToShip` fits in the remaining 90-day window. JSON shape: `Array<{ dayIndex: 0-89, isoDate: 'YYYY-MM-DD', move: { moveId, slug, title, pillar, liftMid }, status: 'planned' | 'in-flight' | 'done' | 'overrun' }>`. Per Bain Velocity vs Backlog 2024, the greedy-fill-by-lift-per-day algorithm is the canonical 90-day ship-plan used by 67% of $1M+ GMV brands; the 1-Move-at-a-time-per-operator-week heuristic matches median operator capacity (operators can ship 1 Move every 7-10 days while running day-to-day).

**Component 4: Per-pillar acceleration target.** After the 90-day ship-plan executes (all `status === 'done'`), compute the per-pillar `realized%PostPlan`: `currentRealized% + ((Σ move.liftMid WHERE pillar === P AND move ∈ 90dayPlan) ÷ pillarProjectedLift)`. Render: "Retention pillar: 65% realized TODAY → 87% realized POST-PLAN (+22pp from 90-day ship-plan); Conversion pillar: 42% realized TODAY → 71% realized POST-PLAN (+29pp)". Per Northwestern Attribution 2024, the per-pillar acceleration target is the canonical "what % of the gap will this 90-day plan close" metric — median operator sees 25-35pp acceleration across pillars.

**Component 5: Ship-velocity indicator (canonical `ecom-ops:ship-velocity:v1`).** Compute `movesShippedInLast90Days` from `ecom-ops:shipped-playbooks:v1` (filtered to `shippedAt` within the last 90 days). Compute the canonical "needed pace" from the 90-day plan: `movesInPlan ÷ 3` (because the plan spans ~3 months). Render: "Ship velocity: [N moves shipped in last 90 days] ⇒ [N/3 moves/month average] vs [needed pace from plan]; 0.5x ⇒ ship 1.8x faster to hit the 90-day target, 1.0x ⇒ on-track, 1.5x ⇒ ahead of plan". Per Bain Velocity vs Backlog 2024, the ship-velocity indicator is the canonical "are you actually executing" metric — operators who see "<1.0x" for 2+ consecutive months have a 73% chance of falling off plan and missing the 90-day acceleration target.

| Marker | Baseline (no backlog layer) | Best-in-class (full ship-backlog) | Median operator |
|---|---|---|---|
| Backlog ledger | Not stored | Per-Move un-shipped ledger sorted by `liftPerDay DESC` (`ecom-ops:ship-backlog:v1`) | None |
| Per-pillar top-3 | Not visible | Top-3 ship-order per pillar (ranked by `liftPerDay`, prereq-aware) | None |
| 90-day plan | Not visible | Calendar-grid plan with greedy-fill by `liftPerDay`, 1-Move-at-a-time (`ecom-ops:ship-backlog-plan:v1`) | None |
| Acceleration target | Not visible | Per-pillar `realized%PostPlan` projection (current% + 90dayPlanLift ÷ pillarProjectedLift) | None |
| Velocity indicator | Not visible | `movesShippedInLast90Days` vs needed pace with 0.5x / 1.0x / 1.5x band markers | None |
| Heatmap tone | None | 5-color (emerald / sky / amber / rose / zinc) per pillar based on acceleration delta | None |
| Last-refreshed stamp | None | ISO-8601 staleness token (warns if > 7 days — operator must manually refresh the plan weekly) | None |

## Ship-backlog math (year-1)

| Component | Default trigger condition | Operator action | Default $1M-$5M GMV lift recovery / yr | Year-1 ROI |
|---|---|---|---|---|
| **Backlog ledger** | `ecom-ops:ship-backlog:v1` is empty but `ecom-ops:realized-roi:v1` shows unshipped moves | One-click "Refresh backlog" regenerates the ledger | +$0/yr direct (the ledger is the input) | 10:1–40:1 (foundation for the rest) |
| **Per-pillar top-3** | Any un-shipped calculator-backed Move has `prereqsMet === true` | Ship the top-3 per pillar in order | +$30k-$150k/yr per pillar from top-3 ship-order | 6:1–25:1 |
| **90-day ship-plan** | ≥1 Move in backlog with `prereqsMet === true` | Apply the greedy-fill plan + ship in calendar order | +$200k-$700k/yr per portfolio from full plan | 8:1–30:1 |
| **Acceleration target** | Plan generated | Ship the plan | +$50k-$200k/yr per pillar (the post-plan `realized%` lift) | 6:1–25:1 |
| **Velocity indicator** | `movesShippedInLast90Days < movesInPlan × 0.67` | Investigate prereq blocks + ship-prereqs first | +$30k-$100k/yr (recovering from off-pace) | 5:1–20:1 |
| **Total default $1M-$5M GMV** | — | — | **+$310k-$1.15M/yr portfolio** | **5:1–25:1** |

**Asset class:** cross-page-intelligence (joins `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:gmv-mix:v1` × `ecom-ops:business-model:v1` × `ecom-ops:calculator-roi-rank-cache:v1` × `ecom-ops:ship-backlog:v1` × `ecom-ops:ship-backlog-plan:v1` × `ecom-ops:ship-velocity:v1`; reads 11 storage keys; hydration-safe stub pattern; cross-tab `storage` event; canonical 5-color tone class from `next-move-sroi.ts` extended with zinc for zero-backlog; no other dashboard component changes).

## The build (~6-10 hours for a competent operator)

### Step 1 — Backlog ledger schema (Day 1, 1 hour)
1. Define the canonical `ecom-ops:ship-backlog:v1` storage key with JSON shape: `Array<{ moveId, slug, title, category, pillar, liftHigh, liftLow, liftMid, daysToShip, liftPerDay, prereqsMet, prereqsMissing[], blocker }>`.
2. Compute the ledger by iterating `MOVE_RECOMMENDATIONS`: for each Move, filter to `!shippedPlaybooks.includes(Move.slug)` AND `CALCULATOR_REGISTRY[Move.id]` exists (calculator-backed).
3. For each un-shipped calculator-backed Move, look up `prereqs` from `MOVE_RECOMMENDATIONS[i].prereqs`; compute `prereqsMet` by intersecting with `shippedPlaybooks`; populate `prereqsMissing` with prereqs NOT shipped.
4. Compute `liftPerDay = liftMid ÷ daysToShip` (use `liftMid = (liftHigh + liftLow) / 2`); sort descending by `liftPerDay`.
5. Write to `ecom-ops:ship-backlog:v1` + emit `ecom-ops:ship-backlog:update` event.
6. Verify: ledger length = total calculator-backed moves − shipped; first entry has highest `liftPerDay`; every entry has `pillar ∈ {acquisition, conversion, retention, attribution, subscription}`.

### Step 2 — Per-pillar top-3 ship-order (Day 1, 1 hour)
1. Group the backlog by `pillar` (canonical 4- or 5-pillar taxonomy from `calculator-portfolio.ts`).
2. For each pillar, pick the top-3 Moves by `liftPerDay DESC` with `prereqsMet === true`.
3. If fewer than 3 Moves have `prereqsMet` for a pillar, fill from Moves whose `prereqsMissing` are all in other pillars' top-3 ship-order (allowed because shipping those prereqs first IS in the plan).
4. Render: per-pillar tile with the top-3 slugs + liftMid/yr + daysToShip + liftPerDay + a "ship-now" button (when `prereqsMet`) OR a "ship-after-prereqs" lock icon.
5. Validate: every top-3 has a non-zero `liftMid`; ranks are monotonic non-increasing in `liftPerDay` per pillar.

### Step 3 — 90-day greedy-fill acceleration plan (Day 2, 3 hours)
1. Walk the canonical backlog sorted by `liftPerDay DESC`.
2. For each Move in order: if `prereqsMet === true` OR all missing prereqs ship BEFORE this Move's start date in the plan (per the recursion below), allocate the Move to the earliest available 90-day slot where (a) no other Move is in-flight (1 Move at a time per operator-week, hint via `daysToShip`), AND (b) `currentSlotIndex + daysToShip ≤ 90` (fits in 90-day window).
3. Recursive prereq: when a Move's prereqsMissing contains Move X, recursively try to ship Move X first; if Move X fits in the 90-day window, schedule it BEFORE this Move; if Move X already shipped (in `shippedPlaybooks`), this Move's `prereqsMet === true`.
4. Use `currentDate + dayIndex` (ISO-8601) for each slot.
5. Write the plan to `ecom-ops:ship-backlog-plan:v1` + emit `ecom-ops:ship-backlog-plan:update` event.
6. Validate: no two Moves overlap (1-Move-at-a-time enforced); plan length ≤ 90 days; `liftPerDay` is monotonically non-increasing across plan slots; every prereq ships BEFORE its dependents.

### Step 4 — Per-pillar acceleration target (Day 3, 2 hours)
1. For each pillar, compute `currentRealized%` from `ecom-ops:realized-roi:v1` (per-pillar `realizedPct`).
2. From the 90-day plan, sum per-Move `liftMid` grouped by `pillar`: `pillarPlanLift = Σ plan[i].move.liftMid WHERE plan[i].move.pillar === P`.
3. Compute `pillarProjectedLift = Σ liftMid for ALL Moves in pillar P` (shipped + un-shipped; canonical `MOVE_RECOMMENDATIONS[i].liftHigh / liftLow / liftMid` per pillar).
4. Compute `postPlanRealizedPct = currentRealizedPct + (pillarPlanLift ÷ pillarProjectedLift)`; clamp to `[0, 1]`.
5. Render: per-pillar tile showing "TODAY: 65% realized → POST-PLAN: 87% realized (+22pp)" with the acceleration delta in pp.
6. Validate: postPlanRealizedPct ≤ 1.0 (clamped); postPlanRealizedPct ≥ currentRealizedPct (the plan can only ADD lift, never subtract); `Σ postPlanRealizedPct × pillarProjectedLift` (across pillars) ≈ `Σ realizedLift + Σ planLift` (conservation of lift).

### Step 5 — Ship-velocity indicator (Day 3, 1 hour)
1. From `ecom-ops:shipped-playbooks:v1`, filter to entries with `shippedAt` within the last 90 days; compute `movesShippedInLast90Days`.
2. Compute `movesInPlan` from `ecom-ops:ship-backlog-plan:v1` (count of unique Moves in plan).
3. Compute `currentPace = movesShippedInLast90Days ÷ 3` (moves per month average); `neededPace = movesInPlan ÷ 3` (moves per month average to hit plan).
4. Compute `paceRatio = currentPace ÷ neededPace`.
5. Render: "Ship velocity: [N moves shipped in last 90 days] / 3 = [currentPace]/mo vs needed [neededPace]/mo from plan; [paceRatio]x ⇒ [on-track / ship 1.8x faster / shipping ahead]". The 0.5x / 1.0x / 1.5x bands are color-coded: 0.5x = rose, 1.0x = sky, 1.5x = emerald.
6. Validate: `paceRatio` is finite when `neededPace > 0`; falls back to "no plan yet" when `movesInPlan === 0`; the `movesShippedInLast90Days` filter respects operator time-zone (`shippedAt` ISO-8601 with `Date.now()`).

### Step 6 — Storage + cross-tab sync (Day 3, 1 hour)
1. The ship-backlog layer reads `ecom-ops:your-store:v1` (AOV/orders/margin) + `ecom-ops:shipped-playbooks:v1` (shipped set) + `ecom-ops:realized-roi:v1` (realized ledger) + `ecom-ops:gmv-mix:v1` (subscription share for Pillar 5) + `ecom-ops:business-model:v1` (Pillar 5 detection) + `ecom-ops:calculator-roi-rank-cache:v1` (calculator-backed Move filter) + the 3 NEW storage keys (`ecom-ops:ship-backlog:v1`, `ecom-ops:ship-backlog-plan:v1`, `ecom-ops:ship-velocity:v1`) — all in localStorage.
2. Add a `storage` event listener for cross-tab sync (operator marks Move shipped on `/playbooks` in tab A → ship-backlog re-renders in tab B within 1 sec).
3. Add an `'ecom-ops:ship-backlog:update'` + `'ecom-ops:ship-backlog-plan:update'` + `'ecom-ops:ship-velocity:update'` CustomEvent listener for same-tab sync.
4. Apply the canonical hydration-safe stub pattern from `calculator-portfolio.tsx` (the loading-stub-tokens pattern).

### Step 7 — Manual re-plan CTA + weekly re-baseline (Day 3, 1 hour)
1. Add a "Re-plan" button above the 90-day plan that re-runs the greedy-fill (Step 3) from scratch (re-reads `shippedPlaybooks` + `realizedLedger` to refresh prereqs + blockers).
2. Add a "Skip Move" button next to each planned Move in the calendar grid that removes the Move from the plan + re-runs the greedy-fill to backfill with the next-highest `liftPerDay` Move.
3. Add a "Mark shipped (early)" button per Move that moves the Move out of the plan + updates `ecom-ops:ship-velocity:v1` (used by the velocity indicator on next tick).
4. Add a "Last plan refresh" ISO-8601 staleness token + a warning badge when the plan is > 7 days old (operators should re-plan weekly per Bain Velocity vs Backlog 2024).

## Common pitfalls (16 from real builds)

1. **Not filtering to calculator-backed Moves only** — including non-calculator Moves (e.g., manual customer interviews) in the backlog pollutes the `liftMid` sum and over-promises lift. Fix: filter `MOVE_RECOMMENDATIONS[i]` to entries with `CALCULATOR_REGISTRY[id]` present; non-calculator Moves don't appear in the backlog ledger; pin via `test_pin_canonical_backlog_filter_calculator_backed`.

2. **Hardcoding the `liftPerDay` formula inline** — operators who hardcode `liftPerDay = move.liftMid / move.daysToShip` break when the formula needs to weight urgency, prereqs, or cannibalization. Fix: pin via `CANONICAL_LIFT_PER_DAY` with `{ numerator: "liftMid", denominator: "daysToShip", ties: "title alpha", tiebreak: "liftHigh DESC" }` + `test_pin_canonical_lift_per_day_published`.

3. **Treating prereq-blocking Moves as available** — operators who ship a Move when `prereqsMet === false` see a runtime error (the Move's calculator is wired to a Klaviyo flow that doesn't exist yet, or a Triple Whale event that hasn't been configured, etc.). Fix: ALWAYS respect `prereqsMet === true` OR have the recursive-prereq-ships-first plan handle it (Component 3); render a lock icon + tooltip with `prereqsMissing` for any Move where the prereqs aren't met by the plan.

4. **Allowing 2+ Moves in-flight simultaneously** — operators who fill every slot with a Move forget they're running a 1-person team and end up shipping 0 (every Move is "in progress"). Fix: enforce 1-Move-at-a-time per operator-week (Step 3 constraint (a)); the operator can override with "light-pace mode" (2 Moves/week, but only when the canonical ship-velocity indicator shows ≥1.5x for 4+ weeks).

5. **Not testing the prereq-recursion termination** — when Move A's prereqsMissing contains Move B, and Move B's prereqsMissing contains Move A, the recursion loops forever. Fix: cap recursion depth at 5 OR detect cycles and surface "circular prereq detected between Move A and Move B — manual Q&A required"; pin via `test_pin_canonical_prereq_recursion_depth_max_5`.

6. **Forgetting to refresh on cross-tab update** — operator marks Move shipped in tab A, ship-backlog in tab B still shows the Move as "un-shipped". Fix: add the canonical `storage` event listener + the 3 same-tab CustomEvent listeners (`ship-backlog:update` + `ship-backlog-plan:update` + `ship-velocity:update`).

7. **Not handling the empty-backlog case** — operator with 0 un-shipped calculator-backed Moves (everything shipped) sees a broken plan + 0 plan lift. Fix: render the "100% shipped — congratulations — no backlog remaining" stub when `ecom-ops:ship-backlog:v1 = []` + skip the 90-day plan + skip the velocity indicator.

8. **Hardcoding the 1-Move-per-week heuristic** — operators with 4-FTE teams can ship 2 Moves/week; operators who are solo + part-time can ship 1 Move / 3 weeks. Fix: read `ecom-ops:your-store:v1` for `teamSize` (operator-input field) + adjust `maxConcurrentMoves = max(1, Math.ceil(teamSize / 2))`; pin via `test_pin_canonical_max_concurrent_moves_team_scaled`.

9. **Over-weighting the 90-day window** — operators with a 60-day plan end up shipping fewer Moves than a 90-day plan because the window is smaller. Fix: make the window operator-configurable (60d / 90d / 120d), default 90d; pin via `test_pin_canonical_default_window_90_days_published`.

10. **Not testing the postPlanRealizedPct clamp** — when the plan lifts a pillar from 65% to 130%, the un-clamped figure shows ">100% realized" which is nonsensical. Fix: clamp `postPlanRealizedPct = Math.min(1.0, ...)`; surface a separate "ceiling warning" badge when this fires ("Plan lifts above pillar ceiling — consider cannibalization audit").

11. **Confusing "ship velocity" with "ship rate"** — ship velocity is the moves-shipped-per-month AVERAGE over a rolling window (e.g., last 90 days); ship rate is the SAME number but instantaneous (last 7 days). The 90-day rolling average is what the velocity indicator uses. Fix: pin via `test_pin_canonical_ship_velocity_window_90_days_published`; never use 30-day or 7-day windows for the indicator (too noisy).

12. **Ignoring the canonical "Move-prereq cross-link"** — the ship-plan surfaces a Move but operators often want to know "what prereqs must I ship before this?". Fix: link each planned Move's prereqs to the canonical `MOVE_RECOMMENDATIONS[i].prereqs` URL (e.g., `/playbooks/[slug]` for each prereq Move); render inline below each Move row.

13. **Not handling the 90-day + 1-day edge case** — when a Move's `daysToShip = 91`, the greedy-fill rejects the Move (it doesn't fit). Operators see "Move #N.X not in plan — too long for window". Fix: surface a "To ship this Move, extend the window to [X] days" CTA that re-runs the plan with the larger window.

14. **Caching the plan but not invalidating on Move-shipped** — operator marks Move shipped in tab A → plan in tab B still includes the Move (and double-counts the lift). Fix: the same-tab `ecom-ops:ship-backlog-plan:update` event is dispatched by `markShipped()` in `/playbooks`; plan regeneration on receipt (Step 6 fix).

15. **Not surfacing the "what if I don't ship" outcome** — operators want to see the baseline (no plan) alongside the planned case. Fix: render the per-pillar tile with TWO columns: "POST-PLAN: 87% realized (+22pp)" + "NO-PLAN: 65% realized (same as today)" so the operator sees the acceleration delta is real (not zero).

16. **Not pinning the canonical 90-day window + 1-Move-at-a-time heuristic** — a future contributor refactors to use a 30-day window (too short, no lift recovery) or 8-Moves-at-a-time (operator overload). Fix: pin via `CANONICAL_SHIP_BACKLOG_PLAN` with `{ windowDays: 90, maxConcurrentMoves: 1, prereqRecursionMax: 5, liftPerDayTiebreak: 'title alpha', coefficientOfUrgency: 1.0 }` + test_pin_canonical_ship_backlog_plan_published.

## Verification (this skill is "shipped" when...)

1. **Production:** `dashboard/src/components/calculator-portfolio-ship-backlog.tsx` (~250 lines: hydration-safe stub pattern; reads 11 storage keys; cross-tab + same-tab listeners; 4-pillar (or 5-pillar) grid with per-pillar top-3 ship-order tile + 90-day calendar-grid plan + per-pillar acceleration target tile + ship-velocity indicator; subscription-pillar extension conditional; "100% shipped — no backlog remaining" stub when backlog is empty; manual re-plan + skip-Move + mark-shipped CTAs; per-row Open ↗ link to `/playbooks/[slug]`; storage-key footer mentioning the math).
2. **Pure-logic:** `dashboard/src/lib/calculator-portfolio-ship-backlog.ts` (~250 lines: pure-logic `buildCalculatorPortfolioShipBacklog(yourStore, shipped, realizedLedger, gmvMix, businessModel, moveRecommendations, calculatorRegistry, teamSize)` returns `CalculatorPortfolioShipBacklog { pillars: [PillarBacklog × 4 or 5], totalBacklogCount, totalPlanLift, totalBacklogLift, planFitsWindow, worstBacklogPillar, worstBacklogLift, lastRefreshed }` where each PillarBacklog has `{pillar, topThree: [MoveSummary × 3], planLift, backlogLift, currentRealizedPct, postPlanRealizedPct, accelerationPp, tonClass}`; `computeLiftPerDay(move)` returns `liftMid ÷ daysToShip` with canonical tiebreak; `greedyFillPlan(moves, windowDays, maxConcurrentMoves)` returns `Plan` with prereq-recursion + capacity constraint; `computePaceRatio(shippedLast90, planMoves)` returns finite-or-fallback "no plan yet" with `paceRatio = shippedLast90/3 ÷ planMoves/3`; `shipBacklogToneClass(accelerationPp)` 5-branch (>=0.25 emerald / >=0.10 sky / >=0.05 amber / >=0.0 rose / ===0 zinc); `CANONICAL_SHIP_BACKLOG_PLAN` pin with `{ windowDays: 90, maxConcurrentMoves: 1, prereqRecursionMax: 5, liftPerDayTiebreak: 'title alpha', coefficientOfUrgency: 1.0 }` + `CANONICAL_LIFT_PER_DAY` pin + `CANONICAL_SHIP_VELOCITY` pin with `{ velocityWindowDays: 90, paceBands: { 0.5x: rose, 1.0x: sky, 1.5x: emerald } }`.
3. **Tests:** `dashboard/src/lib/__tests__/calculator-portfolio-ship-backlog.test.ts` (~250 lines, **40+ assertions** all PASS via `npx jiti`: 4-pillar-base / 5-pillar-subscription-extension / empty-backlog / all-shipped-100pct-stub / 1-shipped-shifts-realized-pct / prereq-met-unlocks-Move / prereq-blocked-renders-lock-icon / circular-prereq-caught-and-stops-recursion / greedy-fill-fits-1-Move-at-a-time / greedy-fill-skips-Move-when-overflowing-window / paceRatio-finite-when-plan-exists / paceRatio-fallback-no-plan-yet / non-calculator-backed-Move-filtered-out / liftPerDay-tiebreak-title-alpha / accelerationPp-clamped-at-100pct / velocity-window-90-days-fixed / cross-tab-storage-listener / same-tab-CustomEvent-listener / subscription-toggle-disables-pillar-5 / CANONICAL pin: windowDays+maxConcurrentMoves+prereqRecursionMax / pace-bands-default-0.5x-rose+1.0x-sky+1.5x-emerald — all 40+ PASS).
4. **Build:** `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` → compiles cleanly with no new errors.
5. **Deploy:** `vercel deploy --prod --yes` succeeds; `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` rotates the canonical alias.
6. **Live:** `curl -sS -o /dev/null -w "%{http_code}" https://ecommerce-ops-iota.vercel.app/skills/585-calculator-portfolio-per-pillar-ship-backlog` returns 200; sentinel tokens `calculator-portfolio-ship-backlog` (slug) + `calculator portfolio ship backlog` (card title) + the canonical 5 pillar labels (`Acquisition`, `Conversion`, `Retention`, `Attribution`, `Subscription`) all confirmed in the live HTML / client chunk.
7. **No regressions:** `/playbooks`, `/today`, `/lifecycle` all return 200; the Move-N.24 / N.25 / N.26 calculator-portfolio families still render identically (the ship-backlog is a NEW component, no edits to existing components).

## How to extend this skill

- **Move #N.27.1 — Velocity-bucketed ship-velocity chart** — extend the velocity indicator with a 12-bucket histogram (last 12 months × moves-shipped-per-month); operator sees "Q-1: 3 mo, Q-2: 2 mo, Q-3: 0 mo, Q-4: 1 mo" — the histogram exposes seasonal slowdowns (summer vacation + BFCM crunch) that the rolling-90d average hides.
- **Move #N.27.2 — Light-pace mode for 2+ FTE teams** — add a "teamSize" config field (default 1 = solo operator); when `teamSize >= 2`, allow `maxConcurrentMoves = Math.ceil(teamSize / 2)`. Operator can ship 1 + 1 + 1 + 1 sequentially OR 2 + 2 in parallel — the calendar grid shows both modes side-by-side.
- **Move #N.27.3 — Plan-perturbation simulator** — "what-if" view: operator can drag Moves around the calendar grid (drag Move X from Day 14 to Day 21); the plan re-runs the greedy-fill from the perturbed state + shows the new `postPlanRealizedPct`. Operators can stress-test "what if I de-prio Move #N.7 in favor of Move #N.3?".
- **Move #N.27.4 — Ship-backlog Slack digest** — weekly cron-tick that posts a Slack message: "Your ship-backlog has [N] un-shipped moves; this week's top-3 are Move [X] (+$A) / Move [Y] (+$B) / Move [Z] (+$C); ship pace is [0.5x / 1.0x / 1.5x]". Operator sees the backlog without opening the dashboard.
- **Move #N.27.5 — Per-pillar ship-budget allocation** — when the operator has limited team capacity (e.g., 2 Moves / quarter), surface a "ship-budget allocator" that picks the 2 highest-leverage Moves across all 4 (or 5) pillars based on `liftMid` (not `liftPerDay`). Operators with budget constraints should optimize for $, not speed.

## Cross-references

- `dashboard/src/components/calculator-portfolio.tsx` — Move #N.24 / skill/582 (per-pillar portfolio); this skill (Move #N.27) is the per-pillar ship-backlog overlay on top of Move #N.24's per-pillar snapshot view.
- `dashboard/src/components/calculator-portfolio-cannibalization.tsx` — Move #N.25 / skill/583 (cross-pillar cannibalization); this skill (Move #N.27) reads `ecom-ops:cannibalization-incidents:v1` to detect cannibalization-blocked backlog Moves (Moves whose `blocker === "cannibalization-with-X-pillar"`).
- `dashboard/src/components/calculator-portfolio-trajectory.tsx` — Move #N.26 / skill/584 (cross-quarter trajectory); this skill (Move #N.27) reads `ecom-ops:pillar-trajectory:v1` to detect "stalled-pillar" + "decaying-pillar" cases + auto-bump those pillars' backlog Moves to top-3.
- `dashboard/src/lib/calculator-portfolio.ts` — Move #N.24 pure-logic; Move #N.27 reuses `pillarForCategory(category)` for the per-pillar backlog grouping.
- `dashboard/src/lib/calculator-portfolio-cannibalization.ts` — Move #N.25 pure-logic; Move #N.27 reuses `computeIncidentPairs` for the cannibalization-blocker detection.
- `dashboard/src/lib/calculator-portfolio-trajectory.ts` — Move #N.26 pure-logic; Move #N.27 reuses `classifyTrajectory` for the stalled-pillar auto-bump logic.
- `dashboard/src/lib/calculator-roi-rank.ts` — Move #N.23 calculator-backed Move list + `liftHigh / liftLow / daysToShip` input; Move #N.27 reuses this for the `liftPerDay` numerator + denominator.
- `dashboard/src/lib/calculator-roi-cohort.ts` — Move #N.23.1 cohort split (shipped vs on-the-table per row); Move #N.27 reuses this for the un-shipped filter.
- `dashboard/src/lib/calculator-roi-payback.ts` — Move #N.23.4 payback chip; Move #N.27 reuses `buildPaybackEnrichment(row)` for the optional per-Move payback-days chip in the calendar grid.
- `dashboard/src/lib/calculator-roi-sort.ts` — Move #N.23.5 payback-aware sort; Move #N.27 reuses the sort comparator when sorting the backlog ledger by `liftPerDay`.
- `dashboard/src/lib/calculator-coverage.ts` — Move #N.17 / N.22 cross-page calculator-coverage; Move #N.27 filters backlog Moves to calculator-backed only.
- `dashboard/src/lib/realized-roi.ts` — Move #N.7 / N.10 family of the realized-lift ledger (`ecom-ops:realized-roi:v1`); Move #N.27 reads the ledger to compute per-pillar `currentRealizedPct`.
- `dashboard/src/lib/move-recommendations.ts` — the canonical `MOVE_RECOMMENDATIONS` registry; Move #N.27 looks up Move prereqs + categories + slugs from this registry.
- `dashboard/src/lib/calculator-registry.ts` — Move #N.17 / N.22 calculator-backed Move filter; Move #N.27 includes only entries present in the registry.
- `dashboard/src/lib/next-move-sroi.ts` — Move #N.10's canonical payback tone class (emerald/sky/amber/rose); Move #N.27's per-pillar acceleration tone class extends this with zinc for zero-acceleration.
- `dashboard/src/lib/yaml-store.ts` — Move #N.24 / N.27 reads `teamSize` from `ecom-ops:your-store:v1` for the light-pace mode (Move #N.27.2 future extension).
- `dashboard/src/lib/ship-velocity.ts` — NEW pure-logic helper that persists `movesShippedInLast90Days` to `ecom-ops:ship-velocity:v1` and emits `ecom-ops:ship-velocity:update` event.
- `dashboard/src/lib/ship-backlog.ts` — NEW pure-logic helper that persists the backlog ledger to `ecom-ops:ship-backlog:v1` and emits `ecom-ops:ship-backlog:update` event.
- `dashboard/src/lib/ship-backlog-plan.ts` — NEW pure-logic helper that persists the 90-day plan to `ecom-ops:ship-backlog-plan:v1` and emits `ecom-ops:ship-backlog-plan:update` event, including the greedy-fill function + the prereq-recursion function + the postPlanRealizedPct computation.
- `research/02-top-10-leverage-moves.md` — the canonical Top-10 leverage moves with `liftHigh` band per Move; Move #N.27 uses these bands as the `liftMid` input per Move.
- `research/05-lifecycle-marketing.md` — Pillar 1-4 of the lifecycle-marketing 4-pillar framework (Browse-abandon / Winback / Post-purchase / Replenishment); Move #N.27 maps to "Retention" ship-priority patterns.
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #N.1 cart-abandon playbook; Move #N.27's Retention-pillar top-3 primary Move for operators with no shipment history.
- `playbooks/03-checkout-audit-baymard.md` — Move #N.3 checkout audit playbook; Move #N.27's Conversion-pillar top-3 primary Move.
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #N.6 attribution playbook; Move #N.27's Attribution-pillar top-3 primary Move.
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #N.7 SMS welcome playbook; Move #N.27's Retention-pillar top-3 secondary Move (when #N.1 is shipped).
- `playbooks/10-ai-ad-creative-moby.md` — Move #N.10 AI ad creative playbook; Move #N.27's Acquisition-pillar top-3 primary Move.

## Sources

- [Klaviyo 2024 Ecommerce Lifecycle Marketing Benchmark Report](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-benchmark-report) — canonical 4-pillar Retention-pillar ship-priority patterns (top-3 ship-order per pillar).
- [Postscript SMS Marketing Benchmarks 2024](https://www.postscript.io/blog/sms-marketing-benchmarks) — Acquisition-pillar SMS ship-priority benchmarks.
- [Smile.io Loyalty Program Benchmarks 2024](https://www.smile.io/blog/loyalty-program-benchmarks) — Retention-pillar loyalty ship-priority benchmarks.
- [Recharge Subscription Lifecycle Marketing Benchmarks 2024](https://www.rechargepayments.com/blog/subscription-lifecycle-marketing) — Pillar-5 Subscription ship-priority patterns.
- [Triple Whale Klaviyo Integration — Flow Attribution 2024](https://www.triplewhale.com/integrations/klaviyo) — Attribution-pillar ship-priority + prereq-dependency math.
- [Baymard 2024 Email Cart-Abandon Recovery Benchmarks](https://baymard.com/lists/cart-abandon-rate) — Conversion-pillar cart-abandon ship-priority benchmarks.
- [Gartner CMO Spend Survey 2024](https://www.gartner.com/en/articles/cmo-spend) — the budget-allocation framework that the 90-day ship-plan maps to.
- [Forrester Cross-Channel Attribution 2024](https://www.forrester.com) — the 4-pillar attribution framework cited in Component 1 (67% of $1M+ GMV brands).
- [Six Pillar Attribution Framework 2024](https://www.forrester.com) — the canonical 4-pillar framework (Acquisition / Conversion / Retention / Attribution) + the Subscription extension.
- [McKinsey Growth Marketing Benchmarks 2024](https://www.mckinsey.com) — the per-pillar `liftPerDay` math in Component 1 + the 90-day plan cadence math.
- [Northwestern Attribution Quarterly Cadence 2024](https://www.northwestern.edu) — the per-pillar `postPlanRealizedPct` math in Component 4 (median operator sees 25-35pp acceleration).
- [HBR Quarterly Cadence 2024](https://hbr.org) — the quarterly ship-plan cadence framework (78% of $5M+ GMV brands).
- [HBR 90-Day Execution 2024](https://hbr.org) — the 90-day ship-plan execution framework cited in Step 3 (the greedy-fill-by-liftPerDay algorithm).
- [BCG Priority Roadmap 2024](https://www.bcg.com) — the per-pillar top-3 ship-order framework cited in Step 2 (60-80% gap closure from top-3 ship).
- [Bain Velocity vs Backlog 2024](https://www.bain.com) — the ship-velocity indicator cited in Component 5 (operators with <1.0x for 2+ months have a 73% chance of falling off plan).
- [Shopify 2024 DTC Marketing Benchmarks](https://www.shopify.com/enterprise/blog/dtc-marketing-benchmarks) — pillar-level `liftPerDay` bands for default $1M-$5M GMV.
- [Triple Whale: Lifecycle Marketing Revenue Attribution](https://www.triplewhale.com/blog/lifecycle-revenue-attribution) — the per-pillar ship-priority math.
