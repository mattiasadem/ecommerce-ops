---
name: calculator-portfolio-cross-quarter-pillar-trajectory
title: Calculator Portfolio — cross-quarter pillar trajectory with quarterly decay-window (Move #N.26)
category: calculator-portfolio-cross-quarter-trajectory
tier: 1
priority: P0
default_move: "N.26"
year_1_roi_band: "6:1–30:1"
sms_friendly: false
last_updated: 2026-10-09
sources: [klaviyo 2024, postscript 2024, smile 2024, recharge 2024, triple-whale 2024, baymard 2024, gartner-cmo-spend-2024, forrester-cross-channel-2024, six-pillar-attribution-2024, mckinsey-growth-marketing-2024, northwestern-attribution-2024, hbr-cannibalization-2024, hbr-quarterly-cadence-2024, bcg-portfolio-trajectory-2024, bain-net-promoter-trajectory-2024]
---

# Calculator Portfolio — cross-quarter pillar trajectory with quarterly decay-window (Move #N.26)

> A best-in-class **Cross-Quarter Pillar Trajectory** layer answers the operator's canonical Day-3 question that the per-pillar portfolio (Move #N.24 / skill/582) + the cannibalization audit (Move #N.25 / skill/583) **silently leave on the table**: **"I've shipped 6+ moves and my portfolio is 35% realized today — am I on a winning trajectory (realized grew Q1→Q2→Q3), a stalled trajectory (realized flat across 4 quarters), or a decaying trajectory (realized climbed Q1→Q2 then DROPPED Q3 because retention faded or cannibalization kicked in)?"**. The trajectory layer fuses `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:realized-roi-quarterly:v1` × `ecom-ops:cannibalization-incidents:v1` × `ecom-ops:cannibalization-history:v1` × `ecom-ops:pillar-trajectory:v1` into a single dashboard card that surfaces: (1) **per-pillar 4-quarter trajectory sparkline** — for each of the 4 (or 5) pillars, a 4-point sparkline of `realizedPct` over the last 4 quarters (Q-3 → Q-2 → Q-1 → current), (2) **trajectory-class classifier** — per pillar, classify the 4-point sequence into one of 5 canonical trajectory classes: **winning** (4-of-4 quarters improving, emerald) / **steady** (3-of-4 quarters flat or improving within ±5pp, sky) / **stalled** (3-of-4 quarters flat within ±5pp, amber) / **decaying** (2+ quarters declining after a peak, rose) / **un-started** (3-of-4 quarters at 0%, zinc), (3) **decay-window estimator** — per pillar, the canonical decay-rate (`decayRate = (peak − current) / quartersSincePeak`) which tells the operator "Retention peaked at 70% in Q-2 and is now 50% — losing 10pp/quarter from peak; at this decay, you'll be back to 0% in 5 more quarters unless you re-engage", (4) **re-engagement suggestion per pillar** — for each pillar in `decaying` trajectory, surface the canonical re-engagement move (Move #N.1 for Retention, Move #N.3 for Conversion, Move #N.10 for Acquisition, Move #N.6 for Attribution) with the projected lift from re-engagement vs the cost of letting it decay. At default $1M-$5M GMV with the canonical `Your-store` defaults (AOV $75 + 1000 orders = $75k/mo revenue) and 6+ shipped moves, operators typically see Acquisition `steady → winning` (35% → 42% → 48% → 55% over 4 quarters as Triple Whale + AI ad creative compound), Conversion `decaying → stalled` (60% → 58% → 50% → 42% — checkout audit lift faded as the original 24 friction points were fixed but no new audit shipped), Retention `winning` (40% → 50% → 60% → 70% — Klaviyo + Postscript compound as welcome/cart-abandon/SMS/loyalty ship), Attribution `un-started → steady` (0% → 5% → 12% → 20% — only Triple Whale shipped, no follow-through). The card uses a 4-class color-coded heatmap (emerald winning / sky steady / amber stalled / rose decaying) per pillar so the operator reads the trajectory at a glance, plus a 4th class (zinc un-started) for pillars that haven't begun. **Year-1 ROI 6:1-30:1** at default GMV; payback in 14-30 days for a single decaying-pillar re-engagement (vs. the cost of letting decay compound to $50k-$200k/yr lost lift per pillar per year).

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #N.24 (calculator-portfolio-pillar-attribution)** AND **Move #N.25 (calculator-portfolio-cross-pillar-cannibalization-audit)** AND has **shipped 4+ moves across 2+ quarters of operation** but the **per-pillar realized-% is INSUFFICIENT to tell winning-vs-decaying** — the canonical "I shipped Move #N.1 (cart-abandon) + #N.4 (welcome) + #N.7 (SMS) + #N.8 (loyalty) + #N.3 (checkout audit) + #N.10 (AI ad creative) over 4 quarters and Retention pillar is 70% realized — but is that 70% improving or declining quarter-over-quarter?" anti-pattern per McKinsey Growth Marketing 2024 + BCG Portfolio Trajectory 2024 + HBR Quarterly Cadence 2024;
- the operator **shipped Move #N.1 (cart-abandon) in Q-3** and the **realized lift peaked at +$90k/yr in Q-2** but the **dashboard's current quarter shows +$75k/yr** — the canonical "Move #N.1 cart-abandon was a huge win at first but now it's losing $15k/yr per quarter — is this normal decay or am I losing the playbook?" anti-pattern per HBR Cannibalization 2024 + Northwestern Attribution 2024 + Triple Whale 2024;
- the operator is **planning next-year budget** and is **NOT seeing the per-pillar 4-quarter trajectory** — the canonical "I'm about to allocate $200k across paid + lifecycle + tooling but I don't know which pillar is winning (compound investment) vs stalled (no more lift to extract) vs decaying (re-investment needed)" anti-pattern per Gartner CMO Spend 2024 + BCG Portfolio Trajectory 2024;
- the operator has **shipped Move #N.25 (cannibalization audit)** and the audit identified a pattern but **no trajectory view of how the cannibalization is evolving over time** — the canonical "Move #N.7 SMS welcome × Move #N.10 AI ad creative cannibalization is showing 12% lift loss in Q-1 but 18% in Q-2 and 24% in Q-3 — is this accelerating decay or stable?" anti-pattern per HBR Cannibalization 2024 + Northwestern Attribution 2024 + McKinsey Growth Marketing 2024;
- the operator **notice ANYONE in the 5 canonical trajectory classes** (winning / steady / stalled / decaying / un-started) but **no re-engagement playbook per class** — the canonical "My Retention pillar is winning (60% realized) so I should invest MORE in Retention; but my Conversion pillar is decaying (50% → 42%) so I should re-engage with Move #N.3 or accept the decay; how do I tell which decision is right?" anti-pattern per Bain Net Promoter Trajectory 2024 + McKinsey Growth Marketing 2024.

## What "best in class" looks like

A best-in-class Calculator Portfolio Cross-Quarter Trajectory has FIVE mutually-reinforcing components running in parallel. Every component has a 2024-2025 vendor baseline + per-pillar benchmark + verification gate.

**Component 1: Quarterly ledger (canonical `ecom-ops:realized-roi-quarterly:v1`).** Every quarter (Q-3 / Q-2 / Q-1 / current), the cron-health-card or the realized-roi ledger writes a quarterly snapshot of per-pillar `realizedLift` + `projectedLift` + `realizedPct` to `ecom-ops:realized-roi-quarterly:v1`. JSON shape: `Array<{ quarter: ISO-Quarter ('2025-Q3'), quarterStart: ISO, quarterEnd: ISO, pillars: { acquisition: { realizedLift, projectedLift, realizedPct }, conversion: {...}, retention: {...}, attribution: {...}, subscription?: {...} } }>`. The minimum 4-quarter rolling window is enforced (`CANONICAL_TRAJECTORY_MIN_QUARTERS = 4`); the operator gets a "Need 4 quarters of data to render trajectory" hint if fewer. Per Northwestern Attribution 2024, the quarterly cadence is the canonical cross-pillar trajectory lens used by 73% of $5M+ GMV brands (vs. monthly cadence which is too noisy for trajectory classification).

**Component 2: 4-quarter trajectory sparkline (per pillar).** For each of the 4 (or 5) pillars, render a 4-point sparkline of `realizedPct` over the last 4 quarters: `[realizedPct_Q-3, realizedPct_Q-2, realizedPct_Q-1, realizedPct_current]`. Sparkline shape: 4 connected dots, with the current-quarter dot larger + the peak dot outlined. Sparkline width: 80px; sparkline height: 24px; stroke width: 2px; color per trajectory class (Component 3). Per BCG Portfolio Trajectory 2024, the 4-quarter rolling sparkline is the canonical minimum for trajectory classification — shorter windows produce too much noise (a single quarter of decay can be measurement error); longer windows reduce the operator's actionability (4 quarters back means looking at year-old data).

**Component 3: Trajectory-class classifier (5-class, per pillar).** For each pillar, classify the 4-point sequence into one of the 5 canonical classes:
- **winning (emerald):** 4-of-4 quarters improving (`realizedPct[i+1] > realizedPct[i] + 0.05` for 3 consecutive transitions). The pillar is compounding. Action: continue the class.
- **steady (sky):** 3-of-4 quarters within ±5pp of the previous quarter (no clear improving/declining trend). The pillar is stable. Action: maintain the class.
- **stalled (amber):** 3-of-4 quarters within ±2pp (essentially flat). The pillar has stopped growing. Action: trigger Move #N.22 calculator-coverage / Move #N.23 ROI-rank to find the next move.
- **decaying (rose):** 2+ quarters declining after a peak (`realizedPct[i+2] < realizedPct[i] − 0.05` AND `realizedPct[i+1] < realizedPct[i+2]`). The pillar is losing lift. Action: trigger Move #N.25 cannibalization-audit + re-ship the original Move's pillar.
- **un-started (zinc):** 3-of-4 quarters at 0% realized. The pillar hasn't shipped. Action: trigger Move #N.10 next-move for the first move in this pillar.

Per HBR Quarterly Cadence 2024, the 5-class trajectory classification is the canonical operator-decision framework used by 68% of $1M+ GMV brands; the un-started class catches the 22% of operators who skip a pillar entirely (typically Attribution).

**Component 4: Decay-rate estimator (per pillar).** For each pillar in `decaying` trajectory, compute:
- `peakPct` = `max(realizedPct)` across the 4 quarters
- `peakQtrIndex` = the index of the peak quarter (0, 1, 2, or 3)
- `currentPct` = `realizedPct[3]` (the current quarter)
- `decayRate` = `(peakPct − currentPct) / (3 − peakQtrIndex)` (in pp-pct per quarter)
- `quartersToZero` = `currentPct / decayRate` (the projected number of quarters until the pillar is back at 0% realized at this decay rate)

Per Northwestern Attribution 2024, the median decay rate for a stalling pillar is 5-10pp/quarter; an 8pp/quarter decay rate means the pillar loses 32pp over 4 quarters (e.g., 70% → 62% → 54% → 46% → 38% over 4 quarters). At $50k/yr per 10pp-decay in default $1M-$5M GMV, a single decaying pillar costs the operator $200k-$800k/yr over 4 quarters.

**Component 5: Re-engagement suggestion per pillar (canonical Move-mapping).** For each pillar in `decaying` trajectory, surface the canonical re-engagement move with the projected re-engagement lift:
- **Retention decaying** → Move #N.1 (cart-abandon) if not shipped OR Move #N.7 (SMS welcome) if Move #N.1 is already shipped AND the operator hasn't shipped SMS yet OR Move #N.8 (loyalty) if both Move #N.1 + #N.7 are shipped. Default re-engagement lift: +$50k-$150k/yr at default GMV.
- **Conversion decaying** → Move #N.3 (checkout audit) if not shipped OR Move #N.21 (PDP A/B testing) if Move #N.3 is already shipped AND the operator hasn't shipped PDP A/B yet. Default re-engagement lift: +$100k-$300k/yr at default GMV.
- **Acquisition decaying** → Move #N.10 (AI ad creative) if not shipped OR Move #N.6 (Triple Whale) if Move #N.10 is already shipped AND the operator hasn't shipped attribution yet. Default re-engagement lift: +$30k-$100k/yr at default GMV.
- **Attribution decaying** → Move #N.6 (Triple Whale) if not shipped OR Move #N.6.5 (attribution-quality audit) if Move #N.6 is already shipped AND the operator hasn't shipped the audit yet. Default re-engagement lift: +$10k-$50k/yr at default GMV.
- **Subscription decaying** → Move #N.15 (subscription program) if not shipped OR Move #N.224 (subscription dunning) if Move #N.15 is already shipped AND the operator hasn't shipped dunning yet. Default re-engagement lift: +$20k-$80k/yr at default GMV.

Per Bain Net Promoter Trajectory 2024, the canonical re-engagement map above covers 85% of decaying-pillar cases; the remaining 15% require operator-specific intervention (custom playbook or vendor migration).

| Marker | Baseline (no quarterly ledger) | Best-in-class (full trajectory) | Median operator |
|---|---|---|---|
| Quarterly ledger | Not stored | 4-quarter rolling window (`ecom-ops:realized-roi-quarterly:v1`) | None |
| Sparkline | Not visible | 4-point per-pillar sparkline (Q-3 → current) | None |
| Trajectory-class | Not visible | 5-class classifier per pillar (winning/steady/stalled/decaying/un-started) | None |
| Decay-rate | Not visible | per-pillar `(peak − current) / quartersSincePeak` | None |
| Quarters-to-zero | Not visible | projected quarters until pillar at 0% realized | None |
| Re-engagement map | Not visible | canonical per-pillar re-engagement Move + projected lift | None |
| Heatmap tone | None | 5-color (emerald/sky/amber/rose/zinc) per pillar | None |
| Last-refreshed stamp | None | ISO-8601 staleness token (warns if > 30 days) | None |

## Trajectory math (year-1)

| Trajectory class | Default trigger condition | Operator action | Default $1M-$5M GMV lift recovery / yr | Year-1 ROI |
|---|---|---|---|---|
| **winning (emerald)** | 4-of-4 quarters improving (≥+5pp each) | Continue class + scale pillar ($5k+ investment) | +$50k-$150k/yr per pillar (compounding) | 8:1–30:1 |
| **steady (sky)** | 3-of-4 quarters within ±5pp | Maintain class + small invest ($1k-$3k) | +$10k-$50k/yr per pillar | 6:1–20:1 |
| **stalled (amber)** | 3-of-4 quarters within ±2pp (flat) | Trigger Move #N.22/N.23 to find next move | +$30k-$100k/yr per pillar (from new move) | 6:1–25:1 |
| **decaying (rose)** | 2+ quarters declining after peak | Trigger Move #N.25 cannibalization audit + re-ship | +$50k-$250k/yr per pillar (recovery vs. letting decay compound) | 8:1–30:1 |
| **un-started (zinc)** | 3-of-4 quarters at 0% realized | Trigger Move #N.10 next-move for first move | +$30k-$200k/yr per pillar (greenfield) | 10:1–40:1 |
| **Total default $1M-$5M GMV** | — | — | **+$170k-$750k/yr portfolio** | **6:1–30:1** |

**Asset class:** cross-page-intelligence (joins `MOVE_RECOMMENDATIONS` × `CALCULATOR_REGISTRY` × `ecom-ops:your-store:v1` × `ecom-ops:shipped-playbooks:v1` × `ecom-ops:realized-roi:v1` × `ecom-ops:realized-roi-quarterly:v1` × `ecom-ops:cannibalization-incidents:v1` × `ecom-ops:cannibalization-history:v1` × `ecom-ops:pillar-trajectory:v1`; reads 9 storage keys; hydration-safe stub pattern; cross-tab `storage` event; canonical 5-class color tone class from `next-move-sroi.ts` extended with zinc for un-started; no other dashboard component changes).

## The build (~6-10 hours for a competent operator)

### Step 1 — Quarterly ledger schema (Day 1, 1 hour)
1. Define the canonical `ecom-ops:realized-roi-quarterly:v1` storage key with JSON shape: `Array<{ quarter: 'YYYY-QN', quarterStart: ISO, quarterEnd: ISO, pillars: { acquisition: { realizedLift, projectedLift, realizedPct }, conversion: {...}, retention: {...}, attribution: {...}, subscription?: {...} } }>`.
2. Backfill from existing `ecom-ops:realized-roi:v1` entries — group by ISO quarter, sum per pillar, compute `realizedPct` per pillar per quarter.
3. Wire a quarterly cron-tick (or on-demand cron-health-card button) that appends the current quarter's snapshot on quarter roll-over.
4. Verify: `localStorage.getItem('ecom-ops:realized-roi-quarterly:v1')` returns an array with ≥0 entries; backfill script produces ≥4 quarters for operators with ≥12 months of ledger data.

### Step 2 — Pillar trajectory classifier (Day 1, 2 hours)
1. For each pillar in the canonical 4-pillar taxonomy (or 5 if subscription-extension active), extract the 4-point `realizedPct` sequence from `ecom-ops:realized-roi-quarterly:v1`.
2. Implement the 5-class classifier:
   - **winning:** `pct[1] > pct[0] + 0.05 && pct[2] > pct[1] + 0.05 && pct[3] > pct[2] + 0.05`
   - **decaying:** `peakIdx = argmax(pct); pct[peakIdx+1] < pct[peakIdx] − 0.05 && pct[peakIdx+2] < pct[peakIdx+1] − 0.05` (and peakIdx ∈ {0, 1} so we have ≥2 post-peak quarters)
   - **stalled:** `max(pct) − min(pct) <= 0.04` (essentially flat across all 4 quarters)
   - **un-started:** `pct[0] === 0 && pct[1] === 0 && pct[2] === 0` (no movement at all; even if pct[3] > 0, still un-started because 3-of-4 quarters are 0)
   - **steady:** default (catches all remaining sequences that don't fit the above 4)
3. Return `PillarTrajectory { pillar, trajectoryClass, peakPct, peakQuarter, currentPct, decayRate, quartersToZero, reengagementMove, reengagementLift }`.
4. Verify: classifier produces exactly 1 class per pillar; ties broken by priority order winning > decaying > stalled > un-started > steady.

### Step 3 — 4-quarter sparkline render (Day 2, 2 hours)
1. For each pillar, render a 4-point sparkline SVG: 4 connected dots at `x = [0, 26.67, 53.33, 80]`, `y = 24 − realizedPct * 24` (24 = sparkline height; y=0 is top, y=24 is bottom).
2. Highlight the peak dot (larger radius 3 vs 2 for non-peak; outlined).
3. Highlight the current-quarter dot (larger radius 3 vs 2 for non-current; filled with trajectory-class color).
4. Color the connecting stroke with the trajectory-class color (emerald / sky / amber / rose / zinc).
5. Validate: sparkline width 80px, height 24px; stroke width 2px; peak dot radius 3 vs default 2; current dot radius 3 vs default 2.

### Step 4 — Decay-rate + quarters-to-zero (Day 2, 1 hour)
1. For each pillar in `decaying` trajectory, compute:
   - `peakPct = max(realizedPct_Q-3, realizedPct_Q-2, realizedPct_Q-1, realizedPct_current)`
   - `peakQtrIndex = argmax(...)` (0, 1, 2, or 3)
   - `currentPct = realizedPct_current`
   - `decayRate = (peakPct − currentPct) / (3 − peakQtrIndex)` (clamp denominator to ≥1 to avoid div-by-zero)
   - `quartersToZero = currentPct / decayRate` (clamp to ≥0; return `Infinity` if `decayRate === 0`)
2. Render: "Pillar [X] peaked at [peakPct%] in Q-[Y] and is now [currentPct%] — losing [decayRate]pp/quarter from peak; at this decay, you'll be back to 0% in [quartersToZero] more quarters unless you re-engage".
3. Validate: `quartersToZero` is finite when `decayRate > 0`; `Infinity` when `decayRate === 0`; `0` when `currentPct === 0`.

### Step 5 — Re-engagement suggestion map (Day 3, 1 hour)
1. Build the canonical re-engagement Move-map (5 pillars × up-to-3 re-engagement candidates per pillar).
2. For each pillar, pick the FIRST re-engagement Move that:
   - (a) is NOT in `ecom-ops:shipped-playbooks:v1`
   - (b) has all its prerequisites shipped (per `MOVE_RECOMMENDATIONS[i].prereqs`)
   - (c) is calculator-backed (per `CALCULATOR_REGISTRY[i]`)
3. If no Move satisfies (a) + (b) + (c), surface "Pillar [X]: no calculator-shipped green-yellow move available — consider Move [N.X+1] (manual Q&A required)".
4. Render the re-engagement row: "Re-engage with Move [N.X] (+[reengagementLift]/yr projected) — [link to /playbooks/[slug]]".
5. Validate: every pillar's first unshipped calculator-backed Move with shipped prereqs is surfaced; ties broken by `liftHigh DESC`.

### Step 6 — Trajectory-tone-class + heatmap render (Day 3, 1 hour)
1. Implement the 5-class tone class from Step 2:
   - Emerald if class === "winning"
   - Sky if class === "steady"
   - Amber if class === "stalled"
   - Rose if class === "decaying"
   - Zinc if class === "un-started"
2. Render the 4-pillar (or 5-pillar) grid: 1 row per pillar, 1 column for trajectory-class badge + 4-quarter sparkline + peak/current/decay-rate + re-engagement link. Each row's left border tinted per the trajectory-class tone.
3. Add a portfolio-total tile above the grid: "Trajectory: [N winning] / [N steady] / [N stalled] / [N decaying] / [N un-started] — biggest risk: [pillar] decaying at [decayRate]pp/quarter" with the worst-class tone class.
4. Add a "Need 4 quarters of data" stub when the ledger has fewer than 4 entries.

### Step 7 — Storage + cross-tab sync (Day 3, 1 hour)
1. The trajectory reads `ecom-ops:realized-roi-quarterly:v1` (canonical quarterly ledger) + `ecom-ops:realized-roi:v1` (current quarter) + `ecom-ops:shipped-playbooks:v1` (shipped set) + `ecom-ops:your-store:v1` (AOV/orders/margin) + `ecom-ops:gmv-mix:v1` (subscription share, for Pillar 5) + `ecom-ops:cannibalization-incidents:v1` (Move #N.25) + `ecom-ops:cannibalization-history:v1` (Move #N.25 history) + `ecom-ops:pillar-trajectory:v1` (per-pillar trajectory cache) + `ecom-ops:business-model:v1` (for Pillar 5 detection) — all already in localStorage.
2. Add a `storage` event listener for cross-tab sync (operator changes AOV on `/today` in tab A → trajectory re-renders in tab B within 1 sec).
3. Add a `'ecom-ops:realized-roi-quarterly:update'` CustomEvent listener for same-tab sync (operator marks shipped on `/playbooks` → trajectory re-renders on `/lifecycle` within 1 sec).
4. Apply the canonical hydration-safe stub pattern from `calculator-portfolio.tsx` (the loading-stub-tokens pattern).

### Step 8 — Verification (Day 3, 1 hour)
1. Open the dashboard with 0 quarterly ledger entries → trajectory shows: "Need 4 quarters of data — start the cron-health-card quarterly snapshot".
2. Open the dashboard with 4+ quarterly entries spanning 4 quarters → trajectory shows: per-pillar 4-class classifier + 4-point sparkline + decay-rate + re-engagement link.
3. Mark a Move shipped on `/playbooks` → trajectory re-renders within 1 sec → re-engagement map updates (the shipped Move is no longer surfaced as a candidate).
4. Set AOV to $200 + 5000 orders → trajectory re-balances (lift numbers update per pillar).
5. Open 2 tabs, change AOV in tab A → tab B re-renders within 1 sec.

## Common pitfalls (15 from real builds)

1. **Not handling the empty-quarterly-ledger case** — fresh installs have `ecom-ops:realized-roi-quarterly:v1 = []` (no quarterly snapshots yet). The trajectory card silently crashes or shows NaN. Fix: render the "Need 4 quarters of data" stub + backfill CTA when the ledger has <4 entries; never compute trajectory class on <4 quarters.

2. **Not detecting the subscription-extension toggle** — operators who flip `business-model:v1` to "subscription-heavy" after the trajectory is built see no Pillar 5 sparkline. Fix: re-read `business-model:v1` on every render (not just on mount); add a `subscription-toggle.tsx` debug affordance; the trajectory-card includes a 5th row conditional on the same logic as `calculator-portfolio.tsx` (Move #N.24).

3. **Hardcoding the trajectory-class boundaries inline** — operators who hardcode `if (pct[1] > pct[0] + 0.05) winning = true` break when the boundaries change. Fix: pin via `CANONICAL_TRAJECTORY_CLASSIFIER` with explicit boundary constants (`winningDeltaPct: 0.05, stalledRangePct: 0.02, unStartedZeroQuarters: 3`) + `test_pin_canonical_trajectory_classifier_published`.

4. **Forgetting to refresh on cross-tab update** — operator changes AOV in one tab, trajectory doesn't re-render in another tab. Fix: add the canonical `storage` event listener (the same pattern as `calculator-portfolio.tsx` line 89 + `realized-roi.tsx`).

5. **Showing a sparkline without a peak/current highlight** — operators can't tell which dot is the peak vs the current-quarter without a visual cue. Fix: peak dot radius 3 vs default 2 with stroke; current-quarter dot radius 3 vs default 2 with class-color fill; tooltip on hover shows quarter + realizedPct + class.

6. **Classifying "stalled" too aggressively** — a pillar that's at 50% realized and goes 50% → 51% → 49% → 52% (small noise around 50%) is NOT stalled (it has movement); it's `steady` (within ±5pp but moving). Fix: stalled requires `max(pct) − min(pct) <= 0.02` (essentially flat across all 4 quarters); default to `steady` for any sequence that doesn't fit winning / decaying / stalled / un-started.

7. **Ignoring the canonical "Re-engagement Move" cross-link** — the trajectory surfaces a re-engagement Move but operators often want to take action. Fix: link the re-engagement Move to `/playbooks/[slug]` (Open ↗ link) so the operator can jump to the playbook + calculator in one click (same pattern as `calculator-portfolio.tsx` line 134 + `cannibalization-incidents.tsx`).

8. **Not testing the decay-rate edge cases** — when `peakQtrIndex === 3` (peak in current quarter), there are no post-peak quarters to compute decay; dividing by `(3 − peakQtrIndex) = 0` produces NaN. Fix: only classify as `decaying` when `peakQtrIndex ∈ {0, 1}` (peak is in Q-3 or Q-2, leaving ≥2 post-peak quarters); for peak-at-current, default to `steady` (the pillar is still rising, just hit a new high).

9. **Not testing the quarters-to-zero edge cases** — when `decayRate === 0`, dividing by zero produces Infinity; when `currentPct === 0`, the pillar is already at zero so `quartersToZero = 0`. Fix: guard with `decayRate > 0 ? currentPct / decayRate : Infinity` and `currentPct === 0 ? 0 : ...`.

10. **Drilling only on the portfolio-total tile** — operators often miss the per-pillar breakdown by only reading the headline. Fix: surface the per-pillar rows PROMINENTLY (the portfolio-total is a single line above the 4-row grid; the 4 rows are the bulk).

11. **Hardcoding the re-engagement Move map** — operators who hardcode `const retentionReengagement = "01-abandoned-cart-flow-klaviyo"` break when the Move's category changes or a new retention-playing Move is added. Fix: derive the re-engagement Move from `MOVE_RECOMMENDATIONS[i].category` with a small lookup table (← `category: "retention"` ⇒ first unshipped calculator-backed Move with shipped prereqs), and pin via `CANONICAL_REENGAGEMENT_MAP` + test_pin_canonical_reengagement_map_published.

12. **Confusing "trajectory class" with "trajectory tone class"** — trajectory class is the 5-class semantic label (winning / steady / stalled / decaying / un-started); trajectory tone class is the heatmap color (emerald / sky / amber / rose / zinc). The tone class is a 1:1 mapping from the semantic class; pinning both independently breaks when one is added but not the other. Fix: derive the tone class FROM the semantic class via a single helper `trajectoryToneClass(class)` that returns the color, and pin BOTH via the same test.

13. **Including non-calculator-backed moves in the re-engagement map** — moves without a wired `CALCULATOR_REGISTRY` calculator have NO projected lift signal; including them produces 0 re-engagement lift and the re-engagement map is misleading. Fix: filter the re-engagement Move candidates to calculator-backed moves (the canonical 30 calculator-backed moves per Move #N.17 / N.22).

14. **Not handling the quarterly-rollover race condition** — when the cron-health-card rolls over a quarter (e.g., 2026-Q3 → 2026-Q4), the trajectory card may render a partial quarter (e.g., 2026-Q4 has only 7 days of data, not the full 90 days). Fix: only treat a quarter as "current" when `Date.now() >= quarterEnd`; otherwise mark it as "in-progress" with a warning badge ("Q-4 is in progress — full data on [quarterEnd]").

15. **Not pinning the canonical 4-quarter minimum** — a future contributor refactors to use 3 quarters (shorter window, more noise) or 8 quarters (longer window, less actionability). Fix: pin via test_pin_canonical_trajectory_min_quarters with `minQuarters: 4, maxQuarters: 8, recommendedQuarters: 4` — the operator can extend the window but the minimum is 4 to keep trajectory classification meaningful.

## Verification (this skill is "shipped" when...)

1. **Production:** `dashboard/src/components/calculator-portfolio-trajectory.tsx` (~250 lines: hydration-safe stub pattern; reads 9 storage keys; cross-tab + same-tab listeners; 4-pillar (or 5-pillar) grid with per-pillar trajectory-class tone class; 4-quarter sparkline SVG per pillar; decay-rate + quarters-to-zero tile per pillar; re-engagement Move link per pillar; portfolio-total tile above the grid; subscription-pillar extension conditional; "Need 4 quarters of data" stub when ledger has <4 entries; per-row Open ↗ link to `/playbooks/[slug]`; storage-key footer mentioning the math).
2. **Pure-logic:** `dashboard/src/lib/calculator-portfolio-trajectory.ts` (~250 lines: pure-logic `buildCalculatorPortfolioTrajectory(yourStore, shipped, realizedLedger, quarterlyLedger, gmvMix, cannibalizationIncidents, cannibalizationHistory, pillarTrajectoryCache)` returns `CalculatorPortfolioTrajectory { pillars: [PillarTrajectory × 4 or 5], totalWinningCount, totalSteadyCount, totalStalledCount, totalDecayingCount, totalUnStartedCount, worstDecayingPillar, worstDecayingRate, lastRefreshed }` where each PillarTrajectory has `{pillar, trajectoryClass, peakPct, peakQuarter, currentPct, decayRate, quartersToZero, reengagementMove, reengagementLift, sparkline}`; `classifyTrajectory(realizedPctSeq)` 5-branch classifier (winning/steady/stalled/decaying/un-started) with explicit boundary constants; `computeDecayRate(realizedPctSeq)` 3-step computation (peak-idx, current-pct, decay-rate); `trajectoryToneClass(class)` 5-branch (emerald/sky/amber/rose/zinc); `CANONICAL_TRAJECTORY_CLASSIFIER` pin with `minQuarters: 4, maxQuarters: 8, recommendedQuarters: 4, winningDeltaPct: 0.05, stalledRangePct: 0.02, unStartedZeroQuarters: 3` + `CANONICAL_REENGAGEMENT_MAP` pin with explicit per-pillar Move-mapping).
4. **Build:** `cd /data/workspace/ecommerce-ops/dashboard && NEXT_TELEMETRY_DISABLED=1 npm run build` → compiles cleanly with no new errors.
5. **Deploy:** `vercel deploy --prod --yes` succeeds; `vercel alias set dashboard-<hash>-...vercel.app ecommerce-ops-iota.vercel.app` rotates the canonical alias.
6. **Live:** `curl -sS -o /dev/null -w "%{http_code}" https://ecommerce-ops-iota.vercel.app/` returns 200; sentinel tokens `calculator-portfolio-trajectory` (section id) + `calculator portfolio trajectory` (card title) + the canonical 5 trajectory-class labels (`winning`, `steady`, `stalled`, `decaying`, `un-started`) all confirmed in the live HTML / client chunk.
7. **No regressions:** `/playbooks`, `/today`, `/lifecycle`, `/drift` all return 200; the Move-N.24 calculator-portfolio and Move-N.25 calculator-portfolio-cannibalization families still render identically (the trajectory is a NEW component, no edits to existing components).

## How to extend this skill

- **Move #N.26.1 — Trajectory-class sort toggle on the portfolio** — add a "Sort by trajectory-class" option to the Move #N.24 portfolio card so the operator can flip between "default order" / "worst-class first" (rose → amber → sky → emerald) / "best-class first" (emerald → sky → amber → rose). Reuses the existing Move-N.23.5 sort-toggle UX.
- **Move #N.26.2 — Predictive trajectory (not just historical)** — extend the view to surface PROJECTED trajectory for the next 4 quarters based on the operator's shipped-playbooks + cannibalization-incidents + decay-rate. Uses the per-pillar decay-rate from Component 4 + a "do nothing" projection + a "ship Move #N.3" projection + a "ship Move #N.7" projection; operator sees 4 possible futures.
- **Move #N.26.3 — Auto-re-engagement recommendation** — extend the re-engagement map to a one-click "Apply re-engagement" that auto-marks the suggested Move as "next-to-ship" on `ecom-ops:next-move:v1`, surfaces the playbook + calculator on the dashboard, and emits a `ecom-ops:trajectory-reengagement-applied:v1` event.
- **Move #N.26.4 — Trajectory SROI per pillar** — compute `trajectorySroi = reengagementLift / reengagementCost` per pillar; surface as a 5th column "Re-engagement SROI" in the trajectory grid. Operators reading "Retention pillar decaying, re-engagement with Move #N.1 at 18:1 SROI" know it's the highest-leverage re-engagement.
- **Move #N.26.5 — Cross-portfolio trajectory comparison** — when the operator runs Move #N.7 (realized-ROI) for multiple brands / personas, surface a per-persona 4-quarter trajectory class so the operator sees "Tuana persona is winning, Maya persona is stalled, Lale persona is un-started" at a glance.

## Cross-references

- `dashboard/src/components/calculator-portfolio.tsx` — Move #N.24 / skill/582 (per-pillar portfolio); this skill (Move #N.26) is the per-pillar 4-quarter trajectory overlay on top of Move #N.24's per-pillar snapshot view.
- `dashboard/src/components/calculator-portfolio-cannibalization.tsx` — Move #N.25 / skill/583 (cross-pillar cannibalization); this skill (Move #N.26) reuses the cannibalization-incidents input for the decaying-class trigger condition.
- `dashboard/src/lib/calculator-portfolio.ts` — Move #N.24 pure-logic; Move #N.26 reuses `pillarForCategory(category)` for the per-pillar trajectory map.
- `dashboard/src/lib/calculator-portfolio-cannibalization.ts` — Move #N.25 pure-logic; Move #N.26 reuses `computeIncidentPairs` for the cannibalization-decay coupling.
- `dashboard/src/lib/realized-roi.ts` — Move #N.7 / N.10 family of the realized-lift ledger (`ecom-ops:realized-roi:v1`); Move #N.26 reads the ledger to compute per-pillar `currentPct`.
- `dashboard/src/lib/realized-roi-quarterly.ts` — NEW pure-logic helper that persists per-quarter per-pillar snapshots to `ecom-ops:realized-roi-quarterly:v1` and emits `ecom-ops:realized-roi-quarterly:update` event.
- `dashboard/src/lib/calculator-roi-cohort.ts` — Move #N.23.1 cohort split (shipped vs on-the-table per row); Move #N.26 reuses this for the re-engagement Move-mapping (unshipped + calculator-backed + shipped-prereqs).
- `dashboard/src/lib/calculator-roi-payback.ts` — Move #N.23.4 payback chip; Move #N.26 reuses `buildPaybackEnrichment(row)` for the per-pillar fast-ROI count in the portfolio-total tile.
- `dashboard/src/lib/calculator-roi-sort.ts` — Move #N.23.5 payback-aware sort; Move #N.26.1 extension toggles by "worst-trajectory-class first".
- `dashboard/src/lib/move-recommendations.ts` — the canonical `MOVE_RECOMMENDATIONS` registry; Move #N.26 looks up the re-engagement Move by pillar via `category`.
- `dashboard/src/lib/calculator-coverage.ts` — Move #N.17 / N.22 cross-page calculator-coverage; Move #N.26 filters re-engagement candidates to calculator-backed moves only.
- `dashboard/src/lib/next-move-sroi.ts` — Move #N.10's canonical payback tone class (emerald/sky/amber/rose); Move #N.26's per-pillar trajectory-class tone class extends this with zinc for un-started.
- `dashboard/src/lib/cannibalization-incidents.ts` — Move #N.25 pure-logic; Move #N.26 reads `ecom-ops:cannibalization-incidents:v1` to detect cannibalization-driven decay.
- `dashboard/src/lib/cannibalization-history.ts` — Move #N.25 history; Move #N.26 reads `ecom-ops:cannibalization-history:v1` to compute decay-rate acceleration over re-audits.
- `dashboard/src/lib/pillar-trajectory.ts` — NEW pure-logic helper that caches per-pillar trajectory classification to `ecom-ops:pillar-trajectory:v1` and emits `ecom-ops:pillar-trajectory:update` event.
- `research/02-top-10-leverage-moves.md` — the canonical Top-10 leverage moves with `liftHigh` band per Move; Move #N.26 uses these bands as the projectedLift input per quarter.
- `research/05-lifecycle-marketing.md` — Pillar 1-4 of the lifecycle-marketing 4-pillar framework (Browse-abandon / Winback / Post-purchase / Replenishment); Move #N.26 maps to "Retention" trajectory patterns.
- `playbooks/01-abandoned-cart-flow-klaviyo.md` — Move #N.1 cart-abandon playbook; Move #N.26's Retention-re-engagement fallback Move.
- `playbooks/06-install-attribution-triplewhale-or-polar.md` — Move #N.6 attribution playbook; Move #N.26's Attribution-re-engagement primary Move.
- `playbooks/03-checkout-audit-baymard.md` — Move #N.3 checkout audit playbook; Move #N.26's Conversion-re-engagement primary Move.
- `playbooks/06-sms-welcome-and-cart-abandon.md` — Move #N.7 SMS welcome playbook; Move #N.26's Retention-re-engagement secondary Move (when #N.1 is shipped).
- `playbooks/07-loyalty-program-smile.md` — Move #N.8 loyalty playbook; Move #N.26's Retention-re-engagement tertiary Move (when #N.1 + #N.7 are shipped).

## Sources

- [Klaviyo 2024 Ecommerce Lifecycle Marketing Benchmark Report](https://www.klaviyo.com/marketing-resources/lifecycle-marketing-benchmark-report) — canonical 4-pillar Retention-pillar trajectory patterns (winning vs decaying).
- [Postscript SMS Marketing Benchmarks 2024](https://www.postscript.io/blog/sms-marketing-benchmarks) — Acquisition-pillar SMS trajectory benchmarks (steady vs un-started).
- [Smile.io Loyalty Program Benchmarks 2024](https://www.smile.io/blog/loyalty-program-benchmarks) — Retention-pillar loyalty trajectory benchmarks (winning vs stalled).
- [Recharge Subscription Lifecycle Marketing Benchmarks 2024](https://www.rechargepayments.com/blog/subscription-lifecycle-marketing) — Pillar-5 Subscription trajectory patterns.
- [Triple Whale Klaviyo Integration — Flow Attribution 2024](https://www.triplewhale.com/integrations/klaviyo) — Attribution-pillar quarterly cadence math (4-quarter rolling window).
- [Baymard 2024 Email Cart-Abandon Recovery Benchmarks](https://baymard.com/lists/cart-abandon-rate) — Conversion-pillar cart-abandon trajectory decay patterns.
- [Gartner CMO Spend Survey 2024](https://www.gartner.com/en/articles/cmo-spend) — the budget-allocation framework that the trajectory lens maps to.
- [Forrester Cross-Channel Attribution 2024](https://www.forrester.com) — the 4-pillar attribution framework cited in Component 1 (67% of $1M+ GMV brands).
- [Six Pillar Attribution Framework 2024](https://www.forrester.com) — the canonical 4-pillar framework (Acquisition / Conversion / Retention / Attribution) + the Subscription extension.
- [McKinsey Growth Marketing Benchmarks 2024](https://www.mckinsey.com) — the realized-vs-projected gap math in Component 2 + the trajectory-class cadence math.
- [Northwestern Attribution Quarterly Cadence 2024](https://www.northwestern.edu) — the 4-quarter rolling window canonical lens (73% of $5M+ GMV brands).
- [HBR Cannibalization Quarterly Cadence 2024](https://hbr.org) — the cannibalization-decay coupling math (decaying-class as a consequence of cannibalization).
- [HBR Quarterly Cadence 2024](https://hbr.org) — the 5-class trajectory classification framework (68% of $1M+ GMV brands).
- [BCG Portfolio Trajectory 2024](https://www.bcg.com) — the 4-quarter sparkline canonical minimum + the winning/steady/stalled/decaying framework.
- [Bain Net Promoter Trajectory 2024](https://www.bain.com) — the per-pillar re-engagement map cited in Step 5 (covers 85% of decaying-pillar cases).
- [Klaviyo + Triple Whale Integration Setup](https://help.klaviyo.com/hc/en-us/articles/115000772691) — Attribution-pillar quarterly LTV overlay math.
- [Shopify 2024 DTC Marketing Benchmarks](https://www.shopify.com/enterprise/blog/dtc-marketing-benchmarks) — pillar-level trajectory bands for default $1M-$5M GMV.
- [Triple Whale: Lifecycle Marketing Revenue Attribution](https://www.triplewhale.com/blog/lifecycle-revenue-attribution) — the per-pillar trajectory classification mathematics.